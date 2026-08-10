import type { ChatMessage, User } from "@/db/types.ts";
import { chatRepository } from "@/modules/chat/chat.repository.ts";

const DEFAULT_TURNS = 3;
const MAX_TURNS = 25;

/** Long enough to keep the sense of a message, short enough to stay cheap. */
const MAX_BODY = 900;

/**
 * A hard stop on how much is read from the table for one call, whatever the
 * knobs say — turns vary wildly in length and a room can have thousands.
 */
const FETCH_CAP = 400;

type Row = { message: ChatMessage; author: User | null };

export type ChatTurn = {
  /** 1 is the most recent turn, counting back from the end of the chat. */
  back: number;
  author: string;
  kind: "person" | "agent" | "guest";
  at: string;
  messages: string[];
};

/**
 * One turn is one speaker's uninterrupted stretch, the way a person reads a
 * thread — not one row. Six quick lines from the same person are one thing
 * they said, and counting them as six would make "the last three turns" mean
 * almost nothing.
 */
function speakerOf(row: Row) {
  const { message, author } = row;

  if (author) {
    return {
      key: `user:${author.id}`,
      author: author.displayName,
      kind: author.kind === "bot" ? ("agent" as const) : ("person" as const),
    };
  }

  return {
    key: `guest:${message.authorVisitorId ?? message.id}`,
    author: message.authorName ?? "Guest",
    kind: "guest" as const,
  };
}

const clip = (body: string) =>
  body.length > MAX_BODY ? `${body.slice(0, MAX_BODY)}…` : body;

export async function chatTurns(
  documentId: string,
  options: {
    turns?: number;
    before?: number;
    /** This run's own messages: already in the model's context, so noise here. */
    excludeRunId?: string;
  } = {}
) {
  const want = Math.min(
    MAX_TURNS,
    Math.max(1, Math.trunc(options.turns ?? DEFAULT_TURNS))
  );
  const skip = Math.max(0, Math.trunc(options.before ?? 0));
  const needed = want + skip;

  // Turns have no fixed size, so the row budget is a guess at how many rows
  // those turns take. Reading one row past it is what tells us there is more.
  const budget = Math.min(FETCH_CAP, needed * 10 + 10);
  const rows = await chatRepository.recentForDocument(documentId, budget + 1);

  const scanned = rows.slice(0, budget);
  const reachedEnd = rows.length <= budget;

  const grouped: (ChatTurn & { key: string })[] = [];
  let cutShort = false;

  for (const row of scanned) {
    if (options.excludeRunId && row.message.runId === options.excludeRunId) {
      continue;
    }

    const speaker = speakerOf(row);
    const open = grouped.at(-1);

    if (open && open.key === speaker.key) {
      open.messages.push(clip(row.message.body));
      open.at = row.message.createdAt.toISOString();
      continue;
    }

    // One turn past what was asked for proves the previous one was complete,
    // and that there is more behind it.
    if (grouped.length === needed) {
      cutShort = true;
      break;
    }

    grouped.push({
      key: speaker.key,
      back: grouped.length + 1,
      author: speaker.author,
      kind: speaker.kind,
      at: row.message.createdAt.toISOString(),
      messages: [clip(row.message.body)],
    });
  }

  const olderAvailable = cutShort || !reachedEnd;

  const turns = grouped
    .slice(skip, skip + want)
    .map(({ key: _key, ...turn }) => ({
      ...turn,
      // Rows arrive newest first; within a turn the words only make sense in
      // the order they were said.
      messages: [...turn.messages].reverse(),
    }));

  return {
    turns,
    returned: turns.length,
    skipped: skip,
    olderAvailable,
    note: turns.length === 0
      ? skip > 0
        ? "Nothing that far back — the conversation is shorter than that."
        : "Nobody has said anything in this document's chat yet."
      : olderAvailable
        ? `Older discussion exists. Call read_chat again with before=${skip + turns.length} to keep reading back, or a larger turns to take more at once.`
        : "That is the whole conversation from the beginning.",
  };
}

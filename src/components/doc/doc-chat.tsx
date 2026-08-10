"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { ChatEmpty } from "@/components/doc/chat-empty";
import { ChatView, type ChatEntry } from "@/components/doc/chat-view";
import type { ChatReaction } from "@/components/doc/message-reactions";
import type { Mentionable } from "@/components/doc/mention-menu";
import { useDocumentEvents } from "@/lib/collab";
import {
  keys,
  useCancelRun,
  useChat,
  useChatAccess,
  useConnections,
  useDocument,
  useRuns,
  useSendMessage,
  useWorkspace,
} from "@/lib/queries";

const firstName = (displayName: string) =>
  displayName.trim().split(/\s+/)[0]!.toLowerCase();

export function DocChat({ documentId }: { documentId: string }) {
  const [reactions, setReactions] = useState<Record<string, ChatReaction[]>>(
    {}
  );

  const access = useChatAccess(documentId);
  const document = useDocument(documentId);
  const workspaceId = document.data?.document.workspaceId;
  const workspace = useWorkspace(workspaceId ?? "");
  const connections = useConnections();

  const level = access.data?.chat ?? "none";
  const viewerId = access.data?.viewerId ?? null;

  const runs = useRuns(documentId);
  const chat = useChat(
    documentId,
    access.data !== undefined && level !== "none"
  );

  const client = useQueryClient();

  // The server tells us what changed over the document socket, so a teammate's
  // message or an agent's reply lands immediately without polling for it.
  const onEvent = useCallback(
    (event: string) => {
      if (event === "chat") {
        void client.invalidateQueries({ queryKey: keys.chat(documentId) });
      }

      if (event === "runs") {
        void client.invalidateQueries({ queryKey: keys.runs(documentId) });
      }
    },
    [client, documentId]
  );

  useDocumentEvents(documentId, level !== "none", onEvent);
  const send = useSendMessage(documentId);
  const cancel = useCancelRun(documentId);

  const members = workspace.data?.members ?? [];

  const mentionables: Mentionable[] = members
    .map((row) => ({
      id: row.user.id,
      name: firstName(row.user.displayName),
      displayName: row.user.displayName,
      avatarSeed: row.user.avatarSeed,
      kind: row.user.kind === "bot" ? ("agent" as const) : ("human" as const),
      model: row.user.model,
      provider: row.user.provider,
      disabledReason:
        row.user.kind === "bot" && row.role === "viewer"
          ? "Read-only in this workspace"
          : undefined,
    }))
    .sort((a, b) => (a.kind === b.kind ? 0 : a.kind === "agent" ? -1 : 1));

  const nameFor = (userId: string) =>
    members.find((row) => row.user.id === userId)?.user.displayName ?? "someone";

  const seedFor = (userId: string) =>
    members.find((row) => row.user.id === userId)?.user.avatarSeed ?? userId;

  const modelFor = (userId: string) =>
    members.find((row) => row.user.id === userId)?.user.model ?? null;

  // An agent has one face across the product, and the face is decided by what
  // it runs on — so a run card must carry the provider the same as a message.
  const providerFor = (userId: string) =>
    members.find((row) => row.user.id === userId)?.user.provider ?? null;

  const waitingOn =
    connections.data?.connections.find(
      (connection) => connection.revokedAt === null
    )?.label ?? null;

  const messages: ChatEntry[] = (chat.data?.messages ?? []).map((message) => ({
    id: message.id,
    body: message.body,
    createdAt: message.createdAt,
    isYou: viewerId !== null && message.author.id === viewerId,
    author: {
      id: message.author.id,
      displayName: message.author.displayName,
      avatarSeed: message.author.avatarSeed,
      kind: message.author.isGuest ? "guest" : message.author.kind,
      model: message.author.model,
      provider: message.author.provider,
    },
    reactions: reactions[message.id],
  }));

  // A run is shown where its triggering message sits, so the card reads as the
  // consequence of the mention rather than drifting to the end of the thread.
  const entries: ChatEntry[] = [];

  for (const message of messages) {
    entries.push(message);

    for (const run of runs.data?.runs ?? []) {
      if (run.triggerMessageId !== message.id) continue;

      entries.push({
        id: `run_${run.id}`,
        body: "",
        createdAt: run.createdAt,
        author: {
          id: run.agentId,
          displayName: nameFor(run.agentId),
          avatarSeed: seedFor(run.agentId),
          kind: "bot",
          provider: providerFor(run.agentId),
        },
        run: {
          id: run.id,
          status:
            run.status === "proposed" ||
            run.status === "accepted" ||
            run.status === "discarded"
              ? "running"
              : run.status,
          prompt: run.prompt,
          agentName: nameFor(run.agentId),
          avatarSeed: seedFor(run.agentId),
          model: modelFor(run.agentId),
          provider: providerFor(run.agentId),
          invokedBy: nameFor(run.invokedBy),
          isYours: run.invokedBy === viewerId,
          waitingOn,
          startedAt: run.createdAt,
          summary: run.summary,
          error: run.error,
        },
      });
    }
  }

  function toggleReaction(messageId: string, emoji: string) {
    setReactions((previous) => {
      const current = previous[messageId] ?? [];
      const existing = current.find((r) => r.emoji === emoji);

      if (!existing) {
        return {
          ...previous,
          [messageId]: [
            ...current,
            { emoji, count: 1, reactedByMe: true, names: ["You"] },
          ],
        };
      }

      return {
        ...previous,
        [messageId]: current
          .map((r) =>
            r.emoji === emoji
              ? {
                  ...r,
                  count: r.count + (r.reactedByMe ? -1 : 1),
                  reactedByMe: !r.reactedByMe,
                  names: r.reactedByMe
                    ? r.names.filter((name) => name !== "You")
                    : [...r.names, "You"],
                }
              : r
          )
          .filter((r) => r.count > 0),
      };
    });
  }

  if (!access.isPending && level === "none") {
    return (
      <div className="grid min-h-0 flex-1 place-items-center">
        <ChatEmpty variant="none" />
      </div>
    );
  }

  return (
    <ChatView
      messages={entries}
      loading={chat.isPending || access.isPending}
      sending={send.isPending}
      disabled={level !== "write"}
      placeholder={
        level === "write"
          ? "Message the room… use @ to bring in an agent"
          : "You can read this thread"
      }
      mentionables={level === "write" ? mentionables : []}
      onSend={(body) => send.mutate(body)}
      onToggleReaction={level === "write" ? toggleReaction : undefined}
      onStopRun={level === "write" ? (runId) => cancel.mutate(runId) : undefined}
      stoppingRun={cancel.isPending}
    />
  );
}

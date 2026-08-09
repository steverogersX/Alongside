"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ChatSkeleton } from "@/components/skeletons";
import { personAvatar } from "@/lib/avatars";
import { cn } from "@/lib/utils";

export type ChatAuthor = {
  id: string;
  displayName: string;
  avatarSeed: string;
  kind: "human" | "bot" | "guest";
  model?: string | null;
};

export type ChatEntry = {
  id: string;
  body: string;
  createdAt: string;
  author: ChatAuthor;
  isYou?: boolean;
};

/** Consecutive messages from one person inside this window read as one turn. */
const GROUP_WINDOW_MS = 5 * 60_000;

const time = (iso: string) =>
  new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

export function ChatView({
  messages,
  loading = false,
  sending = false,
  disabled = false,
  placeholder = "Message the room…",
  onSend,
}: {
  messages: ChatEntry[];
  loading?: boolean;
  sending?: boolean;
  disabled?: boolean;
  placeholder?: string;
  onSend: (body: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Anchored to the bottom so a short thread sits above the composer
            instead of floating in a tall empty column. */}
        <div className="flex min-h-full flex-col justify-end px-3 py-3">
          {loading && <ChatSkeleton />}

          {!loading && messages.length === 0 && (
            <p className="px-1 py-6 text-[12.5px] leading-relaxed text-muted-foreground">
              No messages yet. Everyone in this document sees this thread,
              agents included.
            </p>
          )}

          <ol className="flex flex-col">
            {messages.map((message, index) => {
              const previous = messages[index - 1];
              const grouped =
                previous !== undefined &&
                previous.author.id === message.author.id &&
                new Date(message.createdAt).getTime() -
                  new Date(previous.createdAt).getTime() <
                  GROUP_WINDOW_MS;

              const isAgent = message.author.kind === "bot";
              const isGuest = message.author.kind === "guest";

              return (
                <li
                  key={message.id}
                  className={cn(
                    "group grid grid-cols-[1.5rem_1fr] gap-x-2.5 rounded-md px-1 transition-colors hover:bg-accent/40",
                    grouped ? "pt-0.5 pb-0.5" : "mt-3 first:mt-0 pt-1 pb-0.5"
                  )}
                >
                  {grouped ? (
                    <span className="pt-[3px] text-right text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                      {time(message.createdAt).replace(/\s?[AP]M/, "")}
                    </span>
                  ) : (
                    <span
                      className={cn(
                        "mt-[1px] grid size-6 place-items-center overflow-hidden bg-secondary",
                        isAgent ? "rounded-md" : "rounded-full",
                        isGuest &&
                          "bg-muted outline-1 -outline-offset-1 outline-dashed outline-border"
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={personAvatar(
                          message.author.avatarSeed,
                          isAgent ? "agent" : "human",
                          56
                        )}
                        alt=""
                        aria-hidden
                        className="size-full select-none"
                      />
                    </span>
                  )}

                  <div className="min-w-0">
                    {!grouped && (
                      <div className="flex items-baseline gap-1.5">
                        <span
                          className={cn(
                            "truncate text-[12.5px] font-semibold",
                            isAgent && "text-agent"
                          )}
                        >
                          {message.isYou ? "You" : message.author.displayName}
                        </span>

                        {isAgent && message.author.model && (
                          <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                            {message.author.model}
                          </span>
                        )}

                        {isGuest && (
                          <span className="shrink-0 rounded bg-secondary px-1 text-[9.5px] tracking-wide text-muted-foreground uppercase">
                            guest
                          </span>
                        )}

                        <span className="shrink-0 text-[10.5px] text-muted-foreground">
                          {time(message.createdAt)}
                        </span>
                      </div>
                    )}

                    <p
                      className={cn(
                        "text-[13px] leading-[1.55] break-words whitespace-pre-wrap",
                        isAgent &&
                          "mt-0.5 border-l-2 border-agent/35 pl-2 text-foreground/90"
                      )}
                    >
                      {message.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          <div ref={endRef} />
        </div>
      </div>

      <div className="shrink-0 p-2.5">
        <form
          className="flex items-end gap-2 rounded-xl border border-border bg-card p-1.5 transition-colors focus-within:border-foreground/25"
          onSubmit={(event) => {
            event.preventDefault();
            const body = draft.trim();
            if (!body) return;
            onSend(body);
            setDraft("");
          }}
        >
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            rows={1}
            placeholder={placeholder}
            aria-label="Message"
            disabled={disabled}
            className="max-h-28 min-h-7 flex-1 resize-none bg-transparent px-1.5 py-1 text-[12.5px] leading-[1.5] outline-none placeholder:text-muted-foreground disabled:opacity-50"
          />

          <Button
            type="submit"
            size="icon-sm"
            aria-label="Send"
            disabled={disabled || sending || !draft.trim()}
            className="shrink-0"
          >
            <ArrowUp />
          </Button>
        </form>
      </div>
    </div>
  );
}

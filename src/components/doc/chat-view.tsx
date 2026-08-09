"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ChatSkeleton } from "@/components/skeletons";
import { ChatEmpty } from "@/components/doc/chat-empty";
import {
  ReactionButton,
  ReactionChips,
  type ChatReaction,
} from "@/components/doc/message-reactions";
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
  reactions?: ChatReaction[];
};

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
  onToggleReaction,
}: {
  messages: ChatEntry[];
  loading?: boolean;
  sending?: boolean;
  disabled?: boolean;
  placeholder?: string;
  onSend: (body: string) => void;
  onToggleReaction?: (messageId: string, emoji: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const canReact = onToggleReaction !== undefined && !disabled;
  const isEmpty = !loading && messages.length === 0;

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div
          className={cn(
            "flex min-h-full flex-col px-3 py-3",
            isEmpty ? "justify-center" : "justify-end"
          )}
        >
          {loading && <ChatSkeleton />}

          {isEmpty && <ChatEmpty variant={disabled ? "read" : "write"} />}

          <ol className="flex flex-col">
            {messages.map((message, index) => {
              const previous = messages[index - 1];
              const grouped =
                previous !== undefined &&
                previous.author.id === message.author.id &&
                new Date(message.createdAt).getTime() -
                  new Date(previous.createdAt).getTime() <
                  GROUP_WINDOW_MS;

              const mine = message.isYou === true;
              const isAgent = message.author.kind === "bot";
              const isGuest = message.author.kind === "guest";

              return (
                <li
                  key={message.id}
                  className={cn(
                    "group flex gap-2",
                    mine ? "flex-row-reverse" : "flex-row",
                    grouped ? "mt-0.5" : "mt-3 first:mt-0"
                  )}
                >
                  {!mine && (
                    <span className="w-6 shrink-0">
                      {!grouped && (
                        <span
                          className={cn(
                            "mt-4 grid size-6 place-items-center overflow-hidden bg-secondary",
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
                    </span>
                  )}

                  <div
                    className={cn(
                      "flex min-w-0 max-w-[85%] flex-col",
                      mine ? "items-end" : "items-start"
                    )}
                  >
                    {!grouped && (
                      <div
                        className={cn(
                          "flex items-baseline gap-1.5 px-1 pb-1",
                          mine && "flex-row-reverse"
                        )}
                      >
                        <span
                          className={cn(
                            "truncate text-[11.5px] font-medium",
                            isAgent ? "text-agent" : "text-muted-foreground"
                          )}
                        >
                          {mine ? "You" : message.author.displayName}
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

                        <span className="shrink-0 text-[10.5px] text-muted-foreground/70">
                          {time(message.createdAt)}
                        </span>
                      </div>
                    )}

                    <div
                      className={cn(
                        "flex w-full items-center gap-1",
                        mine ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      <p
                        className={cn(
                          "min-w-0 px-3 py-1.5 text-[13px] leading-[1.5] break-words whitespace-pre-wrap",
                          mine
                            ? "rounded-2xl rounded-br-md bg-primary text-primary-foreground"
                            : "rounded-2xl rounded-bl-md bg-secondary text-foreground",
                          isAgent &&
                            "bg-agent/10 text-foreground ring-1 ring-agent/20"
                        )}
                      >
                        {message.body}
                      </p>

                      {canReact && (
                        <ReactionButton
                          open={pickerFor === message.id}
                          onOpenChange={(open) =>
                            setPickerFor(open ? message.id : null)
                          }
                          side={mine ? "right" : "left"}
                          onPick={(emoji) =>
                            onToggleReaction?.(message.id, emoji)
                          }
                          className={cn(
                            "shrink-0 transition-opacity group-hover:opacity-100",
                            pickerFor === message.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      )}
                    </div>

                    <ReactionChips
                      reactions={message.reactions ?? []}
                      align={mine ? "right" : "left"}
                      disabled={!canReact}
                      onToggle={(emoji) =>
                        onToggleReaction?.(message.id, emoji)
                      }
                    />
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
            {sending ? <Spinner label="Sending" /> : <ArrowUp />}
          </Button>
        </form>
      </div>
    </div>
  );
}

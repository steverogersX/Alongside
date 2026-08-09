"use client";

import { useEffect, useRef, useState } from "react";

import { ChatSkeleton } from "@/components/skeletons";
import { AgentRunCard, type RunView } from "@/components/doc/agent-run-card";
import { ChatComposer } from "@/components/doc/chat-composer";
import { splitMentions, type Mentionable } from "@/components/doc/mention-menu";
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
  run?: RunView;
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
  onStopRun,
  stoppingRun = false,
  mentionables = [],
}: {
  messages: ChatEntry[];
  loading?: boolean;
  sending?: boolean;
  disabled?: boolean;
  placeholder?: string;
  onSend: (body: string) => void;
  onToggleReaction?: (messageId: string, emoji: string) => void;
  onStopRun?: (runId: string) => void;
  stoppingRun?: boolean;
  mentionables?: Mentionable[];
}) {
  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const names = new Set(mentionables.map((item) => item.name));

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

              if (message.run) {
                return (
                  <li key={message.id} className="mt-3 first:mt-0">
                    <AgentRunCard
                      run={message.run}
                      canStop={onStopRun !== undefined}
                      stopping={stoppingRun}
                      onStop={(runId) => onStopRun?.(runId)}
                    />
                  </li>
                );
              }

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
                        {splitMentions(message.body, names).map((part, at) =>
                          part.isMention ? (
                            <span
                              key={at}
                              className={cn(
                                "rounded px-0.5 font-medium",
                                mine
                                  ? "bg-primary-foreground/20"
                                  : "bg-agent/15 text-agent"
                              )}
                            >
                              {part.text}
                            </span>
                          ) : (
                            <span key={at}>{part.text}</span>
                          )
                        )}
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

      <ChatComposer
        sending={sending}
        disabled={disabled}
        placeholder={placeholder}
        mentionables={mentionables}
        onSend={onSend}
      />

    </div>
  );
}

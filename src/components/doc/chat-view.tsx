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
import { AgentAvatar } from "@/components/workspace/agent-avatar";
import { personAvatar } from "@/lib/avatars";
import { cn } from "@/lib/utils";

export type ChatAuthor = {
  id: string;
  displayName: string;
  avatarSeed: string;
  kind: "human" | "bot" | "guest";
  model?: string | null;
  provider?: string | null;
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
            "flex min-h-full flex-col px-4 py-4",
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
                      {!grouped &&
                        (isAgent ? (
                          <AgentAvatar
                            provider={message.author.provider}
                            seed={message.author.avatarSeed}
                            className="mt-4 size-6"
                          />
                        ) : (
                          <span
                            className={cn(
                              "mt-4 grid size-6 place-items-center overflow-hidden rounded-full bg-secondary",
                              isGuest &&
                                "bg-muted outline-1 -outline-offset-1 outline-dashed outline-border"
                            )}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={personAvatar(
                                message.author.avatarSeed,
                                "human",
                                56
                              )}
                              alt=""
                              aria-hidden
                              className="size-full select-none"
                            />
                          </span>
                        ))}
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
                            "truncate text-[12px] font-semibold tracking-[-0.005em]",
                            isAgent ? "text-agent" : "text-foreground"
                          )}
                        >
                          {mine ? "You" : message.author.displayName}
                        </span>

                        {isAgent && message.author.model && (
                          <span className="datum shrink-0 text-muted-foreground">
                            {message.author.model}
                          </span>
                        )}

                        {isGuest && (
                          <span className="shrink-0 rounded-[3px] bg-secondary px-1 font-mono text-[9.5px] tracking-[0.08em] text-muted-foreground uppercase">
                            guest
                          </span>
                        )}

                        <time
                          dateTime={message.createdAt}
                          className="datum shrink-0 text-muted-foreground/70"
                        >
                          {time(message.createdAt)}
                        </time>
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
                          "min-w-0 px-3 py-2 text-[13.5px] leading-[1.55] break-words whitespace-pre-wrap",
                          mine
                            ? "rounded-lg rounded-br-[3px] bg-primary text-primary-foreground"
                            : "rounded-lg rounded-bl-[3px] bg-secondary text-foreground",
                          /* An agent's words carry its own mark down the edge,
                             the same copper it leaves in the document. */
                          isAgent &&
                            "border-l-2 border-agent bg-agent-muted/60 pl-2.5 text-foreground"
                        )}
                      >
                        {splitMentions(message.body, names).map((part, at) =>
                          part.isMention ? (
                            <span
                              key={at}
                              className={cn(
                                "rounded-[3px] px-1 py-px font-semibold",
                                mine
                                  ? "bg-primary-foreground/20 text-primary-foreground"
                                  : "bg-agent/15 text-agent dark:bg-agent/25"
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

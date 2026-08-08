"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { personAvatar } from "@/lib/avatars";
import { useChat, useSendMessage, useSession } from "@/lib/queries";
import { cn } from "@/lib/utils";

export function DocChat({ documentId }: { documentId: string }) {
  const session = useSession();
  const chat = useChat(documentId);
  const send = useSendMessage(documentId);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const messages = chat.data?.messages ?? [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4">
        <ol className="flex flex-col gap-3.5 py-3">
          {chat.isPending && (
            <li className="text-[12px] text-muted-foreground">Loading…</li>
          )}

          {!chat.isPending && messages.length === 0 && (
            <li className="text-[12px] text-muted-foreground">
              No messages yet. Everyone in this doc sees this thread.
            </li>
          )}

          {messages.map((message) => {
            const isAgent = message.author.kind === "bot";
            const isMe = message.authorId === session.data?.user.id;

            return (
              <li key={message.id} className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={personAvatar(
                      message.author.avatarSeed,
                      isAgent ? "agent" : "human",
                      48
                    )}
                    alt=""
                    aria-hidden
                    className={cn(
                      "size-4 shrink-0 select-none",
                      isAgent ? "rounded-sm" : "rounded-full"
                    )}
                  />
                  <span
                    className={cn(
                      "text-[12px] font-medium",
                      isAgent && "text-agent"
                    )}
                  >
                    {isMe ? "You" : message.author.displayName}
                  </span>
                  {isAgent && message.author.model && (
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {message.author.model}
                    </span>
                  )}
                  <span className="ml-auto text-[10.5px] text-muted-foreground">
                    {new Date(message.createdAt).toLocaleTimeString(undefined, {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div
                  className={cn(
                    "rounded-lg px-2.5 py-1.5 text-[12.5px] leading-[1.5]",
                    isAgent
                      ? "bg-agent-muted/50"
                      : isMe
                        ? "bg-secondary"
                        : "bg-accent/60"
                  )}
                >
                  {message.body}
                </div>
              </li>
            );
          })}
        </ol>
        <div ref={endRef} />
      </div>

      <div className="shrink-0 border-t border-border/70 p-3">
        <form
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const body = draft.trim();
            if (!body) return;
            send.mutate(body, { onSuccess: () => setDraft("") });
          }}
        >
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Message the room…"
            aria-label="Message"
            className="h-8 bg-card text-[12.5px]"
          />
          <Button
            type="submit"
            size="icon-sm"
            aria-label="Send"
            disabled={!draft.trim() || send.isPending}
          >
            <ArrowUp />
          </Button>
        </form>
      </div>
    </div>
  );
}

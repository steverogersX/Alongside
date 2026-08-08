"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Quote } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ChatMessage, Person } from "@/lib/data";

type Reply = { body: string; quote?: string };

function replyFor(prompt: string, agent: Person, docTitle: string): Reply {
  const text = prompt.toLowerCase();

  if (text.includes("?")) {
    return {
      body: `Checking ${docTitle} and what it's built on before I answer — I'd rather be slow than confidently wrong here.`,
    };
  }
  if (
    text.includes("draft") ||
    text.includes("write") ||
    text.includes("rewrite")
  ) {
    return {
      body: "I'll claim one paragraph and draft there. Start typing in it and I'll step back without losing what you wrote.",
    };
  }
  if (text.includes("source") || text.includes("cite")) {
    return {
      body: "Every sentence I wrote is attributable — hover the mark in the margin and it'll tell you where the claim came from.",
    };
  }

  return {
    body: `Noted. I'll work that into ${docTitle} as a proposal rather than committing it — you accept or discard.`,
  };
}

export function DocChat({
  seed,
  people,
  agent,
  docTitle,
}: {
  seed: ChatMessage[];
  people: Person[];
  agent?: Person;
  docTitle: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(seed);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  function send() {
    const body = draft.trim();
    if (!body) return;

    setMessages((prev) => [
      ...prev,
      { id: `me_${prev.length}`, author: "u_you", body, at: "now" },
    ]);
    setDraft("");

    if (!agent) return;

    setTyping(true);
    const reply = replyFor(body, agent, docTitle);
    timers.current.push(
      setTimeout(() => {
        setTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `ag_${prev.length}`,
            author: agent.id,
            body: reply.body,
            at: "now",
            quote: reply.quote,
          },
        ]);
      }, 1100)
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4">
        <ol className="flex flex-col gap-3.5 py-3">
          {messages.map((message) => {
            const author = people.find((p) => p.id === message.author);
            const isAgent = author?.kind === "agent";
            const isMe = message.author === "u_you";

            return (
              <li key={message.id} className="flex flex-col gap-1">
                <div className="flex items-baseline gap-1.5">
                  <span
                    className={cn(
                      "text-[12px] font-medium",
                      isAgent && "text-agent"
                    )}
                  >
                    {isMe ? "You" : (author?.name ?? "Unknown")}
                  </span>
                  {isAgent && author?.model && (
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {author.model}
                    </span>
                  )}
                  <span className="ml-auto text-[10.5px] text-muted-foreground">
                    {message.at}
                  </span>
                </div>

                <div
                  className={cn(
                    "rounded-lg px-2.5 py-1.5 text-[12.5px] leading-[1.5]",
                    isAgent
                      ? "bg-agent-muted/50 text-foreground"
                      : isMe
                        ? "bg-secondary text-foreground"
                        : "bg-accent/60 text-foreground"
                  )}
                >
                  {message.body}
                  {message.quote && (
                    <span className="mt-1.5 flex items-start gap-1.5 border-l-2 border-agent/40 pl-2 font-serif text-[12px] text-muted-foreground">
                      <Quote className="mt-0.5 size-2.5 shrink-0" />
                      {message.quote}
                    </span>
                  )}
                </div>
              </li>
            );
          })}

          {typing && agent && (
            <li className="flex items-center gap-1.5 text-[12px] text-agent">
              <span className="animate-agent-pulse size-1.5 rounded-full bg-agent" />
              {agent.name} is typing…
            </li>
          )}
        </ol>
        <div ref={endRef} />
      </div>

      <div className="shrink-0 border-t border-border/70 p-3">
        <form
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            send();
          }}
        >
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={
              agent ? `Message ${agent.name} and the room…` : "Message the room…"
            }
            aria-label="Message"
            className="h-8 bg-card text-[12.5px]"
          />
          <Button
            type="submit"
            size="icon-sm"
            aria-label="Send"
            disabled={!draft.trim()}
          >
            <ArrowUp />
          </Button>
        </form>
        <p className="mt-1.5 text-[10.5px] text-muted-foreground">
          Everyone in this doc sees this thread, agents included.
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

import { TooltipProvider } from "@/components/ui/tooltip";
import { ChatEmpty } from "@/components/doc/chat-empty";
import { ChatView, type ChatEntry } from "@/components/doc/chat-view";

const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString();

const SEED: ChatEntry[] = [
  {
    id: "m1",
    body: "Claude, pull what we've settled at on liability caps the last two years.",
    createdAt: minutesAgo(24),
    author: {
      id: "u_sam",
      displayName: "Sam Ortega",
      avatarSeed: "u_sam",
      kind: "human",
    },
  },
  {
    id: "m2",
    body: "Six agreements. Four settled at 1.5x trailing fees, one at 1x, one at 2x — the 2x was the reseller deal where we carried no implementation risk.",
    createdAt: minutesAgo(23),
    author: {
      id: "a_claude",
      displayName: "Claude",
      avatarSeed: "a_claude",
      kind: "bot",
      model: "Opus 5",
    },
    reactions: [
      {
        emoji: "🎯",
        count: 2,
        reactedByMe: false,
        names: ["Sam Ortega", "Noor Haddad"],
      },
    ],
  },
  {
    id: "m3",
    body: "So 1.5x is the honest middle. Draft it, but leave the carve-outs alone.",
    createdAt: minutesAgo(11),
    author: {
      id: "u_noor",
      displayName: "Noor Haddad",
      avatarSeed: "u_noor",
      kind: "human",
    },
    reactions: [
      { emoji: "👍", count: 3, reactedByMe: true, names: ["Sam Ortega", "Isolated Badger"] },
      { emoji: "🎉", count: 1, reactedByMe: false, names: ["Sam Ortega"] },
    ],
  },
  {
    id: "m4",
    body: "Our counsel is comfortable with 1.5x provided the notice window stays at 60 days.",
    createdAt: minutesAgo(6),
    author: {
      id: "g_badger",
      displayName: "Isolated Badger",
      avatarSeed: "doc:badger",
      kind: "guest",
    },
  },
  {
    id: "m5",
    body: "Drafting into §4.2 now. Carve-outs untouched — byte-identical to the 2024 text.",
    createdAt: minutesAgo(2),
    author: {
      id: "a_claude",
      displayName: "Claude",
      avatarSeed: "a_claude",
      kind: "bot",
      model: "Opus 5",
    },
  },
  {
    id: "m6",
    body: "Good. I'll take the cover note once that lands.",
    createdAt: minutesAgo(1),
    isYou: true,
    author: {
      id: "u_you",
      displayName: "Pavan",
      avatarSeed: "u_you",
      kind: "human",
    },
  },
];

export default function ChatPreviewPage() {
  const [messages, setMessages] = useState(SEED);

  function send(body: string) {
    setMessages((previous) => [
      ...previous,
      {
        id: `local_${previous.length}`,
        body,
        createdAt: new Date().toISOString(),
        isYou: true,
        author: {
          id: "u_you",
          displayName: "Pavan",
          avatarSeed: "u_you",
          kind: "human",
        },
      },
    ]);
  }

  function toggleReaction(messageId: string, emoji: string) {
    setMessages((previous) =>
      previous.map((message) => {
        if (message.id !== messageId) return message;

        const reactions = message.reactions ?? [];
        const existing = reactions.find((r) => r.emoji === emoji);

        if (!existing) {
          return {
            ...message,
            reactions: [
              ...reactions,
              { emoji, count: 1, reactedByMe: true, names: ["You"] },
            ],
          };
        }

        const count = existing.count + (existing.reactedByMe ? -1 : 1);

        return {
          ...message,
          reactions: reactions
            .map((r) =>
              r.emoji === emoji
                ? {
                    ...r,
                    count,
                    reactedByMe: !r.reactedByMe,
                    names: r.reactedByMe
                      ? r.names.filter((n) => n !== "You")
                      : [...r.names, "You"],
                  }
                : r
            )
            .filter((r) => r.count > 0),
        };
      })
    );
  }

  return (
    <TooltipProvider>
      <div className="flex min-h-svh flex-col items-center gap-6 overflow-y-auto p-8">
        <div className="w-full max-w-5xl">
          <p className="eyebrow">Preview</p>
          <h1 className="mt-1 text-[22px] font-semibold tracking-tight">
            Document chat
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Mock data. The rail on the left is the real width it renders at in a
            document; the panel on the right shows it with more room.
          </p>
        </div>

        <div className="flex w-full max-w-5xl flex-wrap items-start gap-6">
          <div className="flex h-[34rem] w-80 shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="shrink-0 border-b border-border/70 px-4 py-2.5">
              <span className="eyebrow">Chat · rail width</span>
            </div>
            <ChatView messages={messages} onSend={send} onToggleReaction={toggleReaction} />
          </div>

          <div className="flex h-[34rem] min-w-80 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="shrink-0 border-b border-border/70 px-4 py-2.5">
              <span className="eyebrow">Chat · wide</span>
            </div>
            <ChatView messages={messages} onSend={send} onToggleReaction={toggleReaction} />
          </div>
        </div>

        <div className="w-full max-w-5xl">
          <p className="eyebrow">Empty states</p>

          <div className="mt-3 flex flex-wrap gap-6">
            {(
              [
                { label: "Can send", disabled: false },
                { label: "Read only", disabled: true },
              ] as const
            ).map((state) => (
              <div
                key={state.label}
                className="flex h-72 w-72 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm"
              >
                <div className="shrink-0 border-b border-border/70 px-4 py-2.5">
                  <span className="eyebrow">{state.label}</span>
                </div>
                <ChatView
                  messages={[]}
                  disabled={state.disabled}
                  onSend={() => {}}
                  placeholder={
                    state.disabled
                      ? "You can read this thread"
                      : "Message the room…"
                  }
                />
              </div>
            ))}

            <div className="flex h-72 w-72 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="shrink-0 border-b border-border/70 px-4 py-2.5">
                <span className="eyebrow">No access</span>
              </div>
              <div className="grid min-h-0 flex-1 place-items-center">
                <ChatEmpty variant="none" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

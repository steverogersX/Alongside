"use client";

import { useState } from "react";

import { ChatView, type ChatEntry } from "@/components/doc/chat-view";
import type { ChatReaction } from "@/components/doc/message-reactions";
import { useChat, useChatAccess, useSendMessage } from "@/lib/queries";

export function DocChat({ documentId }: { documentId: string }) {
  const [reactions, setReactions] = useState<Record<string, ChatReaction[]>>(
    {}
  );
  const access = useChatAccess(documentId);
  const chat = useChat(
    documentId,
    access.data !== undefined && access.data.chat !== "none"
  );
  const send = useSendMessage(documentId);

  const level = access.data?.chat ?? "none";
  const viewerId = access.data?.viewerId ?? null;

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
    },
    reactions: reactions[message.id],
  }));

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
      <p className="p-4 text-[12.5px] leading-relaxed text-muted-foreground">
        The chat for this document has not been shared with you.
      </p>
    );
  }

  return (
    <ChatView
      messages={messages}
      loading={chat.isPending || access.isPending}
      sending={send.isPending}
      disabled={level !== "write"}
      placeholder={
        level === "write" ? "Message the room…" : "You can read this thread"
      }
      onSend={(body) => send.mutate(body)}
      onToggleReaction={level === "write" ? toggleReaction : undefined}
    />
  );
}

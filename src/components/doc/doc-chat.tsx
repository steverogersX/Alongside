"use client";

import { ChatView, type ChatEntry } from "@/components/doc/chat-view";
import { useChat, useChatAccess, useSendMessage } from "@/lib/queries";

export function DocChat({ documentId }: { documentId: string }) {
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
  }));

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
    />
  );
}

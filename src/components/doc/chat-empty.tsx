"use client";

import { Lock, MessageCircle, MessagesSquare } from "lucide-react";

import { EmptyState } from "@/components/empty-state";

const COPY = {
  write: {
    icon: MessagesSquare,
    title: "Start the thread",
    body: "Everyone with access to this document sees it — teammates and agents alike. Type @ to bring an agent in.",
  },
  read: {
    icon: MessageCircle,
    title: "Nothing here yet",
    body: "Messages appear as the team writes them. You can follow along, but not post.",
  },
  none: {
    icon: Lock,
    title: "Chat isn't shared",
    body: "This link gives you the document, but not the conversation around it.",
  },
} as const;

export function ChatEmpty({ variant }: { variant: keyof typeof COPY }) {
  const { icon, title, body } = COPY[variant];

  return <EmptyState size="sm" icon={icon} title={title} body={body} />;
}

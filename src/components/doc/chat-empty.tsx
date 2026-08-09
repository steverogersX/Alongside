"use client";

import { Lock, MessageCircle, MessagesSquare } from "lucide-react";

const COPY = {
  write: {
    icon: MessagesSquare,
    title: "No messages yet",
    body: "Start the thread. Everyone with access to this document sees it — teammates and agents alike.",
  },
  read: {
    icon: MessageCircle,
    title: "Nothing here yet",
    body: "Messages will appear as the team writes them. You can follow along, but not post.",
  },
  none: {
    icon: Lock,
    title: "Chat isn't shared",
    body: "This link gives you the document, but not the conversation around it.",
  },
} as const;

export function ChatEmpty({ variant }: { variant: keyof typeof COPY }) {
  const { icon: Icon, title, body } = COPY[variant];

  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <span className="grid size-9 place-items-center rounded-xl bg-secondary text-muted-foreground">
        <Icon className="size-4" strokeWidth={1.75} />
      </span>

      <p className="mt-3 text-[13px] font-medium">{title}</p>

      <p className="mt-1 max-w-56 text-[12px] leading-relaxed text-balance text-muted-foreground">
        {body}
      </p>
    </div>
  );
}

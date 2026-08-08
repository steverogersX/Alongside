"use client";

import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { DocChat } from "@/components/doc/doc-chat";
import { cn } from "@/lib/utils";
import type { ChatMessage, Person } from "@/lib/data";

export function DocPanel({
  chat,
  people,
  agent,
  docTitle,
  activity,
}: {
  chat: ChatMessage[];
  people: Person[];
  agent?: Person;
  docTitle: string;
  activity: ReactNode;
}) {
  const [tab, setTab] = useState<"chat" | "activity">("chat");

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center gap-1 border-b border-border/70 p-2">
        {(["chat", "activity"] as const).map((key) => (
          <Button
            key={key}
            variant="ghost"
            size="sm"
            onClick={() => setTab(key)}
            className={cn(
              "text-[12.5px] capitalize",
              tab === key
                ? "bg-accent font-medium text-foreground"
                : "font-normal text-muted-foreground"
            )}
          >
            {key}
          </Button>
        ))}
      </div>

      {tab === "chat" ? (
        <DocChat
          seed={chat}
          people={people}
          agent={agent}
          docTitle={docTitle}
        />
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto p-4">{activity}</div>
      )}
    </div>
  );
}

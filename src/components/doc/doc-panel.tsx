"use client";

import { useState } from "react";
import { Check, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DocChat } from "@/components/doc/doc-chat";
import { EmptyState } from "@/components/empty-state";
import { FeedSkeleton } from "@/components/skeletons";
import { useRuns } from "@/lib/queries";
import { cn } from "@/lib/utils";

export function DocPanel({ documentId }: { documentId: string }) {
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
        <DocChat documentId={documentId} />
      ) : (
        <RunFeed documentId={documentId} />
      )}
    </div>
  );
}

function RunFeed({ documentId }: { documentId: string }) {
  const runs = useRuns(documentId);
  const list = runs.data?.runs ?? [];

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-4">
      <h2 className="eyebrow pb-3">Agent runs</h2>

      {runs.isPending ? (
        <FeedSkeleton />
      ) : list.length === 0 ? (
        <EmptyState
          size="sm"
          icon={Sparkles}
          title="No agent runs yet"
          body="Ask an agent to do something in this document and its work shows up here."
          className="px-0"
        />
      ) : (
        <ol className="flex flex-col gap-3">
          {list.map((run) => (
            <li key={run.id} className="flex gap-2.5">
              <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center">
                {run.status === "running" ? (
                  <span className="animate-agent-pulse size-2 rounded-full bg-agent" />
                ) : (
                  <Check className="size-3 text-muted-foreground" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12.5px] leading-snug">
                  {run.prompt}
                </span>
                <span className="block text-[11.5px] text-muted-foreground">
                  {run.status} · ran as {run.ceiling}
                </span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Check, Sparkles } from "lucide-react";

import { DocChat } from "@/components/doc/doc-chat";
import { EmptyState } from "@/components/empty-state";
import { SectionHead } from "@/components/section-head";
import { FeedSkeleton } from "@/components/skeletons";
import { useRuns } from "@/lib/queries";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "chat", label: "Chat" },
  { key: "activity", label: "Activity" },
] as const;

export function DocPanel({ documentId }: { documentId: string }) {
  const [tab, setTab] = useState<"chat" | "activity">("chat");

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        role="tablist"
        aria-label="Document panel"
        className="flex shrink-0 items-center gap-5 border-b border-border/70 px-4"
      >
        {TABS.map(({ key, label }) => {
          const active = tab === key;

          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(key)}
              className={cn(
                "-mb-px h-11 cursor-pointer border-b-2 text-[13px] transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/35",
                active
                  ? "border-foreground font-semibold text-foreground"
                  : "border-transparent font-normal text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {tab === "chat" ? (
        <DocChat documentId={documentId} />
      ) : (
        <RunFeed documentId={documentId} />
      )}
    </div>
  );
}

/**
 * Everything the agents have been asked to do here, newest work first. The
 * copper tick down the left is the same mark an agent leaves in the document.
 */
function RunFeed({ documentId }: { documentId: string }) {
  const runs = useRuns(documentId);
  const list = runs.data?.runs ?? [];

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
      <SectionHead label="Agent runs" count={list.length} />

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
        <ol className="flex flex-col gap-4">
          {list.map((run) => (
            <li key={run.id} className="flex gap-3">
              <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center">
                {run.status === "running" ? (
                  <span className="animate-agent-pulse size-2 rounded-full bg-agent" />
                ) : (
                  <Check className="size-3.5 text-muted-foreground" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] leading-snug">
                  {run.prompt}
                </span>
                <span className="datum mt-1 block text-muted-foreground">
                  {run.status} / ran as {run.ceiling}
                </span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

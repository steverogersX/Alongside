"use client";

import { Check, CircleAlert, Clock3, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AgentAvatar } from "@/components/workspace/agent-avatar";
import { elapsed, useTicker } from "@/lib/use-ticker";
import { cn } from "@/lib/utils";

export type RunView = {
  id: string;
  status: "queued" | "running" | "succeeded" | "failed" | "cancelled";
  prompt: string;
  agentName: string;
  avatarSeed: string;
  model?: string | null;
  provider?: string | null;
  invokedBy: string;
  isYours: boolean;
  waitingOn?: string | null;
  startedAt?: string | null;
  summary?: string | null;
  error?: string | null;
};

export function AgentRunCard({
  run,
  canStop,
  stopping = false,
  onStop,
}: {
  run: RunView;
  canStop: boolean;
  stopping?: boolean;
  onStop: (runId: string) => void;
}) {
  const live = run.status === "running" || run.status === "queued";
  const failed = run.status === "failed";
  useTicker();

  return (
    <div
      className={cn(
        "rounded-lg border border-l-2 border-border bg-card p-2.5",
        failed ? "border-l-destructive" : "border-l-agent"
      )}
    >
      <div className="flex items-center gap-2">
        <AgentAvatar
          provider={run.provider}
          seed={run.avatarSeed}
          className="size-5 rounded"
        />

        <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-agent">
          {run.agentName}
        </span>

        <StatusPill run={run} />

        {live && canStop && (
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Stop"
            title="Stop"
            disabled={stopping}
            onClick={() => onStop(run.id)}
            className="shrink-0 text-muted-foreground hover:text-destructive"
          >
            <Square className="fill-current" />
          </Button>
        )}
      </div>

      <p className="mt-1.5 line-clamp-2 text-[11.5px] leading-snug text-muted-foreground">
        {run.prompt}
      </p>

      {run.status === "queued" && (
        <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
          {run.waitingOn
            ? `Waiting for ${run.waitingOn}.`
            : "Waiting to be picked up."}
        </p>
      )}

      {run.summary && (
        <p className="mt-2 text-[12.5px] leading-relaxed">{run.summary}</p>
      )}

      {run.error && (
        <p className="mt-2 text-[12px] leading-relaxed text-destructive">
          {run.error}
        </p>
      )}

      <p className="mt-2 truncate text-[10.5px] text-muted-foreground/80">
        asked by {run.isYours ? "you" : run.invokedBy}
        {run.model && <span className="font-mono"> · {run.model}</span>}
      </p>
    </div>
  );
}

function StatusPill({ run }: { run: RunView }) {
  const base =
    "flex h-4.5 shrink-0 items-center gap-1 rounded-full px-1.5 text-[10px] font-medium";

  if (run.status === "queued") {
    return (
      <span className={cn(base, "bg-secondary text-muted-foreground")}>
        <Clock3 className="size-2.5" />
        Queued
      </span>
    );
  }

  if (run.status === "running") {
    return (
      <span className={cn(base, "bg-agent/12 text-agent dark:bg-agent/20")}>
        <span className="animate-agent-pulse size-1.5 rounded-full bg-current" />
        Working
        {run.startedAt && (
          <span className="tabular-nums opacity-70">
            {elapsed(run.startedAt)}
          </span>
        )}
      </span>
    );
  }

  if (run.status === "succeeded") {
    return (
      <span className={cn(base, "text-online")}>
        <Check className="size-2.5" strokeWidth={3} />
        Done
      </span>
    );
  }

  if (run.status === "cancelled") {
    return (
      <span className={cn(base, "bg-secondary text-muted-foreground")}>
        Stopped
      </span>
    );
  }

  return (
    <span className={cn(base, "text-destructive")}>
      <CircleAlert className="size-2.5" />
      Failed
    </span>
  );
}

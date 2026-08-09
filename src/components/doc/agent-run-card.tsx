"use client";

import { Check, CircleAlert, Clock3, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { personAvatar } from "@/lib/avatars";
import { elapsed, useTicker } from "@/lib/use-ticker";
import { cn } from "@/lib/utils";

export type RunView = {
  id: string;
  status: "queued" | "running" | "succeeded" | "failed" | "cancelled";
  prompt: string;
  agentName: string;
  avatarSeed: string;
  model?: string | null;
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
  useTicker();

  return (
    <div
      className={cn(
        "rounded-xl border p-2.5",
        run.status === "failed"
          ? "border-destructive/25 bg-destructive/5"
          : "border-agent/25 bg-agent/[0.06]"
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "grid size-6 shrink-0 place-items-center overflow-hidden rounded-md bg-secondary",
            live && "ring-1 ring-agent/40"
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={personAvatar(run.avatarSeed, "agent", 56)}
            alt=""
            aria-hidden
            className="size-full select-none"
          />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-[12.5px] font-semibold text-agent">
              {run.agentName}
            </span>
            {run.model && (
              <span className="shrink-0 truncate font-mono text-[10px] text-muted-foreground">
                {run.model}
              </span>
            )}
          </span>
          <span className="block truncate text-[11px] text-muted-foreground">
            asked by {run.isYours ? "you" : run.invokedBy}
          </span>
        </span>

        <StatusPill run={run} />

        {live && canStop && (
          <Button
            variant="ghost"
            size="xs"
            disabled={stopping}
            onClick={() => onStop(run.id)}
            className="shrink-0 text-muted-foreground hover:text-destructive"
          >
            <Square className="fill-current" />
            Stop
          </Button>
        )}
      </div>

      <p className="mt-2 border-l-2 border-agent/25 pl-2 text-[12.5px] leading-snug text-foreground/90">
        {run.prompt}
      </p>

      {run.status === "queued" && (
        <p className="mt-2 text-[11.5px] leading-relaxed text-muted-foreground">
          {run.waitingOn
            ? `Waiting for ${run.waitingOn}. It runs as soon as that session picks it up.`
            : "Waiting for a connected Claude Code session to pick it up."}
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
    </div>
  );
}

function StatusPill({ run }: { run: RunView }) {
  const base =
    "flex h-5 shrink-0 items-center gap-1 rounded-full px-1.5 text-[10.5px] font-medium";

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
      <span className={cn(base, "bg-agent/15 text-agent")}>
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
      <span className={cn(base, "bg-online/10 text-online")}>
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
    <span className={cn(base, "bg-destructive/10 text-destructive")}>
      <CircleAlert className="size-2.5" />
      Failed
    </span>
  );
}

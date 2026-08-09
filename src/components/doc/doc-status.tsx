"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

type Status = "draft" | "in_review" | "final";

/**
 * A stamp, not a pill. Set in the utility face because the state of a document
 * is a fact about it, in the same register as its word count or its date.
 */
const STATUS = {
  draft: {
    label: "Draft",
    className: "border-border bg-secondary text-muted-foreground",
  },
  in_review: {
    label: "In review",
    className: "border-review/35 bg-review/10 text-review",
  },
  final: {
    label: "Final",
    className: "border-online/35 bg-online/10 text-online",
  },
} as const;

export function DocStatus({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) {
  const { label, className: tone } = STATUS[status];

  return (
    <span
      className={cn(
        "inline-flex h-5.5 shrink-0 items-center gap-1.5 rounded-[4px] border px-1.5 font-mono text-[10px] leading-none font-medium tracking-[0.08em] uppercase",
        tone,
        className
      )}
    >
      {status === "final" ? (
        <Check className="size-2.5" strokeWidth={3.25} />
      ) : (
        <span
          className={cn(
            "size-1.5 rounded-full",
            status === "in_review"
              ? "animate-agent-pulse bg-current"
              : "border border-current opacity-70"
          )}
        />
      )}
      {label}
    </span>
  );
}

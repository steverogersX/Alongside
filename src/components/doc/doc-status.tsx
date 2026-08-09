"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

type Status = "draft" | "in_review" | "final";

const STATUS = {
  draft: {
    label: "Draft",
    className: "border-border bg-secondary text-muted-foreground",
  },
  in_review: {
    label: "In review",
    className: "border-review/30 bg-review/10 text-review",
  },
  final: {
    label: "Final",
    className: "border-online/30 bg-online/10 text-online",
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
        "inline-flex h-5.5 shrink-0 items-center gap-1.5 rounded-full border px-2 text-[11px] leading-none font-medium",
        tone,
        className
      )}
    >
      {status === "final" ? (
        <Check className="size-3" strokeWidth={2.75} />
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

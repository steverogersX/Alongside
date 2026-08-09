import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * A label, a rule that runs to the edge, and the count. Sections are titled
 * the way a drawing is titled: the number is part of the label, not an
 * afterthought hanging off it.
 */
export function SectionHead({
  label,
  count,
  action,
  className,
}: {
  label: string;
  count?: number;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 pb-3.5", className)}>
      <h2 className="eyebrow shrink-0">{label}</h2>
      <span aria-hidden className="h-px min-w-6 flex-1 bg-border" />
      {count !== undefined && (
        <span className="datum shrink-0 text-muted-foreground">
          {String(count).padStart(2, "0")}
        </span>
      )}
      {action}
    </div>
  );
}

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * An empty screen is an invitation to act, so the action is the loudest thing
 * here and the plate above it is deliberately unfinished — a dashed outline,
 * the drafting equivalent of a space left for something.
 */
export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  size = "default",
  className,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: ReactNode;
  size?: "default" | "sm";
  className?: string;
}) {
  const small = size === "sm";

  return (
    <div
      className={cn(
        "flex flex-col items-center text-center",
        small ? "px-4 py-8" : "px-6 py-14",
        className
      )}
    >
      <span
        className={cn(
          "grid place-items-center rounded-md border border-dashed border-input text-muted-foreground",
          small ? "size-9" : "size-11"
        )}
      >
        <Icon className={small ? "size-4" : "size-[18px]"} strokeWidth={1.6} />
      </span>

      <p
        className={cn(
          "mt-4 font-semibold tracking-[-0.01em]",
          small ? "text-[13px]" : "text-[15px]"
        )}
      >
        {title}
      </p>

      <p
        className={cn(
          "mt-1.5 leading-relaxed text-balance text-muted-foreground",
          small ? "max-w-60 text-[12.5px]" : "max-w-80 text-[13px]"
        )}
      >
        {body}
      </p>

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

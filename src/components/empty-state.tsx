import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

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
        small ? "px-4 py-6" : "px-6 py-12",
        className
      )}
    >
      <span
        className={cn(
          "grid place-items-center rounded-xl bg-secondary text-muted-foreground",
          small ? "size-8" : "size-10"
        )}
      >
        <Icon className={small ? "size-3.5" : "size-4"} strokeWidth={1.75} />
      </span>

      <p className={cn("mt-3 font-medium", small ? "text-[12.5px]" : "text-[13.5px]")}>
        {title}
      </p>

      <p
        className={cn(
          "mt-1 leading-relaxed text-balance text-muted-foreground",
          small ? "max-w-56 text-[12px]" : "max-w-72 text-[12.5px]"
        )}
      >
        {body}
      </p>

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

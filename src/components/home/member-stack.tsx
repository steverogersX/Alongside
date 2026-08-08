import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { personAvatar } from "@/lib/avatars";
import type { Person } from "@/lib/data";

export function MemberStack({
  members,
  max = 4,
  ringClass = "ring-card",
}: {
  members: Person[];
  max?: number;
  ringClass?: string;
}) {
  const shown = members.slice(0, max);
  const overflow = members.length - shown.length;

  return (
    <div className="flex items-center">
      {shown.map((m) => (
        <Tooltip key={m.id}>
          <TooltipTrigger asChild>
            <span className="relative -mr-1.5 inline-flex">
              {/* eslint-disable-next-line @next/next/no-img-element -- inlined data URI */}
              <img
                src={personAvatar(m.id, m.kind, 48)}
                alt={m.name}
                className={cn(
                  "size-6 ring-2 select-none",
                  ringClass,
                  m.kind === "agent" ? "rounded-md" : "rounded-full"
                )}
              />
              {m.status !== "offline" && (
                <span
                  className={cn(
                    "absolute -right-px -bottom-px size-2 rounded-full ring-2",
                    ringClass,
                    m.status === "active"
                      ? "bg-online"
                      : "bg-muted-foreground/40"
                  )}
                />
              )}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {m.name}
            {m.model ? ` · ${m.model}` : ""}
          </TooltipContent>
        </Tooltip>
      ))}

      {overflow > 0 && (
        <span
          className={cn(
            "relative inline-flex size-6 items-center justify-center rounded-full bg-secondary text-[10px] leading-none font-medium text-muted-foreground ring-2",
            ringClass
          )}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}

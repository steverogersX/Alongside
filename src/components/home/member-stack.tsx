import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Person } from "@/lib/data";

/**
 * Humans get a circle, agents get a squircle with the accent ring. The shape
 * difference is deliberate: you should never have to read a name to know
 * whether a person or a model is holding the pen.
 */
export function MemberStack({
  members,
  max = 4,
}: {
  members: Person[];
  max?: number;
}) {
  const shown = members.slice(0, max);
  const overflow = members.length - shown.length;

  return (
    <div className="flex items-center">
      {shown.map((m) => (
        <Tooltip key={m.id}>
          <TooltipTrigger asChild>
            <span className="relative -mr-1.5 inline-flex last:mr-0">
              <span
                className={cn(
                  "grid size-6 place-items-center text-[10px] leading-none font-medium ring-2 ring-card",
                  m.kind === "agent"
                    ? "rounded-md bg-agent-muted text-agent"
                    : "rounded-full bg-secondary text-muted-foreground"
                )}
              >
                {m.initials}
              </span>
              {m.status !== "offline" && (
                <span
                  className={cn(
                    "absolute -right-px -bottom-px size-2 rounded-full ring-2 ring-card",
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
        <span className="relative inline-flex size-6 items-center justify-center rounded-full bg-secondary text-[10px] leading-none font-medium text-muted-foreground ring-2 ring-card">
          +{overflow}
        </span>
      )}
    </div>
  );
}

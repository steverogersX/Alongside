"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { personAvatar } from "@/lib/avatars";
import type { AwarenessViewer } from "@/lib/use-awareness";
import { cn } from "@/lib/utils";

export function PresenceBar({
  viewers,
  max = 5,
  ringClass = "ring-sidebar",
}: {
  viewers: AwarenessViewer[];
  max?: number;
  ringClass?: string;
}) {
  if (viewers.length === 0) return null;

  const shown = viewers.slice(0, max);
  const overflow = viewers.length - shown.length;

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-center">
        {shown.map((viewer) => (
          <Tooltip key={viewer.key}>
            <TooltipTrigger asChild>
              <span className="relative -mr-2 inline-flex cursor-pointer transition-transform last:mr-0 hover:z-10 hover:-translate-y-0.5">
                <span
                  className={cn(
                    "grid size-7 place-items-center overflow-hidden ring-2",
                    ringClass,
                    viewer.kind === "agent"
                      ? "rounded-lg bg-agent-muted"
                      : "rounded-full bg-secondary",
                    viewer.kind === "guest" &&
                      "bg-muted outline-1 -outline-offset-1 outline-dashed outline-border"
                  )}
                  style={{ boxShadow: `inset 0 0 0 1.5px ${viewer.color}` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={personAvatar(
                      viewer.avatarSeed,
                      viewer.kind === "agent" ? "agent" : "human",
                      64
                    )}
                    alt={viewer.name}
                    className="size-full select-none"
                  />
                </span>
              </span>
            </TooltipTrigger>

            <TooltipContent side="bottom">
              <span className="flex flex-col gap-0.5">
                <span className="font-medium">
                  {viewer.isYou ? "You" : viewer.name}
                </span>
                <span className="text-background/70">
                  {viewer.kind === "guest" ? "Guest · here now" : "Here now"}
                </span>
              </span>
            </TooltipContent>
          </Tooltip>
        ))}

        {overflow > 0 && (
          <span
            className={cn(
              "relative inline-flex size-7 cursor-pointer items-center justify-center rounded-full bg-secondary text-[10.5px] leading-none font-medium text-muted-foreground ring-2",
              ringClass
            )}
          >
            +{overflow}
          </span>
        )}
      </div>

      <span className="hidden text-[11.5px] whitespace-nowrap text-muted-foreground sm:inline">
        {summary(viewers)}
      </span>
    </div>
  );
}

function summary(viewers: AwarenessViewer[]) {
  const others = viewers.filter((viewer) => !viewer.isYou).length;
  if (others === 0) return "Only you";
  return `You and ${others} ${others === 1 ? "other" : "others"}`;
}

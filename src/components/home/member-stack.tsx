import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AgentAvatar } from "@/components/workspace/agent-avatar";
import { personAvatar } from "@/lib/avatars";
import type { Member } from "@/lib/types";

export function MemberStack({
  members,
  max = 4,
  ringClass = "ring-card",
}: {
  members: Member[];
  max?: number;
  ringClass?: string;
}) {
  const shown = members.slice(0, max);
  const overflow = members.length - shown.length;

  return (
    <div className="flex items-center">
      {shown.map((member) => (
        <Tooltip key={member.id}>
          <TooltipTrigger asChild>
            <span className="relative -mr-1.5 inline-flex">
              {member.kind === "bot" ? (
                <AgentAvatar
                  provider={member.provider}
                  seed={member.avatarSeed}
                  className={cn("size-6 ring-2", ringClass)}
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={personAvatar(member.avatarSeed, member.kind, 48)}
                  alt={member.displayName}
                  className={cn(
                    "size-6 rounded-full ring-2 select-none",
                    ringClass
                  )}
                />
              )}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {member.displayName}
            {member.model ? ` · ${member.model}` : ""}
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

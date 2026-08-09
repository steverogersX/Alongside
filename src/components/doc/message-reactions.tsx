"use client";

import { SmilePlus } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type ChatReaction = {
  emoji: string;
  count: number;
  reactedByMe: boolean;
  names: string[];
};

const QUICK = ["👍", "❤️", "🎉", "👀", "🙌", "😄"];

function summarise(reaction: ChatReaction) {
  const others = reaction.names.filter((name) => name !== "You");
  const parts = reaction.reactedByMe ? ["You", ...others] : others;

  if (parts.length === 0) return reaction.emoji;
  if (parts.length <= 3) return `${parts.join(", ")} reacted ${reaction.emoji}`;

  return `${parts.slice(0, 3).join(", ")} and ${parts.length - 3} more reacted ${reaction.emoji}`;
}

export function ReactionChips({
  reactions,
  align,
  disabled = false,
  onToggle,
}: {
  reactions: ChatReaction[];
  align: "left" | "right";
  disabled?: boolean;
  onToggle: (emoji: string) => void;
}) {
  if (reactions.length === 0) return null;

  return (
    <div
      className={cn(
        "mt-1 flex flex-wrap gap-1",
        align === "right" && "justify-end"
      )}
    >
      {reactions.map((reaction) => (
        <Tooltip key={reaction.emoji}>
          <TooltipTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onToggle(reaction.emoji)}
              aria-pressed={reaction.reactedByMe}
              className={cn(
                "flex h-6 cursor-pointer items-center gap-1 rounded-full border px-1.5 text-[12px] leading-none transition-colors disabled:cursor-default disabled:opacity-60",
                reaction.reactedByMe
                  ? "border-primary/40 bg-primary/10 text-foreground"
                  : "border-border bg-secondary text-muted-foreground hover:border-foreground/20"
              )}
            >
              <span className="text-[13px]">{reaction.emoji}</span>
              <span className="font-medium tabular-nums">{reaction.count}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-56 text-center">
            {summarise(reaction)}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

export function ReactionButton({
  open,
  onOpenChange,
  side,
  onPick,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side: "left" | "right";
  onPick: (emoji: string) => void;
  className?: string;
}) {
  function pick(emoji: string) {
    onPick(emoji);
    onOpenChange(false);
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Add reaction"
          className={cn(
            "grid size-5 cursor-pointer place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
            className
          )}
        >
          <SmilePlus className="size-3.5" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align={side === "right" ? "end" : "start"}
        sideOffset={6}
        className="flex w-auto items-center gap-0.5 rounded-full p-1"
      >
        {QUICK.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => pick(emoji)}
            aria-label={`React with ${emoji}`}
            className="grid size-7 cursor-pointer place-items-center rounded-full text-[17px] leading-none transition-transform hover:scale-110 hover:bg-accent"
          >
            {emoji}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

import Avatar from "boring-avatars";

import { cn } from "@/lib/utils";

const PALETTE = ["#1f3a5f", "#3e7cb1", "#5fa8a3", "#c9a27c", "#b8574c"];

export function WorkspaceMark({
  seed,
  className,
  size = 32,
}: {
  seed: string;
  className?: string;
  size?: number;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 overflow-hidden rounded-lg select-none",
        className
      )}
    >
      <Avatar
        name={seed}
        variant="marble"
        size={size}
        square
        colors={PALETTE}
      />
    </span>
  );
}

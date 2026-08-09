import Avatar from "boring-avatars";

import { cn } from "@/lib/utils";

/* Drawn from the two voices: blueprint navy through cobalt, then the copper
   the agents write in. Every workspace is a different fold of the same paper. */
const PALETTE = ["#16233f", "#2b57c9", "#6f8fc4", "#c2703a", "#e0cba7"];

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
        "inline-flex shrink-0 overflow-hidden rounded-md select-none",
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

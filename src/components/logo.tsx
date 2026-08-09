import { cn } from "@/lib/utils";

/**
 * Two columns running alongside each other, offset so they overlap across the
 * middle — the part of the document both hands touch. The left one takes the
 * surrounding ink because people are the default; the right one is always the
 * agent's copper, because that is the half of the product worth naming.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn("size-[22px] shrink-0", className)}
    >
      <rect x="4" y="2" width="6.5" height="17" rx="2" fill="currentColor" />
      <rect x="13.5" y="5" width="6.5" height="17" rx="2" fill="var(--agent)" />
    </svg>
  );
}

import { cn } from "@/lib/utils";

/**
 * Two spans running alongside each other, offset so they overlap across the
 * middle — the part of the document both hands touch. The left bar takes the
 * surrounding ink so the mark reads on any surface; the right one is always
 * the agent's violet, because that is the half of the product worth naming.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn("size-6 shrink-0", className)}
    >
      <rect x="4.5" y="2" width="6" height="16" rx="3" fill="currentColor" />
      <rect x="13.5" y="6" width="6" height="16" rx="3" fill="var(--agent)" />
    </svg>
  );
}

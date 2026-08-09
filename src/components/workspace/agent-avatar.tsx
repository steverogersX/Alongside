"use client";

import {
  PROVIDERS,
  ProviderMark,
  type ProviderId,
} from "@/components/workspace/provider-mark";
import { personAvatar } from "@/lib/avatars";
import { cn } from "@/lib/utils";

const KNOWN = new Set(
  PROVIDERS.filter((row) => row.id !== "other").map((row) => row.id)
);

/**
 * An agent wears its provider's mark, because that is a real fact about it.
 * A generated face is only right when we genuinely do not know what it is.
 */
export function AgentAvatar({
  provider,
  seed,
  className,
  markClassName,
}: {
  provider?: string | null;
  seed: string;
  className?: string;
  markClassName?: string;
}) {
  const known = provider && KNOWN.has(provider as ProviderId);

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-md",
        known ? "bg-card ring-1 ring-border" : "bg-secondary",
        className
      )}
    >
      {known ? (
        <ProviderMark
          provider={provider as ProviderId}
          className={cn("size-[62%]", markClassName)}
        />
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={personAvatar(seed, "agent", 56)}
          alt=""
          aria-hidden
          className="size-full select-none"
        />
      )}
    </span>
  );
}

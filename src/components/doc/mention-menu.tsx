"use client";

import { AgentAvatar } from "@/components/workspace/agent-avatar";
import { personAvatar } from "@/lib/avatars";
import { cn } from "@/lib/utils";

export type Mentionable = {
  id: string;
  name: string;
  displayName: string;
  avatarSeed: string;
  kind: "agent" | "human";
  model?: string | null;
  provider?: string | null;
  disabledReason?: string;
};

export function matchMention(value: string, caret: number) {
  const upTo = value.slice(0, caret);
  const at = upTo.lastIndexOf("@");
  if (at === -1) return null;

  const before = at === 0 ? "" : upTo[at - 1];
  if (before && !/\s/.test(before)) return null;

  const query = upTo.slice(at + 1);
  if (/\s/.test(query)) return null;

  return { at, query };
}

export function MentionMenu({
  items,
  active,
  onPick,
  onHover,
}: {
  items: Mentionable[];
  active: number;
  onPick: (item: Mentionable) => void;
  onHover: (index: number) => void;
}) {
  if (items.length === 0) return null;

  return (
    <ul
      role="listbox"
      aria-label="Mention"
      className="absolute inset-x-0 bottom-full z-20 mb-1.5 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-md"
    >
      {items.map((item, index) => (
        <li key={item.id}>
          <button
            type="button"
            role="option"
            aria-selected={index === active}
            aria-disabled={Boolean(item.disabledReason)}
            onMouseDown={(event) => {
              event.preventDefault();
              if (!item.disabledReason) onPick(item);
            }}
            onMouseEnter={() => onHover(index)}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-1.5 py-1.5 text-left transition-colors",
              item.disabledReason
                ? "cursor-not-allowed opacity-55"
                : "cursor-pointer",
              index === active && !item.disabledReason && "bg-accent"
            )}
          >
            {item.kind === "agent" ? (
              <AgentAvatar
                provider={item.provider}
                seed={item.avatarSeed}
                className="size-5 rounded"
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={personAvatar(item.avatarSeed, "human", 48)}
                alt=""
                aria-hidden
                className="size-5 shrink-0 rounded-full select-none"
              />
            )}

            <span className="min-w-0 flex-1">
              <span
                className={cn(
                  "block truncate text-[12.5px]",
                  item.kind === "agent" && "font-medium text-agent"
                )}
              >
                {item.displayName}
              </span>
              {(item.disabledReason ?? item.model) && (
                <span
                  className={cn(
                    "block truncate text-[10.5px] text-muted-foreground",
                    !item.disabledReason && "font-mono"
                  )}
                >
                  {item.disabledReason ?? item.model}
                </span>
              )}
            </span>

            <span className="shrink-0 font-mono text-[10.5px] text-muted-foreground">
              @{item.name}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function splitMentions(body: string, names: Set<string>) {
  return body.split(/(@[\p{L}\p{N}_-]+)/gu).map((part) => ({
    text: part,
    isMention: part.startsWith("@") && names.has(part.slice(1).toLowerCase()),
  }));
}

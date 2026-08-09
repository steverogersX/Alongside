"use client";

import { useRef, useState } from "react";
import { ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  MentionMenu,
  matchMention,
  splitMentions,
  type Mentionable,
} from "@/components/doc/mention-menu";
import { cn } from "@/lib/utils";

const FIELD =
  "px-1.5 py-1 text-[12.5px] leading-[1.5] whitespace-pre-wrap break-words";

export function ChatComposer({
  sending = false,
  disabled = false,
  placeholder = "Message the room…",
  mentionables,
  onSend,
}: {
  sending?: boolean;
  disabled?: boolean;
  placeholder?: string;
  mentionables: Mentionable[];
  onSend: (body: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const [mention, setMention] = useState<{ at: number; query: string } | null>(
    null
  );
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const names = new Set(mentionables.map((item) => item.name));

  const matches = mention
    ? mentionables
        .filter((item) =>
          `${item.name} ${item.displayName}`
            .toLowerCase()
            .includes(mention.query.toLowerCase())
        )
        .slice(0, 5)
    : [];

  function sync(value: string, caret: number) {
    setMention(matchMention(value, caret));
    setActive(0);
  }

  function apply(item: Mentionable) {
    if (!mention) return;

    const caret = inputRef.current?.selectionStart ?? draft.length;
    const next = `${draft.slice(0, mention.at)}@${item.name} ${draft.slice(caret)}`;
    const position = mention.at + item.name.length + 2;

    setDraft(next);
    setMention(null);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(position, position);
    });
  }

  function submit() {
    const body = draft.trim();
    if (!body) return;
    onSend(body);
    setDraft("");
    setMention(null);
  }

  return (
    <div className="relative shrink-0 p-2.5">
      {mention && matches.length > 0 && (
        <div className="absolute inset-x-2.5 bottom-full">
          <MentionMenu
            items={matches}
            active={active}
            onPick={apply}
            onHover={setActive}
          />
        </div>
      )}

      <form
        className="flex items-end gap-2 rounded-xl border border-border bg-card p-1.5 transition-colors focus-within:border-foreground/25"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div className="relative max-h-28 min-h-7 flex-1 overflow-y-auto">
          {/* Mirrors the textarea exactly and sits behind it, so the tag can be
              a coloured chip while the caret and selection stay native. */}
          <div aria-hidden className={cn(FIELD, "pointer-events-none")}>
            {splitMentions(draft, names).map((part, index) =>
              part.isMention ? (
                <span
                  key={index}
                  className="rounded bg-agent/15 font-medium text-agent"
                >
                  {part.text}
                </span>
              ) : (
                <span key={index}>{part.text}</span>
              )
            )}
            {"​"}
          </div>

          <textarea
            ref={inputRef}
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              sync(event.target.value, event.target.selectionStart ?? 0);
            }}
            onClick={(event) =>
              sync(event.currentTarget.value, event.currentTarget.selectionStart)
            }
            onBlur={() => setMention(null)}
            onKeyDown={(event) => {
              if (mention && matches.length > 0) {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setActive((index) => (index + 1) % matches.length);
                  return;
                }
                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setActive(
                    (index) => (index - 1 + matches.length) % matches.length
                  );
                  return;
                }
                if (event.key === "Enter" || event.key === "Tab") {
                  const picked = matches[active];
                  if (picked && !picked.disabledReason) {
                    event.preventDefault();
                    apply(picked);
                    return;
                  }
                }
                if (event.key === "Escape") {
                  event.preventDefault();
                  setMention(null);
                  return;
                }
              }

              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder={placeholder}
            aria-label="Message"
            disabled={disabled}
            className={cn(
              FIELD,
              "absolute inset-0 size-full resize-none overflow-hidden bg-transparent text-transparent caret-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50"
            )}
          />
        </div>

        <Button
          type="submit"
          size="icon-sm"
          aria-label="Send"
          disabled={disabled || sending || !draft.trim()}
          className="shrink-0"
        >
          {sending ? <Spinner /> : <ArrowUp />}
        </Button>
      </form>
    </div>
  );
}

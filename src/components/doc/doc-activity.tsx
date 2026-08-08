import { Check } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { personAvatar } from "@/lib/avatars";
import { type DocDetail } from "@/lib/data";
import { findPerson } from "@/lib/docs";

export function DocActivity({ detail }: { detail: DocDetail }) {
  const open = detail.comments.filter((c) => !c.resolved);
  const resolved = detail.comments.filter((c) => c.resolved);

  return (
    <>
      <h2 className="eyebrow pb-3">Agent run</h2>
      <ol className="flex flex-col gap-3">
        {detail.steps.map((step) => (
          <li key={step.id} className="flex gap-2.5">
            <span className="relative mt-0.5 flex size-4 shrink-0 items-center justify-center">
              {step.state === "running" ? (
                <span className="animate-agent-pulse size-2 rounded-full bg-agent" />
              ) : (
                <Check className="size-3 text-muted-foreground" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span
                className={cn(
                  "block text-[12.5px] leading-snug",
                  step.state === "running"
                    ? "font-medium text-agent"
                    : "text-foreground"
                )}
              >
                {step.label}
              </span>
              <span className="block text-[11.5px] text-muted-foreground">
                {step.detail}
              </span>
            </span>
          </li>
        ))}
      </ol>

      <Separator className="my-4" />

      <h2 className="eyebrow pb-1">
        Comments {open.length > 0 && `· ${open.length} open`}
      </h2>

      <ol className="flex flex-col">
        {[...open, ...resolved].map((comment, i, all) => {
          const author = findPerson(comment.author);

          return (
            <li key={comment.id}>
              <div className={cn("py-2.5", comment.resolved && "opacity-55")}>
                <div className="flex items-center gap-2">
                  {author && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={personAvatar(author.id, author.kind, 48)}
                      alt=""
                      aria-hidden
                      className="size-5 shrink-0 rounded-full select-none"
                    />
                  )}
                  <span className="truncate text-[12px] font-medium">
                    {author?.name}
                  </span>
                  <span className="rounded bg-secondary px-1 font-mono text-[10px] text-muted-foreground">
                    {comment.anchor}
                  </span>
                  <span className="ml-auto text-[11px] text-muted-foreground">
                    {comment.at}
                  </span>
                </div>
                <p className="mt-1 pl-7 text-[12.5px] leading-snug text-muted-foreground">
                  {comment.body}
                </p>
              </div>
              {i !== all.length - 1 && <Separator className="bg-border/60" />}
            </li>
          );
        })}
      </ol>
    </>
  );
}

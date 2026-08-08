import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { personAvatar } from "@/lib/avatars";
import { ACTIVITY } from "@/lib/data";

export function ActivityFeed() {
  return (
    <ol className="flex flex-col">
      {ACTIVITY.map((event, i) => (
        <li key={event.id}>
          <div className="flex gap-2.5 py-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={personAvatar(event.actor.id, event.actor.kind, 48)}
              alt=""
              aria-hidden
              className={cn(
                "mt-0.5 size-6 shrink-0 select-none",
                event.actor.kind === "agent"
                  ? "rounded-md ring-1 ring-agent/25"
                  : "rounded-full"
              )}
            />

            <p className="min-w-0 flex-1 text-[12.5px] leading-snug text-muted-foreground">
              <span
                className={cn(
                  "font-medium",
                  event.actor.kind === "agent" ? "text-agent" : "text-foreground"
                )}
              >
                {event.actor.name}
              </span>{" "}
              {event.verb}{" "}
              <span className="text-foreground">{event.target}</span>
              <span className="mt-0.5 block text-[11.5px] text-muted-foreground/80">
                {event.workspace} · {event.at} ago
              </span>
            </p>
          </div>

          {i !== ACTIVITY.length - 1 && <Separator className="bg-border/60" />}
        </li>
      ))}
    </ol>
  );
}

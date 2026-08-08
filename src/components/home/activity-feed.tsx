import { cn } from "@/lib/utils";
import { ACTIVITY } from "@/lib/data";

export function ActivityFeed() {
  return (
    <ol className="flex flex-col">
      {ACTIVITY.map((event, i) => (
        <li
          key={event.id}
          className={cn(
            "flex gap-2.5 py-2.5",
            i !== ACTIVITY.length - 1 && "border-b border-border/60"
          )}
        >
          <span
            className={cn(
              "mt-0.5 grid size-6 shrink-0 place-items-center text-[10px] font-medium",
              event.actor.kind === "agent"
                ? "rounded-md bg-agent-muted text-agent ring-1 ring-agent/30"
                : "rounded-full bg-secondary text-muted-foreground"
            )}
          >
            {event.actor.initials}
          </span>

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
        </li>
      ))}
    </ol>
  );
}

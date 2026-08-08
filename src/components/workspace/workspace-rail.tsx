import { Separator } from "@/components/ui/separator";
import { ShellRail } from "@/components/shell";
import { cn } from "@/lib/utils";
import { personAvatar } from "@/lib/avatars";
import { ACTIVITY, type Workspace } from "@/lib/data";

const STATUS_DOT: Record<string, string> = {
  active: "bg-online",
  idle: "bg-muted-foreground/40",
  offline: "border border-border",
};

export function WorkspaceRail({ workspace }: { workspace: Workspace }) {
  const events = ACTIVITY.filter((e) => e.workspace === workspace.name);
  const humans = workspace.members.filter((m) => m.kind === "human");
  const agents = workspace.members.filter((m) => m.kind === "agent");

  return (
    <ShellRail>
      <h2 className="eyebrow pb-3">People</h2>
      <div className="flex flex-col gap-2.5">
        {humans.map((m) => (
          <div key={m.id} className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={personAvatar(m.id, m.kind, 48)}
              alt=""
              aria-hidden
              className="size-6 shrink-0 rounded-full select-none"
            />
            <span className="min-w-0 flex-1 truncate text-[12.5px]">
              {m.name}
            </span>
            <span
              className={cn("size-1.5 rounded-full", STATUS_DOT[m.status])}
            />
          </div>
        ))}
      </div>

      <Separator className="my-4" />

      <h2 className="eyebrow pb-3">Agents</h2>
      <div className="flex flex-col gap-2.5">
        {agents.map((m) => (
          <div key={m.id} className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={personAvatar(m.id, m.kind, 48)}
              alt=""
              aria-hidden
              className="size-6 shrink-0 rounded-md ring-1 ring-agent/25 select-none"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12.5px] font-medium">
                {m.name}
              </span>
              <span className="block truncate font-mono text-[11px] text-muted-foreground">
                {m.model}
              </span>
            </span>
            <span
              className={cn("size-1.5 rounded-full", STATUS_DOT[m.status])}
            />
          </div>
        ))}
      </div>

      {events.length > 0 && (
        <>
          <Separator className="my-4" />
          <h2 className="eyebrow pb-1">Activity</h2>
          <ol className="flex flex-col">
            {events.map((event, i) => (
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
                        event.actor.kind === "agent"
                          ? "text-agent"
                          : "text-foreground"
                      )}
                    >
                      {event.actor.name}
                    </span>{" "}
                    {event.verb}{" "}
                    <span className="text-foreground">{event.target}</span>
                    <span className="mt-0.5 block text-[11.5px] text-muted-foreground/80">
                      {event.at} ago
                    </span>
                  </p>
                </div>
                {i !== events.length - 1 && (
                  <Separator className="bg-border/60" />
                )}
              </li>
            ))}
          </ol>
        </>
      )}
    </ShellRail>
  );
}

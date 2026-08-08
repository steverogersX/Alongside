import { cn } from "@/lib/utils";
import { ActivityFeed } from "@/components/home/activity-feed";
import { MemberStack } from "@/components/home/member-stack";
import { WORKSPACES } from "@/lib/data";

export function RightRail() {
  const agentsOnCall = WORKSPACES.flatMap((ws) =>
    ws.members.filter((m) => m.kind === "agent")
  );

  const inTheBuilding = WORKSPACES.flatMap((ws) => ws.members)
    .filter((m) => m.status === "active")
    .filter((m, i, all) => all.findIndex((x) => x.id === m.id) === i);

  return (
    <aside className="hidden w-72 shrink-0 flex-col overflow-y-auto rounded-2xl border border-sidebar-border bg-sidebar p-4 shadow-sm xl:flex">
      <section>
        <h2 className="eyebrow pb-1">Activity</h2>
        <ActivityFeed />
      </section>

      <section className="mt-7">
        <h2 className="eyebrow pb-3">Agents on call</h2>
        <div className="flex flex-col gap-2.5">
          {agentsOnCall.map((agent, i) => (
            <div key={`${agent.id}-${i}`} className="flex items-center gap-2.5">
              <span className="grid size-6 shrink-0 place-items-center rounded-md bg-agent-muted text-[10px] font-medium text-agent ring-1 ring-agent/30">
                {agent.initials}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-medium">
                  {agent.name}
                </span>
                <span className="block truncate font-mono text-[11px] text-muted-foreground">
                  {agent.model}
                </span>
              </span>
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  agent.status === "active" && "bg-online",
                  agent.status === "idle" && "bg-muted-foreground/40",
                  agent.status === "offline" && "border border-border"
                )}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-7">
        <h2 className="eyebrow pb-3">In the building</h2>
        <MemberStack members={inTheBuilding} max={8} />
      </section>
    </aside>
  );
}

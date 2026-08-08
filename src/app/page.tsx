import { Plus, UserPlus } from "lucide-react";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Clock } from "@/components/home/clock";
import { Sidebar } from "@/components/home/sidebar";
import { RightRail } from "@/components/home/right-rail";
import { WorkspaceRow } from "@/components/home/workspace-row";
import { VIEWER, WORKSPACES } from "@/lib/data";

const STATS = [
  { value: WORKSPACES.length, label: "workspaces" },
  {
    value: new Set(
      WORKSPACES.flatMap((ws) => ws.members)
        .filter((m) => m.kind === "human")
        .map((m) => m.id)
    ).size,
    label: "people",
  },
  {
    value: WORKSPACES.flatMap((ws) => ws.members).filter(
      (m) => m.kind === "agent"
    ).length,
    label: "agents",
  },
];

export default function Page() {
  return (
    <TooltipProvider>
      <div className="flex h-svh gap-2.5 p-2.5">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto rounded-2xl border border-sidebar-border bg-sidebar shadow-sm">
          <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center gap-3 bg-sidebar/90 px-4 backdrop-blur-md">
            <span className="text-[13px] font-medium">Home</span>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm">
                <UserPlus />
                Invite
              </Button>
              <Button size="sm">
                <Plus />
                New workspace
              </Button>
            </div>
          </header>

          <main className="px-6 pt-6 pb-12">
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-9">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h1 className="text-[26px] font-semibold tracking-tight">
                    Welcome back, {VIEWER.name}
                  </h1>
                  <Clock />
                </div>

                <dl className="flex items-center gap-6">
                  {STATS.map((stat) => (
                    <div key={stat.label} className="text-right">
                      <dt className="sr-only">{stat.label}</dt>
                      <dd className="text-[19px] leading-none font-semibold tabular-nums">
                        {stat.value}
                      </dd>
                      <dd className="mt-1 text-[11px] text-muted-foreground">
                        {stat.label}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <section>
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <h2 className="eyebrow">Your workspaces</h2>
                  <button
                    type="button"
                    className="cursor-pointer text-[12px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    View all
                  </button>
                </div>

                <div className="divide-y divide-border/60">
                  {WORKSPACES.map((ws) => (
                    <WorkspaceRow key={ws.id} workspace={ws} />
                  ))}
                </div>
              </section>
            </div>
          </main>
        </div>

        <RightRail />
      </div>
    </TooltipProvider>
  );
}

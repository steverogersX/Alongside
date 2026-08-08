import { Bot, FileText, Plus, UserPlus } from "lucide-react";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/home/sidebar";
import { RightRail } from "@/components/home/right-rail";
import { WorkspaceCard } from "@/components/home/workspace-card";
import { VIEWER, WORKSPACES } from "@/lib/data";

const QUICK_ACTIONS = [
  {
    label: "New workspace",
    hint: "A room for a piece of work",
    icon: Plus,
  },
  {
    label: "Add an agent",
    hint: "Give it a seat and a scope",
    icon: Bot,
  },
  {
    label: "Start a doc",
    hint: "Draft together, live",
    icon: FileText,
  },
  {
    label: "Invite teammates",
    hint: "By email or link",
    icon: UserPlus,
  },
];

export default function Page() {
  const live = WORKSPACES.filter((ws) => ws.live);

  return (
    <TooltipProvider>
      {/* Floating shell: three panels adrift on a tinted canvas. Each column
          owns its own scroll so the rails never move with the workspace grid. */}
      <div className="flex h-svh gap-2.5 p-2.5">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          {/* Top bar floats with the canvas, not with a panel edge. */}
          <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center gap-3 bg-background/85 px-3.5 backdrop-blur-md">
            <span className="text-[13px] font-medium">Home</span>
            <span className="hidden items-center gap-1.5 text-[12px] text-muted-foreground sm:inline-flex">
              <span className="animate-agent-pulse size-1.5 rounded-full bg-agent" />
              {live.length} workspace{live.length === 1 ? "" : "s"} active
            </span>
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

          <main className="px-3.5 pt-4 pb-10">
            <div className="mx-auto w-full max-w-5xl">
              {/* Greeting */}
              <div className="max-w-2xl">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">
                  Good afternoon, {VIEWER.name}
                </h1>
                <p className="mt-1.5 text-[14px] text-muted-foreground">
                  Six workspaces, eleven teammates, seven agents. Everything
                  below is a room you can walk into &mdash; people and models
                  work in the same document, and every edit says who made it.
                </p>
              </div>

              {/* Quick actions */}
              <div className="mt-6 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    className="group flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2.5 text-left shadow-sm transition-colors hover:border-foreground/20 hover:bg-accent/50"
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-secondary text-muted-foreground transition-colors group-hover:bg-agent-muted group-hover:text-agent">
                      <action.icon className="size-3.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-medium">
                        {action.label}
                      </span>
                      <span className="block truncate text-[11.5px] text-muted-foreground">
                        {action.hint}
                      </span>
                    </span>
                  </button>
                ))}
              </div>

              {/* Workspaces */}
              <section className="mt-9">
                <div className="flex items-center justify-between pb-3">
                  <h2 className="eyebrow">Your workspaces</h2>
                  <button
                    type="button"
                    className="text-[12px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    View all
                  </button>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2">
                  {WORKSPACES.map((ws) => (
                    <WorkspaceCard key={ws.id} workspace={ws} />
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

import { notFound } from "next/navigation";
import { Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { agentMascot } from "@/lib/avatars";
import { WORKSPACES, getWorkspace, AGENT_DETAILS } from "@/lib/data";

export function generateStaticParams() {
  return WORKSPACES.map((ws) => ({ id: ws.id }));
}

export default async function Page({ params }: PageProps<"/w/[id]/agents">) {
  const { id } = await params;
  const workspace = getWorkspace(id);

  if (!workspace) notFound();

  const agents = workspace.members.filter((m) => m.kind === "agent");

  return (
    <section className="flex flex-col gap-3">
      {agents.map((agent) => {
        const detail = AGENT_DETAILS[agent.id];
        const working = workspace.live?.actor === agent.name;

        return (
          <div
            key={agent.id}
            className="rounded-xl border border-border bg-background p-4"
          >
            <div className="flex items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={agentMascot(agent.id, 80)}
                alt=""
                aria-hidden
                className="size-10 shrink-0 rounded-lg ring-1 ring-agent/25 select-none"
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-[14px] font-medium">
                    {agent.name}
                  </h3>
                  <Badge
                    variant="secondary"
                    className="h-4 bg-agent/10 px-1.5 font-mono text-[10px] text-agent"
                  >
                    {agent.model}
                  </Badge>
                  {working && (
                    <span className="flex items-center gap-1.5 text-[11.5px] text-agent">
                      <span className="animate-agent-pulse size-1.5 rounded-full bg-agent" />
                      working
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                  {detail?.scope}
                </p>
              </div>

              <Button variant="outline" size="xs">
                Configure
              </Button>
            </div>

            {detail && (
              <>
                <Separator className="my-3.5" />

                <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                  <div>
                    <span className="eyebrow block">Can</span>
                    <span className="mt-1 flex flex-wrap gap-1">
                      {detail.permissions.map((permission) => (
                        <Badge
                          key={permission}
                          variant="outline"
                          className="h-5 text-[10.5px] font-normal"
                        >
                          {permission}
                        </Badge>
                      ))}
                    </span>
                  </div>

                  <div className="ml-auto flex items-center gap-8 text-right">
                    <div>
                      <span className="eyebrow block">Runs</span>
                      <span className="mt-1 block text-[14px] font-medium tabular-nums">
                        {detail.runs}
                      </span>
                    </div>
                    <div>
                      <span className="eyebrow block">Accepted</span>
                      <span
                        className={cn(
                          "mt-1 block text-[14px] font-medium tabular-nums",
                          detail.accepted >= 85 ? "text-online" : "text-foreground"
                        )}
                      >
                        {detail.accepted}%
                      </span>
                    </div>
                    <div>
                      <span className="eyebrow block">Last run</span>
                      <span className="mt-1 block text-[13px] whitespace-nowrap text-muted-foreground">
                        {detail.lastRun}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      })}

      <Button variant="outline" size="sm" className="w-fit">
        <Plus />
        Add an agent
      </Button>
    </section>
  );
}

import Link from "next/link";
import { FileText, Bot } from "lucide-react";

import { Card } from "@/components/ui/card";
import { MemberStack } from "@/components/home/member-stack";
import type { Workspace } from "@/lib/data";

export function WorkspaceCard({ workspace }: { workspace: Workspace }) {
  const agents = workspace.members.filter((m) => m.kind === "agent");

  return (
    <Card className="relative shadow-sm transition-colors hover:border-foreground/20 hover:bg-accent/40">
      <Link
        href={`/w/${workspace.id}`}
        className="absolute inset-0 rounded-[inherit] focus-visible:ring-3 focus-visible:ring-ring/40 outline-none"
      >
        <span className="sr-only">Open {workspace.name}</span>
      </Link>

      <div className="pointer-events-none flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-base">
            {workspace.icon}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-medium">{workspace.name}</h3>
              {workspace.unread > 0 && (
                <span className="shrink-0 rounded-full bg-agent/12 px-1.5 py-0.5 text-[10px] font-medium text-agent tabular-nums">
                  {workspace.unread} new
                </span>
              )}
            </div>
            <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-muted-foreground">
              {workspace.purpose}
            </p>
          </div>
        </div>

        {/* The live line is the whole point of the product — give it its own row. */}
        {workspace.live ? (
          <div className="flex items-center gap-2 rounded-lg bg-agent-muted/60 px-2.5 py-1.5 text-[12px] text-agent">
            <span className="relative flex size-1.5 shrink-0">
              <span className="animate-agent-pulse absolute inline-flex size-full rounded-full bg-agent" />
            </span>
            <span className="truncate">
              <span className="font-medium">{workspace.live.actor}</span> is{" "}
              {workspace.live.doing}
            </span>
          </div>
        ) : (
          <div className="h-[30px]" aria-hidden />
        )}

        <div className="mt-auto flex items-center justify-between border-t border-border/70 pt-3">
          <div className="pointer-events-auto">
            <MemberStack members={workspace.members} />
          </div>
          <div className="flex items-center gap-3 text-[11.5px] text-muted-foreground tabular-nums">
            <span className="inline-flex items-center gap-1">
              <FileText className="size-3" />
              {workspace.docs}
            </span>
            <span className="inline-flex items-center gap-1">
              <Bot className="size-3" />
              {agents.length}
            </span>
            <span>{workspace.updatedAt}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

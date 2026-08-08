import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { MemberStack } from "@/components/home/member-stack";
import { WorkspaceMark } from "@/components/home/workspace-mark";
import type { Workspace } from "@/lib/data";

export function WorkspaceRow({ workspace }: { workspace: Workspace }) {
  const agents = workspace.members.filter((m) => m.kind === "agent");

  return (
    <div className="group relative">
      <Link
        href={`/w/${workspace.id}`}
        className="absolute inset-0 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
      >
        <span className="sr-only">Open {workspace.name}</span>
      </Link>

      <div className="pointer-events-none flex items-center gap-3 rounded-lg px-2.5 py-2.5 transition-colors group-hover:bg-accent/60">
        <WorkspaceMark seed={workspace.id} className="size-8" />

        <div className="min-w-0 basis-[16rem] shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[13.5px] font-medium">
              {workspace.name}
            </span>
            {workspace.unread > 0 && (
              <Badge
                variant="secondary"
                className="h-4 shrink-0 bg-agent/10 px-1.5 text-[10px] text-agent tabular-nums"
              >
                {workspace.unread}
              </Badge>
            )}
          </div>
          <span className="block truncate text-[12px] text-muted-foreground">
            {workspace.purpose}
          </span>
        </div>

        <div className="pointer-events-auto ml-auto hidden sm:block">
          <MemberStack members={workspace.members} ringClass="ring-sidebar" />
        </div>

        <span className="hidden w-24 shrink-0 text-right text-[11.5px] text-muted-foreground tabular-nums md:block">
          {workspace.docs} docs · {agents.length}
        </span>

        <span className="w-20 shrink-0 text-right text-[11.5px] whitespace-nowrap text-muted-foreground">
          {workspace.updatedAt}
        </span>

        <ChevronRight className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </div>
  );
}

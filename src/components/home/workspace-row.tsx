import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { WorkspaceMark } from "@/components/home/workspace-mark";
import type { Workspace } from "@/lib/types";

export function WorkspaceRow({ workspace }: { workspace: Workspace }) {
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

        <div className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] font-medium">
            {workspace.name}
          </span>
          <span className="block truncate text-[12px] text-muted-foreground">
            {workspace.purpose ?? "No description yet"}
          </span>
        </div>

        <span className="w-24 shrink-0 text-right text-[11.5px] whitespace-nowrap text-muted-foreground">
          {new Date(workspace.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </span>

        <ChevronRight className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </div>
  );
}

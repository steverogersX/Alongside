import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";

import { CreateWorkspaceDialog } from "@/components/home/create-workspace-dialog";
import { WorkspaceMark } from "@/components/home/workspace-mark";
import type { Workspace } from "@/lib/types";

const TILE =
  "group relative flex min-h-[9.5rem] flex-col rounded-lg border border-border bg-background/60 p-4 text-left transition-colors hover:border-input hover:bg-background focus-visible:ring-3 focus-visible:ring-ring/35 focus-visible:outline-none";

/**
 * Workspaces are places, so they get a face and a footprint rather than a line
 * on a list. The mark is generated from the id, which means the same room
 * looks the same everywhere in the product.
 */
export function WorkspaceTile({ workspace }: { workspace: Workspace }) {
  return (
    <Link href={`/w/${workspace.id}`} className={TILE}>
      <div className="flex items-start justify-between gap-2">
        <WorkspaceMark seed={workspace.id} size={40} className="size-10" />
        <ArrowUpRight
          className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden
        />
      </div>

      <span className="mt-3.5 truncate text-[14.5px] font-semibold tracking-[-0.012em]">
        {workspace.name}
      </span>

      <span className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">
        {workspace.purpose ?? "No description yet"}
      </span>

      <time
        dateTime={workspace.createdAt}
        className="datum mt-auto pt-4 text-muted-foreground/80"
      >
        Created{" "}
        {new Date(workspace.createdAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })}
      </time>
    </Link>
  );
}

/** The primary action, given the same footprint as the things it creates. */
export function NewWorkspaceTile() {
  return (
    <CreateWorkspaceDialog
      trigger={
        <button
          type="button"
          className={`${TILE} cursor-pointer items-center justify-center border-dashed bg-transparent hover:bg-accent/35`}
        >
          <span className="grid size-10 place-items-center rounded-md border border-dashed border-input text-muted-foreground transition-colors group-hover:border-ring group-hover:text-foreground">
            <Plus className="size-4" strokeWidth={1.75} />
          </span>
          <span className="mt-3 text-[13.5px] font-medium">New workspace</span>
          <span className="mt-1 text-[12.5px] text-muted-foreground">
            Name it and say what it&rsquo;s for
          </span>
        </button>
      }
    />
  );
}

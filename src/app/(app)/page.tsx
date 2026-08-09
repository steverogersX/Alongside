"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Shell } from "@/components/shell";
import { SectionHead } from "@/components/section-head";
import { Dateline, Greeting } from "@/components/home/clock";
import { CreateWorkspaceDialog } from "@/components/home/create-workspace-dialog";
import { EmptyWorkspaces } from "@/components/home/empty-workspaces";
import { RecentDocuments } from "@/components/home/recent-documents";
import {
  NewWorkspaceTile,
  WorkspaceTile,
} from "@/components/home/workspace-row";
import { TilesSkeleton } from "@/components/skeletons";
import { useRecentDocuments, useSession, useWorkspaces } from "@/lib/queries";

export default function Page() {
  const session = useSession();
  const workspaces = useWorkspaces();
  const recent = useRecentDocuments();

  const list = workspaces.data?.workspaces ?? [];
  const isEmpty = !workspaces.isPending && list.length === 0;
  const lastEdit = recent.data?.documents[0]?.updatedAt;

  return (
    <Shell
      crumbs={[{ label: "Home" }]}
      actions={
        <CreateWorkspaceDialog
          trigger={
            <Button size="sm">
              <Plus />
              New workspace
            </Button>
          }
        />
      }
    >
      <main className="px-6 pt-8 pb-16 sm:px-10">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
          <header className="animate-rise flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
            <div>
              <Dateline />
              <Greeting name={session.data?.user.displayName} />
            </div>

            {!isEmpty && (
              <p className="datum flex items-center gap-2 pb-1 text-muted-foreground">
                <span>
                  {list.length} {list.length === 1 ? "workspace" : "workspaces"}
                </span>
                {lastEdit && (
                  <>
                    <span aria-hidden className="text-border">
                      /
                    </span>
                    <span>last edit {ago(lastEdit)}</span>
                  </>
                )}
              </p>
            )}
          </header>

          {isEmpty ? (
            <EmptyWorkspaces />
          ) : (
            <>
              <RecentDocuments />

              <section>
                <SectionHead label="Workspaces" count={list.length} />

                {workspaces.isPending ? (
                  <TilesSkeleton tiles={3} />
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {list.map((workspace) => (
                      <WorkspaceTile key={workspace.id} workspace={workspace} />
                    ))}
                    <NewWorkspaceTile />
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </Shell>
  );
}

/** Short enough to sit in a running line of data. */
function ago(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)}h ago`;
  return `${Math.round(minutes / (60 * 24))}d ago`;
}

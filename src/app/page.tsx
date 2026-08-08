"use client";

import { Plus, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Shell, ShellHeader } from "@/components/shell";
import { Clock } from "@/components/home/clock";
import { CreateWorkspaceDialog } from "@/components/home/create-workspace-dialog";
import { EmptyWorkspaces } from "@/components/home/empty-workspaces";
import { WorkspaceRow } from "@/components/home/workspace-row";
import { useSession, useWorkspaces } from "@/lib/queries";

export default function Page() {
  const session = useSession();
  const workspaces = useWorkspaces();

  const list = workspaces.data?.workspaces ?? [];
  const isEmpty = !workspaces.isPending && list.length === 0;

  return (
    <Shell activeNav="Home">
      <ShellHeader>
        <span className="text-[13px] font-medium">Home</span>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm">
            <UserPlus />
            Invite
          </Button>
          <CreateWorkspaceDialog
            trigger={
              <Button size="sm">
                <Plus />
                New workspace
              </Button>
            }
          />
        </div>
      </ShellHeader>

      <main className="px-6 pt-6 pb-12">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-9">
          <div>
            <h1 className="text-[26px] font-semibold tracking-tight">
              Welcome back, {session.data?.user.displayName ?? ""}
            </h1>
            <Clock />
          </div>

          {isEmpty ? (
            <EmptyWorkspaces />
          ) : (
            <section>
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <h2 className="eyebrow">Your workspaces</h2>
                <span className="text-[12px] text-muted-foreground tabular-nums">
                  {list.length}
                </span>
              </div>

              {workspaces.isPending ? (
                <p className="py-6 text-[13px] text-muted-foreground">
                  Loading…
                </p>
              ) : (
                <div className="divide-y divide-border/60">
                  {list.map((workspace) => (
                    <WorkspaceRow key={workspace.id} workspace={workspace} />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </Shell>
  );
}

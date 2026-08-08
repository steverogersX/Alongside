"use client";

import { useState } from "react";
import { Plus, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shell, ShellHeader } from "@/components/shell";
import { Clock } from "@/components/home/clock";
import { EmptyWorkspaces } from "@/components/home/empty-workspaces";
import { WorkspaceRow } from "@/components/home/workspace-row";
import { useCreateWorkspace, useSession, useWorkspaces } from "@/lib/queries";

export default function Page() {
  const session = useSession();
  const workspaces = useWorkspaces();
  const createWorkspace = useCreateWorkspace();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

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
          <Button size="sm" onClick={() => setCreating((open) => !open)}>
            <Plus />
            New workspace
          </Button>
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

          {isEmpty && !creating ? (
            <EmptyWorkspaces />
          ) : (
            <section>
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <h2 className="eyebrow">Your workspaces</h2>
                <span className="text-[12px] text-muted-foreground tabular-nums">
                  {list.length}
                </span>
              </div>

              {creating && (
                <form
                  className="flex items-center gap-2 py-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!name.trim()) return;
                    createWorkspace.mutate(
                      { name: name.trim() },
                      {
                        onSuccess: () => {
                          setName("");
                          setCreating(false);
                        },
                      }
                    );
                  }}
                >
                  <Input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Workspace name"
                    aria-label="Workspace name"
                    autoFocus
                    className="h-8 max-w-xs"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={createWorkspace.isPending}
                  >
                    {createWorkspace.isPending ? "Creating…" : "Create"}
                  </Button>
                </form>
              )}

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

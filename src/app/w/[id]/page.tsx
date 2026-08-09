"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Bot, ChevronRight, FileText, FolderX, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Shell, ShellHeader, ShellRail } from "@/components/shell";
import { EmptyState } from "@/components/empty-state";
import { DocStatus } from "@/components/doc/doc-status";
import { MemberStack } from "@/components/home/member-stack";
import { WorkspaceMark } from "@/components/home/workspace-mark";
import {
  PeopleSkeleton,
  RowsSkeleton,
  WorkspaceHeaderSkeleton,
} from "@/components/skeletons";
import { personAvatar } from "@/lib/avatars";
import { useCreateDocument, useWorkspace } from "@/lib/queries";

export default function WorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const workspace = useWorkspace(id);
  const createDocument = useCreateDocument(id);
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const detail = workspace.data;
  const members = detail?.members ?? [];
  const humans = members.filter((row) => row.user.kind === "human");
  const agents = members.filter((row) => row.user.kind === "bot");

  return (
    <Shell activeNav="" activeWorkspaceId={id} rail={<Rail id={id} />}>
      <ShellHeader>
        <Link
          href="/"
          className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          Workspaces
        </Link>
        <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/50" />
        <span className="truncate text-[13px] font-medium">
          {detail?.workspace.name ?? "…"}
        </span>

        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" onClick={() => setCreating((open) => !open)}>
            <Plus />
            New doc
          </Button>
        </div>
      </ShellHeader>

      <main className="px-6 pt-6 pb-12">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          {workspace.isPending ? (
            <>
              <WorkspaceHeaderSkeleton />
              <div>
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <h2 className="eyebrow">Documents</h2>
                </div>
                <RowsSkeleton rows={3} />
              </div>
            </>
          ) : !detail ? (
            <EmptyState
              icon={FolderX}
              title="Workspace not available"
              body="It may have been removed, or your access to it revoked."
              action={
                <Button asChild size="sm" variant="outline">
                  <Link href="/">Back to workspaces</Link>
                </Button>
              }
            />
          ) : (
            <>
              <div className="flex items-start gap-4">
                <WorkspaceMark
                  seed={detail.workspace.id}
                  size={48}
                  className="size-12 rounded-xl"
                />
                <div className="min-w-0 flex-1">
                  <h1 className="text-[22px] font-semibold tracking-tight">
                    {detail.workspace.name}
                  </h1>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    {detail.workspace.purpose ?? "No description yet"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <MemberStack
                  members={members.map((row) => row.user)}
                  max={6}
                  ringClass="ring-sidebar"
                />
                <span className="text-[12px] text-muted-foreground">
                  {humans.length} {humans.length === 1 ? "person" : "people"} ·{" "}
                  {agents.length} {agents.length === 1 ? "agent" : "agents"} ·
                  you can {detail.role === "viewer" ? "read" : "edit"}
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <h2 className="eyebrow">Documents</h2>
                  <span className="text-[12px] text-muted-foreground tabular-nums">
                    {detail.documents.length}
                  </span>
                </div>

                {creating && (
                  <form
                    className="flex items-center gap-2 py-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      if (!title.trim()) return;
                      createDocument.mutate(
                        { title: title.trim() },
                        {
                          onSuccess: () => {
                            setTitle("");
                            setCreating(false);
                          },
                        }
                      );
                    }}
                  >
                    <Input
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="Document title"
                      aria-label="Document title"
                      autoFocus
                      className="h-8 max-w-xs"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={createDocument.isPending}
                    >
                      {createDocument.isPending && <Spinner />}
                      Create
                    </Button>
                  </form>
                )}

                {detail.documents.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title="No documents yet"
                    body="Documents are where the work happens — people and agents write in them together."
                    action={
                      !creating && (
                        <Button size="sm" onClick={() => setCreating(true)}>
                          <Plus />
                          New doc
                        </Button>
                      )
                    }
                  />
                ) : (
                  <div className="divide-y divide-border/60">
                    {detail.documents.map((doc) => (
                      <div key={doc.id} className="group relative">
                        <Link
                          href={`/w/${id}/${doc.id}`}
                          className="absolute inset-0 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
                        >
                          <span className="sr-only">Open {doc.title}</span>
                        </Link>
                        <div className="pointer-events-none flex items-center gap-3 rounded-lg px-2.5 py-3 transition-colors group-hover:bg-accent/60">
                          <FileText className="size-4 shrink-0 text-muted-foreground" />
                          <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium">
                            {doc.title}
                          </span>
                          <DocStatus status={doc.status} />
                          <span className="w-24 shrink-0 text-right text-[11.5px] whitespace-nowrap text-muted-foreground">
                            {new Date(doc.updatedAt).toLocaleDateString(
                              undefined,
                              { month: "short", day: "numeric" }
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </Shell>
  );
}

function Rail({ id }: { id: string }) {
  const workspace = useWorkspace(id);
  const members = workspace.data?.members ?? [];
  const humans = members.filter((row) => row.user.kind === "human");
  const agents = members.filter((row) => row.user.kind === "bot");

  if (workspace.isPending) {
    return (
      <ShellRail>
        <h2 className="eyebrow pb-3">People</h2>
        <PeopleSkeleton rows={4} />

        <Separator className="my-4" />

        <h2 className="eyebrow pb-3">Agents</h2>
        <PeopleSkeleton rows={2} />
      </ShellRail>
    );
  }

  return (
    <ShellRail>
      <h2 className="eyebrow pb-3">People</h2>
      <div className="flex flex-col gap-2.5">
        {humans.map((row) => (
          <div key={row.user.id} className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={personAvatar(row.user.avatarSeed, "human", 48)}
              alt=""
              aria-hidden
              className="size-6 shrink-0 rounded-full select-none"
            />
            <span className="min-w-0 flex-1 truncate text-[12.5px]">
              {row.user.displayName}
            </span>
            <span className="text-[11px] text-muted-foreground">{row.role}</span>
          </div>
        ))}
      </div>

      <Separator className="my-4" />

      <h2 className="eyebrow pb-3">Agents</h2>
      <div className="flex flex-col gap-2.5">
        {agents.length === 0 ? (
          <EmptyState
            size="sm"
            icon={Bot}
            title="No agents yet"
            body="Connect an agent and it joins here with a seat and a role."
            className="px-0"
          />
        ) : (
          agents.map((row) => (
            <div key={row.user.id} className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={personAvatar(row.user.avatarSeed, "agent", 48)}
                alt=""
                aria-hidden
                className="size-6 shrink-0 rounded-md ring-1 ring-agent/25 select-none"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-medium">
                  {row.user.displayName}
                </span>
                <span className="block truncate font-mono text-[11px] text-muted-foreground">
                  {row.user.model}
                </span>
              </span>
              <span className="text-[11px] text-muted-foreground">
                {row.role}
              </span>
            </div>
          ))
        )}
      </div>
    </ShellRail>
  );
}

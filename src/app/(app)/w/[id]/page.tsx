"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Bot,
  FileText,
  FolderX,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Shell, ShellRail } from "@/components/shell";
import { EmptyState } from "@/components/empty-state";
import { SectionHead } from "@/components/section-head";
import { AgentsDialog } from "@/components/workspace/agents-dialog";
import { DeleteWorkspaceDialog } from "@/components/workspace/delete-workspace-dialog";
import { DeleteDocumentDialog } from "@/components/doc/delete-document-dialog";
import { DocStatus } from "@/components/doc/doc-status";
import { MemberStack } from "@/components/home/member-stack";
import { WorkspaceMark } from "@/components/home/workspace-mark";
import {
  PeopleSkeleton,
  RowsSkeleton,
  WorkspaceHeaderSkeleton,
} from "@/components/skeletons";
import { AgentAvatar } from "@/components/workspace/agent-avatar";
import { personAvatar } from "@/lib/avatars";
import { useCreateDocument, useWorkspace } from "@/lib/queries";
import type { DocumentSummary } from "@/lib/types";

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
  const [deleting, setDeleting] = useState(false);

  const detail = workspace.data;
  const members = detail?.members ?? [];
  const humans = members.filter((row) => row.user.kind === "human");
  const agents = members.filter((row) => row.user.kind === "bot");
  const isAdmin = detail?.role === "admin";

  return (
    <Shell
      rail={<Rail id={id} />}
      railLabel="people"
      crumbs={[
        { label: "Home", href: "/" },
        { label: detail?.workspace.name ?? "…" },
      ]}
      actions={
        <>
          <AgentsDialog
            workspaceId={id}
            trigger={
              <Button variant="ghost" size="sm">
                <Bot />
                Agents
              </Button>
            }
          />
          <Button size="sm" onClick={() => setCreating((open) => !open)}>
            <Plus />
            New doc
          </Button>

          {isAdmin && detail && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Workspace options"
                  >
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onSelect={() => setDeleting(true)}
                    className="text-destructive data-highlighted:bg-destructive/10 data-highlighted:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                    Delete workspace
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DeleteWorkspaceDialog
                workspaceId={id}
                name={detail.workspace.name}
                documentCount={detail.documents.length}
                open={deleting}
                onOpenChange={setDeleting}
              />
            </>
          )}
        </>
      }
    >
      <main className="px-6 pt-8 pb-16 sm:px-10">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
          {workspace.isPending ? (
            <>
              <WorkspaceHeaderSkeleton />
              <div>
                <SectionHead label="Documents" />
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
              <header className="animate-rise">
                <div className="flex items-start gap-4">
                  <WorkspaceMark
                    seed={detail.workspace.id}
                    size={52}
                    className="mt-1 size-13 rounded-lg"
                  />
                  <div className="min-w-0 flex-1">
                    <h1 className="display text-[30px]">
                      {detail.workspace.name}
                    </h1>
                    <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-muted-foreground">
                      {detail.workspace.purpose ?? "No description yet."}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <MemberStack
                    members={members.map((row) => row.user)}
                    max={6}
                    ringClass="ring-card"
                  />
                  <p className="datum flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground">
                    <span>
                      {humans.length} {humans.length === 1 ? "person" : "people"}
                    </span>
                    <span aria-hidden className="text-border">
                      /
                    </span>
                    <span>
                      {agents.length} {agents.length === 1 ? "agent" : "agents"}
                    </span>
                    <span aria-hidden className="text-border">
                      /
                    </span>
                    <span>
                      you can {detail.role === "viewer" ? "read" : "edit"}
                    </span>
                  </p>
                </div>
              </header>

              <section>
                <SectionHead
                  label="Documents"
                  count={detail.documents.length}
                />

                {creating && (
                  <form
                    className="mb-1 flex items-center gap-2 pb-4"
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
                      className="max-w-sm"
                    />
                    <Button type="submit" disabled={createDocument.isPending}>
                      {createDocument.isPending && <Spinner />}
                      Create
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setCreating(false)}
                    >
                      Cancel
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
                        <Button onClick={() => setCreating(true)}>
                          <Plus />
                          New doc
                        </Button>
                      )
                    }
                  />
                ) : (
                  <div className="flex flex-col border-t border-border/70">
                    {detail.documents.map((doc) => (
                      <DocumentRow
                        key={doc.id}
                        workspaceId={id}
                        doc={doc}
                        canDelete={isAdmin}
                      />
                    ))}
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

/**
 * The whole row is one big link, so the delete button has to sit above it and
 * take its own clicks back — otherwise pressing it would open the document.
 */
function DocumentRow({
  workspaceId,
  doc,
  canDelete,
}: {
  workspaceId: string;
  doc: DocumentSummary;
  canDelete: boolean;
}) {
  const [deleting, setDeleting] = useState(false);

  return (
    <div className="group relative border-b border-border/70">
      <Link
        href={`/w/${workspaceId}/${doc.id}`}
        className="absolute inset-0 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/35"
      >
        <span className="sr-only">Open {doc.title}</span>
      </Link>

      <div className="pointer-events-none relative flex items-center gap-3.5 rounded-md py-3.5 pr-2 pl-4 transition-colors group-hover:bg-accent/45">
        <span
          aria-hidden
          className="absolute inset-y-3 left-0 w-[3px] rounded-full bg-primary opacity-0 transition-opacity group-hover:opacity-100"
        />

        <FileText
          className="size-4 shrink-0 text-muted-foreground"
          strokeWidth={1.75}
        />

        <span className="min-w-0 flex-1 truncate text-[14px] font-semibold tracking-[-0.011em]">
          {doc.title}
        </span>

        <DocStatus status={doc.status} />

        <time
          dateTime={doc.updatedAt}
          className="datum hidden w-20 shrink-0 text-right whitespace-nowrap text-muted-foreground sm:block"
        >
          {new Date(doc.updatedAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </time>

        {canDelete && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${doc.title}`}
            onClick={() => setDeleting(true)}
            className="pointer-events-auto shrink-0 text-muted-foreground opacity-0 hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
          >
            <Trash2 />
          </Button>
        )}

        <ArrowUpRight
          className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden
        />
      </div>

      {canDelete && (
        <DeleteDocumentDialog
          documentId={doc.id}
          workspaceId={workspaceId}
          title={doc.title}
          open={deleting}
          onOpenChange={setDeleting}
        />
      )}
    </div>
  );
}

/** Who is in the room: people first, then the agents they can call on. */
function Rail({ id }: { id: string }) {
  const workspace = useWorkspace(id);
  const members = workspace.data?.members ?? [];
  const humans = members.filter((row) => row.user.kind === "human");
  const agents = members.filter((row) => row.user.kind === "bot");

  const addAgent = (
    <AgentsDialog
      workspaceId={id}
      trigger={
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Add an agent"
          className="shrink-0 text-muted-foreground"
        >
          <Plus />
        </Button>
      }
    />
  );

  if (workspace.isPending) {
    return (
      <ShellRail className="px-4 py-5">
        <SectionHead label="People" />
        <PeopleSkeleton rows={4} />
        <div className="pt-8">
          <SectionHead label="Agents" action={addAgent} />
          <PeopleSkeleton rows={2} />
        </div>
      </ShellRail>
    );
  }

  return (
    <ShellRail className="px-4 py-5">
      <SectionHead label="People" count={humans.length} />

      <div className="flex flex-col gap-3">
        {humans.map((row) => (
          <div key={row.user.id} className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={personAvatar(row.user.avatarSeed, "human", 48)}
              alt=""
              aria-hidden
              className="size-6.5 shrink-0 rounded-full select-none"
            />
            <span className="min-w-0 flex-1 truncate text-[13px]">
              {row.user.displayName}
            </span>
            <span className="datum shrink-0 text-muted-foreground">
              {row.role}
            </span>
          </div>
        ))}
      </div>

      <div className="pt-8">
        <SectionHead label="Agents" count={agents.length} action={addAgent} />

        <div className="flex flex-col gap-3">
          {agents.length === 0 ? (
            <EmptyState
              size="sm"
              icon={Bot}
              title="No agents yet"
              body="Add one with your own provider key, then anyone here can bring it into a document with @."
              className="px-0"
              action={
                <AgentsDialog
                  workspaceId={id}
                  trigger={
                    <Button variant="outline" size="sm">
                      <Plus />
                      Add an agent
                    </Button>
                  }
                />
              }
            />
          ) : (
            agents.map((row) => (
              <div key={row.user.id} className="flex items-center gap-2.5">
                <AgentAvatar
                  provider={row.user.provider}
                  seed={row.user.avatarSeed}
                  className="size-6.5 rounded-md"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium">
                    {row.user.displayName}
                  </span>
                  <span className="datum block truncate text-muted-foreground">
                    {row.user.model}
                  </span>
                </span>
                <span className="datum shrink-0 text-muted-foreground">
                  {row.role}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </ShellRail>
  );
}

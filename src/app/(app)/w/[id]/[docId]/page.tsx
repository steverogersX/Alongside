"use client";

import { use, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, MoreHorizontal, Share2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Shell, ShellRail } from "@/components/shell";
import { DeleteDocumentDialog } from "@/components/doc/delete-document-dialog";
import { DocumentView } from "@/components/doc/document-view";
import { DocPanel } from "@/components/doc/doc-panel";
import { ShareDialog } from "@/components/doc/share-dialog";
import { AgentsDialog } from "@/components/workspace/agents-dialog";
import { useDocumentEvents } from "@/lib/collab";
import { useDocument, useWorkspace } from "@/lib/queries";

export default function DocumentPage({
  params,
}: {
  params: Promise<{ id: string; docId: string }>;
}) {
  const { id, docId } = use(params);
  const router = useRouter();
  const workspace = useWorkspace(id);
  const document = useDocument(docId);
  const [deleting, setDeleting] = useState(false);

  const canShare =
    document.data?.role === "editor" || document.data?.role === "admin";
  const canDelete = document.data?.role === "admin";

  // Someone else deleted this out from under us — the socket is about to be
  // closed, so leave before the editor is writing into nothing.
  const onEvent = useCallback(
    (event: string) => {
      if (event === "deleted") router.replace(`/w/${id}`);
    },
    [router, id]
  );

  useDocumentEvents(docId, Boolean(document.data), onEvent);

  return (
    <Shell
      rail={
        <ShellRail className="p-0">
          <DocPanel documentId={docId} />
        </ShellRail>
      }
      railLabel="chat"
      crumbs={[
        { label: workspace.data?.workspace.name ?? "Workspace", href: `/w/${id}` },
        { label: document.data?.document.title ?? "…" },
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
          {canShare && (
            <ShareDialog
              documentId={docId}
              trigger={
                <Button variant="outline" size="sm">
                  <Share2 />
                  Share
                </Button>
              }
            />
          )}
          {canDelete && document.data && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Document options"
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
                    Delete document
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DeleteDocumentDialog
                documentId={docId}
                workspaceId={id}
                title={document.data.document.title}
                open={deleting}
                onOpenChange={setDeleting}
                redirectTo={`/w/${id}`}
              />
            </>
          )}
        </>
      }
    >
      <main className="flex min-h-0 flex-1 flex-col px-6 pt-10 sm:px-10">
        <div className="mx-auto flex w-full max-w-[42rem] flex-1 flex-col pb-24">
          <DocumentView documentId={docId} />
        </div>
      </main>
    </Shell>
  );
}

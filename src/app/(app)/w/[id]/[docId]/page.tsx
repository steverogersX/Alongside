"use client";

import { use } from "react";
import { Bot, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Shell, ShellRail } from "@/components/shell";
import { DocumentView } from "@/components/doc/document-view";
import { DocPanel } from "@/components/doc/doc-panel";
import { ShareDialog } from "@/components/doc/share-dialog";
import { AgentsDialog } from "@/components/workspace/agents-dialog";
import { useDocument, useWorkspace } from "@/lib/queries";

export default function DocumentPage({
  params,
}: {
  params: Promise<{ id: string; docId: string }>;
}) {
  const { id, docId } = use(params);
  const workspace = useWorkspace(id);
  const document = useDocument(docId);

  const canShare =
    document.data?.role === "editor" || document.data?.role === "admin";

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

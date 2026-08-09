"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronRight, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Shell, ShellHeader, ShellRail } from "@/components/shell";
import { DocumentView } from "@/components/doc/document-view";
import { DocPanel } from "@/components/doc/doc-panel";
import { ShareDialog } from "@/components/doc/share-dialog";
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
      activeNav=""
      activeWorkspaceId={id}
      rail={
        <ShellRail className="p-0">
          <DocPanel documentId={docId} />
        </ShellRail>
      }
    >
      <ShellHeader>
        <Link
          href={`/w/${id}`}
          className="truncate text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          {workspace.data?.workspace.name ?? "Workspace"}
        </Link>
        <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/50" />
        <span className="truncate text-[13px] font-medium">
          {document.data?.document.title ?? "…"}
        </span>

        <div className="ml-auto flex items-center gap-3">
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
        </div>
      </ShellHeader>

      <main className="flex min-h-0 flex-1 flex-col px-6 pt-8">
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col pb-16">
          <DocumentView documentId={docId} />
        </div>
      </main>
    </Shell>
  );
}

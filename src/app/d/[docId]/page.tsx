"use client";

import { use } from "react";
import Link from "next/link";
import { Eye, Pencil } from "lucide-react";

import { TooltipProvider } from "@/components/ui/tooltip";
import { DocumentView } from "@/components/doc/document-view";
import { PresenceBar } from "@/components/doc/presence-bar";
import { useDocument } from "@/lib/queries";

export default function SharedDocumentPage({
  params,
}: {
  params: Promise<{ docId: string }>;
}) {
  const { docId } = use(params);
  const document = useDocument(docId);

  const role = document.data?.role;
  const viaLink = document.data?.via === "link";
  const isMember = document.data?.via === "member";

  return (
    <TooltipProvider>
      <div className="flex h-svh flex-col">
        <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border px-4">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-md bg-foreground text-[11px] font-semibold text-background">
              A
            </span>
            <span className="text-[13px] font-medium">Alongside</span>
          </Link>

          {viaLink && (
            <span className="flex items-center gap-1.5 rounded-full bg-secondary px-2 py-0.5 text-[11.5px] text-muted-foreground">
              {role === "editor" ? (
                <Pencil className="size-3" />
              ) : (
                <Eye className="size-3" />
              )}
              Shared with you · {role === "editor" ? "can edit" : "read only"}
            </span>
          )}

          <span className="ml-auto flex items-center gap-3">
            <PresenceBar documentId={docId} ringClass="ring-background" />
          </span>

          {isMember && (
            <Link
              href={`/w/${document.data?.document.workspaceId}/${docId}`}
              className="text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
            >
              Open in workspace
            </Link>
          )}
        </header>

        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pt-10">
          <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col pb-16">
            <DocumentView documentId={docId} />
          </div>
        </main>

        {viaLink && (
          <footer className="shrink-0 border-t border-border px-4 py-2.5 text-center text-[11.5px] text-muted-foreground">
            You&rsquo;re viewing a shared document. Chat and agent activity stay
            with the workspace team.
          </footer>
        )}
      </div>
    </TooltipProvider>
  );
}

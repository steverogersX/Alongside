"use client";

import { use } from "react";
import Link from "next/link";
import { Eye, Pencil } from "lucide-react";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Logo } from "@/components/logo";
import { DocChat } from "@/components/doc/doc-chat";
import { DocumentView } from "@/components/doc/document-view";
import { useChatAccess, useDocument } from "@/lib/queries";

/**
 * The same paper as inside the app, minus the navigation — someone arriving on
 * a share link has exactly one thing to do here.
 */
export default function SharedDocumentPage({
  params,
}: {
  params: Promise<{ docId: string }>;
}) {
  const { docId } = use(params);
  const document = useDocument(docId);
  const access = useChatAccess(docId);

  const role = document.data?.role;
  const viaLink = document.data?.via === "link";
  const isMember = document.data?.via === "member";
  const hasChat = access.data !== undefined && access.data.chat !== "none";

  return (
    <TooltipProvider>
      <div className="blueprint flex h-svh flex-col bg-background">
        <header className="flex h-14 shrink-0 items-center gap-3 px-4">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <Logo />
            <span className="text-[15px] font-semibold tracking-[-0.02em]">
              Alongside
            </span>
          </Link>

          {viaLink && (
            <span className="datum flex items-center gap-1.5 rounded-[4px] border border-border bg-card px-2 py-1 text-muted-foreground">
              {role === "editor" ? (
                <Pencil className="size-3" />
              ) : (
                <Eye className="size-3" />
              )}
              Shared with you / {role === "editor" ? "can edit" : "read only"}
            </span>
          )}

          {isMember && (
            <Link
              href={`/w/${document.data?.document.workspaceId}/${docId}`}
              className="ml-auto text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              Open in workspace
            </Link>
          )}
        </header>

        <div className="flex min-h-0 flex-1 gap-2 px-2 pb-2 sm:px-3 sm:pb-3">
          <main className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-xl border border-border bg-card px-6 pt-10 shadow-sm sm:px-10">
            <div className="mx-auto flex w-full max-w-[42rem] flex-1 flex-col pb-24">
              <DocumentView documentId={docId} />
            </div>
          </main>

          {hasChat && (
            <aside className="hidden w-[22rem] shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm lg:flex">
              <div className="shrink-0 border-b border-border/70 px-4 py-3.5">
                <span className="eyebrow">Chat</span>
              </div>
              <DocChat documentId={docId} />
            </aside>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

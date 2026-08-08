"use client";

import { use, useCallback } from "react";
import Link from "next/link";
import { ChevronRight, Share2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shell, ShellHeader, ShellRail } from "@/components/shell";
import { DocEditor } from "@/components/doc/doc-editor";
import { DocPanel } from "@/components/doc/doc-panel";
import { useDocument, useSaveDocument, useWorkspace } from "@/lib/queries";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  draft: "draft",
  in_review: "in review",
  final: "final",
};

export default function DocumentPage({
  params,
}: {
  params: Promise<{ id: string; docId: string }>;
}) {
  const { id, docId } = use(params);
  const workspace = useWorkspace(id);
  const document = useDocument(docId);
  const save = useSaveDocument(docId);

  const handleSave = useCallback(
    (content: unknown) => save.mutate({ content }),
    [save]
  );

  const doc = document.data?.document;
  const role = document.data?.role;
  const canEdit = role === "editor" || role === "admin";

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
          {doc?.title ?? "…"}
        </span>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Share2 />
            Share
          </Button>
        </div>
      </ShellHeader>

      <main className="flex min-h-0 flex-1 flex-col px-6 pt-8">
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col pb-16">
          {document.isPending ? (
            <p className="text-[13px] text-muted-foreground">Loading…</p>
          ) : !doc ? (
            <p className="text-[13px] text-muted-foreground">
              That document is not available.
            </p>
          ) : (
            <>
              <h1 className="font-serif text-[28px] leading-tight font-semibold tracking-tight">
                {doc.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Badge
                  variant="ghost"
                  className={cn(
                    "h-4 px-0 text-[11px]",
                    doc.status === "final"
                      ? "text-online"
                      : "text-muted-foreground"
                  )}
                >
                  {STATUS_LABEL[doc.status]}
                </Badge>
                <span className="text-[12px] text-muted-foreground">
                  Edited{" "}
                  {new Date(doc.updatedAt).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
                {!canEdit && (
                  <span className="text-[12px] text-muted-foreground">
                    Read only
                  </span>
                )}
              </div>

              <div className="mt-6 flex flex-1 flex-col">
                <DocEditor
                  key={doc.id}
                  content={doc.content}
                  editable={canEdit}
                  onSave={handleSave}
                  saving={save.isPending}
                />
              </div>
            </>
          )}
        </div>
      </main>
    </Shell>
  );
}

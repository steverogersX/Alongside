"use client";

import { useCallback } from "react";

import { Badge } from "@/components/ui/badge";
import { DocEditor } from "@/components/doc/doc-editor";
import { DocumentSkeleton } from "@/components/skeletons";
import { useDocument, useSaveDocument } from "@/lib/queries";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  draft: "draft",
  in_review: "in review",
  final: "final",
};

export function DocumentView({ documentId }: { documentId: string }) {
  const document = useDocument(documentId);
  const save = useSaveDocument(documentId);

  const handleSave = useCallback(
    (content: unknown) => save.mutate({ content }),
    [save]
  );

  const doc = document.data?.document;
  const role = document.data?.role;
  const canEdit = role === "editor" || role === "admin";

  if (document.isPending) return <DocumentSkeleton />;

  if (!doc) {
    return (
      <p className="text-[13px] text-muted-foreground">
        That document is not available. The link may have been revoked or
        expired.
      </p>
    );
  }

  return (
    <>
      <h1 className="font-serif text-[28px] leading-tight font-semibold tracking-tight">
        {doc.title}
      </h1>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Badge
          variant="ghost"
          className={cn(
            "h-4 px-0 text-[11px]",
            doc.status === "final" ? "text-online" : "text-muted-foreground"
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
          <span className="text-[12px] text-muted-foreground">Read only</span>
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
  );
}

"use client";

import { Badge } from "@/components/ui/badge";
import { CollabEditor } from "@/components/doc/collab-editor";
import { PresenceBar } from "@/components/doc/presence-bar";
import { DocumentSkeleton } from "@/components/skeletons";
import { useCollabSession } from "@/lib/collab";
import { useAwareness } from "@/lib/use-awareness";
import { useDocument } from "@/lib/queries";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  draft: "draft",
  in_review: "in review",
  final: "final",
};

export function DocumentView({ documentId }: { documentId: string }) {
  const document = useDocument(documentId);

  const doc = document.data?.document;
  const role = document.data?.role;
  const canEdit = role === "editor" || role === "admin";

  const { session, status } = useCollabSession(documentId, Boolean(doc));
  const viewers = useAwareness(session);

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

        {!canEdit && (
          <span className="text-[12px] text-muted-foreground">Read only</span>
        )}

        <span className="ml-auto">
          <PresenceBar viewers={viewers} />
        </span>
      </div>

      <div className="mt-6 flex flex-1 flex-col">
        {session ? (
          <CollabEditor
            session={session}
            editable={canEdit}
            seed={doc.content}
            connected={status === "connected"}
          />
        ) : (
          <DocumentSkeleton />
        )}
      </div>
    </>
  );
}

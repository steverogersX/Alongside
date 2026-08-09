"use client";

import { FileX } from "lucide-react";

import { CollabEditor } from "@/components/doc/collab-editor";
import { DocStatus } from "@/components/doc/doc-status";
import { EmptyState } from "@/components/empty-state";
import { PresenceBar } from "@/components/doc/presence-bar";
import { DocumentSkeleton } from "@/components/skeletons";
import { useCollabSession } from "@/lib/collab";
import { useAwareness } from "@/lib/use-awareness";
import { useDocument } from "@/lib/queries";

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
      <EmptyState
        icon={FileX}
        title="Document not available"
        body="The link may have been revoked or expired. Ask whoever shared it for a fresh one."
      />
    );
  }

  return (
    <>
      <h1 className="font-serif text-[28px] leading-tight font-semibold tracking-tight">
        {doc.title}
      </h1>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <DocStatus status={doc.status} />

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

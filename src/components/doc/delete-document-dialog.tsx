"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { ApiRequestError } from "@/lib/api";
import { useDeleteDocument } from "@/lib/queries";

/**
 * Owns the asking and the deleting; the call site owns the trigger, because a
 * row in a list and a menu on the document itself want to look nothing alike.
 */
export function DeleteDocumentDialog({
  documentId,
  workspaceId,
  title,
  open,
  onOpenChange,
  redirectTo,
}: {
  documentId: string;
  workspaceId?: string;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Where to land afterwards, when the deleted document is the page you are on. */
  redirectTo?: string;
}) {
  const router = useRouter();
  const deleteDocument = useDeleteDocument(workspaceId);
  const [error, setError] = useState<string | null>(null);

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setError(null);
      }}
      title={`Delete “${title}”?`}
      description="The text, its chat, and everything the agents did in it go with it. This cannot be undone."
      confirmLabel="Delete document"
      pending={deleteDocument.isPending}
      error={error}
      onConfirm={() => {
        setError(null);

        deleteDocument.mutate(documentId, {
          onSuccess: () => {
            onOpenChange(false);
            if (redirectTo) router.push(redirectTo);
          },
          onError: (cause) =>
            setError(
              cause instanceof ApiRequestError
                ? cause.message
                : "Could not reach the server"
            ),
        });
      }}
    />
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { ApiRequestError } from "@/lib/api";
import { useDeleteWorkspace } from "@/lib/queries";

export function DeleteWorkspaceDialog({
  workspaceId,
  name,
  documentCount,
  open,
  onOpenChange,
}: {
  workspaceId: string;
  name: string;
  documentCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const deleteWorkspace = useDeleteWorkspace();
  const [error, setError] = useState<string | null>(null);

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setError(null);
      }}
      title="Delete this workspace?"
      description={
        <>
          {documentCount === 0
            ? "Nobody will be able to reach this workspace again."
            : `All ${documentCount} ${documentCount === 1 ? "document" : "documents"} in here go with it — text, chat, and agent history — for everyone, not just you.`}{" "}
          This cannot be undone.
        </>
      }
      confirmLabel="Delete workspace"
      confirmPhrase={name}
      pending={deleteWorkspace.isPending}
      error={error}
      onConfirm={() => {
        setError(null);

        deleteWorkspace.mutate(workspaceId, {
          onSuccess: () => {
            onOpenChange(false);
            router.push("/");
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

"use client";

import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

type Props = {
  title: string;
  description: ReactNode;
  confirmLabel: string;
  confirmPhrase?: string;
  pending?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Deleting cannot be undone here — there is no trash to fish something back
 * out of — so the dialog says what goes with it, and anything that takes other
 * people's work down with it asks for the name to be typed out first.
 */
export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  ...props
}: Omit<Props, "onCancel"> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {/* The body is mounted with the dialog, so a half-typed name from the
            last time never carries over into the next thing being deleted. */}
        <Body {...props} onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function Body({
  title,
  description,
  confirmLabel,
  confirmPhrase,
  pending = false,
  error,
  onConfirm,
  onCancel,
}: Props) {
  const [typed, setTyped] = useState("");

  const armed =
    !confirmPhrase || typed.trim().toLowerCase() === confirmPhrase.toLowerCase();

  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>

      {confirmPhrase && (
        <form
          className="flex flex-col gap-1.5"
          onSubmit={(event) => {
            event.preventDefault();
            if (armed && !pending) onConfirm();
          }}
        >
          <label htmlFor="confirm-phrase" className="text-[12.5px] font-medium">
            Type{" "}
            <span className="font-mono text-[12px] text-foreground">
              {confirmPhrase}
            </span>{" "}
            to confirm
          </label>
          <Input
            id="confirm-phrase"
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            autoFocus
            autoComplete="off"
            className="h-9"
          />
        </form>
      )}

      {error && (
        <p role="alert" className="text-[12px] text-destructive">
          {error}
        </p>
      )}

      <DialogFooter>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={!armed || pending}
          onClick={onConfirm}
        >
          {pending && <Spinner />}
          {confirmLabel}
        </Button>
      </DialogFooter>
    </>
  );
}

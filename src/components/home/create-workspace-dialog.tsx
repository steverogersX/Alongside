"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ApiRequestError } from "@/lib/api";
import { useCreateWorkspace } from "@/lib/queries";

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Give the workspace a name")
    .max(80, "Keep it under 80 characters"),
  purpose: z.string().trim().max(300, "Keep it under 300 characters"),
});

export function CreateWorkspaceDialog({
  trigger,
  defaultName = "",
  defaultPurpose = "",
}: {
  trigger: ReactNode;
  defaultName?: string;
  defaultPurpose?: string;
}) {
  const router = useRouter();
  const createWorkspace = useCreateWorkspace();
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { name: defaultName, purpose: defaultPurpose },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      setFormError(null);

      try {
        const result = await createWorkspace.mutateAsync({
          name: value.name,
          ...(value.purpose ? { purpose: value.purpose } : {}),
        });

        setOpen(false);
        form.reset();
        router.push(`/w/${result.workspace.id}`);
      } catch (error) {
        setFormError(
          error instanceof ApiRequestError
            ? error.message
            : "Could not reach the server"
        );
      }
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          form.reset();
          setFormError(null);
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>New workspace</DialogTitle>
          <DialogDescription>
            A room for one piece of work — its documents, its people, and the
            agents that help with it.
          </DialogDescription>
        </DialogHeader>

        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <form.Field name="name">
            {(field) => {
              const error = field.state.meta.isTouched
                ? field.state.meta.errors[0]
                : undefined;
              const message =
                typeof error === "string" ? error : error?.message;

              return (
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor={field.name}
                    className="text-[12.5px] font-medium"
                  >
                    Name
                  </label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="Enterprise MSA"
                    autoFocus
                    aria-invalid={message ? true : undefined}
                    className="h-9"
                  />
                  {message && (
                    <p role="alert" className="text-[11.5px] text-destructive">
                      {message}
                    </p>
                  )}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="purpose">
            {(field) => {
              const error = field.state.meta.isTouched
                ? field.state.meta.errors[0]
                : undefined;
              const message =
                typeof error === "string" ? error : error?.message;

              return (
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor={field.name}
                    className="text-[12.5px] font-medium"
                  >
                    Purpose{" "}
                    <span className="font-normal text-muted-foreground">
                      optional
                    </span>
                  </label>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="What this room is for, in a sentence."
                    rows={3}
                    aria-invalid={message ? true : undefined}
                  />
                  {message ? (
                    <p role="alert" className="text-[11.5px] text-destructive">
                      {message}
                    </p>
                  ) : (
                    <p className="text-[11.5px] text-muted-foreground">
                      Shown under the workspace name at home.
                    </p>
                  )}
                </div>
              );
            }}
          </form.Field>

          {formError && (
            <p role="alert" className="text-[12px] text-destructive">
              {formError}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Creating…" : "Create workspace"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Plus } from "lucide-react";

import { Spinner } from "@/components/ui/spinner";
import { CreateWorkspaceDialog } from "@/components/home/create-workspace-dialog";
import { WorkspaceMark } from "@/components/home/workspace-mark";
import { useCreateWorkspace } from "@/lib/queries";

const TEMPLATES = [
  {
    seed: "template-contract",
    name: "Contract review",
    purpose: "Redlines, the counterparty thread, and what we conceded.",
  },
  {
    seed: "template-launch",
    name: "Launch plan",
    purpose: "Positioning, the checklist, and every gate before ship day.",
  },
  {
    seed: "template-research",
    name: "Research",
    purpose: "Teardowns, sources, and the weekly digest that comes out of them.",
  },
  {
    seed: "template-oncall",
    name: "Engineering",
    purpose: "Runbooks, incident notes, and on-call handoffs.",
  },
];

export function EmptyWorkspaces() {
  const router = useRouter();
  const createWorkspace = useCreateWorkspace();
  const [pending, setPending] = useState<string | null>(null);

  return (
    <section>
      <div className="border-b border-border pb-2.5">
        <h2 className="eyebrow">Get started</h2>
      </div>

      <p className="pt-4 pb-1 text-[13px] text-muted-foreground">
        You have no workspaces yet. Pick a starting point, or create your own —
        everything is editable afterwards.
      </p>

      <div className="divide-y divide-border/60">
        {TEMPLATES.map((template) => (
          <button
            key={template.name}
            type="button"
            disabled={pending !== null}
            onClick={() => {
              setPending(template.name);
              createWorkspace.mutate(
                { name: template.name, purpose: template.purpose },
                {
                  onSuccess: (result) =>
                    router.push(`/w/${result.workspace.id}`),
                  onSettled: () => setPending(null),
                }
              );
            }}
            className="group flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-3 text-left transition-colors hover:bg-accent/60 disabled:opacity-60"
          >
            <WorkspaceMark seed={template.seed} className="size-8" />

            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13.5px] font-medium">
                {template.name}
              </span>
              <span className="block truncate text-[12px] text-muted-foreground">
                {template.purpose}
              </span>
            </span>

            <span className="shrink-0 text-[11.5px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
              {pending === template.name && <Spinner />}
              Create
            </span>
            <ChevronRight className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        ))}

        <CreateWorkspaceDialog
          trigger={
            <button
              type="button"
              className="group flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-3 text-left transition-colors hover:bg-accent/60"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-dashed border-border text-muted-foreground">
                <Plus className="size-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-medium">
                  Start from scratch
                </span>
                <span className="block truncate text-[12px] text-muted-foreground">
                  Name it yourself and add a purpose.
                </span>
              </span>
              <ChevronRight className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          }
        />
      </div>

      {createWorkspace.isError && (
        <p role="alert" className="pt-3 text-[12px] text-destructive">
          {createWorkspace.error.message}
        </p>
      )}
    </section>
  );
}

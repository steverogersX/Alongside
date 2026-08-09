"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Plus } from "lucide-react";

import { Spinner } from "@/components/ui/spinner";
import { SectionHead } from "@/components/section-head";
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

const ROW =
  "group relative flex w-full cursor-pointer items-center gap-3.5 border-b border-border/70 py-3.5 pr-2 pl-4 text-left transition-colors last:border-b-0 hover:bg-accent/45 focus-visible:ring-3 focus-visible:ring-ring/35 focus-visible:outline-none disabled:cursor-default disabled:opacity-55";

export function EmptyWorkspaces() {
  const router = useRouter();
  const createWorkspace = useCreateWorkspace();
  const [pending, setPending] = useState<string | null>(null);

  return (
    <section>
      <SectionHead label="Start here" />

      <p className="max-w-lg pb-5 text-[13.5px] leading-relaxed text-muted-foreground">
        A workspace is a room: documents, the people who write them, and the
        agents you let in. Pick a starting point — every part of it stays
        editable.
      </p>

      <div className="flex flex-col border-t border-border/70">
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
            className={ROW}
          >
            <Spine />
            <WorkspaceMark seed={template.seed} size={36} className="size-9" />

            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-semibold tracking-[-0.011em]">
                {template.name}
              </span>
              <span className="mt-0.5 block truncate text-[12.5px] text-muted-foreground">
                {template.purpose}
              </span>
            </span>

            {pending === template.name ? (
              <Spinner className="size-4 shrink-0 text-muted-foreground" />
            ) : (
              <span className="datum shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                Create
              </span>
            )}
          </button>
        ))}

        <CreateWorkspaceDialog
          trigger={
            <button type="button" className={ROW}>
              <Spine />
              <span className="grid size-9 shrink-0 place-items-center rounded-md border border-dashed border-input text-muted-foreground">
                <Plus className="size-4" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold tracking-[-0.011em]">
                  Start from scratch
                </span>
                <span className="mt-0.5 block truncate text-[12.5px] text-muted-foreground">
                  Name it yourself and say what it is for.
                </span>
              </span>
              <ArrowUpRight
                className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden
              />
            </button>
          }
        />
      </div>

      {createWorkspace.isError && (
        <p role="alert" className="pt-4 text-[12.5px] text-destructive">
          {createWorkspace.error.message}
        </p>
      )}
    </section>
  );
}

function Spine() {
  return (
    <span
      aria-hidden
      className="absolute inset-y-3 left-0 w-[3px] rounded-full bg-primary opacity-0 transition-opacity group-hover:opacity-100"
    />
  );
}

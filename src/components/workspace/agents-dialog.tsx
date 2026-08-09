"use client";

import { useState, type ReactNode } from "react";
import { Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { PeopleSkeleton } from "@/components/skeletons";
import { AddAgentFlow } from "@/components/workspace/add-agent-flow";
import { AgentAvatar } from "@/components/workspace/agent-avatar";
import { useRemoveAgent, useWorkspace } from "@/lib/queries";
import { cn } from "@/lib/utils";

export function AgentsDialog({
  workspaceId,
  trigger,
}: {
  workspaceId: string;
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const workspace = useWorkspace(workspaceId);
  const removeAgent = useRemoveAgent(workspaceId);
  const [adding, setAdding] = useState(false);

  const agents = (workspace.data?.members ?? []).filter(
    (row) => row.user.kind === "bot"
  );

  // Nothing to list yet, so go straight to the form rather than showing an
  // empty box above it.
  const showForm =
    adding || (!workspace.isPending && agents.length === 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="max-h-[85svh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agents in this workspace</DialogTitle>
          <DialogDescription>
            Anyone here can bring an agent into a document by typing @. It runs
            on the key you provide, and never acts above whoever invoked it.
          </DialogDescription>
        </DialogHeader>

        {workspace.isPending ? (
          <PeopleSkeleton rows={2} />
        ) : showForm ? null : (
          <ul className="flex flex-col divide-y divide-border/60">
            {agents.map((row) => (
              <li key={row.user.id} className="flex items-center gap-2.5 py-2">
                <AgentAvatar
                  provider={row.user.provider}
                  seed={row.user.avatarSeed}
                  className="size-7"
                />

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-medium">
                    {row.user.displayName}
                    <span className="ml-1.5 font-mono text-[11px] font-normal text-agent">
                      @{row.user.displayName.trim().split(/\s+/)[0]!.toLowerCase()}
                    </span>
                  </span>
                  <span className="block truncate font-mono text-[11px] text-muted-foreground">
                    {row.user.model}
                  </span>
                </span>

                <span
                  className={cn(
                    "shrink-0 rounded-full border px-2 py-0.5 text-[10.5px] font-medium",
                    row.role === "viewer"
                      ? "border-border bg-secondary text-muted-foreground"
                      : "border-agent/25 bg-agent/10 text-agent"
                  )}
                >
                  {row.role === "viewer" ? "Read" : "Write"}
                </span>

                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${row.user.displayName}`}
                  disabled={removeAgent.isPending}
                  onClick={() => removeAgent.mutate(row.user.id)}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  {removeAgent.isPending &&
                  removeAgent.variables === row.user.id ? (
                    <Spinner />
                  ) : (
                    <Trash2 />
                  )}
                </Button>
              </li>
            ))}
          </ul>
        )}

        <AddAgentFlow
          workspaceId={workspaceId}
          open={showForm}
          onOpenChange={setAdding}
        />
      </DialogContent>
    </Dialog>
  );
}

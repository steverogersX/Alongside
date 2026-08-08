"use client";

import { useState } from "react";
import { ArrowRight, FileText, Sparkles, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateWorkspace } from "@/lib/queries";

const SUGGESTIONS = ["Product launch", "Contracts", "Research", "Design review"];

const POINTS = [
  {
    icon: FileText,
    title: "Documents that live together",
    body: "Everything for one piece of work in one place, not scattered across tabs.",
  },
  {
    icon: Users,
    title: "People and agents in the same room",
    body: "Invite teammates as readers or writers. Give an agent a seat the same way.",
  },
  {
    icon: Sparkles,
    title: "Every edit says who made it",
    body: "Agents propose, you accept. Nothing lands without a name against it.",
  },
];

export function EmptyWorkspaces() {
  const createWorkspace = useCreateWorkspace();
  const [name, setName] = useState("");

  return (
    <div className="flex flex-col items-center py-14 text-center">
      <div className="flex items-end gap-1.5">
        <span className="h-9 w-7 rotate-[-8deg] rounded-md border border-border bg-card shadow-xs" />
        <span className="h-12 w-9 rounded-lg border border-border bg-card shadow-sm" />
        <span className="h-9 w-7 rotate-[8deg] rounded-md border border-agent/25 bg-agent-muted/50" />
      </div>

      <h2 className="mt-6 text-[18px] font-semibold tracking-tight">
        Create your first workspace
      </h2>
      <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
        A workspace is a room for one piece of work — the documents, the people,
        and the agents that help with it.
      </p>

      <form
        className="mt-6 flex w-full max-w-sm items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) return;
          createWorkspace.mutate(
            { name: name.trim() },
            { onSuccess: () => setName("") }
          );
        }}
      >
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Name your workspace"
          aria-label="Workspace name"
          autoFocus
          className="h-9"
        />
        <Button
          type="submit"
          size="lg"
          disabled={!name.trim() || createWorkspace.isPending}
        >
          {createWorkspace.isPending ? "Creating…" : "Create"}
          <ArrowRight />
        </Button>
      </form>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
        <span className="text-[11.5px] text-muted-foreground">Try</span>
        {SUGGESTIONS.map((suggestion) => (
          <Button
            key={suggestion}
            type="button"
            variant="outline"
            size="xs"
            onClick={() => setName(suggestion)}
            className="font-normal text-muted-foreground"
          >
            {suggestion}
          </Button>
        ))}
      </div>

      {createWorkspace.isError && (
        <p role="alert" className="mt-3 text-[12px] text-destructive">
          {createWorkspace.error.message}
        </p>
      )}

      <dl className="mt-12 grid w-full max-w-2xl gap-6 text-left sm:grid-cols-3">
        {POINTS.map((point) => (
          <div key={point.title}>
            <point.icon className="size-4 text-muted-foreground" />
            <dt className="mt-2 text-[12.5px] font-medium">{point.title}</dt>
            <dd className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
              {point.body}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

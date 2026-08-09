"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Home, Plus } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { WorkspaceMark } from "@/components/home/workspace-mark";
import { useRecentDocuments, useWorkspaces } from "@/lib/queries";

/**
 * The whole navigation surface. A sidebar shows the same twenty things whether
 * or not you want them; this shows what you asked for, and costs no width.
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const workspaces = useWorkspaces();
  const recent = useRecentDocuments(20);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Jump to"
      description="Search documents and workspaces"
    >
      <CommandInput placeholder="Search documents and workspaces…" />

      <CommandList>
        <CommandEmpty>Nothing matches that.</CommandEmpty>

        <CommandGroup heading="Documents">
          {(recent.data?.documents ?? []).map((document) => (
            <CommandItem
              key={document.id}
              value={`${document.title} ${document.workspaceName}`}
              onSelect={() => go(`/w/${document.workspaceId}/${document.id}`)}
            >
              <FileText />
              <span className="flex-1 truncate">{document.title}</span>
              <span className="text-[11px] text-muted-foreground">
                {document.workspaceName}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Workspaces">
          {(workspaces.data?.workspaces ?? []).map((workspace) => (
            <CommandItem
              key={workspace.id}
              value={workspace.name}
              onSelect={() => go(`/w/${workspace.id}`)}
            >
              <WorkspaceMark
                seed={workspace.id}
                size={16}
                className="size-4 rounded-[4px]"
              />
              <span className="flex-1 truncate">{workspace.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Go">
          <CommandItem value="home" onSelect={() => go("/")}>
            <Home />
            Home
          </CommandItem>
          <CommandItem value="new workspace" onSelect={() => go("/?new=1")}>
            <Plus />
            New workspace
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Plus, Settings2, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Shell, ShellHeader } from "@/components/shell";
import { MemberStack } from "@/components/home/member-stack";
import { WorkspaceMark } from "@/components/home/workspace-mark";
import { WorkspaceTabs } from "@/components/workspace/workspace-tabs";
import { WorkspaceRail } from "@/components/workspace/workspace-rail";
import { WORKSPACES, getWorkspace } from "@/lib/data";

export function generateStaticParams() {
  return WORKSPACES.map((ws) => ({ id: ws.id }));
}

export default async function WorkspaceLayout({
  children,
  params,
}: LayoutProps<"/w/[id]">) {
  const { id } = await params;
  const workspace = getWorkspace(id);

  if (!workspace) notFound();

  const humans = workspace.members.filter((m) => m.kind === "human").length;
  const agents = workspace.members.filter((m) => m.kind === "agent").length;

  return (
    <Shell
      activeNav=""
      activeWorkspaceId={workspace.id}
      rail={<WorkspaceRail workspace={workspace} />}
    >
      <ShellHeader>
        <Link
          href="/"
          className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          Workspaces
        </Link>
        <ChevronRight className="size-3.5 text-muted-foreground/50" />
        <span className="truncate text-[13px] font-medium">
          {workspace.name}
        </span>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon-sm" aria-label="Workspace settings">
            <Settings2 />
          </Button>
          <Button variant="outline" size="sm">
            <UserPlus />
            Invite
          </Button>
          <Button size="sm">
            <Plus />
            New doc
          </Button>
        </div>
      </ShellHeader>

      <main className="px-6 pt-6 pb-12">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          <div className="flex items-start gap-4">
            <WorkspaceMark
              seed={workspace.id}
              size={48}
              className="size-12 rounded-xl"
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-[22px] font-semibold tracking-tight">
                {workspace.name}
              </h1>
              <p className="mt-1 text-[13px] text-muted-foreground">
                {workspace.purpose}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <MemberStack
              members={workspace.members}
              max={6}
              ringClass="ring-sidebar"
            />
            <span className="text-[12px] text-muted-foreground">
              {humans} {humans === 1 ? "person" : "people"} · {agents}{" "}
              {agents === 1 ? "agent" : "agents"}
            </span>
          </div>

          <WorkspaceTabs workspaceId={workspace.id} />

          {children}
        </div>
      </main>
    </Shell>
  );
}

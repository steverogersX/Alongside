import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MessageSquare, Share2, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shell, ShellHeader, ShellRail } from "@/components/shell";
import { MemberStack } from "@/components/home/member-stack";
import { DocEditor } from "@/components/doc/doc-editor";
import { DocActivity } from "@/components/doc/doc-activity";
import { DocPanel } from "@/components/doc/doc-panel";
import { cn } from "@/lib/utils";
import {
  WORKSPACES,
  DOCS,
  VIEWER,
  getWorkspace,
  type Person,
} from "@/lib/data";
import { getDoc, getDocDetail } from "@/lib/docs";

const STATUS: Record<string, string> = {
  draft: "text-muted-foreground",
  "in review": "text-foreground",
  final: "text-online",
};

export function generateStaticParams() {
  return WORKSPACES.flatMap((ws) =>
    (DOCS[ws.id] ?? []).map((doc) => ({ id: ws.id, docId: doc.id }))
  );
}

export default async function Page({ params }: PageProps<"/w/[id]/[docId]">) {
  const { id, docId } = await params;
  const workspace = getWorkspace(id);
  const doc = workspace && getDoc(id, docId);

  if (!workspace || !doc) notFound();

  const detail = getDocDetail(doc);
  const editors = doc.editors
    .map((eid) => workspace.members.find((m) => m.id === eid))
    .filter((m): m is Person => Boolean(m));

  return (
    <Shell
      activeNav=""
      activeWorkspaceId={workspace.id}
      rail={
        <ShellRail className="p-0">
          <DocPanel
            chat={detail.chat ?? []}
            people={[VIEWER, ...workspace.members]}
            agent={workspace.members.find((m) => m.kind === "agent")}
            docTitle={doc.title}
            activity={<DocActivity detail={detail} />}
          />
        </ShellRail>
      }
    >
      <ShellHeader>
        <Link
          href={`/w/${workspace.id}`}
          className="truncate text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          {workspace.name}
        </Link>
        <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/50" />
        <span className="truncate text-[13px] font-medium">{doc.title}</span>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon-sm" aria-label="Star">
            <Star />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Comments">
            <MessageSquare />
          </Button>
          <Button variant="outline" size="sm">
            <Share2 />
            Share
          </Button>
        </div>
      </ShellHeader>

      <main className="flex min-h-0 flex-1 flex-col px-6 pt-8">
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
          <h1 className="font-serif text-[28px] leading-tight font-semibold tracking-tight">
            {doc.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <MemberStack
              members={editors}
              max={5}
              ringClass="ring-sidebar"
            />
            <Badge
              variant="ghost"
              className={cn("h-4 px-0 text-[11px]", STATUS[doc.status])}
            >
              {doc.status}
            </Badge>
            <span className="text-[12px] text-muted-foreground">
              Edited {doc.updatedAt}
            </span>
            <span className="text-[12px] text-muted-foreground">
              {doc.comments} comments
            </span>
          </div>

          <div className="mt-6 flex flex-1 flex-col pb-16">
            <DocEditor blocks={detail.blocks} />
          </div>
        </div>
      </main>
    </Shell>
  );
}

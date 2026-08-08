import Link from "next/link";
import { MessageSquare } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { MemberStack } from "@/components/home/member-stack";
import { cn } from "@/lib/utils";
import type { Doc, Person } from "@/lib/data";

const STATUS: Record<Doc["status"], string> = {
  draft: "text-muted-foreground",
  "in review": "text-foreground",
  final: "text-online",
};

export function DocRow({
  doc,
  members,
  workspaceId,
}: {
  doc: Doc;
  members: Person[];
  workspaceId: string;
}) {
  const editors = doc.editors
    .map((id) => members.find((m) => m.id === id))
    .filter((m): m is Person => Boolean(m));

  return (
    <div className="group relative">
      <Link
        href={`/w/${workspaceId}/${doc.id}`}
        className="absolute inset-0 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
      >
        <span className="sr-only">Open {doc.title}</span>
      </Link>

      <div className="pointer-events-none flex items-start gap-3 rounded-lg px-2.5 py-3 transition-colors group-hover:bg-accent/60">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[13.5px] font-medium">
              {doc.title}
            </span>
            <Badge
              variant="ghost"
              className={cn("h-4 px-0 text-[10.5px]", STATUS[doc.status])}
            >
              {doc.status}
            </Badge>
          </div>

          <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
            {doc.excerpt}
          </p>

          {doc.claim && (
            <p className="mt-1.5 flex items-center gap-1.5 text-[11.5px] text-agent">
              <span className="animate-agent-pulse size-1.5 shrink-0 rounded-full bg-agent" />
              <span className="truncate">
                <span className="font-medium">{doc.claim.actor}</span> holds{" "}
                {doc.claim.region}
              </span>
            </p>
          )}
        </div>

        <div className="pointer-events-auto hidden pt-0.5 sm:block">
          <MemberStack members={editors} max={3} ringClass="ring-sidebar" />
        </div>

        <span className="hidden w-12 shrink-0 items-center justify-end gap-1 pt-1 text-[11.5px] text-muted-foreground tabular-nums md:flex">
          <MessageSquare className="size-3" />
          {doc.comments}
        </span>

        <span className="w-20 shrink-0 pt-1 text-right text-[11.5px] whitespace-nowrap text-muted-foreground">
          {doc.updatedAt}
        </span>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { SectionHead } from "@/components/section-head";
import { WorkspaceMark } from "@/components/home/workspace-mark";
import { RowsSkeleton } from "@/components/skeletons";
import { useRecentDocuments } from "@/lib/queries";
import { cn } from "@/lib/utils";

/** Relative for the last week, then the date — "3d ago" beats "Aug 6" today. */
function when(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)}h ago`;
  if (minutes < 60 * 24 * 7) return `${Math.round(minutes / (60 * 24))}d ago`;

  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/* The spine carries the document's state, so the row does not also need a
   stamp saying the same thing twice. */
const SPINE = {
  draft: "bg-border",
  in_review: "bg-review",
  final: "bg-online",
} as const;

const STATE = {
  draft: "Draft",
  in_review: "In review",
  final: "Final",
} as const;

/**
 * The work itself, and the first thing on the page. Rows rather than tiles:
 * these are ordered by when you last touched them, and a list is what an
 * ordering looks like.
 */
export function RecentDocuments() {
  const recent = useRecentDocuments();
  const documents = recent.data?.documents ?? [];

  if (recent.isPending) return <RowsSkeleton rows={3} />;
  if (documents.length === 0) return null;

  return (
    <section>
      <SectionHead label="Where you left off" count={documents.length} />

      <div className="flex flex-col border-t border-border/70">
        {documents.map((document) => (
          <Link
            key={document.id}
            href={`/w/${document.workspaceId}/${document.id}`}
            className="group relative flex items-center gap-4 border-b border-border/70 rounded-md py-3.5 pr-2 pl-4 transition-colors hover:bg-accent/45 focus-visible:ring-3 focus-visible:ring-ring/35 focus-visible:outline-none"
          >
            <span
              aria-hidden
              className={cn(
                "absolute inset-y-3 left-0 w-[3px] rounded-full",
                SPINE[document.status]
              )}
            />

            <span className="min-w-0 flex-1 truncate text-[14.5px] font-semibold tracking-[-0.012em]">
              {document.title}
            </span>

            <span className="datum hidden shrink-0 items-center gap-1.5 text-muted-foreground sm:flex">
              <WorkspaceMark
                seed={document.workspaceId}
                size={14}
                className="size-3.5 rounded-[3px]"
              />
              <span className="max-w-40 truncate">
                {document.workspaceName}
              </span>
            </span>

            <span className="datum w-16 shrink-0 text-right whitespace-nowrap text-muted-foreground">
              {when(document.updatedAt)}
            </span>

            <ArrowUpRight
              className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden
            />

            <span className="sr-only">{STATE[document.status]}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

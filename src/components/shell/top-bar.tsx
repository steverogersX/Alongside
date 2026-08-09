"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Menu, Search, Slash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type Crumb = { label: string; href?: string };

/**
 * Where you are and what you can do here. The sidebar already says which
 * workspace is open, so this line only has to name the thing in front of you
 * and hold the actions that act on it.
 */
export function TopBar({
  crumbs = [],
  actions,
  onOpenNav,
}: {
  crumbs?: Crumb[];
  actions?: ReactNode;
  onOpenNav?: () => void;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 pr-3 pl-2 md:pl-1">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Open navigation"
        onClick={onOpenNav}
        className="text-muted-foreground md:hidden"
      >
        <Menu />
      </Button>

      <nav
        aria-label="Breadcrumb"
        className="flex min-w-0 flex-1 items-center gap-0.5"
      >
        {crumbs.map((crumb, index) => {
          const last = index === crumbs.length - 1;

          return (
            <span key={crumb.label} className="flex min-w-0 items-center gap-0.5">
              {index > 0 && (
                <Slash
                  className="size-3 shrink-0 -rotate-12 text-border"
                  aria-hidden
                />
              )}

              {crumb.href && !last ? (
                <Link
                  href={crumb.href}
                  className="truncate rounded-md px-1.5 py-1 text-[13px] text-muted-foreground transition-colors hover:bg-accent/70 hover:text-foreground"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className={cn(
                    "truncate px-1.5 text-[13.5px]",
                    last ? "font-semibold tracking-[-0.01em]" : "text-muted-foreground"
                  )}
                >
                  {crumb.label}
                </span>
              )}
            </span>
          );
        })}
      </nav>

      <div className="flex shrink-0 items-center gap-1.5">
        <SearchHint />
        {actions}
      </div>
    </header>
  );
}

/** Discoverability for ⌘K — the palette is the fastest way around, so it has to be seen. */
function SearchHint() {
  return (
    <Button
      variant="outline"
      size="sm"
      aria-label="Search documents and workspaces"
      className="w-44 justify-start gap-2 font-normal text-muted-foreground lg:w-64"
      onClick={() =>
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "k", metaKey: true })
        )
      }
    >
      <Search />
      <span className="hidden truncate lg:inline">
        Search documents and workspaces
      </span>
      <span className="truncate lg:hidden">Search</span>
    </Button>
  );
}

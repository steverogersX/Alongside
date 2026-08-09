"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { GroupImperativeHandle, Layout } from "react-resizable-panels";
import { PanelRight } from "lucide-react";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CommandPalette } from "@/components/shell/command-palette";
import { TopBar, type Crumb } from "@/components/shell/top-bar";
import { Sidebar } from "@/components/home/sidebar";
import { useMediaQuery } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "alongside:rail-layout";

// Pixels, so the rail keeps a usable width on any monitor rather than
// ballooning on wide ones.
const RAIL = { default: 352, min: 300, max: 560 };
const MAIN_MIN = 460;

/**
 * Chrome on the left, paper in the middle, the room on the right. The nav is
 * always there — you should be able to leave a document without going through
 * a breadcrumb — and the document itself is the only white surface, so the eye
 * knows where the work is before it reads a word.
 */
export function Shell({
  children,
  rail,
  railLabel = "panel",
  crumbs,
  actions,
}: {
  children: ReactNode;
  rail?: ReactNode;
  railLabel?: string;
  crumbs?: Crumb[];
  actions?: ReactNode;
}) {
  // Below xl the rail is hidden, and a group containing a hidden panel sizes
  // itself wrongly — so it is mounted only when it is actually visible.
  const wide = useMediaQuery("(min-width: 1280px)");
  const [railOpen, setRailOpen] = useState(true);
  const [navOpen, setNavOpen] = useState(false);
  const showRail = Boolean(rail) && wide && railOpen;
  const groupRef = useRef<GroupImperativeHandle | null>(null);

  useEffect(() => {
    if (!showRail) return;

    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      groupRef.current?.setLayout(JSON.parse(saved) as Layout);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [showRail]);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navOpen]);

  return (
    <TooltipProvider>
      <CommandPalette />

      <div className="blueprint flex h-svh bg-background">
        <Sidebar
          open={navOpen}
          onClose={() => setNavOpen(false)}
          onNavigate={() => setNavOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar
            crumbs={crumbs}
            onOpenNav={() => setNavOpen(true)}
            actions={
              <>
                {actions}
                {rail && wide && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={
                      railOpen ? `Hide ${railLabel}` : `Show ${railLabel}`
                    }
                    aria-pressed={railOpen}
                    onClick={() => setRailOpen((open) => !open)}
                    className={cn(
                      "text-muted-foreground",
                      railOpen && "bg-accent text-foreground"
                    )}
                  >
                    <PanelRight />
                  </Button>
                )}
              </>
            }
          />

          <div className="flex min-h-0 flex-1 gap-2 px-2 pb-2 md:pr-3 md:pb-3 md:pl-0">
            {showRail ? (
              <ResizablePanelGroup
                orientation="horizontal"
                groupRef={groupRef}
                onLayoutChanged={(layout) =>
                  window.localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(layout)
                  )
                }
                className="min-w-0 flex-1"
              >
                <ResizablePanel minSize={MAIN_MIN} className="min-w-0">
                  <Surface>{children}</Surface>
                </ResizablePanel>

                <ResizableHandle withHandle className="mx-1" />

                <ResizablePanel
                  defaultSize={RAIL.default}
                  minSize={RAIL.min}
                  maxSize={RAIL.max}
                  className="min-w-0"
                >
                  {rail}
                </ResizablePanel>
              </ResizablePanelGroup>
            ) : (
              <Surface>{children}</Surface>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

/** The paper. The only pure surface on screen, and it holds the work. */
function Surface({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto rounded-xl border border-border bg-card shadow-sm">
      {children}
    </div>
  );
}

export function ShellHeader({ children }: { children: ReactNode }) {
  return (
    <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center gap-3 border-b border-border/70 bg-card/90 px-5 backdrop-blur-md">
      {children}
    </header>
  );
}

export function ShellRail({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "flex h-full min-w-0 flex-col overflow-y-auto rounded-xl border border-border bg-card p-4 shadow-sm",
        className
      )}
    >
      {children}
    </aside>
  );
}

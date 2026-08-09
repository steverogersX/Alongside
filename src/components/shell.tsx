"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { GroupImperativeHandle, Layout } from "react-resizable-panels";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthGuard } from "@/components/auth-guard";
import { Sidebar } from "@/components/home/sidebar";
import { useMediaQuery } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";

const PANEL = "rounded-2xl border border-sidebar-border bg-sidebar shadow-sm";
const STORAGE_KEY = "alongside:rail-layout";

// Pixels, so the rail keeps a usable width on any monitor rather than
// ballooning on wide ones.
const RAIL = { default: 340, min: 280, max: 560 };
const MAIN_MIN = 480;

export function Shell({
  children,
  rail,
  activeNav,
  activeWorkspaceId,
}: {
  children: ReactNode;
  rail?: ReactNode;
  activeNav?: string;
  activeWorkspaceId?: string;
}) {
  // Below xl the rail is hidden, and a group containing a hidden panel sizes
  // itself wrongly — so it is mounted only when it is actually visible.
  const wide = useMediaQuery("(min-width: 1280px)");
  const showRail = Boolean(rail) && wide;
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

  return (
    <AuthGuard>
      <TooltipProvider>
        <div className="flex h-svh gap-2.5 p-2.5">
          <Sidebar activeNav={activeNav} activeWorkspaceId={activeWorkspaceId} />

          {showRail ? (
            <ResizablePanelGroup
              orientation="horizontal"
              groupRef={groupRef}
              onLayoutChanged={(layout) =>
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify(layout))
              }
              className="min-w-0 flex-1"
            >
              <ResizablePanel
                minSize={MAIN_MIN}
                className={cn("flex min-w-0 flex-col overflow-y-auto", PANEL)}
              >
                {children}
              </ResizablePanel>

              <ResizableHandle withHandle className="mx-0.5" />

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
            <div
              className={cn(
                "flex min-w-0 flex-1 flex-col overflow-y-auto",
                PANEL
              )}
            >
              {children}
            </div>
          )}
        </div>
      </TooltipProvider>
    </AuthGuard>
  );
}

export function ShellHeader({ children }: { children: ReactNode }) {
  return (
    <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center gap-3 bg-sidebar/90 px-4 backdrop-blur-md">
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
        "flex h-full min-w-0 flex-col overflow-y-auto p-4",
        PANEL,
        className
      )}
    >
      {children}
    </aside>
  );
}

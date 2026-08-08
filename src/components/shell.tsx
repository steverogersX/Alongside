import type { ReactNode } from "react";

import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthGuard } from "@/components/auth-guard";
import { Sidebar } from "@/components/home/sidebar";
import { cn } from "@/lib/utils";

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
  return (
    <AuthGuard>
      <TooltipProvider>
        <div className="flex h-svh gap-2.5 p-2.5">
          <Sidebar activeNav={activeNav} activeWorkspaceId={activeWorkspaceId} />

          <div className="flex min-w-0 flex-1 flex-col overflow-y-auto rounded-2xl border border-sidebar-border bg-sidebar shadow-sm">
            {children}
          </div>

          {rail}
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
        "hidden w-80 shrink-0 flex-col overflow-y-auto rounded-2xl border border-sidebar-border bg-sidebar p-4 shadow-sm xl:flex",
        className
      )}
    >
      {children}
    </aside>
  );
}

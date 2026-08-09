"use client";

import Link from "next/link";
import {
  ChevronsUpDown,
  House,
  Inbox,
  LayoutGrid,
  LogOut,
  Plus,
  Search,
  Settings,
  UsersRound,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { CreateWorkspaceDialog } from "@/components/home/create-workspace-dialog";
import { WorkspaceMark } from "@/components/home/workspace-mark";
import { useLogout, useSession, useWorkspaces } from "@/lib/queries";

const NAV = [
  { label: "Home", href: "/", icon: House },
  { label: "All workspaces", href: "/workspaces", icon: LayoutGrid },
  { label: "People", href: "/people", icon: UsersRound },
  { label: "Inbox", href: "/inbox", icon: Inbox },
];

export function Sidebar({
  activeNav = "Home",
  activeWorkspaceId,
}: {
  activeNav?: string;
  activeWorkspaceId?: string;
}) {
  const router = useRouter();
  const session = useSession();
  const workspaces = useWorkspaces();
  const logout = useLogout();

  return (
    <aside className="hidden w-60 shrink-0 flex-col overflow-hidden rounded-2xl border border-sidebar-border bg-sidebar shadow-sm md:flex">
      <Button
        variant="ghost"
        className="h-auto justify-start gap-2 rounded-none px-3 py-3 font-normal"
      >
        <Logo />
        <span className="min-w-0 flex-1 text-left">
          <span className="block truncate text-[13px] font-medium">
            Alongside
          </span>
          <span className="block truncate text-[11px] text-muted-foreground">
            {session.data?.user.displayName ?? "…"}
          </span>
        </span>
        <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
      </Button>

      <div className="px-2 pb-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 font-normal text-muted-foreground"
        >
          <Search />
          Search
        </Button>
      </div>

      <nav className="flex flex-col gap-0.5 px-2">
        {NAV.map((item) => (
          <Button
            key={item.label}
            asChild
            variant="ghost"
            size="sm"
            className={cn(
              "justify-start gap-2 text-[13px]",
              item.label === activeNav
                ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                : "font-normal text-muted-foreground"
            )}
          >
            <Link href={item.href}>
              <item.icon />
              <span className="flex-1 truncate text-left">{item.label}</span>
            </Link>
          </Button>
        ))}
      </nav>

      <div className="mt-6 flex items-center justify-between px-4 pb-1">
        <span className="eyebrow">Workspaces</span>
        <CreateWorkspaceDialog
          trigger={
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="New workspace"
              className="text-muted-foreground"
            >
              <Plus />
            </Button>
          }
        />
      </div>

      <div className="flex flex-col gap-0.5 overflow-y-auto px-2 pb-2">
        {workspaces.isPending && (
          <div
            role="status"
            aria-label="Loading workspaces"
            className="flex flex-col gap-2 px-2 py-1.5"
          >
            {[0, 1, 2].map((index) => (
              <div key={index} className="flex items-center gap-2">
                <Skeleton className="size-4 shrink-0 rounded" />
                <Skeleton
                  className="h-2.5 flex-1"
                  style={{ maxWidth: `${80 - index * 14}%` }}
                />
              </div>
            ))}
          </div>
        )}

        {workspaces.data?.workspaces.length === 0 && (
          <p className="px-2 py-1 text-[12px] text-muted-foreground">
            No workspaces yet
          </p>
        )}
        {workspaces.data?.workspaces.map((ws) => (
          <Button
            key={ws.id}
            asChild
            variant="ghost"
            size="sm"
            className={cn(
              "justify-start gap-2 text-[13px]",
              ws.id === activeWorkspaceId
                ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                : "font-normal text-muted-foreground"
            )}
          >
            <Link href={`/w/${ws.id}`}>
              <WorkspaceMark
                seed={ws.id}
                size={18}
                className="size-4.5 rounded-[5px]"
              />
              <span className="flex-1 truncate text-left">{ws.name}</span>
            </Link>
          </Button>
        ))}
      </div>

      <div className="mt-auto p-2">
        <Separator className="mb-2" />
        <div className="px-1 pb-1.5">
          <ThemeToggle />
        </div>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-[13px] font-normal text-muted-foreground"
        >
          <Link href="/settings">
            <Settings />
            Settings
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={logout.isPending}
          onClick={() =>
            logout.mutate(undefined, { onSuccess: () => router.push("/login") })
          }
          className="w-full justify-start gap-2 text-[13px] font-normal text-muted-foreground"
        >
          <LogOut />
          Sign out
        </Button>
      </div>
    </aside>
  );
}

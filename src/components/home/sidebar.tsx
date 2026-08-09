"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsUpDown, FileText, House, LogOut, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { CreateWorkspaceDialog } from "@/components/home/create-workspace-dialog";
import { WorkspaceMark } from "@/components/home/workspace-mark";
import { personAvatar } from "@/lib/avatars";
import { useLogout, useSession, useWorkspace, useWorkspaces } from "@/lib/queries";
import { cn } from "@/lib/utils";

export function Sidebar({
  activeWorkspaceId,
}: {
  activeNav?: string;
  activeWorkspaceId?: string;
}) {
  const pathname = usePathname();
  const session = useSession();
  const workspaces = useWorkspaces();
  const logout = useLogout();

  const user = session.data?.user;
  const atHome = pathname === "/";

  return (
    <aside className="hidden w-60 shrink-0 flex-col overflow-hidden rounded-2xl border border-sidebar-border bg-sidebar shadow-sm md:flex">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-auto shrink-0 justify-start gap-2 rounded-none px-3 py-3 font-normal"
          >
            <Logo />
            <span className="min-w-0 flex-1 text-left">
              <span className="block truncate text-[13px] font-medium">
                Alongside
              </span>
              <span className="block truncate text-[11px] text-muted-foreground">
                {user?.displayName ?? "…"}
              </span>
            </span>
            <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel className="flex items-center gap-2 font-normal">
            {user && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={personAvatar(user.avatarSeed, "human", 48)}
                  alt=""
                  aria-hidden
                  className="size-7 shrink-0 rounded-full bg-secondary select-none"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-medium">
                    {user.displayName}
                  </span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {user.email}
                  </span>
                </span>
              </>
            )}
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            disabled={logout.isPending}
            onSelect={() =>
              // A full load, so the next person does not inherit this account's
              // cached queries.
              logout.mutate(undefined, {
                onSettled: () => window.location.replace("/login"),
              })
            }
          >
            <LogOut />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <nav className="shrink-0 px-2">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className={cn(
            "w-full justify-start gap-2 text-[13px]",
            atHome
              ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
              : "font-normal text-muted-foreground"
          )}
        >
          <Link href="/">
            <House />
            <span className="flex-1 truncate text-left">Home</span>
          </Link>
        </Button>
      </nav>

      <div className="mt-4 flex shrink-0 items-center justify-between px-4 pb-1">
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

      <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2 pb-2">
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

        {workspaces.data?.workspaces.map((workspace) => (
          <div key={workspace.id}>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className={cn(
                "w-full justify-start gap-2 text-[13px]",
                workspace.id === activeWorkspaceId
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "font-normal text-muted-foreground"
              )}
            >
              <Link href={`/w/${workspace.id}`}>
                <WorkspaceMark
                  seed={workspace.id}
                  size={18}
                  className="size-4.5 rounded-[5px]"
                />
                <span className="flex-1 truncate text-left">
                  {workspace.name}
                </span>
              </Link>
            </Button>

            {workspace.id === activeWorkspaceId && (
              <Documents workspaceId={workspace.id} pathname={pathname} />
            )}
          </div>
        ))}
      </div>

      <div className="mt-auto shrink-0 p-2">
        <Separator className="mb-2" />
        <ThemeToggle />
      </div>
    </aside>
  );
}

/** The open workspace shows what is in it — the reason to have a sidebar. */
function Documents({
  workspaceId,
  pathname,
}: {
  workspaceId: string;
  pathname: string;
}) {
  const workspace = useWorkspace(workspaceId);
  const documents = workspace.data?.documents ?? [];

  if (documents.length === 0) return null;

  return (
    <ul className="mt-0.5 ml-4 flex flex-col gap-0.5 border-l border-sidebar-border pl-1.5">
      {documents.map((document) => {
        const href = `/w/${workspaceId}/${document.id}`;
        const active = pathname === href;

        return (
          <li key={document.id}>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 w-full justify-start gap-2 text-[12.5px]",
                active
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "font-normal text-muted-foreground"
              )}
            >
              <Link href={href}>
                <FileText className="size-3.5 shrink-0" />
                <span className="flex-1 truncate text-left">
                  {document.title}
                </span>
              </Link>
            </Button>
          </li>
        );
      })}
    </ul>
  );
}

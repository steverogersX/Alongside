"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, House, LogOut, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { CreateWorkspaceDialog } from "@/components/home/create-workspace-dialog";
import { WorkspaceMark } from "@/components/home/workspace-mark";
import { personAvatar } from "@/lib/avatars";
import { useLogout, useSession, useWorkspace, useWorkspaces } from "@/lib/queries";
import { cn } from "@/lib/utils";

/**
 * Always on screen, so leaving a document never costs a thought. It shows the
 * workspaces you have and, under the open one, the documents inside it —
 * nothing else, because everything else is a keystroke away in ⌘K.
 */
export function Sidebar({
  open = false,
  onClose,
  onNavigate,
}: {
  open?: boolean;
  onClose?: () => void;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const workspaces = useWorkspaces();

  const activeWorkspaceId = pathname.startsWith("/w/")
    ? pathname.split("/")[2]
    : undefined;
  const atHome = pathname === "/";
  const list = workspaces.data?.workspaces ?? [];

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-foreground/25 backdrop-blur-[2px] md:hidden"
        />
      )}

      <aside
        className={cn(
          "z-50 flex w-[254px] shrink-0 flex-col gap-1 px-3 pt-3 pb-3",
          // On small screens it slides over the work rather than shrinking it.
          "fixed inset-y-0 left-0 bg-background transition-transform duration-200 md:static md:translate-x-0 md:bg-transparent md:transition-none",
          open ? "translate-x-0 shadow-xl md:shadow-none" : "-translate-x-full"
        )}
      >
        <div className="flex h-11 shrink-0 items-center gap-2.5 px-1.5">
          <Link
            href="/"
            aria-label="Alongside home"
            className="flex min-w-0 items-center gap-2.5 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            <Logo />
            <span className="truncate text-[15px] font-semibold tracking-[-0.02em]">
              Alongside
            </span>
          </Link>

          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Close navigation"
            onClick={onClose}
            className="ml-auto text-muted-foreground md:hidden"
          >
            <X />
          </Button>
        </div>

        <nav className="shrink-0 pt-2">
          <NavLink
            href="/"
            active={atHome}
            icon={<House className="size-4" strokeWidth={1.9} />}
            onNavigate={onNavigate}
          >
            Home
          </NavLink>
        </nav>

        <div className="mt-5 flex shrink-0 items-center justify-between gap-2 px-2.5 pb-1.5">
          <span className="eyebrow">Workspaces</span>
          <span className="flex items-center gap-1">
            {list.length > 0 && (
              <span className="datum text-muted-foreground/70">
                {list.length}
              </span>
            )}
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
          </span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto pb-2">
          {workspaces.isPending && (
            <div
              role="status"
              aria-label="Loading workspaces"
              className="flex flex-col gap-3 px-2.5 py-2"
            >
              {[0, 1, 2].map((index) => (
                <div key={index} className="flex items-center gap-2.5">
                  <Skeleton className="size-5 shrink-0 rounded-md" />
                  <Skeleton
                    className="h-2.5 flex-1"
                    style={{ maxWidth: `${80 - index * 14}%` }}
                  />
                </div>
              ))}
            </div>
          )}

          {!workspaces.isPending && list.length === 0 && (
            <p className="px-2.5 py-1 text-[12.5px] text-muted-foreground">
              None yet
            </p>
          )}

          {list.map((workspace) => (
            <div key={workspace.id}>
              <NavLink
                href={`/w/${workspace.id}`}
                active={workspace.id === activeWorkspaceId}
                icon={
                  <WorkspaceMark
                    seed={workspace.id}
                    size={20}
                    className="size-5 rounded-[4px]"
                  />
                }
                onNavigate={onNavigate}
              >
                {workspace.name}
              </NavLink>

              {workspace.id === activeWorkspaceId && (
                <Documents
                  workspaceId={workspace.id}
                  pathname={pathname}
                  onNavigate={onNavigate}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-auto flex shrink-0 items-center gap-2 border-t border-sidebar-border pt-3">
          <Account />
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
}

function NavLink({
  href,
  active,
  icon,
  children,
  onNavigate,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[13.5px] transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
        active
          ? "bg-sidebar-accent font-medium text-foreground"
          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
      )}
    >
      <span className="grid size-5 shrink-0 place-items-center">{icon}</span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </Link>
  );
}

/** The open workspace shows what is in it — the reason to have a sidebar. */
function Documents({
  workspaceId,
  pathname,
  onNavigate,
}: {
  workspaceId: string;
  pathname: string;
  onNavigate?: () => void;
}) {
  const workspace = useWorkspace(workspaceId);
  const documents = workspace.data?.documents ?? [];

  if (documents.length === 0) return null;

  return (
    <ul className="mt-0.5 mb-1 ml-[19px] flex flex-col gap-px border-l border-sidebar-border pl-2.5">
      {documents.map((document) => {
        const href = `/w/${workspaceId}/${document.id}`;
        const active = pathname === href;

        return (
          <li key={document.id}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-7 items-center gap-2 rounded-md px-2 text-[12.5px] transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                active
                  ? "bg-sidebar-accent font-medium text-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
              )}
            >
              <FileText className="size-3.5 shrink-0" strokeWidth={1.9} />
              <span className="min-w-0 flex-1 truncate">{document.title}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function Account() {
  const session = useSession();
  const logout = useLogout();
  const user = session.data?.user;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-1.5 text-left transition-colors outline-none hover:bg-sidebar-accent/70 focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          <span className="grid size-7 shrink-0 place-items-center overflow-hidden rounded-full bg-secondary ring-1 ring-border">
            {user && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={personAvatar(user.avatarSeed, "human", 56)}
                alt=""
                aria-hidden
                className="size-full select-none"
              />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12.5px] font-medium">
              {user?.displayName ?? "…"}
            </span>
            <span className="block truncate text-[11px] text-muted-foreground">
              {user?.email ?? ""}
            </span>
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" side="top" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <span className="block truncate text-[12.5px] font-medium">
            {user?.displayName}
          </span>
          <span className="block truncate text-[11px] text-muted-foreground">
            {user?.email}
          </span>
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
  );
}

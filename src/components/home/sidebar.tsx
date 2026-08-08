import Link from "next/link";
import {
  BrainCircuit,
  ChevronsUpDown,
  House,
  Inbox,
  LayoutGrid,
  Plus,
  Search,
  Settings,
  UsersRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { WorkspaceMark } from "@/components/home/workspace-mark";
import { WORKSPACES, VIEWER } from "@/lib/data";

const NAV = [
  { label: "Home", href: "/", icon: House, active: true },
  { label: "All workspaces", href: "/workspaces", icon: LayoutGrid },
  { label: "Agents", href: "/agents", icon: BrainCircuit },
  { label: "People", href: "/people", icon: UsersRound },
  { label: "Inbox", href: "/inbox", icon: Inbox, badge: 11 },
];

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col overflow-hidden rounded-2xl border border-sidebar-border bg-sidebar shadow-sm md:flex">
      <Button
        variant="ghost"
        className="h-auto justify-start gap-2 rounded-none px-3 py-3 font-normal"
      >
        <span className="grid size-6 shrink-0 place-items-center rounded-md bg-foreground text-[11px] font-semibold text-background">
          A
        </span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block truncate text-[13px] font-medium">
            Alongside
          </span>
          <span className="block truncate text-[11px] text-muted-foreground">
            {VIEWER.name}&rsquo;s org
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
              item.active
                ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                : "font-normal text-muted-foreground"
            )}
          >
            <Link href={item.href}>
              <item.icon />
              <span className="flex-1 truncate text-left">{item.label}</span>
              {item.badge ? (
                <Badge className="h-4 bg-agent px-1.5 text-[10px] text-agent-foreground tabular-nums">
                  {item.badge}
                </Badge>
              ) : null}
            </Link>
          </Button>
        ))}
      </nav>

      <div className="mt-6 flex items-center justify-between px-4 pb-1">
        <span className="eyebrow">Workspaces</span>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="New workspace"
          className="text-muted-foreground"
        >
          <Plus />
        </Button>
      </div>

      <div className="flex flex-col gap-0.5 overflow-y-auto px-2 pb-2">
        {WORKSPACES.map((ws) => (
          <Button
            key={ws.id}
            asChild
            variant="ghost"
            size="sm"
            className="justify-start gap-2 text-[13px] font-normal text-muted-foreground"
          >
            <Link href={`/w/${ws.id}`}>
              <WorkspaceMark
                seed={ws.id}
                size={18}
                className="size-4.5 rounded-[5px]"
              />
              <span className="flex-1 truncate text-left">{ws.name}</span>
              {ws.live ? (
                <span
                  className="animate-agent-pulse size-1.5 shrink-0 rounded-full bg-agent"
                  title={`${ws.live.actor} is working`}
                />
              ) : null}
            </Link>
          </Button>
        ))}
      </div>

      <div className="mt-auto p-2">
        <Separator className="mb-2" />
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
      </div>
    </aside>
  );
}

import Link from "next/link";
import {
  Bell,
  Bot,
  ChevronsUpDown,
  Home,
  Layers,
  Plus,
  Search,
  Settings,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { WORKSPACES, VIEWER } from "@/lib/data";

const NAV = [
  { label: "Home", href: "/", icon: Home, active: true },
  { label: "All workspaces", href: "/workspaces", icon: Layers },
  { label: "Agents", href: "/agents", icon: Bot },
  { label: "People", href: "/people", icon: Users },
  { label: "Inbox", href: "/inbox", icon: Bell, badge: 11 },
];

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col overflow-hidden rounded-2xl border border-sidebar-border bg-sidebar shadow-sm md:flex">
      {/* Org switcher */}
      <button
        type="button"
        className="flex items-center gap-2 px-3 py-3 text-left transition-colors hover:bg-sidebar-accent"
      >
        <span className="grid size-6 shrink-0 place-items-center rounded-md bg-foreground text-[11px] font-semibold text-background">
          A
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium">
            Alongside
          </span>
          <span className="block truncate text-[11px] text-muted-foreground">
            {VIEWER.name}&rsquo;s org
          </span>
        </span>
        <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
      </button>

      <div className="px-2 pb-2">
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-lg border border-sidebar-border bg-card px-2 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-accent"
        >
          <Search className="size-3.5" />
          <span className="flex-1 text-left">Search</span>
          <kbd className="rounded border border-border px-1 font-mono text-[10px]">
            ⌘K
          </kbd>
        </button>
      </div>

      <nav className="flex flex-col gap-0.5 px-2">
        {NAV.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] transition-colors",
              item.active
                ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
            )}
          >
            <item.icon className="size-4 shrink-0" />
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge ? (
              <span className="rounded-full bg-agent px-1.5 text-[10px] font-medium text-agent-foreground tabular-nums">
                {item.badge}
              </span>
            ) : null}
          </Link>
        ))}
      </nav>

      <div className="mt-6 flex items-center justify-between px-4 pb-1">
        <span className="eyebrow">Workspaces</span>
        <button
          type="button"
          aria-label="New workspace"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <Plus className="size-3.5" />
        </button>
      </div>

      <div className="flex flex-col gap-0.5 overflow-y-auto px-2 pb-2">
        {WORKSPACES.map((ws) => (
          <Link
            key={ws.id}
            href={`/w/${ws.id}`}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-foreground"
          >
            <span className="w-4 shrink-0 text-center text-[13px]">
              {ws.icon}
            </span>
            <span className="flex-1 truncate">{ws.name}</span>
            {ws.live ? (
              <span
                className="animate-agent-pulse size-1.5 shrink-0 rounded-full bg-agent"
                title={`${ws.live.actor} is working`}
              />
            ) : null}
          </Link>
        ))}
      </div>

      <div className="mt-auto border-t border-sidebar-border p-2">
        <Link
          href="/settings"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-foreground"
        >
          <Settings className="size-4" />
          Settings
        </Link>
      </div>
    </aside>
  );
}

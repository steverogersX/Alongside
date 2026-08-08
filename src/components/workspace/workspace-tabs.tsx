"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Docs", segment: null, href: "" },
  { label: "Agents", segment: "agents", href: "/agents" },
  { label: "Settings", segment: "settings", href: "/settings" },
];

export function WorkspaceTabs({ workspaceId }: { workspaceId: string }) {
  const segment = useSelectedLayoutSegment();

  return (
    <div>
      <nav className="flex items-center gap-1">
        {TABS.map((tab) => (
          <Button
            key={tab.label}
            asChild
            variant="ghost"
            size="sm"
            className={cn(
              "text-[13px]",
              tab.segment === segment
                ? "bg-accent font-medium text-foreground"
                : "font-normal text-muted-foreground"
            )}
          >
            <Link href={`/w/${workspaceId}${tab.href}`}>{tab.label}</Link>
          </Button>
        ))}
      </nav>
      <Separator className="mt-2" />
    </div>
  );
}

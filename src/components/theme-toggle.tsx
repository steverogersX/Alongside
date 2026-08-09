"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Monitor, label: "System" },
] as const;

const subscribe = () => () => {};

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  return (
    <div
      role="group"
      aria-label="Theme"
      className={cn(
        "flex shrink-0 items-center gap-px rounded-md border border-sidebar-border p-px",
        className
      )}
    >
      {OPTIONS.map((option) => {
        const active = mounted && theme === option.value;

        return (
          <Button
            key={option.value}
            variant="ghost"
            size="icon-xs"
            aria-label={option.label}
            aria-pressed={active}
            onClick={() => setTheme(option.value)}
            className={cn(
              "rounded-[4px]",
              active
                ? "bg-sidebar-accent text-foreground"
                : "text-muted-foreground/70"
            )}
          >
            <option.icon />
          </Button>
        );
      })}
    </div>
  );
}

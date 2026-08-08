"use client";

import { useCallback, useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 30_000);
  return () => clearInterval(id);
}

export function Clock() {
  const getSnapshot = useCallback(() => {
    const now = new Date();
    return `${now.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    })}|${now.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  }, []);

  const stamp = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const [date, time] = stamp?.split("|") ?? [];

  return (
    <p className="flex h-5 items-center gap-2 text-[13px] text-muted-foreground">
      {stamp && (
        <>
          <span>{date}</span>
          <span className="text-muted-foreground/40">·</span>
          <span className="tabular-nums">{time}</span>
        </>
      )}
    </p>
  );
}

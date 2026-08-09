"use client";

import { useCallback, useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 30_000);
  return () => clearInterval(id);
}

/**
 * Rendered only after mount — the server has no idea what time it is where you
 * are, and a greeting that flickers from wrong to right is worse than one that
 * arrives a frame late.
 */
function useNow() {
  const getSnapshot = useCallback(() => {
    const now = new Date();
    return [
      now.toLocaleDateString(undefined, {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
      now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
      String(now.getHours()),
    ].join("|");
  }, []);

  const stamp = useSyncExternalStore(subscribe, getSnapshot, () => null);
  if (!stamp) return null;

  const [date, time, hour] = stamp.split("|") as [string, string, string];
  return { date, time, hour: Number(hour) };
}

/** The date, in the utility face — a fact about the room, not a headline. */
export function Dateline() {
  const now = useNow();

  return (
    <p className="eyebrow flex h-4 items-center gap-2">
      {now && (
        <>
          <span>{now.date}</span>
          <span aria-hidden className="text-border">
            —
          </span>
          <time>{now.time}</time>
        </>
      )}
    </p>
  );
}

export function Greeting({ name }: { name?: string }) {
  const now = useNow();

  const part =
    now === null
      ? "Hello"
      : now.hour < 5
        ? "Still up"
        : now.hour < 12
          ? "Good morning"
          : now.hour < 18
            ? "Good afternoon"
            : "Good evening";

  return (
    <h1 className="title mt-2 text-[22px]">
      {part}
      {name ? <>, {name}</> : null}.
    </h1>
  );
}

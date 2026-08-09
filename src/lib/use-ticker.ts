"use client";

import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;
let snapshot = 0;

function subscribe(onChange: () => void) {
  listeners.add(onChange);

  if (timer === null) {
    timer = setInterval(() => {
      snapshot += 1;
      for (const listener of listeners) listener();
    }, 1000);
  }

  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0 && timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };
}

export function useTicker() {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => 0
  );
}

export function elapsed(since: string) {
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(since).getTime()) / 1000)
  );

  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

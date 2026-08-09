"use client";

import { useCallback, useSyncExternalStore } from "react";

import type { AwarenessUser, CollabSession } from "@/lib/collab";

export type AwarenessViewer = AwarenessUser & {
  clientId: number;
  isYou: boolean;
};

const EMPTY: AwarenessViewer[] = [];

function read(session: CollabSession): AwarenessViewer[] {
  const awareness = session.provider.awareness;
  if (!awareness) return EMPTY;

  const seen = new Map<string, AwarenessViewer>();

  for (const [clientId, state] of awareness.getStates()) {
    const user = (state as { user?: AwarenessUser }).user;
    if (!user?.key) continue;

    // One person with two tabs is still one person in the list.
    if (!seen.has(user.key)) {
      seen.set(user.key, {
        ...user,
        clientId,
        isYou: user.key === session.identity.key,
      });
    }
  }

  return [...seen.values()].sort((a, b) => {
    if (a.isYou !== b.isYou) return a.isYou ? -1 : 1;
    if (a.kind !== b.kind) return a.kind === "agent" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Everyone currently connected, straight from the Yjs awareness protocol — a
 * socket closing removes its entry at once, so leaving is not a timeout.
 *
 * Snapshots are cached because useSyncExternalStore compares by reference and
 * read() builds a new array each call.
 */
export function useAwareness(session: CollabSession | null) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const awareness = session?.provider.awareness;
      if (!awareness) return () => {};

      awareness.on("change", onChange);
      return () => awareness.off("change", onChange);
    },
    [session]
  );

  const getSnapshot = useCallback(() => {
    if (!session) return EMPTY;

    const next = read(session);
    const previous = cache.get(session);

    if (previous && sameViewers(previous, next)) return previous;

    cache.set(session, next);
    return next;
  }, [session]);

  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

const cache = new WeakMap<CollabSession, AwarenessViewer[]>();

function sameViewers(a: AwarenessViewer[], b: AwarenessViewer[]) {
  if (a.length !== b.length) return false;
  return a.every((viewer, index) => viewer.key === b[index]?.key);
}

"use client";

import * as React from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/**
 * Subscribed to rather than read in an effect, so the first client render
 * already knows the answer and nothing has to be corrected afterwards.
 *
 * `onServer` is the snapshot used where there are no media queries. Anything
 * that animates *into* its final state should pass `true`: the server then
 * paints the settled frame, and a reader who never gets JS still sees the
 * finished thing instead of an empty box.
 */
export function usePrefersReducedMotion(onServer = true) {
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => onServer
  );
}

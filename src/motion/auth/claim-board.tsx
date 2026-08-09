"use client";

import * as React from "react";

import { usePrefersReducedMotion } from "@/motion/reduced-motion";
import { cn } from "@/lib/utils";

/**
 * The agent working through a contract, and the paragraph it is holding right
 * now shown above the list of the ones it has already handed back.
 *
 * Five paragraphs land, one every 460ms, and each landing swaps the quotation
 * above the list to the clause that call came in on. One event, two
 * consequences, on one clock — run on separate timers they read as two
 * unrelated things competing for the same corner of the page.
 *
 * It stops. A loop with no resting state is what makes an auth page feel
 * restless, so this ends as a legible list of work done and stays there.
 *
 * Rows are HTML rather than <text> in an SVG: the section marks and the serif
 * quotation both need real font fallback and real line breaking.
 */

const CLAIMS = [
  {
    ref: "§4.2",
    heading: "Limitation of liability",
    line: "Neither party's aggregate liability exceeds the fees paid in the twelve months before the claim.",
    out: "Redlined against 2024",
    secs: 41,
  },
  {
    ref: "§7.1",
    heading: "Termination for cause",
    line: "Either side may terminate on thirty days' written notice of a material breach left uncured.",
    out: "Matched, no change",
    secs: 18,
  },
  {
    ref: "§9",
    heading: "Data processing",
    line: "Subprocessors are published before they are used, and you have fifteen days to object.",
    out: "Flagged for Noor",
    secs: 63,
  },
  {
    ref: "§11.3",
    heading: "Governing law",
    line: "Disputes go to the courts of Delaware, with each side carrying its own costs.",
    out: "Left as drafted",
    secs: 12,
  },
  {
    ref: "Exhibit B",
    heading: "Concession matrix",
    line: "Every ask from the counterparty, our position beside it, and the line we will not cross.",
    out: "Handed to Sam",
    secs: 87,
  },
];

const STEP = 460;

const clock = (secs: number) =>
  `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;

/** Counts up and settles, so the duration reads as measured rather than typed. */
function useCountUp(to: number, run: boolean) {
  const [n, setN] = React.useState(to);

  React.useEffect(() => {
    if (!run) return;

    let raf = 0;
    const started = performance.now();

    const step = (now: number) => {
      const t = Math.min(1, (now - started) / 450);
      setN(Math.round(to * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, run]);

  return run ? n : to;
}

function Row({
  claim,
  fresh,
  still,
}: {
  claim: (typeof CLAIMS)[number];
  fresh: boolean;
  still: boolean;
}) {
  const secs = useCountUp(claim.secs, !still);

  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border/60 px-3.5 py-2.5",
        // The newest keeps the claim tint for a beat, so the eye knows what
        // just came back.
        fresh ? "bg-agent-muted/45" : "bg-card/55",
        "transition-colors duration-700",
        !still && "animate-land"
      )}
      style={{ willChange: still ? undefined : "transform, opacity" }}
    >
      <svg
        viewBox="0 0 16 16"
        aria-hidden
        className="size-4 shrink-0 text-agent"
      >
        <path
          d="M3.5 8.5 L6.5 11.5 L12.5 4.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          className={still ? undefined : "animate-check"}
          strokeDashoffset={still ? 0 : undefined}
        />
      </svg>

      <span className="w-[4.75rem] shrink-0 truncate font-mono text-[12px]">
        {claim.ref}
      </span>

      <span className="min-w-0 flex-1 truncate text-[13px] text-muted-foreground">
        {claim.out}
      </span>

      <span className="shrink-0 font-mono text-[12px] text-muted-foreground tabular-nums">
        {clock(secs)}
      </span>
    </li>
  );
}

export function ClaimBoard() {
  const reduced = usePrefersReducedMotion();

  // Reduced motion, and the server, get the settled state outright.
  const [landed, setLanded] = React.useState(0);
  const still = reduced;
  const shown = still ? CLAIMS.length : landed;

  React.useEffect(() => {
    if (reduced || landed >= CLAIMS.length) return;

    // Nothing advances while the tab is in the background — coming back to a
    // board that ran itself out unwatched is worse than one still going.
    const tick = () => {
      if (document.visibilityState === "visible")
        setLanded((n) => Math.min(CLAIMS.length, n + 1));
    };

    const id = window.setTimeout(tick, landed === 0 ? 300 : STEP);
    return () => window.clearTimeout(id);
  }, [reduced, landed]);

  // While they are typing, this side is not the task.
  const [dim, setDim] = React.useState(false);

  React.useEffect(() => {
    const check = (event: FocusEvent) => {
      const el = event.target as HTMLElement | null;
      setDim(Boolean(el?.matches?.("input, textarea, select")));
    };

    document.addEventListener("focusin", check);
    document.addEventListener("focusout", check);
    return () => {
      document.removeEventListener("focusin", check);
      document.removeEventListener("focusout", check);
    };
  }, []);

  const current = CLAIMS[Math.max(0, shown - 1)];

  return (
    <div
      className={cn(
        "relative transition-opacity duration-200",
        dim ? "opacity-85" : "opacity-100"
      )}
    >
      {/* The clause is the hero, and it changes because a paragraph landed */}
      <div className="grid h-[10.5rem] content-start">
        <div key={current.ref} className="relative col-start-1 row-start-1 pl-5">
          {/* The margin rule the product draws down a claimed paragraph */}
          <span
            aria-hidden
            className="animate-land absolute inset-y-0 left-0 w-[2px] rounded-full bg-agent"
          />

          <span className="animate-land inline-flex rounded-[4px] bg-agent px-1.5 py-0.5 font-mono text-[10.5px] leading-[1.5] font-medium tracking-[0.06em] text-agent-foreground uppercase">
            Claude
          </span>

          {/* One halo, once, as the first paragraph is claimed */}
          {!still && shown === 1 ? (
            <span
              aria-hidden
              className="animate-halo pointer-events-none absolute -top-3 -left-4 size-14 rounded-full border border-agent/40"
            />
          ) : null}

          <p
            className="animate-land mt-2.5 font-serif text-[21px] leading-[1.45] tracking-[-0.01em] text-balance"
            style={{ animationDelay: "60ms" }}
          >
            {current.line}
          </p>

          {/* The reference follows the clause rather than moving with it */}
          <p
            className="animate-land mt-2 text-[12px] text-muted-foreground"
            style={{ animationDelay: "140ms" }}
          >
            <span className="font-mono">{current.ref}</span> · {current.heading}
          </p>
        </div>
      </div>

      {/* Masked rather than per-row fades, so the middle stays fully legible */}
      <ul
        className="mt-8 flex flex-col gap-2"
        style={{
          maskImage: "linear-gradient(to bottom, black 78%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 78%, transparent 100%)",
        }}
      >
        {CLAIMS.slice(0, shown).map((claim, i) => (
          <Row
            key={claim.ref}
            claim={claim}
            fresh={i === shown - 1 && !still}
            still={still}
          />
        ))}
      </ul>
    </div>
  );
}

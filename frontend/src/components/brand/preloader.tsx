"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { LOGO_BLOCKS } from "./logo";

/**
 * First-visit preloader (§ brand: restrained motion). Five blocks (S·I·T·E·O)
 * assemble staggered in green tones with gold edges, then resolve to the logo's
 * real colors on the final beat and fade out — bridging the multicolor mark
 * with the site's green/gold system.
 *
 * Rules honored:
 *  - ≤ ~1.2s total.
 *  - Once per session (sessionStorage) — skipped on internal nav + return visits.
 *  - Never delays content: the page renders underneath; this is a fixed overlay
 *    that only covers then fades. Removed before paint on return visits.
 *  - No layout shift (position: fixed; opacity fade on exit).
 *  - prefers-reduced-motion: static colored logo, quick fade, no stagger.
 */
const FLAG = "siteo_preloader_v1";
const STAGGER = 70;
const ENTER_MS = 300;
const RESOLVE_AT = 620;
const EXIT_AT = 920;
const END_AT = 1200;

type Phase = "pending" | "enter" | "resolve" | "exit" | "done";

// Use a layout effect on the client, but fall back to a normal effect during
// SSR to avoid the React warning.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function Preloader() {
  const [phase, setPhase] = useState<Phase>("pending");

  useIsoLayoutEffect(() => {
    let alreadyShown = false;
    try {
      alreadyShown = sessionStorage.getItem(FLAG) === "1";
    } catch {
      /* storage blocked — treat as first visit */
    }
    if (alreadyShown) {
      setPhase("done"); // removed before paint → no flash on return visits
      return;
    }
    try {
      sessionStorage.setItem(FLAG, "1");
    } catch {
      /* ignore */
    }

    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      setPhase("resolve"); // static, full-color logo
      const e = setTimeout(() => setPhase("exit"), 300);
      const d = setTimeout(() => setPhase("done"), 500);
      return () => {
        clearTimeout(e);
        clearTimeout(d);
      };
    }

    const timers = [
      setTimeout(() => setPhase("enter"), 20),
      setTimeout(() => setPhase("resolve"), RESOLVE_AT),
      setTimeout(() => setPhase("exit"), EXIT_AT),
      setTimeout(() => setPhase("done"), END_AT),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  if (phase === "done") return null;

  const resolved = phase === "resolve" || phase === "exit";
  const entered = phase !== "pending";

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[100] flex items-center justify-center bg-surface"
      style={{
        opacity: phase === "exit" ? 0 : 1,
        transition: "opacity 280ms cubic-bezier(0.22,1,0.36,1)",
        pointerEvents: phase === "exit" ? "none" : "auto",
      }}
    >
      <div className="flex gap-1.5 md:gap-2">
        {LOGO_BLOCKS.map((b, i) => (
          <div
            key={b.letter}
            className="flex size-11 items-center justify-center rounded-[6px] border-2 font-semibold text-white md:size-16"
            style={{
              fontFamily: "var(--font-inter), Arial, sans-serif",
              fontWeight: 800,
              fontSize: "1.5rem",
              opacity: entered ? 1 : 0,
              transform: entered ? "none" : "translateY(10px) scale(0.94)",
              backgroundColor: resolved
                ? b.colorVar
                : i % 2 === 0
                  ? "var(--brand-green)"
                  : "var(--brand-green-light)",
              borderColor: resolved ? "transparent" : "var(--brand-gold)",
              transitionProperty: "opacity, transform, background-color, border-color",
              transitionDuration: `${ENTER_MS}ms, ${ENTER_MS}ms, 260ms, 260ms`,
              transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)",
              transitionDelay: entered && phase === "enter" ? `${i * STAGGER}ms` : "0ms",
            }}
          >
            {b.letter}
          </div>
        ))}
      </div>
    </div>
  );
}

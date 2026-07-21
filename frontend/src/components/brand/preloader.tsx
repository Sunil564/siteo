"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { LOGO_BLOCKS } from "./logo";

/**
 * First-visit preloader (§ brand: restrained motion). Five blocks (S·I·T·E·O)
 * assemble staggered in green tones with gold edges, a gold rule draws beneath,
 * then the blocks resolve to the logo's real colors and the lockup lifts away —
 * bridging the multicolor mark with the site's green/gold system.
 *
 * Rules honored:
 *  - ≤ ~1.2s total.
 *  - Once per session (sessionStorage) — skipped on internal nav + return visits.
 *  - Preview anytime with ?preloader in the URL (forces a replay, no flag write).
 *  - Never delays content: the page renders underneath; this only covers + fades.
 *    Removed before paint on return visits.
 *  - No layout shift (position: fixed; opacity/transform on exit only).
 *  - prefers-reduced-motion: static colored logo, quick fade, no stagger.
 */
const FLAG = "siteo_preloader_v1";
const STAGGER = 80;
const ENTER_MS = 320;
const RESOLVE_AT = 640;
const EXIT_AT = 980;
const END_AT = 1220;

type Phase = "pending" | "enter" | "resolve" | "exit" | "done";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function Preloader() {
  const [phase, setPhase] = useState<Phase>("pending");

  useIsoLayoutEffect(() => {
    const forced =
      typeof window !== "undefined" && window.location.search.includes("preloader");

    if (!forced) {
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
    }

    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      setPhase("resolve");
      const e = setTimeout(() => setPhase("exit"), 320);
      const d = setTimeout(() => setPhase("done"), 520);
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

  const entered = phase !== "pending";
  const resolved = phase === "resolve" || phase === "exit";
  const exiting = phase === "exit";
  const ease = "cubic-bezier(0.22,1,0.36,1)";

  return (
    <div
      aria-hidden
      data-preloader
      className="fixed inset-0 z-[100] flex items-center justify-center bg-surface"
      style={{
        opacity: exiting ? 0 : 1,
        transition: `opacity 300ms ${ease}`,
        pointerEvents: exiting ? "none" : "auto",
      }}
    >
      <div
        className="flex flex-col items-center gap-4"
        style={{
          transform: exiting ? "translateY(-8px) scale(0.98)" : "none",
          transition: `transform 320ms ${ease}`,
        }}
      >
        <div className="flex gap-1.5 md:gap-2">
          {LOGO_BLOCKS.map((b, i) => (
            <div
              key={b.letter}
              className="flex size-12 items-center justify-center rounded-[7px] border-2 text-white md:size-[72px]"
              style={{
                fontFamily: "var(--font-inter), Arial, sans-serif",
                fontWeight: 800,
                fontSize: "1.75rem",
                opacity: entered ? 1 : 0,
                transform: entered ? "none" : "translateY(14px) scale(0.9)",
                backgroundColor: resolved
                  ? b.colorVar
                  : i % 2 === 0
                    ? "var(--brand-green)"
                    : "var(--brand-green-light)",
                borderColor: resolved ? "transparent" : "var(--brand-gold)",
                transitionProperty: "opacity, transform, background-color, border-color",
                transitionDuration: `${ENTER_MS}ms, ${ENTER_MS}ms, 280ms, 280ms`,
                transitionTimingFunction: ease,
                transitionDelay: phase === "enter" ? `${i * STAGGER}ms` : "0ms",
              }}
            >
              {b.letter}
            </div>
          ))}
        </div>
        {/* gold rule draws in beneath the lockup */}
        <div
          className="h-0.5 rounded-full bg-brand-gold"
          style={{
            width: "min(280px, 70vw)",
            transformOrigin: "center",
            transform: entered ? "scaleX(1)" : "scaleX(0)",
            opacity: entered ? 1 : 0,
            transition: `transform 420ms ${ease} 260ms, opacity 200ms ${ease} 260ms`,
          }}
        />
      </div>
    </div>
  );
}

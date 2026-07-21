"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/**
 * Smoothly counts a numeric value up when it scrolls into view. Preserves any
 * non-numeric prefix/suffix in `value` (e.g. "11,000+" -> counts to 11000, then
 * re-adds the comma grouping and "+"). Static under reduced motion.
 */
export function CountUp({
  value,
  duration = 1400,
  className,
}: {
  value: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();

  const match = value.match(/[\d,]+(?:\.\d+)?/);
  const numeric = match ? Number(match[0].replace(/,/g, "")) : NaN;
  const hasNumber = !Number.isNaN(numeric);
  const prefix = hasNumber ? value.slice(0, match!.index) : "";
  const suffix = hasNumber ? value.slice(match!.index! + match![0].length) : "";

  const [display, setDisplay] = useState(hasNumber && !reduce ? 0 : numeric);

  useEffect(() => {
    if (!hasNumber || reduce || !inView) return;
    let raf = 0;
    const start = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3); // easeOutCubic
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setDisplay(Math.round(numeric * ease(p)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, hasNumber, numeric, reduce, duration]);

  if (!hasNumber) return <span className={className}>{value}</span>;

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

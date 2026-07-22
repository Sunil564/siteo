"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * Gentle scale-on-scroll for large images/visuals (§ brand: restrained). The
 * child scales subtly as the element passes through the viewport. Images only -
 * never text. Fully static under reduced motion. Keep `overflow-hidden` on the
 * wrapper so the scaled child doesn't bleed.
 */
export function ScaleOnScroll({
  children,
  className,
  from = 1.06,
  to = 1,
}: {
  children: React.ReactNode;
  className?: string;
  from?: number;
  to?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [from, to]);

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ scale }} className="h-full w-full">
        {children}
      </motion.div>
    </div>
  );
}

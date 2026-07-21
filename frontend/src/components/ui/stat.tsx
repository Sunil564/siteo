import { cn } from "@/lib/utils";

/**
 * Stat display (§7): large gold numeral, small muted label beneath. This is
 * where gold is loudest. `onDark` lightens the label for green/archive surfaces.
 */
export function Stat({
  value,
  label,
  onDark = false,
  className,
}: {
  value: string;
  label: string;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("text-center", className)}>
      <div className="font-display text-h2 font-semibold leading-none text-brand-gold md:text-h1">
        {value}
      </div>
      <div className={cn("mt-2 text-sm", onDark ? "text-surface/70" : "text-ink-muted")}>
        {label}
      </div>
    </div>
  );
}

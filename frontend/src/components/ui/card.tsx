import { cn } from "@/lib/utils";

/**
 * Card (§7): white on --surface, 1px border, 8px radius, generous padding.
 * Borders do the work; shadow is subtle/absent. `interactive` adds a restrained
 * hover lift for linked cards.
 */
export function Card({
  className,
  interactive = false,
  children,
}: {
  className?: string;
  interactive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-border bg-surface-card p-6 shadow-[0_1px_2px_rgba(14,59,46,0.04),0_10px_30px_-18px_rgba(14,59,46,0.16)] md:p-8",
        interactive &&
          "transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-brand-gold/50 hover:shadow-[0_16px_40px_-18px_rgba(14,59,46,0.4)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

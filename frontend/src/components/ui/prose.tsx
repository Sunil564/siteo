import { cn } from "@/lib/utils";

/**
 * Narrow reading column for prose-heavy pages (§5: ~680px measure). Styles
 * headings/paragraphs/lists through tokens so legal + narrative pages stay
 * consistent without per-page CSS.
 */
export function Prose({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "max-w-[var(--container-readable)] text-ink",
        "[&_h2]:mt-10 [&_h2]:text-h3 [&_h2]:text-brand-green",
        "[&_h3]:mt-8 [&_h3]:text-h4 [&_h3]:text-brand-green",
        "[&_p]:mt-4 [&_p]:text-ink-muted",
        "[&_ul]:mt-4 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:text-ink-muted",
        "[&_li]:relative [&_li]:pl-6",
        "[&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-3 [&_li]:before:size-1.5 [&_li]:before:rounded-full [&_li]:before:bg-brand-gold",
        "[&_a]:text-brand-green [&_a]:underline [&_a]:decoration-brand-gold [&_a]:underline-offset-2",
        "[&_strong]:text-ink [&_strong]:font-semibold",
        className,
      )}
    >
      {children}
    </div>
  );
}

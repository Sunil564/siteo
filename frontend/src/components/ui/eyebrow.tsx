import { cn } from "@/lib/utils";

/**
 * Signature eyebrow label (§4/§7): small caps, letter-spaced, gold, above a
 * heading. Bilingual when `hi` is given — Devanagari then " / " then Latin,
 * mirroring the source deck (संस्था परिचय / THE ORGANIZATION).
 */
export function Eyebrow({
  children,
  hi,
  className,
  onDark = false,
}: {
  children: React.ReactNode;
  hi?: string;
  className?: string;
  onDark?: boolean;
}) {
  return (
    <p
      className={cn(
        "text-sm font-semibold uppercase tracking-[0.16em]",
        onDark ? "text-brand-gold-soft" : "text-brand-gold",
        className,
      )}
    >
      {hi && (
        <>
          <span lang="hi" className="font-hindi tracking-normal">
            {hi}
          </span>
          <span aria-hidden className="mx-2 opacity-50">
            /
          </span>
        </>
      )}
      {children}
    </p>
  );
}

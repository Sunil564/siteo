import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

/**
 * Line icon in a filled green circle (§7) - the deck's signature icon
 * treatment. Gold icon on green by default; `tone="soft"` for a lighter green
 * fill with a green icon (use on dark surfaces where a solid green disappears).
 */
export function IconCircle({
  icon: Icon,
  tone = "green",
  className,
}: {
  icon: LucideIcon;
  tone?: "green" | "soft";
  className?: string;
}) {
  const tones = {
    green: "bg-brand-green text-brand-gold",
    soft: "bg-brand-gold/15 text-brand-gold",
  };
  return (
    <span
      className={cn(
        "inline-flex size-12 shrink-0 items-center justify-center rounded-full",
        tones[tone],
        className,
      )}
    >
      <Icon className="size-6" strokeWidth={1.75} aria-hidden />
    </span>
  );
}

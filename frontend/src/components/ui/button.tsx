import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Button (§7): primary = gold fill + dark-green text (the unmistakable CTA);
 * secondary = green outline; ghost = tertiary. Consistent height; never more
 * than one primary per view. Renders as a Next <Link> when `href` is set.
 * `onDark` adapts secondary/ghost for green surfaces (e.g. the hero).
 */
type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 rounded-card font-medium transition-colors " +
  "disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap";

const sizes: Record<Size, string> = {
  md: "h-12 px-6 text-base",
  sm: "h-10 px-4 text-sm",
};

function variantClasses(variant: Variant, onDark: boolean): string {
  switch (variant) {
    case "primary":
      return "bg-brand-gold text-brand-green hover:bg-brand-gold-soft";
    case "secondary":
      return onDark
        ? "border border-surface/60 text-surface hover:bg-surface hover:text-brand-green"
        : "border border-brand-green text-brand-green hover:bg-brand-green hover:text-surface";
    case "ghost":
      return onDark
        ? "text-surface hover:bg-surface/10"
        : "text-brand-green hover:bg-brand-green/10";
  }
}

type CommonProps = {
  variant?: Variant;
  size?: Size;
  onDark?: boolean;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & { href?: undefined };
type ButtonAsLink = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & { href: string };

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "primary", size = "md", onDark = false, className, children } = props;
  const classes = cn(base, sizes[size], variantClasses(variant, onDark), className);

  if ("href" in props && props.href !== undefined) {
    const { href, ...rest } = props as ButtonAsLink;
    return (
      <Link href={href} className={classes} {...stripCommon(rest)}>
        {children}
      </Link>
    );
  }
  const { ...rest } = props as ButtonAsButton;
  return (
    <button className={classes} {...stripCommon(rest)}>
      {children}
    </button>
  );
}

// Remove our styling props before spreading DOM attributes.
function stripCommon<T extends Record<string, unknown>>(rest: T) {
  const clone = { ...rest };
  delete (clone as Record<string, unknown>).variant;
  delete (clone as Record<string, unknown>).size;
  delete (clone as Record<string, unknown>).onDark;
  delete (clone as Record<string, unknown>).className;
  delete (clone as Record<string, unknown>).children;
  return clone;
}

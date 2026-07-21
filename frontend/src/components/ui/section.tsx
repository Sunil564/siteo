import { cn } from "@/lib/utils";
import { Container } from "./container";

/**
 * Section rhythm (§5): 48px mobile / 64px tablet / 96px desktop vertical
 * padding. `tone` picks the surface; `bleed` skips the inner Container for
 * full-width children.
 */
export function Section({
  as: Tag = "section",
  tone = "surface",
  bleed = false,
  className,
  containerClassName,
  children,
  ...rest
}: {
  as?: React.ElementType;
  tone?: "surface" | "card" | "green";
  bleed?: boolean;
  className?: string;
  containerClassName?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  const tones = {
    surface: "bg-surface text-ink",
    card: "bg-surface-card text-ink",
    green: "bg-brand-green text-surface",
  };
  return (
    <Tag className={cn("py-12 md:py-16 lg:py-24", tones[tone], className)} {...rest}>
      {bleed ? children : <Container className={containerClassName}>{children}</Container>}
    </Tag>
  );
}

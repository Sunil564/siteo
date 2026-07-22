import { Container } from "./container";
import { Eyebrow } from "./eyebrow";
import { cn } from "@/lib/utils";

/**
 * Interior page hero (layout patterns §8). Smaller than the home arrival hero:
 * bilingual eyebrow, serif title, optional intro. Green ground by default (the
 * institutional anchor); `tone="surface"` for lighter pages.
 */
export function PageHero({
  eyebrow,
  eyebrowHi,
  title,
  titleHi,
  intro,
  tone = "green",
}: {
  eyebrow?: string;
  eyebrowHi?: string;
  title: string;
  titleHi?: string;
  intro?: string;
  tone?: "green" | "surface";
}) {
  const onGreen = tone === "green";
  return (
    <section className={cn(onGreen ? "bg-brand-green text-surface" : "bg-surface text-ink")}>
      <Container className="py-16 md:py-24">
        <div className="max-w-3xl">
          {eyebrow && (
            <Eyebrow hi={eyebrowHi} onDark={onGreen}>
              {eyebrow}
            </Eyebrow>
          )}
          <h1 className={cn("mt-5 text-h2 md:text-h1", onGreen ? "text-surface" : "text-brand-green")}>
            {title}
          </h1>
          {titleHi && (
            <p
              lang="hi"
              className={cn("font-hindi mt-3 text-h4", onGreen ? "text-brand-gold-soft" : "text-brand-gold")}
            >
              {titleHi}
            </p>
          )}
          {intro && (
            <p className={cn("mt-6 text-lg", onGreen ? "text-surface/80" : "text-ink-muted")}>{intro}</p>
          )}
        </div>
      </Container>
    </section>
  );
}

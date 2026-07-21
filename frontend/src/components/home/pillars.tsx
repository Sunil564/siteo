import { IconCircle } from "@/components/ui/icon-circle";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { pillars } from "@/lib/site";

/**
 * Three pillars as an editorial numbered list (§4.1) — oversized gold numerals,
 * hairline-separated rows. Deliberately not a card grid, to vary rhythm.
 */
export function Pillars() {
  return (
    <Section tone="surface">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <SectionHeading
          eyebrow="THE THREE PILLARS"
          eyebrowHi="तीन स्तंभ"
          title="What SITEO stands on"
          intro="Everything grows from three commitments to the community."
        />

        <ul className="flex flex-col">
          {pillars.map((p, i) => (
            <Reveal as="li" key={p.title} delay={i * 0.08}>
              <div className="flex items-start gap-6 border-t border-border py-8 first:border-t-0 first:pt-0">
                <span className="font-display text-h2 font-semibold leading-none text-brand-gold md:text-h1">
                  0{i + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <IconCircle icon={p.icon} className="size-10" />
                    <div>
                      <h3 className="text-h4">{p.title}</h3>
                      <p lang="hi" className="font-hindi text-sm text-ink-muted">
                        {p.titleHi}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-lg text-ink-muted">{p.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </Section>
  );
}

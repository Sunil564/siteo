import { Card } from "@/components/ui/card";
import { IconCircle } from "@/components/ui/icon-circle";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { pillars } from "@/lib/site";

/** Three pillars strip (§4.1). */
export function Pillars() {
  return (
    <Section tone="surface">
      <SectionHeading
        eyebrow="THE THREE PILLARS"
        eyebrowHi="तीन स्तंभ"
        title="What SITEO stands on"
        intro="Everything the organization does grows from three commitments to the community."
      />
      <div className="mt-12 grid gap-6 md:grid-cols-3 lg:gap-8">
        {pillars.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.08}>
            <Card className="h-full">
              <IconCircle icon={p.icon} />
              <h3 className="mt-6 text-h4">{p.title}</h3>
              <p lang="hi" className="font-hindi mt-1 text-base text-ink-muted">
                {p.titleHi}
              </p>
              <p className="mt-3 text-base text-ink-muted">{p.body}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

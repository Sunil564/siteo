import { Card } from "@/components/ui/card";
import { IconCircle } from "@/components/ui/icon-circle";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { focusAreas } from "@/lib/site";

/** Eight focus-area cards, vision-only (§4.1 / §1) — staggered reveal, refined
 *  hover. A card grid, distinct from the pillars list and the full-bleed band. */
export function FocusAreas() {
  return (
    <Section tone="card" className="border-y border-border">
      <SectionHeading
        eyebrow="WHAT WE FOCUS ON"
        eyebrowHi="हमारे कार्यक्षेत्र"
        title="Eight areas, one community"
        intro="From trade and skilling to welfare and lasting institutions."
      />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {focusAreas.map((f, i) => (
          <Reveal key={f.title} delay={(i % 4) * 0.07}>
            <Card interactive className="h-full">
              <IconCircle icon={f.icon} />
              <h3 className="mt-5 text-h4">{f.title}</h3>
              <p className="mt-2 text-sm text-ink-muted">{f.body}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

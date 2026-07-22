import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconCircle } from "@/components/ui/icon-circle";
import { PageHero } from "@/components/ui/page-hero";
import { Placeholder } from "@/components/ui/placeholder";
import { Reveal } from "@/components/ui/reveal";
import { ScaleOnScroll } from "@/components/ui/scale-on-scroll";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";
import { focusAreas } from "@/lib/site";

export const metadata: Metadata = {
  title: "Initiatives",
  description:
    "SITEO's flagship projects and focus areas - from the SITEO Bhavan and Senior Citizen Village to skilling, education, and trade.",
};

const flagships = [
  {
    title: "SITEO Bhavan",
    tag: "Upcoming project",
    body: "A home for the organization - head office, hostels for students, a community health centre, consultancy support, and shared spaces including a hall, gym, and library. One address for the community to gather, learn, and be looked after.",
    alt: "Architectural vision of the SITEO Bhavan",
  },
  {
    title: "Senior Citizen Village",
    tag: "Upcoming project",
    body: "A riverside wellness community for elders - a calm, ten-acre setting designed around dignity, care, and companionship in later life. A place to be cared for as part of the community, not apart from it.",
    alt: "Vision of the riverside Senior Citizen Village",
  },
] as const;

export default function InitiativesPage() {
  return (
    <>
      <PageHero
        eyebrow="INITIATIVES"
        eyebrowHi="पहल"
        title="What we're building"
        intro="Aspirational projects and everyday programs that turn SITEO's pillars into something you can see, use, and belong to."
      />

      <Section tone="surface">
        <SectionHeading
          eyebrow="FLAGSHIP VISION"
          eyebrowHi="प्रमुख परियोजनाएँ"
          title="Projects on the horizon"
          intro="Long-term commitments - shown as vision today, built for the community tomorrow."
        />
        <div className="mt-14 flex flex-col gap-16 md:gap-24">
          {flagships.map((f, i) => {
            const reverse = i % 2 === 1;
            return (
              <Reveal key={f.title}>
                <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
                  <ScaleOnScroll
                    className={cn("overflow-hidden rounded-card", reverse && "md:order-2")}
                  >
                    <Placeholder
                      slot={{ src: null, alt: f.alt, ratio: "4:3", kind: "building" }}
                      caption="Vision render - coming soon"
                    />
                  </ScaleOnScroll>
                  <div>
                    <span className="inline-flex w-fit rounded-full bg-brand-gold/15 px-3 py-1 text-sm font-medium text-brand-green">
                      {f.tag}
                    </span>
                    <h3 className="mt-4 text-h3 text-brand-green">{f.title}</h3>
                    <p className="mt-4 text-lg text-ink-muted">{f.body}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Section>

      <Section tone="card" className="border-y border-border">
        <SectionHeading
          eyebrow="FOCUS AREAS"
          eyebrowHi="कार्यक्षेत्र"
          title="The everyday work"
          intro="Eight areas where SITEO shows up for the community, year-round."
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

      <Section tone="green">
        <div className="mx-auto flex max-w-[var(--container-readable)] flex-col items-center text-center">
          <h2 className="text-h3 text-surface md:text-h2">Want to help build this?</h2>
          <p className="mt-4 text-lg text-surface/80">
            These projects grow with the community behind them. Express your interest and we&apos;ll
            be in touch.
          </p>
          <div className="mt-8">
            <Button href="/membership" variant="secondary" onDark>
              Get Involved
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}

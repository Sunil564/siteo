import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { IconCircle } from "@/components/ui/icon-circle";
import { PageHero } from "@/components/ui/page-hero";
import { Prose } from "@/components/ui/prose";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { pillars } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "SITEO is a non-profit community organization for trade, education, and development - its mission, pillars, and structure.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="THE ORGANIZATION"
        eyebrowHi="संस्था परिचय"
        title="A permanent platform for the community"
        intro="SITEO exists to bring the community's trade, education, and development under one organized, lasting institution - built to serve for generations, not for a single moment."
      />

      <Section tone="surface">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <SectionHeading eyebrow="OUR MISSION" eyebrowHi="हमारा उद्देश्य" title="Why SITEO exists" />
          <Prose>
            <p>
              For a long time the community&apos;s strengths - enterprise, learning, and a deep
              instinct to look after its own - have worked in parallel, rarely under one roof. SITEO
              brings them together: a single organization where a business can find a market, a
              student can find support, and a family can find a community that shows up.
            </p>
            <p>
              We measure success in participation and trust, not slogans. Everything we build is
              meant to still be standing - and still useful - decades from now.
            </p>
          </Prose>
        </div>
      </Section>

      <Section tone="card" className="border-y border-border">
        <SectionHeading
          eyebrow="THE THREE PILLARS"
          eyebrowHi="तीन स्तंभ"
          title="How the work is organized"
          intro="Every initiative traces back to one of three commitments."
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

      <Section tone="surface">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <SectionHeading eyebrow="HOW WE ARE RUN" eyebrowHi="संचालन" title="Structure & governance" />
          <Prose>
            <p>
              SITEO is a non-profit community organization, governed by an experienced board and run
              with transparency and care. It is intentionally broad - an umbrella under which
              specific initiatives, events, and the community&apos;s financial arm can operate with a
              shared purpose.
            </p>
            <p>
              We keep governance simple and accountable: clear stewardship, open communication, and
              decisions made in the community&apos;s long-term interest.
            </p>
          </Prose>
        </div>
      </Section>
    </>
  );
}

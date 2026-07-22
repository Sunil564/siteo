import type { Metadata } from "next";
import { Coins, Compass, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconCircle } from "@/components/ui/icon-circle";
import { PageHero } from "@/components/ui/page-hero";
import { Prose } from "@/components/ui/prose";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "Seervi Capital",
  description:
    "Seervi Capital is SITEO's financial and investment arm — supporting community businesses, startups, education, and senior welfare through capital, guidance, and investment.",
};

const arms = [
  {
    icon: Coins,
    title: "Capital",
    body: "Backing for community businesses and entrepreneurs who are ready to grow but need a partner who understands them.",
  },
  {
    icon: Compass,
    title: "Guidance",
    body: "Mentorship and practical advice — from experienced hands who have built enterprises of their own.",
  },
  {
    icon: Sprout,
    title: "Investment",
    body: "Long-term investment in startups, education, and senior welfare — patient support for outcomes that matter to the community.",
  },
];

export default function SeerviCapitalPage() {
  return (
    <>
      <PageHero
        eyebrow="SEERVI CAPITAL"
        eyebrowHi="सीरवी कैपिटल"
        title="The financial and investment arm of SITEO"
        intro="Seervi Capital supports community businesses, startups, education, and senior welfare — through capital, guidance, and investment."
      />

      <Section tone="surface">
        <Prose className="mx-auto text-center [&_p]:text-lg">
          <p>
            Good ideas and good people should not stall for want of backing. Seervi Capital exists to
            make sure they don&apos;t — pairing the community&apos;s resources with the community&apos;s
            ambition, and doing it with patience and care rather than pressure.
          </p>
        </Prose>

        <div className="mt-14 grid gap-6 md:grid-cols-3 lg:gap-8">
          {arms.map((a, i) => (
            <Reveal key={a.title} delay={i * 0.08}>
              <Card className="h-full text-center">
                <div className="flex justify-center">
                  <IconCircle icon={a.icon} />
                </div>
                <h3 className="mt-6 text-h4">{a.title}</h3>
                <p className="mt-3 text-base text-ink-muted">{a.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="green">
        <div className="mx-auto flex max-w-[var(--container-readable)] flex-col items-center text-center">
          <SectionHeading
            align="center"
            onDark
            eyebrow="GET STARTED"
            eyebrowHi="जुड़ें"
            title="Express interest"
            intro="Whether you're building something or want to support those who are, we'd like to hear from you."
          />
          <div className="mt-8">
            <Button href="/membership">Express Interest</Button>
          </div>
        </div>
      </Section>
    </>
  );
}

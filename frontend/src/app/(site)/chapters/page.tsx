import type { Metadata } from "next";
import { Globe, MapPin, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { IconCircle } from "@/components/ui/icon-circle";
import { PageHero } from "@/components/ui/page-hero";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "Chapters",
  description:
    "SITEO's chapter network is growing across India and internationally - one community, many places.",
};

const reach = [
  {
    icon: MapPin,
    title: "Across India",
    body: "Local chapters bringing the community together wherever it has put down roots - sharing opportunity, support, and belonging close to home.",
  },
  {
    icon: Globe,
    title: "International presence",
    body: "The community reaches well beyond India, and so does SITEO - connecting members across borders into one network.",
  },
  {
    icon: Users,
    title: "One community",
    body: "Every chapter is part of the same whole: the same values, the same commitment to trade, education, and welfare.",
  },
];

export default function ChaptersPage() {
  return (
    <>
      <PageHero
        eyebrow="CHAPTERS"
        eyebrowHi="अध्याय"
        title="A network that keeps growing"
        titleHi="भारत और विश्वभर में"
        intro="SITEO is expanding across India and internationally - so that wherever the community is, its platform is close by."
      />

      <Section tone="surface">
        <SectionHeading
          eyebrow="OUR REACH"
          eyebrowHi="हमारा विस्तार"
          title="Near and far, one community"
          intro="Chapters grow with the community. As more places come on board, the network only gets stronger."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3 lg:gap-8">
          {reach.map((r, i) => (
            <Reveal key={r.title} delay={i * 0.08}>
              <Card className="h-full">
                <IconCircle icon={r.icon} />
                <h3 className="mt-6 text-h4">{r.title}</h3>
                <p className="mt-3 text-base text-ink-muted">{r.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}

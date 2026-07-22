import type { Metadata } from "next";
import { BookOpen, GraduationCap, HandHeart, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { IconCircle } from "@/components/ui/icon-circle";
import { PageHero } from "@/components/ui/page-hero";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { MembershipForm } from "@/components/forms/membership-form";

export const metadata: Metadata = {
  title: "Membership",
  description:
    "Become part of SITEO. Register your interest to join a community built around network, mentorship, welfare, and trade.",
};

const benefits = [
  { icon: Users, title: "Network", body: "Connect with businesses, professionals, and peers across the community." },
  { icon: GraduationCap, title: "Mentorship", body: "Learn from experienced members who have built and grown their own." },
  { icon: HandHeart, title: "Welfare access", body: "Be part of a community that looks after its people, at every stage." },
  { icon: BookOpen, title: "Trade directory", body: "Discover and be discovered within the community's growing directory." },
];

export default function MembershipPage() {
  return (
    <>
      <PageHero
        eyebrow="MEMBERSHIP"
        eyebrowHi="सदस्यता"
        title="Become part of SITEO"
        intro="Membership is about belonging to a community that shows up for each other, in business and in life. Tell us you're interested and we'll take it from there."
      />

      <Section tone="surface">
        <SectionHeading
          eyebrow="WHY JOIN"
          eyebrowHi="क्यों जुड़ें"
          title="What membership means"
          intro="Not a transaction - a place in the community."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b, i) => (
            <Reveal key={b.title} delay={(i % 4) * 0.07}>
              <Card className="h-full">
                <IconCircle icon={b.icon} />
                <h3 className="mt-5 text-h4">{b.title}</h3>
                <p className="mt-2 text-sm text-ink-muted">{b.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="card" className="border-t border-border">
        <div className="mx-auto max-w-2xl">
          <SectionHeading
            align="center"
            eyebrow="REGISTER INTEREST"
            eyebrowHi="रुचि दर्ज करें"
            title="Tell us about yourself"
            intro="No payment, no commitment. We'll reach out with next steps."
          />
          <div className="mt-10">
            <MembershipForm />
          </div>
        </div>
      </Section>
    </>
  );
}

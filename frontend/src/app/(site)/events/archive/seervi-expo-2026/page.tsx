import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import { Container } from "@/components/ui/container";
import { CountUp } from "@/components/ui/count-up";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Placeholder } from "@/components/ui/placeholder";
import { Prose } from "@/components/ui/prose";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { seerviExpo2026 as expo } from "@/lib/archive";

export const metadata: Metadata = {
  title: "Seervi Expo 2026",
  description:
    "A retrospective of Seervi Expo 2026 - SITEO's launch event: 11,000+ attendees, 6+ industry zones, 50+ exhibitors.",
};

export default function SeerviExpo2026Page() {
  return (
    <>
      {/* Purple-era hero + stats */}
      <section className="text-white" style={{ backgroundImage: "var(--archive-gradient)" }}>
        <Container className="py-16 md:py-24">
          <Eyebrow onDark className="text-white/80">
            THE EXPO ERA · 2026
          </Eyebrow>
          <h1 className="mt-5 text-h1 text-white md:text-display">{expo.title}</h1>
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-white/85">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="size-5" /> {expo.dates}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="size-5" /> {expo.venue}
            </span>
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-6 border-t border-white/20 pt-10 sm:grid-cols-4">
            {expo.stats.map((s) => (
              <div key={s.label} className="min-w-0">
                <dd className="whitespace-nowrap font-display text-h3 font-semibold leading-none text-white md:text-h2">
                  <CountUp value={s.value} />
                </dd>
                <dt className="mt-2 text-sm text-white/70">{s.label}</dt>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* Story */}
      <Section tone="surface">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <SectionHeading eyebrow="THE STORY" eyebrowHi="कहानी" title="How it began" />
          <Prose>
            {expo.story.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </Prose>
        </div>
      </Section>

      {/* Photo gallery */}
      <Section tone="card" className="border-y border-border">
        <SectionHeading
          eyebrow="GALLERY"
          eyebrowHi="तस्वीरें"
          title="Moments from the expo"
          intro="Photos from the event will be added here soon."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {expo.photos.map((photo, i) => (
            <Reveal key={i} delay={(i % 3) * 0.06}>
              <Placeholder slot={photo} />
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="surface">
        <Link
          href="/events/archive"
          className="inline-flex items-center gap-2 text-base font-medium text-brand-green hover:text-brand-green-light"
        >
          <ArrowLeft className="size-4" /> Back to the archive
        </Link>
      </Section>
    </>
  );
}

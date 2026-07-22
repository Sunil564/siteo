import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Placeholder } from "@/components/ui/placeholder";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { archiveEvents } from "@/lib/archive";

export const metadata: Metadata = {
  title: "Events Archive",
  description: "A look back at past SITEO events, beginning with the launch — Seervi Expo 2026.",
};

export default function ArchivePage() {
  return (
    <>
      {/* Purple-era hero — the archive has its own identity (§3 exception). */}
      <section className="text-white" style={{ backgroundImage: "var(--archive-gradient)" }}>
        <Container className="py-16 md:py-24">
          <div className="max-w-3xl">
            <Eyebrow onDark className="text-white/80">
              THE EXPO ERA
            </Eyebrow>
            <h1 className="mt-5 text-h2 text-white md:text-h1">Events archive</h1>
            <p className="mt-6 text-lg text-white/85">
              Where past SITEO events live on. It begins with the one that started everything.
            </p>
          </div>
        </Container>
      </section>

      <Section tone="surface">
        <div className="grid gap-8 md:grid-cols-2">
          {archiveEvents.map((e) => (
            <Reveal key={e.slug}>
              <Link
                href={`/events/archive/${e.slug}`}
                className="group block overflow-hidden rounded-card border border-border bg-surface-card transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_18px_44px_-22px_rgba(162,28,175,0.45)]"
              >
                <div className="relative">
                  <Placeholder
                    slot={e.photos[0]}
                    rounded={false}
                    caption="Photos coming soon"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 mix-blend-multiply opacity-70"
                    style={{ backgroundImage: "var(--archive-gradient)" }}
                  />
                </div>
                <div className="p-6 md:p-8">
                  <h2 className="text-h3 text-brand-green">{e.title}</h2>
                  <dl className="mt-3 space-y-1.5 text-sm text-ink-muted">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="size-4" style={{ color: "var(--archive-via)" }} />
                      <dd>{e.dates}</dd>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4" style={{ color: "var(--archive-via)" }} />
                      <dd>{e.venue}</dd>
                    </div>
                  </dl>
                  <span className="mt-5 inline-flex items-center gap-2 text-base font-medium text-brand-green group-hover:gap-3 transition-[gap]">
                    View retrospective <ArrowRight className="size-4" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}

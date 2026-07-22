import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHero } from "@/components/ui/page-hero";
import { Placeholder } from "@/components/ui/placeholder";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { getPublishedEvents } from "@/lib/api";
import { formatEventDate, MODE_LABEL } from "@/lib/format";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming SITEO events - sessions, meetups, and gatherings open for registration.",
};

export default async function EventsPage() {
  const events = await getPublishedEvents();

  return (
    <>
      <PageHero
        eyebrow="EVENTS"
        eyebrowHi="कार्यक्रम"
        title="Upcoming events"
        intro="Sessions, meetups, and gatherings across the community. Free to register unless noted."
      />

      <Section tone="surface">
        {events.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {events.map((e, i) => (
              <Reveal key={e.id} delay={(i % 3) * 0.07}>
                <Card interactive className="flex h-full flex-col overflow-hidden p-0">
                  <Placeholder
                    slot={{ src: e.banner_image, alt: e.title, ratio: "16:9", kind: "event" }}
                    rounded={false}
                  />
                  <div className="flex flex-1 flex-col p-6">
                    <span className="inline-flex w-fit rounded-full bg-brand-green/8 px-3 py-1 text-sm font-medium text-brand-green">
                      {MODE_LABEL[e.mode] ?? e.mode}
                    </span>
                    <h3 className="mt-3 text-h4">{e.title}</h3>
                    <dl className="mt-2 space-y-1 text-sm text-ink-muted">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="size-4 text-brand-gold" />
                        <dd>{formatEventDate(e.starts_at)}</dd>
                      </div>
                      {e.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="size-4 text-brand-gold" />
                          <dd>{e.location}</dd>
                        </div>
                      )}
                    </dl>
                    {e.description && (
                      <p className="mt-3 line-clamp-2 text-sm text-ink-muted">{e.description}</p>
                    )}
                    <div className="mt-auto pt-5">
                      <Button href={`/events/${e.slug}`} size="sm">
                        {e.registration_open ? "Register" : "View details"}
                      </Button>
                    </div>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        ) : (
          <Card className="flex flex-col items-center gap-3 py-20 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-brand-green/10 text-brand-gold">
              <CalendarDays className="size-7" strokeWidth={1.5} />
            </span>
            <p className="text-lg text-ink">No upcoming events right now.</p>
            <p className="text-base text-ink-muted">Check back soon - new events are on the way.</p>
          </Card>
        )}

        <div className="mt-12 flex justify-center border-t border-border pt-10">
          <Link
            href="/events/archive"
            className="inline-flex items-center gap-2 text-base font-medium text-brand-green hover:text-brand-green-light"
          >
            Looking for past events? Visit the archive <ArrowRight className="size-4" />
          </Link>
        </div>
      </Section>
    </>
  );
}

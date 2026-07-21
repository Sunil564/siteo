import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Placeholder } from "@/components/ui/placeholder";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { formatEventDate, MODE_LABEL } from "@/lib/format";
import type { PublicEvent } from "@/lib/api";

/** Events teaser (§4.1): next upcoming event pulled live from the DB, with a
 *  graceful empty state, plus a link to the full list. */
export function EventsTeaser({ events }: { events: PublicEvent[] }) {
  const next = events[0];

  return (
    <Section tone="surface">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading
          eyebrow="WHAT'S ON"
          eyebrowHi="आगामी कार्यक्रम"
          title="Upcoming events"
          className="max-w-2xl"
        />
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-base font-medium text-brand-green hover:text-brand-green-light"
        >
          View all events <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="mt-12">
        {next ? (
          <Reveal>
            <Card interactive className="grid gap-8 p-0 md:grid-cols-2 md:p-0">
              <Placeholder
                slot={{ src: next.banner_image, alt: next.title, ratio: "16:9", kind: "event" }}
                rounded={false}
                className="md:h-full md:rounded-l-card"
              />
              <div className="flex flex-col justify-center p-6 md:p-8">
                <span className="inline-flex w-fit rounded-full bg-brand-green/8 px-3 py-1 text-sm font-medium text-brand-green">
                  {MODE_LABEL[next.mode] ?? next.mode}
                </span>
                <h3 className="mt-4 text-h4">{next.title}</h3>
                <dl className="mt-3 space-y-1.5 text-sm text-ink-muted">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="size-4 text-brand-gold" />
                    <dd>{formatEventDate(next.starts_at)}</dd>
                  </div>
                  {next.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 text-brand-gold" />
                      <dd>{next.location}</dd>
                    </div>
                  )}
                </dl>
                {next.description && (
                  <p className="mt-4 line-clamp-2 text-base text-ink-muted">{next.description}</p>
                )}
                <div className="mt-6">
                  <Button href={`/events/${next.slug}`} size="sm">
                    Register
                  </Button>
                </div>
              </div>
            </Card>
          </Reveal>
        ) : (
          <Card className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-brand-green/10 text-brand-gold">
              <CalendarDays className="size-7" strokeWidth={1.5} />
            </span>
            <p className="text-lg text-ink">No upcoming events right now.</p>
            <p className="text-base text-ink-muted">Check back soon — new events are on the way.</p>
          </Card>
        )}
      </div>
    </Section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Placeholder } from "@/components/ui/placeholder";
import { Section } from "@/components/ui/section";
import { EventRegisterForm } from "@/components/forms/event-register-form";
import { getEventBySlug } from "@/lib/api";
import { formatEventDate, MODE_LABEL } from "@/lib/format";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Event" };
  return {
    title: event.title,
    description: event.description?.slice(0, 160) ?? `Register for ${event.title}.`,
  };
}

export default async function EventDetailPage({ params }: Params) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const registerClosed = !event.registration_open;
  const isFull = event.capacity !== null && event.spots_left !== null && event.spots_left <= 0;

  return (
    <>
      {/* Header */}
      <section className="bg-brand-green text-surface">
        <Container className="py-14 md:py-20">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm text-surface/70 hover:text-surface"
          >
            <ArrowLeft className="size-4" /> All events
          </Link>
          <div className="mt-6">
            <Eyebrow onDark>{MODE_LABEL[event.mode] ?? event.mode}</Eyebrow>
            <h1 className="mt-4 text-h2 text-surface md:text-h1">{event.title}</h1>
            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-surface/85">
              <div className="flex items-center gap-2">
                <CalendarDays className="size-5 text-brand-gold" />
                <dd>{formatEventDate(event.starts_at)}</dd>
              </div>
              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="size-5 text-brand-gold" />
                  <dd>{event.location}</dd>
                </div>
              )}
              {event.capacity !== null && event.spots_left !== null && (
                <div className="flex items-center gap-2">
                  <Users className="size-5 text-brand-gold" />
                  <dd>{event.spots_left > 0 ? `${event.spots_left} spots left` : "Full"}</dd>
                </div>
              )}
            </dl>
          </div>
        </Container>
      </section>

      <Section tone="surface">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          {/* Description */}
          <div>
            <Placeholder
              slot={{ src: event.banner_image, alt: event.title, ratio: "16:9", kind: "event" }}
            />
            {event.description && (
              <p className="mt-8 whitespace-pre-line text-lg leading-relaxed text-ink-muted">
                {event.description}
              </p>
            )}
          </div>

          {/* Registration */}
          <div>
            <div className="lg:sticky lg:top-24">
              <h2 className="text-h4 text-brand-green">Register</h2>
              <div className="mt-5">
                {event.is_paid ? (
                  <Card className="text-center">
                    <p className="text-base text-ink">This is a paid event.</p>
                    <p className="mt-2 text-sm text-ink-muted">
                      Online payment is coming soon. Please contact us to register in the meantime.
                    </p>
                  </Card>
                ) : registerClosed || isFull ? (
                  <Card className="text-center">
                    <p className="text-base text-ink">
                      {isFull ? "This event is full." : "Registration is closed."}
                    </p>
                    <p className="mt-2 text-sm text-ink-muted">
                      Check back later or reach out if you have questions.
                    </p>
                  </Card>
                ) : (
                  <EventRegisterForm slug={event.slug} customFields={event.custom_fields ?? []} />
                )}
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

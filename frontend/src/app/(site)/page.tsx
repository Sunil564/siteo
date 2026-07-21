import { Hero } from "@/components/home/hero";
import { Pillars } from "@/components/home/pillars";
import { CommunityBand } from "@/components/home/community-band";
import { FocusAreas } from "@/components/home/focus-areas";
import { EventsTeaser } from "@/components/home/events-teaser";
import { CapitalTeaser } from "@/components/home/capital-teaser";
import { ArchiveTeaser } from "@/components/home/archive-teaser";
import { getPublishedEvents } from "@/lib/api";

export default async function HomePage() {
  const events = await getPublishedEvents();

  return (
    <>
      <Hero />
      <Pillars />
      <CommunityBand />
      <FocusAreas />
      <EventsTeaser events={events} />
      <CapitalTeaser />
      <ArchiveTeaser />
    </>
  );
}

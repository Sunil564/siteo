/**
 * Static archive content (§6). NOT from any database - these are Sunil-provided
 * headline facts, hardcoded. The photo gallery is built from placeholder slots
 * so real images drop in here with a one-file change (set `src`).
 */
import type { ImageSlot } from "./images";

export type ArchiveEvent = {
  slug: string;
  title: string;
  dates: string;
  venue: string;
  stats: { label: string; value: string }[];
  story: string[];
  partners: { platinum: string[]; gold: string[] };
  photos: ImageSlot[];
};

function galleryPhotos(alts: string[]): ImageSlot[] {
  return alts.map((alt) => ({ src: null, alt, ratio: "4:3", kind: "gallery" }));
}

export const seerviExpo2026: ArchiveEvent = {
  slug: "seervi-expo-2026",
  title: "Seervi Expo 2026",
  dates: "June 27-28, 2026",
  venue: "Varin International Residential School, Tumkur",
  stats: [
    { label: "Attendees", value: "11,000+" },
    { label: "Industry Zones", value: "6+" },
    { label: "Exhibitors", value: "50+" },
    { label: "Business Sessions", value: "Both days" },
  ],
  story: [
    "Seervi Expo 2026 was SITEO's launch event - two days when the community's businesses, students, and families came together in one place for the first time at this scale.",
    "It was community-driven from the start: exhibitors, volunteers, and visitors who wanted to see what the community could build together. It became the first step toward SITEO as a lasting platform.",
  ],
  // Public partner names only. To be filled in when confirmed.
  partners: { platinum: [], gold: [] },
  photos: galleryPhotos([
    "Exhibition hall at Seervi Expo 2026",
    "Visitors at an exhibitor stall",
    "A business session in progress",
    "The community gathered at the venue",
    "Attendees in conversation",
    "Wide view of an industry zone",
  ]),
};

export const archiveEvents: ArchiveEvent[] = [seerviExpo2026];

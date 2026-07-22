/**
 * Central image config (§6). No real photos exist yet - every visual is a
 * branded <Placeholder>. When real images arrive they drop in here in ONE place
 * with zero layout shift (aspect ratios are fixed).
 *
 * `src: null` => render the branded placeholder. Set a path to swap in a real
 * image later.
 */

export type AspectRatio = "16:9" | "4:3" | "1:1" | "21:9";

export type ImageSlot = {
  src: string | null;
  alt: string;
  ratio: AspectRatio;
  /** Content type drives which line-icon the placeholder shows. */
  kind: "event" | "people" | "building" | "gallery";
};

export const images = {
  homeHero: {
    src: null,
    alt: "Members of the Seervi community at a SITEO gathering",
    ratio: "4:3",
    kind: "people",
  },
  communityBand: {
    src: null,
    alt: "The community gathered at a SITEO event",
    ratio: "21:9",
    kind: "people",
  },
  archiveTeaser: {
    src: null,
    alt: "Crowds at Seervi Expo 2026",
    ratio: "16:9",
    kind: "event",
  },
} satisfies Record<string, ImageSlot>;

export const ASPECT_CLASS: Record<AspectRatio, string> = {
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  "1:1": "aspect-square",
  "21:9": "aspect-[21/9]",
};

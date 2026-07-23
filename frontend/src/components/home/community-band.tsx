import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ScaleOnScroll } from "@/components/ui/scale-on-scroll";
import { images } from "@/lib/images";

/**
 * Full-bleed image band (§ redesign): breaks the light-surface rhythm and gives
 * photography presence. Green base + dot texture stands in for the photo; a real
 * image drops into the ScaleOnScroll layer with a one-line change. Green overlay
 * guarantees text legibility per §6.
 */
export function CommunityBand() {
  return (
    <section
      className="relative flex h-[380px] items-center overflow-hidden bg-gradient-green text-surface md:h-[460px]"
      aria-label={images.communityBand.alt}
    >
      {/* Visual layer (subtle scale on scroll) */}
      <ScaleOnScroll className="absolute inset-0" from={1.08} to={1}>
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "radial-gradient(circle at center, color-mix(in srgb, var(--surface) 10%, transparent) 1px, transparent 1.5px)",
            backgroundSize: "18px 18px",
          }}
        />
      </ScaleOnScroll>
      {/* Green legibility overlay */}
      <div aria-hidden className="absolute inset-0 bg-brand-green/60" />

      <Container className="relative">
        <div className="max-w-2xl">
          <Eyebrow hi="समुदाय" onDark>
            OUR COMMUNITY
          </Eyebrow>
          <p className="mt-4 font-display text-h3 text-surface md:text-h2">
            Real people. Real events. A community showing up for one another.
          </p>
        </div>
      </Container>
    </section>
  );
}

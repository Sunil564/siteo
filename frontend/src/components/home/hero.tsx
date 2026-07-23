import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Placeholder } from "@/components/ui/placeholder";
import { images } from "@/lib/images";
import { org } from "@/lib/site";

/**
 * Home hero (§4.1) as an arrival: deep-green gradient field with a soft gold
 * glow, oversized display type, asymmetric text/visual split. The heading runs
 * an animated logo-color shimmer (subtle "twinkle") through the wordmark.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-green text-surface">
      {/* Soft gold glow for premium depth */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: "var(--glow-gold)" }} />

      <Container className="relative z-10 grid min-h-[86vh] items-center gap-12 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-24">
        {/* Text */}
        <div className="max-w-xl">
          <Eyebrow hi="व्यापार · शिक्षा · विकास" onDark>
            TRADE · EDUCATION · DEVELOPMENT
          </Eyebrow>

          <h1 className="brand-shimmer mt-6 text-h1 md:text-display">{org.fullName}</h1>

          <div className="mt-6 h-px w-24 bg-brand-gold" aria-hidden />

          <p lang="hi" className="font-hindi mt-6 text-lg text-brand-gold-soft md:text-h4">
            {org.tagline}
          </p>
          <p className="mt-4 max-w-md text-lg text-surface/80">
            A permanent, community-first platform - built to last for generations.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button href="/initiatives">
              Explore Initiatives <ArrowRight className="size-4" />
            </Button>
            <Button href="/events" variant="secondary" onDark>
              Upcoming Events
            </Button>
          </div>
        </div>

        {/* Visual with offset gold accent */}
        <div className="relative">
          <div
            aria-hidden
            className="absolute -right-4 -top-4 h-full w-full rounded-card border border-brand-gold/40"
          />
          <Placeholder
            slot={images.homeHero}
            priority
            onDark
            className="relative shadow-[0_24px_60px_-24px_rgba(0,0,0,0.5)]"
          />
        </div>
      </Container>
    </section>
  );
}

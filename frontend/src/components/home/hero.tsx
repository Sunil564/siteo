import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { org } from "@/lib/site";

/**
 * Home hero (§4.1): flat deep-green field, gold accents (no gradient — that's
 * the archive's signature). Bilingual. H1 is the full org name; display size on
 * desktop, stepped down on mobile per §4.
 */
export function Hero() {
  return (
    <section className="bg-brand-green text-surface">
      <Container className="py-20 md:py-28 lg:py-32">
        <div className="max-w-3xl">
          <Eyebrow hi="व्यापार · शिक्षा · विकास" onDark>
            TRADE · EDUCATION · DEVELOPMENT
          </Eyebrow>

          <h1 className="mt-6 text-h1 text-surface md:text-display">
            {org.fullName}
          </h1>

          <div className="mt-6 h-px w-24 bg-brand-gold" aria-hidden />

          <p lang="hi" className="font-hindi mt-6 text-lg text-brand-gold-soft md:text-h4">
            {org.tagline}
          </p>
          <p className="mt-3 max-w-[var(--container-readable)] text-lg text-surface/80">
            A permanent, community-first platform bringing the Seervi community&apos;s trade,
            education, and development together — built to last for generations.
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
      </Container>
    </section>
  );
}

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";

/** Seervi Capital teaser (§4.1 / §4.4): qualitative, no figures. */
export function CapitalTeaser() {
  return (
    <section className="bg-brand-green text-surface">
      <Container className="py-16 md:py-24">
        <div className="max-w-[var(--container-readable)]">
          <Eyebrow hi="सीरवी कैपिटल" onDark>
            SEERVI CAPITAL
          </Eyebrow>
          <h2 className="mt-4 text-h3 text-surface md:text-h2">
            The financial and investment arm of SITEO
          </h2>
          <p className="mt-5 text-lg text-surface/80">
            Seervi Capital supports community businesses, startups, education, and senior welfare
            through capital, guidance, and investment — helping good ideas and good people find the
            backing they need to grow.
          </p>
          <div className="mt-8">
            <Button href="/seervi-capital" variant="secondary" onDark>
              Express Interest <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

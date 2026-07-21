import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/ui/reveal";

/** Seervi Capital teaser (§4.1 / §4.4): centered narrow prose on green,
 *  qualitative, no figures. */
export function CapitalTeaser() {
  return (
    <section className="bg-brand-green text-surface">
      <Container className="py-20 md:py-28">
        <Reveal className="mx-auto flex max-w-[var(--container-readable)] flex-col items-center text-center">
          <Eyebrow hi="सीरवी कैपिटल" onDark>
            SEERVI CAPITAL
          </Eyebrow>
          <h2 className="mt-4 text-h3 text-surface md:text-h2">
            The financial and investment arm of SITEO
          </h2>
          <p className="mt-5 text-lg text-surface/80">
            Backing community businesses, startups, education, and senior welfare with capital,
            guidance, and investment.
          </p>
          <div className="mt-8">
            <Button href="/seervi-capital" variant="secondary" onDark>
              Express Interest <ArrowRight className="size-4" />
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

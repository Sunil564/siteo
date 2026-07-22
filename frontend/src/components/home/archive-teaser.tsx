import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { CountUp } from "@/components/ui/count-up";
import { Eyebrow } from "@/components/ui/eyebrow";
import { expoStats } from "@/lib/site";

/**
 * Legacy / archive teaser (§4.1). This is the ONLY element on SITEO org pages
 * that uses the reserved purple gradient (§3 exception) — it marks the distinct
 * "expo era". Numerals set in white for contrast on the gradient (gold-on-green
 * stays SITEO's signature; the archive has its own identity).
 */
export function ArchiveTeaser() {
  return (
    <section
      className="text-white"
      style={{ backgroundImage: "var(--archive-gradient)" }}
    >
      <Container className="py-16 md:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow onDark className="text-white/80">
              THE EXPO ERA · 2026
            </Eyebrow>
            <h2 className="mt-4 text-h3 text-white md:text-h2">Seervi Expo 2026</h2>
            <p className="mt-4 max-w-xl text-lg text-white/85">
              SITEO&apos;s launch event — a community-driven exhibition and the first step toward the
              platform. Now preserved as a retrospective.
            </p>
            <div className="mt-8">
              <Button
                href="/events/archive/seervi-expo-2026"
                className="bg-white text-[color:var(--archive-from)] hover:bg-white/90"
              >
                Explore the archive <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>

          <dl className="grid grid-cols-3 gap-3 sm:gap-4">
            {expoStats.map((s) => (
              <div key={s.label} className="min-w-0 text-center">
                <dd className="whitespace-nowrap font-display text-h4 font-semibold leading-none tabular-nums text-white sm:text-h3 lg:text-h2">
                  <CountUp value={s.value} />
                </dd>
                <dt className="mt-2 text-sm text-white/70">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}

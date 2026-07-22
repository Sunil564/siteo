import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { Prose } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";
import { contact } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms for using the SITEO website and taking part in SITEO events.",
};

export default function TermsPage() {
  return (
    <>
      <PageHero tone="surface" eyebrow="LEGAL" title="Terms of Use" intro="The basics of using this site and taking part in SITEO." />
      <Section tone="surface">
        <Prose>
          <p><strong>Last updated:</strong> July 2026. These terms may be updated from time to time.</p>

          <h2>Using this site</h2>
          <p>
            This website is provided by SITEO for information about the organization and its
            activities. Please use it lawfully and don&apos;t attempt to disrupt or misuse it.
          </p>

          <h2>Events &amp; registration</h2>
          <p>
            When you register for an event, please provide accurate details. Events may have limited
            capacity, and specifics - timing, venue, or format - can change; we&apos;ll do our best to
            keep you informed of any changes.
          </p>

          <h2>Content</h2>
          <p>
            The SITEO name, logo, and content on this site belong to SITEO. Please don&apos;t reuse
            them without permission.
          </p>

          <h2>No guarantees</h2>
          <p>
            We work to keep information accurate and the site available, but we can&apos;t guarantee it
            will always be error-free or uninterrupted.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these terms? Reach us at <a href={contact.emailHref}>{contact.email}</a>{" "}
            or {contact.phone}.
          </p>
        </Prose>
      </Section>
    </>
  );
}

import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { Prose } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";
import { contact } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How SITEO collects, uses, and protects the information you share with us.",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero tone="surface" eyebrow="LEGAL" title="Privacy Policy" intro="How we handle the information you share with SITEO." />
      <Section tone="surface">
        <Prose>
          <p><strong>Last updated:</strong> July 2026. This is a starting policy and may be updated as SITEO grows.</p>

          <h2>What we collect</h2>
          <p>
            We only collect what you give us through our forms - typically your name, phone number,
            and (optionally) email, along with the details relevant to your enquiry, event
            registration, or membership interest.
          </p>

          <h2>How we use it</h2>
          <ul>
            <li>To respond to your enquiries and requests.</li>
            <li>To confirm event registrations and send you the details you need.</li>
            <li>To keep you informed about the specific thing you contacted us about.</li>
          </ul>

          <h2>WhatsApp messages</h2>
          <p>
            Confirmations and acknowledgements are sent over WhatsApp using the number you provide.
            We use WhatsApp only for these transactional messages - not for bulk marketing.
          </p>

          <h2>What we don&apos;t do</h2>
          <p>
            We do not sell your information, and we don&apos;t share it with third parties except as
            needed to operate the services above (for example, the messaging provider that delivers
            your WhatsApp confirmation).
          </p>

          <h2>Your choices</h2>
          <p>
            You can ask us to access or delete the information you&apos;ve shared at any time. Just
            contact us at <a href={contact.emailHref}>{contact.email}</a> or {contact.phone}.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about this policy? Reach us at <a href={contact.emailHref}>{contact.email}</a>.
          </p>
        </Prose>
      </Section>
    </>
  );
}

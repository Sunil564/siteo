import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { EnquiryForm } from "@/components/forms/enquiry-form";

export const metadata: Metadata = {
  title: "Enquiry",
  description:
    "Have a question for SITEO? Send an enquiry and get a tracked reference number to follow up with.",
};

export default function EnquiryPage() {
  return (
    <>
      <PageHero
        eyebrow="ENQUIRY"
        eyebrowHi="पूछताछ"
        title="Ask us anything"
        intro="Questions about membership, events, partnerships, or media - send them here. You'll get a reference number so you can follow up any time."
      />

      <Section tone="surface">
        <div className="mx-auto max-w-2xl">
          <SectionHeading
            align="center"
            eyebrow="SEND AN ENQUIRY"
            eyebrowHi="संदेश भेजें"
            title="How can we help?"
            intro="We'll reply as soon as we can, and send your reference number to WhatsApp."
          />
          <div className="mt-10">
            <EnquiryForm />
          </div>
        </div>
      </Section>
    </>
  );
}

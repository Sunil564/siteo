import type { Metadata } from "next";
import { Instagram, Mail, MessageCircle, Phone } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { ContactForm } from "@/components/forms/contact-form";
import { contact } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with SITEO by phone, WhatsApp, Instagram, or email.",
};

const channels = [
  { icon: Phone, label: "Phone", value: contact.phone, href: contact.phoneHref },
  { icon: MessageCircle, label: "WhatsApp", value: "Message us", href: contact.whatsappHref },
  { icon: Instagram, label: "Instagram", value: `@${contact.instagram}`, href: contact.instagramHref },
  { icon: Mail, label: "Email", value: contact.email, href: contact.emailHref },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="CONTACT"
        eyebrowHi="संपर्क"
        title="Get in touch"
        intro="Reach us directly, or send a message and we'll get back to you."
      />

      <Section tone="surface">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <SectionHeading eyebrow="REACH US" eyebrowHi="हमसे जुड़ें" title="Direct channels" />
            <ul className="mt-8 flex flex-col gap-4">
              {channels.map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    className="group flex items-center gap-4 rounded-card border border-border bg-surface-card p-4 transition-colors hover:border-brand-gold/50"
                  >
                    <span className="flex size-11 items-center justify-center rounded-full bg-brand-green text-brand-gold">
                      <c.icon className="size-5" strokeWidth={1.75} />
                    </span>
                    <span>
                      <span className="block text-sm text-ink-muted">{c.label}</span>
                      <span className="block text-base font-medium text-ink">{c.value}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <SectionHeading eyebrow="SEND A MESSAGE" eyebrowHi="संदेश भेजें" title="Write to us" />
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

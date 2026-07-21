import Link from "next/link";
import { Instagram, Mail, MessageCircle, Phone } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SiteoLogo } from "@/components/brand/logo";
import { contact, footerLinks, legalLinks, org } from "@/lib/site";

export function Footer() {
  const year = 2026; // static; site launch year. Bump when needed.
  return (
    <footer className="bg-brand-green text-surface">
      <Container className="py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Org blurb */}
          <div className="max-w-xs">
            <SiteoLogo variant="mono" tone="white" className="w-28" />
            <p className="mt-4 text-sm leading-relaxed text-surface/70">{org.fullName}</p>
            <p lang="hi" className="font-hindi mt-3 text-sm text-surface/60">
              {org.tagline}
            </p>
          </div>

          {/* Link columns */}
          {footerLinks.map((col) => (
            <div key={col.title}>
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-gold-soft">
                {col.title}
              </h2>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-surface/80 transition-colors hover:text-surface"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact row */}
        <div className="mt-14 flex flex-wrap gap-x-8 gap-y-4 border-t border-surface/15 pt-8 text-sm">
          <a href={contact.phoneHref} className="inline-flex items-center gap-2 text-surface/80 hover:text-surface">
            <Phone className="size-4 text-brand-gold" /> {contact.phone}
          </a>
          <a href={contact.whatsappHref} className="inline-flex items-center gap-2 text-surface/80 hover:text-surface">
            <MessageCircle className="size-4 text-brand-gold" /> WhatsApp
          </a>
          <a href={contact.instagramHref} className="inline-flex items-center gap-2 text-surface/80 hover:text-surface">
            <Instagram className="size-4 text-brand-gold" /> @{contact.instagram}
          </a>
          <a href={contact.emailHref} className="inline-flex items-center gap-2 text-surface/80 hover:text-surface">
            <Mail className="size-4 text-brand-gold" /> {contact.email}
          </a>
        </div>

        {/* Legal + attribution */}
        <div className="mt-8 flex flex-col items-start justify-between gap-4 text-xs text-surface/60 md:flex-row md:items-center">
          <p>© {year} {org.name}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-surface">
                {link.label}
              </Link>
            ))}
            <span>Powered by Code&amp;Clicks.</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}

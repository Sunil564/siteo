"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { navLinks, org } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

function Wordmark({ onDark = false }: { onDark?: boolean }) {
  return (
    <span className="font-display text-h4 font-bold tracking-tight">
      <span className={onDark ? "text-surface" : "text-brand-green"}>SIT</span>
      <span className="text-brand-gold">E</span>
      <span className={onDark ? "text-surface" : "text-brand-green"}>O</span>
    </span>
  );
}

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile overlay is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-surface/95 backdrop-blur transition-shadow",
        scrolled && "border-b border-border",
      )}
    >
      <Container className="flex h-16 items-center justify-between md:h-20">
        <Link href="/" aria-label={`${org.name} home`} className="flex items-center">
          <Wordmark />
        </Link>

        {/* Desktop links */}
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {navLinks.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-base transition-colors hover:text-brand-green",
                  active ? "font-medium text-brand-green" : "text-ink-muted",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block">
          <Button href="/membership" size="sm">
            Get Involved
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="flex size-11 items-center justify-center text-brand-green md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </Container>

      {/* Mobile full-screen overlay */}
      {open && (
        <div className="fixed inset-0 top-16 z-40 bg-surface md:hidden">
          <Container className="flex flex-col gap-1 py-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center border-b border-border text-h4 text-brand-green"
              >
                {link.label}
              </Link>
            ))}
            <Button href="/membership" className="mt-6 w-full" onClick={() => setOpen(false)}>
              Get Involved
            </Button>
          </Container>
        </div>
      )}
    </header>
  );
}

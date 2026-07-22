/**
 * Site content + config. Pages assemble from this; copy is bilingual per the
 * brand voice (§2). Icons come from a single family (lucide) per §7.
 */
import {
  Building2,
  BookOpen,
  HandHeart,
  Handshake,
  GraduationCap,
  Rocket,
  Store,
  TrendingUp,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export const org = {
  name: "SITEO",
  fullName: "Seervi International Trade & Education Organization",
  tagline: "समाज के व्यापार, शिक्षा एवं विकास का संगठित मंच",
  taglineEn: "A community platform for trade, education, and development",
  domain: "siteo.in",
};

export const contact = {
  phone: "+91 70264 97770",
  phoneHref: "tel:+917026497770",
  whatsappHref: "https://wa.me/917026497770",
  instagram: "seervibusinessexpo",
  instagramHref: "https://instagram.com/seervibusinessexpo",
  email: "seervibusinessexpo@gmail.com",
  emailHref: "mailto:seervibusinessexpo@gmail.com",
};

export type NavLink = { label: string; href: string };

export const navLinks: NavLink[] = [
  { label: "About", href: "/about" },
  { label: "Initiatives", href: "/initiatives" },
  { label: "Events", href: "/events" },
  { label: "Membership", href: "/membership" },
  { label: "Contact", href: "/contact" },
];

export const footerLinks: { title: string; links: NavLink[] }[] = [
  {
    title: "Organization",
    links: [
      { label: "About", href: "/about" },
      { label: "Initiatives", href: "/initiatives" },
      { label: "Seervi Capital", href: "/seervi-capital" },
      { label: "Chapters", href: "/chapters" },
    ],
  },
  {
    title: "Get Involved",
    links: [
      { label: "Events", href: "/events" },
      { label: "Membership", href: "/membership" },
      { label: "Enquiry", href: "/enquiry" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legacy",
    links: [
      { label: "Events Archive", href: "/events/archive" },
      { label: "Seervi Expo 2026", href: "/events/archive/seervi-expo-2026" },
    ],
  },
];

export const legalLinks: NavLink[] = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export type Pillar = { icon: LucideIcon; title: string; titleHi: string; body: string };

export const pillars: Pillar[] = [
  {
    icon: Handshake,
    title: "Trade & Commerce",
    titleHi: "व्यापार एवं वाणिज्य",
    body: "Connecting businesses and opening markets across the community.",
  },
  {
    icon: GraduationCap,
    title: "Education & Skill",
    titleHi: "शिक्षा एवं कौशल",
    body: "Backing students and building industry-ready skills.",
  },
  {
    icon: Users,
    title: "Community",
    titleHi: "समुदाय",
    body: "Welfare, connection, and belonging at every stage of life.",
  },
];

export type FocusArea = { icon: LucideIcon; title: string; body: string };

export const focusAreas: FocusArea[] = [
  { icon: Store, title: "Seervi Expo", body: "The flagship community trade exhibition." },
  { icon: Wrench, title: "Skill Development", body: "Industry-aligned training for real livelihoods." },
  { icon: BookOpen, title: "Education Support", body: "Guidance for students pursuing higher education." },
  { icon: Rocket, title: "Startup Incubation", body: "Mentoring and momentum for new founders." },
  { icon: HandHeart, title: "Senior Citizen Village", body: "A planned wellness community for elders." },
  { icon: TrendingUp, title: "Trade Promotion", body: "Networks and directories that grow trade." },
  { icon: Handshake, title: "CSR", body: "Social responsibility that gives back with intent." },
  { icon: Building2, title: "Community Development", body: "Institutions built to last for generations." },
];

/** Static expo headline stats (§6) - hardcoded, not from any database. */
export const expoStats = [
  { value: "11,000+", label: "Attendees" },
  { value: "6+", label: "Industry Zones" },
  { value: "50+", label: "Exhibitors" },
];

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Mail, MessageSquare, UserPlus } from "lucide-react";
import { AdminHeader, StatusPill } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/format";
import { listContact, listEnquiries, listMembership, type Enquiry } from "@/lib/admin";

type Counts = { open: number; enquiries: number; membership: number; contact: number };

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [recent, setRecent] = useState<Enquiry[]>([]);

  useEffect(() => {
    (async () => {
      const [enq, mem, con] = await Promise.all([listEnquiries({}), listMembership(), listContact()]);
      setCounts({
        open: enq.filter((e) => e.status === "open").length,
        enquiries: enq.length,
        membership: mem.length,
        contact: con.length,
      });
      setRecent(enq.slice(0, 6));
    })();
  }, []);

  const cards = [
    { label: "Open enquiries", value: counts?.open, href: "/admin/enquiries", icon: MessageSquare, accent: true },
    { label: "All enquiries", value: counts?.enquiries, href: "/admin/enquiries", icon: MessageSquare },
    { label: "Membership interest", value: counts?.membership, href: "/admin/membership", icon: UserPlus },
    { label: "Contact messages", value: counts?.contact, href: "/admin/contact", icon: Mail },
  ];

  return (
    <>
      <AdminHeader title="Dashboard" subtitle="Submissions across the site." />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-card border border-border bg-surface-card p-5 transition-colors hover:border-brand-gold/50"
          >
            <div className="flex items-center justify-between">
              <c.icon className="size-5 text-brand-gold" />
              <ArrowRight className="size-4 text-ink-muted" />
            </div>
            <p className="mt-4 font-display text-h2 font-semibold leading-none text-brand-green tabular-nums">
              {c.value ?? "-"}
            </p>
            <p className="mt-2 text-sm text-ink-muted">{c.label}</p>
          </Link>
        ))}
      </div>

      <h2 className="mb-4 mt-10 text-h4 text-brand-green">Recent enquiries</h2>
      <div className="overflow-x-auto rounded-card border border-border bg-surface-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-ink-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Ref</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Subject</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Received</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ink-muted">
                  {counts ? "No enquiries yet." : "Loading..."}
                </td>
              </tr>
            ) : (
              recent.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-brand-green">{r.enquiry_no}</td>
                  <td className="px-4 py-3">{r.name}</td>
                  <td className="max-w-xs truncate px-4 py-3">{r.subject}</td>
                  <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-muted">{formatDateTime(r.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <Link href="/admin/enquiries" className="inline-flex items-center gap-2 text-base font-medium text-brand-green hover:text-brand-green-light">
          Manage all enquiries <ArrowRight className="size-4" />
        </Link>
      </div>
    </>
  );
}

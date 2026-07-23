"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { AdminEmpty, AdminHeader } from "@/components/admin/ui";
import { Input } from "@/components/ui/form";
import { formatDateTime } from "@/lib/format";
import { listMembership, type Membership } from "@/lib/admin";

export default function MembershipPage() {
  const [rows, setRows] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Membership | null>(null);

  useEffect(() => {
    setLoading(true);
    listMembership(q || undefined).then((d) => {
      setRows(d);
      setLoading(false);
    });
  }, [q]);

  useEffect(() => {
    const t = setTimeout(() => setQ(qInput.trim()), 300);
    return () => clearTimeout(t);
  }, [qInput]);

  return (
    <>
      <AdminHeader title="Membership interest" subtitle="People who want to join SITEO." />

      <div className="mb-5">
        <Input
          placeholder="Search name, phone, email, city"
          value={qInput}
          onChange={(e) => setQInput(e.target.value)}
          className="h-11 max-w-xs"
        />
      </div>

      {loading ? (
        <AdminEmpty message="Loading..." />
      ) : rows.length === 0 ? (
        <AdminEmpty message="No membership submissions yet." />
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-surface-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">City</th>
                <th className="px-4 py-3 font-medium">Interest</th>
                <th className="px-4 py-3 font-medium">Received</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setSelected(r)}
                  className="cursor-pointer border-b border-border last:border-0 hover:bg-surface"
                >
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-muted">{r.phone}</td>
                  <td className="px-4 py-3 text-ink-muted">{r.city || "-"}</td>
                  <td className="px-4 py-3 text-ink-muted">{r.category || "-"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-muted">{formatDateTime(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <>
          <div className="fixed inset-0 z-40 bg-ink/40" onClick={() => setSelected(null)} />
          <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto bg-surface-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border p-5">
              <h2 className="text-h4 text-brand-green">{selected.name}</h2>
              <button type="button" onClick={() => setSelected(null)} aria-label="Close" className="flex size-10 items-center justify-center text-ink-muted hover:text-ink">
                <X className="size-5" />
              </button>
            </div>
            <div className="flex flex-col gap-4 p-5 text-sm">
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                <dt className="text-ink-muted">Phone</dt>
                <dd><a href={`tel:${selected.phone}`} className="text-brand-green underline decoration-brand-gold">{selected.phone}</a></dd>
                <dt className="text-ink-muted">Email</dt>
                <dd>{selected.email || "-"}</dd>
                <dt className="text-ink-muted">City</dt>
                <dd>{selected.city || "-"}</dd>
                <dt className="text-ink-muted">Interest</dt>
                <dd>{selected.category || "-"}</dd>
                <dt className="text-ink-muted">Received</dt>
                <dd>{formatDateTime(selected.created_at)}</dd>
              </dl>
              {selected.message && (
                <div>
                  <p className="mb-1 text-ink-muted">Message</p>
                  <p className="whitespace-pre-line rounded-card border border-border bg-surface p-3">{selected.message}</p>
                </div>
              )}
            </div>
          </aside>
        </>
      )}
    </>
  );
}

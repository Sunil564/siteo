"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { AdminEmpty, AdminHeader, StatusPill } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/form";
import { formatDateTime } from "@/lib/format";
import {
  listEnquiries,
  updateEnquiry,
  type Enquiry,
  type EnquiryStatus,
} from "@/lib/admin";

const CATEGORIES = ["general", "membership", "event", "partnership", "media", "other"];
const STATUSES: EnquiryStatus[] = ["open", "responded", "closed"];

// Which transitions to offer from the current status.
const ACTIONS: Record<EnquiryStatus, { to: EnquiryStatus; label: string }[]> = {
  open: [
    { to: "responded", label: "Mark responded" },
    { to: "closed", label: "Mark closed" },
  ],
  responded: [
    { to: "closed", label: "Mark closed" },
    { to: "open", label: "Reopen" },
  ],
  closed: [{ to: "open", label: "Reopen" }],
};

export default function EnquiriesPage() {
  const [rows, setRows] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await listEnquiries({ category: category || undefined, status: status || undefined, q: q || undefined });
    setRows(data);
    setLoading(false);
  }, [category, status, q]);

  useEffect(() => {
    load();
  }, [load]);

  // Debounce the search box into q.
  useEffect(() => {
    const t = setTimeout(() => setQ(qInput.trim()), 300);
    return () => clearTimeout(t);
  }, [qInput]);

  function open(enq: Enquiry) {
    setSelected(enq);
    setNotes(enq.internal_notes ?? "");
  }

  async function changeStatus(to: EnquiryStatus) {
    if (!selected) return;
    setBusy(true);
    const res = await updateEnquiry(selected.id, { status: to });
    setBusy(false);
    if (res.ok) {
      setSelected(res.data);
      setRows((prev) => prev.map((r) => (r.id === res.data.id ? res.data : r)));
    }
  }

  async function saveNotes() {
    if (!selected) return;
    setBusy(true);
    const res = await updateEnquiry(selected.id, { internal_notes: notes });
    setBusy(false);
    if (res.ok) {
      setSelected(res.data);
      setRows((prev) => prev.map((r) => (r.id === res.data.id ? res.data : r)));
    }
  }

  return (
    <>
      <AdminHeader title="Enquiries" subtitle="Public enquiries, with tracked reference numbers." />

      <div className="mb-5 flex flex-wrap gap-3">
        <Input
          placeholder="Search name, phone, email, ref, subject"
          value={qInput}
          onChange={(e) => setQInput(e.target.value)}
          className="h-11 max-w-xs"
        />
        <Select value={category} onChange={(e) => setCategory(e.target.value)} className="h-11 w-auto">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c[0].toUpperCase() + c.slice(1)}
            </option>
          ))}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="h-11 w-auto">
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s[0].toUpperCase() + s.slice(1)}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <AdminEmpty message="Loading..." />
      ) : rows.length === 0 ? (
        <AdminEmpty message="No enquiries match these filters." />
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-surface-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Ref</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Received</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => open(r)}
                  className="cursor-pointer border-b border-border last:border-0 hover:bg-surface"
                >
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-brand-green">{r.enquiry_no}</td>
                  <td className="px-4 py-3">{r.name}</td>
                  <td className="px-4 py-3 capitalize text-ink-muted">{r.category}</td>
                  <td className="max-w-xs truncate px-4 py-3">{r.subject}</td>
                  <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-muted">{formatDateTime(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail drawer */}
      {selected && (
        <>
          <div className="fixed inset-0 z-40 bg-ink/40" onClick={() => setSelected(null)} />
          <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto bg-surface-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <p className="text-sm text-ink-muted">{selected.enquiry_no}</p>
                <h2 className="text-h4 text-brand-green">{selected.subject}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="flex size-10 items-center justify-center text-ink-muted hover:text-ink"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex flex-col gap-5 p-5">
              <div className="flex items-center gap-3">
                <StatusPill status={selected.status} />
                <span className="text-sm text-ink-muted">{formatDateTime(selected.created_at)}</span>
              </div>

              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                <dt className="text-ink-muted">Name</dt>
                <dd>{selected.name}</dd>
                <dt className="text-ink-muted">Phone</dt>
                <dd>
                  <a href={`tel:${selected.phone}`} className="text-brand-green underline decoration-brand-gold">
                    {selected.phone}
                  </a>
                </dd>
                <dt className="text-ink-muted">Email</dt>
                <dd>{selected.email || "-"}</dd>
                <dt className="text-ink-muted">Category</dt>
                <dd className="capitalize">{selected.category}</dd>
              </dl>

              <div>
                <p className="mb-1 text-sm text-ink-muted">Message</p>
                <p className="whitespace-pre-line rounded-card border border-border bg-surface p-3 text-sm">
                  {selected.message}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {ACTIONS[selected.status].map((a) => (
                  <Button key={a.to} size="sm" variant={a.to === "open" ? "secondary" : "primary"} disabled={busy} onClick={() => changeStatus(a.to)}>
                    {a.label}
                  </Button>
                ))}
              </div>

              <div>
                <label htmlFor="notes" className="mb-1 block text-sm font-medium text-ink">
                  Internal notes
                </label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-28" />
                <div className="mt-2">
                  <Button size="sm" variant="secondary" disabled={busy} onClick={saveNotes}>
                    Save notes
                  </Button>
                </div>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
import { AdminEmpty, AdminHeader } from "@/components/admin/ui";
import { Input, Select } from "@/components/ui/form";
import { formatDateTime } from "@/lib/format";
import {
  confirmRegistration,
  getAdminEvent,
  listRegistrations,
  registrationsExportUrl,
  resendConfirmation,
  type Registration,
} from "@/lib/admin";

export default function RegistrationsPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [title, setTitle] = useState("");
  const [rows, setRows] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState<number | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [selected, setSelected] = useState<Registration | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await listRegistrations(id, { q: q || undefined, status: status || undefined });
    setRows(data);
    setLoading(false);
  }, [id, q, status]);

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    getAdminEvent(id).then((e) => setTitle(e?.title ?? ""));
  }, [id]);
  useEffect(() => {
    const t = setTimeout(() => setQ(qInput.trim()), 300);
    return () => clearTimeout(t);
  }, [qInput]);

  function notify(msg: string) {
    setFlash(msg);
    setTimeout(() => setFlash(null), 2500);
  }

  async function confirm(r: Registration) {
    setBusy(r.id);
    await confirmRegistration(id, r.id);
    setBusy(null);
    notify(`Marked ${r.ref_id} confirmed.`);
    load();
  }
  async function resend(r: Registration) {
    setBusy(r.id);
    await resendConfirmation(id, r.id);
    setBusy(null);
    notify(`Resend triggered for ${r.ref_id}. (Delivery only happens when WhatsApp is enabled.)`);
    load();
  }

  return (
    <>
      <Link href="/admin/events" className="mb-4 inline-flex items-center gap-2 text-sm text-ink-muted hover:text-brand-green">
        <ArrowLeft className="size-4" /> All events
      </Link>
      <AdminHeader
        title="Registrations"
        subtitle={title}
        actions={
          <div className="flex gap-2">
            <a href={registrationsExportUrl(id, "csv")} className="inline-flex h-10 items-center rounded-card border border-brand-green px-4 text-sm font-medium text-brand-green hover:bg-brand-green hover:text-surface">
              Export CSV
            </a>
            <a href={registrationsExportUrl(id, "xlsx")} className="inline-flex h-10 items-center rounded-card border border-brand-green px-4 text-sm font-medium text-brand-green hover:bg-brand-green hover:text-surface">
              Export Excel
            </a>
          </div>
        }
      />

      {flash && <div className="mb-4 rounded-card border border-border bg-surface-card px-4 py-3 text-sm text-brand-green">{flash}</div>}

      <div className="mb-5 flex flex-wrap gap-3">
        <Input placeholder="Search name, phone, email, ref" value={qInput} onChange={(e) => setQInput(e.target.value)} className="h-11 max-w-xs" />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="h-11 w-auto">
          <option value="">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </div>

      {loading ? (
        <AdminEmpty message="Loading..." />
      ) : rows.length === 0 ? (
        <AdminEmpty message="No registrations match." />
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-surface-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Ref</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">WhatsApp</th>
                <th className="px-4 py-3 font-medium">Received</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="cursor-pointer whitespace-nowrap px-4 py-3 font-medium text-brand-green" onClick={() => setSelected(r)}>
                    {r.ref_id}
                  </td>
                  <td className="px-4 py-3">{r.name}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-muted">{r.phone}</td>
                  <td className="px-4 py-3 capitalize">{r.status}</td>
                  <td className="px-4 py-3 text-ink-muted">{r.whatsapp_sent ? "Sent" : "-"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-muted">{formatDateTime(r.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      {r.status !== "confirmed" && (
                        <button type="button" disabled={busy === r.id} onClick={() => confirm(r)} className="text-brand-green hover:underline disabled:opacity-50">
                          Confirm
                        </button>
                      )}
                      <button type="button" disabled={busy === r.id} onClick={() => resend(r)} className="text-ink-muted hover:text-brand-green disabled:opacity-50">
                        Resend
                      </button>
                    </div>
                  </td>
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
              <h2 className="text-h4 text-brand-green">{selected.ref_id}</h2>
              <button type="button" onClick={() => setSelected(null)} aria-label="Close" className="flex size-10 items-center justify-center text-ink-muted hover:text-ink">
                <X className="size-5" />
              </button>
            </div>
            <div className="flex flex-col gap-4 p-5 text-sm">
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                <dt className="text-ink-muted">Name</dt>
                <dd>{selected.name}</dd>
                <dt className="text-ink-muted">Phone</dt>
                <dd>{selected.phone}</dd>
                <dt className="text-ink-muted">Email</dt>
                <dd>{selected.email || "-"}</dd>
                <dt className="text-ink-muted">Status</dt>
                <dd className="capitalize">{selected.status}</dd>
              </dl>
              {selected.custom_field_answers && Object.keys(selected.custom_field_answers).length > 0 && (
                <div>
                  <p className="mb-1 text-ink-muted">Answers</p>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-card border border-border bg-surface p-3">
                    {Object.entries(selected.custom_field_answers).map(([k, v]) => (
                      <div key={k} className="contents">
                        <dt className="text-ink-muted">{k}</dt>
                        <dd>{String(v)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </aside>
        </>
      )}
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { AdminEmpty, AdminHeader } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import {
  deleteEvent,
  listAdminEvents,
  publishEvent,
  unpublishEvent,
  type AdminEvent,
} from "@/lib/admin";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);

  async function refresh() {
    setLoading(true);
    setEvents(await listAdminEvents());
    setLoading(false);
  }
  useEffect(() => {
    refresh();
  }, []);

  async function togglePublish(e: AdminEvent) {
    setBusy(e.id);
    await (e.is_published ? unpublishEvent(e.id) : publishEvent(e.id));
    setBusy(null);
    refresh();
  }
  async function remove(e: AdminEvent) {
    if (!window.confirm(`Delete "${e.title}"? This hides it from the site.`)) return;
    setBusy(e.id);
    await deleteEvent(e.id);
    setBusy(null);
    refresh();
  }

  return (
    <>
      <AdminHeader
        title="Events"
        subtitle="Create and manage events and their registrations."
        actions={<Button href="/admin/events/new" size="sm">New event</Button>}
      />

      {loading ? (
        <AdminEmpty message="Loading..." />
      ) : events.length === 0 ? (
        <AdminEmpty message="No events yet. Create your first one." />
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-surface-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Starts</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Regs</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/admin/events/${e.id}`} className="font-medium text-brand-green hover:underline">
                      {e.title}
                    </Link>
                    {!e.registration_open && <span className="ml-2 text-xs text-ink-muted">(registration closed)</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-muted">{formatDateTime(e.starts_at)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        e.is_published
                          ? "inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800"
                          : "inline-flex rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600"
                      }
                    >
                      {e.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/events/${e.id}/registrations`} className="text-brand-green hover:underline">
                      {e.registration_count ?? 0}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        disabled={busy === e.id}
                        onClick={() => togglePublish(e)}
                        className="text-brand-green hover:underline disabled:opacity-50"
                      >
                        {e.is_published ? "Unpublish" : "Publish"}
                      </button>
                      <Link href={`/admin/events/${e.id}/registrations`} className="text-ink-muted hover:text-brand-green">
                        Registrations
                      </Link>
                      <button type="button" disabled={busy === e.id} onClick={() => remove(e)} aria-label="Delete" className="text-ink-muted hover:text-[#b42318] disabled:opacity-50">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

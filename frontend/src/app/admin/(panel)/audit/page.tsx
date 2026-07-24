"use client";

import { useEffect, useState } from "react";
import { AdminEmpty, AdminHeader } from "@/components/admin/ui";
import { Input } from "@/components/ui/form";
import { formatDateTime } from "@/lib/format";
import { listAudit, type AuditEntry } from "@/lib/admin";

export default function AuditPage() {
  const [rows, setRows] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInput, setActionInput] = useState("");
  const [actorInput, setActorInput] = useState("");
  const [action, setAction] = useState("");
  const [actor, setActor] = useState("");

  useEffect(() => {
    setLoading(true);
    listAudit({ action: action || undefined, actor: actor || undefined }).then((d) => {
      setRows(d);
      setLoading(false);
    });
  }, [action, actor]);

  useEffect(() => {
    const t = setTimeout(() => {
      setAction(actionInput.trim());
      setActor(actorInput.trim());
    }, 300);
    return () => clearTimeout(t);
  }, [actionInput, actorInput]);

  return (
    <>
      <AdminHeader title="Audit log" subtitle="A record of admin and security actions." />

      <div className="mb-5 flex flex-wrap gap-3">
        <Input placeholder="Filter by action (e.g. login, event)" value={actionInput} onChange={(e) => setActionInput(e.target.value)} className="h-11 max-w-xs" />
        <Input placeholder="Filter by actor" value={actorInput} onChange={(e) => setActorInput(e.target.value)} className="h-11 max-w-xs" />
      </div>

      {loading ? (
        <AdminEmpty message="Loading..." />
      ) : rows.length === 0 ? (
        <AdminEmpty message="No audit entries match." />
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-surface-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Actor</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Entity</th>
                <th className="px-4 py-3 font-medium">IP</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 text-ink-muted">{formatDateTime(r.created_at)}</td>
                  <td className="px-4 py-3">{r.actor || "-"}</td>
                  <td className="px-4 py-3 font-medium text-brand-green">{r.action}</td>
                  <td className="px-4 py-3 text-ink-muted">
                    {r.entity ? `${r.entity}${r.entity_id ? ` #${r.entity_id}` : ""}` : "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-muted">{r.ip || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

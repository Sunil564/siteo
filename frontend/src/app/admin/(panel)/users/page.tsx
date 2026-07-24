"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { AdminEmpty, AdminHeader } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
import { formatDateTime } from "@/lib/format";
import {
  createUser,
  deleteUser,
  listUsers,
  me,
  updateUser,
  type AdminRole,
  type User,
} from "@/lib/admin";

const ROLES: AdminRole[] = ["volunteer", "admin", "super_admin"];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selfId, setSelfId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", role: "admin" as AdminRole });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    setLoading(true);
    const [list, self] = await Promise.all([listUsers(), me()]);
    setUsers(list);
    setSelfId(self?.id ?? null);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await createUser(form);
    setBusy(false);
    if (res.ok) {
      setShowCreate(false);
      setForm({ username: "", password: "", role: "admin" });
      refresh();
    } else {
      setError(res.status === 409 ? "That username is taken." : "Could not create the admin. Check the details and try again.");
    }
  }

  async function changeRole(u: User, role: AdminRole) {
    await updateUser(u.id, { role });
    refresh();
  }
  async function toggleActive(u: User) {
    await updateUser(u.id, { is_active: !u.is_active });
    refresh();
  }
  async function remove(u: User) {
    if (!window.confirm(`Remove admin "${u.username}"?`)) return;
    await deleteUser(u.id);
    refresh();
  }

  return (
    <>
      <AdminHeader
        title="Admins"
        subtitle="Manage who can access the admin portal."
        actions={<Button size="sm" onClick={() => setShowCreate((v) => !v)}>{showCreate ? "Cancel" : "Add admin"}</Button>}
      />

      {showCreate && (
        <form onSubmit={submitCreate} className="mb-6 rounded-card border border-border bg-surface-card p-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Username" htmlFor="username" required>
              <Input id="username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required minLength={3} />
            </Field>
            <Field label="Temporary password" htmlFor="password" required hint="At least 10 characters">
              <Input id="password" type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={10} />
            </Field>
            <Field label="Role" htmlFor="role">
              <Select id="role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as AdminRole })}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r.replace("_", " ")}</option>
                ))}
              </Select>
            </Field>
          </div>
          {error && <p className="mt-3 text-sm text-[#b42318]">{error}</p>}
          <div className="mt-4">
            <Button type="submit" size="sm" disabled={busy}>{busy ? "Creating..." : "Create admin"}</Button>
          </div>
        </form>
      )}

      {loading ? (
        <AdminEmpty message="Loading..." />
      ) : users.length === 0 ? (
        <AdminEmpty message="No admins found." />
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-surface-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Username</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Active</th>
                <th className="px-4 py-3 font-medium">Last login</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const self = u.id === selfId;
                return (
                  <tr key={u.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium">
                      {u.username}
                      {self && <span className="ml-2 text-xs text-ink-muted">(you)</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={u.role}
                        disabled={self}
                        onChange={(e) => changeRole(u, e.target.value as AdminRole)}
                        className="h-9 w-auto text-sm"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{r.replace("_", " ")}</option>
                        ))}
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={self}
                        onClick={() => toggleActive(u)}
                        className={u.is_active ? "text-brand-green disabled:opacity-60" : "text-ink-muted disabled:opacity-60"}
                      >
                        {u.is_active ? "Active" : "Disabled"}
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-muted">{u.last_login_at ? formatDateTime(u.last_login_at) : "-"}</td>
                    <td className="px-4 py-3 text-right">
                      {!self && (
                        <button type="button" onClick={() => remove(u)} aria-label="Remove" className="text-ink-muted hover:text-[#b42318]">
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

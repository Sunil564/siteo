/**
 * Admin API client (browser-side). All calls go same-origin to /api/v1/*, which
 * the Next rewrite proxies to the backend, so the httpOnly auth cookies the
 * backend sets are stored on this origin and sent automatically. On a 401 we
 * try a token refresh once, then retry, before treating the session as expired.
 */

export type AdminRole = "volunteer" | "admin" | "super_admin";

export type AdminMe = {
  id: number;
  username: string;
  role: AdminRole;
  totp_enabled: boolean;
  is_active: boolean;
  last_login_at: string | null;
};

export type LoginResponse = {
  username: string;
  role: AdminRole;
  totp_enabled: boolean;
  totp_required: boolean;
};

export type EnquiryStatus = "open" | "responded" | "closed";
export type EnquiryCategory =
  | "general"
  | "membership"
  | "event"
  | "partnership"
  | "media"
  | "other";

export type Enquiry = {
  id: number;
  enquiry_no: string;
  name: string;
  phone: string;
  email: string | null;
  category: EnquiryCategory;
  subject: string;
  message: string;
  status: EnquiryStatus;
  internal_notes: string | null;
  whatsapp_sent: boolean;
  created_at: string | null;
  updated_at: string | null;
};

export type Membership = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  city: string | null;
  category: string | null;
  message: string | null;
  whatsapp_sent: boolean;
  created_at: string | null;
};

export type Contact = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  subject: string | null;
  message: string;
  created_at: string | null;
};

const BASE = "/api/v1";

async function raw(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
}

/** Fetch that refreshes the access token once on 401, then retries. */
async function authed(path: string, init?: RequestInit): Promise<Response> {
  let res = await raw(path, init);
  if (res.status === 401) {
    const refresh = await raw("/auth/refresh", { method: "POST" });
    if (refresh.ok) res = await raw(path, init);
  }
  return res;
}

function qs(params: Record<string, string | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
  const s = sp.toString();
  return s ? `?${s}` : "";
}

// --- Auth ---

export async function login(
  username: string,
  password: string,
  totp_code?: string,
): Promise<{ ok: true; data: LoginResponse } | { ok: false; status: number }> {
  const res = await raw("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password, totp_code: totp_code || null }),
  });
  if (!res.ok) return { ok: false, status: res.status };
  return { ok: true, data: (await res.json()) as LoginResponse };
}

export async function me(): Promise<AdminMe | null> {
  const res = await authed("/auth/me");
  if (!res.ok) return null;
  return (await res.json()) as AdminMe;
}

export async function logout(): Promise<void> {
  await raw("/auth/logout", { method: "POST" });
}

// --- Submissions ---

export async function listEnquiries(params: {
  category?: string;
  status?: string;
  q?: string;
}): Promise<Enquiry[]> {
  const res = await authed(`/admin/enquiries${qs(params)}`);
  if (!res.ok) return [];
  return (await res.json()) as Enquiry[];
}

export async function updateEnquiry(
  id: number,
  body: { status?: EnquiryStatus; internal_notes?: string },
): Promise<{ ok: true; data: Enquiry } | { ok: false; status: number }> {
  const res = await authed(`/admin/enquiries/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  if (!res.ok) return { ok: false, status: res.status };
  return { ok: true, data: (await res.json()) as Enquiry };
}

export async function listMembership(q?: string): Promise<Membership[]> {
  const res = await authed(`/admin/membership${qs({ q })}`);
  if (!res.ok) return [];
  return (await res.json()) as Membership[];
}

export async function listContact(q?: string): Promise<Contact[]> {
  const res = await authed(`/admin/contact${qs({ q })}`);
  if (!res.ok) return [];
  return (await res.json()) as Contact[];
}

// --- Settings ---

export type Settings = {
  payments_enabled: boolean;
  whatsapp_enabled: boolean;
  registration_open_global: boolean;
};

export async function getSettings(): Promise<Settings | null> {
  const res = await authed("/admin/settings");
  if (!res.ok) return null;
  return (await res.json()) as Settings;
}

export async function updateSettings(body: Partial<Settings>): Promise<Settings | null> {
  const res = await authed("/admin/settings", { method: "PATCH", body: JSON.stringify(body) });
  if (!res.ok) return null;
  return (await res.json()) as Settings;
}

// --- Users ---

export type User = {
  id: number;
  username: string;
  role: AdminRole;
  totp_enabled: boolean;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string | null;
};

export async function listUsers(): Promise<User[]> {
  const res = await authed("/admin/users");
  if (!res.ok) return [];
  return (await res.json()) as User[];
}

export async function createUser(body: {
  username: string;
  password: string;
  role: AdminRole;
}): Promise<{ ok: true; data: User } | { ok: false; status: number; detail: unknown }> {
  const res = await authed("/admin/users", { method: "POST", body: JSON.stringify(body) });
  const data = await res.json().catch(() => null);
  if (!res.ok) return { ok: false, status: res.status, detail: data?.detail ?? data };
  return { ok: true, data: data as User };
}

export async function updateUser(
  id: number,
  body: { role?: AdminRole; is_active?: boolean },
): Promise<{ ok: true; data: User } | { ok: false; status: number; detail: unknown }> {
  const res = await authed(`/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(body) });
  const data = await res.json().catch(() => null);
  if (!res.ok) return { ok: false, status: res.status, detail: data?.detail ?? data };
  return { ok: true, data: data as User };
}

export async function deleteUser(id: number): Promise<boolean> {
  const res = await authed(`/admin/users/${id}`, { method: "DELETE" });
  return res.ok;
}

// --- Audit ---

export type AuditEntry = {
  id: number;
  actor: string | null;
  action: string;
  entity: string | null;
  entity_id: string | null;
  meta: Record<string, unknown> | null;
  ip: string | null;
  created_at: string | null;
};

export async function listAudit(params: { action?: string; actor?: string }): Promise<AuditEntry[]> {
  const res = await authed(`/admin/audit${qs(params)}`);
  if (!res.ok) return [];
  return (await res.json()) as AuditEntry[];
}

// --- Events (admin) ---

export type EventMode = "virtual" | "in_person" | "hybrid";

export type CustomField = {
  label: string;
  type: "text" | "select" | "tel" | "email";
  required: boolean;
  options?: string[] | null;
};

export type AdminEvent = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  banner_image: string | null;
  starts_at: string;
  ends_at: string | null;
  mode: EventMode;
  location: string | null;
  join_link: string | null;
  capacity: number | null;
  registration_open: boolean;
  is_published: boolean;
  is_paid: boolean;
  price: number | null;
  custom_fields: CustomField[] | null;
  confirmation_message: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  registration_count: number | null;
};

export type EventInput = {
  title: string;
  slug?: string;
  description?: string | null;
  banner_image?: string | null;
  starts_at: string;
  ends_at?: string | null;
  mode: EventMode;
  location?: string | null;
  join_link?: string | null;
  capacity?: number | null;
  registration_open: boolean;
  is_published: boolean;
  is_paid: boolean;
  price?: number | null;
  custom_fields: CustomField[];
  confirmation_message?: string | null;
};

type EventResult = { ok: true; data: AdminEvent } | { ok: false; status: number; detail: unknown };

export async function listAdminEvents(): Promise<AdminEvent[]> {
  const res = await authed("/admin/events");
  if (!res.ok) return [];
  return (await res.json()) as AdminEvent[];
}

export async function getAdminEvent(id: number): Promise<AdminEvent | null> {
  const res = await authed(`/admin/events/${id}`);
  if (!res.ok) return null;
  return (await res.json()) as AdminEvent;
}

async function eventWrite(path: string, method: string, body?: unknown): Promise<EventResult> {
  const res = await authed(path, { method, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => null);
  if (!res.ok) return { ok: false, status: res.status, detail: data?.detail ?? data };
  return { ok: true, data: data as AdminEvent };
}

export const createEvent = (body: EventInput) => eventWrite("/admin/events", "POST", body);
export const updateEvent = (id: number, body: Partial<EventInput>) => eventWrite(`/admin/events/${id}`, "PATCH", body);
export const publishEvent = (id: number) => eventWrite(`/admin/events/${id}/publish`, "POST");
export const unpublishEvent = (id: number) => eventWrite(`/admin/events/${id}/unpublish`, "POST");

export async function deleteEvent(id: number): Promise<boolean> {
  const res = await authed(`/admin/events/${id}`, { method: "DELETE" });
  return res.ok;
}

// --- Registrations (admin) ---

export type Registration = {
  id: number;
  event_id: number;
  ref_id: string;
  name: string;
  phone: string;
  email: string | null;
  custom_field_answers: Record<string, unknown> | null;
  status: "pending" | "confirmed" | "cancelled";
  whatsapp_sent: boolean;
  created_at: string | null;
};

export async function listRegistrations(
  eventId: number,
  params: { q?: string; status?: string },
): Promise<Registration[]> {
  const res = await authed(`/admin/events/${eventId}/registrations${qs(params)}`);
  if (!res.ok) return [];
  return (await res.json()) as Registration[];
}

export async function confirmRegistration(eventId: number, regId: number): Promise<boolean> {
  const res = await authed(`/admin/events/${eventId}/registrations/${regId}/confirm`, { method: "POST" });
  return res.ok;
}

export async function resendConfirmation(eventId: number, regId: number): Promise<boolean> {
  const res = await authed(`/admin/events/${eventId}/registrations/${regId}/resend`, { method: "POST" });
  return res.ok;
}

/** Same-origin export URL; the auth cookie rides along on navigation/download. */
export function registrationsExportUrl(eventId: number, format: "csv" | "xlsx"): string {
  return `${BASE}/admin/events/${eventId}/registrations/export?format=${format}`;
}

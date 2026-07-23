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

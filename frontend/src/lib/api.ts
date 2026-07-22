/**
 * Thin client for the SITEO FastAPI backend. Server-side fetches only need the
 * public endpoints for now. Fails soft: a down/unset API yields empty data so
 * the UI shows its empty state rather than crashing.
 */
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export type EventMode = "virtual" | "in_person" | "hybrid";

export type PublicEvent = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  banner_image: string | null;
  starts_at: string;
  ends_at: string | null;
  mode: EventMode;
  location: string | null;
  capacity: number | null;
  spots_left: number | null;
  registration_open: boolean;
  is_paid: boolean;
  price: number | null;
};

export type CustomFieldSpec = {
  label: string;
  type: "text" | "select" | "tel" | "email";
  required: boolean;
  options?: string[] | null;
};

export type PublicEventDetail = PublicEvent & {
  custom_fields: CustomFieldSpec[] | null;
  confirmation_message: string | null;
};

export async function getPublishedEvents(): Promise<PublicEvent[]> {
  if (!API_BASE) return [];
  try {
    const res = await fetch(`${API_BASE}/api/v1/events`, {
      next: { revalidate: 300 }, // ISR: refresh event list every 5 min
    });
    if (!res.ok) return [];
    return (await res.json()) as PublicEvent[];
  } catch {
    return [];
  }
}

export async function getEventBySlug(slug: string): Promise<PublicEventDetail | null> {
  if (!API_BASE) return null;
  try {
    const res = await fetch(`${API_BASE}/api/v1/events/${encodeURIComponent(slug)}`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return null;
    return (await res.json()) as PublicEventDetail;
  } catch {
    return null;
  }
}

/**
 * Client-side POST to the backend, routed same-origin through the Next rewrite
 * proxy (see next.config.ts) so there is no CORS. Returns a discriminated result.
 */
export type PostResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; detail: unknown };

export async function postJson<T = unknown>(path: string, body: unknown): Promise<PostResult<T>> {
  try {
    const res = await fetch(`/api/v1${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = res.headers.get("content-type")?.includes("json")
      ? await res.json()
      : null;
    if (!res.ok) {
      return { ok: false, status: res.status, detail: data?.detail ?? data };
    }
    return { ok: true, data: data as T };
  } catch {
    return { ok: false, status: 0, detail: "network" };
  }
}

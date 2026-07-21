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

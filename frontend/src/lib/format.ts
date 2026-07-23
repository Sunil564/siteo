/** Format an ISO datetime in Asia/Kolkata (the org timezone), e.g.
 *  "Sat, 26 Jul 2026 · 6:00 PM". */
export function formatEventDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const date = new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(d);
  const time = new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(d);
  return `${date} · ${time}`;
}

export const MODE_LABEL: Record<string, string> = {
  virtual: "Online",
  in_person: "In person",
  hybrid: "Hybrid",
};

/** Compact date-time for admin tables, e.g. "22 Jul 2026, 3:04 PM" (IST). */
export function formatDateTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(d);
}

import type { Timestamp } from "@admin/lib/time";

/** Format a Timestamp as e.g. "Jul 31, 2026". Returns "—" if null. */
export function formatDate(ts: Timestamp | null | undefined): string {
  if (!ts) return "—";
  const d = ts.toDate();
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Format a Timestamp with time, e.g. "Jul 31, 2026, 2:30 PM". */
export function formatDateTime(ts: Timestamp | null | undefined): string {
  if (!ts) return "—";
  const d = ts.toDate();
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Just the time, e.g. "2:30 PM". Returns "" if null. */
export function formatTime(ts: Timestamp | null | undefined): string {
  if (!ts) return "";
  return ts.toDate().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

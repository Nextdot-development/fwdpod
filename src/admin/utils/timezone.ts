import { Timestamp } from "@admin/lib/time";

/** Curated IANA timezones for the schedule picker (Asia/Kolkata default). */
export const TIME_ZONES: { value: string; label: string }[] = [
  { value: "Asia/Kolkata", label: "India Standard Time (Asia/Kolkata)" },
  { value: "Asia/Dubai", label: "Gulf Standard Time (Asia/Dubai)" },
  { value: "Europe/London", label: "UK (Europe/London)" },
  { value: "America/New_York", label: "US Eastern (America/New_York)" },
  { value: "America/Los_Angeles", label: "US Pacific (America/Los_Angeles)" },
  { value: "Asia/Singapore", label: "Singapore (Asia/Singapore)" },
  { value: "Australia/Sydney", label: "Sydney (Australia/Sydney)" },
  { value: "UTC", label: "UTC" },
];

export const DEFAULT_TIME_ZONE = "Asia/Kolkata";

/** Offset (ms) so that: localWallClock = utcInstant + offset, for a given zone. */
function zoneOffsetMs(instant: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const p = dtf.formatToParts(instant).reduce<Record<string, string>>((a, x) => {
    if (x.type !== "literal") a[x.type] = x.value;
    return a;
  }, {});
  const asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +(p.hour === "24" ? "0" : p.hour), +p.minute, +p.second);
  return asUTC - instant.getTime();
}

/**
 * Convert a wall-clock date+time entered in `timeZone` to the true UTC instant.
 * Two-pass to settle DST boundaries. Returns null on invalid input.
 */
export function zonedInputsToDate(dateStr: string, timeStr: string, timeZone: string): Date | null {
  if (!dateStr || !timeStr) return null;
  const [y, mo, d] = dateStr.split("-").map(Number);
  const [h, mi] = timeStr.split(":").map(Number);
  if ([y, mo, d, h, mi].some((n) => Number.isNaN(n))) return null;
  const wallAsUTC = Date.UTC(y, mo - 1, d, h, mi);
  let offset = zoneOffsetMs(new Date(wallAsUTC), timeZone);
  let instant = wallAsUTC - offset;
  offset = zoneOffsetMs(new Date(instant), timeZone); // refine across DST edges
  instant = wallAsUTC - offset;
  return new Date(instant);
}

/** Split a Timestamp into date (yyyy-MM-dd) + time (HH:mm) strings in a zone. */
export function dateToZonedInputs(ts: Timestamp | null | undefined, timeZone: string): { date: string; time: string } {
  if (!ts) return { date: "", time: "" };
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone, hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  });
  const p = dtf.formatToParts(ts.toDate()).reduce<Record<string, string>>((a, x) => {
    if (x.type !== "literal") a[x.type] = x.value;
    return a;
  }, {});
  const hh = p.hour === "24" ? "00" : p.hour;
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${hh}:${p.minute}` };
}

/** Human string of a Timestamp rendered in a specific zone, e.g. "Jul 31, 2026, 2:30 PM IST". */
export function formatInZone(ts: Timestamp | null | undefined, timeZone: string): string {
  if (!ts) return "—";
  return ts.toDate().toLocaleString("en-US", {
    timeZone,
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", timeZoneName: "short",
  });
}

/** Relative "time ago" for the autosave indicator. */
export function timeAgo(date: Date | null): string {
  if (!date) return "";
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * A minimal drop-in replacement for Firestore's `Timestamp`, so the CMS's date,
 * schedule, and UI code can migrate from Firebase to Supabase without changing
 * any of its call sites. It supports exactly the surface the app uses:
 *   Timestamp.now() / fromDate() / fromMillis()   and   .toMillis() / .toDate()
 * Plus `fromISO()` and `toISOString()` for converting to/from Postgres
 * `timestamptz` values (which Supabase returns as ISO strings).
 */
export class Timestamp {
  private readonly ms: number;

  constructor(ms: number) {
    this.ms = ms;
  }

  static now(): Timestamp {
    return new Timestamp(Date.now());
  }

  static fromDate(date: Date): Timestamp {
    return new Timestamp(date.getTime());
  }

  static fromMillis(ms: number): Timestamp {
    return new Timestamp(ms);
  }

  /** Parse a Postgres timestamptz / ISO string (null-safe). */
  static fromISO(iso: string | null | undefined): Timestamp | null {
    if (!iso) return null;
    const ms = Date.parse(iso);
    return Number.isNaN(ms) ? null : new Timestamp(ms);
  }

  toMillis(): number {
    return this.ms;
  }

  toDate(): Date {
    return new Date(this.ms);
  }

  toISOString(): string {
    return new Date(this.ms).toISOString();
  }

  /** Ensures JSON serialization (e.g. inside jsonb version snapshots) stores an ISO string. */
  toJSON(): string {
    return this.toISOString();
  }
}

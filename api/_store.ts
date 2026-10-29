/**
 * Saves a checked form submission to Supabase so it shows in the admin
 * (tables from supabase/migrations/0005_form_submissions.sql). Only
 * /api/send-form calls this, after every field and the email address have
 * passed the server's checks, so nothing unchecked reaches the admin.
 *
 * Uses SUPABASE_SECRET_KEY (server only) so the tables can stay closed to the
 * public (0006_server_only_form_inserts.sql). Until that key is set it falls
 * back to the publishable key, which works while 0005's public insert policy
 * is still in place.
 */

export type SubmissionTable = 'booking_requests' | 'contact_messages';

export async function saveSubmission(table: SubmissionTable, row: Record<string, string | null>): Promise<void> {
  const url = (process.env.VITE_SUPABASE_URL ?? '').replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
  const key = process.env.SUPABASE_SECRET_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
  if (!url || !key) throw new Error('Supabase is not configured');
  const response = await fetch(`${url}/rest/v1/${table}`, {
    method: 'POST',
    headers: { apikey: key, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(row),
  });
  // Status only: the body can echo the visitor's details
  if (!response.ok) throw new Error(`Saving to ${table} failed with status ${response.status}`);
}

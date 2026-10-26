/**
 * Saves a website form submission to Supabase so it shows in the admin
 * (tables from supabase/migrations/0005_form_submissions.sql).
 *
 * Uses a plain fetch to the REST API with the publishable key, so the public
 * site never loads the Supabase client. Row Level Security lets visitors add
 * rows but never read them.
 */
import { sendToInbox } from './web3forms';

export type SubmissionTable = 'booking_requests' | 'contact_messages';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL ?? '').replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '';

export async function saveSubmission(table: SubmissionTable, row: Record<string, string | null>): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Supabase is not configured: VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY is not set.');
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      'Content-Type': 'application/json',
      // Visitors may insert but not read, so ask for no row back
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(row),
  });
  if (!response.ok) throw new Error(`Saving to ${table} failed with status ${response.status}: ${(await response.text()).slice(0, 200)}`);
}

/**
 * Emails the submission and saves it for the admin, in parallel. Succeeds when
 * at least one of the two worked, so a request is never lost to one outage;
 * fails only when both did. Spam-trap hits are dropped quietly.
 */
export async function deliverSubmission({
  email,
  table,
  row,
  bot,
}: {
  email: Record<string, string | boolean>;
  table: SubmissionTable;
  row: Record<string, string | null>;
  bot: boolean;
}): Promise<void> {
  if (bot) return;
  const [mailed, saved] = await Promise.allSettled([sendToInbox(email), saveSubmission(table, row)]);
  if (mailed.status === 'rejected') console.error('Form email failed:', mailed.reason);
  if (saved.status === 'rejected') console.error('Form save failed:', saved.reason);
  if (mailed.status === 'rejected' && saved.status === 'rejected') throw new Error('The form could not be emailed or saved.');
}

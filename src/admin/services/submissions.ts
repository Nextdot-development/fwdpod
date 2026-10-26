// Website form submissions (booking_requests, contact_messages) for the admin.
// Tables and access rules: supabase/migrations/0005_form_submissions.sql.
import { supabase, channelName } from "@admin/supabase/config";

export type SubmissionTable = "booking_requests" | "contact_messages";

/** One submission row as stored; booking-only columns are absent on contact messages. */
export interface Submission {
  id: string;
  created_at: string;
  source_page: string;
  name: string;
  email: string;
  company: string;
  need?: string | null;
  role_or_outcome?: string | null;
  engagement?: string | null;
  start_date?: string | null;
  message?: string | null;
  handled: boolean;
  handled_at: string | null;
  handled_by: string | null;
}

export async function fetchSubmissions(table: SubmissionTable): Promise<Submission[]> {
  const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Submission[];
}

/** Loads the list now and again whenever a row is added, changed or removed. */
export function subscribeSubmissions(
  table: SubmissionTable,
  onData: (rows: Submission[]) => void,
  onError?: (err: Error) => void
) {
  let cancelled = false;
  const load = () => fetchSubmissions(table).then((r) => !cancelled && onData(r)).catch((e) => !cancelled && onError?.(e as Error));
  load();
  const channel = supabase
    .channel(channelName(`${table}-changes`))
    .on("postgres_changes", { event: "*", schema: "public", table }, load)
    .subscribe();
  return () => {
    cancelled = true;
    supabase.removeChannel(channel);
  };
}

export async function setHandled(table: SubmissionTable, id: string, handled: boolean, actor: string): Promise<void> {
  const { error } = await supabase
    .from(table)
    .update({ handled, handled_at: handled ? new Date().toISOString() : null, handled_by: handled ? actor : null })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteSubmission(table: SubmissionTable, id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw new Error(error.message);
}

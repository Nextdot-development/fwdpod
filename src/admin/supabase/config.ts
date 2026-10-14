// Supabase client, initialised once from environment variables.
// Only the PUBLISHABLE (anon) key is used in the browser — never the service
// role/secret key. Access is enforced by Row Level Security + Storage policies.
// This module is only imported by the code-split admin app, so the public site
// never loads Supabase and its behaviour is unchanged.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Accept either the bare project URL or one that accidentally includes a
// trailing /rest/v1 — supabase-js needs the bare origin.
const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? "";
const url = rawUrl.replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ?? "";

/** True only when both the Supabase URL and publishable key are supplied. */
export const isSupabaseConfigured = Boolean(url && key);

// Admin screens are gated behind `isSupabaseConfigured`, so this is only used
// once Supabase is actually configured.
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    })
  : (null as unknown as SupabaseClient);

// Realtime channel topics must be UNIQUE per subscription. Two components using
// the same hook (e.g. two <MediaPickerModal>s) would otherwise create channels
// with an identical topic — Supabase then reuses the already-subscribed channel
// and throws "cannot add postgres_changes callbacks after subscribe()". A
// monotonic suffix guarantees each subscription gets its own channel.
let _channelSeq = 0;
export const channelName = (base: string): string => `${base}-${++_channelSeq}`;

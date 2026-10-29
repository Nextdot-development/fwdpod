-- ============================================================================
-- Fwdpod: only the website's server may add form submissions.
--
-- 0005 let anyone insert into booking_requests and contact_messages with the
-- publishable key, which is public. That let a bot skip every check in
-- /api/send-form (email address, required fields, rate limits) and write
-- straight into the admin lists. The server now saves each submission itself,
-- after its checks pass, using SUPABASE_SECRET_KEY (api/_store.ts).
--
-- Run this only AFTER SUPABASE_SECRET_KEY is set in Vercel and the site with
-- api/_store.ts is deployed; before that the forms still save with the
-- publishable key. Admin access (0005's admin_all_* policies) is unchanged.
-- Safe to re-run.
-- ============================================================================

drop policy if exists "public_insert_booking_requests" on public.booking_requests;
drop policy if exists "public_insert_contact_messages" on public.contact_messages;

revoke insert on public.booking_requests, public.contact_messages from anon;

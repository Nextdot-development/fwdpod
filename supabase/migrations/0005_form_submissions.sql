-- ============================================================================
-- Fwdpod: website form submissions, shown in the admin.
--
--   booking_requests  <- "Book a 30-minute call" form on /configure
--   contact_messages  <- contact form on /contact
--
-- Anyone visiting the site can add a row (the forms post here with the
-- publishable key), but only admins (public.is_admin(), see 0001) can read,
-- update or delete them. Every submission is also emailed to the inbox
-- through Web3Forms, so nothing is lost if one of the two fails.
--
-- Run once in the Supabase SQL Editor after 0001_cms_schema.sql. Safe to re-run.
-- ============================================================================

create table if not exists public.booking_requests (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  source_page      text not null default '/configure' check (char_length(source_page) <= 100),
  name             text not null check (char_length(btrim(name)) between 1 and 200),
  email            text not null check (char_length(email) between 3 and 320 and email like '%_@_%'),
  company          text not null check (char_length(btrim(company)) between 1 and 200),
  need             text not null check (need in ('Individual specialist', 'AI pod', 'Not sure yet')),
  role_or_outcome  text check (char_length(role_or_outcome) <= 300),
  engagement       text check (engagement in ('Hourly', 'Daily', 'Monthly', 'Not sure')),
  start_date       date,
  message          text check (char_length(message) <= 3000),
  handled          boolean not null default false,
  handled_at       timestamptz,
  handled_by       text
);

create table if not exists public.contact_messages (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  source_page      text not null default '/contact' check (char_length(source_page) <= 100),
  name             text not null check (char_length(btrim(name)) between 1 and 200),
  email            text not null check (char_length(email) between 3 and 320 and email like '%_@_%'),
  company          text not null check (char_length(btrim(company)) between 1 and 200),
  message          text not null check (char_length(btrim(message)) between 1 and 3000),
  handled          boolean not null default false,
  handled_at       timestamptz,
  handled_by       text
);

create index if not exists booking_requests_created_at_idx on public.booking_requests (created_at desc);
create index if not exists contact_messages_created_at_idx on public.contact_messages (created_at desc);

alter table public.booking_requests enable row level security;
alter table public.contact_messages enable row level security;

-- Visitors may only add new, unhandled rows; they can never read them back.
drop policy if exists "public_insert_booking_requests" on public.booking_requests;
create policy "public_insert_booking_requests" on public.booking_requests
  for insert to anon, authenticated
  with check (handled = false and handled_at is null and handled_by is null);

drop policy if exists "public_insert_contact_messages" on public.contact_messages;
create policy "public_insert_contact_messages" on public.contact_messages
  for insert to anon, authenticated
  with check (handled = false and handled_at is null and handled_by is null);

-- Admins see and manage everything.
drop policy if exists "admin_all_booking_requests" on public.booking_requests;
create policy "admin_all_booking_requests" on public.booking_requests
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_all_contact_messages" on public.contact_messages;
create policy "admin_all_contact_messages" on public.contact_messages
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

grant insert on public.booking_requests, public.contact_messages to anon, authenticated;
grant select, update, delete on public.booking_requests, public.contact_messages to authenticated;

-- Realtime: new submissions appear in the admin lists without a reload.
do $$
declare t text;
begin
  foreach t in array array['booking_requests', 'contact_messages'] loop
    if not exists (select 1 from pg_publication_tables
                   where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

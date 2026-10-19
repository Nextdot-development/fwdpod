-- ============================================================================
-- Fwdpod CMS: automatic rebuild on Vercel.
--
-- Same logic as 0002_auto_deploy.sql, but the site is hosted on Vercel, so
-- instead of a GitHub repository_dispatch it calls a Vercel Deploy Hook.
-- Every 3 minutes pg_cron runs cms_maybe_dispatch(), which POSTs the hook
-- when, and only when, something public changed since the last request:
--   * a live post was created, edited, unpublished, archived or deleted, or
--   * a scheduled post's time has arrived.
-- Edits are debounced (2 min of quiet) and builds are spaced (5 min).
--
-- Before running: create a Deploy Hook in Vercel (Project → Settings → Git →
-- Deploy Hooks, branch = your production branch) and store its URL in Vault:
--   select vault.create_secret('https://api.vercel.com/v1/integrations/deploy/prj_.../...', 'vercel_deploy_hook_url');
-- Run once in the SQL Editor after 0001_cms_schema.sql. Use this instead of
-- 0002 (safe to run even if 0002 was run). Safe to re-run.
-- ============================================================================

create extension if not exists pg_cron;
create extension if not exists pg_net;

create table if not exists public.deploy_state (
  id               integer primary key default 1 check (id = 1),
  repo             text not null default 'vercel',
  dirty            boolean not null default false,
  last_change_at   timestamptz,
  last_dispatch_at timestamptz,
  last_request_id  bigint
);
insert into public.deploy_state (id) values (1) on conflict (id) do nothing;
alter table public.deploy_state enable row level security;
drop policy if exists "admin_read_deploy_state" on public.deploy_state;
create policy "admin_read_deploy_state" on public.deploy_state
  for select to authenticated using (public.is_admin());

create or replace function public.cms_mark_dirty()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  touches_public boolean :=
    (tg_op <> 'INSERT' and old.status in ('published','scheduled'))
    or (tg_op <> 'DELETE' and new.status in ('published','scheduled'));
begin
  if touches_public then
    update public.deploy_state set dirty = true, last_change_at = now() where id = 1;
  end if;
  return null;
end;
$$;

drop trigger if exists blogs_mark_dirty on public.blogs;
create trigger blogs_mark_dirty
  after insert or update or delete on public.blogs
  for each row execute function public.cms_mark_dirty();

create or replace function public.cms_maybe_dispatch()
returns text language plpgsql security definer set search_path = public as $$
declare
  s        public.deploy_state%rowtype;
  hook_url text;
  due      boolean;
  req_id   bigint;
begin
  select * into s from public.deploy_state where id = 1 for update;

  if s.last_dispatch_at is not null and s.last_dispatch_at > now() - interval '5 minutes' then
    return 'cooldown';
  end if;

  -- A scheduled post whose time arrived after the last build was requested.
  select exists (
    select 1 from public.blogs
    where status = 'scheduled'
      and publish_at <= now()
      and publish_at > coalesce(s.last_dispatch_at, '-infinity'::timestamptz)
  ) into due;

  if not due and not (s.dirty and s.last_change_at <= now() - interval '2 minutes') then
    return case when s.dirty then 'debouncing' else 'clean' end;
  end if;

  select decrypted_secret into hook_url
  from vault.decrypted_secrets where name = 'vercel_deploy_hook_url' limit 1;
  if hook_url is null then
    raise warning 'cms_maybe_dispatch: vault secret vercel_deploy_hook_url is missing';
    return 'no-hook';
  end if;

  select net.http_post(
    url     := hook_url,
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body    := '{}'::jsonb
  ) into req_id;

  update public.deploy_state
     set dirty = false, last_dispatch_at = now(), last_request_id = req_id
   where id = 1;
  return 'dispatched';
end;
$$;

revoke all on function public.cms_maybe_dispatch() from public, anon, authenticated;
revoke all on function public.cms_mark_dirty()     from public, anon, authenticated;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'cms-auto-deploy') then
    perform cron.unschedule('cms-auto-deploy');
  end if;
  perform cron.schedule('cms-auto-deploy', '*/3 * * * *', 'select public.cms_maybe_dispatch()');
end $$;

-- Check it later with:
--   select * from public.deploy_state;
--   select status_code, content from net._http_response
--     where id = (select last_request_id from public.deploy_state);   -- 201 = Vercel accepted it

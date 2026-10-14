-- ============================================================================
-- Fwdpod CMS: automatic rebuild + deploy.
--
-- The site is static, so a change in the CMS reaches visitors only through a
-- new build. Every 3 minutes pg_cron runs cms_maybe_dispatch(), which asks
-- GitHub Actions for a build (repository_dispatch, event_type cms-publish)
-- when, and only when, something public changed since the last request:
--   * a live post was created, edited, unpublished, archived or deleted, or
--   * a scheduled post's time has arrived.
-- Edits are debounced (2 min of quiet) and dispatches are spaced (5 min), so
-- an editing session or a burst of publishes costs one build, not dozens.
--
-- Before running: store the GitHub token in Vault (see deploy/CMS-SETUP.md):
--   select vault.create_secret('<token>', 'github_dispatch_token');
-- Run once in the SQL Editor after 0001_cms_schema.sql. Safe to re-run.
-- ============================================================================

create extension if not exists pg_cron;
create extension if not exists pg_net;

create table if not exists public.deploy_state (
  id               integer primary key default 1 check (id = 1),
  repo             text not null default 'priyasingh-ai/fwdpod.com',
  dirty            boolean not null default false,
  last_change_at   timestamptz,
  last_dispatch_at timestamptz,
  last_request_id  bigint
);
insert into public.deploy_state (id) values (1) on conflict (id) do nothing;
alter table public.deploy_state enable row level security;
-- Admins may read it (the dashboard shows the last deploy request).
drop policy if exists "admin_read_deploy_state" on public.deploy_state;
create policy "admin_read_deploy_state" on public.deploy_state
  for select to authenticated using (public.is_admin());

-- A row matters to the public site if it is, was, or is about to become
-- public. Drafts being autosaved never mark the site dirty.
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
  s       public.deploy_state%rowtype;
  token   text;
  due     boolean;
  req_id  bigint;
begin
  select * into s from public.deploy_state where id = 1 for update;

  -- Space builds out: one at most every 5 minutes.
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

  select decrypted_secret into token
  from vault.decrypted_secrets where name = 'github_dispatch_token' limit 1;
  if token is null then
    raise warning 'cms_maybe_dispatch: vault secret github_dispatch_token is missing';
    return 'no-token';
  end if;

  select net.http_post(
    url     := format('https://api.github.com/repos/%s/dispatches', s.repo),
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || token,
      'Accept', 'application/vnd.github+json',
      'X-GitHub-Api-Version', '2022-11-28',
      'User-Agent', 'fwdpod-cms'
    ),
    body    := jsonb_build_object('event_type', 'cms-publish')
  ) into req_id;

  update public.deploy_state
     set dirty = false, last_dispatch_at = now(), last_request_id = req_id
   where id = 1;
  return 'dispatched';
end;
$$;

revoke all on function public.cms_maybe_dispatch() from public, anon, authenticated;
revoke all on function public.cms_mark_dirty()     from public, anon, authenticated;

-- (Re)schedule the job every 3 minutes.
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
--     where id = (select last_request_id from public.deploy_state);   -- 204 = accepted

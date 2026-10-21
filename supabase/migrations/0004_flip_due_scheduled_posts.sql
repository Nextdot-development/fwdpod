-- ============================================================================
-- Fwdpod CMS: scheduled posts become "published" once they go live.
--
-- Visibility is unchanged: blog_is_public() already treats a scheduled post
-- whose publish_at has passed as public. What changes is the stored status,
-- so the admin list, its filters and the editor show "Published" instead of
-- "Scheduled" for a post that is already live.
--
-- cms_maybe_dispatch() flips due posts right after it requests the build
-- that puts them on the site, so status follows the deploy. publish_at is
-- never touched; published_at records when the flip happened.
--
-- Run once in the SQL Editor after 0003_vercel_deploy_hook.sql. Safe to re-run.
-- ============================================================================


create or replace function public.cms_maybe_dispatch()
returns text language plpgsql security definer set search_path = public as $$
declare
  s        public.deploy_state%rowtype;
  hook_url text;
  due      boolean;
  req_id   bigint;
begin
  select * into s from public.deploy_state where id = 1 for update;

  -- The last request failed or timed out: mark the site dirty so it is retried.
  if s.last_request_id is not null and exists (
    select 1 from net._http_response r
    where r.id = s.last_request_id and (r.status_code is null or r.status_code >= 300)
  ) then
    update public.deploy_state
       set dirty = true, last_change_at = coalesce(s.last_dispatch_at, now()), last_request_id = null
     where id = 1
     returning * into s;
  end if;

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
    body    := '{}'::jsonb,
    timeout_milliseconds := 30000
  ) into req_id;

  -- Every post that is live by now is in the build just requested.
  update public.blogs
     set status = 'published', published_at = coalesce(published_at, now())
   where status = 'scheduled' and publish_at <= now();

  update public.deploy_state
     set dirty = false, last_dispatch_at = now(), last_request_id = req_id
   where id = 1;
  return 'dispatched';
end;
$$;

-- Posts that are already live but still say "scheduled".
update public.blogs
   set status = 'published', published_at = coalesce(published_at, now())
 where status = 'scheduled' and publish_at <= now();

select slug, status, publish_at from public.blogs order by publish_at desc;

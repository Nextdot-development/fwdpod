-- ============================================================================
-- Fwdpod blog CMS: schema, visibility rule, Row Level Security, Storage.
--
-- Run once in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.
-- Safe to re-run. The browser only ever holds the publishable (anon) key;
-- everything below is what keeps that key harmless.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- updated_at maintained by the database, never by the client
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Admins: the only accounts the CMS policies let in. Being signed in is not
-- enough, so a stray sign-up through the public anon key gets nothing.
-- Add yourself after running this file:
--   insert into public.admin_users (email) values ('you@example.com');
-- ---------------------------------------------------------------------------
create table if not exists public.admin_users (
  email      text primary key,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
-- No policies: nobody reads or writes this table through the API.

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admin_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- blogs
-- ---------------------------------------------------------------------------
create table if not exists public.blogs (
  id               uuid primary key default gen_random_uuid(),
  title            text not null default '',
  slug             text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  excerpt          text not null default '',
  content          jsonb not null default '[]'::jsonb,   -- BlogBlock[], never raw HTML
  featured_image   text not null default '',
  image_alt        text not null default '',
  category         text not null default '',
  tags             text[] not null default '{}',
  seo_title        text not null default '',
  meta_description text not null default '',
  focus_keyword    text not null default '',             -- the query the post targets
  read_time        text not null default '',
  author           text not null default '',
  status           text not null default 'draft'
                     check (status in ('draft','scheduled','published','archived')),
  publish_at       timestamptz,   -- author-set publish date: shown on the page and in the sitemap
  published_at     timestamptz,   -- internal: when the post first went live
  time_zone        text not null default 'Asia/Kolkata',
  related_blogs    text[] not null default '{}',         -- ordered slugs
  faq              jsonb not null default '[]'::jsonb,   -- {q,a}[]
  redirect_from    text[] not null default '{}',         -- earlier slugs, 301'd to this one
  canonical_url    text not null default '',
  og_image         text not null default '',
  twitter_image    text not null default '',
  version          integer not null default 1,
  created_by       text not null default '',
  updated_by       text not null default '',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint blogs_live_needs_publish_at
    check (status not in ('published','scheduled') or publish_at is not null)
);

create index if not exists blogs_publish_at_idx on public.blogs (publish_at desc);
create index if not exists blogs_status_idx     on public.blogs (status);

drop trigger if exists blogs_set_updated_at on public.blogs;
create trigger blogs_set_updated_at
  before update on public.blogs
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- THE visibility rule. The only definition anywhere: the public read policy
-- below uses it, and the site build reads through that policy, so the
-- listing, article pages, sitemap and related posts all inherit it.
-- A scheduled post becomes public because the clock passes publish_at; no job
-- ever rewrites its status.
-- ---------------------------------------------------------------------------
create or replace function public.blog_is_public(p_status text, p_publish_at timestamptz)
returns boolean
language sql stable as $$
  select p_status = 'published'
      or (p_status = 'scheduled' and p_publish_at is not null and p_publish_at <= now());
$$;
grant execute on function public.blog_is_public(text, timestamptz) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- blog_versions: snapshot before each explicit save
-- ---------------------------------------------------------------------------
create table if not exists public.blog_versions (
  id         uuid primary key default gen_random_uuid(),
  blog_id    uuid not null references public.blogs(id) on delete cascade,
  version    integer not null,
  edited_by  text not null default '',
  edited_at  timestamptz not null default now(),
  status     text not null,
  title      text not null default '',
  data       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists blog_versions_blog_idx on public.blog_versions (blog_id, version desc);

-- ---------------------------------------------------------------------------
-- media: image library metadata; the files live in Storage
-- ---------------------------------------------------------------------------
create table if not exists public.media (
  id           uuid primary key default gen_random_uuid(),
  url          text not null,
  path         text not null,
  name         text not null default '',
  alt          text not null default '',
  caption      text not null default '',
  size         bigint not null default 0,
  content_type text not null default '',
  width        integer not null default 0,
  height       integer not null default 0,
  created_at   timestamptz not null default now()
);
create index if not exists media_created_at_idx on public.media (created_at desc);

-- ---------------------------------------------------------------------------
-- categories: mirrors the taxonomy in src/data/blogCategories.ts, which is
-- what the public category pages are built from. The editor's dropdown reads
-- the code list; this table is kept in step for reporting and joins.
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  slug       text not null unique,
  created_at timestamptz not null default now()
);
insert into public.categories (name, slug) values
  ('Forward Deployed Engineering',            'forward-deployed-engineering'),
  ('AI Pods & Engineering Teams',             'ai-teams'),
  ('Agentic AI & LLM Engineering',            'agentic-ai'),
  ('Security, Compliance & Offshore Delivery','security-compliance'),
  ('AI Strategy: Pilot to Production',        'ai-strategy')
on conflict (slug) do nothing;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table public.blogs         enable row level security;
alter table public.blog_versions enable row level security;
alter table public.categories    enable row level security;
alter table public.media         enable row level security;

drop policy if exists "public_read_visible_blogs" on public.blogs;
drop policy if exists "admin_all_blogs"           on public.blogs;
drop policy if exists "admin_all_blog_versions"   on public.blog_versions;
drop policy if exists "public_read_categories"    on public.categories;
drop policy if exists "admin_all_categories"      on public.categories;
drop policy if exists "admin_all_media"           on public.media;

-- Anyone holding the anon key sees exactly the public posts, nothing else:
-- drafts, archived and future-scheduled rows are filtered by the database.
create policy "public_read_visible_blogs" on public.blogs
  for select to anon, authenticated
  using (public.blog_is_public(status, publish_at));

create policy "admin_all_blogs" on public.blogs
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_blog_versions" on public.blog_versions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public_read_categories" on public.categories
  for select to anon, authenticated using (true);
create policy "admin_all_categories" on public.categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_media" on public.media
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- STORAGE: blog-images bucket. Public read (so <img src> works on the static
-- site), admin-only write, 10 MB, images only.
-- ============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('blog-images', 'blog-images', true, 10485760,
        array['image/png','image/jpeg','image/webp','image/gif','image/avif'])
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "blog_images_public_read"  on storage.objects;
drop policy if exists "blog_images_admin_insert" on storage.objects;
drop policy if exists "blog_images_admin_update" on storage.objects;
drop policy if exists "blog_images_admin_delete" on storage.objects;

create policy "blog_images_public_read" on storage.objects
  for select to public using (bucket_id = 'blog-images');
create policy "blog_images_admin_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'blog-images' and public.is_admin());
create policy "blog_images_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'blog-images' and public.is_admin())
  with check (bucket_id = 'blog-images' and public.is_admin());
create policy "blog_images_admin_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'blog-images' and public.is_admin());

-- ============================================================================
-- REALTIME: lets the admin lists refresh live
-- ============================================================================
do $$
declare t text;
begin
  foreach t in array array['blogs','blog_versions','media','categories'] loop
    if not exists (select 1 from pg_publication_tables
                   where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

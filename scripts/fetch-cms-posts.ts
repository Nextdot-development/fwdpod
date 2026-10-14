/**
 * Build step: pull the public CMS posts from Supabase into
 * content/cms/posts.json, which src/data/blogCatalog.ts merges with the
 * markdown articles in content/blog/.
 *
 * It reads with the publishable (anon) key only. Which rows come back is
 * decided by the database's public read policy (blog_is_public in
 * supabase/migrations/0001_cms_schema.sql), the single definition of "visible":
 * drafts, archived and future-scheduled posts are never returned.
 *
 * Failure handling:
 *  - In CI (CMS_REQUIRED=1) any failure stops the build, so a Supabase outage
 *    can never deploy a site with the CMS posts missing; the live site simply
 *    keeps its last good build.
 *  - Locally, missing env or an unreachable Supabase writes an empty list and
 *    the site builds with the markdown articles alone.
 *  - CMS_ENABLED=false skips Supabase entirely (instant rollback).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { rowToPost, type CmsPostJson, type CmsRow } from '../src/cms/cmsPost';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const file of ['.env.local', '.env']) {
  dotenv.config({ path: path.join(root, file), quiet: true });
}

const outDir = path.join(root, 'content', 'cms');
const outFile = path.join(outDir, 'posts.json');
const required = process.env.CMS_REQUIRED === '1' || process.env.CMS_REQUIRED === 'true';

function write(posts: CmsPostJson[]) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, `${JSON.stringify(posts, null, 2)}\n`);
}

function fail(message: string): never | void {
  if (required) {
    console.error(`fetch-cms-posts: ${message}`);
    process.exit(1);
  }
  console.warn(`fetch-cms-posts: ${message} — building with markdown articles only.`);
  write([]);
}

/** A secret/service key would bypass the read policy and publish drafts. */
function isSecretKey(key: string): boolean {
  if (key.startsWith('sb_secret_')) return true;
  const parts = key.split('.');
  if (parts.length !== 3) return false;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    return payload.role === 'service_role';
  } catch {
    return false;
  }
}

const COLUMNS = [
  'id', 'title', 'slug', 'excerpt', 'content', 'featured_image', 'image_alt', 'category',
  'tags', 'seo_title', 'meta_description', 'read_time', 'author', 'status', 'publish_at',
  'published_at', 'updated_at', 'time_zone', 'related_blogs', 'faq', 'redirect_from',
].join(',');

async function main() {
  if (process.env.CMS_ENABLED === 'false') {
    console.log('fetch-cms-posts: CMS_ENABLED=false, skipping Supabase.');
    write([]);
    return;
  }

  const url = (process.env.VITE_SUPABASE_URL ?? '').replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '';
  if (!url || !key) return fail('VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY are not set');
  if (isSecretKey(key)) {
    console.error(
      'fetch-cms-posts: VITE_SUPABASE_PUBLISHABLE_KEY holds a secret/service-role key. ' +
        'Use the publishable (anon) key: the secret key bypasses the read policy and would publish drafts.'
    );
    process.exit(1);
  }

  let rows: CmsRow[];
  try {
    const res = await fetch(`${url}/rest/v1/blogs?select=${COLUMNS}&order=publish_at.desc`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) return fail(`Supabase answered ${res.status}: ${(await res.text()).slice(0, 300)}`);
    rows = (await res.json()) as CmsRow[];
  } catch (error) {
    return fail(`could not reach Supabase (${(error as Error).message})`);
  }

  const posts = rows.map(row => {
    const removed: string[] = [];
    const post = rowToPost(row, removed);
    if (removed.length) {
      console.warn(`fetch-cms-posts: ${row.slug}: external link(s) shown as plain text: ${removed.join(', ')}`);
    }
    return post;
  });
  write(posts);
  console.log(`fetch-cms-posts: ${posts.length} public CMS post(s) written to content/cms/posts.json`);
}

await main();

/**
 * End-to-end: build the real site with fixture CMS posts and check what a
 * crawler gets. Covers the parts of the acceptance list that live in the
 * build: newest-first ordering across sources, SEO tags in the prerendered
 * HTML, the sitemap, markdown winning a slug clash, slug redirects, a real
 * 404, and no secret in any served file.
 *
 * Which rows are public (drafts, archived, future-scheduled) is decided by the
 * database policy; see deploy/CMS-SETUP.md for the SQL check of that part.
 *
 * Slow (a full production build). Leaves no dist/ behind, so a fixture build
 * can never be uploaded by mistake.
 */
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { rowToPost, type CmsRow } from '../src/cms/cmsPost';

const root = path.resolve(import.meta.dirname, '..');
const cmsFile = path.join(root, 'content', 'cms', 'posts.json');
const dist = path.join(root, 'dist');
const page = (route: string) => fs.readFileSync(path.join(dist, '_pages', `${route}.html`), 'utf8');

const base: Omit<CmsRow, 'id' | 'slug' | 'title'> = {
  status: 'published',
  time_zone: 'Asia/Kolkata',
  category: 'Agentic AI & LLM Engineering',
  excerpt: 'Excerpt.',
  content: [{ type: 'p', text: 'Body text.' }],
};

const rows: CmsRow[] = [
  {
    ...base,
    id: '1',
    slug: 'cms-fixture-newest',
    title: 'CMS Fixture Newest Post',
    seo_title: 'CMS Fixture: The Newest Post',
    meta_description: 'Learn how the CMS fixture post renders on fwdpod.com with tags, schema and an FAQ section in the prerendered HTML.',
    publish_at: '2099-01-02T04:30:00Z',
    featured_image: 'https://example.supabase.co/storage/v1/object/public/blog-images/fixture.png',
    image_alt: 'Fixture image',
    content: [
      { type: 'p', text: 'Read [Gartner](https://www.gartner.com/x) and [MCP](/insights/what-is-mcp).' },
      { type: 'image', src: 'https://example.supabase.co/storage/v1/object/public/blog-images/body.png', alt: 'Body image' },
    ],
    faq: [{ q: 'Does the fixture have an FAQ?', a: 'Yes, it does.' }],
    related_blogs: ['what-is-mcp'],
    redirect_from: ['cms-fixture-old-slug'],
  },
  {
    ...base,
    id: '2',
    slug: 'what-is-mcp', // clashes with content/blog/what-is-mcp.md
    title: 'CMS IMPOSTER TITLE',
    publish_at: '2099-01-01T00:00:00Z',
  },
  {
    ...base,
    id: '3',
    slug: 'cms-fixture-bad-category',
    title: 'Bad Category',
    category: 'Not A Category',
    publish_at: '2099-01-01T00:00:00Z',
  },
  {
    ...base,
    id: '4',
    slug: 'cms-fixture-older',
    title: 'CMS Fixture Older Post',
    publish_at: '2000-01-01T00:00:00Z',
  },
];

let savedCms: Buffer | null = null;

before(() => {
  savedCms = fs.existsSync(cmsFile) ? fs.readFileSync(cmsFile) : null;
  fs.mkdirSync(path.dirname(cmsFile), { recursive: true });
  fs.writeFileSync(cmsFile, JSON.stringify(rows.map((r) => rowToPost(r))));
  // The build without the Supabase fetch, so the fixture file is what it reads.
  execSync(
    'npx vite build --logLevel error && npx vite build --ssr src/entry-server.tsx --outDir dist-ssr --logLevel error && node scripts/prerender.mjs && node scripts/check-no-secrets.mjs',
    { cwd: root, stdio: 'pipe' }
  );
});

after(() => {
  if (savedCms) fs.writeFileSync(cmsFile, savedCms);
  else fs.rmSync(cmsFile, { force: true });
  fs.rmSync(dist, { recursive: true, force: true });
  fs.rmSync(path.join(root, 'dist-ssr'), { recursive: true, force: true });
});

test('a CMS post is prerendered with its SEO tags in the initial HTML', () => {
  const html = page('insights/cms-fixture-newest');
  assert.match(html, /<title>CMS Fixture: The Newest Post \| Fwdpod<\/title>/);
  assert.match(html, /<meta name="description" content="Learn how the CMS fixture post renders/);
  assert.match(html, /<link rel="canonical" href="https:\/\/www\.fwdpod\.com\/insights\/cms-fixture-newest"\/>/);
  assert.match(html, /<meta property="og:type" content="article"\/>/);
  assert.match(html, /<meta property="og:image" content="https:\/\/example\.supabase\.co\/storage\/v1\/object\/public\/blog-images\/fixture\.png"\/>/);
  assert.match(html, /twitter:card/);
  assert.match(html, /"@type":"BlogPosting"/);
  assert.match(html, /"@type":"FAQPage"/);
  assert.match(html, /Does the fixture have an FAQ\?/);
  assert.match(html, /<img src="https:\/\/example\.supabase\.co\/[^"]*body\.png" alt="Body image"/);
});

test('external links render as text, internal ones stay links', () => {
  const html = page('insights/cms-fixture-newest');
  assert.doesNotMatch(html, /href="https:\/\/www\.gartner\.com/);
  assert.match(html, /href="\/insights\/what-is-mcp"/);
});

test('the sitemap lists CMS posts from the same data', () => {
  const sitemap = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8');
  assert.match(sitemap, /<loc>https:\/\/www\.fwdpod\.com\/insights\/cms-fixture-newest<\/loc>\s*<lastmod>2099-01-02<\/lastmod>/);
  assert.match(sitemap, /insights\/cms-fixture-older/);
  assert.doesNotMatch(sitemap, /cms-fixture-bad-category/);
});

test('on a slug clash the markdown article wins', () => {
  const html = page('insights/what-is-mcp');
  assert.doesNotMatch(html, /CMS IMPOSTER TITLE/);
  const sitemap = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8');
  assert.equal(sitemap.match(/insights\/what-is-mcp</g)?.length, 1);
});

test('posts are newest first by publish date across both sources', () => {
  // The listing's Blog schema names every post, in listing order.
  const listing = page('insights');
  const order = [...listing.matchAll(/"datePublished":"([0-9-]+)","url":"https:\/\/www\.fwdpod\.com\/insights\/([a-z0-9-]+)"/g)].map(
    (m) => ({ date: m[1], slug: m[2] })
  );
  assert.equal(order[0].slug, 'cms-fixture-newest');
  assert.equal(order.at(-1)!.slug, 'cms-fixture-older');
  const dates = order.map((o) => o.date);
  assert.deepEqual(dates, [...dates].sort().reverse());
});

test('a renamed CMS post 301s from its old slug', () => {
  const htaccess = fs.readFileSync(path.join(dist, '.htaccess'), 'utf8');
  assert.match(
    htaccess,
    /# CMS_REDIRECTS\nRewriteCond %\{ENV:REDIRECT_STATUS\} \^\$\nRewriteRule \^insights\/cms-fixture-old-slug\/\?\$ https:\/\/www\.fwdpod\.com\/insights\/cms-fixture-newest \[R=301,L\]/
  );
});

test('unknown slugs get the real 404 page; the admin is never indexed', () => {
  assert.ok(fs.existsSync(path.join(dist, '_pages', 'insights', 'cms-fixture-bad-category.html')) === false);
  assert.match(page('404'), /noindex/);
  const htaccess = fs.readFileSync(path.join(dist, '.htaccess'), 'utf8');
  assert.match(htaccess, /ErrorDocument 404 \/_pages\/404\.html/);
  assert.match(htaccess, /RewriteCond %\{REQUEST_FILENAME\} !-f\r?\nRewriteRule \^ - \[R=404,L\]/);
  assert.match(fs.readFileSync(path.join(dist, 'admin.html'), 'utf8'), /<meta name="robots" content="noindex, nofollow"/);
  assert.doesNotMatch(fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8'), /admin/);
});

test('the public pages never load the admin or Supabase code', () => {
  const html = page('index');
  const scripts = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+\.js)"/g)].map((m) => m[1]);
  assert.ok(scripts.length > 0);
  for (const src of scripts) {
    assert.doesNotMatch(src, /admin/);
    // The supabase-js client, not a mere storage URL inside post data.
    assert.doesNotMatch(fs.readFileSync(path.join(dist, src), 'utf8'), /signInWithPassword|supabase-js|GoTrueClient/, src);
  }
  // Control: the same pattern does find the client in the admin bundle.
  const adminSrc = fs.readFileSync(path.join(dist, 'admin.html'), 'utf8').match(/src="(\/assets\/admin-[^"]+\.js)"/)![1];
  assert.match(fs.readFileSync(path.join(dist, adminSrc), 'utf8'), /signInWithPassword/);
});

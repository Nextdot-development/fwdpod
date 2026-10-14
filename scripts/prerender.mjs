/**
 * Build-time static rendering.
 *
 * Runs after `vite build` (client) and `vite build --ssr` (server bundle).
 * Renders every route from src/ssr/routes.ts to dist/_pages/<path>.html using
 * dist/index.html as the template, plus dist/_pages/404.html, and generates
 * dist/sitemap.xml from the same route list so it cannot drift. The .htaccess
 * rules map clean URLs onto those files.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(root, 'dist');
const pagesDir = path.join(distDir, '_pages');
const templatePath = path.join(distDir, 'index.html');

const HEAD_PLACEHOLDER = '<!--app-head-->';
const EMPTY_ROOT = '<div id="root"></div>';
const NOT_FOUND_PROBE = '/__prerender-not-found__';

const template = fs.readFileSync(templatePath, 'utf8');
if (!template.includes(HEAD_PLACEHOLDER) || !template.includes(EMPTY_ROOT)) {
  throw new Error(`dist/index.html is missing ${HEAD_PLACEHOLDER} or ${EMPTY_ROOT}`);
}

const serverEntry = pathToFileURL(path.join(root, 'dist-ssr', 'entry-server.js')).href;
const { render, getPrerenderRoutes, getPostRedirects, SITE_BASE_URL } = await import(serverEntry);

function outputFileFor(routePath) {
  return routePath === '/' ? 'index.html' : `${routePath.slice(1)}.html`;
}

function writePage(file, { head, appHtml }) {
  // Function replacers: page content may contain `$` sequences
  const html = template
    .replace(HEAD_PLACEHOLDER, () => head)
    .replace(EMPTY_ROOT, () => `<div id="root">${appHtml}</div>`);
  const dest = path.join(pagesDir, file);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, html);
}

// Every sitemap URL must be indexable and declare itself as canonical. A route
// marked indexable: false is checked the other way round — it has to be
// noindex, so a page meant to stay out of the index cannot quietly enter it.
function assertIndexable(routePath, head, indexable = true) {
  if (!indexable) {
    if (!head.includes('noindex')) {
      throw new Error(`Route ${routePath} is listed as non-indexable but is not marked noindex`);
    }
    return;
  }
  const canonical = `<link rel="canonical" href="${SITE_BASE_URL}${routePath}"/>`;
  if (!head.includes(canonical)) {
    throw new Error(`Route ${routePath} is not self-canonical (expected ${canonical})`);
  }
  if (head.includes('noindex')) throw new Error(`Route ${routePath} is marked noindex`);
}

// Articles must not link off fwdpod.com: sources are named in plain text, and
// the outbound links are what a knowledge hub gives away.
function assertNoExternalLinks(routePath, appHtml) {
  if (!routePath.startsWith('/insights/')) return;
  const external = [...appHtml.matchAll(/<a\s[^>]*href="(https?:\/\/[^"]+)"/g)]
    .map(m => m[1])
    .filter(href => !href.startsWith(SITE_BASE_URL));
  if (external.length) {
    throw new Error(`Route ${routePath} links to external sites: ${external.join(', ')}`);
  }
}

function xmlEscape(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildSitemap(routes) {
  // Non-indexable routes are rendered but never advertised.
  const urls = routes.filter(route => route.indexable !== false).map(route => {
    const lastmod = route.lastmod ? `\n    <lastmod>${route.lastmod}</lastmod>` : '';
    return `  <url>\n    <loc>${xmlEscape(SITE_BASE_URL + route.path)}</loc>${lastmod}\n  </url>`;
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}

fs.rmSync(pagesDir, { recursive: true, force: true });

const routes = getPrerenderRoutes();
const seen = new Set();
for (const route of routes) {
  if (seen.has(route.path)) throw new Error(`Duplicate prerender route: ${route.path}`);
  seen.add(route.path);

  const result = render(route.path);
  if (result.notFound) throw new Error(`Route ${route.path} rendered the not-found page`);
  assertIndexable(route.path, result.head, route.indexable !== false);
  assertNoExternalLinks(route.path, result.appHtml);
  writePage(outputFileFor(route.path), result);
}

const notFound = render(NOT_FOUND_PROBE);
if (!notFound.notFound) throw new Error('Not-found probe did not render the not-found page');
writePage('404.html', notFound);

fs.writeFileSync(path.join(distDir, 'sitemap.xml'), buildSitemap(routes));

// Renamed CMS articles: a 301 from each earlier slug, written at the marker
// public/.htaccess keeps for them, ahead of the prerendered-page rules.
const REDIRECT_MARKER = '# CMS_REDIRECTS';
const htaccessPath = path.join(distDir, '.htaccess');
const htaccess = fs.readFileSync(htaccessPath, 'utf8');
if (!htaccess.includes(REDIRECT_MARKER)) {
  throw new Error(`dist/.htaccess is missing the ${REDIRECT_MARKER} marker line`);
}
const redirects = getPostRedirects();
const redirectRules = redirects
  .flatMap(({ from, to }) => [
    'RewriteCond %{ENV:REDIRECT_STATUS} ^$',
    `RewriteRule ^${from.slice(1).replace(/[.]/g, '[.]')}/?$ ${SITE_BASE_URL}${to} [R=301,L]`,
  ])
  .join('\n');
fs.writeFileSync(
  htaccessPath,
  htaccess.replace(REDIRECT_MARKER, () => (redirectRules ? `${REDIRECT_MARKER}\n${redirectRules}` : REDIRECT_MARKER))
);

// The empty SPA shell must never be served now that every route has real HTML
fs.rmSync(templatePath);

const indexed = routes.filter(route => route.indexable !== false).length;
console.log(
  `Prerendered ${routes.length} routes + 404 page into dist/_pages; ` +
    `sitemap.xml lists ${indexed}` +
    (routes.length - indexed ? ` (${routes.length - indexed} noindex route(s) excluded)` : '') +
    (redirects.length ? `; ${redirects.length} CMS slug redirect(s)` : '')
);

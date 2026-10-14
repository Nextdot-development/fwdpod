/**
 * SEO.tsx — Page-level meta injection via react-helmet-async.
 *
 * Renders title, description, canonical, Open Graph, Twitter Card,
 * and arbitrary JSON-LD structured-data blocks into <head>.
 *
 * Usage:
 *   <SEO
 *     title="AI Engineering Pods for Startups & Enterprises | Fwdpod"
 *     description="..."
 *     canonical="/"
 *     jsonLd={schemaObject}
 *   />
 *
 * Place as the FIRST child of each page-level component so Helmet
 * merges cleanly regardless of render order.
 */

import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

// ── Constants ────────────────────────────────────────────────────────────────

export const SITE_BASE_URL = 'https://www.fwdpod.com';
export const SITE_NAME     = 'Fwdpod';
export const TWITTER_HANDLE = '@fwdpod';
export const DEFAULT_OG_IMAGE = `${SITE_BASE_URL}/og-image.png`;

// ── Types ────────────────────────────────────────────────────────────────────

export interface SEOProps {
  /** Full browser-tab title. Include primary keyword + brand. */
  title: string;
  /** 145–160 character meta description with primary keyword. */
  description: string;
  /**
   * Overrides the canonical path. Defaults to the current route, so a page
   * cannot inherit another page's URL. Not emitted for noindex pages.
   */
  canonical?: string;
  /** og:type — 'website' for pages, 'article' for blog posts. */
  ogType?: 'website' | 'article';
  /** Absolute URL to the OG share image (1200×630). */
  ogImage?: string;
  /** ISO 8601 publish date for article pages. */
  articlePublishedTime?: string;
  /** ISO 8601 modified date for article pages. */
  articleModifiedTime?: string;
  /** JSON-LD schema object(s). Use @graph for multiple schemas. */
  jsonLd?: Record<string, unknown>;
  /** Set true only for admin/utility views that must not be indexed. */
  noindex?: boolean;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function SEO({
  title,
  description,
  canonical,
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  articlePublishedTime,
  articleModifiedTime,
  jsonLd,
  noindex = false,
}: SEOProps) {
  // Canonical = this page's own URL: the current route unless overridden.
  // Query strings and fragments are excluded, and a trailing slash is dropped
  // to match the one-hop redirect in .htaccess.
  const { pathname } = useLocation();
  const path = canonical ?? pathname;
  const fullUrl = `${SITE_BASE_URL}${path.length > 1 ? path.replace(/\/+$/, '') : '/'}`;
  const robotsMeta = noindex ? 'noindex,nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';

  return (
    <Helmet>
      {/* ── Core ─────────────────────────────────────────────────────────── */}
      <title>{title}</title>
      <meta name="description"  content={description} />
      <meta name="robots"       content={robotsMeta} />
      {!noindex && <link rel="canonical" href={fullUrl} />}

      {/* ── Open Graph ───────────────────────────────────────────────────── */}
      <meta property="og:title"       content={title} />
      <meta property="og:description" content={description} />
      {!noindex && <meta property="og:url" content={fullUrl} />}
      <meta property="og:type"        content={ogType} />
      <meta property="og:image"       content={ogImage} />
      <meta property="og:image:width"  content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt"    content={title} />
      <meta property="og:site_name"   content={SITE_NAME} />
      <meta property="og:locale"      content="en_US" />

      {/* ── Twitter / X Card ─────────────────────────────────────────────── */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:site"        content={TWITTER_HANDLE} />
      <meta name="twitter:creator"     content={TWITTER_HANDLE} />
      <meta name="twitter:title"       content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={ogImage} />

      {/* ── Article-specific (og:type=article only) ───────────────────────── */}
      {articlePublishedTime && (
        <meta property="article:published_time" content={articlePublishedTime} />
      )}
      {articleModifiedTime && (
        <meta property="article:modified_time" content={articleModifiedTime} />
      )}
      {ogType === 'article' && (
        <meta property="article:author" content={SITE_NAME} />
      )}

      {/* ── JSON-LD Structured Data ──────────────────────────────────────── */}
      {/* '<' is escaped so page text can never close the script tag in server HTML */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd).replace(/</g, '\\u003c')}
        </script>
      )}
    </Helmet>
  );
}

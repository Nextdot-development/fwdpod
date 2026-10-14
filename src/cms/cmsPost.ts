/**
 * CMS rows -> the site's article format.
 *
 * Posts written in the admin are stored in Supabase as structured blocks. The
 * public site renders markdown (src/components/blog/markdown.tsx), so at build
 * time every visible row is converted here into the same shape a
 * content/blog/*.md file produces. The admin preview runs the same conversion,
 * so what the editor previews is what the build publishes.
 *
 * Pure and dependency-free: imported by the build script (via tsx), the site
 * bundle and the admin bundle.
 */

export const SITE_ORIGIN = 'https://www.fwdpod.com';

export interface CmsFaqItem {
  q: string;
  a: string;
}

export type CmsBlock =
  | { type: 'h1' | 'h2' | 'h3' | 'p' | 'blockquote'; text: string }
  | { type: 'ul' | 'ol'; items: string[] }
  | { type: 'code'; text: string; language?: string }
  | { type: 'hr' }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'image'; src: string; alt?: string; caption?: string; width?: number }
  | { type: 'faq'; items: CmsFaqItem[] };

/** The columns of a `blogs` row the build reads. */
export interface CmsRow {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: CmsBlock[] | null;
  featured_image?: string | null;
  image_alt?: string | null;
  category?: string | null;
  tags?: string[] | null;
  seo_title?: string | null;
  meta_description?: string | null;
  focus_keyword?: string | null;
  read_time?: string | null;
  author?: string | null;
  status: string;
  publish_at?: string | null;
  published_at?: string | null;
  updated_at?: string | null;
  time_zone?: string | null;
  related_blogs?: string[] | null;
  faq?: CmsFaqItem[] | null;
  redirect_from?: string[] | null;
}

/** One converted post, as written to content/cms/posts.json. */
export interface CmsPostJson {
  id: string;
  slug: string;
  title: string;
  seoTitle?: string;
  /** Card text and meta description, like `meta_description` in a .md file. */
  description: string;
  category: string;
  /** YYYY-MM-DD in the post's own time zone. */
  date: string;
  /** Full instant, for ordering posts published on the same day. */
  publishAt: string;
  updatedAt?: string;
  markdown: string;
  readTime?: string;
  author?: string;
  image?: string;
  imageAlt?: string;
  keywords?: string[];
  related?: string[];
  redirectFrom?: string[];
}

// ---------------------------------------------------------------------------
// Inline text
// ---------------------------------------------------------------------------

const LINK_RE = /\[([^\]]+)\]\(((?:[^()\s]|\([^()\s]*\))+)\)/g;

/**
 * Editor tokens -> the public renderer's inline set. The renderer knows
 * bold, italic, links and code; underline and strike keep their text.
 * Links to fwdpod.com become site-relative so they route in-app; any other
 * absolute link is reduced to its label, because articles must not link off
 * the site (prerender.mjs fails the build on one). Removed URLs are reported.
 */
export function normalizeInline(text: string, removed: string[] = []): string {
  return text
    .replace(/__([^_]+)__/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(LINK_RE, (whole, label: string, href: string) => {
      if (href.startsWith('/') || href.startsWith('#')) return whole;
      const own = href.match(/^https?:\/\/(?:www\.)?fwdpod\.com(\/[^\s]*)?$/i);
      if (own) return `[${label}](${own[1] || '/'})`;
      if (/^mailto:/i.test(href)) return whole;
      removed.push(href);
      return label;
    })
    .replace(/\s+/g, ' ')
    .trim();
}

/** Every absolute link the build would strip, for the editor's warning. */
export function findExternalLinks(blocks: CmsBlock[], faq: CmsFaqItem[] = []): string[] {
  const removed: string[] = [];
  blocksToMarkdown(blocks, faq, removed);
  return [...new Set(removed)];
}

// ---------------------------------------------------------------------------
// Blocks -> markdown
// ---------------------------------------------------------------------------

function tableCell(text: string, removed: string[]): string {
  // The renderer splits rows on every "|", so a literal one would shift cells.
  return normalizeInline(text, removed).replace(/\|/g, '/') || ' ';
}

function blockToMarkdown(block: CmsBlock, removed: string[]): string {
  switch (block.type) {
    case 'h1':
    case 'h2':
      return `## ${normalizeInline(block.text, removed)}`;
    case 'h3':
      return `### ${normalizeInline(block.text, removed)}`;
    case 'p':
      return normalizeInline(block.text, removed);
    case 'blockquote':
      return `> ${normalizeInline(block.text, removed)}`;
    case 'ul':
      return block.items
        .map(item => normalizeInline(item, removed))
        .filter(Boolean)
        .map(item => `- ${item}`)
        .join('\n');
    case 'ol':
      return block.items
        .map(item => normalizeInline(item, removed))
        .filter(Boolean)
        .map((item, i) => `${i + 1}. ${item}`)
        .join('\n');
    case 'code':
      return block.text.trim() ? `\`\`\`${block.language ?? ''}\n${block.text.replace(/\n+$/, '')}\n\`\`\`` : '';
    case 'hr':
      return '---';
    case 'table': {
      const headers = block.headers.length ? block.headers : block.rows[0] ?? [];
      const rows = block.headers.length ? block.rows : block.rows.slice(1);
      if (!headers.length) return '';
      const width = headers.length;
      const line = (cells: string[]) =>
        `| ${Array.from({ length: width }, (_, i) => tableCell(cells[i] ?? '', removed)).join(' | ')} |`;
      return [line(headers), `|${' --- |'.repeat(width)}`, ...rows.map(line)].join('\n');
    }
    case 'image': {
      if (!block.src) return '';
      const alt = (block.alt ?? '').replace(/[\[\]]/g, '');
      const caption = block.caption ? ` "${block.caption.replace(/"/g, "'")}"` : '';
      return `![${alt}](${block.src}${caption})`;
    }
    case 'faq':
      return ''; // FAQ is its own field, appended as a section below
  }
}

/**
 * The article body as markdown. FAQ items become the "Frequently Asked
 * Questions" section the site already turns into FAQPage schema.
 */
export function blocksToMarkdown(blocks: CmsBlock[], faq: CmsFaqItem[] = [], removed: string[] = []): string {
  const parts = (blocks ?? []).map(block => blockToMarkdown(block, removed)).filter(Boolean);
  const items = (faq ?? []).filter(item => item.q?.trim() && item.a?.trim());
  if (items.length) {
    parts.push('## Frequently Asked Questions');
    for (const item of items) {
      parts.push(`### ${normalizeInline(item.q, removed)}`);
      parts.push(normalizeInline(item.a, removed));
    }
  }
  return parts.join('\n\n');
}

// ---------------------------------------------------------------------------
// Row -> post
// ---------------------------------------------------------------------------

/** YYYY-MM-DD of an instant as seen in a time zone. */
export function dateInZone(iso: string, timeZone: string): string {
  const date = new Date(iso);
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

/** A Supabase Storage URL or a site path; site paths stay relative. */
function cleanImage(src: string | null | undefined): string | undefined {
  const value = (src ?? '').trim();
  if (!value) return undefined;
  return value.replace(/^https?:\/\/(?:www\.)?fwdpod\.com(?=\/)/i, '');
}

export function rowToPost(row: CmsRow, removed: string[] = []): CmsPostJson {
  const publishAt = row.publish_at || row.published_at || row.updated_at || new Date().toISOString();
  const description = (row.meta_description || row.excerpt || '').trim();
  return {
    id: `cms-${row.id}`,
    slug: row.slug,
    title: row.title.trim() || row.slug,
    seoTitle: row.seo_title?.trim() || undefined,
    description,
    category: (row.category ?? '').trim(),
    date: dateInZone(publishAt, row.time_zone || 'Asia/Kolkata'),
    publishAt: new Date(publishAt).toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
    markdown: blocksToMarkdown(row.content ?? [], row.faq ?? [], removed),
    readTime: row.read_time?.trim() || undefined,
    author: row.author?.trim() || undefined,
    image: cleanImage(row.featured_image),
    imageAlt: row.image_alt?.trim() || undefined,
    keywords: (row.tags ?? []).map(tag => tag.trim()).filter(Boolean),
    related: (row.related_blogs ?? []).filter(Boolean),
    redirectFrom: (row.redirect_from ?? []).filter(slug => slug && slug !== row.slug),
  };
}

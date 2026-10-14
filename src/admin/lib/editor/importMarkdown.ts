/**
 * Markdown → blog import. Parses a full Markdown document (optionally with YAML
 * frontmatter) into the site's structured fields so a non-coder can paste/upload
 * a .md file and have every field filled automatically:
 *   - frontmatter → title, slug, excerpt, meta/SEO, category, tags, author,
 *     featured image, related slugs
 *   - body → BlogBlock[] (headings, paragraphs, lists, tables, images, code,
 *     quotes, dividers) with inline **bold** *italic* [links](url) preserved
 *   - a "## FAQ" section → FaqItem[] (each ### question + its answer)
 *   - a "## Related" section (or frontmatter `related:`) → related blog slugs
 *
 * Zero dependencies — deterministic and offline. Inline Markdown tokens already
 * match the public renderer's format, so paragraph text is kept verbatim (only
 * `__bold__` underscore-bold is normalised to `**bold**` and inline `code`
 * backticks are unwrapped).
 */
import type { BlogBlock, FaqItem } from "@admin/types/blog";
import { slugify } from "@admin/utils/slug";

export interface MarkdownImport {
  title?: string;
  slug?: string;
  excerpt?: string;
  metaDescription?: string;
  seoTitle?: string;
  /** From `Primary query:` in the comment block, or frontmatter focus_keyword / keyword. */
  focusKeyword?: string;
  category?: string;
  tags: string[];
  author?: string;
  featuredImage?: string;
  imageAlt?: string;
  readTime?: string;
  related: string[];
  faq: FaqItem[];
  content: BlogBlock[];
  stats: { blocks: number; headings: number; images: number; tables: number; lists: number; faq: number; related: number };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** An /insights/slug URL, a bare path, or a full URL → the trailing slug. */
function toSlug(raw: string): string {
  const s = String(raw || "").trim().replace(/[?#].*$/, "").replace(/\/+$/, "");
  if (!s) return "";
  const fromBlogs = s.match(/\/(?:insights|blogs?)\/([^/]+)$/)?.[1];
  if (fromBlogs) return fromBlogs;
  // A URL or path → last segment; a plain title → slugify it.
  if (/[\s]/.test(s) && !s.includes("/")) return slugify(s);
  return s.split("/").filter(Boolean).pop() ?? "";
}

/** Normalise inline Markdown to the site's inline token format. */
function normInline(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "$1")            // drop inline-code backticks (renderer has no code mark)
    .replace(/__([^_]+?)__/g, "**$1**")     // Markdown __bold__ → our **bold**
    .replace(/\s+/g, " ")
    .trim();
}

/** Strip inline tokens to plain text (for excerpt / title comparison). */
function plain(text: string): string {
  return text
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1") // links/images → label
    .replace(/[*_~`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const isBlank = (l: string) => l.trim() === "";
const HR_RE = /^\s*([-*_])(?:\s*\1){2,}\s*$/;
const IMAGE_ONLY_RE = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)\s*$/;

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|\s*$/, "")
    .split(/\s*(?<!\\)\|\s*/)
    .map((c) => normInline(c.replace(/\\\|/g, "|")));
}
const isTableSep = (line: string) =>
  /^\s*\|?\s*:?-{1,}:?\s*(\|\s*:?-{1,}:?\s*)+\|?\s*$/.test(line);

// ---------------------------------------------------------------------------
// Frontmatter
// ---------------------------------------------------------------------------

function parseFrontmatter(src: string): { data: Record<string, string | string[]>; body: string } {
  const m = src.match(/^﻿?---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: src.replace(/^﻿/, "") };
  const data: Record<string, string | string[]> = {};
  const lines = m[1].split(/\r?\n/);
  let key = "";
  for (const line of lines) {
    if (isBlank(line)) continue;
    const listItem = line.match(/^\s*-\s+(.*)$/);
    if (listItem && key) {
      const arr = Array.isArray(data[key]) ? (data[key] as string[]) : [];
      arr.push(unquote(listItem[1]));
      data[key] = arr;
      continue;
    }
    const kv = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!kv) continue;
    key = kv[1].trim().toLowerCase();
    const val = kv[2].trim();
    if (val === "") { data[key] = []; continue; } // block list follows
    if (/^\[.*\]$/.test(val)) {
      data[key] = val.slice(1, -1).split(",").map((s) => unquote(s.trim())).filter(Boolean);
    } else {
      data[key] = unquote(val);
    }
  }
  return { data, body: src.slice(m[0].length) };
}

const unquote = (s: string) => s.replace(/^['"]|['"]$/g, "").trim();
function fmStr(d: Record<string, string | string[]>, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = d[k];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (Array.isArray(v) && v.length) return v.join(", ");
  }
  return undefined;
}
function fmArr(d: Record<string, string | string[]>, ...keys: string[]): string[] {
  for (const k of keys) {
    const v = d[k];
    if (Array.isArray(v)) return v.filter(Boolean);
    if (typeof v === "string" && v.trim()) return v.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

// ---------------------------------------------------------------------------
// Body → blocks
// ---------------------------------------------------------------------------

function bodyToBlocks(body: string): BlogBlock[] {
  const lines = body.split(/\r?\n/);
  const blocks: BlogBlock[] = [];
  let i = 0;

  const isBlockStart = (l: string) =>
    isBlank(l) || /^#{1,6}\s/.test(l) || /^```/.test(l) || HR_RE.test(l) ||
    /^\s*>/.test(l) || /^\s*[-*+]\s/.test(l) || /^\s*\d+[.)]\s/.test(l) || IMAGE_ONLY_RE.test(l);

  while (i < lines.length) {
    const line = lines[i];
    if (isBlank(line)) { i++; continue; }

    // Fenced code block
    const fence = line.match(/^```\s*([\w+-]*)\s*$/);
    if (fence) {
      const lang = fence[1];
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++; // closing fence
      blocks.push({ type: "code", text: buf.join("\n"), ...(lang ? { language: lang } : {}) });
      continue;
    }

    // ATX heading
    const heading = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
    if (heading) {
      const level = heading[1].length;
      const text = normInline(heading[2]);
      if (text) blocks.push({ type: level === 1 ? "h1" : level === 2 ? "h2" : "h3", text });
      i++;
      continue;
    }

    // Horizontal rule
    if (HR_RE.test(line)) { blocks.push({ type: "hr" }); i++; continue; }

    // Image-only line
    const img = line.match(IMAGE_ONLY_RE);
    if (img) {
      blocks.push({ type: "image", src: img[2], ...(img[1] ? { alt: img[1] } : {}), ...(img[3] ? { caption: img[3] } : {}) });
      i++;
      continue;
    }

    // Blockquote
    if (/^\s*>/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) { buf.push(lines[i].replace(/^\s*>\s?/, "")); i++; }
      blocks.push({ type: "blockquote", text: normInline(buf.join(" ")) });
      continue;
    }

    // Table (header row + separator)
    if (line.includes("|") && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const headers = splitTableRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|") && !isBlank(lines[i])) {
        rows.push(splitTableRow(lines[i]));
        i++;
      }
      blocks.push({ type: "table", headers, rows });
      continue;
    }

    // Unordered list
    if (/^\s*[-*+]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*+]\s/.test(lines[i])) { items.push(normInline(lines[i].replace(/^\s*[-*+]\s+/, ""))); i++; }
      blocks.push({ type: "ul", items: items.filter(Boolean) });
      continue;
    }

    // Ordered list
    if (/^\s*\d+[.)]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s/.test(lines[i])) { items.push(normInline(lines[i].replace(/^\s*\d+[.)]\s+/, ""))); i++; }
      blocks.push({ type: "ol", items: items.filter(Boolean) });
      continue;
    }

    // Paragraph — gather until a blank line or the next block starter
    const buf: string[] = [line];
    i++;
    while (i < lines.length && !isBlockStart(lines[i])) { buf.push(lines[i]); i++; }
    const text = normInline(buf.join(" "));
    if (text) blocks.push({ type: "p", text });
  }

  return blocks;
}

// ---------------------------------------------------------------------------
// Section extraction (FAQ / Related) operate on parsed blocks
// ---------------------------------------------------------------------------

const headingLevel = (b: BlogBlock) => (b.type === "h1" ? 1 : b.type === "h2" ? 2 : b.type === "h3" ? 3 : 0);
const headingText = (b: BlogBlock) => ("text" in b ? plain(b.text) : "");

/** Find [start, end) block range of a heading section matching `re`. */
function findSection(blocks: BlogBlock[], re: RegExp): { headIdx: number; start: number; end: number } | null {
  const headIdx = blocks.findIndex((b) => headingLevel(b) > 0 && re.test(headingText(b)));
  if (headIdx === -1) return null;
  const level = headingLevel(blocks[headIdx]);
  let end = headIdx + 1;
  while (end < blocks.length && !(headingLevel(blocks[end]) > 0 && headingLevel(blocks[end]) <= level)) end++;
  return { headIdx, start: headIdx + 1, end };
}

function extractFaq(section: BlogBlock[]): FaqItem[] {
  const items: FaqItem[] = [];
  let cur: FaqItem | null = null;
  const push = () => { if (cur && cur.q) items.push(cur); };
  const addAnswer = (t: string) => { if (cur && t) cur.a = cur.a ? `${cur.a} ${t}` : t; };
  for (const b of section) {
    // A heading is always a question.
    if (headingLevel(b) > 0) {
      push();
      cur = { q: plain(headingText(b)), a: "" };
      continue;
    }
    if (b.type === "p") {
      // A paragraph that STARTS with a bold run is a question. Because authors
      // often put the answer on the very next line (no blank line between), the
      // question and answer arrive merged in one paragraph — split them here:
      //   "**Can an AI scribe…?** Yes, and for most clinics…"
      const m = b.text.trim().match(/^\*\*(.+?)\*\*[:.\s]*([\s\S]*)$/);
      if (m && m[1].trim()) {
        push();
        cur = { q: plain(m[1]), a: m[2].trim() };
        continue;
      }
      addAnswer(b.text.trim()); // a following paragraph continues the answer
      continue;
    }
    if (b.type === "blockquote") addAnswer(b.text.trim());
    else if (b.type === "ul" || b.type === "ol") addAnswer(b.items.join(" "));
  }
  push();
  return items.filter((f) => f.q);
}

function extractRelated(section: BlogBlock[]): string[] {
  const slugs: string[] = [];
  const fromText = (t: string) => {
    const links = [...t.matchAll(/\[([^\]]*)\]\(([^)]+)\)/g)];
    if (links.length) links.forEach((m) => slugs.push(toSlug(m[2])));
    else if (t.trim()) slugs.push(toSlug(t));
  };
  for (const b of section) {
    if (b.type === "ul" || b.type === "ol") b.items.forEach(fromText);
    else if (b.type === "p") fromText(b.text);
  }
  return slugs;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

/**
 * Pull `Key: value` lines out of the first HTML comment (authors often keep an
 * `<!-- SEO title: … -->` notes block at the top). Keys are normalised to the
 * frontmatter convention (lowercase, spaces/hyphens → "_") so "SEO title" →
 * `seo_title`, "Meta description" → `meta_description`, etc. — and are then
 * picked up by the same field lookups as real frontmatter. Unknown keys
 * (Vertical, Sources used, …) are simply ignored.
 */
function parseCommentMeta(src: string): Record<string, string> {
  const m = src.match(/<!--([\s\S]*?)-->/);
  if (!m) return {};
  const out: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^\s*([A-Za-z][A-Za-z0-9 _-]*?)\s*:\s*(.+?)\s*$/);
    if (!kv) continue;
    const key = kv[1].trim().toLowerCase().replace(/[\s-]+/g, "_");
    if (!(key in out)) out[key] = kv[2].trim();
  }
  return out;
}

export function parseMarkdown(src: string): MarkdownImport {
  const raw = src || "";
  // Read metadata from a leading HTML comment, then strip all comments so they
  // never land in the article body. Real frontmatter (below) overrides these.
  const commentMeta = parseCommentMeta(raw);
  const cleaned = raw.replace(/<!--[\s\S]*?-->/g, "");
  const { data: fmData, body } = parseFrontmatter(cleaned);
  const data: Record<string, string | string[]> = { ...commentMeta, ...fmData };
  let blocks = bodyToBlocks(body);

  // FAQ section → FaqItem[], then remove those blocks from the body.
  let faq: FaqItem[] = [];
  const faqSec = findSection(blocks, /^(faqs?|frequently asked questions?)\b/i);
  if (faqSec) {
    faq = extractFaq(blocks.slice(faqSec.start, faqSec.end));
    blocks = [...blocks.slice(0, faqSec.headIdx), ...blocks.slice(faqSec.end)];
  }

  // Related section → slugs, then remove those blocks.
  let related: string[] = [];
  const relSec = findSection(blocks, /^related\b/i);
  if (relSec) {
    related = extractRelated(blocks.slice(relSec.start, relSec.end));
    blocks = [...blocks.slice(0, relSec.headIdx), ...blocks.slice(relSec.end)];
  }
  // Merge frontmatter related (slugs or URLs).
  related = [...fmArr(data, "related", "relatedblogs", "related_blogs").map(toSlug), ...related]
    .filter(Boolean)
    .filter((s, idx, a) => a.indexOf(s) === idx);

  // Title: frontmatter, else first H1 (which is then removed to avoid duplication).
  let title = fmStr(data, "title");
  if (!title && blocks[0] && blocks[0].type === "h1") {
    title = "text" in blocks[0] ? plain(blocks[0].text) : undefined;
    blocks = blocks.slice(1);
  } else if (title && blocks[0]?.type === "h1" && "text" in blocks[0] && plain(blocks[0].text) === plain(title)) {
    blocks = blocks.slice(1); // drop a leading H1 that just repeats the title
  }

  // Featured image: frontmatter, else promote a leading image block.
  let featuredImage = fmStr(data, "featuredimage", "featured_image", "cover", "coverimage", "cover_image", "image");
  let imageAlt = fmStr(data, "imagealt", "image_alt", "alt");
  if (!featuredImage) {
    const lead = blocks.findIndex((b) => b.type !== "hr");
    if (lead !== -1 && blocks[lead].type === "image") {
      const im = blocks[lead] as Extract<BlogBlock, { type: "image" }>;
      featuredImage = im.src;
      if (!imageAlt && im.alt) imageAlt = im.alt;
      blocks = [...blocks.slice(0, lead), ...blocks.slice(lead + 1)];
    }
  }

  // Excerpt / meta / SEO fallbacks so the fields aren't left blank.
  const firstP = blocks.find((b) => b.type === "p") as Extract<BlogBlock, { type: "p" }> | undefined;
  const excerpt = fmStr(data, "excerpt", "description", "summary") || (firstP ? plain(firstP.text).slice(0, 220) : undefined);
  const metaDescription = fmStr(data, "metadescription", "meta_description", "seodescription", "seo_description") || excerpt;
  // SEO title comes ONLY from an explicit "SEO title"/meta-title line — take it
  // exactly as written. Never fall back to the (long) H1, so an empty SEO-title
  // line leaves the field blank for the author rather than padding it.
  const seoTitle = fmStr(data, "seotitle", "seo_title", "metatitle", "meta_title");

  const tags = fmArr(data, "tags", "keywords");
  // Never guessed: only an explicit primary-query / focus-keyword line fills it.
  const focusKeyword = fmStr(data, "focus_keyword", "focuskeyword", "focus_keyphrase", "keyword", "primary_query");

  const stats = {
    blocks: blocks.length,
    headings: blocks.filter((b) => headingLevel(b) > 0).length,
    images: blocks.filter((b) => b.type === "image").length,
    tables: blocks.filter((b) => b.type === "table").length,
    lists: blocks.filter((b) => b.type === "ul" || b.type === "ol").length,
    faq: faq.length,
    related: related.length,
  };

  return {
    title,
    slug: fmStr(data, "slug"),
    excerpt,
    metaDescription,
    seoTitle,
    focusKeyword,
    category: fmStr(data, "category"),
    tags,
    author: fmStr(data, "author"),
    featuredImage,
    imageAlt,
    readTime: fmStr(data, "readtime", "read_time"),
    related,
    faq,
    content: blocks,
    stats,
  };
}

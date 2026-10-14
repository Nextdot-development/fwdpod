/**
 * Blog data layer.
 *
 * Articles are markdown files in content/blog/, read at build time. To publish,
 * drop in a .md file with this frontmatter and rebuild — routing, the listing,
 * the sitemap and the article page all follow automatically:
 *
 *   ---
 *   title: "Your Post Title"
 *   seo_title: "Shorter Title For The Tab"   # optional, falls back to title
 *   meta_description: "Shown as the card excerpt and the meta description."
 *   slug: your-post-title
 *   category: Forward Deployed Engineering   # a name or slug from blogCategories.ts
 *   date: 2026-09-23                  # YYYY-MM-DD
 *   image: /blog-images/your-post.jpg # optional, 1600x900 (16:9), public/blog-images/
 *   image_alt: "What the image shows" # optional, falls back to the title
 *   keywords: "a, b, c"               # optional, comma separated
 *   featured: true                    # optional, one post at a time
 *   ---
 *
 * The listing is INSIGHTS_PATH (/insights) and an article is
 * /insights/<slug>. Use INSIGHTS_PATH and postPath() rather than writing
 * either path by hand: /blog is a permanent redirect and must not come back.
 *
 * A "## Frequently Asked Questions" section with "### Question" subheadings is
 * picked up automatically and emitted as FAQPage schema — the questions stay
 * in the body, so what the crawler reads is what the reader sees.
 */
import { PLACEHOLDER_POSTS } from './blogPlaceholders';
import type { CmsPostJson } from '../cms/cmsPost';

import {
  BLOG_CATEGORIES,
  getCategory,
  getCategoryName,
  listAcceptedCategories,
  resolveCategorySlug,
  type BlogCategoryDef,
  type BlogCategorySlug,
} from './blogCategories';

export { BLOG_CATEGORIES, getCategory, getCategoryName } from './blogCategories';
export type { BlogCategoryDef, BlogCategorySlug } from './blogCategories';

export interface BlogFaq {
  question: string;
  answer: string;
}

export interface BlogPost {
  id: string;
  title: string;
  /** Shorter title for <title>, when the on-page headline is too long. */
  seoTitle?: string;
  /** URL segment: the post is served at /insights/<slug>. */
  slug: string;
  /** Display name of the post's category. */
  category: string;
  /** Validated category slug — the one the category page is served at. */
  categorySlug: BlogCategorySlug;
  /** One or two sentences, used on the card and as the meta description. */
  excerpt: string;
  /** Markdown body. Empty for placeholders. */
  content: string;
  /** Display date, e.g. "Sep 23, 2026". */
  date: string;
  /** YYYY-MM-DD, for schema and <lastmod>. */
  isoDate?: string;
  readTime: string;
  author: string;
  /** Path under public/, e.g. /blog-images/my-post.jpg. Falls back to a panel. */
  image?: string;
  /** Alt text for the image; the title is used when this is absent. */
  imageAlt?: string;
  /** Topic keywords from frontmatter, used in schema only. */
  keywords?: string[];
  /** Q&A parsed out of the body's FAQ section, for FAQPage schema. */
  faqs?: BlogFaq[];
  /** Marks the one post shown in the featured slot. */
  featured?: boolean;
  /** True for the stand-in cards shown while no articles exist. */
  placeholder?: boolean;
  /** Where the post comes from: a content/blog/*.md file or the CMS. */
  source?: 'markdown' | 'cms';
  /** Full publish instant (CMS posts), to order posts that share a date. */
  publishedAt?: string;
  /** Hand-picked related posts, in order (CMS "Related in this series"). */
  relatedSlugs?: string[];
  /** Earlier slugs of this post, permanently redirected to it. */
  redirectFrom?: string[];
}

/** The listing route. Everything that links to it reads this. */
export const INSIGHTS_PATH = '/insights';

/** The route an article is served at. One place, so the prefix can move. */
export function postPath(post: Pick<BlogPost, 'slug'>): string {
  return `${INSIGHTS_PATH}/${post.slug}`;
}

/** Kept for callers that predate the BlogPost rename. */
export type StaticBlogPost = BlogPost;

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } | null {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return null;
  const meta: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
  }
  return { meta, body: match[2].trim() };
}

function formatDate(d: string): string {
  return new Date(`${d}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Markdown stripped back to plain sentences, for schema fields. Underscores
 * stay: articles never use _emphasis_, but they do name identifiers such as
 * thread_id, which must not collapse to "threadid".
 */
export function toPlainText(markdown: string): string {
  return markdown
    .replace(/!\[[^\]]*\]\((?:[^()\s]|\([^()\s]*\))*\)/g, '')
    .replace(/\[([^\]]+)\]\((?:[^()\s]|\([^()\s]*\))*\)/g, '$1')
    .replace(/[*`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Reads the body's FAQ section into Q&A pairs. The section is left in the
 * body: schema must describe content the page actually shows.
 */
function extractFaqs(body: string): BlogFaq[] {
  const lines = body.split('\n');
  const start = lines.findIndex(line =>
    /^##\s+(frequently asked questions|faqs?)\b/i.test(line.trim())
  );
  if (start === -1) return [];

  const faqs: BlogFaq[] = [];
  let question: string | null = null;
  let answer: string[] = [];

  const flush = () => {
    const text = answer.join(' ').trim();
    if (question && text) faqs.push({ question, answer: toPlainText(text) });
    question = null;
    answer = [];
  };

  for (const line of lines.slice(start + 1)) {
    const trimmed = line.trim();
    if (/^##\s/.test(trimmed)) break; // next H2 closes the section
    if (/^###\s/.test(trimmed)) {
      flush();
      question = toPlainText(trimmed.replace(/^###\s+/, '').replace(/^\d+[.)]\s*/, ''));
      continue;
    }
    if (question && trimmed) answer.push(trimmed);
  }
  flush();

  return faqs;
}

function estimateReadTime(text: string): string {
  const mins = Math.max(4, Math.ceil(text.trim().split(/\s+/).length / 200));
  return `${mins} min read`;
}

// Load all markdown files eagerly at build time via Vite glob import
const rawFiles = import.meta.glob('../../content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export const STATIC_BLOG_POSTS: BlogPost[] = Object.entries(rawFiles)
  .map(([file, raw]) => {
    const name = file.split('/').pop() ?? file;
    const parsed = parseFrontmatter(raw);
    if (!parsed) {
      throw new Error(`content/blog/${name}: no frontmatter block found`);
    }
    const { meta, body } = parsed;
    if (!meta.slug) {
      throw new Error(`content/blog/${name}: frontmatter is missing "slug"`);
    }
    // Validated here rather than at render time: a typo should stop the build,
    // not publish a post that no category page lists.
    const categorySlug = resolveCategorySlug(meta.category ?? '');
    if (!categorySlug) {
      throw new Error(
        `content/blog/${name}: category ${JSON.stringify(meta.category ?? '')} is not a known ` +
          `category. Use one of: ${listAcceptedCategories()}`
      );
    }
    return {
      id: `static-${meta.slug}`,
      title: meta.title ?? meta.slug,
      seoTitle: meta.seo_title || undefined,
      slug: meta.slug,
      category: getCategoryName(categorySlug),
      categorySlug,
      excerpt: meta.meta_description ?? '',
      content: body,
      date: meta.date ? formatDate(meta.date) : '',
      isoDate: meta.date && !Number.isNaN(Date.parse(meta.date)) ? meta.date : undefined,
      readTime: estimateReadTime(body),
      author: 'Fwdpod',
      image: meta.image || undefined,
      imageAlt: meta.image_alt || undefined,
      keywords: meta.keywords
        ? meta.keywords.split(',').map(k => k.trim()).filter(Boolean)
        : undefined,
      faqs: extractFaqs(body),
      featured: meta.featured === 'true',
      source: 'markdown',
    } as BlogPost;
  })
  .filter((p): p is BlogPost => p !== null)
  .sort((a, b) => (b.isoDate ?? '').localeCompare(a.isoDate ?? '') || a.title.localeCompare(b.title));

// ── CMS posts ──────────────────────────────────────────────────────────────
// content/cms/posts.json is written before every build by
// scripts/fetch-cms-posts.ts with the posts the database says are public.
// The glob keeps the build working when the file has not been generated.
const cmsFiles = import.meta.glob('../../content/cms/posts.json', {
  import: 'default',
  eager: true,
}) as Record<string, CmsPostJson[]>;

const STATIC_SLUGS = new Set(STATIC_BLOG_POSTS.map(post => post.slug));

/** Public CMS posts. On a slug clash the markdown article wins. */
export const CMS_BLOG_POSTS: BlogPost[] = Object.values(cmsFiles)
  .flat()
  .flatMap((cms): BlogPost[] => {
    if (STATIC_SLUGS.has(cms.slug)) {
      console.warn(`CMS post "${cms.slug}" skipped: content/blog/ already has an article with that slug`);
      return [];
    }
    // Same rule as frontmatter, but a bad row skips one post rather than
    // stopping the deploy of every other change.
    const categorySlug = resolveCategorySlug(cms.category);
    if (!categorySlug) {
      console.warn(
        `CMS post "${cms.slug}" skipped: category ${JSON.stringify(cms.category)} is not one of ` +
          listAcceptedCategories()
      );
      return [];
    }
    return [
      {
        id: cms.id,
        title: cms.title,
        seoTitle: cms.seoTitle,
        slug: cms.slug,
        category: getCategoryName(categorySlug),
        categorySlug,
        excerpt: cms.description,
        content: cms.markdown,
        date: formatDate(cms.date),
        isoDate: cms.date,
        readTime: cms.readTime || estimateReadTime(cms.markdown),
        author: cms.author || 'Fwdpod',
        image: cms.image,
        imageAlt: cms.imageAlt,
        keywords: cms.keywords?.length ? cms.keywords : undefined,
        faqs: extractFaqs(cms.markdown),
        source: 'cms',
        publishedAt: cms.publishAt,
        relatedSlugs: cms.related?.length ? cms.related : undefined,
        redirectFrom: cms.redirectFrom?.length ? cms.redirectFrom : undefined,
      },
    ];
  });

/**
 * Every published article from both sources, newest first by publish date.
 * This is what the listing, the article pages, related posts and the sitemap
 * read; visibility was already settled by the database when the CMS file was
 * written.
 */
export const PUBLISHED_POSTS: BlogPost[] = [...STATIC_BLOG_POSTS, ...CMS_BLOG_POSTS].sort(
  (a, b) =>
    (b.isoDate ?? '').localeCompare(a.isoDate ?? '') ||
    (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '') ||
    a.title.localeCompare(b.title)
);

/** A post image as an absolute URL, for Open Graph and schema. */
export function absoluteImageUrl(image: string): string {
  return /^https?:\/\//i.test(image) ? image : `https://www.fwdpod.com${image}`;
}

/**
 * Posts for the listing and the article pages: real articles once any exist,
 * otherwise the placeholder cards, so the layout can be reviewed before the
 * content lands. Adding one .md file or CMS post replaces every placeholder.
 */
export function getAllPosts(): BlogPost[] {
  return PUBLISHED_POSTS.length > 0 ? PUBLISHED_POSTS : PLACEHOLDER_POSTS;
}

/** The post shown in the featured slot: the flagged one, else the newest. */
export function getFeaturedPost(posts: BlogPost[] = getAllPosts()): BlogPost | undefined {
  return posts.find(p => p.featured) ?? posts[0];
}

/** Everything except the featured post, in listing order. */
export function getListingPosts(posts: BlogPost[] = getAllPosts()): BlogPost[] {
  const featured = getFeaturedPost(posts);
  return posts.filter(p => p.id !== featured?.id);
}

/** Posts in one category, newest first (getAllPosts is already sorted). */
export function getPostsByCategory(categorySlug: string, posts: BlogPost[] = getAllPosts()): BlogPost[] {
  return posts.filter(post => post.categorySlug === categorySlug);
}

export interface CategoryWithCount extends BlogCategoryDef {
  count: number;
  /** ISO date of the newest post, for <lastmod>. */
  lastmod?: string;
}

/** All five categories in taxonomy order, each with its post count. */
export function getCategoriesWithCounts(posts: BlogPost[] = getAllPosts()): CategoryWithCount[] {
  return BLOG_CATEGORIES.map(category => {
    const inCategory = posts.filter(post => post.categorySlug === category.slug);
    return {
      ...category,
      count: inCategory.length,
      lastmod: inCategory.map(post => post.isoDate).filter(Boolean).sort().pop() ?? undefined,
    };
  });
}

/**
 * Categories that actually have posts. The filter bar shows all five so the
 * section reads as a complete set, but only these reach the sitemap: an empty
 * category page is real and browsable, and noindex until it earns a post.
 */
export function getPopulatedCategories(posts: BlogPost[] = getAllPosts()): CategoryWithCount[] {
  return getCategoriesWithCounts(posts).filter(category => category.count > 0);
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return getAllPosts().find(p => p.slug === slug);
}

/** True while the listing is showing stand-in cards rather than real articles. */
export const USING_PLACEHOLDERS = PUBLISHED_POSTS.length === 0;

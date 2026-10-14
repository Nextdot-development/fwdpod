import { STATIC_BLOG_POSTS } from "../../data/blogCatalog";

/**
 * The markdown articles in content/blog/, as the admin needs them: for the
 * related-posts picker, the latest-in-category auto-fill, and the SEO
 * uniqueness checks. Read straight from the site's own catalog, so it can
 * never drift.
 */
export interface StaticBlogEntry {
  slug: string;
  title: string;
  seoTitle?: string;
  description: string;
  category: string;
  isoDate?: string;
}

export const STATIC_BLOG_INDEX: StaticBlogEntry[] = STATIC_BLOG_POSTS.map((p) => ({
  slug: p.slug,
  title: p.title,
  seoTitle: p.seoTitle,
  description: p.excerpt,
  category: p.category,
  isoDate: p.isoDate,
}));

import { BLOG_CATEGORIES } from "../../data/blogCategories";

/**
 * The insights categories. They come from src/data/blogCategories.ts, the
 * same list the public category pages, filter bar and sitemap are built from,
 * so a post can only be filed under a category that has a page.
 */
export function useCategories() {
  return { categories: BLOG_CATEGORIES, names: BLOG_CATEGORIES.map((c) => c.name), loading: false };
}

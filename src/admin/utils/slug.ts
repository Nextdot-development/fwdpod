import { SITE_ORIGIN } from "../../cms/cmsPost";

/** Turn a title (or any string) into a clean, URL-safe slug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

export const blogPublicPath = (slug: string) => `/insights/${slug}`;
export const blogPublicUrl = (slug: string) => `${SITE_ORIGIN}/insights/${slug}`;
export const blogCanonicalUrl = blogPublicUrl;

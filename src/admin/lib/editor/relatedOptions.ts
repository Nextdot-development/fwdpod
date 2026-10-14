import type { BlogDoc } from "@admin/types/blog";
import type { StaticBlogEntry as StaticIndexEntry } from "@admin/data/staticBlogsIndex";

export interface RelatedOption {
  slug: string;
  title: string;
  hint?: string; // "Markdown" or "CMS · <status>" — shown to distinguish results
}

/**
 * Build the "Related in this series" picker options. The admin picker is an
 * editorial tool, so it lists EVERY CMS blog — published, scheduled, draft AND
 * archived — plus all legacy (static/Markdown) articles, searchable by title or
 * slug. Deduped by slug (a CMS blog overrides a legacy article with the same
 * slug). The current blog is excluded. Public visibility is enforced separately
 * at render time, so a selected private CMS article stays saved but hidden
 * publicly until it becomes eligible.
 */
export function buildRelatedOptions(
  cmsBlogs: BlogDoc[],
  staticIndex: StaticIndexEntry[],
  currentId?: string
): RelatedOption[] {
  const cms = cmsBlogs
    .filter((b) => b.slug && b.id !== currentId)
    .map((b) => ({ slug: b.slug, title: b.title || b.slug, hint: `CMS · ${b.status}` }));
  const cmsSlugs = new Set(cms.map((o) => o.slug));
  const legacy = staticIndex
    .filter((s) => s.slug && !cmsSlugs.has(s.slug))
    .map((s) => ({ slug: s.slug, title: s.title || s.slug, hint: "Markdown" }));
  return [...cms, ...legacy];
}

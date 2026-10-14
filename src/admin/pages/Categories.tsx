import { useMemo } from "react";
import { ExternalLink } from "lucide-react";
import { AdminLayout } from "@admin/components/AdminLayout";
import { useCategories } from "@admin/hooks/useCategories";
import { useBlogs } from "@admin/hooks/useBlogs";
import { STATIC_BLOG_POSTS } from "../../data/blogCatalog";
import { categoryPath } from "../../data/blogCategories";
import { SITE_ORIGIN } from "../../cms/cmsPost";

/**
 * The category list with post counts. Categories are part of the site's
 * structure: each has its own page with written SEO copy, defined in
 * src/data/blogCategories.ts. A new category is added there (a code change),
 * so a post can never land in a category with no page behind it.
 */
export default function Categories() {
  const { categories } = useCategories();
  const { blogs } = useBlogs();

  const counts = useMemo(() => {
    const map = new Map<string, { cms: number; markdown: number }>();
    for (const c of categories) map.set(c.name, { cms: 0, markdown: 0 });
    for (const b of blogs) {
      const entry = map.get(b.category);
      if (entry && b.status !== "archived") entry.cms++;
    }
    for (const p of STATIC_BLOG_POSTS) {
      const entry = map.get(p.category);
      if (entry) entry.markdown++;
    }
    return map;
  }, [categories, blogs]);

  return (
    <AdminLayout title="Categories">
      <div className="max-w-2xl space-y-4">
        <p className="text-sm text-ink/60">
          These are the five insights categories. Each one has its own page on the site with its own title and
          description, so adding or renaming a category is a code change in <code className="rounded bg-surface px-1.5 py-0.5 text-xs">src/data/blogCategories.ts</code>.
        </p>
        <div className="rounded-2xl border border-line bg-surface">
          <ul className="divide-y divide-line">
            {categories.map((c) => {
              const n = counts.get(c.name) ?? { cms: 0, markdown: 0 };
              return (
                <li key={c.slug} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                  <div className="min-w-0">
                    <p className="font-medium text-ink">{c.name}</p>
                    <p className="text-xs text-ink/40">{c.description}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-ink/50">
                    <span>{n.cms} CMS · {n.markdown} markdown</span>
                    <a href={`${SITE_ORIGIN}${categoryPath(c.slug)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline">
                      View <ExternalLink size={12} />
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}

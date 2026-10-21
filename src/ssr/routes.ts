import { getCategoriesWithCounts, PUBLISHED_POSTS } from '../data/blogCatalog';
import { CATEGORY_PAGE_SIZE, categoryPath } from '../data/blogCategories';

/**
 * Every indexable path, prerendered to static HTML at build time.
 *
 * Keep in sync with <Routes> in App.tsx. The prerender step fails the build if
 * a path listed here renders the not-found page.
 */
const STATIC_PATHS = [
  '/',
  '/catalogue',
  '/configure',
  '/live-pods',
  '/insights',
  '/contact',
  '/services/ai-development',
  '/services/llm-development',
  '/services/rag-development',
  '/services/ai-agents',
  '/services/data-annotation',
  '/services/team-augmentation',
  '/services/ai-consulting',
];

/** Static pages whose content date is known, for the sitemap's <lastmod>. */
const STATIC_LASTMOD: Record<string, string> = {
  '/services/data-annotation': '2026-10-21',
  '/services/team-augmentation': '2026-10-21',
};

export interface PrerenderRoute {
  path: string;
  /** ISO 8601 date the content last changed, when known. */
  lastmod?: string;
  /**
   * False for pages that are rendered and reachable but deliberately kept out
   * of the index and the sitemap — an empty category page, for now.
   */
  indexable?: boolean;
}

export function getPrerenderRoutes(): PrerenderRoute[] {
  return [
    ...STATIC_PATHS.map(path => ({ path, lastmod: STATIC_LASTMOD[path] })),
    // Every published article, from content/blog/ and the CMS, gets its own
    // page and sitemap entry. Placeholder cards are not included: they have no
    // article behind them.
    ...PUBLISHED_POSTS.map(post => ({ path: `/insights/${post.slug}`, lastmod: post.isoDate })),
    // Every category gets a page and a sitemap entry, including one with no
    // posts yet: the taxonomy is the site's published structure, so all five
    // are crawlable and self-canonical from the start. lastmod is only set
    // once a category has a post to date it by.
    ...getCategoriesWithCounts(PUBLISHED_POSTS).flatMap(category =>
      Array.from(
        { length: Math.max(1, Math.ceil(category.count / CATEGORY_PAGE_SIZE)) },
        (_, index) => ({
          path: categoryPath(category.slug, index + 1),
          lastmod: category.lastmod,
        })
      )
    ),
  ];
}

export interface PostRedirect {
  from: string;
  to: string;
}

/**
 * Old article URLs of CMS posts whose slug was changed after going live. The
 * prerender step writes these into .htaccess as 301s. A slug that is itself a
 * live article is never redirected away.
 */
export function getPostRedirects(): PostRedirect[] {
  const live = new Set(PUBLISHED_POSTS.map(post => post.slug));
  return PUBLISHED_POSTS.flatMap(post =>
    (post.redirectFrom ?? [])
      .filter(old => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(old) && !live.has(old))
      .map(old => ({ from: `/insights/${old}`, to: `/insights/${post.slug}` }))
  );
}

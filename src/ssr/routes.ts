import { getCategoriesWithCounts, PUBLISHED_POSTS } from '../data/blogCatalog';
import { CATEGORY_PAGE_SIZE, categoryPath } from '../data/blogCategories';
import { PLACEHOLDER_PAGES } from '../data/navigation';
import { SITE_REDIRECTS, type SiteRedirect } from '../data/redirects';
import { SOLUTION_PAGE_CONTENT, SOLUTION_PAGES_INDEXABLE } from '../content/solution-pages';
import { SOLUTION_BRIEFS } from '../content/solution-briefs';

/**
 * Every indexable path, prerendered to static HTML at build time.
 *
 * Keep in sync with <Routes> in App.tsx. The prerender step fails the build if
 * a path listed here renders the not-found page.
 */
const STATIC_PATHS = [
  '/',
  '/our-solutions',
  '/configure',
  '/case-studies',
  '/how-we-work',
  '/insights',
  '/contact',
  '/security',
  '/how-to-engage',
  '/about',
];

/** Static pages whose content date is known, for the sitemap's <lastmod>. */
const STATIC_LASTMOD: Record<string, string> = {
  // Redesign steps 1-4, live on 2026-10-26
  '/': '2026-10-26',
  // Renamed from /catalogue (Our Solutions) and rewritten on 2026-10-30
  '/our-solutions': '2026-10-30',
  '/case-studies': '2026-10-26',
  '/how-we-work': '2026-10-26',
  '/insights': '2026-10-26',
  // Rebuilt from the developer handoff dated 2026-11-19
  '/how-to-engage': '2026-11-20',
  // Rebuilt from the developer handoff dated 2026-11-23
  '/security': '2026-11-23',
  // Rebuilt from the developer handoff dated 2026-11-23
  '/about': '2026-11-24',
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
    // Menu targets whose content isn't written yet: rendered so a direct visit
    // gets a page, but noindex and left out of the sitemap until they're real.
    ...PLACEHOLDER_PAGES.map(page => ({ path: page.href, indexable: false })),
    // Solution pages rebuilt from their own briefs: indexed, dated
    ...SOLUTION_BRIEFS.map(page => ({ path: page.path, lastmod: page.lastmod })),
    // The remaining solution pages: noindex until SOLUTION_PAGES_INDEXABLE is set
    ...SOLUTION_PAGE_CONTENT.map(page => ({ path: page.href, indexable: SOLUTION_PAGES_INDEXABLE })),
    // Every published article, from content/blog/ and the CMS, gets its own
    // page and sitemap entry. Placeholder cards are not included: they have no
    // article behind them.
    ...PUBLISHED_POSTS.map(post => ({ path: `/insights/${post.slug}`, lastmod: post.modifiedIsoDate ?? post.isoDate })),
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

/** Site-level 301s (src/data/redirects.ts), written into .htaccess at build time. */
export function getSiteRedirects(): SiteRedirect[] {
  return SITE_REDIRECTS;
}

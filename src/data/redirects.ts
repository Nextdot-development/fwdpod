/**
 * Site-level 301 redirects, written once here. scripts/prerender.mjs writes
 * them into dist/.htaccess (production, Apache), App.tsx catches in-app
 * navigation to them, and tests/build.test.ts checks vercel.json matches.
 *
 * A redirected path must not also be a page or a sitemap entry.
 */
export interface SiteRedirect {
  from: string;
  to: string;
}

export const SITE_REDIRECTS: SiteRedirect[] = [
  // The /services/* pages duplicated the solution pages; each goes to the closest one.
  { from: '/services/ai-agents', to: '/solutions/ai-agents' },
  { from: '/services/ai-development', to: '/solutions/ai-agents' },
  { from: '/services/rag-development', to: '/solutions/rag' },
  { from: '/services/llm-development', to: '/solutions/models' },
  { from: '/services/data-annotation', to: '/solutions/data-annotation' },
  { from: '/services/team-augmentation', to: '/how-to-engage' },
  { from: '/services/ai-consulting', to: '/how-to-engage' },
  // Blog content map targets the site does not have: sent to the closest page.
  { from: '/pods/agentic-ai', to: '/solutions/ai-agents' },
  { from: '/services/ai-project-rescue', to: '/our-solutions' },
  // /solutions is not a page; /our-solutions is the hub.
  { from: '/solutions', to: '/our-solutions' },
];

/**
 * Content map paths dropped on purpose: no page, no redirect, and no internal
 * link may point at them. They must return the site's 404.
 */
export const DROPPED_PATHS = ['/compliance/hipaa', '/compliance/eu-ai-act', '/industries/healthcare', '/pricing'];

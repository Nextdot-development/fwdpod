/**
 * Solution pages built from the nine-block template in the structure doc
 * (Nov 11, 2026). One entry per page; SolutionPageView renders them all the
 * same way. All seven pages have now moved to their own briefs, so this list is
 * empty. Kept for reference: see src/content/solution-briefs.ts.
 *
 * Copy sources: the doc's layer copy (promise, bullets, "You need this if",
 * "Measured by", "Who does it"), and the pod copy in src/content/pods.ts
 * (challenge, typical work, size, timeline). No figures are added here.
 */
import { LLMOPS_POD_SIZE } from './business-facts';

/**
 * Indexed and in the sitemap since the /services/* pages 301 here
 * (src/data/redirects.ts). Unconfirmed items stay hidden on the pages.
 */
export const SOLUTION_PAGES_INDEXABLE = true;

export interface TeamRole {
  role: string;
  /** Per-role count, only where the site already states it. */
  count?: number;
}

export interface SolutionTeam {
  name: string;
  /** Pod headcount from the homepage pod list. Omitted where it is [CONFIRM]. */
  size?: string;
  roles?: TeamRole[];
  /** Links to another solution page when that pod has its own (Voice AI). */
  href?: string;
}

export interface SolutionPageContent {
  href: string;
  /** Display name: menu, footer, eyebrow. */
  name: string;
  /** Voice AI sits under Agents and applications. */
  parent?: { label: string; href: string };
  subPages?: { label: string; href: string }[];
  /** 1. Headline and one-line promise */
  headline: string;
  /** 2. The problem in their words */
  problem: string;
  /** 3. What we engineer: four to six bullets */
  engineer: string[];
  /** 4. The team */
  teams: SolutionTeam[];
  /** Shown under the team when no per-role counts exist. */
  teamNote?: string;
  /** 5. Timeline: total from the homepage pod list; phase split is [CONFIRM] */
  timelineTotal: string;
  phases: [string, string, string];
  /** 6. Measured by: from the doc */
  measuredBy: string[];
  /** 7. Tools we work with. [CONFIRM: logos] Hidden while empty. */
  logos: { name: string; src: string }[];
  /** 8. One case study, by id in src/content/case-studies.ts */
  caseStudyId?: string;
  seoDescription: string;
}

// [CONFIRM] Phase names and the split of weeks across them. Only the totals
// come from the homepage pod list.
const BUILD_PHASES: [string, string, string] = ['Scope and design', 'Build and integrate', 'Test and launch'];

export const SOLUTION_PAGE_CONTENT: SolutionPageContent[] = [
];

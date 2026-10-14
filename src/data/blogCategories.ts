/**
 * The insights taxonomy. One definition per category, used by the filter bar,
 * the category pages, their metadata and schema, the sitemap and the post
 * frontmatter validator — so a name, description or title is written once.
 *
 * Adding a category: add an entry here and a slug to BlogCategorySlug. Posts
 * then accept it in frontmatter, and its page, filter chip and sitemap entry
 * appear as soon as one post carries it.
 */

export type BlogCategorySlug =
  | 'forward-deployed-engineering'
  | 'ai-teams'
  | 'agentic-ai'
  | 'security-compliance'
  | 'ai-strategy';

export interface BlogCategoryDef {
  /** Display name, used in the chip, the H1 and articleSection. */
  name: string;
  slug: BlogCategorySlug;
  /** Intro paragraph on the category page. */
  description: string;
  /** <title> for the category page. */
  seoTitle: string;
  /** Meta description for the category page. */
  metaDescription: string;
}

export const BLOG_CATEGORIES: BlogCategoryDef[] = [
  {
    name: 'Forward Deployed Engineering',
    slug: 'forward-deployed-engineering',
    description:
      'What forward deployed engineers do, when to hire one, and how to choose an FDE partner.',
    seoTitle: 'Forward Deployed Engineering | Fwdpod Insights',
    metaDescription:
      'Guides on forward deployed engineering: what an FDE does day to day, when to hire one, in-house versus partner delivery, and how to choose an FDE partner.',
  },
  {
    name: 'AI Pods & Engineering Teams',
    slug: 'ai-teams',
    description:
      'How AI pods work, the roles inside them, hiring AI engineers, and engagement models.',
    seoTitle: 'AI Pods & Engineering Teams | Fwdpod Insights',
    metaDescription:
      'How AI engineering pods are structured: the roles inside a pod, hiring AI engineers, team augmentation, and the engagement models behind AI delivery teams.',
  },
  {
    name: 'Agentic AI & LLM Engineering',
    slug: 'agentic-ai',
    description:
      'Building AI agents and LLM systems in production: agentic AI, MCP, LangGraph, RAG and fine-tuning.',
    seoTitle: 'Agentic AI & LLM Engineering | Fwdpod Insights',
    metaDescription:
      'Engineering notes on building AI agents and LLM systems in production: agentic architectures, MCP, LangGraph, RAG pipelines, evaluation and fine-tuning.',
  },
  {
    name: 'Security, Compliance & Offshore Delivery',
    slug: 'security-compliance',
    description:
      'IP ownership, data security, compliance and running offshore AI delivery safely.',
    seoTitle: 'Security, Compliance & Offshore Delivery | Fwdpod Insights',
    metaDescription:
      'IP ownership, data security and compliance for AI projects, and how to run offshore AI delivery safely across time zones and jurisdictions.',
  },
  {
    name: 'AI Strategy: Pilot to Production',
    slug: 'ai-strategy',
    description:
      'Why AI pilots stall, how to get from POC to production, build vs buy, and choosing an AI partner.',
    seoTitle: 'AI Strategy: Pilot to Production | Fwdpod Insights',
    metaDescription:
      'Why AI pilots stall before production, how to move a proof of concept into live operations, build versus buy, and how to choose an AI delivery partner.',
  },
];

const CATEGORY_BY_SLUG = new Map<string, BlogCategoryDef>(
  BLOG_CATEGORIES.map(category => [category.slug, category])
);

/** Frontmatter may carry the display name or the slug; both resolve here. */
const SLUG_BY_LOOKUP = new Map<string, BlogCategorySlug>(
  BLOG_CATEGORIES.flatMap(category => [
    [category.slug, category.slug] as const,
    [normalizeLookup(category.name), category.slug] as const,
  ])
);

function normalizeLookup(value: string): string {
  return value.trim().toLowerCase().replace(/\s*&\s*/g, ' and ').replace(/\s+/g, ' ');
}

/** The slug for a frontmatter value, or null when it is not a known category. */
export function resolveCategorySlug(raw: string): BlogCategorySlug | null {
  const value = raw.trim();
  if (!value) return null;
  return SLUG_BY_LOOKUP.get(value) ?? SLUG_BY_LOOKUP.get(normalizeLookup(value)) ?? null;
}

export function getCategory(slug: string): BlogCategoryDef | undefined {
  return CATEGORY_BY_SLUG.get(slug);
}

export function getCategoryName(slug: string): string {
  return CATEGORY_BY_SLUG.get(slug)?.name ?? slug;
}

/** Every accepted frontmatter value, for the error message on a bad one. */
export function listAcceptedCategories(): string {
  return BLOG_CATEGORIES.map(c => `"${c.name}" (${c.slug})`).join(', ');
}

/** Posts per category page before pagination kicks in. */
export const CATEGORY_PAGE_SIZE = 12;

/** Page 1 lives at the bare path; later pages get /page/<n>. */
export function categoryPath(slug: string, page = 1): string {
  return page > 1 ? `/insights/category/${slug}/page/${page}` : `/insights/category/${slug}`;
}

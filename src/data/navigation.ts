/**
 * Links shared by the header's Solutions panel and the footer. Add or rename a
 * page here once and both update.
 */
export interface NavItem {
  label: string;
  href: string;
}

export interface SolutionPage extends NavItem {
  /** Pages nested under another in the Solutions panel (Voice AI under Agents). */
  children?: NavItem[];
  /** Trust and compliance and Operations apply to every layer. */
  crossCutting?: boolean;
}

/**
 * The seven solution pages: 4 layers + 2 cross-cutting bands, with Voice AI
 * nested under Agents and applications. Display names and URLs follow the
 * approved structure doc (Nov 11, 2026).
 */
export const SOLUTION_PAGES: SolutionPage[] = [
  {
    label: 'Agents and applications',
    href: '/solutions/ai-agents',
    children: [{ label: 'Voice AI', href: '/solutions/voice-ai' }],
  },
  { label: 'Context and knowledge', href: '/solutions/rag' },
  { label: 'Models', href: '/solutions/models' },
  { label: 'Data', href: '/solutions/data-annotation' },
  { label: 'Trust and compliance', href: '/solutions/ai-compliance', crossCutting: true },
  { label: 'Operations (LLMOps)', href: '/solutions/llmops', crossCutting: true },
];

/** The same seven pages as a flat list, in panel order (footer, routes). */
export const SOLUTION_PAGES_FLAT: NavItem[] = SOLUTION_PAGES.flatMap(page => [
  { label: page.label, href: page.href },
  ...(page.children ?? []),
]);

/**
 * "By starting point": the four situations from the structure doc's
 * "Start where you are" table.
 * TODO(copy): no page shows these four situations yet. The targets are the
 * closest existing or placeholder page; repoint them once the section exists.
 */
export const STARTING_POINTS: NavItem[] = [
  { label: 'Team is strong but short on one skill', href: '/how-to-engage' },
  { label: 'Approved use case, no team to build it', href: '/our-solutions' },
  { label: 'Pilots work in demos but never reach production', href: '/how-to-engage' },
  { label: 'AI is live and needs running', href: '/solutions/llmops' },
];

/**
 * Pages linked from the menu that are placeholders until their content is
 * written. Each renders a short noindex page, so a link never lands on a 404.
 */
export const PLACEHOLDER_PAGES: NavItem[] = [
  // Empty: How to engage, Security and About are real pages now. Add a menu
  // target here to give it a noindex placeholder until its content exists.
];

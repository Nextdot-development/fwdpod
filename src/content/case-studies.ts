/**
 * The case studies shown on the homepage and the case studies page (/case-studies).
 *
 * Sector, pod, what was built, weeks to live and team size are the figures
 * approved for the homepage. `problem` was written for the case studies page
 * from what was built, and needs confirming against the real projects.
 */

export interface CaseStudy {
  id: string;
  sector: string;
  pod: string;
  /** PENDING CONFIRMATION: restated from what was built, not from a client brief. */
  problem: string;
  built: string;
  weeks: string;
  team: string;
  /**
   * [CLIENT PERMISSION NEEDED] Set true once the client has approved this case
   * being shown. Solution pages show a placeholder card until then.
   */
  permissionCleared: boolean;
  /** [CLIENT PERMISSION NEEDED] Client quote; the card hides it while absent. */
  quote?: { text: string; attribution: string };
}

// [CLIENT PERMISSION NEEDED] on all three cards: confirm each client has
// approved being described here before naming or adding a logo.
export const CASE_STUDIES: CaseStudy[] = [
  {
    // [CLIENT PERMISSION NEEDED]
    // [CONFIRM: outside the pod's listed range] 6 weeks vs the Compliance AI
    // Pod's 12–16 weeks in src/content/pods.ts
    id: 'financial-brokerage',
    sector: 'Financial brokerage',
    pod: 'Compliance AI Pod',
    problem: 'Sensitive client and trading data had to stay out of the AI tools the firm wanted to use.',
    built: 'Built privacy filters that keep sensitive client and trading data out of AI tools.',
    weeks: '6 weeks to live',
    team: '6 engineers',
    permissionCleared: false,
  },
  {
    // [CLIENT PERMISSION NEEDED]
    id: 'logistics-network',
    sector: 'Logistics network',
    pod: 'Agent Development Pod',
    problem: 'Invoice checks and delivery dispatch needed to run automatically and recover from errors on their own.',
    built: 'AI agents that check invoices and manage delivery dispatch, with automatic error recovery.',
    weeks: '11 weeks to live',
    team: '5 engineers',
    permissionCleared: false,
  },
  {
    // [CLIENT PERMISSION NEEDED]
    // [CONFIRM: outside the pod's listed range] 3 weeks vs the Voice AI Pod's
    // 8–12 weeks in src/content/pods.ts
    id: 'healthcare-services',
    sector: 'Healthcare services',
    pod: 'Voice AI Pod',
    problem: 'Patient appointment booking needed to handle many calls at the same time, in real time.',
    built: 'A voice agent that books patient appointments in real time across many calls at once.',
    weeks: '3 weeks to live',
    team: '5 engineers',
    permissionCleared: false,
  },
];

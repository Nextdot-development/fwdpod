/**
 * The case studies shown on the homepage and the case studies page (/live-pods).
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
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'financial-brokerage',
    sector: 'Financial brokerage',
    pod: 'Compliance AI Pod',
    problem: 'Sensitive client and trading data had to stay out of the AI tools the firm wanted to use.',
    built: 'Built privacy filters that keep sensitive client and trading data out of AI tools.',
    weeks: '6 weeks to live',
    team: '6 engineers',
  },
  {
    id: 'logistics-network',
    sector: 'Logistics network',
    pod: 'Agent Development Pod',
    problem: 'Invoice checks and delivery dispatch needed to run automatically and recover from errors on their own.',
    built: 'AI agents that check invoices and manage delivery dispatch, with automatic error recovery.',
    weeks: '11 weeks to live',
    team: '5 engineers',
  },
  {
    id: 'healthcare-services',
    sector: 'Healthcare services',
    pod: 'Voice AI Pod',
    problem: 'Patient appointment booking needed to handle many calls at the same time, in real time.',
    built: 'A voice agent that books patient appointments in real time across many calls at once.',
    weeks: '3 weeks to live',
    team: '5 engineers',
  },
];

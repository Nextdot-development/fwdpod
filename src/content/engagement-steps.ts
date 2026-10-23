/** Scope → Shortlist → Interview → Start, shown on the homepage and /how-we-work. */
import { SHORTLIST_TIME, PILOT_LENGTH } from './business-facts';

export const ENGAGEMENT_STEPS = [
  { name: 'Scope', text: 'A 30-minute call on the roles or the outcome you need.' },
  { name: 'Shortlist', text: `Profiles of vetted engineers, or a pod plan, within ${SHORTLIST_TIME}.` },
  { name: 'Interview', text: 'You interview and choose. No commitment until you do.' },
  { name: 'Start', text: `Onboard to your tools. Optional ${PILOT_LENGTH} paid pilot to prove fit.` },
];

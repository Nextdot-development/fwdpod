/**
 * "Start where you are": the four situations from the structure doc, shown on
 * the homepage and the Our Solutions page.
 */
import { TIME_TO_START } from './business-facts';

export const STARTING_POINTS = [
  { situation: 'Team is strong but short on one skill', start: `Individual specialist, in your stand-ups within ${TIME_TO_START}` },
  { situation: 'Approved use case, no team to build it', start: 'AI pod with one accountable lead' },
  { situation: 'Pilots work in demos but never reach production', start: 'Forward deployed engineers to harden, integrate and ship' },
  { situation: 'AI is live and needs running', start: 'LLMOps Pod on a monthly retainer' },
];

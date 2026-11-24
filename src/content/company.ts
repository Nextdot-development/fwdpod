/**
 * Company facts shared by the homepage, /security, /how-to-engage and /about.
 * Written once here so the pages cannot drift apart.
 *
 * Items marked PENDING stay hidden on the site while they are null or empty.
 * Nothing here may state a certification, client, price or partner claim that
 * is not confirmed.
 */
import { PILOT_LENGTH, REPLACEMENT_WINDOW } from './business-facts';

// ── Backing and partners ─────────────────────────────────────────────────────

export const NEXTDOT_LINE = 'Backed by Nextdot since 2018';

export const CAPABILITY_CENTER_NAME = 'Jamshedpur AI Capability Center';

export const PARTNER_PROGRAMS: { name: string; program?: string }[] = [
  // [CONFIRM: current status and exact program name]
  { name: 'Anthropic', program: 'Claude Partner Network' },
  // [CONFIRM: current status and exact program name]
  { name: 'ElevenLabs' },
  // [CONFIRM: current status and exact program name]
  { name: 'Sarvam AI' },
];

// ── Security ─────────────────────────────────────────────────────────────────

/**
 * The six tiles, shown on the homepage and on /security with identical
 * wording. From the Security page handoff dated 23 Nov 2026. Icons are set in
 * src/components/marketing/SecurityTiles.tsx, keyed by id.
 */
export const SECURITY_TILES = [
  // [CONFIRM title] on all six tiles
  {
    id: 'own-code',
    title: 'You own the code',
    text: 'Everything we build for you is yours. Every engineer signs a full IP assignment, a paper that gives you ownership.',
  },
  { id: 'nda', title: 'Everyone signs an NDA', text: 'Every engineer signs an NDA, a promise to keep your information private.' },
  { id: 'data', title: 'Your data stays with you', text: 'Your data stays where you keep it.' },
  { id: 'setup', title: 'We work in your setup', text: 'Our engineers work inside your environment and follow your access rules.' },
  {
    id: 'replacement',
    title: 'Free replacement',
    text: `If someone is not the right fit, we replace them free within ${REPLACEMENT_WINDOW}.`,
  },
  {
    id: 'safe-ai',
    title: 'Safe AI, built in',
    text: 'Our Compliance AI Pod adds safety checks and records to the AI we build for you.',
  },
];

/**
 * Not shown anywhere for now: the Security page handoff (23 Nov 2026) rules
 * out certifications and badges on /security.
 *
 * PENDING: [ISO 27001 / SOC 2 status: CONFIRM. Do not write SOC 2 or ISO as
 * held unless confirmed.] The certification block on /security stays hidden
 * while this is null. Write only what is true today, e.g. "SOC 2 Type II
 * report available under NDA" once it is.
 */
export const CERTIFICATION_STATUS: string | null = null;

/**
 * PENDING: [named regulations: CONFIRM]. Trust wording on these pages reads
 * "designed against <regulations>" and stays hidden while this is empty.
 */
export const NAMED_REGULATIONS: string[] = [];

// ── About ────────────────────────────────────────────────────────────────────

/**
 * PENDING: [CLIENT/PERSON PERMISSION NEEDED] for each name, photo and LinkedIn
 * link. The leadership section on /about stays hidden while this is empty.
 */
export const LEADERSHIP: { name: string; role: string; photo: string; linkedin: string }[] = [];

/** PENDING: [CONFIRM: photos] Real photos of the center and the team. Hidden while empty. */
export const CAPABILITY_CENTER_PHOTOS: { src: string; alt: string }[] = [];

// ── How to engage ────────────────────────────────────────────────────────────

/** How it grows: shown on the homepage and /how-to-engage. */
export const GROWTH_STEPS = [
  { name: 'Prove', text: `${PILOT_LENGTH} paid pilot` },
  { name: 'Build', text: 'Dedicated team' },
  { name: 'Run', text: 'Managed AI ops' },
];

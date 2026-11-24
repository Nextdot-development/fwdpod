/**
 * Footer items that still need sign-off. Each one stays hidden while its value
 * is null, so no placeholder text reaches the live site. Fill a value in here
 * and the footer shows it.
 */

// PENDING CONFIRMATION: [CONFIRM: file]. Path or URL of the one-page
// capability PDF, e.g. '/fwdpod-capability.pdf' placed in public/.
export const CAPABILITY_PDF_HREF: string | null = null;

// PENDING CONFIRMATION: registered company details (legal name, registration
// number, registered address). One line per entry.
export const REGISTERED_COMPANY_LINES: string[] | null = null;

// Founder note in the footer. Set to null to hide it.
export const FOUNDER_QUOTE: { text: string; attribution: string } | null = {
  text: "We build AI engineering teams that already work together and fit your product's needs, so you can skip the long hiring process and start building sooner.",
  attribution: 'Founder',
};

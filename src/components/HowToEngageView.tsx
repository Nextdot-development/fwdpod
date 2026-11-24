/**
 * /how-to-engage — built from the developer handoff dated 19 Nov 2026.
 *
 * The copy is the handoff's, word for word. Do not add prices, rates,
 * certifications, notice periods, minimum terms, payment terms, client logos,
 * "24/7" or "2-hour" claims. The closing "Tell us the role or the outcome."
 * band is the site-wide BookCallBand rendered by App.tsx, unchanged.
 */
import { ArrowDown, ArrowRight, ChevronDown, FileCheck, RefreshCw, ShieldCheck } from 'lucide-react';
import SEO, { SITE_BASE_URL } from './SEO';
import { BookingLink, card, h2Class, primaryButton, sectionClass } from './marketing/ui';
import { STARTING_POINTS } from '../content/starting-points';
import { PILOT_LENGTH, REPLACEMENT_WINDOW, SHORTLIST_TIME, TIME_TO_START } from '../content/business-facts';

const PAGE_PATH = '/how-to-engage';
const PAGE_URL = `${SITE_BASE_URL}${PAGE_PATH}`;
const PAGE_TITLE = 'How to engage | Fwdpod';
// [CONFIRM: approve this meta description]
const PAGE_DESCRIPTION =
  'Start with one specialist or a full AI pod. A 2-week paid pilot, profiles within 48 hours, and free replacement within 14 days.';

// The handoff writes this range with a plain hyphen; kept as written.
const US_OVERLAP = '3-4 hours';

// ── Step 2: Two ways to work with us ─────────────────────────────────────────
const COMPARISON_ROWS = [
  {
    label: 'What you get',
    specialist: 'One engineer who joins your Slack or Teams, repos and stand-ups',
    pod: 'A team with one accountable lead',
  },
  { label: 'Who leads the work', specialist: 'Your lead', pod: 'Our pod lead, a forward deployed engineer' },
  { label: "How it's measured", specialist: "By your team's goals", pod: 'By measures we agree up front' },
  {
    label: 'Best when',
    specialist: 'Your team is strong but short on one skill',
    pod: 'You have an approved use case and no team to build it',
  },
];

const COMPARISON_COLUMNS = [
  { key: 'specialist', name: 'Specialist' },
  { key: 'pod', name: 'Pod' },
] as const;

const POD_SIZES_NOTE = 'Pod sizes: Agent Development (5), Voice AI (5), RAG and Knowledge (4), Compliance AI (6), LLMOps (3-4).';

// ── Step 4: How it grows ─────────────────────────────────────────────────────
const GROWTH = [
  { name: 'Prove', text: 'a paid pilot on one use case.' },
  { name: 'Build', text: 'a dedicated team takes it to production.' },
  { name: 'Run', text: 'managed AI operations keep it up, accurate and on budget.' },
];

// ── Step 7: Protection ───────────────────────────────────────────────────────
const PROTECTIONS = [
  { icon: FileCheck, text: 'You own the code and IP. Every engineer signs an NDA and a full IP assignment.' },
  {
    icon: RefreshCw,
    text: `If someone isn't the right fit, we replace them free within ${REPLACEMENT_WINDOW}, with a documented handover.`,
  },
  {
    icon: ShieldCheck,
    text: 'Engineers work inside your environment under your access policies. Data stays where you keep it.',
  },
];

// ── Step 8: Your first weeks ─────────────────────────────────────────────────
const FIRST_WEEKS = [
  { lead: 'Scoping call', text: '30 minutes, we map your stack.' },
  { lead: `Within ${SHORTLIST_TIME}`, text: 'you get profiles or a pod plan.' },
  {
    lead: `Within ${TIME_TO_START}`,
    text: `engineers usually start, in your tools, with ${US_OVERLAP} of daily overlap with US time zones.`,
  },
];

// ── Step 9: FAQs. One list feeds both the accordion and the FAQPage schema,
// so the visible text and the structured data cannot differ.
export const HOW_TO_ENGAGE_FAQS = [
  {
    q: 'How fast can someone start?',
    a: `Profiles within ${SHORTLIST_TIME} of a scoping call. Engineers usually start within ${TIME_TO_START}.`,
  },
  { q: 'Can we start small?', a: `Yes. A ${PILOT_LENGTH} paid pilot on one use case, with a fixed fee.` },
  {
    q: 'Do you only staff, or do you own delivery?',
    a: 'Both. Specialists work under your lead. Pods have their own accountable lead and report on agreed measures.',
  },
  {
    q: "What if someone isn't the right fit?",
    a: `We replace them free within ${REPLACEMENT_WINDOW}, with a documented handover.`,
  },
  { q: 'Who owns the code and IP?', a: 'You do.' },
];

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${PAGE_URL}#webpage`,
      'url': PAGE_URL,
      'name': PAGE_TITLE,
      'description': PAGE_DESCRIPTION,
      'isPartOf': { '@id': `${SITE_BASE_URL}/#website` },
    },
    {
      '@type': 'FAQPage',
      '@id': `${PAGE_URL}#faq`,
      'url': PAGE_URL,
      'mainEntity': HOW_TO_ENGAGE_FAQS.map(faq => ({
        '@type': 'Question',
        'name': faq.q,
        'acceptedAnswer': { '@type': 'Answer', 'text': faq.a },
      })),
    },
  ],
};

const bodyText = 'text-base text-[#555555] leading-relaxed';

export default function HowToEngageView() {
  return (
    <div className="bg-white animate-page-enter">
      <SEO title={PAGE_TITLE} description={PAGE_DESCRIPTION} canonical={PAGE_PATH} jsonLd={JSON_LD} />

      {/* Step 1: Hero */}
      <section className="pt-2 pb-8 space-y-6 max-w-3xl" aria-labelledby="engage-heading">
        <h1 id="engage-heading" className="text-4xl md:text-5xl font-display font-medium tracking-tight text-[#0A0A0A] leading-[1.08] text-balance">
          Start with one specialist or a full AI pod. Prove it before you commit.
        </h1>
        <p className="text-lg text-[#555555] leading-relaxed">
          Senior AI engineers from India, typically on your team in {TIME_TO_START}. Hourly or full-time.
        </p>
        <BookingLink label="Book a 30-minute call" source="how to engage hero" className={primaryButton} />
      </section>

      {/* Step 2: Two ways to work with us */}
      <section id="two-ways" aria-labelledby="two-ways-heading" className={sectionClass}>
        <h2 id="two-ways-heading" className={h2Class}>Two ways to work with us</h2>

        {/* Desktop and tablet: a three-column table */}
        <div className="hidden md:block border border-zinc-200/85 rounded-2xl overflow-hidden">
          <table className="w-full table-fixed text-sm text-left">
            <thead className="bg-zinc-50">
              <tr>
                <td className="w-1/5 px-5 py-3" />
                {COMPARISON_COLUMNS.map(col => (
                  <th key={col.key} scope="col" className="px-5 py-3 text-base font-display font-medium text-[#0A0A0A]">
                    {col.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map(row => (
                <tr key={row.label} className="border-t border-zinc-200/85 align-top">
                  <th scope="row" className="px-5 py-4 font-semibold text-[#0A0A0A]">{row.label}</th>
                  <td className="px-5 py-4 text-[#555555] leading-relaxed">{row.specialist}</td>
                  <td className="px-5 py-4 text-[#555555] leading-relaxed">{row.pod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: one card per column, no sideways scrolling */}
        <div className="md:hidden grid grid-cols-1 gap-4">
          {COMPARISON_COLUMNS.map(col => (
            <div key={col.key} className="border border-zinc-200/85 rounded-2xl p-5 space-y-4">
              <h3 className="text-xl font-display font-medium text-[#0A0A0A] tracking-tight">{col.name}</h3>
              <dl className="space-y-3">
                {COMPARISON_ROWS.map(row => (
                  <div key={row.label}>
                    <dt className="text-xs font-semibold text-[#0A0A0A]">{row.label}</dt>
                    <dd className="text-sm text-[#555555] leading-relaxed">{row[col.key]}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>

        <p className="-mt-4 md:-mt-6 text-xs text-[#555555] leading-relaxed">{POD_SIZES_NOTE}</p>
      </section>

      {/* Step 3: Start where you are */}
      <section id="start-where-you-are" aria-labelledby="start-heading" className={sectionClass}>
        <h2 id="start-heading" className={h2Class}>Start where you are</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STARTING_POINTS.map(row => (
            <li key={row.situation} className={`${card} !p-5 md:!p-6 space-y-2`}>
              <p className="text-sm text-[#555555] leading-relaxed">{row.situation}</p>
              <p className="flex gap-2 text-base font-medium text-[#0A0A0A] leading-snug">
                <ArrowRight className="w-4 h-4 mt-1 text-[#0066FF] shrink-0" aria-label="leads to" />
                <span>{row.start}</span>
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Steps 4 and 5: How it grows, with the paid pilot beside it */}
      {/* Step 4: How it grows, full width so the three steps have room */}
      <section id="how-it-grows" aria-labelledby="grows-heading" className={sectionClass}>
        <h2 id="grows-heading" className={h2Class}>How it grows: Prove, Build, Run</h2>
        {/* Cards stretch to equal height; the arrows sit in the gaps between them */}
        <ol className="flex flex-col md:flex-row gap-2 md:gap-4 lg:gap-6">
          {GROWTH.map((step, idx) => (
            <li key={step.name} className="flex-1 flex flex-col md:flex-row gap-2 md:gap-4 lg:gap-6">
              <div className="flex-1 border border-zinc-200/85 rounded-2xl px-5 py-5 md:px-6 space-y-3">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#0066FF] text-white text-xs font-semibold" aria-hidden="true">
                  {idx + 1}
                </span>
                <p className="text-sm text-[#555555] leading-relaxed">
                  <strong className="font-semibold text-[#0A0A0A]">{step.name}:</strong> {step.text}
                </p>
              </div>
              {idx < GROWTH.length - 1 && (
                <span className="flex items-center justify-center text-[#555555]" aria-hidden="true">
                  <ArrowDown className="w-4 h-4 md:hidden" />
                  <ArrowRight className="w-4 h-4 hidden md:block" />
                </span>
              )}
            </li>
          ))}
        </ol>
      </section>

      {/* Steps 6 and 5 side by side on desktop: How you pay left, the paid pilot
          right. Stacked on tablet and mobile. No prices, rates or ranges here. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 py-12 md:py-16 gap-y-12 md:gap-y-16">
        <section id="how-you-pay" aria-labelledby="pay-heading" className="flex flex-col gap-4 scroll-mt-16">
          <h2 id="pay-heading" className={h2Class}>How you pay</h2>
          <p className={bodyText}>Specialists are available hourly or full-time. The pilot has a fixed fee.</p>
        </section>
        <section id="pilot" aria-labelledby="pilot-heading" className="flex flex-col gap-4 scroll-mt-16">
          <h2 id="pilot-heading" className={h2Class}>Start small with a paid pilot</h2>
          <p className={bodyText}>A {PILOT_LENGTH} paid pilot on one use case, at a fixed fee.</p>
        </section>
      </div>

      {/* Step 7: Your code, your data, your protection */}
      <section id="protection" aria-labelledby="protection-heading" className={sectionClass}>
        <h2 id="protection-heading" className={h2Class}>Your code, your data, your protection</h2>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PROTECTIONS.map(({ icon: Icon, text }) => (
            <li key={text} className="border border-zinc-200/85 rounded-2xl p-5 space-y-3">
              <Icon className="w-5 h-5 text-[#0066FF]" aria-hidden="true" />
              <p className="text-sm text-[#555555] leading-relaxed">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Step 8: Your first weeks */}
      <section id="first-weeks" aria-labelledby="first-weeks-heading" className={sectionClass}>
        <h2 id="first-weeks-heading" className={h2Class}>Your first weeks</h2>
        <ol className="space-y-4 max-w-3xl">
          {FIRST_WEEKS.map((step, idx) => (
            <li key={step.lead} className="flex gap-4">
              <span className="inline-flex items-center justify-center w-7 h-7 shrink-0 rounded-full border border-[#0066FF] text-[#0066FF] text-xs font-semibold" aria-hidden="true">
                {idx + 1}
              </span>
              <p className={`${bodyText} pt-0.5`}>
                <strong className="font-semibold text-[#0A0A0A]">{step.lead}:</strong> {step.text}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Step 9: FAQs. Native <details> opens on click with or without JavaScript. */}
      <section id="faq" aria-labelledby="faq-heading" className={sectionClass}>
        <h2 id="faq-heading" className={h2Class}>Frequently asked questions</h2>
        <div className="max-w-3xl border-t border-zinc-200/85">
          {HOW_TO_ENGAGE_FAQS.map(faq => (
            <details key={faq.q} className="group border-b border-zinc-200/85">
              <summary className="flex items-center justify-between gap-4 py-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <h3 className="text-base font-medium text-[#0A0A0A]">{faq.q}</h3>
                <ChevronDown className="w-4 h-4 text-[#555555] shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="pb-4 text-sm text-[#555555] leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

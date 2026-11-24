/**
 * /security — rebuilt from the developer handoff dated 23 Nov 2026. Copy is
 * word for word.
 *
 * Not approved, leave out: certifications or badges, how engineers are
 * checked before they join, access tools or methods, invoicing and payment
 * terms, legal name and address, questionnaire answers, client logos or
 * quotes, "24/7", "2-hour response", "enterprise-grade", and any promise to
 * pass a security review. The closing black banner is BookCallBand in App.tsx.
 */
import { Check, ChevronDown, Code, CalendarDays, FileCheck, MessageSquare } from 'lucide-react';
import SEO, { SITE_BASE_URL } from './SEO';
import SecurityTiles from './marketing/SecurityTiles';
import { BookingLink, h2Class, primaryButton, sectionClass } from './marketing/ui';
import { REPLACEMENT_WINDOW } from '../content/business-facts';

const PAGE_PATH = '/security';
const PAGE_URL = `${SITE_BASE_URL}${PAGE_PATH}`;
const PAGE_TITLE = 'Security | Fwdpod';
// The handoff gives no meta description; this is its H1 and sub-line.
const PAGE_DESCRIPTION = 'Your code, your data, your control. Clear answers on how we keep your work safe.';

// The handoff writes this range with a plain hyphen; kept as written.
const US_OVERLAP = '3-4 hours';

const DATA_POINTS = [
  'Your access rules decide what each engineer can reach.',
  'Your data stays in the place where you already keep it.',
  'Your team stays in charge of your systems.',
];

const SAFE_AI_POINTS = [
  'Guardrails and privacy filters for sensitive data',
  'A record of every important action the AI takes (called an audit log)',
  'Testing before each release, including attack tests and checks that old problems have not come back',
  // [CONFIRM. The handoff says "Controls matched to your regulators and your
  // own policies." Softened to match the Trust and compliance copy.]
  'Controls designed against the regulations and policies you name',
];

// One list feeds the accordion and the FAQPage schema, so they cannot differ.
export const SECURITY_FAQS = [
  { q: 'Who owns the code and IP?', a: 'You do. Every engineer signs an NDA and a full IP assignment.' },
  {
    q: 'How do you handle sensitive data?',
    a: 'Our engineers work inside your environment, under your access policies. Your data stays where you keep it.',
  },
  {
    q: 'Do your engineers work in our tools?',
    a: 'Yes. They join your Slack or Teams, your repositories and your stand-ups.',
  },
  {
    q: 'What if someone is not the right fit?',
    a: `We replace them free within ${REPLACEMENT_WINDOW}, with a written handover.`,
  },
  {
    q: 'Can you help with AI that must follow strict rules?',
    a: 'Yes. Our Compliance AI Pod builds guardrails, activity records and testing into the AI we build.',
  },
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
      'mainEntity': SECURITY_FAQS.map(faq => ({
        '@type': 'Question',
        'name': faq.q,
        'acceptedAnswer': { '@type': 'Answer', 'text': faq.a },
      })),
    },
  ],
};

const bodyText = 'text-base text-[#555555] leading-relaxed';
// Sections alternate between a light panel and plain white
const lightPanel = 'bg-zinc-50 rounded-3xl px-6 md:px-10';

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map(item => (
        <li key={item} className="flex gap-2.5 text-sm text-[#0A0A0A] leading-relaxed">
          <Check className="w-4 h-4 mt-0.5 text-[#0066FF] shrink-0" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function SecurityView() {
  return (
    <div className="bg-white animate-page-enter">
      <SEO title={PAGE_TITLE} description={PAGE_DESCRIPTION} canonical={PAGE_PATH} jsonLd={JSON_LD} />

      {/* Step 1: Hero. Centered: headline, one line, one button. */}
      <section className="pt-4 md:pt-6 pb-12 md:pb-16 flex flex-col items-center text-center gap-6" aria-labelledby="security-page-heading">
        <h1 id="security-page-heading" className="max-w-3xl text-4xl md:text-6xl font-display font-medium tracking-tight text-[#0A0A0A] leading-[1.05] text-balance">
          Your code, your data, your control.
        </h1>
        <p className="text-lg text-[#555555] leading-relaxed">Clear answers on how we keep your work safe.</p>
        <BookingLink label="Book a 30-minute call" source="security hero" className={primaryButton} />
      </section>

      {/* Step 2: Six tiles (the same tiles and wording as the homepage) */}
      <section aria-labelledby="safe-heading" className={`${sectionClass} ${lightPanel}`}>
        <h2 id="safe-heading" className={h2Class}>How we keep your work safe</h2>
        <SecurityTiles />
      </section>

      {/* Step 3: You own what we build */}
      <section aria-labelledby="own-heading" className={sectionClass}>
        <div className="flex gap-5 max-w-3xl">
          <FileCheck className="hidden sm:block w-7 h-7 mt-1 text-[#0066FF] shrink-0" aria-hidden="true" />
          <div className="space-y-4">
            <h2 id="own-heading" className={h2Class}>You own what we build</h2>
            <p className={bodyText}>
              The code is yours. The IP is yours. IP means the ownership of everything we build for you. Every engineer
              signs an NDA and a full IP assignment, so the work belongs to you.
            </p>
          </div>
        </div>
      </section>

      {/* Step 4: Your data stays with you */}
      <section aria-labelledby="data-heading" className={`${sectionClass} ${lightPanel}`}>
        <div className="space-y-4 max-w-3xl">
          <h2 id="data-heading" className={h2Class}>Your data stays with you</h2>
          <p className={bodyText}>
            Our engineers work inside your environment, under your access policies. Your data stays where you keep it.
          </p>
          <Bullets items={DATA_POINTS} />
        </div>
      </section>

      {/* Step 5: We work the way your team works */}
      <section aria-labelledby="team-heading" className={sectionClass}>
        <div className="space-y-4 max-w-3xl">
          <div className="flex gap-3 text-[#0066FF]" aria-hidden="true">
            <MessageSquare className="w-5 h-5" />
            <Code className="w-5 h-5" />
            <CalendarDays className="w-5 h-5" />
          </div>
          <h2 id="team-heading" className={h2Class}>We work the way your team works</h2>
          <p className={bodyText}>
            Our engineers join your Slack or Teams, your code repositories and your daily stand-up meetings. They overlap
            with US working hours for {US_OVERLAP} every day.
          </p>
        </div>
      </section>

      {/* Step 6: If someone is not the right fit */}
      <section aria-labelledby="fit-heading" className={`${sectionClass} ${lightPanel}`}>
        <div className="space-y-4 max-w-3xl">
          <h2 id="fit-heading" className={h2Class}>If someone is not the right fit</h2>
          <p className={bodyText}>
            We replace them free within {REPLACEMENT_WINDOW}. We also give you a written handover, so the work carries on
            without a gap.
          </p>
        </div>
      </section>

      {/* Step 7: Safe AI, built in */}
      <section aria-labelledby="safe-ai-heading" className={sectionClass}>
        <div className="space-y-4 max-w-3xl">
          <h2 id="safe-ai-heading" className={h2Class}>Safe AI, built in</h2>
          <p className={bodyText}>
            If your AI handles private data or has to follow strict rules, our Compliance AI Pod can build safety into it.
            The pod has 6 engineers.
          </p>
          <Bullets items={SAFE_AI_POINTS} />
          <p className="text-xs text-[#555555]">How we measure it: audit findings closed, and data-leak tests passed.</p>
        </div>
      </section>

      {/* Step 8: Questions from your security or legal team? */}
      <section aria-labelledby="questions-heading" className={`${sectionClass} ${lightPanel}`}>
        <div className="space-y-4 max-w-3xl">
          <h2 id="questions-heading" className={h2Class}>Questions from your security or legal team?</h2>
          <p className={bodyText}>Bring them to a 30-minute call. We will go through them with you.</p>
          <div className="pt-2">
            <BookingLink label="Book a 30-minute call" source="security questions" className={primaryButton} />
          </div>
        </div>
      </section>

      {/* Step 9: FAQs. Native <details>: opens on click, with or without JavaScript. */}
      <section id="faq" aria-labelledby="faq-heading" className={sectionClass}>
        <h2 id="faq-heading" className={h2Class}>Frequently asked questions</h2>
        <div className="max-w-3xl border-t border-zinc-200/85">
          {SECURITY_FAQS.map(faq => (
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

      {/* Step 10: the black "Tell us the role or the outcome." banner is the
          site-wide BookCallBand, rendered once by App.tsx above the footer. */}
    </div>
  );
}

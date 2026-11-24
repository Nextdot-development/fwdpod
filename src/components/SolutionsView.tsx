import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, ChevronDown } from 'lucide-react';
import SEO from './SEO';
import { BOOKING_PATH, primaryButton, secondaryButton, sectionClass, SectionHeading } from './marketing/ui';
import StackInfographic from './marketing/StackInfographic';
import StartWhereYouAre from './marketing/StartWhereYouAre';
import { SOLUTION_LAYERS, SOLUTION_BANDS, type SolutionSection } from '../content/engineering-stack';
import {
  TIME_TO_START,
  SHORTLIST_TIME,
  US_OVERLAP_HOURS,
  REPLACEMENT_WINDOW,
  PILOT_LENGTH,
} from '../content/business-facts';
import { trackCtaClick } from '../utils/analytics';

// ── Page metadata ────────────────────────────────────────────────────────────
const PAGE_TITLE = 'Our Solutions: AI Engineering at Every Layer | Fwdpod';
const PAGE_DESCRIPTION =
  'Senior AI engineers from India to build and run every layer of your AI stack: agents, RAG, models, data, compliance and LLMOps. One specialist or a full pod.';

// FAQ 1–8 from the structure doc. Bracketed numbers come from business-facts.ts.
const FAQS = [
  {
    q: 'How fast can someone start?',
    a: `Profiles within ${SHORTLIST_TIME} of a scoping call; engineers usually start within ${TIME_TO_START}.`,
  },
  {
    q: 'Do your engineers work in our tools and hours?',
    a: `Yes. They join your Slack or Teams, repos and stand-ups, with ${US_OVERLAP_HOURS} of daily overlap with US time zones.`,
  },
  {
    q: 'Who owns the code and IP?',
    a: 'You do. Every engineer signs an NDA and full IP assignment.',
  },
  {
    q: "What if someone isn't the right fit?",
    a: `We replace them free within ${REPLACEMENT_WINDOW}, with a documented handover.`,
  },
  {
    q: 'Can we start small?',
    a: `Yes. A ${PILOT_LENGTH} paid pilot on one use case, with a fixed fee.`,
  },
  {
    q: 'Do you only staff, or do you own delivery?',
    a: 'Both. Specialists work under your lead; each pod has one accountable lead, a forward deployed engineer, and reports on agreed measures.',
  },
  {
    q: 'Which models and platforms do you work with?',
    a: 'Whatever your stack uses. We are model-neutral and work across frontier APIs and open models.',
  },
  {
    q: 'How do you handle sensitive data?',
    a: 'Engineers work inside your environment under your access policies; data stays where you keep it.',
  },
];

const SOLUTIONS_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://fwdpod.com/our-solutions#webpage',
      'url': 'https://fwdpod.com/our-solutions',
      'name': PAGE_TITLE,
      'description': PAGE_DESCRIPTION,
      'isPartOf': { '@id': 'https://fwdpod.com/#website' },
      'breadcrumb': {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://fwdpod.com/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Our Solutions', 'item': 'https://fwdpod.com/our-solutions' },
        ],
      },
    },
    {
      '@type': 'FAQPage',
      'mainEntity': FAQS.map(faq => ({
        '@type': 'Question',
        'name': faq.q,
        'acceptedAnswer': { '@type': 'Answer', 'text': faq.a },
      })),
    },
  ],
};

interface SolutionsViewProps {
  /** Kept for App's route wiring; this page no longer preselects a pod. */
  selectedPodId: string | null;
  /** Kept for App's route wiring; this page no longer preselects a pod. */
  onPreselectPod: (podId: string) => void;
}

// ── One layer or cross-cutting band, with the doc's copy ─────────────────────
function SolutionBlock({ item }: { item: SolutionSection }) {
  const headingId = `${item.id}-heading`;
  const label = 'text-[10px] font-mono uppercase tracking-wider text-[#0066FF]';
  return (
    <section id={item.id} aria-labelledby={headingId} className="scroll-mt-24 border border-zinc-200/85 rounded-3xl p-6 md:p-10 space-y-6">
      <div className="space-y-2">
        <h2 id={headingId} className="text-2xl md:text-3xl font-display font-medium tracking-tight text-[#0A0A0A]">
          <span className="text-[#555555]">{item.kicker} · </span>
          <Link to={item.href} className="hover:text-[#0066FF] hover:underline">{item.name}</Link>
        </h2>
        {item.subPages && (
          <ul className="flex flex-wrap gap-2" aria-label={`Part of ${item.name}`}>
            {item.subPages.map(sub => (
              <li key={sub.href}>
                <Link
                  to={sub.href!}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#0066FF] border border-[#0066FF]/30 rounded-full px-3 py-1 hover:bg-[#0066FF]/5"
                >
                  {sub.label} <ArrowRight className="w-3 h-3" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className="text-base font-semibold text-[#0A0A0A]">{item.promise}</p>
      </div>

      <ul className="space-y-2.5">
        {item.bullets.map(bullet => (
          <li key={bullet} className="flex gap-2.5 text-sm text-[#555555] leading-relaxed">
            <Check className="w-4 h-4 mt-0.5 text-[#0066FF] shrink-0" aria-hidden="true" />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>

      <dl className="grid grid-cols-1 md:grid-cols-3 gap-5 rounded-2xl bg-zinc-50 border border-zinc-100 p-5">
        {item.needThisIf && (
          <div>
            <dt className={label}>You need this if</dt>
            <dd className="mt-1 text-sm text-[#0A0A0A] leading-relaxed">{item.needThisIf}</dd>
          </div>
        )}
        <div>
          <dt className={label}>Measured by</dt>
          <dd className="mt-1 text-sm text-[#0A0A0A] leading-relaxed">{item.measuredBy}</dd>
        </div>
        <div>
          <dt className={label}>Who does it</dt>
          <dd className="mt-1 text-sm text-[#0A0A0A] leading-relaxed">{item.whoDoesIt}</dd>
        </div>
      </dl>
    </section>
  );
}

export default function SolutionsView(_props: SolutionsViewProps) {
  return (
    <div className="bg-white animate-page-enter">
      <SEO title={PAGE_TITLE} description={PAGE_DESCRIPTION} jsonLd={SOLUTIONS_JSON_LD} />

      {/* 1. Hero */}
      <section className="pt-2 pb-8 space-y-6 max-w-3xl" aria-labelledby="solutions-heading">
        <span className="text-[#0066FF] text-xs font-mono font-medium uppercase tracking-widest block">Solutions</span>
        <h1 id="solutions-heading" className="text-4xl md:text-5xl font-display font-medium tracking-tight text-[#0A0A0A] leading-[1.08] text-balance">
          AI engineering at every layer of your stack.
        </h1>
        <p className="text-base text-[#555555] max-w-2xl leading-relaxed">
          From data to agents to production operations, we deploy senior AI engineers from India to build and run the parts your team can't staff today. Start with one specialist or a full pod.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <Link
            to={BOOKING_PATH}
            onClick={() => trackCtaClick('Book a 30-minute call (solutions hero)', BOOKING_PATH)}
            className={primaryButton}
          >
            <span>Book a 30-minute call</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          <a
            href="#start"
            onClick={() => trackCtaClick('Find your starting point (solutions hero)', '/our-solutions#start')}
            className={secondaryButton}
          >
            Find your starting point
          </a>
        </div>
      </section>

      {/* 2. The stack infographic */}
      <section id="stack" aria-labelledby="stack-heading" className={sectionClass}>
        <div className="space-y-3">
          <SectionHeading id="stack-heading" label="The engineering stack" title="Four layers to build. Two that run across all of them." />
          <p className="text-sm text-[#555555]">What we engineer at each layer of an enterprise AI system, and who does it.</p>
        </div>
        <StackInfographic />
      </section>

      {/* 3. Layers 1–4, then the two cross-cutting bands */}
      <div className="flex flex-col gap-6 py-6">
        {[...SOLUTION_LAYERS, ...SOLUTION_BANDS].map(item => (
          <SolutionBlock key={item.id} item={item} />
        ))}
      </div>

      {/* 4. Start where you are (same table as the homepage) */}
      <StartWhereYouAre />

      {/* 5. FAQs: answers stay in the prerendered HTML when closed */}
      <section id="faqs" aria-labelledby="faqs-heading" className={sectionClass}>
        <SectionHeading id="faqs-heading" label="FAQs" title="Frequently asked questions" />
        <div className="border-t border-[#0A0A0A]/10">
          {FAQS.map(faq => (
            <details key={faq.q} className="group border-b border-[#0A0A0A]/10">
              <summary className="flex items-center justify-between gap-4 py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <h3 className="text-base font-medium text-[#0A0A0A]">{faq.q}</h3>
                <ChevronDown className="w-4 h-4 text-[#555555] shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="pb-5 text-sm text-[#555555] leading-relaxed max-w-3xl">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

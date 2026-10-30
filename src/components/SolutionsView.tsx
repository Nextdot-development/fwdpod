import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Check, ChevronDown } from 'lucide-react';
import SEO from './SEO';
import PricingSection from './marketing/PricingSection';
import { BookingLink, card, cardHover, primaryButton, sectionClass, SectionHeading } from './marketing/ui';
import { PODS, type Pod } from '../content/pods';
import { trackCtaClick } from '../utils/analytics';

// ── Page metadata ────────────────────────────────────────────────────────────
const PAGE_TITLE = 'AI Solutions for Automation, Search and Voice | Fwdpod';
const PAGE_DESCRIPTION =
  'AI solutions for workflow automation, document search, customer calls, compliance and AI operations, each delivered by a dedicated team of 4–6 engineers.';

const SOLUTIONS_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://www.fwdpod.com/#solutions',
      'url': 'https://www.fwdpod.com/our-solutions',
      'name': PAGE_TITLE,
      'description': PAGE_DESCRIPTION,
      'isPartOf': { '@id': 'https://www.fwdpod.com/#website' },
      'breadcrumb': {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.fwdpod.com/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Our Solutions', 'item': 'https://www.fwdpod.com/oursolutions' }
        ]
      }
    },
    {
      '@type': 'ItemList',
      'name': 'AI solutions',
      'description': 'AI solutions, each delivered by a dedicated team of 4–6 engineers with one accountable lead',
      'numberOfItems': PODS.length,
      'itemListElement': PODS.map((pod, idx) => ({
        '@type': 'ListItem',
        'position': idx + 1,
        'name': pod.name,
        'description': pod.summary,
        'url': `https://www.fwdpod.com/our-solutions#pod-heading-${pod.id}`
      }))
    }
  ]
};

// ── The team behind a solution (the 5-person agent team as the example) ───────
const EXAMPLE_TEAM = [
  { role: 'Team lead', count: 1, text: 'Your single point of contact. Owns the design, plan and delivery.' },
  { role: 'AI engineers', count: 2, text: 'Build the solution and connect it to your systems.' },
  { role: 'Data and quality engineer', count: 1, text: 'Prepares the data, tests the results and checks quality.' },
  { role: 'Delivery engineer', count: 1, text: 'Works inside your environment to launch it and keep it running.' },
];

interface SolutionsViewProps {
  /** Kept for App's route wiring; the footer now passes the pod in the link's state instead. */
  selectedPodId: string | null;
  /** Kept for App's route wiring; the cards now book a call instead of opening /configure. */
  onPreselectPod: (podId: string) => void;
}

function SolutionCard({ pod, open, onToggle }: { pod: Pod; open: boolean; onToggle: () => void }) {
  const dark = pod.highlighted;
  const detailsId = `pod-details-${pod.id}`;
  const muted = dark ? 'text-zinc-300' : 'text-[#555555]';
  const strong = dark ? 'text-white' : 'text-[#0A0A0A]';
  const label = `text-[10px] font-mono uppercase tracking-wider ${dark ? 'text-zinc-400' : 'text-[#0066FF]'}`;
  return (
    <article
      id={`pod-heading-${pod.id}`}
      className={`scroll-mt-24 rounded-3xl border overflow-hidden shadow-sm ${cardHover} ${
        dark ? 'bg-[#0A0A0A] border-[#0A0A0A] text-white' : `bg-white ${open ? 'border-[#0066FF]' : 'border-zinc-200/85'}`
      }`}
    >
      {/* Closed: ID, timeline and name only. Click to open the explanation. */}
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={detailsId}
          className={`w-full flex items-center justify-between gap-4 p-6 md:p-10 text-left cursor-pointer transition-colors ${dark ? 'hover:bg-white/5' : 'hover:bg-[#0A0A0A]/[0.03]'}`}
        >
          <span className="space-y-3 min-w-0">
            <span className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] font-mono uppercase ${muted}`}>ID: {pod.id}</span>
              <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-md ${dark ? 'bg-white/10 text-white' : 'bg-[#0066FF]/5 text-[#0055DD]'}`}>
                {pod.timeline}
              </span>
            </span>
            <span className={`block text-2xl font-display font-medium tracking-tight ${strong}`}>{pod.name}</span>
          </span>
          <span className="flex items-center gap-4 shrink-0" aria-hidden="true">
            <span className={`hidden sm:inline-block text-xs font-medium ${muted}`}>{open ? 'Collapse spec' : 'Expand spec'}</span>
            <span className={`p-1.5 rounded-full border ${dark ? 'border-white/20 bg-white/5' : 'border-[#0A0A0A]/10 bg-zinc-50'}`}>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''} ${strong}`} />
            </span>
          </span>
        </button>
      </h3>

      {/* Kept in the page when closed, so the details are in the prerendered HTML */}
      <div
        id={detailsId}
        hidden={!open}
        className={`px-6 pb-6 md:px-10 md:pb-10 pt-6 md:pt-8 space-y-6 border-t animate-fadeIn ${dark ? 'border-white/10' : 'border-[#0A0A0A]/10'}`}
      >
        <p className={`text-sm leading-relaxed ${muted}`}>{pod.summary}</p>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <dt className={label}>The challenge</dt>
            <dd className={`mt-1 text-sm leading-relaxed ${dark ? 'text-zinc-200' : 'text-[#0A0A0A]'}`}>{pod.challenge}</dd>
          </div>
          <div>
            <dt className={label}>The value</dt>
            <dd className={`mt-1 text-sm leading-relaxed ${dark ? 'text-zinc-200' : 'text-[#0A0A0A]'}`}>{pod.value}</dd>
          </div>
        </dl>

        <div className="space-y-3">
          <h4 className={`text-xs font-mono font-medium uppercase tracking-widest ${muted}`}>What's included</h4>
          <ul className="space-y-2.5">
            {pod.typicalWork.map(item => (
              <li key={item} className={`flex gap-2.5 text-sm leading-relaxed ${dark ? 'text-zinc-200' : 'text-[#555555]'}`}>
                <Check className={`w-4 h-4 mt-0.5 shrink-0 ${dark ? 'text-white' : 'text-[#0066FF]'}`} aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <dl className={`grid grid-cols-2 gap-x-6 gap-y-5 rounded-2xl p-5 ${dark ? 'bg-white/5 border border-white/10' : 'bg-zinc-50 border border-zinc-100'}`}>
          <div>
            <dt className={`text-[10px] font-mono uppercase tracking-wider ${muted}`}>Team size</dt>
            <dd className={`mt-1 text-sm font-semibold ${strong}`}>{pod.size}</dd>
          </div>
          <div>
            <dt className={`text-[10px] font-mono uppercase tracking-wider ${muted}`}>Typical timeline</dt>
            <dd className={`mt-1 text-sm font-semibold ${strong}`}>{pod.timeline}</dd>
          </div>
          <div className="col-span-2">
            <dt className={`text-[10px] font-mono uppercase tracking-wider ${muted}`}>Best for</dt>
            <dd className={`mt-1 text-sm leading-relaxed ${strong}`}>{pod.bestFor}</dd>
          </div>
        </dl>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <BookingLink label="Discuss this solution" source={`solutions ${pod.name}`} className={primaryButton} />
          {pod.caseStudyId && (
            <Link
              to={`/case-studies#${pod.caseStudyId}`}
              onClick={() => trackCtaClick(`View case study (solutions ${pod.name})`, '/case-studies')}
              className={`text-xs font-medium inline-flex items-center gap-1 hover:underline ${dark ? 'text-white' : 'text-[#0066FF]'}`}
            >
              View case study <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export default function SolutionsView(_props: SolutionsViewProps) {
  const location = useLocation();
  // Set only by a footer link, for that one navigation
  const linkedPodId = (location.state as { podId?: string } | null)?.podId ?? null;
  const [openPods, setOpenPods] = useState<Set<string>>(() => new Set());

  const togglePod = (id: string) =>
    setOpenPods(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // Open and scroll to the solution picked in the footer. Deferred so it runs
  // after App's scroll-to-top on route change. Keyed on the navigation, so the
  // same footer link clicked again while on this page still works.
  useEffect(() => {
    if (!linkedPodId) return;
    setOpenPods(prev => new Set(prev).add(linkedPodId));
    const timer = window.setTimeout(() => {
      document.getElementById(`pod-heading-${linkedPodId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [linkedPodId, location.key]);

  return (
    <div className="bg-white animate-page-enter">
      <SEO title={PAGE_TITLE} description={PAGE_DESCRIPTION} jsonLd={SOLUTIONS_JSON_LD} />

      {/* 1. Intro */}
      <section className="pt-2 space-y-2 max-w-3xl" aria-labelledby="solutions-heading">
        <span className="text-[#0066FF] text-xs font-mono font-medium uppercase tracking-widest block">Our Solutions</span>
        <h1 id="solutions-heading" className="text-4xl md:text-5xl font-display font-medium tracking-tight text-[#0A0A0A] leading-[1.08]">
          AI engineering pods
        </h1>
        <p className="text-sm text-[#555555] max-w-xl leading-relaxed">
          Hand over a full workstream to 4–6 engineers who already work together, with one pod lead accountable to you.
        </p>
      </section>

      {/* 2. Solutions */}
      <section aria-labelledby="pods-heading" className="flex flex-col gap-6 pt-6 pb-12 md:pb-16">
        <SectionHeading id="pods-heading" label="Our pods" title="Find the pod that fits your goal." />
        {/* Two independent columns, so opening a card doesn't stretch the one beside it */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {[PODS.slice(0, 3), PODS.slice(3)].map((column, idx) => (
            <div key={idx} className="space-y-6">
              {column.map(pod => (
                <SolutionCard key={pod.id} pod={pod} open={openPods.has(pod.id)} onToggle={() => togglePod(pod.id)} />
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* 3. The team behind a solution */}
      <section aria-labelledby="team-heading" className={sectionClass}>
        <SectionHeading id="team-heading" label="How it's delivered" title="A dedicated team behind every solution." />
        <p className="-mt-6 md:-mt-8 text-sm text-[#555555] max-w-xl leading-relaxed">
          For example, the Agent Development Pod is a team of five:
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {EXAMPLE_TEAM.map(item => (
            <li key={item.role} className={card}>
              <span className="text-xs font-mono font-semibold text-[#0066FF]">×{item.count}</span>
              <h3 className="mt-2 text-lg font-display font-medium tracking-tight text-[#0A0A0A]">{item.role}</h3>
              <p className="mt-1.5 text-sm text-[#555555] leading-relaxed">{item.text}</p>
            </li>
          ))}
        </ul>
        <p className="text-lg font-display font-medium tracking-tight text-[#0A0A0A]">
          One team. One contract. One accountable lead.
        </p>
      </section>

      {/* 4. Pricing */}
      <PricingSection source="solutions" />
    </div>
  );
}

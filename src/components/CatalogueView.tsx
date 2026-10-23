import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Check, ChevronDown } from 'lucide-react';
import SEO from './SEO';
import PricingSection from './marketing/PricingSection';
import { BookingLink, card, cardHover, primaryButton, sectionClass, SectionHeading } from './marketing/ui';
import { PODS, type Pod } from '../content/pods';

// ── Page metadata ────────────────────────────────────────────────────────────
const PAGE_TITLE = 'AI Engineering Pods for Agents, RAG and Voice AI | Fwdpod';
const PAGE_DESCRIPTION =
  'Six AI engineering pods for agents, RAG, voice AI, compliance and LLMOps: 4–6 engineers who already work together, with one pod lead accountable to you.';

const CATALOGUE_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://www.fwdpod.com/#catalogue',
      'url': 'https://www.fwdpod.com/catalogue',
      'name': PAGE_TITLE,
      'description': PAGE_DESCRIPTION,
      'isPartOf': { '@id': 'https://www.fwdpod.com/#website' },
      'breadcrumb': {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.fwdpod.com/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'AI engineering pods', 'item': 'https://www.fwdpod.com/catalogue' }
        ]
      }
    },
    {
      '@type': 'ItemList',
      'name': 'AI engineering pods',
      'description': 'AI engineering pods of 4–6 engineers who already work together, each with one accountable pod lead',
      'numberOfItems': PODS.length,
      'itemListElement': PODS.map((pod, idx) => ({
        '@type': 'ListItem',
        'position': idx + 1,
        'name': pod.name,
        'description': pod.builds,
        'url': `https://www.fwdpod.com/catalogue#pod-heading-${pod.id}`
      }))
    }
  ]
};

// ── Example pod breakdown ────────────────────────────────────────────────────
const AGENT_POD_ROLES = [
  { role: 'Pod lead and architect', count: 1, text: 'Your single point of contact. Owns design, plan and delivery.' },
  { role: 'AI engineers', count: 2, text: 'Build the agents, tools and integrations with your systems.' },
  { role: 'Data and evaluation engineer', count: 1, text: 'Prepares data, writes tests and measures output quality.' },
  { role: 'Forward deployed engineer', count: 1, text: 'Ships into your environment and keeps it running.' },
];

interface CatalogueViewProps {
  /** Kept for App's route wiring; the footer now passes the pod in the link's state instead. */
  selectedPodId: string | null;
  /** Kept for App's route wiring; the pod cards now book a call instead of opening /configure. */
  onPreselectPod: (podId: string) => void;
}

function PodCard({ pod, open, onToggle }: { pod: Pod; open: boolean; onToggle: () => void }) {
  const dark = pod.highlighted;
  const detailsId = `pod-details-${pod.id}`;
  return (
    <article
      id={`pod-heading-${pod.id}`}
      className={`scroll-mt-24 rounded-3xl border overflow-hidden shadow-sm ${cardHover} ${
        dark ? 'bg-[#0A0A0A] border-[#0A0A0A] text-white' : `bg-white ${open ? 'border-[#0066FF]' : 'border-zinc-200/85'}`
      }`}
    >
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={detailsId}
          className={`w-full flex items-center justify-between gap-4 p-6 md:p-10 text-left cursor-pointer transition-colors ${dark ? 'hover:bg-white/5' : 'hover:bg-[#0A0A0A]/[0.03]'}`}
        >
          <span className="space-y-3 min-w-0">
            {/* ID and timeline, as on the earlier catalogue cards */}
            <span className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] font-mono uppercase ${dark ? 'text-zinc-300' : 'text-[#555555]'}`}>ID: {pod.id}</span>
              <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-md ${dark ? 'bg-white/10 text-white' : 'bg-[#0066FF]/5 text-[#0055DD]'}`}>
                {pod.timeline}
              </span>
            </span>
            <span className={`block text-2xl font-display font-medium tracking-tight ${dark ? 'text-white' : 'text-[#0A0A0A]'}`}>
              {pod.name}
            </span>
          </span>
          <span className="flex items-center gap-4 shrink-0" aria-hidden="true">
            <span className={`hidden sm:inline-block text-xs font-medium ${dark ? 'text-zinc-300' : 'text-[#555555]'}`}>
              {open ? 'Collapse spec' : 'Expand spec'}
            </span>
            <span className={`p-1.5 rounded-full border ${dark ? 'border-white/20 bg-white/5' : 'border-[#0A0A0A]/10 bg-zinc-50'}`}>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''} ${dark ? 'text-white' : 'text-[#0A0A0A]'}`} />
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
        <p className={`text-sm leading-relaxed ${dark ? 'text-zinc-300' : 'text-[#555555]'}`}>{pod.builds}</p>

        {pod.typicalWork.length > 0 && (
          <div className="space-y-3">
            <h4 className={`text-xs font-mono font-medium uppercase tracking-widest ${dark ? 'text-zinc-300' : 'text-[#555555]'}`}>
              Typical work
            </h4>
            <ul className="space-y-2.5">
              {pod.typicalWork.map(item => (
                <li key={item} className={`flex gap-2.5 text-sm leading-relaxed ${dark ? 'text-zinc-200' : 'text-[#555555]'}`}>
                  <Check className={`w-4 h-4 mt-0.5 shrink-0 ${dark ? 'text-white' : 'text-[#0066FF]'}`} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <dl className={`grid grid-cols-2 gap-x-6 gap-y-5 rounded-2xl p-5 ${dark ? 'bg-white/5 border border-white/10' : 'bg-zinc-50 border border-zinc-100'}`}>
          <div>
            <dt className={`text-[10px] font-mono uppercase tracking-wider ${dark ? 'text-zinc-300' : 'text-[#555555]'}`}>Team size</dt>
            <dd className={`mt-1 text-sm font-semibold ${dark ? 'text-white' : 'text-[#0A0A0A]'}`}>{pod.size}</dd>
          </div>
          <div>
            <dt className={`text-[10px] font-mono uppercase tracking-wider ${dark ? 'text-zinc-300' : 'text-[#555555]'}`}>Typical timeline</dt>
            <dd className={`mt-1 text-sm font-semibold ${dark ? 'text-white' : 'text-[#0A0A0A]'}`}>{pod.timeline}</dd>
          </div>
          <div className="col-span-2">
            <dt className={`text-[10px] font-mono uppercase tracking-wider ${dark ? 'text-zinc-300' : 'text-[#555555]'}`}>Best for</dt>
            <dd className={`mt-1 text-sm leading-relaxed ${dark ? 'text-white' : 'text-[#0A0A0A]'}`}>{pod.bestFor}</dd>
          </div>
        </dl>

        <BookingLink label="Book a 30-minute call" source={`catalogue ${pod.name}`} className={`${primaryButton} w-full`} />
      </div>
    </article>
  );
}

export default function CatalogueView(_props: CatalogueViewProps) {
  const location = useLocation();
  // Set only by a footer pod link, for that one navigation
  const linkedPodId = (location.state as { podId?: string } | null)?.podId ?? null;
  const [openPods, setOpenPods] = useState<Set<string>>(() => new Set());

  const togglePod = (id: string) =>
    setOpenPods(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // Open and scroll to the pod picked in the footer. Deferred so it runs after
  // App's scroll-to-top on route change. Keyed on the navigation, so the same
  // footer link clicked again while on this page still works.
  useEffect(() => {
    if (!linkedPodId) return;
    setOpenPods(prev => new Set(prev).add(linkedPodId));
    const timer = window.setTimeout(() => {
      document.getElementById(`pod-heading-${linkedPodId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [linkedPodId, location.key]);

  return (
    <div className="bg-white">
      <SEO title={PAGE_TITLE} description={PAGE_DESCRIPTION} jsonLd={CATALOGUE_JSON_LD} />

      {/* 1. Intro */}
      <section className="pt-2 space-y-2 max-w-3xl" aria-labelledby="catalogue-heading">
        <span className="text-[#0066FF] text-xs font-mono font-medium uppercase tracking-widest block">Pod catalogue</span>
        <h1 id="catalogue-heading" className="text-4xl md:text-5xl font-display font-medium tracking-tight text-[#0A0A0A] leading-[1.08]">
          AI engineering pods
        </h1>
        <p className="text-sm text-[#555555] max-w-xl leading-relaxed">
          Hand over a full workstream to 4–6 engineers who already work together, with one pod lead accountable to you.
        </p>
      </section>

      {/* 2. Pod cards: name only, click to open the details */}
      <section aria-labelledby="pods-heading" className="flex flex-col gap-6 pt-6 pb-12 md:pb-16">
        <SectionHeading id="pods-heading" label="Our pods" title="Pick the pod that fits your goal." />
        {/* Two independent columns, so opening a card doesn't stretch the one beside it */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {[PODS.slice(0, 3), PODS.slice(3)].map((column, idx) => (
            <div key={idx} className="space-y-6">
              {column.map(pod => (
                <PodCard key={pod.id} pod={pod} open={openPods.has(pod.id)} onToggle={() => togglePod(pod.id)} />
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* 3. Example pod breakdown */}
      <section aria-labelledby="breakdown-heading" className={sectionClass}>
        <SectionHeading id="breakdown-heading" label="Inside a pod" title="What a 5-person Agent Development Pod looks like" />
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {AGENT_POD_ROLES.map(item => (
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
      <PricingSection source="catalogue" />
    </div>
  );
}

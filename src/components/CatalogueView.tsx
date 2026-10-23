import React, { useEffect } from 'react';
import { Check } from 'lucide-react';
import SEO from './SEO';
import TwoWaysToWork from './marketing/TwoWaysToWork';
import PricingSection from './marketing/PricingSection';
import { BookingLink, card, cardHover, primaryButton, sectionClass, SectionHeading } from './marketing/ui';
import { PODS } from '../content/pods';

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
  /** Pod to scroll to, set by the footer's pod links. */
  selectedPodId: string | null;
  /** Kept for App's route wiring; the pod blocks now book a call instead of opening /configure. */
  onPreselectPod: (podId: string) => void;
}

export default function CatalogueView({ selectedPodId }: CatalogueViewProps) {
  // Scroll to the pod picked in the footer. Deferred so it runs after App's
  // scroll-to-top on route change.
  useEffect(() => {
    if (!selectedPodId) return;
    const timer = window.setTimeout(() => {
      document.getElementById(`pod-heading-${selectedPodId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [selectedPodId]);

  return (
    <div className="bg-white">
      <SEO title={PAGE_TITLE} description={PAGE_DESCRIPTION} jsonLd={CATALOGUE_JSON_LD} />

      {/* 1. Intro */}
      <section className="pt-10 pb-6 md:pt-16 md:pb-10 space-y-5 max-w-3xl" aria-labelledby="catalogue-heading">
        <span className="text-[#0066FF] text-xs font-semibold uppercase tracking-widest block">Pod catalogue</span>
        <h1 id="catalogue-heading" className="text-[2.5rem] sm:text-5xl xl:text-[3.5rem] font-display font-medium tracking-tight text-[#0A0A0A] leading-[1.08]">
          AI engineering pods
        </h1>
        <p className="text-lg md:text-xl text-[#555555] leading-relaxed">
          Hand over a full workstream to 4–6 engineers who already work together, with one pod lead accountable to you.
        </p>
      </section>

      {/* 2. Two ways to work with us */}
      <TwoWaysToWork />

      {/* 3. One block per pod */}
      <section aria-labelledby="pods-heading" className={sectionClass}>
        <SectionHeading id="pods-heading" label="Our pods" title="Pick the pod that fits your goal." />
        <div className="space-y-6">
          {PODS.map(pod => (
            <article
              key={pod.id}
              id={`pod-heading-${pod.id}`}
              aria-labelledby={`pod-name-${pod.id}`}
              className={`scroll-mt-6 rounded-3xl border p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 ${cardHover} ${
                pod.highlighted ? 'bg-[#0A0A0A] border-[#0A0A0A] text-white' : 'bg-white border-zinc-200/85'
              }`}
            >
              <div className="lg:col-span-7 space-y-5">
                <div className="space-y-2">
                  <h3
                    id={`pod-name-${pod.id}`}
                    className={`text-2xl md:text-3xl font-display font-medium tracking-tight ${pod.highlighted ? 'text-white' : 'text-[#0A0A0A]'}`}
                  >
                    {pod.name}
                  </h3>
                  <p className={`text-base md:text-lg leading-relaxed ${pod.highlighted ? 'text-zinc-300' : 'text-[#555555]'}`}>
                    {pod.builds}
                  </p>
                </div>
                {pod.typicalWork.length > 0 && (
                  <div className="space-y-3">
                    <h4 className={`text-xs font-semibold uppercase tracking-widest ${pod.highlighted ? 'text-zinc-300' : 'text-[#555555]'}`}>
                      Typical work
                    </h4>
                    <ul className="space-y-2.5">
                      {pod.typicalWork.map(item => (
                        <li
                          key={item}
                          className={`flex gap-2.5 text-sm md:text-base leading-relaxed ${pod.highlighted ? 'text-zinc-200' : 'text-[#555555]'}`}
                        >
                          <Check className={`w-4 h-4 mt-1 shrink-0 ${pod.highlighted ? 'text-white' : 'text-[#0066FF]'}`} aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="lg:col-span-5 flex flex-col justify-between gap-6">
                <dl
                  className={`grid grid-cols-2 gap-x-6 gap-y-5 rounded-2xl p-5 md:p-6 ${
                    pod.highlighted ? 'bg-white/5 border border-white/10' : 'bg-zinc-50 border border-zinc-100'
                  }`}
                >
                  <div>
                    <dt className={`text-xs font-semibold uppercase tracking-wider ${pod.highlighted ? 'text-zinc-300' : 'text-[#555555]'}`}>Team size</dt>
                    <dd className={`mt-1 text-base font-semibold ${pod.highlighted ? 'text-white' : 'text-[#0A0A0A]'}`}>{pod.size}</dd>
                  </div>
                  <div>
                    <dt className={`text-xs font-semibold uppercase tracking-wider ${pod.highlighted ? 'text-zinc-300' : 'text-[#555555]'}`}>Typical timeline</dt>
                    <dd className={`mt-1 text-base font-semibold ${pod.highlighted ? 'text-white' : 'text-[#0A0A0A]'}`}>{pod.timeline}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className={`text-xs font-semibold uppercase tracking-wider ${pod.highlighted ? 'text-zinc-300' : 'text-[#555555]'}`}>Best for</dt>
                    <dd className={`mt-1 text-sm md:text-base leading-relaxed ${pod.highlighted ? 'text-white' : 'text-[#0A0A0A]'}`}>{pod.bestFor}</dd>
                  </div>
                </dl>
                <BookingLink
                  label="Book a 30-minute call"
                  source={`catalogue ${pod.name}`}
                  className={`${primaryButton} w-full`}
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 4. Example pod breakdown */}
      <section aria-labelledby="breakdown-heading" className={sectionClass}>
        <SectionHeading id="breakdown-heading" label="Inside a pod" title="What a 5-person Agent Development Pod looks like" />
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {AGENT_POD_ROLES.map(item => (
            <li key={item.role} className={card}>
              <span className="text-xs font-mono font-semibold text-[#0066FF]">×{item.count}</span>
              <h3 className="mt-2 text-base md:text-lg font-semibold text-[#0A0A0A]">{item.role}</h3>
              <p className="mt-1.5 text-sm md:text-base text-[#555555] leading-relaxed">{item.text}</p>
            </li>
          ))}
        </ul>
        <p className="text-xl md:text-2xl font-display font-medium tracking-tight text-[#0A0A0A]">
          One team. One contract. One accountable lead.
        </p>
      </section>

      {/* 5. Pricing */}
      <PricingSection source="catalogue" />
    </div>
  );
}

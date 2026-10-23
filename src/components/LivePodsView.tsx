import React from 'react';
import SEO from './SEO';
import { cardHover } from './marketing/ui';
import { CASE_STUDIES } from '../content/case-studies';

// ── Page metadata ────────────────────────────────────────────────────────────
const PAGE_TITLE = 'Case Studies: AI Pods in Production | Fwdpod';
const PAGE_DESCRIPTION =
  'Recent AI pods in production: compliance AI for a financial brokerage, AI agents for a logistics network and voice AI for healthcare services.';

const CASE_STUDIES_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://www.fwdpod.com/#live-pods',
      'url': 'https://www.fwdpod.com/live-pods',
      'name': PAGE_TITLE,
      'description': PAGE_DESCRIPTION,
      'isPartOf': { '@id': 'https://www.fwdpod.com/#website' },
      'breadcrumb': {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.fwdpod.com/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Case studies', 'item': 'https://www.fwdpod.com/live-pods' }
        ]
      }
    },
    {
      '@type': 'ItemList',
      'name': 'Case studies',
      'description': 'Recent AI pods in production',
      'numberOfItems': CASE_STUDIES.length,
      'itemListElement': CASE_STUDIES.map((item, idx) => ({
        '@type': 'ListItem',
        'position': idx + 1,
        'name': `${item.sector}: ${item.pod}`,
        'description': item.built,
        'url': `https://www.fwdpod.com/live-pods#${item.id}`
      }))
    }
  ]
};

const label = 'text-[10px] font-mono uppercase tracking-widest text-[#555555]';

export default function LivePodsView() {
  return (
    <div className="bg-white">
      <SEO title={PAGE_TITLE} description={PAGE_DESCRIPTION} jsonLd={CASE_STUDIES_JSON_LD} />

      {/* 1. Intro */}
      <section className="pt-2 space-y-3 max-w-3xl" aria-labelledby="case-studies-heading">
        <span className="text-[#0066FF] text-xs font-mono font-medium uppercase tracking-widest block">Case studies</span>
        <h1 id="case-studies-heading" className="text-4xl md:text-5xl font-display font-medium tracking-tight text-[#0A0A0A] leading-[1.08]">
          Case studies
        </h1>
        <p className="text-sm text-[#555555] max-w-xl leading-relaxed">Recent AI pods in production.</p>
      </section>

      {/* 2. One card per project */}
      <section aria-label="Projects" className="pt-8 pb-12 md:pb-16 space-y-6">
        {CASE_STUDIES.map(item => (
          <article
            key={item.id}
            id={item.id}
            aria-labelledby={`${item.id}-heading`}
            className={`scroll-mt-24 rounded-3xl border border-zinc-200/85 bg-white shadow-sm p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 ${cardHover}`}
          >
            <div className="lg:col-span-4 space-y-3">
              <span className={`${label} block`}>{item.sector}</span>
              <h2 id={`${item.id}-heading`} className="text-2xl font-display font-medium tracking-tight text-[#0A0A0A]">
                {item.pod}
              </h2>
            </div>

            <div className="lg:col-span-8 space-y-6">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <dt className={label}>The problem</dt>
                  <dd className="text-sm text-[#555555] leading-relaxed">{item.problem}</dd>
                </div>
                <div className="space-y-1.5">
                  <dt className={label}>What we built</dt>
                  <dd className="text-sm text-[#555555] leading-relaxed">{item.built}</dd>
                </div>
              </dl>
              {/* Result */}
              <dl className="pt-5 border-t border-[#0A0A0A]/10 grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <dt className={label}>Time to live</dt>
                  <dd className="text-sm font-semibold text-[#0A0A0A]">{item.weeks.replace(/ to live$/, '')}</dd>
                </div>
                <div className="space-y-1.5">
                  <dt className={label}>Team size</dt>
                  <dd className="text-sm font-semibold text-[#0A0A0A]">{item.team}</dd>
                </div>
              </dl>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

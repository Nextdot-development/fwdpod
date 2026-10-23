import React from 'react';
import SEO from './SEO';
import { card, sectionClass, SectionHeading } from './marketing/ui';
import { ENGAGEMENT_STEPS } from '../content/engagement-steps';
import { REPLACEMENT_WINDOW, TIME_TO_START } from '../content/business-facts';

// ── Page metadata ────────────────────────────────────────────────────────────
const PAGE_TITLE = 'How We Work: AI Engineering Pods and Specialists | Fwdpod';
const PAGE_DESCRIPTION =
  'How Fwdpod works: what we believe, how an engagement runs from first call to start, how we keep quality high, and how we protect your data and IP.';

const HOW_WE_WORK_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://www.fwdpod.com/#how-we-work',
  'url': 'https://www.fwdpod.com/how-we-work',
  'name': PAGE_TITLE,
  'description': PAGE_DESCRIPTION,
  'isPartOf': { '@id': 'https://www.fwdpod.com/#website' },
  'about': { '@id': 'https://www.fwdpod.com/#organization' },
  'breadcrumb': {
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.fwdpod.com/' },
      { '@type': 'ListItem', 'position': 2, 'name': 'How we work', 'item': 'https://www.fwdpod.com/how-we-work' }
    ]
  }
};

// ── Page content ─────────────────────────────────────────────────────────────
// Distilled from the earlier manifesto; see the step 4 report for the mapping.
const PRINCIPLES = [
  {
    title: 'Build, then keep it running',
    text: 'Our engineers build and ship working systems. Advice is part of the job, but the result is software in production that your team can rely on.',
  },
  {
    title: 'Small teams, clear ownership',
    text: 'A small team that shares context moves faster and drops fewer handoffs. Every pod has one lead who owns the result and answers to you.',
  },
  {
    title: 'Cover the whole lifecycle',
    text: 'AI systems need data, models, integrations, deployment and support. We staff every one of those roles, so nothing falls between teams.',
  },
  {
    title: 'Built for production',
    text: 'We build for real use: secure, maintainable and measured, with documentation your own engineers can take over.',
  },
  {
    title: 'Start quickly, without cutting corners',
    text: `Hiring and onboarding can take months. We aim to go from first call to first commit in ${TIME_TO_START}, with the same vetting every time.`,
  },
];

const QUALITY = [
  {
    title: 'Vetting before anyone starts',
    text: 'Every engineer passes technical tests and live interviews before joining your team. You also interview and choose them yourself.',
  },
  {
    title: 'One accountable pod lead',
    text: 'Each pod has a lead who is your single point of contact and owns design, plan and delivery.',
  },
  {
    title: 'Documented handovers',
    text: 'Handovers are documented and every engagement has named backups, so work continues if someone moves on.',
  },
  {
    title: 'Free replacement',
    text: `If someone isn't the right fit, we replace them free within ${REPLACEMENT_WINDOW}.`,
  },
];

const SECURITY = [
  { title: 'Your environment', text: 'Engineers work in your systems, under your access and device policies.' },
  { title: 'Your IP', text: 'Full IP assignment. What we build for you belongs to you.' },
  { title: 'NDAs', text: 'An NDA signed by every engineer.' },
];

export default function HowWeWorkView() {
  return (
    <div className="bg-white animate-page-enter">
      <SEO title={PAGE_TITLE} description={PAGE_DESCRIPTION} jsonLd={HOW_WE_WORK_JSON_LD} />

      {/* 1. Intro */}
      <section className="pt-2 space-y-3 max-w-3xl" aria-labelledby="how-we-work-heading">
        <span className="text-[#0066FF] text-xs font-mono font-medium uppercase tracking-widest block">How we work</span>
        <h1 id="how-we-work-heading" className="text-4xl md:text-5xl font-display font-medium tracking-tight text-[#0A0A0A] leading-[1.08]">
          How we work
        </h1>
        <p className="text-sm text-[#555555] max-w-xl leading-relaxed">
          We place pre-vetted AI engineers from India inside your team, as individual specialists or as full pods. Here is what we believe, how an engagement runs and how we protect your work.
        </p>
      </section>

      {/* 2. What we believe */}
      <section aria-labelledby="beliefs-heading" className={`${sectionClass} pt-8`}>
        <SectionHeading id="beliefs-heading" label="What we believe" title="Five principles behind every engagement." />
        <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRINCIPLES.map((item, idx) => (
            <li key={item.title} className={card}>
              <span className="text-xs font-mono font-semibold text-[#0066FF]">{String(idx + 1).padStart(2, '0')}</span>
              <h3 className="mt-2 text-lg font-display font-medium tracking-tight text-[#0A0A0A]">{item.title}</h3>
              <p className="mt-1.5 text-sm text-[#555555] leading-relaxed">{item.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 3. How an engagement runs */}
      <section id="engagement" aria-labelledby="engagement-heading" className={sectionClass}>
        <div className="space-y-4 max-w-3xl">
          <SectionHeading id="engagement-heading" label="How an engagement runs" title={`From first call to first commit in ${TIME_TO_START}.`} />
          <p className="text-sm text-[#555555] leading-relaxed">
            The same four steps apply whether you need one specialist or a full pod.
          </p>
        </div>
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ENGAGEMENT_STEPS.map((step, idx) => (
            <li key={step.name} className={card}>
              <span className="text-xs font-mono font-semibold text-[#0066FF]">Step {idx + 1}</span>
              <h3 className="mt-2 text-lg font-display font-medium tracking-tight text-[#0A0A0A]">{step.name}</h3>
              <p className="mt-1.5 text-sm text-[#555555] leading-relaxed">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 4. How we keep quality high */}
      <section aria-labelledby="quality-heading" className={sectionClass}>
        <div className="space-y-4 max-w-3xl">
          <SectionHeading id="quality-heading" label="Quality" title="How we keep quality high." />
          <p className="text-sm text-[#555555] leading-relaxed">
            Quality depends on who joins your team and on how that team is run. These four checks cover both.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {QUALITY.map(item => (
            <div key={item.title} className={card}>
              <h3 className="text-lg font-display font-medium tracking-tight text-[#0A0A0A]">{item.title}</h3>
              <p className="mt-2 text-sm text-[#555555] leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Security and IP */}
      <section aria-labelledby="security-heading" className={sectionClass}>
        <div className="space-y-4 max-w-3xl">
          <SectionHeading id="security-heading" label="Security and IP" title="Your systems, your IP." />
          <p className="text-sm text-[#555555] leading-relaxed">
            Our engineers work inside your environment, and everything they build is yours.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SECURITY.map(item => (
            <div key={item.title} className={card}>
              <h3 className="text-lg font-display font-medium tracking-tight text-[#0A0A0A]">{item.title}</h3>
              <p className="mt-2 text-sm text-[#555555] leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-[#555555]">Data processing terms are available on request.</p>
      </section>
      {/* 6. The "Book a 30-minute call" band follows above the footer, as on every page */}
    </div>
  );
}

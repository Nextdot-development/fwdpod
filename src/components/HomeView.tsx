import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Check, ChevronRight } from 'lucide-react';
import SEO from './SEO';
import { trackCtaClick } from '../utils/analytics';
import {
  TIME_TO_START,
  SHORTLIST_TIME,
  PILOT_LENGTH,
  NOTICE_PERIOD,
  REPLACEMENT_WINDOW,
  US_OVERLAP_HOURS,
  LLMOPS_POD_SIZE,
  HOURLY_FROM,
} from '../content/business-facts';

// ── Page metadata ────────────────────────────────────────────────────────────
const PAGE_TITLE = 'AI Engineers and AI Pods from India | Fwdpod';
const PAGE_DESCRIPTION =
  'Add pre-vetted senior AI engineers from India to your team: one specialist or a full AI pod, hourly or full-time.';

// Booking goes through the contact page form.
const BOOKING_PATH = '/contact';

// ── Home page JSON-LD: Organization + WebSite + WebPage ──────────────────────
const HOME_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://www.fwdpod.com/#organization',
      'name': 'Fwdpod',
      'alternateName': 'Fwdpod.com',
      'url': 'https://www.fwdpod.com/',
      // TODO(assets): favicon.svg stands in for a logo; replace with a real logo image
      'logo': {
        '@type': 'ImageObject',
        '@id': 'https://www.fwdpod.com/#logo',
        'url': 'https://www.fwdpod.com/favicon.svg',
        'contentUrl': 'https://www.fwdpod.com/favicon.svg',
        'caption': 'Fwdpod logo'
      },
      // TODO(profiles): Clutch, G2, Crunchbase and LinkedIn profile URLs
      'sameAs': [],
      'description': 'Fwdpod places pre-vetted senior AI engineers from India inside enterprise teams: one specialist or a full AI engineering pod of 4–6 people, hourly or full-time, for AI agents, RAG systems, voice AI and LLMOps.',
      'slogan': 'AI engineering pods',
      'knowsAbout': [
        'AI Engineering',
        'LLM Development',
        'RAG Systems',
        'AI Agents',
        'Voice AI',
        'Compliance AI',
        'LLMOps',
        'Team Augmentation',
        'Data Annotation',
        'Machine Learning'
      ],
      'contactPoint': [
        {
          '@type': 'ContactPoint',
          'email': 'contact.fwdpod@gmail.com',
          'contactType': 'customer support',
          'areaServed': 'Worldwide',
          'availableLanguage': ['English']
        }
      ]
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.fwdpod.com/#website',
      'url': 'https://www.fwdpod.com/',
      'name': 'Fwdpod',
      'description': 'AI engineers and AI engineering pods from India',
      'publisher': { '@id': 'https://www.fwdpod.com/#organization' },
      'inLanguage': 'en-US',
      'copyrightYear': '2026'
    },
    {
      '@type': 'WebPage',
      '@id': 'https://www.fwdpod.com/#home',
      'url': 'https://www.fwdpod.com/',
      'name': PAGE_TITLE,
      'description': PAGE_DESCRIPTION,
      'isPartOf': { '@id': 'https://www.fwdpod.com/#website' },
      'about': { '@id': 'https://www.fwdpod.com/#organization' },
      'breadcrumb': {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.fwdpod.com/' }
        ]
      }
    }
  ]
};

// ── Page content ─────────────────────────────────────────────────────────────
const CHALLENGES = [
  {
    title: 'Hiring is slow',
    text: 'Senior AI engineers take months to recruit, and the best ones get counter-offers.',
  },
  {
    title: 'Large firms are heavy',
    text: 'Big consultancies add layers, long statements of work and high day rates.',
  },
  {
    title: "Freelancers don't own outcomes",
    text: 'Single contractors rarely cover data, build, deployment and support together.',
  },
];

const ENGAGEMENT_MODELS = [
  {
    name: 'Individual specialists',
    tagline: 'Fill one skill gap, fast.',
    points: [
      'Works inside your team, tools and stand-ups',
      'Hourly or monthly full-time',
      'From data annotators to forward deployed engineers',
    ],
    bestFor: 'adding capacity to a team you already run',
  },
  {
    name: 'AI pods',
    tagline: 'Hand over a full workstream.',
    points: [
      '4–6 engineers who already work together',
      'One pod lead accountable to you',
      'Covers build, deployment and support',
    ],
    bestFor: 'shipping an agent, RAG system or voice product end to end',
  },
];

const SKILL_GROUPS = [
  { area: 'Data and evaluation', roles: 'Data annotators, RLHF and evaluation specialists, data QA analysts' },
  { area: 'Data engineering', roles: 'Data engineers, pipeline and vector database specialists' },
  { area: 'Build', roles: 'LLM engineers, RAG engineers, agent developers, full-stack AI developers' },
  { area: 'Voice and multimodal', roles: 'Voice AI engineers, speech and computer vision specialists' },
  { area: 'Run', roles: 'MLOps and LLMOps engineers, cloud and DevOps, AI monitoring' },
  { area: 'Lead and integrate', roles: 'Forward deployed engineers, AI solution architects, pod leads' },
];

const PODS = [
  {
    name: 'Agent Development Pod',
    text: 'Builds AI agents that automate workflows across your systems.',
    size: '5 people',
    timeline: '10–14 weeks to production',
  },
  {
    name: 'RAG and Knowledge Pod',
    text: 'Connects LLMs to your documents and data, with accuracy testing.',
    size: '4 people',
    timeline: '8–12 weeks',
  },
  {
    name: 'Voice AI Pod',
    text: 'Builds real-time voice agents for support, scheduling and intake.',
    size: '5 people',
    timeline: '8–12 weeks',
  },
  {
    name: 'Compliance AI Pod',
    text: 'Adds privacy filters, audit logs and safety testing to AI systems.',
    size: '6 people',
    timeline: '12–16 weeks',
  },
  {
    name: 'LLMOps Pod',
    text: 'Deploys, monitors and controls the cost of models in production.',
    size: `${LLMOPS_POD_SIZE} people`,
    timeline: 'ongoing',
  },
  {
    name: 'Custom Pod',
    text: 'Built around your stack, your data and your goal.',
    size: '4–6 people',
    timeline: 'scoped together',
    highlighted: true,
  },
];

const PRICING = [
  {
    name: 'Hourly',
    price: `From ${HOURLY_FROM}/hour`,
    text: 'Pay for hours worked. Good for short tasks, audits and surge capacity.',
    cta: 'Book a 30-minute call',
  },
  {
    name: 'Daily',
    text: 'Book a call with our team to discuss your requirements and pricing.',
    cta: 'Book a Call with Our Team',
  },
  {
    name: 'Monthly',
    text: 'A full-time engineer or pod on your team. Book a call with our team to discuss your requirements and pricing.',
    cta: 'Book a Call with Our Team',
  },
];

const STEPS = [
  { name: 'Scope', text: 'A 30-minute call on the roles or the outcome you need.' },
  { name: 'Shortlist', text: `Profiles of vetted engineers, or a pod plan, within ${SHORTLIST_TIME}.` },
  { name: 'Interview', text: 'You interview and choose. No commitment until you do.' },
  { name: 'Start', text: `Onboard to your tools. Optional ${PILOT_LENGTH} paid pilot to prove fit.` },
];

const WHY_INDIA = [
  "One of the world's deepest pools of engineering talent",
  `Work moves overnight, with ${US_OVERLAP_HOURS} of daily overlap with US teams`,
  'Senior skills at a fraction of US hiring cost',
  'English-first teams used to working with global clients',
];

const WHY_FWDPOD = [
  "AI only. We don't staff general IT.",
  'Engineers trained and vetted at our AI Capability Center in Jamshedpur, India',
  'Backed by Nextdot: 8 years of enterprise delivery for leading healthcare and pharma brands',
  'Partner programs: Anthropic Claude Partner Network, ElevenLabs, Sarvam AI',
];

const SECURITY = [
  { title: 'Your environment', text: 'Engineers work in your systems, under your access and device policies.' },
  { title: 'Your IP', text: 'Full IP assignment and an NDA signed by every engineer.' },
  { title: 'Vetted people', text: 'Technical tests and live interviews before anyone starts.' },
  { title: 'Continuity', text: `Documented handovers, named backups and free replacement within ${REPLACEMENT_WINDOW}.` },
  { title: 'Compliance', text: 'Data processing terms available on request.' },
  { title: 'Easy contracting', text: 'One master agreement and USD invoicing.' },
];

const CASE_STUDIES = [
  {
    sector: 'Financial brokerage',
    pod: 'Compliance AI Pod',
    text: 'Built privacy filters that keep sensitive client and trading data out of AI tools.',
    weeks: '6 weeks to live',
    team: '6 engineers',
  },
  {
    sector: 'Logistics network',
    pod: 'Agent Development Pod',
    text: 'AI agents that check invoices and manage delivery dispatch, with automatic error recovery.',
    weeks: '11 weeks to live',
    team: '5 engineers',
  },
  {
    sector: 'Healthcare services',
    pod: 'Voice AI Pod',
    text: 'A voice agent that books patient appointments in real time across many calls at once.',
    weeks: '3 weeks to live',
    team: '5 engineers',
  },
];

// ── Shared styles ────────────────────────────────────────────────────────────
const primaryButton =
  'bg-[#0066FF] text-white hover:bg-[#0055DD] py-3.5 px-8 font-semibold text-sm transition-colors inline-flex items-center justify-center gap-2 rounded-full text-center';
const secondaryButton =
  'border border-[#0A0A0A]/15 hover:border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#0A0A0A]/5 py-3.5 px-8 font-semibold text-sm transition-colors inline-flex items-center justify-center gap-2 rounded-full text-center';
const card = 'border border-zinc-200/85 bg-white p-6 rounded-2xl';
const eyebrow = 'text-[#0066FF] text-xs font-semibold uppercase tracking-widest block';
const h2Class = 'text-3xl font-display font-medium text-[#0A0A0A] tracking-tight';

function SectionHeading({ label, title, id }: { label: string; title: string; id: string }) {
  return (
    <div className="space-y-3">
      <span className={eyebrow}>{label}</span>
      <h2 id={id} className={h2Class}>{title}</h2>
    </div>
  );
}

function BookingLink({ label, source, className }: { label: string; source: string; className: string }) {
  return (
    <Link
      to={BOOKING_PATH}
      onClick={() => trackCtaClick(`${label} (${source})`, BOOKING_PATH)}
      className={className}
    >
      {label}
    </Link>
  );
}

export default function HomeView() {
  const { hash } = useLocation();

  // Scroll to a section when the URL has an anchor (e.g. /#pricing). Deferred so
  // it runs after App's scroll-to-top on route change.
  useEffect(() => {
    if (!hash) return;
    const timer = window.setTimeout(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [hash]);

  return (
    <div className="space-y-20 md:space-y-24 bg-white">
      <SEO title={PAGE_TITLE} description={PAGE_DESCRIPTION} jsonLd={HOME_JSON_LD} />

      {/* 1. Hero */}
      <section className="pt-6 md:pt-12 pb-2" aria-labelledby="hero-heading">
        <div className="max-w-3xl space-y-7">
          <h1 id="hero-heading" className="text-4xl sm:text-5xl lg:text-6xl font-display font-medium tracking-tight text-[#0A0A0A] leading-[1.1]">
            Senior AI engineers from India. On your team in {TIME_TO_START}.
          </h1>
          <p className="text-base md:text-lg text-[#555555] leading-relaxed max-w-2xl">
            Add one specialist or a full AI pod, hourly or full-time, to build and run agents, RAG systems, voice AI and LLMOps.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <Link
              to={BOOKING_PATH}
              onClick={() => trackCtaClick('Book a 30-minute call (hero)', BOOKING_PATH)}
              className={primaryButton}
            >
              <span>Book a 30-minute call</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <a
              href="#pods"
              onClick={() => trackCtaClick('See pod options (hero)', '#pods')}
              className={secondaryButton}
            >
              See pod options
            </a>
          </div>
          <p className="text-sm text-[#555555]">For CIOs, CAIOs and engineering leaders.</p>
        </div>
      </section>

      {/* 2. The challenge */}
      <section aria-labelledby="challenge-heading" className="space-y-8">
        <SectionHeading id="challenge-heading" label="The challenge" title="Your AI roadmap is bigger than your team." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CHALLENGES.map(item => (
            <div key={item.title} className={card}>
              <h3 className="text-base font-semibold text-[#0A0A0A]">{item.title}</h3>
              <p className="mt-2 text-sm text-[#555555] leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Two ways to work with us */}
      <section id="services" aria-labelledby="services-heading" className="space-y-8 scroll-mt-6">
        <div className="space-y-4 max-w-3xl">
          <SectionHeading id="services-heading" label="Services" title="Two ways to work with us" />
          <p className="text-base text-[#555555] leading-relaxed">
            We place pre-vetted AI engineers from India inside your team. You direct the work. We handle sourcing, vetting, payroll, retention and replacement.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {ENGAGEMENT_MODELS.map(model => (
            <div key={model.name} className={`${card} p-6 md:p-8 space-y-5`}>
              <div className="space-y-1">
                <h3 className="text-xl font-display font-medium text-[#0A0A0A] tracking-tight">{model.name}</h3>
                <p className="text-sm font-medium text-[#0066FF]">{model.tagline}</p>
              </div>
              <ul className="space-y-2.5">
                {model.points.map(point => (
                  <li key={point} className="flex gap-2.5 text-sm text-[#555555] leading-relaxed">
                    <Check className="w-4 h-4 mt-0.5 text-[#0066FF] shrink-0" aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <p className="pt-4 border-t border-[#0A0A0A]/10 text-sm text-[#0A0A0A]">
                <span className="font-semibold">Best for:</span> {model.bestFor}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Skills we deploy */}
      <section aria-labelledby="skills-heading" className="space-y-8">
        <SectionHeading id="skills-heading" label="Skills we deploy" title="Every role across the AI lifecycle." />
        <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-[#0A0A0A]/10">
          {SKILL_GROUPS.map(group => (
            <div key={group.area} className="py-5 md:pr-8 border-b border-[#0A0A0A]/10">
              <dt className="text-sm font-semibold text-[#0A0A0A]">{group.area}</dt>
              <dd className="mt-1.5 text-sm text-[#555555] leading-relaxed">{group.roles}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 5. Pod options */}
      <section
        id="pods"
        aria-labelledby="pods-heading"
        className="space-y-8 p-6 md:p-10 rounded-3xl scroll-mt-6"
        style={{ backgroundColor: '#fafafa' }}
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <SectionHeading id="pods-heading" label="Pod options" title="The pods we deploy most." />
          <Link
            to="/catalogue"
            className="text-sm font-medium text-[#0066FF] hover:underline inline-flex items-center gap-1 self-start md:self-auto py-2"
          >
            <span>See all pods</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PODS.map(pod => (
            <div
              key={pod.name}
              className={`p-6 rounded-2xl flex flex-col justify-between gap-5 ${
                pod.highlighted ? 'bg-[#0A0A0A] text-white border border-[#0A0A0A]' : 'bg-white border border-zinc-200/85'
              }`}
            >
              <div className="space-y-2">
                <h3 className={`text-lg font-display font-medium tracking-tight ${pod.highlighted ? 'text-white' : 'text-[#0A0A0A]'}`}>
                  {pod.name}
                </h3>
                <p className={`text-sm leading-relaxed ${pod.highlighted ? 'text-zinc-300' : 'text-[#555555]'}`}>{pod.text}</p>
              </div>
              <p className={`text-xs font-semibold ${pod.highlighted ? 'text-white' : 'text-[#0066FF]'}`}>
                {pod.size} · {pod.timeline}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Pricing */}
      <section id="pricing" aria-labelledby="pricing-heading" className="space-y-8 scroll-mt-6">
        <SectionHeading id="pricing-heading" label="Pricing" title="Simple ways to work with us." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PRICING.map(plan => (
            <div key={plan.name} className={`${card} flex flex-col justify-between gap-6`}>
              <div className="space-y-3">
                <h3 className="text-lg font-display font-medium text-[#0A0A0A] tracking-tight">{plan.name}</h3>
                {plan.price && <p className="text-2xl font-display font-medium text-[#0A0A0A]">{plan.price}</p>}
                <p className="text-sm text-[#555555] leading-relaxed">{plan.text}</p>
              </div>
              <BookingLink
                label={plan.cta}
                source={`pricing ${plan.name.toLowerCase()}`}
                className={`${plan.price ? primaryButton : secondaryButton} w-full px-5`}
              />
            </div>
          ))}
        </div>
        <p className="text-sm text-[#555555]">
          Scale up or down with {NOTICE_PERIOD} notice. Free replacement within {REPLACEMENT_WINDOW} if someone isn't the right fit.
        </p>
      </section>

      {/* 7. How we start */}
      <section id="how-we-work" aria-labelledby="how-heading" className="space-y-8 scroll-mt-6">
        <SectionHeading id="how-heading" label="How we work" title={`From first call to first commit in ${TIME_TO_START}.`} />
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((step, idx) => (
            <li key={step.name} className={card}>
              <span className="text-xs font-mono font-semibold text-[#0066FF]">Step {idx + 1}</span>
              <h3 className="mt-2 text-base font-semibold text-[#0A0A0A]">{step.name}</h3>
              <p className="mt-1.5 text-sm text-[#555555] leading-relaxed">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 8. Why India, why Fwdpod */}
      <section aria-labelledby="why-heading" className="space-y-8">
        <SectionHeading id="why-heading" label="Why us" title="Why India, why Fwdpod" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { title: 'Why India', items: WHY_INDIA },
            { title: 'Why Fwdpod', items: WHY_FWDPOD },
          ].map(column => (
            <div key={column.title} className={`${card} p-6 md:p-8 space-y-4`}>
              <h3 className="text-xl font-display font-medium text-[#0A0A0A] tracking-tight">{column.title}</h3>
              <ul className="space-y-3">
                {column.items.map(item => (
                  <li key={item} className="flex gap-2.5 text-sm text-[#555555] leading-relaxed">
                    <Check className="w-4 h-4 mt-0.5 text-[#0066FF] shrink-0" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 9. Security and procurement */}
      <section aria-labelledby="security-heading" className="space-y-8">
        <SectionHeading id="security-heading" label="Security and procurement" title="Built to pass your security review." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SECURITY.map(item => (
            <div key={item.title} className={card}>
              <h3 className="text-base font-semibold text-[#0A0A0A]">{item.title}</h3>
              <p className="mt-2 text-sm text-[#555555] leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 10. Case studies */}
      <section id="case-studies" aria-labelledby="cases-heading" className="space-y-8 scroll-mt-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <SectionHeading id="cases-heading" label="Case studies" title="Recent pods in production." />
          <Link
            to="/live-pods"
            className="text-sm font-medium text-[#0066FF] hover:underline inline-flex items-center gap-1 self-start md:self-auto py-2"
          >
            <span>See case studies</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CASE_STUDIES.map(item => (
            <div key={item.sector} className={`${card} flex flex-col justify-between gap-5`}>
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#555555]">{item.sector}</span>
                <h3 className="text-base font-semibold text-[#0A0A0A]">{item.pod}</h3>
                <p className="text-sm text-[#555555] leading-relaxed">{item.text}</p>
              </div>
              <p className="pt-3 border-t border-[#0A0A0A]/10 text-xs font-semibold text-[#0A0A0A]">
                {item.weeks} · {item.team}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 11. Book a call */}
      <section
        aria-labelledby="book-heading"
        className="bg-[#0A0A0A] text-white p-8 md:p-12 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="space-y-2 max-w-2xl">
          <h2 id="book-heading" className="text-2xl md:text-3xl font-display font-medium tracking-tight text-white">
            Tell us the role or the outcome.
          </h2>
          <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
            We'll send matched profiles or a pod plan within {SHORTLIST_TIME}.
          </p>
        </div>
        <BookingLink label="Book a 30-minute call" source="final CTA" className={`${primaryButton} shrink-0`} />
      </section>
    </div>
  );
}

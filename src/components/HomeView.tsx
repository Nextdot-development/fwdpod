import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Check, ChevronRight } from 'lucide-react';
import SEO from './SEO';
import { trackCtaClick } from '../utils/analytics';
import TwoWaysToWork from './marketing/TwoWaysToWork';
import {
  BOOKING_PATH,
  primaryButton,
  secondaryButton,
  cardHover,
  card,
  sectionClass,
  SectionHeading,
} from './marketing/ui';
import { PODS } from '../content/pods';
import {
  TIME_TO_START,
  SHORTLIST_TIME,
  PILOT_LENGTH,
  REPLACEMENT_WINDOW,
  US_OVERLAP_HOURS,
} from '../content/business-facts';

// ── Page metadata ────────────────────────────────────────────────────────────
const PAGE_TITLE = 'AI Engineers and AI Pods from India | Fwdpod';
const PAGE_DESCRIPTION =
  'Add pre-vetted senior AI engineers from India to your team: one specialist or a full AI pod, hourly or full-time.';

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

const SKILL_GROUPS = [
  { area: 'Data and evaluation', roles: 'Data annotators, RLHF and evaluation specialists, data QA analysts' },
  { area: 'Data engineering', roles: 'Data engineers, pipeline and vector database specialists' },
  { area: 'Build', roles: 'LLM engineers, RAG engineers, agent developers, full-stack AI developers' },
  { area: 'Voice and multimodal', roles: 'Voice AI engineers, speech and computer vision specialists' },
  { area: 'Run', roles: 'MLOps and LLMOps engineers, cloud and DevOps, AI monitoring' },
  { area: 'Lead and integrate', roles: 'Forward deployed engineers, AI solution architects, pod leads' },
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

// ── Hero diagram: the four roles inside a pod ────────────────────────────────
type PodRole = 'lead' | 'devops' | 'obs' | 'dev';

const POD_ROLES: Record<PodRole, { label: string; title: string; role: string }> = {
  lead: {
    label: 'Lead',
    title: 'Pod lead and solution architect',
    role: 'Plans the system, checks quality and security, and is your single point of contact.',
  },
  devops: {
    label: 'DevOps',
    title: 'Deployment and DevOps engineer',
    role: 'Sets up cloud environments, CI/CD pipelines and secure deployment.',
  },
  obs: {
    label: 'Monitoring',
    title: 'Observability and monitoring engineer',
    role: 'Tracks speed, accuracy and model costs once your system is live.',
  },
  dev: {
    label: 'Developers',
    title: 'AI and software developers',
    role: 'Build the agents, voice pipelines and search over your documents that make up your product.',
  },
};

// Hexagon geometry for each node: centre, outer (selected) ring and inner shape
const POD_NODES: { id: PodRole; code: string; cx: number; cy: number; icon: string }[] = [
  { id: 'lead', code: 'LD', cx: 120, cy: 40, icon: 'M -4 2.5 L -5.5 -1.5 L -2.5 0 L 0 -4 L 2.5 0 L 5.5 -1.5 L 4 2.5 Z' },
  { id: 'devops', code: 'DO', cx: 60, cy: 100, icon: 'M -3.5 0 C -3.5 -1.8 -1.2 -1.8 0 0 C 1.2 1.8 3.5 1.8 3.5 0 C 3.5 -1.8 1.2 -1.8 0 0 C -1.2 1.8 -3.5 1.8 -3.5 0 Z' },
  { id: 'obs', code: 'OB', cx: 180, cy: 100, icon: 'M -4.5 0 L -2.5 2.5 L 0 -3.5 L 2.5 3.5 L 4.5 0' },
  { id: 'dev', code: 'DV', cx: 120, cy: 160, icon: 'M -3.5 -2.5 L -5.5 0 L -3.5 2.5 M 3.5 -2.5 L 5.5 0 L 3.5 2.5' },
];

const hexPoints = (cx: number, cy: number, r: number) =>
  [0, 1, 2, 3, 4, 5]
    .map(i => {
      const a = (Math.PI / 3) * i - Math.PI / 2;
      return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
    })
    .join(' ');

function PodDiagram() {
  const [selected, setSelected] = useState<PodRole>('lead');
  const verticalActive = selected === 'lead' || selected === 'dev';
  const horizontalActive = selected === 'devops' || selected === 'obs';

  return (
    <div className={`lg:col-span-5 w-full max-w-xl mx-auto lg:mr-0 border border-zinc-200/80 p-5 md:p-6 bg-white rounded-3xl shadow-sm ${cardHover}`}>
      <div className="mb-3 text-[10px] font-mono tracking-widest text-[#555555] font-bold uppercase">
        Fig 1.0 // Inside an AI pod
      </div>

      <div className="relative h-64 md:h-72 xl:h-80 border border-zinc-100 bg-zinc-50/30 rounded-2xl overflow-hidden">
        <svg width="100%" height="100%" className="absolute inset-0" viewBox="0 0 240 200" role="group" aria-label="The four roles in an AI pod. Select a role to read what it does.">
          <defs>
            <pattern id="node-grid" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.75" fill="#e4e4e7" />
            </pattern>
            <marker id="arrow-start" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#a1a1aa" opacity="0.6" />
            </marker>
            <marker id="arrow-end" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#a1a1aa" opacity="0.6" />
            </marker>
            <marker id="arrow-blue-start" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#0066FF" />
            </marker>
            <marker id="arrow-blue-end" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#0066FF" />
            </marker>
          </defs>
          <rect width="100%" height="100%" fill="url(#node-grid)" />

          <circle cx="120" cy="100" r="70" stroke="#f4f4f5" strokeWidth="1" strokeDasharray="4,4" fill="none" />
          <circle cx="120" cy="100" r="45" stroke="#f4f4f5" strokeWidth="1" strokeDasharray="3,3" fill="none" />

          {['M 120 40 L 60 100', 'M 120 40 L 180 100', 'M 60 100 L 120 160', 'M 180 100 L 120 160'].map(d => (
            <path key={d} d={d} stroke="#d4d4d8" strokeWidth="1" strokeDasharray="3,3" fill="none" markerStart="url(#arrow-start)" markerEnd="url(#arrow-end)" />
          ))}

          {[
            { d: 'M 120 40 L 120 160', active: verticalActive },
            { d: 'M 60 100 L 180 100', active: horizontalActive },
          ].map(({ d, active }) => (
            <path
              key={d}
              d={d}
              stroke={active ? '#0066FF' : '#d4d4d8'}
              strokeOpacity={active ? 1 : 0.4}
              strokeWidth={active ? 2 : 1}
              fill="none"
              markerStart={active ? 'url(#arrow-blue-start)' : 'url(#arrow-start)'}
              markerEnd={active ? 'url(#arrow-blue-end)' : 'url(#arrow-end)'}
              className="transition-all duration-300"
            />
          ))}

          {/* Dots moving along the links between roles */}
          <circle r="2.5" fill="#0066FF">
            <animateMotion dur="4s" repeatCount="indefinite" path="M 120 40 L 60 100 L 120 160 L 180 100 Z" />
          </circle>
          <circle r="2.5" fill="#3b82f6" opacity="0.6">
            <animateMotion dur="4s" begin="-2s" repeatCount="indefinite" path="M 120 40 L 60 100 L 120 160 L 180 100 Z" />
          </circle>
          <circle r="2" fill="#0066FF">
            <animateMotion dur="3s" repeatCount="indefinite" path="M 120 40 L 120 160" />
          </circle>
          <circle r="2" fill="#0066FF">
            <animateMotion dur="3s" repeatCount="indefinite" path="M 60 100 L 180 100" />
          </circle>

          {POD_NODES.map(node => {
            const active = selected === node.id;
            return (
              <g
                key={node.id}
                role="button"
                tabIndex={0}
                aria-label={POD_ROLES[node.id].title}
                aria-pressed={active}
                className="cursor-pointer group select-none focus:outline-none"
                onClick={() => setSelected(node.id)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelected(node.id);
                  }
                }}
              >
                {active && (
                  <polygon points={hexPoints(node.cx, node.cy, 25)} fill="none" stroke="#0066FF" strokeWidth="1.5" strokeOpacity="0.4" className="animate-pulse" />
                )}
                <polygon
                  points={hexPoints(node.cx, node.cy, 20)}
                  fill={active ? '#0066FF' : '#FFFFFF'}
                  stroke={active ? '#0066FF' : '#09090b'}
                  strokeWidth={active ? 2 : 1.5}
                  className="transition-all duration-300"
                />
                <g transform={`translate(${node.cx}, ${node.cy - 6})`} className="pointer-events-none">
                  <path
                    d={node.icon}
                    fill="none"
                    stroke={active ? '#FFFFFF' : node.id === 'lead' ? '#0066FF' : '#71717a'}
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
                <text
                  x={node.cx}
                  y={node.cy + 11}
                  fontFamily="Inter, system-ui, sans-serif"
                  fontSize="7"
                  fontWeight="800"
                  letterSpacing="0.05em"
                  fill={active ? '#FFFFFF' : '#09090b'}
                  textAnchor="middle"
                >
                  {node.code}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-4 p-4 border border-zinc-100 bg-zinc-50/50 space-y-1.5 min-h-[95px] rounded-2xl" aria-live="polite">
        <div className="text-[10px] font-mono text-[#0066FF] uppercase font-bold tracking-widest">
          Role: {POD_ROLES[selected].label}
        </div>
        <p className="text-base font-bold text-[#0A0A0A]">{POD_ROLES[selected].title}</p>
        <p className="text-sm text-[#555555] leading-relaxed">{POD_ROLES[selected].role}</p>
      </div>
    </div>
  );
}

export default function HomeView() {
  const { hash } = useLocation();

  // Scroll to a section when the URL has an anchor (e.g. /#pods). Deferred so
  // it runs after App's scroll-to-top on route change.
  useEffect(() => {
    if (!hash) return;
    const timer = window.setTimeout(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [hash]);

  return (
    <div className="bg-white">
      <SEO title={PAGE_TITLE} description={PAGE_DESCRIPTION} jsonLd={HOME_JSON_LD} />

      {/* 1. Hero */}
      <section className="min-h-[calc(100svh-5rem)] py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 items-center content-center" aria-labelledby="hero-heading">
        <div className="lg:col-span-7 space-y-7">
          <h1 id="hero-heading" className="text-4xl sm:text-5xl lg:text-6xl font-display font-medium tracking-tight text-[#0A0A0A] leading-[1.10] text-balance">
            <span className="block">Senior AI engineers from India.</span>{' '}
            <span className="block text-[#0066FF]">
              On your team in <span className="whitespace-nowrap">{TIME_TO_START}.</span>
            </span>
          </h1>
          <p className="text-base text-[#555555] leading-relaxed max-w-lg">
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
          <p className="text-xs font-medium text-[#555555]">For CIOs, CAIOs and engineering leaders.</p>
        </div>

        <PodDiagram />
      </section>

      {/* 2. The challenge */}
      <section aria-labelledby="challenge-heading" className={sectionClass}>
        <SectionHeading id="challenge-heading" label="The challenge" title="Your AI roadmap is bigger than your team." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CHALLENGES.map(item => (
            <div key={item.title} className={card}>
              <h3 className="text-lg font-display font-medium tracking-tight text-[#0A0A0A]">{item.title}</h3>
              <p className="mt-2 text-sm text-[#555555] leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Two ways to work with us */}
      <TwoWaysToWork id="services" />

      {/* 4. Skills we deploy */}
      <section aria-labelledby="skills-heading" className={sectionClass}>
        <SectionHeading id="skills-heading" label="Skills we deploy" title="Every role across the AI lifecycle." />
        <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-[#0A0A0A]/10">
          {SKILL_GROUPS.map(group => (
            <div key={group.area} className="group py-5 md:pr-8 border-b border-[#0A0A0A]/10 transition-colors hover:border-[#0066FF]">
              <dt className="text-lg font-display font-medium tracking-tight text-[#0A0A0A] transition-colors group-hover:text-[#0066FF]">{group.area}</dt>
              <dd className="mt-1.5 text-sm text-[#555555] leading-relaxed">{group.roles}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 5. Pod options */}
      <section
        id="pods"
        aria-labelledby="pods-heading"
        className={sectionClass}
      >
        <div className="space-y-10 md:space-y-12 p-6 md:p-10 rounded-3xl" style={{ backgroundColor: '#fafafa' }}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <SectionHeading id="pods-heading" label="Pod options" title="The pods we deploy most." />
            <Link
              to="/catalogue"
              className="text-xs font-medium text-[#0066FF] hover:underline inline-flex items-center gap-1 self-start md:self-auto py-2"
            >
              <span>See all pods</span>
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PODS.map(pod => (
              <div
                key={pod.name}
                className={`p-6 md:p-8 rounded-2xl flex flex-col justify-between gap-5 ${cardHover} ${
                  pod.highlighted ? 'bg-[#0A0A0A] text-white border border-[#0A0A0A]' : 'bg-white border border-zinc-200/85'
                }`}
              >
                <div className="space-y-2">
                  <h3 className={`text-lg font-display font-medium tracking-tight ${pod.highlighted ? 'text-white' : 'text-[#0A0A0A]'}`}>
                    {pod.name}
                  </h3>
                  <p className={`text-sm leading-relaxed ${pod.highlighted ? 'text-zinc-300' : 'text-[#555555]'}`}>{pod.builds}</p>
                </div>
                <p className={`text-[11px] font-mono font-medium ${pod.highlighted ? 'text-white' : 'text-[#0066FF]'}`}>
                  {pod.size} · {pod.timeline}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. How we start */}
      <section id="how-we-work" aria-labelledby="how-heading" className={sectionClass}>
        <SectionHeading id="how-heading" label="How we work" title={`From first call to first commit in ${TIME_TO_START}.`} />
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, idx) => (
            <li key={step.name} className={card}>
              <span className="text-xs font-mono font-semibold text-[#0066FF]">Step {idx + 1}</span>
              <h3 className="mt-2 text-lg font-display font-medium tracking-tight text-[#0A0A0A]">{step.name}</h3>
              <p className="mt-1.5 text-sm text-[#555555] leading-relaxed">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 7. Why India, why Fwdpod */}
      <section aria-labelledby="why-heading" className={sectionClass}>
        <SectionHeading id="why-heading" label="Why us" title="Why India, why Fwdpod" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      {/* 8. Security and procurement */}
      <section aria-labelledby="security-heading" className={sectionClass}>
        <SectionHeading id="security-heading" label="Security and procurement" title="Built to pass your security review." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SECURITY.map(item => (
            <div key={item.title} className={card}>
              <h3 className="text-lg font-display font-medium tracking-tight text-[#0A0A0A]">{item.title}</h3>
              <p className="mt-2 text-sm text-[#555555] leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 9. Case studies */}
      <section id="case-studies" aria-labelledby="cases-heading" className={sectionClass}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <SectionHeading id="cases-heading" label="Case studies" title="Recent pods in production." />
          <Link
            to="/live-pods"
            className="text-xs font-medium text-[#0066FF] hover:underline inline-flex items-center gap-1 self-start md:self-auto py-2"
          >
            <span>See case studies</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CASE_STUDIES.map(item => (
            <div key={item.sector} className={`${card} flex flex-col justify-between gap-5`}>
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#555555]">{item.sector}</span>
                <h3 className="text-lg font-display font-medium tracking-tight text-[#0A0A0A]">{item.pod}</h3>
                <p className="text-sm text-[#555555] leading-relaxed">{item.text}</p>
              </div>
              <p className="pt-3 border-t border-[#0A0A0A]/10 text-[10px] font-mono text-[#555555]">
                {item.weeks} · {item.team}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

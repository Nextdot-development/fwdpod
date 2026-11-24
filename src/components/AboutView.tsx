/**
 * /about — rebuilt from the developer handoff dated 23 Nov 2026. Copy is word
 * for word.
 *
 * Not approved, leave out: names, photos, job titles or LinkedIn links of any
 * founder or leader; any quote; any statistic (engineers, years, clients);
 * client logos, case studies or testimonials; legal name and address;
 * certifications or badges; awards, press, or any partner other than the
 * three below; stock photos. The closing black banner is BookCallBand in App.tsx.
 */
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bot,
  Clock,
  Cpu,
  Database,
  FileCheck,
  Library,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import SEO, { SITE_BASE_URL } from './SEO';
import { eyebrow, card, h2Class, sectionClass } from './marketing/ui';
import FaqCards from './marketing/FaqCards';
import { CAPABILITY_CENTER_NAME, NEXTDOT_LINE, PARTNER_PROGRAMS } from '../content/company';
import { PILOT_LENGTH } from '../content/business-facts';

const PAGE_PATH = '/about';
const PAGE_URL = `${SITE_BASE_URL}${PAGE_PATH}`;
const PAGE_TITLE = 'About | Fwdpod';
// The handoff gives no meta description; this is its H1 and sub-line.
const PAGE_DESCRIPTION = 'A team that works only on AI. Senior AI engineers from India, working as part of your team.';

// The handoff writes this range with a plain hyphen; kept as written.
const US_OVERLAP = '3-4 hours';

// Body text at the site's standard size (as on How we work, Case studies, Contact)
const bodyText = 'text-sm text-[#555555] leading-relaxed';
// Sections alternate between a light panel and plain white
// Less padding than sectionClass, top and bottom, so the panels feel tighter
const lightPanel = 'bg-zinc-50 rounded-3xl px-6 md:px-10 !pt-8 md:!pt-10 !pb-8 md:!pb-10';
const tileTitle = 'text-lg font-display font-medium tracking-tight text-[#0A0A0A]';
const iconClass = 'w-5 h-5 text-[#0066FF]';

// Step 3: What we do. All six solution pages are live, so each card links.
const LAYERS: { title: string; text: string; href: string; icon: LucideIcon; crossCutting?: boolean }[] = [
  { title: 'Agents and applications', text: 'AI that does the work inside your business systems.', href: '/solutions/ai-agents', icon: Bot },
  { title: 'Context and knowledge', text: 'AI that knows your business and respects who can see what.', href: '/solutions/rag', icon: Library },
  { title: 'Models', text: 'The right model for each job, at the right cost.', href: '/solutions/models', icon: Cpu },
  { title: 'Data and annotation', text: 'Clean, labelled data your AI can learn from and be tested against.', href: '/solutions/data-annotation', icon: Database },
  { title: 'Trust and compliance', text: 'Safety checks, records and testing for your AI.', href: '/solutions/ai-compliance', icon: ShieldCheck, crossCutting: true },
  { title: 'Operations (LLMOps)', text: 'AI that stays up, stays accurate and stays on budget.', href: '/solutions/llmops', icon: Activity, crossCutting: true },
];

// Step 6: Why India
const WHY_INDIA: { title: string; text: string; icon: LucideIcon }[] = [
  { title: 'Skilled engineers', text: 'Senior AI engineers who build agents, search over your documents, voice AI and more.', icon: Users },
  { title: 'Time overlap', text: `${US_OVERLAP} of daily overlap with US time zones.`, icon: Clock },
  // [CONFIRM wording. No figures were given, and none should be added.]
  { title: 'Value for money', text: 'Working with India-based engineers helps your budget go further.', icon: Wallet },
];

// Step 7: Why Fwdpod
const WHY_FWDPOD: { title: string; text: string; icon: LucideIcon }[] = [
  { title: 'We focus only on AI', text: 'Everything we do is about building and running AI.', icon: Sparkles },
  { title: 'One lead for each pod', text: 'Every pod has its own lead who is responsible for the result.', icon: UserCheck },
  { title: 'Clear measures', text: 'Pods report on measures we agree with you.', icon: BarChart3 },
  { title: 'You own the code', text: 'Every engineer signs an NDA and a full IP assignment.', icon: FileCheck },
];

// Step 8: How we work with you
const GROWTH = [
  { name: 'Prove', text: `a ${PILOT_LENGTH} paid pilot on one use case, at a fixed fee.` },
  { name: 'Build', text: 'a dedicated team takes it to production.' },
  { name: 'Run', text: 'managed AI operations keep it up, accurate and on budget.' },
];

// Step 10: one list feeds the accordion and the FAQPage schema.
export const ABOUT_FAQS = [
  { q: 'Who is behind Fwdpod?', a: `Fwdpod is ${NEXTDOT_LINE.charAt(0).toLowerCase()}${NEXTDOT_LINE.slice(1)}.` },
  {
    q: 'Where is your team based?',
    a: 'Our AI Capability Center is in Jamshedpur, India. Our engineers are senior AI engineers from India.',
  },
  {
    q: 'Do your engineers work in US hours?',
    a: `They overlap with US time zones for ${US_OVERLAP} every day. They join your Slack or Teams and your stand-up meetings.`,
  },
];

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'AboutPage',
      '@id': `${PAGE_URL}#webpage`,
      'url': PAGE_URL,
      'name': PAGE_TITLE,
      'description': PAGE_DESCRIPTION,
      'isPartOf': { '@id': `${SITE_BASE_URL}/#website` },
      'about': { '@id': `${SITE_BASE_URL}/#organization` },
    },
    {
      '@type': 'FAQPage',
      '@id': `${PAGE_URL}#faq`,
      'url': PAGE_URL,
      'mainEntity': ABOUT_FAQS.map(faq => ({
        '@type': 'Question',
        'name': faq.q,
        'acceptedAnswer': { '@type': 'Answer', 'text': faq.a },
      })),
    },
  ],
};

function Tile({ title, text, icon: Icon }: { title: string; text: string; icon: LucideIcon }) {
  return (
    <li className={`${card} space-y-3`}>
      <Icon className={iconClass} aria-hidden="true" />
      <h3 className={tileTitle}>{title}</h3>
      <p className="text-sm text-[#555555] leading-relaxed">{text}</p>
    </li>
  );
}

export default function AboutView() {
  return (
    <div className="bg-white animate-page-enter">
      <SEO title={PAGE_TITLE} description={PAGE_DESCRIPTION} canonical={PAGE_PATH} jsonLd={JSON_LD} />

      {/* Step 1: Hero: headline and one line, left-aligned, same size as How to engage. No button
          here; the booking button is in the top menu and the black band above the footer. */}
      <section className="pt-2 pb-10 md:pb-12 space-y-3 max-w-3xl" aria-labelledby="about-heading">
        <span className={eyebrow}>About</span>
        <h1 id="about-heading" className="text-4xl md:text-5xl font-display font-medium tracking-tight text-[#0A0A0A] leading-[1.08] text-balance">
          A team that works only on AI.
        </h1>
        <p className="text-sm text-[#555555] max-w-xl leading-relaxed">Senior AI engineers from India, working as part of your team.</p>
      </section>

      {/* Step 2: Who we are */}
      <section aria-labelledby="who-heading" className={`${sectionClass} ${lightPanel}`}>
        <div className="space-y-4">
          <h2 id="who-heading" className={h2Class}>Who we are</h2>
          <p className={bodyText}>
            Fwdpod gives companies senior AI engineers from India. You can start with one specialist or a full AI pod. A
            pod is a ready team with one lead who is responsible for the result. We focus only on AI.
          </p>
        </div>
      </section>

      {/* Step 3: What we do. Less top space, so it sits closer to Who we are. */}
      <section aria-labelledby="what-heading" className={`${sectionClass} !pt-8 md:!pt-10`}>
        <div className="space-y-2">
          <h2 id="what-heading" className={h2Class}>What we do</h2>
          <p className={bodyText}>Four layers to build. Two that run across all of them.</p>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LAYERS.map(({ title, text, href, icon: Icon, crossCutting }) => (
            <li key={href}>
              <Link to={href} className={`${card} group flex flex-col gap-3 h-full`}>
                <div className="flex items-center justify-between gap-3">
                  <Icon className={iconClass} aria-hidden="true" />
                  {crossCutting && (
                    <span className="text-[11px] font-mono font-medium text-[#0066FF] border border-[#0066FF]/30 rounded-full px-2.5 py-0.5">
                      Runs across every layer.
                    </span>
                  )}
                </div>
                <h3 className={`${tileTitle} group-hover:text-[#0066FF] flex items-center gap-1.5`}>
                  {title} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </h3>
                <p className="text-sm text-[#555555] leading-relaxed">{text}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Step 4: Backed by Nextdot. One large line only; no logo until one is approved. */}
      <section aria-labelledby="nextdot-heading" className={`${sectionClass} ${lightPanel} items-center text-center`}>
        <h2 id="nextdot-heading" className="text-2xl md:text-4xl font-display font-medium tracking-tight text-[#0A0A0A]">
          Backed by Nextdot
        </h2>
      </section>

      {/* Step 5: Capability center. No photos supplied, so text only, centered.
          [CONFIRM: the handoff says "Our AI Capability Center." The full name is
          used everywhere else on the site.] */}
      <section aria-labelledby="center-heading" className={`${sectionClass} items-center text-center`}>
        <div className="space-y-4">
          <h2 id="center-heading" className={h2Class}>Our {CAPABILITY_CENTER_NAME}</h2>
          <p className={bodyText}>Our AI Capability Center is in Jamshedpur, India.</p>
        </div>
      </section>

      {/* Step 6: Why India */}
      <section aria-labelledby="india-heading" className={`${sectionClass} ${lightPanel}`}>
        <h2 id="india-heading" className={h2Class}>Why India</h2>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {WHY_INDIA.map(tile => <Tile key={tile.title} {...tile} />)}
        </ul>
      </section>

      {/* Step 7: Why Fwdpod */}
      <section aria-labelledby="why-heading" className={sectionClass}>
        <h2 id="why-heading" className={h2Class}>Why Fwdpod</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {WHY_FWDPOD.map(tile => <Tile key={tile.title} {...tile} />)}
        </ul>
        <p className="-mt-4 text-xs text-[#555555] leading-relaxed">
          NDA means a promise to keep your information private. IP assignment means the ownership of the work goes to you.
        </p>
      </section>

      {/* Step 8: How we work with you. No extra text, no buttons. */}
      <section aria-labelledby="how-heading" className={`${sectionClass} ${lightPanel}`}>
        <div className="space-y-2">
          <h2 id="how-heading" className={h2Class}>How we work with you</h2>
          <p className={bodyText}>Start small, then grow when you are ready.</p>
        </div>
        <ol className="flex flex-col md:flex-row gap-2 md:gap-4 lg:gap-6">
          {GROWTH.map((step, idx) => (
            <li key={step.name} className="flex-1 flex flex-col md:flex-row gap-2 md:gap-4 lg:gap-6">
              <div className="flex-1 bg-white border border-zinc-200/85 rounded-2xl px-5 py-5 md:px-6 space-y-3">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#0066FF] text-white text-xs font-semibold" aria-hidden="true">
                  {idx + 1}
                </span>
                <p className="text-sm text-[#555555] leading-relaxed">
                  <strong className="font-semibold text-[#0A0A0A]">{step.name}:</strong> {step.text}
                </p>
              </div>
              {idx < GROWTH.length - 1 && (
                <span className="flex items-center justify-center text-[#555555]" aria-hidden="true">
                  <ArrowRight className="w-4 h-4 rotate-90 md:rotate-0" />
                </span>
              )}
            </li>
          ))}
        </ol>
      </section>

      {/* Step 9: Our partners. Plain text; no logos until approved files exist.
          [CONFIRM: all three are active, with exact names, before publishing] */}
      <section aria-labelledby="partners-heading" className={sectionClass}>
        <div className="space-y-2">
          <h2 id="partners-heading" className={h2Class}>Our partners</h2>
          <p className={bodyText}>We are part of these partner programs:</p>
        </div>
        <ul className="flex flex-wrap items-center gap-x-3 gap-y-2 text-lg font-display font-medium text-[#0A0A0A]">
          {PARTNER_PROGRAMS.map((partner, idx) => (
            <li key={partner.name} className="flex items-center gap-3">
              {idx > 0 && <span className="text-[#555555]" aria-hidden="true">·</span>}
              <span>{partner.program ? `${partner.name} ${partner.program}` : partner.name}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Step 10: Common questions. Native <details>: opens with or without JavaScript. */}
      <section id="faq" aria-labelledby="faq-heading" className={`${sectionClass} ${lightPanel}`}>
        <h2 id="faq-heading" className={h2Class}>Common questions</h2>
        <FaqCards
          items={ABOUT_FAQS.map(faq => ({ key: faq.q, question: faq.q, answer: faq.a }))}
          className="max-w-3xl"
        />
      </section>

      {/* Step 11: the black "Tell us the role or the outcome." banner is the
          site-wide BookCallBand, rendered once by App.tsx above the footer. */}
    </div>
  );
}

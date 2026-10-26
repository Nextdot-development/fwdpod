import React from 'react';
import { Mail } from 'lucide-react';
import SEO from './SEO';
import BookingForm from './marketing/BookingForm';
import { card, cardHover, sectionClass, SectionHeading } from './marketing/ui';
import { CONTACT_EMAIL } from '../utils/web3forms';
import { trackContactFormSubmit } from '../utils/analytics';
import { REPLACEMENT_WINDOW, REPLY_TIME, SHORTLIST_TIME } from '../content/business-facts';

// ── Page metadata ────────────────────────────────────────────────────────────
const PAGE_TITLE = 'Contact Fwdpod | Book a 30-Minute Call';
const PAGE_DESCRIPTION = `Tell us the role or the outcome you need. We'll send matched AI engineer profiles or a pod plan within ${SHORTLIST_TIME}.`;

const CONTACT_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['WebPage', 'ContactPage'],
      '@id': 'https://www.fwdpod.com/#contact',
      'url': 'https://www.fwdpod.com/contact',
      'name': PAGE_TITLE,
      'description': PAGE_DESCRIPTION,
      'isPartOf': { '@id': 'https://www.fwdpod.com/#website' },
      'about': { '@id': 'https://www.fwdpod.com/#organization' },
      'breadcrumb': {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.fwdpod.com/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Contact', 'item': 'https://www.fwdpod.com/contact' }
        ]
      }
    },
    {
      '@type': 'ContactPoint',
      'contactType': 'sales',
      'email': CONTACT_EMAIL,
      'areaServed': 'Worldwide',
      'availableLanguage': ['English']
    }
  ]
};

// ── Page content ─────────────────────────────────────────────────────────────
const NEXT_STEPS = [
  { name: 'Scope', text: 'A 30-minute call on the roles or the outcome you need.' },
  { name: 'Shortlist', text: `Profiles of vetted engineers, or a pod plan, within ${SHORTLIST_TIME}.` },
  { name: 'Interview and start', text: 'You interview and choose. No commitment until you do.' },
];

const REASSURANCE = [
  { title: 'Your IP', text: 'Full IP assignment and an NDA signed by every engineer.' },
  { title: 'Your environment', text: 'Engineers work in your systems, under your policies.' },
  { title: 'Free replacement', text: `Within ${REPLACEMENT_WINDOW} if someone isn't the right fit.` },
];

interface ContactViewProps {
  /** Kept for App's route wiring; not used by this page. */
  onNavigate: (pageName: string, preselectedPodId?: string) => void;
  triggerNotification?: (msg: string) => void;
}

export default function ContactView(_props: ContactViewProps) {
  return (
    <div className="bg-white animate-page-enter">
      <SEO title={PAGE_TITLE} description={PAGE_DESCRIPTION} jsonLd={CONTACT_JSON_LD} />

      {/* a) Header */}
      <section className="pt-2 space-y-3 max-w-3xl" aria-labelledby="contact-heading">
        <span className="text-[#0066FF] text-xs font-mono font-medium uppercase tracking-widest block">Contact</span>
        <h1 id="contact-heading" className="text-4xl md:text-5xl font-display font-medium tracking-tight text-[#0A0A0A] leading-[1.08]">
          Let's talk about your AI team.
        </h1>
        <p className="text-sm text-[#555555] max-w-xl leading-relaxed">
          Tell us the role or the outcome. We'll send matched profiles or a pod plan within {SHORTLIST_TIME}.
        </p>
      </section>

      {/* b) Form + side panel */}
      <div className="pt-8 pb-12 md:pb-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        <div className="lg:col-span-8">
          <BookingForm
            variant="short"
            sourcePage="/contact"
            labelledBy="contact-heading"
            submitLabel="Book a 30-minute call"
            note={<>We reply within {REPLY_TIME}.</>}
            renderSuccess={({ firstName, email }) => (
              <>
                <h2 className="text-xl font-display font-medium tracking-tight text-[#0A0A0A]">
                  Thanks, {firstName}. We'll be in touch within {REPLY_TIME}.
                </h2>
                <p className="text-sm text-[#555555] leading-relaxed">
                  We'll reply to <strong className="text-[#0A0A0A] font-medium">{email}</strong> to set up the call.
                </p>
              </>
            )}
            onResult={result => trackContactFormSubmit(result)}
          />
        </div>

        <aside className="lg:col-span-4" aria-labelledby="prefer-email-heading">
          <div className={`rounded-3xl border border-zinc-200/85 bg-white p-6 md:p-8 space-y-3 ${cardHover}`}>
            <h2 id="prefer-email-heading" className="text-lg font-display font-medium tracking-tight text-[#0A0A0A]">Prefer email?</h2>
            <p className="text-sm text-[#555555] leading-relaxed">Write to us directly and we'll reply from the same address.</p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center gap-2 text-sm font-medium text-[#0066FF] underline hover:text-[#0055DD] break-all">
              <Mail className="w-4 h-4 shrink-0" aria-hidden="true" />
              {CONTACT_EMAIL}
            </a>
          </div>
        </aside>
      </div>

      {/* c) What happens next */}
      <section aria-labelledby="next-heading" className={sectionClass}>
        <SectionHeading id="next-heading" label="What happens next" title="Three steps to your first engineer." />
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {NEXT_STEPS.map((step, idx) => (
            <li key={step.name} className={card}>
              <span className="text-xs font-mono font-semibold text-[#0066FF]">Step {idx + 1}</span>
              <h3 className="mt-2 text-lg font-display font-medium tracking-tight text-[#0A0A0A]">{step.name}</h3>
              <p className="mt-1.5 text-sm text-[#555555] leading-relaxed">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* d) Reassurance strip */}
      <section aria-label="Your IP and data" className="pb-12 md:pb-16">
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 rounded-3xl bg-zinc-50 border border-zinc-100 p-6 md:p-8">
          {REASSURANCE.map(item => (
            <li key={item.title} className="text-sm text-[#555555] leading-relaxed">
              <span className="font-semibold text-[#0A0A0A]">{item.title}:</span> {item.text}
            </li>
          ))}
        </ul>
      </section>
      {/* e) Location: left out, no address exists on the site yet */}
    </div>
  );
}

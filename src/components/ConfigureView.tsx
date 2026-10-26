import React from 'react';
import SEO from './SEO';
import BookingForm from './marketing/BookingForm';
import { Link } from 'react-router-dom';
import { trackBookingRequest } from '../utils/analytics';
import { SHORTLIST_TIME } from '../content/business-facts';

// ── Page metadata ────────────────────────────────────────────────────────────
const PAGE_TITLE = 'Book a 30-Minute Call | Fwdpod';
const PAGE_DESCRIPTION = `Tell us the role or the outcome you need. We'll send matched profiles of pre-vetted AI engineers, or a pod plan, within ${SHORTLIST_TIME}.`;

const CONFIGURE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://www.fwdpod.com/#configure',
  'url': 'https://www.fwdpod.com/configure',
  'name': PAGE_TITLE,
  'description': PAGE_DESCRIPTION,
  'isPartOf': { '@id': 'https://www.fwdpod.com/#website' },
  'breadcrumb': {
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.fwdpod.com/' },
      { '@type': 'ListItem', 'position': 2, 'name': 'Book a 30-minute call', 'item': 'https://www.fwdpod.com/configure' }
    ]
  }
};

interface ConfigureViewProps {
  /** Kept for App's route wiring; the old configurator pre-selected a pod from it. */
  initialPodId: string | null;
  onClearPodSelection: () => void;
}

export default function ConfigureView(_props: ConfigureViewProps) {
  return (
    <div className="bg-white animate-page-enter">
      <SEO title={PAGE_TITLE} description={PAGE_DESCRIPTION} jsonLd={CONFIGURE_JSON_LD} />

      <div className="max-w-2xl mx-auto pt-2 pb-12 md:pb-16 space-y-8">
        {/* Intro */}
        <section className="space-y-3" aria-labelledby="booking-heading">
          <span className="text-[#0066FF] text-xs font-mono font-medium uppercase tracking-widest block">Book a call</span>
          <h1 id="booking-heading" className="text-4xl md:text-5xl font-display font-medium tracking-tight text-[#0A0A0A] leading-[1.08]">
            Book a 30-minute call
          </h1>
          <p className="text-sm text-[#555555] leading-relaxed">
            Tell us the role or the outcome. We'll send matched profiles or a pod plan within {SHORTLIST_TIME}.
          </p>
        </section>

        <BookingForm
          sourcePage="/configure"
          labelledBy="booking-heading"
          submitLabel="Send request"
          note={<>A general question instead? <Link to="/contact" className="text-[#0066FF] underline hover:text-[#0055DD]">Contact us</Link>.</>}
          renderSuccess={({ firstName, email }) => (
            <>
              <h2 className="text-xl font-display font-medium tracking-tight text-[#0A0A0A]">
                Thanks, {firstName}. Your request is in.
              </h2>
              <p className="text-sm text-[#555555] leading-relaxed">
                We'll reply to <strong className="text-[#0A0A0A] font-medium">{email}</strong> to set up the call,
                and send matched profiles or a pod plan within {SHORTLIST_TIME}.
              </p>
            </>
          )}
          onResult={(result, values) => trackBookingRequest(result, values.need, values.engagement || 'Not given')}
        />
      </div>
    </div>
  );
}

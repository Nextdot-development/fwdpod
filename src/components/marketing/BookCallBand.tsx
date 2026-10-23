import React from 'react';
import { BookingLink, primaryButton } from './ui';
import { SHORTLIST_TIME } from '../../content/business-facts';

/** The closing "Book a call" band shown above the footer on every page. */
export default function BookCallBand() {
  return (
    <section
      aria-labelledby="book-heading"
      className="bg-[#0A0A0A] text-white p-8 md:p-12 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6"
    >
      <div className="space-y-2 max-w-2xl">
        <h2 id="book-heading" className="text-2xl md:text-3xl font-display font-medium tracking-tight text-white">
          Tell us the role or the outcome.
        </h2>
        <p className="text-sm text-zinc-300 leading-relaxed">
          We'll send matched profiles or a pod plan within {SHORTLIST_TIME}.
        </p>
      </div>
      <BookingLink label="Book a 30-minute call" source="footer band" className={`${primaryButton} shrink-0`} />
    </section>
  );
}

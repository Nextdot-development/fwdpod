/**
 * Styles and small building blocks shared by the redesigned marketing pages
 * (homepage, pod catalogue), so the pages look and behave the same.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { trackCtaClick } from '../../utils/analytics';

// Booking goes through the contact page form.
export const BOOKING_PATH = '/contact';

export const primaryButton =
  'bg-[#0066FF] text-white hover:bg-[#0055DD] py-3.5 px-8 font-semibold text-sm transition-colors inline-flex items-center justify-center gap-2 rounded-full text-center';
export const secondaryButton =
  'border border-[#0A0A0A]/15 hover:border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#0A0A0A]/5 py-3.5 px-8 font-semibold text-sm transition-colors inline-flex items-center justify-center gap-2 rounded-full text-center';
// Lift, blue border and shadow on hover, as on the catalogue cards
export const cardHover =
  'transition-all duration-300 ease-out hover:border-[#0066FF] hover:shadow-md hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none';
export const card = `border border-zinc-200/85 bg-white p-6 md:p-8 rounded-2xl ${cardHover}`;
export const eyebrow = 'text-[#0066FF] text-xs font-semibold uppercase tracking-widest block';
export const h2Class = 'text-3xl md:text-4xl font-display font-medium text-[#0A0A0A] tracking-tight';

// Sections follow one another with even spacing
export const sectionClass = 'flex flex-col gap-10 md:gap-12 py-12 md:py-16';

export function SectionHeading({ label, title, id }: { label: string; title: string; id: string }) {
  return (
    <div className="space-y-3">
      <span className={eyebrow}>{label}</span>
      <h2 id={id} className={h2Class}>{title}</h2>
    </div>
  );
}

export function BookingLink({ label, source, className }: { label: string; source: string; className: string }) {
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

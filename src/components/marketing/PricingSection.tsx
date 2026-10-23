import React from 'react';
import { BookingLink, card, primaryButton, secondaryButton, sectionClass, SectionHeading } from './ui';
import { HOURLY_FROM, NOTICE_PERIOD, REPLACEMENT_WINDOW } from '../../content/business-facts';

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

/** Hourly, daily and monthly options. Shows no prices beyond the hourly starting rate. */
export default function PricingSection({ id = 'pricing', source }: { id?: string; source: string }) {
  return (
    <section id={id} aria-labelledby="pricing-heading" className={sectionClass}>
      <SectionHeading id="pricing-heading" label="Pricing" title="Simple ways to work with us." />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {PRICING.map(plan => (
          <div key={plan.name} className={`${card} flex flex-col justify-between gap-6`}>
            <div className="space-y-3">
              <h3 className="text-lg font-display font-medium text-[#0A0A0A] tracking-tight">{plan.name}</h3>
              {plan.price && <p className="text-xl font-display font-medium text-[#0A0A0A]">{plan.price}</p>}
              <p className="text-sm text-[#555555] leading-relaxed">{plan.text}</p>
            </div>
            <BookingLink
              label={plan.cta}
              source={`${source} pricing ${plan.name.toLowerCase()}`}
              className={`${plan.price ? primaryButton : secondaryButton} w-full px-5`}
            />
          </div>
        ))}
      </div>
      <p className="text-sm text-[#555555]">
        Scale up or down with {NOTICE_PERIOD} notice. Free replacement within {REPLACEMENT_WINDOW} if someone isn't the right fit.
      </p>
    </section>
  );
}

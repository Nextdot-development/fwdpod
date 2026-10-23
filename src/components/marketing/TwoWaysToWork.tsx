import React from 'react';
import { Check } from 'lucide-react';
import { card, sectionClass, SectionHeading } from './ui';

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

/** "Two ways to work with us": individual specialists vs AI pods. */
export default function TwoWaysToWork({ id }: { id?: string }) {
  return (
    <section id={id} aria-labelledby="services-heading" className={sectionClass}>
      <div className="space-y-4 max-w-3xl">
        <SectionHeading id="services-heading" label="Services" title="Two ways to work with us" />
        <p className="text-base text-[#555555] leading-relaxed">
          We place pre-vetted AI engineers from India inside your team. You direct the work. We handle sourcing, vetting, payroll, retention and replacement.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ENGAGEMENT_MODELS.map(model => (
          <div key={model.name} className={`${card} p-6 md:p-8 space-y-5`}>
            <div className="space-y-1">
              <h3 className="text-xl font-display font-medium text-[#0A0A0A] tracking-tight">{model.name}</h3>
              <p className="text-sm font-medium text-[#0066FF]">{model.tagline}</p>
            </div>
            <ul className="space-y-2.5">
              {model.points.map(point => (
                <li key={point} className="flex gap-2.5 text-sm md:text-base text-[#555555] leading-relaxed">
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
  );
}

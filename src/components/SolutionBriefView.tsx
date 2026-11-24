/**
 * A solution page built from its own page brief: the 12 sections in the
 * briefs' order. Copy lives in src/content/solution-briefs.ts.
 */
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import SEO from './SEO';
import { card, h2Class, sectionClass } from './marketing/ui';
import FaqCards from './marketing/FaqCards';
import type { SolutionBrief } from '../content/solution-briefs';

const label = 'text-[10px] font-mono uppercase tracking-wider text-[#0066FF] block';
const bodyText = 'text-base text-[#555555] leading-relaxed';

export default function SolutionBriefView({ page }: { page: SolutionBrief }) {
  const showTools = page.logos.length > 0 || Boolean(page.toolsNote);

  return (
    <div className="bg-white animate-page-enter">
      <SEO title={page.title} description={page.description} canonical={page.path} />

      {/* 1. Title, H1, subhead */}
      <section className="pt-2 pb-4 space-y-5 max-w-3xl" aria-labelledby="solution-heading">
        <nav aria-label="Breadcrumb" className="text-xs font-mono uppercase tracking-widest">
          <Link to="/our-solutions" className="text-[#555555] hover:text-[#0066FF]">Solutions</Link>
          {page.parent && (
            <>
              <span className="text-[#555555]"> / </span>
              <Link to={page.parent.href} className="text-[#555555] hover:text-[#0066FF]">{page.parent.label}</Link>
            </>
          )}
          <span className="text-[#555555]"> / </span>
          <span className="text-[#0066FF]" aria-current="page">{page.name}</span>
        </nav>
        <h1 id="solution-heading" className="text-4xl md:text-5xl font-display font-medium tracking-tight text-[#0A0A0A] leading-[1.08] text-balance">
          {page.h1 ?? page.name}
        </h1>
        <p className="text-lg md:text-xl text-[#0A0A0A] leading-relaxed">{page.subhead}</p>
      </section>

      {/* 2. Intro */}
      <section className="pb-12 md:pb-16 max-w-3xl">
        <p className={bodyText}>{page.intro}</p>
      </section>

      {/* 3. What it does */}
      <section aria-labelledby="examples-heading" className={sectionClass}>
        <div className="space-y-2">
          <h2 id="examples-heading" className={h2Class}>What it does</h2>
          <p className="text-sm text-[#555555]">Typical examples, not client results</p>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {page.examples.map(item => (
            <li key={item} className="flex gap-3 border border-zinc-200/85 rounded-2xl p-5 text-sm text-[#0A0A0A] leading-relaxed">
              <ArrowRight className="w-4 h-4 mt-0.5 text-[#0066FF] shrink-0" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 4. The problem */}
      <section aria-labelledby="problem-heading" className={sectionClass}>
        <div className="space-y-4 max-w-3xl">
          <h2 id="problem-heading" className={h2Class}>The problem</h2>
          <p className={bodyText}>{page.problem}</p>
        </div>
      </section>

      {/* 5. What we engineer */}
      <section aria-labelledby="engineer-heading" className={sectionClass}>
        <h2 id="engineer-heading" className={h2Class}>What we engineer</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {page.engineer.map(item => (
            <li key={item.title} className="flex gap-3 border border-zinc-200/85 rounded-2xl p-5">
              <Check className="w-4 h-4 mt-0.5 text-[#0066FF] shrink-0" aria-hidden="true" />
              <div className="space-y-1.5 text-sm leading-relaxed">
                <p className="font-medium text-[#0A0A0A]">{item.title}</p>
                {item.detail && <p className="text-[#555555]">{item.detail}</p>}
                {item.see && (
                  <p className="text-[#555555]">
                    See <Link to={item.see.href} className="font-medium text-[#0066FF] hover:underline">{item.see.label}</Link>.
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* 6. The team */}
      <section aria-labelledby="team-heading" className={sectionClass}>
        <h2 id="team-heading" className={h2Class}>The team</h2>
        <div className={`${card} max-w-3xl space-y-3`}>
          {page.team.name && <h3 className="text-lg font-display font-medium tracking-tight text-[#0A0A0A]">{page.team.name}</h3>}
          {page.team.size && <p className="text-xs font-mono font-medium text-[#0066FF]">{page.team.size}</p>}
          {page.team.members && <p className="text-sm text-[#0A0A0A] leading-relaxed">{page.team.members}</p>}
          {page.team.note && <p className="text-sm text-[#555555] leading-relaxed">{page.team.note}</p>}
        </div>
      </section>

      {/* 7. How it runs. Phases hidden until confirmed. */}
      <section aria-labelledby="runs-heading" className={sectionClass}>
        <div className="space-y-4 max-w-3xl">
          <h2 id="runs-heading" className={h2Class}>How it runs</h2>
          <p className={bodyText}>
            {page.timeline && <span className="font-semibold text-[#0A0A0A]">{page.timeline}</span>}
            {page.timeline && page.timelineNote && ' '}
            {page.timelineNote}
          </p>
        </div>
      </section>

      {/* 8. How we measure it */}
      <section aria-labelledby="measure-heading" className={sectionClass}>
        <h2 id="measure-heading" className={h2Class}>How we measure it</h2>
        <ul className={`grid grid-cols-1 gap-4 ${page.measures.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
          {page.measures.map(m => (
            <li key={m.name} className="border border-zinc-200/85 rounded-2xl p-5 space-y-2">
              <p className="text-base font-display font-medium tracking-tight text-[#0A0A0A]">{m.name}</p>
              <p className="text-sm text-[#555555] leading-relaxed">{m.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 9. A real example. [CLIENT PERMISSION NEEDED]: see solution-briefs.ts */}
      <section aria-labelledby="example-heading" className={sectionClass}>
        <h2 id="example-heading" className={h2Class}>A real example</h2>
        {page.example ? (
        <div className={`${card} space-y-4 max-w-3xl`}>
          <p className={label}>{page.example.sector}</p>
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <dt className={label}>Pod</dt>
              <dd className="mt-1 text-[#0A0A0A]">{page.example.pod}</dd>
            </div>
            <div>
              <dt className={label}>Weeks</dt>
              <dd className="mt-1 text-[#0A0A0A]">{page.example.weeks}</dd>
            </div>
            <div>
              <dt className={label}>Team</dt>
              <dd className="mt-1 text-[#0A0A0A]">{page.example.team}</dd>
            </div>
          </dl>
          <p className="text-xs text-[#555555]">Self-reported.</p>
        </div>
        ) : (
          // The placeholder card the template solution pages use
          <div className="border border-dashed border-zinc-300 rounded-2xl p-6 md:p-8 max-w-3xl">
            <p className="text-sm text-[#555555] leading-relaxed">
              A case study for this work will appear here once the client has approved it. Ask us for a reference on a call.
            </p>
          </div>
        )}
      </section>

      {/* 10. FAQs. Native <details>: opens on click, with or without JavaScript. */}
      <section aria-labelledby="faq-heading" className={sectionClass}>
        <h2 id="faq-heading" className={h2Class}>Frequently asked questions</h2>
        <FaqCards
          items={page.faqs.map(faq => ({ key: faq.q, question: faq.q, answer: faq.a }))}
          className="max-w-3xl"
        />
      </section>

      {/* 11. Tools. [CONFIRM logos] */}
      {showTools && (
        <section aria-labelledby="tools-heading" className={sectionClass}>
          <div className="space-y-2">
            <h2 id="tools-heading" className={h2Class}>Tools</h2>
            {page.toolsNote && <p className="text-sm text-[#555555]">{page.toolsNote}</p>}
          </div>
          {page.logos.length > 0 && (
            <ul className="flex flex-wrap items-center gap-8" aria-label="Tools">
              {page.logos.map(logo => (
                <li key={logo.name}><img src={logo.src} alt={logo.name} className="h-7 w-auto" /></li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* 12. Links from the brief. The "Book a 30-minute call" band above the
          footer (BookCallBand in App.tsx) is the call to action. */}
      <section aria-label="Related links" className="pb-12 md:pb-16 space-y-2 text-sm">
        {page.ctaLinks && page.ctaLinks.length > 0 && (
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {page.ctaLinks.map(link => (
              <li key={link.href}>
                <Link to={link.href} className="font-medium text-[#0066FF] hover:underline">{link.label}</Link>
              </li>
            ))}
          </ul>
        )}
        {page.rolePages.length > 0 && (
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {page.rolePages.map(role => (
              <li key={role.href}>
                <Link to={role.href} className="text-[#0066FF] hover:underline">{role.label}</Link>
              </li>
            ))}
          </ul>
        )}
        <p className="text-[#555555]">
          Related solution:{' '}
          <Link to={page.related.href} className="font-medium text-[#0066FF] hover:underline">{page.related.label}</Link>
        </p>
      </section>
    </div>
  );
}

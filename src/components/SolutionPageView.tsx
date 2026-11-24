import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import SEO from './SEO';
import { BOOKING_PATH, card, h2Class, primaryButton, sectionClass } from './marketing/ui';
import { CASE_STUDIES } from '../content/case-studies';
import { SOLUTION_PAGES_INDEXABLE, type SolutionPageContent } from '../content/solution-pages';
import { SHORTLIST_TIME } from '../content/business-facts';
import { trackCtaClick } from '../utils/analytics';

const label = 'text-[10px] font-mono uppercase tracking-wider text-[#0066FF]';

/** One solution page, nine blocks in the order the structure doc sets. */
export default function SolutionPageView({ page }: { page: SolutionPageContent }) {
  const caseStudy = CASE_STUDIES.find(c => c.id === page.caseStudyId && c.permissionCleared);

  return (
    <div className="bg-white animate-page-enter">
      <SEO
        title={`${page.name}: AI Engineering | Fwdpod`}
        description={page.seoDescription}
        noindex={!SOLUTION_PAGES_INDEXABLE}
      />

      {/* 1. Headline and one-line promise */}
      <section className="pt-2 pb-8 space-y-5 max-w-3xl" aria-labelledby="solution-heading">
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
          {page.headline}
        </h1>
        {page.subPages && (
          <ul className="flex flex-wrap items-center gap-2" aria-label={`Part of ${page.name}`}>
            {page.subPages.map(sub => (
              <li key={sub.href}>
                <Link
                  to={sub.href}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#0066FF] border border-[#0066FF]/30 rounded-full px-3 py-1 hover:bg-[#0066FF]/5"
                >
                  Includes {sub.label} <ArrowRight className="w-3 h-3" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 2. The problem in their words */}
      <section aria-labelledby="problem-heading" className={sectionClass}>
        <div className="space-y-4 max-w-3xl">
          <h2 id="problem-heading" className={h2Class}>The problem</h2>
          <p className="text-base text-[#555555] leading-relaxed">{page.problem}</p>
        </div>
      </section>

      {/* 3. What we engineer */}
      <section aria-labelledby="engineer-heading" className={sectionClass}>
        <h2 id="engineer-heading" className={h2Class}>What we engineer</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {page.engineer.map(item => (
            <li key={item} className="flex gap-3 border border-zinc-200/85 rounded-2xl p-5 text-sm text-[#0A0A0A] leading-relaxed">
              <Check className="w-4 h-4 mt-0.5 text-[#0066FF] shrink-0" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 4. The team */}
      <section aria-labelledby="team-heading" className={sectionClass}>
        <h2 id="team-heading" className={h2Class}>The team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {page.teams.map(team => (
            <div key={team.name} className={card}>
              <h3 className="text-lg font-display font-medium tracking-tight text-[#0A0A0A]">
                {team.href ? <Link to={team.href} className="hover:text-[#0066FF] hover:underline">{team.name}</Link> : team.name}
              </h3>
              {team.size && <p className="mt-1 text-xs font-mono font-medium text-[#0066FF]">{team.size}</p>}
              {team.roles && (
                <ul className="mt-4 space-y-2">
                  {team.roles.map(r => (
                    <li key={r.role} className="flex justify-between gap-4 text-sm text-[#555555]">
                      <span>{r.role}</span>
                      {r.count !== undefined && <span className="font-mono text-[#0A0A0A]">×{r.count}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
        {page.teamNote && <p className="text-sm text-[#555555] max-w-3xl leading-relaxed">{page.teamNote}</p>}
      </section>

      {/* 5. Timeline: three phases; the split across them is [CONFIRM] */}
      <section aria-labelledby="timeline-heading" className={sectionClass}>
        <div className="space-y-2">
          <h2 id="timeline-heading" className={h2Class}>Timeline</h2>
          <p className="text-sm text-[#555555]">
            Typical total: <span className="font-semibold text-[#0A0A0A]">{page.timelineTotal}</span>
          </p>
        </div>
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {page.phases.map((phase, idx) => (
            <li key={phase} className="flex items-center gap-3 border border-zinc-200/85 rounded-2xl px-5 py-4">
              <span className="text-xs font-mono font-semibold text-[#0066FF]">Phase {idx + 1}</span>
              <span className="text-sm font-medium text-[#0A0A0A]">{phase}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* 6. Measured by */}
      <section aria-labelledby="measured-heading" className={sectionClass}>
        <div className="space-y-2">
          <h2 id="measured-heading" className={h2Class}>Measured by</h2>
          <p className="text-sm text-[#555555]">Reported every week, against the measures you agreed at the start.</p>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {page.measuredBy.map(metric => (
            <li key={metric} className="border border-zinc-200/85 rounded-2xl p-5 text-base font-display font-medium tracking-tight text-[#0A0A0A]">
              {metric}
            </li>
          ))}
        </ul>
      </section>

      {/* 7. Tools we work with. [CONFIRM: logos] The row stays hidden while empty. */}
      <section aria-labelledby="tools-heading" className={sectionClass}>
        <div className="space-y-2">
          <h2 id="tools-heading" className={h2Class}>Tools we work with</h2>
          <p className="text-sm text-[#555555] max-w-3xl">
            We work in your stack. We are model-neutral and work across frontier APIs and open models.
          </p>
        </div>
        {page.logos.length > 0 && (
          <ul className="flex flex-wrap items-center gap-8" aria-label="Platforms and models">
            {page.logos.map(logo => (
              <li key={logo.name}><img src={logo.src} alt={logo.name} className="h-7 w-auto" /></li>
            ))}
          </ul>
        )}
      </section>

      {/* 8. One case study. [CLIENT PERMISSION NEEDED] Placeholder until cleared. */}
      <section aria-labelledby="case-heading" className={sectionClass}>
        <h2 id="case-heading" className={h2Class}>Case study</h2>
        {caseStudy ? (
          <div className={`${card} space-y-4 max-w-3xl`}>
            <span className={label}>{caseStudy.sector}</span>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="sm:col-span-2">
                <dt className={label}>Problem</dt>
                <dd className="mt-1 text-[#0A0A0A]">{caseStudy.problem}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className={label}>Result</dt>
                <dd className="mt-1 text-[#0A0A0A]">{caseStudy.built}</dd>
              </div>
              <div>
                <dt className={label}>Team size</dt>
                <dd className="mt-1 text-[#0A0A0A]">{caseStudy.team}</dd>
              </div>
              <div>
                <dt className={label}>Weeks to live</dt>
                <dd className="mt-1 text-[#0A0A0A]">{caseStudy.weeks}</dd>
              </div>
            </dl>
          </div>
        ) : (
          <div className="border border-dashed border-zinc-300 rounded-2xl p-6 md:p-8 max-w-3xl">
            <p className="text-sm text-[#555555] leading-relaxed">
              A case study for this work will appear here once the client has approved it. Ask us for a reference on a call.
            </p>
          </div>
        )}
      </section>

      {/* 9. Call to action. [ADD LINK: /hire-by-role] Role page links: none exist yet ([CONFIRM: role pages]). */}
      <section aria-labelledby="cta-heading" className={sectionClass}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border border-zinc-200/85 rounded-3xl p-6 md:p-10">
          <div className="space-y-2 max-w-2xl">
            <h2 id="cta-heading" className="text-2xl font-display font-medium tracking-tight text-[#0A0A0A]">
              Book a 30-minute call
            </h2>
            <p className="text-sm text-[#555555] leading-relaxed">
              We'll map your stack and send profiles or a pod plan within {SHORTLIST_TIME}.
            </p>
          </div>
          <Link
            to={BOOKING_PATH}
            onClick={() => trackCtaClick(`Book a 30-minute call (${page.name})`, BOOKING_PATH)}
            className={`${primaryButton} shrink-0`}
          >
            <span>Book a 30-minute call</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}

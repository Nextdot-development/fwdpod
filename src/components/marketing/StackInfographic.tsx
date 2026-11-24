import React from 'react';
import { Link } from 'react-router-dom';
import { STACK_TOP, STACK_LAYERS, STACK_BANDS, STACK_FOOTER } from '../../content/engineering-stack';

/**
 * The engineering stack: four layers across the middle, the two cross-cutting
 * bands on the side. Each layer and band links to its solution page. Shown on
 * the homepage and the Our Solutions page.
 */
export default function StackInfographic() {
  return (
    <figure className="space-y-3">
      <div className="border border-[#0066FF]/40 bg-[#0066FF]/5 rounded-2xl px-4 py-3 text-center text-sm font-semibold text-[#0A0A0A]">
        {STACK_TOP}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3">
        <ol className="space-y-3">
          {STACK_LAYERS.map(layer => (
            <li key={layer.href} className="border border-zinc-200/85 bg-white rounded-2xl p-5 transition-colors hover:border-[#0066FF]">
              <Link to={layer.href} className="text-base font-display font-medium tracking-tight text-[#0A0A0A] hover:text-[#0066FF] hover:underline">
                {layer.number} · {layer.name}
              </Link>
              <ul className="mt-1.5 text-sm text-[#555555] leading-relaxed">
                {layer.lines.map(line => <li key={line}>{line}</li>)}
              </ul>
              <p className="mt-2 text-xs font-semibold text-[#0A0A0A]">
                Team:{' '}
                {layer.teams.map((team, idx) => (
                  <React.Fragment key={team.label}>
                    {idx > 0 && ' · '}
                    {team.href
                      ? <Link to={team.href} className="text-[#0066FF] hover:underline">{team.label}</Link>
                      : team.label}
                  </React.Fragment>
                ))}
              </p>
            </li>
          ))}
        </ol>
        <div className="grid grid-cols-2 gap-3 lg:w-72">
          {STACK_BANDS.map(band => (
            <div key={band.href} className="flex flex-col justify-between gap-4 border border-zinc-200/85 bg-zinc-50 rounded-2xl p-4 text-center">
              <div className="space-y-3">
                <Link to={band.href} className="block text-sm font-semibold text-[#0A0A0A] hover:text-[#0066FF] hover:underline">
                  {band.name}
                </Link>
                <span className="block text-[10px] font-mono uppercase tracking-wider text-[#555555]">Across every layer</span>
                <ul className="space-y-1 text-xs text-[#555555]">
                  {band.items.map(item => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <p className="text-xs font-semibold text-[#0A0A0A]">{band.team}</p>
            </div>
          ))}
        </div>
      </div>
      <figcaption className="border border-zinc-200/85 bg-zinc-50 rounded-2xl px-4 py-3 text-center text-sm text-[#0A0A0A]">
        {STACK_FOOTER}
      </figcaption>
    </figure>
  );
}

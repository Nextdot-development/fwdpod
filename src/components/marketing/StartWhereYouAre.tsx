import { STARTING_POINTS } from '../../content/starting-points';
import { sectionClass, SectionHeading } from './ui';

/** "Start where you are": four situations and where we start. */
export default function StartWhereYouAre({ id = 'start' }: { id?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className={`${sectionClass} scroll-mt-24`}>
      <SectionHeading id={`${id}-heading`} label="Starting point" title="Start where you are" />
      <div className="overflow-x-auto border border-zinc-200/85 rounded-2xl">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-50 text-[11px] font-mono uppercase tracking-wider text-[#555555]">
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold">Your situation</th>
              <th scope="col" className="px-5 py-3 font-semibold">Where we start</th>
            </tr>
          </thead>
          <tbody>
            {STARTING_POINTS.map(row => (
              <tr key={row.situation} className="border-t border-zinc-200/85">
                <td className="px-5 py-4 text-[#555555]">{row.situation}</td>
                <td className="px-5 py-4 font-medium text-[#0A0A0A]">{row.start}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

import SEO from './SEO';
import { card, eyebrow, h2Class, sectionClass } from './marketing/ui';
import {
  CAPABILITY_CENTER_NAME,
  CAPABILITY_CENTER_PHOTOS,
  LEADERSHIP,
  NEXTDOT_LINE,
  PARTNER_PROGRAMS,
} from '../content/company';

const PAGE_TITLE = 'About Fwdpod: AI Engineers from India, Backed by Nextdot';
const PAGE_DESCRIPTION =
  'Senior AI engineers from India inside enterprise teams. Backed by Nextdot since 2018, with engineers trained at our Jamshedpur AI Capability Center.';

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': 'https://fwdpod.com/about#webpage',
  'url': 'https://fwdpod.com/about',
  'name': PAGE_TITLE,
  'description': PAGE_DESCRIPTION,
  'isPartOf': { '@id': 'https://fwdpod.com/#website' },
  'about': { '@id': 'https://fwdpod.com/#organization' },
};

export default function AboutView() {
  return (
    <div className="bg-white animate-page-enter">
      <SEO title={PAGE_TITLE} description={PAGE_DESCRIPTION} jsonLd={JSON_LD} />

      <section className="pt-2 pb-4 space-y-4 max-w-3xl" aria-labelledby="about-heading">
        <span className={eyebrow}>About</span>
        <h1 id="about-heading" className="text-4xl md:text-5xl font-display font-medium tracking-tight text-[#0A0A0A] leading-[1.08] text-balance">
          Senior AI engineers from India, inside your team.
        </h1>
        <p className="text-base text-[#555555] leading-relaxed">
          Fwdpod places pre-vetted senior AI engineers from India inside enterprise teams: one specialist or a full AI pod, hourly or full-time. AI only. We don't staff general IT.
        </p>
      </section>

      <section aria-labelledby="backing-heading" className={sectionClass}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={card}>
            <h2 id="backing-heading" className="text-xl font-display font-medium tracking-tight text-[#0A0A0A]">Nextdot</h2>
            <p className="mt-2 text-sm text-[#555555] leading-relaxed">{NEXTDOT_LINE}.</p>
          </div>
          <div className={card}>
            <h2 className="text-xl font-display font-medium tracking-tight text-[#0A0A0A]">{CAPABILITY_CENTER_NAME}</h2>
            <p className="mt-2 text-sm text-[#555555] leading-relaxed">
              Our engineers are trained and vetted at the {CAPABILITY_CENTER_NAME} in India.
            </p>
          </div>
        </div>
        {/* [CONFIRM: photos] Real photos of the center and the team; hidden while empty */}
        {CAPABILITY_CENTER_PHOTOS.length > 0 && (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CAPABILITY_CENTER_PHOTOS.map(photo => (
              <li key={photo.src}><img src={photo.src} alt={photo.alt} className="w-full rounded-2xl" /></li>
            ))}
          </ul>
        )}
      </section>

      {/* [CLIENT/PERSON PERMISSION NEEDED] Leadership: hidden until names, photos and LinkedIn links are approved */}
      {LEADERSHIP.length > 0 && (
        <section aria-labelledby="leadership-heading" className={sectionClass}>
          <h2 id="leadership-heading" className={h2Class}>Leadership</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {LEADERSHIP.map(person => (
              <li key={person.name} className={card}>
                <img src={person.photo} alt={person.name} className="w-20 h-20 rounded-full object-cover" />
                <h3 className="mt-4 text-lg font-display font-medium tracking-tight text-[#0A0A0A]">{person.name}</h3>
                <p className="text-sm text-[#555555]">{person.role}</p>
                <a href={person.linkedin} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs font-medium text-[#0066FF] hover:underline">
                  LinkedIn
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Partners. [CONFIRM: current status and exact program name] for each */}
      <section aria-labelledby="partners-heading" className={sectionClass}>
        <h2 id="partners-heading" className={h2Class}>Partner programs</h2>
        <ul className="flex flex-wrap gap-3">
          {PARTNER_PROGRAMS.map(partner => (
            <li key={partner.name} className="border border-zinc-200/85 rounded-full px-5 py-2.5 text-sm">
              <span className="font-semibold text-[#0A0A0A]">{partner.name}</span>
              {partner.program && <span className="text-[#555555]"> ({partner.program})</span>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

import { Link } from 'react-router-dom';
import SEO from './SEO';

/**
 * Stand-in for a page the menu links to before its content is written. It is
 * noindex and out of the sitemap, so it never competes with a real page.
 */
export default function PlaceholderView({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 space-y-6 text-center animate-page-enter">
      <SEO
        title={`${title} | Fwdpod`}
        description={`${title}: this page is being written. Book a 30-minute call to talk it through.`}
        noindex
      />
      <h1 className="text-3xl font-display font-medium text-[#0A0A0A] tracking-tight">{title}</h1>
      <p className="text-sm text-[#555555] max-w-sm leading-relaxed">
        This page is being written. In the meantime, we can walk you through it on a call.
      </p>
      <Link
        to="/configure"
        className="bg-[#0066FF] text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-[#0055DD] transition-colors"
      >
        Book a 30-minute call
      </Link>
    </div>
  );
}

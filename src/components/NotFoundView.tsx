import { useContext } from 'react';
import { Link } from 'react-router-dom';
import SEO from './SEO';
import { RenderStatusContext } from '../ssr/renderStatus';

// ── 404 page ──────────────────────────────────────────────────────────────────
export default function NotFoundView() {
  // During prerendering, report the miss so the build can emit a real 404 page
  const renderStatus = useContext(RenderStatusContext);
  if (renderStatus) renderStatus.notFound = true;

  return (
    <div className="flex flex-col items-center justify-center py-32 space-y-6 text-center">
      <SEO
        title="Page not found | Fwdpod"
        description="This route doesn't exist. Head back home or explore the pod catalogue."
        noindex
      />
      <span className="text-[#0066FF] text-xs font-mono uppercase tracking-widest">404 — Not Found</span>
      <h1 className="text-3xl font-display font-medium text-[#0A0A0A] tracking-tight">
        Page not found
      </h1>
      <p className="text-sm text-[#555555] max-w-sm leading-relaxed">
        This route doesn't exist. Head back home or explore the pod catalogue.
      </p>
      <div className="flex gap-3">
        <Link
          to="/"
          className="bg-[#0066FF] text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-[#0055DD] transition-colors"
        >
          Go Home
        </Link>
        <Link
          to="/catalogue"
          className="border border-[#0A0A0A] text-[#0A0A0A] text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-[#0A0A0A]/5 transition-colors"
        >
          View Pod Catalogue
        </Link>
      </div>
    </div>
  );
}

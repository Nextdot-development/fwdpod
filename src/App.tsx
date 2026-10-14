import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Link, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  X,
  MoreVertical,
} from 'lucide-react';

import {
  COPY_OPTIONS,
  POD_DETAILS,
  LIVE_PODS,
  PodSKU
} from './data';

import {
  trackPageView,
  trackCtaClick,
  trackNavClick,
  trackManifestoEvent,
  trackPodSpecView,
} from './utils/analytics';
import HomeView from './components/HomeView';
import CatalogueView from './components/CatalogueView';
import ConfigureView from './components/ConfigureView';
import LivePodsView from './components/LivePodsView';
import BlogsView from './components/BlogsView';
import ContactView from './components/ContactView';
import FwdpodLogo from './components/FwdpodLogo';
import AiDevelopmentView from './components/AiDevelopmentView';
import LlmDevelopmentView from './components/LlmDevelopmentView';
import RagDevelopmentView from './components/RagDevelopmentView';
import AiAgentsView from './components/AiAgentsView';
import TeamAugmentationView from './components/TeamAugmentationView';
import AiConsultingView from './components/AiConsultingView';
import BlogPostView from './components/BlogPostView';
import CategoryView from './components/CategoryView';
import NotFoundView from './components/NotFoundView';

// ── Route map — maps legacy page-name strings to URL paths ────────────────────
const ROUTE_MAP: Record<string, string> = {
  home:        '/',
  catalogue:   '/catalogue',
  configure:   '/configure',
  'live-pods': '/live-pods',
  blogs:       '/insights',
  contact:     '/contact',
};

/**
 * /blog and /blog/<slug> moved to /insights. The server 301s them, so a crawler
 * never reaches this; it only catches in-app navigation to a stale path.
 */
function LegacyBlogRedirect() {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={slug ? `/insights/${slug}` : '/insights'} replace />;
}

// ── Shared NavLink className helper ──────────────────────────────────────────
const desktopNavClass = ({ isActive }: { isActive: boolean }) =>
  `hover:text-[#0A0A0A] transition-colors py-1 ${isActive ? 'text-[#0A0A0A] border-b-2 border-[#0066FF]' : ''}`;

const mobileNavClass = ({ isActive }: { isActive: boolean }) =>
  `w-full text-left px-4 py-2.5 text-xs transition-all hover:bg-zinc-50 flex items-center justify-between font-medium ${
    isActive ? 'text-[#0066FF] font-semibold bg-zinc-50' : 'text-zinc-700'
  }`;

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedPodId, setSelectedPodId] = useState<string | null>(null);
  const [selectedSKU, setSelectedSKU] = useState<PodSKU | null>(null);
  const [manifestoModal, setManifestoModal] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [notificationMsg, setNotificationMsg] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // GA4: fire page_view on every SPA route change
  useEffect(() => {
    trackPageView(location.pathname, location.search);
  }, [location.pathname, location.search]);

  const triggerNotification = (msg: string) => {
    setNotificationMsg(msg);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // Used by child components that call onNavigate with string names
  const navigateToPage = (pageName: string, preselectedPodId?: string) => {
    if (preselectedPodId) {
      setSelectedPodId(preselectedPodId);
    }
    navigate(ROUTE_MAP[pageName] ?? '/');
  };

  const handleClearPodSelection = () => {
    setSelectedPodId(null);
  };

  const handleOpenSpecSheet = (podId: string) => {
    const matched = POD_DETAILS.find(p => p.id === podId);
    if (matched) {
      setSelectedSKU(matched);
    }
  };

  const runningSamplePods = LIVE_PODS.slice(0, 3);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#0A0A0A] font-sans selection:bg-[#0066FF] selection:text-white flex flex-col antialiased">

      {/* ── Main Navigation Header ─────────────────────────────────────────── */}
      <header className="bg-white border-b border-[#0A0A0A]/10 px-4 md:px-8 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">

          {/* Logo — renders as <a href="/"> for crawlers */}
          <Link
            to="/"
            className="flex items-center select-none group"
            aria-label="Fwdpod — Home"
          >
            <FwdpodLogo size="sm" />
          </Link>

          {/* Desktop nav — all NavLinks render as <a href="..."> */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-8 text-xs font-medium text-[#555555]">
            <NavLink to="/" end className={desktopNavClass} onClick={() => trackNavClick('Home', '/')}>Home</NavLink>
            <NavLink to="/catalogue" className={desktopNavClass} onClick={() => trackNavClick('Pod Catalogue', '/catalogue')}>Pod Catalogue</NavLink>
            <NavLink to="/live-pods" className={desktopNavClass} onClick={() => trackNavClick('Live Telemetry', '/live-pods')}>Live Telemetry</NavLink>
            <NavLink to="/insights" className={desktopNavClass} onClick={() => trackNavClick('Insights', '/insights')}>Insights</NavLink>
            {/* Manifesto opens a modal — stays as button (not a page) */}
            <button
              onClick={() => { setManifestoModal(true); trackManifestoEvent('open'); }}
              className="hover:text-[#0A0A0A] transition-colors py-1"
            >
              Manifesto
            </button>
            <NavLink to="/contact" className={desktopNavClass} onClick={() => trackNavClick('Contact Us', '/contact')}>Contact Us</NavLink>
          </nav>

          {/* CTA "Configure pod" — NavLink renders as <a href="/configure"> */}
          <div className="flex items-center gap-2 relative">
            <NavLink
              to="/configure"
              onClick={() => trackCtaClick('Configure pod', '/configure')}
              className={({ isActive }) =>
                `bg-[#0066FF] hover:bg-[#0055DD] text-white font-semibold text-xs px-5 py-2.5 transition-all duration-150 rounded-full ${
                  isActive ? 'ring-2 ring-offset-1 ring-[#0066FF]' : ''
                }`
              }
            >
              Configure pod
            </NavLink>

            {/* Mobile three-dot menu — toggle only, no href needed */}
            <div className="relative md:hidden z-50">
              <button
                id="mobile-more-menu-btn"
                onClick={() => setMobileMenuOpen(prev => !prev)}
                className={`p-2 flex items-center justify-center border transition-all ${
                  mobileMenuOpen
                    ? 'text-white bg-[#0A0A0A] border-[#0A0A0A]'
                    : 'text-zinc-600 hover:text-black hover:bg-zinc-100 border-zinc-200 bg-white'
                }`}
                title="More Pages"
                aria-label="Toggle menu"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {mobileMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40 bg-transparent cursor-default"
                      onClick={closeMobileMenu}
                    />
                    <motion.div
                      id="mobile-navigation-dropdown"
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute right-0 mt-2.5 w-48 bg-white border border-[#0A0A0A] shadow-2xl z-50 py-1.5 font-sans"
                    >
                      <div className="px-3 py-1 text-[9px] font-mono uppercase text-zinc-400 tracking-wider select-none">
                        Navigation Menu
                      </div>

                      {/* Mobile NavLinks — all render as <a href="..."> */}
                      <NavLink to="/" end onClick={() => { closeMobileMenu(); trackNavClick('Home (mobile)', '/'); }} className={mobileNavClass}>
                        {({ isActive }) => (
                          <>
                            <span>Home</span>
                            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#0066FF]" />}
                          </>
                        )}
                      </NavLink>

                      <NavLink to="/catalogue" onClick={() => { closeMobileMenu(); trackNavClick('Pod Catalogue (mobile)', '/catalogue'); }} className={mobileNavClass}>
                        {({ isActive }) => (
                          <>
                            <span>Pod Catalogue</span>
                            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#0066FF]" />}
                          </>
                        )}
                      </NavLink>

                      <NavLink to="/live-pods" onClick={() => { closeMobileMenu(); trackNavClick('Live Telemetry (mobile)', '/live-pods'); }} className={mobileNavClass}>
                        {({ isActive }) => (
                          <>
                            <span>Live Telemetry</span>
                            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#0066FF]" />}
                          </>
                        )}
                      </NavLink>

                      <NavLink to="/insights" onClick={() => { closeMobileMenu(); trackNavClick('Insights (mobile)', '/insights'); }} className={mobileNavClass}>
                        {({ isActive }) => (
                          <>
                            <span>Insights</span>
                            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#0066FF]" />}
                          </>
                        )}
                      </NavLink>

                      <div className="border-t border-zinc-100 my-1"></div>

                      <button
                        onClick={() => { setManifestoModal(true); closeMobileMenu(); trackManifestoEvent('open'); }}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-zinc-900 transition-all hover:bg-zinc-50 flex items-center justify-between"
                      >
                        <span>Read Manifesto</span>
                      </button>

                      <NavLink to="/contact" onClick={() => { closeMobileMenu(); trackNavClick('Contact Us (mobile)', '/contact'); }} className={mobileNavClass}>
                        {({ isActive }) => (
                          <>
                            <span>Contact Us</span>
                            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#0066FF]" />}
                          </>
                        )}
                      </NavLink>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </header>

      {/* ── Page routes ────────────────────────────────────────────────────── */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 md:px-8 pt-2 md:pt-4 pb-12">
        {/* Indexable paths are also listed in src/ssr/routes.ts for prerendering — keep both in sync */}
        <Routes>
          <Route
            path="/"
            element={
              <HomeView
                activeHeadline={COPY_OPTIONS[0].headline}
                activeSubline={COPY_OPTIONS[0].subline}
                activeCta={COPY_OPTIONS[0].cta}
                onNavigate={navigateToPage}
                onSelectPod={handleOpenSpecSheet}
                livePodsSample={runningSamplePods}
              />
            }
          />
          <Route
            path="/catalogue"
            element={
              <CatalogueView
                selectedPodId={selectedPodId}
                onPreselectPod={setSelectedPodId}
              />
            }
          />
          <Route
            path="/configure"
            element={
              <ConfigureView
                initialPodId={selectedPodId}
                onClearPodSelection={handleClearPodSelection}
              />
            }
          />
          <Route path="/live-pods" element={<LivePodsView />} />
          <Route path="/insights" element={<BlogsView />} />
          <Route path="/insights/category/:slug" element={<CategoryView />} />
          <Route path="/insights/category/:slug/page/:page" element={<CategoryView />} />
          <Route path="/insights/:slug" element={<BlogPostView />} />
          <Route path="/blog" element={<LegacyBlogRedirect />} />
          <Route path="/blog/:slug" element={<LegacyBlogRedirect />} />
          <Route
            path="/contact"
            element={
              <ContactView
                onNavigate={navigateToPage}
                triggerNotification={triggerNotification}
              />
            }
          />
          <Route path="/services/ai-development" element={<AiDevelopmentView />} />
          <Route path="/services/llm-development" element={<LlmDevelopmentView />} />
          <Route path="/services/rag-development" element={<RagDevelopmentView />} />
          <Route path="/services/ai-agents" element={<AiAgentsView />} />
          <Route path="/services/team-augmentation" element={<TeamAugmentationView />} />
          <Route path="/services/ai-consulting" element={<AiConsultingView />} />
          <Route path="*" element={<NotFoundView />} />
        </Routes>
      </main>

      {/* ── Toast notification ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-6 right-6 z-50 bg-[#0A0A0A] text-white border border-zinc-800 px-4 py-3 shadow-xl max-w-sm flex items-center gap-3 text-xs rounded-2xl"
          >
            <Check className="w-4 h-4 text-[#0066FF] shrink-0" />
            <p className="flex-1 font-mono font-medium">{notificationMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Spec sheet modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedSKU && (
          <div className="fixed inset-0 z-50 bg-[#0A0A0A]/45 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white border border-[#0A0A0A] p-6 max-w-lg w-full relative text-[#0A0A0A] space-y-6 rounded-3xl shadow-2xl"
            >
              <button
                onClick={() => setSelectedSKU(null)}
                className="absolute top-4 right-4 p-1.5 hover:bg-[#0A0A0A]/5 border border-transparent text-[#0A0A0A] rounded-full"
                title="Dismiss details"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-2">
                <span className="bg-[#0066FF]/5 text-[#0066FF] text-[8px] tracking-widest font-mono uppercase px-2 py-0.5 rounded">
                  POD SPECIFICATION SUMMARY // ONLINE ACTIVE
                </span>
                <h3 className="text-xl font-medium tracking-tight font-display">
                  {selectedSKU.name} specs
                </h3>
                <p className="text-xs text-[#555555]">
                  {selectedSKU.oneLiner}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-b border-[#0A0A0A]/10 py-4 text-xs font-mono">
                {/* TODO(copy): indicative budget. Pricing is not approved for publication. */}
                <div>
                  <span className="text-[#555555] block text-[9px] uppercase">Execution Cycle</span>
                  <span className="font-semibold text-sm">{selectedSKU.weeks}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-mono uppercase tracking-wider text-[#555555] font-semibold">
                  What is included in this profile:
                </h4>
                <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                  {selectedSKU.includedRoles.map((role, rIdx) => (
                    <div key={rIdx} className="p-2 border border-[#0A0A0A]/10 bg-[#0A0A0A]/5 text-xs font-medium flex justify-between items-center rounded-lg">
                      <span>{role}</span>
                      <span className="text-[8px] font-mono text-[#555555] uppercase">Pre-assembled node</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {/* Needs to set pod ID state before navigating — button is correct here */}
                <button
                  onClick={() => {
                    trackPodSpecView(selectedSKU.id, 'configure');
                    setSelectedSKU(null);
                    navigateToPage('configure', selectedSKU.id);
                  }}
                  className="bg-[#0066FF] text-white hover:bg-[#0055DD] text-xs font-semibold py-2.5 rounded-full transition-colors text-center"
                >
                  Configure layout
                </button>
                <button
                  onClick={() => setSelectedSKU(null)}
                  className="border border-[#0A0A0A] hover:bg-[#0A0A0A]/5 text-[#0A0A0A] text-xs font-semibold py-2.5 rounded-full transition-colors text-center"
                >
                  Close spec
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Manifesto modal ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {manifestoModal && (
          <div className="fixed inset-0 z-50 bg-[#0A0A0A]/75 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-[#0A0A0A] border border-[#222222] p-6 md:p-8 max-w-2xl w-full relative text-white space-y-6 shadow-2xl rounded-3xl"
            >
              <button
                onClick={() => setManifestoModal(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-white/10 text-white border border-transparent transition-colors rounded-full"
                title="Dismiss manifesto"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <span className="bg-[#0066FF] text-white text-[9px] px-2.5 py-0.5 tracking-wider font-mono uppercase font-bold rounded">
                  FWDPOD MANIFESTO // EXECUTIVE DIRECTORY
                </span>
                <h3 className="text-xl md:text-2xl font-sans font-semibold tracking-tight font-display text-white pt-1">
                  The Fwdpod Execution Manifesto
                </h3>
                <p className="text-[10px] font-mono text-zinc-400 uppercase">
                  Revision 2026 // Active Sourcing Protocol
                </p>
              </div>

              <div className="space-y-6 text-xs sm:text-sm text-zinc-300 leading-relaxed max-h-[380px] overflow-y-auto pr-3 border-t border-b border-zinc-800 py-5 font-sans">
                <div className="space-y-2">
                  <h4 className="font-bold text-white text-sm md:text-base">I. AI Needs Builders, Not Endless Strategy</h4>
                  <p className="text-xs sm:text-sm text-zinc-400">
                    Most companies already know they need AI. The real challenge is execution. Hiring internally takes months, freelancers lack coordination, and traditional consulting teams often stop at recommendations. Fwdpod delivers fully operational AI engineering pods that move directly from idea to deployment.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-white text-sm md:text-base">II. Small Teams Build Faster</h4>
                  <p className="text-xs sm:text-sm text-zinc-400">
                    The best AI systems are rarely built by massive organizations. They are built by focused, high-context teams with clear ownership. Each pod combines engineers, product thinkers, and AI specialists working together toward one measurable outcome — fast iterations, faster launches, and fewer communication gaps.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-white text-sm md:text-base">III. Outcome Over Billable Hours</h4>
                  <p className="text-xs sm:text-sm text-zinc-400">
                    Consultants optimize for timelines and presentations. Pods optimize for shipped products. Every engagement is designed around a fixed mission, fixed scope, and real deliverables. You are not paying for meetings — you are investing in execution.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-white text-sm md:text-base">IV. AI Products Require Cross-Functional Thinking</h4>
                  <p className="text-xs sm:text-sm text-zinc-400">
                    Modern AI systems are more than models. They require infrastructure, UX, backend architecture, evaluation pipelines, integrations, and deployment workflows. Pods bring all required skill sets into one synchronized unit so companies can move without operational friction.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-white text-sm md:text-base">V. Speed Is a Competitive Advantage</h4>
                  <p className="text-xs sm:text-sm text-zinc-400">
                    AI markets move weekly, not yearly. Companies that execute faster learn faster. Fwdpod pods are designed to compress months of hiring, onboarding, and coordination into a launch-ready engineering unit that starts delivering from week one.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-white text-sm md:text-base">VI. Built for Real Deployment</h4>
                  <p className="text-xs sm:text-sm text-zinc-400">
                    We do not build experiments that stay inside presentations. Every pod is focused on production-ready systems — scalable architectures, secure deployments, maintainable codebases, and measurable business impact.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    trackManifestoEvent('download');
                    triggerNotification("Initiated download sequence for fwd_manifesto_revision_2026.pdf");
                    setManifestoModal(false);
                  }}
                  className="border border-zinc-700 hover:bg-white/5 hover:border-white text-zinc-300 hover:text-white text-xs font-semibold py-2.5 px-6 rounded-full transition-colors"
                >
                  Download complete PDF spec
                </button>
                <button
                  onClick={() => setManifestoModal(false)}
                  className="bg-[#0066FF] hover:bg-[#0055DD] text-white text-xs font-semibold py-2.5 px-6 rounded-full transition-colors"
                >
                  Acknowledge
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-[#0A0A0A]/10 py-14 px-4 md:px-8">
        <div className="max-w-7xl mx-auto space-y-12">

          {/* CTA Banner */}
          <div className="bg-[#0A0A0A] text-white p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border-2 border-[#111111] relative overflow-hidden shadow-xl rounded-3xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#0066FF]/10 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-zinc-900/40 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20"></div>

            <div className="space-y-3 max-w-2xl relative z-10 font-sans">
              <span className="text-[#0066FF] text-[11px] font-mono uppercase tracking-wider font-bold">
                Ready to accelerate execution?
              </span>
              <h3 className="text-2xl md:text-3xl font-display font-medium tracking-tight text-white leading-tight">
                Instantiate your custom AI engineering unit.
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">
                Define your delivery outcomes, compute maturity level, and operational constraints. Receive a fully pre-assembled, compliant pod scope and architectural blueprint within 48 hours.
              </p>
            </div>

            {/* Link renders as <a href="/configure"> — crawlable CTA */}
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto shrink-0 relative z-10">
              <Link
                to="/configure"
                onClick={() => trackCtaClick('Configure Your Pod (footer)', '/configure')}
                className="bg-[#0066FF] hover:bg-[#0055DD] text-white text-xs font-semibold py-3.5 px-8 rounded-full transition-colors uppercase tracking-wider text-center"
              >
                Configure Your Pod
              </Link>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start gap-8 text-[#555555]">

            {/* Logo + tagline */}
            <div className="space-y-4 max-w-sm flex-shrink-0">
              <Link to="/" aria-label="Fwdpod — Home" className="flex items-center select-none">
                <FwdpodLogo size="sm" />
              </Link>
              <p className="text-[13px] leading-relaxed text-[#555555]">
                Assemble a specialized AI engineering pod of 4–6 experts who collaborate from day one to architect, build, and launch your AI product around a single measurable outcome.
              </p>
            </div>

            {/* Footer nav columns — compact spacing */}
            <div className="flex flex-col md:flex-row gap-8 md:gap-6 flex-1">
              {/* Pods Catalogue */}
              <nav aria-label="Pod catalogue links">
                <span className="block text-[11px] text-[#0066FF] font-mono font-bold uppercase tracking-wider mb-3">Pods catalogue</span>
                <ul className="space-y-2 text-[13px] font-medium text-[#555555]">
                  <li>
                    <Link
                      to="/catalogue"
                      onClick={() => setSelectedPodId('voice-ai')}
                      className="hover:text-[#0A0A0A] hover:underline transition-all"
                    >
                      Voice AI Core
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/catalogue"
                      onClick={() => setSelectedPodId('agentic-ops')}
                      className="hover:text-[#0A0A0A] hover:underline transition-all"
                    >
                      Agentic Operations
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/catalogue"
                      onClick={() => setSelectedPodId('rag-knowledge')}
                      className="hover:text-[#0A0A0A] hover:underline transition-all"
                    >
                      RAG &amp; Knowledge
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/catalogue"
                      onClick={() => setSelectedPodId('compliance-ai')}
                      className="hover:text-[#0A0A0A] hover:underline transition-all"
                    >
                      Compliance AI
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/catalogue"
                      onClick={() => setSelectedPodId('custom-pod')}
                      className="hover:text-[#0A0A0A] hover:underline transition-all"
                    >
                      Custom Pod
                    </Link>
                  </li>
                </ul>
              </nav>

              {/* Services */}
              <nav aria-label="Services links">
                <span className="block text-[11px] text-[#0066FF] font-mono font-bold uppercase tracking-wider mb-3">Services</span>
                <ul className="space-y-2 text-[13px] font-medium text-[#555555]">
                  <li><Link to="/services/ai-development" className="hover:text-[#0A0A0A] hover:underline transition-all">AI Development</Link></li>
                  <li><Link to="/services/llm-development" className="hover:text-[#0A0A0A] hover:underline transition-all">LLM Development</Link></li>
                  <li><Link to="/services/rag-development" className="hover:text-[#0A0A0A] hover:underline transition-all">RAG Development</Link></li>
                  <li><Link to="/services/ai-agents" className="hover:text-[#0A0A0A] hover:underline transition-all">AI Agents</Link></li>
                  <li><Link to="/services/team-augmentation" className="hover:text-[#0A0A0A] hover:underline transition-all">Team Augmentation</Link></li>
                  <li><Link to="/services/ai-consulting" className="hover:text-[#0A0A0A] hover:underline transition-all">AI Consulting</Link></li>
                </ul>
              </nav>

              {/* Scoping Engine */}
              <nav aria-label="Site navigation links">
                <span className="block text-[11px] text-[#0066FF] font-mono font-bold uppercase tracking-wider mb-3">Scoping engine</span>
                <ul className="space-y-2 text-[13px] font-medium text-[#555555]">
                  <li>
                    <Link to="/configure" className="hover:text-[#0A0A0A] hover:underline transition-all">
                      Hire a pod
                    </Link>
                  </li>
                  <li>
                    {/* Modal action — stays as button */}
                    <button
                      onClick={() => setManifestoModal(true)}
                      className="hover:text-[#0A0A0A] hover:underline transition-all text-[13px] font-medium text-[#555555]"
                    >
                      Read the manifesto
                    </button>
                  </li>
                  <li>
                    <Link to="/contact" className="hover:text-[#0A0A0A] hover:underline transition-all">
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link to="/live-pods" className="hover:text-[#0A0A0A] hover:underline transition-all">
                      Live telemetry
                    </Link>
                  </li>
                  <li>
                    <Link to="/insights" className="hover:text-[#0A0A0A] hover:underline transition-all">
                      Insights &amp; Blogs
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Founder Note */}
            <div className="space-y-3 max-w-sm flex-shrink-0 lg:border-l lg:border-[#0A0A0A]/10 lg:pl-8">
              <span className="block text-[11px] text-[#0A0A0A] font-mono font-bold uppercase tracking-wider">A note from the founder</span>
              <div className="space-y-2">
                <p className="text-[13px] leading-relaxed italic text-[#444444] font-serif">
                  "We build fully autonomous, pre-formed cognitive pods directly tuned to your product's core needs. Let's bypass legacy hiring friction and engineer the future, today."
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-[#0a0a0a]">— Founder</span>
                </div>
              </div>
            </div>

          </div>

          <div className="pt-6 border-t border-[#0A0A0A]/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-[#555555]">
            <span>© 2026 Fwdpod. All rights reserved.</span>
            <span>All enterprise AI operations productised.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

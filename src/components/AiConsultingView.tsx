import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, Check } from 'lucide-react';
import SEO from './SEO';

const USE_CASES = [
  { title: 'Fractional Chief AI Officer', desc: 'Access senior AI leadership on a fractional basis — a Virtual Chief AI Officer who sets your AI strategy, owns vendor relationships, and guides your team without full-time executive overhead.' },
  { title: 'AI Strategy & Roadmap', desc: 'Define a prioritized AI investment roadmap aligned to your business goals — with ROI estimates, build-vs-buy decisions, and sequenced initiatives built by an AI Strategy Consultant.' },
  { title: 'AI Capability Center Design', desc: 'Build a sustainable internal AI Capability Center from the ground up — including org structure, tooling standards, hiring profiles, and governance frameworks.' },
  { title: 'Architecture Review & Design', desc: 'Get an independent review of your current AI architecture and a redesign plan that addresses scalability, reliability, and cost inefficiencies from engineers who have built these systems.' },
  { title: 'LLM & Vendor Selection', desc: 'Navigate the model landscape — GPT, Claude, Gemini, open-source — and select the right foundation models for your use case, budget, and compliance needs.' },
  { title: 'AI Risk & Compliance Review', desc: 'Assess your AI systems for regulatory exposure, ethical risks, bias, and data governance gaps — with a remediation plan aligned to EU AI Act and emerging standards.' },
];

const PROCESS_STEPS = [
  { step: '01', title: 'Discovery', desc: 'We conduct structured interviews, stack audits, and business process reviews to form a complete picture of your current AI position and goals.' },
  { step: '02', title: 'Architecture', desc: 'We analyze findings and develop strategic options — with tradeoff analysis, risk assessment, and alignment to your business model and technical constraints.' },
  { step: '03', title: 'Development', desc: 'We deliver a prioritized strategy document, architecture blueprint, vendor selection framework, and implementation roadmap with clear ownership.' },
  { step: '04', title: 'Deployment', desc: 'We support roadmap execution with optional Fractional AI Team advisory retainers, technical reviews during implementation, and quarterly strategy checkpoints.' },
];

const INDUSTRIES = [
  { name: 'SaaS', desc: 'AI product strategy, LLM feature prioritization, and build-vs-buy advisory for product-led companies.' },
  { name: 'Healthcare', desc: 'Regulatory-aware AI strategy, HIPAA compliance planning, and clinical AI roadmap development.' },
  { name: 'Finance', desc: 'AI risk frameworks, explainability requirements, and responsible AI strategy for financial services.' },
  { name: 'Enterprise', desc: 'Enterprise AI transformation strategy, vendor selection, and AI Capability Center design.' },
  { name: 'Education', desc: 'AI adoption roadmaps, LMS integration strategy, and ethical AI policy development for education institutions.' },
  { name: 'E-commerce', desc: 'Personalization strategy, AI search architecture advisory, and demand forecasting model selection.' },
];

const FAQS = [
  { q: 'What is a Fractional Chief AI Officer?', a: 'A Fractional Chief AI Officer (Fractional CAIO) is a senior AI leader who provides strategic AI direction to an organization on a part-time or project basis — without the cost and commitment of a full-time executive hire. A Fractional CAIO owns your AI roadmap, guides technology decisions, manages vendor relationships, and builds internal AI capability. Fwdpod provides Fractional Chief AI Officer services through senior AI practitioners who have built and shipped production AI systems.' },
  { q: 'What is a Virtual Chief AI Officer?', a: 'A Virtual Chief AI Officer is a Fractional Chief AI Officer engagement delivered remotely — providing the same strategic AI leadership, roadmap ownership, and advisory function as an in-house CAIO, but without physical presence requirements. This model suits distributed organizations, startups that are not yet ready for a full-time AI executive, and enterprises that need AI Leadership as a Service during a transformation initiative.' },
  { q: 'What is AI Leadership as a Service?', a: 'AI Leadership as a Service is a model where organizations access senior AI strategic leadership on a subscription or engagement basis — including Fractional Chief AI Officer advisory, AI Capability Center design, roadmap development, and team mentorship. Rather than waiting to hire a full-time AI executive, companies can activate AI leadership immediately through Fwdpod\'s AI Strategy Consulting engagements.' },
  { q: 'What is an AI Capability Center?', a: 'An AI Capability Center (AI CoE) is an internal organizational unit that centralizes AI expertise, tooling standards, governance policies, and reusable infrastructure for an enterprise. Building an AI Capability Center ensures AI development is coordinated, compliant, and scalable across the organization. Fwdpod advises on AI Capability Center design: org structure, hiring profiles, tooling standards, and governance frameworks.' },
  { q: 'What does AI consulting include?', a: 'AI consulting from Fwdpod covers AI strategy, architecture review, vendor selection, readiness assessment, roadmap development, and Fractional AI Team advisory. Unlike general management consulting, our AI Strategy Consultants are practicing engineers who have built the systems they advise on — so recommendations are grounded in production reality.' },
  { q: 'How is Fwdpod AI consulting different from traditional consulting?', a: 'Traditional consulting firms deliver strategy documents. Fwdpod consultants are AI engineers who have built production LLM systems, RAG pipelines, and agentic workflows. Our AI Strategy Consultant engagements are grounded in current technical realities, not theoretical frameworks. This is the core value of AI Leadership as a Service from a builder-first organization.' },
  { q: 'How long does an AI consulting engagement take?', a: 'Focused assessments (readiness audit, architecture review) can be completed in 2–4 weeks. Full AI strategy and roadmap engagements typically take 4–8 weeks. Ongoing Fractional AI Team advisory retainers are available on a monthly basis.' },
  { q: 'Can Fwdpod help us build an internal AI team or Capability Center?', a: 'Yes. We advise on AI org design, hiring profiles, tooling standards, and internal AI governance structures — helping companies build sustainable AI Capability Centers rather than permanent external dependency. This is a core output of our AI Leadership as a Service engagements.' },
  { q: 'Does Fwdpod offer ongoing AI advisory retainers?', a: 'Yes. Following a consulting engagement, we offer monthly Fractional AI Team advisory retainers that include architecture reviews, technical escalation support, model evaluation guidance, and quarterly roadmap checkpoints as your AI systems evolve.' },
];

const RELATED = [
  { label: 'AI Development', href: '/services/ai-development' },
  { label: 'LLM Development', href: '/services/llm-development' },
  { label: 'RAG Development', href: '/services/rag-development' },
  { label: 'AI Agents', href: '/services/ai-agents' },
  { label: 'Team Augmentation', href: '/services/team-augmentation' },
];

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://www.fwdpod.com/services/ai-consulting#webpage',
      url: 'https://www.fwdpod.com/services/ai-consulting',
      name: 'AI Consulting Services for Enterprise Leaders | fwdpod',
      description: 'AI strategy that ends in shipped software — use-case selection, architecture, build-vs-buy and a delivery roadmap from the engineers who build it.',
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.fwdpod.com/' },
          { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://www.fwdpod.com/services/ai-consulting' },
          { '@type': 'ListItem', position: 3, name: 'AI Consulting Services', item: 'https://www.fwdpod.com/services/ai-consulting' },
        ],
      },
    },
    {
      '@type': 'Service',
      name: 'AI Consulting Services',
      description: 'Fractional AI Team and AI Strategy Consulting: Fractional Chief AI Officer advisory, Virtual Chief AI Officer services, AI Capability Center design, and AI Leadership as a Service.',
      provider: { '@id': 'https://www.fwdpod.com/#organization' },
      serviceType: 'AI Strategy Consulting',
      areaServed: 'Worldwide',
    },
  ],
};

export default function AiConsultingView() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto py-6 font-sans space-y-14"
    >
      <SEO
        title="AI Consulting Services for Enterprise Leaders | fwdpod"
        description="AI strategy that ends in shipped software — use-case selection, architecture, build-vs-buy and a delivery roadmap from the engineers who build it."
        jsonLd={JSON_LD}
      />

      {/* Hero */}
      <section className="space-y-5">
        <span className="bg-[#0066FF]/5 text-[#0066FF] text-[9px] font-mono uppercase px-3 py-1 font-bold tracking-widest rounded-md border border-[#0066FF]/10 inline-block">
          AI Consulting // Active
        </span>
        <div className="space-y-3 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-display font-medium tracking-tight text-[#0A0A0A] leading-tight">
            AI Consulting Services
          </h1>
          <p className="text-[#555555] text-sm md:text-base leading-relaxed">
            Fwdpod acts as your Fractional AI Team and AI Strategy Consultant — providing Fractional Chief AI Officer advisory, AI Capability Center design, and AI Leadership as a Service grounded in real engineering experience. From AI readiness assessments and architecture reviews to Virtual Chief AI Officer engagements and multi-year roadmaps, we help organizations build AI with clarity and confidence.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/contact" className="bg-[#0066FF] hover:bg-[#0055DD] text-white font-semibold text-xs px-6 py-3 rounded-full transition-colors">
            Book a Consultation
          </Link>
          <Link to="/catalogue" className="border border-[#0A0A0A] text-[#0A0A0A] font-semibold text-xs px-6 py-3 rounded-full hover:bg-[#0A0A0A]/5 transition-colors flex items-center gap-1.5">
            View Pod Catalogue <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* What is AI Consulting? */}
      <section className="space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#0066FF] font-bold">About the Service</span>
          <h2 className="text-2xl md:text-3xl font-display font-medium tracking-tight text-[#0A0A0A]">
            What is AI Consulting?
          </h2>
        </div>
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-4 text-[#555555] text-sm leading-relaxed">
            <p>
              AI consulting is the process of providing strategic guidance on how an organization should invest in, build, and operate artificial intelligence systems. A good AI Strategy Consultant aligns business objectives with technical capabilities — helping leaders make informed decisions on AI architecture, vendors, teams, and roadmap sequencing.
            </p>
            <p>
              The AI landscape moves extraordinarily fast. Model capabilities change quarterly, new frameworks emerge weekly, and the risk of building on the wrong foundation is real. Without experienced Fractional AI Leadership, organizations waste significant capital on AI investments that don't deliver.
            </p>
            <p>
              Fwdpod consultants are practicing AI engineers who have built the systems they advise on. This builder-first approach defines our AI Leadership as a Service model — whether we're acting as your Fractional Chief AI Officer, designing your AI Capability Center, or providing a Virtual Chief AI Officer for a transformation initiative.
            </p>
          </div>
          <div className="bg-[#0A0A0A] text-white rounded-3xl p-6 space-y-5 border border-zinc-800">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Pod Metrics // AI Consulting</span>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Assessment', value: '2–4 Weeks' },
                { label: 'Full Strategy', value: '4–8 Weeks' },
                { label: 'Advisory', value: 'Monthly Retainer' },
                { label: 'Deliverable', value: 'Actionable Docs' },
              ].map(m => (
                <div key={m.label} className="p-3 bg-zinc-900 rounded-2xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block">{m.label}</span>
                  <span className="text-sm font-semibold text-white">{m.value}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              {['Fractional CAIO advisory', 'AI Capability Center design', 'Prioritized AI roadmap', 'ROI modeling & business case'].map(item => (
                <div key={item} className="flex items-center gap-2 text-xs text-zinc-300">
                  <Check className="w-3.5 h-3.5 text-[#0066FF] shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#0066FF] font-bold">Use Cases</span>
          <h2 className="text-2xl md:text-3xl font-display font-medium tracking-tight text-[#0A0A0A]">How We Help</h2>
          <p className="text-[#555555] text-sm max-w-2xl">The most common AI consulting mandates our Fractional AI Team delivers for enterprise and startup clients.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {USE_CASES.map((uc, i) => (
            <div key={i} className="border border-[#0A0A0A]/10 rounded-3xl p-5 space-y-2 hover:border-[#0066FF]/30 hover:shadow-sm transition-all bg-white">
              <h3 className="text-sm font-semibold text-[#0A0A0A]">{uc.title}</h3>
              <p className="text-xs text-[#555555] leading-relaxed">{uc.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#0066FF] font-bold">Our Process</span>
          <h2 className="text-2xl md:text-3xl font-display font-medium tracking-tight text-[#0A0A0A]">How We Deliver</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PROCESS_STEPS.map((s, i) => (
            <div key={i} className="border border-[#0A0A0A]/10 rounded-3xl p-5 space-y-3 bg-white">
              <span className="text-[32px] font-mono font-bold text-[#0066FF]/10 leading-none select-none">{s.step}</span>
              <h3 className="text-sm font-semibold text-[#0A0A0A] -mt-1">{s.title}</h3>
              <p className="text-xs text-[#555555] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Industries */}
      <section className="space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#0066FF] font-bold">Industries</span>
          <h2 className="text-2xl md:text-3xl font-display font-medium tracking-tight text-[#0A0A0A]">Industries We Serve</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {INDUSTRIES.map((ind, i) => (
            <div key={i} className="border border-[#0A0A0A]/10 rounded-2xl p-4 flex gap-3 items-start hover:border-[#0066FF]/30 transition-all bg-white">
              <span className="bg-[#0066FF]/5 text-[#0066FF] text-[10px] font-mono font-bold px-2 py-1 rounded-md border border-[#0066FF]/10 shrink-0">{ind.name}</span>
              <p className="text-xs text-[#555555] leading-relaxed">{ind.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#0066FF] font-bold">FAQs</span>
          <h2 className="text-2xl md:text-3xl font-display font-medium tracking-tight text-[#0A0A0A]">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3 max-w-3xl">
          {FAQS.map((faq, i) => (
            <div key={i} className="border border-[#0A0A0A]/10 rounded-2xl overflow-hidden bg-white">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#0A0A0A]/5 transition-colors gap-4"
              >
                <h3 className="text-xs font-semibold text-[#0A0A0A]">{faq.q}</h3>
                <ChevronDown className={`w-4 h-4 text-[#555555] shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 border-t border-[#0A0A0A]/5">
                  <p className="pt-4 text-xs text-[#555555] leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Related Services */}
      <section className="space-y-4">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#555555] font-bold">Related Services</span>
        <div className="flex flex-wrap gap-3">
          {RELATED.map(s => (
            <Link key={s.href} to={s.href} className="border border-[#0A0A0A]/15 text-[#0A0A0A] text-xs font-medium px-4 py-2 rounded-full hover:border-[#0066FF] hover:text-[#0066FF] transition-colors">
              {s.label} →
            </Link>
          ))}
        </div>
      </section>
    </motion.div>
  );
}

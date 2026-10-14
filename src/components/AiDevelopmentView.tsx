import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, Check } from 'lucide-react';
import SEO from './SEO';

const USE_CASES = [
  { title: 'Chatbots & Conversational AI', desc: 'Deploy context-aware enterprise chatbots that resolve customer queries, reduce support volume, and integrate with your CRM and ticketing systems.' },
  { title: 'AI-Powered Copilots', desc: 'Build intelligent copilot tools that augment developer, analyst, or operator workflows with real-time AI suggestions and inline automation.' },
  { title: 'Knowledge Assistants', desc: 'Create internal knowledge assistants that surface relevant documents, SOPs, and institutional knowledge from your existing content sources.' },
  { title: 'Workflow Automation', desc: 'Automate multi-step business workflows using AI decision-making across APIs, databases, CRMs, ERPs, and third-party SaaS tools.' },
  { title: 'Internal Tooling', desc: 'Ship AI-powered internal tools — from smart dashboards to automated reporting systems — that multiply your team\'s output.' },
  { title: 'Customer Support Automation', desc: 'Reduce ticket volume with AI systems that triage, resolve, and escalate support issues without constant human intervention.' },
];

const PROCESS_STEPS = [
  { step: '01', title: 'Discovery', desc: 'We audit your stack, data landscape, and business objectives to define a precise AI development scope and roadmap.' },
  { step: '02', title: 'Architecture', desc: 'Our engineers design scalable, secure AI architectures aligned with your cloud environment, compliance requirements, and growth trajectory.' },
  { step: '03', title: 'Development', desc: 'A dedicated AI team builds, tests, and iterates — shipping production-quality increments from week one using CI/CD pipelines.' },
  { step: '04', title: 'Deployment', desc: 'We deploy to production with monitoring, observability tooling, and complete handoff documentation so your team owns the system.' },
];

const INDUSTRIES = [
  { name: 'SaaS', desc: 'AI features, copilots, and usage analytics built into product roadmaps.' },
  { name: 'Healthcare', desc: 'HIPAA-compliant AI for clinical documentation, triage, and patient support.' },
  { name: 'Finance', desc: 'AI for fraud detection, risk scoring, reporting automation, and compliance.' },
  { name: 'Enterprise', desc: 'Internal AI tooling, workflow automation, and knowledge management at scale.' },
  { name: 'Education', desc: 'Adaptive learning systems, content generation, and student support chatbots.' },
  { name: 'E-commerce', desc: 'Product recommendation engines, search, and automated customer service.' },
];

const FAQS = [
  { q: 'What is AI Talent as a Service?', a: 'AI Talent as a Service is a model where companies access pre-assembled AI engineering teams on demand — without the overhead of traditional hiring, onboarding, and management. Fwdpod provides AI Talent as a Service through dedicated AI Engineering Pods: cross-functional teams of 4–6 AI specialists who embed directly into your delivery cycle and ship production-ready systems.' },
  { q: 'What are AI Engineering Pods?', a: 'AI Engineering Pods are Fwdpod\'s core delivery unit — a cross-functional team of 4–6 pre-assembled AI engineers, including LLM engineers, ML architects, backend engineers, and AI product managers — structured to deliver a specific AI outcome. Pods eliminate the coordination overhead of assembling individual contractors and move faster than any traditional hiring process.' },
  { q: 'How do I hire a dedicated AI team without traditional recruiting?', a: 'Traditional hiring cycles for AI engineers take 3–6 months. Fwdpod solves this with Dedicated AI Teams through a service model — pre-vetted, pre-assembled pods onboarded in 5–7 business days. You engage Fwdpod like a high-performance delivery partner: define the outcome, and your Dedicated GenAI Team handles execution.' },
  { q: 'What is a Managed AI Engineering Team?', a: 'A Managed AI Engineering Team is a fully operational, pre-organized group of AI specialists that takes ownership of your AI product delivery end-to-end — including architecture, development, testing, and deployment. Fwdpod pods function as Managed AI Engineering Teams: you define the outcome, and the pod handles execution without requiring you to manage individual engineers.' },
  { q: 'What does AI development include?', a: 'AI development covers the full lifecycle: requirements analysis, data architecture, model selection or fine-tuning, API and backend integration, evaluation pipelines, monitoring, and production deployment. Fwdpod delivers all of this through a dedicated AI engineering pod.' },
  { q: 'How long does an AI development project take?', a: 'Most engagements run 8–16 weeks depending on scope, data readiness, and integration complexity. Fwdpod\'s Dedicated AI Teams compress this timeline through parallel workstreams and pre-assembled team structures.' },
  { q: 'Do I need my own data to start an AI project?', a: 'Not necessarily. Many AI systems are built using foundation models (GPT-4, Claude, Gemini) combined with your product context, user feedback, and structured prompting — without proprietary training data.' },
  { q: 'What AI frameworks does Fwdpod work with?', a: 'Our pods work across OpenAI GPT, Anthropic Claude, Google Gemini, open-source LLMs (Llama, Mistral), LangChain, LangGraph, FastAPI, LlamaIndex, Pinecone, Weaviate, and all major cloud providers.' },
  { q: 'Can Fwdpod integrate AI into my existing product?', a: 'Yes. A large share of our engagements add AI capabilities to existing SaaS platforms, mobile apps, or enterprise systems via REST APIs, webhooks, or direct SDK integration — without requiring a full rebuild.' },
  { q: 'How does Fwdpod ensure production quality?', a: 'Every pod operates with evaluation pipelines, automated testing, output guardrails, and staged rollouts. We define measurable acceptance criteria at the start and gate deployment on meeting them.' },
  { q: 'What separates AI development from traditional software development?', a: 'AI systems introduce non-deterministic components — models, embeddings, prompts — that require probabilistic evaluation, fine-tuning pipelines, and runtime monitoring beyond standard code testing. Fwdpod\'s Enterprise AI Talent Solutions specialize in this intersection.' },
  { q: 'What is AI Pod as a Service?', a: 'AI Pod as a Service is a delivery model where organizations access a fully assembled AI Engineering Pod — covering AI/ML engineering, backend development, and MLOps — on a scoped, outcome-based contract. Instead of hiring individual engineers, you commission a pre-formed AI Delivery Pod or AI Project Pod configured for your exact use case. Fwdpod offers AI Pod as a Service as Custom AI Pods for single-initiative builds, AI Product Delivery Pods for multi-workstream programs, and AI Pod for Enterprise AI Projects requiring compliance architecture and deep system integration. Every engagement includes full IP ownership and a structured handover to your internal team.' },
  { q: 'What is a Dedicated GenAI Team for Startups?', a: 'A Dedicated GenAI Team for Startups is a pre-assembled group of AI engineers — including LLM engineers, backend AI developers, and MLOps specialists — organized as a cohesive pod for early-stage and growth companies. AI Engineering Pods for Startups through Fwdpod are sized for speed: smaller teams (3–4 engineers), fixed-scope engagements, and operational within one week of sign-off. This model gives startups access to senior AI engineering capacity without the 6–9 month hiring cycle that would otherwise delay AI product development.' },
  // TODO(copy): price band removed from this answer. Pricing is not approved for publication.
  { q: 'How much does AI development cost?', a: 'Engagement costs vary by scope, team composition, and timeline. Book a consultation for a scoped estimate.' },
];

const RELATED = [
  { label: 'LLM Development', href: '/services/llm-development' },
  { label: 'RAG Development', href: '/services/rag-development' },
  { label: 'AI Agents', href: '/services/ai-agents' },
  { label: 'Team Augmentation', href: '/services/team-augmentation' },
  { label: 'AI Consulting', href: '/services/ai-consulting' },
];

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://www.fwdpod.com/services/ai-development#webpage',
      url: 'https://www.fwdpod.com/services/ai-development',
      name: 'AI Development Services for Enterprise Teams | fwdpod',
      description: 'Embedded AI engineering pods that ship production AI systems — discovery to deployment. Senior engineers working inside your stack, not a handoff.',
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.fwdpod.com/' },
          { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://www.fwdpod.com/services/ai-development' },
          { '@type': 'ListItem', position: 3, name: 'AI Development Services', item: 'https://www.fwdpod.com/services/ai-development' },
        ],
      },
    },
    {
      '@type': 'Service',
      name: 'AI Development Services',
      description: 'AI Talent as a Service: Dedicated AI Engineering Pods, Managed AI Engineering Teams, and AI Engineers on Demand for startups and enterprises building production AI systems.',
      provider: { '@id': 'https://www.fwdpod.com/#organization' },
      serviceType: 'AI Software Development',
      areaServed: 'Worldwide',
    },
  ],
};

export default function AiDevelopmentView() {
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
        title="AI Development Services for Enterprise Teams | fwdpod"
        description="Embedded AI engineering pods that ship production AI systems — discovery to deployment. Senior engineers working inside your stack, not a handoff."
        jsonLd={JSON_LD}
      />

      {/* Hero */}
      <section className="space-y-5">
        <span className="bg-[#0066FF]/5 text-[#0066FF] text-[9px] font-mono uppercase px-3 py-1 font-bold tracking-widest rounded-md border border-[#0066FF]/10 inline-block">
          AI Development // Active
        </span>
        <div className="space-y-3 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-display font-medium tracking-tight text-[#0A0A0A] leading-tight">
            AI Development Services
          </h1>
          <p className="text-[#555555] text-sm md:text-base leading-relaxed">
            Fwdpod delivers AI Engineering Pods — Dedicated AI Teams of 4–6 specialists assembled around your exact use case. Whether you need AI Engineers on Demand for a focused sprint, a Managed AI Engineering Team for an end-to-end product build, or AI Pod as a Service for ongoing delivery capacity, Fwdpod provides the AI Talent as a Service your organization needs to move from architecture to production in weeks, not quarters.
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

      {/* What is AI Development? */}
      <section className="space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#0066FF] font-bold">About the Service</span>
          <h2 className="text-2xl md:text-3xl font-display font-medium tracking-tight text-[#0A0A0A]">
            What is AI Development?
          </h2>
        </div>
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-4 text-[#555555] text-sm leading-relaxed">
            <p>
              AI development is the end-to-end process of designing, building, and deploying artificial intelligence systems into production environments. It spans model selection, data architecture, backend engineering, API design, evaluation pipelines, monitoring, and ongoing optimization.
            </p>
            <p>
              Unlike conventional software development, AI systems introduce probabilistic outputs, hallucination risks, latency constraints, and continuous evaluation requirements. Building AI products that are reliable, scalable, and commercially viable requires a specialized blend of ML expertise, backend engineering, and product thinking.
            </p>
            <p>
              Fwdpod is an AI Talent as a Service company that assembles cross-functional Dedicated AI Engineering Pods — teams of 4–6 specialists that own the full delivery lifecycle from architecture to go-live. Whether you need Enterprise AI Talent Solutions for a regulated industry, AI Engineering Pods for Startups on a fast timeline, or AI Pod for Enterprise AI Projects at scale, every pod is structured around a single, measurable business outcome.
            </p>
          </div>
          <div className="bg-[#0A0A0A] text-white rounded-3xl p-6 space-y-5 border border-zinc-800">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Pod Metrics // AI Development</span>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Avg Delivery', value: '10–14 Weeks' },
                { label: 'Team Size', value: '4–6 Engineers' },
                { label: 'Stack Coverage', value: 'Full-Stack AI' },
                { label: 'Deployment', value: 'Production-Ready' },
              ].map(m => (
                <div key={m.label} className="p-3 bg-zinc-900 rounded-2xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block">{m.label}</span>
                  <span className="text-sm font-semibold text-white">{m.value}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              {['GPT-4 / Claude / Gemini', 'LangChain & LangGraph', 'FastAPI + Vector DBs', 'CI/CD + Observability'].map(item => (
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
          <h2 className="text-2xl md:text-3xl font-display font-medium tracking-tight text-[#0A0A0A]">What We Build</h2>
          <p className="text-[#555555] text-sm max-w-2xl">From customer-facing AI products to internal productivity tools — the most common AI systems our Dedicated AI Teams deliver.</p>
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

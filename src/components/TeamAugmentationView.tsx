import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, Check } from 'lucide-react';
import SEO from './SEO';

const USE_CASES = [
  { title: 'Scaling AI Engineering Capacity', desc: 'Embed pre-vetted AI engineers into your team to expand throughput on AI feature development without a 6-month hiring cycle — pure AI Team Extension with zero ramp waste.' },
  { title: 'Filling Specialist Gaps', desc: 'Access rare embedded AI engineers and dedicated AI architects — ML architects, LLM engineers, AI product managers, and MLOps specialists — without competing in the talent market.' },
  { title: 'Accelerating Active Projects', desc: 'Augment an in-progress AI project with AI Engineers on Demand to hit your launch deadline without compromising quality or context continuity.' },
  { title: 'Mentoring Internal Teams', desc: 'Embed senior AI engineers alongside your internal team to upskill engineers on LLM development, RAG architecture, and MLOps best practices.' },
  { title: 'Prototyping & Validation', desc: 'Spin up a pod to rapidly prototype AI features, validate product hypotheses, and generate evidence for internal roadmap decisions — faster than any internal hire.' },
  { title: 'Bridging to Full Hiring', desc: 'Use AI Team Extension Services as a bridge while you build internal AI hiring pipelines — ship product in parallel rather than waiting months.' },
];

const PROCESS_STEPS = [
  { step: '01', title: 'Discovery', desc: 'We assess your current team structure, active project needs, skill gaps, and technical environment to scope the right augmentation profile.' },
  { step: '02', title: 'Architecture', desc: 'We match you with the right pod composition — specific engineers, roles, and team size — aligned to your sprint cadence and delivery model.' },
  { step: '03', title: 'Development', desc: 'Embedded AI engineers join your workflow directly — attending standups, using your tools, and contributing to your codebase from week one.' },
  { step: '04', title: 'Deployment', desc: 'We ensure smooth knowledge transfer, documentation, and optionally transition to full team ownership or a retainer model for ongoing support.' },
];

const INDUSTRIES = [
  { name: 'SaaS', desc: 'Augment product engineering teams shipping AI features, copilots, and intelligent onboarding flows.' },
  { name: 'Healthcare', desc: 'Add AI specialists to clinical tech teams building compliant, regulated AI systems.' },
  { name: 'Finance', desc: 'Embed AI engineers into fintech teams building fraud detection, risk, and compliance automation.' },
  { name: 'Enterprise', desc: 'Supplement large internal teams with AI specialists for platform modernization and automation projects.' },
  { name: 'Education', desc: 'Support ed-tech teams building adaptive learning systems and AI tutoring tools.' },
  { name: 'E-commerce', desc: 'Augment product and data teams building AI-powered personalization and search experiences.' },
];

const FAQS = [
  { q: 'What are AI Team Extension Services?', a: 'AI Team Extension Services are a model where pre-assembled AI engineering specialists are embedded directly into your existing organization — extending your internal team\'s capacity without the delay of traditional hiring. Unlike outsourced projects, AI Team Extension means engineers join your standups, use your tools, and contribute to your codebase as if they were permanent staff. Fwdpod provides this through pre-vetted, context-ready pods.' },
  { q: 'What are Embedded AI Engineers?', a: 'Embedded AI Engineers are AI specialists who integrate into your team\'s day-to-day workflow — attending your ceremonies, using your project management tools, and owning deliverables alongside your permanent staff. Unlike contractors who work at arm\'s length, embedded AI engineers function as genuine extensions of your team with full context on your product, codebase, and delivery culture.' },
  { q: 'How do I hire dedicated AI architects without a long recruiting cycle?', a: 'Dedicated AI Architects from Fwdpod can be onboarded in 5–7 business days through our pod model. You bypass the 3–6 month recruiting cycle by accessing pre-vetted architects who already have hands-on experience in LLM system design, RAG architecture, and MLOps infrastructure. You engage Fwdpod, define the scope, and your Dedicated AI Architect is embedded and contributing within the first week.' },
  { q: 'What is AI team augmentation?', a: 'AI team augmentation means embedding Dedicated AI Engineers — from Fwdpod\'s pre-assembled pods — directly into your team to accelerate delivery. Unlike traditional staffing, AI Engineers on Demand through Fwdpod are pre-vetted, context-ready, and organized in collaborative pod structures rather than hired as individual contractors. This makes them faster to contribute and better coordinated.' },
  { q: 'What roles does Fwdpod provide for team augmentation?', a: 'We provide LLM engineers, ML architects, AI product managers, backend AI engineers, MLOps/AI infrastructure engineers, AI QA specialists, RAG system engineers, and Dedicated AI Architects. Pod compositions are tailored to your current gap and delivery model.' },
  { q: 'How quickly can an augmentation team be onboarded?', a: 'Fwdpod pods can be onboarded within 5–7 business days of scope agreement. Because pods are pre-formed and context-ready, ramp time is significantly faster than direct hiring for AI Experts for Hire — no 90-day onboarding cycles.' },
  { q: 'Can I hire a single engineer or do I need a full pod?', a: 'Both options are available. You can augment with a single specialist AI Engineer on Demand (e.g., an LLM engineer or Dedicated AI Architect) or embed a full pod of 4–6 engineers depending on your project scope and delivery timeline needs.' },
  { q: 'What are Forward Deployed AI Engineers?', a: 'Forward Deployed AI Engineers are senior AI specialists who embed inside your organization — working in your environment, tools, and processes — with direct accountability for delivery outcomes rather than hours billed. Unlike traditional contractors who operate at arm\'s length, Forward Deployed AI Engineers attend your standups, participate in architecture decisions, and own workstreams end to end. Fwdpod deploys Forward Deployed AI Engineers for organizations that need AI engineering capacity integrated into active delivery pipelines, particularly when internal teams have strong product context but lack the specialist AI skills required to ship to production.' },
  { q: 'How does pricing work for team augmentation?', a: 'Augmentation is typically structured as a monthly engagement with a fixed team composition. Pricing varies based on team size, seniority, and specialization. Book a consultation for a scoped proposal.' },
  { q: 'Do augmentation engineers sign NDAs and IP agreements?', a: 'Yes. All Fwdpod engineers sign NDAs, IP assignment agreements, and data handling policies. Any code, models, or systems built during the engagement are fully owned by your organization.' },
];

const RELATED = [
  { label: 'AI Development', href: '/services/ai-development' },
  { label: 'LLM Development', href: '/services/llm-development' },
  { label: 'RAG Development', href: '/services/rag-development' },
  { label: 'AI Agents', href: '/services/ai-agents' },
  { label: 'AI Consulting', href: '/services/ai-consulting' },
];

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://www.fwdpod.com/services/team-augmentation#webpage',
      url: 'https://www.fwdpod.com/services/team-augmentation',
      name: 'AI Team Augmentation | Embedded Engineering Pods | fwdpod',
      description: 'Add senior AI and full-stack engineers to your team in weeks. Embedded pods that work in your stack, sprints and tooling — no ramp-up tax.',
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.fwdpod.com/' },
          { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://www.fwdpod.com/services/team-augmentation' },
          { '@type': 'ListItem', position: 3, name: 'AI Team Augmentation Services', item: 'https://www.fwdpod.com/services/team-augmentation' },
        ],
      },
    },
    {
      '@type': 'Service',
      name: 'AI Team Augmentation Services',
      description: 'AI Team Extension Services: Embedded AI Engineers, Dedicated AI Architects, and AI Engineers on Demand — pre-assembled pods integrated into your team in days, not months.',
      provider: { '@id': 'https://www.fwdpod.com/#organization' },
      serviceType: 'AI Team Augmentation',
      areaServed: 'Worldwide',
    },
  ],
};

export default function TeamAugmentationView() {
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
        title="AI Team Augmentation | Embedded Engineering Pods | fwdpod"
        description="Add senior AI and full-stack engineers to your team in weeks. Embedded pods that work in your stack, sprints and tooling — no ramp-up tax."
        jsonLd={JSON_LD}
      />

      {/* Hero */}
      <section className="space-y-5">
        <span className="bg-[#0066FF]/5 text-[#0066FF] text-[9px] font-mono uppercase px-3 py-1 font-bold tracking-widest rounded-md border border-[#0066FF]/10 inline-block">
          Team Augmentation // Active
        </span>
        <div className="space-y-3 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-display font-medium tracking-tight text-[#0A0A0A] leading-tight">
            AI Team Augmentation Services
          </h1>
          <p className="text-[#555555] text-sm md:text-base leading-relaxed">
            Fwdpod provides AI Team Extension Services — embedding Forward Deployed AI Engineers, Embedded AI Engineers, and Dedicated AI Architects directly into your organization to fill specialist gaps, accelerate active projects, and ship AI products without waiting months for internal hires. Access AI Engineers on Demand and AI Experts for Hire through pre-assembled pods that integrate into your workflow from day one.
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

      {/* What is AI Team Augmentation? */}
      <section className="space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#0066FF] font-bold">About the Service</span>
          <h2 className="text-2xl md:text-3xl font-display font-medium tracking-tight text-[#0A0A0A]">
            What is AI Team Augmentation?
          </h2>
        </div>
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-4 text-[#555555] text-sm leading-relaxed">
            <p>
              AI team augmentation is the practice of embedding Embedded AI Engineers directly into your organization to extend your internal team's capacity. Unlike traditional outsourcing, augmentation engineers work inside your systems, attend your meetings, and own deliverables alongside your permanent staff — this is genuine AI Team Extension, not vendor management.
            </p>
            <p>
              The AI talent market is one of the most competitive in technology. Hiring a single senior LLM engineer can take 3–6 months. Hiring a Dedicated AI Architect can take even longer. Building a full AI pod internally — with the right mix of ML architecture, backend engineering, and product expertise — can take 12 months or more.
            </p>
            <p>
              Fwdpod solves this with pre-assembled pods: cross-functional AI engineering teams that are vetted, context-ready, and structured for immediate contribution. Hire AI Architects, AI Experts for Hire, and Dedicated AI Architects in days, not months — with full IP ownership and alignment to your delivery culture.
            </p>
          </div>
          <div className="bg-[#0A0A0A] text-white rounded-3xl p-6 space-y-5 border border-zinc-800">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Pod Metrics // Team Augmentation</span>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Onboarding', value: '5–7 Days' },
                { label: 'Team Size', value: '1–6 Engineers' },
                { label: 'Engagement', value: 'Monthly Basis' },
                { label: 'IP Ownership', value: 'Fully Yours' },
              ].map(m => (
                <div key={m.label} className="p-3 bg-zinc-900 rounded-2xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block">{m.label}</span>
                  <span className="text-sm font-semibold text-white">{m.value}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              {['LLM & ML engineers', 'Dedicated AI Architects', 'MLOps & infrastructure', 'NDA + IP agreements included'].map(item => (
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
          <h2 className="text-2xl md:text-3xl font-display font-medium tracking-tight text-[#0A0A0A]">When Teams Choose Augmentation</h2>
          <p className="text-[#555555] text-sm max-w-2xl">Common scenarios where companies use Fwdpod's AI Team Extension Services to accelerate AI delivery.</p>
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
          <h2 className="text-2xl md:text-3xl font-display font-medium tracking-tight text-[#0A0A0A]">How We Embed</h2>
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

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, Check } from 'lucide-react';
import SEO from './SEO';

const USE_CASES = [
  { title: 'Sales Agents', desc: 'Deploy autonomous sales agents that research prospects, personalize outreach, update CRM records, and qualify leads — without manual intervention at every step.' },
  { title: 'Support Agents', desc: 'Move beyond FAQ bots — deploy agentic support systems that query your systems, process requests, update records, and resolve issues end to end.' },
  { title: 'Research Agents', desc: 'Build autonomous research agents that browse the web, aggregate data sources, synthesize findings, and deliver structured reports on demand.' },
  { title: 'Workflow Agents', desc: 'Deploy agents that autonomously execute multi-step business processes across APIs, databases, and SaaS tools — without human intervention for routine tasks.' },
  { title: 'Multi-Agent Systems', desc: 'Architect coordinated networks of specialized agents — planner, executor, reviewer, and synthesizer roles — for complex tasks that exceed single-agent capability.' },
  { title: 'DevOps & Coding Agents', desc: 'Automate code review, PR generation, deployment pipelines, and infrastructure monitoring with AI agents that integrate with your engineering toolchain.' },
];

const PROCESS_STEPS = [
  { step: '01', title: 'Discovery', desc: 'We map your target workflows, define the agent\'s action space, identify tool integrations, and specify success criteria and failure modes.' },
  { step: '02', title: 'Architecture', desc: 'We design the agent loop, memory architecture (short-term and long-term), tool/function calling schema, and orchestration framework.' },
  { step: '03', title: 'Development', desc: 'The pod builds, red-teams, and iterates on the agent system — including fallback handling, human-in-the-loop escalation, and observability hooks.' },
  { step: '04', title: 'Deployment', desc: 'We ship with monitoring dashboards, execution trace logging, cost controls, and guardrails — so you have full visibility into what your agents are doing.' },
];

const INDUSTRIES = [
  { name: 'SaaS', desc: 'In-product automation agents, user workflow assistants, and integration bots.' },
  { name: 'Healthcare', desc: 'Clinical documentation agents, appointment scheduling, and care coordination automation.' },
  { name: 'Finance', desc: 'Trade monitoring agents, document processing, fraud alert triage, and reporting automation.' },
  { name: 'Enterprise', desc: 'IT helpdesk agents, HR process automation, procurement bots, and knowledge ops.' },
  { name: 'Education', desc: 'Student support agents, curriculum generation, and administrative workflow automation.' },
  { name: 'E-commerce', desc: 'Inventory management agents, order processing bots, and merchandising automation.' },
];

const FAQS = [
  { q: 'What is Agentic AI Development?', a: 'Agentic AI Development is the practice of building software systems where a language model acts as the autonomous reasoning and planning engine — selecting and executing actions from a defined toolkit to complete multi-step goals without step-by-step human instruction. Unlike chatbots that respond with text, agentic AI systems act: they call APIs, query databases, write code, send messages, and modify system state. Fwdpod\'s agentic AI development team specializes in building reliable, production-grade agentic systems.' },
  { q: 'What are Multi-Agent AI Systems?', a: 'Multi-Agent AI Systems use multiple specialized AI agents that collaborate, delegate, and coordinate to complete complex tasks — tasks that exceed what a single agent can reliably accomplish. For example, a research system might use a planner agent, multiple domain-specific researcher agents, and a synthesizer agent operating in parallel. Fwdpod designs multi-agent AI systems using LangGraph and CrewAI, with full observability and human-in-the-loop checkpoints.' },
  { q: 'What are Autonomous AI Agents for enterprises?', a: 'Autonomous AI Agents for enterprises are production-grade agentic systems designed to operate reliably within organizational constraints — with role-based access controls, audit logging, compliance guardrails, and escalation paths. Unlike experimental agents, enterprise autonomous AI agents require SLA-grade reliability, cost controls, and security architecture. Fwdpod builds these with observability-first design from the start.' },
  { q: 'What is Custom AI Agent Development Services?', a: 'Custom AI Agent Development Services involve building a bespoke agentic system tailored to your specific workflows, tools, and business rules — rather than adapting a general-purpose agent framework. Fwdpod\'s custom AI agent development covers action space design, tool integration, memory architecture, guardrail implementation, and production deployment for each unique use case.' },
  { q: 'What frameworks does Fwdpod use for AI agent development?', a: 'We build agents using LangGraph (for stateful multi-step agents), CrewAI (for role-based multi-agent systems), LangChain (for tool use and chain orchestration), AutoGen (for collaborative multi-agent workflows), and custom MCP Integration architectures on GPT-4, Claude, and Gemini. Framework selection depends on your use case, reliability requirements, and team preferences.' },
  { q: 'What are CrewAI and LangGraph, and how does Fwdpod use them?', a: 'CrewAI is a framework for building role-based multi-agent systems where each agent has a defined role, goal, and backstory — ideal for collaborative AI workflows. LangGraph is a state-machine framework for building stateful, multi-step agents with fine-grained control over execution flow. Fwdpod uses both frameworks as part of our custom AI agent development services, selecting the right tool based on your orchestration complexity.' },
  { q: 'What is MCP Integration in AI agents?', a: 'MCP (Model Context Protocol) Integration connects AI agents to external tools, APIs, and data sources through a standardized protocol — enabling agents to interact with any MCP-compatible service without custom API wrappers. Fwdpod builds MCP Integration as part of enterprise agent architectures to simplify tool connectivity and reduce maintenance overhead as your agent toolset grows.' },
  { q: 'How do you prevent AI agents from taking harmful or unintended actions?', a: 'We implement guardrails at multiple layers: action whitelisting (agents can only use approved tools), human-in-the-loop checkpoints for high-stakes actions, output validation before execution, rate limiting, and comprehensive audit logging. Every agentic AI development engagement includes a risk assessment and red-teaming phase.' },
  { q: 'How long does an AI agent project take?', a: 'Focused single-workflow agents can ship in 4–8 weeks. Complex multi-agent AI systems with many tool integrations, custom memory architectures, and high-reliability requirements typically take 10–16 weeks.' },
];

const RELATED = [
  { label: 'AI Development', href: '/services/ai-development' },
  { label: 'LLM Development', href: '/services/llm-development' },
  { label: 'RAG Development', href: '/services/rag-development' },
  { label: 'Team Augmentation', href: '/services/team-augmentation' },
  { label: 'AI Consulting', href: '/services/ai-consulting' },
];

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://www.fwdpod.com/services/ai-agents#webpage',
      url: 'https://www.fwdpod.com/services/ai-agents',
      name: 'AI Agent Development Services for Enterprises | fwdpod',
      description: 'Design and ship AI agents that act inside your systems — tool use, orchestration, guardrails and human-in-the-loop, built by a forward deployed pod.',
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.fwdpod.com/' },
          { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://www.fwdpod.com/services/ai-agents' },
          { '@type': 'ListItem', position: 3, name: 'AI Agent Development Services', item: 'https://www.fwdpod.com/services/ai-agents' },
        ],
      },
    },
    {
      '@type': 'Service',
      name: 'AI Agent Development Services',
      description: 'Agentic AI Development: custom AI agent development services, multi-agent AI systems, and autonomous AI agents for enterprises — CrewAI experts, LangGraph developers, and MCP integration specialists.',
      provider: { '@id': 'https://www.fwdpod.com/#organization' },
      serviceType: 'AI Agent Development',
      areaServed: 'Worldwide',
    },
  ],
};

export default function AiAgentsView() {
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
        title="AI Agent Development Services for Enterprises | fwdpod"
        description="Design and ship AI agents that act inside your systems — tool use, orchestration, guardrails and human-in-the-loop, built by a forward deployed pod."
        jsonLd={JSON_LD}
      />

      {/* Hero */}
      <section className="space-y-5">
        <span className="bg-[#0066FF]/5 text-[#0066FF] text-[9px] font-mono uppercase px-3 py-1 font-bold tracking-widest rounded-md border border-[#0066FF]/10 inline-block">
          AI Agents // Active
        </span>
        <div className="space-y-3 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-display font-medium tracking-tight text-[#0A0A0A] leading-tight">
            AI Agent Development Services
          </h1>
          <p className="text-[#555555] text-sm md:text-base leading-relaxed">
            Fwdpod's agentic AI development team builds autonomous AI agents and multi-agent AI systems that take real actions — calling APIs, processing data, executing workflows, and coordinating across tools without constant human oversight. As specialists in custom AI agent development services, we deploy CrewAI, LangGraph, and MCP Integration architectures for production-grade agentic operations.
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

      {/* What is AI Agent Development? */}
      <section className="space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#0066FF] font-bold">About the Service</span>
          <h2 className="text-2xl md:text-3xl font-display font-medium tracking-tight text-[#0A0A0A]">
            What is AI Agent Development?
          </h2>
        </div>
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-4 text-[#555555] text-sm leading-relaxed">
            <p>
              AI agent development is the practice of building software systems where a language model acts as the reasoning and planning engine — autonomously selecting and executing actions from a defined toolkit to complete multi-step goals. Unlike chatbots that respond with text, agents act: they call APIs, query databases, write code, send messages, and modify system state.
            </p>
            <p>
              Building reliable autonomous AI agents for enterprises requires rigorous design of the action space, memory architecture, fallback strategies, and observability infrastructure. Without these, agents become unpredictable and dangerous in production environments. Multi-agent AI systems add an additional layer of orchestration complexity that demands specialized architecture expertise.
            </p>
            <p>
              Fwdpod's Agentic Operations pods are specialists in custom AI agent development services — building CrewAI-based role systems, LangGraph state machines, and MCP Integration architectures that are reliable, auditable, and observable, with guardrails and escalation paths built in from day one.
            </p>
          </div>
          <div className="bg-[#0A0A0A] text-white rounded-3xl p-6 space-y-5 border border-zinc-800">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Pod Metrics // AI Agents</span>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Avg Delivery', value: '6–14 Weeks' },
                { label: 'Agent Types', value: 'Single & Multi' },
                { label: 'Observability', value: 'Full Trace Logs' },
                { label: 'Guardrails', value: 'Built-In Safety' },
              ].map(m => (
                <div key={m.label} className="p-3 bg-zinc-900 rounded-2xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block">{m.label}</span>
                  <span className="text-sm font-semibold text-white">{m.value}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              {['LangGraph & CrewAI', 'MCP Integration', 'Human-in-the-loop checkpoints', 'LangSmith observability'].map(item => (
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
          <p className="text-[#555555] text-sm max-w-2xl">Common AI agent systems our agentic AI development team designs and deploys for enterprises and product teams.</p>
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

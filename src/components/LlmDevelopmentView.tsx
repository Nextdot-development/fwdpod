import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, Check } from 'lucide-react';
import SEO from './SEO';

const USE_CASES = [
  { title: 'Enterprise Chatbots', desc: 'Build enterprise-grade conversational systems powered by fine-tuned or prompted LLMs that stay on-brand, on-topic, and within compliance guardrails at scale.' },
  { title: 'AI Copilots', desc: 'Embed LLM-powered copilots into IDEs, dashboards, and SaaS products that provide context-aware suggestions to users in real time.' },
  { title: 'Knowledge Assistants', desc: 'Deploy custom LLM applications that surface accurate answers from internal documentation, SOPs, and knowledge bases — reducing time spent searching.' },
  { title: 'Internal Search', desc: 'Replace keyword search with LLM-based semantic retrieval that understands intent and surfaces relevant content from large enterprise corpora.' },
  { title: 'Customer Support AI', desc: 'Route and resolve support tickets using LLMs trained on your product documentation, tone, and escalation policies — reducing ticket volume automatically.' },
  { title: 'Document Processing & Extraction', desc: 'Use LLMs to extract, classify, and summarize structured information from contracts, invoices, reports, and unstructured documents at scale.' },
];

const PROCESS_STEPS = [
  { step: '01', title: 'Discovery', desc: 'We evaluate your use case, data assets, and performance requirements to recommend the right LLM approach — prompt engineering, RAG, or fine-tuning.' },
  { step: '02', title: 'Architecture', desc: 'We design the LLM system architecture: model selection, context strategy, embedding pipeline, caching layer, and API contract.' },
  { step: '03', title: 'Development', desc: 'The pod builds, red-teams, and iterates on the LLM system — including prompt engineering, evaluation harnesses, and safety filtering.' },
  { step: '04', title: 'Deployment', desc: 'We ship to production with latency optimization, rate-limit handling, streaming support, and cost observability dashboards.' },
];

const INDUSTRIES = [
  { name: 'SaaS', desc: 'In-product LLM features, natural language interfaces, and AI-powered onboarding flows.' },
  { name: 'Healthcare', desc: 'HIPAA-compliant clinical documentation, medical Q&A, and patient communication assistants.' },
  { name: 'Finance', desc: 'Regulatory document analysis, financial report summarization, and compliance Q&A systems.' },
  { name: 'Enterprise', desc: 'Internal knowledge bases, HR assistants, and executive briefing automation.' },
  { name: 'Education', desc: 'Tutoring assistants, essay feedback, curriculum generation, and student Q&A tools.' },
  { name: 'E-commerce', desc: 'Product description generation, review summarization, and personalized shopping assistants.' },
];

const FAQS = [
  { q: 'What are Enterprise LLM Development Services?', a: 'Enterprise LLM Development Services are specialized engineering engagements focused on designing, building, and deploying large language model systems at enterprise scale — with production reliability, security, compliance, and cost optimization requirements. Fwdpod\'s enterprise LLM engagements cover the full stack: model selection, prompt architecture, RAG integration, fine-tuning, evaluation pipelines, and monitored production deployment.' },
  { q: 'What does Custom LLM Application Development include?', a: 'Custom LLM Application Development involves building a bespoke software product powered by a large language model — tailored to your specific use case, data, and user workflows rather than deploying an off-the-shelf AI tool. This includes prompt engineering, application architecture, backend API design, LLM integration, evaluation harness setup, UX integration, and deployment infrastructure.' },
  { q: 'What is LLM development?', a: 'LLM development refers to building production systems powered by large language models — including model selection, prompt engineering, fine-tuning, RAG pipeline design, evaluation, and deployment. Fwdpod\'s Dedicated GenAI Teams handle the full stack for enterprises and startups.' },
  { q: 'Should I fine-tune an LLM or use prompt engineering?', a: 'For most use cases, prompt engineering combined with RAG delivers faster results at lower cost. Fine-tuning is valuable when you need style consistency, domain-specific vocabulary, or behavior not achievable through prompting alone. We assess this during discovery.' },
  { q: 'Which LLMs does Fwdpod work with?', a: 'We work across GPT-4o, Claude 3.5/4, Gemini 1.5 Pro, and open-source models including Llama 3, Mistral, Mixtral, and Phi-3. Model selection depends on your latency, cost, privacy, and capability requirements.' },
  { q: 'How do you prevent LLM hallucinations in production?', a: 'We implement grounding strategies (RAG, tool use), output validation layers, confidence scoring, and human-in-the-loop escalation paths to minimize hallucination risk. Every deployment includes a red-teaming phase.' },
  { q: 'Can Fwdpod build a private, on-premise LLM deployment?', a: 'Yes. We support on-premise and VPC deployments using open-source models (Llama, Mistral) via vLLM or Ollama, ensuring your data never leaves your infrastructure — a critical requirement for many enterprise LLM development services.' },
  { q: 'How do you handle LLM token costs at scale?', a: 'We implement semantic caching (e.g., Redis + similarity search), prompt compression, context window optimization, and model routing (sending simple queries to cheaper models) to significantly reduce per-request costs.' },
  { q: 'What evaluation frameworks do you use?', a: 'We use RAGAS, LangSmith, Promptfoo, and custom evaluation harnesses to measure LLM system quality across dimensions like faithfulness, relevance, toxicity, and task-specific metrics.' },
  { q: 'How long does an LLM development project take?', a: 'Focused LLM integrations can ship in 4–8 weeks. Full-stack LLM platforms with fine-tuning, RAG, and custom evaluation pipelines typically take 10–16 weeks. Enterprise LLM Development Services with compliance requirements may extend timelines.' },
  { q: 'Does Fwdpod handle LLM security and prompt injection?', a: 'Yes. We implement prompt injection defenses, input/output sanitization, system prompt hardening, and rate limiting to protect LLM-powered systems from adversarial inputs and abuse.' },
];

const RELATED = [
  { label: 'AI Development', href: '/services/ai-development' },
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
      '@id': 'https://www.fwdpod.com/services/llm-development#webpage',
      url: 'https://www.fwdpod.com/services/llm-development',
      name: 'LLM Development Services | Custom Models & Apps | fwdpod',
      description: 'Build, fine-tune and deploy LLM applications with an embedded pod — evals, guardrails, cost control and production monitoring from day one.',
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.fwdpod.com/' },
          { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://www.fwdpod.com/services/llm-development' },
          { '@type': 'ListItem', position: 3, name: 'LLM Development Services', item: 'https://www.fwdpod.com/services/llm-development' },
        ],
      },
    },
    {
      '@type': 'Service',
      name: 'LLM Development Services',
      description: 'Enterprise LLM Development Services and Custom LLM Application Development — AI copilots, enterprise chatbots, knowledge assistants, and internal search systems built by a Dedicated GenAI Team.',
      provider: { '@id': 'https://www.fwdpod.com/#organization' },
      serviceType: 'Large Language Model Development',
      areaServed: 'Worldwide',
    },
  ],
};

export default function LlmDevelopmentView() {
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
        title="LLM Development Services | Custom Models & Apps | fwdpod"
        description="Build, fine-tune and deploy LLM applications with an embedded pod — evals, guardrails, cost control and production monitoring from day one."
        jsonLd={JSON_LD}
      />

      {/* Hero */}
      <section className="space-y-5">
        <span className="bg-[#0066FF]/5 text-[#0066FF] text-[9px] font-mono uppercase px-3 py-1 font-bold tracking-widest rounded-md border border-[#0066FF]/10 inline-block">
          LLM Development // Active
        </span>
        <div className="space-y-3 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-display font-medium tracking-tight text-[#0A0A0A] leading-tight">
            LLM Development Services
          </h1>
          <p className="text-[#555555] text-sm md:text-base leading-relaxed">
            Fwdpod designs, builds, and deploys enterprise LLM systems for product teams and enterprises — from custom LLM application development and prompt engineering to fine-tuning and full LLM platform architecture. Whether you need a Dedicated GenAI Team for Startups moving fast or Enterprise LLM Development Services for a regulated deployment, our team handles the full complexity so you ship without reliability tradeoffs.
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

      {/* What is LLM Development? */}
      <section className="space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#0066FF] font-bold">About the Service</span>
          <h2 className="text-2xl md:text-3xl font-display font-medium tracking-tight text-[#0A0A0A]">
            What is LLM Development?
          </h2>
        </div>
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-4 text-[#555555] text-sm leading-relaxed">
            <p>
              LLM development is the practice of building software systems that leverage large language models as their core reasoning and generation engine. It goes beyond API calls — it involves designing prompting strategies, evaluation frameworks, grounding pipelines, safety layers, and cost-optimization architectures.
            </p>
            <p>
              The decision between prompt engineering, retrieval-augmented generation (RAG), and fine-tuning is critical in custom LLM application development. It depends on your data, latency requirements, and quality targets. Fwdpod's Dedicated GenAI Teams are experienced in all three approaches and implement hybrid architectures where needed.
            </p>
            <p>
              From GPT-4o to Claude 4 to self-hosted open-source models, our enterprise LLM development services select the right foundation model for your use case, cost profile, and compliance requirements — then build the full system around it properly.
            </p>
          </div>
          <div className="bg-[#0A0A0A] text-white rounded-3xl p-6 space-y-5 border border-zinc-800">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Pod Metrics // LLM Development</span>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Avg Delivery', value: '6–14 Weeks' },
                { label: 'Models Supported', value: '10+ LLMs' },
                { label: 'Deployment', value: 'Cloud or On-Prem' },
                { label: 'Evaluation', value: 'Built-In Harness' },
              ].map(m => (
                <div key={m.label} className="p-3 bg-zinc-900 rounded-2xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block">{m.label}</span>
                  <span className="text-sm font-semibold text-white">{m.value}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              {['Prompt Engineering & RAG', 'Fine-tuning (LoRA / QLoRA)', 'LangChain / LangGraph', 'vLLM, Ollama, Llama.cpp'].map(item => (
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
          <p className="text-[#555555] text-sm max-w-2xl">Common LLM-powered systems our Dedicated GenAI Teams design and deploy for product teams and enterprises.</p>
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

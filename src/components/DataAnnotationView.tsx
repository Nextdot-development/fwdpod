import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, ChevronDown, Check, ChevronRight, FileCheck, Gauge, Users, ShieldCheck } from 'lucide-react';
import SEO, { SITE_BASE_URL } from './SEO';

const PAGE_URL = `${SITE_BASE_URL}/services/data-annotation`;
const TITLE = 'Data Annotation Services for LLM & AI | Fwdpod';
const DESCRIPTION =
  'AI data annotation services for LLMs, RAG and AI agents: RLHF and SFT data, evaluation datasets, audio and document labeling, and PII redaction.';

const ANNOTATION_TYPES = [
  { title: 'RLHF and preference data', desc: 'Human preference ranking and response comparison data for aligning LLMs to your domain and policies.' },
  { title: 'SFT dataset creation', desc: 'Instruction–response pairs and supervised fine-tuning datasets written and reviewed against your guidelines.' },
  { title: 'LLM evaluation datasets', desc: 'Golden datasets and human evaluation of LLM outputs for accuracy, safety and task success.' },
  { title: 'RAG evaluation and ground truth', desc: 'Question–answer–source sets that measure retrieval quality and answer faithfulness in your RAG system.' },
  { title: 'AI agent trajectory annotation', desc: 'Step-by-step review of agent actions and tool calls to find where multi-step workflows fail.' },
  { title: 'Audio and speech annotation', desc: 'Transcription, intent tagging and conversational AI training data for voice agents.' },
  { title: 'Document and OCR annotation', desc: 'Field-level labeling of invoices, forms and contracts for document AI and extraction pipelines.' },
  { title: 'Text, intent and entity annotation (NER)', desc: 'Classification, intent and named entity annotation for search, routing and support automation.' },
  { title: 'PII redaction and data de-identification', desc: 'Removing or masking personal data before it is used for AI training or evaluation.' },
];

const POD_BENEFITS = [
  { icon: Users, text: 'Guidelines are written by the engineers who will use the data, so labels match what the model actually needs.' },
  { icon: Gauge, text: 'Every dataset ships with an evaluation benchmark, so you can measure whether the model improved.' },
  { icon: FileCheck, text: 'Annotation, fine-tuning, RAG tuning and deployment sit under one accountable owner. No hand-off gaps between a labeling vendor and a dev team.' },
  { icon: ShieldCheck, text: 'Quality control built in: written annotation guidelines, inter-annotator agreement checks, and reviewer sign-off on every batch.' },
];

const PROCESS_STEPS = [
  { step: '01', title: 'Scope', desc: 'Data types, volume, quality targets and the model outcome the data supports.' },
  { step: '02', title: 'Guidelines and pilot batch', desc: 'Written annotation guidelines, an edge-case log and a pilot batch for your review.' },
  { step: '03', title: 'Production annotation with QA', desc: 'Batch delivery with agreement checks and reviewer sign-off.' },
  { step: '04', title: 'Evaluate and hand over', desc: 'Datasets in your required format (JSONL, CSV, COCO or custom schema) plus guidelines, QA reports and evaluation results.' },
];

// The same text feeds the accordion and the FAQPage schema, so they cannot drift.
const FAQS = [
  { q: 'What are data annotation services?', a: 'Data annotation services label, rank or structure raw data such as text, documents, audio and model outputs, so it can be used to train, fine-tune or evaluate AI models. For LLM projects this includes RLHF preference data, SFT datasets and evaluation datasets.' },
  { q: 'What is the difference between data annotation and data labeling?', a: 'The terms are mostly used interchangeably. Data labeling usually means assigning a tag or class to an item. Data annotation is broader and includes ranking model responses, writing instruction data, marking entities and reviewing agent actions.' },
  { q: 'Do you provide RLHF and LLM evaluation data?', a: 'Yes. Fwdpod creates human preference data, supervised fine-tuning datasets, golden evaluation sets and human evaluations of LLM outputs, all tied to the model your pod is building or improving.' },
  { q: 'Can you annotate data for a RAG system or AI agent?', a: 'Yes. We build ground-truth question–answer–source sets to evaluate retrieval and answer quality, and we annotate agent trajectories to find where multi-step workflows break.' },
  { q: 'How do you control annotation quality?', a: 'Every project starts with written annotation guidelines and a pilot batch. Production batches go through inter-annotator agreement checks and reviewer sign-off, and results are measured against an evaluation benchmark.' },
  { q: 'Who owns the annotated data?', a: 'You do. All datasets, labels and guidelines are assigned to you under the engagement contract.' },
  { q: 'Can data annotation be added to an existing AI engineering pod?', a: 'Yes. Annotation can run inside an LLM, RAG, Agentic Operations, Voice AI or Compliance AI pod, or as a standalone data and evaluation engagement.' },
];

const RELATED = [
  { label: 'LLM Development', href: '/services/llm-development' },
  { label: 'RAG Development', href: '/services/rag-development' },
  { label: 'AI Agents', href: '/services/ai-agents' },
  { label: 'AI Development', href: '/services/ai-development' },
  { label: 'Team Augmentation', href: '/services/team-augmentation' },
];

const SERVICE_LD = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Data Annotation Services',
  serviceType: 'AI data annotation and labeling',
  description: 'Data annotation services for LLMs, RAG systems, AI agents and voice AI, including RLHF and SFT datasets, LLM evaluation data, audio and document annotation, and PII redaction.',
  provider: { '@type': 'Organization', name: 'Fwdpod', url: `${SITE_BASE_URL}/` },
  areaServed: ['US', 'GB', 'EU', 'AE', 'SA'],
  url: PAGE_URL,
};

const FAQ_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

// There is no services index page, so "Services" carries no URL of its own:
// like the other service pages, it points at this service.
const BREADCRUMB_LD = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_BASE_URL}/` },
    { '@type': 'ListItem', position: 2, name: 'Services', item: PAGE_URL },
    { '@type': 'ListItem', position: 3, name: 'Data Annotation', item: PAGE_URL },
  ],
};

const ldScript = (data: object) => JSON.stringify(data).replace(/</g, '\\u003c');

const linkClass = 'text-[#0066FF] hover:underline';

export default function DataAnnotationView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto py-6 font-sans space-y-14"
    >
      <SEO title={TITLE} description={DESCRIPTION} canonical="/services/data-annotation" />
      <Helmet>
        <script type="application/ld+json">{ldScript(SERVICE_LD)}</script>
        <script type="application/ld+json">{ldScript(FAQ_LD)}</script>
        <script type="application/ld+json">{ldScript(BREADCRUMB_LD)}</script>
      </Helmet>

      {/* Hero */}
      <section className="space-y-5">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#555555]">
            <li><Link to="/" className="hover:text-[#0A0A0A] hover:underline">Home</Link></li>
            <li aria-hidden="true"><ChevronRight className="w-3 h-3" /></li>
            <li>Services</li>
            <li aria-hidden="true"><ChevronRight className="w-3 h-3" /></li>
            <li aria-current="page" className="text-[#0A0A0A] font-medium">Data Annotation</li>
          </ol>
        </nav>
        <span className="bg-[#0066FF]/5 text-[#0066FF] text-[9px] font-mono uppercase px-3 py-1 font-bold tracking-widest rounded-md border border-[#0066FF]/10 inline-block">
          Data Annotation // Active
        </span>
        <div className="space-y-3 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-display font-medium tracking-tight text-[#0A0A0A] leading-tight">
            AI Data Annotation Services for LLMs, RAG and AI Agents
          </h1>
          <p className="text-[#555555] text-sm md:text-base leading-relaxed">
            Fwdpod provides data annotation services for enterprise teams building LLM applications,{' '}
            <Link to="/services/rag-development" className={linkClass}>RAG systems</Link>,{' '}
            <Link to="/services/ai-agents" className={linkClass}>AI agents</Link> and voice AI. Your annotation work is run by the same pod that builds and evaluates your model, so labels, guidelines and evaluation benchmarks are designed around the outcome you are shipping, not handed off to a separate vendor. One team, one contract, one accountable owner.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/configure" className="bg-[#0066FF] hover:bg-[#0055DD] text-white font-semibold text-xs px-6 py-3 rounded-full transition-colors">
            Scope your annotation project
          </Link>
          <Link to="/contact" className="border border-[#0A0A0A] text-[#0A0A0A] font-semibold text-xs px-6 py-3 rounded-full hover:bg-[#0A0A0A]/5 transition-colors flex items-center gap-1.5">
            Talk to a Technical Principal <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* What we annotate */}
      <section className="space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#0066FF] font-bold">Annotation Types</span>
          <h2 className="text-2xl md:text-3xl font-display font-medium tracking-tight text-[#0A0A0A]">What we annotate</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ANNOTATION_TYPES.map(item => (
            <div key={item.title} className="border border-[#0A0A0A]/10 rounded-3xl p-5 space-y-2 hover:border-[#0066FF]/30 hover:shadow-sm transition-all bg-white">
              <h3 className="text-sm font-semibold text-[#0A0A0A]">{item.title}</h3>
              <p className="text-xs text-[#555555] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why inside a pod */}
      <section className="space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#0066FF] font-bold">The Pod Model</span>
          <h2 className="text-2xl md:text-3xl font-display font-medium tracking-tight text-[#0A0A0A]">Why annotation works better inside an AI pod</h2>
        </div>
        <ul className="grid sm:grid-cols-2 gap-4">
          {POD_BENEFITS.map(({ icon: Icon, text }) => (
            <li key={text} className="border border-[#0A0A0A]/10 rounded-2xl p-5 flex gap-3 items-start bg-white">
              <span className="bg-[#0066FF]/5 text-[#0066FF] p-2 rounded-xl border border-[#0066FF]/10 shrink-0">
                <Icon className="w-4 h-4" aria-hidden="true" />
              </span>
              <p className="text-xs text-[#555555] leading-relaxed">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Regulated industries */}
      <section className="space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#0066FF] font-bold">Industries</span>
          <h2 className="text-2xl md:text-3xl font-display font-medium tracking-tight text-[#0A0A0A]">Domain-expert data annotation for regulated industries</h2>
        </div>
        <div className="space-y-4 max-w-3xl">
          <p className="text-[#555555] text-sm leading-relaxed">
            Annotation for healthcare, financial services, legal tech and enterprise software, where errors in training or evaluation data carry real risk. Domain reviewers check edge cases before any batch is signed off.
          </p>
          <Link to="/catalogue" className="text-xs font-semibold text-[#0066FF] hover:underline inline-flex items-center gap-1.5">
            Compliance AI Pod <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Process */}
      <section className="space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#0066FF] font-bold">Our Process</span>
          <h2 className="text-2xl md:text-3xl font-display font-medium tracking-tight text-[#0A0A0A]">How a data annotation engagement works</h2>
        </div>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PROCESS_STEPS.map(s => (
            <li key={s.step} className="border border-[#0A0A0A]/10 rounded-3xl p-5 space-y-3 bg-white">
              <span className="text-[32px] font-mono font-bold text-[#0066FF]/10 leading-none select-none" aria-hidden="true">{s.step}</span>
              <h3 className="text-sm font-semibold text-[#0A0A0A] -mt-1">{s.title}</h3>
              <p className="text-xs text-[#555555] leading-relaxed">{s.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Security */}
      <section className="space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#0066FF] font-bold">Data Handling</span>
          <h2 className="text-2xl md:text-3xl font-display font-medium tracking-tight text-[#0A0A0A]">Security and data handling</h2>
        </div>
        <div className="bg-[#0A0A0A] text-white rounded-3xl p-6 space-y-4 border border-zinc-800 max-w-3xl">
          <p className="text-sm text-zinc-300 leading-relaxed">
            Data stays in your environment or ours under access controls you approve. PII can be redacted before annotation starts. NDAs and IP assignment are standard; you own every dataset and label.
          </p>
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            {['Access controls you approve', 'PII redaction before annotation', 'NDAs and IP assignment as standard', 'You own every dataset and label'].map(item => (
              <div key={item} className="flex items-center gap-2 text-xs text-zinc-300">
                <Check className="w-3.5 h-3.5 text-[#0066FF] shrink-0" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div dangerouslySetInnerHTML={{ __html: '<!-- ADD CERTIFICATIONS ONLY WHEN VERIFIED -->' }} hidden />
        </div>
      </section>

      {/* FAQs: native <details>, so every answer is in the server HTML and opens without JavaScript */}
      <section className="space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#0066FF] font-bold">FAQs</span>
          <h2 className="text-2xl md:text-3xl font-display font-medium tracking-tight text-[#0A0A0A]">Frequently asked questions about data annotation services</h2>
        </div>
        <div className="space-y-3 max-w-3xl">
          {FAQS.map(faq => (
            <details key={faq.q} className="group border border-[#0A0A0A]/10 rounded-2xl overflow-hidden bg-white">
              <summary className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#0A0A0A]/5 transition-colors gap-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <h3 className="text-xs font-semibold text-[#0A0A0A]">{faq.q}</h3>
                <ChevronDown className="w-4 h-4 text-[#555555] shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <div className="px-5 pb-4 border-t border-[#0A0A0A]/5">
                <p className="pt-4 text-xs text-[#555555] leading-relaxed">{faq.a}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-10 text-center space-y-5">
        <h2 className="text-3xl font-display font-medium text-[#0A0A0A] tracking-tight">
          Get training and evaluation data built by the team that ships your model
        </h2>
        <p className="text-xs text-[#555555] max-w-md mx-auto leading-relaxed">
          Five questions, two-minute scoping. A structured proposal from a Technical Principal within 48 hours.
        </p>
        <div className="pt-2">
          <Link
            to="/configure"
            className="inline-block bg-[#0066FF] text-[#FFFFFF] hover:bg-[#0055DD] font-semibold text-sm py-4 px-10 transition-colors rounded-full shadow-sm hover:shadow"
          >
            Configure your pod
          </Link>
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

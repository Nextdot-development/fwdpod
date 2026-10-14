import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, Check } from 'lucide-react';
import SEO from './SEO';

const USE_CASES = [
  { title: 'Enterprise Knowledge Bases', desc: 'Build AI-searchable enterprise knowledge bases over your internal wikis, Confluence spaces, SharePoint, and Google Drive — surfacing accurate answers instantly.' },
  { title: 'Internal Search', desc: 'Replace broken keyword search with retrieval augmented generation that understands employee intent and returns precise answers from your entire document corpus.' },
  { title: 'Document Intelligence', desc: 'Enable natural language Q&A over contracts, policies, technical manuals, and research reports — extracting structured insight without manual review.' },
  { title: 'Compliance Assistants', desc: 'Deploy RAG systems over regulatory documents, case law, and internal compliance policies for fast, citation-backed research in regulated industries.' },
  { title: 'Support Automation', desc: 'Ground support chatbots in your latest product documentation, FAQs, and ticket history so they answer accurately and stay current automatically.' },
  { title: 'Research & Intelligence Tools', desc: 'Build internal research assistants that synthesize information across thousands of reports, papers, and data sources in seconds using RAG pipelines.' },
];

const PROCESS_STEPS = [
  { step: '01', title: 'Discovery', desc: 'We audit your data sources, document formats, access patterns, and query characteristics to design the right RAG pipeline architecture.' },
  { step: '02', title: 'Architecture', desc: 'We design the chunking strategy, embedding model selection, vector store setup, retrieval logic, and re-ranking layer for your specific workload.' },
  { step: '03', title: 'Development', desc: 'The pod builds the ingestion pipeline, indexing infrastructure, retrieval service, and LLM generation layer — end to end.' },
  { step: '04', title: 'Deployment', desc: 'We deploy with freshness pipelines (automatic re-indexing), evaluation dashboards, and A/B testing infrastructure for continuous improvement.' },
];

const INDUSTRIES = [
  { name: 'SaaS', desc: 'In-product knowledge search, help center automation, and user-facing AI assistants.' },
  { name: 'Healthcare', desc: 'Clinical protocol Q&A, medical literature search, and patient education systems.' },
  { name: 'Finance', desc: 'Regulatory document retrieval, earnings report analysis, and compliance knowledge assistants.' },
  { name: 'Enterprise', desc: 'Internal knowledge management, employee helpdesks, and cross-departmental intelligence tools.' },
  { name: 'Education', desc: 'Course material Q&A, research assistants, and adaptive study tools.' },
  { name: 'E-commerce', desc: 'Product catalog search, buyer Q&A, and personalized shopping assistant systems.' },
];

const FAQS = [
  { q: 'What is RAG Development?', a: 'RAG Development (Retrieval-Augmented Generation Development) is the practice of building production software systems that combine semantic vector search with large language models. When a user submits a query, the system retrieves the most relevant documents or chunks from a knowledge base and passes them as context to the LLM — enabling accurate, source-backed answers grounded in your proprietary data rather than the model\'s training data alone.' },
  { q: 'What are Enterprise RAG Systems?', a: 'Enterprise RAG Systems are production-grade retrieval-augmented generation architectures designed for organizational scale — handling millions of documents, multi-tenant access controls, real-time document freshness pipelines, and compliance requirements. Unlike prototype RAG demos, enterprise RAG systems require robust ingestion pipelines, monitoring infrastructure, evaluation harnesses, and SLA-grade retrieval performance. Fwdpod specializes in building these end-to-end.' },
  { q: 'How does Retrieval Augmented Generation improve AI accuracy?', a: 'Retrieval Augmented Generation improves AI accuracy by grounding LLM responses in retrieved evidence rather than relying solely on model weights. The model is constrained to generate answers supported by the retrieved context, dramatically reducing hallucination. Additionally, RAG keeps answers current — knowledge base updates propagate immediately without retraining, ensuring the LLM always answers from your latest documentation.' },
  { q: 'What is RAG Chatbot Development?', a: 'RAG Chatbot Development is the process of building a conversational AI system where responses are grounded in a specific knowledge base via retrieval-augmented generation. Unlike general-purpose chatbots, RAG chatbots retrieve relevant documents at query time and cite sources — making them accurate, auditable, and suitable for regulated industries. Fwdpod delivers full RAG chatbot development: ingestion, retrieval, generation, and evaluation.' },
  { q: 'What vector database consulting does Fwdpod provide?', a: 'Fwdpod provides vector database consulting covering selection, architecture, and optimization. We evaluate Pinecone, Weaviate, Qdrant, Chroma, pgvector, and Milvus against your scale, query patterns, filtering needs, and infrastructure preferences — then design the index structure, embedding strategy, and retrieval logic to maximize relevance and minimize latency.' },
  { q: 'Why use RAG instead of fine-tuning an LLM?', a: 'RAG is preferable when your knowledge base changes frequently, when you need citations and source attribution, when data privacy prevents sending everything to a model, or when fine-tuning costs and latency are prohibitive. Fine-tuning is better for style, format, and domain vocabulary adaptation.' },
  { q: 'How do you ensure RAG answers are accurate and not hallucinated?', a: 'We implement source grounding (answers must cite retrieved documents), faithfulness evaluation (using RAGAS or LangSmith), chunk overlap tuning, and re-ranking models to ensure retrieved context is genuinely relevant before generation.' },
  { q: 'How do you keep a RAG knowledge base up to date?', a: 'We build automated ingestion pipelines that monitor source systems (Confluence, Notion, S3, databases) for changes and trigger re-embedding and re-indexing incrementally — keeping retrieval fresh without full re-indexing.' },
  { q: 'How long does a RAG development project take?', a: 'Simple RAG systems over a single data source can ship in 4–6 weeks. Enterprise RAG Systems with multiple data sources, custom ingestion pipelines, multi-tenant architecture, and evaluation dashboards typically take 10–16 weeks.' },
];

const RELATED = [
  { label: 'AI Development', href: '/services/ai-development' },
  { label: 'LLM Development', href: '/services/llm-development' },
  { label: 'AI Agents', href: '/services/ai-agents' },
  { label: 'Team Augmentation', href: '/services/team-augmentation' },
  { label: 'AI Consulting', href: '/services/ai-consulting' },
];

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://www.fwdpod.com/services/rag-development#webpage',
      url: 'https://www.fwdpod.com/services/rag-development',
      name: 'RAG Development Services for Enterprise Data | fwdpod',
      description: 'RAG systems built on your own data — retrieval pipelines, vector search, evals and grounded answers your teams can trust, delivered by an embedded pod.',
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.fwdpod.com/' },
          { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://www.fwdpod.com/services/rag-development' },
          { '@type': 'ListItem', position: 3, name: 'RAG Development Services', item: 'https://www.fwdpod.com/services/rag-development' },
        ],
      },
    },
    {
      '@type': 'Service',
      name: 'RAG Development Services',
      description: 'Enterprise RAG Systems and Retrieval Augmented Generation Solutions — vector database consulting, RAG chatbot development, and production-grade knowledge base architectures for enterprises.',
      provider: { '@id': 'https://www.fwdpod.com/#organization' },
      serviceType: 'Retrieval-Augmented Generation Development',
      areaServed: 'Worldwide',
    },
  ],
};

export default function RagDevelopmentView() {
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
        title="RAG Development Services for Enterprise Data | fwdpod"
        description="RAG systems built on your own data — retrieval pipelines, vector search, evals and grounded answers your teams can trust, delivered by an embedded pod."
        jsonLd={JSON_LD}
      />

      {/* Hero */}
      <section className="space-y-5">
        <span className="bg-[#0066FF]/5 text-[#0066FF] text-[9px] font-mono uppercase px-3 py-1 font-bold tracking-widest rounded-md border border-[#0066FF]/10 inline-block">
          RAG Development // Active
        </span>
        <div className="space-y-3 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-display font-medium tracking-tight text-[#0A0A0A] leading-tight">
            RAG Development Services
          </h1>
          <p className="text-[#555555] text-sm md:text-base leading-relaxed">
            Fwdpod builds production retrieval augmented generation solutions — from enterprise RAG systems and RAG chatbot development to vector database consulting and full knowledge base architectures. We deliver the complete RAG stack: semantic ingestion pipelines, hybrid retrieval, and grounded LLM generation over your proprietary data at any scale.
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

      {/* What is RAG Development? */}
      <section className="space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#0066FF] font-bold">About the Service</span>
          <h2 className="text-2xl md:text-3xl font-display font-medium tracking-tight text-[#0A0A0A]">
            What is RAG Development?
          </h2>
        </div>
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-4 text-[#555555] text-sm leading-relaxed">
            <p>
              Retrieval-Augmented Generation (RAG) is an AI architecture that enhances LLM outputs by grounding them in retrieved knowledge. Instead of relying solely on a model's training data, a RAG system fetches relevant documents from a vector database at query time and passes them as context to the language model — producing accurate, source-backed answers.
            </p>
            <p>
              Building production enterprise RAG systems is significantly more complex than wiring an API call. It requires careful chunk sizing, embedding model selection, vector store optimization via vector database consulting, re-ranking strategies, freshness pipelines for document updates, and comprehensive evaluation to measure retrieval quality.
            </p>
            <p>
              Fwdpod's RAG and Knowledge pods specialize in this exact work — from data ingestion architecture to evaluation harnesses — delivering retrieval augmented generation solutions that scale to millions of documents without degradation in answer quality.
            </p>
          </div>
          <div className="bg-[#0A0A0A] text-white rounded-3xl p-6 space-y-5 border border-zinc-800">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Pod Metrics // RAG Development</span>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Avg Delivery', value: '6–14 Weeks' },
                { label: 'Doc Scale', value: '1K–10M+ Docs' },
                { label: 'Retrieval', value: 'Hybrid Search' },
                { label: 'Evaluation', value: 'RAGAS Metrics' },
              ].map(m => (
                <div key={m.label} className="p-3 bg-zinc-900 rounded-2xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block">{m.label}</span>
                  <span className="text-sm font-semibold text-white">{m.value}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              {['Pinecone, Weaviate, pgvector', 'LlamaIndex / LangChain', 'OpenAI & open-source embeddings', 'Automated re-indexing pipelines'].map(item => (
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
          <p className="text-[#555555] text-sm max-w-2xl">Common retrieval augmented generation systems our pods deliver for enterprises, product teams, and regulated industries.</p>
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

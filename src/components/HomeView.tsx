import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { POD_DETAILS, FLOW_STEPS, LivePodItem } from '../data';
import { ArrowRight, ChevronRight, CornerRightDown, HelpCircle, RefreshCw, ChevronLeft, ShieldCheck, Sparkles, CheckCircle } from 'lucide-react';
import SEO from './SEO';

// ── FAQ content — optimised for GEO (ChatGPT, Gemini, Perplexity, AI Overviews) ──
const FAQ_ITEMS = [
  {
    q: 'What are AI Engineering Pods?',
    a: 'AI Engineering Pods are pre-assembled, cross-functional teams of 4–6 senior AI specialists who work together under a single contract to architect, build, and ship AI products. Each Fwdpod includes a pod lead, applied AI engineers, a DevOps specialist, and a forward-deployed integration engineer — all with shared context from day one.'
  },
  {
    q: 'How quickly can Fwdpod deploy a dedicated AI engineering team?',
    a: 'Fwdpod assembles and mobilises your dedicated AI engineering team within one week of scope sign-off. After a 48-hour intake session, your pod begins delivering production-ready code immediately — far faster than the 3–6 month timeline of traditional AI hiring cycles.'
  },
  {
    q: 'What industries does Fwdpod serve with AI engineering pods?',
    a: 'Fwdpod serves enterprises and SaaS companies across financial services, healthcare, logistics, telecommunications, retail, legal tech, and manufacturing. Every AI engineering pod is customised to meet the regulatory and technical requirements of your specific sector.'
  },
  {
    q: 'How do AI Engineering Pods differ from traditional consulting?',
    a: 'Unlike consultancies that bill hourly and hand off fragmented deliverables, Fwdpod pods operate on fixed-scope, outcome-based contracts. The pod owns end-to-end delivery — engineering, deployment, observability, and DevOps — under one accountable project lead with zero coordination overhead.'
  },
  {
    q: 'What types of AI systems does Fwdpod build?',
    a: 'Fwdpod specialises in LLM development, RAG (Retrieval-Augmented Generation) systems, multi-agent AI orchestration, voice AI pipelines with sub-150ms latency, compliance AI guardrails, and custom enterprise AI product engineering across cloud and air-gapped environments.'
  },
  {
    q: 'What is included in a Fwdpod engagement?',
    a: 'Every engagement includes architecture design, full-stack AI development, cloud deployment and CI/CD pipelines, real-time observability and telemetry dashboards, compliance guardrails where required, and a complete handover package with documentation and evaluation benchmarks.'
  }
];

// ── Home page JSON-LD: WebPage + Service + FAQPage ───────────────────────────
const HOME_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://www.fwdpod.com/#organization',
      'name': 'Fwdpod',
      'alternateName': 'Fwdpod.com',
      'url': 'https://www.fwdpod.com/',
      // TODO(assets): favicon.svg stands in for a logo; replace with a real logo image
      'logo': {
        '@type': 'ImageObject',
        '@id': 'https://www.fwdpod.com/#logo',
        'url': 'https://www.fwdpod.com/favicon.svg',
        'contentUrl': 'https://www.fwdpod.com/favicon.svg',
        'caption': 'Fwdpod logo'
      },
      // TODO(profiles): Clutch, G2, Crunchbase and LinkedIn profile URLs
      'sameAs': [],
      'description': 'Fwdpod delivers dedicated AI engineering pods — pre-assembled, cross-functional teams of 4–6 senior specialists for LLM development, RAG systems, multi-agent AI, voice AI, compliance AI, and custom enterprise AI product engineering.',
      'slogan': 'Pre-formed cognitive infrastructure units',
      'knowsAbout': [
        'AI Engineering',
        'LLM Development',
        'RAG Systems',
        'AI Agents',
        'Voice AI',
        'Compliance AI',
        'Team Augmentation',
        'AI Product Engineering',
        'Machine Learning'
      ],
      'contactPoint': [
        {
          '@type': 'ContactPoint',
          'email': 'contact.fwdpod@gmail.com',
          'contactType': 'customer support',
          'areaServed': 'Worldwide',
          'availableLanguage': ['English']
        }
      ]
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.fwdpod.com/#website',
      'url': 'https://www.fwdpod.com/',
      'name': 'Fwdpod',
      'description': 'Dedicated AI Engineering Pods for Enterprises',
      'publisher': { '@id': 'https://www.fwdpod.com/#organization' },
      'inLanguage': 'en-US',
      'copyrightYear': '2026'
    },
    {
      '@type': 'WebPage',
      '@id': 'https://www.fwdpod.com/#home',
      'url': 'https://www.fwdpod.com/',
      'name': 'AI Engineering Pods for Enterprises | Fwdpod',
      'description': 'Fwdpod builds dedicated AI engineering pods for enterprise teams, covering LLM development, RAG systems, AI agents, and production delivery.',
      'isPartOf': { '@id': 'https://www.fwdpod.com/#website' },
      'about': { '@id': 'https://www.fwdpod.com/#organization' },
      'breadcrumb': {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.fwdpod.com/' }
        ]
      }
    },
    {
      '@type': 'FAQPage',
      'mainEntity': FAQ_ITEMS.map(({ q, a }) => ({
        '@type': 'Question',
        'name': q,
        'acceptedAnswer': { '@type': 'Answer', 'text': a }
      }))
    }
  ]
};

interface HomeViewProps {
  activeHeadline: string;
  activeSubline: string;
  activeCta: string;
  onNavigate: (page: string) => void;
  onSelectPod: (podId: string) => void;
  livePodsSample: LivePodItem[];
}

const NODE_INFO = {
  lead: {
    title: 'Pod lead & systems architect',
    role: 'Coordinates systems integration, validates secure AI output loops, acts as direct Technical Principal point-of-contact.'
  },
  devops: {
    title: 'Deployment & workflow DevOps',
    role: 'Packages Docker environments, commissions cloud CI/CD pipelines, configures air-gapped GDPR scraping hooks.'
  },
  obs: {
    title: 'Observability & telemetry engineer',
    role: 'Wires real-time trace pipelines, sets up Latency evaluation harnesses, tracks agent token and API costs.'
  },
  dev: {
    title: 'Applied software developers',
    role: 'Build low-level audio stream sockets, integrate document-chunking pipelines, write deterministic code state gates.'
  }
};

export default function HomeView({
  activeHeadline,
  activeSubline,
  activeCta,
  onNavigate,
  onSelectPod,
  livePodsSample,
}: HomeViewProps) {
  const [selectedNode, setSelectedNode] = useState<'lead' | 'devops' | 'obs' | 'dev'>('lead');

  // Horizontal scroll for pre-formed engineering pod catalogue
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeDot, setActiveDot] = useState(0);

  const catalogPods = POD_DETAILS;

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    
    // Progress calculation (0 to 100)
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      setScrollProgress((scrollLeft / maxScroll) * 100);
    } else {
      setScrollProgress(0);
    }

    // Active card dot based on closest scroll snap child position
    const children = scrollRef.current.children;
    let closestIndex = 0;
    let minDistance = Infinity;
    const containerLeft = scrollRef.current.getBoundingClientRect().left;

    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement;
      const childLeft = child.getBoundingClientRect().left;
      const distance = Math.abs(childLeft - containerLeft);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }
    setActiveDot(closestIndex);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftState(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!scrollRef.current) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollByAmount(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollByAmount(-1);
    }
  };

  const scrollByAmount = (direction: number) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const { clientWidth, scrollLeft } = container;
    // Step is roughly single card size (approx 60% of viewport width)
    const step = clientWidth * 0.6;
    container.scrollTo({
      left: scrollLeft + direction * step,
      behavior: 'smooth'
    });
  };

  const scrollToCard = (index: number) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const children = container.children;
    if (children && children[index]) {
      const childElement = children[index] as HTMLElement;
      container.scrollTo({
        left: childElement.offsetLeft - container.offsetLeft - 12,
        behavior: 'smooth'
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-14 bg-white"
    >
      <SEO
        title="AI Engineering Pods for Enterprises | Fwdpod"
        description="Fwdpod builds dedicated AI engineering pods for enterprise teams, covering LLM development, RAG systems, AI agents, and production delivery."
        jsonLd={HOME_JSON_LD}
      />

      {/* Hero section */}
      <section className="pt-2 pb-8 md:pt-4 md:pb-12 border-none" style={{ borderStyle: 'none' }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:items-start items-center">
          {/* Left Hero Texts */}
          <div className="lg:col-span-7 space-y-8 animate-fadeIn">
            <div className="inline-flex items-center gap-2 border border-[#0066FF] px-2.5 py-1 text-xs font-medium text-[#0066FF] rounded-full">
              <span>Pre-formed cognitive infrastructure units</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-medium tracking-tight text-[#0A0A0A] leading-[1.10]">
              {activeHeadline}
            </h1>

            <p className="text-base text-[#555555] leading-relaxed max-w-lg">
              {activeSubline}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                to="/configure"
                className="bg-[#0066FF] text-[#FFFFFF] hover:bg-[#0055DD] py-3.5 px-8 font-semibold text-sm transition-all duration-150 inline-flex items-center justify-center gap-2 cursor-pointer rounded-full hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Configure Your Pod</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

            </div>
          </div>

          {/* Right Abstract Pod Diagram */}
          <div className="lg:col-span-5 lg:mt-5 border border-zinc-200/80 p-6 bg-white relative rounded-3xl shadow-sm hover:border-[#0066FF] hover:border-1.5 hover:shadow-md transform hover:-translate-y-2 transition-all duration-300 ease-out">
            <div className="flex justify-between items-center mb-4">
              <div className="text-[10px] font-mono tracking-widest text-zinc-400 font-bold uppercase">
                Fig 1.0 // Productised pod composition
              </div>
            </div>

            <div className="relative h-64 border border-zinc-100 flex items-center justify-center bg-zinc-50/30 rounded-2xl overflow-hidden">
              <svg width="100%" height="100%" className="absolute inset-0" viewBox="0 0 240 200">
                {/* Tech Dot Grid Background */}
                <defs>
                  <pattern id="node-grid" width="16" height="16" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="0.75" fill="#e4e4e7" />
                  </pattern>
                  {/* Hexagon Clip Paths & Markers */}
                  <marker id="arrow-start" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#a1a1aa" opacity="0.6" />
                  </marker>
                  <marker id="arrow-end" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#a1a1aa" opacity="0.6" />
                  </marker>
                  <marker id="arrow-blue-start" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#0066FF" />
                  </marker>
                  <marker id="arrow-blue-end" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#0066FF" />
                  </marker>
                </defs>
                <rect width="100%" height="100%" fill="url(#node-grid)" />

                {/* Spheres of Interaction / Concentric Tracking Rings */}
                <circle cx="120" cy="100" r="70" stroke="#f4f4f5" strokeWidth="1" strokeDasharray="4,4" fill="none" />
                <circle cx="120" cy="100" r="45" stroke="#f4f4f5" strokeWidth="1" strokeDasharray="3,3" fill="none" />

                {/* Outer Connection Paths (incorporating bidirectional arrows and custom motion lines) */}
                {/* LEAD (120,40) -> DEVOPS (60,100) */}
                <path id="path-lead-devops" d="M 120 40 L 60 100" stroke="#d4d4d8" strokeWidth="1" strokeDasharray="3,3" fill="none" marker-start="url(#arrow-start)" marker-end="url(#arrow-end)" />
                {/* LEAD (120,40) -> OBS (180,100) */}
                <path id="path-lead-obs" d="M 120 40 L 180 100" stroke="#d4d4d8" strokeWidth="1" strokeDasharray="3,3" fill="none" marker-start="url(#arrow-start)" marker-end="url(#arrow-end)" />
                {/* DEVOPS (60,100) -> DEV (120,160) */}
                <path id="path-devops-dev" d="M 60 100 L 120 160" stroke="#d4d4d8" strokeWidth="1" strokeDasharray="3,3" fill="none" marker-start="url(#arrow-start)" marker-end="url(#arrow-end)" />
                {/* OBS (180,100) -> DEV (120,160) */}
                <path id="path-obs-dev" d="M 180 100 L 120 160" stroke="#d4d4d8" strokeWidth="1" strokeDasharray="3,3" fill="none" marker-start="url(#arrow-start)" marker-end="url(#arrow-end)" />

                {/* Active cross-axial telemetry lines with color-coding and bidirectional indicators */}
                {/* Vertical Core Axis (LEAD to DEV) */}
                <path 
                  id="axis-vertical"
                  d="M 120 40 L 120 160" 
                  stroke={selectedNode === 'lead' || selectedNode === 'dev' ? '#0066FF' : '#d4d4d8'} 
                  strokeOpacity={selectedNode === 'lead' || selectedNode === 'dev' ? '1' : '0.4'} 
                  strokeWidth={selectedNode === 'lead' || selectedNode === 'dev' ? '2' : '1'} 
                  fill="none"
                  marker-start={selectedNode === 'lead' || selectedNode === 'dev' ? 'url(#arrow-blue-start)' : 'url(#arrow-start)'}
                  marker-end={selectedNode === 'lead' || selectedNode === 'dev' ? 'url(#arrow-blue-end)' : 'url(#arrow-end)'}
                  className="transition-all duration-300"
                />

                {/* Horizontal Core Axis (DEVOPS to OBS) */}
                <path 
                  id="axis-horizontal"
                  d="M 60 100 L 180 100" 
                  stroke={selectedNode === 'devops' || selectedNode === 'obs' ? '#0066FF' : '#d4d4d8'} 
                  strokeOpacity={selectedNode === 'devops' || selectedNode === 'obs' ? '1' : '0.4'} 
                  strokeWidth={selectedNode === 'devops' || selectedNode === 'obs' ? '2' : '1'} 
                  fill="none"
                  marker-start={selectedNode === 'devops' || selectedNode === 'obs' ? 'url(#arrow-blue-start)' : 'url(#arrow-start)'}
                  marker-end={selectedNode === 'devops' || selectedNode === 'obs' ? 'url(#arrow-blue-end)' : 'url(#arrow-end)'}
                  className="transition-all duration-300"
                />

                {/* Animated Dotted Particles running along the connection lines */}
                <circle r="2.5" fill="#0066FF">
                  <animateMotion dur="4s" repeatCount="indefinite" path="M 120 40 L 60 100 L 120 160 L 180 100 Z" />
                </circle>
                <circle r="2.5" fill="#3b82f6" opacity="0.6">
                  <animateMotion dur="4s" begin="2s" repeatCount="indefinite" path="M 120 40 L 60 100 L 120 160 L 180 100 Z" />
                </circle>

                <circle r="2" fill="#0066FF">
                  <animateMotion dur="3s" repeatCount="indefinite" path="M 120 40 L 120 160" />
                </circle>
                <circle r="2" fill="#0066FF">
                  <animateMotion dur="3s" repeatCount="indefinite" path="M 60 100 L 180 100" />
                </circle>

                {/* Lead Node (Hexagon at 120,40) */}
                <g className="cursor-pointer group select-none" onClick={() => setSelectedNode('lead')}>
                  {selectedNode === 'lead' && (
                    <polygon points="120,15 141.6,27.5 141.6,52.5 120,65 98.4,52.5 98.4,27.5" fill="none" stroke="#0066FF" strokeWidth="1.5" strokeOpacity="0.4" className="animate-pulse" />
                  )}
                  <polygon 
                    points="120,20 137.3,30 137.3,50 120,60 102.7,50 102.7,30" 
                    fill={selectedNode === 'lead' ? '#0066FF' : '#FFFFFF'} 
                    stroke={selectedNode === 'lead' ? '#0066FF' : '#09090b'} 
                    strokeWidth={selectedNode === 'lead' ? '2' : '1.5'} 
                    className="transition-all duration-300 group-hover:scale-105"
                  />
                  {/* Micro-icon: Crown / Command Center */}
                  <g transform="translate(120, 34)" className="pointer-events-none">
                    <path 
                      d="M -4 2.5 L -5.5 -1.5 L -2.5 0 L 0 -4 L 2.5 0 L 5.5 -1.5 L 4 2.5 Z" 
                      fill="none" 
                      stroke={selectedNode === 'lead' ? '#FFFFFF' : '#0066FF'} 
                      strokeWidth="1" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                  </g>
                  <text 
                    x="120" 
                    y="51" 
                    fontFamily="Inter, system-ui, sans-serif" 
                    fontSize="7" 
                    fontWeight="800" 
                    letterSpacing="0.05em"
                    fill={selectedNode === 'lead' ? '#FFFFFF' : '#09090b'} 
                    textAnchor="middle"
                  >
                    LD
                  </text>
                </g>

                {/* DevOps Node (Hexagon at 60,100) */}
                <g className="cursor-pointer group select-none" onClick={() => setSelectedNode('devops')}>
                  {selectedNode === 'devops' && (
                    <polygon points="60,75 81.6,87.5 81.6,112.5 60,125 38.4,112.5 38.4,87.5" fill="none" stroke="#0066FF" strokeWidth="1.5" strokeOpacity="0.4" className="animate-pulse" />
                  )}
                  <polygon 
                    points="60,80 77.3,90 77.3,110 60,120 42.7,110 42.7,90" 
                    fill={selectedNode === 'devops' ? '#0066FF' : '#FFFFFF'} 
                    stroke={selectedNode === 'devops' ? '#0066FF' : '#09090b'} 
                    strokeWidth={selectedNode === 'devops' ? '2' : '1.5'} 
                    className="transition-all duration-300 group-hover:scale-105"
                  />
                  {/* Micro-icon: Loop Integration */}
                  <g transform="translate(60, 94)" className="pointer-events-none">
                    <path 
                      d="M -3.5 0 C -3.5 -1.8 -1.2 -1.8 0 0 C 1.2 1.8 3.5 1.8 3.5 0 C 3.5 -1.8 1.2 -1.8 0 0 C -1.2 1.8 -3.5 1.8 -3.5 0 Z" 
                      fill="none" 
                      stroke={selectedNode === 'devops' ? '#FFFFFF' : '#71717a'} 
                      strokeWidth="1" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                  </g>
                  <text 
                    x="60" 
                    y="111" 
                    fontFamily="Inter, system-ui, sans-serif" 
                    fontSize="7" 
                    fontWeight="800"
                    letterSpacing="0.05em"
                    fill={selectedNode === 'devops' ? '#FFFFFF' : '#09090b'} 
                    textAnchor="middle"
                  >
                    DO
                  </text>
                </g>

                {/* Obs Node (Hexagon at 180,100) */}
                <g className="cursor-pointer group select-none" onClick={() => setSelectedNode('obs')}>
                  {selectedNode === 'obs' && (
                    <polygon points="180,75 201.6,87.5 201.6,112.5 180,125 158.4,112.5 158.4,87.5" fill="none" stroke="#0066FF" strokeWidth="1.5" strokeOpacity="0.4" className="animate-pulse" />
                  )}
                  <polygon 
                    points="180,80 197.3,90 197.3,110 180,120 162.7,110 162.7,90" 
                    fill={selectedNode === 'obs' ? '#0066FF' : '#FFFFFF'} 
                    stroke={selectedNode === 'obs' ? '#0066FF' : '#09090b'} 
                    strokeWidth={selectedNode === 'obs' ? '2' : '1.5'} 
                    className="transition-all duration-300 group-hover:scale-105"
                  />
                  {/* Micro-icon: Waveform Trace */}
                  <g transform="translate(180, 94)" className="pointer-events-none">
                    <path 
                      d="M -4.5 0 L -2.5 2.5 L 0 -3.5 L 2.5 3.5 L 4.5 0" 
                      fill="none" 
                      stroke={selectedNode === 'obs' ? '#FFFFFF' : '#71717a'} 
                      strokeWidth="1" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                  </g>
                  <text 
                    x="180" 
                    y="111" 
                    fontFamily="Inter, system-ui, sans-serif" 
                    fontSize="7" 
                    fontWeight="800"
                    letterSpacing="0.05em"
                    fill={selectedNode === 'obs' ? '#FFFFFF' : '#09090b'} 
                    textAnchor="middle"
                  >
                    OB
                  </text>
                </g>

                {/* Dev Node (Hexagon at 120,160) */}
                <g className="cursor-pointer group select-none" onClick={() => setSelectedNode('dev')}>
                  {selectedNode === 'dev' && (
                    <polygon points="120,135 141.6,147.5 141.6,172.5 120,185 98.4,172.5 98.4,147.5" fill="none" stroke="#0066FF" strokeWidth="1.5" strokeOpacity="0.4" className="animate-pulse" />
                  )}
                  <polygon 
                    points="120,141 137.3,151 137.3,171 120,181 102.7,171 102.7,151" 
                    fill={selectedNode === 'dev' ? '#0066FF' : '#FFFFFF'} 
                    stroke={selectedNode === 'dev' ? '#0066FF' : '#09090b'} 
                    strokeWidth={selectedNode === 'dev' ? '2' : '1.5'} 
                    className="transition-all duration-300 group-hover:scale-105"
                  />
                  {/* Micro-icon: Code brackets */}
                  <g transform="translate(120, 155)" className="pointer-events-none">
                    <path 
                      d="M -3.5 -2.5 L -5.5 0 L -3.5 2.5 M 3.5 -2.5 L 5.5 0 L 3.5 2.5" 
                      fill="none" 
                      stroke={selectedNode === 'dev' ? '#FFFFFF' : '#71717a'} 
                      strokeWidth="1" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                  </g>
                  <text 
                    x="120" 
                    y="172" 
                    fontFamily="Inter, system-ui, sans-serif" 
                    fontSize="7" 
                    fontWeight="800"
                    letterSpacing="0.05em"
                    fill={selectedNode === 'dev' ? '#FFFFFF' : '#09090b'} 
                    textAnchor="middle"
                  >
                    DV
                  </text>
                </g>
              </svg>
            </div>

            {/* Dynamic Node Details Display */}
            <div className="mt-4 p-4 border border-zinc-100 bg-zinc-50/50 space-y-1.5 min-h-[95px] transition-all duration-300 rounded-2xl">
              <div className="text-[9px] font-mono text-[#0066FF] uppercase font-bold tracking-widest">
                Audited Role: {selectedNode.toUpperCase()}
              </div>
              <h4 className="text-xs font-bold text-[#0A0A0A] font-sans">
                {NODE_INFO[selectedNode].title}
              </h4>
              <p className="text-[11px] text-zinc-500 leading-relaxed font-sans">
                {NODE_INFO[selectedNode].role}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pod Catalogue Horizontal Scroll System */}
      <section 
        className="space-y-10 p-6 md:p-10 shadow-sm rounded-3xl"
        style={{ backgroundColor: '#fafafa' }}
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <span className="text-[#0066FF] text-xs font-semibold uppercase tracking-widest block">
              Deployment suites
            </span>
            <h2 className="text-3xl font-display font-medium text-[#0A0A0A] tracking-tight">
              Pre-formed AI Engineering Pod Catalogue
            </h2>
          </div>
          <Link
            to="/catalogue"
            className="text-xs font-medium text-[#0066FF] hover:underline flex items-center gap-1 self-start md:self-auto transition-colors"
          >
            <span>View comparison parameters</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Carousel Relative Viewport */}
        <div className="relative group/catalogue">
          {/* Subtle gradient overlays indicating left/right overflow potential */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#fafafa] to-transparent pointer-events-none z-10 opacity-70" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#fafafa] to-transparent pointer-events-none z-10 opacity-70" />

          {/* Left Arrow Button (shows on hover) */}
          <button
            onClick={() => scrollByAmount(-1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white border border-[#0A0A0A]/10 hover:border-[#0A0A0A] hover:bg-zinc-50 text-[#0A0A0A] p-3 rounded-full shadow-md hover:shadow-lg transition-all opacity-0 group-hover/catalogue:opacity-100 focus:opacity-100 cursor-pointer hidden md:flex items-center justify-center transition-opacity duration-200"
            aria-label="Previous page"
            title="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Right Arrow Button (shows on hover) */}
          <button
            onClick={() => scrollByAmount(1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white border border-[#0A0A0A]/10 hover:border-[#0A0A0A] hover:bg-zinc-50 text-[#0A0A0A] p-3 rounded-full shadow-md hover:shadow-lg transition-all opacity-0 group-hover/catalogue:opacity-100 focus:opacity-100 cursor-pointer hidden md:flex items-center justify-center transition-opacity duration-200"
            aria-label="Next page"
            title="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Scroll container block */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            className={`flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 px-4 py-2 cursor-grab focus:outline-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
              isDragging ? 'cursor-grabbing select-none' : ''
            }`}
          >
            {catalogPods.map((pod) => (
              <div 
                key={pod.id}
                className="w-[84%] sm:w-[64%] md:w-[54%] lg:w-[44%] shrink-0 snap-start border border-zinc-200/85 bg-[#FFFFFF] p-6 sm:p-8 flex flex-col justify-between hover:border-[#0066FF] hover:border-1.5 hover:bg-zinc-50/50 hover:shadow-md rounded-2xl transform hover:-translate-y-2 transition-all duration-300 ease-out"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-[#0A0A0A]/10">
                    <span className="text-[10px] font-mono text-[#555555]">ID: {pod.id.toUpperCase()}</span>
                    <span className="text-[11px] font-medium text-[#0066FF] bg-[#0066FF]/5 px-2.5 py-0.5 rounded-md font-mono">
                      {pod.weeks}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-medium tracking-tight text-[#0A0A0A] font-display">
                    {pod.name}
                  </h3>
                  
                  <p className="text-xs text-[#555555] leading-relaxed min-h-[48px] font-sans">
                    {pod.oneLiner}
                  </p>

                  <div className="flex gap-2 pt-2">
                    {/* TODO(copy): price band. Pricing is not approved for publication. */}
                    <span className="bg-[#0066FF]/5 text-[#0066FF] text-[10px] px-2.5 py-1 font-semibold rounded-md">
                      {pod.teamSize} Person team
                    </span>
                  </div>
                </div>

                <div className="pt-6 grid grid-cols-2 gap-4 mt-6 border-t border-[#0A0A0A]/10">
                  <Link
                    to="/catalogue"
                    onClick={() => onSelectPod(pod.id)}
                    className="border border-[#0A0A0A]/10 hover:border-[#0A0A0A] text-[#0A0A0A] text-xs font-semibold py-2.5 px-4 text-center transition-all hover:bg-[#0A0A0A]/5 rounded-full"
                  >
                    Explore spec
                  </Link>
                  <Link
                    to="/configure"
                    className="bg-[#0066FF] text-white hover:bg-[#0055DD] text-xs font-semibold py-2.5 px-4 text-center transition-all rounded-full"
                  >
                    Configure pod
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom scroll indicators (Linear progress + Dot buttons) */}
        <div className="flex flex-col items-center justify-center gap-3 pt-4">
          <div className="w-48 h-1 bg-zinc-200/80 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#0066FF] transition-all duration-150 ease-out rounded-full"
              style={{ width: `${Math.max(12, Math.min(100, scrollProgress))}%` }}
            />
          </div>
          <div className="flex gap-2">
            {catalogPods.map((_, idx) => (
              <button
                key={idx}
                onClick={() => scrollToCard(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  activeDot === idx 
                    ? 'bg-[#0066FF] w-6' 
                    : 'bg-zinc-300 hover:bg-zinc-400'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Live Pods Strip */}
      <section className="py-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-5">
          <div className="space-y-2">
            <span className="text-[#0066FF] text-xs font-semibold uppercase tracking-widest block">
              Operational telemetry
            </span>
            {/* TODO(copy): "18 pods running now" removed. The number was hardcoded and
                is not backed by operational data. */}
          </div>
          <Link
            to="/live-pods"
            className="text-xs font-medium text-[#0066FF] hover:underline flex items-center gap-1"
          >
            <span>Open live dashboard</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 3 sample card columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {livePodsSample.map((pod) => (
            <div 
              key={pod.id}
              className="border border-zinc-200/85 p-5 space-y-3 rounded-2xl bg-white hover:border-[#0066FF] hover:border-1.5 hover:bg-zinc-50/50 hover:shadow-md transform hover:-translate-y-2 transition-all duration-300 ease-out"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono uppercase text-[#555555] tracking-widest">{pod.industry}</span>
                <span className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-700 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                  <span className="h-1.5 w-1.5 bg-emerald-600 rounded-full animate-pulse"></span>
                  Running
                </span>
              </div>
              <h4 className="text-sm font-medium text-[#0A0A0A] font-display">{pod.archetype}</h4>
              <p className="text-[11px] text-[#555555] line-clamp-2 leading-relaxed">{pod.buildDescription}</p>
              <div className="pt-2 border-t border-[#0A0A0A]/5 flex justify-between items-center text-[10px] font-mono text-[#555555]">
                <span>Timeline: {pod.weeksLive} weeks live</span>
                <span>Size: {pod.teamSize} specialists</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Pods, Not Consultants */}
      <section id="manifesto-intro" className="py-8 p-6 md:p-8 bg-white rounded-3xl border border-zinc-200/80 shadow-sm hover:border-[#0066FF] hover:border-1.5 hover:bg-zinc-50/50 hover:shadow-md transform hover:-translate-y-2 transition-all duration-300 ease-out">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-3">
            <span className="text-[#0066FF] text-xs font-semibold uppercase tracking-widest block">
              Decision paradigm
            </span>
            <h3 className="text-2xl font-display font-medium text-[#0A0A0A] tracking-tight leading-snug">
              Pre-formed AI engineering teams built for execution, delivery, and measurable outcomes.
            </h3>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <p className="text-sm text-[#555555] leading-relaxed">
              Traditional consultancies operate by selling warm bodies, charging hourly rates, and matching single developers to fragmented teams. This results in integration gaps, broken pipelines, and finger-pointing when a deployment fails. The consultant leaves, and you are left to maintain thousands of lines of unsupported code.
            </p>
            <p className="text-sm text-[#555555] leading-relaxed">
              Fwdpod completely flips the IT staffing paradigm. By pre-packaging elite engineering units equipped with combined development, automated deployment scripts, active telemetry loops, and continuous DevOps configurations, we remove any structural organizational friction. One team, one contract, one accountable owner.
            </p>
            <div className="pt-2">
              <Link
                to="/catalogue"
                className="text-xs font-medium text-[#0066FF] hover:underline flex items-center gap-1"
              >
                <span>Read the complete operational manifest</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section — optimised for Google AI Overviews + Perplexity + ChatGPT */}
      <section id="faq" aria-labelledby="faq-heading" className="space-y-8">
        <div className="space-y-2">
          <span className="text-[#0066FF] text-xs font-semibold uppercase tracking-widest block">
            Common questions
          </span>
          <h2 id="faq-heading" className="text-3xl font-display font-medium text-[#0A0A0A] tracking-tight">
            Frequently asked questions about AI Engineering Pods
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FAQ_ITEMS.map((faq, idx) => (
            <div
              key={idx}
              className="border border-zinc-200/85 p-6 rounded-2xl bg-white space-y-2.5 hover:border-[#0066FF] hover:bg-zinc-50/50 hover:shadow-sm transition-all duration-300"
            >
              <h3 className="text-sm font-semibold text-[#0A0A0A]">{faq.q}</h3>
              <p className="text-xs text-[#555555] leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA section */}
      <section className="py-10 text-center space-y-5">
        <h2 className="text-3xl font-display font-medium text-[#0A0A0A] tracking-tight">
          Stop recruiting individuals. Commission a pre-formed pod.
        </h2>
        <p className="text-xs text-[#555555] max-w-md mx-auto leading-relaxed">
          Five questions. Two-minute scoping. A complete structured proposal from a Technical Principal within 48 hours.
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
    </motion.div>
  );
}

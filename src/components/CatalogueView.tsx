import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { POD_DETAILS } from '../data';
import { ChevronDown, ChevronUp, Check, X, ArrowUpRight, HelpCircle } from 'lucide-react';
import SEO from './SEO';

const CATALOGUE_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://www.fwdpod.com/#catalogue',
      'url': 'https://www.fwdpod.com/catalogue',
      'name': 'AI Engineering Pod Catalogue — Voice AI, RAG, Agentic Ops, Compliance | Fwdpod',
      'description': 'Browse Fwdpod\'s five pre-assembled AI engineering pods: Voice AI, Agentic Operations, RAG & Knowledge, Compliance AI, and Custom pods. Fixed scope.',
      'isPartOf': { '@id': 'https://www.fwdpod.com/#website' },
      'breadcrumb': {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.fwdpod.com/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Pod Catalogue', 'item': 'https://www.fwdpod.com/catalogue' }
        ]
      }
    },
    {
      '@type': 'ItemList',
      'name': 'AI Engineering Pod Catalogue',
      'description': 'Five specialised, pre-assembled AI engineering pods for enterprise and startup deployments',
      'numberOfItems': 5,
      'itemListElement': POD_DETAILS.map((pod, idx) => ({
        '@type': 'ListItem',
        'position': idx + 1,
        'name': pod.name,
        'description': pod.oneLiner,
        'url': 'https://www.fwdpod.com/catalogue'
      }))
    }
  ]
};

interface CatalogueViewProps {
  selectedPodId: string | null;
  /** Remember the pod to preselect on /configure before the link navigates there. */
  onPreselectPod: (podId: string) => void;
}

export default function CatalogueView({ selectedPodId, onPreselectPod }: CatalogueViewProps) {
  // Store expanded state for the 5 pods
  const [expandedPods, setExpandedPods] = useState<Record<string, boolean>>({
    'voice-ai': false, // All start collapsed by default
    'agentic-ops': false,
    'rag-knowledge': false,
    'compliance-ai': false,
    'custom-pod': false
  });

  // Expand selected pod if configured from homepage
  useEffect(() => {
    if (selectedPodId) {
      setExpandedPods(prev => ({
        ...prev,
        [selectedPodId]: true
      }));
      // Smooth scroll to the target element
      const element = document.getElementById(`pod-heading-${selectedPodId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [selectedPodId]);

  const toggleExpand = (id: string) => {
    setExpandedPods(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-24"
    >
      <SEO
        title="AI Engineering Pod Catalogue — Voice AI, RAG, Agentic Ops, Compliance | Fwdpod"
        description="Browse Fwdpod's five pre-assembled AI engineering pods: Voice AI, Agentic Operations, RAG & Knowledge, Compliance AI, and Custom pods. Fixed scope."
        jsonLd={CATALOGUE_JSON_LD}
      />

      {/* Page Header */}
      <section className="text-center md:text-left space-y-4">
        <span className="text-xs font-mono text-[#0066FF] uppercase tracking-widest block font-medium">
          Fwdpod catalogue // fixed scope archetypes
        </span>
        <h1 className="text-4xl md:text-5xl font-display font-medium text-[#0A0A0A] tracking-tight">
          Choose Your AI Engineering Pod.
        </h1>
        <p className="text-sm text-[#555555] max-w-xl leading-relaxed">
          Compare our five specialized, pre-assembled engineering units. Each pod handles its operational outcomes with unified accountability and zero friction.
        </p>
      </section>

      {/* 5 Stacked Pod Sections */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {POD_DETAILS.map((pod, idx) => {
          const isExpanded = expandedPods[pod.id];
          const isLast = idx === 4; // 5th pod is last
          return (
            <div 
              key={pod.id}
              id={`pod-heading-${pod.id}`}
              className={`border border-zinc-200 bg-[#FFFFFF] rounded-3xl overflow-hidden shadow-sm hover:border-[#0066FF] hover:border-1.5 hover:bg-zinc-50/50 hover:shadow-md transform hover:-translate-y-2 transition-all duration-300 ease-out h-full flex flex-col ${isLast ? 'md:col-span-2' : ''}`}
            >
              {/* Top Banner Row (Clickable to Toggle) */}
              <div 
                onClick={() => toggleExpand(pod.id)}
                className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-[#0A0A0A]/5 select-none"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono text-[#555555]">ID: {pod.id.toUpperCase()}</span>
                    <span className="bg-[#0066FF]/5 text-[#0066FF] text-[10px] px-2.5 py-0.5 font-medium rounded-md">
                      {pod.weeks}
                    </span>
                    {/* TODO(copy): price band. Pricing is not approved for publication. */}
                  </div>
                  <h2 className="text-2xl font-display font-medium text-[#0A0A0A] tracking-tight">
                    {pod.name}
                  </h2>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs text-[#555555] hidden sm:inline-block font-medium">
                    {isExpanded ? 'Collapse spec' : 'Expand spec'}
                  </span>
                  <div className="p-1.5 border border-[#0A0A0A]/10 rounded-full bg-zinc-50">
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-[#0A0A0A]" /> : <ChevronDown className="w-4 h-4 text-[#0A0A0A]" />}
                  </div>
                </div>
              </div>

              {/* Detailed Spec Area */}
              {isExpanded && (
                <div className="px-6 pb-8 md:px-8 md:pb-10 border-t border-[#0A0A0A]/10 pt-8 space-y-8 animate-fadeIn">
                  
                  {/* Long Description and CTA */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8">
                      <p className="text-sm text-[#555555] leading-relaxed">
                        {pod.longDescription}
                      </p>
                    </div>
                    <div className="lg:col-span-4 flex items-start lg:justify-end">
                      <Link
                        to="/configure"
                        onClick={() => onPreselectPod(pod.id)}
                        className="w-full lg:w-auto bg-[#0066FF] text-white hover:bg-[#0055DD] text-sm font-semibold py-3 px-8 transition-colors inline-flex items-center justify-center gap-2 rounded-full"
                      >
                        <span>Configure this pod</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4 border-t border-[#0A0A0A]/10">
                    
                    {/* Roles Division */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-mono text-[#0066FF] tracking-widest uppercase font-medium">
                        What's Included ({pod.teamSize} Roles)
                      </h4>
                      <ul className="space-y-2">
                        {pod.includedRoles.map((role, idx) => (
                          <li key={idx} className="text-xs text-[#0A0A0A] flex items-center gap-2 font-medium">
                            <span className="w-1.5 h-1.5 bg-[#0066FF] rounded-full"></span>
                            <span>{role}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="pt-2 text-[10px] text-[#555555] italic">
                        All engineering nodes operate as a single unified operational unit.
                      </div>
                    </div>

                    {/* Scope Inclusions */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-mono text-[#0066FF] tracking-widest uppercase font-medium">
                        Scope Inclusions
                      </h4>
                      <ul className="space-y-2">
                        {pod.scopeIncludes.map((bullet, idx) => (
                          <li key={idx} className="text-xs text-[#555555] flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-[#0066FF] mt-0.5 shrink-0" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Scope Exclusions */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-mono text-[#555555] tracking-widest uppercase font-medium">
                        Scope Exclusions
                      </h4>
                      <ul className="space-y-2">
                        {pod.scopeExcludes.map((bullet, idx) => (
                          <li key={idx} className="text-xs text-[#555555] flex items-start gap-2">
                            <X className="w-3.5 h-3.5 text-[#0A0A0A]/30 mt-0.5 shrink-0" />
                            <span className="opacity-80">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Examples and Tech Stack */}
                  <div className="pt-8 border-t border-[#0A0A0A]/10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    <div className="lg:col-span-8 space-y-3">
                      <h4 className="text-xs font-mono text-[#0066FF] tracking-widest uppercase font-medium">
                        Example Outcomes
                      </h4>
                      <div className="space-y-2">
                        {pod.exampleOutcomes.map((outcome, idx) => (
                          <blockquote key={idx} className="text-xs text-[#0A0A0A] pl-3 border-l-2 border-[#0066FF] italic leading-relaxed">
                            "{outcome}"
                          </blockquote>
                        ))}
                      </div>
                    </div>

                    <div className="lg:col-span-4 lg:text-right space-y-2">
                      <h4 className="text-xs font-mono text-[#555555] tracking-widest uppercase font-medium">
                        Recommended Stack Nodes
                      </h4>
                      <div className="flex flex-wrap lg:justify-end gap-1.5">
                        {pod.techStack.map((tech, idx) => (
                           <span key={idx} className="text-[10px] font-mono text-[#0A0A0A] bg-[#0A0A0A]/5 px-2.5 py-0.5 rounded-full">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* Comparison Table Section */}
      <section className="space-y-6">
        <div className="space-y-2">
          <span className="text-[#0066FF] text-xs font-medium uppercase tracking-widest block font-mono">
            Evaluation matrix // side by side
          </span>
          <h3 className="text-2xl font-display font-medium text-[#0A0A0A] tracking-tight">
            AI Engineering Pod Comparison Matrix
          </h3>
          <p className="text-xs text-[#555555]">
            Confirm which delivery configuration aligns best with your current systems and timelines.
          </p>
        </div>

        <div className="overflow-x-auto border border-[#0A0A0A] rounded-3xl shadow-sm">
          <table className="w-full text-left font-sans border-collapse">
            <thead>
              <tr className="bg-[#0A0A0A]/5 border-b border-[#0A0A0A]">
                <th className="p-4 text-xs font-mono text-[#0A0A0A] font-medium">Pod archetype</th>
                <th className="p-4 text-xs font-mono text-[#0A0A0A] font-medium">Execution timeline</th>
                <th className="p-4 text-xs font-mono text-[#0A0A0A] font-medium">Team size</th>
                {/* TODO(copy): "Price band" column. Pricing is not approved for publication. */}
                <th className="p-4 text-xs font-mono text-[#0A0A0A] font-medium">Best fit for</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0A0A0A]/10 text-xs">
              {POD_DETAILS.map((pod) => (
                <tr key={pod.id} className="hover:bg-[#0A0A0A]/5 transition-colors">
                  <td className="p-4 font-medium text-[#0A0A0A]">
                    <div className="font-sans text-sm font-medium">{pod.name}</div>
                    <div className="text-[10px] font-mono text-[#555555] mt-0.5">ID: {pod.id}</div>
                  </td>
                  <td className="p-4 text-[#0A0A0A] font-medium">{pod.weeks}</td>
                  <td className="p-4 text-[#0066FF] font-mono font-medium">{pod.teamSize} elite specialists</td>
                  <td className="p-4 text-[#555555] max-w-xs">{pod.bestFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </motion.div>
  );
}

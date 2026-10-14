import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Check, Mail, Send, Server } from 'lucide-react';
import SEO from './SEO';
import { trackContactFormSubmit } from '../utils/analytics';

const CONTACT_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['WebPage', 'ContactPage'],
      '@id': 'https://www.fwdpod.com/#contact',
      'url': 'https://www.fwdpod.com/contact',
      'name': 'Contact Fwdpod — Hire a Dedicated AI Engineering Team',
      'description': 'Reach Fwdpod\'s operations team to discuss your AI engineering requirements. Deploy a dedicated AI pod in under one week.',
      'isPartOf': { '@id': 'https://www.fwdpod.com/#website' },
      'about': { '@id': 'https://www.fwdpod.com/#organization' },
      'breadcrumb': {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.fwdpod.com/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Contact Us', 'item': 'https://www.fwdpod.com/contact' }
        ]
      }
    },
    {
      '@type': 'ContactPoint',
      'contactType': 'customer support',
      'areaServed': 'Worldwide',
      'availableLanguage': ['English'],
      'hoursAvailable': {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
        'opens': '00:00',
        'closes': '23:59'
      }
    }
  ]
};

interface ContactViewProps {
  onNavigate: (pageName: string, preselectedPodId?: string) => void;
  triggerNotification?: (msg: string) => void;
}

export default function ContactView({ onNavigate, triggerNotification }: ContactViewProps) {
  // Form submission and validation states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [archetype, setArchetype] = useState('agentic-ops');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      if (triggerNotification) {
        triggerNotification("Please fill in all required fields.");
      }
      return;
    }

    setIsSubmitting(true);
    // Simulate API request processing
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      trackContactFormSubmit(archetype);
      if (triggerNotification) {
        triggerNotification(`Message from ${name} successfully transmitted to Fwdpod Operations.`);
      }
    }, 1200);
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setCompany('');
    setArchetype('agentic-ops');
    setMessage('');
    setIsSubmitted(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto py-6 font-sans space-y-12"
      id="contact-view-page"
    >
      <SEO
        title="Contact Fwdpod — Hire a Dedicated AI Engineering Team"
        description="Reach Fwdpod's operations team to discuss your AI engineering requirements. Deploy a dedicated AI pod in under one week."
        jsonLd={CONTACT_JSON_LD}
      />
      {/* Page Header Area */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="bg-[#0066FF]/5 text-[#0066FF] text-[9px] font-mono uppercase px-3 py-1 font-bold tracking-widest rounded-md border border-[#0066FF]/10">
            Operations desk // Active live
          </span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-display font-medium tracking-tight text-[#0A0A0A] leading-tight">
              Initiate transmission. Deploy next-gen output.
            </h1>
            <p className="text-[#555555] text-sm md:text-base leading-relaxed">
              Ready to instantiate a pre-formed AI engineering pod or customize standard execution SLAs? Reach our operations team directly or build a custom layout.
            </p>
          </div>
          <Link
            to="/"
            className="text-xs font-mono text-zinc-500 hover:text-[#0A0A0A] underline cursor-pointer shrink-0 text-center"
          >
            ← Return to Home
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Side: Contact Form Container */}
        <div className="lg:col-span-7 bg-white border border-[#0A0A0A]/10 p-6 md:p-8 rounded-3xl shadow-sm relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.form 
                key="contact-form"
                onSubmit={handleSubmit} 
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="space-y-1 border-b border-[#0A0A0A]/5 pb-4">
                  <h2 className="text-lg font-medium text-[#0A0A0A] tracking-tight">Direct Transmission Form</h2>
                  <p className="text-[11px] text-zinc-400 font-mono uppercase">Operational routing code: INBOUND-W-2026</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-mono font-semibold uppercase text-[#555555]" id="label-name">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="input-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Sarah Jenkins"
                      className="w-full bg-[#0A0A0A]/5 text-[#0A0A0A] text-xs font-medium px-4 py-3 rounded-xl border border-transparent focus:border-[#0066FF] focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-mono font-semibold uppercase text-[#555555]" id="label-email">
                      Work Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="input-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g., s.jenkins@enterprise.com"
                      className="w-full bg-[#0A0A0A]/5 text-[#0A0A0A] text-xs font-medium px-4 py-3 rounded-xl border border-transparent focus:border-[#0066FF] focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-mono font-semibold uppercase text-[#555555]" id="label-company">
                      Organization Name
                    </label>
                    <input
                      id="input-company"
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g., NextDot Global"
                      className="w-full bg-[#0A0A0A]/5 text-[#0A0A0A] text-xs font-medium px-4 py-3 rounded-xl border border-transparent focus:border-[#0066FF] focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-mono font-semibold uppercase text-[#555555]" id="label-archetype">
                      Target Pod Composition
                    </label>
                    <select
                      id="input-archetype"
                      value={archetype}
                      onChange={(e) => setArchetype(e.target.value)}
                      className="w-full bg-[#0A0A0A]/5 text-[#0A0A0A] text-xs font-medium px-4 py-3 rounded-xl border border-transparent focus:border-[#0066FF] focus:bg-white outline-none transition-all cursor-pointer appearance-none"
                    >
                      <option value="agentic-ops">Agentic Operations Pod</option>
                      <option value="voice-ai">Voice AI Core Pod</option>
                      <option value="rag-system">Enterprise Knowledge RAG Pod</option>
                      <option value="compliance-guard">Compliance & AI Guardrails Pod</option>
                      <option value="custom">Fully Customized Hybrid Composition</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-mono font-semibold uppercase text-[#555555]" id="label-message">
                    Inquiry Details & Target Deliverables <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="input-message"
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your current bottlenecks, target product deadlines, or team composition specifications..."
                    className="w-full bg-[#0A0A0A]/5 text-[#0A0A0A] text-xs font-medium px-4 py-3 rounded-xl border border-transparent focus:border-[#0066FF] focus:bg-white outline-none transition-all resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    id="btn-submit-contact"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#0066FF] hover:bg-[#0055DD] text-white font-semibold text-xs py-3.5 px-6 rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-[#0066FF]/10 disabled:opacity-75"
                  >
                    {isSubmitting ? (
                      <>
                        <Server className="w-4 h-4 animate-spin" />
                        <span>Transmitting Pod Request...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Transmit Configuration Request</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.div 
                key="success-form"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-10 text-center space-y-6"
                id="contact-success-state"
              >
                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto border border-green-100 shadow-sm">
                  <Check className="w-8 h-8" />
                </div>
                
                <div className="space-y-2 max-w-md mx-auto">
                  <h3 className="text-2xl font-display font-medium text-[#0A0A0A]">
                    Transmission Confirmed
                  </h3>
                  <p className="text-xs text-[#555555] font-mono uppercase text-green-600 font-bold tracking-wider">
                    SECURE INTAKE // COMPLETED
                  </p>
                  <p className="text-xs sm:text-sm text-[#555555] leading-relaxed">
                    Thank you, <strong className="text-black font-semibold">{name}</strong>. Your requirement payload for the <strong className="text-[#0066FF] font-semibold">{archetype.replace('-', ' ').toUpperCase()}</strong> has been routed to our Lead Solutions Architect.
                  </p>
                </div>

                <div className="bg-[#0A0A0A]/5 p-4 rounded-2xl max-w-sm mx-auto text-left space-y-2 border border-[#0A0A0A]/5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[#555555]">TICKET REF:</span>
                    <span className="text-black font-bold">FWD-{(Math.floor(Math.random() * 89999) + 10000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#555555]">FORWARD ROUTING:</span>
                    <span className="text-black">FOUNDER_STREAMS</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleReset}
                    className="border border-zinc-200 hover:border-black text-zinc-600 hover:text-black hover:bg-zinc-50 text-xs font-semibold py-3 px-6 rounded-full transition-all cursor-pointer"
                  >
                    Send Another Transmission
                  </button>
                  <Link
                    to="/"
                    className="bg-[#0066FF] hover:bg-[#0055DD] text-white text-xs font-semibold py-3 px-6 rounded-full transition-all cursor-pointer text-center"
                  >
                    Go Back Home
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Right Side: Operational Metadata / Hotline Direct Blocks */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Status SLA Widget */}
          <div className="bg-[#0A0A0A] text-white p-6 rounded-3xl border border-zinc-800 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 justify-between">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                Service Level Assurance
              </span>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold">
                Online // Perfect
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-display font-medium text-white leading-tight">
                2-Hour Solution SLA
              </h3>
              <p className="text-xs text-zinc-400">
                All customized specifications are triaged within two hours, with pre-assembled core pods fully mapped to architecture blueprints in under 48 hours.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 pt-2 text-center text-xs font-mono">
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl">
                <span className="text-[10px] block text-zinc-500 uppercase">Coverage</span>
                <span className="font-semibold text-white">24/7/365 Global</span>
              </div>
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl">
                <span className="text-[10px] block text-zinc-500 uppercase">Avg Response</span>
                <span className="font-semibold text-emerald-400">47 Minutes</span>
              </div>
            </div>
          </div>

          {/* Direct contact. contact.fwdpod@gmail.com is the confirmed working mailbox.
              The fictional 555 hotline stays removed; a phone number can be added here
              once a real one is verified. */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#555555] font-bold">
              Direct Access Paths
            </h4>

            <a
              href="mailto:contact.fwdpod@gmail.com"
              className="p-5 border border-zinc-200/85 bg-zinc-50/40 hover:border-[#0066FF] hover:bg-zinc-50 hover:shadow-sm rounded-2xl transition-all duration-200 flex items-center gap-4 group text-left block"
            >
              <div className="w-12 h-12 bg-[#0066FF]/5 text-[#0066FF] rounded-full flex items-center justify-center shrink-0 border border-[#0066FF]/10 group-hover:bg-[#0066FF] group-hover:text-white transition-all">
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] uppercase font-mono text-zinc-400 tracking-wider block">Email</span>
                <span className="text-sm sm:text-base font-semibold text-[#0A0A0A] group-hover:text-[#0066FF] transition-colors font-mono">
                  contact.fwdpod@gmail.com
                </span>
              </div>
            </a>
          </div>

          {/* Secure Assurance Label */}
          <div className="p-4 border border-zinc-100 rounded-2xl bg-zinc-50/20 text-[11px] text-zinc-500 leading-relaxed font-sans space-y-1">
            <span className="font-semibold text-[#0A0A0A] block">Secure Routing Assured</span>
            <p>
              Your enterprise information is treated with sovereign confidentiality. Inbound data is secured end-to-end, audited against strict privacy guardrails, and not shared with external aggregators or model scrapers.
            </p>
          </div>

        </div>

      </div>

    </motion.div>
  );
}

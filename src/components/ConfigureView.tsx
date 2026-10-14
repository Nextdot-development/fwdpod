import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { POD_DETAILS } from '../data';
import { ArrowLeft, ArrowRight, Check, HelpCircle, AlertTriangle, Sliders, X } from 'lucide-react';
import SEO from './SEO';

const CONFIGURE_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://www.fwdpod.com/#configure',
      'url': 'https://www.fwdpod.com/configure',
      'name': 'Configure Your Dedicated AI Engineering Team | Fwdpod',
      'description': 'Answer 5 questions and receive a custom AI engineering pod proposal within 48 hours. Specify your industry, timeline, budget, and compliance requirements.',
      'isPartOf': { '@id': 'https://www.fwdpod.com/#website' },
      'breadcrumb': {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.fwdpod.com/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Configure Pod', 'item': 'https://www.fwdpod.com/configure' }
        ]
      }
    }
  ]
};

interface ConfigureViewProps {
  initialPodId: string | null;
  onClearPodSelection: () => void;
}

export default function ConfigureView({ initialPodId, onClearPodSelection }: ConfigureViewProps) {
  // Setup Intake form state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedPod, setSelectedPod] = useState<string>('');
  
  // Context Step (Step 2)
  const [industry, setIndustry] = useState<string>('Technology');
  const [maturity, setMaturity] = useState<string>('Pilots running');

  // Outcome Step (Step 3)
  const [outcome, setOutcome] = useState<string>('');

  // Constraints Step (Step 4)
  const [timeline, setTimeline] = useState<string>('Within 3 months');
  const [budget, setBudget] = useState<string>('$100K-$250K');
  const [compliance, setCompliance] = useState<string[]>([]);

  // Your Details Step (Step 5)
  const [userName, setUserName] = useState<string>('');
  const [company, setCompany] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<string>('CTO');

  // Submission details
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [showTrialEndedModal, setShowTrialEndedModal] = useState<boolean>(false);

  // Check if user has configured before on mount
  useEffect(() => {
    // Disabled trial-ended constraint pop up to allow infinite configurations
  }, []);

  // Set selected pod from navigation if present
  useEffect(() => {
    if (initialPodId) {
      setSelectedPod(initialPodId);
    } else {
      setSelectedPod('voice-ai'); // Default to Voice AI
    }
  }, [initialPodId]);

  const toggleCompliance = (chip: string) => {
    if (chip === 'None') {
      setCompliance(['None']);
    } else {
      setCompliance(prev => {
        const filtered = prev.filter(c => c !== 'None');
        if (filtered.includes(chip)) {
          return filtered.filter(c => c !== chip);
        } else {
          return [...filtered, chip];
        }
      });
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Step 5 Submit
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setShowResult(true);
        localStorage.setItem('fwdpod_has_configured', 'true');
      }, 3000); // 3 seconds spinner as required!
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setOutcome('');
    setCompliance([]);
    setUserName('');
    setCompany('');
    setEmail('');
    setShowResult(false);
    onClearPodSelection();
  };

  // Get current active pod details for contextualizing the mock AI result
  const activePodConfig = POD_DETAILS.find(p => p.id === selectedPod) || POD_DETAILS[0];

  const stepsList = [
    { num: 1, label: 'Pod type' },
    { num: 2, label: 'Context' },
    { num: 3, label: 'Outcome' },
    { num: 4, label: 'Constraints' },
    { num: 5, label: 'Your details' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="max-w-3xl mx-auto space-y-12 py-6"
    >
      <SEO
        title="Configure Your Dedicated AI Engineering Team | Fwdpod"
        description="Answer 5 questions and receive a custom AI engineering pod proposal within 48 hours. Specify your industry, timeline, budget, and compliance requirements."
        jsonLd={CONFIGURE_JSON_LD}
      />

      {/* Header */}
      {!showResult && !isSubmitting && (
        <section className="text-center space-y-3">
          <span className="text-[#0066FF] text-xs font-mono uppercase tracking-widest font-medium block">
            Intake scrutiny // step-by-step prompt engine
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-medium text-[#0A0A0A] tracking-tight">
            Configure Your AI Engineering Pod.
          </h1>
          <p className="text-xs text-[#555555] max-w-lg mx-auto leading-relaxed">
            Five questions. Two-minute scoping. A technical lead will assemble and issue a full custom execution proposal within 48 hours.
          </p>
        </section>
      )}

      {/* Progress timeline bar */}
      {!showResult && !isSubmitting && (
        <div className="border border-[#0A0A0A] p-4 bg-white rounded-3xl shadow-sm">
          <div className="grid grid-cols-5 relative text-center">
            {stepsList.map((st) => {
              const isPassed = st.num < currentStep;
              const isCurrent = st.num === currentStep;
              return (
                <div key={st.num} className="relative z-10 flex flex-col items-center">
                  <div 
                    className={`w-7 h-7 flex items-center justify-center text-xs font-mono border transition-colors rounded-full ${
                      isCurrent 
                        ? 'bg-[#0066FF] border-[#0066FF] text-white' 
                        : isPassed 
                        ? 'bg-[#0A0A0A] border-[#0A0A0A] text-white' 
                        : 'bg-white border-[#0A0A0A]/20 text-[#555555]'
                    }`}
                  >
                    {isPassed ? '✓' : st.num}
                  </div>
                  <span className={`text-[9px] font-mono uppercase tracking-wider mt-1.5 hidden md:block ${
                    isCurrent ? 'text-[#0066FF] font-medium' : 'text-[#555555]'
                  }`}>
                    {st.label}
                  </span>
                </div>
              );
            })}
            
            {/* Visual background connection line */}
            <div className="absolute top-[13px] left-[10%] right-[10%] h-[1px] bg-[#0A0A0A]/10 -z-0"></div>
          </div>
        </div>
      )}

      {/* Main Intake Form Form Container */}
      {!showResult && !isSubmitting && (
        <div className="border border-[#0A0A0A] bg-white p-6 md:p-8 space-y-8 min-h-[400px] flex flex-col justify-between rounded-3xl shadow-sm text-zinc-900">
          
          {/* STEP 1: Pod type Selector */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-mono text-[#0066FF] uppercase tracking-wider font-medium">
                  Step 1: Which pod specification does your project map to?
                </label>
                <p className="text-xs text-[#555555]">
                  Select the template archetype that matches your primary technical constraints.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {POD_DETAILS.map((p) => {
                  const isChecked = selectedPod === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPod(p.id)}
                      className={`border p-4 cursor-pointer flex items-start gap-4 select-none rounded-2xl transform hover:-translate-y-1 transition-all duration-300 ease-out ${
                        isChecked 
                          ? 'border-[#0066FF] bg-[#0066FF]/5 shadow-md' 
                          : 'border-zinc-200 hover:border-[#0066FF] hover:bg-zinc-50/50 hover:shadow-md'
                      }`}
                    >
                      <input
                        type="radio"
                        checked={isChecked}
                        onChange={() => setSelectedPod(p.id)}
                        className="mt-1.5 h-3.5 w-3.5 accent-[#0066FF]"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-[#0A0A0A] font-display">{p.name}</h3>
                          <span className="text-[10px] font-mono text-[#555555] bg-white border border-[#0A0A0A]/10 px-2 py-0.5 rounded-md">
                            {p.weeks}
                          </span>
                        </div>
                        <p className="text-xs text-[#555555] leading-relaxed">{p.oneLiner}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Context Selection */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="space-y-1">
                <label className="text-xs font-mono text-[#0066FF] uppercase tracking-wider font-medium">
                  Step 2: Tell us about your operational context
                </label>
                <p className="text-xs text-[#555555]">
                  We customize the pod staffing based on regulatory constraints in your sector.
                </p>
              </div>

              {/* A. Industry sector selection */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-[#0A0A0A] tracking-tight">Your Primary Industry Sector:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {['Healthcare', 'Financial Services', 'Manufacturing', 'Retail', 'Technology', 'Other'].map((ind) => (
                    <label 
                      key={ind}
                      className={`border p-3 text-xs flex items-center gap-2 cursor-pointer rounded-xl transform hover:-translate-y-1 transition-all duration-300 ease-out ${
                        industry === ind 
                          ? 'border-[#0066FF] bg-[#0066FF]/5 text-[#0066FF] font-semibold shadow-md' 
                          : 'border-zinc-200 hover:border-[#0066FF] hover:bg-zinc-50/50 hover:shadow-md'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="industry" 
                        value={ind} 
                        checked={industry === ind} 
                        onChange={() => setIndustry(ind)}
                        className="accent-[#0066FF] h-3 w-3"
                      />
                      <span>{ind}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* B. AI Maturity */}
              <div className="space-y-3 pt-4 border-t border-[#0A0A0A]/10">
                <h4 className="text-xs font-semibold text-[#0A0A0A] tracking-tight">Current Organizational AI Maturity:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { val: 'Just exploring', desc: 'Understanding capabilities and drafting blueprints.' },
                    { val: 'Pilots running', desc: 'Active sandbox systems with custom APIs loaded.' },
                    { val: 'Production systems', desc: 'Live customer-facing agent services active.' },
                    { val: 'Mature AI org', desc: 'In-house fine-tuning pipelines and compliance logs.' }
                  ].map((mat) => (
                    <label 
                      key={mat.val}
                      className={`border p-3 text-xs flex items-start gap-2 cursor-pointer rounded-xl transform hover:-translate-y-1 transition-all duration-300 ease-out ${
                        maturity === mat.val 
                          ? 'border-[#0066FF] bg-[#0066FF]/5 text-[#0066FF] font-semibold shadow-md' 
                          : 'border-zinc-200 hover:border-[#0066FF] hover:bg-zinc-50/50 hover:shadow-md'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="maturity" 
                        value={mat.val} 
                        checked={maturity === mat.val} 
                        onChange={() => setMaturity(mat.val)}
                        className="accent-[#0066FF] h-3 w-3 mt-0.5"
                      />
                      <div>
                        <div>{mat.val}</div>
                        <div className="text-[10px] text-[#555555] font-normal font-sans mt-0.5">{mat.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Outcome text area */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs font-mono text-[#0066FF] uppercase tracking-wider font-medium">
                    Step 3: What do you want this pod to deliver? <span className="text-red-500 font-sans">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-white bg-red-500 px-2 py-0.5 uppercase tracking-wider font-semibold">
                    Compulsory
                  </span>
                </div>
                <p className="text-xs text-[#555555]">
                  Be as explicit as possible about the end business logic, API connections, and latency metrics.
                </p>
              </div>

              <div className="space-y-2">
                <textarea
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  placeholder="e.g., Deploy a custom dual-agent system that reconciles healthcare billing payouts by parsing our raw PDFs on GCP, comparing against our private MySQL schemas, and alerting on anomalies directly into our team Slack channel. Needs a custom web console dashboard."
                  className="w-full min-h-[160px] border border-[#0A0A0A] p-4 text-xs font-sans text-[#0A0A0A] placeholder-[#555555]/50 focus:outline-none focus:border-[#0066FF] rounded-2xl"
                />
                
                <div className="p-3 bg-[#0A0A0A]/5 text-[10px] text-[#555555] leading-relaxed border-l-2 border-[#0066FF] rounded-r-xl">
                  <strong>PRO-TIP:</strong> Specifying constraints like raw input file sizes, private network environments, or desired latency speeds helps our architects size the code constraints much faster.
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Constraints filters */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-mono text-[#0066FF] uppercase tracking-wider font-medium">
                  Step 4: Operational constraints and requirements
                </label>
                <p className="text-xs text-[#555555]">
                  Specify timeline thresholds, allocation budgets, and hard privacy standards.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* A. Timeline and allocation */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#0A0A0A]">Target Delivery Timeline:</label>
                  <select
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="w-full border border-[#0A0A0A] p-2.5 text-xs text-[#0A0A0A] focus:outline-none focus:border-[#0066FF] bg-white rounded-xl"
                  >
                    <option>ASAP</option>
                    <option>Within 3 months</option>
                    <option>Within 6 months</option>
                    <option>Flexible</option>
                  </select>
                </div>

                {/* B. Budget band */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#0A0A0A]">Target Budget Band Allocation:</label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full border border-[#0A0A0A] p-2.5 text-xs text-[#0A0A0A] focus:outline-none focus:border-[#0066FF] bg-white rounded-xl"
                  >
                    <option>under $50K</option>
                    <option>$50K-$100K</option>
                    <option>$100K-$250K</option>
                    <option>$250K plus</option>
                  </select>
                </div>
              </div>

              {/* C. Compliance requirements Chips/Tags */}
              <div className="space-y-3 pt-4 border-t border-[#0A0A0A]/10">
                <label className="text-xs font-medium text-[#0A0A0A] block">Regulatory & Compliance Standard Scopes:</label>
                <div className="flex flex-wrap gap-2">
                  {/* TODO(decision): SOC2 removed from the options a prospect can select. */}
                  {['HIPAA', 'DPDP', 'GDPR', 'ISO 27001', 'None'].map((chip) => {
                    const isSelected = compliance.includes(chip);
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => toggleCompliance(chip)}
                        className={`text-xs px-3.5 py-1.5 border font-mono transition-colors rounded-full ${
                          isSelected 
                            ? 'bg-[#0066FF] border-[#0066FF] text-white font-medium' 
                            : 'bg-white border-[#0A0A0A]/15 hover:border-[#0A0A0A] text-[#555555]'
                        }`}
                      >
                        {isSelected && '✓ '}
                        {chip}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Your details */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-mono text-[#0066FF] uppercase tracking-wider font-medium">
                  Step 5: Professional profile registry
                </label>
                <p className="text-xs text-[#555555]">
                  We restrict pod scoping briefs strictly to verified corporate technical operators and decision-makers.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#0A0A0A]">Full Name</label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Marcus Vance"
                    className="w-full border border-[#0A0A0A] p-2.5 text-xs text-[#0A0A0A] focus:outline-none focus:border-[#0066FF] rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#0A0A0A]">Company / Organization</label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Healthcare Nexus Corp"
                    className="w-full border border-[#0A0A0A] p-2.5 text-xs text-[#0A0A0A] focus:outline-none focus:border-[#0066FF] rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#0A0A0A]">Corporate Work Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="marcus@healthcarenexus.com"
                    className="w-full border border-[#0A0A0A] p-2.5 text-xs text-[#0A0A0A] focus:outline-none focus:border-[#0066FF] rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#0A0A0A]">Your primary professional role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full border border-[#0A0A0A] p-2.5 text-xs text-[#0A0A0A] focus:outline-none focus:border-[#0066FF] bg-white rounded-xl"
                  >
                    <option>CTO</option>
                    <option>VP of Engineering</option>
                    <option>Product Director</option>
                    <option>CEO / Founder</option>
                    <option>Technical Architect</option>
                    <option>Other Executive / Corporate Operator</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls row */}
          <div className="pt-6 border-t border-[#0A0A0A]/10 flex flex-wrap items-center justify-between gap-4">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="text-xs text-[#555555] hover:text-[#0A0A0A] underline flex items-center gap-1 font-mono font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep === 3 && !outcome.trim() && (
              <span className="text-[11px] font-mono text-red-500 animate-pulse text-center sm:text-right flex-1">
                ⚠️ Outlining your outcome is compulsory to proceed
              </span>
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={
                (currentStep === 3 && !outcome.trim()) ||
                (currentStep === 5 && (!userName || !company || !email))
              }
              className={`bg-[#0066FF] text-white hover:bg-[#0055DD] text-xs font-semibold py-2.5 px-6 flex items-center gap-1.5 active:bg-[#0044BB] disabled:opacity-50 disabled:cursor-not-allowed rounded-full shadow-sm`}
            >
              <span>{currentStep === 5 ? 'Submit and scope' : 'Next step'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* LOADING STATE screen */}
      {isSubmitting && (
        <div className="border border-[#0A0A0A] bg-white p-12 text-center min-h-[400px] flex flex-col justify-center items-center space-y-6 rounded-3xl shadow-sm">
          <div className="w-14 h-14 border-4 border-[#0066FF] border-t-transparent rounded-full animate-spin"></div>
          <div className="space-y-2">
            <h3 className="text-sm font-mono tracking-wider text-[#0066FF] font-medium uppercase">
              Generating preliminary pod scope...
            </h3>
            <p className="text-xs text-[#555555] max-w-sm leading-relaxed">
              Consolidating template criteria, analyzing industry constraints, and indexing typical role targets dynamically. Let's build your scope layout.
            </p>
          </div>
        </div>
      )}

      {/* STATS / OUTPUT PREVIEW CARD - Demonstration Content */}
      {showResult && (
        <div className="space-y-6 animate-fadeIn">
          {/* Demo Content Warning Banner */}
          <div className="border border-[#0066FF] p-4 bg-[#0066FF]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl hover:shadow-md transform hover:-translate-y-1 transition-all duration-300 ease-out">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#0066FF]/10 flex items-center justify-center shrink-0 rounded-full">
                <span className="text-[#0066FF] text-[12px] font-mono font-bold">!</span>
              </div>
              <div>
                <p className="text-xs font-mono font-bold text-[#0066FF] uppercase tracking-wider">
                  Operational Notice
                </p>
                <p className="text-xs text-[#555555] font-medium font-sans">
                  The preliminary pod scope drafting output is currently simulating layout criteria.
                </p>
              </div>
            </div>
            <span className="inline-flex self-start sm:self-auto text-[10px] font-mono font-semibold tracking-wider uppercase bg-[#0066FF] text-white px-3 py-1.5 border border-[#0066FF]/20 rounded-full">
              Demo content — backend integration pending
            </span>
          </div>

          {/* Large custom proposal scoping layout */}
          <div className="border-2 border-zinc-200 bg-white p-6 md:p-8 space-y-8 rounded-3xl shadow-md hover:border-[#0066FF] hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-out">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-[#0A0A0A]/10 pb-6">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[#0066FF] uppercase tracking-widest font-medium">
                  Preliminary architectural assignment draft
                </span>
                <h3 className="text-2xl font-display font-medium text-[#0A0A0A] tracking-tight">
                  Scoping specification for {company}
                </h3>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-mono text-[#555555]">Proposal status: draft</div>
                <div className="text-xs font-medium text-[#0066FF] font-mono uppercase mt-0.5">Assembled in seconds</div>
              </div>
            </div>

            {/* Configured Parameters summary list */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-[#0A0A0A]/5 text-xs font-mono rounded-xl">
              <div>
                <span className="text-[#555555] block text-[9px]">Target archetype:</span>
                <span className="text-[#0A0A0A] font-medium">{activePodConfig.name}</span>
              </div>
              <div>
                <span className="text-[#555555] block text-[9px]">Your sector:</span>
                <span className="text-[#0A0A0A] font-medium">{industry}</span>
              </div>
              <div>
                <span className="text-[#555555] block text-[9px]">Allocation timeline:</span>
                <span className="text-[#0066FF] font-medium">{timeline}</span>
              </div>
              <div>
                <span className="text-[#555555] block text-[9px]">Compliance targets:</span>
                <span className="text-[#0A0A0A] font-medium">
                  {compliance.length > 0 ? compliance.join(', ') : 'None specified'}
                </span>
              </div>
            </div>

            {/* Core result content grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4">
              
              {/* Pod composition column */}
              <div className="md:col-span-5 space-y-4">
                <h4 className="text-xs font-mono text-[#0066FF] uppercase tracking-widest font-medium pb-2 border-b border-[#0A0A0A]/10">
                  Staffing unit layout
                </h4>
                <ul className="space-y-3">
                  {activePodConfig.includedRoles.map((roleText, idx) => (
                    <li key={idx} className="text-xs text-[#0A0A0A] flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-[#0066FF] rounded-full" />
                      <strong>{roleText}</strong>
                    </li>
                  ))}
                </ul>
                <div className="p-3 bg-[#0A0A0A]/5 text-[10px] text-[#555555] leading-relaxed rounded-xl">
                  Every node operating standardly is on-boarded and has built multi-agent configurations inside {industry} boundaries previously.
                </div>
              </div>

              {/* Proposed Timeline Phase Breakdown */}
              <div className="md:col-span-7 space-y-4">
                <h4 className="text-xs font-mono text-[#0066FF] uppercase tracking-widest font-medium pb-2 border-b border-[#0A0A0A]/10">
                  Target Project Phases // 12 Weeks Standard
                </h4>

                <div className="space-y-4 font-sans text-xs">
                  <div className="relative pl-6">
                    <div className="absolute top-1 left-0 w-2.5 h-2.5 border border-[#0A0A0A] bg-[#0A0A0A] rounded-full"></div>
                    <strong>Weeks 1-3 // Deep integration sensing and blueprint engine</strong>
                    <p className="text-[#555555] mt-0.5">Wire streaming pipes and index target telemetry checkpoints against client data models.</p>
                  </div>
                  
                  <div className="relative pl-6">
                    <div className="absolute top-1 left-0 w-2.5 h-2.5 border border-[#0A0A0A] bg-[#0A0A0A] rounded-full"></div>
                    <strong>Weeks 4-8 // Agent orchestration and compliance harness runtime</strong>
                    <p className="text-[#555555] mt-0.5">Build state loops, plug custom system routers, and load test air-gapped scrubbing hooks.</p>
                  </div>

                  <div className="relative pl-6">
                    <div className="absolute top-1 left-0 w-2.5 h-2.5 border border-[#0066FF] bg-[#0066FF] rounded-full"></div>
                    <strong>Weeks 9-12 // Observation channels, dry-run reconciliations, and handover</strong>
                    <p className="text-[#555555] mt-0.5">Complete user acceptance verification, trace prompt histories inside Langfuse logs, and transition keys.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Core Scope list */}
            <div className="space-y-3 pt-6 border-t border-[#0A0A0A]/10">
              <h4 className="text-xs font-mono text-[#0066FF] uppercase tracking-widest font-medium">
                Inclusions standardly addressed in this proposal:
              </h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activePodConfig.scopeIncludes.map((inc, i) => (
                  <li key={i} className="text-xs text-[#555555] flex items-start gap-2">
                    <span className="text-[#0066FF] font-mono mt-0.5">✓</span>
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Next Steps Card */}
            <div className="bg-[#0066FF] text-white p-6 space-y-4 rounded-2xl shadow-sm hover:shadow-lg hover:bg-[#0055DD] transform hover:-translate-y-1 transition-all duration-300 ease-out">
              <h4 className="text-sm font-medium tracking-tight">
                Clear next steps
              </h4>
              <p className="text-xs leading-relaxed opacity-90 max-w-xl">
                A Technical Portfolio Principal will review this dossier alongside your target outcome parameters ("{outcome ? outcome.slice(0, 100) + '...' : 'No target outcome specified'}") and establish a production feasibility report within 48 hours. We'll invite your engineering leads for a dry-run demo call.
              </p>
              <div className="text-xs font-mono tracking-wider opacity-90 pt-2 border-t border-white/20 font-semibold">
                A Pod Lead will send you a full proposal within 48 hours.
              </div>
            </div>

          </div>

          {/* Action Row */}
          <div className="flex justify-between items-center pt-4">
            <button
              onClick={handleRestart}
              className="text-xs text-[#555555] hover:text-[#0A0A0A] underline font-mono font-medium"
            >
              Reset and configure another scope
            </button>
            <div className="text-xs text-[#555555]">
              Scoping ID: <span className="font-mono text-[#0A0A0A] font-medium">FWD-SC-{Math.floor(1000 + Math.random() * 9000)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Trial Period Concluded Modal */}
      <AnimatePresence>
        {showTrialEndedModal && (
          <div className="fixed inset-0 z-50 bg-[#0A0A0A]/45 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white border border-[#0A0A0A] p-6 md:p-8 max-w-md w-full relative text-[#0A0A0A] space-y-6 rounded-3xl shadow-2xl"
            >
              <button 
                onClick={() => setShowTrialEndedModal(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-[#0A0A0A]/5 border border-transparent text-[#0A0A0A] rounded-full transition-colors"
                title="Dismiss Modal"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-2 text-center">
                <div className="w-14 h-14 bg-amber-500/10 text-amber-500 flex items-center justify-center rounded-full mx-auto border border-amber-300">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                
                <span className="inline-block bg-[#0066FF]/5 text-[#0066FF] text-[8px] tracking-widest font-mono uppercase px-2.5 py-1 rounded">
                  Fwdpod operations desk // notice
                </span>
                
                <h3 className="text-2xl font-semibold tracking-tight font-display text-[#0A0A0A]">
                  Trial Period Concluded
                </h3>
                <p className="text-xs text-zinc-500 font-sans leading-relaxed">
                  Your free trial has ended. Sandbox trial cluster builds are constrained to one active free environment per client footprint.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={() => {
                    localStorage.removeItem('fwdpod_has_configured');
                    setShowTrialEndedModal(false);
                    handleRestart();
                  }}
                  className="w-full bg-[#0066FF] hover:bg-[#0055DD] text-white font-semibold text-xs py-3.5 rounded-full transition-colors transition-all shadow-md text-center cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Try configuring a new pod</span>
                </button>

                <button
                  onClick={() => {
                    setShowTrialEndedModal(false);
                  }}
                  className="w-full border border-zinc-200 text-zinc-650 hover:bg-zinc-50 font-semibold text-xs py-3 rounded-full transition-colors text-center cursor-pointer"
                >
                  Review proposal details
                </button>
              </div>

              <div className="pt-4 border-t border-zinc-100 flex items-center justify-center">
                <button 
                  onClick={() => {
                    localStorage.removeItem('fwdpod_has_configured');
                    setShowTrialEndedModal(false);
                  }}
                  className="text-[9px] font-mono text-zinc-400 hover:text-[#0066FF] transition-colors uppercase tracking-wider"
                >
                  [ Bypass limit for review ]
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

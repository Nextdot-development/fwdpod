import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Check, ArrowRight, ShieldCheck, Zap, 
  Sparkles, Terminal, Activity, Loader2, Sparkle, AlertTriangle, Sliders
} from 'lucide-react';
import { POD_DETAILS } from '../data';

interface BookConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (tab: string) => void;
}

type SimulationStep = 'idle' | 'provisioning' | 'securing' | 'routing' | 'success';

export default function BookConsultationModal({ isOpen, onClose, onNavigate }: BookConsultationModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedPodId, setSelectedPodId] = useState(POD_DETAILS[0]?.id || '');
  const [vertical, setVertical] = useState('Technology');
  const [step, setStep] = useState<SimulationStep>('idle');
  const [progress, setProgress] = useState(0);
  const [hasBookedBefore, setHasBookedBefore] = useState(false);

  // Reset modal state on reopen and check trial booking status
  useEffect(() => {
    if (isOpen) {
      setName('');
      setEmail('');
      setStep('idle');
      setProgress(0);
      setHasBookedBefore(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    // Begin dynamic simulation loop
    setStep('provisioning');
    setProgress(15);

    setTimeout(() => {
      setStep('securing');
      setProgress(50);
    }, 1200);

    setTimeout(() => {
      setStep('routing');
      setProgress(85);
    }, 2400);

    setTimeout(() => {
      setStep('success');
      setProgress(100);
      localStorage.setItem('fwdpod_has_booked_trial', 'true');
    }, 3600);
  };

  const handleResetForTesting = () => {
    localStorage.removeItem('fwdpod_has_booked_trial');
    setHasBookedBefore(false);
    setStep('idle');
    setProgress(0);
  };

  const selectedPodName = POD_DETAILS.find(p => p.id === selectedPodId)?.name || 'Custom Pod';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop Overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-zinc-950/75 backdrop-blur-sm cursor-zoom-out"
        />

        {/* Modal Container */}
        <motion.div
          id="instant-booking-modal"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 380 }}
          className="relative bg-white border border-zinc-200 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden z-10 text-[#0A0A0A] font-sans flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0066FF] animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-500">
                SLA Instant Trial Provisioning
              </span>
            </div>
            <button 
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 p-1.5 rounded-full transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {hasBookedBefore ? (
              <div className="space-y-6 py-4 text-center my-auto animate-fadeIn">
                <div className="w-14 h-14 bg-amber-500/10 text-amber-500 flex items-center justify-center rounded-full mx-auto border border-amber-350">
                  <AlertTriangle className="w-7 h-7" />
                </div>

                <div className="space-y-2">
                  <h4 className="text-xl font-display font-medium text-[#0A0A0A] tracking-tight">
                    Trial Period Concluded
                  </h4>
                  <p className="text-sm text-zinc-600 max-w-sm mx-auto leading-relaxed">
                    Your free trial has ended. Sandbox trial cluster builds are constrained to one active free environment per client footprint.
                  </p>
                  <p className="text-xs text-zinc-500">
                    To deploy specialized specialists or configure multi-user environments, assemble a tailored custom team.
                  </p>
                </div>

                <div className="pt-4 space-y-3">
                  <button
                    onClick={() => {
                      onClose();
                      if (onNavigate) onNavigate('configure');
                    }}
                    className="w-full bg-[#0066FF] text-white hover:bg-[#0055DD] py-3.5 px-6 font-semibold text-sm rounded-full inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Sliders className="w-4 h-4" />
                    <span>Try configuring a new pod</span>
                  </button>

                  <button
                    onClick={onClose}
                    className="w-full border border-zinc-200 text-zinc-600 hover:bg-zinc-50 py-3 px-6 text-sm rounded-full transition-colors cursor-pointer font-medium"
                  >
                    Return to Dashboard
                  </button>
                </div>

                {/* Developer testing bypass trigger */}
                <div className="pt-6 border-t border-zinc-100 flex items-center justify-center">
                  <button 
                    onClick={handleResetForTesting}
                    className="text-[9px] font-mono text-zinc-400 hover:text-[#0066FF] transition-colors uppercase tracking-wider"
                  >
                    [ Bypass Limit for Review / Testing ]
                  </button>
                </div>
              </div>
            ) : step === 'idle' ? (
              <form onSubmit={handleManualSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <h3 className="text-xl font-display font-medium text-[#0A0A0A] tracking-tight">
                    Reserve Your Free Trial Pod
                  </h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Instantly deploy an isolated sandbox cluster calibrated to your custom vertical. Zero commitments, active for 30 days.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono tracking-wider text-zinc-500 font-bold uppercase block">
                      Your Full Name
                    </label>
                    <input 
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full border border-zinc-200 focus:border-[#0066FF] bg-zinc-50/50 hover:bg-white focus:bg-white text-sm px-4 py-3 rounded-xl outline-none transition-all"
                    />
                  </div>

                  {/* Business Email field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono tracking-wider text-zinc-500 font-bold uppercase block">
                      Business Email Address
                    </label>
                    <input 
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@company.com"
                      className="w-full border border-zinc-200 focus:border-[#0066FF] bg-zinc-50/50 hover:bg-white focus:bg-white text-sm px-4 py-3 rounded-xl outline-none transition-all"
                    />
                  </div>

                  {/* Pod selection Dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono tracking-wider text-zinc-500 font-bold uppercase block">
                      Select Target Pod Template
                    </label>
                    <select 
                      value={selectedPodId}
                      onChange={(e) => setSelectedPodId(e.target.value)}
                      className="w-full border border-zinc-200 focus:border-[#0066FF] bg-zinc-50/50 hover:bg-white focus:bg-white text-sm px-4 py-3 rounded-xl outline-none cursor-pointer transition-all appearance-none"
                      style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23666666'><path d='M2 4l4 4 4-4z'/></svg>")`, backgroundPosition: 'calc(100% - 16px) center', backgroundRepeat: 'no-repeat' }}
                    >
                      {POD_DETAILS.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.weeks} setup timescale)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Vertical focus bubbles */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono tracking-wider text-zinc-500 font-bold uppercase block mb-1">
                      Target Core Industry
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['Technology', 'Financials', 'Healthcare', 'E-commerce', 'Media'].map((ind) => (
                        <button
                          key={ind}
                          type="button"
                          onClick={() => setVertical(ind)}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                            vertical === ind 
                              ? 'border-[#0066FF] bg-[#0066FF]/5 text-[#0066FF] font-semibold' 
                              : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
                          }`}
                        >
                          {ind}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-[#0066FF] text-white hover:bg-[#0055DD] py-3.5 px-6 font-semibold text-sm rounded-full inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>Instant Reserve Trial Pod</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* TODO(copy): security badge removed. It asserted GDPR and SOC2
                    encrypted sandbox channels, which nothing in the repo backs. */}
              </form>
            ) : (
              // Active loading simulation / success state
              <div className="space-y-6 py-6 min-h-[300px] flex flex-col justify-between">
                {step !== 'success' ? (
                  <div className="space-y-6 text-center my-auto">
                    <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                      <div className="absolute inset-0 border-4 border-zinc-100 rounded-full" />
                      <div className="absolute inset-0 border-4 border-[#0066FF] border-t-transparent rounded-full animate-spin" />
                      <Activity className="w-6 h-6 text-[#0066FF]" />
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-base font-semibold tracking-tight uppercase font-mono animate-pulse text-[#0066FF]">
                        {step === 'provisioning' && 'PROVISIONING CONTAINER SANDBOX'}
                        {step === 'securing' && 'HARDENING DATA VECTORS & IAM'}
                        {step === 'routing' && 'CONFIGURING WEBHOOK INGEST_PORT:3000'}
                      </h4>
                      <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                        {step === 'provisioning' && 'Pre-warming custom isolated cloud clusters and allocating compute kernels.'}
                        {step === 'securing' && 'Injecting fine-grained security policies, credentials encryption, and tracer nodes.'}
                        {step === 'routing' && 'Configuring network ingress bridges, logging monitors, and live telemetry webhooks.'}
                      </p>
                    </div>

                    {/* Progress details */}
                    <div className="space-y-1 max-w-xs mx-auto">
                      <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                        <span>STAGE PROGRESS</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-zinc-100 h-1 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#0066FF] h-full transition-all duration-300 rounded-full" 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  // Success State screen
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="space-y-6 text-center my-auto animate-fadeIn"
                  >
                    <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 flex items-center justify-center rounded-full mx-auto border border-emerald-300">
                      <Check className="w-7 h-7" />
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-lg font-display font-medium text-emerald-600">
                        Trial Pod Provisioned!
                      </h4>
                      <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
                        Hey <span className="font-semibold text-zinc-800">{name}</span>, your isolated sandbox environment for the <span className="font-semibold text-zinc-800">{selectedPodName}</span> has been structured successfully.
                      </p>
                    </div>

                    {/* Simulation Metrics metadata Box */}
                    <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-left space-y-2 max-w-md mx-auto">
                      <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                        <span>CLUSTER_ID</span>
                        <span className="text-[#0066FF] uppercase font-bold">FWDPOD-SBOX-{Math.floor(1000 + Math.random() * 9000)}-Z</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                        <span>PROVISION_TIME</span>
                        <span className="text-zinc-800">3.6 seconds (SLA target met)</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                        <span>ACCESS_URL</span>
                        <span className="text-zinc-800 underline">https://sbox-{selectedPodId}.fwdpod.dev</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                        <span>TELEMETRY_PORT</span>
                        <span className="text-zinc-800">3000 // ACTIVE</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-zinc-400 max-w-xs mx-auto leading-relaxed">
                      We have sent active API keys, initialization scripts, and SSH credentials to <span className="text-zinc-650 font-medium">{email}</span>. Click below to return home.
                    </p>

                    <div className="pt-2">
                      <button
                        onClick={onClose}
                        className="w-full bg-[#0A0A0A] text-white hover:bg-[#222222] py-3 px-6 text-sm rounded-full transition-colors cursor-pointer font-medium"
                      >
                        Return to Home Dashboard
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

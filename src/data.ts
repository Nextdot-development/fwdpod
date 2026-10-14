// Data structures for Fwdpod.com

export interface HeroOption {
  id: string;
  name: string;
  badge: string;
  headline: string;
  subline: string;
  cta: string;
  focusText: string;
}

export interface PodSKU {
  id: string;
  name: string;
  oneLiner: string;
  longDescription: string;
  weeks: string;
  teamSize: number;
  bestFor: string;
  includedRoles: string[];
  scopeIncludes: string[];
  scopeExcludes: string[];
  exampleOutcomes: string[];
  techStack: string[];
}

export interface LivePodItem {
  id: string;
  archetype: string;
  industry: string;
  buildDescription: string;
  weeksLive: number;
  status: 'running' | 'completed';
  teamSize: number;
}

export const COPY_OPTIONS: HeroOption[] = [
  {
    id: 'fwd-1',
    name: 'Option 1: Consolidated execution',
    badge: 'DELIVERY UNIT',
    headline: 'Deploy custom enterprise agent environments with one dedicated team.',
    subline: 'Get engineering, deployment, observability, and DevOps in a single pre-formed pod under one accountable owner.',
    cta: 'Configure your pod',
    focusText: 'Emphasis on delivery velocity and 100% integration ownership.'
  },
  {
    id: 'fwd-2',
    name: 'Option 2: Accountable ownership',
    badge: 'UNIFIED RESPONSIBILITY',
    headline: 'One accountable team ships your complete agentic infrastructure.',
    subline: 'An all-in-one productised pod delivering integrated engineering, deployment, observability, and DevOps under a single simple contract.',
    cta: 'Configure your pod',
    focusText: 'Positions the pod as an integrated, single-point-of-contact deployment engine.'
  },
  {
    id: 'fwd-3',
    name: 'Option 3: Complete productisation',
    badge: 'VELOCITY ARCHETYPE',
    headline: 'Productised engineering pods built to run custom agent environments.',
    subline: 'Avoid fragmented agencies with an integrated team handling all engineering, deployment, observability, and DevOps under one contract.',
    cta: 'Configure your pod',
    focusText: 'Adopts the highly confident SaaS tone of Linear and Vercel.'
  }
];

export const POD_DETAILS: PodSKU[] = [
  {
    id: 'voice-ai',
    name: 'Voice AI Pod',
    oneLiner: 'Low-latency conversational agents with customized streaming pipelines.',
    longDescription: 'Deploys fully optimized automated voice response units integrated with telephone trunks and private customer service APIs. Engineered for highly responsive, human-like contextual conversational systems.',
    weeks: '8-12 weeks',
    teamSize: 5,
    bestFor: 'Healthcare, financial call support, telecommunications providers',
    includedRoles: [
      '1 Pod Lead & Vocals Architect',
      '2 Applied AI Engineers (Audio streaming & LLMs)',
      '1 Forward Deployed Engineer (CRM & Core API)',
      '1 DevOps / Observability Specialist'
    ],
    scopeIncludes: [
      'Sub-150ms voice latency routing pipelines',
      'Whisper core model optimization & speech-to-text fine-tuning API',
      'Telephony trunking integration (Twilio / Vapi)',
      'Acoustic guardrails for hallucination prevention',
      'Custom real-time latency dashboard'
    ],
    scopeExcludes: [
      'Customer database migration or standard front-end web apps UI construction',
      'Proprietary on-premise hardware audio card configurations',
      'Non-voice standard text chat automation workflows'
    ],
    exampleOutcomes: [
      'Deployed voice triage for major private hospital network, reducing phone routing delay by 40%.',
      'Built multi-lingual bank triage voice agent executing automated debit card replacement in under 2 minutes.'
    ],
    techStack: ['LiveKit', 'FastAPI', 'Vercel', 'Langfuse', 'Docker']
  },
  {
    id: 'agentic-ops',
    name: 'Agentic Operations Pod',
    oneLiner: 'Self-repairing automation systems and workflow orchestration controllers.',
    longDescription: 'Constructs event-driven multi-agent execution loops capable of managing complex enterprise business procedures (reconciliations, compliance screening, back-office paperwork processing) with integrated monitoring checks.',
    weeks: '10-14 weeks',
    teamSize: 5,
    bestFor: 'Back-office workflow pipelines, complex systems billing, operations scale',
    includedRoles: [
      '1 Pod Lead & Multi-Agent Architect',
      '2 Applied AI Engineers (State machines & tooling)',
      '1 Forward Deployed Engineer (ERP & database adapters)',
      '1 DevOps / Observability Specialist'
    ],
    scopeIncludes: [
      'Refined multi-step looping action-validation patterns and guardrails',
      'Custom secure human-in-the-loop authorization portals',
      'Sandbox execution runtimes for safe untrusted LLM code interpretation',
      'Comprehensive error-trace diagnostic charts'
    ],
    scopeExcludes: [
      'Core ERP code rewrite or standard cloud data migration tasks',
      'Direct human payroll decision-making liability structures',
      'Ad-hoc visual reporting metrics tool integrations'
    ],
    exampleOutcomes: [
      'Constructed autonomous invoice reconciliation agent resolving 82% of mismatch flags containing unformatted OCR logs.',
      'Designed self-correcting logistics routing controller coordinating 12 external cargo carriers.'
    ],
    techStack: ['LangGraph', 'Python', 'Pulumi', 'Datadog', 'Kubernetes']
  },
  {
    id: 'rag-knowledge',
    name: 'RAG and Knowledge Pod',
    oneLiner: 'High-throughput semantic indices with automated validation harnesses.',
    longDescription: 'Establishes verified semantic extraction indices and knowledge sync adapters across massive, fragmented enterprise documents. Guarantees fresh real-time retrieval metrics and rigorous output evaluations.',
    weeks: '8-12 weeks',
    teamSize: 4,
    bestFor: 'Legal query assistance, internal policy retrieval, product documentation search',
    includedRoles: [
      '1 Pod Lead & Vector Architect',
      '1 Applied AI Engineer (Embeddings & indexing)',
      '1 Forward Deployed Engineer (Doc ingestion connectors)',
      '1 DevOps / Observability Specialist'
    ],
    scopeIncludes: [
      'Multi-source document chunking and metadata enrichment handlers',
      'Hybrid semantic dense-sparse search index pairing (retrieval-rerank)',
      'Daily indexing automated update cron triggers',
      'Evaluations suite comparing hallucination indices'
    ],
    scopeExcludes: [
      'Manual scanning or physical optical character recognition files cleanup',
      'Non-document transactional accounting records management',
      'Complete replacement of native internal KMS wiki tools'
    ],
    exampleOutcomes: [
      'Designed legal synthesis engine indexing 40,000 regulatory pages with 99.2% citation accuracy.',
      'Created engineering query assistant resolving internal system maintenance specifications for field agents.'
    ],
    techStack: ['Pinecone', 'Qdrant', 'LlamaIndex', 'gcp Cloud Run', 'Langfuse']
  },
  {
    id: 'compliance-ai',
    name: 'Compliance AI Pod',
    oneLiner: 'Rigorous validation logs, privacy filters, and model safety harnesses.',
    longDescription: 'Deploys air-gapped system isolation layers, real-time safety classification runtimes, and strict access filters to protect confidential enterprise transaction paths from data leaks and prompt exploitation.',
    weeks: '12-16 weeks',
    teamSize: 6,
    bestFor: 'Highly regulated industries, air-gapped infrastructure, high security standards',
    includedRoles: [
      '1 Pod Lead & Governance Principal',
      '2 Applied AI Engineers (Red-teaming & evaluation specs)',
      '1 Security Specialist (Airgap & hardware key management)',
      '1 Forward Deployed Engineer (Internal systems connection)',
      '1 DevOps / Observability Specialist'
    ],
    scopeIncludes: [
      'Local context-aware PII scrubbing and isolation filters',
      'Rigorous prompt execution vulnerability scan tests',
      'Local offline operational analytics audit data pipelines',
      'Custom model weights fine-tuning wrapper validation schemas'
    ],
    scopeExcludes: [
      'Legal corporate compliance compliance representation or ISO drafting',
      'Underlying hardware or metal server physical rack installation',
      'Global public internet proxy configurations'
    ],
    exampleOutcomes: [
      'Delivered fully isolated model guardrail proxy for Fortune 100 brokerage, fully anonymizing data paths.',
      'Built compliance checker continuously detecting 98% of potential security leak attempts.'
    ],
    techStack: ['Kubernetes air-gapped', 'Langfuse-local', 'Python', 'Nginx', 'Docker']
  },
  {
    id: 'custom-pod',
    name: 'Custom Pod',
    oneLiner: 'Tailor-made autonomous units addressing unique legacy system shapes.',
    longDescription: 'A fully custom-aligned 4-6 person elite team designed to solve complex system problems. Integrates directly with old core databases and custom AI models to deliver structured results.',
    weeks: '8-16 weeks',
    teamSize: 6,
    bestFor: 'Complex on-premise integrations, custom AI architectures, specialized enterprise scopes',
    includedRoles: [
      '1 Pod Lead & Principal Architect',
      '2-3 Applied AI Engineers (Specialized tasks)',
      '1 Forward Deployed Engineer (Legacy integrations)',
      '1 DevOps / Observability Specialist'
    ],
    scopeIncludes: [
      'Unique operational scoping tailored on intake',
      'Direct legacy mainframe API adapters and bridges',
      'Dynamic telemetry metrics tracking dashboards',
      'Rigorous transition support for in-house operators'
    ],
    scopeExcludes: [
      'Generic generic software maintenance or legacy tech debt support',
      'Direct administrative operations staff fill-ins',
      'Unbounded scope changes after weekly sprint checkpoints'
    ],
    exampleOutcomes: [
      'Deployed proprietary model pipeline running complex prediction matrices inside custom client edge nodes.',
      'Integrated legacy SCADA control outputs with semantic planning nodes for physical factory operations.'
    ],
    techStack: ['Custom frameworks defined on intake', 'Custom environments']
  }
];

export const LIVE_PODS: LivePodItem[] = [
  {
    id: 'pod-lp1',
    archetype: 'Compliance AI Pod',
    industry: 'Financial Brokerage',
    buildDescription: 'Air-gapped PII scrubbing proxies and automated trading data-leak verification layers.',
    weeksLive: 6,
    status: 'running',
    teamSize: 6
  },
  {
    id: 'pod-lp2',
    archetype: 'Agentic Operations Pod',
    industry: 'Logistics Network',
    buildDescription: 'Autonomous invoice OCR validation loops and self-repairing delivery dispatch controllers.',
    weeksLive: 11,
    status: 'running',
    teamSize: 5
  },
  {
    id: 'pod-lp3',
    archetype: 'Voice AI Pod',
    industry: 'Healthcare Services',
    buildDescription: 'Sub-150ms real-time intake routing agents managing concurrent patient scheduling trunks.',
    weeksLive: 3,
    status: 'running',
    teamSize: 5
  },
  {
    id: 'pod-lp4',
    archetype: 'RAG and Knowledge Pod',
    industry: 'Banking',
    buildDescription: 'Daily knowledge vector index integration for loan assessment regulations.',
    weeksLive: 9,
    status: 'running',
    teamSize: 4
  },
  {
    id: 'pod-lp5',
    archetype: 'Compliance AI Pod',
    industry: 'Telecommunications',
    buildDescription: 'Prompt exploitation testing and filter sandboxes for customer interaction terminals.',
    weeksLive: 14,
    status: 'completed',
    teamSize: 6
  },
  {
    id: 'pod-lp6',
    archetype: 'Voice AI Pod',
    industry: 'Public Utilities',
    buildDescription: 'Automated municipal water billing query triage systems operating via Vapi integrations.',
    weeksLive: 8,
    status: 'completed',
    teamSize: 5
  },
  {
    id: 'pod-lp7',
    archetype: 'RAG and Knowledge Pod',
    industry: 'Legal Tech',
    buildDescription: 'Automated retrieval-rerank knowledge parsing across regional arbitration case papers.',
    weeksLive: 5,
    status: 'running',
    teamSize: 4
  },
  {
    id: 'pod-lp8',
    archetype: 'Agentic Operations Pod',
    industry: 'E-commerce platform',
    buildDescription: 'Autonomous supplier inventory reconciliation engines reporting anomalies directly to Slack.',
    weeksLive: 12,
    status: 'completed',
    teamSize: 5
  },
  {
    id: 'pod-lp9',
    archetype: 'Custom Pod',
    industry: 'Automotive Factory',
    buildDescription: 'Core SCADA telemetry translation models bridging assembly planning loops.',
    weeksLive: 16,
    status: 'completed',
    teamSize: 6
  },
  {
    id: 'pod-lp10',
    archetype: 'Voice AI Pod',
    industry: 'Aviation services',
    buildDescription: 'Voice dispatch query systems running across localized crew radio relays.',
    weeksLive: 4,
    status: 'running',
    teamSize: 5
  },
  {
    id: 'pod-lp11',
    archetype: 'RAG and Knowledge Pod',
    industry: 'Insurance',
    buildDescription: 'Ingestion of medical insurance code updates with automatic parsing and claim assessment validation.',
    weeksLive: 7,
    status: 'running',
    teamSize: 4
  },
  {
    id: 'pod-lp12',
    archetype: 'Agentic Operations Pod',
    industry: 'Media distribution',
    buildDescription: 'Automated video transcript content tagging and vector descriptor publishing queues.',
    weeksLive: 10,
    status: 'running',
    teamSize: 5
  }
];

export const TRUST_WORDS = [
  'Linear.app', 'Vercel.com', 'Modal.com', 'Replicate.com', 'Stripe.com', 'Supabase.io'
];

export const FLOW_STEPS = [
  { id: '01', title: 'Intake (48h)', desc: 'Answer core timeline, compliance, and delivery questions. Receive a custom spec specification draft.' },
  { id: '02', title: 'Pod assembled (1 week)', desc: 'Assign 4-6 senior engineers who have deployed live systems together. 1 clear Project Principal.' },
  { id: '03', title: 'Deployment (8-16 weeks)', desc: 'Write code, configure telemetry logs, establish dockerised pipelines, and verify outputs weekly.' },
  { id: '04', title: 'Handover and support', desc: 'Transfer complete code assets, evaluation benchmarks, and active tracing metric channels to your team.' }
];

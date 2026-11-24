/**
 * The engineering stack infographic on the homepage: 4 layers to build and
 * 2 cross-cutting bands. Names, links and copy follow the approved structure
 * doc (Nov 11, 2026). URLs match SOLUTION_PAGES in src/data/navigation.ts.
 */
import { LLMOPS_POD_SIZE } from './business-facts';

export interface StackTeam {
  label: string;
  /** Teams with their own solution page link to it (Voice AI). */
  href?: string;
}

export interface StackLayer {
  number: number;
  name: string;
  href: string;
  lines: string[];
  teams: StackTeam[];
}

export interface StackBand {
  name: string;
  href: string;
  items: string[];
  team: string;
}

export const STACK_TOP = 'Your business: customers, employees, ERP, CRM, service desk';

export const STACK_LAYERS: StackLayer[] = [
  {
    number: 1,
    name: 'Agents and applications',
    href: '/solutions/ai-agents',
    lines: [
      'Agents and workflow automation across ERP, CRM and service desk',
      'Real-time voice agents for support, scheduling and intake',
    ],
    teams: [{ label: 'Agent Development Pod' }, { label: 'Voice AI Pod', href: '/solutions/voice-ai' }],
  },
  {
    number: 2,
    name: 'Context and knowledge',
    href: '/solutions/rag',
    lines: [
      'RAG and enterprise search over your documents and data',
      'MCP connectors and permission-aware answers',
    ],
    teams: [{ label: 'RAG and Knowledge Pod' }],
  },
  {
    number: 3,
    name: 'Models',
    href: '/solutions/models',
    lines: [
      'Model selection across frontier APIs, open and smaller models',
      'Fine-tuning, private deployment, speed and cost tuning',
    ],
    teams: [{ label: 'ML engineers' }, { label: 'Custom Pod' }],
  },
  {
    number: 4,
    name: 'Data and annotation',
    href: '/solutions/data-annotation',
    lines: [
      'Pipelines from source systems, annotation and labelling at scale',
      'Evaluation datasets and human feedback (RLHF)',
    ],
    teams: [{ label: 'data engineers' }, { label: 'annotation team' }],
  },
];

export const STACK_BANDS: StackBand[] = [
  {
    name: 'Trust and compliance',
    href: '/solutions/ai-compliance',
    items: ['Guardrails', 'Privacy filters', 'Audit logs', 'Red-team tests'],
    team: 'Compliance AI Pod',
  },
  {
    name: 'Operations (LLMOps)',
    href: '/solutions/llmops',
    items: ['Deployment', 'Monitoring', 'Cost control', 'On-call support'],
    team: 'LLMOps Pod',
  },
];

export const STACK_FOOTER =
  'Delivered by individual specialists or pods. Each pod has one accountable lead, a forward deployed engineer.';

// ── Our Solutions page: the full copy for each layer and band ────────────────
// Copy is from the structure doc (Nov 11, 2026). Do not add bullets here.

export interface SolutionSection {
  /** Anchor on /our-solutions. */
  id: string;
  /** "Layer 1" or "Across every layer". */
  kicker: string;
  name: string;
  href: string;
  /** Pages nested under this one (Voice AI under Agents and applications). */
  subPages?: StackTeam[];
  promise: string;
  bullets: string[];
  needThisIf?: string;
  measuredBy: string;
  whoDoesIt: string;
}

export const SOLUTION_LAYERS: SolutionSection[] = [
  {
    id: 'agents-and-applications',
    kicker: 'Layer 1',
    name: 'Agents and applications',
    href: '/solutions/ai-agents',
    subPages: [{ label: 'Voice AI', href: '/solutions/voice-ai' }],
    promise: 'AI that does the work inside your business systems.',
    bullets: [
      'AI agents that complete multi-step tasks across ERP, CRM and service desk',
      'Workflow automation with human approval where it matters',
      'Real-time voice agents for support, scheduling and intake',
      'Integration with your existing apps, APIs and identity',
    ],
    needThisIf: 'you have approved use cases and copilot pilots, but nothing durable in production.',
    measuredBy: 'tasks completed without hand-off · cycle time · calls resolved end to end',
    // [CONFIRM: lead counted in pod headcount?] for both pod sizes
    whoDoesIt: 'Agent Development Pod (5) · Voice AI Pod (5) · agent developers, voice AI engineers, forward deployed engineers',
  },
  {
    id: 'context-and-knowledge',
    kicker: 'Layer 2',
    name: 'Context and knowledge',
    href: '/solutions/rag',
    promise: 'AI that knows your business and respects who can see what.',
    bullets: [
      'RAG systems and enterprise search over your documents and data',
      'Vector databases, knowledge graphs and long-term memory',
      'MCP servers that connect AI safely to your internal systems',
      'Permission-aware answers: each user sees only what they are allowed to',
    ],
    needThisIf: 'your AI gives generic or wrong answers about your own business.',
    measuredBy: 'answer accuracy on your test questions · cost per query',
    // [CONFIRM: lead counted in pod headcount?]
    whoDoesIt: 'RAG and Knowledge Pod (4) · RAG engineers, data engineers',
  },
  {
    id: 'models',
    kicker: 'Layer 3',
    name: 'Models',
    href: '/solutions/models',
    promise: 'The right model for each job, at the right cost.',
    bullets: [
      'Model selection across frontier APIs, open models and smaller specialist models',
      'Fine-tuning on your data',
      'Private deployment inside your cloud or data center',
      'Inference tuning for speed and cost',
    ],
    needThisIf: "API bills are growing faster than value, or data can't leave your boundary.",
    measuredBy: 'cost per task · response time · accuracy against your current model',
    // [CONFIRM: headcount] for the Custom Pod on this layer; no number shown
    whoDoesIt: 'ML and fine-tuning engineers, inside a Custom Pod or as specialists',
  },
  {
    id: 'data',
    kicker: 'Layer 4',
    name: 'Data and annotation',
    href: '/solutions/data-annotation',
    promise: 'Clean, labelled data your AI can learn from and be tested against.',
    bullets: [
      'Data pipelines from source systems',
      'Annotation and labelling at scale, with quality checks',
      'Evaluation datasets and human feedback (RLHF)',
      'Data quality and preparation for RAG and fine-tuning',
    ],
    needThisIf: 'models underperform because training or test data is missing or messy.',
    measuredBy: 'label accuracy · throughput · coverage of your test set',
    // [CONFIRM: pod name and headcount] no Data pod is named yet
    whoDoesIt: 'data engineers, annotators, RLHF and evaluation specialists',
  },
];

export const SOLUTION_BANDS: SolutionSection[] = [
  {
    id: 'trust-and-compliance',
    kicker: 'Across every layer',
    name: 'Trust and compliance',
    href: '/solutions/ai-compliance',
    promise: 'AI your risk, legal and audit teams can sign off.',
    bullets: [
      'Guardrails and privacy filters for sensitive data',
      'Audit logs for every consequential AI action',
      'Evaluation, red-team and regression testing before each release',
      'Controls mapped to your regulators and policies',
    ],
    measuredBy: 'audit findings closed · data-leak tests passed',
    // [CONFIRM: lead counted in pod headcount?]
    whoDoesIt: 'Compliance AI Pod (6)',
  },
  {
    id: 'operations-llmops',
    kicker: 'Across every layer',
    name: 'Operations (LLMOps)',
    href: '/solutions/llmops',
    promise: 'AI that stays up, stays accurate and stays on budget.',
    bullets: [
      'Deployment pipelines and release management',
      'Monitoring for quality, drift, latency and cost',
      'Incident response and on-call support',
      'Ongoing cost and model updates',
    ],
    measuredBy: 'uptime · cost per request',
    // [CONFIRM: lead counted in pod headcount?]
    whoDoesIt: `LLMOps Pod (${LLMOPS_POD_SIZE})`,
  },
];

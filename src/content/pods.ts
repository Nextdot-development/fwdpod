/**
 * The six pods shown on the homepage and the Solutions page (/solutions).
 *
 * `id` matches the ids in src/data.ts where a pod already had one, so the
 * footer's links still open the right block on /solutions.
 */
import { LLMOPS_POD_SIZE } from './business-facts';

export interface Pod {
  id: string;
  name: string;
  /** What the pod builds, in one line (homepage cards). */
  builds: string;
  size: string;
  timeline: string;
  bestFor: string;
  /** What's included, in plain words (Solutions page). */
  typicalWork: string[];
  highlighted?: boolean;
  // ── Solutions page: the same offering, described for business readers ──
  /** Business-facing name of what the pod delivers. */
  solution: string;
  /** What it is, in one sentence. */
  summary: string;
  /** The business problem it addresses. */
  challenge: string;
  /** The practical result it is designed to support. */
  value: string;
  /** Matching case study on /case-studies, when there is one. */
  caseStudyId?: string;
}

export const PODS: Pod[] = [
  {
    id: 'agentic-ops',
    name: 'Agent Development Pod',
    builds: 'Builds AI agents that automate workflows across your systems.',
    size: '5 people',
    timeline: '10–14 weeks to production',
    bestFor: 'Back-office workflows such as reconciliation, billing and document processing',
    typicalWork: [
      'Agents that complete multi-step tasks and check each step before acting',
      'Approval screens so a person signs off on key steps',
      'A safe, separate space for any code the AI writes',
      'Clear error tracking, so problems are easy to find and fix',
    ],
    solution: 'Workflow Automation with AI Agents',
    summary: 'AI agents that carry out routine, multi-step tasks across the systems you already use.',
    challenge: 'Teams spend hours on repetitive back-office work such as reconciliation, billing and document processing.',
    value: 'Less manual effort on routine work, with people still approving the steps that matter.',
    caseStudyId: 'logistics-network',
  },
  {
    id: 'rag-knowledge',
    name: 'RAG and Knowledge Pod',
    builds: 'Connects LLMs to your documents and data, with accuracy testing.',
    size: '4 people',
    timeline: '8–12 weeks',
    bestFor: 'Policy lookup, legal research and product documentation search',
    typicalWork: [
      'Preparing and organising documents from many sources',
      'Search that understands what people mean, not just exact words',
      'Automatic updates as your documents change',
      'Tests that catch wrong or made-up answers',
    ],
    solution: 'AI Search Across Your Documents',
    summary: 'An AI assistant that answers questions using your own documents and data.',
    challenge: 'Important information is spread across policies, contracts and documentation, and takes too long to find.',
    value: 'Quicker answers from your own content, tested to catch wrong or made-up responses.',
  },
  {
    id: 'voice-ai',
    name: 'Voice AI Pod',
    builds: 'Builds real-time voice agents for support, scheduling and intake.',
    size: '5 people',
    timeline: '8–12 weeks',
    bestFor: 'Call handling in healthcare, financial services and telecoms',
    typicalWork: [
      'Voice agents that reply without awkward pauses',
      'Speech recognition tuned to how your callers speak',
      'Connection to your existing phone system',
      'Safeguards against wrong or off-script answers',
    ],
    solution: 'Voice AI for Customer Calls',
    summary: 'Voice agents that answer phone calls for support, scheduling and intake, in real time.',
    challenge: 'High call volumes put pressure on support and front-desk teams.',
    value: 'Routine calls handled consistently, with safeguards that keep answers accurate and on script.',
    caseStudyId: 'healthcare-services',
  },
  {
    id: 'compliance-ai',
    name: 'Compliance AI Pod',
    builds: 'Adds privacy filters, audit logs and safety testing to AI systems.',
    size: '6 people',
    timeline: '12–16 weeks',
    bestFor: 'Regulated industries and teams with strict security standards',
    typicalWork: [
      'Filters that remove personal data before it reaches the AI',
      'Testing for attempts to trick or misuse the AI',
      'Audit logs that stay inside your environment',
      'Checks on how customised AI models behave',
    ],
    solution: 'Secure and Compliant AI',
    summary: 'Privacy protection, audit trails and safety testing for your AI systems.',
    challenge: 'Regulated businesses need AI that meets strict privacy, security and audit requirements.',
    value: 'AI systems that are easier for your security and compliance teams to review and approve.',
    caseStudyId: 'financial-brokerage',
  },
  {
    id: 'llmops',
    name: 'LLMOps Pod',
    builds: 'Deploys, monitors and controls the cost of models in production.',
    size: `${LLMOPS_POD_SIZE} people`,
    timeline: 'ongoing',
    // Written for this page; there was no earlier copy for this pod.
    bestFor: 'Teams with AI already in production that need it reliable and affordable',
    // From the pod's one-line description above
    typicalWork: [
      'Launching AI models into your live systems',
      'Monitoring how they perform over time',
      'Keeping running costs under control',
    ],
    solution: 'AI Operations and Monitoring',
    summary: 'Ongoing support to run, monitor and manage AI systems once they are live.',
    challenge: 'AI that is already in use can become unreliable or expensive without ongoing care.',
    value: 'AI systems that stay reliable, with running costs kept under control.',
  },
  {
    id: 'custom-pod',
    name: 'Custom Pod',
    builds: 'Built around your stack, your data and your goal.',
    size: '4–6 people',
    timeline: 'scoped together',
    bestFor: "Complex integrations with existing systems, or work that doesn't fit a standard pod",
    typicalWork: [
      'Scope agreed with you at the start',
      'Connections to older systems and databases',
      'Handover support for your in-house team',
    ],
    highlighted: true,
    solution: 'Custom AI Solutions',
    summary: 'A team built around your systems, your data and your goal.',
    challenge: "Some projects need complex connections to existing systems, or don't fit a standard solution.",
    value: 'A solution shaped to your needs, with support to hand it over to your in-house team.',
  },
];

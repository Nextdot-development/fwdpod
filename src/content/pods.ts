/**
 * The six pods shown on the homepage and the pod catalogue.
 *
 * `id` matches the ids in src/data.ts where a pod already had one, so the
 * footer's pod links still open the right block on /catalogue.
 */
import { LLMOPS_POD_SIZE } from './business-facts';

export interface Pod {
  id: string;
  name: string;
  /** What the pod builds, in one line. */
  builds: string;
  size: string;
  timeline: string;
  bestFor: string;
  /** Typical work, carried over from the earlier catalogue copy. */
  typicalWork: string[];
  highlighted?: boolean;
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
      'Multi-step agents that check each action before taking it',
      'Approval screens so a person signs off on key steps',
      'Safe sandboxes for running AI-generated code',
      'Error tracing so failures are easy to find and fix',
    ],
  },
  {
    id: 'rag-knowledge',
    name: 'RAG and Knowledge Pod',
    builds: 'Connects LLMs to your documents and data, with accuracy testing.',
    size: '4 people',
    timeline: '8–12 weeks',
    bestFor: 'Policy lookup, legal research and product documentation search',
    typicalWork: [
      'Preparing and tagging documents from many sources',
      'Search that combines keyword and meaning-based results',
      'Automatic updates as your documents change',
      'Tests that catch wrong or made-up answers',
    ],
  },
  {
    id: 'voice-ai',
    name: 'Voice AI Pod',
    builds: 'Builds real-time voice agents for support, scheduling and intake.',
    size: '5 people',
    timeline: '8–12 weeks',
    bestFor: 'Call handling in healthcare, financial services and telecoms',
    typicalWork: [
      'Low-latency voice pipelines that respond in real time',
      'Speech-to-text tuned to your callers',
      'Phone system integration, such as Twilio or Vapi',
      'Safeguards against wrong or off-script answers',
    ],
  },
  {
    id: 'compliance-ai',
    name: 'Compliance AI Pod',
    builds: 'Adds privacy filters, audit logs and safety testing to AI systems.',
    size: '6 people',
    timeline: '12–16 weeks',
    bestFor: 'Regulated industries and teams with strict security standards',
    typicalWork: [
      'Filters that remove personal data before it reaches a model',
      'Testing for prompt attacks and other weaknesses',
      'Audit logs that stay inside your environment',
      'Checks on how fine-tuned models behave',
    ],
  },
  {
    id: 'llmops',
    name: 'LLMOps Pod',
    builds: 'Deploys, monitors and controls the cost of models in production.',
    size: `${LLMOPS_POD_SIZE} people`,
    timeline: 'ongoing',
    // Written for this page; there was no earlier copy for this pod.
    bestFor: 'Teams with AI already in production that need it reliable and affordable',
    typicalWork: [],
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
      'Connectors to older systems and databases',
      'Handover support for your in-house team',
    ],
    highlighted: true,
  },
];

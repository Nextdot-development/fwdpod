/**
 * Solution pages rebuilt from their own page briefs (Nov 2026), rendered by
 * SolutionBriefView in the briefs' 12-section order. Copy is word for word.
 *
 * Do not add prices, SOC 2, ISO or HIPAA, client logos or "24/7" claims.
 * Anything still [CONFIRM] in a brief is either shown as drafted (and marked
 * here) or left out until it is supplied, as noted on each item.
 *
 * The remaining solution pages still use the template in solution-pages.ts.
 */
import { LLMOPS_POD_SIZE, SHORTLIST_TIME, TIME_TO_START } from './business-facts';
import { NAMED_REGULATIONS } from './company';

export interface SolutionBrief {
  path: string;
  /** Display name, used in the breadcrumb, and the H1 unless `h1` is set */
  name: string;
  h1?: string;
  title: string;
  /** Meta description */
  description: string;
  /** Sitemap <lastmod> */
  lastmod: string;
  /** Breadcrumb parent between Solutions and this page */
  parent?: { label: string; href: string };
  // 1. H1 is `name`; subhead under it
  subhead: string;
  // 2. Intro paragraph
  intro: string;
  // 3. What it does, under "Typical examples, not client results"
  examples: string[];
  // 4. The problem
  problem: string;
  // 5. What we engineer: the capability, then a plain explanation
  engineer: { title: string; detail?: string; see?: { label: string; href: string } }[];
  // 6. The team
  // Pod name and size are hidden while unconfirmed.
  team: { name?: string; size?: string; members?: string; note?: string };
  // 7. How it runs. Phases stay hidden until confirmed; the timeline too.
  timeline?: string;
  /** Plain text after the timeline, e.g. "Progress is reported weekly." */
  timelineNote?: string;
  // 8. How we measure it
  measures: { name: string; detail: string }[];
  // 9. A real example, shown with "Self-reported." Without one, the page shows
  // the site's placeholder card until a cleared case study exists.
  example?: { sector: string; pod: string; weeks: string; team: string };
  // 10. FAQs
  faqs: { q: string; a: string }[];
  // 11. Tools. The logo row stays hidden while empty; the whole section is
  // hidden when there are no logos and no line to show.
  logos: { name: string; src: string }[];
  toolsNote?: string;
  // 12. CTA: role pages (hidden while empty) and the related solution
  rolePages: { label: string; href: string }[];
  /** Other links in the CTA box, e.g. the Security page */
  ctaLinks?: { label: string; href: string }[];
  related: { label: string; href: string };
}

const AGENTS = { label: 'Agents and applications', href: '/solutions/ai-agents' };
const VOICE_AI = { label: 'Voice AI', href: '/solutions/voice-ai' };
const DATA = { label: 'Data and annotation', href: '/solutions/data-annotation' };
const CONTEXT = { label: 'Context and knowledge', href: '/solutions/rag' };
const LLMOPS = { label: 'Operations (LLMOps)', href: '/solutions/llmops' };

export const SOLUTION_BRIEFS: SolutionBrief[] = [
  {
    path: AGENTS.href,
    name: 'Agents and applications',
    title: 'Agents and applications | Fwdpod',
    // Kept from the previous version of this page; the brief gives none.
    description:
      'AI agents and workflow automation across ERP, CRM and service desk, built by senior AI engineers from India. One specialist or an Agent Development Pod.',
    lastmod: '2026-11-21',
    subhead: 'AI that does the work inside your business systems.',
    intro:
      'An AI agent is software that takes a goal, breaks it into steps and uses your business systems to finish them. Our engineers build agents that work inside your ERP, CRM and service desk, and keep a person in the loop where a mistake would matter.',
    examples: [
      "Turns an email into a service ticket, checks the customer's account and drafts a reply for approval.",
      'Updates CRM records after a sales call.',
      'Routes invoices to the right approver and flags mismatches.',
      'Pulls data from several systems into one step, so staff stop copying between tabs.',
    ],
    problem: 'You have approved use cases and copilot pilots, but nothing durable in production.',
    engineer: [
      {
        title: 'AI agents that complete multi-step tasks across ERP, CRM and service desk.',
        detail: 'Multi-step means the agent finishes a sequence of actions, not one answer.',
      },
      {
        title: 'Workflow automation with human approval where it matters.',
        detail: 'A person signs off on the steps that carry risk.',
      },
      { title: 'Real-time voice agents for support, scheduling and intake.', see: VOICE_AI },
      {
        title: 'Integration with your existing apps, APIs and identity.',
        detail: 'It connects to the tools you already use and follows your login rules.',
      },
    ],
    team: {
      name: 'Agent Development Pod',
      size: '5 people',
      members: 'Agent developers and forward deployed engineers.',
      note: 'A forward deployed engineer works inside your team and systems. The pod has one accountable lead, a forward deployed engineer.',
    },
    // [CONFIRM phase names and weeks]
    timeline: '10–14 weeks to production.',
    timelineNote: 'Progress is reported weekly.',
    measures: [
      { name: 'Tasks completed without hand-off', detail: 'the share of tasks finished with no person stepping in.' },
      { name: 'Cycle time', detail: 'how long a task takes from start to finish.' },
      { name: 'Calls resolved end to end', detail: 'calls finished without a transfer, where calls are part of the flow.' },
    ],
    // [CLIENT PERMISSION NEEDED] Same project as 'logistics-network' in case-studies.ts
    example: { sector: 'Logistics network', pod: 'Agent Development Pod', weeks: '11 weeks', team: '5 engineers' },
    faqs: [
      { q: 'Do we have to change our systems?', a: 'No. The team works through your existing apps, APIs and identity.' },
      // [CONFIRM]
      {
        q: 'Who decides what the agent is allowed to do?',
        a: 'You set the approval points, and the agent waits for a person at those steps.',
      },
      // [CONFIRM the pod lead is named on the page.] Not named until confirmed.
      { q: 'Who works on it?', a: 'A pod with one accountable lead.' },
    ],
    // [CONFIRM logos]
    logos: [],
    toolsNote: 'We work in your stack.',
    // [CONFIRM URLs] for the matching role pages
    rolePages: [],
    related: VOICE_AI,
  },
  {
    path: VOICE_AI.href,
    name: 'Voice AI',
    title: 'Voice AI | Fwdpod',
    // Kept from the previous version of this page; the brief gives none.
    description:
      'Real-time voice agents for support, scheduling and intake, connected to your phone system. Built by a Voice AI Pod of senior AI engineers from India.',
    lastmod: '2026-11-21',
    parent: AGENTS,
    subhead: 'Real-time voice agents for support, scheduling and intake.',
    intro:
      'A voice agent answers or makes phone calls, understands speech as it happens, and completes a task such as booking an appointment or answering a support question. It is built to respond during the call, not after it.',
    examples: [
      'Books, moves or cancels appointments.',
      'Collects intake details before a visit or a call.',
      // [CONFIRM handover is supported]
      'Answers common support questions, and passes the call to a person when needed.',
      'Sends confirmations and reminders for schedules.',
    ],
    // [CONFIRM: draft for approval]
    problem: 'Phone and voice queues fill up with routine requests that could be handled without a person.',
    engineer: [
      {
        title: 'Real-time voice agents for support, scheduling and intake.',
        detail: 'Built to answer while the caller is still talking.',
      },
      {
        title: 'Integration with your existing apps, APIs and identity.',
        detail: 'The voice agent reads and writes to your scheduling or support tools.',
      },
      // [CONFIRM: add two voice-specific bullets from the Voice AI Pod scope,
      // each with a one-line plain explanation] Left out until supplied.
    ],
    team: {
      name: 'Voice AI Pod',
      size: '5 people',
      members: 'Voice AI engineers and forward deployed engineers.',
    },
    // [CONFIRM] phase names and weeks
    timeline: '8–12 weeks to production.',
    timelineNote: 'Progress is reported weekly.',
    measures: [
      { name: 'Calls resolved end to end', detail: 'calls finished without a transfer.' },
      { name: 'Cycle time', detail: 'how long a call or task takes from start to finish.' },
      // [CONFIRM: third measure] Left out until supplied.
    ],
    // [CLIENT PERMISSION NEEDED] Same project as 'healthcare-services' in case-studies.ts
    // [CONFIRM: 3 weeks is outside the listed 8–12 week range]
    example: { sector: 'Healthcare services', pod: 'Voice AI Pod', weeks: '3 weeks', team: '5 engineers' },
    faqs: [
      {
        q: 'How fast can we start?',
        a: `Profiles within ${SHORTLIST_TIME} of a scoping call. Engineers usually start within ${TIME_TO_START}.`,
      },
      // [CONFIRM the list of supported systems]
      {
        q: 'Does it work with our scheduling or support tools?',
        a: 'It connects through your existing apps and APIs.',
      },
      { q: 'Who owns the code?', a: 'You do. Every engineer signs an NDA and a full IP assignment.' },
    ],
    // [CONFIRM logos] The brief gives no line for this section, so it stays
    // hidden until logos are confirmed.
    logos: [],
    rolePages: [],
    related: AGENTS,
  },
  {
    path: '/solutions/rag',
    name: 'Context and knowledge',
    title: 'Context and knowledge | Fwdpod',
    h1: 'RAG systems that answer correctly about your business.',
    // Kept from the previous version of this page; the brief gives none.
    description:
      'RAG systems and enterprise search that answer correctly about your business, with permission-aware answers. Built by senior AI engineers from India.',
    lastmod: '2026-11-21',
    subhead: 'AI that knows your business and respects who can see what.',
    intro:
      'RAG stands for retrieval-augmented generation. In plain words, the AI looks up the right documents from your own data before it answers, instead of relying on what it remembers. Answers come from your sources, and each person only sees what they are allowed to see.',
    examples: [
      'A staff member asks an HR or policy question and gets the answer with a link to the policy.',
      'A support agent finds the right troubleshooting steps for a product.',
      'A sales team finds approved product wording.',
      'A manager asks across contracts and receives only the contracts they are allowed to open.',
    ],
    problem: 'Your AI gives generic or wrong answers about your own business.',
    engineer: [
      {
        title: 'RAG systems and enterprise search over your documents and data.',
        detail: 'The search that finds the right document before the AI answers.',
      },
      {
        title: 'Vector databases, knowledge graphs and long-term memory.',
        detail: 'Ways to store your information so the AI can find related facts, not just exact words.',
      },
      {
        title: 'MCP servers that connect AI safely to your internal systems.',
        detail: 'MCP is a standard way to give AI tools controlled access to your systems.',
      },
      {
        title: 'Permission-aware answers.',
        detail: 'Each user sees only what they are allowed to see.',
      },
    ],
    team: {
      name: 'RAG and Knowledge Pod',
      size: '4 people',
      members: 'RAG engineers and data engineers.',
    },
    // [CONFIRM] phase names and weeks
    timeline: '8–12 weeks to production.',
    timelineNote: 'Progress is reported weekly.',
    measures: [
      {
        name: 'Answer accuracy on your test questions',
        detail: 'you provide questions with known right answers, and each answer is scored.',
      },
      { name: 'Cost per query', detail: 'what each answer costs to produce.' },
    ],
    // [CLIENT PERMISSION NEEDED: no cleared case study] No `example`, so the
    // placeholder card shows.
    faqs: [
      // [CONFIRM the wording for questions with no source]
      { q: 'Will the AI make things up?', a: 'Answers are tied to your documents and show their source.' },
      { q: 'Does it respect our access rules?', a: 'Yes. Answers are permission-aware.' },
      // [CONFIRM the list of documents and systems to connect] Left out until
      // the answer is supplied: "What do you need from us to start?"
    ],
    // [CONFIRM logos] No line given for this section, so it stays hidden.
    logos: [],
    rolePages: [],
    related: DATA,
  },
  {
    path: '/solutions/models',
    name: 'Models',
    title: 'Models | Fwdpod',
    // Kept from the previous version of this page; the brief gives none.
    description:
      'Model selection, fine-tuning, private deployment and inference tuning for speed and cost. Senior ML engineers from India, as specialists or a Custom Pod.',
    lastmod: '2026-11-21',
    subhead: 'The right model for each job, at the right cost.',
    intro:
      'A model is the engine that does the thinking in an AI system. Models differ in power and cost, and a model that suits one task can be too expensive or too slow for another. We pick the right model for each job, and where needed train or host it, so cost and data stay under your control.',
    examples: [
      'Sends hard reasoning to a top model and simple sorting to a smaller, cheaper one.',
      'Fine-tunes a model on your past cases, so its answers match your house style.',
      'Runs a model inside your own cloud, so sensitive data never leaves your boundary.',
      'Tunes how a model runs, so answers arrive faster and cost less.',
    ],
    problem: "API bills are growing faster than value, or data can't leave your boundary.",
    engineer: [
      {
        title: 'Model selection across frontier APIs, open models and smaller specialist models.',
        detail: 'Frontier APIs are the largest hosted models. Open models can be run in your environment.',
      },
      { title: 'Fine-tuning on your data.', detail: 'Training a model further on your own examples.' },
      {
        title: 'Private deployment inside your cloud or data center.',
        detail: 'The model runs in your environment.',
      },
      {
        title: 'Inference tuning for speed and cost.',
        detail: 'Inference is running the model to get an answer. Tuning makes that faster and cheaper.',
      },
    ],
    // [CONFIRM the pod lead and roles]
    team: {
      name: 'Custom Pod',
      size: '4–6 people, scoped together',
      members: 'ML and fine-tuning engineers.',
    },
    // [CONFIRM: timeline and phases] No week count until confirmed.
    timeline: 'Scoped together with you.',
    timelineNote: 'No fixed week count.',
    measures: [
      { name: 'Cost per task', detail: 'what each completed task costs.' },
      { name: 'Response time', detail: 'how quickly an answer arrives.' },
      {
        name: 'Accuracy against your current model',
        detail: 'a side-by-side comparison on your own questions.',
      },
    ],
    // [CLIENT PERMISSION NEEDED: no cleared case study] Placeholder card shows.
    faqs: [
      { q: 'Can our data stay inside our environment?', a: 'Yes. Private deployment is one option.' },
      {
        q: 'Do we have to commit to one model vendor?',
        a: 'No. We are model-neutral and work across frontier APIs and open models.',
      },
      {
        q: 'How do you choose a model?',
        a: 'We test candidate models on your own questions and compare cost, speed and accuracy.',
      },
    ],
    // [CONFIRM logos] No line given for this section, so it stays hidden.
    logos: [],
    rolePages: [],
    related: CONTEXT,
  },
  {
    path: '/solutions/data-annotation',
    name: 'Data and annotation',
    title: 'Data and annotation | Fwdpod',
    // Kept from the previous version of this page; the brief gives none.
    description:
      'Data pipelines, annotation and labelling at scale, evaluation datasets and RLHF. Clean, labelled data your AI can learn from and be tested against.',
    lastmod: '2026-11-21',
    subhead: 'Clean, labelled data your AI can learn from and be tested against.',
    intro:
      'AI is only as good as the data it learns from and the tests it passes. This layer gathers and cleans that data, has people label examples, and builds the test sets that show whether the AI is working.',
    examples: [
      'Labels thousands of support tickets by topic, with quality checks on each batch.',
      'Builds a set of test questions with correct answers, used to score every new model version.',
      'Pulls data from your source systems into a clean, usable format.',
      'Collects human ratings of AI answers, used to improve them.',
    ],
    problem: 'Models underperform because training or test data is missing or messy.',
    engineer: [
      {
        title: 'Data pipelines from source systems.',
        detail: 'Automated routes that move and clean data from your systems.',
      },
      {
        title: 'Annotation and labelling at scale, with quality checks.',
        detail:
          'Annotation means people label examples, such as tagging which clause in a contract is a payment term.',
      },
      {
        // [CONFIRM: keep the acronym or use plain language]
        title: 'Evaluation datasets and human feedback (RLHF).',
        detail: 'Test sets with correct answers, plus human ratings. RLHF means training an AI on human ratings of its answers.',
      },
      {
        title: 'Data quality and preparation for RAG and fine-tuning.',
        detail: 'Getting data ready for search and training.',
      },
    ],
    // [CONFIRM the pod name and headcount. The live site lists no Data pod.]
    // Name and size hidden until confirmed.
    team: { members: 'Data engineers and an annotation team.' },
    // [CONFIRM: timeline and phases] Only the weekly reporting line shows.
    timelineNote: 'Progress is reported weekly.',
    measures: [
      { name: 'Label accuracy', detail: 'how often labels pass our checks.' },
      { name: 'Throughput', detail: 'how many items are labelled in a period.' },
      { name: 'Coverage of your test set', detail: 'the share of real cases your tests cover.' },
    ],
    // [CLIENT PERMISSION NEEDED: no cleared case study] Placeholder card shows.
    faqs: [
      {
        q: 'Who sees our data?',
        a: 'Engineers work inside your environment under your access policies. Data stays where you keep it.',
      },
      // [CONFIRM: yes, and what the scope includes] Left out until the answer
      // is supplied: "Can you label our own examples?"
      {
        q: 'How do you check quality?',
        a: 'Quality checks are built into labelling. Measures include label accuracy and test-set coverage.',
      },
    ],
    // [CONFIRM logos] No line given for this section, so it stays hidden.
    logos: [],
    rolePages: [],
    related: CONTEXT,
  },
  {
    // Do not write "sign-off", "certified", "SOC 2", "ISO 27001" or "HIPAA".
    path: '/solutions/ai-compliance',
    name: 'Trust and compliance',
    title: 'Trust and compliance | Fwdpod',
    // [CONFIRM] Proposed H1
    h1: 'AI built with guardrails, audit logs and testing.',
    // The previous description said "sign off", so the subhead is used instead.
    description: 'Guardrails, audit logs and testing before every release.',
    lastmod: '2026-11-21',
    subhead: 'Guardrails, audit logs and testing before every release.',
    intro:
      'Before a risk, legal or audit team accepts an AI system, it has to be safe to use, recorded and tested. This layer adds those controls across every other layer, so you can show what the AI did and what it was checked against.',
    examples: [
      'Blocks sensitive personal details from appearing in answers.',
      'Keeps an audit log showing what each agent did, when, and on whose request.',
      'Runs a test suite before each release, checking for data leaks and wrong answers.',
      // [CONFIRM regulators]
      'Maps each control to the policy it supports.',
    ],
    // [CONFIRM: draft for approval]
    problem: "Risk teams can't approve an AI system they can't inspect or test.",
    engineer: [
      {
        title: 'Guardrails and privacy filters for sensitive data.',
        detail: 'Guardrails are rules that stop the AI from doing something unsafe.',
      },
      {
        title: 'Audit logs for every consequential AI action.',
        detail: 'A record of what the AI did and why.',
      },
      {
        title: 'Evaluation, red-team and regression testing before each release.',
        detail:
          "Red-teaming means trying to break the system on purpose. Regression testing checks that a new release hasn't broken what worked before.",
      },
      // [CONFIRM: named regulations and policies] Shown once NAMED_REGULATIONS
      // in company.ts is filled in, the same list /security uses.
      ...(NAMED_REGULATIONS.length ? [{ title: `Controls designed against ${NAMED_REGULATIONS.join(', ')}.` }] : []),
    ],
    // [CONFIRM roles]
    team: { name: 'Compliance AI Pod', size: '6 people' },
    // [CONFIRM] phase names and weeks
    timeline: '12–16 weeks to production.',
    timelineNote: 'Progress is reported weekly.',
    measures: [
      { name: 'Audit findings closed', detail: 'the number of audit findings resolved.' },
      { name: 'Data-leak tests passed', detail: 'the share of leak tests the system passes.' },
    ],
    // [CLIENT PERMISSION NEEDED] Same project as 'financial-brokerage' in case-studies.ts
    // [CONFIRM: 6 weeks is outside the listed 12–16 week range]
    example: { sector: 'Financial brokerage', pod: 'Compliance AI Pod', weeks: '6 weeks', team: '6 engineers' },
    faqs: [
      {
        q: "Does this meet our regulator's rules?",
        // [CONFIRM wording] "Certification status is on the Security page." is
        // left out: the Security page handoff (23 Nov 2026) rules out
        // certifications on /security, so there is nothing to point to.
        a: 'We design controls against the regulations and policies you name.',
      },
      {
        q: 'What data can the AI see?',
        a: 'Only what the user is permitted to see, under your access policies.',
      },
      // [CONFIRM] Left out until the answer is supplied: "Where are the audit logs kept?"
    ],
    // [CONFIRM logos] No line given for this section, so it stays hidden.
    logos: [],
    rolePages: [],
    ctaLinks: [{ label: 'Security', href: '/security' }],
    related: LLMOPS,
  },
  {
    path: LLMOPS.href,
    name: 'Operations (LLMOps)',
    title: 'Operations (LLMOps) | Fwdpod',
    // Kept from the previous version of this page; the brief gives none.
    description:
      'Deployment, monitoring, incident response and cost control for AI in production. An LLMOps Pod of senior engineers from India on a monthly retainer.',
    lastmod: '2026-11-21',
    subhead: 'AI that stays up, stays accurate and stays on budget.',
    intro:
      'Launching an AI system is the start. Operations is the day-to-day running of it: releases, monitoring, cost control and fixes when something breaks. The aim is that the system stays up, stays accurate and stays within budget.',
    examples: [
      'Alerts the team when answer quality drops or response times rise.',
      'Tracks cost per request and flags spikes.',
      'Rolls out a model update in stages, and rolls it back if quality falls.',
      'Responds when the system goes down, with on-call cover.',
    ],
    problem: 'AI is live and needs running.',
    engineer: [
      {
        title: 'Deployment pipelines and release management.',
        detail: 'Automated, repeatable releases.',
      },
      {
        title: 'Monitoring for quality, drift, latency and cost.',
        detail: 'Drift means quality slowly gets worse as data and users change. Latency means response time.',
      },
      {
        title: 'Incident response and on-call support.',
        detail: 'Someone responds when something breaks.',
      },
      {
        title: 'Ongoing cost and model updates.',
        detail: 'Keeping models and costs current.',
      },
    ],
    team: {
      name: 'LLMOps Pod',
      size: `${LLMOPS_POD_SIZE} people`,
      members: 'The pod has one accountable lead.',
    },
    // [CONFIRM: retainer scope and what is included in the first month]
    timeline: 'Ongoing, on a monthly retainer.',
    measures: [
      { name: 'Uptime', detail: 'the share of time the system is available.' },
      { name: 'Cost per request', detail: 'what each request costs to serve.' },
    ],
    // [CLIENT PERMISSION NEEDED: no cleared case study] Placeholder card shows.
    faqs: [
      // [CONFIRM: whether this is offered] Left out until answered:
      // "Can you run AI we didn't build?"
      // [CONFIRM: no prices on this page]
      { q: 'How is the service billed?', a: 'Monthly retainer.' },
      // [CONFIRM the response times and hours]
      { q: 'What happens when something breaks?', a: 'On-call support responds to incidents.' },
    ],
    // [CONFIRM logos] No line given for this section, so it stays hidden.
    logos: [],
    rolePages: [],
    related: AGENTS,
  },
];

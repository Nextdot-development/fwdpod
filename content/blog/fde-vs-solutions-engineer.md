---
title: "Forward Deployed Engineer vs Solutions Engineer: Where the Line Actually Sits"
seo_title: "Forward Deployed Engineer vs Solutions Engineer (2026)"
meta_description: "Forward deployed engineer vs solutions engineer: one wins the deal with demos and POCs, the other ships production code after it. See where the line sits."
slug: fde-vs-solutions-engineer
category: Forward Deployed Engineering
date: 2026-10-05
author: Fwdpod
image: /blog-images/fde-vs-solutions-engineer.jpg
image_alt: "Split office scene: on the pre-sale side a solutions engineer presents a product demo to two colleagues, on the post-sale side a forward deployed engineer writes code beside a screen linking customer systems, production and real data"
keywords: "forward deployed engineer vs solutions engineer, FDE vs solutions engineer, is a forward deployed engineer a sales role, forward deployed engineer vs solutions architect, forward deployed engineer vs customer success engineer, what does a forward deployed engineer actually do"
---

The difference between a forward deployed engineer vs solutions engineer comes down to timing and output. A solutions engineer works before the contract is signed, proving fit with demos and proofs of concept. A forward deployed engineer (FDE) works after it, embedded with the customer, writing production code until the system runs in their workflow.

Both roles are technical and both face customers, which is why job titles get swapped so often. The line becomes clear once you ask four questions: when in the deal they show up, who they answer to, what they leave behind, and how their performance is judged.

## The side-by-side comparison

| | Forward deployed engineer | Solutions engineer |
|---|---|---|
| **Stage** | Mostly post-sale: deployment, adoption, expansion | Pre-sale: discovery, demo, POC, technical win |
| **Typical home in the org** | Deployment, applied AI or engineering-led field team | Sales organization, paired with account executives |
| **Primary output** | Production code in the customer's environment | Demos, POCs, solution designs, answers to security and technical questions |
| **Data they touch** | Real customer data and systems | Sample, sandbox or anonymized data |
| **Success metric** | Production adoption and measurable workflow impact | Deals won, POC conversion, time to technical win |
| **Time with one customer** | Weeks to months, often embedded | Days to weeks per opportunity, many opportunities at once |
| **Feeds back to product?** | Yes, often by contributing code or reusable components | Yes, mostly as feature requests and field feedback |

These are patterns drawn from published job descriptions, not universal rules. Titles vary by company, and some vendors use them loosely.

## What is each role, in one paragraph?

**Forward deployed engineer.** A software engineer who embeds with a specific customer and builds whatever it takes to get the vendor's product working in production. Palantir, which popularized the role, describes its FDEs (internally "Deltas") with the phrase "one customer, many capabilities", in contrast to product developers, who build "one capability, many customers." For the full forward deployed engineer meaning, including the role's origins, see our explainer on [what a forward deployed engineer is](/insights/what-is-a-forward-deployed-engineer).

**Solutions engineer.** A technically fluent member of the sales team who shows prospects how a product solves their problem. Mixpanel's pre-sales listing is typical: the role partners "closely with Account Executives," delivers "standard and semi-customized product demos to prospects," and contributes to "proof-of-concept projects, including setup, execution, and documentation of results."

## Pre-sale or post-sale: when does each role show up?

This is the cleanest dividing line. The solutions engineer's job is to get to a "technical yes." Once the contract is signed, most of their attention moves to the next opportunity.

The FDE's job usually starts where that one ends. OpenAI's FDE listing says the role will "own technical delivery across multiple deployments from first prototype to stable production." Anthropic's listing places its FDEs in the Applied AI team, working "closely with our Post-Sales, Product, and Engineering teams" and building "long term relationships with customers... throughout the lifecycle of an engagement."

The practical consequence for a buyer: the person who wowed you in the demo is often not the person who will make it work.

## Who do they report to, and why does it matter?

Reporting lines shape behavior. Solutions engineers usually sit in the sales organization and are paired with account executives, so their priorities follow the pipeline. That is not a flaw. It is exactly what the role is for.

FDE reporting lines vary more. Palantir's own description says its Deltas sit within Business Development but carry a mandate to "achieve technical outcomes for our customers." At AI labs the role often sits in applied AI or deployment teams, with ties to product and research. OpenAI's listing names Product, Research, Partnerships, GRC, Security and GTM as close collaborators.

What matters is less the org chart than the incentive. Ask a vendor: is this engineer measured on closing the deal or on the system running in production six months later?

## What does a forward deployed engineer actually do that a solutions engineer does not?

They ship production code, on customer infrastructure, against real data. Gergely Orosz's reporting on OpenAI's field teams makes the distinction explicit: its Solutions Architects "rarely write code on customers' infrastructure, and usually build minimum viable products (MVPs), or proofs of concept (PoC) with anonymized or offline cuts of data," while FDEs "write code directly on customer infrastructure and use customer tooling."

Anthropic's FDE listing is equally concrete about output: "technical artifacts for customers like MCP servers, sub-agents, and agent skills that will be used in production workflows." (If MCP is new to you, our [MCP explainer](/insights/what-is-mcp) covers what those servers are.)

A solutions engineer's outputs are different and still valuable:

- A tailored demo environment
- A time-boxed POC with documented results
- A reference architecture or solution design
- Answers to security questionnaires and RFP technical sections

The POC proves the idea can work. Production code proves it does, with your authentication, your data quality problems and your change-control process.

## How is success measured for each role?

Solutions engineers are generally measured on commercial outcomes: technical wins, POC-to-close conversion and their contribution to revenue. The BLS description of the closely related sales engineer occupation includes duties such as working "with sales teams to secure and renew orders."

FDEs are measured on adoption and impact. OpenAI states it directly: success is measured "through production adoption, measurable workflow impact, and eval-driven feedback that changes product and model roadmaps." Palantir says its Deltas "measure success in terms of impact on the customer's goal."

## Where do the roles blur?

In practice, several overlaps are common:

1. **Paid pilots.** When a POC runs on production data for eight weeks, the solutions engineer is doing deployment work, whatever their title says.
2. **Early-stage vendors.** A startup with five engineers may have one person run the demo, sign the deal and write the integration.
3. **FDEs in late-stage deals.** Some companies bring FDEs in before signature for large accounts, so the engineer who will build it helps scope it.
4. **Title inflation.** Because "forward deployed" is a fashionable title, some vendors apply it to roles that are functionally pre-sales. Orosz notes that "Solutions Architect," "Sales Engineer" and "Technical Delivery Engineer" all "come pretty close" to FDE work, with the difference being that FDEs also "contribute to the product their company sells."

The test is always output, not title. Ask what the person committed to the customer's repository last month.

## How do sales engineers, solutions architects and customer success engineers compare?

| Role | Stage | Core output | Writes production code for the customer? |
|---|---|---|---|
| **Sales engineer** | Pre-sale | Technical presentations, requirements, sales support (BLS) | Rarely |
| **Solutions architect** | Pre-sale and advisory | Architecture, MVPs, POCs on offline or anonymized data (OpenAI, per Gergely Orosz) | Rarely |
| **Customer success engineer** | Post-sale | Technical advice, workshops, demos and enablement content aimed at "adoption, renewal, and expansion" (GitLab) | Usually not |
| **Forward deployed engineer** | Mostly post-sale | Production systems and reusable components in the customer's environment | Yes, it is the core of the job |

"Solutions engineer" and "sales engineer" are often used interchangeably. Customer success engineers are the closest post-sale neighbor to FDEs, but they advise and enable rather than build.

## Which role should a buyer ask a vendor for?

It depends on your stage.

**Ask for a solutions engineer when** you are still deciding whether a product fits. You need a fast answer to "can this handle our use case?" and a POC scoped tightly enough to prove it.

**Ask for a forward deployed engineer when** you have decided, and the risk has moved from "does it work?" to "will it work here?" Signs you are in FDE territory:

- The system must integrate with internal tools, legacy data or your identity provider
- Your team lacks the specialist skills (for example, LLM evaluation or retrieval tuning) to finish the build
- A previous pilot worked in the demo and stalled on the way to production
- You need someone accountable for a production outcome, not a recommendation

Before signing, ask the vendor three questions: Who writes the code, and in whose repository? [Who owns it at the end](/insights/ip-ownership-offshore-ai)? How is that engineer's performance measured? Our guide to [choosing a forward deployed engineering company](/insights/choosing-a-forward-deployed-engineering-company) extends these into nine questions and a scorecard. Our guide to [AI development engagement models](/insights/ai-engagement-models-explained) sets forward deployed engineering beside the other ways to buy the work, with who carries the risk in each, and our guide on [when to hire a forward deployed engineer](/insights/when-to-hire-a-forward-deployed-engineer) covers whether you need one at all. For more on the role, browse our [Forward Deployed Engineering](/insights/category/forward-deployed-engineering) guides.

## How fwdpod approaches this

[Fwdpod](/) builds dedicated [AI engineering pods](/insights/what-is-an-ai-pod) covering [LLM development](/services/llm-development), [RAG systems](/services/rag-development), [AI agents](/services/ai-agents) and product delivery, with engineering delivered from India for buyers in the US, UK, EU and Gulf. The [pod catalogue](/catalogue) shows how engagements are structured.

If you are past the POC and need production delivery, [configure your AI engineering pod](/configure) for a proposal, or [talk to the team](/contact).

## Frequently Asked Questions

### Is a forward deployed engineer a sales role?

No. An FDE is an engineering role that faces customers. Some companies place FDEs in business development or go-to-market groups, but their output is production software and they are judged on deployment outcomes, not quota.

### Can a solutions engineer become a forward deployed engineer?

Yes, if they have strong software engineering skills. The move usually requires comfort writing and maintaining production code, debugging in unfamiliar customer environments and owning a system after launch, which goes beyond building demos and POCs.

### Does a forward deployed engineer replace my internal engineering team?

Not usually. An FDE works alongside your engineers and domain teams, builds the first production version and codifies patterns your team can maintain. Plan a handover and knowledge transfer from the start.

### Is a forward deployed engineer the same as a consultant?

No. Palantir explicitly separates the two: its FDEs build long-term solutions the customer keeps improving, rather than delivering one-off analysis or recommendations. A consultant advises; an FDE ships and operates working software.

### Why are AI companies hiring so many forward deployed engineers?

Enterprise AI systems depend heavily on customer data, workflows and evaluation criteria that cannot be fully tested in a demo. Labs such as OpenAI and Anthropic now publish FDE roles focused on moving models from prototype into production inside customer systems.

### Should I pay for a proof of concept or go straight to forward deployed engineering?

Run a short POC if you are unsure the approach fits your use case. If fit is already proven and the open risk is integration, data quality or adoption, a longer POC rarely answers those questions, and production-focused engineering does.

### What should I ask a vendor to confirm their FDEs actually write production code?

Ask where the code will live, who has commit access, whether the engineer works on your infrastructure with your real data, and who owns the resulting code and documentation at the end of the engagement.

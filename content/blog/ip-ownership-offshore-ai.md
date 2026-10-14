---
title: "Who Owns the IP When You Outsource AI Development? A Plain-English Guide"
seo_title: "IP Ownership in Offshore AI Development: Who Owns What"
meta_description: "Who owns the IP when you outsource AI development? By default, often not you. Learn the US, UK and India rules and the contract clauses that fix it."
slug: ip-ownership-offshore-ai
category: Security, Compliance & Offshore Delivery
date: 2026-09-29
author: Fwdpod
image: /blog-images/ip-ownership-offshore-ai.jpg
image_alt: "A signed contract and pen on a desk beside law books labelled US law, UK law and India law, and a wooden box marked IP holding cards for code, data, AI model and prompts"
keywords: "IP ownership offshore AI development, who owns the IP when you outsource AI development, work made for hire software contractor, who owns fine-tuned model weights, IP assignment clause offshore vendor"
---

**Short answer:** unless your contract contains a signed, written assignment, the people who wrote the code usually own it, not you. IP ownership in offshore AI development follows the same default in the US, UK and India: the author (or the author's employer) owns the work first. You get ownership by contract, and for AI projects that contract has to cover more than code.

> **Not legal advice.** This is a general explanation of how the rules work. Contract law and copyright law vary by jurisdiction and change over time. Involve your own counsel before you sign anything.

## Who owns the IP when you outsource AI development by default?

The author does. Paying for the work does not, by itself, transfer copyright.

### United States: "work made for hire" rarely covers a vendor

Under 17 U.S.C. §201(a), copyright "vests initially in the author or authors of the work." The exception is a "work made for hire," where the employer or commissioning party is treated as the author.

The definition in 17 U.S.C. §101 has two branches:

1. Work prepared by an **employee** within the scope of employment.
2. Work **specially ordered or commissioned** that falls into one of nine categories (such as a contribution to a collective work, a translation, a compilation or a test), and only if both parties sign a written agreement saying so.

A vendor's engineers are not your employees (the Supreme Court in *CCNV v. Reid* tests "employee" under agency law, as the Copyright Office's Circular 30 explains), and custom software is not one of the nine categories. So a "work made for hire" label in a vendor contract often does nothing on its own. Careful US contracts add a backup **assignment**, which 17 U.S.C. §204(a) says is only valid in writing, signed by the owner of the rights.

### India: the vendor owns it first, then must assign it properly

When the vendor's team is in India, Indian law decides who owns the work at the moment it is written. Under Section 17(c) of the Copyright Act, 1957, work made by an employee "under a contract of service" belongs first to the **employer**, absent an agreement to the contrary. In practice, the Indian vendor owns what its salaried engineers write. You own nothing yet.

The assignment to you then has to meet Section 19:

- It must be **in writing and signed** by the assignor (s.19(1)).
- It must **identify the work**, the rights assigned, and the **duration and territorial extent** (s.19(2)).
- If the duration is not stated, it is **deemed to be five years** (s.19(5)).
- If the territory is not stated, it is **presumed to extend within India** only (s.19(6)).
- Rights can revert if the assignee does not exercise them within one year, unless the document says otherwise (s.19(4)).

A US-style template that says "Vendor assigns all IP to Client" without a term or territory can leave you with a five-year, India-only assignment.

### United Kingdom: same default

Section 11 of the Copyright, Designs and Patents Act 1988 says the author is the first owner, and an employer owns work made by an employee "in the course of his employment," subject to any agreement to the contrary. A contractor is not your employee. Under section 90(3), an assignment "is not effective unless it is in writing signed by or on behalf of the assignor."

### Default ownership at a glance

| Jurisdiction | Who owns contractor-written code by default | What moves it to you |
|---|---|---|
| United States | The contractor (work-for-hire rarely applies to vendor software) | Signed written assignment (§204) |
| India | The vendor, as employer of its engineers (s.17(c)) | Signed assignment naming work, rights, term and territory (s.19) |
| United Kingdom | The contractor, or the contractor's employer (s.11) | Signed written assignment (s.90(3)) |

## What IP does an AI project actually create?

Standard software contracts assign code and documents. An AI system produces more assets than that, and some are worth more than the code. Name each one in the contract.

| Asset | Why it matters | Contract point |
|---|---|---|
| Application code | The usual deliverable | Assign it outright |
| Prompts and system instructions | Often encode your business rules | Assign, and treat as confidential |
| Fine-tuned model weights / adapters | Can be the core of the product | Assign, and name the delivery format |
| Training and fine-tuning datasets | May include your data plus vendor-curated data | Clarify who owns each source; require return or deletion; agree where data may be stored |
| Evaluation sets and test harnesses | How you prove the system works | Assign; they are expensive to rebuild |
| Embeddings and vector indexes | Derived from your documents | Assign, and require export plus deletion on exit |
| Pipelines, infra-as-code, agent configs | Needed to run and redeploy | Assign, or license if built on vendor tooling |
| Vendor's pre-existing tools and libraries | Vendor built them before your project | Perpetual, irrevocable licence (see below) |
| Third-party open-source components | Governed by their own licences | Disclosure list; approval for copyleft licences |
| Foundation model outputs | Governed by the model provider's terms | Check the provider's terms (see below) |

Two cautions. Whether copyright protects model weights at all is an open question, so assign "all right, title and interest" by contract and also treat weights, prompts and eval sets as confidential information. And if the project fine-tunes an open-weight model, that base model's licence travels with your derived model. Read it before you pick the model, not after.

## Can you own code or text an AI model generated?

Partly. There are two separate questions here.

**Does the model provider claim it?** Generally no, for the major business API terms. OpenAI's Services Agreement, effective 1 January 2026, says the customer "owns all Output" and that OpenAI "hereby assigns to Customer" its rights in Output, while noting output "may not be unique." Anthropic's Commercial Terms, effective 17 June 2025, say the customer "owns its Outputs" and that Anthropic assigns its interest in Outputs. Check which terms your vendor's accounts run under: consumer plans and business plans can differ, and the account holder is the one bound. Ideally the API accounts are yours, not the vendor's.

**Is it copyrightable at all?** Only the human parts. The U.S. Copyright Office's March 2023 registration guidance requires human authorship and asks applicants to disclose more-than-minimal AI-generated content. Its January 2025 report on copyrightability concluded that "the mere provision of prompts" is not enough, but human creative arrangement or modification of AI output can be protected.

The practical point: AI-assisted code that an engineer did not meaningfully change may be only thinly protected, or not at all, and an assignment cannot transfer rights that do not exist. So also protect the codebase as confidential information and require the vendor to disclose its AI coding tools and warrant that their terms allow your commercial use.

## What should the contract say? A clause checklist

1. **Present-tense assignment.** "Vendor hereby assigns," not "will assign." Cover copyright, inventions, database rights and trade secrets in all project deliverables, listing the AI assets from the table above.
2. **Term and territory (India-specific).** State that the assignment is for the full term of copyright and worldwide. Exclude the s.19(4) one-year reversion expressly.
3. **Chain of title.** The vendor warrants that every engineer, freelancer and subcontractor on your project has signed an agreement that passes their rights to the vendor, so the vendor can pass them to you.
4. **Background IP licence.** The vendor keeps its pre-existing tools, but grants you a perpetual, irrevocable, royalty-free licence to use, modify and have others maintain anything embedded in your deliverables. Without this, you cannot switch vendors.
5. **Moral rights.** India's Section 57 gives authors rights that survive assignment; a court applied it in *Amar Nath Sehgal v. Union of India* even though copyright had vested in the government. UK law also recognizes moral rights. Ask for a waiver or a covenant not to assert them, to the extent local law allows.
6. **Open-source disclosure.** A list of every component and its licence at each release, and written approval before any copyleft component ships.
7. **AI tool and model terms.** Disclosed tools and model APIs, a commercial-use warranty, and API accounts in your name where practical.
8. **Handover and escrow.** On exit or request: repositories, weights, prompts, eval sets, datasets, pipelines, credentials and runbooks, in named formats, within a set number of days. Consider escrow for larger programs.
9. **Confidentiality.** Covers your data, prompts, weights and eval sets, and survives termination. Security controls themselves belong in a separate schedule; our guide to [data security in offshore AI development](/insights/data-security-offshore-ai-development) lists twelve to put in it.
10. **No training on your data.** The vendor may not use your data, prompts or outputs to train or improve models for anyone else.
11. **Governing law and enforcement.** Pick a law and forum that can actually be enforced against the vendor's assets.
12. **No IP hostage.** Make sure a payment dispute cannot block transfer of work already delivered, whichever of the [AI development engagement models](/insights/ai-engagement-models-explained) you choose.

## Where do outsourcing IP deals usually go wrong?

- **US template, Indian vendor:** no term or territory, so s.19(5) and s.19(6) apply.
- **Subcontractors outside the chain:** the vendor assigns rights it never had.
- **Vendor-owned API accounts:** outputs, fine-tunes and logs stay behind when the engagement ends.
- **Handover defined as "the code":** weights, eval sets and embeddings stay behind too.

These questions belong in the security and legal gates of your buying process, not after signature. Our guide to [how enterprises buy AI engineering capacity](/insights/how-enterprises-buy-ai-engineering-capacity) sets out where in the procurement path each one lands.

## How fwdpod approaches IP

[Fwdpod](/) builds dedicated [AI engineering pods](/insights/what-is-an-ai-pod) for startups and enterprises, with engineering delivered from India for buyers in the US, UK, EU and the Gulf. Because the engineers sit in India, the Section 19 points above apply to any assignment, which is why term and territory belong in the contract rather than in a template clause.

Before any pod starts, check the contract against the checklist above with your counsel. More guides like this sit in the [Security, Compliance & Offshore Delivery](/insights/category/security-compliance) section, and the [pod catalogue](/catalogue) shows how engagements are structured.

When your terms are ready, [configure your AI engineering pod](/configure) for a proposal, or [talk to the team](/contact) about your contract questions.

## Frequently Asked Questions

### Does paying an offshore vendor in full mean I own the AI system?

No. Payment alone does not transfer copyright in the US, UK or India. Ownership moves through a signed, written assignment. Without one, the most you may have is an implied licence to use what you paid for.

### Is a "work made for hire" clause enough in a US contract with an Indian vendor?

Usually not on its own. Vendor engineers are not your employees, and custom software is not one of the nine commissioned-work categories in 17 U.S.C. §101. Pair the clause with a present-tense assignment that also meets India's Section 19 requirements.

### What happens if my assignment does not state a term or territory under Indian law?

Section 19 of the Copyright Act, 1957 deems the assignment to last five years and to cover India only. State the full term of copyright and worldwide territory expressly.

### Who owns a fine-tuned model built on an open-weight base model?

You can take assignment of the vendor's contribution, such as the adapters and fine-tuned weights, but the base model's licence still governs how you use and distribute the result. Check that licence before selecting the model.

### Can my vendor reuse the prompts and eval sets it built for me on other clients?

Only if the contract allows it. Assign prompts and evaluation sets to yourself, classify them as confidential information, and prohibit reuse. Keep the vendor's generic, pre-existing tooling separate under a background IP licence.

### Should the model API accounts be in my name or the vendor's?

Yours, where practical. The account holder is the party bound by the provider's terms and the one holding outputs, logs and fine-tuned models on the platform. Accounts in your name make handover simpler.

### Does IP ownership in offshore AI development differ from onshore outsourcing?

The principle is the same everywhere: the author owns first and a written assignment moves it. The difference is that the vendor's local law, such as India's Section 19 formalities, also applies to the assignment, so a template written for domestic use can fall short.

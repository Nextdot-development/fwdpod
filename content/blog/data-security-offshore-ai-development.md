---
title: "Data Security in Offshore AI Development: The 12 Controls to Demand in Writing"
seo_title: "Data Security in Offshore AI Development: 12 Controls"
meta_description: "Twelve data security controls to require from an offshore AI development team, each mapped to ISO 27001 Annex A, NIST SP 800-53 and the OWASP LLM Top 10."
slug: data-security-offshore-ai-development
category: Security, Compliance & Offshore Delivery
date: 2026-10-03
author: Fwdpod
image: /blog-images/data-security-offshore-ai-development.jpg
image_alt: "A glass checklist titled 12 Security Controls, ticking off access and identity, data protection, model security, monitoring, incident response and vendor controls, beside a globe carrying a padlock shield and ringed by cloud, database, code, document and team icons"
keywords: "data security offshore AI development, offshore AI vendor security controls, AI coding assistants offshore engineers, LLM provider data retention, zero data retention, who should own LLM API keys, incident notification window, AI subprocessor list"
---

Data security in offshore AI development comes down to twelve controls you can put in the contract and then check: the team works in your cloud, signs in through your identity provider, builds on masked data, and uses your model accounts, your secrets vault and your logs. If a vendor won't commit to these in writing, the country they work from is not your biggest risk.

Each control is mapped to ISO/IEC 27001:2022 Annex A, NIST SP 800-53 Rev. 5 and, where the risk is AI-specific, the OWASP Top 10 for LLM Applications 2025 or the NIST AI Risk Management Framework. For code and model ownership, which is a separate contract question, see [who owns the IP when you outsource AI development](/insights/ip-ownership-offshore-ai).

> **Not legal advice.** This article describes security practice and names laws in general terms. Involve your own counsel and security team before you sign.

## Why does AI work leak data where normal outsourcing doesn't?

A conventional software vendor can leak your data through a database dump or a lost laptop. An AI build adds new exits, and most of them are routine parts of the work:

- **Prompts and completions** go to a model provider, whose retention rules depend on whose account is used and which settings are on.
- **Traces and logs** from LLM observability tools capture full prompts, retrieved documents and outputs.
- **Evaluation sets** get built from real support tickets, contracts or patient notes, because synthetic examples feel less realistic.
- **Vector stores** hold embedded copies of your documents. OWASP lists this as its own risk, LLM08 Vector and Embedding Weaknesses.
- **Agent credentials** let a model call your APIs, so a leaked key or an over-permissioned tool becomes a data path.
- **Personal AI tools** tempt engineers to paste a stack trace or a sample record into a chatbot you have never approved.

Verizon's 2026 Data Breach Investigations Report found that breaches involving a third party made up 48% of all breaches, and that shadow AI (employees using unapproved AI tools) is now the third most common non-malicious data leakage activity. An offshore AI team is a third party whose daily work runs on AI tools, so both risks meet in one engagement.

## The 12 controls at a glance

| # | Control | ISO/IEC 27001:2022 Annex A | NIST SP 800-53 Rev. 5 | AI-specific reference |
| --- | --- | --- | --- | --- |
| 1 | Work happens in your cloud and accounts | 5.23, 5.20 | AC-20, SA-9(5) | NIST AI RMF GOVERN 6.1 |
| 2 | SSO, MFA and least privilege per named engineer | 5.15, 5.16, 5.18, 8.2, 8.5 | AC-2, AC-6, IA-2 | OWASP LLM06 Excessive Agency |
| 3 | No production data on laptops | 8.1, 6.7, 7.10 | AC-17, SC-28, MP-7 | — |
| 4 | Synthetic or masked data outside production | 8.11, 8.33, 8.31 | SA-3(2), SI-12(2) | OWASP LLM02 Sensitive Information Disclosure |
| 5 | LLM provider retention and training settings | 5.23, 5.34 | SA-9, SA-9(5) | OWASP LLM02; NIST AI RMF GOVERN 6.1 |
| 6 | Prompt, trace and log handling | 8.15, 8.10, 8.11 | AU-9, AU-11, SI-12 | OWASP LLM02, LLM07 System Prompt Leakage |
| 7 | Secrets management | 5.17, 8.24 | IA-5, IA-5(7), SC-12 | OWASP LLM07 |
| 8 | Audit logging you own | 8.15, 8.16 | AU-2, AU-6, AU-12 | — |
| 9 | Data leakage prevention, including AI tools | 8.12 | SC-7(10), AC-4 | OWASP LLM02 |
| 10 | Offboarding within a fixed window | 6.5, 5.11, 5.18 | PS-4, PS-7, AC-2(3) | — |
| 11 | Incident notification in hours | 5.24, 5.26, 5.20 | IR-6, SR-8 | NIST AI RMF MANAGE 4.3 |
| 12 | Named subprocessor list with change approval | 5.19, 5.21, 5.22 | SA-9, SR-3, SR-6 | OWASP LLM03 Supply Chain; NIST AI RMF MANAGE 3.1 |

The NIST, OWASP and AI RMF references were checked against NIST's and OWASP's own publications (SP 800-53 release 5.2.0). ISO 27001 is a paid standard, so confirm Annex A numbers against your licensed copy before they go into a contract.

## What does each control require, and how do you check it?

### 1. The work happens in your cloud, under your accounts

**Require:** repositories, cloud tenancy, model API accounts, vector databases, evaluation data and CI/CD pipelines all sit in accounts you own and pay for. The vendor gets access; it does not get copies.

**Verify:** ask which of these would live on vendor infrastructure. Any answer other than "none" needs a written reason. NIST's AC-20 covers exactly this decision: whether to let your information be processed on external systems. Where the data physically sits is a separate question, for your data residency requirements.

### 2. SSO, MFA and least privilege for every named engineer

**Require:** every engineer signs in through your identity provider with MFA, using a named account (no shared logins), with access scoped to the environments their work needs. The same rule applies to the AI system itself. OWASP's guidance on excessive agency says to "minimize extension permissions" and to run tools in the user's context, so an agent's service account should not be broader than the person it acts for (OWASP LLM06). Our [MCP explainer](/insights/what-is-mcp) covers the same point for agent tools: start with minimal scopes and elevate per operation.

**Verify:** pull the list of vendor accounts from your IdP and compare it with the team roster in the SOW.

### 3. No production data on laptops

**Require:** production and customer data is reached only inside your environment (a bastion host, virtual desktop or cloud workspace) and is never downloaded to endpoints. Laptops that touch your code are managed, encrypted and locked against removable media.

**Verify:** ask how a support engineer would debug a production issue. The honest answer describes a remote session, not an export.

### 4. Synthetic or masked data everywhere except production

**Require:** development, testing and evaluation run on synthetic, masked or pseudonymized data. Any use of real data in a non-production environment is approved in writing and protected at production level. That second clause is almost word for word NIST SA-3(2), "Use of Live or Operational Data."

**Verify:** ask to see how the evaluation set was built. RAG and agent evaluation sets are where real records most often creep in.

### 5. LLM provider retention and training settings, confirmed per account

**Require:** a written record of the settings on every model account the project uses: training use, retention period, and any zero data retention (ZDR) arrangement. The defaults vary. OpenAI says API data has not been used for training since March 1, 2023 unless you opt in. It keeps abuse-monitoring logs for up to 30 days, and ZDR needs OpenAI's prior approval. Anthropic says it deletes API inputs and outputs within 30 days unless an exception applies, such as a ZDR agreement, a feature with its own retention setting, or a usage policy or legal requirement.

**Verify:** confirm these on your own accounts, not the vendor's. Also check features that store data on the provider's side; OpenAI's assistants, threads and vector stores keep data until you delete it.

### 6. Prompts, traces and logs treated as sensitive data

**Require:** prompts, completions and retrieved context are redacted or masked before they reach logging and tracing tools. Those tools run in your accounts, with a defined retention period and access limited to named people. System prompts contain no secrets, no user roles and no permission logic. OWASP says plainly to avoid embedding "API keys, auth keys, database names, user roles, permission structure of the application" in system prompts (OWASP LLM07).

**Verify:** open a real trace in staging and read what it captured. Our guide to [running LangGraph in production](/insights/langgraph-in-production) shows what a LangSmith trace holds by default: prompts, tool inputs and outputs.

### 7. Secrets in a vault, never in code, notebooks or prompts

**Require:** API keys, database credentials and tokens are kept in your secrets manager, issued per environment, rotated on a schedule and on every roster change. NIST IA-5(7) says it directly: no unencrypted static authenticators embedded in applications or static storage.

**Verify:** turn on secret scanning in your repositories and review the history, not just the current branch.

### 8. Audit logs that you own and can read

**Require:** cloud audit trails, repository audit logs, IdP sign-ins and model API usage all flow to your logging or SIEM platform, with retention you set. The vendor's own logs are useful, but they should not be your only record. The application-level audit trail the LLM system itself keeps is a separate design decision, and it belongs in the same platform.

**Verify:** pick one engineer and one day, then reconstruct what they accessed from your logs alone.

### 9. Data leakage prevention that covers AI tools

**Require:** egress controls and DLP on the environments where your data lives, plus a written list of the AI tools (coding assistants, chat tools, browser extensions) engineers may use on your code, under which account and settings. Everything else is blocked or banned.

**Verify:** ask what happens if an engineer pastes a customer record into an unapproved chatbot. A good answer names a technical block. A weak answer names a policy document.

### 10. Offboarding within a fixed window

**Require:** the vendor tells you about any removal or role change within a stated number of hours, and all access (IdP, cloud, repositories, model consoles) is revoked in that window. Company devices come back and local copies are deleted. NIST PS-7 requires external providers to notify you of transfers and terminations within a period you define; PS-4 covers disabling access and revoking credentials.

**Verify:** run a quarterly access review against the current roster, and check the dates of the last few removals.

### 11. Incident notification measured in hours

**Require:** a fixed notification window in hours, a named contact on each side, and a definition of "incident" that includes AI-specific events: a prompt injection that exposed data, a leaked model key, sensitive data found in logs. "Promptly" is not a clock. Under GDPR Article 33 a processor must tell the controller "without undue delay," while the controller has up to 72 hours to notify the regulator. Your contract has to close that gap.

**Verify:** ask for the vendor's incident runbook and the date of its last tabletop exercise.

### 12. A named subprocessor list with change approval

**Require:** a list of every third party that can touch your data: model providers, tracing and observability tools, labeling vendors, hosting providers and any subcontracted engineers. Add a right to approve or object before the list changes. For EU personal data, GDPR Article 28(2) already bars a processor from engaging another processor without the controller's written authorization. The NIST AI RMF covers the same ground under GOVERN 6.1, which asks for policies on "AI risks associated with third-party entities."

**Verify:** compare the list with the tools you see in the vendor's architecture diagrams and invoices.

## Your written checklist

Copy this into your MSA, DPA or security schedule and ask the vendor to confirm each line:

- All repos, cloud resources, model API accounts, vector stores and eval data are in client-owned accounts.
- Access only through client SSO with MFA, per named engineer, least privilege, including agent service accounts.
- No production or customer data stored on endpoints; managed, encrypted devices only.
- Non-production environments use synthetic or masked data; any exception approved in writing.
- Model provider training, retention and ZDR settings documented for every account.
- Prompts and traces redacted before logging; defined retention; no secrets or permission logic in system prompts.
- Secrets held in the client vault, rotated on schedule and on roster change; secret scanning enabled.
- Cloud, repo, IdP and model API logs flow to client-controlled logging.
- DLP and egress controls in place; approved AI tool list; unapproved tools blocked.
- Personnel changes notified and access revoked within [X] hours.
- Security incidents notified within [X] hours, with AI-specific incidents defined.
- Current subprocessor list attached; changes need prior written approval.

Fill in the hour values with your own security and legal teams. They depend on your regulatory clock and your customer contracts, not on a market norm.

These commitments belong in the security review and contract stages of your buying process. Our guide to [how enterprises buy AI engineering capacity](/insights/how-enterprises-buy-ai-engineering-capacity) sets out where each stage sits and what to ask the vendor before you reach it.

## What do the framework mappings prove, and what don't they?

A mapping makes a control easier to defend in procurement and audit. It does not prove the vendor runs it. Three limits:

- **ISO 27001 certification has a scope.** A certificate covers the management system described in its scope and statement of applicability, which may not include the team assigned to you.
- **NIST SP 800-53 is a catalog, not a certificate.** Many controls leave values such as time periods and frequencies for you to define, so the contract has to fill them in.
- **OWASP's LLM Top 10 is a risk list.** It tells you what can go wrong in an LLM application and how to reduce it. It is not an audit standard.

A good vendor answers each control with evidence: a screenshot of IdP groups, a redacted trace, a subprocessor list, a runbook. Ask for that evidence during the security review, not after signature.

## How Fwdpod approaches this

[Fwdpod](/) builds dedicated [AI engineering pods](/insights/what-is-an-ai-pod) for startups and enterprises, serving buyers in the US, UK, EU and Gulf, with engineering delivery from India. The twelve controls above describe how we think any offshore AI engagement should be set up, whoever the vendor is.

If you want to test these controls against your own compliance requirements before you commit, [talk to us](/contact) about how a pod would be set up inside your environment, or [configure your AI engineering pod](/configure) to get a custom proposal within 48 hours. For more on offshore delivery risk, browse our [Security, Compliance & Offshore Delivery](/insights/category/security-compliance) guides.

## Frequently Asked Questions

### Do these controls matter if the offshore team never touches production data?

Yes, though some become lighter. Source code, system prompts, evaluation sets, API keys and architecture documents are sensitive in their own right, and AI builds tend to pull real data into test sets and logs over time. Controls 2, 6, 7, 10 and 12 apply to every engagement.

### Should offshore engineers be allowed to use AI coding assistants on our code?

Only tools you have approved, running under accounts and settings you control or have reviewed. Name the permitted assistants, the account type and the data-use settings in the contract, and block the rest. An engineer's personal chatbot account is outside every control in this list.

### Does zero data retention mean the model provider stores nothing at all?

Not always. OpenAI and Anthropic both treat zero data retention as an arrangement you apply or agree for, not a default. Features that keep application state, such as stored threads, files or vector stores, need to be checked separately. Confirm the settings on your own accounts.

### What notification window should we set for security incidents?

Work back from your own obligations. If you are a GDPR controller, you may have 72 hours to notify the regulator after becoming aware of a breach, and your processor only has to tell you "without undue delay." Set a fixed number of hours well inside your own deadline, agreed with your legal team.

### Can a vendor meet these controls without an ISO 27001 or SOC 2 report?

It can run the controls, but you will have less independent evidence that it does. Without a third-party report, ask for direct evidence of each control and keep audit rights in the contract. With a report, check that its scope covers the people and systems working on your project.

### Who should own the LLM API keys and cloud accounts?

You should. When the accounts are yours, retention settings, billing, usage logs and revocation all stay under your control, and ending the engagement does not mean migrating keys or data out of a vendor's tenancy.

### How is this checklist different from a vendor security questionnaire?

A questionnaire collects a vendor's self-reported answers across many security areas. This checklist is narrower: twelve controls specific to offshore AI work, written as commitments to put in the contract and then check with your own logs and settings.

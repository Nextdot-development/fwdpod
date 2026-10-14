---
title: "What Is MCP? The Model Context Protocol Explained for Enterprise Buyers"
seo_title: "What Is MCP? The Model Context Protocol Explained"
meta_description: "What is MCP? A plain guide to the Model Context Protocol: hosts, clients, servers, tools, transports, governance, vendor support and the security risks to plan for."
slug: what-is-mcp
category: Agentic AI & LLM Engineering
date: 2026-09-30
author: Fwdpod
image: /blog-images/what-is-mcp.jpg
image_alt: "A glowing MCP hub on a desk wired to AI apps such as ChatGPT, Claude, Gemini, Copilot and VS Code on one side and enterprise databases, files, CRM and ticketing on the other, above three tiles for tools, resources and prompts"
keywords: "what is MCP, Model Context Protocol, MCP server, MCP client, MCP security, hire MCP developers"
---

**MCP (Model Context Protocol) is an open standard that lets AI applications connect to outside tools and data through one common interface.** You wrap a system such as a CRM, a file store or a ticketing tool in an "MCP server" once, and any MCP-compatible AI application can discover and use it. Anthropic introduced it in November 2024. It is now governed under the Linux Foundation.

So the short answer to "what is MCP?" is a shared connector standard for AI. The rest of this guide covers what enterprise buyers need before approving MCP work: how the pieces fit, who supports it, and where the security risks are.

## MCP at a glance

| Question | Answer |
| --- | --- |
| Full name | Model Context Protocol |
| Created by | Anthropic, announced 25 November 2024 |
| Governed by | The Agentic AI Foundation, a directed fund under the Linux Foundation (since 9 December 2025) |
| Current spec version | 2026-07-28 (published 28 July 2026) |
| Message format | JSON-RPC 2.0 |
| Standard transports | stdio (local) and Streamable HTTP (remote) |
| What servers expose | Tools, resources and prompts |
| Main clients | Claude, ChatGPT, Gemini, Microsoft Copilot, VS Code, Cursor and others |

## What problem does MCP solve?

Before MCP, every AI application needed its own custom connector for every system it touched. Anthropic's launch announcement described the problem plainly: "every new data source requires its own custom implementation, making truly connected systems difficult to scale."

With five AI applications and twenty internal systems, that could mean up to a hundred custom integrations. With MCP, each system gets one server and each application one client, so the count grows by addition, not multiplication.

The specification says it takes inspiration from the Language Server Protocol, which did the same thing for programming-language support in code editors. One language server works in many editors. One MCP server works in many AI applications.

For a buyer, the benefit is portability: change model provider or add a second assistant, and your MCP servers still work.

## How does MCP work? Hosts, clients and servers

The specification defines three roles, and the terms get mixed up often:

- **Host:** the AI application the user works in, such as a desktop assistant, an IDE or your own agent. The spec calls hosts "LLM applications that initiate connections."
- **Client:** a connector inside the host. A host typically runs one client for each server it connects to.
- **Server:** a service that "provide[s] context and capabilities." This is the part your team builds for an internal system.

For example, a finance analyst asks an AI assistant, "Which of our top ten customers have overdue invoices, and who owns each account?" The assistant is the host. It holds two clients, one connected to an MCP server wrapping the billing system and one wrapping the CRM. The model sees the tools both servers offer, calls "list overdue invoices" and then "get account owner," and writes the answer. Neither server knows which model is on the other end.

The model never talks to your systems directly. The host decides which servers are connected, and the spec expects the host to get user consent before it invokes any tool.

## What can an MCP server expose?

MCP servers offer up to three kinds of capability, which the spec calls features and developers often call primitives:

| Primitive | Spec definition | Enterprise example |
| --- | --- | --- |
| Tools | "Functions for the AI model to execute" | Create a support ticket, run a read-only SQL query, look up an order |
| Resources | "Context and data, for the user or the AI model to use" | A policy document, a database schema, a customer record |
| Prompts | "Templated messages and workflows for users" | A standard "summarize this contract for legal review" workflow |

Tools carry most of the risk because they act.

MCP also defines features that flow the other way, from client to server. In the current version, the main one is **elicitation**: a server can ask the user for more information mid-task, for example to confirm which of two matching accounts they meant. The 2026-07-28 release deprecated three older features: sampling, roots and logging. They keep working for at least twelve months, but new implementations should not add them.

## How do MCP clients and servers communicate?

All MCP messages use JSON-RPC 2.0. The spec defines two standard transports:

| Transport | How it works | Typical use |
| --- | --- | --- |
| stdio | The client launches the server as a subprocess and exchanges newline-delimited messages over standard input and output | Local servers on a developer's or user's machine |
| Streamable HTTP | Each message is an HTTP POST to one MCP endpoint; replies come back as JSON or a request-scoped event stream | Remote, shared servers running in your cloud or data center |

Custom transports are allowed if they keep the JSON-RPC format and message patterns. The older HTTP+SSE transport, replaced by Streamable HTTP in the 2025-03-26 version, is now officially deprecated with a one-year offramp.

### What changed in the 2026-07-28 spec?

The protocol core became stateless. The old initialize handshake and session IDs are gone, and every request now carries its own protocol version and capabilities. The MCP team's summary is that servers can now run "behind a plain round-robin load balancer" without shared storage.

Other changes an operations team will notice:

- HTTP requests carry `Mcp-Method` and `Mcp-Name` headers, so gateways can route and authorize traffic without parsing request bodies.
- List results for tools, prompts and resources can carry cache lifetimes.
- Authorization was tightened: clients must validate the authorization server's issuer (RFC 9207), and credentials are bound to the issuer that granted them.

The release is not free to adopt. The MCP team acknowledges "some migration cost," especially for anyone who relied on session identifiers.

## Who governs MCP now?

Anthropic created MCP, but it no longer controls it alone. On 9 December 2025, MCP joined the Agentic AI Foundation (AAIF), a directed fund under the Linux Foundation. Anthropic, Block and OpenAI co-founded the AAIF, with support from Google, Microsoft, AWS, Cloudflare and Bloomberg.

The announcement said MCP's governance model "continues as is," with maintainers keeping authority over technical direction. For procurement, the point is that MCP is a vendor-neutral standard with a public spec, not one vendor's proprietary API.

## Which vendors support MCP?

Adoption has moved fast. At the December 2025 handover, the project reported 97 million monthly SDK downloads and 10,000 active servers. By July 2026, it said its Tier 1 SDKs were at "close to half-a-billion downloads a month."

| Vendor | Verified MCP support |
| --- | --- |
| Anthropic | Created MCP; Claude is an MCP client |
| OpenAI | Remote MCP servers in the Responses API, with per-tool approval settings; ChatGPT listed as a client |
| Google | Fully managed remote MCP servers for Google Maps, BigQuery, Compute Engine and Kubernetes Engine (announced 10 December 2025); Gemini CLI named as a client |
| Microsoft | Microsoft Copilot and Visual Studio Code listed with first-class client support; AAIF supporter |
| AWS, Cloudflare, Bloomberg | AAIF supporters |

Support differs by product and plan. Check the specific product your teams use before you assume it can connect to a remote server you host.

## What are the security risks of MCP?

The spec says it "enables powerful capabilities through arbitrary data access and code execution paths," and it states that MCP "cannot enforce these security principles at the protocol level." Enforcement falls to whoever builds the host and the servers.

The spec's core principles are user consent and control, data privacy and tool safety. It also warns that tool descriptions and annotations "should be considered untrusted, unless obtained from a trusted server." OpenAI's documentation is more direct: "a malicious server can exfiltrate sensitive data from anything entering the model's context."

The official MCP security best practices name specific attacks. Here they are in buyer terms:

| Risk | What goes wrong | Required or recommended control |
| --- | --- | --- |
| Confused deputy | An MCP proxy using one static OAuth client ID lets an attacker skip a user's consent screen | Per-client consent before forwarding to the third-party authorization server; exact redirect URI matching |
| Token passthrough | A server accepts a token that was not issued for it and forwards it downstream, bypassing controls and muddying audit logs | Servers **must not** accept tokens not explicitly issued for them |
| Server-side request forgery | A malicious server points a client at internal addresses or cloud metadata endpoints during OAuth discovery | HTTPS only, block private IP ranges, validate redirects, use an egress proxy |
| Session hijacking | An attacker reuses a guessed or stolen session ID | Verify every request; never use sessions for authentication; bind state to the user |
| Local server compromise | A one-click install runs a malicious startup command with the user's privileges | Show the full command and get explicit consent; sandbox local servers |
| Over-broad scopes | A stolen token with wildcard scopes opens every tool at once | Start with minimal scopes and elevate per operation |

Two more points for enterprise review. A tool is only as safe as its permissions: a server that exposes a delete operation gives the model a delete button. And prompt injection still applies, because text inside a document a server returns can try to steer the model, so high-impact actions should need human approval.

Treat these controls as part of the security review for any MCP work, the same gate any vendor with access to your data goes through. Our guide to [how enterprises buy AI engineering capacity](/insights/how-enterprises-buy-ai-engineering-capacity) sets out where that review sits in the buying process, and our guide to [data security in offshore AI development](/insights/data-security-offshore-ai-development) lists the controls to demand from the team building your servers.

## Does your enterprise AI stack need an MCP server?

Probably, if any of these are true:

- More than one AI application, or more than one model provider, needs the same internal system.
- You want an internal knowledge assistant or agent to read from, and eventually act on, systems your teams already use.
- You want one place to enforce authentication, scopes and logging for every AI tool call, rather than scattering that logic across applications.

You probably don't need one yet for a single application calling two or three functions through one provider's native tool calling. MCP adds a layer, which pays off only once there is reuse.

The next questions are design ones: which systems to wrap first, local or remote deployment, how authorization maps to your identity provider, and which tools stay read-only. Settle them before a build starts. More on agents and LLM systems in production sits in the [Agentic AI & LLM Engineering](/insights/category/agentic-ai) section.

## Looking to hire MCP developers?

If you plan to hire MCP developers, test for the things this guide flags: scope design, OAuth and token handling, the 2026-07-28 stateless changes, and judgment about which operations should never be exposed. Our guide on [how to hire AI engineers](/insights/how-to-hire-ai-engineers) covers the wider screening process.

[Fwdpod](/) builds dedicated [AI engineering pods](/insights/what-is-an-ai-pod) for LLM development, RAG systems and [AI agents](/services/ai-agents), for startups and enterprise teams in the US, UK, EU and Gulf, with engineering delivery from India. The [pod catalogue](/catalogue) shows how engagements are structured.

To scope a first server for one internal system, [configure your AI engineering pod](/configure) for a proposal, or [talk to the team](/contact).

## Frequently Asked Questions

### Is MCP only for Claude?

No. Anthropic created MCP, but it is an open standard now governed under the Linux Foundation. OpenAI, Google and Microsoft products are among those that support it, including ChatGPT, Gemini, Microsoft Copilot and VS Code. A server built once can be used by any compatible client.

### What is the difference between MCP and function calling?

Function calling is a model provider's way of letting a model request an action inside one application. MCP standardizes how those tools are described, discovered and called across applications. In practice, an MCP client usually turns the tools it discovers into the model's native function-calling format.

### Does MCP replace RAG?

No. RAG is a pattern for retrieving relevant content and adding it to a prompt. MCP is a connection standard. A retrieval system can be exposed through an MCP server as a search tool or as resources, so the two often work together.

### Is an MCP server just an API wrapper?

Often it starts as one, but a good MCP server is more than a pass-through. It chooses which operations to expose, writes descriptions a model can use correctly, enforces authorization with tokens issued for that server, and limits what each tool can change. Exposing every endpoint of an existing API is usually a mistake.

### Can we use MCP with sensitive or regulated data?

It can be done, but the protocol itself does not enforce security. The host and server builders must add consent, least-privilege scopes, audit logging and human approval for high-impact actions. Treat third-party MCP servers like any other vendor with access to your data and review them before connecting.

### Do we need to upgrade existing MCP servers for the 2026-07-28 spec?

Not immediately. Deprecated features keep working for at least twelve months, and the spec describes fallback behavior for talking to older versions. Plan the migration anyway, especially if your servers depend on session IDs, sampling or the legacy HTTP+SSE transport.

### Who maintains the MCP specification?

The MCP project's maintainers, under the Agentic AI Foundation, a directed fund of the Linux Foundation co-founded by Anthropic, Block and OpenAI. The foundation provides a neutral home, while the maintainers keep authority over the technical direction.

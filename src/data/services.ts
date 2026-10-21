/**
 * Every service page, in the order the footer and the "Related Services"
 * chips show them. Add a new service here once and it appears in both.
 */
export interface ServiceLink {
  label: string;
  href: string;
}

export const SERVICES: ServiceLink[] = [
  { label: 'AI Development', href: '/services/ai-development' },
  { label: 'LLM Development', href: '/services/llm-development' },
  { label: 'RAG Development', href: '/services/rag-development' },
  { label: 'AI Agents', href: '/services/ai-agents' },
  { label: 'Data Annotation', href: '/services/data-annotation' },
  { label: 'Team Augmentation', href: '/services/team-augmentation' },
  { label: 'AI Consulting', href: '/services/ai-consulting' },
];

/** All services except the one whose page is open. */
export function relatedServices(currentHref: string): ServiceLink[] {
  return SERVICES.filter(service => service.href !== currentHref);
}

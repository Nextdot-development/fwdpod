import type { ReactNode } from 'react';

export interface FaqCardItem {
  /** Stable React key, usually the question text */
  key: string;
  question: ReactNode;
  answer: ReactNode;
  /** Optional anchor id, so a question can be linked to */
  id?: string;
}

/**
 * Every FAQ on the site, as click-to-open cards: only the questions show,
 * and a click opens the answer. Native <details>, so it works with or without
 * JavaScript and the answers stay in the HTML (FAQPage schema still matches
 * text the page contains). Used by the marketing pages, the solution pages
 * and the blog articles.
 */
export default function FaqCards({
  items,
  className = '',
  questionClassName = 'text-[15px] md:text-base font-semibold text-[#0A0A0A] leading-snug',
  answerClassName = 'text-sm text-[#555555] leading-relaxed',
}: {
  items: FaqCardItem[];
  className?: string;
  questionClassName?: string;
  answerClassName?: string;
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {items.map(item => (
        <details
          key={item.key}
          id={item.id}
          className="group rounded-2xl border border-zinc-200 bg-white scroll-mt-24 open:shadow-sm transition-shadow"
        >
          <summary className="flex items-center justify-between gap-4 px-5 py-4 md:px-6 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            <h3 className={questionClassName}>{item.question}</h3>
            <span className="shrink-0 w-5 text-center text-lg leading-none font-medium text-[#0066FF] group-open:hidden" aria-hidden="true">
              +
            </span>
            <span className="shrink-0 w-5 text-center text-lg leading-none font-medium text-[#0066FF] hidden group-open:inline" aria-hidden="true">
              −
            </span>
          </summary>
          <div className={`px-5 pb-5 md:px-6 space-y-3 ${answerClassName}`}>{item.answer}</div>
        </details>
      ))}
    </div>
  );
}

import { X } from "lucide-react";
import renderMarkdown from "../../../components/blog/markdown";
import { blocksToMarkdown, findExternalLinks, type CmsBlock } from "../../../cms/cmsPost";
import type { BlogBlock, FaqItem } from "@admin/types/blog";

export interface PreviewData {
  title: string;
  category: string;
  excerpt: string;
  featuredImage: string;
  imageAlt: string;
  readTime: string;
  author: string;
  dateLabel: string;
  content: BlogBlock[];
  faq: FaqItem[];
  tags: string[];
  related: { slug: string; title: string }[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  data: PreviewData;
}

/**
 * The post as the article page will render it: the same block-to-markdown
 * conversion the build runs (src/cms/cmsPost.ts) and the site's own markdown
 * renderer, inside the article page's layout.
 */
export function BlogPreviewModal({ open, onClose, data }: Props) {
  if (!open) return null;
  const blocks = data.content as CmsBlock[];
  const markdown = blocksToMarkdown(blocks, data.faq);
  const stripped = findExternalLinks(blocks, data.faq);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink/50">
      <div className="flex items-center justify-between border-b border-line bg-paper px-5 py-3">
        <span className="text-sm font-semibold text-ink/60">Preview: how this renders on fwdpod.com</span>
        <button onClick={onClose} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm font-medium text-ink hover:border-accent">
          <X size={15} /> Close
        </button>
      </div>

      {/* Links inside the preview stay inert: they point at public routes. */}
      <div className="flex-1 overflow-y-auto bg-white text-[#0A0A0A]" onClickCapture={(e) => { if ((e.target as HTMLElement).closest("a")) e.preventDefault(); }}>
        <div className="mx-auto max-w-3xl space-y-8 px-4 py-12">
          {stripped.length > 0 && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
              Links to other sites are shown as plain text on fwdpod.com: {stripped.join(", ")}
            </p>
          )}
          <article className="space-y-8">
            <header className="space-y-4">
              <span className="inline-block rounded-full bg-[#0066FF]/5 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#0066FF]">
                {data.category || "Category"}
              </span>
              <h1 className="font-display text-3xl font-medium leading-tight tracking-tight md:text-4xl lg:text-5xl">
                {data.title || "Untitled post"}
              </h1>
              {data.excerpt && <p className="text-sm leading-relaxed text-[#555555]">{data.excerpt}</p>}
              <div className="flex items-center gap-4 pt-1 font-mono text-[10px] text-zinc-400">
                <span>{data.author}</span>
                <span>{data.dateLabel}</span>
                {data.readTime && <span>{data.readTime}</span>}
              </div>
            </header>

            {data.featuredImage && (
              <img
                src={data.featuredImage}
                alt={data.imageAlt || data.title}
                className="aspect-[16/9] w-full rounded-3xl bg-zinc-50 object-contain"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            )}

            {markdown ? (
              <div className="max-w-none space-y-6 border-t border-zinc-100 pt-4 font-serif text-[15px] leading-relaxed text-zinc-800 sm:text-[16px]">
                {renderMarkdown(markdown)}
              </div>
            ) : (
              <p className="py-12 text-center text-zinc-400">No content yet. Start writing in the editor.</p>
            )}
          </article>

          {data.related.length > 0 && (
            <section className="space-y-3 border-t border-zinc-100 pt-6">
              <h2 className="font-display text-xl font-medium tracking-tight">Related articles</h2>
              <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700">
                {data.related.slice(0, 3).map((r) => <li key={r.slug}>{r.title}</li>)}
              </ul>
              <p className="text-xs text-zinc-400">The article page shows the first three as cards.</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

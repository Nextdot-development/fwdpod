import { useRef, useState } from "react";
import { FileText, Upload, X, Check, Sparkles } from "lucide-react";
import { parseMarkdown, type MarkdownImport } from "@admin/lib/editor/importMarkdown";

interface Props {
  open: boolean;
  onClose: () => void;
  onImport: (result: MarkdownImport) => void;
}

const SAMPLE = `---
title: Your Blog Title
category: Enterprise AI
tags: [AI, Agents]
metaDescription: A one-line summary for search engines.
featuredImage: /blog-images/example.jpeg
imageAlt: Descriptive alt text
related: [orchestration-layer-where-multi-agent-systems-break]
---

Write your introduction here.

## First section
Some content with **bold**, *italic* and a [link](/insights/some-slug).

- point one
- point two

## FAQ
### What is this?
A short answer to the question.

### How does it work?
Another answer.

## Related
- [Another article](/insights/another-slug)
`;

/** Paste or upload a Markdown file; parse it into all blog fields at once. */
export function ImportMarkdownModal({ open, onClose, onImport }: Props) {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<MarkdownImport | null>(null);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const reparse = (v: string) => {
    setText(v);
    setParsed(v.trim() ? parseMarkdown(v) : null);
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setFileName(file.name);
    reparse(await file.text());
  };

  const apply = () => {
    if (!parsed) return;
    onImport(parsed);
    setText(""); setParsed(null); setFileName("");
    onClose();
  };

  const close = () => { onClose(); };

  const s = parsed?.stats;
  const chip = (label: string, n: number) => (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${n > 0 ? "border-accent/30 bg-accent/10 text-accent" : "border-line text-ink/40"}`}>
      {n} {label}
    </span>
  );
  const field = (label: string, val?: string) =>
    val ? (
      <div className="flex gap-2 text-xs">
        <span className="w-28 shrink-0 text-ink/40">{label}</span>
        <span className="min-w-0 flex-1 truncate text-ink/80" title={val}>{val}</span>
      </div>
    ) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 p-4 backdrop-blur-sm sm:p-8" onMouseDown={close}>
      <div className="my-auto w-full max-w-2xl rounded-2xl border border-line bg-white shadow-xl" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="inline-flex items-center gap-2 text-base font-semibold text-ink">
            <FileText size={18} /> Import from Markdown
          </h2>
          <button onClick={close} className="rounded-full p-1.5 text-ink/50 hover:bg-ink/5"><X size={18} /></button>
        </div>

        <div className="space-y-4 p-5">
          <p className="text-sm text-ink/60">
            Paste your Markdown or upload a <code className="rounded bg-ink/5 px-1">.md</code> file. Headings, links,
            lists, tables, images, a <strong>## FAQ</strong> section and a <strong>## Related</strong> section (or a
            <code className="rounded bg-ink/5 px-1">related:</code> line in frontmatter) all fill their fields automatically.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-2 text-sm font-medium text-ink hover:border-accent">
              <Upload size={15} /> Upload .md file
            </button>
            <input ref={fileRef} type="file" accept=".md,.markdown,.mdx,.txt,text/markdown" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
            {fileName && <span className="text-xs text-ink/50">{fileName}</span>}
            <button onClick={() => reparse(SAMPLE)} className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline">
              <Sparkles size={12} /> Insert sample
            </button>
          </div>

          <textarea
            value={text}
            onChange={(e) => reparse(e.target.value)}
            rows={12}
            placeholder="# My blog title&#10;&#10;Paste your Markdown here…"
            className="w-full resize-y rounded-xl border border-line bg-white px-3.5 py-3 font-mono text-xs leading-relaxed text-ink placeholder:text-ink/40 focus:border-accent focus:outline-none"
          />

          {parsed && s && (
            <div className="space-y-3 rounded-xl border border-line bg-surface p-4">
              <div className="flex flex-wrap gap-1.5">
                {chip("blocks", s.blocks)}
                {chip("headings", s.headings)}
                {chip("lists", s.lists)}
                {chip("tables", s.tables)}
                {chip("images", s.images)}
                {chip("FAQ", s.faq)}
                {chip("related", s.related)}
              </div>
              <div className="space-y-1 border-t border-line pt-3">
                {field("Title", parsed.title)}
                {field("Slug", parsed.slug)}
                {field("Category", parsed.category)}
                {field("Tags", parsed.tags.join(", "))}
                {field("Excerpt", parsed.excerpt)}
                {field("Featured image", parsed.featuredImage)}
                {field("Related slugs", parsed.related.join(", "))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-4">
          <button onClick={close} className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:border-accent">Cancel</button>
          <button
            onClick={apply}
            disabled={!parsed || parsed.stats.blocks === 0}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2 text-sm font-semibold text-paper hover:bg-ink/90 disabled:opacity-40"
          >
            <Check size={16} /> Import into editor
          </button>
        </div>
      </div>
    </div>
  );
}

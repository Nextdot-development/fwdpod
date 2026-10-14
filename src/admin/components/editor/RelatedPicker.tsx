import { useMemo, useState } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown, Search, Link2, Sparkles } from "lucide-react";
import type { RelatedOption } from "@admin/lib/editor/relatedOptions";

export type { RelatedOption };

interface Props {
  value: string[]; // ordered slugs
  onChange: (slugs: string[]) => void;
  options: RelatedOption[]; // published blogs to choose from
  onAutoFill?: () => void; // set the latest published blogs (optional)
}

/**
 * Visual picker for the optional "Related in this series" section. Stores an
 * ordered list of slugs in the existing `related_blogs` field. When empty, the
 * public page renders no Related section.
 */
export function RelatedPicker({ value, onChange, options, onAutoFill }: Props) {
  const [q, setQ] = useState("");
  const [manual, setManual] = useState("");

  const titleFor = useMemo(() => {
    const m = new Map(options.map((o) => [o.slug, o.title]));
    return (slug: string) => m.get(slug) ?? slug;
  }, [options]);
  const hintFor = useMemo(() => {
    const m = new Map(options.map((o) => [o.slug, o.hint]));
    return (slug: string) => m.get(slug);
  }, [options]);

  const available = options.filter(
    (o) => !value.includes(o.slug) && (!q || `${o.title} ${o.slug}`.toLowerCase().includes(q.toLowerCase()))
  );

  // Accept a bare slug, an /insights/slug path, or a full URL — always store a slug.
  const add = (raw: string) => {
    const s = String(raw || "").trim().replace(/[?#].*$/, "").replace(/\/+$/, "");
    const slug = s.match(/\/(?:insights|blogs?)\/([^/]+)$/)?.[1] ?? s.split("/").filter(Boolean).pop() ?? "";
    if (slug && !value.includes(slug)) onChange([...value, slug]);
  };
  const remove = (slug: string) => onChange(value.filter((s) => s !== slug));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
          <Link2 size={16} /> Related in this series <span className="font-normal text-ink/40">(optional)</span>
        </h3>
        <div className="flex items-center gap-3">
          {onAutoFill && (
            <button type="button" onClick={onAutoFill} title="Fill with the latest published blogs" className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline">
              <Sparkles size={12} /> Auto-add latest
            </button>
          )}
          <span className="text-xs text-ink/40">{value.length} selected</span>
        </div>
      </div>

      {/* Selected */}
      {value.length > 0 && (
        <ul className="mb-3 space-y-2">
          {value.map((slug, i) => (
            <li key={slug} className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2">
              <span className="min-w-0 flex-1 truncate text-sm text-ink" title={slug}>{titleFor(slug)}</span>
              {hintFor(slug) && <span className="shrink-0 text-xs text-ink/45">{hintFor(slug)}</span>}
              <span className="hidden truncate text-xs text-ink/40 sm:inline">/{slug}</span>
              <div className="flex shrink-0 items-center gap-0.5">
                <button type="button" title="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="rounded p-1 text-ink/50 hover:bg-ink/5 disabled:opacity-30"><ChevronUp size={14} /></button>
                <button type="button" title="Move down" disabled={i === value.length - 1} onClick={() => move(i, 1)} className="rounded p-1 text-ink/50 hover:bg-ink/5 disabled:opacity-30"><ChevronDown size={14} /></button>
                <button type="button" title="Remove" onClick={() => remove(slug)} className="rounded p-1 text-ink/50 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Search + add from published blogs */}
      <div className="relative mb-2">
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search published blogs to add…"
          className="w-full rounded-lg border border-line bg-white py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink/40 focus:border-accent focus:outline-none"
        />
      </div>
      {q && (
        <div className="mb-2 max-h-44 overflow-y-auto rounded-lg border border-line bg-white">
          {available.length === 0 ? (
            <p className="px-3 py-2 text-xs text-ink/40">No matching published blogs.</p>
          ) : (
            available.slice(0, 20).map((o) => (
              <button
                key={o.slug}
                type="button"
                onClick={() => { add(o.slug); setQ(""); }}
                className="block w-full truncate px-3 py-2 text-left text-sm text-ink hover:bg-accent/10"
              >
                {o.title} <span className="text-xs text-ink/40">/{o.slug}</span>
                {o.hint && <span className="ml-1 text-xs text-ink/45">· {o.hint}</span>}
              </button>
            ))
          )}
        </div>
      )}

      {/* Manual slug (e.g. an existing static blog not in the CMS) */}
      <div className="flex gap-2">
        <input
          value={manual}
          onChange={(e) => setManual(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(manual); setManual(""); } }}
          placeholder="…or add by slug (for existing static blogs)"
          className="flex-1 rounded-lg border border-line bg-white px-3 py-2 text-xs text-ink placeholder:text-ink/40 focus:border-accent focus:outline-none"
        />
        <button
          type="button"
          onClick={() => { add(manual); setManual(""); }}
          disabled={!manual.trim()}
          className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink hover:border-accent disabled:opacity-40"
        >
          <Plus size={13} /> Add
        </button>
      </div>
    </div>
  );
}

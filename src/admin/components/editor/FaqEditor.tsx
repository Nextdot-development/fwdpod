import { Plus, Trash2, ChevronUp, ChevronDown, HelpCircle } from "lucide-react";
import type { FaqItem } from "@admin/types/blog";

interface Props {
  value: FaqItem[];
  onChange: (items: FaqItem[]) => void;
}

/**
 * Visual editor for the optional FAQ section. Writes to the existing `faq`
 * field ({ q, a }[]). When empty, the public page shows no FAQ heading and no
 * FAQPage schema — so leaving it blank is a valid "no FAQ" state.
 */
export function FaqEditor({ value, onChange }: Props) {
  const update = (i: number, patch: Partial<FaqItem>) =>
    onChange(value.map((item, idx) => (idx === i ? { ...item, ...patch } : item)));
  const add = () => onChange([...value, { q: "", a: "" }]);
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
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
          <HelpCircle size={16} /> FAQ <span className="font-normal text-ink/40">(optional)</span>
        </h3>
        <span className="text-xs text-ink/40">{value.length} question{value.length === 1 ? "" : "s"}</span>
      </div>

      {value.length === 0 ? (
        <p className="mb-3 text-xs text-ink/40">No FAQ. Leave empty to omit the section entirely from the public page.</p>
      ) : (
        <div className="space-y-3">
          {value.map((item, i) => (
            <div key={i} className="rounded-xl border border-line bg-white p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-ink/50">Q{i + 1}</span>
                <div className="flex items-center gap-0.5">
                  <button type="button" title="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="rounded p-1 text-ink/50 hover:bg-ink/5 disabled:opacity-30"><ChevronUp size={14} /></button>
                  <button type="button" title="Move down" disabled={i === value.length - 1} onClick={() => move(i, 1)} className="rounded p-1 text-ink/50 hover:bg-ink/5 disabled:opacity-30"><ChevronDown size={14} /></button>
                  <button type="button" title="Remove" onClick={() => remove(i)} className="rounded p-1 text-ink/50 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              </div>
              <input
                value={item.q}
                onChange={(e) => update(i, { q: e.target.value })}
                placeholder="Question"
                className="mb-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium text-ink placeholder:text-ink/40 focus:border-accent focus:outline-none"
              />
              <textarea
                value={item.a}
                onChange={(e) => update(i, { a: e.target.value })}
                rows={3}
                placeholder="Answer (supports **bold**, *italic*, [links](/path))"
                className="w-full resize-y rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-accent focus:outline-none"
              />
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={add}
        className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-sm font-medium text-ink hover:border-accent"
      >
        <Plus size={15} /> Add Question
      </button>
    </div>
  );
}

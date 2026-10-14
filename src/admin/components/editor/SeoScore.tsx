import { Check, Sparkles, X, AlertTriangle, Info } from "lucide-react";
import type { RuleResult, ScoreResult, Suggestion } from "@admin/utils/seoScore";

const BAND = {
  good: { label: "Good", cls: "bg-green-50 text-green-700 border-green-200", bar: "bg-green-500" },
  "needs-work": { label: "Needs work", cls: "bg-amber-50 text-amber-700 border-amber-200", bar: "bg-amber-500" },
  poor: { label: "Poor", cls: "bg-red-50 text-red-600 border-red-200", bar: "bg-red-500" },
} as const;

/** Live score line under an SEO field: number, band, length vs the ideal range, Suggest. */
export function SeoFieldScore({
  result,
  lengthLabel,
  onSuggest,
}: {
  result: ScoreResult;
  /** e.g. "64 chars shown" */
  lengthLabel: string;
  onSuggest: () => void;
}) {
  const band = BAND[result.band];
  const [min, max] = result.ideal;
  const inRange = result.length >= min && result.length <= max;
  return (
    <div className="mt-2 space-y-1.5">
      <div className="h-1 w-full overflow-hidden rounded-full bg-ink/5">
        <div className={`h-full ${band.bar} transition-all`} style={{ width: `${result.score}%` }} />
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 font-semibold ${band.cls}`}>
          {result.score} · {band.label}
        </span>
        <span className={inRange ? "text-green-600" : "text-ink/50"}>
          {lengthLabel} · ideal {min}–{max}
        </span>
        <button
          type="button"
          onClick={onSuggest}
          className={`ml-auto inline-flex items-center gap-1 font-medium hover:underline ${result.score < 80 ? "text-accent" : "text-ink/40"}`}
        >
          <Sparkles size={12} /> {result.score < 80 ? "Suggest a fix" : "Suggest"}
        </button>
      </div>
      {result.needsKeyword && (
        <p className="flex items-center gap-1 text-xs text-ink/50">
          <Info size={12} /> Add a focus keyword to score keyword rules.
        </p>
      )}
    </div>
  );
}

function RuleRow({ rule }: { rule: RuleResult; key?: string }) {
  return (
    <li className="rounded-xl border border-line bg-paper p-3">
      <p className="flex items-center gap-2 text-sm font-semibold text-ink">
        <AlertTriangle size={14} className="shrink-0 text-amber-500" />
        {rule.label}
        <span className="ml-auto text-xs font-normal text-ink/40">
          {rule.points}/{rule.max} pts
        </span>
      </p>
      {rule.problem && <p className="mt-1.5 text-sm text-ink"><span className="font-medium">Problem:</span> {rule.problem}</p>}
      <p className="mt-1 text-sm text-ink/60"><span className="font-medium text-ink/70">Rule and why:</span> {rule.why}</p>
    </li>
  );
}

/**
 * The Suggest panel: each failing rule with what was measured and why it
 * matters, then rewrite options that pass the rules, each with its length and
 * a tick per rule. Clicking an option applies it.
 */
export function SeoSuggestModal({
  open,
  field,
  current,
  result,
  options,
  lengthOf,
  onApply,
  onClose,
}: {
  open: boolean;
  field: "SEO title" | "Meta description";
  current: string;
  result: ScoreResult;
  options: Suggestion[];
  /** How the option's length is described ("58 chars shown"). */
  lengthOf: (s: Suggestion) => string;
  onApply: (text: string) => void;
  onClose: () => void;
}) {
  if (!open) return null;
  const failing = result.rules.filter((r) => !r.passed && !r.skipped);
  const scoredRules = result.rules.filter((r) => !r.skipped);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 p-4 sm:p-8" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl bg-surface shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">Improve the {field.toLowerCase()}</h2>
            <p className="text-xs text-ink/50">Score {result.score}/100 · rule-based, no guessing</p>
          </div>
          <button onClick={onClose} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink/50 hover:bg-ink/5" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {current.trim() && (
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink/40">Current</p>
              <p className="rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink">{current}</p>
            </div>
          )}

          {result.needsKeyword && (
            <p className="flex items-center gap-2 rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink/60">
              <Info size={14} /> Add a focus keyword to score keyword rules. The keyword rules are left out until then.
            </p>
          )}

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink/40">
              {failing.length ? `What to fix (${failing.length})` : "Every scored rule passes"}
            </p>
            {failing.length > 0 && <ul className="space-y-2">{failing.map((r) => <RuleRow key={r.id} rule={r} />)}</ul>}
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink/40">Fix options</p>
            {options.length === 0 ? (
              <p className="text-sm text-ink/50">
                No option passes every rule yet. Fill in the title, excerpt and focus keyword, then try again.
              </p>
            ) : (
              <ul className="space-y-2">
                {options.map((o) => (
                  <li key={o.text}>
                    <button
                      type="button"
                      onClick={() => { onApply(o.text); onClose(); }}
                      className="w-full rounded-xl border border-line bg-paper p-3 text-left transition-colors hover:border-accent"
                    >
                      <p className="text-sm font-medium text-ink">{o.text}</p>
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink/50">
                        <span className="font-semibold text-green-700">{o.score}/100</span>
                        <span>{lengthOf(o)}</span>
                        {scoredRules.map((r) => (
                          <span key={r.id} className={`inline-flex items-center gap-0.5 ${o.passes.includes(r.id) ? "text-green-700" : "text-ink/30 line-through"}`}>
                            <Check size={11} /> {r.label}
                          </span>
                        ))}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

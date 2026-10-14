import type { ReactNode } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

export type ConfirmTone = "danger" | "primary" | "warning";

interface Props {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const TONE: Record<ConfirmTone, string> = {
  danger: "bg-red-600 hover:bg-red-700 text-white",
  primary: "bg-ink hover:bg-ink/90 text-paper",
  warning: "bg-amber-500 hover:bg-amber-600 text-white",
};

/** A focus-safe confirmation dialog reused for Publish / Archive / Delete / Restore. */
export function ConfirmModal({
  open, title, message, confirmLabel, cancelLabel = "Cancel", tone = "primary", busy, onConfirm, onCancel,
}: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 p-4" onClick={busy ? undefined : onCancel}>
      <div className="w-full max-w-md rounded-2xl border border-line bg-paper p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 rounded-full p-2 ${tone === "danger" ? "bg-red-50 text-red-600" : tone === "warning" ? "bg-amber-50 text-amber-600" : "bg-ink/5 text-ink"}`}>
            <AlertTriangle size={18} />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
            <div className="mt-1.5 text-sm text-ink/70">{message}</div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={busy}
            className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:border-accent disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-60 ${TONE[tone]}`}
          >
            {busy && <Loader2 size={15} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { X, History, RotateCcw, Loader2 } from "lucide-react";
import { useBlogHistory } from "@admin/hooks/useBlogHistory";
import { StatusBadge } from "@admin/components/StatusBadge";
import { ConfirmModal } from "@admin/components/ConfirmModal";
import { formatDateTime } from "@admin/utils/date";
import type { BlogVersion } from "@admin/types/blog";

interface Props {
  open: boolean;
  blogId: string | undefined;
  currentVersion: number;
  onClose: () => void;
  onRestore: (version: BlogVersion) => Promise<void>;
}

/** Lists a blog's saved versions and restores a chosen one. */
export function VersionHistoryModal({ open, blogId, currentVersion, onClose, onRestore }: Props) {
  const { versions, loading, error } = useBlogHistory(open ? blogId : undefined);
  const [confirming, setConfirming] = useState<BlogVersion | null>(null);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const doRestore = async () => {
    if (!confirming) return;
    setBusy(true);
    try {
      await onRestore(confirming);
      setConfirming(null);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onClick={onClose}>
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-line bg-paper shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h3 className="inline-flex items-center gap-2 font-display text-lg font-semibold text-ink"><History size={18} /> Version History</h3>
          <button onClick={onClose} className="rounded-full p-1.5 text-ink/50 hover:bg-ink/5"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <p className="mb-3 px-1 text-xs text-ink/50">Current version: v{currentVersion}. Restoring saves the current state as a new version first, so nothing is lost.</p>
          {loading ? (
            <p className="py-10 text-center text-sm text-ink/50">Loading history…</p>
          ) : error ? (
            <p className="py-10 text-center text-sm text-red-600">{error}</p>
          ) : versions.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink/40">No saved versions yet. Each explicit save creates one.</p>
          ) : (
            <ul className="space-y-2">
              {versions.map((v) => (
                <li key={v.id} className="flex items-center justify-between rounded-xl border border-line bg-surface px-4 py-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-ink">v{v.version}</span>
                      <StatusBadge status={v.status} />
                    </div>
                    <p className="mt-0.5 truncate text-xs text-ink/50">{formatDateTime(v.editedAt)} · {v.editedBy}</p>
                  </div>
                  <button
                    onClick={() => setConfirming(v)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink hover:border-accent"
                  >
                    <RotateCcw size={13} /> Restore
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ConfirmModal
        open={Boolean(confirming)}
        title={`Restore version v${confirming?.version}?`}
        message="This replaces the current editor content with that version. The present state is snapshotted first, so you can undo the restore."
        confirmLabel={busy ? "Restoring…" : "Restore version"}
        tone="warning"
        busy={busy}
        onConfirm={doRestore}
        onCancel={() => setConfirming(null)}
      />
      {busy && <div className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center"><Loader2 className="animate-spin text-paper" /></div>}
    </div>
  );
}

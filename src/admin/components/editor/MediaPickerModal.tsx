import { useRef, useState } from "react";
import { X, UploadCloud, Search, Loader2 } from "lucide-react";
import { useMedia } from "@admin/hooks/useMedia";
import { uploadImage } from "@admin/services/media";
import type { MediaItem } from "@admin/types/media";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (item: MediaItem) => void;
  title?: string;
}

export function MediaPickerModal({ open, onClose, onSelect, title = "Insert image" }: Props) {
  const { items, loading, error } = useMedia();
  const [q, setQ] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const doUpload = async (files: FileList | File[]) => {
    const images = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!images.length) return;
    setUploadError("");
    setUploading(true);
    try {
      let last: MediaItem | null = null;
      for (const file of images) {
        last = await uploadImage(file, { onProgress: setProgress });
      }
      // Auto-select the most recent upload for a one-click flow.
      if (last) {
        onSelect(last);
        onClose();
      }
    } catch (e) {
      setUploadError((e as Error).message || "Upload failed. Check Storage rules.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const filtered = items.filter(
    (m) => !q || m.name.toLowerCase().includes(q.toLowerCase()) || (m.alt ?? "").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-line bg-paper shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1.5 text-ink/50 hover:bg-ink/5"><X size={18} /></button>
        </div>

        <div className="flex items-center gap-2 border-b border-line px-5 py-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search images…"
              className="w-full rounded-lg border border-line bg-white py-2 pl-9 pr-3 text-sm focus:border-accent focus:outline-none"
            />
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper hover:bg-ink/90 disabled:opacity-60"
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
            {uploading ? `Uploading ${progress}%` : "Upload"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => e.target.files && doUpload(e.target.files)}
          />
        </div>

        {uploadError && <p className="px-5 pt-3 text-sm text-red-600">{uploadError}</p>}

        <div
          className={`flex-1 overflow-y-auto p-5 ${dragging ? "bg-accent/5" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files.length) doUpload(e.dataTransfer.files); }}
        >
          {loading ? (
            <p className="py-12 text-center text-sm text-ink/50">Loading library…</p>
          ) : error ? (
            <p className="py-12 text-center text-sm text-red-600">Could not load media: {error}</p>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-ink/40">
              <UploadCloud size={28} className="mx-auto mb-3 text-ink/30" />
              Drag &amp; drop images here, or use Upload. No images yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {filtered.map((m) => (
                <button
                  key={m.id}
                  onClick={() => { onSelect(m); onClose(); }}
                  className="group overflow-hidden rounded-xl border border-line bg-surface text-left transition-colors hover:border-accent"
                >
                  <div className="aspect-video overflow-hidden bg-ink/5">
                    <img src={m.url} alt={m.alt || m.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                  </div>
                  <p className="truncate px-2 py-1.5 text-xs text-ink/60">{m.name}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

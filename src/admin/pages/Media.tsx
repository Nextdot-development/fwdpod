import type { ReactNode } from "react";
import { useRef, useState } from "react";
import { UploadCloud, Search, Loader2, Copy, Check, Trash2, Repeat, Eye, X } from "lucide-react";
import { AdminLayout } from "@admin/components/AdminLayout";
import { useMedia } from "@admin/hooks/useMedia";
import { uploadImage, deleteMedia, replaceMedia, updateMediaMeta } from "@admin/services/media";
import type { MediaItem } from "@admin/types/media";

function formatBytes(n: number): string {
  if (!n) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export default function Media() {
  const { items, loading, error } = useMedia();
  const [q, setQ] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [msg, setMsg] = useState("");
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [preview, setPreview] = useState<MediaItem | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const replaceTarget = useRef<MediaItem | null>(null);

  const doUpload = async (files: FileList | File[]) => {
    const images = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!images.length) return;
    setMsg("");
    setUploading(true);
    try {
      for (const file of images) await uploadImage(file, { onProgress: setProgress });
    } catch (e) {
      setMsg((e as Error).message || "Upload failed. Check Storage rules.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const copyUrl = async (item: MediaItem) => {
    await navigator.clipboard.writeText(item.url).catch(() => {});
    setCopied(item.id ?? item.url);
    setTimeout(() => setCopied(null), 1500);
  };

  const remove = async (item: MediaItem) => {
    if (!window.confirm(`Delete "${item.name}"? This removes it from Storage permanently.`)) return;
    setBusy(item.id ?? "");
    try {
      await deleteMedia(item);
      if (preview?.id === item.id) setPreview(null);
    } finally {
      setBusy(null);
    }
  };

  const startReplace = (item: MediaItem) => {
    replaceTarget.current = item;
    replaceRef.current?.click();
  };

  const onReplaceFile = async (file: File) => {
    const target = replaceTarget.current;
    if (!target) return;
    setBusy(target.id ?? "");
    try {
      await replaceMedia(target, file);
    } catch (e) {
      setMsg((e as Error).message || "Replace failed.");
    } finally {
      setBusy(null);
      replaceTarget.current = null;
    }
  };

  const filtered = items.filter(
    (m) => !q || m.name.toLowerCase().includes(q.toLowerCase()) || (m.alt ?? "").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <AdminLayout
      title="Media Library"
      action={
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper hover:bg-ink/90 disabled:opacity-60"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
          {uploading ? `Uploading ${progress}%` : "Upload"}
        </button>
      }
    >
      <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && doUpload(e.target.files)} />
      <input ref={replaceRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onReplaceFile(e.target.files[0])} />

      {msg && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{msg}</div>}

      <div className="mb-5 flex max-w-md items-center">
        <div className="relative w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or alt text…"
            className="w-full rounded-lg border border-line bg-white py-2 pl-9 pr-3 text-sm focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div
        className={`rounded-2xl border-2 border-dashed p-4 transition-colors ${dragging ? "border-accent bg-accent/5" : "border-line"}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files.length) doUpload(e.dataTransfer.files); }}
      >
        {loading ? (
          <p className="py-12 text-center text-sm text-ink/50">Loading library…</p>
        ) : error ? (
          <p className="py-12 text-center text-sm text-red-600">Could not load media: {error}. Check that the schema has been run and this account is in admin_users.</p>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-ink/40">
            <UploadCloud size={30} className="mx-auto mb-3 text-ink/30" />
            {q ? "No images match your search." : "Drag & drop images here, or use Upload. No images yet."}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((m) => (
              <div key={m.id} className="group overflow-hidden rounded-xl border border-line bg-surface">
                <button onClick={() => setPreview(m)} className="block aspect-video w-full overflow-hidden bg-ink/5">
                  <img src={m.url} alt={m.alt || m.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                </button>
                <div className="p-2.5">
                  <p className="truncate text-xs font-medium text-ink" title={m.name}>{m.name}</p>
                  <p className="mt-0.5 text-[11px] text-ink/40">{m.width && m.height ? `${m.width}×${m.height} · ` : ""}{formatBytes(m.size)}</p>
                  <div className="mt-2 flex items-center gap-1">
                    <IconBtn title="Copy URL" onClick={() => copyUrl(m)}>{copied === (m.id ?? m.url) ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}</IconBtn>
                    <IconBtn title="Preview" onClick={() => setPreview(m)}><Eye size={14} /></IconBtn>
                    <IconBtn title="Replace" onClick={() => startReplace(m)} disabled={busy === m.id}><Repeat size={14} /></IconBtn>
                    <IconBtn title="Delete" onClick={() => remove(m)} disabled={busy === m.id} danger>{busy === m.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}</IconBtn>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {preview && <PreviewPanel item={preview} onClose={() => setPreview(null)} onCopy={() => copyUrl(preview)} copied={copied === (preview.id ?? preview.url)} />}
    </AdminLayout>
  );
}

function IconBtn({ title, onClick, children, disabled, danger }: { title: string; onClick: () => void; children: ReactNode; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors disabled:opacity-40 ${danger ? "text-ink/60 hover:bg-red-50 hover:text-red-600" : "text-ink/60 hover:bg-ink/5"}`}
    >
      {children}
    </button>
  );
}

function PreviewPanel({ item, onClose, onCopy, copied }: { item: MediaItem; onClose: () => void; onCopy: () => void; copied: boolean }) {
  const [alt, setAlt] = useState(item.alt ?? "");
  const [caption, setCaption] = useState(item.caption ?? "");
  const [saved, setSaved] = useState(false);

  const saveMeta = async () => {
    if (!item.id) return;
    await updateMediaMeta(item.id, { alt, caption });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" onClick={onClose}>
      <div className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-paper shadow-xl md:flex-row" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-1 items-center justify-center bg-ink/5 p-4">
          <img src={item.url} alt={item.alt || item.name} className="max-h-[70vh] w-auto max-w-full object-contain" />
        </div>
        <div className="w-full space-y-3 border-t border-line p-5 md:w-80 md:border-l md:border-t-0">
          <div className="flex items-center justify-between">
            <h3 className="truncate font-display text-base font-semibold text-ink" title={item.name}>{item.name}</h3>
            <button onClick={onClose} className="rounded-full p-1 text-ink/50 hover:bg-ink/5"><X size={18} /></button>
          </div>
          <p className="text-xs text-ink/50">{item.width && item.height ? `${item.width}×${item.height} px · ` : ""}{formatBytes(item.size)}</p>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink">Image URL</label>
            <div className="flex gap-1.5">
              <input readOnly value={item.url} className="w-full truncate rounded-md border border-line bg-white px-2 py-1.5 text-xs text-ink/70" />
              <button onClick={onCopy} className="shrink-0 rounded-md border border-line px-2 hover:border-accent" title="Copy URL">
                {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink">ALT text</label>
            <input value={alt} onChange={(e) => setAlt(e.target.value)} className="w-full rounded-md border border-line bg-white px-2.5 py-1.5 text-sm focus:border-accent focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink">Caption</label>
            <input value={caption} onChange={(e) => setCaption(e.target.value)} className="w-full rounded-md border border-line bg-white px-2.5 py-1.5 text-sm focus:border-accent focus:outline-none" />
          </div>
          <button onClick={saveMeta} className="w-full rounded-full bg-ink py-2 text-sm font-semibold text-paper hover:bg-ink/90">
            {saved ? "Saved ✓" : "Save metadata"}
          </button>
        </div>
      </div>
    </div>
  );
}

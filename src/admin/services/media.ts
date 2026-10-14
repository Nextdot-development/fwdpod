import { supabase, channelName } from "@admin/supabase/config";
import { Timestamp } from "@admin/lib/time";
import type { MediaItem, MediaInput } from "@admin/types/media";

const TABLE = "media";
const BUCKET = "blog-images";
const bucket = () => supabase.storage.from(BUCKET);

/** Slugify a filename while preserving its extension. */
function safeName(name: string): string {
  const dot = name.lastIndexOf(".");
  const base = (dot > 0 ? name.slice(0, dot) : name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "image";
  const ext = (dot > 0 ? name.slice(dot + 1) : "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${base}.${ext || "jpg"}`;
}

/** Read pixel dimensions of an image File in the browser (0×0 on failure). */
function readDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { resolve({ width: img.naturalWidth, height: img.naturalHeight }); URL.revokeObjectURL(url); };
    img.onerror = () => { resolve({ width: 0, height: 0 }); URL.revokeObjectURL(url); };
    img.src = url;
  });
}

function rowToMedia(r: Record<string, unknown>): MediaItem {
  return {
    id: r.id as string,
    url: (r.url as string) ?? "",
    path: (r.path as string) ?? "",
    name: (r.name as string) ?? "",
    alt: (r.alt as string) ?? "",
    caption: (r.caption as string) ?? "",
    size: (r.size as number) ?? 0,
    contentType: (r.content_type as string) ?? "",
    width: (r.width as number) ?? 0,
    height: (r.height as number) ?? 0,
    createdAt: Timestamp.fromISO(r.created_at as string | null),
  };
}

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = /^image\/(png|jpe?g|webp|gif|avif|svg\+xml)$/i;

export interface UploadOptions {
  alt?: string;
  caption?: string;
  onProgress?: (percent: number) => void;
}

/**
 * Upload an image to Supabase Storage (blog-images) and index it in the `media`
 * table. Returns the created MediaItem. Stores the public URL for use in blogs.
 */
export async function uploadImage(file: File, opts: UploadOptions = {}): Promise<MediaItem> {
  if (!ALLOWED.test(file.type)) throw new Error("Unsupported image type. Use PNG, JPEG, WebP, GIF, AVIF or SVG.");
  if (file.size > MAX_BYTES) throw new Error("Image is larger than 10 MB.");

  const stamp = `${Math.floor(performance.timeOrigin + performance.now())}`;
  const path = `${stamp}-${safeName(file.name)}`;
  const { width, height } = await readDimensions(file);

  const { error: upErr } = await bucket().upload(path, file, { contentType: file.type, upsert: false });
  if (upErr) throw new Error(upErr.message);
  opts.onProgress?.(100);

  const url = bucket().getPublicUrl(path).data.publicUrl;
  const input: MediaInput = {
    url,
    path,
    name: file.name,
    alt: opts.alt ?? "",
    caption: opts.caption ?? "",
    size: file.size,
    contentType: file.type || "image/jpeg",
    width,
    height,
  };
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      url: input.url, path: input.path, name: input.name, alt: input.alt, caption: input.caption,
      size: input.size, content_type: input.contentType, width: input.width, height: input.height,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return { id: data.id as string, ...input, createdAt: null };
}

/** Realtime subscription to the media library, newest first. Returns unsubscribe. */
export function subscribeMedia(
  onData: (items: MediaItem[]) => void,
  onError?: (err: Error) => void
) {
  let cancelled = false;
  const load = async () => {
    const { data, error } = await supabase.from(TABLE).select("*").order("created_at", { ascending: false });
    if (cancelled) return;
    if (error) onError?.(new Error(error.message));
    else onData((data ?? []).map(rowToMedia));
  };
  load();
  const channel = supabase
    .channel(channelName("media-changes"))
    .on("postgres_changes", { event: "*", schema: "public", table: TABLE }, load)
    .subscribe();
  return () => {
    cancelled = true;
    supabase.removeChannel(channel);
  };
}

/** Update editable metadata (alt / caption) on a media item. */
export async function updateMediaMeta(
  id: string,
  patch: Partial<Pick<MediaItem, "alt" | "caption">>
): Promise<void> {
  const { error } = await supabase.from(TABLE).update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

/** Delete an image from Storage and its media row. */
export async function deleteMedia(item: MediaItem): Promise<void> {
  if (item.path) await bucket().remove([item.path]).catch(() => {});
  if (item.id) {
    const { error } = await supabase.from(TABLE).delete().eq("id", item.id);
    if (error) throw new Error(error.message);
  }
}

/**
 * Replace the binary of an existing media item with a new file, keeping the same
 * media row (so blogs referencing its id stay linked). The old object is removed
 * and the row's url/path/size are updated.
 */
export async function replaceMedia(item: MediaItem, file: File): Promise<MediaItem> {
  const uploaded = await uploadImage(file, { alt: item.alt, caption: item.caption });
  if (item.id) {
    await supabase.from(TABLE).update({
      url: uploaded.url, path: uploaded.path, name: uploaded.name, size: uploaded.size,
      content_type: uploaded.contentType, width: uploaded.width, height: uploaded.height,
    }).eq("id", item.id);
  }
  // Remove the freshly-created duplicate row and the old binary.
  if (uploaded.id) await supabase.from(TABLE).delete().eq("id", uploaded.id);
  if (item.path) await bucket().remove([item.path]).catch(() => {});
  return { ...item, url: uploaded.url, path: uploaded.path, name: uploaded.name, size: uploaded.size, width: uploaded.width, height: uploaded.height };
}

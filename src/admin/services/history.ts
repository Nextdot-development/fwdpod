import { supabase, channelName } from "@admin/supabase/config";
import { Timestamp } from "@admin/lib/time";
import type { BlogDoc, BlogVersion } from "@admin/types/blog";

const TABLE = "blog_versions";

/** Strip server-managed fields to obtain the editable payload for a snapshot. */
export function toVersionData(b: BlogDoc): BlogVersion["data"] {
  const { id, createdAt, updatedAt, publishedAt, createdBy, updatedBy, version, ...data } = b;
  void id; void createdAt; void updatedAt; void publishedAt; void createdBy; void updatedBy; void version;
  return data;
}

/** Persist a snapshot of the blog's state before it is overwritten. */
export async function addVersionSnapshot(blogId: string, source: BlogDoc): Promise<void> {
  const { error } = await supabase.from(TABLE).insert({
    blog_id: blogId,
    version: source.version ?? 1,
    edited_by: source.updatedBy || source.createdBy || "unknown",
    status: source.status,
    title: source.title,
    data: toVersionData(source), // jsonb; publishAt serialises to an ISO string
  });
  if (error) throw new Error(error.message);
}

function rowToVersion(r: Record<string, unknown>): BlogVersion {
  const raw = (r.data ?? {}) as Record<string, unknown>;
  // Rehydrate the stored ISO string back into a Timestamp for the editor.
  const publishAt = Timestamp.fromISO((raw.publishAt as string | null) ?? null);
  return {
    id: r.id as string,
    version: (r.version as number) ?? 1,
    editedBy: (r.edited_by as string) ?? "",
    editedAt: Timestamp.fromISO(r.edited_at as string | null),
    status: r.status as BlogVersion["status"],
    title: (r.title as string) ?? "",
    data: { ...(raw as unknown as BlogVersion["data"]), publishAt },
  };
}

/** Realtime list of a blog's versions, newest first. Returns unsubscribe. */
export function subscribeHistory(
  blogId: string,
  onData: (versions: BlogVersion[]) => void,
  onError?: (err: Error) => void
) {
  let cancelled = false;
  const load = async () => {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("blog_id", blogId)
      .order("version", { ascending: false });
    if (cancelled) return;
    if (error) onError?.(new Error(error.message));
    else onData((data ?? []).map(rowToVersion));
  };
  load();
  const channel = supabase
    .channel(channelName(`history-${blogId}`))
    .on("postgres_changes", { event: "*", schema: "public", table: TABLE, filter: `blog_id=eq.${blogId}` }, load)
    .subscribe();
  return () => {
    cancelled = true;
    supabase.removeChannel(channel);
  };
}

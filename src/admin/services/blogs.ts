import { supabase, channelName } from "@admin/supabase/config";
import { Timestamp } from "@admin/lib/time";
import type { BlogBlock, BlogDoc, BlogInput, BlogStatus, FaqItem } from "@admin/types/blog";
import { addVersionSnapshot } from "@admin/services/history";

const TABLE = "blogs";

// ---------------------------------------------------------------------------
// Row <-> BlogDoc mapping (snake_case DB columns <-> camelCase app model)
// ---------------------------------------------------------------------------
type Row = Record<string, unknown>;

function rowToBlog(r: Row): BlogDoc {
  return {
    id: r.id as string,
    title: (r.title as string) ?? "",
    slug: (r.slug as string) ?? "",
    excerpt: (r.excerpt as string) ?? "",
    content: (r.content as BlogBlock[]) ?? [],
    featuredImage: (r.featured_image as string) ?? "",
    imageAlt: (r.image_alt as string) ?? "",
    category: (r.category as string) ?? "",
    tags: (r.tags as string[]) ?? [],
    seoTitle: (r.seo_title as string) ?? "",
    metaDescription: (r.meta_description as string) ?? "",
    focusKeyword: (r.focus_keyword as string) ?? "",
    readTime: (r.read_time as string) ?? "",
    author: (r.author as string) ?? "",
    status: (r.status as BlogStatus) ?? "draft",
    publishAt: Timestamp.fromISO(r.publish_at as string | null),
    publishedAt: Timestamp.fromISO(r.published_at as string | null),
    timeZone: (r.time_zone as string) ?? "Asia/Kolkata",
    createdAt: Timestamp.fromISO(r.created_at as string | null),
    updatedAt: Timestamp.fromISO(r.updated_at as string | null),
    createdBy: (r.created_by as string) ?? "",
    updatedBy: (r.updated_by as string) ?? "",
    version: (r.version as number) ?? 1,
    relatedBlogs: (r.related_blogs as string[]) ?? [],
    redirectFrom: (r.redirect_from as string[]) ?? [],
    faq: (r.faq as FaqItem[]) ?? [],
    canonicalUrl: (r.canonical_url as string) ?? "",
    ogImage: (r.og_image as string) ?? "",
    twitterImage: (r.twitter_image as string) ?? "",
  };
}

/** Editable BlogInput -> DB column payload (content/faq/tags stored as jsonb). */
function blogToRow(input: BlogInput): Row {
  return {
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt,
    content: input.content,
    featured_image: input.featuredImage,
    image_alt: input.imageAlt,
    category: input.category,
    tags: input.tags,
    seo_title: input.seoTitle,
    meta_description: input.metaDescription,
    focus_keyword: input.focusKeyword,
    read_time: input.readTime,
    author: input.author,
    status: input.status,
    publish_at: input.publishAt ? input.publishAt.toISOString() : null,
    time_zone: input.timeZone,
    related_blogs: input.relatedBlogs,
    redirect_from: input.redirectFrom,
    faq: input.faq,
    canonical_url: input.canonicalUrl,
    og_image: input.ogImage,
    twitter_image: input.twitterImage,
  };
}

// ---------------------------------------------------------------------------
// Reads (initial fetch + realtime refresh)
// ---------------------------------------------------------------------------
async function fetchBlogs(): Promise<BlogDoc[]> {
  // Newest publish date first; drafts (no date) after, most recently edited first.
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("publish_at", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToBlog);
}

/**
 * Realtime subscription to all blogs (newest publish date first). Does an initial
 * fetch, then refetches whenever the table changes. Returns an unsubscribe fn.
 */
export function subscribeBlogs(
  onData: (blogs: BlogDoc[]) => void,
  onError?: (err: Error) => void
) {
  let cancelled = false;
  const load = () => fetchBlogs().then((b) => !cancelled && onData(b)).catch((e) => !cancelled && onError?.(e as Error));
  load();
  const channel = supabase
    .channel(channelName("blogs-changes"))
    .on("postgres_changes", { event: "*", schema: "public", table: TABLE }, load)
    .subscribe();
  return () => {
    cancelled = true;
    supabase.removeChannel(channel);
  };
}

export async function getBlog(id: string): Promise<BlogDoc | null> {
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? rowToBlog(data) : null;
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------
export async function createBlog(input: BlogInput, actor: string): Promise<string> {
  const payload = {
    ...blogToRow(input),
    created_by: actor,
    updated_by: actor,
    version: 1,
    published_at: input.status === "published" ? new Date().toISOString() : null,
  };
  const { data, error } = await supabase.from(TABLE).insert(payload).select("id").single();
  if (error) throw new Error(error.message);
  return data.id as string;
}

/**
 * Update a blog.
 *  - version=true  (explicit Save/Publish/Schedule): snapshots the previous
 *    state to history, bumps `version`, and sets published_at on first publish.
 *  - version=false (autosave): a light write of the editable fields only.
 */
export async function updateBlog(
  id: string,
  input: BlogInput,
  actor: string,
  { version = true }: { version?: boolean } = {}
): Promise<void> {
  if (!version) {
    const { error } = await supabase.from(TABLE).update({ ...blogToRow(input), updated_by: actor }).eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }

  const current = await getBlog(id);
  if (current) await addVersionSnapshot(id, current);
  const nextVersion = (current?.version ?? 0) + 1;
  const newlyPublished = input.status === "published" && !current?.publishedAt;

  const { error } = await supabase
    .from(TABLE)
    .update({
      ...blogToRow(input),
      updated_by: actor,
      version: nextVersion,
      ...(newlyPublished ? { published_at: new Date().toISOString() } : {}),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

/**
 * Transition a blog's status (list quick-actions: Publish / Archive /
 * Unarchive). Snapshots + bumps version. Publishing a post that is already
 * live keeps its original publish date, so its date and sitemap entry do not
 * jump; anything else publishes as of now.
 */
export async function transitionStatus(id: string, status: BlogStatus, actor: string): Promise<void> {
  const current = await getBlog(id);
  if (!current) return;
  await addVersionSnapshot(id, current);

  const patch: Row = { status, updated_by: actor, version: (current.version ?? 0) + 1 };
  if (status === "published") {
    const now = new Date().toISOString();
    if (!current.publishedAt) patch.published_at = now;
    if (!isLive(current)) patch.publish_at = now;
  }
  if (status === "draft") patch.publish_at = null;
  const { error } = await supabase.from(TABLE).update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteBlog(id: string): Promise<void> {
  // blog_versions rows cascade-delete via the FK.
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Clone a blog as a fresh draft (version 1, cleared schedule/publish stamps). */
export async function duplicateBlog(id: string, actor: string): Promise<string | null> {
  const source = await getBlog(id);
  if (!source) return null;
  const {
    id: _id, createdAt: _c, updatedAt: _u, publishedAt: _p,
    createdBy: _cb, updatedBy: _ub, version: _v, ...rest
  } = source;
  void _id; void _c; void _u; void _p; void _cb; void _ub; void _v;
  return createBlog(
    { ...rest, title: `${source.title} (Copy)`, slug: `${source.slug}-copy`, status: "draft", publishAt: null, redirectFrom: [] },
    actor
  );
}

/**
 * True when the post is public right now. Mirrors public.blog_is_public() in
 * the database, which is what actually decides; this copy only drives the
 * admin UI (badges, the slug lock, keeping the publish date on re-publish).
 */
export function isLive(b: Pick<BlogDoc, "status" | "publishAt">): boolean {
  return b.status === "published" || (b.status === "scheduled" && !!b.publishAt && b.publishAt.toMillis() <= Date.now());
}

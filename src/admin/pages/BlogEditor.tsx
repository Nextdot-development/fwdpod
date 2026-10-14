import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Timestamp } from "@admin/lib/time";
import {
  Save, Send, CalendarClock, ArrowLeft, ImagePlus, Eye, Sparkles, AlertTriangle,
  History, Archive, ArchiveRestore, Trash2, Check, Loader2, CircleDot, FileText,
} from "lucide-react";
import { AdminLayout } from "@admin/components/AdminLayout";
import { RichTextEditor } from "@admin/components/editor/RichTextEditor";
import { MediaPickerModal } from "@admin/components/editor/MediaPickerModal";
import { BlogPreviewModal } from "@admin/components/preview/BlogPreviewModal";
import { ConfirmModal } from "@admin/components/ConfirmModal";
import { VersionHistoryModal } from "@admin/components/VersionHistoryModal";
import { FaqEditor } from "@admin/components/editor/FaqEditor";
import { RelatedPicker } from "@admin/components/editor/RelatedPicker";
import { ImportMarkdownModal } from "@admin/components/editor/ImportMarkdownModal";
import { buildRelatedOptions } from "@admin/lib/editor/relatedOptions";
import type { MarkdownImport } from "@admin/lib/editor/importMarkdown";
import { SeoFieldScore, SeoSuggestModal } from "@admin/components/editor/SeoScore";
import { STATIC_BLOG_INDEX } from "@admin/data/staticBlogsIndex";
import { useAuth } from "@admin/hooks/useAuth";
import { useCategories } from "@admin/hooks/useCategories";
import { useBlogs } from "@admin/hooks/useBlogs";
import { createBlog, updateBlog, getBlog, deleteBlog, isLive } from "@admin/services/blogs";
import { slugify, blogCanonicalUrl } from "@admin/utils/slug";
import { suggestImageAlt, readTimeFromBlocks } from "@admin/utils/suggest";
import {
  TITLE_SUFFIX, scoreSeoTitle, scoreMetaDescription, suggestSeoTitles, suggestMetaDescriptions, type SeoContext,
} from "@admin/utils/seoScore";
import { findExternalLinks, type CmsBlock } from "../../cms/cmsPost";
import { TIME_ZONES, DEFAULT_TIME_ZONE, zonedInputsToDate, dateToZonedInputs, formatInZone, timeAgo } from "@admin/utils/timezone";
import type { BlogBlock, BlogDoc, BlogInput, BlogStatus, BlogVersion, FaqItem } from "@admin/types/blog";
import type { MediaItem } from "@admin/types/media";

const DEFAULT_AUTHOR = "Fwdpod";
const AUTOSAVE_MS = 30_000;

// A ready-to-edit article skeleton so a new blog never opens blank. Every block
// is editable/removable — the user is not forced to keep any of these.
const STARTER_TEMPLATE: BlogBlock[] = [
  { type: "p", text: "Write your introduction here — set up the problem and why it matters." },
  { type: "h2", text: "First section heading" },
  { type: "p", text: "Write this section's content here." },
  { type: "h2", text: "Second section heading" },
  { type: "p", text: "Write this section's content here." },
  { type: "h3", text: "A subheading" },
  { type: "p", text: "Write the subsection content here." },
];
const inputClass =
  "w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-accent focus:outline-none";
const labelClass = "mb-1.5 block text-sm font-medium text-ink";

function Field({ label, hint, children, action }: { label: string; hint?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className={labelClass}>{label}{hint && <span className="ml-2 text-xs font-normal text-ink/40">{hint}</span>}</label>
        {action}
      </div>
      {children}
    </div>
  );
}

function SuggestBtn({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="mb-1.5 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline">
      <Sparkles size={12} /> Suggest
    </button>
  );
}

type SaveState = "idle" | "saving" | "saved" | "error";
type ConfirmKind = null | "publish" | "archive" | "delete" | "unlock-slug";

export default function BlogEditor() {
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const actor = user?.email ?? user?.uid ?? "unknown";
  const { names: categoryNames } = useCategories();

  // Identity — docId is created on first save so autosave can keep updating.
  const [docId, setDocId] = useState<string | undefined>(routeId);
  const isEdit = Boolean(routeId);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [author, setAuthor] = useState(DEFAULT_AUTHOR);
  const [featuredImage, setFeaturedImage] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [suggestFor, setSuggestFor] = useState<null | "title" | "description">(null);
  // URL changes after a post goes live: the slug it went live with, earlier
  // slugs (301'd to the current one) and whether the author unlocked editing.
  const [liveSlug, setLiveSlug] = useState("");
  const [redirectFrom, setRedirectFrom] = useState<string[]>([]);
  const [slugUnlocked, setSlugUnlocked] = useState(false);
  const [readTime, setReadTime] = useState("");
  const [readTimeTouched, setReadTimeTouched] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState<BlogBlock[]>(routeId ? [] : STARTER_TEMPLATE);
  const [faq, setFaq] = useState<FaqItem[]>([]);
  const [relatedBlogs, setRelatedBlogs] = useState<string[]>([]);

  // Editorial picker options: EVERY CMS blog (published / scheduled / draft /
  // archived) + all legacy static articles, searchable by title or slug. Public
  // visibility is enforced separately at render time.
  const { blogs } = useBlogs();
  const relatedOptions = useMemo(
    () => buildRelatedOptions(blogs, STATIC_BLOG_INDEX, docId),
    [blogs, docId]
  );
  const relatedForPreview = useMemo(() => {
    const titleFor = new Map(relatedOptions.map((o) => [o.slug, o.title]));
    return relatedBlogs.map((slug) => ({ slug, title: titleFor.get(slug) ?? slug }));
  }, [relatedBlogs, relatedOptions]);

  // The latest 4 published OR scheduled blogs in the SAME category (newest
  // first, excluding this one) — used to auto-fill "Related in this series" so a
  // new post links back to the recent posts of its category, including ones
  // scheduled for the future (a series posted together). Falls back to all
  // categories when none is chosen yet.
  const latestCategorySlugs = useMemo(() => {
    const ms = (b: BlogDoc) => b.publishAt?.toMillis() ?? b.publishedAt?.toMillis() ?? b.createdAt?.toMillis() ?? 0;
    const cms = blogs
      .filter((b) => (b.status === "published" || b.status === "scheduled") && b.slug && b.id !== docId && (!category || b.category === category))
      .map((b) => ({ slug: b.slug, ms: ms(b) }));
    const cmsSlugs = new Set(cms.map((c) => c.slug));
    // Markdown articles are always published; they count as series posts too.
    const markdown = STATIC_BLOG_INDEX
      .filter((p) => !cmsSlugs.has(p.slug) && (!category || p.category === category))
      .map((p) => ({ slug: p.slug, ms: p.isoDate ? Date.parse(`${p.isoDate}T00:00:00Z`) : 0 }));
    return [...cms, ...markdown]
      .sort((a, b) => b.ms - a.ms)
      .slice(0, 4)
      .map((b) => b.slug);
  }, [blogs, docId, category]);
  const [contentKey, setContentKey] = useState(0); // remounts the editor on load/restore

  // Workflow state
  const [status, setStatus] = useState<BlogStatus>("draft");
  const [publishAtTs, setPublishAtTs] = useState<Timestamp | null>(null);
  const [schedDate, setSchedDate] = useState("");
  const [schedTime, setSchedTime] = useState("");
  const [schedZone, setSchedZone] = useState(DEFAULT_TIME_ZONE);
  const [version, setVersion] = useState(0);

  const [loading, setLoading] = useState(isEdit);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [featuredPicker, setFeaturedPicker] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmKind>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [, forceTick] = useState(0); // re-render the "saved Xs ago" label

  const editorReady = useRef(false);
  const lastSavedSig = useRef("");

  const effectiveSlug = useMemo(() => (slugTouched ? slug : slugify(title)), [slug, slugTouched, title]);
  // Live posts keep their URL unless the author explicitly unlocks it.
  const live = isLive({ status, publishAt: publishAtTs });
  const slugLocked = Boolean(liveSlug) && !slugUnlocked;

  // A signature of every editable field, used for dirty detection + autosave.
  const signature = useMemo(
    () => JSON.stringify({ title, slug: effectiveSlug, excerpt, content, featuredImage, imageAlt, category, tags, seoTitle, metaDescription, focusKeyword, readTime, author, status, schedDate, schedTime, schedZone, faq, relatedBlogs }),
    [title, effectiveSlug, excerpt, content, featuredImage, imageAlt, category, tags, seoTitle, metaDescription, focusKeyword, readTime, author, status, schedDate, schedTime, schedZone, faq, relatedBlogs]
  );
  const dirty = editorReady.current && signature !== lastSavedSig.current;

  // Load existing blog.
  useEffect(() => {
    if (!isEdit || !routeId) {
      editorReady.current = true;
      lastSavedSig.current = signature;
      return;
    }
    let alive = true;
    (async () => {
      const b = await getBlog(routeId);
      if (!alive) return;
      if (b) {
        applyDoc(b);
        if (isLive(b)) setLiveSlug(b.slug);
      }
      setLoading(false);
      editorReady.current = true;
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId, isEdit]);

  // Populate all form fields from a stored blog / version payload.
  const applyDoc = (b: Omit<BlogInput, never> & Partial<{ version: number; publishAt: Timestamp | null; timeZone: string }>) => {
    setTitle(b.title); setSlug(b.slug); setSlugTouched(true);
    setCategory(b.category); setTags((b.tags ?? []).join(", "));
    setAuthor(b.author || DEFAULT_AUTHOR);
    setFeaturedImage(b.featuredImage); setImageAlt(b.imageAlt);
    setSeoTitle(b.seoTitle); setMetaDescription(b.metaDescription);
    setFocusKeyword(b.focusKeyword ?? ""); setRedirectFrom(b.redirectFrom ?? []);
    setReadTime(b.readTime); setReadTimeTouched(Boolean(b.readTime));
    setExcerpt(b.excerpt); setContent(b.content ?? []);
    setFaq(b.faq ?? []); setRelatedBlogs(b.relatedBlogs ?? []);
    setStatus(b.status);
    const zone = b.timeZone || DEFAULT_TIME_ZONE;
    setSchedZone(zone);
    setPublishAtTs(b.publishAt ?? null);
    const parts = dateToZonedInputs(b.publishAt ?? null, zone);
    setSchedDate(parts.date); setSchedTime(parts.time);
    if (typeof b.version === "number") setVersion(b.version);
    setContentKey((k) => k + 1);
  };

  // Apply a parsed Markdown import into the form. Only sets fields the document
  // actually provided, so it never wipes anything you've already filled in.
  const applyImport = (r: MarkdownImport) => {
    if (r.title) setTitle(r.title);
    if (r.slug && !slugLocked) { setSlug(slugify(r.slug)); setSlugTouched(true); }
    if (r.excerpt) setExcerpt(r.excerpt);
    if (r.metaDescription) setMetaDescription(r.metaDescription);
    if (r.seoTitle) setSeoTitle(r.seoTitle);
    if (r.focusKeyword) setFocusKeyword(r.focusKeyword);
    if (r.category) setCategory(r.category);
    if (r.tags.length) setTags(r.tags.join(", "));
    if (r.author) setAuthor(r.author);
    if (r.featuredImage) setFeaturedImage(r.featuredImage);
    if (r.imageAlt) setImageAlt(r.imageAlt);
    if (r.readTime) { setReadTime(r.readTime); setReadTimeTouched(true); }
    if (r.related.length) setRelatedBlogs(r.related);
    if (r.faq.length) setFaq(r.faq);
    if (r.content.length) { setContent(r.content); setContentKey((k) => k + 1); }
    setError("");
  };

  // Auto read-time unless the author overrode it.
  useEffect(() => {
    if (!editorReady.current || readTimeTouched) return;
    setReadTime(readTimeFromBlocks(content, excerpt));
  }, [content, excerpt, readTimeTouched]);

  // Auto-fill "Related in this series" with the chosen category's latest blogs,
  // for a NEW post, once a category is picked and nothing is set yet (e.g. by a
  // Markdown import). The author can freely change/reorder afterwards, and the
  // "Auto-add latest" button re-applies for the current category on demand.
  useEffect(() => {
    if (isEdit || relatedBlogs.length || !category || !latestCategorySlugs.length) return;
    setRelatedBlogs(latestCategorySlugs);
  }, [isEdit, category, relatedBlogs.length, latestCategorySlugs]);

  // Tick the "saved Xs ago" label once a minute.
  useEffect(() => {
    const t = setInterval(() => forceTick((n) => n + 1), 20_000);
    return () => clearInterval(t);
  }, []);

  // A live post whose slug changed keeps its old URL as a 301 to the new one.
  const nextRedirects = () => {
    const all = liveSlug && liveSlug !== effectiveSlug ? [...redirectFrom, liveSlug] : redirectFrom;
    return [...new Set<string>(all)].filter((s) => s && s !== effectiveSlug);
  };

  const buildInput = (nextStatus: BlogStatus, publishAt: Timestamp | null): BlogInput => ({
    title: title.trim(),
    slug: effectiveSlug,
    excerpt: excerpt.trim(),
    content,
    featuredImage: featuredImage.trim(),
    imageAlt: imageAlt.trim(),
    category,
    tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    seoTitle: seoTitle.trim(),
    metaDescription: metaDescription.trim(),
    focusKeyword: focusKeyword.trim(),
    readTime: readTime.trim() || readTimeFromBlocks(content, excerpt),
    author: author.trim() || DEFAULT_AUTHOR,
    status: nextStatus,
    publishAt,
    timeZone: schedZone,
    relatedBlogs,
    redirectFrom: nextRedirects(),
    faq,
    canonicalUrl: blogCanonicalUrl(effectiveSlug),
    ogImage: featuredImage.trim(),
    twitterImage: featuredImage.trim(),
  });

  // Low-level write: create on first save, update thereafter.
  const writeBlog = useCallback(
    async (input: BlogInput, opts: { version: boolean }) => {
      if (!docId) {
        const newId = await createBlog(input, actor);
        setDocId(newId);
        window.history.replaceState(null, "", `/admin/blogs/${newId}/edit`);
        setVersion(1);
        return newId;
      }
      await updateBlog(docId, input, actor, { version: opts.version });
      if (opts.version) setVersion((v) => v + 1);
      return docId;
    },
    [docId, actor]
  );

  const publishAtForStatus = (nextStatus: BlogStatus): Timestamp | null => {
    if (nextStatus === "scheduled") {
      const d = zonedInputsToDate(schedDate, schedTime, schedZone);
      return d ? Timestamp.fromDate(d) : null;
    }
    // Publish Now: a post that is already live keeps its original date, so its
    // date and sitemap entry don't jump; anything else goes live as of now.
    if (nextStatus === "published") return live && publishAtTs ? publishAtTs : Timestamp.now();
    if (nextStatus === "draft") return null;
    return publishAtTs; // archived keeps its stamp
  };

  const markSaved = (sig: string) => {
    lastSavedSig.current = sig;
    setSaveState("saved");
    setLastSavedAt(new Date());
  };

  // ---- Autosave (fixed 30s cadence while there are unsaved changes) -------
  // A ref holds the latest closure so the interval stays stable (fires every
  // 30s regardless of typing) instead of resetting on each keystroke.
  const autosaveRef = useRef<() => void>(() => {});
  autosaveRef.current = async () => {
    if (!editorReady.current || busy || saveState === "saving") return;
    if (!title.trim()) return; // nothing meaningful to persist yet
    if (signature === lastSavedSig.current) return; // no unsaved changes
    const sig = signature;
    setSaveState("saving");
    try {
      await writeBlog(buildInput(status, publishAtForStatus(status)), { version: false });
      markSaved(sig);
    } catch {
      setSaveState("error");
    }
  };
  useEffect(() => {
    const t = setInterval(() => autosaveRef.current(), AUTOSAVE_MS);
    return () => clearInterval(t);
  }, []);

  // ---- Explicit validation ------------------------------------------------
  const publishBlockers = useMemo(() => {
    const missing: string[] = [];
    if (!title.trim()) missing.push("Title");
    if (!effectiveSlug) missing.push("Slug");
    if (!featuredImage.trim()) missing.push("Featured Image");
    if (!imageAlt.trim()) missing.push("Featured Image ALT");
    if (!category) missing.push("Category");
    if (content.length === 0) missing.push("Content");
    if (!seoTitle.trim()) missing.push("SEO Title");
    if (!metaDescription.trim()) missing.push("Meta Description");
    return missing;
  }, [title, effectiveSlug, featuredImage, imageAlt, category, content, seoTitle, metaDescription]);

  // ---- Duplicate detection (warn if another blog shares this title/slug) --
  const duplicate = useMemo(() => {
    const t = title.trim().toLowerCase();
    const others = blogs.filter((b) => b.id !== docId);
    return {
      title: t ? others.find((b) => (b.title || "").trim().toLowerCase() === t) ?? null : null,
      slug: effectiveSlug ? others.find((b) => b.slug === effectiveSlug) ?? null : null,
    };
  }, [blogs, title, effectiveSlug, docId]);

  // ---- SEO scoring (rule-based; see utils/seoScore.ts) ----------------------
  const seoCtx = useMemo<SeoContext>(() => {
    const others = [
      ...blogs.filter((b) => b.id !== docId).map((b) => ({ title: b.title, seoTitle: b.seoTitle, description: b.metaDescription })),
      ...STATIC_BLOG_INDEX.filter((p) => p.slug !== effectiveSlug).map((p) => ({ title: p.title, seoTitle: p.seoTitle, description: p.description })),
    ];
    const bodyText = content
      .filter((b): b is Extract<BlogBlock, { type: "p" }> => b.type === "p")
      .slice(0, 6)
      .map((b) => b.text)
      .join(" ");
    return { title, excerpt, focusKeyword, bodyText, others };
  }, [blogs, docId, effectiveSlug, title, excerpt, focusKeyword, content]);
  const titleScore = useMemo(() => scoreSeoTitle(seoTitle, seoCtx), [seoTitle, seoCtx]);
  const descScore = useMemo(() => scoreMetaDescription(metaDescription, seoCtx), [metaDescription, seoCtx]);
  const titleOptions = useMemo(() => (suggestFor === "title" ? suggestSeoTitles(seoCtx) : []), [suggestFor, seoCtx]);
  const descOptions = useMemo(() => (suggestFor === "description" ? suggestMetaDescriptions(seoCtx) : []), [suggestFor, seoCtx]);

  // Articles never link off fwdpod.com; the build shows such links as plain text.
  const externalLinks = useMemo(() => findExternalLinks(content as CmsBlock[], faq), [content, faq]);

  // ---- Save flows ---------------------------------------------------------
  const runSave = async (nextStatus: BlogStatus, goList = true) => {
    setError("");
    setBusy(true);
    setSaveState("saving");
    const sig = signature;
    try {
      const input = buildInput(nextStatus, publishAtForStatus(nextStatus));
      await writeBlog(input, { version: true });
      setStatus(nextStatus);
      setPublishAtTs(input.publishAt);
      setRedirectFrom(input.redirectFrom);
      if (isLive(input)) setLiveSlug(input.slug);
      setSlugUnlocked(false);
      markSaved(sig);
      if (goList) navigate("/admin/blogs");
    } catch (e) {
      setError((e as Error).message || "Could not save. Check that this account is in admin_users and try again.");
      setSaveState("error");
      setBusy(false);
    }
  };

  const onSaveDraft = () => {
    if (!title.trim()) return setError("A title is required.");
    if (!effectiveSlug) return setError("A slug is required.");
    runSave("draft");
  };

  const onSchedule = () => {
    if (publishBlockers.length) return setError(`Cannot schedule — please complete: ${publishBlockers.join(", ")}.`);
    const when = zonedInputsToDate(schedDate, schedTime, schedZone);
    if (!when) return setError("Choose a valid publish date and time to schedule.");
    if (when.getTime() <= Date.now()) return setError("Schedule time must be in the future.");
    runSave("scheduled");
  };

  const onPublishClick = () => {
    if (publishBlockers.length) return setError(`Cannot publish — please complete: ${publishBlockers.join(", ")}.`);
    setError("");
    runSave("published"); // publish straight away — no confirmation popup
  };

  const confirmArchive = async () => { setConfirm(null); await runSave("archived"); };
  const onUnarchive = () => runSave("draft");
  const confirmDelete = async () => {
    setConfirm(null);
    if (!docId) return navigate("/admin/blogs");
    setBusy(true);
    try { await deleteBlog(docId); navigate("/admin/blogs"); }
    catch (e) { setError((e as Error).message || "Delete failed."); setBusy(false); }
  };

  const handleRestore = async (v: BlogVersion) => {
    applyDoc({ ...v.data, version });
    await writeBlog(v.data, { version: true });
    setStatus(v.data.status);
    lastSavedSig.current = ""; // applyDoc changed fields async; next signature settles clean on re-render
  };

  const pickFeatured = (m: MediaItem) => {
    setFeaturedImage(m.url);
    if (!imageAlt.trim() && m.alt) setImageAlt(m.alt);
  };

  const previewDate = useMemo(() => {
    const ts = publishAtForStatus(status === "scheduled" ? "scheduled" : status);
    if (ts) return formatInZone(ts, schedZone);
    return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, schedDate, schedTime, schedZone, publishAtTs]);

  const savePill = (() => {
    if (saveState === "saving") return { icon: <Loader2 size={13} className="animate-spin" />, text: "Saving…", cls: "text-ink/50" };
    if (dirty) return { icon: <CircleDot size={13} />, text: "Unsaved changes", cls: "text-amber-600" };
    if (saveState === "saved" || lastSavedAt) return { icon: <Check size={13} />, text: `Saved ${timeAgo(lastSavedAt)}`, cls: "text-green-600" };
    return { icon: null, text: "", cls: "text-ink/40" };
  })();

  return (
    <AdminLayout
      title={isEdit ? "Edit Blog" : "Add Blog"}
      action={
        <div className="flex flex-wrap items-center gap-2">
          {savePill.text && (
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${savePill.cls}`}>{savePill.icon}{savePill.text}</span>
          )}
          {docId && (
            <button onClick={() => setHistoryOpen(true)} className="inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-2 text-sm font-medium text-ink hover:border-accent" title="Version history">
              <History size={16} /> History
            </button>
          )}
          <button onClick={() => setImportOpen(true)} className="inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-2 text-sm font-medium text-ink hover:border-accent" title="Fill every field from a Markdown file">
            <FileText size={16} /> Import .md
          </button>
          <button onClick={() => setPreviewOpen(true)} className="inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-2 text-sm font-medium text-ink hover:border-accent">
            <Eye size={16} /> Preview
          </button>
          <button onClick={() => navigate("/admin/blogs")} className="inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-2 text-sm font-medium text-ink hover:border-accent">
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      }
    >
      {loading ? (
        <p className="py-16 text-center text-ink/50">Loading…</p>
      ) : (
        <>
          {error && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

          {publishBlockers.length > 0 && (
            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-amber-800"><AlertTriangle size={15} /> Complete these before publishing ({publishBlockers.length})</p>
              <ul className="mt-1.5 list-disc pl-8 text-sm text-amber-700">{publishBlockers.map((w) => <li key={w}>{w}</li>)}</ul>
            </div>
          )}

          {externalLinks.length > 0 && (
            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-amber-800"><AlertTriangle size={15} /> Links to other sites</p>
              <p className="mt-1 text-sm text-amber-700">
                Articles on fwdpod.com don't link off the site, so these will show as plain text (name the source in the sentence instead):
              </p>
              <ul className="mt-1.5 list-disc break-all pl-8 text-sm text-amber-700">{externalLinks.map((l) => <li key={l}>{l}</li>)}</ul>
            </div>
          )}

          {(duplicate.title || duplicate.slug) && (
            <div className="mb-5 rounded-xl border border-orange-300 bg-orange-50 px-4 py-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-orange-800"><AlertTriangle size={15} /> Possible duplicate</p>
              <ul className="mt-1.5 list-disc pl-8 text-sm text-orange-700">
                {duplicate.title && <li>Another blog already uses this <strong>title</strong>: “{duplicate.title.title}” ({duplicate.title.status}).</li>}
                {duplicate.slug && <li>Another blog already uses this <strong>URL slug</strong> <code>/{duplicate.slug.slug}</code>: “{duplicate.slug.title}”. Publishing with the same slug can overwrite that page — change the slug to avoid a clash.</li>}
              </ul>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main column */}
            <div className="space-y-5 lg:col-span-2">
              <div className="space-y-4 rounded-2xl border border-line bg-surface p-5">
                <Field label="Blog Title"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter the blog title" className={inputClass} /></Field>
                <Field
                  label="Slug"
                  hint={slugLocked ? "locked: the post is live" : "auto-generated from the title, editable"}
                  action={slugLocked ? (
                    <button type="button" onClick={() => setConfirm("unlock-slug")} className="mb-1.5 text-xs font-medium text-accent hover:underline">Change URL</button>
                  ) : undefined}
                >
                  <input
                    value={effectiveSlug}
                    readOnly={slugLocked}
                    onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)); }}
                    placeholder="blog-url-slug"
                    className={`${inputClass} ${slugLocked ? "text-ink/50" : ""}`}
                  />
                  <p className="mt-1 text-xs text-ink/40">fwdpod.com/insights/{effectiveSlug || "…"}</p>
                  {liveSlug && liveSlug !== effectiveSlug && (
                    <p className="mt-1 text-xs text-amber-700">/insights/{liveSlug} will permanently redirect here after the next deploy.</p>
                  )}
                </Field>
                <Field label="Excerpt" hint="short summary / listing card text">
                  <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} placeholder="One or two sentence summary." className={`${inputClass} resize-y`} />
                </Field>
              </div>

              <div>
                <label className={labelClass}>Content</label>
                <RichTextEditor key={contentKey} value={content} onChange={setContent} />
                <p className="mt-1.5 text-xs text-ink/40">Drag &amp; drop or paste images directly. Saved as structured blocks — {content.length} block{content.length === 1 ? "" : "s"}.</p>
              </div>

              <FaqEditor value={faq} onChange={setFaq} />
              <RelatedPicker
                value={relatedBlogs}
                onChange={setRelatedBlogs}
                options={relatedOptions}
                onAutoFill={latestCategorySlugs.length ? () => setRelatedBlogs(latestCategorySlugs) : undefined}
              />
            </div>

            {/* Sidebar column */}
            <div className="space-y-5">
              {/* Status & schedule */}
              <div className="space-y-4 rounded-2xl border border-line bg-surface p-5">
                <Field label="Current Status">
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      status === "published" ? "bg-green-50 text-green-700 border-green-200"
                      : status === "scheduled" ? "bg-amber-50 text-amber-700 border-amber-200"
                      : status === "archived" ? "bg-slate-100 text-slate-500 border-slate-200"
                      : "bg-ink/5 text-ink/60 border-line"}`}>{status[0].toUpperCase() + status.slice(1)}</span>
                    {version > 0 && <span className="text-xs text-ink/40">v{version}</span>}
                  </div>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Publish Date"><input type="date" value={schedDate} onChange={(e) => setSchedDate(e.target.value)} className={inputClass} /></Field>
                  <Field label="Publish Time"><input type="time" value={schedTime} onChange={(e) => setSchedTime(e.target.value)} className={inputClass} /></Field>
                </div>
                <Field label="Timezone">
                  <select value={schedZone} onChange={(e) => setSchedZone(e.target.value)} className={inputClass}>
                    {TIME_ZONES.map((z) => <option key={z.value} value={z.value}>{z.label}</option>)}
                  </select>
                </Field>
                {publishAtTs && <p className="text-xs text-ink/40">Scheduled/target: {formatInZone(publishAtTs, schedZone)}</p>}
              </div>

              <div className="space-y-4 rounded-2xl border border-line bg-surface p-5">
                <Field label="Category">
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                    <option value="">Select a category</option>
                    {categoryNames.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Tags" hint="comma separated"><input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Healthcare AI, DPDP, FHIR" className={inputClass} /></Field>
                <Field label="Author"><input value={author} onChange={(e) => setAuthor(e.target.value)} className={inputClass} /></Field>
              </div>

              {/* Featured image */}
              <div className="space-y-4 rounded-2xl border border-line bg-surface p-5">
                <Field label="Featured Image" action={<button type="button" onClick={() => setFeaturedPicker(true)} className="mb-1.5 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"><ImagePlus size={13} /> Library / Upload</button>}>
                  <input value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)} placeholder="/blog-images/…jpeg or https://…" className={inputClass} />
                </Field>
                {featuredImage ? (
                  <img src={featuredImage} alt={imageAlt || "Featured preview"} className="aspect-video w-full rounded-lg border border-line object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                ) : (
                  <button type="button" onClick={() => setFeaturedPicker(true)} className="flex aspect-video w-full items-center justify-center rounded-lg border border-dashed border-line text-ink/30 hover:border-accent hover:text-accent"><ImagePlus size={22} /></button>
                )}
                <Field label="Featured Image ALT Text" action={<SuggestBtn onClick={() => setImageAlt(suggestImageAlt(title, category))} />}>
                  <input value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} placeholder="Descriptive alt text" className={inputClass} />
                </Field>
              </div>

              {/* SEO */}
              <div className="space-y-4 rounded-2xl border border-line bg-surface p-5">
                <Field label="Focus Keyword" hint="the search query this post targets">
                  <input value={focusKeyword} onChange={(e) => setFocusKeyword(e.target.value)} placeholder="e.g. when to hire a forward deployed engineer" className={inputClass} />
                </Field>
                <Field label="SEO Title" hint={`shown as “…${TITLE_SUFFIX}”`}>
                  <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Keyword first, 50–60 characters with the suffix" className={inputClass} />
                  <SeoFieldScore
                    result={titleScore}
                    lengthLabel={`${titleScore.length} chars shown`}
                    onSuggest={() => setSuggestFor("title")}
                  />
                </Field>
                <Field label="Meta Description" hint="also the listing card text">
                  <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={4} className={`${inputClass} resize-y`} />
                  <SeoFieldScore
                    result={descScore}
                    lengthLabel={`${descScore.length} chars`}
                    onSuggest={() => setSuggestFor("description")}
                  />
                </Field>
                <Field label="Read Time" hint="auto — editable">
                  <input value={readTime} onChange={(e) => { setReadTimeTouched(true); setReadTime(e.target.value); }} placeholder="6 min read" className={inputClass} />
                </Field>
                <Field label="Canonical URL" hint="auto"><input readOnly value={blogCanonicalUrl(effectiveSlug)} className={`${inputClass} text-ink/50`} /></Field>
              </div>
            </div>
          </div>

          {/* Action bar */}
          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            {docId && (
              <button onClick={() => setConfirm("delete")} disabled={busy} className="mr-auto inline-flex items-center justify-center gap-2 rounded-full border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60">
                <Trash2 size={16} /> Delete
              </button>
            )}
            <button onClick={onSaveDraft} disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:border-accent disabled:opacity-60">
              <Save size={16} /> Save Draft
            </button>
            <button onClick={onSchedule} disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-5 py-2.5 text-sm font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-60">
              <CalendarClock size={16} /> Schedule
            </button>
            {status === "archived" ? (
              <button onClick={onUnarchive} disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:border-accent disabled:opacity-60">
                <ArchiveRestore size={16} /> Unarchive
              </button>
            ) : (
              <button onClick={() => setConfirm("archive")} disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-60">
                <Archive size={16} /> Archive
              </button>
            )}
            <button onClick={onPublishClick} disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper hover:bg-ink/90 active:scale-95 disabled:opacity-60">
              <Send size={16} /> {status === "published" ? "Update Published" : "Publish Now"}
            </button>
          </div>

          <p className="mt-3 text-center text-xs text-ink/40">
            fwdpod.com is rebuilt automatically: a published change, or a scheduled post whose time has come, is live within about 10 minutes.
          </p>

          <ImportMarkdownModal open={importOpen} onClose={() => setImportOpen(false)} onImport={applyImport} />
          <MediaPickerModal open={featuredPicker} onClose={() => setFeaturedPicker(false)} onSelect={pickFeatured} title="Featured image" />
          <BlogPreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} data={{ title, category, excerpt, featuredImage, imageAlt, readTime, author, dateLabel: previewDate, content, faq, tags: tags.split(",").map((t) => t.trim()).filter(Boolean), related: relatedForPreview }} />
          <SeoSuggestModal
            open={suggestFor === "title"}
            field="SEO title"
            current={seoTitle}
            result={titleScore}
            options={titleOptions}
            lengthOf={(o) => `${o.length} chars shown`}
            onApply={setSeoTitle}
            onClose={() => setSuggestFor(null)}
          />
          <SeoSuggestModal
            open={suggestFor === "description"}
            field="Meta description"
            current={metaDescription}
            result={descScore}
            options={descOptions}
            lengthOf={(o) => `${o.length} chars`}
            onApply={setMetaDescription}
            onClose={() => setSuggestFor(null)}
          />
          <ConfirmModal open={confirm === "unlock-slug"} title="Change the URL of a live post?" tone="warning" busy={busy}
            message={`The post is live at /insights/${liveSlug}. If you change the slug, that address will 301-redirect to the new one, but links and rankings settle on the new URL only over time. Change it only if the current slug is wrong.`}
            confirmLabel="Unlock slug" onConfirm={() => { setSlugUnlocked(true); setConfirm(null); }} onCancel={() => setConfirm(null)} />
          <VersionHistoryModal open={historyOpen} blogId={docId} currentVersion={version} onClose={() => setHistoryOpen(false)} onRestore={handleRestore} />

          <ConfirmModal open={confirm === "archive"} title="Archive this blog?" tone="warning" busy={busy}
            message="Archived blogs are hidden from the public site and excluded from the sitemap. You can unarchive anytime."
            confirmLabel="Archive" onConfirm={confirmArchive} onCancel={() => setConfirm(null)} />
          <ConfirmModal open={confirm === "delete"} title="Delete this blog?" tone="danger" busy={busy}
            message={live
              ? `This post is LIVE at /insights/${effectiveSlug}. Deleting it removes the page from fwdpod.com on the next deploy (the URL will return 404) and permanently deletes its version history. To hide it but keep it, Archive instead.`
              : "This permanently removes the blog and its version history. This cannot be undone."}
            confirmLabel="Delete permanently" onConfirm={confirmDelete} onCancel={() => setConfirm(null)} />
        </>
      )}
    </AdminLayout>
  );
}

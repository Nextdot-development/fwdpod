import type { BlogStatus } from "@admin/types/blog";

const STYLES: Record<BlogStatus, string> = {
  published: "bg-green-50 text-green-700 border-green-200",
  scheduled: "bg-amber-50 text-amber-700 border-amber-200",
  draft: "bg-ink/5 text-ink/60 border-line",
  archived: "bg-slate-100 text-slate-500 border-slate-200",
};

const LABELS: Record<BlogStatus, string> = {
  published: "Published",
  scheduled: "Scheduled",
  draft: "Draft",
  archived: "Archived",
};

export function StatusBadge({ status }: { status: BlogStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}

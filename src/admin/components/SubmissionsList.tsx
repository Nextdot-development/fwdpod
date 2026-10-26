import { Fragment, useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, Mail, RotateCcw, Search, Trash2 } from "lucide-react";
import { AdminLayout } from "@admin/components/AdminLayout";
import { ConfirmModal } from "@admin/components/ConfirmModal";
import { useAuth } from "@admin/hooks/useAuth";
import { Timestamp } from "@admin/lib/time";
import { formatDate, formatDateTime, formatTime } from "@admin/utils/date";
import { deleteSubmission, setHandled, subscribeSubmissions, type Submission, type SubmissionTable } from "@admin/services/submissions";

type Filter = "all" | "new" | "handled";

export interface DetailField {
  label: string;
  value: (s: Submission) => string | null | undefined;
}

/**
 * Live list of one website form's submissions, newest first. Rows expand to
 * show every field; each can be replied to, marked handled or deleted.
 */
export function SubmissionsList({
  table,
  title,
  replySubject,
  summary,
  details,
}: {
  table: SubmissionTable;
  title: string;
  /** Subject line used by the Reply button. */
  replySubject: (s: Submission) => string;
  /** Short line shown in the table, e.g. what they need. */
  summary: (s: Submission) => string;
  /** Fields shown when a row is opened, after name, email and company. */
  details: DetailField[];
}) {
  const { user } = useAuth();
  const actor = user?.email ?? user?.uid ?? "unknown";
  const [rows, setRows] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Submission | null>(null);

  useEffect(
    () =>
      subscribeSubmissions(
        table,
        (data) => {
          setRows(data);
          setError(null);
          setLoading(false);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        }
      ),
    [table]
  );

  const counts = useMemo(
    () => ({ all: rows.length, new: rows.filter((r) => !r.handled).length, handled: rows.filter((r) => r.handled).length }),
    [rows]
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter === "new" && r.handled) return false;
      if (filter === "handled" && !r.handled) return false;
      if (q && !`${r.name} ${r.email} ${r.company}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, filter, search]);

  const toggleHandled = async (s: Submission) => {
    setBusyId(s.id);
    try {
      await setHandled(table, s.id, !s.handled, actor);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setBusyId(toDelete.id);
    try {
      await deleteSubmission(table, toDelete.id);
      if (openId === toDelete.id) setOpenId(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
      setToDelete(null);
    }
  };

  const received = (s: Submission) => Timestamp.fromISO(s.created_at);
  const tabs: { value: Filter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "new", label: "New" },
    { value: "handled", label: "Handled" },
  ];

  return (
    <AdminLayout title={title}>
      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      {/* Controls */}
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setFilter(t.value)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${filter === t.value ? "bg-ink text-paper" : "border border-line text-ink/70 hover:border-accent"}`}
            >
              {t.label} <span className="opacity-60">({counts[t.value]})</span>
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email or company…"
            aria-label="Search submissions"
            className="w-full rounded-lg border border-line bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink/40 focus:border-accent focus:outline-none md:w-72"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-paper/40 text-[11px] uppercase tracking-wide text-ink/50">
              <th className="whitespace-nowrap px-4 py-3.5 font-semibold">Received</th>
              <th className="whitespace-nowrap px-4 py-3.5 font-semibold">From</th>
              <th className="hidden whitespace-nowrap px-4 py-3.5 font-semibold sm:table-cell">Company</th>
              <th className="hidden px-4 py-3.5 font-semibold lg:table-cell">Summary</th>
              <th className="whitespace-nowrap px-4 py-3.5 font-semibold">Status</th>
              <th className="whitespace-nowrap px-4 py-3.5 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-ink/50">Loading…</td></tr>
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink/50">
                  {rows.length === 0 ? "Nothing yet. New submissions appear here as soon as someone sends the form." : "No submissions match your filters."}
                </td>
              </tr>
            ) : (
              visible.map((s) => {
                const open = openId === s.id;
                return (
                  <Fragment key={s.id}>
                    <tr className={`transition-colors hover:bg-paper/60 ${s.handled ? "" : "font-medium"}`}>
                      <td className="whitespace-nowrap px-4 py-3.5 text-ink/70">
                        <div>{formatDate(received(s))}</div>
                        <div className="text-xs text-ink/40">{formatTime(received(s))}</div>
                      </td>
                      <td className="max-w-[16rem] px-4 py-3.5">
                        <button
                          onClick={() => setOpenId(open ? null : s.id)}
                          aria-expanded={open}
                          className="flex items-center gap-1.5 text-left text-ink hover:text-accent"
                        >
                          <ChevronDown size={14} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
                          <span className="truncate">{s.name}</span>
                        </button>
                        <span className="block truncate pl-5 text-xs font-normal text-ink/50">{s.email}</span>
                      </td>
                      <td className="hidden max-w-[12rem] truncate px-4 py-3.5 text-ink/70 sm:table-cell">{s.company}</td>
                      <td className="hidden max-w-[20rem] truncate px-4 py-3.5 font-normal text-ink/60 lg:table-cell">{summary(s)}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.handled ? "bg-emerald-50 text-emerald-700" : "bg-accent/10 text-accent"}`}>
                          {s.handled ? "Handled" : "New"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-0.5">
                          <a
                            href={`mailto:${encodeURIComponent(s.email)}?subject=${encodeURIComponent(replySubject(s))}`}
                            title="Reply by email"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink/60 hover:bg-accent/10 hover:text-accent"
                          >
                            <Mail size={15} />
                          </a>
                          <button
                            onClick={() => toggleHandled(s)}
                            disabled={busyId === s.id}
                            title={s.handled ? "Mark as new" : "Mark as handled"}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink/60 hover:bg-accent/10 hover:text-accent disabled:opacity-40"
                          >
                            {s.handled ? <RotateCcw size={15} /> : <CheckCircle2 size={15} />}
                          </button>
                          <button
                            onClick={() => setToDelete(s)}
                            disabled={busyId === s.id}
                            title="Delete"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink/60 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {open && (
                      <tr className="bg-paper/60">
                        <td colSpan={6} className="px-4 pb-5 pt-1">
                          <dl className="grid grid-cols-1 gap-x-8 gap-y-3 rounded-xl border border-line bg-paper p-4 text-sm sm:grid-cols-2">
                            {[
                              { label: "Name", value: s.name },
                              { label: "Email", value: s.email },
                              { label: "Company", value: s.company },
                              ...details.map((d) => ({ label: d.label, value: d.value(s) })),
                              { label: "Received", value: formatDateTime(received(s)) },
                              { label: "Sent from", value: s.source_page },
                              ...(s.handled ? [{ label: "Handled", value: `${formatDateTime(Timestamp.fromISO(s.handled_at))} by ${s.handled_by ?? "unknown"}` }] : []),
                            ].map((f) => (
                              <div key={f.label} className={f.label === "Message" || f.label === "Anything else" ? "sm:col-span-2" : ""}>
                                <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">{f.label}</dt>
                                <dd className="mt-0.5 whitespace-pre-wrap break-words font-normal text-ink">{f.value || "—"}</dd>
                              </div>
                            ))}
                          </dl>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={toDelete !== null}
        title="Delete this submission?"
        message="It is removed from the admin for good. The copy in the Gmail inbox is not affected."
        confirmLabel="Delete permanently"
        tone="danger"
        busy={busyId === toDelete?.id}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </AdminLayout>
  );
}

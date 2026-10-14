import { Link } from "react-router-dom";
import { FileText, CheckCircle2, Clock, PencilLine, Plus, ArrowRight } from "lucide-react";
import { AdminLayout } from "@admin/components/AdminLayout";
import { StatCard } from "@admin/components/StatCard";
import { StatusBadge } from "@admin/components/StatusBadge";
import { useBlogs } from "@admin/hooks/useBlogs";
import { formatDate } from "@admin/utils/date";
import { DeployStatus } from "@admin/components/DeployStatus";

export default function Dashboard() {
  const { blogs, counts, loading, error } = useBlogs();
  const recent = blogs.slice(0, 5);

  return (
    <AdminLayout
      title="Dashboard"
      action={
        <Link
          to="/admin/blogs/new"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper transition-all hover:bg-ink/90 active:scale-95"
        >
          <Plus size={16} /> Add Blog
        </Link>
      }
    >
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          Could not load blogs: {error}. Check that supabase/migrations/0001_cms_schema.sql has been run and that this
          account is in admin_users.
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Blogs" value={counts.total} icon={FileText} />
        <StatCard label="Published" value={counts.published} icon={CheckCircle2} accent="text-green-600" />
        <StatCard label="Scheduled" value={counts.scheduled} icon={Clock} accent="text-amber-600" />
        <StatCard label="Drafts" value={counts.draft} icon={PencilLine} accent="text-ink/50" />
      </div>

      <DeployStatus />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Recent blogs */}
        <section className="rounded-2xl border border-line bg-surface p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink">Recent Blogs</h2>
            <Link to="/admin/blogs" className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <p className="py-8 text-center text-sm text-ink/50">Loading…</p>
          ) : recent.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-ink/60">No blogs yet.</p>
              <Link to="/admin/blogs/new" className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">
                <Plus size={14} /> Create your first blog
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <Link to={`/admin/blogs/${b.id}/edit`} className="block truncate font-medium text-ink hover:text-accent">
                      {b.title || "(untitled)"}
                    </Link>
                    <span className="text-xs text-ink/50">
                      {b.category || "Uncategorised"} · Updated {formatDate(b.updatedAt)}
                    </span>
                  </div>
                  <StatusBadge status={b.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Quick actions */}
        <section className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="mb-4 font-display text-lg font-semibold text-ink">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/admin/blogs/new"
              className="flex items-center justify-between rounded-xl border border-line bg-paper px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-accent"
            >
              <span className="inline-flex items-center gap-2"><Plus size={16} className="text-accent" /> Add Blog</span>
              <ArrowRight size={16} className="text-ink/40" />
            </Link>
            <Link
              to="/admin/blogs"
              className="flex items-center justify-between rounded-xl border border-line bg-paper px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-accent"
            >
              <span className="inline-flex items-center gap-2"><FileText size={16} className="text-accent" /> Manage Blogs</span>
              <ArrowRight size={16} className="text-ink/40" />
            </Link>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

import { Navigate } from "react-router-dom";
import { useState, type ReactNode } from "react";
import { logout, useAuth } from "@admin/hooks/useAuth";

/**
 * Gates an admin screen behind a signed-in Supabase user. While auth state is
 * resolving it shows a lightweight loader; unauthenticated users are sent to
 * /admin/login. (Data access is separately enforced by Supabase Row Level
 * Security — this guard is UX, not the security boundary.)
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading, configured, adminError, recheckAdmin } = useAuth();
  const [checking, setChecking] = useState(false);

  if (!configured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-6 text-center">
        <div className="max-w-md">
          <h1 className="mb-3 font-display text-2xl font-semibold text-ink">Supabase not configured</h1>
          <p className="text-ink/60">
            Set <code className="rounded bg-surface px-1.5 py-0.5 text-sm">VITE_SUPABASE_URL</code> and{" "}
            <code className="rounded bg-surface px-1.5 py-0.5 text-sm">VITE_SUPABASE_PUBLISHABLE_KEY</code> and rebuild
            to enable the admin panel.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-6 text-center">
        <div className="max-w-md">
          <h1 className="mb-3 font-display text-2xl font-semibold text-ink">Not an admin account</h1>
          <p className="mb-5 text-ink/60">
            <strong>{user.email}</strong> is signed in but is not listed in <code className="rounded bg-surface px-1.5 py-0.5 text-sm">admin_users</code>.
            Add exactly this email in the Supabase SQL Editor, then press Check again.
          </p>
          <pre className="mb-5 overflow-x-auto rounded-lg bg-surface px-3 py-2 text-left text-xs text-ink/70">
            {`insert into public.admin_users (email)\nvalues ('${user.email}')\non conflict (email) do nothing;`}
          </pre>
          {adminError && <p className="mb-4 text-sm text-red-600">Database said: {adminError}</p>}
          <div className="flex justify-center gap-3">
            <button
              onClick={async () => { setChecking(true); await recheckAdmin(); setChecking(false); }}
              disabled={checking}
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper hover:bg-ink/90 disabled:opacity-60"
            >
              {checking ? "Checking…" : "Check again"}
            </button>
            <button onClick={() => logout()} className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:border-accent">
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

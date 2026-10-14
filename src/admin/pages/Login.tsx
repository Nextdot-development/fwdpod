import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { login, useAuth } from "@admin/hooks/useAuth";

// Maps Supabase auth errors to plain, non-leaky messages.
const errorMessage = (err: unknown): string => {
  const e = (err ?? {}) as { code?: string; message?: string; status?: number };
  const code = e.code ?? "";
  const msg = (e.message ?? "").toLowerCase();
  if (code === "invalid_credentials" || msg.includes("invalid login credentials")) {
    return "Incorrect email or password.";
  }
  if (code === "email_not_confirmed" || msg.includes("not confirmed")) {
    return "This email hasn't been confirmed yet.";
  }
  if (code === "over_request_rate_limit" || e.status === 429 || msg.includes("rate limit")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (msg.includes("email") && msg.includes("invalid")) {
    return "That doesn't look like a valid email address.";
  }
  return "Unable to sign in right now. Please try again.";
};

export default function Login() {
  const { user, loading, configured } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Already signed in → straight to the dashboard.
  if (!loading && user) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="font-display text-2xl font-semibold tracking-tight text-ink">
            Fwdpod <span className="text-accent">Admin</span>
          </div>
          <p className="mt-2 text-sm text-ink/60">Sign in to manage the blog.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-line bg-surface p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-8"
        >
          {!configured && (
            <p className="mb-5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Supabase is not configured yet. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY and rebuild.
            </p>
          )}
          {error && (
            <p className="mb-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <label className="mb-2 block text-sm font-medium text-ink">Email</label>
          <div className="relative mb-5">
            <Mail size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@fwdpod.com"
              className="w-full rounded-lg border border-line bg-white py-3 pl-10 pr-4 text-ink placeholder:text-ink/40 focus:border-accent focus:outline-none"
            />
          </div>

          <label className="mb-2 block text-sm font-medium text-ink">Password</label>
          <div className="relative mb-6">
            <Lock size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-line bg-white py-3 pl-10 pr-11 text-ink placeholder:text-ink/40 focus:border-accent focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              title={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-ink/40 hover:bg-ink/5 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting || !configured}
            className="w-full rounded-full bg-ink py-3 font-semibold text-paper transition-all hover:bg-ink/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-ink/40">Authorised administrators only.</p>
      </div>
    </div>
  );
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "@admin/supabase/config";

export interface AdminUser {
  uid: string;
  email: string | null;
}

interface AuthState {
  user: AdminUser | null;
  /** True once the database confirms this account is in admin_users. */
  isAdmin: boolean;
  loading: boolean;
  configured: boolean;
  /** The database's answer when the admin check failed, for the error screen. */
  adminError: string | null;
  /** Ask the database again, e.g. after adding the email to admin_users. */
  recheckAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null, isAdmin: false, loading: true, configured: false, adminError: null, recheckAdmin: async () => {},
});

async function checkAdmin(): Promise<{ isAdmin: boolean; error: string | null }> {
  const { data, error } = await supabase.rpc("is_admin");
  return { isAdmin: data === true, error: error ? error.message : null };
}

/**
 * Tracks the signed-in Supabase user and whether the database treats them as
 * an admin. The admin check is for the UI only; the real boundary is Row
 * Level Security (public.is_admin() in every CMS policy).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    let alive = true;
    const resolve = async (u: { id: string; email?: string | null } | null | undefined) => {
      if (!u) {
        if (!alive) return;
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      const result = await checkAdmin();
      if (!alive) return;
      setUser({ uid: u.id, email: u.email ?? null });
      setIsAdmin(result.isAdmin);
      setAdminError(result.error);
      setLoading(false);
    };
    supabase.auth.getSession().then(({ data }) => resolve(data.session?.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      // Defer: calling Supabase inside this callback can deadlock the client.
      setTimeout(() => resolve(session?.user), 0);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const recheckAdmin = useCallback(async () => {
    const result = await checkAdmin();
    setIsAdmin(result.isAdmin);
    setAdminError(result.error);
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, isAdmin, loading, configured: isSupabaseConfigured, adminError, recheckAdmin }),
    [user, isAdmin, loading, adminError, recheckAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

/** Email + password sign-in. Throws on failure (Login maps the message). */
export const login = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
};

export const logout = () => supabase.auth.signOut();

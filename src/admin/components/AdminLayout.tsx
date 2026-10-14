import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@admin/hooks/useAuth";

/**
 * Shell for every authenticated admin screen: the reusable sidebar plus a
 * responsive main area with a mobile top bar. Pages pass their own title/action.
 */
export function AdminLayout({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="md:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-line bg-paper/90 px-4 py-3 backdrop-blur-sm md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink md:hidden"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <h1 className="font-display text-lg font-semibold tracking-tight text-ink md:text-xl">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            {action}
            <span className="hidden text-sm text-ink/50 sm:inline">{user?.email}</span>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}

import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, FileText, Image, FolderTree, CalendarCheck, Inbox, LogOut, X } from "lucide-react";
import { logout } from "@admin/hooks/useAuth";
import { cn } from "@admin/lib/utils";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/blogs", label: "Blogs", icon: FileText, end: false },
  { to: "/admin/media", label: "Media", icon: Image, end: false },
  { to: "/admin/categories", label: "Categories", icon: FolderTree, end: false },
  { to: "/admin/bookings", label: "Bookings", icon: CalendarCheck, end: false },
  { to: "/admin/contact-messages", label: "Contact messages", icon: Inbox, end: false },
];

/**
 * Reusable admin sidebar. On desktop it's a fixed rail; on mobile it slides in
 * as a drawer controlled by `open` / `onClose` from AdminLayout.
 */
export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && <div className="fixed inset-0 z-30 bg-ink/30 md:hidden" onClick={onClose} aria-hidden="true" />}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-surface transition-transform md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <span className="font-display text-lg font-semibold tracking-tight text-ink">
            Fwdpod <span className="text-accent">Admin</span>
          </span>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink/50 hover:bg-ink/5 md:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive ? "bg-accent/10 text-accent" : "text-ink/70 hover:bg-ink/5 hover:text-ink"
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-line p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink/70 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

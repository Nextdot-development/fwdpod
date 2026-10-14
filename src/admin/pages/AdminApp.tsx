import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@admin/hooks/useAuth";
import { ProtectedRoute } from "@admin/components/ProtectedRoute";
import Login from "./Login";
import Dashboard from "./Dashboard";
import BlogList from "./BlogList";
import BlogEditor from "./BlogEditor";
import Categories from "./Categories";
import Media from "./Media";

/**
 * The blog admin, mounted at /admin from its own entry (src/admin/main.tsx).
 * The public site never loads this code.
 */
export default function AdminApp() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-paper text-ink antialiased">
        <Routes>
          <Route path="/admin/login" element={<Login />} />

          <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/blogs" element={<ProtectedRoute><BlogList /></ProtectedRoute>} />
          <Route path="/admin/blogs/new" element={<ProtectedRoute><BlogEditor /></ProtectedRoute>} />
          <Route path="/admin/blogs/:id/edit" element={<ProtectedRoute><BlogEditor /></ProtectedRoute>} />
          <Route path="/admin/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
          <Route path="/admin/media" element={<ProtectedRoute><Media /></ProtectedRoute>} />

          <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

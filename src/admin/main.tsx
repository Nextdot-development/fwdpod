import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AdminApp from "./pages/AdminApp";
import "./admin.css";

// The blog admin: a client-only app served at /admin (see admin.html and the
// .htaccess rule). It shares no entry point with the public site, so the
// public pages never download Supabase or the editor.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AdminApp />
    </BrowserRouter>
  </StrictMode>
);

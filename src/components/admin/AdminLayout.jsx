import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { LayoutDashboard, Settings, FolderKanban, Star, FileText, ExternalLink, Tag, Users, LogOut, LogIn, Award, PanelTop, ClipboardList, Receipt, Gift } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";

const menuItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Site Settings", path: "/admin/settings", icon: Settings },
  { label: "Projects", path: "/admin/projects", icon: FolderKanban },
  { label: "Testimonials", path: "/admin/testimonials", icon: Star },
  { label: "Blog Posts", path: "/admin/blog", icon: FileText },
  { label: "Pricing", path: "/admin/pricing", icon: Tag },
  { label: "Leads", path: "/admin/leads", icon: Users },
  { label: "Client Projects", path: "/admin/clients", icon: ClipboardList },
  { label: "Offer Zone", path: "/admin/offers", icon: Gift },
  { label: "Page Editor", path: "/admin/page-editor", icon: PanelTop },
];

export default function AdminLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { settings } = useSiteSettings();
  const { user, isAuthenticated } = useAuth();
  const adminName = settings.admin_header_name || "Terranest Admin";

  const handleSignOut = () => base44.auth.logout("/admin-login");
  const handleSignIn = () => window.location.href = "/admin-login";

  return (
    <div className="min-h-screen bg-offwhite flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-charcoal text-white z-50 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-gray-800">
          <Link to="/admin" className="flex items-center gap-3">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt={adminName} className="h-8 w-auto object-contain" />
            ) : null}
            <span className="font-heading text-xl">
              {adminName.split(" ").slice(0, -1).join(" ") || adminName}{" "}
              <span className="text-gold text-xs font-body">{adminName.split(" ").slice(-1)[0]}</span>
            </span>
          </Link>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: "calc(100vh - 180px)" }}>
          {menuItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-body transition-colors ${
                  active ? "bg-gold text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 space-y-1">
          {isAuthenticated && user && (
            <div className="px-4 py-2 mb-1">
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          )}
          <Link
            to="/quotation-domain"
            className="flex items-center gap-2 px-4 py-2 text-xs text-gray-400 hover:text-gold transition-colors"
          >
            <Receipt className="w-3 h-3" />
            Quotation Domain
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 text-xs text-gray-400 hover:text-gold transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            View Public Site
          </Link>
          {isAuthenticated ? (
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-xs text-gray-400 hover:text-red-400 transition-colors w-full"
            >
              <LogOut className="w-3 h-3" />
              Sign Out
            </button>
          ) : (
            <button
              onClick={handleSignIn}
              className="flex items-center gap-2 px-4 py-2 text-xs text-gray-400 hover:text-gold transition-colors w-full"
            >
              <LogIn className="w-3 h-3" />
              Sign In
            </button>
          )}
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-charcoal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h1 className="font-heading text-lg text-charcoal">{adminName}</h1>
          <Link to="/" className="text-xs text-gray-500 hover:text-gold hidden sm:block">
            View Site →
          </Link>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
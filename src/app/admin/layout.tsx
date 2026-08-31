"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase/client";

const sidebarItems = [
  { label: "Dashboard", href: "/admin", icon: "📊" },
  { label: "Sections", href: "/admin/sections", icon: "📐" },
  { label: "Pages", href: "/admin/pages", icon: "📄" },
  { label: "Navbar", href: "/admin/navbar", icon: "🔗" },
  { label: "Site Settings", href: "/admin/settings", icon: "⚙️" },
  { label: "Prototype Screens", href: "/admin/prototype", icon: "📱" },
  { label: "Gallery", href: "/admin/gallery", icon: "📸" },
  { label: "Videos", href: "/admin/videos", icon: "🎬" },
  { label: "Surveys", href: "/admin/surveys", icon: "📋" },
  { label: "Feedback", href: "/admin/feedback", icon: "💬" },
  { label: "Contributors", href: "/admin/contributors", icon: "👥" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const sb = getSupabaseClient();
        const { data } = await sb.auth.getSession();
        if (!data.session) {
          router.push("/admin/login");
        } else {
          setAuthenticated(true);
        }
      } catch {
        router.push("/admin/login");
      }
      setLoading(false);
    };

    if (pathname === "/admin/login") {
      setLoading(false);
      return;
    }

    checkAuth();
  }, [pathname, router]);

  const handleLogout = async () => {
    const sb = getSupabaseClient();
    await sb.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading admin...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) return null;

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-primary)" }}>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 bottom-0 w-64 border-r z-40 transform transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--border-color)" }}>
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
              style={{ background: "var(--gradient-primary)" }}>
              E
            </div>
            <span className="font-bold" style={{ color: "var(--text-primary)" }}>EMERO Admin</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded-lg"
            style={{ color: "var(--text-secondary)" }}>
            ✕
          </button>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto" style={{ maxHeight: "calc(100vh - 140px)" }}>
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                pathname === item.href ? "" : ""
              }`}
              style={{
                background: pathname === item.href ? "rgba(220,38,38,0.1)" : "transparent",
                color: pathname === item.href ? "var(--accent-primary)" : "var(--text-secondary)",
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t" style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
          <Link href="/" target="_blank" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}>
            🌐 View Website
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full"
            style={{ color: "#ef4444" }}>
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-20 border-b px-4 md:px-8 h-16 flex items-center backdrop-blur-lg"
          style={{ background: "var(--nav-bg)", borderColor: "var(--border-color)" }}>
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 rounded-lg"
            style={{ color: "var(--text-secondary)" }}>
            ☰
          </button>
          <div className="ml-4 lg:ml-0">
            <h1 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              {sidebarItems.find((item) => item.href === pathname)?.label || "Admin"}
            </h1>
          </div>
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  FolderKanban,
  FileText,
  LogOut,
  Menu,
  X,
  Sun,
  Star,
  ExternalLink,
} from "lucide-react";

const NAV_SECTIONS = [
  {
    title: "Overview",
    items: [{ name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Leads",
    items: [
      { name: "Enquiries", href: "/admin/enquiries", icon: MessageSquare },
      { name: "Studio Designs", href: "/admin/solar-designs", icon: Sun },
    ],
  },
  {
    title: "Content",
    items: [
      { name: "Projects", href: "/admin/projects", icon: FolderKanban },
      { name: "Blog", href: "/admin/blogs", icon: FileText },
      { name: "Testimonials", href: "/admin/testimonials", icon: Star },
    ],
  },
];

const PAGE_TITLES = {
  "/admin/dashboard": "Dashboard",
  "/admin/enquiries": "Enquiries",
  "/admin/solar-designs": "Studio Designs",
  "/admin/projects": "Projects",
  "/admin/blogs": "Blog",
  "/admin/testimonials": "Testimonials",
};

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/admin/logout", { method: "POST" });
      if (res.ok) router.push("/admin/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30 w-64 flex flex-col
          bg-gradient-to-b from-[#0d1a12] to-[#111827] text-gray-300
          transform transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-white/10">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-600 to-emerald-500 flex items-center justify-center text-white text-sm font-bold">
            ☀️
          </span>
          <div>
            <div className="text-white font-bold leading-none">SolarOwl</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Admin Panel</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                {section.title}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm
                        ${isActive
                          ? "bg-green-500/15 text-emerald-300 font-semibold border border-green-500/20"
                          : "hover:bg-white/5 hover:text-white"}
                      `}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <item.icon className={`w-4.5 h-4.5 mr-3 ${isActive ? "text-emerald-400" : "text-gray-500"}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-3 py-2.5 rounded-lg text-sm hover:bg-white/5 hover:text-white transition-colors"
          >
            <ExternalLink className="w-4.5 h-4.5 mr-3 text-gray-500" />
            View website
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4.5 h-4.5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h2 className="text-lg font-semibold text-gray-800">
              {PAGE_TITLES[pathname] ?? "Admin"}
            </h2>
          </div>
          {/* Locale/timezone can differ between server and browser —
              suppress the harmless hydration diff for this timestamp. */}
          <div className="text-xs text-gray-400 hidden sm:block" suppressHydrationWarning>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

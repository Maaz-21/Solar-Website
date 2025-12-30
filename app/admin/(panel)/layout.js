"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  MessageSquare, 
  FolderKanban, 
  FileText, 
  HelpCircle, 
  LogOut, 
  Menu, 
  X 
} from "lucide-react";

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/admin/logout", {
        method: "POST",
      });
      if (res.ok) {
        router.push("/admin/login");
      }
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Enquiries", href: "/admin/enquiries", icon: MessageSquare },
    { name: "Projects", href: "/admin/projects", icon: FolderKanban },
    { name: "Blog", href: "/admin/blogs", icon: FileText },
    { name: "Testimonials", href: "/admin/testimonials", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="h-16 flex items-center justify-center border-b">
          <h1 className="text-xl font-bold text-green-600">Tiranga Solar</h1>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center px-4 py-3 rounded-lg transition-colors
                  ${isActive 
                    ? "bg-green-50 text-green-700" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
                `}
                onClick={() => setIsSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-8"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 lg:px-8">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <h2 className="text-xl font-semibold text-gray-800">Admin Panel</h2>
          <div className="w-6 lg:hidden" /> {/* Spacer for centering if needed */}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

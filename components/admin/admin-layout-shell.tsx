"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Calendar,
  Megaphone,
  Settings,
  Globe,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AdminLayoutShellProps {
  children: React.ReactNode;
  member: {
    full_name: string;
  };
  signOutButton: React.ReactNode;
}

export default function AdminLayoutShell({
  children,
  member,
  signOutButton,
}: AdminLayoutShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/applications", label: "Applications", icon: FileText },
    { href: "/admin/members", label: "Members", icon: Users },
    { href: "/admin/events", label: "Events", icon: Calendar },
    { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col justify-between h-full">
      <div className="p-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Link
              href="/admin"
              onClick={() => setIsSidebarOpen(false)}
              className="font-display text-xl font-black text-[#1D1B26] flex items-center gap-2"
            >
              <ShieldCheck className="h-5 w-5 text-wisteria stroke-[2.5]" />
              CODATOR Admin
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg border border-mist/40 hover:bg-mist/20"
            >
              <X className="h-4 w-4 text-ink/70" />
            </button>
          </div>
          <span className="text-5xs text-ink/50 font-semibold">
            Logged in as: <span className="font-bold text-wisteria">{member.full_name}</span>
          </span>
        </div>

        <nav className="mt-10 flex flex-col gap-2 text-xs font-bold">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 border transition-all duration-250 ${
                  isActive
                    ? "bg-wisteria/10 text-wisteria border-wisteria/15 font-extrabold"
                    : "border-transparent text-ink/75 hover:bg-wisteria/5 hover:text-wisteria hover:border-wisteria/10"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-wisteria" : "text-ink/40"}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-6 border-t border-mist/35 flex flex-col gap-2.5">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-xl px-4 py-2 text-xs font-bold text-ink/50 hover:text-ink transition-colors"
        >
          <Globe className="h-4 w-4" />
          Public Site
        </Link>
        {signOutButton}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8F8FC] text-ink overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-white/80 bg-white/30 backdrop-blur-md flex-col justify-between z-20 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-ink md:hidden"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 z-50 bg-white border-r border-mist shadow-xl md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Area */}
      <main className="flex-1 min-w-0 overflow-auto relative flex flex-col min-h-screen">
        {/* Soft background glows */}
        <div className="absolute top-0 right-0 w-[40vw] h-[40vw] rounded-full bg-wisteria/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[35vw] h-[35vw] rounded-full bg-skyline/5 blur-[100px] pointer-events-none" />

        <div className="relative z-10 p-6 md:p-10 flex-1 flex flex-col space-y-6">
          {/* Mobile Header Top Bar */}
          <header className="flex md:hidden justify-between items-center bg-white/50 border border-white/80 p-3.5 rounded-2xl backdrop-blur-md shadow-xs">
            <Link href="/admin" className="font-display text-base font-black text-[#1D1B26] flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-wisteria stroke-[2.5]" />
              CODATOR Admin
            </Link>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl border border-mist/40 hover:bg-mist/20 transition-all"
            >
              <Menu className="h-4 w-4 text-ink" />
            </button>
          </header>

          {/* Page Content */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

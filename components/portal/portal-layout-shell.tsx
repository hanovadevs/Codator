"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, LayoutDashboard, IdCard, Calendar, Globe, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PortalLayoutShellProps {
  children: React.ReactNode;
  member: {
    id: string;
    full_name: string;
    codator_id: string | null;
  };
  signOutButton: React.ReactNode;
}

export default function PortalLayoutShell({
  children,
  member,
  signOutButton,
}: PortalLayoutShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/portal", label: "Dashboard", icon: LayoutDashboard },
    { href: "/portal/id-card", label: "My ID & Pass", icon: IdCard },
    { href: "/portal/events", label: "My Events", icon: Calendar },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col justify-between h-full">
      <div className="p-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Link
              href="/portal"
              onClick={() => setIsSidebarOpen(false)}
              className="font-display text-xl font-black text-[#1D1B26] flex items-center gap-2"
            >
              <ShieldCheck className="h-5 w-5 text-wisteria stroke-[2.5]" />
              CODATOR Portal
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg border border-mist/40 hover:bg-mist/20"
            >
              <X className="h-4 w-4 text-ink/70" />
            </button>
          </div>
          <span className="text-5xs text-ink/40 font-bold uppercase tracking-wider">
            ID: <span className="font-mono text-wisteria">{member.codator_id || "PENDING"}</span>
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

      <div className="p-6 border-t border-mist/35">
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

      {/* Mobile Drawer (Framer Motion) */}
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
          {/* Top Bar */}
          <header className="flex justify-between md:justify-end items-center">
            {/* Mobile Toggle Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2.5 rounded-xl border border-white bg-white/50 backdrop-blur-md hover:bg-white transition-all shadow-xs"
            >
              <Menu className="h-5 w-5 text-ink" />
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/45 backdrop-blur-md px-3.5 py-1.5 text-5xs font-bold uppercase tracking-widest text-wisteria hover:bg-wisteria hover:text-white hover:shadow-md hover:shadow-wisteria/10 active:scale-[0.98] transition-all duration-300"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Back to Public Site</span>
            </Link>
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

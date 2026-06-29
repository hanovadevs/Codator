"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { type User as SupabaseUser } from "@supabase/supabase-js";

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/events", label: "Events" },
  { href: "/team", label: "Team" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // 2. Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="sticky top-4 z-50 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <nav className="border border-white/50 bg-white/60 backdrop-blur-xl shadow-sm transition-all py-1 rounded-2xl">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">


        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative h-9 w-9 overflow-hidden transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/without%20text_logo.png"
                  alt="CODATOR Logo"
                  fill
                  sizes="36px"
                  className="object-contain"
                  priority
                />
              </div>
              <span className="font-display text-xl font-bold tracking-tight text-ink group-hover:text-wisteria transition-colors">
                CODATOR
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6 text-sm font-medium text-ink/70">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative py-1 transition-colors hover:text-wisteria ${
                      isActive ? "text-wisteria font-semibold" : ""
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="activeNavUnderline"
                        className="absolute bottom-0 left-0 h-0.5 w-full bg-wisteria"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
            
            <div className="h-4 w-px bg-mist" />
            
            <div className="flex items-center gap-4">
              {user ? (
                <Link
                  href="/portal"
                  className="inline-flex items-center gap-2 rounded-xl border border-wisteria/40 bg-wisteria-tint/20 px-4 py-2 text-xs font-bold text-wisteria hover:bg-wisteria/10 active:scale-[0.98] transition-all shadow-xs"
                >
                  <User className="h-4 w-4" />
                  <span>My Portal</span>
                </Link>
              ) : (
                <>
                  <Link
                    href="/portal"
                    className="text-sm font-semibold text-ink/70 hover:text-wisteria transition-colors px-3 py-2"
                  >
                    Portal
                  </Link>
                  <Link
                    href="/join"
                    className="inline-flex items-center justify-center rounded-lg bg-wisteria px-4.5 py-2 text-sm font-semibold text-paper hover:bg-wisteria/90 active:scale-[0.98] transition-all shadow-sm"
                  >
                    Join Us
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-ink/70 hover:bg-wisteria-tint hover:text-wisteria transition-colors focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-mist/50 bg-white/40 rounded-b-2xl overflow-hidden"
          >

            <div className="space-y-1 px-4 py-4 pb-6">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`block rounded-lg px-4 py-2.5 text-base font-medium transition-colors ${
                      isActive
                        ? "bg-wisteria-tint text-wisteria font-semibold"
                        : "text-ink/70 hover:bg-wisteria-tint/50 hover:text-wisteria"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="my-4 h-px bg-mist" />
              <div className="flex flex-col gap-3">
                {user ? (
                  <Link
                    href="/portal"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-wisteria py-2.5 text-base font-semibold text-paper hover:bg-wisteria/90 transition-colors shadow-xs"
                  >
                    <User className="h-5 w-5" />
                    <span>My Portal</span>
                  </Link>
                ) : (
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <Link
                      href="/portal"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center rounded-lg border border-mist px-4 py-2.5 text-base font-semibold text-ink/70 hover:bg-wisteria-tint/50 hover:text-wisteria transition-colors"
                    >
                      Portal
                    </Link>
                    <Link
                      href="/join"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center rounded-lg bg-wisteria px-4 py-2.5 text-base font-semibold text-paper hover:bg-wisteria/90 transition-colors"
                    >
                      Join Us
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </nav>
    </div>
  );
}



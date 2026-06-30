"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Mail, Lock, Loader2, CheckCircle2, AlertCircle, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PortalLoginPage() {
  const [activeTab, setActiveTab] = useState<"signin" | "activate">("signin");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  // Sign In Form State
  const [signInForm, setSignInForm] = useState({
    email: "",
    password: "",
  });

  // Activate Form State
  const [activateForm, setActivateForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInForm.email,
        password: signInForm.password,
      });

      if (error) throw error;

      // Use a hard redirect to ensure cookies are fully committed and sent to the server
      window.location.href = "/portal";
    } catch (err) {
      console.error("Sign in error:", err);
      setErrorMsg(err instanceof Error ? err.message : "Failed to sign in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const { email, password, confirmPassword } = activateForm;

    // 1. Client-side validations
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    try {
      // 2. Call the server-side Activation API
      const response = await fetch("/api/auth/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === "NOT_REGISTERED") {
          setShowRegisterModal(true);
        }
        throw new Error(data.error || "Failed to activate account.");
      }

      setSuccessMsg(
        data.message || "Account activated successfully! Please check your email for the confirmation link."
      );
      
      // Reset form
      setActivateForm({ email: "", password: "", confirmPassword: "" });
    } catch (err) {
      console.error("Activation error:", err);
      setErrorMsg(err instanceof Error ? err.message : "Failed to activate account.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-paper pt-28 pb-20 text-ink flex items-center justify-center px-4 relative overflow-hidden">
      {/* Soft background glow */}
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-wisteria/10 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-skyline/10 blur-3xl pointer-events-none animate-pulse" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-4">
          <Link href="/" className="inline-block relative h-14 w-14 hover:scale-105 transition-transform">
            <Image
              src="/without%20text_logo.png"
              alt="CODATOR Logo"
              fill
              className="object-contain"
              priority
            />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-black tracking-tight">Member Portal</h1>
            <p className="text-4xs font-bold text-ink/50 uppercase tracking-widest mt-1">
              Computer Science & Engineering Society
            </p>
          </div>
        </div>

        {/* Card Container */}
        <div className="border border-mist/80 bg-white/70 backdrop-blur-md rounded-3xl p-8 shadow-xl space-y-6">
          {/* Tabs */}
          <div className="flex border-b border-mist pb-0.5">
            <button
              onClick={() => {
                setActiveTab("signin");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`flex-1 pb-3 text-xs font-bold transition-colors cursor-pointer relative ${
                activeTab === "signin" ? "text-wisteria" : "text-ink/40 hover:text-ink/60"
              }`}
            >
              Sign In
              {activeTab === "signin" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-wisteria" />
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab("activate");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`flex-1 pb-3 text-xs font-bold transition-colors cursor-pointer relative ${
                activeTab === "activate" ? "text-wisteria" : "text-ink/40 hover:text-ink/60"
              }`}
            >
              Activate Account
              {activeTab === "activate" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-wisteria" />
              )}
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="rounded-xl bg-red-50 p-4 border border-red-200 text-xs font-semibold text-red-800 flex items-start gap-2.5">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-600" />
              <p className="leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-start gap-2.5">
              <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-600" />
              <p className="leading-relaxed">{successMsg}</p>
            </div>
          )}

          {/* ================= SIGN IN TAB ================= */}
          {activeTab === "signin" ? (
            <form onSubmit={handleSignIn} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-ink/75 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-ink/35" />
                  <input
                    type="email"
                    required
                    placeholder="you@university.edu"
                    value={signInForm.email}
                    onChange={(e) => setSignInForm({ ...signInForm, email: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 bg-paper border border-mist rounded-xl focus:outline-none focus:border-wisteria placeholder:text-ink/30"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-ink/75 block">Password</label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-ink/35" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={signInForm.password}
                    onChange={(e) => setSignInForm({ ...signInForm, password: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 bg-paper border border-mist rounded-xl focus:outline-none focus:border-wisteria placeholder:text-ink/30"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-wisteria py-3 text-xs font-bold text-paper hover:bg-wisteria/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-6"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Sign In</span>}
              </button>
            </form>
          ) : (
            /* ================= ACTIVATE TAB ================= */
            <form onSubmit={handleActivate} className="space-y-4 text-xs font-semibold">
              <div className="bg-wisteria-tint/10 border border-wisteria/10 rounded-xl p-3.5 text-4xs text-wisteria leading-relaxed">
                <span className="font-bold block mb-0.5">Note on Activation:</span>
                Approved and manually added members must activate their accounts here. Enter the email associated with your membership application to set a password.
              </div>

              <div className="space-y-1">
                <label className="text-ink/75 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-ink/35" />
                  <input
                    type="email"
                    required
                    placeholder="you@university.edu"
                    value={activateForm.email}
                    onChange={(e) => setActivateForm({ ...activateForm, email: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 bg-paper border border-mist rounded-xl focus:outline-none focus:border-wisteria placeholder:text-ink/30"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-ink/75 block">Choose Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-ink/35" />
                  <input
                    type="password"
                    required
                    placeholder="Min. 6 characters"
                    value={activateForm.password}
                    onChange={(e) => setActivateForm({ ...activateForm, password: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 bg-paper border border-mist rounded-xl focus:outline-none focus:border-wisteria placeholder:text-ink/30"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-ink/75 block">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-ink/35" />
                  <input
                    type="password"
                    required
                    placeholder="Re-enter password"
                    value={activateForm.confirmPassword}
                    onChange={(e) => setActivateForm({ ...activateForm, confirmPassword: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 bg-paper border border-mist rounded-xl focus:outline-none focus:border-wisteria placeholder:text-ink/30"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-wisteria py-3 text-xs font-bold text-paper hover:bg-wisteria/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-6"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Activate & Sign Up</span>}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* ================= REGISTER PROMPT MODAL ================= */}
      <AnimatePresence>
        {showRegisterModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRegisterModal(false)}
              className="fixed inset-0 z-50 bg-[#13121A]/40 backdrop-blur-xs flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                transition={{ type: "spring", damping: 25, stiffness: 250 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm bg-paper border border-mist p-6 rounded-3xl shadow-2xl text-center space-y-5"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-wisteria-tint text-wisteria border border-wisteria/10">
                  <UserPlus className="h-6 w-6" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-display text-lg font-black text-ink">Not a Registered Member?</h3>
                  <p className="text-xs text-ink/65 leading-relaxed font-semibold">
                    This email is not registered in our society database. You must apply to join CODATOR before you can activate your account.
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-2 text-xs font-bold">
                  <Link
                    href="/join"
                    className="w-full rounded-xl bg-wisteria py-2.5 text-paper hover:bg-wisteria/90 transition-all text-center"
                  >
                    Apply for Membership
                  </Link>
                  <button
                    onClick={() => setShowRegisterModal(false)}
                    className="w-full rounded-xl border border-mist py-2.5 text-ink hover:bg-mist/30 transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

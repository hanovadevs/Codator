"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        throw error;
      }

      // Use a hard redirect to ensure cookies are fully committed and sent to the server
      window.location.href = "/admin";
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to log in. Please check your credentials.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-paper py-12 sm:px-6 lg:px-8 text-ink">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="relative h-16 w-16">
            <Image
              src="/without%20text_logo.png"
              alt="CODATOR Logo"
              fill
              className="object-contain"
              priority
            />

          </div>
        </div>
        <h2 className="mt-6 text-center font-display text-3xl font-extrabold tracking-tight text-ink">
          CODATOR Admin
        </h2>
        <p className="mt-2 text-center text-sm text-ink/65">
          Sign in to manage the society platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-paper border border-mist rounded-2xl p-8 shadow-sm">
          {errorMsg && (
            <div className="mb-6 flex items-start gap-2.5 rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-800 border border-red-200">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink/85 mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4.5 w-4.5 text-ink/45" />
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-mist bg-paper pl-10 pr-4 py-2.5 text-sm text-ink focus:border-wisteria focus:outline-none focus:ring-1 focus:ring-wisteria transition-colors"
                  placeholder="uetcodator@gmail.com"

                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink/85 mb-1.5">
                Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4.5 w-4.5 text-ink/45" />
                </div>
                <input
                  type="password"
                  name="password"
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-mist bg-paper pl-10 pr-4 py-2.5 text-sm text-ink focus:border-wisteria focus:outline-none focus:ring-1 focus:ring-wisteria transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center rounded-lg bg-wisteria px-4 py-3 text-sm font-semibold text-paper shadow-sm hover:bg-wisteria/90 active:scale-[0.99] transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

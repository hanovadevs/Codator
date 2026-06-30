"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, CheckCircle2, AlertTriangle, Shield, Settings, Users, Mail, Globe, Lock, Loader2 } from "lucide-react";

interface SettingsClientProps {
  initialSettings: Record<string, string>;
}

type TabType = "general" | "membership" | "security";

export default function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleInputChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSuccessMsg("");
    setErrorMsg("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save settings.");
      }

      setSuccessMsg("Settings saved successfully!");
      // Auto-clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "general", label: "General Settings", icon: Settings },
    { id: "membership", label: "Membership Settings", icon: Users },
    { id: "security", label: "Security & Keys", icon: Shield },
  ];

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink mb-2">Admin Settings</h1>
        <p className="text-ink/70">Configure society parameters, membership registration rules, and security options.</p>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 p-4 text-xs font-semibold text-green-800"
          >
            <CheckCircle2 className="h-4.5 w-4.5 text-green-600 shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-800"
          >
            <AlertTriangle className="h-4.5 w-4.5 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Sidebar Tabs */}
        <div className="md:col-span-4 flex flex-col gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-3 w-full px-4.5 py-3 rounded-xl text-xs font-bold transition-all text-left border cursor-pointer ${
                  isActive
                    ? "bg-wisteria text-paper border-wisteria shadow-md shadow-wisteria/10"
                    : "bg-white/30 backdrop-blur-xs border-mist hover:bg-white/60 text-ink/70 hover:text-ink"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Form */}
        <form onSubmit={handleSave} className="md:col-span-8 flex flex-col justify-between min-h-[360px] border border-white/80 bg-white/40 backdrop-blur-md rounded-3xl p-6 shadow-xs">
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {activeTab === "general" && (
                <motion.div
                  key="general"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <h3 className="font-display text-sm font-bold text-ink border-b border-mist/45 pb-2">General Society Configuration</h3>
                  
                  {/* Society Name */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-ink/80">
                      <Globe className="h-4 w-4 text-ink/45" />
                      Society Name
                    </label>
                    <input
                      type="text"
                      required
                      value={settings.society_name || ""}
                      onChange={(e) => handleInputChange("society_name", e.target.value)}
                      className="w-full px-4 py-2.5 bg-paper border border-mist rounded-xl focus:outline-none focus:border-wisteria text-xs font-semibold"
                      placeholder="e.g. CODATOR"
                    />
                    <p className="text-5xs text-ink/45">The brand name used across headers, emails, and student passes.</p>
                  </div>

                  {/* Contact Email */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-ink/80">
                      <Mail className="h-4 w-4 text-ink/45" />
                      Contact Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={settings.contact_email || ""}
                      onChange={(e) => handleInputChange("contact_email", e.target.value)}
                      className="w-full px-4 py-2.5 bg-paper border border-mist rounded-xl focus:outline-none focus:border-wisteria text-xs font-semibold"
                      placeholder="e.g. contact@codator.org"
                    />
                    <p className="text-5xs text-ink/45">The default reply-to email for welcome messages and approvals.</p>
                  </div>
                </motion.div>
              )}

              {activeTab === "membership" && (
                <motion.div
                  key="membership"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <h3 className="font-display text-sm font-bold text-ink border-b border-mist/45 pb-2">Membership Registration Rules</h3>

                  {/* Toggle registrations */}
                  <div className="flex items-center justify-between p-4 bg-paper/50 border border-mist/40 rounded-xl">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-ink">Open for New Applications</label>
                      <p className="text-5xs text-ink/50">Allow students to submit applications via the public /join form.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleInputChange("registrations_open", settings.registrations_open === "true" ? "false" : "true")}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        settings.registrations_open === "true" ? "bg-wisteria" : "bg-mist"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          settings.registrations_open === "true" ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Allowed email domains */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-ink/80">
                      <Globe className="h-4 w-4 text-ink/45" />
                      Allowed University Domains
                    </label>
                    <input
                      type="text"
                      value={settings.allowed_domains || ""}
                      onChange={(e) => handleInputChange("allowed_domains", e.target.value)}
                      className="w-full px-4 py-2.5 bg-paper border border-mist rounded-xl focus:outline-none focus:border-wisteria text-xs font-semibold"
                      placeholder="e.g. .edu, .edu.pk"
                    />
                    <p className="text-5xs text-ink/45">Comma-separated list of suffixes allowed for registration emails.</p>
                  </div>
                </motion.div>
              )}

              {activeTab === "security" && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <h3 className="font-display text-sm font-bold text-ink border-b border-mist/45 pb-2">Security & Pass Verification Keys</h3>

                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex gap-3 text-5xs text-amber-800 leading-relaxed font-semibold">
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                    <div className="space-y-1">
                      <p className="font-bold text-xs text-amber-900">Warning: High Security Parameter</p>
                      <p>Modifying cryptographic keys or secrets can invalidate all currently active member QR codes. Ensure you know what you are doing.</p>
                    </div>
                  </div>

                  {/* Pass token secret info */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-ink/80">
                      <Lock className="h-4 w-4 text-ink/45" />
                      Pass Token Cryptographic Salt / Secret
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        disabled
                        value="••••••••••••••••••••••••••••••••"
                        className="w-full px-4 py-2.5 bg-mist/30 border border-mist rounded-xl focus:outline-none text-xs font-mono text-ink/50 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-5xs text-ink/45">This value is loaded securely from server environment variables (`PASS_SECRET`) for cryptographic signing.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Form Footer Action */}
          <div className="mt-8 border-t border-mist/30 pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-wisteria px-5 py-2.5 text-xs font-bold text-paper hover:bg-wisteria/90 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-wisteria/10"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

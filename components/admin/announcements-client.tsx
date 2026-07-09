"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Megaphone,
  Trash2,
  Calendar,
  AlertTriangle,
  Briefcase,
  Info,
  Loader2,
  Send,
  Mail,
  CheckCircle,
  Search,
  Filter,
  Clock,
} from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: "general" | "event" | "urgent" | "opportunity";
  created_at: string;
  created_by: string;
}

interface AnnouncementsClientProps {
  initialAnnouncements: Announcement[];
}

export default function AnnouncementsClient({ initialAnnouncements }: AnnouncementsClientProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [lastEmailResult, setLastEmailResult] = useState<{
    sent: number;
    total: number;
  } | null>(null);

  const [newForm, setNewForm] = useState({
    title: "",
    category: "general" as "general" | "event" | "urgent" | "opportunity",
    content: "",
  });

  const supabase = createClient();

  // Handle creating an announcement via the new API (with email blast)
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.title.trim() || !newForm.content.trim()) return;

    setIsSubmitting(true);
    setLastEmailResult(null);

    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newForm.title,
          content: newForm.content,
          category: newForm.category,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create announcement");

      if (data.announcement) {
        setAnnouncements((prev) => [data.announcement, ...prev]);
      }

      setLastEmailResult({
        sent: data.emailsSent || 0,
        total: data.emailsTotal || 0,
      });

      setNewForm({ title: "", category: "general", content: "" });
      setIsCreateOpen(false);
    } catch (err) {
      console.error("Error creating announcement:", err);
      alert(err instanceof Error ? err.message : "Failed to post announcement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting an announcement
  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement? It will be removed from all member portals immediately.")) {
      return;
    }

    try {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) throw error;
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Error deleting announcement:", err);
      alert(err instanceof Error ? err.message : "Failed to delete announcement.");
    }
  };

  // Category config map
  const categoryConfig: Record<string, { icon: React.ReactNode; badge: string; accent: string; accentBg: string; label: string }> = {
    general: {
      icon: <Info className="h-3.5 w-3.5" />,
      badge: "bg-blue-50 text-blue-700 border-blue-200",
      accent: "#3b82f6",
      accentBg: "rgba(59,130,246,0.06)",
      label: "General Notice",
    },
    event: {
      icon: <Calendar className="h-3.5 w-3.5" />,
      badge: "bg-purple-50 text-purple-700 border-purple-200",
      accent: "#8b5cf6",
      accentBg: "rgba(139,92,246,0.06)",
      label: "Event Broadcast",
    },
    urgent: {
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
      badge: "bg-red-50 text-red-700 border-red-200",
      accent: "#ef4444",
      accentBg: "rgba(239,68,68,0.06)",
      label: "Urgent Alert",
    },
    opportunity: {
      icon: <Briefcase className="h-3.5 w-3.5" />,
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      accent: "#10b981",
      accentBg: "rgba(16,185,129,0.06)",
      label: "Opportunity",
    },
  };

  const getConfig = (cat: string) => categoryConfig[cat] || categoryConfig.general;

  // Relative time helper
  const getRelativeTime = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { dateStyle: "medium" });
  };

  // Filter announcements
  const filteredAnnouncements = announcements.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || a.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Stats
  const stats = {
    total: announcements.length,
    urgent: announcements.filter((a) => a.category === "urgent").length,
    events: announcements.filter((a) => a.category === "event").length,
    general: announcements.filter((a) => a.category === "general").length,
    opportunities: announcements.filter((a) => a.category === "opportunity").length,
  };

  return (
    <div className="space-y-6 text-ink">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-ink flex items-center gap-2.5">
            <Megaphone className="h-6 w-6 text-wisteria" />
            Announcement Broadcaster
          </h1>
          <p className="text-3xs text-ink/55 font-semibold">
            Broadcast society announcements and notices — emails are sent to every registered member automatically.
          </p>
        </div>
        <button
          onClick={() => { setIsCreateOpen(true); setLastEmailResult(null); }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-wisteria px-5 py-2.5 text-4xs font-bold text-paper hover:bg-wisteria/90 transition-all shadow-xs cursor-pointer self-start sm:self-auto active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          <span>New Broadcast</span>
        </button>
      </div>

      {/* Email Send Success Toast */}
      <AnimatePresence>
        {lastEmailResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 backdrop-blur-sm"
          >
            <div className="rounded-full bg-emerald-100 p-2 border border-emerald-200">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="flex-1">
              <span className="text-4xs font-bold text-emerald-800 block">Broadcast Published Successfully</span>
              <span className="text-[10px] font-semibold text-emerald-600">
                <Mail className="h-3 w-3 inline mr-0.5" />
                {lastEmailResult.sent} of {lastEmailResult.total} member emails delivered
              </span>
            </div>
            <button onClick={() => setLastEmailResult(null)} className="text-emerald-400 hover:text-emerald-600 cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Statistics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total", value: stats.total, color: "#8B7FE8" },
          { label: "General", value: stats.general, color: "#3b82f6" },
          { label: "Events", value: stats.events, color: "#8b5cf6" },
          { label: "Urgent", value: stats.urgent, color: "#ef4444" },
          { label: "Opportunities", value: stats.opportunities, color: "#10b981" },
        ].map((s) => (
          <div
            key={s.label}
            className="border border-mist rounded-xl p-3.5 bg-white/30 flex items-center gap-3"
          >
            <span className="font-display text-xl font-black" style={{ color: s.color }}>
              {s.value}
            </span>
            <span className="text-[9px] font-bold text-ink/40 uppercase tracking-widest">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink/30" />
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-4xs font-semibold border border-mist bg-white/50 rounded-xl focus:border-wisteria outline-none transition-all placeholder:text-ink/30"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap bg-[#F8F8FC] border border-mist/55 p-1 rounded-xl shrink-0">
          {["all", "general", "event", "urgent", "opportunity"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer capitalize ${
                categoryFilter === cat
                  ? "bg-white text-wisteria shadow-sm border border-mist/40"
                  : "text-ink/50 hover:text-ink"
              }`}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="border border-dashed border-mist rounded-3xl p-12 text-center text-ink/50 bg-white/30">
            <Megaphone className="h-8 w-8 mx-auto text-ink/25 mb-3" />
            <p className="text-sm font-bold">
              {announcements.length === 0 ? "No announcements broadcasted yet." : "No announcements match your search."}
            </p>
            <p className="text-4xs text-ink/40 mt-1">
              {announcements.length === 0
                ? 'Click "New Broadcast" above to create one.'
                : "Try adjusting your search or filter."}
            </p>
          </div>
        ) : (
          filteredAnnouncements.map((announcement, idx) => {
            const config = getConfig(announcement.category);
            return (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03, duration: 0.3 }}
                className="relative overflow-hidden border border-mist/70 rounded-2xl bg-white/40 backdrop-blur-xs shadow-xs hover:shadow-md hover:border-mist transition-all duration-300 group"
              >
                {/* Left accent bar */}
                <div
                  className="absolute top-0 left-0 bottom-0 w-[3px]"
                  style={{ background: config.accent }}
                />

                <div className="p-5 pl-6 flex justify-between gap-6">
                  <div className="space-y-2.5 flex-grow min-w-0">
                    {/* Top meta row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${config.badge}`}
                      >
                        {config.icon}
                        {config.label}
                      </span>
                      <span className="text-[10px] font-semibold text-ink/40 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {getRelativeTime(announcement.created_at)}
                      </span>
                      <span className="text-[9px] font-mono text-ink/25 hidden sm:inline">
                        {new Date(announcement.created_at).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Title and content */}
                    <div className="space-y-1">
                      <h3 className="font-display text-sm sm:text-base font-bold text-ink leading-snug group-hover:text-wisteria transition-colors">
                        {announcement.title}
                      </h3>
                      <p className="text-3xs font-semibold text-ink/60 leading-relaxed whitespace-pre-wrap line-clamp-3">
                        {announcement.content}
                      </p>
                    </div>

                    {/* Delivery indicator */}
                    <div className="flex items-center gap-1.5 text-[9px] font-semibold text-ink/30">
                      <Mail className="h-3 w-3" />
                      <span>Emailed to all active members</span>
                    </div>
                  </div>

                  {/* Delete action */}
                  <div className="shrink-0 self-start opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                      className="rounded-lg p-2 text-ink/30 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all cursor-pointer"
                      title="Delete announcement"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* ================= NEW BROADCAST SLIDE-OVER ================= */}
      <AnimatePresence>
        {isCreateOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateOpen(false)}
              className="fixed inset-0 z-50 bg-[#13121A]/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-paper border-l border-mist shadow-2xl flex flex-col"
            >
              <div className="flex-grow overflow-y-auto p-6 space-y-6">
                {/* Slide-over header */}
                <div className="flex items-center justify-between border-b border-mist pb-4">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-wisteria/10 p-2 border border-wisteria/15">
                      <Send className="h-4 w-4 text-wisteria" />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-black text-ink">New Broadcast</h3>
                      <span className="text-[10px] font-semibold text-ink/40">
                        Emails will be sent to all registered members
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsCreateOpen(false)}
                    className="rounded-lg p-1.5 text-ink/50 hover:bg-mist/45 transition-colors cursor-pointer"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                <form id="new-broadcast-form" onSubmit={handleCreateAnnouncement} className="space-y-5">
                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="text-4xs font-bold text-ink uppercase tracking-wider block">
                      Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Workshop Registration Open"
                      value={newForm.title}
                      onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                      className="w-full px-4 py-3 text-4xs font-semibold bg-white border border-mist rounded-xl focus:outline-none focus:border-wisteria transition-all placeholder:text-ink/30"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="text-4xs font-bold text-ink uppercase tracking-wider block">
                      Category <span className="text-red-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["general", "event", "urgent", "opportunity"] as const).map((cat) => {
                        const cfg = getConfig(cat);
                        const isSelected = newForm.category === cat;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setNewForm({ ...newForm, category: cat })}
                            className={`flex items-center gap-2 p-3 rounded-xl border text-4xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? `border-current shadow-sm`
                                : "border-mist bg-white/50 text-ink/60 hover:border-mist/80"
                            }`}
                            style={isSelected ? { color: cfg.accent, background: cfg.accentBg, borderColor: `${cfg.accent}40` } : {}}
                          >
                            {cfg.icon}
                            <span className="capitalize">{cfg.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-4xs font-bold text-ink uppercase tracking-wider block">
                        Message Content <span className="text-red-400">*</span>
                      </label>
                      <span className="text-[9px] font-mono text-ink/30">
                        {newForm.content.length} chars
                      </span>
                    </div>
                    <textarea
                      required
                      rows={10}
                      placeholder="Type your broadcast message here. This will be emailed to every active society member..."
                      value={newForm.content}
                      onChange={(e) => setNewForm({ ...newForm, content: e.target.value })}
                      className="w-full px-4 py-3 text-4xs font-semibold bg-white border border-mist rounded-xl focus:outline-none focus:border-wisteria resize-none transition-all placeholder:text-ink/30 leading-relaxed"
                    />
                  </div>

                  {/* Email notice */}
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-amber-200/50 bg-amber-50/40 text-amber-800">
                    <Mail className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
                    <span className="text-[10px] font-semibold leading-relaxed">
                      Publishing this broadcast will immediately send an email notification to <strong>every active registered member</strong> of the society, and display the announcement on all member portals and the public website.
                    </span>
                  </div>
                </form>
              </div>

              {/* Action buttons */}
              <div className="border-t border-mist p-6 flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1 rounded-xl border border-mist py-2.5 text-4xs font-bold text-ink hover:bg-mist/30 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="new-broadcast-form"
                  disabled={isSubmitting || !newForm.title.trim() || !newForm.content.trim()}
                  className="flex-1 rounded-xl bg-wisteria py-2.5 text-4xs font-bold text-paper hover:bg-wisteria/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Publish & Email All Members
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

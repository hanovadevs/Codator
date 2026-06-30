"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Megaphone, Trash2, Calendar, AlertTriangle, Briefcase, Info, Loader2 } from "lucide-react";

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
  const [adminMemberId, setAdminMemberId] = useState<string | null>(null);

  const [newForm, setNewForm] = useState({
    title: "",
    category: "general" as "general" | "event" | "urgent" | "opportunity",
    content: "",
  });

  const supabase = createClient();

  // Fetch the logged-in admin's member ID on mount
  useEffect(() => {
    const fetchAdminId = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: member } = await supabase
          .from("members")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (member) {
          setAdminMemberId(member.id);
        }
      }
    };
    fetchAdminId();
  }, []);

  // Handle creating an announcement
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminMemberId) {
      alert("Failed to verify administrator identity. Please try logging in again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from("announcements")
        .insert([
          {
            title: newForm.title,
            category: newForm.category,
            content: newForm.content,
            created_by: adminMemberId,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setAnnouncements((prev) => [data, ...prev]);
      }

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

  // Category Icon Helper
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "urgent":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "opportunity":
        return <Briefcase className="h-4 w-4 text-emerald-600" />;
      case "event":
        return <Calendar className="h-4 w-4 text-purple-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  // Category Badge Colors
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "urgent":
        return "bg-red-50 text-red-700 border-red-200";
      case "opportunity":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "event":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  return (
    <div className="space-y-6 text-ink">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black tracking-tight text-ink">Announcement Broadcaster</h1>
          <p className="text-xs text-ink/65 mt-1.5">Broadcast society announcements and notices directly to member portals.</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-wisteria px-4 py-2.5 text-xs font-bold text-paper hover:bg-wisteria/90 transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Broadcast</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="grid grid-cols-1 gap-4">
        {announcements.length === 0 ? (
          <div className="border border-dashed border-mist rounded-3xl p-12 text-center text-ink/50 bg-white/30">
            <Megaphone className="h-8 w-8 mx-auto text-ink/30 mb-3" />
            <p className="text-sm font-bold">No announcements broadcasted yet.</p>
            <p className="text-4xs text-ink/40 mt-1">Click &quot;New Broadcast&quot; above to create one.</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="border border-mist/80 rounded-2xl p-5 bg-white/50 backdrop-blur-xs shadow-xs flex justify-between gap-6"
            >
              <div className="space-y-3 flex-grow">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className={`inline-flex items-center gap-1 text-5xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getCategoryBadgeClass(announcement.category)}`}>
                    {getCategoryIcon(announcement.category)}
                    {announcement.category}
                  </span>
                  <span className="text-5xs font-semibold text-ink/50 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(announcement.created_at).toLocaleDateString(undefined, {
                      dateStyle: "medium",
                    })}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-display text-base font-bold text-ink leading-snug">{announcement.title}</h3>
                  <p className="text-xs font-semibold text-ink/65 leading-relaxed whitespace-pre-wrap">{announcement.content}</p>
                </div>
              </div>
              <div className="shrink-0 self-start">
                <button
                  onClick={() => handleDeleteAnnouncement(announcement.id)}
                  className="rounded-lg p-1.5 text-ink/40 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all cursor-pointer"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          ))
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
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-paper border-l border-mist p-6 shadow-2xl flex flex-col justify-between"
            >
              <div className="space-y-6 overflow-y-auto pr-2 flex-grow">
                <div className="flex items-center justify-between border-b border-mist pb-4">
                  <h3 className="font-display text-lg font-black text-ink">New Announcement</h3>
                  <button
                    onClick={() => setIsCreateOpen(false)}
                    className="rounded-lg p-1.5 text-ink/50 hover:bg-mist/45 transition-colors cursor-pointer"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                <form id="new-broadcast-form" onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs font-semibold">
                  <div>
                    <label className="block text-ink/75 mb-1">Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Workshop Registration Open"
                      value={newForm.title}
                      onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                      className="w-full px-3 py-2 bg-paper border border-mist rounded-xl focus:outline-none focus:border-wisteria"
                    />
                  </div>

                  <div>
                    <label className="block text-ink/75 mb-1">Category *</label>
                    <select
                      value={newForm.category}
                      onChange={(e) => setNewForm({ ...newForm, category: e.target.value as "general" | "event" | "urgent" | "opportunity" })}
                      className="w-full px-3 py-2 bg-paper border border-mist rounded-xl focus:outline-none focus:border-wisteria font-semibold"
                    >
                      <option value="general">General Notice</option>
                      <option value="event">Event Broadcast</option>
                      <option value="urgent">Urgent Announcement</option>
                      <option value="opportunity">Opportunity / Internship</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-ink/75 mb-1">Message Content *</label>
                    <textarea
                      required
                      rows={8}
                      placeholder="Type your broadcast message here..."
                      value={newForm.content}
                      onChange={(e) => setNewForm({ ...newForm, content: e.target.value })}
                      className="w-full px-3 py-2 bg-paper border border-mist rounded-xl focus:outline-none focus:border-wisteria resize-none"
                    />
                  </div>
                </form>
              </div>

              <div className="border-t border-mist pt-4 mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1 rounded-xl border border-mist py-2.5 text-xs font-bold text-ink hover:bg-mist/30 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="new-broadcast-form"
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl bg-wisteria py-2.5 text-xs font-bold text-paper hover:bg-wisteria/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>Publish Notice</span>
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

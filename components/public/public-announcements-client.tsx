"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Megaphone, Calendar, AlertTriangle, Briefcase, Info, Clock, ArrowRight } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: "general" | "event" | "urgent" | "opportunity";
  created_at: string;
}

interface PublicAnnouncementsClientProps {
  initialAnnouncements: Announcement[];
}

export default function PublicAnnouncementsClient({ initialAnnouncements }: PublicAnnouncementsClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeAnnouncement, setActiveAnnouncement] = useState<Announcement | null>(null);

  const getCategoryConfig = (category: string) => {
    switch (category) {
      case "urgent":
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          badge: "bg-red-500/10 text-red-700 border-red-200/50",
          accent: "bg-red-500",
          label: "Urgent",
        };
      case "opportunity":
        return {
          icon: <Briefcase className="h-4 w-4" />,
          badge: "bg-emerald-500/10 text-emerald-700 border-emerald-200/50",
          accent: "bg-emerald-500",
          label: "Opportunity",
        };
      case "event":
        return {
          icon: <Calendar className="h-4 w-4" />,
          badge: "bg-purple-500/10 text-purple-700 border-purple-200/50",
          accent: "bg-purple-500",
          label: "Event",
        };
      default:
        return {
          icon: <Info className="h-4 w-4" />,
          badge: "bg-blue-500/10 text-blue-700 border-blue-200/50",
          accent: "bg-blue-500",
          label: "Notice",
        };
    }
  };

  const filtered = initialAnnouncements.filter((ann) => {
    const matchesSearch =
      ann.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ann.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || ann.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-12">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/30" />
          <input
            type="text"
            placeholder="Search announcement topics or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold border border-mist bg-white/70 focus:border-wisteria rounded-xl outline-none transition-all placeholder:text-ink/30 shadow-3xs"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-1.5 flex-wrap bg-white/60 border border-mist/55 p-1 rounded-xl shadow-3xs">
          {["all", "general", "event", "urgent", "opportunity"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-wisteria text-white shadow-sm"
                  : "text-ink/65 hover:text-wisteria"
              }`}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Announcements */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs font-semibold text-ink/45 flex flex-col items-center gap-3 bg-white/20 rounded-3xl border border-dashed border-mist">
            <Megaphone className="h-10 w-10 text-ink/20" />
            <span>No notices or announcements found matching your filter criteria.</span>
          </div>
        ) : (
          filtered.map((ann, idx) => {
            const config = getCategoryConfig(ann.category);
            return (
              <motion.div
                key={ann.id}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="relative overflow-hidden border border-mist hover:border-wisteria/40 bg-white/40 hover:bg-white/80 transition-all rounded-3xl p-6 shadow-3xs hover:shadow-md flex flex-col justify-between h-[240px] group cursor-pointer"
                onClick={() => setActiveAnnouncement(ann)}
              >
                {/* Left accent bar */}
                <div className={`absolute top-0 left-0 bottom-0 w-[4px] ${config.accent}`} />

                <div className="space-y-4">
                  {/* Category and Date */}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-md border ${config.badge}`}>
                      {config.icon}
                      {config.label}
                    </span>
                    <span className="text-[10px] font-semibold text-ink/40 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(ann.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Title and Body Clip */}
                  <div className="space-y-1.5">
                    <h3 className="font-display text-base font-bold text-ink leading-snug group-hover:text-wisteria transition-colors line-clamp-2">
                      {ann.title}
                    </h3>
                    <p className="text-4xs font-semibold text-ink/65 leading-relaxed line-clamp-3">
                      {ann.content}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-wisteria group-hover:gap-2.5 transition-all mt-4">
                  <span>Read Announcement</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* ================= ANNOUNCEMENT DETAILS MODAL ================= */}
      <AnimatePresence>
        {activeAnnouncement && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveAnnouncement(null)}
              className="fixed inset-0 z-50 bg-[#13121A]/35 backdrop-blur-xs flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-2xl bg-white border border-mist rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col space-y-6 max-h-[90vh] overflow-y-auto"
              >
                {/* Close Button */}
                <button
                  onClick={() => setActiveAnnouncement(null)}
                  className="absolute top-5 right-5 rounded-xl p-2 text-ink/50 hover:bg-mist/40 transition-all cursor-pointer border border-transparent hover:border-mist/35"
                >
                  <X className="h-4.5 w-4.5" />
                </button>

                {/* Meta details */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-md border ${getCategoryConfig(activeAnnouncement.category).badge}`}>
                    {getCategoryConfig(activeAnnouncement.category).icon}
                    {getCategoryConfig(activeAnnouncement.category).label}
                  </span>
                  <span className="text-xs font-semibold text-ink/40 flex items-center gap-1.5 border-l border-mist/50 pl-3">
                    <Calendar className="h-4 w-4" />
                    Posted on {new Date(activeAnnouncement.created_at).toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h2 className="font-display text-xl sm:text-2xl font-black text-ink leading-tight pr-6">
                    {activeAnnouncement.title}
                  </h2>
                  <div className="h-[1px] bg-gradient-to-r from-mist/55 via-mist/10 to-transparent" />
                  <p className="text-xs font-semibold text-ink/75 leading-relaxed whitespace-pre-wrap">
                    {activeAnnouncement.content}
                  </p>
                </div>

                {/* Footer buttons */}
                <div className="pt-2 border-t border-mist/30 flex justify-end">
                  <button
                    onClick={() => setActiveAnnouncement(null)}
                    className="px-6 py-2.5 bg-wisteria hover:bg-wisteria/90 text-white text-4xs font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-3xs cursor-pointer active:scale-[0.98]"
                  >
                    Close notice
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

// Inline replacement for X icon to avoid import issues
function X(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

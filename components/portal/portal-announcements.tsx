"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, Calendar, AlertTriangle, Briefcase, Info, ChevronDown, ChevronUp, Search, Filter, Bell } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: "general" | "event" | "urgent" | "opportunity";
  created_at: string;
}

interface PortalAnnouncementsProps {
  initialAnnouncements: Announcement[];
}

export default function PortalAnnouncements({ initialAnnouncements }: PortalAnnouncementsProps) {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getCategoryConfig = (category: string) => {
    switch (category) {
      case "urgent":
        return {
          icon: <AlertTriangle className="h-3.5 w-3.5" />,
          badge: "bg-red-500/10 text-red-700 border-red-200/50",
          accent: "bg-red-500",
          label: "Urgent",
        };
      case "opportunity":
        return {
          icon: <Briefcase className="h-3.5 w-3.5" />,
          badge: "bg-emerald-500/10 text-emerald-700 border-emerald-200/50",
          accent: "bg-emerald-500",
          label: "Opportunity",
        };
      case "event":
        return {
          icon: <Calendar className="h-3.5 w-3.5" />,
          badge: "bg-purple-500/10 text-purple-700 border-purple-200/50",
          accent: "bg-purple-500",
          label: "Event Notice",
        };
      default:
        return {
          icon: <Info className="h-3.5 w-3.5" />,
          badge: "bg-blue-500/10 text-blue-700 border-blue-200/50",
          accent: "bg-blue-500",
          label: "General Notice",
        };
    }
  };

  // Filter announcements
  const filtered = initialAnnouncements.filter((ann) => {
    const matchesSearch =
      ann.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ann.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || ann.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="border border-mist/85 rounded-3xl bg-paper/40 backdrop-blur-md p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-mist/35 pb-5 gap-4">
        <div className="space-y-1">
          <h2 className="font-display text-base sm:text-lg font-black text-ink flex items-center gap-2.5">
            <Megaphone className="h-5 w-5 text-wisteria animate-pulse" />
            <span>Broadcaster Notices & Announcements</span>
          </h2>
          <p className="text-3xs font-semibold text-ink/45">
            Stay updated with the latest instructions, event details, and society calls.
          </p>
        </div>

        {/* Categories select dropdown / pills */}
        <div className="flex gap-1.5 flex-wrap bg-[#F8F8FC] border border-mist/55 p-1 rounded-xl shrink-0 self-start sm:self-auto">
          {["all", "general", "event", "urgent", "opportunity"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-white text-wisteria shadow-[0_2px_8px_rgba(139,127,232,0.08)] border border-mist/40"
                  : "text-ink/50 hover:text-ink"
              }`}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink/30" />
        <input
          type="text"
          placeholder="Filter announcements by title or content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-4xs font-semibold border border-mist bg-white/70 focus:border-wisteria rounded-xl outline-none transition-all placeholder:text-ink/30"
        />
      </div>

      {/* Grid List */}
      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs font-semibold text-ink/45 flex flex-col items-center gap-2.5 bg-white/20 rounded-2xl border border-dashed border-mist">
            <Bell className="h-8 w-8 text-ink/30" />
            No notices match your filter or criteria.
          </div>
        ) : (
          filtered.map((ann) => {
            const config = getCategoryConfig(ann.category);
            const isExpanded = expandedIds[ann.id] || false;
            const needsExpansion = ann.content.length > 200;
            const displayContent = isExpanded ? ann.content : `${ann.content.slice(0, 200)}${needsExpansion ? "..." : ""}`;

            return (
              <div
                key={ann.id}
                className="relative overflow-hidden border border-mist bg-white/40 hover:bg-white/80 transition-all rounded-2xl p-5 shadow-3xs flex flex-col justify-between space-y-4"
              >
                {/* Left side accent stripe */}
                <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${config.accent}`} />

                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${config.badge}`}>
                      {config.icon}
                      {config.label}
                    </span>
                    <span className="text-[10px] font-semibold text-ink/40">
                      {new Date(ann.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <h3 className="font-display text-xs sm:text-sm font-black text-ink leading-snug">{ann.title}</h3>
                  <p className="text-4xs font-semibold text-ink/65 leading-relaxed whitespace-pre-wrap">
                    {displayContent}
                  </p>
                </div>

                {needsExpansion && (
                  <button
                    onClick={() => toggleExpand(ann.id)}
                    className="flex items-center gap-1 text-[10px] font-bold text-wisteria self-start hover:underline cursor-pointer"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-3.5 w-3.5" /> Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3.5 w-3.5" /> Read Full Announcement
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

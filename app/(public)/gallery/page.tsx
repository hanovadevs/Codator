"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Eye, X, Calendar, MapPin } from "lucide-react";

const categories = ["All", "Hackathons", "Workshops", "Socials"];

const galleryItems = [
  {
    id: 1,
    title: "ByteCraft '24 Hackathon",
    category: "Hackathons",
    description: "24 hours of non-stop building, collaboration, and caffeine.",
    date: "November 12, 2024",
    location: "Main Auditorium",
    gradient: "from-wisteria/40 via-skyline/30 to-wisteria-tint",
    pattern: (
      <svg className="absolute inset-0 h-full w-full stroke-ink/5" fill="none">
        <defs>
          <pattern id="grid-1" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-1)" />
        <circle cx="50%" cy="50%" r="60" className="stroke-wisteria/20 stroke-2" />
        <circle cx="50%" cy="50%" r="30" className="stroke-skyline/20" />
      </svg>
    ),
  },
  {
    id: 2,
    title: "Rust Systems Workshop",
    category: "Workshops",
    description: "Deep dive into memory safety, ownership, and concurrency in Rust.",
    date: "March 18, 2025",
    location: "Lab 3, CE Department",
    gradient: "from-ember/20 via-wisteria/20 to-wisteria-tint",
    pattern: (
      <svg className="absolute inset-0 h-full w-full stroke-ink/5" fill="none">
        <defs>
          <pattern id="grid-2" width="15" height="15" patternUnits="userSpaceOnUse">
            <path d="M 15 0 L 0 0 0 15" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-2)" />
        <line x1="10%" y1="20%" x2="90%" y2="80%" className="stroke-ember/20 stroke-2" />
        <line x1="10%" y1="80%" x2="90%" y2="20%" className="stroke-wisteria/20 stroke-2" />
      </svg>
    ),
  },
  {
    id: 3,
    title: "Annual Networking Mixer",
    category: "Socials",
    description: "Connecting students, alumni, and industry mentors over conversations.",
    date: "May 02, 2025",
    location: "Student Center Lawn",
    gradient: "from-skyline/30 via-wisteria/25 to-skyline-tint",
    pattern: (
      <svg className="absolute inset-0 h-full w-full stroke-ink/5" fill="none">
        <circle cx="30%" cy="40%" r="20" className="stroke-skyline/30" />
        <circle cx="70%" cy="60%" r="35" className="stroke-wisteria/30" />
        <circle cx="50%" cy="30%" r="15" className="stroke-skyline/20" />
        <line x1="30%" y1="40%" x2="70%" y2="60%" className="stroke-ink/10" />
        <line x1="30%" y1="40%" x2="50%" y2="30%" className="stroke-ink/10" />
        <line x1="50%" y1="30%" x2="70%" y2="60%" className="stroke-ink/10" />
      </svg>
    ),
  },
  {
    id: 4,
    title: "Vite & Next.js Sprints",
    category: "Workshops",
    description: "Hands-on session building highly interactive web architectures.",
    date: "October 14, 2025",
    location: "Lab 1, CS Department",
    gradient: "from-wisteria/30 via-skyline/20 to-paper",
    pattern: (
      <svg className="absolute inset-0 h-full w-full stroke-ink/5" fill="none">
        <defs>
          <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="2" className="fill-wisteria/20" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
        <rect x="25%" y="25%" width="50%" height="50%" rx="8" className="stroke-wisteria/20 stroke-2" />
      </svg>
    ),
  },
  {
    id: 5,
    title: "AI & Machine Learning Day",
    category: "Hackathons",
    description: "Building predictive models and integrating LLMs into web apps.",
    date: "December 08, 2025",
    location: "CS Main Hall",
    gradient: "from-wisteria/25 via-ember/15 to-skyline-tint",
    pattern: (
      <svg className="absolute inset-0 h-full w-full stroke-ink/5" fill="none">
        <path d="M10,80 Q40,20 80,80 T150,80" className="stroke-wisteria/20 stroke-2" />
        <path d="M10,120 Q40,60 80,120 T150,120" className="stroke-skyline/20 stroke-2" />
        <circle cx="80%" cy="30%" r="8" className="fill-ember/20" />
      </svg>
    ),
  },
  {
    id: 6,
    title: "Distributed Systems Talk",
    category: "Workshops",
    description: "Discussing consensus algorithms, replication, and fault tolerance.",
    date: "February 22, 2026",
    location: "Seminar Room B",
    gradient: "from-skyline/30 via-wisteria/15 to-paper",
    pattern: (
      <svg className="absolute inset-0 h-full w-full stroke-ink/5" fill="none">
        <rect x="10%" y="10%" width="20" height="20" rx="4" className="stroke-skyline/30" />
        <rect x="70%" y="10%" width="20" height="20" rx="4" className="stroke-skyline/30" />
        <rect x="40%" y="70%" width="20" height="20" rx="4" className="stroke-wisteria/30" />
        <line x1="20%" y1="30%" x2="50%" y2="70%" className="stroke-ink/10" />
        <line x1="80%" y1="30%" x2="50%" y2="70%" className="stroke-ink/10" />
      </svg>
    ),
  },
];

type GalleryItemType = typeof galleryItems[0];

export default function GalleryPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [selectedItem, setSelectedItem] = useState<GalleryItemType | null>(null);

  const filteredItems = galleryItems.filter(
    (item) => activeTab === "All" || item.category === activeTab
  );

  return (
    <div className="min-h-screen bg-[#F8F8FC] pt-28 pb-20 text-ink">
      <title>Society Gallery | CODATOR</title>
      <meta name="description" content="View photos and projects from CODATOR workshops, hackathons, and community gatherings." />
      
      {/* Soft background glow */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute -top-[10%] right-[15%] w-[40vw] h-[40vw] rounded-full bg-skyline/5 blur-[100px]" />
        <div className="absolute top-[40%] left-[10%] w-[35vw] h-[35vw] rounded-full bg-wisteria/5 blur-[90px]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Header */}
        <div className="max-w-3xl">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/45 backdrop-blur-md px-3 py-0.5 text-5xs font-bold uppercase tracking-widest text-wisteria mb-4 shadow-[0_4px_12px_rgba(0,0,0,0.01)]"
          >
            <Sparkles className="h-3.5 w-3.5 text-wisteria" />
            Moments & Sprints
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display text-3xl font-black tracking-tight text-ink sm:text-4xl text-[#1D1B26]"
          >
            Society Gallery
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-xs sm:text-sm leading-relaxed text-ink/75 font-semibold"
          >
            A visual record of our workshops, hackathons, and community gatherings.
          </motion.p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-mist/30 pb-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveTab(category)}
              className={`relative rounded-lg px-4.5 py-1.5 text-5xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === category
                  ? "text-wisteria bg-wisteria-tint border border-wisteria/10"
                  : "text-ink/65 hover:text-wisteria hover:bg-wisteria-tint/40 border border-transparent"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <motion.div layout className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group relative overflow-hidden rounded-2xl border border-white/80 bg-white/40 backdrop-blur-md shadow-xs hover:border-wisteria/25 hover:shadow-md transition-all duration-300 h-64 flex flex-col justify-between cursor-pointer"
              >
                {/* Visual Representation */}
                <div className={`relative w-full h-40 bg-gradient-to-br ${item.gradient} overflow-hidden border-b border-mist/45`}>
                  {item.pattern}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-[#13121A]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="rounded-xl bg-white/90 backdrop-blur-md p-2.5 shadow-md border border-white/80">
                      <Eye className="h-4.5 w-4.5 text-wisteria" />
                    </div>
                  </div>

                  {/* Category Badge */}
                  <span className="absolute top-3 left-3 inline-flex items-center rounded bg-white px-2 py-0.5 text-5xs font-bold uppercase tracking-wider text-ink/75 shadow-4xs border border-mist/55">
                    {item.category}
                  </span>
                </div>

                {/* Card Info */}
                <div className="p-4 space-y-1">
                  <h3 className="font-display text-xs font-bold text-ink group-hover:text-wisteria transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-5xs text-ink/60 line-clamp-2 font-semibold">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
            className="fixed inset-0 z-50 bg-[#13121A]/40 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-paper border border-white/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Pattern Header */}
              <div className={`relative h-48 bg-gradient-to-br ${selectedItem.gradient} border-b border-mist/55`}>
                {selectedItem.pattern}
                
                {/* Close Button */}
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 rounded-xl bg-white/90 backdrop-blur-md p-2 shadow-md border border-white/80 hover:bg-white text-ink/70 hover:text-ink transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>

                <span className="absolute bottom-4 left-4 inline-flex items-center rounded bg-white px-2.5 py-1 text-5xs font-bold uppercase tracking-wider text-wisteria shadow-sm border border-mist/55">
                  {selectedItem.category}
                </span>
              </div>

              {/* Info Content */}
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <h2 className="font-display text-lg font-black text-[#1D1B26] leading-tight">
                    {selectedItem.title}
                  </h2>
                  <p className="text-xs text-ink/70 leading-relaxed font-semibold">
                    {selectedItem.description}
                  </p>
                </div>

                {/* Meta details */}
                <div className="grid grid-cols-2 gap-4 border-t border-mist/30 pt-4 text-5xs font-semibold text-ink/75">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-wisteria" />
                    <span>{selectedItem.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-wisteria" />
                    <span>{selectedItem.location}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

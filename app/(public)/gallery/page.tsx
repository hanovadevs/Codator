"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const categories = ["All", "Hackathons", "Workshops", "Socials"];

const galleryItems = [
  {
    id: 1,
    title: "ByteCraft '24 Hackathon",
    category: "Hackathons",
    description: "24 hours of non-stop building, collaboration, and caffeine.",
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

export default function GalleryPage() {
  const [activeTab, setActiveTab] = useState("All");

  const filteredItems = galleryItems.filter(
    (item) => activeTab === "All" || item.category === activeTab
  );

  return (
    <div className="py-20 sm:py-28 bg-paper">
      <title>Society Gallery | CODATOR</title>
      <meta name="description" content="View photos and projects from CODATOR workshops, hackathons, and community gatherings." />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="max-w-3xl mb-16">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Society Gallery
          </h1>
          <p className="mt-6 text-xl leading-relaxed text-ink/75">
            A visual record of our workshops, hackathons, and community gatherings.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-mist pb-6 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveTab(category)}
              className={`relative rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === category
                  ? "text-wisteria bg-wisteria-tint"
                  : "text-ink/65 hover:text-wisteria hover:bg-wisteria-tint/40"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <motion.div layout className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35 }}
                key={item.id}
                className="group relative overflow-hidden rounded-2xl border border-mist bg-paper shadow-sm transition-all hover:border-wisteria/20 hover:shadow-md h-80"
              >
                {/* Visual Representation (Abstract tech vector/pattern with gradients) */}
                <div className={`relative w-full h-48 bg-gradient-to-br ${item.gradient} overflow-hidden border-b border-mist`}>
                  {/* Render Custom SVG Pattern */}
                  {item.pattern}

                  {/* Category Badge */}
                  <span className="absolute top-4 left-4 inline-flex items-center rounded-md bg-paper px-2.5 py-0.5 text-xs font-semibold text-ink/70 shadow-sm border border-mist">
                    {item.category}
                  </span>
                </div>

                {/* Card Info */}
                <div className="p-5">
                  <h3 className="font-display text-lg font-bold text-ink group-hover:text-wisteria transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-ink/60 mt-1.5 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

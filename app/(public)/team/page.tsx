"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Shield, Star, Users, Sparkles, ChevronDown, Building2 } from "lucide-react";

/* ────────────────────────── DATA ────────────────────────── */

const coreBody = [
  {
    name: "Syed Touseef Haider",
    role: "Mentor",
    dept: "Computer Science & Engineering",
    initials: "SH",
    accent: "#6366f1",
    accentLight: "rgba(99,102,241,0.08)",
    icon: Crown,
    quote: "Guiding the next generation of tech leaders.",
  },
  {
    name: "Fahad Ali",
    role: "President",
    dept: "Computer Science & Engineering",
    initials: "FA",
    accent: "#8B7FE8",
    accentLight: "rgba(139,127,232,0.08)",
    icon: Crown,
    quote: "Building a community that ships, learns, and grows together.",
  },
  {
    name: "Tayyab Mehmood",
    role: "Vice President",
    dept: "Computer Science & Engineering",
    initials: "TM",
    accent: "#6BA4F5",
    accentLight: "rgba(107,164,245,0.08)",
    icon: Shield,
    quote: "Empowering every member to reach their potential.",
  },
  {
    name: "Aqsa Sanaullah",
    role: "Vice President (Female)",
    dept: "Computer Science & Engineering",
    initials: "AS",
    accent: "#ec4899",
    accentLight: "rgba(236,72,153,0.08)",
    icon: Shield,
    quote: "Championing diversity and inclusion in tech.",
  },
  {
    name: "Zaid Sajid",
    role: "Managing Director",
    dept: "Computer Science & Engineering",
    initials: "ZS",
    accent: "#8B7FE8",
    accentLight: "rgba(139,127,232,0.08)",
    icon: Star,
    quote: "Orchestrating operations for maximum impact.",
  },
  {
    name: "Sameer Barlas",
    role: "General Secretary",
    dept: "Computer Science & Engineering",
    initials: "SB",
    accent: "#6BA4F5",
    accentLight: "rgba(107,164,245,0.08)",
    icon: Star,
    quote: "Keeping the engine running behind the scenes.",
  },
  {
    name: "Ali Hussain",
    role: "Treasurer",
    dept: "Computer Science & Engineering",
    initials: "AH",
    accent: "#f59e0b",
    accentLight: "rgba(245,158,11,0.08)",
    icon: Star,
    quote: "Managing resources for maximum society growth.",
  },
];

const phylumTeams = [
  {
    phylum: "Tech and Development",
    color: "#10b981",
    colorLight: "rgba(16,185,129,0.06)",
    members: [
      { name: "Ali Haider", role: "Director", initials: "AH" },
      { name: "Haroon Zafar", role: "Head", initials: "HZ" },
      { name: "Ali Faraz", role: "Co-Head", initials: "AF" },
    ],
  },
  {
    phylum: "Media Phylum",
    color: "#a855f7",
    colorLight: "rgba(168,85,247,0.06)",
    members: [
      { name: "Ehtasham Ali", role: "Director", initials: "EA" },
      { name: "Rameen Fatima", role: "Head", initials: "RF" },
      { name: "Safi ur rehman", role: "Co-Head", initials: "SR" },
    ],
  },
  {
    phylum: "Research Phylum",
    color: "#6BA4F5",
    colorLight: "rgba(107,164,245,0.06)",
    members: [
      { name: "Ahmad Nadeem", role: "Director", initials: "AN" },
      { name: "Rida e Zahra", role: "Head", initials: "RZ" },
      { name: "Tariq Nawaz", role: "Co-Head", initials: "TN" },
    ],
  },
  {
    phylum: "Event Management",
    color: "#f97316",
    colorLight: "rgba(249,115,22,0.06)",
    members: [
      { name: "Saad Butt", role: "Director", initials: "SB" },
      { name: "Asif Chohadari", role: "Head", initials: "AC" },
      { name: "Dua Tanveer", role: "Co-Head", initials: "DT" },
    ],
  },
];

/* ────────────────────── COMPONENTS ────────────────────── */

interface CoreMember {
  name: string;
  role: string;
  dept: string;
  initials: string;
  accent: string;
  accentLight: string;
  icon: React.ElementType;
  quote: string;
}

function CoreCard({ member, index }: { member: CoreMember; index: number }) {
  const Icon = member.icon;
  const isLeader = index <= 1; // Mentor & President get larger cards

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: "easeOut" }}
      className={`group relative overflow-hidden rounded-3xl border border-mist bg-white/40 backdrop-blur-sm hover:shadow-lg hover:border-transparent transition-all duration-500 ${
        isLeader ? "lg:col-span-2" : ""
      }`}
      style={{
        ["--card-accent" as string]: member.accent,
        ["--card-accent-light" as string]: member.accentLight,
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ background: `linear-gradient(90deg, transparent, ${member.accent}, transparent)` }}
      />

      <div className={`p-6 sm:p-8 ${isLeader ? "flex flex-col sm:flex-row items-start sm:items-center gap-6" : "flex flex-col items-center text-center"}`}>
        {/* Avatar */}
        <div
          className="relative shrink-0"
        >
          <div
            className={`flex items-center justify-center rounded-2xl border shadow-inner group-hover:scale-105 transition-transform duration-500 ${
              isLeader ? "h-28 w-28 sm:h-32 sm:w-32" : "h-20 w-20"
            }`}
            style={{
              background: `linear-gradient(135deg, ${member.accentLight}, ${member.accentLight})`,
              borderColor: `${member.accent}22`,
            }}
          >
            <span
              className={`font-display font-black tracking-tight ${isLeader ? "text-3xl sm:text-4xl" : "text-xl"}`}
              style={{ color: member.accent }}
            >
              {member.initials}
            </span>
          </div>

          {/* Icon badge */}
          <div
            className="absolute -bottom-1.5 -right-1.5 rounded-full p-1.5 border-2 border-white shadow-sm"
            style={{ background: member.accent }}
          >
            <Icon className="h-3 w-3 text-white" />
          </div>
        </div>

        {/* Info */}
        <div className={`${isLeader ? "flex-1 text-left" : "mt-5"}`}>
          <h3 className={`font-display font-black text-ink group-hover:text-[var(--card-accent)] transition-colors duration-300 ${
            isLeader ? "text-xl sm:text-2xl" : "text-base"
          }`}>
            {member.name}
          </h3>

          <div className="flex items-center gap-2 mt-1.5 justify-center flex-wrap" style={isLeader ? { justifyContent: "flex-start" } : {}}>
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border"
              style={{
                color: member.accent,
                borderColor: `${member.accent}30`,
                background: member.accentLight,
              }}
            >
              <Icon className="h-2.5 w-2.5" />
              {member.role}
            </span>
          </div>

          {isLeader && (
            <p className="text-3xs text-ink/50 font-semibold mt-3 italic leading-relaxed">
              &ldquo;{member.quote}&rdquo;
            </p>
          )}

          <span className="text-[9px] font-bold text-ink/35 uppercase tracking-widest mt-3 block">
            {member.dept}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

interface PhylumTeam {
  phylum: string;
  color: string;
  colorLight: string;
  members: {
    name: string;
    role: string;
    initials: string;
  }[];
}

function PhylumCard({ team, index }: { team: PhylumTeam; index: number }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const roleOrder: Record<string, number> = { Director: 0, Head: 1, "Co-Head": 2 };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-3xl border border-mist bg-white/40 backdrop-blur-sm hover:shadow-lg transition-all duration-500"
    >
      {/* Left accent bar */}
      <div
        className="absolute top-0 left-0 bottom-0 w-[3px] opacity-50 group-hover:opacity-100 transition-opacity"
        style={{ background: team.color }}
      />

      {/* Phylum header - clickable to toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer text-left"
      >
        <div className="flex items-center gap-3.5">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl border shadow-inner"
            style={{
              background: team.colorLight,
              borderColor: `${team.color}22`,
            }}
          >
            <Building2 className="h-4.5 w-4.5" style={{ color: team.color }} />
          </div>
          <div>
            <h3 className="font-display text-base font-black text-ink">{team.phylum}</h3>
            <span className="text-[9px] font-bold text-ink/35 uppercase tracking-widest">{team.members.length} Members</span>
          </div>
        </div>

        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="h-4 w-4 text-ink/30" />
        </motion.div>
      </button>

      {/* Members list */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-2">
              {[...team.members]
                .sort((a, b) => (roleOrder[a.role] ?? 99) - (roleOrder[b.role] ?? 99))
                .map((m, mIdx) => (
                  <motion.div
                    key={m.name}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: mIdx * 0.08, duration: 0.35 }}
                    className="flex items-center gap-3.5 p-3.5 rounded-xl border border-mist/50 bg-white/30 hover:bg-white/60 hover:border-mist transition-all"
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-extrabold border shadow-inner shrink-0"
                      style={{
                        background: team.colorLight,
                        borderColor: `${team.color}20`,
                        color: team.color,
                      }}
                    >
                      {m.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-display text-sm font-bold text-ink block truncate">{m.name}</span>
                      <span
                        className="text-[9px] font-extrabold uppercase tracking-widest"
                        style={{ color: team.color }}
                      >
                        {m.role}
                      </span>
                    </div>
                    <div
                      className="px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider border shrink-0"
                      style={{
                        color: team.color,
                        borderColor: `${team.color}25`,
                        background: team.colorLight,
                      }}
                    >
                      {m.role === "Director" ? "Lead" : m.role === "Head" ? "Ops" : "Support"}
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ────────────────────── PAGE ────────────────────── */

export default function TeamPage() {
  return (
    <div className="py-20 sm:py-28 bg-paper">
      <title>Meet the Team | CODATOR</title>
      <meta
        name="description"
        content="Meet the student committee, directors, heads, and co-heads leading the CODATOR Computer Science & Engineering society."
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-24">
        {/* ── Hero Header ── */}
        <div className="relative max-w-3xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute -top-4 -left-4 h-20 w-20 rounded-full bg-wisteria/5 blur-2xl"
          />
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-wisteria bg-wisteria/[0.06] border border-wisteria/10 mb-5"
          >
            <Users className="h-3 w-3" /> Our Leadership
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="font-display text-4xl font-black tracking-tight text-ink sm:text-5xl lg:text-6xl"
          >
            Meet the{" "}
            <span className="bg-gradient-to-r from-wisteria to-skyline bg-clip-text text-transparent">
              Team
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-5 text-base sm:text-lg leading-relaxed text-ink/65 font-semibold max-w-xl"
          >
            The dedicated student leadership, directors, and coordinators
            working behind the scenes to power the CODATOR society forward.
          </motion.p>

          {/* Stats ribbon */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-8 flex flex-wrap gap-6"
          >
            {[
              { label: "Core Body", value: coreBody.length },
              { label: "Phyla", value: phylumTeams.length },
              { label: "Total Leaders", value: coreBody.length + phylumTeams.reduce((sum, t) => sum + t.members.length, 0) },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2.5">
                <span className="font-display text-2xl font-black text-wisteria">{stat.value}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Section 1: Core Body ── */}
        <section className="space-y-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-4 w-4 text-wisteria" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-wisteria">Executive Committee</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-ink">Core Body</h2>
            </div>
            <span className="text-[9px] font-bold text-ink/30 uppercase tracking-widest bg-mist/30 px-3 py-1.5 rounded-lg border border-mist/40 shrink-0">
              {coreBody.length} Members
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {coreBody.map((member, idx) => (
              <CoreCard key={member.name} member={member} index={idx} />
            ))}
          </div>
        </section>

        {/* ── Section 2: Phylum Teams ── */}
        <section className="space-y-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-wisteria" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-wisteria">Department Leadership</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-ink">Phylum Teams</h2>
              <p className="text-3xs text-ink/50 font-semibold mt-1.5 max-w-lg">
                Each phylum is led by a Director, Head, and Co-Head working together to drive their department forward.
              </p>
            </div>
            <span className="text-[9px] font-bold text-ink/30 uppercase tracking-widest bg-mist/30 px-3 py-1.5 rounded-lg border border-mist/40 shrink-0">
              {phylumTeams.length} Departments
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {phylumTeams.map((team, idx) => (
              <PhylumCard key={team.phylum} team={team} index={idx} />
            ))}
          </div>
        </section>

        {/* ── Join CTA ── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-wisteria/10 bg-gradient-to-br from-wisteria/[0.03] to-skyline/[0.03] p-8 sm:p-12 text-center"
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-wisteria/30 to-transparent" />

          <h3 className="font-display text-xl sm:text-2xl font-black text-ink">
            Want to be part of this team?
          </h3>
          <p className="text-3xs text-ink/50 font-semibold mt-2 max-w-md mx-auto">
            Applications are open for new members. Join CODATOR and grow your skills alongside an amazing community.
          </p>
          <a
            href="/join"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-wisteria hover:bg-wisteria/90 text-white text-4xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            <Sparkles className="h-3.5 w-3.5" /> Apply Now
          </a>
        </motion.section>
      </div>
    </div>
  );
}

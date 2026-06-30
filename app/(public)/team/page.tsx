"use client";

import { motion } from "framer-motion";

const coreBody = [
  {
    name: "Syed Touseef Haider",
    role: "Mentor",
    dept: "Computer Science & Engineering",
    initials: "SH",
    bgGradient: "from-indigo-500/10 to-purple-500/10",
    textColor: "text-indigo-600",
  },
  {
    name: "Fahad Ali",
    role: "President",
    dept: "Computer Science & Engineering",
    initials: "FA",
    bgGradient: "from-wisteria/20 to-skyline/20",
    textColor: "text-wisteria",
  },
  {
    name: "Tayyab Mehmood",
    role: "Vice President",
    dept: "Computer Science & Engineering",
    initials: "TM",
    bgGradient: "from-skyline/20 to-wisteria/20",
    textColor: "text-skyline",
  },
  {
    name: "Aqsa Sanaullah",
    role: "Vice President (Female)",
    dept: "Computer Science & Engineering",
    initials: "AS",
    bgGradient: "from-pink-500/10 to-rose-500/10",
    textColor: "text-pink-600",
  },
  {
    name: "Zaid Sajid",
    role: "Managing Director",
    dept: "Computer Science & Engineering",
    initials: "ZS",
    bgGradient: "from-wisteria-tint to-wisteria/30",
    textColor: "text-wisteria",
  },
  {
    name: "Sameer Barlas",
    role: "General Secretary",
    dept: "Computer Science & Engineering",
    initials: "SB",
    bgGradient: "from-skyline-tint to-skyline/30",
    textColor: "text-skyline",
  },
  {
    name: "Ali Hussain",
    role: "Treasurer",
    dept: "Computer Science & Engineering",
    initials: "AH",
    bgGradient: "from-amber-500/10 to-orange-500/10",
    textColor: "text-amber-600",
  },
];

const directors = [
  {
    name: "Ali Haider",
    role: "Director",
    dept: "Tech and Development",
    initials: "AH",
    bgGradient: "from-emerald-500/10 to-teal-500/10",
    textColor: "text-emerald-600",
  },
  {
    name: "Ehtasham Ali",
    role: "Director",
    dept: "Media Phylum",
    initials: "EA",
    bgGradient: "from-purple-500/10 to-pink-500/10",
    textColor: "text-purple-600",
  },
  {
    name: "Ahmad Nadeem",
    role: "Director",
    dept: "Research Phylum",
    initials: "AN",
    bgGradient: "from-skyline/20 to-indigo-500/10",
    textColor: "text-skyline",
  },
  {
    name: "Saad Butt",
    role: "Director",
    dept: "Event Management",
    initials: "SB",
    bgGradient: "from-orange-500/10 to-red-500/10",
    textColor: "text-orange-600",
  },
];

const heads = [
  {
    name: "Haroon Zafar",
    role: "Head",
    dept: "Tech and Development",
    initials: "HZ",
    bgGradient: "from-emerald-500/10 to-teal-500/10",
    textColor: "text-emerald-600",
  },
  {
    name: "Rameen Fatima",
    role: "Head",
    dept: "Media Phylum",
    initials: "RF",
    bgGradient: "from-purple-500/10 to-pink-500/10",
    textColor: "text-purple-600",
  },
  {
    name: "Rida e Zahra",
    role: "Head",
    dept: "Research Phylum",
    initials: "RZ",
    bgGradient: "from-skyline/20 to-indigo-500/10",
    textColor: "text-skyline",
  },
  {
    name: "Asif Chohadari",
    role: "Head",
    dept: "Event Management",
    initials: "AC",
    bgGradient: "from-orange-500/10 to-red-500/10",
    textColor: "text-orange-600",
  },
];

const coHeads = [
  {
    name: "Ali Faraz",
    role: "Co-Head",
    dept: "Tech and Development",
    initials: "AF",
    bgGradient: "from-emerald-500/10 to-teal-500/10",
    textColor: "text-emerald-600",
  },
  {
    name: "Safi ur rehman",
    role: "Co-Head",
    dept: "Media Phylum",
    initials: "SR",
    bgGradient: "from-purple-500/10 to-pink-500/10",
    textColor: "text-purple-600",
  },
  {
    name: "Tariq Nawaz",
    role: "Co-Head",
    dept: "Research Phylum",
    initials: "TN",
    bgGradient: "from-skyline/20 to-indigo-500/10",
    textColor: "text-skyline",
  },
  {
    name: "Dua Tanveer",
    role: "Co-Head",
    dept: "Event Management",
    initials: "DT",
    bgGradient: "from-orange-500/10 to-red-500/10",
    textColor: "text-orange-600",
  },
];

interface MemberCardProps {
  member: {
    name: string;
    role: string;
    dept: string;
    initials: string;
    bgGradient: string;
    textColor: string;
  };
  index: number;
}

function MemberCard({ member, index }: MemberCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group flex flex-col items-center text-center p-6 border border-mist rounded-2xl bg-white/30 hover:border-wisteria/20 hover:shadow-md transition-all"
    >
      {/* Profile Avatar */}
      <div className={`relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-tr ${member.bgGradient} border border-mist group-hover:scale-[1.03] transition-transform duration-300 shadow-inner mb-5`}>
        <span className={`font-display text-2xl font-extrabold tracking-tight ${member.textColor}`}>
          {member.initials}
        </span>
      </div>

      <h3 className="font-display text-base font-bold text-ink group-hover:text-wisteria transition-colors">
        {member.name}
      </h3>
      <p className="text-xs font-bold text-wisteria mt-1 uppercase tracking-wider">
        {member.role}
      </p>
      
      <span className="text-5xs font-bold text-ink/40 uppercase tracking-widest mt-3 block">
        {member.dept}
      </span>
    </motion.div>
  );
}

export default function TeamPage() {
  return (
    <div className="py-20 sm:py-28 bg-paper">
      <title>Meet the Team | CODATOR</title>
      <meta name="description" content="Meet the student committee, directors, heads, and co-heads leading the CODATOR Computer Science & Engineering society." />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-20">

        {/* Header */}
        <div className="max-w-3xl">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display text-4xl font-black tracking-tight text-ink sm:text-5xl"
          >
            Meet the Team
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-lg leading-relaxed text-ink/75 font-semibold"
          >
            The dedicated student leadership, directors, and coordinators working behind the scenes to run the CODATOR society.
          </motion.p>
        </div>

        {/* 1. Core Body */}
        <div className="space-y-8">
          <div className="border-b border-mist pb-3 flex items-center justify-between">
            <h2 className="font-display text-xl font-black text-ink">Core Body</h2>
            <span className="text-5xs font-bold text-ink/40 uppercase tracking-widest bg-mist/35 px-2.5 py-1 rounded-md">Executive Committee</span>
          </div>
          <div className="grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
            {coreBody.map((member, idx) => (
              <MemberCard key={member.name} member={member} index={idx} />
            ))}
          </div>
        </div>

        {/* 2. Directors */}
        <div className="space-y-8">
          <div className="border-b border-mist pb-3 flex items-center justify-between">
            <h2 className="font-display text-xl font-black text-ink">Directors</h2>
            <span className="text-5xs font-bold text-ink/40 uppercase tracking-widest bg-mist/35 px-2.5 py-1 rounded-md">Phylum Leadership</span>
          </div>
          <div className="grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
            {directors.map((member, idx) => (
              <MemberCard key={member.name} member={member} index={idx} />
            ))}
          </div>
        </div>

        {/* 3. Heads */}
        <div className="space-y-8">
          <div className="border-b border-mist pb-3 flex items-center justify-between">
            <h2 className="font-display text-xl font-black text-ink">Heads</h2>
            <span className="text-5xs font-bold text-ink/40 uppercase tracking-widest bg-mist/35 px-2.5 py-1 rounded-md">Phylum Operations</span>
          </div>
          <div className="grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
            {heads.map((member, idx) => (
              <MemberCard key={member.name} member={member} index={idx} />
            ))}
          </div>
        </div>

        {/* 4. Co-Heads */}
        <div className="space-y-8">
          <div className="border-b border-mist pb-3 flex items-center justify-between">
            <h2 className="font-display text-xl font-black text-ink">Co-Heads</h2>
            <span className="text-5xs font-bold text-ink/40 uppercase tracking-widest bg-mist/35 px-2.5 py-1 rounded-md">Phylum Support</span>
          </div>
          <div className="grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
            {coHeads.map((member, idx) => (
              <MemberCard key={member.name} member={member} index={idx} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Terminal, Cpu, Globe, Users, Calendar, MapPin, Award } from "lucide-react";
import ConstellationReveal from "@/components/hero/constellation-reveal";

const activities = [
  {
    icon: Terminal,
    title: "Hackathons & Sprints",
    description: "Collaborative building sessions where students team up to build software for real-world challenges.",
    gradient: "from-wisteria-tint to-skyline-tint/30",
    iconColor: "text-wisteria",
  },
  {
    icon: Cpu,
    title: "Systems & Core Tech",
    description: "Deep dives into operating systems, compilers, networks, and systems programming in Rust, C, and Go.",
    gradient: "from-skyline-tint to-wisteria-tint/30",
    iconColor: "text-skyline",
  },
  {
    icon: Globe,
    title: "Open Source Projects",
    description: "Building and maintaining the society's internal platforms, libraries, and university tools.",
    gradient: "from-wisteria-tint/40 to-paper",
    iconColor: "text-wisteria",
  },
  {
    icon: Users,
    title: "Peer Mentorship",
    description: "Bridging semesters. Seniors guide juniors through course selections, interview prep, and project reviews.",
    gradient: "from-skyline-tint/40 to-paper",
    iconColor: "text-skyline",
  },
];

const phyla = [
  {
    name: "Tech and Devolpment",
    slug: "tech-and-development",
    description: "The core engineering hub. We build the society's internal software, open-source projects, and systems-level platforms.",
    roles: "Devs / Architects",
    imageSrc: "/tech_phylum.png",
    accent: "from-purple-500/10 to-wisteria-tint/20 border-wisteria/25",
    textColor: "text-wisteria",
    tag: "Code & Infrastructure",
  },
  {
    name: "Media Phylum",
    slug: "media-phylum",
    description: "Creative design and public branding. We manage the visual aesthetics, graphic assets, social media presence, and UI designs.",
    roles: "Designers / Creators",
    imageSrc: "/media_phylum.png",
    accent: "from-blue-500/10 to-skyline-tint/20 border-skyline/25",
    textColor: "text-skyline",
    tag: "Design & Branding",
  },
  {
    name: "Research Phylum",
    slug: "research-phylum",
    description: "Deep technical exploration. We publish papers, run machine learning workshops, and analyze cutting-edge AI technologies.",
    roles: "ML Devs / Researchers",
    imageSrc: "/research_phylum.png",
    accent: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20",
    textColor: "text-emerald-600",
    tag: "AI & CS Research",
  },
  {
    name: "Event management",
    slug: "event-management",
    description: "Operations and community networking. We plan, organize, and execute hackathons, tech workshops, and guest lectures.",
    roles: "Leads / Organizers",
    imageSrc: "/event_phylum.png",
    accent: "from-amber-500/10 to-amber-500/5 border-amber-500/20",
    textColor: "text-amber-600",
    tag: "Operations & Logistics",
  },
];

const mockEvents = [
  {
    title: "Shatter The Code '26 Hackathon",
    category: "Hackathon",
    date: "July 18-19, 2026",
    location: "CS Main Auditorium & Labs",
    spotsLeft: 12,
    badgeColor: "bg-ember/10 text-ember",
  },
  {
    title: "Rust for Systems Programming",
    category: "Workshop",
    date: "July 25, 2026",
    location: "Lab 3, Department of CE",
    spotsLeft: 25,
    badgeColor: "bg-wisteria/10 text-wisteria",
  },
  {
    title: "Demystifying Distributed Systems",
    category: "Seminar",
    date: "August 02, 2026",
    location: "Online (Discord Live)",
    spotsLeft: 80,
    badgeColor: "bg-skyline/10 text-skyline",
  },
];

export default function HomePage() {
  const headlineWords = "Building the systems that run tomorrow.".split(" ");

  // Framer Motion variants
  const containerVars = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.3,
      },
    },
  };

  const wordVars = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
  };

  const fadeUpVars = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
  };

  return (
    <div className="relative w-full">
      <title>CODATOR | Computer Science & Engineering Society</title>
      <meta name="description" content="Welcome to CODATOR, the university Computer Science & Computer Engineering society. We build systems, hackathons, and workshops for tomorrow." />

      {/* 1. HERO SECTION */}
      <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden border-b border-mist px-4 sm:px-6 lg:px-8 bg-paper">
        {/* Soft, Premium Glowing Orbs (CSS-based, no clutter) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
          {/* Purple Orb */}
          <div className="absolute -top-[20%] left-[5%] w-[50vw] h-[50vw] rounded-full bg-wisteria/10 blur-[130px] animate-pulse" style={{ animationDuration: "10s" }} />
          {/* Blue/Teal Orb */}
          <div className="absolute -bottom-[20%] right-[5%] w-[50vw] h-[50vw] rounded-full bg-skyline/10 blur-[130px] animate-pulse" style={{ animationDuration: "14s" }} />
          {/* Soft Gold Highlight */}
          <div className="absolute top-[25%] right-[15%] w-[35vw] h-[35vw] rounded-full bg-amber-100/10 blur-[110px]" />
        </div>

        {/* Constellation Canvas Background */}
        <ConstellationReveal />

        <div className="relative mx-auto max-w-5xl text-center z-10 py-20">
          <motion.div
            variants={containerVars}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center"
          >
            {/* Tagline */}
            <motion.span
              variants={fadeUpVars}
              className="inline-flex items-center gap-1.5 rounded-full border border-wisteria/25 bg-wisteria-tint px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-wisteria mb-6"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-wisteria animate-pulse" />
              University CS & CE Society
            </motion.span>

            {/* Headline (Word-by-word reveal) */}
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-6xl md:text-7xl max-w-4xl leading-[1.1] mb-6">
              {headlineWords.map((word, idx) => (
                <span key={idx} className="inline-block mr-[0.25em] overflow-hidden py-1">
                  <motion.span variants={wordVars} className="inline-block">
                    {word}
                  </motion.span>
                </span>
              ))}
            </h1>

            {/* Description */}
            <motion.p
              variants={fadeUpVars}
              className="mx-auto mt-2 max-w-2xl text-base sm:text-lg md:text-xl leading-relaxed text-ink/75"
            >
              CODATOR is a community of engineers, builders, and thinkers. We collaborate, share knowledge, and build open systems that solve local problems.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUpVars}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
            >
              <Link
                href="/join"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-wisteria px-7 py-3.5 text-base font-semibold text-paper shadow-md hover:bg-wisteria/90 active:scale-[0.98] transition-all group"
              >
                Apply for Membership
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/events"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-mist bg-paper/50 backdrop-blur-sm px-7 py-3.5 text-base font-semibold text-ink hover:bg-wisteria-tint/30 hover:text-wisteria hover:border-wisteria/30 active:scale-[0.98] transition-all"
              >
                See Upcoming Events
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. WHAT WE DO SECTION (With Image Integration) */}
      <section className="py-24 sm:py-32 bg-paper/30 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl"
            >
              Engineered for Growth
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-lg text-ink/60"
            >
              We focus on building practical skills, collaborating on code, and helping members launch impactful projects.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Activities */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {activities.map((act, idx) => {
                const Icon = act.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className={`group relative overflow-hidden rounded-2xl border border-mist bg-gradient-to-br ${act.gradient} p-6 shadow-xs transition-all hover:shadow-md hover:border-wisteria/20`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`rounded-xl bg-paper p-2.5 shadow-xs ${act.iconColor} border border-mist group-hover:border-wisteria/30 transition-colors`}>
                        <Icon className="h-5.5 w-5.5" />
                      </div>
                      <div>
                        <h3 className="font-display text-base font-bold text-ink mb-1.5">
                          {act.title}
                        </h3>
                        <p className="text-xs leading-relaxed text-ink/70">
                          {act.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Right Column: Premium Illustration */}
            <div className="lg:col-span-5 flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="relative w-full max-w-[380px] aspect-square rounded-3xl overflow-hidden border border-mist/80 bg-white/60 p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                {/* Soft backdrop glow behind image */}
                <div className="absolute inset-0 bg-gradient-to-br from-wisteria-tint/20 via-skyline-tint/10 to-transparent z-0" />
                <div className="relative w-full h-full z-10 transition-transform duration-500 group-hover:scale-[1.02]">
                  <Image
                    src="/collaboration_bg.png"
                    alt="CODATOR Member Collaboration"
                    fill
                    sizes="380px"
                    className="object-contain"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. OUR CORE PHYLA SECTION (With Image & Page Links) */}
      <section className="py-24 sm:py-32 bg-paper relative overflow-hidden border-t border-mist/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-20">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-1.5 rounded-full border border-wisteria/25 bg-wisteria-tint px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-wisteria mb-4"
            >
              Society Structure
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl"
            >
              Our Core Phyla
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-lg text-ink/60"
            >
              Every active member belongs to one of our four specialized departments, leading initiatives and collaborating on domain-specific challenges.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {phyla.map((phylum, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className={`group relative overflow-hidden rounded-3xl border bg-gradient-to-br ${phylum.accent} p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between min-h-[260px]`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-2">
                      <span className={`inline-flex text-5xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-paper border ${phylum.textColor} border-mist/80 shadow-3xs`}>
                        {phylum.tag}
                      </span>
                      <h3 className="font-display text-2xl font-black text-ink group-hover:text-wisteria transition-colors">
                        {phylum.name}
                      </h3>
                    </div>
                    {/* Tiny Illustration Card */}
                    <div className="relative h-14 w-14 shrink-0 rounded-2xl border border-mist/40 bg-white/60 p-2.5 shadow-3xs group-hover:scale-105 transition-transform duration-300">
                      <Image
                        src={phylum.imageSrc}
                        alt={phylum.name}
                        fill
                        sizes="56px"
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-ink/70 font-semibold max-w-md">
                    {phylum.description}
                  </p>
                </div>
                <div className="border-t border-mist/40 pt-4 mt-6 flex justify-between items-center text-4xs font-bold text-ink/50 uppercase tracking-wider">
                  <span className={phylum.textColor}>{phylum.roles}</span>
                  <Link
                    href={`/phylum/${phylum.slug}`}
                    className="inline-flex items-center gap-1 text-5xs font-black text-wisteria hover:underline group/btn"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. UPCOMING EVENTS STRIP */}
      <section className="py-24 sm:py-32 border-t border-b border-mist bg-paper/30 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl"
              >
                Upcoming Events
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="mt-3 text-lg text-ink/60"
              >
                Join our workshops, hackathons, and seminars. Open to all students.
              </motion.p>
            </div>
            <Link
              href="/events"
              className="inline-flex items-center text-sm font-semibold text-wisteria hover:underline group"
            >
              See all events
              <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mockEvents.map((event, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="flex flex-col justify-between rounded-xl border border-mist bg-paper/50 p-6 shadow-sm hover:border-wisteria/20 hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${event.badgeColor}`}>
                      {event.category}
                    </span>
                    <span className="text-xs font-mono text-ink/45">
                      {event.spotsLeft} spots left
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-ink leading-snug mb-3">
                    {event.title}
                  </h3>
                  <div className="space-y-2.5 text-xs text-ink/65">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-ink/40" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-ink/40" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 border-t border-mist/60 pt-4">
                  <Link
                    href={`/events`}
                    className="inline-flex w-full items-center justify-center rounded-lg bg-wisteria-tint/75 py-2 text-xs font-semibold text-wisteria hover:bg-wisteria hover:text-paper transition-colors"
                  >
                    Details & Register
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. MEMBERSHIP CTA BAND */}
      <section className="py-24 bg-gradient-to-b from-paper to-wisteria-tint/25 relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl max-w-2xl mx-auto"
          >
            Ready to Build the Systems of Tomorrow?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-4 max-w-xl text-base sm:text-lg text-ink/70"
          >
            Submit your application today. Once approved, you&apos;ll receive your official CODATOR ID and virtual member pass.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-10"
          >
            <Link
              href="/join"
              className="inline-flex items-center justify-center rounded-lg bg-wisteria px-8 py-4 text-base font-semibold text-paper shadow-md hover:bg-wisteria/90 active:scale-[0.98] transition-all group"
            >
              Apply for Membership
              <ArrowRight className="ml-2 h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

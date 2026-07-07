"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Terminal, Cpu, Globe, Users, Calendar, MapPin, Sparkles, Lightbulb, Code, Rocket } from "lucide-react";
import ConstellationReveal from "@/components/hero/constellation-reveal";
import { createClient } from "@/lib/supabase/client";
import LiveTerminal from "@/components/ui/live-terminal";
import DevSandbox from "@/components/ui/dev-sandbox";

const activities = [
  {
    icon: Terminal,
    title: "Hackathons & Sprints",
    description: "Collaborative building sessions where students team up to build software for real-world challenges.",
    gradient: "from-wisteria/5 to-skyline/5",
    iconColor: "text-wisteria",
    borderColor: "group-hover:border-wisteria/30",
  },
  {
    icon: Cpu,
    title: "Systems & Core Tech",
    description: "Deep dives into operating systems, compilers, networks, and systems programming in Rust, C, and Go.",
    gradient: "from-skyline/5 to-wisteria/5",
    iconColor: "text-skyline",
    borderColor: "group-hover:border-skyline/30",
  },
  {
    icon: Globe,
    title: "Open Source Projects",
    description: "Building and maintaining the society's internal platforms, libraries, and university tools.",
    gradient: "from-ember/5 to-wisteria/5",
    iconColor: "text-ember",
    borderColor: "group-hover:border-ember/30",
  },
  {
    icon: Users,
    title: "Peer Mentorship",
    description: "Bridging semesters. Seniors guide juniors through course selections, interview prep, and project reviews.",
    gradient: "from-wisteria/5 to-ember/5",
    iconColor: "text-wisteria",
    borderColor: "group-hover:border-wisteria/30",
  },
];

const phyla = [
  {
    name: "Tech and Devolpment",
    slug: "tech-and-development",
    description: "The core engineering hub. We build the society's internal software, open-source projects, and systems-level platforms.",
    roles: "Devs / Architects",
    imageSrc: "/tech_phylum.png",
    accent: "from-wisteria/5 to-wisteria-tint/10 border-white/60",
    textColor: "text-wisteria",
    tag: "Code & Infrastructure",
  },
  {
    name: "Media Phylum",
    slug: "media-phylum",
    description: "Creative design and public branding. We manage the visual aesthetics, graphic assets, social media presence, and UI designs.",
    roles: "Designers / Creators",
    imageSrc: "/media_phylum.png",
    accent: "from-skyline/5 to-skyline-tint/10 border-white/60",
    textColor: "text-skyline",
    tag: "Design & Branding",
  },
  {
    name: "Research Phylum",
    slug: "research-phylum",
    description: "Deep technical exploration. We publish papers, run machine learning workshops, and analyze cutting-edge AI technologies.",
    roles: "ML Devs / Researchers",
    imageSrc: "/research_phylum.png",
    accent: "from-emerald-500/5 to-emerald-500/10 border-white/60",
    textColor: "text-emerald-600",
    tag: "AI & CS Research",
  },
  {
    name: "Event management",
    slug: "event-management",
    description: "Operations and community networking. We plan, organize, and execute hackathons, tech workshops, and guest lectures.",
    roles: "Leads / Organizers",
    imageSrc: "/event_phylum.png",
    accent: "from-ember/5 to-ember-tint/10 border-white/60",
    textColor: "text-ember",
    tag: "Operations & Logistics",
  },
];

export default function HomePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("is_published", true)
          .order("date_start", { ascending: true })
          .limit(3);
        if (error) throw error;
        setEvents(data || []);
      } catch (err) {
        console.error("Error loading events for homepage:", err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Framer Motion variants
  const containerVars = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const fadeUpVars = {
    hidden: { opacity: 0, y: 25 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring" as const,
        stiffness: 90,
        damping: 17,
        mass: 0.8
      } 
    },
  };

  return (
    <div className="relative w-full bg-[#F8F8FC]">
      <title>CODATOR | Computer Science & Engineering Society</title>
      <meta name="description" content="Welcome to CODATOR, the university Computer Science & Computer Engineering society. We build systems, hackathons, and workshops for tomorrow." />

      {/* 1. HERO SECTION */}
      <section 
        className="relative flex min-h-[95vh] items-center justify-center overflow-hidden border-b border-mist/40 px-4 sm:px-6 lg:px-8 bg-no-repeat bg-cover"
        style={{ 
          backgroundImage: "url('/hero_raw.png')",
          backgroundPosition: "right -90px"
        }}
      >
        {/* Glassmorphic Gradient Overlay to cover the left-side text in the background image */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#F8F8FC] via-[#F8F8FC] via-50% to-[#F8F8FC]/35 lg:to-transparent z-0" />
        
        {/* Soft Glowing Orbs */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
          <div className="absolute -top-[10%] left-[10%] w-[45vw] h-[45vw] rounded-full bg-wisteria/8 blur-[100px] animate-pulse" style={{ animationDuration: "12s" }} />
          <div className="absolute -bottom-[10%] right-[10%] w-[45vw] h-[45vw] rounded-full bg-skyline/8 blur-[100px] animate-pulse" style={{ animationDuration: "16s" }} />
          <div className="absolute top-[30%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-ember/4 blur-[80px]" />
        </div>

        <ConstellationReveal />

        <div className="relative mx-auto max-w-7xl z-10 py-16 w-full flex flex-col justify-between min-h-[75vh]">
          {/* Main Hero Content Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full my-auto">
            {/* Left Content */}
            <motion.div
              variants={containerVars}
              initial="hidden"
              animate="visible"
              className="lg:col-span-7 flex flex-col items-start text-left space-y-6"
            >
              {/* Tagline */}
              <motion.span
                variants={fadeUpVars}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/45 backdrop-blur-md px-3.5 py-1 text-5xs font-bold uppercase tracking-widest text-wisteria shadow-[0_4px_12px_rgba(0,0,0,0.02)]"
              >
                <Sparkles className="h-3.5 w-3.5 text-wisteria animate-pulse" />
                University CS & CE Society
              </motion.span>

              {/* Headline */}
              <motion.h1
                variants={fadeUpVars}
                className="font-display text-4xl font-black tracking-tight text-ink sm:text-5xl md:text-6xl leading-[1.15] text-[#1D1B26]"
              >
                Building the systems <br />
                <span className="bg-gradient-to-r from-wisteria via-[#7C8BC2] to-skyline bg-clip-text text-transparent">
                  that run tomorrow.
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                variants={fadeUpVars}
                className="max-w-xl text-xs sm:text-sm leading-relaxed text-ink/70 font-semibold"
              >
                CODATOR is a premium student-led community of engineers, builders, and thinkers. We collaborate, share knowledge, and build open-source systems that solve real-world challenges.
              </motion.p>

              {/* CTAs */}
              <motion.div
                variants={fadeUpVars}
                className="pt-4 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto"
              >
                <Link
                  href="/join"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-wisteria px-6 py-3.5 text-xs font-bold text-paper shadow-lg shadow-wisteria/15 hover:shadow-wisteria/25 active:scale-[0.98] transition-all group"
                >
                  Apply for Membership
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/events"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-white/80 bg-white/45 backdrop-blur-md px-6 py-3.5 text-xs font-bold text-ink hover:bg-white/70 hover:shadow-sm active:scale-[0.98] transition-all"
                >
                  See Upcoming Events
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Side: Interactive Terminal shell */}
            <motion.div 
              variants={fadeUpVars}
              className="lg:col-span-5 w-full flex items-center justify-center lg:pl-6 mt-8 lg:mt-0"
            >
              <LiveTerminal />
            </motion.div>
          </div>

          {/* Bottom Features Strip */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="w-full mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border border-white/80 bg-white/40 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
          >
            <div className="flex items-center gap-3 px-4 py-2 border-r border-mist/30 last:border-0 md:border-r">
              <div className="rounded-lg bg-wisteria/10 p-2 text-wisteria">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-5xs font-bold text-ink uppercase tracking-wider">Student-Led</h4>
                <p className="text-6xs font-semibold text-ink/50">Run by students, for students</p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-2 border-r border-mist/30 last:border-0 md:border-r">
              <div className="rounded-lg bg-[#7C8BC2]/10 p-2 text-[#7C8BC2]">
                <Lightbulb className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-5xs font-bold text-ink uppercase tracking-wider">Learn & Build</h4>
                <p className="text-6xs font-semibold text-ink/50">Work on real projects</p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-2 border-r border-mist/30 last:border-0 md:border-r">
              <div className="rounded-lg bg-skyline/10 p-2 text-skyline">
                <Code className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-5xs font-bold text-ink uppercase tracking-wider">Open Source</h4>
                <p className="text-6xs font-semibold text-ink/50">Build for the community</p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-2 last:border-0">
              <div className="rounded-lg bg-ember/10 p-2 text-ember">
                <Rocket className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-5xs font-bold text-ink uppercase tracking-wider">Create Impact</h4>
                <p className="text-6xs font-semibold text-ink/50">Solve real-world problems</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. WHAT WE DO SECTION */}
      <section className="py-20 sm:py-24 bg-white/10 relative overflow-hidden">
        {/* Soft background glow */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[40vw] h-[40vw] rounded-full bg-wisteria/5 blur-[120px] pointer-events-none" />

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-2xl font-black tracking-tight text-ink sm:text-3xl text-[#1D1B26]"
            >
              Engineered for Growth
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-3 text-xs sm:text-sm text-ink/60 font-semibold max-w-md mx-auto"
            >
              We focus on building practical skills, collaborating on code, and helping members launch impactful projects.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Activities */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {activities.map((act, idx) => {
                const Icon = act.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                    className="group relative overflow-hidden rounded-2xl border border-white/80 bg-white/40 backdrop-blur-md p-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-[0_12px_40px_rgba(142,132,173,0.08)] hover:border-wisteria/25 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon with colored backdrop */}
                      <div className={`rounded-xl p-2.5 shadow-3xs ${act.iconColor} bg-white border border-mist/45 group-hover:scale-105 transition-transform duration-300`}>
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="font-display text-xs font-bold text-ink group-hover:text-wisteria transition-colors">
                          {act.title}
                        </h3>
                        <p className="text-5xs leading-relaxed text-ink/65 font-semibold">
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
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                animate={{ y: [0, -6, 0] }}
                transition={{
                  y: {
                    repeat: Infinity,
                    duration: 6,
                    ease: "easeInOut",
                  },
                  opacity: { duration: 0.5 },
                  scale: { duration: 0.5 },
                }}
                viewport={{ once: true, margin: "-50px" }}
                className="relative w-full max-w-[320px] aspect-square rounded-3xl border border-white/80 bg-white/40 backdrop-blur-md p-4 shadow-xl shadow-wisteria/5 hover:shadow-2xl transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-wisteria/10 via-skyline/5 to-transparent z-0 rounded-3xl" />
                <div className="relative w-full h-full z-10 rounded-2xl overflow-hidden bg-white border border-mist/45 shadow-sm">
                  <Image
                    src="/collaboration_bg.png"
                    alt="CODATOR Member Collaboration"
                    fill
                    sizes="320px"
                    className="object-cover"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. OUR CORE PHYLA SECTION */}
      <section className="py-20 sm:py-24 bg-[#FAF9FD] relative overflow-hidden border-t border-mist/45">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/45 backdrop-blur-md px-3 py-0.5 text-5xs font-bold uppercase tracking-widest text-wisteria mb-3 shadow-[0_4px_12px_rgba(0,0,0,0.01)]"
            >
              Society Structure
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-2xl font-black tracking-tight text-ink sm:text-3xl text-[#1D1B26]"
            >
              Our Core Phyla
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-3 text-xs text-ink/60 font-semibold max-w-md mx-auto"
            >
              Every active member belongs to one of our four specialized departments, leading initiatives and collaborating on domain-specific challenges.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {phyla.map((phylum, idx) => {
              // Custom hover shadow styles based on phylum slug
              let hoverClasses = "";
              if (phylum.slug === "tech-and-development") {
                hoverClasses = "hover:shadow-[0_15px_45px_rgba(142,132,173,0.1)] hover:border-wisteria/35";
              } else if (phylum.slug === "media-phylum") {
                hoverClasses = "hover:shadow-[0_15px_45px_rgba(96,150,186,0.1)] hover:border-skyline/35";
              } else if (phylum.slug === "research-phylum") {
                hoverClasses = "hover:shadow-[0_15px_45px_rgba(16,185,129,0.1)] hover:border-emerald-500/35";
              } else {
                hoverClasses = "hover:shadow-[0_15px_45px_rgba(224,122,95,0.1)] hover:border-ember/35";
              }

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className={`group relative overflow-hidden rounded-3xl border border-white/80 bg-white/35 backdrop-blur-md p-6 shadow-xs ${hoverClasses} transition-all duration-300 flex flex-col justify-between min-h-[220px]`}
                >
                  <div className="space-y-3.5">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-2">
                        {/* Tag with dot */}
                        <span className={`inline-flex items-center gap-1 text-5xs font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-white border ${phylum.textColor} border-mist/55 shadow-4xs`}>
                          <span className="h-1 w-1 rounded-full bg-current" />
                          {phylum.tag}
                        </span>
                        <h3 className="font-display text-lg font-black text-ink group-hover:text-wisteria transition-colors">
                          {phylum.name}
                        </h3>
                      </div>
                      {/* Tiny Illustration Card */}
                      <div className="relative h-11 w-11 shrink-0 rounded-xl border border-white/85 bg-white/90 p-2 shadow-3xs group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
                        <Image
                          src={phylum.imageSrc}
                          alt={phylum.name}
                          fill
                          sizes="44px"
                          className="object-contain"
                        />
                      </div>
                    </div>
                    <p className="text-5xs leading-relaxed text-ink/70 font-semibold max-w-sm">
                      {phylum.description}
                    </p>
                  </div>
                  <div className="border-t border-mist/30 pt-3.5 mt-4 flex justify-between items-center text-5xs font-bold text-ink/50 uppercase tracking-widest">
                    <span className={phylum.textColor}>{phylum.roles}</span>
                    <Link
                      href={`/phylum/${phylum.slug}`}
                      className={`inline-flex items-center gap-1 font-black ${phylum.textColor} group/btn`}
                    >
                      <span>Learn More</span>
                      <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3.5 FEATURED PROJECTS SECTION */}
      <section className="py-20 sm:py-24 bg-white/10 relative overflow-hidden border-t border-mist/45">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/85 bg-white/50 backdrop-blur-md px-3 py-0.5 text-5xs font-bold uppercase tracking-widest text-wisteria mb-3 shadow-[0_4px_12px_rgba(0,0,0,0.01)]"
            >
              Crafted by Members
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-2xl font-black tracking-tight text-ink sm:text-3xl text-[#1D1B26]"
            >
              Featured Projects
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-3 text-xs text-ink/60 font-semibold max-w-md mx-auto"
            >
              Explore production-grade software applications and open-source tools developed entirely by CODATOR teams.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "CampusMap",
                desc: "Interactive room finder and pathfinder for the campus. Optimizes navigation routes using Dijkstra's algorithm.",
                tech: ["Next.js", "Rust", "Wasm"],
              },
              {
                title: "UET Scheduler",
                desc: "Conflict-free timetable generator and exam scheduler. Simplifies academic planning for thousands of students.",
                tech: ["React", "Supabase", "Tailwind"],
              },
              {
                title: "GitGlow",
                desc: "Open-source developer dashboard to track contribution streaks and visualize team git activity.",
                tech: ["Vite", "Chart.js", "GitHub API"],
              },
            ].map((proj, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="group flex flex-col justify-between rounded-2xl border border-white/80 bg-white/35 backdrop-blur-md p-5 shadow-xs hover:shadow-[0_12px_40px_rgba(142,132,173,0.06)] hover:border-wisteria/35 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-display text-sm font-bold text-ink group-hover:text-wisteria transition-colors">
                      {proj.title}
                    </h3>
                    <span className="text-6xs font-bold text-wisteria bg-wisteria-tint/40 border border-wisteria/10 px-2 py-0.5 rounded uppercase">
                      Open Source
                    </span>
                  </div>
                  <p className="text-5xs leading-relaxed text-ink/65 font-semibold">
                    {proj.desc}
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-mist/30 flex flex-wrap gap-1.5">
                  {proj.tech.map((t) => (
                    <span key={t} className="text-6xs font-mono font-bold text-ink/45 bg-mist/20 px-1.5 py-0.5 rounded">
                      {t}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3.8 INTERACTIVE DEVSANDBOX & TOOLBOX */}
      <section className="py-20 sm:py-24 border-t border-mist/40 bg-[#FAF9FD] relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/3 w-[30vw] h-[30vw] rounded-full bg-wisteria/5 blur-[100px] pointer-events-none" />

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: DevSandbox Component */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-6 w-full"
            >
              <DevSandbox />
            </motion.div>

            {/* Right: Info and Tech Stack Marquee */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-6 space-y-6"
            >
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/85 bg-white/50 backdrop-blur-md px-3 py-0.5 text-5xs font-bold uppercase tracking-widest text-wisteria mb-3 shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
                  Developer Sandbox
                </span>
                <h2 className="font-display text-2xl font-black tracking-tight text-ink sm:text-3xl text-[#1D1B26] leading-tight">
                  Interact with Our Core Tools & Tech Stack
                </h2>
                <p className="mt-4 text-xs leading-relaxed text-ink/65 font-semibold">
                  At CODATOR, we believe in hands-on building. Toggle logic gates, calculate binary sequences, or view real-time metrics of our engineering phylas right from this sandbox.
                </p>
              </div>

              {/* Minimalist Tech Stack List */}
              <div className="space-y-3 font-sans">
                <h4 className="text-5xs font-extrabold uppercase tracking-wider text-ink/40">Core Languages & Ecosystem</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Rust (Systems & Back-end)",
                    "TypeScript (Full-stack)",
                    "Go (Distributed Systems)",
                    "Docker & Kubernetes",
                    "PostgreSQL & Supabase",
                    "Next.js & React",
                  ].map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1.5 bg-[#FFFFFF] border border-mist/50 rounded-xl text-5xs font-bold text-ink shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:border-wisteria/35 transition-colors"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. UPCOMING EVENTS SECTION */}
      <section className="py-20 sm:py-24 border-t border-b border-mist/40 bg-white/10 relative overflow-hidden">
        {/* Soft background glow */}
        <div className="absolute bottom-0 right-1/4 w-[35vw] h-[35vw] rounded-full bg-skyline/5 blur-[100px] pointer-events-none" />

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-display text-2xl font-black tracking-tight text-ink sm:text-3xl text-[#1D1B26]"
              >
                Upcoming Events
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="mt-2 text-xs text-ink/60 font-semibold"
              >
                Join our workshops, hackathons, and seminars. Open to all students.
              </motion.p>
            </div>
            <Link
              href="/events"
              className="inline-flex items-center text-xs font-bold text-wisteria hover:underline group"
            >
              See all events
              <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              // Skeleton loaders
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse flex flex-col justify-between rounded-2xl border border-white/80 bg-white/20 backdrop-blur-md p-5 shadow-xs h-64"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-ink/10 rounded w-16" />
                      <div className="h-4 bg-ink/10 rounded w-20" />
                    </div>
                    <div className="h-6 bg-ink/10 rounded w-3/4" />
                    <div className="space-y-2">
                      <div className="h-3 bg-ink/10 rounded w-1/2" />
                      <div className="h-3 bg-ink/10 rounded w-2/3" />
                    </div>
                  </div>
                  <div className="h-10 bg-ink/10 rounded-lg w-full mt-4" />
                </div>
              ))
            ) : events.length > 0 ? (
              events.map((event, idx) => {
                // Theme-based styles based on event category
                let themeClasses = {
                  hover: "hover:shadow-[0_15px_40px_rgba(142,132,173,0.08)] hover:border-wisteria/35",
                  tag: "bg-wisteria/5 text-wisteria border-wisteria/20",
                  dot: "bg-wisteria",
                  btn: "bg-wisteria-tint/65 text-wisteria hover:bg-wisteria hover:text-white hover:shadow-md hover:shadow-wisteria/10",
                };

                if (event.category === "Hackathon") {
                  themeClasses = {
                    hover: "hover:shadow-[0_15px_40px_rgba(224,122,95,0.08)] hover:border-ember/35",
                    tag: "bg-ember/5 text-ember border-ember/20",
                    dot: "bg-ember",
                    btn: "bg-ember/10 text-ember hover:bg-ember hover:text-white hover:shadow-md hover:shadow-ember/10",
                  };
                } else if (event.category === "Seminar") {
                  themeClasses = {
                    hover: "hover:shadow-[0_15px_40px_rgba(96,150,186,0.08)] hover:border-skyline/35",
                    tag: "bg-skyline/5 text-skyline border-skyline/20",
                    dot: "bg-skyline",
                    btn: "bg-skyline/10 text-skyline hover:bg-skyline hover:text-white hover:shadow-md hover:shadow-skyline/10",
                  };
                }

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                    className={`flex flex-col justify-between rounded-2xl border border-white/80 bg-white/35 backdrop-blur-md p-5 shadow-xs ${themeClasses.hover} transition-all duration-300 hover:-translate-y-0.5`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        {/* Tag with dot */}
                        <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-5xs font-bold uppercase tracking-wider border ${themeClasses.tag}`}>
                          <span className={`h-1 w-1 rounded-full ${themeClasses.dot}`} />
                          {event.category}
                        </span>
                        <span className="text-5xs font-mono text-ink/45 font-bold">
                          {event.capacity ? `${event.capacity} seats` : "Open entry"}
                        </span>
                      </div>
                      <h3 className="font-display text-sm font-bold text-ink leading-snug mb-3 group-hover:text-wisteria transition-colors line-clamp-2">
                        {event.title}
                      </h3>
                      <div className="space-y-2 text-5xs text-ink/65 font-semibold">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-ink/45" />
                          <span>{formatDate(event.date_start)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-ink/45" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-5 border-t border-mist/30 pt-4">
                      <Link
                        href={`/events/${event.slug}`}
                        className={`inline-flex w-full items-center justify-center rounded-lg py-2.5 text-5xs font-bold transition-all duration-350 active:scale-[0.98] ${themeClasses.btn}`}
                      >
                        Details & Register
                      </Link>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12 border border-dashed border-mist rounded-2xl bg-white/20">
                <Calendar className="mx-auto h-8 w-8 text-ink/35 mb-3 animate-bounce" />
                <p className="text-xs text-ink/55 font-bold">No upcoming events scheduled at the moment.</p>
                <p className="text-5xs text-ink/45 mt-1 font-semibold">Check back later or join our community to stay updated!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4.5 MILESTONES & TESTIMONIALS SECTION */}
      <section className="py-20 sm:py-24 bg-[#FAF9FD] relative overflow-hidden border-t border-mist/45">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] rounded-full bg-wisteria/5 blur-[120px] pointer-events-none" />

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-24">
          
          {/* Milestones Horizontal Timeline */}
          <div className="space-y-12">
            <div className="mx-auto max-w-2xl text-center">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/85 bg-white/50 backdrop-blur-md px-3 py-0.5 text-5xs font-bold uppercase tracking-widest text-wisteria mb-3 shadow-[0_4px_12px_rgba(0,0,0,0.01)]"
              >
                Our Growth
              </motion.span>
              <h2 className="font-display text-2xl font-black tracking-tight text-ink sm:text-3xl text-[#1D1B26]">
                Society Milestones
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Timeline Horizontal Connector Line for Desktop */}
              <div className="hidden md:block absolute top-[15px] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-wisteria/20 via-skyline/20 to-wisteria/20 -z-10" />

              {[
                {
                  year: "2024",
                  title: "Inception & 100+ Members",
                  desc: "CODATOR was established, uniting CS and CE students under a structured learning roadmap.",
                },
                {
                  year: "2025",
                  title: "Launch of Open-Source Hub",
                  desc: "Released campus utility tools on GitHub and hosted our first 24-hour sprint.",
                },
                {
                  year: "2026",
                  title: "National Hackathons & Passes",
                  desc: "Introduced advanced digital passes and expanded to host regional inter-university hackathons.",
                },
              ].map((milestone, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="flex flex-col items-center text-center space-y-3"
                >
                  {/* Glowing Node */}
                  <div className="h-8 w-8 rounded-full border border-white bg-white shadow-md flex items-center justify-center relative">
                    <span className="h-2.5 w-2.5 rounded-full bg-wisteria animate-pulse" />
                  </div>
                  <div className="space-y-1.5 max-w-xs">
                    <span className="font-mono text-xs font-black text-wisteria">{milestone.year}</span>
                    <h3 className="font-display text-xs font-bold text-ink">{milestone.title}</h3>
                    <p className="text-5xs text-ink/60 leading-relaxed font-semibold">{milestone.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="space-y-12">
            <div className="mx-auto max-w-2xl text-center">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/85 bg-white/50 backdrop-blur-md px-3 py-0.5 text-5xs font-bold uppercase tracking-widest text-wisteria mb-3 shadow-[0_4px_12px_rgba(0,0,0,0.01)]"
              >
                Voices of CODATOR
              </motion.span>
              <h2 className="font-display text-2xl font-black tracking-tight text-ink sm:text-3xl text-[#1D1B26]">
                What Our Leaders Say
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  quote: "CODATOR isn't just a society; it's a launchpad. Collaborating on production-ready systems here gave us the confidence to build real-world software.",
                  name: "Fahad Ali",
                  role: "President",
                },
                {
                  quote: "The peer mentorship and technical sprints bridge the gap between classroom theory and industry-level software engineering.",
                  name: "Aqsa Sanaullah",
                  role: "Vice President (Female)",
                },
              ].map((test, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="flex flex-col justify-between rounded-3xl border border-white/80 bg-white/40 backdrop-blur-md p-6 shadow-xs relative"
                >
                  <p className="text-xs italic leading-relaxed text-ink/80 font-medium">
                    &ldquo;{test.quote}&rdquo;
                  </p>
                  <div className="mt-6 pt-4 border-t border-mist/35 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-wisteria-tint/50 border border-wisteria/10 flex items-center justify-center text-wisteria font-display text-2xs font-bold">
                      {test.name[0]}
                    </div>
                    <div>
                      <h4 className="text-5xs font-bold text-[#1D1B26]">{test.name}</h4>
                      <p className="text-6xs font-bold text-ink/45 uppercase tracking-wider">{test.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 5. MEMBERSHIP CTA CARD */}
      <section className="py-20 bg-gradient-to-b from-[#F8F8FC] to-[#F0EDF6] relative overflow-hidden">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="border border-white/80 bg-white/50 backdrop-blur-md rounded-3xl p-8 sm:p-10 text-center space-y-6 shadow-xl shadow-wisteria/5"
          >
            <h2 className="font-display text-2xl font-black tracking-tight text-ink sm:text-3xl max-w-xl mx-auto">
              Ready to Build the Systems of Tomorrow?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-xs text-ink/70 font-semibold leading-relaxed">
              Submit your application today. Once approved, you&apos;ll receive your official CODATOR ID and virtual member pass.
            </p>
            <div className="pt-4">
              <Link
                href="/join"
                className="inline-flex items-center justify-center rounded-xl bg-wisteria px-7 py-3 text-xs font-bold text-paper shadow-lg shadow-wisteria/15 hover:shadow-wisteria/25 active:scale-[0.98] transition-all group"
              >
                Apply for Membership
                <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

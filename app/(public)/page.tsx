"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Terminal, Cpu, Globe, Users, Calendar, MapPin } from "lucide-react";
import ConstellationReveal from "@/components/hero/constellation-reveal";

const activities = [
  {
    icon: Terminal,
    title: "Hackathons & Sprints",
    description: "Collaborative, high-energy building sessions where students team up to build software solutions for real-world challenges.",
    gradient: "from-wisteria-tint to-skyline-tint/30",
    iconColor: "text-wisteria",
  },
  {
    icon: Cpu,
    title: "Systems & Core Tech",
    description: "Deep dives into operating systems, compilers, computer networks, and systems-level programming in Rust, C, and Go.",
    gradient: "from-skyline-tint to-wisteria-tint/30",
    iconColor: "text-skyline",
  },
  {
    icon: Globe,
    title: "Open Source Projects",
    description: "Building and maintaining the society's internal platforms, open-source libraries, and collaborative university tools.",
    gradient: "from-wisteria-tint/40 to-paper",
    iconColor: "text-wisteria",
  },
  {
    icon: Users,
    title: "Peer Mentorship",
    description: "Bridging the gap between semesters. Seniors guide juniors through course selections, interview prep, and project reviews.",
    gradient: "from-skyline-tint/40 to-paper",
    iconColor: "text-skyline",
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
      {/* 1. HERO SECTION */}
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden border-b border-mist px-4 sm:px-6 lg:px-8">
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

      {/* 2. WHAT WE DO SECTION */}
      <section className="py-24 sm:py-32 bg-paper/30 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-20">
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Engineered for Growth
            </h2>
            <p className="mt-4 text-lg text-ink/60">
              We focus on building practical skills, collaborating on code, and helping members launch impactful projects.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                  className={`group relative overflow-hidden rounded-2xl border border-mist bg-gradient-to-br ${act.gradient} p-8 shadow-sm transition-all hover:shadow-md hover:border-wisteria/20`}
                >
                  <div className="flex items-start gap-5">
                    <div className={`rounded-xl bg-paper p-3 shadow-sm ${act.iconColor} border border-mist group-hover:border-wisteria/30 transition-colors`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold text-ink mb-2">
                        {act.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-ink/70">
                        {act.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. UPCOMING EVENTS STRIP */}
      <section className="py-24 sm:py-32 border-t border-b border-mist bg-paper relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Upcoming Events
              </h2>
              <p className="mt-3 text-lg text-ink/60">
                Join our workshops, hackathons, and seminars. Open to all students.
              </p>
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
                    href={`/events/mock-event-${idx}`}
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

      {/* 4. MEMBERSHIP CTA BAND */}
      <section className="py-24 bg-gradient-to-b from-paper to-wisteria-tint/25 relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl max-w-2xl mx-auto">
            Ready to Build the Systems of Tomorrow?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base sm:text-lg text-ink/70">
            Submit your application today. Once approved, you&apos;ll receive your official CODATOR ID and virtual member pass.
          </p>
          <div className="mt-10">
            <Link
              href="/join"
              className="inline-flex items-center justify-center rounded-lg bg-wisteria px-8 py-4 text-base font-semibold text-paper shadow-md hover:bg-wisteria/90 active:scale-[0.98] transition-all group"
            >
              Apply for Membership
              <ArrowRight className="ml-2 h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

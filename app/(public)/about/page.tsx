"use client";

import { motion } from "framer-motion";
import { Award, Terminal, Target, Compass, Sparkles } from "lucide-react";

const milestones = [
  {
    date: "September 2024",
    title: "Foundation & Inception",
    description: "CODATOR was founded by a group of CS and CE students who wanted a dedicated space to build software and explore systems engineering beyond the classroom.",
  },
  {
    date: "November 2024",
    title: "First Annual Hackathon",
    description: "Launched 'ByteCraft 2024', bringing together 120+ students to build prototypes over a 24-hour sprint. Supported by local tech sponsors.",
  },
  {
    date: "March 2025",
    title: "Open Source Hub Launch",
    description: "Established the society's GitHub organization and launched our first campus utility tool, contributing directly to university student life.",
  },
  {
    date: "October 2025",
    title: "Peer Mentorship Initiative",
    description: "Structured a formal 1-on-1 peer mentoring system, pairing 40+ senior students with incoming juniors for technical guidance and career prep.",
  },
  {
    date: "Present Day",
    title: "Building the Future",
    description: "Now supporting hundreds of active members, running weekly workshops, and maintaining production-ready software systems.",
  },
];

const pillars = [
  {
    icon: Target,
    title: "Technical Excellence",
    description: "Fostering deep technical knowledge, clean coding standards, and rigorous systems thinking.",
    color: "text-wisteria bg-wisteria-tint/40 border-wisteria/10",
  },
  {
    icon: Compass,
    title: "Collaboration",
    description: "Believing that the best systems are built by diverse, connected teams sharing open ideas.",
    color: "text-skyline bg-skyline-tint/30 border-skyline/10",
  },
  {
    icon: Terminal,
    title: "Practical Application",
    description: "Moving quickly from theory to code, shipping actual working software that solves problems.",
    color: "text-ember bg-ember-tint/20 border-ember/10",
  },
  {
    icon: Award,
    title: "Community Growth",
    description: "Mentoring the next cohort of developers and building a supportive network of lifelong learners.",
    color: "text-wisteria bg-wisteria-tint/40 border-wisteria/10",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F8F8FC] pt-28 pb-20 text-ink">
      <title>About CODATOR | Society Pillars & History</title>
      <meta name="description" content="Learn about the CODATOR computer science and engineering society, our core pillars, and our history." />
      
      {/* Soft background glow */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute -top-[10%] left-[15%] w-[40vw] h-[40vw] rounded-full bg-wisteria/5 blur-[100px]" />
        <div className="absolute top-[40%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-skyline/5 blur-[90px]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-20">
        
        {/* Header */}
        <div className="max-w-3xl">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/45 backdrop-blur-md px-3 py-0.5 text-5xs font-bold uppercase tracking-widest text-wisteria mb-4 shadow-[0_4px_12px_rgba(0,0,0,0.01)]"
          >
            <Sparkles className="h-3.5 w-3.5 text-wisteria" />
            Who We Are
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display text-3xl font-black tracking-tight text-ink sm:text-4xl text-[#1D1B26]"
          >
            About CODATOR
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-xs sm:text-sm leading-relaxed text-ink/75 font-semibold"
          >
            We are the Computer Science & Computer Engineering society. A student-run organization dedicated to building, learning, and sharing.
          </motion.p>
        </div>

        {/* Mission / Vision Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border border-white/80 bg-white/40 backdrop-blur-md rounded-3xl p-6 shadow-xs"
          >
            <h2 className="font-display text-base font-bold text-[#1D1B26] mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-wisteria" />
              Our Mission
            </h2>
            <p className="text-5xs text-ink/70 leading-relaxed font-semibold">
              To create an environment where computer science and computer engineering students can bridge the gap between academic theory and practical engineering. We empower our members by hosting technical sprints, workshops on cutting-edge technologies, and providing open-source project opportunities.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="border border-white/80 bg-white/40 backdrop-blur-md rounded-3xl p-6 shadow-xs"
          >
            <h2 className="font-display text-base font-bold text-[#1D1B26] mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-skyline" />
              Our Vision
            </h2>
            <p className="text-5xs text-ink/70 leading-relaxed font-semibold">
              To build a premier student-led technical community recognized for producing top-tier software engineers, systems architects, and technology leaders. We envision a collaborative ecosystem where knowledge flows freely across semesters and departments.
            </p>
          </motion.div>
        </section>

        {/* Core Pillars */}
        <section className="space-y-10">
          <h2 className="font-display text-xl font-black text-[#1D1B26] text-center uppercase tracking-wider">Our Core Pillars</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="flex gap-4 p-5 rounded-2xl border border-white/80 bg-white/40 backdrop-blur-md shadow-xs hover:shadow-[0_12px_40px_rgba(142,132,173,0.05)] transition-all duration-300"
                >
                  <div className={`flex-shrink-0 rounded-xl p-2.5 h-10 w-10 flex items-center justify-center border ${pillar.color}`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-display text-xs font-bold text-ink">{pillar.title}</h3>
                    <p className="text-5xs text-ink/65 leading-relaxed font-semibold">{pillar.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Timeline of Milestones */}
        <section className="space-y-12">
          <h2 className="font-display text-xl font-black text-[#1D1B26] text-center uppercase tracking-wider">Our Journey</h2>
          
          <div className="relative border-l border-mist/50 max-w-2xl mx-auto pl-6 sm:pl-10 space-y-10">
            {milestones.map((milestone, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative space-y-1.5"
              >
                {/* Timeline Dot */}
                <span className="absolute -left-[31px] sm:-left-[47px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white border border-mist shadow-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-wisteria animate-pulse" />
                </span>
                
                <span className="font-mono text-5xs font-bold text-wisteria uppercase tracking-widest bg-wisteria-tint px-2 py-0.5 rounded">
                  {milestone.date}
                </span>
                <h3 className="font-display text-xs font-bold text-ink pt-1">
                  {milestone.title}
                </h3>
                <p className="text-5xs text-ink/70 leading-relaxed font-semibold">
                  {milestone.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { Award, Terminal, Target, Compass } from "lucide-react";

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
  },
  {
    icon: Compass,
    title: "Collaboration",
    description: "Believing that the best systems are built by diverse, connected teams sharing open ideas.",
  },
  {
    icon: Terminal,
    title: "Practical Application",
    description: "Moving quickly from theory to code, shipping actual working software that solves problems.",
  },
  {
    icon: Award,
    title: "Community Growth",
    description: "Mentoring the next cohort of developers and building a supportive network of lifelong learners.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-paper pt-28 pb-20 text-ink">
      <title>About CODATOR | Society Pillars & History</title>
      <meta name="description" content="Learn about the CODATOR computer science and engineering society, our core pillars, and our history." />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-20">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl"
          >
            About CODATOR
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-xl leading-relaxed text-ink/75"
          >
            We are the Computer Science & Computer Engineering society. A student-run organization dedicated to building, learning, and sharing.
          </motion.p>
        </div>

        {/* Mission / Vision Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 py-12 border-t border-mist">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink mb-4">Our Mission</h2>
            <p className="text-base text-ink/70 leading-relaxed">
              To create an environment where computer science and computer engineering students can bridge the gap between academic theory and practical engineering. We empower our members by hosting technical sprints, workshops on cutting-edge technologies, and providing open-source project opportunities.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-ink mb-4">Our Vision</h2>
            <p className="text-base text-ink/70 leading-relaxed">
              To build a premier student-led technical community recognized for producing top-tier software engineers, systems architects, and technology leaders. We envision a collaborative ecosystem where knowledge flows freely across semesters and departments.
            </p>
          </div>
        </section>

        {/* Core Pillars */}
        <section className="py-20 border-t border-mist">
          <h2 className="font-display text-2xl font-bold text-ink mb-12 text-center">Our Core Pillars</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="flex gap-4 p-5 rounded-xl border border-mist bg-paper/30"
                >
                  <div className="flex-shrink-0 rounded-lg bg-wisteria-tint p-2.5 text-wisteria h-11 w-11 flex items-center justify-center border border-wisteria/10">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-ink mb-1">{pillar.title}</h3>
                    <p className="text-sm text-ink/65 leading-relaxed">{pillar.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Timeline of Milestones */}
        <section className="py-20 border-t border-mist">
          <h2 className="font-display text-2xl font-bold text-ink mb-16 text-center">Our Journey</h2>
          
          <div className="relative border-l border-mist max-w-3xl mx-auto pl-6 sm:pl-10 space-y-12">
            {milestones.map((milestone, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative"
              >
                {/* Timeline Dot */}
                <span className="absolute -left-[31px] sm:-left-[47px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-paper border-2 border-wisteria">
                  <span className="h-1.5 w-1.5 rounded-full bg-wisteria" />
                </span>
                
                <span className="font-mono text-xs font-bold text-wisteria uppercase tracking-wider">
                  {milestone.date}
                </span>
                <h3 className="font-display text-lg font-bold text-ink mt-1 mb-2">
                  {milestone.title}
                </h3>
                <p className="text-sm text-ink/70 leading-relaxed max-w-2xl">
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

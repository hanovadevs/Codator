"use client";

import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/brand-icons";

const teamMembers = [
  {
    name: "Aisha Rahman",
    role: "President",
    dept: "Computer Science",
    batch: "Class of 2027",
    initials: "AR",
    bgGradient: "from-wisteria/20 to-skyline/20",
    textColor: "text-wisteria",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    email: "aisha.rahman@codator.org",
  },
  {
    name: "Kabir Mehta",
    role: "Vice President",
    dept: "Computer Engineering",
    batch: "Class of 2027",
    initials: "KM",
    bgGradient: "from-skyline/20 to-wisteria/20",
    textColor: "text-skyline",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    email: "kabir.mehta@codator.org",
  },
  {
    name: "Zainab Malik",
    role: "Tech Lead",
    dept: "Computer Science",
    batch: "Class of 2027",
    initials: "ZM",
    bgGradient: "from-wisteria/35 to-wisteria-tint",
    textColor: "text-wisteria",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    email: "zainab.malik@codator.org",
  },
  {
    name: "Daniel Joseph",
    role: "Event Organizer",
    dept: "Software Engineering",
    batch: "Class of 2028",
    initials: "DJ",
    bgGradient: "from-skyline/35 to-skyline-tint",
    textColor: "text-skyline",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    email: "daniel.joseph@codator.org",
  },
  {
    name: "Sanya Sen",
    role: "General Secretary",
    dept: "Computer Science",
    batch: "Class of 2027",
    initials: "SS",
    bgGradient: "from-wisteria-tint to-skyline-tint",
    textColor: "text-wisteria",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    email: "sanya.sen@codator.org",
  },
  {
    name: "Rohan Das",
    role: "Design Lead",
    dept: "Computer Engineering",
    batch: "Class of 2028",
    initials: "RD",
    bgGradient: "from-skyline-tint to-wisteria-tint",
    textColor: "text-skyline",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    email: "rohan.das@codator.org",
  },
  {
    name: "Neha Kapoor",
    role: "Public Relations",
    dept: "Information Technology",
    batch: "Class of 2028",
    initials: "NK",
    bgGradient: "from-wisteria/15 to-skyline/15",
    textColor: "text-wisteria",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    email: "neha.kapoor@codator.org",
  },
];

export default function TeamPage() {
  return (
    <div className="py-20 sm:py-28 bg-paper">
      <title>Meet the Team | CODATOR</title>
      <meta name="description" content="Meet the student committee, developers, and designers leading the CODATOR Computer Science & Engineering society." />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="max-w-3xl mb-20">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl"
          >
            Meet the Team
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-xl leading-relaxed text-ink/75"
          >
            The student organizers, developers, and designers working behind the scenes to run CODATOR.
          </motion.p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 gap-y-12 gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="group flex flex-col items-center text-center p-6 border border-mist rounded-2xl bg-paper/30 hover:border-wisteria/20 hover:shadow-sm transition-all"
            >
              {/* Profile Avatar Placeholder (Initials with premium gradient) */}
              <div className={`relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-tr ${member.bgGradient} border border-mist group-hover:scale-[1.03] transition-transform duration-300 shadow-inner mb-6`}>
                <span className={`font-display text-3xl font-extrabold tracking-tight ${member.textColor}`}>
                  {member.initials}
                </span>
              </div>

              <h3 className="font-display text-lg font-bold text-ink group-hover:text-wisteria transition-colors">
                {member.name}
              </h3>
              <p className="text-sm font-semibold text-wisteria mt-0.5">
                {member.role}
              </p>
              
              <div className="mt-4 flex flex-col gap-0.5 text-xs text-ink/50">
                <span>{member.dept}</span>
                <span>{member.batch}</span>
              </div>

              {/* Social Links */}
              <div className="mt-6 flex gap-4 text-ink/40">
                <a
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-wisteria transition-colors"
                >
                  <span className="sr-only">GitHub</span>
                  <GithubIcon className="h-4 w-4" />
                </a>
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-wisteria transition-colors"
                >
                  <span className="sr-only">LinkedIn</span>
                  <LinkedinIcon className="h-4 w-4" />
                </a>
                <a
                  href={`mailto:${member.email}`}
                  className="hover:text-wisteria transition-colors"
                >
                  <span className="sr-only">Email</span>
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

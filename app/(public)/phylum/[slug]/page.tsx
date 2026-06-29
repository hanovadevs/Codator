import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Cpu, Terminal, Sparkles, Calendar, BookOpen, Layers } from "lucide-react";

interface PhylumData {
  name: string;
  dbName: string; // The exact name stored in the Supabase 'department' column
  tagline: string;
  description: string;
  imageSrc: string;
  colorClass: string;
  accentClass: string;
  technologies: string[];
  projects: string[];
  roles: { title: string; desc: string }[];
  details: string;
}

const PHYLA_DATA: Record<string, PhylumData> = {
  "tech-and-development": {
    name: "Tech & Development",
    dbName: "Tech and Devolpment",
    tagline: "Building the software and infrastructure of tomorrow.",
    description: "The core engineering hub of CODATOR. We design, write, and maintain the society's internal platforms, student tools, and open-source packages.",
    imageSrc: "/tech_phylum.png",
    colorClass: "text-wisteria border-wisteria/25 bg-wisteria-tint/20",
    accentClass: "from-purple-500/10 to-wisteria-tint/20",
    technologies: ["Rust", "Next.js", "TypeScript", "Go", "PostgreSQL", "Supabase", "Docker", "Tailwind CSS"],
    projects: [
      "CODATOR Portal: The digital membership card and check-in scanner.",
      "Campus Hub: An open-source collaborative calendar for university events.",
      "Society API: A secure central backend for managing student registrations."
    ],
    roles: [
      { title: "Director", desc: "Oversees technical vision, system architecture, and code reviews." },
      { title: "Head / Co-Head", desc: "Lead development sprints and manage repository contributions." },
      { title: "Member", desc: "Contribute to active projects, write tests, and participate in peer-reviews." }
    ],
    details: "As a member of the Tech & Development Phylum, you will work on production-grade software using modern stacks. You'll gain hands-on experience with version control, database design, and CI/CD pipelines, preparing you for real-world software engineering roles."
  },
  "media-phylum": {
    name: "Media Phylum",
    dbName: "Media Phylum",
    tagline: "Crafting the visual identity and public voice of CODATOR.",
    description: "The creative core of our society. We design graphic assets, build premium UI/UX mockups, and manage all social media outreach and public branding.",
    imageSrc: "/media_phylum.png",
    colorClass: "text-skyline border-skyline/25 bg-skyline-tint/20",
    accentClass: "from-blue-500/10 to-skyline-tint/20",
    technologies: ["Figma", "Adobe Illustrator", "Photoshop", "Premiere Pro", "After Effects", "Tailwind CSS", "Spline (3D)"],
    projects: [
      "Brand Guidelines: Standardizing CODATOR's typography, colors, and logos.",
      "Event Campaigns: Designing promo videos, banners, and digital flyers.",
      "UI/UX Prototypes: Wireframing and mocking up new features for the portal."
    ],
    roles: [
      { title: "Director", desc: "Sets visual style guides and approves all public-facing media." },
      { title: "Head / Co-Head", desc: "Coordinate design workflows and social media publication schedules." },
      { title: "Member", desc: "Create graphics, edit videos, and design user interfaces for web apps." }
    ],
    details: "The Media Phylum is where technology meets art. If you love UI/UX design, videography, or visual storytelling, this is your home. You'll collaborate closely with the Tech Phylum to turn wireframes into stunning web applications."
  },
  "research-phylum": {
    name: "Research Phylum",
    dbName: "Research Phylum",
    tagline: "Exploring the frontiers of computer science and AI.",
    description: "Our academic and research division. We study machine learning models, analyze algorithms, write research summaries, and host technical reading groups.",
    imageSrc: "/research_phylum.png",
    colorClass: "text-emerald-600 border-emerald-500/20 bg-emerald-50",
    accentClass: "from-emerald-500/10 to-emerald-500/5",
    technologies: ["Python", "PyTorch", "Jupyter", "LaTeX", "NumPy", "Hugging Face", "Pandas"],
    projects: [
      "AI Reading Group: Weekly discussion on state-of-the-art LLM architectures.",
      "Student Research Sprint: Guiding members through writing their first CS paper.",
      "Data Analysis: Aggregating and visualizing campus academic trends."
    ],
    roles: [
      { title: "Director", desc: "Defines research tracks, selects paper reviews, and mentors writers." },
      { title: "Head / Co-Head", desc: "Facilitate reading groups and coordinate workshop agendas." },
      { title: "Member", desc: "Analyze research papers, write summaries, and build ML models." }
    ],
    details: "The Research Phylum is designed for students passionate about deep technical knowledge and academia. Whether you're interested in pursuing a Master's/PhD, working in R&D, or mastering machine learning, you'll find peer support and guidance here."
  },
  "event-management": {
    name: "Event Management",
    dbName: "Event management",
    tagline: "Orchestrating high-impact hackathons and workshops.",
    description: "The logistical engine of CODATOR. We plan, organize, and execute all society events, from 24-hour hackathons to guest speaker seminars and networking nights.",
    imageSrc: "/event_phylum.png",
    colorClass: "text-amber-600 border-amber-500/20 bg-amber-50",
    accentClass: "from-amber-500/10 to-amber-500/5",
    technologies: ["Notion", "Discord", "Google Workspace", "Slido", "Trello", "Luma"],
    projects: [
      "Shatter The Code '26: Organizing our flagship 24-hour hackathon.",
      "Tech Talk Series: Inviting industry engineers for university tech talks.",
      "Coding Bootcamps: Organizing weekend introductory bootcamps for freshmen."
    ],
    roles: [
      { title: "Director", desc: "Oversees event budgets, university permissions, and corporate sponsorships." },
      { title: "Head / Co-Head", desc: "Manage operational logistics, volunteers, and venue setups." },
      { title: "Member", desc: "Host events, coordinate check-ins, manage registrations, and guide attendees." }
    ],
    details: "In Event Management, you'll develop essential leadership, public speaking, and project management skills. You'll be responsible for making sure our events run seamlessly, dealing with sponsorships, logistics, and university administration."
  }
};

export async function generateStaticParams() {
  return [
    { slug: "tech-and-development" },
    { slug: "tech-and-devolpment" }, // Support database spelling
    { slug: "media-phylum" },
    { slug: "research-phylum" },
    { slug: "event-management" }
  ];
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PhylumDetailsPage({ params }: PageProps) {
  const { slug } = await params;

  // Normalize slug (redirect database spelling to standard slug)
  let targetSlug = slug.toLowerCase();
  if (targetSlug === "tech-and-devolpment") {
    targetSlug = "tech-and-development";
  }

  const phylum = PHYLA_DATA[targetSlug];

  if (!phylum) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-paper pt-28 pb-20 text-ink relative overflow-hidden">
      {/* Background soft glow */}
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-wisteria/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-skyline/5 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        
        {/* ================= HERO SECTION ================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Info */}
          <div className="lg:col-span-7 space-y-6">
            <span className={`inline-flex items-center gap-1 text-5xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${phylum.colorClass}`}>
              <Sparkles className="h-3.5 w-3.5" />
              Active Phylum
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight leading-none text-ink">
              {phylum.name}
            </h1>
            <p className="text-lg sm:text-xl font-bold text-wisteria leading-snug">
              {phylum.tagline}
            </p>
            <p className="text-sm sm:text-base leading-relaxed text-ink/75 font-semibold">
              {phylum.description}
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Link
                href={`/join?phylum=${encodeURIComponent(phylum.dbName)}`}
                className="inline-flex items-center justify-center rounded-xl bg-wisteria px-6 py-3.5 text-xs font-bold text-paper hover:bg-wisteria/90 transition-all shadow-md group"
              >
                Apply to Join this Phylum
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/join"
                className="inline-flex items-center justify-center rounded-xl border border-mist bg-paper/50 px-6 py-3.5 text-xs font-bold text-ink hover:bg-mist/35 transition-colors"
              >
                General Membership
              </Link>
            </div>
          </div>

          {/* Right: Illustration */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[380px] aspect-square rounded-3xl overflow-hidden border border-mist/80 bg-gradient-to-br from-white/70 to-white/30 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              {/* Soft backdrop glow behind image */}
              <div className="absolute inset-0 bg-gradient-to-br from-wisteria-tint/30 via-skyline-tint/10 to-transparent z-0" />
              <div className="relative w-full h-full z-10">
                <Image
                  src={phylum.imageSrc}
                  alt={`${phylum.name} Illustration`}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* ================= CONTENT DETAILS ================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-t border-mist/60 pt-16">
          {/* Left Column: What We Do & Projects */}
          <div className="lg:col-span-7 space-y-10">
            <div className="space-y-4">
              <h2 className="font-display text-2xl font-black text-ink flex items-center gap-2">
                <BookOpen className="h-5.5 w-5.5 text-wisteria" />
                <span>What We Do</span>
              </h2>
              <p className="text-sm leading-relaxed text-ink/75 font-semibold">
                {phylum.details}
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-2xl font-black text-ink flex items-center gap-2">
                <Terminal className="h-5.5 w-5.5 text-wisteria" />
                <span>Featured Projects</span>
              </h2>
              <ul className="space-y-4">
                {phylum.projects.map((project, idx) => (
                  <li key={idx} className="flex gap-3 items-start border border-mist/50 rounded-2xl p-4 bg-white/40 shadow-3xs">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-wisteria-tint text-wisteria text-5xs font-bold mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-ink/75 leading-relaxed">{project}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Tech & Roles */}
          <div className="lg:col-span-5 space-y-10">
            {/* Technologies */}
            <div className="space-y-4 bg-white/30 border border-mist/55 rounded-3xl p-6">
              <h3 className="font-display text-base font-black text-ink flex items-center gap-2">
                <Cpu className="h-5 w-5 text-wisteria" />
                <span>Technologies & Tools</span>
              </h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {phylum.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="bg-paper border border-mist/85 px-3 py-1.5 rounded-xl text-4xs font-bold text-ink/75 shadow-3xs"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Available Roles */}
            <div className="space-y-4 bg-white/30 border border-mist/55 rounded-3xl p-6">
              <h3 className="font-display text-base font-black text-ink flex items-center gap-2">
                <Layers className="h-5 w-5 text-wisteria" />
                <span>Phylum Positions</span>
              </h3>
              <div className="space-y-5 pt-1">
                {phylum.roles.map((role) => (
                  <div key={role.title} className="space-y-1">
                    <h4 className="text-xs font-black text-wisteria flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-wisteria" />
                      {role.title} of {phylum.name}
                    </h4>
                    <p className="text-4xs text-ink/65 font-semibold leading-relaxed pl-3">
                      {role.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================= JOIN CTA BANNER ================= */}
        <section className="rounded-3xl border border-mist/80 bg-gradient-to-br from-white/80 to-white/20 p-8 sm:p-12 text-center shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-wisteria-tint/20 via-skyline-tint/10 to-transparent opacity-50 z-0" />
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <h2 className="font-display text-2xl sm:text-3xl font-black text-ink">
              Ready to make your impact in {phylum.name}?
            </h2>
            <p className="text-xs sm:text-sm text-ink/65 font-semibold leading-relaxed">
              We recruit new members at the start of every semester. If you are passionate, eager to learn, and ready to build, submit your application today.
            </p>
            <div className="pt-2">
              <Link
                href={`/join?phylum=${encodeURIComponent(phylum.dbName)}`}
                className="inline-flex items-center justify-center rounded-xl bg-wisteria px-8 py-4 text-xs font-bold text-paper hover:bg-wisteria/90 transition-all shadow-md group"
              >
                Apply for this Phylum
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

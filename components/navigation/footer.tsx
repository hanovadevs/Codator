import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon, InstagramIcon } from "@/components/ui/brand-icons";

export default function Footer() {
  return (
    <footer className="border-t border-mist bg-paper/80 backdrop-blur-md relative py-16 overflow-hidden">
      {/* Premium Glowing Top Accent Border */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-wisteria via-skyline to-wisteria opacity-40" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative h-8 w-8 overflow-hidden transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/without%20text_logo.png"
                  alt="CODATOR Logo"
                  fill
                  sizes="32px"
                  className="object-contain"
                />
              </div>
              <span className="font-display text-lg font-bold tracking-tight text-ink group-hover:text-wisteria transition-colors">
                CODATOR
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-ink/65 font-semibold">
              The university Computer Science & Engineering society. We build systems, host workshops, and foster a community of passionate student builders.
            </p>
            <div className="flex gap-4.5 text-ink/40 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-wisteria hover:scale-110 transition-all p-1.5 rounded-lg bg-paper border border-mist hover:border-wisteria/30 shadow-3xs"
              >
                <span className="sr-only">GitHub</span>
                <GithubIcon className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-wisteria hover:scale-110 transition-all p-1.5 rounded-lg bg-paper border border-mist hover:border-wisteria/30 shadow-3xs"
              >
                <span className="sr-only">LinkedIn</span>
                <LinkedinIcon className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-wisteria hover:scale-110 transition-all p-1.5 rounded-lg bg-paper border border-mist hover:border-wisteria/30 shadow-3xs"
              >
                <span className="sr-only">Instagram</span>
                <InstagramIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:pl-8">
            <h3 className="font-display text-xs font-bold uppercase tracking-widest text-ink/45">
              Society
            </h3>
            <ul className="mt-5 space-y-3.5 text-xs font-semibold text-ink/65">
              <li>
                <Link href="/about" className="hover:text-wisteria transition-colors hover:underline">About Us</Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-wisteria transition-colors hover:underline">Events & Workshops</Link>
              </li>
              <li>
                <Link href="/team" className="hover:text-wisteria transition-colors hover:underline">Our Team</Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-wisteria transition-colors hover:underline">Gallery</Link>
              </li>
            </ul>
          </div>

          {/* Connect / Actions */}
          <div>
            <h3 className="font-display text-xs font-bold uppercase tracking-widest text-ink/45">
              Get Involved
            </h3>
            <ul className="mt-5 space-y-3.5 text-xs font-semibold text-ink/65">
              <li>
                <Link href="/join" className="hover:text-wisteria transition-colors hover:underline flex items-center gap-1 group">
                  Apply for Membership 
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-wisteria transition-colors hover:underline">Contact Support</Link>
              </li>
              <li>
                <Link href="/portal" className="hover:text-wisteria transition-colors hover:underline">Member Portal</Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-wisteria transition-colors hover:underline">
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div className="space-y-4">
            <h3 className="font-display text-xs font-bold uppercase tracking-widest text-ink/45">
              Stay Connected
            </h3>
            <p className="text-xs leading-relaxed text-ink/60 font-semibold">
              Subscribe to our newsletter for event announcements and engineering updates.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <Mail className="absolute left-3 top-3 h-3.5 w-3.5 text-ink/35" />
                <input
                  type="email"
                  required
                  placeholder="you@university.edu"
                  className="w-full pl-9 pr-3 py-2.5 text-4xs font-semibold bg-paper border border-mist rounded-xl focus:outline-none focus:border-wisteria placeholder:text-ink/30"
                />
              </div>
              <button
                type="button"
                className="rounded-xl bg-wisteria px-3.5 py-2.5 text-paper hover:bg-wisteria/90 transition-all cursor-pointer shadow-3xs active:scale-95"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

          </div>
        </div>

        <div className="mt-16 border-t border-mist/60 pt-8 flex flex-col sm:flex-row justify-between gap-4 text-xs font-semibold text-ink/45">
          <p>&copy; {new Date().getFullYear()} CODATOR. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-wisteria transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-wisteria transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

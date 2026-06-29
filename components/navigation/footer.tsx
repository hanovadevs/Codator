import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { GithubIcon, LinkedinIcon, InstagramIcon } from "@/components/ui/brand-icons";

export default function Footer() {
  return (
    <footer className="border-t border-mist bg-paper py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative h-8 w-8 overflow-hidden">
                <Image
                  src="/without%20text_logo.png"
                  alt="CODATOR Logo"
                  fill
                  sizes="32px"
                  className="object-contain"
                />
              </div>
              <span className="font-display text-lg font-bold tracking-tight text-ink">
                CODATOR
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/60">
              The computer science and computer engineering society. We build systems, run hackathons, host tech talks, and foster a community of passionate developers.
            </p>
            <div className="mt-6 flex gap-4 text-ink/50">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-wisteria transition-colors">
                <span className="sr-only">GitHub</span>
                <GithubIcon className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-wisteria transition-colors">
                <span className="sr-only">LinkedIn</span>
                <LinkedinIcon className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-wisteria transition-colors">
                <span className="sr-only">Instagram</span>
                <InstagramIcon className="h-5 w-5" />
              </a>
            </div>
          </div>


          {/* Quick Links */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-ink/80">
              Society
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-ink/60">
              <li>
                <Link href="/about" className="hover:text-wisteria transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-wisteria transition-colors">Events & Workshops</Link>
              </li>
              <li>
                <Link href="/team" className="hover:text-wisteria transition-colors">Our Team</Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-wisteria transition-colors">Gallery</Link>
              </li>
            </ul>
          </div>

          {/* Connect / Actions */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-ink/80">
              Get Involved
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-ink/60">
              <li>
                <Link href="/join" className="hover:text-wisteria transition-colors flex items-center gap-1 group">
                  Apply for Membership 
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-wisteria transition-colors">Contact Support</Link>
              </li>
              <li>
                <Link href="/portal" className="hover:text-wisteria transition-colors">Member Portal</Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-wisteria transition-colors font-medium text-ink/40 hover:text-wisteria">
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-mist pt-8 flex flex-col sm:flex-row justify-between gap-4 text-xs text-ink/40">
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

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { GithubIcon, LinkedinIcon, InstagramIcon } from "@/components/ui/brand-icons";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Mock API submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1200);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="py-20 sm:py-28 bg-paper">
      <title>Contact Us | CODATOR</title>
      <meta name="description" content="Get in touch with the CODATOR society. Send us your queries, feedback, or collaboration proposals." />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="max-w-3xl mb-16">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Contact Us
          </h1>
          <p className="mt-6 text-xl leading-relaxed text-ink/75">
            Have questions, feedback, or want to collaborate? Send us a message and we&apos;ll get back to you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Form Area */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-mist bg-paper/30 p-8 shadow-sm">
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-10"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600 border border-green-200">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-ink">Message Sent!</h3>
                  <p className="mt-2 text-sm text-ink/60">
                    Thank you for reaching out. We will get back to you soon.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="mt-6 inline-flex items-center justify-center rounded-lg border border-mist px-4 py-2 text-sm font-semibold text-ink hover:bg-wisteria-tint/50 hover:text-wisteria transition-colors"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-ink/85 mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="block w-full rounded-lg border border-mist bg-paper px-4 py-2.5 text-sm text-ink focus:border-wisteria focus:outline-none focus:ring-1 focus:ring-wisteria transition-colors"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-ink/85 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="block w-full rounded-lg border border-mist bg-paper px-4 py-2.5 text-sm text-ink focus:border-wisteria focus:outline-none focus:ring-1 focus:ring-wisteria transition-colors"
                        placeholder="john@university.edu"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-ink/85 mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      id="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-mist bg-paper px-4 py-2.5 text-sm text-ink focus:border-wisteria focus:outline-none focus:ring-1 focus:ring-wisteria transition-colors"
                      placeholder="Collaboration opportunity"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-ink/85 mb-1.5">
                      Message
                    </label>
                    <textarea
                      name="message"
                      id="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-mist bg-paper px-4 py-2.5 text-sm text-ink focus:border-wisteria focus:outline-none focus:ring-1 focus:ring-wisteria transition-colors resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center rounded-lg bg-wisteria w-full sm:w-auto px-6 py-3 text-sm font-semibold text-paper shadow-sm hover:bg-wisteria/90 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Socials & Info Area */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-5 border border-mist rounded-xl bg-paper/30">
                <div className="rounded-lg bg-wisteria-tint p-2 text-wisteria border border-wisteria/10">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-ink">Email Us</h3>
                  <p className="text-sm text-ink/65 mt-1">For general inquiries, sponsorship, or speaker proposals.</p>
                  <a href="mailto:contact@codator.org" className="text-sm font-semibold text-wisteria hover:underline mt-2 inline-block font-mono">
                    contact@codator.org
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 border border-mist rounded-xl bg-paper/30">
                <div className="rounded-lg bg-skyline-tint p-2 text-skyline border border-skyline/10">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-ink">Community Discord</h3>
                  <p className="text-sm text-ink/65 mt-1">Join our chat server to hang out, ask questions, and share projects.</p>
                  <a href="https://discord.gg" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-skyline hover:underline mt-2 inline-block">
                    discord.gg/codator
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Social Grid */}
            <div className="border border-mist rounded-2xl p-6 bg-paper/30">
              <h3 className="font-display text-sm font-bold text-ink/80 uppercase tracking-wider mb-4">
                Official Channels
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border border-mist hover:border-wisteria/35 hover:bg-wisteria-tint/20 transition-all"
                >
                  <GithubIcon className="h-5 w-5 text-ink/60" />
                  <span className="text-xs font-semibold text-ink/70">GitHub</span>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border border-mist hover:border-wisteria/35 hover:bg-wisteria-tint/20 transition-all"
                >
                  <LinkedinIcon className="h-5 w-5 text-ink/60" />
                  <span className="text-xs font-semibold text-ink/70">LinkedIn</span>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border border-mist hover:border-wisteria/35 hover:bg-wisteria-tint/20 transition-all"
                >
                  <InstagramIcon className="h-5 w-5 text-ink/60" />
                  <span className="text-xs font-semibold text-ink/70">Instagram</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MessageSquare, Send, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { GithubIcon, LinkedinIcon, InstagramIcon, FacebookIcon } from "@/components/ui/brand-icons";

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
    <div className="min-h-screen bg-[#F8F8FC] pt-28 pb-20 text-ink">
      <title>Contact Us | CODATOR</title>
      <meta name="description" content="Get in touch with the CODATOR society. Send us your queries, feedback, or collaboration proposals." />
      
      {/* Soft background glow */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute -top-[10%] left-[25%] w-[40vw] h-[40vw] rounded-full bg-wisteria/5 blur-[100px]" />
        <div className="absolute bottom-[20%] right-[15%] w-[35vw] h-[35vw] rounded-full bg-skyline/5 blur-[90px]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Header */}
        <div className="max-w-3xl">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/45 backdrop-blur-md px-3 py-0.5 text-5xs font-bold uppercase tracking-widest text-wisteria mb-4 shadow-[0_4px_12px_rgba(0,0,0,0.01)]"
          >
            <Sparkles className="h-3.5 w-3.5 text-wisteria" />
            Get In Touch
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display text-3xl font-black tracking-tight text-ink sm:text-4xl text-[#1D1B26]"
          >
            Contact Us
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-xs sm:text-sm leading-relaxed text-ink/75 font-semibold"
          >
            Have questions, feedback, or want to collaborate? Send us a message and we&apos;ll get back to you.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Area */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-white/80 bg-white/40 backdrop-blur-md p-6 sm:p-8 shadow-xs">
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-10 space-y-4"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600 border border-green-200">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-display text-sm font-bold text-[#1D1B26]">Message Sent!</h3>
                    <p className="text-5xs text-ink/60 font-semibold">
                      Thank you for reaching out. We will get back to you soon.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="inline-flex items-center justify-center rounded-xl border border-mist px-4.5 py-2 text-5xs font-bold text-ink hover:bg-wisteria-tint/50 hover:text-wisteria transition-colors cursor-pointer"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="block text-5xs font-bold text-ink/75 uppercase tracking-wider">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="block w-full rounded-xl border border-mist bg-paper px-4 py-2.5 text-xs text-ink focus:border-wisteria focus:outline-none transition-colors font-semibold"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="email" className="block text-5xs font-bold text-ink/75 uppercase tracking-wider">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="block w-full rounded-xl border border-mist bg-paper px-4 py-2.5 text-xs text-ink focus:border-wisteria focus:outline-none transition-colors font-semibold"
                        placeholder="john@university.edu"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="subject" className="block text-5xs font-bold text-ink/75 uppercase tracking-wider">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      id="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="block w-full rounded-xl border border-mist bg-paper px-4 py-2.5 text-xs text-ink focus:border-wisteria focus:outline-none transition-colors font-semibold"
                      placeholder="Collaboration opportunity"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="message" className="block text-5xs font-bold text-ink/75 uppercase tracking-wider">
                      Message
                    </label>
                    <textarea
                      name="message"
                      id="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      className="block w-full rounded-xl border border-mist bg-paper px-4 py-2.5 text-xs text-ink focus:border-wisteria focus:outline-none transition-colors resize-none font-semibold"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center rounded-xl bg-wisteria w-full sm:w-auto px-6 py-3 text-5xs font-bold text-paper shadow-md shadow-wisteria/10 hover:bg-wisteria/90 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send className="ml-2 h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Socials & Info Area */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-5 border border-white/80 bg-white/40 backdrop-blur-md rounded-2xl shadow-xs">
                <div className="rounded-xl bg-wisteria-tint/50 p-2.5 text-wisteria border border-wisteria/10">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display text-xs font-bold text-[#1D1B26]">Email Us</h3>
                  <p className="text-5xs text-ink/65 font-semibold">For general inquiries, sponsorship, or speaker proposals.</p>
                  <a href="mailto:uetcodator@gmail.com" className="text-5xs font-bold text-wisteria hover:underline mt-2 inline-block font-mono tracking-wide">
                    uetcodator@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 border border-white/80 bg-white/40 backdrop-blur-md rounded-2xl shadow-xs">
                <div className="rounded-xl bg-skyline-tint/50 p-2.5 text-skyline border border-skyline/10">
                  <MessageSquare className="h-4.5 w-4.5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display text-xs font-bold text-[#1D1B26]">Community Discord</h3>
                  <p className="text-5xs text-ink/65 font-semibold">Join our chat server to hang out, ask questions, and share projects.</p>
                  <a href="https://discord.gg" target="_blank" rel="noopener noreferrer" className="text-5xs font-bold text-skyline hover:underline mt-2 inline-block">
                    discord.gg/codator
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Social Grid */}
            <div className="border border-white/80 bg-white/40 backdrop-blur-md rounded-3xl p-5 shadow-xs space-y-4">
              <h3 className="font-display text-5xs font-bold text-ink/50 uppercase tracking-widest">
                Official Channels
              </h3>
              <div className="grid grid-cols-4 gap-4 text-center">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-mist/60 hover:border-wisteria/35 hover:bg-wisteria-tint/10 transition-all cursor-pointer"
                >
                  <GithubIcon className="h-5 w-5 text-ink/60" />
                  <span className="text-6xs font-bold text-ink/70 uppercase tracking-wider">GitHub</span>
                </a>
                <a
                  href="https://www.linkedin.com/company/codator1/posts/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-mist/60 hover:border-wisteria/35 hover:bg-wisteria-tint/10 transition-all cursor-pointer"
                >
                  <LinkedinIcon className="h-5 w-5 text-ink/60" />
                  <span className="text-6xs font-bold text-ink/70 uppercase tracking-wider">LinkedIn</span>
                </a>
                <a
                  href="https://www.instagram.com/codator.cse/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-mist/60 hover:border-wisteria/35 hover:bg-wisteria-tint/10 transition-all cursor-pointer"
                >
                  <InstagramIcon className="h-5 w-5 text-ink/60" />
                  <span className="text-6xs font-bold text-ink/70 uppercase tracking-wider">Instagram</span>
                </a>
                <a
                  href="https://www.facebook.com/share/18j85P8K6r/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-mist/60 hover:border-wisteria/35 hover:bg-wisteria-tint/10 transition-all cursor-pointer"
                >
                  <FacebookIcon className="h-5 w-5 text-ink/60" />
                  <span className="text-6xs font-bold text-ink/70 uppercase tracking-wider">Facebook</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

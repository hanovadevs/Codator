"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, User, Hash, GraduationCap, Mail, Phone, Code, Check } from "lucide-react";

const PHYLA_OPTIONS = [
  "Tech and Devolpment",
  "Media Phylum",
  "Research Phylum",
  "Event management",
];

const availableSkills = [
  "Web Development",
  "Machine Learning & AI",
  "Systems Programming",
  "Cybersecurity",
  "Competitive Programming",
  "UI/UX Design",
  "Mobile App Development",
  "Cloud & DevOps",
];

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-paper flex items-center justify-center text-xs font-bold text-ink/50">
        Loading Application Form...
      </div>
    }>
      <JoinFormContent />
    </Suspense>
  );
}

function JoinFormContent() {
  const searchParams = useSearchParams();
  const initialPhylum = searchParams.get("phylum") || "";

  const [formData, setFormData] = useState(() => {
    let initialDept = "";
    if (initialPhylum) {
      const decoded = decodeURIComponent(initialPhylum);
      if (PHYLA_OPTIONS.includes(decoded)) {
        initialDept = decoded;
      }
    }
    return {
      fullName: "",
      rollNumber: "",
      department: initialDept,
      batchYear: "",
      email: "",
      phone: "",
      whyJoin: "",
    };
  });

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [emailError, setEmailError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "email") {
      setEmailError("");
    }
  };

  const handleSkillToggle = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address.";
    }

    if (!email.toLowerCase().endsWith(".edu") && !email.toLowerCase().includes(".edu.")) {
      return "Please use your official university email (ending in .edu).";
    }

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    
    const error = validateEmail(formData.email);
    if (error) {
      setEmailError(error);
      const emailInput = document.getElementById("email");
      emailInput?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          rollNumber: formData.rollNumber,
          department: formData.department, // This is the Phylum in the database
          batchYear: formData.batchYear,
          email: formData.email,
          phone: formData.phone,
          whyJoin: formData.whyJoin,
          skills: selectedSkills,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit application.");
      }

      setIsSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-20 sm:py-28 bg-paper">
      <title>Join CODATOR | Apply for Membership</title>
      <meta name="description" content="Apply for CODATOR membership. Get your unique student ID, digital member card, and virtual event pass." />
      
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Join CODATOR
          </h1>
          <p className="mt-4 text-sm sm:text-base text-ink/75 max-w-xl mx-auto font-semibold">
            Apply for membership today. Once approved by our committee, you will receive your unique CODATOR ID and virtual pass.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-mist bg-paper/30 p-8 shadow-sm">
          {submitError && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-800 border border-red-200">
              {submitError}
            </div>
          )}

          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600 border border-green-200 mb-6">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <h2 className="font-display text-2xl font-bold text-ink">Application Submitted!</h2>
              <p className="mt-4 text-xs sm:text-sm text-ink/75 max-w-md mx-auto font-semibold leading-relaxed">
                Thank you for applying to CODATOR. Please wait <span className="text-wisteria font-bold">at least 24 hours</span> for our team to review your details. You will receive a confirmation email with your membership credentials shortly.
              </p>
              <div className="mt-8 border-t border-mist/60 pt-6 text-xs text-ink/50">
                Application Status: <span className="font-mono font-bold text-wisteria bg-wisteria-tint px-2 py-0.5 rounded">PENDING REVIEW</span>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Section 1: Personal Info */}
              <div>
                <h3 className="font-display text-lg font-bold text-ink border-b border-mist pb-2 mb-6">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className="flex items-center gap-1.5 text-sm font-medium text-ink/85 mb-1.5">
                      <User className="h-4 w-4 text-ink/40" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      id="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border border-mist bg-paper px-4 py-2.5 text-sm text-ink focus:border-wisteria focus:outline-none focus:ring-1 focus:ring-wisteria transition-colors font-semibold"
                      placeholder="Alice Smith"
                    />
                  </div>

                  {/* University Roll Number */}
                  <div>
                    <label htmlFor="rollNumber" className="flex items-center gap-1.5 text-sm font-medium text-ink/85 mb-1.5">
                      <Hash className="h-4 w-4 text-ink/40" />
                      Roll Number / Student ID
                    </label>
                    <input
                      type="text"
                      name="rollNumber"
                      id="rollNumber"
                      required
                      value={formData.rollNumber}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border border-mist bg-paper px-4 py-2.5 text-sm text-ink focus:border-wisteria focus:outline-none focus:ring-1 focus:ring-wisteria transition-colors font-semibold"
                      placeholder="2024-CS-104"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Academic Info */}
              <div>
                <h3 className="font-display text-lg font-bold text-ink border-b border-mist pb-2 mb-6">
                  Academic & Phylum Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Phylum (Department) */}
                  <div>
                    <label htmlFor="department" className="flex items-center gap-1.5 text-sm font-medium text-ink/85 mb-1.5">
                      <GraduationCap className="h-4 w-4 text-ink/40" />
                      Target Phylum (Department)
                    </label>
                    <select
                      name="department"
                      id="department"
                      required
                      value={formData.department}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border border-mist bg-paper px-4 py-2.5 text-sm text-ink focus:border-wisteria focus:outline-none focus:ring-1 focus:ring-wisteria transition-colors font-semibold"
                    >
                      <option value="">Select Phylum</option>
                      {PHYLA_OPTIONS.map((phylum) => (
                        <option key={phylum} value={phylum}>
                          {phylum}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Batch Year */}
                  <div>
                    <label htmlFor="batchYear" className="flex items-center gap-1.5 text-sm font-medium text-ink/85 mb-1.5">
                      <GraduationCap className="h-4 w-4 text-ink/40" />
                      Batch Year / Semester
                    </label>
                    <input
                      type="text"
                      name="batchYear"
                      id="batchYear"
                      required
                      value={formData.batchYear}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border border-mist bg-paper px-4 py-2.5 text-sm text-ink focus:border-wisteria focus:outline-none focus:ring-1 focus:ring-wisteria transition-colors font-semibold"
                      placeholder="e.g. 2028 or 4th Semester"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Contact & Verification */}
              <div>
                <h3 className="font-display text-lg font-bold text-ink border-b border-mist pb-2 mb-6">
                  Contact & Verification
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* University Email */}
                  <div>
                    <label htmlFor="email" className="flex items-center gap-1.5 text-sm font-medium text-ink/85 mb-1.5">
                      <Mail className="h-4 w-4 text-ink/40" />
                      University Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`block w-full rounded-lg border bg-paper px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-1 transition-colors font-semibold ${
                        emailError
                          ? "border-ember focus:border-ember focus:ring-ember"
                          : "border-mist focus:border-wisteria focus:ring-wisteria"
                      }`}
                      placeholder="alice@university.edu"
                    />
                    {emailError && (
                      <p className="mt-1.5 text-xs font-semibold text-ember">
                        {emailError}
                      </p>
                    )}
                  </div>

                  {/* Phone (Optional) */}
                  <div>
                    <label htmlFor="phone" className="flex items-center gap-1.5 text-sm font-medium text-ink/85 mb-1.5">
                      <Phone className="h-4 w-4 text-ink/40" />
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border border-mist bg-paper px-4 py-2.5 text-sm text-ink focus:border-wisteria focus:outline-none focus:ring-1 focus:ring-wisteria transition-colors font-semibold"
                      placeholder="+1 (555) 019-2834"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Experience & Interest */}
              <div>
                <h3 className="font-display text-lg font-bold text-ink border-b border-mist pb-2 mb-6">
                  Experience & Interests
                </h3>
                
                {/* Skills Multi-select */}
                <div className="mb-6">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-ink/85 mb-3">
                    <Code className="h-4 w-4 text-ink/40" />
                    Areas of Interest / Skills
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableSkills.map((skill) => {
                      const isSelected = selectedSkills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => handleSkillToggle(skill)}
                          className={`flex items-center gap-1 rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                            isSelected
                              ? "bg-wisteria text-paper border-wisteria"
                              : "border-mist bg-paper text-ink/75 hover:border-wisteria/35 hover:text-wisteria"
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Why Join */}
                <div>
                  <label htmlFor="whyJoin" className="block text-sm font-medium text-ink/85 mb-1.5">
                    Why do you want to join this Phylum in CODATOR?
                  </label>
                  <textarea
                    name="whyJoin"
                    id="whyJoin"
                    required
                    rows={4}
                    value={formData.whyJoin}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-mist bg-paper px-4 py-2.5 text-sm text-ink focus:border-wisteria focus:outline-none focus:ring-1 focus:ring-wisteria transition-colors resize-none font-semibold"
                    placeholder="Tell us about your technical goals, projects you want to build, or why you selected this specific Phylum."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center rounded-lg bg-wisteria px-6 py-3.5 text-base font-semibold text-paper shadow-sm hover:bg-wisteria/90 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Submitting Application...</span>
                  ) : (
                    <>
                      <span>Submit Membership Application</span>
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

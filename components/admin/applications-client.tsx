"use client";

import { useState } from "react";
import { motion as m, AnimatePresence as AP } from "framer-motion";
import { FileText, Calendar, User, Mail, GraduationCap, X, Check, Trash2, ArrowRight } from "lucide-react";

interface Member {
  id: string;
  full_name: string;
  university_roll: string;
  department: string;
  batch_year: string;
  email: string;
  phone: string | null;
  why_join: string;
  skills: string[];
  applied_at: string;
}

interface ApplicationsClientProps {
  initialApplications: Member[];
}

export default function ApplicationsClient({ initialApplications }: ApplicationsClientProps) {
  const [applications, setApplications] = useState<Member[]>(initialApplications);
  const [selectedApp, setSelectedApp] = useState<Member | null>(null);
  const [isActioning, setIsActioning] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setIsActioning(true);
    setErrorMsg("");

    try {
      const response = await fetch(`/api/members/${id}/${action}`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} member.`);
      }

      // Remove from list
      setApplications(applications.filter((app) => app.id !== id));
      setSelectedApp(null);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setIsActioning(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="relative">
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
          Membership Applications
        </h1>
        <p className="text-sm text-ink/65">
          You have <span className="font-semibold text-wisteria">{applications.length}</span> pending applications to review.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-800 border border-red-200">
          {errorMsg}
        </div>
      )}

      {/* Main Table */}
      {applications.length === 0 ? (
        <div className="border border-dashed border-mist rounded-2xl p-16 text-center text-ink/50 bg-paper/30">
          <FileText className="mx-auto h-12 w-12 text-ink/30 mb-4" />
          <h3 className="font-display text-lg font-bold text-ink">All caught up!</h3>
          <p className="text-sm text-ink/50 mt-1">There are no pending membership applications to review.</p>
        </div>
      ) : (
        <div className="overflow-hidden border border-mist rounded-2xl bg-paper/30 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-mist text-left text-sm">
              <thead className="bg-paper/80 font-semibold text-ink/80">
                <tr>
                  <th className="px-6 py-4">Applicant</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Roll Number</th>
                  <th className="px-6 py-4">Applied Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mist bg-transparent">
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className="hover:bg-wisteria-tint/15 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-ink group-hover:text-wisteria transition-colors">
                        {app.full_name}
                      </div>
                      <div className="text-xs text-ink/50 font-mono mt-0.5">{app.email}</div>
                    </td>
                    <td className="px-6 py-4 text-ink/70">
                      <div>{app.department}</div>
                      <div className="text-xs text-ink/50 mt-0.5">{app.batch_year}</div>
                    </td>
                    <td className="px-6 py-4 text-ink/70 font-mono text-xs">{app.university_roll}</td>
                    <td className="px-6 py-4 text-ink/60 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-ink/30" />
                        <span>{formatDate(app.applied_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-wisteria hover:underline"
                      >
                        Review
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-over Panel for Application Details */}
      <AP>
        {selectedApp && (
          <>
            {/* Backdrop */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedApp(null)}
              className="fixed inset-0 z-40 bg-ink"
            />

            {/* Panel */}
            <m.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-paper border-l border-mist p-6 sm:p-8 shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between border-b border-mist pb-4 mb-6">
                  <h2 className="font-display text-xl font-bold text-ink flex items-center gap-2">
                    <User className="h-5 w-5 text-wisteria" />
                    Review Application
                  </h2>
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="rounded-lg p-1.5 text-ink/50 hover:bg-wisteria-tint hover:text-wisteria transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Content Details */}
                <div className="space-y-6 overflow-y-auto max-h-[65vh] pr-1">
                  {/* Basic Info */}
                  <div>
                    <h3 className="text-lg font-bold text-ink">{selectedApp.full_name}</h3>
                    <div className="mt-2 space-y-2 text-sm text-ink/75">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-ink/40" />
                        <span className="font-mono text-xs">{selectedApp.email}</span>
                      </div>
                      {selectedApp.phone && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-ink/40">Phone:</span>
                          <span>{selectedApp.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-ink/40" />
                        <span>
                          {selectedApp.department} ({selectedApp.batch_year})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-ink/40">Roll Number:</span>
                        <span className="font-mono text-xs">{selectedApp.university_roll}</span>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-ink/50 mb-2">
                      Skills & Interests
                    </h4>
                    {selectedApp.skills && selectedApp.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedApp.skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded bg-wisteria-tint px-2 py-1 text-xs font-semibold text-wisteria border border-wisteria/10"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-ink/40 italic">None specified</span>
                    )}
                  </div>

                  {/* Essay */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-ink/50 mb-2">
                      Why do you want to join?
                    </h4>
                    <p className="rounded-xl border border-mist bg-paper/30 p-4 text-sm text-ink/85 leading-relaxed whitespace-pre-line">
                      {selectedApp.why_join}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-mist pt-6 grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleAction(selectedApp.id, "reject")}
                  disabled={isActioning}
                  className="flex items-center justify-center gap-2 rounded-lg border border-mist hover:border-red-200 hover:bg-red-50 hover:text-red-700 py-3 text-sm font-semibold text-ink/70 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Reject</span>
                </button>
                <button
                  onClick={() => handleAction(selectedApp.id, "approve")}
                  disabled={isActioning}
                  className="flex items-center justify-center gap-2 rounded-lg bg-wisteria py-3 text-sm font-semibold text-paper hover:bg-wisteria/90 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span>Approve</span>
                </button>
              </div>
            </m.div>
          </>
        )}
      </AP>
    </div>
  );
}

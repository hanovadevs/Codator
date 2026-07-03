"use client";

import { useState } from "react";
import { motion as m, AnimatePresence as AP } from "framer-motion";
import { FileText, Calendar, User, Mail, GraduationCap, X, Check, Trash2, ArrowRight, Loader2, AlertTriangle } from "lucide-react";

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
  totalCount?: number;
}

export default function ApplicationsClient({ initialApplications, totalCount }: ApplicationsClientProps) {
  const [applications, setApplications] = useState<Member[]>(initialApplications);
  const [selectedApp, setSelectedApp] = useState<Member | null>(null);
  const [isActioning, setIsActioning] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [bulkPattern, setBulkPattern] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);

  const displayCount = totalCount && totalCount > applications.length ? totalCount : applications.length;

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    setIsDeletingSelected(true);
    setErrorMsg("");
    try {
      const response = await fetch("/api/admin/members/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberIds: selectedIds }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete.");
      setApplications((prev) => prev.filter((app) => !selectedIds.includes(app.id)));
      setSelectedIds([]);
      setSelectedApp(null);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setIsDeletingSelected(false);
    }
  };

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    setErrorMsg("");
    try {
      const payload: { action: string; pattern?: string } = bulkPattern
        ? { action: "delete_by_pattern", pattern: bulkPattern }
        : { action: "delete_all" };

      const response = await fetch("/api/admin/applications/bulk-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete applications.");

      // Remove matching applications from local state
      if (bulkPattern) {
        setApplications((prev) =>
          prev.filter((app) => !app.email.toLowerCase().includes(bulkPattern.toLowerCase()))
        );
      } else {
        setApplications([]);
      }
      setShowBulkConfirm(false);
      setBulkPattern("");
      setSelectedApp(null);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
            Membership Applications
          </h1>
          <p className="text-sm text-ink/65">
            You have <span className="font-semibold text-wisteria">{displayCount}</span> pending applications to review.
            {totalCount && totalCount > applications.length && (
              <span className="text-5xs text-ink/40 ml-1">(showing {applications.length})</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {selectedIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              disabled={isDeletingSelected}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-xs font-bold text-red-700 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-xs cursor-pointer active:scale-[0.98] disabled:opacity-50"
            >
              {isDeletingSelected ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          )}
          {applications.length > 0 && (
            <button
              onClick={() => setShowBulkConfirm(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-xs font-bold text-red-700 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
            >
              <Trash2 className="h-4 w-4" />
              <span>Reject All Spam ({displayCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Bulk Delete Confirmation Modal */}
      <AP>
        {showBulkConfirm && (
          <>
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBulkConfirm(false)}
              className="fixed inset-0 z-40 bg-ink"
            />
            <m.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl border border-mist shadow-lg max-w-md w-full p-8 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-200">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-black text-[#1D1B26]">Delete Spam Applications</h3>
                    <p className="text-5xs text-ink/50 font-semibold">This action cannot be undone.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-ink/70 font-medium leading-relaxed">
                    This will permanently delete <span className="font-bold text-red-600">{applications.length}</span> pending applications. Optionally, filter by email domain to target specific spam:
                  </p>
                  <input
                    type="text"
                    value={bulkPattern}
                    onChange={(e) => setBulkPattern(e.target.value)}
                    placeholder="e.g. testuniversity.edu (leave empty to delete all)"
                    className="w-full px-3 py-2 text-xs font-semibold bg-paper border border-mist rounded-xl focus:outline-none focus:border-red-400 placeholder:text-ink/35"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => { setShowBulkConfirm(false); setBulkPattern(""); }}
                    className="flex-1 rounded-xl border border-mist py-2.5 text-xs font-bold text-ink hover:bg-mist/30 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    disabled={isBulkDeleting}
                    className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white hover:bg-red-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isBulkDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        <span>Delete {bulkPattern ? "Matching" : "All"} Applications</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </m.div>
          </>
        )}
      </AP>

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
                  <th className="px-4 py-4 w-10">
                    <input
                      type="checkbox"
                      checked={applications.length > 0 && selectedIds.length === applications.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(applications.map((a) => a.id));
                        } else {
                          setSelectedIds([]);
                        }
                      }}
                      className="rounded border-mist text-wisteria focus:ring-wisteria cursor-pointer h-3.5 w-3.5"
                    />
                  </th>
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
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(app.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds((prev) => [...prev, app.id]);
                          } else {
                            setSelectedIds((prev) => prev.filter((id) => id !== app.id));
                          }
                        }}
                        className="rounded border-mist text-wisteria focus:ring-wisteria cursor-pointer h-3.5 w-3.5"
                      />
                    </td>
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

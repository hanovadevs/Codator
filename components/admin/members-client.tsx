"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  User,
  Shield,
  ShieldAlert,
  Ban,
  CheckCircle,
  X,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  Award,
  Loader2,
  ChevronRight,
} from "lucide-react";

interface Member {
  id: string;
  full_name: string;
  university_roll: string;
  department: string;
  batch_year: string;
  email: string;
  phone: string | null;
  why_join: string | null;
  skills: string[] | null;
  status: "pending" | "active" | "rejected" | "suspended";
  codator_id: string | null;
  role: "member" | "admin";
  applied_at: string;
  approved_at: string | null;
}

interface MembersClientProps {
  initialMembers: Member[];
}

export default function MembersClient({ initialMembers }: MembersClientProps) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const supabase = createClient();

  // Get unique departments for the dropdown filter
  const departments = Array.from(
    new Set(initialMembers.map((m) => m.department))
  ).filter(Boolean);

  // Filter members in memory
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.codator_id && m.codator_id.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    const matchesDept = deptFilter === "all" || m.department === deptFilter;
    const matchesRole = roleFilter === "all" || m.role === roleFilter;

    return matchesSearch && matchesStatus && matchesDept && matchesRole;
  });

  // Handle promoting or demoting a member's role
  const handleRoleChange = async (memberId: string, currentRole: "member" | "admin") => {
    const newRole = currentRole === "admin" ? "member" : "admin";
    
    // Safety check: Don't allow admins to demote themselves to prevent lockouts
    const { data: { user } } = await supabase.auth.getUser();
    const currentTargetMember = members.find((m) => m.id === memberId);
    if (currentTargetMember && currentTargetMember.email === user?.email && currentRole === "admin") {
      alert("Security restriction: You cannot revoke your own administrator privileges.");
      return;
    }

    setActionLoading((prev) => ({ ...prev, [memberId]: true }));

    try {
      const { error } = await supabase
        .from("members")
        .update({ role: newRole })
        .eq("id", memberId);

      if (error) throw error;

      // Update local state
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );
      
      // Update selected member view if open
      if (selectedMember && selectedMember.id === memberId) {
        setSelectedMember((prev) => prev ? { ...prev, role: newRole } : null);
      }
    } catch (err: any) {
      console.error("Error updating role:", err);
      alert(err.message || "Failed to update member role.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [memberId]: false }));
    }
  };

  // Handle suspending a member (calling reject API)
  const handleSuspendMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to suspend this member? They will lose access to the portal immediately.")) {
      return;
    }

    setActionLoading((prev) => ({ ...prev, [memberId]: true }));

    try {
      const response = await fetch(`/api/members/${memberId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to suspend member.");
      }

      // Update local state to rejected
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, status: "rejected" } : m))
      );

      if (selectedMember && selectedMember.id === memberId) {
        setSelectedMember((prev) => prev ? { ...prev, status: "rejected" } : null);
      }
    } catch (err: any) {
      console.error("Error suspending member:", err);
      alert(err.message || "Failed to suspend member.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [memberId]: false }));
    }
  };

  // Handle reactivating a suspended/rejected member (calling approve API)
  const handleReactivateMember = async (memberId: string) => {
    setActionLoading((prev) => ({ ...prev, [memberId]: true }));

    try {
      const response = await fetch(`/api/members/${memberId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to reactivate member.");
      }

      const data = await response.json();

      // Update local state to active and update their CODATOR ID
      setMembers((prev) =>
        prev.map((m) =>
          m.id === memberId
            ? { ...m, status: "active", codator_id: data.codatorId || m.codator_id }
            : m
        )
      );

      if (selectedMember && selectedMember.id === memberId) {
        setSelectedMember((prev) =>
          prev
            ? { ...prev, status: "active", codator_id: data.codatorId || prev.codator_id }
            : null
        );
      }
    } catch (err: any) {
      console.error("Error reactivating member:", err);
      alert(err.message || "Failed to reactivate member.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [memberId]: false }));
    }
  };

  return (
    <div className="space-y-6 text-ink">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-black tracking-tight text-ink">Members Management</h1>
        <p className="text-xs text-ink/65 mt-1.5">Search, filter, and manage roles or status for all society members.</p>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white/40 border border-mist/80 rounded-2xl p-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink/45" />
          <input
            type="text"
            placeholder="Search name, email, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs font-semibold bg-paper border border-mist rounded-xl focus:outline-none focus:border-wisteria placeholder:text-ink/40"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold bg-paper border border-mist rounded-xl focus:outline-none focus:border-wisteria"
          >
            <option value="all">Status: All</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected/Suspended</option>
          </select>
        </div>

        {/* Department Filter */}
        <div className="relative">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold bg-paper border border-mist rounded-xl focus:outline-none focus:border-wisteria"
          >
            <option value="all">Department: All</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Role Filter */}
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold bg-paper border border-mist rounded-xl focus:outline-none focus:border-wisteria"
          >
            <option value="all">Role: All</option>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Members Directory Table */}
      <div className="border border-mist rounded-3xl bg-white/50 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-mist bg-paper/50 text-4xs font-bold uppercase tracking-widest text-ink/50">
                <th className="py-4 px-6">Member</th>
                <th className="py-4 px-4">CODATOR ID</th>
                <th className="py-4 px-4">Department</th>
                <th className="py-4 px-4">Role</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mist/50 text-xs font-medium">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-ink/50 font-medium">
                    No members found matching the filters.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-paper/30 transition-colors">
                    {/* Member Profile */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-wisteria-tint/45 text-wisteria border border-wisteria/10 flex items-center justify-center font-bold text-xs">
                          {member.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="block font-bold text-ink leading-tight">{member.full_name}</span>
                          <span className="block text-4xs text-ink/50 mt-0.5">{member.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* CODATOR ID */}
                    <td className="py-4 px-4 font-mono text-4xs font-bold text-wisteria tracking-wider">
                      {member.codator_id || "—"}
                    </td>

                    {/* Department & Batch */}
                    <td className="py-4 px-4">
                      <span className="block text-ink">{member.department}</span>
                      <span className="block text-4xs text-ink/50 mt-0.5">{member.batch_year}</span>
                    </td>

                    {/* Role Badge */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-5xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                          member.role === "admin"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {member.role}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-5xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          member.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : member.status === "pending"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {member.status === "active" ? "Active" : member.status === "pending" ? "Pending" : "Suspended"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => setSelectedMember(member)}
                          className="text-5xs font-bold uppercase tracking-wider text-ink/65 hover:text-wisteria hover:underline"
                        >
                          Details
                        </button>
                        
                        {/* Promote/Demote */}
                        {member.status === "active" && (
                          <button
                            disabled={actionLoading[member.id]}
                            onClick={() => handleRoleChange(member.id, member.role)}
                            className="text-5xs font-bold uppercase tracking-wider text-ink/65 hover:text-skyline disabled:opacity-50"
                          >
                            {actionLoading[member.id] ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" />
                            ) : member.role === "admin" ? (
                              "Demote"
                            ) : (
                              "Make Admin"
                            )}
                          </button>
                        )}

                        {/* Suspend / Reactivate */}
                        {member.status === "active" ? (
                          <button
                            disabled={actionLoading[member.id]}
                            onClick={() => handleSuspendMember(member.id)}
                            className="text-5xs font-bold uppercase tracking-wider text-red-600 hover:text-red-700 disabled:opacity-50"
                          >
                            {actionLoading[member.id] ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" />
                            ) : (
                              "Suspend"
                            )}
                          </button>
                        ) : (
                          member.status !== "pending" && (
                            <button
                              disabled={actionLoading[member.id]}
                              onClick={() => handleReactivateMember(member.id)}
                              className="text-5xs font-bold uppercase tracking-wider text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
                            >
                              {actionLoading[member.id] ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" />
                              ) : (
                                "Reactivate"
                              )}
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MEMBER DETAILS SLIDE-OVER ================= */}
      <AnimatePresence>
        {selectedMember && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
              className="fixed inset-0 z-50 bg-[#13121A]/40 backdrop-blur-xs"
            />

            {/* Slide-over panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-paper border-l border-mist p-6 shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="space-y-6 overflow-y-auto pr-2 flex-grow">
                <div className="flex items-center justify-between border-b border-mist pb-4">
                  <h3 className="font-display text-lg font-black text-ink">Member Profile</h3>
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="rounded-lg p-1.5 text-ink/50 hover:bg-mist/40 transition-colors cursor-pointer"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                {/* Profile Header Card */}
                <div className="bg-wisteria-tint/15 border border-wisteria/10 rounded-2xl p-5 flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-wisteria-tint/45 text-wisteria border border-wisteria/10 flex items-center justify-center font-black text-lg">
                    {selectedMember.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-display text-base font-black text-ink leading-tight">
                      {selectedMember.full_name}
                    </h4>
                    <span className="text-5xs font-mono font-bold text-wisteria tracking-wider uppercase block mt-1">
                      {selectedMember.codator_id || "ID NOT ASSIGNED"}
                    </span>
                  </div>
                </div>

                {/* Details Section */}
                <div className="space-y-4 text-xs font-semibold text-ink/75">
                  <h4 className="font-display text-2xs font-bold uppercase tracking-widest text-ink/40 border-b border-mist/50 pb-1">
                    Contact & Enrollment
                  </h4>
                  
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-wisteria shrink-0" />
                    <div>
                      <span className="block text-5xs text-ink/55">Email Address</span>
                      <span className="text-ink">{selectedMember.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-wisteria shrink-0" />
                    <div>
                      <span className="block text-5xs text-ink/55">Phone Number</span>
                      <span className="text-ink">{selectedMember.phone || "Not provided"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <BookOpen className="h-4 w-4 text-wisteria shrink-0" />
                    <div>
                      <span className="block text-5xs text-ink/55">Department & Batch</span>
                      <span className="text-ink">
                        {selectedMember.department} • {selectedMember.batch_year}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-wisteria shrink-0" />
                    <div>
                      <span className="block text-5xs text-ink/55">Applied Date</span>
                      <span className="text-ink">
                        {new Date(selectedMember.applied_at).toLocaleDateString(undefined, {
                          dateStyle: "medium",
                        })}
                      </span>
                    </div>
                  </div>

                  {selectedMember.approved_at && (
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="block text-5xs text-ink/55">Approved Date</span>
                        <span className="text-ink">
                          {new Date(selectedMember.approved_at).toLocaleDateString(undefined, {
                            dateStyle: "medium",
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Skills Section */}
                <div className="space-y-3">
                  <h4 className="font-display text-2xs font-bold uppercase tracking-widest text-ink/40 border-b border-mist/50 pb-1">
                    Technical Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {!selectedMember.skills || selectedMember.skills.length === 0 ? (
                      <span className="text-xs text-ink/50 font-medium italic">No skills listed</span>
                    ) : (
                      selectedMember.skills.map((skill) => (
                        <span
                          key={skill}
                          className="bg-paper border border-mist/80 px-2.5 py-1 rounded-lg text-4xs font-bold text-ink/75"
                        >
                          {skill}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Why Join Section */}
                <div className="space-y-2">
                  <h4 className="font-display text-2xs font-bold uppercase tracking-widest text-ink/40 border-b border-mist/50 pb-1">
                    Application Essay
                  </h4>
                  <p className="text-xs font-semibold text-ink/65 leading-relaxed bg-paper/50 border border-mist/80 p-3.5 rounded-xl max-h-40 overflow-y-auto">
                    {selectedMember.why_join || "No essay provided."}
                  </p>
                </div>
              </div>

              {/* Slide-over Footer Actions */}
              <div className="border-t border-mist pt-4 mt-6 flex gap-3">
                {selectedMember.status === "active" ? (
                  <button
                    disabled={actionLoading[selectedMember.id]}
                    onClick={() => handleSuspendMember(selectedMember.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 py-2.5 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    <Ban className="h-4 w-4" />
                    <span>Suspend Member</span>
                  </button>
                ) : (
                  selectedMember.status !== "pending" && (
                    <button
                      disabled={actionLoading[selectedMember.id]}
                      onClick={() => handleReactivateMember(selectedMember.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Reactivate Member</span>
                    </button>
                  )
                )}

                {selectedMember.status === "active" && (
                  <button
                    disabled={actionLoading[selectedMember.id]}
                    onClick={() => handleRoleChange(selectedMember.id, selectedMember.role)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-mist bg-paper py-2.5 text-xs font-bold text-ink hover:bg-mist/30 transition-colors cursor-pointer"
                  >
                    {selectedMember.role === "admin" ? (
                      <>
                        <ShieldAlert className="h-4 w-4 text-wisteria" />
                        <span>Revoke Admin</span>
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 text-wisteria" />
                        <span>Make Admin</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

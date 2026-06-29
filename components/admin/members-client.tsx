"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
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
  Loader2,
  Plus,
  Edit2,
  Save,
  Award,
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
  position: string;
  applied_at: string;
  approved_at: string | null;
}

interface MembersClientProps {
  initialMembers: Member[];
}

const POSITION_OPTIONS = [
  "President",
  "Vice-President",
  "Tech Lead",
  "Event Organizer",
  "General Secretary",
  "Design Lead",
  "Public Relations",
  "Manager",
  "Director of Tech & Development",
  "Director of Graphics",
  "Director of Content",
  "Director of Operations",
  "Member",
];

export default function MembersClient({ initialMembers }: MembersClientProps) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  
  // Slide-over states
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  // Add Member Form State
  const [addForm, setAddForm] = useState({
    full_name: "",
    university_roll: "",
    department: "",
    batch_year: "",
    email: "",
    phone: "",
    skills: "",
    position: "Member",
    role: "member" as "member" | "admin",
  });

  // Edit Member State
  const [editForm, setEditForm] = useState({
    position: "Member",
    role: "member" as "member" | "admin",
    department: "",
    batch_year: "",
  });

  const supabase = createClient();

  // Unique departments for filter dropdown
  const departments = Array.from(
    new Set(members.map((m) => m.department))
  ).filter(Boolean);

  // Filter members list
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.codator_id && m.codator_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.position.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    const matchesDept = deptFilter === "all" || m.department === deptFilter;
    const matchesRole = roleFilter === "all" || m.role === roleFilter;

    return matchesSearch && matchesStatus && matchesDept && matchesRole;
  });

  // Open details slide-over and prep edit form
  const handleOpenDetails = (member: Member) => {
    setSelectedMember(member);
    setEditForm({
      position: member.position,
      role: member.role,
      department: member.department,
      batch_year: member.batch_year,
    });
    setIsEditMode(false);
  };

  // Submit manual member creation
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading((prev) => ({ ...prev, addMember: true }));

    try {
      const skillsArray = addForm.skills
        ? addForm.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      const response = await fetch("/api/members/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...addForm,
          skills: skillsArray,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create member.");

      // Fetch newly created member details to insert into local state
      const { data: newMember } = await supabase
        .from("members")
        .select("*")
        .eq("id", data.memberId)
        .single();

      if (newMember) {
        setMembers((prev) => [newMember, ...prev]);
      }

      // Reset form
      setAddForm({
        full_name: "",
        university_roll: "",
        department: "",
        batch_year: "",
        email: "",
        phone: "",
        skills: "",
        position: "Member",
        role: "member",
      });
      setIsAddOpen(false);
      alert(data.message);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error creating member.");
    } finally {
      setActionLoading((prev) => ({ ...prev, addMember: false }));
    }
  };

  // Save changes from Edit profile mode
  const handleSaveEdit = async () => {
    if (!selectedMember) return;
    setActionLoading((prev) => ({ ...prev, [selectedMember.id]: true }));

    try {
      // Safety check: Don't allow admins to demote themselves
      const { data: { user } } = await supabase.auth.getUser();
      if (selectedMember.email === user?.email && editForm.role === "member" && selectedMember.role === "admin") {
        alert("Security restriction: You cannot revoke your own administrator privileges.");
        return;
      }

      const { error } = await supabase
        .from("members")
        .update({
          position: editForm.position,
          role: editForm.role,
          department: editForm.department,
          batch_year: editForm.batch_year,
        })
        .eq("id", selectedMember.id);

      if (error) throw error;

      // Update local state
      setMembers((prev) =>
        prev.map((m) =>
          m.id === selectedMember.id
            ? {
                ...m,
                position: editForm.position,
                role: editForm.role,
                department: editForm.department,
                batch_year: editForm.batch_year,
              }
            : m
        )
      );

      setSelectedMember((prev) =>
        prev
          ? {
              ...prev,
              position: editForm.position,
              role: editForm.role,
              department: editForm.department,
              batch_year: editForm.batch_year,
            }
          : null
      );

      setIsEditMode(false);
    } catch (err: any) {
      console.error("Error saving edits:", err);
      alert(err.message || "Failed to update member profile.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [selectedMember.id]: false }));
    }
  };

  // Suspend Member
  const handleSuspendMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to suspend this member? They will lose access to the portal immediately.")) {
      return;
    }
    setActionLoading((prev) => ({ ...prev, [memberId]: true }));

    try {
      const response = await fetch(`/api/members/${memberId}/reject`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to suspend member.");

      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, status: "rejected" } : m))
      );
      if (selectedMember && selectedMember.id === memberId) {
        setSelectedMember((prev) => prev ? { ...prev, status: "rejected" } : null);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading((prev) => ({ ...prev, [memberId]: false }));
    }
  };

  // Reactivate Member
  const handleReactivateMember = async (memberId: string) => {
    setActionLoading((prev) => ({ ...prev, [memberId]: true }));

    try {
      const response = await fetch(`/api/members/${memberId}/approve`, {
        method: "POST",
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to reactivate member.");

      setMembers((prev) =>
        prev.map((m) =>
          m.id === memberId
            ? { ...m, status: "active", codator_id: data.codatorId || m.codator_id }
            : m
        )
      );
      if (selectedMember && selectedMember.id === memberId) {
        setSelectedMember((prev) =>
          prev ? { ...prev, status: "active", codator_id: data.codatorId || prev.codator_id } : null
        );
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading((prev) => ({ ...prev, [memberId]: false }));
    }
  };

  return (
    <div className="space-y-6 text-ink">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black tracking-tight text-ink">Members Management</h1>
          <p className="text-xs text-ink/65 mt-1.5">Search, filter, edit positions, and manually add members.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-wisteria px-4 py-2.5 text-xs font-bold text-paper hover:bg-wisteria/90 transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white/40 border border-mist/80 rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink/45" />
          <input
            type="text"
            placeholder="Search name, email, role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs font-semibold bg-paper border border-mist rounded-xl focus:outline-none focus:border-wisteria placeholder:text-ink/40"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-3 py-2 text-xs font-semibold bg-paper border border-mist rounded-xl focus:outline-none focus:border-wisteria"
        >
          <option value="all">Status: All</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="rejected">Suspended</option>
        </select>

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

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full px-3 py-2 text-xs font-semibold bg-paper border border-mist rounded-xl focus:outline-none focus:border-wisteria"
        >
          <option value="all">Dashboard Access: All</option>
          <option value="member">Member (No Panel Access)</option>
          <option value="admin">Admin (Full Panel Access)</option>
        </select>
      </div>

      {/* Members Directory Table */}
      <div className="border border-mist rounded-3xl bg-white/50 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-mist bg-paper/50 text-4xs font-bold uppercase tracking-widest text-ink/50">
                <th className="py-4 px-6">Member & Position</th>
                <th className="py-4 px-4">CODATOR ID</th>
                <th className="py-4 px-4">Contact</th>
                <th className="py-4 px-4">Department</th>
                <th className="py-4 px-4">Dashboard Access</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mist/50 text-xs font-medium">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-ink/50 font-medium">
                    No members found matching the filters.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-paper/30 transition-colors">
                    {/* Name & Position */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-wisteria-tint/45 text-wisteria border border-wisteria/10 flex items-center justify-center font-bold text-xs">
                          {member.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="block font-bold text-ink leading-tight">{member.full_name}</span>
                          <span className="inline-flex items-center gap-1 text-5xs font-bold text-wisteria bg-wisteria-tint/40 border border-wisteria/10 px-1.5 py-0.5 rounded mt-0.5">
                            <Award className="h-3 w-3" />
                            {member.position}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* CODATOR ID */}
                    <td className="py-4 px-4 font-mono text-4xs font-bold text-ink/75 tracking-wider">
                      {member.codator_id || "—"}
                    </td>

                    {/* Contact */}
                    <td className="py-4 px-4">
                      <span className="block text-ink">{member.email}</span>
                      <span className="block text-4xs text-ink/50 mt-0.5">{member.phone || "—"}</span>
                    </td>

                    {/* Department */}
                    <td className="py-4 px-4">
                      <span className="block text-ink">{member.department}</span>
                      <span className="block text-4xs text-ink/50 mt-0.5">{member.batch_year}</span>
                    </td>

                    {/* Dashboard Role */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-5xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                          member.role === "admin"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {member.role === "admin" ? "Admin (Has Panel)" : "Member"}
                      </span>
                    </td>

                    {/* Status */}
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
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleOpenDetails(member)}
                          className="text-5xs font-bold uppercase tracking-wider text-ink/65 hover:text-wisteria hover:underline cursor-pointer"
                        >
                          Details
                        </button>

                        {member.status === "active" ? (
                          <button
                            disabled={actionLoading[member.id]}
                            onClick={() => handleSuspendMember(member.id)}
                            className="text-5xs font-bold uppercase tracking-wider text-red-600 hover:text-red-700 disabled:opacity-50 cursor-pointer"
                          >
                            Suspend
                          </button>
                        ) : (
                          member.status !== "pending" && (
                            <button
                              disabled={actionLoading[member.id]}
                              onClick={() => handleReactivateMember(member.id)}
                              className="text-5xs font-bold uppercase tracking-wider text-emerald-600 hover:text-emerald-700 disabled:opacity-50 cursor-pointer"
                            >
                              Reactivate
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

      {/* ================= ADD MEMBER SLIDE-OVER ================= */}
      <AnimatePresence>
        {isAddOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddOpen(false)}
              className="fixed inset-0 z-50 bg-[#13121A]/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-paper border-l border-mist p-6 shadow-2xl flex flex-col justify-between"
            >
              <div className="space-y-6 overflow-y-auto pr-2 flex-grow">
                <div className="flex items-center justify-between border-b border-mist pb-4">
                  <h3 className="font-display text-lg font-black text-ink">Add New Member</h3>
                  <button
                    onClick={() => setIsAddOpen(false)}
                    className="rounded-lg p-1.5 text-ink/50 hover:bg-mist/45 transition-colors cursor-pointer"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                <form id="add-member-form" onSubmit={handleAddMember} className="space-y-4 text-xs font-semibold">
                  <div>
                    <label className="block text-ink/75 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={addForm.full_name}
                      onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })}
                      className="w-full px-3 py-2 bg-paper border border-mist rounded-xl focus:outline-none focus:border-wisteria"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-ink/75 mb-1">University Roll *</label>
                      <input
                        type="text"
                        required
                        value={addForm.university_roll}
                        onChange={(e) => setAddForm({ ...addForm, university_roll: e.target.value })}
                        className="w-full px-3 py-2 bg-paper border border-mist rounded-xl focus:outline-none focus:border-wisteria"
                      />
                    </div>
                    <div>
                      <label className="block text-ink/75 mb-1">Batch Year *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 2028"
                        value={addForm.batch_year}
                        onChange={(e) => setAddForm({ ...addForm, batch_year: e.target.value })}
                        className="w-full px-3 py-2 bg-paper border border-mist rounded-xl focus:outline-none focus:border-wisteria"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-ink/75 mb-1">Department *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Computer Science"
                      value={addForm.department}
                      onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
                      className="w-full px-3 py-2 bg-paper border border-mist rounded-xl focus:outline-none focus:border-wisteria"
                    />
                  </div>

                  <div>
                    <label className="block text-ink/75 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={addForm.email}
                      onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                      className="w-full px-3 py-2 bg-paper border border-mist rounded-xl focus:outline-none focus:border-wisteria"
                    />
                  </div>

                  <div>
                    <label className="block text-ink/75 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={addForm.phone}
                      onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-paper border border-mist rounded-xl focus:outline-none focus:border-wisteria"
                    />
                  </div>

                  <div>
                    <label className="block text-ink/75 mb-1">Skills (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. React, Python, UI Design"
                      value={addForm.skills}
                      onChange={(e) => setAddForm({ ...addForm, skills: e.target.value })}
                      className="w-full px-3 py-2 bg-paper border border-mist rounded-xl focus:outline-none focus:border-wisteria"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-mist/50 pt-4 mt-4">
                    <div>
                      <label className="block text-ink/75 mb-1">Society Position *</label>
                      <select
                        value={addForm.position}
                        onChange={(e) => setAddForm({ ...addForm, position: e.target.value })}
                        className="w-full px-3 py-2 bg-paper border border-mist rounded-xl focus:outline-none focus:border-wisteria font-semibold"
                      >
                        {POSITION_OPTIONS.map((pos) => (
                          <option key={pos} value={pos}>
                            {pos}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-ink/75 mb-1">Dashboard Access *</label>
                      <select
                        value={addForm.role}
                        onChange={(e) => setAddForm({ ...addForm, role: e.target.value as "member" | "admin" })}
                        className="w-full px-3 py-2 bg-paper border border-mist rounded-xl focus:outline-none focus:border-wisteria font-semibold"
                      >
                        <option value="member">Member (No Access)</option>
                        <option value="admin">Admin (Full Access)</option>
                      </select>
                    </div>
                  </div>
                </form>
              </div>

              <div className="border-t border-mist pt-4 mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 rounded-xl border border-mist py-2.5 text-xs font-bold text-ink hover:bg-mist/30 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="add-member-form"
                  disabled={actionLoading.addMember}
                  className="flex-1 rounded-xl bg-wisteria py-2.5 text-xs font-bold text-paper hover:bg-wisteria/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading.addMember ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>Add & Email Pass</span>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ================= MEMBER DETAILS & EDIT SLIDE-OVER ================= */}
      <AnimatePresence>
        {selectedMember && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
              className="fixed inset-0 z-50 bg-[#13121A]/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-paper border-l border-mist p-6 shadow-2xl flex flex-col justify-between"
            >
              <div className="space-y-6 overflow-y-auto pr-2 flex-grow">
                <div className="flex items-center justify-between border-b border-mist pb-4">
                  <h3 className="font-display text-lg font-black text-ink">
                    {isEditMode ? "Edit Member Profile" : "Member Profile"}
                  </h3>
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="rounded-lg p-1.5 text-ink/50 hover:bg-mist/45 transition-colors cursor-pointer"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

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

                {isEditMode ? (
                  /* ================= EDIT MODE ================= */
                  <div className="space-y-4 text-xs font-semibold">
                    <div>
                      <label className="block text-ink/75 mb-1">Society Position</label>
                      <select
                        value={editForm.position}
                        onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                        className="w-full px-3 py-2 bg-paper border border-mist rounded-xl focus:outline-none focus:border-wisteria font-semibold"
                      >
                        {POSITION_OPTIONS.map((pos) => (
                          <option key={pos} value={pos}>
                            {pos}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-ink/75 mb-1">Dashboard Access</label>
                      <select
                        value={editForm.role}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value as "member" | "admin" })}
                        className="w-full px-3 py-2 bg-paper border border-mist rounded-xl focus:outline-none focus:border-wisteria font-semibold"
                      >
                        <option value="member">Member (No Access)</option>
                        <option value="admin">Admin (Full Access)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-ink/75 mb-1">Department</label>
                        <input
                          type="text"
                          value={editForm.department}
                          onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                          className="w-full px-3 py-2 bg-paper border border-mist rounded-xl focus:outline-none focus:border-wisteria"
                        />
                      </div>
                      <div>
                        <label className="block text-ink/75 mb-1">Batch Year</label>
                        <input
                          type="text"
                          value={editForm.batch_year}
                          onChange={(e) => setEditForm({ ...editForm, batch_year: e.target.value })}
                          className="w-full px-3 py-2 bg-paper border border-mist rounded-xl focus:outline-none focus:border-wisteria"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ================= DISPLAY MODE ================= */
                  <>
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
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-display text-2xs font-bold uppercase tracking-widest text-ink/40 border-b border-mist/50 pb-1">
                        Society Credentials
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                        <div>
                          <span className="block text-5xs text-ink/55">Society Position</span>
                          <span className="text-wisteria font-bold">{selectedMember.position}</span>
                        </div>
                        <div>
                          <span className="block text-5xs text-ink/55">Dashboard Access</span>
                          <span className="text-ink">
                            {selectedMember.role === "admin" ? "Admin (Has Panel)" : "Member"}
                          </span>
                        </div>
                      </div>
                    </div>

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
                  </>
                )}
              </div>

              {/* Slide-over Footer Actions */}
              <div className="border-t border-mist pt-4 mt-6 flex gap-3">
                {isEditMode ? (
                  <>
                    <button
                      onClick={() => setIsEditMode(false)}
                      className="flex-1 rounded-xl border border-mist py-2.5 text-xs font-bold text-ink hover:bg-mist/30 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={actionLoading[selectedMember.id]}
                      onClick={handleSaveEdit}
                      className="flex-1 rounded-xl bg-wisteria py-2.5 text-xs font-bold text-paper hover:bg-wisteria/90 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {actionLoading[selectedMember.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditMode(true)}
                      className="flex-1 rounded-xl border border-mist py-2.5 text-xs font-bold text-ink hover:bg-mist/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit2 className="h-4 w-4 text-wisteria" />
                      <span>Edit Profile</span>
                    </button>

                    {selectedMember.status === "active" ? (
                      <button
                        disabled={actionLoading[selectedMember.id]}
                        onClick={() => handleSuspendMember(selectedMember.id)}
                        className="flex-1 rounded-xl border border-red-200 bg-red-50 py-2.5 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Ban className="h-4 w-4" />
                        <span>Suspend</span>
                      </button>
                    ) : (
                      selectedMember.status !== "pending" && (
                        <button
                          disabled={actionLoading[selectedMember.id]}
                          onClick={() => handleReactivateMember(selectedMember.id)}
                          className="flex-1 rounded-xl border border-emerald-200 bg-emerald-50 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Reactivate</span>
                        </button>
                      )
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

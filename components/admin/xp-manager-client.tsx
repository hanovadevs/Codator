"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Award, 
  Clock, 
  Sparkles, 
  Check, 
  ArrowUpDown, 
  PlusCircle, 
  ChevronRight, 
  X, 
  FileText,
  User,
  ShieldCheck,
  TrendingUp
} from "lucide-react";

interface Member {
  id: string;
  full_name: string;
  codator_id: string | null;
  department: string;
  position: string;
  status: string;
  xp: number;
}

interface XpManagerClientProps {
  initialMembers: Member[];
  completedCounts: Record<string, number>;
}

export default function XpManagerClient({ initialMembers, completedCounts }: XpManagerClientProps) {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"xp" | "tasks" | "name">("xp");
  const [sortAsc, setSortAsc] = useState(false);

  // Grant XP Modal States
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [xpAmount, setXpAmount] = useState(50);
  const [xpReason, setXpReason] = useState("");
  const [submittingXp, setSubmittingXp] = useState(false);

  const cleanPosition = (pos: string | null): string => {
    if (!pos) return "Member";
    let clean = pos.replace(/::\w+/g, "").replace(/'/g, "").replace(/"/g, "").trim();
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  };

  const handleGrantXp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !xpReason.trim() || xpAmount <= 0) return;

    try {
      setSubmittingXp(true);
      const res = await fetch("/api/admin/grant-xp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: selectedMember.id,
          xp_amount: Number(xpAmount),
          reason: xpReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to grant XP");

      // Success: update local state
      setMembers((prev) =>
        prev.map((m) =>
          m.id === selectedMember.id ? { ...m, xp: m.xp + Number(xpAmount) } : m
        )
      );

      // Reset states
      setSelectedMember(null);
      setXpAmount(50);
      setXpReason("");
      
      router.refresh();
      alert(`Successfully credited +${xpAmount} XP to ${selectedMember.full_name}!`);
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setSubmittingXp(false);
    }
  };

  // Sort and Filter Logic
  const sortedAndFilteredMembers = members
    .filter((m) => {
      const matchSearch = m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.codator_id && m.codator_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        m.department.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === "xp") {
        comparison = a.xp - b.xp;
      } else if (sortField === "tasks") {
        const aCount = completedCounts[a.id] || 0;
        const bCount = completedCounts[b.id] || 0;
        comparison = aCount - bCount;
      } else if (sortField === "name") {
        comparison = a.full_name.localeCompare(b.full_name);
      }
      return sortAsc ? comparison : -comparison;
    });

  const toggleSort = (field: "xp" | "tasks" | "name") => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // Default to descending
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top action layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">XP & Sprints Leaderboard</h1>
          <p className="text-4xs font-semibold text-ink/45 mt-0.5">
            Overview of members XP standings, completed sprint tasks, and administrative XP management.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white/40 border border-mist p-4 rounded-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-ink/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID or department..."
            className="w-full pl-9 pr-4 py-2.5 text-4xs font-semibold bg-white border border-mist rounded-xl focus:outline-none focus:border-wisteria placeholder:text-ink/30"
          />
        </div>

        {/* Sorting options */}
        <div className="flex gap-2">
          <button
            onClick={() => toggleSort("xp")}
            className={`px-3 py-2 rounded-xl text-4xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
              sortField === "xp"
                ? "bg-wisteria/10 border-wisteria/15 text-wisteria font-extrabold"
                : "bg-white border-mist text-ink/50 hover:bg-mist/10"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Sort by XP</span>
            <ArrowUpDown className="h-3 w-3 opacity-60" />
          </button>

          <button
            onClick={() => toggleSort("tasks")}
            className={`px-3 py-2 rounded-xl text-4xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
              sortField === "tasks"
                ? "bg-wisteria/10 border-wisteria/15 text-wisteria font-extrabold"
                : "bg-white border-mist text-ink/50 hover:bg-mist/10"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Sort by Tasks</span>
            <ArrowUpDown className="h-3 w-3 opacity-60" />
          </button>
        </div>
      </div>

      {/* Leaderboard Table List */}
      <div className="border border-mist bg-white/35 rounded-3xl overflow-hidden shadow-3xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#F8F8FC] border-b border-mist text-4xs font-bold text-ink/40 uppercase tracking-widest">
                <th className="p-4 pl-6">Rank & Member</th>
                <th className="p-4">Department & Position</th>
                <th className="p-4 text-center">Tasks Completed</th>
                <th className="p-4 text-right">XP Power</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mist/35 text-ink/75 font-semibold text-4xs">
              {sortedAndFilteredMembers.map((m, index) => {
                const completedCount = completedCounts[m.id] || 0;
                return (
                  <tr 
                    key={m.id} 
                    className="hover:bg-wisteria-tint/[0.01] transition-colors"
                  >
                    <td className="p-4 pl-6 flex items-center gap-3">
                      <span className="font-mono font-black text-2xs text-ink/30 w-5">
                        #{index + 1}
                      </span>
                      <div className="space-y-0.5">
                        <div className="text-[11px] font-bold text-ink">{m.full_name}</div>
                        <div className="text-[9px] font-mono text-ink/40">{m.codator_id || "No ID Registered"}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <div className="text-ink">{cleanPosition(m.position)}</div>
                        <div className="text-[9px] text-ink/45 font-bold uppercase tracking-wider">{m.department}</div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200/50 text-[10px] font-mono font-bold text-slate-700">
                        {completedCount} tasks
                      </span>
                    </td>
                    <td className="p-4 text-right font-mono font-black text-xs text-wisteria">
                      {m.xp} XP
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={() => setSelectedMember(m)}
                        className="px-3 py-1.5 bg-wisteria hover:bg-wisteria/90 text-paper text-5xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-3xs flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <Award className="h-3 w-3" /> Grant XP
                      </button>
                    </td>
                  </tr>
                );
              })}

              {sortedAndFilteredMembers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-ink/40 italic">
                    No members match the query filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grant XP Modal Dialog */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white border border-mist rounded-3xl p-6 shadow-xl z-10 overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-wisteria to-skyline" />

              <div className="flex items-center justify-between border-b border-mist/35 pb-3.5 mb-4">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-wisteria" />
                  <span className="font-display text-sm font-bold text-ink uppercase tracking-wider">Grant Bonus XP</span>
                </div>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="p-1 rounded-lg hover:bg-mist/10 transition-colors"
                >
                  <X className="h-4 w-4 text-ink/45" />
                </button>
              </div>

              <form onSubmit={handleGrantXp} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-4xs font-bold text-ink uppercase tracking-wider block">Recipient</label>
                  <div className="w-full px-4 py-2.5 bg-[#F8F8FC] border border-mist/60 text-ink/75 font-bold text-4xs rounded-xl flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-ink/35" />
                    <span>{selectedMember.full_name}</span>
                    <span className="text-[9px] text-ink/40 font-semibold">• {cleanPosition(selectedMember.position)}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-4xs font-bold text-ink uppercase tracking-wider block">XP Reward Amount</label>
                  <input
                    type="number"
                    required
                    min={5}
                    max={2000}
                    value={xpAmount}
                    onChange={(e) => setXpAmount(parseInt(e.target.value) || 50)}
                    className="w-full px-4 py-2.5 text-4xs font-bold border border-mist bg-white focus:border-wisteria rounded-xl outline-none"
                  />
                  <span className="text-[10px] text-ink/35 font-semibold block">Enter a positive integer reward to credit.</span>
                </div>

                <div className="space-y-1">
                  <label className="text-4xs font-bold text-ink uppercase tracking-wider block">Justification Reason</label>
                  <textarea
                    required
                    rows={3}
                    value={xpReason}
                    onChange={(e) => setXpReason(e.target.value)}
                    placeholder="e.g. Exceptional efforts in rebuilding and maintaining the digital pass scanner app during DevFest"
                    className="w-full p-3.5 text-4xs font-semibold border border-mist bg-white focus:border-wisteria rounded-xl outline-none resize-none placeholder:text-ink/30"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMember(null)}
                    className="px-4 py-2 border border-mist bg-white hover:bg-mist/10 text-4xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingXp || !xpReason.trim()}
                    className="px-4 py-2 bg-wisteria hover:bg-wisteria/90 disabled:opacity-50 text-4xs font-bold text-white rounded-xl transition-all shadow-3xs flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
                  >
                    {submittingXp ? "Crediting..." : (
                      <>
                        <Check className="h-3.5 w-3.5" /> Confirm Award
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Check, X, FileText, Send, ListTodo, ClipboardCheck, Sparkles, Clock, AlertCircle, Search, Filter, ArrowUpDown } from "lucide-react";
import { useRouter } from "next/navigation";

interface Member {
  id: string;
  full_name: string;
  codator_id: string | null;
  department: string;
  position: string;
  status: string;
  xp?: number;
  role?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  xp_reward: number;
  assigned_by: string;
  assigned_to: string;
  status: "assigned" | "pending_review" | "completed";
  proof: string | null;
  created_at: string;
  submitted_at: string | null;
  completed_at: string | null;
  assignee?: {
    id: string;
    full_name: string;
    codator_id: string;
    position: string;
    department: string;
  } | null;
  assigner?: {
    id: string;
    full_name: string;
  } | null;
}

export default function TasksManager({ currentMember }: { currentMember: Member }) {
  const router = useRouter();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<"my-tasks" | "assign" | "verify" | "assigned-history" | "standings">("my-tasks");
  const [loading, setLoading] = useState(true);
  
  // Tasks lists
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [pendingReviews, setPendingReviews] = useState<Task[]>([]);
  const [assignedHistory, setAssignedHistory] = useState<Task[]>([]);
  const [membersList, setMembersList] = useState<Member[]>([]);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "assigned" | "pending_review" | "completed">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "highest-xp">("newest");
  const [memberSearchTerm, setMemberSearchTerm] = useState("");

  // Form states for creating a task
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskXp, setTaskXp] = useState(100);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [submittingTask, setSubmittingTask] = useState(false);

  // Form states for submitting proof
  const [activeProofTaskId, setActiveProofTaskId] = useState<string | null>(null);
  const [proofText, setProofText] = useState("");
  const [submittingProof, setSubmittingProof] = useState(false);

  const posLower = currentMember.position.toLowerCase();
  const isTopTier = posLower.includes("president") || posLower.includes("mentor");
  const isDirectorTier = posLower.includes("director");
  const canAssign = isTopTier || isDirectorTier;

  // Fetch tasks and members
  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Fetch tasks assigned TO current user
      const { data: myData, error: myError } = await supabase
        .from("tasks")
        .select(`
          *,
          assigner:members!tasks_assigned_by_fkey(id, full_name)
        `)
        .eq("assigned_to", currentMember.id)
        .order("created_at", { ascending: false });

      if (myError) throw myError;
      setMyTasks((myData || []) as any);

      // 2. If assigner, fetch tasks assigned BY current user (or all if top tier) that are pending review
      if (canAssign) {
        let query = supabase
          .from("tasks")
          .select(`
            *,
            assignee:members!tasks_assigned_to_fkey(id, full_name, codator_id, position, department)
          `)
          .eq("status", "pending_review")
          .order("submitted_at", { ascending: true });

        if (!isTopTier) {
          query = query.eq("assigned_by", currentMember.id);
        }

        const { data: reviewData, error: reviewError } = await query;
        if (reviewError) throw reviewError;
        setPendingReviews((reviewData || []) as any);

        // 3. Fetch list of eligible members to assign tasks to (including XP details)
        let memberQuery = supabase
          .from("members")
          .select("id, full_name, codator_id, position, department, status, xp")
          .eq("status", "active")
          .neq("id", currentMember.id);

        if (!isTopTier) {
          memberQuery = memberQuery.eq("department", currentMember.department);
        }

        const { data: memData, error: memError } = await memberQuery;
        if (memError) throw memError;

        // Filter out any top tier members if the assigner is only a director
        const filteredMems = (memData || []).filter((m) => {
          if (!isTopTier) {
            const p = m.position.toLowerCase();
            return !p.includes("president") && !p.includes("mentor");
          }
          return true;
        });

        setMembersList(filteredMems as Member[]);

        // 4. Fetch all tasks assigned by current user (or all if top-tier) for history Outbox
        let historyQuery = supabase
          .from("tasks")
          .select(`
            *,
            assignee:members!tasks_assigned_to_fkey(id, full_name, codator_id, position, department)
          `)
          .order("created_at", { ascending: false });

        if (!isTopTier) {
          historyQuery = historyQuery.eq("assigned_by", currentMember.id);
        }

        const { data: histData, error: histError } = await historyQuery;
        if (histError) throw histError;
        setAssignedHistory((histData || []) as any);
      }
    } catch (err) {
      console.error("Error fetching tasks data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentMember.id]);

  // Handle assigning a task
  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || selectedMembers.length === 0) return;

    try {
      setSubmittingTask(true);
      const res = await fetch("/api/tasks/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDesc,
          xp_reward: taskXp,
          assigned_to: selectedMembers,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create task");

      // Reset form
      setTaskTitle("");
      setTaskDesc("");
      setTaskXp(100);
      setSelectedMembers([]);
      
      // Refresh tasks
      await fetchData();
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setSubmittingTask(false);
    }
  };

  // Handle submitting proof
  const handleSubmitProof = async (taskId: string) => {
    if (!proofText.trim()) return;

    try {
      setSubmittingProof(true);
      const res = await fetch("/api/tasks/submit-proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_id: taskId,
          proof: proofText,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit proof");

      setProofText("");
      setActiveProofTaskId(null);
      await fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to submit proof");
    } finally {
      setSubmittingProof(false);
    }
  };

  // Handle task review approval/rejection
  const handleReviewTask = async (taskId: string, action: "approve" | "reject") => {
    try {
      const res = await fetch("/api/tasks/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_id: taskId,
          action,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to review task");

      await fetchData();
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Action failed");
    }
  };

  const toggleSelectMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  // Filter and Sort My Tasks
  const filteredMyTasks = myTasks
    .filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" ? true : task.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortOrder === "highest-xp") {
        return b.xp_reward - a.xp_reward;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  // Filter members for task assignment
  const filteredMembersList = membersList.filter((mem) => {
    return mem.full_name.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
      (mem.codator_id && mem.codator_id.toLowerCase().includes(memberSearchTerm.toLowerCase())) ||
      mem.position.toLowerCase().includes(memberSearchTerm.toLowerCase());
  });

  return (
    <div className="border border-mist bg-paper/40 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)] space-y-6">
      {/* Header and Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-mist/35 pb-5 gap-4">
        <div>
          <h2 className="font-display text-lg font-black text-ink flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-wisteria animate-pulse" />
            <span>Tasks & Sprints Management</span>
          </h2>
          <p className="text-5xs font-bold uppercase tracking-wider text-ink/40 mt-1">
            Complete tasks, earn Experience Points, and level up
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap bg-[#F8F8FC] border border-mist/55 p-1 rounded-xl gap-1 shrink-0">
          <button
            onClick={() => setActiveTab("my-tasks")}
            className={`px-4 py-2 rounded-lg text-4xs font-bold transition-all cursor-pointer ${
              activeTab === "my-tasks"
                ? "bg-white text-wisteria shadow-[0_2px_8px_rgba(139,127,232,0.08)] border border-mist/40"
                : "text-ink/50 hover:text-ink"
            }`}
          >
            My Tasks
          </button>
          
          {canAssign && (
            <>
              <button
                onClick={() => setActiveTab("assign")}
                className={`px-4 py-2 rounded-lg text-4xs font-bold transition-all cursor-pointer ${
                  activeTab === "assign"
                    ? "bg-white text-wisteria shadow-[0_2px_8px_rgba(139,127,232,0.08)] border border-mist/40"
                    : "text-ink/50 hover:text-ink"
                }`}
              >
                Assign Task
              </button>
              <button
                onClick={() => setActiveTab("verify")}
                className={`px-4 py-2 rounded-lg text-4xs font-bold transition-all cursor-pointer relative ${
                  activeTab === "verify"
                    ? "bg-white text-wisteria shadow-[0_2px_8px_rgba(139,127,232,0.08)] border border-mist/40"
                    : "text-ink/50 hover:text-ink"
                }`}
              >
                Verify Tasks
                {pendingReviews.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] text-white font-extrabold animate-bounce">
                    {pendingReviews.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("assigned-history")}
                className={`px-4 py-2 rounded-lg text-4xs font-bold transition-all cursor-pointer ${
                  activeTab === "assigned-history"
                    ? "bg-white text-wisteria shadow-[0_2px_8px_rgba(139,127,232,0.08)] border border-mist/40"
                    : "text-ink/50 hover:text-ink"
                }`}
              >
                Assigned History
              </button>
              <button
                onClick={() => setActiveTab("standings")}
                className={`px-4 py-2 rounded-lg text-4xs font-bold transition-all cursor-pointer ${
                  activeTab === "standings"
                    ? "bg-white text-wisteria shadow-[0_2px_8px_rgba(139,127,232,0.08)] border border-mist/40"
                    : "text-ink/50 hover:text-ink"
                }`}
              >
                Member XP Board
              </button>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center items-center text-4xs text-ink/40 font-bold uppercase tracking-widest gap-2">
          <div className="w-4 h-4 border-2 border-wisteria border-t-transparent rounded-full animate-spin" />
          Loading Tasks System...
        </div>
      ) : (
        <>
          {/* Tab 1: My Tasks */}
          {activeTab === "my-tasks" && (
            <div className="space-y-5">
              {/* Search and Filters Bar - Advanced UI */}
              {myTasks.length > 0 && (
                <div className="flex flex-col md:flex-row gap-3 items-stretch justify-between bg-white/50 p-3 rounded-2xl border border-mist/45 shadow-3xs">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink/35" />
                    <input
                      type="text"
                      placeholder="Search my tasks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-transparent text-4xs font-semibold placeholder:text-ink/30 border-none outline-none focus:ring-0"
                    />
                  </div>

                  {/* Filter controls */}
                  <div className="flex flex-wrap items-center gap-2 border-t md:border-t-0 md:border-l border-mist/40 pt-2.5 md:pt-0 md:pl-3">
                    <div className="flex bg-[#F8F8FC] border border-mist/55 p-0.5 rounded-lg gap-0.5">
                      {(["all", "assigned", "pending_review", "completed"] as const).map((status) => (
                        <button
                          key={status}
                          onClick={() => setStatusFilter(status)}
                          className={`px-2.5 py-1 rounded-md text-[8px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            statusFilter === status
                              ? "bg-white text-wisteria shadow-3xs border border-mist/40"
                              : "text-ink/45 hover:text-ink"
                          }`}
                        >
                          {status === "pending_review" ? "Awaiting review" : status}
                        </button>
                      ))}
                    </div>

                    {/* Sorting selector */}
                    <div className="relative flex items-center border border-mist bg-white rounded-lg px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider text-ink/50 gap-1.5 cursor-pointer">
                      <ArrowUpDown className="h-3 w-3" />
                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as any)}
                        className="bg-transparent border-none outline-none cursor-pointer p-0 text-[8px] font-bold text-ink/65 pr-1 focus:ring-0 focus:outline-none"
                      >
                        <option value="newest">Newest First</option>
                        <option value="highest-xp">Highest XP</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {filteredMyTasks.length === 0 ? (
                <div className="py-12 text-center text-xs font-semibold text-ink/45 flex flex-col items-center gap-2.5">
                  <ClipboardCheck className="h-8 w-8 text-ink/30" />
                  {myTasks.length === 0 
                    ? "No tasks assigned to you yet. You are all cleared!" 
                    : "No tasks match the active filters."
                  }
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredMyTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`relative border rounded-2xl p-5 hover:shadow-md hover:border-wisteria/25 transition-all duration-300 bg-white/40 flex flex-col gap-4`}
                    >
                      {/* Left color bar indicator */}
                      <span className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${
                        task.status === "completed"
                          ? "bg-emerald-500"
                          : task.status === "pending_review"
                          ? "bg-purple-500"
                          : "bg-slate-300"
                      }`} />

                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pl-2">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className={`text-xs font-bold ${task.status === "completed" ? "text-emerald-700 line-through" : "text-ink"}`}>
                              {task.title}
                            </h3>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-wisteria/15 bg-wisteria-tint text-[8px] font-bold text-wisteria">
                              <Sparkles className="h-2.5 w-2.5" />
                              +{task.xp_reward} XP
                            </span>
                          </div>
                          <p className="text-4xs leading-relaxed text-ink/65 font-semibold">
                            {task.description || "No description provided."}
                          </p>
                          <div className="text-[9px] text-ink/40 font-bold uppercase tracking-wider flex items-center gap-1.5 pt-1">
                            <Clock className="h-3 w-3" />
                            Assigned by {task.assigner?.full_name || "Admin"} on {new Date(task.created_at).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Status / Actions */}
                        <div className="shrink-0">
                          {task.status === "completed" && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-[9px] font-bold text-emerald-700">
                              <Check className="h-3 w-3" /> Completed
                            </span>
                          )}

                          {task.status === "pending_review" && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-purple-200 bg-purple-50 text-[9px] font-bold text-purple-700">
                              <Clock className="h-3 w-3 animate-spin" style={{ animationDuration: "3s" }} /> Awaiting Review
                            </span>
                          )}

                          {task.status === "assigned" && activeProofTaskId !== task.id && (
                            <button
                              onClick={() => {
                                setActiveProofTaskId(task.id);
                                setProofText("");
                              }}
                              className="px-4 py-2 bg-wisteria hover:bg-wisteria/90 text-4xs font-bold text-white rounded-xl transition-all shadow-3xs cursor-pointer active:scale-[0.98]"
                            >
                              Report Completion
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expandable Submission Form */}
                      {activeProofTaskId === task.id && (
                        <div className="mt-2 pt-4 border-t border-mist/40 pl-2 space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-4xs font-bold text-ink uppercase tracking-wider">
                              Proof of Completion Details
                            </label>
                            <textarea
                              value={proofText}
                              onChange={(e) => setProofText(e.target.value)}
                              placeholder="Please write down links to your code branch, deployed link, or detail your proof here..."
                              className="w-full min-h-[90px] p-3 text-4xs font-semibold border border-mist bg-white focus:border-wisteria rounded-xl outline-none transition-all placeholder:text-ink/30 focus:shadow-sm"
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setActiveProofTaskId(null)}
                              className="px-4 py-2 border border-mist bg-white hover:bg-mist/10 text-4xs font-bold rounded-xl transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSubmitProof(task.id)}
                              disabled={submittingProof || !proofText.trim()}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-4xs font-bold text-white rounded-xl transition-all shadow-3xs flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
                            >
                              {submittingProof ? "Submitting..." : (
                                <>
                                  <Send className="h-3 w-3" /> Submit Report
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Assign Task */}
          {activeTab === "assign" && canAssign && (
            <form onSubmit={handleAssignTask} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-12">
                {/* Form Fields */}
                <div className="sm:col-span-7 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-4xs font-bold text-ink uppercase tracking-wider">Task Title</label>
                    <input
                      type="text"
                      required
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      placeholder="e.g. Fix navbar active indicator padding"
                      className="w-full px-4 py-3 text-4xs font-semibold border border-mist bg-white focus:border-wisteria rounded-xl outline-none transition-all focus:shadow-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-4xs font-bold text-ink uppercase tracking-wider">Description</label>
                    <textarea
                      value={taskDesc}
                      onChange={(e) => setTaskDesc(e.target.value)}
                      placeholder="Detail instructions, expectations, and any helpful reference links..."
                      className="w-full min-h-[110px] p-4 text-4xs font-semibold border border-mist bg-white focus:border-wisteria rounded-xl outline-none transition-all focus:shadow-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-4xs font-bold text-ink uppercase tracking-wider">XP Reward</label>
                    <input
                      type="number"
                      required
                      min={10}
                      max={1000}
                      value={taskXp}
                      onChange={(e) => setTaskXp(parseInt(e.target.value) || 100)}
                      className="w-full px-4 py-3 text-4xs font-semibold border border-mist bg-white focus:border-wisteria rounded-xl outline-none transition-all focus:shadow-sm"
                    />
                  </div>
                </div>

                {/* Target Members Multi-Select */}
                <div className="sm:col-span-5 flex flex-col h-[320px]">
                  <label className="text-4xs font-bold text-ink uppercase tracking-wider mb-2">
                    Assign To ({selectedMembers.length} selected)
                  </label>
                  
                  {membersList.length === 0 ? (
                    <div className="flex-1 border border-mist border-dashed rounded-2xl flex flex-col items-center justify-center p-4 text-center text-4xs text-ink/40 font-bold uppercase tracking-wider gap-1 bg-white/10">
                      <AlertCircle className="h-5 w-5 text-ink/30" />
                      No members available to assign.
                    </div>
                  ) : (
                    <div className="flex-1 border border-mist bg-white/40 rounded-xl overflow-hidden flex flex-col">
                      {/* Search Bar for Member Filter */}
                      <div className="relative border-b border-mist/35 p-2 bg-white/70">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3 w-3 text-ink/30" />
                        <input
                          type="text"
                          placeholder="Search active members..."
                          value={memberSearchTerm}
                          onChange={(e) => setMemberSearchTerm(e.target.value)}
                          className="w-full pl-7 pr-3 py-1.5 bg-transparent text-5xs font-bold border-none outline-none focus:ring-0"
                        />
                      </div>

                      {/* Scroller */}
                      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
                        {filteredMembersList.map((mem) => {
                          const isSelected = selectedMembers.includes(mem.id);
                          return (
                            <div
                              key={mem.id}
                              onClick={() => toggleSelectMember(mem.id)}
                              className={`flex items-center justify-between p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                                isSelected
                                  ? "border-wisteria/35 bg-wisteria-tint/40 shadow-3xs"
                                  : "border-transparent bg-transparent hover:bg-mist/10"
                              }`}
                            >
                              <div className="space-y-0.5">
                                <div className="text-[11px] font-bold text-ink leading-tight">{mem.full_name}</div>
                                <div className="text-[8px] text-ink/45 font-semibold">
                                  {mem.position} • {mem.department}
                                </div>
                              </div>
                              <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                                isSelected ? "bg-wisteria border-wisteria text-white" : "border-mist bg-white"
                              }`}>
                                {isSelected && <Check className="h-2.5 w-2.5 stroke-[4]" />}
                              </div>
                            </div>
                          );
                        })}
                        {filteredMembersList.length === 0 && (
                          <div className="text-center text-[10px] text-ink/40 italic py-4">No matching members found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submittingTask || !taskTitle.trim() || selectedMembers.length === 0}
                  className="px-6 py-3 bg-wisteria hover:bg-wisteria/90 disabled:opacity-50 text-4xs font-bold text-white rounded-xl transition-all shadow-3xs flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {submittingTask ? "Assigning..." : "Assign Task to Selected"}
                </button>
              </div>
            </form>
          )}

          {/* Tab 3: Verify Tasks */}
          {activeTab === "verify" && canAssign && (
            <div className="space-y-5">
              {/* Summary Indicator */}
              <div className="bg-purple-500/[0.02] border border-purple-500/10 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-4.5 w-4.5 text-wisteria" />
                  <span className="text-4xs font-bold text-ink uppercase tracking-wider">Reports Queue</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-wisteria-tint border border-wisteria/15 text-[9px] font-extrabold text-wisteria">
                  {pendingReviews.length} Pending Approval
                </span>
              </div>

              {pendingReviews.length === 0 ? (
                <div className="py-12 text-center text-xs font-semibold text-ink/45 flex flex-col items-center gap-2.5">
                  <ClipboardCheck className="h-8 w-8 text-ink/30" />
                  No reports awaiting verification. Good job!
                </div>
              ) : (
                <div className="grid gap-4">
                  {pendingReviews.map((task) => (
                    <div
                      key={task.id}
                      className="border border-mist bg-white/20 rounded-2xl p-5 flex flex-col space-y-4 hover:shadow-md hover:border-wisteria/15 transition-all duration-300"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[9px] font-bold text-wisteria uppercase tracking-wider">Task Submission</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-wisteria/15 bg-wisteria-tint text-[8px] font-bold text-wisteria">
                              +{task.xp_reward} XP
                            </span>
                          </div>
                          <h3 className="text-xs font-bold text-ink">{task.title}</h3>
                          <div className="text-[9px] text-ink/50 font-bold uppercase tracking-wider">
                            Assignee: <span className="text-ink font-extrabold">{task.assignee?.full_name}</span> ({task.assignee?.position} of {task.assignee?.department})
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleReviewTask(task.id, "reject")}
                            className="px-3 py-1.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-4xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" /> Reject
                          </button>
                          
                          <button
                            onClick={() => handleReviewTask(task.id, "approve")}
                            className="px-3 py-1.5 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-4xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5" /> Approve & Credit XP
                          </button>
                        </div>
                      </div>

                      {/* Submitted Proof Display - Technical Code Block Style */}
                      <div className="border border-mist bg-white rounded-xl overflow-hidden shadow-3xs">
                        <div className="bg-[#F8F8FC] border-b border-mist/35 p-2 px-3 flex items-center justify-between">
                          <span className="text-[8px] font-bold text-ink/40 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                            <FileText className="h-3 w-3" /> member_submission_proof.txt
                          </span>
                          <span className="text-[8px] font-mono text-ink/30 select-none">ASCII / UTF-8</span>
                        </div>
                        <div className="p-4 bg-white/45">
                          <p className="text-4xs font-semibold text-ink/75 leading-relaxed whitespace-pre-line font-mono">
                            {task.proof}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* Tab 4: Assigned History (Outbox) */}
          {activeTab === "assigned-history" && canAssign && (
            <div className="space-y-4">
              {assignedHistory.length === 0 ? (
                <div className="py-12 text-center text-xs font-semibold text-ink/45 flex flex-col items-center gap-2.5">
                  <ClipboardCheck className="h-8 w-8 text-ink/30" />
                  You haven't assigned any tasks yet.
                </div>
              ) : (
                <div className="grid gap-4">
                  {assignedHistory.map((task) => {
                    const statusStyles = {
                      completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
                      pending_review: "border-purple-200 bg-purple-50 text-purple-700",
                      assigned: "border-slate-205 bg-slate-50 text-slate-600"
                    }[task.status] || "border-mist bg-white text-ink";
                    
                    const handleRevokeTask = async () => {
                      if (!confirm("Are you sure you want to cancel and delete this assigned task?")) return;
                      try {
                        const { error } = await supabase.from("tasks").delete().eq("id", task.id);
                        if (error) throw error;
                        await fetchData();
                      } catch (err: any) {
                        alert(err.message || "Failed to delete task");
                      }
                    };

                    return (
                      <div
                        key={task.id}
                        className="border border-mist/55 bg-white/20 rounded-2xl p-5 hover:shadow-md hover:border-wisteria/15 transition-all duration-300"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="space-y-1.5 flex-1 text-left">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-xs font-bold text-ink">
                                {task.title}
                              </h3>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-wisteria/15 bg-wisteria-tint text-[8px] font-bold text-wisteria">
                                <Sparkles className="h-2.5 w-2.5" />
                                +{task.xp_reward} XP
                              </span>
                            </div>
                            <p className="text-4xs leading-relaxed text-ink/65 font-semibold">
                              {task.description || "No description provided."}
                            </p>
                            <div className="text-[9px] text-ink/40 font-bold uppercase tracking-wider flex items-center gap-4 flex-wrap pt-1">
                              <span>Assignee: <span className="text-ink font-extrabold">{task.assignee?.full_name}</span> ({task.assignee?.position} of {task.assignee?.department})</span>
                              <span>Created on: {new Date(task.created_at).toLocaleDateString()}</span>
                              {task.completed_at && <span>Completed on: {new Date(task.completed_at).toLocaleDateString()}</span>}
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-start">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[9px] font-bold ${statusStyles}`}>
                              {task.status === "completed" && <Check className="h-3 w-3" />}
                              {task.status === "pending_review" && <Clock className="h-3 w-3 animate-spin" style={{ animationDuration: "3s" }} />}
                              {task.status === "assigned" && <Clock className="h-3 w-3" />}
                              {task.status === "pending_review" ? "Pending Review" : task.status.toUpperCase()}
                            </span>

                            {task.status !== "completed" && (
                              <button
                                onClick={handleRevokeTask}
                                className="p-1 text-red-500 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-all cursor-pointer"
                                title="Revoke Task"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Display submitted proof in read-only mode if completed */}
                        {task.status === "completed" && task.proof && (
                          <div className="mt-4 border border-mist/40 bg-white/50 p-3.5 rounded-xl space-y-1 text-left">
                            <div className="text-[8px] font-bold text-ink/40 uppercase tracking-widest flex items-center gap-1">
                              <FileText className="h-3 w-3" /> Submitted Proof
                            </div>
                            <p className="text-4xs font-semibold text-ink/75 leading-relaxed font-mono">
                              {task.proof}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 5: Member Standings (XP Board) */}
          {activeTab === "standings" && canAssign && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-3 items-stretch justify-between bg-white/50 p-3 rounded-2xl border border-mist/45 shadow-3xs">
                {/* Search members in leaderboard */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink/35" />
                  <input
                    type="text"
                    placeholder="Search members by name or position..."
                    value={memberSearchTerm}
                    onChange={(e) => setMemberSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-transparent text-4xs font-semibold placeholder:text-ink/30 border-none outline-none focus:ring-0"
                  />
                </div>
                <div className="flex items-center px-3 py-1.5 bg-[#FAF9FD] rounded-lg border border-mist/45 text-[8px] font-bold uppercase tracking-wider text-ink/50 gap-1.5 shrink-0">
                  <Plus className="h-3 w-3 text-wisteria" /> Total Active Members: {filteredMembersList.length}
                </div>
              </div>

              {/* Leaderboard table */}
              <div className="border border-mist bg-white/40 rounded-2xl overflow-hidden shadow-3xs">
                <div className="grid grid-cols-12 bg-[#F8F8FC] border-b border-mist/35 p-3.5 text-[8px] font-bold uppercase tracking-widest text-ink/45 text-left select-none">
                  <div className="col-span-1">Rank</div>
                  <div className="col-span-5 sm:col-span-4">Full Name</div>
                  <div className="col-span-3">Position</div>
                  <div className="col-span-3 sm:col-span-3">Department</div>
                  <div className="col-span-2 sm:col-span-1 text-right">XP Points</div>
                </div>

                <div className="divide-y divide-mist/35">
                  {[...filteredMembersList]
                    .sort((a, b) => (b.xp || 0) - (a.xp || 0))
                    .map((mem, index) => (
                      <div
                        key={mem.id}
                        className="grid grid-cols-12 p-3.5 text-4xs font-semibold text-ink/75 hover:bg-wisteria-tint/5 transition-all text-left items-center"
                      >
                        <div className="col-span-1 font-mono font-bold text-ink/40">#{index + 1}</div>
                        <div className="col-span-5 sm:col-span-4 flex flex-col justify-center">
                          <span className="font-extrabold text-ink leading-snug">{mem.full_name}</span>
                          <span className="text-[8px] text-ink/40 font-mono mt-0.5">{mem.codator_id || "PENDING"}</span>
                        </div>
                        <div className="col-span-3 font-semibold text-wisteria">{mem.position}</div>
                        <div className="col-span-3 sm:col-span-3 text-ink/65">{mem.department || "General"}</div>
                        <div className="col-span-2 sm:col-span-1 text-right font-mono font-bold text-wisteria text-xs flex items-center justify-end gap-1">
                          <Sparkles className="h-3 w-3 fill-wisteria text-wisteria opacity-70" />
                          <span>{mem.xp || 0}</span>
                        </div>
                      </div>
                    ))}

                  {filteredMembersList.length === 0 && (
                    <div className="text-center text-[11px] text-ink/40 italic py-8">No matching active members found</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

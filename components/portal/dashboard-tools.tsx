"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Terminal, 
  Copy, 
  Check, 
  Sparkles, 
  Clock, 
  Code, 
  FileText, 
  Clock3, 
  Calendar, 
  ArrowRight,
  ClipboardCheck,
  Link as LinkIcon
} from "lucide-react";
import Link from "next/link";

interface Task {
  id: string;
  title: string;
  xp_reward: number;
  due_at: string | null;
  status: string;
}

export default function DashboardTools({ memberId }: { memberId: string }) {
  const supabase = createClient();
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // Dev toolbox tab state
  const [activeToolTab, setActiveToolTab] = useState<"base64" | "markdown" | "epoch">("base64");

  // Base64 tool states
  const [b64Input, setB64Input] = useState("");
  const [b64Output, setB64Output] = useState("");
  const [b64Mode, setB64Mode] = useState<"encode" | "decode">("encode");
  const [copiedB64, setCopiedB64] = useState(false);

  // Markdown helper states
  const [proofTitle, setProofTitle] = useState("");
  const [proofBranch, setProofBranch] = useState("main");
  const [proofDesc, setProofDesc] = useState("");
  const [copiedMd, setCopiedMd] = useState(false);

  // Epoch tool states
  const [currentTime, setCurrentTime] = useState(new Date());
  const [copiedEpoch, setCopiedEpoch] = useState(false);

  useEffect(() => {
    // 1. Fetch active tasks for this member
    const fetchActiveTasks = async () => {
      try {
        const { data, error } = await supabase
          .from("tasks")
          .select("id, title, xp_reward, due_at, status")
          .eq("assigned_to", memberId)
          .in("status", ["assigned", "pending_review"])
          .order("created_at", { ascending: false })
          .limit(3);

        if (!error && data) {
          setActiveTasks(data);
        }
      } catch (err) {
        console.error("Error fetching tasks:", err);
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchActiveTasks();

    // 2. Real-time timer for Epoch tool
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [memberId]);

  // Base64 logic
  const handleB64Convert = (text: string, mode: "encode" | "decode") => {
    setB64Input(text);
    if (!text.trim()) {
      setB64Output("");
      return;
    }
    try {
      if (mode === "encode") {
        setB64Output(btoa(text));
      } else {
        setB64Output(atob(text));
      }
    } catch (e) {
      setB64Output("Error: Invalid string format.");
    }
  };

  const copyToClipboard = (text: string, setCopiedState: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  // Markdown Template generator
  const generatedMarkdown = `### Task Proof: ${proofTitle || "Task Title"}
- **Branch**: \`${proofBranch}\`
- **Submission Time**: ${new Date().toLocaleString()}

#### Implementation Details:
${proofDesc || "Describe what was implemented..."}

---
*Generated via CODATOR Markdown Assistant*`;

  return (
    <div className="grid gap-8 lg:grid-cols-12 mt-4 text-left">
      {/* Active Sprint Widget - col span 5 */}
      <div className="lg:col-span-5 border border-mist bg-paper/20 rounded-3xl p-6 flex flex-col justify-between hover:shadow-md transition-all duration-300">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-mist/35 pb-3">
            <h3 className="font-display text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
              <ClipboardCheck className="h-4.5 w-4.5 text-wisteria" />
              <span>Active Sprint Tasks</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-wisteria-tint border border-wisteria/15 text-[8px] font-bold text-wisteria uppercase">
              {activeTasks.length} Active
            </span>
          </div>

          {loadingTasks ? (
            <div className="py-8 text-center text-4xs font-semibold text-ink/40 animate-pulse">
              Loading active sprints...
            </div>
          ) : activeTasks.length === 0 ? (
            <div className="py-8 text-center text-4xs font-semibold text-ink/40 space-y-2">
              <p>You have no pending sprint tasks. All clear! 🎉</p>
              <p className="text-[10px] text-ink/30 italic">Check back later when a leader assigns work.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeTasks.map((task) => {
                const isOverdue = task.due_at && new Date(task.due_at).getTime() < Date.now();
                return (
                  <div 
                    key={task.id} 
                    className="p-3 border border-mist bg-white/45 rounded-2xl flex items-center justify-between hover:border-wisteria/25 transition-all duration-200"
                  >
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-ink leading-tight pr-2">{task.title}</div>
                      <div className="flex items-center gap-2 flex-wrap text-[9px] text-ink/40 font-bold uppercase tracking-wider">
                        <span className="inline-flex items-center gap-0.5 text-wisteria">
                          +{task.xp_reward} XP
                        </span>
                        {task.due_at && (
                          <span className={`inline-flex items-center gap-0.5 ${isOverdue ? "text-red-500 animate-pulse font-black" : "text-ink/40"}`}>
                            • Due: {new Date(task.due_at).toLocaleDateString()}
                          </span>
                        )}
                        <span className={`inline-flex px-1 py-0.5 rounded text-[8px] border ${
                          task.status === "pending_review" 
                            ? "bg-purple-50 text-purple-700 border-purple-150" 
                            : "bg-blue-50 text-blue-700 border-blue-150"
                        }`}>
                          {task.status === "pending_review" ? "Review" : "Assigned"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Link
          href="/portal/tasks"
          className="mt-6 w-full py-2.5 bg-wisteria hover:bg-wisteria/95 text-paper text-4xs font-bold rounded-xl transition-all shadow-3xs flex items-center justify-center gap-1.5 active:scale-[0.98]"
        >
          <span>Open Tasks Console</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Dev Toolbox Widget - col span 7 */}
      <div className="lg:col-span-7 border border-mist bg-paper/20 rounded-3xl p-6 flex flex-col justify-between hover:shadow-md transition-all duration-300">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-mist/35 pb-3 gap-3">
            <h3 className="font-display text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="h-4.5 w-4.5 text-wisteria animate-pulse" />
              <span>Developer Toolbox</span>
            </h3>
            
            {/* Tool tabs selection */}
            <div className="flex bg-[#F4F4F8] border border-mist/50 p-0.5 rounded-lg gap-0.5">
              <button
                onClick={() => setActiveToolTab("base64")}
                className={`px-2.5 py-1 rounded text-[8px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeToolTab === "base64" ? "bg-white text-wisteria shadow-3xs" : "text-ink/45 hover:text-ink"
                }`}
              >
                Base64
              </button>
              <button
                onClick={() => setActiveToolTab("markdown")}
                className={`px-2.5 py-1 rounded text-[8px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeToolTab === "markdown" ? "bg-white text-wisteria shadow-3xs" : "text-ink/45 hover:text-ink"
                }`}
              >
                MD Assistant
              </button>
              <button
                onClick={() => setActiveToolTab("epoch")}
                className={`px-2.5 py-1 rounded text-[8px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeToolTab === "epoch" ? "bg-white text-wisteria shadow-3xs" : "text-ink/45 hover:text-ink"
                }`}
              >
                Epoch/Clock
              </button>
            </div>
          </div>

          {/* TAB 1: Base64 Tool */}
          {activeToolTab === "base64" && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-ink/45 font-semibold">Convert credentials or strings to/from Base64</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setB64Mode("encode");
                      handleB64Convert(b64Input, "encode");
                    }}
                    className={`px-2 py-0.5 text-[8px] font-bold rounded border uppercase ${
                      b64Mode === "encode" ? "bg-wisteria/10 border-wisteria text-wisteria" : "border-mist text-ink/45 hover:text-ink"
                    }`}
                  >
                    Encode
                  </button>
                  <button
                    onClick={() => {
                      setB64Mode("decode");
                      handleB64Convert(b64Input, "decode");
                    }}
                    className={`px-2 py-0.5 text-[8px] font-bold rounded border uppercase ${
                      b64Mode === "decode" ? "bg-wisteria/10 border-wisteria text-wisteria" : "border-mist text-ink/45 hover:text-ink"
                    }`}
                  >
                    Decode
                  </button>
                </div>
              </div>

              <div className="grid gap-3.5 sm:grid-cols-2">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold uppercase text-ink/40 tracking-wider">Input String</span>
                  <textarea
                    value={b64Input}
                    onChange={(e) => handleB64Convert(e.target.value, b64Mode)}
                    placeholder="Enter plain text or base64 here..."
                    className="w-full h-24 p-2.5 text-4xs font-mono border border-mist bg-white rounded-xl outline-none focus:border-wisteria resize-none"
                  />
                </div>
                <div className="space-y-1 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase text-ink/40 tracking-wider">Output</span>
                    {b64Output && (
                      <button
                        onClick={() => copyToClipboard(b64Output, setCopiedB64)}
                        className="text-ink/45 hover:text-wisteria transition-colors"
                        title="Copy output"
                      >
                        {copiedB64 ? <Check className="h-3.5 w-3.5 text-emerald-500 animate-scale" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    )}
                  </div>
                  <div className="w-full h-24 p-2.5 text-4xs font-mono border border-mist bg-[#F8F8FC]/50 rounded-xl overflow-y-auto break-all">
                    {b64Output || <span className="text-ink/30 italic">Converted content will output here...</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Markdown Assistant */}
          {activeToolTab === "markdown" && (
            <div className="space-y-3.5">
              <span className="text-[10px] text-ink/45 font-semibold block">Quickly format task execution proof reports</span>
              <div className="grid gap-3.5 sm:grid-cols-12">
                <div className="sm:col-span-5 space-y-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-ink/40 tracking-wider">Task Title</label>
                    <input
                      type="text"
                      value={proofTitle}
                      onChange={(e) => setProofTitle(e.target.value)}
                      placeholder="e.g. Bugfix #233"
                      className="w-full px-3 py-1.5 text-4xs font-semibold border border-mist bg-white focus:border-wisteria rounded-lg outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-ink/40 tracking-wider">Git Branch</label>
                    <input
                      type="text"
                      value={proofBranch}
                      onChange={(e) => setProofBranch(e.target.value)}
                      placeholder="e.g. main"
                      className="w-full px-3 py-1.5 text-4xs font-semibold border border-mist bg-white focus:border-wisteria rounded-lg outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-ink/40 tracking-wider">Description</label>
                    <textarea
                      value={proofDesc}
                      onChange={(e) => setProofDesc(e.target.value)}
                      placeholder="Completed refactors..."
                      className="w-full h-14 p-2 text-4xs font-semibold border border-mist bg-white focus:border-wisteria rounded-lg outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="sm:col-span-7 space-y-1 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase text-ink/40 tracking-wider">Markdown Output</span>
                    <button
                      onClick={() => copyToClipboard(generatedMarkdown, setCopiedMd)}
                      className="text-ink/45 hover:text-wisteria transition-colors flex items-center gap-1 text-[9px] font-bold"
                    >
                      {copiedMd ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy Markdown</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="w-full h-36 p-3 text-[9px] font-mono border border-mist bg-[#F8F8FC]/50 rounded-xl overflow-y-auto text-ink/70 leading-normal select-all">
                    {generatedMarkdown}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Epoch/Clock Tool */}
          {activeToolTab === "epoch" && (
            <div className="space-y-4">
              <span className="text-[10px] text-ink/45 font-semibold block">Real-time local/UTC timestamp parameters for testing</span>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-3 border border-mist/65 bg-white/45 rounded-2xl space-y-1">
                  <div className="text-[8px] font-bold uppercase tracking-widest text-ink/45 flex items-center gap-1">
                    <Clock3 className="h-3 w-3 text-wisteria" /> Epoch Timestamp
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xs font-bold text-ink">{Math.floor(currentTime.getTime() / 1000)}</span>
                    <button
                      onClick={() => copyToClipboard(Math.floor(currentTime.getTime() / 1000).toString(), setCopiedEpoch)}
                      className="text-ink/40 hover:text-wisteria transition-colors"
                    >
                      {copiedEpoch ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 border border-mist/65 bg-white/45 rounded-2xl space-y-1">
                  <div className="text-[8px] font-bold uppercase tracking-widest text-ink/45 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-wisteria" /> Local Time (12h)
                  </div>
                  <span className="font-mono text-2xs font-bold text-ink">{currentTime.toLocaleTimeString()}</span>
                </div>

                <div className="p-3 border border-mist/65 bg-white/45 rounded-2xl space-y-1">
                  <div className="text-[8px] font-bold uppercase tracking-widest text-ink/45 flex items-center gap-1">
                    <Code className="h-3 w-3 text-wisteria" /> UTC ISO-8601
                  </div>
                  <span className="font-mono text-3xs font-extrabold text-ink truncate block" title={currentTime.toISOString()}>
                    {currentTime.toISOString().split("T")[0]}T{currentTime.toISOString().split("T")[1].slice(0,8)}Z
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-mist/35 flex items-center gap-1 text-[10px] text-ink/45 font-bold uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5 text-wisteria animate-pulse" />
          <span>Need help? Check active tasks guidelines</span>
        </div>
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TasksManager from "@/components/portal/tasks-manager";
import { Trophy, Star, ShieldCheck, Flame } from "lucide-react";

export const revalidate = 0; // Dynamic tasks page

export default async function TasksPage() {
  const supabase = await createClient();

  // 1. Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Fetch member profile with xp and role
  const { data: member } = await supabase
    .from("members")
    .select("id, full_name, codator_id, department, batch_year, position, status, xp, role")
    .or(`user_id.eq.${user.id},email.eq.${user.email}`)
    .single();

  if (!member || member.status !== "active") {
    redirect("/portal");
  }

  // 3. Fetch count of checked-in events to calculate level correctly
  const { count: checkedInCount } = await supabase
    .from("event_registrations")
    .select("*", { count: "exact", head: true })
    .eq("member_id", member.id)
    .not("checked_in_at", "is", null);

  const attendedCount = checkedInCount || 0;
  const totalXp = 100 + (member.xp || 0) + attendedCount * 200;
  const currentLevel = Math.floor(totalXp / 500) + 1;
  const xpInLevel = totalXp % 500;
  const xpNeeded = 500;
  const xpPercent = Math.min((xpInLevel / xpNeeded) * 100, 100);

  return (
    <div className="space-y-8 text-ink">
      {/* Welcome & Dashboard header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Tasks & Sprints Hub
        </h1>
        <p className="text-sm text-ink/65">
          View assigned duties, submit work details, or distribute tasks to members in your department.
        </p>
      </div>

      {/* Gamification summary in tasks page */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Level Box */}
        <div className="border border-white/80 bg-white/40 backdrop-blur-md rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="rounded-xl bg-wisteria-tint/40 p-2.5 text-wisteria border border-wisteria/10">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-ink/40">XP standing</div>
            <div className="text-base font-black text-ink">Level {currentLevel}</div>
          </div>
        </div>

        {/* Current XP Progress */}
        <div className="border border-white/80 bg-white/40 backdrop-blur-md rounded-2xl p-5 shadow-xs flex flex-col justify-between md:col-span-2 gap-3">
          <div className="flex justify-between text-5xs font-bold uppercase tracking-widest text-ink/60">
            <span>{totalXp} Total XP ({xpInLevel} / {xpNeeded} inside level)</span>
            <span className="text-wisteria">{Math.round(xpPercent)}% to Level {currentLevel + 1}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-mist/40 overflow-hidden border border-mist/20">
            <div 
              className="h-full bg-gradient-to-r from-wisteria to-skyline rounded-full transition-all duration-500" 
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tasks Manager Client Panel */}
      <TasksManager currentMember={member} />
    </div>
  );
}

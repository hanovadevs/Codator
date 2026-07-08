import { createClient } from "@/lib/supabase/server";
import XpManagerClient from "@/components/admin/xp-manager-client";
import { redirect } from "next/navigation";

export const revalidate = 0; // Dynamic page

export default async function AdminXpPage() {
  const supabase = await createClient();

  // 1. Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // 2. Query member profile to check administrative privileges
  const { data: currentMember, error: authError } = await supabase
    .from("members")
    .select("role, status, position")
    .or(`user_id.eq.${user.id},email.eq.${user.email}`)
    .maybeSingle();

  if (authError || !currentMember || currentMember.status !== "active") {
    redirect("/admin/login");
  }

  const posLower = currentMember.position.toLowerCase();
  const isAdmin = currentMember.role === "admin" || posLower.includes("president") || posLower.includes("mentor");

  if (!isAdmin) {
    return (
      <div className="p-8 text-center text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-3xl">
        Forbidden. Administrative access required.
      </div>
    );
  }

  // 3. Fetch active members (excluding pending)
  const { data: members, error: membersError } = await supabase
    .from("members")
    .select("id, full_name, codator_id, department, position, status, xp")
    .neq("status", "pending")
    .order("xp", { ascending: false })
    .range(0, 4999);

  if (membersError) {
    console.error("Error fetching members for XP list:", membersError);
  }

  // 4. Fetch tasks to compute completed count map
  const { data: tasks } = await supabase
    .from("tasks")
    .select("assigned_to")
    .eq("status", "completed");

  const completedCounts: Record<string, number> = {};
  tasks?.forEach((t) => {
    completedCounts[t.assigned_to] = (completedCounts[t.assigned_to] || 0) + 1;
  });

  return (
    <XpManagerClient
      initialMembers={members || []}
      completedCounts={completedCounts}
    />
  );
}

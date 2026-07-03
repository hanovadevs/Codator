import { createClient } from "@/lib/supabase/server";
import MembersClient from "@/components/admin/members-client";

export const revalidate = 0; // Dynamic members list

export default async function AdminMembersPage() {
  const supabase = await createClient();

  // Fetch only non-pending members (active, suspended, rejected)
  // Pending applications are handled in the Applications page
  // Use a large range to overcome Supabase's default 1000 row limit
  const { data: members, error } = await supabase
    .from("members")
    .select(
      "id, full_name, university_roll, department, batch_year, email, phone, why_join, skills, status, codator_id, role, position, applied_at, approved_at"
    )
    .neq("status", "pending")
    .order("applied_at", { ascending: false })
    .range(0, 4999);

  if (error) {
    console.error("Error fetching members:", error);
  }

  return <MembersClient initialMembers={members || []} />;
}

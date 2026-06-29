import { createClient } from "@/lib/supabase/server";
import MembersClient from "@/components/admin/members-client";

export const revalidate = 0; // Dynamic members list

export default async function AdminMembersPage() {
  const supabase = await createClient();

  // Fetch all members from the database
  const { data: members, error } = await supabase
    .from("members")
    .select(
      "id, full_name, university_roll, department, batch_year, email, phone, why_join, skills, status, codator_id, role, position, applied_at, approved_at"
    )

    .order("applied_at", { ascending: false });

  if (error) {
    console.error("Error fetching members:", error);
  }

  return <MembersClient initialMembers={members || []} />;
}

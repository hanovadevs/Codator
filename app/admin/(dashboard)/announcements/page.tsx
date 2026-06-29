import { createClient } from "@/lib/supabase/server";
import AnnouncementsClient from "@/components/admin/announcements-client";

export const revalidate = 0; // Dynamic announcements page

export default async function AdminAnnouncementsPage() {
  const supabase = await createClient();

  // Fetch announcements with the creator's name
  const { data: announcements, error } = await supabase
    .from("announcements")
    .select(`
      id,
      title,
      content,
      category,
      created_at,
      created_by
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching announcements:", error);
  }

  return <AnnouncementsClient initialAnnouncements={announcements || []} />;
}

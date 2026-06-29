import { createClient } from "@/lib/supabase/server";
import ApplicationsClient from "@/components/admin/applications-client";

export const revalidate = 0; // Disable caching so the admin always sees fresh data

export default async function AdminApplicationsPage() {
  const supabase = await createClient();

  // Fetch pending applications
  const { data: applications, error } = await supabase
    .from("members")
    .select("id, full_name, university_roll, department, batch_year, email, phone, why_join, skills, applied_at")
    .eq("status", "pending")
    .order("applied_at", { ascending: false });

  if (error) {
    console.error("Error fetching applications:", error);
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
        <h2 className="font-bold">Error</h2>
        <p className="text-sm mt-1">Failed to load membership applications. Please try again later.</p>
      </div>
    );
  }

  // Cast nulls to empty arrays/objects to prevent TypeScript warnings in client component
  const formattedApplications = (applications || []).map((app) => ({
    ...app,
    skills: app.skills || [],
  }));

  return <ApplicationsClient initialApplications={formattedApplications} />;
}

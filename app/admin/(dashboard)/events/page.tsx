import { createClient } from "@/lib/supabase/server";
import EventsClient from "@/components/admin/events-client";

export const revalidate = 0; // Always fetch fresh events

export default async function AdminEventsPage() {
  const supabase = await createClient();

  // Fetch all events sorted by start date
  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .order("date_start", { ascending: false });

  if (error) {
    console.error("Error fetching events:", error);
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
        <h2 className="font-bold">Error</h2>
        <p className="text-sm mt-1">Failed to load events. Please try again later.</p>
      </div>
    );
  }

  return <EventsClient initialEvents={events || []} />;
}

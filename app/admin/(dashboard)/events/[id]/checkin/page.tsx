import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CheckInClient from "@/components/admin/checkin-client";

export const revalidate = 0; // Dynamic check-in page

interface AdminCheckInPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminCheckInPage({ params }: AdminCheckInPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch event details
  const { data: event, error } = await supabase
    .from("events")
    .select("id, title, location")
    .eq("id", id)
    .maybeSingle();

  if (error || !event) {
    notFound();
  }

  return <CheckInClient event={event} />;
}

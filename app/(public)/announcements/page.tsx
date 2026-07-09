import { createClient } from "@/lib/supabase/server";
import PublicAnnouncementsClient from "@/components/public/public-announcements-client";
import { Megaphone, Sparkles } from "lucide-react";

export const revalidate = 0; // Always serve fresh announcements

export default async function PublicAnnouncementsPage() {
  const supabase = await createClient();

  // Fetch all announcements
  const { data: announcements, error } = await supabase
    .from("announcements")
    .select("id, title, content, category, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching announcements for public page:", error);
  }

  return (
    <div className="min-h-screen bg-[#F8F8FC] pt-28 pb-20 text-ink">
      <title>Announcements & Notices | CODATOR</title>
      <meta
        name="description"
        content="Read official announcements, urgent notices, opportunities, and event updates from the CODATOR Computer Science & Engineering society."
      />

      {/* Soft background glow */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute -top-[10%] left-[15%] w-[40vw] h-[40vw] rounded-full bg-wisteria/5 blur-[100px]" />
        <div className="absolute top-[40%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-skyline/5 blur-[90px]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/45 backdrop-blur-md px-3 py-0.5 text-5xs font-bold uppercase tracking-widest text-wisteria shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
            <Sparkles className="h-3.5 w-3.5" />
            Society Board
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-ink flex items-center gap-3">
            <Megaphone className="h-8 w-8 text-wisteria" />
            Official Broadcasts
          </h1>
          <p className="text-xs sm:text-sm leading-relaxed text-ink/75 font-semibold">
            Stay up to date with the latest society announcements, events, internships, and urgent notifications.
          </p>
        </div>

        {/* Public Announcements Manager */}
        <PublicAnnouncementsClient initialAnnouncements={announcements || []} />
      </div>
    </div>
  );
}

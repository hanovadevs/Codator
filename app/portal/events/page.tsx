import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Calendar, MapPin, CheckCircle, ArrowRight } from "lucide-react";

export const revalidate = 0; // Always fetch fresh registrations

export default async function PortalEventsPage() {
  const supabase = await createClient();

  // 1. Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. Fetch member profile
  const { data: member } = await supabase
    .from("members")
    .select("id")
    .or(`user_id.eq.${user?.id},email.eq.${user?.email}`)
    .single();

  if (!member) {
    return null;
  }

  // 3. Query member's event registrations
  const { data: registrations, error } = await supabase
    .from("event_registrations")
    .select(`
      registered_at,
      events (
        id,
        title,
        slug,
        category,
        date_start,
        location
      )
    `)
    .eq("member_id", member.id)
    .order("registered_at", { ascending: false });

  if (error) {
    console.error("Error fetching member registrations:", error);
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
        <h2 className="font-bold">Error</h2>
        <p className="text-sm mt-1">Failed to load your event registrations. Please try again later.</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-8 text-ink">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">My Events</h1>
        <p className="text-sm text-ink/65">Track all the hackathons, workshops, and seminars you are attending.</p>
      </div>

      {/* Registrations List */}
      {!registrations || registrations.length === 0 ? (
        <div className="border border-dashed border-mist rounded-2xl p-16 text-center text-ink/50 bg-paper/30 max-w-xl mx-auto">
          <Calendar className="mx-auto h-12 w-12 text-ink/30 mb-4" />
          <h3 className="font-display text-lg font-bold text-ink">No registrations yet</h3>
          <p className="text-sm text-ink/50 mt-1 mb-6">You haven't registered for any society events yet.</p>
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 rounded-lg bg-wisteria px-4 py-2 text-sm font-semibold text-paper hover:bg-wisteria/90 transition-colors cursor-pointer"
          >
            <span>Browse Upcoming Events</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="max-w-4xl space-y-4">
          {registrations.map((reg: any) => {
            const event = reg.events;
            if (!event) return null;

            return (
              <div
                key={event.id}
                className="group border border-mist bg-paper/30 p-5 rounded-2xl shadow-sm hover:border-wisteria/35 hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-wisteria-tint/50 border border-wisteria/10 px-2 py-0.5 text-4xs font-bold uppercase tracking-wider text-wisteria">
                      {event.category}
                    </span>
                    <span className="text-4xs text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Registered
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-ink group-hover:text-wisteria transition-colors line-clamp-1">
                    {event.title}
                  </h3>
                  
                  <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-ink/70">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-ink/30" />
                      <span>{formatDate(event.date_start)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-ink/30" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 border-mist/30 pt-3 sm:pt-0">
                  <div className="text-3xs text-ink/50">
                    Registered on: <span className="font-semibold">{new Date(reg.registered_at).toLocaleDateString()}</span>
                  </div>
                  <Link
                    href={`/events/${event.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-wisteria hover:underline"
                  >
                    <span>View Event Details</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { IdCard, Calendar, ArrowRight, Award, Flame, Zap } from "lucide-react";

export const revalidate = 0;

export default async function PortalDashboardPage() {
  const supabase = await createClient();

  // 1. Get user and member details
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: member } = await supabase
    .from("members")
    .select("id, full_name, codator_id, department, batch_year")
    .or(`user_id.eq.${user?.id},email.eq.${user?.email}`)
    .single();

  if (!member) {
    return null;
  }

  // 2. Fetch count of registered events
  const { count: regCount } = await supabase
    .from("event_registrations")
    .select("*", { count: "exact", head: true })
    .eq("member_id", member.id);

  // 3. Fetch next 2 upcoming public events
  const { data: upcomingEvents } = await supabase
    .from("events")
    .select("id, title, category, date_start, slug")
    .eq("is_published", true)
    .gt("date_start", new Date().toISOString())
    .order("date_start", { ascending: true })
    .limit(2);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-10 text-ink">
      {/* Welcome Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Welcome back, <span className="text-wisteria">{member.full_name}</span>!
        </h1>
        <p className="text-sm text-ink/65">
          Manage your membership, view your digital pass, and register for upcoming events.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Stat 1: ID Card */}
        <div className="group border border-mist bg-paper/30 p-6 rounded-2xl shadow-sm flex flex-col justify-between hover:border-wisteria/30 transition-all duration-350">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-2xs font-bold uppercase tracking-wider text-ink/50">Membership</span>
              <h3 className="text-lg font-bold text-ink">Digital ID Card</h3>
            </div>
            <div className="rounded-lg bg-wisteria-tint p-2 text-wisteria border border-wisteria/10">
              <IdCard className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-6">
            <div className="text-xs text-ink/50">Your ID:</div>
            <div className="text-lg font-bold text-wisteria font-mono tracking-wide mt-0.5">
              {member.codator_id}
            </div>
            <Link
              href="/portal/id-card"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-wisteria hover:underline"
            >
              <span>View Card & Pass</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Stat 2: Registered Events */}
        <div className="group border border-mist bg-paper/30 p-6 rounded-2xl shadow-sm flex flex-col justify-between hover:border-wisteria/30 transition-all duration-350">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-2xs font-bold uppercase tracking-wider text-ink/50">Attendance</span>
              <h3 className="text-lg font-bold text-ink">My Registered Events</h3>
            </div>
            <div className="rounded-lg bg-wisteria-tint p-2 text-wisteria border border-wisteria/10">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-6">
            <div className="text-xs text-ink/50">Total Registrations:</div>
            <div className="text-2xl font-black text-ink mt-0.5">
              {regCount || 0}
            </div>
            <Link
              href="/portal/events"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-wisteria hover:underline"
            >
              <span>View My Schedule</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Stat 3: Society Role */}
        <div className="group border border-mist bg-paper/30 p-6 rounded-2xl shadow-sm flex flex-col justify-between hover:border-wisteria/30 transition-all duration-350">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-2xs font-bold uppercase tracking-wider text-ink/50">Affiliation</span>
              <h3 className="text-lg font-bold text-ink">CODATOR Society</h3>
            </div>
            <div className="rounded-lg bg-wisteria-tint p-2 text-wisteria border border-wisteria/10">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-6">
            <div className="text-xs text-ink/50">Department & Batch:</div>
            <div className="text-sm font-semibold text-ink mt-1.5">
              {member.department} ({member.batch_year})
            </div>
            <div className="text-2xs font-bold uppercase tracking-wider text-emerald-600 mt-2 flex items-center gap-1">
              <Zap className="h-3 w-3 fill-emerald-600" />
              Active Status
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Section */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column: Quick Actions */}
        <div className="border border-mist rounded-2xl bg-paper/30 p-6 space-y-6">
          <h3 className="font-display text-lg font-bold border-b border-mist pb-3 flex items-center gap-2">
            <Flame className="h-4.5 w-4.5 text-wisteria" />
            Quick Actions
          </h3>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/portal/id-card"
              className="flex flex-col justify-between rounded-xl border border-mist bg-paper/50 p-4 hover:border-wisteria/40 hover:bg-wisteria-tint/10 transition-all"
            >
              <span className="text-xs font-bold text-ink">Access Event Pass</span>
              <span className="text-3xs text-ink/50 mt-1">Scan QR code at event entrances.</span>
            </Link>
            
            <Link
              href="/events"
              className="flex flex-col justify-between rounded-xl border border-mist bg-paper/50 p-4 hover:border-wisteria/40 hover:bg-wisteria-tint/10 transition-all"
            >
              <span className="text-xs font-bold text-ink">Browse Events</span>
              <span className="text-3xs text-ink/50 mt-1">Register for hackathons and workshops.</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Upcoming Events */}
        <div className="border border-mist rounded-2xl bg-paper/30 p-6 space-y-6">
          <h3 className="font-display text-lg font-bold border-b border-mist pb-3 flex items-center gap-2">
            <Calendar className="h-4.5 w-4.5 text-wisteria" />
            What's Coming Up
          </h3>

          {upcomingEvents && upcomingEvents.length > 0 ? (
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between rounded-xl border border-mist bg-paper/50 p-4"
                >
                  <div>
                    <span className="text-4xs font-bold uppercase tracking-wider text-wisteria bg-wisteria-tint/40 border border-wisteria/10 px-2 py-0.5 rounded">
                      {event.category}
                    </span>
                    <h4 className="text-xs font-bold text-ink mt-1.5 line-clamp-1">{event.title}</h4>
                    <span className="text-3xs text-ink/50 mt-0.5 block">{formatDate(event.date_start)}</span>
                  </div>
                  <Link
                    href={`/events/${event.slug}`}
                    className="rounded-lg bg-wisteria px-3 py-1.5 text-2xs font-bold text-paper hover:bg-wisteria/90 transition-colors"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-ink/50 italic text-center py-4">No upcoming events scheduled right now.</p>
          )}
        </div>
      </div>
    </div>
  );
}

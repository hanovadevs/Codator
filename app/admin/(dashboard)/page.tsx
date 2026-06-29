import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Users, ClipboardList, Calendar, MapPin, ArrowRight, UserPlus, ShieldCheck } from "lucide-react";

export const revalidate = 0; // Always fetch fresh data for admin overview

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  // 1. Fetch count of pending applications
  const { count: pendingCount } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  // 2. Fetch count of active members
  const { count: activeCount } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  // 3. Fetch count of upcoming events
  const { count: upcomingCount } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .gte("date_start", new Date().toISOString());

  // 4. Fetch 5 most recent applications
  const { data: recentApplications } = await supabase
    .from("members")
    .select("id, full_name, email, department, status, applied_at")
    .order("applied_at", { ascending: false })
    .limit(5);

  // 5. Fetch 3 next upcoming events
  const { data: upcomingEvents } = await supabase
    .from("events")
    .select("id, title, date_start, location")
    .gte("date_start", new Date().toISOString())
    .order("date_start", { ascending: true })
    .limit(3);

  // 6. Fetch active members for department distribution
  const { data: activeMembers } = await supabase
    .from("members")
    .select("department")
    .eq("status", "active");

  // Calculate department distribution
  const deptCounts: Record<string, number> = {};
  activeMembers?.forEach((m) => {
    const dept = m.department || "Other";
    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
  });

  const totalActive = activeCount || 0;
  const deptDistribution = Object.entries(deptCounts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: totalActive > 0 ? Math.round((count / totalActive) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-8 text-ink">
      <div>
        <h1 className="font-display text-3xl font-black tracking-tight text-ink">Admin Dashboard</h1>
        <p className="text-xs text-ink/65 mt-1.5">Real-time overview of the CODATOR society operations.</p>
      </div>

      {/* 1. METRICS GRID */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {/* Pending Applications Card */}
        <div className="border border-mist rounded-2xl p-6 bg-white/50 backdrop-blur-xs shadow-xs hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-wisteria/5 translate-x-6 -translate-y-6 group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between">
            <h3 className="text-4xs font-bold text-ink/50 uppercase tracking-widest">Pending Requests</h3>
            <span className="p-2 rounded-lg bg-wisteria-tint/30 text-wisteria border border-wisteria/10">
              <ClipboardList className="h-5 w-5" />
            </span>
          </div>
          <p className="text-3xl font-display font-black text-ink mt-4">{pendingCount || 0}</p>
          <div className="mt-4 pt-3 border-t border-mist/50 flex justify-between items-center text-4xs font-semibold">
            <span className="text-ink/60">Requires review</span>
            <Link href="/admin/applications" className="text-wisteria hover:underline flex items-center gap-0.5">
              <span>Review now</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Active Members Card */}
        <div className="border border-mist rounded-2xl p-6 bg-white/50 backdrop-blur-xs shadow-xs hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-skyline/5 translate-x-6 -translate-y-6 group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between">
            <h3 className="text-4xs font-bold text-ink/50 uppercase tracking-widest">Active Members</h3>
            <span className="p-2 rounded-lg bg-skyline-tint/30 text-skyline border border-skyline/10">
              <Users className="h-5 w-5" />
            </span>
          </div>
          <p className="text-3xl font-display font-black text-ink mt-4">{activeCount || 0}</p>
          <div className="mt-4 pt-3 border-t border-mist/50 flex justify-between items-center text-4xs font-semibold">
            <span className="text-ink/60">Registered members</span>
            <Link href="/admin/members" className="text-skyline hover:underline flex items-center gap-0.5">
              <span>View directory</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Upcoming Events Card */}
        <div className="border border-mist rounded-2xl p-6 bg-white/50 backdrop-blur-xs shadow-xs hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-ember/5 translate-x-6 -translate-y-6 group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between">
            <h3 className="text-4xs font-bold text-ink/50 uppercase tracking-widest">Upcoming Events</h3>
            <span className="p-2 rounded-lg bg-ember-tint/20 text-ember border border-ember/10">
              <Calendar className="h-5 w-5" />
            </span>
          </div>
          <p className="text-3xl font-display font-black text-ink mt-4">{upcomingCount || 0}</p>
          <div className="mt-4 pt-3 border-t border-mist/50 flex justify-between items-center text-4xs font-semibold">
            <span className="text-ink/60">Next 30 days</span>
            <Link href="/admin/events" className="text-ember hover:underline flex items-center gap-0.5">
              <span>Manage events</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. RECENT ACTIVITY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Applications List */}
        <div className="border border-mist rounded-3xl bg-white/40 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-mist/60 pb-4 mb-5">
              <h3 className="font-display text-base font-bold text-ink flex items-center gap-2">
                <UserPlus className="h-4.5 w-4.5 text-wisteria" />
                <span>Recent Applications</span>
              </h3>
              <Link href="/admin/applications" className="text-5xs font-bold uppercase tracking-wider text-wisteria hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {!recentApplications || recentApplications.length === 0 ? (
                <div className="text-center py-10 text-xs text-ink/50 font-medium">
                  No applications received yet.
                </div>
              ) : (
                recentApplications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between bg-paper/50 border border-mist/50 rounded-xl p-3.5 hover:bg-paper transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-wisteria-tint/40 text-wisteria border border-wisteria/10 flex items-center justify-center font-bold text-xs">
                        {app.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-ink leading-tight">{app.full_name}</h4>
                        <span className="text-5xs font-medium text-ink/50 block mt-0.5">{app.department} • {app.email}</span>
                      </div>
                    </div>
                    <span
                      className={`text-5xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        app.status === "pending"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : app.status === "active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Events List */}
        <div className="border border-mist rounded-3xl bg-white/40 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-mist/60 pb-4 mb-5">
              <h3 className="font-display text-base font-bold text-ink flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-ember" />
                <span>Upcoming Schedule</span>
              </h3>
              <Link href="/admin/events" className="text-5xs font-bold uppercase tracking-wider text-ember hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {!upcomingEvents || upcomingEvents.length === 0 ? (
                <div className="text-center py-10 text-xs text-ink/50 font-medium">
                  No upcoming events scheduled.
                </div>
              ) : (
                upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between bg-paper/50 border border-mist/50 rounded-xl p-3.5 hover:bg-paper transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-ember-tint/25 text-ember border border-ember/10 flex items-center justify-center font-bold text-xs">
                        <Calendar className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-ink leading-tight">{event.title}</h4>
                        <span className="text-5xs font-medium text-ink/50 block mt-0.5 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-wisteria" />
                          <span>{event.location} • {new Date(event.date_start).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/admin/events/${event.id}/checkin`}
                      className="text-5xs font-bold uppercase tracking-wider bg-wisteria text-paper px-3 py-1.5 rounded-lg hover:bg-wisteria/90 transition-colors"
                    >
                      Check-In
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. DEPARTMENT DISTRIBUTION */}
      {totalActive > 0 && deptDistribution.length > 0 && (
        <div className="border border-mist rounded-3xl bg-white/40 p-6 shadow-xs">
          <h3 className="font-display text-base font-bold text-ink flex items-center gap-2 border-b border-mist/60 pb-4 mb-5">
            <ShieldCheck className="h-4.5 w-4.5 text-skyline" />
            <span>Active Member Department Distribution</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {deptDistribution.map((dept) => (
              <div key={dept.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-ink/80">
                  <span>{dept.name}</span>
                  <span className="text-ink/50">{dept.count} {dept.count === 1 ? "member" : "members"} ({dept.percentage}%)</span>
                </div>
                <div className="h-2 w-full bg-mist/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-skyline rounded-full"
                    style={{ width: `${dept.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

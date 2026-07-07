import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { IdCard, Calendar, ArrowRight, Award, Flame, Zap, Megaphone, Info, AlertTriangle, Briefcase, Trophy, Star, ShieldCheck } from "lucide-react";

export const revalidate = 0; // Dynamic dashboard

export default async function PortalDashboardPage() {
  const supabase = await createClient();

  // 1. Get user and member details (including position, role, and xp)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: member } = await supabase
    .from("members")
    .select("id, full_name, codator_id, department, batch_year, position, status, xp, role")
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

  // 3. Fetch count of checked-in events (attended)
  const { count: checkedInCount } = await supabase
    .from("event_registrations")
    .select("*", { count: "exact", head: true })
    .eq("member_id", member.id)
    .not("checked_in_at", "is", null);

  // 4. Fetch next 2 upcoming public events
  const { data: upcomingEvents } = await supabase
    .from("events")
    .select("id, title, category, date_start, slug")
    .eq("is_published", true)
    .gt("date_start", new Date().toISOString())
    .order("date_start", { ascending: true })
    .limit(2);

  // 5. Fetch latest 3 announcements
  const { data: announcements } = await supabase
    .from("announcements")
    .select("id, title, content, category, created_at")
    .order("created_at", { ascending: false })
    .limit(3);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Icon mapping for announcements
  const getAnnouncementIcon = (category: string) => {
    switch (category) {
      case "urgent":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "opportunity":
        return <Briefcase className="h-4 w-4 text-emerald-600" />;
      case "event":
        return <Calendar className="h-4 w-4 text-purple-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getAnnouncementBadgeClass = (category: string) => {
    switch (category) {
      case "urgent":
        return "bg-red-50 text-red-700 border-red-200";
      case "opportunity":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "event":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  // Helper to format society position display
  const getDisplayPosition = (pos: string, dept: string) => {
    if (!pos) return "Member";
    let clean = pos
      .replace(/::\w+/g, "") // Remove ::text
      .replace(/'/g, "")     // Remove single quotes
      .replace(/"/g, "")     // Remove double quotes
      .trim();
    if (!clean || clean.toLowerCase() === "member") {
      clean = "Member";
    } else {
      clean = clean.charAt(0).toUpperCase() + clean.slice(1);
    }

    if (["Director", "Head", "Co-Head"].includes(clean)) {
      return `${clean} of ${dept}`;
    }
    return clean;
  };

  // Gamification Calculations
  const attendedCount = checkedInCount || 0;
  const totalXp = 100 + (member.xp || 0) + attendedCount * 200;
  const currentLevel = Math.floor(totalXp / 500) + 1;
  const xpInLevel = totalXp % 500;
  const xpNeeded = 500;
  const xpPercent = Math.min((xpInLevel / xpNeeded) * 100, 100);

  // Achievements Configuration
  const achievements = [
    {
      id: "verified",
      title: "Official Member",
      desc: "Account is active",
      unlocked: member.status === "active",
      icon: ShieldCheck,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      id: "first_reg",
      title: "First Step",
      desc: "Registered for an event",
      unlocked: (regCount || 0) >= 1,
      icon: Star,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      id: "first_checkin",
      title: "Attendee",
      desc: "Attended 1 event",
      unlocked: attendedCount >= 1,
      icon: Trophy,
      color: "text-purple-600 bg-purple-50 border-purple-200",
    },
    {
      id: "veteran",
      title: "Enthusiast",
      desc: "Attended 3+ events",
      unlocked: attendedCount >= 3,
      icon: Zap,
      color: "text-skyline bg-skyline-tint/30 border-skyline/20",
    },
  ];

  return (
    <div className="space-y-10 text-ink">
      {/* Welcome Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Welcome back, <span className="text-wisteria">{member.full_name}</span>!
        </h1>
        <p className="text-sm text-ink/65">
          Manage your membership, view your digital pass, and stay updated with society announcements.
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

        {/* Stat 3: Society Position */}
        <div className="group border border-mist bg-paper/30 p-6 rounded-2xl shadow-sm flex flex-col justify-between hover:border-wisteria/30 transition-all duration-350">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-2xs font-bold uppercase tracking-wider text-ink/50">Affiliation</span>
              <h3 className="text-lg font-bold text-ink">{getDisplayPosition(member.position, member.department)}</h3>
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

      {/* Gamification & Achievements Section */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* XP Progress Card */}
        <div className="md:col-span-5 border border-white/80 bg-white/40 backdrop-blur-md rounded-3xl p-6 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-wisteria-tint/50 p-2 text-wisteria border border-wisteria/10">
                <Trophy className="h-4.5 w-4.5 animate-bounce" />
              </div>
              <div>
                <span className="text-5xs font-bold uppercase tracking-widest text-ink/40">Member Standing</span>
                <h3 className="text-sm font-bold text-ink leading-tight">XP Level {currentLevel}</h3>
              </div>
            </div>
            <p className="text-5xs text-ink/65 font-semibold">Attend events to earn XP and level up your standing!</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-5xs font-bold uppercase tracking-widest text-ink/60">
              <span>{xpInLevel} / {xpNeeded} XP</span>
              <span className="text-wisteria">{Math.round(xpPercent)}% Complete</span>
            </div>
            <div className="w-full h-2 rounded-full bg-mist/40 overflow-hidden border border-mist/20">
              <div 
                className="h-full bg-gradient-to-r from-wisteria to-skyline rounded-full transition-all duration-500" 
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="md:col-span-7 border border-white/80 bg-white/40 backdrop-blur-md rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="font-display text-xs font-bold text-ink uppercase tracking-wider border-b border-mist/30 pb-2">My Achievements</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {achievements.map((ach) => {
              const Icon = ach.icon;
              return (
                <div 
                  key={ach.id}
                  className={`flex flex-col items-center text-center p-3.5 rounded-2xl border transition-all duration-300 ${
                    ach.unlocked 
                      ? `${ach.color} shadow-3xs hover:-translate-y-0.5` 
                      : "bg-mist/15 border-mist/30 text-ink/30 opacity-50"
                  }`}
                >
                  <div className={`rounded-xl p-2 border ${ach.unlocked ? "border-current/10 bg-white/60" : "border-mist/30 bg-mist/10"} mb-3`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="text-5xs font-bold leading-tight mb-1">{ach.title}</h4>
                  <p className="text-6xs font-semibold text-ink/50 leading-tight">{ach.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Announcements Broadcast Section */}
      <div className="border border-mist rounded-3xl bg-paper/30 p-6 space-y-6">
        <h3 className="font-display text-lg font-bold border-b border-mist pb-3 flex items-center gap-2">
          <Megaphone className="h-4.5 w-4.5 text-wisteria" />
          <span>Announcements Broadcast</span>
        </h3>

        {!announcements || announcements.length === 0 ? (
          <p className="text-xs text-ink/50 italic text-center py-4">No society announcements posted recently.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="flex flex-col justify-between rounded-2xl border border-mist bg-paper/50 p-5 space-y-3 shadow-xs hover:shadow-md transition-all duration-300"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-0.5 text-5xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${getAnnouncementBadgeClass(ann.category)}`}>
                      {getAnnouncementIcon(ann.category)}
                      {ann.category}
                    </span>
                    <span className="text-5xs font-semibold text-ink/40">
                      {new Date(ann.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-ink line-clamp-1 leading-snug">{ann.title}</h4>
                  <p className="text-4xs font-semibold text-ink/65 leading-relaxed line-clamp-4 whitespace-pre-wrap">{ann.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
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
            {"What's Coming Up"}
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

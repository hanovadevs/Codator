import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Calendar, MapPin, ArrowRight, Image as ImageIcon, Sparkles, AlertCircle, Clock } from "lucide-react";

export const metadata = {
  title: "Society Events & Hackathons | CODATOR",
  description: "Browse and register for upcoming CODATOR hackathons, workshops, guest lectures, and networking sessions.",
};

export const revalidate = 0; // Serve fresh events

export default async function PublicEventsPage() {
  const supabase = await createClient();

  // Fetch only published events
  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .eq("is_published", true)
    .order("date_start", { ascending: true });

  if (error) {
    console.error("Error fetching public events:", error);
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isEventPast = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const getCategoryConfig = (category: string) => {
    switch (category?.toLowerCase()) {
      case "hackathon":
        return {
          badge: "bg-pink-500/10 text-pink-700 border-pink-200/50",
          accent: "from-pink-500 to-rose-500",
          label: "Hackathon",
        };
      case "workshop":
        return {
          badge: "bg-purple-500/10 text-purple-700 border-purple-200/50",
          accent: "from-purple-500 to-indigo-500",
          label: "Workshop",
        };
      case "seminar":
        return {
          badge: "bg-skyline-tint/30 text-skyline border-skyline/20",
          accent: "from-skyline to-blue-500",
          label: "Seminar",
        };
      default:
        return {
          badge: "bg-amber-500/10 text-amber-700 border-amber-200/50",
          accent: "from-amber-500 to-orange-500",
          label: "Social",
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8FC] pt-28 pb-20 text-ink">
      {/* Soft background glow */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute -top-[10%] left-[15%] w-[40vw] h-[40vw] rounded-full bg-wisteria/5 blur-[100px]" />
        <div className="absolute top-[40%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-skyline/5 blur-[90px]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/45 backdrop-blur-md px-3.5 py-1 text-5xs font-bold uppercase tracking-widest text-wisteria shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
            <Sparkles className="h-3.5 w-3.5 text-wisteria" />
            Join Our Initiatives
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-ink">
            Upcoming & Past{" "}
            <span className="bg-gradient-to-r from-wisteria to-skyline bg-clip-text text-transparent">
              Events
            </span>
          </h1>
          <p className="text-xs sm:text-sm leading-relaxed text-ink/75 font-semibold">
            Participate in our hands-on workshops, competitive hackathons, guest lectures, and networking sessions.
          </p>
        </div>

        {/* Events Grid */}
        {events && events.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const isPast = isEventPast(event.date_start);
              const config = getCategoryConfig(event.category);
              return (
                <div
                  key={event.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-mist bg-white/40 shadow-3xs hover:shadow-md hover:border-wisteria/20 transition-all duration-300 h-[480px]"
                >
                  {/* Banner image block */}
                  <div className="relative h-48 w-full bg-wisteria-tint/15 overflow-hidden border-b border-mist/40">
                    {event.banner_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={event.banner_url}
                        alt={event.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-103"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-wisteria/35" />
                      </div>
                    )}
                    
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className={`rounded-lg bg-white/95 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${config.badge}`}>
                        {config.label}
                      </span>
                      {isPast && (
                        <span className="rounded-lg bg-ink/70 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-paper">
                          Concluded
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div className="space-y-2.5">
                      <h3 className="font-display text-base font-black text-ink group-hover:text-wisteria transition-colors leading-snug line-clamp-1">
                        {event.title}
                      </h3>
                      <p className="text-4xs font-semibold text-ink/65 leading-relaxed line-clamp-3">
                        {event.description}
                      </p>
                    </div>

                    <div className="mt-6 space-y-2.5 border-t border-mist/35 pt-5 text-4xs text-ink/75 font-semibold">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-ink/35" />
                        <span>{formatDate(event.date_start)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-ink/35" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="bg-white/45 border-t border-mist/45 px-6 py-4 shrink-0">
                    <Link
                      href={`/events/${event.slug}`}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-wisteria hover:bg-wisteria/90 px-4 py-2.5 text-center text-4xs font-bold text-paper transition-all duration-200 cursor-pointer active:scale-[0.98] shadow-3xs"
                    >
                      <span>{isPast ? "View Details" : "Register For Event"}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center border border-dashed border-mist rounded-3xl p-16 bg-white/20 max-w-md mx-auto space-y-3">
            <Calendar className="mx-auto h-10 w-10 text-ink/30 animate-pulse" />
            <h3 className="font-display text-base font-black text-ink">No Scheduled Activities</h3>
            <p className="text-4xs text-ink/50 leading-relaxed font-semibold">
              We are working hard to schedule new system designs, hackathons, and lectures. Check back shortly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

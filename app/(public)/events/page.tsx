import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Calendar, MapPin, ArrowRight, Image as ImageIcon } from "lucide-react";

export const metadata = {
  title: "Society Events | CODATOR",
  description: "Browse and register for upcoming CODATOR hackathons, workshops, guest lectures, and networking sessions.",
};


export const revalidate = 60; // Cache for 60 seconds

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
    return (
      <div className="min-h-screen bg-paper py-24 text-ink flex items-center justify-center">
        <div className="text-center max-w-md border border-mist p-8 rounded-2xl bg-paper/30">
          <h2 className="font-display text-xl font-bold">Failed to load events</h2>
          <p className="text-sm text-ink/65 mt-2">Please check back later as we prepare our upcoming schedule.</p>
        </div>
      </div>
    );
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

  return (
    <div className="min-h-screen bg-paper pt-28 pb-20 text-ink">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl bg-gradient-to-r from-wisteria to-skyline bg-clip-text text-transparent">
            Society Events
          </h1>
          <p className="mt-4 text-base sm:text-lg text-ink/65 leading-relaxed">
            Participate in our hands-on workshops, competitive hackathons, guest lectures, and networking sessions.
          </p>
        </div>

        {/* Events Grid */}
        {events && events.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const isPast = isEventPast(event.date_start);
              return (
                <div
                  key={event.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-mist bg-paper/30 shadow-xs hover:shadow-md transition-all duration-300"
                >
                  {/* Banner */}
                  <div className="relative h-48 w-full bg-wisteria-tint/30 overflow-hidden">
                    {event.banner_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={event.banner_url}
                        alt={event.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImageIcon className="h-10 w-10 text-wisteria/30" />
                      </div>
                    )}
                    
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="rounded bg-paper/95 backdrop-blur-xs px-2.5 py-0.5 text-3xs font-bold uppercase tracking-wider text-wisteria border border-mist">
                        {event.category}
                      </span>
                      {isPast && (
                        <span className="rounded bg-ink/75 backdrop-blur-xs px-2.5 py-0.5 text-3xs font-bold uppercase tracking-wider text-paper">
                          Past Event
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <h3 className="font-display text-xl font-bold text-ink group-hover:text-wisteria transition-colors leading-snug line-clamp-1">
                        {event.title}
                      </h3>
                      <p className="mt-3 text-sm text-ink/65 line-clamp-3 leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    <div className="mt-6 space-y-2.5 border-t border-mist pt-5 text-xs text-ink/75 font-semibold">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-ink/35" />
                        <span>{formatDate(event.date_start)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-ink/35" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Button */}
                  <div className="bg-paper/45 border-t border-mist px-6 py-4">
                    <Link
                      href={`/events/${event.slug}`}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-wisteria px-4 py-2.5 text-center text-sm font-bold text-paper hover:bg-wisteria/90 transition-all duration-200 cursor-pointer"
                    >
                      <span>{isPast ? "View Outcomes" : "View Details & Register"}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center border border-dashed border-mist rounded-2xl p-20 bg-paper/20 max-w-lg mx-auto">
            <Calendar className="mx-auto h-12 w-12 text-ink/35 mb-4" />
            <h3 className="font-display text-lg font-bold text-ink">No upcoming events</h3>
            <p className="text-sm text-ink/50 mt-1">We are planning some exciting activities! Check back soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}

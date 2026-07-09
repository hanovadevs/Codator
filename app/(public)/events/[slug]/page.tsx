import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RegistrationSection from "@/components/events/registration-section";
import { Calendar, MapPin, Users, ArrowLeft, Image as ImageIcon, Clock, Sparkles } from "lucide-react";

export const revalidate = 0; // Dynamic data

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("title, description")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  return {
    title: event ? `${event.title} | CODATOR Events` : "Event Details | CODATOR",
    description: event ? event.description.slice(0, 160) : "Learn about and register for CODATOR events.",
  };
}

export default async function PublicEventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // 1. Fetch the event details
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (eventError || !event) {
    notFound();
  }

  // 2. Fetch authentication and registration status
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let member = null;
  let isRegistered = false;

  if (user) {
    // Fetch member details
    const { data: memberData } = await supabase
      .from("members")
      .select("id, status")
      .or(`user_id.eq.${user.id},email.eq.${user.email}`)
      .maybeSingle();

    member = memberData;

    if (member && member.status === "active") {
      // Check if already registered
      const { data: registration } = await supabase
        .from("event_registrations")
        .select("id")
        .eq("event_id", event.id)
        .eq("member_id", member.id)
        .maybeSingle();

      isRegistered = !!registration;
    }
  }

  // 3. Count current registrations to check capacity
  const { count: regCount } = await supabase
    .from("event_registrations")
    .select("*", { count: "exact", head: true })
    .eq("event_id", event.id);

  const currentRegs = regCount || 0;
  const spotsLeft = Math.max(0, event.capacity - currentRegs);
  const isFull = spotsLeft === 0;
  const isPast = new Date(event.date_start) < new Date();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCategoryConfig = (category: string) => {
    switch (category?.toLowerCase()) {
      case "hackathon":
        return {
          badge: "bg-pink-500/10 text-pink-700 border-pink-200/50",
          label: "Hackathon",
        };
      case "workshop":
        return {
          badge: "bg-purple-500/10 text-purple-700 border-purple-200/50",
          label: "Workshop",
        };
      case "seminar":
        return {
          badge: "bg-skyline-tint/30 text-skyline border-skyline/20",
          label: "Seminar",
        };
      default:
        return {
          badge: "bg-amber-500/10 text-amber-700 border-amber-200/50",
          label: "Social Event",
        };
    }
  };

  const config = getCategoryConfig(event.category);

  return (
    <div className="min-h-screen bg-[#F8F8FC] pt-28 pb-20 text-ink">
      {/* Soft background glow */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute -top-[10%] left-[15%] w-[40vw] h-[40vw] rounded-full bg-wisteria/5 blur-[100px]" />
        <div className="absolute top-[40%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-skyline/5 blur-[90px]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-ink/50 hover:text-wisteria transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Events</span>
          </Link>
        </div>

        {/* Main Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column: Banner & Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-3">
              <span className={`inline-flex rounded-lg px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${config.badge}`}>
                {config.label}
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                {event.title}
              </h1>
            </div>

            {/* Banner Image */}
            <div className="relative aspect-video w-full border border-mist bg-wisteria-tint/10 rounded-3xl overflow-hidden shadow-3xs">
              {event.banner_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={event.banner_url} alt={event.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-wisteria/25" />
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-5 bg-white/40 border border-mist p-6 sm:p-8 rounded-3xl backdrop-blur-xs shadow-3xs">
              <h3 className="font-display text-base font-black border-b border-mist pb-3 flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-wisteria animate-pulse" />
                <span>About the Event</span>
              </h3>
              <p className="text-4xs font-semibold text-ink/75 leading-relaxed whitespace-pre-line">{event.description}</p>
            </div>
          </div>

          {/* Right Column: Sidebar Registration */}
          <div className="space-y-6">
            {/* Registration Box */}
            <RegistrationSection
              eventId={event.id}
              isLoggedIn={!!user}
              isMember={member?.status === "active"}
              initialRegistered={isRegistered}
              isFull={isFull}
              isPast={isPast}
            />

            {/* Event Details Card */}
            <div className="rounded-3xl border border-mist bg-white/40 backdrop-blur-xs p-6 space-y-5 shadow-3xs">
              <h4 className="font-display text-xs font-black text-ink uppercase tracking-wider">Session Coordinates</h4>
              
              <div className="space-y-5 text-4xs text-ink/75 font-semibold">
                {/* Date */}
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-lg bg-wisteria/[0.06] border border-wisteria/10 flex items-center justify-center shrink-0">
                    <Calendar className="h-4 w-4 text-wisteria" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="block font-bold text-ink/40 uppercase tracking-widest text-[8px]">When</span>
                    <span className="leading-normal">{formatDate(event.date_start)}</span>
                  </div>
                </div>

                {/* Location */}
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-lg bg-wisteria/[0.06] border border-wisteria/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-4 w-4 text-wisteria" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="block font-bold text-ink/40 uppercase tracking-widest text-[8px]">Where</span>
                    <span className="leading-normal">{event.location}</span>
                  </div>
                </div>

                {/* Capacity */}
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-lg bg-wisteria/[0.06] border border-wisteria/10 flex items-center justify-center shrink-0">
                    <Users className="h-4 w-4 text-wisteria" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="block font-bold text-ink/40 uppercase tracking-widest text-[8px]">Capacity</span>
                    <span className="leading-normal">
                      {isPast
                        ? "Event concluded"
                        : `${spotsLeft} of ${event.capacity} seats remaining`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

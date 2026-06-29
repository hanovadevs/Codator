import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RegistrationSection from "@/components/events/registration-section";
import { Calendar, MapPin, Users, ArrowLeft, Image as ImageIcon } from "lucide-react";

export const revalidate = 0; // Dynamic data

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
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

  return (
    <div className="min-h-screen bg-paper pt-28 pb-20 text-ink">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/65 hover:text-wisteria transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Events</span>
          </Link>
        </div>

        {/* Main Grid */}
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Left Column: Banner & Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <span className="inline-flex rounded-md bg-wisteria-tint px-3 py-1 text-xs font-bold uppercase tracking-wider text-wisteria border border-wisteria/10">
                {event.category}
              </span>
              <h1 className="font-display text-3xl font-extrabold sm:text-4xl tracking-tight leading-tight">
                {event.title}
              </h1>
            </div>

            {/* Banner Image */}
            <div className="relative aspect-video w-full border border-mist bg-wisteria-tint/15 rounded-2xl overflow-hidden shadow-sm">
              {event.banner_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={event.banner_url} alt={event.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-wisteria/20" />
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-6">
              <h3 className="font-display text-xl font-bold border-b border-mist pb-3">About the Event</h3>
              <p className="text-sm text-ink/75 leading-relaxed whitespace-pre-line">{event.description}</p>
            </div>
          </div>

          {/* Right Column: Sidebar Registration */}
          <div className="space-y-8">
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
            <div className="rounded-2xl border border-mist bg-paper/30 p-6 space-y-5 shadow-xs">
              <h4 className="font-display text-base font-bold text-ink">Event Details</h4>
              
              <div className="space-y-4 text-xs text-ink/80 font-medium">
                {/* Date */}
                <div className="flex gap-3">
                  <Calendar className="h-5 w-5 text-wisteria flex-shrink-0" />
                  <div className="space-y-0.5">
                    <span className="block font-bold text-ink/55 uppercase tracking-wider text-4xs">When</span>
                    <span className="leading-normal">{formatDate(event.date_start)}</span>
                  </div>
                </div>

                {/* Location */}
                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-wisteria flex-shrink-0" />
                  <div className="space-y-0.5">
                    <span className="block font-bold text-ink/55 uppercase tracking-wider text-4xs">Where</span>
                    <span className="leading-normal">{event.location}</span>
                  </div>
                </div>

                {/* Capacity */}
                <div className="flex gap-3">
                  <Users className="h-5 w-5 text-wisteria flex-shrink-0" />
                  <div className="space-y-0.5">
                    <span className="block font-bold text-ink/55 uppercase tracking-wider text-4xs">Attendance</span>
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

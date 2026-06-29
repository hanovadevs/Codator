import Link from "next/link";

export default function EventsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl text-ink mb-6">Events</h1>
        <p className="text-lg text-ink/70 leading-relaxed mb-8">
          Discover our upcoming workshops, hackathons, seminars, and social gatherings.
        </p>
        <div className="border border-dashed border-mist rounded-xl p-8 text-center text-ink/50">
          <p className="mb-4 font-medium">No upcoming events at the moment.</p>
          <Link href="/join" className="text-sm font-semibold text-wisteria hover:underline">
            Become a member to get notified &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

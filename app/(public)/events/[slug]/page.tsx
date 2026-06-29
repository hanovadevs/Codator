import Link from "next/link";

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/events" className="text-sm font-semibold text-wisteria hover:underline mb-6 inline-block">
          &larr; Back to Events
        </Link>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl text-ink mb-4">
          Event: {slug}
        </h1>
        <p className="text-lg text-ink/70 leading-relaxed">
          Details for this event will be loaded from the database.
        </p>
      </div>
    </div>
  );
}

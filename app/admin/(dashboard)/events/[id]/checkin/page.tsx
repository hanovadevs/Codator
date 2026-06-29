import Link from "next/link";

interface CheckInPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEventCheckInPage({ params }: CheckInPageProps) {
  const { id } = await params;

  return (
    <div>
      <Link href="/admin/events" className="text-sm font-semibold text-wisteria hover:underline mb-6 inline-block">
        &larr; Back to Events
      </Link>
      <h1 className="font-display text-3xl font-bold tracking-tight text-ink mb-2">QR Event Check-In</h1>
      <p className="text-ink/70 mb-8">Scan member QR passes to register attendance for event: <span className="font-mono text-wisteria">{id}</span></p>
      
      <div className="border border-dashed border-mist rounded-xl p-12 text-center text-ink/50">
        <p>Camera-based QR scanner check-in tool will be implemented in Phase 7.</p>
      </div>
    </div>
  );
}

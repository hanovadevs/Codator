export default function AdminEventsPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight text-ink mb-2">Events Management</h1>
      <p className="text-ink/70 mb-8">Create, edit, and publish events for the CODATOR society.</p>
      
      <div className="border border-dashed border-mist rounded-xl p-12 text-center text-ink/50">
        <p>No events created yet.</p>
      </div>
    </div>
  );
}

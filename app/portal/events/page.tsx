export default function MemberEventsPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight text-ink mb-2">My Registered Events</h1>
      <p className="text-ink/70 mb-8">View your event registration and attendance history.</p>
      
      <div className="border border-dashed border-mist rounded-xl p-8 text-center text-ink/50">
        <p>No registered events found.</p>
      </div>
    </div>
  );
}

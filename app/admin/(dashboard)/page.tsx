export default function AdminOverviewPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight text-ink mb-2">Admin Overview</h1>
      <p className="text-ink/70 mb-8">Welcome to the CODATOR administration dashboard.</p>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="border border-mist rounded-xl p-6 bg-paper shadow-sm">
          <h3 className="text-sm font-semibold text-ink/50 uppercase tracking-wider">Pending Applications</h3>
          <p className="text-3xl font-display font-bold text-wisteria mt-2">0</p>
        </div>
        <div className="border border-mist rounded-xl p-6 bg-paper shadow-sm">
          <h3 className="text-sm font-semibold text-ink/50 uppercase tracking-wider">Total Members</h3>
          <p className="text-3xl font-display font-bold text-skyline mt-2">0</p>
        </div>
        <div className="border border-mist rounded-xl p-6 bg-paper shadow-sm">
          <h3 className="text-sm font-semibold text-ink/50 uppercase tracking-wider">Upcoming Events</h3>
          <p className="text-3xl font-display font-bold text-ember mt-2">0</p>
        </div>
      </div>
    </div>
  );
}

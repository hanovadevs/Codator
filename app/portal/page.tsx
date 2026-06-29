export default function PortalDashboard() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight text-ink mb-2">Member Portal</h1>
      <p className="text-ink/70 mb-8">Welcome back! Manage your membership details and view registered events here.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-mist rounded-xl p-6 bg-paper shadow-sm">
          <h2 className="font-display text-lg font-bold text-ink mb-2">Membership Status</h2>
          <div className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
            Active
          </div>
        </div>
      </div>
    </div>
  );
}

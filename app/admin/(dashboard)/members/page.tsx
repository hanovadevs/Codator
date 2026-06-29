export default function AdminMembersPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight text-ink mb-2">Members Management</h1>
      <p className="text-ink/70 mb-8">Search, filter, and manage all registered members of CODATOR.</p>
      
      <div className="border border-dashed border-mist rounded-xl p-12 text-center text-ink/50">
        <p>No members registered yet.</p>
      </div>
    </div>
  );
}

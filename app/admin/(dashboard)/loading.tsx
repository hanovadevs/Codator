export default function AdminLoading() {
  return (
    <div className="flex min-h-screen bg-[#F8F8FC] text-ink">
      {/* Sidebar Skeleton */}
      <aside className="hidden md:flex flex-col w-64 border-r border-mist/40 bg-white/40 backdrop-blur-md p-6 space-y-8">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-mist/40 animate-pulse" />
          <div className="h-5 w-24 rounded-lg bg-mist/45 animate-pulse" />
        </div>
        <div className="space-y-4 pt-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-10 w-full rounded-xl bg-mist/35 animate-pulse" />
          ))}
        </div>
      </aside>

      {/* Main Content Area Skeleton */}
      <div className="flex-1 flex flex-col">
        {/* Header Skeleton */}
        <header className="h-16 border-b border-mist/40 bg-white/35 backdrop-blur-md px-6 flex items-center justify-between">
          <div className="h-5 w-32 rounded-lg bg-mist/40 animate-pulse" />
          <div className="flex items-center gap-4">
            <div className="h-8 w-20 rounded-lg bg-mist/35 animate-pulse" />
            <div className="h-8 w-8 rounded-full bg-mist/40 animate-pulse" />
          </div>
        </header>

        {/* Dashboard Content Skeleton */}
        <main className="flex-grow p-6 md:p-8 space-y-8 w-full">
          {/* Title Row */}
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-8 w-48 rounded-xl bg-mist/45 animate-pulse" />
              <div className="h-4 w-64 rounded-lg bg-mist/35 animate-pulse" />
            </div>
            <div className="h-10 w-36 rounded-xl bg-mist/40 animate-pulse" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-2xl border border-white/60 bg-white/40 p-5 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-20 rounded-md bg-mist/35 animate-pulse" />
                  <div className="h-8 w-8 rounded-lg bg-mist/40 animate-pulse" />
                </div>
                <div className="h-6 w-24 rounded-lg bg-mist/45 animate-pulse" />
              </div>
            ))}
          </div>

          {/* Large Tables/Charts Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-96 rounded-2xl border border-white/60 bg-white/40 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)] animate-pulse" />
            </div>
            <div className="space-y-6">
              <div className="h-96 rounded-2xl border border-white/60 bg-white/40 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)] animate-pulse" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

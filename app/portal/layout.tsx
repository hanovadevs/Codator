import Link from "next/link";
import React from "react";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-paper text-ink">
      {/* Sidebar */}
      <aside className="w-64 border-r border-mist bg-paper/50 flex flex-col justify-between">
        <div className="p-6">
          <Link href="/" className="font-display text-xl font-bold text-wisteria">
            CODATOR Portal
          </Link>
          <nav className="mt-8 flex flex-col gap-2 text-sm font-medium">
            <Link href="/portal" className="px-4 py-2 rounded-lg hover:bg-wisteria-tint hover:text-wisteria transition-colors">
              Dashboard
            </Link>
            <Link href="/portal/id-card" className="px-4 py-2 rounded-lg hover:bg-wisteria-tint hover:text-wisteria transition-colors">
              My ID & Pass
            </Link>
            <Link href="/portal/events" className="px-4 py-2 rounded-lg hover:bg-wisteria-tint hover:text-wisteria transition-colors">
              My Events
            </Link>
          </nav>
        </div>
        <div className="p-6 border-t border-mist">
          <Link href="/" className="text-sm font-semibold text-ink/50 hover:text-ink transition-colors">
            Back to Public Site
          </Link>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 p-8 md:p-12 overflow-auto">
        {children}
      </main>
    </div>
  );
}

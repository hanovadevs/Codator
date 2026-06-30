import Link from "next/link";
import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PortalSignOutButton from "@/components/portal/signout-button";
import { ShieldCheck, Calendar, IdCard, LayoutDashboard, Globe, AlertCircle, Clock } from "lucide-react";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 1. Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Query member profile
  const { data: member, error } = await supabase
    .from("members")
    .select("id, full_name, status, codator_id")
    .or(`user_id.eq.${user.id},email.eq.${user.email}`)
    .maybeSingle();

  // 3. Handle case where user is authenticated but has no member application record
  if (!member) {
    redirect("/join");
  }

  // 4. Handle Pending Application State
  if (member.status === "pending") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 text-ink">
        <div className="mx-auto max-w-md text-center border border-mist bg-paper/30 p-8 rounded-2xl shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-wisteria-tint text-wisteria border border-wisteria/10">
            <Clock className="h-6 w-6 animate-pulse" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">Application Under Review</h1>
          <p className="mt-2 text-sm text-ink/65 leading-relaxed">
            Hi <span className="font-semibold text-ink">{member.full_name}</span>, your membership application has been received and is currently being reviewed by the CODATOR committee.
          </p>
          <p className="mt-2 text-xs text-wisteria font-medium">
            You will receive a confirmation email once your account is activated!
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg border border-mist bg-paper px-4 py-2.5 text-sm font-semibold hover:bg-wisteria-tint/30 hover:text-wisteria transition-colors"
            >
              <Globe className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
            <PortalSignOutButton />
          </div>
        </div>
      </div>
    );
  }

  // 5. Handle Rejected Application State
  if (member.status === "rejected") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 text-ink">
        <div className="mx-auto max-w-md text-center border border-mist bg-paper/30 p-8 rounded-2xl shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-200">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">Application Closed</h1>
          <p className="mt-2 text-sm text-ink/65 leading-relaxed">
            We regret to inform you that your membership application for CODATOR has not been approved at this time. If you have questions, please reach out to the society coordinators.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg border border-mist bg-paper px-4 py-2.5 text-sm font-semibold hover:bg-wisteria-tint/30 hover:text-wisteria transition-colors"
            >
              <Globe className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
            <PortalSignOutButton />
          </div>
        </div>
      </div>
    );
  }

  // 6. Active Member State - Render Portal Dashboard
  return (
    <div className="flex min-h-screen bg-[#F8F8FC] text-ink overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/80 bg-white/30 backdrop-blur-md flex flex-col justify-between z-20">
        <div className="p-6">
          <div className="flex flex-col gap-1.5">
            <Link href="/portal" className="font-display text-xl font-black text-[#1D1B26] flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-wisteria stroke-[2.5]" />
              CODATOR Portal
            </Link>
            <span className="text-5xs text-ink/40 font-bold uppercase tracking-wider">
              ID: <span className="font-mono text-wisteria">{member.codator_id}</span>
            </span>
          </div>
          
          <nav className="mt-10 flex flex-col gap-2 text-xs font-bold">
            <Link
              href="/portal"
              className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 hover:bg-wisteria/5 hover:text-wisteria border border-transparent hover:border-wisteria/15 transition-all duration-250 text-ink/75 hover:text-ink"
            >
              <LayoutDashboard className="h-4 w-4 text-ink/40" />
              Dashboard
            </Link>
            <Link
              href="/portal/id-card"
              className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 hover:bg-wisteria/5 hover:text-wisteria border border-transparent hover:border-wisteria/15 transition-all duration-250 text-ink/75 hover:text-ink"
            >
              <IdCard className="h-4 w-4 text-ink/40" />
              My ID & Pass
            </Link>
            <Link
              href="/portal/events"
              className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 hover:bg-wisteria/5 hover:text-wisteria border border-transparent hover:border-wisteria/15 transition-all duration-250 text-ink/75 hover:text-ink"
            >
              <Calendar className="h-4 w-4 text-ink/40" />
              My Events
            </Link>
          </nav>
        </div>
        
        <div className="p-6 border-t border-mist/35">
          <PortalSignOutButton />
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 p-8 md:p-10 overflow-auto relative">
        {/* Soft background glows */}
        <div className="absolute top-0 right-0 w-[40vw] h-[40vw] rounded-full bg-wisteria/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[35vw] h-[35vw] rounded-full bg-skyline/5 blur-[100px] pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Top Bar with visible Back to Public Site link */}
          <header className="flex justify-end items-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/45 backdrop-blur-md px-3.5 py-1.5 text-5xs font-bold uppercase tracking-widest text-wisteria hover:bg-wisteria hover:text-white hover:shadow-md hover:shadow-wisteria/10 active:scale-[0.98] transition-all duration-300"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Back to Public Site</span>
            </Link>
          </header>

          {/* Page Content */}
          <div>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

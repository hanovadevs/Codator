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
    <div className="flex min-h-screen bg-paper text-ink">
      {/* Sidebar */}
      <aside className="w-64 border-r border-mist bg-paper/50 flex flex-col justify-between">
        <div className="p-6">
          <div className="flex flex-col gap-1">
            <Link href="/portal" className="font-display text-xl font-bold text-wisteria flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 stroke-[2.5]" />
              CODATOR Portal
            </Link>
            <span className="text-xs text-ink/50 font-medium">
              Member ID: <span className="font-semibold text-wisteria font-mono">{member.codator_id}</span>
            </span>
          </div>
          
          <nav className="mt-8 flex flex-col gap-1.5 text-sm font-medium">
            <Link
              href="/portal"
              className="flex items-center gap-2.5 rounded-lg px-4 py-2 hover:bg-wisteria-tint hover:text-wisteria transition-colors"
            >
              <LayoutDashboard className="h-4 w-4 text-ink/40" />
              Dashboard
            </Link>
            <Link
              href="/portal/id-card"
              className="flex items-center gap-2.5 rounded-lg px-4 py-2 hover:bg-wisteria-tint hover:text-wisteria transition-colors"
            >
              <IdCard className="h-4 w-4 text-ink/40" />
              My ID & Pass
            </Link>
            <Link
              href="/portal/events"
              className="flex items-center gap-2.5 rounded-lg px-4 py-2 hover:bg-wisteria-tint hover:text-wisteria transition-colors"
            >
              <Calendar className="h-4 w-4 text-ink/40" />
              My Events
            </Link>
          </nav>
        </div>
        
        <div className="p-6 border-t border-mist flex flex-col gap-2.5">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-lg px-4 py-2 text-sm font-medium text-ink/50 hover:text-ink transition-colors"
          >
            <Globe className="h-4 w-4" />
            Public Site
          </Link>
          <PortalSignOutButton />
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 p-8 md:p-12 overflow-auto">
        {children}
      </main>
    </div>
  );
}

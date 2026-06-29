import Link from "next/link";
import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/admin/signout-button";
import { ShieldAlert, Users, Calendar, Megaphone, Settings, FileText, LayoutDashboard, Globe } from "lucide-react";

export default async function AdminLayout({
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
    redirect("/admin/login");
  }

  // 2. Query member profile to check role
  const { data: member, error } = await supabase
    .from("members")
    .select("role, status, full_name")
    .or(`user_id.eq.${user.id},email.eq.${user.email}`)
    .maybeSingle();

  // 3. Authorization check
  if (error || !member || member.role !== "admin" || member.status !== "active") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 text-ink">
        <div className="mx-auto max-w-md text-center border border-mist bg-paper/30 p-8 rounded-2xl shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-200">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">Access Denied</h1>
          <p className="mt-2 text-sm text-ink/65">
            You do not have administrative privileges. If you believe this is an error, please contact the system administrator.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg border border-mist bg-paper px-4 py-2.5 text-sm font-semibold hover:bg-wisteria-tint/30 hover:text-wisteria transition-colors"
            >
              <Globe className="mr-2 h-4 w-4" />
              Back to Public Site
            </Link>
            <SignOutButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-paper text-ink">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-mist bg-paper/50 flex flex-col justify-between">
        <div className="p-6">
          <div className="flex flex-col gap-1">
            <Link href="/admin" className="font-display text-xl font-bold text-wisteria">
              CODATOR Admin
            </Link>
            <span className="text-xs text-ink/50 font-medium">
              Logged in as: <span className="font-semibold">{member.full_name}</span>
            </span>
          </div>
          
          <nav className="mt-8 flex flex-col gap-1.5 text-sm font-medium">
            <Link
              href="/admin"
              className="flex items-center gap-2.5 rounded-lg px-4 py-2 hover:bg-wisteria-tint hover:text-wisteria transition-colors"
            >
              <LayoutDashboard className="h-4 w-4 text-ink/40" />
              Overview
            </Link>
            <Link
              href="/admin/applications"
              className="flex items-center gap-2.5 rounded-lg px-4 py-2 hover:bg-wisteria-tint hover:text-wisteria transition-colors"
            >
              <FileText className="h-4 w-4 text-ink/40" />
              Applications
            </Link>
            <Link
              href="/admin/members"
              className="flex items-center gap-2.5 rounded-lg px-4 py-2 hover:bg-wisteria-tint hover:text-wisteria transition-colors"
            >
              <Users className="h-4 w-4 text-ink/40" />
              Members
            </Link>
            <Link
              href="/admin/events"
              className="flex items-center gap-2.5 rounded-lg px-4 py-2 hover:bg-wisteria-tint hover:text-wisteria transition-colors"
            >
              <Calendar className="h-4 w-4 text-ink/40" />
              Events
            </Link>
            <Link
              href="/admin/announcements"
              className="flex items-center gap-2.5 rounded-lg px-4 py-2 hover:bg-wisteria-tint hover:text-wisteria transition-colors"
            >
              <Megaphone className="h-4 w-4 text-ink/40" />
              Announcements
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center gap-2.5 rounded-lg px-4 py-2 hover:bg-wisteria-tint hover:text-wisteria transition-colors"
            >
              <Settings className="h-4 w-4 text-ink/40" />
              Settings
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
          <SignOutButton />
        </div>
      </aside>

      {/* Admin Content */}
      <main className="flex-1 p-8 md:p-12 overflow-auto">
        {children}
      </main>
    </div>
  );
}

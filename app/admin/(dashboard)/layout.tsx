import Link from "next/link";
import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/admin/signout-button";
import AdminLayoutShell from "@/components/admin/admin-layout-shell";
import { ShieldAlert, Globe } from "lucide-react";

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

  // 4. Active Admin State - Render Admin Dashboard Layout
  return (
    <AdminLayoutShell member={member} signOutButton={<SignOutButton />}>
      {children}
    </AdminLayoutShell>
  );
}

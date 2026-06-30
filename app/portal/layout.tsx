import Link from "next/link";
import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PortalSignOutButton from "@/components/portal/signout-button";
import PortalLayoutShell from "@/components/portal/portal-layout-shell";
import { AlertCircle, Clock, Globe } from "lucide-react";

interface ApproveParams {
  params: Promise<{ id: string }>;
}

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
    <PortalLayoutShell member={member} signOutButton={<PortalSignOutButton />}>
      {children}
    </PortalLayoutShell>
  );
}

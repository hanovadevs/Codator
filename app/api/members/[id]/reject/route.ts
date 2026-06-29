import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RejectParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RejectParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // 1. Verify caller is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // 2. Verify caller has admin role
    const { data: caller, error: callerError } = await supabase
      .from("members")
      .select("id, role, status")
      .or(`user_id.eq.${user.id},email.eq.${user.email}`)
      .maybeSingle();

    if (callerError || !caller || caller.role !== "admin" || caller.status !== "active") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    // 3. Update applicant's status to 'rejected'
    const { error: updateError } = await supabase
      .from("members")
      .update({
        status: "rejected",
      })
      .eq("id", id)
      .eq("status", "pending"); // Only reject pending applications

    if (updateError) {
      console.error("Database update error:", updateError);
      return NextResponse.json({ error: "Failed to reject application." }, { status: 500 });
    }

    return NextResponse.json({ message: "Application rejected successfully." }, { status: 200 });
  } catch (error) {
    console.error("API error in reject route:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

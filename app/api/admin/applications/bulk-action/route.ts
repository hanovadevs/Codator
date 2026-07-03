import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/admin/applications/bulk-action
 * 
 * Allows admins to bulk-reject or bulk-delete pending applications.
 * Supports filtering by email domain pattern for targeted spam cleanup.
 * 
 * Body: { action: "reject_all" | "delete_all" | "delete_by_pattern", pattern?: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, pattern } = body;

    if (!action) {
      return NextResponse.json({ error: "Missing required action." }, { status: 400 });
    }

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
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    let result;

    if (action === "reject_all") {
      // Reject all pending applications
      result = await supabase
        .from("members")
        .delete()
        .eq("status", "pending");
    } else if (action === "delete_by_pattern" && pattern) {
      // Delete pending applications matching an email pattern (e.g. "%testuniversity.edu")
      result = await supabase
        .from("members")
        .delete()
        .eq("status", "pending")
        .ilike("email", `%${pattern}%`);
    } else if (action === "delete_all") {
      // Delete ALL pending applications
      result = await supabase
        .from("members")
        .delete()
        .eq("status", "pending");
    } else {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }

    if (result.error) {
      console.error("Bulk action error:", result.error);
      return NextResponse.json({ error: "Failed to perform bulk action." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Bulk action "${action}" completed successfully.`,
    });
  } catch (error) {
    console.error("Bulk action API error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

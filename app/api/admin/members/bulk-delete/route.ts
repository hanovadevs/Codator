import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/admin/members/bulk-delete
 * 
 * Allows admins to permanently delete selected members by ID.
 * Body: { memberIds: string[] }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { memberIds } = body;

    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json({ error: "No member IDs provided." }, { status: 400 });
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

    // 3. Prevent deleting yourself
    if (memberIds.includes(caller.id)) {
      return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
    }

    // 4. Delete event_registrations for these members first (to avoid FK constraint errors)
    await supabase
      .from("event_registrations")
      .delete()
      .in("member_id", memberIds);

    // 5. Delete the members
    const { error: deleteError } = await supabase
      .from("members")
      .delete()
      .in("id", memberIds);

    if (deleteError) {
      console.error("Bulk delete error:", deleteError);
      return NextResponse.json({ error: "Failed to delete members." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${memberIds.length} member(s).`,
      deletedCount: memberIds.length,
    });
  } catch (error) {
    console.error("Bulk delete API error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

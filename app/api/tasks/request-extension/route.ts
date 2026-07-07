import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Authenticate user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // 2. Fetch member profile
    const { data: member, error: memberError } = await supabase
      .from("members")
      .select("id, status")
      .or(`user_id.eq.${user.id},email.eq.${user.email}`)
      .maybeSingle();

    if (memberError || !member || member.status !== "active") {
      return NextResponse.json(
        { error: "Forbidden. Active member account required." },
        { status: 403 }
      );
    }

    // 3. Parse request body
    const body = await request.json();
    const { task_id, reason, proposed_due_at } = body;

    if (!task_id || !reason || !proposed_due_at) {
      return NextResponse.json(
        { error: "Missing required fields: task_id, reason, and proposed_due_at." },
        { status: 400 }
      );
    }

    // 4. Fetch task and verify owner
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("id, assigned_to, status, due_at")
      .eq("id", task_id)
      .maybeSingle();

    if (taskError || !task) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }

    if (task.assigned_to !== member.id) {
      return NextResponse.json(
        { error: "Forbidden. You are not assigned to this task." },
        { status: 403 }
      );
    }

    if (task.status !== "assigned") {
      return NextResponse.json(
        { error: "Conflict. Extensions can only be requested for active assigned tasks." },
        { status: 409 }
      );
    }

    const proposedDate = new Date(proposed_due_at);
    if (isNaN(proposedDate.getTime()) || proposedDate <= new Date()) {
      return NextResponse.json(
        { error: "Invalid extension date. Must be a valid date in the future." },
        { status: 400 }
      );
    }

    // 5. Update task extension parameters
    const { error: updateError } = await supabase
      .from("tasks")
      .update({
        extension_requested_at: new Date().toISOString(),
        extension_reason: reason.trim(),
        extension_due_at: proposedDate.toISOString(),
        extension_status: "pending",
      })
      .eq("id", task_id);

    if (updateError) {
      console.error("Error requesting task extension:", updateError);
      return NextResponse.json({ error: "Failed to request extension." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in extension request API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

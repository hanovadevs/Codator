import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Authenticate caller
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // 2. Fetch assigner member profile
    const { data: assigner, error: assignerError } = await supabase
      .from("members")
      .select("id, department, position, status, role")
      .or(`user_id.eq.${user.id},email.eq.${user.email}`)
      .maybeSingle();

    if (assignerError || !assigner || assigner.status !== "active") {
      return NextResponse.json(
        { error: "Forbidden. Active member account required." },
        { status: 403 }
      );
    }

    const posLower = assigner.position.toLowerCase();
    const isTopTier = posLower.includes("president") || posLower.includes("mentor");
    const isDirectorTier = posLower.includes("director");

    if (!isTopTier && !isDirectorTier) {
      return NextResponse.json(
        { error: "Forbidden. Only directors, presidents, and mentors can review extension requests." },
        { status: 403 }
      );
    }

    // 3. Parse body
    const body = await request.json();
    const { task_id, action } = body; // action is 'approve' or 'reject'

    if (!task_id || !action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Missing required fields: task_id and action ('approve'/'reject')." },
        { status: 400 }
      );
    }

    // 4. Fetch task and validates details
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select(`
        id, 
        assigned_by, 
        extension_due_at, 
        extension_status, 
        status,
        assignee:members!tasks_assigned_to_fkey(department)
      `)
      .eq("id", task_id)
      .maybeSingle();

    if (taskError || !task) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }

    // If Director and not top-tier, check department bounds
    if (isDirectorTier && !isTopTier) {
      const assigneeDept = (task.assignee as any)?.department;
      if (assigneeDept !== assigner.department) {
        return NextResponse.json(
          { error: "Forbidden. You can only review extension requests from members in your department." },
          { status: 403 }
        );
      }
    }

    if (task.extension_status !== "pending") {
      return NextResponse.json(
        { error: "Conflict. No pending extension request exists for this task." },
        { status: 409 }
      );
    }

    // 5. Apply action
    const updatePayload: any = {
      extension_status: action === "approve" ? "approved" : "rejected",
    };

    if (action === "approve" && task.extension_due_at) {
      updatePayload.due_at = task.extension_due_at;
    }

    const { error: updateError } = await supabase
      .from("tasks")
      .update(updatePayload)
      .eq("id", task_id);

    if (updateError) {
      console.error("Error updating extension review status:", updateError);
      return NextResponse.json({ error: "Failed to update extension status." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in extension review API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

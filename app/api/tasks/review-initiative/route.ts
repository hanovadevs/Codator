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

    // 2. Fetch reviewer member profile
    const { data: reviewer, error: reviewerError } = await supabase
      .from("members")
      .select("id, department, position, status, role, full_name")
      .or(`user_id.eq.${user.id},email.eq.${user.email}`)
      .maybeSingle();

    if (reviewerError || !reviewer || reviewer.status !== "active") {
      return NextResponse.json(
        { error: "Forbidden. Active member account required." },
        { status: 403 }
      );
    }

    // 3. Parse and validate body
    const body = await request.json();
    const { task_id, action, xp_award } = body;

    if (!task_id || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: task_id and action ('approve' or 'reject').",
        },
        { status: 400 }
      );
    }

    if (action === "approve" && (!xp_award || isNaN(Number(xp_award)) || Number(xp_award) <= 0)) {
      return NextResponse.json(
        { error: "XP award must be a positive number when approving." },
        { status: 400 }
      );
    }

    // 4. Fetch the initiative task
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("*, members!tasks_assigned_to_fkey(id, xp)")
      .eq("id", task_id)
      .maybeSingle();

    if (taskError || !task) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }

    if (task.status !== "pending_review") {
      return NextResponse.json(
        { error: "Conflict. Task is not pending review." },
        { status: 409 }
      );
    }

    // Verify it's an initiative task
    if (!task.title.startsWith("[Initiative]")) {
      return NextResponse.json(
        { error: "This endpoint is only for initiative task reviews. Use /api/tasks/review for regular tasks." },
        { status: 400 }
      );
    }

    // 5. Verify review permission
    const posLower = reviewer.position.toLowerCase();
    const isTopTier =
      posLower.includes("president") || posLower.includes("mentor");
    const isDirectorTier =
      posLower.includes("director") || posLower.includes("head");
    const isAssigner = task.assigned_by === reviewer.id;

    if (!isAssigner && !isTopTier && !isDirectorTier) {
      return NextResponse.json(
        {
          error:
            "Forbidden. You need Director-level or higher privileges to review initiatives.",
        },
        { status: 403 }
      );
    }

    // 6. Handle action
    if (action === "approve") {
      const awardAmount = Number(xp_award);

      // Update task status and set the XP reward to the chosen amount
      const { error: taskUpdateError } = await supabase
        .from("tasks")
        .update({
          status: "completed",
          xp_reward: awardAmount,
          completed_at: new Date().toISOString(),
        })
        .eq("id", task_id);

      if (taskUpdateError) {
        console.error("Error approving initiative:", taskUpdateError);
        return NextResponse.json(
          { error: "Failed to update task status." },
          { status: 500 }
        );
      }

      // Fetch current XP of the member
      const targetMember = Array.isArray(task.members)
        ? task.members[0]
        : task.members;
      const currentXp = targetMember?.xp || 0;
      const newXp = currentXp + awardAmount;

      // Update member's XP
      const { error: xpUpdateError } = await supabase
        .from("members")
        .update({ xp: newXp })
        .eq("id", task.assigned_to);

      if (xpUpdateError) {
        console.error("Error updating member XP:", xpUpdateError);
        return NextResponse.json(
          { error: "Task approved but XP update failed." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Initiative approved. ${awardAmount} XP credited.`,
      });
    } else {
      // Reject: set status to cancelled
      const { error: rejectError } = await supabase
        .from("tasks")
        .update({
          status: "cancelled",
          completed_at: new Date().toISOString(),
        })
        .eq("id", task_id);

      if (rejectError) {
        console.error("Error rejecting initiative:", rejectError);
        return NextResponse.json(
          { error: "Failed to reject initiative." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Initiative rejected.",
      });
    }
  } catch (error) {
    console.error("Error in review-initiative API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

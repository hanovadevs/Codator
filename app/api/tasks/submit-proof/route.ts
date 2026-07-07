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

    // 3. Parse body
    const body = await request.json();
    const { task_id, proof, proof_image } = body;

    if (!task_id || !proof || proof.trim() === "") {
      return NextResponse.json(
        { error: "Missing required fields: task_id and proof details." },
        { status: 400 }
      );
    }

    // 4. Fetch task and verify owner
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("id, assigned_to, status")
      .eq("id", task_id)
      .maybeSingle();

    if (taskError || !task) {
      return NextResponse.json({ error: "Task not found." }, { status: 444 });
    }

    if (task.assigned_to !== member.id) {
      return NextResponse.json(
        { error: "Forbidden. You are not assigned to this task." },
        { status: 403 }
      );
    }

    if (task.status === "completed") {
      return NextResponse.json(
        { error: "Conflict. Task is already completed." },
        { status: 409 }
      );
    }

    // 5. Submit proof and transition status
    const { error: updateError } = await supabase
      .from("tasks")
      .update({
        status: "pending_review",
        proof,
        proof_image,
        submitted_at: new Date().toISOString(),
      })
      .eq("id", task_id);

    if (updateError) {
      console.error("Error submitting task proof:", updateError);
      return NextResponse.json({ error: "Failed to submit task proof." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in task submission API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

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

    // Enforce Admin or President/Mentor privilege
    const posLower = reviewer.position.toLowerCase();
    const isTopTier = posLower.includes("president") || posLower.includes("mentor") || reviewer.role === "admin";

    if (!isTopTier) {
      return NextResponse.json(
        { error: "Forbidden. Administrative privileges required." },
        { status: 403 }
      );
    }

    // 3. Parse and validate body
    const body = await request.json();
    const { member_id, xp_amount, reason } = body;

    if (!member_id || !xp_amount || isNaN(Number(xp_amount)) || !reason) {
      return NextResponse.json(
        { error: "Missing or invalid fields: member_id, xp_amount, and reason are required." },
        { status: 400 }
      );
    }

    // 4. Fetch target member current XP
    const { data: targetMember, error: targetError } = await supabase
      .from("members")
      .select("id, xp, full_name")
      .eq("id", member_id)
      .maybeSingle();

    if (targetError || !targetMember) {
      return NextResponse.json({ error: "Target member not found." }, { status: 404 });
    }

    // 5. Update target member's XP
    const currentXp = targetMember.xp || 0;
    const newXp = currentXp + Number(xp_amount);

    const { error: xpUpdateError } = await supabase
      .from("members")
      .update({ xp: newXp })
      .eq("id", member_id);

    if (xpUpdateError) {
      console.error("Error updating member XP:", xpUpdateError);
      return NextResponse.json({ error: "Failed to update member XP." }, { status: 500 });
    }

    // 6. Create Completed Admin Task to log in XP history
    const { error: taskInsertError } = await supabase
      .from("tasks")
      .insert({
        title: `Bonus XP: ${reason.trim()}`,
        description: `Manually granted by Admin: ${reviewer.full_name}`,
        xp_reward: Number(xp_amount),
        assigned_by: reviewer.id,
        assigned_to: member_id,
        status: "completed",
        proof: `Administrative XP adjustment: ${reason.trim()}`,
        completed_at: new Date().toISOString(),
      });

    if (taskInsertError) {
      console.error("Error inserting admin XP log task:", taskInsertError);
      // We don't rollback since Supabase is autocommit, but we log the error
    }

    return NextResponse.json({ success: true, new_xp: newXp });
  } catch (error) {
    console.error("Error in grant-xp API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

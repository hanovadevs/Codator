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
        { error: "Forbidden. Only directors, presidents, and mentors can assign tasks." },
        { status: 403 }
      );
    }

    // 3. Parse and validate body
    const body = await request.json();
    const { title, description, xp_reward, assigned_to } = body;

    if (!title || !xp_reward || !assigned_to || !Array.isArray(assigned_to) || assigned_to.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: title, xp_reward, and assigned_to array." },
        { status: 400 }
      );
    }

    // 4. Fetch target members to validate roles and departments
    const { data: targets, error: targetsError } = await supabase
      .from("members")
      .select("id, department, position")
      .in("id", assigned_to);

    if (targetsError || !targets || targets.length === 0) {
      return NextResponse.json(
        { error: "Failed to find any of the assigned members." },
        { status: 400 }
      );
    }

    // 5. If Director, enforce department bounds
    if (isDirectorTier && !isTopTier) {
      const directorDept = assigner.department;
      for (const target of targets) {
        if (target.department !== directorDept) {
          return NextResponse.json(
            { error: `Forbidden. You can only assign tasks to members in the ${directorDept} department.` },
            { status: 403 }
          );
        }
        const targetPos = target.position.toLowerCase();
        if (targetPos.includes("president") || targetPos.includes("mentor")) {
          return NextResponse.json(
            { error: "Forbidden. Directors cannot assign tasks to Presidents, Vice Presidents, or Mentors." },
            { status: 403 }
          );
        }
      }
    }

    // 6. Bulk insert tasks
    const tasksToInsert = targets.map((target) => ({
      title,
      description: description || "",
      xp_reward: Number(xp_reward) || 100,
      assigned_by: assigner.id,
      assigned_to: target.id,
      status: "assigned",
    }));

    const { error: insertError } = await supabase
      .from("tasks")
      .insert(tasksToInsert);

    if (insertError) {
      console.error("Error creating tasks:", insertError);
      return NextResponse.json({ error: "Failed to save tasks." }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: tasksToInsert.length });
  } catch (error) {
    console.error("Error in task creation API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

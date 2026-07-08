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

    // 2. Fetch submitting member profile
    const { data: member, error: memberError } = await supabase
      .from("members")
      .select("id, full_name, department, position, status, role")
      .or(`user_id.eq.${user.id},email.eq.${user.email}`)
      .maybeSingle();

    if (memberError || !member || member.status !== "active") {
      return NextResponse.json(
        { error: "Forbidden. Active member account required." },
        { status: 403 }
      );
    }

    // 3. Prevent top-tier members from self-reporting (they can assign XP directly)
    const posLower = member.position.toLowerCase();
    const isTopTier =
      posLower.includes("president") || posLower.includes("mentor");

    if (isTopTier) {
      return NextResponse.json(
        {
          error:
            "Presidents, Vice Presidents, and Mentors should use the Grant XP or Assign Task features instead.",
        },
        { status: 403 }
      );
    }

    // 4. Parse and validate body
    const body = await request.json();
    const { title, description, proof, proof_image } = body;

    if (!title?.trim() || !description?.trim() || !proof?.trim()) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: title, description, and proof are required.",
        },
        { status: 400 }
      );
    }

    // 5. Find the appropriate reviewer:
    //    - If the member is a Director/Head/Co-Head, route to President/VP
    //    - Otherwise, route to a Director in their department
    const isDirectorTier =
      posLower.includes("director") || posLower.includes("head");

    let reviewerQuery;
    if (isDirectorTier) {
      // Route to any President or Vice President
      reviewerQuery = supabase
        .from("members")
        .select("id")
        .eq("status", "active")
        .or(
          `position.ilike.%president%,position.ilike.%mentor%`
        )
        .limit(1)
        .maybeSingle();
    } else {
      // Route to a Director in their department
      reviewerQuery = supabase
        .from("members")
        .select("id")
        .eq("status", "active")
        .eq("department", member.department)
        .or(
          `position.ilike.%director%,position.ilike.%head%`
        )
        .limit(1)
        .maybeSingle();
    }

    const { data: reviewer, error: reviewerError } = await reviewerQuery;

    if (reviewerError || !reviewer) {
      // Fallback: If no reviewer can be found, route to any president
      const { data: fallback } = await supabase
        .from("members")
        .select("id")
        .eq("status", "active")
        .or(
          `position.ilike.%president%,position.ilike.%mentor%`
        )
        .limit(1)
        .maybeSingle();

      if (!fallback) {
        return NextResponse.json(
          {
            error:
              "No eligible reviewer found. Please contact your department director.",
          },
          { status: 404 }
        );
      }

      // Use fallback reviewer
      const { error: insertError } = await supabase.from("tasks").insert({
        title: `[Initiative] ${title.trim()}`,
        description: description.trim(),
        xp_reward: 0, // XP is decided by the reviewer
        assigned_by: fallback.id,
        assigned_to: member.id,
        status: "pending_review",
        proof: proof.trim(),
        proof_image: proof_image || null,
        submitted_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error("Error creating initiative task:", insertError);
        return NextResponse.json(
          { error: "Failed to submit initiative." },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    // 6. Insert initiative task with status "pending_review"
    const { error: insertError } = await supabase.from("tasks").insert({
      title: `[Initiative] ${title.trim()}`,
      description: description.trim(),
      xp_reward: 0, // XP is decided by the reviewer
      assigned_by: reviewer.id,
      assigned_to: member.id,
      status: "pending_review",
      proof: proof.trim(),
      proof_image: proof_image || null,
      submitted_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("Error creating initiative task:", insertError);
      return NextResponse.json(
        { error: "Failed to submit initiative." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in submit-initiative API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

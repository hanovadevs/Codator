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
    const posLower = (member.position || "").toLowerCase();
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

    // 5. Find the appropriate reviewer using a cascading fallback strategy:
    //    Priority 1: Department Director/Head (for regular members)
    //    Priority 2: Any President/VP/Mentor (for director-tier or if no dept director)
    //    Priority 3: Any admin user
    //    Priority 4: Self-assign (the member's own ID) as absolute last resort

    const isDirectorTier =
      posLower.includes("director") || posLower.includes("head");

    let reviewerId: string | null = null;

    if (!isDirectorTier) {
      // Try to find a Director/Head in the member's department first
      const { data: deptDirectors } = await supabase
        .from("members")
        .select("id")
        .eq("status", "active")
        .eq("department", member.department)
        .neq("id", member.id)
        .or("position.ilike.%director%,position.ilike.%head%")
        .limit(1);

      if (deptDirectors && deptDirectors.length > 0) {
        reviewerId = deptDirectors[0].id;
      }
    }

    // Fallback: Find any President, VP, or Mentor
    if (!reviewerId) {
      const { data: topTierMembers } = await supabase
        .from("members")
        .select("id")
        .eq("status", "active")
        .neq("id", member.id)
        .or("position.ilike.%president%,position.ilike.%mentor%")
        .limit(1);

      if (topTierMembers && topTierMembers.length > 0) {
        reviewerId = topTierMembers[0].id;
      }
    }

    // Fallback 2: Find any admin user
    if (!reviewerId) {
      const { data: adminMembers } = await supabase
        .from("members")
        .select("id")
        .eq("status", "active")
        .eq("role", "admin")
        .neq("id", member.id)
        .limit(1);

      if (adminMembers && adminMembers.length > 0) {
        reviewerId = adminMembers[0].id;
      }
    }

    // Fallback 3: Find any Director/Head from any department
    if (!reviewerId) {
      const { data: anyDirectors } = await supabase
        .from("members")
        .select("id")
        .eq("status", "active")
        .neq("id", member.id)
        .or("position.ilike.%director%,position.ilike.%head%")
        .limit(1);

      if (anyDirectors && anyDirectors.length > 0) {
        reviewerId = anyDirectors[0].id;
      }
    }

    // Last resort: assign to self (will show up in own review queue if they also have canAssign)
    if (!reviewerId) {
      // Find literally any other active member
      const { data: anyMember } = await supabase
        .from("members")
        .select("id")
        .eq("status", "active")
        .neq("id", member.id)
        .limit(1);

      if (anyMember && anyMember.length > 0) {
        reviewerId = anyMember[0].id;
      } else {
        return NextResponse.json(
          {
            error:
              "No other active members found to review your initiative. Please contact an administrator.",
          },
          { status: 404 }
        );
      }
    }

    // 6. Insert initiative task with status "pending_review"
    const { error: insertError } = await supabase.from("tasks").insert({
      title: `[Initiative] ${title.trim()}`,
      description: description.trim(),
      xp_reward: 0, // XP is decided by the reviewer
      assigned_by: reviewerId,
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

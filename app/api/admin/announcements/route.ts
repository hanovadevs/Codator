import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendCustomEmail } from "@/lib/email";

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

    // 2. Verify admin role
    const { data: caller, error: callerError } = await supabase
      .from("members")
      .select("id, role, status")
      .or(`user_id.eq.${user.id},email.eq.${user.email}`)
      .maybeSingle();

    if (callerError || !caller || caller.role !== "admin" || caller.status !== "active") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    // 3. Parse and validate body
    const body = await request.json();
    const { title, content, category } = body;

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: "Title and content are required." },
        { status: 400 }
      );
    }

    const validCategories = ["general", "event", "urgent", "opportunity"];
    const safeCategory = validCategories.includes(category) ? category : "general";

    // 4. Insert announcement into database
    const { data: announcement, error: insertError } = await supabase
      .from("announcements")
      .insert({
        title: title.trim(),
        content: content.trim(),
        category: safeCategory,
        created_by: caller.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating announcement:", insertError);
      return NextResponse.json(
        { error: "Failed to create announcement." },
        { status: 500 }
      );
    }

    // 5. Fetch all active members with valid emails
    const { data: members, error: membersError } = await supabase
      .from("members")
      .select("id, email, full_name")
      .eq("status", "active")
      .not("email", "is", null);

    if (membersError) {
      console.error("Error fetching members for email blast:", membersError);
      // Announcement was created successfully, just email failed
      return NextResponse.json({
        success: true,
        announcement,
        emailsSent: 0,
        emailsTotal: 0,
        warning: "Announcement created but email blast failed.",
      });
    }

    // 6. Send email to every active member
    const emailSubject = safeCategory === "urgent"
      ? `⚠️ URGENT: ${title.trim()} | CODATOR`
      : `📢 ${title.trim()} | CODATOR`;

    const sendPromises = (members || []).map(async (member) => {
      try {
        if (!member.email) return false;
        return await sendCustomEmail(
          member.email,
          emailSubject,
          title.trim(),
          content.trim()
        );
      } catch (err) {
        console.error(`Failed to send announcement email to ${member.email}:`, err);
        return false;
      }
    });

    const results = await Promise.allSettled(sendPromises);
    const successfulSends = results.filter(
      (r) => r.status === "fulfilled" && r.value === true
    ).length;

    return NextResponse.json({
      success: true,
      announcement,
      emailsSent: successfulSends,
      emailsTotal: members?.length || 0,
    });
  } catch (error) {
    console.error("Error in announcements API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

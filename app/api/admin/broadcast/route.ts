import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendCustomEmail, sendInvitationEmail, sendWelcomeEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { memberIds, emailType, payload } = body;

    if (!emailType || !memberIds) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
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

    // 3. Query target members
    let query = supabase.from("members").select("id, full_name, email, codator_id, status");

    if (memberIds === "all") {
      query = query.eq("status", "active");
    } else if (Array.isArray(memberIds)) {
      query = query.in("id", memberIds);
    } else {
      return NextResponse.json({ error: "Invalid recipient selection." }, { status: 400 });
    }

    const { data: recipients, error: queryError } = await query;

    if (queryError || !recipients || recipients.length === 0) {
      return NextResponse.json({ error: "No recipients found." }, { status: 404 });
    }

    // 4. Send emails in parallel
    const sendPromises = recipients.map(async (member) => {
      try {
        if (emailType === "welcome") {
          return await sendWelcomeEmail({
            id: member.id,
            full_name: member.full_name,
            email: member.email,
            codator_id: member.codator_id || "",
          });
        } else if (emailType === "custom") {
          const { subject, title, body: mailBody } = payload;
          return await sendCustomEmail(member.email, subject, title, mailBody);
        } else if (emailType === "invitation") {
          const { eventName, eventDate, eventLocation, eventDesc } = payload;
          return await sendInvitationEmail(
            member.email,
            eventName,
            eventDate,
            eventLocation,
            eventDesc
          );
        }
      } catch (err) {
        console.error(`Failed to send email to ${member.email}:`, err);
        return false;
      }
    });

    const results = await Promise.allSettled(sendPromises);
    const successful = results.filter(
      (r) => r.status === "fulfilled" && r.value === true
    ).length;

    return NextResponse.json({
      success: true,
      message: `Broadcast complete. Sent ${successful} of ${recipients.length} emails.`,
      sentCount: successful,
      totalCount: recipients.length,
    });
  } catch (error) {
    console.error("Broadcast API error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

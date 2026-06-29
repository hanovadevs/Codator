import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateCodatorId } from "@/lib/id-generator";
import { signPassToken } from "@/lib/pass-token";
import { sendWelcomeEmail } from "@/lib/email";


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      full_name,
      university_roll,
      department,
      batch_year,
      email,
      phone,
      why_join,
      skills,
      position,
      role,
    } = body;

    // 1. Validate required fields
    if (!full_name || !university_roll || !department || !batch_year || !email || !position) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const supabase = await createClient();

    // 2. Verify caller is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // 3. Verify caller has admin role
    const { data: caller, error: callerError } = await supabase
      .from("members")
      .select("id, role, status")
      .or(`user_id.eq.${user.id},email.eq.${user.email}`)
      .maybeSingle();


    if (callerError || !caller || caller.role !== "admin" || caller.status !== "active") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    // 4. Check if email already exists
    const { data: existingMember } = await supabase
      .from("members")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingMember) {
      return NextResponse.json(
        { error: "A member with this email already exists." },
        { status: 409 }
      );
    }

    // 5. Generate UUID, sequential CODATOR ID, and sign pass token
    const memberId = crypto.randomUUID();
    const codatorId = await generateCodatorId();
    const passSecret = process.env.PASS_SECRET || "default_pass_secret_key_12345";

    const passToken = signPassToken(`${memberId}|${codatorId}`, passSecret);

    // 6. Insert new member into the database as active
    const { error: insertError } = await supabase.from("members").insert([
      {
        id: memberId,
        full_name,
        university_roll,
        department,
        batch_year,
        email,
        phone: phone || null,
        why_join: why_join || "Manually added by administrator",
        skills: skills || [],
        status: "active",
        codator_id: codatorId,
        pass_token: passToken,
        role: role || "member",
        position: position || "Member",
        approved_at: new Date().toISOString(),
        approved_by: caller.id,
      },
    ]);

    if (insertError) {
      console.error("Error creating member:", insertError);
      return NextResponse.json({ error: "Failed to insert member into database." }, { status: 500 });
    }

    // 7. Send welcome email with login link and credentials
    try {
      await sendWelcomeEmail({
        id: memberId,
        full_name,
        email,
        codator_id: codatorId,
      });
    } catch (emailErr) {

      console.error("Failed to send welcome email:", emailErr);
      // We do not fail the request if the email fails, but return a warning
      return NextResponse.json({
        status: "SUCCESS_EMAIL_ERROR",
        message: "Member created, but welcome email failed to send.",
        memberId,
        codatorId,
      });
    }

    return NextResponse.json({
      status: "SUCCESS",
      message: "Member created and welcome email sent successfully!",
      memberId,
      codatorId,
    });
  } catch (error) {
    console.error("API error in create member route:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

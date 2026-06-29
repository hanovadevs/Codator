import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateCodatorId } from "@/lib/id-generator";
import { signPassToken } from "@/lib/pass-token";
import { sendWelcomeEmail } from "@/lib/email";

interface ApproveParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: ApproveParams) {
  try {
    const { id } = await params;
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
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    // 3. Fetch the applicant details
    const { data: applicant, error: applicantError } = await supabase
      .from("members")
      .select("id, full_name, email, department, status")
      .eq("id", id)
      .single();

    if (applicantError || !applicant) {
      return NextResponse.json({ error: "Applicant not found." }, { status: 404 });
    }

    if (applicant.status !== "pending") {
      return NextResponse.json({ error: "Application is not in pending status." }, { status: 400 });
    }

    // 4. Generate unique sequential CODATOR ID
    const codatorId = await generateCodatorId();

    // 5. Generate signed pass token for QR code verification
    const passSecret = process.env.PASS_SECRET || "default_pass_secret_key_12345";
    const passToken = signPassToken(`${applicant.id}|${codatorId}`, passSecret);

    // 6. Update applicant status, credentials, and approval meta
    const { error: updateError } = await supabase
      .from("members")
      .update({
        status: "active",
        codator_id: codatorId,
        pass_token: passToken,
        approved_at: new Date().toISOString(),
        approved_by: caller.id,
      })
      .eq("id", id)
      .eq("status", "pending");

    if (updateError) {
      console.error("Database update error:", updateError);
      return NextResponse.json({ error: "Failed to approve application." }, { status: 500 });
    }

    // 7. Trigger welcome email automation (non-blocking or awaited)
    try {
      await sendWelcomeEmail({
        id: applicant.id,
        full_name: applicant.full_name,
        email: applicant.email,
        codator_id: codatorId,
      });
    } catch (emailErr) {
      // Log email errors but do not fail the HTTP request since the DB update was successful
      console.error("Welcome email failed to send:", emailErr);
    }

    return NextResponse.json({
      message: "Application approved successfully.",
      codatorId,
    }, { status: 200 });
  } catch (error) {
    console.error("API error in approve route:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

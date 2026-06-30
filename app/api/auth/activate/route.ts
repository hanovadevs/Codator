import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    // 1. Query the database using the Admin Client (bypasses RLS)
    const adminSupabase = createAdminClient();
    const { data: member, error: memberError } = await adminSupabase
      .from("members")
      .select("id, status")
      .eq("email", email)
      .maybeSingle();

    if (memberError) {
      console.error("Database error during verification:", memberError);
      return NextResponse.json({ error: "Database verification error. Please try again." }, { status: 500 });
    }

    if (!member) {
      return NextResponse.json(
        { error: "This email is not registered in our society database. Please apply to join first.", code: "NOT_REGISTERED" },
        { status: 400 }
      );
    }

    if (member.status === "pending") {
      return NextResponse.json(
        { error: "Your membership application is still pending. You will receive an email once approved." },
        { status: 400 }
      );
    }

    if (member.status === "rejected" || member.status === "suspended") {
      return NextResponse.json(
        { error: "Your membership account is suspended or inactive. Please contact the administrator." },
        { status: 400 }
      );
    }

    // 2. Perform the signup using the server client
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Account activated! Please check your email for the confirmation link to complete your login.",
    });
  } catch (error) {
    console.error("Activation API error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

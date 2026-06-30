import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    // 1. Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // 2. Verify caller has admin role
    const { data: caller, error: callerError } = await supabase
      .from("members")
      .select("role, status")
      .or(`user_id.eq.${user.id},email.eq.${user.email}`)
      .maybeSingle();

    if (callerError || !caller || caller.role !== "admin" || caller.status !== "active") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    // 3. Prepare upsert payload
    const upserts = Object.entries(body).map(([key, value]) => ({
      key,
      value: String(value),
    }));

    // 4. Upsert settings in database
    const { error: upsertError } = await supabase
      .from("society_settings")
      .upsert(upserts, { onConflict: "key" });

    if (upsertError) {
      console.error("Error upserting settings:", upsertError);
      return NextResponse.json({ error: "Failed to save settings." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Settings saved successfully!" });
  } catch (error) {
    console.error("Settings API error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

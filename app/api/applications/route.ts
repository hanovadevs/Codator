import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, rollNumber, department, batchYear, email, phone, whyJoin, skills } = body;

    // 1. Basic Validation
    if (!fullName || !rollNumber || !department || !batchYear || !email || !whyJoin) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // 2. Email domain validation
    if (!email.toLowerCase().endsWith(".edu") && !email.toLowerCase().includes(".edu.")) {
      return NextResponse.json(
        { error: "Please use your official university email (ending in .edu)." },
        { status: 400 }
      );
    }

    // 3. Initialize Supabase Client
    const supabase = await createClient();

    // 4. Insert application as pending member
    const { error } = await supabase
      .from("members")
      .insert([
        {
          full_name: fullName,
          university_roll: rollNumber,
          department: department,
          batch_year: batchYear,
          email: email.toLowerCase().trim(),
          phone: phone ? phone.trim() : null,
          why_join: whyJoin,
          skills: skills || [],
          status: "pending",
          role: "member",
        },
      ]);

    if (error) {
      // Catch unique key constraint violation (duplicate email)
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "An application with this email has already been submitted." },
          { status: 409 }
        );
      }
      
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to submit application." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Application submitted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("API error in /api/applications:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

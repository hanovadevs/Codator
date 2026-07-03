import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Rate limit: 3 applications per IP per 15 minutes
const MAX_APPLICATIONS = 3;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(request: Request) {
  try {
    // 0. Rate Limiting — check BEFORE parsing body
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`app:${clientIp}`, MAX_APPLICATIONS, WINDOW_MS);

    if (!rateCheck.allowed) {
      const retryAfterSeconds = Math.ceil((rateCheck.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        { error: "Too many applications submitted. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfterSeconds),
            "X-RateLimit-Limit": String(MAX_APPLICATIONS),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(rateCheck.resetAt),
          },
        }
      );
    }

    const body = await request.json();
    const { fullName, rollNumber, department, batchYear, email, phone, whyJoin, skills } = body;

    // 1. Basic Validation
    if (!fullName || !rollNumber || !department || !batchYear || !email || !whyJoin) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // 2. Input length validation (anti-spam)
    if (fullName.length > 100 || rollNumber.length > 30 || email.length > 100 || (whyJoin && whyJoin.length > 1000)) {
      return NextResponse.json(
        { error: "Input exceeds maximum allowed length." },
        { status: 400 }
      );
    }

    // 3. Email domain validation
    if (!email.toLowerCase().endsWith(".edu") && !email.toLowerCase().includes(".edu.")) {
      return NextResponse.json(
        { error: "Please use your official university email (ending in .edu)." },
        { status: 400 }
      );
    }

    // 4. Initialize Supabase Client
    const supabase = await createClient();

    // 5. Insert application as pending member
    const { error } = await supabase
      .from("members")
      .insert([
        {
          full_name: fullName.trim(),
          university_roll: rollNumber.trim(),
          department: department,
          batch_year: batchYear,
          email: email.toLowerCase().trim(),
          phone: phone ? phone.trim() : null,
          why_join: whyJoin.trim(),
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
      {
        status: 200,
        headers: {
          "X-RateLimit-Remaining": String(rateCheck.remaining),
        },
      }
    );
  } catch (error) {
    console.error("API error in /api/applications:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

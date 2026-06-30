import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyPassToken } from "@/lib/pass-token";

interface CheckInParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: CheckInParams) {
  try {
    const eventId = (await params).id;
    const { memberId, token, overrideRegister } = await request.json();

    if (!memberId || !token) {
      return NextResponse.json({ error: "Member ID and token are required." }, { status: 400 });
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
      .select("role, status")
      .or(`user_id.eq.${user.id},email.eq.${user.email}`)
      .maybeSingle();

    if (callerError || !caller || caller.role !== "admin" || caller.status !== "active") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    // 3. Fetch target member details to verify token
    const { data: member, error: memberError } = await supabase
      .from("members")
      .select("id, full_name, codator_id, status")
      .eq("id", memberId)
      .maybeSingle();

    if (memberError || !member) {
      return NextResponse.json({ error: "Member not found." }, { status: 404 });
    }

    if (member.status !== "active") {
      return NextResponse.json({ error: "This member account is not active." }, { status: 400 });
    }

    // 4. Cryptographically verify the pass token
    const passSecret = process.env.PASS_SECRET || "default_pass_secret_key_12345";
    const isValid = verifyPassToken(token, `${memberId}|${member.codator_id}`, passSecret);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid pass signature. Security verification failed." }, { status: 400 });
    }

    // 5. Check if the member is registered for this event
    const { data: registration, error: regError } = await supabase
      .from("event_registrations")
      .select("id, checked_in_at")
      .eq("event_id", eventId)
      .eq("member_id", memberId)
      .maybeSingle();

    if (regError) {
      console.error("Error querying registration:", regError);
      return NextResponse.json({ error: "Database error checking registration." }, { status: 500 });
    }

    // 6. Handle case where member is NOT registered
    if (!registration) {
      if (overrideRegister) {
        // Register & Check-in on the spot
        const { error: insertError } = await supabase.from("event_registrations").insert([
          {
            event_id: eventId,
            member_id: memberId,
            checked_in_at: new Date().toISOString(),
          },
        ]);

        if (insertError) {
          console.error("Error inserting registration override:", insertError);
          return NextResponse.json({ error: "Failed to register member on-the-spot." }, { status: 500 });
        }

        return NextResponse.json({
          status: "SUCCESS_OVERRIDE",
          message: "Registered and checked in successfully!",
          memberName: member.full_name,
          memberCodatorId: member.codator_id,
        });
      } else {
        // Return warning for client-side override prompt
        return NextResponse.json(
          {
            error: "NOT_REGISTERED",
            message: "Member is not registered for this event.",
            memberName: member.full_name,
            memberCodatorId: member.codator_id,
          },
          { status: 400 }
        );
      }
    }

    // 7. Handle case where member is already checked in
    if (registration.checked_in_at) {
      return NextResponse.json({
        status: "ALREADY_CHECKED_IN",
        message: "Already checked in.",
        memberName: member.full_name,
        memberCodatorId: member.codator_id,
      });
    }

    // 8. Normal Check-In: Update registration record
    const { error: updateError } = await supabase
      .from("event_registrations")
      .update({
        checked_in_at: new Date().toISOString(),
      })
      .eq("id", registration.id);

    if (updateError) {
      console.error("Error updating attendance:", updateError);
      return NextResponse.json({ error: "Failed to log attendance." }, { status: 500 });
    }

    return NextResponse.json({
      status: "SUCCESS",
      message: "Checked in successfully!",
      memberName: member.full_name,
      memberCodatorId: member.codator_id,
    });
  } catch (error) {
    console.error("API error in check-in route:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

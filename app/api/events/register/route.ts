import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { eventId } = await request.json();

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required." }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "You must be logged in to register." }, { status: 401 });
    }

    // 2. Verify user is an active member
    const { data: member, error: memberError } = await supabase
      .from("members")
      .select("id, status")
      .or(`user_id.eq.${user.id},email.eq.${user.email}`)
      .maybeSingle();

    if (memberError || !member || member.status !== "active") {
      return NextResponse.json(
        { error: "Only active society members can register for events. Please make sure your membership is approved." },
        { status: 403 }
      );
    }

    // 3. Fetch event details to check capacity
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, title, capacity, is_published")
      .eq("id", eventId)
      .single();

    if (eventError || !event || !event.is_published) {
      return NextResponse.json({ error: "Event not found or not published." }, { status: 404 });
    }

    // 4. Calculate current registrations for this event
    const { count: regCount, error: regCountError } = await supabase
      .from("event_registrations")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId);

    if (regCountError) {
      console.error("Error counting event registrations:", regCountError);
      return NextResponse.json({ error: "Failed to verify event capacity." }, { status: 500 });
    }

    if (regCount !== null && regCount >= event.capacity) {
      return NextResponse.json({ error: "This event is currently full." }, { status: 400 });
    }

    // 5. Register member for the event
    const { error: registerError } = await supabase.from("event_registrations").insert([
      {
        event_id: eventId,
        member_id: member.id,
      },
    ]);

    if (registerError) {
      // Check for duplicate registration (Postgres error code '23505')
      if (registerError.code === "23505") {
        return NextResponse.json({ error: "You are already registered for this event." }, { status: 409 });
      }

      console.error("Error creating event registration:", registerError);
      return NextResponse.json({ error: "Failed to register for the event." }, { status: 500 });
    }

    return NextResponse.json(
      { message: `Successfully registered for ${event.title}!`, memberId: member.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("API error in event registration:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

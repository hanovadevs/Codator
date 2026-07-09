import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendInvitationEmail } from "@/lib/email";

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
    const {
      id,
      title,
      slug,
      description,
      category,
      date_start,
      date_end,
      location,
      capacity,
      free_for_members,
      is_published,
      banner_url,
    } = body;

    if (!title?.trim() || !slug?.trim() || !description?.trim() || !date_start) {
      return NextResponse.json(
        { error: "Title, slug, description, and start date are required." },
        { status: 400 }
      );
    }

    const eventPayload = {
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim(),
      category,
      date_start,
      date_end: date_end || null,
      location: location?.trim() || "Virtual",
      capacity: Number(capacity) || 50,
      free_for_members: free_for_members !== false,
      is_published: !!is_published,
      banner_url: banner_url || null,
      created_by: caller.id,
    };

    let eventData;
    let isNewPublish = false;

    if (id) {
      // Fetch current event to check if we are publishing it now
      const { data: currentEvent } = await supabase
        .from("events")
        .select("is_published")
        .eq("id", id)
        .maybeSingle();

      const wasPublished = currentEvent?.is_published || false;
      isNewPublish = !wasPublished && !!is_published;

      // Update existing event
      const { data, error: updateError } = await supabase
        .from("events")
        .update(eventPayload)
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;
      eventData = data;
    } else {
      // Create new event
      isNewPublish = !!is_published;

      const { data, error: insertError } = await supabase
        .from("events")
        .insert([eventPayload])
        .select()
        .single();

      if (insertError) throw insertError;
      eventData = data;
    }

    // 4. Send email notifications to all active members if the event is published
    let emailsSent = 0;
    let emailsTotal = 0;

    if (isNewPublish) {
      const { data: members, error: membersError } = await supabase
        .from("members")
        .select("id, email, full_name")
        .eq("status", "active")
        .not("email", "is", null);

      if (!membersError && members && members.length > 0) {
        emailsTotal = members.length;
        const eventDateStr = new Date(date_start).toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        const sendPromises = members.map(async (member) => {
          try {
            if (!member.email) return false;
            return await sendInvitationEmail(
              member.email,
              title.trim(),
              eventDateStr,
              location?.trim() || "Virtual",
              description.trim()
            );
          } catch (err) {
            console.error(`Failed to send event invite to ${member.email}:`, err);
            return false;
          }
        });

        const results = await Promise.allSettled(sendPromises);
        emailsSent = results.filter(
          (r) => r.status === "fulfilled" && r.value === true
        ).length;
      }
    }

    return NextResponse.json({
      success: true,
      event: eventData,
      emailsSent,
      emailsTotal,
      published: isNewPublish,
    });
  } catch (error) {
    console.error("Error in events admin API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

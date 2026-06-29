import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase/admin";
import QRCode from "qrcode";

export const revalidate = 0; // Disable caching

interface PassRouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: PassRouteParams) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    // 1. Fetch member details
    const { data: member, error } = await supabase
      .from("members")
      .select("id, full_name, codator_id, department, batch_year, pass_token, status")
      .eq("id", id)
      .single();

    if (error || !member) {
      // If member not found, render an "Invalid Pass" image
      return new ImageResponse(
        (
          <div style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#1C1B29",
            color: "#F2756B",
            fontFamily: "sans-serif",
            padding: "40px",
            textAlign: "center"
          }}>
            <span style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "10px" }}>Invalid Pass</span>
            <span style={{ fontSize: "14px", opacity: 0.7, color: "#FAFAFC" }}>This membership pass does not exist or has been revoked.</span>
          </div>
        ),
        { width: 400, height: 600 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const verificationUrl = `${siteUrl}/verify?id=${member.id}&token=${member.pass_token}`;

    // 2. Generate QR Code as Data URL
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      margin: 1,
      width: 300,
      color: {
        dark: "#1C1B29", // Ink
        light: "#FAFAFC", // Paper
      },
    });

    // 3. Render and return the PNG Pass Image
    return new ImageResponse(
      (
        <div style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#1C1B29", // Deep ink
          backgroundImage: "linear-gradient(135deg, rgba(139, 127, 232, 0.25) 0%, rgba(28, 27, 41, 0) 50%), linear-gradient(315deg, rgba(91, 141, 239, 0.25) 0%, rgba(28, 27, 41, 0) 50%)",
          padding: "35px",
          color: "#FAFAFC",
          fontFamily: "sans-serif",
          boxSizing: "border-box",
        }}>
          {/* Top Header Row */}
          <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "20px", fontWeight: "bold", color: "#8B7FE8", letterSpacing: "-0.5px" }}>CODATOR</span>
              <span style={{ fontSize: "9px", textTransform: "uppercase", color: "#E8E7F0", opacity: 0.5, letterSpacing: "1px", marginTop: "2px" }}>Digital Member Pass</span>
            </div>
            <div style={{
              display: "flex",
              backgroundColor: "rgba(139, 127, 232, 0.15)",
              border: "1px solid rgba(139, 127, 232, 0.3)",
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "9px",
              fontWeight: "bold",
              color: "#8B7FE8",
              letterSpacing: "0.5px"
            }}>
              {member.status === "active" ? "VERIFIED MEMBER" : member.status.toUpperCase()}
            </div>
          </div>

          {/* QR Code Graphic */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#FAFAFC",
            padding: "16px",
            borderRadius: "16px",
            alignSelf: "center",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4)",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrCodeDataUrl} style={{ width: "180px", height: "180px" }} alt="QR Code" />
          </div>

          {/* Footer Details */}
          <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
            <span style={{ fontSize: "9px", textTransform: "uppercase", color: "#E8E7F0", opacity: 0.5, letterSpacing: "1px", marginBottom: "4px" }}>
              Member ID
            </span>
            <span style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#8B7FE8",
              letterSpacing: "1.5px",
              fontFamily: "monospace",
              marginBottom: "20px",
            }}>
              {member.codator_id || "PENDING"}
            </span>

            {/* Bottom meta row */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              borderTop: "1px solid rgba(232, 231, 240, 0.15)",
              paddingTop: "15px",
              width: "100%"
            }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "15px", fontWeight: "bold", color: "#FAFAFC" }}>
                  {member.full_name}
                </span>
                <span style={{ fontSize: "10px", color: "#E8E7F0", opacity: 0.6, marginTop: "2px" }}>
                  {member.department}
                </span>
              </div>
              <span style={{ fontSize: "10px", color: "#E8E7F0", opacity: 0.6, fontWeight: "bold" }}>
                {member.batch_year}
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 400,
        height: 600,
      }
    );
  } catch (error) {
    console.error("Error generating pass image:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

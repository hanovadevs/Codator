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
            backgroundColor: "#F9F9FB",
            color: "#EF4444",
            fontFamily: "sans-serif",
            padding: "40px",
            textAlign: "center",
            border: "1px solid #E8E7F0",
          }}>
            <span style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "10px" }}>Invalid Pass</span>
            <span style={{ fontSize: "14px", opacity: 0.7, color: "#1C1B29" }}>This membership pass does not exist or has been revoked.</span>
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
        light: "#FFFFFF", // White
      },
    });

    // 3. Render and return the PNG Pass Image (Premium Light Theme)
    return new ImageResponse(
      (
        <div style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#F9F9FB", // Soft white/paper
          backgroundImage: "linear-gradient(135deg, rgba(237, 234, 251, 0.7) 0%, rgba(255, 255, 255, 0.4) 50%), linear-gradient(315deg, rgba(240, 253, 250, 0.7) 0%, rgba(255, 255, 255, 0.4) 50%), linear-gradient(45deg, rgba(254, 251, 232, 0.5) 0%, rgba(255, 255, 255, 0.4) 100%)",
          padding: "35px",
          color: "#1C1B29",
          fontFamily: "sans-serif",
          boxSizing: "border-box",
          border: "1.5px solid #E8E7F0",
        }}>
          {/* Top Header Row */}
          <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "22px", fontWeight: "900", color: "#8B7FE8", letterSpacing: "-0.5px" }}>CODATOR</span>
              <span style={{ fontSize: "9px", textTransform: "uppercase", color: "#1C1B29", opacity: 0.5, fontWeight: "700", letterSpacing: "1px", marginTop: "3px" }}>Digital Member Pass</span>
            </div>
            
            {/* Hologram Smart Chip */}
            <div style={{
              display: "flex",
              width: "32px",
              height: "24px",
              background: "linear-gradient(135deg, #FEF08A 0%, #FDE047 50%, #CA8A04 100%)",
              border: "1px solid #EAB308",
              borderRadius: "6px",
              boxShadow: "0 2px 4px rgba(234, 179, 8, 0.15)",
              position: "relative",
              overflow: "hidden"
            }}>
              <div style={{ position: "absolute", left: "8px", top: "0", bottom: "0", width: "1px", backgroundColor: "rgba(202, 138, 4, 0.4)" }} />
              <div style={{ position: "absolute", left: "16px", top: "0", bottom: "0", width: "1px", backgroundColor: "rgba(202, 138, 4, 0.4)" }} />
              <div style={{ position: "absolute", left: "24px", top: "0", bottom: "0", width: "1px", backgroundColor: "rgba(202, 138, 4, 0.4)" }} />
              <div style={{ position: "absolute", top: "8px", left: "0", right: "0", height: "1px", backgroundColor: "rgba(202, 138, 4, 0.4)" }} />
              <div style={{ position: "absolute", top: "16px", left: "0", right: "0", height: "1px", backgroundColor: "rgba(202, 138, 4, 0.4)" }} />
            </div>
          </div>

          {/* QR Code Graphic (Frosted Glass Container) */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.75)",
            padding: "16px",
            borderRadius: "24px",
            alignSelf: "center",
            boxShadow: "0 8px 30px rgba(139, 127, 232, 0.08)",
            border: "1px solid rgba(232, 231, 240, 0.8)",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrCodeDataUrl} style={{ width: "170px", height: "170px", borderRadius: "12px" }} alt="QR Code" />
          </div>

          {/* Footer Details */}
          <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <span style={{ fontSize: "9px", textTransform: "uppercase", color: "#1C1B29", opacity: 0.5, fontWeight: "700", letterSpacing: "1px" }}>
                Member ID
              </span>
              
              {/* Status Badge */}
              <div style={{
                display: "flex",
                backgroundColor: member.status === "active" ? "#ECFDF5" : "#FEF3C7",
                border: member.status === "active" ? "1px solid #A7F3D0" : "1px solid #FDE68A",
                padding: "3px 8px",
                borderRadius: "6px",
                fontSize: "8px",
                fontWeight: "800",
                color: member.status === "active" ? "#065F46" : "#92400E",
                letterSpacing: "0.5px"
              }}>
                {member.status === "active" ? "VERIFIED" : member.status.toUpperCase()}
              </div>
            </div>
            
            <span style={{
              fontSize: "26px",
              fontWeight: "900",
              color: "#8B7FE8",
              letterSpacing: "1.5px",
              fontFamily: "monospace",
              marginBottom: "22px",
            }}>
              {member.codator_id || "PENDING"}
            </span>

            {/* Bottom meta row */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              borderTop: "1.5px solid #E8E7F0",
              paddingTop: "15px",
              width: "100%"
            }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "16px", fontWeight: "900", color: "#1C1B29", letterSpacing: "-0.3px" }}>
                  {member.full_name}
                </span>
                <span style={{ fontSize: "10px", color: "#1C1B29", opacity: 0.6, fontWeight: "600", marginTop: "3px" }}>
                  {member.department}
                </span>
              </div>
              <span style={{ fontSize: "11px", color: "#8B7FE8", fontWeight: "800" }}>
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

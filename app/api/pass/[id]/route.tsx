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
      .select("id, full_name, codator_id, department, batch_year, pass_token, status, position")
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

    const cleanPosition = (pos: string | null | undefined): string => {
      if (!pos) return "Member";
      let clean = pos
        .replace(/::\w+/g, "") // Remove ::text
        .replace(/'/g, "")     // Remove single quotes
        .replace(/"/g, "")     // Remove double quotes
        .trim();
      if (!clean || clean.toLowerCase() === "member") {
        return "Member";
      }
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    };

    const cleanPos = cleanPosition(member.position);
    const displayPosition = member.department 
      ? `${cleanPos} of ${member.department}` 
      : cleanPos;

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
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#F9F9FB", // Soft white/paper
          backgroundImage: "linear-gradient(135deg, rgba(237, 234, 251, 0.8) 0%, rgba(255, 255, 255, 0.5) 50%), linear-gradient(315deg, rgba(240, 253, 250, 0.8) 0%, rgba(255, 255, 255, 0.5) 50%), linear-gradient(0deg, transparent 24%, rgba(139, 127, 232, 0.02) 25%, rgba(139, 127, 232, 0.02) 26%, transparent 27%, transparent 74%, rgba(139, 127, 232, 0.02) 75%, rgba(139, 127, 232, 0.02) 76%, transparent 77%), linear-gradient(90deg, transparent 24%, rgba(139, 127, 232, 0.02) 25%, rgba(139, 127, 232, 0.02) 26%, transparent 27%, transparent 74%, rgba(139, 127, 232, 0.02) 75%, rgba(139, 127, 232, 0.02) 76%, transparent 77%)",
          backgroundSize: "100% 100%, 100% 100%, 25px 25px, 25px 25px",
          padding: "35px",
          color: "#1C1B29",
          fontFamily: "sans-serif",
          boxSizing: "border-box",
          border: "1.5px solid #E8E7F0",
        }}>
          {/* Tech Metadata Coordinates */}
          <span style={{ position: "absolute", top: "15px", left: "15px", fontSize: "7px", fontFamily: "monospace", color: "#8B7FE8", opacity: 0.35, fontWeight: "700" }}>SYS_OP.VER.1.4.0</span>
          <span style={{ position: "absolute", top: "15px", right: "15px", fontSize: "7px", fontFamily: "monospace", color: "#8B7FE8", opacity: 0.35, fontWeight: "700" }}>SEC_LOC.SYS_MGR</span>
          <span style={{ position: "absolute", bottom: "15px", left: "15px", fontSize: "7px", fontFamily: "monospace", color: "#8B7FE8", opacity: 0.35, fontWeight: "700" }}>CODATOR_CORP_SEAL</span>

          {/* Top Header Row */}
          <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "flex-start", marginTop: "5px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "22px", fontWeight: "900", color: "#8B7FE8", letterSpacing: "-0.5px" }}>CODATOR</span>
              <span style={{ fontSize: "9px", textTransform: "uppercase", color: "#1C1B29", opacity: 0.5, fontWeight: "700", letterSpacing: "1px", marginTop: "3px" }}>Digital Member Pass</span>
            </div>
            
            {/* Hologram Smart Chip - Futuristic Platinum/Silver */}
            <div style={{
              display: "flex",
              width: "32px",
              height: "24px",
              background: "linear-gradient(135deg, #F1F5F9 0%, #CBD5E1 50%, #64748B 100%)",
              border: "1.5px solid #94A3B8",
              borderRadius: "6px",
              boxShadow: "0 2px 6px rgba(148, 163, 184, 0.2)",
              position: "relative",
              overflow: "hidden"
            }}>
              <div style={{ position: "absolute", left: "8px", top: "0", bottom: "0", width: "1px", backgroundColor: "rgba(100, 116, 139, 0.3)" }} />
              <div style={{ position: "absolute", left: "16px", top: "0", bottom: "0", width: "1px", backgroundColor: "rgba(100, 116, 139, 0.3)" }} />
              <div style={{ position: "absolute", left: "24px", top: "0", bottom: "0", width: "1px", backgroundColor: "rgba(100, 116, 139, 0.3)" }} />
              <div style={{ position: "absolute", top: "8px", left: "0", right: "0", height: "1px", backgroundColor: "rgba(100, 116, 139, 0.3)" }} />
              <div style={{ position: "absolute", top: "16px", left: "0", right: "0", height: "1px", backgroundColor: "rgba(100, 116, 139, 0.3)" }} />
            </div>
          </div>

          {/* QR Code Graphic (Frosted Glass Container with Futuristic thin border) */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            padding: "16px",
            borderRadius: "24px",
            alignSelf: "center",
            boxShadow: "0 10px 35px rgba(139, 127, 232, 0.06)",
            border: "1px solid rgba(139, 127, 232, 0.2)",
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
              
              {/* Status Badge - Sleek Outline */}
              <div style={{
                display: "flex",
                backgroundColor: "transparent",
                border: member.status === "active" ? "1px solid #10B981" : "1px solid #F59E0B",
                padding: "3px 8px",
                borderRadius: "4px",
                fontSize: "8px",
                fontWeight: "800",
                color: member.status === "active" ? "#10B981" : "#F59E0B",
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
              borderTop: "1px solid rgba(139, 127, 232, 0.2)",
              paddingTop: "15px",
              width: "100%"
            }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "16px", fontWeight: "900", color: "#1C1B29", letterSpacing: "-0.3px" }}>
                  {member.full_name}
                </span>
                <span style={{ fontSize: "10px", color: "#1C1B29", opacity: 0.6, fontWeight: "600", marginTop: "3px" }}>
                  {displayPosition}
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

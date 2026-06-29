import { createClient } from "@/lib/supabase/server";
import IdCardClient from "@/components/portal/id-card-client";
import QRCode from "qrcode";

export const revalidate = 0; // Dynamic page

export default async function PortalIdCardPage() {
  const supabase = await createClient();

  // 1. Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. Fetch member profile
  const { data: member } = await supabase
    .from("members")
    .select("id, full_name, codator_id, department, batch_year, pass_token")
    .or(`user_id.eq.${user?.id},email.eq.${user?.email}`)
    .single();

  if (!member) {
    return null;
  }

  // 3. Generate QR code on the server
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const verificationUrl = `${siteUrl}/verify?id=${member.id}&token=${member.pass_token}`;

  const qrCodeUrl = await QRCode.toDataURL(verificationUrl, {
    margin: 1,
    width: 300,
    color: {
      dark: "#1C1B29", // Ink
      light: "#FAFAFC", // Paper
    },
  });

  return (
    <div className="flex justify-center py-4">
      <IdCardClient member={member} qrCodeUrl={qrCodeUrl} />
    </div>
  );
}

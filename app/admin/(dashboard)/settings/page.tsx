import { createClient } from "@/lib/supabase/server";
import SettingsClient from "@/components/admin/settings-client";

export const revalidate = 0; // Dynamic page

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  // Fetch all settings from database
  const { data: dbSettings } = await supabase
    .from("society_settings")
    .select("key, value");

  // Format settings into a key-value object with default fallbacks
  const settings: Record<string, string> = {
    society_name: "CODATOR",
    contact_email: "contact@codator.org",
    registrations_open: "true",
    allowed_domains: ".edu, .edu.pk",
  };

  if (dbSettings) {
    dbSettings.forEach((item) => {
      settings[item.key] = item.value;
    });
  }

  return <SettingsClient initialSettings={settings} />;
}

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Generates a unique, sequential CODATOR ID for a newly approved member.
 * Format: CODATOR-YY-SEQ (e.g., CODATOR-26-0143)
 * Queries the database for the highest existing ID in the current year and increments it.
 */
export async function generateCodatorId(): Promise<string> {
  const supabase = createAdminClient();
  const year = new Date().getFullYear().toString().slice(-2); // e.g., "26"

  // Query the highest codator_id for the current year
  const { data, error } = await supabase
    .from("members")
    .select("codator_id")
    .like("codator_id", `CODATOR-${year}-%`)
    .order("codator_id", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Error querying last CODATOR ID:", error);
    throw new Error("Failed to generate member sequence ID.");
  }

  let nextSeqNum = 1;

  if (data && data.length > 0 && data[0].codator_id) {
    const lastId = data[0].codator_id;
    const parts = lastId.split("-");
    if (parts.length === 3) {
      const lastSeq = parseInt(parts[2], 10);
      if (!isNaN(lastSeq)) {
        nextSeqNum = lastSeq + 1;
      }
    }
  }

  const seq = String(nextSeqNum).padStart(4, "0");
  return `CODATOR-${year}-${seq}`;
}

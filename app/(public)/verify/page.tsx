import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPassToken } from "@/lib/pass-token";
import { CheckCircle2, XCircle, ShieldCheck, Award, ArrowRight } from "lucide-react";

export const revalidate = 0; // Dynamic verification page

interface VerifyPageProps {
  searchParams: Promise<{ id?: string; token?: string }>;
}

export default async function PublicVerifyPage({ searchParams }: VerifyPageProps) {
  const { id, token } = await searchParams;

  let isValid = false;
  let member = null;
  let errorDetail = "";

  if (id && token) {
    const supabase = createAdminClient();

    // 1. Fetch member details from database
    const { data, error } = await supabase
      .from("members")
      .select("id, full_name, codator_id, department, batch_year, status")
      .eq("id", id)
      .maybeSingle();


    if (error || !data) {
      errorDetail = "Member record not found.";
    } else if (data.status !== "active") {
      errorDetail = "This member account is currently inactive.";
    } else {
      member = data;
      // 2. Cryptographically verify the token signature
      const passSecret = process.env.PASS_SECRET || "default_pass_secret_key_12345";
      isValid = verifyPassToken(`${id}|${member.codator_id}`, token, passSecret);
      
      if (!isValid) {
        errorDetail = "Pass signature verification failed. The pass may have been tampered with.";
      }
    }
  } else {
    errorDetail = "Missing pass identification credentials.";
  }

  return (
    <div className="min-h-screen bg-paper pt-28 pb-20 text-ink flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {isValid && member ? (
          /* ================= VERIFIED SUCCESS CARD ================= */
          <div className="border border-emerald-100 bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl relative overflow-hidden text-center space-y-6">
            {/* Soft Green background glow */}
            <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

            {/* Checkmark Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-xs">
              <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
            </div>

            <div className="space-y-1.5">
              <span className="text-5xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full inline-flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 fill-emerald-100" />
                Verified CODATOR Member
              </span>
              <h1 className="font-display text-2xl font-black text-ink tracking-tight pt-2">
                Verification Successful
              </h1>
              <p className="text-xs text-ink/60">This digital pass is authentic and active.</p>
            </div>

            {/* Member Details */}
            <div className="bg-paper/50 border border-mist/80 rounded-2xl p-5 text-left space-y-3.5 text-xs font-semibold text-ink/75">
              <div className="flex justify-between border-b border-mist pb-2.5">
                <span className="text-ink/50 font-bold uppercase tracking-wider text-4xs">Name</span>
                <span className="text-ink font-bold">{member.full_name}</span>
              </div>
              <div className="flex justify-between border-b border-mist pb-2.5">
                <span className="text-ink/50 font-bold uppercase tracking-wider text-4xs">Member ID</span>
                <span className="font-mono text-wisteria font-bold tracking-wide">{member.codator_id}</span>
              </div>
              <div className="flex justify-between border-b border-mist pb-2.5">
                <span className="text-ink/50 font-bold uppercase tracking-wider text-4xs">Department</span>
                <span>{member.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/50 font-bold uppercase tracking-wider text-4xs">Batch Year</span>
                <span>{member.batch_year}</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-wisteria hover:underline"
              >
                <span>Back to Homepage</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* ================= VERIFICATION FAILED CARD ================= */
          <div className="border border-red-100 bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl relative overflow-hidden text-center space-y-6">
            {/* Soft Red background glow */}
            <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-red-500/10 blur-3xl pointer-events-none" />

            {/* Error Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-200">
              <XCircle className="h-8 w-8 stroke-[2.5]" />
            </div>

            <div className="space-y-1.5">
              <span className="text-5xs font-bold uppercase tracking-widest text-red-700 bg-red-50 border border-red-100 px-3 py-1 rounded-full inline-flex items-center gap-1">
                Invalid Pass
              </span>
              <h1 className="font-display text-2xl font-black text-ink tracking-tight pt-2">
                Verification Failed
              </h1>
              <p className="text-xs text-red-600/80 font-medium leading-relaxed max-w-xs mx-auto">
                {errorDetail || "The scanned pass is invalid, expired, or has been revoked."}
              </p>
            </div>

            <div className="bg-paper/50 border border-mist/80 rounded-2xl p-5 text-left text-4xs text-ink/65 leading-relaxed space-y-2">
              <p className="font-bold text-ink/80">Security Notice:</p>
              <p>• Only official passes signed by the CODATOR authentication server are valid.</p>
              <p>• If you believe this is an error, please contact the society administrators.</p>
            </div>

            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-wisteria hover:underline"
              >
                <span>Back to Homepage</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

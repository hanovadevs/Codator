"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, AlertCircle, ArrowRight, Loader2, Calendar } from "lucide-react";

interface RegistrationSectionProps {
  eventId: string;
  isLoggedIn: boolean;
  isMember: boolean;
  initialRegistered: boolean;
  isFull: boolean;
  isPast: boolean;
}

export default function RegistrationSection({
  eventId,
  isLoggedIn,
  isMember,
  initialRegistered,
  isFull,
  isPast,
}: RegistrationSectionProps) {
  const [isRegistered, setIsRegistered] = useState(initialRegistered);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async () => {
    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/events/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to register.");
      }

      setIsRegistered(true);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "An error occurred during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  // 1. If event is in the past
  if (isPast) {
    return (
      <div className="rounded-2xl border border-mist bg-paper/20 p-6 text-center text-ink/50">
        <p className="text-sm font-semibold">This event has already concluded.</p>
      </div>
    );
  }

  // 2. If already registered
  if (isRegistered) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-6 text-center shadow-xs">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h4 className="mt-3 font-display text-base font-bold text-emerald-950">{"You're Registered!"}</h4>
        <p className="mt-1 text-xs text-emerald-800/80 leading-relaxed">
          We have reserved your spot. Your virtual event pass is active. Remember to present your member pass QR code at check-in.
        </p>
        <div className="mt-4">
          <Link
            href="/portal"
            className="inline-flex items-center gap-1 text-xs font-semibold text-wisteria hover:underline"
          >
            <span>View Pass in Portal</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  // 3. If not logged in
  if (!isLoggedIn) {
    return (
      <div className="rounded-2xl border border-mist bg-paper/30 p-6 text-center">
        <h4 className="font-display text-base font-bold text-ink">Register for Event</h4>
        <p className="mt-1.5 text-xs text-ink/65 leading-relaxed">
          Only registered members of CODATOR can attend this event. Please log in or apply for membership.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Link
            href="/admin/login"
            className="inline-flex w-full items-center justify-center rounded-lg bg-wisteria px-4 py-2.5 text-center text-sm font-bold text-paper hover:bg-wisteria/90 transition-colors cursor-pointer"
          >
            Log In as Member
          </Link>
          <Link
            href="/join"
            className="inline-flex w-full items-center justify-center rounded-lg border border-mist bg-paper/30 px-4 py-2.5 text-center text-sm font-bold text-ink/80 hover:bg-wisteria-tint/20 hover:text-wisteria transition-colors cursor-pointer"
          >
            Apply for Membership
          </Link>
        </div>
      </div>
    );
  }

  // 4. If logged in but not an active member
  if (!isMember) {
    return (
      <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-6 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <AlertCircle className="h-5 w-5" />
        </div>
        <h4 className="mt-3 font-display text-base font-bold text-amber-950">Membership Pending</h4>
        <p className="mt-1.5 text-xs text-amber-800/80 leading-relaxed">
          Your membership application is currently being reviewed by our administrators. You will be able to register once your membership is approved.
        </p>
      </div>
    );
  }

  // 5. If event is full
  if (isFull) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50/30 p-6 text-center">
        <h4 className="font-display text-base font-bold text-red-950">Event is Full</h4>
        <p className="mt-1.5 text-xs text-red-800/80 leading-relaxed">
          All seats have been reserved. Keep an eye on our channel in case any spots open up!
        </p>
      </div>
    );
  }

  // 6. Default: Register Button
  return (
    <div className="rounded-2xl border border-mist bg-paper/30 p-6 shadow-xs">
      <h4 className="font-display text-base font-bold text-ink">Register for Event</h4>
      <p className="mt-1 text-xs text-ink/60">Secure your spot with one click.</p>

      {errorMsg && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-800 border border-red-200">
          {errorMsg}
        </div>
      )}

      <button
        onClick={handleRegister}
        disabled={isLoading}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-wisteria px-4 py-3 text-center text-sm font-bold text-paper hover:bg-wisteria/90 transition-colors disabled:opacity-60 cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Reserving spot...</span>
          </>
        ) : (
          <>
            <Calendar className="h-4 w-4" />
            <span>Confirm One-Click Registration</span>
          </>
        )}
      </button>
      <p className="text-4xs text-center text-ink/40 mt-3">
        By registering, you agree to attend this session. Passes are non-transferable.
      </p>
    </div>
  );
}

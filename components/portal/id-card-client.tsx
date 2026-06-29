"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Download, HelpCircle, RefreshCw, CheckCircle } from "lucide-react";

interface MemberPayload {
  id: string;
  full_name: string;
  codator_id: string;
  department: string;
  batch_year: string;
  pass_token: string;
}

interface IdCardClientProps {
  member: MemberPayload;
  qrCodeUrl: string;
}

export default function IdCardClient({ member, qrCodeUrl }: IdCardClientProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // 3D Hover Tilt Effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-170, 170], [12, -12]);
  const rotateY = useTransform(x, [-110, 110], [-12, 12]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left - width / 2;
    const mouseY = event.clientY - rect.top - height / 2;
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/pass/${member.id}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `codator-pass-${member.codator_id}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download pass:", err);
      alert("Failed to download pass card. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Generate initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="flex flex-col items-center gap-10">
      <div className="text-center max-w-md">
        <h1 className="font-display text-3xl font-bold text-ink">My Member ID & Pass</h1>
        <p className="text-sm text-ink/65 mt-2">
          Hover to tilt, click to flip. Present the QR code on the back to check-in at society events.
        </p>
      </div>

      {/* 3D Card Wrapper */}
      <div className="perspective-[1000px] w-full max-w-[340px] aspect-[1/1.58] cursor-pointer relative select-none">
        <motion.div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={() => setIsFlipped(!isFlipped)}
          style={{
            rotateX: isFlipped ? 0 : rotateX,
            rotateY: isFlipped ? 180 : rotateY,
            transformStyle: "preserve-3d",
          }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 80 }}
          className="w-full h-full relative duration-150 rounded-3xl border border-mist shadow-2xl"
        >
          {/* ================= CARD FRONT ================= */}
          <div
            style={{ backfaceVisibility: "hidden" }}
            className="absolute inset-0 w-full h-full bg-[#13121A] rounded-3xl p-7 flex flex-col justify-between overflow-hidden border border-wisteria/15"
          >
            {/* Ambient Background Glows */}
            <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-wisteria/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-skyline/20 blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-start z-10">
              <div className="flex flex-col">
                <span className="font-display text-lg font-black tracking-tight text-wisteria">CODATOR</span>
                <span className="text-4xs font-bold uppercase tracking-wider text-ink/40 mt-0.5">Member Identity</span>
              </div>
              <div className="h-8 w-11 rounded bg-gradient-to-tr from-amber-400/40 via-yellow-300/30 to-amber-200/50 border border-amber-300/20 relative overflow-hidden shadow-inner flex items-center justify-center opacity-85">
                {/* Holographic foil chip lines */}
                <div className="absolute inset-x-3 inset-y-2 border-r border-b border-amber-500/25" />
                <div className="absolute inset-x-1 inset-y-3.5 border-t border-b border-amber-500/25" />
              </div>
            </div>

            {/* Center Avatar & Name */}
            <div className="flex flex-col items-center text-center z-10 my-auto">
              <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-wisteria to-skyline flex items-center justify-center font-display text-xl font-bold text-paper shadow-md border border-paper/10 mb-4">
                {getInitials(member.full_name)}
              </div>
              <h2 className="font-display text-lg font-bold text-paper tracking-tight leading-snug line-clamp-1">
                {member.full_name}
              </h2>
              <span className="text-3xs text-ink/50 font-semibold mt-1">{member.department}</span>
            </div>

            {/* Footer details */}
            <div className="border-t border-mist/30 pt-4 flex justify-between items-end z-10">
              <div className="flex flex-col">
                <span className="text-4xs font-bold uppercase tracking-wider text-ink/40">Member ID</span>
                <span className="font-mono text-sm font-bold text-wisteria mt-0.5 tracking-wide">
                  {member.codator_id}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-4xs font-bold uppercase tracking-wider text-ink/40">Batch</span>
                <span className="text-2xs font-bold text-paper mt-0.5">{member.batch_year}</span>
              </div>
            </div>
          </div>

          {/* ================= CARD BACK ================= */}
          <div
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
            className="absolute inset-0 w-full h-full bg-[#1C1B29] rounded-3xl p-7 flex flex-col justify-between overflow-hidden border border-wisteria/15"
          >
            {/* Ambient Background Glows */}
            <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-skyline/20 blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-mist/20">
              <div className="flex flex-col">
                <span className="font-display text-sm font-bold text-wisteria">CODATOR</span>
                <span className="text-5xs font-bold uppercase tracking-wider text-ink/40">Event Access Pass</span>
              </div>
              <span className="rounded bg-wisteria-tint/40 border border-wisteria/10 px-2 py-0.5 text-4xs font-bold uppercase tracking-wider text-wisteria">
                VERIFIED
              </span>
            </div>

            {/* QR Code */}
            <div className="my-auto flex flex-col items-center gap-3">
              <div className="bg-paper p-3 rounded-2xl shadow-md border border-mist">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCodeUrl} alt="Pass QR Code" className="h-36 w-36 object-contain" />
              </div>
              <span className="text-5xs text-ink/40 font-semibold tracking-wider uppercase">
                Scan at Event Check-in
              </span>
            </div>

            {/* Usage guidelines */}
            <div className="text-4xs text-ink/55 leading-relaxed space-y-1 bg-paper/20 border border-mist/35 p-3 rounded-xl">
              <p className="font-semibold text-wisteria">Pass Rules:</p>
              <p>1. Present this QR code at society events for attendance registration.</p>
              <p>2. Access is non-transferable and tied to your student account.</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="inline-flex items-center gap-2 rounded-lg border border-mist bg-paper/30 px-4 py-2.5 text-xs font-semibold text-ink/75 hover:bg-wisteria-tint/25 hover:text-wisteria transition-colors cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Flip Card</span>
        </button>

        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="inline-flex items-center gap-2 rounded-lg bg-wisteria px-4 py-2.5 text-xs font-semibold text-paper hover:bg-wisteria/90 transition-colors cursor-pointer disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          <span>{isDownloading ? "Downloading..." : "Download Pass"}</span>
        </button>
      </div>
    </div>
  );
}

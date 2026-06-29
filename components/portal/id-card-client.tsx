"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Download, RefreshCw, Mail, Phone, Hash, Award, CheckCircle, Shield } from "lucide-react";

interface MemberPayload {
  id: string;
  full_name: string;
  codator_id: string;
  department: string;
  batch_year: string;
  university_roll: string;
  email: string;
  phone: string | null;
  role: string;
  skills: string[];
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
          className="w-full h-full relative duration-150 rounded-3xl border border-mist/80 shadow-xl"
        >
          {/* ================= CARD FRONT (LIGHT THEME) ================= */}
          <div
            style={{ backfaceVisibility: "hidden" }}
            className="absolute inset-0 w-full h-full bg-white/90 backdrop-blur-md rounded-3xl p-6 flex flex-col justify-between overflow-hidden border border-white/60"
          >
            {/* Ambient Background Glows (Mesh pastel gradients) */}
            <div className="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-wisteria/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-skyline/15 blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full bg-amber-200/10 blur-2xl pointer-events-none" />

            {/* Top Bar */}
            <div className="flex justify-between items-start z-10">
              <div className="flex flex-col">
                <span className="font-display text-lg font-black tracking-tight bg-gradient-to-r from-wisteria to-skyline bg-clip-text text-transparent">
                  CODATOR
                </span>
                <span className="text-5xs font-bold uppercase tracking-widest text-ink/45 mt-0.5">
                  Member Identity
                </span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <span className="rounded-full bg-wisteria/10 border border-wisteria/20 px-2.5 py-0.5 text-5xs font-bold uppercase tracking-wider text-wisteria flex items-center gap-1">
                  <span className="h-1 w-1 rounded-full bg-wisteria animate-pulse" />
                  {member.role === "admin" ? "Admin" : "Member"}
                </span>
                
                {/* Holographic Chip */}
                <div className="h-7 w-9 rounded-md bg-gradient-to-tr from-slate-300 via-slate-100 to-slate-200 border border-slate-200/60 relative overflow-hidden shadow-xs flex items-center justify-center opacity-90">
                  <div className="absolute inset-x-2.5 inset-y-1.5 border-r border-b border-slate-400/20" />
                  <div className="absolute inset-x-0.5 inset-y-2.5 border-t border-b border-slate-400/20" />
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex gap-4 items-center z-10 my-auto">
              {/* Avatar */}
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-wisteria-tint via-white to-skyline-tint flex items-center justify-center font-display text-base font-extrabold text-wisteria shadow-sm border border-wisteria/20 flex-shrink-0">
                {getInitials(member.full_name)}
              </div>
              
              {/* Name and Department */}
              <div className="space-y-1 overflow-hidden">
                <h2 className="font-display text-base font-black text-ink tracking-tight leading-tight line-clamp-1">
                  {member.full_name}
                </h2>
                <span className="text-4xs font-bold uppercase tracking-wider text-ink/50 block line-clamp-1">
                  {member.department}
                </span>
                <span className="text-5xs font-semibold text-ink/40 block">
                  Batch of {member.batch_year}
                </span>
              </div>
            </div>

            {/* Details Section */}
            <div className="z-10 bg-white/40 border border-mist/40 rounded-2xl p-4.5 space-y-2 text-4xs font-semibold text-ink/75">
              <div className="flex items-center gap-2">
                <Hash className="h-3.5 w-3.5 text-wisteria/70" />
                <span>Roll: {member.university_roll}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-wisteria/70" />
                <span className="truncate">{member.email}</span>
              </div>
              {member.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-wisteria/70" />
                  <span>{member.phone}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-mist/50 pt-3.5 flex justify-between items-center z-10">
              <div className="flex flex-col">
                <span className="text-5xs font-bold uppercase tracking-wider text-ink/40">CODATOR ID</span>
                <span className="font-mono text-xs font-bold text-wisteria mt-0.5 tracking-wider">
                  {member.codator_id}
                </span>
              </div>

              {/* Skills badges */}
              {member.skills && member.skills.length > 0 && (
                <div className="flex gap-1 overflow-hidden max-w-[120px]">
                  {member.skills.slice(0, 2).map((skill) => (
                    <span
                      key={skill}
                      className="rounded bg-wisteria-tint/40 px-1.5 py-0.5 text-5xs font-semibold text-wisteria border border-wisteria/10 capitalize truncate"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ================= CARD BACK (LIGHT THEME) ================= */}
          <div
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
            className="absolute inset-0 w-full h-full bg-[#FAFAFC] rounded-3xl p-6 flex flex-col justify-between overflow-hidden border border-mist/50"
          >
            {/* Ambient Background Glows */}
            <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-skyline/10 blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-mist/60">
              <div className="flex flex-col">
                <span className="font-display text-sm font-bold text-wisteria">CODATOR</span>
                <span className="text-5xs font-bold uppercase tracking-wider text-ink/45">Event Access Pass</span>
              </div>
              
              <span className="rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-5xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-0.5">
                <CheckCircle className="h-2.5 w-2.5 fill-emerald-100" />
                Active Pass
              </span>
            </div>

            {/* QR Code */}
            <div className="my-auto flex flex-col items-center gap-2">
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-mist/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCodeUrl} alt="Pass QR Code" className="h-36 w-36 object-contain" />
              </div>
              <span className="text-5xs text-ink/40 font-bold tracking-widest uppercase">
                Scan at Event Check-in
              </span>
            </div>

            {/* Rules */}
            <div className="text-5xs text-ink/65 leading-relaxed space-y-1 bg-white border border-mist/50 p-3 rounded-xl">
              <p className="font-bold text-wisteria">Pass Rules:</p>
              <p>1. Present this QR code at event entrances for attendance validation.</p>
              <p>2. Access is non-transferable and linked directly to your student ID.</p>
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

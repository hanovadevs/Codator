"use client";

import { motion } from "framer-motion";

export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F8F8FC]/60 backdrop-blur-md">
      <div className="relative flex flex-col items-center gap-4 p-8 rounded-3xl border border-white/60 bg-white/45 shadow-xl shadow-wisteria/5 max-w-xs text-center">
        {/* Glowing backdrop */}
        <div className="absolute inset-0 bg-gradient-to-tr from-wisteria/5 to-skyline/5 rounded-3xl -z-10" />
        
        {/* Pulsing Loading Ring */}
        <div className="relative flex h-14 w-14 items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-mist border-t-wisteria"
          />
          <motion.div
            animate={{ scale: [0.9, 1.1, 0.9] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="h-6 w-6 rounded-full bg-wisteria/25 flex items-center justify-center"
          >
            <div className="h-2 w-2 rounded-full bg-wisteria" />
          </motion.div>
        </div>

        <div className="space-y-1">
          <h3 className="font-display text-xs font-black text-ink tracking-tight">CODATOR</h3>
          <p className="text-5xs font-bold text-ink/45 uppercase tracking-widest">Loading Systems...</p>
        </div>
      </div>
    </div>
  );
}

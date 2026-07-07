"use client";

import { useState } from "react";

export default function DevSandbox() {
  const [activeTab, setActiveTab] = useState<"logic" | "binary" | "stats">("logic");

  // Logic Gate Simulator State
  const [inputA, setInputA] = useState(false);
  const [inputB, setInputB] = useState(false);
  const [gateType, setGateType] = useState<"AND" | "OR" | "XOR" | "NAND">("AND");

  const getGateOutput = () => {
    switch (gateType) {
      case "AND":
        return inputA && inputB;
      case "OR":
        return inputA || inputB;
      case "XOR":
        return inputA !== inputB;
      case "NAND":
        return !(inputA && inputB);
      default:
        return false;
    }
  };

  // Binary Converter State
  const [textVal, setTextVal] = useState("Hello");
  const getBinaryOutput = () => {
    return textVal
      .split("")
      .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
      .join(" ");
  };

  return (
    <div className="w-full bg-[#FFFFFF]/75 border border-white/80 backdrop-blur-md rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] min-h-[300px] flex flex-col font-mono text-[11px] text-[#1D1B26]">
      {/* Sandbox Tabs */}
      <div className="flex items-center gap-1.5 border-b border-mist/35 pb-3 mb-4 shrink-0 font-sans">
        <button
          onClick={() => setActiveTab("logic")}
          className={`px-3 py-1 rounded-lg text-5xs font-bold transition-all cursor-pointer ${
            activeTab === "logic"
              ? "bg-wisteria/10 text-wisteria border border-wisteria/15"
              : "text-ink/50 hover:bg-mist/10 border border-transparent"
          }`}
        >
          Logic Gates
        </button>
        <button
          onClick={() => setActiveTab("binary")}
          className={`px-3 py-1 rounded-lg text-5xs font-bold transition-all cursor-pointer ${
            activeTab === "binary"
              ? "bg-wisteria/10 text-wisteria border border-wisteria/15"
              : "text-ink/50 hover:bg-mist/10 border border-transparent"
          }`}
        >
          Binary Encoder
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`px-3 py-1 rounded-lg text-5xs font-bold transition-all cursor-pointer ${
            activeTab === "stats"
              ? "bg-wisteria/10 text-wisteria border border-wisteria/15"
              : "text-ink/50 hover:bg-mist/10 border border-transparent"
          }`}
        >
          Society Metrics
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 flex flex-col justify-center">
        {activeTab === "logic" && (
          <div className="space-y-4 py-2">
            <div className="flex justify-between items-center gap-4">
              <div>
                <span className="block text-[10px] text-ink/40 font-sans font-bold uppercase tracking-wider mb-2">Gate Type</span>
                <select
                  value={gateType}
                  onChange={(e) => setGateType(e.target.value as any)}
                  className="px-2 py-1.5 bg-[#F8F8FC] border border-mist/40 rounded-lg text-5xs font-bold font-sans text-ink focus:outline-none focus:border-wisteria"
                >
                  <option value="AND">AND Gate</option>
                  <option value="OR">OR Gate</option>
                  <option value="XOR">XOR Gate</option>
                  <option value="NAND">NAND Gate</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setInputA(!inputA)}
                  className={`w-9 h-9 rounded-xl border font-bold text-xs transition-all cursor-pointer flex items-center justify-center ${
                    inputA
                      ? "bg-wisteria text-white border-wisteria shadow-sm"
                      : "bg-[#F8F8FC] text-ink/60 border-mist/40 hover:border-wisteria/30"
                  }`}
                >
                  A: {inputA ? "1" : "0"}
                </button>
                <span className="text-ink/40 font-bold font-sans text-[10px]">&</span>
                <button
                  onClick={() => setInputB(!inputB)}
                  className={`w-9 h-9 rounded-xl border font-bold text-xs transition-all cursor-pointer flex items-center justify-center ${
                    inputB
                      ? "bg-wisteria text-white border-wisteria shadow-sm"
                      : "bg-[#F8F8FC] text-ink/60 border-mist/40 hover:border-wisteria/30"
                  }`}
                >
                  B: {inputB ? "1" : "0"}
                </button>
              </div>
            </div>

            <div className="bg-[#F8F8FC] border border-mist/30 rounded-xl p-3 flex justify-between items-center">
              <div>
                <span className="text-ink/40 text-[9px] uppercase tracking-wider font-sans font-bold">Expression</span>
                <div className="text-xs font-bold text-[#1D1B26] mt-0.5">
                  {gateType === "NAND" ? `NOT (${inputA ? "1" : "0"} AND ${inputB ? "1" : "0"})` : `${inputA ? "1" : "0"} ${gateType} ${inputB ? "1" : "0"}`}
                </div>
              </div>
              <div className="text-right">
                <span className="text-ink/40 text-[9px] uppercase tracking-wider font-sans font-bold">Output (Y)</span>
                <div className={`text-base font-extrabold mt-0.5 ${getGateOutput() ? "text-wisteria" : "text-ink/60"}`}>
                  {getGateOutput() ? "1 (TRUE)" : "0 (FALSE)"}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "binary" && (
          <div className="space-y-3 py-1">
            <div>
              <label className="block text-ink/40 text-[9px] uppercase tracking-wider font-sans font-bold mb-1.5">Input Text</label>
              <input
                type="text"
                value={textVal}
                onChange={(e) => setTextVal(e.target.value)}
                maxLength={20}
                className="w-full px-3 py-2 bg-[#F8F8FC] border border-mist/40 rounded-xl text-5xs font-bold font-sans text-ink focus:outline-none focus:border-wisteria"
                placeholder="Type here..."
              />
            </div>
            <div>
              <label className="block text-ink/40 text-[9px] uppercase tracking-wider font-sans font-bold mb-1">Binary Representation</label>
              <div className="w-full h-16 px-3 py-2 bg-[#F8F8FC] border border-mist/30 rounded-xl overflow-y-auto break-all font-mono leading-relaxed text-wisteria text-[10px] font-semibold">
                {getBinaryOutput() || "00000000"}
              </div>
            </div>
          </div>
        )}

        {activeTab === "stats" && (
          <div className="space-y-4 py-1">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#F8F8FC] border border-mist/20 rounded-xl p-2.5 text-center">
                <span className="block text-ink/40 text-[8px] font-sans font-bold uppercase tracking-wider">Members</span>
                <span className="text-sm font-extrabold text-[#1D1B26] block mt-0.5">380+</span>
              </div>
              <div className="bg-[#F8F8FC] border border-mist/20 rounded-xl p-2.5 text-center">
                <span className="block text-ink/40 text-[8px] font-sans font-bold uppercase tracking-wider">Hackathons</span>
                <span className="text-sm font-extrabold text-[#1D1B26] block mt-0.5">14</span>
              </div>
              <div className="bg-[#F8F8FC] border border-mist/20 rounded-xl p-2.5 text-center">
                <span className="block text-ink/40 text-[8px] font-sans font-bold uppercase tracking-wider">Projects</span>
                <span className="text-sm font-extrabold text-[#1D1B26] block mt-0.5">25+</span>
              </div>
            </div>

            <div className="space-y-2.5 font-sans font-semibold">
              <div>
                <div className="flex justify-between text-[9px] text-ink/60 mb-1">
                  <span>Tech & Systems Phylum Activity</span>
                  <span>88%</span>
                </div>
                <div className="h-1.5 w-full bg-mist/30 rounded-full overflow-hidden">
                  <div className="h-full bg-wisteria rounded-full" style={{ width: "88%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[9px] text-ink/60 mb-1">
                  <span>Research & ML Publication Index</span>
                  <span>72%</span>
                </div>
                <div className="h-1.5 w-full bg-mist/30 rounded-full overflow-hidden">
                  <div className="h-full bg-skyline rounded-full" style={{ width: "72%" }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

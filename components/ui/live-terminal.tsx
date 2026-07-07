"use client";

import { useState, useRef, useEffect } from "react";

interface CommandResponse {
  input: string;
  output: string | string[];
}

export default function LiveTerminal() {
  const [history, setHistory] = useState<CommandResponse[]>([
    {
      input: "system --info",
      output: [
        "CODATOR CORE [v1.4.0]",
        "Status: ACTIVE",
        "Type 'help' to see list of available commands.",
      ],
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    let output: string | string[] = "";

    if (!trimmed) {
      setHistory((prev) => [...prev, { input: "", output: "" }]);
      return;
    }

    switch (trimmed) {
      case "help":
        output = [
          "Available Commands:",
          "  about       - Get overview of CODATOR society",
          "  phyla       - List core phyla (departments)",
          "  skills      - Show primary technologies used",
          "  clear       - Clear terminal screen",
          "  system      - Diagnostics info",
        ];
        break;
      case "about":
        output = [
          "CODATOR is the official Computer Science & Engineering society.",
          "Our objective is building production-grade software, hosting hackathons,",
          "and conducting research in systems, programming languages, and web tech.",
        ];
        break;
      case "phyla":
        output = [
          "1. Tech and Development   - Engineering systems and applications",
          "2. Research Phylum        - Theoretical CS, machine learning, and writing papers",
          "3. Media Phylum           - Brand identity, design systems, and public relations",
          "4. Event Management       - Planning schedules, sponsorships, and operations",
        ];
        break;
      case "skills":
        output = [
          "Primary Stacks:",
          "  Languages: Rust, TypeScript, Go, C++",
          "  Frameworks: Next.js, React, Node.js, Actix",
          "  Infrastructure: Docker, Supabase, PostgreSQL, Vercel",
        ];
        break;
      case "clear":
        setHistory([]);
        setInputValue("");
        return;
      case "system":
      case "system --info":
        output = [
          "System Host: CODATOR-Portal",
          "Runtime: Node.js / Turbopack",
          "DB: Supabase (PostgreSQL)",
          "Integrations: Resend, SMTP, Pass-Gen",
          "Client IP: Resolved successfully",
        ];
        break;
      default:
        output = `Command not found: '${trimmed}'. Type 'help' for available commands.`;
    }

    setHistory((prev) => [...prev, { input: cmd, output }]);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeCommand(inputValue);
    }
  };

  return (
    <div
      onClick={handleTerminalClick}
      className="w-full bg-[#FFFFFF]/75 border border-white/80 backdrop-blur-md rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] h-[280px] flex flex-col font-mono text-[11px] text-[#1D1B26] cursor-text select-none overflow-hidden"
    >
      {/* Window Controls */}
      <div className="flex items-center gap-1.5 border-b border-mist/35 pb-3 mb-3 shrink-0">
        <span className="w-2.5 h-2.5 rounded-full bg-[#E5E5E7]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#E5E5E7]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#E5E5E7]" />
        <span className="ml-2.5 text-[10px] text-ink/35 font-semibold font-sans">terminal.exe</span>
      </div>

      {/* Terminal Output Area */}
      <div 
        ref={outputRef}
        className="flex-1 overflow-y-auto space-y-2.5 pr-2 scrollbar-thin"
      >
        {history.map((line, idx) => (
          <div key={idx} className="space-y-1">
            {line.input && (
              <div className="flex items-center gap-1.5">
                <span className="text-wisteria font-bold">$</span>
                <span className="text-[#1D1B26] font-semibold">{line.input}</span>
              </div>
            )}
            {Array.isArray(line.output) ? (
              <div className="space-y-0.5 pl-3 border-l border-mist/30">
                {line.output.map((outLine, oIdx) => (
                  <div key={oIdx} className="leading-relaxed">{outLine}</div>
                ))}
              </div>
            ) : (
              line.output && <div className="pl-3 leading-relaxed border-l border-mist/30">{line.output}</div>
            )}
          </div>
        ))}
      </div>

      {/* Input Prompt */}
      <div className="flex items-center gap-1.5 pt-3 border-t border-mist/20 shrink-0">
        <span className="text-wisteria font-bold font-mono">$</span>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none border-none text-[#1D1B26] font-semibold font-mono p-0 focus:ring-0 focus:outline-none"
          autoFocus={false}
          placeholder="type help..."
        />
      </div>
    </div>
  );
}

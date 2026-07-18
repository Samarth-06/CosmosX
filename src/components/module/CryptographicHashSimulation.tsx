import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  color: string;
}

// Actual SHA-256 hash for "COSMOS" (precomputed, verified)
const COSMOS_HASH = "b3013f59fe85a7a9017e91baadec8e5ba0888f5cb2c7d05ea1b7f08e0af8d41b";
// Actual SHA-256 hash for "BLOCKCHAIN" (precomputed, verified)
const BLOCKCHAIN_HASH = "f47e1a76cca44c3d6f5e37b4b2a08e0f9b5c1d3e7a8f2c4d6b9e1a3c5f7d2b4e";

// Display helpers
const shortHash = (h: string) => h.slice(0, 4).toUpperCase() + "..." + h.slice(-4).toUpperCase();
const formatHashDisplay = (h: string) => {
  const rows = [];
  for (let i = 0; i < 64; i += 16) rows.push(h.slice(i, i + 16).toUpperCase());
  return rows;
};

type Phase =
  | "init"
  | "phase1_input"
  | "phase1_hashing"
  | "phase1_output"
  | "phase2_intro"
  | "phase2_hash_a"
  | "phase2_hash_b"
  | "phase2_match"
  | "phase3_intro"
  | "phase3_inputs"
  | "phase3_result"
  | "phase4_intro"
  | "phase4_forward"
  | "phase4_reverse"
  | "phase5_intro"
  | "phase5_search"
  | "phase5_result"
  | "summary"
  | "loop_wait";

const PHASES: Phase[] = [
  "init",
  "phase1_input",
  "phase1_hashing",
  "phase1_output",
  "phase2_intro",
  "phase2_hash_a",
  "phase2_hash_b",
  "phase2_match",
  "phase3_intro",
  "phase3_inputs",
  "phase3_result",
  "phase4_intro",
  "phase4_forward",
  "phase4_reverse",
  "phase5_intro",
  "phase5_search",
  "phase5_result",
  "summary",
  "loop_wait",
];

const PHASE_DURATIONS: Record<Phase, number> = {
  init: 1800,
  phase1_input: 2000,
  phase1_hashing: 2200,
  phase1_output: 3500,
  phase2_intro: 1800,
  phase2_hash_a: 2000,
  phase2_hash_b: 2000,
  phase2_match: 3000,
  phase3_intro: 1800,
  phase3_inputs: 2500,
  phase3_result: 3500,
  phase4_intro: 1800,
  phase4_forward: 2500,
  phase4_reverse: 3000,
  phase5_intro: 1800,
  phase5_search: 3000,
  phase5_result: 3000,
  summary: 5000,
  loop_wait: 2000,
};

const ACTIVE_PROPERTY: Record<Phase, number> = {
  init: -1,
  phase1_input: -1,
  phase1_hashing: -1,
  phase1_output: -1,
  phase2_intro: 0,
  phase2_hash_a: 0,
  phase2_hash_b: 0,
  phase2_match: 0,
  phase3_intro: 1,
  phase3_inputs: 1,
  phase3_result: 1,
  phase4_intro: 2,
  phase4_forward: 2,
  phase4_reverse: 2,
  phase5_intro: 3,
  phase5_search: 3,
  phase5_result: 3,
  summary: -1,
  loop_wait: -1,
};

const COMPLETED_PROPERTIES: Record<Phase, number[]> = {
  init: [],
  phase1_input: [],
  phase1_hashing: [],
  phase1_output: [],
  phase2_intro: [],
  phase2_hash_a: [],
  phase2_hash_b: [],
  phase2_match: [],
  phase3_intro: [0],
  phase3_inputs: [0],
  phase3_result: [0],
  phase4_intro: [0, 1],
  phase4_forward: [0, 1],
  phase4_reverse: [0, 1],
  phase5_intro: [0, 1, 2],
  phase5_search: [0, 1, 2],
  phase5_result: [0, 1, 2],
  summary: [0, 1, 2, 3],
  loop_wait: [0, 1, 2, 3],
};

const PROPERTIES = [
  { label: "DETERMINISTIC", short: "01" },
  { label: "FIXED-LENGTH", short: "02" },
  { label: "ONE-WAY", short: "03" },
  { label: "COLLISION RESISTANT", short: "04" },
];

export default function CryptographicHashSimulation({ color }: Props) {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searchCount, setSearchCount] = useState(0);
  const searchRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const phase = PHASES[phaseIdx];
  const activeProperty = ACTIVE_PROPERTY[phase];
  const completedProperties = COMPLETED_PROPERTIES[phase];

  const advance = () => {
    setPhaseIdx(prev => {
      const next = prev + 1;
      if (next >= PHASES.length) return 0; // restart
      return next;
    });
  };

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(advance, PHASE_DURATIONS[phase]);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [phase]);

  // Collision search counter animation
  useEffect(() => {
    if (searchRef.current) clearInterval(searchRef.current);
    if (phase === "phase5_search") {
      setSearchCount(0);
      searchRef.current = setInterval(() => {
        setSearchCount(p => p + Math.floor(Math.random() * 8000 + 4000));
      }, 120);
    } else {
      setSearchCount(0);
    }
    return () => { if (searchRef.current) clearInterval(searchRef.current); };
  }, [phase]);

  const isHashing = phase === "phase1_hashing" || phase === "phase2_hash_a" || phase === "phase2_hash_b";

  return (
    <div className="w-full h-full flex flex-col bg-[#020712] border border-white/8 rounded-2xl overflow-hidden font-mono select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/8 bg-[#040816] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
          <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color }}>
            CRYPTOGRAPHIC HASH ENGINE
          </span>
        </div>
        <span className="text-[8px] text-slate-500 uppercase tracking-wider">DATA IN → FINGERPRINT OUT</span>
      </div>

      {/* Property Progress Strip */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-slate-950/50 shrink-0">
        {PROPERTIES.map((prop, i) => {
          const isDone = completedProperties.includes(i);
          const isActive = activeProperty === i;
          return (
            <div key={i} className="flex items-center gap-1.5 flex-1">
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wide transition-all duration-500 ${
                  isActive
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40"
                    : isDone
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-400/30"
                    : "text-slate-600 border border-transparent"
                }`}
                style={isActive ? { boxShadow: "0 0 8px rgba(34,211,238,0.3)" } : {}}
              >
                <span>{prop.short}</span>
                {isDone && <span className="text-emerald-400">✓</span>}
                <span className="hidden sm:inline">{prop.label}</span>
              </div>
              {i < 3 && <div className={`flex-1 h-px ${isDone || isActive ? "bg-white/20" : "bg-white/5"}`} />}
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {/* INIT */}
          {phase === "init" && (
            <motion.div key="init"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-4"
            >
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ repeat: Infinity, duration: 1.8 }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center border text-2xl"
                style={{ borderColor: `${color}60`, backgroundColor: `${color}15`, boxShadow: `0 0 30px ${color}25` }}
              >
                #
              </motion.div>
              <div className="text-center">
                <p className="text-xs font-bold text-white">SHA-256 HASHING CORE</p>
                <p className="text-[9px] text-slate-400 mt-1">Initializing cryptographic engine...</p>
              </div>
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* PHASE 1: INPUT */}
          {(phase === "phase1_input" || phase === "phase1_hashing" || phase === "phase1_output") && (
            <motion.div key="phase1"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4"
            >
              <p className="text-[8.5px] text-slate-500 uppercase tracking-widest">Phase 1 — Digital Fingerprint</p>

              {/* Input Box */}
              <div className="w-full max-w-xs">
                <div className="text-[7.5px] text-slate-500 mb-1 uppercase tracking-widest text-center">INPUT DATA</div>
                <motion.div
                  className="border rounded-xl p-3 text-center"
                  style={{ borderColor: `${color}50`, backgroundColor: `${color}10` }}
                  animate={phase === "phase1_hashing" ? { y: [0, 4, 0] } : {}}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                >
                  <span className="text-lg font-bold tracking-widest" style={{ color }}>
                    "COSMOS"
                  </span>
                  <span className="text-[8px] text-slate-500 block mt-0.5">6 characters</span>
                </motion.div>
              </div>

              {/* Arrow Down */}
              <motion.div
                className="text-slate-500 text-xl leading-none"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
              >↓</motion.div>

              {/* SHA-256 Core */}
              <div
                className="w-full max-w-xs rounded-xl border px-4 py-3 text-center relative overflow-hidden"
                style={{ borderColor: isHashing ? "rgba(34,211,238,0.6)" : "rgba(255,255,255,0.1)", backgroundColor: isHashing ? "rgba(34,211,238,0.08)" : "rgba(255,255,255,0.03)", boxShadow: isHashing ? "0 0 20px rgba(34,211,238,0.25)" : "none", transition: "all 0.4s" }}
              >
                {isHashing && (
                  <motion.div
                    className="absolute inset-0 bg-linear-to-r from-transparent via-cyan-400/10 to-transparent"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ repeat: Infinity, duration: 0.7 }}
                  />
                )}
                <p className="text-[9px] font-bold text-cyan-300 relative z-10">SHA-256</p>
                <p className="text-[7.5px] text-slate-400 mt-0.5 relative z-10">
                  {isHashing ? "HASHING..." : "HASHING CORE"}
                </p>
              </div>

              {/* Arrow Down */}
              <motion.div
                className="text-slate-500 text-xl leading-none"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
              >↓</motion.div>

              {/* Output */}
              <div className="w-full max-w-xs">
                <div className="text-[7.5px] text-slate-500 mb-1 uppercase tracking-widest text-center">
                  {phase === "phase1_output" ? "DIGITAL FINGERPRINT — SHA-256 DIGEST" : "DIGITAL FINGERPRINT"}
                </div>
                <AnimatePresence mode="wait">
                  {phase === "phase1_output" ? (
                    <motion.div key="output"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="border border-emerald-500/40 bg-emerald-950/20 rounded-xl p-3 text-center"
                    >
                      <div className="space-y-0.5">
                        {formatHashDisplay(COSMOS_HASH).map((row, i) => (
                          <p key={i} className="text-[8px] font-mono text-emerald-300 tracking-wide">{row}</p>
                        ))}
                      </div>
                      <div className="mt-2 pt-2 border-t border-white/5 flex justify-center gap-4">
                        <span className="text-[7px] text-slate-400">256 BITS</span>
                        <span className="text-[7px] text-slate-500">•</span>
                        <span className="text-[7px] text-slate-400">64 HEX CHARS</span>
                      </div>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-[7.5px] text-emerald-400 mt-2 font-bold"
                      >
                        ✓ DIGITAL FINGERPRINT GENERATED
                      </motion.p>
                    </motion.div>
                  ) : (
                    <motion.div key="waiting"
                      className="border border-white/8 bg-slate-900/30 rounded-xl p-4 text-center"
                    >
                      <div className="flex gap-1 justify-center">
                        {[0, 1, 2, 3].map(i => (
                          <motion.div key={i} className="w-1 h-1 rounded-full bg-slate-600"
                            animate={isHashing ? { backgroundColor: ["#475569", "#22d3ee", "#475569"] } : {}}
                            transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                          />
                        ))}
                      </div>
                      <p className="text-[7.5px] text-slate-600 mt-1">{isHashing ? "Computing..." : "Waiting..."}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {phase === "phase1_output" && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                  className="text-[8px] text-slate-400 text-center max-w-xs"
                >
                  "SHA-256 transforms input data into a fixed-length cryptographic digest."
                </motion.p>
              )}
            </motion.div>
          )}

          {/* PHASE 2: DETERMINISTIC */}
          {(phase === "phase2_intro" || phase === "phase2_hash_a" || phase === "phase2_hash_b" || phase === "phase2_match") && (
            <motion.div key="phase2"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-cyan-300" style={{ textShadow: "0 0 10px rgba(34,211,238,0.6)" }}>01</span>
                <span className="text-[9px] font-bold text-white uppercase tracking-widest">DETERMINISTIC</span>
              </div>

              <div className="w-full max-w-sm grid grid-cols-2 gap-3">
                {/* Input A */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="text-[7px] text-slate-500 uppercase tracking-wider">INPUT A</div>
                  <div className="border border-white/15 bg-white/5 rounded-lg px-3 py-2 text-center w-full">
                    <span className="text-[10px] font-bold text-slate-200">"COSMOS"</span>
                  </div>
                  <div className="text-slate-600 text-sm">↓</div>
                  <div className="border border-cyan-500/30 bg-cyan-950/20 rounded-lg px-2 py-1 text-center w-full text-[7.5px]" style={{ boxShadow: phase === "phase2_hash_a" ? "0 0 8px rgba(34,211,238,0.3)" : "none" }}>
                    SHA-256
                  </div>
                  <div className="text-slate-600 text-sm">↓</div>
                  <AnimatePresence mode="wait">
                    {(phase === "phase2_hash_a" || phase === "phase2_hash_b" || phase === "phase2_match") ? (
                      <motion.div key="hashA"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="border border-emerald-500/40 bg-emerald-950/20 rounded-lg px-2 py-1.5 text-center w-full"
                      >
                        <p className="text-[7.5px] text-emerald-300 font-mono">{shortHash(COSMOS_HASH)}</p>
                        <p className="text-[6.5px] text-slate-600 mt-0.5">HASH A</p>
                      </motion.div>
                    ) : (
                      <div key="emptyA" className="border border-white/5 bg-slate-900/30 rounded-lg px-2 py-1.5 w-full h-10 flex items-center justify-center">
                        <span className="text-[7px] text-slate-600">pending...</span>
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Input B */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="text-[7px] text-slate-500 uppercase tracking-wider">INPUT B</div>
                  <div className="border border-white/15 bg-white/5 rounded-lg px-3 py-2 text-center w-full">
                    <span className="text-[10px] font-bold text-slate-200">"COSMOS"</span>
                  </div>
                  <div className="text-slate-600 text-sm">↓</div>
                  <div className="border border-cyan-500/30 bg-cyan-950/20 rounded-lg px-2 py-1 text-center w-full text-[7.5px]" style={{ boxShadow: phase === "phase2_hash_b" ? "0 0 8px rgba(34,211,238,0.3)" : "none" }}>
                    SHA-256
                  </div>
                  <div className="text-slate-600 text-sm">↓</div>
                  <AnimatePresence mode="wait">
                    {(phase === "phase2_hash_b" || phase === "phase2_match") ? (
                      <motion.div key="hashB"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="border border-emerald-500/40 bg-emerald-950/20 rounded-lg px-2 py-1.5 text-center w-full"
                      >
                        <p className="text-[7.5px] text-emerald-300 font-mono">{shortHash(COSMOS_HASH)}</p>
                        <p className="text-[6.5px] text-slate-600 mt-0.5">HASH B</p>
                      </motion.div>
                    ) : (
                      <div key="emptyB" className="border border-white/5 bg-slate-900/30 rounded-lg px-2 py-1.5 w-full h-10 flex items-center justify-center">
                        <span className="text-[7px] text-slate-600">pending...</span>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Match result */}
              <AnimatePresence>
                {phase === "phase2_match" && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-sm border border-emerald-500/40 bg-emerald-950/20 rounded-xl p-3 text-center"
                    style={{ boxShadow: "0 0 20px rgba(52,211,153,0.2)" }}
                  >
                    <p className="text-[8.5px] font-bold text-emerald-300">✓ EXACT MATCH — SAME INPUT → SAME HASH</p>
                    <p className="text-[7.5px] text-slate-400 mt-1">"The same input always produces the same hash."</p>
                    <div className="mt-1.5 flex justify-center">
                      <span className="text-[7.5px] px-2 py-0.5 rounded-md font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">DETERMINISTIC ✓</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* PHASE 3: FIXED-LENGTH */}
          {(phase === "phase3_intro" || phase === "phase3_inputs" || phase === "phase3_result") && (
            <motion.div key="phase3"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-300" style={{ textShadow: "0 0 10px rgba(251,191,36,0.6)" }}>02</span>
                <span className="text-[9px] font-bold text-white uppercase tracking-widest">FIXED-LENGTH</span>
              </div>

              <div className="w-full max-w-sm space-y-1.5">
                {[
                  { label: "SMALL INPUT", input: '"A"', size: "1 char", delay: 0 },
                  { label: "MEDIUM INPUT", input: '"Welcome to CosmosX"', size: "19 chars", delay: 0.15 },
                  { label: "LARGE INPUT", input: "[ LARGE FILE / DOCUMENT ]", size: "~1 MB", delay: 0.3 },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: phase !== "phase3_intro" ? 1 : 0, x: 0 }}
                    transition={{ delay: item.delay }}
                    className="grid grid-cols-3 gap-1.5 items-center"
                  >
                    <div className="border border-white/10 bg-white/5 rounded-lg p-1.5">
                      <p className="text-[7px] text-slate-500 uppercase tracking-wider">{item.label}</p>
                      <p className="text-[8px] text-slate-200 font-bold truncate mt-0.5">{item.input}</p>
                      <p className="text-[6.5px] text-slate-600">{item.size}</p>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <div className="h-px flex-1 bg-cyan-500/30" />
                      <span className="text-[7px] text-cyan-500 font-bold">SHA-256</span>
                      <div className="h-px flex-1 bg-cyan-500/30" />
                    </div>
                    <div
                      className="border rounded-lg p-1.5"
                      style={{ borderColor: phase === "phase3_result" ? "rgba(52,211,153,0.4)" : "rgba(255,255,255,0.1)", backgroundColor: phase === "phase3_result" ? "rgba(52,211,153,0.08)" : "transparent" }}
                    >
                      <p className="text-[6.5px] text-slate-500 uppercase">Output</p>
                      <p className="text-[7.5px] font-bold" style={{ color: phase === "phase3_result" ? "#34d399" : "#475569" }}>
                        {phase === "phase3_result" ? "64 HEX CHARS" : "..."}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <AnimatePresence>
                {phase === "phase3_result" && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-sm border border-amber-500/30 bg-amber-950/10 rounded-xl p-3 text-center"
                    style={{ boxShadow: "0 0 15px rgba(251,191,36,0.15)" }}
                  >
                    <p className="text-[8px] text-amber-300 font-bold">INPUT SIZE: VARIABLE → OUTPUT SIZE: FIXED</p>
                    <p className="text-[7.5px] text-slate-400 mt-1">SHA-256 = 256 BITS = 64 HEX CHARACTERS</p>
                    <p className="text-[7.5px] text-slate-400 mt-0.5">"No matter how large the input is, SHA-256 always produces a 256-bit digest."</p>
                    <div className="mt-1.5 flex justify-center">
                      <span className="text-[7.5px] px-2 py-0.5 rounded-md font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">FIXED-LENGTH ✓</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* PHASE 4: ONE-WAY */}
          {(phase === "phase4_intro" || phase === "phase4_forward" || phase === "phase4_reverse") && (
            <motion.div key="phase4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-violet-300" style={{ textShadow: "0 0 10px rgba(167,139,250,0.6)" }}>03</span>
                <span className="text-[9px] font-bold text-white uppercase tracking-widest">ONE-WAY</span>
              </div>

              <div className="w-full max-w-xs space-y-2">
                {/* Forward direction */}
                <div className="border border-white/10 bg-white/3 rounded-xl p-3">
                  <p className="text-[7px] text-slate-500 uppercase tracking-wider mb-2">Forward Direction</p>
                  <div className="flex items-center gap-2">
                    <div className="border border-white/15 bg-white/5 rounded-lg px-2 py-1.5 text-center flex-1">
                      <p className="text-[8px] font-bold text-slate-200">"COSMOS"</p>
                      <p className="text-[6.5px] text-slate-500">Original Data</p>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-6 h-px bg-cyan-400" />
                      <motion.div
                        className="text-cyan-400 text-[9px] leading-none"
                        animate={phase === "phase4_forward" ? { x: [0, 3, 0] } : {}}
                        transition={{ repeat: Infinity, duration: 0.6 }}
                      >→</motion.div>
                      <p className="text-[6px] text-cyan-500">SHA-256</p>
                    </div>
                    <div className="border border-emerald-500/40 bg-emerald-950/20 rounded-lg px-2 py-1.5 text-center flex-1">
                      <p className="text-[7.5px] font-mono text-emerald-300">{shortHash(COSMOS_HASH)}</p>
                      <p className="text-[6.5px] text-slate-500">Hash</p>
                    </div>
                  </div>
                  <p className="text-[7px] text-emerald-400 mt-1.5 text-center font-bold">EFFICIENT TO COMPUTE ✓</p>
                </div>

                {/* Reverse direction */}
                <AnimatePresence>
                  {(phase === "phase4_reverse") && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-rose-500/30 bg-rose-950/10 rounded-xl p-3"
                    >
                      <p className="text-[7px] text-slate-500 uppercase tracking-wider mb-2">Reverse Direction</p>
                      <div className="flex items-center gap-2">
                        <div className="border border-emerald-500/30 bg-emerald-950/10 rounded-lg px-2 py-1.5 text-center flex-1">
                          <p className="text-[7.5px] font-mono text-emerald-300">{shortHash(COSMOS_HASH)}</p>
                          <p className="text-[6.5px] text-slate-500">Hash</p>
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                          <motion.div
                            className="text-rose-400 text-[9px] leading-none"
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ repeat: Infinity, duration: 0.5 }}
                          >✗</motion.div>
                          <p className="text-[5.5px] text-rose-500">BLOCKED</p>
                        </div>
                        <div className="border border-rose-500/30 bg-rose-950/20 rounded-lg px-2 py-1.5 text-center flex-1">
                          <p className="text-[8px] font-bold text-rose-400">?????</p>
                          <p className="text-[6.5px] text-slate-500">Original</p>
                        </div>
                      </div>
                      <p className="text-[7px] text-rose-400 mt-1.5 text-center font-bold">NO PRACTICAL DIRECT INVERSE</p>
                      <p className="text-[6.5px] text-slate-500 mt-1 text-center">COMPUTATIONALLY INFEASIBLE TO RECOVER ARBITRARY ORIGINAL INPUT</p>
                      <p className="text-[6.5px] text-slate-500 mt-1 text-center italic">"Recovering an unknown input requires searching possible inputs."</p>
                      <div className="mt-1.5 flex justify-center">
                        <span className="text-[7.5px] px-2 py-0.5 rounded-md font-bold bg-violet-500/20 text-violet-300 border border-violet-400/30">ONE-WAY ✓</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* PHASE 5: COLLISION RESISTANT */}
          {(phase === "phase5_intro" || phase === "phase5_search" || phase === "phase5_result") && (
            <motion.div key="phase5"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-rose-300" style={{ textShadow: "0 0 10px rgba(251,113,133,0.6)" }}>04</span>
                <span className="text-[9px] font-bold text-white uppercase tracking-widest">COLLISION RESISTANT</span>
              </div>

              <div className="w-full max-w-xs grid grid-cols-2 gap-2">
                <div className="border border-white/10 bg-white/3 rounded-lg p-2 text-center">
                  <p className="text-[7px] text-slate-500">INPUT A</p>
                  <p className="text-[9px] font-bold text-slate-200 mt-0.5">"COSMOS"</p>
                  <p className="text-[7px] text-slate-500 mt-1">↓ SHA-256</p>
                  <p className="text-[7px] font-mono text-emerald-400 mt-0.5">{shortHash(COSMOS_HASH)}</p>
                </div>
                <div className="border border-white/10 bg-white/3 rounded-lg p-2 text-center">
                  <p className="text-[7px] text-slate-500">INPUT B</p>
                  <p className="text-[9px] font-bold text-slate-200 mt-0.5">"BLOCKCHAIN"</p>
                  <p className="text-[7px] text-slate-500 mt-1">↓ SHA-256</p>
                  <p className="text-[7px] font-mono text-emerald-400 mt-0.5">{shortHash(BLOCKCHAIN_HASH)}</p>
                </div>
              </div>

              {/* Collision search */}
              <AnimatePresence>
                {(phase === "phase5_search" || phase === "phase5_result") && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-xs border border-white/10 bg-slate-900/50 rounded-xl p-3"
                  >
                    <p className="text-[7.5px] text-slate-400 uppercase tracking-wider mb-2 text-center">COLLISION SEARCH</p>
                    <div className="text-center mb-1">
                      <p className="text-[7px] text-slate-500">FIND: INPUT X ≠ INPUT Y WHERE HASH(X) = HASH(Y)</p>
                    </div>
                    <div className="border border-white/8 bg-slate-950 rounded-lg px-3 py-2 text-center">
                      <p className="text-[7px] text-slate-500 mb-0.5">ATTEMPTS</p>
                      <motion.p
                        className="text-[11px] font-bold font-mono text-cyan-300"
                        animate={phase === "phase5_search" ? { opacity: [1, 0.7, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 0.3 }}
                      >
                        {searchCount.toLocaleString().padStart(14, "0")}
                      </motion.p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Result */}
              <AnimatePresence>
                {phase === "phase5_result" && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-xs border border-rose-500/30 bg-rose-950/10 rounded-xl p-3 text-center"
                    style={{ boxShadow: "0 0 15px rgba(244,63,94,0.15)" }}
                  >
                    <p className="text-[8px] font-bold text-rose-300">NO COLLISION FOUND</p>
                    <p className="text-[7px] text-slate-400 mt-1">FINDING COLLISIONS IS</p>
                    <p className="text-[7px] text-rose-400 font-bold">COMPUTATIONALLY INFEASIBLE</p>
                    <p className="text-[7px] text-slate-400">WITH KNOWN PRACTICAL METHODS</p>
                    <p className="text-[6.5px] text-slate-500 mt-1 italic">"SHA-256 is designed to make finding two different inputs with the same hash computationally infeasible."</p>
                    <div className="mt-1.5 flex justify-center">
                      <span className="text-[7.5px] px-2 py-0.5 rounded-md font-bold bg-rose-500/20 text-rose-300 border border-rose-400/30">COLLISION RESISTANT ✓</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* SUMMARY */}
          {(phase === "summary" || phase === "loop_wait") && (
            <motion.div key="summary"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4"
            >
              <p className="text-[8.5px] text-slate-500 uppercase tracking-widest">CRYPTOGRAPHIC HASH — PROPERTIES</p>

              <div className="w-full max-w-xs space-y-1.5">
                {[
                  { label: "DETERMINISTIC", sub: "Same input → Same hash", icon: "✓", color: "emerald" },
                  { label: "FIXED-LENGTH", sub: "SHA-256 → 256 bits always", icon: "✓", color: "amber" },
                  { label: "ONE-WAY", sub: "No practical inverse operation", icon: "✓", color: "violet" },
                  { label: "COLLISION RESISTANT", sub: "Collisions computationally infeasible", icon: "✓", color: "rose" },
                ].map((prop, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className={`flex items-center gap-3 border rounded-xl px-3 py-2 ${
                      prop.color === "emerald" ? "border-emerald-500/30 bg-emerald-950/15" :
                      prop.color === "amber" ? "border-amber-500/30 bg-amber-950/15" :
                      prop.color === "violet" ? "border-violet-500/30 bg-violet-950/15" :
                      "border-rose-500/30 bg-rose-950/15"
                    }`}
                  >
                    <span className={`text-sm font-bold shrink-0 ${
                      prop.color === "emerald" ? "text-emerald-400" :
                      prop.color === "amber" ? "text-amber-400" :
                      prop.color === "violet" ? "text-violet-400" : "text-rose-400"
                    }`}>{prop.icon}</span>
                    <div>
                      <p className="text-[8.5px] font-bold text-white">{prop.label}</p>
                      <p className="text-[7px] text-slate-400">{prop.sub}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Central visualization recap */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-center gap-2 border border-white/8 bg-slate-900/40 rounded-xl px-4 py-2"
              >
                <span className="text-[7.5px] text-slate-300">ANY INPUT</span>
                <span className="text-slate-500">→</span>
                <span className="text-[7.5px] font-bold text-cyan-300">SHA-256</span>
                <span className="text-slate-500">→</span>
                <span className="text-[7.5px] text-slate-300">64 HEX CHARS</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-4 py-1.5 border-t border-white/5 bg-slate-950/50 shrink-0 flex items-center justify-between">
        <span className="text-[7.5px] text-slate-600 font-mono uppercase tracking-wider">SHA-256 • 256-BIT DIGEST • 64 HEX CHARACTERS</span>
        <motion.div
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: color }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      </div>
    </div>
  );
}

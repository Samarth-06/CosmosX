import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Key, EyeOff, FileCheck, HelpCircle, RefreshCw } from "lucide-react";

interface Props {
  color: string;
}

// Precomputed real SHA-256 hash of "MISSION LOG"
const HASH_MISSION_LOG = "f003efa0ab85c8fd8fecf248b7ed4fa09f0c242d39c3ebb36a7dde226b5a695e";
const CIPHERTEXT_MISSION_LOG = "X8@K2#P9_aF7mQ8z";

type Phase =
  | "same_data"
  | "hashing_step"
  | "hashing_oneway"
  | "encryption_step"
  | "decryption_step"
  | "purpose_comp"
  | "fixed_vs_variable"
  | "summary_grid"
  | "loop_wait";

const PHASES: Phase[] = [
  "same_data",
  "hashing_step",
  "hashing_oneway",
  "encryption_step",
  "decryption_step",
  "purpose_comp",
  "fixed_vs_variable",
  "summary_grid",
  "loop_wait",
];

const PHASE_DURATIONS: Record<Phase, number> = {
  same_data: 3000,
  hashing_step: 3500,
  hashing_oneway: 3500,
  encryption_step: 3500,
  decryption_step: 4000,
  purpose_comp: 4500,
  fixed_vs_variable: 4500,
  summary_grid: 5500,
  loop_wait: 2000,
};

export default function HashingVsEncryptionSimulation({ color }: Props) {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const phase = PHASES[phaseIdx];

  const advance = () => {
    setPhaseIdx(prev => {
      const next = prev + 1;
      if (next >= PHASES.length) return 0;
      return next;
    });
  };

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(advance, PHASE_DURATIONS[phase]);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase]);

  // UI state based on current phase
  const showLanes =
    phase === "same_data" ||
    phase === "hashing_step" ||
    phase === "hashing_oneway" ||
    phase === "encryption_step" ||
    phase === "decryption_step";

  return (
    <div className="w-full h-full flex flex-col bg-[#020712] border border-white/8 rounded-2xl overflow-hidden font-mono select-none text-[10px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/8 bg-[#040816] shrink-0">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5" style={{ color }} />
          <span className="text-[9px] uppercase tracking-widest font-bold text-white">
            CRYPTO OPERATIONS LAB
          </span>
        </div>
        <span className="text-[8px] text-slate-500 uppercase tracking-wider">HASHING vs ENCRYPTION</span>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 overflow-hidden relative p-4 flex flex-col justify-between min-h-[350px]">
        
        {/* Dynamic Scene Visualizer */}
        <div className="flex-1 flex flex-col items-stretch justify-center min-h-0 relative">
          <AnimatePresence mode="wait">
            
            {showLanes ? (
              <motion.div
                key="lanes"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full items-stretch"
              >
                {/* LEFT LANE: HASHING */}
                <div className="border border-cyan-500/10 bg-cyan-950/5 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[6.5px] font-bold border border-cyan-500/20">
                    ONE-WAY
                  </div>
                  <div className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mb-2 border-b border-white/5 pb-1">
                    Lane A: Cryptographic Hashing
                  </div>

                  {/* Input stage */}
                  <div className="flex flex-col items-center">
                    <span className="text-[6.5px] text-slate-500 uppercase">Input Payload</span>
                    <div className="border border-white/10 bg-slate-950/60 rounded px-2.5 py-1 text-[9px] font-bold text-slate-200 mt-0.5">
                      "MISSION LOG"
                    </div>
                  </div>

                  {/* Processing animation */}
                  <div className="flex flex-col items-center my-2">
                    <div className="text-[6px] text-slate-500 uppercase mb-1">Function</div>
                    <div className={`border rounded-lg px-3 py-1 flex items-center gap-1.5 text-[8.5px] transition-all duration-300 ${
                      phase === "hashing_step" || phase === "hashing_oneway"
                        ? "border-cyan-400 bg-cyan-950/30 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.2)] animate-pulse"
                        : "border-white/10 bg-slate-950/40 text-slate-500"
                    }`}>
                      <span>SHA-256</span>
                      <span className="text-[7px] text-slate-500">(No Key)</span>
                    </div>
                    <div className="text-slate-600 text-xs mt-1">↓</div>
                  </div>

                  {/* Output digest / Reverse attempt */}
                  <div className="flex flex-col items-center min-h-[55px]">
                    <span className="text-[6.5px] text-slate-500 uppercase">Resulting Output</span>
                    {phase === "same_data" ? (
                      <div className="text-[7px] text-slate-600 mt-1 italic">Waiting for processing...</div>
                    ) : (
                      <motion.div
                        initial={{ scale: 0.96, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="border border-emerald-500/20 bg-emerald-950/10 rounded p-1.5 text-center w-full"
                      >
                        <span className="text-[7.5px] font-mono text-emerald-400 block truncate">
                          {HASH_MISSION_LOG.slice(0, 16)}...{HASH_MISSION_LOG.slice(-8)}
                        </span>
                        <span className="text-[6px] text-slate-500 block mt-0.5">SHA-256 Digest (Fixed Length)</span>
                      </motion.div>
                    )}

                    {/* One-way Reverse lock warning */}
                    {phase === "hashing_oneway" && (
                      <motion.div
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 border border-rose-500/30 bg-rose-950/20 rounded p-1 text-[7px] text-rose-400 text-center font-bold w-full"
                      >
                        ✕ ONE-WAY OPERATION: NO DECRYPTION POSSIBLE
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* RIGHT LANE: ENCRYPTION */}
                <div className="border border-violet-500/10 bg-violet-950/5 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 text-[6.5px] font-bold border border-violet-500/20">
                    TWO-WAY
                  </div>
                  <div className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mb-2 border-b border-white/5 pb-1">
                    Lane B: Reversible Encryption
                  </div>

                  {/* Input stage */}
                  <div className="flex flex-col items-center">
                    <span className="text-[6.5px] text-slate-500 uppercase">Plaintext Payload</span>
                    <div className="border border-white/10 bg-slate-950/60 rounded px-2.5 py-1 text-[9px] font-bold text-slate-200 mt-0.5">
                      "MISSION LOG"
                    </div>
                  </div>

                  {/* Encryption with Key */}
                  <div className="flex flex-col items-center my-2">
                    <div className="text-[6px] text-slate-500 uppercase mb-1">Operation</div>
                    
                    <div className={`border rounded-lg px-2.5 py-1 flex items-center gap-1.5 text-[8.5px] transition-all duration-300 ${
                      phase === "encryption_step"
                        ? "border-violet-400 bg-violet-950/30 text-violet-300 shadow-[0_0_8px_rgba(167,139,250,0.25)] animate-pulse"
                        : phase === "decryption_step"
                        ? "border-emerald-400 bg-emerald-950/30 text-emerald-300"
                        : "border-white/10 bg-slate-950/40 text-slate-500"
                    }`}>
                      <Key className="w-2.5 h-2.5 text-amber-400" />
                      <span>{phase === "decryption_step" ? "DECRYPT" : "ENCRYPT"}</span>
                      <span className="text-[6.5px] text-amber-400 font-bold">(Key Req.)</span>
                    </div>
                    <div className="text-slate-600 text-xs mt-1">↓</div>
                  </div>

                  {/* Ciphertext Output */}
                  <div className="flex flex-col items-center min-h-[55px]">
                    <span className="text-[6.5px] text-slate-500 uppercase">Ciphertext Digest</span>
                    {phase === "same_data" || phase === "hashing_step" || phase === "hashing_oneway" ? (
                      <div className="text-[7px] text-slate-600 mt-1 italic">Waiting for processing...</div>
                    ) : phase === "encryption_step" ? (
                      <motion.div
                        initial={{ scale: 0.96, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="border border-violet-500/20 bg-slate-950 rounded p-1.5 text-center w-full"
                      >
                        <span className="text-[8px] font-bold text-violet-400 block tracking-widest">
                          {CIPHERTEXT_MISSION_LOG}
                        </span>
                        <span className="text-[6px] text-slate-500 block mt-0.5">Encrypted Ciphertext</span>
                      </motion.div>
                    ) : (
                      /* Decryption Stage */
                      <motion.div
                        initial={{ scale: 0.96, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="border border-emerald-500/30 bg-emerald-950/15 rounded p-1.5 text-center w-full"
                      >
                        <span className="text-[9px] font-bold text-emerald-300 block">
                          "MISSION LOG"
                        </span>
                        <span className="text-[6.5px] text-emerald-400 block font-bold">
                          ✓ DECIPHERED WITH AUTHORIZED KEY
                        </span>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : phase === "purpose_comp" ? (
              <motion.div
                key="purpose"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex flex-col justify-center items-center gap-3.5"
              >
                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider text-center">
                  CRYPTOGRAPHIC PURPOSE COMPARISON
                </div>

                <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                  {/* Hashing Purpose */}
                  <div className="border border-cyan-500/10 bg-cyan-950/5 p-3 rounded-xl">
                    <div className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider mb-2">
                      <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
                      <span>HASHING PURPOSE</span>
                    </div>
                    <p className="text-[8px] text-slate-400 leading-relaxed">
                      Computes an immutable digital fingerprint. Ideal for checking if payload data has been modified.
                    </p>
                    <div className="mt-3 bg-cyan-500/10 border border-cyan-500/20 rounded p-2 text-center text-[7.5px] text-cyan-300 font-bold">
                      ANSWERS: "IS THE DATA UNCHANGED?"
                    </div>
                  </div>

                  {/* Encryption Purpose */}
                  <div className="border border-violet-500/10 bg-violet-950/5 p-3 rounded-xl">
                    <div className="flex items-center gap-1.5 text-violet-400 font-bold uppercase tracking-wider mb-2">
                      <EyeOff className="w-3.5 h-3.5 text-violet-400" />
                      <span>ENCRYPTION PURPOSE</span>
                    </div>
                    <p className="text-[8px] text-slate-400 leading-relaxed">
                      Protects private records. Authorized recipients can read data by decrypting with their credential key.
                    </p>
                    <div className="mt-3 bg-violet-500/10 border border-violet-500/20 rounded p-2 text-center text-[7.5px] text-violet-300 font-bold">
                      ANSWERS: "CAN UNAUTHORIZED PARTY READ THIS?"
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : phase === "fixed_vs_variable" ? (
              <motion.div
                key="fixed_vs_variable"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex flex-col justify-center items-center gap-4 text-center"
              >
                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                  OUTPUT LENGTH BEHAVIOR
                </div>

                <div className="grid grid-cols-2 gap-6 w-full max-w-lg text-left">
                  {/* Hashing lengths */}
                  <div className="border border-white/5 bg-slate-950/60 p-3 rounded-xl space-y-2">
                    <span className="text-[7.5px] text-cyan-400 font-bold block uppercase border-b border-white/5 pb-1">
                      Hashing: Fixed Output Length
                    </span>
                    <div className="text-[7px] text-slate-400 space-y-1">
                      <div>Input: <span className="text-white">"A"</span> ➔ <span className="text-emerald-400 font-mono">64 Hex Characters</span></div>
                      <div>Input: <span className="text-white">"Welcome to CosmosX"</span> ➔ <span className="text-emerald-400 font-mono">64 Hex Characters</span></div>
                      <div>Input: <span className="text-white">[1 GB FILE]</span> ➔ <span className="text-emerald-400 font-mono">64 Hex Characters</span></div>
                    </div>
                    <p className="text-[6.5px] text-slate-500 pt-1 leading-relaxed">
                      SHA-256 always compresses inputs down to exactly 256 bits (32 bytes).
                    </p>
                  </div>

                  {/* Encryption lengths */}
                  <div className="border border-white/5 bg-slate-950/60 p-3 rounded-xl space-y-2">
                    <span className="text-[7.5px] text-violet-400 font-bold block uppercase border-b border-white/5 pb-1">
                      Encryption: Length generally scales
                    </span>
                    <div className="text-[7px] text-slate-400 space-y-1">
                      <div>Input: <span className="text-white">"A"</span> ➔ <span className="text-violet-400 font-mono">Short Ciphertext</span></div>
                      <div>Input: <span className="text-white">"Welcome to CosmosX"</span> ➔ <span className="text-violet-400 font-mono">Medium Ciphertext</span></div>
                      <div>Input: <span className="text-white">[1 GB FILE]</span> ➔ <span className="text-violet-400 font-mono">~1 GB Ciphertext Data</span></div>
                    </div>
                    <p className="text-[6.5px] text-slate-500 pt-1 leading-relaxed">
                      Ciphertext length generally depends on plaintext length and the encryption scheme/mode.
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Summary Grid */
              <motion.div
                key="summary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex flex-col justify-center items-center gap-3.5"
              >
                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider text-center">
                  HASHING vs ENCRYPTION SYSTEM MATRIX
                </div>

                <div className="border border-white/8 bg-slate-950/90 rounded-xl overflow-hidden w-full max-w-lg">
                  <div className="grid grid-cols-3 gap-2 bg-[#040816] p-2 text-[7.5px] font-bold text-slate-400 uppercase tracking-wider border-b border-white/5">
                    <span>Feature</span>
                    <span>Hashing</span>
                    <span>Encryption</span>
                  </div>
                  <div className="divide-y divide-white/5 text-[7.5px]">
                    {[
                      { f: "Direction", h: "One-Way Only", e: "Two-Way (Reversible)" },
                      { f: "Purpose", h: "Data Integrity / Verif.", e: "Confidentiality" },
                      { f: "Key Material", h: "Not Required", e: "Required to Decrypt" },
                      { f: "Output Length", h: "Fixed (256 bits for SHA)", e: "Depends on Plaintext size" },
                      { f: "Main Example", h: "SHA-256", e: "AES / Public-Key Systems" },
                    ].map((row, idx) => (
                      <div key={idx} className="grid grid-cols-3 gap-2 p-2.5">
                        <span className="text-slate-500 font-bold">{row.f}</span>
                        <span className="text-cyan-400 font-bold">{row.h}</span>
                        <span className="text-violet-400 font-bold">{row.e}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Telemetry panel */}
        <div className="border border-white/8 bg-[#040816] rounded-xl p-3 mt-4 shrink-0">
          <div className="text-[7.5px] text-slate-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <HelpCircle className="w-3 h-3 text-cyan-400" />
            <span>CRYPTO OPERATION TELEMETRY SYSTEM</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-[7.5px]">
            {/* Hashing stats */}
            <div className="grid grid-cols-5 gap-1.5 border-r border-white/5 pr-2">
              <div className="col-span-2 text-cyan-400 font-bold border-r border-white/5 pr-1">HASHING</div>
              <div>
                <span className="text-slate-600 block">KEY</span>
                <span className="text-slate-300 font-bold">NONE</span>
              </div>
              <div>
                <span className="text-slate-600 block">MODE</span>
                <span className="text-slate-300 font-bold">ONE-WAY</span>
              </div>
              <div>
                <span className="text-slate-600 block">DIGEST</span>
                <span className="text-slate-300 font-bold">FIXED</span>
              </div>
            </div>

            {/* Encryption stats */}
            <div className="grid grid-cols-5 gap-1.5">
              <div className="col-span-2 text-violet-400 font-bold border-r border-white/5 pr-1">ENCRYPTION</div>
              <div>
                <span className="text-slate-600 block">KEY</span>
                <span className="text-slate-300 font-bold">REQUIRED</span>
              </div>
              <div>
                <span className="text-slate-600 block">MODE</span>
                <span className="text-slate-300 font-bold">TWO-WAY</span>
              </div>
              <div>
                <span className="text-slate-600 block">DIGEST</span>
                <span className="text-slate-300 font-bold">VARIABLE</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="px-4 py-1.5 border-t border-white/5 bg-slate-950/50 shrink-0 flex items-center justify-between text-[7px] text-slate-600">
        <span>SECURITY LEVEL: MAXIMUM</span>
        <div className="flex items-center gap-1">
          <RefreshCw className="w-2.5 h-2.5 animate-spin" style={{ animationDuration: "12s" }} />
          <span>SYNCHRONIZED MONITOR ACTIVE</span>
        </div>
      </div>
    </div>
  );
}

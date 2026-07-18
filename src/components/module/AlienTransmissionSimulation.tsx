import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, AlertTriangle, CheckCircle, Database, Search } from "lucide-react";

interface Props {
  color: string;
}

// Precomputed real SHA-256 hashes
const MSG_ORIGINAL = "COORDINATES: XJ-42 | FUEL: 850 | CODE: COSMOS-7";
const MSG_ALTERED = "COORDINATES: XJ-42 | FUEL: 8500 | CODE: COSMOS-7";

const HASH_ORIGINAL = "e79e263f7594b01471834908fa63ecaadc94236ecf458915ff74116fd3e5aedd";
const HASH_ALTERED = "5534060c69d4eaf1bab9ffdc0a5240b8c359e496039dc71c32973bda7634b4af";

type Phase =
  | "prepare_tx"
  | "transmit_normal"
  | "receive_normal"
  | "compare_normal"
  | "prepare_glitch"
  | "transmit_glitch"
  | "receive_glitch"
  | "compare_glitch"
  | "side_by_side"
  | "loop_wait";

const PHASES: Phase[] = [
  "prepare_tx",
  "transmit_normal",
  "receive_normal",
  "compare_normal",
  "prepare_glitch",
  "transmit_glitch",
  "receive_glitch",
  "compare_glitch",
  "side_by_side",
  "loop_wait",
];

const PHASE_DURATIONS: Record<Phase, number> = {
  prepare_tx: 3000,
  transmit_normal: 3000,
  receive_normal: 3000,
  compare_normal: 4500,
  prepare_glitch: 3000,
  transmit_glitch: 3000,
  receive_glitch: 3000,
  compare_glitch: 4500,
  side_by_side: 5000,
  loop_wait: 2000,
};

const TELEMETRY_STATUS: Record<Phase, string> = {
  prepare_tx: "GENERATING EXPECTED HASH",
  transmit_normal: "TRANSMITTING...",
  receive_normal: "CALCULATING RECEIVED HASH",
  compare_normal: "VERIFIED",
  prepare_glitch: "LOADED EXPECTED HASH",
  transmit_glitch: "TRANSMITTING...",
  receive_glitch: "CALCULATING RECEIVED HASH",
  compare_glitch: "COMPROMISED",
  side_by_side: "VERIFICATION REPORT GENERATED",
  loop_wait: "STANDBY",
};

export default function AlienTransmissionSimulation({ color }: Props) {
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

  // Compute positions for transmitting animation
  const isTransmitting = phase === "transmit_normal" || phase === "transmit_glitch";

  return (
    <div className="w-full h-full flex flex-col bg-[#020712] border border-white/8 rounded-2xl overflow-hidden font-mono select-none text-[10px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/8 bg-[#040816] shrink-0">
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5" style={{ color }} />
          <span className="text-[9px] uppercase tracking-widest font-bold text-white">
            ALIEN TRANSMISSION SCANNER
          </span>
        </div>
        <span className="text-[8px] text-slate-500 uppercase tracking-wider">VERIFYING MESSAGE INTEGRITY</span>
      </div>

      {/* Main Sandbox Workspace */}
      <div className="flex-1 overflow-hidden relative p-4 flex flex-col justify-between min-h-[350px]">
        
        {/* Deep Space Pipeline Visualization */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-0 relative">
          <AnimatePresence mode="wait">
            
            {/* Phase 1: Prepare TX */}
            {phase === "prepare_tx" && (
              <motion.div
                key="prepare_tx"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex flex-col items-center gap-3 text-center"
              >
                <div className="text-[7.5px] text-slate-500 uppercase tracking-wider">Transmission Source: Station Orion</div>
                
                <div className="border border-cyan-500/20 bg-cyan-950/5 rounded-xl p-3 w-72 space-y-1.5">
                  <span className="text-[7px] text-cyan-400 font-bold block">ORIGINAL MESSAGE</span>
                  <div className="bg-slate-950/80 p-2 rounded text-[7.5px] text-slate-300 font-mono text-left leading-relaxed">
                    COORDINATES: XJ-42<br />
                    FUEL LEVEL: 850<br />
                    MISSION CODE: COSMOS-7
                  </div>
                </div>

                <div className="text-slate-600 text-sm">↓ SHA-256</div>

                <div className="border border-emerald-500/30 bg-emerald-950/20 rounded-xl p-2.5 w-72">
                  <span className="text-[6.5px] text-slate-500 block mb-1">TRUSTED EXPECTED HASH</span>
                  <span className="text-[8px] font-bold text-emerald-400 tracking-wide block font-mono">
                    {HASH_ORIGINAL.slice(0, 16)}...{HASH_ORIGINAL.slice(-8)}
                  </span>
                  <span className="text-[6px] text-slate-500 block mt-1">✓ REFERENCE FINGERPRINT STORED</span>
                </div>
              </motion.div>
            )}

            {/* Phase 2 & 6: Deep Space Transmission */}
            {isTransmitting && (
              <motion.div
                key="transmitting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex flex-col items-center gap-4 text-center max-w-sm"
              >
                <div className="text-[8px] text-slate-500 uppercase tracking-wider">
                  {phase === "transmit_normal" ? "Transmitting Packet via Space Mesh" : "Glitch Event: Signal Anomaly Detected"}
                </div>

                <div className="w-full border border-white/5 bg-slate-950/60 rounded-xl p-4 flex items-center justify-between relative overflow-hidden">
                  {/* Orion Station */}
                  <div className="text-left flex flex-col items-center">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-xs">📡</div>
                    <span className="text-[7px] text-slate-400 mt-1">ORION</span>
                  </div>

                  {/* Packet visual flow */}
                  <div className="flex-1 px-4 relative flex items-center justify-center">
                    <div className="w-full h-px border-t border-dashed border-white/20 absolute" />
                    
                    <motion.div
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      className={`px-2 py-0.5 rounded text-[7px] font-bold z-10 flex items-center gap-1 ${
                        phase === "transmit_glitch"
                          ? "bg-rose-500/20 border border-rose-500/40 text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                          : "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.4)]"
                      }`}
                    >
                      <span>TX</span>
                      {phase === "transmit_glitch" && <span className="animate-pulse">⚠</span>}
                    </motion.div>
                  </div>

                  {/* Receiving Station */}
                  <div className="text-right flex flex-col items-center">
                    <div className="w-8 h-8 rounded-lg bg-slate-950 border border-white/10 flex items-center justify-center text-xs">🛸</div>
                    <span className="text-[7px] text-slate-400 mt-1">RECEIVER</span>
                  </div>
                </div>

                <div className="border border-white/5 bg-slate-950 p-2.5 rounded-lg w-full text-left space-y-1">
                  <div className="flex justify-between text-[7px] text-slate-500 font-bold">
                    <span>SIGNAL LEVEL: 89%</span>
                    <span className={phase === "transmit_glitch" ? "text-rose-400" : "text-emerald-400"}>
                      {phase === "transmit_glitch" ? "ANOMALY ACTIVE" : "STABLE"}
                    </span>
                  </div>
                  {phase === "transmit_glitch" && (
                    <motion.p
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="text-[7.5px] text-rose-400 font-bold"
                    >
                      ⚠ SIGNAL ANOMALY DETECTED — PACKET DATA GLITCH
                    </motion.p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Phase 3 & 7: Receive Packets */}
            {(phase === "receive_normal" || phase === "receive_glitch") && (
              <motion.div
                key="received"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex flex-col items-center gap-3 text-center"
              >
                <div className="text-[8px] text-slate-500 uppercase tracking-wider">Incoming Packet Received</div>

                <div className={`border rounded-xl p-3 w-72 space-y-2 text-left relative ${
                  phase === "receive_glitch" ? "border-rose-500/20 bg-rose-950/5" : "border-white/10 bg-slate-950"
                }`}>
                  <span className={`text-[7px] font-bold block ${phase === "receive_glitch" ? "text-rose-400" : "text-cyan-400"}`}>
                    {phase === "receive_glitch" ? "INCOMING MESSAGE (ALTERED)" : "INCOMING MESSAGE (UNMODIFIED)"}
                  </span>
                  
                  <div className="bg-slate-950/80 p-2 rounded text-[7.5px] font-mono leading-relaxed text-slate-300">
                    COORDINATES: XJ-42<br />
                    FUEL LEVEL:{" "}
                    {phase === "receive_glitch" ? (
                      <span className="bg-rose-500/20 border border-rose-500/30 px-1 rounded text-rose-300 font-bold">
                        8500
                      </span>
                    ) : (
                      "850"
                    )}
                    <br />
                    MISSION CODE: COSMOS-7
                  </div>

                  <div className="flex justify-between items-center text-[7px] text-slate-500 pt-1 border-t border-white/5 mt-1.5">
                    <span>STATUS: UNVERIFIED</span>
                    <span className="animate-pulse text-amber-400">RUNNING SHA-256...</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Phase 4 & 8: Compare Digests */}
            {(phase === "compare_normal" || phase === "compare_glitch") && (
              <motion.div
                key="comparison"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex flex-col items-center gap-3 text-center"
              >
                <div className="text-[8px] text-slate-500 uppercase tracking-wider">Integrity Comparator Scan</div>

                <div className="w-full max-w-sm space-y-2 text-left font-mono">
                  {/* Expected Hash */}
                  <div className="border border-cyan-500/10 bg-cyan-950/5 p-2 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[6.5px] text-slate-500 uppercase block">Expected (Trusted Reference)</span>
                      <span className="text-[8px] text-cyan-300 font-bold">{HASH_ORIGINAL}</span>
                    </div>
                    <Database className="w-4 h-4 text-cyan-400 shrink-0" />
                  </div>

                  {/* Flow comparison link */}
                  <div className="flex justify-center items-center gap-2 py-1">
                    <div className="h-px grow bg-white/5" />
                    <span className={`text-[7px] px-2 py-0.5 rounded font-bold uppercase tracking-widest ${
                      phase === "compare_normal" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    }`}>
                      {phase === "compare_normal" ? "✓ EQUAL MATCH" : "✕ MISMATCH DETECTED"}
                    </span>
                    <div className="h-px grow bg-white/5" />
                  </div>

                  {/* Calculated Hash */}
                  <div className={`p-2 rounded-xl flex items-center justify-between border ${
                    phase === "compare_normal" ? "border-emerald-500/20 bg-emerald-950/5" : "border-rose-500/20 bg-rose-950/5"
                  }`}>
                    <div>
                      <span className="text-[6.5px] text-slate-500 uppercase block">Calculated (Received Data)</span>
                      <span className={`text-[8px] font-bold ${phase === "compare_normal" ? "text-emerald-300" : "text-rose-300"}`}>
                        {phase === "compare_normal" ? HASH_ORIGINAL : HASH_ALTERED}
                      </span>
                    </div>
                    <Search className={`w-4 h-4 shrink-0 ${phase === "compare_normal" ? "text-emerald-400" : "text-rose-400"}`} />
                  </div>
                </div>

                {/* Verdict text */}
                <motion.div
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`w-full max-w-sm rounded-xl p-3 text-center border mt-1.5 ${
                    phase === "compare_normal"
                      ? "border-emerald-500/30 bg-emerald-950/15"
                      : "border-rose-500/30 bg-rose-950/15"
                  }`}
                >
                  <p className={`text-[8.5px] font-bold ${phase === "compare_normal" ? "text-emerald-300" : "text-rose-300"}`}>
                    {phase === "compare_normal"
                      ? "INTEGRITY VERIFIED — DATA IS INTACT"
                      : "⚠ INTEGRITY FAILURE — DATA HAS CHANGED"}
                  </p>
                  <p className="text-[7.5px] text-slate-400 mt-1 leading-relaxed">
                    {phase === "compare_normal"
                      ? "The calculated hash matches the trusted expected hash, indicating that the received content is unchanged."
                      : "The cryptographic digest recalculation does not match the reference checksum, exposing data alterations."}
                  </p>
                </motion.div>
              </motion.div>
            )}

            {/* Phase 5: Prepare Glitch (Transition) */}
            {phase === "prepare_glitch" && (
              <motion.div
                key="prepare_glitch"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex flex-col items-center gap-3.5 text-center"
              >
                <AlertTriangle className="w-8 h-8 text-amber-400 animate-bounce" />
                <div>
                  <p className="text-xs font-bold text-white">SIMULATING SIGNAL CORRUPTION</p>
                  <p className="text-[8px] text-slate-400 mt-1">Injecting deep space packet alterations...</p>
                </div>
              </motion.div>
            )}

            {/* Side-by-Side Summary */}
            {(phase === "side_by_side" || phase === "loop_wait") && (
              <motion.div
                key="side_by_side"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex flex-col justify-center items-center gap-3.5"
              >
                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider text-center">
                  INTEGRITY VERIFICATION SYSTEM RECAP
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
                  {/* Case 1: Match */}
                  <div className="border border-emerald-500/20 bg-emerald-950/5 p-3 rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-[8.5px] text-emerald-400 font-bold uppercase mb-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>CASE A: MATCH</span>
                      </div>
                      <p className="text-[7.5px] text-slate-400 leading-relaxed font-mono">
                        Expected: {HASH_ORIGINAL.slice(0, 10)}...<br />
                        Calculated: {HASH_ORIGINAL.slice(0, 10)}...
                      </p>
                    </div>
                    <div className="mt-2.5 bg-emerald-500/10 border border-emerald-500/20 text-[7px] text-emerald-400 font-bold py-1 text-center rounded">
                      ✓ DATA INTACT
                    </div>
                  </div>

                  {/* Case 2: Mismatch */}
                  <div className="border border-rose-500/20 bg-rose-950/5 p-3 rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-[8.5px] text-rose-400 font-bold uppercase mb-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        <span>CASE B: MISMATCH</span>
                      </div>
                      <p className="text-[7.5px] text-slate-400 leading-relaxed font-mono">
                        Expected: {HASH_ORIGINAL.slice(0, 10)}...<br />
                        Calculated: {HASH_ALTERED.slice(0, 10)}...
                      </p>
                    </div>
                    <div className="mt-2.5 bg-rose-500/10 border border-rose-500/20 text-[7px] text-rose-400 font-bold py-1 text-center rounded">
                      ⚠ DATA ALTERED
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Live Telemetry Panel */}
        <div className="border border-white/8 bg-[#040816] rounded-xl p-3 mt-4 shrink-0">
          <div className="text-[7.5px] text-slate-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-cyan-400" />
            <span>TRANSMISSION INTEGRITY METRICS</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[7.5px]">
            <div>
              <span className="text-slate-500 block">SOURCE</span>
              <span className="text-slate-200 font-bold">STATION ORION</span>
            </div>
            <div>
              <span className="text-slate-500 block">EXPECTED HASH</span>
              <span className="text-cyan-400 font-bold">{HASH_ORIGINAL.slice(0, 8).toUpperCase()}</span>
            </div>
            <div>
              <span className="text-slate-500 block">CALCULATED HASH</span>
              <span className={phase === "compare_glitch" ? "text-rose-400" : "text-emerald-400"}>
                {phase === "compare_glitch" ? HASH_ALTERED.slice(0, 8).toUpperCase() : HASH_ORIGINAL.slice(0, 8).toUpperCase()}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">TELEMETRY STATUS</span>
              <motion.span
                key={phase}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold block truncate"
                style={{
                  color: phase === "compare_normal" ? "#10b981" : phase === "compare_glitch" ? "#f43f5e" : color,
                }}
              >
                {TELEMETRY_STATUS[phase]}
              </motion.span>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="px-4 py-1.5 border-t border-white/5 bg-slate-950/50 shrink-0 flex items-center justify-between text-[7px] text-slate-600">
        <span>SECURITY CHECKSUM CORE V4</span>
        <div className="flex items-center gap-1">
          <span className="font-bold">INTEGRITY DECISION:</span>
          <span className="text-emerald-400 font-bold">BINARY MATCH/MISMATCH ONLY</span>
        </div>
      </div>
    </div>
  );
}

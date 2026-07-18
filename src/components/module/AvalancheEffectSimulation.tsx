import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, ShieldAlert, Cpu, Activity, RefreshCw } from "lucide-react";

interface Props {
  color: string;
}

// Precomputed real SHA-256 hashes
const HASH_COSMOS = "2b37c2b71830904eaac0ab3e86081b45abe29185761fdc1f8290127363e3173e";
const HASH_COSMOX = "ec8d6474d2a2cac95038f226779df4967a8871c021c6922787f41a8f2540aef5";

// Blockchain data hashes
const HASH_100 = "ad57366865126e55649ecb23ae1d48887544976efea46a48eb5d85a6eeb4d306";
const HASH_101 = "16dc368a89b428b2485484313ba67a3912ca03f2b2b42429174a4f8b3dc84e44";

type Phase =
  | "baseline"
  | "change_char"
  | "hash_both"
  | "compare_hashes"
  | "bit_level"
  | "why_matters"
  | "blockchain"
  | "summary"
  | "loop_wait";

const PHASES: Phase[] = [
  "baseline",
  "change_char",
  "hash_both",
  "compare_hashes",
  "bit_level",
  "why_matters",
  "blockchain",
  "summary",
  "loop_wait",
];

const PHASE_DURATIONS: Record<Phase, number> = {
  baseline: 3500,
  change_char: 3000,
  hash_both: 3500,
  compare_hashes: 4500,
  bit_level: 5000,
  why_matters: 5000,
  blockchain: 4500,
  summary: 4500,
  loop_wait: 2000,
};

const STATUS_TEXT: Record<Phase, string> = {
  baseline: "BASELINE FINGERPRINT ESTABLISHED",
  change_char: "INPUT MODIFIED",
  hash_both: "REHASHING INPUTS...",
  compare_hashes: "COMPARING OUTPUT DIGESTS...",
  bit_level: "AVALANCHE EFFECT DETECTED",
  why_matters: "PREVENTING INCREMENTAL GUESSING",
  blockchain: "VERIFYING BLOCKCHAIN INTEGRITY",
  summary: "AVALANCHE METRICS LOCKED",
  loop_wait: "STANDBY",
};

export default function AvalancheEffectSimulation({ color }: Props) {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const phase = PHASES[phaseIdx];

  const advance = () => {
    setPhaseIdx(prev => {
      const next = prev + 1;
      if (next >= PHASES.length) return 0; // restart loop
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

  // Render a grid representing bits
  // Generate 8x8 deterministic bits for grid A, and a modified grid B where roughly 50% are different
  const renderBitGrid = (isGridB: boolean) => {
    const cells = [];
    const seed = 42; // arbitrary seed

    for (let i = 0; i < 64; i++) {
      // Deterministic random bit for Grid A
      const rawVal = Math.sin(i * seed) > 0;
      let bitVal = rawVal ? 1 : 0;

      // For Grid B, flip ~50% of the bits deterministically
      const shouldFlip = Math.sin(i * 123.45) > 0;
      if (isGridB && shouldFlip) {
        bitVal = bitVal === 1 ? 0 : 1;
      }

      cells.push(
        <div
          key={i}
          className={`w-2.5 h-2.5 rounded-sm transition-all duration-300 ${
            bitVal === 1
              ? isGridB && shouldFlip
                ? "bg-rose-500 shadow-[0_0_4px_rgba(244,63,94,0.6)]"
                : "bg-cyan-500"
              : isGridB && shouldFlip
              ? "bg-rose-950/80 border border-rose-500/40"
              : "bg-slate-900 border border-white/5"
          }`}
        />
      );
    }
    return <div className="grid grid-cols-8 gap-1 p-1.5 border border-white/5 bg-slate-950/60 rounded-lg">{cells}</div>;
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#020712] border border-white/8 rounded-2xl overflow-hidden font-mono select-none text-[10px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/8 bg-[#040816] shrink-0">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 animate-pulse" style={{ color }} />
          <span className="text-[9px] uppercase tracking-widest font-bold text-white">
            AVALANCHE MONITOR
          </span>
        </div>
        <span className="text-[8px] text-slate-500 uppercase tracking-wider">
          1 Small Change → Drastic Output Shift
        </span>
      </div>

      {/* Main Sandbox Frame */}
      <div className="flex-1 overflow-hidden relative p-4 flex flex-col justify-between min-h-[300px]">
        
        {/* Dynamic Scene Visualizer */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-0 relative">
          <AnimatePresence mode="wait">
            
            {/* Phase 1: Baseline */}
            {phase === "baseline" && (
              <motion.div
                key="baseline"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="w-full flex flex-col items-center gap-2.5 text-center"
              >
                <div className="text-[8px] text-slate-500 uppercase tracking-wider">Establish Baseline Hash</div>
                
                <div className="border border-white/10 bg-slate-950/60 rounded-xl p-2.5 w-48">
                  <span className="text-[7.5px] text-slate-500 block">ORIGINAL INPUT</span>
                  <span className="text-sm font-bold text-cyan-400">COSMOS</span>
                </div>

                <div className="text-slate-600 text-sm">↓</div>

                <div className="border border-cyan-500/20 bg-cyan-950/5 rounded-xl px-4 py-2 text-center text-[8px] flex items-center gap-2">
                  <Cpu className="w-3 h-3 text-cyan-400" />
                  <span>SHA-256 HASHING CORE</span>
                </div>

                <div className="text-slate-600 text-sm">↓</div>

                <div className="border border-emerald-500/30 bg-emerald-950/20 rounded-xl p-3 w-72">
                  <span className="text-[7px] text-slate-500 block mb-1">HASH A (DIGEST)</span>
                  <span className="text-[8px] font-bold text-emerald-400 tracking-wide select-text">
                    {HASH_COSMOS}
                  </span>
                  <span className="text-[7px] text-slate-500 block mt-1.5 font-bold">
                    ✓ BASELINE FINGERPRINT ESTABLISHED
                  </span>
                </div>
              </motion.div>
            )}

            {/* Phase 2: Change One Character */}
            {phase === "change_char" && (
              <motion.div
                key="change_char"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex flex-col items-center gap-3 text-center"
              >
                <div className="text-[8px] text-slate-500 uppercase tracking-wider">Modify Single Character</div>

                <div className="flex gap-4 items-center">
                  <div className="border border-white/5 bg-slate-950/40 rounded-xl p-2.5 w-32 opacity-60">
                    <span className="text-[7px] text-slate-500 block">INPUT A</span>
                    <span className="text-xs font-bold text-slate-300">COSMOS</span>
                  </div>

                  <div className="text-slate-600 font-bold">➔</div>

                  <div className="border border-amber-500/30 bg-amber-950/10 rounded-xl p-2.5 w-32 relative">
                    <span className="text-[7px] text-amber-500 font-bold block">INPUT B</span>
                    <span className="text-xs font-bold text-slate-200 tracking-widest">
                      COSMO
                      <motion.span
                        animate={{ opacity: [1, 0.4, 1], scale: [1, 1.15, 1] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="inline-block text-amber-400 font-extrabold bg-amber-500/20 px-1 rounded"
                      >
                        X
                      </motion.span>
                    </span>
                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-amber-500 border border-black animate-ping" />
                  </div>
                </div>

                <div className="mt-2 border border-amber-500/20 bg-amber-500/5 rounded-lg px-3 py-1.5 text-[8px] text-amber-300 max-w-xs">
                  <span className="font-bold">CHANGE DETECTED:</span> 1 Character Modified (S ➔ X)
                </div>
              </motion.div>
            )}

            {/* Phase 3 & 4: Hash both and compare */}
            {(phase === "hash_both" || phase === "compare_hashes") && (
              <motion.div
                key="compare"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex flex-col items-center gap-3"
              >
                <div className="text-[8px] text-slate-500 uppercase tracking-wider text-center">
                  {phase === "hash_both" ? "Compute Hash Digests" : "Visual Avalanche Shift Scan"}
                </div>

                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                  {/* HASH A */}
                  <div className="border border-white/5 bg-slate-950/30 p-2.5 rounded-lg text-center flex flex-col justify-between">
                    <div>
                      <span className="text-[7px] text-slate-500 block">INPUT A</span>
                      <span className="text-[9px] font-bold text-slate-300">COSMOS</span>
                    </div>
                    <div className="my-1.5 text-[7px] text-slate-500 font-bold">SHA-256</div>
                    <div className="border border-emerald-500/20 bg-emerald-950/5 rounded p-1">
                      <span className="text-[7px] text-slate-500 block">HASH A</span>
                      <span className="text-[8.5px] font-bold text-emerald-400 font-mono block truncate">
                        {HASH_COSMOS.slice(0, 8)}...{HASH_COSMOS.slice(-8)}
                      </span>
                    </div>
                  </div>

                  {/* HASH B */}
                  <div className="border border-amber-500/10 bg-slate-950/30 p-2.5 rounded-lg text-center flex flex-col justify-between">
                    <div>
                      <span className="text-[7px] text-slate-500 block">INPUT B</span>
                      <span className="text-[9px] font-bold text-slate-300">
                        COSMO<span className="text-amber-400 font-extrabold">X</span>
                      </span>
                    </div>
                    <div className="my-1.5 text-[7px] text-slate-500 font-bold">SHA-256</div>
                    <div className="border border-rose-500/20 bg-rose-950/5 rounded p-1">
                      <span className="text-[7px] text-slate-500 block">HASH B</span>
                      <span className="text-[8.5px] font-bold text-rose-400 font-mono block truncate">
                        {HASH_COSMOX.slice(0, 8)}...{HASH_COSMOX.slice(-8)}
                      </span>
                    </div>
                  </div>
                </div>

                {phase === "compare_hashes" && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-sm border border-rose-500/30 bg-rose-950/10 rounded-xl p-3 text-center"
                  >
                    <div className="text-[8.5px] text-rose-400 font-bold uppercase tracking-wider mb-1">
                      Avalanche Output Shift
                    </div>
                    <div className="space-y-1 font-mono text-[7px] text-slate-400 text-left">
                      <div className="truncate"><span className="text-emerald-400 font-bold">A:</span> {HASH_COSMOS}</div>
                      <div className="truncate"><span className="text-rose-400 font-bold">B:</span> {HASH_COSMOX}</div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[7px] font-bold text-slate-400 border-t border-white/5 pt-2">
                      <span>INPUT CHG: 1 CHAR</span>
                      <span>HASH OFFSET: <span className="text-rose-400">HIGH</span></span>
                    </div>

                    {/* Progress Bar / Difference Meter */}
                    <div className="mt-1.5 h-1.5 w-full bg-slate-900 border border-white/5 rounded-full overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "93%" }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="h-full bg-linear-to-r from-amber-500 to-rose-500"
                      />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Phase 5: Bit-Level Visualization */}
            {phase === "bit_level" && (
              <motion.div
                key="bit_level"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex flex-col items-center gap-3"
              >
                <div className="text-[8px] text-slate-500 uppercase tracking-wider text-center">Bit-Level Avalanche Shift</div>

                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                  {/* Bit Grid A */}
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[7.5px] text-slate-500">HASH A BIT GRID (256-BIT)</span>
                    {renderBitGrid(false)}
                    <span className="text-[6.5px] text-slate-600">INPUT A: COSMOS</span>
                  </div>

                  {/* Bit Grid B */}
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[7.5px] text-amber-500 font-bold">HASH B BIT GRID (~50% CHANGED)</span>
                    {renderBitGrid(true)}
                    <span className="text-[6.5px] text-slate-600">INPUT B: COSMOX</span>
                  </div>
                </div>

                <div className="border border-rose-500/20 bg-rose-950/15 rounded-xl p-2 w-full max-w-xs text-center">
                  <div className="flex justify-between text-[7px] text-slate-400 font-bold">
                    <span>INPUT DIFF: 1 BIT</span>
                    <span>OUTPUT DIFF: ≈ 50% OF BITS ON AVERAGE</span>
                  </div>
                  <div className="text-[8.5px] text-rose-400 font-bold mt-1 tracking-widest">
                    AVALANCHE EFFECT DETECTED
                  </div>
                </div>
              </motion.div>
            )}

            {/* Phase 6: Why This Matters */}
            {phase === "why_matters" && (
              <motion.div
                key="why_matters"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex flex-col items-center gap-3 text-center"
              >
                <div className="text-[8px] text-slate-500 uppercase tracking-wider">Security: Guessing Attacker Defense</div>

                <div className="w-full max-w-xs space-y-1.5 text-left font-mono">
                  <div className="border border-white/5 bg-slate-950/60 p-1.5 rounded-lg flex items-center justify-between text-[7.5px]">
                    <span className="text-slate-400">GUESS 1: "COSMOS"</span>
                    <span className="text-cyan-400">{HASH_COSMOS.slice(0, 16).toUpperCase()}...</span>
                  </div>

                  <div className="border border-white/5 bg-slate-950/60 p-1.5 rounded-lg flex items-center justify-between text-[7.5px]">
                    <span className="text-slate-400">GUESS 2: "COSMOT"</span>
                    <span className="text-rose-400">8B632CA912A0C914...</span>
                  </div>

                  <div className="border border-white/5 bg-slate-950/60 p-1.5 rounded-lg flex items-center justify-between text-[7.5px]">
                    <span className="text-slate-400">GUESS 3: "COSMOU"</span>
                    <span className="text-amber-400">FA016C92B4527F83...</span>
                  </div>
                </div>

                <div className="border border-amber-500/20 bg-amber-500/5 rounded-xl p-2.5 w-full max-w-xs">
                  <span className="text-[8px] text-amber-300 font-bold block mb-0.5">NO USEFUL INCREMENTAL PATTERN</span>
                  <span className="text-[7.5px] text-slate-400 leading-relaxed block">
                    Small input changes do not yield small, predictable output changes. Attacks cannot "walk" incrementally toward the target input.
                  </span>
                </div>
              </motion.div>
            )}

            {/* Phase 7: Blockchain Connection */}
            {phase === "blockchain" && (
              <motion.div
                key="blockchain"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex flex-col items-center gap-3 text-center"
              >
                <div className="text-[8px] text-slate-500 uppercase tracking-wider">Blockchain Tamper Protection</div>

                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                  {/* Block 1 */}
                  <div className="border border-white/5 bg-slate-950/60 p-2.5 rounded-lg">
                    <span className="text-[7px] text-slate-500 block">BLOCK DATA (ORIGINAL)</span>
                    <span className="text-[8.5px] font-bold text-slate-300 block my-1">TX AMOUNT: 100</span>
                    <span className="text-[7.5px] text-emerald-400 font-mono block mt-1 truncate">
                      {HASH_100.slice(0, 16)}...
                    </span>
                  </div>

                  {/* Block 1 Tampered */}
                  <div className="border border-rose-500/20 bg-rose-950/10 p-2.5 rounded-lg">
                    <span className="text-[7px] text-rose-400 font-bold block">BLOCK DATA (TAMPERED)</span>
                    <span className="text-[8.5px] font-bold text-rose-300 block my-1">
                      TX AMOUNT: <span className="underline">101</span>
                    </span>
                    <span className="text-[7.5px] text-rose-400 font-mono block mt-1 truncate">
                      {HASH_101.slice(0, 16)}...
                    </span>
                  </div>
                </div>

                <div className="border border-rose-500/30 bg-rose-950/20 rounded-xl p-2.5 w-full max-w-xs">
                  <div className="text-[8.5px] text-rose-400 font-bold">⚠ BLOCK FINGERPRINT MISMATCH</div>
                  <p className="text-[7.5px] text-slate-400 mt-1 leading-relaxed">
                    Even a tiny modification to block data produces a drastically different cryptographic fingerprint.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Summary */}
            {(phase === "summary" || phase === "loop_wait") && (
              <motion.div
                key="summary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex flex-col items-center gap-3 text-center"
              >
                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                  AVALANCHE EFFECT SUMMARY
                </div>

                <div className="border border-cyan-500/20 bg-cyan-950/10 rounded-xl p-3 w-72 space-y-2 text-left">
                  <div className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">✓</span>
                    <p className="text-[7.5px] text-slate-300">
                      <strong>Avalanche Effect:</strong> Changing a single input character causes a completely different output hash.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">✓</span>
                    <p className="text-[7.5px] text-slate-300">
                      <strong>Bit-Level:</strong> On average, roughly 50% of the digest bits change randomly when a single input bit is flipped.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">✓</span>
                    <p className="text-[7.5px] text-slate-300">
                      <strong>Tamper-Proof:</strong> Makes any retrofitted edits to historical block data instantly detectable by peers.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Live Telemetry Panel */}
        <div className="border border-white/8 bg-[#040816] rounded-xl p-3 mt-4 shrink-0">
          <div className="text-[7.5px] text-slate-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-cyan-400" />
            <span>AVALANCHE TELEMETRY MONITOR</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[7.5px]">
            <div>
              <span className="text-slate-500 block">INPUT CHANGE</span>
              <span className="text-slate-200 font-bold">1 BIT / 1 CHAR</span>
            </div>
            <div>
              <span className="text-slate-500 block">HASH CORE</span>
              <span className="text-slate-200 font-bold">SHA-256</span>
            </div>
            <div>
              <span className="text-slate-500 block">BITS CHANGED</span>
              <span className="text-cyan-400 font-bold">~50% AVERAGE</span>
            </div>
            <div>
              <span className="text-slate-500 block">STATUS</span>
              <motion.span
                key={phase}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold block truncate"
                style={{
                  color: phase === "bit_level" || phase === "summary" ? "#10b981" : color,
                }}
              >
                {STATUS_TEXT[phase]}
              </motion.span>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="px-4 py-1.5 border-t border-white/5 bg-slate-950/50 shrink-0 flex items-center justify-between text-[7px] text-slate-600">
        <span>SHA-256 TELEMETRY STREAM</span>
        <div className="flex items-center gap-1.5">
          <span className="font-bold">STATUS:</span>
          <span className="text-emerald-400 font-bold">ACTIVE</span>
        </div>
      </div>
    </div>
  );
}

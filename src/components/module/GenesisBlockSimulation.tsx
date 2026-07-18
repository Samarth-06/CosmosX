import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Server, Settings, ShieldAlert, ArrowLeft, CheckCircle2 } from "lucide-react";

interface Props {
  color: string;
}

type Step =
  | "empty"             // 0: Empty blockchain timeline, UNINITIALIZED status
  | "initializing"      // 1: Loading loader animation
  | "loading_config"    // 2: Reading genesis.json properties list
  | "create_genesis"    // 3: Spawns Block #0 card
  | "search_parent"     // 4: Attempt pointing left, fails with ✕ null zero ref
  | "establish_state"   // 5: Emphasize initial allocations ledger rules
  | "build_chain"       // 6: Chronologically render Block #1, #2, #3 back-pointing
  | "comparison"        // 7: Side-by-side Genesis vs Normal Block properties
  | "complete";         // 8: Full pipeline active chain status height: 3

export default function GenesisBlockSimulation({ color }: Props) {
  const [step, setStep] = useState<Step>("empty");

  useEffect(() => {
    const timeline: { target: Step; delay: number }[] = [
      { target: "empty", delay: 0 },
      { target: "initializing", delay: 2000 },
      { target: "loading_config", delay: 3500 },
      { target: "create_genesis", delay: 6500 },
      { target: "search_parent", delay: 9000 },
      { target: "establish_state", delay: 12000 },
      { target: "build_chain", delay: 14500 },
      { target: "comparison", delay: 18500 },
      { target: "complete", delay: 22000 },
    ];

    let timers: NodeJS.Timeout[] = [];

    const runTimeline = () => {
      timeline.forEach((item) => {
        const timer = setTimeout(() => {
          setStep(item.target);
        }, item.delay);
        timers.push(timer);
      });

      // Loop restart after 26.5 seconds
      const loopTimer = setTimeout(() => {
        runTimeline();
      }, 26500);
      timers.push(loopTimer);
    };

    runTimeline();

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, []);

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 flex flex-col justify-between min-h-[400px] lg:h-full relative overflow-hidden shadow-2xl">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-size-[16px_16px] bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 border-b border-white/5 pb-3 flex justify-between items-center text-left">
        <div>
          <span className="font-mono text-[8px] tracking-widest text-cyan-400 uppercase block">Simulation Lab</span>
          <h3 className="font-rushblade text-sm text-white mt-1">Genesis Sequence</h3>
          <p className="text-[9px] font-mono text-slate-400 mt-0.5">WHERE THE CHAIN BEGINS</p>
        </div>

        {/* Dynamic height/status HUD indicator */}
        <div className="text-right font-mono text-[9px]">
          <span className="text-slate-500 uppercase block">Chain Height</span>
          <span className="text-white font-bold block">
            {["empty", "initializing", "loading_config"].includes(step)
              ? "—"
              : ["create_genesis", "search_parent", "establish_state"].includes(step)
              ? "0"
              : step === "build_chain"
              ? "2"
              : "3"}
          </span>
        </div>
      </div>

      {/* Viewport content area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center py-4 min-h-[220px]">
        <AnimatePresence mode="wait">
          
          {/* STEP 0: EMPTY */}
          {step === "empty" && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-700">
                <Server className="w-5 h-5" />
              </div>
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">[ NO BLOCKS YET ]</div>
              <div className="w-32 border-t border-dashed border-white/10 mt-1" />
            </motion.div>
          )}

          {/* STEP 1: INITIALIZING */}
          {step === "initializing" && (
            <motion.div
              key="initializing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <div className="text-[9px] font-mono text-cyan-300 uppercase tracking-widest animate-pulse">
                Initializing Network...
              </div>
            </motion.div>
          )}

          {/* STEP 2: CONFIG LOAD */}
          {step === "loading_config" && (
            <motion.div
              key="config"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3.5 w-full"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <Settings className="w-4 h-4" />
              </div>

              {/* config content mock */}
              <div className="border border-white/5 bg-slate-950/80 rounded-xl p-3 w-52 font-mono text-[9px] text-left space-y-1.5 shadow-lg">
                <div className="text-[7.5px] text-slate-500 border-b border-white/5 pb-1 uppercase tracking-wider">genesis.json Config</div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> <span>NETWORK PARAMETERS</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> <span>INITIAL RULES</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> <span>INITIAL ALLOCATIONS</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: CREATE GENESIS BLOCK */}
          {step === "create_genesis" && (
            <motion.div
              key="create_genesis"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center w-full"
            >
              <div className="border border-cyan-500/30 bg-slate-950 px-4 py-3 rounded-2xl text-center font-mono w-56 relative shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                <span className="text-[7px] text-cyan-400 uppercase tracking-widest font-bold block">Genesis Block</span>
                <h4 className="text-white text-xs font-bold mt-1">BLOCK #0</h4>
                
                <div className="mt-2.5 pt-2 border-t border-white/5 text-left text-[8px] space-y-1 text-slate-400">
                  <div>
                    <span className="text-slate-500 block">PREV BLOCK ID:</span>
                    <span className="text-slate-300 font-bold block truncate">000000000000000000000000...</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">NETWORK ID:</span>
                    <span className="text-white block font-bold">MERCURY_TESTNET</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: SEARCH PARENT */}
          {step === "search_parent" && (
            <motion.div
              key="search"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-6 w-full select-none"
            >
              {/* Attempt Link Null */}
              <div className="flex flex-col items-center gap-1.5 shrink-0 text-slate-600">
                <div className="w-10 h-10 rounded-xl border border-dashed border-rose-500/30 bg-rose-500/5 flex items-center justify-center text-rose-400">
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                </div>
                <span className="text-[8px] font-mono">✕ NO PARENT</span>
              </div>

              {/* Pointing connector link */}
              <div className="flex items-center">
                <span className="font-mono text-rose-400 text-xs font-bold animate-pulse">← ?</span>
                <div className="w-6 h-[1.5px] bg-rose-500/30 relative" />
              </div>

              {/* Block #0 */}
              <div className="border border-rose-500/40 bg-slate-950 px-3.5 py-2.5 rounded-xl text-center font-mono w-44 shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                <span className="text-[7px] text-rose-400 uppercase font-bold block">Genesis Block</span>
                <h4 className="text-white text-xs font-bold mt-0.5">BLOCK #0</h4>
                <div className="mt-2 border-t border-white/5 pt-1.5 text-left text-[8px]">
                  <span className="text-slate-500 block">PREV REFERENCE:</span>
                  <span className="text-rose-400 font-bold block truncate">000000000000000000...</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 5: ESTABLISH STATE */}
          {step === "establish_state" && (
            <motion.div
              key="establish_state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 w-full"
            >
              <div className="border border-cyan-500/20 bg-slate-950 px-4 py-3 rounded-2xl text-center font-mono w-56">
                <span className="text-[7.5px] text-cyan-400 uppercase font-bold block">Genesis Block</span>
                <h4 className="text-white text-xs font-bold mt-0.5">BLOCK #0</h4>
                
                <div className="mt-2.5 pt-2 border-t border-white/5 text-left text-[8px] space-y-1 text-slate-400">
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>INITIAL BALANCES:</span> <span>✓ SET</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>RULES & PROTOCOLS:</span> <span>✓ DEPLOYED</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 6: BUILD CHAIN */}
          {step === "build_chain" && (
            <motion.div
              key="build"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto w-full py-2 select-none scrollbar-none max-w-lg"
            >
              {[
                { title: "GENESIS", num: "#0", ref: "000...000", color: "#22d3ee" },
                { title: "BLOCK", num: "#1", ref: "HASH(#0)", color: "#8b5cf6" },
                { title: "BLOCK", num: "#2", ref: "HASH(#1)", color: "#8b5cf6" },
              ].map((bl, i) => (
                <div key={i} className="flex items-center">
                  {/* Left pointing arrow link */}
                  {i > 0 && (
                    <div className="flex items-center">
                      <div className="w-3 sm:w-5 h-[1.5px] bg-slate-800 relative">
                        <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} className="absolute top-0 bottom-0 left-0 bg-cyan-400" />
                      </div>
                      <span className="text-cyan-400 font-bold text-[8px] -ml-1">←</span>
                    </div>
                  )}

                  {/* Block node card */}
                  <div
                    className="border bg-slate-950 px-2 py-1.5 rounded-lg text-center font-mono w-[84px] sm:w-[94px] shrink-0"
                    style={{ borderColor: i === 0 ? `${bl.color}40` : "rgba(255,255,255,0.08)" }}
                  >
                    <div className="text-[7px] text-slate-500 uppercase tracking-widest">{bl.title}</div>
                    <div className="text-[9px] font-bold text-white mt-0.5">{bl.num}</div>
                    <div className="mt-1 border-t border-white/5 pt-1 text-[7.5px] text-left">
                      <span className="text-[6.5px] text-slate-500 block">PREV:</span>
                      <span className="truncate block font-bold" style={{ color: bl.color }}>{bl.ref}</span>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* STEP 7: PROPERTIES COMPARISON */}
          {step === "comparison" && (
            <motion.div
              key="comparison"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center gap-3 sm:gap-4 w-full max-w-sm"
            >
              {/* Genesis Block block */}
              <div className="flex-1 border border-cyan-500/20 bg-cyan-950/5 rounded-xl p-3 text-left font-mono text-[8px] space-y-2">
                <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-bold tracking-wider">GENESIS BLOCK</span>
                <div className="space-y-1 mt-1 text-slate-400">
                  <div>BLOCK ID: <span className="text-white font-bold">#0</span></div>
                  <div>PARENT: <span className="text-rose-400 font-bold">NONE</span></div>
                  <div>PREV REF: <span className="text-slate-300">000...000</span></div>
                  <div className="text-[7.5px] text-cyan-400 mt-1 uppercase tracking-wide">➔ Chain origin</div>
                </div>
              </div>

              {/* Normal Block block */}
              <div className="flex-1 border border-white/8 bg-slate-900/30 rounded-xl p-3 text-left font-mono text-[8px] space-y-2">
                <span className="px-1.5 py-0.5 rounded bg-white/5 text-slate-400 font-bold tracking-wider">NORMAL BLOCK</span>
                <div className="space-y-1 mt-1 text-slate-400">
                  <div>BLOCK ID: <span className="text-white font-bold">#1</span></div>
                  <div>PARENT: <span className="text-emerald-400 font-bold">BLOCK #0</span></div>
                  <div>PREV REF: <span className="text-slate-300">HASH(#0)</span></div>
                  <div className="text-[7.5px] text-slate-500 mt-1 uppercase tracking-wide">➔ Extends chain</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 8: COMPLETE PIPELINE */}
          {step === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4 w-full"
            >
              {/* Timeline blocks */}
              <div className="flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto w-full select-none scrollbar-none max-w-lg">
                {[
                  { label: "GENESIS #0", color: "#22d3ee" },
                  { label: "BLOCK #1", color: "#8b5cf6" },
                  { label: "BLOCK #2", color: "#8b5cf6" },
                  { label: "BLOCK #3", color: "#8b5cf6" },
                ].map((b, idx) => (
                  <div key={idx} className="flex items-center">
                    {idx > 0 && (
                      <div className="flex items-center">
                        <div className="w-3 sm:w-4 h-[1.5px] bg-slate-800 relative" />
                        <span className="text-cyan-400 font-bold text-[7px] -ml-1">←</span>
                      </div>
                    )}
                    <div
                      className="px-2.5 py-1.5 rounded-lg border bg-slate-950 font-mono text-[8px] text-center shrink-0 shadow-md"
                      style={{
                        borderColor: idx === 0 ? `${b.color}50` : "rgba(255, 255, 255, 0.08)",
                        boxShadow: idx === 0 ? `0 0 10px ${b.color}15` : "none",
                      }}
                    >
                      <div className="text-[6.5px] text-slate-500 uppercase tracking-widest">{idx === 0 ? "Origin" : "Block"}</div>
                      <div className="text-white font-bold mt-0.5">{b.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Status table hud */}
              <div className="w-full max-w-xs border border-emerald-500/10 bg-emerald-950/5 p-3 rounded-xl flex items-center justify-between font-mono text-[9px] text-emerald-400 font-bold shadow-[0_0_12px_rgba(16,185,129,0.06)]">
                <span>STATUS: ACTIVE</span>
                <span>ORIGIN: BLOCK #0</span>
                <span>HEIGHT: 3</span>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Footer captions */}
      <div className="relative z-10 border-t border-white/5 pt-2 flex flex-col justify-center min-h-[56px] text-center">
        <AnimatePresence mode="wait">
          {step === "empty" && (
            <motion.p key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[9.5px] font-sans text-slate-400 leading-relaxed">
              Let's watch how the blockchain initiates from Genesis and how subsequent blocks link sequentially.
            </motion.p>
          )}
          {step === "initializing" && (
            <motion.p key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[9.5px] font-sans text-cyan-300 leading-relaxed">
              Contacting nodes. Bootstrapping decentralized network coordinates...
            </motion.p>
          )}
          {step === "loading_config" && (
            <motion.p key="lc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[9.5px] font-sans text-slate-300 leading-relaxed">
              "The network starts from a predefined genesis configuration," setting initial allocation rules and account balances.
            </motion.p>
          )}
          {step === "create_genesis" && (
            <motion.p key="cg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[9.5px] font-sans text-slate-300 leading-relaxed">
              Genesis Block #0 is created and written directly into the software, launching the ledger history.
            </motion.p>
          )}
          {step === "search_parent" && (
            <motion.p key="sp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[9.5px] font-sans text-rose-300 leading-relaxed">
              "No previous block exists, so the genesis block uses the network's predefined null/zero previous-block reference."
            </motion.p>
          )}
          {step === "establish_state" && (
            <motion.p key="es" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[9.5px] font-sans text-slate-300 leading-relaxed">
              "The genesis configuration defines the starting state from which the network begins," seeding core rules.
            </motion.p>
          )}
          {step === "build_chain" && (
            <motion.p key="bc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[9.5px] font-sans text-slate-300 leading-relaxed">
              Future blocks link sequentially. Block #1 points to Block #0, and Block #2 points to Block #1, establishing chronological history.
            </motion.p>
          )}
          {step === "comparison" && (
            <motion.p key="comp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[9.5px] font-sans text-cyan-300 leading-relaxed font-semibold">
              Genesis Block has NO parent and zero ref, while Normal Blocks back-reference their preceding hash.
            </motion.p>
          )}
          {step === "complete" && (
            <motion.div key="c" initial={{ opacity: 0, y: 2 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
              <p className="text-[9.5px] font-mono font-bold text-emerald-400 uppercase tracking-wide">
                Origin Sequence complete · Active chain established
              </p>
              <p className="text-[9px] font-sans text-slate-400 italic">
                "Every chain starts with an origin. Genesis establishes the starting point."
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}

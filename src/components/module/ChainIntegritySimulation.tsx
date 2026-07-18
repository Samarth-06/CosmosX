import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, ShieldCheck, Check, AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  color: string;
}

type StepType =
  | "init"             // 0: Timeline initializing...
  | "genesis"          // 1: Genesis block created
  | "block1"           // 2: Block 1 created and linked to #0
  | "block2_3"         // 3: Block 2 and 3 created, full chain linked
  | "scan"             // 4: Integrity check scanning checks all hashes
  | "tamper"           // 5: Modify data in Block #1, Hash changes to red F91C
  | "broken"           // 6: Match fail (F91C != B8D4), red mismatch link
  | "swap"             // 7: Attempt reordering blocks, references break
  | "insert"           // 8: Attempt inserting fake block, breaks
  | "restore"          // 9: Rebuild and restore original chain, status SECURE
  | "loop_wait";       // 10: Complete pipeline active wait state

export default function ChainIntegritySimulation({ color }: Props) {
  const [step, setStep] = useState<StepType>("init");

  useEffect(() => {
    const sequence: { target: StepType; delay: number }[] = [
      { target: "init", delay: 0 },
      { target: "genesis", delay: 2000 },
      { target: "block1", delay: 4000 },
      { target: "block2_3", delay: 6500 },
      { target: "scan", delay: 9500 },
      { target: "tamper", delay: 12000 },
      { target: "broken", delay: 15500 },
      { target: "swap", delay: 19000 },
      { target: "insert", delay: 22000 },
      { target: "restore", delay: 25000 },
      { target: "loop_wait", delay: 27000 },
    ];

    let timers: NodeJS.Timeout[] = [];

    const runTimeline = () => {
      sequence.forEach((item) => {
        const timer = setTimeout(() => {
          setStep(item.target);
        }, item.delay);
        timers.push(timer);
      });

      // Loop restart
      const loopTimer = setTimeout(() => {
        runTimeline();
      }, 29000);
      timers.push(loopTimer);
    };

    runTimeline();

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, []);

  // Helpers for telemetry panels
  const getStatusText = () => {
    switch (step) {
      case "init":
        return "INITIALIZING";
      case "scan":
        return "SCANNING";
      case "tamper":
        return "TAMPER DETECTED";
      case "broken":
      case "swap":
      case "insert":
        return "COMPROMISED";
      case "restore":
        return "RESTORING";
      default:
        return "SECURE";
    }
  };

  const getBrokenCount = () => {
    return ["broken", "swap", "insert"].includes(step) ? 1 : 0;
  };

  const getValidCount = () => {
    if (["init", "genesis"].includes(step)) return 0;
    if (step === "block1") return 1;
    if (step === "block2_3" || step === "scan" || step === "restore") return 3;
    return 2; // For broken states, 1 link is broken, so 2 remain valid
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 flex flex-col justify-between min-h-[420px] lg:h-full relative overflow-hidden shadow-2xl">
      {/* Background Visual Grid */}
      <div className="absolute inset-0 bg-size-[16px_16px] bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 border-b border-white/5 pb-3 flex justify-between items-center text-left">
        <div>
          <span className="font-mono text-[8px] tracking-widest text-cyan-400 uppercase block">Telemetry Monitor</span>
          <h3 className="font-rushblade text-sm text-white mt-1">Chain Integrity</h3>
          <p className="text-[9px] font-mono text-slate-400 mt-0.5">CRYPTOGRAPHIC BACK-POINTERS</p>
        </div>

        {/* Status Tag */}
        <div
          className="px-2.5 py-0.5 rounded-full border text-[8px] font-mono font-bold tracking-wider"
          style={{
            borderColor: getStatusText() === "SECURE" ? `${color}40` : getStatusText() === "COMPROMISED" || getStatusText() === "TAMPER DETECTED" ? "#ef444450" : "#eab30850",
            color: getStatusText() === "SECURE" ? color : getStatusText() === "COMPROMISED" || getStatusText() === "TAMPER DETECTED" ? "#ef4444" : "#eab308",
            background: getStatusText() === "SECURE" ? `${color}10` : getStatusText() === "COMPROMISED" || getStatusText() === "TAMPER DETECTED" ? "rgba(239,68,68,0.1)" : "rgba(234,179,8,0.1)",
          }}
        >
          {getStatusText()}
        </div>
      </div>

      {/* Viewport Frame Container */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center py-4 min-h-[220px]">
        <AnimatePresence mode="wait">

          {/* PHASE 1: TIMELINE LOADING */}
          {step === "init" && (
            <motion.div
              key="init"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <div className="text-[9px] font-mono text-cyan-300 uppercase tracking-widest animate-pulse">
                Chain Initializing...
              </div>
            </motion.div>
          )}

          {/* PHASE 2: GENESIS */}
          {step === "genesis" && (
            <motion.div
              key="genesis"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center w-full"
            >
              <div className="border border-cyan-500/20 bg-slate-950 px-4 py-3 rounded-2xl text-center font-mono w-48 shadow-lg">
                <span className="text-[7.5px] text-cyan-400 uppercase font-bold block">Origin Block</span>
                <h4 className="text-white text-xs font-bold mt-0.5">BLOCK #0</h4>
                <div className="mt-2.5 pt-2 border-t border-white/5 text-left text-[7.5px] space-y-1.5 text-slate-400">
                  <div>HASH: <span className="text-white font-bold">A7F2</span></div>
                  <div>PREV REF: <span className="text-slate-500">0000 (GENESIS)</span></div>
                </div>
              </div>
            </motion.div>
          )}

          {/* PHASE 3: BUILD / SCANNING / TAMPERING CHANNELS */}
          {["block1", "block2_3", "scan", "tamper", "broken", "restore"].includes(step) && (
            <motion.div
              key="block_timeline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center gap-4 select-none"
            >
              {/* Chronological Blocks timeline */}
              <div className="flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto w-full py-2 scrollbar-none max-w-lg">
                {[
                  { id: "0", name: "GENESIS", hash: "A7F2", prev: "0000", color: "#22d3ee" },
                  { id: "1", name: "BLOCK", hash: "B8D4", prev: "A7F2", color: "#8b5cf6" },
                  { id: "2", name: "BLOCK", hash: "C3A9", prev: "B8D4", color: "#8b5cf6" },
                  { id: "3", name: "BLOCK", hash: "E5F1", prev: "C3A9", color: "#8b5cf6" },
                ].map((b, i) => {
                  // Determine block visibility based on progress step
                  if (step === "block1" && i > 1) return null;

                  // Tampered modifications on Block #1
                  const isTamperedBlock = i === 1 && ["tamper", "broken"].includes(step);
                  const displayHash = isTamperedBlock ? "F91C" : b.hash;

                  // Highlighting scan indicator
                  const isScanning = step === "scan";

                  // Connections link line status
                  const isLinkBroken = i === 2 && step === "broken";

                  return (
                    <div key={i} className="flex items-center">
                      {/* Back-pointing link line */}
                      {i > 0 && (
                        <div className="flex items-center">
                          <div className="w-3 sm:w-4 h-[1.5px] bg-slate-800 relative">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: "100%" }}
                              className={`absolute top-0 bottom-0 left-0 ${isLinkBroken ? "bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"}`}
                            />
                          </div>
                          <span className={`font-bold text-[8px] -ml-1 ${isLinkBroken ? "text-rose-500 animate-ping" : "text-emerald-500"}`}>←</span>
                        </div>
                      )}

                      {/* Block node structure */}
                      <motion.div
                        animate={{
                          borderColor: isTamperedBlock ? "#ef4444" : i === 0 ? `${b.color}40` : "rgba(255,255,255,0.08)",
                          boxShadow: isTamperedBlock ? "0 0 15px rgba(239,68,68,0.2)" : "none",
                        }}
                        className={`border bg-slate-950 px-2 py-1.5 rounded-lg text-center font-mono w-[84px] sm:w-[94px] shrink-0 relative`}
                      >
                        <div className="text-[6.5px] text-slate-500 uppercase tracking-widest">{b.name}</div>
                        <div className="text-[9px] font-bold text-white mt-0.5">#{b.id}</div>
                        
                        <div className="mt-2.5 pt-1.5 border-t border-white/5 text-[7.5px] text-left space-y-0.5">
                          <div>
                            <span className="text-[6px] text-slate-500 block">HASH:</span>
                            <span className={`font-bold block ${isTamperedBlock ? "text-rose-400" : "text-slate-300"}`}>{displayHash}</span>
                          </div>
                          <div>
                            <span className="text-[6px] text-slate-500 block">PREV REF:</span>
                            <span className="text-cyan-400 font-bold block">{b.prev}</span>
                          </div>
                        </div>

                        {/* Scanner highlight overlay dot */}
                        {isScanning && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 border border-slate-950 animate-ping" />
                        )}
                      </motion.div>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic equations comparison box */}
              {["tamper", "broken"].includes(step) && (
                <div className="border border-rose-500/20 bg-rose-500/5 p-3 rounded-xl w-60 text-left font-mono text-[9px] space-y-1.5">
                  <div className="text-[8px] text-rose-400 uppercase tracking-widest font-bold">Integrity Comparison</div>
                  <div className="flex justify-between">
                    <span>Block #1 New Hash:</span> <span className="text-rose-400 font-bold">F91C</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Block #2 Stored Reference:</span> <span className="text-cyan-400 font-bold">B8D4</span>
                  </div>
                  <div className="border-t border-white/5 pt-1.5 flex justify-between font-bold text-rose-400 uppercase text-[8.5px]">
                    <span>STATUS:</span> <span>F91C ≠ B8D4 (MISMATCH)</span>
                  </div>
                </div>
              )}

              {step === "scan" && (
                <div className="border border-emerald-500/20 bg-emerald-500/5 p-3 rounded-xl w-60 text-center font-mono text-[8.5px] text-emerald-400 font-bold animate-pulse">
                  ✓ VERIFYING HASH PATHWAYS... MATCH OK
                </div>
              )}
            </motion.div>
          )}

          {/* PHASE 4: BLOCKS SWAP ATTEMPT */}
          {step === "swap" && (
            <motion.div
              key="swap"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 w-full select-none"
            >
              {/* Swap visual blocks */}
              <div className="flex items-center gap-1.5 justify-center">
                <div className="border border-white/10 bg-slate-950 px-2 py-1 rounded text-center font-mono text-[8px] text-slate-500 w-16">
                  BLOCK #0
                </div>
                <span className="text-rose-500 text-xs">✕</span>
                <div className="border border-rose-500/40 bg-rose-500/5 px-2 py-1 rounded text-center font-mono text-[8px] text-rose-300 w-16 shadow-md">
                  BLOCK #2
                </div>
                <span className="text-rose-500 text-xs">✕</span>
                <div className="border border-rose-500/40 bg-rose-500/5 px-2 py-1 rounded text-center font-mono text-[8px] text-rose-300 w-16 shadow-md">
                  BLOCK #1
                </div>
              </div>
              <span className="text-[9.5px] font-mono text-rose-400 uppercase tracking-wider font-bold">
                Invalid Chronological Linkage
              </span>
            </motion.div>
          )}

          {/* PHASE 5: BLOCK INSERTION ATTEMPT */}
          {step === "insert" && (
            <motion.div
              key="insert"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 w-full select-none"
            >
              {/* Insert fake visual blocks */}
              <div className="flex items-center gap-1.5 justify-center">
                <div className="border border-white/10 bg-slate-950 px-2 py-1 rounded text-center font-mono text-[8px] text-slate-500 w-12">
                  #1
                </div>
                <span className="text-emerald-500 text-[10px]">←</span>
                {/* Fake node */}
                <div className="border border-rose-500 bg-rose-950/20 px-2 py-1.5 rounded text-center font-mono text-[8px] text-rose-400 w-16 shadow-md animate-pulse">
                  <div>FAKE</div>
                  <div className="text-[6.5px] text-rose-500 font-bold">XXXX</div>
                </div>
                <span className="text-rose-500 text-[10px]">✕</span>
                <div className="border border-white/10 bg-slate-950 px-2 py-1 rounded text-center font-mono text-[8px] text-slate-500 w-12">
                  #2
                </div>
              </div>
              <span className="text-[9.5px] font-mono text-rose-400 uppercase tracking-wider font-bold">
                ⚠ Invalid Insertion Attempt
              </span>
            </motion.div>
          )}

          {/* PHASE 6: RESTORE WAIT SCREEN */}
          {step === "restore" && (
            <motion.div
              key="restore"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              <div className="text-[9px] font-mono text-emerald-300 uppercase tracking-widest animate-pulse">
                Restoring Chain Coordinates...
              </div>
            </motion.div>
          )}

          {/* STEP 10: LOOP WAIT SCREEN */}
          {step === "loop_wait" && (
            <motion.div
              key="loop_wait"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Check className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Verification Complete</span>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Telemetry panel */}
      <div className="relative z-10 border-t border-white/5 pt-2 text-left">
        <div className="grid grid-cols-3 gap-2 text-[8px] font-mono text-slate-500">
          <div>REFERENCES CHECKED: <span className="text-white font-bold">{getValidCount() + getBrokenCount()}</span></div>
          <div>VALID LINKS: <span className="text-emerald-400 font-bold">{getValidCount()}</span></div>
          <div>BROKEN LINKS: <span className="text-rose-400 font-bold">{getBrokenCount()}</span></div>
        </div>
      </div>

      {/* Caption explanations */}
      <div className="relative z-10 border-t border-white/5 pt-2 flex flex-col justify-center min-h-[56px] text-center">
        <AnimatePresence mode="wait">
          {step === "init" && (
            <motion.p key="init" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[9.5px] font-sans text-slate-400 leading-relaxed">
              Establishing local blockchain node connection telemetry...
            </motion.p>
          )}
          {step === "genesis" && (
            <motion.p key="genesis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[9.5px] font-sans text-slate-300 leading-relaxed">
              "Genesis has no parent block," so it initializes its Previous Reference header value to all zeros.
            </motion.p>
          )}
          {step === "block1" && (
            <motion.p key="b1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[9.5px] font-sans text-slate-300 leading-relaxed">
              Block #0's hash (`A7F2`) is copied into Block #1's header as its Previous Reference, creating a valid linkage.
            </motion.p>
          )}
          {step === "block2_3" && (
            <motion.p key="b23" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[9.5px] font-sans text-slate-300 leading-relaxed">
              Subsequent blocks continue this reference sequence, linking Block #2 to #1 and Block #3 to #2.
            </motion.p>
          )}
          {step === "scan" && (
            <motion.p key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[9.5px] font-sans text-emerald-300 leading-relaxed">
              Local node runs chronological scans checking each header reference. Validation outcomes: SECURE.
            </motion.p>
          )}
          {step === "tamper" && (
            <motion.p key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[9.5px] font-sans text-rose-300 leading-relaxed">
              ⚠ Historical Block #1 is modified. Modifying block data causes its hash to change from `B8D4` to `F91C`.
            </motion.p>
          )}
          {step === "broken" && (
            <motion.p key="br" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[9.5px] font-sans text-rose-300 leading-relaxed">
              Since Block #2 still stores `B8D4`, Block #1's new hash (`F91C`) no longer matches. Pointers break, and tampering is detected.
            </motion.p>
          )}
          {step === "swap" && (
            <motion.p key="sw" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[9.5px] font-sans text-rose-300 leading-relaxed">
              Attempting to swap or reorder historical blocks violates the reference linkage relationships, invalidating the chain.
            </motion.p>
          )}
          {step === "insert" && (
            <motion.p key="ins" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[9.5px] font-sans text-rose-300 leading-relaxed">
              Inserting a fake block fails. Block #2's header points to `B8D4`, which does not match the fake block's hash.
            </motion.p>
          )}
          {step === "restore" && (
            <motion.p key="res" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[9.5px] font-sans text-slate-400 leading-relaxed">
              Restoring original block sequence values. Re-syncing cryptographic hashes...
            </motion.p>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}

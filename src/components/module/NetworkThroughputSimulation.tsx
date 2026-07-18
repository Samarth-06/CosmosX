import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Cpu, Layers, HardDrive, AlertCircle, CheckCircle2 } from "lucide-react";

interface Props {
  color: string;
}

type StepType =
  | "init"             // 0: Initial receiving, block empty
  | "filling_200"      // 1: Capacity 200/1000
  | "filling_600"      // 2: Capacity 600/1000
  | "filling_1000"     // 3: Capacity 1000/1000, capacity reached
  | "calculation"      // 4: Show TPS formula & substitute values
  | "tps_result"       // 5: Display 100 TPS result with glowing telemetry window
  | "append_chain"     // 6: Push current block to chain
  | "tradeoff_a"       // 7: Tradeoff Config A (500 capacity, low load)
  | "tradeoff_b"       // 8: Tradeoff Config B (1000 capacity, mod load)
  | "tradeoff_c"       // 9: Tradeoff Config C (2000 capacity, high load)
  | "loop_wait";       // 10: Pause before restart

export default function NetworkThroughputSimulation({ color }: Props) {
  const [step, setStep] = useState<StepType>("init");
  const [txCounter, setTxCounter] = useState(0);
  const [timerCount, setTimerCount] = useState(10);

  useEffect(() => {
    const sequence: { target: StepType; delay: number }[] = [
      { target: "init", delay: 0 },
      { target: "filling_200", delay: 2000 },
      { target: "filling_600", delay: 3500 },
      { target: "filling_1000", delay: 5000 },
      { target: "calculation", delay: 7500 },
      { target: "tps_result", delay: 10500 },
      { target: "append_chain", delay: 13500 },
      { target: "tradeoff_a", delay: 16000 },
      { target: "tradeoff_b", delay: 18500 },
      { target: "tradeoff_c", delay: 21000 },
      { target: "loop_wait", delay: 24500 },
    ];

    let timers: NodeJS.Timeout[] = [];

    const runTimeline = () => {
      sequence.forEach((item) => {
        const timer = setTimeout(() => {
          setStep(item.target);

          // Update helper variables based on step
          if (item.target === "init") {
            setTxCounter(0);
            setTimerCount(10);
          } else if (item.target === "filling_200") {
            setTxCounter(200);
            setTimerCount(8);
          } else if (item.target === "filling_600") {
            setTxCounter(600);
            setTimerCount(4);
          } else if (item.target === "filling_1000") {
            setTxCounter(1000);
            setTimerCount(0);
          }
        }, item.delay);
        timers.push(timer);
      });

      // Loop restart
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

  // Determine block fill percentage
  const getBlockFillPercent = () => {
    if (step === "init") return 0;
    if (step === "filling_200") return 20;
    if (step === "filling_600") return 60;
    return 100;
  };

  const fillPercent = getBlockFillPercent();

  // Helper getters for status tags
  const getStatusText = () => {
    switch (step) {
      case "init":
        return "RECEIVING TX";
      case "filling_200":
      case "filling_600":
        return "BLOCK FILLING";
      case "filling_1000":
        return "BLOCK READY";
      case "calculation":
        return "CALCULATING";
      case "tps_result":
        return "PROCESSING";
      case "append_chain":
        return "BLOCK APPENDED";
      case "tradeoff_a":
      case "tradeoff_b":
      case "tradeoff_c":
        return "TRADEOFF ANALYSIS";
      default:
        return "PROCESSING";
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 flex flex-col justify-between min-h-[400px] lg:h-full relative overflow-hidden shadow-2xl">
      {/* Background Visual Grid */}
      <div className="absolute inset-0 bg-size-[16px_16px] bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 border-b border-white/5 pb-3 flex justify-between items-center text-left">
        <div>
          <span className="font-mono text-[8px] tracking-widest text-cyan-400 uppercase block">Telemetry Monitor</span>
          <h3 className="font-rushblade text-sm text-white mt-1">Throughput Telemetry</h3>
          <p className="text-[9px] font-mono text-slate-400 mt-0.5">BLOCK CAPACITY ➔ BLOCK TIME ➔ TPS</p>
        </div>

        {/* Status Indicator */}
        <div className="px-2.5 py-0.5 rounded-full border border-cyan-500/25 bg-cyan-950/20 text-cyan-300 font-mono text-[8px] font-bold tracking-wider">
          {getStatusText()}
        </div>
      </div>

      {/* Viewport Frame */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center py-4 min-h-[240px]">
        <AnimatePresence mode="wait">

          {/* PHASE 1: CAPACITY & TIME BLOCK MONITOR */}
          {["init", "filling_200", "filling_600", "filling_1000"].includes(step) && (
            <motion.div
              key="block_monitor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center gap-4"
            >
              {/* Transactions stream visualization */}
              <div className="flex items-center gap-1 min-h-[14px]">
                <span className="text-[7.5px] font-mono text-slate-500 uppercase tracking-widest mr-2">Stream:</span>
                {[0, 1, 2, 3].map((i) => (
                  <motion.span
                    key={i}
                    animate={{
                      opacity: [0.3, 1, 0.3],
                      x: [-4, 4, -4],
                    }}
                    transition={{
                      duration: 1.2,
                      delay: i * 0.25,
                      repeat: Infinity,
                    }}
                    className="px-1 py-0.5 rounded bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 font-mono text-[7px]"
                  >
                    TX
                  </motion.span>
                ))}
              </div>

              {/* Central Block card */}
              <div className="border border-white/8 bg-slate-900/40 rounded-xl p-3.5 w-60 space-y-3 relative shadow-md">
                <div className="flex justify-between items-center text-left">
                  <div>
                    <span className="text-[7px] text-slate-500 uppercase font-bold block">Current Block</span>
                    <span className="font-mono text-[10px] text-white font-bold block mt-0.5">{txCounter} / 1,000 TX</span>
                  </div>
                  
                  {/* Countdown Timer */}
                  <div className="text-right">
                    <span className="text-[7px] text-slate-500 uppercase font-bold block">Block Time</span>
                    <span className="font-mono text-[10px] text-cyan-400 font-bold block mt-0.5">{timerCount}.0s</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-slate-950 rounded-full border border-white/5 overflow-hidden p-px">
                  <motion.div
                    animate={{ width: `${fillPercent}%` }}
                    transition={{ duration: 0.3 }}
                    className="h-full rounded-full bg-linear-to-r from-cyan-400 to-indigo-600 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                  />
                </div>

                {step === "filling_1000" && (
                  <span className="absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-mono text-[7px] font-bold shadow-md animate-bounce">
                    CAPACITY REACHED
                  </span>
                )}
              </div>
            </motion.div>
          )}

          {/* PHASE 2: TPS CALCULATION FORMULA */}
          {step === "calculation" && (
            <motion.div
              key="calculation"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 w-full"
            >
              <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Throughput Formula</div>
              
              {/* Math container */}
              <div className="border border-white/5 bg-slate-950/90 rounded-2xl p-4 w-64 text-center font-mono space-y-4 shadow-xl">
                <div className="text-[10px] text-slate-400 flex flex-col items-center">
                  <span>TPS = MAX TX / BLOCK</span>
                  <span className="w-24 border-t border-slate-700 my-1.5" />
                  <span>BLOCK TIME (SEC)</span>
                </div>

                <div className="text-xs text-white flex items-center justify-center gap-2">
                  <span>TPS = 1,000</span>
                  <span className="text-slate-600">/</span>
                  <span>10s</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* PHASE 3: TPS FINAL RESULT */}
          {step === "tps_result" && (
            <motion.div
              key="tps_result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 w-full"
            >
              {/* Glowing throughput dashboard */}
              <div className="border border-cyan-500/35 bg-slate-950/90 rounded-2xl p-5 w-60 text-center font-mono space-y-3 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
                <span className="text-[8px] text-cyan-400 uppercase tracking-widest font-bold">Network Throughput</span>
                <div className="text-2xl font-black text-white tracking-wider animate-pulse">
                  100 <span className="text-xs text-cyan-400">TPS</span>
                </div>
                <div className="text-[8.5px] text-slate-500 uppercase border-t border-white/5 pt-2">
                  100 TRANSACTIONS / SECOND
                </div>
              </div>

              {/* 1-second telemetry window simulation */}
              <div className="border border-white/5 bg-slate-900/20 px-3.5 py-1.5 rounded-lg font-mono text-[8px] text-slate-500 flex items-center gap-3">
                <span>|── 1s WINDOW ──|</span>
                <span className="text-emerald-400 font-bold animate-pulse">✓ 100 TX PROCESSED</span>
              </div>
            </motion.div>
          )}

          {/* PHASE 4: APPEND CHAIN */}
          {step === "append_chain" && (
            <motion.div
              key="append_chain"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 w-full select-none"
            >
              {/* Chain linkage animation */}
              <div className="flex items-center gap-2 overflow-x-auto w-full max-w-sm justify-center py-2 scrollbar-none">
                {[
                  { id: "N-2", cap: "1000 TX" },
                  { id: "N-1", cap: "1000 TX" },
                  { id: "N (NEW)", cap: "1000 TX", glow: true },
                ].map((b, i) => (
                  <div key={i} className="flex items-center">
                    {i > 0 && <span className="text-slate-700 text-xs font-bold font-mono">←</span>}
                    <div
                      className="border bg-slate-950 px-2.5 py-1.5 rounded-lg text-center font-mono w-20 shrink-0"
                      style={{
                        borderColor: b.glow ? `${color}50` : "rgba(255, 255, 255, 0.08)",
                        boxShadow: b.glow ? `0 0 12px ${color}20` : "none",
                      }}
                    >
                      <div className="text-[6.5px] text-slate-500">BLOCK</div>
                      <div className="text-white font-bold text-[8.5px] mt-0.5">#{b.id}</div>
                      <div className="text-[7px] text-slate-400 mt-1 font-bold">{b.cap}</div>
                    </div>
                  </div>
                ))}
              </div>
              <span className="text-[9px] font-mono text-emerald-300">
                ✓ BLOCK SECURELY COMMITTED
              </span>
            </motion.div>
          )}

          {/* PHASE 5: TRADEOFF ANALYSIS */}
          {["tradeoff_a", "tradeoff_b", "tradeoff_c"].includes(step) && (
            <motion.div
              key="tradeoffs"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center gap-3 text-left"
            >
              <div className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">Simplified Theoretical Load</div>
              
              {/* Tradeoff comparison dashboard grid */}
              <div className="border border-white/5 bg-slate-950 rounded-xl p-3 w-64 space-y-3 shadow-lg">
                
                {/* Configuration header */}
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="font-mono font-bold text-[9px]" style={{ color }}>
                    {step === "tradeoff_a" && "CONFIG A (LOW LOAD)"}
                    {step === "tradeoff_b" && "CONFIG B (MODERATE LOAD)"}
                    {step === "tradeoff_c" && "CONFIG C (HIGH LOAD)"}
                  </span>
                  <span className="text-[9px] font-mono text-white font-bold">
                    {step === "tradeoff_a" && "50 TPS"}
                    {step === "tradeoff_b" && "100 TPS"}
                    {step === "tradeoff_c" && "200 TPS"}
                  </span>
                </div>

                {/* Values row */}
                <div className="grid grid-cols-2 text-[8px] font-mono text-slate-500 gap-x-2">
                  <div>CAPACITY: <span className="text-slate-300">
                    {step === "tradeoff_a" && "500 TX"}
                    {step === "tradeoff_b" && "1,000 TX"}
                    {step === "tradeoff_c" && "2,000 TX"}
                  </span></div>
                  <div>BLOCK TIME: <span className="text-slate-300">10s</span></div>
                </div>

                {/* Hardware constraints load telemetry */}
                <div className="space-y-1.5 border-t border-white/5 pt-2">
                  {/* Load metric A: propagation */}
                  <div className="flex justify-between items-center text-[7.5px] font-mono">
                    <span className="flex items-center gap-1"><Layers className="w-2.5 h-2.5 text-slate-500" /> PROPAGATION</span>
                    <span className={`font-bold ${step === "tradeoff_a" ? "text-emerald-400" : step === "tradeoff_b" ? "text-amber-500" : "text-rose-500"}`}>
                      {step === "tradeoff_a" && "LOW"}
                      {step === "tradeoff_b" && "MODERATE"}
                      {step === "tradeoff_c" && "CRITICAL"}
                    </span>
                  </div>

                  {/* Load metric B: storage */}
                  <div className="flex justify-between items-center text-[7.5px] font-mono">
                    <span className="flex items-center gap-1"><HardDrive className="w-2.5 h-2.5 text-slate-500" /> STORAGE COST</span>
                    <span className={`font-bold ${step === "tradeoff_a" ? "text-emerald-400" : step === "tradeoff_b" ? "text-amber-500" : "text-rose-500"}`}>
                      {step === "tradeoff_a" && "LOW"}
                      {step === "tradeoff_b" && "NOMINAL"}
                      {step === "tradeoff_c" && "HIGH"}
                    </span>
                  </div>

                  {/* Load metric C: CPU */}
                  <div className="flex justify-between items-center text-[7.5px] font-mono">
                    <span className="flex items-center gap-1"><Cpu className="w-2.5 h-2.5 text-slate-500" /> PROCESSING</span>
                    <span className={`font-bold ${step === "tradeoff_a" ? "text-emerald-400" : step === "tradeoff_b" ? "text-amber-500" : "text-rose-500"}`}>
                      {step === "tradeoff_a" && "LOW"}
                      {step === "tradeoff_b" && "NOMINAL"}
                      {step === "tradeoff_c" && "HIGH"}
                    </span>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* STEP 10: LOOP WAIT */}
          {step === "loop_wait" && (
            <motion.div
              key="wait"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-pulse">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Cycle Calibrated</span>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Footer explanations */}
      <div className="relative z-10 border-t border-white/5 pt-2 flex flex-col justify-center min-h-[64px] text-center">
        <AnimatePresence mode="wait">
          {step === "init" && (
            <motion.p key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[9.5px] font-sans text-slate-400 leading-relaxed">
              Incoming transactions accumulate on the network, waiting for the block interval duration to trigger.
            </motion.p>
          )}
          {["filling_200", "filling_600"].includes(step) && (
            <motion.p key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[9.5px] font-sans text-slate-300 leading-relaxed">
              As transactions arrive, they fill the block capacity meter until the maximum block capacity limit is met.
            </motion.p>
          )}
          {step === "filling_1000" && (
            <motion.p key="fr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[9.5px] font-sans text-emerald-300 leading-relaxed">
              Block capacity reached! In this model, one block contains a maximum of 1,000 transactions.
            </motion.p>
          )}
          {step === "calculation" && (
            <motion.p key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[9.5px] font-sans text-slate-300 leading-relaxed">
              Throughput is calculated by dividing maximum block capacity by block production interval: <span className="font-mono text-[10px] text-cyan-300">1,000 TX / 10 SEC</span>
            </motion.p>
          )}
          {step === "tps_result" && (
            <motion.p key="tr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[9.5px] font-sans text-cyan-300 leading-relaxed">
              This delivers a network capacity of 100 Transactions Per Second (TPS).
            </motion.p>
          )}
          {step === "append_chain" && (
            <motion.p key="ac" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[9.5px] font-sans text-slate-400 leading-relaxed">
              The finalized block containing transactions is sealed and securely added to the blockchain timeline.
            </motion.p>
          )}
          {["tradeoff_a", "tradeoff_b", "tradeoff_c"].includes(step) && (
            <motion.div key="to" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1">
              <p className="text-[9.5px] font-sans text-slate-300 leading-relaxed">
                Capacity Trade-off: Increasing block size increases theoretical TPS, but raises propagation and CPU load on validator hardware nodes.
              </p>
              <p className="text-[8px] font-sans text-slate-500 italic flex items-center justify-center gap-1">
                <AlertCircle className="w-3 h-3 text-slate-600 shrink-0" />
                "Real-world throughput depends on additional protocol and network constraints."
              </p>
            </motion.div>
          )}
          {step === "loop_wait" && (
            <motion.p key="lw" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[9.5px] font-sans text-slate-400 leading-relaxed">
              Calibrating next blockchain telemetry interval. Restarting sequence simulation...
            </motion.p>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}

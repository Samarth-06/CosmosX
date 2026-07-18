import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, ShieldAlert, ShieldCheck, CheckCircle } from "lucide-react";

interface Props {
  color: string;
}

type StepType =
  | "db_start"        // 0: DB balance 500
  | "db_update"       // 1: DB update arrow appears
  | "db_overwritten"  // 2: DB balance changed to 9000, 500 crossed out, alert shown
  | "ledger_genesis"  // 3: Ledger Genesis START +500 appears
  | "ledger_tx1"      // 4: Ledger TX01 RECEIVE +200 appears
  | "ledger_tx2"      // 5: Ledger TX02 SEND -100 appears
  | "ledger_tx3"      // 6: Ledger TX03 RECEIVE +400 appears
  | "scan_genesis"    // 7: Scanning genesis: balance = 500
  | "scan_tx1"        // 8: Scanning TX01: balance = 500 + 200 = 700
  | "scan_tx2"        // 9: Scanning TX02: balance = 700 - 100 = 600
  | "scan_tx3"        // 10: Scanning TX03: balance = 600 + 400 = 1000
  | "complete";       // 11: Final balance display + success banners

export default function AppendOnlyLedgerSimulation({ color }: Props) {
  const [step, setStep] = useState<StepType>("db_start");

  useEffect(() => {
    const sequence: { target: StepType; delay: number }[] = [
      { target: "db_start", delay: 0 },
      { target: "db_update", delay: 2000 },
      { target: "db_overwritten", delay: 3500 },
      { target: "ledger_genesis", delay: 6500 },
      { target: "ledger_tx1", delay: 8000 },
      { target: "ledger_tx2", delay: 9200 },
      { target: "ledger_tx3", delay: 10400 },
      { target: "scan_genesis", delay: 12400 },
      { target: "scan_tx1", delay: 14400 },
      { target: "scan_tx2", delay: 16400 },
      { target: "scan_tx3", delay: 18400 },
      { target: "complete", delay: 20400 },
    ];

    let timers: NodeJS.Timeout[] = [];

    const startSequence = () => {
      sequence.forEach((item) => {
        const timer = setTimeout(() => {
          setStep(item.target);
        }, item.delay);
        timers.push(timer);
      });

      // Reset loop timer at 26 seconds
      const loopTimer = setTimeout(() => {
        startSequence();
      }, 26000);
      timers.push(loopTimer);
    };

    startSequence();

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, []);

  // Determine current active ledger block for highlight scanning
  const getScannedIndex = () => {
    if (step === "scan_genesis") return 0;
    if (step === "scan_tx1") return 1;
    if (step === "scan_tx2") return 2;
    if (step === "scan_tx3") return 3;
    if (step === "complete") return 3;
    return -1;
  };

  const scannedIdx = getScannedIndex();
  const showLedger = [
    "ledger_genesis",
    "ledger_tx1",
    "ledger_tx2",
    "ledger_tx3",
    "scan_genesis",
    "scan_tx1",
    "scan_tx2",
    "scan_tx3",
    "complete",
  ].includes(step);

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 flex flex-col justify-between min-h-[380px] lg:h-full relative overflow-hidden shadow-2xl">
      {/* Subtle background tech lines */}
      <div className="absolute inset-0 bg-size-[16px_16px] bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 border-b border-white/5 pb-3 text-left">
        <span className="font-mono text-[8px] tracking-widest text-cyan-400 uppercase block">Simulation Lab</span>
        <h3 className="font-rushblade text-sm text-white mt-1">Append-Only Ledger</h3>
        <p className="text-[9px] font-mono text-slate-400 mt-0.5">HISTORY IS RECORDED, NOT OVERWRITTEN</p>
      </div>

      {/* Main interactive viewport container */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center py-4 min-h-[220px]">
        
        {/* PHASE 1: TRADITIONAL DATABASE */}
        {!showLedger && (
          <motion.div
            key="db_phase"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-sm flex flex-col items-center space-y-4"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-rose-400 uppercase tracking-wider font-bold">
              <Database className="w-3.5 h-3.5" />
              Traditional Database
            </div>

            {/* Overwrite box structure */}
            <div className="relative border border-white/10 bg-slate-900/60 rounded-xl p-4 w-44 text-center">
              <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">Account Balance</div>
              
              <div className="relative h-8 flex items-center justify-center font-mono text-lg font-bold">
                <AnimatePresence>
                  {step === "db_start" && (
                    <motion.span
                      key="start_val"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-white absolute"
                    >
                      500
                    </motion.span>
                  )}

                  {step === "db_update" && (
                    <motion.span
                      key="update_val"
                      animate={{ scale: [1, 1.05, 1], opacity: [1, 0.8, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="text-cyan-400 absolute"
                    >
                      500
                    </motion.span>
                  )}

                  {step === "db_overwritten" && (
                    <motion.div
                      key="overwritten_val"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center"
                    >
                      <span className="text-slate-600 line-through text-xs absolute -top-1 opacity-70">500</span>
                      <span className="text-rose-400 text-xl font-black mt-2">9000</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* UPDATE action pointer */}
            <div className="h-10 flex flex-col items-center justify-center">
              <AnimatePresence>
                {step === "db_update" && (
                  <motion.div
                    key="up_arrow"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center text-[9px] font-mono text-rose-400"
                  >
                    <span>UPDATE</span>
                    <span className="animate-bounce">↓</span>
                  </motion.div>
                )}
                {step === "db_overwritten" && (
                  <motion.div
                    key="overwritten_alert"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/25 px-2.5 py-1 rounded-lg text-[9px] font-mono text-rose-300 shadow-md"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                    <span>PREVIOUS VALUE OVERWRITTEN</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* PHASE 2: APPEND-ONLY LEDGER */}
        {showLedger && (
          <motion.div
            key="ledger_phase"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full flex flex-col items-center space-y-5"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Append-Only Ledger
            </div>

            {/* Blocks timeline */}
            <div className="flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto w-full py-2 select-none scrollbar-none max-w-lg">
              {[
                { title: "GENESIS", value: "START +500", key: "ledger_genesis", label: "GENESIS" },
                { title: "TX 01", value: "RCV +200", key: "ledger_tx1", label: "TX 01" },
                { title: "TX 02", value: "SEND -100", key: "ledger_tx2", label: "TX 02" },
                { title: "TX 03", value: "RCV +400", key: "ledger_tx3", label: "TX 03" },
              ].map((tx, idx) => {
                // Determine visibility based on sequence step
                const stepsList = [
                  "ledger_genesis",
                  "ledger_tx1",
                  "ledger_tx2",
                  "ledger_tx3",
                  "scan_genesis",
                  "scan_tx1",
                  "scan_tx2",
                  "scan_tx3",
                  "complete",
                ];
                const activeIndex = stepsList.indexOf(step);
                const blockIndex = stepsList.indexOf(tx.key);
                const isVisible = activeIndex >= blockIndex;

                // Highlight status if node is scanning this specific block
                const isScanned = scannedIdx === idx;

                return (
                  <div key={idx} className="flex items-center">
                    {/* Glowing link line */}
                    {idx > 0 && (
                      <div className="w-3 sm:w-5 h-[1.5px] bg-slate-800 relative">
                        {isVisible && (
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            className="absolute top-0 bottom-0 left-0 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                          />
                        )}
                      </div>
                    )}

                    {/* Block Card */}
                    <AnimatePresence>
                      {isVisible && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8, y: 5 }}
                          animate={{
                            opacity: 1,
                            scale: isScanned ? 1.06 : 1,
                            y: 0,
                            borderColor: isScanned ? "#10b981" : "rgba(255, 255, 255, 0.08)",
                            boxShadow: isScanned ? "0 0 15px rgba(16, 185, 129, 0.25)" : "none",
                          }}
                          transition={{ duration: 0.2 }}
                          className="border bg-slate-950 px-2 py-1.5 rounded-lg text-center font-mono w-[68px] sm:w-[76px] shrink-0 relative"
                        >
                          {/* Top label */}
                          <div className={`text-[7px] font-bold ${isScanned ? "text-emerald-400" : "text-slate-500"}`}>
                            {tx.label}
                          </div>

                          {/* Value */}
                          <div className={`text-[8.5px] font-bold mt-1 ${isScanned ? "text-white" : "text-slate-300"}`}>
                            {tx.value}
                          </div>

                          {/* Running Balance Node scan indicator dot */}
                          {isScanned && (
                            <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                            </span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Calculations Console block */}
            <div className="w-full max-w-xs border border-white/5 bg-slate-950/95 p-3 rounded-xl min-h-[96px] flex flex-col justify-between text-left">
              
              {/* Progressive equations list */}
              <div className="font-mono text-[9px] text-slate-400 space-y-1">
                {scannedIdx >= 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-between">
                    <span>START:</span>
                    <span className="text-white font-bold">500</span>
                  </motion.div>
                )}
                {scannedIdx >= 1 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-between text-emerald-400">
                    <span>RECEIVE:</span>
                    <span>+200 (Accumulated: 700)</span>
                  </motion.div>
                )}
                {scannedIdx >= 2 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-between text-amber-500">
                    <span>SEND:</span>
                    <span>-100 (Accumulated: 600)</span>
                  </motion.div>
                )}
                {scannedIdx >= 3 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-between text-emerald-400">
                    <span>RECEIVE:</span>
                    <span>+400 (Accumulated: 1000)</span>
                  </motion.div>
                )}
              </div>

              {/* Final balance highlight */}
              {step === "complete" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between font-mono text-[10px] text-emerald-400 font-bold"
                >
                  <span>CURRENT BALANCE:</span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded-md shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                    1000
                  </span>
                </motion.div>
              ) : (
                scannedIdx >= 0 && (
                  <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between font-mono text-[9px] text-slate-500">
                    <span>TELEMETRY SCANNING...</span>
                    <span>RUNNING SUM</span>
                  </div>
                )
              )}
            </div>
          </motion.div>
        )}

      </div>

      {/* Footer educational captions and status tags */}
      <div className="relative z-10 border-t border-white/5 pt-2 flex flex-col gap-1.5 min-h-[50px] justify-center text-center">
        <AnimatePresence mode="wait">
          {/* Overwritten database alert caption */}
          {step === "db_overwritten" && (
            <motion.p
              key="db_cap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[9.5px] font-sans text-rose-300 leading-relaxed"
            >
              Central systems modify database fields in-place. History is lost, and modifications remain un-auditable by clients.
            </motion.p>
          )}

          {/* Ledger append alerts */}
          {["ledger_genesis", "ledger_tx1", "ledger_tx2", "ledger_tx3"].includes(step) && (
            <motion.p
              key="ledger_cap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[9.5px] font-mono text-cyan-300 leading-relaxed uppercase tracking-wide"
            >
              New transactions are appended to history
            </motion.p>
          )}

          {/* Scanning nodes alert */}
          {["scan_genesis", "scan_tx1", "scan_tx2", "scan_tx3"].includes(step) && (
            <motion.p
              key="scan_cap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[9.5px] font-sans text-emerald-300 leading-relaxed"
            >
              Validator scans sequence history to reconstruct balance state.
            </motion.p>
          )}

          {/* Complete preserved history alert */}
          {step === "complete" && (
            <motion.div
              key="complete_caps"
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-1.5"
            >
              <div className="flex items-center justify-center gap-3">
                <span className="flex items-center gap-1 text-[8.5px] font-mono font-bold text-emerald-400">
                  <CheckCircle className="w-3 h-3 shrink-0" /> HISTORY PRESERVED
                </span>
                <span className="flex items-center gap-1 text-[8.5px] font-mono font-bold text-emerald-400">
                  <CheckCircle className="w-3 h-3 shrink-0" /> FULLY AUDITABLE
                </span>
              </div>
              <p className="text-[9px] font-sans text-slate-400 italic">
                "Current state is derived from recorded transaction history."
              </p>
            </motion.div>
          )}

          {/* Initial state default */}
          {step === "db_start" && (
            <motion.p
              key="start_cap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[9.5px] font-sans text-slate-400 leading-relaxed"
            >
              Let's compare mutable databases vs immutable append-only ledger logs.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}

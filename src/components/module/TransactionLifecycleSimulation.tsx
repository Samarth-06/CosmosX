import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Key, Send, Database, Check, Server, ShieldCheck } from "lucide-react";

interface Props {
  color: string;
}

type Stage = "created" | "signed" | "broadcast" | "mempool" | "validated" | "blockchain";

export default function TransactionLifecycleSimulation({ color }: Props) {
  const [stage, setStage] = useState<Stage>("created");

  useEffect(() => {
    const timeline: { target: Stage; delay: number }[] = [
      { target: "created", delay: 0 },
      { target: "signed", delay: 3500 },
      { target: "broadcast", delay: 7000 },
      { target: "mempool", delay: 10500 },
      { target: "validated", delay: 14000 },
      { target: "blockchain", delay: 18500 },
    ];

    let timers: NodeJS.Timeout[] = [];

    const runTimeline = () => {
      timeline.forEach((item) => {
        const timer = setTimeout(() => {
          setStage(item.target);
        }, item.delay);
        timers.push(timer);
      });

      // Loop restart after 23 seconds
      const loopTimer = setTimeout(() => {
        runTimeline();
      }, 23500);
      timers.push(loopTimer);
    };

    runTimeline();

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, []);

  const stages: { key: Stage; label: string; num: string }[] = [
    { key: "created", label: "Created", num: "01" },
    { key: "signed", label: "Signed", num: "02" },
    { key: "broadcast", label: "Broadcast", num: "03" },
    { key: "mempool", label: "Mempool", num: "04" },
    { key: "validated", label: "Validated", num: "05" },
    { key: "blockchain", label: "Recorded", num: "06" },
  ];

  const currentIdx = stages.findIndex((s) => s.key === stage);

  const getStatusText = () => {
    switch (stage) {
      case "created":
        return "CREATED";
      case "signed":
        return "SIGNING";
      case "broadcast":
        return "BROADCASTING";
      case "mempool":
        return "PENDING";
      case "validated":
        return "VERIFYING";
      case "blockchain":
        return "CONFIRMED";
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 flex flex-col justify-between min-h-[400px] lg:h-full relative overflow-hidden shadow-2xl">
      {/* Background visual lines */}
      <div className="absolute inset-0 bg-size-[16px_16px] bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 border-b border-white/5 pb-3 flex justify-between items-center text-left">
        <div>
          <span className="font-mono text-[8px] tracking-widest text-cyan-400 uppercase block">Simulation Lab</span>
          <h3 className="font-rushblade text-sm text-white mt-1">Transaction Pipeline</h3>
          <p className="text-[9px] font-mono text-slate-400 mt-0.5">FROM WALLET TO BLOCKCHAIN</p>
        </div>

        {/* Dynamic status badge */}
        <div
          className="px-2.5 py-0.5 rounded-full border text-[8px] font-mono font-bold tracking-wider"
          style={{
            borderColor: stage === "blockchain" ? `${color}40` : "rgba(255, 255, 255, 0.1)",
            color: stage === "blockchain" ? color : "#94a3b8",
            background: stage === "blockchain" ? `${color}10` : "rgba(255, 255, 255, 0.02)",
            boxShadow: stage === "blockchain" ? `0 0 10px ${color}20` : "none",
          }}
        >
          {getStatusText()}
        </div>
      </div>

      {/* 01-06 Progress Indicator tracker */}
      <div className="relative z-10 py-3 border-b border-white/5 flex items-center justify-between select-none">
        {stages.map((st, i) => {
          const isActive = st.key === stage;
          const isCompleted = currentIdx > i;

          return (
            <div key={st.key} className="flex items-center flex-1 last:flex-initial">
              {/* Step bubble */}
              <div className="flex flex-col items-center gap-1.5 mx-auto">
                <div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center font-mono text-[9px] font-bold transition-all duration-300 ${
                    isActive
                      ? "border-cyan-400 text-cyan-300 bg-cyan-950/40 shadow-[0_0_10px_rgba(34,211,238,0.4)] scale-110"
                      : isCompleted
                      ? "border-emerald-500 text-emerald-400 bg-emerald-950/20"
                      : "border-white/10 text-slate-600 bg-transparent"
                  }`}
                >
                  {isCompleted ? "✓" : st.num}
                </div>
                <span
                  className={`text-[7px] font-mono uppercase tracking-wider hidden sm:block ${
                    isActive ? "text-cyan-400 font-bold" : isCompleted ? "text-emerald-500" : "text-slate-600"
                  }`}
                >
                  {st.label}
                </span>
              </div>

              {/* Connecting line */}
              {i < stages.length - 1 && (
                <div className="flex-1 h-[1.5px] bg-slate-900 mx-2 relative min-w-[12px]">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: isCompleted ? "100%" : isActive ? "50%" : "0%" }}
                    transition={{ duration: 0.5 }}
                    className={`absolute top-0 bottom-0 left-0 ${isCompleted ? "bg-emerald-500" : "bg-cyan-400"}`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Active simulation frame viewport */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center py-4 min-h-[220px]">
        <AnimatePresence mode="wait">
          
          {/* STAGE 1: CREATED */}
          {stage === "created" && (
            <motion.div
              key="created"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 w-full"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 animate-pulse">
                <Send className="w-5 h-5" />
              </div>
              <div className="border border-white/8 bg-slate-950/80 rounded-xl p-3.5 w-48 font-mono text-[9px] text-left space-y-1.5 shadow-lg">
                <div className="text-[7.5px] text-slate-500 uppercase tracking-widest border-b border-white/5 pb-1">TX Payload Data</div>
                <div className="flex justify-between"><span className="text-slate-400">FROM:</span> <span className="text-white">YOU (0x7A...91F)</span></div>
                <div className="flex justify-between"><span className="text-slate-400">TO:</span> <span className="text-white">FRIEND (0x3B...28A)</span></div>
                <div className="flex justify-between"><span className="text-slate-400">AMOUNT:</span> <span className="text-emerald-400 font-bold">25 XLM</span></div>
              </div>
              <span className="text-[9px] font-mono text-cyan-300 bg-cyan-950/20 px-2 py-0.5 rounded border border-cyan-400/20">
                ✓ TRANSACTION CREATED
              </span>
            </motion.div>
          )}

          {/* STAGE 2: SIGNED */}
          {stage === "signed" && (
            <motion.div
              key="signed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 w-full"
            >
              <motion.div
                animate={{ rotate: [0, -15, 0] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
              >
                <Key className="w-5 h-5" />
              </motion.div>
              <div className="border border-white/8 bg-slate-950/80 rounded-xl p-3.5 w-48 font-mono text-[9px] text-left space-y-1">
                <div className="flex justify-between text-slate-500 border-b border-white/5 pb-1 mb-1 text-[7.5px] uppercase tracking-wider">
                  <span>Sign Authorization</span>
                </div>
                <div className="flex justify-between"><span className="text-slate-400">PAYLOAD:</span> <span className="text-slate-500">25 XLM ➔ 0x3B...</span></div>
                <div className="flex justify-between"><span className="text-slate-400">AUTH LINK:</span> <span className="text-amber-400">PRIVATE_KEY_SECURE</span></div>
                <div className="flex justify-between"><span className="text-slate-400">SIG HASH:</span> <span className="text-white truncate max-w-[80px]">SIG_8f2d91c...</span></div>
              </div>
              <span className="text-[9px] font-mono text-amber-300 bg-amber-950/20 px-2 py-0.5 rounded border border-amber-400/20">
                ✓ SIGNATURE ATTACHED
              </span>
            </motion.div>
          )}

          {/* STAGE 3: BROADCAST */}
          {stage === "broadcast" && (
            <motion.div
              key="broadcast"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 w-full"
            >
              {/* Small P2P network grid */}
              <div className="w-48 h-24 relative select-none">
                <svg viewBox="0 0 100 50" className="w-full h-full">
                  {/* P2P links */}
                  <line x1="50" y1="10" x2="20" y2="25" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
                  <line x1="50" y1="10" x2="80" y2="25" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
                  <line x1="20" y1="25" x2="50" y2="40" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
                  <line x1="80" y1="25" x2="50" y2="40" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
                  <line x1="20" y1="25" x2="80" y2="25" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />

                  {/* Network Nodes */}
                  <circle cx="50" cy="10" r="4" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="1" />
                  <circle cx="20" cy="25" r="4" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="1" />
                  <circle cx="80" cy="25" r="4" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="1" />
                  <circle cx="50" cy="40" r="4" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="1" />

                  {/* Travelling transaction dot */}
                  <motion.circle
                    r="2.5"
                    fill="#22d3ee"
                    animate={{
                      cx: [50, 20, 80, 50, 50],
                      cy: [10, 25, 25, 40, 10],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{ filter: "drop-shadow(0 0 4px #22d3ee)" }}
                  />
                </svg>
              </div>
              <span className="text-[9px] font-mono text-violet-300 bg-violet-950/20 px-2 py-0.5 rounded border border-violet-400/20">
                BROADCASTING TO P2P NODES...
              </span>
            </motion.div>
          )}

          {/* STAGE 4: MEMPOOL */}
          {stage === "mempool" && (
            <motion.div
              key="mempool"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 w-full"
            >
              <div className="border border-amber-500/25 bg-slate-900/40 rounded-xl p-3 w-56 space-y-2">
                <div className="flex justify-between items-center border-b border-white/5 pb-1">
                  <span className="font-mono text-[8px] text-amber-400 uppercase tracking-widest font-bold">Mempool Queue</span>
                  <span className="text-[8px] font-mono text-slate-500">PENDING</span>
                </div>

                {/* Queue list */}
                <div className="flex flex-col gap-1.5 font-mono text-[8.5px] text-left">
                  <div className="px-2 py-1 rounded bg-white/3 border border-white/5 text-slate-500 flex justify-between">
                    <span>TX-21 (Fee: 0.05)</span><span>0x9f...e02</span>
                  </div>
                  <div className="px-2 py-1 rounded bg-white/3 border border-white/5 text-slate-500 flex justify-between">
                    <span>TX-44 (Fee: 0.08)</span><span>0xa3...8c1</span>
                  </div>
                  {/* User's highlighted packet */}
                  <motion.div
                    animate={{ borderColor: ["rgba(245,158,11,0.2)", "rgba(245,158,11,0.6)", "rgba(245,158,11,0.2)"] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="px-2 py-1 rounded bg-amber-500/10 border text-amber-200 flex justify-between shadow-[0_0_8px_rgba(245,158,11,0.15)]"
                  >
                    <span>TX-YOU (Fee: 0.10)</span><span>0x7a...91f</span>
                  </motion.div>
                </div>
              </div>
              <span className="text-[9px] font-mono text-amber-300">
                WAITING FOR BLOCK SELECTION
              </span>
            </motion.div>
          )}

          {/* STAGE 5: VALIDATED */}
          {stage === "validated" && (
            <motion.div
              key="validated"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3.5 w-full"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                <Server className="w-5 h-5 animate-pulse" />
              </div>

              {/* Verification Checklist */}
              <div className="border border-white/5 bg-slate-950/80 rounded-xl p-3 w-52 font-mono text-[9px] text-left space-y-1.5 shadow-lg">
                <div className="text-[7.5px] text-slate-500 border-b border-white/5 pb-1 uppercase tracking-wider">Validator Checks</div>
                <div className="flex items-center gap-1.5 text-emerald-400"><Check className="w-3.5 h-3.5 shrink-0" /> <span>FORMAT VALID</span></div>
                <div className="flex items-center gap-1.5 text-emerald-400"><Check className="w-3.5 h-3.5 shrink-0" /> <span>SIGNATURE MATCHES</span></div>
                <div className="flex items-center gap-1.5 text-emerald-400"><Check className="w-3.5 h-3.5 shrink-0" /> <span>SUFFICIENT BALANCES</span></div>
                <div className="flex items-center gap-1.5 text-emerald-400"><Check className="w-3.5 h-3.5 shrink-0" /> <span>SEQUENCE OK</span></div>
              </div>
            </motion.div>
          )}

          {/* STAGE 6: RECORDED (BLOCKCHAIN) */}
          {stage === "blockchain" && (
            <motion.div
              key="blockchain"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 w-full"
            >
              {/* Blockchain blocks connect */}
              <div className="flex items-center justify-center gap-2 select-none">
                {/* Parent Block */}
                <div className="border border-white/5 bg-slate-900/30 px-2 py-1.5 rounded-lg font-mono text-[7px] text-slate-600 text-center w-16 shrink-0">
                  <div>BLOCK #123</div>
                  <div className="mt-1 font-bold text-[8px]">0x3e18...</div>
                </div>

                {/* Connecting arrow */}
                <div className="text-slate-600 font-bold text-[10px]">➔</div>

                {/* New Block */}
                <motion.div
                  initial={{ scale: 0.9, y: 3 }}
                  animate={{ scale: 1, y: 0, borderColor: `${color}60`, boxShadow: `0 0 15px ${color}30` }}
                  className="border bg-slate-950 px-2.5 py-1.5 rounded-xl font-mono text-[7.5px] text-center w-24 shrink-0 relative"
                >
                  <div className="text-slate-400">BLOCK #124</div>
                  
                  {/* TX inside block list */}
                  <div className="mt-1 space-y-0.5 border-t border-white/5 pt-1 text-slate-500 font-sans text-[7px]">
                    <div>• TX-21</div>
                    <div className="text-emerald-400 font-bold font-mono text-[7.5px] flex items-center justify-center gap-0.5">
                      • TX-YOU <Check className="w-2.5 h-2.5 shrink-0" />
                    </div>
                    <div>• TX-44</div>
                  </div>

                  <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-slate-950 font-bold text-[8px]">
                    ✓
                  </span>
                </motion.div>
              </div>

              <span className="text-[9px] font-mono text-emerald-300">
                ✓ BLOCK SECURELY APPENDED TO LEDGER
              </span>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Footer educational caption explanations */}
      <div className="relative z-10 border-t border-white/5 pt-2 flex flex-col justify-center min-h-[56px] text-center">
        <AnimatePresence mode="wait">
          {stage === "created" && (
            <motion.p
              key="created_cap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[9.5px] font-sans text-slate-300 leading-relaxed"
            >
              "Transaction data is constructed into a payload." The sender specifies the destination, amount, and fee.
            </motion.p>
          )}
          {stage === "signed" && (
            <motion.p
              key="signed_cap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[9.5px] font-sans text-slate-300 leading-relaxed"
            >
              "Sender authorizes the transaction with a cryptographic signature." Built from the private key, verifying ownership securely.
            </motion.p>
          )}
          {stage === "broadcast" && (
            <motion.p
              key="broadcast_cap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[9.5px] font-sans text-slate-300 leading-relaxed"
            >
              "The signed transaction is submitted and propagated across the peer-to-peer network." Nodes relay it from one to another.
            </motion.p>
          )}
          {stage === "mempool" && (
            <motion.p
              key="mempool_cap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[9.5px] font-sans text-slate-300 leading-relaxed"
            >
              "Mempool: A temporary holding area for pending transactions awaiting processing." Validators select them based on network fees.
            </motion.p>
          )}
          {stage === "validated" && (
            <motion.p
              key="validated_cap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[9.5px] font-sans text-slate-300 leading-relaxed"
            >
              "Network validators verify that the transaction follows protocol rules" (checking balances, sequence counters, and format).
            </motion.p>
          )}
          {stage === "blockchain" && (
            <motion.div
              key="blockchain_cap"
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-1"
            >
              <p className="text-[9.5px] font-mono font-bold text-emerald-400 uppercase tracking-wide">
                Transaction Confirmed · From Click to Permanent Record
              </p>
              <p className="text-[9px] font-sans text-slate-400">
                "The transaction is included in a block that becomes part of the blockchain." Immutable, secure, and shared.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}

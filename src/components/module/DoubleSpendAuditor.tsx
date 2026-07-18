import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle, RefreshCw, Play, ShieldAlert, ArrowRight } from "lucide-react";

interface Props {
  color: string;
}

interface TxDef {
  id: string;
  sender: string;
  receiver: string;
  amount: number;
  time: string;
  status: "pending" | "processing" | "accepted" | "rejected";
}

export default function DoubleSpendAuditor({ color }: Props) {
  const [balance, setBalance] = useState(100);
  const [simStage, setSimStage] = useState<"mempool" | "scanning_alpha" | "applied_alpha" | "scanning_beta" | "rejected_beta" | "finished">("mempool");
  const [transactions, setTransactions] = useState<TxDef[]>([
    { id: "Tx Alpha", sender: "STATION_ALPHA", receiver: "STATION_BETA", amount: 80, time: "14:02:10.012", status: "pending" },
    { id: "Tx Beta", sender: "STATION_ALPHA", receiver: "STATION_GAMMA", amount: 30, time: "14:02:10.015", status: "pending" }
  ]);
  const [finalizedBlock, setFinalizedBlock] = useState<TxDef[]>([]);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "Mempool Initialized: 2 pending transactions found.",
    "Combined payload requests: 110 units.",
    "Current sender balance: 100 units.",
    "Ready to execute order verification sequence..."
  ]);

  const addLog = (msg: string) => {
    setTerminalLogs((prev) => [...prev, msg]);
  };

  const runAuditor = () => {
    if (simStage !== "mempool") return;

    // Step 1: Scan Tx Alpha
    setSimStage("scanning_alpha");
    setTransactions((prev) => 
      prev.map((t) => t.id === "Tx Alpha" ? { ...t, status: "processing" } : t)
    );
    addLog("Scanning first transaction in queue: Tx Alpha...");

    // Step 2: Accept Tx Alpha
    setTimeout(() => {
      setSimStage("applied_alpha");
      setTransactions((prev) => 
        prev.map((t) => t.id === "Tx Alpha" ? { ...t, status: "accepted" } : t)
      );
      setBalance(20);
      setFinalizedBlock((prev) => [
        { id: "Tx Alpha", sender: "STATION_ALPHA", receiver: "STATION_BETA", amount: 80, time: "14:02:10.012", status: "accepted" }
      ]);
      addLog("Tx Alpha approved (100 balance >= 80 amount). New balance: 20.");

      // Step 3: Scan Tx Beta
      setTimeout(() => {
        setSimStage("scanning_beta");
        setTransactions((prev) => 
          prev.map((t) => t.id === "Tx Beta" ? { ...t, status: "processing" } : t)
        );
        addLog("Scanning next transaction in queue: Tx Beta...");

        // Step 4: Reject Tx Beta (Double Spend)
        setTimeout(() => {
          setSimStage("rejected_beta");
          setTransactions((prev) => 
            prev.map((t) => t.id === "Tx Beta" ? { ...t, status: "rejected" } : t)
          );
          addLog("Tx Beta failed validation! (20 current balance < 30 amount).");
          addLog("Double-spend violation flagged. Tx Beta rejected.");

          setTimeout(() => {
            setSimStage("finished");
            addLog("✓ Block proposal verification complete. 1 transaction sealed.");
          }, 1500);
        }, 2000);
      }, 2000);
    }, 2000);
  };

  const resetAuditor = () => {
    setBalance(100);
    setSimStage("mempool");
    setTransactions([
      { id: "Tx Alpha", sender: "STATION_ALPHA", receiver: "STATION_BETA", amount: 80, time: "14:02:10.012", status: "pending" },
      { id: "Tx Beta", sender: "STATION_ALPHA", receiver: "STATION_GAMMA", amount: 30, time: "14:02:10.015", status: "pending" }
    ]);
    setFinalizedBlock([]);
    setTerminalLogs([
      "Mempool Initialized: 2 pending transactions found.",
      "Combined payload requests: 110 units.",
      "Current sender balance: 100 units.",
      "Ready to execute order verification sequence..."
    ]);
  };

  return (
    <div className="flex flex-col h-full bg-[#040816]/60 rounded-2xl border border-white/10 overflow-hidden text-slate-100 p-4 font-sans select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3 shrink-0">
        <div>
          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">Order & Double Spend Protection</span>
          <h3 className="text-xs font-bold font-mono uppercase tracking-wide text-white">Mempool Conflict Resolution</h3>
        </div>

        <button onClick={resetAuditor} className="text-[9.5px] font-mono text-slate-400 hover:text-white uppercase flex items-center gap-1 cursor-pointer">
          <RefreshCw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin space-y-4">
        <div className="grid grid-cols-12 gap-3">
          
          {/* Left panel: Wallet and logs */}
          <div className="col-span-5 flex flex-col gap-3">
            {/* Account Info */}
            <div className="bg-slate-950/60 border border-white/5 rounded-xl p-3 font-mono text-[9px] space-y-2">
              <span className="text-slate-500 uppercase font-bold block">SENDER PROFILE</span>
              <div className="flex justify-between items-center bg-[#070b18] p-2 rounded-lg border border-white/5">
                <span className="text-slate-400">STATION_ALPHA:</span>
                <span className="text-xs font-bold text-cyan-400">{balance} UNITS</span>
              </div>
            </div>

            {/* Terminal logs */}
            <div className="flex-1 bg-black/80 border border-white/10 rounded-xl p-3 font-mono text-[8px] space-y-1 overflow-y-auto scrollbar-none min-h-[140px]">
              <div className="text-[7.5px] text-slate-500 uppercase tracking-wider mb-1 font-bold border-b border-white/5 pb-1">
                VALIDATOR EVALUATION LOG
              </div>
              {terminalLogs.map((log, idx) => (
                <div key={idx} className={log.includes("failed") || log.includes("rejected") ? "text-red-400" : log.includes("approved") || log.includes("complete") ? "text-emerald-400" : "text-slate-300"}>
                  &gt; {log}
                </div>
              ))}
            </div>
          </div>

          {/* Right panel: Mempool and Block */}
          <div className="col-span-7 space-y-3">
            {/* Mempool Queue */}
            <div className="bg-slate-950/40 border border-white/5 rounded-xl p-3 space-y-2">
              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
                MEMPOOL QUEUE (SORTED CHRONOLOGICALLY)
              </span>

              <div className="space-y-2">
                {transactions.map((tx) => {
                  let statusBorder = "border-white/5 bg-slate-900/40";
                  let badgeColor = "text-slate-400 bg-slate-900/80";
                  
                  if (tx.status === "processing") {
                    statusBorder = "border-amber-500/50 bg-amber-950/10";
                    badgeColor = "text-amber-400 bg-amber-950/60 animate-pulse";
                  } else if (tx.status === "accepted") {
                    statusBorder = "border-emerald-500/40 bg-emerald-950/10 opacity-60";
                    badgeColor = "text-emerald-400 bg-emerald-950/60";
                  } else if (tx.status === "rejected") {
                    statusBorder = "border-red-500/50 bg-red-950/10";
                    badgeColor = "text-red-400 bg-red-950/60";
                  }

                  return (
                    <div key={tx.id} className={`p-2 border.5 rounded-lg flex items-center justify-between font-mono text-[9px] ${statusBorder}`}>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="text-white">{tx.id}</span>
                          <span className="text-[7.5px] px-1 py-0.2 rounded bg-white/5 text-slate-400 font-normal">{tx.time}</span>
                        </div>
                        <div className="text-slate-500 text-[8px]">
                          {tx.sender} → {tx.receiver}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{tx.amount} U</span>
                        <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded uppercase ${badgeColor}`}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Block builder container */}
            <div className="bg-slate-950/60 border border-white/5 rounded-xl p-3 space-y-2">
              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
                PROPOSED BLOCK BUILDER (SEALED TRANSACTIONS)
              </span>

              <div className="border border-dashed border-white/10 rounded-lg p-3 min-h-[64px] flex flex-col justify-center items-center">
                <AnimatePresence>
                  {finalizedBlock.length === 0 ? (
                    <span className="text-slate-600 font-mono text-[9px] uppercase">
                      BLOCK EMPTY — AWAITING CONFLICT CHECK
                    </span>
                  ) : (
                    <div className="w-full space-y-1.5">
                      {finalizedBlock.map((tx) => (
                        <motion.div
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="bg-emerald-950/10 border border-emerald-500/30 p-2 rounded-lg flex items-center justify-between text-emerald-400 font-mono text-[8.5px] tracking-wide"
                          key={tx.id}
                        >
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span className="font-bold">{tx.id}</span>
                            <span className="text-slate-500 font-normal">| {tx.sender} → {tx.receiver}</span>
                          </div>
                          <span className="font-extrabold">{tx.amount} UNITS SECURED</span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>

        </div>

        {/* Action Panel */}
        <div className="bg-slate-950 border border-white/5 rounded-xl p-3 flex items-center justify-between text-[10px] font-mono">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-slate-400">Validation filters double-spends automatically via chronological indexing.</span>
          </div>

          <button
            onClick={runAuditor}
            disabled={simStage !== "mempool"}
            style={{ backgroundColor: simStage === "mempool" ? color : "#1e293b" }}
            className="text-slate-950 disabled:text-slate-500 font-bold px-4 py-2 rounded-lg cursor-pointer disabled:cursor-not-allowed hover:opacity-90 flex items-center gap-1.5 uppercase font-mono text-[9px] ml-auto"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" /> Verify Mempool Queue
          </button>
        </div>
      </div>

    </div>
  );
}

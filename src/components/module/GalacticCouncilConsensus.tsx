import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Vote, CheckSquare, XSquare, Info, Play, RefreshCw, Star, CheckCircle } from "lucide-react";

interface Props {
  color: string;
}

interface NodeVote {
  id: number;
  name: string;
  type: "honest" | "out-of-sync" | "malicious";
  reportedBalance: number;
  vote: "pending" | "approve" | "reject";
  status: "idle" | "auditing" | "voted";
}

export default function GalacticCouncilConsensus({ color }: Props) {
  const [nodes, setNodes] = useState<NodeVote[]>([
    { id: 1, name: "Node 1 (Honest)", type: "honest", reportedBalance: 600, vote: "pending", status: "idle" },
    { id: 2, name: "Node 2 (Honest)", type: "honest", reportedBalance: 600, vote: "pending", status: "idle" },
    { id: 3, name: "Node 3 (Honest)", type: "honest", reportedBalance: 600, vote: "pending", status: "idle" },
    { id: 4, name: "Node 4 (Lagging)", type: "out-of-sync", reportedBalance: 400, vote: "pending", status: "idle" },
    { id: 5, name: "Node 5 (Infiltrator)", type: "malicious", reportedBalance: 300, vote: "pending", status: "idle" },
  ]);
  const [stage, setStage] = useState<"idle" | "checking" | "tallying" | "resolved">("idle");
  const [tally, setTally] = useState({ approve: 0, reject: 0, required: 3 });
  const [alphaFinalBalance, setAlphaFinalBalance] = useState(600);

  const startVoting = () => {
    if (stage !== "idle") return;
    setStage("checking");
    
    // Set all nodes to auditing
    setNodes((prev) => prev.map((n) => ({ ...n, status: "auditing" })));

    // Cast votes sequentially
    setTimeout(() => {
      setNodes((prev) => 
        prev.map((n) => {
          let v: "approve" | "reject" = "reject";
          if (n.reportedBalance >= 500) v = "approve";
          return { ...n, vote: v, status: "voted" };
        })
      );
      
      setStage("tallying");
      setTally({ approve: 3, reject: 2, required: 3 });

      setTimeout(() => {
        setStage("resolved");
        setAlphaFinalBalance(100);
      }, 1500);

    }, 2500);
  };

  const resetCouncil = () => {
    setNodes([
      { id: 1, name: "Node 1 (Honest)", type: "honest", reportedBalance: 600, vote: "pending", status: "idle" },
      { id: 2, name: "Node 2 (Honest)", type: "honest", reportedBalance: 600, vote: "pending", status: "idle" },
      { id: 3, name: "Node 3 (Honest)", type: "honest", reportedBalance: 600, vote: "pending", status: "idle" },
      { id: 4, name: "Node 4 (Lagging)", type: "out-of-sync", reportedBalance: 400, vote: "pending", status: "idle" },
      { id: 5, name: "Node 5 (Infiltrator)", type: "malicious", reportedBalance: 300, vote: "pending", status: "idle" },
    ]);
    setTally({ approve: 0, reject: 0, required: 3 });
    setStage("idle");
    setAlphaFinalBalance(600);
  };

  return (
    <div className="flex flex-col h-full bg-[#040816]/60 rounded-2xl border border-white/10 overflow-hidden text-slate-100 p-4 font-sans select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3 shrink-0">
        <div>
          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">Consensus Quorum Challenge</span>
          <h3 className="text-xs font-bold font-mono uppercase tracking-wide text-white">Galactic Council Resolution Dashboard</h3>
        </div>

        <button onClick={resetCouncil} className="text-[9.5px] font-mono text-slate-400 hover:text-white uppercase flex items-center gap-1 cursor-pointer">
          <RefreshCw className="w-3 h-3" /> Reset
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin space-y-4">
        
        {/* Ledger Transaction Target */}
        <div className="bg-slate-950/60 border border-white/5 rounded-xl p-3 flex justify-between items-center font-mono text-[9px] tracking-wide">
          <div className="space-y-1">
            <span className="text-slate-500 uppercase font-bold block">PROPOSED INSTRUCTION</span>
            <span className="text-white text-[10px] font-bold">STATION ALPHA → TRANSFER 500 FUEL → STATION BETA</span>
          </div>

          <div className="text-right space-y-1">
            <span className="text-slate-500 uppercase font-bold block">ALPHA DATABASE STATE</span>
            <span className="text-cyan-400 text-[10px] font-extrabold">{alphaFinalBalance} FUEL UNITS</span>
          </div>
        </div>

        {/* Validator node list cards */}
        <div className="grid grid-cols-5 gap-2.5">
          {nodes.map((node) => {
            let statusText = "Honest Node";
            let statusColor = "text-emerald-400 bg-emerald-500/5";
            let borderColor = "border-white/5";

            if (node.type === "out-of-sync") {
              statusText = "Lagging DB";
              statusColor = "text-amber-400 bg-amber-500/5";
            } else if (node.type === "malicious") {
              statusText = "Infiltrated";
              statusColor = "text-rose-400 bg-rose-500/5";
            }

            if (node.status === "auditing") {
              borderColor = "border-amber-400/50 animate-pulse";
            } else if (node.status === "voted") {
              borderColor = node.vote === "approve" ? "border-emerald-500/40" : "border-rose-500/40";
            }

            return (
              <div key={node.id} className={`p-2.5 border rounded-xl bg-slate-950/40 flex flex-col justify-between font-mono text-[9px] space-y-3 transition-all duration-300 ${borderColor}`}>
                <div className="space-y-1.5">
                  <div className="font-bold text-white text-[8.5px] truncate">{node.name}</div>
                  <div className={`text-[7px] font-bold px-1.5 py-0.5 rounded text-center uppercase tracking-wider ${statusColor}`}>
                    {statusText}
                  </div>
                </div>

                <div className="space-y-1 bg-[#060a16] p-1.5 rounded-lg border border-white/5 text-[8.5px]">
                  <span className="text-slate-500 text-[7px] uppercase block">Local Balance:</span>
                  <span className="text-slate-300 font-extrabold block">{node.reportedBalance} Units</span>
                </div>

                {/* Vote Indicator */}
                <div className="flex items-center justify-center pt-1 border-t border-white/5">
                  {node.status === "idle" && (
                    <span className="text-slate-600 uppercase text-[8px]">Standby</span>
                  )}
                  {node.status === "auditing" && (
                    <span className="text-amber-400 uppercase text-[8px] animate-pulse">Auditing...</span>
                  )}
                  {node.status === "voted" && (
                    <div className="flex items-center gap-1">
                      {node.vote === "approve" ? (
                        <>
                          <CheckSquare className="w-4 h-4 text-emerald-400 fill-emerald-500/10" />
                          <span className="text-emerald-400 font-bold text-[8.5px] uppercase">APPROVE</span>
                        </>
                      ) : (
                        <>
                          <XSquare className="w-4 h-4 text-rose-400 fill-rose-500/10" />
                          <span className="text-rose-400 font-bold text-[8.5px] uppercase">REJECT</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Voting Quorum Tally and Result Banner */}
        <AnimatePresence mode="wait">
          {stage !== "idle" && (
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="bg-slate-950 border border-white/5 rounded-xl p-3 flex items-center justify-between text-[9.5px] font-mono"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Vote className="w-4 h-4 text-indigo-400" />
                  <span className="text-slate-400">QUORUM TALLY:</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 font-bold">APPROVES: {tally.approve}</span>
                  <span className="text-rose-400 font-bold">REJECTS: {tally.reject}</span>
                  <span className="text-indigo-300">REQUIRED: {tally.required}</span>
                </div>
              </div>

              {stage === "resolved" && (
                <motion.div
                  initial={{ x: 10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="flex items-center gap-1.5 text-emerald-400 font-extrabold uppercase text-[10px] tracking-wider"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>CONSENSUS REACHED</span>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Panel */}
        <div className="bg-slate-950 border border-white/5 rounded-xl p-3 flex items-center justify-between text-[10px] font-mono">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400">Under BFT / Majority protocols, honest consensus overrides lagging or malicious votes.</span>
          </div>

          <button
            onClick={startVoting}
            disabled={stage !== "idle"}
            style={{ backgroundColor: stage === "idle" ? color : "#1e293b" }}
            className="text-slate-950 disabled:text-slate-500 font-bold px-4 py-2 rounded-lg cursor-pointer disabled:cursor-not-allowed hover:opacity-90 flex items-center gap-1.5 uppercase font-mono text-[9px] ml-auto"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" /> Initiate Council Voting
          </button>
        </div>
      </div>

    </div>
  );
}

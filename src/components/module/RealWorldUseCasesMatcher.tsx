import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, HelpCircle, RefreshCw, Layers, DollarSign, Eye, ShieldCheck, CheckCircle } from "lucide-react";

interface Props {
  color: string;
}

interface ItemDef {
  id: number;
  text: string;
  solutionId: number;
}

interface SolutionDef {
  id: number;
  title: string;
  desc: string;
  icon: any;
}

const PROBLEMS: ItemDef[] = [
  { id: 1, text: "Humanitarian agency distributes aid directly without banks", solutionId: 101 },
  { id: 2, text: "An art collector buys fractional share (1%) of a painting", solutionId: 102 },
  { id: 3, text: "A luxury watch brand proves watch is authentic, not replica", solutionId: 103 },
  { id: 4, text: "Developer builds permissionless lending without credit checks", solutionId: 104 },
];

const SOLUTIONS: SolutionDef[] = [
  { id: 101, title: "Stablecoins / Stellar Network", desc: "Fast, low-cost international asset settlement.", icon: DollarSign },
  { id: 102, title: "Tokenization / NFTs", desc: "Digital fraction representation of assets.", icon: Layers },
  { id: 103, title: "Supply Chain Provenance", desc: "Immutable records tracing origin back to genesis.", icon: ShieldCheck },
  { id: 104, title: "Decentralized Finance (DeFi)", desc: "Permissionless financial contracts on-chain.", icon: Eye },
];

export default function RealWorldUseCasesMatcher({ color }: Props) {
  const [selectedProblem, setSelectedProblem] = useState<number | null>(null);
  const [connections, setConnections] = useState<Record<number, number>>({}); // maps problemId -> solutionId
  const [success, setSuccess] = useState(false);

  const selectProblem = (id: number) => {
    if (success) return;
    setSelectedProblem(id);
  };

  const selectSolution = (solId: number) => {
    if (success || selectedProblem === null) return;

    setConnections((prev) => {
      const next = { ...prev, [selectedProblem]: solId };
      // Check if all are correctly matched
      const allMatched = PROBLEMS.every(prob => next[prob.id] === prob.solutionId);
      if (allMatched && Object.keys(next).length === PROBLEMS.length) {
        setSuccess(true);
      }
      return next;
    });

    setSelectedProblem(null);
  };

  const resetMatcher = () => {
    setConnections({});
    setSelectedProblem(null);
    setSuccess(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#040816]/60 rounded-2xl border border-white/10 overflow-hidden text-slate-100 p-4 font-sans select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3 shrink-0">
        <div>
          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">Application Architectures</span>
          <h3 className="text-xs font-bold font-mono uppercase tracking-wide text-white">Problem-Solution Matching Matrix</h3>
        </div>

        <button onClick={resetMatcher} className="text-[9.5px] font-mono text-slate-400 hover:text-white uppercase flex items-center gap-1 cursor-pointer">
          <RefreshCw className="w-3 h-3" /> Reset
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin space-y-4">
        
        {/* Help tooltip banner */}
        <div className="bg-slate-950/60 border border-white/5 rounded-xl p-3 flex items-center gap-2 text-[9px] font-mono text-sky-400">
          <HelpCircle className="w-4 h-4 shrink-0" />
          <span>Click a Problem card on the left, then select the matching Blockchain Solution on the right.</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          
          {/* Left Column: Problems */}
          <div className="space-y-2">
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
              INDUSTRY PROBLEMS
            </span>

            {PROBLEMS.map((prob) => {
              const matchedSolId = connections[prob.id];
              const matchedSol = SOLUTIONS.find(s => s.id === matchedSolId);
              const isSelected = selectedProblem === prob.id;
              
              let cardBorder = "border-white/5 bg-slate-950/40 hover:border-white/20";
              if (isSelected) cardBorder = "border-sky-400 ring-2 ring-sky-400/40 bg-slate-900";
              else if (matchedSolId) cardBorder = "border-emerald-500/20 bg-emerald-950/5 opacity-80";

              return (
                <button
                  key={prob.id}
                  onClick={() => selectProblem(prob.id)}
                  disabled={success}
                  className={`w-full text-left p-3 rounded-xl border font-mono text-[9px] leading-relaxed transition-all flex flex-col justify-between min-h-[72px] cursor-pointer ${cardBorder}`}
                >
                  <span className="text-white block font-medium">{prob.text}</span>
                  {matchedSol && (
                    <span className="text-emerald-400 font-extrabold text-[7.5px] uppercase tracking-wider mt-1.5 block">
                      Linked: {matchedSol.title}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Column: Solutions */}
          <div className="space-y-2">
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
              BLOCKCHAIN SOLUTIONS
            </span>

            {SOLUTIONS.map((sol) => {
              // Find if any problem is connected to this solution
              const linkedProblemId = Object.keys(connections).find(key => connections[Number(key)] === sol.id);
              const isCorrectLink = linkedProblemId ? PROBLEMS.find(p => p.id === Number(linkedProblemId))?.solutionId === sol.id : false;

              let solBorder = "border-white/5 bg-slate-950/40 hover:border-white/20";
              if (linkedProblemId) {
                solBorder = isCorrectLink ? "border-emerald-500/30 bg-emerald-950/5 opacity-80" : "border-rose-500/30 bg-rose-950/5";
              }

              const Icon = sol.icon;

              return (
                <button
                  key={sol.id}
                  onClick={() => selectSolution(sol.id)}
                  disabled={success || selectedProblem === null}
                  className={`w-full text-left p-3 rounded-xl border font-mono text-[9px] leading-relaxed transition-all flex items-start gap-2.5 min-h-[72px] ${
                    selectedProblem !== null && !linkedProblemId ? "cursor-pointer border-indigo-400/30 bg-indigo-950/5" : "cursor-default"
                  } ${solBorder}`}
                >
                  <div className="w-8 h-8 rounded-lg border border-white/5 bg-slate-950 flex items-center justify-center shrink-0 mt-0.5" style={{ color: color }}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  <div className="min-w-0">
                    <span className="text-white font-extrabold block text-[9.5px]">{sol.title}</span>
                    <span className="text-slate-500 block text-[7.5px] mt-0.5 leading-relaxed uppercase">{sol.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>

        </div>

        {/* Success Alert */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-emerald-500/90 text-slate-950 border border-emerald-400/20 rounded-xl p-3 flex items-center justify-between text-[10px] font-mono tracking-wide"
            >
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle className="w-4 h-4 text-slate-950" />
                <span>ALL SOLUTIONS CORRECTLY LINKED!</span>
              </div>
              <span className="bg-slate-950 text-emerald-400 font-extrabold px-2.5 py-1 rounded uppercase text-[8px]">
                Validation Ready
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Panel */}
        <div className="bg-slate-950 border border-white/5 rounded-xl p-3 flex items-center gap-1.5 text-[9.5px] font-mono">
          <Info className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-slate-400">Match solutions directly to resolve localized coordinates before proceeding.</span>
        </div>
      </div>

    </div>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitCompare, HelpCircle, AlertTriangle, ArrowRight, ShieldCheck, Database, FileCode } from "lucide-react";

interface Props {
  color: string;
}

export default function DatabaseVsBlockchainMatrix({ color }: Props) {
  const [q1, setQ1] = useState<boolean | null>(null); // Do multiple parties write?
  const [q2, setQ2] = useState<boolean | null>(null); // Do writers trust each other?
  const [q3, setQ3] = useState<boolean | null>(null); // Is a middleman acceptable?

  const resetMatrix = () => {
    setQ1(null);
    setQ2(null);
    setQ3(null);
  };

  // Determine final architecture path
  let finalOutcome: "database" | "shared_db" | "api_db" | "blockchain" | null = null;
  let statusMessage = "Follow the questions above to analyze the architecture configuration.";

  if (q1 === false) {
    finalOutcome = "database";
    statusMessage = "Keep it simple! Since only a single writer exists, a standard database is the only logical choice.";
  } else if (q1 === true) {
    if (q2 === true) {
      finalOutcome = "shared_db";
      statusMessage = "Writers trust each other. A shared database solves this with high throughput and low costs.";
    } else if (q2 === false) {
      if (q3 === true) {
        finalOutcome = "api_db";
        statusMessage = "An intermediary is acceptable. Use standard database behind a secure API layer.";
      } else if (q3 === false) {
        finalOutcome = "blockchain";
        statusMessage = "Optimal blockchain fit! Multiple untrusted writers, no central authority. Verified Code: MATRIX_PASS";
      }
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#040816]/60 rounded-2xl border border-white/10 overflow-hidden text-slate-100 p-4 font-sans select-none animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3 shrink-0">
        <div>
          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">Architecture Decision Tree</span>
          <h3 className="text-xs font-bold font-mono uppercase tracking-wide text-white">Database vs. Blockchain Flow</h3>
        </div>

        <button onClick={resetMatrix} className="text-[9.5px] font-mono text-slate-400 hover:text-white uppercase flex items-center gap-1 cursor-pointer">
          <RefreshCwIcon className="w-3 h-3" /> Reset
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin space-y-4">
        
        {/* Step-by-Step Questions */}
        <div className="space-y-3 font-mono text-[9px]">
          
          {/* Question 1 */}
          <div className="bg-[#070b18]/60 border border-white/5 rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="text-sky-400 font-extrabold">Q1.</span>
              <span>DO MULTIPLE PARTIES NEED TO WRITE RECORDS?</span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setQ1(true);
                  setQ2(null);
                  setQ3(null);
                }}
                className={`px-3 py-1.5 rounded-lg border font-bold text-[8.5px] transition-all cursor-pointer ${
                  q1 === true ? "bg-sky-500/25 border-sky-400 text-sky-400" : "bg-transparent border-white/5 text-slate-400 hover:text-white"
                }`}
              >
                YES
              </button>
              <button
                onClick={() => {
                  setQ1(false);
                  setQ2(null);
                  setQ3(null);
                }}
                className={`px-3 py-1.5 rounded-lg border font-bold text-[8.5px] transition-all cursor-pointer ${
                  q1 === false ? "bg-sky-500/25 border-sky-400 text-sky-400" : "bg-transparent border-white/5 text-slate-400 hover:text-white"
                }`}
              >
                NO
              </button>
            </div>
          </div>

          {/* Question 2 */}
          <AnimatePresence>
            {q1 === true && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-[#070b18]/60 border border-white/5 rounded-xl p-3 space-y-2 overflow-hidden"
              >
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="text-sky-400 font-extrabold">Q2.</span>
                  <span>DO THE WRITING PARTIES TRUST EACH OTHER?</span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setQ2(true);
                      setQ3(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg border font-bold text-[8.5px] transition-all cursor-pointer ${
                      q2 === true ? "bg-sky-500/25 border-sky-400 text-sky-400" : "bg-transparent border-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    YES
                  </button>
                  <button
                    onClick={() => {
                      setQ2(false);
                      setQ3(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg border font-bold text-[8.5px] transition-all cursor-pointer ${
                      q2 === false ? "bg-sky-500/25 border-sky-400 text-sky-400" : "bg-transparent border-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    NO
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Question 3 */}
          <AnimatePresence>
            {q1 === true && q2 === false && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-[#070b18]/60 border border-white/5 rounded-xl p-3 space-y-2 overflow-hidden"
              >
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="text-sky-400 font-extrabold">Q3.</span>
                  <span>IS A TRUSTED INTERMEDIARY (MIDDLEMAN) ACCEPTABLE?</span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setQ3(true)}
                    className={`px-3 py-1.5 rounded-lg border font-bold text-[8.5px] transition-all cursor-pointer ${
                      q3 === true ? "bg-sky-500/25 border-sky-400 text-sky-400" : "bg-transparent border-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    YES
                  </button>
                  <button
                    onClick={() => setQ3(false)}
                    className={`px-3 py-1.5 rounded-lg border font-bold text-[8.5px] transition-all cursor-pointer ${
                      q3 === false ? "bg-sky-500/25 border-sky-400 text-sky-400" : "bg-transparent border-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    NO
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Visual Outcome Result Area */}
        <div className="bg-slate-950/40 border border-white/5 rounded-xl p-4 flex flex-col justify-center items-center relative overflow-hidden min-h-[120px] text-center">
          
          {finalOutcome ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-3 z-10 flex flex-col items-center"
            >
              {finalOutcome === "database" && (
                <>
                  <Database className="w-8 h-8 text-emerald-400" />
                  <span className="text-emerald-400 font-extrabold text-[10px] uppercase tracking-widest block">TRADITIONAL DATABASE</span>
                </>
              )}
              {finalOutcome === "shared_db" && (
                <>
                  <Database className="w-8 h-8 text-cyan-400" />
                  <span className="text-cyan-400 font-extrabold text-[10px] uppercase tracking-widest block">SHARED DATABASE (MUTUAL TRUST)</span>
                </>
              )}
              {finalOutcome === "api_db" && (
                <>
                  <GitCompare className="w-8 h-8 text-indigo-400" />
                  <span className="text-indigo-400 font-extrabold text-[10px] uppercase tracking-widest block">CENTRALIZED API LAYER / DB</span>
                </>
              )}
              {finalOutcome === "blockchain" && (
                <>
                  <ShieldCheck className="w-8 h-8 text-sky-400 animate-bounce" />
                  <span className="text-sky-400 font-extrabold text-[10px] uppercase tracking-widest block">DISTRIBUTED BLOCKCHAIN LEDGER</span>
                  
                  {/* Verified Code Box */}
                  <div className="bg-slate-950 border border-sky-500/20 px-4 py-2 rounded-lg mt-2 text-sky-400 font-bold text-[11px] flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5" />
                    <span>CONFIRMATION: <span className="font-extrabold tracking-wider bg-sky-950 px-1.5 py-0.5 rounded text-white select-all">MATRIX_PASS</span></span>
                  </div>
                </>
              )}

              <p className="text-slate-400 text-[8.5px] leading-relaxed max-w-[280px] uppercase font-mono">
                {statusMessage}
              </p>
            </motion.div>
          ) : (
            <span className="text-slate-600 font-mono text-[9px] uppercase z-10">
              Awaiting path configuration...
            </span>
          )}

        </div>

      </div>

    </div>
  );
}

// Simple Refresh Icon component fallback
function RefreshCwIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
    </svg>
  );
}

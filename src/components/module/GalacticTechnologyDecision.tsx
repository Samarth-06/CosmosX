import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, ShieldAlert, Award, FileCode, CheckCircle, RefreshCw, XCircle } from "lucide-react";

interface Props {
  color: string;
}

interface AppDef {
  id: number;
  name: string;
  desc: string;
  correct: "DB" | "BC" | "NONE";
}

const APPLICATIONS: AppDef[] = [
  { id: 1, name: "Instagram Clone", desc: "Photos, stories, user social graphs, likes history", correct: "DB" },
  { id: 2, name: "Hospital Patient Records", desc: "Tamper-proof audit logs shared across competing clinic networks", correct: "BC" },
  { id: 3, name: "Simple Calculator", desc: "Adding digits, calculating values in real-time memory", correct: "NONE" },
  { id: 4, name: "Cross-Border Remittances", desc: "Settling currency transfers between international banks", correct: "BC" },
  { id: 5, name: "University Attendance Logger", desc: "Tracking daily class check-ins by professors", correct: "DB" },
  { id: 6, name: "Supply Chain Origin Tracker", desc: "Tracing raw conflict diamonds from mine to retail shelf", correct: "BC" },
  { id: 7, name: "Food Delivery App", desc: "Restaurant menus, active courier paths, order status queues", correct: "DB" },
  { id: 8, name: "Digital Art Marketplace", desc: "Public immutable registry of art ownership certificates", correct: "BC" },
];

export default function GalacticTechnologyDecision({ color }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selections, setSelections] = useState<Record<number, "DB" | "BC" | "NONE">>({});
  const [finished, setFinished] = useState(false);
  const [success, setSuccess] = useState(false);

  const selectCategory = (category: "DB" | "BC" | "NONE") => {
    if (finished) return;

    setSelections((prev) => {
      const next = { ...prev, [currentIdx]: category };
      
      if (currentIdx === APPLICATIONS.length - 1) {
        setFinished(true);
        // Check if all are correct
        const allCorrect = APPLICATIONS.every((app, idx) => next[idx] === app.correct);
        setSuccess(allCorrect);
      } else {
        setCurrentIdx(currentIdx + 1);
      }
      
      return next;
    });
  };

  const resetSorter = () => {
    setCurrentIdx(0);
    setSelections({});
    setFinished(false);
    setSuccess(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#040816]/60 rounded-2xl border border-white/10 overflow-hidden text-slate-100 p-4 font-sans select-none animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3 shrink-0">
        <div>
          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">Chapter Challenge 8</span>
          <h3 className="text-xs font-bold font-mono uppercase tracking-wide text-white">Database Classification Sorter</h3>
        </div>

        <button onClick={resetSorter} className="text-[9.5px] font-mono text-slate-400 hover:text-white uppercase flex items-center gap-1 cursor-pointer">
          <RefreshCw className="w-3 h-3" /> Reset
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin flex flex-col justify-between space-y-4">
        
        {/* Progress Dots */}
        <div className="flex items-center gap-1.5 justify-center py-1">
          {APPLICATIONS.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIdx && !finished ? "w-6 bg-sky-400" :
                selections[idx] !== undefined ? "w-2.5 bg-sky-500/40" : "w-1.5 bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* Sorter Area */}
        <div className="flex-1 flex items-center justify-center min-h-[140px]">
          <AnimatePresence mode="wait">
            {!finished ? (
              <motion.div
                key={currentIdx}
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -30, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="bg-slate-950/60 border border-white/5 rounded-xl p-4 text-center font-mono space-y-2 w-full max-w-[340px]"
              >
                <span className="text-slate-500 text-[8px] uppercase tracking-wider block font-bold">
                  Card {currentIdx + 1} of 8
                </span>
                <h4 className="text-white font-extrabold text-[11.5px]">{APPLICATIONS[currentIdx].name}</h4>
                <p className="text-slate-400 text-[8.5px] leading-relaxed max-w-[300px] mx-auto uppercase">
                  {APPLICATIONS[currentIdx].desc}
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-slate-950/60 border border-white/5 rounded-xl p-4 text-center font-mono space-y-3 w-full max-w-[340px] flex flex-col items-center justify-center"
              >
                {success ? (
                  <>
                    <Award className="w-8 h-8 text-emerald-400 animate-pulse" />
                    <span className="text-emerald-400 font-extrabold text-[10px] uppercase tracking-widest block">
                      ALL CLASSIFICATIONS VALIDATED!
                    </span>
                    <div className="bg-[#051910] border border-emerald-500/20 text-emerald-400 px-3.5 py-1.5 rounded-lg text-[9px] font-extrabold font-mono tracking-widest">
                      CODE: DB:BC:NONE:BC:DB:BC:DB:BC
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-8 h-8 text-rose-500" />
                    <span className="text-rose-500 font-extrabold text-[10px] uppercase tracking-widest block">
                      MISMATCH DETECTED
                    </span>
                    <p className="text-slate-400 text-[8px] uppercase leading-relaxed max-w-[280px]">
                      One or more applications are incorrectly categorized. Review standard requirements.
                    </p>
                    <button
                      onClick={resetSorter}
                      className="px-3.5 py-1.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 font-extrabold text-[9px] tracking-wider uppercase cursor-pointer"
                    >
                      Retry Sorting
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Buttons Bar */}
        {!finished && (
          <div className="grid grid-cols-3 gap-2 shrink-0 font-mono text-[8.5px] font-bold">
            <button
              onClick={() => selectCategory("DB")}
              className="py-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              <Database className="w-3.5 h-3.5" />
              <span>DATABASE (DB)</span>
            </button>
            
            <button
              onClick={() => selectCategory("BC")}
              className="py-2.5 rounded-lg border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400 flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              <Database className="w-3.5 h-3.5" />
              <span>BLOCKCHAIN (BC)</span>
            </button>

            <button
              onClick={() => selectCategory("NONE")}
              className="py-2.5 rounded-lg border border-slate-500/20 bg-slate-500/5 hover:bg-slate-500/10 text-slate-400 flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>NO STORAGE (NONE)</span>
            </button>
          </div>
        )}

      </div>

    </div>
  );
}

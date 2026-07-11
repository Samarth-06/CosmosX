import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle2, XCircle, Shield, ShieldOff, Lightbulb, ChevronRight, ArrowRight } from "lucide-react";
import TaskWorkspaceLayout from "./TaskWorkspaceLayout";
import { saveTaskScore } from "@/lib/module1-store";

interface Props {
  onComplete: () => void;
}

type Phase = "normal" | "breach" | "investigate";

interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  unit: string;
  status: "ok" | "flagged" | "deleted";
  original?: number;
}

const ORIGINAL_TXNS: Transaction[] = [
  { id: "TX-001", from: "Station Alpha", to: "Station Beta", amount: 200, unit: "fuel", status: "ok" },
  { id: "TX-002", from: "Station Gamma", to: "Station Delta", amount: 150, unit: "fuel", status: "ok" },
  { id: "TX-003", from: "Station Beta", to: "Station Epsilon", amount: 100, unit: "fuel", status: "ok" },
];

const CORRUPTED_TXNS: Transaction[] = [
  { id: "TX-001", from: "Station Alpha", to: "Station Beta", amount: 2000, unit: "fuel", status: "flagged", original: 200 },
  { id: "TX-002", from: "Station Gamma", to: "Station Delta", amount: 150, unit: "fuel", status: "deleted", original: 150 },
  { id: "TX-003", from: "Station Beta", to: "Station Epsilon", amount: 100, unit: "fuel", status: "ok" },
];

const MCQ_Q3 = {
  question: "Why was the attacker able to modify the records undetected?",
  options: [
    "a) The database was too slow to detect changes",
    "b) There was only one copy of the data, controlled by one server",
    "c) The stations didn't have enough fuel to monitor",
    "d) The transactions were too large",
  ],
  correct: 1,
};

const MCQ_Q4 = {
  question: "How could multiple independent copies have helped?",
  options: [
    "a) More copies means more storage space",
    "b) If 10 copies exist, an attacker must compromise ALL simultaneously — practically impossible",
    "c) Multiple copies would slow down the system",
    "d) It wouldn't help at all",
  ],
  correct: 1,
};

export default function Task1_2_CorruptedServer({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>("normal");
  const [breachStep, setBreachStep] = useState(0); // 0=pre, 1=alert, 2=corrupted
  const [currentQuestion, setCurrentQuestion] = useState(0); // 0=Q3, 1=Q4
  const [q3Answer, setQ3Answer] = useState<number | null>(null);
  const [q4Answer, setQ4Answer] = useState<number | null>(null);
  const [showHint3, setShowHint3] = useState(false);
  const [showHint4, setShowHint4] = useState(false);

  // Auto-advance breach animation
  useEffect(() => {
    if (phase !== "breach") return;
    const t1 = setTimeout(() => setBreachStep(1), 800);
    const t2 = setTimeout(() => setBreachStep(2), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [phase]);

  const handleQ3 = (idx: number) => {
    if (q3Answer !== null) return;
    setQ3Answer(idx);
    setShowHint3(false);
  };

  const handleQ4 = (idx: number) => {
    if (q4Answer !== null) return;
    setQ4Answer(idx);
    setShowHint4(false);
  };

  const txns = phase === "investigate" || (phase === "breach" && breachStep === 2)
    ? CORRUPTED_TXNS
    : ORIGINAL_TXNS;

  const bothCorrect = q3Answer === MCQ_Q3.correct && q4Answer === MCQ_Q4.correct;

  return (
    <TaskWorkspaceLayout
      moduleColor="#22d3ee"
      taskTitle="Task 1.2 — The Corrupted Command Center"
      taskConcept="Single Points of Failure (SPF)"
      theoryContent={
        <div className="space-y-4 text-[11.5px] leading-relaxed text-slate-300">
          <h4 className="font-mono text-cyan-400 font-bold uppercase tracking-wider">Single Points of Failure</h4>
          <p>Centralized platforms rely on a master database hosted in a single location to coordinate logic and verify account balances.</p>
          <p>If an attacker gains administrative privileges on that system, they acquire root access to overwrite logs, delete entries, or fabricate transactions undetected.</p>
          <p>This is called a <strong>Single Point of Failure (SPF)</strong>. Once compromised, all connected nodes receive incorrect state data.</p>

          <div className="border border-white/5 bg-slate-900/40 p-2.5 rounded-lg select-none">
            <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest block mb-1">Investigation Phase</span>
            <div className="flex gap-1.5">
              {(["normal", "breach", "investigate"] as Phase[]).map((p, i) => (
                <div key={p} className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border transition-all ${
                  phase === p
                    ? i === 0 ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10" : i === 1 ? "text-rose-400 border-rose-500/40 bg-rose-500/10" : "text-amber-400 border-amber-500/40 bg-amber-500/10"
                    : "opacity-35 text-slate-500 border-white/5"
                }`}>
                  {p.toUpperCase()}
                </div>
              ))}
            </div>
          </div>

          {phase === "investigate" && (
            <div className="border border-white/5 bg-slate-900/40 p-2.5 rounded-lg select-none">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest block mb-1">Question Navigator</span>
                <div className="flex gap-1">
                  <button
                    disabled={currentQuestion === 0}
                    onClick={() => setCurrentQuestion(0)}
                    className="px-1.5 py-0.5 bg-slate-800 border border-white/5 rounded text-[8px] font-mono text-slate-400 hover:text-white disabled:opacity-30 transition"
                  >
                    ◀
                  </button>
                  <button
                    disabled={currentQuestion === 1}
                    onClick={() => setCurrentQuestion(1)}
                    className="px-1.5 py-0.5 bg-slate-800 border border-white/5 rounded text-[8px] font-mono text-slate-400 hover:text-white disabled:opacity-30 transition"
                  >
                    ▶
                  </button>
                </div>
              </div>
              <div className="flex gap-1.5 mt-1.5">
                {[0, 1].map((i) => {
                  const isCurrent = currentQuestion === i;
                  const ans = i === 0 ? q3Answer : q4Answer;
                  const isCorrect = i === 0 ? q3Answer === MCQ_Q3.correct : q4Answer === MCQ_Q4.correct;
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentQuestion(i)}
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[9px] transition-all duration-300 ${
                        isCurrent
                          ? "bg-cyan-500 text-slate-950 font-bold scale-110 shadow-lg shadow-cyan-500/20"
                          : ans !== null
                          ? isCorrect
                            ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                            : "bg-rose-500/20 border border-rose-500/30 text-rose-400"
                          : "bg-slate-800 border border-white/5 text-slate-400 hover:border-slate-500"
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      }
      challengeContent={
        <div className="space-y-4">
          {/* Server status card */}
          <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {phase === "normal" ? (
                  <Shield className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ShieldOff className="w-4 h-4 text-rose-400 animate-pulse" />
                )}
                <span className="font-mono text-[9px] font-bold text-white uppercase tracking-wider">
                  Mercury Central Database
                </span>
              </div>
              <span className={`text-[8px] font-mono px-2 py-0.5 rounded-full border ${
                phase === "normal"
                  ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                  : "text-rose-400 border-rose-500/30 bg-rose-500/10 animate-pulse"
              }`}>
                {phase === "normal" ? "● SECURE" : "[!] COMPROMISED"}
              </span>
            </div>

            {/* Breach Alert Banner */}
            <AnimatePresence>
              {phase === "breach" && breachStep >= 1 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/40 rounded-xl p-2.5"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse shrink-0" />
                  <div>
                    <p className="text-[9.5px] font-bold text-rose-400 font-mono uppercase tracking-wide">
                      [!] CRITICAL INTRUSION DETECTED
                    </p>
                    <p className="text-[8.5px] text-rose-300/80 font-mono">
                      Unauthorized admin write detected on database clusters.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Transaction Log */}
            <div>
              <p className="text-[8.5px] font-mono text-slate-500 uppercase tracking-widest block mb-2">
                Live Transaction Log
              </p>
              <div className="space-y-1.5">
                {txns.map((tx, i) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex items-center justify-between rounded-lg px-2.5 py-2 border text-[9.5px] font-mono ${
                      tx.status === "ok"
                        ? "bg-slate-950/60 border-white/5 text-slate-300"
                        : tx.status === "flagged"
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                        : "bg-slate-950/30 border-dashed border-white/10 text-slate-600 line-through"
                    }`}
                  >
                    <span className="text-slate-500">{tx.id}</span>
                    <span>{tx.from.split(" ")[1]}</span>
                    <span className="text-slate-600">➔</span>
                    <span>{tx.to.split(" ")[1]}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {tx.status === "flagged" && tx.original !== undefined && (
                        <span className="text-slate-600 line-through text-[9px]">{tx.original} {tx.unit}</span>
                      )}
                      <span className={`font-bold ${tx.status === "flagged" ? "text-rose-400" : tx.status === "deleted" ? "text-slate-600" : "text-emerald-400"}`}>
                        {tx.status === "deleted" ? "DELETED" : `${tx.amount} ${tx.unit}`}
                      </span>
                      {tx.status === "ok" && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                      {tx.status === "flagged" && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                      {tx.status === "deleted" && <XCircle className="w-3 h-3 text-slate-600" />}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      }
      labContent={
        <div className="space-y-3">
          {/* Phase Control Triggers */}
          {phase === "normal" && (
            <button
              onClick={() => { setPhase("breach"); setBreachStep(0); }}
              className="w-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-400 font-bold py-2 rounded-full text-[10px] font-rushblade tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md"
            >
              <AlertTriangle className="w-3.5 h-3.5 animate-pulse" /> Simulate Database Breach
            </button>
          )}

          {phase === "breach" && breachStep < 2 && (
            <div className="bg-slate-900/60 p-3.5 border border-white/10 rounded-xl text-center">
              <span className="w-3 h-3 rounded-full border-2 border-rose-500 border-t-transparent animate-spin inline-block mr-2" />
              <span className="text-[10px] font-mono text-rose-400">INTRUDER OVERWRITING DATABASE RECORDS...</span>
            </div>
          )}

          {phase === "breach" && breachStep === 2 && (
            <button
              onClick={() => setPhase("investigate")}
              className="w-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-400 font-bold py-2 rounded-full text-[10px] font-rushblade tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md"
            >
              Start Security Investigation ➔
            </button>
          )}

          {/* Investigation MCQ Inputs */}
          <AnimatePresence mode="wait">
            {phase === "investigate" && (
              <motion.div key={currentQuestion} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                {currentQuestion === 0 ? (
                  /* Q3 Block */
                  <div className="bg-slate-900/50 border border-white/10 rounded-xl p-3 space-y-2.5">
                    <p className="text-[10.5px] font-medium text-white font-sans">{MCQ_Q3.question}</p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {MCQ_Q3.options.map((opt, i) => {
                        let cls = "bg-slate-900 border-white/10 text-slate-300 hover:border-cyan-500/30";
                        if (q3Answer !== null) {
                          if (i === MCQ_Q3.correct) cls = "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold";
                          else if (i === q3Answer) cls = "bg-rose-500/15 border-rose-500/40 text-rose-300";
                          else cls = "bg-slate-900/30 border-white/5 text-slate-600 opacity-50";
                        }
                        return (
                          <button
                            key={i}
                            onClick={() => handleQ3(i)}
                            disabled={q3Answer !== null}
                            className={`w-full text-left border rounded-lg px-2.5 py-1.5 text-[9.5px] font-mono transition-all ${cls}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {q3Answer !== null && (
                      <p className={`text-[9px] font-mono ${q3Answer === MCQ_Q3.correct ? "text-emerald-400" : "text-amber-400"}`}>
                        {q3Answer === MCQ_Q3.correct
                          ? "✓ Correct! One single host database copy means one exploit breaches it all. Toggle to Question 2 in the Navigator to continue."
                          : "✗ Wrong copy. Focus on the centralized layout of database records."}
                      </p>
                    )}
                    {q3Answer !== null && q3Answer !== MCQ_Q3.correct && (
                      <div className="space-y-1">
                        <button
                          onClick={() => setShowHint3(true)}
                          className="w-full flex justify-between items-center px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-[8px] text-amber-400 font-mono hover:bg-amber-500/15"
                        >
                          <span>Need a hint?</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                        {showHint3 && (
                          <div className="bg-amber-950/20 border border-amber-500/25 p-2 rounded text-[8.5px] text-amber-300 leading-relaxed font-mono">
                            Hint: If the database records exist in only one place, who can change them when the admin keys are stolen?
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Q4 Block */
                  <div className="bg-slate-900/50 border border-white/10 rounded-xl p-3 space-y-2.5">
                    <p className="text-[10.5px] font-medium text-white font-sans">{MCQ_Q4.question}</p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {MCQ_Q4.options.map((opt, i) => {
                        let cls = "bg-slate-900 border-white/10 text-slate-300 hover:border-cyan-500/30";
                        if (q4Answer !== null) {
                          if (i === MCQ_Q4.correct) cls = "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold";
                          else if (i === q4Answer) cls = "bg-rose-500/15 border-rose-500/40 text-rose-300";
                          else cls = "bg-slate-900/30 border-white/5 text-slate-600 opacity-50";
                        }
                        return (
                          <button
                            key={i}
                            onClick={() => handleQ4(i)}
                            disabled={q4Answer !== null}
                            className={`w-full text-left border rounded-lg px-2.5 py-1.5 text-[9.5px] font-mono transition-all ${cls}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {q4Answer !== null && (
                      <p className={`text-[9px] font-mono ${q4Answer === MCQ_Q4.correct ? "text-emerald-400" : "text-amber-400"}`}>
                        {q4Answer === MCQ_Q4.correct
                          ? "✓ Correct! Multiple distributed copies prevent single servers from falsifying ledger histories."
                          : "✗ Wrong consensus concept. Focus on the difficulty of attacking multiple systems simultaneously."}
                      </p>
                    )}
                    {q4Answer !== null && q4Answer !== MCQ_Q4.correct && (
                      <div className="space-y-1">
                        <button
                          onClick={() => setShowHint4(true)}
                          className="w-full flex justify-between items-center px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-[8px] text-amber-400 font-mono hover:bg-amber-500/15"
                        >
                          <span>Need a hint?</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                        {showHint4 && (
                          <div className="bg-amber-950/20 border border-amber-500/25 p-2 rounded text-[8.5px] text-amber-300 leading-relaxed font-mono">
                            Hint: How easy is it for a hacker to breach 100 computers in 100 countries at the exact same millisecond?
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Debrief + Complete */}
                {bothCorrect && (
                  <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-3.5 space-y-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Security Verification Success</span>
                    </div>
                    <p className="text-[10.5px] text-slate-300 leading-relaxed font-sans">
                      <span className="text-amber-400 font-mono font-bold">DEBRIEF: </span>
                      When one server controls all the records, one breach destroys everything. Blockchain's answer?
                      Store identical copies across thousands of independent computers. To corrupt the record,
                      an attacker would need to compromise the <span className="text-cyan-400 font-bold font-mono">MAJORITY of the entire network simultaneously</span> — practically impossible.
                    </p>
                    <button
                      onClick={() => { saveTaskScore("task1_2", 10, 10, true); onComplete(); }}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-full text-[10px] font-rushblade shadow-md transition uppercase tracking-wider flex items-center justify-center gap-1"
                    >
                      Proceed to Task 1.3 <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      }
    />
  );
}

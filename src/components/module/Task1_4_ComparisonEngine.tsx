import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle2, XCircle, WifiOff, Wifi, Lightbulb, ChevronRight, ArrowRight, Server, PowerOff, Radio } from "lucide-react";
import TaskWorkspaceLayout from "./TaskWorkspaceLayout";
import { saveTaskScore } from "@/lib/module1-store";

interface Props {
  onComplete: () => void;
}

type Step = 1 | 2 | 3 | "quiz" | "done";

const TRANSACTIONS = [
  { id: "TX-1", from: "Station Alpha", to: "Station Beta", amount: 100, unit: "fuel" },
  { id: "TX-2", from: "Station Gamma", to: "Station Delta", amount: 50, unit: "fuel" },
  { id: "TX-3", from: "Station Beta", to: "Station Epsilon", amount: 75, unit: "fuel" },
];

const QUIZZES = [
  {
    q: "After the modification attack, which system was successfully compromised?",
    opts: ["Distributed Ledger", "Centralized Database", "Both equally", "Neither"],
    correct: 1,
    explain: "The centralized database was silently modified without notice. The distributed system rejected the rogue node change.",
  },
  {
    q: "After a node went offline, which system continued operating normally?",
    opts: ["Centralized Database", "Neither — both crashed", "Distributed Ledger", "Both — they recovered instantly"],
    correct: 2,
    explain: "The distributed ledger lost 1 of 5 nodes. The remaining 4 kept operating. Centralized system suffered complete service blackout.",
  },
  {
    q: "In a 5-node distributed system, how many nodes must an attacker compromise to alter a record?",
    opts: ["1 node", "2 nodes", "3 nodes", "All 5 nodes"],
    correct: 2,
    explain: "Attacker needs a majority — more than half — which is 3 out of 5 nodes. This is the basis of a '51% attack' threat model.",
  },
];

export default function Task1_4_ComparisonEngine({ onComplete }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [currentQuestion, setCurrentQuestion] = useState(0); // 0, 1, 2
  const [answers, setAnswers] = useState<(number | null)[]>([null, null, null]);
  const [attackStarted, setAttackStarted] = useState(false);
  const [offlineStarted, setOfflineStarted] = useState(false);
  const [showHintQuiz, setShowHintQuiz] = useState<Record<number, boolean>>({});

  const allAnswered = answers.every((a) => a !== null);
  const allCorrect = answers.every((a, i) => a === QUIZZES[i].correct);

  const handleAnswer = (qIdx: number, aIdx: number) => {
    if (answers[qIdx] !== null) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[qIdx] = aIdx;
      return next;
    });
    setShowHintQuiz((prev) => ({ ...prev, [qIdx]: false }));
  };

  const nodes = [1, 2, 3, 4, 5];

  const getQuizHint = (idx: number) => {
    switch (idx) {
      case 0: return "Hint: Check the transactions status list. Which database accepted the 500 fuel tampering?";
      case 1: return "Hint: Centralized hosts have only 1 main server copy. Distributed ledgers have 5.";
      case 2: return "Hint: Central systems require 1 point of compromise. Distributed grids require a majority (more than 50%).";
      default: return "";
    }
  };

  return (
    <TaskWorkspaceLayout
      moduleColor="#22d3ee"
      taskTitle="Task 1.4 — Centralized vs Distributed"
      taskConcept="Comparing structural resilience"
      theoryContent={
        <div className="space-y-4 text-[11.5px] leading-relaxed text-slate-300">
          <h4 className="font-mono text-cyan-400 font-bold uppercase tracking-wider">Centralized vs Distributed</h4>
          <p>Traditional networks operate on client-server protocols. The clients query database requests to a central server holding all states. This provides low latency, but high vulnerability to structural exploits and total service outages.</p>
          <p><strong>Distributed Ledgers</strong> distribute identical database states across a network of nodes. Transaction consensus requires nodes to verify entries cooperatively.</p>
          <p>While consensus decreases transaction processing speed, it delivers complete service redundancy and cryptographically verified integrity.</p>

          {step === "quiz" && (
            <div className="border border-white/5 bg-slate-900/40 p-2.5 rounded-lg select-none">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest block mb-1">Question Navigator</span>
                <div className="flex gap-1">
                  <button
                    disabled={currentQuestion === 0}
                    onClick={() => setCurrentQuestion((c) => c - 1)}
                    className="px-1.5 py-0.5 bg-slate-800 border border-white/5 rounded text-[8px] font-mono text-slate-400 hover:text-white disabled:opacity-30 transition"
                  >
                    ◀
                  </button>
                  <button
                    disabled={currentQuestion === QUIZZES.length - 1}
                    onClick={() => setCurrentQuestion((c) => c + 1)}
                    className="px-1.5 py-0.5 bg-slate-800 border border-white/5 rounded text-[8px] font-mono text-slate-400 hover:text-white disabled:opacity-30 transition"
                  >
                    ▶
                  </button>
                </div>
              </div>
              <div className="flex gap-1.5 mt-1.5">
                {QUIZZES.map((_, i) => {
                  const isCurrent = currentQuestion === i;
                  const ans = answers[i];
                  const isCorrect = ans === QUIZZES[i].correct;
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
        <div className="space-y-3">
          <div className="space-y-3">
            <div className="bg-slate-950/80 border border-rose-500/20 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] font-mono text-rose-400 font-bold uppercase tracking-wider">Central Server</span>
                <span className={`text-[8px] font-mono px-2 py-0.5 rounded ${offlineStarted ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
                  {offlineStarted ? "OFFLINE" : "ONLINE"}
                </span>
              </div>
              <div className="bg-slate-900/60 rounded-xl p-2.5 text-center border border-white/5 flex flex-col items-center">
                <Server className="w-6 h-6 text-rose-400 mb-1" />
                <p className="text-[10px] font-mono text-slate-400">Single Datacenter</p>
              </div>

              <div className="space-y-1">
                {TRANSACTIONS.map((tx, i) => {
                  const isCorrupted = attackStarted && i === 1;
                  return (
                    <div
                      key={tx.id}
                      className={`flex items-center justify-between rounded-lg px-2.5 py-1 border text-[9.5px] font-mono ${
                        isCorrupted ? "bg-rose-500/10 border-rose-500/25 text-rose-300" : "bg-slate-900/40 border-white/5 text-slate-400"
                      }`}
                    >
                      <span className="text-slate-600">{tx.id}</span>
                      <span className={isCorrupted ? "text-rose-400 font-bold" : ""}>
                        {isCorrupted ? "500 fuel [!]" : `${tx.amount} ${tx.unit}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-950/80 border border-cyan-500/20 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] font-mono text-cyan-400 font-bold uppercase tracking-wider">Distributed Ledger Network</span>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-mono px-2 py-0.5 rounded">
                  {offlineStarted ? "4/5 CONSENSUS" : "5/5 CONSENSUS"}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2 select-none">
                {nodes.map((n) => {
                  const isOffline = offlineStarted && n === 2;
                  const isAttacked = attackStarted && n === 2;
                  return (
                    <div
                      key={n}
                      className={`rounded-xl border p-2 text-center font-mono text-[9px] flex flex-col items-center justify-between min-h-[56px] transition ${
                        isOffline
                          ? "bg-slate-900/20 border-white/5 text-slate-600"
                          : isAttacked
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                          : "bg-slate-900/60 border-cyan-500/20 text-cyan-300"
                      }`}
                    >
                      <div className="mb-1">
                        {isOffline ? (
                          <PowerOff className="w-3.5 h-3.5 text-slate-600" />
                        ) : (
                          <Radio className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                      </div>
                      <p className="font-bold">N0{n}</p>
                      {isAttacked && <p className="text-[7.5px] text-rose-400 font-bold">✗ REJ</p>}
                      {isOffline && <p className="text-[7.5px] text-slate-500">OFF</p>}
                    </div>
                  );
                })}
              </div>

              <div className="space-y-1">
                {TRANSACTIONS.map((tx, i) => {
                  const isRejected = attackStarted && i === 1;
                  return (
                    <div
                      key={tx.id}
                      className={`flex items-center justify-between rounded-lg px-2.5 py-1 border text-[9.5px] font-mono ${
                        isRejected ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300" : "bg-slate-900/40 border-white/5 text-slate-400"
                      }`}
                    >
                      <span className="text-slate-600">{tx.id}</span>
                      <span className={isRejected ? "text-emerald-400 font-bold" : ""}>
                        {isRejected ? `${tx.amount} ${tx.unit} ✓` : `${tx.amount} ${tx.unit}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      }
      labContent={
        <div className="space-y-3">
          {step !== "quiz" && (
            <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3.5 space-y-3">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">Simulator Controller</span>
              {step === 1 && (
                <div className="space-y-2.5">
                  <p className="text-[10px] text-slate-400 font-mono">Both systems process the initial 3 transactions normally.</p>
                  <button
                    onClick={() => setStep(2)}
                    className="w-full inline-flex items-center justify-center gap-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-400 font-bold py-1.5 rounded-full text-[10px] font-mono transition cursor-pointer"
                  >
                    <span>Simulate Database Tamper Attack</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
              {step === 2 && (
                <div className="space-y-2.5">
                  <p className="text-[10px] text-slate-400 font-mono">Attacker targets TX-2 on both databases simultaneously (changes amount from 50 to 500).</p>
                  <button
                    onClick={() => { setAttackStarted(true); setStep(3); }}
                    className="w-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-400 font-bold py-1.5 rounded-full text-[10px] font-mono transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                    <span>Execute Attack</span>
                  </button>
                </div>
              )}
              {step === 3 && (
                <div className="space-y-2.5">
                  <p className="text-[10px] text-slate-400 font-mono">Simulate a hardware server crash on Central server and Node 2 simultaneously.</p>
                  <button
                    onClick={() => { setOfflineStarted(true); setStep("quiz"); }}
                    className="w-full inline-flex items-center justify-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-400 font-bold py-1.5 rounded-full text-[10px] font-mono transition cursor-pointer"
                  >
                    <span>Trigger Hardware Offline Failure</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === "quiz" && (
              <motion.div key={currentQuestion} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                {(() => {
                  const quiz = QUIZZES[currentQuestion];
                  const ans = answers[currentQuestion];
                  const showHint = showHintQuiz[currentQuestion] || false;
                  return (
                    <div className="bg-slate-900/50 border border-white/10 rounded-xl p-3 space-y-2.5">
                      <p className="text-[10.5px] font-medium text-white font-sans">{quiz.q}</p>
                      <div className="grid grid-cols-1 gap-1.5">
                        {quiz.opts.map((opt, aIdx) => {
                          let cls = "bg-slate-900 border-white/10 text-slate-300 hover:border-cyan-500/30";
                          if (ans !== null) {
                            if (aIdx === quiz.correct) cls = "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold";
                            else if (aIdx === ans) cls = "bg-rose-500/15 border-rose-500/40 text-rose-300";
                            else cls = "bg-slate-900/30 border-white/5 text-slate-600 opacity-50";
                          }
                          return (
                            <button
                              key={aIdx}
                              onClick={() => handleAnswer(currentQuestion, aIdx)}
                              disabled={ans !== null}
                              className={`w-full text-left border rounded-lg px-2.5 py-1.5 text-[9.5px] font-mono transition-all ${cls}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {ans !== null && (
                        <p className={`text-[9px] font-mono ${ans === quiz.correct ? "text-emerald-400" : "text-amber-400"}`}>
                          {ans === quiz.correct ? `✓ Correct! ${quiz.explain} Toggle to the next question in the Navigator to continue.` : "✗ Incorrect logic. Reevaluate the network parameters."}
                        </p>
                      )}

                      {ans !== null && ans !== quiz.correct && (
                        <div className="space-y-1">
                          <button
                            onClick={() => setShowHintQuiz((prev) => ({ ...prev, [currentQuestion]: true }))}
                            className="w-full flex justify-between items-center px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-[8px] text-amber-400 font-mono hover:bg-amber-500/15"
                          >
                            <span>Need a hint?</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                          {showHint && (
                            <div className="bg-amber-950/20 border border-amber-500/25 p-2 rounded text-[8.5px] text-amber-300 leading-relaxed font-mono">
                              {getQuizHint(currentQuestion)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {allAnswered && allCorrect && (
                  <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-3.5 space-y-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Comparison Matrix Verified</span>
                    </div>
                    <p className="text-[10.5px] text-slate-300 leading-relaxed font-sans">
                      <span className="text-amber-400 font-mono font-bold">DEBRIEF: </span>
                      Blockchain is not about raw database transaction throughput speed — centralized databases will always remain faster. It is about <strong>resilience and trust</strong>. A distributed ledger database survives node intrusions that would compromise single central databases.
                    </p>
                    <button
                      onClick={() => { saveTaskScore("task1_4", 10, 10, true); onComplete(); }}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-full text-[10px] font-rushblade shadow-md transition uppercase tracking-wider flex items-center justify-center gap-1"
                    >
                      Proceed to Task 1.5 <ArrowRight className="w-3.5 h-3.5" />
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

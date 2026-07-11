import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ShieldAlert, Timer } from "lucide-react";

interface FinalChallengeProps {
  onComplete: () => void;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIdx: number;
  explanation: string;
}

export default function FinalChallenge({ onComplete }: FinalChallengeProps) {
  const [activeQ, setActiveQ] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isChallengeDone, setIsChallengeDone] = useState(false);
  const [timer, setTimer] = useState(60);

  const questions: Question[] = [
    {
      id: 1,
      question: "Which of the following describes a centralized system?",
      options: [
        "A system where all nodes hold identical copies and write records jointly.",
        "A system controlled by a single trusted authority or organization that manages the database.",
        "A system that cannot fail under any circumstances.",
      ],
      correctIdx: 1,
      explanation: "Centralized systems are governed by a single authority (like a bank or university) who has total control over data read/write states.",
    },
    {
      id: 2,
      question: "What is a single point of failure in a network?",
      options: [
        "A connection error between two independent spacecraft.",
        "A configuration where one server failure takes down the entire system or corrupts all state.",
        "A bug in PostgreSQL that causes transaction records to duplicate.",
      ],
      correctIdx: 1,
      explanation: "If a system relies on a single central database, that central server constitutes a single point of failure. If it goes offline, the whole network stops.",
    },
    {
      id: 3,
      question: "Why can't we simply use MySQL/PostgreSQL for everything?",
      options: [
        "MySQL/PostgreSQL are outdated and shouldn't be used by modern organizations.",
        "Traditional databases are excellent when a trusted central authority exists; blockchain becomes relevant when multiple parties need shared and verifiable records without depending entirely on a central intermediary.",
        "MySQL does not support encrypted signatures or transaction data.",
      ],
      correctIdx: 1,
      explanation: "Traditional databases are faster and highly efficient when a trusted system owner exists. Blockchain is deployed specifically to remove dependence on a central authority when sharing records.",
    },
  ];

  // 60-second timer countdown
  useEffect(() => {
    if (isChallengeDone || timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, isChallengeDone]);

  const handleOptionSelect = (idx: number) => {
    if (selectedOpt !== null) return; // Answered already
    setSelectedOpt(idx);
    const correct = idx === questions[activeQ].correctIdx;
    setIsCorrect(correct);

    if (correct) {
      setTimeout(() => {
        if (activeQ < questions.length - 1) {
          setActiveQ(activeQ + 1);
          setSelectedOpt(null);
          setIsCorrect(null);
        } else {
          setIsChallengeDone(true);
        }
      }, 2000);
    } else {
      // Allow retry after 1.5 seconds
      setTimeout(() => {
        setSelectedOpt(null);
        setIsCorrect(null);
      }, 1500);
    }
  };

  const activeQuestion = questions[activeQ];

  return (
    <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-2xl relative">
      {/* Timer Bar */}
      <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
          <span className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest font-bold">Systems Certification Challenge</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-950/20 px-2 py-0.5 rounded border border-amber-500/20">
          <Timer className="w-3.5 h-3.5" />
          <span>{timer > 0 ? `${timer}s remaining` : "Time Expired"}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isChallengeDone && timer > 0 ? (
          <motion.div
            key={activeQ}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center">
              <span className="font-mono text-[9px] text-muted-foreground uppercase">Evaluator Terminal: Question {activeQ + 1} of 3</span>
            </div>
            <h3 className="text-sm font-bold text-white leading-relaxed">{activeQuestion.question}</h3>

            <div className="space-y-2 pt-2">
              {activeQuestion.options.map((option, idx) => {
                let btnStyle = "border-white/10 bg-slate-900/50 hover:bg-slate-900 hover:border-white/20 text-slate-300";
                if (selectedOpt === idx) {
                  btnStyle = isCorrect
                    ? "border-emerald-500 bg-emerald-950/20 text-emerald-400 font-bold"
                    : "border-rose-500 bg-rose-950/20 text-rose-400 font-bold";
                }

                return (
                  <button
                    key={idx}
                    disabled={selectedOpt !== null}
                    onClick={() => handleOptionSelect(idx)}
                    className={`w-full text-left px-4 py-3 rounded-lg border text-xs transition-all leading-normal flex justify-between items-center ${btnStyle}`}
                  >
                    <span>{option}</span>
                    {selectedOpt === idx && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation box */}
            {selectedOpt !== null && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded text-[10px] font-mono leading-relaxed border ${
                  isCorrect
                    ? "bg-emerald-950/10 border-emerald-500/20 text-emerald-400"
                    : "bg-rose-950/10 border-rose-500/20 text-rose-400"
                }`}
              >
                {isCorrect ? `✓ CORRECT: ${activeQuestion.explanation}` : "✗ INCORRECT. Re-calibrating systems, try again..."}
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6 space-y-5"
          >
            {timer <= 0 && !isChallengeDone ? (
              <>
                <h3 className="text-lg font-bold text-rose-400 uppercase tracking-widest font-mono">EVALUATION FAILED</h3>
                <p className="text-xs text-muted-foreground">Time expired during systems check. Recalibrate core processors and try again.</p>
                <button
                  onClick={() => {
                    setActiveQ(0);
                    setSelectedOpt(null);
                    setIsCorrect(null);
                    setIsChallengeDone(false);
                    setTimer(60);
                  }}
                  className="bg-rose-500 text-white font-mono px-4 py-2 rounded text-xs hover:bg-rose-400 transition"
                >
                  Restart Challenge
                </button>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-6 h-6 animate-bounce" />
                </div>
                <h3 className="text-lg font-bold text-emerald-400 uppercase tracking-widest font-mono">MISSION COMPLETE</h3>
                
                <div className="max-w-xs mx-auto border border-white/5 bg-slate-950/40 p-4 rounded-xl font-mono text-[10px] text-left space-y-2">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>CENTRALIZATION PROBLEM</span>
                    <span className="text-emerald-400 font-bold">✓ VERIFIED</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>SINGLE POINT OF FAILURE</span>
                    <span className="text-emerald-400 font-bold">✓ VERIFIED</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>TRUST PROBLEM</span>
                    <span className="text-emerald-400 font-bold">✓ VERIFIED</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>REPLICATED RECORDS</span>
                    <span className="text-emerald-400 font-bold">✓ VERIFIED</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>BLOCKCHAIN PURPOSE</span>
                    <span className="text-emerald-400 font-bold">✓ VERIFIED</span>
                  </div>
                </div>

                <button
                  onClick={onComplete}
                  className="bg-linear-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold px-6 py-3 rounded-full text-xs shadow-lg hover:shadow-emerald-500/20 transition-all uppercase tracking-wider font-mono"
                >
                  Claim Launch Platform Part ➔
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

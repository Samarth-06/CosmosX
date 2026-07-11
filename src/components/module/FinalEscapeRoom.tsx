import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Clock, Play, ArrowRight, ShieldCheck, Flame, Rocket, ChevronRight } from "lucide-react";
import { MERCURY_FINAL_CHALLENGES } from "@/lib/mercury-curriculum";

interface Props {
  onComplete: () => void;
}

export default function FinalEscapeRoom({ onComplete }: Props) {
  const [activeStep, setActiveStep] = useState(0); // 0 to 9 for 10 challenges
  const [timeLeft, setTimeLeft] = useState(900); // 15:00 minutes
  const [isFailure, setIsFailure] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [errorShake, setErrorShake] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [countdown, setCountdown] = useState(3);
  
  // Timer countdown
  useEffect(() => {
    if (isSuccess || isFailure) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsFailure(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSuccess, isFailure]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const currentChallenge = MERCURY_FINAL_CHALLENGES[activeStep];

  const handleChoiceSubmit = (choice: string) => {
    if (choice === currentChallenge.correctAnswer) {
      advanceStep();
    } else {
      triggerError();
    }
  };

  const handleTextSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const formattedInput = textInput.trim().toLowerCase().replace(/\s+/g, "");
    const formattedCorrect = currentChallenge.correctAnswer.toLowerCase().replace(/\s+/g, "");

    if (formattedInput === formattedCorrect) {
      setTextInput("");
      advanceStep();
    } else {
      triggerError();
    }
  };

  const advanceStep = () => {
    if (activeStep < MERCURY_FINAL_CHALLENGES.length - 1) {
      setActiveStep((prev) => prev + 1);
    } else {
      setIsSuccess(true);
    }
  };

  const triggerError = () => {
    setErrorShake(true);
    setTimeout(() => setErrorShake(false), 500);
    // Deduct 30 seconds penalty for incorrect answers!
    setTimeLeft((prev) => Math.max(10, prev - 30));
  };

  const handleRetry = () => {
    setActiveStep(0);
    setTimeLeft(900);
    setIsFailure(false);
    setIsSuccess(false);
    setTextInput("");
  };

  const startLaunchSequence = () => {
    setIsLaunching(true);
    const countInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countInterval);
          // Wait briefly then complete
          setTimeout(() => {
            onComplete();
          }, 1200);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const calculatedScore = Math.max(200, 1000 - (900 - timeLeft) + (timeLeft * 0.5));

  return (
    <div className="bg-slate-950/60 border border-red-500/20 rounded-2xl p-4 lg:p-6 backdrop-blur-md shadow-2xl flex flex-col justify-between min-h-0 flex-1 overflow-hidden">
      {/* 1. FAILURE PANEL */}
      {isFailure && (
        <div className="flex flex-col items-center justify-center text-center space-y-6 py-12">
          <AlertTriangle className="w-16 h-16 text-rose-500 animate-pulse" />
          <h2 className="font-rushblade text-rose-500 text-lg tracking-widest uppercase">
            ❌ SYSTEM SHIELD COLLAPSE
          </h2>
          <p className="text-xs text-slate-300 max-w-md leading-relaxed">
            Mercury's solar radiation has overwhelmed the core database synchronization matrix before all repairs could seal. The rocket control networks remain offline.
          </p>
          <button
            onClick={handleRetry}
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-3 rounded-full text-xs font-rushblade tracking-wider transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]"
          >
            Re-Initialize Core Systems ➔
          </button>
        </div>
      )}

      {/* 2. SUCCESS ENGINE ASSEMBLY & LAUNCH PANEL */}
      {isSuccess && !isLaunching && (
        <div className="flex flex-col items-center justify-center text-center space-y-6 py-4">
          <ShieldCheck className="w-14 h-14 text-emerald-400 animate-bounce" />
          <h2 className="font-rushblade text-emerald-400 text-base lg:text-lg tracking-widest uppercase">
            🎉 MISSION SECURE: ROCKET COMPLETED
          </h2>
          <p className="text-[11px] text-slate-300 max-w-md leading-relaxed">
            All database links have been sealed. Gossip protocols are active and validator nodes are reporting consensus agreement across all communication grids.
          </p>

          <div className="bg-slate-900/60 border border-white/5 p-4 rounded-xl max-w-sm w-full space-y-2 select-none font-mono">
            <div className="flex justify-between text-[10px] border-b border-white/5 pb-1">
              <span className="text-slate-400">ESCAPE RUN TIME:</span>
              <span className="text-white font-bold">{formatTime(900 - timeLeft)}</span>
            </div>
            <div className="flex justify-between text-[10px] border-b border-white/5 pb-1">
              <span className="text-slate-400">TIME REMAINING:</span>
              <span className="text-white font-bold">{formatTime(timeLeft)}</span>
            </div>
            <div className="flex justify-between text-[10px] text-cyan-400 font-bold">
              <span>FINAL SCORE:</span>
              <span>{Math.round(calculatedScore)} PTS</span>
            </div>
          </div>

          <button
            onClick={startLaunchSequence}
            className="bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold px-8 py-3.5 rounded-full text-xs font-rushblade tracking-widest uppercase transition-all shadow-[0_0_25px_rgba(16,185,129,0.45)] hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Rocket className="w-4 h-4 shrink-0 -rotate-45" />
            <span>Initiate Rocket Launch Sequence</span>
          </button>
        </div>
      )}

      {/* 3. ACTIVE IGNITING SEQUENCE PANEL */}
      {isSuccess && isLaunching && (
        <div className="flex flex-col items-center justify-center text-center space-y-8 py-14">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [-1, 1, -1] }}
            transition={{ repeat: Infinity, duration: 0.15 }}
            className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-full"
          >
            <Rocket className="w-16 h-16 text-orange-500 -rotate-45" />
          </motion.div>
          <div className="space-y-2">
            <h1 className="font-rushblade text-4xl font-extrabold text-white tracking-widest scale-110">
              {countdown > 0 ? countdown : "IGNITION!"}
            </h1>
            <p className="font-mono text-[9px] text-orange-400 font-bold uppercase tracking-wider animate-pulse">
              Propellant system fanning... preparing orbital trajectory calculations
            </p>
          </div>
        </div>
      )}

      {/* 4. ACTIVE ESCAPE ROOM PUMP */}
      {!isFailure && !isSuccess && (
        <div className="flex flex-col justify-between flex-1 min-h-0">
          {/* Timed Emergency HUD */}
          <div className="flex justify-between items-center border-b border-red-500/15 bg-red-950/20 p-2.5 rounded-lg select-none shrink-0 mb-4">
            <div className="flex items-center gap-2 text-[10px] font-mono text-rose-400 font-bold tracking-wider">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
              <span>MERCURY ESCAPE GRID DEGRADATION</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-white bg-slate-950/80 px-3 py-1 rounded border border-white/10">
              <Clock className="w-3.5 h-3.5 text-rose-400" />
              <span className={timeLeft < 180 ? "text-rose-500 animate-pulse font-extrabold" : "text-slate-200"}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {/* Active Question Box */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">
            <div className="border-l-2 border-red-500 pl-3">
              <span className="font-mono text-[9px] text-rose-400 font-bold uppercase tracking-widest">
                CHALLENGE 0{activeStep + 1} / 10
              </span>
              <h3 className="font-rushblade text-white text-xs lg:text-sm tracking-wider uppercase mt-0.5">
                {currentChallenge.title}
              </h3>
              <p className="text-[11px] text-slate-300 mt-2 whitespace-pre-line leading-relaxed select-text">
                {currentChallenge.setupText}
              </p>
            </div>

            {/* Input widgets depending on type */}
            <motion.div
              animate={errorShake ? { x: [-10, 10, -10, 10, 0] } : {}}
              className="bg-slate-900/40 border border-white/5 rounded-xl p-3.5 flex flex-col justify-center select-none"
            >
              <span className="text-[11px] font-sans font-bold text-slate-200 mb-3 block">
                {currentChallenge.question}
              </span>

              {/* A. MULTIPLE CHOICE SELECTOR */}
              {currentChallenge.type === "choice" && (
                <div className="grid grid-cols-1 gap-2">
                  {currentChallenge.choices?.map((choice, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleChoiceSubmit(choice)}
                      className="w-full text-left bg-slate-950/60 hover:bg-slate-950/90 border border-white/10 hover:border-red-500/30 p-2.5 rounded-lg text-[10.5px] font-sans text-slate-300 hover:text-white transition flex items-center justify-between"
                    >
                      <span>{choice}</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* B. TERMINAL TEXT FORM SUBMITTER */}
              {currentChallenge.type === "text" && (
                <form onSubmit={handleTextSubmit} className="space-y-3">
                  {currentChallenge.id === 4 && (
                    <div className="bg-slate-950/60 font-mono text-[8px] sm:text-[9.5px] text-rose-400 border border-red-500/10 p-2.5 rounded-lg max-h-[80px] overflow-y-auto mb-2 select-text">
                      Expected Output hash format: first 8 chars e.g. a9b8e2f1
                    </div>
                  )}
                  {currentChallenge.id === 10 && (
                    <div className="bg-slate-950/60 font-mono text-[8px] sm:text-[9.5px] text-rose-400 border border-red-500/10 p-2.5 rounded-lg max-h-[80px] overflow-y-auto mb-2 select-text">
                      Expected Output hash format: first 8 chars e.g. e527a8f1
                    </div>
                  )}

                  <div className="flex gap-2 select-text">
                    <input
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Input flag code response..."
                      className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono placeholder-slate-700 focus:outline-hidden focus:border-red-500"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="bg-rose-900/60 hover:bg-rose-900 border border-rose-500/30 text-white font-bold px-4 py-2 rounded-lg text-xs font-rushblade transition"
                    >
                      TRANSMIT
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>

          {/* Footer stats */}
          <div className="border-t border-white/5 pt-3 mt-4 text-[9px] text-muted-foreground font-mono flex justify-between select-none">
            <span>SECURE SYSTEM DECRYPTION ACTIVE</span>
            <span>WARNING: INCORRECT ANSWERS DEDUCT 30s PENALTY</span>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ChevronRight, ArrowRight, Trophy, Star, Shield, AlertTriangle, Zap, Lock, Orbit, RotateCcw } from "lucide-react";
import { saveTaskScore } from "@/lib/module1-store";

/* ─────────────────────────────────────────────
   TYPES & CONSTANTS
───────────────────────────────────────────── */

type Step = "theory" | "demo" | "quiz" | "game" | "complete";

interface SidebarTask {
  id: Step;
  label: string;
  hint: string;
  icon: string;
}

const SIDEBAR_TASKS: SidebarTask[] = [
  { id: "theory", label: "Core Theory", hint: "Understand the trust barter deadlock and escrow solutions.", icon: "📖" },
  { id: "demo", label: "Trade Sandbox", hint: "Toggle shipping methods. Simulate default defaults or escrow fees.", icon: "🔬" },
  { id: "quiz", label: "Knowledge Check", hint: "Answer 3 questions. Score at least 2 correct to unlock the barter game.", icon: "❓" },
  { id: "game", label: "Barter Dilemma Solver", hint: "Solve Orion vs Vega rounds to secure trustless exchanges.", icon: "⚔️" },
];

const STEP_ORDER: Step[] = ["theory", "demo", "quiz", "game", "complete"];

const QUIZ_QUESTIONS = [
  {
    q: "In trade without an intermediary, what is the core trust deadlock?",
    options: [
      "The shipping distance is too far across the galaxy.",
      "The party that sends their asset first bears 100% of the default risk.",
      "Neither party knows the price of their own asset.",
      "Customs checkpoints require manual entry verification.",
    ],
    correct: 1,
    explanation: "Correct! Without trust, whoever ships cargo first assumes all risk of counterparty default.",
  },
  {
    q: "How does a centralized escrow agent solve the barter deadlock?",
    options: [
      "By charging low interest rates on trade loans.",
      "By taking custody of both assets first, then distributing them only when compliance is met.",
      "By forcing Orion and Vega to sign physical contracts.",
      "By tracking cargo positions with space radar.",
    ],
    correct: 1,
    explanation: "Correct! The escrow broker sits in the middle, collects both shipments, verifies compliance, and routes them to clear the deadlock.",
  },
  {
    q: "What is the primary risk of using a central escrow broker?",
    options: [
      "The assets automatically double in size.",
      "They act as a centralized checkpoint that can freeze transactions, crash, or charge high rent.",
      "The cargo loses engine fuel during holding.",
      "Clients cannot check if their shipment arrived.",
    ],
    correct: 1,
    explanation: "Absolutely! Intermediaries extract fees, delay settlement, and pose a single security breach point.",
  },
];

const WEAKNESS_OPTIONS = [
  { id: "a", text: "The intermediary charges fees that are too high" },
  { id: "b", text: "The process takes too long (3 days instead of instant)" },
  { id: "c", text: "The Central Authority itself is a single point of failure — it can freeze, crash, or be corrupt", correct: true },
  { id: "d", text: "Both stations don't have enough resources" },
];

/* ─────────────────────────────────────────────
   SVGs
───────────────────────────────────────────── */

function CentralizedEscrowSVG({ completed, shippingStep }: { completed: boolean; shippingStep: number }) {
  return (
    <svg viewBox="0 0 320 160" className="w-full h-full" style={{ filter: "drop-shadow(0 0 8px rgba(245,158,11,0.15))" }}>
      {/* Depots */}
      <g transform="translate(40, 80)">
        <circle r="20" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" />
        <text y="4" textAnchor="middle" fill="#ffffff" fontSize="8" fontFamily="monospace" fontWeight="bold">ORION</text>
      </g>
      <g transform="translate(160, 80)">
        <circle r="22" fill="#1e150a" stroke="#f59e0b" strokeWidth="1.5" />
        <text y="3" textAnchor="middle" fill="#ffffff" fontSize="8" fontFamily="monospace" fontWeight="bold">DEPOT</text>
      </g>
      <g transform="translate(280, 80)">
        <circle r="20" fill="#0f172a" stroke="#8b5cf6" strokeWidth="1.5" />
        <text y="4" textAnchor="middle" fill="#ffffff" fontSize="8" fontFamily="monospace" fontWeight="bold">VEGA</text>
      </g>

      {/* Cargo lines */}
      <line x1="62" y1="80" x2="132" y2="80" stroke="rgba(245,158,11,0.25)" strokeWidth="1" />
      <line x1="184" y1="80" x2="254" y2="80" stroke="rgba(245,158,11,0.25)" strokeWidth="1" />

      {/* Animated cargo */}
      {shippingStep === 1 && (
        <circle r="3" fill="#22d3ee" cy="80">
          <animate attributeName="cx" values="62;132" dur="1.5s" repeatCount="indefinite" />
        </circle>
      )}
      {shippingStep === 2 && (
        <>
          <circle r="3" fill="#22d3ee" cx="132" cy="80" />
          <circle r="3" fill="#a78bfa" cy="80">
            <animate attributeName="cx" values="254;184" dur="1.5s" repeatCount="indefinite" />
          </circle>
        </>
      )}
      {completed && (
        <>
          <circle r="4" fill="#a78bfa" cy="80">
            <animate attributeName="cx" values="132;62" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle r="4" fill="#22d3ee" cy="80">
            <animate attributeName="cx" values="184;254" dur="2s" repeatCount="indefinite" />
          </circle>
        </>
      )}

      <text x="160" y="32" textAnchor="middle" fill="#f59e0b" fontSize="8" fontFamily="monospace" tracking-wider>ESCROW AGENT TAKES CUSTODY</text>
      <text x="160" y="148" textAnchor="middle" fill="rgba(148,163,184,0.5)" fontSize="7" fontFamily="monospace">Cargo held at Depot. Releases only on compliance match.</text>
    </svg>
  );
}

function AtomicSwapFlowSVG({ active, completed }: { active: boolean; completed: boolean }) {
  return (
    <svg viewBox="0 0 320 160" className="w-full h-full" style={{ filter: "drop-shadow(0 0 8px rgba(16,185,129,0.15))" }}>
      {/* Depots */}
      <g transform="translate(60, 80)">
        <circle r="20" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
        <text y="4" textAnchor="middle" fill="#ffffff" fontSize="8" fontFamily="monospace" fontWeight="bold">ORION</text>
      </g>
      <g transform="translate(260, 80)">
        <circle r="20" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
        <text y="4" textAnchor="middle" fill="#ffffff" fontSize="8" fontFamily="monospace" fontWeight="bold">VEGA</text>
      </g>

      {/* Orbit pathways */}
      <path d="M 60,80 A 100,50 0 0,0 260,80" fill="none" stroke="rgba(16,185,129,0.3)" strokeWidth="1.5" />
      <path d="M 260,80 A 100,50 0 0,0 60,80" fill="none" stroke="rgba(16,185,129,0.3)" strokeWidth="1.5" />

      {active && !completed && (
        <>
          <circle r="3" fill="#22d3ee">
            <animateMotion dur="2s" repeatCount="indefinite" path="M 60,80 A 100,50 0 0,0 260,80" />
          </circle>
          <circle r="3" fill="#a78bfa">
            <animateMotion dur="2s" repeatCount="indefinite" path="M 260,80 A 100,50 0 0,0 60,80" />
          </circle>
        </>
      )}

      {completed && (
        <text x="160" y="85" textAnchor="middle" fill="#10b981" fontSize="12" fontWeight="bold">SWAP SUCCESSFUL</text>
      )}

      <text x="160" y="32" textAnchor="middle" fill="#10b981" fontSize="8" fontFamily="monospace" tracking-wider>TRUSTLESS ATOMIC SWAP</text>
      <text x="160" y="148" textAnchor="middle" fill="rgba(148,163,184,0.5)" fontSize="7" fontFamily="monospace">Assets swap routes dynamically. Either both arrive, or both abort.</text>
    </svg>
  );
}

/* ─────────────────────────────────────────────
   QUIZ COMPONENT
───────────────────────────────────────────── */

function QuizPart({ onPass }: { onPass: () => void }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([null, null, null]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [locked, setLocked] = useState(false);

  const score = answers.filter((a, i) => a === QUIZ_QUESTIONS[i]?.correct).length;
  const passed = score >= 2;
  const q = QUIZ_QUESTIONS[currentQ];

  const handleAnswer = (idx: number) => {
    if (showFeedback || locked) return;
    setLocked(true);
    const next = [...answers];
    next[currentQ] = idx;
    setAnswers(next);
    setShowFeedback(true);

    setTimeout(() => {
      setShowFeedback(false);
      setLocked(false);
      if (currentQ < QUIZ_QUESTIONS.length - 1) {
        setCurrentQ((c) => c + 1);
      } else {
        setSubmitted(true);
      }
    }, 1800);
  };

  const retry = () => {
    setAnswers([null, null, null]);
    setCurrentQ(0);
    setShowFeedback(false);
    setSubmitted(false);
    setLocked(false);
  };

  if (submitted) {
    return (
      <div className={`rounded-2xl border p-5 text-center space-y-4 ${passed ? "bg-emerald-500/10 border-emerald-400/30" : "bg-rose-500/10 border-rose-400/30"}`}>
        <div className="text-4xl">{passed ? "⚖️" : "💡"}</div>
        <h4 className={`text-base font-bold ${passed ? "text-emerald-300" : "text-rose-300"}`}>
          {passed ? `${score}/3 — Trade Dilemma Solved!` : `${score}/3 — Trade Lock Remains`}
        </h4>
        <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
          {passed ? "Excellent! You understand why barter deadlocks occur and why escrow brokers are a temporary point of friction. The Space Barter Solver game is unlocked." : "Take a closer look at barter defaults and retry."}
        </p>
        {passed ? (
          <button onClick={onPass} className="px-6 py-2.5 bg-emerald-400 text-slate-950 rounded-xl font-bold text-xs hover:bg-emerald-300 transition shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            Open Space Barter Solver →
          </button>
        ) : (
          <button onClick={retry} className="px-5 py-2.5 bg-white/10 border border-white/20 text-white rounded-xl font-mono text-[10px] hover:bg-white/15 transition flex items-center gap-1.5 mx-auto">
            <RotateCcw className="w-3.5 h-3.5" /> Retry Checkpoint
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
        <span>Question {currentQ + 1} of 3</span>
        <span>Score: {answers.filter((a, i) => a === QUIZ_QUESTIONS[i]?.correct).length}/3</span>
      </div>

      <div className="rounded-xl bg-slate-950/80 border border-white/10 p-4">
        <h4 className="text-xs font-semibold text-white leading-relaxed">{q.q}</h4>
      </div>

      <div className="space-y-2">
        {q.options.map((opt, i) => {
          const selected = answers[currentQ] === i;
          const isCorrect = i === q.correct;
          let cls = "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/8 cursor-pointer";
          if (showFeedback && selected && isCorrect) cls = "border-emerald-400/70 bg-emerald-500/15 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.15)] cursor-default";
          else if (showFeedback && selected && !isCorrect) cls = "border-rose-400/70 bg-rose-500/15 text-rose-200 cursor-default";
          else if (showFeedback && isCorrect) cls = "border-emerald-400/35 bg-emerald-500/8 text-emerald-300 cursor-default";
          else if (locked) cls = "border-white/10 bg-white/5 text-slate-500 cursor-not-allowed";

          return (
            <button key={i} onClick={() => handleAnswer(i)} className={`w-full text-left rounded-xl border p-3 text-xs font-mono transition-all duration-200 ${cls}`}
            >
              <span className="text-slate-500 mr-2">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          );
        })}
      </div>

      {showFeedback && (
        <div className={`rounded-xl border p-3 text-[11px] leading-relaxed ${answers[currentQ] === q.correct ? "bg-emerald-500/10 border-emerald-400/30 text-emerald-200" : "bg-rose-500/10 border-rose-400/30 text-rose-200"}`}>
          <strong>{answers[currentQ] === q.correct ? "Correct! " : "Incorrect. "}</strong>
          {q.explanation}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */

export default function Task1_3_TradeDilemma({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<Step>("theory");
  const [completedSteps, setCompletedSteps] = useState<Step[]>([]);
  const [demoMode, setDemoMode] = useState<"direct" | "escrow">("direct");
  const [demoShippingStep, setDemoShippingStep] = useState(0); // 0=idle, 1=shipped, 2=vega_default, 3=success
  const [demoEscrowDone, setDemoEscrowDone] = useState(false);

  // Game state
  const [gameRound, setGameRound] = useState(1); // 1, 2, 3
  const [round1Choice, setRound1Choice] = useState<"orion" | "vega" | "neither" | null>(null);
  const [selectedDownsides, setSelectedDownsides] = useState<string[]>([]);
  const [selectedWeakness, setSelectedWeakness] = useState<string | null>(null);
  const [showGameFeedback, setShowGameFeedback] = useState(false);

  const markComplete = (s: Step) => {
    setCompletedSteps((prev) => (prev.includes(s) ? prev : [...prev, s]));
  };

  const goToStep = (s: Step) => {
    markComplete(step);
    setStep(s);
  };

  const isStepUnlocked = (s: Step) => {
    return true;
  };

  const currentIdx = STEP_ORDER.indexOf(step);

  useEffect(() => {
    const notifyState = () => {
      const urlMapping: Record<Step, string> = {
        theory: "theory",
        demo: "trade-sandbox",
        quiz: "knowledge-check",
        game: "barter-dilemma-solver",
        complete: "verification",
      };
      
      window.dispatchEvent(
        new CustomEvent("cosmos-x-nav-state", {
          detail: {
            canGoBack: currentIdx > 0,
            canGoForward: currentIdx < STEP_ORDER.length - 1 && isStepUnlocked(STEP_ORDER[currentIdx + 1]),
            currentStep: urlMapping[step],
          },
        })
      );
    };
    notifyState();

    const handleBack = () => {
      if (currentIdx > 0) {
        setStep(STEP_ORDER[currentIdx - 1]);
      }
    };
    const handleForward = () => {
      if (currentIdx < STEP_ORDER.length - 1 && isStepUnlocked(STEP_ORDER[currentIdx + 1])) {
        setStep(STEP_ORDER[currentIdx + 1]);
      }
    };
    const handleReset = () => {
      setRound1Choice(null);
      setSelectedDownsides([]);
      setSelectedWeakness(null);
      setShowGameFeedback(false);
      setGameRound(1);
      setDemoShippingStep(0);
      setDemoEscrowDone(false);
      setCompletedSteps([]);
      setStep("theory");
    };

    window.addEventListener("cosmos-x-nav-back", handleBack);
    window.addEventListener("cosmos-x-nav-forward", handleForward);
    window.addEventListener("cosmos-x-nav-reset", handleReset);

    return () => {
      window.removeEventListener("cosmos-x-nav-back", handleBack);
      window.removeEventListener("cosmos-x-nav-forward", handleForward);
      window.removeEventListener("cosmos-x-nav-reset", handleReset);
    };
  }, [step, completedSteps, currentIdx]);

  const triggerDirectShip = () => {
    setDemoShippingStep(1);
    setTimeout(() => {
      setDemoShippingStep(2); // Vega defaults!
    }, 1500);
  };

  const triggerEscrowShip = () => {
    setDemoShippingStep(1); // Orion ships cargo to Depot
    setTimeout(() => {
      setDemoShippingStep(2); // Vega ships cargo to Depot
      setTimeout(() => {
        setDemoShippingStep(3); // depot clears the swap
        setDemoEscrowDone(true);
      }, 1500);
    }, 1500);
  };

  const resetTradeDemo = () => {
    setDemoShippingStep(0);
    setDemoEscrowDone(false);
  };

  const handleRound1 = (choice: "orion" | "vega" | "neither") => {
    setRound1Choice(choice);
    setShowGameFeedback(true);
  };

  const toggleDownside = (id: string) => {
    setSelectedDownsides((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
    setShowGameFeedback(false);
  };

  const handleWeakness = (id: string) => {
    setSelectedWeakness(id);
    setShowGameFeedback(true);
  };

  const checkRound1 = () => {
    if (round1Choice === "neither") {
      setGameRound(2);
      setShowGameFeedback(false);
    }
  };

  const checkRound2 = () => {
    if (selectedDownsides.length === 4) {
      setGameRound(3);
      setShowGameFeedback(false);
    } else {
      setShowGameFeedback(true);
    }
  };

  const checkRound3 = () => {
    if (selectedWeakness === "c") {
      saveTaskScore("task1_3", 10, 10, true);
      goToStep("complete");
    }
  };

  return (
    <div className="flex h-full bg-[#040816] text-white overflow-hidden">
      
      {/* Sidebar navigation */}
      <aside className="w-52 shrink-0 border-r border-white/10 bg-slate-950/40 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-white/8 shrink-0">
          <p className="font-mono text-[8px] text-slate-500 uppercase tracking-widest">Task 1.3</p>
          <h3 className="font-rushblade text-xs text-white mt-1 leading-snug">Trade Dilemma</h3>
        </div>

        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1">
          {SIDEBAR_TASKS.map((task, i) => {
            const isDone = completedSteps.includes(task.id);
            const isActive = step === task.id;
            const unlocked = isStepUnlocked(task.id);

            return (
              <button key={task.id} onClick={() => unlocked && setStep(task.id)} disabled={!unlocked}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left transition-all text-[10px] font-mono ${
                  isActive
                    ? "bg-cyan-500/10 border border-cyan-400/20 text-cyan-300"
                    : isDone
                    ? "bg-emerald-500/5 border border-emerald-400/15 text-emerald-400"
                    : unlocked
                    ? "text-slate-400 hover:bg-white/5"
                    : "text-slate-700 cursor-not-allowed"
                }`}
              >
                <span className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 text-[8px] ${
                  isDone ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-400" : isActive ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-400" : "border-white/10 text-slate-600"
                }`}>
                  {isDone ? "✓" : !unlocked ? <Lock className="w-2 h-2" /> : task.icon}
                </span>
                <span className="truncate">{task.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 bg-violet-500/5 border-t border-white/5 text-[9px] text-slate-400 leading-relaxed shrink-0">
          <span className="font-bold text-violet-300 block mb-0.5">Objective:</span>
          Analyze counterparty settlement defaults, explore custody escrow, and swap assets.
        </div>
      </aside>

      {/* Main page content container */}
      <main className="flex-1 overflow-y-auto p-6 relative">
        <AnimatePresence mode="wait">

          {/* ── STEP 1: THEORY ── */}
          {step === "theory" && (
            <motion.div key="theory" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 w-full max-w-7xl">
              <div>
                <p className="font-mono text-[8px] text-cyan-400 uppercase tracking-widest">Section 1: Core Theory</p>
                <h2 className="text-xl font-bold text-white mt-0.5">The Double-Coincidence of Wants</h2>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                  In trades between anonymous, non-trusting parties, default risks deadlock direct barter. Escrows solve this but charge high rents.
                </p>
              </div>

              {/* Two-column layout grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
                
                {/* Left Column: text cards and buttons */}
                <div className="lg:col-span-6 space-y-4">
                  {/* Cards */}
                  <div className="space-y-3">
                    {[
                      { tag: "DEADLOCK", title: "Barter Settlement Lock", text: "Without common currency or enforcement nodes, whoever ships their asset first is exposed to a 100% loss risk if the buyer defaults.", color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "#ef4444" },
                      { tag: "ESCROW AGENTS", title: "Centralized Trust Escrow", text: "Escrow brokers take custody of both parties' shipments, verifying inputs. However, they levy fees, slow clearance, and can seize funds.", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "#f59e0b" },
                      { tag: "SMART ESCROW", title: "Atomic Cryptography", text: "Atomic swaps cryptographically link trade pipelines. The transactions interlock: either both parties clear their swaps simultaneously, or both rollback.", color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "#10b981" }
                    ].map((card, i) => (
                      <div key={i} className="rounded-xl border border-white/5 bg-slate-950/60 p-3.5 flex gap-3.5 relative overflow-hidden" style={{ borderLeft: `3px solid ${card.border}` }}>
                        <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: card.color, backgroundColor: card.bg }}>
                          <Shield className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[8px] font-mono px-1 py-0.5 rounded" style={{ color: card.color, backgroundColor: card.bg }}>{card.tag}</span>
                          <h4 className="text-xs font-bold text-white mt-1.5">{card.title}</h4>
                          <p className="text-[11px] text-slate-300 leading-relaxed mt-1">{card.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button onClick={() => goToStep("demo")} className="px-5 py-2.5 bg-cyan-400/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-400/30 text-xs font-bold font-mono rounded-xl transition flex items-center gap-1">
                    Explore Trade Escrows <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Right Column: Visual simulation viewer stacked vertically */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="rounded-xl border border-rose-500/20 bg-[#0b060f]/60 p-4 space-y-3">
                    <span className="font-mono text-[9px] text-rose-400 uppercase tracking-wider block">Centralized Escrow Agency Hops</span>
                    <div className="h-40 flex items-center justify-center">
                      <CentralizedEscrowSVG completed={false} shippingStep={0} />
                    </div>
                  </div>
                  <div className="rounded-xl border border-emerald-500/20 bg-[#040e0a]/60 p-4 space-y-3">
                    <span className="font-mono text-[9px] text-emerald-400 uppercase tracking-wider block">Decentralized Atomic Swap Route</span>
                    <div className="h-40 flex items-center justify-center">
                      <AtomicSwapFlowSVG active={false} completed={false} />
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* ── STEP 2: DEMO ── */}
          {step === "demo" && (
            <motion.div key="demo" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 w-full max-w-7xl">
              <div>
                <p className="font-mono text-[8px] text-cyan-400 uppercase tracking-widest">Section 2: Interactive Sandbox</p>
                <h2 className="text-xl font-bold text-white mt-0.5">Barter Default Simulator</h2>
                <p className="text-xs text-slate-400 mt-1">Simulate trade. See how Orion gets defaulted in a direct trade compared to a centralized escrow swap.</p>
              </div>

              {/* Two-column layout grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
                
                {/* Left Column: Toggles, triggers, logs, CTA */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Toggle */}
                  <div className="flex flex-col gap-3">
                    {(["direct", "escrow"] as const).map((m) => (
                      <button key={m} onClick={() => { setDemoMode(m); resetTradeDemo(); }}
                        className={`rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                          demoMode === m
                            ? m === "direct" ? "border-rose-400/50 bg-rose-500/10" : "border-emerald-400/50 bg-emerald-500/10"
                            : "border-white/10 hover:bg-white/3"
                        }`}
                      >
                        <span className="text-xl">{m === "direct" ? "🛸" : "🏰"}</span>
                        <h4 className="text-xs font-bold text-white mt-1">{m === "direct" ? "Direct Cargo Ship (No Escrow)" : "Central Broker Escrow (Centralized)"}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{m === "direct" ? "Orion ships oxygen first. Since there's no escrow, Vega defaults on payment." : "Central Depot holds both shipments. Reconciles swap only when both arrive."}</p>
                      </button>
                    ))}
                  </div>

                  {/* Status update log */}
                  <div className={`rounded-xl p-3 text-[11px] font-mono border ${
                    demoShippingStep === 2 && demoMode === "direct"
                      ? "bg-rose-500/10 border-rose-500/20 text-rose-200"
                      : demoEscrowDone
                      ? "bg-emerald-500/10 border-emerald-400/20 text-emerald-200"
                      : "bg-white/5 border-white/5 text-slate-400"
                  }`}>
                    {demoMode === "direct" ? (
                      demoShippingStep === 2
                        ? "⚠ Cargo Default: Vega kept the oxygen cargo but never returned fuel cargo. Orion has zero fallback leverage."
                        : "Direct cargo transfers rely on blind trust. Click 'Ship First' to trigger trade:"
                    ) : (
                      demoEscrowDone
                        ? "✓ Escrow cleared: Depot received both Oxygen and Fuel, completed exchange, and charged 50 units service fee."
                        : "Central escrows verify compliance. Click 'Use Escrow clearing' to initiate trust exchange:"
                    )}
                  </div>

                  {/* Trigger buttons */}
                  <div className="flex gap-2">
                    <button onClick={demoMode === "direct" ? triggerDirectShip : triggerEscrowShip} disabled={demoShippingStep > 0}
                      className="flex-1 py-2.5 bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl hover:bg-cyan-300 transition disabled:opacity-50 cursor-pointer">
                      {demoMode === "direct" ? "Ship First (Direct)" : "Ship cargo to Depot (Escrow)"}
                    </button>
                    <button onClick={resetTradeDemo} className="px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-xs font-mono cursor-pointer">
                      Reset
                    </button>
                  </div>

                  {(demoShippingStep === 2 || demoEscrowDone) && (
                    <button onClick={() => goToStep("quiz")} className="w-full py-2.5 bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl hover:bg-cyan-300 transition flex items-center justify-center gap-1 shadow-[0_0_15px_rgba(34,211,238,0.25)] cursor-pointer">
                      Take the Quiz <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Right Column: Visual simulation viewer panel */}
                <div className="lg:col-span-7 rounded-xl border border-white/10 bg-slate-950/80 p-5 flex flex-col items-center justify-center min-h-[220px] self-stretch">
                  {demoMode === "direct" ? (
                    <div className="w-full flex flex-col items-center justify-center">
                      <div className="flex justify-between items-center w-full max-w-[280px] font-mono text-[9px] mb-3">
                        <span className="text-cyan-400">Orion (Oxygen surplus)</span>
                        <span className="text-purple-400">Vega (Fuel surplus)</span>
                      </div>
                      <div className="w-full h-24 relative overflow-hidden bg-black/40 border border-white/5 rounded-lg flex items-center justify-between px-6">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[9px] border ${demoShippingStep >= 1 ? "border-rose-500/30 bg-rose-500/10 text-rose-300" : "border-cyan-400 bg-cyan-400/10 text-cyan-300"}`}>
                          ORION
                        </div>
                        {demoShippingStep === 1 && (
                          <motion.div animate={{ x: [-80, 80] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-xs">
                            📦 O₂ cargo
                          </motion.div>
                        )}
                        {demoShippingStep === 2 && (
                          <div className="text-[10px] font-mono text-rose-400 animate-pulse text-center flex-1">
                            ⚠ Vega received Oxygen, but turned off trade thrusters. Defaulted on Fuel transfer! Orion lost O₂ cargo.
                          </div>
                        )}
                        {demoShippingStep === 0 && (
                          <div className="text-[10px] text-slate-500 font-mono text-center flex-1">Orion is waiting to ship O₂ first...</div>
                        )}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[9px] border ${demoShippingStep >= 2 ? "border-rose-500 bg-rose-500/20 text-rose-300 shadow-[0_0_12px_rgba(239,68,68,0.3)]" : "border-purple-400 bg-purple-400/10 text-purple-300"}`}>
                          VEGA
                        </div>
                      </div>
                    </div>
                  ) : (
                    <CentralizedEscrowSVG completed={demoEscrowDone} shippingStep={demoShippingStep} />
                  )}
                </div>

              </div>
            </motion.div>
          )}

          {/* ── STEP 3: QUIZ ── */}
          {step === "quiz" && (
            <motion.div key="quiz" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4 max-w-2xl">
              <div>
                <p className="font-mono text-[8px] text-amber-400 uppercase tracking-widest">Section 3: Checkpoint</p>
                <h2 className="text-xl font-bold text-white mt-0.5">Verification Scan</h2>
                <p className="text-xs text-slate-400 mt-1">Verify your understanding of payment deadlocks and smart escrow mechanisms.</p>
              </div>

              <QuizPart onPass={() => goToStep("game")} />
            </motion.div>
          )}

          {/* ── STEP 4: GAME ── */}
          {step === "game" && (
            <motion.div key="game" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5 max-w-2xl">
              <div>
                <p className="font-mono text-[8px] text-purple-400 uppercase tracking-widest">Section 4: Active Challenge</p>
                <h2 className="text-xl font-bold text-white mt-0.5">Barter Dilemma Solver</h2>
                <p className="text-xs text-slate-400 mt-1">Help Station Orion and Vega settle their trade impasse across three decision rounds.</p>
              </div>

              <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4 space-y-4">
                {gameRound === 1 && (
                  <div className="space-y-4">
                    <p className="font-mono text-[9px] text-cyan-400 uppercase tracking-wider block">Round 1: Initial Shipment Proposal</p>
                    <p className="text-xs text-slate-200">Orion wants Oxygen, Vega wants Fuel. Who should ship their shipment cargo first in a direct barter trade?</p>
                    <div className="space-y-2">
                      {[
                        { id: "orion", label: "Orion ships first (Orion assumes all default risk)" },
                        { id: "vega", label: "Vega ships first (Vega assumes all default risk)" },
                        { id: "neither", label: "Neither (Direct trade is deadlocked due to counterparty default risk)" },
                      ].map((item) => (
                        <button key={item.id} onClick={() => handleRound1(item.id as "orion" | "vega" | "neither")}
                          className={`w-full text-left p-3 rounded-lg border text-xs font-mono transition-all ${
                            round1Choice === item.id
                              ? item.id === "neither" ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-300" : "border-rose-400/50 bg-rose-500/10 text-rose-300"
                              : "border-white/10 bg-white/5 hover:bg-white/8"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    {showGameFeedback && round1Choice && (
                      <div className={`p-3 rounded-lg border text-xs ${round1Choice === "neither" ? "bg-emerald-500/10 border-emerald-400/20 text-emerald-300" : "bg-rose-500/10 border-rose-500/20 text-rose-300"}`}>
                        {round1Choice === "neither"
                          ? "✓ Correct: Direct shipments cannot resolve the deadlock trust barrier. A secure validation mechanism is required."
                          : "✗ Incorrect: Shipping first exposes that cargo owner to total default failure with zero recovery options."}
                      </div>
                    )}

                    {round1Choice === "neither" && (
                      <button onClick={checkRound1} className="w-full py-2.5 bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl hover:bg-cyan-300 transition flex items-center justify-center gap-1">
                        Go to Round 2 <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}

                {gameRound === 2 && (
                  <div className="space-y-4">
                    <p className="font-mono text-[9px] text-cyan-400 uppercase tracking-wider block">Round 2: Centralized Escrow Downside Check</p>
                    <p className="text-xs text-slate-200">The stations decide to route through a Central Broker Depot. Select ALL four drawbacks of this centralized clearing method:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "fees", label: "Charging trade clearance fee margins" },
                        { id: "delays", label: "Ledger processing settlement delays" },
                        { id: "lock", label: "Risk of escrow custody fund freezes" },
                        { id: "sp", label: "Vulnerability to central database hacks" },
                      ].map((item) => {
                        const sel = selectedDownsides.includes(item.id);
                        return (
                          <button key={item.id} onClick={() => toggleDownside(item.id)}
                            className={`p-3 rounded-lg border text-xs font-mono text-center transition-all ${
                              sel ? "border-amber-400/50 bg-amber-500/10 text-amber-300" : "border-white/10 bg-white/5 hover:bg-white/8"
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>

                    {showGameFeedback && (
                      <div className="p-3 rounded-lg border text-xs bg-rose-500/10 border-rose-500/20 text-rose-300">
                        ✗ Select all 4 options to continue (each is a genuine trade drawback of central escrows).
                      </div>
                    )}

                    {selectedDownsides.length === 4 && (
                      <button onClick={checkRound2} className="w-full py-2.5 bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl hover:bg-cyan-300 transition flex items-center justify-center gap-1">
                        Go to Round 3 <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}

                {gameRound === 3 && (
                  <div className="space-y-4">
                    <p className="font-mono text-[9px] text-cyan-400 uppercase tracking-wider block">Round 3: Systemic Trust Resolution</p>
                    <p className="text-xs text-slate-200">What is the core structural vulnerability of using a Central Broker Depot as the escrow coordinator?</p>
                    <div className="space-y-2">
                      {WEAKNESS_OPTIONS.map((opt) => (
                        <button key={opt.id} onClick={() => handleWeakness(opt.id)}
                          className={`w-full text-left p-3 rounded-lg border text-xs font-mono transition-all ${
                            selectedWeakness === opt.id
                              ? opt.correct ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-300" : "border-rose-400/50 bg-rose-500/10 text-rose-300"
                              : "border-white/10 bg-white/5 hover:bg-white/8"
                          }`}
                        >
                          {opt.text}
                        </button>
                      ))}
                    </div>

                    {showGameFeedback && selectedWeakness && (
                      <div className={`p-3 rounded-lg border text-xs ${selectedWeakness === "c" ? "bg-emerald-500/10 border-emerald-400/20 text-emerald-200" : "bg-rose-500/10 border-rose-500/20 text-rose-300"}`}>
                        {selectedWeakness === "c"
                          ? "✓ Success: If the central ledger drops, all operations fail. This is why peer-to-peer atomic swaps were developed."
                          : "✗ Incorrect: Look at the centralization aspect of the escrow coordinator node."}
                      </div>
                    )}

                    {selectedWeakness === "c" && (
                      <button onClick={checkRound3} className="w-full py-2.5 bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl hover:bg-cyan-300 transition flex items-center justify-center gap-1">
                        Submit Settle Checkpoint <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── STEP 5: COMPLETE ── */}
          {step === "complete" && (
            <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center min-h-[360px] text-center space-y-6">
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.3 + i * 0.15, type: "spring", stiffness: 200 }}>
                    <Star className="w-8 h-8 text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]" />
                  </motion.div>
                ))}
              </div>

              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-full bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_40px_rgba(34,211,238,0.25)]">
                <Trophy className="w-10 h-10 text-cyan-400" />
              </motion.div>

              <div>
                <h3 className="font-rushblade text-2xl text-white">Task 1.3 Complete!</h3>
                <p className="text-slate-400 mt-2 text-xs max-w-sm mx-auto leading-relaxed">
                  Outstanding exploration. You've solved trade trust impasses, bypassed centralized brokers, and analyzed decentralized atomic transaction routes.
                </p>
              </div>

              <div className="flex gap-3 w-full max-w-xs">
                <div className="flex-1 rounded-xl border border-cyan-400/30 bg-cyan-400/8 p-3 text-center">
                  <p className="text-[8px] font-mono text-cyan-400 uppercase tracking-wider">XP Earned</p>
                  <p className="font-rushblade text-xl text-cyan-300">+10 XP</p>
                </div>
                <div className="flex-1 rounded-xl border border-amber-400/30 bg-amber-400/8 p-3 text-center">
                  <p className="text-[8px] font-mono text-amber-400 uppercase tracking-wider">Badge</p>
                  <p className="text-xl">⚖️</p>
                  <p className="text-[8px] text-amber-300 font-mono mt-0.5">Settle Master</p>
                </div>
              </div>

              <button onClick={onComplete}
                className="flex items-center gap-2 px-8 py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-[0_0_24px_rgba(34,211,238,0.3)] hover:scale-[1.02] active:scale-[0.98]">
                Submit Module 1 Verification <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}

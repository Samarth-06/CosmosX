import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ArrowRight, ChevronRight, Trophy, Star, Shield, AlertTriangle, Zap, Lock, Globe, RotateCcw } from "lucide-react";
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
  { id: "theory", label: "Core Theory", hint: "Learn how centralized middlemen add fees and risks to payments.", icon: "📖" },
  { id: "demo", label: "UPI vs P2P Demo", hint: "Simulate transaction hops. Toggle networks and fail routing nodes.", icon: "🔬" },
  { id: "quiz", label: "Knowledge Check", hint: "Answer 3 questions. Get at least 2 correct to unlock the mapping challenge.", icon: "❓" },
  { id: "game", label: "Mapping Hops", hint: "Scan 5 real-world scenarios and map the number of middlemen.", icon: "⚔️" },
];

const STEP_ORDER: Step[] = ["theory", "demo", "quiz", "game", "complete"];

const QUIZ_QUESTIONS = [
  {
    q: "Why do traditional bank transfers require payment networks (like UPI or SWIFT)?",
    options: [
      "To encrypt individual account names.",
      "Because bank databases are isolated and need an intermediary router to clear transactions.",
      "To speed up transfers to under one second.",
      "Because customers prefer paying transaction routing fees.",
    ],
    correct: 1,
    explanation: "Correct! Isolated bank ledgers cannot talk directly, so a middleman router matches credits and debits.",
  },
  {
    q: "What is a major risk of routing payments through multiple intermediaries?",
    options: [
      "The payment amount automatically increases.",
      "Each hop is a potential point of failure, delay, and added transaction cost.",
      "The sender's wallet is locked forever.",
      "No data is recorded on the final receiving bank.",
    ],
    correct: 1,
    explanation: "Spot on! Hops introduce ledger delays, transaction clearance fees, and technical single-failure nodes.",
  },
  {
    q: "How does a peer-to-peer blockchain transaction differ from a traditional bank payment?",
    options: [
      "It requires more correspondent bank verifications.",
      "It is directly written to a shared public ledger without middle settlement authorities.",
      "It is always processed by a central government server.",
      "It doesn't require any network connections.",
    ],
    correct: 2,
    explanation: "Indeed! By utilizing a shared cryptographically-secured ledger, nodes synchronize directly, bypassing middle banks.",
  },
];

const SCENARIOS = [
  {
    id: 1,
    title: "Sending ₹5,000 to a friend",
    flow: ["You", "Your Bank", "Payment Network (UPI/SWIFT)", "Friend's Bank", "Friend"],
    question: "How many intermediaries are involved in this transfer?",
    options: ["1", "2", "3", "4"],
    correct: 2,
    explanation: "3 intermediaries: Your Bank, Payment Network, and Friend's Bank. Each adds delay, fees, and a potential point of failure.",
    xpReward: 3,
  },
  {
    id: 2,
    title: "Buying a book online",
    flow: ["You", "Amazon", "Payment Gateway (Razorpay)", "Your Bank", "Seller's Bank", "Seller"],
    question: "Who ultimately controls whether the seller gets paid?",
    options: ["Your Bank", "Amazon", "The Seller", "Razorpay"],
    correct: 1,
    explanation: "Amazon controls the entire process. They can freeze seller accounts, hold payments, or reverse transactions at will.",
    xpReward: 3,
  },
  {
    id: 3,
    title: "Posting a photo on social media",
    flow: ["You", "Instagram / Meta Servers", "Your Followers"],
    question: "Who can delete your photo at any time without your consent?",
    options: ["Your followers", "The government only", "Meta / Instagram", "Nobody"],
    correct: 2,
    explanation: "Meta owns the platform. They can delete, shadow-ban, or restrict your content anytime — you agreed to this in the Terms of Service.",
    xpReward: 3,
  },
  {
    id: 4,
    title: "Storing important documents",
    flow: ["You", "Google Drive Servers", "You (accessing later)"],
    question: "What happens if Google suspends your account?",
    options: [
      "You get a 30-day grace period",
      "You lose access to all your files immediately",
      "The files are transferred to your local device",
      "Nothing changes",
    ],
    correct: 1,
    explanation: "All your files are on Google's servers. Account suspension means instant loss of access. Your data is physically held by a third party.",
    xpReward: 3,
  },
  {
    id: 5,
    title: "International money transfer (India → USA)",
    flow: ["You", "Your Bank", "Correspondent Bank", "SWIFT Network", "Recipient's Bank", "Recipient"],
    question: "How many business days does an international bank transfer typically take?",
    options: ["Instant", "2–5 business days", "Same day", "1 week minimum"],
    correct: 1,
    explanation: "International SWIFT transfers typically take 2–5 business days and cost $15–45 in fees per transfer due to multiple intermediary banks.",
    xpReward: 3,
  },
];

/* ─────────────────────────────────────────────
   SVGs
───────────────────────────────────────────── */

function CentralizedPaymentFlowSVG({ nodeOffline }: { nodeOffline: string | null }) {
  return (
    <svg viewBox="0 0 360 160" className="w-full h-full" style={{ filter: "drop-shadow(0 0 8px rgba(239,68,68,0.1))" }}>
      <defs>
        <marker id="arrowRed" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 2.5 L 7 5 L 0 7.5 z" fill="#ef4444" />
        </marker>
        <marker id="arrowCyan" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 2.5 L 7 5 L 0 7.5 z" fill="#22d3ee" />
        </marker>
      </defs>

      {/* Nodes */}
      <g transform="translate(35, 80)">
        <circle r="18" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5" />
        <text y="3.5" textAnchor="middle" fill="#ffffff" fontSize="8" fontFamily="monospace" fontWeight="bold">YOU</text>
      </g>

      <g transform="translate(112, 80)">
        <circle r="20" fill={nodeOffline === "bankA" ? "#311" : "#0d1e2e"} stroke={nodeOffline === "bankA" ? "#ef4444" : "#22d3ee"} strokeWidth="1.5" style={{ transition: "all 0.5s" }} />
        {nodeOffline === "bankA" && <text y="4" textAnchor="middle" fill="#ef4444" fontSize="12" fontWeight="bold">✕</text>}
        {nodeOffline !== "bankA" && <text y="3.5" textAnchor="middle" fill="#ffffff" fontSize="8" fontFamily="monospace" fontWeight="bold">Bank A</text>}
      </g>

      <g transform="translate(180, 80)">
        <circle r="20" fill={nodeOffline === "upi" ? "#311" : "#111827"} stroke={nodeOffline === "upi" ? "#ef4444" : "#8b5cf6"} strokeWidth="1.5" style={{ transition: "all 0.5s" }} />
        {nodeOffline === "upi" && <text y="4" textAnchor="middle" fill="#ef4444" fontSize="12" fontWeight="bold">✕</text>}
        {nodeOffline !== "upi" && <text y="3.5" textAnchor="middle" fill="#ffffff" fontSize="8.5" fontFamily="monospace" fontWeight="bold">UPI</text>}
      </g>

      <g transform="translate(248, 80)">
        <circle r="20" fill={nodeOffline === "bankB" ? "#311" : "#0d1e2e"} stroke={nodeOffline === "bankB" ? "#ef4444" : "#22d3ee"} strokeWidth="1.5" style={{ transition: "all 0.5s" }} />
        {nodeOffline === "bankB" && <text y="4" textAnchor="middle" fill="#ef4444" fontSize="12" fontWeight="bold">✕</text>}
        {nodeOffline !== "bankB" && <text y="3.5" textAnchor="middle" fill="#ffffff" fontSize="8" fontFamily="monospace" fontWeight="bold">Bank B</text>}
      </g>

      <g transform="translate(325, 80)">
        <circle r="18" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5" />
        <text y="3.5" textAnchor="middle" fill="#ffffff" fontSize="8" fontFamily="monospace" fontWeight="bold">FRIEND</text>
      </g>

      {/* Edges */}
      <line x1="55" y1="80" x2="86" y2="80" stroke={nodeOffline === "bankA" ? "#ef4444" : "#22d3ee"} strokeWidth="1.5" markerEnd={nodeOffline === "bankA" ? "url(#arrowRed)" : "url(#arrowCyan)"} />
      <line x1="134" y1="80" x2="154" y2="80" stroke={nodeOffline === "bankA" || nodeOffline === "upi" ? "#ef4444" : "#8b5cf6"} strokeWidth="1.5" markerEnd={nodeOffline === "bankA" || nodeOffline === "upi" ? "url(#arrowRed)" : "url(#arrowCyan)"} />
      <line x1="202" y1="80" x2="222" y2="80" stroke={nodeOffline === "upi" || nodeOffline === "bankB" ? "#ef4444" : "#8b5cf6"} strokeWidth="1.5" markerEnd={nodeOffline === "upi" || nodeOffline === "bankB" ? "url(#arrowRed)" : "url(#arrowCyan)"} />
      <line x1="270" y1="80" x2="301" y2="80" stroke={nodeOffline === "bankB" ? "#ef4444" : "#22d3ee"} strokeWidth="1.5" markerEnd={nodeOffline === "bankB" ? "url(#arrowRed)" : "url(#arrowCyan)"} />

      {/* Hops text */}
      <text x="180" y="30" textAnchor="middle" fill="#ef4444" fontSize="10" fontFamily="monospace" tracking-wider>3 INTERMEDIARY HOPS (FEE + RISK)</text>
      <text x="180" y="145" textAnchor="middle" fill="rgba(148,163,184,0.5)" fontSize="8.5" fontFamily="monospace">Each hop maintains an isolated ledger copy</text>
    </svg>
  );
}

function DirectPaymentFlowSVG({ offline }: { offline: boolean }) {
  return (
    <svg viewBox="0 0 360 160" className="w-full h-full" style={{ filter: "drop-shadow(0 0 8px rgba(16,185,129,0.1))" }}>
      <defs>
        <marker id="arrowGreen" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 2.5 L 7 5 L 0 7.5 z" fill="#10b981" />
        </marker>
        <marker id="arrowRedD" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 2.5 L 7 5 L 0 7.5 z" fill="#ef4444" />
        </marker>
      </defs>

      {/* Nodes */}
      <g transform="translate(60, 80)">
        <circle r="20" fill="#064e3b" stroke={offline ? "#ef4444" : "#10b981"} strokeWidth="1.5" style={{ transition: "all 0.5s" }} />
        {offline && <text y="4" textAnchor="middle" fill="#ef4444" fontSize="12" fontWeight="bold">✕</text>}
        {!offline && <text y="3.5" textAnchor="middle" fill="#ffffff" fontSize="8.5" fontFamily="monospace" fontWeight="bold">YOU</text>}
      </g>

      <g transform="translate(300, 80)">
        <circle r="20" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
        <text y="3.5" textAnchor="middle" fill="#ffffff" fontSize="8.5" fontFamily="monospace" fontWeight="bold">FRIEND</text>
      </g>

      {/* Edge */}
      <line x1="82" y1="80" x2="274" y2="80" stroke={offline ? "#ef4444" : "#10b981"} strokeWidth="2" strokeDasharray={offline ? "4 4" : "none"} markerEnd={offline ? "url(#arrowRedD)" : "url(#arrowGreen)"} style={{ transition: "all 0.5s" }} />

      {!offline && (
        <circle r="4" fill="#67e8f9">
          <animateMotion dur="2s" repeatCount="indefinite" path="M82,80 L274,80" />
        </circle>
      )}

      {/* Description text */}
      <text x="180" y="30" textAnchor="middle" fill="#10b981" fontSize="10" fontFamily="monospace" tracking-wider>DIRECT WALLET-TO-WALLET (0 MIDDLEMEN)</text>
      <text x="180" y="145" textAnchor="middle" fill="rgba(148,163,184,0.5)" fontSize="8.5" fontFamily="monospace">Directly validated by distributed network consensus</text>
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
        <div className="text-4xl">{passed ? "🎯" : "💡"}</div>
        <h4 className={`text-base font-bold ${passed ? "text-emerald-300" : "text-rose-300"}`}>
          {passed ? `${score}/3 — Middleman Quiz Passed!` : `${score}/3 — Re-examine Middlemen`}
        </h4>
        <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
          {passed ? "Excellent! You understand why centralized routing paths are vulnerable and slow. The Middleman Mapping Scanner challenge is unlocked." : "Take a closer look at the payment clearance channels and retry."}
        </p>
        {passed ? (
          <button onClick={onPass} className="px-6 py-2.5 bg-emerald-400 text-slate-950 rounded-xl font-bold text-xs hover:bg-emerald-300 transition shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            Open Mapping Scanner →
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
            <button key={i} onClick={() => handleAnswer(i)} className={`w-full text-left rounded-xl border p-3 text-xs font-mono transition-all duration-200 ${cls}`}>
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

export default function Task1_1_MiddlemanMapper({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<Step>("theory");
  const [completedSteps, setCompletedSteps] = useState<Step[]>([]);
  const [demoMode, setDemoMode] = useState<"upi" | "p2p">("upi");
  const [demoOfflineNode, setDemoOfflineNode] = useState<string | null>(null);
  const [demoP2POffline, setDemoP2POffline] = useState(false);

  // Scenario task state
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selections, setSelections] = useState<Record<number, number>>({});
  const [showExplanations, setShowExplanations] = useState<Record<number, boolean>>({});

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

  const stepsOrder: Step[] = ["theory", "demo", "quiz", "game", "complete"];
  const currentIdx = stepsOrder.indexOf(step);

  useEffect(() => {
    const notifyState = () => {
      const urlMapping: Record<Step, string> = {
        theory: "theory",
        demo: "upi-vs-p2p-demo",
        quiz: "knowledge-check",
        game: "mapping-scanner",
        complete: "verification",
      };
      
      window.dispatchEvent(
        new CustomEvent("cosmos-x-nav-state", {
          detail: {
            canGoBack: currentIdx > 0,
            canGoForward: currentIdx < stepsOrder.length - 1 && isStepUnlocked(stepsOrder[currentIdx + 1]),
            currentStep: urlMapping[step],
          },
        })
      );
    };
    notifyState();

    const handleBack = () => {
      if (currentIdx > 0) {
        setStep(stepsOrder[currentIdx - 1]);
      }
    };
    const handleForward = () => {
      if (currentIdx < stepsOrder.length - 1 && isStepUnlocked(stepsOrder[currentIdx + 1])) {
        setStep(stepsOrder[currentIdx + 1]);
      }
    };
    const handleReset = () => {
      setSelections({});
      setShowExplanations({});
      setCurrentScenario(0);
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

  // Scenario calculator
  const scenario = SCENARIOS[currentScenario];
  const selected = selections[currentScenario] !== undefined ? selections[currentScenario] : null;
  const showExplanation = showExplanations[currentScenario] || false;
  const isCorrect = selected === scenario.correct;

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelections((prev) => ({ ...prev, [currentScenario]: idx }));
    setShowExplanations((prev) => ({ ...prev, [currentScenario]: true }));
  };

  const handleNextScenario = () => {
    if (currentScenario < SCENARIOS.length - 1) {
      setCurrentScenario((n) => n + 1);
    } else {
      const scoreTotal = SCENARIOS.reduce((acc, sc, idx) => acc + (selections[idx] === sc.correct ? sc.xpReward : 0), 0);
      saveTaskScore("task1_1", scoreTotal, 15, scoreTotal >= 9);
      goToStep("complete");
    }
  };

  const scoreTotal = SCENARIOS.reduce((acc, sc, idx) => acc + (selections[idx] === sc.correct ? sc.xpReward : 0), 0);

  return (
    <div className="flex h-full bg-[#040816] text-white overflow-hidden">
      
      {/* Chapter internal navigation */}
      <aside className="w-52 shrink-0 border-r border-white/10 bg-slate-950/40 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-white/8 shrink-0">
          <p className="font-mono text-[8px] text-slate-500 uppercase tracking-widest">Task 1.1</p>
          <h3 className="font-rushblade text-xs text-white mt-1 leading-snug">Map Intermediaries</h3>
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
          Analyze payment chains, discover clearance overheads, and flag central checkpoints.
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
                <h2 className="text-xl font-bold text-white mt-0.5">The Toll of the Middleman</h2>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                  In a centralized world, entities do not transact directly. We depend on intermediary ledger matchers to reconcile claims.
                </p>
              </div>

              {/* Two-column layout grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
                
                {/* Left Column: text cards, glossaries, and buttons */}
                <div className="lg:col-span-6 space-y-4">
                  {/* THM Style cards */}
                  <div className="space-y-3">
                    {THEORY_CARDS.map((card, i) => (
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

                  {/* Key pills */}
                  <div className="rounded-xl border border-white/8 bg-slate-950/40 p-4">
                    <p className="font-mono text-[8px] text-slate-500 uppercase tracking-widest mb-2.5">Clearing Terminologies</p>
                    <div className="flex flex-wrap gap-2">
                      {GLOSSARY_TERMS.map((kt) => (
                        <span key={kt.term} className="px-2.5 py-1 rounded-full text-[9px] font-mono border" style={{ borderColor: `${kt.color}30`, color: kt.color, backgroundColor: `${kt.color}08` }}>
                          {kt.term}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button onClick={() => goToStep("demo")} className="px-5 py-2.5 bg-cyan-400/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-400/30 text-xs font-bold font-mono rounded-xl transition flex items-center gap-1">
                    Explore UPI vs P2P Hops <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Right Column: Visual route comparison stacked vertically */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="rounded-xl border border-rose-500/20 bg-[#0b060f]/60 p-4 space-y-3">
                    <span className="font-mono text-[9px] text-rose-400 uppercase tracking-wider block">Centralized Payment Clearing Hops</span>
                    <div className="h-40 flex items-center justify-center">
                      <CentralizedPaymentFlowSVG nodeOffline={null} />
                    </div>
                  </div>
                  <div className="rounded-xl border border-emerald-500/20 bg-[#040e0a]/60 p-4 space-y-3">
                    <span className="font-mono text-[9px] text-emerald-400 uppercase tracking-wider block">Decentralized Direct Settlement</span>
                    <div className="h-40 flex items-center justify-center">
                      <DirectPaymentFlowSVG offline={false} />
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
                <p className="font-mono text-[8px] text-cyan-400 uppercase tracking-widest">Section 2: Interactive Demo</p>
                <h2 className="text-xl font-bold text-white mt-0.5">Toggle Hops & Outages</h2>
                <p className="text-xs text-slate-400 mt-1">Select a clearing model, click structural nodes to shut them down, and observe the payment clearance outcome.</p>
              </div>

              {/* Two-column layout grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
                
                {/* Left Column: Selectors, alerts, triggers and quiz button */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Selectors grid */}
                  <div className="flex flex-col gap-3">
                    {(["upi", "p2p"] as const).map((m) => (
                      <button key={m} onClick={() => { setDemoMode(m); setDemoOfflineNode(null); setDemoP2POffline(false); }}
                        className={`rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                          demoMode === m
                            ? m === "upi" ? "border-rose-400/50 bg-rose-500/10" : "border-emerald-400/50 bg-emerald-500/10"
                            : "border-white/10 hover:bg-white/3"
                        }`}
                      >
                        <span className="text-xl">{m === "upi" ? "🏦" : "📱"}</span>
                        <h4 className="text-xs font-bold text-white mt-1">{m === "upi" ? "UPI Clearing Hops (Centralized)" : "Direct P2P Settlement (Decentralized)"}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{m === "upi" ? "Uses 3 intermediate nodes. If 1 fails, settlement stops." : "Zero intermediates. Resilient against middle node outage."}</p>
                      </button>
                    ))}
                  </div>

                  {/* Status outcome textbox */}
                  <div className={`rounded-xl p-3.5 text-[11px] font-mono border ${
                    demoOfflineNode || demoP2POffline
                      ? "bg-rose-500/10 border-rose-500/20 text-rose-200"
                      : "bg-white/5 border-white/5 text-slate-400"
                  }`}>
                    {demoMode === "upi" ? (
                      demoOfflineNode
                        ? `⚠ Alert: Middle node ${demoOfflineNode.toUpperCase()} went offline. Ledger update message blocked. Transaction failed.`
                        : "Click on Bank A, UPI, or Bank B node buttons below to simulate a node crash:"
                    ) : (
                      demoP2POffline
                        ? "⚠ Alert: Sender went offline or has no balance. Transaction aborted."
                        : "P2P nodes communicate directly. Click Sender to toggle your own online state:"
                    )}
                  </div>

                  {/* Node trigger buttons */}
                  <div className="flex flex-wrap gap-2">
                    {demoMode === "upi" ? (
                      (["bankA", "upi", "bankB"] as const).map((node) => (
                        <button key={node} onClick={() => setDemoOfflineNode(node === demoOfflineNode ? null : node)}
                          className={`px-3 py-1.5 rounded-xl border text-[10px] font-mono transition-all cursor-pointer ${
                            demoOfflineNode === node ? "bg-rose-500/20 border-rose-400 text-rose-300" : "border-white/10 hover:bg-white/5 text-slate-400"
                          }`}
                        >
                          Crash {node === "bankA" ? "Bank A" : node === "upi" ? "UPI Router" : "Bank B"}
                        </button>
                      ))
                    ) : (
                      <button onClick={() => setDemoP2POffline(!demoP2POffline)}
                        className={`px-3 py-1.5 rounded-xl border text-[10px] font-mono transition-all cursor-pointer ${
                          demoP2POffline ? "bg-rose-500/20 border-rose-400 text-rose-300" : "border-white/10 hover:bg-white/5 text-slate-400"
                        }`}
                      >
                        Disconnect Sender
                      </button>
                    )}
                    {(demoOfflineNode || demoP2POffline) && (
                      <button onClick={() => { setDemoOfflineNode(null); setDemoP2POffline(false); }} className="px-3 py-1.5 bg-slate-800 border border-white/10 rounded-xl text-[10px] font-mono text-slate-400 hover:text-white cursor-pointer">
                        Reset Outage
                      </button>
                    )}
                  </div>

                  <button onClick={() => goToStep("quiz")} className="w-full py-2.5 bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl hover:bg-cyan-300 transition flex items-center justify-center gap-1 shadow-[0_0_15px_rgba(34,211,238,0.25)] cursor-pointer">
                    Take the Quiz <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Right Column: Visual simulation viewer (span 7 columns) */}
                <div className="lg:col-span-7 rounded-xl border border-white/10 bg-slate-950/80 p-5 flex flex-col items-center justify-center min-h-[220px] self-stretch">
                  {demoMode === "upi" ? (
                    <CentralizedPaymentFlowSVG nodeOffline={demoOfflineNode} />
                  ) : (
                    <DirectPaymentFlowSVG offline={demoP2POffline} />
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
                <p className="text-xs text-slate-400 mt-1">Answer the following questions to verify your understanding of database intermediary routing.</p>
              </div>

              <QuizPart onPass={() => goToStep("game")} />
            </motion.div>
          )}

          {/* ── STEP 4: GAME ── */}
          {step === "game" && (
            <motion.div key="game" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5 max-w-2xl">
              <div>
                <p className="font-mono text-[8px] text-purple-400 uppercase tracking-widest">Section 4: Active Challenge</p>
                <h2 className="text-xl font-bold text-white mt-0.5">Identify Centralized Checkpoints</h2>
                <p className="text-xs text-slate-400 mt-1">Audit the transaction scenarios below, trace the pathway hops, and isolate the count of intermediaries.</p>
              </div>

              <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="font-mono text-[10px] text-cyan-400">Scenario {currentScenario + 1} of 5</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[8px]">XP: +3</span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-white">{scenario.title}</h4>
                  <div className="flex flex-wrap items-center gap-1 text-[9px] font-mono bg-black/40 border border-white/5 p-2 rounded-lg">
                    {scenario.flow.map((node, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <span className={`px-1.5 py-0.5 rounded ${i === 0 || i === scenario.flow.length - 1 ? "bg-cyan-500/15 border border-cyan-400/25 text-cyan-300" : "bg-rose-500/15 border border-rose-400/25 text-rose-300"}`}>{node}</span>
                        {i < scenario.flow.length - 1 && <span className="text-slate-500">➔</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <p className="text-xs font-semibold text-slate-200">{scenario.question}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {scenario.options.map((opt, i) => {
                      const sel = selected === i;
                      const corr = i === scenario.correct;
                      let btnCls = "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/8 cursor-pointer";
                      if (selected !== null) {
                        if (corr) btnCls = "border-emerald-400/50 bg-emerald-500/10 text-emerald-300 cursor-default";
                        else if (sel) btnCls = "border-rose-400/50 bg-rose-500/10 text-rose-300 cursor-default";
                        else btnCls = "opacity-40 border-white/5 bg-transparent cursor-default";
                      }
                      return (
                        <button key={i} onClick={() => handleSelect(i)} className={`py-2 rounded-lg border text-xs font-mono text-center transition-all ${btnCls}`}>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {showExplanation && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-3 rounded-lg border text-[11px] leading-relaxed ${isCorrect ? "bg-emerald-500/10 border-emerald-400/20 text-emerald-200" : "bg-rose-500/10 border-rose-500/20 text-rose-200"}`}>
                    <span className="font-bold">{isCorrect ? "✓ Correct: " : "✗ Incorrect: "}</span>
                    {scenario.explanation}
                  </motion.div>
                )}
              </div>

              {selected !== null && (
                <button onClick={handleNextScenario} className="w-full py-2.5 bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl hover:bg-cyan-300 transition flex items-center justify-center gap-1">
                  {currentScenario < SCENARIOS.length - 1 ? "Next Scenario" : "Submit Scorecard"} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
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
                <h3 className="font-rushblade text-2xl text-white">Task 1.1 Complete!</h3>
                <p className="text-slate-400 mt-2 text-xs max-w-sm mx-auto leading-relaxed">
                  You've successfully traced payment clearing routes, audited intermediary hops, and isolated central custody checkpoints.
                </p>
              </div>

              <div className="flex gap-3 w-full max-w-xs">
                <div className="flex-1 rounded-xl border border-cyan-400/30 bg-cyan-400/8 p-3 text-center">
                  <p className="text-[8px] font-mono text-cyan-400 uppercase tracking-wider">XP Earned</p>
                  <p className="font-rushblade text-xl text-cyan-300">+{scoreTotal} XP</p>
                </div>
                <div className="flex-1 rounded-xl border border-amber-400/30 bg-amber-400/8 p-3 text-center">
                  <p className="text-[8px] font-mono text-amber-400 uppercase tracking-wider">Badge</p>
                  <p className="text-xl">🗺️</p>
                  <p className="text-[8px] text-amber-300 font-mono mt-0.5">Map Cadet</p>
                </div>
              </div>

              <button onClick={() => { saveTaskScore("task1_1", scoreTotal, 15, scoreTotal >= 9); onComplete(); }}
                className="flex items-center gap-2 px-8 py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-[0_0_24px_rgba(34,211,238,0.3)] hover:scale-[1.02] active:scale-[0.98]">
                Proceed to Task 1.2 <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}

const THEORY_CARDS = [
  {
    tag: "CENTRAL CHANNELS",
    title: "Database Isolation",
    text: "Individual financial authorities keep proprietary databases that do not sync automatically. Hence, clearing networks are required to authenticate debit claims.",
    border: "#ef4444",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.1)",
  },
  {
    tag: "OVERHEAD COSTS",
    title: "The Clearance toll",
    text: "Each validation broker in the transaction trail charges a fee and slows down settlement speeds, adding ledger reconciliation costs.",
    border: "#f59e0b",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
  },
  {
    tag: "THE LEDGER SHIFT",
    title: "Decentralized Settlement",
    text: "Decentralized consensus replaces isolated accounts with a single cryptographically-linked ledger copy shared across all network validator nodes.",
    border: "#10b981",
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
  },
];

const GLOSSARY_TERMS = [
  { term: "Intermediary Hop", color: "#ef4444" },
  { term: "Isolated Ledger", color: "#f59e0b" },
  { term: "Clearing Network", color: "#8b5cf6" },
  { term: "Direct Transaction", color: "#10b981" },
  { term: "Consensus Verification", color: "#22d3ee" },
];

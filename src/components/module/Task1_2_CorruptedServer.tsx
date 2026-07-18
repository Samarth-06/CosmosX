import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ChevronRight, ArrowRight, Shield, ShieldOff, AlertTriangle, Trophy, Star, Lock, RotateCcw } from "lucide-react";
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
  { id: "theory", label: "Core Theory", hint: "Learn about Single Points of Failure and database vulnerability.", icon: "📖" },
  { id: "demo", label: "Tampering Demo", hint: "Toggle networks. Compromise nodes and see consensus reject fraud.", icon: "🔬" },
  { id: "quiz", label: "Knowledge Check", hint: "Answer 3 questions. Get at least 2 correct to unlock the audit lab.", icon: "❓" },
  { id: "game", label: "Log Audit Challenge", hint: "Inspect transaction logs and flag corrupted entries.", icon: "⚔️" },
];

const STEP_ORDER: Step[] = ["theory", "demo", "quiz", "game", "complete"];

const QUIZ_QUESTIONS = [
  {
    q: "Why is a centralized server database vulnerable to administrative compromise?",
    options: [
      "Because centralized servers use too little memory.",
      "Because anyone holding root keys or admin credentials can silently rewrite the ledger state.",
      "Because centralized databases are always public.",
      "Because centralized records cannot be altered by anyone.",
    ],
    correct: 1,
    explanation: "Correct! If an admin account or root access is breached, the database owner has master keys to rewrite history silently.",
  },
  {
    q: "What is a Single Point of Failure (SPF) in systems design?",
    options: [
      "A software bug that causes a visual layout glitch.",
      "A critical node whose individual failure takes down or compromises the entire network.",
      "A database that stores transaction records on multiple servers.",
      "A system that has excess backup server power.",
    ],
    correct: 1,
    explanation: "Correct! A Single Point of Failure means a single component holds all control. If it drops or gets hacked, the whole network drops.",
  },
  {
    q: "How does distributed consensus protect historical database integrity?",
    options: [
      "By charging high transaction verification fees.",
      "By distributing matching ledger copies to multiple nodes that continuously cross-verify hash states.",
      "By storing all transactions in RAM instead of disk space.",
      "By hiding ledger contents from all network nodes.",
    ],
    correct: 1,
    explanation: "Yes! Nodes compare cryptographic hash states of their ledgers. If one node alters its database, it gets overridden by the honest majority.",
  },
];

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

/* ─────────────────────────────────────────────
   SVGs
───────────────────────────────────────────── */

function CentralizedTamperSVG({ corrupted, onTamper }: { corrupted: boolean; onTamper: () => void }) {
  return (
    <svg viewBox="0 0 320 160" className="w-full h-full" style={{ filter: corrupted ? "drop-shadow(0 0 10px rgba(239,68,68,0.25))" : "drop-shadow(0 0 8px rgba(34,211,238,0.15))" }}>
      <defs>
        <radialGradient id="centSvr" cx="50%" cy="50%">
          <stop offset="0%" stopColor={corrupted ? "#ef4444" : "#22d3ee"} stopOpacity="0.9" />
          <stop offset="100%" stopColor={corrupted ? "#7f1d1d" : "#0e7490"} stopOpacity="0.6" />
        </radialGradient>
      </defs>

      {/* Database Node */}
      <g transform="translate(160, 80)" className="cursor-pointer" onClick={onTamper}>
        <circle r={corrupted ? 38 : 34} fill="url(#centSvr)" style={{ transition: "all 0.5s" }} stroke={corrupted ? "#fca5a5" : "#22d3ee"} strokeWidth="1" />
        {corrupted && (
          <circle r="44" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.6">
            <animate attributeName="r" values="38;52;38" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="1.5s" repeatCount="indefinite" />
          </circle>
        )}
        <text y="-3" textAnchor="middle" fill="#fff" fontSize="8" fontFamily="monospace" fontWeight="bold" letterSpacing="0.5">CENTRAL DB</text>
        <text y="7" textAnchor="middle" fill={corrupted ? "#fca5a5" : "#67e8f9"} fontSize="6.5" fontFamily="monospace" fontWeight="bold" letterSpacing="0.2">
          {corrupted ? "BREACHED" : "CLICK TO HACK"}
        </text>
      </g>

      {/* Clients */}
      {[{ x: 60, y: 40, name: "User A" }, { x: 260, y: 40, name: "User B" }, { x: 60, y: 120, name: "User C" }, { x: 260, y: 120, name: "User D" }].map((c, i) => (
        <g key={i}>
          <line x1="160" y1="80" x2={c.x} y2={c.y} stroke={corrupted ? "rgba(239,68,68,0.3)" : "rgba(34,211,238,0.3)"} strokeWidth="1" strokeDasharray={corrupted ? "3 3" : "none"} />
          <circle cx={c.x} cy={c.y} r="14" fill="#0f172a" stroke={corrupted ? "#ef4444" : "#6366f1"} strokeWidth="1.5" />
          <text x={c.x} y={c.y + 3} textAnchor="middle" fill={corrupted ? "#ef4444" : "#ffffff"} fontSize="8" fontFamily="monospace" fontWeight="bold">
            {corrupted ? "✕" : c.name}
          </text>
        </g>
      ))}

      <text x="160" y="148" textAnchor="middle" fill={corrupted ? "#ef4444" : "#94a3b8"} fontSize="8" fontFamily="monospace">
        {corrupted ? "⚠ SILENT CORRUPTION — ALL CLIENTS GIVEN FAKE DATA" : "Single point of failure database"}
      </text>
    </svg>
  );
}

function ConsensusVerifySVG({ compromisedNode, onCompromise }: { compromisedNode: number | null; onCompromise: (idx: number) => void }) {
  const nodes = [
    { x: 160, y: 40, label: "Node 1" },
    { x: 240, y: 100, label: "Node 2" },
    { x: 80, y: 100, label: "Node 3" },
  ];

  return (
    <svg viewBox="0 0 320 160" className="w-full h-full" style={{ filter: "drop-shadow(0 0 8px rgba(16,185,129,0.15))" }}>
      {/* Edges */}
      <line x1="160" y1="40" x2="240" y2="100" stroke="rgba(16,185,129,0.4)" strokeWidth="1.5" />
      <line x1="240" y1="100" x2="80" y2="100" stroke="rgba(16,185,129,0.4)" strokeWidth="1.5" />
      <line x1="80" y1="100" x2="160" y2="40" stroke="rgba(16,185,129,0.4)" strokeWidth="1.5" />

      {/* Nodes */}
      {nodes.map((n, i) => {
        const isComp = compromisedNode === i;
        return (
          <g key={i} transform={`translate(${n.x}, ${n.y})`} className="cursor-pointer" onClick={() => onCompromise(i)}>
            <circle r="18" fill={isComp ? "#311" : "#064e3b"} stroke={isComp ? "#ef4444" : "#10b981"} strokeWidth="2" style={{ transition: "all 0.5s" }} />
            {isComp ? (
              <>
                <text y="4" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="bold">✕</text>
                <circle r="22" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.5">
                  <animate attributeName="r" values="18;26;18" dur="1.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0;0.5" dur="1.2s" repeatCount="indefinite" />
                </circle>
              </>
            ) : (
              <text y="3" textAnchor="middle" fill="#ffffff" fontSize="8" fontFamily="monospace" fontWeight="bold">{n.label}</text>
            )}
          </g>
        );
      })}

      <text x="160" y="148" textAnchor="middle" fill={compromisedNode !== null ? "#ef4444" : "#10b981"} fontSize="8" fontFamily="monospace">
        {compromisedNode !== null
          ? `Node ${compromisedNode + 1} Altered! Others check hashes, flag disparity, and override it.`
          : "3 Consensus nodes syncing matching database records"}
      </text>
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
        <div className="text-4xl">{passed ? "🛡️" : "💡"}</div>
        <h4 className={`text-base font-bold ${passed ? "text-emerald-300" : "text-rose-300"}`}>
          {passed ? `${score}/3 — Audit Knowledge Verified!` : `${score}/3 — Security Retake Required`}
        </h4>
        <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
          {passed ? "Correct! You understand how Single Points of Failure collapse and how replication provides defense. The Database Log Audit lab is unlocked." : "Take a closer look at data consensus methods and retry."}
        </p>
        {passed ? (
          <button onClick={onPass} className="px-6 py-2.5 bg-emerald-400 text-slate-950 rounded-xl font-bold text-xs hover:bg-emerald-300 transition shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            Open Log Audit Lab →
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

export default function Task1_2_CorruptedServer({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<Step>("theory");
  const [completedSteps, setCompletedSteps] = useState<Step[]>([]);
  const [demoMode, setDemoMode] = useState<"central" | "consensus">("central");
  const [demoCentralCorrupted, setDemoCentralCorrupted] = useState(false);
  const [demoConsensusCompromised, setDemoConsensusCompromised] = useState<number | null>(null);

  // Challenge game state
  const [selectedTampered, setSelectedTampered] = useState<string[]>([]);
  const [selectedDeleted, setSelectedDeleted] = useState<string[]>([]);
  const [showGameFeedback, setShowGameFeedback] = useState(false);
  const [gamePassed, setGamePassed] = useState(false);

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
        demo: "tampering-demo",
        quiz: "knowledge-check",
        game: "log-audit-challenge",
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
      setSelectedTampered([]);
      setSelectedDeleted([]);
      setShowGameFeedback(false);
      setGamePassed(false);
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

  const toggleTamperedLog = (id: string) => {
    if (gamePassed) return;
    setSelectedTampered((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setShowGameFeedback(false);
  };

  const toggleDeletedLog = (id: string) => {
    if (gamePassed) return;
    setSelectedDeleted((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setShowGameFeedback(false);
  };

  const verifyAudit = () => {
    // TX-001 is corrupted (amount changed 200 -> 2000)
    // TX-002 is deleted (status deleted)
    const correctlyFlaggedTampered = selectedTampered.includes("TX-001") && selectedTampered.length === 1;
    const correctlyFlaggedDeleted = selectedDeleted.includes("TX-002") && selectedDeleted.length === 1;

    if (correctlyFlaggedTampered && correctlyFlaggedDeleted) {
      setGamePassed(true);
      setShowGameFeedback(true);
      setTimeout(() => {
        saveTaskScore("task1_2", 10, 10, true);
        goToStep("complete");
      }, 1500);
    } else {
      setShowGameFeedback(true);
    }
  };

  return (
    <div className="flex h-full bg-[#040816] text-white overflow-hidden">
      
      {/* Sidebar navigation */}
      <aside className="w-52 shrink-0 border-r border-white/10 bg-slate-950/40 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-white/8 shrink-0">
          <p className="font-mono text-[8px] text-slate-500 uppercase tracking-widest">Task 1.2</p>
          <h3 className="font-rushblade text-xs text-white mt-1 leading-snug">Corrupted Command</h3>
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
          Analyze state database compromises, trigger network sync errors, and audit logs.
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
                <h2 className="text-xl font-bold text-white mt-0.5">Single Points of Failure</h2>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                  When databases rely on a single central controller, admin privilege breaches enable silent transaction overrides that bypass validation checks.
                </p>
              </div>

              {/* Two-column layout grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
                
                {/* Left Column: text cards and buttons */}
                <div className="lg:col-span-6 space-y-4">
                  {/* Cards */}
                  <div className="space-y-3">
                    {[
                      { tag: "SPF RISK", title: "Administrative Keys", text: "Database root keys or server access privileges allow administrators to wipe transaction logs, overwrite records, or forge funds without client consent.", color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "#ef4444" },
                      { tag: "TAMPERING LORE", title: "Silent Integrity Breach", text: "Without independent database check nodes, clients have no fallback validation copies. Whatever the central server claims is accepted as absolute state truth.", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "#f59e0b" },
                      { tag: "THE CURE", title: "Consensus Alignment", text: "By syncing data logs across multiple nodes, the system isolates compromised records. If one node alters a balance, it fails the consensus hash match.", color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "#10b981" }
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
                    Test Outage Sandbox <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Right Column: Visual simulation viewer stacked vertically */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="rounded-xl border border-rose-500/20 bg-[#0b060f]/60 p-4 space-y-3">
                    <span className="font-mono text-[9px] text-rose-400 uppercase tracking-wider block">Centralized database (Tampered)</span>
                    <div className="h-40 flex items-center justify-center">
                      <CentralizedTamperSVG corrupted={true} onTamper={() => {}} />
                    </div>
                  </div>
                  <div className="rounded-xl border border-emerald-500/20 bg-[#040e0a]/60 p-4 space-y-3">
                    <span className="font-mono text-[9px] text-emerald-400 uppercase tracking-wider block">Decentralized Replication Consensus</span>
                    <div className="h-40 flex items-center justify-center">
                      <ConsensusVerifySVG compromisedNode={1} onCompromise={() => {}} />
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
          {/* ── STEP 2: DEMO ── */}
          {step === "demo" && (
            <motion.div
              key="demo"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full max-w-7xl"
            >
              {/* Left Column: Title, description, mode selectors, CTA */}
              <div className="lg:col-span-5 space-y-5 text-left">
                <div>
                  <p className="font-mono text-[8px] text-cyan-400 uppercase tracking-widest">Section 2: Interactive Sandbox</p>
                  <h2 className="text-xl font-bold text-white mt-0.5">Simulate Administrative Tampering</h2>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    Breach the servers below to alter accounts. Observe how clients update compared to a multi-node consensus.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  {(["central", "consensus"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => { setDemoMode(m); setDemoCentralCorrupted(false); setDemoConsensusCompromised(null); }}
                      className={`rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                        demoMode === m
                          ? m === "central" ? "border-rose-400/50 bg-rose-500/10 shadow-[0_0_15px_rgba(239,68,68,0.05)]" : "border-emerald-400/50 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                          : "border-white/5 bg-slate-900/40 hover:bg-slate-900/70"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{m === "central" ? "🖥" : "🖧"}</span>
                        <h4 className="text-xs font-bold text-white">{m === "central" ? "Single DB Server (Centralized)" : "Consensus Nodes (Distributed)"}</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                        {m === "central"
                          ? "Single database instance. Hacking it updates all connected client views."
                          : "Altering one node's data triggers mismatch alarms; others reject the update."}
                      </p>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => goToStep("quiz")}
                  className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 shadow-[0_0_15px_rgba(34,211,238,0.25)] cursor-pointer"
                >
                  Take the Quiz <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Right Column: Interactive visual simulation screen */}
              <div className="lg:col-span-7 space-y-4">
                <div className="rounded-xl border border-white/10 bg-slate-950/80 p-5 flex flex-col items-center justify-center min-h-[360px] relative overflow-hidden shadow-2xl">
                  {/* Subtle decorative grid overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[16px_16px] pointer-events-none" />

                  <div className="relative z-10 w-full flex-1 flex items-center justify-center">
                    {demoMode === "central" ? (
                      <CentralizedTamperSVG corrupted={demoCentralCorrupted} onTamper={() => setDemoCentralCorrupted(!demoCentralCorrupted)} />
                    ) : (
                      <ConsensusVerifySVG compromisedNode={demoConsensusCompromised} onCompromise={(idx) => setDemoConsensusCompromised(idx === demoConsensusCompromised ? null : idx)} />
                    )}
                  </div>

                  <div className={`relative z-10 w-full mt-4 rounded-xl p-3 text-[11px] font-mono border text-left ${
                    demoCentralCorrupted || demoConsensusCompromised !== null
                      ? "bg-rose-500/10 border-rose-500/20 text-rose-200"
                      : "bg-white/5 border-white/5 text-slate-400"
                  }`}>
                    {demoMode === "central" ? (
                      demoCentralCorrupted
                        ? "⚠ Alert: Admin keys leaked. Central database rewritten to fake state values. Connected users A-D received altered files."
                        : "Click the Central DB node above to simulate database record alteration:"
                      ) : (
                      demoConsensusCompromised !== null
                        ? `⚠ Alert: Node ${demoConsensusCompromised + 1} tampered. Hash mismatch detected! Node isolated, network remains secure.`
                        : "Click Node 1, 2, or 3 above to tamper with individual database copies:"
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}          {/* ── STEP 3: QUIZ ── */}
          {step === "quiz" && (
            <motion.div key="quiz" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4 max-w-2xl">
              <div>
                <p className="font-mono text-[8px] text-amber-400 uppercase tracking-widest">Section 3: Checkpoint</p>
                <h2 className="text-xl font-bold text-white mt-0.5">Verification Scan</h2>
                <p className="text-xs text-slate-400 mt-1">Verify your understanding of single failure points and ledger recovery methods.</p>
              </div>

              <QuizPart onPass={() => goToStep("game")} />
            </motion.div>
          )}

          {/* ── STEP 4: GAME ── */}
          {step === "game" && (
            <motion.div key="game" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5 max-w-2xl">
              <div>
                <p className="font-mono text-[8px] text-purple-400 uppercase tracking-widest">Section 4: Active Challenge</p>
                <h2 className="text-xl font-bold text-white mt-0.5">Database Log Auditor</h2>
                <p className="text-xs text-slate-400 mt-1">Compare the active database state with the secure backup ledger. Select and flag the tampered or deleted records below.</p>
              </div>

              <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="font-mono text-[10px] text-cyan-400">Secure Backup vs Live Server state</span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono text-[8px]">Compromise Alert</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs text-slate-300">
                    <thead>
                      <tr className="border-b border-white/10 text-[10px] text-slate-500">
                        <th className="py-2 px-1">TXID</th>
                        <th className="py-2">PATHWAY</th>
                        <th className="py-2 text-right">SECURE AMT</th>
                        <th className="py-2 text-right">LIVE AMT</th>
                        <th className="py-2 text-center">AUDIT ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CORRUPTED_TXNS.map((tx) => {
                        const isTamperedSelected = selectedTampered.includes(tx.id);
                        const isDeletedSelected = selectedDeleted.includes(tx.id);
                        const isTampered = tx.id === "TX-001";
                        const isDeleted = tx.id === "TX-002";

                        return (
                          <tr key={tx.id} className="border-b border-white/5 hover:bg-white/3">
                            <td className="py-3 px-1 font-bold text-slate-200">{tx.id}</td>
                            <td className="py-3 text-[10px]">{tx.from} ➔ {tx.to}</td>
                            <td className="py-3 text-right text-slate-400 tabular-nums">{tx.original || tx.amount} {tx.unit}</td>
                            <td className={`py-3 text-right tabular-nums font-bold ${isTampered ? "text-rose-400" : isDeleted ? "text-rose-400/40 line-through" : "text-slate-300"}`}>
                              {isDeleted ? "[WIPED]" : `${tx.amount} ${tx.unit}`}
                            </td>
                            <td className="py-3 text-center">
                              <div className="inline-flex gap-1.5">
                                <button disabled={gamePassed} onClick={() => toggleTamperedLog(tx.id)}
                                  className={`px-2 py-1 rounded text-[9px] border transition-all ${
                                    isTamperedSelected ? "bg-rose-500/20 border-rose-400 text-rose-300" : "border-white/10 text-slate-500 hover:border-slate-500"
                                  }`}
                                >
                                  Flag Altered
                                </button>
                                <button disabled={gamePassed} onClick={() => toggleDeletedLog(tx.id)}
                                  className={`px-2 py-1 rounded text-[9px] border transition-all ${
                                    isDeletedSelected ? "bg-amber-500/20 border-amber-400 text-amber-300" : "border-white/10 text-slate-500 hover:border-slate-500"
                                  }`}
                                >
                                  Flag Deleted
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {showGameFeedback && (
                  <div className={`p-3 rounded-lg border text-xs leading-relaxed ${gamePassed ? "bg-emerald-500/10 border-emerald-400/20 text-emerald-300" : "bg-rose-500/10 border-rose-500/20 text-rose-300"}`}>
                    {gamePassed ? (
                      "✓ Success: Compromised logs identified. Altered amount (2000 vs 200 fuel) and deleted log have been isolated. Commencing security rebuild..."
                    ) : (
                      "✗ Incorrect Flagging: Some compromised records remain untraced or incorrectly isolated. Review amounts carefully."
                    )}
                  </div>
                )}
              </div>

              {!gamePassed && (
                <button onClick={verifyAudit} className="w-full py-2.5 bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl hover:bg-cyan-300 transition">
                  Confirm Audit Log Submit
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
                <h3 className="font-rushblade text-2xl text-white">Task 1.2 Complete!</h3>
                <p className="text-slate-400 mt-2 text-xs max-w-sm mx-auto leading-relaxed">
                  Excellent work. You've isolated central server vulnerabilities, audited modified state logs, and completed the database recovery sequence.
                </p>
              </div>

              <div className="flex gap-3 w-full max-w-xs">
                <div className="flex-1 rounded-xl border border-cyan-400/30 bg-cyan-400/8 p-3 text-center">
                  <p className="text-[8px] font-mono text-cyan-400 uppercase tracking-wider">XP Earned</p>
                  <p className="font-rushblade text-xl text-cyan-300">+10 XP</p>
                </div>
                <div className="flex-1 rounded-xl border border-amber-400/30 bg-amber-400/8 p-3 text-center">
                  <p className="text-[8px] font-mono text-amber-400 uppercase tracking-wider">Badge</p>
                  <p className="text-xl">🕵</p>
                  <p className="text-[8px] text-amber-300 font-mono mt-0.5">Log Auditor</p>
                </div>
              </div>

              <button onClick={onComplete}
                className="flex items-center gap-2 px-8 py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-[0_0_24px_rgba(34,211,238,0.3)] hover:scale-[1.02] active:scale-[0.98]">
                Proceed to Task 1.3 <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}

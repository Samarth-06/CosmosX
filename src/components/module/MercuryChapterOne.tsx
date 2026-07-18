import { useState, useEffect, useRef } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Lock,
  Play,
  RotateCcw,
  Bot,
  Zap,
  Shield,
  AlertTriangle,
  Trophy,
  Star,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────
   TYPES & CONSTANTS
───────────────────────────────────────────── */

type Step = "landing" | "theory" | "demo" | "quiz" | "game" | "complete";

interface SidebarTask {
  id: Step;
  label: string;
  hint: string;
  icon: string;
}

const SIDEBAR_TASKS: SidebarTask[] = [
  { id: "landing", label: "Mission Brief", hint: "Read the mission overview and understand why this chapter matters.", icon: "🚀" },
  { id: "theory", label: "Core Theory", hint: "Learn why centralized systems are fragile and what decentralization fixes.", icon: "📖" },
  { id: "demo", label: "Live Demo", hint: "Simulate a real network failure. Toggle between centralized and distributed.", icon: "🔬" },
  { id: "quiz", label: "Knowledge Check", hint: "Answer 3 questions. You need 2/3 correct to unlock the game.", icon: "❓" },
  { id: "game", label: "51% Attack Sim", hint: "Control nodes and attempt a double-spend attack. Win both scenarios to complete.", icon: "⚔️" },
];

const STEP_ORDER: Step[] = ["landing", "theory", "demo", "quiz", "game", "complete"];

const QUIZ_QUESTIONS = [
  {
    q: "What is the main weakness of a centralized system?",
    options: [
      "It processes transactions too slowly.",
      "A single point of failure can take down the entire network.",
      "It requires too many nodes to operate.",
      "It cannot handle encrypted data.",
    ],
    correct: 1,
    explanation: "Exactly! One server going down means every connected user loses access — there is no fallback.",
  },
  {
    q: "Why can't a single node on a distributed network bring down the whole system?",
    options: [
      "Because it uses military-grade encryption.",
      "Because each node has a verified copy of the ledger, so others continue.",
      "Because all nodes are physically in the same data center.",
      "Because transactions are stored in RAM.",
    ],
    correct: 1,
    explanation: "Correct! Redundant copies mean any surviving node can keep the network alive and detect tampering.",
  },
  {
    q: "In blockchain, what does 'trustless' actually mean?",
    options: [
      "Users cannot trust the system at all.",
      "You must trust every participant individually.",
      "The math and consensus rules replace the need to trust any single party.",
      "The blockchain is run by a trusted government body.",
    ],
    correct: 2,
    explanation: "Yes! 'Trustless' means you don't need to trust a person or company — you trust the protocol's rules.",
  },
];

/* ─────────────────────────────────────────────
   ANIMATED HUB & SPOKE SVG (Landing)
───────────────────────────────────────────── */

function HubAndSpokeSVG() {
  const center = { x: 200, y: 160 };
  const spokeAngles = [0, 51, 102, 153, 204, 255, 306];
  const r = 110;
  const nodes = spokeAngles.map((a, i) => ({
    id: i,
    x: center.x + r * Math.cos((a * Math.PI) / 180),
    y: center.y + r * Math.sin((a * Math.PI) / 180),
    label: String.fromCharCode(65 + i),
    delay: i * 0.25,
  }));

  return (
    <svg viewBox="0 0 400 320" className="w-full h-full" style={{ filter: "drop-shadow(0 0 20px rgba(34,211,238,0.2))" }}>
      <defs>
        <radialGradient id="hubGrad" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#0e7490" stopOpacity="0.7" />
        </radialGradient>
        <radialGradient id="spokeNodeGrad" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#312e81" stopOpacity="0.7" />
        </radialGradient>
        <radialGradient id="glowGrad" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Hub ambient glow */}
      <circle cx={center.x} cy={center.y} r="60" fill="url(#glowGrad)" />

      {/* Orbit ring */}
      <circle cx={center.x} cy={center.y} r={r} fill="none" stroke="rgba(34,211,238,0.08)" strokeWidth="1" strokeDasharray="4 6" />

      {/* Spoke lines with pulse */}
      {nodes.map((n) => (
        <g key={`line-${n.id}`}>
          <line
            x1={center.x} y1={center.y}
            x2={n.x} y2={n.y}
            stroke="rgba(34,211,238,0.25)"
            strokeWidth="1.5"
          />
          {/* Animated data particle */}
          <circle r="3" fill="#22d3ee" opacity="0.85">
            <animateMotion
              dur={`${1.6 + n.id * 0.35}s`}
              repeatCount="indefinite"
              begin={`${n.delay}s`}
              path={`M${center.x},${center.y} L${n.x},${n.y}`}
            />
            <animate attributeName="opacity" values="0;0.9;0" dur={`${1.6 + n.id * 0.35}s`} repeatCount="indefinite" begin={`${n.delay}s`} />
          </circle>
          {/* Return particle */}
          <circle r="2" fill="#a78bfa" opacity="0.7">
            <animateMotion
              dur={`${2.0 + n.id * 0.3}s`}
              repeatCount="indefinite"
              begin={`${n.delay + 0.8}s`}
              path={`M${n.x},${n.y} L${center.x},${center.y}`}
            />
            <animate attributeName="opacity" values="0;0.7;0" dur={`${2.0 + n.id * 0.3}s`} repeatCount="indefinite" begin={`${n.delay + 0.8}s`} />
          </circle>
        </g>
      ))}

      {/* Hub center */}
      <circle cx={center.x} cy={center.y} r="28" fill="url(#hubGrad)" />
      <circle cx={center.x} cy={center.y} r="32" fill="none" stroke="#22d3ee" strokeWidth="1.5" opacity="0.5">
        <animate attributeName="r" values="28;38;28" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0;0.5" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <text x={center.x} y={center.y - 4} textAnchor="middle" fill="#e0f2fe" fontSize="8" fontFamily="monospace" fontWeight="bold">SERVER</text>
      <text x={center.x} y={center.y + 8} textAnchor="middle" fill="#67e8f9" fontSize="8" fontFamily="monospace">NODE</text>

      {/* Spoke nodes */}
      {nodes.map((n) => (
        <g key={`node-${n.id}`}>
          <circle cx={n.x} cy={n.y} r="18" fill="url(#spokeNodeGrad)" />
          <circle cx={n.x} cy={n.y} r="20" fill="none" stroke="#6366f1" strokeWidth="1" opacity="0.4">
            <animate attributeName="r" values="18;24;18" dur={`${2.2 + n.id * 0.2}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0;0.4" dur={`${2.2 + n.id * 0.2}s`} repeatCount="indefinite" />
          </circle>
          <text x={n.x} y={n.y + 5} textAnchor="middle" fill="#c4b5fd" fontSize="10" fontFamily="monospace" fontWeight="bold">{n.label}</text>
        </g>
      ))}

      {/* Label */}
      <text x={center.x} y={300} textAnchor="middle" fill="rgba(148,163,184,0.7)" fontSize="9" fontFamily="monospace">
        CENTRALIZED ARCHITECTURE · ALL DATA ROUTES THROUGH ONE HUB
      </text>
    </svg>
  );
}

/* ─────────────────────────────────────────────
   THEORY SVGs
───────────────────────────────────────────── */

function CentralizedCollapseGraphic({ attacked }: { attacked: boolean }) {
  const center = { x: 160, y: 115 };
  const clientAngles = [0, 60, 120, 180, 240, 300];
  const r = 75;
  const clients = clientAngles.map((a, i) => ({
    id: i,
    x: center.x + r * Math.cos((a * Math.PI) / 180),
    y: center.y + r * Math.sin((a * Math.PI) / 180),
  }));

  return (
    <svg viewBox="0 0 320 230" className="w-full h-full" style={{ filter: attacked ? "drop-shadow(0 0 10px rgba(239,68,68,0.25))" : "drop-shadow(0 0 8px rgba(34,211,238,0.15))" }}>
      <defs>
        <radialGradient id="ch-centerGrad" cx="50%" cy="50%">
          <stop offset="0%" stopColor={attacked ? "#ef4444" : "#22d3ee"} stopOpacity="0.9" />
          <stop offset="100%" stopColor={attacked ? "#7f1d1d" : "#0e7490"} stopOpacity="0.6" />
        </radialGradient>
        <radialGradient id="ch-clientGrad" cx="50%" cy="50%">
          <stop offset="0%" stopColor={attacked ? "#374151" : "#8b5cf6"} stopOpacity="0.9" />
          <stop offset="100%" stopColor={attacked ? "#111827" : "#4c1d95"} stopOpacity="0.6" />
        </radialGradient>
      </defs>

      {clients.map((c) => (
        <line key={c.id} x1={center.x} y1={center.y} x2={c.x} y2={c.y}
          stroke={attacked ? "rgba(239,68,68,0.2)" : "rgba(34,211,238,0.4)"}
          strokeWidth="1.5"
          strokeDasharray={attacked ? "4 4" : "none"}
          style={{ transition: "all 0.8s ease" }}
        />
      ))}

      {!attacked && clients.slice(0, 3).map((c, i) => (
        <circle key={`dp-${i}`} r="2.5" fill="#22d3ee" opacity="0.8">
          <animateMotion dur={`${1.5 + i * 0.4}s`} repeatCount="indefinite" path={`M${center.x},${center.y} L${c.x},${c.y}`} />
          <animate attributeName="opacity" values="0;0.9;0" dur={`${1.5 + i * 0.4}s`} repeatCount="indefinite" />
        </circle>
      ))}

      <circle cx={center.x} cy={center.y} r={attacked ? 30 : 24} fill="url(#ch-centerGrad)" style={{ transition: "all 0.6s ease" }} />
      {attacked && (
        <>
          <circle cx={center.x} cy={center.y} r="35" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.7">
            <animate attributeName="r" values="28;50;28" dur="1.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0;0.7" dur="1.4s" repeatCount="indefinite" />
          </circle>
          <text x={center.x} y={center.y + 6} textAnchor="middle" fill="#ef4444" fontSize="18" fontWeight="bold">✕</text>
        </>
      )}
      {!attacked && <text x={center.x} y={center.y + 5} textAnchor="middle" fill="#22d3ee" fontSize="11" fontWeight="bold">DB</text>}

      {clients.map((c) => (
        <g key={c.id}>
          <circle cx={c.x} cy={c.y} r="13" fill="url(#ch-clientGrad)" style={{ transition: "all 0.6s ease", opacity: attacked ? 0.3 : 1 }} />
          {attacked && <text x={c.x} y={c.y + 4} textAnchor="middle" fill="#475569" fontSize="9">✕</text>}
          {!attacked && <text x={c.x} y={c.y + 4} textAnchor="middle" fill="#c4b5fd" fontSize="8" fontWeight="bold">{String.fromCharCode(65 + c.id)}</text>}
        </g>
      ))}

      <text x={center.x} y={216} textAnchor="middle" fill={attacked ? "#ef4444" : "#94a3b8"} fontSize="9" fontFamily="monospace">
        {attacked ? "⚠ CENTRAL SERVER OFFLINE — ALL NODES DOWN" : "Centralized Architecture"}
      </text>
    </svg>
  );
}

function DistributedMeshGraphic({ nodeDown }: { nodeDown: number | null }) {
  const positions = [
    { x: 160, y: 45 },
    { x: 240, y: 88 },
    { x: 255, y: 172 },
    { x: 190, y: 215 },
    { x: 128, y: 215 },
    { x: 62, y: 172 },
    { x: 78, y: 88 },
  ];
  const edges = [
    [0, 1], [0, 6], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6],
    [0, 2], [0, 4], [1, 5], [3, 6],
  ];
  const aliveCount = nodeDown !== null ? positions.length - 1 : positions.length;

  return (
    <svg viewBox="0 0 320 255" className="w-full h-full" style={{ filter: "drop-shadow(0 0 8px rgba(16,185,129,0.18))" }}>
      <defs>
        <radialGradient id="dm-green" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#065f46" stopOpacity="0.7" />
        </radialGradient>
        <radialGradient id="dm-gray" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#475569" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#1e293b" stopOpacity="0.7" />
        </radialGradient>
      </defs>

      {edges.map(([a, b], i) => {
        const bothAlive = nodeDown !== a && nodeDown !== b;
        return (
          <line key={i}
            x1={positions[a].x} y1={positions[a].y}
            x2={positions[b].x} y2={positions[b].y}
            stroke={bothAlive ? "rgba(16,185,129,0.5)" : "rgba(71,85,105,0.15)"}
            strokeWidth="1.5"
            style={{ transition: "stroke 0.7s ease" }}
          />
        );
      })}

      {nodeDown === null && edges.slice(0, 5).map(([a, b], i) => (
        <circle key={`flow-${i}`} r="2.5" fill="#22d3ee" opacity="0.85">
          <animateMotion dur={`${1.7 + i * 0.35}s`} repeatCount="indefinite" path={`M${positions[a].x},${positions[a].y} L${positions[b].x},${positions[b].y}`} />
          <animate attributeName="opacity" values="0;0.9;0" dur={`${1.7 + i * 0.35}s`} repeatCount="indefinite" />
        </circle>
      ))}

      {positions.map((p, i) => {
        const isDown = nodeDown === i;
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="16" fill={isDown ? "url(#dm-gray)" : "url(#dm-green)"} style={{ transition: "all 0.6s ease" }} />
            {isDown ? (
              <text x={p.x} y={p.y + 5} textAnchor="middle" fill="#ef4444" fontSize="13" fontWeight="bold">✕</text>
            ) : (
              <>
                <text x={p.x} y={p.y + 4} textAnchor="middle" fill="#d1fae5" fontSize="8" fontWeight="bold">N{i + 1}</text>
                <circle cx={p.x} cy={p.y} r="18" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.4">
                  <animate attributeName="r" values="16;22;16" dur={`${2.1 + i * 0.25}s`} repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0;0.4" dur={`${2.1 + i * 0.25}s`} repeatCount="indefinite" />
                </circle>
              </>
            )}
          </g>
        );
      })}

      <text x="160" y="244" textAnchor="middle" fill={nodeDown !== null ? "#10b981" : "#94a3b8"} fontSize="9" fontFamily="monospace">
        {nodeDown !== null ? `⚡ N${nodeDown + 1} offline — ${aliveCount}/7 peers still live!` : "Distributed Mesh — 7 Nodes"}
      </text>
    </svg>
  );
}

/* ─────────────────────────────────────────────
   THEORY CARDS DATA
───────────────────────────────────────────── */

const THEORY_CARDS = [
  {
    icon: <AlertTriangle className="w-5 h-5" />,
    color: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "#ef4444",
    title: "The Single Point of Failure",
    text: "Every centralized system — banks, social media, government DBs — relies on one trusted server. If that server is hacked, crashes, or lies, every connected user is affected immediately and cannot verify the truth.",
    tag: "VULNERABILITY",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "#10b981",
    title: "What Decentralization Fixes",
    text: "Distribute the database across hundreds of independent nodes. Each holds a full copy. To fake a record you'd need to corrupt over half of them simultaneously — an exponentially harder and more expensive attack.",
    tag: "SOLUTION",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "#f59e0b",
    title: "The Blockchain Insight",
    text: "Blockchain doesn't just copy data — it cryptographically links every entry to the previous one. Changing any historical record would break the chain for all subsequent blocks, making tampering instantly detectable.",
    tag: "BREAKTHROUGH",
  },
];

const GLOSSARY_TERMS = [
  { term: "Single Point of Failure", color: "#ef4444" },
  { term: "Distributed Ledger", color: "#10b981" },
  { term: "Byzantine Fault Tolerance", color: "#8b5cf6" },
  { term: "Consensus", color: "#f59e0b" },
  { term: "Immutability", color: "#22d3ee" },
  { term: "51% Attack", color: "#f97316" },
];

/* ─────────────────────────────────────────────
   QUIZ COMPONENT
───────────────────────────────────────────── */

function QuizSection({ onPass }: { onPass: () => void }) {
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
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`rounded-2xl border p-6 text-center space-y-4 ${passed ? "bg-emerald-500/10 border-emerald-400/30" : "bg-rose-500/10 border-rose-400/30"}`}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-5xl"
        >
          {passed ? "🎯" : "💡"}
        </motion.div>
        <h4 className={`text-xl font-bold ${passed ? "text-emerald-300" : "text-rose-300"}`}>
          {passed ? `${score}/3 — Knowledge Check Passed!` : `${score}/3 — Keep Learning`}
        </h4>
        <p className="text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
          {passed
            ? "Excellent work. You've demonstrated understanding of centralization vs decentralization. The 51% Attack Simulator is now unlocked."
            : `You scored ${score}/3. Review the theory cards and try again — you need at least 2 correct to proceed.`}
        </p>
        {passed ? (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={onPass}
            className="px-7 py-3 bg-emerald-400 text-slate-950 rounded-xl font-bold text-sm hover:bg-emerald-300 transition-all shadow-[0_0_24px_rgba(16,185,129,0.35)] hover:shadow-[0_0_36px_rgba(16,185,129,0.5)] hover:scale-[1.02]"
          >
            Unlock the 51% Attack Simulator →
          </motion.button>
        ) : (
          <button
            onClick={retry}
            className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-mono text-xs hover:bg-white/15 transition flex items-center gap-2 mx-auto"
          >
            <RotateCcw className="w-4 h-4" /> Retry Quiz
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Progress pips */}
      <div className="flex items-center gap-3">
        {QUIZ_QUESTIONS.map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full border font-mono text-[10px] flex items-center justify-center transition-all duration-300 ${
              i < currentQ
                ? answers[i] === QUIZ_QUESTIONS[i].correct
                  ? "bg-emerald-500/20 border-emerald-400/60 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                  : "bg-rose-500/20 border-rose-400/60 text-rose-400"
                : i === currentQ
                ? "bg-cyan-500/20 border-cyan-400/60 text-cyan-400 animate-pulse"
                : "bg-white/5 border-white/10 text-slate-600"
            }`}>
              {i < currentQ ? (answers[i] === QUIZ_QUESTIONS[i].correct ? "✓" : "✗") : i + 1}
            </div>
            {i < 2 && <div className={`w-12 h-px ${i < currentQ ? "bg-white/25" : "bg-white/8"}`} />}
          </div>
        ))}
        <span className="ml-auto text-[10px] font-mono text-slate-400">Q{currentQ + 1} of 3</span>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
          className="space-y-3"
        >
          <div className="rounded-xl bg-slate-950/80 border border-white/10 p-4">
            <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest mb-2">Q{currentQ + 1}</p>
            <h4 className="text-sm font-semibold text-white leading-relaxed">{q.q}</h4>
          </div>

          <div className="space-y-2">
            {q.options.map((opt, i) => {
              const selected = answers[currentQ] === i;
              const isCorrect = i === q.correct;
              let cls = "border-white/10 bg-white/5 text-slate-300 hover:border-white/25 hover:bg-white/8 cursor-pointer";
              if (showFeedback && selected && isCorrect) cls = "border-emerald-400/70 bg-emerald-500/15 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.2)] cursor-default";
              else if (showFeedback && selected && !isCorrect) cls = "border-rose-400/70 bg-rose-500/15 text-rose-200 cursor-default";
              else if (showFeedback && isCorrect) cls = "border-emerald-400/35 bg-emerald-500/8 text-emerald-300 cursor-default";
              else if (locked) cls = "border-white/10 bg-white/5 text-slate-500 cursor-not-allowed";

              return (
                <button key={i} onClick={() => handleAnswer(i)}
                  className={`w-full text-left rounded-xl border p-3.5 text-xs font-mono transition-all duration-200 ${cls}`}
                >
                  <span className="text-slate-500 mr-2.5">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`rounded-xl border p-3 text-xs leading-relaxed ${
                  answers[currentQ] === q.correct
                    ? "bg-emerald-500/10 border-emerald-400/30 text-emerald-200"
                    : "bg-rose-500/10 border-rose-400/30 text-rose-200"
                }`}
              >
                <span className="font-bold">{answers[currentQ] === q.correct ? "✓ Correct! " : "✗ Not quite. "}</span>
                {q.explanation}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────
   51% ATTACK SIMULATOR GAME
───────────────────────────────────────────── */

type GameMode = "centralized" | "distributed";
type GamePhase = "setup" | "playing" | "attacking" | "result";

function AttackSimulatorGame({ onWin }: { onWin: () => void }) {
  const [mode, setMode] = useState<GameMode>("centralized");
  const [phase, setPhase] = useState<GamePhase>("setup");
  const [controlledNodes, setControlledNodes] = useState<Set<number>>(new Set());
  const [attackResult, setAttackResult] = useState<"success" | "blocked" | null>(null);
  const [scenariosWon, setScenariosWon] = useState<GameMode[]>([]);

  const TOTAL_NODES = mode === "centralized" ? 1 : 9;
  const controlledCount = mode === "centralized" ? (controlledNodes.has(0) ? 1 : 0) : controlledNodes.size;
  const controlPercent = TOTAL_NODES > 0 ? Math.round((controlledCount / TOTAL_NODES) * 100) : 0;
  const canAttack = mode === "centralized" ? controlledNodes.has(0) : controlledNodes.size >= 5;

  const resetGame = () => {
    setPhase("setup");
    setControlledNodes(new Set());
    setAttackResult(null);
  };

  const switchMode = (m: GameMode) => { setMode(m); resetGame(); };

  const handleNodeClick = (id: number) => {
    if (phase === "result" || phase === "attacking") return;
    if (phase === "setup") setPhase("playing");
    setControlledNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAttack = () => {
    setPhase("attacking");
    setTimeout(() => {
      const success = canAttack;
      setAttackResult(success ? "success" : "blocked");
      setPhase("result");
      if (success && !scenariosWon.includes(mode)) {
        const updated = [...scenariosWon, mode];
        setScenariosWon(updated);
        if (updated.length >= 2) {
          setTimeout(() => onWin(), 2200);
        }
      }
    }, 2000);
  };

  const distributedPositions = [
    { label: "Hub", x: 1, y: 1 },
    { label: "A", x: 0, y: 0 }, { label: "B", x: 1, y: 0 }, { label: "C", x: 2, y: 0 },
    { label: "D", x: 0, y: 1 }, { label: "E", x: 2, y: 1 },
    { label: "F", x: 0, y: 2 }, { label: "G", x: 1, y: 2 }, { label: "H", x: 2, y: 2 },
  ];

  return (
    <div className="space-y-4">
      {/* Mode switcher */}
      <div className="flex gap-2">
        {(["centralized", "distributed"] as GameMode[]).map((m) => (
          <button key={m} onClick={() => switchMode(m)}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all border relative overflow-hidden ${
              mode === m
                ? m === "centralized"
                  ? "bg-rose-500/20 border-rose-400/60 text-rose-300 shadow-[0_0_18px_rgba(239,68,68,0.2)]"
                  : "bg-emerald-500/20 border-emerald-400/60 text-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.2)]"
                : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:bg-white/8"
            }`}
          >
            {m === "centralized" ? "⚡ Centralized" : "🌐 Distributed"}
            {scenariosWon.includes(m) && (
              <span className="ml-2 text-emerald-400">✓</span>
            )}
          </button>
        ))}
      </div>

      {/* Context box */}
      <div className={`rounded-xl border p-3 text-xs font-mono leading-relaxed ${
        mode === "centralized"
          ? "bg-rose-500/5 border-rose-400/20 text-rose-200"
          : "bg-emerald-500/5 border-emerald-400/20 text-emerald-200"
      }`}>
        {mode === "centralized" ? (
          <>🎯 <strong>Centralized network:</strong> 1 node controls everything. Seize it → instant ledger control. Click the server below, then attack.</>
        ) : (
          <>🎯 <strong>Distributed network:</strong> 9 nodes share the ledger. You need ≥5 nodes (51%) to attempt a double-spend. Click nodes to seize them.</>
        )}
      </div>

      {/* Control bar */}
      <div className="bg-slate-950/80 border border-white/10 rounded-xl p-3 space-y-2">
        <div className="flex justify-between items-center text-[10px] font-mono">
          <span className="text-slate-400 uppercase tracking-wider">Network Control</span>
          <span className={`font-bold tabular-nums ${controlPercent >= 51 ? "text-rose-400" : "text-slate-300"}`}>
            {controlPercent}% ({controlledCount}/{TOTAL_NODES} nodes)
          </span>
        </div>
        <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
          <motion.div
            className={`h-full rounded-full transition-colors ${controlPercent >= 51 ? "bg-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]" : "bg-cyan-500"}`}
            animate={{ width: `${Math.min(controlPercent, 100)}%` }}
            transition={{ type: "spring", stiffness: 80, damping: 20 }}
          />
        </div>
        {controlPercent >= 51 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[9px] font-mono text-rose-400 animate-pulse"
          >
            ⚠ 51% THRESHOLD REACHED — DOUBLE-SPEND ATTACK POSSIBLE
          </motion.p>
        )}
      </div>

      {/* Node Grid */}
      {phase !== "result" && phase !== "attacking" && (
        <div>
          {mode === "centralized" ? (
            <div className="flex justify-center py-4">
              <button
                onClick={() => handleNodeClick(0)}
                className={`w-32 h-32 rounded-2xl border-2 font-mono text-xs font-bold transition-all flex flex-col items-center justify-center gap-2 ${
                  controlledNodes.has(0)
                    ? "border-rose-400 bg-rose-500/25 text-rose-300 shadow-[0_0_30px_rgba(239,68,68,0.4)] scale-105"
                    : "border-cyan-400/40 bg-cyan-400/5 text-cyan-300 hover:border-cyan-400/70 hover:bg-cyan-400/10 hover:scale-105"
                }`}
              >
                <span className="text-4xl">{controlledNodes.has(0) ? "💀" : "🖥️"}</span>
                <span>{controlledNodes.has(0) ? "SEIZED" : "CENTRAL SERVER"}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-w-[260px] mx-auto">
              {distributedPositions.map((node, i) => {
                const isControlled = controlledNodes.has(i);
                const isCentral = i === 0;
                return (
                  <button
                    key={i}
                    onClick={() => handleNodeClick(i)}
                    style={{ gridColumn: node.x + 1, gridRow: node.y + 1 }}
                    className={`aspect-square rounded-xl border font-mono text-[9px] font-bold transition-all flex flex-col items-center justify-center gap-1 relative overflow-hidden ${
                      isControlled
                        ? "border-rose-400 bg-rose-500/20 text-rose-300 shadow-[0_0_15px_rgba(239,68,68,0.3)] scale-105"
                        : "border-emerald-400/30 bg-emerald-400/5 text-emerald-300 hover:border-emerald-400/60 hover:bg-emerald-400/10 hover:scale-105"
                    }`}
                  >
                    {isControlled && <div className="absolute inset-0 bg-rose-500/10 animate-pulse" />}
                    <span className="text-base relative z-10">{isControlled ? "💀" : isCentral ? "🌐" : "⬡"}</span>
                    <span className="relative z-10 text-[8px]">{isCentral ? "HUB" : node.label}</span>
                    {isControlled && <span className="relative z-10 text-[7px] text-rose-400">SEIZED</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Attacking animation */}
      <AnimatePresence>
        {phase === "attacking" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 py-8 rounded-2xl border border-rose-400/20 bg-rose-500/5"
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="text-5xl"
            >
              ⚡
            </motion.div>
            <p className="font-mono text-xs text-rose-400 tracking-widest uppercase animate-pulse">
              Executing double-spend attack...
            </p>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div key={i} className="w-2 h-2 rounded-full bg-rose-400"
                  animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 0.7, delay: i * 0.14, repeat: Infinity }}
                />
              ))}
            </div>
            <p className="text-[10px] font-mono text-slate-500">Forging conflicting transaction records...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {phase === "result" && attackResult && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 120 }}
            className={`rounded-2xl border p-5 text-center space-y-3 ${
              attackResult === "success"
                ? "bg-rose-500/10 border-rose-400/40"
                : "bg-emerald-500/10 border-emerald-400/40"
            }`}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="text-5xl"
            >
              {attackResult === "success" ? "💥" : "🛡️"}
            </motion.div>
            <h4 className={`text-base font-bold ${attackResult === "success" ? "text-rose-300" : "text-emerald-300"}`}>
              {attackResult === "success"
                ? mode === "centralized"
                  ? "ATTACK SUCCEEDED — Centralized Failure Demonstrated!"
                  : "51% ATTACK SUCCEEDED — Network Compromised!"
                : "ATTACK BLOCKED — Distributed Ledger Held!"}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
              {attackResult === "success" && mode === "centralized"
                ? "You controlled just 1 node — the central server — and instantly rewrote the entire ledger. This is why centralized systems are dangerous."
                : attackResult === "success" && mode === "distributed"
                ? "With 51% of nodes you forged a majority. In real blockchains this costs billions in mining hardware. The math protects at scale."
                : "You couldn't reach 51%. The honest majority of nodes rejected your fraudulent transaction. The distributed design worked!"}
            </p>
            <div className="flex justify-center gap-3 pt-1 flex-wrap">
              <button onClick={resetGame}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-xs font-mono text-slate-200 hover:bg-white/15 transition">
                <RotateCcw className="w-3.5 h-3.5" /> Try Again
              </button>
              {scenariosWon.length < 2 && (
                <button onClick={() => switchMode(mode === "centralized" ? "distributed" : "centralized")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-xs font-mono text-cyan-300 hover:bg-cyan-500/30 transition">
                  Try {mode === "centralized" ? "Distributed" : "Centralized"} <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {scenariosWon.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-500/15 border border-emerald-400/30 rounded-xl p-3 text-emerald-300 text-xs font-mono"
              >
                ✨ Both scenarios completed! Proceeding to completion...
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attack button */}
      {phase === "playing" && (
        <button onClick={handleAttack} disabled={!canAttack}
          className={`w-full py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-widest transition-all border ${
            canAttack
              ? "bg-rose-500/25 border-rose-400/60 text-rose-300 hover:bg-rose-500/35 shadow-[0_0_20px_rgba(239,68,68,0.25)] hover:shadow-[0_0_35px_rgba(239,68,68,0.45)] hover:scale-[1.01]"
              : "bg-white/5 border-white/10 text-slate-600 cursor-not-allowed"
          }`}
        >
          {canAttack
            ? "⚡ Execute Double-Spend Attack!"
            : `Seize more nodes... (${controlledCount}/${mode === "centralized" ? 1 : 5} needed)`}
        </button>
      )}

      {/* Progress tracker */}
      <div className="flex gap-2">
        {(["centralized", "distributed"] as GameMode[]).map((m) => (
          <div key={m}
            className={`flex-1 flex items-center gap-2 rounded-xl border px-3 py-2 text-[10px] font-mono transition-all ${
              scenariosWon.includes(m)
                ? "bg-emerald-500/10 border-emerald-400/30 text-emerald-400"
                : "bg-white/5 border-white/10 text-slate-500"
            }`}
          >
            {scenariosWon.includes(m) ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Lock className="w-3 h-3" />}
            <span>{m === "centralized" ? "Central Pwned" : "51% Achieved"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */

export default function MercuryChapterOne({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<Step>("landing");
  const [completedSteps, setCompletedSteps] = useState<Step[]>([]);
  const [demoMode, setDemoMode] = useState<"centralized" | "distributed">("centralized");
  const [demoAttacked, setDemoAttacked] = useState(false);
  const [demoNodeDown, setDemoNodeDown] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const markComplete = (s: Step) => {
    setCompletedSteps((prev) => (prev.includes(s) ? prev : [...prev, s]));
  };

  const goToStep = (s: Step) => {
    markComplete(step);
    setStep(s);
    setTimeout(() => contentRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 50);
  };

  const isStepUnlocked = (s: Step) => {
    return true;
  };

  const currentIdx = STEP_ORDER.indexOf(step);

  useEffect(() => {
    const notifyState = () => {
      const urlMapping: Record<Step, string> = {
        landing: "briefing",
        theory: "core-theory",
        demo: "live-demo",
        quiz: "knowledge-check",
        game: "attack-simulator",
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
      setDemoAttacked(false);
      setDemoNodeDown(null);
      setDemoMode("centralized");
      setCompletedSteps([]);
      setStep("landing");
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

  const currentHint = SIDEBAR_TASKS.find((t) => t.id === step)?.hint ?? "Select a step to begin your mission.";

  const urlMap: Record<Step, string> = {
    landing: "cosmosx://mercury/ch1/mission-brief",
    theory: "cosmosx://mercury/ch1/core-theory",
    demo: "cosmosx://mercury/ch1/live-demo",
    quiz: "cosmosx://mercury/ch1/knowledge-check",
    game: "cosmosx://mercury/ch1/attack-simulator",
    complete: "cosmosx://mercury/ch1/complete",
  };

  return (
    <div className="flex flex-col h-full bg-[#040816] text-white overflow-hidden">

      {/* Body */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── LEFT SIDEBAR ── */}
        <aside className="w-56 shrink-0 border-r border-white/8 bg-slate-950/50 flex flex-col overflow-hidden">
          <div className="px-4 pt-4 pb-3 border-b border-white/8">
            <p className="font-mono text-[8px] text-slate-500 uppercase tracking-[0.3em]">Chapter 01</p>
            <h2 className="font-rushblade text-sm text-white mt-1 leading-snug">Trust Is a System Design</h2>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-2.5 space-y-1">
            {SIDEBAR_TASKS.map((task, i) => {
              const isDone = completedSteps.includes(task.id);
              const isActive = step === task.id;
              const unlocked = isStepUnlocked(task.id);

              return (
                <button key={task.id} onClick={() => unlocked && setStep(task.id)} disabled={!unlocked}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all text-[11px] font-mono ${
                    isActive
                      ? "bg-cyan-500/15 border border-cyan-400/30 text-cyan-300"
                      : isDone
                      ? "bg-emerald-500/8 border border-emerald-400/15 text-emerald-400 hover:bg-emerald-500/12"
                      : unlocked
                      ? "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                      : "text-slate-700 cursor-not-allowed"
                  }`}
                >
                  <span className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 text-[9px] ${
                    isDone
                      ? "border-emerald-400/60 bg-emerald-400/15 text-emerald-400"
                      : isActive
                      ? "border-cyan-400/60 bg-cyan-400/15 text-cyan-400"
                      : unlocked
                      ? "border-white/20 text-slate-500"
                      : "border-white/8 text-slate-700"
                  }`}>
                    {isDone ? "✓" : !unlocked ? <Lock className="w-2.5 h-2.5" /> : task.icon}
                  </span>
                  <span className="truncate">{task.label}</span>
                </button>
              );
            })}
          </nav>

          {/* NOVA AI Guide */}
          <div className="mx-3 mb-3 p-3 rounded-xl border border-violet-400/20 bg-violet-400/5 shrink-0">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Bot className="w-3.5 h-3.5 text-violet-300" />
              <span className="text-[8px] font-mono text-violet-300 uppercase tracking-wider">NOVA · AI Guide</span>
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[9px] text-slate-400 leading-relaxed">{currentHint}</p>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main ref={contentRef} className="flex-1 overflow-y-auto relative">
          {/* Subtle URL bar */}
          <div className="sticky top-0 z-10 flex items-center gap-2 px-4 py-1.5 bg-[#040816]/95 border-b border-white/5 backdrop-blur-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-mono text-[9px] text-slate-600 truncate">{urlMap[step]}</span>
          </div>

          <AnimatePresence mode="wait">

            {/* ── STEP 0: LANDING HERO ── */}
            {step === "landing" && (
              <motion.div
                key="landing"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="p-6 md:p-8 grid lg:grid-cols-2 gap-8 items-start min-h-[calc(100%-40px)]"
              >
                {/* Left: Text */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 font-mono text-[10px] uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      Chapter 01 · ~8 min
                    </span>
                    <span className="px-2.5 py-1 rounded-full border border-emerald-400/20 bg-emerald-400/8 text-emerald-400 font-mono text-[10px]">Beginner</span>
                  </div>

                  <div>
                    <h1 className="font-rushblade text-3xl md:text-4xl leading-tight text-white">
                      ONE SERVER CAN DECIDE{" "}
                      <span className="text-cyan-400" style={{ textShadow: "0 0 24px rgba(34,211,238,0.5)" }}>
                        EVERYONE'S
                      </span>{" "}
                      REALITY.
                    </h1>
                    <p className="text-sm text-slate-400 leading-7 mt-4 max-w-md">
                      Mercury Command's entire network routes through a single server. Every outpost trusts its record absolutely. In this mission, you'll witness what happens when that trust is misplaced — and discover the mathematical solution that changed finance forever.
                    </p>
                  </div>

                  {/* Mission checklist */}
                  <div className="space-y-2.5">
                    <p className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">Mission Objectives</p>
                    {[
                      { icon: "📖", label: "Core Theory", desc: "Understand why centralized systems collapse", color: "#22d3ee" },
                      { icon: "🔬", label: "Live Demo", desc: "Simulate a real node outage and observe the outcome", color: "#8b5cf6" },
                      { icon: "❓", label: "Knowledge Check", desc: "Score 2/3 to unlock the simulator", color: "#f59e0b" },
                      { icon: "⚔️", label: "51% Attack Sim", desc: "Execute a double-spend in both network types", color: "#ef4444" },
                    ].map((item, i) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + i * 0.08 }}
                        className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/3 px-4 py-2.5 hover:bg-white/5 transition"
                        style={{ borderLeftColor: item.color, borderLeftWidth: "2px" }}
                      >
                        <span className="text-lg shrink-0">{item.icon}</span>
                        <div>
                          <p className="text-xs font-semibold text-white">{item.label}</p>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">{item.desc}</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-700 ml-auto shrink-0" />
                      </motion.div>
                    ))}
                  </div>

                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    onClick={() => goToStep("theory")}
                    className="flex items-center gap-2.5 px-7 py-4 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-[0_0_32px_rgba(34,211,238,0.4)] hover:shadow-[0_0_48px_rgba(34,211,238,0.6)] hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Enter the Virtual Browser
                  </motion.button>
                </div>

                {/* Right: Hub-and-Spoke SVG */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="relative rounded-2xl border border-cyan-400/15 bg-slate-950/80 overflow-hidden"
                  style={{ minHeight: "320px" }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.05)_0%,transparent_70%)]" />
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <HubAndSpokeSVG />
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 font-mono text-[8px] text-cyan-400/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    AI VISUAL EXPLAINER · LIVE
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-lg border border-white/8 bg-black/40 font-mono text-[8px] text-slate-500">
                    CENTRALIZED MODEL
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* ── STEP 1: THEORY ── */}
            {step === "theory" && (
              <motion.div
                key="theory"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="p-6 md:p-8 space-y-6 w-full max-w-7xl"
              >
                <div>
                  <p className="font-mono text-[9px] text-cyan-400 uppercase tracking-[0.3em] mb-1">Core Theory</p>
                  <h2 className="text-2xl font-bold text-white">Why Centralized Systems Fail</h2>
                  <p className="text-sm text-slate-400 mt-1 max-w-xl">Compare what happens when the two architectures face the same threat.</p>
                </div>

                {/* Two-column layout grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
                  
                  {/* Left Column: text cards, glossary and buttons */}
                  <div className="lg:col-span-6 space-y-4">
                    {/* Theory cards */}
                    <div className="space-y-3">
                      {THEORY_CARDS.map((card, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + i * 0.1 }}
                          className="rounded-xl border border-white/10 bg-slate-950/60 p-4 flex gap-4 relative overflow-hidden"
                          style={{ borderLeftColor: card.border, borderLeftWidth: "3px" }}
                        >
                          <div className="absolute top-0 left-0 w-full h-full opacity-50"
                            style={{ background: `linear-gradient(135deg, ${card.color}06 0%, transparent 60%)` }}
                          />
                          <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center relative z-10"
                            style={{ color: card.color, backgroundColor: card.bg }}>
                            {card.icon}
                          </div>
                          <div className="relative z-10 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-bold" style={{ color: card.color }}>{card.title}</h4>
                              <span className="px-1.5 py-0.5 rounded font-mono text-[7px] uppercase tracking-wider"
                                style={{ color: card.color, backgroundColor: `${card.color}15`, border: `1px solid ${card.color}30` }}>
                                {card.tag}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">{card.text}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Glossary pills */}
                    <div className="rounded-xl border border-white/8 bg-slate-950/40 p-4">
                      <p className="font-mono text-[8px] text-slate-500 uppercase tracking-widest mb-3">Key Terms Glossary</p>
                      <div className="flex flex-wrap gap-2">
                        {GLOSSARY_TERMS.map((kt) => (
                          <span key={kt.term}
                            className="px-3 py-1.5 rounded-full text-[10px] font-mono border cursor-default hover:scale-105 transition-transform"
                            style={{ borderColor: `${kt.color}40`, color: kt.color, backgroundColor: `${kt.color}10` }}
                          >
                            {kt.term}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button onClick={() => goToStep("demo")}
                      className="flex items-center gap-2 px-6 py-3 bg-cyan-400/15 border border-cyan-400/35 text-cyan-300 hover:bg-cyan-400/25 hover:border-cyan-400/60 font-bold text-sm rounded-xl transition-all cursor-pointer">
                      I understand — Try the Live Demo <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Right Column: Visual simulation viewer stacked vertically */}
                  <div className="lg:col-span-6 space-y-4">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="rounded-2xl border border-rose-400/25 bg-[#0a0610]/80 p-4 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        <p className="font-mono text-[9px] text-rose-400 uppercase tracking-wider">Centralized — After Attack</p>
                      </div>
                      <div className="aspect-video flex items-center justify-center">
                        <CentralizedCollapseGraphic attacked={true} />
                      </div>
                      <p className="text-[10px] text-rose-300/70 font-mono text-center">All 6 client nodes lose access instantly</p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 }}
                      className="rounded-2xl border border-emerald-400/25 bg-[#040e0a]/80 p-4 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="font-mono text-[9px] text-emerald-400 uppercase tracking-wider">Distributed — 1 Down, 6 Alive</p>
                      </div>
                      <div className="aspect-video flex items-center justify-center">
                        <DistributedMeshGraphic nodeDown={2} />
                      </div>
                      <p className="text-[10px] text-emerald-300/70 font-mono text-center">Network operates at 86% capacity</p>
                    </motion.div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* ── STEP 2: INTERACTIVE DEMO ── */}
            {step === "demo" && (
              <motion.div
                key="demo"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="p-6 md:p-8 space-y-6 w-full max-w-7xl"
              >
                <div>
                  <p className="font-mono text-[9px] text-purple-400 uppercase tracking-[0.3em] mb-1">Interactive Demo</p>
                  <h2 className="text-2xl font-bold text-white">Pull the Failure Lever</h2>
                  <p className="text-sm text-slate-400 mt-1">Choose a network topology, then simulate an attack. See the difference live.</p>
                </div>

                {/* Two-column layout grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
                  
                  {/* Left Column: Selectors, trigger buttons, logs, CTA */}
                  <div className="lg:col-span-5 space-y-4">
                    {/* Toggle */}
                    <div className="flex flex-col gap-3">
                      {(["centralized", "distributed"] as const).map((m) => (
                        <button key={m}
                          onClick={() => { setDemoMode(m); setDemoAttacked(false); setDemoNodeDown(null); }}
                          className={`rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                            demoMode === m
                              ? m === "centralized"
                                ? "border-rose-400/60 bg-rose-500/10 shadow-[0_0_20px_rgba(239,68,68,0.12)]"
                                : "border-emerald-400/60 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.12)]"
                              : "border-white/10 hover:border-white/20 hover:bg-white/3"
                          }`}
                        >
                          <div className={`text-2xl mb-2 ${m === "centralized" ? "text-rose-400" : "text-emerald-400"}`}>
                            {m === "centralized" ? "🖥️" : "🌐"}
                          </div>
                          <h4 className="text-sm font-bold text-white">{m === "centralized" ? "Central Command" : "Distributed Ledger"}</h4>
                          <p className="text-xs text-slate-400 mt-1">{m === "centralized" ? "One owner. One source. One failure point." : "Independent peers can compare copies."}</p>
                        </button>
                      ))}
                    </div>

                    {/* Node trigger action buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          if (demoMode === "centralized") setDemoAttacked(true);
                          else setDemoNodeDown(Math.floor(Math.random() * 7));
                        }}
                        className={`flex-1 py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-widest transition-all border cursor-pointer ${
                          demoMode === "centralized"
                            ? "bg-rose-500/20 border-rose-400/50 text-rose-300 hover:bg-rose-500/30 hover:shadow-[0_0_16px_rgba(239,68,68,0.2)]"
                            : "bg-amber-500/20 border-amber-400/50 text-amber-300 hover:bg-amber-500/30"
                        }`}
                      >
                        ⚡ Simulate Outage
                      </button>
                      <button onClick={() => { setDemoAttacked(false); setDemoNodeDown(null); }}
                        className="px-4 py-3 rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 text-xs font-mono transition cursor-pointer">
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Distributed node pickers */}
                    {demoMode === "distributed" && !demoNodeDown && (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-500 font-mono text-center">Or click a node to simulate it going offline:</p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {Array.from({ length: 7 }, (_, i) => (
                            <button key={i} onClick={() => setDemoNodeDown(i)}
                              className="w-10 h-10 rounded-xl border border-emerald-400/30 bg-emerald-400/5 text-emerald-300 font-mono text-xs hover:border-rose-400/50 hover:bg-rose-500/10 hover:text-rose-300 transition cursor-pointer">
                              N{i + 1}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {(demoAttacked || demoNodeDown !== null) && (
                      <motion.button
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => goToStep("quiz")}
                        className="w-full py-3 bg-cyan-400 text-slate-950 font-bold text-sm rounded-xl hover:bg-cyan-300 transition-all shadow-[0_0_24px_rgba(34,211,238,0.3)] hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
                      >
                        I've seen enough — Take the Quiz <ChevronRight className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>

                  {/* Right Column: Visual simulation viewer */}
                  <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-slate-950/80 p-5 self-stretch flex flex-col justify-between">
                    <div className="h-56 flex items-center justify-center">
                      {demoMode === "centralized" ? (
                        <CentralizedCollapseGraphic attacked={demoAttacked} />
                      ) : (
                        <DistributedMeshGraphic nodeDown={demoNodeDown} />
                      )}
                    </div>

                    <motion.div
                      key={`${demoAttacked}-${demoNodeDown}-${demoMode}`}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-4 rounded-xl p-3 text-xs font-mono transition-all ${
                        demoAttacked || demoNodeDown !== null
                          ? demoMode === "centralized"
                            ? "bg-rose-500/10 border border-rose-400/20 text-rose-200"
                            : "bg-emerald-500/10 border border-emerald-400/20 text-emerald-200"
                          : "bg-white/5 border border-white/5 text-slate-500"
                      }`}
                    >
                      {demoAttacked || demoNodeDown !== null
                        ? demoMode === "centralized"
                          ? "⚠ Central server offline. All 6 client nodes lost access instantly. The entire network is dark."
                          : `⚡ Node N${(demoNodeDown ?? 0) + 1} went offline. The remaining ${7 - 1} peers preserve the record. Network operating at 86% capacity.`
                        : "Click 'Simulate Outage' to see what happens when the system is challenged."}
                    </motion.div>
                  </div>

                </div>

              </motion.div>
            )}

            {/* ── STEP 3: QUIZ ── */}
            {step === "quiz" && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="p-6 md:p-8 space-y-5"
              >
                <div>
                  <p className="font-mono text-[9px] text-amber-400 uppercase tracking-[0.3em] mb-1">Knowledge Check</p>
                  <h2 className="text-2xl font-bold text-white">Checkpoint Verified?</h2>
                  <p className="text-sm text-slate-400 mt-1">Answer 3 questions. Score ≥ 2/3 to unlock the 51% Attack Simulator.</p>
                </div>

                <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 flex items-center gap-3">
                  <Star className="w-4 h-4 text-amber-400 shrink-0" />
                  <p className="text-[11px] text-amber-200 font-mono">
                    Answers are auto-submitted. Read each question carefully before clicking.
                  </p>
                </div>

                <QuizSection onPass={() => goToStep("game")} />
              </motion.div>
            )}

            {/* ── STEP 4: ATTACK SIMULATOR ── */}
            {step === "game" && (
              <motion.div
                key="game"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="p-6 md:p-8 space-y-5"
              >
                <div>
                  <p className="font-mono text-[9px] text-rose-400 uppercase tracking-[0.3em] mb-1">Mission: 51% Attack Simulator</p>
                  <h2 className="text-2xl font-bold text-white">Become the Attacker</h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Experience both sides: show how easy it is to attack a centralized system, then try (and fail) against a distributed one.
                  </p>
                </div>

                <div className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-3 flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <p className="text-[11px] text-rose-200 font-mono">
                    Complete <strong>both</strong> the Centralized and Distributed scenarios to finish Chapter 1.
                  </p>
                </div>

                <AttackSimulatorGame
                  onWin={() => {
                    markComplete("game");
                    setStep("complete");
                  }}
                />
              </motion.div>
            )}

            {/* ── STEP 5: COMPLETE ── */}
            {step === "complete" && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6 md:p-8 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] text-center space-y-6"
              >
                {/* Stars */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex gap-3"
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -40, y: 20 }}
                      animate={{ scale: 1, rotate: 0, y: 0 }}
                      transition={{
                        delay: 0.4 + i * 0.18,
                        type: "spring",
                        stiffness: 220,
                        damping: 12,
                      }}
                    >
                      <Star className="w-10 h-10 text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Trophy */}
                <motion.div
                  initial={{ scale: 0, y: 30 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 140, damping: 14 }}
                  className="w-28 h-28 rounded-full bg-amber-400/15 border-2 border-amber-400/50 flex items-center justify-center"
                  style={{ boxShadow: "0 0 60px rgba(251,191,36,0.3), 0 0 120px rgba(251,191,36,0.1)" }}
                >
                  <Trophy className="w-12 h-12 text-amber-400" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h2 className="font-rushblade text-3xl text-white">Chapter 1 Complete!</h2>
                  <p className="text-slate-400 mt-2 text-sm max-w-md mx-auto leading-relaxed">
                    You've witnessed why centralized systems are fragile, demonstrated the 51% attack in both network types, and earned your first badge.
                  </p>
                </motion.div>

                {/* Stat cards */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex gap-3 items-stretch w-full max-w-sm"
                >
                  {[
                    { label: "XP Earned", value: "+100", sub: "", color: "#22d3ee", icon: "⚡" },
                    { label: "Badge", value: "🏅", sub: "First Block", color: "#f59e0b", icon: "" },
                    { label: "Progress", value: "1/8", sub: "modules", color: "#8b5cf6", icon: "" },
                  ].map((s) => (
                    <div key={s.label} className="flex-1 rounded-2xl border p-4 text-center space-y-1"
                      style={{ borderColor: `${s.color}30`, backgroundColor: `${s.color}08` }}>
                      <p className="font-mono text-[9px] uppercase tracking-wider" style={{ color: s.color }}>{s.label}</p>
                      <p className="font-rushblade text-2xl" style={{ color: s.color }}>{s.value}</p>
                      {s.sub && <p className="text-[9px] font-mono" style={{ color: s.color + "99" }}>{s.sub}</p>}
                    </div>
                  ))}
                </motion.div>

                {/* Module progress bar */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.0 }}
                  className="w-full max-w-sm space-y-1.5"
                >
                  <div className="flex justify-between text-[9px] font-mono text-slate-500">
                    <span>Module Progress</span><span>1 / 8</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "12.5%" }}
                      transition={{ delay: 1.1, duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-linear-to-r from-cyan-500 to-cyan-300 rounded-full shadow-[0_0_6px_rgba(34,211,238,0.5)]"
                    />
                  </div>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  onClick={onComplete}
                  className="flex items-center gap-2.5 px-8 py-4 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-[0_0_32px_rgba(34,211,238,0.4)] hover:shadow-[0_0_50px_rgba(34,211,238,0.6)] hover:scale-[1.03] active:scale-[0.98]"
                >
                  Open Field Lab Tasks
                  <ChevronRight className="w-4 h-4" />
                </motion.button>

                <p className="text-[10px] text-slate-600 font-mono">
                  Proceeding to: Map the Middlemen → Corrupted Command → Trade Dilemma
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Rocket,
  Camera,
  Hospital,
  Calculator,
  Send,
  GraduationCap,
  Gem,
  ShoppingBag,
  Image as ImageIcon,
  Lightbulb,
  ChevronRight,
  ArrowRight,
  Database,
  Layers,
  AlertTriangle,
} from "lucide-react";
import TaskWorkspaceLayout from "./TaskWorkspaceLayout";
import { saveTaskScore } from "@/lib/module1-store";

interface Props {
  onComplete: () => void;
}

type Assignment = "blockchain" | "database" | null;

interface ScenarioCard {
  id: number;
  iconType: any;
  title: string;
  description: string;
  correct: "blockchain" | "database";
  reason: string;
  reasonOptions: string[];
  correctReasonIdx: number;
}

const SCENARIOS: ScenarioCard[] = [
  {
    id: 1,
    iconType: Camera,
    title: "Instagram Clone",
    description: "A social media app where users post photos and follow each other. One company manages all data.",
    correct: "database",
    reason: "One trusted company manages data. High speed and scalability needed. No trustless verification required.",
    reasonOptions: [
      "Users distrust the platform",
      "One trusted company manages data. High speed and scalability needed. No trustless verification required.",
      "Photos need to be tamper-proof",
      "Multiple competing companies share data",
    ],
    correctReasonIdx: 1,
  },
  {
    id: 2,
    iconType: Hospital,
    title: "Hospital Data Sharing",
    description: "Multiple hospitals need to share patient records securely. No single hospital should control all data.",
    correct: "blockchain",
    reason: "Multiple untrusting parties sharing sensitive data. Need tamper-proof records. No single authority.",
    reasonOptions: [
      "Hospitals trust each other completely",
      "Need speed above all else",
      "Multiple untrusting parties sharing data. Need tamper-proof records. No single authority.",
      "Only one hospital is involved",
    ],
    correctReasonIdx: 2,
  },
  {
    id: 3,
    iconType: Calculator,
    title: "Calculator App",
    description: "A simple calculator that adds and multiplies numbers for individual users.",
    correct: "database",
    reason: "No data storage or multi-party trust needed. Overkill.",
    reasonOptions: [
      "Calculations need to be tamper-proof",
      "Multiple users need to share results",
      "No data storage or multi-party trust needed. Overkill.",
      "Privacy is critical for calculations",
    ],
    correctReasonIdx: 2,
  },
  {
    id: 4,
    iconType: Send,
    title: "Cross-Border Payments",
    description: "Sending money from India to USA without a bank charging $40 and taking 3 days.",
    correct: "blockchain",
    reason: "Multiple untrusting parties need fast, low-fee, trustless settlement without intermediaries.",
    reasonOptions: [
      "Banks fully trust each other already",
      "Only one country is involved",
      "Multiple untrusting parties need fast, low-fee, trustless settlement without intermediaries.",
      "Speed isn't important for payments",
    ],
    correctReasonIdx: 2,
  },
  {
    id: 5,
    iconType: GraduationCap,
    title: "College Attendance System",
    description: "Tracking which students attended which classes at a single university.",
    correct: "database",
    reason: "One trusted institution manages data. Simple read/write operations. No external parties.",
    reasonOptions: [
      "Students distrust the university completely",
      "Multiple universities compete for the data",
      "One trusted institution manages data. Simple read/write operations. No external parties.",
      "Attendance records must be public globally",
    ],
    correctReasonIdx: 2,
  },
  {
    id: 6,
    iconType: Gem,
    title: "Supply Chain Tracking",
    description: "Tracking a diamond from mine → cutter → shipper → customs → jeweler → retailer across 4 countries.",
    correct: "blockchain",
    reason: "Multiple untrusting parties across countries. Need tamper-proof provenance. Transparency critical.",
    reasonOptions: [
      "Only one company ships the diamond",
      "Speed is more important than transparency",
      "Multiple untrusting parties across countries. Need tamper-proof provenance. Transparency critical.",
      "Diamonds don't need tracking",
    ],
    correctReasonIdx: 2,
  },
  {
    id: 7,
    iconType: ShoppingBag,
    title: "Food Delivery App",
    description: "Users order food from restaurants, a driver delivers it. One platform manages orders.",
    correct: "database",
    reason: "One trusted platform manages high-speed orders. No need for trustless verification.",
    reasonOptions: [
      "Restaurants distrust each other",
      "Orders must be tamper-proof and public",
      "One trusted platform manages high-speed orders. No need for trustless verification.",
      "Multiple platforms compete to record each order",
    ],
    correctReasonIdx: 2,
  },
  {
    id: 8,
    iconType: ImageIcon,
    title: "Digital Asset Marketplace",
    description: "Artists sell unique digital artworks globally with verifiable ownership and automatic resale royalties.",
    correct: "blockchain",
    reason: "Need provable unique ownership, auto-royalties, and trustless global trading between strangers.",
    reasonOptions: [
      "One gallery controls all artworks",
      "Art doesn't need provenance tracking",
      "Need provable unique ownership, auto-royalties, and trustless global trading between strangers.",
      "Artists fully trust the buyers",
    ],
    correctReasonIdx: 2,
  },
];

export default function Task1_5_CardSorter({ onComplete }: Props) {
  const [currentCard, setCurrentCard] = useState(0);
  const [assignments, setAssignments] = useState<Record<number, Assignment>>({});
  const [reasons, setReasons] = useState<Record<number, number | null>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showHints, setShowHints] = useState<Record<number, boolean>>({});

  const assign = (id: number, type: "blockchain" | "database") => {
    if (submitted) return;
    setAssignments((prev) => ({ ...prev, [id]: type === prev[id] ? null : type }));
    setReasons((prev) => ({ ...prev, [id]: null }));
  };

  const selectReason = (id: number, idx: number) => {
    if (submitted) return;
    setReasons((prev) => ({ ...prev, [id]: idx }));
  };

  const allAssigned = SCENARIOS.every((s) => assignments[s.id]);
  const allReasoned = SCENARIOS.every((s) => assignments[s.id] && reasons[s.id] !== undefined && reasons[s.id] !== null);

  const handleSubmit = () => {
    let s = 0;
    SCENARIOS.forEach((sc) => {
      if (assignments[sc.id] === sc.correct) s += 5;
      if (reasons[sc.id] === sc.correctReasonIdx) s += 5;
    });
    setScore(s);
    setSubmitted(true);
  };

  const passed = score >= 60;

  const getCardHint = (sc: ScenarioCard) => {
    return `For ${sc.title}: Does it require trustless cooperation between multiple competing entities? If yes, select Blockchain and verify its provenance reason.`;
  };

  if (submitted) {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-6 bg-slate-950/20 rounded-2xl border border-white/10">
        <div className={`max-w-md w-full bg-slate-950/80 border rounded-2xl p-6 shadow-2xl text-center space-y-4 ${passed ? "border-emerald-500/30" : "border-amber-500/30"}`}>
          <div className="flex justify-center">
            {passed ? (
              <Layers className="w-12 h-12 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-12 h-12 text-amber-400 animate-pulse" />
            )}
          </div>
          <h3 className={`font-mono font-bold text-sm tracking-widest uppercase ${passed ? "text-emerald-400" : "text-amber-400"}`}>
            {passed ? "Launch Platform Unlocked!" : "Calibration Incomplete"}
          </h3>
          <p className="text-white font-mono text-lg font-bold">
            Score: <span className={passed ? "text-emerald-400" : "text-amber-400"}>{score}</span>
            <span className="text-slate-500 text-sm"> / 80</span>
          </p>
          <p className="text-slate-400 font-mono text-xs">
            {passed
              ? "Verification score threshold passed (60+). Launch platform systems aligned."
              : "Minimum verification score 60 required. Please review technology properties and retry."}
          </p>

          {/* Grid results */}
          <div className="grid grid-cols-4 gap-1.5 text-[9px] font-mono select-none">
            {SCENARIOS.map((sc) => {
              const Icon = sc.iconType;
              const correctPlace = assignments[sc.id] === sc.correct;
              const correctReason = reasons[sc.id] === sc.correctReasonIdx;
              return (
                <div key={sc.id} className={`rounded-lg p-2 border flex flex-col items-center justify-center ${correctPlace && correctReason ? "border-emerald-500/25 bg-emerald-500/5 text-emerald-400" : "border-white/5 bg-slate-900/40 text-slate-500"}`}>
                  <Icon className="w-3.5 h-3.5 mb-1 text-inherit" />
                  <div className="text-[8px] font-bold">P: {correctPlace ? "+5" : "+0"}</div>
                  <div className="text-[8px] font-bold">R: {correctReason ? "+5" : "+0"}</div>
                </div>
              );
            })}
          </div>

          {passed && (
            <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 text-xs text-slate-300 leading-relaxed text-left">
              <span className="text-amber-400 font-bold font-mono">MODULE DEBRIEF: </span>
              You now understand the fundamental problem blockchain was invented to solve: the trust problem.
              You know <span className="text-cyan-400 font-bold">exactly when blockchain is the right tool</span> — and when it's overkill.
              In Module 2, you'll learn how blockchain actually records transactions: Digital Ledgers.
            </div>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-white/5">
            {!passed && (
              <button
                onClick={() => { setSubmitted(false); setAssignments({}); setReasons({}); setScore(0); setCurrentCard(0); }}
                className="text-[11px] font-mono text-slate-400 hover:text-white transition underline"
              >
                Try Again
              </button>
            )}
            {passed && (
              <>
                <div className="flex items-center gap-1.5 text-[10.5px] font-mono text-emerald-400">
                  <Rocket className="w-4 h-4" />
                  <span>+85 XP · Platform Anchored</span>
                </div>
                <button
                  onClick={() => { saveTaskScore("task1_5", score, 80, passed); onComplete(); }}
                  className="bg-linear-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold px-5 py-2.5 rounded-full text-xs shadow-lg transition font-mono uppercase tracking-wider"
                >
                  Module 1 Complete ✓
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <TaskWorkspaceLayout
      moduleColor="#22d3ee"
      taskTitle="Task 1.5 — Choose Mercury's Technology"
      taskConcept="Relational database vs Distributed ledger"
      theoryContent={
        <div className="space-y-4">
          <div className="space-y-3 text-[11.5px] leading-relaxed text-slate-300">
            <h4 className="font-mono text-cyan-400 font-bold uppercase tracking-wider">The Blockchain Decision Matrix</h4>
            <p>Relational databases represent the industry standard for fast, high-concurrency CRUD storage under trusted institutional scopes.</p>
            <p><strong>Apply Blockchain only if:</strong></p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Multiple separate organizations require data read/write access.</li>
              <li>Incentives conflict and trust is limited.</li>
              <li>No trusted central authority can coordinate logs.</li>
              <li>Chronological immutability is required to prevent data tampering.</li>
            </ul>
            <p className="text-[10.5px] text-slate-400 italic">If any of these conditions are absent, traditional databases are the optimal engineering tool.</p>
          </div>

          {/* Card Navigator */}
          <div className="border border-white/5 bg-slate-900/40 p-2.5 rounded-lg select-none">
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest block mb-1">Card Navigator</span>
              <div className="flex gap-1">
                <button
                  disabled={currentCard === 0}
                  onClick={() => setCurrentCard((c) => c - 1)}
                  className="px-1.5 py-0.5 bg-slate-800 border border-white/5 rounded text-[8px] font-mono text-slate-400 hover:text-white disabled:opacity-30 transition"
                >
                  ◀
                </button>
                <button
                  disabled={currentCard === SCENARIOS.length - 1}
                  onClick={() => setCurrentCard((c) => c + 1)}
                  className="px-1.5 py-0.5 bg-slate-800 border border-white/5 rounded text-[8px] font-mono text-slate-400 hover:text-white disabled:opacity-30 transition"
                >
                  ▶
                </button>
              </div>
            </div>
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {SCENARIOS.map((sc, i) => {
                const isCurrent = currentCard === i;
                const chosen = assignments[sc.id];
                const hasReason = reasons[sc.id] !== undefined && reasons[sc.id] !== null;
                const done = chosen && hasReason;
                return (
                  <button
                    key={sc.id}
                    onClick={() => setCurrentCard(i)}
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[9px] transition-all duration-300 ${
                      isCurrent
                        ? "bg-cyan-500 text-slate-950 font-bold scale-110 shadow-lg shadow-cyan-500/20"
                        : done
                        ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                        : chosen
                        ? "bg-blue-500/20 border border-blue-500/30 text-blue-400"
                        : "bg-slate-800 border border-white/5 text-slate-400 hover:border-slate-500"
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      }
      challengeContent={
        <div className="space-y-3">
          <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3 select-none">
            <span className="text-[9px] font-mono text-slate-400 uppercase block mb-1">System Overview Progress</span>
            <div className="grid grid-cols-2 gap-2 text-center text-[8.5px] font-mono font-bold">
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 py-1 rounded">🟢 BLOCKCHAIN</span>
              <span className="bg-blue-500/10 text-blue-400 border border-blue-500/25 py-1 rounded">🔵 DATABASE</span>
            </div>
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1.5 scrollbar-thin">
            {SCENARIOS.map((sc, i) => {
              const Icon = sc.iconType;
              const chosen = assignments[sc.id];
              const isCurrent = currentCard === i;
              return (
                <button
                  key={sc.id}
                  onClick={() => setCurrentCard(i)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                    isCurrent
                      ? "bg-slate-800 border-cyan-400 shadow-md shadow-cyan-950/20"
                      : chosen
                      ? "bg-slate-900/40 border-white/10 opacity-70"
                      : "bg-slate-950/60 border-white/5"
                  } hover:bg-slate-900/80 hover:border-white/20`}
                >
                  <div className="flex gap-2 items-center justify-between">
                    <div className="flex gap-2 items-center min-w-0">
                      <div className={`p-1.5 bg-slate-900 border rounded-lg ${isCurrent ? "text-cyan-400 border-cyan-400/40" : "text-slate-400 border-white/5"}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-bold text-white truncate leading-tight">{sc.title}</span>
                    </div>
                    <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${
                      chosen
                        ? chosen === "blockchain"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-blue-500/15 text-blue-400"
                        : "bg-slate-800 text-slate-500"
                    }`}>
                      {chosen ? chosen.toUpperCase() : "PENDING"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      }
      labContent={
        <div className="space-y-3">
          {/* Active Card interactive panel */}
          <AnimatePresence mode="wait">
            {(() => {
              const sc = SCENARIOS[currentCard];
              const Icon = sc.iconType;
              const chosen = assignments[sc.id];
              const chosenReason = reasons[sc.id];
              const showHint = showHints[sc.id] || false;

              return (
                <motion.div key={currentCard} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="bg-slate-900/60 border border-white/10 p-3.5 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-[10px] border-b border-white/5 pb-2">
                    <span className="font-bold text-white flex items-center gap-1.5 font-mono">
                      <Icon className="w-4 h-4 text-cyan-400" />
                      {sc.title}
                    </span>
                    <span className={`text-[8.5px] font-mono px-2 py-0.5 rounded ${chosen ? chosen === "blockchain" ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400" : "bg-slate-950 text-slate-500"}`}>
                      {chosen ? chosen.toUpperCase() : "ASSIGN"}
                    </span>
                  </div>

                  <div className="text-[10.5px] text-slate-300 leading-normal mb-1 font-sans">
                    {sc.description}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => assign(sc.id, "blockchain")}
                      className={`rounded-lg py-1.5 px-2 text-[9.5px] font-mono border transition-all ${
                        chosen === "blockchain" ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold" : "bg-slate-950 border-white/10 text-slate-400"
                      }`}
                    >
                      🟢 Blockchain
                    </button>
                    <button
                      onClick={() => assign(sc.id, "database")}
                      className={`rounded-lg py-1.5 px-2 text-[9.5px] font-mono border transition-all ${
                        chosen === "database" ? "bg-blue-500/20 border-blue-500/50 text-blue-300 font-bold" : "bg-slate-950 border-white/10 text-slate-400"
                      }`}
                    >
                      🔵 Database
                    </button>
                  </div>

                  {chosen && (
                    <div className="space-y-1.5">
                      <span className="text-[8.5px] font-mono text-slate-500 uppercase tracking-wider block">Verify logic constraint:</span>
                      <div className="space-y-1.5">
                        {sc.reasonOptions.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => selectReason(sc.id, i)}
                            className={`w-full text-left border rounded-lg px-2.5 py-1.5 text-[9px] font-mono leading-relaxed transition-all ${
                              chosenReason === i ? "bg-cyan-500/10 border-cyan-500/35 text-cyan-300 font-semibold" : "bg-slate-950 border-white/5 text-slate-400"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {chosen && chosen !== sc.correct && (
                    <div className="space-y-1 pt-1.5 border-t border-white/5">
                      <button
                        onClick={() => setShowHints((prev) => ({ ...prev, [sc.id]: true }))}
                        className="w-full flex justify-between items-center px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-[8px] text-amber-400 font-mono hover:bg-amber-500/15"
                      >
                        <span>Need a hint?</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                      {showHint && (
                        <div className="bg-amber-950/20 border border-amber-500/25 p-2 rounded text-[8.5px] text-amber-300 leading-relaxed font-mono">
                          {getCardHint(sc)}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })()}
          </AnimatePresence>

          {/* Submit Action */}
          {allReasoned && (
            <button
              onClick={handleSubmit}
              className="w-full bg-linear-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold py-2.5 rounded-full text-[10px] font-rushblade shadow-lg transition uppercase tracking-wider animate-pulse"
            >
              Verify Classification Matrix
            </button>
          )}
        </div>
      }
    />
  );
}

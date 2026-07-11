import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ArrowRight, ChevronRight, Lightbulb, Check, Globe } from "lucide-react";
import TaskWorkspaceLayout from "./TaskWorkspaceLayout";
import { saveTaskScore } from "@/lib/module1-store";

interface Props {
  onComplete: () => void;
}

interface Scenario {
  id: number;
  title: string;
  flow: string[];
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  xpReward: number;
}

const SCENARIOS: Scenario[] = [
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

export default function Task1_1_MiddlemanMapper({ onComplete }: Props) {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selections, setSelections] = useState<Record<number, number>>({});
  const [showExplanations, setShowExplanations] = useState<Record<number, boolean>>({});
  const [showHints, setShowHints] = useState<Record<number, boolean>>({});
  const [allDone, setAllDone] = useState(false);

  const scenario = SCENARIOS[currentScenario];
  const selected = selections[currentScenario] !== undefined ? selections[currentScenario] : null;
  const isCorrect = selected === scenario.correct;
  const showExplanation = showExplanations[currentScenario] || false;
  const showHint = showHints[currentScenario] || false;

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelections((prev) => ({ ...prev, [currentScenario]: idx }));
    setShowExplanations((prev) => ({ ...prev, [currentScenario]: true }));
  };

  const handleNext = () => {
    if (currentScenario < SCENARIOS.length - 1) {
      setCurrentScenario((n) => n + 1);
    } else {
      setAllDone(true);
    }
  };

  const totalScore = SCENARIOS.reduce((acc, sc, idx) => {
    return acc + (selections[idx] === sc.correct ? sc.xpReward : 0);
  }, 0);

  const allAnswered = SCENARIOS.every((_, i) => selections[i] !== undefined);

  const getScenarioTheory = (id: number) => {
    switch (id) {
      case 1:
        return (
          <div className="space-y-3 text-[11.5px] leading-relaxed text-slate-300">
            <h4 className="font-mono text-cyan-400 font-bold uppercase tracking-wider">Centralized Financial Clearing</h4>
            <p>When sending currency to another party digitally, you adjust entry fields in a database rather than handling physical assets.</p>
            <p>Because banks operate isolated databases, they utilize payment routing networks (like UPI or SWIFT) to settle credits and debits.</p>
            <p>This adds multiple layers of third-party clearing, introducing delay, costs, and single-failure endpoints.</p>
          </div>
        );
      case 2:
        return (
          <div className="space-y-3 text-[11.5px] leading-relaxed text-slate-300">
            <h4 className="font-mono text-cyan-400 font-bold uppercase tracking-wider">Platform Governance & Custody</h4>
            <p>E-commerce hubs function as central trade matching brokers. They act as trust escrows and purchase regulators.</p>
            <p>Because the database is owned by a single company (like Amazon), they have root permissions to hold funds or freeze vendor logs at will.</p>
            <p>This shows how centralized authority can reverse transactions or cancel services unilaterally.</p>
          </div>
        );
      case 3:
        return (
          <div className="space-y-3 text-[11.5px] leading-relaxed text-slate-300">
            <h4 className="font-mono text-cyan-400 font-bold uppercase tracking-wider">Data Ownership Limits</h4>
            <p>Uploading files or publishing posts on social networks puts your media in database storage arrays owned by platform companies.</p>
            <p>The platform possesses full read/write/delete privileges over the files, which limits your actual control over your content.</p>
            <p>Content flags or account blocks can delete your digital media instantly with no alternative copy.</p>
          </div>
        );
      case 4:
        return (
          <div className="space-y-3 text-[11.5px] leading-relaxed text-slate-300">
            <h4 className="font-mono text-cyan-400 font-bold uppercase tracking-wider">Cloud Dependencies</h4>
            <p>Online file hosting storage gives convenient multi-device access, but keeps the data physical on third-party host servers.</p>
            <p>If security flags or billing issues trigger access restrictions, you lose local access to your file portfolio immediately.</p>
            <p>This shows the need for cryptographically verified local database networks where you control validation keys.</p>
          </div>
        );
      case 5:
        return (
          <div className="space-y-3 text-[11.5px] leading-relaxed text-slate-300">
            <h4 className="font-mono text-cyan-400 font-bold uppercase tracking-wider">Correspondent Settlement Chains</h4>
            <p>Cross-border financial routing cannot connect banks directly. It uses SWIFT network messages across correspondent banks.</p>
            <p>Each bank along the settlement route processes transactions sequentially, adding settlement fees and manual verification delays.</p>
            <p>This explains why international bank transfers require days instead of completing instantly.</p>
          </div>
        );
      default:
        return null;
    }
  };

  const getScenarioHint = (id: number) => {
    switch (id) {
      case 1: return "Hint: Count all intermediate boxes in the flow list (everything between 'You' and 'Friend').";
      case 2: return "Hint: Which platform entity exercises master database access privileges and holds trade escrow?";
      case 3: return "Hint: Since Meta/Instagram owns the server repository, they can alter files anytime.";
      case 4: return "Hint: Account suspension locks you out of the server storage completely.";
      case 5: return "Hint: Correspondent bank routes require multiple business days to verify logs.";
      default: return "";
    }
  };

  if (allDone) {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-6 bg-slate-950/20 rounded-2xl border border-white/10">
        <div className="max-w-md w-full bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl text-center space-y-4">
          <Globe className="w-10 h-10 text-cyan-400 mx-auto" />
          <h3 className="font-rushblade text-emerald-400 text-sm tracking-widest uppercase">
            Sector Scan Complete
          </h3>
          <p className="text-white font-mono text-xs">
            Intermediaries Mapped: <span className="text-cyan-400 font-bold">12 total</span> across 5 scenarios
          </p>
          <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 text-xs text-slate-300 leading-relaxed text-left">
            <span className="text-amber-400 font-bold">DEBRIEF: </span>
            Every system you use depends on middlemen that you must trust with your data and your money.
            They charge fees, add delays, can make mistakes, and can be compromised. Blockchain was invented
            to ask: <span className="text-cyan-400 font-bold">what if we could remove some of these middlemen for specific use cases?</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="text-[10px] font-mono text-slate-400">
              Score: <span className="text-emerald-400 font-bold">{totalScore} XP</span> earned
            </div>
            <button
              onClick={() => { saveTaskScore("task1_1", totalScore, 15, totalScore >= 9); onComplete(); }}
              className="bg-linear-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold px-5 py-2 rounded-full text-[10px] font-rushblade shadow-lg transition uppercase tracking-wider animate-pulse"
            >
              Proceed to Task 1.2 ➔
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TaskWorkspaceLayout
      moduleColor="#22d3ee"
      taskTitle="Task 1.1 — Map the Middlemen"
      taskConcept="Centralized dependencies and trust"
      theoryContent={
        <div className="space-y-4">
          {getScenarioTheory(scenario.id)}
          
          {/* Question Navigator */}
          <div className="border border-white/5 bg-slate-900/40 p-2.5 rounded-lg select-none">
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest block mb-1">Scenario Index</span>
              <div className="flex gap-1">
                <button
                  disabled={currentScenario === 0}
                  onClick={() => setCurrentScenario((c) => c - 1)}
                  className="px-1.5 py-0.5 bg-slate-800 border border-white/5 rounded text-[8px] font-mono text-slate-400 hover:text-white disabled:opacity-30 transition"
                >
                  ◀
                </button>
                <button
                  disabled={currentScenario === SCENARIOS.length - 1}
                  onClick={() => setCurrentScenario((c) => c + 1)}
                  className="px-1.5 py-0.5 bg-slate-800 border border-white/5 rounded text-[8px] font-mono text-slate-400 hover:text-white disabled:opacity-30 transition"
                >
                  ▶
                </button>
              </div>
            </div>
            <div className="flex gap-1.5 mt-1.5">
              {SCENARIOS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentScenario(i)}
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[9px] transition-all duration-300 ${
                    i === currentScenario
                      ? "bg-cyan-500 text-slate-950 font-bold scale-110 shadow-lg shadow-cyan-500/20"
                      : selections[i] !== undefined
                      ? selections[i] === SCENARIOS[i].correct
                        ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                        : "bg-rose-500/20 border border-rose-500/30 text-rose-400"
                      : "bg-slate-800 border border-white/5 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      }
      challengeContent={
        <div className="space-y-4">
          <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3.5">
            <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider block mb-1">Active Scenario</span>
            <h4 className="text-[12px] text-white font-semibold">{scenario.title}</h4>
          </div>

          <div className="bg-slate-900/60 rounded-xl p-4 border border-white/5">
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-3">Transaction Flow</p>
            {/* Elegant Horizontal Wrapping Pipeline Flow */}
            <div className="flex flex-row flex-wrap items-center gap-y-3 gap-x-2">
              {scenario.flow.map((node, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className={`px-2.5 py-1.5 rounded-lg text-[9.5px] font-mono font-bold border transition-all ${
                      i === 0 || i === scenario.flow.length - 1
                        ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-md shadow-cyan-950/20"
                        : "bg-slate-800/80 border-white/10 text-slate-300"
                    }`}
                  >
                    {node}
                  </div>
                  {i < scenario.flow.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-500/50 shrink-0" />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-[9px] font-mono text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              {scenario.flow.length - 2} intermediar{scenario.flow.length - 2 === 1 ? "y" : "ies"} in the path
            </div>
          </div>
        </div>
      }
      labContent={
        <div className="space-y-3">
          <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3">
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Verify question</span>
            <p className="text-[11.5px] text-white font-medium">{scenario.question}</p>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {scenario.options.map((opt, i) => {
              const isSelected = selected === i;
              const isCorrectOpt = i === scenario.correct;
              let style = "bg-slate-900/60 border-white/10 text-slate-300 hover:border-cyan-500/40 hover:bg-slate-800/60";
              if (selected !== null) {
                if (isCorrectOpt) style = "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold";
                else if (isSelected) style = "bg-rose-500/15 border-rose-500/40 text-rose-300";
                else style = "bg-slate-900/40 border-white/5 text-slate-500 opacity-60";
              }
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={selected !== null}
                  className={`text-left border rounded-xl px-3 py-2.5 text-[11px] font-mono transition-all flex items-center justify-between ${style}`}
                >
                  <span>{opt}</span>
                  {selected !== null && isCorrectOpt && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  {selected !== null && isSelected && !isCorrectOpt && <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {showExplanation && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-2">
                <div
                  className={`rounded-xl p-3 border text-[10px] font-mono leading-relaxed ${
                    isCorrect ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300" : "bg-amber-500/10 border-amber-500/25 text-amber-300"
                  }`}
                >
                  <span className="font-bold uppercase tracking-wider">
                    {isCorrect ? "✓ Verified — " : "✗ Conflict — "}
                  </span>
                  {scenario.explanation}
                </div>
                
                {/* Navigation and Submission actions */}
                <div className="flex gap-2">
                  <button
                    onClick={handleNext}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-2 rounded-full text-[10px] font-rushblade shadow-md transition uppercase tracking-wider"
                  >
                    {currentScenario < SCENARIOS.length - 1 ? "Next Scenario" : allAnswered ? "Submit Results" : "Next Scenario"}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hint system */}
          <AnimatePresence>
            {selected !== null && !isCorrect && !showExplanation && (
              <div className="space-y-2">
                <button
                  onClick={() => setShowHints((prev) => ({ ...prev, [currentScenario]: true }))}
                  className="w-full flex items-center justify-between px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] text-amber-400 font-mono hover:bg-amber-500/15"
                >
                  <span className="flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" />
                    Reveal Hint
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                {showHint && (
                  <div className="bg-amber-950/30 border border-amber-500/20 rounded-xl p-3 text-[10px] font-mono text-amber-300 leading-relaxed">
                    {getScenarioHint(scenario.id)}
                  </div>
                )}
              </div>
            )}
          </AnimatePresence>
        </div>
      }
    />
  );
}

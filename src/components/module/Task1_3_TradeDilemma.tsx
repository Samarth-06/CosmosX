import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle2, XCircle, ArrowRight, Lightbulb, ChevronRight, Check, Orbit, Wind, Fuel, Lock } from "lucide-react";
import TaskWorkspaceLayout from "./TaskWorkspaceLayout";
import { saveTaskScore } from "@/lib/module1-store";

interface Props {
  onComplete: () => void;
}

type Round = 1 | 2 | 3;
type Round1Choice = "orion" | "vega" | "neither" | null;

const WEAKNESS_OPTIONS = [
  { id: "a", text: "The intermediary charges fees that are too high" },
  { id: "b", text: "The process takes too long (3 days instead of instant)" },
  { id: "c", text: "The Central Authority itself is a single point of failure — it can freeze, crash, or be corrupt", correct: true },
  { id: "d", text: "Both stations don't have enough resources" },
];

export default function Task1_3_TradeDilemma({ onComplete }: Props) {
  const [round, setRound] = useState<Round>(1);
  const [round1Choice, setRound1Choice] = useState<Round1Choice>(null);
  const [downsides, setDownsides] = useState<string[]>([]);
  const [weaknessAnswer, setWeaknessAnswer] = useState<string | null>(null);
  const [showHint1, setShowHint1] = useState(false);
  const [showHint2, setShowHint2] = useState(false);
  const [showHint3, setShowHint3] = useState(false);

  const handleRound1 = (choice: "orion" | "vega" | "neither") => {
    setRound1Choice(choice);
    setShowHint1(false);
  };

  const toggleDownside = (id: string) => {
    setDownsides((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
    setShowHint2(false);
  };

  const allDownsidesSelected = downsides.length === 4;

  return (
    <TaskWorkspaceLayout
      moduleColor="#22d3ee"
      taskTitle="Task 1.3 — Space Station Trade Dilemma"
      taskConcept="The trust problem in trade"
      theoryContent={
        <div className="space-y-4 text-[11.5px] leading-relaxed text-slate-300">
          <h4 className="font-mono text-cyan-400 font-bold uppercase tracking-wider">The Trust Problem</h4>
          <p>In classical trade, transactions between mutually anonymous parties are deadlocked by trust limitations. Without shared identity or an enforcement mechanism, the party that executes first bears all default risks.</p>
          <p><strong>Central Intermediaries</strong> solve this by taking custody of both assets, verifying compliance, and distributing them to the correct accounts.</p>
          <p>However, this service introduces clearing commissions, settlement delays, audit delays, and places systemic trust in a single administrative gatekeeper.</p>

          <div className="border border-white/5 bg-slate-900/40 p-2.5 rounded-lg select-none">
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest block mb-1">Round Navigator</span>
              <div className="flex gap-1">
                <button
                  disabled={round === 1}
                  onClick={() => setRound((r) => (r - 1) as Round)}
                  className="px-1.5 py-0.5 bg-slate-800 border border-white/5 rounded text-[8px] font-mono text-slate-400 hover:text-white disabled:opacity-30 transition"
                >
                  ◀
                </button>
                <button
                  disabled={round === 3}
                  onClick={() => setRound((r) => (r + 1) as Round)}
                  className="px-1.5 py-0.5 bg-slate-800 border border-white/5 rounded text-[8px] font-mono text-slate-400 hover:text-white disabled:opacity-30 transition"
                >
                  ▶
                </button>
              </div>
            </div>
            <div className="flex gap-1.5 mt-1.5">
              {([1, 2, 3] as Round[]).map((r) => {
                const isCurrent = round === r;
                let isCorrect = false;
                let ansExists = false;
                if (r === 1) {
                  ansExists = round1Choice !== null;
                  isCorrect = round1Choice === "neither";
                } else if (r === 2) {
                  ansExists = downsides.length > 0;
                  isCorrect = allDownsidesSelected;
                } else if (r === 3) {
                  ansExists = weaknessAnswer !== null;
                  isCorrect = weaknessAnswer === "c";
                }
                return (
                  <button
                    key={r}
                    onClick={() => setRound(r)}
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[9px] transition-all duration-300 ${
                      isCurrent
                        ? "bg-cyan-500 text-slate-950 font-bold scale-110 shadow-lg shadow-cyan-500/20"
                        : ansExists
                        ? isCorrect
                          ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                          : "bg-rose-500/20 border border-rose-500/30 text-rose-400"
                        : "bg-slate-800 border border-white/5 text-slate-400 hover:border-slate-500"
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      }
      challengeContent={
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Orbit className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
              <p className="text-[11px] font-mono text-cyan-400 uppercase font-bold tracking-wider">The Setup Context</p>
            </div>
            <p className="text-[11.5px] text-slate-300 leading-relaxed font-sans">
              Two space stations — <strong>Station Orion</strong> (surplus Oxygen) and <strong>Station Vega</strong> (surplus Fuel) — wish to execute a barter trade across opposite sides of the galaxy. They have never transacted before.
            </p>
            <div className="bg-slate-950/60 border border-white/5 p-3 rounded-lg font-mono text-[9.5px] leading-relaxed">
              <p className="text-cyan-300">Orion: <span className="text-white">"I will send 500 Oxygen units for 300 Fuel units."</span></p>
              <p className="text-purple-300 mt-1">Vega: <span className="text-white">"Agreed. But who routes their shipment first?"</span></p>
            </div>
          </div>

          {round >= 2 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/60 border border-white/10 rounded-xl p-4 space-y-3">
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Central Escrow Architecture</p>
              <div className="space-y-1.5 font-mono text-[9px]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-cyan-400 font-bold">Orion</span>
                  <span className="text-slate-500">➔</span>
                  <span className="bg-amber-500/10 border border-amber-500/25 px-1.5 py-0.5 rounded text-amber-300">500 Oxygen in Escrow</span>
                  <span className="text-slate-500">➔</span>
                  <span className="text-emerald-400">✓ Verified</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-purple-400 font-bold">Vega</span>
                  <span className="text-slate-500">➔</span>
                  <span className="bg-amber-500/10 border border-amber-500/25 px-1.5 py-0.5 rounded text-amber-300">300 Fuel in Escrow</span>
                  <span className="text-slate-500">➔</span>
                  <span className="text-emerald-400">✓ Verified</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      }
      labContent={
        <div className="space-y-3">
          <AnimatePresence mode="wait">
            {round === 1 && (
              <motion.div key="round1" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="space-y-3">
                <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3">
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Verify question</span>
                  <p className="text-[11px] text-white font-medium">Without trust, who should transmit first?</p>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: "orion", label: "Orion sends first", text: "500 Oxygen upfront", icon: Wind },
                    { id: "vega", label: "Vega sends first", text: "300 Fuel upfront", icon: Fuel },
                    { id: "neither", label: "Neither sends", text: "Deadlock — no trade", icon: Lock },
                  ].map((c) => {
                    const Icon = c.icon;
                    return (
                      <button
                        key={c.id}
                        onClick={() => handleRound1(c.id as any)}
                        className={`rounded-xl p-2.5 border text-left text-[10px] font-mono transition-all flex items-center gap-3 ${
                          round1Choice === c.id
                            ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300"
                            : "bg-slate-900/60 border-white/10 text-slate-300 hover:border-cyan-500/30"
                        }`}
                      >
                        <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                        <div className="flex-1">
                          <p className="font-bold">{c.label}</p>
                          <p className="text-slate-500 mt-0.5 text-[9px]">{c.text}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {round1Choice && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-2.5">
                    <div className={`rounded-xl p-3 border text-[9.5px] font-mono leading-relaxed ${
                      round1Choice === "neither"
                        ? "bg-amber-500/10 border-amber-500/25 text-amber-300"
                        : "bg-rose-500/10 border-rose-500/25 text-rose-300"
                    }`}>
                      {round1Choice === "neither"
                        ? "Outcome: Deadlock. Neither station can risk sending first. The trade fails, and both stations suffer resource shortages. Toggle to Round 2 in the Navigator to continue."
                        : `Outcome: Defalcation. The sender transmits their resources, but the receiver goes silent and never pays back. The first sender loses their asset.`}
                    </div>
                  </motion.div>
                )}

                {round1Choice && round1Choice !== "neither" && (
                  <div className="space-y-1">
                    <button
                      onClick={() => setShowHint1(true)}
                      className="w-full flex justify-between items-center px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-[8px] text-amber-400 font-mono hover:bg-amber-500/15"
                    >
                      <span>Need a hint?</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                    {showHint1 && (
                      <div className="bg-amber-950/20 border border-amber-500/25 p-2 rounded text-[8.5px] text-amber-300 leading-relaxed font-mono">
                        Hint: Consider if both parties refuse to take the default risk. Select "Neither sends" to see why trust causes deadlock.
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {round === 2 && (
              <motion.div key="round2" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="space-y-3">
                <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3">
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Verify question</span>
                  <p className="text-[11px] text-slate-200 font-medium">To bypass deadlock, they hire a neutral Central Escrow Server. What are the downsides of this escrow solution?</p>
                  <p className="text-[8.5px] text-amber-400 font-mono mt-1">Select all 4 options to map weaknesses:</p>
                </div>

                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    { id: "fees", label: "The central server charges 5% transaction fees." },
                    { id: "delay", label: "Verification and processing delay is 3 days." },
                    { id: "custody", label: "Assets are locked in escrow custody during disputes." },
                    { id: "spf", label: "The server is a Single Point of Failure (SPF)." },
                  ].map((d) => (
                    <button
                      key={d.id}
                      onClick={() => toggleDownside(d.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl border text-[9.5px] font-mono transition-all flex items-center gap-2 ${
                        downsides.includes(d.id)
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                          : "bg-slate-900/60 border-white/10 text-slate-300 hover:border-white/25"
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded border shrink-0 flex items-center justify-center ${
                        downsides.includes(d.id) ? "bg-rose-500/40 border-rose-500/60 text-rose-300" : "border-slate-600"
                      }`}>
                        {downsides.includes(d.id) && <span>✓</span>}
                      </div>
                      <span>{d.label}</span>
                    </button>
                  ))}
                </div>

                {allDownsidesSelected && (
                  <div className="bg-amber-500/10 border border-amber-500/25 p-3 rounded-xl text-[9px] font-mono text-amber-300 leading-relaxed">
                    ✓ All weaknesses mapped. The Central Escrow works, but is slow, expensive, and insecure. Toggle to Round 3 in the Navigator to continue.
                  </div>
                )}

                {downsides.length > 0 && !allDownsidesSelected && (
                  <div className="space-y-1">
                    <button
                      onClick={() => setShowHint2(true)}
                      className="w-full flex justify-between items-center px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-[8px] text-amber-400 font-mono hover:bg-amber-500/15"
                    >
                      <span>Need a hint?</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                    {showHint2 && (
                      <div className="bg-amber-950/20 border border-amber-500/25 p-2 rounded text-[8.5px] text-amber-300 leading-relaxed font-mono">
                        Hint: Select ALL 4 items in the list. Intermediaries introduce commission fees, verification delays, asset custody locks, and single database server risks.
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {round === 3 && (
              <motion.div key="round3" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="space-y-3">
                <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3">
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Verify question</span>
                  <p className="text-[11px] text-slate-200 font-medium">What represents the core vulnerability of the Central Escrow Server?</p>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {WEAKNESS_OPTIONS.map((opt) => {
                    const isSelected = weaknessAnswer === opt.id;
                    const isCorrectOpt = opt.correct || false;
                    let style = "bg-slate-900/60 border-white/10 text-slate-300 hover:border-cyan-500/40 hover:bg-slate-800/60";
                    if (weaknessAnswer !== null) {
                      if (isCorrectOpt) style = "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold";
                      else if (isSelected) style = "bg-rose-500/15 border-rose-500/40 text-rose-300";
                      else style = "bg-slate-900/40 border-white/5 text-slate-500 opacity-60";
                    }
                    return (
                      <button
                        key={opt.id}
                        onClick={() => { setWeaknessAnswer(opt.id); setShowHint3(false); }}
                        disabled={weaknessAnswer !== null}
                        className={`text-left border rounded-xl px-3 py-2 text-[10px] font-mono transition-all flex items-center justify-between ${style}`}
                      >
                        <span>{opt.text}</span>
                        {weaknessAnswer !== null && isCorrectOpt && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        {weaknessAnswer !== null && isSelected && !isCorrectOpt && <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {weaknessAnswer === "c" && (
                  <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
                    <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                        <Check className="w-4 h-4" />
                        <span>Decentralization Verified</span>
                      </div>
                      <p className="text-[10px] text-slate-300 leading-relaxed font-sans">
                        <span className="text-amber-400 font-mono font-bold">DEBRIEF: </span>
                        In 2008, Satoshi Nakamoto published a paper describing a system where strangers could exchange value directly — no banks, no intermediaries — using cryptography and a distributed network. That system was Bitcoin, and the technology behind it was blockchain.
                      </p>
                    </div>
                    <button
                      onClick={() => { saveTaskScore("task1_3", 10, 10, true); onComplete(); }}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-full text-[10px] font-rushblade shadow-md transition uppercase tracking-wider flex items-center justify-center gap-1.5"
                    >
                      Proceed to Task 1.4 <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}

                {weaknessAnswer && weaknessAnswer !== "c" && (
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
                        Hint: The high fees and delays are annoying, but the root hazard is placing total control of the escrow database in a single central server that can be compromised or halted.
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      }
    />
  );
}

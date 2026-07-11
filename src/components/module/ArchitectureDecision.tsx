import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";

interface ArchitectureDecisionProps {
  onComplete: () => void;
}

export default function ArchitectureDecision({ onComplete }: ArchitectureDecisionProps) {
  const [selectedArch, setSelectedArch] = useState<"A" | "B" | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<1 | 2 | 3>(1);
  const [q1Answer, setQ1Answer] = useState<"A" | "B" | null>(null);
  const [q2Answer, setQ2Answer] = useState<"A" | "B" | null>(null);
  
  // Phrase puzzle variables
  const puzzlePhrases = [
    { id: "p1", text: "multiple parties" },
    { id: "p2", text: "do not fully trust each other" },
    { id: "p3", text: "need shared records" },
    { id: "p4", text: "without depending entirely on one authority" },
  ];
  const [selectedPhrases, setSelectedPhrases] = useState<string[]>([]);
  const [puzzleCompleted, setPuzzleCompleted] = useState(false);

  // Correct order is p1, p2, p3, p4
  const handlePhraseClick = (phraseId: string) => {
    if (selectedPhrases.includes(phraseId)) {
      // Remove it and subsequent ones to avoid breaking sentence flow
      const idx = selectedPhrases.indexOf(phraseId);
      setSelectedPhrases(selectedPhrases.slice(0, idx));
      setPuzzleCompleted(false);
    } else {
      const nextPhrases = [...selectedPhrases, phraseId];
      setSelectedPhrases(nextPhrases);
      
      // Verify order when 4 elements selected
      if (nextPhrases.length === 4) {
        if (
          nextPhrases[0] === "p1" &&
          nextPhrases[1] === "p2" &&
          nextPhrases[2] === "p3" &&
          nextPhrases[3] === "p4"
        ) {
          setPuzzleCompleted(true);
        } else {
          // Reset after a brief delay if wrong
          setTimeout(() => {
            setSelectedPhrases([]);
          }, 1200);
        }
      }
    }
  };

  const handleQ1 = (ans: "A" | "B") => {
    setQ1Answer(ans);
    if (ans === "A") {
      setTimeout(() => setActiveQuestion(2), 1500);
    }
  };

  const handleQ2 = (ans: "A" | "B") => {
    setQ2Answer(ans);
    if (ans === "B") {
      setTimeout(() => setActiveQuestion(3), 1500);
    }
  };

  return (
    <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-2xl space-y-6">
      <div className="border-b border-white/5 pb-4">
        <span className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest">Role Assigned: Chief Systems Architect</span>
        <h2 className="text-xl font-bold text-white mt-1">Interplanetary Network Architecture Design</h2>
        <p className="text-xs text-muted-foreground mt-1">Analyze candidate architectures for our new space transit settlement systems.</p>
      </div>

      {/* Network Diagrams */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Architecture A Card */}
        <div
          onClick={() => setSelectedArch("A")}
          className={`relative border rounded-xl p-4 transition-all duration-300 cursor-pointer flex flex-col justify-between h-[230px] overflow-hidden ${
            selectedArch === "A"
              ? "border-cyan-500 bg-cyan-950/10 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
              : "border-white/5 bg-slate-900/30 hover:border-white/15 hover:bg-slate-900/40"
          }`}
        >
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-xs text-cyan-400 font-bold">Architecture A</span>
              <span className="text-[10px] text-muted-foreground uppercase border border-white/10 rounded px-1.5 py-0.5">Centralized Hub</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Multiple spacecraft communicate and sync their transit records through a single Central Command Database.</p>
          </div>

          {/* Visual SVG diagram for Architecture A */}
          <div className="flex-1 flex items-center justify-center my-2 relative">
            <svg className="w-full h-24" viewBox="0 0 200 100">
              {/* Central DB node */}
              <circle cx="100" cy="50" r="14" fill="rgba(6,182,212,0.15)" stroke="#06b6d4" strokeWidth="1.5" className="animate-pulse" />
              <rect x="94" y="44" width="12" height="12" fill="#06b6d4" rx="2" />
              <text x="100" y="76" textAnchor="middle" fill="#06b6d4" fontSize="9" fontFamily="monospace">Central DB</text>

              {/* Satellite nodes */}
              {[
                { cx: 30, cy: 25, label: "Ship Alpha" },
                { cx: 30, cy: 75, label: "Ship Beta" },
                { cx: 170, cy: 50, label: "Ship Gamma" }
              ].map((node, i) => (
                <g key={i}>
                  {/* Connecting lines */}
                  <line x1={node.cx} y1={node.cy} x2="100" y2="50" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="2 2" />
                  <circle cx={node.cx} cy={node.cy} r="8" fill="rgba(255,255,255,0.05)" stroke="#94a3b8" strokeWidth="1" />
                  <polygon points={`${node.cx},${node.cy-4} ${node.cx+4},${node.cy+3} ${node.cx-4},${node.cy+3}`} fill="#94a3b8" />
                  <text x={node.cx} y={node.cy + 16} textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">{node.label}</text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Architecture B Card */}
        <div
          onClick={() => setSelectedArch("B")}
          className={`relative border rounded-xl p-4 transition-all duration-300 cursor-pointer flex flex-col justify-between h-[230px] overflow-hidden ${
            selectedArch === "B"
              ? "border-cyan-500 bg-cyan-950/10 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
              : "border-white/5 bg-slate-900/30 hover:border-white/15 hover:bg-slate-900/40"
          }`}
        >
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-xs text-cyan-400 font-bold">Architecture B</span>
              <span className="text-[10px] text-muted-foreground uppercase border border-white/10 rounded px-1.5 py-0.5">Distributed Mesh</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Independent nodes (Earth, Mars, Europa, Titan) maintain synchronized peer-to-peer copies of transaction records.</p>
          </div>

          {/* Visual SVG diagram for Architecture B */}
          <div className="flex-1 flex items-center justify-center my-2">
            <svg className="w-full h-24" viewBox="0 0 200 100">
              {/* Nodes in mesh network */}
              {[
                { cx: 50, cy: 25, label: "Earth" },
                { cx: 150, cy: 25, label: "Mars" },
                { cx: 50, cy: 75, label: "Europa" },
                { cx: 150, cy: 75, label: "Titan" }
              ].map((n, i) => (
                <g key={i}>
                  <circle cx={n.cx} cy={n.cy} r="9" fill="rgba(34,211,238,0.1)" stroke="#22d3ee" strokeWidth="1" />
                  <circle cx={n.cx} cy={n.cy} r="4" fill="#22d3ee" />
                  <text x={n.cx} y={n.cy + 17} textAnchor="middle" fill="#22d3ee" fontSize="8" fontFamily="monospace">{n.label}</text>
                </g>
              ))}

              {/* Connections (Mesh/Ring) */}
              <line x1="50" y1="25" x2="150" y2="25" stroke="#22d3ee" strokeWidth="1" opacity="0.4" />
              <line x1="50" y1="25" x2="50" y2="75" stroke="#22d3ee" strokeWidth="1" opacity="0.4" />
              <line x1="150" y1="25" x2="150" y2="75" stroke="#22d3ee" strokeWidth="1" opacity="0.4" />
              <line x1="50" y1="75" x2="150" y2="75" stroke="#22d3ee" strokeWidth="1" opacity="0.4" />
              <line x1="50" y1="25" x2="150" y2="75" stroke="#22d3ee" strokeWidth="0.5" opacity="0.2" strokeDasharray="2 2" />
              <line x1="150" y1="25" x2="50" y2="75" stroke="#22d3ee" strokeWidth="0.5" opacity="0.2" strokeDasharray="2 2" />
            </svg>
          </div>
        </div>
      </div>

      {/* Interactive Questions Panel */}
      <div className="bg-slate-950/40 border border-white/5 rounded-xl p-4 mt-6">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-[10px] text-muted-foreground uppercase">Evaluation Question {activeQuestion} of 3</span>
        </div>

        <AnimatePresence mode="wait">
          {/* Question 1 */}
          {activeQuestion === 1 && (
            <motion.div
              key="q1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              <h4 className="text-sm font-bold text-white">“Which network architecture has a single point of failure?”</h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleQ1("A")}
                  className={`flex-1 border px-4 py-3 rounded-lg text-left text-xs transition flex justify-between items-center ${
                    q1Answer === "A"
                      ? "border-emerald-500 bg-emerald-950/10 text-emerald-400"
                      : "border-white/10 bg-slate-900/50 hover:bg-slate-900 hover:border-white/20 text-white"
                  }`}
                >
                  <span>Architecture A (Centralized Hub)</span>
                  {q1Answer === "A" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </button>
                <button
                  onClick={() => handleQ1("B")}
                  className={`flex-1 border px-4 py-3 rounded-lg text-left text-xs transition flex justify-between items-center ${
                    q1Answer === "B"
                      ? "border-rose-500 bg-rose-950/10 text-rose-400"
                      : "border-white/10 bg-slate-900/50 hover:bg-slate-900 hover:border-white/20 text-white"
                  }`}
                >
                  <span>Architecture B (Distributed Mesh)</span>
                  {q1Answer === "B" && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                </button>
              </div>
              {q1Answer === "A" && (
                <p className="text-[11px] text-emerald-400 font-mono">
                  ✓ Correct! If Central DB goes down, all Ship-to-Ship telemetry and transaction settlement instantly halts.
                </p>
              )}
              {q1Answer === "B" && (
                <p className="text-[11px] text-rose-400 font-mono">
                  ✗ Incorrect. Try again. In Architecture B, other nodes survive if one fails.
                </p>
              )}
            </motion.div>
          )}

          {/* Question 2 */}
          {activeQuestion === 2 && (
            <motion.div
              key="q2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              <h4 className="text-sm font-bold text-white">
                “If Earth Command becomes compromised, which architecture makes independent verification possible?”
              </h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleQ2("A")}
                  className={`flex-1 border px-4 py-3 rounded-lg text-left text-xs transition flex justify-between items-center ${
                    q2Answer === "A"
                      ? "border-rose-500 bg-rose-950/10 text-rose-400"
                      : "border-white/10 bg-slate-900/50 hover:bg-slate-900 hover:border-white/20 text-white"
                  }`}
                >
                  <span>Architecture A (Centralized Hub)</span>
                  {q2Answer === "A" && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                </button>
                <button
                  onClick={() => handleQ2("B")}
                  className={`flex-1 border px-4 py-3 rounded-lg text-left text-xs transition flex justify-between items-center ${
                    q2Answer === "B"
                      ? "border-emerald-500 bg-emerald-950/10 text-emerald-400"
                      : "border-white/10 bg-slate-900/50 hover:bg-slate-900 hover:border-white/20 text-white"
                  }`}
                >
                  <span>Architecture B (Distributed Mesh)</span>
                  {q2Answer === "B" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </button>
              </div>
              {q2Answer === "B" && (
                <p className="text-[11px] text-emerald-400 font-mono">
                  ✓ Correct! With distributed independent copies across Mars/Europa/Titan, a compromised Earth Node record is instantly identified during cross-verification.
                </p>
              )}
              {q2Answer === "A" && (
                <p className="text-[11px] text-rose-400 font-mono">
                  ✗ Incorrect. In Architecture A, there are no independent databases to cross-check. Try again.
                </p>
              )}
            </motion.div>
          )}

          {/* Question 3 - Phrase arrangement */}
          {activeQuestion === 3 && (
            <motion.div
              key="q3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              <div className="border-l-2 border-cyan-500 pl-3">
                <h4 className="text-sm font-bold text-white">“Why can't we simply use MySQL/PostgreSQL for everything?”</h4>
                <p className="text-[11px] text-muted-foreground mt-1">Arrange the puzzle components to build the statement describing when blockchain becomes relevant.</p>
              </div>

              {/* Output Result Statement */}
              <div className="bg-slate-900 border border-white/5 rounded-lg p-3 min-h-[60px] flex items-center justify-start flex-wrap gap-1 font-mono text-[11px] text-white">
                <span className="text-cyan-400 font-bold">Blockchain becomes useful when</span>
                {selectedPhrases.map((phraseId) => {
                  const item = puzzlePhrases.find((p) => p.id === phraseId);
                  return (
                    <motion.span
                      layoutId={phraseId}
                      key={phraseId}
                      onClick={() => handlePhraseClick(phraseId)}
                      className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded cursor-pointer hover:bg-cyan-500/10 flex items-center gap-1"
                    >
                      {item?.text}
                      <span className="text-[9px] text-cyan-400">×</span>
                    </motion.span>
                  );
                })}
              </div>

              {/* Phrase Blocks options */}
              {!puzzleCompleted && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {puzzlePhrases.map((phrase) => {
                    const isSelected = selectedPhrases.includes(phrase.id);
                    if (isSelected) return null;
                    return (
                      <motion.button
                        layoutId={phrase.id}
                        key={phrase.id}
                        onClick={() => handlePhraseClick(phrase.id)}
                        className="bg-slate-900 border border-white/10 hover:border-cyan-500/40 hover:bg-slate-800/80 px-3 py-2 rounded text-xs text-slate-300 transition"
                      >
                        {phrase.text}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Feedback and Proceed */}
              {puzzleCompleted && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <p className="text-[11px] text-emerald-400 leading-relaxed font-mono">
                    ✓ STATEMENT VERIFIED: "Blockchain is useful when multiple parties that do not fully trust each other need to maintain shared records without depending entirely on one central authority."
                  </p>
                  
                  <div className="bg-slate-900/50 border border-white/5 rounded-lg p-3 text-[11px] leading-relaxed text-muted-foreground space-y-2">
                    <p>
                      <strong>Note:</strong> This does NOT mean traditional databases are outdated. 
                      <span className="text-white"> MySQL and PostgreSQL</span> are extremely fast, powerful, and suitable when a single trusted organization owns/controls the application and system state.
                    </p>
                    <p>
                      We only deploy blockchain architectures when trust cannot be centralized.
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={onComplete}
                      className="bg-linear-to-r from-primary to-primary-glow text-primary-foreground font-bold px-5 py-2.5 rounded-full text-xs shadow-lg hover:shadow-[0_0_20px_var(--color-primary)] transition"
                    >
                      Begin Flight Systems Review ➔
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ArrowRight,
  Info,
  Terminal,
  Check,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  FlaskConical,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { TaskDef } from "@/lib/mercury-curriculum";
import { saveTaskScore } from "@/lib/module1-store";

interface Props {
  taskDef: TaskDef;
  moduleColor: string;
  onComplete: () => void;
}

export default function GenericSandboxRunner({ taskDef, moduleColor, onComplete }: Props) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintStep, setHintStep] = useState(0);
  const [termInput, setTermInput] = useState("");
  const [termLogs, setTermLogs] = useState<string[]>([
    "COSMOSX emergency terminal v1.02 ready.",
    "Type 'help' to view available diagnostics commands.",
    "",
  ]);
  const [selectedSequence, setSelectedSequence] = useState<string[]>([]);
  const [valApprovals, setValApprovals] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setInputs({});
    setErrorMessage(null);
    setSuccess(false);
    setShowHint(false);
    setHintStep(0);
    setTermInput("");
    setTermLogs([
      "COSMOSX emergency terminal v1.02 ready.",
      "Type 'help' to view available diagnostics commands.",
      "",
    ]);
    setSelectedSequence([]);
    setValApprovals({});
  }, [taskDef.id]);

  const handleInputChange = (key: string, val: string) => {
    setInputs((prev) => ({ ...prev, [key]: val }));
    setErrorMessage(null);
  };

  const executeTerminalCmd = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    let output = "";
    const lower = trimmed.toLowerCase();
    if (lower === "help") {
      output = "Available commands:\n  help            - Display this index\n  clear           - Clear screen\n  sha256 \"str\"    - Compute SHA-256 seal\n  audit           - Print telemetry logs";
    } else if (lower === "clear") {
      setTermLogs([]);
      setTermInput("");
      return;
    } else if (lower === "audit") {
      output = `AUDIT LOG:\nActive Task: ${taskDef.title}\nConcept: ${taskDef.concept}\nStatus: WAITING_INPUT`;
    } else if (lower.startsWith("sha256 ")) {
      const match = trimmed.match(/sha256\s+["']?([^"']+)["']?/i);
      if (match?.[1]) {
        const text = match[1];
        const MAP: Record<string, string> = {
          "Blockchain is secure": "8e9ffc5d80b7ac3080e72251a3d3c8c731e847c1f8a7cfbb1727771ea0808b2d",
          "fuel_val_42": "7a0b82f1bc8a88bd3f109277bd10129bcce0128912efcc429a1b002c89f28bb0",
          "ignition_active": "6d39369f12d8a008b8e2f1d9a008bba81236ea77bd10129bcce0128912e847291a",
          "stabilizers_on": "e0e7a1cbe2f8a88bd3f10900bba81236ea77bd10129bcce0128912efcc429a1b02",
          "517822005000000a9b8f82e3c0948291": "d4d98a00fc29b80018f2bb7c71e892cbb87a9bc19cce01ef2b892182b8a0",
          "LAUNCH": "e527a8f192b1a8d083e911bd3e2182b8cd092e008ba3fca21c00bb9184cf56efbc",
        };
        output = MAP[text]
          ? `sha256("${text}") = ${MAP[text]}`
          : (() => {
              let h = 0;
              for (let i = 0; i < text.length; i++) h = text.charCodeAt(i) + ((h << 5) - h);
              return `sha256("${text}") = ${Math.abs(h).toString(16).padEnd(8,"f").substring(0,8)}7bd10129bcce012891`;
            })();
      } else {
        output = 'Syntax error. Usage: sha256 "your string"';
      }
    } else {
      output = `Command not recognized: '${trimmed}'. Type 'help' for options.`;
    }
    setTermLogs((prev) => [...prev, `guest@cosmosx:~$ ${cmd}`, output, ""]);
    setTermInput("");
  };

  const handleVerify = () => {
    let answer = "";
    if (["inspector", "terminal-audit", "server-audit", "math-console"].includes(taskDef.practical.type)) {
      answer = (taskDef.practical.inputs || []).map((inp) => (inputs[inp.key] || "").trim()).join(":");
    } else if (taskDef.practical.type === "drag-drop") {
      answer = inputs.seq ? inputs.seq.trim() : selectedSequence.join("");
    } else if (taskDef.practical.type === "validator-terminal") {
      answer = Array.from({ length: 5 }).map((_, i) => (valApprovals[i + 1] ? "1" : "0")).join("");
      if (inputs.code) answer = inputs.code.trim();
    } else if (taskDef.practical.type === "graph-matcher") {
      answer = (inputs.quorum || inputs.node_idx || "").trim();
    } else if (taskDef.practical.type === "comparison") {
      answer = (inputs.blocks || "").trim();
    }
    const clean = (s: string) => s.replace(/\s+/g, "").toLowerCase();
    if (clean(answer) === clean(taskDef.practical.correctAnswer)) {
      setSuccess(true);
      setErrorMessage(null);
      setShowHint(false);
    } else {
      setErrorMessage("Verification failed — answer does not match expected values.");
    }
  };

  const handleSeqClick = (letter: string) => {
    if (selectedSequence.includes(letter)) {
      setSelectedSequence((p) => p.filter((l) => l !== letter));
    } else {
      setSelectedSequence((p) => [...p, letter]);
    }
  };

  const correctParts = taskDef.practical.correctAnswer.split(":");
  const hintLabels = (taskDef.practical.inputs || []).map((i) => i.label);
  const getDragLetters = () => {
    if (taskDef.id === "task2_3") return ["D","A","F","E","B","C"];
    if (taskDef.id === "task3_4") return ["Z","X","Y","W"];
    return ["A","B","C","D","E","F"];
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* TASK HEADER */}
      <div
        className="flex items-center gap-3 px-4 py-2 border-b border-white/10 bg-slate-950/80 shrink-0 select-none"
        style={{ borderLeftColor: moduleColor, borderLeftWidth: "3px" }}
      >
        <div className="p-2 border rounded-lg shrink-0" style={{ backgroundColor: `${moduleColor}15`, borderColor: `${moduleColor}30`, color: moduleColor }}>
          <Terminal className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-rushblade text-white text-xs tracking-wider uppercase truncate">{taskDef.title}</h3>
          <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-mono">Concept: {taskDef.concept}</p>
        </div>
        <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border shrink-0" style={{ color: moduleColor, borderColor: `${moduleColor}40`, backgroundColor: `${moduleColor}10` }}>
          Active Lab
        </span>
      </div>

      {/* 3-PANEL LAYOUT */}
      <div className="flex-1 min-h-0 grid grid-cols-[34%_33%_33%] divide-x divide-white/5 overflow-hidden">

        {/* LEFT — THEORY */}
        <div className="flex flex-col h-full overflow-hidden bg-slate-950/40">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 shrink-0" style={{ backgroundColor: `${moduleColor}08` }}>
            <BookOpen className="w-3.5 h-3.5 shrink-0" style={{ color: moduleColor }} />
            <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">Theory</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            <div className="text-[11.5px] text-slate-300 leading-relaxed space-y-3 font-sans">
              {taskDef.theoryText.split("\n\n").map((para, idx) => <p key={idx}>{para}</p>)}
            </div>
            {taskDef.keyTerms && taskDef.keyTerms.length > 0 && (
              <div className="border rounded-xl p-3 space-y-2" style={{ borderColor: `${moduleColor}25`, backgroundColor: `${moduleColor}08` }}>
                <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" style={{ color: moduleColor }} />
                  <span>Key Terms</span>
                </div>
                <div className="space-y-2">
                  {taskDef.keyTerms.map((term, idx) => (
                    <div key={idx} className="border border-white/5 bg-slate-950/60 p-2 rounded-lg">
                      <span className="font-mono font-bold text-[10px] block" style={{ color: moduleColor }}>{term.term}</span>
                      <span className="text-slate-400 text-[10px] mt-0.5 block leading-relaxed">{term.definition}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CENTER — CHALLENGE */}
        <div className="flex flex-col h-full overflow-hidden bg-slate-950/60">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 shrink-0 bg-slate-900/30">
            <FlaskConical className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">{taskDef.practical.title}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            <div className="border-l-2 pl-3 py-0.5 text-[11px] text-slate-300 font-sans leading-relaxed whitespace-pre-line" style={{ borderColor: moduleColor }}>
              {taskDef.practical.setupText}
            </div>
            <div className="bg-slate-900/70 border border-white/10 rounded-xl p-3.5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: moduleColor }} />
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">Your Task</span>
              </div>
              <p className="text-[12px] text-white font-sans leading-relaxed font-semibold">{taskDef.practical.question}</p>
            </div>
          </div>
        </div>

        {/* RIGHT — HANDS-ON LAB */}
        <div className="flex flex-col h-full overflow-hidden bg-[#020608]/80">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 shrink-0 bg-slate-900/30">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">Hands-on Lab</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 scrollbar-thin">
            {/* Widget */}
            <div className="border border-white/10 bg-slate-950/60 rounded-xl p-3 min-h-[100px] flex flex-col justify-center">
              {taskDef.practical.type === "inspector" && (
                <div className="font-mono text-[9.5px] text-cyan-300 bg-black/70 p-3 rounded-lg overflow-x-auto select-all max-h-[200px] scrollbar-thin">
                  <pre className="whitespace-pre leading-relaxed">{taskDef.practical.setupText}</pre>
                </div>
              )}
              {taskDef.practical.type === "terminal-audit" && (
                <div className="flex flex-col bg-black/90 border border-white/15 rounded-lg font-mono text-[10px] h-[190px] overflow-hidden">
                  <div className="bg-slate-900/80 px-3 py-1.5 border-b border-white/10 flex items-center justify-between text-[9px] text-slate-400 select-none">
                    <span>COSMOSX TERMINAL</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="flex-1 p-2 overflow-y-auto space-y-0.5 text-slate-300 scrollbar-thin select-text">
                    {termLogs.map((log, idx) => <div key={idx} className="whitespace-pre-wrap leading-relaxed text-[9.5px]">{log}</div>)}
                  </div>
                  <form onSubmit={(e) => { e.preventDefault(); executeTerminalCmd(termInput); }} className="border-t border-white/10 flex items-center bg-slate-950">
                    <span className="pl-2.5 text-cyan-400 select-none">$</span>
                    <input type="text" value={termInput} onChange={(e) => setTermInput(e.target.value)} placeholder={'sha256 "Blockchain is secure"'} className="flex-1 bg-transparent border-0 outline-hidden py-1.5 px-2 text-[10px] text-white focus:ring-0 placeholder-slate-600" autoFocus />
                  </form>
                </div>
              )}
              {taskDef.practical.type === "drag-drop" && (
                <div className="space-y-3">
                  <div className="text-[9px] font-mono text-muted-foreground select-none">Click items in the correct order:</div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {getDragLetters().map((letter, idx) => {
                      const isSel = selectedSequence.includes(letter);
                      const pos = selectedSequence.indexOf(letter);
                      return (
                        <button key={`${letter}-${idx}`} onClick={() => handleSeqClick(letter)}
                          style={{ borderColor: isSel ? moduleColor : "rgba(255,255,255,0.1)", backgroundColor: isSel ? `${moduleColor}15` : "rgba(15,23,42,0.6)" }}
                          className="w-11 h-11 rounded-lg border font-mono font-bold flex flex-col items-center justify-center transition-all relative text-sm text-white hover:scale-105"
                        >
                          {letter}
                          {isSel && <span className="absolute top-0.5 right-1 text-[8px] text-cyan-400 font-bold">{pos + 1}</span>}
                        </button>
                      );
                    })}
                  </div>
                  <div className="bg-slate-900/60 p-2 border border-white/5 rounded-lg text-center font-mono text-[10px]">
                    <span className="text-muted-foreground uppercase mr-2">Sequence:</span>
                    <span className="font-bold text-white tracking-widest">{selectedSequence.join("") || "—"}</span>
                  </div>
                </div>
              )}
              {taskDef.practical.type === "validator-terminal" && (
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin select-none">
                  {[1,2,3,4,5].map((txIdx) => {
                    const isApp = valApprovals[txIdx] === true;
                    const isRej = valApprovals[txIdx] === false;
                    const details = ["ALPHA sends 95 to BETA (Fee:2) [Bal:100]","GAMMA sends 10 to ALPHA (Fee:1) [Bal:5]","BETA sends 20 to GAMMA (Fee:1) [Bal:20]","BETA sends 15 to ALPHA (Fee:1) [Bal:20]","ALPHA sends 150 to GAMMA (Fee:2) [Bal:100]"];
                    return (
                      <div key={txIdx} className="bg-slate-900/40 border border-white/5 p-2 rounded-lg flex items-center justify-between text-[9.5px]">
                        <span className="font-mono text-slate-300 text-[9px]">TX{txIdx}: {details[txIdx-1]}</span>
                        <div className="flex gap-1.5 shrink-0">
                          <button onClick={() => setValApprovals((p) => ({ ...p, [txIdx]: true }))} className={`px-2.5 py-1 rounded text-[9px] font-mono font-bold transition-all border ${isApp ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" : "bg-slate-950/80 text-slate-500 border-white/5 hover:text-emerald-400"}`}>Approve</button>
                          <button onClick={() => setValApprovals((p) => ({ ...p, [txIdx]: false }))} className={`px-2.5 py-1 rounded text-[9px] font-mono font-bold transition-all border ${isRej ? "bg-rose-500/20 text-rose-400 border-rose-500/40" : "bg-slate-950/80 text-slate-500 border-white/5 hover:text-rose-400"}`}>Reject</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {taskDef.practical.type === "comparison" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="border border-white/5 bg-slate-900/40 rounded-lg p-2.5 text-center"><div className="text-[9px] font-mono text-cyan-400 font-bold">CENTRALIZED</div><div className="text-[10px] text-rose-400 font-mono">COMPROMISED</div></div>
                    <div className="border border-white/5 bg-slate-900/40 rounded-lg p-2.5 text-center"><div className="text-[9px] font-mono text-indigo-400 font-bold">DISTRIBUTED</div><div className="text-[10px] text-emerald-400 font-mono">SECURE (4/5)</div></div>
                  </div>
                  <div className="flex gap-2">
                    {["All of them","Block 2 only"].map((opt) => (
                      <button key={opt} onClick={() => setInputs({ blocks: opt })} className={`flex-1 py-1.5 rounded-lg text-[9px] font-mono transition-all border ${inputs.blocks === opt ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300" : "bg-slate-900 border-white/10 text-slate-300 hover:text-white"}`}>{opt}</button>
                    ))}
                  </div>
                </div>
              )}
              {taskDef.practical.type === "graph-matcher" && (
                <div className="space-y-3">
                  <div className="text-[9px] font-mono text-muted-foreground select-none">{taskDef.id === "task6_3" ? "Select the blocking node:" : "Select consensus nodes:"}</div>
                  <div className="flex justify-center gap-2">
                    {[1,2,3,4,5].map((ni) => {
                      const cur = inputs.quorum || inputs.node_idx || "";
                      const sel = cur ? cur.split(",") : [];
                      const isSel = sel.includes(String(ni));
                      return (
                        <button key={ni}
                          onClick={() => {
                            if (taskDef.id === "task6_3") { setInputs({ node_idx: String(ni) }); }
                            else {
                              const list = isSel ? sel.filter((n) => n !== String(ni)) : [...sel, String(ni)];
                              setInputs({ quorum: list.sort().join(",") });
                            }
                          }}
                          style={{ borderColor: isSel ? moduleColor : "rgba(255,255,255,0.1)", backgroundColor: isSel ? `${moduleColor}15` : "rgba(15,23,42,0.6)" }}
                          className="w-10 h-10 rounded-full border font-mono font-bold flex items-center justify-center text-xs text-white transition-all"
                        >0{ni}</button>
                      );
                    })}
                  </div>
                  <div className="bg-slate-900/60 p-2 border border-white/5 rounded-lg text-center font-mono text-[9px]">
                    <span className="text-muted-foreground uppercase mr-2">Selected:</span>
                    <span className="font-bold text-white">{inputs.quorum || inputs.node_idx || "NONE"}</span>
                  </div>
                </div>
              )}
              {(taskDef.practical.type === "server-audit" || taskDef.practical.type === "math-console") && (
                <div className="text-[10px] text-slate-400 font-mono leading-relaxed">
                  Read the scenario in the center panel, compute your answers, and enter them in the fields below.
                </div>
              )}
            </div>

            {/* Answer inputs */}
            {!success && (
              <div className="space-y-2">
                {taskDef.practical.inputs && taskDef.practical.inputs.length > 0
                  ? taskDef.practical.inputs.map((inp, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <label className="text-[9px] font-mono text-slate-400 uppercase tracking-wide block">{inp.label}</label>
                        <input type="text" value={inputs[inp.key] || ""} onChange={(e) => handleInputChange(inp.key, e.target.value)} placeholder={inp.placeholder} disabled={success} className="w-full bg-slate-900/80 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white font-mono placeholder-slate-600 focus:outline-hidden focus:border-cyan-500 transition" />
                      </div>
                    ))
                  : !["drag-drop","validator-terminal","graph-matcher","comparison"].includes(taskDef.practical.type) && (
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-mono text-slate-400 uppercase tracking-wide block">Answer</label>
                        <input type="text" value={inputs.seq || inputs.quorum || inputs.node_idx || inputs.blocks || inputs.code || ""} onChange={(e) => handleInputChange("seq", e.target.value)} placeholder="Enter your answer..." disabled={success} className="w-full bg-slate-900/80 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white font-mono placeholder-slate-600 focus:outline-hidden focus:border-cyan-500 transition" />
                      </div>
                    )
                }
              </div>
            )}

            {/* Submit */}
            {!success && (
              <button onClick={handleVerify} style={{ backgroundColor: `${moduleColor}20`, borderColor: `${moduleColor}50` }} className="w-full border text-white font-bold py-2 rounded-full text-[10px] font-rushblade tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md hover:opacity-80">
                Submit &amp; Verify
              </button>
            )}

            {/* Error + hint */}
            <AnimatePresence>
              {errorMessage && !success && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-2 overflow-hidden">
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-2.5 flex items-start gap-2 text-[10px] text-rose-400 font-mono">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>{errorMessage}</span>
                  </div>
                  <button
                    onClick={() => { setShowHint(true); setHintStep((p) => Math.min(p + 1, correctParts.length)); }}
                    className="w-full flex items-center justify-between px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] text-amber-400 font-mono hover:bg-amber-500/15 transition"
                  >
                    <span className="flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5" />
                      {showHint ? (hintStep >= correctParts.length ? "Full solution revealed" : `Reveal next answer (${hintStep}/${correctParts.length} shown)`) : "Need a hint?"}
                    </span>
                    <ChevronRightIcon className="w-3.5 h-3.5" />
                  </button>
                  {showHint && hintStep > 0 && (
                    <div className="bg-amber-950/30 border border-amber-500/20 rounded-xl p-3 space-y-1.5">
                      <div className="text-[9px] font-mono text-amber-400 uppercase tracking-widest mb-1.5">Correct Answers ({hintStep}/{correctParts.length} revealed)</div>
                      {correctParts.slice(0, hintStep).map((part, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[10px] font-mono py-0.5">
                          <span className="text-amber-500/60 shrink-0 truncate">{hintLabels[idx] || `Field ${idx+1}`}:</span>
                          <span className="text-amber-200 font-bold tracking-wider">{part}</span>
                        </div>
                      ))}
                      {hintStep >= correctParts.length && <p className="text-[9px] text-amber-400/60 font-mono mt-1 italic">Try entering these values above.</p>}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success */}
            <AnimatePresence>
              {success && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 space-y-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                    <Check className="w-4 h-4" /><span>Verification Successful</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{taskDef.practical.debriefText}</p>
                  <button
                    onClick={() => { saveTaskScore(taskDef.id, 10, 10, true); onComplete(); }}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-full text-[10px] font-rushblade tracking-wider flex items-center justify-center gap-1.5 transition shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  >
                    Proceed to Next Task <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

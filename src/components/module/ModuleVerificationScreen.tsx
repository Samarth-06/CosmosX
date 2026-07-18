import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Shield, ShieldCheck, Rocket, BarChart3, AlertTriangle, ArrowRight, RotateCcw, Lock, Check, ChevronDown, ChevronUp } from "lucide-react";
import {
  checkModuleVerification,
  saveVerifiedModule,
  ModuleVerificationStatus,
  MODULE_BADGES,
  Badge as UserBadge,
} from "@/lib/module1-store";

interface Props {
  moduleId: number;
  moduleTitle: string;
  onVerified: () => void;   // Called when module passes — proceed to next
  onRetry: () => void;      // Called when user wants to retry failed tasks
}

const MODULE_COLORS: Record<number, string> = {
  1: "#00E5FF",
  2: "#3B82F6",
  3: "#8B5CF6",
  4: "#F59E0B",
  5: "#10B981",
  6: "#EF4444",
  7: "#F97316",
  8: "#EC4899",
};

const MODULE_PART_NAMES: Record<number, string> = {
  1: "LAUNCH PLATFORM",
  2: "STABILIZER FINS",
  3: "COMBUSTION CHAMBER",
  4: "STEAM TURBOPUMP",
  5: "LOX FUEL TANK",
  6: "ALCOHOL FUEL TANK",
  7: "GUIDANCE DECK",
  8: "WARHEAD NOSE",
};

interface TaskDetailLogic {
  title: string;
  correctDesc: string;
  incorrectDesc: string;
  cost: number;
}

const TASK_LOGIC_DETAILS: Record<string, TaskDetailLogic[]> = {
  task1_1: [
    { title: "Centralized Intermediary Rent", correctDesc: "Recognized that traditional settlement intermediaries extract transactional rents.", incorrectDesc: "Failed to identify transactional rents extracted by intermediary networks.", cost: 5 },
    { title: "Single Point of Outage", correctDesc: "Correctly identified that central clearing routes are subject to single-point hardware crashes.", incorrectDesc: "Incorrectly assumed central nodes are immune to routing outage blockades.", cost: 5 },
    { title: "Direct Peer Wallet Trust", correctDesc: "Successfully verified direct peer wallets without relying on third-party registries.", incorrectDesc: "Struggled to map trustless routes between peer-to-peer wallets.", cost: 5 }
  ],
  task1_2: [
    { title: "Privilege Abuse Vectors", correctDesc: "Audited centralized logs to trace malicious database administrative writes.", incorrectDesc: "Overlooked admin log vulnerabilities allowing silent data manipulation.", cost: 5 },
    { title: "Consensus Hash Discrepancies", correctDesc: "Compared block hash replication records across nodes to expose corruption.", incorrectDesc: "Failed to isolate tampered ledgers via peer-to-peer replicate audits.", cost: 5 }
  ],
  task1_3: [
    { title: "Default Settlement Deadlock", correctDesc: "Identified that direct barters deadlock due to 100% buyer default risk.", incorrectDesc: "Assumed trust-based direct shipping is safe without escrow barriers.", cost: 5 },
    { title: "Atomic Swap Verification", correctDesc: "Unlocked hash time-locked transactions simultaneously to secure settlements.", incorrectDesc: "Triggered standard transfers without interlocking atomic cryptographic safeguards.", cost: 5 }
  ]
};

function getFallbackTaskLogic(taskId: string, maxScore: number): TaskDetailLogic[] {
  const half = Math.floor(maxScore / 2);
  return [
    { title: "Lab Anomaly Audit", correctDesc: "Successfully diagnosed ledger integrity violations and log manipulation.", incorrectDesc: "Struggled to locate and verify malicious manipulation signatures in ledger logs.", cost: half },
    { title: "Cryptographic State Validation", correctDesc: "Passed state update checks and successfully completed state audit runs.", incorrectDesc: "Failed state integrity proof validations or hash generation tests.", cost: maxScore - half }
  ];
}

export default function ModuleVerificationScreen({ moduleId, moduleTitle, onVerified, onRetry }: Props) {
  const [status, setStatus] = useState<ModuleVerificationStatus | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  useEffect(() => {
    setStatus(checkModuleVerification(moduleId));
  }, [moduleId]);

  const color = MODULE_COLORS[moduleId] ?? "#00E5FF";
  const partName = MODULE_PART_NAMES[moduleId] ?? `MODULE ${moduleId} PART`;

  const handleSubmit = () => {
    if (!status) return;
    setIsAnimating(true);
    setTimeout(() => {
      setSubmitted(true);
      setIsAnimating(false);
      if (status.passed) {
        saveVerifiedModule(moduleId);
      }
    }, 1800);
  };

  const totalScore = status ? status.details.reduce((a, d) => a + d.score, 0) : 0;
  const totalMax = status ? status.details.reduce((a, d) => a + d.maxScore, 0) : 0;
  const passRate = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 flex flex-col min-h-0 h-full"
    >
      <div className="flex-1 min-h-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-4">

          {/* Header */}
          <div className="text-center space-y-1">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-mono uppercase tracking-widest"
              style={{ borderColor: `${color}30`, color, background: `${color}08` }}
            >
              <Shield className="w-3 h-3" />
              MODULE {String(moduleId).padStart(2, "0")} VERIFICATION GATE
            </div>
            <h2 className="font-rushblade text-white text-base tracking-wider mt-2">{moduleTitle}</h2>
            <p className="text-xs text-slate-400 font-mono">
              Submit your answers to unlock the <span className="font-bold" style={{ color }}>{partName}</span> rocket component.
            </p>
          </div>

          {/* Task Score Cards */}
          {status && (
            <div className="space-y-1.5">
              {status.details.map((d, i) => {
                const taskPassed = d.passed;
                const attempted = d.score > 0 || d.maxScore === d.score;
                const pct = d.maxScore > 0 ? Math.round((d.score / d.maxScore) * 100) : 0;

                let runningScore = d.score;
                const items = TASK_LOGIC_DETAILS[d.taskId] || getFallbackTaskLogic(d.taskId, d.maxScore);

                const passedItems: TaskDetailLogic[] = [];
                const failedItems: TaskDetailLogic[] = [];

                for (const item of items) {
                  if (runningScore >= item.cost) {
                    passedItems.push(item);
                    runningScore -= item.cost;
                  } else {
                    failedItems.push(item);
                  }
                }

                return (
                  <div
                    key={d.taskId}
                    className={`flex flex-col p-2.5 rounded-xl border transition-all ${
                      taskPassed
                        ? "bg-emerald-500/5 border-emerald-500/20"
                        : "bg-slate-900/60 border-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-mono font-bold border ${
                          taskPassed
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                            : "border-white/10 bg-slate-900 text-slate-500"
                        }`}
                      >
                        {i + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono text-slate-200 truncate">{d.title}</span>
                          <span className={`text-[10px] font-mono font-bold shrink-0 ml-2 ${taskPassed ? "text-emerald-400" : "text-slate-500"}`}>
                            {d.score}/{d.maxScore}
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div className="mt-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${taskPassed ? "bg-emerald-500" : "bg-slate-600"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-0.5">
                          <button
                            onClick={() => setExpandedTaskId(expandedTaskId === d.taskId ? null : d.taskId)}
                            className="text-cyan-400 hover:text-cyan-300 transition flex items-center gap-0.5 font-bold cursor-pointer"
                          >
                            <span>Check status</span>
                            {expandedTaskId === d.taskId ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <span>{taskPassed ? "✓ COMPLETED" : "— PENDING"}</span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {taskPassed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Lock className="w-4 h-4 text-slate-600" />
                        )}
                      </div>
                    </div>

                    {/* Logic Checkpoints Collapsible Analysis Panel */}
                    <AnimatePresence>
                      {expandedTaskId === d.taskId && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-3 px-3 py-2.5 rounded-lg border border-white/5 bg-slate-950/90 space-y-3 text-xs text-left overflow-hidden"
                        >
                          {/* Correct Logic */}
                          <div className="space-y-1">
                            <h5 className="font-mono text-[8px] text-emerald-400 uppercase tracking-wider flex items-center gap-1 font-bold">
                              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Correct Logic Checkpoints
                            </h5>
                            <div className="space-y-1.5 pl-4.5">
                              {passedItems.map((item, idx) => (
                                <div key={idx} className="text-[10px]">
                                  <span className="font-semibold text-slate-200 block">{item.title}</span>
                                  <span className="text-slate-400 text-[9px] mt-0.5 block leading-relaxed">{item.correctDesc}</span>
                                </div>
                              ))}
                              {passedItems.length === 0 && (
                                <span className="text-slate-500 italic text-[9px]">None achieved yet.</span>
                              )}
                            </div>
                          </div>

                          {/* Incorrect Logic */}
                          <div className="space-y-1">
                            <h5 className="font-mono text-[8px] text-rose-400 uppercase tracking-wider flex items-center gap-1 font-bold">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" /> Incorrect Logic & Audit Failures
                            </h5>
                            <div className="space-y-1.5 pl-4.5">
                              {failedItems.map((item, idx) => (
                                <div key={idx} className="text-[10px]">
                                  <span className="font-semibold text-slate-200 block">{item.title}</span>
                                  <span className="text-slate-400 text-[9px] mt-0.5 block leading-relaxed">{item.incorrectDesc}</span>
                                </div>
                              ))}
                              {failedItems.length === 0 && (
                                <span className="text-slate-500 italic text-[9px]">All logic verified! Perfect score.</span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}

          {/* Overall score summary */}
          {status && (
            <div className="flex items-center gap-3 p-3 bg-slate-900/60 border border-white/5 rounded-xl">
              <BarChart3 className="w-5 h-5 text-slate-400 shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-slate-400">Expedition Progress</span>
                  <span className="font-bold text-[#10b981]">
                    {totalScore} / {totalMax} XP ({passRate}%)
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 bg-linear-to-r from-emerald-500 to-cyan-500"
                    style={{
                      width: `${passRate}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Zone */}
          <AnimatePresence mode="wait">
            {!submitted && !isAnimating && (
              <motion.div key="actions" className="flex gap-3">
                <button
                  onClick={onRetry}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-white/10 text-slate-400 hover:text-white hover:border-white/30 text-[10px] font-mono uppercase tracking-wider transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Retry Tasks
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!status?.ready}
                  className={`flex-1 flex items-center justify-center gap-3 py-3 px-6 rounded-xl text-[11px] font-rushblade uppercase tracking-widest transition-all duration-300 shadow-lg relative overflow-hidden group ${
                    status?.ready
                      ? "bg-linear-to-r from-cyan-400 via-blue-500 to-indigo-600 text-white font-bold cursor-pointer hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-[0.99]"
                      : "bg-slate-900 border border-white/5 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  {status?.ready && (
                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                      <ShieldCheck className="w-3 h-3 text-cyan-200 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  )}
                  {!status?.ready && (
                    <Lock className="w-3 h-3 text-slate-600" />
                  )}
                  <span>{status?.ready ? "Submit & Verify Module" : "Complete All Tasks First"}</span>
                </button>
              </motion.div>
            )}

            {isAnimating && (
              <motion.div
                key="verifying"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center gap-3 py-6"
              >
                <div
                  className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: color, borderTopColor: "transparent" }}
                />
                <div className="text-[11px] font-mono tracking-widest" style={{ color }}>
                  VERIFYING MISSION PERFORMANCE...
                </div>
              </motion.div>
            )}

            {submitted && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-5 rounded-2xl border text-center space-y-4 ${
                  status?.passed
                    ? "bg-emerald-500/5 border-emerald-500/30"
                    : "bg-red-500/5 border-red-500/30"
                }`}
              >
                {status?.passed ? (
                  <>
                    <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
                    <div>
                      <div className="font-rushblade text-emerald-400 text-sm tracking-wider">MODULE VERIFIED ✓</div>
                      <div className="text-[11px] text-slate-300 font-mono mt-1">
                        The <span className="font-bold text-white">{partName}</span> has been assembled onto your rocket.
                      </div>
                    </div>

                    {/* Rare Badge Award Ceremony */}
                    {MODULE_BADGES[moduleId] && (
                      <div className="my-2 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 max-w-sm mx-auto space-y-2 relative overflow-hidden shadow-[0_0_20px_rgba(251,191,36,0.12)]">
                        <div className="absolute top-0 right-0 px-2 py-0.5 rounded-bl bg-amber-500/20 border-l border-b border-amber-500/30 text-[8px] font-mono text-amber-400 uppercase tracking-widest font-bold">
                          {MODULE_BADGES[moduleId].rarity} Award
                        </div>
                        <div className="text-3xl animate-bounce">{MODULE_BADGES[moduleId].icon}</div>
                        <div>
                          <h4 className="font-rushblade text-amber-400 text-[11px] uppercase tracking-wider">Badge Earned: {MODULE_BADGES[moduleId].name}</h4>
                          <p className="text-[9.5px] text-slate-300 font-mono leading-relaxed mt-1">{MODULE_BADGES[moduleId].description}</p>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={onVerified}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-[11px] font-rushblade uppercase tracking-wider bg-linear-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold transition shadow-lg cursor-pointer"
                    >
                      <Rocket className="w-4 h-4" />
                      Continue to Module {moduleId + 1} →
                    </button>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-10 h-10 text-red-400 mx-auto animate-pulse" />
                    <div>
                      <div className="font-rushblade text-red-400 text-sm tracking-wider">VERIFICATION FAILED ✗</div>
                      <div className="text-[11px] text-slate-300 font-mono mt-1">
                        You did not meet the minimum passing criteria. Retry the failed tasks to unlock the <span className="font-bold text-white">{partName}</span>.
                      </div>
                    </div>
                    <button
                      onClick={onRetry}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-[11px] font-rushblade uppercase tracking-wider border border-red-500/40 text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Retry Failed Tasks
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

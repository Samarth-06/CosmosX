import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Shield, ShieldCheck, Rocket, BarChart3, AlertTriangle, ArrowRight, RotateCcw, Lock } from "lucide-react";
import {
  checkModuleVerification,
  saveVerifiedModule,
  ModuleVerificationStatus,
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

export default function ModuleVerificationScreen({ moduleId, moduleTitle, onVerified, onRetry }: Props) {
  const [status, setStatus] = useState<ModuleVerificationStatus | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

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

          {/* Minimum Criteria Banner */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[10px] font-mono text-amber-300 space-y-0.5">
              <div className="font-bold text-amber-400 text-[11px]">MINIMUM PASSING CRITERIA</div>
              <div>Each task must meet its individual score threshold. All tasks must be completed before submitting.</div>
              <div className="text-amber-500">⚡ Failing the verification means you will NOT receive the rocket part — retry the failed tasks first.</div>
            </div>
          </div>

          {/* Task Score Cards */}
          {status && (
            <div className="space-y-1.5">
              {status.details.map((d, i) => {
                const taskPassed = d.passed;
                const attempted = d.score > 0 || d.maxScore === d.score;
                const pct = d.maxScore > 0 ? Math.round((d.score / d.maxScore) * 100) : 0;

                return (
                  <div
                    key={d.taskId}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                      taskPassed
                        ? "bg-emerald-500/5 border-emerald-500/20"
                        : attempted
                        ? "bg-red-500/5 border-red-500/20"
                        : "bg-slate-900/60 border-white/5"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-mono font-bold border ${
                        taskPassed
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                          : attempted
                          ? "border-red-500/40 bg-red-500/10 text-red-400"
                          : "border-white/10 bg-slate-900 text-slate-500"
                      }`}
                    >
                      {i + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-slate-200 truncate">{d.title}</span>
                        <span className={`text-[10px] font-mono font-bold shrink-0 ml-2 ${taskPassed ? "text-emerald-400" : attempted ? "text-red-400" : "text-slate-500"}`}>
                          {d.score}/{d.maxScore}
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="mt-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${taskPassed ? "bg-emerald-500" : attempted ? "bg-red-500" : "bg-slate-600"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-0.5">
                        <span>Min required: {d.minRequired}</span>
                        <span>{taskPassed ? "✓ PASS" : attempted ? "✗ FAIL" : "— PENDING"}</span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {taskPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : attempted ? (
                        <XCircle className="w-4 h-4 text-red-400" />
                      ) : (
                        <Lock className="w-4 h-4 text-slate-600" />
                      )}
                    </div>
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
                  <span className="text-slate-400">Overall Score</span>
                  <span className="font-bold" style={{ color: passRate >= 60 ? "#10b981" : "#ef4444" }}>
                    {totalScore} / {totalMax} XP ({passRate}%)
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${passRate}%`,
                      background: passRate >= 60 ? "linear-gradient(to right, #10b981, #34d399)" : "linear-gradient(to right, #ef4444, #f87171)",
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
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-white/10 text-slate-400 hover:text-white hover:border-white/30 text-[10px] font-mono uppercase tracking-wider transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Retry Tasks
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!status?.ready}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-[11px] font-rushblade uppercase tracking-wider transition shadow-lg ${
                    status?.ready
                      ? "bg-linear-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold cursor-pointer"
                      : "bg-slate-800 text-slate-600 cursor-not-allowed border border-white/5"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  {status?.ready ? "Submit & Verify Module" : "Complete All Tasks First"}
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
                className={`p-5 rounded-2xl border text-center space-y-3 ${
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
                    <button
                      onClick={onVerified}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-[11px] font-rushblade uppercase tracking-wider bg-linear-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold transition shadow-lg"
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
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-[11px] font-rushblade uppercase tracking-wider border border-red-500/40 text-red-400 hover:bg-red-500/10 transition"
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

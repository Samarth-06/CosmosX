import { useState, useEffect, useRef, Suspense } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  CheckCircle2,
  RotateCcw,
  Rocket,
  Bot,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Play,
  Trophy,
  Zap,
} from "lucide-react";
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import { TextureLoader } from "three";
import * as THREE from "three";

import mercuryTex from "@/assets/planets/mercury.jpg";
import MercuryChapterOne from "@/components/module/MercuryChapterOne";
import Task1_1_MiddlemanMapper from "@/components/module/Task1_1_MiddlemanMapper";
import Task1_2_CorruptedServer from "@/components/module/Task1_2_CorruptedServer";
import Task1_3_TradeDilemma from "@/components/module/Task1_3_TradeDilemma";
import GenericSandboxRunner from "@/components/module/GenericSandboxRunner";
import FinalEscapeRoom from "@/components/module/FinalEscapeRoom";
import { MERCURY_CURRICULUM } from "@/lib/mercury-curriculum";
import {
  Module1Task,
  MODULE1_TASKS,
  getMercuryCurrentTask,
  setMercuryCurrentTask,
  resetMercuryProgress,
  getVerifiedModules,
} from "@/lib/module1-store";
import ModuleVerificationScreen from "@/components/module/ModuleVerificationScreen";
import { WalletConnectButton } from "@/features/achievements/WalletConnectButton";
import { MintButton } from "@/features/achievements/MintButton";

export const Route = createFileRoute("/planets/mercury")({
  component: MercuryModule,
});

/* ─────────────────────────────────────────────
   MODULE DATA
───────────────────────────────────────────── */

const MODULES = [
  { id: 1, num: "01", title: "Why Does Blockchain Exist?", stageName: "Dark Horizon", color: "#22d3ee",
    tasks: [
      { id: "task1_1" as Module1Task, label: "Map the Middlemen" },
      { id: "task1_2" as Module1Task, label: "Corrupted Command" },
      { id: "task1_3" as Module1Task, label: "Trade Dilemma" },
    ], verifyId: "task1_verify" as Module1Task },
  { id: 2, num: "02", title: "Transactions & Digital Ledgers", stageName: "First Light", color: "#3b82f6",
    tasks: [
      { id: "task2_1" as Module1Task, label: "Transaction Anatomy" },
      { id: "task2_2" as Module1Task, label: "Ledger Audit" },
      { id: "task2_3" as Module1Task, label: "Lifecycle Trace" },
    ], verifyId: "task2_verify" as Module1Task },
  { id: 3, num: "03", title: "Blocks & Blockchain Structure", stageName: "Solar Rise", color: "#8b5cf6",
    tasks: [
      { id: "task3_1" as Module1Task, label: "Block Anatomy" },
      { id: "task3_2" as Module1Task, label: "Genesis Block" },
      { id: "task3_3" as Module1Task, label: "TPS vs Capacity" },
    ], verifyId: "task3_verify" as Module1Task },
  { id: 4, num: "04", title: "Hashing & Data Integrity", stageName: "Scorch Zone", color: "#ec4899",
    tasks: [
      { id: "task4_1" as Module1Task, label: "Hash Basics" },
      { id: "task4_2" as Module1Task, label: "Avalanche Effect" },
      { id: "task4_3" as Module1Task, label: "Hash vs Encrypt" },
    ], verifyId: "task4_verify" as Module1Task },
  { id: 5, num: "05", title: "How Blocks Are Connected", stageName: "Solar Peak", color: "#f59e0b",
    tasks: [
      { id: "task5_1" as Module1Task, label: "Cryptographic Links" },
      { id: "task5_2" as Module1Task, label: "Domino Effect" },
      { id: "task5_3" as Module1Task, label: "Hashing a Header" },
    ], verifyId: "task5_verify" as Module1Task },
  { id: 6, num: "06", title: "Decentralization & Networks", stageName: "Solar Descent", color: "#10b981",
    tasks: [
      { id: "task6_1" as Module1Task, label: "Topologies" },
      { id: "task6_2" as Module1Task, label: "Node Config" },
      { id: "task6_3" as Module1Task, label: "Gossip Protocol" },
    ], verifyId: "task6_verify" as Module1Task },
  { id: 7, num: "07", title: "Consensus & Validation", stageName: "Twilight Zone", color: "#f97316",
    tasks: [
      { id: "task7_1" as Module1Task, label: "Byzantine Problem" },
      { id: "task7_2" as Module1Task, label: "PoW vs PoS" },
      { id: "task7_3" as Module1Task, label: "Federated Consensus" },
    ], verifyId: "task7_verify" as Module1Task },
  { id: 8, num: "08", title: "Immutability & Use Cases", stageName: "Eternal Night", color: "#6366f1",
    tasks: [
      { id: "task8_1" as Module1Task, label: "Traceability" },
      { id: "task8_2" as Module1Task, label: "Drawbacks" },
      { id: "task8_3" as Module1Task, label: "Real-World Cases" },
    ], verifyId: "task8_verify" as Module1Task },
];

const MODULE_TITLES: Record<number, string> = {
  1: "Why Does Blockchain Exist?", 2: "Transactions & Digital Ledgers",
  3: "Blocks & Blockchain Structure", 4: "Hashing & Data Integrity",
  5: "How Blocks Are Connected", 6: "Decentralization & Networks",
  7: "Consensus & Transaction Validation", 8: "Immutability & Use Cases",
};

/* ─────────────────────────────────────────────
   3D MERCURY COMPONENTS
───────────────────────────────────────────── */

function BigMercury() {
  const tex = useLoader(TextureLoader, mercuryTex);
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (meshRef.current) meshRef.current.rotation.y += dt * 0.08;
  });
  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[2.8, 96, 96]} />
      <meshStandardMaterial map={tex} roughness={0.85} metalness={0.15} />
    </mesh>
  );
}

function SmallMercury() {
  const tex = useLoader(TextureLoader, mercuryTex);
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (meshRef.current) meshRef.current.rotation.y += dt * 0.18;
  });
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.6, 64, 64]} />
      <meshStandardMaterial map={tex} roughness={0.85} metalness={0.15} />
    </mesh>
  );
}

/* ─────────────────────────────────────────────
   URL HELPER
───────────────────────────────────────────── */

function getUrlForTask(task: Module1Task): string {
  if (task === "story" || task === "task1_1") return "cosmosx://mercury/ch1/task-1.1-map-the-middlemen";
  if (task === "task1_2") return "cosmosx://mercury/ch1/task-1.2-corrupted-command";
  if (task === "task1_3") return "cosmosx://mercury/ch1/task-1.3-trade-dilemma";
  const match = task.match(/^task(\d+)_(\d+)$/);
  if (match) return `cosmosx://mercury/ch${match[1]}/task-${match[1]}.${match[2]}`;
  const vm = task.match(/^task(\d+)_verify$/);
  if (vm) return `cosmosx://mercury/ch${vm[1]}/module-${vm[1]}-verification`;
  if (task === "final_challenge") return "cosmosx://mercury/final/escape-room";
  if (task === "completed") return "cosmosx://mercury/complete/graduation";
  return "cosmosx://mercury/sandbox";
}

/* ─────────────────────────────────────────────
   NOVA HINTS
───────────────────────────────────────────── */

function getNovaHint(task: Module1Task): string {
  if (task === "task1_1") return "Map all the middlemen in the UPI transaction flow. Look for every hop between sender and receiver.";
  if (task === "task1_2") return "A server is corrupted. Identify which records were tampered with and why it matters.";
  if (task === "task1_3") return "Two traders need to swap goods without trusting each other. Find the trustless mechanism.";
  if (task.endsWith("_verify")) return "Review your task scores. You need to pass all 3 tasks to unlock the next module.";
  if (task === "final_challenge") return "All 8 modules complete. Execute the final timed escape room to graduate from Mercury.";
  if (task === "completed") return "Mercury mastered! You've earned the First Block badge. Launch to Venus next.";
  return "Complete each task in sequence. Read the theory panel first, then attempt the challenge.";
}

/* ─────────────────────────────────────────────
   LANDING PAGE
───────────────────────────────────────────── */

function MercuryLandingPage({
  onEnterModule,
  completedModuleIds,
  currentActiveModuleId,
}: {
  onEnterModule: (modId: number) => void;
  completedModuleIds: number[];
  currentActiveModuleId: number;
}) {
  const [hoveredMod, setHoveredMod] = useState<number | null>(null);

  return (
    <div className="relative h-screen bg-[#030711] overflow-hidden">
      {/* Starfield */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,white_0.7px,transparent_0.7px)] bg-size-[28px_28px] opacity-[0.07]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_15%_50%,rgba(34,211,238,0.07)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_85%_50%,rgba(99,102,241,0.05)_0%,transparent_60%)]" />
      </div>

      {/* Back link */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          to="/"
          className="flex items-center gap-2 text-slate-400 hover:text-white transition font-mono text-xs group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Solar System
        </Link>
      </div>

      {/* Top label */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span className="font-mono text-[10px] text-cyan-400/80 uppercase tracking-[0.3em]">Planet 01 · Mercury</span>
      </div>

      {/* Main layout: left planet, right modules */}
      <div className="absolute inset-0 flex items-center">

        {/* ── LEFT: 3D Planet + title ── */}
        <div className="w-[52%] h-full flex flex-col items-center justify-center relative">
          {/* Atmospheric glow rings */}
          <div className="absolute w-[380px] h-[380px] rounded-full border border-cyan-400/8 animate-[spin_60s_linear_infinite]" />
          <div className="absolute w-[460px] h-[460px] rounded-full border border-cyan-400/5 animate-[spin_90s_linear_infinite_reverse]" />
          <div className="absolute w-[320px] h-[320px] rounded-full"
            style={{ background: "radial-gradient(ellipse at center, rgba(34,211,238,0.08) 0%, transparent 70%)" }} />

          {/* 3D Canvas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
            className="w-[280px] h-[280px] relative"
          >
            <Canvas camera={{ position: [0, 0, 6.5] }}>
              <ambientLight intensity={0.25} />
              <pointLight position={[12, 8, 10]} intensity={4} color="#fff5e0" />
              <pointLight position={[-8, -4, -6]} intensity={0.4} color="#22d3ee" />
              <Suspense fallback={null}>
                <BigMercury />
              </Suspense>
            </Canvas>

            {/* Orbit ring overlay */}
            <div className="absolute inset-0 rounded-full border border-cyan-400/10 pointer-events-none" style={{ transform: "scale(1.15) rotateX(75deg)" }} />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            className="text-center mt-6 space-y-2"
          >
            <h1 className="font-rushblade text-5xl text-white tracking-wider">MERCURY</h1>
            <p className="font-mono text-xs text-slate-400 uppercase tracking-[0.3em]">Blockchain Foundations</p>
            <div className="flex items-center justify-center gap-4 mt-3">
              <span className="px-3 py-1 rounded-full border border-cyan-400/20 bg-cyan-400/8 font-mono text-[10px] text-cyan-300">8 Modules</span>
              <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 font-mono text-[10px] text-slate-400">Beginner</span>
              <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 font-mono text-[10px] text-slate-400">~6 hrs</span>
            </div>
          </motion.div>

          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 w-64"
          >
            <div className="flex justify-between text-[9px] font-mono text-slate-500 mb-1.5">
              <span>{completedModuleIds.length}/8 modules complete</span>
              <span>{Math.round((completedModuleIds.length / 8) * 100)}%</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full border border-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.round((completedModuleIds.length / 8) * 100)}%` }}
                transition={{ delay: 0.9, duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 rounded-full"
                style={{ boxShadow: "0 0 8px rgba(34,211,238,0.5)" }}
              />
            </div>
          </motion.div>
        </div>

        {/* ── RIGHT: Module Grid ── */}
        <div className="w-[48%] h-full flex flex-col justify-center pr-12 overflow-y-auto py-20">
          <motion.p
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="font-mono text-[9px] text-slate-500 uppercase tracking-[0.3em] mb-4"
          >
            Learning Modules
          </motion.p>

          <div className="space-y-2">
            {MODULES.map((mod, i) => {
              const done = completedModuleIds.includes(mod.id);
              const unlocked = mod.id <= currentActiveModuleId;
              const isActive = mod.id === currentActiveModuleId;
              const isHovered = hoveredMod === mod.id;

              return (
                <motion.button
                  key={mod.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.05, ease: [0.19, 1, 0.22, 1] }}
                  onClick={() => unlocked && onEnterModule(mod.id)}
                  onMouseEnter={() => setHoveredMod(mod.id)}
                  onMouseLeave={() => setHoveredMod(null)}
                  disabled={!unlocked}
                  className={`w-full text-left rounded-2xl border transition-all duration-200 group ${
                    !unlocked ? "opacity-35 cursor-not-allowed border-white/5 bg-transparent" :
                    done ? "border-emerald-400/25 bg-emerald-400/5 hover:bg-emerald-400/8 hover:border-emerald-400/40" :
                    isActive ? "border-white/20 bg-white/6 hover:bg-white/10 cursor-pointer" :
                    "border-white/8 bg-white/3 hover:bg-white/7 hover:border-white/15 cursor-pointer"
                  }`}
                  style={isHovered && unlocked ? {
                    borderColor: `${mod.color}40`,
                    backgroundColor: `${mod.color}08`,
                    boxShadow: `0 0 24px ${mod.color}12`,
                  } : {}}
                >
                  <div className="flex items-center gap-3.5 px-4 py-3">
                    {/* Module number badge */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-mono text-xs font-bold shrink-0 border transition-all"
                      style={{
                        borderColor: done ? "rgba(52,211,153,0.4)" : unlocked ? `${mod.color}40` : "rgba(255,255,255,0.1)",
                        backgroundColor: done ? "rgba(52,211,153,0.12)" : unlocked ? `${mod.color}12` : "rgba(255,255,255,0.03)",
                        color: done ? "#34d399" : unlocked ? mod.color : "#475569",
                      }}
                    >
                      {done ? <CheckCircle2 className="w-4 h-4" /> : !unlocked ? <Lock className="w-3.5 h-3.5" /> : mod.num}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-[9px] uppercase tracking-wider" style={{ color: unlocked ? mod.color : "#374151" }}>
                          {mod.stageName}
                        </p>
                        {isActive && !done && (
                          <span className="px-1.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-[8px] font-mono text-amber-400 uppercase tracking-wider animate-pulse">
                            Active
                          </span>
                        )}
                        {done && (
                          <span className="px-1.5 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-[8px] font-mono text-emerald-400 uppercase tracking-wider">
                            Done
                          </span>
                        )}
                      </div>
                      <p className={`text-[12px] font-medium mt-0.5 truncate ${unlocked ? "text-white" : "text-slate-600"}`}>
                        {mod.title}
                      </p>
                      <p className="text-[10px] text-slate-600 mt-0.5 font-mono">3 tasks</p>
                    </div>

                    {/* Arrow */}
                    <div className={`shrink-0 transition-all ${unlocked ? "opacity-60 group-hover:opacity-100" : "opacity-20"}`}>
                      <ChevronRight
                        className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                        style={{ color: unlocked ? mod.color : "#374151" }}
                      />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   WORKSPACE — sidebar + virtual browser
───────────────────────────────────────────── */

function MercuryWorkspace({
  task,
  onTaskChange,
  onBack,
  completedModuleIds,
  currentActiveModuleId,
  activeTaskInfo,
  handleLaunchRocket,
}: {
  task: Module1Task;
  onTaskChange: (t: Module1Task) => void;
  onBack: () => void;
  completedModuleIds: number[];
  currentActiveModuleId: number;
  activeTaskInfo: { taskDef: any; color: string } | null;
  handleLaunchRocket: () => void;
}) {
  const [expandedModule, setExpandedModule] = useState<number>(() => {
    const match = task.match(/^task(\d+)_/);
    return match ? parseInt(match[1]) : 1;
  });
  const [urlAnimating, setUrlAnimating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const currentUrl = getUrlForTask(task);

  // Auto-expand the module the task belongs to
  useEffect(() => {
    const match = task.match(/^task(\d+)_/);
    if (match) setExpandedModule(parseInt(match[1]));
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    setUrlAnimating(true);
    const t = setTimeout(() => setUrlAnimating(false), 700);
    return () => clearTimeout(t);
  }, [task]);

  const isTaskDone = (taskId: Module1Task) => {
    const current = MODULE1_TASKS.indexOf(task);
    const target = MODULE1_TASKS.indexOf(taskId);
    return current > target;
  };
  const isModuleDone = (id: number) => completedModuleIds.includes(id);
  const isModuleUnlocked = (id: number) => id <= currentActiveModuleId;

  const activeModDef = MODULES.find((m) => {
    const match = task.match(/^task(\d+)_/);
    return match ? m.id === parseInt(match[1]) : m.id === 1;
  });
  const accentColor = activeModDef?.color ?? "#22d3ee";

  return (
    <div className="h-screen bg-[#030711] text-white flex flex-col overflow-hidden">
      {/* Starfield */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,white_0.7px,transparent_0.7px)] bg-size-[28px_28px] opacity-[0.06]" />
      </div>

      {/* ── WORKSPACE HEADER ── */}
      <header className="relative z-20 shrink-0 flex items-center gap-4 px-5 py-3 bg-[#08101f]/90 border-b border-white/8 backdrop-blur-xl">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white transition font-mono text-[10px] group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          MERCURY
        </button>

        <div className="w-px h-4 bg-white/10" />

        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest" style={{ color: accentColor }}>
            {task.match(/^task(\d+)_(\d+)$/) ? `Module ${task.match(/^task(\d+)_(\d+)$/)![1].padStart(2,"0")} · Task ${task.match(/^task(\d+)_(\d+)$/)![2]}` :
             task.match(/^task(\d+)_verify$/) ? `Module ${task.match(/^task(\d+)_verify$/)![1].padStart(2,"0")} · Verification` :
             task === "final_challenge" ? "Final Mission · Escape Room" :
             task === "completed" ? "Mercury Complete" : "Sandbox"}
          </span>
        </div>

        {/* Module progress ticks */}
        <div className="ml-auto hidden md:flex items-center gap-1">
          {MODULES.map((mod) => {
            const done = isModuleDone(mod.id);
            const active = mod.id === currentActiveModuleId;
            return (
              <div key={mod.id} className="w-4 h-1.5 rounded-sm border transition-all duration-500"
                style={{
                  backgroundColor: done ? "#10b981" : active ? `${mod.color}30` : "transparent",
                  borderColor: done ? "#10b981" : active ? mod.color : "rgba(255,255,255,0.1)",
                  boxShadow: done ? "0 0 5px rgba(16,185,129,0.6)" : active ? `0 0 4px ${mod.color}70` : "none",
                }}
                title={`Module ${mod.num}`}
              />
            );
          })}
        </div>

        <button onClick={() => { resetMercuryProgress(); onBack(); }}
          className="flex items-center gap-1.5 text-[9px] font-mono text-rose-400 hover:text-rose-300 bg-rose-500/8 hover:bg-rose-500/15 px-2.5 py-1.5 rounded-lg border border-rose-500/20 hover:border-rose-500/40 transition shrink-0">
          <RotateCcw className="w-3 h-3" />
          <span className="hidden sm:block">RESET</span>
        </button>
      </header>

      {/* ── BODY: SIDEBAR + BROWSER ── */}
      <div className="flex flex-1 min-h-0 relative z-10">

        {/* ── LEFT MODULE SIDEBAR ── */}
        <aside className="w-60 shrink-0 border-r border-white/8 bg-[#060d1a]/80 backdrop-blur-md flex flex-col overflow-hidden">

          {/* Planet mini header */}
          <div className="px-3 pt-3 pb-3 border-b border-white/8 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl overflow-hidden border shrink-0" style={{ borderColor: `${accentColor}30`, boxShadow: `0 0 12px ${accentColor}25` }}>
                <Canvas camera={{ position: [0, 0, 4] }}>
                  <ambientLight intensity={0.3} />
                  <pointLight position={[8, 8, 8]} intensity={3} />
                  <Suspense fallback={null}><SmallMercury /></Suspense>
                </Canvas>
              </div>
              <div className="min-w-0">
                <p className="font-mono text-[8px] text-slate-500 uppercase tracking-widest">Planet 01</p>
                <h2 className="font-rushblade text-xs text-white">MERCURY</h2>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-[8px] font-mono text-slate-600 mb-1">
                <span>{completedModuleIds.length}/8 done</span>
                <span>{Math.round((completedModuleIds.length / 8) * 100)}%</span>
              </div>
              <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.round((completedModuleIds.length / 8) * 100)}%`, background: `linear-gradient(90deg, ${accentColor}70, ${accentColor})` }} />
              </div>
            </div>
          </div>

          {/* Module + task list */}
          <nav className="flex-1 overflow-y-auto py-2 space-y-0.5 px-2">
            {MODULES.map((mod) => {
              const done = isModuleDone(mod.id);
              const unlocked = isModuleUnlocked(mod.id);
              const isExpanded = expandedModule === mod.id;
              const currentTaskInMod = task.startsWith(`task${mod.id}_`);

              return (
                <div key={mod.id}>
                  <button
                    onClick={() => unlocked && setExpandedModule(isExpanded ? 0 : mod.id)}
                    disabled={!unlocked}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left transition-all ${
                      currentTaskInMod ? "bg-white/8 border border-white/10" :
                      unlocked ? "hover:bg-white/5" : "opacity-35 cursor-not-allowed"
                    }`}
                  >
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[9px] font-mono font-bold border transition-all"
                      style={{
                        borderColor: done ? "rgba(52,211,153,0.4)" : currentTaskInMod ? `${mod.color}50` : unlocked ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)",
                        color: done ? "#34d399" : currentTaskInMod ? mod.color : unlocked ? "#94a3b8" : "#374151",
                        backgroundColor: done ? "rgba(52,211,153,0.1)" : currentTaskInMod ? `${mod.color}15` : "transparent",
                      }}
                    >
                      {done ? "✓" : !unlocked ? <Lock className="w-2.5 h-2.5" /> : mod.num}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[8px] font-mono uppercase tracking-wider truncate" style={{ color: unlocked ? mod.color : "#374151" }}>
                        MODULE {mod.num}
                      </p>
                      <p className={`text-[10px] truncate mt-0.5 ${currentTaskInMod ? "text-white font-medium" : unlocked ? "text-slate-400" : "text-slate-700"}`}>
                        {mod.title}
                      </p>
                    </div>
                    <ChevronRight className={`w-3 h-3 shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""} ${unlocked ? "text-slate-500" : "text-slate-800"}`} />
                  </button>

                  <AnimatePresence>
                    {isExpanded && unlocked && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
                        <div className="pl-9 pr-2 pb-1 pt-0.5 space-y-0.5">
                          {mod.tasks.map((t) => {
                            const tDone = isTaskDone(t.id);
                            const tActive = task === t.id;
                            return (
                              <button key={t.id} onClick={() => onTaskChange(t.id)}
                                className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 transition-all hover:bg-white/5"
                              >
                                <span className="w-1.5 h-1.5 rounded-full shrink-0"
                                  style={{ backgroundColor: tDone ? "#34d399" : tActive ? mod.color : "rgba(255,255,255,0.15)" }} />
                                <span className="font-mono text-[10px] truncate"
                                  style={{ color: tActive ? mod.color : tDone ? "#34d399" : "#64748b", fontWeight: tActive ? "700" : "400" }}>
                                  {t.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* Final challenge */}
            <button disabled={completedModuleIds.length < 8} onClick={() => onTaskChange("final_challenge")}
              className={`w-full flex items-center gap-2 px-2.5 py-2 mt-1 rounded-xl text-left border transition-all ${
                completedModuleIds.length >= 8 ? "border-rose-400/20 bg-rose-500/8 hover:bg-rose-500/12" : "border-transparent opacity-25 cursor-not-allowed"
              }`}>
              <div className="w-6 h-6 rounded-lg border border-rose-400/30 bg-rose-500/15 flex items-center justify-center text-rose-400 shrink-0">
                <Rocket className="w-3 h-3" />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] font-mono text-rose-400 uppercase tracking-wider">FINAL MISSION</p>
                <p className="text-[10px] text-slate-400 truncate">Escape Room</p>
              </div>
            </button>
          </nav>

          {/* NOVA */}
          <div className="mx-2 mb-2 p-2.5 rounded-xl border border-violet-400/20 bg-violet-400/5 shrink-0">
            <div className="flex items-center gap-1.5 mb-1">
              <Bot className="w-3 h-3 text-violet-300" />
              <span className="text-[8px] font-mono text-violet-300 uppercase tracking-wider">NOVA · AI Guide</span>
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[9px] text-slate-400 leading-relaxed">{getNovaHint(task)}</p>
          </div>
        </aside>

        {/* ── VIRTUAL BROWSER (content only) ── */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#040916]">

          {/* Browser chrome */}
          <div className="shrink-0 bg-[#08101f]/95 border-b border-white/8 backdrop-blur-md">
            {/* Tab strip */}
            <div className="flex items-end gap-0 px-3 pt-2">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-t-xl border border-b-0 text-[10px] font-mono bg-[#0d1628]/90 min-w-0 max-w-xs"
                style={{ borderColor: `${accentColor}25` }}>
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: accentColor, boxShadow: `0 0 6px ${accentColor}80` }} />
                <span className="truncate text-white/80">{activeModDef?.title ?? "Mercury Sandbox"}</span>
              </div>
            </div>

            {/* URL row */}
            <div className="flex items-center gap-2.5 px-3 pb-2 pt-1">
              {/* Traffic lights */}
              <div className="flex gap-1.5 shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
              </div>

              {/* Nav buttons */}
              <div className="flex gap-0.5 shrink-0">
                <button className="w-6 h-6 rounded-md flex items-center justify-center text-slate-600 hover:text-slate-400 hover:bg-white/5 transition">
                  <ArrowLeft className="w-3 h-3" />
                </button>
                <button className="w-6 h-6 rounded-md flex items-center justify-center text-slate-700 cursor-not-allowed">
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button className="w-6 h-6 rounded-md flex items-center justify-center text-slate-600 hover:text-slate-400 hover:bg-white/5 transition">
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>

              {/* URL bar */}
              <div className="flex-1 flex items-center gap-2 bg-[#0a0f1e]/90 border rounded-lg px-3 py-1 min-w-0 transition-all duration-500"
                style={{ borderColor: urlAnimating ? `${accentColor}50` : "rgba(255,255,255,0.1)", boxShadow: urlAnimating ? `0 0 12px ${accentColor}18` : "none" }}>
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 5px rgba(52,211,153,0.7)" }} />
                  <span className="text-[8px] font-mono text-emerald-400/70 uppercase tracking-wider hidden sm:block">SECURE</span>
                </div>
                <div className="w-px h-2.5 bg-white/10 shrink-0" />
                <motion.span key={currentUrl} initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }}
                  className="font-mono text-[10px] truncate flex-1" style={{ color: accentColor }}>
                  {currentUrl}
                </motion.span>
              </div>

              <div className="shrink-0 flex items-center gap-1.5 bg-slate-900/50 border border-white/8 px-2 py-1 rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
                <span className="font-mono text-[8px]" style={{ color: accentColor }}>SANDBOX</span>
              </div>
            </div>
          </div>

          {/* Page content */}
          <div ref={contentRef} className="flex-1 overflow-y-auto min-h-0">
            <AnimatePresence mode="wait">

              {task === "story" && (
                <motion.div key="story" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="h-full">
                  <MercuryChapterOne onComplete={() => onTaskChange("task1_1")} />
                </motion.div>
              )}
              {task === "task1_1" && (
                <motion.div key="t1_1" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="h-full">
                  <Task1_1_MiddlemanMapper onComplete={() => onTaskChange("task1_2")} />
                </motion.div>
              )}
              {task === "task1_2" && (
                <motion.div key="t1_2" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="h-full">
                  <Task1_2_CorruptedServer onComplete={() => onTaskChange("task1_3")} />
                </motion.div>
              )}
              {task === "task1_3" && (
                <motion.div key="t1_3" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="h-full">
                  <Task1_3_TradeDilemma onComplete={() => onTaskChange("task1_verify")} />
                </motion.div>
              )}

              {activeTaskInfo && !task.endsWith("_verify") && !["task1_1","task1_2","task1_3","final_challenge","completed"].includes(task) && (
                <motion.div key={task} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="h-full flex flex-col">
                  <GenericSandboxRunner taskDef={activeTaskInfo.taskDef} moduleColor={activeTaskInfo.color}
                    onComplete={() => {
                      const idx = MODULE1_TASKS.indexOf(task);
                      onTaskChange(MODULE1_TASKS[idx + 1] || "completed");
                    }}
                  />
                </motion.div>
              )}

              {([1,2,3,4,5,6,7,8] as const).map((modId) => {
                const vk = `task${modId}_verify` as Module1Task;
                const next = modId < 8 ? `task${modId + 1}_1` as Module1Task : "final_challenge";
                return task === vk ? (
                  <motion.div key={vk} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="h-full flex flex-col">
                    <ModuleVerificationScreen moduleId={modId} moduleTitle={MODULE_TITLES[modId]}
                      onVerified={() => onTaskChange(next)}
                      onRetry={() => onTaskChange(`task${modId}_1` as Module1Task)}
                    />
                  </motion.div>
                ) : null;
              })}

              {task === "final_challenge" && (
                <motion.div key="final" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="h-full flex flex-col">
                  <FinalEscapeRoom onComplete={handleLaunchRocket} />
                </motion.div>
              )}

              {task === "completed" && (
                <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center p-8 text-center gap-6">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 150, delay: 0.2 }}
                    className="w-24 h-24 rounded-full flex items-center justify-center border-2"
                    style={{ backgroundColor: "rgba(251,191,36,0.12)", borderColor: "rgba(251,191,36,0.4)", boxShadow: "0 0 50px rgba(251,191,36,0.25)" }}>
                    <Trophy className="w-10 h-10 text-amber-400" />
                  </motion.div>
                  <div>
                    <h1 className="font-rushblade text-3xl text-white">MERCURY COMPLETE</h1>
                    <p className="text-slate-400 mt-2 text-sm max-w-sm">All 8 modules mastered. First Block badge unlocked.</p>
                  </div>
                  <div className="flex gap-3">
                    {[{ l: "XP Earned", v: "+800", c: "#22d3ee" }, { l: "Badge", v: "🏅 First Block", c: "#f59e0b" }, { l: "Next", v: "Venus →", c: "#8b5cf6" }].map((s) => (
                      <div key={s.l} className="rounded-2xl border px-5 py-3 text-center" style={{ borderColor: `${s.c}25`, backgroundColor: `${s.c}08` }}>
                        <p className="font-mono text-[9px] uppercase tracking-wider text-slate-500 mb-1">{s.l}</p>
                        <p className="font-rushblade text-lg" style={{ color: s.c }}>{s.v}</p>
                      </div>
                    ))}
                  </div>

                  {/* On-chain achievement claim — connect a Stellar wallet and mint
                      proof of Mercury completion to the Testnet contract. */}
                  <div className="w-full max-w-sm rounded-2xl border border-cyan-400/25 bg-cyan-400/5 px-5 py-4 text-left">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-cyan-300/80 mb-3">
                      Claim your on-chain proof
                    </p>
                    <WalletConnectButton />
                    <div className="mt-3">
                      <MintButton />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={handleLaunchRocket}
                      className="px-7 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-[0_0_30px_rgba(251,191,36,0.4)] hover:scale-[1.02]">
                      Back to Solar System
                    </button>
                    <Link to="/planets/venus" className="px-6 py-3 bg-violet-500/20 border border-violet-400/30 text-violet-300 hover:bg-violet-500/30 font-semibold text-sm rounded-xl transition-all">
                      Enter Venus →
                    </Link>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ROOT COMPONENT
───────────────────────────────────────────── */

export default function MercuryModule() {
  const router = useRouter();

  const [view, setView] = useState<"landing" | "workspace">("landing");
  const [task, setTask] = useState<Module1Task>("story");
  const [isLaunching, setIsLaunching] = useState(false);

  const completedModuleIds = getVerifiedModules();
  const currentActiveModuleId = completedModuleIds.length < 8 ? completedModuleIds.length + 1 : 9;

  // Load saved progress on mount
  useEffect(() => {
    // DEV-ONLY shortcut: visiting the route with `?dev=complete` jumps straight
    // to the completion screen (where the on-chain claim UI lives) instead of
    // playing all 8 modules. Opt-in per visit, read client-side so it never
    // affects SSR or the default experience, and gated behind Vite's
    // import.meta.env.DEV so it can never trigger in a production build.
    if (import.meta.env.DEV && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("dev") === "complete") {
        setTask("completed");
        setView("workspace");
        return;
      }
    }
    try {
      const saved = getMercuryCurrentTask();
      const resolved = saved || "story";
      setTask(resolved);
      // If they have progress, go directly to workspace
      if (resolved !== "story" || completedModuleIds.length > 0) {
        // Keep landing by default, but could auto-go to workspace
      }
    } catch (err) {
      console.error("Failed to load progress", err);
    }
  }, []);

  const handleTaskChange = (next: Module1Task) => {
    setTask(next);
    setMercuryCurrentTask(next);
  };

  const handleEnterModule = (modId: number) => {
    // Navigate to the current task for this module
    const savedTask = getMercuryCurrentTask();
    const match = savedTask.match(/^task(\d+)_/);
    const savedModId = match ? parseInt(match[1]) : 1;

    let targetTask: Module1Task;
    if (savedModId === modId) {
      // Resume their saved task in this module
      targetTask = savedTask;
    } else {
      // Jump to first task of selected module
      targetTask = modId === 1 ? "story" : `task${modId}_1` as Module1Task;
    }

    setTask(targetTask);
    setMercuryCurrentTask(targetTask);
    setView("workspace");
  };

  const handleLaunchRocket = () => {
    setIsLaunching(true);
    setTimeout(() => router.navigate({ to: "/" }), 2800);
  };

  const activeTaskInfo = (() => {
    for (const mod of MERCURY_CURRICULUM) {
      const found = mod.tasks.find((t) => t.id === task);
      if (found) return { taskDef: found, color: mod.color };
    }
    return null;
  })();

  return (
    <>
      <AnimatePresence mode="wait">
        {view === "landing" ? (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.35 }}>
            <MercuryLandingPage
              onEnterModule={handleEnterModule}
              completedModuleIds={completedModuleIds}
              currentActiveModuleId={currentActiveModuleId}
            />
          </motion.div>
        ) : (
          <motion.div key="workspace" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            <MercuryWorkspace
              task={task}
              onTaskChange={handleTaskChange}
              onBack={() => setView("landing")}
              completedModuleIds={completedModuleIds}
              currentActiveModuleId={currentActiveModuleId}
              activeTaskInfo={activeTaskInfo}
              handleLaunchRocket={handleLaunchRocket}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launch overlay */}
      {isLaunching && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 overflow-hidden">
          <motion.div
            animate={{ y: [-3, 3, -2, 2, -3, 3, 0] }}
            transition={{ repeat: Infinity, duration: 0.12 }}
            className="flex flex-col items-center gap-6"
          >
            <Rocket className="w-14 h-14 text-cyan-400 -rotate-45 animate-bounce" />
            <h2 className="font-rushblade text-lg tracking-widest text-white uppercase animate-pulse">
              EVACUATING MERCURY SECTOR...
            </h2>
            <p className="font-mono text-[9px] text-slate-500 animate-pulse">TRANSIT → SOLAR ORBIT</p>
          </motion.div>
          <div className="absolute bottom-0 w-full h-[40vh] bg-gradient-to-t from-orange-500/8 via-transparent to-transparent pointer-events-none" />
        </div>
      )}
    </>
  );
}

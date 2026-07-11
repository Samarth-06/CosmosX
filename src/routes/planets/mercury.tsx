import { useState, useEffect, useRef, Suspense } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Lock, CheckCircle2, RotateCcw, Play, Compass, Star, Rocket, Info } from "lucide-react";
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import { TextureLoader } from "three";
import * as THREE from "three";

import mercuryTex from "@/assets/planets/mercury.jpg";
import RocketAssembly from "@/components/module/RocketAssembly";
import Task1_1_MiddlemanMapper from "@/components/module/Task1_1_MiddlemanMapper";
import Task1_2_CorruptedServer from "@/components/module/Task1_2_CorruptedServer";
import Task1_3_TradeDilemma from "@/components/module/Task1_3_TradeDilemma";
import Task1_4_ComparisonEngine from "@/components/module/Task1_4_ComparisonEngine";
import Task1_5_CardSorter from "@/components/module/Task1_5_CardSorter";
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

export const Route = createFileRoute("/planets/mercury")({
  component: MercuryModule,
});

interface ModuleDetail {
  id: number;
  title: string;
  topic: string;
  stageName: string;
  iconName: "horizon" | "sunrise" | "solar-rise" | "scorch" | "peak" | "descent" | "twilight" | "night";
  tasks: string[];
  description: string;
  color: string; // Unique elegant color code
  angle: number; // Angle in degrees around the circle
}

const MERCURY_EXPEDITION_MODULES: ModuleDetail[] = [
  {
    id: 1,
    title: "MODULE 01",
    topic: "Why Does Blockchain Exist?",
    stageName: "Dark Horizon",
    iconName: "horizon",
    angle: -90, // 12 o'clock
    color: "#00E5FF", // Cyan
    description: "Audit centralized command routing database to isolate systemic vulnerabilities and discover why decentralization is required.",
    tasks: [
      "Task 1.1: Centralized Systems",
      "Task 1.2: Single Point of Failure",
      "Task 1.3: The Trust Problem",
      "Task 1.4: The Blockchain Solution",
      "Task 1.5: Traditional DB vs. Blockchain",
    ],
  },
  {
    id: 2,
    title: "MODULE 02",
    topic: "Transactions & Digital Ledgers",
    stageName: "First Light",
    iconName: "sunrise",
    angle: -45,
    color: "#3B82F6", // Electric Blue
    description: "Examine transaction payloads, audit append-only digital ledgers, trace the transaction lifecycle, and act as a mempool validator.",
    tasks: [
      "Task 2.1: What is a Transaction?",
      "Task 2.2: The Digital Ledger & Bookkeeping",
      "Task 2.3: Transaction Lifecycle",
      "Task 2.4: Valid vs. Invalid Transactions",
      "Task 2.5: Chapter Challenge: Oxygen Transfer",
    ],
  },
  {
    id: 3,
    title: "MODULE 03",
    topic: "Blocks & Blockchain Structure",
    stageName: "Solar Rise",
    iconName: "solar-rise",
    angle: 0, // 3 o'clock
    color: "#8B5CF6", // Violet
    description: "Learn block header metadata structures, audit genesis configurations, calculate TPS throughput, and reconstruct chronological blockchains.",
    tasks: [
      "Task 3.1: What is a Block? (Header and Body)",
      "Task 3.2: The Genesis Block",
      "Task 3.3: Block Size & Capacity",
      "Task 3.4: Chronological Chains",
      "Task 3.5: Chapter Challenge: Space Log",
    ],
  },
  {
    id: 4,
    title: "MODULE 04",
    topic: "Hashing & Data Integrity",
    stageName: "Scorch Zone",
    iconName: "scorch",
    angle: 45,
    color: "#EC4899", // Magenta
    description: "Learn cryptographic hash parameters, investigate the avalanche effect, compare hashing to encryption, and run checksum integrity audits.",
    tasks: [
      "Task 4.1: What is Hashing?",
      "Task 4.2: The Avalanche Effect",
      "Task 4.3: Hashing vs. Encryption",
      "Task 4.4: Detect the Alien Message",
      "Task 4.5: Chapter Challenge: Calibration",
    ],
  },
  {
    id: 5,
    title: "MODULE 05",
    topic: "How Blocks Are Connected",
    stageName: "Solar Peak",
    iconName: "peak",
    angle: 90, // 6 o'clock
    color: "#F59E0B", // Amber
    description: "Audit parent hash back-links, trigger chain reaction domino effects, hash block headers, and repair broken transaction ledger links.",
    tasks: [
      "Task 5.1: Cryptographic Links",
      "Task 5.2: The Domino Effect",
      "Task 5.3: Hashing a Block Header",
      "Task 5.4: Downstream Audit",
      "Task 5.5: Chapter Challenge: Repair Chain",
    ],
  },
  {
    id: 6,
    title: "MODULE 06",
    topic: "Decentralization & Distributed Networks",
    stageName: "Solar Descent",
    iconName: "descent",
    angle: 135,
    color: "#10B981", // Emerald
    description: "Map network topologies, audit node configuration Sync parameters, simulate Gossip transmission routing, and calculate Byzantine Fault tolerance.",
    tasks: [
      "Task 6.1: Topologies",
      "Task 6.2: Node Config",
      "Task 6.3: Gossip Protocols",
      "Task 6.4: Fault Tolerance",
      "Task 6.5: Chapter Challenge: Save Network",
    ],
  },
  {
    id: 7,
    title: "MODULE 07",
    topic: "Consensus & Transaction Validation",
    stageName: "Twilight Zone",
    iconName: "twilight",
    angle: 180, // 9 o'clock
    color: "#F97316", // Orange
    description: "Solve Byzantine Generals puzzles, compare PoW vs. PoS consensus systems, identify federated quorum cores, and order double-spending transactions.",
    tasks: [
      "Task 7.1: Consensus Problem",
      "Task 7.2: PoW vs. PoS",
      "Task 7.3: Federated Consensus",
      "Task 7.4: Double-Spending",
      "Task 7.5: Chapter Challenge: Council",
    ],
  },
  {
    id: 8,
    title: "MODULE 08",
    topic: "Immutability, Transparency & Blockchain Use Cases",
    stageName: "Eternal Night",
    iconName: "night",
    angle: -135,
    color: "#6366F1", // Indigo
    description: "Verify shipping logs using traceability, calculate throughput costs comparing DB to BC, match industry use cases, and sort database architecture models.",
    tasks: [
      "Task 8.1: Immutability & Traceability",
      "Task 8.2: Hashing Drawbacks",
      "Task 8.3: Real-World Use Cases",
      "Task 8.4: Decision Matrix",
      "Task 8.5: Chapter Challenge: Selection",
    ],
  },
];

const getLabelStyles = (angle: number, isSelected: boolean) => {
  if (angle === -90) {
    return {
      className: "absolute bottom-full left-1/2 flex flex-col items-center text-center pb-2 w-44",
      animate: { y: isSelected ? -42 : 0, x: "-50%" }
    };
  }
  if (angle === 90) {
    return {
      className: "absolute top-full left-1/2 flex flex-col items-center text-center pt-2 w-44",
      animate: { y: isSelected ? 42 : 0, x: "-50%" }
    };
  }
  if (angle === -45 || angle === 0 || angle === 45) {
    return {
      className: "absolute left-full top-1/2 flex flex-col items-start text-left pl-3.5 w-44",
      animate: { x: isSelected ? 42 : 0, y: "-50%" }
    };
  }
  return {
    className: "absolute right-full top-1/2 flex flex-col items-end text-right pr-3.5 w-44",
    animate: { x: isSelected ? -42 : 0, y: "-50%" }
  };
};

function RotatingMercury() {
  const tex = useLoader(TextureLoader, mercuryTex);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, dt) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += dt * 0.12;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2.5, 64, 64]} />
      <meshStandardMaterial
        map={tex}
        roughness={0.9}
        metalness={0.15}
      />
    </mesh>
  );
}

export default function MercuryModule() {
  const router = useRouter();
  const [task, setTask] = useState<Module1Task>("story");
  const [activeModule, setActiveModule] = useState<number | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);

  const activeTaskInfo = (() => {
    for (const mod of MERCURY_CURRICULUM) {
      const found = mod.tasks.find((t) => t.id === task);
      if (found) {
        return { taskDef: found, color: mod.color };
      }
    }
    return null;
  })();
  const [isLaunching, setIsLaunching] = useState(false);
  const [wavePhase, setWavePhase] = useState<"idle" | "charge" | "expand" | "impact">("idle");
  const [baseRadius, setBaseRadius] = useState(210);

  // Resize listener to scale orbit diameter dynamically for laptop viewports
  useEffect(() => {
    const handleResize = () => {
      const h = window.innerHeight;
      const calculatedRadius = Math.max(160, Math.min(210, (h - 220) * 0.35));
      setBaseRadius(calculatedRadius);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sync state on mount
  useEffect(() => {
    try {
      const currentTask = getMercuryCurrentTask();
      setTask(currentTask);
      
      // Do NOT set activeModule on mount so the user sees the planet and modules page first.
      // We pre-select the active module bubble to make the current tasks immediately visible.
      if (currentTask !== "story" && currentTask !== "completed") {
        if (currentTask === "final_challenge") {
          setSelectedModuleId(null);
        } else {
          const match = currentTask.match(/task(\d)_/);
          if (match && match[1]) {
            const modId = parseInt(match[1], 10);
            setSelectedModuleId(modId);
          } else {
            setSelectedModuleId(1);
          }
        }
      } else {
        setSelectedModuleId(1);
      }
    } catch (err) {
      console.error("Failed to load local storage progress", err);
    }
  }, []);

  // Periodic Circular Magnetic Energy-Wave timeline sequence loop (repeats every 6.5s)
  useEffect(() => {
    if (activeModule !== null) return;
    
    const triggerWave = () => {
      setWavePhase("charge");
      
      const expandTimeout = setTimeout(() => {
        setWavePhase("expand");
      }, 1200);

      const impactTimeout = setTimeout(() => {
        setWavePhase("impact");
      }, 2400); // 1.2s charge + 1.2s expand animation duration

      const recoilTimeout = setTimeout(() => {
        setWavePhase("idle");
      }, 2600); // snap back after 200ms impact push

      return { expandTimeout, impactTimeout, recoilTimeout };
    };

    // Run initially
    const timeouts = triggerWave();

    const interval = setInterval(() => {
      timeouts.expandTimeout = setTimeout(() => setWavePhase("expand"), 1200);
      timeouts.impactTimeout = setTimeout(() => setWavePhase("impact"), 2400);
      timeouts.recoilTimeout = setTimeout(() => setWavePhase("idle"), 2600);
      setWavePhase("charge");
    }, 6500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeouts.expandTimeout);
      clearTimeout(timeouts.impactTimeout);
      clearTimeout(timeouts.recoilTimeout);
    };
  }, [activeModule]);

  const handleNextTask = (next: Module1Task) => {
    try {
      setTask(next);
      setMercuryCurrentTask(next);
      if (next === "completed") {
        setActiveModule(null);
        setSelectedModuleId(null);
      } else if (next === "final_challenge") {
        setActiveModule(9);
        setSelectedModuleId(null);
      }
    } catch (err) {
      console.error("Failed to persist task state", err);
    }
  };

  const handleLaunchModule = (modId: number) => {
    try {
      setActiveModule(modId);
      
      // If we are launching the currently active module, keep their current task progress.
      // Otherwise (if they are replaying a completed module), start them at task 1 of that module.
      if (modId === currentActiveModuleId) {
        const currentTask = getMercuryCurrentTask();
        setTask(currentTask);
      } else {
        const taskKey = `task${modId}_1` as Module1Task;
        setTask(taskKey);
        setMercuryCurrentTask(taskKey);
      }
    } catch (err) {
      console.error("Failed to launch module", err);
    }
  };

  const handleReset = () => {
    try {
      resetMercuryProgress();
      setTask("story");
      setActiveModule(null);
      setSelectedModuleId(null);
    } catch (err) {
      console.error("Failed to reset progress", err);
    }
  };

  const handleLaunchRocket = () => {
    setIsLaunching(true);
    setTimeout(() => {
      router.navigate({ to: "/" });
    }, 2800);
  };

  const getCompletedModuleIds = (currentTask: Module1Task): number[] => {
    const ids: number[] = [];
    const idx = MODULE1_TASKS.indexOf(currentTask);
    
    if (idx >= 6) ids.push(1);  // after task1_5 (index 5)
    if (idx >= 11) ids.push(2); // after task2_5 (index 10)
    if (idx >= 16) ids.push(3); // after task3_5 (index 15)
    if (idx >= 21) ids.push(4); // after task4_5 (index 20)
    if (idx >= 26) ids.push(5); // after task5_5 (index 25)
    if (idx >= 31) ids.push(6); // after task6_5 (index 30)
    if (idx >= 36) ids.push(7); // after task7_5 (index 35)
    if (idx >= 41) ids.push(8); // after task8_5 (index 40)
    return ids;
  };

  const completedModuleIds = getVerifiedModules();
  const currentActiveModuleId =
    completedModuleIds.length < 8 ? completedModuleIds.length + 1 : 9; // 9 = final escape room

  const renderBubbleIcon = (type: string, isUnlocked: boolean, color: string) => {
    const strokeColor = isUnlocked ? color : "#475569";
    switch (type) {
      case "horizon":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2">
            <path d="M12 2a10 10 0 0 0-10 10c0 5.523 4.477 10 10 10s10-4.477 10-10A10 10 0 0 0 12 2zm0 18c-4.41 0-8-3.59-8-8 0-1.88.66-3.6 1.76-4.97A7.95 7.95 0 0 1 12 16a7.95 7.95 0 0 1 6.24-10.97C19.34 6.4 20 8.12 20 10c0 4.41-3.59 8-8 8z" />
          </svg>
        );
      case "sunrise":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2">
            <path d="M2 18h20M12 4v4M6.34 6.34l2.83 2.83M17.66 6.34l-2.83 2.83" />
            <path d="M18 18a6 6 0 0 0-12 0" />
          </svg>
        );
      case "solar-rise":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2" />
          </svg>
        );
      case "scorch":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
          </svg>
        );
      case "peak":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2">
            <circle cx="12" cy="12" r="6" />
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83" />
          </svg>
        );
      case "descent":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2">
            <path d="M2 16h20M12 22v-4M6.34 19.66l2.83-2.83M17.66 19.66l-2.83-2.83" />
            <path d="M6 16a6 6 0 0 1 12 0" />
          </svg>
        );
      case "twilight":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2">
            <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8" />
          </svg>
        );
      case "night":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 3v1M12 20v1M3 12h1M20 12h1M19 19l-1-1M5 5L4 4" />
          </svg>
        );
      default:
        return <Star className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <main className="h-screen bg-[#040816] text-white relative flex flex-col justify-between overflow-hidden">
      {/* Background Starfield */}
      <div className="fixed inset-0 z-0 select-none pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,white_0.8px,transparent_0.8px)] bg-size-[24px_24px] opacity-15" />
        <div className="absolute inset-0 bg-linear-to-tr from-cyan-950/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(4,8,22,0.65)_100%)]" />
      </div>

      {/* Top Header */}
      <header className="relative z-20 flex justify-between items-center border-b border-white/10 bg-slate-950/60 p-4 md:px-8 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="group flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition bg-slate-900/60 hover:bg-slate-900/90 px-4 py-2 rounded-full border border-white/10 hover:border-cyan-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] hover:shadow-[0_0_15px_rgba(34,211,238,0.25)] relative overflow-hidden"
          >
            <ChevronLeft className="w-3.5 h-3.5 transform group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-mono tracking-wider font-semibold text-[10px]">EVACUATE TO SOLAR ORBIT</span>
            <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-cyan-500/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
          </Link>
          <div className="hidden sm:block h-4 w-px bg-white/15" />
          
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <h1 className="font-rushblade text-base tracking-tight text-white select-none hover:text-cyan-400 transition-colors duration-300">
                COSMOSX
              </h1>
            </div>
            <p className="text-[9px] text-cyan-400/80 font-mono tracking-wider mt-0.5 select-none hover:text-cyan-400 transition-all">
              cosmosx://planet-1/mercury/blockchain-foundations<span className="text-cyan-600/75">?lat=28.59n&amp;lon=80.68w&amp;freq=1420.4mhz</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="hidden md:flex flex-col items-end text-right font-mono text-[9px] text-muted-foreground select-none">
            <div className="flex items-center gap-1.5 font-bold tracking-wider">
              <span className="text-cyan-400">MERCURY PROGRESS:</span>
              <span className="text-slate-200">{completedModuleIds.length} / 8 MODULES</span>
            </div>
            
            {/* Visual HUD progress bar ticks */}
            <div className="flex items-center gap-1 mt-1.5">
              {Array.from({ length: 8 }).map((_, idx) => {
                const isSegmentDone = idx < completedModuleIds.length;
                const isSegmentActive = idx === completedModuleIds.length;
                return (
                  <div
                    key={idx}
                    className={`w-3.5 h-1.5 rounded-sm border transition-all duration-500 ${
                      isSegmentDone
                        ? "bg-emerald-500 border-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.6)]"
                        : isSegmentActive
                          ? "bg-cyan-500/30 border-cyan-400 animate-pulse shadow-[0_0_4px_rgba(6,182,212,0.3)]"
                          : "bg-slate-950 border-white/10"
                    }`}
                    title={`Module ${idx + 1}: ${isSegmentDone ? "Completed" : isSegmentActive ? "Active" : "Locked"}`}
                  />
                );
              })}
            </div>
          </div>
          
          <div className="hidden sm:block h-6 w-px bg-white/10" />

          <button
            onClick={handleReset}
            className="group flex items-center gap-1 text-[9px] font-mono text-rose-400 hover:text-rose-300 transition bg-rose-500/5 hover:bg-rose-500/10 px-3 py-2 rounded-md border border-rose-500/20 hover:border-rose-500/50 relative overflow-hidden shadow-[inset_0_1px_1px_rgba(239,68,68,0.02)]"
          >
            <RotateCcw className="w-3 h-3 group-hover:rotate-[-60deg] transition-transform duration-300" />
            <span className="font-semibold tracking-wider">RESET SECTOR</span>
            <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-rose-500/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
          </button>
        </div>
      </header>
      {/* Main Grid Content */}
      <div className="flex-1 px-4 lg:px-8 py-3 w-full relative z-10 flex flex-col justify-center min-h-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeModule === null ? (
            /* 1. COMPLETED CIRCULAR MAGNETIC ORBIT EXPEDITION MAP */
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative flex-1 min-h-0 overflow-hidden"
            >
              {/* Module selection circular map (Col-span 9) */}
              <div className="lg:col-span-9 relative h-full flex items-center justify-center min-h-0">
                
                {/* 3D ROTATING MERCURY PLANET (Positioned exactly in the center of the left workspace area) */}
                <div
                  style={{ width: baseRadius * 1.5, height: baseRadius * 1.5 }}
                  className="absolute top-1/2 left-1/2 pointer-events-none z-0 transform -translate-x-1/2 -translate-y-1/2"
                >
                  <Canvas camera={{ position: [0, 0, 5.8] }}>
                    <ambientLight intensity={0.25} />
                    <pointLight position={[10, 10, 10]} intensity={3.5} />
                    <Suspense fallback={null}>
                      <RotatingMercury />
                    </Suspense>
                  </Canvas>
                  <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,transparent_60%,rgba(4,8,22,0.85)_98%)]" />
                  
                  {/* Concentric buildup glow shield around planet boundary */}
                  <div
                    className={`absolute inset-0 rounded-full border transition-all duration-1000 ${
                      wavePhase === "charge"
                        ? "border-cyan-400/40 shadow-[0_0_50px_rgba(34,211,238,0.55),inset_0_0_40px_rgba(34,211,238,0.35)] scale-[1.03]"
                        : "border-cyan-500/5 shadow-[inset_0_0_30px_rgba(6,182,212,0.1)] scale-100"
                    }`}
                  />
                </div>

                {/* Expanding magnetic energy wave ring */}
                <AnimatePresence>
                  {wavePhase === "expand" && (
                    <motion.div
                      className="absolute top-1/2 left-1/2 rounded-full border-2 border-cyan-400/50 pointer-events-none z-0"
                      initial={{ width: 0, height: 0, opacity: 0.8, x: "-50%", y: "-50%", boxShadow: "0 0 10px rgba(34, 211, 238, 0.4)" }}
                      animate={{
                        width: baseRadius * 2,
                        height: baseRadius * 2,
                        opacity: [0.8, 0.9, 0.3, 0],
                        boxShadow: [
                          "0 0 10px rgba(34, 211, 238, 0.4)",
                          "0 0 25px rgba(34, 211, 238, 0.6)",
                          "0 0 10px rgba(34, 211, 238, 0.2)",
                          "0 0 0px rgba(34, 211, 238, 0)"
                        ]
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                  )}
                </AnimatePresence>

                {/* SVG Perfect Circular Orbit Path Line - centered exactly relative to dynamic baseRadius with flash on impact */}
                <svg
                  style={{ width: baseRadius * 2 + 20, height: baseRadius * 2 + 20 }}
                  className="absolute top-1/2 left-1/2 pointer-events-none z-0 transform -translate-x-1/2 -translate-y-1/2"
                  viewBox={`0 0 ${baseRadius * 2 + 20} ${baseRadius * 2 + 20}`}
                >
                  <circle
                    cx={baseRadius + 10}
                    cy={baseRadius + 10}
                    r={baseRadius}
                    fill="none"
                    stroke={wavePhase === "impact" ? "rgba(34, 211, 238, 0.75)" : "rgba(34, 211, 238, 0.15)"}
                    strokeWidth={wavePhase === "impact" ? 1.8 : 1.2}
                    strokeDasharray="3 5"
                    className="transition-all duration-150"
                  />
                  <circle
                    cx={baseRadius + 10}
                    cy={baseRadius + 10}
                    r={baseRadius + 5}
                    fill="none"
                    stroke={wavePhase === "impact" ? "rgba(34, 211, 238, 0.25)" : "rgba(34, 211, 238, 0.03)"}
                    strokeWidth="2"
                    className="transition-all duration-150"
                  />
                </svg>

                {/* Left Area Dashboard text headers */}
                <div className="absolute top-0 left-0 z-10 select-none">
                  <h2 className="font-rushblade text-sm lg:text-base text-white tracking-wider">ORBITAL SECTOR DEPLOYMENT</h2>
                  <p className="text-[9px] lg:text-[10px] font-mono text-muted-foreground uppercase mt-0.5">Explore curriculum paths orbiting Mercury</p>
                </div>
                
                <div className="absolute top-0 right-0 z-10 select-none">
                  <div className="flex items-center gap-1.5 text-[9px] text-cyan-400 font-mono bg-cyan-950/40 px-2.5 py-1 rounded-full border border-cyan-500/20">
                    <span>MAGNETIC WAVE: ACTIVE</span>
                  </div>
                </div>

                {task === "final_challenge" && (
                  <div className="absolute top-1/2 left-1/2 z-30 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center select-none">
                    <button
                      onClick={() => {
                        setActiveModule(9);
                      }}
                      className="bg-red-600 hover:bg-red-500 text-white border border-red-500/30 px-6 py-3 rounded-full text-xs font-mono font-bold tracking-widest uppercase transition-all shadow-[0_0_30px_rgba(239,68,68,0.45)] hover:scale-105 active:scale-95 animate-pulse cursor-pointer pointer-events-auto"
                    >
                      🚨 ENTER RESCUE MISSION ➔
                    </button>
                  </div>
                )}

                {/* Glassy bubbles rendered dynamically in circular orbit */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                  {MERCURY_EXPEDITION_MODULES.map((mod) => {
                    const isCompleted = completedModuleIds.includes(mod.id);
                    const isActive = mod.id === currentActiveModuleId;
                    const isUnlocked = mod.id === 1 || isCompleted || isActive;
                    const isSelected = selectedModuleId === mod.id;

                    // Trig: module position on orbit ring
                    const rad = (mod.angle * Math.PI) / 180;

                    // Wave impulse: all modules spring outward at impact phase
                    const animatedRadius = wavePhase === "impact" ? baseRadius + 26 : baseRadius;

                    const x = Math.cos(rad) * animatedRadius;
                    const y = Math.sin(rad) * animatedRadius;

                    // Task arc constants — compact satellite crown around module icon
                    // Tasks are CHILDREN of the module wrapper, so they inherit
                    // the parent's wave displacement automatically (no extra animation needed).
                    const TASK_ARC_RADIUS = 48; // px from module icon center
                    const TASK_ANGLE_STEP = 30; // degrees between tasks → ±60° total spread

                    return (
                      <div key={mod.id}>
                        {/* Module container — orbital position + wave displacement via spring animate */}
                        <motion.div
                          className="absolute top-1/2 left-1/2 pointer-events-auto"
                          animate={{ x, y }}
                          transition={{ type: "spring", stiffness: 140, damping: 9 }}
                          style={{
                            translateX: "-50%",
                            translateY: "-50%",
                            width: "48px",
                            height: "48px",
                            overflow: "visible",
                          }}
                        >
                          <div className="relative w-full h-full flex items-center justify-center">
                            {/* Concentric signal ring for active module */}
                            {isActive && (
                              <div className="concentric-ring" style={{ color: mod.color }} />
                            )}

                            {/* Glass bubble module button */}
                            <button
                              onClick={() => {
                                if (!isUnlocked) return;
                                setSelectedModuleId(isSelected ? null : mod.id);
                              }}
                              style={{
                                borderColor: isUnlocked ? `${mod.color}60` : `${mod.color}30`,
                                color: isUnlocked ? mod.color : `${mod.color}80`,
                                background: isUnlocked
                                  ? `radial-gradient(circle at 35% 35%, ${mod.color}55 0%, ${mod.color}20 40%, rgba(4,8,22,0.95) 90%)`
                                  : `radial-gradient(circle at 35% 35%, ${mod.color}16 0%, ${mod.color}06 40%, rgba(4,8,22,0.98) 100%)`,
                                boxShadow: isUnlocked
                                  ? `0 0 20px ${mod.color}25, inset 0 0 15px ${mod.color}10, 0 10px 25px rgba(0,0,0,0.5)`
                                  : `0 0 8px ${mod.color}12`,
                                opacity: isUnlocked ? 1 : 0.72,
                              }}
                              className={`w-12 h-12 rounded-full flex items-center justify-center relative border transition-all duration-300 ${
                                isUnlocked
                                  ? isCompleted
                                    ? "glass-bubble glass-bubble-hover"
                                    : "glass-bubble glass-bubble-hover vacuum-aberration"
                                  : "cursor-not-allowed backdrop-blur-md"
                              }`}
                            >
                              <div className="absolute top-1 left-2 w-4 h-2 bg-white/20 rounded-full rotate-[-15deg] pointer-events-none" />
                              {isUnlocked ? (
                                renderBubbleIcon(mod.iconName, true, mod.color)
                              ) : (
                                <div className="relative flex items-center justify-center w-full h-full">
                                  <div className="opacity-70">
                                    {renderBubbleIcon(mod.iconName, true, mod.color)}
                                  </div>
                                  <Lock
                                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 drop-shadow"
                                    style={{ color: mod.color }}
                                  />
                                </div>
                              )}
                            </button>

                            {/* Outer-facing text labels — direction-aware */}
                            <motion.div
                              {...getLabelStyles(mod.angle, isSelected)}
                              className={`${getLabelStyles(mod.angle, isSelected).className} select-none pointer-events-none z-10`}
                              transition={{ type: "spring", stiffness: 140, damping: 9 }}
                            >
                              <span
                                className="block font-mono text-[8px] font-bold uppercase tracking-wider"
                                style={{ color: isUnlocked ? mod.color : `${mod.color}70` }}
                              >
                                {mod.title}
                              </span>
                              <span className={`block text-[9.5px] font-bold mt-0.5 truncate w-full ${
                                isUnlocked ? "text-slate-200" : "text-slate-500 font-normal"
                              }`}>
                                {mod.topic}
                              </span>
                              <span className="block text-[8px] text-muted-foreground font-mono mt-0.5 opacity-60">
                                {mod.stageName}
                              </span>
                            </motion.div>

                            {/* ── Task Satellite Crown ──────────────────────────────────────
                                Children of the module wrapper → inherit wave displacement.
                                Positioned with CSS left/top (not framer x/y) so their
                                base position is permanently static after entrance ends.
                                Arc faces outward from Mercury: center = mod.angle direction. */}
                            <AnimatePresence>
                              {isSelected && Array.from({ length: 5 }).map((_, taskIdx) => {
                                const taskNum = taskIdx + 1;

                                // Fan ±(TASK_ANGLE_STEP * 2)° around outward direction
                                const taskAngle = mod.angle + (taskIdx - 2) * TASK_ANGLE_STEP;
                                const taskRad = (taskAngle * Math.PI) / 180;

                                // Position relative to module wrapper top-left corner.
                                // Module icon center = (24, 24) inside the 48×48 wrapper.
                                const tlx = 24 + TASK_ARC_RADIUS * Math.cos(taskRad);
                                const tly = 24 + TASK_ARC_RADIUS * Math.sin(taskRad);

                                const getIsTaskCompleted = (mId: number, tNum: number): boolean => {
                                  const currentIdx = MODULE1_TASKS.indexOf(task);
                                  if (currentIdx === -1) return false;
                                  if (task === "completed") return true;
                                  if (task === "final_challenge") return true;
                                  const targetTaskKey = `task${mId}_${tNum}`;
                                  const targetIdx = MODULE1_TASKS.indexOf(targetTaskKey as Module1Task);
                                  return currentIdx > targetIdx;
                                };
                                const isTaskCompleted = getIsTaskCompleted(mod.id, taskNum);
                                const isTaskUnlocked = mod.id <= currentActiveModuleId;

                                return (
                                  <motion.button
                                    key={taskIdx}
                                    className="task-satellite absolute w-6 h-6 z-30 pointer-events-auto text-[9px] font-mono font-bold"
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.5, opacity: 0 }}
                                    whileHover={isTaskUnlocked ? { scale: 1.15 } : undefined}
                                    whileTap={isTaskUnlocked ? { scale: 0.92 } : undefined}
                                    transition={{
                                      type: "spring",
                                      stiffness: 260,
                                      damping: 18,
                                      delay: taskIdx * 0.04,
                                    }}
                                    style={{
                                      left: tlx,
                                      top: tly,
                                      translateX: "-50%",
                                      translateY: "-50%",
                                      borderColor: isTaskUnlocked ? `${mod.color}70` : `${mod.color}25`,
                                      color: isTaskUnlocked
                                        ? isTaskCompleted ? "#10b981" : mod.color
                                        : `${mod.color}35`,
                                      boxShadow: isTaskUnlocked
                                        ? `0 0 10px ${mod.color}35, 0 0 4px ${mod.color}20`
                                        : "none",
                                      background: isTaskUnlocked
                                        ? `radial-gradient(circle at 40% 40%, ${mod.color}25 0%, rgba(4,8,22,0.92) 100%)`
                                        : "rgba(4,8,22,0.85)",
                                    }}
                                    onClick={() => {
                                      if (!isTaskUnlocked) return;
                                      setActiveModule(mod.id);
                                      const taskKey = `task${mod.id}_${taskNum}` as Module1Task;
                                      handleNextTask(taskKey);
                                    }}
                                  >
                                    {isTaskCompleted ? "✓" : `0${taskNum}`}
                                  </motion.button>
                                );
                              })}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      </div>
                    );
                  })}
                </div>



                {/* Command text footer inside left sector */}
                <div className="absolute bottom-0 left-0 w-full text-[10px] text-muted-foreground font-mono flex justify-between items-center z-10 select-none">
                  <span>EXPEDITION MONITOR: Audit nodes to configure launch platform systems.</span>
                  <span>COSMOSX SIGNAL NODE v1.02</span>
                </div>
              </div>

              {/* WWII V-2 Rocket Card (Col-span 3) */}
              <div className="lg:col-span-3 h-full min-h-0 overflow-hidden pr-1">
                <RocketAssembly completedModules={completedModuleIds} />
              </div>
            </motion.div>
          ) : (
            /* 2. ACTIVE OPERATION SCREEN WORKSPACE */
            <motion.div
              key="workspace"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col relative flex-1 min-h-0 overflow-hidden gap-4"
            >
              <div className="w-full space-y-0 h-full flex flex-col min-h-0">
                <div className="flex justify-between items-center border-b border-white/10 bg-slate-950/60 p-3 rounded-xl backdrop-blur-md shrink-0">
                  <button
                    onClick={() => {
                      setActiveModule(null);
                      setSelectedModuleId(null);
                    }}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Expedition Path
                  </button>
                  <span className="font-mono text-[9px] text-cyan-400 font-bold uppercase tracking-widest">
                    ACTIVE TELEMETRY COMMS SANDBOX
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  {task === "story" && (
                    <motion.div
                      key="story"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-950/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-2xl space-y-5"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 shrink-0">
                          <Compass className="w-6 h-6 animate-spin" style={{ animationDuration: "10s" }} />
                        </div>
                        <div>
                          <h3 className="font-rushblade text-white text-sm tracking-wider">
                            MODULE 01 — WHY DOES BLOCKCHAIN EXIST?
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Concept: The Problem of Trust · Rocket Component: Launch Platform
                          </p>
                        </div>
                      </div>

                      <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
                        <p>
                          Welcome to Mercury — the closest planet to the Sun and the first stop on your journey through the cosmos.
                          Before you can build a rocket to leave this scorched world, you need to understand the fundamental problem
                          that gave birth to blockchain: <span className="text-cyan-400 font-semibold">the problem of trust.</span>
                        </p>
                        <p>
                          Mercury's central command center has been corrupted. Its single database — the backbone of all fuel supply
                          routing — has been tampered with. Your mission is to understand what went wrong, and discover why a
                          distributed system would have prevented it.
                        </p>
                        <p className="text-slate-400">
                          By the end of this module you'll be able to answer one critical question:
                          <span className="text-white font-semibold"> "Why can't we simply use MySQL/PostgreSQL for everything?"</span>
                        </p>
                      </div>

                      <div className="bg-slate-900/60 border border-white/5 rounded-xl p-3">
                        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">5 Tasks · Estimated 25–30 min</p>
                        <div className="grid grid-cols-5 gap-1.5">
                          {["Map the Middlemen", "Corrupted Command", "Trade Dilemma", "Compare Systems", "Choose Technology"].map((t, i) => (
                            <div key={i} className="bg-slate-950/60 border border-white/5 rounded-lg p-2 text-center">
                              <div className="text-[11px] font-mono text-cyan-400 font-bold">1.{i + 1}</div>
                              <div className="text-[9px] font-mono text-slate-500 mt-0.5 leading-tight">{t}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2 text-[10px] text-amber-400 font-mono">
                        <Info className="w-4 h-4 shrink-0" />
                        <span>
                          MISSION OBJECTIVE: Complete all 5 tasks to assemble the Launch Platform — the first component of your escape rocket.
                        </span>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => handleNextTask("task1_1")}
                          className="bg-linear-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold px-5 py-2.5 rounded-full text-xs font-rushblade shadow-lg hover:shadow-cyan-500/15 transition"
                        >
                          Begin Task 1.1 ➔
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {task === "task1_1" && (
                    <motion.div key="task1_1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <Task1_1_MiddlemanMapper onComplete={() => handleNextTask("task1_2")} />
                    </motion.div>
                  )}

                  {task === "task1_2" && (
                    <motion.div key="task1_2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <Task1_2_CorruptedServer onComplete={() => handleNextTask("task1_3")} />
                    </motion.div>
                  )}

                  {task === "task1_3" && (
                    <motion.div key="task1_3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <Task1_3_TradeDilemma onComplete={() => handleNextTask("task1_4")} />
                    </motion.div>
                  )}

                  {task === "task1_4" && (
                    <motion.div key="task1_4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <Task1_4_ComparisonEngine onComplete={() => handleNextTask("task1_5")} />
                    </motion.div>
                  )}

                  {task === "task1_5" && (
                    <motion.div key="task1_5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <Task1_5_CardSorter onComplete={() => handleNextTask("task1_verify")} />
                    </motion.div>
                  )}

                  {/* Module Verify gates — one for each module */}
                  {([1,2,3,4,5,6,7,8] as const).map((modId) => {
                    const verifyKey = `task${modId}_verify` as Module1Task;
                    const nextStart = modId < 8 ? `task${modId + 1}_1` as Module1Task : "final_challenge";
                    const MODULE_TITLES: Record<number, string> = {
                      1: "Why Does Blockchain Exist?",
                      2: "Transactions & Digital Ledgers",
                      3: "Blocks & Data Structures",
                      4: "Mining & Proof of Work",
                      5: "Nodes & Peer-to-Peer Networks",
                      6: "Consensus Mechanisms",
                      7: "Smart Contracts",
                      8: "DeFi & Real-World Applications",
                    };
                    return task === verifyKey ? (
                      <motion.div key={verifyKey} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col">
                        <ModuleVerificationScreen
                          moduleId={modId}
                          moduleTitle={MODULE_TITLES[modId]}
                          onVerified={() => handleNextTask(nextStart)}
                          onRetry={() => {
                            // Go back to first task of this module
                            handleNextTask(`task${modId}_1` as Module1Task);
                          }}
                        />
                      </motion.div>
                    ) : null;
                  })}

                  {activeTaskInfo && !task.endsWith("_verify") && (
                    <motion.div key={task} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col justify-between">
                      <GenericSandboxRunner
                        taskDef={activeTaskInfo.taskDef}
                        moduleColor={activeTaskInfo.color}
                        onComplete={() => {
                          const currentIdx = MODULE1_TASKS.indexOf(task);
                          const nextTask = MODULE1_TASKS[currentIdx + 1] || "completed";
                          handleNextTask(nextTask);
                        }}
                      />
                    </motion.div>
                  )}

                  {task === "final_challenge" && (
                    <motion.div key="final_challenge" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col justify-between">
                      <FinalEscapeRoom onComplete={handleLaunchRocket} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Interactive Launch Overlay */}
      {isLaunching && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 overflow-hidden">
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: [-2, 2, -1, 1, -2, 2, 0] }}
            transition={{ repeat: Infinity, duration: 0.1 }}
            className="flex flex-col items-center gap-6"
          >
            <Rocket className="w-16 h-16 text-cyan-400 -rotate-45 animate-[bounce_0.2s_infinite]" />
            <h1 className="font-rushblade text-lg font-bold tracking-widest text-white uppercase animate-pulse flex items-center gap-2">
              IGNITING V-2 PROPELLANT CHAMBER...
            </h1>
            <p className="font-mono text-[9px] text-muted-foreground animate-pulse">
              LEAVING MERCURY SECTOR // TRANSITING TO VENUS ORBITAL GRID
            </p>
          </motion.div>
          
          <div className="absolute bottom-0 w-full h-[50vh] bg-linear-to-t from-orange-500/10 via-transparent to-transparent pointer-events-none" />
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-950/60 py-2.5 text-center">
        <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">
          COSMOSX CLASSIFIED OPERATIONS UNIT · PLANET 01 (MERCURY)
        </p>
      </footer>
    </main>
  );
}

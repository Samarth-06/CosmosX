import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, RefreshCw, CheckCircle, XCircle, AlertTriangle,
  Wifi, WifiOff, Radio, Activity, ChevronRight
} from "lucide-react";

interface Props { color: string; }

type StationId = "alpha" | "beta" | "gamma" | "delta" | "epsilon";
type NodeStatus = "undeployed" | "deploying" | "online" | "offline" | "syncing";

type MissionStage =
  | "intro"
  | "diagnose"
  | "deploy"
  | "connecting"
  | "gossip"
  | "quorum_check"
  | "storm_ready"
  | "storm_1"
  | "storm_2"
  | "preview_fail"
  | "recovery"
  | "complete";

interface Station {
  id: StationId;
  label: string;
  x: number; // % relative to SVG viewBox
  y: number;
}

const STATIONS: Station[] = [
  { id: "alpha",   label: "ALPHA",   x: 22,  y: 20  },
  { id: "beta",    label: "BETA",    x: 78,  y: 20  },
  { id: "gamma",   label: "GAMMA",   x: 12,  y: 68  },
  { id: "delta",   label: "DELTA",   x: 78,  y: 68  },
  { id: "epsilon", label: "EPSILON", x: 50,  y: 82  },
];

// P2P mesh connections between stations
const PEER_LINKS: [StationId, StationId][] = [
  ["alpha",   "beta"],
  ["alpha",   "gamma"],
  ["alpha",   "epsilon"],
  ["beta",    "delta"],
  ["beta",    "epsilon"],
  ["gamma",   "epsilon"],
  ["delta",   "epsilon"],
  ["gamma",   "delta"],
];

const OBJECTIVES: { key: string; label: string }[] = [
  { key: "diagnose",   label: "Confirm central server failure" },
  { key: "deploy_all", label: "Deploy all 5 backup nodes" },
  { key: "connect",    label: "Establish P2P connections" },
  { key: "gossip",     label: "Verify gossip propagation" },
  { key: "quorum",     label: "Reach 3-node minimum quorum" },
  { key: "storm",      label: "Survive station outage test" },
  { key: "restore",    label: "Restore Mercury communications" },
];

const STATUS_COLORS: Record<NodeStatus, { ring: string; fill: string; text: string }> = {
  undeployed: { ring: "#334155", fill: "rgba(15,23,42,0.8)",  text: "#475569" },
  deploying:  { ring: "#06b6d4", fill: "rgba(8,51,68,0.85)",  text: "#67e8f9" },
  syncing:    { ring: "#818cf8", fill: "rgba(30,27,75,0.85)", text: "#a5b4fc" },
  online:     { ring: "#22c55e", fill: "rgba(20,83,45,0.85)", text: "#4ade80" },
  offline:    { ring: "#475569", fill: "rgba(30,41,59,0.70)", text: "#64748b" },
};

const STATUS_ICON: Record<NodeStatus, string> = {
  undeployed: "◌", deploying: "⚙", syncing: "↻", online: "✓", offline: "✕",
};

export default function MercuryNetworkRecovery({ color }: Props) {
  const [stage, setStage] = useState<MissionStage>("intro");
  const [nodeStatus, setNodeStatus] = useState<Record<StationId, NodeStatus>>({
    alpha: "undeployed", beta: "undeployed", gamma: "undeployed",
    delta: "undeployed", epsilon: "undeployed",
  });
  const [completedObjectives, setCompletedObjectives] = useState<Set<string>>(new Set());
  const [deployingQueue, setDeployingQueue] = useState<StationId[]>([]);
  const [activeLinks, setActiveLinks] = useState<[StationId, StationId][]>([]);
  const [gossipWave, setGossipWave] = useState<StationId[]>([]);
  const [manualOffline, setManualOffline] = useState<Set<StationId>>(new Set());
  const [showPreviewFail, setShowPreviewFail] = useState(false);
  const [log, setLog] = useState<string[]>(["COSMOSX MERCURY MISSION TERMINAL READY"]);
  const [hintIdx, setHintIdx] = useState(0);
  const [introPhase, setIntroPhase] = useState(0);

  const logRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const addLog = (msg: string) => setLog(prev => [...prev.slice(-12), msg]);

  const completeObjective = (key: string) =>
    setCompletedObjectives(prev => new Set([...prev, key]));

  // Intro sequence
  useEffect(() => {
    if (stage !== "intro") return;
    const phases = [
      () => { setIntroPhase(1); addLog("SCANNING PLANETARY NETWORK..."); },
      () => { setIntroPhase(2); addLog("⚠ CENTRAL SERVER — CONNECTION UNSTABLE"); },
      () => { setIntroPhase(3); addLog("☀ SOLAR STORM INTERFERENCE DETECTED"); },
      () => { setIntroPhase(4); addLog("✕ CRITICAL — CENTRAL SERVER OFFLINE"); },
      () => { setIntroPhase(5); addLog("EMERGENCY PROTOCOL ACTIVATED — DEPLOY BACKUP NODES"); },
    ];
    let idx = 0;
    const run = () => {
      if (idx < phases.length) {
        phases[idx]();
        idx++;
        timerRef.current = setTimeout(run, 1400);
      }
    };
    timerRef.current = setTimeout(run, 600);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [stage]);

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const onlineCount = Object.values(nodeStatus).filter(s => s === "online").length;
  const offlineCount = Object.values(nodeStatus).filter(s => s === "offline").length;
  const deployedCount = Object.values(nodeStatus).filter(s => s !== "undeployed").length;
  const quorumOk = onlineCount >= 3;
  const allDeployed = deployedCount === 5;

  // Deploy a single station
  const deployStation = async (id: StationId) => {
    if (nodeStatus[id] !== "undeployed") return;
    addLog(`DEPLOYING NODE ${id.toUpperCase()}...`);
    setNodeStatus(prev => ({ ...prev, [id]: "deploying" }));

    await new Promise(r => setTimeout(r, 900));
    setNodeStatus(prev => ({ ...prev, [id]: "syncing" }));
    addLog(`NODE ${id.toUpperCase()} — SYNCING BLOCKCHAIN...`);

    await new Promise(r => setTimeout(r, 700));
    setNodeStatus(prev => ({ ...prev, [id]: "online" }));
    addLog(`✓ NODE ${id.toUpperCase()} ONLINE`);
  };

  const deployAll = async () => {
    for (const s of STATIONS) {
      if (nodeStatus[s.id] === "undeployed") {
        await deployStation(s.id);
        await new Promise(r => setTimeout(r, 200));
      }
    }
    completeObjective("deploy_all");
    addLog("✓ ALL 5 NODES DEPLOYED — READY TO CONNECT");
    setStage("deploy");
  };

  const establishNetwork = async () => {
    setStage("connecting");
    addLog("ESTABLISHING P2P MESH NETWORK...");
    const links: [StationId, StationId][] = [];
    for (const link of PEER_LINKS) {
      links.push(link);
      setActiveLinks([...links]);
      await new Promise(r => setTimeout(r, 220));
    }
    completeObjective("connect");
    addLog("✓ P2P NETWORK ESTABLISHED — 8 PEER CONNECTIONS");
    await new Promise(r => setTimeout(r, 400));
    setStage("gossip");
    runGossipTest();
  };

  const runGossipTest = async () => {
    const order: StationId[] = ["alpha", "beta", "gamma", "delta", "epsilon"];
    addLog("GOSSIP TEST: MSG-001 FROM NODE ALPHA...");
    for (const s of order) {
      setGossipWave(prev => [...prev, s]);
      addLog(`NODE ${s.toUpperCase()} — RECEIVED & RELAYED MSG-001`);
      await new Promise(r => setTimeout(r, 420));
    }
    completeObjective("gossip");
    addLog("✓ GOSSIP PROPAGATION COMPLETE — 5/5 NODES REACHED");
    await new Promise(r => setTimeout(r, 500));
    setStage("quorum_check");
    await new Promise(r => setTimeout(r, 800));
    completeObjective("quorum");
    addLog("✓ QUORUM CHECK: 5 ≥ 3 — CONSENSUS AVAILABLE");
    await new Promise(r => setTimeout(r, 600));
    setStage("storm_ready");
  };

  const runStormTest = async () => {
    setStage("storm_1");
    addLog("☀ SOLAR STORM SIMULATION — INTENSITY 1");
    await new Promise(r => setTimeout(r, 800));
    addLog("⚠ NODE BETA — SIGNAL LOST");
    setNodeStatus(prev => ({ ...prev, beta: "offline" }));
    await new Promise(r => setTimeout(r, 600));
    addLog("✓ REROUTING: ALPHA → EPSILON → DELTA (BETA BYPASSED)");
    await new Promise(r => setTimeout(r, 600));
    addLog("✓ 4 ≥ 3 — CONSENSUS MAINTAINED");
    await new Promise(r => setTimeout(r, 800));
    setStage("storm_2");
    addLog("☀ SOLAR STORM — INTENSITY 2");
    await new Promise(r => setTimeout(r, 800));
    addLog("⚠ NODE DELTA — SIGNAL LOST");
    setNodeStatus(prev => ({ ...prev, delta: "offline" }));
    await new Promise(r => setTimeout(r, 600));
    addLog("✓ 3 = 3 — MINIMUM QUORUM MAINTAINED");
    await new Promise(r => setTimeout(r, 600));
    completeObjective("storm");
    addLog("✓ SOLAR STORM TEST PASSED");
    await new Promise(r => setTimeout(r, 800));
    setShowPreviewFail(true);
    addLog("PREVIEW: IF ONE MORE NODE FAILED → 2 < 3 → QUORUM LOST");
    await new Promise(r => setTimeout(r, 1800));
    setShowPreviewFail(false);
    setStage("recovery");
  };

  const restoreNetwork = async () => {
    addLog("RESTORING NODE BETA...");
    setNodeStatus(prev => ({ ...prev, beta: "syncing" }));
    await new Promise(r => setTimeout(r, 700));
    setNodeStatus(prev => ({ ...prev, beta: "online" }));
    addLog("✓ NODE BETA ONLINE");
    await new Promise(r => setTimeout(r, 400));
    addLog("RESTORING NODE DELTA...");
    setNodeStatus(prev => ({ ...prev, delta: "syncing" }));
    await new Promise(r => setTimeout(r, 600));
    setNodeStatus(prev => ({ ...prev, delta: "online" }));
    addLog("✓ NODE DELTA ONLINE");
    await new Promise(r => setTimeout(r, 400));
    addLog("☿ MERCURY NETWORK — FULLY OPERATIONAL");
    completeObjective("restore");
    setStage("complete");
  };

  const toggleManualOffline = (id: StationId) => {
    if (stage !== "storm_ready") return;
    const next = new Set(manualOffline);
    if (next.has(id)) {
      next.delete(id);
      setNodeStatus(prev => ({ ...prev, [id]: "online" }));
      addLog(`NODE ${id.toUpperCase()} RESTORED`);
    } else {
      if (next.size >= 2) {
        addLog("⚠ WARNING: DISABLING WOULD BREAK QUORUM MINIMUM");
        return;
      }
      next.add(id);
      setNodeStatus(prev => ({ ...prev, [id]: "offline" }));
      addLog(`⚠ NODE ${id.toUpperCase()} OFFLINE — ${5 - next.size}/5 ONLINE`);
    }
    setManualOffline(next);
  };

  const reset = () => {
    setStage("intro");
    setNodeStatus({ alpha: "undeployed", beta: "undeployed", gamma: "undeployed", delta: "undeployed", epsilon: "undeployed" });
    setCompletedObjectives(new Set());
    setActiveLinks([]);
    setGossipWave([]);
    setManualOffline(new Set());
    setShowPreviewFail(false);
    setLog(["COSMOSX MERCURY MISSION TERMINAL READY"]);
    setIntroPhase(0);
    setHintIdx(0);
  };

  const HINTS = [
    "THE CENTRAL SERVER IS DOWN. DEPLOY A BACKUP NODE AT EACH STATION.",
    "NODES MUST CONNECT TO PEERS BEFORE EXCHANGING NETWORK INFORMATION.",
    "MULTIPLE PEER CONNECTIONS ENSURE NO SINGLE FAILURE CAN ISOLATE THE NETWORK.",
    "MERCURY'S MISSION REQUIRES AT LEAST 3 OF 5 NODES TO REMAIN ONLINE.",
    "WITH EXACTLY 3 NODES ONLINE, THE NETWORK IS AT ITS MINIMUM REQUIRED QUORUM.",
  ];

  // SVG viewBox = 0 0 100 100
  const SVG_VB = "0 0 100 100";

  const getLinkActive = (a: StationId, b: StationId) => {
    const inActive = activeLinks.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
    if (!inActive) return false;
    const aOffline = nodeStatus[a] === "offline";
    const bOffline = nodeStatus[b] === "offline";
    return !aOffline && !bOffline;
  };

  const getLinkColor = (a: StationId, b: StationId) => {
    if (!getLinkActive(a, b)) return "#1e293b";
    const aGossip = gossipWave.includes(a);
    const bGossip = gossipWave.includes(b);
    if (aGossip && bGossip) return "#818cf8";
    return `${color}66`;
  };

  const introMessages: Record<number, { title: string; sub: string; color: string }> = {
    1: { title: "SCANNING PLANETARY NETWORK...", sub: "Initializing diagnostic sweep", color: "#67e8f9" },
    2: { title: "⚠ CENTRAL SERVER — UNSTABLE", sub: "Solar interference detected on main link", color: "#fbbf24" },
    3: { title: "☀ SOLAR STORM — CRITICAL", sub: "Electromagnetic interference at maximum", color: "#f97316" },
    4: { title: "✕ CENTRAL SERVER OFFLINE", sub: "All station communications lost", color: "#f87171" },
    5: { title: "EMERGENCY PROTOCOL ACTIVATED", sub: "Deploy backup blockchain nodes immediately", color: color },
  };

  const currentIntroMsg = introMessages[introPhase];

  const stageTitle: Record<MissionStage, string> = {
    intro: "INITIALIZING MISSION",
    diagnose: "DIAGNOSE CENTRAL FAILURE",
    deploy: "DEPLOY BACKUP NODES",
    connecting: "ESTABLISHING P2P NETWORK",
    gossip: "GOSSIP SYNC TEST",
    quorum_check: "QUORUM VERIFICATION",
    storm_ready: "SOLAR STORM TEST",
    storm_1: "STORM — LEVEL 1",
    storm_2: "STORM — LEVEL 2",
    preview_fail: "PREVIEW: THRESHOLD",
    recovery: "NETWORK RECOVERY",
    complete: "MISSION COMPLETE",
  };

  return (
    <div
      className="rounded-2xl border flex flex-col gap-2.5 p-3.5 h-full relative overflow-hidden"
      style={{ borderColor: `${color}30`, background: "linear-gradient(150deg,rgba(2,6,23,0.99),rgba(3,7,18,0.97))" }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <div className="text-[10px] font-mono font-bold tracking-widest uppercase" style={{ color }}>
            MERCURY NETWORK RECOVERY COMMAND
          </div>
          <div className="text-[7.5px] font-mono text-slate-500 tracking-widest uppercase">
            {stageTitle[stage]} — CHAPTER 6 CHALLENGE
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="text-[8px] font-mono font-bold px-2.5 py-1 rounded border uppercase"
            style={{
              borderColor: quorumOk && stage !== "intro" && stage !== "diagnose" ? "#14532d" : "#7f1d1d",
              backgroundColor: quorumOk && stage !== "intro" && stage !== "diagnose" ? "rgba(20,83,45,0.2)" : "rgba(127,29,29,0.2)",
              color: quorumOk && stage !== "intro" && stage !== "diagnose" ? "#4ade80" : "#f87171",
            }}>
            {stage === "complete" ? "☿ SAVED" : quorumOk && stage !== "intro" && stage !== "diagnose" ? "✓ NETWORK OK" : "✕ OFFLINE"}
          </div>
          <button onClick={reset}
            className="text-[7px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1 border border-white/10 px-1.5 py-0.5 rounded cursor-pointer">
            <RefreshCw size={8} /> RESET
          </button>
        </div>
      </div>

      {/* ── Main body: network map + side panels ────────────────────────── */}
      <div className="flex gap-3 flex-1 min-h-0">

        {/* NETWORK MAP */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">

          {/* Intro overlay */}
          <AnimatePresence>
            {stage === "intro" && introPhase > 0 && (
              <motion.div key="intro-msg"
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="rounded-xl border p-2.5 text-center"
                style={{ borderColor: currentIntroMsg?.color + "40", background: currentIntroMsg?.color + "10" }}>
                <div className="text-[10px] font-mono font-bold" style={{ color: currentIntroMsg?.color }}>
                  {currentIntroMsg?.title}
                </div>
                <div className="text-[7.5px] font-mono text-slate-500 mt-0.5">{currentIntroMsg?.sub}</div>
                {introPhase === 5 && (
                  <button
                    onClick={() => { setStage("diagnose"); addLog("DIAGNOSTIC MODE ENGAGED"); }}
                    className="mt-2 text-[8px] font-mono font-bold border rounded px-3 py-1 cursor-pointer transition hover:opacity-90"
                    style={{ borderColor: color, color, backgroundColor: `${color}15` }}>
                    ACTIVATE EMERGENCY DEPLOYMENT →
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Station SVG map */}
          <div className="relative border border-white/5 rounded-xl bg-slate-950/70 overflow-hidden"
            style={{ minHeight: 200 }}>

            {/* Mercury planet graphic */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="rounded-full flex items-center justify-center border border-white/10"
                style={{
                  width: 56, height: 56,
                  background: "radial-gradient(circle at 35% 35%, #78716c, #44403c, #1c1917)",
                  boxShadow: `0 0 24px ${color}30, inset 0 0 12px rgba(0,0,0,0.7)`
                }}>
                <span className="text-lg" style={{ filter: "drop-shadow(0 0 4px #fcd34d)" }}>☿</span>
              </div>
            </div>

            <svg
              viewBox={SVG_VB}
              className="w-full h-full"
              style={{ minHeight: 200 }}
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Centralized old network (stage diagnose only) */}
              {stage === "diagnose" && STATIONS.map(s => (
                <line key={s.id}
                  x1={s.x} y1={s.y} x2={50} y2={50}
                  stroke="#ef444440" strokeWidth={0.6} strokeDasharray="2,2" />
              ))}

              {/* P2P links */}
              {PEER_LINKS.map(([a, b]) => {
                const sa = STATIONS.find(s => s.id === a)!;
                const sb = STATIONS.find(s => s.id === b)!;
                const active = getLinkActive(a, b);
                const lc = getLinkColor(a, b);
                return (
                  <motion.line key={`${a}-${b}`}
                    x1={sa.x} y1={sa.y} x2={sb.x} y2={sb.y}
                    stroke={lc}
                    strokeWidth={active ? 0.8 : 0.3}
                    strokeDasharray={active ? undefined : "1.5,2"}
                    animate={active ? { opacity: [1, 0.6, 1] } : { opacity: 0.35 }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                );
              })}

              {/* Nodes */}
              {STATIONS.map(s => {
                const status = nodeStatus[s.id];
                const nc = STATUS_COLORS[status];
                const icon = STATUS_ICON[status];
                const inGossip = gossipWave.includes(s.id);
                return (
                  <g key={s.id}
                    onClick={() => {
                      if (stage === "storm_ready") toggleManualOffline(s.id);
                      else if (["deploy", "diagnose"].includes(stage) && status === "undeployed") deployStation(s.id);
                    }}
                    style={{ cursor: ["deploy", "diagnose", "storm_ready"].includes(stage) ? "pointer" : "default" }}
                  >
                    {/* Glow ring for gossip */}
                    {inGossip && (
                      <motion.circle cx={s.x} cy={s.y} r={8}
                        fill="none" stroke="#818cf8"
                        strokeWidth={1}
                        animate={{ r: [8, 14], opacity: [0.8, 0] }}
                        transition={{ repeat: Infinity, duration: 1, ease: "easeOut" }} />
                    )}
                    {/* Node circle */}
                    <motion.circle cx={s.x} cy={s.y} r={6}
                      fill={nc.fill} stroke={nc.ring} strokeWidth={1.2}
                      animate={status === "deploying" || status === "syncing" ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                      transition={{ repeat: Infinity, duration: 0.9 }} />
                    {/* Icon */}
                    <text x={s.x} y={s.y + 0.6} textAnchor="middle" dominantBaseline="middle"
                      fill={nc.text} fontSize={4.5} fontFamily="monospace" fontWeight="bold">{icon}</text>
                    {/* Label */}
                    <text x={s.x} y={s.y - 9} textAnchor="middle" dominantBaseline="middle"
                      fill={status === "offline" ? "#475569" : "#94a3b8"} fontSize={3.8} fontFamily="monospace">
                      {s.label}
                    </text>
                    {/* Click hint */}
                    {(stage === "deploy" || stage === "diagnose") && status === "undeployed" && (
                      <text x={s.x} y={s.y + 10} textAnchor="middle" dominantBaseline="middle"
                        fill={color} fontSize={3} fontFamily="monospace" opacity={0.7}>CLICK</text>
                    )}
                    {stage === "storm_ready" && status === "online" && (
                      <text x={s.x} y={s.y + 10} textAnchor="middle" dominantBaseline="middle"
                        fill="#f87171" fontSize={3} fontFamily="monospace" opacity={0.6}>OUTAGE?</text>
                    )}
                  </g>
                );
              })}

              {/* Central server for diagnose stage */}
              {stage === "diagnose" && (
                <g>
                  <rect x={42} y={46} width={16} height={9} rx={1.5}
                    fill="rgba(127,29,29,0.6)" stroke="#ef4444" strokeWidth={0.8} />
                  <text x={50} y={51.5} textAnchor="middle" dominantBaseline="middle"
                    fill="#f87171" fontSize={3} fontFamily="monospace">SERVER ✕</text>
                </g>
              )}
            </svg>
          </div>

          {/* Preview fail flash */}
          <AnimatePresence>
            {showPreviewFail && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="rounded-lg border border-red-900/50 bg-red-950/30 p-2 text-center">
                <div className="text-[8px] font-mono font-bold text-red-400">
                  PREVIEW: IF ONE MORE NODE FAILED → 2 &lt; 3 → ✕ QUORUM LOST
                </div>
                <div className="text-[6.5px] font-mono text-slate-500 mt-0.5">
                  SIMULATION ONLY — MISSION QUORUM IS MAINTAINED
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stage-specific controls */}
          <div className="flex gap-2 flex-wrap">
            {stage === "diagnose" && (
              <button onClick={deployAll}
                className="flex-1 text-[8px] font-mono font-bold border rounded-lg py-1.5 cursor-pointer transition hover:opacity-90 flex items-center justify-center gap-1.5"
                style={{ borderColor: color, color, backgroundColor: `${color}10` }}>
                <Zap size={10} /> DEPLOY ALL 5 NODES
              </button>
            )}
            {(stage === "deploy" || stage === "diagnose") && !allDeployed && (
              <button onClick={deployAll}
                className="flex-1 text-[8px] font-mono font-bold border rounded-lg py-1.5 cursor-pointer transition hover:opacity-90"
                style={{ borderColor: color, color, backgroundColor: `${color}10` }}>
                DEPLOY ALL REMAINING NODES ({5 - deployedCount} LEFT)
              </button>
            )}
            {stage === "deploy" && allDeployed && (
              <button onClick={establishNetwork}
                className="flex-1 text-[8.5px] font-mono font-bold border rounded-lg py-1.5 cursor-pointer transition hover:opacity-90 flex items-center justify-center gap-1.5"
                style={{ borderColor: "#06b6d4", color: "#06b6d4", backgroundColor: "rgba(8,51,68,0.3)" }}>
                <Wifi size={10} /> ESTABLISH P2P NETWORK
              </button>
            )}
            {stage === "storm_ready" && (
              <button onClick={runStormTest}
                className="flex-1 text-[8.5px] font-mono font-bold border rounded-lg py-1.5 cursor-pointer transition hover:opacity-90 flex items-center justify-center gap-1.5"
                style={{ borderColor: "#f59e0b", color: "#f59e0b", backgroundColor: "rgba(120,53,15,0.3)" }}>
                <Zap size={10} /> RUN SOLAR STORM TEST
              </button>
            )}
            {stage === "recovery" && (
              <button onClick={restoreNetwork}
                className="flex-1 text-[8.5px] font-mono font-bold border rounded-lg py-1.5 cursor-pointer transition hover:opacity-90 flex items-center justify-center gap-1.5"
                style={{ borderColor: "#4ade80", color: "#4ade80", backgroundColor: "rgba(20,83,45,0.3)" }}>
                <Radio size={10} /> RESTORE MERCURY COMMUNICATIONS
              </button>
            )}
          </div>

          {/* Complete summary */}
          {stage === "complete" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-green-900/40 bg-green-950/15 p-3 space-y-1.5">
              <div className="text-[9px] font-mono font-bold text-green-400 text-center">
                ☿ MISSION COMPLETE — MERCURY'S NETWORK SAVED
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                {[
                  ["NODES DEPLOYED", "5 / 5"],
                  ["NETWORK TYPE", "P2P MESH"],
                  ["PEER CONNECTIONS", "8 ACTIVE"],
                  ["MINIMUM QUORUM", "3 NODES"],
                  ["MAX OUTAGES SURVIVED", "2"],
                  ["CONSENSUS", "✓ MAINTAINED"],
                  ["RECOVERY", "✓ SUCCESS"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-[6.5px] font-mono">
                    <span className="text-slate-500">{k}</span>
                    <span className="text-green-400 font-bold">{v}</span>
                  </div>
                ))}
              </div>
              <div className="text-[6.5px] font-mono text-slate-500 text-center leading-relaxed border-t border-white/5 pt-1.5 mt-1">
                "A FAULT-TOLERANT NETWORK DOES NOT DEPEND ON A SINGLE SERVER. BY DEPLOYING MULTIPLE CONNECTED NODES AND MAINTAINING THE REQUIRED QUORUM, THE NETWORK CAN CONTINUE OPERATING EVEN WHEN SOME STATIONS GO OFFLINE."
              </div>
            </motion.div>
          )}
        </div>

        {/* RIGHT SIDE: Objectives + Telemetry + Log */}
        <div className="w-44 flex flex-col gap-2 shrink-0">

          {/* Mission Objectives */}
          <div className="rounded-xl border border-white/5 bg-slate-950/60 p-2.5">
            <div className="text-[7.5px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">
              MISSION OBJECTIVES
            </div>
            <div className="space-y-1">
              {OBJECTIVES.map(obj => {
                const done = completedObjectives.has(obj.key);
                return (
                  <div key={obj.key} className="flex items-start gap-1.5 text-[6.5px] font-mono">
                    <span className={done ? "text-green-400 shrink-0 mt-0.5" : "text-slate-600 shrink-0 mt-0.5"}>
                      {done ? "✓" : "□"}
                    </span>
                    <span className={done ? "text-green-400/80" : "text-slate-500"} style={{ lineHeight: 1.3 }}>
                      {obj.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quorum Monitor */}
          <div
            className="rounded-xl border p-2.5"
            style={{
              borderColor: quorumOk && stage !== "intro" ? "#14532d" : "#7f1d1d",
              background: quorumOk && stage !== "intro" ? "rgba(20,83,45,0.12)" : "rgba(127,29,29,0.12)",
            }}>
            <div className="text-[7px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">
              MERCURY QUORUM MONITOR
            </div>
            {[
              ["TOTAL NODES", "5"],
              ["ONLINE", `${onlineCount} / 5`],
              ["OFFLINE", `${offlineCount} / 5`],
              ["REQUIRED", "3 NODES"],
              ["STATUS", showPreviewFail ? "✕ PREVIEW FAIL" : (quorumOk && stage !== "intro" ? "✓ AVAILABLE" : "✕ OFFLINE")],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-[7px] font-mono">
                <span className="text-slate-500">{k}</span>
                <span style={{
                  color: v.startsWith("✓") ? "#4ade80"
                    : v.startsWith("✕") ? "#f87171"
                    : "#94a3b8"
                }}>{v}</span>
              </div>
            ))}
            {/* Visual quorum bar */}
            <div className="mt-1.5 flex gap-0.5">
              {[0, 1, 2, 3, 4].map(i => {
                const isOnline = i < onlineCount;
                const isRequired = i < 3;
                return (
                  <div key={i} className="flex-1 h-2 rounded-sm border"
                    style={{
                      borderColor: isRequired ? (isOnline ? "#22c55e80" : "#ef444480") : "#33415580",
                      backgroundColor: isOnline ? (isRequired ? "#22c55e40" : "#22c55e20") : "transparent",
                    }} />
                );
              })}
            </div>
            <div className="text-[5.5px] font-mono text-slate-600 mt-0.5 text-center">
              {onlineCount} ≥ 3 → {onlineCount >= 3 ? "✓ QUORUM" : "✕ NO QUORUM"}
            </div>
          </div>

          {/* Node status badges */}
          <div className="rounded-xl border border-white/5 bg-slate-950/40 p-2 space-y-0.5">
            <div className="text-[6.5px] font-mono text-slate-600 uppercase tracking-widest mb-1">NODE STATUS</div>
            {STATIONS.map(s => {
              const status = nodeStatus[s.id];
              const nc = STATUS_COLORS[status];
              return (
                <div key={s.id} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full border flex items-center justify-center shrink-0"
                    style={{ borderColor: nc.ring, backgroundColor: nc.fill }}>
                    <span className="text-[4.5px]" style={{ color: nc.text }}>{STATUS_ICON[status]}</span>
                  </div>
                  <span className="text-[6px] font-mono flex-1 uppercase" style={{ color: nc.text }}>
                    {s.label}
                  </span>
                  <span className="text-[5.5px] font-mono" style={{ color: nc.text }}>
                    {status === "undeployed" ? "AVAIL" : status.toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Hint */}
          <div className="rounded-xl border border-white/5 bg-slate-950/30 p-2">
            <div className="flex items-center justify-between mb-1">
              <div className="text-[6px] font-mono text-slate-600 uppercase tracking-widest">NOVA HINT</div>
              <button onClick={() => setHintIdx(i => (i + 1) % HINTS.length)}
                className="text-[5.5px] font-mono text-slate-600 hover:text-slate-400 cursor-pointer">
                NEXT ›
              </button>
            </div>
            <div className="text-[6.5px] font-mono text-slate-400 leading-relaxed">
              {HINTS[hintIdx]}
            </div>
          </div>

          {/* Terminal log */}
          <div className="rounded-xl border border-white/5 bg-slate-950/70 p-2 flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="text-[6px] font-mono text-slate-600 uppercase tracking-widest mb-1">MISSION LOG</div>
            <div ref={logRef}
              className="flex-1 overflow-y-auto space-y-0.5"
              style={{ scrollbarWidth: "thin", scrollbarColor: "#1e293b transparent" }}>
              {log.map((line, i) => (
                <div key={i} className="text-[5.5px] font-mono leading-tight"
                  style={{
                    color: line.startsWith("✓") ? "#4ade80"
                      : line.startsWith("⚠") || line.startsWith("☀") ? "#fbbf24"
                      : line.startsWith("✕") ? "#f87171"
                      : "#64748b"
                  }}>
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

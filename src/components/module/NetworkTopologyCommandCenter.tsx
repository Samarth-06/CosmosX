import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Server, ShieldAlert, ShieldCheck, Activity, AlertTriangle, Zap, Layers, Network } from "lucide-react";

interface Props {
  color: string;
}

type TopologyMode = "centralized" | "decentralized" | "distributed";

type Phase =
  | "init"
  | "centralized_intro"
  | "centralized_flow"
  | "centralized_fail"
  | "decentralized_intro"
  | "decentralized_flow"
  | "decentralized_fail"
  | "distributed_intro"
  | "distributed_flow"
  | "distributed_fail"
  | "compare"
  | "loop_wait";

interface NodeDef {
  id: number;
  label: string;
  role: "core" | "hub" | "peer" | "client";
  // Coordinates out of 100 for each mode
  centralized: { x: number; y: number };
  decentralized: { x: number; y: number };
  distributed: { x: number; y: number };
}

// 9 nodes in total
const NODES: NodeDef[] = [
  // Center/Hub Alpha
  {
    id: 0,
    label: "CORE SERVER",
    role: "core",
    centralized: { x: 50, y: 50 },
    decentralized: { x: 30, y: 40 },
    distributed: { x: 50, y: 15 },
  },
  // Hub Beta
  {
    id: 1,
    label: "HUB BETA",
    role: "hub",
    centralized: { x: 20, y: 25 },
    decentralized: { x: 70, y: 40 },
    distributed: { x: 78, y: 30 },
  },
  // Hub Gamma
  {
    id: 2,
    label: "HUB GAMMA",
    role: "hub",
    centralized: { x: 80, y: 25 },
    decentralized: { x: 50, y: 75 },
    distributed: { x: 82, y: 65 },
  },
  // Clients for Alpha / Peers
  {
    id: 3,
    label: "NODE A",
    role: "client",
    centralized: { x: 18, y: 58 },
    decentralized: { x: 15, y: 25 },
    distributed: { x: 55, y: 85 },
  },
  {
    id: 4,
    label: "NODE B",
    role: "client",
    centralized: { x: 32, y: 80 },
    decentralized: { x: 15, y: 55 },
    distributed: { x: 22, y: 65 },
  },
  // Clients for Beta / Peers
  {
    id: 5,
    label: "NODE C",
    role: "client",
    centralized: { x: 68, y: 80 },
    decentralized: { x: 85, y: 25 },
    distributed: { x: 18, y: 30 },
  },
  {
    id: 6,
    label: "NODE D",
    role: "client",
    centralized: { x: 82, y: 58 },
    decentralized: { x: 85, y: 55 },
    distributed: { x: 50, y: 50 },
  },
  // Clients for Gamma / Peers
  {
    id: 7,
    label: "NODE E",
    role: "client",
    centralized: { x: 50, y: 85 },
    decentralized: { x: 30, y: 85 },
    distributed: { x: 35, y: 20 },
  },
  {
    id: 8,
    label: "NODE F",
    role: "client",
    centralized: { x: 50, y: 15 },
    decentralized: { x: 70, y: 85 },
    distributed: { x: 65, y: 20 },
  },
];

// Connection definition for rendering lines
interface Connection {
  from: number;
  to: number;
  modes: TopologyMode[];
}

const CONNECTIONS: Connection[] = [
  // Centralized connections (all to Core 0)
  { from: 1, to: 0, modes: ["centralized"] },
  { from: 2, to: 0, modes: ["centralized"] },
  { from: 3, to: 0, modes: ["centralized"] },
  { from: 4, to: 0, modes: ["centralized"] },
  { from: 5, to: 0, modes: ["centralized"] },
  { from: 6, to: 0, modes: ["centralized"] },
  { from: 7, to: 0, modes: ["centralized"] },
  { from: 8, to: 0, modes: ["centralized"] },

  // Decentralized connections (inter-hub 0-1, 1-2, 2-0 + clients)
  { from: 0, to: 1, modes: ["decentralized"] },
  { from: 1, to: 2, modes: ["decentralized"] },
  { from: 2, to: 0, modes: ["decentralized"] },
  // Hub Alpha (0) clients: 3, 4
  { from: 3, to: 0, modes: ["decentralized"] },
  { from: 4, to: 0, modes: ["decentralized"] },
  // Hub Beta (1) clients: 5, 6
  { from: 5, to: 1, modes: ["decentralized"] },
  { from: 6, to: 1, modes: ["decentralized"] },
  // Hub Gamma (2) clients: 7, 8
  { from: 7, to: 2, modes: ["decentralized"] },
  { from: 8, to: 2, modes: ["decentralized"] },

  // Distributed connections (Mesh connection)
  { from: 0, to: 8, modes: ["distributed"] },
  { from: 0, to: 7, modes: ["distributed"] },
  { from: 8, to: 1, modes: ["distributed"] },
  { from: 1, to: 5, modes: ["distributed"] },
  { from: 5, to: 4, modes: ["distributed"] },
  { from: 4, to: 3, modes: ["distributed"] },
  { from: 3, to: 2, modes: ["distributed"] },
  { from: 2, to: 6, modes: ["distributed"] },
  { from: 6, to: 7, modes: ["distributed"] },
  // Cross mesh links
  { from: 6, to: 0, modes: ["distributed"] },
  { from: 7, to: 4, modes: ["distributed"] },
  { from: 8, to: 3, modes: ["distributed"] },
  { from: 5, to: 6, modes: ["distributed"] },
  { from: 1, to: 2, modes: ["distributed"] },
];

const SEQUENCE: { phase: Phase; mode: TopologyMode; delay: number; msg: string }[] = [
  { phase: "init",                mode: "centralized", delay: 0,     msg: "INITIALIZING GALACTIC NETWORK ARCHITECTURE LAB..." },
  { phase: "centralized_intro",   mode: "centralized", delay: 1500,  msg: "CENTRALIZED: ALL NODES DEPEND ON ONE CORE SERVER" },
  { phase: "centralized_flow",    mode: "centralized", delay: 4500,  msg: "A → CORE SERVER → F (TRAFFIC ROUTED THROUGH CENTER)" },
  { phase: "centralized_fail",    mode: "centralized", delay: 7500,  msg: "⚠ SERVER OFFLINE — SINGLE POINT OF FAILURE DISRUPTS NETWORK" },
  { phase: "decentralized_intro",  mode: "decentralized", delay: 11000, msg: "DECENTRALIZED: CONNECTIVITY SPREAD ACROSS 3 HUBS" },
  { phase: "decentralized_flow",   mode: "decentralized", delay: 14000, msg: "A → HUB ALPHA → HUB GAMMA → F (MULTIPLE PATHWAYS)" },
  { phase: "decentralized_fail",   mode: "decentralized", delay: 17000, msg: "⚠ HUB BETA FAILS — CLUSTER ISOLATED, OTHER HUBS STANDBY" },
  { phase: "distributed_intro",   mode: "distributed", delay: 20500, msg: "DISTRIBUTED: PEER-TO-PEER MESH CONNECTIONS, NO HUB" },
  { phase: "distributed_flow",    mode: "distributed", delay: 23500, msg: "A → F ROUTE SCANNING THROUGH PEER NODES..." },
  { phase: "distributed_fail",    mode: "distributed", delay: 26500, msg: "⚠ PEER NODE FAILS — SYSTEM REROUTES VIA ALTERNATE PATH" },
  { phase: "compare",             mode: "distributed", delay: 30500, msg: "✓ ARCHITECTURAL COMPARISON MATRIX" },
  { phase: "loop_wait",           mode: "distributed", delay: 33500, msg: "✓ CONFIGURATION VERIFIED — SECTOR STABILIZED" },
];

export default function NetworkTopologyCommandCenter({ color }: Props) {
  const [phase, setPhase] = useState<Phase>("init");
  const [mode, setMode] = useState<TopologyMode>("centralized");
  const [progressMsg, setProgressMsg] = useState("INITIALIZING NETWORK COMMAND...");
  const [packet, setPacket] = useState<{ x: number; y: number } | null>(null);
  const [userSelectedMode, setUserSelectedMode] = useState<TopologyMode | null>(null);

  // Core loop
  useEffect(() => {
    let timers: NodeJS.Timeout[] = [];
    const run = () => {
      SEQUENCE.forEach(({ phase: p, mode: m, delay, msg }) => {
        const t = setTimeout(() => {
          if (!userSelectedMode) {
            setPhase(p);
            setMode(m);
            setProgressMsg(msg);
            handlePacketAnimation(p, m);
          }
        }, delay);
        timers.push(t);
      });
      const loopT = setTimeout(() => {
        if (!userSelectedMode) {
          timers.forEach(clearTimeout);
          timers = [];
          run();
        }
      }, 35500);
      timers.push(loopT);
    };

    run();
    return () => timers.forEach(clearTimeout);
  }, [userSelectedMode]);

  const handlePacketAnimation = (p: Phase, m: TopologyMode) => {
    setPacket(null);
    if (p === "centralized_flow") {
      // Route: Node 3 (18, 58) -> Core 0 (50, 50) -> Node 6 (82, 58)
      setTimeout(() => setPacket({ x: 18, y: 58 }), 100);
      setTimeout(() => setPacket({ x: 50, y: 50 }), 800);
      setTimeout(() => setPacket({ x: 82, y: 58 }), 1500);
      setTimeout(() => setPacket(null), 2300);
    } else if (p === "decentralized_flow") {
      // Route: Node 3 (15, 25) -> Hub Alpha 0 (30, 40) -> Hub Gamma 2 (50, 75) -> Node 8 (70, 85)
      setTimeout(() => setPacket({ x: 15, y: 25 }), 100);
      setTimeout(() => setPacket({ x: 30, y: 40 }), 700);
      setTimeout(() => setPacket({ x: 50, y: 75 }), 1400);
      setTimeout(() => setPacket({ x: 70, y: 85 }), 2100);
      setTimeout(() => setPacket(null), 2800);
    } else if (p === "distributed_flow") {
      // Route: Node 3 (55, 85) -> Node 2 (82, 65) -> Node 6 (50, 50) -> Node 5 (18, 30)
      setTimeout(() => setPacket({ x: 55, y: 85 }), 100);
      setTimeout(() => setPacket({ x: 82, y: 65 }), 700);
      setTimeout(() => setPacket({ x: 50, y: 50 }), 1400);
      setTimeout(() => setPacket({ x: 18, y: 30 }), 2100);
      setTimeout(() => setPacket(null), 2800);
    } else if (p === "distributed_fail") {
      // Primary Route: Node 3 (55, 85) -> Node 2 (82, 65) -> Node 6 (50, 50) [FAIL] -> Reroute: Node 3 -> Node 4 (22, 65) -> Node 5 (18, 30)
      setTimeout(() => setPacket({ x: 55, y: 85 }), 100);
      setTimeout(() => setPacket({ x: 82, y: 65 }), 600);
      setTimeout(() => setPacket({ x: 55, y: 85 }), 1200); // Backtrack
      setTimeout(() => setPacket({ x: 22, y: 65 }), 1800);
      setTimeout(() => setPacket({ x: 18, y: 30 }), 2400);
      setTimeout(() => setPacket(null), 3100);
    }
  };

  const handleUserModeSwitch = (m: TopologyMode) => {
    setUserSelectedMode(m);
    setMode(m);
    setPhase("loop_wait");
    if (m === "centralized") {
      setProgressMsg("CENTRALIZED: SINGLE COORDINATOR CONTROL POINT ACTIVE");
    } else if (m === "decentralized") {
      setProgressMsg("DECENTRALIZED: REGIONAL COORDINATING HUBS ACTIVE");
    } else {
      setProgressMsg("DISTRIBUTED: MESH PATH ROUTING ACTIVE");
    }
  };

  const activeMode = userSelectedMode || mode;

  // Node states based on phase
  const isFailed = (nodeId: number) => {
    if (userSelectedMode) return false;
    if (phase === "centralized_fail" && nodeId === 0) return true;
    if (phase === "decentralized_fail" && nodeId === 1) return true;
    if (phase === "distributed_fail" && nodeId === 6) return true;
    return false;
  };

  // Node isolation (all connections broken)
  const isNodeDisconnected = (nodeId: number) => {
    if (userSelectedMode) return false;
    if (phase === "centralized_fail") return true; // Central server crash disconnects everything in simplified view
    if (phase === "decentralized_fail" && (nodeId === 5 || nodeId === 6)) return true; // Cluster Beta clients disconnected
    return false;
  };

  // Connection visibility
  const isLinkVisible = (conn: Connection) => {
    if (!conn.modes.includes(activeMode)) return false;
    if (userSelectedMode) return true;
    if (phase === "init") return false;
    if (phase === "centralized_fail") return false; // All links vanish
    if (phase === "decentralized_fail" && (conn.from === 1 || conn.to === 1)) return false; // Links to Hub 1 broken
    if (phase === "distributed_fail" && (conn.from === 6 || conn.to === 6)) return false; // Links to Peer 6 broken
    return true;
  };

  const msgType = progressMsg.startsWith("✓") ? "ok"
    : progressMsg.startsWith("⚠") ? "err"
    : "neutral";
  const msgColor = msgType === "ok" ? "#4ade80" : msgType === "err" ? "#f87171" : color;
  const msgBorder = msgType === "ok" ? "#14532d" : msgType === "err" ? "#7f1d1d" : `${color}25`;
  const msgBg = msgType === "ok" ? "rgba(20,83,45,0.10)" : msgType === "err" ? "rgba(127,29,29,0.10)" : `${color}06`;

  // Telemetry details
  const telemetry = {
    centralized: [
      ["COORDINATOR", "CORE SERVER"],
      ["CONTROL", "SINGLE POINT"],
      ["FAILURE RISK", "HIGH (SINGLE POINT)"],
      ["ACTIVE HUBS", "1"],
    ],
    decentralized: [
      ["COORDINATOR", "3 HUBS (ALPHA/BETA/GAMMA)"],
      ["CONTROL", "REGIONAL HUBS"],
      ["FAILURE RISK", "PARTIAL DISRUPTION"],
      ["ACTIVE HUBS", isFailed(1) ? "2" : "3"],
    ],
    distributed: [
      ["COORDINATOR", "NONE (PEER-TO-PEER)"],
      ["CONTROL", "COLLABORATIVE MESH"],
      ["FAILURE RISK", "LOW (DYNAMIC PATHS)"],
      ["PEER PATHS", "MULTIPLE"],
    ],
  }[activeMode];

  return (
    <div
      className="rounded-2xl border flex flex-col gap-3 p-4 h-full relative overflow-hidden"
      style={{ borderColor: `${color}30`, background: "linear-gradient(145deg,rgba(2,6,23,0.98),rgba(5,10,30,0.95))" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono font-bold tracking-widest uppercase" style={{ color }}>
            NETWORK TOPOLOGY COMMAND CENTER
          </div>
          <div className="text-[8px] font-mono text-slate-500 tracking-widest uppercase mt-0.5">
            SPACE NETWORK CONFIGURATIONS
          </div>
        </div>
        <div className="flex gap-1.5">
          {(["centralized", "decentralized", "distributed"] as TopologyMode[]).map(m => (
            <button
              key={m}
              onClick={() => handleUserModeSwitch(m)}
              className="text-[7.5px] font-mono font-bold px-2 py-1 rounded border uppercase tracking-wider transition cursor-pointer"
              style={{
                borderColor: activeMode === m ? color : "#1e293b",
                backgroundColor: activeMode === m ? `${color}15` : "transparent",
                color: activeMode === m ? color : "#64748b",
              }}
            >
              {m}
            </button>
          ))}
          {userSelectedMode && (
            <button
              onClick={() => setUserSelectedMode(null)}
              className="text-[7px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 border border-amber-900/40 px-1.5 py-0.5 rounded cursor-pointer"
            >
              <RefreshCw size={8} /> AUTO PLAY
            </button>
          )}
        </div>
      </div>

      {/* Progress */}
      <motion.div
        key={progressMsg}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[8.5px] font-mono rounded-lg px-3 py-1.5 border"
        style={{ color: msgColor, borderColor: msgBorder, background: msgBg }}
      >
        {progressMsg}
      </motion.div>

      {/* Network Canvas */}
      <div className="flex-1 relative border border-white/5 rounded-xl bg-slate-950/60 overflow-hidden min-h-[220px]">
        {/* Connection Lines (SVG Overlay) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {CONNECTIONS.map((conn, idx) => {
            const isVisible = isLinkVisible(conn);
            if (!isVisible) return null;

            const fromNode = NODES[conn.from];
            const toNode = NODES[conn.to];

            const fromPos = fromNode[activeMode];
            const toPos = toNode[activeMode];

            return (
              <motion.line
                key={idx}
                x1={`${fromPos.x}%`}
                y1={`${fromPos.y}%`}
                x2={`${toPos.x}%`}
                y2={`${toPos.y}%`}
                stroke={activeMode === "distributed" ? "#6366f1" : color}
                strokeWidth={activeMode === "distributed" ? 0.75 : 1}
                opacity={0.4}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5 }}
              />
            );
          })}
        </svg>

        {/* Dynamic Nodes */}
        {NODES.map(node => {
          const pos = node[activeMode];
          const failed = isFailed(node.id);
          const disconnected = isNodeDisconnected(node.id);

          const isAlphaOrCore = node.id === 0;
          const isBeta = node.id === 1;
          const isGamma = node.id === 2;

          const size = isAlphaOrCore && activeMode === "centralized" ? "w-6.5 h-6.5"
            : (isAlphaOrCore || isBeta || isGamma) && activeMode === "decentralized" ? "w-5.5 h-5.5"
            : "w-4 h-4";

          const bg = failed ? "rgba(127,29,29,0.85)"
            : disconnected ? "rgba(30,41,59,0.5)"
            : isAlphaOrCore && activeMode === "centralized" ? "rgba(34,211,238,0.2)"
            : (isAlphaOrCore || isBeta || isGamma) && activeMode === "decentralized" ? "rgba(168,85,247,0.15)"
            : "rgba(15,23,42,0.9)";

          const border = failed ? "#ef4444"
            : disconnected ? "#475569"
            : isAlphaOrCore && activeMode === "centralized" ? "#22d3ee"
            : (isAlphaOrCore || isBeta || isGamma) && activeMode === "decentralized" ? "#c084fc" : `${color}50`;

          return (
            <motion.div
              key={node.id}
              layout
              className={`absolute rounded-full border flex items-center justify-center -translate-x-1/2 -translate-y-1/2 z-10 ${size}`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                backgroundColor: bg,
                borderColor: border,
                boxShadow: failed ? "0 0 10px #ef444450" : "none",
              }}
              animate={failed ? { scale: [1, 1.15, 1] } : { scale: 1 }}
              transition={{ repeat: failed ? Infinity : 0, duration: 0.8 }}
            >
              {activeMode === "centralized" && isAlphaOrCore && !failed && (
                <Server size={10} className="text-cyan-400" />
              )}
              {activeMode === "decentralized" && (isAlphaOrCore || isBeta || isGamma) && !failed && (
                <Layers size={9} className="text-purple-400" />
              )}
              {!failed && !disconnected && (activeMode === "distributed" || (!isAlphaOrCore && !isBeta && !isGamma)) && (
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
              )}
              {failed && (
                <span className="text-[7px] font-bold text-red-200">✕</span>
              )}

              {/* Tooltip Label */}
              <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-white/5 rounded px-1 text-[5.5px] font-mono text-slate-400 whitespace-nowrap">
                {node.label}
              </div>
            </motion.div>
          );
        })}

        {/* Animated Data Packet */}
        <AnimatePresence>
          {packet && (
            <motion.div
              key="packet"
              layout
              className="absolute w-2 h-2 rounded-full bg-amber-400 -translate-x-1/2 -translate-y-1/2 z-20 shadow-lg shadow-amber-500/50"
              style={{ left: `${packet.x}%`, top: `${packet.y}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Side-by-Side Comparison Panel */}
      <AnimatePresence>
        {phase === "compare" && !userSelectedMode && (
          <motion.div
            key="compare"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-3 gap-2 rounded-xl border p-2 bg-slate-950/40 border-white/5"
          >
            {[
              {
                title: "CENTRALIZED",
                c: "#22d3ee",
                bg: "rgba(34,211,238,0.05)",
                desc: "One coordinator. High efficiency, high failure vulnerability.",
              },
              {
                title: "DECENTRALIZED",
                c: "#a855f7",
                bg: "rgba(168,85,247,0.05)",
                desc: "Multiple hubs. Cluster independence, partial failure impact.",
              },
              {
                title: "DISTRIBUTED",
                c: "#6366f1",
                bg: "rgba(99,102,241,0.05)",
                desc: "Collaborative mesh. Dynamic routing, path resilience.",
              },
            ].map(item => (
              <div
                key={item.title}
                className="rounded-lg border p-1.5 text-center flex flex-col justify-between"
                style={{ borderColor: `${item.c}20`, background: item.bg }}
              >
                <div className="text-[7.5px] font-mono font-bold" style={{ color: item.c }}>
                  {item.title}
                </div>
                <div className="text-[6.5px] font-mono text-slate-400 mt-1 leading-relaxed">
                  {item.desc}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Telemetry Footer */}
      <div className="grid grid-cols-2 gap-2">
        {/* Telemetry panel */}
        <div className="rounded-xl border p-2.5 space-y-0.5 animate-fade-in" style={{ borderColor: `${color}20`, background: `${color}05` }}>
          <div className="text-[7.5px] font-mono text-slate-500 uppercase tracking-widest mb-1">NETWORK ARCHITECTURE</div>
          {telemetry.map(([k, v]) => (
            <div key={k} className="flex justify-between text-[7.5px] font-mono">
              <span className="text-slate-500">{k}</span>
              <span style={{
                color: v.startsWith("HIGH") ? "#f87171"
                  : v.startsWith("LOW") || v.startsWith("✓") ? "#4ade80"
                  : v.startsWith("PARTIAL") ? "#fbbf24"
                  : "#94a3b8"
              }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Status card */}
        <div
          className="rounded-xl border p-2.5 flex flex-col items-center justify-center gap-1.5"
          style={{
            borderColor: phase.includes("fail") && !userSelectedMode ? "#7f1d1d" : "#14532d",
            background: phase.includes("fail") && !userSelectedMode ? "rgba(127,29,29,0.12)" : "rgba(20,83,45,0.10)",
          }}
        >
          {phase.includes("fail") && !userSelectedMode ? (
            <>
              <ShieldAlert size={20} className="text-red-400" />
              <div className="text-[8px] font-mono text-red-400 font-bold text-center">
                {activeMode === "centralized" ? "CRITICAL OUTAGE" : activeMode === "decentralized" ? "DEGRADED STATE" : "PATH FAULT"}
              </div>
              <div className="text-[6.5px] font-mono text-red-400/60 text-center uppercase">
                {activeMode === "centralized" ? "SINGLE POINT FAILURE" : activeMode === "decentralized" ? "HUB BETA OFFLINE" : "REROUTING COMPLETED"}
              </div>
            </>
          ) : (
            <>
              <ShieldCheck size={20} className="text-green-400" />
              <div className="text-[8px] font-mono text-green-400 font-bold text-center">NETWORK ONLINE</div>
              <div className="text-[6.5px] font-mono text-green-400/60 text-center uppercase">
                {activeMode} CONSENSUS ACTIVE
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

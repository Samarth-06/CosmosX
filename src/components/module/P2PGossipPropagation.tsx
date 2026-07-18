import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, ShieldAlert, Radio, CheckCircle, XCircle } from "lucide-react";

interface Props {
  color: string;
}

type Mode = "valid" | "invalid" | "mid_fail";

type Phase =
  | "init"
  | "tx_enter"
  | "validating_a"
  | "relay_hop1"
  | "validating_hop1"
  | "relay_hop2"
  | "validating_hop2"
  | "duplicate_demo"
  | "complete"
  | "invalid_enter"
  | "invalid_fail"
  | "invalid_blocked"
  | "mid_enter"
  | "mid_relay_hop1"
  | "mid_node_c_fail"
  | "mid_alt_route"
  | "mid_complete"
  | "summary"
  | "loop_wait";

interface NodeDef {
  id: number;
  label: string;
  x: number; // percentage
  y: number; // percentage
}

const NODES: NodeDef[] = [
  { id: 0, label: "NODE A", x: 15, y: 50 },
  { id: 1, label: "NODE B", x: 35, y: 25 },
  { id: 2, label: "NODE C", x: 45, y: 50 },
  { id: 3, label: "NODE D", x: 35, y: 75 },
  { id: 4, label: "NODE E", x: 65, y: 25 },
  { id: 5, label: "NODE F", x: 75, y: 50 },
  { id: 6, label: "NODE G", x: 65, y: 75 },
  { id: 7, label: "NODE H", x: 82, y: 80 },
  { id: 8, label: "NODE I", x: 90, y: 50 },
];

interface Connection {
  from: number;
  to: number;
}

const CONNECTIONS: Connection[] = [
  { from: 0, to: 1 },
  { from: 0, to: 2 },
  { from: 0, to: 3 },
  { from: 1, to: 4 },
  { from: 1, to: 2 },
  { from: 2, to: 5 },
  { from: 3, to: 6 },
  { from: 4, to: 7 },
  { from: 4, to: 5 },
  { from: 5, to: 8 },
  { from: 6, to: 7 },
  { from: 6, to: 8 },
  { from: 7, to: 8 },
];

interface PacketDef {
  id: string;
  from: number;
  to: number;
  color: string;
}

const SEQUENCE: { phase: Phase; mode: Mode; delay: number; msg: string }[] = [
  { phase: "init",             mode: "valid",    delay: 0,     msg: "INITIALIZING GOSSIP NETWORK..." },
  { phase: "tx_enter",         mode: "valid",    delay: 2000,  msg: "TX-2048 RECEIVED AT NODE A (AMOUNT: 250 XLM)" },
  { phase: "validating_a",     mode: "valid",    delay: 4000,  msg: "NODE A: VALIDATING PROTOCOL RULES AND ACCOUNT BALANCE..." },
  { phase: "relay_hop1",       mode: "valid",    delay: 6500,  msg: "GOSSIP HOP 1: ANNOUNCING TX-2048 TO DIRECT PEERS B, C, D" },
  { phase: "validating_hop1",   mode: "valid",    delay: 8500,  msg: "PEERS B, C, D RECEIVE AND VALIDATE INDEPENDENTLY..." },
  { phase: "relay_hop2",       mode: "valid",    delay: 11000, msg: "GOSSIP HOP 2: SPREADING WAVE TO E, F, G..." },
  { phase: "validating_hop2",   mode: "valid",    delay: 13000, msg: "HOP 3: FINAL PEERS H, I REACHED" },
  { phase: "duplicate_demo",   mode: "valid",    delay: 15500, msg: "DUPLICATE DETECTION: NODE H IGNORES REPEAT GOSSIP FROM G" },
  { phase: "complete",         mode: "valid",    delay: 18500, msg: "✓ TX-2048 PROPAGATION COMPLETE — 9/9 NODES REACHED" },
  { phase: "invalid_enter",    mode: "invalid",  delay: 21500, msg: "TX-4096 RECEIVED AT NODE A (BAD SIGNATURE)" },
  { phase: "invalid_fail",     mode: "invalid",  delay: 23500, msg: "NODE A: VALIDATION FAILS — SIGNATURE VERIFICATION REJECTED" },
  { phase: "invalid_blocked",  mode: "invalid",  delay: 26000, msg: "✕ RELAY BLOCKED — INVALID TX STOPPED AT ENTRY NODE" },
  { phase: "mid_enter",        mode: "mid_fail", delay: 29500, msg: "TX-8192 (MID-FAIL STUDY) RECEIVED AT NODE A" },
  { phase: "mid_relay_hop1",   mode: "mid_fail", delay: 31500, msg: "NODE A RELAYS TO PEERS B, C, D" },
  { phase: "mid_node_c_fail",  mode: "mid_fail", delay: 34000, msg: "✕ NODE C REJECTS TX-8192 (INSUFFICIENT BALANCE) — BLOCKS PATH" },
  { phase: "mid_alt_route",    mode: "mid_fail", delay: 36500, msg: "✓ RESILIENCE: NODE F STILL REACHABLE VIA NODE B → E → F" },
  { phase: "mid_complete",     mode: "mid_fail", delay: 39500, msg: "✓ PROPAGATION WAVE FINISHED THROUGH ACTIVE CHANNELS" },
  { phase: "summary",          mode: "mid_fail", delay: 42500, msg: "✓ P2P GOSSIP ROUTING SIMULATION FINISHED" },
  { phase: "loop_wait",        mode: "mid_fail", delay: 45000, msg: "✓ NETWORK SYNCHRONIZED — MONITORS STANDBY" },
];

export default function P2PGossipPropagation({ color }: Props) {
  const [phase, setPhase] = useState<Phase>("init");
  const [mode, setMode] = useState<Mode>("valid");
  const [progressMsg, setProgressMsg] = useState("INITIALIZING MONITOR...");
  const [packets, setPackets] = useState<PacketDef[]>([]);
  const [userSelectedMode, setUserSelectedMode] = useState<Mode | null>(null);

  useEffect(() => {
    let timers: NodeJS.Timeout[] = [];
    const run = () => {
      SEQUENCE.forEach(({ phase: p, mode: m, delay, msg }) => {
        const t = setTimeout(() => {
          if (!userSelectedMode) {
            setPhase(p);
            setMode(m);
            setProgressMsg(msg);
            handlePacketEvents(p, m);
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
      }, 47500);
      timers.push(loopT);
    };

    run();
    return () => timers.forEach(clearTimeout);
  }, [userSelectedMode]);

  const handlePacketEvents = (p: Phase, m: Mode) => {
    setPackets([]);
    if (p === "relay_hop1") {
      setPackets([
        { id: "p1", from: 0, to: 1, color: "#6366f1" },
        { id: "p2", from: 0, to: 2, color: "#6366f1" },
        { id: "p3", from: 0, to: 3, color: "#6366f1" },
      ]);
    } else if (p === "relay_hop2") {
      setPackets([
        { id: "p4", from: 1, to: 4, color: "#6366f1" },
        { id: "p5", from: 2, to: 5, color: "#6366f1" },
        { id: "p6", from: 3, to: 6, color: "#6366f1" },
      ]);
    } else if (p === "validating_hop2") {
      setPackets([
        { id: "p7", from: 4, to: 7, color: "#6366f1" },
        { id: "p8", from: 5, to: 8, color: "#6366f1" },
        { id: "p9", from: 6, to: 7, color: "#6366f1" },
        { id: "p10", from: 6, to: 8, color: "#6366f1" },
      ]);
    } else if (p === "duplicate_demo") {
      // Node G tries to send to H again, showing duplicate collision
      setPackets([{ id: "dup", from: 6, to: 7, color: "#fbbf24" }]);
    } else if (p === "mid_relay_hop1") {
      setPackets([
        { id: "m1", from: 0, to: 1, color: "#6366f1" },
        { id: "m2", from: 0, to: 2, color: "#6366f1" },
        { id: "m3", from: 0, to: 3, color: "#6366f1" },
      ]);
    } else if (p === "mid_alt_route") {
      // Peer B relays to E, D relays to G
      setPackets([
        { id: "ma1", from: 1, to: 4, color: "#6366f1" },
        { id: "ma2", from: 3, to: 6, color: "#6366f1" },
        // Mid-phase propagation wave continues to target F, H, I
        { id: "ma3", from: 4, to: 5, color: "#6366f1" }, // E to F (reaches F despite C failing)
        { id: "ma4", from: 4, to: 7, color: "#6366f1" },
        { id: "ma5", from: 6, to: 8, color: "#6366f1" },
      ]);
    }
  };

  const handleUserModeSwitch = (selected: Mode) => {
    setUserSelectedMode(selected);
    setMode(selected);
    setPhase("loop_wait");
    if (selected === "valid") {
      setProgressMsg("VALID TRANSACTION: STEADY P2P MULTI-PEER PROPAGATION SCENARIO");
    } else if (selected === "invalid") {
      setProgressMsg("INVALID TRANSACTION: REJECTED AT INGEST NODE A");
    } else {
      setProgressMsg("MID-NETWORK FAULT: NODE C BLOCKS PATH, ROUTING SELF-HEALS VIA NODE B");
    }
  };

  const activeMode = userSelectedMode || mode;

  // Node states resolver
  const getNodeState = (nodeId: number) => {
    if (userSelectedMode) {
      if (userSelectedMode === "invalid" && nodeId === 0) return "rejected";
      if (userSelectedMode === "invalid") return "unreached";
      if (userSelectedMode === "mid_fail" && nodeId === 2) return "rejected";
      return "valid";
    }

    if (phase === "init") return "unreached";

    if (mode === "valid") {
      if (phase === "tx_enter") return nodeId === 0 ? "validating" : "unreached";
      if (phase === "validating_a") return nodeId === 0 ? "valid" : "unreached";
      if (phase === "relay_hop1") return nodeId === 0 ? "valid" : "unreached";
      if (phase === "validating_hop1") return nodeId === 0 ? "valid" : ([1, 2, 3].includes(nodeId) ? "validating" : "unreached");
      if (phase === "relay_hop2") return [0, 1, 2, 3].includes(nodeId) ? "valid" : "unreached";
      if (phase === "validating_hop2") return [0, 1, 2, 3].includes(nodeId) ? "valid" : ([4, 5, 6].includes(nodeId) ? "validating" : "unreached");
      if (phase === "duplicate_demo") return nodeId === 7 ? "duplicate" : ([0,1,2,3,4,5,6].includes(nodeId) ? "valid" : "validating");
      return "valid"; // complete / summary / loop_wait
    }

    if (mode === "invalid") {
      if (phase === "invalid_enter") return nodeId === 0 ? "validating" : "unreached";
      if (phase === "invalid_fail") return nodeId === 0 ? "rejected" : "unreached";
      return nodeId === 0 ? "rejected" : "unreached"; // invalid_blocked
    }

    if (mode === "mid_fail") {
      if (phase === "mid_enter") return nodeId === 0 ? "validating" : "unreached";
      if (phase === "mid_relay_hop1") return nodeId === 0 ? "valid" : "unreached";
      if (phase === "mid_node_c_fail") return nodeId === 2 ? "rejected" : ([0, 1, 3].includes(nodeId) ? "valid" : "unreached");
      if (phase === "mid_alt_route") return nodeId === 2 ? "rejected" : ([0,1,3,4,6].includes(nodeId) ? "valid" : "unreached");
      if (phase === "mid_complete") return nodeId === 2 ? "rejected" : "valid";
      return nodeId === 2 ? "rejected" : "valid"; // complete / summary / loop_wait
    }

    return "unreached";
  };

  const getReachedCount = () => {
    if (userSelectedMode) {
      if (userSelectedMode === "invalid") return 1;
      if (userSelectedMode === "mid_fail") return 8;
      return 9;
    }
    if (phase === "init") return 0;
    if (mode === "valid") {
      if (["tx_enter", "validating_a", "relay_hop1"].includes(phase)) return 1;
      if (["validating_hop1", "relay_hop2"].includes(phase)) return 4;
      if (["validating_hop2"].includes(phase)) return 7;
      return 9;
    }
    if (mode === "invalid") return 1;
    if (mode === "mid_fail") {
      if (["mid_enter", "mid_relay_hop1"].includes(phase)) return 1;
      if (phase === "mid_node_c_fail") return 4; // A, B, C, D (including C who fails)
      if (phase === "mid_alt_route") return 6; // A, B, C, D, E, G
      return 8; // A, B, C (fail), D, E, F, G, H, I
    }
    return 0;
  };

  // Telemetry details mapping
  const telemetry = {
    valid: [
      ["TRANSACTION", "TX-2048"],
      ["ORIGIN", "NODE A"],
      ["GOSSIP HOPS", phase === "relay_hop1" || phase === "validating_hop1" ? "1" : (phase === "relay_hop2" || phase === "validating_hop2" ? "2" : "3")],
      ["NODES REACHED", `${getReachedCount()} / 9`],
      ["STATUS", getReachedCount() === 9 ? "✓ COMPLETE" : "PROPAGATING"],
    ],
    invalid: [
      ["TRANSACTION", "TX-4096"],
      ["ORIGIN", "NODE A"],
      ["FAILED CHECK", "SIGNATURE FAIL"],
      ["NODES REACHED", "1 / 9"],
      ["RELAY STATUS", "✕ BLOCKED"],
    ],
    mid_fail: [
      ["TRANSACTION", "TX-8192"],
      ["FAULTY NODE", "NODE C (BALANCE INSUFFICIENT)"],
      ["REROUTED PATH", "NODE B → E → F"],
      ["NODES REACHED", `${getReachedCount()} / 9`],
      ["STATUS", getReachedCount() >= 8 ? "✓ COMPLETED VIA MESH" : "REROUTING"],
    ],
  }[activeMode];

  // Message styling based on mode / phase
  const msgColor =
    activeMode === "invalid" || (mode === "mid_fail" && phase === "mid_node_c_fail")
      ? "#f87171"
      : progressMsg.startsWith("✓")
      ? "#4ade80"
      : "#94a3b8";
  const msgBorder =
    activeMode === "invalid" || (mode === "mid_fail" && phase === "mid_node_c_fail")
      ? "#7f1d1d"
      : progressMsg.startsWith("✓")
      ? "#14532d"
      : "#1e293b";
  const msgBg =
    activeMode === "invalid" || (mode === "mid_fail" && phase === "mid_node_c_fail")
      ? "rgba(127,29,29,0.18)"
      : progressMsg.startsWith("✓")
      ? "rgba(20,83,45,0.18)"
      : "rgba(15,23,42,0.8)";

  return (
    <div
      className="rounded-2xl border flex flex-col gap-3 p-4 h-full relative overflow-hidden"
      style={{ borderColor: `${color}30`, background: "linear-gradient(145deg,rgba(2,6,23,0.98),rgba(5,10,30,0.95))" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono font-bold tracking-widest uppercase" style={{ color }}>
            P2P GOSSIP PROPAGATION MONITOR
          </div>
          <div className="text-[8px] font-mono text-slate-500 tracking-widest uppercase mt-0.5">
            VALIDATE • RELAY • PROPAGATE
          </div>
        </div>
        <div className="flex gap-1.5">
          {[
            { key: "valid", label: "VALID TX" },
            { key: "invalid", label: "INVALID TX" },
            { key: "mid_fail", label: "MID-FAIL ROUTE" },
          ].map(m => (
            <button
              key={m.key}
              onClick={() => handleUserModeSwitch(m.key as Mode)}
              className="text-[7.5px] font-mono font-bold px-2 py-1 rounded border uppercase tracking-wider transition cursor-pointer"
              style={{
                borderColor: activeMode === m.key ? color : "#1e293b",
                backgroundColor: activeMode === m.key ? `${color}15` : "transparent",
                color: activeMode === m.key ? color : "#64748b",
              }}
            >
              {m.label}
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

      {/* Network mesh visualization */}
      <div className="flex-1 relative border border-white/5 rounded-xl bg-slate-950/60 overflow-hidden min-h-[220px]">
        {/* Connection links */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {CONNECTIONS.map((conn, idx) => {
            const fromPos = NODES[conn.from];
            const toPos = NODES[conn.to];

            // Render path highlights based on active hops
            const isPathActive = (() => {
              if (activeMode === "invalid") return false;
              if (activeMode === "mid_fail") {
                if (conn.from === 2 || conn.to === 2) {
                  // Link to node C is active only before validation fail
                  return phase === "mid_relay_hop1" && (conn.from === 0 && conn.to === 2);
                }
              }
              return true; // Simple default rendering
            })();

            return (
              <line
                key={idx}
                x1={`${fromPos.x}%`}
                y1={`${fromPos.y}%`}
                x2={`${toPos.x}%`}
                y2={`${toPos.y}%`}
                stroke={isPathActive ? `${color}35` : "#ef444420"}
                strokeWidth={1.5}
              />
            );
          })}
        </svg>

        {/* Dynamic sliding packets */}
        <AnimatePresence>
          {packets.map(p => {
            const fromPos = NODES[p.from];
            const toPos = NODES[p.to];
            return (
              <motion.div
                key={p.id}
                className="absolute w-2 h-2 rounded-full z-20 shadow-md shadow-indigo-500/50"
                style={{ backgroundColor: p.color }}
                animate={{
                  left: [`${fromPos.x}%`, `${toPos.x}%`],
                  top: [`${fromPos.y}%`, `${toPos.y}%`],
                }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
              />
            );
          })}
        </AnimatePresence>

        {/* Node badges */}
        {NODES.map(node => {
          const state = getNodeState(node.id);

          const border = state === "valid" ? "#22c55e"
            : state === "rejected" ? "#ef4444"
            : state === "validating" ? "#fbbf24"
            : state === "duplicate" ? "#fbbf24"
            : `${color}35`;

          const bg = state === "valid" ? "rgba(20,83,45,0.85)"
            : state === "rejected" ? "rgba(127,29,29,0.85)"
            : state === "validating" ? "rgba(120,53,15,0.85)"
            : state === "duplicate" ? "rgba(120,53,15,0.7)"
            : "rgba(15,23,42,0.9)";

          const text = state === "valid" ? "✓"
            : state === "rejected" ? "✕"
            : state === "validating" ? "⚙"
            : state === "duplicate" ? "DUP"
            : "";

          return (
            <motion.div
              key={node.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full border flex items-center justify-center z-10 cursor-pointer"
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                borderColor: border,
                backgroundColor: bg,
                boxShadow: ["valid", "rejected", "validating"].includes(state) ? `0 0 10px ${border}40` : "none",
              }}
              animate={["validating", "duplicate"].includes(state) ? { scale: [1, 1.15, 1] } : { scale: 1 }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              {text ? (
                <span className="text-[7.5px] font-mono font-bold text-white leading-none">{text}</span>
              ) : (
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `${color}80` }} />
              )}

              {/* Node label tooltip */}
              <div className="absolute top-full mt-1 bg-slate-900/90 border border-white/5 rounded px-1.5 py-0.5 text-[5.5px] font-mono text-slate-400 whitespace-nowrap">
                {node.label}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Comparison flow summary block */}
      <AnimatePresence>
        {["summary", "loop_wait"].includes(phase) && !userSelectedMode && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="rounded-xl border p-2.5 space-y-1.5 bg-slate-950/40 border-white/5"
          >
            <div className="text-[7.5px] font-mono text-slate-500 uppercase tracking-widest">GOSSIP PROTOCOL DEDUPLICATION & VALIDATION RULES</div>
            <div className="grid grid-cols-2 gap-3 text-[7.5px] font-mono text-slate-400 leading-relaxed">
              <div className="rounded border border-green-950/40 bg-green-950/5 p-2">
                <span className="text-green-400 font-bold flex items-center gap-1">
                  <CheckCircle size={8} /> VALID PATH (TX-2048)
                </span>
                Validate local ledger rules ➔ relay forward ➔ cascade mesh sync.
              </div>
              <div className="rounded border border-red-950/40 bg-red-950/5 p-2">
                <span className="text-red-400 font-bold flex items-center gap-1">
                  <XCircle size={8} /> INVALID PATH (TX-4096)
                </span>
                Validation checks fail ➔ reject relay announcement ➔ block propagation path immediately.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Telemetry row */}
      <div className="grid grid-cols-2 gap-2">
        {/* Telemetry panel */}
        <div className="rounded-xl border p-2.5 space-y-0.5" style={{ borderColor: `${color}20`, background: `${color}05` }}>
          <div className="text-[7.5px] font-mono text-slate-500 uppercase tracking-widest mb-1">GOSSIP TELEMETRY</div>
          {telemetry.map(([k, v]) => (
            <div key={k} className="flex justify-between text-[7.5px] font-mono">
              <span className="text-slate-500">{k}</span>
              <span style={{
                color: v.startsWith("✕") || v.includes("REJECTED") ? "#f87171"
                  : v.startsWith("✓") || v.includes("COMPLETE") ? "#4ade80"
                  : "#94a3b8"
              }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Status card */}
        <div
          className="rounded-xl border p-2.5 flex flex-col items-center justify-center gap-1.5"
          style={{
            borderColor: activeMode === "invalid" ? "#7f1d1d" : "#14532d",
            background: activeMode === "invalid" ? "rgba(127,29,29,0.12)" : "rgba(20,83,45,0.10)",
          }}
        >
          {activeMode === "invalid" ? (
            <>
              <ShieldAlert size={20} className="text-red-400" />
              <div className="text-[8px] font-mono text-red-400 font-bold text-center">PROPAGATION BLOCKED</div>
              <div className="text-[6.5px] font-mono text-red-400/60 text-center uppercase">INVALID SIGNATURE REJECTED</div>
            </>
          ) : (
            <>
              <Radio size={20} className="text-green-400" />
              <div className="text-[8px] font-mono text-green-400 font-bold text-center">GOSSIP PROPAGATING</div>
              <div className="text-[6.5px] font-mono text-green-400/60 text-center uppercase">
                {getReachedCount()}/9 PEERS REACHED
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

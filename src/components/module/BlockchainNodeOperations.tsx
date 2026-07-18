import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, ShieldCheck, ShieldAlert, Cpu, HardDrive, Network, HelpCircle, Server, User, Wifi } from "lucide-react";

interface Props {
  color: string;
}

type NodeRole = "full" | "light" | "validator";

type Phase =
  | "init"
  | "software_install"
  | "online"
  | "zoom_out"
  | "full_focus"
  | "full_validate"
  | "light_focus"
  | "light_request"
  | "comparison"
  | "validator_focus"
  | "validator_quorum"
  | "split_tx"
  | "node_fail"
  | "summary"
  | "loop_wait";

const SEQUENCE: { phase: Phase; role: NodeRole; delay: number; msg: string }[] = [
  { phase: "init",             role: "full",      delay: 0,     msg: "INITIALIZING NODE HARDWARE FRAME..." },
  { phase: "software_install", role: "full",      delay: 1500,  msg: "INSTALLING CORE CLIENT SOFTWARE PROTOCOL..." },
  { phase: "online",           role: "full",      delay: 3500,  msg: "✓ CLIENT ONLINE — SYNCHRONIZED WITH 6 NETWORK PEERS" },
  { phase: "zoom_out",         role: "full",      delay: 5500,  msg: "BLOCKCHAIN NETWORK: MULTIPLE PARTICIPATING NODES" },
  { phase: "full_focus",       role: "full",      delay: 7500,  msg: "FULL NODE: MAINTAINS LEDGER & STATE FOR INDEPENDENT VERIFICATION" },
  { phase: "full_validate",     role: "full",      delay: 10500, msg: "FULL NODE: VALIDATING SIGNATURE & PROTOCOL RULES LOCALLY..." },
  { phase: "light_focus",      role: "light",     delay: 13500, msg: "LIGHT CLIENT: RESOURCE-EFFICIENT TERMINAL, MINIMAL LOCAL STORAGE" },
  { phase: "light_request",    role: "light",     delay: 16500, msg: "LIGHT CLIENT: REQUESTING MERKLE PROOF FROM FULL NODE..." },
  { phase: "comparison",       role: "light",     delay: 19500, msg: "COMPARING SYSTEM TRUST MODELS & RESOURCE REQUIREMENTS" },
  { phase: "validator_focus",  role: "validator", delay: 22500, msg: "VALIDATOR: DIRECT CONCURRENT PARTICIPANT IN CONSENSUS PROTOCOL" },
  { phase: "validator_quorum", role: "validator", delay: 25500, msg: "VALIDATOR: EXCHANGE MESSAGES TO REACH CONSENSUS QUORUM" },
  { phase: "split_tx",         role: "validator", delay: 29000, msg: "TX-2048 RECEIVED: THREE ROLES PROCESSING SIMULTANEOUSLY" },
  { phase: "node_fail",        role: "full",      delay: 33000, msg: "⚠ FULL NODE ALPHA OFFLINE — NETWORK CONSENSUS STABLE" },
  { phase: "summary",          role: "validator", delay: 36000, msg: "✓ BLOCKCHAIN NODE CLIENT COMPARISON COMPLETE" },
  { phase: "loop_wait",        role: "validator", delay: 39000, msg: "✓ OPERATIONS CENTER STABLE — ACTIVE MONITORING" },
];

export default function BlockchainNodeOperations({ color }: Props) {
  const [phase, setPhase] = useState<Phase>("init");
  const [activeRole, setActiveRole] = useState<NodeRole>("full");
  const [progressMsg, setProgressMsg] = useState("INITIALIZING NODE COMMAND...");
  const [userSelectedRole, setUserSelectedRole] = useState<NodeRole | null>(null);

  // Packet animation helper
  const [packet, setPacket] = useState<{ from: string; to: string } | null>(null);

  useEffect(() => {
    let timers: NodeJS.Timeout[] = [];
    const run = () => {
      SEQUENCE.forEach(({ phase: p, role: r, delay, msg }) => {
        const t = setTimeout(() => {
          if (!userSelectedRole) {
            setPhase(p);
            setActiveRole(r);
            setProgressMsg(msg);
            handlePacket(p);
          }
        }, delay);
        timers.push(t);
      });
      const loopT = setTimeout(() => {
        if (!userSelectedRole) {
          timers.forEach(clearTimeout);
          timers = [];
          run();
        }
      }, 41500);
      timers.push(loopT);
    };
    run();
    return () => timers.forEach(clearTimeout);
  }, [userSelectedRole]);

  const handlePacket = (p: Phase) => {
    setPacket(null);
    if (p === "light_request") {
      setTimeout(() => setPacket({ from: "light", to: "full" }), 100);
      setTimeout(() => setPacket({ from: "full", to: "light" }), 1000);
      setTimeout(() => setPacket(null), 1900);
    } else if (p === "validator_quorum") {
      setTimeout(() => setPacket({ from: "validator", to: "peer" }), 100);
      setTimeout(() => setPacket({ from: "peer", to: "validator" }), 900);
      setTimeout(() => setPacket(null), 1800);
    } else if (p === "split_tx") {
      setTimeout(() => setPacket({ from: "tx", to: "all" }), 100);
      setTimeout(() => setPacket(null), 1800);
    }
  };

  const selectRole = (role: NodeRole) => {
    setUserSelectedRole(role);
    setActiveRole(role);
    setPhase("loop_wait");
    if (role === "full") {
      setProgressMsg("FULL NODE: FULL HISTORY DATA VERIFICATION CAPABILITY");
    } else if (role === "light") {
      setProgressMsg("LIGHT CLIENT: SPV HEADERS & GRAPH PROOFS");
    } else {
      setProgressMsg("VALIDATOR NODE: federated quorum-based voting consensus");
    }
  };

  const currentRole = userSelectedRole || activeRole;

  // Telemetry mappings
  const telemetry = {
    full: [
      ["NODE TYPE", "FULL NODE (ALPHA)"],
      ["LOCAL DATA", "100% (SIMPLIFIED FULL MODE)"],
      ["VALIDATION", "INDEPENDENT LOCAL CHECK"],
      ["RESOURCE LOAD", "HIGH (CPU/DISK/BANDWIDTH)"],
    ],
    light: [
      ["NODE TYPE", "LIGHT CLIENT (BETA)"],
      ["LOCAL DATA", "MINIMAL (HEADERS ONLY)"],
      ["EXTERNAL TRUST", "QUERIES PEER PROOFS"],
      ["RESOURCE LOAD", "EXTREMELY LOW"],
    ],
    validator: [
      ["NODE TYPE", "VALIDATOR (GAMMA)"],
      ["CONSENSUS", "STELLAR CONSENSUS PROTOCOL"],
      ["QUORUM STATUS", "ACTIVE (VOTING PARTICIPANT)"],
      ["TRUST MODEL", "QUORUM SLICE GRAPH"],
    ],
  }[currentRole];

  const msgType = progressMsg.startsWith("✓") ? "ok"
    : progressMsg.startsWith("⚠") ? "err"
    : "neutral";
  const msgColor = msgType === "ok" ? "#4ade80" : msgType === "err" ? "#f87171" : color;
  const msgBorder = msgType === "ok" ? "#14532d" : msgType === "err" ? "#7f1d1d" : `${color}25`;
  const msgBg = msgType === "ok" ? "rgba(20,83,45,0.10)" : msgType === "err" ? "rgba(127,29,29,0.10)" : `${color}06`;

  return (
    <div
      className="rounded-2xl border flex flex-col gap-3 p-4 h-full relative overflow-hidden"
      style={{ borderColor: `${color}30`, background: "linear-gradient(145deg,rgba(2,6,23,0.98),rgba(5,10,30,0.95))" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono font-bold tracking-widest uppercase" style={{ color }}>
            BLOCKCHAIN NODE OPERATIONS CENTER
          </div>
          <div className="text-[8px] font-mono text-slate-500 tracking-widest uppercase mt-0.5">
            NODE CLIENT PROPERTIES
          </div>
        </div>
        <div className="flex gap-1.5">
          {(["full", "light", "validator"] as NodeRole[]).map(r => (
            <button
              key={r}
              onClick={() => selectRole(r)}
              className="text-[7.5px] font-mono font-bold px-2 py-1 rounded border uppercase tracking-wider transition cursor-pointer"
              style={{
                borderColor: currentRole === r ? color : "#1e293b",
                backgroundColor: currentRole === r ? `${color}15` : "transparent",
                color: currentRole === r ? color : "#64748b",
              }}
            >
              {r === "full" ? "FULL NODE" : r === "light" ? "LIGHT CLIENT" : "VALIDATOR"}
            </button>
          ))}
          {userSelectedRole && (
            <button
              onClick={() => setUserSelectedRole(null)}
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

      {/* Main Sandbox Visual area */}
      <div className="flex-1 relative border border-white/5 rounded-xl bg-slate-950/60 p-4 flex flex-col justify-between gap-4 min-h-[240px]">

        {/* Phase 1: Software installation / Node genesis */}
        {["init", "software_install", "online"].includes(phase) && !userSelectedRole && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <motion.div
              className="w-14 h-14 rounded-2xl border flex items-center justify-center relative"
              style={{
                borderColor: phase === "online" ? "#22c55e" : `${color}40`,
                background: phase === "online" ? "rgba(20,83,45,0.1)" : "transparent"
              }}
              animate={phase === "software_install" ? { rotate: [0, 90, 180, 270, 360] } : {}}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            >
              {phase === "init" && <Cpu size={24} className="text-slate-600" />}
              {phase === "software_install" && <Cpu size={24} style={{ color }} />}
              {phase === "online" && <Server size={24} className="text-green-400" />}
            </motion.div>

            <div className="text-center font-mono space-y-1">
              <div className="text-[9px] text-slate-300">
                {phase === "init" ? "NODE HARDWARE STBY" : phase === "software_install" ? "COMPILING Stellar-Core client..." : "BLOCKCHAIN NODE ONLINE"}
              </div>
              <div className="text-[7.5px] text-slate-500">
                {phase === "init" ? "CPU CORE ACTIVE • MEMORY REGISTERED" : phase === "software_install" ? "CHECKING SIGNATURE SCHEMAS & consensus matrices" : "PEER CONNECTIONS: 6 • LEDGER SYNC COMPLETE"}
              </div>
            </div>
          </div>
        )}

        {/* Zoom Out & Core Comparison view */}
        {(!["init", "software_install", "online"].includes(phase) || userSelectedRole) && (
          <div className="flex-1 flex flex-col gap-3 justify-center">

            {/* Three stations */}
            <div className="grid grid-cols-3 gap-3">

              {/* Station 1: Full Node */}
              <motion.div
                className="rounded-xl border p-2.5 flex flex-col gap-1 relative"
                style={{
                  borderColor: currentRole === "full" ? "#22d3ee" : isFailed(phase) ? "#ef444450" : `${color}15`,
                  background: currentRole === "full" ? "rgba(34,211,238,0.06)" : isFailed(phase) ? "rgba(127,29,29,0.08)" : "rgba(15,23,42,0.4)"
                }}
                animate={currentRole === "full" ? { scale: 1.02 } : { scale: 1 }}
              >
                <div className="flex items-center justify-between">
                  <div className="text-[8px] font-mono font-bold text-cyan-400">FULL NODE (ALPHA)</div>
                  <Server size={10} className={isFailed(phase) ? "text-red-400" : "text-cyan-400"} />
                </div>
                <div className="text-[6.5px] font-mono text-slate-500 mt-1 uppercase">LOCAL DATABASE</div>
                <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: isFailed(phase) ? "0%" : "100%" }} />
                </div>
                <div className="flex justify-between text-[6.5px] font-mono text-slate-400">
                  <span>VALIDATION</span>
                  <span className={isFailed(phase) ? "text-red-400" : "text-cyan-400"}>
                    {isFailed(phase) ? "OFFLINE" : "INDEPENDENT"}
                  </span>
                </div>
              </motion.div>

              {/* Station 2: Light Node */}
              <motion.div
                className="rounded-xl border p-2.5 flex flex-col gap-1 relative"
                style={{
                  borderColor: currentRole === "light" ? "#a855f7" : `${color}15`,
                  background: currentRole === "light" ? "rgba(168,85,247,0.06)" : "rgba(15,23,42,0.4)"
                }}
                animate={currentRole === "light" ? { scale: 1.02 } : { scale: 1 }}
              >
                <div className="flex items-center justify-between">
                  <div className="text-[8px] font-mono font-bold text-purple-400">LIGHT CLIENT (BETA)</div>
                  <User size={10} className="text-purple-400" />
                </div>
                <div className="text-[6.5px] font-mono text-slate-500 mt-1 uppercase">LOCAL DATA</div>
                <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: "20%" }} />
                </div>
                <div className="flex justify-between text-[6.5px] font-mono text-slate-400">
                  <span>DEPENDENCY</span>
                  <span className="text-purple-400">HEADERS ONLY</span>
                </div>
              </motion.div>

              {/* Station 3: Validator */}
              <motion.div
                className="rounded-xl border p-2.5 flex flex-col gap-1 relative"
                style={{
                  borderColor: currentRole === "validator" ? "#22c55e" : `${color}15`,
                  background: currentRole === "validator" ? "rgba(20,83,45,0.06)" : "rgba(15,23,42,0.4)"
                }}
                animate={currentRole === "validator" ? { scale: 1.02 } : { scale: 1 }}
              >
                <div className="flex items-center justify-between">
                  <div className="text-[8px] font-mono font-bold text-green-400">VALIDATOR (GAMMA)</div>
                  <Cpu size={10} className="text-green-400" />
                </div>
                <div className="text-[6.5px] font-mono text-slate-500 mt-1 uppercase">CONSENSUS ROLE</div>
                <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: "100%" }} />
                </div>
                <div className="flex justify-between text-[6.5px] font-mono text-slate-400">
                  <span>QUORUM</span>
                  <span className="text-green-400">SCP ACTIVE</span>
                </div>
              </motion.div>

            </div>

            {/* Visual network connectors and path messaging overlay */}
            <div className="h-14 border border-white/5 rounded-xl bg-slate-950/40 relative flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {/* Connector lines linking components */}
                <line x1="16%" y1="0%" x2="50%" y2="100%" stroke={`${color}20`} strokeWidth={1} />
                <line x1="50%" y1="0%" x2="50%" y2="100%" stroke={`${color}20`} strokeWidth={1} />
                <line x1="84%" y1="0%" x2="50%" y2="100%" stroke={`${color}20`} strokeWidth={1} />
              </svg>

              {/* Data packet visual animations */}
              <AnimatePresence>
                {packet && (
                  <motion.div
                    className="absolute w-2.5 h-2.5 rounded-full bg-amber-400 z-20 shadow-md shadow-amber-500/50"
                    animate={
                      packet.from === "light" && packet.to === "full" ? { left: ["50%", "16%"], top: ["100%", "0%"] }
                        : packet.from === "full" && packet.to === "light" ? { left: ["16%", "50%"], top: ["0%", "100%"] }
                        : packet.from === "validator" && packet.to === "peer" ? { left: ["84%", "50%"], top: ["0%", "100%"] }
                        : packet.from === "peer" && packet.to === "validator" ? { left: ["50%", "84%"], top: ["100%", "0%"] }
                        : {}
                    }
                    transition={{ duration: 0.8 }}
                  />
                )}
              </AnimatePresence>

              {/* Split transaction animation */}
              {phase === "split_tx" && (
                <div className="absolute inset-0 flex items-center justify-around z-20 pointer-events-none">
                  {["#22d3ee", "#a855f7", "#22c55e"].map((c, i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full shadow-lg"
                      style={{ backgroundColor: c }}
                      animate={{
                        top: ["100%", "0%"],
                        left: ["50%", i === 0 ? "16%" : i === 1 ? "50%" : "84%"],
                      }}
                      transition={{ duration: 1.2 }}
                    />
                  ))}
                </div>
              )}

              <div className="text-[7.5px] font-mono text-slate-500 uppercase tracking-widest z-10 bg-slate-950/80 px-2 py-0.5 border border-white/5 rounded">
                PEER-TO-PEER NETWORK COMMUNICATIONS OVERLAY
              </div>
            </div>

            {/* Explanation box */}
            <AnimatePresence>
              {["comparison","summary","split_tx"].includes(phase) && (
                <motion.div
                  key="compare"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border p-2 space-y-1"
                  style={{ borderColor: `${color}25`, background: `${color}05` }}
                >
                  <div className="text-[7.5px] font-mono text-cyan-400 font-bold">NODE ROLE CHARACTERISTICS & TRADE-OFFS</div>
                  <div className="grid grid-cols-3 gap-2 text-[7px] font-mono text-slate-400 leading-relaxed">
                    <div>
                      <span className="text-cyan-400 font-bold block">FULL NODE</span>
                      Check signature & balance constraints locally. High resource requirements.
                    </div>
                    <div>
                      <span className="text-purple-400 font-bold block">LIGHT CLIENT</span>
                      Obtains cryptographic proofs from network. Light storage, high efficiency.
                    </div>
                    <div>
                      <span className="text-green-400 font-bold block">VALIDATOR</span>
                      SCP consensus voting. Coordinates with slices to close ledgers.
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        )}

      </div>

      {/* Telemetry Footer */}
      <div className="grid grid-cols-2 gap-2">
        {/* Telemetry panel */}
        <div className="rounded-xl border p-2.5 space-y-0.5" style={{ borderColor: `${color}20`, background: `${color}05` }}>
          <div className="text-[7.5px] font-mono text-slate-500 uppercase tracking-widest mb-1">NODE RUNTIME TELEMETRY</div>
          {telemetry.map(([k, v]) => (
            <div key={k} className="flex justify-between text-[7.5px] font-mono">
              <span className="text-slate-500">{k}</span>
              <span style={{
                color: v.startsWith("HIGH") ? "#fbbf24"
                  : v.startsWith("INDEPENDENT") || v.startsWith("✓") ? "#4ade80"
                  : v.startsWith("EXTREMELY") ? "#4ade80"
                  : "#94a3b8"
              }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Status card */}
        <div
          className="rounded-xl border p-2.5 flex flex-col items-center justify-center gap-1.5"
          style={{
            borderColor: isFailed(phase) ? "#7f1d1d" : "#14532d",
            background: isFailed(phase) ? "rgba(127,29,29,0.12)" : "rgba(20,83,45,0.10)",
          }}
        >
          {isFailed(phase) ? (
            <>
              <ShieldAlert size={20} className="text-red-400" />
              <div className="text-[8px] font-mono text-red-400 font-bold text-center">FAULT TOLERANCE INTACT</div>
              <div className="text-[6.5px] font-mono text-red-400/60 text-center uppercase">1 NODE OFFLINE • NETWORK ACTIVE</div>
            </>
          ) : (
            <>
              <ShieldCheck size={20} className="text-green-400" />
              <div className="text-[8px] font-mono text-green-400 font-bold text-center">NODE CONTEXT ACTIVE</div>
              <div className="text-[6.5px] font-mono text-green-400/60 text-center uppercase">
                {currentRole} CLIENT STATE ACCEPTED
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function isFailed(phase: Phase) {
  return phase === "node_fail";
}

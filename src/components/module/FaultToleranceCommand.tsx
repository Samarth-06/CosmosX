import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Shield, ShieldAlert, Wifi, WifiOff, Zap, AlertTriangle, CheckCircle, XCircle, BarChart3 } from "lucide-react";

interface Props { color: string; }

type NodeState = "healthy" | "offline" | "byzantine" | "validating";
type SimMode = "cft" | "bft";

interface NodeDef {
  id: string;
  label: string;
  angle: number; // degrees on the ring
}

const NODE_DEFS: NodeDef[] = [
  { id: "A", label: "NODE A", angle: 270 },
  { id: "B", label: "NODE B", angle: 321 },
  { id: "C", label: "NODE C", angle: 13 },
  { id: "D", label: "NODE D", angle: 65 },
  { id: "E", label: "NODE E", angle: 116 },
  { id: "F", label: "NODE F", angle: 168 },
  { id: "G", label: "NODE G", angle: 219 },
];

interface SimStep {
  label: string;
  mode: SimMode;
  states: Record<string, NodeState>;
  msg: string;
  msgType: "info" | "success" | "warn" | "error";
  consensusOk: boolean;
  note?: string;
}

function buildSteps(): SimStep[] {
  const all: Record<string, NodeState> = { A: "healthy", B: "healthy", C: "healthy", D: "healthy", E: "healthy", F: "healthy", G: "healthy" };

  return [
    // ── HEALTHY ─────────────────────────────────────────────────────────────
    { label: "INIT", mode: "cft", states: { ...all }, msg: "7/7 NODES ONLINE — HEALTHY CONSENSUS NETWORK", msgType: "success", consensusOk: true, note: "All nodes are active and communicating." },
    { label: "CONSENSUS", mode: "cft", states: { ...all }, msg: "✓ CONSENSUS ROUND COMPLETE — ALL 7 NODES AGREE", msgType: "success", consensusOk: true },

    // ── CFT: CRASH FAULT TOLERANCE ──────────────────────────────────────────
    { label: "CFT MODE", mode: "cft", states: { ...all }, msg: "CRASH FAULT TOLERANCE MODE — NODE CRASHES OFFLINE", msgType: "info", consensusOk: true, note: "A crashed node stops responding. It sends nothing." },
    { label: "G OFFLINE", mode: "cft", states: { ...all, G: "offline" }, msg: "NODE G → OFFLINE  (6/7 ONLINE)", msgType: "info", consensusOk: true, note: "6 ≥ 4 required — ✓ QUORUM AVAILABLE" },
    { label: "F OFFLINE", mode: "cft", states: { ...all, G: "offline", F: "offline" }, msg: "NODE F → OFFLINE  (5/7 ONLINE)", msgType: "info", consensusOk: true, note: "5 ≥ 4 required — ✓ QUORUM AVAILABLE" },
    { label: "E OFFLINE", mode: "cft", states: { ...all, G: "offline", F: "offline", E: "offline" }, msg: "NODE E → OFFLINE  (4/7 ONLINE)  ⚠ MINIMUM QUORUM", msgType: "warn", consensusOk: true, note: "4 ≥ 4 required — ✓ AT QUORUM LIMIT" },
    { label: "QUORUM LOST", mode: "cft", states: { ...all, G: "offline", F: "offline", E: "offline", D: "offline" }, msg: "✕ NODE D OFFLINE — 3/7 ONLINE — QUORUM LOST", msgType: "error", consensusOk: false, note: "3 < 4 required — ✕ CONSENSUS HALTED" },

    // ── RESTORE ─────────────────────────────────────────────────────────────
    { label: "RESTORE", mode: "cft", states: { ...all }, msg: "NETWORK RESTORED — 7/7 ONLINE — TRANSITIONING TO BFT", msgType: "success", consensusOk: true },

    // ── BFT: BYZANTINE FAULT TOLERANCE ─────────────────────────────────────
    { label: "BFT MODE", mode: "bft", states: { ...all }, msg: "BYZANTINE FAULT TOLERANCE MODE — MALICIOUS NODES", msgType: "info", consensusOk: true, note: "A Byzantine node may lie, equivocate, or send conflicting messages." },
    { label: "G BYZANTINE", mode: "bft", states: { ...all, G: "byzantine" }, msg: "NODE G ⚠ BYZANTINE — SENDING CONFLICTING MESSAGES", msgType: "warn", consensusOk: true, note: "1 Byzantine / 7 nodes — f=1 ≤ 2 tolerance — ✓ WITHIN TOLERANCE" },
    { label: "F BYZANTINE", mode: "bft", states: { ...all, G: "byzantine", F: "byzantine" }, msg: "NODE F ⚠ BYZANTINE — 2 FAULTY NODES", msgType: "warn", consensusOk: true, note: "f=2 ≤ 2 — ✓ AT MAXIMUM TOLERANCE LIMIT" },
    { label: "E BYZANTINE", mode: "bft", states: { ...all, G: "byzantine", F: "byzantine", E: "byzantine" }, msg: "⚠ NODE E BYZANTINE — 3 FAULTY — THRESHOLD EXCEEDED", msgType: "error", consensusOk: false, note: "f=3 > 2 — ⚠ SAFETY GUARANTEES MAY NO LONGER HOLD" },

    // ── RESTORE & COMPARISON ────────────────────────────────────────────────
    { label: "RESTORED", mode: "bft", states: { ...all }, msg: "NETWORK RESTORED — ALL 7 NODES HONEST AND ONLINE", msgType: "success", consensusOk: true },
  ];
}

const STEPS = buildSteps();

function getNodePos(angle: number, rx: number, ry: number, cx: number, cy: number) {
  const rad = (angle * Math.PI) / 180;
  return { x: cx + rx * Math.cos(rad), y: cy + ry * Math.sin(rad) };
}

const NODE_COLOR: Record<NodeState, { ring: string; fill: string; text: string; glow: string }> = {
  healthy:    { ring: "#22c55e", fill: "rgba(20,83,45,0.85)",   text: "#4ade80", glow: "#22c55e40" },
  validating: { ring: "#06b6d4", fill: "rgba(8,51,68,0.85)",    text: "#67e8f9", glow: "#06b6d440" },
  offline:    { ring: "#475569", fill: "rgba(30,41,59,0.85)",   text: "#64748b", glow: "transparent" },
  byzantine:  { ring: "#f59e0b", fill: "rgba(120,53,15,0.90)",  text: "#fbbf24", glow: "#f59e0b40" },
};

const STATE_ICON: Record<NodeState, string> = {
  healthy: "✓", validating: "⚙", offline: "◌", byzantine: "⚠",
};

export default function FaultToleranceCommand({ color }: Props) {
  const [stepIdx, setStepIdx] = useState(0);
  const [userMode, setUserMode] = useState<SimMode | null>(null);
  const [autoPlaying, setAutoPlaying] = useState(true);
  const [showFormula, setShowFormula] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const step = STEPS[stepIdx];

  const getStepsForMode = useCallback((m: SimMode) => {
    return STEPS.filter(s => s.mode === m || s.label === "INIT" || s.label === "RESTORE" || s.label === "RESTORED" || s.label === "CONSENSUS");
  }, []);

  // Auto-play loop
  useEffect(() => {
    if (!autoPlaying) return;
    const delays = [2200, 2000, 2400, 2000, 2000, 2200, 2600, 2500, 2300, 2200, 2400, 2600, 2200, 3000];
    const delay = delays[stepIdx % delays.length] || 2200;
    timerRef.current = setTimeout(() => {
      setStepIdx(i => {
        const next = i + 1;
        if (next >= STEPS.length) {
          setShowFormula(true);
          setShowComparison(true);
          return 0;
        }
        if (next === STEPS.length - 3) setShowFormula(true);
        if (next === STEPS.length - 2) setShowComparison(true);
        return next;
      });
    }, delay);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [stepIdx, autoPlaying]);

  const switchMode = (m: SimMode) => {
    setUserMode(m);
    setAutoPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    // Jump to first step of that mode
    const firstIdx = STEPS.findIndex(s => s.mode === m && s.label !== "INIT" && s.label !== "CONSENSUS");
    setStepIdx(Math.max(0, firstIdx));
    setShowFormula(m === "bft");
    setShowComparison(true);
  };

  const resume = () => {
    setUserMode(null);
    setAutoPlaying(true);
    setStepIdx(0);
    setShowFormula(false);
    setShowComparison(false);
  };

  const nodeStates = step.states;
  const activeMode = userMode ?? step.mode;
  const totalNodes = 7;
  const onlineCount = Object.values(nodeStates).filter(s => s === "healthy" || s === "validating").length;
  const offlineCount = Object.values(nodeStates).filter(s => s === "offline").length;
  const byzantineCount = Object.values(nodeStates).filter(s => s === "byzantine").length;
  const quorumRequired = Math.floor(totalNodes / 2) + 1; // 4
  const bftTolerance = Math.floor((totalNodes - 1) / 3); // 2
  const honestCount = totalNodes - byzantineCount;

  // CFT / BFT status
  const cftStatus = onlineCount >= quorumRequired;
  const bftStatus = byzantineCount <= bftTolerance;
  const consensusOk = step.consensusOk;

  // SVG dimensions
  const SVG_W = 260;
  const SVG_H = 220;
  const CX = 130, CY = 108;
  const RX = 88, RY = 78;

  const msgColors = {
    info:    { border: "#1e3a5f", bg: "rgba(15,23,42,0.85)",     text: "#94a3b8" },
    success: { border: "#14532d", bg: "rgba(20,83,45,0.18)",     text: "#4ade80" },
    warn:    { border: "#78350f", bg: "rgba(120,53,15,0.22)",    text: "#fbbf24" },
    error:   { border: "#7f1d1d", bg: "rgba(127,29,29,0.22)",   text: "#f87171" },
  }[step.msgType];

  // 3f+1 examples
  const bftExamples = [
    { f: 1, n: 4, honest: 3 },
    { f: 2, n: 7, honest: 5 },
    { f: 3, n: 10, honest: 7 },
  ];

  return (
    <div
      className="rounded-2xl border flex flex-col gap-2.5 p-3.5 h-full relative overflow-hidden"
      style={{ borderColor: `${color}30`, background: "linear-gradient(150deg,rgba(2,6,23,0.98),rgba(3,7,18,0.96))" }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <div className="text-[10px] font-mono font-bold tracking-widest uppercase" style={{ color }}>
            NETWORK FAULT TOLERANCE COMMAND
          </div>
          <div className="text-[7.5px] font-mono text-slate-500 tracking-widest uppercase">
            GALACTIC CONSENSUS RESILIENCE MONITOR
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {(["cft", "bft"] as SimMode[]).map(m => (
            <button key={m} onClick={() => switchMode(m)}
              className="text-[7.5px] font-mono font-bold px-2.5 py-1 rounded border uppercase tracking-wider transition cursor-pointer"
              style={{
                borderColor: activeMode === m ? color : "#1e293b",
                backgroundColor: activeMode === m ? `${color}15` : "transparent",
                color: activeMode === m ? color : "#64748b",
              }}>
              {m === "cft" ? "CRASH FAULT — CFT" : "BYZANTINE FAULT — BFT"}
            </button>
          ))}
          {!autoPlaying && (
            <button onClick={resume}
              className="text-[7px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 border border-amber-900/40 px-1.5 py-0.5 rounded cursor-pointer">
              <RefreshCw size={8} /> AUTO PLAY
            </button>
          )}
        </div>
      </div>

      {/* ── Progress message ────────────────────────────────────────────── */}
      <motion.div key={step.msg} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
        className="text-[8.5px] font-mono rounded-lg px-3 py-1.5 border"
        style={{ color: msgColors.text, borderColor: msgColors.border, background: msgColors.bg }}>
        {step.msg}
      </motion.div>

      {/* ── Main two-column body ────────────────────────────────────────── */}
      <div className="flex gap-3 flex-1 min-h-0">

        {/* LEFT — Node ring + consensus core */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="relative border border-white/5 rounded-xl bg-slate-950/70 flex items-center justify-center overflow-hidden"
            style={{ minHeight: 210 }}>
            {/* CONSENSUS STATUS VISUALIZER note */}
            <div className="absolute top-1.5 left-2 text-[5.5px] font-mono text-slate-600 uppercase tracking-widest">
              CONSENSUS STATUS VISUALIZER · NOT A CENTRAL SERVER
            </div>

            <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="overflow-visible">
              {/* Links from nodes to center */}
              {NODE_DEFS.map(nd => {
                const pos = getNodePos(nd.angle, RX, RY, CX, CY);
                const state = nodeStates[nd.id] as NodeState;
                const linkColor = state === "healthy" ? `${color}55`
                  : state === "byzantine" ? "#f59e0b55"
                  : "#33415555";
                return (
                  <motion.line key={nd.id}
                    x1={CX} y1={CY} x2={pos.x} y2={pos.y}
                    stroke={linkColor} strokeWidth={1.2}
                    animate={state === "byzantine" ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
                    transition={{ repeat: Infinity, duration: 0.8 }} />
                );
              })}

              {/* Pulse rings from center when consensus ok */}
              {consensusOk && [0, 1].map(i => (
                <motion.circle key={i} cx={CX} cy={CY} r={18}
                  fill="none" stroke={color} strokeWidth={1.5}
                  animate={{ r: [18, 44], opacity: [0.7, 0] }}
                  transition={{ repeat: Infinity, duration: 1.8, delay: i * 0.9, ease: "easeOut" }} />
              ))}

              {/* Consensus Core */}
              <circle cx={CX} cy={CY} r={20} fill="rgba(2,6,23,0.95)"
                stroke={consensusOk ? color : "#ef4444"} strokeWidth={1.5} />
              <text x={CX} y={CY - 3} textAnchor="middle" dominantBaseline="middle"
                fill={consensusOk ? color : "#ef4444"} fontSize={7} fontFamily="monospace" fontWeight="bold">
                {consensusOk ? "✓" : "✕"}
              </text>
              <text x={CX} y={CY + 7} textAnchor="middle" dominantBaseline="middle"
                fill={consensusOk ? color : "#ef4444"} fontSize={5} fontFamily="monospace">
                {consensusOk ? "CONSENSUS" : "HALTED"}
              </text>

              {/* Nodes */}
              {NODE_DEFS.map(nd => {
                const pos = getNodePos(nd.angle, RX, RY, CX, CY);
                const state = nodeStates[nd.id] as NodeState;
                const nc = NODE_COLOR[state];
                const icon = STATE_ICON[state];
                const isPulsing = state === "validating" || state === "byzantine";
                return (
                  <g key={nd.id}>
                    {/* Glow */}
                    <circle cx={pos.x} cy={pos.y} r={14} fill={nc.glow} />
                    {/* Node circle */}
                    <motion.circle cx={pos.x} cy={pos.y} r={12}
                      fill={nc.fill} stroke={nc.ring} strokeWidth={1.8}
                      animate={isPulsing ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                      transition={{ repeat: Infinity, duration: 1 }} />
                    {/* State icon */}
                    <text x={pos.x} y={pos.y - 1} textAnchor="middle" dominantBaseline="middle"
                      fill={nc.text} fontSize={8} fontFamily="monospace" fontWeight="bold">{icon}</text>
                    {/* Label */}
                    <text x={pos.x} y={pos.y + 21} textAnchor="middle" dominantBaseline="middle"
                      fill="#64748b" fontSize={5.5} fontFamily="monospace">{nd.label}</text>
                  </g>
                );
              })}
            </svg>

            {/* Byzantine conflicting message packets */}
            {step.mode === "bft" && byzantineCount > 0 && (
              <div className="absolute bottom-1.5 right-2 flex flex-col gap-0.5">
                {Object.entries(nodeStates).filter(([, s]) => s === "byzantine").map(([id]) => (
                  <div key={id} className="flex items-center gap-1 text-[6px] font-mono text-amber-400/80">
                    <span className="text-amber-400 font-bold">{id}</span>
                    <span className="text-slate-600">→ X</span>
                    <span className="text-slate-600">→ Y</span>
                    <span className="text-slate-600">→ Z</span>
                    <span className="text-amber-400/50">⚠ CONFLICTING</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── CFT Threshold Meter ─────────────────────────────────────── */}
          {step.mode === "cft" && (
            <motion.div key="cft-meter" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="rounded-xl border border-white/5 bg-slate-950/60 p-2.5">
              <div className="text-[7.5px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
                SIMPLIFIED CFT MAJORITY-QUORUM METER
              </div>
              <div className="flex items-end gap-1.5 flex-wrap">
                {[7, 6, 5, 4, 3, 2, 1].map(n => {
                  const isThreshold = n === quorumRequired;
                  const isActive = onlineCount === n;
                  const ok = n >= quorumRequired;
                  return (
                    <div key={n} className="flex flex-col items-center gap-0.5">
                      <div
                        className="text-[5.5px] font-mono font-bold"
                        style={{ color: ok ? "#4ade80" : "#f87171" }}>
                        {ok ? "✓" : "✕"}
                      </div>
                      <div
                        className="w-5 rounded-sm border transition-all duration-500"
                        style={{
                          height: 24 + n * 4,
                          borderColor: isThreshold ? "#fbbf24" : (ok ? "#22c55e50" : "#ef444450"),
                          backgroundColor: isActive
                            ? (ok ? "#22c55e40" : "#ef444440")
                            : (ok ? "#22c55e15" : "#ef444415"),
                          boxShadow: isActive ? `0 0 8px ${ok ? "#22c55e" : "#ef4444"}60` : "none",
                        }} />
                      <div className="text-[5.5px] font-mono" style={{ color: ok ? "#22c55e" : "#ef4444" }}>
                        {n}
                      </div>
                      {isThreshold && (
                        <div className="text-[4.5px] font-mono text-amber-400 text-center leading-tight">
                          THRESH
                        </div>
                      )}
                    </div>
                  );
                })}
                <div className="ml-2 text-[7px] font-mono text-slate-500 leading-relaxed">
                  <div className="text-slate-400 font-bold">REQUIRED</div>
                  <div className="text-amber-400">⌊7÷2⌋+1 = <span className="font-bold text-white">4</span></div>
                  <div className="mt-1" style={{ color: cftStatus ? "#4ade80" : "#f87171" }}>
                    {onlineCount} {cftStatus ? "≥" : "<"} 4
                  </div>
                  <div className="font-bold" style={{ color: cftStatus ? "#4ade80" : "#f87171" }}>
                    {cftStatus ? "✓ QUORUM" : "✕ NO QUORUM"}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── BFT formula ─────────────────────────────────────────────── */}
          {step.mode === "bft" && showFormula && (
            <motion.div key="bft-formula" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="rounded-xl border border-amber-900/30 bg-amber-950/10 p-2.5">
              <div className="text-[7.5px] font-mono text-amber-400 uppercase tracking-widest mb-1.5">
                CLASSIC BFT MODEL — n ≥ 3f + 1
              </div>
              <div className="grid grid-cols-3 gap-2">
                {bftExamples.map(ex => (
                  <div key={ex.f}
                    className="rounded-lg border border-white/5 bg-slate-950/50 p-1.5 text-center">
                    <div className="text-[5.5px] font-mono text-slate-500 uppercase">f = {ex.f} fault{ex.f > 1 ? "s" : ""}</div>
                    <div className="text-[8px] font-mono font-bold text-white mt-0.5">n ≥ {ex.n}</div>
                    <div className="flex justify-center gap-0.5 mt-1 flex-wrap">
                      {Array.from({ length: ex.honest }).map((_, i) => (
                        <span key={i} className="text-[6px] text-green-400">✓</span>
                      ))}
                      {Array.from({ length: ex.f }).map((_, i) => (
                        <span key={i} className="text-[6px] text-amber-400">⚠</span>
                      ))}
                    </div>
                    <div className="text-[5px] font-mono text-slate-500 mt-0.5">{ex.honest} honest + {ex.f} byzantine</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* RIGHT — Telemetry + Comparison */}
        <div className="w-44 flex flex-col gap-2 shrink-0">

          {/* Live Telemetry */}
          <div className="rounded-xl border border-white/5 bg-slate-950/60 p-2.5">
            <div className="text-[7.5px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">
              FAULT TELEMETRY
            </div>
            {activeMode === "cft" ? (
              <div className="space-y-1">
                {[
                  ["MODE",     "CFT"],
                  ["TOTAL",    "7 NODES"],
                  ["ONLINE",   `${onlineCount} / 7`],
                  ["OFFLINE",  `${offlineCount} / 7`],
                  ["QUORUM",   `${quorumRequired} REQ`],
                  ["STATUS",   cftStatus ? "✓ AVAILABLE" : "✕ HALTED"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-[7px] font-mono">
                    <span className="text-slate-500">{k}</span>
                    <span style={{
                      color: v.startsWith("✓") ? "#4ade80"
                        : v.startsWith("✕") ? "#f87171"
                        : v === "CFT" ? color
                        : "#94a3b8"
                    }}>{v}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {[
                  ["MODE",      "BFT"],
                  ["TOTAL",     "7 NODES"],
                  ["HONEST",    `${honestCount} / 7`],
                  ["BYZANTINE", `${byzantineCount} / 7`],
                  ["MAX f",     `${bftTolerance} FAULTS`],
                  ["n ≥ 3f+1",  "7 ≥ 7 ✓"],
                  ["STATUS",    bftStatus ? (byzantineCount === bftTolerance ? "⚠ AT LIMIT" : "✓ IN TOLERANCE") : "⚠ EXCEEDED"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-[7px] font-mono">
                    <span className="text-slate-500">{k}</span>
                    <span style={{
                      color: v.startsWith("✓") ? "#4ade80"
                        : v.startsWith("⚠ EXCEEDED") ? "#f87171"
                        : v.startsWith("⚠") ? "#fbbf24"
                        : v === "BFT" ? color
                        : "#94a3b8"
                    }}>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Consensus pill */}
          <div
            className="rounded-xl border p-2.5 flex flex-col items-center gap-1"
            style={{
              borderColor: consensusOk ? "#14532d" : "#7f1d1d",
              background: consensusOk ? "rgba(20,83,45,0.15)" : "rgba(127,29,29,0.15)",
            }}>
            {consensusOk
              ? <><CheckCircle size={18} className="text-green-400" /><div className="text-[7.5px] font-mono text-green-400 font-bold text-center">CONSENSUS ACTIVE</div></>
              : <><XCircle size={18} className="text-red-400" /><div className="text-[7.5px] font-mono text-red-400 font-bold text-center">CONSENSUS {activeMode === "cft" ? "HALTED" : "UNSAFE"}</div></>
            }
            {step.note && (
              <div className="text-[6px] font-mono text-slate-500 text-center leading-tight mt-0.5">{step.note}</div>
            )}
          </div>

          {/* Node legend */}
          <div className="rounded-xl border border-white/5 bg-slate-950/40 p-2 space-y-1">
            <div className="text-[6.5px] font-mono text-slate-600 uppercase tracking-widest">NODE STATES</div>
            {(["healthy", "offline", "byzantine"] as NodeState[]).map(s => {
              const nc = NODE_COLOR[s];
              const icons = { healthy: "✓", offline: "◌", byzantine: "⚠" };
              const labels = { healthy: "HONEST / ACTIVE", offline: "OFFLINE / CRASHED", byzantine: "BYZANTINE FAULTY" };
              return (
                <div key={s} className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0"
                    style={{ borderColor: nc.ring, backgroundColor: nc.fill }}>
                    <span className="text-[5px]" style={{ color: nc.text }}>{icons[s as keyof typeof icons]}</span>
                  </div>
                  <span className="text-[6px] font-mono text-slate-500">{labels[s as keyof typeof labels]}</span>
                </div>
              );
            })}
          </div>

          {/* Step navigator (manual) */}
          {!autoPlaying && (
            <div className="flex gap-1">
              <button onClick={() => setStepIdx(i => Math.max(0, i - 1))}
                className="flex-1 text-[6.5px] font-mono border border-white/10 rounded py-1 text-slate-400 hover:text-white hover:border-white/20 cursor-pointer">
                ◀ PREV
              </button>
              <button onClick={() => setStepIdx(i => Math.min(STEPS.length - 1, i + 1))}
                className="flex-1 text-[6.5px] font-mono border border-white/10 rounded py-1 text-slate-400 hover:text-white hover:border-white/20 cursor-pointer">
                NEXT ▶
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── CFT vs BFT Comparison Panel ────────────────────────────────── */}
      <AnimatePresence>
        {showComparison && (
          <motion.div key="comparison" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            className="rounded-xl border border-white/5 bg-slate-950/50 p-2.5 grid grid-cols-2 gap-3">
            <div>
              <div className="text-[7px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <WifiOff size={8} className="text-slate-400" /> CRASH FAULT TOLERANCE
              </div>
              <div className="space-y-0.5 text-[6.5px] font-mono text-slate-500 leading-relaxed">
                <div><span className="text-slate-300">FAILURE:</span> NODE STOPS RESPONDING</div>
                <div><span className="text-slate-300">VISUAL:</span> <span className="text-slate-400">A✓ B✓ </span><span className="text-slate-600">C◌</span></div>
                <div><span className="text-slate-300">CHALLENGE:</span> MAINTAIN QUORUM</div>
                <div className="rounded border border-green-950/40 bg-green-950/8 px-1.5 py-0.5 mt-1">
                  <span className="text-green-400 font-bold">SIMPLE MAJORITY</span>
                  <span className="text-slate-500"> — ⌊n/2⌋+1</span>
                </div>
              </div>
            </div>
            <div>
              <div className="text-[7px] font-mono font-bold text-amber-400/80 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <ShieldAlert size={8} className="text-amber-400" /> BYZANTINE FAULT TOLERANCE
              </div>
              <div className="space-y-0.5 text-[6.5px] font-mono text-slate-500 leading-relaxed">
                <div><span className="text-slate-300">FAILURE:</span> NODE LIES / EQUIVOCATES</div>
                <div><span className="text-slate-300">VISUAL:</span> <span className="text-amber-400">⚠</span><span className="text-slate-500">→X →Y →Z</span></div>
                <div><span className="text-slate-300">CHALLENGE:</span> AGREE DESPITE LIES</div>
                <div className="rounded border border-amber-950/40 bg-amber-950/8 px-1.5 py-0.5 mt-1">
                  <span className="text-amber-400 font-bold">n ≥ 3f + 1</span>
                  <span className="text-slate-500"> — CLASSIC MODEL</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

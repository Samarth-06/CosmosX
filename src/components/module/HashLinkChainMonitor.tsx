import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ShieldAlert, RefreshCw, Link, Link2Off, AlertTriangle, CheckCircle } from "lucide-react";

interface Props {
  color: string;
}

type Phase =
  | "init"
  | "build41"
  | "hash41"
  | "transfer_41_42"
  | "build42"
  | "hash42"
  | "transfer_42_43"
  | "build43"
  | "hash43"
  | "chain_complete"
  | "scan"
  | "scan_done"
  | "tamper"
  | "rehash41"
  | "detect_break"
  | "cascade_rebuild42"
  | "cascade_break43"
  | "restore"
  | "loop_wait";

const HASH41_ORIG  = "A7F9...42CD";
const HASH42_ORIG  = "F82C...91AB";
const HASH43_ORIG  = "C39E...27DF";
const HASH41_NEW   = "91BE...73FA";
const HASH42_NEW   = "7CA1...44BE";

interface BlockState {
  num: number;
  tx: string;
  prevHash: string;
  ownHash: string;
  tampered?: boolean;
}

function BlockCard({
  block,
  highlight,
  color,
  prevHashOverride,
  ownHashOverride,
  dimmed,
}: {
  block: BlockState;
  highlight?: "hash" | "prev" | "both" | "tamper";
  color: string;
  prevHashOverride?: string;
  ownHashOverride?: string;
  dimmed?: boolean;
}) {
  const prevH = prevHashOverride ?? block.prevHash;
  const ownH  = ownHashOverride  ?? block.ownHash;

  return (
    <motion.div
      layout
      className="rounded-xl border p-3 flex flex-col gap-1.5 min-w-[130px] flex-1 max-w-[170px]"
      style={{
        borderColor: dimmed ? "#1e293b" : `${color}40`,
        background: dimmed
          ? "rgba(15,23,42,0.5)"
          : "linear-gradient(145deg,rgba(15,23,42,0.95),rgba(15,23,42,0.8))",
        opacity: dimmed ? 0.45 : 1,
      }}
    >
      <div className="text-[9px] font-mono font-bold tracking-widest uppercase text-center" style={{ color }}>
        BLOCK #{block.num}
      </div>
      <div className="border-t border-white/5 pt-1.5 space-y-1">
        <div className="text-[8px] font-mono text-slate-500 uppercase tracking-wide">TX DATA</div>
        <div className="text-[9px] font-mono text-slate-300">{block.tx}</div>
      </div>
      <div className="border-t border-white/5 pt-1.5 space-y-0.5">
        <div className="text-[8px] font-mono text-slate-500 uppercase tracking-wide">PREV HASH</div>
        <motion.div
          className="text-[8.5px] font-mono rounded px-1 py-0.5"
          style={{
            color:
              highlight === "prev" || highlight === "both"
                ? "#22d3ee"
                : block.tampered
                ? "#f87171"
                : "#94a3b8",
            background:
              highlight === "prev" || highlight === "both"
                ? "rgba(34,211,238,0.08)"
                : "transparent",
          }}
        >
          {prevH || "000...000"}
        </motion.div>
      </div>
      <div className="border-t border-white/5 pt-1.5 space-y-0.5">
        <div className="text-[8px] font-mono text-slate-500 uppercase tracking-wide">OWN HASH</div>
        <motion.div
          className="text-[8.5px] font-mono rounded px-1 py-0.5"
          style={{
            color:
              highlight === "hash" || highlight === "both"
                ? "#22d3ee"
                : block.tampered
                ? "#f87171"
                : "#94a3b8",
            background:
              highlight === "hash" || highlight === "both"
                ? "rgba(34,211,238,0.12)"
                : block.tampered
                ? "rgba(248,113,113,0.08)"
                : "transparent",
            boxShadow:
              (highlight === "hash" || highlight === "both") && !block.tampered
                ? `0 0 8px rgba(34,211,238,0.4)`
                : "none",
          }}
        >
          {ownH || "—"}
        </motion.div>
      </div>
    </motion.div>
  );
}

function Connector({
  valid,
  broken,
  animate: anim,
  label,
}: {
  valid?: boolean;
  broken?: boolean;
  animate?: boolean;
  label?: string;
}) {
  const color = broken ? "#ef4444" : valid ? "#22c55e" : "#475569";
  return (
    <div className="flex flex-col items-center justify-center gap-0.5 px-1" style={{ minWidth: 36 }}>
      {label && (
        <div className="text-[7px] font-mono text-slate-600 tracking-wide text-center truncate max-w-[60px]">
          {label}
        </div>
      )}
      <div className="relative flex flex-col items-center gap-0.5">
        <motion.div
          className="w-0.5 rounded-full"
          style={{ height: 28, backgroundColor: color }}
          animate={anim ? { opacity: [0.3, 1, 0.3] } : undefined}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        {broken ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-red-400"
          >
            <Link2Off size={12} />
          </motion.div>
        ) : (
          <motion.div
            style={{ color }}
            animate={anim ? { opacity: [0.5, 1, 0.5] } : undefined}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            <Link size={10} />
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function HashLinkChainMonitor({ color }: Props) {
  const [phase, setPhase] = useState<Phase>("init");
  const [packetVisible, setPacketVisible] = useState(false);
  const [packetLabel, setPacketLabel] = useState("");
  const [packetFromTo, setPacketFromTo] = useState<"41to42" | "42to43">("41to42");
  const [progressMsg, setProgressMsg] = useState("INITIALIZING HASH-LINK CHAIN MONITOR...");

  // Telemetry
  const validLinks = (() => {
    if (["cascade_break43"].includes(phase)) return 0;
    if (["detect_break", "cascade_rebuild42"].includes(phase)) return 1;
    if (["tamper", "rehash41"].includes(phase)) return 1;
    if (["scan_done", "chain_complete", "restore", "loop_wait"].includes(phase)) return 2;
    if (["scan"].includes(phase)) return 2;
    return 0;
  })();
  const brokenLinks = 2 - validLinks;

  // Block display states
  const block41: BlockState = {
    num: 41, tx: "A → B : 100",
    prevHash: "82AC...71F",
    ownHash: ["rehash41", "detect_break", "cascade_rebuild42", "cascade_break43"].includes(phase) ? HASH41_NEW : HASH41_ORIG,
    tampered: ["tamper", "rehash41", "detect_break", "cascade_rebuild42", "cascade_break43"].includes(phase),
  };
  const block42: BlockState = {
    num: 42, tx: "B → C : 50",
    prevHash: ["cascade_rebuild42", "cascade_break43"].includes(phase) ? HASH41_NEW : HASH41_ORIG,
    ownHash: ["cascade_rebuild42", "cascade_break43"].includes(phase) ? HASH42_NEW : HASH42_ORIG,
  };
  const block43: BlockState = {
    num: 43, tx: "C → D : 25",
    prevHash: HASH42_ORIG,
    ownHash: HASH43_ORIG,
  };

  // Link states
  const link4142Valid = !["detect_break", "cascade_rebuild42", "cascade_break43"].includes(phase);
  const link4142Broken = ["detect_break"].includes(phase);
  const link4243Valid = !["cascade_break43"].includes(phase) && ["chain_complete", "scan", "scan_done", "restore", "loop_wait"].includes(phase);
  const link4243Broken = ["cascade_break43"].includes(phase);

  useEffect(() => {
    const seq: { phase: Phase; delay: number; msg?: string }[] = [
      { phase: "init",              delay: 0,     msg: "INITIALIZING HASH-LINK CHAIN MONITOR..." },
      { phase: "build41",           delay: 1500,  msg: "BUILDING BLOCK #41..." },
      { phase: "hash41",            delay: 3500,  msg: "COMPUTING HASH(#41)..." },
      { phase: "transfer_41_42",    delay: 5500,  msg: "TRANSFERRING HASH(#41) → BLOCK #42..." },
      { phase: "build42",           delay: 7500,  msg: "BLOCK #42 STORES HASH(#41) AS PREV HASH" },
      { phase: "hash42",            delay: 9000,  msg: "COMPUTING HASH(#42)..." },
      { phase: "transfer_42_43",    delay: 11000, msg: "TRANSFERRING HASH(#42) → BLOCK #43..." },
      { phase: "build43",           delay: 13000, msg: "BLOCK #43 STORES HASH(#42) AS PREV HASH" },
      { phase: "hash43",            delay: 14500, msg: "COMPUTING HASH(#43)..." },
      { phase: "chain_complete",    delay: 16500, msg: "CHAIN ASSEMBLED — RUNNING INTEGRITY SCAN..." },
      { phase: "scan",              delay: 18000, msg: "SCANNING HASH POINTERS..." },
      { phase: "scan_done",         delay: 20500, msg: "✓ ALL HASH POINTERS VALID — CHAIN CONSISTENT" },
      { phase: "tamper",            delay: 23500, msg: "⚠ UNAUTHORIZED MODIFICATION DETECTED IN BLOCK #41" },
      { phase: "rehash41",          delay: 26000, msg: "RECOMPUTING BLOCK #41 HASH..." },
      { phase: "detect_break",      delay: 28500, msg: "✕ HASH MISMATCH — LINK #41→#42 BROKEN" },
      { phase: "cascade_rebuild42", delay: 32000, msg: "ATTEMPTING REBUILD: BLOCK #42 PREV HASH UPDATED..." },
      { phase: "cascade_break43",   delay: 35000, msg: "✕ HASH CASCADE — LINK #42→#43 NOW BROKEN" },
      { phase: "restore",           delay: 38500, msg: "RESTORING ORIGINAL CHAIN STATE..." },
      { phase: "loop_wait",         delay: 41000, msg: "✓ CHAIN RESTORED — ALL LINKS VALID" },
    ];

    let timers: NodeJS.Timeout[] = [];

    const run = () => {
      seq.forEach(({ phase: p, delay, msg }) => {
        const t = setTimeout(() => {
          setPhase(p);
          if (msg) setProgressMsg(msg);

          if (p === "transfer_41_42") {
            setPacketLabel(HASH41_ORIG);
            setPacketFromTo("41to42");
            setPacketVisible(true);
            setTimeout(() => setPacketVisible(false), 1800);
          }
          if (p === "transfer_42_43") {
            setPacketLabel(HASH42_ORIG);
            setPacketFromTo("42to43");
            setPacketVisible(true);
            setTimeout(() => setPacketVisible(false), 1800);
          }
        }, delay);
        timers.push(t);
      });

      const loopT = setTimeout(() => {
        timers.forEach(clearTimeout);
        timers = [];
        run();
      }, 43500);
      timers.push(loopT);
    };

    run();
    return () => timers.forEach(clearTimeout);
  }, []);

  const showBlock41 = !["init"].includes(phase);
  const showBlock42 = !["init", "build41", "hash41"].includes(phase);
  const showBlock43 = !["init", "build41", "hash41", "transfer_41_42", "build42", "hash42"].includes(phase);

  const block41Highlight: "hash" | "prev" | "both" | "tamper" | undefined =
    phase === "hash41" ? "hash"
    : phase === "transfer_41_42" ? "hash"
    : phase === "chain_complete" || phase === "scan" ? "both"
    : undefined;

  const block42Highlight: "hash" | "prev" | "both" | undefined =
    phase === "build42" ? "prev"
    : phase === "hash42" ? "hash"
    : phase === "transfer_42_43" ? "hash"
    : phase === "scan" ? "both"
    : undefined;

  const block43Highlight: "hash" | "prev" | "both" | undefined =
    phase === "build43" ? "prev"
    : phase === "hash43" ? "hash"
    : phase === "scan" ? "both"
    : undefined;

  return (
    <div className="rounded-2xl border flex flex-col gap-3 p-4 h-full"
      style={{ borderColor: `${color}30`, background: "linear-gradient(145deg,rgba(2,6,23,0.98),rgba(5,10,30,0.95))" }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono font-bold tracking-widest uppercase" style={{ color }}>
            HASH-LINK CHAIN MONITOR
          </div>
          <div className="text-[8px] font-mono text-slate-500 tracking-widest uppercase mt-0.5">
            HOW ONE BLOCK CRYPTOGRAPHICALLY POINTS TO THE PREVIOUS BLOCK
          </div>
        </div>
        <motion.div
          animate={{ rotate: ["scan", "rehash41"].includes(phase) ? 360 : 0 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw size={14} style={{ color: `${color}80` }} />
        </motion.div>
      </div>

      {/* Progress message */}
      <motion.div
        key={progressMsg}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[8.5px] font-mono rounded-lg px-3 py-1.5 border"
        style={{
          color: phase.includes("break") || phase === "tamper" ? "#fbbf24"
            : phase === "detect_break" || phase === "cascade_break43" ? "#f87171"
            : phase === "scan_done" || phase === "restore" || phase === "loop_wait" ? "#4ade80"
            : color,
          borderColor: phase.includes("break") || phase === "tamper" ? "#78350f"
            : phase === "detect_break" || phase === "cascade_break43" ? "#7f1d1d"
            : phase === "scan_done" || phase === "restore" || phase === "loop_wait" ? "#14532d"
            : `${color}25`,
          background: phase.includes("break") || phase === "tamper" ? "rgba(120,53,15,0.12)"
            : phase === "detect_break" || phase === "cascade_break43" ? "rgba(127,29,29,0.12)"
            : phase === "scan_done" || phase === "restore" || phase === "loop_wait" ? "rgba(20,83,45,0.12)"
            : `${color}08`,
        }}
      >
        {progressMsg}
      </motion.div>

      {/* Hash Packet Fly Animation */}
      <AnimatePresence>
        {packetVisible && (
          <motion.div
            key="packet"
            initial={{ opacity: 0, x: packetFromTo === "41to42" ? -40 : -40, scale: 0.7 }}
            animate={{ opacity: [0, 1, 1, 0], x: [packetFromTo === "41to42" ? -40 : -40, 0, 40, 80], scale: [0.7, 1, 1, 0.7] }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
            className="absolute left-1/3 top-32 z-20 text-[8px] font-mono font-bold px-2 py-1 rounded-lg border"
            style={{ borderColor: "#22d3ee80", color: "#22d3ee", background: "rgba(34,211,238,0.12)", boxShadow: "0 0 12px rgba(34,211,238,0.3)" }}
          >
            [{packetLabel}]
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chain Visualization */}
      <div className="flex items-start justify-center gap-1 flex-1 relative">
        <AnimatePresence>
          {showBlock41 && (
            <motion.div key="b41" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
              <BlockCard block={block41} highlight={block41Highlight} color={color} />
            </motion.div>
          )}
        </AnimatePresence>

        {showBlock42 && (
          <div className="flex flex-col items-center self-stretch justify-center gap-0.5">
            {/* Pointer arrow going LEFT (block 42 references block 41) */}
            <div className="flex flex-col items-center gap-0.5">
              <div className="text-[7px] font-mono text-slate-600 text-center">PREV</div>
              <motion.div
                className="w-8 h-0.5 rounded-full relative"
                style={{
                  backgroundColor: link4142Broken
                    ? "#ef4444"
                    : ["chain_complete", "scan", "scan_done", "restore", "loop_wait"].includes(phase)
                    ? "#22c55e"
                    : "#475569",
                }}
                animate={
                  phase === "scan"
                    ? { scaleX: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }
                    : undefined
                }
                transition={{ duration: 1, repeat: Infinity }}
              />
              {link4142Broken ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[8px] text-red-400">✕</motion.div>
              ) : (
                <div className="text-[8px]"
                  style={{
                    color: ["chain_complete", "scan", "scan_done", "restore", "loop_wait"].includes(phase)
                      ? "#22c55e"
                      : "#475569",
                  }}>←</div>
              )}
            </div>
          </div>
        )}

        <AnimatePresence>
          {showBlock42 && (
            <motion.div key="b42" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
              <BlockCard block={block42} highlight={block42Highlight} color={color} />
            </motion.div>
          )}
        </AnimatePresence>

        {showBlock43 && (
          <div className="flex flex-col items-center self-stretch justify-center gap-0.5">
            <div className="flex flex-col items-center gap-0.5">
              <div className="text-[7px] font-mono text-slate-600 text-center">PREV</div>
              <motion.div
                className="w-8 h-0.5 rounded-full"
                style={{
                  backgroundColor: link4243Broken
                    ? "#ef4444"
                    : link4243Valid
                    ? "#22c55e"
                    : "#475569",
                }}
                animate={
                  phase === "scan"
                    ? { scaleX: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }
                    : undefined
                }
                transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
              />
              {link4243Broken ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[8px] text-red-400">✕</motion.div>
              ) : (
                <div className="text-[8px]"
                  style={{
                    color: link4243Valid ? "#22c55e" : "#475569",
                  }}>←</div>
              )}
            </div>
          </div>
        )}

        <AnimatePresence>
          {showBlock43 && (
            <motion.div key="b43" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
              <BlockCard block={block43} highlight={block43Highlight} color={color} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mismatch comparison panel */}
      <AnimatePresence>
        {(phase === "detect_break" || phase === "cascade_rebuild42" || phase === "cascade_break43") && (
          <motion.div
            key="mismatch"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border p-3 space-y-2"
            style={{ borderColor: "#7f1d1d", background: "rgba(127,29,29,0.10)" }}
          >
            {phase === "detect_break" && (
              <>
                <div className="text-[8.5px] font-mono text-red-400 font-bold text-center tracking-wide">⚠ HASH LINK BROKEN</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center">
                    <div className="text-[7px] font-mono text-slate-500 mb-0.5">BLOCK #41 CURRENT HASH</div>
                    <div className="font-mono text-[8.5px] text-red-400 font-bold">{HASH41_NEW}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[7px] font-mono text-slate-500 mb-0.5">BLOCK #42 STORED PREV</div>
                    <div className="font-mono text-[8.5px] text-slate-300">{HASH41_ORIG}</div>
                  </div>
                </div>
                <div className="text-center text-[8px] font-mono text-red-500 font-bold">{HASH41_NEW} ≠ {HASH41_ORIG}</div>
              </>
            )}
            {phase === "cascade_rebuild42" && (
              <>
                <div className="text-[8.5px] font-mono text-amber-400 font-bold text-center tracking-wide">REBUILDING BLOCK #42 — HASH CASCADE</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center">
                    <div className="text-[7px] font-mono text-slate-500 mb-0.5">BLOCK #42 NEW HASH</div>
                    <div className="font-mono text-[8.5px] text-amber-400 font-bold">{HASH42_NEW}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[7px] font-mono text-slate-500 mb-0.5">BLOCK #43 STORED PREV</div>
                    <div className="font-mono text-[8.5px] text-slate-300">{HASH42_ORIG}</div>
                  </div>
                </div>
                <div className="text-center text-[8px] font-mono text-amber-500 font-bold">DEPENDENCY CASCADE IN PROGRESS...</div>
              </>
            )}
            {phase === "cascade_break43" && (
              <>
                <div className="text-[8.5px] font-mono text-red-400 font-bold text-center tracking-wide">✕ CASCADE COMPLETE — 2 LINKS BROKEN</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center">
                    <div className="text-[7px] font-mono text-slate-500 mb-0.5">BLOCK #42 NEW HASH</div>
                    <div className="font-mono text-[8.5px] text-red-400 font-bold">{HASH42_NEW}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[7px] font-mono text-slate-500 mb-0.5">BLOCK #43 STORED PREV</div>
                    <div className="font-mono text-[8.5px] text-slate-300">{HASH42_ORIG}</div>
                  </div>
                </div>
                <div className="text-center text-[8px] font-mono text-red-500 font-bold">{HASH42_NEW} ≠ {HASH42_ORIG}</div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cascade diagram */}
      <AnimatePresence>
        {phase === "cascade_break43" && (
          <motion.div
            key="cascade"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border p-2 grid grid-cols-3 gap-1 text-[7.5px] font-mono"
            style={{ borderColor: "#7f1d1d50", background: "rgba(127,29,29,0.06)" }}
          >
            {[
              { label: "MODIFY #41", color: "#fbbf24" },
              { label: "HASH#41 CHANGES", color: "#f87171" },
              { label: "REBUILD #42", color: "#fbbf24" },
              { label: "HASH#42 CHANGES", color: "#f87171" },
              { label: "#43 PTR BREAKS", color: "#f87171" },
              { label: "DEPENDENCY CASCADE", color: "#ef4444" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.18 }}
                className="text-center px-1 py-0.5 rounded border"
                style={{ borderColor: `${item.color}40`, color: item.color, background: `${item.color}0a` }}
              >
                {item.label}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Telemetry + Scan result */}
      <div className="grid grid-cols-2 gap-2">
        {/* Telemetry */}
        <div className="rounded-xl border p-2.5 space-y-1"
          style={{ borderColor: `${color}20`, background: `${color}05` }}>
          <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">HASH-LINK TELEMETRY</div>
          {[
            ["BLOCKS", "3"],
            ["LINKS", "2"],
            ["VALID", validLinks.toString()],
            ["BROKEN", brokenLinks.toString()],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-[8px] font-mono">
              <span className="text-slate-500">{k}</span>
              <span style={{
                color: k === "BROKEN" && brokenLinks > 0 ? "#f87171"
                  : k === "VALID" && validLinks === 2 ? "#4ade80"
                  : "#94a3b8",
              }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Status panel */}
        <div className="rounded-xl border p-2.5 flex flex-col items-center justify-center gap-1.5"
          style={{
            borderColor: brokenLinks > 0 ? "#7f1d1d" : "#14532d",
            background: brokenLinks > 0 ? "rgba(127,29,29,0.1)" : "rgba(20,83,45,0.1)",
          }}>
          {brokenLinks > 0 ? (
            <>
              <ShieldAlert size={20} className="text-red-400" />
              <div className="text-[8px] font-mono text-red-400 font-bold text-center">INTEGRITY FAILURE</div>
            </>
          ) : ["scan_done", "restore", "loop_wait", "chain_complete"].includes(phase) ? (
            <>
              <ShieldCheck size={20} className="text-green-400" />
              <div className="text-[8px] font-mono text-green-400 font-bold text-center">CHAIN CONSISTENT</div>
            </>
          ) : (
            <>
              <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.4, repeat: Infinity }}>
                <RefreshCw size={18} style={{ color }} />
              </motion.div>
              <div className="text-[8px] font-mono text-slate-400 text-center">BUILDING CHAIN...</div>
            </>
          )}
        </div>
      </div>

      {/* Scan comparison — shown during scan */}
      <AnimatePresence>
        {(phase === "scan" || phase === "scan_done") && (
          <motion.div
            key="scan-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border p-2.5 space-y-2"
            style={{ borderColor: "#14532d", background: "rgba(20,83,45,0.08)" }}
          >
            <div className="text-[8px] font-mono text-green-400 font-bold tracking-wide">INTEGRITY SCAN RESULTS</div>
            {[
              { label: "HASH(#41) = PREV(#42)", hash1: HASH41_ORIG, hash2: HASH41_ORIG },
              { label: "HASH(#42) = PREV(#43)", hash1: HASH42_ORIG, hash2: HASH42_ORIG },
            ].map(({ label, hash1, hash2 }) => (
              <div key={label} className="flex items-center justify-between gap-2">
                <span className="text-[7.5px] font-mono text-slate-400">{label}</span>
                <span className="text-[7.5px] font-mono text-green-400 font-bold flex items-center gap-1">
                  <CheckCircle size={9} /> MATCH
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

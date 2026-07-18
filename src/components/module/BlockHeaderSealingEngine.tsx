import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, ShieldCheck, Lock, Cpu, CheckCircle, AlertTriangle } from "lucide-react";

interface Props {
  color: string;
}

type Phase =
  | "init"
  | "empty_header"
  | "load_height"
  | "load_timestamp"
  | "load_prevhash"
  | "load_txroot"
  | "load_nonce"
  | "header_complete"
  | "assemble"
  | "serialize"
  | "hashing"
  | "hash_done"
  | "sealed"
  | "dep_map"
  | "modify_nonce"
  | "rehash_nonce"
  | "show_diff"
  | "modify_prevhash"
  | "rehash_prevhash"
  | "downstream_warn"
  | "restore"
  | "loop_wait";

// Fixed hash values used consistently
const HASH_ORIG   = "A91F...72BC";
const HASH_NONCE  = "F73A...18ED";
const HASH_PREV   = "C82D...94FA";
const PREV_ORIG   = "A7F9...42CD";
const PREV_NEW    = "91BE...73FA";
const TX_ROOT     = "F82C...91AB";
const HEIGHT      = "42";
const TS          = "2026-07-17 18:42:10";
const NONCE_ORIG  = "18429";
const NONCE_NEW   = "18430";

const SEQUENCE: { phase: Phase; delay: number; msg: string }[] = [
  { phase: "init",            delay: 0,     msg: "INITIALIZING BLOCK HEADER SEALING ENGINE..." },
  { phase: "empty_header",   delay: 1200,  msg: "BLOCK #42 — AWAITING HEADER FIELDS..." },
  { phase: "load_height",    delay: 2800,  msg: "01/05 — LOADING BLOCK HEIGHT..." },
  { phase: "load_timestamp", delay: 4500,  msg: "02/05 — LOADING TIMESTAMP..." },
  { phase: "load_prevhash",  delay: 6500,  msg: "03/05 — TRANSFERRING BLOCK #41 HASH → PREV BLOCK ID..." },
  { phase: "load_txroot",    delay: 9000,  msg: "04/05 — COMPUTING TRANSACTION ROOT..." },
  { phase: "load_nonce",     delay: 11000, msg: "05/05 — LOADING NONCE..." },
  { phase: "header_complete",delay: 13000, msg: "✓ HEADER COMPLETE — ALL 5 FIELDS LOADED" },
  { phase: "assemble",       delay: 14500, msg: "ASSEMBLING HEADER FIELDS INTO ENCODING ENGINE..." },
  { phase: "serialize",      delay: 16500, msg: "DETERMINISTIC SERIALIZATION COMPLETE" },
  { phase: "hashing",        delay: 18000, msg: "SHA-256 CRYPTOGRAPHIC CORE PROCESSING..." },
  { phase: "hash_done",      delay: 20500, msg: "✓ BLOCK HASH GENERATED" },
  { phase: "sealed",         delay: 22000, msg: "✓ BLOCK SEALED — CRYPTOGRAPHIC FINGERPRINT ATTACHED" },
  { phase: "dep_map",        delay: 24000, msg: "FIELD DEPENDENCY MAP — ALL FIELDS CONTRIBUTE TO HASH" },
  { phase: "modify_nonce",   delay: 26500, msg: "⚠ MODIFYING NONCE: 18429 → 18430" },
  { phase: "rehash_nonce",   delay: 28500, msg: "RECALCULATING SHA-256 WITH MODIFIED HEADER..." },
  { phase: "show_diff",      delay: 30500, msg: "✕ BLOCK SEAL CHANGED — AVALANCHE EFFECT" },
  { phase: "modify_prevhash",delay: 33000, msg: "⚠ MODIFYING PREVIOUS BLOCK ID..." },
  { phase: "rehash_prevhash",delay: 35000, msg: "RECALCULATING HASH WITH NEW PREV BLOCK ID..." },
  { phase: "downstream_warn",delay: 36500, msg: "⚠ NEXT BLOCK REFERENCE NOW INVALID" },
  { phase: "restore",        delay: 39000, msg: "RESTORING ORIGINAL HEADER STATE..." },
  { phase: "loop_wait",      delay: 41500, msg: "✓ BLOCK #42 RE-SEALED — ORIGINAL FINGERPRINT RESTORED" },
];

interface FieldState {
  loaded: boolean;
  value: string;
  highlight?: boolean;
}

function fieldStates(phase: Phase): Record<string, FieldState> {
  const HEIGHT_PHASES: Phase[] = ["load_height","load_timestamp","load_prevhash","load_txroot","load_nonce","header_complete","assemble","serialize","hashing","hash_done","sealed","dep_map","modify_nonce","rehash_nonce","show_diff","modify_prevhash","rehash_prevhash","downstream_warn","restore","loop_wait"];
  const TS_PHASES: Phase[]     = ["load_timestamp","load_prevhash","load_txroot","load_nonce","header_complete","assemble","serialize","hashing","hash_done","sealed","dep_map","modify_nonce","rehash_nonce","show_diff","modify_prevhash","rehash_prevhash","downstream_warn","restore","loop_wait"];
  const PREV_PHASES: Phase[]   = ["load_prevhash","load_txroot","load_nonce","header_complete","assemble","serialize","hashing","hash_done","sealed","dep_map","modify_nonce","rehash_nonce","show_diff","modify_prevhash","rehash_prevhash","downstream_warn","restore","loop_wait"];
  const TX_PHASES: Phase[]     = ["load_txroot","load_nonce","header_complete","assemble","serialize","hashing","hash_done","sealed","dep_map","modify_nonce","rehash_nonce","show_diff","modify_prevhash","rehash_prevhash","downstream_warn","restore","loop_wait"];
  const NONCE_PHASES: Phase[]  = ["load_nonce","header_complete","assemble","serialize","hashing","hash_done","sealed","dep_map","modify_nonce","rehash_nonce","show_diff","modify_prevhash","rehash_prevhash","downstream_warn","restore","loop_wait"];

  const nonceVal = ["modify_nonce","rehash_nonce","show_diff"].includes(phase) ? NONCE_NEW : NONCE_ORIG;
  const prevVal  = ["modify_prevhash","rehash_prevhash","downstream_warn"].includes(phase) ? PREV_NEW : PREV_ORIG;

  return {
    height:    { loaded: HEIGHT_PHASES.includes(phase), value: HEIGHT,   highlight: phase === "dep_map" },
    timestamp: { loaded: TS_PHASES.includes(phase),     value: TS,       highlight: phase === "dep_map" },
    prevhash:  { loaded: PREV_PHASES.includes(phase),   value: prevVal,  highlight: ["modify_prevhash","dep_map"].includes(phase) },
    txroot:    { loaded: TX_PHASES.includes(phase),     value: TX_ROOT,  highlight: phase === "dep_map" },
    nonce:     { loaded: NONCE_PHASES.includes(phase),  value: nonceVal, highlight: ["modify_nonce","dep_map"].includes(phase) },
  };
}

function getCurrentHash(phase: Phase): string {
  if (["modify_nonce","rehash_nonce","show_diff"].includes(phase)) return HASH_NONCE;
  if (["modify_prevhash","rehash_prevhash","downstream_warn"].includes(phase)) return HASH_PREV;
  if (["hash_done","sealed","dep_map"].includes(phase)) return HASH_ORIG;
  return "—";
}

interface FieldCardProps {
  label: string;
  value: string;
  loaded: boolean;
  active: boolean;
  highlight: boolean;
  color: string;
}

function FieldCard({ label, value, loaded, active, highlight, color }: FieldCardProps) {
  return (
    <motion.div
      layout
      className="rounded-lg border p-2 flex flex-col gap-0.5"
      style={{
        borderColor: highlight ? "#22d3ee90"
          : active ? `${color}80`
          : loaded ? `${color}35`
          : "#1e293b",
        background: highlight ? "rgba(34,211,238,0.08)"
          : active ? `${color}0c`
          : loaded ? `${color}06`
          : "rgba(15,23,42,0.7)",
        boxShadow: highlight ? "0 0 10px rgba(34,211,238,0.2)" : "none",
      }}
      animate={{ scale: active ? 1.03 : 1 }}
      transition={{ duration: 0.25 }}
    >
      <div
        className="text-[7px] font-mono uppercase tracking-widest"
        style={{ color: loaded ? `${color}` : "#334155" }}
      >
        {label}
      </div>
      <div
        className="text-[8px] font-mono truncate"
        style={{
          color: highlight ? "#22d3ee"
            : loaded ? "#e2e8f0"
            : "#334155",
        }}
      >
        {loaded ? value : "WAITING..."}
      </div>
      <div className="text-[7px] font-mono">
        {loaded ? (
          <span className="text-green-400">✓ LOADED</span>
        ) : (
          <span style={{ color: "#334155" }}>[ WAITING ]</span>
        )}
      </div>
    </motion.div>
  );
}

const FIELD_DEFS = [
  { key: "height",    label: "BLOCK HEIGHT",    activePhase: "load_height"     as Phase },
  { key: "timestamp", label: "TIMESTAMP",       activePhase: "load_timestamp"  as Phase },
  { key: "prevhash",  label: "PREVIOUS BLOCK ID",activePhase: "load_prevhash"  as Phase },
  { key: "txroot",    label: "TX ROOT",         activePhase: "load_txroot"     as Phase },
  { key: "nonce",     label: "NONCE",           activePhase: "load_nonce"      as Phase },
];

export default function BlockHeaderSealingEngine({ color }: Props) {
  const [phase, setPhase] = useState<Phase>("init");
  const [progressMsg, setProgressMsg] = useState("INITIALIZING BLOCK HEADER SEALING ENGINE...");

  useEffect(() => {
    let timers: NodeJS.Timeout[] = [];
    const run = () => {
      SEQUENCE.forEach(({ phase: p, delay, msg }) => {
        const t = setTimeout(() => { setPhase(p); setProgressMsg(msg); }, delay);
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

  const fields = fieldStates(phase);
  const loadedCount = Object.values(fields).filter(f => f.loaded).length;
  const currentHash = getCurrentHash(phase);

  const showAssembly = ["assemble","serialize","hashing","hash_done","sealed","dep_map","modify_nonce","rehash_nonce","show_diff","modify_prevhash","rehash_prevhash","downstream_warn","restore","loop_wait"].includes(phase);
  const showSerial   = ["serialize","hashing","hash_done","sealed","dep_map","modify_nonce","rehash_nonce","show_diff","modify_prevhash","rehash_prevhash","downstream_warn","restore","loop_wait"].includes(phase);
  const isHashing    = phase === "hashing";
  const isSealed     = ["sealed","dep_map","modify_nonce","rehash_nonce","show_diff","modify_prevhash","rehash_prevhash","downstream_warn","restore","loop_wait"].includes(phase);
  const hashChanged  = ["show_diff","modify_prevhash","rehash_prevhash","downstream_warn"].includes(phase);

  const msgType = progressMsg.startsWith("✓") ? "ok"
    : progressMsg.startsWith("✕") || progressMsg.startsWith("⚠") ? (progressMsg.startsWith("⚠") ? "warn" : "err")
    : "neutral";
  const msgColor = msgType === "ok" ? "#4ade80" : msgType === "err" ? "#f87171" : msgType === "warn" ? "#fbbf24" : color;
  const msgBorder = msgType === "ok" ? "#14532d" : msgType === "err" ? "#7f1d1d" : msgType === "warn" ? "#78350f" : `${color}25`;
  const msgBg = msgType === "ok" ? "rgba(20,83,45,0.10)" : msgType === "err" ? "rgba(127,29,29,0.10)" : msgType === "warn" ? "rgba(120,53,15,0.10)" : `${color}06`;

  // Telemetry
  const telemetry = [
    ["BLOCK",        "#42"],
    ["FIELDS",       `${loadedCount} / 5`],
    ["SERIALIZED",   showSerial ? "COMPLETE" : showAssembly ? "ENCODING" : "WAITING"],
    ["HASH FUNCTION","SHA-256"],
    ["HASH STATUS",  isSealed ? "GENERATED" : isHashing ? "PROCESSING" : currentHash !== "—" ? "READY" : "PENDING"],
    ["BLOCK STATUS", isSealed ? "✓ SEALED" : "UNSEALED"],
  ];

  return (
    <div
      className="rounded-2xl border flex flex-col gap-3 p-4 h-full"
      style={{ borderColor: `${color}30`, background: "linear-gradient(145deg,rgba(2,6,23,0.98),rgba(5,10,30,0.95))" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono font-bold tracking-widest uppercase" style={{ color }}>
            BLOCK HEADER SEALING ENGINE
          </div>
          <div className="text-[8px] font-mono text-slate-500 tracking-widest uppercase mt-0.5">
            ASSEMBLE → SERIALIZE → SHA-256 → SEAL
          </div>
        </div>
        <motion.div animate={isHashing ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}>
          <Cpu size={14} style={{ color: `${color}70` }} />
        </motion.div>
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

      {/* Main pipeline */}
      <div className="flex flex-col gap-2 flex-1 min-h-0">

        {/* Header fields grid */}
        <div className="grid grid-cols-5 gap-1.5">
          {FIELD_DEFS.map(({ key, label, activePhase }) => (
            <FieldCard
              key={key}
              label={label}
              value={fields[key].value}
              loaded={fields[key].loaded}
              active={phase === activePhase}
              highlight={fields[key].highlight ?? false}
              color={color}
            />
          ))}
        </div>

        {/* Connector arrows feeding into assembly */}
        <AnimatePresence>
          {showAssembly && (
            <motion.div
              key="arrows"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1"
            >
              {/* 5 arrows converging */}
              <div className="grid grid-cols-5 gap-1.5 flex-1">
                {FIELD_DEFS.map(({ key }, i) => (
                  <div key={key} className="flex justify-center">
                    <motion.div
                      className="text-[10px] font-mono"
                      style={{ color: `${color}60` }}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.1 }}
                    >
                      ↓
                    </motion.div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Assembly → Serialize → Hash → Seal pipeline */}
        <AnimatePresence>
          {showAssembly && (
            <motion.div
              key="pipeline"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2"
            >
              {/* Assembly box */}
              <motion.div
                className="flex-1 rounded-xl border p-2 text-center"
                style={{
                  borderColor: showSerial ? `${color}50` : `${color}80`,
                  background: showSerial ? `${color}06` : `${color}12`,
                }}
              >
                <div className="text-[7px] font-mono text-slate-500 uppercase">HEADER ASSEMBLY</div>
                <div className="text-[8px] font-mono mt-0.5" style={{ color }}>
                  {showSerial ? "ENCODED" : "ASSEMBLING..."}
                </div>
              </motion.div>

              <div className="text-[9px] text-slate-600">→</div>

              {/* Serialization */}
              <AnimatePresence>
                {showSerial && (
                  <motion.div
                    key="serial"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1 rounded-xl border p-2 text-center"
                    style={{ borderColor: "#a855f730", background: "#a855f708" }}
                  >
                    <div className="text-[7px] font-mono text-slate-500 uppercase">SERIALIZED</div>
                    <div className="text-[7px] font-mono text-purple-400 mt-0.5 truncate">
                      00002A|68FA...|A7F9...|F82C...|47FD...
                    </div>
                    <div className="text-[6px] font-mono text-slate-600 mt-0.5">SIMPLIFIED HEADER</div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="text-[9px] text-slate-600">→</div>

              {/* SHA-256 core */}
              <motion.div
                className="flex-1 rounded-xl border p-2 text-center"
                style={{
                  borderColor: isHashing ? "#22d3ee80" : isSealed ? "#22c55e40" : "#334155",
                  background: isHashing ? "rgba(34,211,238,0.08)" : isSealed ? "rgba(34,197,94,0.05)" : "rgba(15,23,42,0.6)",
                  boxShadow: isHashing ? "0 0 12px rgba(34,211,238,0.2)" : "none",
                }}
              >
                <div className="text-[7px] font-mono text-slate-500 uppercase">SHA-256</div>
                {isHashing ? (
                  <motion.div
                    className="text-[8px] font-mono text-cyan-400 mt-0.5"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  >
                    PROCESSING...
                  </motion.div>
                ) : isSealed ? (
                  <div className="text-[8px] font-mono text-green-400 mt-0.5">COMPLETE ✓</div>
                ) : (
                  <div className="text-[8px] font-mono text-slate-600 mt-0.5">WAITING</div>
                )}
              </motion.div>

              <div className="text-[9px] text-slate-600">→</div>

              {/* Block Hash output */}
              <motion.div
                className="flex-1 rounded-xl border p-2 text-center"
                style={{
                  borderColor: isSealed
                    ? hashChanged ? "#ef444460" : "#22c55e60"
                    : "#1e293b",
                  background: isSealed
                    ? hashChanged ? "rgba(127,29,29,0.10)" : "rgba(20,83,45,0.10)"
                    : "rgba(15,23,42,0.5)",
                  boxShadow: isSealed && !hashChanged ? "0 0 10px rgba(34,197,94,0.15)" : "none",
                }}
              >
                <div className="text-[7px] font-mono text-slate-500 uppercase">BLOCK HASH</div>
                {isSealed ? (
                  <motion.div
                    key={currentHash}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[8px] font-mono font-bold mt-0.5"
                    style={{ color: hashChanged ? "#f87171" : "#4ade80" }}
                  >
                    {currentHash}
                  </motion.div>
                ) : (
                  <div className="text-[8px] font-mono text-slate-600 mt-0.5">—</div>
                )}
                {isSealed && !hashChanged && (
                  <div className="text-[7px] font-mono text-green-400 mt-0.5">✓ SEALED</div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hash difference comparison panel */}
        <AnimatePresence>
          {(phase === "show_diff" || phase === "rehash_prevhash" || phase === "downstream_warn") && (
            <motion.div
              key="diff"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl border p-2.5 space-y-1.5"
              style={{
                borderColor: "#7f1d1d50",
                background: "rgba(127,29,29,0.08)",
              }}
            >
              {phase === "show_diff" && (
                <>
                  <div className="text-[8.5px] font-mono text-red-400 font-bold">⚠ BLOCK SEAL CHANGED — AVALANCHE EFFECT</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center">
                      <div className="text-[7px] font-mono text-slate-500 mb-0.5">OLD HASH (NONCE: {NONCE_ORIG})</div>
                      <div className="font-mono text-[8.5px] text-green-400">{HASH_ORIG}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[7px] font-mono text-slate-500 mb-0.5">NEW HASH (NONCE: {NONCE_NEW})</div>
                      <div className="font-mono text-[8.5px] text-red-400 font-bold">{HASH_NONCE}</div>
                    </div>
                  </div>
                  <div className="text-center text-[8px] font-mono text-red-500">{HASH_ORIG} ≠ {HASH_NONCE}</div>
                  <div className="text-[7.5px] font-mono text-amber-400/80 text-center">
                    TINY HEADER CHANGE → DRASTICALLY DIFFERENT HASH
                  </div>
                </>
              )}
              {(phase === "rehash_prevhash" || phase === "downstream_warn") && (
                <>
                  <div className="text-[8.5px] font-mono text-amber-400 font-bold">⚠ PREVIOUS BLOCK ID CHANGED</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center">
                      <div className="text-[7px] font-mono text-slate-500 mb-0.5">ORIGINAL HASH</div>
                      <div className="font-mono text-[8px] text-green-400">{HASH_ORIG}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[7px] font-mono text-slate-500 mb-0.5">NEW HASH</div>
                      <div className="font-mono text-[8px] text-red-400 font-bold">{HASH_PREV}</div>
                    </div>
                  </div>
                  {phase === "downstream_warn" && (
                    <div className="mt-1 rounded-lg border px-2 py-1.5 text-center"
                      style={{ borderColor: "#78350f", background: "rgba(120,53,15,0.12)" }}>
                      <div className="text-[7.5px] font-mono text-amber-400">
                        BLOCK #43 STILL REFERENCES OLD HASH(#42) → ⚠ NEXT LINK MAY BECOME INVALID
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dependency map */}
        <AnimatePresence>
          {phase === "dep_map" && (
            <motion.div
              key="depmap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border p-2.5"
              style={{ borderColor: `${color}25`, background: `${color}05` }}
            >
              <div className="text-[8px] font-mono font-bold mb-2" style={{ color }}>
                FIELD DEPENDENCY MAP
              </div>
              <div className="space-y-0.5">
                {[
                  { label: "BLOCK HEIGHT ─────────┐", delay: 0 },
                  { label: "TIMESTAMP ────────────┤", delay: 0.08 },
                  { label: "PREVIOUS BLOCK ID ────┼──→ BLOCK HASH", delay: 0.16 },
                  { label: "TX ROOT ──────────────┤", delay: 0.24 },
                  { label: "NONCE ────────────────┘", delay: 0.32 },
                ].map(({ label, delay }, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay }}
                    className="text-[8px] font-mono"
                    style={{ color: i === 2 ? "#22d3ee" : "#64748b" }}
                  >
                    {label}
                  </motion.div>
                ))}
              </div>
              <div className="mt-2 text-[7.5px] font-mono text-slate-500 text-center">
                THE BLOCK HASH DEPENDS ON THE COMPLETE ENCODED HEADER
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Prev-hash special callout */}
        <AnimatePresence>
          {phase === "load_prevhash" && (
            <motion.div
              key="prevhash_callout"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border p-2.5 flex items-start gap-3"
              style={{ borderColor: "#22d3ee30", background: "rgba(34,211,238,0.05)" }}
            >
              <div className="text-[7.5px] font-mono text-cyan-400 leading-relaxed">
                <span className="font-bold text-cyan-300">BLOCK #41 HASH → A7F9...42CD</span><br />
                This hash value from Block #41 is embedded into Block #42's header as its Previous Block ID — creating the cryptographic chain link.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Telemetry + Status row */}
      <div className="grid grid-cols-2 gap-2">
        {/* Telemetry */}
        <div className="rounded-xl border p-2.5 space-y-0.5" style={{ borderColor: `${color}20`, background: `${color}05` }}>
          <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mb-1">BLOCK SEAL MONITOR</div>
          {telemetry.map(([k, v]) => (
            <div key={k} className="flex justify-between text-[8px] font-mono">
              <span className="text-slate-500">{k}</span>
              <span style={{
                color: v === "✓ SEALED" ? "#4ade80"
                  : v === "PROCESSING" ? "#22d3ee"
                  : v === "COMPLETE" ? "#4ade80"
                  : v === "GENERATED" ? "#4ade80"
                  : v === "ENCODING" ? "#f59e0b"
                  : "#94a3b8",
              }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Status card */}
        <div
          className="rounded-xl border p-2.5 flex flex-col items-center justify-center gap-1.5"
          style={{
            borderColor: isSealed && !hashChanged ? "#14532d"
              : hashChanged ? "#7f1d1d"
              : isHashing ? "#22d3ee30"
              : `${color}20`,
            background: isSealed && !hashChanged ? "rgba(20,83,45,0.10)"
              : hashChanged ? "rgba(127,29,29,0.10)"
              : `${color}05`,
          }}
        >
          {isSealed && !hashChanged ? (
            <>
              <ShieldCheck size={20} className="text-green-400" />
              <div className="text-[8px] font-mono text-green-400 font-bold text-center">BLOCK SEALED</div>
              <div className="text-[7px] font-mono text-green-400/60 text-center">{HASH_ORIG}</div>
            </>
          ) : hashChanged ? (
            <>
              <AlertTriangle size={20} className="text-red-400" />
              <div className="text-[8px] font-mono text-red-400 font-bold text-center">SEAL CHANGED</div>
              <div className="text-[7px] font-mono text-red-400/60 text-center">{currentHash}</div>
            </>
          ) : isHashing ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <RefreshCw size={18} style={{ color: "#22d3ee" }} />
              </motion.div>
              <div className="text-[8px] font-mono text-cyan-400 text-center">HASHING...</div>
            </>
          ) : (
            <>
              <Lock size={18} style={{ color: `${color}60` }} />
              <div className="text-[8px] font-mono text-slate-400 text-center">UNSEALED</div>
              <div className="text-[7px] font-mono text-slate-600 text-center">{loadedCount}/5 FIELDS</div>
            </>
          )}
        </div>
      </div>

      {/* Sealed glow ring animation */}
      <AnimatePresence>
        {phase === "sealed" && (
          <motion.div
            key="sealed-ring"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.8, repeat: 1 }}
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{ boxShadow: "inset 0 0 30px rgba(34,197,94,0.15), 0 0 20px rgba(34,197,94,0.10)" }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

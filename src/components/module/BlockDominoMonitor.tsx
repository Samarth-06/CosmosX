import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ShieldAlert, RefreshCw, AlertTriangle, CheckCircle, XCircle, Zap } from "lucide-react";

interface Props {
  color: string;
}

type Phase =
  | "init"
  | "build_chain"
  | "scan"
  | "scan_done"
  | "focus_b2"
  | "tamper_b2"
  | "rehash_b2"
  | "break_23"
  | "freeze_state"
  | "rebuild_b3"
  | "break_34"
  | "rebuild_b4"
  | "break_45"
  | "cascade_full"
  | "validation_scan"
  | "restore"
  | "loop_wait";

// Abbreviated hashes for blocks
const H: Record<string, string> = {
  H1:  "3E8A...B4F2",
  H2:  "A7F9...42CD",
  H2p: "91BE...73FA",
  H3:  "F82C...91AB",
  H3p: "7CA1...44BE",
  H4:  "C39E...27DF",
  H4p: "B56D...09E1",
  H5:  "D12F...88AC",
};

interface BlockDef {
  num: number;
  tx: string;
  prevKey: string;
  hashKey: string;
}

const BLOCKS: BlockDef[] = [
  { num: 1, tx: "GENESIS", prevKey: "—", hashKey: "H1" },
  { num: 2, tx: "STA→STB : 100", prevKey: "H1", hashKey: "H2" },
  { num: 3, tx: "STB→STC : 50",  prevKey: "H2", hashKey: "H3" },
  { num: 4, tx: "STC→STD : 25",  prevKey: "H3", hashKey: "H4" },
  { num: 5, tx: "STD→STE : 10",  prevKey: "H4", hashKey: "H5" },
];

type LinkState = "valid" | "broken" | "pending" | "hidden" | "repaired";
type BlockStatus = "valid" | "tampered" | "rebuilding" | "invalid" | "downstream";

function miniHash(key: string): string {
  return H[key] ?? "—";
}

interface ChainState {
  block2Hash: string;   // H2 or H2p
  block2Tx: string;     // "100" or "900"
  block3Prev: string;   // H2 or H2p
  block3Hash: string;   // H3 or H3p
  block4Prev: string;   // H3 or H3p
  block4Hash: string;   // H4 or H4p
  block5Prev: string;   // H4 or H4p
  link12: LinkState;
  link23: LinkState;
  link34: LinkState;
  link45: LinkState;
  blockStatus: Record<number, BlockStatus>;
  dominoCount: number;
}

function getState(phase: Phase): ChainState {
  const defaults: ChainState = {
    block2Hash: "H2", block2Tx: "100",
    block3Prev: "H2", block3Hash: "H3",
    block4Prev: "H3", block4Hash: "H4",
    block5Prev: "H4",
    link12: "valid", link23: "valid", link34: "valid", link45: "valid",
    blockStatus: { 1: "valid", 2: "valid", 3: "valid", 4: "valid", 5: "valid" },
    dominoCount: 0,
  };

  switch (phase) {
    case "init":
    case "build_chain":
      return { ...defaults, link12: "hidden", link23: "hidden", link34: "hidden", link45: "hidden" };

    case "scan":
    case "scan_done":
      return defaults;

    case "focus_b2":
      return { ...defaults, blockStatus: { 1: "valid", 2: "valid", 3: "valid", 4: "valid", 5: "valid" } };

    case "tamper_b2":
      return { ...defaults, block2Tx: "900",
        blockStatus: { 1: "valid", 2: "tampered", 3: "valid", 4: "valid", 5: "valid" } };

    case "rehash_b2":
      return { ...defaults, block2Tx: "900", block2Hash: "H2p",
        blockStatus: { 1: "valid", 2: "tampered", 3: "valid", 4: "valid", 5: "valid" } };

    case "break_23":
      return { ...defaults, block2Tx: "900", block2Hash: "H2p", link23: "broken",
        blockStatus: { 1: "valid", 2: "tampered", 3: "invalid", 4: "downstream", 5: "downstream" },
        dominoCount: 1 };

    case "freeze_state":
      return { ...defaults, block2Tx: "900", block2Hash: "H2p", link23: "broken",
        blockStatus: { 1: "valid", 2: "tampered", 3: "invalid", 4: "downstream", 5: "downstream" },
        dominoCount: 1 };

    case "rebuild_b3":
      return { ...defaults, block2Tx: "900", block2Hash: "H2p",
        block3Prev: "H2p", block3Hash: "H3p", link23: "repaired", link34: "broken",
        blockStatus: { 1: "valid", 2: "tampered", 3: "rebuilding", 4: "invalid", 5: "downstream" },
        dominoCount: 2 };

    case "break_34":
      return { ...defaults, block2Tx: "900", block2Hash: "H2p",
        block3Prev: "H2p", block3Hash: "H3p", link23: "repaired", link34: "broken",
        blockStatus: { 1: "valid", 2: "tampered", 3: "rebuilding", 4: "invalid", 5: "downstream" },
        dominoCount: 2 };

    case "rebuild_b4":
      return { ...defaults, block2Tx: "900", block2Hash: "H2p",
        block3Prev: "H2p", block3Hash: "H3p", block4Prev: "H3p", block4Hash: "H4p",
        link23: "repaired", link34: "repaired", link45: "broken",
        blockStatus: { 1: "valid", 2: "tampered", 3: "rebuilding", 4: "rebuilding", 5: "invalid" },
        dominoCount: 3 };

    case "break_45":
      return { ...defaults, block2Tx: "900", block2Hash: "H2p",
        block3Prev: "H2p", block3Hash: "H3p", block4Prev: "H3p", block4Hash: "H4p",
        link23: "repaired", link34: "repaired", link45: "broken",
        blockStatus: { 1: "valid", 2: "tampered", 3: "rebuilding", 4: "rebuilding", 5: "invalid" },
        dominoCount: 3 };

    case "cascade_full":
      return { ...defaults, block2Tx: "900", block2Hash: "H2p",
        block3Prev: "H2p", block3Hash: "H3p", block4Prev: "H3p", block4Hash: "H4p",
        link23: "repaired", link34: "repaired", link45: "broken",
        blockStatus: { 1: "valid", 2: "tampered", 3: "rebuilding", 4: "rebuilding", 5: "invalid" },
        dominoCount: 3 };

    case "validation_scan":
    case "restore":
    case "loop_wait":
      return defaults;

    default:
      return defaults;
  }
}

const LINK_COLORS: Record<LinkState, string> = {
  valid:    "#22c55e",
  repaired: "#22c55e",
  pending:  "#f59e0b",
  broken:   "#ef4444",
  hidden:   "transparent",
};

function BlockCard({
  num,
  tx,
  prevHash,
  ownHash,
  status,
  focused,
  color,
}: {
  num: number;
  tx: string;
  prevHash: string;
  ownHash: string;
  status: BlockStatus;
  focused: boolean;
  color: string;
}) {
  const borderColor =
    status === "tampered" ? "#ef444490"
    : status === "rebuilding" ? "#f59e0b90"
    : status === "invalid" ? "#ef444460"
    : status === "downstream" ? "#f59e0b40"
    : focused ? `${color}80`
    : `${color}35`;

  const bg =
    status === "tampered" ? "rgba(127,29,29,0.18)"
    : status === "rebuilding" ? "rgba(120,53,15,0.14)"
    : status === "invalid" ? "rgba(127,29,29,0.12)"
    : status === "downstream" ? "rgba(120,53,15,0.08)"
    : focused ? `${color}12`
    : "rgba(15,23,42,0.9)";

  const hashColor =
    status === "tampered" || status === "invalid" ? "#f87171"
    : status === "rebuilding" ? "#fbbf24"
    : "#22d3ee";

  const label =
    status === "tampered" ? "TAMPERED"
    : status === "rebuilding" ? "REBUILT"
    : status === "invalid" ? "BROKEN"
    : status === "downstream" ? "AT RISK"
    : "VALID";

  const labelColor =
    status === "tampered" || status === "invalid" ? "#f87171"
    : status === "rebuilding" ? "#fbbf24"
    : status === "downstream" ? "#f59e0b"
    : "#4ade80";

  return (
    <motion.div
      layout
      className="rounded-xl border flex flex-col gap-1 p-2.5 min-w-0 flex-1"
      style={{ borderColor, background: bg }}
      animate={{ scale: focused ? 1.03 : 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div className="text-[8.5px] font-mono font-bold tracking-widest uppercase" style={{ color }}>
          #{num}
        </div>
        <div className="text-[7px] font-mono font-bold" style={{ color: labelColor }}>
          {label}
        </div>
      </div>

      <div className="border-t border-white/5 pt-1 space-y-0.5">
        <div className="text-[7px] font-mono text-slate-600 uppercase">TX</div>
        <div className="text-[8px] font-mono text-slate-300 leading-tight">{tx}</div>
      </div>

      <div className="border-t border-white/5 pt-1 space-y-0.5">
        <div className="text-[7px] font-mono text-slate-600 uppercase">PREV</div>
        <div className="text-[7.5px] font-mono text-slate-400 truncate">{prevHash === "—" ? "000...0" : miniHash(prevHash)}</div>
      </div>

      <div className="border-t border-white/5 pt-1 space-y-0.5">
        <div className="text-[7px] font-mono text-slate-600 uppercase">HASH</div>
        <motion.div
          className="text-[7.5px] font-mono truncate"
          style={{ color: hashColor }}
          animate={
            status === "rebuilding"
              ? { opacity: [0.5, 1, 0.5] }
              : status === "tampered"
              ? { color: ["#f87171", "#fbbf24", "#f87171"] }
              : {}
          }
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          {miniHash(ownHash)}
        </motion.div>
      </div>
    </motion.div>
  );
}

function LinkConnector({
  state,
  dominoNum,
}: {
  state: LinkState;
  dominoNum?: number;
}) {
  const c = LINK_COLORS[state];
  const isBroken = state === "broken";
  const isHidden = state === "hidden";

  return (
    <div className="flex flex-col items-center justify-center gap-0.5 px-0.5" style={{ minWidth: 28 }}>
      <motion.div
        className="h-0.5 w-full rounded-full relative"
        style={{ backgroundColor: isHidden ? "transparent" : c }}
        animate={
          state === "valid" || state === "repaired"
            ? { opacity: [0.6, 1, 0.6] }
            : isBroken
            ? { opacity: [0.4, 1, 0.4] }
            : undefined
        }
        transition={{ duration: 1.4, repeat: Infinity }}
      />
      {isBroken && dominoNum && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-[7px] font-mono text-red-400 font-bold text-center"
        >
          D{dominoNum}
        </motion.div>
      )}
      {!isHidden && (
        <div
          className="text-[9px] font-mono"
          style={{ color: c }}
        >
          {isBroken ? "✕" : "→"}
        </div>
      )}
    </div>
  );
}

const SEQUENCE: { phase: Phase; delay: number; msg: string }[] = [
  { phase: "init",            delay: 0,     msg: "INITIALIZING BLOCKCHAIN DOMINO MONITOR..." },
  { phase: "build_chain",     delay: 1500,  msg: "BUILDING 5-BLOCK CHAIN..." },
  { phase: "scan",            delay: 3500,  msg: "RUNNING CHAIN INTEGRITY SCAN..." },
  { phase: "scan_done",       delay: 6000,  msg: "✓ ALL 4 LINKS VALID — CHAIN HEALTHY" },
  { phase: "focus_b2",        delay: 8000,  msg: "FOCUSING ON BLOCK #2..." },
  { phase: "tamper_b2",       delay: 9500,  msg: "⚠ UNAUTHORIZED MODIFICATION: TX FUEL 100 → 900" },
  { phase: "rehash_b2",       delay: 12000, msg: "RECOMPUTING BLOCK #2 HASH: H2 → H2'" },
  { phase: "break_23",        delay: 14500, msg: "✕ DOMINO #1 — BLOCK #3 LINK BROKEN" },
  { phase: "freeze_state",    delay: 17500, msg: "⚠ NOTE: BLOCKS #4 & #5 UNCHANGED — FIRST BREAK AT #2→#3" },
  { phase: "rebuild_b3",      delay: 21000, msg: "ATTEMPTING REPAIR: REBUILDING BLOCK #3..." },
  { phase: "break_34",        delay: 24000, msg: "✕ DOMINO #2 — BLOCK #4 LINK BROKEN" },
  { phase: "rebuild_b4",      delay: 27000, msg: "CONTINUING REPAIR: REBUILDING BLOCK #4..." },
  { phase: "break_45",        delay: 30000, msg: "✕ DOMINO #3 — BLOCK #5 LINK BROKEN" },
  { phase: "cascade_full",    delay: 33000, msg: "DEPENDENCY CASCADE COMPLETE — 3 DOMINOES FALLEN" },
  { phase: "validation_scan", delay: 36000, msg: "NODE VALIDATION: HISTORICAL INCONSISTENCY DETECTED" },
  { phase: "restore",         delay: 39500, msg: "RESTORING ORIGINAL CHAIN STATE..." },
  { phase: "loop_wait",       delay: 42000, msg: "✓ CHAIN RESTORED — ALL LINKS VALID" },
];

export default function BlockDominoMonitor({ color }: Props) {
  const [phase, setPhase] = useState<Phase>("init");
  const [progressMsg, setProgressMsg] = useState("INITIALIZING BLOCKCHAIN DOMINO MONITOR...");

  useEffect(() => {
    let timers: NodeJS.Timeout[] = [];

    const run = () => {
      SEQUENCE.forEach(({ phase: p, delay, msg }) => {
        const t = setTimeout(() => {
          setPhase(p);
          setProgressMsg(msg);
        }, delay);
        timers.push(t);
      });
      const loopT = setTimeout(() => {
        timers.forEach(clearTimeout);
        timers = [];
        run();
      }, 44000);
      timers.push(loopT);
    };

    run();
    return () => timers.forEach(clearTimeout);
  }, []);

  const state = getState(phase);

  const showChain = !["init"].includes(phase);

  const validLinks = [state.link12, state.link23, state.link34, state.link45]
    .filter(l => l === "valid" || l === "repaired").length;
  const brokenLinks = [state.link12, state.link23, state.link34, state.link45]
    .filter(l => l === "broken").length;
  const hiddenLinks = [state.link12, state.link23, state.link34, state.link45]
    .filter(l => l === "hidden").length;
  const activeLinks = 4 - hiddenLinks;

  const chainHealthy = validLinks === activeLinks && activeLinks === 4;

  // Dynamic block data
  const blockData = [
    { num: 1, tx: "GENESIS", prevHash: "—",            ownHash: "H1"           },
    { num: 2, tx: state.block2Tx === "900" ? "STA→STB : 900" : "STA→STB : 100", prevHash: "H1",  ownHash: state.block2Hash },
    { num: 3, tx: "STB→STC : 50",          prevHash: state.block3Prev,  ownHash: state.block3Hash },
    { num: 4, tx: "STC→STD : 25",          prevHash: state.block4Prev,  ownHash: state.block4Hash },
    { num: 5, tx: "STD→STE : 10",          prevHash: state.block5Prev,  ownHash: "H5"           },
  ];

  const links = [state.link12, state.link23, state.link34, state.link45];
  const dominoNums: (number | undefined)[] = [undefined, state.link23 === "broken" ? 1 : undefined, state.link34 === "broken" ? 2 : undefined, state.link45 === "broken" ? 3 : undefined];

  const msgType: "ok" | "warn" | "err" | "neutral" =
    progressMsg.startsWith("✓") ? "ok"
    : progressMsg.startsWith("✕") ? "err"
    : progressMsg.startsWith("⚠") ? "warn"
    : "neutral";

  const msgColor = msgType === "ok" ? "#4ade80" : msgType === "err" ? "#f87171" : msgType === "warn" ? "#fbbf24" : color;
  const msgBorder = msgType === "ok" ? "#14532d" : msgType === "err" ? "#7f1d1d" : msgType === "warn" ? "#78350f" : `${color}25`;
  const msgBg = msgType === "ok" ? "rgba(20,83,45,0.10)" : msgType === "err" ? "rgba(127,29,29,0.10)" : msgType === "warn" ? "rgba(120,53,15,0.10)" : `${color}06`;

  return (
    <div
      className="rounded-2xl border flex flex-col gap-3 p-4 h-full"
      style={{ borderColor: `${color}30`, background: "linear-gradient(145deg,rgba(2,6,23,0.98),rgba(5,10,30,0.95))" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono font-bold tracking-widest uppercase" style={{ color }}>
            BLOCKCHAIN DOMINO MONITOR
          </div>
          <div className="text-[8px] font-mono text-slate-500 tracking-widest uppercase mt-0.5">
            ONE CHANGE. EVERY FUTURE LINK AFFECTED.
          </div>
        </div>
        <motion.div
          animate={["scan", "rebuild_b3", "rebuild_b4"].includes(phase) ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw size={14} style={{ color: `${color}70` }} />
        </motion.div>
      </div>

      {/* Progress message */}
      <motion.div
        key={progressMsg}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[8.5px] font-mono rounded-lg px-3 py-1.5 border"
        style={{ color: msgColor, borderColor: msgBorder, background: msgBg }}
      >
        {progressMsg}
      </motion.div>

      {/* Chain visualization */}
      <AnimatePresence>
        {showChain && (
          <motion.div
            key="chain"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-stretch gap-1 flex-1 min-h-0"
          >
            {blockData.map((bd, i) => (
              <div key={bd.num} className="flex items-center gap-1 flex-1 min-w-0">
                <BlockCard
                  num={bd.num}
                  tx={bd.tx}
                  prevHash={bd.prevHash}
                  ownHash={bd.ownHash}
                  status={state.blockStatus[bd.num]}
                  focused={phase === "focus_b2" && bd.num === 2}
                  color={color}
                />
                {i < 4 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: links[i] === "hidden" ? 0 : 1 }}
                    transition={{ delay: i * 0.3 }}
                  >
                    <LinkConnector
                      state={links[i]}
                      dominoNum={dominoNums[i]}
                    />
                  </motion.div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Freeze state explanation */}
      <AnimatePresence>
        {phase === "freeze_state" && (
          <motion.div
            key="freeze"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border p-2.5 space-y-1"
            style={{ borderColor: "#78350f", background: "rgba(120,53,15,0.10)" }}
          >
            <div className="text-[8.5px] font-mono text-amber-400 font-bold">⚠ TECHNICAL CLARITY</div>
            <div className="text-[8px] font-mono text-amber-200/80 leading-relaxed">
              Tampering with Block #2 does NOT automatically rewrite later blocks. The first broken link appears at #2→#3. Blocks #4 and #5 remain unchanged — but their references will become invalid as the chain is rebuilt forward.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hash mismatch panel */}
      <AnimatePresence>
        {["break_23", "freeze_state"].includes(phase) && (
          <motion.div
            key="mismatch23"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border p-2.5"
            style={{ borderColor: "#7f1d1d50", background: "rgba(127,29,29,0.08)" }}
          >
            <div className="text-[8px] font-mono text-red-400 font-bold mb-1.5">DOMINO #1 — HASH MISMATCH DETECTED</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center">
                <div className="text-[7px] font-mono text-slate-500 mb-0.5">BLOCK #2 CURRENT HASH</div>
                <div className="font-mono text-[8px] text-red-400 font-bold">{H.H2p}</div>
              </div>
              <div className="text-center">
                <div className="text-[7px] font-mono text-slate-500 mb-0.5">BLOCK #3 STORED PREV</div>
                <div className="font-mono text-[8px] text-slate-300">{H.H2}</div>
              </div>
            </div>
            <div className="text-center text-[8px] font-mono text-red-500 font-bold mt-1">{H.H2p} ≠ {H.H2}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cascade full display */}
      <AnimatePresence>
        {phase === "cascade_full" && (
          <motion.div
            key="cascade"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border p-2.5 space-y-1"
            style={{ borderColor: `${color}25`, background: `${color}05` }}
          >
            <div className="text-[8px] font-mono font-bold mb-1" style={{ color }}>DEPENDENCY CASCADE MAP</div>
            <div className="grid grid-cols-4 gap-1 text-[7.5px] font-mono text-center">
              {[
                { label: "TAMPER #2", sub: "H2→H2'", c: "#f87171" },
                { label: "#3 BREAKS", sub: "H2'≠H2", c: "#ef4444" },
                { label: "REBUILD #3", sub: "H3→H3'", c: "#fbbf24" },
                { label: "#4 BREAKS", sub: "H3'≠H3", c: "#ef4444" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="rounded-lg border px-1 py-1"
                  style={{ borderColor: `${item.c}40`, color: item.c, background: `${item.c}0a` }}
                >
                  <div className="font-bold">{item.label}</div>
                  <div className="text-[6.5px] text-slate-400 mt-0.5">{item.sub}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Validation scan panel */}
      <AnimatePresence>
        {phase === "validation_scan" && (
          <motion.div
            key="vscan"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border p-2.5 space-y-1.5"
            style={{ borderColor: "#7f1d1d50", background: "rgba(127,29,29,0.08)" }}
          >
            <div className="text-[8.5px] font-mono text-red-400 font-bold">NODE VALIDATION SCAN</div>
            <div className="space-y-0.5">
              <div className="flex items-center justify-between text-[7.5px] font-mono">
                <span className="text-slate-400">CHECK: HASH(#1) = PREV(#2)</span>
                <span className="text-green-400 flex items-center gap-1"><CheckCircle size={8} /> MATCH</span>
              </div>
              <div className="flex items-center justify-between text-[7.5px] font-mono">
                <span className="text-slate-400">CHECK: HASH(#2) = PREV(#3)</span>
                <span className="text-red-400 flex items-center gap-1"><XCircle size={8} /> MISMATCH</span>
              </div>
              <div className="text-[7.5px] font-mono text-red-400 mt-1 flex items-center gap-1">
                <AlertTriangle size={8} /> HISTORICAL INCONSISTENCY — SCAN HALTED
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Telemetry + Status */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border p-2.5 space-y-1" style={{ borderColor: `${color}20`, background: `${color}05` }}>
          <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">CASCADE MONITOR</div>
          {[
            ["BLOCKS", "5"],
            ["VALID LINKS", validLinks.toString()],
            ["BROKEN", brokenLinks.toString()],
            ["DOMINOES", state.dominoCount.toString()],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-[8px] font-mono">
              <span className="text-slate-500">{k}</span>
              <span style={{
                color: k === "BROKEN" && brokenLinks > 0 ? "#f87171"
                  : k === "DOMINOES" && state.dominoCount > 0 ? "#fbbf24"
                  : k === "VALID LINKS" && validLinks === 4 ? "#4ade80"
                  : "#94a3b8",
              }}>{v}</span>
            </div>
          ))}
          {/* Cascade progress indicator */}
          {state.dominoCount > 0 && (
            <div className="pt-1 border-t border-white/5">
              <div className="text-[7px] font-mono text-slate-600 mb-0.5">CASCADE POSITION</div>
              <div className="flex items-center gap-0.5">
                {[2, 3, 4, 5].map((n, i) => (
                  <div key={n} className="flex items-center gap-0.5">
                    <div
                      className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[6px] font-mono font-bold"
                      style={{
                        background: i < state.dominoCount ? "#ef4444" : "#1e293b",
                        color: i < state.dominoCount ? "white" : "#475569",
                        border: `1px solid ${i < state.dominoCount ? "#ef4444" : "#334155"}`,
                      }}
                    >
                      {n}
                    </div>
                    {i < 3 && <div className="text-[6px] text-slate-600">→</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div
          className="rounded-xl border p-2.5 flex flex-col items-center justify-center gap-1.5"
          style={{
            borderColor: chainHealthy || ["restore", "loop_wait", "scan_done"].includes(phase) ? "#14532d"
              : brokenLinks > 0 || state.dominoCount > 0 ? "#7f1d1d"
              : `${color}20`,
            background: chainHealthy || ["restore", "loop_wait", "scan_done"].includes(phase) ? "rgba(20,83,45,0.10)"
              : brokenLinks > 0 || state.dominoCount > 0 ? "rgba(127,29,29,0.10)"
              : `${color}05`,
          }}
        >
          {chainHealthy || ["scan_done", "restore", "loop_wait"].includes(phase) ? (
            <>
              <ShieldCheck size={20} className="text-green-400" />
              <div className="text-[8px] font-mono text-green-400 font-bold text-center">CHAIN HEALTHY</div>
              <div className="text-[7px] font-mono text-green-400/60 text-center">ALL LINKS VALID</div>
            </>
          ) : brokenLinks > 0 || state.dominoCount > 0 ? (
            <>
              <ShieldAlert size={20} className="text-red-400" />
              <div className="text-[8px] font-mono text-red-400 font-bold text-center">
                {state.dominoCount > 0 ? `${state.dominoCount} DOMINO${state.dominoCount > 1 ? "S" : ""} FALLEN` : "INTEGRITY FAILURE"}
              </div>
            </>
          ) : (
            <>
              <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.4, repeat: Infinity }}>
                <Zap size={18} style={{ color }} />
              </motion.div>
              <div className="text-[8px] font-mono text-slate-400 text-center">BUILDING...</div>
            </>
          )}
        </div>
      </div>

      {/* Before / After strip — shown in cascade_full and validation_scan */}
      <AnimatePresence>
        {["cascade_full", "validation_scan"].includes(phase) && (
          <motion.div
            key="beforeafter"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border p-2.5 space-y-1.5"
            style={{ borderColor: `${color}20`, background: `${color}04` }}
          >
            <div className="text-[7.5px] font-mono text-slate-500 uppercase tracking-widest">BEFORE vs AFTER</div>
            <div className="flex flex-col gap-1">
              <div>
                <span className="text-[7px] font-mono text-green-400 mr-1">BEFORE:</span>
                <span className="text-[7px] font-mono text-slate-300">B1 ─✓─ B2 ─✓─ B3 ─✓─ B4 ─✓─ B5</span>
              </div>
              <div>
                <span className="text-[7px] font-mono text-amber-400 mr-1">TAMPER:</span>
                <span className="text-[7px] font-mono text-slate-300">B1 ─✓─ B2' ─✕─ B3 ─✓─ B4 ─✓─ B5</span>
              </div>
              <div>
                <span className="text-[7px] font-mono text-amber-400 mr-1">REBUILD:</span>
                <span className="text-[7px] font-mono text-slate-300">B1 ─✓─ B2' ─✓─ B3' ─✕─ B4 ─✓─ B5</span>
              </div>
              <div>
                <span className="text-[7px] font-mono text-red-400 mr-1">CASCADE:</span>
                <span className="text-[7px] font-mono text-slate-300">B1 ─✓─ B2' ─✓─ B3' ─✓─ B4' ─✕─ B5</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

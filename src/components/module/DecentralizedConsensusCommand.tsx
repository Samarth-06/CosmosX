import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ShieldAlert, AlertTriangle, RefreshCw, Wifi, WifiOff, Zap } from "lucide-react";

interface Props {
  color: string;
}

type Phase =
  | "init"
  | "network_sync"
  | "all_healthy"
  | "attacker_focus"
  | "tamper_b2"
  | "attacker_rebuild"
  | "attacker_local_valid"
  | "zoom_out"
  | "reveal_fork"
  | "broadcast_attack"
  | "nodes_evaluate"
  | "work_compare"
  | "honest_preferred"
  | "honest_extends"
  | "hash_race"
  | "intro_51"
  | "sim_majority"
  | "reorg_risk"
  | "restore"
  | "summary"
  | "loop_wait";

const SEQUENCE: { phase: Phase; delay: number; msg: string }[] = [
  { phase: "init",               delay: 0,     msg: "INITIALIZING DECENTRALIZED CONSENSUS COMMAND..." },
  { phase: "network_sync",       delay: 1500,  msg: "SYNCHRONIZING 5 HONEST NODES ACROSS NETWORK..." },
  { phase: "all_healthy",        delay: 4000,  msg: "✓ NETWORK SYNCHRONIZED — ALL NODES CONSENSUS ACHIEVED" },
  { phase: "attacker_focus",     delay: 6500,  msg: "MONITORING ATTACKER NODE X — PRIVATE FORK DETECTED" },
  { phase: "tamper_b2",          delay: 8500,  msg: "⚠ ATTACKER MODIFYING BLOCK #2 — FUEL: 100 → 900" },
  { phase: "attacker_rebuild",   delay: 11000, msg: "ATTACKER REBUILDING CHAIN: B3'→ B4'→ B5'..." },
  { phase: "attacker_local_valid", delay: 14000, msg: "ATTACKER LOCAL CHAIN INTERNALLY VALID — HASH LINKS CONSISTENT" },
  { phase: "zoom_out",           delay: 17000, msg: "LOCAL VALIDITY ≠ NETWORK ACCEPTANCE" },
  { phase: "reveal_fork",        delay: 19000, msg: "TWO COMPETING HISTORIES DETECTED" },
  { phase: "broadcast_attack",   delay: 21500, msg: "ATTACKER BROADCASTING PRIVATE CHAIN TO NETWORK..." },
  { phase: "nodes_evaluate",     delay: 24000, msg: "NODES INDEPENDENTLY VALIDATING COMPETING CHAINS..." },
  { phase: "work_compare",       delay: 27000, msg: "FORK-CHOICE: COMPARING CUMULATIVE PROOF-OF-WORK..." },
  { phase: "honest_preferred",   delay: 29500, msg: "✓ HONEST CHAIN PREFERRED — GREATER CUMULATIVE WORK" },
  { phase: "honest_extends",     delay: 32000, msg: "HONEST NETWORK EXTENDING LEAD..." },
  { phase: "hash_race",          delay: 35000, msg: "COMPUTATIONAL RACE: HONEST MAJORITY MAINTAINS ADVANTAGE" },
  { phase: "intro_51",           delay: 38000, msg: "⚠ CONCEPT: WHAT IF ATTACKER GAINS MAJORITY HASH POWER?" },
  { phase: "sim_majority",       delay: 41000, msg: "⚠ SIMULATING 55% ATTACKER HASH POWER..." },
  { phase: "reorg_risk",         delay: 44000, msg: "⚠ REORGANIZATION RISK — ATTACKER CHAIN OVERTAKING" },
  { phase: "restore",            delay: 47500, msg: "RESTORING NORMAL SCENARIO: 80% HONEST MAJORITY" },
  { phase: "summary",            delay: 50000, msg: "✓ DECENTRALIZED SECURITY MODEL DEMONSTRATED" },
  { phase: "loop_wait",          delay: 53000, msg: "✓ NETWORK CONSENSUS STABLE — HONEST CHAIN PREFERRED" },
];

type NodeStatus = "sync" | "honest" | "evaluating" | "decided";

interface NodeDef {
  id: string;
  label: string;
  isAttacker?: boolean;
}

const HONEST_NODES: NodeDef[] = [
  { id: "A", label: "NODE A" },
  { id: "B", label: "NODE B" },
  { id: "C", label: "NODE C" },
  { id: "D", label: "NODE D" },
  { id: "E", label: "NODE E" },
];

function NodeBadge({
  node,
  status,
  color,
  isAttacker,
  decision,
}: {
  node: NodeDef;
  status: NodeStatus;
  color: string;
  isAttacker?: boolean;
  decision?: "honest" | "attacker" | null;
}) {
  const bc = isAttacker ? "#ef4444"
    : status === "sync" ? `${color}60`
    : status === "evaluating" ? "#f59e0b"
    : decision === "honest" ? "#22c55e"
    : `${color}60`;

  const bg = isAttacker ? "rgba(127,29,29,0.20)"
    : status === "evaluating" ? "rgba(120,53,15,0.15)"
    : decision === "honest" ? "rgba(20,83,45,0.15)"
    : `${color}08`;

  return (
    <motion.div
      layout
      className="rounded-lg border px-2 py-1.5 text-center"
      style={{ borderColor: bc, background: bg }}
      animate={status === "sync" ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
      transition={{ duration: 1.2, repeat: status === "sync" ? Infinity : 0 }}
    >
      <div className="text-[7.5px] font-mono font-bold" style={{ color: isAttacker ? "#f87171" : bc }}>
        {isAttacker ? "⚔ " : ""}{node.label}
      </div>
      <div className="text-[6.5px] font-mono mt-0.5" style={{
        color: isAttacker ? "#f87171"
          : status === "evaluating" ? "#fbbf24"
          : decision === "honest" ? "#4ade80"
          : "#475569"
      }}>
        {isAttacker ? "ATTACKER"
          : status === "sync" ? "SYNCING..."
          : status === "evaluating" ? "EVALUATING"
          : decision === "honest" ? "✓ HONEST"
          : "LEDGER ✓"}
      </div>
    </motion.div>
  );
}

function ChainBar({
  label,
  blocks,
  work,
  isPreferred,
  isAttacker,
  color,
  dim,
}: {
  label: string;
  blocks: string[];
  work: number;
  isPreferred?: boolean;
  isAttacker?: boolean;
  color: string;
  dim?: boolean;
}) {
  const bc = isAttacker ? "#ef444440" : isPreferred ? "#22c55e40" : `${color}30`;
  const bg = isAttacker ? "rgba(127,29,29,0.10)" : isPreferred ? "rgba(20,83,45,0.10)" : `${color}06`;
  const hashColor = isAttacker ? "#f87171" : isPreferred ? "#4ade80" : "#94a3b8";

  return (
    <motion.div
      layout
      className="rounded-xl border p-2"
      style={{ borderColor: bc, background: bg, opacity: dim ? 0.4 : 1 }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-[7.5px] font-mono font-bold" style={{ color: isAttacker ? "#f87171" : isPreferred ? "#4ade80" : color }}>
          {label}
        </div>
        <div className="text-[7px] font-mono" style={{ color: hashColor }}>
          WORK: {work}
        </div>
      </div>
      <div className="flex items-center gap-0.5 flex-wrap">
        {blocks.map((b, i) => (
          <div key={i} className="flex items-center gap-0.5">
            <div
              className="rounded px-1.5 py-0.5 text-[7px] font-mono font-bold"
              style={{
                background: isAttacker ? "rgba(127,29,29,0.20)" : `${color}12`,
                color: isAttacker ? "#f87171" : isPreferred ? "#4ade80" : "#94a3b8",
                border: `1px solid ${isAttacker ? "#ef444430" : `${color}25`}`,
              }}
            >
              {b}
            </div>
            {i < blocks.length - 1 && (
              <div className="text-[7px]" style={{ color: isAttacker ? "#ef444450" : `${color}50` }}>→</div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex items-center gap-1">
        <div className="flex-1 h-1 rounded-full bg-slate-800 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: isAttacker ? "#ef4444" : isPreferred ? "#22c55e" : color }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((work / 200) * 100, 100)}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <div className="text-[6.5px] font-mono" style={{ color: isPreferred ? "#4ade80" : isAttacker ? "#f87171" : "#64748b" }}>
          {isPreferred ? "✓ PREFERRED" : isAttacker ? "✕ FORK" : ""}
        </div>
      </div>
    </motion.div>
  );
}

export default function DecentralizedConsensusCommand({ color }: Props) {
  const [phase, setPhase] = useState<Phase>("init");
  const [progressMsg, setProgressMsg] = useState("INITIALIZING DECENTRALIZED CONSENSUS COMMAND...");

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
      }, 55000);
      timers.push(loopT);
    };
    run();
    return () => timers.forEach(clearTimeout);
  }, []);

  // Derived display values
  const showNodes = !["init"].includes(phase);

  const nodeStatus: NodeStatus = ["network_sync"].includes(phase) ? "sync"
    : ["nodes_evaluate"].includes(phase) ? "evaluating"
    : "honest";

  const nodeDecision: "honest" | "attacker" | null =
    ["honest_preferred", "honest_extends", "hash_race", "intro_51", "restore", "summary", "loop_wait"].includes(phase) ? "honest"
    : null;

  const showAttackerChain = !["init", "network_sync", "all_healthy"].includes(phase);
  const showHonestChain = showNodes;

  // Honest chain grows over time
  const honestBlocks = ["hash_race", "intro_51", "sim_majority", "reorg_risk", "restore", "summary", "loop_wait"].includes(phase)
    ? ["B1","B2","B3","B4","B5","B6","B7","B8"]
    : ["honest_extends"].includes(phase)
    ? ["B1","B2","B3","B4","B5","B6","B7"]
    : ["B1","B2","B3","B4","B5","B6"];

  const attackerBlocks = ["attacker_focus","tamper_b2"].includes(phase)
    ? ["B1","B2","B3","B4","B5"]
    : ["attacker_rebuild"].includes(phase)
    ? ["B1","B2'","B3'"]
    : ["B1","B2'","B3'","B4'","B5'"];

  const honestWork = ["hash_race","intro_51"].includes(phase) ? 170
    : ["sim_majority"].includes(phase) ? 155
    : ["reorg_risk"].includes(phase) ? 170
    : ["restore","summary","loop_wait"].includes(phase) ? 250
    : ["honest_extends"].includes(phase) ? 145
    : 120;

  const attackerWork = ["sim_majority","reorg_risk"].includes(phase) ? (phase === "reorg_risk" ? 180 : 125)
    : ["hash_race","intro_51"].includes(phase) ? 82
    : ["restore","summary","loop_wait"].includes(phase) ? 110
    : 70;

  const isMajorityAttack = ["sim_majority","reorg_risk"].includes(phase);
  const honestHashPct = isMajorityAttack ? 45 : 80;
  const attackerHashPct = isMajorityAttack ? 55 : 20;

  const isPreferred = !["reorg_risk"].includes(phase);
  const showWorkCompare = ["work_compare","honest_preferred","honest_extends","hash_race","intro_51","sim_majority","reorg_risk","restore","summary","loop_wait"].includes(phase);
  const showFork = ["reveal_fork","broadcast_attack","nodes_evaluate","work_compare","honest_preferred","honest_extends","hash_race","intro_51","sim_majority","reorg_risk","restore","summary","loop_wait"].includes(phase);

  const msgType = progressMsg.startsWith("✓") ? "ok"
    : progressMsg.startsWith("⚠") ? "warn"
    : "neutral";
  const msgColor = msgType === "ok" ? "#4ade80" : msgType === "warn" ? "#fbbf24" : color;
  const msgBorder = msgType === "ok" ? "#14532d" : msgType === "warn" ? "#78350f" : `${color}25`;
  const msgBg = msgType === "ok" ? "rgba(20,83,45,0.10)" : msgType === "warn" ? "rgba(120,53,15,0.10)" : `${color}06`;

  return (
    <div
      className="rounded-2xl border flex flex-col gap-3 p-4 h-full"
      style={{ borderColor: `${color}30`, background: "linear-gradient(145deg,rgba(2,6,23,0.98),rgba(5,10,30,0.95))" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono font-bold tracking-widest uppercase" style={{ color }}>
            DECENTRALIZED CONSENSUS COMMAND
          </div>
          <div className="text-[8px] font-mono text-slate-500 tracking-widest uppercase mt-0.5">
            LOCAL FRAUD vs NETWORK CONSENSUS
          </div>
        </div>
        <motion.div
          animate={["network_sync","nodes_evaluate","attacker_rebuild"].includes(phase) ? { rotate: 360 } : {}}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw size={14} style={{ color: `${color}70` }} />
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

      {/* Network Node Map */}
      <AnimatePresence>
        {showNodes && (
          <motion.div key="nodes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {/* Honest Nodes */}
            <div className="grid grid-cols-5 gap-1.5">
              {HONEST_NODES.map(n => (
                <NodeBadge
                  key={n.id}
                  node={n}
                  status={nodeStatus}
                  color={color}
                  decision={nodeDecision}
                />
              ))}
            </div>
            {/* Attacker Node */}
            {showAttackerChain && (
              <div className="grid grid-cols-5 gap-1.5">
                <NodeBadge
                  node={{ id: "X", label: "NODE X" }}
                  status="honest"
                  color={color}
                  isAttacker
                />
                {/* Local validity note */}
                {["attacker_local_valid","zoom_out"].includes(phase) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-4 rounded-lg border px-2 py-1.5 flex items-center gap-2"
                    style={{ borderColor: "#f59e0b40", background: "rgba(120,53,15,0.10)" }}
                  >
                    <AlertTriangle size={10} className="text-amber-400 shrink-0" />
                    <div className="text-[7.5px] font-mono text-amber-300">
                      LOCAL HASH LINKS VALID — BUT LOCAL VALIDITY ≠ NETWORK ACCEPTANCE
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chain histories */}
      <div className="flex flex-col gap-2 flex-1 min-h-0">
        {/* Honest chain */}
        {showHonestChain && (
          <ChainBar
            label="HONEST NETWORK CHAIN"
            blocks={honestBlocks}
            work={honestWork}
            isPreferred={!["reorg_risk"].includes(phase) && showFork}
            color={color}
            dim={["attacker_focus","tamper_b2","attacker_rebuild","attacker_local_valid"].includes(phase)}
          />
        )}

        {/* Attacker chain */}
        {showAttackerChain && (
          <ChainBar
            label="ATTACKER PRIVATE FORK"
            blocks={attackerBlocks}
            work={attackerWork}
            isAttacker
            isPreferred={phase === "reorg_risk"}
            color={color}
          />
        )}

        {/* Fork choice comparison */}
        <AnimatePresence>
          {showWorkCompare && (
            <motion.div
              key="forkcompare"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl border p-2.5 space-y-2"
              style={{
                borderColor: phase === "reorg_risk" ? "#ef444440" : "#14532d50",
                background: phase === "reorg_risk" ? "rgba(127,29,29,0.08)" : "rgba(20,83,45,0.08)",
              }}
            >
              <div className="text-[8px] font-mono font-bold" style={{ color: phase === "reorg_risk" ? "#f87171" : "#4ade80" }}>
                {phase === "reorg_risk" ? "⚠ REORGANIZATION RISK — ATTACKER CHAIN OVERTAKING" : "FORK-CHOICE: SIMPLIFIED PoW MODEL"}
              </div>

              {/* Work comparison */}
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center rounded-lg border p-2"
                  style={{ borderColor: phase === "reorg_risk" ? "#22c55e30" : "#22c55e50", background: "rgba(20,83,45,0.10)" }}>
                  <div className="text-[7px] font-mono text-slate-500">HONEST CHAIN</div>
                  <div className="text-[11px] font-mono font-bold text-green-400">{honestWork}</div>
                  <div className="text-[6.5px] font-mono text-slate-500">CUMULATIVE WORK</div>
                </div>
                <div className="text-center rounded-lg border p-2"
                  style={{ borderColor: phase === "reorg_risk" ? "#ef444460" : "#ef444430", background: "rgba(127,29,29,0.10)" }}>
                  <div className="text-[7px] font-mono text-slate-500">ATTACKER FORK</div>
                  <div className="text-[11px] font-mono font-bold text-red-400">{attackerWork}</div>
                  <div className="text-[6.5px] font-mono text-slate-500">CUMULATIVE WORK</div>
                </div>
              </div>

              {phase !== "reorg_risk" ? (
                <div className="text-center text-[8px] font-mono text-green-400 font-bold">
                  {honestWork} &gt; {attackerWork} → ✓ HONEST CHAIN PREFERRED
                </div>
              ) : (
                <div className="text-center text-[8px] font-mono text-red-400 font-bold">
                  {attackerWork} &gt; {honestWork} → ⚠ ATTACKER CHAIN MAY BE PREFERRED
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hash power meter */}
        <AnimatePresence>
          {["hash_race","intro_51","sim_majority","reorg_risk","restore","summary","loop_wait"].includes(phase) && (
            <motion.div
              key="hashpower"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl border p-2.5 space-y-2"
              style={{ borderColor: `${color}20`, background: `${color}05` }}
            >
              <div className="text-[8px] font-mono font-bold" style={{ color }}>
                {isMajorityAttack ? "⚠ SIMULATED MAJORITY ATTACK" : "NETWORK HASH POWER DISTRIBUTION"}
              </div>

              {/* Honest bar */}
              <div className="space-y-0.5">
                <div className="flex justify-between text-[7.5px] font-mono">
                  <span className="text-green-400">HONEST NETWORK</span>
                  <span className="text-green-400 font-bold">{honestHashPct}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-green-500"
                    animate={{ width: `${honestHashPct}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>

              {/* Attacker bar */}
              <div className="space-y-0.5">
                <div className="flex justify-between text-[7.5px] font-mono">
                  <span className="text-red-400">ATTACKER NODE</span>
                  <span className="text-red-400 font-bold">{attackerHashPct}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-red-500"
                    animate={{ width: `${attackerHashPct}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>

              {isMajorityAttack && (
                <div className="text-[7.5px] font-mono text-amber-400 text-center">
                  ⚠ MAJORITY ATTACK: Attacker may gain statistical advantage in extending private chain
                </div>
              )}
              {phase === "reorg_risk" && (
                <div className="rounded-lg border px-2 py-1.5 text-[7.5px] font-mono text-amber-300 space-y-0.5"
                  style={{ borderColor: "#78350f50", background: "rgba(120,53,15,0.12)" }}>
                  <div className="font-bold text-amber-400">LIMITS OF A MAJORITY ATTACK:</div>
                  <div>✓ May enable recent block reorganization</div>
                  <div>✗ Cannot forge other users' signatures</div>
                  <div>✗ Cannot change protocol rules</div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary mental model */}
        <AnimatePresence>
          {["summary","loop_wait"].includes(phase) && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl border p-2.5 space-y-1.5"
              style={{ borderColor: "#14532d50", background: "rgba(20,83,45,0.08)" }}
            >
              <div className="text-[8px] font-mono text-green-400 font-bold">DECENTRALIZED SECURITY MODEL</div>
              <div className="grid grid-cols-2 gap-1 text-[7.5px] font-mono">
                {[
                  { t: "HASH LINKS", s: "Structural integrity" },
                  { t: "DECENTRALIZED COPIES", s: "No single authority" },
                  { t: "FORK-CHOICE RULE", s: "Determines preferred chain" },
                  { t: "DISTRIBUTED WORK", s: "Makes history replacement hard" },
                ].map(({ t, s }) => (
                  <div key={t} className="rounded-lg border px-2 py-1" style={{ borderColor: "#14532d40", background: "rgba(20,83,45,0.10)" }}>
                    <div className="text-green-400 font-bold">{t}</div>
                    <div className="text-slate-400 text-[6.5px] mt-0.5">{s}</div>
                  </div>
                ))}
              </div>
              <div className="text-center text-[7.5px] font-mono text-slate-400 italic pt-1">
                "Recalculating a fraudulent chain locally does not force a decentralized network to accept it."
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Broadcast animation overlay */}
        <AnimatePresence>
          {phase === "broadcast_attack" && (
            <motion.div
              key="broadcast"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border p-2.5"
              style={{ borderColor: "#ef444430", background: "rgba(127,29,29,0.08)" }}
            >
              <div className="text-[8px] font-mono text-red-400 font-bold mb-1.5">ATTACKER BROADCASTING PRIVATE CHAIN</div>
              <div className="grid grid-cols-5 gap-1">
                {HONEST_NODES.map((n, i) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.2 }}
                    className="text-center rounded-lg border px-1 py-1"
                    style={{ borderColor: "#f59e0b30", background: "rgba(120,53,15,0.10)" }}
                  >
                    <div className="text-[6.5px] font-mono text-amber-400">{n.label}</div>
                    <div className="text-[6px] font-mono text-slate-400 mt-0.5">RECEIVED</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Telemetry Footer */}
      <div className="grid grid-cols-2 gap-2">
        {/* Telemetry */}
        <div className="rounded-xl border p-2.5 space-y-0.5" style={{ borderColor: `${color}20`, background: `${color}05` }}>
          <div className="text-[7.5px] font-mono text-slate-500 uppercase tracking-widest mb-1">CONSENSUS MONITOR</div>
          {[
            ["HONEST NODES", "5"],
            ["ATTACKER NODES", "1"],
            ["HONEST WORK", honestWork.toString()],
            ["ATTACK WORK", attackerWork.toString()],
            ["PREFERRED", phase === "reorg_risk" ? "EVALUATING" : "HONEST"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-[7.5px] font-mono">
              <span className="text-slate-500">{k}</span>
              <span style={{
                color: k === "PREFERRED" && v === "HONEST" ? "#4ade80"
                  : k === "PREFERRED" && v === "EVALUATING" ? "#fbbf24"
                  : k === "HONEST WORK" ? "#4ade80"
                  : k === "ATTACK WORK" ? "#f87171"
                  : "#94a3b8",
              }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Status */}
        <div
          className="rounded-xl border p-2.5 flex flex-col items-center justify-center gap-1.5"
          style={{
            borderColor: phase === "reorg_risk" ? "#7f1d1d"
              : ["summary","loop_wait","honest_preferred","restore"].includes(phase) ? "#14532d"
              : `${color}20`,
            background: phase === "reorg_risk" ? "rgba(127,29,29,0.12)"
              : ["summary","loop_wait","honest_preferred","restore"].includes(phase) ? "rgba(20,83,45,0.10)"
              : `${color}05`,
          }}
        >
          {phase === "reorg_risk" ? (
            <>
              <ShieldAlert size={20} className="text-red-400" />
              <div className="text-[8px] font-mono text-red-400 font-bold text-center">REORG RISK</div>
              <div className="text-[6.5px] font-mono text-red-400/60 text-center">MAJORITY ATTACK</div>
            </>
          ) : ["summary","loop_wait","honest_preferred","restore","honest_extends","hash_race"].includes(phase) ? (
            <>
              <ShieldCheck size={20} className="text-green-400" />
              <div className="text-[8px] font-mono text-green-400 font-bold text-center">CONSENSUS STABLE</div>
              <div className="text-[6.5px] font-mono text-green-400/60 text-center">HONEST PREFERRED</div>
            </>
          ) : ["network_sync","nodes_evaluate"].includes(phase) ? (
            <>
              <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }}>
                <Wifi size={18} style={{ color }} />
              </motion.div>
              <div className="text-[8px] font-mono text-slate-400 text-center">SYNCING...</div>
            </>
          ) : ["attacker_focus","tamper_b2","attacker_rebuild","attacker_local_valid","zoom_out","reveal_fork","broadcast_attack"].includes(phase) ? (
            <>
              <AlertTriangle size={18} className="text-amber-400" />
              <div className="text-[8px] font-mono text-amber-400 font-bold text-center">FORK DETECTED</div>
            </>
          ) : (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                <Zap size={18} style={{ color: `${color}80` }} />
              </motion.div>
              <div className="text-[8px] font-mono text-slate-400 text-center">INITIALIZING</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ShieldAlert, RefreshCw, Lock, Unlock, AlertTriangle, CheckCircle, Search, Wrench, Zap, ChevronRight } from "lucide-react";

interface Props {
  color: string;
}

// Hash constants
const H: Record<string, string> = {
  H1:    "A7F9...42CD",
  H2:    "F82C...91AB",   // trusted original B2 hash
  H2c:   "91BE...73FA",   // corrupted B2 hash
  H3:    "C39E...27DF",
  H4:    "D12F...88AC",
  H5:    "E7A3...15BD",
};

type Stage =
  | "boot"
  | "scan_ready"
  | "scanning"
  | "scan_done"
  | "inspect_ready"
  | "inspecting"
  | "tamper_found"
  | "restore_ready"
  | "restoring"
  | "hash_calc"
  | "link_repaired"
  | "downstream_check"
  | "full_validate"
  | "validating"
  | "validate_done"
  | "network_confirm"
  | "nozzle_unlock"
  | "nozzle_aligning"
  | "complete";

type LinkState = "unknown" | "valid" | "broken" | "restored" | "validating";

interface Objective {
  label: string;
  done: boolean;
}

function getObjectives(stage: Stage): Objective[] {
  const s = (label: string, done: boolean) => ({ label, done });
  const after = (target: Stage, stages: Stage[]) => stages.indexOf(stage) >= stages.indexOf(target);
  const stageOrder: Stage[] = ["boot","scan_ready","scanning","scan_done","inspect_ready","inspecting","tamper_found","restore_ready","restoring","hash_calc","link_repaired","downstream_check","full_validate","validating","validate_done","network_confirm","nozzle_unlock","nozzle_aligning","complete"];
  const idx = (t: Stage) => stageOrder.indexOf(t);
  const i = idx(stage);
  return [
    s("Scan blockchain integrity",         i >= idx("scan_done")),
    s("Locate corrupted block",            i >= idx("tamper_found")),
    s("Recalculate corrupted hash",        i >= idx("hash_calc")),
    s("Repair broken hash reference",      i >= idx("link_repaired")),
    s("Validate downstream dependencies",  i >= idx("downstream_check")),
    s("Validate complete blockchain",      i >= idx("validate_done")),
    s("Realign Rocket Nozzle",             i >= idx("complete")),
  ];
}

type BlockStatus = "unknown" | "valid" | "corrupted" | "repaired" | "scanning";

function BlockCard({
  num, prevHash, ownHash, status, selected, color, onClick, scanActive,
}: {
  num: number; prevHash: string; ownHash: string;
  status: BlockStatus; selected: boolean; color: string;
  onClick?: () => void; scanActive?: boolean;
}) {
  const bc = status === "corrupted" ? "#ef444460"
    : status === "repaired" || status === "valid" ? "#22c55e40"
    : selected ? `${color}70`
    : scanActive ? "#22d3ee50"
    : `${color}30`;
  const bg = status === "corrupted" ? "rgba(127,29,29,0.18)"
    : status === "repaired" || status === "valid" ? "rgba(20,83,45,0.14)"
    : selected ? `${color}10`
    : scanActive ? "rgba(34,211,238,0.06)"
    : "rgba(15,23,42,0.9)";
  const badge = status === "corrupted" ? "TAMPERED"
    : status === "repaired" ? "REPAIRED"
    : status === "valid" ? "VALID"
    : status === "scanning" ? "SCANNING"
    : "UNKNOWN";
  const badgeColor = status === "corrupted" ? "#f87171"
    : status === "repaired" || status === "valid" ? "#4ade80"
    : status === "scanning" ? "#22d3ee"
    : "#64748b";

  return (
    <motion.div
      layout
      className={`rounded-xl border p-2.5 flex flex-col gap-1 cursor-pointer transition-all ${onClick ? "hover:scale-105" : ""}`}
      style={{ borderColor: bc, background: bg, boxShadow: selected ? `0 0 10px ${color}20` : "none" }}
      onClick={onClick}
      animate={scanActive ? { boxShadow: ["0 0 0px rgba(34,211,238,0)", "0 0 12px rgba(34,211,238,0.3)", "0 0 0px rgba(34,211,238,0)"] } : {}}
      transition={{ duration: 0.8, repeat: Infinity }}
    >
      <div className="flex items-center justify-between">
        <div className="text-[8px] font-mono font-bold" style={{ color }}>BLOCK #{num}</div>
        <div className="text-[6.5px] font-mono" style={{ color: badgeColor }}>{badge}</div>
      </div>
      <div className="border-t border-white/5 pt-1 space-y-0.5">
        <div className="text-[6.5px] font-mono text-slate-600">PREV HASH</div>
        <div className="text-[7px] font-mono text-slate-400 truncate">{prevHash === "—" ? "000...000" : prevHash}</div>
      </div>
      <div className="border-t border-white/5 pt-1 space-y-0.5">
        <div className="text-[6.5px] font-mono text-slate-600">HASH</div>
        <div className="text-[7px] font-mono truncate" style={{ color: status === "corrupted" ? "#f87171" : status === "repaired" || status === "valid" ? "#4ade80" : "#22d3ee" }}>
          {num === 2 && ["corrupted","unknown"].includes(status) ? H.H2c : ownHash}
        </div>
      </div>
    </motion.div>
  );
}

function LinkConnector({ state }: { state: LinkState }) {
  const c = state === "valid" || state === "restored" ? "#22c55e"
    : state === "broken" ? "#ef4444"
    : state === "validating" ? "#22d3ee"
    : "#334155";
  return (
    <div className="flex flex-col items-center justify-center gap-0.5 px-0.5 shrink-0" style={{ minWidth: 24 }}>
      <div className="h-0.5 w-full rounded" style={{ backgroundColor: c }} />
      <motion.div
        className="text-[8px] font-mono"
        style={{ color: c }}
        animate={state === "validating" ? { opacity: [0.3, 1, 0.3] } : {}}
        transition={{ duration: 0.8, repeat: Infinity }}
      >
        {state === "broken" ? "✕" : state === "valid" || state === "restored" ? "✓" : "─"}
      </motion.div>
    </div>
  );
}

export default function GalacticBlockchainRepair({ color }: Props) {
  const [stage, setStage] = useState<Stage>("boot");
  const [scanIdx, setScanIdx] = useState(-1);          // 0-3 = which link is being scanned
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  const [fuelInput, setFuelInput] = useState("900");
  const [fuelError, setFuelError] = useState(false);
  const [nozzleAngle, setNozzleAngle] = useState(17.4);
  const [hint, setHint] = useState<string | null>(null);
  const scanRef = useRef<NodeJS.Timeout | null>(null);
  const nozzleRef = useRef<NodeJS.Timeout | null>(null);

  // Boot sequence
  useEffect(() => {
    const t = setTimeout(() => setStage("scan_ready"), 2800);
    return () => clearTimeout(t);
  }, []);

  // Nozzle alignment animation
  useEffect(() => {
    if (stage === "nozzle_aligning") {
      const steps = [17.4, 12.0, 7.5, 3.2, 0.0];
      let i = 0;
      const tick = () => {
        i++;
        if (i < steps.length) {
          setNozzleAngle(steps[i]);
          nozzleRef.current = setTimeout(tick, 600);
        } else {
          setTimeout(() => setStage("complete"), 800);
        }
      };
      nozzleRef.current = setTimeout(tick, 700);
      return () => { if (nozzleRef.current) clearTimeout(nozzleRef.current); };
    }
  }, [stage]);

  const runScan = () => {
    setStage("scanning");
    setScanIdx(0);
    let idx = 0;
    const advance = () => {
      idx++;
      if (idx <= 1) { // Link 0 (B1→B2) is valid, link 1 (B2→B3) is broken — stop
        setScanIdx(idx);
        if (idx === 1) {
          setTimeout(() => { setStage("scan_done"); setScanIdx(-1); }, 1200);
          return;
        }
      }
      scanRef.current = setTimeout(advance, 900);
    };
    scanRef.current = setTimeout(advance, 900);
  };

  const inspectBlock2 = () => {
    setSelectedBlock(2);
    setStage("inspecting");
  };

  const markCorrupted = () => {
    if (selectedBlock !== 2) {
      setHint("No direct data anomaly in that block. Check the block immediately before the first broken link.");
      return;
    }
    setStage("tamper_found");
  };

  const tryRestore = () => {
    if (fuelInput.trim() !== "90") {
      setFuelError(true);
      setTimeout(() => setFuelError(false), 1500);
      return;
    }
    setStage("restoring");
    setTimeout(() => setStage("hash_calc"), 1200);
  };

  const applyHash = () => {
    setStage("link_repaired");
  };

  const continueValidation = () => {
    setStage("downstream_check");
    setTimeout(() => setStage("full_validate"), 1500);
  };

  const runFullValidation = () => {
    setStage("validating");
    setTimeout(() => setStage("validate_done"), 3000);
  };

  const confirmNetwork = () => {
    setStage("network_confirm");
    setTimeout(() => setStage("nozzle_unlock"), 2500);
  };

  const realignNozzle = () => {
    setStage("nozzle_aligning");
  };

  // Derived link states
  const linkStates: LinkState[] = (() => {
    const idx = ["boot","scan_ready","scanning","scan_done","inspect_ready","inspecting","tamper_found","restore_ready","restoring","hash_calc","link_repaired","downstream_check","full_validate","validating","validate_done","network_confirm","nozzle_unlock","nozzle_aligning","complete"].indexOf(stage);
    if (stage === "scanning") return [scanIdx > 0 ? "valid" : (scanIdx === 0 ? "validating" : "unknown"), scanIdx >= 1 ? (scanIdx === 1 ? "validating" : "broken") : "unknown", "unknown", "unknown"] as LinkState[];
    if (["scan_done","inspect_ready","inspecting","tamper_found","restore_ready","restoring","hash_calc"].includes(stage)) return ["valid","broken","unknown","unknown"] as LinkState[];
    if (["link_repaired","downstream_check"].includes(stage)) return ["valid","restored","valid","valid"] as LinkState[];
    if (["full_validate","validating","validate_done","network_confirm","nozzle_unlock","nozzle_aligning","complete"].includes(stage)) return ["valid","valid","valid","valid"] as LinkState[];
    return ["unknown","unknown","unknown","unknown"] as LinkState[];
  })();

  // Block statuses
  const blockStatus: Record<number, BlockStatus> = (() => {
    if (["tamper_found","restore_ready","restoring","hash_calc"].includes(stage)) return { 1:"valid", 2:"corrupted", 3:"unknown", 4:"unknown", 5:"unknown" };
    if (["link_repaired","downstream_check","full_validate","validating","validate_done","network_confirm","nozzle_unlock","nozzle_aligning","complete"].includes(stage)) return { 1:"valid", 2:"repaired", 3:"valid", 4:"valid", 5:"valid" };
    if (["scan_done","inspect_ready","inspecting"].includes(stage)) return { 1:"valid", 2:"unknown", 3:"unknown", 4:"unknown", 5:"unknown" };
    return { 1:"unknown", 2:"unknown", 3:"unknown", 4:"unknown", 5:"unknown" };
  })();

  const objectives = getObjectives(stage);
  const isBoot = stage === "boot";
  const isComplete = stage === "complete";
  const nozzleLocked = !["nozzle_unlock","nozzle_aligning","complete"].includes(stage);

  const blockData = [
    { num: 1, prevHash: "—",    ownHash: H.H1 },
    { num: 2, prevHash: H.H1,   ownHash: H.H2 },
    { num: 3, prevHash: H.H2,   ownHash: H.H3 },
    { num: 4, prevHash: H.H3,   ownHash: H.H4 },
    { num: 5, prevHash: H.H4,   ownHash: H.H5 },
  ];

  return (
    <div className="rounded-2xl border flex flex-col gap-3 p-4 h-full"
      style={{ borderColor: `${color}30`, background: "linear-gradient(145deg,rgba(2,6,23,0.98),rgba(5,10,30,0.95))" }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono font-bold tracking-widest uppercase" style={{ color }}>
            GALACTIC BLOCKCHAIN REPAIR TERMINAL
          </div>
          <div className="text-[8px] font-mono text-slate-500 tracking-widest uppercase mt-0.5">
            REPAIRING HASH REFERENCES
          </div>
        </div>
        <div className={`text-[8px] font-mono font-bold flex items-center gap-1 px-2 py-1 rounded-lg border ${isComplete ? "text-green-400 border-green-900 bg-green-900/20" : "text-amber-400 border-amber-900/50 bg-amber-900/10"}`}>
          {isComplete ? <><CheckCircle size={10} /> MISSION COMPLETE</> : <><AlertTriangle size={10} /> LEDGER CORRUPTED</>}
        </div>
      </div>

      {/* Boot sequence */}
      <AnimatePresence>
        {isBoot && (
          <motion.div key="boot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="rounded-xl border p-4 space-y-2 text-center"
            style={{ borderColor: `${color}30`, background: `${color}06` }}>
            <motion.div className="text-[8.5px] font-mono text-slate-400" animate={{ opacity: [0.5,1,0.5] }} transition={{ duration: 1.2, repeat: Infinity }}>
              COSMOSX NAVIGATION SYSTEM — GALACTIC LEDGER INITIALIZING...
            </motion.div>
            <div className="space-y-1 pt-2">
              {["BLOCK #1  ✓", "BLOCK #2  ?", "BLOCK #3  ⚠", "BLOCK #4  ⚠", "BLOCK #5  ⚠"].map((t, i) => (
                <motion.div key={t} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.3 }}
                  className="text-[8px] font-mono"
                  style={{ color: t.includes("✓") ? "#4ade80" : t.includes("⚠") ? "#f59e0b" : "#94a3b8" }}>
                  {t}
                </motion.div>
              ))}
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
              className="text-[9px] font-mono text-red-400 font-bold pt-1">
              ⚠ CRITICAL LEDGER ERROR — ROCKET NOZZLE 🔒 LOCKED
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main interface */}
      <AnimatePresence>
        {!isBoot && (
          <motion.div key="main" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3 flex-1">

            {/* Chain visualization */}
            <div className="flex items-center gap-1">
              {blockData.map((bd, i) => (
                <div key={bd.num} className="flex items-center gap-1 flex-1 min-w-0">
                  <div className="flex-1 min-w-0">
                    <BlockCard
                      num={bd.num}
                      prevHash={bd.prevHash}
                      ownHash={bd.ownHash}
                      status={blockStatus[bd.num]}
                      selected={selectedBlock === bd.num}
                      color={color}
                      onClick={["scan_done","inspect_ready","inspecting"].includes(stage) ? () => { setSelectedBlock(bd.num); setStage("inspect_ready"); } : undefined}
                      scanActive={stage === "scanning" && scanIdx === i - 1}
                    />
                  </div>
                  {i < 4 && <LinkConnector state={linkStates[i]} />}
                </div>
              ))}
            </div>

            {/* Hint */}
            {hint && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="rounded-lg border px-3 py-1.5 text-[8px] font-mono text-amber-400"
                style={{ borderColor: "#78350f50", background: "rgba(120,53,15,0.12)" }}>
                💡 {hint}
              </motion.div>
            )}

            {/* Stage-driven content area */}
            <div className="grid grid-cols-2 gap-2 flex-1">

              {/* LEFT: Block inspector / status panel */}
              <div className="rounded-xl border p-3 flex flex-col gap-2"
                style={{ borderColor: `${color}20`, background: `${color}05` }}>

                {/* SCAN READY */}
                {stage === "scan_ready" && (
                  <>
                    <div className="text-[8px] font-mono font-bold" style={{ color }}>CHAIN INTEGRITY SCANNER</div>
                    <div className="text-[7.5px] font-mono text-slate-400 leading-relaxed">
                      Alien saboteurs have tampered with the navigation ledger. Run an integrity scan to locate the first broken hash reference.
                    </div>
                    <button onClick={runScan}
                      className="mt-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-950 text-[8.5px] font-mono font-bold cursor-pointer hover:opacity-90 transition"
                      style={{ backgroundColor: color }}>
                      <Search size={11} /> RUN INTEGRITY SCAN
                    </button>
                  </>
                )}

                {/* SCANNING */}
                {stage === "scanning" && (
                  <>
                    <div className="text-[8px] font-mono font-bold text-cyan-400">SCANNING...</div>
                    <div className="space-y-1">
                      <motion.div animate={{ opacity: [0.5,1,0.5] }} transition={{ duration: 0.8, repeat: Infinity }}
                        className="text-[7.5px] font-mono text-cyan-400">
                        COMPARING HASH REFERENCES...
                      </motion.div>
                    </div>
                  </>
                )}

                {/* SCAN DONE */}
                {stage === "scan_done" && (
                  <>
                    <div className="text-[8px] font-mono font-bold text-red-400">⚠ BROKEN HASH REFERENCE DETECTED</div>
                    <div className="space-y-1.5 text-[7.5px] font-mono">
                      <div className="flex justify-between"><span className="text-slate-400">B1 → B2</span><span className="text-green-400">✓ MATCH</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">B2 → B3</span><span className="text-red-400">✕ MISMATCH</span></div>
                    </div>
                    <div className="rounded-lg border p-2 space-y-0.5" style={{ borderColor: "#7f1d1d50", background: "rgba(127,29,29,0.10)" }}>
                      <div className="text-[7px] font-mono text-red-400">CURRENT HASH(B2) = {H.H2c}</div>
                      <div className="text-[7px] font-mono text-slate-300">B3 PREV STORED = {H.H2}</div>
                      <div className="text-[7.5px] font-mono text-red-400 font-bold">{H.H2c} ≠ {H.H2}</div>
                    </div>
                    <div className="text-[7.5px] font-mono text-slate-400">Click Block #2 in the chain to investigate.</div>
                    <button onClick={inspectBlock2}
                      className="mt-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-950 text-[8.5px] font-mono font-bold cursor-pointer hover:opacity-90 transition"
                      style={{ backgroundColor: color }}>
                      <Search size={11} /> INSPECT BLOCK #2
                    </button>
                  </>
                )}

                {/* INSPECTING */}
                {stage === "inspect_ready" || stage === "inspecting" ? (
                  <>
                    <div className="text-[8px] font-mono font-bold" style={{ color }}>BLOCK INSPECTOR — #{selectedBlock}</div>
                    <div className="space-y-1 text-[7px] font-mono">
                      <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-slate-500">BLOCK HEIGHT</span><span className="text-slate-300">2</span></div>
                      <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-slate-500">PREV HASH</span><span className="text-slate-300">{H.H1}</span></div>
                      <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-slate-500">TX-01 STA→STB</span><span className="text-slate-300">FUEL: 100</span></div>
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-slate-500">TX-02 STC→STD</span>
                        <span className="text-red-400 font-bold">FUEL: 900</span>
                      </div>
                      <div className="flex justify-between"><span className="text-slate-500">CURRENT HASH</span><span className="text-red-400">{H.H2c}</span></div>
                    </div>
                    <div className="rounded-lg border px-2 py-1.5 text-[7.5px] font-mono"
                      style={{ borderColor: "#f59e0b40", background: "rgba(120,53,15,0.10)" }}>
                      ⚠ TX-02 EXPECTED FUEL: <span className="text-amber-400 font-bold">90</span> — FOUND: <span className="text-red-400 font-bold">900</span>
                    </div>
                    <button onClick={markCorrupted}
                      className="mt-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-950 text-[8.5px] font-mono font-bold cursor-pointer hover:opacity-90 transition"
                      style={{ backgroundColor: "#ef4444" }}>
                      <AlertTriangle size={11} /> MARK AS CORRUPTED
                    </button>
                  </>
                ) : null}

                {/* TAMPER FOUND */}
                {stage === "tamper_found" && (
                  <>
                    <div className="text-[8px] font-mono font-bold text-red-400">✓ CORRUPTED BLOCK IDENTIFIED</div>
                    <div className="space-y-1.5">
                      <div className="rounded-lg border p-2 text-[7.5px] font-mono space-y-0.5"
                        style={{ borderColor: "#7f1d1d50", background: "rgba(127,29,29,0.10)" }}>
                        <div className="text-red-400 font-bold">ORIGINAL B2 HASH</div>
                        <div className="text-green-400">{H.H2}</div>
                        <div className="text-slate-500 mt-0.5">↓ DATA TAMPERED</div>
                        <div className="text-red-400 font-bold mt-0.5">CORRUPTED B2 HASH</div>
                        <div className="text-red-400">{H.H2c}</div>
                      </div>
                      <div className="text-[7.5px] font-mono text-slate-400">
                        B3 still stores {H.H2} — but B2's current hash is {H.H2c}. Restore trusted data to fix.
                      </div>
                    </div>
                    <button onClick={() => setStage("restore_ready")}
                      className="mt-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-950 text-[8.5px] font-mono font-bold cursor-pointer hover:opacity-90 transition"
                      style={{ backgroundColor: color }}>
                      <Wrench size={11} /> RESTORE TRUSTED DATA
                    </button>
                  </>
                )}

                {/* RESTORE */}
                {(stage === "restore_ready" || stage === "restoring") && (
                  <>
                    <div className="text-[8px] font-mono font-bold" style={{ color }}>TRUSTED MISSION LOG — TX-02</div>
                    <div className="text-[7.5px] font-mono text-slate-400 space-y-0.5">
                      <div>STATION C → STATION D</div>
                      <div>EXPECTED FUEL: <span className="text-green-400 font-bold">90</span></div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[7px] font-mono text-slate-500">ENTER CORRECT FUEL VALUE:</div>
                      <input
                        type="text"
                        value={fuelInput}
                        onChange={e => setFuelInput(e.target.value)}
                        className="w-full rounded-lg border px-2 py-1.5 text-[9px] font-mono bg-slate-950 outline-none"
                        style={{ borderColor: fuelError ? "#ef4444" : `${color}40`, color: fuelError ? "#f87171" : "#e2e8f0" }}
                        placeholder="Enter correct fuel value..."
                      />
                      {fuelError && <div className="text-[7px] font-mono text-red-400">✕ Incorrect. Check the mission log.</div>}
                    </div>
                    <button onClick={tryRestore}
                      className="mt-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-950 text-[8.5px] font-mono font-bold cursor-pointer hover:opacity-90 transition"
                      style={{ backgroundColor: color }}>
                      <CheckCircle size={11} /> RESTORE TRANSACTION
                    </button>
                  </>
                )}

                {/* HASH CALC */}
                {stage === "hash_calc" && (
                  <>
                    <div className="text-[8px] font-mono font-bold text-green-400">✓ BLOCK #2 DATA RESTORED</div>
                    <div className="text-[7.5px] font-mono text-slate-400">TX-02 FUEL: 900 → 90</div>
                    <div className="rounded-lg border p-2 text-[7.5px] font-mono space-y-0.5"
                      style={{ borderColor: `${color}30`, background: `${color}08` }}>
                      <div className="text-slate-500">HEADER ASSEMBLY → SHA-256</div>
                      <motion.div animate={{ opacity: [0.4,1,0.4] }} transition={{ duration: 0.7, repeat: Infinity }}
                        className="text-cyan-400">RECALCULATING...</motion.div>
                    </div>
                    <button onClick={applyHash}
                      className="mt-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-950 text-[8.5px] font-mono font-bold cursor-pointer hover:opacity-90 transition"
                      style={{ backgroundColor: color }}>
                      <Zap size={11} /> CALCULATE HASH
                    </button>
                  </>
                )}

                {/* LINK REPAIRED */}
                {["link_repaired","downstream_check"].includes(stage) && (
                  <>
                    <div className="text-[8px] font-mono font-bold text-green-400">✓ HASH REFERENCE RESTORED</div>
                    <div className="space-y-1.5 text-[7.5px] font-mono">
                      <div className="rounded-lg border p-2 space-y-0.5"
                        style={{ borderColor: "#14532d50", background: "rgba(20,83,45,0.10)" }}>
                        <div className="text-green-400">B2 REPAIRED HASH = {H.H2}</div>
                        <div className="text-slate-300">B3 PREV STORED  = {H.H2}</div>
                        <div className="text-green-400 font-bold">= MATCH ✓</div>
                      </div>
                      {stage === "downstream_check" && (
                        <>
                          <div className="flex justify-between"><span className="text-slate-400">B3 → B4</span><span className="text-green-400">✓ VALID</span></div>
                          <div className="flex justify-between"><span className="text-slate-400">B4 → B5</span><span className="text-green-400">✓ VALID</span></div>
                        </>
                      )}
                    </div>
                    <button onClick={continueValidation}
                      className="mt-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-950 text-[8.5px] font-mono font-bold cursor-pointer hover:opacity-90 transition"
                      style={{ backgroundColor: color }} disabled={stage === "downstream_check"}>
                      <ChevronRight size={11} /> {stage === "downstream_check" ? "CHECKING DOWNSTREAM..." : "CONTINUE VALIDATION"}
                    </button>
                  </>
                )}

                {/* FULL VALIDATE */}
                {stage === "full_validate" && (
                  <>
                    <div className="text-[8px] font-mono font-bold" style={{ color }}>DOWNSTREAM DEPENDENCIES</div>
                    <div className="space-y-1 text-[7.5px] font-mono">
                      {[["B2→B3", "✓"], ["B3→B4", "✓"], ["B4→B5", "✓"]].map(([k,v]) => (
                        <div key={k} className="flex justify-between"><span className="text-slate-400">{k}</span><span className="text-green-400">{v} VALID</span></div>
                      ))}
                    </div>
                    <button onClick={runFullValidation}
                      className="mt-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-950 text-[8.5px] font-mono font-bold cursor-pointer hover:opacity-90 transition"
                      style={{ backgroundColor: color }}>
                      <ShieldCheck size={11} /> RUN FULL CHAIN VALIDATION
                    </button>
                  </>
                )}

                {/* VALIDATING */}
                {stage === "validating" && (
                  <>
                    <div className="text-[8px] font-mono font-bold text-cyan-400">RUNNING VALIDATION SCAN...</div>
                    <div className="space-y-1 text-[7.5px] font-mono">
                      {[["B1→B2","✓"],["B2→B3","✓"],["B3→B4","✓"],["B4→B5","✓"]].map(([k,v], i) => (
                        <motion.div key={k} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.5 }}
                          className="flex justify-between">
                          <span className="text-slate-400">{k}</span><span className="text-green-400">{v} MATCH</span>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}

                {/* VALIDATE DONE */}
                {stage === "validate_done" && (
                  <>
                    <div className="text-[8px] font-mono font-bold text-green-400">✓ ALL HASH REFERENCES VALID</div>
                    <div className="space-y-1 text-[7.5px] font-mono">
                      {[["B1→B2","✓"],["B2→B3","✓"],["B3→B4","✓"],["B4→B5","✓"]].map(([k,v]) => (
                        <div key={k} className="flex justify-between"><span className="text-slate-400">{k}</span><span className="text-green-400">{v}</span></div>
                      ))}
                    </div>
                    <button onClick={confirmNetwork}
                      className="mt-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-950 text-[8.5px] font-mono font-bold cursor-pointer hover:opacity-90 transition"
                      style={{ backgroundColor: color }}>
                      <Wifi size={11} /> CONFIRM NETWORK HISTORY
                    </button>
                  </>
                )}

                {/* NETWORK CONFIRM */}
                {stage === "network_confirm" && (
                  <>
                    <div className="text-[8px] font-mono font-bold text-cyan-400">REQUESTING NETWORK CONFIRMATION...</div>
                    <div className="space-y-1">
                      {["NODE A","NODE B","NODE C"].map((n, i) => (
                        <motion.div key={n} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.5 }}
                          className="flex justify-between text-[7.5px] font-mono">
                          <span className="text-slate-400">{n}</span>
                          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.5 + 0.4 }}
                            className="text-green-400">✓ CONFIRMED</motion.span>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}

                {/* NOZZLE UNLOCK / ALIGNING / COMPLETE */}
                {["nozzle_unlock","nozzle_aligning","complete"].includes(stage) && (
                  <>
                    <div className="text-[8px] font-mono font-bold text-green-400">✓ LEDGER REPAIR CONFIRMED</div>
                    <div className="space-y-1 text-[7.5px] font-mono">
                      <div className="flex justify-between"><span className="text-slate-400">TRUSTED HISTORY</span><span className="text-green-400">✓ MATCH</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">CHAIN INTEGRITY</span><span className="text-green-400">100%</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">NOZZLE CONTROL</span><span className="text-green-400">✓ AUTHORIZED</span></div>
                    </div>
                    {isComplete ? (
                      <div className="mt-auto rounded-xl border p-2 text-center space-y-0.5"
                        style={{ borderColor: "#14532d", background: "rgba(20,83,45,0.15)" }}>
                        <div className="text-green-400 text-[9px] font-mono font-bold">🚀 MISSION COMPLETE</div>
                        <div className="text-green-400/70 text-[7.5px] font-mono">GALACTIC BLOCKCHAIN RESTORED</div>
                      </div>
                    ) : (
                      <button onClick={realignNozzle}
                        disabled={stage === "nozzle_aligning"}
                        className="mt-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-950 text-[8.5px] font-mono font-bold cursor-pointer hover:opacity-90 transition disabled:opacity-60"
                        style={{ backgroundColor: "#22c55e" }}>
                        <Zap size={11} /> REALIGN ROCKET NOZZLE
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* RIGHT: Status + Nozzle + Objectives */}
              <div className="flex flex-col gap-2">

                {/* Integrity bar */}
                <div className="rounded-xl border p-2.5 space-y-1.5"
                  style={{ borderColor: `${color}20`, background: `${color}05` }}>
                  <div className="flex items-center justify-between">
                    <div className="text-[7.5px] font-mono text-slate-500 uppercase">CHAIN INTEGRITY</div>
                    <div className="text-[7.5px] font-mono font-bold" style={{ color: isComplete ? "#4ade80" : "#f59e0b" }}>
                      {isComplete ? "100%" : ["validate_done","network_confirm","nozzle_unlock","nozzle_aligning"].includes(stage) ? "100%" : ["link_repaired","downstream_check","full_validate","validating"].includes(stage) ? "75%" : ["hash_calc"].includes(stage) ? "50%" : ["tamper_found","restore_ready","restoring"].includes(stage) ? "30%" : "20%"}
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: isComplete ? "#22c55e" : `linear-gradient(90deg, ${color}, #22c55e)` }}
                      animate={{ width: isComplete ? "100%" : ["validate_done","network_confirm","nozzle_unlock","nozzle_aligning"].includes(stage) ? "100%" : ["link_repaired","downstream_check","full_validate","validating"].includes(stage) ? "75%" : ["hash_calc"].includes(stage) ? "50%" : ["tamper_found","restore_ready","restoring"].includes(stage) ? "30%" : "20%" }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                </div>

                {/* Nozzle control */}
                <div className="rounded-xl border p-2.5 flex-1"
                  style={{
                    borderColor: isComplete ? "#14532d" : nozzleLocked ? "#7f1d1d50" : "#14532d50",
                    background: isComplete ? "rgba(20,83,45,0.12)" : nozzleLocked ? "rgba(127,29,29,0.08)" : "rgba(20,83,45,0.08)",
                  }}>
                  <div className="text-[7.5px] font-mono text-slate-500 mb-2 uppercase">ROCKET NOZZLE CONTROL</div>
                  {nozzleLocked ? (
                    <div className="flex flex-col items-center gap-1 py-3">
                      <Lock size={24} className="text-red-400" />
                      <div className="text-[8px] font-mono text-red-400 font-bold">🔒 LOCKED</div>
                      <div className="text-[7px] font-mono text-slate-500 text-center">Repair ledger to unlock</div>
                    </div>
                  ) : isComplete ? (
                    <div className="flex flex-col items-center gap-1 py-2">
                      <Unlock size={20} className="text-green-400" />
                      <div className="text-[9px] font-mono text-green-400 font-bold">✓ ALIGNED</div>
                      <div className="text-[8px] font-mono text-green-400">0.0°</div>
                      <div className="text-[7px] font-mono text-green-400/60">ENGINE VECTOR: ONLINE</div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5 py-1">
                      <div className="flex justify-between text-[7.5px] font-mono">
                        <span className="text-slate-500">NOZZLE ANGLE</span>
                        <motion.span
                          key={nozzleAngle}
                          initial={{ color: "#f59e0b" }}
                          animate={{ color: nozzleAngle === 0 ? "#4ade80" : "#f59e0b" }}
                          className="font-bold"
                        >
                          {nozzleAngle.toFixed(1)}°
                        </motion.span>
                      </div>
                      <div className="flex justify-between text-[7.5px] font-mono">
                        <span className="text-slate-500">TARGET</span>
                        <span className="text-green-400">0.0°</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-amber-500"
                          animate={{ width: `${(nozzleAngle / 17.4) * 100}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      {stage === "nozzle_aligning" && (
                        <div className="text-[7.5px] font-mono text-amber-400 text-center">ALIGNING...</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Mission objectives */}
                <div className="rounded-xl border p-2.5 space-y-1"
                  style={{ borderColor: `${color}20`, background: `${color}05` }}>
                  <div className="text-[7.5px] font-mono text-slate-500 uppercase mb-1">MISSION OBJECTIVES</div>
                  {objectives.map(({ label, done }) => (
                    <div key={label} className="flex items-center gap-1.5 text-[7px] font-mono">
                      <div className={`w-3 h-3 rounded flex items-center justify-center shrink-0 ${done ? "text-green-400" : "text-slate-600"}`}>
                        {done ? <CheckCircle size={9} /> : <div className="w-2 h-2 rounded-sm border border-slate-600" />}
                      </div>
                      <span style={{ color: done ? "#4ade80" : "#475569" }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Complete summary */}
            <AnimatePresence>
              {isComplete && (
                <motion.div key="summary" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  className="rounded-xl border p-2.5 space-y-1.5"
                  style={{ borderColor: "#14532d50", background: "rgba(20,83,45,0.08)" }}>
                  <div className="text-[8px] font-mono text-green-400 font-bold">REPAIR REPORT</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                    {[
                      ["CORRUPTED BLOCK","#2"],["BROKEN LINK","#2 → #3"],
                      ["TAMPERED DATA","DETECTED"],["BLOCK HASH","RECALCULATED"],
                      ["HASH REFERENCE","RESTORED"],["NETWORK HISTORY","CONFIRMED"],
                      ["CHAIN INTEGRITY","100%"],["ROCKET NOZZLE","ALIGNED"],
                    ].map(([k,v]) => (
                      <div key={k} className="flex justify-between text-[7px] font-mono">
                        <span className="text-slate-500">{k}</span>
                        <span className="text-green-400">{v}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Needed for network confirm icon
function Wifi({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>;
}

import { useState, useEffect, useRef, useCallback } from "react";

interface Props {
  color: string;
}

type CommanderStatus = "honest" | "byzantine" | "unknown";
type Decision = "ATTACK" | "RETREAT" | "CONFLICT" | "?";

interface Commander {
  id: string;
  status: CommanderStatus;
  decision: Decision;
  isBlockchain: boolean;
}

interface FlyMessage {
  id: string;
  from: string;
  to: string;
  content: "ATTACK" | "RETREAT";
  progress: number;
  isConflicting: boolean;
}

interface TelemetryState {
  total: number;
  honest: number;
  byzantine: number;
  maxTolerated: number;
  proposal: string;
  quorumStatus: "satisfied" | "at-limit" | "exceeded" | "pending";
  consensusReached: boolean;
  showFormula: boolean;
  formulaN: number;
  formulaF: number;
}

type ScenarioKey = "all-honest" | "1-byzantine" | "2-byzantine" | "3-byzantine";

const CMDR_IDS = ["A", "B", "C", "D", "E", "F", "G"];

const STATUS_COLOR: Record<CommanderStatus, string> = {
  honest: "#22c55e",
  byzantine: "#ef4444",
  unknown: "#64748b",
};

const DECISION_COLOR: Record<Decision, string> = {
  ATTACK: "#3b82f6",
  RETREAT: "#f59e0b",
  CONFLICT: "#ef4444",
  "?": "#475569",
};

const DECISION_ICON: Record<Decision, string> = {
  ATTACK: "⚔",
  RETREAT: "↩",
  CONFLICT: "⚠",
  "?": "?",
};

function cmdPos(idx: number, cx: number, cy: number, r: number) {
  const angle = ((idx / 7) * 360 - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function defaultCmdr(): Commander[] {
  return CMDR_IDS.map((id) => ({ id, status: "unknown", decision: "?", isBlockchain: false }));
}

export default function ByzantineConsensusWarRoom({ color }: Props) {
  const [commanders, setCommanders] = useState<Commander[]>(defaultCmdr());
  const [messages, setMessages] = useState<FlyMessage[]>([]);
  const [centralText, setCentralText] = useState("???");
  const [centralColor, setCentralColor] = useState("#475569");
  const [statusTop, setStatusTop] = useState("BYZANTINE CONSENSUS WAR ROOM");
  const [statusBot, setStatusBot] = useState("7 COMMANDERS · CENTRAL AUTHORITY: NONE");
  const [alertTone, setAlertTone] = useState<"info" | "warn" | "ok" | "danger">("info");
  const [scenario, setScenario] = useState<ScenarioKey>("all-honest");
  const [isBC, setIsBC] = useState(false);
  const [showComp, setShowComp] = useState(false);
  const [showFrac, setShowFrac] = useState(false);
  const [fracHonest, setFracHonest] = useState(6);
  const [telemetry, setTelemetry] = useState<TelemetryState>({
    total: 7, honest: 7, byzantine: 0, maxTolerated: 2,
    proposal: "???", quorumStatus: "pending", consensusReached: false,
    showFormula: false, formulaN: 7, formulaF: 0,
  });

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 380, h: 320 });
  const animRef = useRef<number | undefined>(undefined);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const runRef = useRef(false);

  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      for (const e of entries) {
        const { width, height } = e.contentRect;
        setDims({ w: Math.max(260, width), h: Math.max(250, height) });
      }
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Message animation loop
  useEffect(() => {
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      setMessages((prev) =>
        prev.map((m) => ({ ...m, progress: Math.min(1, m.progress + dt * 1.3) }))
          .filter((m) => m.progress < 1)
      );
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  const sleep = (ms: number) =>
    new Promise<void>((res) => { timerRef.current = setTimeout(res, ms); });

  const fireMsg = useCallback((from: string, to: string, content: "ATTACK" | "RETREAT", conflict = false) => {
    setMessages((prev) => [
      ...prev.slice(-24),
      { id: `${from}${to}${Date.now()}${Math.random()}`, from, to, content, progress: 0, isConflicting: conflict },
    ]);
  }, []);

  const reset = useCallback((statusMap: Record<string, CommanderStatus> = {}) => {
    setCommanders(CMDR_IDS.map((id) => ({
      id, status: (statusMap[id] ?? "honest") as CommanderStatus, decision: "?", isBlockchain: false,
    })));
    setMessages([]);
  }, []);

  const run = useCallback(async (sc: ScenarioKey) => {
    // Cancel any running sequence
    if (runRef.current) {
      runRef.current = false;
      clearTimeout(timerRef.current);
      await sleep(80);
    }
    runRef.current = true;
    setScenario(sc);
    setShowComp(false);
    setShowFrac(false);
    setIsBC(false);
    setMessages([]);

    const byzIds: string[] =
      sc === "all-honest" ? [] :
      sc === "1-byzantine" ? ["G"] :
      sc === "2-byzantine" ? ["F", "G"] : ["E", "F", "G"];
    const honestIds = CMDR_IDS.filter((id) => !byzIds.includes(id));
    const numByz = byzIds.length;
    const numHonest = 7 - numByz;

    // ─── Phase 0: Init ────────────────────────────────────────────────────
    reset();
    setCentralText("???"); setCentralColor("#475569");
    setStatusTop("BYZANTINE CONSENSUS WAR ROOM");
    setStatusBot("7 COMMANDERS · CENTRAL AUTHORITY: NONE · DECISION REQUIRED: ???");
    setAlertTone("info");
    setTelemetry({ total: 7, honest: numHonest, byzantine: numByz, maxTolerated: 2,
      proposal: "???", quorumStatus: "pending", consensusReached: false,
      showFormula: false, formulaN: 7, formulaF: numByz });
    await sleep(1600); if (!runRef.current) return;

    // ─── Phase 1: Show uncoordinated state ───────────────────────────────
    setStatusTop("⚠ COORDINATION FAILURE");
    setStatusBot("SOME GENERALS CHOOSE ATTACK · OTHERS RETREAT · NO AGREEMENT");
    setAlertTone("warn");
    setCommanders((prev) => prev.map((c, i) => ({
      ...c, status: "honest", decision: i % 2 === 0 ? "ATTACK" : "RETREAT",
    })));
    await sleep(2000); if (!runRef.current) return;
    setCommanders((prev) => prev.map((c) => ({ ...c, decision: "?" })));
    setStatusBot("CONSENSUS PROTOCOL REQUIRED");
    await sleep(1200); if (!runRef.current) return;

    if (sc === "all-honest") {
      // ─── All-honest fast path ─────────────────────────────────────────
      setStatusTop("ALL-HONEST CONSENSUS ROUND");
      setStatusBot("COMMANDER A PROPOSES: ATTACK");
      setAlertTone("info");
      for (const id of ["B", "C", "D", "E", "F", "G"]) { fireMsg("A", id, "ATTACK"); await sleep(180); if (!runRef.current) return; }
      await sleep(700); if (!runRef.current) return;
      for (const id of ["C", "D", "E", "F"]) { fireMsg("B", id, "ATTACK"); await sleep(150); if (!runRef.current) return; }
      await sleep(600); if (!runRef.current) return;
      setCommanders((prev) => prev.map((c) => ({ ...c, status: "honest", decision: "ATTACK" })));
      setTelemetry((t) => ({ ...t, proposal: "ATTACK", consensusReached: true, quorumStatus: "satisfied" }));
      setStatusBot("ALL 7 MESSAGES CONSISTENT → QUORUM SATISFIED");
      await sleep(1200); if (!runRef.current) return;
      setCentralText("⚔ ATTACK"); setCentralColor("#22c55e");
      setStatusTop("✓ CONSENSUS REACHED"); setStatusBot("ALL 7 COMMANDERS AGREE: ATTACK");
      setAlertTone("ok");
      await sleep(2800); if (!runRef.current) return;

      // Transform to blockchain
      setIsBC(true);
      setCommanders((prev) => prev.map((c) => ({ ...c, isBlockchain: true })));
      setCentralText("STATE X"); setCentralColor(color);
      setStatusTop("GENERALS → BLOCKCHAIN NODES");
      setStatusBot("ATTACK / RETREAT → LEDGER STATE X / LEDGER STATE Y");
      setAlertTone("info");
      await sleep(2200); if (!runRef.current) return;
      setShowComp(true);
      setStatusTop("BYZANTINE GENERALS → BLOCKCHAIN MAPPING");
      setStatusBot("SAME FUNDAMENTAL PROBLEM · DIFFERENT CONTEXT");
      await sleep(3000); if (!runRef.current) return;
      runRef.current = false;
      return;
    }

    // ─── Introduce Byzantine ─────────────────────────────────────────────
    reset(Object.fromEntries(byzIds.map((id) => [id, "byzantine" as CommanderStatus])));
    setCentralText("???"); setCentralColor("#475569");
    setStatusTop(`NEW ROUND · ${numByz} BYZANTINE PARTICIPANT${numByz > 1 ? "S" : ""}`);
    setStatusBot("STATUS UNKNOWN — BEHAVIOR UNVERIFIED");
    setAlertTone("warn");
    setTelemetry((t) => ({
      ...t, honest: numHonest, byzantine: numByz,
      quorumStatus: numByz >= 3 ? "exceeded" : numByz === 2 ? "at-limit" : "satisfied",
      consensusReached: false, showFormula: numByz >= 2,
    }));
    await sleep(1800); if (!runRef.current) return;

    // ─── Byzantine conflicting messages ───────────────────────────────────
    setStatusTop(`⚠ COMMANDER ${byzIds[0]} SENDING CONFLICTING MESSAGES`);
    setStatusBot("SAME SENDER · DIFFERENT CONTENT TO DIFFERENT RECIPIENTS");
    setAlertTone("danger");
    for (let i = 0; i < honestIds.length; i++) {
      const content: "ATTACK" | "RETREAT" = i % 2 === 0 ? "ATTACK" : "RETREAT";
      fireMsg(byzIds[0], honestIds[i], content, true);
      await sleep(320); if (!runRef.current) return;
    }
    if (byzIds.length > 1) {
      await sleep(400); if (!runRef.current) return;
      for (let i = 0; i < honestIds.length; i++) {
        const content: "ATTACK" | "RETREAT" = i % 2 === 0 ? "RETREAT" : "ATTACK";
        fireMsg(byzIds[1], honestIds[i], content, true);
        await sleep(260); if (!runRef.current) return;
      }
    }
    await sleep(1000); if (!runRef.current) return;

    // ─── Reveal Byzantine ─────────────────────────────────────────────────
    setStatusTop(`COMMANDER${byzIds.length > 1 ? "S" : ""} ${byzIds.join(" & ")}: ⚠ BYZANTINE FAULT`);
    setStatusBot("SAME PARTICIPANT · DIFFERENT MESSAGES → BYZANTINE BEHAVIOR");
    await sleep(2000); if (!runRef.current) return;

    // ─── Honest commanders exchange info ─────────────────────────────────
    setStatusTop("HONEST COMMANDERS EXCHANGING INFORMATION");
    setStatusBot("COMPARING RECEIVED MESSAGES · DETECTING CONFLICTS");
    setAlertTone("info");
    for (let i = 0; i < honestIds.length - 1; i++) {
      fireMsg(honestIds[i], honestIds[i + 1], "ATTACK");
      await sleep(280); if (!runRef.current) return;
    }
    await sleep(900); if (!runRef.current) return;
    setCommanders((prev) => prev.map((c) => ({
      ...c, decision: byzIds.includes(c.id) ? "CONFLICT" : "ATTACK",
    })));
    setStatusBot("CONFLICTING BEHAVIOR DETECTED · QUORUM CONDITIONS APPLIED");
    await sleep(1400); if (!runRef.current) return;

    if (sc === "3-byzantine") {
      // ─── Threshold exceeded ─────────────────────────────────────────────
      setCentralText("⚠ ???"); setCentralColor("#ef4444");
      setStatusTop("⚠ ASSUMED FAULT THRESHOLD EXCEEDED");
      setStatusBot("3 > f=2 (MAX TOLERATED) · PROTOCOL GUARANTEES MAY NOT HOLD");
      setAlertTone("danger");
      setTelemetry((t) => ({ ...t, quorumStatus: "exceeded", consensusReached: false }));
      for (let i = 0; i < 4; i++) {
        setCentralText("⚔ ATTACK"); setCentralColor("#3b82f6"); await sleep(480); if (!runRef.current) return;
        setCentralText("↩ RETREAT"); setCentralColor("#f59e0b"); await sleep(480); if (!runRef.current) return;
        setCentralText("⚠ ???"); setCentralColor("#ef4444"); await sleep(380); if (!runRef.current) return;
      }
      setShowFrac(true); setFracHonest(4);
      setStatusTop("FAULT FRACTION ANALYSIS"); setStatusBot("4/7 HONEST < 2/3 → ⚠ THRESHOLD EXCEEDED");
      await sleep(3000); if (!runRef.current) return;
      runRef.current = false;
      return;
    }

    // ─── 1 or 2 Byzantine — consensus achieved ────────────────────────────
    if (sc === "2-byzantine") {
      setStatusTop("CLASSIC f=2 BFT EXAMPLE");
      setStatusBot("n=7, f=2 → 7 ≥ 3(2)+1 = 7 ✓ WITHIN FAULT ASSUMPTION");
      setAlertTone("info");
      await sleep(1800); if (!runRef.current) return;
      setShowFrac(true); setFracHonest(5);
      setStatusBot("5/7 HONEST ≈ 71% > 2/3 → CLASSIC BFT TOLERANCE SATISFIED");
      await sleep(1800); if (!runRef.current) return;
    }

    setCentralText("⚔ ATTACK"); setCentralColor("#22c55e");
    setStatusTop("✓ HONEST COMMANDERS REACH AGREEMENT");
    setStatusBot(`${numHonest}/7 HONEST · QUORUM CONDITIONS SATISFIED · CONSENSUS: ATTACK`);
    setAlertTone("ok");
    setTelemetry((t) => ({
      ...t, quorumStatus: sc === "2-byzantine" ? "at-limit" : "satisfied", consensusReached: true,
    }));
    await sleep(2500); if (!runRef.current) return;

    // ─── Transform to blockchain ──────────────────────────────────────────
    setIsBC(true);
    setCommanders((prev) => prev.map((c) => ({ ...c, isBlockchain: true })));
    setCentralText("STATE X"); setCentralColor(color);
    setStatusTop("GENERALS → BLOCKCHAIN NODES");
    setStatusBot("ATTACK / RETREAT → LEDGER STATE X / LEDGER STATE Y");
    setAlertTone("info");
    await sleep(2000); if (!runRef.current) return;

    setCentralText("✓ STATE X"); setCentralColor("#22c55e");
    setStatusTop("✓ NETWORK AGREEMENT REACHED");
    setStatusBot("CONSENSUS PROTOCOLS ALLOW DISTRIBUTED PARTICIPANTS TO AGREE — EVEN WITH BYZANTINE FAULTS");
    setAlertTone("ok");
    setShowComp(true);
    await sleep(3000); if (!runRef.current) return;
    runRef.current = false;
  }, [color, reset, fireMsg]);

  // Auto-start
  useEffect(() => {
    const t = setTimeout(() => run("all-honest"), 600);
    return () => { clearTimeout(t); clearTimeout(timerRef.current); runRef.current = false; };
  }, [run]);

  const cx = dims.w / 2;
  const cy = dims.h / 2;
  const networkR = Math.min(cx, cy) * 0.68;

  const toneColor = { info: "#3b82f6", warn: "#f59e0b", ok: "#22c55e", danger: "#ef4444" }[alertTone];

  return (
    <div className="flex flex-col gap-2.5 h-full min-h-0 select-none text-white">
      {/* Header row */}
      <div className="shrink-0 flex items-start justify-between gap-2 flex-wrap">
        <div>
          <p className="font-mono text-[8px] font-bold uppercase tracking-widest" style={{ color }}>
            Byzantine Consensus War Room
          </p>
          <p className="font-mono text-[7px] text-slate-500 mt-0.5">
            CAN THE GENERALS REACH ONE DECISION?
          </p>
        </div>
        <div className="flex gap-1 flex-wrap justify-end">
          {([
            { k: "all-honest", l: "ALL HONEST" },
            { k: "1-byzantine", l: "1 BYZANTINE" },
            { k: "2-byzantine", l: "2 BYZANTINE" },
            { k: "3-byzantine", l: "3 BYZANTINE" },
          ] as { k: ScenarioKey; l: string }[]).map((s) => (
            <button
              key={s.k}
              onClick={() => run(s.k)}
              className="font-mono text-[7px] px-1.5 py-0.5 rounded border transition-all"
              style={{
                borderColor: scenario === s.k ? color : "rgba(255,255,255,0.1)",
                background: scenario === s.k ? `${color}18` : "transparent",
                color: scenario === s.k ? color : "#64748b",
              }}
            >
              {s.l}
            </button>
          ))}
          <button
            onClick={() => run(scenario)}
            className="font-mono text-[7px] px-1.5 py-0.5 rounded border border-white/10 text-slate-500 hover:text-white transition-all"
          >
            ↺
          </button>
        </div>
      </div>

      {/* Main canvas + right panel */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-2.5">

        {/* SVG network */}
        <div
          ref={containerRef}
          className="flex-1 relative rounded-2xl border overflow-hidden"
          style={{
            borderColor: "rgba(255,255,255,0.06)",
            background: "radial-gradient(ellipse at 50% 45%, rgba(10,18,36,0.97) 60%, rgba(4,8,22,1) 100%)",
            minHeight: "240px",
          }}
        >
          <svg ref={svgRef} width={dims.w} height={dims.h} style={{ position: "absolute", top: 0, left: 0 }}>
            {/* Orbit ring */}
            <circle cx={cx} cy={cy} r={networkR} fill="none" stroke="rgba(255,255,255,0.035)" strokeWidth="1" />

            {/* Honest-to-honest connector lines */}
            {commanders.flatMap((ca, ia) =>
              commanders.slice(ia + 1).map((cb, _) => {
                if (ca.status === "byzantine" || cb.status === "byzantine") return null;
                const pa = cmdPos(ia, cx, cy, networkR);
                const pb = cmdPos(CMDR_IDS.indexOf(cb.id), cx, cy, networkR);
                const isConsensus = centralText.includes("ATTACK") || centralText.includes("STATE");
                return (
                  <line
                    key={`${ca.id}-${cb.id}`}
                    x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                    stroke={isConsensus ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.03)"}
                    strokeWidth="0.7"
                  />
                );
              })
            )}

            {/* Flying message packets */}
            {messages.map((m) => {
              const fi = CMDR_IDS.indexOf(m.from);
              const ti = CMDR_IDS.indexOf(m.to);
              if (fi < 0 || ti < 0) return null;
              const fp = cmdPos(fi, cx, cy, networkR);
              const tp = cmdPos(ti, cx, cy, networkR);
              const px = fp.x + (tp.x - fp.x) * m.progress;
              const py = fp.y + (tp.y - fp.y) * m.progress;
              const mc = m.content === "ATTACK" ? "#3b82f6" : "#f59e0b";
              return (
                <g key={m.id}>
                  <line x1={fp.x} y1={fp.y} x2={tp.x} y2={tp.y}
                    stroke={m.isConflicting ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.1)"}
                    strokeWidth="0.7" strokeDasharray="3 3" />
                  <circle cx={px} cy={py} r={4.5} fill={mc} opacity={0.92}
                    style={{ filter: `drop-shadow(0 0 5px ${mc}90)` }} />
                  <text x={px} y={py - 8} textAnchor="middle" fontSize="7" fill={mc} fontFamily="monospace">
                    {m.content === "ATTACK" ? "⚔" : "↩"}
                  </text>
                </g>
              );
            })}

            {/* Commander nodes */}
            {commanders.map((c, i) => {
              const pos = cmdPos(i, cx, cy, networkR);
              const sc = STATUS_COLOR[c.status];
              const dc = DECISION_COLOR[c.decision];
              return (
                <g key={c.id}>
                  {c.status !== "unknown" && (
                    <circle cx={pos.x} cy={pos.y} r={19} fill="none"
                      stroke={sc} strokeWidth="0.8" opacity={0.35} />
                  )}
                  <circle cx={pos.x} cy={pos.y} r={13} fill={`${sc}16`}
                    stroke={sc} strokeWidth={c.status === "byzantine" ? 1.8 : 1.1}
                    style={{ filter: `drop-shadow(0 0 7px ${sc}55)` }} />
                  <text x={pos.x} y={pos.y + 4.5} textAnchor="middle"
                    fontSize="10" fill={sc} fontFamily="monospace" fontWeight="bold">
                    {c.status === "byzantine" ? "⚠" : c.status === "honest" ? "✓" : "?"}
                  </text>
                  <text x={pos.x} y={pos.y + 25} textAnchor="middle"
                    fontSize="7" fill={sc} fontFamily="monospace" fontWeight="bold">
                    {c.isBlockchain ? `NODE ${c.id}` : `CMD ${c.id}`}
                  </text>
                  {c.decision !== "?" && (
                    <g>
                      <rect x={pos.x - 13} y={pos.y - 28} width={26} height={11}
                        rx="2.5" fill={`${dc}22`} stroke={dc} strokeWidth="0.5" />
                      <text x={pos.x} y={pos.y - 20} textAnchor="middle"
                        fontSize="6.5" fill={dc} fontFamily="monospace" fontWeight="bold">
                        {DECISION_ICON[c.decision]}{" "}
                        {c.isBlockchain && c.decision === "ATTACK" ? "ST.X"
                          : c.isBlockchain && c.decision === "RETREAT" ? "ST.Y"
                          : c.decision === "CONFLICT" ? "CNFL"
                          : c.decision}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Center target */}
            <circle cx={cx} cy={cy} r={27} fill="rgba(8,16,31,0.96)"
              stroke={centralColor} strokeWidth="1.4"
              style={{ filter: `drop-shadow(0 0 14px ${centralColor}45)` }} />
            <text x={cx} y={cy - 7} textAnchor="middle" fontSize="6.5"
              fill="#475569" fontFamily="monospace">
              {isBC ? "LEDGER" : "TARGET"}
            </text>
            <text x={cx} y={cy + 6} textAnchor="middle"
              fontSize={centralText.length > 7 ? "7" : "9.5"}
              fill={centralColor} fontFamily="monospace" fontWeight="bold"
              style={{ filter: `drop-shadow(0 0 5px ${centralColor}70)` }}>
              {centralText.length > 9 ? centralText.slice(0, 9) : centralText}
            </text>
          </svg>

          {/* Status footer */}
          <div className="absolute bottom-0 left-0 right-0 px-3 py-2 rounded-b-2xl"
            style={{ background: "linear-gradient(to top, rgba(4,8,22,0.97) 0%, transparent 100%)" }}>
            <p className="font-mono text-[7.5px] font-bold uppercase tracking-wider" style={{ color: toneColor }}>
              {statusTop}
            </p>
            <p className="font-mono text-[6.5px] text-slate-400 mt-0.5 leading-snug line-clamp-2">
              {statusBot}
            </p>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-2 w-full lg:w-44 xl:w-48 shrink-0">

          {/* Telemetry */}
          <div className="rounded-xl border p-2.5" style={{ borderColor: `${color}20`, background: `${color}06` }}>
            <p className="font-mono text-[7px] uppercase tracking-widest mb-2" style={{ color }}>
              CONSENSUS MONITOR
            </p>
            {[
              ["TOTAL", telemetry.total, "#e2e8f0"],
              ["HONEST", telemetry.honest, "#22c55e"],
              ["BYZANTINE", telemetry.byzantine, telemetry.byzantine > 0 ? "#ef4444" : "#475569"],
              ["MAX TOLERATED", telemetry.maxTolerated, "#f59e0b"],
            ].map(([k, v, c]) => (
              <div key={k as string} className="flex justify-between items-center py-0.5">
                <span className="font-mono text-[6.5px] text-slate-500">{k as string}</span>
                <span className="font-mono text-[7px] font-bold" style={{ color: c as string }}>{v as number}</span>
              </div>
            ))}
            <div className="border-t border-white/5 my-1.5" />
            <div className="flex justify-between items-center py-0.5">
              <span className="font-mono text-[6.5px] text-slate-500">PROPOSAL</span>
              <span className="font-mono text-[6.5px] font-bold text-slate-200">{telemetry.proposal}</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="font-mono text-[6.5px] text-slate-500">QUORUM</span>
              <span className="font-mono text-[6.5px] font-bold" style={{
                color: telemetry.quorumStatus === "satisfied" ? "#22c55e"
                  : telemetry.quorumStatus === "at-limit" ? "#f59e0b"
                  : telemetry.quorumStatus === "exceeded" ? "#ef4444" : "#64748b",
              }}>
                {telemetry.quorumStatus === "satisfied" ? "✓ OK"
                  : telemetry.quorumStatus === "at-limit" ? "⚠ LIMIT"
                  : telemetry.quorumStatus === "exceeded" ? "⚠ EXCEEDED" : "PENDING"}
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="font-mono text-[6.5px] text-slate-500">CONSENSUS</span>
              <span className="font-mono text-[6.5px] font-bold"
                style={{ color: telemetry.consensusReached ? "#22c55e" : "#475569" }}>
                {telemetry.consensusReached ? "✓ REACHED" : "PENDING"}
              </span>
            </div>

            {/* BFT formula box */}
            {telemetry.showFormula && (
              <div className="mt-2 rounded-lg p-2 text-center"
                style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                <p className="font-mono text-[6.5px] text-slate-400">CLASSIC BFT FORMULA</p>
                <p className="font-mono text-[9px] font-bold mt-0.5" style={{ color }}>n ≥ 3f + 1</p>
                <p className="font-mono text-[6.5px] text-slate-300 mt-1">
                  {telemetry.formulaN} ≥ 3({telemetry.formulaF})+1 = {3 * telemetry.formulaF + 1}
                </p>
                <p className="font-mono text-[6.5px] font-bold mt-1" style={{
                  color: telemetry.formulaN >= 3 * telemetry.formulaF + 1 ? "#22c55e" : "#ef4444",
                }}>
                  {telemetry.formulaN >= 3 * telemetry.formulaF + 1
                    ? `✓ f=${telemetry.formulaF} TOLERATED`
                    : `⚠ f=${telemetry.formulaF} EXCEEDED`}
                </p>
              </div>
            )}
          </div>

          {/* Fraction viz */}
          {showFrac && (
            <div className="rounded-xl border p-2.5"
              style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(10,18,36,0.7)" }}>
              <p className="font-mono text-[7px] uppercase tracking-widest text-slate-400 mb-1.5">
                HONEST FRACTION
              </p>
              <div className="flex gap-0.5 flex-wrap mb-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="w-[22px] h-[22px] rounded flex items-center justify-center font-mono text-[8px] font-bold"
                    style={{
                      background: i < fracHonest ? "rgba(34,197,94,0.18)" : "rgba(239,68,68,0.18)",
                      border: `1px solid ${i < fracHonest ? "#22c55e" : "#ef4444"}`,
                      color: i < fracHonest ? "#22c55e" : "#ef4444",
                    }}>
                    {i < fracHonest ? "✓" : "⚠"}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 text-center gap-1">
                <div>
                  <p className="font-mono text-[6px] text-slate-500">HONEST</p>
                  <p className="font-mono text-[9px] font-bold text-emerald-400">{fracHonest}/7</p>
                </div>
                <div>
                  <p className="font-mono text-[6px] text-slate-500">NEEDED</p>
                  <p className="font-mono text-[9px] font-bold text-slate-300">&gt;2/3</p>
                </div>
                <div>
                  <p className="font-mono text-[6px] text-slate-500">STATUS</p>
                  <p className="font-mono text-[8px] font-bold"
                    style={{ color: fracHonest / 7 > 2 / 3 ? "#22c55e" : "#ef4444" }}>
                    {fracHonest / 7 > 2 / 3 ? "✓ OK" : "⚠ FAIL"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="rounded-xl border p-2"
            style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(10,18,36,0.6)" }}>
            <p className="font-mono text-[6.5px] uppercase tracking-widest text-slate-500 mb-1.5">LEGEND</p>
            {[
              { c: "#22c55e", i: "✓", l: "HONEST" },
              { c: "#ef4444", i: "⚠", l: "BYZANTINE" },
              { c: "#64748b", i: "?", l: "UNKNOWN" },
              { c: "#3b82f6", i: "⚔", l: "ATTACK / STATE X" },
              { c: "#f59e0b", i: "↩", l: "RETREAT / STATE Y" },
            ].map((x) => (
              <div key={x.l} className="flex items-center gap-1.5 py-0.5">
                <span style={{ color: x.c }} className="font-mono text-[9px]">{x.i}</span>
                <span className="font-mono text-[6.5px] text-slate-400">{x.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison table */}
      {showComp && (
        <div className="shrink-0 rounded-xl border p-3"
          style={{ borderColor: `${color}18`, background: `${color}05` }}>
          <p className="font-mono text-[7px] uppercase tracking-widest text-center mb-2" style={{ color }}>
            BYZANTINE GENERALS → BLOCKCHAIN MAPPING
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                title: "BYZANTINE GENERALS",
                rows: [
                  ["GENERAL", "Network Participant"],
                  ["MESSENGER", "Network Message"],
                  ["TRAITOR", "Byzantine / Faulty Node"],
                  ["ATTACK / RETREAT", "Competing Decisions"],
                  ["AGREED PLAN", "Consensus"],
                ],
              },
              {
                title: "BLOCKCHAIN NETWORK",
                rows: [
                  ["NODE", "Network Participant"],
                  ["P2P MESSAGE", "Protocol Communication"],
                  ["BYZ. NODE", "Arbitrary / Conflicting"],
                  ["STATE X / Y", "Competing Ledger States"],
                  ["AGREED LEDGER", "Consensus"],
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <p className="font-mono text-[6.5px] text-slate-500 uppercase tracking-wide border-b border-white/5 pb-1 mb-1">
                  {col.title}
                </p>
                {col.rows.map(([k, v]) => (
                  <div key={k} className="flex gap-1 py-0.5">
                    <span className="font-mono text-[6px] font-bold text-slate-300 shrink-0 w-16 truncate">{k}</span>
                    <span className="font-mono text-[6px] text-slate-500">→ {v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <p className="font-mono text-[6.5px] text-slate-500 text-center mt-2 pt-1.5 border-t border-white/5">
            SAME FUNDAMENTAL PROBLEM: "HOW DO DISTRIBUTED PARTICIPANTS AGREE ON ONE SHARED RESULT?"
          </p>
        </div>
      )}
    </div>
  );
}

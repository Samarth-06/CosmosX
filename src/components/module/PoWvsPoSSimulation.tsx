import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Coins, Zap, ShieldAlert, CheckCircle, RefreshCw, Play, Pause, Flame } from "lucide-react";

interface Props {
  color: string;
}

type Mode = "pow" | "pos";

export default function PoWvsPoSSimulation({ color }: Props) {
  const [mode, setMode] = useState<Mode>("pow");
  
  // PoW State
  const [powPlaying, setPowPlaying] = useState(true);
  const [hashrate, setHashrate] = useState(5); // 1-10 slider
  const [nonce, setNonce] = useState(14820);
  const [currentHash, setCurrentHash] = useState("b29fa18c...");
  const [energy, setEnergy] = useState(1.42); // kWh
  const [blocksMined, setBlocksMined] = useState(0);
  const [reward, setReward] = useState(0);
  const [showRewardAlert, setShowRewardAlert] = useState(false);
  const [solveProgress, setSolveProgress] = useState(0);

  // PoS State
  const [posStage, setPosStage] = useState<"idle" | "spinning" | "proposing" | "attesting" | "finalized" | "slashed">("idle");
  const [selectedValidator, setSelectedValidator] = useState<number | null>(null);
  const [stakeList, setStakeList] = useState([
    { id: 1, name: "Validator A (Alpha)", stake: 32, total: 100, color: "#10b981", status: "active" },
    { id: 2, name: "Validator B (Beta)", stake: 16, total: 100, color: "#a855f7", status: "active" },
    { id: 3, name: "Validator C (Gamma)", stake: 48, total: 100, color: "#f59e0b", status: "active" },
    { id: 4, name: "Validator D (Byzantine)", stake: 4, total: 100, color: "#f43f5e", status: "active" },
  ]);
  const [slashingAlert, setSlashingAlert] = useState(false);
  const [lastBlockWinner, setLastBlockWinner] = useState<string>("");

  // PoW Hashing Loop
  useEffect(() => {
    if (mode !== "pow" || !powPlaying) return;

    const intervalTime = Math.max(40, 200 - hashrate * 18);
    const timer = setInterval(() => {
      setNonce((prev) => {
        const next = prev + Math.floor(Math.random() * 5) + 1;
        // Generate random hex characters
        const hex = Array.from({ length: 8 }, () => 
          Math.floor(Math.random() * 16).toString(16)
        ).join("");
        
        // Puzzle solved: simulated when solved threshold hit
        setSolveProgress((prevProgress) => {
          const increment = hashrate * 1.5;
          const nextProgress = prevProgress + increment;
          if (nextProgress >= 100) {
            // Solve!
            setCurrentHash("0000" + hex + "de6fbc77189a");
            setBlocksMined((b) => b + 1);
            setReward((r) => r + 6.25);
            setShowRewardAlert(true);
            setTimeout(() => setShowRewardAlert(false), 2000);
            return 0; // Reset progress
          } else {
            setCurrentHash(hex + "a8f9cde2e49c...");
            return nextProgress;
          }
        });
        
        return next;
      });

      // Increment Energy
      setEnergy((prev) => prev + (hashrate * 0.005));
    }, intervalTime);

    return () => clearInterval(timer);
  }, [mode, powPlaying, hashrate]);

  // PoS Spinning Selector
  const runPoSConsensus = () => {
    if (posStage !== "idle") return;
    setPosStage("spinning");
    setSelectedValidator(null);

    // Roll weighted probability based on stake
    const totalStake = stakeList.reduce((acc, val) => acc + (val.status === "active" ? val.stake : 0), 0);
    let roll = Math.random() * totalStake;
    let winnerIndex = 0;
    
    for (let i = 0; i < stakeList.length; i++) {
      if (stakeList[i].status !== "active") continue;
      roll -= stakeList[i].stake;
      if (roll <= 0) {
        winnerIndex = i;
        break;
      }
    }

    const targetNodeAngle = (winnerIndex * 90) + 45; // Nodes distributed at angles
    
    setTimeout(() => {
      setSelectedValidator(winnerIndex);
      setPosStage("proposing");
      setLastBlockWinner(stakeList[winnerIndex].name);

      setTimeout(() => {
        setPosStage("attesting");
        
        setTimeout(() => {
          setPosStage("finalized");
          // Re-enable after delay
          setTimeout(() => {
            setPosStage("idle");
          }, 2000);
        }, 1500);
      }, 1500);
    }, 2000);
  };

  // Trigger Byzantine Double Sign Attack
  const triggerAttack = () => {
    if (posStage !== "idle" && posStage !== "finalized") return;
    setPosStage("slashed");
    setSlashingAlert(true);
    setTimeout(() => setSlashingAlert(false), 3500);

    // Byzantine node is slashed: stake falls to 0, status inactive
    setStakeList((prev) => 
      prev.map((item) => 
        item.id === 4 ? { ...item, stake: 0, status: "slashed" } : item
      )
    );
  };

  // Reset PoS Staking Nodes
  const resetPoS = () => {
    setStakeList([
      { id: 1, name: "Validator A (Alpha)", stake: 32, total: 100, color: "#10b981", status: "active" },
      { id: 2, name: "Validator B (Beta)", stake: 16, total: 100, color: "#a855f7", status: "active" },
      { id: 3, name: "Validator C (Gamma)", stake: 48, total: 100, color: "#f59e0b", status: "active" },
      { id: 4, name: "Validator D (Byzantine)", stake: 4, total: 100, color: "#f43f5e", status: "active" },
    ]);
    setPosStage("idle");
  };

  return (
    <div className="flex flex-col h-full bg-[#040816]/60 rounded-2xl border border-white/10 overflow-hidden text-slate-100 p-4 font-sans select-none">
      
      {/* Simulation Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3 shrink-0">
        <div>
          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">Consensus Architecture</span>
          <h3 className="text-xs font-bold font-mono uppercase tracking-wide text-white">PoW vs. PoS Interactive Command</h3>
        </div>

        {/* Mode Selector */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5 text-[9px] font-mono">
          <button
            onClick={() => setMode("pow")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
              mode === "pow" ? "text-slate-950 bg-cyan-400 shadow-[0_0_8px_rgba(34,221,238,0.4)]" : "text-slate-400 hover:text-white"
            }`}
          >
            Proof of Work (PoW)
          </button>
          <button
            onClick={() => setMode("pos")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
              mode === "pos" ? "text-slate-950 bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.4)]" : "text-slate-400 hover:text-white"
            }`}
          >
            Proof of Stake (PoS)
          </button>
        </div>
      </div>

      {/* Main Working Panel */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
        <AnimatePresence mode="wait">
          
          {/* ==================== PROOF OF WORK SIMULATION ==================== */}
          {mode === "pow" && (
            <motion.div
              key="pow-panel"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 h-full flex flex-col justify-between"
            >
              <div className="grid grid-cols-12 gap-3">
                {/* Stats Sidebar */}
                <div className="col-span-4 bg-slate-950/60 border border-white/5 rounded-xl p-3 space-y-3 font-mono text-[9.5px]">
                  <div className="text-[8.5px] text-slate-500 uppercase tracking-wider mb-1 font-bold">GRID TELEMETRY</div>
                  
                  <div className="space-y-1">
                    <span className="text-slate-400 block">HASHRATE:</span>
                    <span className="text-cyan-400 font-bold text-xs">{hashrate} MH/s</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 block">ENERGY CONSUMED:</span>
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-400 fill-amber-400 animate-pulse" />
                      <span className="text-amber-400 font-bold">{energy.toFixed(3)} kWh</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 block">BLOCKS MINED:</span>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">{blocksMined} Blocks</span>
                    </div>
                  </div>

                  <div className="space-y-1 border-t border-white/5 pt-2">
                    <span className="text-slate-400 block">TOTAL REWARD:</span>
                    <span className="text-white font-extrabold text-[11px]">{reward.toFixed(2)} BTC</span>
                  </div>
                </div>

                {/* Main Mining Center Visualizer */}
                <div className="col-span-8 bg-slate-950/40 border border-white/5 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
                  
                  {/* Cooler fan and chip */}
                  <div className="flex items-center justify-center py-4 relative">
                    {/* Rotor ring */}
                    <div className="relative w-24 h-24 rounded-full border border-dashed border-white/10 flex items-center justify-center">
                      
                      {/* Turbine spinning fan blades */}
                      <motion.div
                        animate={powPlaying ? { rotate: 360 } : {}}
                        transition={{
                          repeat: Infinity,
                          duration: Math.max(0.4, 2.5 - (hashrate * 0.22)),
                          ease: "linear"
                        }}
                        className="w-16 h-16 rounded-full border border-cyan-500/20 flex items-center justify-center relative bg-slate-900/50"
                      >
                        {/* Blade visual */}
                        <div className="absolute w-12 h-1 bg-cyan-400/40 rounded-full" />
                        <div className="absolute w-1 h-12 bg-cyan-400/40 rounded-full" />
                        <div className="absolute w-1.5 h-1.5 rounded-full bg-cyan-400 border border-white" />
                      </motion.div>

                      {/* Spark particles around cooler */}
                      <div className="absolute inset-0 border border-cyan-400/5 rounded-full animate-ping" style={{ animationDuration: "2s" }} />
                    </div>

                    <div className="absolute -top-1 right-2 bg-slate-900/80 px-2 py-0.5 rounded border border-white/5 font-mono text-[8px] text-cyan-400 uppercase tracking-widest">
                      SOLVING PUZZLE...
                    </div>
                  </div>

                  {/* Nonce & Hash Output Console */}
                  <div className="bg-black/60 border border-white/10 rounded-xl p-3 font-mono text-[10px] space-y-1">
                    <div className="flex justify-between text-slate-500 text-[8.5px] border-b border-white/5 pb-1">
                      <span>SHA-256 CONSOLE</span>
                      <span className="text-cyan-500">NONCE: {nonce}</span>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-slate-400 text-[9px]">TARGET:</span>
                      <span className="text-emerald-500 font-bold">0000************************************************************</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 text-[9px]">HASH:</span>
                      <span className={`font-bold transition-colors ${currentHash.startsWith("0000") ? "text-emerald-400 font-mono tracking-wide text-xs" : "text-cyan-300"}`}>
                        {currentHash}
                      </span>
                    </div>
                  </div>

                  {/* Mining reward notification */}
                  <AnimatePresence>
                    {showRewardAlert && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="absolute inset-0 bg-emerald-500/90 flex flex-col items-center justify-center text-slate-950 font-mono p-4 rounded-xl z-20 text-center"
                      >
                        <Cpu className="w-8 h-8 animate-bounce mb-2" />
                        <h4 className="font-extrabold text-sm tracking-wider">BLOCK PUZZLE SOLVED!</h4>
                        <p className="text-[10px] uppercase font-bold tracking-widest mt-1">FOUND HASH WITH 4 LEADING ZEROS</p>
                        <div className="bg-slate-950 text-emerald-400 font-extrabold text-[12px] px-3.5 py-1.5 rounded-lg mt-2.5 shadow-xl tracking-widest">
                          + 6.25 BTC CLAIMED
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Controls bar */}
              <div className="bg-slate-950 border border-white/5 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] font-mono">
                <div className="flex-1 space-y-1.5">
                  <div className="flex justify-between text-[9px] text-slate-400 uppercase tracking-widest">
                    <span>MINER HASHRATE (POWER REGULATION)</span>
                    <span className="text-cyan-400 font-bold">{hashrate * 250} W</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={hashrate}
                    onChange={(e) => setHashrate(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                <div className="flex items-center gap-2 sm:pl-3 shrink-0">
                  <button
                    onClick={() => setPowPlaying(!powPlaying)}
                    style={{ backgroundColor: color }}
                    className="text-slate-950 font-bold px-4 py-2 rounded-lg cursor-pointer hover:opacity-90 flex items-center gap-1.5 uppercase font-mono text-[9px]"
                  >
                    {powPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-slate-950" /> PAUSE MINING
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-slate-950" /> START MINING
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ==================== PROOF OF STAKE SIMULATION ==================== */}
          {mode === "pos" && (
            <motion.div
              key="pos-panel"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 h-full flex flex-col justify-between"
            >
              <div className="grid grid-cols-12 gap-3">
                {/* Validators Sidebar */}
                <div className="col-span-5 bg-slate-950/60 border border-white/5 rounded-xl p-3 space-y-3 font-mono text-[9.5px]">
                  <div className="flex items-center justify-between text-[8.5px] text-slate-500 uppercase tracking-wider mb-1 font-bold">
                    <span>VALIDATOR POOL</span>
                    <button onClick={resetPoS} className="text-slate-400 hover:text-white uppercase flex items-center gap-0.5 font-bold cursor-pointer">
                      <RefreshCw className="w-2.5 h-2.5" /> reset
                    </button>
                  </div>

                  <div className="space-y-2">
                    {stakeList.map((item) => {
                      const totalStake = stakeList.reduce((acc, val) => acc + val.stake, 1);
                      const pct = Math.round((item.stake / totalStake) * 100);
                      return (
                        <div key={item.id} className="p-2 border border-white/5 rounded-lg bg-[#070b18]/60 space-y-1 relative overflow-hidden">
                          {/* Slashed indicator */}
                          {item.status === "slashed" && (
                            <div className="absolute inset-0 bg-red-950/80 border border-red-500/25 flex items-center justify-center text-red-400 font-extrabold uppercase text-[8.5px] tracking-widest gap-1 select-none">
                              <Flame className="w-3 h-3 text-red-500 fill-red-500" /> SLASHED (EJECTED)
                            </div>
                          )}

                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="font-bold text-white truncate max-w-[110px]">{item.name}</span>
                          </div>
                          
                          <div className="flex justify-between text-[8.5px] text-slate-400">
                            <span>Stake: {item.stake} COINS</span>
                            <span style={{ color: item.color }}>{pct}% probability</span>
                          </div>
                          
                          {/* Weight bar */}
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Main Staking Visualizer */}
                <div className="col-span-7 bg-slate-950/40 border border-white/5 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden min-h-[250px]">
                  
                  {/* Validators in Orbit */}
                  <div className="flex-1 flex items-center justify-center relative py-6">
                    {/* Ring orbit */}
                    <div className="w-40 h-40 rounded-full border border-dashed border-white/10 flex items-center justify-center relative">
                      
                      {/* Orbit Nodes */}
                      {stakeList.map((node, idx) => {
                        const angle = idx * 90; // Angles: 0, 90, 180, 270
                        const rad = (angle * Math.PI) / 180;
                        const x = Math.cos(rad) * 64;
                        const y = Math.sin(rad) * 64;
                        const isNodeSelected = selectedValidator === idx;

                        return (
                          <motion.div
                            key={node.id}
                            style={{
                              left: `calc(50% + ${x}px)`,
                              top: `calc(50% + ${y}px)`,
                              translateX: "-50%",
                              translateY: "-50%",
                            }}
                            animate={isNodeSelected ? {
                              scale: [1, 1.2, 1],
                              boxShadow: `0 0 15px ${node.color}`
                            } : { scale: 1, boxShadow: "none" }}
                            transition={{ duration: 0.5, repeat: isNodeSelected && posStage === "proposing" ? Infinity : 0, repeatType: "reverse" }}
                            className={`absolute w-9 h-9 rounded-full border flex flex-col items-center justify-center text-[10px] font-mono font-bold z-10 select-none ${
                              node.status === "slashed" ? "bg-red-950/50 border-red-500/30 text-red-500" : "bg-slate-900 border-white/10 text-white"
                            }`}
                          >
                            {/* Outer glow ring when actively selected */}
                            {isNodeSelected && (
                              <div className="absolute inset-0 rounded-full animate-ping opacity-60" style={{ border: `1.5px solid ${node.color}` }} />
                            )}
                            
                            <Coins className="w-3.5 h-3.5" style={{ color: node.status === "slashed" ? "#ef4444" : node.color }} />
                            <span className="text-[7.5px] mt-0.5 tracking-tight font-extrabold">{node.id === 4 ? "BYZ" : `V-${node.id}`}</span>
                          </motion.div>
                        );
                      })}

                      {/* Pointer needle spinner in center */}
                      <motion.div
                        animate={
                          posStage === "spinning" ? { rotate: [0, 1080] } : {}
                        }
                        transition={{
                          duration: 2,
                          ease: "easeInOut"
                        }}
                        className="w-14 h-14 rounded-full border border-white/15 flex items-center justify-center relative bg-slate-950 z-20"
                      >
                        {/* Selector arrow */}
                        <div className="w-1.5 h-8 bg-indigo-400 absolute rounded-full rotate-45 origin-bottom" style={{ bottom: "50%", left: "calc(50% - 3px)" }} />
                        <div className="w-2.5 h-2.5 rounded-full bg-white border border-indigo-500 z-30" />
                      </motion.div>

                      {/* Glowing message propagation rings */}
                      {posStage === "attesting" && (
                        <div className="absolute inset-0 rounded-full border border-emerald-400/40 animate-ping" style={{ animationDuration: "1.5s" }} />
                      )}
                    </div>
                  </div>

                  {/* Stage message description */}
                  <div className="bg-black/60 border border-white/10 rounded-xl p-3 font-mono text-[10px] space-y-1.5 text-center min-h-[48px] flex flex-col justify-center">
                    {posStage === "idle" && (
                      <span className="text-slate-400 uppercase tracking-wider">STANDBY — CLICK 'PROPOSE BLOCK' TO COMMENCE STAKING ELECTION</span>
                    )}
                    {posStage === "spinning" && (
                      <span className="text-indigo-400 uppercase tracking-widest animate-pulse font-extrabold">ELECTION IN PROGRESS — ROLLING WEIGHTED PROBABILITY...</span>
                    )}
                    {posStage === "proposing" && selectedValidator !== null && (
                      <div className="space-y-0.5">
                        <span className="text-amber-400 uppercase tracking-wider font-bold block">BLOCK PROPOSED!</span>
                        <span className="text-white text-[9.5px]">Proposer: <span className="font-extrabold" style={{ color: stakeList[selectedValidator].color }}>{stakeList[selectedValidator].name}</span></span>
                      </div>
                    )}
                    {posStage === "attesting" && selectedValidator !== null && (
                      <div className="space-y-0.5">
                        <span className="text-emerald-400 uppercase tracking-wider font-bold block">✓ COLLECTING ATTESTATION SIGNATURES...</span>
                        <span className="text-slate-300 text-[9.5px]">Validators audit block transaction payload for consensus quorum</span>
                      </div>
                    )}
                    {posStage === "finalized" && (
                      <div className="space-y-0.5">
                        <span className="text-emerald-400 uppercase tracking-widest font-extrabold block">✓ BLOCK INDEX #805 SECURED & SEALED!</span>
                        <span className="text-slate-400 text-[9.5px]">Validator reward issued. Network state updated successfully.</span>
                      </div>
                    )}
                    {posStage === "slashed" && (
                      <div className="space-y-0.5 text-red-400">
                        <span className="text-red-500 uppercase tracking-widest font-extrabold block">🚨 DETECTED DOUBLE-SIGN BYZANTINE FAULT!</span>
                        <span className="text-slate-300 text-[9.5px]">Validator D attempted to propose conflicting block hashes. Slashing triggered.</span>
                      </div>
                    )}
                  </div>

                  {/* Byzantine Slashing dramatic alert pop up */}
                  <AnimatePresence>
                    {slashingAlert && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="absolute inset-0 bg-red-600/95 flex flex-col items-center justify-center text-slate-100 font-mono p-4 rounded-xl z-20 text-center"
                      >
                        <ShieldAlert className="w-9 h-9 animate-bounce text-white mb-2" />
                        <h4 className="font-extrabold text-sm tracking-wider">SLASHING PROTOCOL ACTIVE</h4>
                        <p className="text-[10px] uppercase font-bold tracking-widest mt-1">EVIDENCE: VALIDATOR D PROPOSING DOUBLE HEURISTICS</p>
                        <div className="bg-slate-950 text-red-500 font-extrabold text-[12px] px-3.5 py-1.5 rounded-lg mt-2.5 shadow-xl tracking-widest uppercase border border-red-500/20">
                          - 4.00 STAKE BURNED (BURNED TO ZERO)
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </div>

              {/* Controls bar */}
              <div className="bg-slate-950 border border-white/5 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono">
                <div className="flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-slate-400">LAST SELECTION PROPOSER:</span>
                  <span className="text-white font-extrabold pl-1">{lastBlockWinner || "NONE"}</span>
                </div>

                <div className="flex items-center gap-2 ml-auto shrink-0">
                  {stakeList[3].status === "active" && (
                    <button
                      onClick={triggerAttack}
                      disabled={posStage === "spinning" || posStage === "proposing" || posStage === "attesting"}
                      className="text-red-400 border border-red-500/20 bg-red-500/8 hover:bg-red-500/15 hover:border-red-500/40 font-bold px-3.5 py-2 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed uppercase font-mono text-[9px]"
                    >
                      Trigger Byzantine Attack
                    </button>
                  )}
                  
                  <button
                    onClick={runPoSConsensus}
                    disabled={posStage !== "idle"}
                    style={{ backgroundColor: posStage === "idle" ? color : "#1e293b" }}
                    className="text-slate-950 disabled:text-slate-500 font-bold px-4 py-2 rounded-lg cursor-pointer disabled:cursor-not-allowed hover:opacity-90 flex items-center gap-1.5 uppercase font-mono text-[9px]"
                  >
                    Propose Next Block
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}

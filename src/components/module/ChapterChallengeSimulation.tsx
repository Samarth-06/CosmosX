import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, RotateCcw, CheckCircle2, ShieldCheck, HelpCircle, Check } from "lucide-react";

interface Props {
  color: string;
}

interface BlockData {
  id: string; // "Beta" | "Alpha" | "Gamma" | "Delta"
  hash: string;
  prev: string;
  txDescription: string;
  txDetail: string;
}

const BLOCKS_POOL: BlockData[] = [
  { id: "Gamma", hash: "0xGAMMA", prev: "0xALPHA", txDescription: "Station B ➔ 50 Fuel ➔ Station C", txDetail: "Station A balance unchanged" },
  { id: "Delta", hash: "0xDELTA", prev: "0xGAMMA", txDescription: "Station C ➔ 10 Fuel ➔ Station A", txDetail: "Station A balance increases" },
  { id: "Beta", hash: "0xBETA", prev: "0x0000", txDescription: "Genesis ➔ 1000 Fuel ➔ Station A", txDetail: "Initial allocation to Station A" },
  { id: "Alpha", hash: "0xALPHA", prev: "0xBETA", txDescription: "Station A ➔ 100 Fuel ➔ Station B", txDetail: "Station A balance decreases" },
];

export default function ChapterChallengeSimulation({ color }: Props) {
  const [screen, setScreen] = useState<"intro" | "repair" | "replay" | "complete">("intro");
  
  // Game states for chain rebuilding
  const [scrambled, setScrambled] = useState<BlockData[]>(BLOCKS_POOL);
  const [selectedBlock, setSelectedBlock] = useState<BlockData | null>(null);
  const [slots, setSlots] = useState<(BlockData | null)[]>([null, null, null, null]);
  const [verifyStatus, setVerifyStatus] = useState<{ status: "idle" | "success" | "error"; msg: string }>({
    status: "idle",
    msg: "",
  });

  // Replay transaction ledger states
  const [replayIndex, setReplayIndex] = useState<number>(0);
  const [currentBalance, setCurrentBalance] = useState<number>(1000);
  const [userBalanceInput, setUserBalanceInput] = useState<string>("");
  const [balanceError, setBalanceError] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Restart repair module
  const handleReset = () => {
    setScrambled(BLOCKS_POOL);
    setSlots([null, null, null, null]);
    setSelectedBlock(null);
    setVerifyStatus({ status: "idle", msg: "" });
  };

  // Block clicks to place in slot
  const handleBlockSelect = (block: BlockData) => {
    setSelectedBlock(block);
  };

  const handleSlotClick = (slotIdx: number) => {
    if (!selectedBlock) return;
    
    // Remove selected block from scrambled pool
    setScrambled(prev => prev.filter(b => b.id !== selectedBlock.id));
    
    // Place in slot (if slot already has block, return it to scrambled pool)
    const newSlots = [...slots];
    const existingBlock = newSlots[slotIdx];
    if (existingBlock) {
      setScrambled(prev => [...prev, existingBlock]);
    }
    
    newSlots[slotIdx] = selectedBlock;
    setSlots(newSlots);
    setSelectedBlock(null);
    setVerifyStatus({ status: "idle", msg: "" });
  };

  const handleRemoveFromSlot = (slotIdx: number) => {
    const blockToRemove = slots[slotIdx];
    if (!blockToRemove) return;
    
    const newSlots = [...slots];
    newSlots[slotIdx] = null;
    setSlots(newSlots);
    setScrambled(prev => [...prev, blockToRemove]);
    setVerifyStatus({ status: "idle", msg: "" });
  };

  // Verify chain references
  const handleVerifyChain = () => {
    // 1. Ensure all slots are filled
    if (slots.some(s => s === null)) {
      setVerifyStatus({
        status: "error",
        msg: "Cannot verify: All chain slots must contain a block.",
      });
      return;
    }

    const b0 = slots[0]!;
    const b1 = slots[1]!;
    const b2 = slots[2]!;
    const b3 = slots[3]!;

    // 2. Check Genesis previous reference
    if (b0.prev !== "0x0000") {
      setVerifyStatus({
        status: "error",
        msg: "Link Failure: Slot 0 must be the Genesis Block (Previous Ref = 0x0000).",
      });
      return;
    }

    // 3. Link 0 -> 1
    if (b1.prev !== b0.hash) {
      setVerifyStatus({
        status: "error",
        msg: `Link Failure: Slot 1 previous reference (${b1.prev}) does not match Slot 0 hash (${b0.hash}).`,
      });
      return;
    }

    // 4. Link 1 -> 2
    if (b2.prev !== b1.hash) {
      setVerifyStatus({
        status: "error",
        msg: `Link Failure: Slot 2 previous reference (${b2.prev}) does not match Slot 1 hash (${b1.hash}).`,
      });
      return;
    }

    // 5. Link 2 -> 3
    if (b3.prev !== b2.hash) {
      setVerifyStatus({
        status: "error",
        msg: `Link Failure: Slot 3 previous reference (${b3.prev}) does not match Slot 2 hash (${b2.hash}).`,
      });
      return;
    }

    // Success! Lock in order and move to transaction replay
    setVerifyStatus({
      status: "success",
      msg: "Structure verified! Chain cryptographic linkage is valid.",
    });
    
    setTimeout(() => {
      setScreen("replay");
      setReplayIndex(0);
      setCurrentBalance(1000); // Start at Genesis allocation of 1000
    }, 1500);
  };

  // Replay processing steps
  const processNextReplay = () => {
    if (replayIndex === 0) {
      // Replay Alpha (Station A -> 100 -> Station B)
      setCurrentBalance(1000 - 100);
      setReplayIndex(1);
    } else if (replayIndex === 1) {
      // Replay Gamma (Station B -> 50 -> Station C)
      setCurrentBalance(900); // Unchanged for Station A
      setReplayIndex(2);
    }
  };

  // Fuel balance answers validation
  const handleVerifyBalance = () => {
    if (userBalanceInput.trim() === "910") {
      setScreen("complete");
    } else {
      setBalanceError(true);
      setTimeout(() => setBalanceError(false), 2000);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 flex flex-col justify-between min-h-[420px] lg:h-full relative overflow-hidden shadow-2xl">
      {/* Background visual grid overlay */}
      <div className="absolute inset-0 bg-size-[16px_16px] bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] pointer-events-none" />

      {/* Header status info */}
      <div className="relative z-10 border-b border-white/5 pb-3 flex justify-between items-center text-left">
        <div>
          <span className="font-mono text-[8px] tracking-widest text-cyan-400 uppercase block">Chapter Challenge</span>
          <h3 className="font-rushblade text-sm text-white mt-1">Space Log Reconstructor</h3>
          <p className="text-[9px] font-mono text-slate-400 mt-0.5">REPAIR THE BROKEN SPACE LOG</p>
        </div>

        <div className="px-2 py-0.5 rounded border border-rose-500/20 bg-rose-900/10 text-rose-400 font-mono text-[8px] tracking-wider font-bold">
          {screen === "intro" && "CORRUPTED DATA"}
          {screen === "repair" && "REBUILDING STRUCTURE"}
          {screen === "replay" && "REPLAYING LEDGER"}
          {screen === "complete" && "INTEGRITY SECURED"}
        </div>
      </div>

      {/* Main Viewport Content Areas */}
      <div className="relative z-10 flex-1 flex flex-col justify-center py-4">
        <AnimatePresence mode="wait">

          {/* INTRO SCREEN */}
          {screen === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center space-y-4"
            >
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400 text-[10px] font-mono font-bold animate-pulse">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>⚠ SOLAR FLARE ALERT</span>
              </div>

              <div className="space-y-1">
                <h4 className="text-white text-xs font-bold font-mono">CRITICAL ERROR: STORAGE ARRAY COMPROMISED</h4>
                <p className="text-slate-400 text-[9px] max-w-xs leading-relaxed mx-auto">
                  Spacecraft storage blocks have been scrambled. Cryptographic pointers are broken, leaving systems uncalibrated.
                </p>
              </div>

              <button
                onClick={() => setScreen("repair")}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-slate-950 font-bold rounded-lg font-mono text-[10px] shadow-lg transition"
              >
                INITIALIZE MANUAL REPAIR
              </button>
            </motion.div>
          )}

          {/* REBUILDING STATE CHANNELS */}
          {screen === "repair" && (
            <motion.div
              key="repair"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4 w-full"
            >
              {/* Scrambled Blocks storage pool */}
              <div className="space-y-1.5">
                <div className="text-[7.5px] font-mono text-slate-500 uppercase tracking-widest text-left">Scrambled Blocks (Select one to place)</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {scrambled.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => handleBlockSelect(b)}
                      className={`border p-2 rounded-xl text-left font-mono space-y-1 cursor-pointer transition-all ${
                        selectedBlock?.id === b.id
                          ? "border-cyan-400 bg-cyan-950/20 shadow-[0_0_10px_rgba(34,211,238,0.15)]"
                          : "border-white/5 bg-slate-900/30 hover:border-white/10 hover:bg-slate-900/50"
                      }`}
                    >
                      <div className="text-[8.5px] text-white font-bold">{b.id}</div>
                      <div className="text-[7px] text-slate-400">HASH: <span className="text-white font-bold">{b.hash}</span></div>
                      <div className="text-[7px] text-slate-400">PREV: <span className="text-cyan-400 font-bold">{b.prev}</span></div>
                    </button>
                  ))}
                  {scrambled.length === 0 && (
                    <div className="col-span-4 border border-dashed border-white/5 rounded-xl py-3 text-center text-slate-600 font-mono text-[9px]">
                      All blocks allocated to slots.
                    </div>
                  )}
                </div>
              </div>

              {/* Reconstructed Slots Grid */}
              <div className="space-y-1.5 mt-2">
                <div className="text-[7.5px] font-mono text-slate-500 uppercase tracking-widest text-left">Reconstructed chain (Select slot to place / Click block to remove)</div>
                <div className="flex items-center gap-1 sm:gap-2">
                  {slots.map((block, idx) => (
                    <div key={idx} className="flex-1 flex items-center">
                      {idx > 0 && <span className="text-slate-600 font-bold text-[8px] shrink-0 mr-1">←</span>}
                      
                      <button
                        onClick={() => block ? handleRemoveFromSlot(idx) : handleSlotClick(idx)}
                        className={`w-full border rounded-xl p-2 font-mono text-center flex flex-col justify-center min-h-[56px] transition-all cursor-pointer ${
                          block
                            ? "border-emerald-500/40 bg-emerald-950/5 hover:border-rose-500/40 hover:bg-rose-950/15"
                            : selectedBlock
                            ? "border-cyan-500/30 border-dashed bg-cyan-950/5 hover:bg-cyan-950/10"
                            : "border-white/5 bg-slate-950/40"
                        }`}
                      >
                        {block ? (
                          <>
                            <div className="text-[8px] font-bold text-white block">{block.id}</div>
                            <div className="text-[6.5px] text-slate-500 block">PREV: {block.prev}</div>
                          </>
                        ) : (
                          <div className="text-[8px] text-slate-600 font-bold">SLOT {idx}</div>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verification & reset controllers */}
              <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-1">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 px-3 py-1.5 border border-white/10 hover:border-white/20 rounded-lg font-mono text-[9px] text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> RESET ARRAY
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-mono text-slate-500 uppercase hidden sm:inline">
                    {verifyStatus.status === "error" ? "❌ FAILED" : verifyStatus.status === "success" ? "✓ PASSED" : "PENDING VERIFICATION"}
                  </span>
                  <button
                    onClick={handleVerifyChain}
                    className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg font-mono text-[9.5px] transition cursor-pointer"
                  >
                    VERIFY CHAIN
                  </button>
                </div>
              </div>

              {verifyStatus.msg && (
                <div className={`p-2.5 rounded-lg border font-mono text-[8.5px] text-left mt-2 ${
                  verifyStatus.status === "error"
                    ? "border-rose-500/20 bg-rose-500/5 text-rose-400"
                    : "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                }`}>
                  {verifyStatus.msg}
                </div>
              )}
            </motion.div>
          )}

          {/* LEDGER REPLAY MODULE */}
          {screen === "replay" && (
            <motion.div
              key="replay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4 w-full"
            >
              {/* Header flow status */}
              <div className="flex justify-between items-center border-b border-white/5 pb-2 text-left">
                <span className="font-mono text-[8px] text-slate-500 uppercase tracking-widest">Phase 2: Replay Ledger state</span>
                <span className="font-mono text-[8px] text-emerald-400 font-bold">RECONSTRUCTED</span>
              </div>

              {/* Central flow block detail */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                
                {/* Ledger replay timeline */}
                <div className="border border-white/5 bg-slate-950 p-3 rounded-xl flex flex-col gap-2 font-mono text-[8.5px] text-left">
                  <div className="text-[7.5px] text-slate-500 uppercase tracking-wider mb-1">State Log Chain</div>
                  
                  {/* Block Beta (Height 0) */}
                  <div className="px-2 py-1.5 border border-emerald-500/20 bg-emerald-950/5 rounded-lg flex justify-between items-center">
                    <div>
                      <span className="text-white font-bold block">Beta (Block 0)</span>
                      <span className="text-slate-500 block">{slots[0]?.txDescription}</span>
                    </div>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  </div>

                  {/* Block Alpha (Height 1) */}
                  <div className={`px-2 py-1.5 border rounded-lg flex justify-between items-center transition-all ${
                    replayIndex >= 1
                      ? "border-emerald-500/20 bg-emerald-950/5"
                      : "border-white/5 bg-slate-900/30 opacity-70"
                  }`}>
                    <div>
                      <span className="text-white font-bold block">Alpha (Block 1)</span>
                      <span className="text-slate-500 block">{slots[1]?.txDescription}</span>
                    </div>
                    {replayIndex >= 1 && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>

                  {/* Block Gamma (Height 2) */}
                  <div className={`px-2 py-1.5 border rounded-lg flex justify-between items-center transition-all ${
                    replayIndex >= 2
                      ? "border-emerald-500/20 bg-emerald-950/5"
                      : "border-white/5 bg-slate-900/30 opacity-70"
                  }`}>
                    <div>
                      <span className="text-white font-bold block">Gamma (Block 2)</span>
                      <span className="text-slate-500 block">{slots[2]?.txDescription}</span>
                    </div>
                    {replayIndex >= 2 && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>

                  {/* Block Delta (Height 3) */}
                  <div className={`px-2 py-1.5 border rounded-lg flex justify-between items-center transition-all ${
                    replayIndex === 2
                      ? "border-amber-500/40 bg-amber-950/5 animate-pulse"
                      : "border-white/5 bg-slate-900/30 opacity-60"
                  }`}>
                    <div>
                      <span className="text-white font-bold block">Delta (Block 3)</span>
                      <span className="text-slate-500 block">{slots[3]?.txDescription}</span>
                    </div>
                  </div>
                </div>

                {/* Balance & verification calculator */}
                <div className="border border-white/5 bg-slate-900/20 p-4 rounded-xl flex flex-col justify-between text-left space-y-4">
                  <div>
                    <span className="text-[7.5px] font-mono text-slate-500 uppercase tracking-widest block">Ledger State</span>
                    <span className="font-mono text-[10px] text-slate-400 mt-1 block">Station A Fuel Balance:</span>
                    <span className="text-3xl font-black text-white block mt-0.5 tracking-wider">
                      {currentBalance} <span className="text-xs text-slate-500">FUEL</span>
                    </span>
                  </div>

                  {/* Control / Submit state */}
                  {replayIndex < 2 ? (
                    <button
                      onClick={processNextReplay}
                      className="w-full py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-lg font-mono text-[10px] transition cursor-pointer"
                    >
                      PROCESS NEXT BLOCK
                    </button>
                  ) : (
                    <div className="space-y-2 font-mono">
                      <div className="text-[7.5px] text-slate-500 uppercase tracking-wider block">Final calculation required</div>
                      
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={userBalanceInput}
                          onChange={(e) => setUserBalanceInput(e.target.value)}
                          placeholder="Final fuel balance"
                          className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-mono text-white focus:outline-none focus:border-cyan-400"
                        />
                        <button
                          onClick={handleVerifyBalance}
                          className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-[10px] transition cursor-pointer"
                        >
                          SUBMIT
                        </button>
                      </div>

                      {/* Hint link toggler */}
                      <button
                        onClick={() => setShowHint(!showHint)}
                        className="text-[8px] text-slate-500 hover:text-slate-300 flex items-center gap-1 font-bold underline transition cursor-pointer"
                      >
                        <HelpCircle className="w-3 h-3" /> {showHint ? "Hide Hint" : "Need a Hint?"}
                      </button>

                      {showHint && (
                        <div className="p-2 border border-white/5 bg-slate-950 rounded text-[7.5px] text-slate-400 leading-relaxed">
                          Beta starts A with 1000. Alpha sends 100 from A to B (balance: 900). Gamma sends 50 from B to C (A balance unchanged). Delta sends 10 from C back to A. Apply this final update to get the remaining total.
                        </div>
                      )}

                      {balanceError && (
                        <div className="text-[8.5px] text-rose-400 animate-shake">
                          ✕ Balance mismatch. Replay transaction log and try again.
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          )}

          {/* CHALLENGE COMPLETE SUCCESS */}
          {screen === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
                <ShieldCheck className="w-6 h-6 animate-pulse" />
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-bold font-mono uppercase tracking-widest text-emerald-400">Mission Accomplished</h4>
                <p className="text-slate-300 text-[9px] max-w-xs leading-relaxed mx-auto">
                  Space storage ledger repaired, blockchain integrity verification scanner passed, and Station A balance validated: <span className="font-bold text-emerald-400">910 Fuel</span>.
                </p>
              </div>

              {/* Answer revealing table for challenge inputs */}
              <div className="border border-white/5 bg-slate-900/40 p-3.5 rounded-xl font-mono text-[9px] w-64 text-left space-y-2">
                <div className="text-[7.5px] text-slate-500 uppercase tracking-widest border-b border-white/5 pb-1">Challenge Answers</div>
                <div className="flex justify-between"><span>Block 0 (Genesis):</span> <span className="text-emerald-400 font-bold">Beta</span></div>
                <div className="flex justify-between"><span>Block 1:</span> <span className="text-emerald-400 font-bold">Alpha</span></div>
                <div className="flex justify-between"><span>Block 2:</span> <span className="text-emerald-400 font-bold">Gamma</span></div>
                <div className="flex justify-between"><span>Block 3:</span> <span className="text-emerald-400 font-bold">Delta</span></div>
                <div className="flex justify-between"><span>Final Fuel Balance:</span> <span className="text-emerald-400 font-bold">910</span></div>
              </div>

              <div className="text-[8px] text-slate-500 italic">
                Enter these details in the challenge forms on the left to confirm.
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}

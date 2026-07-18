import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
interface TerminalSimProps {
  currentTask: string;
  onCompleteTask: () => void;
}

interface TerminalLine {
  text: string;
  type: "input" | "output" | "error" | "success" | "warning";
  delay?: number;
}

export default function TerminalSim({ currentTask, onCompleteTask }: TerminalSimProps) {
  const [inputVal, setInputVal] = useState("");
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentStepState, setCurrentStepState] = useState<string>("init");
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines, isTyping]);

  useEffect(() => {
    setInputVal("");
    setCurrentStepState("init");
    if (currentTask === "task1") {
      setLines([
        { text: "⚡ SECURE COMMS LINK ESTABLISHED // OPERATION: GENESIS LEDGER", type: "success" },
        { text: "INTRUSION RADAR: Discrepancy caught in Mercury-Earth transport pipeline.", type: "warning" },
        { text: "Instructions: Initiate a full scan of Earth's Central Ledger via 'inspect-server'.", type: "output" },
      ]);
    } else if (currentTask === "task2") {
      setLines([
        { text: "[SAT] SEGMENT AUDIT IN PROGRESS // CENTRAL MASTER CONTROL", type: "success" },
        { text: "Earth central command registry loaded into local sandbox.", type: "output" },
        { text: "CRITICAL: Transaction checksum mismatch detected in transaction TX003.", type: "warning" },
        { text: "Instructions: Execute 'investigate' to read raw logs and track system manipulation.", type: "output" },
      ]);
    } else if (currentTask === "task3") {
      setLines([
        { text: "[!] ENCRYPTION COMPROMISED // LOCAL DATA CORRUPTED", type: "error" },
        { text: "Earth Central Command Database confirmed compromised. TX003 was forged.", type: "warning" },
        { text: "We must deploy replicated nodes across outer bases to prevent blind trust in a single authority.", type: "output" },
        { text: "Instructions: Run 'deploy-record-copies' to setup backup nodes.", type: "output" },
      ]);
    }
  }, [currentTask]);

  const handleCommand = async (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    if (!trimmedCmd) return;

    setLines((prev) => [...prev, { text: `operator@mercury-terminal:~$ ${cmd}`, type: "input" }]);
    setInputVal("");
    setIsTyping(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    if (currentTask === "task1") {
      if (trimmedCmd === "inspect-server") {
        setLines((prev) => [
          ...prev,
          { text: "CONNECTING TO EARTH CENTRAL ROUTING GATEWAY...", type: "output" },
          { text: "SECURE SOCKET LAYER MOUNTED. DECRYPTING TRANSIT LEDGER...", type: "output" },
          { text: "=========================================================", type: "output" },
          { text: "TRANSACTION REGISTRY EXPORT (SECTOR 01):", type: "success" },
          { text: "TX001: Earth-HQ ➔ Lunar Base Alpha [50 MT PROPELLANT] (SUCCESS)", type: "output" },
          { text: "TX002: Earth-HQ ➔ Mars Colony One  [200 MT PROPELLANT] (SUCCESS)", type: "output" },
          { text: "TX003: Earth-HQ ➔ Europa Transit  [900 MT PROPELLANT] (FLAGGED: FUEL LOSS)", type: "warning" },
          { text: "=========================================================", type: "output" },
          { text: "Checksum verification failed. Execute 'investigate' to scan system records.", type: "success" },
        ]);
        onCompleteTask();
      } else {
        setLines((prev) => [
          ...prev,
          { text: `System instruction '${cmd}' unrecognized. Initiate 'inspect-server'.`, type: "error" },
        ]);
      }
    } else if (currentTask === "task2") {
      if (trimmedCmd === "investigate") {
        setLines((prev) => [
          ...prev,
          { text: "SCANNING LOW-LEVEL TELEMETRY LOGS...", type: "output" },
          { text: "DISCREPANCY ALERT: DB state differs from original pilot transmission!", type: "error" },
          { text: "  - Earth Central Registry: TX003 ➔ 900 MT Propellant", type: "warning" },
          { text: "  - Local Ship Log Backup:  TX003 ➔ 100 MT Propellant", type: "success" },
          { text: "  - System Log Status:     ✗ SIGNATURE MODIFICATION DETECTED", type: "error" },
          { text: "=========================================================", type: "output" },
          { text: "CONCLUSION: Hackers modified the central server database after takeoff", type: "warning" },
          { text: "to secretly reroute 800 MT of propellant to an unknown base.", type: "error" },
          { text: "Proceed to deploy distributed recovery nodes.", type: "success" },
        ]);
        onCompleteTask();
      } else {
        setLines((prev) => [
          ...prev,
          { text: `System instruction '${cmd}' unrecognized. Initiate 'investigate'.`, type: "error" },
        ]);
      }
    } else if (currentTask === "task3") {
      if (trimmedCmd === "deploy-record-copies" && currentStepState === "init") {
        setIsTyping(true);
        setLines((prev) => [...prev, { text: "INJECTING CRYPTOGRAPHIC LEDGER REPLICAS...", type: "output" }]);
        
        setTimeout(() => {
          setLines((prev) => [...prev, { text: "EARTH CONTROL NODE   [STATUS: COMPROMISED / 900 MT]", type: "error" }]);
        }, 800);
        setTimeout(() => {
          setLines((prev) => [...prev, { text: "MARS OUTPOST NODE    [STATUS: SECURE / 100 MT]", type: "success" }]);
        }, 1600);
        setTimeout(() => {
          setLines((prev) => [...prev, { text: "EUROPA TRANSIT NODE  [STATUS: SECURE / 100 MT]", type: "success" }]);
        }, 2400);

        setTimeout(() => {
          setLines((prev) => [
            ...prev,
            { text: "✓ 3 INDEPENDENT NETWORK REPLICAS ONLINE", type: "success" },
            { text: "=========================================================", type: "output" },
            { text: "EARTH LEDGER COPY:   TX003 ➔ 900 MT (Manipulated Hub State)", type: "error" },
            { text: "MARS LEDGER COPY:    TX003 ➔ 100 MT (Original Verified)", type: "success" },
            { text: "EUROPA LEDGER COPY:  TX003 ➔ 100 MT (Original Verified)", type: "success" },
            { text: "=========================================================", type: "output" },
          ]);
          setIsTyping(false);
          setCurrentStepState("deployed");
        }, 3200);

      } else if (trimmedCmd === "compare-records" && currentStepState === "chooseCompare") {
        setIsTyping(true);
        setLines((prev) => [...prev, { text: "EXECUTING DISTRIBUTED VERIFICATION SYSTEM...", type: "output" }]);

        setTimeout(() => {
          setLines((prev) => [
            ...prev,
            { text: "NODE [EARTH]      ✗ MISMATCH FOUND (Ledger data corrupted)", type: "error" },
            { text: "NODE [MARS]       ✓ VALID (100 MT)", type: "success" },
            { text: "NODE [EUROPA]     ✓ VALID (100 MT)", type: "success" },
            { text: "=========================================================", type: "output" },
            { text: "[SAT] ANOMALY DETECTED IN SECTOR NODE: EARTH", type: "error" },
            { text: "TACTICAL DISCOVERY:", type: "success" },
            { text: "If independent participants maintain verifiable copies, we don't have to blindly trust one database owner.", type: "success" },
            { text: "A corrupted record can be detected by comparing it with other copies.", type: "success" },
            { text: "=========================================================", type: "output" },
            { text: "System verification verified. Moving to architecture layout review.", type: "success" },
          ]);
          setIsTyping(false);
          setCurrentStepState("done");
        }, 2000);
      } else {
        const expected = currentStepState === "chooseCompare" ? "compare-records" : "deploy-record-copies";
        setLines((prev) => [
          ...prev,
          { text: `System instruction '${cmd}' unrecognized. Execute '${expected}'.`, type: "error" },
        ]);
      }
    } else {
      setLines((prev) => [...prev, { text: "All commands completed. Comms locked.", type: "warning" }]);
    }

    setIsTyping(false);
  };

  const getHelperCommand = () => {
    if (currentTask === "task1") return "inspect-server";
    if (currentTask === "task2") return "investigate";
    if (currentTask === "task3") {
      if (currentStepState === "init") return "deploy-record-copies";
      if (currentStepState === "chooseCompare") return "compare-records";
    }
    return null;
  };

  const helperCmd = getHelperCommand();

  return (
    <div className="flex flex-col h-[400px] border border-white/10 bg-slate-950/80 rounded-2xl p-4 font-mono text-xs shadow-2xl relative">
      {/* Title bar */}
      <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          <span className="text-[9px] text-muted-foreground ml-2 uppercase">operator_console_v2</span>
        </div>
        <span className="text-[10px] text-cyan-400 font-rushblade tracking-wider">CLASSIFIED OPERATIONS TERMINAL</span>
      </div>

      {/* Terminal lines */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-2 mb-3 scrollbar-thin scrollbar-thumb-white/10">
        {lines.map((line, idx) => (
          <div
            key={idx}
            className={`leading-relaxed whitespace-pre-wrap ${
              line.type === "input"
                ? "text-white"
                : line.type === "error"
                ? "text-rose-400 font-bold"
                : line.type === "warning"
                ? "text-amber-400"
                : line.type === "success"
                ? "text-emerald-400 font-bold"
                : "text-slate-300"
            }`}
          >
            {line.text}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-1 text-slate-400">
            <span className="animate-pulse">[SAT] Reading telemetry records...</span>
          </div>
        )}

        {/* Sub-State: Question in Task 3 */}
        {currentTask === "task3" && currentStepState === "deployed" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/60 p-3 rounded-lg border border-cyan-500/20 my-3"
          >
            <p className="text-cyan-400 font-bold mb-3">
              “One record is different. How can we detect which database may have been modified?”
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setLines((prev) => [
                    ...prev,
                    { text: "Selected: Check server timestamp logs", type: "input" },
                    { text: "Result: Local database timestamps were wiped by hackers. Trust is impossible.", type: "error" },
                  ]);
                }}
                className="text-left bg-slate-950/60 border border-white/5 hover:bg-slate-900 px-3 py-2 rounded transition text-[11px]"
              >
                1. Inspect local transaction database timestamps.
              </button>
              <button
                onClick={() => {
                  setLines((prev) => [
                    ...prev,
                    { text: "Selected: Compare the copies", type: "input" },
                    { text: "Result: Verified. Comparing independent copies isolates the modified database.", type: "success" },
                    { text: "Type 'compare-records' to verify states.", type: "output" },
                  ]);
                  setCurrentStepState("chooseCompare");
                }}
                className="text-left bg-slate-950/60 border border-white/5 hover:border-cyan-500/30 hover:bg-slate-900 px-3 py-2 rounded transition text-[11px] font-bold text-emerald-400"
              >
                2. Compare the copies (Check for consensus mismatch).
              </button>
              <button
                onClick={() => {
                  setLines((prev) => [
                    ...prev,
                    { text: "Selected: Query Earth Central Database owner", type: "input" },
                    { text: "Result: Earth host claims data is correct. No local alerts triggered.", type: "error" },
                  ]);
                }}
                className="text-left bg-slate-950/60 border border-white/5 hover:bg-slate-900 px-3 py-2 rounded transition text-[11px]"
              >
                3. Ask the Earth central network admin to self-audit.
              </button>
            </div>
          </motion.div>
        )}

        {/* Task 3 Completion Proceed */}
        {currentTask === "task3" && currentStepState === "done" && (
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="mt-4 flex justify-end">
            <button
              onClick={onCompleteTask}
              className="inline-flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg shadow-lg hover:shadow-emerald-500/20 transition-all uppercase tracking-wider text-[10px] font-rushblade cursor-pointer"
            >
              <span>Analyze Architecture Decision</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}

        <div ref={terminalEndRef} />
      </div>

      {/* Input bar */}
      {currentTask !== "completed" && currentStepState !== "done" && currentStepState !== "deployed" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCommand(inputVal);
          }}
          className="flex items-center border-t border-white/5 pt-3"
        >
          <span className="text-cyan-400/90 font-bold mr-2 select-none">operator@mercury-terminal:~$</span>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={isTyping}
            placeholder={helperCmd ? `Type '${helperCmd}'...` : "Enter system instruction..."}
            className="flex-1 bg-transparent outline-none border-none text-white font-mono placeholder-slate-600 focus:ring-0"
            autoFocus
          />
        </form>
      )}

      {/* Quick helper tag */}
      {helperCmd && currentStepState !== "deployed" && (
        <div className="absolute right-4 bottom-14 flex items-center gap-1.5 bg-slate-900 border border-white/10 px-2 py-1.5 rounded-lg shadow-lg">
          <span className="text-[10px] text-muted-foreground uppercase font-mono">Quick input:</span>
          <button
            onClick={() => handleCommand(helperCmd)}
            className="bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded text-[10px] font-mono transition"
          >
            {helperCmd}
          </button>
        </div>
      )}
    </div>
  );
}

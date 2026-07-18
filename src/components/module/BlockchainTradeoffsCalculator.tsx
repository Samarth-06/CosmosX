import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, Coins, Zap, ShieldAlert, Play, RefreshCw, Clock } from "lucide-react";

interface Props {
  color: string;
}

export default function BlockchainTradeoffsCalculator({ color }: Props) {
  const [load, setLoad] = useState(1000); // Slider for requests: 100 to 10000
  const [status, setStatus] = useState<"idle" | "running" | "complete">("idle");
  
  // DB Live metrics
  const [dbProgress, setDbProgress] = useState(0);
  const [dbTime, setDbTime] = useState(0);
  
  // BC Live metrics
  const [bcProgress, setBcProgress] = useState(0);
  const [bcTime, setBcTime] = useState(0);

  useEffect(() => {
    if (status !== "running") return;

    // DB processes at 5000 requests/sec. So time = load / 5000.
    const dbTotalTimeMs = (load / 5000) * 1000;
    const dbStep = 30; // interval in ms
    let dbElapsed = 0;
    
    const dbTimer = setInterval(() => {
      dbElapsed += dbStep;
      const progress = Math.min((dbElapsed / dbTotalTimeMs) * 100, 100);
      setDbProgress(progress);
      setDbTime(dbElapsed / 1000);

      if (progress >= 100) {
        clearInterval(dbTimer);
      }
    }, dbStep);

    // BC processes at 15 requests/sec. So time = load / 15.
    // To keep the visual simulation responsive, we scale down the time, but display the actual calculated clock!
    const bcDisplayTotalTime = load / 15; // in seconds
    const bcSimTotalTimeMs = Math.min(6000, bcDisplayTotalTime * 100); // max 6s simulation time
    const bcStep = 50;
    let bcElapsed = 0;

    const bcTimer = setInterval(() => {
      bcElapsed += bcStep;
      const progress = Math.min((bcElapsed / bcSimTotalTimeMs) * 100, 100);
      setBcProgress(progress);
      
      // Calculate scaled simulated time to show actual production estimate
      const currentSimulatedTime = (progress / 100) * bcDisplayTotalTime;
      setBcTime(currentSimulatedTime);

      if (progress >= 100) {
        clearInterval(bcTimer);
        setStatus("complete");
      }
    }, bcStep);

    return () => {
      clearInterval(dbTimer);
      clearInterval(bcTimer);
    };
  }, [status, load]);

  const runTest = () => {
    setDbProgress(0);
    setDbTime(0);
    setBcProgress(0);
    setBcTime(0);
    setStatus("running");
  };

  const resetCalculator = () => {
    setDbProgress(0);
    setDbTime(0);
    setBcProgress(0);
    setBcTime(0);
    setStatus("idle");
  };

  // Cost calculations
  const dbCost = load * 0.0001;
  const bcCost = load * 1.20;

  return (
    <div className="flex flex-col h-full bg-[#040816]/60 rounded-2xl border border-white/10 overflow-hidden text-slate-100 p-4 font-sans select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3 shrink-0">
        <div>
          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">Scale, Speed, & Financial Metrics</span>
          <h3 className="text-xs font-bold font-mono uppercase tracking-wide text-white">Database vs. Blockchain Tradeoff Stress Test</h3>
        </div>

        <button onClick={resetCalculator} className="text-[9.5px] font-mono text-slate-400 hover:text-white uppercase flex items-center gap-1 cursor-pointer">
          <RefreshCw className="w-3 h-3" /> Reset
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin space-y-4">
        
        {/* Test Parameters Slider */}
        <div className="bg-slate-950 border border-white/5 rounded-xl p-3 space-y-2 text-[10px] font-mono">
          <div className="flex justify-between text-[9px] text-slate-400 uppercase tracking-widest">
            <span>Volume requests to process:</span>
            <span className="text-sky-400 font-extrabold">{load.toLocaleString()} Writes</span>
          </div>
          
          <input
            type="range"
            min="100"
            max="10000"
            step="100"
            value={load}
            disabled={status === "running"}
            onChange={(e) => setLoad(parseInt(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400 disabled:opacity-40"
          />
        </div>

        {/* Comparison columns */}
        <div className="grid grid-cols-2 gap-3.5">
          
          {/* Column A: Traditional Centralized Database */}
          <div className="bg-slate-950/40 border border-white/5 rounded-xl p-3.5 flex flex-col justify-between space-y-4 relative overflow-hidden">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-[9.5px] font-extrabold uppercase text-white">Centralized DB (MySQL)</span>
            </div>

            <div className="space-y-3 font-mono text-[9px] flex-1">
              <div className="flex justify-between">
                <span className="text-slate-500">MAX THROUGHPUT:</span>
                <span className="text-emerald-400 font-bold">5,000+ writes/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">AVG WRITE COST:</span>
                <span className="text-emerald-400 font-bold">$0.0001 / write</span>
              </div>
              
              <div className="space-y-1.5 border-t border-white/5 pt-3">
                <span className="text-slate-500 block uppercase">STRESS PROGRESS:</span>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-75" style={{ width: `${dbProgress}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-[#060a16] p-2 rounded-lg border border-white/5">
                  <span className="text-slate-500 text-[7px] uppercase block">Processing Time:</span>
                  <span className="text-white text-[10px] font-bold">{dbTime.toFixed(3)}s</span>
                </div>
                <div className="bg-[#060a16] p-2 rounded-lg border border-white/5">
                  <span className="text-slate-500 text-[7px] uppercase block">Total Billing Cost:</span>
                  <span className="text-white text-[10px] font-extrabold">${dbCost.toFixed(4)}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Column B: Blockchain public ledger */}
          <div className="bg-slate-950/40 border border-white/5 rounded-xl p-3.5 flex flex-col justify-between space-y-4 relative overflow-hidden">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <Coins className="w-4 h-4 text-sky-400" />
              <span className="font-mono text-[9.5px] font-extrabold uppercase text-white">Public Blockchain</span>
            </div>

            <div className="space-y-3 font-mono text-[9px] flex-1">
              <div className="flex justify-between">
                <span className="text-slate-500">MAX THROUGHPUT:</span>
                <span className="text-sky-400 font-bold">15 writes/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">AVG WRITE COST:</span>
                <span className="text-sky-400 font-bold">$1.20 / transaction</span>
              </div>

              <div className="space-y-1.5 border-t border-white/5 pt-3">
                <span className="text-slate-500 block uppercase">STRESS PROGRESS:</span>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: `${bcProgress}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-[#060a16] p-2 rounded-lg border border-white/5">
                  <span className="text-slate-500 text-[7px] uppercase block">Processing Time:</span>
                  <span className="text-white text-[10px] font-bold">{bcTime.toFixed(1)}s</span>
                </div>
                <div className="bg-[#060a16] p-2 rounded-lg border border-white/5">
                  <span className="text-slate-500 text-[7px] uppercase block">Total Gas Fees:</span>
                  <span className="text-white text-[10px] font-extrabold">${bcCost.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Storage bloat warning alerts */}
            {status === "complete" && (
              <div className="absolute inset-0 bg-red-950/90 border border-red-500/30 rounded-xl p-3 flex flex-col justify-center items-center text-center font-mono z-10 space-y-1 animate-fade-in">
                <ShieldAlert className="w-6 h-6 text-red-500" />
                <span className="text-red-400 font-extrabold uppercase text-[9px]">BLOCKCHAIN STORAGE BLOAT</span>
                <p className="text-[7.5px] text-slate-300 leading-relaxed uppercase">
                  Writing {load.toLocaleString()} txs consumed {Math.round(load * 0.25)} KB SSD storage permanently across all full nodes.
                </p>
              </div>
            )}

          </div>

        </div>

        {/* Action Panel */}
        <div className="bg-slate-950 border border-white/5 rounded-xl p-3 flex items-center justify-between text-[10px] font-mono">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-400">Public blockchains guarantee trust and auditability, but trade off speed and cost.</span>
          </div>

          <button
            onClick={runTest}
            disabled={status === "running"}
            style={{ backgroundColor: status !== "running" ? color : "#1e293b" }}
            className="text-slate-950 disabled:text-slate-500 font-bold px-4 py-2 rounded-lg cursor-pointer disabled:cursor-not-allowed hover:opacity-90 flex items-center gap-1.5 uppercase font-mono text-[9px] ml-auto"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" /> RUN STRESS LOAD TEST
          </button>
        </div>
      </div>

    </div>
  );
}

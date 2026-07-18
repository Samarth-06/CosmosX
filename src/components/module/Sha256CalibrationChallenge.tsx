import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Lock, Unlock, AlertTriangle, CheckCircle, RefreshCw, Key, ShieldAlert, Database, ArrowRight } from "lucide-react";

interface Props {
  color: string;
}

// Precomputed real SHA-256 hashes of configurations
const REAL_HASHES = {
  ENGINE_THRUST_85: "59176f27464af26ef5707f176bcfbc0297d74d06562845350c82da79e5715f59",
  FUEL_MIX_42: "a480bc33d37decd1143ea1f01c5832685cf6aceb99958c61a017abccf32b3bde",
  FUEL_MIX_47: "1d696eb09ebd683db9790ba711283aa8109a74ed8c3ab11eabd28408d31cddb5",
  COOLANT_FLOW_70: "1c70657750f86c94ea62e34b6961a485c9256f3a92325f5c532bc5ca5d42bbf2",
  IGNITION_DELAY_3: "e887f88bfb72b1032bc346d0558a8ea3134e465e1b4bc73516329acc1fc504ba",
};

interface ConfigItem {
  id: string;
  name: string;
  value: string;
  expectedHash: string;
  calculatedHash: string;
  status: "unverified" | "calculating" | "mismatch" | "verified";
  isCorrupted: boolean;
}

const INITIAL_CONFIGS: ConfigItem[] = [
  {
    id: "thrust",
    name: "ENGINE_THRUST",
    value: "85",
    expectedHash: REAL_HASHES.ENGINE_THRUST_85,
    calculatedHash: "",
    status: "unverified",
    isCorrupted: false,
  },
  {
    id: "fuel",
    name: "FUEL_MIX",
    value: "47", // Corrupted state! Expected should correspond to value 42
    expectedHash: REAL_HASHES.FUEL_MIX_42,
    calculatedHash: "",
    status: "unverified",
    isCorrupted: true,
  },
  {
    id: "coolant",
    name: "COOLANT_FLOW",
    value: "70",
    expectedHash: REAL_HASHES.COOLANT_FLOW_70,
    calculatedHash: "",
    status: "unverified",
    isCorrupted: false,
  },
  {
    id: "delay",
    name: "IGNITION_DELAY",
    value: "3",
    expectedHash: REAL_HASHES.IGNITION_DELAY_3,
    calculatedHash: "",
    status: "unverified",
    isCorrupted: false,
  },
];

export default function Sha256CalibrationChallenge({ color }: Props) {
  // Scenario state
  const [gameState, setGameState] = useState<"intro" | "calibration" | "igniting" | "online">("intro");
  const [configs, setConfigs] = useState<ConfigItem[]>(INITIAL_CONFIGS);
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);
  const [selectedHash, setSelectedHash] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"instructions" | "console">("instructions");
  const [log, setLog] = useState<string[]>([]);
  const [countdown, setCountdown] = useState(3);
  const [showHint, setShowHint] = useState(false);

  // Scrambled validation hashes in DB
  const scrambledHashes = [
    REAL_HASHES.COOLANT_FLOW_70,
    REAL_HASHES.ENGINE_THRUST_85,
    REAL_HASHES.FUEL_MIX_42,
    REAL_HASHES.IGNITION_DELAY_3,
  ];

  // Helper to append console log
  const writeLog = (msg: string) => {
    setLog(prev => [...prev.slice(-14), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // Launch Intro Sequence
  useEffect(() => {
    if (gameState === "intro") {
      writeLog("COSMOSX FLIGHT SYSTEM v4.9 BOOTING...");
      const t1 = setTimeout(() => writeLog("LOADING ENGINE CONFIGURATION DATA..."), 700);
      const t2 = setTimeout(() => writeLog("⚠ WARNING: CONFIGURATION INTEGRITY REQUIRED"), 1400);
      const t3 = setTimeout(() => {
        writeLog("Pre-launch calibration sequence loaded.");
        setGameState("calibration");
      }, 2400);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [gameState]);

  // Countdown timer for engine ignition
  useEffect(() => {
    if (gameState === "igniting") {
      if (countdown > 0) {
        const timer = setTimeout(() => {
          setCountdown(prev => prev - 1);
          writeLog(`Ignition sequence: ${countdown - 1}...`);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        setGameState("online");
        writeLog("🚀 IGNITION SUCCESSFUL! ROCKET ENGINE ONLINE");
      }
    }
  }, [gameState, countdown]);

  const activeConfig = configs.find(c => c.id === selectedConfigId);

  // Trigger SHA-256 calculation
  const handleCalculateHash = (configId: string) => {
    setConfigs(prev =>
      prev.map(c => {
        if (c.id === configId) {
          return { ...c, status: "calculating" };
        }
        return c;
      })
    );
    writeLog(`Running SHA-256 calculation on config parameter: ${configId.toUpperCase()}`);

    setTimeout(() => {
      setConfigs(prev =>
        prev.map(c => {
          if (c.id === configId) {
            let calculated = "";
            if (c.id === "thrust") calculated = REAL_HASHES.ENGINE_THRUST_85;
            else if (c.id === "coolant") calculated = REAL_HASHES.COOLANT_FLOW_70;
            else if (c.id === "delay") calculated = REAL_HASHES.IGNITION_DELAY_3;
            else if (c.id === "fuel") {
              calculated = c.value === "42" ? REAL_HASHES.FUEL_MIX_42 : REAL_HASHES.FUEL_MIX_47;
            }
            writeLog(`Calculated hash digest: ${calculated.slice(0, 16)}...`);
            return { ...c, calculatedHash: calculated, status: "unverified" };
          }
          return c;
        })
      );
    }, 1000);
  };

  // Perform Expected vs Calculated validation compare
  const handleVerifyLink = () => {
    if (!selectedConfigId || !selectedHash) return;

    const current = configs.find(c => c.id === selectedConfigId);
    if (!current) return;

    writeLog(`Comparing calculated hash with selected trusted hash...`);

    const isMatch = current.calculatedHash === selectedHash;

    setTimeout(() => {
      if (isMatch) {
        setConfigs(prev =>
          prev.map(c => {
            if (c.id === selectedConfigId) {
              return { ...c, status: "verified" };
            }
            return c;
          })
        );
        writeLog(`✓ INTEGRITY VERIFIED: Config ${current.name} matches database hash reference.`);
        setSelectedConfigId(null);
        setSelectedHash(null);
      } else {
        setConfigs(prev =>
          prev.map(c => {
            if (c.id === selectedConfigId) {
              return { ...c, status: "mismatch" };
            }
            return c;
          })
        );
        writeLog(`✕ HASH MISMATCH: Calculated fingerprint does not match reference digest.`);
      }
    }, 800);
  };

  // Repair mechanism
  const handleRepairValue = (newValue: string) => {
    setConfigs(prev =>
      prev.map(c => {
        if (c.id === "fuel") {
          return {
            ...c,
            value: newValue,
            calculatedHash: "",
            status: "unverified",
            isCorrupted: newValue !== "42",
          };
        }
        return c;
      })
    );
    writeLog(`Configuration value updated: FUEL_MIX = ${newValue}. Recalculation required.`);
  };

  const allVerified = configs.every(c => c.status === "verified");

  return (
    <div className="w-full h-full flex flex-col bg-[#020712] border border-white/8 rounded-2xl overflow-hidden font-mono select-none text-[10px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/8 bg-[#040816] shrink-0">
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5" style={{ color }} />
          <span className="text-[9px] uppercase tracking-widest font-bold text-white">
            SHA-256 ENGINE CALIBRATION TERMINAL
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[7.5px] text-slate-500 uppercase tracking-wider">ENGINE LOCK:</span>
          {allVerified ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <Unlock className="w-2.5 h-2.5" /> UNLOCKED
            </span>
          ) : (
            <span className="text-rose-400 font-bold flex items-center gap-1 animate-pulse">
              <Lock className="w-2.5 h-2.5" /> LOCKED
            </span>
          )}
        </div>
      </div>

      {/* Main Workspace Frame */}
      <div className="flex-1 overflow-hidden relative p-4 flex flex-col justify-between min-h-[420px]">
        <AnimatePresence mode="wait">
          
          {/* INTRO SCENE */}
          {gameState === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center gap-3 text-center"
            >
              <Cpu className="w-8 h-8 text-cyan-400 animate-spin" style={{ animationDuration: "3s" }} />
              <div>
                <p className="text-[10px] font-bold text-white uppercase tracking-widest">COSMOSX SECURE CORE BOOT</p>
                <p className="text-[7.5px] text-slate-500 mt-0.5">ESTABLISHING SHA-256 PRE-LAUNCH PARITY...</p>
              </div>
            </motion.div>
          )}

          {/* CALIBRATION WORKSPACE SCENE */}
          {gameState === "calibration" && (
            <motion.div
              key="calibration"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col gap-4 min-h-0"
            >
              {/* Top Split Workspace Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0 items-start">
                
                {/* COLUMN 1: Active configurations and values */}
                <div className="space-y-2">
                  <span className="text-[7.5px] text-slate-500 uppercase tracking-wider">
                    Active System Mappings
                  </span>
                  
                  <div className="grid gap-2">
                    {configs.map(item => {
                      const isSel = selectedConfigId === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            if (item.status !== "verified") {
                              setSelectedConfigId(item.id);
                              setSelectedHash(null);
                            }
                          }}
                          className={`border rounded-xl p-2.5 transition-all text-left flex justify-between items-center ${
                            item.status === "verified"
                              ? "border-emerald-500/25 bg-emerald-950/5 opacity-80 pointer-events-none"
                              : isSel
                              ? "border-cyan-400 bg-cyan-950/10 shadow-[0_0_8px_rgba(34,211,238,0.25)]"
                              : "border-white/5 bg-slate-950/40 hover:border-white/15 cursor-pointer"
                          }`}
                        >
                          <div>
                            <span className="text-[7px] text-slate-500 block">PARAMETER</span>
                            <span className="text-[9px] font-bold text-slate-200 block">{item.name}</span>
                            <span className="text-[8px] text-slate-400 block mt-0.5">
                              Value: <span className="text-white font-bold">{item.value}</span>
                            </span>
                          </div>

                          <div className="text-right">
                            {item.status === "verified" ? (
                              <span className="text-emerald-400 font-bold text-[8.5px] flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> VERIFIED
                              </span>
                            ) : item.status === "calculating" ? (
                              <span className="text-cyan-400 animate-pulse text-[8px]">COMPUTING...</span>
                            ) : item.status === "mismatch" ? (
                              <span className="text-rose-400 font-bold text-[8px] flex items-center gap-1 animate-pulse">
                                <AlertTriangle className="w-2.5 h-2.5" /> FAILED
                              </span>
                            ) : item.isCorrupted && item.calculatedHash ? (
                              <span className="text-rose-400 font-bold text-[8px] flex items-center gap-1">
                                <ShieldAlert className="w-2.5 h-2.5" /> ANOMALY
                              </span>
                            ) : (
                              <span className="text-slate-500 text-[8px]">UNVERIFIED</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* COLUMN 2: Trusted Hashes in DB */}
                <div className="space-y-2">
                  <span className="text-[7.5px] text-slate-500 uppercase tracking-wider">
                    Trusted Reference Hashes
                  </span>

                  <div className="grid gap-2">
                    {scrambledHashes.map((hash, idx) => {
                      const isUsed = configs.some(c => c.status === "verified" && c.expectedHash === hash);
                      const isSel = selectedHash === hash;
                      
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            if (!isUsed && selectedConfigId) {
                              setSelectedHash(hash);
                            }
                          }}
                          className={`border rounded-xl p-2.5 transition-all text-left flex items-center justify-between ${
                            isUsed
                              ? "border-emerald-500/10 bg-[#040816]/30 opacity-40 pointer-events-none"
                              : isSel
                              ? "border-cyan-400 bg-cyan-950/15"
                              : selectedConfigId
                              ? "border-white/5 bg-slate-950/40 hover:border-white/15 cursor-pointer"
                              : "border-white/5 bg-slate-950/20 opacity-55 pointer-events-none"
                          }`}
                        >
                          <div>
                            <span className="text-[6.5px] text-slate-500 block uppercase">Trusted Hash {idx + 1}</span>
                            <span className="text-[7.5px] font-mono text-slate-300 block select-all">
                              {hash.slice(0, 16)}...{hash.slice(-16)}
                            </span>
                          </div>

                          <div>
                            {isUsed ? (
                              <span className="text-emerald-500 text-[7px] font-bold">MATCHED</span>
                            ) : (
                              <span className="text-slate-600 text-[7px]">STANDBY</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Central Validator Core */}
              <div className="border border-white/8 bg-[#040816] rounded-xl p-3 relative overflow-hidden shrink-0 min-h-[145px] flex flex-col justify-between">
                
                {activeConfig ? (
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="grid grid-cols-2 gap-4 items-start">
                      {/* Left: Input details */}
                      <div>
                        <span className="text-[7px] text-slate-500 uppercase block">Selected Config Command</span>
                        <div className="bg-slate-950 px-2.5 py-1.5 rounded border border-white/5 inline-block text-[9.5px] font-bold text-cyan-300 mt-0.5">
                          {activeConfig.name}={activeConfig.value}
                        </div>

                        {/* If corrupted, render selection matrix */}
                        {activeConfig.id === "fuel" && activeConfig.isCorrupted && (
                          <div className="mt-2.5">
                            <span className="text-[7px] text-rose-400 font-bold block mb-1">
                              ⚠ ANOMALY: Expected hash not found. Calibrate value:
                            </span>
                            <div className="flex gap-1.5">
                              {["42", "47", "52"].map(val => (
                                <button
                                  key={val}
                                  onClick={() => handleRepairValue(val)}
                                  className={`px-2 py-1 rounded text-[7.5px] font-bold transition cursor-pointer border ${
                                    activeConfig.value === val
                                      ? "bg-amber-500/20 border-amber-400 text-amber-300"
                                      : "bg-slate-900 border-white/10 text-slate-400 hover:text-white"
                                  }`}
                                >
                                  {val}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Calculated vs Expected comparison */}
                      <div className="text-right">
                        {activeConfig.calculatedHash ? (
                          <div className="space-y-1">
                            <span className="text-[7px] text-slate-500 uppercase block">Calculated Hash</span>
                            <span className="text-[7.5px] font-mono text-cyan-300 block truncate">
                              {activeConfig.calculatedHash.slice(0, 16)}...
                            </span>
                            
                            {selectedHash ? (
                              <div className="mt-2.5">
                                <button
                                  onClick={handleVerifyLink}
                                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1 rounded text-[8px] tracking-wider uppercase transition cursor-pointer inline-flex items-center justify-center gap-1.5"
                                >
                                  <span>Run Verification Compare</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[7px] text-amber-400 block mt-2">
                                Select a trusted reference hash card to compare
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="pt-2">
                            <button
                              onClick={() => handleCalculateHash(activeConfig.id)}
                              disabled={activeConfig.status === "calculating"}
                              className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold px-4 py-1.5 rounded-lg text-[8.5px] tracking-wide uppercase transition cursor-pointer inline-flex items-center gap-1.5"
                            >
                              <RefreshCw className="w-3.5 h-3.5" /> Calculate SHA-256
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-[7px] text-slate-500 border-t border-white/5 pt-2 mt-2 flex justify-between items-center">
                      <span>VALIDATION MECHANISM: BINARY ENTR ENCRYPTION PARITY</span>
                      <span className="text-[7.5px] text-cyan-400 font-bold">CALIBRATOR IDLE</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <Database className="w-5 h-5 text-slate-600 mb-1" />
                    <p className="text-[8.5px] text-slate-400 font-bold uppercase">SHA-256 VALIDATOR PENDING</p>
                    <p className="text-[7.5px] text-slate-600 mt-0.5">Select an active system parameter card above to inspect</p>
                  </div>
                )}

              </div>
            </motion.div>
          )}

          {/* IGNITION CUTDOWN SCENE */}
          {gameState === "igniting" && (
            <motion.div
              key="igniting"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center gap-4 text-center"
            >
              <div className="w-16 h-16 rounded-full border border-red-500/30 flex items-center justify-center text-2xl font-bold text-red-500 bg-red-950/20 shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-pulse">
                {countdown}
              </div>
              <div>
                <p className="text-[9px] font-bold text-white uppercase tracking-widest">IGNITION COMMENCED</p>
                <p className="text-[7px] text-slate-500 mt-1">DISENGAGING HYDRAULIC LOCKS...</p>
              </div>
            </motion.div>
          )}

          {/* IGNITION ONLINE RESULTS */}
          {gameState === "online" && (
            <motion.div
              key="online"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col justify-between items-stretch gap-4"
            >
              <div className="border border-emerald-500/20 bg-emerald-950/15 rounded-xl p-4 text-center">
                <span className="text-[20px] block mb-1">🚀</span>
                <h3 className="text-sm font-bold text-emerald-400 tracking-wider">ROCKET ENGINE IGNITION ONLINE</h3>
                <p className="text-[8px] text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                  All system hashes match expected checksum values. Thrust parameters, stabilizers, and ignition delays are cryptographically verified.
                </p>
              </div>

              {/* Decrypted verification validation code badge to enter in sidebar inputs */}
              <div className="border border-white/8 bg-[#040816] rounded-xl p-3 text-center">
                <span className="text-[7px] text-slate-500 uppercase tracking-widest block mb-1">
                  Validated Calibration Sensor Results
                </span>
                <p className="text-[7.5px] text-slate-400 max-w-xs mx-auto mb-2.5">
                  Use the following verified values to complete the checkpoint validation challenge in the left panel:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="border border-white/5 bg-slate-950 p-2 rounded">
                    <span className="text-[6.5px] text-slate-500 block uppercase">Hash 1 (Match)</span>
                    <span className="text-[9px] font-bold text-emerald-300">Beta</span>
                  </div>
                  <div className="border border-white/5 bg-slate-950 p-2 rounded">
                    <span className="text-[6.5px] text-slate-500 block uppercase">Hash 2 (Match)</span>
                    <span className="text-[9px] font-bold text-emerald-300">Gamma</span>
                  </div>
                  <div className="border border-white/5 bg-slate-950 p-2 rounded">
                    <span className="text-[6.5px] text-slate-500 block uppercase">Hash 3 (Match)</span>
                    <span className="text-[9px] font-bold text-emerald-300">Alpha</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Live log & Ignition button container */}
        <div className="mt-4 shrink-0 flex flex-col sm:flex-row gap-3 items-stretch">
          
          {/* Console logger */}
          <div className="flex-1 bg-slate-950 border border-white/8 rounded-xl p-3 h-28 overflow-y-auto scrollbar-none font-mono text-[7px] text-slate-400 space-y-1">
            {log.map((line, idx) => (
              <div key={idx} className="truncate">
                {line}
              </div>
            ))}
          </div>

          {/* Ignition action trigger */}
          <div className="sm:w-44 flex flex-col justify-between gap-2 shrink-0">
            <div className="border border-white/5 bg-[#040816] rounded-xl p-2 flex justify-between items-center text-[7.5px]">
              <span className="text-slate-500">PROGRESS:</span>
              <span className="text-cyan-400 font-bold">
                {configs.filter(c => c.status === "verified").length} / 4 VERIFIED
              </span>
            </div>

            <button
              onClick={() => {
                if (allVerified) {
                  setGameState("igniting");
                  setCountdown(3);
                }
              }}
              disabled={!allVerified || gameState !== "calibration"}
              className={`w-full py-3 rounded-xl text-[9px] font-bold tracking-widest uppercase transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                allVerified && gameState === "calibration"
                  ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.35)]"
                  : "bg-slate-950 border-white/10 text-slate-600 cursor-not-allowed"
              }`}
            >
              <Unlock className="w-3.5 h-3.5" /> Initialize Engine
            </button>
          </div>

        </div>

      </div>

      {/* Footer */}
      <div className="px-4 py-1.5 border-t border-white/5 bg-slate-950/50 shrink-0 flex items-center justify-between text-[7px] text-slate-600">
        <span>MISSION STATUS: ACTIVE</span>
        <div className="flex items-center gap-1">
          <span className="font-bold">CORE PARITY CODE:</span>
          <span className="text-emerald-400 font-bold">BETA:GAMMA:ALPHA</span>
        </div>
      </div>
    </div>
  );
}

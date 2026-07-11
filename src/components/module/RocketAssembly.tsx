import { motion } from "framer-motion";

interface RocketAssemblyProps {
  completedModules: number[]; // Array of completed module IDs, e.g. [1]
}

export default function RocketAssembly({ completedModules }: RocketAssemblyProps) {
  // Check which rocket parts are unlocked based on module ticks
  const isPart1Unlocked = completedModules.includes(1); // Launch Pad Base
  const isPart2Unlocked = completedModules.includes(2); // Tail Fins
  const isPart3Unlocked = completedModules.includes(3); // Combustion Chamber
  const isPart4Unlocked = completedModules.includes(4); // Steam Turbopump
  const isPart5Unlocked = completedModules.includes(5); // LOX Tank
  const isPart6Unlocked = completedModules.includes(6); // Alcohol Tank
  const isPart7Unlocked = completedModules.includes(7); // Guidance Bay
  const isPart8Unlocked = completedModules.includes(8); // Nose Warhead

  const parts = [
    { id: 8, label: "WARHEAD NOSE", code: "M8", isUnlocked: isPart8Unlocked, textOk: "MOUNTED" },
    { id: 7, label: "GUIDANCE DECK", code: "M7", isUnlocked: isPart7Unlocked, textOk: "CALIBRATED" },
    { id: 6, label: "ALCOHOL FUEL", code: "M6", isUnlocked: isPart6Unlocked, textOk: "CHARGED" },
    { id: 5, label: "LOX FUEL TANK", code: "M5", isUnlocked: isPart5Unlocked, textOk: "CHARGED" },
    { id: 4, label: "STEAM TURBOPUMP", code: "M4", isUnlocked: isPart4Unlocked, textOk: "CALIBRATED" },
    { id: 3, label: "COMBUSTION CHAMBER", code: "M3", isUnlocked: isPart3Unlocked, textOk: "SECURED" },
    { id: 2, label: "STABILIZER FINS", code: "M2", isUnlocked: isPart2Unlocked, textOk: "MOUNTED" },
    { id: 1, label: "LAUNCH PLATFORM", code: "M1", isUnlocked: isPart1Unlocked, textOk: "ANCHORED" },
  ];

  return (
    <div className="flex flex-col items-center justify-between h-full bg-[#030706] border border-white/10 rounded-2xl p-3.5 shadow-2xl relative overflow-hidden">
      {/* Blueprint grid background */}
      <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_center,#22d3ee_1px,transparent_1px)] bg-size-[16px_16px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-size-[20px_20px] pointer-events-none" />

      <div className="w-full text-center mb-1.5 relative z-10 border-b border-white/5 pb-1.5">
        <h3 className="font-rushblade text-xs text-cyan-400 tracking-wider">A-4 / V-2 VERIFICATION</h3>
        <p className="text-[9px] text-muted-foreground mt-0.5 font-mono">WWII GERMAN BOOSTER INTEGRITY STATUS</p>
      </div>

      {/* Realistic Checkered V-2 Rocket Schematic */}
      <div className="flex-1 flex items-center justify-center w-full min-h-0 relative z-10 py-1">
        <svg className="w-auto h-full max-h-[295px] lg:max-h-[310px] min-h-[190px]" viewBox="0 0 120 260" fill="none">
          {/* Alignment grid line */}
          <line x1="60" y1="5" x2="60" y2="245" stroke="rgba(34, 211, 238, 0.12)" strokeWidth="0.5" strokeDasharray="3 3" />

          {/* PART 8: NOSE WARHEAD (Unlocks with Module 8) */}
          <g>
            <path
              d="M 60,15 C 60,15 48,35 48,60 L 72,60 C 72,35 60,15 60,15 Z"
              stroke={isPart8Unlocked ? "#22d3ee" : "rgba(255,255,255,0.15)"}
              strokeWidth="1"
              strokeDasharray={isPart8Unlocked ? "" : "2 2"}
              fill="transparent"
              className="transition-all duration-500"
            />
            {isPart8Unlocked && (
              <motion.g initial={{ y: -15, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <path d="M 60,15 C 60,15 48,35 48,60 L 60,60 Z" fill="#1f2937" stroke="#1f2937" strokeWidth="0.5" />
                <path d="M 60,15 C 60,15 72,35 72,60 L 60,60 Z" fill="#fafafa" stroke="#e5e7eb" strokeWidth="0.5" />
              </motion.g>
            )}
          </g>

          {/* PART 7: GYROSCOPIC GUIDANCE BAY (Unlocks with Module 7) */}
          <g>
            <rect
              x="48"
              y="60"
              width="24"
              height="15"
              stroke={isPart7Unlocked ? "#22d3ee" : "rgba(255,255,255,0.15)"}
              strokeWidth="1"
              strokeDasharray={isPart7Unlocked ? "" : "2 2"}
              fill="transparent"
              className="transition-all duration-500"
            />
            {isPart7Unlocked && (
              <motion.g initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}>
                <rect x="48" y="60" width="12" height="15" fill="#fafafa" stroke="#e5e7eb" strokeWidth="0.5" />
                <rect x="60" y="60" width="12" height="15" fill="#1f2937" stroke="#1f2937" strokeWidth="0.5" />
                <circle cx="54" cy="67.5" r="2" fill="#fbbf24" />
              </motion.g>
            )}
          </g>

          {/* PART 6: ALCOHOL FUEL TANK (Unlocks with Module 6) */}
          <g>
            <rect
              x="48"
              y="75"
              width="24"
              height="38"
              stroke={isPart6Unlocked ? "#22d3ee" : "rgba(255,255,255,0.15)"}
              strokeWidth="1"
              strokeDasharray={isPart6Unlocked ? "" : "2 2"}
              fill="transparent"
              className="transition-all duration-500"
            />
            {isPart6Unlocked && (
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <rect x="48" y="75" width="12" height="38" fill="#1f2937" stroke="#1f2937" strokeWidth="0.5" />
                <rect x="60" y="75" width="12" height="38" fill="#fafafa" stroke="#e5e7eb" strokeWidth="0.5" />
                <line x1="54" y1="80" x2="54" y2="108" stroke="#3b82f6" strokeWidth="1" opacity="0.6" />
                <text x="60" y="96" textAnchor="middle" fill="#60a5fa" fontSize="5" fontFamily="monospace">ALC</text>
              </motion.g>
            )}
          </g>

          {/* PART 5: LIQUID OXYGEN (LOX) TANK (Unlocks with Module 5) */}
          <g>
            <rect
              x="48"
              y="113"
              width="24"
              height="38"
              stroke={isPart5Unlocked ? "#22d3ee" : "rgba(255,255,255,0.15)"}
              strokeWidth="1"
              strokeDasharray={isPart5Unlocked ? "" : "2 2"}
              fill="transparent"
              className="transition-all duration-500"
            />
            {isPart5Unlocked && (
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <rect x="48" y="113" width="12" height="38" fill="#fafafa" stroke="#e5e7eb" strokeWidth="0.5" />
                <rect x="60" y="113" width="12" height="38" fill="#1f2937" stroke="#1f2937" strokeWidth="0.5" />
                <line x1="66" y1="118" x2="66" y2="146" stroke="#22d3ee" strokeWidth="1" opacity="0.6" />
                <text x="60" y="134" textAnchor="middle" fill="#22d3ee" fontSize="5" fontFamily="monospace">LOX</text>
              </motion.g>
            )}
          </g>

          {/* PART 4: STEAM TURBOPUMP UNIT (Unlocks with Module 4) */}
          <g>
            <rect
              x="48"
              y="151"
              width="24"
              height="15"
              stroke={isPart4Unlocked ? "#22d3ee" : "rgba(255,255,255,0.15)"}
              strokeWidth="1"
              strokeDasharray={isPart4Unlocked ? "" : "2 2"}
              fill="transparent"
              className="transition-all duration-500"
            />
            {isPart4Unlocked && (
              <motion.g initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}>
                <rect x="48" y="151" width="12" height="15" fill="#1f2937" stroke="#1f2937" strokeWidth="0.5" />
                <rect x="60" y="151" width="12" height="15" fill="#fafafa" stroke="#e5e7eb" strokeWidth="0.5" />
                <circle cx="60" cy="158.5" r="2.5" fill="#94a3b8" />
              </motion.g>
            )}
          </g>

          {/* PART 3: COMBUSTION CHAMBER & RUDDER CONTROLS (Unlocks with Module 3) */}
          <g>
            <path
              d="M 48,166 L 52,196 L 68,196 L 72,166 Z"
              stroke={isPart3Unlocked ? "#22d3ee" : "rgba(255,255,255,0.15)"}
              strokeWidth="1"
              strokeDasharray={isPart3Unlocked ? "" : "2 2"}
              fill="transparent"
              className="transition-all duration-500"
            />
            {isPart3Unlocked && (
              <motion.g initial={{ y: 10 }} animate={{ y: 0 }}>
                <path d="M 48,166 L 52,196 L 60,196 L 60,166 Z" fill="#fafafa" stroke="#e5e7eb" strokeWidth="0.5" />
                <path d="M 60,166 L 60,196 L 68,196 L 72,166 Z" fill="#1f2937" stroke="#1f2937" strokeWidth="0.5" />
                <path d="M 55,173 Q 60,185 55,193 L 65,193 Q 60,185 65,173 Z" fill="#fb7185" opacity="0.3" />
              </motion.g>
            )}
          </g>

          {/* PART 2: AERODYNAMIC TAIL FINS (Unlocks with Module 2) */}
          <g>
            <path
              d="M 48,166 L 24,208 L 24,220 L 42,220 L 52,196 Z"
              stroke={isPart2Unlocked ? "#22d3ee" : "rgba(255,255,255,0.15)"}
              strokeWidth="1"
              strokeDasharray={isPart2Unlocked ? "" : "2 2"}
              className="transition-all duration-500"
            />
            <path
              d="M 72,166 L 96,208 L 96,220 L 78,220 L 68,196 Z"
              stroke={isPart2Unlocked ? "#22d3ee" : "rgba(255,255,255,0.15)"}
              strokeWidth="1"
              strokeDasharray={isPart2Unlocked ? "" : "2 2"}
              className="transition-all duration-500"
            />
            {isPart2Unlocked && (
              <motion.g initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <path d="M 48,166 L 24,208 L 24,220 L 42,220 L 52,196 Z" fill="#1f2937" stroke="#1f2937" strokeWidth="0.5" />
                <path d="M 72,166 L 96,208 L 96,220 L 78,220 L 68,196 Z" fill="#fafafa" stroke="#e5e7eb" strokeWidth="0.5" />
              </motion.g>
            )}
          </g>

          {/* PART 1: LAUNCH PLATFORM BASE (Unlocks with Module 1) */}
          <g>
            <path
              d="M 12,225 L 108,225 L 98,245 L 22,245 Z"
              stroke={isPart1Unlocked ? "#22d3ee" : "rgba(255,255,255,0.12)"}
              strokeWidth="1"
              strokeDasharray={isPart1Unlocked ? "" : "2 2"}
              fill={isPart1Unlocked ? "rgba(34,211,238,0.1)" : "transparent"}
              className="transition-all duration-500"
            />
            {isPart1Unlocked && (
              <motion.g initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}>
                <path d="M 12,225 L 108,225 L 98,245 L 22,245 Z" fill="#334155" stroke="#475569" strokeWidth="1" />
                <rect x="42" y="210" width="3" height="15" fill="#475569" />
                <rect x="75" y="210" width="3" height="15" fill="#475569" />
              </motion.g>
            )}
          </g>
        </svg>

        {/* Engine flame when launch completed */}
        {completedModules.length === 8 && (
          <motion.div
            className="absolute bottom-[35px] left-1/2 -translate-x-1/2 w-5 h-20 bg-linear-to-t from-transparent via-red-500 to-amber-300 rounded-full blur-[2px]"
            animate={{ height: [60, 85, 60], opacity: [0.75, 1, 0.75] }}
            transition={{ duration: 0.1, repeat: Infinity }}
          />
        )}
      </div>

      {/* 2-Column Assembly status report for zero scrolling and laptop viewport compatibility */}
      <div className="w-full font-mono text-[8.5px] grid grid-cols-2 gap-x-2.5 gap-y-2 mt-2.5 border-t border-white/10 pt-3 relative z-10 select-none">
        {parts.map((p) => {
          const isCompleted = p.isUnlocked;
          return (
            <div
              key={p.id}
              className={`relative flex justify-between items-center pl-3 pr-2 py-1.5 rounded transition-all duration-300 ${
                isCompleted
                  ? "bg-[#050c07]/90 border-[#5CFF8A]/30 shadow-[0_0_10px_rgba(92,255,138,0.06)] text-slate-100 font-semibold"
                  : "bg-slate-950/70 border-white/5 text-slate-500"
              } border`}
            >
              {/* Thin Fluorescent Green Edge Strip */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-[2.5px] rounded-l transition-all duration-500 ${
                  isCompleted
                    ? "bg-[#5CFF8A] energy-strip-active shadow-[0_0_6px_rgba(92,255,138,0.4)]"
                    : "bg-[#5CFF8A]/15"
                }`}
              />

              <span className="truncate max-w-[70px] uppercase tracking-wider text-[8px]" title={p.label}>
                {p.label.split(" ")[0]} [{p.code}]
              </span>

              <span
                className={`font-bold text-[7.5px] shrink-0 ml-1 flex items-center gap-0.5 ${
                  isCompleted ? "text-[#5CFF8A]" : "text-slate-600"
                }`}
              >
                {isCompleted ? (
                  <>
                    <span>✓</span>
                    <span>{p.textOk.slice(0, 3)}</span>
                  </>
                ) : (
                  <>
                    <span>✗</span>
                    <span>STBY</span>
                  </>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

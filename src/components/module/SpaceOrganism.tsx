import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface SpaceOrganismProps {
  isNodding?: boolean;
  onNodComplete?: () => void;
}

export default function SpaceOrganism({ isNodding, onNodComplete }: SpaceOrganismProps) {
  const [blink, setBlink] = useState(false);

  // Periodic blinking effect
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center p-2">
      {/* Glass Bubble Container */}
      <div className="relative w-24 h-24 rounded-full border border-white/20 bg-white/5 backdrop-blur-md shadow-[0_0_25px_rgba(255,255,255,0.05),inset_0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center overflow-hidden">
        {/* Glass reflection highlight */}
        <div className="absolute top-1 left-4 w-12 h-6 bg-linear-to-b from-white/25 to-transparent rounded-full rotate-[-15deg] pointer-events-none" />
        
        {/* Floating Space Organism */}
        <motion.div
          className="relative w-16 h-16 flex items-center justify-center"
          animate={
            isNodding
              ? {
                  y: [0, 8, -4, 2, 0],
                  scaleY: [1, 0.85, 1.05, 0.95, 1],
                }
              : {
                  y: [0, -4, 0],
                }
          }
          transition={
            isNodding
              ? { duration: 0.8, ease: "easeInOut" }
              : { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }
          onAnimationComplete={() => {
            if (isNodding && onNodComplete) {
              onNodComplete();
            }
          }}
        >
          {/* Organism Core: Bioluminescent structure */}
          <div className="absolute w-10 h-10 rounded-full bg-cyan-500/20 blur-md animate-pulse" />
          
          {/* Inner bioluminescent details mimicking the petri-dish style */}
          <svg className="w-12 h-12 relative z-10" viewBox="0 0 100 100">
            {/* Center organism body */}
            <motion.path
              d="M 50,30 Q 70,35 70,50 Q 70,65 50,70 Q 30,65 30,50 Q 30,35 50,30 Z"
              fill="url(#organismGrad)"
              animate={{
                d: [
                  "M 50,28 Q 72,35 72,50 Q 72,65 50,72 Q 28,65 28,50 Q 28,35 50,28 Z",
                  "M 50,32 Q 68,37 68,50 Q 68,63 50,68 Q 32,63 32,50 Q 32,37 50,32 Z",
                  "M 50,28 Q 72,35 72,50 Q 72,65 50,72 Q 28,65 28,50 Q 28,35 50,28 Z",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Glowing neon vesicles/particles inside */}
            <circle cx="50" cy="50" r="14" fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="4 8" className="animate-[spin_10s_linear_infinite]" />
            <circle cx="45" cy="42" r="4" fill="#fbbf24" className="shadow-[0_0_8px_#fbbf24]" />
            <circle cx="58" cy="48" r="3" fill="#f43f5e" className="shadow-[0_0_8px_#f43f5e]" />
            <circle cx="48" cy="58" r="4" fill="#10b981" className="shadow-[0_0_8px_#10b981]" />
            <circle cx="38" cy="50" r="2.5" fill="#f97316" className="shadow-[0_0_6px_#f97316]" />
            
            {/* Eyes (which can blink) */}
            <g>
              <ellipse cx="44" cy="48" rx="3" ry={blink ? "0.5" : "4"} fill="#ffffff" />
              <ellipse cx="56" cy="48" rx="3" ry={blink ? "0.5" : "4"} fill="#ffffff" />
              {!blink && (
                <>
                  <circle cx="44" cy="48" r="1.5" fill="#000" />
                  <circle cx="56" cy="48" r="1.5" fill="#000" />
                </>
              )}
            </g>

            {/* Glowing outer rings/tendrils */}
            <motion.path
              d="M 30,50 Q 20,48 16,55"
              fill="none"
              stroke="#ec4899"
              strokeWidth="2"
              strokeLinecap="round"
              animate={{ d: ["M 30,50 Q 20,48 16,55", "M 30,50 Q 18,52 14,48", "M 30,50 Q 20,48 16,55"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.path
              d="M 70,50 Q 80,52 84,45"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2"
              strokeLinecap="round"
              animate={{ d: ["M 70,50 Q 80,52 84,45", "M 70,50 Q 82,48 86,52", "M 70,50 Q 80,52 84,45"] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Gradient Definitions */}
            <defs>
              <radialGradient id="organismGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
              </radialGradient>
            </defs>
          </svg>
        </motion.div>
        
        {/* Soft bottom glow */}
        <div className="absolute bottom-0 w-full h-4 bg-linear-to-t from-cyan-500/10 to-transparent blur-sm pointer-events-none" />
      </div>
      <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-cyan-400/80 animate-pulse">
        Companion Bot
      </div>
    </div>
  );
}

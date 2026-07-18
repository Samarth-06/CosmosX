import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, FastForward, CheckCircle2, ShieldAlert, Cpu, ArrowRight } from "lucide-react";
import { useRouter } from "@tanstack/react-router";

interface Props {
  targetPlanet: string;
  onComplete: () => void;
}

export default function PlanetTransition({ targetPlanet, onComplete }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<"checklist" | "launching" | "orbit" | "cruise" | "entry" | "landing" | "success">("checklist");
  const [countdown, setCountdown] = useState(3);
  const [checks, setChecks] = useState({ fuel: false, nav: false, engine: false, traj: false });
  const [progress, setProgress] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Web Audio Context Synthesizer for Space Ambience and Launch Rumble
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rumbleNodeRef = useRef<OscillatorNode | null>(null);
  const rumbleGainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    // Start synthesized spacecraft ambient hum
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(60, ctx.currentTime); // 60Hz hum

      // Lowpass filter to keep it deep and soft
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(100, ctx.currentTime);

      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      rumbleNodeRef.current = osc;
      rumbleGainRef.current = gain;
    } catch (e) {
      console.warn("Synth failed in PlanetTransition:", e);
    }

    return () => {
      stopAudio();
    };
  }, []);

  const stopAudio = () => {
    if (rumbleNodeRef.current) {
      try { rumbleNodeRef.current.stop(); } catch (e) {}
      rumbleNodeRef.current = null;
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch (e) {}
      audioCtxRef.current = null;
    }
  };

  const playSFX = (type: "beep" | "launch" | "warp" | "achievement") => {
    if (!audioEnabled || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      if (type === "beep") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === "launch") {
        // Boost gain for liftoff rumble
        if (rumbleGainRef.current) {
          rumbleGainRef.current.gain.setValueAtTime(0.03, ctx.currentTime);
          rumbleGainRef.current.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1.0);
        }
        if (rumbleNodeRef.current) {
          rumbleNodeRef.current.frequency.linearRampToValueAtTime(80, ctx.currentTime + 1.5);
        }
      } else if (type === "warp") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(100, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 4.0);
        gain.gain.setValueAtTime(0.005, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 2.0);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4.0);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 4.0);
      } else if (type === "achievement") {
        const notes = [261.63, 329.63, 392.00, 523.25]; // C major chord sweep
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
          gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.15);
          osc.stop(ctx.currentTime + i * 0.15 + 0.4);
        });
      }
    } catch (e) {}
  };

  // Phase logic scheduler
  useEffect(() => {
    // 1. Checklist sequence
    const t1 = setTimeout(() => setChecks(c => ({ ...c, fuel: true })), 600);
    const t2 = setTimeout(() => setChecks(c => ({ ...c, nav: true })), 1200);
    const t3 = setTimeout(() => setChecks(c => ({ ...c, engine: true })), 1800);
    const t4 = setTimeout(() => {
      setChecks(c => ({ ...c, traj: true }));
      playSFX("beep");
    }, 2400);

    // 2. Start Countdown
    const t5 = setTimeout(() => {
      setPhase("launching");
      playSFX("launch");
    }, 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []);

  // Launch countdown tick
  useEffect(() => {
    if (phase !== "launching") return;
    if (countdown <= 0) {
      // Transition to space orbit exit
      const timer = setTimeout(() => {
        setPhase("orbit");
      }, 1500);
      return () => clearTimeout(timer);
    }
    const tick = setTimeout(() => {
      setCountdown(c => c - 1);
      playSFX("beep");
    }, 1000);
    return () => clearTimeout(tick);
  }, [phase, countdown]);

  // Orbit Exit -> Cruise
  useEffect(() => {
    if (phase !== "orbit") return;
    const timer = setTimeout(() => {
      setPhase("cruise");
      playSFX("warp");
    }, 3000);
    return () => clearTimeout(timer);
  }, [phase]);

  // Cruise progression
  useEffect(() => {
    if (phase !== "cruise") return;
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setPhase("entry");
          return 100;
        }
        return p + 4;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [phase]);

  // Entry -> Landing
  useEffect(() => {
    if (phase !== "entry") return;
    const timer = setTimeout(() => {
      setPhase("landing");
    }, 2500);
    return () => clearTimeout(timer);
  }, [phase]);

  // Landing -> Success
  useEffect(() => {
    if (phase !== "landing") return;
    const timer = setTimeout(() => {
      setPhase("success");
      playSFX("achievement");
    }, 3500);
    return () => clearTimeout(timer);
  }, [phase]);

  const handleBeginVenus = () => {
    stopAudio();
    onComplete();
    // Navigate straight to Venus Academy!
    router.navigate({ to: "/planets/$planet", params: { planet: "venus" } });
  };

  const handleSkip = () => {
    stopAudio();
    onComplete();
    router.navigate({ to: "/planets/$planet", params: { planet: "venus" } });
  };

  // Reusable V-2 blueprint drawing helper (exact drawing path matching RocketAssembly.tsx)
  const renderV2Rocket = (height = "240px") => (
    <svg className="w-auto h-full" style={{ maxHeight: height }} viewBox="0 0 120 260" fill="none">
      <defs>
        <filter id="glow-cyan" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-orange" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="glow-orange-plasma" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#f97316" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="glow-yellow-fire" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#facc15" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#f97316" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Engine Flame (Active during launch, orbit, and landing phases) */}
      {(phase === "launching" || phase === "orbit" || phase === "cruise" || phase === "landing") && (
        <g className="pointer-events-none">
          <motion.path
            d="M 52,196 Q 28,225 60,250 Q 92,225 68,196 Z"
            fill="url(#glow-orange-plasma)"
            filter="url(#glow-orange)"
            opacity="0.85"
            animate={{
              d: [
                "M 52,196 Q 28,225 60,250 Q 92,225 68,196 Z",
                "M 52,196 Q 24,228 60,254 Q 96,228 68,196 Z",
                "M 52,196 Q 32,222 60,246 Q 88,222 68,196 Z",
                "M 52,196 Q 28,225 60,250 Q 92,225 68,196 Z"
              ]
            }}
            transition={{ duration: 0.12, repeat: Infinity }}
          />
          <motion.path
            d="M 54,196 Q 38,222 60,242 Q 82,222 66,196 Z"
            fill="url(#glow-yellow-fire)"
            filter="url(#glow-orange)"
            opacity="0.95"
            animate={{
              d: [
                "M 54,196 Q 38,222 60,242 Q 82,222 66,196 Z",
                "M 54,196 Q 34,225 60,246 Q 86,225 66,196 Z",
                "M 54,196 Q 42,219 60,238 Q 78,219 66,196 Z",
                "M 54,196 Q 38,222 60,242 Q 82,222 66,196 Z"
              ]
            }}
            transition={{ duration: 0.08, repeat: Infinity }}
          />
        </g>
      )}

      {/* Nose Cone */}
      <path d="M 60,15 C 60,15 48,35 48,60 L 72,60 C 72,35 60,15 60,15 Z" fill="#1f2937" stroke="#e5e7eb" strokeWidth="0.5" />
      
      {/* Guidance Section */}
      <rect x="48" y="60" width="12" height="15" fill="#fafafa" stroke="#e5e7eb" strokeWidth="0.5" />
      <rect x="60" y="60" width="12" height="15" fill="#1f2937" stroke="#1f2937" strokeWidth="0.5" />
      <circle cx="54" cy="67.5" r="2.5" fill="#fbbf24" className="animate-pulse" />

      {/* Alcohol Tank */}
      <rect x="48" y="75" width="12" height="38" fill="#1f2937" stroke="#1f2937" strokeWidth="0.5" />
      <rect x="60" y="75" width="12" height="38" fill="#fafafa" stroke="#e5e7eb" strokeWidth="0.5" />
      <line x1="54" y1="80" x2="54" y2="108" stroke="#3b82f6" strokeWidth="1.2" filter="url(#glow-cyan)" />
      
      {/* LOX Tank */}
      <rect x="48" y="113" width="12" height="38" fill="#fafafa" stroke="#e5e7eb" strokeWidth="0.5" />
      <rect x="60" y="113" width="12" height="38" fill="#1f2937" stroke="#1f2937" strokeWidth="0.5" />
      <line x1="66" y1="118" x2="66" y2="146" stroke="#22d3ee" strokeWidth="1.2" filter="url(#glow-cyan)" />

      {/* Turbopump */}
      <rect x="48" y="151" width="12" height="15" fill="#1f2937" stroke="#1f2937" strokeWidth="0.5" />
      <rect x="60" y="151" width="12" height="15" fill="#fafafa" stroke="#e5e7eb" strokeWidth="0.5" />
      <circle cx="60" cy="158.5" r="2.5" fill="#a5f3fc" filter="url(#glow-cyan)" />

      {/* Combustion Chamber */}
      <path d="M 48,166 L 52,196 L 60,196 L 60,166 Z" fill="#fafafa" stroke="#e5e7eb" strokeWidth="0.5" />
      <path d="M 60,166 L 60,196 L 68,196 L 72,166 Z" fill="#1f2937" stroke="#1f2937" strokeWidth="0.5" />

      {/* Tail Fins */}
      <path d="M 48,166 L 24,208 L 24,220 L 42,220 L 52,196 Z" fill="#1f2937" stroke="#1f2937" strokeWidth="0.5" />
      <path d="M 72,166 L 96,208 L 96,220 L 78,220 L 68,196 Z" fill="#fafafa" stroke="#e5e7eb" strokeWidth="0.5" />
    </svg>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#030611] overflow-hidden pointer-events-auto select-none"
    >
      {/* Background stardust stars (cruising parallax speed) */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="relative w-full h-full flex flex-col items-center justify-center p-6">
        <AnimatePresence mode="wait">
          
          {/* PHASE 1: PRE-LAUNCH CHECKLIST */}
          {phase === "checklist" && (
            <motion.div
              key="checklist"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.05, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
            >
              {/* Left Details */}
              <div className="space-y-5 text-left border-r border-white/10 pr-8">
                <div>
                  <span className="font-mono text-[9px] text-cyan-400 font-bold uppercase tracking-widest">
                    COSMOSX FLIGHT CONTROL
                  </span>
                  <h1 className="font-rushblade text-2xl text-white tracking-wider uppercase mt-1">
                    MERCURY MISSION COMPLETED
                  </h1>
                </div>

                <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 font-mono text-[10px] space-y-3 leading-relaxed text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>FUEL PROPELLANT (ALC + LOX):</span>
                    <span className={checks.fuel ? "text-cyan-400 font-bold animate-pulse" : "text-slate-600"}>
                      {checks.fuel ? "[✓] CHARGED" : "[ ] PREPARING..."}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>VENUS TRAJECTORY LOCK:</span>
                    <span className={checks.nav ? "text-cyan-400 font-bold animate-pulse" : "text-slate-600"}>
                      {checks.nav ? "[✓] LOCKED" : "[ ] PREPARING..."}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>COMBUSTION INJECTORS STATUS:</span>
                    <span className={checks.engine ? "text-cyan-400 font-bold animate-pulse" : "text-slate-600"}>
                      {checks.engine ? "[✓] OPTIMAL" : "[ ] PREPARING..."}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>GYROSCOPIC TELEMETRY LINK:</span>
                    <span className={checks.traj ? "text-cyan-400 font-bold animate-pulse" : "text-slate-600"}>
                      {checks.traj ? "[✓] ONLINE" : "[ ] PREPARING..."}
                    </span>
                  </div>
                </div>

                {checks.traj && (
                  <div className="text-[10px] text-emerald-400 font-mono font-bold animate-pulse uppercase tracking-wider bg-emerald-950/20 border border-emerald-500/20 p-2.5 rounded-lg text-center">
                    All telemetry checks completed. Igniting V-2 engine cores.
                  </div>
                )}
              </div>

              {/* Right Rocket Showcase */}
              <div className="flex justify-center bg-slate-950/50 border border-white/5 rounded-2xl p-6 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.06)_0%,transparent_60%)]" />
                {renderV2Rocket("300px")}
              </div>
            </motion.div>
          )}

          {/* PHASE 2: LAUNCHING COUNTDOWN & ENGINE IGNITION */}
          {phase === "launching" && (
            <motion.div
              key="launching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center space-y-6"
            >
              <div className="font-mono text-[9px] text-red-500 font-bold tracking-widest uppercase">
                LAUNCH DETONATION PROTOCOL ACTIVE
              </div>

              {/* Shaking Blueprint card */}
              <motion.div
                animate={{
                  x: [0, -2, 2, -1, 1, 0],
                  y: [0, 2, -2, 1, -1, 0],
                }}
                transition={{ duration: 0.15, repeat: Infinity }}
                className="bg-slate-950/60 border border-red-500/20 rounded-2xl p-8 shadow-[0_0_30px_rgba(239,68,68,0.1)] relative overflow-hidden"
              >
                {/* Rocket sliding UP out of base */}
                <motion.div
                  animate={{ y: countdown === 0 ? -450 : 0 }}
                  transition={{ duration: 1.4, ease: "easeIn" }}
                >
                  {renderV2Rocket("280px")}
                </motion.div>

                {/* Particle smoke puffs from bottom */}
                {countdown === 0 && (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0], scale: [1, 1.8, 2.5] }}
                    transition={{ duration: 1.0, repeat: Infinity }}
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-16 bg-white/20 rounded-full blur-md"
                  />
                )}
              </motion.div>

              <h2 className="font-rushblade text-4xl text-red-500 tracking-wider">
                {countdown > 0 ? countdown : "LIFTOFF"}
              </h2>
            </motion.div>
          )}

          {/* PHASE 3: ORBIT EXIT */}
          {phase === "orbit" && (
            <motion.div
              key="orbit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col items-center justify-center relative"
            >
              {/* Shrinking Mercury sphere */}
              <motion.div
                initial={{ scale: 1.2, y: 150, opacity: 0.8 }}
                animate={{ scale: 0.25, y: 250, opacity: 0.2 }}
                transition={{ duration: 3.0, ease: "easeOut" }}
                className="absolute w-72 h-72 rounded-full bg-gradient-to-br from-orange-400 via-amber-700 to-slate-950 shadow-[0_0_80px_rgba(249,115,22,0.4)]"
              />

              {/* Rocket flying UP into deep space */}
              <motion.div
                initial={{ y: 200, scale: 0.9 }}
                animate={{ y: -250, scale: 0.7 }}
                transition={{ duration: 3.0, ease: "easeInOut" }}
                className="z-10"
              >
                {renderV2Rocket("150px")}
              </motion.div>

              <div className="absolute top-20 font-mono text-[10px] text-slate-400 tracking-widest text-center uppercase">
                <span className="text-cyan-400 font-bold block mb-1">DEPARTING MERCURY GRAVITY</span>
                VELOCITY: 11.2 KM/S · ESCAPING ATMOSPHERE
              </div>
            </motion.div>
          )}

          {/* PHASE 4: DEEP SPACE CRUISE ROUTE */}
          {phase === "cruise" && (
            <motion.div
              key="cruise"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-3xl flex flex-col items-center space-y-8"
            >
              <div className="text-center font-mono text-[9px] text-slate-400 uppercase tracking-widest">
                <span className="text-cyan-400 font-bold block mb-1">INTERPLANETARY TRANSFER UNDERWAY</span>
                COSMIC SECTOR 01 ➔ SECTOR 02
              </div>

              {/* Visual trajectory map */}
              <div className="w-full h-44 bg-slate-950/60 border border-white/5 rounded-2xl relative flex items-center justify-between px-16 overflow-hidden">
                
                {/* Parallax stars passing left */}
                <motion.div
                  animate={{ x: [0, -120] }}
                  transition={{ duration: 1.0, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-[radial-gradient(circle_at_center,white_0.5px,transparent_0.5px)] bg-[size:30px_30px] opacity-15"
                />

                {/* Mercury Node */}
                <div className="flex flex-col items-center space-y-1 relative z-10">
                  <div className="w-6 h-6 rounded-full bg-orange-600 border border-orange-400/30 shadow-[0_0_15px_rgba(249,115,22,0.4)]" />
                  <span className="font-mono text-[8px] text-slate-500 font-bold">MERCURY</span>
                </div>

                {/* Travel Rocket slider along curve */}
                <div className="flex-1 h-px bg-dashed border-t border-cyan-500/20 relative mx-4">
                  <motion.div
                    style={{ left: `${progress}%` }}
                    className="absolute -top-6 -translate-x-1/2 -rotate-90 scale-75"
                  >
                    {renderV2Rocket("60px")}
                  </motion.div>
                </div>

                {/* Venus Node */}
                <div className="flex flex-col items-center space-y-1 relative z-10">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 via-amber-600 to-amber-900 border border-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                  />
                  <span className="font-mono text-[8px] text-slate-300 font-bold">VENUS</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-md space-y-1.5">
                <div className="flex justify-between font-mono text-[8px] text-slate-500">
                  <span>TRAJECTORY LOCKED</span>
                  <span>PROGRESS: {progress}%</span>
                </div>
                <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                  <div style={{ width: `${progress}%` }} className="h-full bg-cyan-400" />
                </div>
              </div>
            </motion.div>
          )}

          {/* PHASE 5: ATMOSPHERIC ENTRY (VENUS) */}
          {phase === "entry" && (
            <motion.div
              key="entry"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col items-center justify-center relative"
            >
              {/* Swirling thick Venusian atmosphere backdrop */}
              <div className="absolute inset-0 bg-radial-gradient(circle_at_center, #d97706_0%, #030611_80%) opacity-30 blur-2xl" />

              {/* Red-hot entry friction envelope ring */}
              <motion.div
                animate={{
                  x: [0, -3, 3, -1, 1, 0],
                  y: [0, 2, -2, 1, -1, 0],
                }}
                transition={{ duration: 0.1, repeat: Infinity }}
                className="relative"
              >
                {/* Thermal friction glow wrap */}
                <div className="absolute -inset-4 bg-orange-600/30 rounded-full filter blur-md animate-pulse" />
                {renderV2Rocket("180px")}
              </motion.div>

              <div className="absolute bottom-24 font-mono text-[9px] text-orange-500 font-bold uppercase tracking-widest text-center animate-pulse">
                🚨 ATMOSPHERIC THERMAL LOAD PEAK · DESCENT COMMENCING
              </div>
            </motion.div>
          )}

          {/* PHASE 6: VENUS SURFACE LANDING DESCENT */}
          {phase === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col items-center justify-between py-12 relative"
            >
              <div className="font-mono text-[9px] text-slate-400 tracking-widest uppercase text-center">
                <span className="text-cyan-400 font-bold block mb-1">TOUCHDOWN PROTOCOL ENGAGED</span>
                DESCENT RATE: -15 M/S · RETRO-RUDDERS ACTIVE
              </div>

              {/* Downward descending V-2 rocket */}
              <motion.div
                initial={{ y: -200, scale: 0.8 }}
                animate={{ y: 80, scale: 1.0 }}
                transition={{ duration: 3.5, ease: "easeOut" }}
                className="relative z-10"
              >
                {renderV2Rocket("160px")}
              </motion.div>

              {/* Venus surface docking pad representation */}
              <div className="w-56 h-3 bg-slate-900 border-t-2 border-dashed border-amber-500/40 relative">
                <div className="absolute inset-0 bg-amber-500/5 filter blur-xs" />
              </div>
            </motion.div>
          )}

          {/* PHASE 7: VENUS ARRIVED SUCCESS DOCKING */}
          {phase === "success" && (
            <motion.div
              key="success"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.05, opacity: 0 }}
              className="w-full max-w-md bg-slate-950/80 border border-emerald-500/20 p-8 rounded-2xl text-center space-y-6 shadow-[0_0_40px_rgba(16,185,129,0.15)] relative z-10"
            >
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.25)] text-lg">
                🏆
              </div>

              <div>
                <h1 className="font-rushblade text-xl text-emerald-400 tracking-wider uppercase">
                  VENUS DOCKING CONFIRMED
                </h1>
                <p className="font-mono text-[9px] text-slate-400 mt-2 leading-relaxed">
                  The A-4 escape rocket has successfully completed interplanetary travel and landed safely in the Venusian cloud academy.
                </p>
              </div>

              <div className="bg-slate-900/60 border border-white/5 rounded-xl p-3.5 text-left font-mono text-[9.5px] text-slate-400 space-y-1.5">
                <div className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Planet Explorer Badge: **UNLOCKED**</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Venus Modules: **INITIALIZED**</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Next Core Topic: **Asymmetric Cryptography**</span>
                </div>
              </div>

              <button
                onClick={handleBeginVenus}
                className="w-full py-3 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold font-mono text-[10px] tracking-wider rounded-xl transition shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer flex items-center justify-center gap-2"
              >
                BEGIN VENUS EXPEDITION <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Skip button visible until success screen */}
        {phase !== "success" && (
          <button
            onClick={handleSkip}
            className="absolute bottom-12 right-12 flex items-center gap-1.5 text-slate-500 hover:text-white font-mono text-[9px] tracking-widest uppercase transition cursor-pointer"
          >
            Skip Telemetry <FastForward className="w-3 h-3" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

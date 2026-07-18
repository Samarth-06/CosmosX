import { motion } from "framer-motion";
import { Rocket, Shield, ArrowRight, Clock, Package } from "lucide-react";

interface Props {
  moduleId: number;
  moduleTitle: string;
  moduleTheory: string;
  rocketComponent: string;
  tasks: { id: string; title: string; concept: string }[];
  moduleColor: string;
  onStart: () => void;
}

export default function ModuleIntroCard({
  moduleId,
  moduleTitle,
  moduleTheory,
  rocketComponent,
  tasks,
  moduleColor,
  onStart,
}: Props) {
  const moduleNum = String(moduleId).padStart(2, "0");
  const estTime = tasks.length * 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex w-full h-full min-h-0 p-4 lg:p-6"
      style={{ boxSizing: "border-box" }}
    >
      {/* Full-height card that fills available space */}
      <div
        className="relative w-full min-w-0 flex flex-col bg-slate-950/80 border border-white/10 rounded-2xl backdrop-blur-md shadow-2xl overflow-hidden"
        style={{ boxSizing: "border-box" }}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 inset-x-0 h-[2px] z-20"
          style={{ backgroundColor: moduleColor }}
        />

        {/* ── HEADER ROW ───────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-4 shrink-0 border-b border-white/5">
          {/* Left: badge + title */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[9px] font-mono uppercase tracking-widest self-start"
              style={{
                borderColor: `${moduleColor}40`,
                color: moduleColor,
                background: `${moduleColor}10`,
              }}
            >
              <Shield className="w-2.5 h-2.5" />
              Module {moduleNum} Intro
            </div>
            <h1 className="font-rushblade text-white text-lg leading-tight tracking-wide">
              {moduleTitle}
            </h1>
            <p
              className="text-[10px] font-mono uppercase tracking-widest"
              style={{ color: `${moduleColor}90` }}
            >
              {tasks.length > 0
                ? tasks[0]?.title.split(" — ")[0]?.split(" – ")[0] ?? ""
                : ""}
            </p>
          </div>

          {/* Right: payload + estimated time */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-0.5">
                <Package className="w-3 h-3" />
                Target Payload
              </div>
              <span
                className="font-mono text-[13px] font-bold"
                style={{ color: moduleColor }}
              >
                {rocketComponent}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[9px] font-mono text-slate-500 uppercase tracking-widest">
              <Clock className="w-3 h-3" />
              Est. {estTime} min
            </div>
          </div>
        </div>

        {/* ── BODY: grows to fill remaining space ──────────────── */}
        <div className="flex-1 min-h-0 flex flex-col gap-4 px-5 py-4 overflow-y-auto scrollbar-thin">

          {/* Operational Blueprint */}
          <div
            className="border-l-2 pl-4 py-0.5 shrink-0"
            style={{ borderColor: moduleColor }}
          >
            <div className="text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-1">
              Operational Blueprint
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans w-full max-w-none">
              {moduleTheory}
            </p>
          </div>

          {/* Sub-tasks table */}
          {tasks.length > 0 && (
            <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4 flex flex-col gap-2 shrink-0">
              {/* Table header */}
              <div className="grid gap-x-3 text-[9px] font-mono text-slate-500 uppercase tracking-widest pb-1 border-b border-white/5"
                style={{ gridTemplateColumns: "24px minmax(0,1fr) 60px" }}
              >
                <span>#</span>
                <span>Sub-task</span>
                <span className="text-right">Status</span>
              </div>

              {/* Task rows */}
              {tasks.map((task, idx) => {
                const cleanTitle = task.title
                  .replace(/Task \d+\.\d+\s+[—–]\s+/i, "")
                  .replace(/Task \d+\.\d+\s+-\s+/i, "");
                return (
                  <div
                    key={task.id}
                    className="grid gap-x-3 items-start bg-slate-950/50 border border-white/5 rounded-lg px-3 py-2"
                    style={{ gridTemplateColumns: "24px minmax(0,1fr) 60px" }}
                  >
                    {/* Number bubble */}
                    <div
                      className="w-5 h-5 rounded-full border flex items-center justify-center font-mono text-[9px] font-bold shrink-0 mt-0.5"
                      style={{
                        borderColor: `${moduleColor}40`,
                        color: moduleColor,
                        backgroundColor: `${moduleColor}10`,
                      }}
                    >
                      {idx + 1}
                    </div>

                    {/* Title + concept */}
                    <div className="min-w-0">
                      <div className="text-[11px] text-slate-200 font-semibold leading-snug">
                        {cleanTitle}
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono tracking-wide mt-0.5">
                        {task.concept}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="text-[9px] font-mono text-slate-600 uppercase tracking-widest text-right mt-0.5">
                      standby
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Spacer so footer stays at bottom without fixed positioning */}
          <div className="flex-1" />

          {/* ── FOOTER ───────────────────────────────────────────── */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5 shrink-0">
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 min-w-0">
              <Rocket className="w-3.5 h-3.5 shrink-0" style={{ color: moduleColor }} />
              <span className="truncate">Complete all checkpoints to unlock rocket assembly</span>
            </div>
            <button
              onClick={onStart}
              style={{
                backgroundColor: `${moduleColor}20`,
                borderColor: `${moduleColor}60`,
                color: moduleColor,
              }}
              className="group ml-4 flex items-center gap-2 border font-bold px-5 py-2 rounded-full text-[11px] font-rushblade tracking-wider transition-all hover:brightness-125 active:scale-95 shadow-md cursor-pointer shrink-0 whitespace-nowrap"
            >
              Initialize Module
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

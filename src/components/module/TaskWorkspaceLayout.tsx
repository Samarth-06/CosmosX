import React from "react";
import { BookOpen, FlaskConical, Terminal } from "lucide-react";

interface TaskWorkspaceLayoutProps {
  moduleColor: string;
  taskTitle: string;
  taskConcept: string;
  theoryTitle?: string;
  theoryContent: React.ReactNode;
  challengeTitle?: string;
  challengeContent: React.ReactNode;
  labTitle?: string;
  labContent: React.ReactNode;
}

export default function TaskWorkspaceLayout({
  moduleColor,
  taskTitle,
  taskConcept,
  theoryTitle = "Theory & Background",
  theoryContent,
  challengeTitle = "Challenge Scenario",
  challengeContent,
  labTitle = "Hands-on Lab",
  labContent,
}: TaskWorkspaceLayoutProps) {
  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-slate-950/20 rounded-2xl border border-white/10">
      {/* HEADER */}
      <div
        className="flex items-center gap-3 px-4 py-2 border-b border-white/10 bg-slate-950/80 shrink-0 select-none"
        style={{ borderLeftColor: moduleColor, borderLeftWidth: "3px" }}
      >
        <div
          className="p-2 border rounded-lg shrink-0"
          style={{ backgroundColor: `${moduleColor}15`, borderColor: `${moduleColor}30`, color: moduleColor }}
        >
          <Terminal className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-rushblade text-white text-xs tracking-wider uppercase truncate">
            {taskTitle}
          </h3>
          <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-mono">
            Concept: {taskConcept}
          </p>
        </div>
        <span
          className="text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border shrink-0"
          style={{ color: moduleColor, borderColor: `${moduleColor}40`, backgroundColor: `${moduleColor}10` }}
        >
          Active Lab
        </span>
      </div>

      {/* 3-PANEL LAYOUT */}
      <div className="flex-1 min-h-0 grid grid-cols-[34%_33%_33%] divide-x divide-white/5 overflow-hidden">
        {/* LEFT — THEORY */}
        <div className="flex flex-col h-full overflow-hidden bg-slate-950/40">
          <div
            className="flex items-center gap-2 px-4 py-2 border-b border-white/5 shrink-0"
            style={{ backgroundColor: `${moduleColor}08` }}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" style={{ color: moduleColor }} />
            <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">
              {theoryTitle}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {theoryContent}
          </div>
        </div>

        {/* CENTER — CHALLENGE */}
        <div className="flex flex-col h-full overflow-hidden bg-slate-950/60">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 shrink-0 bg-slate-900/30">
            <FlaskConical className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">
              {challengeTitle}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {challengeContent}
          </div>
        </div>

        {/* RIGHT — HANDS-ON LAB */}
        <div className="flex flex-col h-full overflow-hidden bg-[#020608]/80">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 shrink-0 bg-slate-900/30">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">
              {labTitle}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 scrollbar-thin">
            {labContent}
          </div>
        </div>
      </div>
    </div>
  );
}

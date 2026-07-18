import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Command,
  Cpu,
  LockKeyhole,
  Network,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
} from "lucide-react";
import {
  AcademyPlanetId,
  getPlanetAcademyCompletion,
  PLANET_ACADEMIES,
  savePlanetAcademyCompletion,
} from "@/lib/planet-academies";

interface PlanetAcademyProps {
  planetId: AcademyPlanetId;
}

export default function PlanetAcademy({ planetId }: PlanetAcademyProps) {
  const academy = PLANET_ACADEMIES[planetId];
  const [activeMission, setActiveMission] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [terminalPassed, setTerminalPassed] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const completion = getPlanetAcademyCompletion(planetId);
    const done = Math.round((completion / 100) * academy.missions.length);
    setActiveMission(0);
    setAnswers({});
    setCompleted(new Set(Array.from({ length: done }, (_, index) => index)));
    setTerminalInput("");
    setTerminalLogs(["COSMOSX PREVIEW SHELL // simulation provider online", "No live network actions are available in this academy."]);
    setTerminalPassed({});
  }, [academy.missions.length, planetId]);

  const mission = academy.missions[activeMission];
  const selected = answers[activeMission];
  const hasAnswer = selected !== undefined;
  const isCorrect = selected === mission.correct;
  const completion = Math.round((completed.size / academy.missions.length) * 100);
  const canLockCheckpoint = !mission.terminalCommand || terminalPassed[activeMission];

  const completeMission = () => {
    if (!canLockCheckpoint) return;
    setCompleted((current) => {
      const next = new Set(current);
      next.add(activeMission);
      savePlanetAcademyCompletion(planetId, next.size);
      return next;
    });
  };

  const runPreviewCommand = (event?: FormEvent) => {
    event?.preventDefault();
    const raw = terminalInput.trim();
    if (!raw) return;
    const expected = mission.terminalCommand?.toLowerCase();
    setTerminalLogs((current) => {
      if (raw.toLowerCase() === "clear") return [];
      if (raw.toLowerCase() === "help") return [...current, "learner@preview:~$ help", `Objective command: ${mission.terminalCommand ?? "No terminal command for this mission."}`, "clear  Clear this terminal output"];
      if (expected && raw.toLowerCase() === expected) {
        return [...current, `learner@preview:~$ ${raw}`, mission.terminalSuccess ?? "✓ Mission command completed in simulation."];
      }
      return [...current, `learner@preview:~$ ${raw}`, "error: command does not satisfy this mission objective", `hint: ${mission.terminalCommand ?? "review the theory panel"}`];
    });
    if (expected && raw.toLowerCase() === expected) {
      setTerminalPassed((current) => ({ ...current, [activeMission]: true }));
    }
    setTerminalInput("");
  };

  const visualBars = useMemo(() => [36, 72, 50, 87, 58, 76], []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#040712] text-white">
      <div className="pointer-events-none fixed inset-0 opacity-80" style={{ background: `radial-gradient(circle at 18% 8%, ${academy.glow}, transparent 30%), radial-gradient(circle at 85% 80%, ${academy.glow}, transparent 35%), linear-gradient(180deg, #050814 0%, #03050d 100%)` }} />
      <div className="pointer-events-none fixed inset-0 opacity-[0.045] bg-[linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] bg-size-[38px_38px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-10 pt-5 sm:px-7 lg:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <Link to="/" className="group inline-flex items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/3.5 px-3.5 py-2 font-mono text-[9px] uppercase tracking-[0.15em] text-slate-400 transition hover:border-white/25 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" />
            <span>Solar map</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <span className="hidden font-mono text-[8px] uppercase tracking-[0.18em] text-slate-500 sm:block">Academy preview</span>
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
              <motion.div className="h-full rounded-full" animate={{ width: `${completion}%` }} style={{ backgroundColor: academy.color, boxShadow: `0 0 14px ${academy.color}` }} />
            </div>
            <span className="font-mono text-[9px] font-bold" style={{ color: academy.color }}>{completion}%</span>
          </div>
        </header>

        <section className="grid gap-7 py-8 lg:grid-cols-[1.2fr_.8fr] lg:items-end lg:py-12">
          <div>
            <div className="mb-4 flex items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: academy.color }}>
              <Sparkles className="h-3.5 w-3.5" /> Planetary academy · {academy.status}
            </div>
            <h1 className="font-display text-5xl font-semibold tracking-tighter sm:text-7xl">{academy.name}</h1>
            <p className="mt-2 font-mono text-xs uppercase tracking-[0.24em] text-slate-400">{academy.topic}</p>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">{academy.overview}</p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/3.5 p-5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-[0.15em] text-slate-500"><span>Learning vector</span><Network className="h-4 w-4" style={{ color: academy.color }} /></div>
            <p className="mt-3 text-xl font-medium leading-tight text-white">{academy.tagline}</p>
            <div className="mt-5 flex h-14 items-end gap-1.5">
              {visualBars.map((height, index) => <motion.span key={index} initial={{ height: 0 }} animate={{ height: `${height}%` }} transition={{ delay: index * 0.06, duration: 0.45 }} className="flex-1 rounded-t-full" style={{ background: `linear-gradient(180deg, ${academy.color}, transparent)` }} />)}
            </div>
          </div>
        </section>

        <nav className="grid gap-2 border-y border-white/10 py-3 sm:grid-cols-3">
          {academy.missions.map((item, index) => {
            const current = index === activeMission;
            const done = completed.has(index);
            return (
              <button key={item.id} onClick={() => setActiveMission(index)} className={`group flex min-w-0 items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${current ? "bg-white/8" : "border-transparent hover:bg-white/3.5"}`} style={{ borderColor: current ? `${academy.color}80` : undefined, boxShadow: current ? `0 0 22px ${academy.glow}` : undefined }}>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-[9px] font-bold" style={{ color: done ? "#5ee7a2" : academy.color, borderColor: done ? "rgba(94,231,162,.45)" : `${academy.color}80`, backgroundColor: done ? "rgba(94,231,162,.1)" : `${academy.color}14` }}>{done ? <CheckCircle2 className="h-3.5 w-3.5" /> : `0${index + 1}`}</span>
                <span className="min-w-0"><span className="block truncate font-mono text-[8px] uppercase tracking-widest text-slate-500">{item.phase}</span><span className="block truncate text-[11px] font-semibold text-slate-200">{item.shortTitle}</span></span>
              </button>
            );
          })}
        </nav>

        <AnimatePresence mode="wait">
          <motion.section key={mission.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }} className="grid flex-1 gap-4 py-6 lg:min-h-[560px] lg:grid-cols-12">
            <article className="flex flex-col rounded-[1.7rem] border border-white/10 bg-white/3.5 p-5 backdrop-blur-xl lg:col-span-5">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                <div><p className="font-mono text-[9px] uppercase tracking-[0.17em]" style={{ color: academy.color }}>{mission.phase}</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">{mission.title}</h2></div>
                <ShieldCheck className="h-6 w-6 shrink-0" style={{ color: academy.color }} />
              </div>
              <div className="mt-5 space-y-5 text-[13px] leading-6 text-slate-300">
                <div><p className="mb-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.17em] text-slate-500">Start here</p><p>{mission.simpleTheory}</p></div>
                <div className="rounded-2xl border border-white/9 bg-black/20 p-4"><p className="mb-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.17em]" style={{ color: academy.color }}>Under the hood</p><p>{mission.technicalTheory}</p></div>
                <blockquote className="border-l-2 pl-3 text-[13px] italic leading-6 text-slate-200" style={{ borderColor: academy.color }}>“{mission.quote}”</blockquote>
              </div>
              <div className="mt-auto flex flex-wrap gap-1.5 pt-5">{mission.keyTerms.map((term) => <span key={term} className="rounded-full border px-2.5 py-1 font-mono text-[8px] font-bold uppercase tracking-wider" style={{ color: academy.color, borderColor: `${academy.color}55`, backgroundColor: `${academy.color}10` }}>{term}</span>)}</div>
            </article>

            <div className="flex flex-col gap-4 lg:col-span-4">
              <article className="relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-[#07101c]/80 p-5 shadow-2xl">
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl" style={{ backgroundColor: academy.glow }} />
                <div className="relative flex items-center justify-between"><div className="font-mono text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: academy.color }}>{mission.scenarioLabel}</div><Cpu className="h-4 w-4 text-slate-500" /></div>
                <div className="relative mt-6 space-y-3">{mission.scenario.map((row, index) => <motion.div key={row} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.08 }} className="flex items-center gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[8px]" style={{ color: academy.color, borderColor: `${academy.color}60` }}>{index + 1}</span><span className="h-px w-4" style={{ backgroundColor: `${academy.color}70` }} /><span className="font-mono text-[10px] tracking-wide text-slate-200">{row}</span></motion.div>)}</div>
                <div className="relative mt-6 rounded-xl border border-white/10 bg-black/20 p-3 font-mono text-[8px] leading-5 text-slate-500">SIMULATION NOTE: visual state is educational and contains no private credentials or live network access.</div>
              </article>

              {mission.terminalCommand ? (
                <article className="flex min-h-[220px] flex-1 flex-col overflow-hidden rounded-[1.7rem] border border-white/10 bg-[#03060b] shadow-[inset_0_1px_0_rgba(255,255,255,.05)]">
                  <div className="flex items-center justify-between border-b border-white/10 bg-white/3.5 px-4 py-3"><div className="flex items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-slate-300"><TerminalSquare className="h-4 w-4" style={{ color: academy.color }} /> Preview shell</div><span className="font-mono text-[7px] uppercase tracking-widest text-amber-300">simulation</span></div>
                  <div className="flex-1 overflow-y-auto px-4 py-3 font-mono text-[9px] leading-5 text-slate-400">{terminalLogs.map((log, index) => <p key={`${log}-${index}`} className={log.startsWith("✓") ? "text-emerald-300" : log.startsWith("error") ? "text-rose-300" : log.startsWith("learner@") ? "text-cyan-300" : ""}>{log}</p>)}</div>
                  <form onSubmit={runPreviewCommand} className="flex gap-2 border-t border-white/10 px-3 py-3"><Command className="mt-1 h-3.5 w-3.5 shrink-0" style={{ color: academy.color }} /><input value={terminalInput} onChange={(event) => setTerminalInput(event.target.value)} placeholder={mission.terminalCommand} className="min-w-0 flex-1 bg-transparent font-mono text-[10px] text-white outline-none placeholder:text-slate-700" autoComplete="off" spellCheck={false} /><button type="submit" className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-300 transition hover:bg-white/10"><ChevronRight className="h-3.5 w-3.5" /></button></form>
                  <button onClick={() => { setTerminalInput(mission.terminalCommand ?? ""); }} className="border-t border-white/5 px-4 py-2 text-left font-mono text-[8px] text-slate-500 transition hover:bg-white/2.5 hover:text-slate-300">Suggested: <span style={{ color: academy.color }}>{mission.terminalCommand}</span></button>
                </article>
              ) : (
                <article className="flex flex-1 flex-col justify-between rounded-[1.7rem] border border-white/10 bg-white/2.5 p-5"><div><LockKeyhole className="h-5 w-5" style={{ color: academy.color }} /><p className="mt-3 font-mono text-[9px] uppercase tracking-[0.17em] text-slate-500">Practical lab unlocks in mission 03</p><p className="mt-2 text-[12px] leading-6 text-slate-400">Use the signal board to build intuition first. The final checkpoint turns that understanding into a safe, simulated command workflow.</p></div><div className="font-mono text-[9px] uppercase tracking-widest text-slate-600">No terminal initialized</div></article>
              )}
            </div>

            <article className="flex flex-col rounded-[1.7rem] border border-white/10 bg-white/4 p-5 backdrop-blur-xl lg:col-span-3">
              <div className="flex items-center gap-2"><Sparkles className="h-4 w-4" style={{ color: academy.color }} /><p className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">Knowledge check</p></div>
              <p className="mt-4 text-sm font-semibold leading-6 text-white">{mission.question}</p>
              <div className="mt-4 space-y-2">{mission.choices.map((choice, index) => {
                const selectedChoice = selected === index;
                const reveal = hasAnswer;
                const correctChoice = index === mission.correct;
                return <button key={choice} onClick={() => setAnswers((current) => ({ ...current, [activeMission]: index }))} className={`w-full rounded-xl border px-3 py-2.5 text-left font-mono text-[9px] leading-4 transition ${reveal && correctChoice ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-200" : reveal && selectedChoice ? "border-rose-400/60 bg-rose-400/10 text-rose-200" : "border-white/10 bg-black/15 text-slate-300 hover:border-white/25"}`}><span className="mr-2 text-slate-500">{String.fromCharCode(65 + index)}.</span>{choice}</button>;
              })}</div>
              <AnimatePresence>{hasAnswer && <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`mt-4 rounded-xl border p-3 text-[10px] leading-5 ${isCorrect ? "border-emerald-400/20 bg-emerald-400/8 text-emerald-100" : "border-amber-300/20 bg-amber-300/8 text-amber-100"}`}><p className="mb-1 font-mono text-[8px] font-bold uppercase tracking-widest">{isCorrect ? "Correct reasoning" : "Review the reasoning"}</p>{mission.explanation}</motion.div>}</AnimatePresence>
              <div className="mt-auto pt-5">
                <button
                  onClick={completeMission}
                  disabled={!canLockCheckpoint}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-3 font-mono text-[9px] font-bold uppercase tracking-wider text-slate-950 transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-35 cursor-pointer animate-pulse"
                  style={{ backgroundColor: academy.color }}
                >
                  {completed.has(activeMission) && <CheckCircle2 className="h-3.5 w-3.5" />}
                  <span>
                    {completed.has(activeMission)
                      ? "Checkpoint locked"
                      : (mission.terminalCommand && !canLockCheckpoint ? "Run mission command first" : "Lock checkpoint")}
                  </span>
                  {!completed.has(activeMission) && <ChevronRight className="h-3.5 w-3.5" />}
                </button>
              </div>
            </article>
          </motion.section>
        </AnimatePresence>

        <footer className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
          <button
            onClick={() => setActiveMission((current) => Math.max(0, current - 1))}
            disabled={activeMission === 0}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/10 px-4 py-2.5 font-mono text-[9px] uppercase tracking-wider text-slate-400 transition hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Previous mission</span>
          </button>
          <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-slate-600">
            Preview curriculum · content is designed for extension
          </p>
          {activeMission < academy.missions.length - 1 ? (
            <button
              onClick={() => setActiveMission((current) => current + 1)}
              className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 font-mono text-[9px] font-bold uppercase tracking-wider text-slate-950 transition hover:brightness-110 cursor-pointer"
              style={{ backgroundColor: academy.color }}
            >
              <span>Next mission</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={() => {
                setCompleted(new Set());
                savePlanetAcademyCompletion(planetId, 0);
                setActiveMission(0);
                setTerminalPassed({});
                setAnswers({});
                setTerminalLogs(["COSMOSX PREVIEW SHELL // simulation provider online"]);
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/10 px-4 py-2.5 font-mono text-[9px] uppercase tracking-wider text-slate-400 transition hover:border-white/25 hover:text-white cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset academy</span>
            </button>
          )}
        </footer>
      </div>
    </main>
  );
}

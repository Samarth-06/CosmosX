import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Flame, Trophy, Star, ChevronRight, ArrowRight, Rocket, Target } from "lucide-react";
import {
  getUserState,
  getUserLevel,
  getNextLevelInfo,
  getEarnedBadges,
  getLockedBadges,
  ALL_BADGES,
  LEVELS,
  LEVEL_THRESHOLDS,
  seedDemoState,
  type UserState,
} from "@/lib/user-store";
import SkillTree from "@/components/SkillTree";
import LiveActivityFeed from "@/components/LiveActivityFeed";
import { ProofScreen } from "@/features/achievements/ProofScreen";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

const PLANET_META: Record<string, { color: string; route: string; name: string; topic: string; emoji: string }> = {
  mercury: { color: "#00E5FF", route: "/planets/mercury", name: "Mercury", topic: "Genesis of Blockchain", emoji: "☿" },
  venus: { color: "#F59E0B", route: "/planets/venus", name: "Venus", topic: "Cryptography & Keys", emoji: "♀" },
  earth: { color: "#10B981", route: "/planets/earth", name: "Earth", topic: "Consensus & Networks", emoji: "🌍" },
  mars: { color: "#EF4444", route: "/planets/mars", name: "Mars", topic: "Wallets & Transactions", emoji: "♂" },
  jupiter: { color: "#F97316", route: "/planets/jupiter", name: "Jupiter", topic: "Smart Contracts", emoji: "♃" },
  saturn: { color: "#8B5CF6", route: "/planets/saturn", name: "Saturn", topic: "Tokens & Assets", emoji: "♄" },
  uranus: { color: "#06B6D4", route: "/planets/uranus", name: "Uranus", topic: "NFTs & Ownership", emoji: "⛢" },
  neptune: { color: "#3B82F6", route: "/planets/neptune", name: "Neptune", topic: "Stellar Mainnet", emoji: "♆" },
};

const PLANETS_ORDER = ["mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune"];

function Dashboard() {
  const [user, setUser] = useState<UserState | null>(null);

  useEffect(() => {
    seedDemoState();
    setUser(getUserState());
  }, []);

  if (!user) return null;

  const level = getUserLevel(user.xp);
  const nextInfo = getNextLevelInfo(user.xp);
  const earnedBadges = getEarnedBadges();
  const lockedBadges = getLockedBadges();

  // 30-day streak calendar
  const today = new Date();
  const calendarDays = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (29 - i));
    const key = d.toISOString().split("T")[0];
    return { key, active: user.activityDates.includes(key) };
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Starfield */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_center,white_0.7px,transparent_0.7px)] bg-[size:22px_22px] opacity-[0.07]" />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-cyan-950/10 via-transparent to-purple-950/10" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/8 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="font-display text-base font-semibold">
              Cosmos<span className="text-secondary">X</span>
            </Link>
            <span className="text-white/20">/</span>
            <span className="text-sm text-muted-foreground">Mission Control</span>
          </div>
          <Link
            to="/planets/mercury"
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-primary-glow px-4 py-1.5 text-xs font-semibold text-white shadow-[0_0_20px_-4px_var(--color-primary)] transition hover:shadow-[0_0_28px_-2px_var(--color-primary)]"
          >
            <Rocket className="h-3.5 w-3.5" /> Continue Mission
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Top hero strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3"
        >
          {/* XP + Level card */}
          <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-br from-slate-900/80 to-[#040816]/90 p-5 lg:col-span-2">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-950/20 to-transparent" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-secondary/80">Commander Rank</div>
                <h1 className="mt-1 font-display text-2xl font-bold">{level}</h1>
                <div className="mt-0.5 font-mono text-sm text-muted-foreground">{user.xp.toLocaleString()} XP total</div>
              </div>
              <div className="shrink-0 text-right">
                <div className="font-mono text-[10px] text-muted-foreground">Next: {nextInfo.level}</div>
                <div className="mt-0.5 font-display text-sm font-semibold text-foreground">{nextInfo.xpToNext.toLocaleString()} XP away</div>
              </div>
            </div>

            {/* XP Bar */}
            <div className="relative mt-4">
              <div className="flex justify-between font-mono text-[9px] text-muted-foreground mb-1">
                <span>{level}</span>
                <span>{nextInfo.progress}%</span>
                <span>{nextInfo.level}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/8">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${nextInfo.progress}%` }}
                  transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent shadow-[0_0_12px_rgba(0,216,255,0.4)]"
                />
              </div>
            </div>

            {/* Level milestones */}
            <div className="mt-4 flex gap-2">
              {LEVELS.map((lvl, i) => {
                const done = user.xp >= LEVEL_THRESHOLDS[lvl];
                const active = lvl === level;
                return (
                  <div key={lvl} className="flex-1 text-center">
                    <div className={`h-1 rounded-full ${done ? "bg-gradient-to-r from-primary to-secondary" : "bg-white/8"} ${active ? "shadow-[0_0_8px_rgba(0,216,255,0.4)]" : ""}`} />
                    <div className={`mt-1 font-mono text-[8px] ${active ? "text-secondary" : done ? "text-muted-foreground" : "text-white/20"}`}>
                      {lvl.split(" ")[0]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats column */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
            <StatCard icon={<Flame className="h-4 w-4" />} label="Day Streak" value={`${user.streak} days`} color="#F97316" />
            <StatCard icon={<Trophy className="h-4 w-4" />} label="Badges Earned" value={`${earnedBadges.length} / ${ALL_BADGES.length}`} color="#F59E0B" />
            <StatCard icon={<Zap className="h-4 w-4" />} label="Planets Done" value={`${user.completedPlanets.length} / 8`} color="#00E5FF" />
            <StatCard icon={<Star className="h-4 w-4" />} label="Global Rank" value="#284" color="#8B5CF6" />
          </div>
        </motion.div>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

          {/* Left column */}
          <div className="space-y-6 lg:col-span-8">

            {/* Skill Tree */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <SectionLabel>Constellation Map</SectionLabel>
              <SkillTree
                completedPlanets={user.completedPlanets}
                planetProgress={user.planetProgress}
                onPlanetClick={(id) => {
                  window.location.href = PLANET_META[id]?.route ?? "/";
                }}
              />
            </motion.div>

            {/* Planet progress cards */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <SectionLabel>Planet Status</SectionLabel>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {PLANETS_ORDER.map((pid, idx) => {
                  const meta = PLANET_META[pid];
                  const progress = user.planetProgress[pid] ?? 0;
                  const completed = user.completedPlanets.includes(pid);
                  const unlocked = idx === 0 || user.completedPlanets.includes(PLANETS_ORDER[idx - 1]);

                  return (
                    <Link
                      key={pid}
                      to={meta.route as any}
                      className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-white/6 bg-gradient-to-r from-slate-900/60 to-[#040816]/80 p-3.5 transition hover:border-white/12"
                      style={{ pointerEvents: unlocked ? "auto" : "none", opacity: unlocked ? 1 : 0.4 }}
                    >
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl"
                        style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}30` }}
                      >
                        {meta.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-display text-[13px] font-semibold text-foreground">{meta.name}</span>
                          {completed && <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 font-mono text-[8px] text-emerald-400">✓ Done</span>}
                          {!unlocked && <span className="rounded-full bg-white/5 px-1.5 py-0.5 font-mono text-[8px] text-muted-foreground">🔒 Locked</span>}
                        </div>
                        <div className="mt-0.5 text-[10px] text-muted-foreground truncate">{meta.topic}</div>
                        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/8">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${progress}%`, background: meta.color, boxShadow: `0 0 6px ${meta.color}60` }}
                          />
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="font-mono text-sm font-bold" style={{ color: meta.color }}>{progress}%</div>
                        <ChevronRight className="mt-1 h-3.5 w-3.5 text-muted-foreground transition group-hover:translate-x-0.5" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>

            {/* Streak Calendar */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <SectionLabel>30-Day Activity</SectionLabel>
              <div className="rounded-2xl border border-white/8 bg-gradient-to-b from-slate-900/60 to-[#040816]/80 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-400" />
                    <span className="font-display text-sm font-semibold">{user.streak}-day streak</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span className="h-2 w-2 rounded-sm bg-secondary/60" /> Active
                    <span className="ml-1 h-2 w-2 rounded-sm bg-white/8" /> Inactive
                  </div>
                </div>
                <div className="grid grid-cols-[repeat(30,_1fr)] gap-1">
                  {calendarDays.map(({ key, active }) => (
                    <div
                      key={key}
                      title={key}
                      className={`aspect-square rounded-[2px] transition-all ${active ? "bg-secondary/60 shadow-[0_0_6px_rgba(0,216,255,0.3)]" : "bg-white/5"}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right column */}
          <div className="space-y-6 lg:col-span-4">

            {/* On-Chain Proof — persistent Stellar Testnet achievement proof */}
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18 }}>
              <SectionLabel>Blockchain Proof</SectionLabel>
              <ProofScreen />
            </motion.div>

            {/* Next Mission */}
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <SectionLabel>Recommended Next</SectionLabel>
              <div className="overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/30 to-[#040816]/90 p-4 shadow-[0_0_30px_rgba(0,229,255,0.08)]">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-4 w-4 text-secondary" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-secondary">Active Mission</span>
                </div>
                <div className="text-2xl mb-2">♀</div>
                <h3 className="font-display text-base font-bold text-foreground">Venus — Cryptography</h3>
                <p className="mt-1 text-[11px] text-muted-foreground">Hash Forge Lab: see SHA-256 avalanche effects live. Earn the Hash Cracker badge.</p>
                <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">Beginner</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">1h 10m</span>
                  <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-amber-400">+400 XP</span>
                </div>
                <Link
                  to="/planets/venus"
                  className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-secondary/80 to-cyan-400/80 py-2.5 text-xs font-semibold text-background transition hover:from-secondary hover:to-cyan-400"
                >
                  Launch Mission <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.div>

            {/* Badges */}
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <SectionLabel>Achievements</SectionLabel>
              <div className="rounded-2xl border border-white/8 bg-gradient-to-b from-slate-900/60 to-[#040816]/80 p-4">
                <div className="grid grid-cols-4 gap-2">
                  {earnedBadges.map((badge) => (
                    <div
                      key={badge.id}
                      title={`${badge.name}: ${badge.description}`}
                      className="group relative flex aspect-square cursor-pointer items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-2xl shadow-[0_0_15px_rgba(245,158,11,0.15)] transition hover:scale-105 hover:shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                    >
                      {badge.icon}
                      <div className="absolute inset-x-0 -bottom-1 h-[2px] rounded-full bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-60" />
                    </div>
                  ))}
                  {lockedBadges.map((badge) => (
                    <div
                      key={badge.id}
                      title={`Locked: ${badge.description}`}
                      className="flex aspect-square cursor-not-allowed items-center justify-center rounded-xl border border-white/6 bg-white/[0.03] text-2xl opacity-25 grayscale"
                    >
                      {badge.icon}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Live Activity */}
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <div className="flex items-center justify-between mb-2">
                <SectionLabel className="mb-0">Live Activity</SectionLabel>
                <span className="flex items-center gap-1 font-mono text-[9px] text-emerald-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> LIVE
                </span>
              </div>
              <div className="overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-b from-slate-900/60 to-[#040816]/80">
                <LiveActivityFeed maxItems={6} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground ${className}`}>
      {children}
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl border bg-gradient-to-br from-slate-900/60 to-[#040816]/80 p-3"
      style={{ borderColor: `${color}25` }}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: `${color}15`, color }}>
        {icon}
      </div>
      <div>
        <div className="font-mono text-[9px] text-muted-foreground">{label}</div>
        <div className="font-display text-sm font-bold text-foreground">{value}</div>
      </div>
    </div>
  );
}

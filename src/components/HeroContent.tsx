import { motion } from "framer-motion";
import { ArrowRight, Compass, Play } from "lucide-react";

export default function HeroContent() {
  return (
    <div className="pointer-events-none relative z-10 flex min-h-screen items-center px-4 sm:px-8 lg:px-14">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 pt-28 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center">
        {/* Left */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
          className="pointer-events-auto max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary shadow-[0_0_10px_currentColor]" />
            Interactive Blockchain Universe
          </div>

          <h1 className="mt-6 font-display text-[clamp(2.5rem,6.2vw,5.25rem)] font-semibold leading-[1.02] tracking-[-0.03em]">
            <span className="block">Master blockchain</span>
            <span className="block">
              by <span className="text-gradient">exploring</span>
            </span>
            <span className="block">our solar system.</span>
          </h1>

          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            CosmosX teaches you blockchain visually through cinematic
            simulations — planet by planet — before your first real transaction
            on the Stellar Mainnet. No jargon. No docs first. Just experience.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <button className="group inline-flex items-center gap-2 rounded-full bg-linear-to-r from-primary via-primary-glow to-secondary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[0_0_40px_-8px_var(--color-primary)] transition hover:shadow-[0_0_60px_-6px_var(--color-secondary)]">
              <Play className="h-4 w-4 fill-current" />
              Begin Journey
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-5 py-3 text-sm font-medium text-foreground backdrop-blur transition hover:bg-white/10">
              Continue Learning
            </button>
            <button className="inline-flex items-center gap-2 px-2 py-3 text-sm font-medium text-muted-foreground transition hover:text-foreground">
              <Compass className="h-4 w-4" />
              Explore curriculum
            </button>
          </div>

          <div className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-white/8 pt-6">
            <Stat label="Planets" value="9" hint="learning modules" />
            <Stat label="Simulations" value="42" hint="hands-on labs" />
            <Stat label="Learners" value="18k+" hint="orbiting now" />
          </div>
        </motion.div>

        {/* Right — dashboard glass card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.15, ease: [0.19, 1, 0.22, 1] }}
          className="pointer-events-auto"
        >
          <DashboardCard />
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-center"
      >
        <div className="mx-auto h-8 w-[1px] bg-linear-to-b from-transparent via-white/40 to-transparent" />
        <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
          Scroll to launch
        </p>
      </motion.div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div>
      <div className="font-display text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </div>
      <div className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </div>
      <div className="text-[11px] text-muted-foreground/70">{hint}</div>
    </div>
  );
}

function DashboardCard() {
  return (
    <div className="glass-strong relative overflow-hidden rounded-3xl p-5 sm:p-6">
      {/* subtle top gradient */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/25 to-transparent" />

      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Commander
          </div>
          <div className="mt-1 font-display text-lg font-semibold">Nova · Level 07</div>
        </div>
        <div className="relative">
          <div className="h-11 w-11 rounded-full bg-linear-to-br from-secondary to-primary p-[2px]">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-surface text-sm font-semibold">
              N
            </div>
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface bg-success shadow-[0_0_10px_currentColor]" />
        </div>
      </div>

      {/* Progress */}
      <div className="mt-6">
        <div className="flex items-baseline justify-between text-[12px]">
          <span className="text-muted-foreground">Galaxy Progress</span>
          <span className="font-mono text-foreground">42%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full bg-linear-to-r from-primary via-secondary to-accent"
            style={{ width: "42%" }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground/70">
          <span>3 planets complete</span>
          <span>6 remaining</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="mt-6 grid grid-cols-2 gap-2.5">
        <MiniStat label="Wallet" value="Ready" tone="success" />
        <MiniStat label="Streak" value="12 days" tone="accent" />
        <MiniStat label="NFTs" value="7" tone="primary" />
        <MiniStat label="Rank" value="#284" tone="secondary" />
      </div>

      {/* Next lesson */}
      <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Recommended
          </div>
          <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-accent">
            Mars
          </span>
        </div>
        <div className="mt-2 font-display text-[15px] font-semibold">
          Wallets & Transactions
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          Simulate signing your first transaction — no risk, no gas fees.
        </div>
        <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white/8 py-2 text-xs font-semibold text-foreground transition hover:bg-white/12">
          Resume mission
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "success" | "accent" | "primary" | "secondary";
}) {
  const dot =
    tone === "success"
      ? "bg-success"
      : tone === "accent"
      ? "bg-accent"
      : tone === "primary"
      ? "bg-primary"
      : "bg-secondary";
  return (
    <div className="rounded-xl border border-white/6 bg-white/[0.02] px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        <span className={`h-1 w-1 rounded-full ${dot} shadow-[0_0_6px_currentColor]`} />
        {label}
      </div>
      <div className="mt-1 font-display text-sm font-semibold">{value}</div>
    </div>
  );
}

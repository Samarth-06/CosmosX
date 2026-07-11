import { useEffect, useRef, useState, Suspense } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Canvas } from "@react-three/fiber";

import Nav from "@/components/Nav";
import HeroContent from "@/components/HeroContent";
import SolarSystem from "@/components/SolarSystem";
import PlanetTooltip from "@/components/PlanetTooltip";
import { PLANETS } from "@/lib/planets";
import { getMercuryCompletion } from "@/lib/module1-store";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const scrollProgress = useRef(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const [activeIdx, setActiveIdx] = useState(-1);

  // total scrollable height: overview + 1 screen per planet
  const totalPages = PLANETS.length + 1;

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      scrollProgress.current = p;
      // determine active planet index
      const overview = 0.1;
      if (p < overview) setActiveIdx(-1);
      else {
        const seg = (p - overview) / (1 - overview);
        setActiveIdx(Math.min(PLANETS.length - 1, Math.floor(seg * PLANETS.length)));
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="relative">
      {/* Fixed 3D canvas */}
      <div className="fixed inset-0 z-0">
        <Canvas
          camera={{ position: [0, 30, 65], fov: 45, near: 0.1, far: 1000 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        >
          <Suspense fallback={null}>
            <SolarSystem
              scrollProgress={scrollProgress}
              hoveredPlanet={hovered}
              setHoveredPlanet={setHovered}
              activePlanetIdx={activeIdx}
              onPlanetClick={(id) => {
                const idx = PLANETS.findIndex((p) => p.id === id);
                if (idx < 0) return;
                const overview = 0.1;
                const target = overview + ((idx + 0.5) / PLANETS.length) * (1 - overview);
                const max = document.documentElement.scrollHeight - window.innerHeight;
                window.scrollTo({ top: target * max, behavior: "smooth" });
              }}
            />
          </Suspense>
        </Canvas>

        {/* Vignette + top/bottom fade for legibility */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(4,8,22,0.55)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b from-background/70 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-background/70 to-transparent" />
      </div>

      <Nav />
      <PlanetTooltip id={hovered ?? (activeIdx >= 0 ? PLANETS[activeIdx]?.id ?? null : null)} />

      {/* Scroll-space: first page = hero content, each subsequent page = planet chapter */}
      <div className="relative z-10">
        <section className="relative h-screen">
          <HeroContent />
        </section>

        {PLANETS.map((p, i) => (
          <PlanetChapter key={p.id} planet={p} index={i} total={PLANETS.length} />
        ))}

        {/* Tail spacer so last planet reaches full progress */}
        <div className="h-[40vh]" />
      </div>

      {/* Progress rail */}
      <ProgressRail current={activeIdx} total={totalPages - 1} />
    </main>
  );
}

function PlanetChapter({
  planet,
  index,
  total,
}: {
  planet: (typeof PLANETS)[number];
  index: number;
  total: number;
}) {
  const num = String(index + 1).padStart(2, "0");
  const [completion, setCompletion] = useState(planet.completion);

  useEffect(() => {
    if (planet.id === "mercury") {
      setCompletion(getMercuryCompletion());
    }
  }, [planet.id]);

  const isUnlocked = planet.id === "mercury";

  return (
    <section className="relative flex min-h-screen items-end px-4 pb-20 sm:px-8 lg:px-14">
      <div className="pointer-events-none mx-auto flex w-full max-w-7xl items-end justify-between gap-8">
        <div className="pointer-events-auto max-w-xl">
          <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-secondary">
            Chapter {num} · {index + 1} / {total}
          </div>
          <h2 className="mt-3 font-display text-[clamp(2rem,5vw,3.75rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
            {planet.name}
          </h2>
          <div className="mt-1 text-lg text-secondary">{planet.topic}</div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            {DESCRIPTIONS[planet.id]}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground/90">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              {planet.difficulty}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              {planet.time}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              {completion}% complete
            </span>
          </div>
          {isUnlocked ? (
            <Link
              to="/planets/mercury"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-primary to-primary-glow px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-[0_0_30px_-8px_var(--color-primary)] transition hover:shadow-[0_0_40px_-4px_var(--color-primary)] cursor-pointer"
            >
              Enter {planet.name}
            </Link>
          ) : (
            <button
              disabled
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold text-muted-foreground cursor-not-allowed opacity-60"
            >
              Planet Locked
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

const DESCRIPTIONS: Record<string, string> = {
  mercury:
    "Where it all begins. Feel the difference between centralized and distributed systems by attacking a virtual city, then watching the network survive.",
  venus:
    "Cryptography made tactile. Break hashes, forge signatures, and see the avalanche effect ripple through data in real time.",
  earth:
    "How strangers agree without trust. Simulate proof-of-work, proof-of-stake, and Stellar's federated consensus with living networks.",
  mars:
    "Your first wallet — safely. Sign transactions, watch fees settle, and understand every byte before touching real assets.",
  jupiter:
    "Programs that live on chains. Write, deploy, and break Soroban smart contracts inside a fully simulated blockchain.",
  saturn:
    "Assets, tokens, and the anchors that give them meaning. Issue your own token on a simulated Stellar network.",
  uranus:
    "Prove you own something the world can verify. Mint, trade, and understand NFTs beyond the hype.",
  neptune:
    "The final launch. Connect a real wallet and perform your first authenticated transaction on Stellar Mainnet.",
};

function ProgressRail({ current, total }: { current: number; total: number }) {
  return (
    <div className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-2 md:flex">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-6 w-[2px] rounded-full transition-all ${
            i === current
              ? "bg-secondary shadow-[0_0_8px_var(--color-secondary)]"
              : "bg-white/15"
          }`}
        />
      ))}
    </div>
  );
}

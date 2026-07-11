import { motion, AnimatePresence } from "framer-motion";
import { PLANETS } from "@/lib/planets";

export default function PlanetTooltip({ id }: { id: string | null }) {
  const planet = id ? PLANETS.find((p) => p.id === id) : null;

  return (
    <AnimatePresence>
      {planet && (
        <motion.div
          key={planet.id}
          initial={{ opacity: 0, y: 10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.98 }}
          transition={{ duration: 0.25, ease: [0.19, 1, 0.22, 1] }}
          className="pointer-events-none fixed left-1/2 top-24 z-40 -translate-x-1/2"
        >
          <div className="glass-strong rounded-2xl px-5 py-3.5 text-center">
            <div className="text-[10px] font-medium uppercase tracking-[0.25em] text-secondary">
              {planet.difficulty} · {planet.time}
            </div>
            <div className="mt-1 font-display text-lg font-semibold tracking-tight">
              {planet.name}
            </div>
            <div className="text-xs text-muted-foreground">{planet.topic}</div>
            <div className="mt-2 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground/80">
              <div className="h-1 w-24 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-linear-to-r from-primary to-secondary"
                  style={{ width: `${planet.completion}%` }}
                />
              </div>
              <span className="font-mono">{planet.completion}%</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, BadgeCheck, Eye, Star, Info } from "lucide-react";
import type { ExoplanetAsset } from "@/lib/exoplanets-data";
import Planet3DViewer from "./Planet3DViewer";

export type NFTRarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";

const RARITY_STYLES: Record<NFTRarity, { border: string; glow: string; badge: string; text: string; bg: string }> = {
  Common: {
    border: "border-slate-500/20",
    glow: "shadow-[0_0_15px_rgba(148,163,184,0.05)]",
    badge: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
    text: "text-slate-400",
    bg: "from-slate-950/90 to-slate-900/60",
  },
  Uncommon: {
    border: "border-emerald-500/30",
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.08)]",
    badge: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    text: "text-emerald-400",
    bg: "from-slate-950/90 to-emerald-950/10",
  },
  Rare: {
    border: "border-cyan-500/45",
    glow: "shadow-[0_0_25px_rgba(6,182,212,0.12)]",
    badge: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30",
    text: "text-cyan-400",
    bg: "from-slate-950/90 to-cyan-950/15",
  },
  Epic: {
    border: "border-purple-500/50",
    glow: "shadow-[0_0_30px_rgba(168,85,247,0.18)]",
    badge: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
    text: "text-purple-400",
    bg: "from-slate-950/90 to-purple-950/20",
  },
  Legendary: {
    border: "border-amber-400/60",
    glow: "shadow-[0_0_35px_rgba(245,158,11,0.25)]",
    badge: "bg-amber-400/15 text-amber-300 border border-amber-400/35",
    text: "text-amber-400",
    bg: "from-slate-950/95 to-amber-950/25",
  },
};

interface NFTCardProps {
  planet: ExoplanetAsset;
  price: number;
  owner: string;
  isWatchlisted: boolean;
  onWatchlistToggle: (planetId: string) => void;
  onSelect: (planetId: string) => void;
  onBuy?: (planetId: string) => void;
}

export default function NFTCard({
  planet,
  price,
  owner,
  isWatchlisted,
  onWatchlistToggle,
  onSelect,
  onBuy,
}: NFTCardProps) {
  const styles = RARITY_STYLES[planet.rarity as NFTRarity] || RARITY_STYLES.Common;
  const isUserOwned = owner === "YOU" || owner.toLowerCase().includes("local");

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
      className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-gradient-to-b ${styles.bg} backdrop-blur-xl ${styles.border} ${styles.glow} transition-all duration-300`}
      onClick={() => onSelect(planet.id)}
    >
      {/* Atmosphere radial shine on card hover */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${planet.color}15 0%, transparent 70%)`,
        }}
      />

      {/* Exoplanet 3D Orbit Display area */}
      <div
        className="relative flex h-52 items-center justify-center overflow-hidden"
        style={{
          background: `radial-gradient(circle at 50% 60%, ${planet.color}18 0%, transparent 80%)`,
          borderBottom: `1px solid ${planet.color}15`,
        }}
      >
        <Planet3DViewer
          textureName={planet.textureName}
          color={planet.color}
          interactive={false}
          className="h-36 w-36"
        />

        {/* Top-left Rarity badge */}
        <span className={`absolute left-3 top-3 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${styles.badge}`}>
          {planet.rarity}
        </span>

        {/* Top-right Like/Watchlist button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onWatchlistToggle(planet.id);
          }}
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 backdrop-blur transition hover:bg-black/60 z-20"
        >
          <Heart
            className={`h-3.5 w-3.5 ${
              isWatchlisted ? "fill-rose-500 text-rose-500" : "text-white/60 hover:text-white"
            }`}
          />
        </button>

        {/* Planet Type Indicator */}
        <div
          className="absolute bottom-3 left-3 rounded-md px-2 py-0.5 font-mono text-[9px] font-semibold border"
          style={{
            backgroundColor: `${planet.color}10`,
            color: planet.color,
            borderColor: `${planet.color}25`,
          }}
        >
          {planet.type}
        </div>

        {/* Verification badge */}
        {planet.verificationBadge && (
          <div className="absolute bottom-3 right-3 flex items-center gap-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 font-mono text-[8px] text-indigo-300 font-bold uppercase tracking-wide">
            <BadgeCheck className="h-3 w-3 fill-indigo-500/20 text-indigo-400" />
            <span>NASA Verified</span>
          </div>
        )}
      </div>

      {/* Info Body */}
      <div className="flex flex-1 flex-col justify-between p-4">
        {/* Name and description */}
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-[14px] font-bold leading-snug text-foreground group-hover:text-secondary transition-colors">
              {planet.name}
            </h3>
            <span className="font-mono text-[9px] text-muted-foreground bg-white/5 rounded px-1.5 py-0.2">
              Yr: {planet.discoveryYear}
            </span>
          </div>
          
          {/* Quick Scientific Telemetry Row */}
          <div className="grid grid-cols-3 gap-1 py-1.5 border-y border-white/5 font-mono text-[8px] text-muted-foreground text-center">
            <div className="flex flex-col border-r border-white/5">
              <span className="text-[10px] text-white/80 font-bold">
                {planet.distance.toLocaleString()} ly
              </span>
              <span>Distance</span>
            </div>
            <div className="flex flex-col border-r border-white/5">
              <span className="text-[10px] text-white/80 font-bold">
                {planet.radius} {planet.radiusUnit}
              </span>
              <span>Radius</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-white/80 font-bold">
                {planet.temperature} K
              </span>
              <span>Surface Temp</span>
            </div>
          </div>
        </div>

        {/* Rarity Stars */}
        <div className="flex items-center gap-0.5 py-2">
          {Array.from({ length: 5 }).map((_, i) => {
            const count = 
              planet.rarity === "Legendary" ? 5 : 
              planet.rarity === "Epic" ? 4 : 
              planet.rarity === "Rare" ? 3 : 
              planet.rarity === "Uncommon" ? 2 : 1;
            return (
              <Star
                key={i}
                className={`h-2.5 w-2.5 ${i < count ? `fill-current ${styles.text}` : "text-white/10"}`}
              />
            );
          })}
          <span className="ml-1.5 font-mono text-[8px] text-muted-foreground uppercase">
            Supply: {planet.availableSupply}/{planet.maxSupply}
          </span>
        </div>

        {/* Price & Wallet details */}
        <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1 text-left">
          <div>
            <div className="font-mono text-[8px] text-muted-foreground uppercase tracking-wider">Price</div>
            <div className="font-display text-base font-black text-foreground">
              {price.toLocaleString()} <span className="text-xs text-secondary font-medium">XLM</span>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[8px] text-muted-foreground uppercase tracking-wider">Current Owner</div>
            <div className="font-mono text-[10px] text-white/80 font-semibold">
              {isUserOwned ? "YOU" : owner.slice(0, 6) + "..." + owner.slice(-3)}
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="flex gap-2 mt-3 pt-1">
          {isUserOwned ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(planet.id);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2 text-[11px] font-semibold text-white transition hover:bg-white/10"
            >
              <Info className="h-3.5 w-3.5" />
              Manage Asset
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onBuy) onBuy(planet.id);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-bold text-white transition"
              style={{
                background: `linear-gradient(135deg, ${planet.color}d5, ${planet.color}88)`,
                boxShadow: `0 0 15px ${planet.color}25`,
              }}
            >
              Buy Now
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(planet.id);
            }}
            className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 transition hover:bg-white/10 hover:border-white/20"
          >
            <Eye className="h-3.5 w-3.5 text-muted-foreground hover:text-white transition" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

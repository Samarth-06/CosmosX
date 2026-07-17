import { useEffect, useState } from "react";
import { ShieldCheck, ExternalLink, Loader2, FileCheck2, CircleDashed } from "lucide-react";
import {
  ACHIEVEMENT_CONTRACT_ID,
  explorerContractUrl,
  explorerTxUrl,
} from "@/lib/stellar/network";
import { getAchievementProof, type AchievementProof } from "./proof-store";
import { checkHasAchievement } from "./readAchievement";

function shortenMiddle(s: string, head = 6, tail = 6): string {
  return s.length > head + tail ? `${s.slice(0, head)}…${s.slice(-tail)}` : s;
}

type VerifyState = "idle" | "checking" | "verified" | "unverified";

/**
 * A persistent, always-reachable proof surface (lives on the dashboard). Unlike
 * the transient completion screen, this survives navigation so a player — or a
 * judge — can always re-find the on-chain proof.
 *
 * Always shows the deployed contract's explorer link. If the player has claimed
 * (persisted in proof-store), it also shows their claim transaction and does a
 * live, wallet-free on-chain re-verification via `has_achievement`.
 */
export function ProofScreen() {
  const [proof, setProof] = useState<AchievementProof | null>(null);
  const [verify, setVerify] = useState<VerifyState>("idle");

  // Load persisted proof on mount (client-only).
  useEffect(() => {
    setProof(getAchievementProof());
  }, []);

  // Independently re-verify on-chain whenever we have a claimed address.
  useEffect(() => {
    if (!proof?.address) return;
    let cancelled = false;
    setVerify("checking");
    checkHasAchievement(proof.address).then((ok) => {
      if (!cancelled) setVerify(ok ? "verified" : "unverified");
    });
    return () => {
      cancelled = true;
    };
  }, [proof?.address]);

  return (
    <div className="rounded-2xl border border-white/8 bg-gradient-to-b from-slate-900/60 to-[#040816]/80 p-4">
      <div className="mb-3 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-secondary" />
        <span className="font-display text-sm font-semibold">On-Chain Proof</span>
        <span className="ml-auto rounded-full border border-cyan-500/25 bg-cyan-500/10 px-2 py-0.5 font-mono text-[8px] uppercase tracking-wider text-secondary">
          Stellar Testnet
        </span>
      </div>

      {/* Contract link — always present, even before any claim. */}
      {ACHIEVEMENT_CONTRACT_ID ? (
        <a
          href={explorerContractUrl(ACHIEVEMENT_CONTRACT_ID)}
          target="_blank"
          rel="noreferrer"
          className="group flex items-center justify-between gap-2 rounded-xl border border-white/6 bg-white/[0.03] px-3 py-2.5 transition hover:border-white/12"
        >
          <div className="min-w-0">
            <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
              Achievement Contract
            </div>
            <div className="mt-0.5 font-mono text-[11px] text-secondary truncate">
              {shortenMiddle(ACHIEVEMENT_CONTRACT_ID)}
            </div>
          </div>
          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition group-hover:text-secondary" />
        </a>
      ) : (
        <p className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 font-mono text-[10px] text-amber-300/80">
          No contract configured (VITE_ACHIEVEMENT_CONTRACT_ID unset).
        </p>
      )}

      {/* Claim record — only once the player has minted. */}
      {proof ? (
        <div className="mt-2 space-y-2">
          <a
            href={explorerTxUrl(proof.txHash)}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center justify-between gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-3 py-2.5 transition hover:border-emerald-400/40"
          >
            <div className="min-w-0">
              <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                Your Claim Transaction
              </div>
              <div className="mt-0.5 font-mono text-[11px] text-emerald-300 truncate">
                {shortenMiddle(proof.txHash, 8, 8)}
              </div>
            </div>
            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition group-hover:text-emerald-300" />
          </a>

          {/* Live, wallet-free re-verification straight from the contract. */}
          <div className="flex items-center gap-1.5 px-1">
            {verify === "checking" && (
              <>
                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                <span className="font-mono text-[10px] text-muted-foreground">
                  Verifying on-chain…
                </span>
              </>
            )}
            {verify === "verified" && (
              <>
                <FileCheck2 className="h-3 w-3 text-emerald-400" />
                <span className="font-mono text-[10px] text-emerald-400">
                  Verified on-chain — this wallet holds the achievement.
                </span>
              </>
            )}
            {verify === "unverified" && (
              <>
                <CircleDashed className="h-3 w-3 text-amber-400" />
                <span className="font-mono text-[10px] text-amber-300/90">
                  Couldn't confirm on-chain right now (RPC busy, or contract was
                  reset). The transaction link above is still valid proof.
                </span>
              </>
            )}
          </div>
        </div>
      ) : (
        <p className="mt-2 px-1 font-mono text-[10px] leading-relaxed text-muted-foreground">
          Finish Mercury and claim your achievement to see your personal proof
          transaction here.
        </p>
      )}
    </div>
  );
}

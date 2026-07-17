/**
 * Persists a record of the player's last successful on-chain achievement claim
 * so their "proof" survives navigating away from the completion screen (e.g. to
 * the dashboard). localStorage-only, matching the rest of CosmosX's client-side
 * state model. SSR-guarded throughout.
 */

const STORAGE_KEY = "cosmosx-achievement-proof";

export interface AchievementProof {
  /** The wallet address that claimed. */
  address: string;
  /** The mint transaction hash (proof on Stellar Expert). */
  txHash: string;
  /** ISO timestamp of when it was claimed (for display). */
  claimedAt: string;
}

export function saveAchievementProof(proof: AchievementProof): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(proof));
  } catch {
    // Storage full/blocked — proof persistence is best-effort, not critical.
  }
}

export function getAchievementProof(): AchievementProof | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AchievementProof;
    if (parsed && parsed.address && parsed.txHash) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function clearAchievementProof(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

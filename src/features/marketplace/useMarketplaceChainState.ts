import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchMarketplaceChainSnapshot,
  type MarketplaceChainSnapshot,
} from "@/features/marketplace/readMarketplace";
import { isContractConfigured } from "@/lib/stellar/marketplace-contract";

export type ChainReadStatus =
  | "disabled" // contract not configured — use localStorage
  | "loading"
  | "ok"
  | "error";

export interface UseMarketplaceChainState {
  status: ChainReadStatus;
  /** True when live chain data should drive ownership / listings / offers. */
  ready: boolean;
  ownedPlanets: string[];
  owners: Record<string, string>;
  listings: MarketplaceChainSnapshot["listings"];
  offers: MarketplaceChainSnapshot["offers"];
  registeredIds: string[];
  mintedIds: string[];
  admin: string | null;
  syncedAt: number | null;
  /** Connected wallet matches on-chain get_admin(). */
  isAdmin: boolean;
  error: string | null;
  loading: boolean;
  /** Re-read from Soroban (call after every successful marketplace write). */
  refresh: () => Promise<void>;
}

const EMPTY: MarketplaceChainSnapshot = {
  ownedPlanets: [],
  owners: {},
  listings: [],
  offers: [],
  registeredIds: [],
  mintedIds: [],
  admin: null,
  syncedAt: 0,
};

/**
 * Live marketplace ownership / listings / offers (Phase 5).
 *
 * When the contract is configured, blockchain data is the source of truth.
 * On RPC failure the hook surfaces status "error" and `ready` stays false so
 * the UI keeps the localStorage fallback — never crashes, never fabricates.
 */
export function useMarketplaceChainState(
  walletAddress: string | null | undefined,
): UseMarketplaceChainState {
  const enabled = isContractConfigured();
  const [snapshot, setSnapshot] = useState<MarketplaceChainSnapshot>(EMPTY);
  const [status, setStatus] = useState<ChainReadStatus>(
    enabled ? "loading" : "disabled",
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);

  const load = useCallback(async () => {
    if (!isContractConfigured()) {
      setStatus("disabled");
      setSnapshot(EMPTY);
      setError(null);
      setLoading(false);
      return;
    }

    const id = ++requestId.current;
    setLoading(true);
    const next = await fetchMarketplaceChainSnapshot(walletAddress ?? null);
    if (id !== requestId.current) return;

    if (next) {
      setSnapshot(next);
      setStatus("ok");
      setError(null);
    } else {
      setStatus((prev) => (prev === "ok" ? "ok" : "error"));
      setError("Could not read marketplace state from Testnet RPC.");
    }
    setLoading(false);
  }, [walletAddress]);

  useEffect(() => {
    if (!enabled) {
      requestId.current++;
      setStatus("disabled");
      setSnapshot(EMPTY);
      setError(null);
      setLoading(false);
      return;
    }
    void load();
  }, [enabled, load]);

  const ready = enabled && status === "ok";
  const isAdmin = !!(
    walletAddress &&
    snapshot.admin &&
    walletAddress === snapshot.admin
  );

  return {
    status,
    ready,
    ownedPlanets: snapshot.ownedPlanets,
    owners: snapshot.owners,
    listings: snapshot.listings,
    offers: snapshot.offers,
    registeredIds: snapshot.registeredIds,
    mintedIds: snapshot.mintedIds,
    admin: snapshot.admin,
    syncedAt: snapshot.syncedAt || null,
    isAdmin,
    error,
    loading,
    refresh: load,
  };
}

import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchXlmBalance,
  type BalanceResult,
  type BalanceStatus,
} from "@/lib/stellar/balance";

/**
 * Live Testnet XLM balance for a connected wallet address (Phase 5, Objective 3).
 *
 * The wallet is the single source of truth for spendable XLM. This hook reads
 * the real native balance from Horizon and re-reads it:
 *   • whenever the connected address changes (connect / disconnect / switch), and
 *   • on demand via refresh() — called after every marketplace transaction so the
 *     HUD reflects the new on-chain balance without a page reload.
 *
 * It never throws and never fabricates a number: on RPC failure it surfaces
 * status "error" (keeping the last known xlm), on an unfunded account "unfunded"
 * (xlm 0), and with no wallet "disconnected".
 */
export interface UseXlmBalance {
  /** Native XLM balance as a decimal number (0 when disconnected/unfunded). */
  xlm: number;
  status: BalanceStatus;
  /** True while a fetch is in flight (initial load or refresh). */
  loading: boolean;
  /** Error message when status === "error", else null. */
  error: string | null;
  /** Re-read the balance from Horizon now (e.g. after a transaction). */
  refresh: () => Promise<void>;
}

export function useXlmBalance(address: string | null | undefined): UseXlmBalance {
  const [result, setResult] = useState<BalanceResult>({
    status: address ? "ok" : "disconnected",
    xlm: 0,
  });
  const [loading, setLoading] = useState(false);

  // Guard against out-of-order responses: only the latest request may commit.
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    const next = await fetchXlmBalance(address);
    // Ignore a stale response if a newer request started meanwhile.
    if (id !== requestId.current) return;
    setResult((prev) =>
      // Preserve the last good number on a transient error so the HUD doesn't
      // flicker to 0 during an RPC hiccup — but still report the error status.
      next.status === "error" ? { ...next, xlm: prev.xlm } : next,
    );
    setLoading(false);
  }, [address]);

  useEffect(() => {
    if (!address) {
      requestId.current++; // cancel any in-flight commit
      setResult({ status: "disconnected", xlm: 0 });
      setLoading(false);
      return;
    }
    void load();
  }, [address, load]);

  return {
    xlm: result.xlm,
    status: result.status,
    loading,
    error: result.status === "error" ? result.error ?? "Balance unavailable" : null,
    refresh: load,
  };
}

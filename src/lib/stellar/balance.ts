// ═══════════════════════════════════════════════════════════════════════════
// CosmosX — Real Testnet XLM Balance Reader  (Phase 5, Objective 3)
// ═══════════════════════════════════════════════════════════════════════════
//
// The connected wallet is the single source of truth for how much XLM a player
// has. This module reads the *real* native (XLM) balance of a Stellar account
// straight from Horizon, replacing the simulated `walletBalance` credit that
// marketplace-store.ts seeds for local/dev mode.
//
// WHY HORIZON (not the Soroban RPC)
// ─────────────────────────────────
// The app already points VITE_STELLAR_RPC_URL at the *Soroban* RPC
// (soroban-testnet.stellar.org) for contract calls. Classic account balances,
// however, live on Horizon. We derive the Horizon base URL from the configured
// network (Testnet → horizon-testnet, Public → horizon.stellar.org) and allow
// an explicit override via VITE_STELLAR_HORIZON_URL for private/self-hosted
// Horizon instances. No new dependency: a plain fetch against the REST endpoint
// keeps this out of the SSR-fragile wallet-kit graph.
//
// FAILURE MODEL
// ─────────────
// Every failure mode returns a typed result rather than throwing, so the UI can
// always render *something* truthful:
//   • no address           → { status: "disconnected" }
//   • account not funded    → { status: "unfunded", xlm: 0 }  (404 from Horizon)
//   • RPC/network failure   → { status: "error", error }
//   • success               → { status: "ok", xlm }
// The wallet is the source of truth; when we cannot reach it we say so, we never
// fabricate a number.

import { STELLAR_NETWORK } from "@/lib/stellar/network";

/** Horizon base URL: explicit override, else derived from the active network. */
export const HORIZON_URL: string =
  (import.meta.env.VITE_STELLAR_HORIZON_URL as string) ||
  (STELLAR_NETWORK === "PUBLIC"
    ? "https://horizon.stellar.org"
    : "https://horizon-testnet.stellar.org");

export type BalanceStatus = "ok" | "disconnected" | "unfunded" | "error";

export interface BalanceResult {
  status: BalanceStatus;
  /** Native XLM balance as a decimal number (whole + fractional XLM). */
  xlm: number;
  /** Present only when status === "error". */
  error?: string;
}

interface HorizonBalanceLine {
  asset_type: string;
  balance: string;
}

interface HorizonAccountResponse {
  balances?: HorizonBalanceLine[];
}

/**
 * Read the real native XLM balance of `address` from Horizon.
 *
 * Never throws. On an unfunded account (Horizon 404) returns xlm: 0 with
 * status "unfunded" — that is a truthful "this account exists in the wallet but
 * holds no XLM yet" signal, distinct from a network error.
 */
export async function fetchXlmBalance(
  address: string | null | undefined,
): Promise<BalanceResult> {
  if (!address) {
    return { status: "disconnected", xlm: 0 };
  }

  try {
    const res = await fetch(`${HORIZON_URL}/accounts/${address}`, {
      headers: { Accept: "application/json" },
    });

    // A brand-new (never funded) account is a 404 on Horizon — not an error.
    if (res.status === 404) {
      return { status: "unfunded", xlm: 0 };
    }

    if (!res.ok) {
      return {
        status: "error",
        xlm: 0,
        error: `Horizon responded ${res.status}`,
      };
    }

    const data = (await res.json()) as HorizonAccountResponse;
    const native = data.balances?.find((b) => b.asset_type === "native");
    const xlm = native ? Number.parseFloat(native.balance) : 0;

    return { status: "ok", xlm: Number.isFinite(xlm) ? xlm : 0 };
  } catch (err) {
    console.error("[stellar] fetchXlmBalance failed:", err);
    return {
      status: "error",
      xlm: 0,
      error:
        err instanceof Error
          ? err.message
          : "Could not reach Horizon to read balance.",
    };
  }
}

/** Format an XLM amount for display: thousands separators, up to 2 decimals. */
export function formatXlm(xlm: number): string {
  return xlm.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

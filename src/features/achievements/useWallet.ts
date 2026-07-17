import { useSyncExternalStore, useCallback } from "react";
import { getWalletKit } from "@/lib/stellar/walletKit";

const STORAGE_KEY = "cosmosx-wallet-address";

/**
 * Wallet connection is app-wide state, not per-component: the connect button
 * and the mint button must agree on "who is connected." So the source of truth
 * lives in this module-level store, and every `useWallet()` caller subscribes
 * to it via `useSyncExternalStore`. Connect in one place, and every consumer
 * re-renders with the new address.
 *
 * Written against Stellar Wallets Kit 2.5.0: connecting is a single
 * `authModal()` call returning `{ address }` (the older
 * `openModal({ onWalletSelected })` callback API no longer exists).
 */

interface WalletState {
  address: string | null;
  connecting: boolean;
  error: string | null;
}

let state: WalletState = {
  // Lazily seed from localStorage so a session survives page navigation
  // without re-prompting. Guarded for SSR.
  address:
    typeof window !== "undefined"
      ? window.localStorage.getItem(STORAGE_KEY)
      : null,
  connecting: false,
  error: null,
};

const listeners = new Set<() => void>();

function setState(patch: Partial<WalletState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): WalletState {
  return state;
}

// SSR renders with a stable "disconnected" snapshot (never reads localStorage).
const SERVER_SNAPSHOT: WalletState = {
  address: null,
  connecting: false,
  error: null,
};
function getServerSnapshot(): WalletState {
  return SERVER_SNAPSHOT;
}

async function connect(): Promise<void> {
  setState({ error: null, connecting: true });
  try {
    const kit = await getWalletKit();
    // authModal opens the wallet picker, sets the chosen wallet active, and
    // returns its address in one call.
    const { address } = await kit.authModal();
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, address);
    }
    setState({ address, connecting: false });
  } catch (err) {
    // The user dismissing the modal without choosing a wallet also rejects
    // here — treat that as a benign cancel, not a hard error.
    if (isUserCancel(err)) {
      setState({ connecting: false });
    } else {
      setState({
        connecting: false,
        error:
          err instanceof Error ? err.message : "Failed to connect wallet.",
      });
    }
  }
}

async function disconnect(): Promise<void> {
  try {
    const kit = await getWalletKit();
    await kit.disconnect();
  } catch {
    // Best-effort; clearing local state below is what actually matters.
  }
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  setState({ address: null, error: null });
}

export function useWallet() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return {
    address: snapshot.address,
    connecting: snapshot.connecting,
    error: snapshot.error,
    connect: useCallback(connect, []),
    disconnect: useCallback(disconnect, []),
  };
}

/** Heuristic for "user closed the modal / declined" vs a real failure. */
function isUserCancel(err: unknown): boolean {
  const msg = (
    err instanceof Error ? err.message : String(err ?? "")
  ).toLowerCase();
  return (
    msg.includes("closed") ||
    msg.includes("cancel") ||
    msg.includes("dismiss") ||
    msg.includes("rejected") ||
    msg.includes("no wallet selected")
  );
}

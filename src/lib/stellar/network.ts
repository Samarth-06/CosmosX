/**
 * Stellar network configuration — the single source of truth for which network
 * CosmosX talks to. Every value comes from Vite env vars (see `.env.local` /
 * `.env.testnet.example`) so a Testnet reset or a future Mainnet switch is a
 * config change, never a code change.
 *
 * This file is deliberately free of any wallet/DOM/browser dependency so it is
 * safe to import from anywhere, including during SSR.
 */

export const STELLAR_NETWORK = import.meta.env.VITE_STELLAR_NETWORK as string;
export const STELLAR_NETWORK_PASSPHRASE = import.meta.env
  .VITE_STELLAR_NETWORK_PASSPHRASE as string;
export const STELLAR_RPC_URL = import.meta.env.VITE_STELLAR_RPC_URL as string;
export const ACHIEVEMENT_CONTRACT_ID = import.meta.env
  .VITE_ACHIEVEMENT_CONTRACT_ID as string;

/** Stellar Expert base URL for the configured network (testnet vs public). */
export const EXPLORER_BASE =
  STELLAR_NETWORK === "PUBLIC"
    ? "https://stellar.expert/explorer/public"
    : "https://stellar.expert/explorer/testnet";

export function explorerTxUrl(hash: string): string {
  return `${EXPLORER_BASE}/tx/${hash}`;
}

export function explorerContractUrl(contractId: string): string {
  return `${EXPLORER_BASE}/contract/${contractId}`;
}

if (!ACHIEVEMENT_CONTRACT_ID) {
  console.warn(
    "[stellar] VITE_ACHIEVEMENT_CONTRACT_ID is not set — mint calls will fail. " +
      "Copy .env.testnet.example to .env.local and set the deployed contract ID.",
  );
}

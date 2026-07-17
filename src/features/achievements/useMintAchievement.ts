import { useState, useCallback } from "react";
import { contract } from "@stellar/stellar-sdk";
import { getWalletKit } from "@/lib/stellar/walletKit";
import { saveAchievementProof } from "./proof-store";
import {
  STELLAR_NETWORK_PASSPHRASE,
  STELLAR_RPC_URL,
  ACHIEVEMENT_CONTRACT_ID,
} from "@/lib/stellar/network";

/**
 * Typed view of our Achievement contract's client. `contract.Client.from()`
 * builds the methods dynamically from the on-chain spec at runtime, so the
 * base `Client` type doesn't statically know them — we describe the two
 * methods we call here and cast to this interface. Each returns an
 * `AssembledTransaction<T>` whose `.result` holds the decoded return value.
 */
interface AchievementClient extends contract.Client {
  mint: (args: { to: string }) => Promise<contract.AssembledTransaction<null>>;
  has_achievement: (args: {
    who: string;
  }) => Promise<contract.AssembledTransaction<boolean>>;
}

/**
 * The mint action's lifecycle. Every state maps to distinct, visible UI text —
 * there is never a silent/stuck state.
 *   idle       → nothing happening yet
 *   building   → simulating + assembling the transaction against RPC
 *   signing    → waiting for the player to approve in their wallet (Freighter)
 *   submitting → broadcast to Testnet, polling for final ledger inclusion
 *   success    → confirmed on-ledger; txHash available
 *   error      → anything failed; error message available
 */
export type MintStatus =
  | "idle"
  | "building"
  | "signing"
  | "submitting"
  | "success"
  | "error";

/**
 * Drives the on-chain achievement mint from the player's connected wallet.
 *
 * Because our contract's `mint(to)` requires `to.require_auth()` and the player
 * is BOTH the transaction source and the required authorizer, a single wallet
 * signature on the transaction envelope satisfies the auth — no multi-party
 * `signAuthEntries` dance is needed. We wire the wallet-kit's `signTransaction`
 * / `signAuthEntry` straight into the SDK client (their signatures match the
 * SDK's `SignTransaction` / `SignAuthEntry` types exactly), then call
 * `signAndSend`, which broadcasts and polls for final status internally.
 *
 * Written against @stellar/stellar-sdk 16.x (`contract.Client.from`) and
 * stellar-wallets-kit 2.5.0 (static kit).
 */
export function useMintAchievement() {
  const [status, setStatus] = useState<MintStatus>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus("idle");
    setTxHash(null);
    setError(null);
  }, []);

  const mint = useCallback(async (playerAddress: string) => {
    setError(null);
    setTxHash(null);

    if (!ACHIEVEMENT_CONTRACT_ID) {
      setError(
        "No contract configured. Set VITE_ACHIEVEMENT_CONTRACT_ID in .env.local.",
      );
      setStatus("error");
      return;
    }

    try {
      const kit = await getWalletKit();

      setStatus("building");

      // A dynamic client that fetches the contract's interface from the network
      // at runtime — no generated bindings package to keep in sync on redeploy.
      // Wallet-kit signers are injected here so signAndSend can use them.
      const client = (await contract.Client.from({
        contractId: ACHIEVEMENT_CONTRACT_ID,
        networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
        rpcUrl: STELLAR_RPC_URL,
        publicKey: playerAddress,
        signTransaction: (xdr, opts) =>
          kit.signTransaction(xdr, {
            address: playerAddress,
            networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
            ...opts,
          }),
        signAuthEntry: (authEntry, opts) =>
          kit.signAuthEntry(authEntry, {
            address: playerAddress,
            networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
            ...opts,
          }),
      })) as AchievementClient;

      // Friendly preflight: if this address already claimed, say so clearly
      // instead of letting the contract's "already minted" panic surface raw.
      const already = await client.has_achievement({ who: playerAddress });
      if (already.result === true) {
        setError("This wallet has already claimed the Mercury achievement.");
        setStatus("error");
        return;
      }

      // Assemble + simulate the mint transaction.
      const tx = await client.mint({ to: playerAddress });

      // Signing happens inside signAndSend (wallet popup). Reflect that in UI.
      setStatus("signing");
      const sent = await tx.signAndSend({
        watcher: {
          // Once the wallet has signed and we've broadcast, move to submitting.
          onSubmitted: () => setStatus("submitting"),
        },
      });

      const hash = sent.sendTransactionResponse?.hash ?? null;
      setTxHash(hash);

      // signAndSend polls to finality; confirm the final ledger status.
      const finalStatus = sent.getTransactionResponse?.status;
      if (finalStatus && finalStatus !== "SUCCESS") {
        setError(`Transaction did not succeed on-ledger (status: ${finalStatus}).`);
        setStatus("error");
        return;
      }

      // Persist the claim so the proof survives navigation (dashboard, reloads).
      if (hash) {
        saveAchievementProof({
          address: playerAddress,
          txHash: hash,
          // Set client-side after the async work; avoids Date at module scope.
          claimedAt: new Date().toISOString(),
        });
      }

      setStatus("success");
    } catch (err) {
      console.error("[mint] failed:", err);
      setError(friendlyError(err));
      setStatus("error");
    }
  }, []);

  return { mint, status, txHash, error, reset };
}

/**
 * Turn raw SDK/wallet errors into player-readable messages for the common
 * failure modes, while never hiding the real error (it's always console.error'd
 * above for debugging).
 */
function friendlyError(err: unknown): string {
  const msg = (err instanceof Error ? err.message : String(err ?? "")).trim();
  const lower = msg.toLowerCase();

  if (
    lower.includes("user rejected") ||
    lower.includes("rejected") ||
    lower.includes("denied") ||
    lower.includes("declined")
  ) {
    return "You declined the signature in your wallet. Nothing was claimed — press Claim to try again.";
  }
  if (lower.includes("not installed") || lower.includes("no wallet")) {
    return "No wallet detected. Install the Freighter extension and reconnect.";
  }
  if (lower.includes("already minted")) {
    return "This wallet has already claimed the Mercury achievement.";
  }
  if (
    lower.includes("timeout") ||
    lower.includes("timed out") ||
    lower.includes("network") ||
    lower.includes("fetch")
  ) {
    return "Network/RPC timeout talking to Testnet. It may be busy — try again in a moment.";
  }
  if (lower.includes("contract not initialized") || lower.includes("not found")) {
    return "The achievement contract wasn't found on Testnet — it may have been reset. The contract ID in .env.local likely needs updating (redeploy).";
  }
  return msg || "Mint failed. See the browser console for details.";
}

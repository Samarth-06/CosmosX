import { contract } from "@stellar/stellar-sdk";
import {
  STELLAR_NETWORK_PASSPHRASE,
  STELLAR_RPC_URL,
  ACHIEVEMENT_CONTRACT_ID,
} from "@/lib/stellar/network";

/**
 * Read-only on-chain check: does `address` hold the Mercury achievement?
 *
 * `has_achievement` is a view call — it only simulates against RPC, so it needs
 * NO wallet and NO signature. This is what powers the proof screen's
 * "verified on-chain" badge: independent confirmation of the claim straight
 * from the contract, rather than trusting localStorage.
 *
 * Returns `false` (never throws) on any failure so callers can treat it as a
 * best-effort verification signal.
 */
export async function checkHasAchievement(address: string): Promise<boolean> {
  if (!ACHIEVEMENT_CONTRACT_ID || !address) return false;
  try {
    const client = (await contract.Client.from({
      contractId: ACHIEVEMENT_CONTRACT_ID,
      networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
      rpcUrl: STELLAR_RPC_URL,
    })) as contract.Client & {
      has_achievement: (args: {
        who: string;
      }) => Promise<contract.AssembledTransaction<boolean>>;
    };

    const tx = await client.has_achievement({ who: address });
    return tx.result === true;
  } catch (err) {
    console.error("[stellar] has_achievement check failed:", err);
    return false;
  }
}

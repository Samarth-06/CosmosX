// ═══════════════════════════════════════════════════════════════════════════
// CosmosX — Marketplace Soroban Contract Client
// ═══════════════════════════════════════════════════════════════════════════
//
// ARCHITECTURE
// ─────────────
// Every function in this file maps 1-to-1 to a method on the deployed
// marketplace Soroban contract (contracts/marketplace/src/lib.rs).
//
// Read-only calls: contract.Client.from() with no signer, then call .result
// Write calls:     contract.Client.from() + wallet-kit signers injected,
//                  then tx.signAndSend()
//
// The kit's signTransaction / signAuthEntry match the SDK's SignTransaction /
// SignAuthEntry types exactly (established by useMintAchievement.ts pattern).
//
// NAMING CONVENTION
// ─────────────────
// All prices at the TypeScript boundary are in XLM (human decimal units).
// Conversion to/from stroops (contract unit, i128) is done inside this file
// only — no caller ever touches stroops directly.
//
// GRACEFUL DEGRADATION
// ─────────────────────
// When VITE_MARKETPLACE_CONTRACT_ID / VITE_MARKETPLACE_TOKEN_ID are not set
// (i.e. the contract hasn't been deployed yet), isContractConfigured() returns
// false and all functions return safe stubs. The UI continues to work with the
// localStorage-backed marketplace-store.ts (stub mode).
// Once the contract is deployed and the env vars are set, all stub paths are
// bypassed automatically with no code change needed.

import { contract } from "@stellar/stellar-sdk";
import { getWalletKit } from "@/lib/stellar/walletKit";
import {
  STELLAR_NETWORK_PASSPHRASE,
  STELLAR_RPC_URL,
} from "@/lib/stellar/network";

// ── Price conversion ─────────────────────────────────────────────────────────

const STROOPS_PER_XLM = 10_000_000n;

/** Convert XLM (number) → stroops (bigint) */
export function xlmToStroops(xlm: number): bigint {
  return BigInt(Math.round(xlm)) * STROOPS_PER_XLM;
}

/** Convert stroops (bigint) → XLM (number) */
export function stroopsToXlm(stroops: bigint): number {
  return Number(stroops / STROOPS_PER_XLM);
}

// ── Contract addresses ────────────────────────────────────────────────────────

/** The deployed marketplace contract ID (from .env.local). */
export const MARKETPLACE_CONTRACT_ID: string =
  (import.meta.env.VITE_MARKETPLACE_CONTRACT_ID as string) ?? "";

/** The XLM Stellar Asset Contract ID on the active network. */
export const MARKETPLACE_TOKEN_ID: string =
  (import.meta.env.VITE_MARKETPLACE_TOKEN_ID as string) ?? "";

/** True when both contract IDs are configured and we can make real calls. */
export function isContractConfigured(): boolean {
  return MARKETPLACE_CONTRACT_ID.length > 0 && MARKETPLACE_TOKEN_ID.length > 0;
}

// ── Contract return types ─────────────────────────────────────────────────────

export interface ContractListing {
  price: bigint;          // stroops
  seller: string;         // G-address
  listed_at_ledger: number;
}

export interface ContractOffer {
  offer_id: bigint;
  asset_id: string;
  price: bigint;          // stroops
  bidder: string;         // G-address
  created_at_ledger: number;
}

export interface ContractAssetMetadata {
  name: string;
  asset_type: "Exoplanet" | "RocketSkin" | "Cosmetic";
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
  uri: string;
  max_supply: number;
}

// ── Call result wrapper ───────────────────────────────────────────────────────

export interface CallResult<T> {
  success: boolean;
  data?: T;
  txHash?: string;
  ledger?: number;
  error?: string;
}

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Build a read-only Soroban client (no wallet signer needed).
 * Used for queries: has_asset, get_listing, get_offers, owner_of, get_metadata.
 *
 * NOTE: contract.Client.from() fetches the on-chain contract spec at runtime,
 * so no generated bindings are needed. The returned client's method names and
 * arg shapes come directly from the deployed contract.
 */
async function readClient(): Promise<contract.Client> {
  return contract.Client.from({
    contractId: MARKETPLACE_CONTRACT_ID,
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
    rpcUrl: STELLAR_RPC_URL,
  });
}

/**
 * Build a signing Soroban client for the given `signerAddress`.
 * Injects the Stellar Wallets Kit's signTransaction / signAuthEntry so that
 * tx.signAndSend() can present the Freighter popup and broadcast atomically.
 */
async function writeClient(signerAddress: string): Promise<contract.Client> {
  const kit = await getWalletKit();
  return contract.Client.from({
    contractId: MARKETPLACE_CONTRACT_ID,
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
    rpcUrl: STELLAR_RPC_URL,
    publicKey: signerAddress,
    signTransaction: (xdr, opts) =>
      kit.signTransaction(xdr, {
        address: signerAddress,
        networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
        ...opts,
      }),
    signAuthEntry: (authEntry, opts) =>
      kit.signAuthEntry(authEntry, {
        address: signerAddress,
        networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
        ...opts,
      }),
  });
}

/**
 * Extract txHash and ledger sequence from a signAndSend() result.
 * Also validates that the final ledger status is SUCCESS — if the transaction
 * reached the ledger but was rejected (auth failure, contract error, etc.),
 * signAndSend() does NOT throw; we must check status ourselves.
 *
 * Throws an Error with a readable message on non-SUCCESS so callers' catch
 * blocks surface the real failure instead of returning { success: true }.
 */
function extractTxMeta(sent: contract.SentTransaction<unknown>): {
  txHash?: string;
  ledger?: number;
} {
  const txHash = sent.sendTransactionResponse?.hash ?? undefined;
  const getResp = sent.getTransactionResponse as
    | { ledger?: number; status?: string; resultXdr?: unknown }
    | undefined;
  const ledger = getResp?.ledger ?? undefined;
  const status = getResp?.status;

  // signAndSend polls to finality. If status is present and not SUCCESS,
  // the transaction was rejected on-ledger — throw so the catch block fires.
  if (status && status !== "SUCCESS") {
    throw new Error(
      `Transaction reached the ledger but was rejected (status: ${status}).` +
      (txHash ? ` txHash: ${txHash}` : ""),
    );
  }

  return { txHash, ledger };
}

/**
 * Turn raw SDK/wallet errors into user-readable messages.
 * Mirrors the pattern established in useMintAchievement.ts#friendlyError.
 */
function friendlyError(err: unknown): string {
  const msg = (err instanceof Error ? err.message : String(err ?? "")).trim();
  const lower = msg.toLowerCase();
  if (lower.includes("user rejected") || lower.includes("declined") || lower.includes("denied"))
    return "You declined the signature in Freighter. Nothing was submitted — try again.";
  if (lower.includes("not installed") || lower.includes("no wallet"))
    return "No wallet detected. Install Freighter and reconnect.";
  if (lower.includes("insufficient") || lower.includes("balance"))
    return "Insufficient XLM balance for this transaction.";
  if (lower.includes("timeout") || lower.includes("network") || lower.includes("fetch"))
    return "Network/RPC timeout talking to Testnet. Try again in a moment.";
  if (lower.includes("unreachablecodereached") || lower.includes("invalidaction"))
    return "Contract trapped (likely outdated Testnet WASM or invalid asset state). Re-deploy marketplace or check listing/ownership.";
  if (lower.includes("cannot buy your own") || lower.includes("cannotbuyownlisting") || lower.includes("#4"))
    return "You already own this asset — buying your own listing is not allowed.";
  if (lower.includes("not listed") || lower.includes("notlisted") || /error\(.*?1\)/.test(lower))
    return "This asset isn't listed for sale.";
  if (lower.includes("stale listing") || lower.includes("stalelisting"))
    return "This listing is stale (seller no longer owns the asset).";
  if (lower.includes("asset not found") || lower.includes("assetnotfound"))
    return "This asset isn't minted on-chain yet.";
  if (lower.includes("already registered") || lower.includes("alreadyregistered"))
    return "This asset ID is already registered.";
  if (lower.includes("max supply") || lower.includes("maxsupplyreached"))
    return "Max supply reached for this asset.";
  if (lower.includes("already minted") || lower.includes("alreadyminted"))
    return "This asset is already minted — transfer it instead of minting again.";
  if (lower.includes("not registered") || lower.includes("notregistered"))
    return "This asset isn't registered in the marketplace contract yet.";
  if (lower.includes("invalid price") || lower.includes("invalidprice"))
    return "Price must be greater than zero.";
  if (lower.includes("must delist") || lower.includes("mustdelistfirst"))
    return "Delist the asset before transferring.";
  if (lower.includes("cannot offer") || lower.includes("cannotofferownasset"))
    return "You already own this asset — offers are not allowed.";
  if (lower.includes("offer not found") || lower.includes("offernotfound"))
    return "That offer was not found on-chain.";
  if (lower.includes("already listed"))
    return "This asset is already listed. Delist it first.";
  if (lower.includes("not found"))
    return "Asset or offer not found on-chain.";
  return msg || "Transaction failed. See the browser console for details.";
}

// ═══════════════════════════════════════════════════════════════════════════
// READ-ONLY CONTRACT CALLS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * [READ] Check whether `address` owns the asset with `assetId`.
 * Contract method: has_asset(address: Address, asset_id: Symbol) → bool
 */
export async function contractHasAsset(
  assetId: string,
  address: string,
): Promise<boolean> {
  if (!isContractConfigured()) {
    console.debug(`[marketplace-contract] contractHasAsset stub — ${assetId}`);
    return false;
  }
  try {
    const client = await readClient() as contract.Client & {
      has_asset: (args: { address: string; asset_id: string }) => Promise<contract.AssembledTransaction<boolean>>;
    };
    const tx = await client.has_asset({ address, asset_id: assetId });
    return tx.result;
  } catch (err) {
    console.error("[marketplace-contract] contractHasAsset failed:", err);
    return false;
  }
}

/**
 * [READ] Get the current listing for an asset, or null if not listed.
 * Contract method: get_listing(asset_id: Symbol) → Option<Listing>
 */
export async function contractGetListing(
  assetId: string,
): Promise<ContractListing | null> {
  if (!isContractConfigured()) {
    console.debug(`[marketplace-contract] contractGetListing stub — ${assetId}`);
    return null;
  }
  try {
    const client = await readClient() as contract.Client & {
      get_listing: (args: { asset_id: string }) => Promise<contract.AssembledTransaction<ContractListing | null>>;
    };
    const tx = await client.get_listing({ asset_id: assetId });
    return tx.result;
  } catch (err) {
    console.error("[marketplace-contract] contractGetListing failed:", err);
    return null;
  }
}

/**
 * [READ] Get all open offers on an asset.
 * Contract method: get_offers(asset_id: Symbol) → Vec<Offer>
 */
export async function contractGetOffers(
  assetId: string,
): Promise<ContractOffer[]> {
  if (!isContractConfigured()) {
    console.debug(`[marketplace-contract] contractGetOffers stub — ${assetId}`);
    return [];
  }
  try {
    const client = await readClient() as contract.Client & {
      get_offers: (args: { asset_id: string }) => Promise<contract.AssembledTransaction<ContractOffer[]>>;
    };
    const tx = await client.get_offers({ asset_id: assetId });
    return tx.result ?? [];
  } catch (err) {
    console.error("[marketplace-contract] contractGetOffers failed:", err);
    return [];
  }
}

/**
 * [READ] Get minted supply for an asset (0 = not minted).
 * Contract method: get_minted_supply(asset_id: Symbol) → u32
 * Safe on unregistered / unminted assets — never traps.
 */
export async function contractGetMintedSupply(
  assetId: string,
): Promise<number> {
  if (!isContractConfigured()) {
    console.debug(`[marketplace-contract] contractGetMintedSupply stub — ${assetId}`);
    return 0;
  }
  try {
    const client = (await readClient()) as contract.Client & {
      get_minted_supply: (args: {
        asset_id: string;
      }) => Promise<contract.AssembledTransaction<number>>;
    };
    const tx = await client.get_minted_supply({ asset_id: assetId });
    return Number(tx.result ?? 0);
  } catch (err) {
    console.error("[marketplace-contract] contractGetMintedSupply failed:", err);
    return 0;
  }
}

/**
 * [READ] Get the on-chain owner of an asset.
 * Contract method: owner_of(asset_id: Symbol) → Option<Address>
 * Returns null when not minted / not found. Never treats a trap as fatal —
 * callers should prefer checking get_minted_supply first on older WASM that
 * still panics for unminted assets.
 */
export async function contractOwnerOf(
  assetId: string,
): Promise<string | null> {
  if (!isContractConfigured()) {
    console.debug(`[marketplace-contract] contractOwnerOf stub — ${assetId}`);
    return null;
  }
  try {
    const client = await readClient() as contract.Client & {
      owner_of: (args: { asset_id: string }) => Promise<contract.AssembledTransaction<string | null>>;
    };
    const tx = await client.owner_of({ asset_id: assetId });
    return tx.result ?? null;
  } catch (err) {
    // Older deployed WASM panics (UnreachableCodeReached) for unminted assets.
    console.debug("[marketplace-contract] contractOwnerOf failed (treat as unminted):", err);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// WRITE CONTRACT CALLS  (require wallet signing via Freighter)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * [WRITE] List an owned asset for sale at `priceXlm`.
 * Signer must be the current owner.
 * Contract method: list(asset_id: Symbol, price: i128)
 */
export async function contractList(
  assetId: string,
  priceXlm: number,
  signerAddress: string,
): Promise<CallResult<void>> {
  if (!isContractConfigured()) {
    console.debug(
      `[marketplace-contract] contractList stub — ${priceXlm} XLM (${xlmToStroops(priceXlm)} stroops)`,
    );
    return { success: true };
  }
  try {
    const client = await writeClient(signerAddress) as contract.Client & {
      list: (args: { asset_id: string; price: bigint }) => Promise<contract.AssembledTransaction<void>>;
    };
    const tx = await client.list({
      asset_id: assetId,
      price: xlmToStroops(priceXlm),
    });
    const sent = await tx.signAndSend();
    const { txHash, ledger } = extractTxMeta(sent);
    return { success: true, txHash, ledger };
  } catch (err) {
    console.error("[marketplace-contract] contractList failed:", err);
    return { success: false, error: friendlyError(err) };
  }
}

/**
 * [WRITE] Cancel an active listing.
 * Signer must be the current seller.
 * Contract method: delist(asset_id: Symbol)
 */
export async function contractDelist(
  assetId: string,
  signerAddress: string,
): Promise<CallResult<void>> {
  if (!isContractConfigured()) {
    console.debug(`[marketplace-contract] contractDelist stub — ${assetId}`);
    return { success: true };
  }
  try {
    const client = await writeClient(signerAddress) as contract.Client & {
      delist: (args: { asset_id: string }) => Promise<contract.AssembledTransaction<void>>;
    };
    const tx = await client.delist({ asset_id: assetId });
    const sent = await tx.signAndSend();
    const { txHash, ledger } = extractTxMeta(sent);
    return { success: true, txHash, ledger };
  } catch (err) {
    console.error("[marketplace-contract] contractDelist failed:", err);
    return { success: false, error: friendlyError(err) };
  }
}

/**
 * [WRITE] Buy a listed asset at the current asking price.
 * Buyer signs once — the Soroban sub-invocation auth model means that single
 * Freighter approval covers both the buy() call and the XLM token.transfer().
 * Contract method: buy(asset_id: Symbol, buyer: Address)
 */
export async function contractBuy(
  assetId: string,
  buyerAddress: string,
): Promise<CallResult<void>> {
  if (!isContractConfigured()) {
    console.debug(
      `[marketplace-contract] contractBuy stub — ${buyerAddress} buying ${assetId}`,
    );
    return { success: true };
  }
  try {
    const client = await writeClient(buyerAddress) as contract.Client & {
      buy: (args: { asset_id: string; buyer: string }) => Promise<contract.AssembledTransaction<void>>;
    };
    const tx = await client.buy({ asset_id: assetId, buyer: buyerAddress });
    const sent = await tx.signAndSend();
    const { txHash, ledger } = extractTxMeta(sent);
    return { success: true, txHash, ledger };
  } catch (err) {
    console.error("[marketplace-contract] contractBuy failed:", err);
    return { success: false, error: friendlyError(err) };
  }
}

/**
 * [WRITE] Submit a buy offer at `priceXlm`.
 * NOTE: offers record intent on-chain but XLM is NOT escrowed at make_offer time.
 * The full payment occurs only when the asset owner calls accept_offer().
 * This is a known limitation documented in CONTRACTS.md.
 * Contract method: make_offer(asset_id: Symbol, price: i128, bidder: Address) → u64
 * Returns the on-chain offer_id assigned by the contract.
 */
export async function contractMakeOffer(
  assetId: string,
  priceXlm: number,
  bidderAddress: string,
): Promise<CallResult<bigint>> {
  if (!isContractConfigured()) {
    console.debug(
      `[marketplace-contract] contractMakeOffer stub — ${bidderAddress} → ${assetId} @ ${priceXlm} XLM`,
    );
    return { success: true, data: 0n };
  }
  try {
    const client = await writeClient(bidderAddress) as contract.Client & {
      make_offer: (args: { asset_id: string; price: bigint; bidder: string }) => Promise<contract.AssembledTransaction<bigint>>;
    };
    const tx = await client.make_offer({
      asset_id: assetId,
      price: xlmToStroops(priceXlm),
      bidder: bidderAddress,
    });
    const sent = await tx.signAndSend();
    const { txHash, ledger } = extractTxMeta(sent);
    // The AssembledTransaction result carries the offer_id returned by the contract
    return { success: true, data: tx.result, txHash, ledger };
  } catch (err) {
    console.error("[marketplace-contract] contractMakeOffer failed:", err);
    return { success: false, error: friendlyError(err) };
  }
}

/**
 * [WRITE] Accept an open offer. Caller must be the current owner.
 * Owner signs once — XLM transfer from bidder to owner is a sub-invocation
 * authorised by the bidder's prior offer signature recorded on-chain.
 * Contract method: accept_offer(asset_id: Symbol, offer_id: u64)
 */
export async function contractAcceptOffer(
  assetId: string,
  offerId: bigint,
  ownerAddress: string,
): Promise<CallResult<void>> {
  if (!isContractConfigured()) {
    console.debug(
      `[marketplace-contract] contractAcceptOffer stub — offer ${offerId} on ${assetId}`,
    );
    return { success: true };
  }
  try {
    const client = await writeClient(ownerAddress) as contract.Client & {
      accept_offer: (args: { asset_id: string; offer_id: bigint }) => Promise<contract.AssembledTransaction<void>>;
    };
    const tx = await client.accept_offer({
      asset_id: assetId,
      offer_id: offerId,
    });
    const sent = await tx.signAndSend();
    const { txHash, ledger } = extractTxMeta(sent);
    return { success: true, txHash, ledger };
  } catch (err) {
    console.error("[marketplace-contract] contractAcceptOffer failed:", err);
    return { success: false, error: friendlyError(err) };
  }
}

/**
 * [WRITE] Reject an open offer. Caller must be the current owner.
 * Contract method: reject_offer(asset_id: Symbol, offer_id: u64)
 */
export async function contractRejectOffer(
  assetId: string,
  offerId: bigint,
  ownerAddress: string,
): Promise<CallResult<void>> {
  if (!isContractConfigured()) {
    console.debug(
      `[marketplace-contract] contractRejectOffer stub — offer ${offerId} on ${assetId}`,
    );
    return { success: true };
  }
  try {
    const client = await writeClient(ownerAddress) as contract.Client & {
      reject_offer: (args: { asset_id: string; offer_id: bigint }) => Promise<contract.AssembledTransaction<void>>;
    };
    const tx = await client.reject_offer({
      asset_id: assetId,
      offer_id: offerId,
    });
    const sent = await tx.signAndSend();
    const { txHash, ledger } = extractTxMeta(sent);
    return { success: true, txHash, ledger };
  } catch (err) {
    console.error("[marketplace-contract] contractRejectOffer failed:", err);
    return { success: false, error: friendlyError(err) };
  }
}

/**
 * [WRITE] Transfer an asset directly to another address (no payment).
 * Asset must not be listed — delist first if needed.
 * Signer must be the current owner.
 * Contract method: transfer(asset_id: Symbol, to: Address)
 */
export async function contractTransfer(
  assetId: string,
  toAddress: string,
  signerAddress: string,
): Promise<CallResult<void>> {
  if (!isContractConfigured()) {
    console.debug(
      `[marketplace-contract] contractTransfer stub — ${assetId} → ${toAddress}`,
    );
    return { success: true };
  }
  try {
    const client = await writeClient(signerAddress) as contract.Client & {
      transfer: (args: { asset_id: string; to: string }) => Promise<contract.AssembledTransaction<void>>;
    };
    const tx = await client.transfer({ asset_id: assetId, to: toAddress });
    const sent = await tx.signAndSend();
    const { txHash, ledger } = extractTxMeta(sent);
    return { success: true, txHash, ledger };
  } catch (err) {
    console.error("[marketplace-contract] contractTransfer failed:", err);
    return { success: false, error: friendlyError(err) };
  }
}

/**
 * [READ] Get the marketplace admin address (Foundation / deployer).
 * Contract method: get_admin() → Address
 */
export async function contractGetAdmin(): Promise<string | null> {
  if (!isContractConfigured()) {
    console.debug("[marketplace-contract] contractGetAdmin stub");
    return null;
  }
  try {
    const client = (await readClient()) as contract.Client & {
      get_admin: () => Promise<contract.AssembledTransaction<string>>;
    };
    const tx = await client.get_admin();
    return tx.result ?? null;
  } catch (err) {
    console.error("[marketplace-contract] contractGetAdmin failed:", err);
    return null;
  }
}

/**
 * [WRITE] Register a new collectible asset type. Admin-only.
 * Contract method: register_asset(asset_id, metadata)
 *
 * ENCODING NOTE — AssetType and Rarity are Soroban `#[contracttype]` enums.
 * The Soroban SDK compiles these as XDR Union types (scSpecEntryUdtUnionV0).
 * The SDK nativeToUnion() requires `{ tag: "Exoplanet" }` — NOT the plain
 * string "Exoplanet". Passing a raw string hits stringToScVal, producing an
 * scvString/scvSymbol that the contract XDR deserializer rejects → metadata
 * is never stored → get_metadata returns null → mint_to returns NotRegistered.
 *
 * The { tag } wrapping is done here so AdminPanel and all call sites
 * continue to pass plain strings; the SDK encoding detail stays in one place.
 */
export async function contractRegisterAsset(
  assetId: string,
  metadata: {
    name: string;
    asset_type: "Exoplanet" | "RocketSkin" | "Cosmetic";
    rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
    uri: string;
    max_supply: number;
  },
  signerAddress: string,
): Promise<CallResult<void>> {
  if (!isContractConfigured()) {
    console.debug(`[marketplace-contract] contractRegisterAsset stub — ${assetId}`);
    return { success: true };
  }
  try {
    const client = (await writeClient(signerAddress)) as contract.Client & {
      register_asset: (args: {
        asset_id: string;
        // SDK requires union-tagged objects for #[contracttype] enum fields.
        metadata: {
          name: string;
          asset_type: { tag: string };
          rarity: { tag: string };
          uri: string;
          max_supply: number;
        };
      }) => Promise<contract.AssembledTransaction<void>>;
    };

    // Wrap enum strings in { tag } union objects required by the Soroban SDK.
    const sorobanMetadata = {
      name: metadata.name,
      asset_type: { tag: metadata.asset_type },
      rarity: { tag: metadata.rarity },
      uri: metadata.uri,
      max_supply: metadata.max_supply,
    };

    console.debug("[marketplace-contract] register_asset →", assetId, sorobanMetadata);

    const tx = await client.register_asset({
      asset_id: assetId,
      metadata: sorobanMetadata,
    });
    const sent = await tx.signAndSend();
    const { txHash, ledger } = extractTxMeta(sent);
    console.info(`[marketplace-contract] register_asset ✓ ${assetId} tx=${txHash ?? "—"}`);
    return { success: true, txHash, ledger };
  } catch (err) {
    console.error("[marketplace-contract] contractRegisterAsset failed:", err);
    return { success: false, error: friendlyError(err) };
  }
}

/**
 * [WRITE] Mint a registered asset to `toAddress`. Admin-only.
 * Contract method: mint_to(asset_id, to)
 *
 * NOTE: There is no burn() on this contract — document that in the Admin UI.
 */
export async function contractMintTo(
  assetId: string,
  toAddress: string,
  signerAddress: string,
): Promise<CallResult<void>> {
  if (!isContractConfigured()) {
    console.debug(
      `[marketplace-contract] contractMintTo stub — ${assetId} → ${toAddress}`,
    );
    return { success: true };
  }
  try {
    const client = (await writeClient(signerAddress)) as contract.Client & {
      mint_to: (args: {
        asset_id: string;
        to: string;
      }) => Promise<contract.AssembledTransaction<void>>;
    };
    const tx = await client.mint_to({ asset_id: assetId, to: toAddress });
    const sent = await tx.signAndSend();
    const { txHash, ledger } = extractTxMeta(sent);
    return { success: true, txHash, ledger };
  } catch (err) {
    console.error("[marketplace-contract] contractMintTo failed:", err);
    return { success: false, error: friendlyError(err) };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Asset ID helpers
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Maps an ExoplanetAsset.id (snake_case from exoplanets-data.ts) to the
 * Symbol key used on-chain. Both are snake_case — pass through directly.
 */
export function assetIdToSymbol(planetId: string): string {
  return planetId;
}

/**
 * Checks whether an asset is registered on-chain.
 * Calls get_metadata — if the contract returns a value, the asset is registered.
 * Falls back to true when unconfigured (Phase 3 / stub mode).
 */
export async function isAssetRegistered(assetId: string): Promise<boolean> {
  if (!isContractConfigured()) return true;
  try {
    const client = (await readClient()) as contract.Client & {
      get_metadata: (args: {
        asset_id: string;
      }) => Promise<contract.AssembledTransaction<ContractAssetMetadata | null>>;
    };
    const tx = await client.get_metadata({ asset_id: assetId });
    // New WASM returns Option; older WASM panics → catch below → false.
    return tx.result !== null && tx.result !== undefined;
  } catch {
    return false;
  }
}

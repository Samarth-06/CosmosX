/**
 * Derive buy/sell eligibility and human-readable ownership labels from
 * live chain (or localStorage fallback) state. Used by marketplace cards,
 * detail console, and the featured hero so Buy never fires when invalid.
 */

export type AssetTradeKind =
  | "not_registered"
  | "not_minted"
  | "owned_by_me"
  | "listed_by_me"
  | "owned_by_other"
  | "listed_by_other"
  | "unknown";

export interface AssetTradeStatus {
  kind: AssetTradeKind;
  /** Short badge for cards / owner registry. */
  label: string;
  /** Longer reason when an action is disabled. */
  detail: string;
  canBuy: boolean;
  canList: boolean;
  canOffer: boolean;
  buyDisabledReason: string | null;
  listDisabledReason: string | null;
  offerDisabledReason: string | null;
  /** True when the connected wallet is the on-chain owner. */
  isOwnedByMe: boolean;
  /** True when there is an active listing. */
  isListed: boolean;
  /** Owner address if minted, else null. */
  owner: string | null;
}

export interface AssetTradeInput {
  assetId: string;
  walletAddress: string | null | undefined;
  /** assetId → owner from chain (or inferred locally). */
  owners: Record<string, string>;
  /** Active listings (planetId + seller + price). */
  listings: { planetId: string; seller: string; price: number }[];
  /** When live reads are active; if false, treat missing owner as unknown/local. */
  liveMode: boolean;
  /** When true, owners map is authoritative (missing = not minted). */
  chainReady: boolean;
  /** Catalog IDs known registered on-chain (optional; sharpens not_registered). */
  registeredIds?: string[];
  /** Catalog IDs known minted on-chain (optional). */
  mintedIds?: string[];
}

export function getAssetTradeStatus(input: AssetTradeInput): AssetTradeStatus {
  const {
    assetId,
    walletAddress,
    owners,
    listings,
    liveMode,
    chainReady,
    registeredIds,
    mintedIds,
  } = input;
  const listing = listings.find((l) => l.planetId === assetId) ?? null;
  const owner = owners[assetId] ?? null;
  const isOwnedByMe = !!(walletAddress && owner && owner === walletAddress);
  const isListed = !!listing;
  const isRegistered =
    !registeredIds || registeredIds.length === 0
      ? true // unknown registration set — don't over-block
      : registeredIds.includes(assetId);
  const isKnownMinted = mintedIds ? mintedIds.includes(assetId) : !!owner;

  // Live chain: not in registered set.
  if (liveMode && chainReady && registeredIds && registeredIds.length > 0 && !isRegistered) {
    return {
      kind: "not_registered",
      label: "Not registered",
      detail: "This asset is not registered on the marketplace contract.",
      canBuy: false,
      canList: false,
      canOffer: false,
      buyDisabledReason: "Not registered",
      listDisabledReason: "Not registered",
      offerDisabledReason: "Not registered",
      isOwnedByMe: false,
      isListed: false,
      owner: null,
    };
  }

  // Live chain: registered (or registration unknown) but no owner → not minted.
  if (liveMode && chainReady && !owner && !isKnownMinted) {
    return {
      kind: "not_minted",
      label: "Not minted",
      detail: isRegistered
        ? "Registered on-chain but not minted yet. Buy / List / Offer are unavailable."
        : "This asset has not been minted on-chain yet.",
      canBuy: false,
      canList: false,
      canOffer: false,
      buyDisabledReason: "Not minted",
      listDisabledReason: "Not minted",
      offerDisabledReason: "Not minted",
      isOwnedByMe: false,
      isListed: false,
      owner: null,
    };
  }

  if (isOwnedByMe && isListed) {
    return {
      kind: "listed_by_me",
      label: "Listed by me",
      detail: "You own this asset and it is listed for sale.",
      canBuy: false,
      canList: true,
      canOffer: false,
      buyDisabledReason: "You already own this asset",
      listDisabledReason: null,
      offerDisabledReason: "You already own this asset",
      isOwnedByMe: true,
      isListed: true,
      owner,
    };
  }

  if (isOwnedByMe) {
    return {
      kind: "owned_by_me",
      label: "Owned by me",
      detail: "You own this asset. List it to make it available for purchase.",
      canBuy: false,
      canList: true,
      canOffer: false,
      buyDisabledReason: "You already own this asset",
      listDisabledReason: null,
      offerDisabledReason: "You already own this asset",
      isOwnedByMe: true,
      isListed: false,
      owner,
    };
  }

  if (owner && isListed) {
    return {
      kind: "listed_by_other",
      label: "Listed",
      detail: `Listed by ${shortAddr(listing!.seller)} at ${listing!.price.toLocaleString()} XLM.`,
      canBuy: true,
      canList: false,
      canOffer: true,
      buyDisabledReason: null,
      listDisabledReason: "You do not own this asset",
      offerDisabledReason: null,
      isOwnedByMe: false,
      isListed: true,
      owner,
    };
  }

  if (owner) {
    return {
      kind: "owned_by_other",
      label: "Owned by another wallet",
      detail: `Owned by ${shortAddr(owner)}. Not currently listed.`,
      canBuy: false,
      canList: false,
      canOffer: true,
      buyDisabledReason: "Not listed",
      listDisabledReason: "You do not own this asset",
      offerDisabledReason: null,
      isOwnedByMe: false,
      isListed: false,
      owner,
    };
  }

  // Stub / loading: no authoritative owner.
  return {
    kind: "unknown",
    label: liveMode ? "Syncing…" : "Local catalog",
    detail: liveMode
      ? "Waiting for on-chain ownership data."
      : "Contract not configured — localStorage fallback.",
    canBuy: false,
    canList: false,
    canOffer: false,
    buyDisabledReason: liveMode ? "Syncing marketplace state…" : "Not listed",
    listDisabledReason: "Connect a wallet that owns this asset",
    offerDisabledReason: liveMode ? "Syncing marketplace state…" : "Unavailable in stub mode",
    isOwnedByMe: false,
    isListed: false,
    owner: null,
  };
}

function shortAddr(address: string): string {
  if (address.length < 12) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

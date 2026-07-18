/**
 * Read-only marketplace chain snapshot (Phase 5).
 *
 * Mirrors the achievement pattern in readAchievement.ts: view calls against
 * Soroban RPC with no wallet and no signature. Ownership, listings, and
 * offers are fetched from the deployed marketplace contract and mapped into
 * the same shapes the UI already uses (PlanetListing / PlanetOffer).
 *
 * Never throws — callers treat failures as "use localStorage fallback".
 */

import { EXOPLANETS_DATA } from "@/lib/exoplanets-data";
import type { PlanetListing, PlanetOffer } from "@/lib/marketplace-store";
import {
  contractGetAdmin,
  contractGetListing,
  contractGetMintedSupply,
  contractGetOffers,
  contractOwnerOf,
  isAssetRegistered,
  isContractConfigured,
  stroopsToXlm,
} from "@/lib/stellar/marketplace-contract";

export interface MarketplaceChainSnapshot {
  /** Asset IDs owned by the connected wallet (empty when disconnected). */
  ownedPlanets: string[];
  /** assetId → on-chain owner G-address (only minted assets). */
  owners: Record<string, string>;
  listings: PlanetListing[];
  offers: PlanetOffer[];
  /** Catalog IDs that are registered on-chain. */
  registeredIds: string[];
  /** Catalog IDs that have an owner (minted). */
  mintedIds: string[];
  /** On-chain admin (Foundation / deployer). */
  admin: string | null;
  /** Wall-clock ms when this snapshot was fetched. */
  syncedAt: number;
}

function shortName(address: string): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

/**
 * Fetch ownership, listings, and offers for every catalog asset.
 * Safe to call without a connected wallet — ownedPlanets will be empty.
 */
export async function fetchMarketplaceChainSnapshot(
  walletAddress: string | null | undefined,
  assetIds: string[] = EXOPLANETS_DATA.map((p) => p.id),
): Promise<MarketplaceChainSnapshot | null> {
  if (!isContractConfigured()) return null;

  try {
    const owners: Record<string, string> = {};
    const listings: PlanetListing[] = [];
    const offers: PlanetOffer[] = [];
    const registeredIds: string[] = [];
    const mintedIds: string[] = [];

    const admin = await contractGetAdmin();

    await Promise.all(
      assetIds.map(async (assetId) => {
        // Check minted supply first so we never call owner_of on unminted
        // assets when the deployed WASM still panics (gj_504b case).
        const [supply, listing, chainOffers, registered] = await Promise.all([
          contractGetMintedSupply(assetId),
          contractGetListing(assetId),
          contractGetOffers(assetId),
          isAssetRegistered(assetId),
        ]);

        if (registered) registeredIds.push(assetId);

        let owner: string | null = null;
        if (supply > 0) {
          owner = await contractOwnerOf(assetId);
        }

        if (owner) {
          owners[assetId] = owner;
          mintedIds.push(assetId);
        }

        if (listing) {
          listings.push({
            planetId: assetId,
            price: stroopsToXlm(listing.price),
            seller: listing.seller,
            listedAt: listing.listed_at_ledger,
          });
        }

        for (const offer of chainOffers) {
          offers.push({
            id: String(offer.offer_id),
            planetId: assetId,
            price: stroopsToXlm(offer.price),
            bidder: offer.bidder,
            bidderName: shortName(offer.bidder),
            timestamp: offer.created_at_ledger,
          });
        }
      }),
    );

    const ownedPlanets = walletAddress
      ? assetIds.filter((id) => owners[id] === walletAddress)
      : [];

    return {
      ownedPlanets,
      owners,
      listings,
      offers,
      registeredIds,
      mintedIds,
      admin,
      syncedAt: Date.now(),
    };
  } catch (err) {
    console.error("[marketplace] fetchMarketplaceChainSnapshot failed:", err);
    return null;
  }
}

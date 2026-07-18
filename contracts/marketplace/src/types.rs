// ═══════════════════════════════════════════════════════════════════════════
// CosmosX Marketplace Contract — Shared Types
// ═══════════════════════════════════════════════════════════════════════════
//
// This module defines every data structure stored in or returned from the
// contract. All types carry `#[contracttype]` so Soroban serialises them
// automatically in/out of ledger storage and across contract-call boundaries.
//
// Design principle: types mirror the TypeScript data model in
//   src/lib/marketplace-store.ts
// so the frontend integration layer (marketplace-contract.ts) can decode them
// without any extra transformation.
//
// SEPARATION FROM ACHIEVEMENT CONTRACT
// ─────────────────────────────────────
// Achievement NFTs live in a completely separate contract (`achievement`).
// That contract has NO `transfer` function and is soulbound by design.
// This marketplace contract covers ONLY tradeable collectibles.
// The two contracts must never be merged.

#![allow(dead_code)]

use soroban_sdk::{contracttype, Address, String};

// ── Asset type enum ──────────────────────────────────────────────────────────
// Allows a single contract to manage multiple collectible categories.
// New variants can be added here in future phases without redeploying the
// achievement contract or changing the frontend's asset-type assumptions.

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum AssetType {
    /// Exoplanet NFTs — the primary collection for Phase 3.
    /// 12 NASA-sourced assets defined in exoplanets-data.ts.
    Exoplanet,
    /// Rocket skin cosmetics — reserved for future phases.
    RocketSkin,
    /// Generic cosmetic slot — reserved for future phases (avatars, badges).
    Cosmetic,
}

// ── Rarity enum ──────────────────────────────────────────────────────────────
// Mirrors the `NFTRarity` union type in NFTCard.tsx.

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum Rarity {
    Common,
    Uncommon,
    Rare,
    Epic,
    Legendary,
}

// ── Asset metadata ────────────────────────────────────────────────────────────
// Immutable per-asset description stored in persistent storage at registration.
// The `uri` field is a pointer to off-chain JSON (IPFS/Arweave in production;
// a static URL on Testnet) that contains the full asset manifest.

#[contracttype]
#[derive(Clone, Debug)]
pub struct AssetMetadata {
    /// Human-readable name (e.g. "Kepler-452b")
    pub name: String,
    /// Category of collectible
    pub asset_type: AssetType,
    /// Rarity tier
    pub rarity: Rarity,
    /// Off-chain metadata URI (IPFS URI or HTTPS URL on Testnet)
    pub uri: String,
    /// Maximum editions that can ever be minted
    pub max_supply: u32,
}

// ── Active marketplace listing ────────────────────────────────────────────────
// Created when an owner calls `list(asset_id, price)`.
// Destroyed by `delist`, `buy`, or `accept_offer`.
// Price is in stroops (1 XLM = 10_000_000 stroops).

#[contracttype]
#[derive(Clone, Debug)]
pub struct Listing {
    /// Asking price in stroops
    pub price: i128,
    /// Owner who created the listing (must match current owner at buy time)
    pub seller: Address,
    /// Ledger number when the listing was created (for UI display)
    pub listed_at_ledger: u32,
}

// ── Buy offer (bid) ───────────────────────────────────────────────────────────
// Created when a buyer calls `make_offer(asset_id, price)`.
// The bidder's XLM is NOT escrowed on-chain in Phase 3 (Testnet simplification).
// Phase 5 can add escrow via a separate token lock mechanism.

#[contracttype]
#[derive(Clone, Debug)]
pub struct Offer {
    /// Unique identifier for this specific offer (sequential u64)
    pub offer_id: u64,
    /// Asset this offer targets
    pub asset_id: soroban_sdk::Symbol,
    /// Offered price in stroops
    pub price: i128,
    /// Who made the offer
    pub bidder: Address,
    /// Ledger number when the offer was created
    pub created_at_ledger: u32,
}

// ── Storage keys ──────────────────────────────────────────────────────────────
// Keyed by DataKey variants which Soroban serialises to compact ledger keys.
// Instance storage: small, often-read globals (admin, counters, token address).
// Persistent storage: per-asset data (owner, listing, offers, metadata, supply).

#[contracttype]
#[derive(Clone, Debug)]
pub enum DataKey {
    // ── Instance (global) ───────────────────────────────────────────────────
    /// The admin address — set at initialize(), immutable thereafter.
    Admin,
    /// Address of the XLM Stellar Asset Contract (SAC).
    /// Set at initialize(); used to route payments atomically.
    TokenContract,
    /// Monotonically increasing counter for Offer IDs.
    NextOfferId,

    // ── Persistent (per-asset) ──────────────────────────────────────────────
    /// Current owner of an asset: asset_id → Address
    Owner(soroban_sdk::Symbol),
    /// Active listing for an asset: asset_id → Listing (absent = not listed)
    Listing(soroban_sdk::Symbol),
    /// All open offers on an asset: asset_id → Vec<Offer>
    Offers(soroban_sdk::Symbol),
    /// Immutable metadata registered by admin: asset_id → AssetMetadata
    Metadata(soroban_sdk::Symbol),
    /// How many editions have been minted: asset_id → u32
    MintedSupply(soroban_sdk::Symbol),
}

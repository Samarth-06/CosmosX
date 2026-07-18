// ═══════════════════════════════════════════════════════════════════════════
// CosmosX Marketplace Contract — Storage Helpers
// ═══════════════════════════════════════════════════════════════════════════
//
// Centralises all storage reads and writes so the main contract logic (lib.rs)
// never calls env.storage() directly. This makes it easy to audit access
// patterns and swap storage tiers (instance ↔ persistent ↔ temporary) in
// future phases without touching business logic.
//
// TTL EXTENSION
// ─────────────
// Persistent entries decay after ~30 days on Testnet if not bumped.
// Every write helper calls `env.storage().persistent().extend_ttl(...)` with a
// generous ledger budget so assets don't disappear during a demo week.
// Production would use Stellar's fee-based TTL renewal mechanism instead.

use soroban_sdk::{Address, Env, Symbol, Vec};

use crate::types::{AssetMetadata, DataKey, Listing, Offer};

// ── TTL constants (ledgers) ─────────────────────────────────────────────────
// Stellar closes one ledger every ~5 seconds.
// 30 days ≈ 30 * 24 * 3600 / 5 = 518_400 ledgers
const LEDGER_TTL_30_DAYS: u32 = 518_400;
const LEDGER_TTL_BUMP_THRESHOLD: u32 = 100_000; // start bumping when within this many ledgers of expiry

// ═══════════════════════════════════════════════════════════════════════════
// Instance storage (global, cheap to access)
// ═══════════════════════════════════════════════════════════════════════════

pub fn get_admin(env: &Env) -> Address {
    env.storage()
        .instance()
        .get(&DataKey::Admin)
        .expect("contract not initialized")
}

pub fn set_admin(env: &Env, admin: &Address) {
    env.storage().instance().set(&DataKey::Admin, admin);
}

pub fn has_admin(env: &Env) -> bool {
    env.storage().instance().has(&DataKey::Admin)
}

pub fn get_token(env: &Env) -> Address {
    env.storage()
        .instance()
        .get(&DataKey::TokenContract)
        .expect("token contract not set")
}

pub fn set_token(env: &Env, token: &Address) {
    env.storage()
        .instance()
        .set(&DataKey::TokenContract, token);
}

/// Return the next offer ID and increment the counter atomically.
pub fn next_offer_id(env: &Env) -> u64 {
    let id: u64 = env
        .storage()
        .instance()
        .get(&DataKey::NextOfferId)
        .unwrap_or(0u64);
    env.storage()
        .instance()
        .set(&DataKey::NextOfferId, &(id + 1));
    id
}

// ═══════════════════════════════════════════════════════════════════════════
// Persistent storage (per-asset, survives contract upgrades)
// ═══════════════════════════════════════════════════════════════════════════

// ── Owner ─────────────────────────────────────────────────────────────────

pub fn get_owner(env: &Env, asset_id: &Symbol) -> Option<Address> {
    let key = DataKey::Owner(asset_id.clone());
    env.storage().persistent().get(&key)
}

pub fn set_owner(env: &Env, asset_id: &Symbol, owner: &Address) {
    let key = DataKey::Owner(asset_id.clone());
    env.storage().persistent().set(&key, owner);
    env.storage()
        .persistent()
        .extend_ttl(&key, LEDGER_TTL_BUMP_THRESHOLD, LEDGER_TTL_30_DAYS);
}

// ── Metadata ─────────────────────────────────────────────────────────────

pub fn get_metadata(env: &Env, asset_id: &Symbol) -> Option<AssetMetadata> {
    let key = DataKey::Metadata(asset_id.clone());
    env.storage().persistent().get(&key)
}

pub fn set_metadata(env: &Env, asset_id: &Symbol, meta: &AssetMetadata) {
    let key = DataKey::Metadata(asset_id.clone());
    env.storage().persistent().set(&key, meta);
    env.storage()
        .persistent()
        .extend_ttl(&key, LEDGER_TTL_BUMP_THRESHOLD, LEDGER_TTL_30_DAYS);
}

// ── Minted supply ─────────────────────────────────────────────────────────

pub fn get_minted_supply(env: &Env, asset_id: &Symbol) -> u32 {
    let key = DataKey::MintedSupply(asset_id.clone());
    env.storage().persistent().get(&key).unwrap_or(0u32)
}

pub fn increment_minted_supply(env: &Env, asset_id: &Symbol) -> u32 {
    let count = get_minted_supply(env, asset_id) + 1;
    let key = DataKey::MintedSupply(asset_id.clone());
    env.storage().persistent().set(&key, &count);
    env.storage()
        .persistent()
        .extend_ttl(&key, LEDGER_TTL_BUMP_THRESHOLD, LEDGER_TTL_30_DAYS);
    count
}

// ── Listing ──────────────────────────────────────────────────────────────

pub fn get_listing(env: &Env, asset_id: &Symbol) -> Option<Listing> {
    let key = DataKey::Listing(asset_id.clone());
    env.storage().persistent().get(&key)
}

pub fn set_listing(env: &Env, asset_id: &Symbol, listing: &Listing) {
    let key = DataKey::Listing(asset_id.clone());
    env.storage().persistent().set(&key, listing);
    env.storage()
        .persistent()
        .extend_ttl(&key, LEDGER_TTL_BUMP_THRESHOLD, LEDGER_TTL_30_DAYS);
}

pub fn remove_listing(env: &Env, asset_id: &Symbol) {
    let key = DataKey::Listing(asset_id.clone());
    env.storage().persistent().remove(&key);
}

// ── Offers ────────────────────────────────────────────────────────────────

pub fn get_offers(env: &Env, asset_id: &Symbol) -> Vec<Offer> {
    let key = DataKey::Offers(asset_id.clone());
    env.storage()
        .persistent()
        .get(&key)
        .unwrap_or(Vec::new(env))
}

pub fn set_offers(env: &Env, asset_id: &Symbol, offers: &Vec<Offer>) {
    let key = DataKey::Offers(asset_id.clone());
    env.storage().persistent().set(&key, offers);
    env.storage()
        .persistent()
        .extend_ttl(&key, LEDGER_TTL_BUMP_THRESHOLD, LEDGER_TTL_30_DAYS);
}

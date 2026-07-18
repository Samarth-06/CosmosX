// ═══════════════════════════════════════════════════════════════════════════
// CosmosX Marketplace Contract — Main Entry Point
// ═══════════════════════════════════════════════════════════════════════════
//
// This is the single flexible marketplace contract for CosmosX tradeable
// collectibles (exoplanets, rocket skins, future cosmetics).
//
// WHAT THIS CONTRACT IS
// ─────────────────────
// • Handles buy / sell / offer / transfer of collectible NFTs on Stellar Testnet
// • Enforces ownership transfers atomically with XLM payment via the SAC token
// • Uses an AssetType enum so future asset categories require no new contract
// • Admin can register new asset types and mint initial editions
// • All public trade functions require the caller's wallet signature
//
// WHAT THIS CONTRACT IS NOT
// ─────────────────────────
// • This is NOT the achievement contract (contracts/achievement/). That contract
//   is soulbound (no transfer function) and completely separate. Do not merge them.
// • Achievement NFTs can NEVER be listed, transferred, or traded here.
//
// PAYMENT MODEL
// ─────────────
// Payments route through the XLM Stellar Asset Contract (SAC) set at initialize().
// All prices are stored in stroops (1 XLM = 10_000_000 stroops).
// The buyer authorizes the top-level call; Soroban's sub-invocation auth model
// propagates that authorization automatically to the token.transfer() call.
//
// PHASE 3 SCOPE (Testnet)
// ────────────────────────
// • Each asset_id maps to exactly one owner (single-edition per ID).
//   Multi-edition assets register separate IDs: e.g. "kepler_452b_1", "kepler_452b_2"
// • Offers are NOT escrowed on-chain (Phase 5 will add escrow via token lock)
// • No royalties (Phase 5 roadmap)
// • Persistent TTL is bumped to 30 days on every write (see storage.rs)
//
// ERROR MODEL
// ───────────
// User-facing methods return Result / Option instead of panic!/expect! so RPC
// simulation surfaces decodeable Error codes — never WasmVm UnreachableCodeReached
// for missing assets, unlisted buys, or self-buys.

#![no_std]

mod storage;
mod types;
mod errors;

use soroban_sdk::{contract, contractimpl, symbol_short, token, Address, Env, Symbol, Vec};

use crate::errors::Error;
use crate::types::{AssetMetadata, Listing, Offer};

pub use crate::errors::Error as ContractError;

#[contract]
pub struct MarketplaceContract;

#[contractimpl]
impl MarketplaceContract {
    // ══════════════════════════════════════════════════════════════════════════
    // Initialisation — one-time setup
    // ══════════════════════════════════════════════════════════════════════════

    /// Initialise the contract. Must be called once immediately after deploy.
    ///
    /// `admin`  — address that can register assets and mint initial editions.
    ///            Set to your personal admin wallet (e.g. your Freighter address).
    ///            The DEPLOYER that signs this transaction does NOT need to be the
    ///            same as `admin` — the deployer only pays fees here.
    /// `token`  — address of the XLM Stellar Asset Contract on this network.
    ///            On Testnet: use `stellar contract id asset --asset native --network testnet`
    pub fn initialize(env: Env, admin: Address, token: Address) -> Result<(), Error> {
        if storage::has_admin(&env) {
            return Err(Error::AlreadyInitialized);
        }
        storage::set_admin(&env, &admin);
        storage::set_token(&env, &token);

        env.events()
            .publish((symbol_short!("init"),), (admin, token));
        Ok(())
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Admin — asset registration
    // ══════════════════════════════════════════════════════════════════════════

    /// Register a new collectible asset type. Admin-only.
    ///
    /// Must be called before `mint_to`. Subsequent registrations for the same
    /// `asset_id` are rejected so metadata cannot be silently replaced after
    /// assets are in players' wallets.
    pub fn register_asset(
        env: Env,
        asset_id: Symbol,
        metadata: AssetMetadata,
    ) -> Result<(), Error> {
        let admin = storage::get_admin(&env);
        admin.require_auth();

        if storage::get_metadata(&env, &asset_id).is_some() {
            return Err(Error::AlreadyRegistered);
        }

        storage::set_metadata(&env, &asset_id, &metadata);

        env.events()
            .publish((symbol_short!("register"), asset_id), ());
        Ok(())
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Admin — minting initial edition
    // ══════════════════════════════════════════════════════════════════════════

    /// Mint a single edition of a registered asset to an initial recipient.
    /// Admin-only. Each asset_id may only be minted once (1/1 model).
    pub fn mint_to(env: Env, asset_id: Symbol, to: Address) -> Result<(), Error> {
        let admin = storage::get_admin(&env);
        admin.require_auth();

        let meta = match storage::get_metadata(&env, &asset_id) {
            Some(m) => m,
            None => return Err(Error::NotRegistered),
        };
        let minted = storage::get_minted_supply(&env, &asset_id);

        if minted >= meta.max_supply {
            return Err(Error::MaxSupplyReached);
        }

        if storage::get_owner(&env, &asset_id).is_some() {
            return Err(Error::AlreadyMinted);
        }

        storage::increment_minted_supply(&env, &asset_id);
        storage::set_owner(&env, &asset_id, &to);

        env.events()
            .publish((symbol_short!("mint"), asset_id), to);
        Ok(())
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Transfer (direct, no payment)
    // ══════════════════════════════════════════════════════════════════════════

    /// Direct ownership transfer from caller → `to`, no XLM payment.
    /// Asset must NOT be actively listed (call `delist` first).
    pub fn transfer(env: Env, asset_id: Symbol, to: Address) -> Result<(), Error> {
        let from = match storage::get_owner(&env, &asset_id) {
            Some(o) => o,
            None => return Err(Error::AssetNotFound),
        };
        from.require_auth();

        if storage::get_listing(&env, &asset_id).is_some() {
            return Err(Error::MustDelistFirst);
        }

        storage::set_owner(&env, &asset_id, &to);

        env.events()
            .publish((symbol_short!("transfer"), asset_id), (from, to));
        Ok(())
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Listing
    // ══════════════════════════════════════════════════════════════════════════

    /// List an owned asset for sale at `price` stroops.
    /// Re-listing an already-listed asset replaces the old listing price.
    pub fn list(env: Env, asset_id: Symbol, price: i128) -> Result<(), Error> {
        if price <= 0 {
            return Err(Error::InvalidPrice);
        }

        let owner = match storage::get_owner(&env, &asset_id) {
            Some(o) => o,
            None => return Err(Error::AssetNotFound),
        };
        owner.require_auth();

        let listing = Listing {
            price,
            seller: owner.clone(),
            listed_at_ledger: env.ledger().sequence(),
        };

        storage::set_listing(&env, &asset_id, &listing);

        env.events()
            .publish((symbol_short!("list"), asset_id), (owner, price));
        Ok(())
    }

    /// Remove an active listing. Caller must be the current owner.
    pub fn delist(env: Env, asset_id: Symbol) -> Result<(), Error> {
        let owner = match storage::get_owner(&env, &asset_id) {
            Some(o) => o,
            None => return Err(Error::AssetNotFound),
        };
        owner.require_auth();

        if storage::get_listing(&env, &asset_id).is_none() {
            return Err(Error::NotListed);
        }

        storage::remove_listing(&env, &asset_id);

        env.events()
            .publish((symbol_short!("delist"), asset_id), owner);
        Ok(())
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Buy (instant purchase at listing price)
    // ══════════════════════════════════════════════════════════════════════════

    /// Purchase a listed asset at the ask price. Caller is the buyer.
    ///
    /// Returns structured `Error` variants instead of panicking so Freighter /
    /// RPC simulation surfaces a contract error (not WasmVm UnreachableCodeReached).
    pub fn buy(env: Env, asset_id: Symbol, buyer: Address) -> Result<(), Error> {
        buyer.require_auth();

        let listing = match storage::get_listing(&env, &asset_id) {
            Some(l) => l,
            None => return Err(Error::NotListed),
        };
        let seller = listing.seller.clone();

        // Stale-listing guard: ensure seller still owns the asset.
        let current_owner = match storage::get_owner(&env, &asset_id) {
            Some(o) => o,
            None => return Err(Error::AssetNotFound),
        };
        if current_owner != seller {
            return Err(Error::StaleListing);
        }

        if buyer == seller {
            return Err(Error::CannotBuyOwnListing);
        }

        // Route payment via XLM SAC: buyer → seller.
        let token_address = storage::get_token(&env);
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&buyer, &seller, &listing.price);

        // Transfer ownership and clean up.
        storage::remove_listing(&env, &asset_id);
        storage::set_owner(&env, &asset_id, &buyer);

        // Remove any open offers from the buyer (they now own the asset).
        let mut offers = storage::get_offers(&env, &asset_id);
        let mut i = 0u32;
        while i < offers.len() {
            if let Some(o) = offers.get(i) {
                if o.bidder == buyer {
                    offers.remove(i);
                } else {
                    i += 1;
                }
            } else {
                break;
            }
        }
        storage::set_offers(&env, &asset_id, &offers);

        env.events().publish(
            (symbol_short!("buy"), asset_id),
            (buyer, seller, listing.price),
        );

        Ok(())
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Offers (bids)
    // ══════════════════════════════════════════════════════════════════════════

    /// Submit a buy offer for an asset at `price` stroops. Caller is the bidder.
    /// Returns the unique `offer_id` for subsequent accept/reject calls.
    pub fn make_offer(
        env: Env,
        asset_id: Symbol,
        price: i128,
        bidder: Address,
    ) -> Result<u64, Error> {
        bidder.require_auth();

        if price <= 0 {
            return Err(Error::InvalidPrice);
        }

        if storage::get_metadata(&env, &asset_id).is_none() {
            return Err(Error::NotRegistered);
        }

        if let Some(owner) = storage::get_owner(&env, &asset_id) {
            if owner == bidder {
                return Err(Error::CannotOfferOwnAsset);
            }
        }

        let offer_id = storage::next_offer_id(&env);

        let offer = Offer {
            offer_id,
            asset_id: asset_id.clone(),
            price,
            bidder: bidder.clone(),
            created_at_ledger: env.ledger().sequence(),
        };

        let mut offers = storage::get_offers(&env, &asset_id);
        offers.push_back(offer);
        storage::set_offers(&env, &asset_id, &offers);

        env.events().publish(
            (symbol_short!("offer"), asset_id),
            (offer_id, bidder, price),
        );

        Ok(offer_id)
    }

    /// Accept an open offer on an asset you own. Caller must be current owner.
    pub fn accept_offer(env: Env, asset_id: Symbol, offer_id: u64) -> Result<(), Error> {
        let owner = match storage::get_owner(&env, &asset_id) {
            Some(o) => o,
            None => return Err(Error::AssetNotFound),
        };
        owner.require_auth();

        let mut offers = storage::get_offers(&env, &asset_id);

        let mut found_offer: Option<Offer> = None;
        let mut found_index: Option<u32> = None;

        for i in 0..offers.len() {
            if let Some(o) = offers.get(i) {
                if o.offer_id == offer_id {
                    found_offer = Some(o);
                    found_index = Some(i);
                    break;
                }
            }
        }

        let offer = match found_offer {
            Some(o) => o,
            None => return Err(Error::OfferNotFound),
        };
        let idx = found_index.unwrap();

        let token_address = storage::get_token(&env);
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&offer.bidder, &owner, &offer.price);

        storage::set_owner(&env, &asset_id, &offer.bidder);
        storage::remove_listing(&env, &asset_id);

        offers.remove(idx);
        storage::set_offers(&env, &asset_id, &offers);

        env.events().publish(
            (symbol_short!("accept"), asset_id),
            (offer_id, offer.bidder, owner, offer.price),
        );
        Ok(())
    }

    /// Reject an open offer on an asset you own. Caller must be current owner.
    pub fn reject_offer(env: Env, asset_id: Symbol, offer_id: u64) -> Result<(), Error> {
        let owner = match storage::get_owner(&env, &asset_id) {
            Some(o) => o,
            None => return Err(Error::AssetNotFound),
        };
        owner.require_auth();

        let mut offers = storage::get_offers(&env, &asset_id);

        let mut found_index: Option<u32> = None;
        for i in 0..offers.len() {
            if let Some(o) = offers.get(i) {
                if o.offer_id == offer_id {
                    found_index = Some(i);
                    break;
                }
            }
        }

        let idx = match found_index {
            Some(i) => i,
            None => return Err(Error::OfferNotFound),
        };
        offers.remove(idx);
        storage::set_offers(&env, &asset_id, &offers);

        env.events()
            .publish((symbol_short!("reject"), asset_id), (offer_id, owner));
        Ok(())
    }

    // ══════════════════════════════════════════════════════════════════════════
    // View functions — read-only, no auth, no storage writes
    // ══════════════════════════════════════════════════════════════════════════

    /// Returns the current owner of `asset_id`, or None if not minted.
    /// Never panics — unregistered / unminted assets return None.
    pub fn owner_of(env: Env, asset_id: Symbol) -> Option<Address> {
        storage::get_owner(&env, &asset_id)
    }

    /// Returns true if `address` is the current owner of `asset_id`.
    pub fn has_asset(env: Env, address: Address, asset_id: Symbol) -> bool {
        storage::get_owner(&env, &asset_id)
            .map(|owner| owner == address)
            .unwrap_or(false)
    }

    /// Returns the active listing for `asset_id`, or None if not listed.
    pub fn get_listing(env: Env, asset_id: Symbol) -> Option<Listing> {
        storage::get_listing(&env, &asset_id)
    }

    /// Returns all open offers on `asset_id`.
    pub fn get_offers(env: Env, asset_id: Symbol) -> Vec<Offer> {
        storage::get_offers(&env, &asset_id)
    }

    /// Returns the immutable metadata for a registered asset, or None.
    pub fn get_metadata(env: Env, asset_id: Symbol) -> Option<AssetMetadata> {
        storage::get_metadata(&env, &asset_id)
    }

    /// Returns how many editions of `asset_id` have been minted.
    pub fn get_minted_supply(env: Env, asset_id: Symbol) -> u32 {
        storage::get_minted_supply(&env, &asset_id)
    }

    /// Returns the admin address.
    pub fn get_admin(env: Env) -> Address {
        storage::get_admin(&env)
    }
}

mod test;

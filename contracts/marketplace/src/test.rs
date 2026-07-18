// ═══════════════════════════════════════════════════════════════════════════
// CosmosX Marketplace Contract — Test Suite
// ═══════════════════════════════════════════════════════════════════════════
//
// WHY NO StellarAssetClient / register_stellar_asset_contract_v2?
// ────────────────────────────────────────────────────────────────
// soroban-env-host v22.1.3 has a compile-time breakage in its
// builtin_contracts/testutils.rs: `ChaCha20Rng` does not satisfy
// `ed25519_dalek::rand_core::CryptoRng` due to a trait-bound mismatch
// introduced by an upstream dependency update. That path is only reached
// through `register_stellar_asset_contract_v2`, so we sidestep it entirely.
//
// Instead we register a minimal `MockToken` that implements the SEP-41
// `transfer(from, to, amount)` interface. Soroban cross-contract calls match
// by function name + arg types, so `token::Client` in lib.rs calls our mock
// transparently. All logic — balance tracking, transfer, mint — works
// identically to the real SAC for test purposes.
//
// This approach also removes the `'static` lifetime hack that was previously
// needed for `StellarAssetClient`, making the test code entirely safe.
//
// Tests cover:
//   1. Initialization + double-init guard
//   2. Asset registration + duplicate guard
//   3. Minting + max-supply guard + unregistered asset guard
//   4. Direct transfer (with listing guard)
//   5. List / delist (+ zero-price and already-unlisted guards)
//   6. Full buy flow (ownership + XLM balance assertions)
//   7. Buy guards (unlisted, own listing)
//   8. Offer flow (make → accept → balance check)
//   9. Offer rejection + nonexistent offer guard
//  10. Auth guard (transfer records owner as authorizing address)

#![cfg(test)]

use super::*;
use soroban_sdk::{contract, contractimpl, testutils::Address as _, Address, Env, String, Symbol};

use crate::types::{AssetMetadata, AssetType, Rarity};

// ═══════════════════════════════════════════════════════════════════════════
// Minimal SEP-41-compatible mock token
// ═══════════════════════════════════════════════════════════════════════════
//
// Only the methods used by the marketplace contract need to be present:
//   - transfer(from, to, amount) — called by buy() and accept_offer()
//   - mint(to, amount)           — test helper (not called by main contract)
//   - balance(address)           — test assertion helper
//
// The function names and arg types match SEP-41 exactly so token::Client
// in lib.rs can invoke them via cross-contract call without any modification.

#[contract]
pub struct MockToken;

#[contractimpl]
impl MockToken {
    /// Credit `amount` stroops to `to`. No auth required (test setup only).
    pub fn mint(env: Env, to: Address, amount: i128) {
        let bal: i128 = env.storage().instance().get(&to).unwrap_or(0i128);
        env.storage().instance().set(&to, &(bal + amount));
    }

    /// SEP-41 transfer: debit `from`, credit `to` by `amount` stroops.
    /// `from` must authorise the call (mirroring the real XLM SAC).
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        let from_bal: i128 = env.storage().instance().get(&from).unwrap_or(0i128);
        if from_bal < amount {
            panic!("insufficient balance");
        }
        let to_bal: i128 = env.storage().instance().get(&to).unwrap_or(0i128);
        env.storage().instance().set(&from, &(from_bal - amount));
        env.storage().instance().set(&to, &(to_bal + amount));
    }

    /// Return the current balance of `address` in stroops.
    pub fn balance(env: Env, address: Address) -> i128 {
        env.storage().instance().get(&address).unwrap_or(0i128)
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// Test fixture
// ═══════════════════════════════════════════════════════════════════════════

struct TestFixture {
    env: Env,
    contract_id: Address,
    token_id: Address,
    admin: Address,
}

impl TestFixture {
    fn new() -> Self {
        let env = Env::default();
        env.mock_all_auths();

        // Register the mock token and the marketplace contract
        let token_id = env.register(MockToken, ());
        let contract_id = env.register(MarketplaceContract, ());
        let admin = Address::generate(&env);

        // Initialise with admin + mock token address
        MarketplaceContractClient::new(&env, &contract_id).initialize(&admin, &token_id);

        Self {
            env,
            contract_id,
            token_id,
            admin,
        }
    }

    fn client(&self) -> MarketplaceContractClient<'_> {
        MarketplaceContractClient::new(&self.env, &self.contract_id)
    }

    fn token(&self) -> MockTokenClient<'_> {
        MockTokenClient::new(&self.env, &self.token_id)
    }

    /// Credit `xlm` XLM (converted to stroops) to `address`.
    fn fund(&self, address: &Address, xlm: i128) {
        self.token().mint(address, &(xlm * 10_000_000));
    }

    /// Returns the stroop balance of `address`.
    fn balance(&self, address: &Address) -> i128 {
        self.token().balance(address)
    }
}

// ── Shared test data ─────────────────────────────────────────────────────────

fn kepler_id(env: &Env) -> Symbol {
    Symbol::new(env, "kepler_452b")
}

fn kepler_meta(env: &Env) -> AssetMetadata {
    AssetMetadata {
        name: String::from_str(env, "Kepler-452b"),
        asset_type: AssetType::Exoplanet,
        rarity: Rarity::Legendary,
        uri: String::from_str(env, "https://cosmosx.app/assets/kepler_452b.json"),
        max_supply: 1,
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. Initialization
// ═══════════════════════════════════════════════════════════════════════════

#[test]
fn test_initialize_stores_admin_and_token() {
    let f = TestFixture::new();
    assert_eq!(f.client().get_admin(), f.admin);
}

#[test]
fn test_double_initialize_returns_error() {
    let f = TestFixture::new();
    let other = Address::generate(&f.env);
    let result = f.client().try_initialize(&other, &f.token_id);
    assert_eq!(result, Err(Ok(Error::AlreadyInitialized)));
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. Asset registration
// ═══════════════════════════════════════════════════════════════════════════

#[test]
fn test_register_asset_stores_metadata() {
    let f = TestFixture::new();
    let id = kepler_id(&f.env);
    let meta = kepler_meta(&f.env);

    f.client().register_asset(&id, &meta);

    let stored = f.client().get_metadata(&id).unwrap();
    assert_eq!(stored.name, meta.name);
    assert_eq!(stored.max_supply, 1);
    assert_eq!(stored.rarity, Rarity::Legendary);
}

#[test]
fn test_duplicate_registration_returns_error() {
    let f = TestFixture::new();
    let id = kepler_id(&f.env);
    f.client().register_asset(&id, &kepler_meta(&f.env));
    let result = f.client().try_register_asset(&id, &kepler_meta(&f.env));
    assert_eq!(result, Err(Ok(Error::AlreadyRegistered)));
}

#[test]
fn test_get_metadata_unregistered_returns_none() {
    let f = TestFixture::new();
    assert!(f.client().get_metadata(&Symbol::new(&f.env, "unknown")).is_none());
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. Minting
// ═══════════════════════════════════════════════════════════════════════════

#[test]
fn test_mint_sets_owner_and_supply() {
    let f = TestFixture::new();
    let id = kepler_id(&f.env);
    let player = Address::generate(&f.env);

    f.client().register_asset(&id, &kepler_meta(&f.env));
    f.client().mint_to(&id, &player);

    assert_eq!(f.client().owner_of(&id), Some(player.clone()));
    assert!(f.client().has_asset(&player, &id));
    assert_eq!(f.client().get_minted_supply(&id), 1);
}

#[test]
fn test_owner_of_unminted_returns_none() {
    let f = TestFixture::new();
    let id = kepler_id(&f.env);
    f.client().register_asset(&id, &kepler_meta(&f.env));
    // Registered but not minted — must NOT trap.
    assert!(f.client().owner_of(&id).is_none());
    assert!(f.client().owner_of(&Symbol::new(&f.env, "gj_504b")).is_none());
}

#[test]
fn test_double_mint_returns_error() {
    let f = TestFixture::new();
    let id = kepler_id(&f.env);
    let player = Address::generate(&f.env);
    let other = Address::generate(&f.env);

    f.client().register_asset(&id, &kepler_meta(&f.env));
    f.client().mint_to(&id, &player);
    let result = f.client().try_mint_to(&id, &other);
    // max_supply = 1 — AlreadyMinted is checked after supply, but supply
    // already incremented so MaxSupplyReached fires first.
    assert!(
        result == Err(Ok(Error::MaxSupplyReached)) || result == Err(Ok(Error::AlreadyMinted)),
        "expected MaxSupplyReached or AlreadyMinted, got {:?}",
        result
    );
}

#[test]
fn test_mint_unregistered_returns_error() {
    let f = TestFixture::new();
    let player = Address::generate(&f.env);
    let result = f.client().try_mint_to(&Symbol::new(&f.env, "unknown"), &player);
    assert_eq!(result, Err(Ok(Error::NotRegistered)));
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. Direct transfer
// ═══════════════════════════════════════════════════════════════════════════

#[test]
fn test_transfer_changes_owner() {
    let f = TestFixture::new();
    let id = kepler_id(&f.env);
    let alice = Address::generate(&f.env);
    let bob = Address::generate(&f.env);

    f.client().register_asset(&id, &kepler_meta(&f.env));
    f.client().mint_to(&id, &alice);
    f.client().transfer(&id, &bob);

    assert_eq!(f.client().owner_of(&id), Some(bob.clone()));
    assert!(!f.client().has_asset(&alice, &id));
    assert!(f.client().has_asset(&bob, &id));
}

#[test]
fn test_transfer_while_listed_returns_error() {
    let f = TestFixture::new();
    let id = kepler_id(&f.env);
    let alice = Address::generate(&f.env);
    let bob = Address::generate(&f.env);

    f.client().register_asset(&id, &kepler_meta(&f.env));
    f.client().mint_to(&id, &alice);
    f.client().list(&id, &(500 * 10_000_000i128));
    let result = f.client().try_transfer(&id, &bob);
    assert_eq!(result, Err(Ok(Error::MustDelistFirst)));
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. List / Delist
// ═══════════════════════════════════════════════════════════════════════════

#[test]
fn test_list_creates_listing_and_delist_removes_it() {
    let f = TestFixture::new();
    let id = kepler_id(&f.env);
    let owner = Address::generate(&f.env);
    let price = 1_000 * 10_000_000i128;

    f.client().register_asset(&id, &kepler_meta(&f.env));
    f.client().mint_to(&id, &owner);
    f.client().list(&id, &price);

    let listing = f.client().get_listing(&id).unwrap();
    assert_eq!(listing.price, price);
    assert_eq!(listing.seller, owner);

    f.client().delist(&id);
    assert!(f.client().get_listing(&id).is_none());
}

#[test]
fn test_list_zero_price_returns_error() {
    let f = TestFixture::new();
    let id = kepler_id(&f.env);
    let owner = Address::generate(&f.env);
    f.client().register_asset(&id, &kepler_meta(&f.env));
    f.client().mint_to(&id, &owner);
    let result = f.client().try_list(&id, &0i128);
    assert_eq!(result, Err(Ok(Error::InvalidPrice)));
}

#[test]
fn test_list_unminted_returns_error() {
    let f = TestFixture::new();
    let id = kepler_id(&f.env);
    f.client().register_asset(&id, &kepler_meta(&f.env));
    let result = f.client().try_list(&id, &(100 * 10_000_000i128));
    assert_eq!(result, Err(Ok(Error::AssetNotFound)));
}

#[test]
fn test_delist_unlisted_returns_error() {
    let f = TestFixture::new();
    let id = kepler_id(&f.env);
    let owner = Address::generate(&f.env);
    f.client().register_asset(&id, &kepler_meta(&f.env));
    f.client().mint_to(&id, &owner);
    let result = f.client().try_delist(&id);
    assert_eq!(result, Err(Ok(Error::NotListed)));
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. Buy flow
// ═══════════════════════════════════════════════════════════════════════════

#[test]
fn test_buy_transfers_ownership_and_payment() {
    let f = TestFixture::new();
    let id = kepler_id(&f.env);
    let seller = Address::generate(&f.env);
    let buyer = Address::generate(&f.env);
    let price_stroops = 500 * 10_000_000i128;

    f.fund(&buyer, 1_000); // 1000 XLM

    f.client().register_asset(&id, &kepler_meta(&f.env));
    f.client().mint_to(&id, &seller);
    f.client().list(&id, &price_stroops);
    f.client().buy(&id, &buyer);

    // Ownership transferred
    assert_eq!(f.client().owner_of(&id), Some(buyer.clone()));
    assert!(!f.client().has_asset(&seller, &id));

    // Listing removed
    assert!(f.client().get_listing(&id).is_none());

    // Token balances correct
    assert_eq!(f.balance(&seller), price_stroops);
    assert_eq!(f.balance(&buyer), 1_000 * 10_000_000 - price_stroops);
}

#[test]
fn test_buy_unlisted_returns_error() {
    let f = TestFixture::new();
    let id = kepler_id(&f.env);
    let seller = Address::generate(&f.env);
    let buyer = Address::generate(&f.env);
    f.client().register_asset(&id, &kepler_meta(&f.env));
    f.client().mint_to(&id, &seller);
    let result = f.client().try_buy(&id, &buyer);
    assert_eq!(result, Err(Ok(Error::NotListed)));
}

#[test]
fn test_buy_own_listing_returns_error() {
    let f = TestFixture::new();
    let id = kepler_id(&f.env);
    let owner = Address::generate(&f.env);
    f.fund(&owner, 5_000);
    f.client().register_asset(&id, &kepler_meta(&f.env));
    f.client().mint_to(&id, &owner);
    f.client().list(&id, &(100 * 10_000_000i128));
    let result = f.client().try_buy(&id, &owner);
    assert_eq!(result, Err(Ok(Error::CannotBuyOwnListing)));
}

// ═══════════════════════════════════════════════════════════════════════════
// 7. Offer flow (make → accept)
// ═══════════════════════════════════════════════════════════════════════════

#[test]
fn test_make_and_accept_offer() {
    // accept_offer calls token::transfer(bidder → seller) as a sub-invocation
    // where `bidder` is not the root caller (owner/seller is). We must use
    // mock_all_auths_allowing_non_root_auth so Soroban's auth recording accepts
    // the bidder's require_auth() inside the MockToken::transfer sub-call.
    let env = Env::default();
    env.mock_all_auths_allowing_non_root_auth();

    let token_id = env.register(MockToken, ());
    let contract_id = env.register(MarketplaceContract, ());
    let client = MarketplaceContractClient::new(&env, &contract_id);
    let token = MockTokenClient::new(&env, &token_id);

    let admin = Address::generate(&env);
    let seller = Address::generate(&env);
    let bidder = Address::generate(&env);
    let offer_price = 800 * 10_000_000i128;

    client.initialize(&admin, &token_id);

    // Fund bidder with 1000 XLM
    token.mint(&bidder, &(1_000 * 10_000_000i128));

    let id = kepler_id(&env);
    client.register_asset(&id, &kepler_meta(&env));
    client.mint_to(&id, &seller);

    let offer_id = client.make_offer(&id, &offer_price, &bidder);
    assert_eq!(offer_id, 0u64); // first offer ever issued

    let offers = client.get_offers(&id);
    assert_eq!(offers.len(), 1);
    assert_eq!(offers.get(0).unwrap().price, offer_price);
    assert_eq!(offers.get(0).unwrap().bidder, bidder);

    // Seller accepts — bidder's token auth fires as a non-root sub-invocation
    client.accept_offer(&id, &offer_id);

    // Ownership transferred to bidder
    assert_eq!(client.owner_of(&id), Some(bidder.clone()));

    // Payment: bidder → seller
    assert_eq!(token.balance(&seller), offer_price);
    assert_eq!(token.balance(&bidder), 1_000 * 10_000_000 - offer_price);

    // Offer list cleared
    assert_eq!(client.get_offers(&id).len(), 0);
}

// ═══════════════════════════════════════════════════════════════════════════
// 8. Offer rejection
// ═══════════════════════════════════════════════════════════════════════════

#[test]
fn test_reject_offer_removes_it() {
    let f = TestFixture::new();
    let id = kepler_id(&f.env);
    let seller = Address::generate(&f.env);
    let bidder = Address::generate(&f.env);

    f.client().register_asset(&id, &kepler_meta(&f.env));
    f.client().mint_to(&id, &seller);

    let offer_id = f.client().make_offer(&id, &(200 * 10_000_000i128), &bidder);
    f.client().reject_offer(&id, &offer_id);

    assert_eq!(f.client().get_offers(&id).len(), 0);
}

#[test]
fn test_reject_nonexistent_offer_returns_error() {
    let f = TestFixture::new();
    let id = kepler_id(&f.env);
    let seller = Address::generate(&f.env);
    f.client().register_asset(&id, &kepler_meta(&f.env));
    f.client().mint_to(&id, &seller);
    let result = f.client().try_reject_offer(&id, &999u64);
    assert_eq!(result, Err(Ok(Error::OfferNotFound)));
}

#[test]
fn test_make_offer_on_own_asset_returns_error() {
    let f = TestFixture::new();
    let id = kepler_id(&f.env);
    let owner = Address::generate(&f.env);
    f.client().register_asset(&id, &kepler_meta(&f.env));
    f.client().mint_to(&id, &owner);
    let result = f.client().try_make_offer(&id, &(100 * 10_000_000i128), &owner);
    assert_eq!(result, Err(Ok(Error::CannotOfferOwnAsset)));
}

#[test]
fn test_make_offer_unregistered_returns_error() {
    let f = TestFixture::new();
    let bidder = Address::generate(&f.env);
    let result = f
        .client()
        .try_make_offer(&Symbol::new(&f.env, "unknown"), &(100 * 10_000_000i128), &bidder);
    assert_eq!(result, Err(Ok(Error::NotRegistered)));
}

// ═══════════════════════════════════════════════════════════════════════════
// 9. Auth guard — transfer requires owner's authorization
// ═══════════════════════════════════════════════════════════════════════════

#[test]
fn test_transfer_records_owner_as_authorizing_address() {
    let env = Env::default();
    env.mock_all_auths();

    let token_id = env.register(MockToken, ());
    let contract_id = env.register(MarketplaceContract, ());
    let client = MarketplaceContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    let id = Symbol::new(&env, "trappist_1e");

    client.initialize(&admin, &token_id);
    client.register_asset(
        &id,
        &AssetMetadata {
            name: String::from_str(&env, "TRAPPIST-1e"),
            asset_type: AssetType::Exoplanet,
            rarity: Rarity::Epic,
            uri: String::from_str(&env, "https://cosmosx.app/assets/trappist_1e.json"),
            max_supply: 1,
        },
    );
    client.mint_to(&id, &alice);
    client.transfer(&id, &bob);

    // Verify alice (the owner) is recorded as the authorizing signer for transfer
    let auths = env.auths();
    let alice_authorised_transfer = auths.iter().any(|(signer, _)| *signer == alice);
    assert!(
        alice_authorised_transfer,
        "alice (owner) must be the authorizing address for transfer"
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// 10. Multiple offers — offer IDs are unique and monotonically increasing
// ═══════════════════════════════════════════════════════════════════════════

#[test]
fn test_multiple_offers_have_unique_ids() {
    let f = TestFixture::new();
    let id = kepler_id(&f.env);
    let seller = Address::generate(&f.env);
    let bidder1 = Address::generate(&f.env);
    let bidder2 = Address::generate(&f.env);
    let bidder3 = Address::generate(&f.env);

    f.client().register_asset(&id, &kepler_meta(&f.env));
    f.client().mint_to(&id, &seller);

    let id1 = f.client().make_offer(&id, &(100 * 10_000_000i128), &bidder1);
    let id2 = f.client().make_offer(&id, &(200 * 10_000_000i128), &bidder2);
    let id3 = f.client().make_offer(&id, &(300 * 10_000_000i128), &bidder3);

    assert!(id1 < id2 && id2 < id3, "offer IDs must be strictly increasing");
    assert_eq!(f.client().get_offers(&id).len(), 3);
}

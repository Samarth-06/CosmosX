// ═══════════════════════════════════════════════════════════════════════════
// CosmosX Marketplace — Contract Errors
// ═══════════════════════════════════════════════════════════════════════════
//
// Structured Soroban errors (#[contracterror]) so client simulation receives
// a decodeable error code instead of a bare WasmVm UnreachableCodeReached trap
// from panic!/expect!. Prefer returning Result on user-facing read/write paths.

use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    /// No active listing for this asset.
    NotListed = 1,
    /// Asset has no owner (not minted / unknown).
    AssetNotFound = 2,
    /// Listing seller no longer matches current owner.
    StaleListing = 3,
    /// Buyer address equals the listing seller.
    CannotBuyOwnListing = 4,
    /// Asset metadata already registered.
    AlreadyRegistered = 5,
    /// Asset metadata has not been registered.
    NotRegistered = 6,
    /// Mint would exceed max_supply.
    MaxSupplyReached = 7,
    /// Asset already has an owner (1/1 model).
    AlreadyMinted = 8,
    /// Price must be positive.
    InvalidPrice = 9,
    /// Asset must be delisted before transfer.
    MustDelistFirst = 10,
    /// Bidder already owns the asset.
    CannotOfferOwnAsset = 11,
    /// Offer ID not found for this asset.
    OfferNotFound = 12,
    /// Contract already initialized (initialize only).
    AlreadyInitialized = 13,
}

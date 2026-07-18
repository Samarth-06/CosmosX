# CosmosX Contracts

This document describes the two Soroban contracts used by CosmosX on Stellar **Testnet**. They are separate by design and must not be merged.

| Contract | Path | Purpose | Transferable? |
|----------|------|---------|---------------|
| Achievement | `contracts/achievement/` | Soulbound learning badges | **No** |
| Marketplace | `contracts/marketplace/` | Tradeable exoplanet collectibles | **Yes** |

---

## Marketplace contract

**Current Testnet ID:** see `contracts/marketplace/DEPLOYMENT.md`  
**Admin:** address set at `initialize()` (`get_admin()`) — Foundation / deployer (`cosmosx-admin`).

### Public methods

| Method | Auth | Returns | Notes |
|--------|------|---------|-------|
| `initialize(admin, token)` | none | `Result<(), Error>` | Once only |
| `register_asset(id, metadata)` | admin | `Result<(), Error>` | Immutable metadata |
| `mint_to(id, to)` | admin | `Result<(), Error>` | 1/1 per asset_id |
| `transfer(id, to)` | owner | `Result<(), Error>` | Must delist first |
| `list(id, price)` | owner | `Result<(), Error>` | Price in stroops |
| `delist(id)` | owner | `Result<(), Error>` | |
| `buy(id, buyer)` | buyer | `Result<(), Error>` | XLM SAC payment |
| `make_offer(id, price, bidder)` | bidder | `Result<u64, Error>` | No escrow yet |
| `accept_offer(id, offer_id)` | owner | `Result<(), Error>` | XLM SAC payment |
| `reject_offer(id, offer_id)` | owner | `Result<(), Error>` | |
| `owner_of(id)` | none | `Option<Address>` | **None if unminted — never panics** |
| `has_asset(addr, id)` | none | `bool` | |
| `get_listing(id)` | none | `Option<Listing>` | |
| `get_offers(id)` | none | `Vec<Offer>` | |
| `get_metadata(id)` | none | `Option<AssetMetadata>` | **None if unregistered** |
| `get_minted_supply(id)` | none | `u32` | Safe for any id |
| `get_admin()` | none | `Address` | |

### Error codes (`Error`)

| Code | Name | Typical cause |
|------|------|---------------|
| 1 | `NotListed` | Buy/delist without listing |
| 2 | `AssetNotFound` | Not minted |
| 3 | `StaleListing` | Seller ≠ current owner |
| 4 | `CannotBuyOwnListing` | Self-buy |
| 5 | `AlreadyRegistered` | Duplicate register |
| 6 | `NotRegistered` | Mint/offer on unknown id |
| 7 | `MaxSupplyReached` | Mint past max_supply |
| 8 | `AlreadyMinted` | Second mint on same id |
| 9 | `InvalidPrice` | price ≤ 0 |
| 10 | `MustDelistFirst` | Transfer while listed |
| 11 | `CannotOfferOwnAsset` | Offer on own NFT |
| 12 | `OfferNotFound` | Bad offer_id |
| 13 | `AlreadyInitialized` | Double initialize |

### Gaps (not invented in UI)

- **No `burn()`** — Admin panel documents this; do not add client burn calls.
- **No offer escrow** — `make_offer` records intent only; XLM is transferred only at `accept_offer` time. Known limitation.
- **No on-chain volume accumulator** — Dashboard volume is local tx log only.
- **No royalties**.

### Frontend wiring

- Reads: `src/features/marketplace/readMarketplace.ts`
- Writes + stubs: `src/lib/stellar/marketplace-contract.ts`
- Env: `VITE_MARKETPLACE_CONTRACT_ID`, `VITE_MARKETPLACE_TOKEN_ID`
- When unset → localStorage fallback (`marketplace-store.ts`); app does not crash.

### Redeploy note

Panic→`Result`/`Option` fixes require a **new WASM deploy** to take effect on Testnet. Until then, the frontend avoids calling `owner_of` when `get_minted_supply == 0` so unminted assets (e.g. `gj_504b`) do not trap the UI.

---

## Achievement contract

Soulbound badges for learning milestones. See `contracts/achievement/README.md` and `DEPLOYMENT.md`.

- Has **no** `transfer` / `list` / `buy`.
- Must never be wired into the marketplace UI as tradeable inventory.

# CosmosX Marketplace Contract — Deployment Log

This file tracks every Testnet deployment of the marketplace contract.
Update after each `scripts/deploy-testnet.sh` run.

> **Testnet resets periodically** — contracts are wiped. When that happens,
> re-run the deploy script, update `.env.local`, then re-register and re-mint
> assets from the Admin Dashboard.

---

## Deployer vs Admin — key distinction

| Role | Identity | Signs what |
|------|----------|------------|
| **Deployer** (`MARKETPLACE_DEPLOYER`) | `cosmosx-admin` CLI key | `deploy`, `initialize` (pays fees) |
| **Admin** (`MARKETPLACE_ADMIN_ADDRESS`) | Your personal Freighter wallet | `register_asset`, `mint_to` (via browser) |

The deployer and admin are **separate**. The deployer only pays gas.
The admin address is recorded on-chain by `initialize()` and is what
`get_admin()` returns. The frontend's Admin tab appears only when the
connected Freighter wallet matches `get_admin()`.

---

## How to deploy

### 1. Ensure the deployer CLI identity is funded

```bash
# Only needed once, or after a Testnet reset wipes funded accounts
stellar keys generate cosmosx-admin --network testnet --fund
```

### 2. Set your admin address and run the script

```bash
export MARKETPLACE_ADMIN_ADDRESS=GDZO4YDPSFISBU5CZKAHNIDB3R6XPLEWWPSAW7HAJKYSTB6RIL5U7N6K

cd contracts/marketplace
bash scripts/deploy-testnet.sh
```

The script will print the new Contract ID and XLM SAC ID.

### 3. Update `.env.local`

```env
VITE_MARKETPLACE_CONTRACT_ID=<Contract ID from script output>
VITE_MARKETPLACE_TOKEN_ID=<XLM SAC ID from script output>
```

### 4. Restart the dev server

```bash
npm run dev
```

### 5. Register and mint assets via Admin Dashboard

1. Open the app and connect Freighter with your admin wallet (`GDZO4YDPSFISBU5CZKAHNIDB3R6XPLEWWPSAW7HAJKYSTB6RIL5U7N6K`).
2. Navigate to **Marketplace → Dashboard → Admin tab**.
3. For each of the 12 exoplanet assets, click **Register Asset** and fill in the form.
4. After registering each asset, click **Mint to address** to mint the initial edition.

> The script no longer performs steps 5–6 (register + mint). Those calls require
> `admin.require_auth()` — only your Freighter wallet can sign them.
> The Admin Dashboard handles this through the browser wallet popup.

---

## Contract Architecture

### Storage model

| Key | Tier | Description |
|-----|------|-------------|
| `DataKey::Admin` | Instance | Admin address set at `initialize()` |
| `DataKey::TokenContract` | Instance | XLM SAC address set at `initialize()` |
| `DataKey::NextOfferId` | Instance | Monotonic offer ID counter |
| `DataKey::Owner(asset_id)` | Persistent | Current owner of an asset |
| `DataKey::Listing(asset_id)` | Persistent | Active listing (price + seller) |
| `DataKey::Offers(asset_id)` | Persistent | Vec of open offers |
| `DataKey::Metadata(asset_id)` | Persistent | Immutable asset description |
| `DataKey::MintedSupply(asset_id)` | Persistent | Editions minted so far |

### Public methods

| Method | Auth required | Description |
|--------|--------------|-------------|
| `initialize(admin, token)` | None | One-time setup. Panics if already called. |
| `register_asset(asset_id, metadata)` | **Admin** | Register a new collectible type |
| `mint_to(asset_id, to)` | **Admin** | Mint a single edition |
| `transfer(asset_id, to)` | Owner | Direct transfer, no payment |
| `list(asset_id, price)` | Owner | List for sale at `price` stroops |
| `delist(asset_id)` | Owner | Cancel a listing |
| `buy(asset_id, buyer)` | Buyer | Buy at listed price (XLM SAC payment) |
| `make_offer(asset_id, price, bidder)` | Bidder | Submit a buy offer (intent only) |
| `accept_offer(asset_id, offer_id)` | Owner | Accept offer (XLM SAC payment) |
| `reject_offer(asset_id, offer_id)` | Owner | Reject offer |
| `owner_of(asset_id)` | None | Current owner (returns `Option`) |
| `has_asset(address, asset_id)` | None | Boolean ownership check |
| `get_listing(asset_id)` | None | Current listing or None |
| `get_offers(asset_id)` | None | All open offers |
| `get_metadata(asset_id)` | None | Immutable metadata (returns `Option`) |
| `get_minted_supply(asset_id)` | None | Editions minted |
| `get_admin()` | None | Admin address |

---

## Deployment history

| Date | Contract ID | Network | Admin | Notes |
|------|-------------|---------|-------|-------|
| 2026-07-17 | *(previous — stale WASM)* | testnet | `GBHR2KCAVJGIWODEELTY2YMDAOTUT5PNW363GJU5FXIS4A5DYQ3SLYFG` | Phase 5 deploy. Admin was `cosmosx-admin` CLI key. |
| *(next deploy)* | *(run script to get ID)* | testnet | `GDZO4YDPSFISBU5CZKAHNIDB3R6XPLEWWPSAW7HAJKYSTB6RIL5U7N6K` | Personal Freighter wallet as admin. |

> After each deploy, fill in the Contract ID and date in the table above.

---

## Admin address

The admin address stored on-chain is set via `MARKETPLACE_ADMIN_ADDRESS` at deploy time.

| Item | Value |
|------|-------|
| **Admin (current)** | `GDZO4YDPSFISBU5CZKAHNIDB3R6XPLEWWPSAW7HAJKYSTB6RIL5U7N6K` (personal Freighter wallet) |
| **Deployer (fee-payer)** | `cosmosx-admin` CLI identity (`GBHR2KCAVJGIWODEELTY2YMDAOTUT5PNW363GJU5FXIS4A5DYQ3SLYFG`) |
| **On-chain source of truth** | `get_admin()` — never hardcoded in frontend |
| **Frontend check** | `useMarketplaceChainState` → `snapshot.admin === wallet.address` |

To verify on-chain after deploy:
```bash
stellar contract invoke \
  --id $VITE_MARKETPLACE_CONTRACT_ID \
  --network testnet \
  -- get_admin
# Expected: GDZO4YDPSFISBU5CZKAHNIDB3R6XPLEWWPSAW7HAJKYSTB6RIL5U7N6K
```

---

## Known limitations

- **No offer escrow** — `make_offer` records intent only; XLM transfers at `accept_offer` time.
- **No `burn()`** — Assets cannot be destroyed once minted.
- **No royalties** — Not planned for Testnet.
- **No on-chain volume** — Dashboard volume uses the local tx log only.

---

## Environment variables

```env
# Required for live blockchain mode
VITE_MARKETPLACE_CONTRACT_ID=C...
VITE_MARKETPLACE_TOKEN_ID=C...

# Optional — used only by the deploy script, not the frontend
MARKETPLACE_DEPLOYER=cosmosx-admin          # CLI key name (default)
MARKETPLACE_ADMIN_ADDRESS=GDZO4YDPSFISBU5CZKAHNIDB3R6XPLEWWPSAW7HAJKYSTB6RIL5U7N6K
```

Without `VITE_MARKETPLACE_CONTRACT_ID`, the UI runs in localStorage (stub) mode.

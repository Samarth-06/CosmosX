# CosmosX Admin Guide

Admin access uses the **existing marketplace `get_admin()` wallet** — the address passed to `initialize()`. There is no second permission system, no roles table, and no Foundation override beyond that address.

## Who is admin?

| Item | Value |
|------|--------|
| Address | `GDZO4YDPSFISBU5CZKAHNIDB3R6XPLEWWPSAW7HAJKYSTB6RIL5U7N6K` |
| Wallet | Personal Freighter wallet |
| On-chain source of truth | `get_admin()` — stored at `initialize()` time |
| Deploy fee-payer | `cosmosx-admin` CLI key (separate; not the admin) |

The Marketplace **Admin** tab appears only when:

1. Contract env vars are set (`VITE_MARKETPLACE_CONTRACT_ID`)
2. Chain snapshot loaded successfully
3. Connected Freighter address **equals** `get_admin()`

## What admin can do (contract-backed)

| Action | Contract method | UI location |
|--------|-----------------|-------------|
| Register asset | `register_asset` | Admin → Register asset |
| Mint to wallet | `mint_to` | Admin → Mint to address / Mint to admin wallet |
| List / update price | `list` | Admin → List / Update (admin-owned only) |
| Delist | `delist` | Admin → Delist |
| View registered / minted | reads | Admin diagnostics + asset lists |
| Network diagnostics | reads + env | Admin → Diagnostics |

## What admin cannot do

| Gap | Reason |
|-----|--------|
| Burn asset | No `burn()` on contract |
| Force-transfer another wallet’s asset | Only owner can `transfer` |
| Escrow / cancel foreign offers without owning asset | Owner-only accept/reject |
| Change admin after initialize | Admin is immutable |

## Operational checklist

1. Connect Freighter with the Foundation wallet.
2. Open Marketplace → Dashboard → **Admin** tab (visible only for admin).
3. Confirm Diagnostics: Contract ID, RPC, Admin wallet match DEPLOYMENT.md.
4. Register → Mint → (optional) List for demo inventory.
5. After each write, wait for Freighter confirmation; UI refreshes chain snapshot.

## Env vars

```env
VITE_MARKETPLACE_CONTRACT_ID=C...
VITE_MARKETPLACE_TOKEN_ID=C...   # XLM SAC on Testnet
VITE_STELLAR_NETWORK=TESTNET
VITE_STELLAR_RPC_URL=https://...
```

Copy from `.env.testnet.example`. Never commit `.env.local`.

> The deploy script also reads `MARKETPLACE_ADMIN_ADDRESS` (not a VITE_ var).
> Set it to your admin wallet address before running `deploy-testnet.sh`:
> ```bash
> export MARKETPLACE_ADMIN_ADDRESS=GDZO4YDPSFISBU5CZKAHNIDB3R6XPLEWWPSAW7HAJKYSTB6RIL5U7N6K
> ```

## Redeploy

If QA still sees `UnreachableCodeReached` on `owner_of` / `buy`, the live WASM is older than source. Re-run:

```bash
cd contracts/marketplace
bash scripts/deploy-testnet.sh
```

Update `.env.local` with the new contract ID and re-initialize + re-register/mint assets as needed (Testnet state does not migrate automatically).

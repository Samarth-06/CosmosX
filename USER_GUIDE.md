# CosmosX User Guide — Marketplace

## What you are trading

Marketplace assets are **tradeable exoplanet collectibles** on Stellar Testnet. They are **not** achievement NFTs.

- Achievement badges (learning path) are soulbound and never appear as marketplace inventory.
- FreighterSimulator on planet modules is an educational overlay — separate from real Freighter trades.

## Connect

1. Install [Freighter](https://www.freighter.app/) and switch to **Testnet**.
2. Fund via [Friendbot](https://laboratory.stellar.org/#account-creator) if balance is zero.
3. Open **Marketplace** → Connect Wallet.
4. Live XLM balance comes from Horizon when the contract is configured.

## Asset states (what badges mean)

| Badge | Meaning | Buy | List | Offer |
|-------|---------|-----|------|-------|
| Not registered | Not on the contract | ✗ | ✗ | ✗ |
| Not minted | Registered, no owner yet | ✗ | ✗ | ✗ |
| Owned by me | You own it, not listed | ✗ | ✓ | ✗ |
| Listed by me | You own it and listed it | ✗ | ✓ (edit price) | ✗ |
| Listed | Someone else listed it | ✓ | ✗ | ✓ |
| Owned by another wallet | Minted, not listed | ✗ | ✗ | ✓ |
| Syncing / Local catalog | Loading or fallback mode | ✗ | limited | ✗ |

**You cannot buy your own asset.** The UI shows “You already own this asset” and disables Buy.

## Trading flow

1. **Buy** — only when the asset is listed by another wallet and you can afford the ask.
2. **List** — only for assets you own; set price in XLM.
3. **Delist** — cancel your listing before transferring.
4. **Offer** — bid on minted assets you do not own (offers are recorded on-chain but **not escrowed** yet).
5. **Accept / reject offer** — only if you own the asset.

## Dashboard

Marketplace → **Dashboard** shows:

- Wallet address and live XLM balance (or local stub balance)
- Owned assets, active listings, offers made / received
- Portfolio valuation (local + listing prices)
- Contract health, last sync time, explorer link
- **Admin** tab only if your wallet is the Foundation admin

## Live vs fallback

| Mode | When | Behavior |
|------|------|----------|
| Live on-chain | `VITE_MARKETPLACE_CONTRACT_ID` set and RPC OK | Ownership / listings / offers from Soroban |
| Local fallback | Env missing or RPC error | `localStorage` store; clear “fallback / degraded” status; app does not crash |

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| “Not minted” on many planets | Correct for unminted catalog IDs; Foundation has only minted a subset |
| Buy fails / trap | Asset not listed, self-buy, or outdated contract WASM — see ADMIN_GUIDE redeploy |
| Balance 0 | Need Friendbot Testnet XLM |
| Admin tab missing | Connected wallet ≠ `get_admin()` |

## Explorer

Use Stellar Expert Testnet links from successful tx toasts or the dashboard contract link.

# Deployment — CosmosX Testnet

Primary deployment logs:

- Marketplace: [`contracts/marketplace/DEPLOYMENT.md`](contracts/marketplace/DEPLOYMENT.md)
- Achievement: [`contracts/achievement/DEPLOYMENT.md`](contracts/achievement/DEPLOYMENT.md)

## Frontend env

Copy `.env.testnet.example` → `.env.local`:

```env
VITE_STELLAR_NETWORK=TESTNET
VITE_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
VITE_HORIZON_URL=https://horizon-testnet.stellar.org
VITE_ACHIEVEMENT_CONTRACT_ID=C...
VITE_MARKETPLACE_CONTRACT_ID=CDU5VJVV4CPG7CAPZ7UZSITGBEXZ26OOLLXDYBANOGGRCEHXLFP6HMX7
VITE_MARKETPLACE_TOKEN_ID=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC

```

Without marketplace contract IDs, the UI runs in **localStorage fallback** mode.

## Marketplace deploy (summary)

```bash
cd contracts/marketplace
export MARKETPLACE_ADMIN_ADDRESS=GDZO4YDPSFISBU5CZKAHNIDB3R6XPLEWWPSAW7HAJKYSTB6RIL5U7N6K
bash scripts/deploy-testnet.sh
# Paste Contract ID + Token ID into .env.local
# Then use the Admin Dashboard in the browser to register_asset and mint_to
```

After changing Rust sources that affect ABI or panic behavior, **redeploy** and update env. Frontend read-path mitigations (`get_minted_supply` before `owner_of`) reduce traps on older WASM but do not replace a redeploy for write-path fixes.

## Verify

1. `cargo test --manifest-path contracts/marketplace/Cargo.toml`
2. `npm run build` (or `npx tsc --noEmit`)
3. Browser: connect Freighter Testnet with admin wallet `GDZO4YDPSFISBU5CZKAHNIDB3R6XPLEWWPSAW7HAJKYSTB6RIL5U7N6K` → Admin tab visible
4. Connect with any other wallet → Admin tab hidden
5. Buy disabled when you already own the asset

## Docs index

| Doc | Audience |
|-----|----------|
| [README.md](README.md) | Product overview |
| [CONTRACTS.md](CONTRACTS.md) | Contract API + errors |
| [ADMIN_GUIDE.md](ADMIN_GUIDE.md) | Foundation wallet ops |
| [USER_GUIDE.md](USER_GUIDE.md) | Traders / demo |
| [ROADMAP.md](ROADMAP.md) | What’s next |

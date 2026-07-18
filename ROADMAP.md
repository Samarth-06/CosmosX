# CosmosX Roadmap

Status as of the Testnet marketplace harden pass (2026-07).

## Done (Testnet)

- [x] React + Vite app with planet learning path
- [x] Stellar Wallet Kit / Freighter connect
- [x] Achievement (soulbound) Soroban contract + mint UI
- [x] Marketplace Soroban contract (register / mint / list / buy / offer)
- [x] Testnet deploy + env wiring
- [x] Live XLM balance (Horizon)
- [x] Live ownership / listings / offers reads with localStorage fallback
- [x] Admin panel gated on `get_admin()`
- [x] Contract error model (`Result` / `Option`) — redeploy to activate on-chain
- [x] Clear asset trade-state UX (minted / listed / owned by me / etc.)

## Near term

- [ ] Redeploy marketplace WASM with panic-free reads/writes; re-seed demo assets
- [ ] Expand mint coverage for remaining registered IDs used in demos
- [ ] Offer UX polish (made vs received filters, clearer escrow disclaimer)
- [ ] Keep FreighterSimulator as education-only; never confuse with live trades

## Future — Mercury modules

Mercury curriculum modules deepen blockchain fundamentals in-product. They are **not** required for marketplace Testnet demo and are tracked separately from Soroban trading.

## Future — Mainnet

- Mainnet contract deploy + hardened ops (TTL fees, monitoring)
- Real economic parameters (escrowed offers, royalties if product requires)
- Mercury / auth / progress backends as product needs dictate

**Do not implement Mercury modules or Mainnet in the current Testnet stabilization track.**

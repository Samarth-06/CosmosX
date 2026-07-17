# Deployment Record — Achievement Contract

> Testnet resets periodically and wipes deployed contracts. When that happens,
> re-run `scripts/deploy-testnet.sh` (added in Phase 7) and update the values
> below **and** `.env.local` (Phase 4) with the new contract ID.

## Current Testnet deployment

| Field | Value |
|---|---|
| **Contract ID** | `CB2LK3AMJT2K5K5AV5BWPJ6MUFNZ5PUNPUYNJXKZ66BLLDSV4UMIRQJQ` |
| **Network** | Testnet (`Test SDF Network ; September 2015`) |
| **Admin (deployer)** | `GBHR2KCAVJGIWODEELTY2YMDAOTUT5PNW363GJU5FXIS4A5DYQ3SLYFG` (`cosmosx-admin`) |
| **Wasm hash** | `e74caa0c10e3e8af2f977691e7560d1b6ef700a7df390f610ecb23b60738e5a6` |
| **Deployed** | 2026-07-17 |

## Explorer links

- Contract: https://stellar.expert/explorer/testnet/contract/CB2LK3AMJT2K5K5AV5BWPJ6MUFNZ5PUNPUYNJXKZ66BLLDSV4UMIRQJQ
- Deploy tx: https://stellar.expert/explorer/testnet/tx/03a7c03cbfc1f84fd09ce1a9936bc0a6f72fbc4fc6131fbdd4d4a1e8764fdedf
- Initialize tx: https://stellar.expert/explorer/testnet/tx/2da8d94f102c907af8d880adcc7e1fb4271236a3ded702df97cd122fb900bf97
- Smoke-test mint tx: https://stellar.expert/explorer/testnet/tx/788a515d8e271f2a126b577e80be5ed836bb4c74eb6b1ec60e8ed8c5cfe6a668

## CLI verification performed (Phase 3)

- `initialize --admin <admin>` → success
- `get_admin` → returns admin address ✅
- `mint --to <admin>` → success, emitted `mint` event with admin address ✅
- `has_achievement --who <admin>` → `true` ✅
- `has_achievement --who <freighter>` → `false` ✅ (expected: player mints via their
  own Freighter signature in the live UI, Phase 5 — the CLI cannot sign for that key,
  which is the `to.require_auth()` security model working correctly)
- `stellar events` → `mint` event confirmed on-ledger (ledger 3652618) ✅

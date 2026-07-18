# Deployment Record — Achievement Contract

> Testnet resets periodically and wipes deployed contracts. When that happens,
> re-run `scripts/deploy-testnet.sh` and update the values below **and** the
> frontend `.env.local` (`VITE_ACHIEVEMENT_CONTRACT_ID`) with the new contract ID.

## Current Testnet deployment

| Field | Value |
|---|---|
| **Contract ID** | `CAOVKUPD2VVWH7DFIRV57WBG6SRXXHIMUDCSWDNAL3SGCPE2GZEWVK3W` |
| **Network** | Testnet (`Test SDF Network ; September 2015`) |
| **Admin (deployer)** | `GBHR2KCAVJGIWODEELTY2YMDAOTUT5PNW363GJU5FXIS4A5DYQ3SLYFG` (`cosmosx-admin`) |
| **Wasm hash** | `e74caa0c10e3e8af2f977691e7560d1b6ef700a7df390f610ecb23b60738e5a6` |
| **Deployed** | 2026-07-17 (redeploy rehearsal) |

## Explorer link

- Contract: https://stellar.expert/explorer/testnet/contract/CAOVKUPD2VVWH7DFIRV57WBG6SRXXHIMUDCSWDNAL3SGCPE2GZEWVK3W

  The contract page lists the deploy transaction and every invocation. On-chain
  state confirms `storage_entries: 1` (the admin recorded by `initialize`).

## Verification (current contract)

- `get_admin` → returns `GBHR2KCA…LYFG` (the `cosmosx-admin` deployer) ✅
- `has_achievement --who <admin>` → `false` (fresh redeploy; no mints yet) ✅
- `has_achievement --who <freighter>` → `false` — expected: players mint via
  their own Freighter signature in the live UI, since `mint` requires
  `to.require_auth()`. The CLI cannot sign for a wallet it doesn't hold, which
  is the security model working correctly.

> Note: a live end-to-end player mint (Freighter-signed) was verified during
> Phase 5 against the previous contract instance
> `CB2LK3AMJT2K5K5AV5BWPJ6MUFNZ5PUNPUYNJXKZ66BLLDSV4UMIRQJQ`. This record was
> updated after a Phase 7 redeploy rehearsal produced the new contract ID above.

## Redeploy in one command

```bash
cd contracts/achievement
./scripts/deploy-testnet.sh
```

Builds → deploys → initializes → prints the new contract ID. Then paste that ID
into the frontend `.env.local` as `VITE_ACHIEVEMENT_CONTRACT_ID` and restart the
dev server (Vite only reads env files at startup).

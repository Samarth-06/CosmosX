# CosmosX Achievement Contract

A minimal Soroban smart contract that records the CosmosX **Mercury completion
achievement** on Stellar. It lives inside the CosmosX repo (single-repo
submission) but is a fully self-contained Rust/Cargo workspace — it shares
nothing with the surrounding Node/Vite app.

## What it does

| Function | Auth | Description |
|---|---|---|
| `initialize(admin)` | — | One-time. Records the deployer/owner. Panics if re-run. |
| `mint(to)` | `to` signs | Grants the achievement to `to`. **The recipient's own wallet must sign** — this is the on-stage "player claims their own achievement" flow. Panics if not initialized or already minted. Emits a `mint` event. |
| `has_achievement(who) -> bool` | read | Whether `who` has earned it. |
| `get_admin() -> Address` | read | The admin recorded at `initialize`. |

### Why `to.require_auth()` and not `admin.require_auth()`?

Deliberate CosmosX design decision: the **player's connected wallet signs their
own claim**, live, in Freighter. The alternative (admin-gated minting via a
hidden backend signature) is explicitly *not* what we want — it's less
demo-credible and would require a backend this slice doesn't have.

Storage uses the `instance` tier (lives as long as the contract, simplest to
reason about for this small dataset).

## Build & test (local, no network)

```bash
cd contracts/achievement
cargo test              # runs the unit tests natively — fast, no network
stellar contract build  # compiles to target/wasm32v1-none/release/achievement.wasm
```

## Deploy to Testnet

See `scripts/deploy-testnet.sh` (added in a later phase) for the one-command
build → deploy → initialize flow. Testnet resets periodically and wipes deployed
contracts, so redeploying from scratch is a routine operation, not an emergency.

Manual equivalent:

```bash
stellar contract build
stellar contract deploy \
  --wasm target/wasm32v1-none/release/achievement.wasm \
  --source cosmosx-admin --network testnet
# → prints a C... contract ID
stellar contract invoke --id <CONTRACT_ID> --source cosmosx-admin --network testnet \
  -- initialize --admin $(stellar keys address cosmosx-admin)
```

The deploy identity is `cosmosx-admin` (a CLI-only Testnet key, separate from
any personal Freighter wallet).

## Toolchain notes (Windows / GNU) — read before touching dependencies

This crate was brought up on a **Windows `x86_64-pc-windows-gnu`** toolchain.
Two non-obvious fixes make it build; both are already applied — don't undo them:

1. **`Cargo.lock` is committed and pins `ed25519-dalek = 2.1.1`.**
   `soroban-env-host` declares `ed25519-dalek = ">=2.0.0"` (no upper bound), so a
   fresh resolve grabs `3.0.0`, whose API its own `testutils` doesn't compile
   against (a `rand_core` version diamond — surfaces as a bogus
   `ChaCha20Rng: CryptoRng`/`DerefMut` error). The lockfile pin collapses the
   tree to a single `ed25519-dalek 2.x`. **If you ever regenerate the lockfile**
   (`cargo update` / delete `Cargo.lock`) and tests break, re-apply:
   ```bash
   cargo update -p ed25519-dalek@3.0.0 --precise 2.1.1
   ```

2. **`[lib] crate-type = ["rlib"]`, not `["cdylib", "rlib"]`.**
   Building a native `cdylib` on the mingw linker fails with
   `export ordinal too large` because Soroban's dep graph exports too many
   symbols. We don't need it: `cargo test` only needs the rlib, and
   `stellar contract build` passes `--crate-type=cdylib` itself for the
   `wasm32v1-none` target (which uses `rust-lld`, not mingw). On an MSVC
   toolchain you could restore `["cdylib", "rlib"]` safely.

Also: Rust targets are **per-toolchain**. The `wasm32v1-none` target must be
installed on whichever toolchain is active (`rustup show active-toolchain`):
```bash
rustup target add wasm32v1-none
```


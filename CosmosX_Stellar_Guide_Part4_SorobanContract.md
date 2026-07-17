# CosmosX Stellar Build Guide — Part 4: Your First Soroban Smart Contract

**Series:** Part 4 of 7. Requires Parts 1–3 completed and verified (Rust + wasm32v1-none target + Stellar CLI installed; Testnet configured; Freighter funded).

**Part 4 covers:** creating a real Soroban contract from an empty folder, understanding every piece of its code, testing it locally, deploying it to Testnet, invoking it, reading its storage and events back, and safely redeploying it (which you now know, from Part 3, you'll need to do at least once before demo day).

**What you're building:** a minimal **Achievement contract** — an admin-controlled record of "this Stellar address has earned the CosmosX Mercury achievement." This is intentionally simpler than a full NFT-standard contract so you understand every line; Part 6 notes how to later upgrade to a standards-compliant NFT if you want to.

---

## Step 1 — Create the project scaffold

### Why?
The Stellar CLI has a built-in scaffolding command that sets up the correct folder/Cargo structure for you — a Cargo *workspace* containing one or more contracts. Doing this by hand is possible but error-prone; use the official generator.

### What will happen
`stellar contract init` creates a new folder with a working example contract already inside it (a placeholder), which you'll then modify.

### Exact steps
Run this **outside** your CosmosX repo, in a separate folder — keep contract code in its own project for now; you'll copy the compiled output into CosmosX later (Part 6 explains exactly where).

```bash
cd ~/dev                     # or wherever you keep projects
stellar contract init cosmosx-stellar --name achievement
cd cosmosx-stellar
```

### What this created
```bash
cosmosx-stellar/
├── Cargo.toml              # workspace root
├── README.md
└── contracts/
    └── achievement/
        ├── Cargo.toml       # this contract's own manifest
        └── src/
            ├── lib.rs        # the contract code (currently a placeholder)
            └── test.rs       # tests for the contract
```

### Verify
```bash
find . -maxdepth 3
```
You should see exactly the structure above.

### Common beginner mistakes
- Running this *inside* the CosmosX frontend repo, mixing a Rust workspace with your Node project's file tree — keep them as sibling folders instead; you'll copy only the built `.wasm` and generated TS bindings into CosmosX later.
- Forgetting `--name achievement` and getting the default `hello_world` contract name instead — not fatal, just rename references as you go if this happens.

---

## Step 2 — Understand (and replace) the placeholder contract

### Why?
Before writing your own logic, look at what `stellar contract init` gave you, so you understand the *shape* every Soroban contract has.

### Open `contracts/achievement/src/lib.rs`
You'll see something like a simple "hello" function. Every Soroban contract shares this shape:
```rust
#![no_std]
use soroban_sdk::{contract, contractimpl, Env, Symbol};

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    pub fn hello(env: Env, to: Symbol) -> Symbol {
        // ...
    }
}
```
- `#![no_std]` — Soroban contracts don't use Rust's standard library (no filesystem, no threads — you're in a constrained on-chain execution environment). `soroban_sdk` provides everything you actually need instead.
- `#[contract]` — marks a Rust struct as *the* contract type.
- `#[contractimpl]` — marks the block of functions as the contract's **public, callable interface**. Every `pub fn` inside becomes something your frontend (Part 5) or the CLI (this part) can call directly by name.
- `Env` — every contract function's first parameter is almost always `Env`: your handle to everything about the current execution context (storage, the caller's identity, emitting events, etc.).

### Now replace it with the Achievement contract
Replace the **entire contents** of `contracts/achievement/src/lib.rs` with:

```rust
#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Map};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Achievements,
}

#[contract]
pub struct AchievementContract;

#[contractimpl]
impl AchievementContract {
    /// Runs once, right after deployment, to set who is allowed to mint.
    pub fn initialize(env: Env, admin: Address) {
        env.storage().instance().set(&DataKey::Admin, &admin);
    }

    /// Grants the achievement to `to`. Only the admin can call this.
    pub fn mint(env: Env, to: Address) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("contract not initialized");

        // This is the access-control check. If whoever is calling this
        // transaction did not also provide the admin's authorization,
        // execution stops here and nothing is written.
        admin.require_auth();

        let mut achievements: Map<Address, bool> = env
            .storage()
            .instance()
            .get(&DataKey::Achievements)
            .unwrap_or(Map::new(&env));

        achievements.set(to.clone(), true);
        env.storage().instance().set(&DataKey::Achievements, &achievements);

        // Emit an event so off-chain code (your frontend, Part 5) can
        // react to this mint without re-reading storage.
        env.events().publish((symbol_short!("mint"),), to);
    }

    /// Read-only: does `who` have the achievement?
    pub fn has_achievement(env: Env, who: Address) -> bool {
        let achievements: Map<Address, bool> = env
            .storage()
            .instance()
            .get(&DataKey::Achievements)
            .unwrap_or(Map::new(&env));

        achievements.get(who).unwrap_or(false)
    }

    /// Read-only: who is the admin?
    pub fn get_admin(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("contract not initialized")
    }
}
```

### Line-by-line, the parts that matter most
- **`DataKey` enum** — Soroban storage is a key-value store; this enum defines the *keys* you'll use. `Admin` maps to one Address; `Achievements` maps to a `Map<Address, bool>` of everyone who's earned it.
- **`env.storage().instance()`** — one of three storage tiers Soroban offers (`instance`, `persistent`, `temporary`), each with different cost/lifetime tradeoffs. `instance` storage lives as long as the contract itself and is the simplest to reason about — correct choice for this small amount of data.
- **`admin.require_auth()`** — this is the entire security model of the mint function. It means: "this function will only actually execute if the transaction includes a valid authorization from `admin`." Without this line, **anyone** could call `mint()` for themselves — this is exactly the security mistake flagged as essential to avoid in the earlier architecture/roadmap documents.
- **`env.events().publish(...)`** — writes a queryable event to the ledger, tagged with the short symbol `"mint"`, carrying the recipient's address as data. You'll read this back in Step 6.

### What could go wrong
- Typos in storage key names between `mint` and `has_achievement` (if you were writing this from scratch rather than copying) — using the shared `DataKey` enum, as above, prevents this entire class of bug by making the compiler check it for you.

---

## Step 3 — Write a test

### Why?
`cargo test` runs entirely on your machine, instantly, with no network involved — this is where you catch logic bugs *before* burning a Testnet deploy on them. Never skip this step to "save time"; it costs you more time later when you're debugging on a live network instead.

### Replace `contracts/achievement/src/test.rs` with:
```rust
#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, Env};

#[test]
fn test_mint_and_check() {
    let env = Env::default();
    env.mock_all_auths(); // in tests, skip real signature verification

    let contract_id = env.register(AchievementContract, ());
    let client = AchievementContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let player = Address::generate(&env);

    client.initialize(&admin);

    // Before minting, player should not have the achievement
    assert_eq!(client.has_achievement(&player), false);

    client.mint(&player);

    // After minting, player should have it
    assert_eq!(client.has_achievement(&player), true);
    assert_eq!(client.get_admin(), admin);
}
```

### What's happening here
- `Env::default()` — spins up an in-memory simulated ledger for the test, no network needed.
- `env.mock_all_auths()` — tests don't want to deal with real cryptographic signatures; this tells the test environment to treat every `require_auth()` call as automatically satisfied. (Real Testnet/Mainnet calls always require real signatures — this is test-only.)
- `env.register(...)` + `...Client::new(...)` — the SDK auto-generates a typed `AchievementContractClient` from your `#[contractimpl]` block; this is the same pattern you'll see again in Part 5 for the frontend.

### Exact steps
```bash
cd contracts/achievement
cargo test
```

### Verify
**Expected output:** `test test_mint_and_check ... ok`, and a summary line like `test result: ok. 1 passed; 0 failed`.

### What could go wrong
- Compile errors here almost always mean either a typo in the contract code or a missing `use` import — read the Rust compiler error message top to bottom; it usually names the exact line and issue.
- If you forgot `env.mock_all_auths()`, the test will fail specifically at the `mint` call with an authorization error — this is actually a good sign your `require_auth()` line is working correctly, you just need the mock in tests.

### Common beginner mistakes
- Running `cargo test` from the workspace root and being confused by output from *other* placeholder contracts if you generated more than one — `cd` into the specific contract folder, or use `cargo test -p achievement`.

---

## Step 4 — Build the contract for deployment

### Why?
Tests run as native code; deployment requires a **compiled WASM binary** — a completely different build target.

### Important: use `stellar contract build`, not raw `cargo build`
Current official guidance is explicit: **build with `stellar contract build`, not `cargo build` directly** — the CLI wrapper sets the correct target (`wasm32v1-none`) and required build profile automatically. ([Stellar Docs – soroban-sdk build guidance](https://developers.stellar.org/docs/build/smart-contracts/getting-started/hello-world))

### Exact steps
From inside `contracts/achievement/` (or the workspace root — both work):
```bash
stellar contract build
```

### What will happen
Cargo compiles your Rust code to WebAssembly. The first run is slower (compiling all dependencies); subsequent builds are fast.

### Where the output goes
```
target/wasm32v1-none/release/achievement.wasm
```

### Verify
```bash
ls -la target/wasm32v1-none/release/*.wasm
```
You should see a `.wasm` file, typically tens of kilobytes.

### What could go wrong
- **`can't find crate for 'core'`** — you're missing the `wasm32v1-none` target from Part 1, Step 3. Fix with `rustup target add wasm32v1-none`.
- Build errors referencing `wasm32-unknown-unknown` from an old tutorial you were half-following — that target is **not supported** on current Rust toolchains for Soroban; use `stellar contract build`, which handles the correct target for you automatically.

---

## Step 5 — Generate a Testnet identity for deployment

### Why?
You need a Stellar identity the CLI can sign with non-interactively (separate from your personal Freighter wallet) to act as this contract's **admin/deployer**. Keeping this separate from your personal wallet (as flagged in earlier planning) means you always know exactly who has admin rights over the contract.

### Exact steps
```bash
stellar keys generate --global cosmosx-admin --network testnet --fund
```
- `--global` stores this identity for use across projects on your machine.
- `--fund` automatically calls Friendbot for you.

### Verify
```bash
stellar keys address cosmosx-admin
```
**Expected output:** a `G...` address. Copy it — you'll need it in the next step.

Confirm it's funded:
```bash
stellar keys fund cosmosx-admin --network testnet
```
(Safe to re-run; it just funds again if needed, or no-ops if already funded.)

### Common beginner mistakes
- Losing track of which identity (`cosmosx-admin` vs. your personal Freighter account) is the actual on-chain admin — write it down alongside your contract ID once deployed (Step 7).

---

## Step 6 — Deploy to Testnet

### Why?
This is the moment your contract goes from "code on my laptop" to "a real, independently verifiable thing on Stellar Testnet."

### Exact steps
```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/achievement.wasm \
  --source cosmosx-admin \
  --network testnet
```

### What will happen
The CLI uploads your compiled WASM, creates a contract instance on Testnet, and prints out a **contract ID** — a long string starting with `C...`.

```
Contract deployed successfully: CABC123...XYZ
```

**Copy this contract ID somewhere durable right now** — a scratch note, your README, wherever. You'll need it constantly from here on.

### Now initialize it
Deploying and initializing are separate steps for this contract (some contracts combine them via constructor args at deploy time — ours calls `initialize` explicitly):
```bash
stellar contract invoke \
  --id <YOUR_CONTRACT_ID> \
  --source cosmosx-admin \
  --network testnet \
  -- \
  initialize \
  --admin $(stellar keys address cosmosx-admin)
```

### Verify
```bash
stellar contract invoke \
  --id <YOUR_CONTRACT_ID> \
  --source cosmosx-admin \
  --network testnet \
  -- \
  get_admin
```
**Expected output:** the same `G...` address as `cosmosx-admin`.

### What could go wrong
- **"account not found"** — your `cosmosx-admin` identity isn't funded; go back to Step 5.
- **Deploy succeeds but `initialize` fails with an auth error** — double-check you're using `--source cosmosx-admin` on both commands; the deployer and the initializer need to match here.
- **Forgetting to run `initialize` at all**, then getting `"contract not initialized"` panics on every later call — this is one of the most common first-timer mistakes; deploy and initialize are two separate calls for this contract, don't skip the second one.

### Common beginner mistakes
- Copying the contract ID with a trailing space or missing character from your terminal — triple check it, or better, store it in a shell variable for the rest of this session: `export ACHIEVEMENT_CONTRACT_ID=<your id>` and use `$ACHIEVEMENT_CONTRACT_ID` in every command below.

---

## Step 7 — Invoke `mint` and verify storage

### Exact steps
Mint the achievement to your **own personal Freighter address** (from Part 2) so you can see the full loop:
```bash
stellar contract invoke \
  --id $ACHIEVEMENT_CONTRACT_ID \
  --source cosmosx-admin \
  --network testnet \
  -- \
  mint \
  --to <YOUR_FREIGHTER_PUBLIC_ADDRESS>
```

### Verify via the contract itself
```bash
stellar contract invoke \
  --id $ACHIEVEMENT_CONTRACT_ID \
  --source cosmosx-admin \
  --network testnet \
  -- \
  has_achievement \
  --who <YOUR_FREIGHTER_PUBLIC_ADDRESS>
```
**Expected output:** `true`

### Verify via Stellar Lab (no CLI needed — this is what mentors will do)
1. Go to `lab.stellar.org`.
2. Find the **Contract Explorer**.
3. Select **Testnet**, paste your contract ID.
4. You should see your `Achievements` storage entry listed, with your address mapped to `true`.

### Verify via Stellar Expert
1. Go to `stellar.expert`, switch to **Testnet**.
2. Search your contract ID.
3. You should see the deployment transaction and the `mint` invocation in its transaction history.

### What could go wrong
- **Trying to mint without `--source cosmosx-admin`** — you'll get an authorization failure, because `require_auth()` in the contract is checking specifically for the admin's signature, not just any signature.

---

## Step 8 — Read the event you emitted

### Why?
This is what will eventually let your React frontend show "minted!" instantly, without a slow storage re-read.

### Exact steps
```bash
stellar events \
  --id $ACHIEVEMENT_CONTRACT_ID \
  --network testnet \
  --start-ledger -100
```
(`--start-ledger -100` means "look back roughly 100 ledgers" — adjust higher if your mint happened a while ago.)

### Verify
You should see a JSON event entry with topic `mint` and the recipient address as its data, matching your Step 7 invocation.

### Common beginner mistakes
- Setting the ledger lookback window too small and seeing "no events" purely because you're not looking far enough back — widen the range.

---

## Step 9 — Practice a full delete-and-redeploy (this is not optional)

### Why?
Remember Part 3: **Testnet resets without warning.** You need to know, right now, in a low-stress moment, exactly how long a full redeploy takes and that your process actually works — not discover this for the first time in a panic the morning of your demo.

### Exact steps (do this now, as practice)
1. Rebuild: `stellar contract build`
2. Redeploy: repeat Step 6 exactly, from scratch, as if this were a brand-new contract.
3. Note: **you will get a brand-new contract ID.** This is expected — a redeploy is a new instance, not an update to the old one (true, in-place *upgrades* are a separate, more advanced Soroban feature you don't need for this slice).
4. Re-run `initialize` and `mint` against the *new* ID.
5. Time yourself. Write the total elapsed time down.

### Why this matters directly for Part 6 and Part 7
In Part 6 you'll turn Steps 4–7 above into a single script (`deploy-testnet.sh`) so this entire process takes one command instead of eight manual ones. In Part 7 (Demo Prep) you'll be required to run that script at least once against a **freshly reset-simulated** environment before you're allowed to call the project demo-ready.

---

## Part 4 checklist

- [ ] Contract scaffolded via `stellar contract init`
- [ ] `lib.rs` replaced with the Achievement contract, understood line by line
- [ ] `cargo test` passes locally
- [ ] `stellar contract build` produces a `.wasm` file
- [ ] Dedicated `cosmosx-admin` Testnet identity created and funded
- [ ] Contract deployed, contract ID saved somewhere durable
- [ ] `initialize` and `mint` both invoked successfully
- [ ] Achievement confirmed via CLI, Stellar Lab, **and** Stellar Expert (all three, not just one)
- [ ] Event read back successfully via `stellar events`
- [ ] Full redeploy practiced once, timed

**Next:** Part 5 — connecting this contract to a React frontend: installing the Stellar Wallets Kit, generating TypeScript bindings, building a wallet-connect hook, and calling `mint` from a button click.

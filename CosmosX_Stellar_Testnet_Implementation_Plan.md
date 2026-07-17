# CosmosX — Stellar Testnet Implementation Plan (Execution Document)

**Purpose:** step-by-step path from "no Stellar code" to a credible, live Testnet slice. Facts are sourced from official Stellar docs and linked inline; anything not officially confirmed is marked `[Inference]`.

---

## 1) Recommended Tools — The Real Stack

| Tool | What it is | Why it matters | Essential/Optional | Alternative | Skill level | Fits CosmosX? |
|---|---|---|---|---|---|---|
| **Stellar Wallets Kit** (`@creit.tech/stellar-wallets-kit`) | Unified wallet-connect modal supporting Freighter, Albedo, xBull, etc. | One integration surface instead of hand-rolling Freighter's API directly; same code path scales to Mainnet later | **Essential** | Freighter's raw API alone | Beginner-friendly | Yes — use this, not raw Freighter, as your `useWallet()` layer |
| **Freighter** (browser extension) | SDF's own non-custodial wallet | This is the wallet you and mentors will actually have installed and demo with | **Essential** (as the wallet behind the Kit) | Albedo, xBull (also supported by the Kit) | Beginner-friendly | Yes |
| **`@stellar/stellar-sdk`** (JS/TS) | Client library for building/signing transactions, talking to Horizon + RPC | This is the only Stellar JS package you install — `stellar-sdk` (no scope) is **deprecated**, and `@stellar/stellar-base` is now folded into it, so don't install it separately | **Essential** | None — this is *the* SDK | Beginner-friendly | Yes |
| **Stellar CLI** (`stellar` command) | Build/deploy/invoke Soroban contracts from the terminal | Official path for contract lifecycle: init → build → test → deploy → invoke | **Essential** | Scaffold Stellar (wraps it, see below) | Intermediate (Rust required) | Yes |
| **Rust + `wasm32v1-none` target** | Language/target Soroban contracts compile to | Contracts are WASM; no way around this | **Essential** | None | Intermediate | Yes |
| **OpenZeppelin Stellar Contracts** (`stellar-tokens`/`stellar-access` crates + Wizard) | Audited, ready-made NFT/fungible-token/access-control contract modules | Don't hand-write a mint function or admin-gating from scratch under time pressure — use audited primitives | **Essential** | Writing your own from the raw `soroban-sdk` example contracts | Beginner-friendly (via Wizard) | Yes — use for your achievement/NFT contract |
| **`npx @stellar/stellar-sdk generate`** | Generates typed TS client bindings from a deployed/compiled contract | Turns "call a Soroban contract" into a typed function call from React instead of hand-built XDR | **Essential** | Manual XDR construction | Beginner-friendly | Yes |
| **Stellar Lab** (`lab.stellar.org`) | Official web UI: create/fund accounts, build transactions, deploy/invoke contracts, XDR↔JSON viewer, transaction debugger | Your primary **debugging and verification** tool — no local setup needed, works from any browser including a mentor's laptop | **Essential** | Manual `curl` to RPC/Horizon | Beginner-friendly | Yes — use constantly during dev and on stage as a backup |
| **Stellar Expert** (`stellar.expert`) | Public block explorer | What you'll actually link judges to for proof | **Essential** | Stellar Lab (also shows tx detail) | Beginner-friendly | Yes |
| **Friendbot** | Testnet faucet | Funds any Testnet account with test XLM | **Essential** | Fund via Stellar Lab's UI (calls Friendbot for you) | Beginner-friendly | Yes |
| **`stellar/quickstart` Docker image** | Runs a full local Stellar network (Core+Horizon+RPC) | Lets you develop/test without touching shared Testnet at all — faster iteration, no reset risk | **Recommended, not essential** | Just develop directly against Testnet | Intermediate | Optional for CosmosX's timeline — see trade-off below |
| **Scaffold Stellar** | Higher-level CLI/toolkit + frontend scaffolding + contract registry, built on top of the Stellar CLI | Speeds up "idea → working full-stack dApp"; installable via `cargo-binstall` | **Optional** | Doing it manually via Stellar CLI (more control, more typing) | Intermediate | Optional — evaluate once wallet+one contract already works; don't adopt mid-sprint |
| **`cargo test`** | Rust's built-in test runner | Soroban's own example contracts ship with unit tests this way — this is the official testing pattern for contracts | **Essential** | None | Beginner-friendly | Yes — test the contract before every deploy |

**Trade-off called out explicitly — Local Quickstart vs. shared Testnet:** Quickstart gives you a private network immune to Testnet resets and network hiccups, which is genuinely valuable given your event timeline. But it adds Docker as a dependency and one more "which network am I even on" failure mode. **Recommendation for CosmosX specifically:** develop and iterate against Quickstart's `local` mode; do your final deploy and all demo rehearsals against real Testnet, since that's what a judge with their own Freighter can independently verify — a contract only deployed to your local Docker network proves nothing to anyone outside your laptop.

---

## 2) Pre-Build Checklist (before writing any Stellar code)

**Understand first:**
- [ ] The difference between a **classic Stellar account/asset** and a **Soroban contract** — you are building the latter for your achievement layer.
- [ ] That **Testnet resets periodically**, wiping all accounts/contracts/data — nothing you build should assume Testnet state survives forever. ([Stellar Docs – Networks](https://developers.stellar.org/docs/networks))
- [ ] That your backend/frontend will **never hold a user's private key** — the wallet signs, you never do.
- [ ] The Soroban auth model well enough to know your mint function needs access control, not "anyone can call it."

**Accounts/setup:**
- [ ] Freighter installed, switched to Testnet, and personally funded via Friendbot.
- [ ] A separate **admin/deployer Testnet identity** (via `stellar keys generate`) distinct from your personal Freighter identity — this is the account that deploys and administers the contract.
- [ ] GitHub repo ready to hold contract source (SCF later requires open-sourcing Soroban contracts if you continue that path).

**Architecture decisions to settle before coding:**
- [ ] Which single mission triggers the mint (don't design a general "any mission can mint" system yet — pick one).
- [ ] What the achievement/NFT represents (a single "Mercury Graduate" badge is enough — do not plan per-module NFTs yet).
- [ ] Where the "Stellar layer" lives in the frontend (a dedicated `src/lib/stellar/` module — see §5) so it's not scattered across mission components.
- [ ] Whether minting happens **client-signed only** (player's own wallet pays/signs everything, simplest) vs. **admin-sponsored** (your deployer account pays fees, more complex, requires a backend). **Recommendation: client-signed only for the Testnet slice.** Sponsored transactions are real but unnecessary complexity for this milestone.

**Environment variables/keys needed:**
```
VITE_STELLAR_NETWORK=TESTNET
VITE_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
VITE_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
VITE_ACHIEVEMENT_CONTRACT_ID=            # filled in after deploy
STELLAR_DEPLOYER_SECRET=                 # server-side/CLI only, never shipped to frontend
```
- [ ] `.env.testnet` created and **added to `.gitignore`** for the secret key file/identity.

**Contracts/assets to plan (and no more than this):**
- [ ] One NFT contract (OpenZeppelin `Base` variant), one `mint()` function, gated to your deployer address.

**Demo goals to lock in before coding starts:**
- [ ] The exact sentence you'll say on stage: "connect wallet → complete this mission → mint this proof → here it is on Stellar Expert."
- [ ] Agreement that nothing else is in scope until this sentence is true end-to-end.

---

## 3) Build Sequence (in order)

### Step 1 — Project setup for the Stellar layer
**Build:** `src/lib/stellar/` folder with `walletKit.ts` (Kit config), `contractClient.ts` (generated bindings import), `network.ts` (env-driven constants).
**Why now:** every later step imports this; get the seam right before there's code depending on it.
**Depends on:** nothing.
**Done when:** the module exports a configured `StellarWalletsKit` instance and typed network constants, with zero UI wired yet.
**Common mistake:** importing `@stellar/stellar-sdk` directly inside a mission component "just this once" — don't; route everything through this module.
**Verify:** `npm run build` succeeds with the new module unused/unimported elsewhere yet.

### Step 2 — Wallet connect
**Build:** a `WalletConnectButton` + `useWallet()` hook using the Kit; store public key in React state/context.
**Why now:** nothing else is testable without an identity.
**Depends on:** Step 1.
**Done when:** clicking connect opens Freighter's popup, approving it returns a public key rendered in the UI, and disconnect works.
**Common mistake:** forgetting to handle the "Freighter not installed" case — the Kit's modal handles this, don't suppress it.
**Verify:** connect/disconnect manually in a real browser with Freighter installed and Testnet selected.

### Step 3 — Testnet funding flow
**Build:** on first connect, check the account's existence/balance via RPC; if unfunded, call Friendbot (directly, or send the player to Stellar Lab's funding UI as a fallback).
**Why now:** an unfunded wallet can't sign anything downstream — this has to work before contract work is testable end-to-end.
**Depends on:** Step 2.
**Done when:** a brand-new Testnet keypair connected to your app ends up funded without the player leaving your UI.
**Common mistake:** assuming Friendbot always succeeds instantly — it can rate-limit; have a visible retry/manual-link fallback.
**Verify:** test with a freshly generated keypair, not your already-funded dev account.

### Step 4 — Contract setup (local)
**Build:** `stellar contract init` scaffold; add the OpenZeppelin NFT dependency; write the `mint`/metadata constructor per the OpenZeppelin example.
**Why now:** contract logic needs to exist before it can be tested or deployed.
**Depends on:** nothing (parallel-buildable with Steps 1–3).
**Done when:** `cargo build --target wasm32v1-none --release` produces a `.wasm` file with no errors.
**Common mistake:** implementing mint access control yourself instead of using the library's `Ownable`/`only_owner` pattern.
**Verify:** `cargo test` passes locally before touching any network.

### Step 5 — Contract deployment (Testnet)
**Build:** `stellar contract deploy --wasm ... --source <deployer> --network testnet`, save the resulting contract ID.
**Why now:** you need a real contract ID before frontend integration can be real (not mocked).
**Depends on:** Step 4.
**Done when:** the contract ID resolves on Stellar Expert and Stellar Lab's Contract Explorer.
**Common mistake:** deploying with your *personal* Freighter identity instead of a dedicated deployer identity — keep them separate so you always know who has admin rights.
**Verify:** open the contract ID on Stellar Expert; confirm it shows as a valid contract, not "not found."

### Step 6 — Mint/issue flow (contract-side verification)
**Build:** invoke `mint` manually via Stellar CLI or Stellar Lab's Contract Explorer (not yet from the frontend) to prove the contract itself works.
**Why now:** isolates "is my contract right" from "is my frontend right" — don't debug both at once.
**Depends on:** Step 5.
**Done when:** a manual mint call succeeds and the resulting token appears owned by the target address.
**Verify:** Stellar Lab's Contract Explorer storage view shows the new token entry.

### Step 7 — Frontend integration (generated client)
**Build:** generate TS bindings (`npx @stellar/stellar-sdk generate --contract-id ...`), write a `useMintAchievement()` hook that builds the invoke transaction, hands it to the connected wallet via the Kit for signing, submits, and polls for completion.
**Why now:** this is the actual player-facing feature — everything before this was infrastructure.
**Depends on:** Steps 2, 3, 6.
**Done when:** clicking "claim achievement" in the running app produces a real signed transaction the player approves in their own Freighter popup.
**Common mistake:** forgetting that Soroban RPC **doesn't wait for completion on submit** — you must poll `getTransactionStatus` rather than assume success immediately. ([Stellar Docs – Soroban RPC Server](https://stellar.github.io/js-soroban-client/Server.html))
**Verify:** end-to-end in the browser, then independently re-check the same tx hash on Stellar Expert.

### Step 8 — Explorer verification surface (in-app)
**Build:** a "Proof" screen/component showing contract ID, last tx hash, and a direct Stellar Expert link.
**Why now:** this is what turns "trust me, it minted" into something a judge can click themselves — do this before you consider the slice demo-ready.
**Depends on:** Step 7.
**Done when:** clicking the link from inside your own deployed app opens the correct, populated Stellar Expert page.

### Step 9 — Error handling
**Build:** user-visible states for: wallet not installed, user rejected signing, insufficient balance, RPC timeout, tx failed on-chain (with the actual error surfaced, not swallowed).
**Why now:** live demos fail in exactly these ways — silent failures are the actual demo-killer, not chain failures themselves.
**Depends on:** Step 7.
**Done when:** you can trigger each failure mode deliberately (reject the popup, disconnect wifi) and the UI says something sane instead of hanging.

### Step 10 — Demo proof screen + backup plan
**Build:** the Step 8 screen, plus a **pre-recorded screen capture** of the exact same successful flow.
**Why now:** last thing before rehearsal.
**Depends on:** everything above.
**Done when:** you have both a working live path and a fallback video, and you've rehearsed switching to the fallback without it looking like a failure.

### Step 11 — Testing and validation pass
**Build:** nothing new — re-run the whole flow against a **freshly redeployed** contract (simulating a Testnet reset) at least once.
**Why now:** this is your insurance against the single most likely demo-day failure (Section 8).
**Done when:** a cold redeploy + full flow works without any manual patching of hardcoded addresses (this validates your env-var discipline from §2).

---

## 4) Smart Build Order (priority ranking)

1. **Wallet connect** — nothing works without it, and it alone already looks credible to a non-technical observer.
2. **Testnet funding flow** — unblocks every subsequent signed action.
3. **Contract build + local test** — cheapest to iterate on before it touches a network.
4. **Deploy to Testnet** — the moment your project becomes independently verifiable.
5. **Manual mint verification (CLI/Lab)** — de-risks the frontend step by isolating contract correctness first.
6. **Frontend mint integration** — the actual demoable feature.
7. **Proof/explorer screen** — turns the feature into evidence.
8. **Error handling** — turns a fragile demo into a resilient one.
9. **Backup video + rehearsal** — insurance.

**Postpone until after this slice works:** SAC wrapping, classic asset issuance, events, a second contract, passkeys, marketplace, Modules 2–8 rebuilds, backend/auth persistence. None of them change whether the core sentence in §2 is true.

---

## 5) Implementation Style

**Frontend folder structure (additions to the existing app):**
```
src/
├── lib/
│   └── stellar/
│       ├── walletKit.ts        # Stellar Wallets Kit instance + config
│       ├── network.ts          # env-driven constants (network, RPC url, contract id)
│       ├── contractClient.ts   # generated typed bindings wrapper
│       └── errors.ts           # normalized error types for UI consumption
├── features/
│   └── achievements/
│       ├── useWallet.ts
│       ├── useMintAchievement.ts
│       ├── WalletConnectButton.tsx
│       └── ProofScreen.tsx
```
**Contract structure:**
```
contracts/
└── achievement-nft/
    ├── src/lib.rs           # thin wrapper over OpenZeppelin non_fungible module
    ├── src/test.rs
    └── Cargo.toml
```
**Code organization principle:** no mission component (`Task1_1...`, `GenericSandboxRunner`, etc.) ever imports `@stellar/stellar-sdk` or the wallet kit directly — they call a hook from `features/achievements/`, which is the only consumer of `lib/stellar/`. This is the same boundary rule as the full platform architecture, just scoped down to what you need right now.

**State management:** plain React context for wallet connection state is sufficient at this scale — don't add Redux/Zustand for this slice.

**Environment separation:** `.env.testnet` committed as `.env.testnet.example` (no secrets) + a real untracked `.env.testnet`; a single `network.ts` reads `import.meta.env` so switching networks later is one file, not a search-and-replace.

**Testing strategy:** `cargo test` on every contract change before deploy; manual browser testing for the frontend flow (a full E2E harness is not worth building for this slice's timeline — note it as Phase 2 in the full architecture doc).

**Logging/debugging strategy:** `console.log` every submitted tx hash the moment it's returned from `submit()`, before waiting on status — if the demo hangs, you want the hash even if the UI never updates.

**CI/CD strategy:** `[Inference]` a single CI job running `cargo test` + `npm run lint`/build on every push is enough for this phase; contract deploys stay a manual, scripted, deliberate action given Testnet's own reset unpredictability — don't auto-deploy on merge.

**Deployment strategy:** frontend deploys however it already does (Vite/Nitro build); contract deploys are a documented one-command script (`scripts/deploy-testnet.sh`) checked into the repo so anyone on the team (or a mentor) can redeploy if Testnet resets.

**Security practices:** deployer secret key never in frontend code or `VITE_`-prefixed env vars; mint function access-controlled; every user-facing error message avoids leaking the deployer's identity/secret.

---

## 6) Do-Not-Build-Yet List

- SAC wrapping of a classic asset — only needed if a contract must consume a classic asset; your NFT-only flow doesn't need it.
- Classic asset issuance for an in-game resource — real, but not part of the core sentence in §2.
- Contract events — nice UX polish, not required for a first working mint (poll instead).
- A second contract or a second mission type that mints — prove one path fully before generalizing.
- Passkey/smart-wallet auth — genuinely advanced (separate fee-payer account, WebAuthn binding) and not worth the hours right now.
- Backend/auth (Supabase) — your Testnet slice doesn't need persistence to be demoable; localStorage is fine for now.
- Scam-simulation engine — a legitimate, separate product surface with zero technical dependency on this slice; do not let it compete for hours this week.
- Mainnet anything — no free SDF-hosted Mainnet RPC exists; that's a distinct, later milestone requiring a paid RPC provider decision.
- Marketplace/trading backend — depends on none of the above being done first, but is a large scope on its own; explicitly out of scope here.

---

## 7) Minimum Viable Testnet Demo — Exact Definition

The smallest credible demo is a **single, real, five-step loop, live in the browser**:
1. Player clicks **Connect Wallet** → Freighter popup → public key shown, confirmed funded on Testnet.
2. Player completes (or fast-forwards to the end of) **one existing mission** (reuse Mercury Module 1 — don't build a new one for this).
3. Player clicks **Claim Achievement** → wallet popup → player approves the signature themselves.
4. UI shows a **pending → confirmed** state (even simple polling text is fine) and then the resulting contract/tx info.
5. Player (or presenter) clicks through to **Stellar Expert** and the mint is independently visible there, live, not from a cached screenshot.

That's the whole demo. No second contract, no marketplace, no scam-sim — this loop, done convincingly and resiliently (with a backup video), is a stronger demo than a longer feature list with any one weak link.

---

## 8) Risks and Mitigations

| Risk | Mitigation |
|---|---|
| **Network failure** (RPC down/slow mid-demo) | Rehearse with a backup video ready to cut to instantly; know the manual Stellar Lab fallback to show the same contract state without your app's own network call |
| **Wallet popup/signing risk** (Freighter doesn't open, extension not installed on demo machine, popup blocked) | Demo from a machine you personally set up and tested that morning; never assume a shared/lab machine has Freighter installed |
| **Contract deployment risk** (contract has a bug found late) | Deploy at least 24–48 hours before demo day, not the night before; keep the redeploy script tested and ready |
| **Testnet reset risk** (SDF resets Testnet, wiping your deployed contract) | Keep `scripts/deploy-testnet.sh` and re-run it the morning of the demo as standard practice, not an emergency response; never hardcode the contract ID anywhere except the env var |
| **Explorer verification risk** (Stellar Expert slow to index, or the wrong network selected on the explorer) | Know the direct URL pattern in advance (`https://stellar.expert/explorer/testnet/contract/<id>`) rather than searching live on stage; double check "testnet" vs default mainnet view |
| **Demo-day failure risk (general)** | The single biggest mitigation across all of the above: **rehearse the full flow start-to-finish at least twice**, including once against a freshly redeployed contract, in the days before the event — not just component-by-component |

---

## 9) Final Checklists

### Before coding
- [ ] Freighter installed + funded on Testnet
- [ ] Separate deployer identity created
- [ ] `.env.testnet` scaffolded (no secrets committed)
- [ ] One mission and one achievement chosen — nothing broader
- [ ] Stellar Wallets Kit + `@stellar/stellar-sdk` installed (not the deprecated `stellar-sdk`)

### During development
- [ ] `src/lib/stellar/` is the only place importing Stellar packages
- [ ] Contract `cargo test` passes before every deploy
- [ ] Every submitted tx hash logged to console
- [ ] Manual contract verification (Step 6) done before frontend wiring
- [ ] Error states built for: wallet missing, user rejects, RPC timeout, tx failure

### Before demo
- [ ] Full flow rehearsed live, twice, including once post-redeploy
- [ ] Backup video recorded of a successful run
- [ ] Contract ID / tx hash / Stellar Expert link all visible in one in-app screen
- [ ] Demo machine personally verified that morning (Freighter installed, Testnet selected, funded)

### Before submission
- [ ] Contract source open in the GitHub repo
- [ ] README states contract ID + network + explorer link directly (self-contained, no external context assumed)
- [ ] `.env.testnet.example` committed, real secrets excluded via `.gitignore`
- [ ] Deploy script documented and reproducible by someone else

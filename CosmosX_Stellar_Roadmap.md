# CosmosX — Stellar Integration & Platform Roadmap

**Prepared for:** Stellar Garage / Build Station (Pune) → post-workshop Stellar Community Fund continuation
**Baseline:** React 19 + Vite + TanStack Router frontend, Mercury Chapter 1 fully built with bespoke gameplay, Modules 2–8 as content data + generic runner, no Stellar layer, no auth/backend yet.

> **How to read this document.** Every technical claim about Stellar/Soroban is grounded in official Stellar docs (`developers.stellar.org`), the SCF Handbook (`stellar.gitbook.io/scf-handbook`), or official SDF/Rise In program pages, linked inline. Anything **not** confirmed by an official source is explicitly marked `[Inference]`. I could not find an official page specifically branded "Stellar Garage Pune" — I found the general **Rise In "Stellar Build Station"** format (21-day builder sprint, e.g. Delhi NCR/Kolkata editions) and the separate **"Stellar Build-A-Thon" Pune** (2-day hackathon). If your event has a different exact structure than the 21-day sprint described below, treat the event-specific timing as `[Inference]` and adjust — the SCF submission requirements themselves are confirmed official and won't change.

---

## 1) Current-State Assessment

### What's already built and valuable
- **Mercury Module 1** — three bespoke, hand-built interactive React components (`Task1_1_MiddlemanMapper`, `Task1_2_CorruptedServer`, `Task1_3_TradeDilemma`, ~700 lines each) that faithfully implement the curriculum's discovery-first loop. This is genuinely good, differentiated product work — it's the strongest evidence you have that the *pedagogy* works, not just the pitch.
- **Frontend scaffolding**: React 19, Vite 8, TanStack Router (file-based), Tailwind v4, Radix/shadcn primitives, Framer Motion + GSAP, React Three Fiber for the 3D solar system. This is a modern, defensible stack — nothing here needs to be ripped out.
- **Content depth**: `mercury-curriculum.ts` (879 lines) encodes theory text and task copy for all 8 modules/21 beats — this is real curriculum-authoring work, not filler.
- **Progress/scoring model**: a working (if localStorage-only) task-scoring and module-verification system with a defined pass threshold (40%) — the *logic* is sound and portable to a real backend later.

### What's partially built
- **Modules 2–8**: content exists, but gameplay is delivered through a single generic runner (`GenericSandboxRunner.tsx`) — text inputs, a scripted terminal with a hardcoded hash lookup table, drag-sequence and checkbox answers. It teaches the material but isn't the bespoke simulation described in the curriculum design doc.
- **Dashboard / marketplace / leaderboard / community**: real UI, zero data layer — no `fetch`, no API, all static/mock arrays.

### What's missing entirely
- **Any Stellar SDK dependency, wallet connection, testnet transaction, asset issuance, NFT minting, or Soroban contract** — confirmed by dependency and code search: nothing Stellar-related exists in the codebase beyond decorative text ("NovaStellar" as a mock leaderboard username).
- **Auth/backend persistence** — Supabase is a README plan only, not installed.
- **Scam-simulation engine** — central to your original pitch (`file_cosmosx.md`), but has zero code footprint today.

### What's realistic before demo day
Given a typical Build Station timeline (multi-week sprint, not a 24-hour hackathon — see Section 5), a **narrow, real, end-to-end Stellar slice** is realistic: wallet connect → one signed Testnet transaction → one on-chain artifact (an issued asset or a minted achievement NFT) that judges can verify on an explorer. Deepening Modules 2–8's bespoke gameplay is *not* realistic in the same window and should not compete for time against the Stellar slice — judges at a Stellar-sponsored event are there to see Stellar, not more curriculum polish.

### What belongs in the roadmap, not the demo
Scam-simulation engine, Mainnet graduation, marketplace backend, passkey smart wallets, multi-planet buildout, real terminal (Xterm.js/WebContainers). All are legitimate — none are demo-day work. Section 5 gives you language for presenting these credibly as roadmap without looking like they're missing.

---

## 2) Stellar Integration Roadmap

For each item: what it is → why it exists → should CosmosX use it → essential/recommended/optional → judge/mentor expectation → dependencies → "done" for CosmosX.

### 2.1 Wallet integration
**What/why:** Freighter is SDF's own non-custodial browser-extension (and mobile) wallet; it never sees or stores the user's private key — your app requests a public key and hands off signing requests to it.<br>**Recommendation:** Use the **Stellar Wallets Kit** (`@creit.tech/stellar-wallets-kit`) rather than integrating Freighter alone — it wraps Freighter, Albedo, xBull and others behind one modal/API, configured once with `WalletNetwork.TESTNET`. This future-proofs you for Mainnet (flip one enum) and for users who don't have Freighter installed. ([Stellar Docs – Wallet Integration](https://developers.stellar.org/docs/tools/developer-tools/wallets), [Stellar Docs – Integrate Freighter with React](https://developers.stellar.org/docs/build/guides/freighter/integrate-freighter-react))<br>**Essential.** This is the literal entry point of "real Stellar integration" — nothing else in this section works without it.<br>**Judges/mentors:** Will expect to see a live wallet-connect flow in the demo, not a mocked button.<br>**Dependencies:** None — build this first.<br>**"Done" for CosmosX:** A "Connect Wallet" button on the Mars/Venus (or wherever you land the Stellar planet) route that opens the Kit modal, stores the returned public key in app state, and shows a connected/disconnected indicator.

### 2.2 Testnet setup
**What/why:** Testnet is SDF's free, Mainnet-like network for development; it is **periodically reset** (all accounts, trustlines, and contract data wiped) — so nothing you build should assume Testnet state is durable. ([Stellar Docs – Networks](https://developers.stellar.org/docs/networks))<br>**Essential**, and it dictates architecture: keep a **redeploy/reseed script** for your contracts and demo accounts so a Testnet reset the night before Demo Day doesn't sink you (see Section 5, Testnet-reset risk).<br>**"Done":** `.env` with Testnet network passphrase + RPC URL; a documented one-command reseed script.

### 2.3 Transaction creation/signing
**What/why:** Every state change (payment, trustline, contract invocation) is a signed transaction built with the JS SDK's `TransactionBuilder`, then handed to the connected wallet for signing rather than signed locally with a raw key (never touch user keys server-side). **Essential.**<br>**"Done":** A reusable `buildAndSign(operations)` helper used by every mission that touches the chain, so beat-specific components don't each reinvent signing.

### 2.4 Asset issuance
**What/why:** Stellar's native primitive for creating a token — an issuing account plus a distributor account with a **trustline**. This is the "classic" (pre-Soroban) asset layer and is simpler than a Soroban token for something like a rocket-part or XP-badge asset.<br>**Recommended for MVP**, essential if your demo narrative includes "mint your own asset."<br>**Dependencies:** wallet + Testnet.<br>**"Done":** One mission lets the player issue a small test asset (e.g. `FUEL`) representing an in-game resource, visible afterward on Stellar Expert.

### 2.5 SAC (Stellar Asset Contract)
**What/why:** SAC is the **built-in contract that wraps a classic Stellar asset** so it exposes the standard Soroban token interface (SEP-41) plus admin extensions (mint/clawback/set_admin) defined in CAP-46-6. Any account can deploy a SAC instance for an existing asset; the original issuer retains admin rights. Stellar's own guidance is to **issue classically, then wrap into a SAC** for interoperability rather than building a bespoke fungible-token contract. ([Stellar Docs – Stellar Asset Contract](https://developers.stellar.org/docs/build/guides/tokens/stellar-asset-contract), [Stellar Docs – Use Issued Assets in Smart Contracts](https://developers.stellar.org/docs/tokens/stellar-asset-contract))<br>**Recommended, not essential**, for the workshop demo — only needed if a mission calls the issued asset *from inside a Soroban contract* (e.g. a "spend fuel to unlock a mission" contract). If your NFT/achievement layer is Soroban-native anyway, you may not need to touch SAC directly for the demo.<br>**"Done":** Skip unless a specific mission needs a contract to move your classic asset; otherwise defer to Phase 2.

### 2.6 NFT minting flow
**What/why:** Stellar has **no separate native NFT primitive** — NFTs are Soroban contracts implementing the non-fungible token interface. **Do not hand-roll this.** OpenZeppelin's audited Stellar Contracts library ships `Base`, `Consecutive` (batch-minting-optimized), and `Enumerable` NFT variants ready to scaffold via their Wizard. ([Stellar Docs – Non-Fungible Token example](https://developers.stellar.org/docs/build/smart-contracts/example-contracts/non-fungible-token), [OpenZeppelin – Non-Fungible Token](https://docs.openzeppelin.com/stellar-contracts/tokens/non-fungible/non-fungible))<br>**Essential** — this is your "achievement collectible" and eventual rocket-skin economy, and it's the single most demo-able Stellar artifact you can show (mint on stage, open it on Stellar Expert).<br>**Dependencies:** Rust/Soroban toolchain, wallet, Testnet.<br>**"Done":** Completing Mercury (or even just Module 1, for demo purposes) triggers a mint call to a deployed NFT contract; the resulting token ID/owner is visible in the UI and cross-checkable on Stellar Expert.

### 2.7 Soroban smart contracts (general)
**What/why:** Soroban is Stellar's Rust/WASM smart-contract platform. Contracts are written in Rust, compiled to WASM, deployed and invoked via the **Stellar CLI** (`stellar` command; historically `soroban` CLI). ([Stellar – Soroban](https://stellar.org/soroban), [Stellar Docs – Write, Test, Deploy](https://developers.stellar.org/docs/build/smart-contracts/getting-started/hello-world))<br>**Essential** — it's the technical core judges are there to evaluate.<br>**"Done" (MVP scope):** One deployed, source-visible achievement/NFT contract. Do **not** try to build a general-purpose "scam simulation contract" or "marketplace contract" before demo day — those are Phase 2+.

### 2.8 Contract deployment
**What/why:** `stellar contract deploy --wasm ... --network testnet` after `stellar contract build`. The official Getting Started flow is: **Setup → Hello World → Deploy to Testnet → Storing Data**, and it's designed to be followed in that exact order. ([Stellar Docs – Deploy to Testnet](https://developers.stellar.org/docs/build/smart-contracts/getting-started/deploy-to-testnet))<br>**Essential. "Done":** Contract deployed to Testnet with its contract ID committed to the repo/README so mentors and judges can verify it without asking you.

### 2.9 Contract interaction from the frontend
**What/why:** The Stellar CLI can auto-generate an "implicit CLI" for any contract function because the Soroban SDK embeds the contract's schema in the deployed WASM — the equivalent exists as TypeScript client bindings you generate and import into the React app, so calling a contract from the frontend looks like calling a typed function, not hand-building XDR. **Essential** for any mission where the player *does something* that mints/writes on-chain (as opposed to a mentor reading the contract ID off a slide).<br>**"Done":** One React hook (e.g. `useMintAchievement()`) wired through the wallet kit → generated contract client → transaction confirmation UI.

### 2.10 Events
**What/why:** Soroban contracts emit events on state changes; these are queryable via RPC and are how a frontend can show "your NFT was minted" without polling storage directly. **Recommended** for a good demo UX (instant on-chain confirmation feedback) but **not essential** — you can ship v1 by polling `getTransactionStatus` after submission instead. Add events once the core mint flow works.

### 2.11 Contract storage
**What/why:** Soroban has a three-tier storage model with explicit rent costs (temporary, persistent, instance storage) — this is what the "Storing Data" Getting Started tutorial covers. **Essential to understand, minimal to use**: your MVP contract (an NFT/achievement contract) only needs to track owner-per-token-id, which the OpenZeppelin library already handles — you don't need to hand-design a storage schema for the demo.

### 2.12 Authorization
**What/why:** Soroban's authorization framework (`require_auth`/`require_auth_for_args`, `SorobanAuthorizationEntry`) governs who can invoke privileged contract functions (e.g. only the game/admin address can mint). ([Stellar Docs – Authorization](https://developers.stellar.org/docs/learn/fundamentals/contract-development/authorization))<br>**Essential** for a mint function — an unrestricted `mint()` anyone can call is a real security gap a technical judge will flag immediately. Gate minting to a designated admin/game address using `#[only_owner]`-style access control (OpenZeppelin's `Ownable`/RBAC modules provide this out of the box, don't hand-roll it). ([OpenZeppelin – Stellar Contracts Suite](https://docs.openzeppelin.com/stellar-contracts))

### 2.13 RPC / Horizon usage
**What/why:** Stellar exposes two server interfaces: **Horizon** (REST, classic-network data — accounts, payments, ledger history) and **Soroban RPC** (JSON-RPC, contract deployment/invocation/events). **Important, non-obvious fact:** Horizon is officially **nearing end-of-life** and will eventually be deprecated in favor of Stellar RPC and new Portfolio APIs, though it still receives protocol-compatibility updates. ([Stellar Docs – Stellar Stack](https://developers.stellar.org/docs/learn/fundamentals/stellar-stack))<br>**Practical implication for CosmosX:** build your data layer **RPC-first**. Use Horizon only where you need classic-asset history queries RPC doesn't cover well; don't build a long-term architecture that assumes Horizon is permanent.<br>**Another important fact:** SDF provides free RPC for **Testnet and Futurenet only** — there is no free SDF-hosted Mainnet RPC. When you eventually graduate to Mainnet you'll need a third-party RPC provider (e.g. validated ecosystem providers) or to run your own node. ([Stellar Docs – Networks](https://developers.stellar.org/docs/networks))

### 2.14 Explorers and verification
**What/why:** **Stellar Expert** (`stellar.expert`) is the standard block explorer judges and mentors will use to independently verify your on-chain activity — contract IDs, transaction hashes, asset issuers.<br>**Essential for demo credibility.** Keep every relevant Testnet address/contract ID/tx hash in one place (a `DEMO_LINKS.md` or a "Proof" screen in-app) so you're not fumbling for a hash mid-demo.

### 2.15 On-chain achievement flow
**What/why:** This is CosmosX's actual product hook — "graduate a module → own a real on-chain proof of it." Technically this is just 2.6 (NFT mint) + 2.12 (authorization) + 2.10 (events for feedback), sequenced as a single user-facing flow.<br>**Essential — this *is* your MVP vertical slice.**

### 2.16 Safe graduation path to Mainnet later
**What/why:** Testnet has no real value at stake; Mainnet does, and Mainnet-specific requirements apply (no free RPC, real fees, real key custody risk, and if you ever touch a fiat-backed asset, SCF's submission criteria require a **Stellar Info File with attestation/reserve evidence**). ([SCF Handbook – Submission Review Criteria](https://stellarcommunityfund.gitbook.io/scf-handbook/scf-awards/scf-build/submission-review-criteria))<br>**Optional for now, essential to plan for.** `[Inference]` Practical CosmosX-specific graduation gate: don't let *any* user-facing mainnet action ship until (a) you've chosen/paid a Mainnet RPC provider, (b) key custody is via a real wallet (Freighter/WalletKit) — never a backend-held key — and (c) you've decided whether achievement NFTs are Mainnet assets with real scarcity/value claims (which changes your legal/product surface) or stay Testnet-only "proof of learning" tokens indefinitely. The README's own phased plan (Mainnet integration "if there's enough time") is the right instinct — don't rush this.

---

## 3) Build Sequence

### MVP path (build this before/for demo day)
1. **Wallet connect** (Stellar Wallets Kit, Testnet) — no gameplay change required, just a connect button + state.
2. **Testnet account + funding flow** (Friendbot) wired into the connect flow so a fresh player automatically has a funded Testnet identity.
3. **One Soroban NFT/achievement contract** (OpenZeppelin `Base` NFT variant, admin-gated mint) written, tested locally, deployed to Testnet.
4. **Frontend contract client + `useMintAchievement()` hook**, triggered by completing Module 1 (reuse the mission you already have — don't build a new one).
5. **Verification surface**: show the resulting contract ID / tx hash / Stellar Expert link in-app.
6. **Demo script + reseed script** (Section 5) so the flow survives a live audience and a possible Testnet reset.

Do **not** add: SAC wrapping, events, marketplace, passkeys, or Modules 2–8 bespoke rebuilds inside this path — every one of them is real work that doesn't change what judges see if the MVP above already works.

### Post-MVP path (next few weeks, still workshop-adjacent)
7. Add **events** for instant mint confirmation UX.
8. Add a second contract action beyond minting (e.g., a "spend XP token to unlock hint" call) to show you can do more than one on-chain interaction, which strengthens an SCF Build Award narrative of "using Stellar to significantly improve core features," a literal SCF review criterion. ([SCF Handbook – Submission Review Criteria](https://stellarcommunityfund.gitbook.io/scf-handbook/scf-awards/scf-build/submission-review-criteria))
9. Classic-asset issuance for an in-game resource (`FUEL`), optionally SAC-wrapped once a contract needs to consume it.
10. Basic auth/backend (Supabase) so progress + wallet address persist per user instead of localStorage.

### Serious post-workshop path (SCF-continuation scope)
11. Bespoke gameplay for Modules 2–8 (replace `GenericSandboxRunner` beat by beat).
12. Scam-simulation engine (phishing/fake-wallet/rug-pull sandbox) — this is your product's actual differentiator and belongs in an SCF Build proposal, not the hackathon demo.
13. Marketplace backend for rocket-skin trading (real listings/escrow, not mock data).
14. Passkey/smart-wallet exploration (Section 2.16-adjacent) — genuinely impressive but has real backend/session complexity; treat as R&D, not a commitment.
15. Mainnet graduation gate (Section 2.16).

### Dependencies map (what blocks what)
- Wallet connect blocks *everything* downstream — build first, in isolation, and demo it working before touching contracts.
- Contract deployment blocks contract interaction blocks the achievement flow — this is a strict chain, don't parallelize it across teammates without a shared Testnet contract ID.
- Auth/backend is **independent** of the Stellar slice — it can be built in parallel by a second contributor without blocking the demo path.
- Scam-simulation engine has *no* technical dependency on the Stellar layer — it's pure frontend/gameplay work and could theoretically be built in parallel too, but building it now would compete for the same hours as the Stellar MVP and should be postponed per Section 1.

---

## 4) Platform Architecture Roadmap

- **Frontend structure**: keep the existing route-per-planet, component-per-mission pattern; introduce a `src/lib/stellar/` module (wallet kit config, contract clients, tx-building helpers) as the single seam between gameplay code and chain code — no mission component should import `stellar-sdk` directly.
- **Backend structure**: `[Inference]` a thin API layer (Supabase Edge Functions or a small Node service) responsible only for: auth, progress persistence, and (later) admin-gated operations like sponsoring fees — never for holding user private keys.
- **Data model**: `profiles`, `planet_progress` (per task score/pass), `spacecraft_state`, and a new `stellar_accounts` table mapping `user_id → public_key` (never store secret keys) plus `onchain_achievements` mirroring minted token IDs for fast UI reads without re-querying RPC every load. Your README's planned Supabase schema is a reasonable starting point — add `stellar_accounts`/`onchain_achievements` to it.
- **Auth model**: Supabase Auth as planned; the wallet-connect flow is separate from login — a user can be logged in without a wallet connected, and vice versa during guest play. Migrate localStorage guest progress to the authenticated row on first login, as already planned.
- **Progress persistence**: move off localStorage once auth exists; keep localStorage as an offline/guest fallback, not the source of truth.
- **API design**: `[Inference]` keep API surface small — reads can often go directly from frontend to Supabase/RPC; only mutations that need server-side trust (e.g., "did this user actually complete Module 1 before minting") should go through your backend.
- **State management**: current React state/hooks approach is fine at this scale; don't introduce Redux/Zustand until multi-planet state coordination actually requires it.
- **Analytics/telemetry**: `[Inference]` add lightweight event logging (task started/passed/failed, wallet connected, mint succeeded/failed) early — SCF reviewers and future fundraising both benefit from usage evidence, and it's much cheaper to add before you have real users than after.
- **Environment management**: separate `.env.testnet` / `.env.mainnet` with network passphrase + RPC URL + contract IDs per network; never hardcode a contract ID in a component.
- **Deployment strategy**: keep Testnet contract redeploy scripted (Section 2.2); frontend deploy via your existing Vite/Nitro setup is unaffected by the Stellar layer.
- **Testing strategy**: Soroban contracts should have Rust unit tests (the official example-contract pattern includes `cargo test` per contract) before every deploy; frontend contract-interaction hooks should be tested against a local/sandboxed contract, not live Testnet, to avoid flaky demo-breaking dependencies.
- **CI/CD**: `[Inference]` gate merges on `cargo test` (contracts) + `npm run lint`/build (frontend); Testnet deploys should be a manual, scripted step, not automatic on every merge, given Testnet resets are outside your control.
- **Observability/logging**: `[Inference]` log every submitted transaction hash client-side (even to console/analytics) during the workshop phase — it's your fastest debugging tool when a live demo transaction fails.
- **Security practices**: never let the backend hold user secret keys; gate all contract admin functions with `require_auth`/`Ownable`; treat every "mint" or "issue" path as attacker-reachable and access-control it explicitly (2.12).
- **Code organization / modular feature design**: the planet-as-module pattern you already have (routes/planets/*, components/module/*) scales fine to a "Stellar layer" module and later a "scam-sim layer" module — no rewrite needed, just add siblings.

---

## 5) Build Station / Stellar Garage Planning

**What the demo should prove:** that CosmosX is a *real Stellar product*, not a blockchain-flavored EdTech app with a slide about "future Stellar integration." One genuine wallet-connect → sign → on-chain-artifact loop, verifiable live on Stellar Expert, proves this more than any amount of curriculum depth.

**Minimum compelling vertical slice:** connect wallet → complete (or fast-forward through, for demo purposes) one mission → mint an on-chain achievement NFT → show it on Stellar Expert. That's the whole demo backbone; everything else is color around it.

**What not to try to build before demo day:** scam-simulation engine, Mainnet, marketplace backend, passkeys, SAC wrapping, bespoke Modules 2–8 gameplay. Building any of these instead of the Stellar MVP is the single most common execution mistake at events like this — teams show polish where judges expect chain activity, and judges specifically look for **Stellar as a use case *and* a technical integration**, per SCF's own review criteria language. ([SCF Handbook – Kickstart Award Review Criteria](https://stellarcommunityfund.gitbook.io/scf-handbook/scf-awards/scf-kickstart/kickstart-award-review-criteria))

**What judges/mentors likely care about** `[Inference, consistent with SCF's published criteria]`: (1) is Stellar/Soroban actually load-bearing, or decorative; (2) can you explain your architecture, not just demo it; (3) is the contract source visible/open (SCF explicitly requires a plan to open-source Soroban contracts); (4) do you have a credible, specific roadmap rather than "we'll add blockchain later."

**Making the project feel serious and fundable:** put your contract ID, GitHub repo, and Testnet proof links in one visible place (README badge or in-app "Proof" screen) — SCF's submission review is explicitly self-contained: *"reviewers assess each application based solely on the information provided in the submission... no external materials are considered."* ([SCF Handbook – Submission Criteria](https://stellarcommunityfund.gitbook.io/scf-handbook/scf-awards/build-award/submission-criteria)) That habit, formed now, is exactly what an SCF Build submission later will require.

**Keeping the demo credible despite roadmap items:** be explicit and confident about the split — "here's what's live on Testnet right now [show it], here's the architecture for the scam-simulation layer we're building next [one slide, not a mockup pretending to be real]." Judges respect a clear line between shipped and planned far more than a demo that blurs it.

**Testnet-reset risk (event-specific, practical):** because Testnet resets periodically and wipes all ledger/contract state, have your reseed script ready to run the morning of Demo Day, and rehearse the demo against a *freshly deployed* contract at least once, not just your original dev deployment.

---

## 6) Future Planning

- **Roadmap-only (not phase 2 or 3):** speculative platform features from `cosmox_vision_plan.md` (mini-games catalogue, full skill-tree, badges-as-NFTs-for-every-planet) — good brainstorming, not commitments.
- **Phase 2:** auth/backend persistence, events, second contract interaction, classic asset issuance — see Section 3.
- **Phase 3:** bespoke Modules 2–8 gameplay, scam-simulation engine, marketplace backend.
- **Ready for SCF continuation:** by the time you submit to SCF Build, you should have (a) an open-sourced, tested Soroban contract live on Testnet with a clear Mainnet plan, (b) a written technical architecture outline, (c) a milestone/tranche-shaped roadmap (SCF's own tranche structure is 10/20/30/40% of budget across milestones — mirror that shape in your own roadmap so it maps cleanly onto their review process). ([SCF Handbook](https://stellar.gitbook.io/scf-handbook))
- **Evolving without a rewrite:** because the Stellar layer is isolated in `src/lib/stellar/` and contract clients are generated/typed, adding new missions, new contracts, or even new chains later is additive, not a rewrite — the risk to watch is letting mission components reach directly into `stellar-sdk`, which would recouple everything.

---

## 7) Reference Architecture for Platform Builders

| Layer | What it is | Why it matters | Belongs in it | Should NOT be in it | Build sequence |
|---|---|---|---|---|---|
| **Learning engine** | Mission loop, curriculum content, scoring/verification | This is CosmosX's actual pedagogical IP | Mission components, `mercury-curriculum.ts`-style content, scoring logic | Chain calls, auth logic | Already exists — extend, don't rebuild |
| **Product shell** | Routing, navigation, 3D landing, design system | User-facing polish and retention | Routes, Radix/shadcn components, animations | Business logic, chain state | Already exists |
| **Stellar layer** | Wallet kit, tx builders, contract clients | The technical credibility layer for this event | `src/lib/stellar/`, generated contract bindings | UI components, mission-specific logic | Build now (Section 3) |
| **Backend/platform layer** | Auth, persistence, API | Turns guest-mode into a real product | Supabase Auth, progress tables, wallet-address mapping | Private keys, chain signing | Phase 2 |
| **Security/training layer** | Scam-simulation engine | Your actual differentiator vs. generic blockchain-101 content | Phishing/fake-wallet/rug-pull sandboxes | Real chain risk (must stay simulated) | Phase 3 |
| **Production-readiness layer** | CI/CD, observability, Mainnet graduation gates | What separates a hackathon demo from a fundable product | Tests, logging, env separation, Mainnet checklist | Anything unverified going live with real funds | Ongoing, hardens before Mainnet |

---

## 8) Risks and Tradeoffs

- **Technical risk:** Soroban auth misconfiguration (an unrestricted mint function) is the most likely embarrassing/serious bug — gate it explicitly (2.12).
- **Technical risk:** Testnet resets can wipe your deployed contract without warning — mitigate with a reseed script (2.2, Section 5).
- **Integration risk:** Horizon's end-of-life status means new code should default to RPC, not Horizon, to avoid building on a deprecating interface (2.13).
- **Product risk:** building Modules 2–8 gameplay instead of the Stellar layer produces a *more polished non-answer* to the one question this event is scored on.
- **Demo risk:** a live signed transaction can fail on stage (network hiccup, wallet popup blocked, stale sequence number) — always have a pre-recorded backup clip of the exact same flow succeeding.
- **Scope risk:** scam-simulation engine and marketplace backend are both substantial, legitimate products in their own right — treat them as post-workshop roadmap, not "if we have time" demo stretch goals.
- **Time risk:** passkey/smart-wallet integration is genuinely advanced (separate G-account fee payer, WebAuthn challenge binding, factory + wallet contract pair) — attractive, but a poor use of scarce workshop hours. ([Cheesecake Labs – Passkey Smart Wallet](https://cheesecakelabs.com/blog/building-a-passkey-enabled-smart-wallet-on-the-stellar-network/))
- **Common beginner mistake:** treating SAC as required for every token — it's only needed when a Soroban contract must consume a classic asset; a pure NFT achievement layer doesn't need it (2.5).
- **Common beginner mistake:** letting a backend hold or proxy user private keys "to make signing easier" — this defeats the non-custodial model wallets exist to provide and is a security red flag to any technical judge.

---

## 9) Deliverables

### Checklist — before coding
- [ ] Stellar Wallets Kit installed, Testnet-configured
- [ ] Rust + `wasm32v1-none` target + Stellar CLI installed
- [ ] OpenZeppelin Stellar Contracts Wizard reviewed for NFT scaffold
- [ ] `.env.testnet` created (network passphrase, RPC URL)
- [ ] `DEMO_LINKS.md` stub created

### Checklist — during development
- [ ] Wallet connect flow working end-to-end
- [ ] NFT contract passes `cargo test` locally before every deploy
- [ ] Contract deployed to Testnet, ID committed to repo
- [ ] Mint flow wired to one real mission completion
- [ ] Every submitted tx hash logged/visible during dev

### Checklist — before demo
- [ ] Reseed script tested against a fresh Testnet deploy
- [ ] Full demo rehearsed at least once end-to-end, live
- [ ] Backup recorded clip of a successful mint
- [ ] Contract ID / tx hash / Stellar Expert links all in one visible place

### Checklist — before submission (SCF-facing)
- [ ] GitHub repo public, README complete and self-contained
- [ ] Smart contract source open-sourced (SCF requirement)
- [ ] Architecture outline written
- [ ] Milestone/tranche-shaped roadmap included

### Checklist — before pitch
- [ ] One-sentence answer ready for "why does this need to be on Stellar, not a database" (your own Mercury curriculum already gives you this argument — use it)
- [ ] Clear, spoken line between "live today" and "roadmap"

### Recommended MVP definition
Wallet connect + one deployed, access-controlled Soroban NFT contract + one real mint triggered by mission completion + visible on-chain proof.

### Recommended "not now" list
Scam-simulation engine, marketplace backend, passkeys, SAC wrapping, Mainnet, Modules 2–8 bespoke rebuilds.

### Future roadmap summary
Phase 2 = backend/auth + second contract interaction + classic asset. Phase 3 = scam-sim engine + bespoke modules + marketplace. Mainnet graduation is its own gated milestone, not a phase, and shouldn't move until the Section 2.16 checklist is met.

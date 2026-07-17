# Cosmos-X 🚀

> **Maintainer Law** — This README is the **single source of truth**. Every route, feature, UI change, or architectural decision **must be reflected here** before merging. No exceptions.

---

**Cosmos-X** is a gamified, space-themed blockchain learning platform built on the belief: *"Learn Blockchain by Doing."* Each planet in our Solar System is a learning tier — Mercury is unlocked first and covers blockchain fundamentals. As users complete each module on a planet, they assemble one part of that planet's spacecraft. Rare rocket skins are earned by scoring unexpectedly high, achieving speed-run completions, or triggering rare in-game events — not just by finishing. Once the full spacecraft is assembled and the final timed challenge is passed, the rocket lifts off and the next planet unlocks. Collected skins are tradeable on the Stellar testnet, creating a real on-chain economy around the learning journey.

---

## 🌌 Vision & Core Promise

> "Players repair a spacecraft communication system. They experience *why* blockchain exists before receiving an explanation. The aim is not to cover the most terms — it is to make the essential ideas stick."

| Goal | Description |
|------|-------------|
| **Primary** | Turn complete beginners into confident blockchain developers via active, hands-on learning |
| **Narrative** | Every planet is a mission campaign. Users don't "take a quiz" — they repair systems, catch sabotage, validate fuel transfers, and build consensus networks |
| **Differentiator** | Not MCQ-only. Every concept follows: `Action → Discovery → Theory Unlock → Reward` |
| **Long-term Hook** | Gamified XP + spacecraft assembly + tradeable NFT rocket skins on the Stellar testnet |

---

## 🏛️ The 7 Non-Negotiable Teaching Rules (from Curriculum)

All UI and task design must respect these rules:
1. **Curiosity before vocabulary** — player sees the problem before the term appears
2. **Action before explanation** — every concept starts with manipulation, decision, or repair
3. **Short theory after discovery** — 80–130 word theory unlock, never a lecture
4. **Productive failure** — wrong moves show the consequence AND a recovery path
5. **Real-world intuition first** — use banks, Google Drive, UPI, Git before blockchain jargon
6. **No blockchain evangelism** — teach tradeoffs; give permission to choose a database
7. **Mercury is blockchain-agnostic** — Stellar is a brief preview only; deep Stellar dev starts on later planets

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React 19 + Vite 8 | Core frontend SPA |
| **Routing** | TanStack Router (file-based) | Type-safe, auto-generated routing |
| **3D Rendering** | React Three Fiber + Three.js | Interactive 3D Solar System on landing page |
| **Animation** | Framer Motion + GSAP | Page transitions, liftoff cinematics, micro-animations |
| **Styling** | Tailwind CSS v4 | Design system — all utility classes |
| **UI Primitives** | Radix UI (Shadcn pattern) | Accessible headless components |
| **Data Queries** | TanStack Query | Server-state management, caching |
| **Progress State (now)** | `localStorage` | Guest-mode progress (pre-auth phase) |
| **Progress State (planned)** | Supabase PostgreSQL | Authenticated user XP, scores, spacecraft state |
| **Auth (planned)** | Supabase Auth | Email / OAuth login — added after core UX is solid |
| **Terminal (planned)** | Xterm.js + WebContainers | Real in-browser task execution, no VM needed |
| **Trading (planned)** | Stellar Testnet SDK | Real on-chain token swaps + NFT rocket skin economy |
| **Fonts** | Space Grotesk, Inter, JetBrains Mono | Headings, body text, terminal/code respectively |

---

## 📁 Project Structure

```
Cosmos-X/
├── public/                                  # Static assets (favicon, OG images)
├── src/
│   ├── assets/
│   │   └── planets/                         # Planet texture images (sun, mercury … neptune .jpg)
│   │
│   ├── components/
│   │   ├── Nav.tsx                          # Top navigation bar
│   │   ├── HeroContent.tsx                  # Landing page hero — tagline + CTA
│   │   ├── SolarSystem.tsx                  # 3D interactive Solar System (Three.js canvas)
│   │   ├── PlanetTooltip.tsx                # Hover card showing planet topic + lock status
│   │   └── module/                          # All task and module-level UI components
│   │       ├── TaskWorkspaceLayout.tsx       # Shared 3-panel layout (sidebar | main | info)
│   │       ├── TheorySection.tsx             # Renders the theory unlock card after each beat
│   │       ├── TerminalSim.tsx               # Simulated terminal (to be upgraded to Xterm.js)
│   │       ├── GenericSandboxRunner.tsx      # Generic task runner for Modules 2–8
│   │       ├── RocketAssembly.tsx            # Spacecraft assembly visualization (8 parts)
│   │       ├── ModuleVerificationScreen.tsx  # Score summary + pass/fail per task
│   │       ├── FinalChallenge.tsx            # Timed final rescue sequence (post all 8 modules)
│   │       ├── FinalEscapeRoom.tsx           # Gamified final escape-room wrapper
│   │       ├── ArchitectureDecision.tsx      # Drag-to-classify architecture decision task
│   │       ├── SpaceOrganism.tsx             # Visual simulation component
│   │       ├── Task1_1_MiddlemanMapper.tsx   # M01 Beat 1: The black screen (central failure)
│   │       ├── Task1_2_CorruptedServer.tsx   # M01 Beat 2: The silent edit (trust/audit)
│   │       ├── Task1_3_TradeDilemma.tsx      # M01 Beat 3: Choose repair architecture
│   │       ├── Task1_4_ComparisonEngine.tsx  # M01 comparison mechanics
│   │       └── Task1_5_CardSorter.tsx        # M01 card sort: DB vs Blockchain
│   │
│   ├── hooks/                               # Custom React hooks
│   │
│   ├── lib/
│   │   ├── planets.ts                       # Planet data config (id, topic, difficulty, 3D params)
│   │   ├── mercury-curriculum.ts            # Full Mercury content (theory text + task copy)
│   │   ├── module1-store.ts                 # Progress state: localStorage get/set/reset helpers
│   │   ├── utils.ts                         # Shared utility: cn(), class merging
│   │   ├── error-capture.ts                 # Unhandled error capture for server.ts recovery
│   │   └── error-page.ts                    # Fallback HTML error page renderer
│   │
│   ├── routes/
│   │   ├── __root.tsx                       # Root layout: HTML shell, SEO meta, error boundary, 404
│   │   ├── index.tsx                        # Landing page: 3D Solar System + Hero
│   │   └── planets/
│   │       └── mercury.tsx                  # Mercury planet: full 8-module mission campaign
│   │
│   ├── routeTree.gen.ts                     # ⚠️ Auto-generated by TanStack Router — DO NOT EDIT
│   ├── router.tsx                           # Router instance + QueryClient setup
│   ├── server.ts                            # Nitro server entry point
│   ├── start.ts                             # App bootstrap / entry
│   └── styles.css                           # Global CSS, Tailwind directives, CSS variables
│
├── CosmosX_Mercury_Curriculum.pdf          # Friend's original curriculum design document
├── package.json                             # name: cosmos-x
├── vite.config.ts
├── tsconfig.json
├── AGENTS.md                                # Rules for AI agents working in this repo
└── README.md                                # ← You are here
```

---

## 🗺️ Routing Table

TanStack Router uses **file-based routing** — every file in `src/routes/` is a route. The `routeTree.gen.ts` is auto-generated; never edit it manually.

### Current Routes

| Path | File | Description |
|------|------|-------------|
| `/` | `routes/index.tsx` | Landing page with interactive 3D Solar System |
| `/planets/mercury` | `routes/planets/mercury.tsx` | Full Mercury mission: 8 modules + final challenge |

### Planned Routes (Phase 2+)

| Path | File | Description |
|------|------|-------------|
| `/auth/login` | `routes/auth/login.tsx` | Sign up / Log in page |
| `/auth/callback` | `routes/auth/callback.tsx` | Supabase OAuth callback handler |
| `/dashboard` | `routes/dashboard/index.tsx` | User profile, XP, achievements, spacecraft collection |
| `/planets/venus` | `routes/planets/venus.tsx` | Cryptography & Keys (locked) |
| `/planets/earth` | `routes/planets/earth.tsx` | Consensus & Networks (locked) |
| `/planets/mars` | `routes/planets/mars.tsx` | Wallets & Transactions (locked) |
| `/planets/jupiter` | `routes/planets/jupiter.tsx` | Smart Contracts (locked) |
| `/planets/saturn` | `routes/planets/saturn.tsx` | Tokens & Assets (locked) |
| `/planets/uranus` | `routes/planets/uranus.tsx` | NFTs & Ownership (locked) |
| `/planets/neptune` | `routes/planets/neptune.tsx` | Stellar Mainnet (locked) |
| `/trade` | `routes/trade/index.tsx` | Stellar testnet trading hub |
| `/trade/skins` | `routes/trade/skins.tsx` | Rocket skin NFT marketplace |

---

## 🪐 Planet Curriculum Map

| # | Planet | Topic | Difficulty | Est. Time | Status |
|---|--------|--------|------------|-----------|--------|
| 1 | ☿ **Mercury** | Genesis of Blockchain | Beginner | ~45 min | ✅ Unlocked |
| 2 | ♀ Venus | Cryptography & Keys | Beginner | ~1h 10m | 🔒 Locked |
| 3 | 🌍 Earth | Consensus & Networks | Intermediate | ~1h 30m | 🔒 Locked |
| 4 | ♂ Mars | Wallets & Transactions | Intermediate | ~1h 20m | 🔒 Locked |
| 5 | ♃ Jupiter | Smart Contracts | Advanced | ~2h 10m | 🔒 Locked |
| 6 | ♄ Saturn | Tokens & Assets | Advanced | ~1h 50m | 🔒 Locked |
| 7 | ⛢ Uranus | NFTs & Ownership | Advanced | ~1h 40m | 🔒 Locked |
| 8 | ♆ Neptune | Stellar Mainnet | Expert | ~2h 30m | 🔒 Locked |

---

## ☿ Mercury — Full Module Breakdown

Mercury's campaign narrative: *"Repair a spacecraft communication system."* Each module unlocks one physical part of the Mercury rocket.

### Task-Level Learning Loop (per Mission Beat)

```
Mission Briefing  →  Observe (system fails/behaves unexpectedly)
    →  Interact (player clicks, drags, routes, decides)
        →  Discovery (interface names the pattern)
            →  Theory Unlock (80–130 words, familiar analogy)
                →  Replay Twist (short variation, not a quiz)
                    →  Reflection + XP Reward + Rocket Part
```

---

### Module 01 — Dark Horizon | *Why Does Blockchain Exist?*
**Rocket Part**: Launch Platform | **XP**: 70 | **Color**: `#00E5FF`

| Beat | Title | Core Concept | Player Action |
|------|-------|-------------|---------------|
| 1 | The Black Screen | Centralized System / Single Point of Failure | Tap blocked stations after central command fails; choose which function is blocked first |
| 2 | The Silent Edit | Trust Problem / Auditability | Use rewind scrubber to compare 3 records; flag the moment a value changed without a matching event |
| 3 | Choose the Repair Architecture | Database vs. Blockchain | Drag 3 repair tickets (cafeteria, rival-station settlement, announcement board) to 4 bays: normal DB / shared DB / blockchain / no system |

**Player leaves able to**: Explain single point of failure, identify when a trusted admin is fine vs. when decentralization is required, decide when to NOT use blockchain.

---

### Module 02 — First Light | *Transactions & Digital Ledgers*
**Rocket Part**: Fuel Tank | **XP**: 70 | **Color**: `#3B82F6`

| Beat | Title | Core Concept | Player Action |
|------|-------|-------------|---------------|
| 1 | Move the Oxygen | Transaction Anatomy / Append-Only Ledger | Drag sender badge, receiver badge, amount dial, fee chip, signature seal, receipt ID into dispatch tray; reconstruct balance from ledger timeline |
| 2 | The Waiting Room | Transaction Lifecycle / Mempool | Drag lifecycle tiles into correct order: create → sign → broadcast → wait in mempool → validate → include in block |
| 3 | Gatekeeper Under Pressure | Validation / Double Spend | Work a visual gate — pull 3 levers (balance, signature, sequence) per request; accept first valid 30-unit transfer, reject conflicting second |

**Player leaves able to**: Read transaction fields as evidence, explain append-only ledger, trace lifecycle from creation to block inclusion, reject double-spend using validation rules.

---

### Module 03 — Solar Rise | *Blocks & Blockchain Structure*
**Rocket Part**: Combustion Chamber | **XP**: 70 | **Color**: `#8B5CF6`

| Beat | Title | Core Concept | Player Action |
|------|-------|-------------|---------------|
| 1 | Pack the Cargo Block | Block Body / Header | Pack 4 transactions into a container; complete its header (height, timestamp, prev reference, tx root, protocol value) |
| 2 | The First Page | Genesis Block / Initial State | Open 3 candidate genesis manifests; find the one with height=0, all-zero previous reference, initial allocations, network ID |
| 3 | Capacity vs. Speed | Throughput / Chronological Chain | Use a rate dial to compare TPS; reconnect scrambled containers by matching height and previous-reference |

**Player leaves able to**: Distinguish block header from body, recognize genesis block properties, calculate simple TPS, reconstruct chain chronologically.

---

### Module 04 — Scorch Zone | *Hashing & Data Integrity*
**Rocket Part**: Rocket Engine | **XP**: 70 | **Color**: `#EC4899`

| Beat | Title | Core Concept | Player Action |
|------|-------|-------------|---------------|
| 1 | One Character, Total Failure | Hash Properties / Avalanche Effect | Split console: edit messages letter-by-letter, compare fingerprints; experience that identical input = same output, tiny edit = radically different hash |
| 2 | Seal or Secret? | Hashing vs. Encryption | Route 6 mission needs to the right tool (hash or encrypt); test each with a "Can I recover the original?" switch |
| 3 | Find the Altered Transmission | Checksum Integrity Audit | Drag incoming files to verifier; compare calculated vs. expected seals; quarantine mismatch; spot the altered word |

**Player leaves able to**: Describe a hash as a deterministic fingerprint, experience the avalanche effect, use hashing for integrity detection, distinguish hashing from encryption.

---

### Module 05 — Solar Peak | *How Blocks Are Connected*
**Rocket Part**: Structural Frame | **XP**: 70 | **Color**: `#F59E0B`

| Beat | Title | Core Concept | Player Action |
|------|-------|-------------|---------------|
| 1 | Connect the History Cables | Previous Block Hash | Drag fingerprint from each earlier block into the next block's previous-reference socket; experience incorrect connections sparking |
| 2 | The Domino Corridor | Tamper Evidence / Block Header | Edit one transaction (20 → 200); watch block seals cascade-fail downstream; attempt local repair with header workbench |
| 3 | The Lone Rewrite | Decentralized Security / Majority Control | Allocate compute between attacker and honest validators; observe why a locally valid altered chain cannot replace honest network history |

**Player leaves able to**: Explain previous-block hash links, trace the domino tamper-effect, describe why local recalculation isn't enough, surface-level 51% attack intuition.

---

### Module 06 — Solar Descent | *Decentralization & Distributed Networks*
**Rocket Part**: Communications Array | **XP**: 70 | **Color**: `#10B981`

| Beat | Title | Core Concept | Player Action |
|------|-------|-------------|---------------|
| 1 | Build the Storm Map | Network Topology | Wire 6 nodes in 3 layouts (hub-spoke, regional, mesh); trigger same outage; choose topology for 3 use cases |
| 2 | Pass the Signal | Nodes / Gossip Protocol | Assign node roles (full, light, validator); set peer forwarding; place validation gate on forged message route |
| 3 | Hold the Line | Fault Tolerance / BFT Intuition | Place backup nodes pre-storm; set honest-majority threshold; test whether enough honest nodes remain for safe decision |

**Player leaves able to**: Distinguish centralized/decentralized/distributed topologies, explain full/light/validator node roles, trace gossip propagation, reason about crash and Byzantine fault tolerance.

---

### Module 07 — Twilight Zone | *Consensus & Transaction Validation*
**Rocket Part**: Navigation System | **XP**: 70 | **Color**: `#F97316`

| Beat | Title | Core Concept | Player Action |
|------|-------|-------------|---------------|
| 1 | No Captain on the Bridge | Consensus / Byzantine Fault | Replay message paths; mark inconsistent sender; choose agreement rule that lets honest group converge without traitor cooperation |
| 2 | The Cost of One Vote | Sybil Resistance / PoW & PoS | Give attacker 1,000 empty badges; observe one-node-one-vote collapse; run PoW puzzle race and PoS collateral round; place tradeoff cards |
| 3 | Settle One History | Federated Agreement / Double-Spend Ordering | Highlight overlapping trust circles (quorum preview); order two conflicting 40-unit transfers from a 50-unit balance; validate safe one |

**Player leaves able to**: Explain why distributed nodes need consensus, compare PoW vs PoS tradeoffs, surface-level understanding of federated/quorum agreement, resolve double-spend via ordering.

---

### Module 08 — Eternal Night | *Immutability, Transparency & Choosing Blockchain*
**Rocket Part**: Heat Shield | **XP**: 90 | **Color**: `#6366F1`

| Beat | Title | Core Concept | Player Action |
|------|-------|-------------|---------------|
| 1 | Trace the Rare Mineral | Immutability / Transparency / Traceability | Follow dilithium canister backward through custody events; flag the one handoff not matching recorded evidence; try to erase old handoff |
| 2 | Pay the Real Price | Tradeoffs / Limitations | Adjust volume, capacity, storage, fees for cafeteria (DB wins); respond to key-loss incident distinguishing "network broken" from "user lost auth" |
| 3 | The Launch Architect | Use Cases / Final Decision Matrix | Route 8 live project requests to: database / shared DB+API / blockchain / no durable system; 3-question framework per request |

**Player leaves able to**: Explain immutability as tamper-resistance not magic, use traceability for provenance, name key tradeoffs (speed/storage/fees/privacy), recognize valid blockchain use cases, choose the right architecture.

---

### Mercury Finale — Launch Sequence (Timed)

After all 8 modules, the player faces one connected rescue sequence using all learned mechanics:

| Step | Mission | Mechanic Reused |
|------|---------|-----------------|
| 1 | Central Blackout | Module 01: identify missing source of truth |
| 2 | Oxygen Queue | Module 02: validate 3 transfers, reject 1 forged |
| 3 | Cargo Seal | Module 03: pack block, verify header |
| 4 | Tamper Scan | Module 04: compare hash fingerprints |
| 5 | Broken History | Module 05: find earliest altered block |
| 6 | Storm Mesh | Module 06: bring independent peers online |
| 7 | One Shared Course | Module 07: expose conflict, order two competing payments |
| 8 | Architect's Choice | Module 08: select correct architecture + explain trust reason |

**Pass criteria**: ≥ 40% correct on all tasks overall  
**Reward**: Mercury Mission Patch + full Launch Rocket assembled + Venus unlocked + liftoff cinematic

---

## 🎮 Scoring & Validation System

| Rule | Value |
|------|-------|
| Minimum pass score per task | **40%** of max score |
| Module passes when | All tasks individually pass ≥ 40% |
| Module Verification Screen shows | Per-task scores, pass/fail indicators |
| Spacecraft part assembles when | Module verified as passed |
| Final timed test passes when | ≥ 40% overall accuracy |
| Next planet unlocks when | Final challenge passed |

**State storage** (Phase 1 — Guest Mode):
- `cosmos-x-mercury-step` — current task ID in `localStorage`
- `cosmos-x-mercury-completed` — completion % in `localStorage`
- `cosmos-x-task-scores` — `{taskId: {score, maxScore, passed}}` in `localStorage`
- `cosmos-x-verified-modules` — `[moduleId]` array in `localStorage`

---

## 💻 Terminal Integration

| Phase | Approach | Status |
|-------|---------|--------|
| Current | `TerminalSim.tsx` — simulated responses for guided tasks | ✅ Built |
| Planned | **Xterm.js + WebContainers** — real Node.js execution in-browser, zero VM cost | ⏳ Phase 4 |

**Execution model (planned)**:
1. Task shows command to run (e.g., `stellar-sdk keypair --generate`)
2. User runs it in the integrated terminal panel
3. User pastes output/hash into answer field
4. Platform regex-matches against expected output pattern
5. Score recorded; theory unlock card appears

---

## 🚀 Spacecraft Assembly System

Mercury's rocket = **8 parts**, one per module. Data in `RocketAssembly.tsx`.

| Module | Rocket Part Unlocked |
|--------|---------------------|
| 01 | Launch Platform |
| 02 | Fuel Tank |
| 03 | Combustion Chamber |
| 04 | Rocket Engine |
| 05 | Structural Frame |
| 06 | Communications Array |
| 07 | Navigation System |
| 08 | Heat Shield |

When all 8 modules pass the verification screen → Final Timed Challenge unlocks → Passing triggers **Liftoff Cinematic** (fully assembled rocket lifts off → lands on Venus → Venus unlocks on Solar System map).

---

## Stellar Testnet Integration
- Network: Testnet
- Contract ID: CAOVKUPD2VVWH7DFIRV57WBG6SRXXHIMUDCSWDNAL3SGCPE2GZEWVK3W
- Verify: https://stellar.expert/explorer/testnet/contract/CAOVKUPD2VVWH7DFIRV57WBG6SRXXHIMUDCSWDNAL3SGCPE2GZEWVK3W

## 🔐 Auth Strategy (Phase 2)

> **Decision**: Build Mercury core experience as Guest Mode (localStorage) first. Add Supabase Auth once the core UX is polished. Guest progress will migrate to the authenticated account on first login.

**Planned Supabase schema:**

```sql
-- Auth handled by Supabase Auth
profiles          (id uuid, username text, avatar_url text, created_at timestamptz)

-- Per-task learning progress
planet_progress   (id, user_id, planet_id, module_id, task_id, score, max_score, passed, completed_at)

-- Spacecraft assembly state
spacecraft_state  (id, user_id, planet_id, assembled_parts int[], all_complete bool)

-- Trading economy
wallet            (id, user_id, xlm_testnet_balance numeric, testnet_address text)
transactions      (id, from_user, to_user, asset text, amount numeric, tx_hash text, created_at)
rocket_skins      (id, skin_id text, rarity text, owner_user_id uuid, on_chain_token_id text)
skin_listings     (id, skin_id text, asking_price numeric, seller_id uuid, active bool)
```

---

## 💎 Future Scope — Trading & Gamification (Phase 5)

### Stellar Testnet Trading Hub (`/trade`)
- Stellar provides free testnet XLM for development
- Users interact with the real Stellar testnet via the integrated terminal tasks
- A Trading Hub visualizes order books and lets users safely practice swaps and transfers

### Rocket Skin Economy
Borrowing from FPS gun-skin culture:
- **Earning**: Rare skins awarded during special events, perfect scores, or speed-run completions
- **Rarity Tiers**: Common → Rare → Legendary → One-of-a-Kind
- **On-Chain**: Skins are tokenized as Stellar assets; listed, bid on, and traded peer-to-peer
- **The genius**: Users learn NFTs and on-chain ownership by *actually doing it* — the skin trading system IS the Saturn/Uranus curriculum made tangible

---

## ⚙️ Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Lint
npm run lint

# Format code
npm run format
```

---

## 📋 Development Phases

| Phase | Focus | Status |
|-------|-------|--------|
| **Phase 1** | Mercury — all 8 modules, tasks, terminal sim, scoring, verification, finale | 🔨 In Progress |
| **Phase 2** | Supabase Auth + progress persistence + user dashboard | ⏳ Planned |
| **Phase 3** | Venus → Neptune planet pages | ⏳ Planned |
| **Phase 4** | Real terminal: Xterm.js + WebContainers | ⏳ Planned |
| **Phase 5** | Stellar Testnet trading + rocket skin NFT economy | ⏳ Planned |

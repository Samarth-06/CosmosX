# CosmosX Stellar Build Guide — Part 3: Testnet Fundamentals

**Series:** Part 3 of 7. Requires Parts 1–2 completed and verified.

**Part 3 covers:** what Testnet actually is, why it exists, how Friendbot fits in, what "reset behavior" means and why it matters for your project timeline, what a block explorer actually shows you, and the difference between two server types (RPC and Horizon) your app will talk to later.

This part has no hands-on setup steps of its own beyond one CLI command at the end — it's the conceptual foundation you need before Part 4's contract work makes sense.

---

## What is Testnet?

Stellar runs **multiple separate networks**:
- **Mainnet (Pubnet)** — the real, live network. Real XLM, real value, real consequences.
- **Testnet** — a free, public network SDF operates specifically for development. Same software, same rules, but the tokens are worthless test tokens you get for free via Friendbot.
- **Futurenet** — a separate network SDF uses to preview *upcoming* protocol changes before they reach Testnet/Mainnet — you generally don't need this for CosmosX.

Testnet exists so developers can build and break things freely, with real transaction mechanics (real signatures, real fees in test-XLM, real smart contract execution) but zero financial risk. ([Stellar Docs – Networks](https://developers.stellar.org/docs/networks))

### Why does CosmosX use it for the workshop?
Because it behaves exactly like Mainnet from a code perspective — the same SDK calls, same contract deployment process — but mistakes cost nothing and funding is free and instant via Friendbot.

---

## Why Testnet resets (and why this matters to your project)

**Important, official fact:** Testnet is **periodically reset** by SDF — meaning at some point, every account, every deployed contract, and all history on Testnet gets wiped and the network restarts from a fresh state. ([Stellar Docs – Networks](https://developers.stellar.org/docs/networks))

### What this means practically for you
- A contract you deploy today could simply **stop existing** without warning if a reset happens before your demo.
- Your Freighter Testnet account balance could similarly disappear.
- **This is exactly why Part 4 and Part 6 will have you build a redeploy script, not a one-time manual deploy** — treat "redeploy everything in 5 minutes" as a required skill, not a nice-to-have.

### What could go wrong if you ignore this
The single most common beginner mistake in Stellar hackathon projects: hardcoding a contract ID into frontend code the week before the event, then discovering on demo morning that Testnet reset overnight and that contract ID now points to nothing. You'll build around this properly in Part 6.

---

## Friendbot, revisited

You already used Friendbot in Part 2 to fund your personal wallet. Understand why it exists structurally: on Stellar, an account isn't just "an address with a balance of 0" — a brand-new keypair has **no account entry on the ledger at all** until it receives its first payment establishing the minimum balance reserve. Friendbot's *only* job is to send that first funding payment on Testnet so you don't need real money to get started. ([Stellar Docs – Testnet, Friendbot section](https://developers.stellar.org/docs/networks))

You'll call Friendbot programmatically later (Part 6) so that new players connecting their own wallet to CosmosX get auto-funded without leaving your app.

---

## The block explorer: Stellar Expert

You already used this in Part 2. Reiterating its role clearly because you'll use it constantly:

**What it is:** a public website (`stellar.expert`) that reads Testnet/Mainnet data and displays it in human-readable form — accounts, balances, individual transactions, deployed contracts, contract storage.

**Why it matters for CosmosX specifically:** it's the tool a judge or mentor will use to verify your on-chain claims *without trusting your word for it*. Every proof screen you build in Part 6 will link here.

**Common mistake:** forgetting to switch the network selector on Stellar Expert to Testnet — it usually defaults to Mainnet, and searching a Testnet address there returns "not found," which looks like a real failure but isn't.

---

## RPC vs. Horizon — the two servers you'll actually call

This is the part beginners find most confusing, so slow down here.

Stellar exposes **two different server interfaces** for reading/writing network data:

### Horizon
- A REST API (regular HTTP endpoints, JSON responses).
- Historically the main way apps read "classic" Stellar data: accounts, payments, classic assets, transaction history.
- **Important current fact:** Horizon is nearing end-of-life at SDF and is expected to eventually be phased out in favor of RPC and newer APIs, though it's still functional today. ([Stellar Docs – Stellar Stack](https://developers.stellar.org/docs/learn/fundamentals/stellar-stack))
- **Practical takeaway for CosmosX:** don't build new, long-term functionality around Horizon if RPC can do the same job — treat Horizon as legacy-but-still-working, not as the foundation to build on.

### Soroban RPC ("RPC")
- A JSON-RPC interface (a specific request/response format, not plain REST).
- This is what you use for **everything Soroban-related**: deploying contracts, invoking contract functions, reading contract storage, reading contract events, and simulating transactions before submitting them.
- This is the interface your frontend's contract calls (Part 5) will actually go through.

### The specific Testnet URLs you'll use
```
RPC:     https://soroban-testnet.stellar.org
Horizon: https://horizon-testnet.stellar.org
```
You'll put these into a `.env` file in Part 6 — note them now.

### One RPC behavior that trips people up
When you submit a transaction to RPC, the initial response only tells you it was **accepted into the queue** — not that it succeeded. You have to separately **poll** for the final status (a `getTransaction` style call) until it comes back as success or failure. If your future code assumes "submitted = done," you'll build a UI that looks broken (stuck on "pending" forever, or worse, claims success too early). This becomes directly relevant in Part 5.

---

## One hands-on step: point your Stellar CLI at Testnet

You'll need this configured before Part 4.

### Why?
The Stellar CLI needs to know which network ("Testnet," in our case) to talk to by default, so you're not re-typing RPC URLs on every single command.

### Exact steps
```bash
stellar network add \
  --global testnet \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015"
```

### What is that odd "passphrase" string?
Every Stellar network has a unique text passphrase baked into every transaction's signature — it's what prevents a transaction signed for Testnet from being accidentally (or maliciously) replayed on Mainnet. `"Test SDF Network ; September 2015"` is the fixed, official passphrase for Testnet — you'll never need to change it, just know it's not a typo or a placeholder.

### Verify
```bash
stellar network ls
```
**Expected output:** should list `testnet` among configured networks.

### Common beginner mistakes
- Typing the passphrase slightly wrong (extra space, wrong punctuation) — copy it exactly as shown above.
- Re-running `stellar network add` repeatedly and getting "already exists" errors — that's fine, it means it's already configured; move on.

---

## Part 3 checklist

- [ ] You can explain, in one sentence each, what Testnet, Friendbot, and Stellar Expert are for
- [ ] You understand *why* Testnet resets matter to your project timeline
- [ ] You know the difference between Horizon and RPC, and which one Soroban work uses
- [ ] `stellar network add ... testnet` run successfully, confirmed via `stellar network ls`

**Next:** Part 4 — writing, testing, deploying, and invoking your first Soroban smart contract, from an empty folder to a live Testnet contract ID.

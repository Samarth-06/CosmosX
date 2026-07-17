# CosmosX Stellar Build Guide — Part 2: Wallet Setup (Freighter)

**Series:** Part 2 of 7. Requires Part 1 completed and verified.

**Part 2 covers:** installing Freighter, creating a wallet, understanding what a "wallet" actually is on Stellar, backing up your recovery phrase correctly, switching to Testnet, funding your account, and verifying all of it — before any code is written.

---

## Step 1 — Install Freighter

### Why?
Every action CosmosX will eventually ask a player to do on-chain — connecting, signing a mint transaction — requires a **wallet**. Freighter is the official Stellar wallet, built and maintained by the Stellar Development Foundation (SDF) itself. You need it installed as a developer *and* your CosmosX app will ask players to have it too, so understanding it from the user's side matters.

### What is Freighter?
A browser extension that stores a **private key** on your machine (encrypted, behind a password you set) and exposes a safe way for websites (like CosmosX) to ask it to sign transactions — **without the website ever seeing the private key itself.** This "non-custodial" model is the whole point: CosmosX's code will never hold, see, or touch a player's actual secret key.

### Why does CosmosX need it?
Without a wallet, there is no way for a player to prove "I own this address" or approve "yes, mint this achievement to me" — every meaningful Stellar action requires a signature, and Freighter is what produces that signature safely.

### Where do I download it?
Go to **`freighter.app`** directly in your browser — this is the official site. From there, click through to the correct store for your browser:
- Chrome Web Store: search "Freighter" (published by Stellar Development Foundation), or go directly via the link on freighter.app.
- Firefox Add-ons: same — via freighter.app's link, or search "Freighter" on `addons.mozilla.org`.

**Do not install any extension called "Freighter" that you find by searching your browser's extension store directly without going through freighter.app first** — always cross-check the publisher name (it should say **Stellar Development Foundation**) before clicking install.

### What browser should I use?
Chrome or Firefox both work fully. If you're developing CosmosX in a Chromium-based browser already (Chrome, Brave, Edge), just install Freighter there — no need to switch browsers.

### How do I know I installed the correct extension?
After installing, click the extensions puzzle-piece icon in your browser toolbar, find Freighter, and pin it. Click it — you should see a **"Freighter"**-branded welcome screen with options to create or import a wallet. The publisher listed in your browser's extension management page should say **Stellar Development Foundation**.

### Verify
Open your browser's extensions page (`chrome://extensions` or `about:addons` in Firefox), confirm Freighter is listed, enabled, and pinned to the toolbar.

### Common beginner mistakes
- Installing a similarly-named but fake/scam extension — always verify the publisher.
- Not pinning the extension, then forgetting it exists when CosmosX later tries to open its popup.

---

## Step 2 — Create a wallet

### Why?
This generates your actual keypair (public address + private key) — the identity you'll use for all of Part 2 onward.

### What will happen
Freighter will walk you through: setting an extension password (this only protects *local* access to Freighter on this device — it is not your recovery phrase), then generating a brand-new 12-word (or similar) **recovery phrase**, then asking you to confirm you've saved it.

### Exact steps
1. Click the Freighter icon.
2. Choose **"Create new wallet"** (not "Import wallet" — you have nothing to import yet).
3. Set a local password for the extension. This password only unlocks Freighter *on this browser*, on this machine.
4. Freighter will display your **recovery phrase** (a sequence of ~12 words). This is the actual master key to your funds.
5. Confirm the phrase as prompted (Freighter usually asks you to re-select the words in order, to prove you actually wrote it down).

### How do I safely store the recovery phrase?
- Write it down on paper, or store it in a password manager — **not** in a plain text file on your Desktop, and **not** in a chat message to yourself.
- For this Testnet-only development wallet specifically: since it will only ever hold worthless test tokens, the stakes are low — but **build the habit now**, because the exact same phrase-handling steps apply later to a Mainnet wallet holding real value, and beginners who get sloppy on Testnet often stay sloppy on Mainnet.
- Never type your recovery phrase into any website, including CosmosX itself — no legitimate dApp will ever ask for it. Only Freighter's own extension UI should ever ask for it (e.g. when importing/recovering a wallet).

### What could go wrong
- Losing the phrase means permanently losing access to that wallet if you ever need to reinstall Freighter or switch devices — for a Testnet dev wallet this is low-stakes (just make a new one), but treat it as practice for the real thing.

### Verify
After confirming the phrase, Freighter should show you a **main wallet screen** with an account named something like "Account 1" and a public address starting with `G...`.

### Common beginner mistakes
- Confusing the local extension password with the recovery phrase — they are different things; losing the password is recoverable (reinstall + re-import via phrase), losing the phrase is not.

---

## Step 3 — Switch Freighter to Testnet

### Why?
Freighter defaults to **Mainnet** (the real network, real value) or may prompt you to choose. Everything in this guide happens on **Testnet** — a free, safe, reset-able network for development. You must explicitly switch.

### What is Testnet, briefly?
Covered in full in Part 3 — for now, just know it's Stellar's dedicated free network for developers, completely separate from real Mainnet funds.

### Exact steps
1. Click the Freighter icon to open the extension.
2. Click the network name shown near the top (often defaults to "Mainnet" or shows a network selector).
3. Select **"Testnet"** from the list (Freighter also lists Futurenet and, in dev/experimental modes, custom networks — you want plain **Testnet**).

### How do I verify it is on Testnet?
The network indicator in the Freighter popup should now clearly read **"Testnet"**, often with a distinct color/badge so you can't confuse it with Mainnet at a glance. Get in the habit of glancing at this every time before signing anything, for the rest of this project.

### What could go wrong
- Forgetting to switch back to Testnet after Freighter resets to Mainnet on an update — always re-check before signing.
- Building CosmosX's wallet-connect flow while accidentally on Mainnet, then wondering why Testnet-only calls (like Friendbot funding) fail — the network mismatch is the actual bug in that case, not your code.

### Common beginner mistakes
- Assuming "Testnet" is a permanent setting that never needs re-checking — it's per-install/per-update; check it explicitly before every work session for this project.

---

## Step 4 — Fund your wallet on Testnet (Friendbot)

### Why?
A brand-new Stellar account has **zero balance** and, in fact, technically doesn't fully "exist" on the ledger until it's funded with a minimum amount of XLM (Stellar's native token) — this is a real Stellar protocol rule (accounts need a minimum reserve balance), not a UI limitation. On Testnet, you get this funding for free from a tool called **Friendbot**.

### What is Friendbot?
A free faucet service, run by SDF, that sends a fixed amount of test XLM to any Testnet address you give it. It exists purely so developers don't need real money to test.

### Exact steps
**Option A — the easiest way (via Freighter itself):**
1. Open Freighter, confirm you're on Testnet (Step 3).
2. Copy your public address (starts with `G...`) using the copy button next to it.
3. Many Freighter versions show a **"Fund with Friendbot"** button automatically when your Testnet balance is zero — click it if present.

**Option B — via your browser directly:**
Visit this URL, replacing `YOUR_ADDRESS` with your actual `G...` address:
```
https://friendbot.stellar.org/?addr=YOUR_ADDRESS
```
You should get back a JSON response indicating success.

**Option C — via Stellar Lab (official web tool, useful to know for later parts too):**
1. Go to `lab.stellar.org`.
2. Find the **"Fund Account"**/Friendbot section.
3. Paste your address, select Testnet, submit.

### How do I check my balance?
Open Freighter — your balance should now show something like `10,000 XLM` (Friendbot's standard funding amount on Testnet).

### What could go wrong
- Calling Friendbot on an address that's already funded — it may error or simply do nothing; that's fine, it's not a real problem.
- Friendbot occasionally rate-limits under heavy load (e.g. during a hackathon when many people fund at once) — if Option B fails, wait a minute and retry, or use Option C.

### Verify
In Freighter, your Testnet balance shows a nonzero XLM amount.

---

## Step 5 — Verify your account on a block explorer

### Why?
This is your first experience of the thing you'll rely on constantly for the rest of this project: **independently verifying on-chain state from outside your own app.** Judges and mentors will do exactly this to check your work later.

### Exact steps
1. Copy your public address from Freighter.
2. Go to **`stellar.expert`**.
3. In the top-right/network selector, make sure you're viewing **Testnet** (Stellar Expert defaults to Mainnet — this trips people up constantly).
4. Paste your address into the search bar.

### What will happen
You should land on a page showing your account, its current XLM balance (matching Freighter), and an (empty, for now) transaction history.

### Verify
The balance shown on Stellar Expert matches the balance shown in Freighter. If it doesn't match, you're very likely looking at the wrong network on one of the two tools — double check both say "Testnet."

### Common beginner mistakes
- Searching your address on Stellar Expert while it's defaulted to **Mainnet**, seeing "account not found," and panicking that funding failed — it didn't; you're just looking at the wrong network's data.

---

## Step 6 — Full Part 2 checklist

Before moving on, confirm all of the following:
- [ ] Freighter installed from the official source, publisher confirmed as Stellar Development Foundation
- [ ] Wallet created, recovery phrase safely stored (not in plaintext on Desktop)
- [ ] Freighter explicitly set to **Testnet**
- [ ] Account funded via Friendbot, balance visible in Freighter
- [ ] Same account, same balance, independently confirmed on `stellar.expert` (Testnet view)

**Next:** Part 3 — what Testnet actually is under the hood, why it resets, and the difference between Horizon and RPC (the two servers your app will eventually talk to).

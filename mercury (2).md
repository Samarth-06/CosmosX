# ☿ PLANET 1: MERCURY — "Blockchain Foundations"

## Theme: The Origin of Decentralized Systems

## Planet Order (Real Solar System)

| # | Planet | Theme |
|---|--------|-------|
| 1 | ☿ Mercury | Blockchain Foundations |
| 2 | ♀ Venus | Cryptography & Wallets |
| 3 | 🌍 Earth | Transactions & Blockchain Networks |
| 4 | ♂ Mars | Tokens, Assets & NFTs |
| 5 | ♃ Jupiter | Smart Contracts |
| 6 | ♄ Saturn | DApps & Web3 Architecture |
| 7 | ⛢ Uranus | DeFi & Blockchain Economics |
| 8 | ♆ Neptune | Web3 Security & Scam Labs |
| 🏆 | 🔮 Pluto | Stellar Development & Final Capstone |

---

## Learning Objective

The first planet should answer one fundamental question:

> **"What exactly is blockchain, why does it exist, and how does it work at a basic level?"**

After completing Mercury, a complete beginner should be able to explain blockchain confidently before touching any blockchain network.

By the end of Mercury, the trainee should understand:

**Data → Transactions → Blocks → Hashing → Chain → Distributed Network → Consensus → Immutability**

> [!IMPORTANT]
> Mercury must NOT be Stellar-specific. It teaches universal blockchain fundamentals that apply to Bitcoin, Ethereum, Stellar, and every other blockchain. Stellar-specific development begins gradually from later planets.

---

## Gamification: Build the Rocket

Each module unlocks a component of Mercury's **Launch Rocket** — a spacecraft that will carry the trainee to the next planet. Once all 8 components are assembled, the rocket is complete and the final escape-room challenge begins.

| Module | Concept | Rocket Component |
|--------|---------|-----------------|
| 1 | Why Blockchain Exists | 🧱 Launch Platform |
| 2 | Transactions & Digital Ledgers | ⛽ Fuel Tank |
| 3 | Blocks & Blockchain Structure | 🔥 Combustion Chamber |
| 4 | Hashing & Data Integrity | ⚙️ Rocket Engine |
| 5 | How Blocks Are Connected | 🚀 Main Engine Nozzle |
| 6 | Decentralization & Distributed Networks | 📡 Communication System |
| 7 | Consensus & Transaction Validation | 🧭 Navigation System |
| 8 | Immutability, Transparency & Blockchain Use Cases | 🧑‍🚀 Command Module |

```
After all eight modules:

Launch Platform       ✅
Fuel Tank             ✅
Combustion Chamber    ✅
Rocket Engine         ✅
Engine Nozzle         ✅
Communication System  ✅
Navigation System     ✅
Command Module        ✅

          ↓

🚀 ROCKET COMPLETED
```

---

## All 8 Modules Overview

### Module 1 — Why Does Blockchain Exist?
> **The Problem of Trust.** Traditional centralized systems. Central authority. Banks and intermediaries. Centralized databases. Single point of failure. Trust between unknown parties. Why blockchain was introduced. Blockchain vs traditional databases.

### Module 2 — Transactions & Digital Ledgers
> **How Blockchain Records Information.** What is a transaction? Sender, receiver, amount/data, transaction ID. Digital ledger. Transaction history. Pending transactions. Valid vs invalid transactions.

### Module 3 — Blocks & Blockchain Structure
> **How Transactions Become a Blockchain.** What is a block? Block header. Transaction data. Previous block reference. Timestamp. Genesis block. Block size/basic capacity. Chain of blocks.

### Module 4 — Hashing & Data Integrity
> **Digital Fingerprints.** What is hashing? Hash functions. Input → Hash. Fixed-length output. Deterministic behavior. Avalanche effect. One-way functions. SHA-256 introduction. Hashing vs encryption.

### Module 5 — How Blocks Are Connected
> **The Chain in Blockchain.** Previous block hash. Current block hash. Block dependency. Tampering detection. Chain integrity. Why changing one block affects all later blocks.

### Module 6 — Decentralization & Distributed Networks
> **Who Controls Blockchain?** Centralized vs decentralized vs distributed systems. Nodes. Peer-to-peer networks. Copies of the ledger. Network communication. Single point of failure. Fault tolerance.

### Module 7 — Consensus & Transaction Validation
> **How Does Everyone Agree?** Why consensus is necessary. Transaction validation. Double-spending problem. Honest vs malicious nodes. Network agreement. Introduction to Proof of Work, Proof of Stake, and Stellar Consensus Protocol (surface-level only).

### Module 8 — Immutability, Transparency & Blockchain Use Cases
> **When Should We Actually Use Blockchain?** Immutability. Transparency. Traceability. Trustlessness. Security limitations. Blockchain advantages and disadvantages. Blockchain vs database. When blockchain IS and ISN'T useful. Real-world use cases: cryptocurrency, cross-border payments, supply chain, tokenization, digital identity, DeFi, NFTs.

---

## 🎮 Final Mercury Challenge: Blockchain Rescue Mission

**Escape-room style challenge (10–15 minutes)**

**Story:**
Mercury's blockchain communication system has been compromised. The trainee has limited time to repair the network and launch the rocket.

**The player must:**
1. Identify the problem with a centralized server.
2. Validate correct transactions.
3. Arrange transactions into blocks.
4. Generate and match hashes.
5. Detect a tampered block.
6. Repair the blockchain.
7. Restore distributed nodes.
8. Help nodes reach consensus.
9. Choose the correct blockchain use case.
10. Launch the rocket.

```
MERCURY COMPLETED
       ↓
FINAL TIMED TEST
       ↓
SCORE CALCULATED
       ↓
ROCKET ASSEMBLY ANIMATION
       ↓
🚀 LAUNCH SEQUENCE
       3
       2
       1
       ↓
Rocket launches from Mercury
       ↓
Space Travel Animation
       ↓
Landing Animation
       ↓
NEXT PLANET UNLOCKED: ♀ VENUS
```

---
---
---

# MODULE 1 — Why Does Blockchain Exist?

**Rocket Component Unlocked:** 🧱 Launch Platform
**Estimated Time:** 25–30 minutes
**Tasks:** 5
**Main Concept:** The Problem of Trust

> **Module Narrative:**
> *"Welcome to Mercury — the closest planet to the Sun and the first stop on your journey through the cosmos. Before you can build a rocket to leave this scorched world, you need to understand the fundamental problem that gave birth to blockchain: the problem of trust. Mercury's central command center has been corrupted. It's your job to understand what went wrong — and discover a better system."*

The learner should be able to answer after this module:

> **"Why can't we simply use MySQL/PostgreSQL for everything?"**

---

## Task 1.1 — How the World Works Today: Centralized Systems

### Theory

#### Everything runs through a middleman

Every time you do something online — transfer money, send a message, buy a product — your action passes through a **central authority** that controls the process.

**Examples of centralized systems:**

| Action | Central Authority | What They Control |
|--------|------------------|-------------------|
| Send money to a friend | Your Bank (HDFC, SBI, Chase) | They verify your balance, approve the transfer, and update both accounts |
| Buy something on Amazon | Amazon's servers | They process payment, manage inventory, handle delivery |
| Post on Instagram | Meta's servers | They store your photo, decide who sees it, can delete it anytime |
| Send an email | Google (Gmail) | They store your email, scan it, can block it |
| Store a file | Google Drive / Dropbox | They hold your file on their servers, can restrict access |

In every case, there is **one company or entity** that:
- Stores all the data on **their** servers
- Controls **who** can access what
- Can **modify or delete** records at any time
- Must be **trusted** to be honest and available

This system works... most of the time. But it has serious weaknesses.

#### What is a centralized database?

A centralized database is a traditional storage system (like MySQL, PostgreSQL, MongoDB) that runs on **one server** (or a cluster of servers controlled by one entity).

```
         ALL USERS
        ↙   ↓   ↘
      User  User  User
        ↘   ↓   ↙
    ┌──────────────┐
    │   CENTRAL     │
    │   SERVER      │
    │   (Bank /     │
    │   Company)    │
    └──────┬───────┘
           │
    ┌──────────────┐
    │   DATABASE    │
    │   (One Copy)  │
    └──────────────┘
```

**Key characteristics:**
- **One copy** of the data exists (or replicated copies all controlled by the same owner)
- **One administrator** has full read/write access
- **Users must trust** the administrator to be honest and competent
- **Fast and efficient** — centralized systems are great for speed

#### Why this usually works fine

For most applications, centralized systems are **the correct choice**:
- A calculator app doesn't need blockchain.
- Instagram doesn't need blockchain.
- A food delivery app doesn't need blockchain.

These applications don't require **trustless verification** between strangers. One company manages the data, and users trust that company. If Instagram deletes your photo, you might be annoyed, but nobody loses money.

**So when does centralization become a problem?**

When the system handles **value** (money, assets, contracts) and the users **cannot afford to blindly trust** the central authority.

#### Key Terms

| Term | Definition |
|------|-----------|
| Central Authority | A single entity (bank, company, government) that controls a system and its data |
| Centralized Database | A database where one entity owns, operates, and controls all the data |
| Intermediary | A middleman that sits between two parties to facilitate a transaction (e.g., a bank between sender and receiver) |
| Single Point of Failure | A component whose failure causes the entire system to stop working |
| Trust | The assumption that the central authority will act honestly, stay online, and not alter records |

### 🧪 Practical Task 1.1 — Map the Middlemen

**Type:** Interactive Diagram Builder (Visual Desktop)

**Setup:**
The lab presents **5 real-world scenarios** as illustrated cards. For each scenario, the user must identify and connect the correct entities in a flow diagram.

**The Scenarios:**

**Scenario 1: Sending ₹5,000 to a friend**
The user drags and connects:
```
You → [Your Bank] → [Payment Network (UPI/SWIFT)] → [Friend's Bank] → Friend
```
**Question:** How many intermediaries are involved? → **3** (Your bank, payment network, friend's bank)

**Scenario 2: Buying a book online**
```
You → [Amazon] → [Payment Gateway (Razorpay)] → [Your Bank] → [Seller's Bank] → Seller
```
**Question:** Who controls whether the seller gets paid? → **Amazon**

**Scenario 3: Posting a photo on social media**
```
You → [Instagram/Meta Servers] → Your Followers
```
**Question:** Who can delete your photo at any time? → **Meta/Instagram**

**Scenario 4: Storing important documents**
```
You → [Google Drive Servers] → You (accessing later)
```
**Question:** What happens if Google suspends your account? → **You lose access to your files**

**Scenario 5: International money transfer (India to USA)**
```
You → [Your Bank] → [Correspondent Bank] → [SWIFT Network] → [Recipient's Bank] → Recipient
```
**Question:** How many days does this typically take? → **2–5 business days**

**🏁 Flag:** Total number of intermediaries across all 5 scenarios → `12`

**Debrief Text:**
> *"Every one of these systems depends on middlemen that you must trust with your data and your money. They charge fees, they add delays, they can make mistakes, and they can be compromised. Blockchain was invented to ask: what if we could remove SOME of these middlemen for specific use cases?"*

---

## Task 1.2 — The Single Point of Failure

### Theory

#### What happens when the center breaks?

A **single point of failure (SPOF)** is any part of a system that — if it fails — brings down the entire system with it.

In centralized systems, the central server IS the single point of failure.

**Real-world examples of centralized failures:**

| Event | What Happened | Impact |
|-------|--------------|--------|
| Facebook outage (Oct 2021) | Facebook's DNS configuration error took down Facebook, Instagram, WhatsApp, and Messenger | 3.5 billion users lost access for 6+ hours. Facebook lost ~$65 million in ad revenue. |
| British Airways IT failure (2017) | A power surge in a single data center caused a catastrophic system failure | 75,000 passengers stranded. Cost: £80 million. |
| Equifax data breach (2017) | Hackers exploited a vulnerability in Equifax's centralized database | 147 million people's personal financial data stolen. |
| Bank server downtime | When your bank's server goes down on payday | You cannot access YOUR money until THEY fix it. |

**The pattern:**
1. Everything depends on one system.
2. That system fails (hack, bug, outage, power loss, human error).
3. Nobody can do anything until the central authority fixes it.
4. Users have zero control.

#### Why is this especially dangerous for financial data?

When the centralized system handles money:
- **The operator can freeze your account** (banks regularly freeze accounts for "suspicious activity" — sometimes incorrectly).
- **The operator can modify records** (a corrupt employee at a bank could alter transaction logs).
- **The system can be hacked** (a single breach exposes everyone's data).
- **The system can go offline** (and you cannot access or move your own money).

You don't own your money in a bank. The bank owns a **record** saying they owe you that money. If their records disappear, so does your money (unless insured, and insurance has limits).

### 🧪 Practical Task 1.2 — The Corrupted Space Command Center

**Type:** Interactive Simulation (Visual Desktop)

**Setup:**
Mercury has one central command server containing all spacecraft fuel transaction records for the entire planet. The user is shown a dashboard displaying a live feed of fuel transactions between 5 space stations.

**The Simulation (3 phases):**

**Phase 1: Normal Operations**
The central server processes transactions correctly:
```
Station Alpha → 200 fuel → Station Beta     ✅ Recorded
Station Gamma → 150 fuel → Station Delta    ✅ Recorded
Station Beta  → 100 fuel → Station Epsilon  ✅ Recorded
```
The user sees balances updating in real-time on a central dashboard. Everything works perfectly.

**Phase 2: The Compromise**
A warning alert flashes: `⚠️ SECURITY BREACH DETECTED ON CENTRAL SERVER`

The attacker silently modifies 2 records in the database:
- `Station Alpha → 200 fuel → Station Beta` is changed to `Station Alpha → 2000 fuel → Station Beta`
- `Station Gamma → 150 fuel → Station Delta` is **deleted entirely**

The user sees the dashboard now showing incorrect data. Station Beta suddenly appears to have received 10x more fuel. Station Delta's incoming transfer has disappeared.

**Phase 3: User Investigation**
The lab provides:
- The **original transaction log** (shown briefly before the attack, now the user must recall or check a cached copy).
- The **current (corrupted) transaction log**.
- A comparison tool to highlight differences.

**User Tasks:**
1. **Identify the tampered record:** Which transaction was modified? → `Alpha to Beta: 200 changed to 2000`
2. **Identify the deleted record:** Which transaction was removed? → `Gamma to Delta: 150 fuel`
3. **Answer:** "Why was the attacker able to do this?" → Multiple choice:
   - a) The database was too slow
   - b) **There was only one copy of the data, controlled by one server** ✅
   - c) The stations didn't have enough fuel
   - d) The transactions were too large
4. **Answer:** "How could multiple copies of the records have helped?" → Multiple choice:
   - a) More copies means more storage space
   - b) **If 10 copies exist across different stations, the attacker would need to compromise ALL of them simultaneously to alter the record** ✅
   - c) Multiple copies would slow down the system
   - d) It wouldn't help at all

**🏁 Flag:** Submit the answer to question 3 → `b`

**Debrief Text:**
> *"When one server controls all the records, one breach destroys everything. This is the fundamental weakness of centralization. Blockchain's answer? Don't store data in one place. Store identical copies across thousands of independent computers. To corrupt the record, an attacker would need to compromise the MAJORITY of the entire network simultaneously — which is practically impossible."*

---

## Task 1.3 — The Trust Problem: Strangers Doing Business

### Theory

#### How do you trust someone you've never met?

When you buy something from a shop in your neighborhood, there's an implicit trust system:
- You can see the shop.
- You know where it is.
- If they cheat you, you can go back.
- Your community knows them.

But on the internet — and especially in a global economy — you constantly interact with complete strangers:
- Buying from a seller in another country on eBay.
- Sending money to a freelancer in a different timezone.
- Trading assets with an anonymous person on a marketplace.

**The core question:**
> How do I know this stranger will actually send me the product after I pay?
> How do they know I'll actually pay after they send the product?

#### The current solution: Trusted Third Parties

Today, we solve this with **intermediaries** who both parties trust:

```
Buyer                              Seller
  │                                  │
  └──── Both trust ────┐             │
                       ↓             │
                ┌──────────────┐     │
                │   ESCROW     │     │
                │   (Amazon,   │←────┘
                │    PayPal,   │  Both trust
                │    Bank)     │
                └──────────────┘
```

- **PayPal:** Holds the buyer's money. Releases it to the seller only after delivery confirmation.
- **Amazon:** Manages the entire transaction. Refunds the buyer if the product is defective.
- **Banks:** Verify identities, check balances, process transfers.

**Problems with this approach:**
1. **Fees:** Every intermediary charges a cut (PayPal: 2.9% + $0.30 per transaction. Banks: $15–45 for international wires).
2. **Delays:** International bank transfers take 2–5 business days.
3. **Censorship:** The intermediary can freeze transactions, block accounts, or refuse service.
4. **Exclusion:** ~1.4 billion adults worldwide don't have a bank account. They're completely locked out of the digital economy.
5. **Privacy:** The intermediary sees all your transaction data.

#### What if there was no middleman?

This is the fundamental question blockchain answers:

> **Can two strangers exchange value directly, without trusting each other or any third party, and still be guaranteed that the transaction is legitimate?**

The answer is yes — using a combination of cryptography, distributed networks, and consensus mechanisms. That's what the remaining 7 modules on Mercury will teach you.

### 🧪 Practical Task 1.3 — The Space Station Trade Dilemma

**Type:** Choose-Your-Own-Adventure Simulation (Interactive Story)

**Setup:**
Two space stations — **Station Orion** and **Station Vega** — need to trade resources. Orion has excess oxygen. Vega has excess fuel. They've never interacted before and are on opposite sides of the galaxy.

**The Dilemma:**
```
Station Orion: "I'll send 500 oxygen units if you send 300 fuel units."
Station Vega:  "Deal. But who sends first?"
```

**Round 1: No intermediary**
The user is asked: "If there's no middleman, who should send first?"
- Option A: Orion sends oxygen first → Simulation shows Vega receiving oxygen and then... going silent. **Vega never sends the fuel.** Orion loses 500 oxygen.
- Option B: Vega sends fuel first → Same problem in reverse. Orion might not send the oxygen.
- Option C: Neither sends first → **Deadlock.** No trade happens. Both stations suffer.

**Question to user:** "What's the core problem here?" → Free text or multiple choice:
- **Neither party trusts the other to follow through, and there's no enforcement mechanism.** ✅

**Round 2: Add an intermediary (Central Space Authority)**
A "Central Space Authority" is introduced. They hold both parties' resources in escrow.
```
Orion → 500 oxygen → [Central Authority holds it]
Vega  → 300 fuel   → [Central Authority holds it]
Central Authority verifies both → Releases to each party
```
**This works!** But the user must identify the downsides:
- The Central Authority charges a 5% fee (25 oxygen + 15 fuel).
- The process takes 3 days.
- The Authority can freeze the trade for "review."
- If the Authority's server crashes, both parties' resources are locked.

**Round 3: The blockchain teaser**
The lab presents a third option: "What if BOTH transactions were locked into a system where:"
- Neither party can cheat because the rules are enforced by math, not people.
- The entire network verifies the trade.
- No single entity controls the process.
- It settles in seconds, not days.
- Fees are fractions of a penny.

Text appears: *"This is what blockchain enables. You'll learn exactly HOW over the next 7 modules."*

**🏁 Flag:** Answer the question "What is the core weakness of the intermediary solution?" → `single point of failure` (or acceptable variants like `centralization`, `the intermediary can fail`)

**Debrief Text:**
> *"The trust problem is the reason blockchain was invented. In 2008, an anonymous person (or group) called Satoshi Nakamoto published a paper describing a system where strangers could exchange value directly — no banks, no intermediaries — using cryptography and a distributed network. That system was Bitcoin, and the technology behind it was blockchain."*

---

## Task 1.4 — The Blockchain Solution

### Theory

#### How blockchain solves the trust problem

Instead of trusting a single entity, blockchain distributes trust across an entire network:

**Centralized (Traditional):**
```
         ALL USERS
        ↙   ↓   ↘
      User  User  User
        ↘   ↓   ↙
    ┌──────────────┐
    │   ONE SERVER  │  ← Controls everything
    │   ONE OWNER   │  ← Single point of failure
    │   ONE COPY    │  ← Can be modified
    └──────────────┘
```

**Decentralized (Blockchain):**
```
    Node ←→ Node ←→ Node
     ↕         ↕        ↕
    Node ←→ Node ←→ Node
     ↕         ↕        ↕
    Node ←→ Node ←→ Node

    Every node has an identical copy
    No single node controls the network
    Changing data requires majority agreement
```

#### The five key properties of blockchain

| Property | What It Means | Why It Matters |
|----------|--------------|---------------|
| **Distributed** | The database is copied across thousands of independent computers (nodes) | No single point of failure. The network survives even if many nodes go offline. |
| **Transparent** | Every transaction is visible to everyone on the network | No secret modifications. Anyone can verify any record at any time. |
| **Immutable** | Once data is recorded, it cannot be changed or deleted | Records are permanent and tamper-proof. Trust is built on mathematical certainty, not promises. |
| **Consensus-driven** | All nodes must agree on the state of the data before it's recorded | No single entity can unilaterally add or modify records. The majority rules. |
| **Trustless** | You don't need to trust any individual or organization | The system is designed so that the math and the protocol enforce honesty, not people. |

#### A simple analogy

Imagine a classroom of 30 students. The teacher says: "I'm giving Student A an award for best essay."

**Centralized approach:** The teacher writes it in their personal notebook. Only the teacher has the record. If the teacher loses the notebook, or if the teacher was bribed to change the name... nobody would know.

**Blockchain approach:** The teacher announces it to all 30 students. Every student writes it down in their own notebook. Now, to fake the record, you would need to find and alter **more than 15 notebooks** (the majority) simultaneously, without any student noticing. Practically impossible.

#### What blockchain is NOT

Common misconceptions:
- ❌ Blockchain is NOT Bitcoin. Bitcoin is one application built on blockchain technology.
- ❌ Blockchain does NOT replace all databases. Most applications work perfectly fine with traditional databases.
- ❌ Blockchain is NOT always faster. It's often slower than centralized systems.
- ❌ Blockchain is NOT anonymous. It's **pseudonymous** — transactions are linked to addresses, not names, but the activity is publicly visible.
- ❌ Blockchain does NOT fix bad data. If you record incorrect data on a blockchain, it stays incorrect forever (garbage in, garbage out).

### 🧪 Practical Task 1.4 — Centralized vs Distributed: The Comparison Engine

**Type:** Side-by-Side Simulation (Visual Desktop)

**Setup:**
The lab splits the screen into two panels:
- **Left panel:** A centralized database simulation (one server, one admin).
- **Right panel:** A distributed ledger simulation (5 nodes, each with an identical copy).

**Simulation Steps:**

**Step 1: Normal Operation**
Both systems process the same 3 transactions:
```
TX-1: Station Alpha sends 100 fuel to Station Beta
TX-2: Station Gamma sends 50 fuel to Station Delta
TX-3: Station Beta sends 75 fuel to Station Epsilon
```
Both systems handle them correctly. The user sees that the centralized system is slightly faster (instant) while the distributed system takes a few seconds (the nodes need to agree).

**Step 2: Attack — Modify a record**
The simulation triggers an attack on both systems:

**Left (Centralized):** The attacker modifies TX-2 to `500 fuel` instead of `50 fuel`. The change happens instantly. No alert. The dashboard now shows incorrect data. Station Delta appears to have 450 extra fuel that doesn't exist.

**Right (Distributed):** The attacker modifies TX-2 on **Node 3** to `500 fuel`. But Nodes 1, 2, 4, and 5 still have the original record (`50 fuel`). The network compares records and **rejects Node 3's version** because it's the minority (1 out of 5). Node 3 is flagged and its copy is overwritten with the correct data.

**Step 3: Attack — Destroy a server/node**
**Left (Centralized):** The server goes offline. ❌ ALL users lose access. The entire system is down.

**Right (Distributed):** Node 2 goes offline. ✅ The remaining 4 nodes continue operating normally. No data is lost. No downtime.

**User Tasks:**
1. After the modification attack, identify which system was successfully compromised → `Centralized`
2. After a node went offline, which system continued working? → `Distributed`
3. In the distributed system, how many nodes would the attacker need to compromise to alter the record? → `3` (majority of 5)

**🏁 Flag:** How many nodes must be compromised in the distributed system? → `3`

**Debrief Text:**
> *"You just witnessed the fundamental advantage of blockchain. It's not about speed — centralized databases are faster. It's about RESILIENCE and TRUST. A distributed ledger survives attacks and failures that would destroy a centralized system. But this security comes at a cost: it's slower, it uses more resources, and it requires consensus. That's the tradeoff — and understanding WHEN this tradeoff is worth it is one of the most important lessons in blockchain."*

---

## Task 1.5 — Blockchain vs Traditional Databases: When to Use What

### Theory

#### The honest comparison

Blockchain is powerful, but it's NOT a replacement for traditional databases. It's a **specific tool for specific problems**. Using blockchain where a normal database would suffice is like using a fireproof safe to store your grocery list — overkill, expensive, and slow.

**Head-to-head comparison:**

| Feature | Traditional Database (MySQL/PostgreSQL) | Blockchain |
|---------|----------------------------------------|------------|
| **Speed** | Thousands to millions of transactions/second | 10 to ~10,000 transactions/second (varies by blockchain) |
| **Cost** | Cheap to operate | Transaction fees + node operation costs |
| **Data modification** | Easy — admin can update/delete anytime | Extremely difficult — requires majority network consensus |
| **Data ownership** | Controlled by the database administrator | Distributed across all network participants |
| **Privacy** | Data is private by default (only admin and authorized users can see it) | Data is public by default (everyone can see every transaction) |
| **Trust model** | You trust the administrator | You trust the math and the protocol |
| **Best for** | Apps where one trusted company manages data | Systems where multiple untrusting parties need to share a single source of truth |
| **Worst for** | Situations requiring trustless verification between strangers | Simple CRUD apps, private data, high-speed requirements |

#### The decision framework

Use blockchain ONLY when ALL of these are true:
1. **Multiple parties** need to share the same data.
2. Those parties **don't fully trust** each other.
3. The data needs to be **tamper-proof** (no one should be able to secretly change it).
4. There is **no single trusted authority** that everyone is willing to rely on.
5. **Transparency and auditability** are important.

If ANY of these conditions is NOT met, a traditional database is almost certainly the better choice.

### 🧪 Practical Task 1.5 — Choose Mercury's Technology

**Type:** Decision-Making Exercise (Interactive Card Sorting)

**Setup:**
The lab presents **8 scenario cards**. For each one, the user must drag it to one of two zones:

- 🟢 **Blockchain** — "This needs a blockchain"
- 🔵 **Traditional Database** — "A normal database is better"

After placing each card, the user must select a reason from a dropdown explaining **why**.

**The 8 Scenarios:**

| # | Scenario | Correct Answer | Why |
|---|----------|---------------|-----|
| 1 | **Instagram Clone** — A social media app where users post photos and follow each other. | 🔵 Traditional Database | One company manages all data. Users trust the platform. Speed and scalability are critical. No need for trustless verification. |
| 2 | **Hospital Data Sharing** — Multiple hospitals need to share patient records securely, but no single hospital should control all data. | 🟢 Blockchain | Multiple untrusting parties sharing sensitive data. Need tamper-proof records. No single authority. |
| 3 | **Calculator App** — A simple calculator that adds numbers. | 🔵 Traditional Database | No data storage needed. No multi-party interaction. A calculator doesn't even need a database at all. |
| 4 | **Cross-Border Payments** — Sending money from India to the USA without a bank charging $40 and taking 3 days. | 🟢 Blockchain | Multiple untrusting parties (sender's bank, receiver's bank, correspondent banks). Need for speed and low fees. Trustless settlement. |
| 5 | **College Attendance System** — Tracking student attendance at a university. | 🔵 Traditional Database | One institution manages the data. Students trust the university. Simple CRUD operations. |
| 6 | **Supply Chain Tracking** — Tracking a diamond from mine to retail store, involving 8 different companies across 4 countries. | 🟢 Blockchain | Multiple untrusting parties (miner, cutter, shipper, customs, jeweler, retailer). Need tamper-proof provenance. Transparency critical. |
| 7 | **Food Delivery App** — Users order food from restaurants, a driver delivers it. | 🔵 Traditional Database | One platform manages all data. Users trust the app. High-speed order processing needed. |
| 8 | **Digital Asset Marketplace** — Artists sell unique digital artworks to buyers worldwide, with verifiable ownership and resale royalties. | 🟢 Blockchain | Need to prove unique ownership. Automated royalty distribution. Multiple untrusting parties. No central gallery controlling everything. |

**Scoring:**
- Placing the card correctly: ✅ +5 points
- Selecting the correct reason: ✅ +5 points
- Maximum score: 80 points

**🏁 Flag:** Score 60/80 or higher to pass. Submit the count of blockchain scenarios → `4`

**Completion Animation:**
The 🧱 **Launch Platform** component materializes and locks into position at the base of the rocket schematic. A progress bar shows `1/8 modules completed`.

**Module Debrief:**
> *"You now understand the fundamental problem that blockchain was invented to solve: the trust problem. You know the weaknesses of centralized systems, how distributed ledgers address them, and — critically — when to use blockchain and when NOT to. You're no longer someone who thinks blockchain is the answer to everything. You're someone who knows EXACTLY when it's the right tool. In the next module, you'll learn how blockchain actually records information: Transactions & Digital Ledgers."*

---
---

## Module 1 Summary

| Task | Title | Type | What the User Does | XP |
|------|-------|------|--------------------|----|
| 1.1 | How the World Works Today: Centralized Systems | Interactive Diagram Builder | Maps intermediaries in 5 real-world scenarios | +15 |
| 1.2 | The Single Point of Failure | Simulation — The Corrupted Space Command Center | Identifies tampered and deleted records in a compromised central server | +20 |
| 1.3 | The Trust Problem: Strangers Doing Business | Choose-Your-Own-Adventure | Navigates a trade dilemma between two unknown space stations, experiencing deadlock, cheating, and intermediary overhead | +15 |
| 1.4 | The Blockchain Solution | Side-by-Side Comparison Engine | Runs attack and failure scenarios against centralized vs distributed systems simultaneously | +20 |
| 1.5 | Blockchain vs Traditional Databases | Card Sorting Decision Exercise | Classifies 8 real-world scenarios as "needs blockchain" or "needs traditional database" with justifications | +15 |

**Total Module 1 XP: +85 XP**
**Rocket Component Earned: 🧱 Launch Platform**

---

# MODULE 2 — Transactions & Digital Ledgers

**Rocket Component Unlocked:** ⛽ Fuel Tank
**Estimated Time:** 25–30 minutes
**Tasks:** 5
**Main Concept:** How Blockchain Records Information

> **Module Narrative:**
> *"The Launch Platform is secure. But to fuel your ascent, you need to build the Fuel Tank. The fuel systems are controlled by a digital transaction ledger. If you cannot read, trace, and validate transactions correctly, the valves will remain locked. Let's study how data is formatted and written to the ledger."*

---

## Task 2.1 — What is a Transaction?

### Theory

#### The basic unit of data

In a blockchain, a **transaction** is an signed message that requests a change to the ledger's state. It represents a transfer of value or data from one account to another.

Unlike traditional bank transactions, which are stored behind proprietary firewall software, blockchain transactions are openly structured and readable by anyone. Every transaction contains these core components:

1.  **Sender (Source Account):** The public address of the account initiating the transaction and paying the network fees.
2.  **Receiver (Destination):** The public address of the account receiving the assets or data.
3.  **Amount/Data:** The quantity of the asset being transferred, or a payload of custom information.
4.  **Fee:** The micro-payment paid to the network (validators) to process the transaction.
5.  **Transaction ID (TxID) or Hash:** A unique 64-character alphanumeric string generated by hashing the transaction data. This serves as the transaction's permanent receipt number.

#### Understanding Transaction IDs (TxID)

If you change even a single character in a transaction (such as modifying `Amount: 10` to `Amount: 10.01`), the resulting Transaction ID will change completely. This is because the TxID is a cryptographic hash of the entire transaction payload.

### 🧪 Practical Task 2.1 — The Transaction Inspector

**Type:** Interactive UI (Visual Dissector)

**Setup:**
The lab displays a mock transaction payload on the screen. The user must analyze the raw JSON structure to identify its key components.

**The Raw Transaction:**
```json
{
  "transaction_id": "4b87fa12ce09a888d3f10900bba81236ea77bd10129bcce0128912efcc429a1b",
  "source_account": "G_ALPHA_STATION_77",
  "destination": "G_BETA_RECON_89",
  "payload": {
    "asset": "Oxygen_Liters",
    "amount": 250
  },
  "fee_stroops": 100,
  "sequence_number": 48291
}
```

**User Action:**
Identify and input the specific fields from the payload:
1.  **Who is sending the assets?** (Paste public address)
2.  **Who is receiving the assets?** (Paste public address)
3.  **What is the unique receipt code (TxID)?** (Paste hash)
4.  **What is the sequence number?** (Input integer)

**🏁 Flag:**
- Question 1: `G_ALPHA_STATION_77`
- Question 2: `G_BETA_RECON_89`
- Question 3: `4b87fa12ce09a888d3f10900bba81236ea77bd10129bcce0128912efcc429a1b`
- Question 4: `48291`

**Debrief Text:**
> *"Every blockchain explorer works by parsing transactions exactly like this. By extracting the sender, receiver, assets, and TxID, we can audit any ledger account without asking permission."*

---

## Task 2.2 — The Digital Ledger & Bookkeeping

### Theory

#### Traditional Bookkeeping vs. Distributed Ledgers

In traditional banking, a database stores your **current balance** as a single number (e.g., `Balance: $500`). If a bank wants to change this, it overrides that number.

Blockchains work differently. They are **append-only ledgers**. You cannot delete or overwrite past actions. Instead, the ledger is a continuous, chronological record of every transaction that has ever happened from day one (the **Genesis Block**).

To calculate your current balance, a blockchain node reads the entire transaction history from the beginning of time, adding and subtracting every incoming and outgoing payment:

$$\text{Current Balance} = \text{Genesis Balance} + \sum \text{Incoming Payments} - \sum \text{Outgoing Payments}$$

```
   TRADITIONAL DATABASE                BLOCKCHAIN LEDGER
 ┌──────────────────────┐          ┌──────────────────────────┐
 │ User Balance: $500   │          │ Tx 1: Gen → User  +1000  │
 └──────────────────────┘          │ Tx 2: User → Bob  -300   │
    (Admin overrides)              │ Tx 3: User → Alice -200  │
 ┌──────────────────────┐          └──────────────────────────┘
 │ User Balance: $9000  │            (New data appended only)
 └──────────────────────┘
```

#### Why this is safer

Because you can never alter history, anyone can audit the ledger to prove exactly how every account reached its current balance. Fraud is immediately exposed because the math of the history must balance.

### 🧪 Practical Task 2.2 — Audit the Oxygen Ledger

**Type:** Ledger Audit Puzzle (Interactive Terminal)

**Setup:**
The lab presents an append-only transaction ledger log file showing transfers of Oxygen units on the space station network.

**The Ledger History Log:**
```
[Tx 0] Genesis Account -> Mint 1000 Oxygen to Station_Alpha
[Tx 1] Station_Alpha -> Send 300 Oxygen to Station_Beta
[Tx 2] Station_Alpha -> Send 200 Oxygen to Station_Gamma
[Tx 3] Station_Beta -> Send 100 Oxygen to Station_Gamma
[Tx 4] Station_Gamma -> Send 50 Oxygen to Station_Alpha
[Tx 5] Station_Beta -> Send 50 Oxygen to Station_Alpha
```

**User Action:**
Calculate the current balances of all three stations by auditing the ledger history:
1.  **Station_Alpha Balance:** [calculate]
2.  **Station_Beta Balance:** [calculate]
3.  **Station_Gamma Balance:** [calculate]

*Calculations:*
-   **Alpha:** starts at +1000. Send 300 (remains 700). Send 200 (remains 500). Receive 50 (remains 550). Receive 50 (remains 600).
-   **Beta:** Receive 300. Send 100 (remains 200). Send 50 (remains 150).
-   **Gamma:** Receive 200. Receive 100 (remains 300). Send 50 (remains 250).

**🏁 Flag:** Enter the balances in the format `Alpha:Beta:Gamma` → `600:150:250`

**Debrief Text:**
> *"You just computed account balances exactly like a blockchain validator node does. By scanning the history sequentially, the system computes the exact state of balances without storing state as an easily mutable single number."*

---

## Task 2.3 — The Transaction Lifecycle: From Click to Record

### Theory

#### The path a transaction takes

A transaction does not jump directly into the blockchain the moment you click "Send". It undergoes a multi-stage validation pipeline:

```
 User Action (e.g., Click Send)
             │
             ▼
 1. Transaction Created (Payload generated)
             │
             ▼
 2. Signed (Cryptographically signed by sender's private key)
             │
             ▼
 3. Submitted/Broadcast (Sent to local node, shared with peer-to-peer network)
             │
             ▼
 4. Mempool (Pending transaction queue)
             │
             ▼
 5. Verified (Validators verify balance, signature, sequence)
             │
             ▼
 6. Recorded (Aggregated into a block, added to chain)
```

#### What is the Mempool?

The **mempool** (memory pool) is a temporary holding area where valid transactions sit while waiting to be grouped into the next block by validators. If a transaction has a fee that is too low or network congestion is high, it may sit in the mempool for a longer duration before being processed.

### 🧪 Practical Task 2.3 — Trace the Lifecycle

**Type:** Drag-and-Drop Sequencing

**Setup:**
The user is shown the 6 phases of a transaction's life in random order. They must drag them into the correct sequence.

**Items to Sort:**
-   *A: User signs transaction with secret key.*
-   *B: Validators verify the transaction signature and account balances.*
-   *C: Transaction is bundled into a block and appended to the ledger.*
-   *D: Transaction payload is constructed (Source, Destination, Amount).*
-   *E: Transaction sits in the pending queue (Mempool).*
-   *F: Signed transaction is broadcast to the network nodes.*

**Correct Order:**
1.  **D** (Created)
2.  **A** (Signed)
3.  **F** (Broadcast)
4.  **E** (Mempool)
5.  **B** (Verified)
6.  **C** (Recorded)

**🏁 Flag:** The correct order sequence string → `DAFEBC`

**Debrief Text:**
> *"Understanding the pipeline prevents errors. If your transaction shows 'Pending' in your wallet, it means it is currently resting in the mempool waiting for consensus validators to execute it."*

---

## Task 2.4 — Valid vs. Invalid Transactions

### Theory

#### What keeps the ledger clean?

A central bank manually flags bad transactions. On a blockchain, validation rules are automated. If a transaction violates any rule, the node immediately discards it.

**Core verification rules checked by every node:**
1.  **Sufficient Balance:** Does the sender's account hold enough funds to cover the transaction amount + network fees? (Prevents spending money you don't have).
2.  **Authentic Signature:** Is the transaction signed by the matching private key of the source account? (Prevents theft).
3.  **Correct Sequence Number:** Is the transaction order correct? (Prevents **replay attacks** where someone resubmits a valid transaction from last week to steal your money again).

#### The Double Spending Problem

Double spending occurs when a user tries to send the same coins to two different receivers at the same time. Traditional networks prevent this via a central database lock. Blockchain solves this by checking timestamps, sequence numbers, and order confirmation through consensus.

```
                  ┌─── Tx A: Send 10 XLM to Bob ─── (Processed First) ✅
                  │
 User Wallet ─────┤ (Balance: 10 XLM)
                  │
                  └─── Tx B: Send 10 XLM to Alice ── (Rejected: Insufficient funds) ❌
```

### 🧪 Practical Task 2.4 — The Mempool Gatekeeper

**Type:** Interactive Validator Terminal

**Setup:**
The user acts as a validation node. A pool of 5 pending transactions appears in the queue. The user is provided with the current account balances of all stations. They must click **Approve** or **Reject** for each transaction.

**Current Account Balances:**
-   `G_ALPHA`: 100 Oxygen
-   `G_BETA`: 20 Oxygen
-   `G_GAMMA`: 5 Oxygen

**Pending Transactions Pool:**
1.  `G_ALPHA` sends `95` Oxygen to `G_BETA` (Fee: `2` Oxygen)
    -   *Calculation: 95 + 2 = 97. Balance = 100. Sufficient.* → **APPROVE** ✅
2.  `G_GAMMA` sends `10` Oxygen to `G_ALPHA` (Fee: `1` Oxygen)
    -   *Calculation: 10 + 1 = 11. Balance = 5. Insufficient.* → **REJECT** ❌
3.  `G_BETA` sends `20` Oxygen to `G_GAMMA` (Fee: `1` Oxygen)
    -   *Calculation: 20 + 1 = 21. Balance = 20. Insufficient.* → **REJECT** ❌
4.  `G_BETA` sends `15` Oxygen to `G_ALPHA` (Fee: `1` Oxygen)
    -   *Calculation: 15 + 1 = 16. Balance = 20. Sufficient.* → **APPROVE** ✅
5.  `G_ALPHA` sends `150` Oxygen to `G_GAMMA` (Fee: `2` Oxygen)
    -   *Calculation: 150 + 2 = 152. Balance = 100. Insufficient.* → **REJECT** ❌

**User Action:**
Identify which transactions are valid and approve them, rejecting the invalid entries.

**🏁 Flag:** Binary sequence of approvals (1 for Approve, 0 for Reject) → `10010`

**Debrief Text:**
> *"By filtering out invalid transactions, nodes preserve ledger accuracy and prevent double spending attempts before they can compromise blockchain history."*

---

## Task 2.5 — Chapter Challenge: Transfer Oxygen Supplies

### Challenge Task
**Scenario:** "Three space stations are suffering oxygen supply failures. You must validate the historical logs to ensure the remaining oxygen allocations are legal and accurate before the final launch launchpad coordinates can be calculated."

**Initial State Balances:**
-   `Station_A`: 50 units
-   `Station_B`: 30 units
-   `Station_C`: 20 units

**The Transaction Log Queue:**
```
1. Station_A -> 20 units -> Station_B  (Valid)
2. Station_B -> 40 units -> Station_C  (Valid? Initial 30 + 20 from A = 50. Sends 40. Leaves 10.)
3. Station_C -> 50 units -> Station_A  (Valid? Initial 20 + 40 from B = 60. Sends 50. Leaves 10.)
4. Station_A -> 45 units -> Station_B  (Valid? Initial 50 - 20 from Tx1 + 50 from Tx3 = 80. Sends 45. Leaves 35.)
5. Station_B -> 60 units -> Station_C  (Valid? Initial 10 + 45 from Tx4 = 55. Tries to send 60. Fails!)
```

**User Investigation Questions:**
1.  Which transaction in the queue is **invalid** due to insufficient balances? (Input Tx number)
2.  What is the **final balance** of `Station_A` after all valid transactions are processed? (Input integer)
3.  What is the **final balance** of `Station_B` after all valid transactions are processed? (Input integer)
4.  What is the **final balance** of `Station_C` after all valid transactions are processed? (Input integer)

**🏁 Flag:** Enter answers separated by colons → `5:35:55:10`

*Calculations verification:*
-   Tx 1: A sends 20 to B. A=30, B=50, C=20. (Valid)
-   Tx 2: B sends 40 to C. A=30, B=10, C=60. (Valid)
-   Tx 3: C sends 50 to A. A=80, B=10, C=10. (Valid)
-   Tx 4: A sends 45 to B. A=35, B=55, C=10. (Valid)
-   Tx 5: B tries to send 60 to C. B only has 55. (Invalid)
-   Final: A=35, B=55, C=10. Invalid Tx is 5.

**Completion Animation:**
The ⛽ **Fuel Tank** component materializes and snaps onto the launch pad frame. A progress bar shows `2/8 modules completed`.

**Module Debrief:**
> *"Excellent work! You've audited the logs, trace the transaction lifecycle, and rejected double-spending attempts. The Fuel Tank is successfully installed and filled. In the next module, you will learn how these individual transactions are grouped and structured into blocks: Blocks & Blockchain Structure."*

---
---

## Module 2 Summary

| Task | Title | Type | What the User Does | XP |
|------|-------|------|--------------------|----|
| 2.1 | What is a Transaction? | Visual Dissector | Identifies core JSON payload transaction parameters | +15 |
| 2.2 | The Digital Ledger & Bookkeeping | Audit Terminal | Audits append-only historical logs to calculate balances | +20 |
| 2.3 | The Transaction Lifecycle | Sorting Puzzle | Orders the steps of a transaction from creation to inclusion | +15 |
| 2.4 | Valid vs. Invalid Transactions | Mempool Validator | Evaluates pending transaction requests against balances | +20 |
| 2.5 | Chapter Challenge: Oxygen Transfer | Ledger Challenge | Audits complex transaction dependencies to find invalid states | +15 |

**Total Module 2 XP: +85 XP**
**Rocket Component Earned: ⛽ Fuel Tank**

# MODULE 3 — Blocks & Blockchain Structure

**Rocket Component Unlocked:** 🔥 Combustion Chamber
**Estimated Time:** 25–30 minutes
**Tasks:** 5
**Main Concept:** How Transactions Become a Blockchain

> **Module Narrative:**
> *"The Fuel Tank is mounted. Now, we must install the Combustion Chamber. The combustion chamber requires high structural integrity to handle raw energy, just as a blockchain requires a rigid block structure to securely group transactions. If you cannot structure and assemble blocks in the correct chronological sequence, the chamber's ignition matrix will fail."*

---

## Task 3.1 — What is a Block? (Header and Data)

### Theory

#### Packaging transactions for efficiency

In a busy network, validating and appending transactions one by one is highly inefficient. Instead, blockchains bundle multiple transaction records together into a single container called a **block**.

A block consists of two primary divisions:

1.  **Block Header (Metadata):** Contains administrative details about the block. This acts as the envelope.
    *   **Block Height:** The numerical index of the block (e.g., Block #100).
    *   **Previous Block Reference:** A reference linking back to the parent block that came before it.
    *   **Timestamp:** The exact time the block was finalized.
    *   **Block Hash:** The unique cryptographic fingerprint of this block (acting as the seal).
2.  **Block Body (Transaction Data):** The list of verified transactions packaged inside the block (e.g., Tx 1, Tx 2, Tx 3).

```
 ┌──────────────────────────────────────────────┐
 │                 BLOCK HEADER                 │
 │  Height: #12                                 │
 │  Prev Hash: 89ab32...                        │
 │  Timestamp: 2026-07-11T14:15:30Z             │
 ├──────────────────────────────────────────────┤
 │                  BLOCK BODY                  │
 │  - Alice sends 5 XLM to Bob                  │
 │  - Charlie sends 10 XLM to Delta             │
 │  - Epsilon sends 1 XLM to Echo               │
 └──────────────────────────────────────────────┘
```

By separating the header from the body, nodes can verify block history quickly by reading only the small block headers without downloading gigabytes of transaction records.

### 🧪 Practical Task 3.1 — The Block Explorer Dissector

**Type:** Interactive UI (Visual Dissector)

**Setup:**
The lab presents an interactive block container. Clicking on different parts of the block highlights the Header or Body. The user is asked to analyze a block payload and answer structural questions.

**The Raw Block Data:**
```json
{
  "header": {
    "block_height": 849,
    "timestamp": 1782294910,
    "prev_block_id": "0000a39f12bc8e0018f2bb7c71e892cbb87a9bc19cce01ef",
    "nonce": 38491
  },
  "body": {
    "transactions": [
      {"txid": "ab12", "amount": 100},
      {"txid": "cd34", "amount": 50},
      {"txid": "ef56", "amount": 10},
      {"txid": "gh78", "amount": 200}
    ]
  }
}
```

**User Action:**
Enter the following properties extracted from the block payload:
1.  **What is the height of this block?** (Input integer)
2.  **How many transactions are packaged inside this block's body?** (Input integer)
3.  **What is the previous block ID?** (Paste hash string)

**🏁 Flag:**
- Question 1: `849`
- Question 2: `4`
- Question 3: `0000a39f12bc8e0018f2bb7c71e892cbb87a9bc19cce01ef`

**Debrief Text:**
> *"Excellent. You've separated metadata (the header) from execution data (the body). This separation is the basis for blockchain scalability and light client verification."*

---

## Task 3.2 — The Genesis Block

### Theory

#### Where it all begins

Every blockchain has a parent block that has no ancestor. This first block is called the **Genesis Block** (or Block #0).

Because it is the starting point of the ledger:
*   The **Previous Block Reference** in the header is empty (often formatted as all zeros, e.g., `00000000000000000000...`).
*   It is hardcoded directly into the node software. All nodes starting up read this hardcoded block to establish the initial configuration and balances of the network.
*   It often contains a special message or timestamp marker to anchor the launch. For example, Bitcoin's genesis block contained a newspaper headline about bank bailouts: *"The Times 03/Jan/2009 Chancellor on brink of second bailout for banks"*.

### 🧪 Practical Task 3.2 — Inspect the Origin

**Type:** Interactive UI (Genesis File Viewer)

**Setup:**
The user is shown a file representing the genesis block configuration of the Mercury network (`genesis.json`). They must inspect the code to find the missing key parameters.

**`genesis.json` File Content:**
```json
{
  "block_height": 0,
  "prev_block_id": "000000000000000000000000000000000000000000000000",
  "timestamp": 1782200000,
  "network_id": "MERCURY_TESTNET_GENESIS",
  "initial_allocation": {
    "G_FOUNDING_TREASURY": 1000000,
    "G_LAUNCH_SYSTEMS": 500000
  },
  "secret_message": "Mercury Launchpad Coordinates Unlocked 2026"
}
```

**User Action:**
Retrieve the following information:
1.  **What is the exact string of the previous block ID?**
2.  **What is the network ID?**
3.  **What is the value of the `secret_message`?**

**🏁 Flag:**
- Question 1: `000000000000000000000000000000000000000000000000`
- Question 2: `MERCURY_TESTNET_GENESIS`
- Question 3: `Mercury Launchpad Coordinates Unlocked 2026`

**Debrief Text:**
> *"The Genesis Block sets the rules. All future blocks build chronologically on top of this single configuration footprint."*

---

## Task 3.3 — Block Size & Network Capacity

### Theory

#### Why block capacity is limited

Why can't we put a million transactions into a single block?

If blocks are too large:
1.  **Network Congestion:** Large blocks take a long time to travel across the internet peer-to-peer, causing nodes to fall out of sync.
2.  **Storage Strain:** Nodes would run out of disk space quickly.
3.  **Processing Limits:** Processing and verifying millions of transactions at once requires heavy CPU hardware, leading to centralizing node operation to only powerful data centers.

Therefore, every blockchain defines a **Block Size Limit** (measured in bytes or gas limits) and a target **Block Time** (the average time between blocks).

#### Transaction Throughput (TPS)

To find how fast a blockchain can process transactions, we use the Transactions Per Second (TPS) formula:

$$\text{TPS} = \frac{\text{Average Transactions Per Block}}{\text{Block Time in Seconds}}$$

For example:
*   If a block can fit **2,000 transactions** and closes every **10 seconds**, the TPS limit is:
    $$\text{TPS} = \frac{2000}{10} = 200 \text{ transactions/second}$$

### 🧪 Practical Task 3.3 — Calculate the Throughput

**Type:** Math Calculation Console

**Setup:**
The user is presented with three network configurations. They must calculate the maximum TPS for each network.

**Network 1 (Network A):**
-   Average Transaction Size: `500 bytes`
-   Block Size Limit: `1,000,000 bytes` (1 MB)
-   Block Time: `10 seconds`

*Calculation:*
1.  Max Tx per block = $1,000,000 / 500 = 2,000$ transactions.
2.  TPS = $2,000 / 10 = 200$.

**Network 2 (Network B):**
-   Average Transaction Size: `250 bytes`
-   Block Size Limit: `2,000,000 bytes` (2 MB)
-   Block Time: `5 seconds`

*Calculation:*
1.  Max Tx per block = $2,000,000 / 250 = 8,000$ transactions.
2.  TPS = $8,000 / 5 = 1,600$.

**Network 3 (Network C):**
-   Average Transaction Size: `1,000 bytes`
-   Block Size Limit: `1,000,000 bytes` (1 MB)
-   Block Time: `100 seconds`

*Calculation:*
1.  Max Tx per block = $1,000,000 / 1,000 = 1,000$ transactions.
2.  TPS = $1,000 / 100 = 10$.

**User Action:**
Calculate and enter the TPS for Network A, B, and C.

**🏁 Flag:** Enter answers separated by colons → `200:1600:10`

**Debrief Text:**
> *"Stellar keeps transaction sizes extremely small and limits block times to 5 seconds, allowing high transaction capacity compared to older chains."*

---

## Task 3.4 — The Chain: Linking Blocks Chronologically

### Theory

#### How blocks connect

Blocks are not independent piles of records. They are linked sequentially into a continuous chain.

This link is established using the **Previous Block Reference** field in the block header. Block #1 points back to Block #0. Block #2 points back to Block #1.

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   BLOCK #0   │      │   BLOCK #1   │      │   BLOCK #2   │
│   (Genesis)  │      │              │      │              │
│ Hash: 0xAAAA ◄──────┼─Prev: 0xAAAA │      │              │
│              │      │ Hash: 0xBBBB ◄──────┼─Prev: 0xBBBB │
└──────────────┘      └──────────────┘      └──────────────┘
```

This sequence creates a strict timeline. You cannot insert Block 1.5. You cannot swap Block 2 and Block 1. The previous hash reference binds them in an exact, chronological order.

If any block in the middle is removed or modified, the pointers break, and the chain splits, warning the nodes that the history has been tampered with.

### 🧪 Practical Task 3.4 — Sequence the Chain

**Type:** Drag-and-Drop Sequencing

**Setup:**
The lab presents 4 blocks in random order. Each block displays its own height and the Previous Block ID it points to. The user must arrange them in the correct sequential order.

**Blocks to Arrange:**
-   **Block W:** Height: `3`, Previous Block Hash: `0xCC`
-   **Block X:** Height: `1`, Previous Block Hash: `0xAA` (Genesis Hash)
-   **Block Y:** Height: `2`, Previous Block Hash: `0xBB`
-   **Block Z:** Height: `0`, Previous Block Hash: `0x00` (Genesis Block)

**User Action:**
Arrange the blocks from left to right (Genesis to Block 3).
-   *Z (Height 0) points to 0x00*
-   *X (Height 1) points to 0xAA (Hash of Z)*
-   *Y (Height 2) points to 0xBB (Hash of X)*
-   *W (Height 3) points to 0xCC (Hash of Y)*

**🏁 Flag:** The correct ordering sequence string → `ZXYW`

**Debrief Text:**
> *"Correct. Each block acts as a link. By validating that height N points to height N-1, nodes can trace a direct, unbroken line of historical events back to the genesis block."*

---

## Task 3.5 — Chapter Challenge: Repair the Broken Space Log

### Challenge Task
**Scenario:** "Solar flares have corrupted the space command log storage. The transactions logs are scrambled. You must sort the blocks to restore chronology and locate the core launch credentials."

**Scrambled Block Data Cards:**

**Block ID: Gamma**
-   Block Height: `2`
-   Timestamp: `1782200200`
-   Prev Block Reference: `0xALPHA`
-   Transactions inside: `Station_B -> 50 fuel -> Station_C`

**Block ID: Delta**
-   Block Height: `3`
-   Timestamp: `1782200300`
-   Prev Block Reference: `0xGAMMA`
-   Transactions inside: `Station_C -> 10 fuel -> Station_A`

**Block ID: Beta**
-   Block Height: `0`
-   Timestamp: `1782200000`
-   Prev Block Reference: `0x000000000000000000000000000000000000000000000000`
-   Transactions inside: `Genesis Allocation -> 1000 fuel -> Station_A`

**Block ID: Alpha**
-   Block Height: `1`
-   Timestamp: `1782200100`
-   Prev Block Reference: `0xBETA`
-   Transactions inside: `Station_A -> 100 fuel -> Station_B`

**User Tasks:**
1.  **Arrange the sequence of Block IDs** from the Genesis Block to Block 3. (Select options: `Beta`, `Alpha`, `Gamma`, `Delta`)
2.  What is the **current balance** of `Station_A` after Block 3 is processed? (Assume initial zero balances before Genesis Allocation).

*Calculations:*
-   *Genesis (Beta):* Station_A gets 1000 fuel. (Balances: A=1000, B=0, C=0)
-   *Block 1 (Alpha):* A sends 100 to B. (Balances: A=900, B=100, C=0)
-   *Block 2 (Gamma):* B sends 50 to C. (Balances: A=900, B=50, C=50)
-   *Block 3 (Delta):* C sends 10 to A. (Balances: A=910, B=50, C=40)

**🏁 Flag:** Enter answers separated by a colon → `Beta:Alpha:Gamma:Delta:910`

**Completion Animation:**
The 🔥 **Combustion Chamber** component slots into the rocket engine chassis. A progress bar shows `3/8 modules completed`.

**Module Debrief:**
> *"Superb assembly! The blocks are sorted, the log is repaired, and the Combustion Chamber is locked into place. You now understand how transactions are grouped into blocks and linked chronologically. Next, we will cover how block data is securely fingerprinted and protected from tampering: Hashing & Data Integrity."*

---
---

## Module 3 Summary

| Task | Title | Type | What the User Does | XP |
|------|-------|------|--------------------|----|
| 3.1 | What is a Block? | Visual Dissector | Decodes metadata and execution details from a block payload | +15 |
| 3.2 | The Genesis Block | File Inspector | Audits initialization files to extract core genesis parameters | +15 |
| 3.3 | Block Size & Capacity | Calculation Console | Calculates transaction capacity and TPS performance margins | +20 |
| 3.4 | Chronological Chains | Sequencing Puzzle | Connects block headers in chronological order using pointers | +15 |
| 3.5 | Chapter Challenge: Space Log | Log Restore Game | Arranges scrambled blocks to calculate historical balances | +20 |

**Total Module 3 XP: +85 XP**
**Rocket Component Earned: 🔥 Combustion Chamber**

---

## Up Next: Module 4 — Hashing & Data Integrity

> *"The Combustion Chamber is ready. To build the Rocket Engine, you must master the core security system of blockchain: Cryptographic Hashing. How do we create digital fingerprints? What is SHA-256? Module 4 explores the math that makes records permanent."*

---

# MODULE 4 — Hashing & Data Integrity

**Rocket Component Unlocked:** ⚙️ Rocket Engine
**Estimated Time:** 25–30 minutes
**Tasks:** 5
**Main Concept:** Digital Fingerprints

> **Module Narrative:**
> *"The Combustion Chamber is secure. Now, we must build the Rocket Engine. The engine requires precision calibration. On a blockchain, precision and data integrity are guaranteed by a cryptographic process called Hashing. If you cannot spot corrupted transmissions and understand digital fingerprints, the engine's control systems will misfire."*

---

## Task 4.1 — What is a Cryptographic Hash?

### Theory

#### The digital fingerprint

A cryptographic **hash function** is a mathematical algorithm that takes an input of any size (from a single letter to the entire contents of a library) and converts it into a fixed-length string of characters (usually hexadecimal).

```
   INPUT DATA                            HASH FUNCTION           OUTPUT HASH (SHA-256)
 ┌─────────────┐                        ┌─────────────┐        ┌────────────────────────────────────────────────────────┐
 │ "Hello"     ├───────────────────────►│             ├───────►│ 185f8db32271fe25f561a6fc938b2e264306ec304eda518007d176 │
 └─────────────┘                        │  SHA-256    │        └────────────────────────────────────────────────────────┘
 ┌─────────────┐                        │  Algorithm  │        ┌────────────────────────────────────────────────────────┐
 │ [Encyclopedia] ──────────────────────►│             ├───────►│ e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca49599 │
 └─────────────┘                        └─────────────┘        └────────────────────────────────────────────────────────┘
```

#### Core properties of cryptographic hashes

1.  **Deterministic:** The same input will always produce the exact same output hash, no matter how many times you run it.
2.  **Fixed-Length Output:** No matter how large or small the input is, the output hash is always the same length (e.g., SHA-256 always produces a 64-character hex string).
3.  **One-Way (Pre-image Resistance):** You cannot reverse a hash to find the original input. It is mathematically impossible to reconstruct the text "Hello" from its output hash.
4.  **Collision Resistant:** It is practically impossible to find two different inputs that produce the identical output hash.

### 🧪 Practical Task 4.1 — The Hash Generator Console

**Type:** Interactive UI (Terminal & Live Input)

**Setup:**
The lab renders a text input box on the left, and a large SHA-256 output screen on the right. Below the output screen is an analyzer panel showing properties (length, character set, compute time).

**User Action:**
1.  Type `HELLO` in all caps. Note the resulting hash.
2.  Type `hello` in lowercase. Note how the output changes completely.
3.  Generate the hash for the phrase: `Blockchain is secure`

**🏁 Flag:** The first 8 characters of the hash of the phrase: `Blockchain is secure`

*Hash Calculation:*
-   Input: `Blockchain is secure`
-   SHA-256: `8e9ffc5d80b7ac3080e72251a3d3c8c731e847c1f8a7cfbb1727771ea0808b2d`
-   First 8 characters: `8e9ffc5d`

**Debrief Text:**
> *"You've generated your first cryptographic fingerprints. Notice how both a single word and a full sentence yield a hash of exactly 64 characters (256 bits)."*

---

## Task 4.2 — The Avalanche Effect

### Theory

#### Amplifying small changes

A key requirement for a secure hash function is the **avalanche effect**. If you make a minor modification to the input (like changing a single character, adding a space, or changing punctuation), the resulting output hash changes dramatically.

```
Input A: "Send 10 XLM"
Hash A:  8A71F9...

Input B: "Send 11 XLM"
Hash B:  D4E2F7... (Completely different)
```

If the hash only changed by one character, attackers could easily guess the original message by making incremental guesses and checking if the hash looks similar. Because the output changes randomly and completely, it is impossible to predict the hash output without running the algorithm.

### 🧪 Practical Task 4.2 — The Avalanche Detector

**Type:** Visual Match Game

**Setup:**
The user is shown two very long hash outputs side-by-side. The app highlights where the characters differ. The user must type the text modifications that caused this difference.

**Case 1:**
-   Input A: `Space Mission 1`
-   Input B: `Space Mission 2`
-   Hash A: `e527f300c061d479e0004ffb2390f7d54ea3bc4f7881cba908cd5d9d701ce1b0`
-   Hash B: `f8a7e08922c019bd3e2182b8cd092e008ba3fca21c00bb9184cf56efbc42ba71`
-   **User observation:** Only one number was changed at the end, but the hashes do not share a single matching character at the same position.

**Case 2:**
-   Input C: `Launch the rocket`
-   Input D: `Launch the rocket.` (Added a period)
-   Hash C: `3a4f89be...`
-   Hash D: `c8d9e2b1...`

**User Action:**
Identify the exact character addition or change that happened in Case 2.
-   *The user compares `Launch the rocket` vs `Launch the rocket.`*

**🏁 Flag:** The character that was appended to cause the avalanche effect in Case 2 → `.`

**Debrief Text:**
> *"The avalanche effect makes it impossible for an attacker to deduce the original data structure by comparing similar hashes. This acts as a foundation of blockchain immutability."*

---

## Task 4.3 — Hashing vs. Encryption

### Theory

#### One-way vs. Two-way processes

Many beginners confuse **hashing** with **encryption**. While both are cryptographic tools, they serve completely different purposes:

```
  HASHING (One-Way)
 ┌────────────────┐      ┌───────────────┐      ┌───────────────┐
 │ Plaintext Data ├─────►│ Hash Function ├─────►│ Fixed Hash    │  (Cannot be reversed!)
 └────────────────┘      └───────────────┘      └───────────────┘

  ENCRYPTION (Two-Way)
 ┌────────────────┐      ┌───────────────┐      ┌───────────────┐
 │ Plaintext Data ├─────►│  Encryption   ├─────►│ Ciphertext    │
 └──────┬─────────┘      └───────▲───────┘      └───────┬───────┘
        │                        │                      │
        │                  (Secret Key)                 │
        ▼                        │                      ▼
 ┌───────────────┐               │              ┌───────────────┐
 │ Original Data ◄───────────────┴──────────────┤  Decryption   │  (Reversible with key!)
 └───────────────┘                              └───────────────┘
```

#### Head-to-Head Comparison

| Feature | Hashing | Encryption |
|---------|---------|------------|
| **Direction** | One-Way (Cannot be reversed) | Two-Way (Reversible) |
| **Key Required?**| No | Yes (Secret Key) |
| **Output Length**| Fixed-Length | Variable (grows with input size) |
| **Primary Use** | Verifying data integrity, passwords, Tx references | Securing communication, private data transfer |
| **Example** | SHA-256, MD5 | AES, RSA, Caesar Cipher |

On a blockchain:
*   We **hash** transaction data to seal it and generate receipt references.
*   We **encrypt** private messages (e.g., if you are sending private data through a smart contract).

### 🧪 Practical Task 4.3 — Categorize the Cryptographic Tool

**Type:** Interactive Drag-and-Drop Sorting

**Setup:**
The user is shown 6 statement cards. They must drag each statement to either the **Hashing** bucket or the **Encryption** bucket.

**Statements to Sort:**
1.  "Used to securely store user passwords on a database so even the admin can't read them." → **Hashing**
2.  "Used to send private messages to Station Beta that only Station Beta should be able to read." → **Encryption**
3.  "Generates a fixed 64-character string regardless of how large the input document is." → **Hashing**
4.  "Requires a secret key to unlock and recover the original readable data." → **Encryption**
5.  "A mathematical process that cannot be reversed, even if you have infinite computing power." → **Hashing**
6.  "The output length grows larger as you encrypt larger files." → **Encryption**

**🏁 Flag:** Get 6/6 correct to pass. Submit the combination string of answers (H for Hashing, E for Encryption) in order of statements 1 to 6 → `HEHEHE`

**Debrief Text:**
> *"Correct! Remember: Hashing is for verification (integrity). Encryption is for privacy (confidentiality)."*

---

## Task 4.4 — Detect the Alien Message

### Theory

#### Verifying message integrity

Since hashes are deterministic and collision-resistant, we can use them to detect if a file or transmission has been modified during delivery.

If Station Alpha wants to send a file to Station Beta:
1.  Station Alpha hashes the file: `hash(file) = A1B2C3`
2.  Station Alpha sends the file to Station Beta over an unencrypted channel.
3.  Station Alpha sends the hash `A1B2C3` to Station Beta over a secure control channel.
4.  Station Beta receives the file and hashes it: `hash(received_file) = A1B2C3`
5.  If the hashes match, the file is authentic. If even a single byte was altered by an attacker, the hashes will not match.

This is how blockchains verify block data: the block header contains a hash of all the transactions in the body. If an attacker tries to change a transaction inside the body, the block hash will break, alerting the validators.

### 🧪 Practical Task 4.4 — Detect the Tampered Transmission

**Type:** Interactive Terminal (Auditor Tool)

**Setup:**
The user receives 4 messages sent from spacecraft. The control center has also received the expected hashes of these transmissions over a secure baseline channel. The user must run a hash tool on each message to locate which transmission was tampered with by alien interference.

**Expected Hashes:**
-   **Msg 1 expected:** `f129a008`... (Hash of `Sector 5 is clear`)
-   **Msg 2 expected:** `e5c7a911`... (Hash of `Oxygen status: 98%`)
-   **Msg 3 expected:** `d8d9b1c2`... (Hash of `Maintain speed at 5000 km/h`)
-   **Msg 4 expected:** `a8e9f1a2`... (Hash of `Initiating landing sequence`)

**Actual Transmissions received (User runs hashing on these in terminal):**
-   Transmission 1: `Sector 5 is clear`
-   Transmission 2: `Oxygen status: 98%`
-   Transmission 3: `Maintain speed at 5000 km/h`
-   Transmission 4: `Initiating Landing Sequence` (Capitalized 'L' and 'S')

**User Action:**
1.  Run the terminal hashing command on each transmission:
    *   `hash("Sector 5 is clear")` → matches expected.
    *   `hash("Oxygen status: 98%")` → matches expected.
    *   `hash("Maintain speed at 5000 km/h")` → matches expected.
    *   `hash("Initiating Landing Sequence")` → **DOES NOT MATCH** expected (avalanche effect due to casing changes!).
2.  Identify the corrupted transmission number.

**🏁 Flag:** The corrupted message number → `4`

**Debrief Text:**
> *"Excellent detective work. By comparing the calculated hash against the expected control hash, you spotted the capitalization changes that signaled a corrupted packet."*

---

## Task 4.5 — Chapter Challenge: SHA-256 Calibration

### Challenge Task
**Scenario:** "The engine logs must be calibrated. Enter the exact inputs that match the calibration hashes to initialize the Rocket Engine."

**Inputs to match:**
-   Input Alpha: `fuel_val_42`
-   Input Beta: `ignition_active`
-   Input Gamma: `stabilizers_on`

**SHA-256 Hashes provided by the core (first 8 characters):**
-   Hash 1: `6d39369f`
-   Hash 2: `e0e7a1cb`
-   Hash 3: `7a0b82f1`

*SHA-256 Hash definitions:*
-   `fuel_val_42` hash: `7a0b82f1...`
-   `ignition_active` hash: `6d39369f...`
-   `stabilizers_on` hash: `e0e7a1cb...`

**User Tasks:**
Identify which Input matches which Hash:
1.  Which input matches Hash 1? (Type `Alpha`, `Beta`, or `Gamma`)
2.  Which input matches Hash 2? (Type `Alpha`, `Beta`, or `Gamma`)
3.  Which input matches Hash 3? (Type `Alpha`, `Beta`, or `Gamma`)

**🏁 Flag:** Enter answers separated by colons → `Beta:Gamma:Alpha`

**Completion Animation:**
The ⚙️ **Rocket Engine** component slides into the rocket frame. A progress bar shows `4/8 modules completed`.

**Module Debrief:**
> *"Magnificent calibration! The Rocket Engine is fully built and installed. You have mastered cryptographic hashing, the avalanche effect, and transaction integrity checks. Next, you will see how these hashes link blocks together securely: How Blocks Are Connected."*

---
---

## Module 4 Summary

| Task | Title | Type | What the User Does | XP |
|------|-------|------|--------------------|----|
| 4.1 | What is Hashing? | Interactive Console | Enters inputs to inspect deterministic hashing behavior | +15 |
| 4.2 | The Avalanche Effect | Match Game | Compares minor input changes yielding massive hash shifts | +15 |
| 4.3 | Hashing vs. Encryption | Categorizer Puzzle | Classifies security tools based on directionality and keys | +15 |
| 4.4 | Detect the Alien Message | Terminal Auditor | Hashes actual transmissions to isolate tampered payloads | +20 |
| 4.5 | Chapter Challenge: Calibration | Integrity Match | Pairs configuration instructions to matching SHA-256 hashes | +20 |

**Total Module 4 XP: +85 XP**
**Rocket Component Earned: ⚙️ Rocket Engine**---

# MODULE 5 — How Blocks Are Connected

**Rocket Component Unlocked:** 🚀 Main Engine Nozzle
**Estimated Time:** 25–30 minutes
**Tasks:** 5
**Main Concept:** The Chain in Blockchain

> **Module Narrative:**
> *"The Rocket Engine is complete. Now, we must install the Main Engine Nozzle to direct the engine's exhaust and provide stability. In a blockchain, stability and immutability are achieved by linking blocks together in a chain of mathematical dependencies. If you cannot trace how modifications propagate and break chain integrity, you will not be able to align the nozzle."*

---

## Task 5.1 — The Previous Block Hash Link

### Theory

#### How the "Chain" is cryptographically forged

In Module 3, you saw that Block $N$ header points back to Block $N-1$. But how is this link made secure against fraud?

It is done by including the **Hash of Block $N-1$** as an input when calculating the **Hash of Block $N$**.

```
  BLOCK 1
 ┌──────────────────────┐
 │ Hash: 0xABC123       │◄──────────────────────────┐
 └──────────────────────┘                           │
                                                    │ (Included in hash calculation)
  BLOCK 2                                           │
 ┌──────────────────────┐                           │
 │ Header Metadata      │                           │
 │ Transaction List     │                           │
 │ Previous Hash: ──────┼─ [0xABC123] ──────────────┘
 ├──────────────────────┤
 │ Block Hash: ─────────┼─► hash(Header + Tx List + Prev Hash [0xABC123]) = 0xXYZ456
 └──────────────────────┘
```

Because Block 2's hash calculation includes Block 1's hash, Block 2's identity is mathematically bound to Block 1. You cannot modify Block 1 without altering Block 1's hash, which in turn alters the inputs for Block 2's hash, changing Block 2's hash as well.

This mathematical dependency creates the **chain** in blockchain.

### 🧪 Practical Task 5.1 — Inspect the Cryptographic Link

**Type:** Interactive UI (Chain Inspector)

**Setup:**
The lab shows a visual representation of 3 connected blocks.
-   Block 1 Hash: `0000a12fbc99`
-   Block 2 Hash: `0000e39a88cd` (Header includes `prev_hash: 0000a12fbc99`)
-   Block 3 Hash: `0000b21fa7e1` (Header includes `prev_hash: 0000e39a88cd`)

**User Action:**
1.  Click on **Block 2's header details**.
2.  Locate the field `previous_block_hash`.
3.  Compare it to the actual hash of **Block 1**. Note that they are identical.
4.  Change the transaction data inside **Block 1** using a mock input field (e.g., change `Amount: 10` to `Amount: 99`).
5.  Observe how Block 1's Hash changes instantly.
6.  Observe the warning error on **Block 2** saying: `prev_hash mismatch! Expected [new hash], found 0000a12fbc99`.

**🏁 Flag:** The field name in Block 2's header that links it to Block 1 → `prev_block_id`

**Debrief Text:**
> *"The cryptographic link binds block headers together. If a parent block changes, its child immediately detects the broken reference."*

---

## Task 5.2 — Block Dependency & The Domino Effect

### Theory

#### Tampering triggers a cascade

What happens if an attacker tries to change a transaction record that occurred 10 blocks ago?

1.  **Modify transaction:** The attacker changes a transaction in Block 1.
2.  **Block 1 Hash changes:** The hash of Block 1 changes immediately due to the avalanche effect.
3.  **Link breaks:** Block 2's header still contains the *old* hash of Block 1 as its `prev_block_id`. The link between Block 1 and Block 2 is now broken.
4.  **Repairing Block 2 breaks Block 3:** To make the chain look valid again, the attacker must update Block 2's `prev_block_id` to match Block 1's new hash. But changing that field modifies Block 2's header, which changes Block 2's own Hash!
5.  **The cascade:** Now the link between Block 2 and Block 3 is broken. The attacker must update Block 3's header, which changes Block 3's hash.

This is the **domino effect** of blockchain tampering.

```
          TAMPERED
         ┌────────┐        Broken Link       ┌────────┐        Broken Link       ┌────────┐
         │BLOCK 1 │xxxxxxxxxxxxxxxxxxxxxxxxxx│BLOCK 2 │xxxxxxxxxxxxxxxxxxxxxxxxxx│BLOCK 3 │
         │        │                          │        │                          │        │
  Hash:  │0xABC123│ (Changed to 0xPQR999)    │0xXYZ456│                          │0xEFG789│
  Prev:  │0x000000│                          │0xABC123│ (Doesn't match PQR999!)  │0xXYZ456│
         └────────┘                          └────────┘                          └────────┘
```

To alter a single transaction in the past, an attacker must recalculate the hashes for **every single block that has been created since that transaction**. On a live network, new blocks are added constantly, making it a race the attacker cannot win.

### 🧪 Practical Task 5.2 — Trigger the Domino Effect

**Type:** Interactive Simulation (Visual Pipeline)

**Setup:**
The lab shows an active chain of 5 blocks, all green (Valid status). A control panel allows the user to click "Tamper" on any block.

**User Action:**
1.  Click **"Tamper"** on **Block 2**.
2.  Watch the visual pipeline:
    *   Block 2 turns Red (Tampered).
    *   The link line between Block 2 and Block 3 flashes red and breaks.
    *   Block 3 turns Red.
    *   The link between Block 3 and Block 4 breaks.
    *   Block 4 and Block 5 turn Red in sequence.
3.  The console log prints:
    ```
    [System Check] Block 2 hash changed from 0xBBBB to 0x9999.
    [System Check] Block 3 validation failed: prev_block_id (0xBBBB) does not match parent hash (0x9999).
    [System Check] Block 4 validation failed: previous chain link broken.
    ```
4.  Answer: "Which blocks became invalid when you tampered with Block 2?" (Select options: `Block 2`, `Block 3`, `Block 4`, `Block 5`, `All of them`)

**🏁 Flag:** The correct choice representing the impacted blocks → `All of them`

**Debrief Text:**
> *"By checking that block hashes and previous references match all the way up the chain, any node can instantly verify the integrity of the entire ledger history in milliseconds."*

---

## Task 5.3 — Hashing a Block: Header Calculation

### Theory

#### What inputs go into a Block Hash?

To generate a block's unique hash, the validator hashes the fields inside the block's header:

$$\text{Block Hash} = \text{SHA256}(\text{Block Height} + \text{Timestamp} + \text{Prev Block ID} + \text{Tx Root Hash} + \text{Nonce})$$

Where:
*   **Block Height:** The position index (e.g., `5`).
*   **Timestamp:** Unix time integer (e.g., `1782200500`).
*   **Prev Block ID:** The hash of the parent block (e.g., `0xAAAA`).
*   **Tx Root Hash:** A single cryptographic hash representing all the transactions inside the block body (often calculated using a Merkle Tree structure).
*   **Nonce:** A random number used in consensus protocols (which you will learn about in Module 7).

Because all these fields are hashed together, changing the timestamp, modifying a single transaction, or changing the previous block ID will result in a completely different block hash.

### 🧪 Practical Task 5.3 — Compute a Block Hash

**Type:** Interactive Terminal (JS Console)

**Setup:**
The user is provided with the individual header fields of a mock block. They must use the terminal to join the fields and generate the SHA-256 block hash.

**The Block Header Fields:**
*   `height`: `"5"`
*   `timestamp`: `"1782200500"`
*   `prev_block_id`: `"0000a9b8"`
*   `tx_root`: `"f82e3c09"`
*   `nonce`: `"48291"`

**The Terminal Instructions:**
1.  Concatenate the fields in the order: `height + timestamp + prev_block_id + tx_root + nonce`.
2.  Input string: `"517822005000000a9b8f82e3c0948291"`
3.  Run the terminal command: `sha256("517822005000000a9b8f82e3c0948291")`
4.  View the output hash.

**🏁 Flag:** The first 8 characters of the resulting SHA-256 block hash → `d4d98a00`

**Debrief Text:**
> *"You've manually calculated a block hash. In production networks, this calculation is performed by validator nodes millions of times per second to seal ledgers."*

---

## Task 5.4 — Chain Integrity and Decentralized Security

### Theory

#### The protection of decentralization

If an attacker has a fast computer, couldn't they simply recalculate all the hashes on their own computer and pretend their modified chain is the real one?

Yes, they could. But on a blockchain, they are not alone.

Every node on the network has its own copy of the ledger. When the attacker broadcasts their tampered chain to the network:
1.  Other nodes verify the hashes.
2.  They notice the attacker's chain differs from their own copies.
3.  They compare the length and cumulative weight of the chain.
4.  The network consensus rule states: **The longest valid chain is the real chain.**
5.  Since the rest of the network is constantly adding new, honest blocks to the original chain, the honest chain grows faster than the attacker can compute updates. The attacker's modified chain is rejected.

This makes retro-active edits computationally impossible without controlling the majority of the network's computing power (known as a **51% attack**).

### 🧪 Practical Task 5.4 — Downstream Impact Audit

**Type:** Analytical Puzzle

**Setup:**
A blockchain network has 6 blocks:
`Block 0 -> Block 1 -> Block 2 -> Block 3 -> Block 4 -> Block 5`

An attacker compromises **Block 3** and alters a transactions entry.

**User Questions:**
1.  Which block's own hash changes first? (Input integer)
2.  Does Block 2's hash change? (Type `yes` or `no`)
3.  Which blocks downstream will fail validation because their `prev_block_id` reference no longer matches? (List integers separated by commas, e.g., `4,5`)

**🏁 Flag:** Enter answers separated by colons → `3:no:4,5`

**Debrief Text:**
> *"Correct. Changes propagate forward, not backward. Block 2 remains perfectly valid, while Block 3, 4, and 5 are invalidated."*

---

## Task 5.5 — Chapter Challenge: Repair the Galactic Blockchain

### Challenge Task
**Scenario:** "Alien saboteurs have tampered with a historical block on the Galactic Communications ledger. The chain is broken. You must locate the tampered block, calculate the correct repair hashes, and realign the Rocket Engine Nozzle."

**The Scrambled Chain State Log:**
```
Block #0 (Genesis):
- Hash: 0xAAAA
- Prev: 0x0000

Block #1:
- Hash: 0xBBBB
- Prev: 0xAAAA

Block #2 (ALERT: TAMPERED VALUE!):
- Hash: 0x9999 (should be calculated from prev: 0xBBBB and data: "val_42")
- Actual data modified to: "val_99" (generating incorrect hash: 0x9999)
- Prev: 0xBBBB

Block #3 (FAILED LINK):
- Hash: 0xDDDD (calculated from prev: 0xCCCC and data: "val_33")
- Prev: 0xCCCC (Error: parent hash is actually 0x9999, which doesn't match!)
```

**User Tasks:**
1.  **Which block index was tampered with?** (Input integer)
2.  If you restore the data of Block 2 to `"val_42"`, its hash returns to `0xCCCC`. What value must be in Block 3's `prev_block_id` field to repair the link between Block 2 and Block 3? (Input hash string, e.g., `0xCCCC`)

**🏁 Flag:** Enter answers separated by a colon → `2:0xCCCC`

**Completion Animation:**
The 🚀 **Main Engine Nozzle** component aligns and locks onto the rocket engine exhaust chamber. A progress bar shows `5/8 modules completed`.

**Module Debrief:**
> *"Excellent repair sequence! The Engine Nozzle is installed, and the chain integrity is restored. You now understand how cryptographic links create immutable historical chains. In the next module, you will learn who controls these networks: Decentralization & Distributed Networks."*

---
---

## Module 5 Summary

| Task | Title | Type | What the User Does | XP |
|------|-------|------|--------------------|----|
| 5.1 | Cryptographic Links | Chain Inspector | Observes how child blocks reference parent hashes | +15 |
| 5.2 | The Domino Effect | Pipeline Simulation | Tampers with a block to watch downstream invalidation propagate | +20 |
| 5.3 | Hashing a Block Header | Terminal Console | Concatenates and hashes header metadata fields | +20 |
| 5.4 | Downstream Audit | Analytical Puzzle | Maps block dependencies to identify broken links | +15 |
| 5.5 | Chapter Challenge: Repair Chain | Repair Game | Identifies a broken block index and inputs the repair pointer | +15 |

**Total Module 5 XP: +85 XP**
**Rocket Component Earned: 🚀 Main Engine Nozzle**

---

# MODULE 6 — Decentralization & Distributed Networks

**Rocket Component Unlocked:** 📡 Communication System
**Estimated Time:** 25–30 minutes
**Tasks:** 5
**Main Concept:** Who Controls Blockchain?

> **Module Narrative:**
> *"The Rocket Nozzle is aligned. Now, we must assemble the Communication System. A rocket in deep space needs a reliable way to communicate without relying on a single, distant ground control antenna. In a blockchain, this reliability is achieved using a distributed peer-to-peer network. If you cannot configure a fault-tolerant network node mesh, you will lose signal in the deep cosmos."*

---

## Task 6.1 — Centralized, Decentralized, and Distributed Topologies

### Theory

#### Three ways to connect a network

How are computers organized to share information? There are three main network architectures (topologies):

```
     CENTRALIZED                    DECENTRALIZED                    DISTRIBUTED
        User                             Hub                            Node
       ↙  ↓  ↘                          ↙   ↘                          ↙  █  ↘
    User←─Server─→User               Node   Node                    Node──┼──Node
       ↖  ↑  ↗                          ↖   ↗                          █  ▼  █
        User                             Hub                        Node──┴──Node
   (Single server controls)      (Clusters of local hubs)       (Fully meshed, all peers)
```

1.  **Centralized Network:** Every user connects to a single central server. The server holds all data. If the server crashes or is blocked, the entire network dies.
2.  **Decentralized Network:** There is no single central server, but rather a collection of local servers or "hubs" that connect clusters of users. If one hub fails, only its local cluster is affected.
3.  **Distributed Network (Mesh):** Every computer (called a **node** or **peer**) connects directly to multiple other nodes. There are no servers and no hubs. Every participant is an equal peer. If half the nodes fail, the network still functions.

#### The Blockchain choice

A blockchain is a **distributed, peer-to-peer (P2P) network**. Every participant runs node software that communicates directly with other participants. There is no "master copy" of the database; instead, everyone holds an identical copy.

#### Key Terms

| Term | Definition |
|------|-----------|
| Topology | The structural layout of a network's connections |
| Peer-to-Peer (P2P) | A network architecture where equal participants connect directly without central coordination |
| Node | Any computer connected to the blockchain network that runs the node software client |
| Fault Tolerance | The ability of a network to continue operating normally even when some components fail |

### 🧪 Practical Task 6.1 — Network Topology Builder

**Type:** Drag-and-Drop Connection Canvas

**Setup:**
The lab presents 6 station nodes on a workspace. The user must use a connection tool to draw links between them to form specific network shapes.

**Tasks:**
1.  **Build a Centralized Topology:** Connect all 5 outer stations to one single center station.
2.  **Build a Distributed Topology:** Connect every station to at least 3 other stations, forming a mesh network.

**🏁 Flag:** The total number of connection links required to make a 6-node network fully distributed/meshed (where every node connects to every other node) → `15`

**Debrief Text:**
> *"Correct. A fully meshed distributed network has high redundancy. It requires many more connection links, but it eliminates any single point of attack or failure."*

---

## Task 6.2 — What is a Blockchain Node?

### Theory

#### The worker bees of the network

A **node** is simply a computer that runs the blockchain's open-source software client (like Bitcoin Core, Go-Ethereum, or Stellar-Core). Nodes perform the work of maintaining the network.

There are different types of nodes based on their roles:

1.  **Full Nodes:**
    *   Download and keep a complete copy of the blockchain history (from the Genesis block to the current block).
    *   Verify every transaction and block against the protocol rules.
    *   Forward valid data to other nodes.
2.  **Light Nodes (SPV - Simplified Payment Verification):**
    *   Only download block headers (not the transaction lists in the body).
    *   Rely on Full Nodes to verify transaction details when needed.
    *   Require very little storage and memory; can run on mobile phones or web browsers.
3.  **Validator / Consensus Nodes:**
    *   Special full nodes that participate in the consensus voting process to decide which blocks are added to the chain next.

Anyone can run a node. You do not need permission from a bank or government. The open-source code defines the protocol, and running the node means you agree to follow those rules.

### 🧪 Practical Task 6.2 — Audit the Node Config

**Type:** Interactive UI (JSON Config Inspector)

**Setup:**
The user is shown the active system configuration file of a node on the command deck (`node-config.json`). They must inspect the parameters to determine the node's operating mode.

**`node-config.json` file:**
```json
{
  "node_id": "MERCURY_VALIDATOR_09",
  "client_version": "v1.4.2",
  "network": "mercury_testnet",
  "storage": {
    "sync_mode": "full_history",
    "keep_tx_index": true,
    "pruning_enabled": false
  },
  "consensus": {
    "participate_in_voting": true,
    "quorum_set": ["NODE_ALPHA", "NODE_BETA", "NODE_GAMMA"]
  },
  "max_peers": 40
}
```

**User Action:**
Identify the configuration values:
1.  Is this node running as a full history node or a light client? (Check `storage.sync_mode` and input `full` or `light`)
2.  Does this node participate in consensus voting? (Check `consensus.participate_in_voting` and type `yes` or `no`)
3.  What is the `node_id`? (Paste string)

**🏁 Flag:**
- Question 1: `full`
- Question 2: `yes`
- Question 3: `MERCURY_VALIDATOR_09`

**Debrief Text:**
> *"Correct. This is a Full Validator Node. It stores the full ledger history and actively participates in consensus voting to secure the network."*

---

## Task 6.3 — Peer-to-Peer (P2P) Communication & Gossip Protocols

### Theory

#### How information travels without a server

If there is no central database server, how does Node A let the rest of the world know about a transaction it just created?

It uses a **Gossip Protocol** (sometimes called epidemic routing).

```
   Step 1: User submits Tx to Node A
   Step 2: Node A verifies Tx and "gossips" (forwards) it to its direct peers (B & C)
   Step 3: Nodes B and C verify the Tx and gossip it to their peers (D, E, F)
   Step 4: The transaction propagates across the entire global mesh in seconds
```

#### The validation rule at every hop

Nodes do not blindly forward messages. Before forwarding a transaction or block, a node **fully validates it**.
-   If Node A receives an invalid transaction (e.g., bad signature or double spend), it discards it immediately.
-   The gossip stops there. Invalid data cannot propagate.
-   If a node repeatedly broadcasts bad data, other nodes will disconnect from it, protecting the network from spam attacks.

This combination of independent validation and gossip ensures that the network stays synchronized and clean without any central coordinator.

### 🧪 Practical Task 6.3 — Gossip Simulator

**Type:** Interactive Simulation (Network Graph Animation)

**Setup:**
The user is shown a graph of 10 nodes linked P2P. Clicking on a node allows the user to "Submit Transaction".

**User Action:**
1.  Click on **Node 1** and submit a transaction: `Send 5 fuel units`.
2.  Watch the animation:
    *   Node 1 turns blue (Verified).
    *   Node 1 transmits the packet to Node 2 and Node 3.
    *   Nodes 2 and 3 turn blue and transmit to their neighbors.
    *   Within 2 seconds, all 10 nodes turn blue, indicating the transaction has fully propagated.
3.  Now, try to submit an **Invalid Transaction** (e.g., negative amount) on **Node 4**.
4.  Observe: Node 4 checks the rules, detects the invalid amount, flashes red (Rejected), and **does not forward the packet**. The rest of the network remains green.

**🏁 Flag:** The node index that rejected the invalid transaction in the simulation → `4`

**Debrief Text:**
> *"Because every node is an independent auditor, bad data is blocked at the first point of entry, preventing network contamination."*

---

## Task 6.4 — Fault Tolerance: Surviving Node Failures

### Theory

#### The math of network survival

How many nodes can fail before the network stops working?

In a distributed network, the level of **fault tolerance** determines how many nodes can crash, go offline, or be compromised without halting operations.

*   **Crash Fault Tolerance (CFT):** A network can survive as long as a simple majority of nodes are online (e.g., in a 5-node network, at least 3 nodes must be online).
*   **Byzantine Fault Tolerance (BFT):** In networks where nodes might be malicious (liars), the network can survive as long as more than two-thirds of the nodes are honest.
    *   If $f$ nodes are malicious, the network must contain at least $3f + 1$ total nodes to reach consensus safely.

#### Catching up after an outage

If Node A goes offline for 10 hours, what happens when it boots back up?
1.  It queries its peers for the highest block height on the network.
2.  It discovers the network is at Block #200, while its local storage is stuck at Block #100.
3.  It requests the missing blocks (Block #101 to #200) from its active peers.
4.  It validates each block sequentially and updates its ledger database.
5.  It goes back to processing live transactions.

### 🧪 Practical Task 6.4 — Network Outage Audit

**Type:** Analytical Calculator Console

**Setup:**
The console displays live network logs from a space communication network.
-   Total Configured Nodes: `12`
-   Consensus Rules: Needs a Byzantine Fault Tolerant majority ($3f+1$ rule) to operate safely.
-   Current nodes reporting active status: `9` online, `3` offline.

**User Questions:**
1.  What percentage of the network is currently online? (Calculate percentage integer)
2.  Based on the BFT threshold ($3f+1$), what is the maximum number of malicious/offline nodes ($f$) this 12-node network can tolerate while remaining secure?

**🏁 Flag:** Enter the calculations separated by a colon → `75:3`

**Debrief Text:**
> *"Excellent. At 75% online, the network is well within its Byzantine Fault Tolerance thresholds, allowing safe operation even with 3 offline validator nodes."*

---

## Task 6.5 — Chapter Challenge: Save Mercury's Communication Network

### Challenge Task
**Scenario:** "Solar storms are throwing electromagnetic interference across Mercury. The central command server has been disabled. You must distribute backup nodes across different space stations to form a fault-tolerant distributed communication system and finalize the Rocket's Communication Module."

**Interactive Map Setup:**
-   **Stations Available:** Alpha, Beta, Gamma, Delta, Epsilon
-   **Node Budget:** You have 5 nodes to deploy.
-   **Rule:** Deploying multiple nodes at a single station is dangerous (meteor strike on that station will take out all nodes placed there). You must distribute them evenly (1 per station).
-   **Consensus Requirement:** A minimum of 3 connected nodes must stay online to keep the network active.

**The Attack Simulation:**
1.  The user drags and places 1 node on each of the 5 stations.
2.  Click **"Run Simulation"**.
3.  Three random station outages occur in sequence:
    *   *Outage 1: Station Alpha goes offline.* (4 nodes remain. Network status: ✅ Online)
    *   *Outage 2: Station Gamma goes offline.* (3 nodes remain. Network status: ✅ Online)
    *   *Outage 3: Station Delta goes offline.* (2 nodes remain. Network status: ❌ Offline - Consensus Lost!)
4.  The user is asked: "If you only had a centralized server at Station Alpha, at which Outage would the system have crashed?" (Input integer)
5.  With 5 distributed nodes, at which Outage did the system finally fail consensus? (Input integer)

**🏁 Flag:** Enter the outage numbers separated by a colon → `1:3`

**Completion Animation:**
The 📡 **Communication System** antenna unfolds and mounts onto the rocket fuselage. A progress bar shows `6/8 modules completed`.

**Module Debrief:**
> *"Brilliant network deployment! The Communication System is active and configured. You now understand how distributed networks eliminate central failures. In the next module, you will learn how these independent nodes agree on which transactions are valid: Consensus & Transaction Validation."*

---
---

## Module 6 Summary

| Task | Title | Type | What the User Does | XP |
|------|-------|------|--------------------|----|
| 6.1 | Topologies | Diagram Builder | Maps centralized, decentralized, and distributed connections | +15 |
| 6.2 | Node Config | File Inspector | Audits node parameters to identify client operating modes | +15 |
| 6.3 | Gossip Protocols | Mesh Simulator | Propagates valid and rejects invalid transactions in a network | +20 |
| 6.4 | Fault Tolerance | Calculator Console | Computes Byzantine thresholds and online network states | +20 |
| 6.5 | Chapter Challenge: Save Network | Network Game | Deploys nodes to survive station outages and maintain consensus | +15 |

**Total Module 6 XP: +85 XP**
**Rocket Component Earned: 📡 Communication System**---

# MODULE 7 — Consensus & Transaction Validation

**Rocket Component Unlocked:** 🧭 Navigation System
**Estimated Time:** 25–30 minutes
**Tasks:** 5
**Main Concept:** How Does Everyone Agree?

> **Module Narrative:**
> *"The Communication System is operational. Now, we must install the Navigation System. Navigation requires absolute coordinate consensus. In a blockchain, consensus ensures that all distributed nodes agree on a single, verified version of transaction history. If you cannot help the Galactic Council reach network consensus, the rocket will drift off course into the void."*

---

## Task 7.1 — The Consensus Problem & The Byzantine Generals

### Theory

#### How do we trust a group of strangers?

In a centralized system, there is no consensus problem: the central server decides what is true, and everyone else accepts it.

In a distributed network, there is no boss. If Node A says *"Alice has $10"*, and Node B says *"Alice has $0"*, how does the network decide who is telling the truth? This is the core problem of **consensus**.

This problem was defined in 1982 by computer scientists as the **Byzantine Generals Problem**:

```
                  [ General 1: Attack! ]
                       ↙        ↘
 [ General 2: Attack! ]          [ Traitor General 3: Retreat! ]
                       ↖        ↗
                  [ General 4: ??? ]
 (Generals must reach a single unanimous plan. If traitors lie, can they still agree?)
```

*   **The Scenario:** Multiple generals surround an enemy city. They can only communicate via messengers.
*   **The Goal:** They must agree on a single plan: either all Attack, or all Retreat. A split action leads to defeat.
*   **The Threat:** Some generals might be traitors who send conflicting messages (telling one general "Attack" and another "Retreat") to cause chaos.
*   **The Solution:** The generals need a protocol where honest participants can reach a unanimous agreement even if up to one-third of the generals are actively lying or offline.

On a blockchain, the generals are **nodes**, the messengers are **P2P packets**, and the traitors are **malicious hackers** trying to submit fake transactions.

### 🧪 Practical Task 7.1 — The General's Decision

**Type:** Interactive Logic Puzzle (Visual Scenario)

**Setup:**
The lab presents 4 Space Generals (Alpha, Beta, Gamma, Delta) communicating via space probes. One general is secretly a traitor.
*   General Alpha (Commander) sends an order: `ATTACK`.
*   General Beta (Honest) receives `ATTACK` and relays it.
*   General Gamma (Honest) receives `ATTACK` and relays it.
*   General Delta (Traitor) receives `ATTACK` but relays `RETREAT` to General Beta, and `ATTACK` to General Gamma.

**User Action:**
Calculate the votes received by the honest generals:
1.  How many `ATTACK` votes does General Beta receive in total from all peers? (Alpha, Gamma, Delta)
2.  How many `RETREAT` votes does General Beta receive in total?
3.  What is the majority vote for General Beta? (Type `ATTACK` or `RETREAT`)

*Calculations for Beta:*
-   From Alpha (Commander): `ATTACK`
-   From Gamma (Honest): `ATTACK`
-   From Delta (Traitor): `RETREAT`
-   Total: 2 `ATTACK`, 1 `RETREAT`. Majority = `ATTACK`.

**🏁 Flag:** Enter answers separated by colons → `2:1:ATTACK`

**Debrief Text:**
> *"Correct. Even with one traitor sending conflicting instructions, the honest majority reaches consensus on the correct battle plan. This is the mathematical basis of Byzantine Fault Tolerance."*

---

## Task 7.2 — Introduction to Proof of Work & Proof of Stake

### Theory

#### Two ways traditional blockchains agree

To prevent an attacker from generating thousands of fake virtual nodes to control the network vote (called a **Sybil Attack**), consensus protocols require nodes to prove they have expended real-world resources.

The two most common methods are:

**1. Proof of Work (PoW):**
*   **How it works:** Nodes (called **miners**) compete to solve extremely complex mathematical puzzles. The first to solve it gets to publish the next block and earn a reward.
*   **Resource Expended:** Raw electricity and computer hardware power (hashrate).
*   **Used by:** Bitcoin, early Ethereum.
*   **Tradeoff:** Extremely secure, but slow and consumes massive amounts of energy.

**2. Proof of Stake (PoS):**
*   **How it works:** Nodes (called **validators**) lock up (stake) a quantity of the blockchain's native tokens as collateral. The system randomly selects validators to propose and vote on blocks. The larger your stake, the higher your chance of selection.
*   **Resource Expended:** Financial capital (native cryptocurrency).
*   **Used by:** Ethereum, Cardano, Solana.
*   **Tradeoff:** Energy-efficient, but favors participants who already hold the most wealth.

```
       PROOF OF WORK (PoW)                       PROOF OF STAKE (PoS)
  ┌───────────────────────────┐             ┌───────────────────────────┐
  │ Compute Power (Hashrate)  │             │   Token Capital (Stake)   │
  │   [ Mining Rig Farm ]     │             │   [ Locked Collateral ]   │
  └─────────────┬─────────────┘             └─────────────┬─────────────┘
                ▼                                         ▼
   First to solve puzzle wins                Random selection by weight
```

### 🧪 Practical Task 7.2 — Match the Consensus Traits

**Type:** Interactive Drag-and-Drop Sorting

**Setup:**
The user is shown 6 characteristics. They must sort them into the **Proof of Work (PoW)** bucket or the **Proof of Stake (PoS)** bucket.

**Traits to Sort:**
1.  "Consumes massive amounts of electricity to run specialized mining hardware." → **PoW**
2.  "Requires validators to lock up native cryptocurrency tokens as collateral." → **PoS**
3.  "The probability of building a block depends on your share of the network's computing power." → **PoW**
4.  "Is highly energy-efficient and can run on consumer-grade servers." → **PoS**
5.  "Requires miners to find a specific block nonce value that satisfies a difficulty target." → **PoW**
6.  "If a validator attempts to approve invalid blocks, their locked funds are slashed (taken away)." → **PoS**

**🏁 Flag:** Submit the combination sequence (W for PoW, S for PoS) for traits 1 to 6 → `WSWSSS`

**Debrief Text:**
> *"Correct! While PoW relies on thermodynamics and hardware, PoS relies on financial incentives and collateral locks to enforce honesty."*

---

## Task 7.3 — Introduction to Federated Consensus (Stellar / SCP)

### Theory

#### Consensus through trust groups

Stellar does not use PoW or PoS. Instead, it uses the **Stellar Consensus Protocol (SCP)**, which is an implementation of the **Federated Byzantine Agreement (FBA)**.

Unlike PoW (where anyone with electricity competes) or PoS (where anyone with capital stakes), SCP uses **Quorum Slices**:
*   Every node operator selects a set of other nodes on the network that they trust to be honest (this group is their **Quorum Slice**).
*   For example, Node A might declare: *"I trust Node B, Node C, and Node D."*
*   Consensus is reached locally inside these slices. When quorum slices overlap across different organizations globally, agreement propagates across the entire network.

```
 [ Node A ] trusts ──► [ Node B, Node C, Node D ] (Quorum Slice 1)
                            ▲        ▲
 [ Node E ] trusts ─────────┘        └─────── [ Node F ] (Quorum Slice 2)
```

#### Why this is a major improvement
*   **Fast:** No heavy math puzzles. Blocks are resolved in 5 seconds.
*   **Free/Low Cost:** No mining computation required. Fees are near zero.
*   **Decentralized Control:** Anyone can choose who they trust. You do not need to rely on a central set of miners or wealthy stakers.

### 🧪 Practical Task 7.3 — Find the Quorum Overlap

**Type:** Interactive Graph Viewer

**Setup:**
The lab shows a graph of 5 nodes: Node 1, Node 2, Node 3, Node 4, Node 5. Clicking on a node shows its configured quorum slice (the nodes it trusts).

**Configured Slices:**
-   **Node 1 Trusts:** `{Node 2, Node 3}`
-   **Node 2 Trusts:** `{Node 1, Node 3}`
-   **Node 3 Trusts:** `{Node 1, Node 2, Node 4}`
-   **Node 4 Trusts:** `{Node 3, Node 5}`
-   **Node 5 Trusts:** `{Node 4}`

**User Task:**
Identify the primary group of nodes (the "Quorum Core") that must reach agreement to bind the entire network. The user clicks on nodes to add them to a candidate set.
*   *Observation:* Nodes 1, 2, and 3 all trust each other mutually. They form the core quorum.

**🏁 Flag:** The list of node indices in the core quorum, sorted ascending and separated by commas → `1,2,3`

**Debrief Text:**
> *"You've identified the overlapping consensus slice. In the Stellar network, nodes run by organizations like SDF, universities, and payment gateways overlap to keep the global ledger in lockstep."*

---

## Task 7.4 — Resolving Double-Spending Conflicts

### Theory

#### What happens when a user attempts to double-spend?

If a user holds 10 XLM and submits two transactions at the exact same moment:
*   **Tx A:** Send 10 XLM to Bob.
*   **Tx B:** Send 10 XLM to Alice.

Since there is no central database to lock, how does a P2P network resolve the conflict?

It is resolved through block ordering and validator agreement:
1.  The transactions enter the network and propagate to different nodes' mempools.
2.  Validators group transactions into a block.
3.  Inside the block, transactions are given a strict sequential index (e.g., Tx A is index 0, Tx B is index 1).
4.  When the block is evaluated:
    *   **Tx A (Index 0)** is executed. The user's balance drops from 10 XLM to 0 XLM.
    *   **Tx B (Index 1)** is evaluated next. The validator checks the balance, sees 0 XLM, and rejects Tx B as invalid.
5.  Once the block is agreed upon by consensus, the order is locked. Tx A is permanent, and Tx B is permanently discarded.

Consensus doesn't just validate transactions; it decides their **exact order of execution**.

### 🧪 Practical Task 7.4 — Resolve the Double-Spend

**Type:** Interactive Validation Console

**Setup:**
The user is shown two competing transactions received by the mempool at similar timestamps.
-   `User_Account` starting balance: `100 units`

**Competing Transactions:**
*   **Tx Alpha:** `User_Account` sends `80 units` to `Station_B`. (Timestamp: `14:02:10.012`)
*   **Tx Beta:** `User_Account` sends `30 units` to `Station_C`. (Timestamp: `14:02:10.015`)

**User Action:**
1.  Verify which transaction is processed first based on timestamp order.
2.  Calculate the remaining balance after the first transaction executes.
3.  Determine if the second transaction is valid or must be rejected.
4.  Enter: **Which transaction is accepted?** (`Alpha` or `Beta`) and **Which is rejected?** (`Alpha` or `Beta`)

**🏁 Flag:** Enter the accepted and rejected names separated by a colon → `Alpha:Beta`

**Debrief Text:**
> *"Correct. Because Tx Alpha is processed first, it depletes the account balance to 20 units. Tx Beta is rejected during block evaluation because the sender's balance is insufficient."*

---

## Task 7.5 — Chapter Challenge: Galactic Council Decision

### Challenge Task
**Scenario:** "The Galactic Council of space stations must approve a fuel supply transaction. Station Alpha wants to transfer 500 Fuel Units to Station Beta. You must audit the council node votes, enforce the consensus quorum rules, and restore the Rocket's Navigation System."

**Council State Details:**
-   **Station Alpha Actual Balance:** 600 Fuel Units (verified by the ledger history).
-   **Council quorum slice rule:** Needs a simple majority (at least 3 out of 5 nodes) to agree on the state of the account balance before the transaction is finalized.

**The Votes Reported by Council Nodes:**
-   **Node 1 (Alpha Station):** Vote: `Approve` (Reports Alpha balance is 600)
-   **Node 2 (Beta Station):** Vote: `Approve` (Reports Alpha balance is 600)
-   **Node 3 (Gamma Station):** Vote: `Approve` (Reports Alpha balance is 600)
-   **Node 4 (Delta Station - Out of Sync):** Vote: `Reject` (Reports Alpha balance is 400 - Insufficient!)
-   **Node 5 (Epsilon Station - Malicious Traitor):** Vote: `Reject` (Reports Alpha balance is 300 - Insufficient!)

**User Tasks:**
1.  How many nodes voted to **Approve** the transaction? (Input integer)
2.  How many nodes voted to **Reject**? (Input integer)
3.  Does the transaction reach consensus and get accepted? (Type `yes` or `no`)
4.  What is the final balance of Station Alpha after consensus is executed? (Input integer)

**🏁 Flag:** Enter answers separated by colons → `3:2:yes:100`

**Completion Animation:**
The 🧭 **Navigation System** compass interface boots up and locks into the command module panel. A progress bar shows `7/8 modules completed`.

**Module Debrief:**
> *"Outstanding consensus resolution! The Navigation System is online and calibrated. You have mastered the Byzantine Generals Problem, PoW vs. PoS, Federated Consensus, and transaction ordering. In the final module of Mercury, you will study where to apply blockchain: Immutability, Transparency & Use Cases."*

---
---

## Module 7 Summary

| Task | Title | Type | What the User Does | XP |
|------|-------|------|--------------------|----|
| 7.1 | Consensus Problem | Logic Puzzle | Solves a Byzantine Generals message routing scenario | +15 |
| 7.2 | PoW vs. PoS | Drag-and-Drop | Classifies and compares characteristics of PoW and PoS | +15 |
| 7.3 | Federated Consensus | Graph Inspector | Identifies core overlapping quorum trust groups in a network | +20 |
| 7.4 | Double-Spending | Console Audit | Resolves competing transaction conflicts using execution order | +20 |
| 7.5 | Chapter Challenge: Council | Consensus Game | Audits validator voting distributions to finalize transfers | +15 |

**Rocket Component Earned: 🧭 Navigation System**

---

# MODULE 8 — Immutability, Transparency & Use Cases

**Rocket Component Unlocked:** 🧑‍🚀 Command Module
**Estimated Time:** 25–30 minutes
**Tasks:** 5
**Main Concept:** When Should We Actually Use Blockchain?

> **Module Narrative:**
> *"The Navigation System is calibrated. Now, you must assemble the final component: the Command Module. The command module houses the flight computer, where final decisions are made. To boot the system, you must understand the true business logic of blockchain — when it is a powerful tool, and when it is useless complexity. Make the wrong decision, and your systems will collapse under the weight of inefficient programming."*

---

## Task 8.1 — Immutability, Transparency, and Traceability

### Theory

#### The three design values of blockchain

Why do companies build on a blockchain if it is slower than a traditional database? They do it to get three specific benefits:

1.  **Immutability:**
    *   Once a block is verified and chained, the consensus rules and domino-effect hashing make it practically impossible to edit or delete historical transactions.
    *   **Value:** Complete trust in historical records. Nobody can secretly change the terms of a deal after the fact.
2.  **Transparency:**
    *   Every account, transaction, and block is public. Anyone can run a node and view the entire state of the ledger.
    *   **Value:** Public auditability. A charity can prove exactly how donations were spent, or a bank can prove they actually hold client reserves.
3.  **Traceability:**
    *   Because the ledger is append-only and chronological, you can trace the history of any transaction or token back to its genesis creation.
    *   **Value:** Provenance. You can track a bag of organic coffee beans or a diamond from the farm/mine, through shipping, to the retail store to prove its authenticity.

### 🧪 Practical Task 8.1 — Trace the Cosmic Supply Chain

**Type:** Interactive Supply Chain Auditor

**Setup:**
The user is shown a space shipping ledger. A cargo ship has delivered "Rare Dilithium Crystals" to Station Beta. The user must verify that these crystals originated from a licensed mining station on Mars, not from black-market smugglers.

**Ledger Transaction Paths:**
*   `Tx 1`: `G_MARS_MINE_01` mints `50 units` of Dilithium. (Hash: `0xMINT`)
*   `Tx 2`: `G_MARS_MINE_01` sends `50 units` to `G_SHIPPING_CORP`. (Hash: `0xSHIP`)
*   `Tx 3`: `G_SHIPPING_CORP` sends `30 units` to `G_STATION_BETA`. (Hash: `0xDELIVER`)
*   `Tx 4`: `G_SMUGGLER_VOID` sends `10 units` to `G_STATION_BETA`. (Hash: `0xILLEGAL`)

**User Action:**
1.  Verify the origin hash of the dilithium batch received by `G_STATION_BETA` in `Tx 3`.
2.  Trace if the batch is authentic (originates from `G_MARS_MINE_01`) or fake (originates from `G_SMUGGLER_VOID`).
3.  Answer: "Is the shipment in Tx 3 authentic?" (Type `yes` or `no`).
4.  Answer: "Which transaction represents the illegal smuggle attempt?" (Type the Tx hash, e.g., `0xILLEGAL`).

**🏁 Flag:** Enter answers separated by a colon → `yes:0xILLEGAL`

**Debrief Text:**
> *"Correct. Because blockchain records are transparent and traceable, you easily traced the cargo back to the original licensed Martian mine, exposing the smuggler's parallel payment attempt."*

---

## Task 8.2 — The Disadvantages of Blockchain

### Theory

#### No technology is a silver bullet

Blockchain is slow, expensive, and difficult to design. To use it correctly, you must understand its limitations:

1.  **Scalability & Speed (TPS):**
    *   Traditional databases can process millions of transactions per second. Blockchains (like Bitcoin) can process only 7 transactions per second, and Ethereum ~15–30.
    *   **Why:** Reaching agreement across thousands of independent nodes takes time.
2.  **Storage Bloat:**
    *   Because the ledger is append-only, the database grows larger forever. Every full node must download this entire history. Currently, the Ethereum blockchain requires hundreds of gigabytes of SSD space.
3.  **Cost (Gas/Transaction Fees):**
    *   Every transaction requires processing power, so users must pay a fee to validators. During high network demand, fees on Ethereum can jump to $50+ for a single simple transfer.
4.  **Absolute User Responsibility:**
    *   If you lose your private key or send funds to the wrong address, **your money is gone forever**. There is no customer support hotline to reverse a transaction.

### 🧪 Practical Task 8.2 — The Trade-Off Calculator

**Type:** Analytical Puzzle

**Setup:**
The user must analyze network logs to determine if a project should migrate to a blockchain.

**Network performance data provided:**
-   Current Centralized System: processes `5,000 requests/second` at a cost of `$0.0001` per write.
-   Proposed Blockchain: processes max `15 transactions/second` at an average transaction fee of `$1.20`.

**User Questions:**
1.  If a ticketing app requires processing `20,000 transactions` in 10 seconds during a major concert release, can the proposed blockchain handle this traffic? (Type `yes` or `no`)
2.  What is the transaction capacity limit (TPS) of the proposed blockchain? (Input integer)
3.  What is the cost difference to process 1,000 transactions on the blockchain compared to the centralized database? (Input cost integer in dollars)

*Calculations:*
-   Required ticket processing rate: $20,000 / 10 = 2,000$ requests/second.
-   Blockchain capacity: 15 transactions/second. Cannot handle.
-   Cost difference: Centralized cost = $1,000 \times 0.0001 = \$0.10$. Blockchain cost = $1,000 \times \$1.20 = \$1,200.00$. Difference = $\$1,199.90$.

**🏁 Flag:** Enter answers separated by colons (truncate decimal values for cost difference) → `no:15:1199`

**Debrief Text:**
> *"Correct. For high-speed, high-volume, and low-cost systems with no trust issues, a traditional database remains the only viable choice."*

---

## Task 8.3 — Real-World Blockchain Applications

### Theory

#### Where blockchain actually excels

We know when not to use it. So where does blockchain actually solve major problems?

1.  **Cross-Border Payments & Remittances:**
    *   *Problem:* International bank wires take days and cost 5–10% in fees.
    *   *Solution:* Cryptocurrencies settle globally in seconds for fractions of a cent (e.g., Stellar excels at cross-currency path payments).
2.  **Asset Tokenization:**
    *   *Problem:* Buying real estate, gold, or private company stock requires complex brokers, paper records, and high minimum investments.
    *   *Solution:* Representing ownership as digital tokens on a blockchain, allowing fractional ownership and instant 24/7 trading.
3.  **Digital Identity & Verifiable Credentials:**
    *   *Problem:* Paper certificates and passports are easy to forge, and digital logins are centralized under Google/Facebook.
    *   *Solution:* Storing cryptographic signatures of degrees or credentials on-chain, allowing users to prove their qualifications instantly without a middleman.
4.  **Decentralized Finance (DeFi):**
    *   *Problem:* Traditional loans and exchanges require approval from credit bureaus and banks.
    *   *Solution:* Smart contracts that automate lending and trading based on collateral, open to anyone with an internet connection.

### 🧪 Practical Task 8.3 — Match the Use Case

**Type:** Interactive Drag-and-Drop Matching

**Setup:**
The user must match real-world business problems to their correct blockchain solutions.

**Problems:**
1.  "A humanitarian agency needs to distribute aid money directly to refugees who do not have bank accounts or identity documents." → **Stablecoins / Stellar Network**
2.  "An art collector wants to purchase a fractional share (1%) of a $10 million painting and trade it instantly." → **Tokenization / NFTs**
3.  "A luxury watch brand needs to prove that a buyer's watch is an authentic original, not a counterfeit copy." → **Supply Chain Tracking / Digital Certificates**
4.  "A developer wants to build a lending market where users can borrow funds automatically without any credit checks, using digital assets as collateral." → **Decentralized Finance (DeFi)**

**🏁 Flag:** Match all 4 correctly to pass. Submit the matching order sequence (indices 1 to 4) → `1234`

**Debrief Text:**
> *"Correct. These use cases succeed because they directly solve the problem of trust, access, and auditability between multiple independent parties."*

---

## Task 8.4 — Database vs. Blockchain Decision Matrix

### Theory

#### The engineering decision tree

How does an architect decide which tool to use? Follow this step-by-step logic path:

```
                  Do you need to store data?
                           ├── No  ──► No Database Needed!
                           └── Yes
                                └── Do multiple parties need to write data?
                                         ├── No  ──► Traditional Database (MySQL/PostgreSQL)
                                         └── Yes
                                              └── Do these writers trust each other?
                                                       ├── Yes ──► Shared Central Database
                                                       └── No
                                                            └── Do you want a central authority?
                                                                     ├── Yes ──► Centralized API / Database
                                                                     └── No  ──► BLOCKCHAIN!
```

If you ever have a situation where all writers trust each other (like employees of the same company), **do not use blockchain**. Use a normal database with user permissions. It is faster, cheaper, and easier to backup.

### 🧪 Practical Task 8.4 — Sort the Architecture

**Type:** Flow Chart Solver

**Setup:**
The user is shown a blank decision tree. They must place the correct evaluation check questions on the decision diamonds.

**Questions to Place:**
-   *Q1: Do multiple parties write?*
-   *Q2: Do writers trust each other?*
-   *Q3: Is a middleman acceptable?*

**User Action:** Align the questions on the flow chart nodes.

**🏁 Flag:** Get all nodes positioned correctly to complete the schema check. (Outputs confirmation code `MATRIX_PASS`).

**Debrief Text:**
> *"Correct. This decision logic prevents over-engineering and keeps project architectures clean and efficient."*

---

## Task 8.5 — Chapter Challenge: Choose Mercury's Technology

### Challenge Task
**Scenario:** "Mercury's launchpad needs final database setups. You must sort the following 8 software scenarios into the correct database models to initialize the Command Module."

**The 8 Scenarios:**
1.  **Instagram Clone** (User photos, social graphs)
2.  **Hospital Patient Records** (Cross-hospital tamper-proof sharing)
3.  **Calculator Program** (Mathematical computations)
4.  **Cross-Border Remittances** (Instant global asset exchange)
5.  **University Attendance Logger** (Internal class records)
6.  **Supply Chain Origin Tracker** (Diamond mine-to-retail ledger)
7.  **Food Delivery App** (Real-time dispatch and menus)
8.  **Digital Art Marketplace** (Provenance and ownership registry)

**User Action:**
Determine the classification for each scenario (type `DB` for traditional database, `BC` for blockchain, or `NONE` for no database needed):
-   Scenario 1: [DB / BC / NONE]
-   Scenario 2: [DB / BC / NONE]
-   Scenario 3: [DB / BC / NONE]
-   Scenario 4: [DB / BC / NONE]
-   Scenario 5: [DB / BC / NONE]
-   Scenario 6: [DB / BC / NONE]
-   Scenario 7: [DB / BC / NONE]
-   Scenario 8: [DB / BC / NONE]

*Classifications:*
1.  Instagram → `DB`
2.  Hospital Records → `BC`
3.  Calculator → `NONE`
4.  Remittances → `BC`
5.  Attendance → `DB`
6.  Supply Chain → `BC`
7.  Food Delivery → `DB`
8.  Digital Art → `BC`

**🏁 Flag:** Enter answers separated by colons → `DB:BC:NONE:BC:DB:BC:DB:BC`

**Completion Animation:**
The 🧑‍🚀 **Command Module** cockpit capsule slides onto the top of the rocket fuselage. A progress bar shows `8/8 modules completed`.

```
=========================================
      🚀 ROCKET ASSEMBLY COMPLETED!
=========================================
      Launch Platform         [OK] ✅
      Fuel Tank               [OK] ✅
      Combustion Chamber      [OK] ✅
      Rocket Engine           [OK] ✅
      Engine Nozzle           [OK] ✅
      Communication System    [OK] ✅
      Navigation System       [OK] ✅
      Command Module          [OK] ✅
=========================================
```

**Module Debrief:**
> *"Congratulations! The Command Module is fully installed and booted. The rocket is complete. You have mastered blockchain fundamentals, use-case selection, and trade-offs. The launchpad is active. Prepare for the Final Escape Room Challenge to launch the rocket and travel to Venus!"*

---
---

## Module 8 Summary

| Task | Title | Type | What the User Does | XP |
|------|-------|------|--------------------|----|
| 8.1 | Immutability & Traceability | Supply Chain Audit | Tracks shipping logs to verify dilithium asset origin | +15 |
| 8.2 | Blockchain Drawbacks | Throughput Calculator | Calculates speed and cost parameters comparing DB vs BC | +20 |
| 8.3 | Real-World Use Cases | Matching Game | Matches industry problem statements to blockchain solutions | +15 |
| 8.4 | Decision Matrix | Flow Chart Solver | Arranges decision diamonds in database architecture tree | +15 |
| 8.5 | Chapter Challenge: Selection | Sorting Matrix | Classifies 8 software scenarios into DB, BC, or None | +20 |

**Total Module 8 XP: +85 XP**
**Rocket Component Earned: 🧑‍🚀 Command Module**

---

# 🎮 Final Mercury Challenge: Blockchain Rescue Mission

**Game Type:** Escape-Room Challenge
**Time Limit:** 15 minutes (Countdown timer visible at top)
**Background Music:** Ambient industrial alarms
**Story:**
*"Mercury's core communications grid has suffered a database corruption attack. The planetary defense systems are going offline. You must run the emergency diagnostics, repair the transaction ledger, trace the hashes, restore consensus, and launch your completed rocket before the station's energy shields collapse!"*

```
                     🚀 MERCURY MISSION CONTROL
┌──────────────────────────────────────────────────────────────┐
│  STATUS: EMERGENCY ALERT          TIMED REMAINING: [ 15:00 ] │
│  SYSTEMS CHECK:                                              │
│  - Central Ledger: ❌ CORRUPTED                              │
│  - Hash Registers: ❌ MISALIGNED                             │
│  - Consensus Node: ❌ OUT OF SYNC                            │
│                                                              │
│  [>>> BEGIN REPAIR PROTOCOL <<<]                            │
└──────────────────────────────────────────────────────────────┘
```

---

## The 10 Challenges Sequence

### Challenge 1: The Centralization Trap
*   **The Puzzle:** You are locked out of the core computer because the centralized validation server crashed. You must identify the weakness of this setup.
*   **Action:** Select the correct vulnerability term.
*   **Answer:** `single point of failure`

### Challenge 2: Audit the Oxygen Air-Lock Logs
*   **The Puzzle:** The air-lock logs contain 4 pending transactions. You must calculate the current balances of Stations A, B, and C to identify if a malicious transaction is draining oxygen.
*   **Starting State:** Station A = 100, Station B = 50, Station C = 10.
*   **Transactions:**
    1.  `A` sends `30` to `B` (Balances: A=70, B=80, C=10)
    2.  `B` sends `40` to `C` (Balances: A=70, B=40, C=50)
    3.  `C` sends `60` to `A` (Balances: A=70, B=40, C=50 - **INVALID!** C only has 50)
*   **Action:** Identify which transaction ID is invalid.
*   **Answer:** `3`

### Challenge 3: Arrange the Block Sequence
*   **The Puzzle:** 4 data blocks are scrambled. You must sort them chronologically using their pointers.
*   *Block Alpha:* Hash `0x1111`, Prev `0x0000` (Genesis)
*   *Block Beta:* Hash `0x3333`, Prev `0x2222`
*   *Block Gamma:* Hash `0x4444`, Prev `0x3333`
*   *Block Delta:* Hash `0x2222`, Prev `0x1111`
*   **Action:** Drag and drop the blocks in order.
*   **Answer:** `Alpha -> Delta -> Beta -> Gamma`

### Challenge 4: Compute the Block Seal Hash
*   **The Puzzle:** To seal the block, you must run the block hash command in the terminal.
*   **Inputs:** `height="4"`, `timestamp="1782200000"`, `prev_hash="0x3333"`, `nonce="12"`
*   **Action:** Run command `sha256("417822000000x333312")` in terminal.
*   **Answer:** (Hash output: `a9b8e2f1`)

### Challenge 5: Find the Tampered Block
*   **The Puzzle:** The network reports a link failure between Block 4 and Block 5. An attacker has altered the history of Block 3, breaking all subsequent hashes.
*   **Action:** Point to the block that was tampered with on the graph.
*   **Answer:** Click **Block 3**.

### Challenge 6: Repair the Pointers
*   **The Puzzle:** You have reverted Block 3's data. Its hash is now back to `0xDDDD`. You must input the correct pointer in Block 4's `prev_hash` field to align the chain.
*   **Action:** Input the hash value.
*   **Answer:** `0xDDDD`

### Challenge 7: Configure Peer Connections
*   **The Puzzle:** Reconnect the P2P communication mesh. You must connect Node 1 to Nodes 2 and 3 to ensure Gossip protocols can propagate transactions.
*   **Action:** Draw links on the grid.
*   **Answer:** Verify connections are active.

### Challenge 8: Restore Consensus Quorum
*   **The Puzzle:** 5 nodes are voting to approve the repair block. 2 nodes are malicious and report fake hashes. You must compute if consensus is reached under BFT rules.
*   **Action:** Select: `Approve` or `Reject`.
*   **Answer:** `Approve` (3 out of 5 honest majority)

### Challenge 9: Choose the Launch Database
*   **The Puzzle:** System asks: "Should the telemetry coordinate storage system (controlled internally by one ground crew server) use a Blockchain or a Traditional Database?"
*   **Action:** Choose: `Blockchain` or `Database`.
*   **Answer:** `Database` (No trust issues, single authority, speed required)

### Challenge 10: Ignite the Core
*   **The Puzzle:** The final ignition key requires the SHA-256 hash of the word `LAUNCH` in all caps.
*   **Action:** Run command `sha256("LAUNCH")` in terminal.
*   **Answer:** (SHA-256 of `LAUNCH` output: `e527a8f1`)

---

## Completion & Launch Sequence

Upon inputting the correct final flag (`e527a8f1`):
1.  Alarms stop. Screen flashes green: `CORE RESTORED. SYSTEM SECURE.`
2.  **Score Calculated:**
    *   Time remaining bonus added to XP.
    *   Score displays (e.g., `Score: 980/1000`).
3.  **Rocket Assembly Animation:** The 3D model of the assembled rocket (from the 8 components) spins up on the screen, venting smoke and igniting booster flares.
4.  **Launch Sequence:**
    *   Screen shakes.
    *   Audio: Voice countdown `3... 2... 1...`
    *   Rocket lifts off, blasting away from Mercury's surface.
5.  **Space Travel Animation:** Visual scroll through a star field, flying past the Sun toward the next target orbit.
6.  **Landing Animation:** Spacecraft lands at the docking station of Venus.
7.  **Status Update:**
    *   `MERCURY COMPLETED`
    *   `🔓 VENUS UNLOCKED: "Cryptography & Wallets"`


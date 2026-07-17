# CosmosX Stellar Build Guide — Part 7: Demo Preparation

**Series:** Part 7 of 7 (final part). Requires Parts 1–6 completed — full wallet-connect-to-mint flow working inside the real Mercury completion screen, with a tested `deploy-testnet.sh` script.

**Part 7 covers:** doing a final clean redeploy exactly the way you would if Testnet reset overnight, funding every account you'll actually use on stage, recording a backup video, a full independent verification pass, and the exact checklists to run through in the days before and the morning of the event.

This part has no new code — it's process, and process is what actually prevents demo-day failure.

---

## Step 1 — Do a completely fresh redeploy, as if Testnet just reset

### Why?
You've practiced this twice now (Part 4 Step 9, Part 6 Step 4) but always in a "testing" mindset. Do it once more, this time treating it exactly like the real scenario: you wake up on demo day, Testnet reset overnight, and you have to get from zero to working in the time before you're on stage.

### Exact steps
1. Time yourself starting now.
2. Run `./scripts/deploy-testnet.sh` from a clean terminal.
3. Copy the new contract ID into CosmosX's `.env.local`.
4. Restart the dev server.
5. Play through the actual Mercury flow (not the dev shortcut from Part 6, Step 5) at least once, ending with a real wallet connect + claim + Stellar Expert verification.
6. Stop the timer.

### Verify
Write your total elapsed time somewhere you'll see it before the event. **If this takes more than 10–15 minutes, look for the slow step and streamline it now** — not during an actual reset scare with an audience waiting.

### Common beginner mistakes
- Only redeploying the contract but reusing an old build of the frontend that still has the previous contract ID baked in from a stale `.env` cache — always restart the dev server (or rebuild, if deploying a built frontend) after updating `.env.local`.

---

## Step 2 — Fund every account you'll actually use on stage

### Why?
Don't discover an unfunded wallet mid-demo.

### Exact steps
Make a short list right now of every Stellar identity that needs to be funded for the demo:
- Your personal demo Freighter wallet (the one you'll actually click "Connect" with on stage)
- `cosmosx-admin` (the deployer identity — needs funding to redeploy if you have to, live, in front of anyone)
- Any secondary "backup" wallet you plan to use if your primary one has an issue

Fund/confirm each one:
```bash
stellar keys fund cosmosx-admin --network testnet
```
For your personal Freighter wallet, use the Friendbot flow from Part 2, Step 4, or Stellar Lab's funding UI.

### Verify
Check every account's balance on Stellar Expert (Testnet) the morning of the demo, not just once, days earlier — balances can change from your own testing in between.

---

## Step 3 — Record a backup video

### Why?
This is your insurance against network failure, a blocked popup, a demo-machine Freighter issue, or Testnet doing something unexpected in front of an audience. A backup video is not "giving up on the live demo" — it's what makes attempting the live demo *safe* to do at all.

### Exact steps
1. Use your OS's built-in screen recorder (QuickTime on macOS, or any simple screen-capture tool) — no need for special software.
2. Record a **complete, real run**: land on the completed Mercury screen → connect wallet → click claim → approve in Freighter → see success state → click through to Stellar Expert and show the real transaction there.
3. Keep it under 60–90 seconds — tight and focused, not a full walkthrough of the whole app.
4. Save it somewhere you can pull up **instantly**, offline if needed — local file, not just a cloud link that depends on the same network that might be failing.

### Verify
Watch it back once. Confirm audio/screen quality is good enough to present to a room.

### Common beginner mistakes
- Recording the backup video against a contract ID that gets redeployed later (Step 1) — **record this backup video *after* your final pre-demo redeploy**, not before, so the video and your live app are showing the same contract if anyone compares.

---

## Step 4 — Full independent verification pass

### Why?
This is your last chance to catch something before an audience does.

### Exact steps — go through every one of these, actually clicking through, not just assuming:
1. Open `stellar.expert`, switch to **Testnet**, search your current (post-Step-1-redeploy) contract ID. Confirm it resolves and shows a deployment transaction.
2. Open **Stellar Lab**'s Contract Explorer, same contract ID, confirm storage shows correctly (your `Admin` key, and any `Achievements` entries from your own testing).
3. From a **second, different browser profile or incognito window** (simulating a judge's own untouched machine), install nothing extra — just confirm your app's UI loads and the "Connect Wallet" button correctly opens the Kit modal.
4. Re-read your README: does it list the contract ID, the network, and a direct Stellar Expert link, in plain text, without requiring anyone to dig through code? (This matters beyond the demo too — recall from earlier planning that SCF's own submission review is self-contained, based only on what's in front of the reviewer.)

### Verify
All four steps above complete without you needing to explain anything verbally to make them make sense — a stranger should be able to follow along from your README alone.

---

## Step 5 — Demo-day checklist (run this the morning of)

- [ ] Re-run `./scripts/deploy-testnet.sh` fresh, one final time, even if nothing seems to have reset — cheap insurance
- [ ] Update `.env.local` with today's contract ID, restart dev server
- [ ] Fund all accounts from Step 2 again — confirm on Stellar Expert
- [ ] Confirm Freighter is installed, unlocked, and set to Testnet on the **actual machine** you'll present from
- [ ] Confirm your backup video is saved locally and instantly reachable, recorded against today's contract
- [ ] Do one full live run-through, start to finish, on the actual presenting machine, on the actual network you'll be presenting on (venue wifi, if possible — not just your home network)
- [ ] Have the Stellar Expert URL for your contract typed/bookmarked in advance — don't search for it live

---

## Step 6 — Recovery checklist (if something breaks *during* the demo)

- [ ] **Stay calm and narrate, don't silently fumble.** "Looks like Testnet's being slow right now — here's a recording of the exact same flow from this morning" is a completely normal, professional thing to say.
- [ ] Switch immediately to the backup video rather than repeatedly retrying a failing live action in front of the audience.
- [ ] If there's time afterward, show the *real* contract on Stellar Expert live anyway (read-only verification is far more reliable than a fresh signed transaction, since it doesn't depend on your wallet popup or the RPC submit path at all) — this alone still proves the work is real, even if the live mint itself didn't cooperate.
- [ ] If Freighter itself is the problem (locked, wrong network, popup blocked), say so plainly and switch to the backup video rather than troubleshooting wallet settings in front of everyone — fix it after, not during.

---

## You're done — what you've actually built

Working backward through all seven parts, you now have:
- A fully configured Rust/Soroban/Stellar CLI development environment (Part 1)
- A funded, Testnet-configured personal wallet, understood at the level of what it actually does and why (Part 2)
- A real grasp of Testnet, Friendbot, RPC vs. Horizon, and why resets matter to your specific timeline (Part 3)
- A deployed, tested, admin-then-player-authorized Soroban contract, with practiced redeploy muscle memory (Part 4)
- A working React integration: wallet connect, balance reads, and a full signed mint transaction with proper loading/error states (Part 5)
- That flow wired into CosmosX's actual existing Mercury completion screen — not a bolted-on separate page (Part 6)
- A rehearsed, insured, verification-backed demo process (Part 7)

This is the full loop described back in the original planning documents: **connect wallet → complete a mission → mint a real, verifiable on-chain achievement.** Everything beyond this — SAC, a second contract, events, Mainnet, the scam-simulation engine, the broader platform architecture — is real, valuable, and explicitly *next*, not part of what you needed to prove today.

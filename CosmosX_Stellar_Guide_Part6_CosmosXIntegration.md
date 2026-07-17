# CosmosX Stellar Build Guide — Part 6: CosmosX Integration

**Series:** Part 6 of 7. Requires Parts 1–5 completed — you should have working wallet-connect, a `mint` call that succeeds end to end, and a deployed contract whose `mint` function checks `to.require_auth()`.

**Part 6 covers:** exactly where in the real CosmosX codebase these new files belong, how to wire the mint flow into the existing Mercury completion screen (not a new screen — the one that already exists), how to script the redeploy process from Part 4 so it's one command, and how to debug the integration end-to-end.

---

## Step 1 — Confirm the exact integration point

### Why?
You don't need a new mission, a new route, or a new UI screen. CosmosX's Mercury flow **already has a completion screen** — in `src/routes/planets/mercury.tsx`, the `task === "completed"` block, which currently shows:
- A trophy icon
- "MERCURY COMPLETE" heading
- Three stat chips: XP Earned, Badge, Next
- Two buttons: "Back to Solar System" and "Enter Venus"

This is exactly where a real, on-chain achievement claim belongs — right after the player has actually finished, when the moment already has emotional weight in the design. Adding it here means **zero new routes, zero new mission logic** — you're augmenting an existing screen.

### What could go wrong if you build a separate screen instead
A standalone "blockchain page" disconnected from the actual learning moment reads as bolted-on — to both players and judges. Integrating into the existing completion moment is both less work and a better product decision.

---

## Step 2 — Add the achievement claim to the completion screen

### Exact steps
Open `src/routes/planets/mercury.tsx`. Find the `task === "completed"` block (search for `MERCURY COMPLETE`).

Add the import at the top of the file, alongside your other component imports:
```tsx
import { WalletConnectButton } from "@/features/achievements/WalletConnectButton";
import { MintButton } from "@/features/achievements/MintButton";
```

Inside the `completed` block, after the three stat chips (`<div className="flex gap-3">...XP Earned, Badge, Next...</div>`) and before the two navigation buttons, insert:
```tsx
<div className="rounded-2xl border border-cyan-400/25 bg-cyan-400/5 px-6 py-5 max-w-sm w-full">
  <p className="font-mono text-[10px] uppercase tracking-wider text-cyan-300/80 mb-3">
    Claim your on-chain proof
  </p>
  <WalletConnectButton />
  <div className="mt-3">
    <MintButton />
  </div>
</div>
```

### What will happen
When a player reaches the existing "MERCURY COMPLETE" screen, they now see a new panel prompting them to connect a wallet and claim their achievement — using the exact components you built and tested in Part 5.

### Verify
1. Play through Mercury Module 1 (or manually jump `task` state to `"completed"` for faster iteration during dev — see Step 5 below for how).
2. Confirm the new panel renders alongside the existing completion UI, doesn't break the existing layout.
3. Run through connect → claim → success, exactly as tested standalone in Part 5, but now from inside the real completion screen.

### Common beginner mistakes
- Import path typos (`@/features/achievements/...`) — confirm your `tsconfig.json`/`vite.config.ts` actually has a `@` alias configured to `src/`; if CosmosX doesn't already use `@/` aliasing, use a relative path (`../../features/achievements/...`) instead — check an existing import in the same file to see which convention is already in use.

---

## Step 3 — Add a persistent "Proof" screen (optional but recommended)

### Why?
The completion screen is transient — a player who claims their achievement and then navigates away has no easy way to re-find their proof. A small, persistent view is worth the extra 20 minutes.

### Exact steps
Create `src/features/achievements/ProofScreen.tsx`:
```tsx
import { ACHIEVEMENT_CONTRACT_ID } from "@/lib/stellar/network";

interface ProofScreenProps {
  address: string | null;
  txHash: string | null;
}

export function ProofScreen({ address, txHash }: ProofScreenProps) {
  if (!address) {
    return <p className="text-sm text-gray-400">Connect your wallet to see your on-chain proof.</p>;
  }

  return (
    <div className="space-y-2 text-sm font-mono">
      <div>
        <span className="text-gray-500">Contract: </span>
        <a
          className="underline text-cyan-400"
          target="_blank"
          rel="noreferrer"
          href={`https://stellar.expert/explorer/testnet/contract/${ACHIEVEMENT_CONTRACT_ID}`}
        >
          {ACHIEVEMENT_CONTRACT_ID.slice(0, 6)}...{ACHIEVEMENT_CONTRACT_ID.slice(-6)}
        </a>
      </div>
      {txHash && (
        <div>
          <span className="text-gray-500">Last claim tx: </span>
          <a
            className="underline text-cyan-400"
            target="_blank"
            rel="noreferrer"
            href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
          >
            {txHash.slice(0, 8)}...
          </a>
        </div>
      )}
    </div>
  );
}
```
Add a small route for it, e.g. `src/routes/proof.tsx` (following whatever file-based routing convention the rest of `src/routes/` already uses), or simply drop `<ProofScreen />` into your existing dashboard route (`src/routes/dashboard.tsx`) — dashboard is the more natural home since it's already a persistent, always-accessible screen.

### Verify
Navigate to the dashboard after claiming an achievement; confirm the contract and last tx links are present and correctly point to Testnet (not Mainnet) Stellar Expert URLs.

---

## Step 4 — Script the redeploy process

### Why?
Part 3 and Part 4 both flagged this: Testnet can reset without warning, and you practiced a manual redeploy once. Now turn that manual sequence into one script, kept in the **contract project** (the separate `cosmosx-stellar` folder from Part 4, not the CosmosX frontend repo).

### Exact steps
In `cosmosx-stellar/scripts/deploy-testnet.sh`:
```bash
#!/usr/bin/env bash
set -euo pipefail

echo "Building contract..."
stellar contract build

echo "Deploying to Testnet..."
CONTRACT_ID=$(stellar contract deploy \
  --wasm target/wasm32v1-none/release/achievement.wasm \
  --source cosmosx-admin \
  --network testnet)

echo "Deployed: $CONTRACT_ID"

echo "Initializing..."
stellar contract invoke \
  --id "$CONTRACT_ID" \
  --source cosmosx-admin \
  --network testnet \
  -- \
  initialize \
  --admin "$(stellar keys address cosmosx-admin)"

echo ""
echo "Done. New contract ID: $CONTRACT_ID"
echo "Update VITE_ACHIEVEMENT_CONTRACT_ID in your CosmosX .env.local to this value."
```
```bash
chmod +x scripts/deploy-testnet.sh
```

### Verify
```bash
./scripts/deploy-testnet.sh
```
Should run end to end, printing a fresh contract ID at the end. Copy that into CosmosX's `.env.local`, restart the dev server, and re-run the full claim flow (Step 2) against the new contract — this is your rehearsal for "Testnet reset the night before demo," and you should be able to do this in well under 5 minutes by now.

### Common beginner mistakes
- Forgetting to update `.env.local` in the *frontend* repo after redeploying — the contract redeployed successfully, but your app is still pointed at the old (now-dead) contract ID. This is the single most common "why did my working demo suddenly break" moment; make updating `.env.local` a fixed, memorized last step of every redeploy.

---

## Step 5 — A dev shortcut for faster iteration

### Why?
Playing through all of Mercury Module 1 every time you want to test the claim screen wastes time.

### Exact steps
Find wherever `mercury.tsx` initializes its `task` state (likely a `useState` near the top of the component, defaulting to `"story"`). Temporarily, during development only, you can seed it differently for faster testing:
```tsx
const [task, setTask] = useState<Module1Task>(
  import.meta.env.DEV ? "completed" : "story"
);
```
This uses Vite's built-in `import.meta.env.DEV` flag so this shortcut **only applies in local development**, never in a production build — no risk of accidentally shipping a "skip the whole game" cheat.

**Remove or double check this before your actual demo rehearsal** — you want to rehearse the real flow at least once, not just the shortcut.

---

## Step 6 — Debugging the integration end-to-end

When something breaks, work through these in order — this is the same order a real debugging session should follow:

1. **Is the wallet actually connected?** Log `address` from `useWallet()` — `null` means the problem is upstream of contract code entirely.
2. **Is the contract ID correct?** Log `ACHIEVEMENT_CONTRACT_ID` from `network.ts` — compare it character-for-character against what your `deploy-testnet.sh` script last printed.
3. **Is Freighter on Testnet?** Re-check the badge in the extension itself — this single check resolves a large fraction of "nothing works" reports.
4. **Does the contract call work outside React entirely?** Re-run the exact CLI `invoke` command from Part 4, Step 7, against the *current* contract ID — if this fails too, the bug is in your contract or deployment, not your frontend, and you've just saved yourself from debugging React code for a non-React problem.
5. **Check the browser console for the raw error**, not just your UI's friendly message — `useMintAchievement`'s `console.error("[mint] failed:", err)` (Part 5) exists exactly for this; the raw SDK error usually names the exact operation and reason.
6. **Check Stellar Expert directly** for the account or contract in question — sometimes the transaction *did* succeed and only your UI's status tracking is wrong; don't assume failure from a stuck spinner alone.

### Common categories of failure and what they usually mean
| Symptom | Likely cause |
|---|---|
| Modal opens, but selecting Freighter does nothing | Extension not installed, or installed but locked (needs its own password re-entered) |
| Connects fine, `mint()` throws immediately | Wrong network (Freighter on Mainnet, app configured for Testnet) or empty `ACHIEVEMENT_CONTRACT_ID` |
| Signing popup never appears | Popup blocked by browser — check for a blocked-popup icon in the address bar |
| Signs successfully, then errors on submit | Stale contract ID from before a redeploy — re-check `.env.local` |
| Everything seems to work, but `has_achievement` still returns false | You minted to a *different* address than the one you're checking — common if you have multiple Freighter accounts/identities and lost track of which is active |

---

## Part 6 checklist

- [ ] Wallet connect + mint claim UI added directly into the existing Mercury `completed` screen (not a separate new page)
- [ ] Optional persistent Proof screen added to the dashboard
- [ ] `deploy-testnet.sh` script exists in the contract project, tested end-to-end
- [ ] `.env.local` update step is a memorized, automatic part of every redeploy
- [ ] Dev-only shortcut for reaching the completion screen added and confirmed gated behind `import.meta.env.DEV`
- [ ] Full debugging pass completed once deliberately (unplug wifi mid-mint, close the Freighter popup without approving, etc.) so you know what each failure actually looks like before demo day

**Next:** Part 7 — final demo preparation: a fresh contract redeploy, funding your demo accounts, recording a backup video, a full verification pass, and the exact checklists to run through the morning of the event.

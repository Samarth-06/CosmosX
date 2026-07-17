# CosmosX Stellar Build Guide — Part 5: Frontend Integration

**Series:** Part 5 of 7. Requires Parts 1–4 completed (you should have a funded Freighter wallet and a deployed, working Achievement contract with a saved contract ID).

**Part 5 covers:** installing the right npm packages into the CosmosX repo, configuring the Stellar Wallets Kit, building a `useWallet` hook, connecting/disconnecting in the UI, reading balances, calling your deployed contract's `mint` function from a button click, and handling errors/loading states/explorer links properly.

**This part works inside your actual CosmosX repo** (`cosmos-x-demo-section-work`), unlike Part 4 which used a separate folder.

---

## Step 1 — Install the required packages

### Why?
Two packages do all the work: `@stellar/stellar-sdk` (talks to the network, builds transactions, and — via its `contract` module — gives you a dynamic typed client for any deployed contract) and `@creit.tech/stellar-wallets-kit` (the unified wallet-connect UI/API from Part 2's concepts, now in code form).

### What could go wrong
- Installing the old, deprecated `stellar-sdk` (no `@stellar/` scope) instead of the current package — always double check the scope.

### Exact steps
From the CosmosX repo root:
```bash
cd cosmos-x-demo-section-work
npm install @stellar/stellar-sdk @creit.tech/stellar-wallets-kit
```
(Substitute `pnpm add` / `yarn add` if that's what the repo already uses — check Part 1, Step 6.)

### Verify
```bash
cat package.json | grep stellar
```
**Expected output:** both packages listed under `dependencies`.

---

## Step 2 — Create the environment file

### Why?
You never want to hardcode network URLs or your contract ID directly in component code — Part 3 already flagged this as the fix for Testnet-reset pain.

### Exact steps
Create `.env.testnet.example` at the repo root (committed, no secrets):
```
VITE_STELLAR_NETWORK=TESTNET
VITE_STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
VITE_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
VITE_ACHIEVEMENT_CONTRACT_ID=
```
Then copy it to a real, gitignored file and fill in your actual contract ID from Part 4:
```bash
cp .env.testnet.example .env.local
```
Edit `.env.local` and paste your contract ID (`CABC...`) from Part 4, Step 6.

Confirm `.env.local` is in `.gitignore`:
```bash
grep -q "^.env.local$" .gitignore || echo ".env.local" >> .gitignore
```

### Verify
Restart your Vite dev server after adding new env vars — Vite only reads `.env*` files at startup, so a running dev server won't pick up new variables until restarted.

### Common beginner mistakes
- Forgetting the `VITE_` prefix — Vite only exposes env vars to client code if they start with `VITE_`; anything else is silently invisible to `import.meta.env`.
- Editing `.env.testnet.example` with your real contract ID and accidentally committing it — keep the real values only in the gitignored `.env.local`.

---

## Step 3 — Create the `lib/stellar/` folder

### Why?
This is the single seam (from the architecture doc) that keeps Stellar-specific code out of your mission components.

### Exact steps
```bash
mkdir -p src/lib/stellar
```

Create `src/lib/stellar/network.ts`:
```typescript
export const STELLAR_NETWORK_PASSPHRASE = import.meta.env.VITE_STELLAR_NETWORK_PASSPHRASE as string;
export const STELLAR_RPC_URL = import.meta.env.VITE_STELLAR_RPC_URL as string;
export const ACHIEVEMENT_CONTRACT_ID = import.meta.env.VITE_ACHIEVEMENT_CONTRACT_ID as string;

if (!ACHIEVEMENT_CONTRACT_ID) {
  console.warn(
    "[stellar] VITE_ACHIEVEMENT_CONTRACT_ID is not set — mint calls will fail. Check .env.local."
  );
}
```

### Verify
Import it anywhere temporarily (`console.log(ACHIEVEMENT_CONTRACT_ID)`) and confirm your real contract ID prints, not `undefined`.

---

## Step 4 — Configure the Stellar Wallets Kit

### Why?
This is the one place your app configures *which* wallets it supports and *which* network it's talking to — every other file just imports this instance.

### Exact steps
Create `src/lib/stellar/walletKit.ts`:
```typescript
import {
  StellarWalletsKit,
  WalletNetwork,
  FREIGHTER_ID,
  FreighterModule,
  xBullModule,
} from "@creit.tech/stellar-wallets-kit";

export const walletKit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: FREIGHTER_ID,
  modules: [new FreighterModule(), new xBullModule()],
});
```

### What each part does
- `WalletNetwork.TESTNET` — this is a Kit-level enum matching your `.env` network passphrase; it tells the Kit which network's wallet state to request. **This is the one line you'd change to `WalletNetwork.PUBLIC` for a future Mainnet version** — everything else stays the same.
- `modules: [...]` — the list of wallets the connect modal will offer. Freighter first (it's what you and most judges will have); xBull as a second option costs nothing to include.
- `selectedWalletId: FREIGHTER_ID` — a sane default before the user has picked anything.

### Verify
No visible output yet — this is just configuration. It'll be exercised in the next step.

---

## Step 5 — Build the `useWallet` hook

### Why?
Every component that needs "is a wallet connected, and what's its address" should use one hook, not reimplement Kit calls themselves.

### Exact steps
Create `src/features/achievements/useWallet.ts`:
```typescript
import { useState, useCallback } from "react";
import { walletKit } from "@/lib/stellar/walletKit";
import type { ISupportedWallet } from "@creit.tech/stellar-wallets-kit";

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setError(null);
    setConnecting(true);
    try {
      await walletKit.openModal({
        onWalletSelected: async (option: ISupportedWallet) => {
          walletKit.setWallet(option.id);
          const { address } = await walletKit.getAddress();
          setAddress(address);
        },
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to connect wallet."
      );
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setError(null);
  }, []);

  return { address, connecting, error, connect, disconnect };
}
```

### What could go wrong, and what it looks like
- **Freighter not installed:** the modal will still open (it lists all configured wallets), but selecting Freighter without the extension installed will fail inside `getAddress()` — this lands in your `catch` block; message the user clearly rather than showing a raw stack trace.
- **User closes the modal without picking a wallet:** `openModal` simply resolves without calling `onWalletSelected` — `address` stays `null`, no error is thrown. Don't treat this as an error state in your UI.

### Verify
This hook alone doesn't render anything — verified together with Step 6.

---

## Step 6 — Build the Connect/Disconnect UI

### Exact steps
Create `src/features/achievements/WalletConnectButton.tsx`:
```tsx
import { useWallet } from "./useWallet";

function shorten(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function WalletConnectButton() {
  const { address, connecting, error, connect, disconnect } = useWallet();

  if (address) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono">{shorten(address)}</span>
        <button onClick={disconnect} className="text-sm underline">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={connect}
        disabled={connecting}
        className="rounded bg-cyan-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
      >
        {connecting ? "Connecting..." : "Connect Wallet"}
      </button>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}
```

Drop `<WalletConnectButton />` somewhere visible in your app shell/nav for now — exact placement inside CosmosX's structure is finalized in Part 6.

### What will happen
Clicking "Connect Wallet" opens the Kit's modal, listing Freighter (and xBull). Selecting Freighter triggers the browser extension's own popup asking you to approve the connection. Approve it, and the button switches to showing your shortened address.

### Verify
1. Run your dev server (`npm run dev`).
2. Click Connect Wallet, select Freighter, approve in the extension popup.
3. Confirm the button now shows your address in `Gxxx...xxxx` shortened form.
4. Click Disconnect — button reverts to "Connect Wallet."

### Common beginner mistakes
- Testing with Freighter set to **Mainnet** instead of Testnet (Part 2, Step 3) — the connect flow will still "work" but every downstream contract call will fail confusingly. Always glance at Freighter's network badge before debugging anything else.

---

## Step 7 — Read the connected account's balance

### Why?
A useful sanity check, and something players will want to see (proof they're funded before attempting a mint).

### Exact steps
Add to `src/lib/stellar/network.ts`:
```typescript
import { rpc } from "@stellar/stellar-sdk";

export const server = new rpc.Server(STELLAR_RPC_URL);

export async function getXlmBalance(address: string): Promise<string> {
  const account = await server.getAccount(address);
  // Native XLM balance lives in the account's sequence-adjacent ledger entry;
  // the simplest reliable read is via getAccount's balances helper below.
  return account.balances?.find((b) => b.asset_type === "native")?.balance ?? "0";
}
```
> Note: exact balance-reading helper shape can vary slightly between SDK versions — if `account.balances` isn't present on the type your installed version returns, use `server.getAccountEntry(address)` instead per the current JS SDK docs, and adapt accordingly; the concept (ask RPC for the account, read its native balance) stays the same.

### Verify
Call `getXlmBalance(address)` after connecting and log it — should print a number close to `10000` (Friendbot's standard funding amount, minus any fees you've spent testing in Part 4).

---

## Step 8 — Call your deployed contract's `mint` function

### Why?
This is the actual feature — everything above was plumbing.

### Two ways to do this — pick one
**Option A (recommended for this guide): dynamic runtime client.** Use `@stellar/stellar-sdk`'s built-in `contract.Client.from(...)`, which fetches your contract's interface directly from the network at runtime — no separate generated npm package to build/maintain. Simpler for a single-contract Testnet slice.

**Option B (official CLI-generated bindings):** run `stellar contract bindings typescript --network testnet --contract-id <id> --output-dir packages/achievement --overwrite`, then `cd packages/achievement && npm install && npm run build`, and import the generated `Client` class. This is more "typed," but adds a second local package to keep in sync every time you redeploy (relevant given Part 3/4's redeploy reality) — worth it for a larger project, unnecessary overhead for this one.

**This guide uses Option A.**

### Exact steps
Create `src/features/achievements/useMintAchievement.ts`:
```typescript
import { useState, useCallback } from "react";
import { contract } from "@stellar/stellar-sdk";
import { walletKit } from "@/lib/stellar/walletKit";
import {
  STELLAR_NETWORK_PASSPHRASE,
  STELLAR_RPC_URL,
  ACHIEVEMENT_CONTRACT_ID,
} from "@/lib/stellar/network";

type MintStatus = "idle" | "building" | "signing" | "submitting" | "success" | "error";

export function useMintAchievement() {
  const [status, setStatus] = useState<MintStatus>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mint = useCallback(async (playerAddress: string) => {
    setError(null);
    try {
      setStatus("building");

      const client = await contract.Client.from({
        contractId: ACHIEVEMENT_CONTRACT_ID,
        networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
        rpcUrl: STELLAR_RPC_URL,
        // NOTE: our mint() requires the ADMIN's auth, not the player's.
        // For this Testnet slice, minting is triggered by the connected
        // wallet acting as admin (see the "important limitation" note below).
      });

      const tx = await client.mint({ to: playerAddress });

      setStatus("signing");
      const signed = await tx.signAuthEntries({
        address: playerAddress,
        signAuthEntry: async (authEntryXdr: string) => {
          const { signedAuthEntry } = await walletKit.signAuthEntry(authEntryXdr, {
            address: playerAddress,
          });
          return signedAuthEntry;
        },
      });

      setStatus("submitting");
      const sent = await signed.signAndSend({
        signTransaction: async (xdr: string) => {
          const { signedTxXdr } = await walletKit.signTransaction(xdr, {
            address: playerAddress,
            networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
          });
          return { signedTxXdr };
        },
      });

      setTxHash(sent.sendTransactionResponse?.hash ?? null);
      setStatus("success");
    } catch (err) {
      console.error("[mint] failed:", err);
      setError(err instanceof Error ? err.message : "Mint failed.");
      setStatus("error");
    }
  }, []);

  return { mint, status, txHash, error };
}
```

### Important limitation to understand, not skip past
Our `mint()` function (Part 4) requires the **admin's** authorization, not the player's — that's correct for a contract you fully control, but it means a *player's own wallet* signing this transaction isn't actually authorized to call `mint` for themselves. For this guide's scope, the practical options are:
1. **Simplest for the demo:** the "Claim Achievement" button actually calls a small backend/serverless function (or, for the workshop, you personally holding the admin key and triggering it) that signs with the `cosmosx-admin` identity from Part 4 — the player doesn't sign the mint at all, they just trigger it.
2. **More "real," more work:** change the contract so a player can mint *for themselves* (`to.require_auth()` instead of `admin.require_auth()`), accepting that anyone can mint themselves an achievement (fine for a proof-of-concept; not fine for a production points economy).

**Recommendation for your Testnet slice:** go with **Option 2** — change `admin.require_auth()` to `to.require_auth()` in your contract's `mint` function, rebuild, redeploy (you practiced this in Part 4, Step 9), and now the code above works exactly as written, with the *player's own wallet* signing their own mint. This is the more demo-credible version: the player visibly approves their own achievement in their own wallet popup, which is a better demo moment than an invisible backend call.

### Verify
1. Connect wallet (Step 6).
2. Call `mint(address)` from a test button.
3. Approve the resulting signature popup in Freighter.
4. `status` should progress `building → signing → submitting → success`.
5. Cross-check the resulting `txHash` on Stellar Expert.

### Common beginner mistakes
- Forgetting to change `admin.require_auth()` to `to.require_auth()` in the contract (per the note above) and then being confused why the player's own signature isn't accepted — go back to Part 4, make this one-line contract change, and redeploy.
- Not handling the `error` status in the UI at all — a demo that hangs silently on `signing` forever (because the user closed the Freighter popup without approving) looks broken; always show *some* UI reaction, even just "cancelled, try again."

---

## Step 9 — Build the loading/error/success UI

### Exact steps
Create `src/features/achievements/MintButton.tsx`:
```tsx
import { useWallet } from "./useWallet";
import { useMintAchievement } from "./useMintAchievement";

export function MintButton() {
  const { address } = useWallet();
  const { mint, status, txHash, error } = useMintAchievement();

  if (!address) {
    return <p className="text-sm text-gray-400">Connect your wallet to claim your achievement.</p>;
  }

  return (
    <div>
      <button
        onClick={() => mint(address)}
        disabled={status === "building" || status === "signing" || status === "submitting"}
        className="rounded bg-emerald-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
      >
        {status === "idle" && "Claim Achievement"}
        {status === "building" && "Preparing transaction..."}
        {status === "signing" && "Waiting for your approval in Freighter..."}
        {status === "submitting" && "Submitting to Testnet..."}
        {status === "success" && "Claimed!"}
        {status === "error" && "Try again"}
      </button>

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

      {status === "success" && txHash && (
        <a
          href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
          target="_blank"
          rel="noreferrer"
          className="mt-2 block text-sm underline text-cyan-400"
        >
          View on Stellar Expert →
        </a>
      )}
    </div>
  );
}
```

### Verify
Full click-through: idle → click → each status text appears in order → success state shows a working Stellar Expert link → clicking it opens the actual transaction on the actual explorer.

### What could go wrong
- The explorer link 404s because you're pointing at `/testnet/` in the URL but tested against Mainnet, or vice versa — the URL path segment (`testnet` vs `public`) must match whatever network you actually submitted to.

---

## Part 5 checklist

- [ ] `@stellar/stellar-sdk` and `@creit.tech/stellar-wallets-kit` installed
- [ ] `.env.local` created with real contract ID, `.env.testnet.example` committed without secrets
- [ ] `walletKit.ts` configured for Testnet
- [ ] `useWallet` hook: connect, disconnect, error state all working
- [ ] Balance read confirmed against a real connected account
- [ ] Contract's `mint` changed to `to.require_auth()` and redeployed (if you hadn't already)
- [ ] `useMintAchievement` hook: full status progression works, verified against Stellar Expert
- [ ] `MintButton` shows correct UI for every status including error

**Next:** Part 6 — exactly where these files live inside the real CosmosX repo structure, how they connect to your existing mission-completion logic, and how to test/debug the whole integration end-to-end.

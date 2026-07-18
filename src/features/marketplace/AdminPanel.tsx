/**
 * Marketplace Administrator panel — visible only when the connected wallet
 * matches contract get_admin() (Foundation / deployer). No second permission
 * system: admin is whatever address initialized the marketplace contract.
 *
 * Capabilities wired from the existing contract:
 *   register_asset, mint_to, list, delist
 *
 * Developer utilities (admin-only, testnet/dev workflows):
 *   resetTestnetProgress — clears all app-owned localStorage progress
 *   batchMintAll         — mints every registered-but-unminted planet sequentially
 *
 * Not available on-chain (documented in UI):
 *   burn — contract has no burn() method
 */

import { useState, useRef } from "react";
import {
  Shield,
  Coins,
  Database,
  Activity,
  RotateCcw,
  Zap,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { EXOPLANETS_DATA } from "@/lib/exoplanets-data";
import {
  MARKETPLACE_CONTRACT_ID,
  MARKETPLACE_TOKEN_ID,
  contractRegisterAsset,
  contractMintTo,
  contractList,
  contractDelist,
} from "@/lib/stellar/marketplace-contract";
import {
  STELLAR_NETWORK,
  STELLAR_RPC_URL,
  explorerContractUrl,
  explorerTxUrl,
} from "@/lib/stellar/network";
import { toast } from "sonner";

// ── All localStorage keys owned by CosmosX ────────────────────────────────────
// Keep this in sync with: module1-store.ts, user-store.ts, marketplace-store.ts,
// proof-store.ts, useWallet.ts, PlanetRoom.tsx
const PROGRESS_KEYS: string[] = [
  // User XP, streak, badges, planet progress
  "cosmosx_user_state_v1",
  // Marketplace local cache
  "cosmosx_marketplace_state_v1",
  // On-chain achievement proof cache
  "cosmosx-achievement-proof",
  // Mercury curriculum progress
  "cosmos-x-mercury-step",
  "cosmos-x-mercury-completed",
  "cosmos-x-task-scores",
  "cosmos-x-verified-modules",
  // Per-planet task completions (dynamic key per planet ID)
  ...EXOPLANETS_DATA.map((p) => `cosmosx-completed-${p.id}`),
];

// cosmosx-wallet-address is intentionally excluded: clearing it disconnects the
// wallet, which would lock the admin out of the panel immediately.

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Clears every app-owned progress key from localStorage. Returns count cleared. */
function clearProgressKeys(): number {
  let cleared = 0;
  for (const key of PROGRESS_KEYS) {
    if (localStorage.getItem(key) !== null) {
      localStorage.removeItem(key);
      cleared++;
    }
  }
  return cleared;
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface AdminPanelProps {
  walletAddress: string;
  adminAddress: string | null;
  registeredIds: string[];
  mintedIds: string[];
  ownedPlanets: string[];
  listings: { planetId: string; price: number; seller: string }[];
  owners: Record<string, string>;
  syncedAt: number | null;
  chainStatus: string;
  txPending: boolean;
  onBusy: (busy: boolean) => void;
  onRefresh: () => Promise<void>;
}

// ── Batch mint state ───────────────────────────────────────────────────────────

interface MintJob {
  id: string;
  status: "pending" | "minting" | "ok" | "err";
  txHash?: string;
  error?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminPanel({
  walletAddress,
  adminAddress,
  registeredIds,
  mintedIds,
  ownedPlanets,
  listings,
  owners,
  syncedAt,
  chainStatus,
  txPending,
  onBusy,
  onRefresh,
}: AdminPanelProps) {
  // ── Register asset form ─────────────────────────────────────────────────────
  const [regId, setRegId] = useState("");
  const [regName, setRegName] = useState("");
  const [regRarity, setRegRarity] = useState<
    "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary"
  >("Common");
  const [regUri, setRegUri] = useState("https://cosmosx.app/assets/");
  const [regSupply, setRegSupply] = useState("1");

  // ── Single mint form ────────────────────────────────────────────────────────
  const [mintId, setMintId] = useState("");
  const [mintTo, setMintTo] = useState("");

  // ── Marketplace management ──────────────────────────────────────────────────
  const [listId, setListId] = useState("");
  const [listPrice, setListPrice] = useState("");

  // ── Reset confirmation ──────────────────────────────────────────────────────
  const [resetConfirm, setResetConfirm] = useState(false);

  // ── Batch mint state ────────────────────────────────────────────────────────
  const [batchDest, setBatchDest] = useState(walletAddress);
  const [batchJobs, setBatchJobs] = useState<MintJob[]>([]);
  const [batchRunning, setBatchRunning] = useState(false);
  const batchAbort = useRef(false);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const unmintedRegistered = registeredIds.filter((id) => !mintedIds.includes(id));
  const adminOwned = ownedPlanets.filter((id) => owners[id] === walletAddress);

  // ── Generic admin action wrapper ────────────────────────────────────────────
  async function runAdmin(
    label: string,
    fn: () => Promise<{ success: boolean; txHash?: string; error?: string }>,
  ) {
    if (txPending) {
      toast.info("A transaction is already in progress.");
      return;
    }
    onBusy(true);
    try {
      const result = await fn();
      if (!result.success) {
        toast.error(result.error ?? `${label} failed.`);
        return;
      }
      if (result.txHash) {
        toast.success(`${label} succeeded`, {
          description: (
            <a
              href={explorerTxUrl(result.txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-indigo-400"
            >
              View on Stellar Expert ↗
            </a>
          ),
        });
      } else {
        toast.success(`${label} succeeded`);
      }
      await onRefresh();
    } finally {
      onBusy(false);
    }
  }

  // ── Reset handler ───────────────────────────────────────────────────────────
  function handleReset() {
    const cleared = clearProgressKeys();
    setResetConfirm(false);
    toast.success(`Testnet progress reset — ${cleared} key${cleared !== 1 ? "s" : ""} cleared`, {
      description: "Reload the page to see fresh state across the UI.",
      duration: 6000,
    });
  }

  // ── Batch mint handler ──────────────────────────────────────────────────────
  async function startBatchMint() {
    if (unmintedRegistered.length === 0) {
      toast.info("No registered-and-unminted assets to process.");
      return;
    }
    const dest = batchDest.trim();
    if (!dest || dest.length < 15) {
      toast.error("Enter a valid destination G-address first.");
      return;
    }

    const jobs: MintJob[] = unmintedRegistered.map((id) => ({
      id,
      status: "pending",
    }));
    setBatchJobs(jobs);
    setBatchRunning(true);
    batchAbort.current = false;
    onBusy(true);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < jobs.length; i++) {
      if (batchAbort.current) break;

      const job = jobs[i];

      // Mark current as minting
      setBatchJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: "minting" } : j)),
      );

      try {
        const result = await contractMintTo(job.id, dest, walletAddress);
        if (result.success) {
          successCount++;
          setBatchJobs((prev) =>
            prev.map((j) =>
              j.id === job.id ? { ...j, status: "ok", txHash: result.txHash } : j,
            ),
          );
        } else {
          failCount++;
          setBatchJobs((prev) =>
            prev.map((j) =>
              j.id === job.id
                ? { ...j, status: "err", error: result.error ?? "Unknown error" }
                : j,
            ),
          );
        }
      } catch (err) {
        failCount++;
        setBatchJobs((prev) =>
          prev.map((j) =>
            j.id === job.id
              ? {
                  ...j,
                  status: "err",
                  error: err instanceof Error ? err.message : String(err),
                }
              : j,
          ),
        );
      }
    }

    setBatchRunning(false);
    onBusy(false);
    await onRefresh();

    if (failCount === 0) {
      toast.success(`Batch mint complete — ${successCount} asset${successCount !== 1 ? "s" : ""} minted`);
    } else {
      toast.warning(
        `Batch mint finished — ${successCount} succeeded, ${failCount} failed`,
        { description: "Check the progress table for per-asset details." },
      );
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="border-b border-amber-500/20 pb-3">
        <h4 className="font-display text-sm font-bold text-amber-300 flex items-center gap-1.5">
          <Shield className="h-4 w-4" /> Administrator Console
        </h4>
        <p className="font-mono text-[10px] text-muted-foreground mt-1">
          Visible only for the marketplace <code className="text-amber-200/80">get_admin()</code> wallet
          (Foundation / deployer). No separate permission system.
        </p>
      </div>

      {/* Diagnostics */}
      <div className="rounded-2xl border border-white/8 bg-slate-950/50 p-4 space-y-3">
        <h5 className="font-mono text-[10px] uppercase text-indigo-300 font-bold flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5" /> Diagnostics
        </h5>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[9px]">
          <Diag label="Contract ID" value={MARKETPLACE_CONTRACT_ID || "—"} link={MARKETPLACE_CONTRACT_ID ? explorerContractUrl(MARKETPLACE_CONTRACT_ID) : undefined} />
          <Diag label="XLM SAC" value={MARKETPLACE_TOKEN_ID || "—"} />
          <Diag label="Network" value={STELLAR_NETWORK || "TESTNET"} />
          <Diag label="RPC" value={STELLAR_RPC_URL || "—"} />
          <Diag label="Connected wallet" value={walletAddress} />
          <Diag label="Admin wallet" value={adminAddress ?? "—"} />
          <Diag label="Wallet role" value="Administrator" />
          <Diag label="Chain status" value={chainStatus} />
          <Diag
            label="Last sync"
            value={syncedAt ? new Date(syncedAt).toLocaleString() : "—"}
          />
          <Diag label="Registered" value={String(registeredIds.length)} />
          <Diag label="Minted" value={String(mintedIds.length)} />
          <Diag label="Active listings" value={String(listings.length)} />
        </dl>
      </div>

      {/* Asset management */}
      <div className="rounded-2xl border border-white/8 bg-slate-950/50 p-4 space-y-4">
        <h5 className="font-mono text-[10px] uppercase text-emerald-300 font-bold flex items-center gap-1.5">
          <Database className="h-3.5 w-3.5" /> Asset Management
        </h5>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Register */}
          <div className="space-y-2 border border-white/5 rounded-xl p-3">
            <span className="font-mono text-[10px] text-white font-bold">Register asset</span>
            <input
              className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white font-mono"
              placeholder="asset_id (e.g. new_planet_1)"
              value={regId}
              onChange={(e) => setRegId(e.target.value.trim())}
            />
            <input
              className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white font-mono"
              placeholder="Display name"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
            />
            <select
              className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white font-mono"
              value={regRarity}
              onChange={(e) => setRegRarity(e.target.value as typeof regRarity)}
            >
              {(["Common", "Uncommon", "Rare", "Epic", "Legendary"] as const).map((r) => (
                <option key={r} value={r} className="bg-slate-900">
                  {r}
                </option>
              ))}
            </select>
            <input
              className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white font-mono"
              placeholder="Metadata URI"
              value={regUri}
              onChange={(e) => setRegUri(e.target.value)}
            />
            <input
              className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white font-mono"
              placeholder="Max supply"
              value={regSupply}
              onChange={(e) => setRegSupply(e.target.value)}
            />
            <button
              disabled={txPending || !regId || !regName}
              onClick={() =>
                void runAdmin("Register asset", () =>
                  contractRegisterAsset(
                    regId,
                    {
                      name: regName,
                      asset_type: "Exoplanet",
                      rarity: regRarity,
                      uri: regUri || `https://cosmosx.app/assets/${regId}.json`,
                      max_supply: Math.max(1, parseInt(regSupply, 10) || 1),
                    },
                    walletAddress,
                  ),
                )
              }
              className="w-full rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 py-2 text-[10px] font-bold disabled:opacity-40"
            >
              Register on-chain
            </button>
          </div>

          {/* Single mint */}
          <div className="space-y-2 border border-white/5 rounded-xl p-3">
            <span className="font-mono text-[10px] text-white font-bold">Mint to address</span>
            <select
              className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white font-mono"
              value={mintId}
              onChange={(e) => setMintId(e.target.value)}
            >
              <option value="" className="bg-slate-900">
                Select registered unminted asset…
              </option>
              {unmintedRegistered.map((id) => (
                <option key={id} value={id} className="bg-slate-900">
                  {id}
                </option>
              ))}
              {EXOPLANETS_DATA.filter((p) => !mintedIds.includes(p.id)).map((p) =>
                unmintedRegistered.includes(p.id) ? null : (
                  <option key={`cat-${p.id}`} value={p.id} className="bg-slate-900">
                    {p.id} (catalog)
                  </option>
                ),
              )}
            </select>
            <input
              className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white font-mono"
              placeholder="Recipient G-address"
              value={mintTo}
              onChange={(e) => setMintTo(e.target.value.trim())}
            />
            <button
              disabled={txPending || !mintId || mintTo.length < 15}
              onClick={() =>
                void runAdmin("Mint asset", () =>
                  contractMintTo(mintId, mintTo, walletAddress),
                )
              }
              className="w-full rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 py-2 text-[10px] font-bold disabled:opacity-40"
            >
              Mint to address
            </button>
            <button
              disabled={txPending || !mintId}
              onClick={() => {
                setMintTo(walletAddress);
                void runAdmin("Mint to self", () =>
                  contractMintTo(mintId, walletAddress, walletAddress),
                );
              }}
              className="w-full rounded-lg bg-white/5 border border-white/10 text-white/80 py-2 text-[10px] font-bold disabled:opacity-40"
            >
              Mint to admin wallet
            </button>
            <p className="font-mono text-[8px] text-amber-400/90 leading-relaxed">
              Burn: not available — the marketplace contract has no <code>burn()</code> method.
              Do not invent burn client calls.
            </p>
          </div>
        </div>

        {/* Registered / minted lists */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[9px]">
          <div className="border border-white/5 rounded-xl p-3 max-h-40 overflow-y-auto">
            <span className="text-muted-foreground uppercase block mb-1">Registered</span>
            {registeredIds.length === 0 ? (
              <span className="text-muted-foreground">None detected</span>
            ) : (
              registeredIds.map((id) => (
                <div key={id} className="text-white/85 py-0.5 border-b border-white/5 last:border-0">
                  {id}
                  {mintedIds.includes(id) ? (
                    <span className="text-emerald-400 ml-2">minted</span>
                  ) : (
                    <span className="text-amber-400 ml-2">unminted</span>
                  )}
                </div>
              ))
            )}
          </div>
          <div className="border border-white/5 rounded-xl p-3 max-h-40 overflow-y-auto">
            <span className="text-muted-foreground uppercase block mb-1">Minted owners</span>
            {mintedIds.length === 0 ? (
              <span className="text-muted-foreground">None</span>
            ) : (
              mintedIds.map((id) => (
                <div key={id} className="text-white/85 py-0.5 border-b border-white/5 last:border-0">
                  {id} → {(owners[id] ?? "—").slice(0, 8)}…
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Marketplace management */}
      <div className="rounded-2xl border border-white/8 bg-slate-950/50 p-4 space-y-3">
        <h5 className="font-mono text-[10px] uppercase text-amber-300 font-bold flex items-center gap-1.5">
          <Coins className="h-3.5 w-3.5" /> Marketplace Management
        </h5>
        <p className="font-mono text-[9px] text-muted-foreground">
          List / delist / update price for assets you currently own as admin ({adminOwned.length} owned).
        </p>
        <div className="flex flex-wrap gap-2">
          <select
            className="flex-1 min-w-[140px] bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white font-mono"
            value={listId}
            onChange={(e) => setListId(e.target.value)}
          >
            <option value="" className="bg-slate-900">
              Admin-owned asset…
            </option>
            {adminOwned.map((id) => (
              <option key={id} value={id} className="bg-slate-900">
                {id}
                {listings.some((l) => l.planetId === id) ? " (listed)" : ""}
              </option>
            ))}
          </select>
          <input
            className="w-28 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white font-mono"
            placeholder="Price XLM"
            value={listPrice}
            onChange={(e) => setListPrice(e.target.value)}
          />
          <button
            disabled={txPending || !listId || !(parseFloat(listPrice) > 0)}
            onClick={() =>
              void runAdmin("List / update price", () =>
                contractList(listId, parseFloat(listPrice), walletAddress),
              )
            }
            className="rounded-lg bg-amber-400/20 border border-amber-400/30 text-amber-200 px-3 py-1.5 text-[10px] font-bold disabled:opacity-40"
          >
            List / Update
          </button>
          <button
            disabled={txPending || !listId || !listings.some((l) => l.planetId === listId)}
            onClick={() =>
              void runAdmin("Delist", () => contractDelist(listId, walletAddress))
            }
            className="rounded-lg bg-red-500/15 border border-red-500/25 text-red-300 px-3 py-1.5 text-[10px] font-bold disabled:opacity-40"
          >
            Delist
          </button>
        </div>
      </div>

      {/* ── Developer Tools ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/8 bg-slate-950/50 p-4 space-y-5">
        <h5 className="font-mono text-[10px] uppercase text-rose-300 font-bold flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5" /> Developer Tools
          <span className="ml-1 px-1.5 py-0.5 rounded text-[8px] bg-rose-500/15 border border-rose-500/25 text-rose-400">
            Testnet / Dev only
          </span>
        </h5>

        {/* ── 1. Reset Testnet Progress ──────────────────────────────────────── */}
        <div className="border border-white/5 rounded-xl p-3 space-y-2">
          <div className="flex items-start gap-2">
            <RotateCcw className="h-3.5 w-3.5 text-rose-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-mono text-[10px] text-white font-bold block">
                Reset Testnet Progress
              </span>
              <p className="font-mono text-[9px] text-muted-foreground leading-relaxed">
                Clears all app-owned localStorage keys: chapter progress, mission scores,
                task completions, dashboard caches, achievement proof, and marketplace state.
                Wallet connection is preserved. Blockchain history is immutable and unaffected.
              </p>
            </div>
          </div>

          <div className="font-mono text-[8px] text-slate-500 leading-relaxed bg-white/[0.02] rounded-lg px-2 py-1.5 border border-white/5">
            Keys cleared:{" "}
            {PROGRESS_KEYS.slice(0, 8)
              .map((k) => <code key={k} className="text-slate-400">{k}</code>)
              .reduce<React.ReactNode[]>((acc, el, i) => (i === 0 ? [el] : [...acc, ", ", el]), [])}
            {PROGRESS_KEYS.length > 8 && (
              <span className="text-slate-500"> + {PROGRESS_KEYS.length - 8} planet keys</span>
            )}
          </div>

          {!resetConfirm ? (
            <button
              onClick={() => setResetConfirm(true)}
              className="w-full rounded-lg bg-rose-500/15 border border-rose-500/25 text-rose-300 py-2 text-[10px] font-bold hover:bg-rose-500/25 transition-colors"
            >
              Reset All Progress…
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[9px] text-rose-300 font-mono bg-rose-500/10 border border-rose-500/20 rounded-lg px-2 py-1.5">
                <AlertTriangle className="h-3 w-3 shrink-0" />
                This will wipe all local learning and marketplace progress. This action cannot
                be undone. Blockchain state is unaffected.
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex-1 rounded-lg bg-rose-500/30 border border-rose-500/40 text-rose-200 py-2 text-[10px] font-bold hover:bg-rose-500/40 transition-colors"
                >
                  Yes, reset everything
                </button>
                <button
                  onClick={() => setResetConfirm(false)}
                  className="flex-1 rounded-lg bg-white/5 border border-white/10 text-white/70 py-2 text-[10px] font-bold hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── 2. Batch Mint All Registered Planets ──────────────────────────── */}
        <div className="border border-white/5 rounded-xl p-3 space-y-3">
          <div className="flex items-start gap-2">
            <Zap className="h-3.5 w-3.5 text-violet-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-mono text-[10px] text-white font-bold block">
                Batch Mint All Registered Planets
              </span>
              <p className="font-mono text-[9px] text-muted-foreground leading-relaxed">
                Mints every registered-but-unminted planet to the destination address.
                Already-minted assets are skipped. Processing continues even if one mint fails.
                Each transaction requires a Freighter signature.
              </p>
            </div>
          </div>

          {/* Status summary */}
          <div className="flex gap-3 font-mono text-[9px]">
            <span className="text-muted-foreground">
              Registered: <span className="text-white">{registeredIds.length}</span>
            </span>
            <span className="text-muted-foreground">
              Minted: <span className="text-emerald-400">{mintedIds.length}</span>
            </span>
            <span className="text-muted-foreground">
              Pending: <span className="text-amber-400">{unmintedRegistered.length}</span>
            </span>
          </div>

          {/* Destination */}
          <div className="space-y-1">
            <label className="font-mono text-[9px] text-slate-400 block">Destination address</label>
            <div className="flex gap-2">
              <input
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white font-mono"
                placeholder="G-address to mint to"
                value={batchDest}
                onChange={(e) => setBatchDest(e.target.value.trim())}
                disabled={batchRunning}
              />
              <button
                onClick={() => setBatchDest(walletAddress)}
                disabled={batchRunning}
                className="rounded-lg bg-white/5 border border-white/10 text-white/60 px-2 py-1.5 text-[9px] font-mono hover:bg-white/10 transition-colors disabled:opacity-40"
              >
                Self
              </button>
            </div>
          </div>

          {/* Run / Abort buttons */}
          {!batchRunning ? (
            <button
              disabled={txPending || unmintedRegistered.length === 0 || batchRunning}
              onClick={() => void startBatchMint()}
              className="w-full rounded-lg bg-violet-500/20 border border-violet-500/30 text-violet-300 py-2 text-[10px] font-bold disabled:opacity-40 hover:bg-violet-500/30 transition-colors"
            >
              {unmintedRegistered.length === 0
                ? "Nothing to mint"
                : `Mint ${unmintedRegistered.length} planet${unmintedRegistered.length !== 1 ? "s" : ""} →`}
            </button>
          ) : (
            <button
              onClick={() => {
                batchAbort.current = true;
              }}
              className="w-full rounded-lg bg-red-500/15 border border-red-500/25 text-red-300 py-2 text-[10px] font-bold hover:bg-red-500/25 transition-colors"
            >
              Abort after current mint
            </button>
          )}

          {/* Progress table */}
          {batchJobs.length > 0 && (
            <div className="rounded-xl border border-white/5 overflow-hidden">
              <div className="font-mono text-[8px] text-slate-400 px-2 py-1 bg-white/[0.02] border-b border-white/5 flex gap-2">
                <span className="w-4">#</span>
                <span className="flex-1">Asset</span>
                <span className="w-16 text-right">Status</span>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {batchJobs.map((job, i) => (
                  <div
                    key={job.id}
                    className="flex gap-2 items-center px-2 py-1 border-b border-white/5 last:border-0 font-mono text-[9px]"
                  >
                    <span className="w-4 text-slate-500">{i + 1}</span>
                    <span className="flex-1 text-white/80 truncate">{job.id}</span>
                    <span className="w-16 flex justify-end">
                      {job.status === "pending" && (
                        <span className="text-slate-500">waiting</span>
                      )}
                      {job.status === "minting" && (
                        <span className="text-violet-400 flex items-center gap-1">
                          <Loader2 className="h-2.5 w-2.5 animate-spin" />
                          signing…
                        </span>
                      )}
                      {job.status === "ok" && (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          {job.txHash ? (
                            <a
                              href={explorerTxUrl(job.txHash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline"
                            >
                              minted ↗
                            </a>
                          ) : (
                            "minted"
                          )}
                        </span>
                      )}
                      {job.status === "err" && (
                        <span
                          className="text-red-400 flex items-center gap-1"
                          title={job.error}
                        >
                          <XCircle className="h-2.5 w-2.5 shrink-0" />
                          <span className="truncate max-w-[6rem]">{job.error ?? "failed"}</span>
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {/* Summary bar */}
              {!batchRunning && batchJobs.length > 0 && (
                <div className="px-2 py-1.5 bg-white/[0.02] border-t border-white/5 font-mono text-[8px] flex gap-3 text-slate-400">
                  <span>
                    ✓ <span className="text-emerald-400">{batchJobs.filter((j) => j.status === "ok").length}</span>
                  </span>
                  <span>
                    ✗ <span className="text-red-400">{batchJobs.filter((j) => j.status === "err").length}</span>
                  </span>
                  <span>
                    ⌛ <span className="text-slate-500">{batchJobs.filter((j) => j.status === "pending").length}</span>{" "}
                    skipped (aborted)
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Diag helper component ─────────────────────────────────────────────────────

function Diag({
  label,
  value,
  link,
}: {
  label: string;
  value: string;
  link?: string;
}) {
  return (
    <div className="border border-white/5 rounded-lg px-2 py-1.5 bg-white/[0.01]">
      <dt className="text-muted-foreground uppercase text-[8px]">{label}</dt>
      <dd className="text-white/90 break-all mt-0.5">
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="underline text-indigo-300">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

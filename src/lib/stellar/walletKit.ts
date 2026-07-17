/**
 * Stellar Wallets Kit configuration — the ONE place the app decides which
 * wallets it supports and which network it targets. Every other file goes
 * through this module; no component imports the kit directly.
 *
 * ── Why everything here is dynamically imported ──
 * CosmosX is a TanStack Start app (server-rendered). The wallet kit and its
 * wallet modules (e.g. `@stellar/freighter-api` behind `FreighterModule`)
 * reference browser globals and use ESM shapes that break when pulled into the
 * SSR module graph. A *static* `import ... from "@creit.tech/..."` at the top of
 * this file would load them during SSR even if we never call them — crashing
 * server render with "does not provide an export named getAddress".
 *
 * So we import the kit and modules **dynamically, inside a browser-only async
 * init** that only runs from a client event handler. Nothing wallet-related
 * ever enters the server bundle. `getWalletKit()` is therefore async and must
 * be awaited.
 *
 * ── Kit 2.5.0 API ──
 * `StellarWalletsKit` is a *static* class configured via
 * `StellarWalletsKit.init({...})` (no `new`), and wallet modules live at their
 * own import subpaths. Written against the installed 2.5.0 surface.
 */

import type { StellarWalletsKit as StellarWalletsKitType } from "@creit.tech/stellar-wallets-kit";

/** The Freighter wallet id, resolved lazily so no static import runs at SSR. */
export const FREIGHTER_ID = "freighter";

let kitPromise: Promise<typeof StellarWalletsKitType> | null = null;

async function initKit(): Promise<typeof StellarWalletsKitType> {
  // All wallet imports are dynamic so they stay out of the SSR bundle.
  const { StellarWalletsKit, Networks } = await import(
    "@creit.tech/stellar-wallets-kit"
  );
  const { FreighterModule } = await import(
    "@creit.tech/stellar-wallets-kit/modules/freighter"
  );
  const { xBullModule } = await import(
    "@creit.tech/stellar-wallets-kit/modules/xbull"
  );

  StellarWalletsKit.init({
    // The one line to change for a future Mainnet build: Networks.PUBLIC.
    network: Networks.TESTNET,
    // Freighter first (what most players/judges have); xBull as a free extra.
    modules: [new FreighterModule(), new xBullModule()],
  });

  return StellarWalletsKit;
}

/**
 * Returns the configured static kit, initializing it (and loading the wallet
 * bundles) on first use. Async because the kit is dynamically imported.
 *
 * Must be called from the browser (i.e. from a user interaction). Throws a
 * clear error if invoked during SSR.
 */
export function getWalletKit(): Promise<typeof StellarWalletsKitType> {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error(
        "[stellar] Wallet kit is browser-only and cannot be used during SSR. " +
          "Call it from a client event handler (e.g. onClick), not at render/module scope.",
      ),
    );
  }
  if (!kitPromise) {
    kitPromise = initKit();
  }
  return kitPromise;
}

#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# CosmosX Marketplace Contract — Testnet Deployment Script
# ═══════════════════════════════════════════════════════════════════════════
#
# This script:
#   1. Builds the marketplace WASM
#   2. Deploys to Stellar Testnet
#   3. Initialises with the chosen admin address + XLM SAC token
#   4. Prints next steps (registration and minting are done via the Admin UI)
#
# ─── Admin vs Deployer — IMPORTANT ─────────────────────────────────────────
#
# DEPLOYER  — The Stellar CLI identity that SIGNS and PAYS FEES for the
#             deploy and initialize transactions.  Must be a funded CLI key.
#             Default: cosmosx-admin  (a throwaway testnet key for fees only)
#
# ADMIN     — The address stored inside the contract by initialize().
#             This is the wallet that get_admin() returns, and therefore
#             the wallet the frontend recognises as admin.
#             Set MARKETPLACE_ADMIN_ADDRESS to override.
#             Default: the DEPLOYER's own address (backward-compat).
#
# Because register_asset() and mint_to() call admin.require_auth(), only the
# admin wallet can call them.  If ADMIN ≠ DEPLOYER (which is the case when
# you use your personal Freighter wallet as admin), the CLI cannot sign those
# transactions.  Instead, use the in-app Admin Dashboard (Marketplace →
# Dashboard → Admin tab) to register assets and mint after deploying.
#
# ─── Prerequisites ──────────────────────────────────────────────────────────
# • `stellar` CLI on PATH
#     Install: https://developers.stellar.org/docs/tools/developer-tools/cli/install-cli
# • A funded CLI identity to pay deploy fees (default: cosmosx-admin)
#     stellar keys generate cosmosx-admin --network testnet --fund
# • Your admin wallet address (the Freighter wallet you want as admin):
#     export MARKETPLACE_ADMIN_ADDRESS=G...
#
# ─── Override env vars ───────────────────────────────────────────────────────
#   MARKETPLACE_DEPLOYER       Stellar CLI key name that signs + pays fees.
#                              Default: cosmosx-admin
#   MARKETPLACE_ADMIN_ADDRESS  On-chain admin address stored by initialize().
#                              Default: the deployer's own public key.
#
# ─── MANUAL STEPS AFTER THIS SCRIPT ─────────────────────────────────────────
#   1. Set VITE_MARKETPLACE_CONTRACT_ID=<printed ID> in .env.local
#   2. Set VITE_MARKETPLACE_TOKEN_ID=<printed token ID> in .env.local
#   3. Restart `npm run dev`
#   4. Open Marketplace → Dashboard → Admin tab (connect with your admin wallet)
#   5. Use "Register Asset" for each exoplanet, then "Mint to address"
#   6. Update contracts/marketplace/DEPLOYMENT.md with the new IDs
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# Resolve the contract root (parent of this scripts/ dir) so the script can be
# invoked from anywhere.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

NETWORK="testnet"

# ── Identity / address resolution ────────────────────────────────────────────
#
# DEPLOYER: CLI key name used only for signing the deploy + initialize txs.
DEPLOYER="${MARKETPLACE_DEPLOYER:-cosmosx-admin}"

# DEPLOYER_ADDRESS: the public key of the CLI deployer (for informational use).
DEPLOYER_ADDRESS="$(stellar keys address "$DEPLOYER")"

# ADMIN_ADDRESS: the address stored on-chain as get_admin().
# Override with MARKETPLACE_ADMIN_ADDRESS to use a different wallet (e.g.
# your personal Freighter wallet) without changing the DEPLOYER identity.
ADMIN_ADDRESS="${MARKETPLACE_ADMIN_ADDRESS:-$DEPLOYER_ADDRESS}"

# ── Sanity: warn when deployer ≠ admin ───────────────────────────────────────
if [ "$ADMIN_ADDRESS" != "$DEPLOYER_ADDRESS" ]; then
  echo ""
  echo "  ℹ️  Deployer  : $DEPLOYER ($DEPLOYER_ADDRESS)"
  echo "  ℹ️  Admin     : $ADMIN_ADDRESS  ← stored on-chain"
  echo "  ℹ️  Deployer will pay fees; admin wallet will own register/mint rights."
  echo "  ℹ️  Use the in-app Admin Dashboard to register assets and mint after deploy."
  echo ""
fi

echo "═══════════════════════════════════════════════════════════════"
echo " CosmosX Marketplace — Testnet Deploy"
echo " Deployer : $DEPLOYER ($DEPLOYER_ADDRESS)"
echo " Admin    : $ADMIN_ADDRESS"
echo " Network  : $NETWORK"
echo "═══════════════════════════════════════════════════════════════"

# ── Step 1: Build ─────────────────────────────────────────────────────────────
echo ""
echo "▶ Building contract WASM..."
stellar contract build

WASM="target/wasm32v1-none/release/marketplace.wasm"
if [ ! -f "$WASM" ]; then
  echo "ERROR: WASM not found at $WASM. Did the build succeed?"
  exit 1
fi
echo "  ✓ Built: $WASM"

# ── Step 2: Resolve XLM Stellar Asset Contract ID ────────────────────────────
echo ""
echo "▶ Resolving XLM (native) SAC contract ID on $NETWORK..."
XLM_SAC_ID="$(stellar contract id asset \
  --asset native \
  --network "$NETWORK")"
echo "  ✓ XLM SAC: $XLM_SAC_ID"

# ── Step 3: Deploy ────────────────────────────────────────────────────────────
echo ""
echo "▶ Deploying marketplace contract to $NETWORK..."
CONTRACT_ID="$(stellar contract deploy \
  --wasm "$WASM" \
  --source "$DEPLOYER" \
  --network "$NETWORK")"
echo "  ✓ Contract ID: $CONTRACT_ID"

# ── Step 4: Initialise ────────────────────────────────────────────────────────
# Stores ADMIN_ADDRESS permanently on-chain.  The deployer signs the tx (pays
# fees) but the address stored is ADMIN_ADDRESS, which may be a different wallet.
echo ""
echo "▶ Initialising contract..."
echo "    admin : $ADMIN_ADDRESS"
echo "    token : $XLM_SAC_ID"
stellar contract invoke \
  --id "$CONTRACT_ID" \
  --source "$DEPLOYER" \
  --network "$NETWORK" \
  -- \
  initialize \
  --admin "$ADMIN_ADDRESS" \
  --token "$XLM_SAC_ID"
echo "  ✓ Initialised — get_admin() will return: $ADMIN_ADDRESS"

# ── Steps 5 & 6: Asset registration + minting ────────────────────────────────
# These steps require a signature from the admin wallet (admin.require_auth()).
# If ADMIN_ADDRESS == DEPLOYER_ADDRESS the CLI could sign them here, but to
# keep a single consistent workflow regardless of which wallet is admin, these
# steps are always performed via the in-app Admin Dashboard (Freighter signs
# each transaction through the browser wallet).
echo ""
echo "  ℹ️  Asset registration and minting are performed via the Admin Dashboard"
echo "  ℹ️  (Marketplace → Dashboard → Admin tab) using your admin Freighter wallet."

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════════════════════════════════"
echo " Marketplace contract deployed and initialised!"
echo ""
echo " Contract ID  : $CONTRACT_ID"
echo " XLM SAC      : $XLM_SAC_ID"
echo " Admin        : $ADMIN_ADDRESS"
echo " Network      : $NETWORK"
echo ""
echo " ┌─ NEXT STEPS ────────────────────────────────────────────────────────┐"
echo " │ 1. Add to cosmos-x_testnet/.env.local:                              │"
echo " │      VITE_MARKETPLACE_CONTRACT_ID=$CONTRACT_ID"
echo " │      VITE_MARKETPLACE_TOKEN_ID=$XLM_SAC_ID"
echo " │                                                                      │"
echo " │ 2. Restart the dev server:                                           │"
echo " │      npm run dev                                                     │"
echo " │                                                                      │"
echo " │ 3. Connect Freighter with your admin wallet ($ADMIN_ADDRESS)         │"
echo " │    Open: Marketplace → Dashboard → Admin tab                         │"
echo " │                                                                      │"
echo " │ 4. Register all 12 exoplanet assets using the 'Register Asset' form  │"
echo " │    Then mint initial editions using 'Mint to address'                │"
echo " │                                                                      │"
echo " │ 5. Update contracts/marketplace/DEPLOYMENT.md with the IDs above     │"
echo " └──────────────────────────────────────────────────────────────────────┘"
echo "══════════════════════════════════════════════════════════════════════"

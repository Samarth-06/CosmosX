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
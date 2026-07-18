// Quick diagnostic: verify the { tag } union encoding produces valid XDR
// that the Soroban RPC accepts for register_asset.
// Run: node scripts/test-register-encoding.mjs

import { contract, xdr } from "@stellar/stellar-sdk";

const CONTRACT_ID = process.env.VITE_MARKETPLACE_CONTRACT_ID || "";
const RPC_URL = process.env.VITE_STELLAR_RPC_URL || "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";
const SIGNER = process.env.TEST_SIGNER || "GDZO4YDPSFISBU5CZKAHNIDB3R6XPLEWWPSAW7HAJKYSTB6RIL5U7N6K";

if (!CONTRACT_ID) {
  console.error("Set VITE_MARKETPLACE_CONTRACT_ID in .env.local");
  process.exit(1);
}

console.log("Contract:", CONTRACT_ID);
console.log("RPC:", RPC_URL);

const client = await contract.Client.from({
  contractId: CONTRACT_ID,
  networkPassphrase: NETWORK_PASSPHRASE,
  rpcUrl: RPC_URL,
  publicKey: SIGNER,
  // Read-only for encoding test — no signing needed
});

const assetId = "test_encoding_001";
const metadata = {
  name: "Encoding Test",
  asset_type: { tag: "Exoplanet" },
  rarity: { tag: "Common" },
  uri: "https://cosmosx.app/assets/test.json",
  max_supply: 1,
};

console.log("\nBuilding register_asset transaction (simulation only)...");
console.log("Metadata:", JSON.stringify(metadata, null, 2));

try {
  const tx = await client.register_asset({
    asset_id: assetId,
    metadata,
  });
  console.log("\n✓ Simulation passed — encoding is accepted by the contract RPC");
  console.log("  result:", tx.result);
  console.log("\nThe { tag } union encoding is CORRECT.");
  console.log("If register_asset still fails after signing, the issue is auth or ledger submission.");
} catch (err) {
  console.error("\n✗ Simulation FAILED:", err.message);
  console.error("\nThis means the encoding is still wrong OR the contract rejects the input.");
  console.error("Full error:", err);
}

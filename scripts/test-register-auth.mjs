// Diagnostic: simulate register_asset as admin and inspect the auth entries
// This shows exactly what Freighter needs to sign.
// Run: node --env-file=.env.local scripts/test-register-auth.mjs

import { contract, rpc, xdr } from "@stellar/stellar-sdk";

const CONTRACT_ID = process.env.VITE_MARKETPLACE_CONTRACT_ID || "";
const RPC_URL = process.env.VITE_STELLAR_RPC_URL || "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";
const ADMIN = "GDZO4YDPSFISBU5CZKAHNIDB3R6XPLEWWPSAW7HAJKYSTB6RIL5U7N6K";

if (!CONTRACT_ID) {
  console.error("Set VITE_MARKETPLACE_CONTRACT_ID in .env.local"); process.exit(1);
}

const server = new rpc.Server(RPC_URL);

const client = await contract.Client.from({
  contractId: CONTRACT_ID,
  networkPassphrase: NETWORK_PASSPHRASE,
  rpcUrl: RPC_URL,
  publicKey: ADMIN,
});

const tx = await client.register_asset({
  asset_id: "kepler_452b",
  metadata: {
    name: "Kepler-452b",
    asset_type: { tag: "Exoplanet" },
    rarity: { tag: "Legendary" },
    uri: "https://cosmosx.app/assets/kepler_452b.json",
    max_supply: 1,
  },
});

const built = tx.built;
console.log("\n=== Transaction Auth Entries ===");
const ops = built?.operations ?? [];
for (const op of ops) {
  if (op.type === "invokeHostFunction") {
    const auths = op.auth ?? [];
    console.log(`Auth entries count: ${auths.length}`);
    for (const a of auths) {
      const creds = a.credentials();
      const credType = creds.switch().name;
      console.log(`  credential type: ${credType}`);
      if (credType === "sorobanCredentialsAddress") {
        const addrCreds = creds.address();
        const addr = addrCreds.address().accountId()?.publicKey?.toString() 
                     ?? addrCreds.address().toString();
        console.log(`  address: ${addr}`);
        console.log(`  nonce: ${addrCreds.nonce()}`);
        console.log(`  signatureExpirationLedger: ${addrCreds.signatureExpirationLedger()}`);
      }
    }
  }
}

console.log("\n=== Conclusion ===");
console.log("If auth entries exist with credential type 'sorobanCredentialsAddress',");
console.log("the SDK will call signAuthEntry for each one.");
console.log("Freighter must sign the auth entry (not just the tx envelope).");
console.log("If Freighter does not support signAuthEntry, auth will fail on-ledger.");

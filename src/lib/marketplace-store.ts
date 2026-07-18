import { EXOPLANETS_DATA, type ExoplanetAsset } from "./exoplanets-data";
import { awardXP, getUserState } from "./user-store";

export interface TransactionRecord {
  id: string;
  planetId: string;
  planetName: string;
  type: "Purchase" | "List" | "Delist" | "Offer" | "Transfer" | "Accept Offer" | "Mint";
  price?: number; // XLM
  from: string;
  to: string;
  timestamp: number;
  txHash: string;
  ledger: number;
}

export interface PlanetListing {
  planetId: string;
  price: number; // XLM
  seller: string;
  listedAt: number;
}

export interface PlanetOffer {
  id: string;
  planetId: string;
  price: number; // XLM
  bidder: string;
  bidderName: string;
  timestamp: number;
}

export interface UserProfile {
  name: string;
  title: string;
  avatar: string; // Emoji or character
  bio: string;
}

export interface MarketplaceState {
  walletConnected: boolean;
  walletAddress: string | null;
  walletBalance: number; // XLM
  ownedPlanets: string[]; // planet IDs owned by the user
  listings: PlanetListing[]; // active listings
  offers: PlanetOffer[]; // active offers
  watchlist: string[]; // planet IDs
  transactions: TransactionRecord[];
  notifications: { id: string; message: string; read: boolean; timestamp: number }[];
  profile: UserProfile;
}

const STORAGE_KEY = "cosmosx_marketplace_state_v1";

const DEFAULT_PROFILE: UserProfile = {
  name: "Cosmo Cadet",
  title: "Novice Explorer",
  avatar: "👨‍🚀",
  bio: "Deep space explorer, collecting rare tokenized exoplanets verified by NASA.",
};

const DEFAULT_STATE: MarketplaceState = {
  walletConnected: false,
  walletAddress: null,
  walletBalance: 5000, // Initial Testnet XLM balance
  ownedPlanets: ["gj_504b", "ogle_hoth"], // Seed user with 2 starting exoplanets
  listings: [
    { planetId: "kepler_452b", price: 2500, seller: "GB_COSMOS_FOUNDATION", listedAt: Date.now() - 86400000 * 2 },
    { planetId: "trappist_1e", price: 1800, seller: "GB_COSMOS_FOUNDATION", listedAt: Date.now() - 86400000 },
    { planetId: "cancri_55_e", price: 2200, seller: "GB_COSMOS_FOUNDATION", listedAt: Date.now() - 43200000 },
    { planetId: "hd_189733b", price: 950, seller: "G_ALEX_DEFI", listedAt: Date.now() - 120000 },
    { planetId: "wasp_12b", price: 850, seller: "G_NOVA_STELLAR", listedAt: Date.now() - 60000 },
  ],
  offers: [
    {
      id: "bid_1",
      planetId: "gj_504b",
      price: 900,
      bidder: "GA_ORBITAL_CORP",
      bidderName: "OrbitalCorp",
      timestamp: Date.now() - 3600000,
    },
    {
      id: "bid_2",
      planetId: "kepler_452b",
      price: 2400,
      bidder: "GA_LUMEN_MAX",
      bidderName: "LumenMax",
      timestamp: Date.now() - 7200000,
    },
  ],
  watchlist: ["kepler_452b", "trappist_1e"],
  transactions: [
    {
      id: "tx_init_1",
      planetId: "gj_504b",
      planetName: "Gliese 504 b",
      type: "Mint",
      from: "System Ledger",
      to: "YOU",
      timestamp: Date.now() - 86400000 * 3,
      txHash: "4f7a79e602495b6cbcecd22c366ffaa390234ab1ad8eb333fe492aef127bcf91",
      ledger: 4291884,
    },
    {
      id: "tx_init_2",
      planetId: "ogle_hoth",
      planetName: "OGLE-2005-BLG-390Lb",
      type: "Mint",
      from: "System Ledger",
      to: "YOU",
      timestamp: Date.now() - 86400000 * 3,
      txHash: "24abf436be8cc89392ab8feccca27284b39a82cdfe91bbcc283cbafe12ea0124",
      ledger: 4291885,
    },
  ],
  notifications: [
    {
      id: "n_1",
      message: "Welcome to CosmosX Exoplanet Marketplace! Connect Freighter to start trading on Stellar Testnet.",
      read: false,
      timestamp: Date.now() - 5000,
    },
  ],
  profile: DEFAULT_PROFILE,
};

export function getMarketplaceState(): MarketplaceState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveMarketplaceState(state: MarketplaceState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

// Generate a random Stellar transaction hash (localStorage / stub-mode only)
export function generateTxHash(): string {
  const chars = "0123456789abcdef";
  let hash = "";
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

// Generate random ledger sequence (localStorage / stub-mode only)
function generateLedger(): number {
  return Math.floor(Math.random() * 50000) + 4200000;
}

/** On-chain tx metadata returned by contract write calls; stub values used in localStorage mode. */
export interface TxMeta {
  txHash?: string;
  ledger?: number;
  /** Real on-chain offer_id (u64 as string) from make_offer. */
  offerId?: string;
}

function resolveTxHash(meta?: TxMeta): string {
  return meta?.txHash && meta.txHash.length > 0 ? meta.txHash : generateTxHash();
}

function resolveLedger(meta?: TxMeta): number {
  return typeof meta?.ledger === "number" ? meta.ledger : generateLedger();
}

/**
 * Sync the marketplace wallet address from the real Freighter wallet.
 * Called by the marketplace UI whenever the real useWallet() state changes.
 * This replaces the old connectFreighterWallet() mock flow.
 */
export function syncWalletToMarketplace(address: string | null): MarketplaceState {
  const state = getMarketplaceState();
  if (address) {
    state.walletConnected = true;
    state.walletAddress = address;
    const alreadyNotified = state.notifications.some((n) =>
      n.message.includes("Freighter Wallet connected")
    );
    if (!alreadyNotified) {
      state.notifications.unshift({
        id: `notif_${Date.now()}`,
        message: `Freighter Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`,
        read: false,
        timestamp: Date.now(),
      });
    }
  } else {
    state.walletConnected = false;
    state.walletAddress = null;
  }
  saveMarketplaceState(state);
  return state;
}

// connectFreighterWallet / disconnectFreighterWallet removed in Phase 6.
// Use syncWalletToMarketplace() + useWallet() instead (wired since Phase 4).

// Purchase planet
export function buyPlanetAsset(planetId: string, meta?: TxMeta): MarketplaceState {
  const state = getMarketplaceState();
  const planet = EXOPLANETS_DATA.find((p) => p.id === planetId);
  if (!planet) return state;

  const listing = state.listings.find((l) => l.planetId === planetId);
  const price = listing ? listing.price : planet.initialPrice;

  // In live mode the on-chain balance is authoritative; skip the local credit gate.
  if (!meta?.txHash && state.walletBalance < price) return state;

  state.walletBalance -= price;
  state.listings = state.listings.filter((l) => l.planetId !== planetId);

  const seller = listing ? listing.seller : "GB_COSMOS_FOUNDATION";
  if (!state.ownedPlanets.includes(planetId)) {
    state.ownedPlanets.push(planetId);
  }

  state.transactions.unshift({
    id: `tx_${Date.now()}`,
    planetId,
    planetName: planet.name,
    type: "Purchase",
    price,
    from: seller,
    to: state.walletAddress || "YOU",
    timestamp: Date.now(),
    txHash: resolveTxHash(meta),
    ledger: resolveLedger(meta),
  });

  state.notifications.unshift({
    id: `notif_${Date.now()}`,
    message: `Successfully purchased ${planet.name} for ${price.toLocaleString()} XLM!`,
    read: false,
    timestamp: Date.now(),
  });

  awardXP(250);

  saveMarketplaceState(state);
  return state;
}

// List planet for sale
export function listPlanetAsset(planetId: string, price: number, meta?: TxMeta): MarketplaceState {
  const state = getMarketplaceState();
  const planet = EXOPLANETS_DATA.find((p) => p.id === planetId);
  // Live mode may list before local ownedPlanets has refreshed — allow with txHash.
  if (!planet || (!state.ownedPlanets.includes(planetId) && !meta?.txHash)) return state;

  state.listings = state.listings.filter((l) => l.planetId !== planetId);
  state.listings.push({
    planetId,
    price,
    seller: state.walletAddress || "YOU",
    listedAt: Date.now(),
  });

  state.transactions.unshift({
    id: `tx_${Date.now()}`,
    planetId,
    planetName: planet.name,
    type: "List",
    price,
    from: state.walletAddress || "YOU",
    to: "Marketplace Ledger",
    timestamp: Date.now(),
    txHash: resolveTxHash(meta),
    ledger: resolveLedger(meta),
  });

  state.notifications.unshift({
    id: `notif_${Date.now()}`,
    message: `Listed ${planet.name} for sale at ${price.toLocaleString()} XLM.`,
    read: false,
    timestamp: Date.now(),
  });

  awardXP(50);

  saveMarketplaceState(state);
  return state;
}

// Delist planet from sale
export function delistPlanetAsset(planetId: string, meta?: TxMeta): MarketplaceState {
  const state = getMarketplaceState();
  const planet = EXOPLANETS_DATA.find((p) => p.id === planetId);
  if (!planet) return state;

  const listing = state.listings.find((l) => l.planetId === planetId);
  // Live mode may delist from chain listings not yet mirrored locally.
  if (!listing && !meta?.txHash) return state;

  state.listings = state.listings.filter((l) => l.planetId !== planetId);

  state.transactions.unshift({
    id: `tx_${Date.now()}`,
    planetId,
    planetName: planet.name,
    type: "Delist",
    price: listing?.price,
    from: "Marketplace Ledger",
    to: state.walletAddress || "YOU",
    timestamp: Date.now(),
    txHash: resolveTxHash(meta),
    ledger: resolveLedger(meta),
  });

  state.notifications.unshift({
    id: `notif_${Date.now()}`,
    message: `Cancelled listing for ${planet.name}.`,
    read: false,
    timestamp: Date.now(),
  });

  saveMarketplaceState(state);
  return state;
}

// Transfer planet
export function transferPlanetAsset(
  planetId: string,
  recipientAddress: string,
  meta?: TxMeta,
): MarketplaceState {
  const state = getMarketplaceState();
  const planet = EXOPLANETS_DATA.find((p) => p.id === planetId);
  if (!planet || (!state.ownedPlanets.includes(planetId) && !meta?.txHash)) return state;

  state.ownedPlanets = state.ownedPlanets.filter((id) => id !== planetId);
  state.listings = state.listings.filter((l) => l.planetId !== planetId);

  state.transactions.unshift({
    id: `tx_${Date.now()}`,
    planetId,
    planetName: planet.name,
    type: "Transfer",
    from: state.walletAddress || "YOU",
    to: recipientAddress,
    timestamp: Date.now(),
    txHash: resolveTxHash(meta),
    ledger: resolveLedger(meta),
  });

  state.notifications.unshift({
    id: `notif_${Date.now()}`,
    message: `Transferred ${planet.name} to ${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}`,
    read: false,
    timestamp: Date.now(),
  });

  awardXP(100);

  saveMarketplaceState(state);
  return state;
}

// Watchlist toggle
export function toggleWatchlist(planetId: string): MarketplaceState {
  const state = getMarketplaceState();
  if (state.watchlist.includes(planetId)) {
    state.watchlist = state.watchlist.filter((id) => id !== planetId);
  } else {
    state.watchlist.push(planetId);
  }
  saveMarketplaceState(state);
  return state;
}

// Add Offer / Make Bid
export function makeOfferOnPlanet(
  planetId: string,
  offerPrice: number,
  meta?: TxMeta,
): MarketplaceState {
  const state = getMarketplaceState();
  const planet = EXOPLANETS_DATA.find((p) => p.id === planetId);
  if (!planet) return state;

  const newOffer: PlanetOffer = {
    id: meta?.offerId ?? `bid_${Date.now()}`,
    planetId,
    price: offerPrice,
    bidder: state.walletAddress || "GA_TESTNET_USER",
    bidderName: state.profile.name,
    timestamp: Date.now(),
  };

  state.offers.unshift(newOffer);

  state.transactions.unshift({
    id: `tx_${Date.now()}`,
    planetId,
    planetName: planet.name,
    type: "Offer",
    price: offerPrice,
    from: state.walletAddress || "YOU",
    to: "Offers Ledger",
    timestamp: Date.now(),
    txHash: resolveTxHash(meta),
    ledger: resolveLedger(meta),
  });

  state.notifications.unshift({
    id: `notif_${Date.now()}`,
    message: `Submitted buy offer of ${offerPrice.toLocaleString()} XLM for ${planet.name}`,
    read: false,
    timestamp: Date.now(),
  });

  saveMarketplaceState(state);
  return state;
}

// Accept offer (if user owns the planet)
export function acceptOffer(
  offerId: string,
  meta?: TxMeta,
  fallbackOffer?: PlanetOffer,
): MarketplaceState {
  const state = getMarketplaceState();
  const offer = state.offers.find((o) => o.id === offerId) ?? fallbackOffer;
  if (!offer) return state;

  const planet = EXOPLANETS_DATA.find((p) => p.id === offer.planetId);
  if (!planet || (!state.ownedPlanets.includes(offer.planetId) && !meta?.txHash)) return state;

  state.ownedPlanets = state.ownedPlanets.filter((id) => id !== offer.planetId);
  state.listings = state.listings.filter((l) => l.planetId !== offer.planetId);
  state.walletBalance += offer.price;
  state.offers = state.offers.filter((o) => o.id !== offerId);

  state.transactions.unshift({
    id: `tx_${Date.now()}`,
    planetId: offer.planetId,
    planetName: planet.name,
    type: "Accept Offer",
    price: offer.price,
    from: state.walletAddress || "YOU",
    to: offer.bidder,
    timestamp: Date.now(),
    txHash: resolveTxHash(meta),
    ledger: resolveLedger(meta),
  });

  state.notifications.unshift({
    id: `notif_${Date.now()}`,
    message: `Accepted offer of ${offer.price.toLocaleString()} XLM for ${planet.name}! Funds added to wallet.`,
    read: false,
    timestamp: Date.now(),
  });

  awardXP(300);

  saveMarketplaceState(state);
  return state;
}

// Reject offer
export function rejectOffer(offerId: string): MarketplaceState {
  const state = getMarketplaceState();
  state.offers = state.offers.filter((o) => o.id !== offerId);
  saveMarketplaceState(state);
  return state;
}

// Update profile details
export function updateUserProfile(profile: Partial<UserProfile>): MarketplaceState {
  const state = getMarketplaceState();
  state.profile = { ...state.profile, ...profile };
  saveMarketplaceState(state);
  return state;
}

// Mark notifications read
export function markNotificationsAsRead(): MarketplaceState {
  const state = getMarketplaceState();
  state.notifications = state.notifications.map((n) => ({ ...n, read: true }));
  saveMarketplaceState(state);
  return state;
}

// Get portfolio valuation
export function getPortfolioValuation(state: MarketplaceState): number {
  let value = state.walletBalance;
  for (const planetId of state.ownedPlanets) {
    const listing = state.listings.find((l) => l.planetId === planetId);
    if (listing) {
      value += listing.price;
    } else {
      const planet = EXOPLANETS_DATA.find((p) => p.id === planetId);
      value += planet ? planet.initialPrice : 0;
    }
  }
  return value;
}

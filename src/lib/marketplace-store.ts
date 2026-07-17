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
  name: "Cosmo cadet",
  title: "Novice Explorer",
  avatar: "👨‍🚀",
  bio: "Deep space explorer, collecting rare tokenized exoplanets verified by NASA.",
};

const DEFAULT_STATE: MarketplaceState = {
  walletConnected: false,
  walletAddress: null,
  walletBalance: 5000, // Initial Testnet XLM balance
  ownedPlanets: ["gj_504b", "ogle_hoth"], // Seed user with 2 starting exoplanets (one Epic, one Uncommon)
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
      message: "Welcome to CosmosX Exoplanet Marketplace! Wallet connection is configured on Stellar Testnet.",
      read: false,
      timestamp: Date.now() - 5000,
    },
  ],
  profile: DEFAULT_PROFILE,
};

export function getMarketplaceState(): MarketplaceState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed default listings for other planets
      return DEFAULT_STATE;
    }
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

// Generate a random Stellar transaction hash
function generateTxHash(): string {
  const chars = "0123456789abcdef";
  let hash = "";
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

// Generate random ledger sequence
function generateLedger(): number {
  return Math.floor(Math.random() * 50000) + 4200000;
}

// Wallet functions
export function connectFreighterWallet(address: string = "GD4K2S6B3L4XM9Y8P7W6V5U4T3R2Q1E0F_TESTNET"): MarketplaceState {
  const state = getMarketplaceState();
  state.walletConnected = true;
  state.walletAddress = address;
  
  // Add notification
  state.notifications.unshift({
    id: `notif_${Date.now()}`,
    message: `Freighter Wallet connected successfully with address ${address.slice(0, 6)}...${address.slice(-4)}`,
    read: false,
    timestamp: Date.now(),
  });
  
  saveMarketplaceState(state);
  return state;
}

export function disconnectFreighterWallet(): MarketplaceState {
  const state = getMarketplaceState();
  state.walletConnected = false;
  state.walletAddress = null;
  saveMarketplaceState(state);
  return state;
}

// Purchase planet
export function buyPlanetAsset(planetId: string): MarketplaceState {
  const state = getMarketplaceState();
  const planet = EXOPLANETS_DATA.find((p) => p.id === planetId);
  if (!planet) return state;

  const listing = state.listings.find((l) => l.planetId === planetId);
  const price = listing ? listing.price : planet.initialPrice;

  if (state.walletBalance < price) return state;

  // Deduct balance
  state.walletBalance -= price;
  
  // Remove listing if exists
  state.listings = state.listings.filter((l) => l.planetId !== planetId);

  // Transfer ownership
  const seller = listing ? listing.seller : "GB_COSMOS_FOUNDATION";
  state.ownedPlanets.push(planetId);

  // Record transaction
  const txHash = generateTxHash();
  const ledger = generateLedger();
  state.transactions.unshift({
    id: `tx_${Date.now()}`,
    planetId,
    planetName: planet.name,
    type: "Purchase",
    price,
    from: seller,
    to: state.walletAddress || "YOU",
    timestamp: Date.now(),
    txHash,
    ledger,
  });

  // Notify
  state.notifications.unshift({
    id: `notif_${Date.now()}`,
    message: `Successfully purchased ${planet.name} for ${price.toLocaleString()} XLM!`,
    read: false,
    timestamp: Date.now(),
  });

  // Award XP to core store
  awardXP(250);

  saveMarketplaceState(state);
  return state;
}

// List planet for sale
export function listPlanetAsset(planetId: string, price: number): MarketplaceState {
  const state = getMarketplaceState();
  const planet = EXOPLANETS_DATA.find((p) => p.id === planetId);
  if (!planet || !state.ownedPlanets.includes(planetId)) return state;

  // Add/Update Listing
  state.listings = state.listings.filter((l) => l.planetId !== planetId);
  state.listings.push({
    planetId,
    price,
    seller: state.walletAddress || "YOU",
    listedAt: Date.now(),
  });

  // Remove planet from active owned list in local inventory view (optional, or flag it as listed)
  // Let's keep it in ownedPlanets but mark it as listed in listings

  // Record transaction
  state.transactions.unshift({
    id: `tx_${Date.now()}`,
    planetId,
    planetName: planet.name,
    type: "List",
    price,
    from: state.walletAddress || "YOU",
    to: "Marketplace Ledger",
    timestamp: Date.now(),
    txHash: generateTxHash(),
    ledger: generateLedger(),
  });

  // Notify
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
export function delistPlanetAsset(planetId: string): MarketplaceState {
  const state = getMarketplaceState();
  const planet = EXOPLANETS_DATA.find((p) => p.id === planetId);
  if (!planet) return state;

  const listing = state.listings.find((l) => l.planetId === planetId);
  if (!listing) return state;

  // Remove Listing
  state.listings = state.listings.filter((l) => l.planetId !== planetId);

  // Record transaction
  state.transactions.unshift({
    id: `tx_${Date.now()}`,
    planetId,
    planetName: planet.name,
    type: "Delist",
    price: listing.price,
    from: "Marketplace Ledger",
    to: state.walletAddress || "YOU",
    timestamp: Date.now(),
    txHash: generateTxHash(),
    ledger: generateLedger(),
  });

  // Notify
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
export function transferPlanetAsset(planetId: string, recipientAddress: string): MarketplaceState {
  const state = getMarketplaceState();
  const planet = EXOPLANETS_DATA.find((p) => p.id === planetId);
  if (!planet || !state.ownedPlanets.includes(planetId)) return state;

  // Remove from owned
  state.ownedPlanets = state.ownedPlanets.filter((id) => id !== planetId);
  // Delist if was listed
  state.listings = state.listings.filter((l) => l.planetId !== planetId);

  // Record transaction
  state.transactions.unshift({
    id: `tx_${Date.now()}`,
    planetId,
    planetName: planet.name,
    type: "Transfer",
    from: state.walletAddress || "YOU",
    to: recipientAddress,
    timestamp: Date.now(),
    txHash: generateTxHash(),
    ledger: generateLedger(),
  });

  // Notify
  state.notifications.unshift({
    id: `notif_${Date.now()}`,
    message: `Transferred ${planet.name} to address ${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}`,
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
export function makeOfferOnPlanet(planetId: string, offerPrice: number): MarketplaceState {
  const state = getMarketplaceState();
  const planet = EXOPLANETS_DATA.find((p) => p.id === planetId);
  if (!planet) return state;

  const newOffer: PlanetOffer = {
    id: `bid_${Date.now()}`,
    planetId,
    price: offerPrice,
    bidder: state.walletAddress || "GA_TESTNET_USER",
    bidderName: state.profile.name,
    timestamp: Date.now(),
  };

  state.offers.unshift(newOffer);

  // Record transaction log
  state.transactions.unshift({
    id: `tx_${Date.now()}`,
    planetId,
    planetName: planet.name,
    type: "Offer",
    price: offerPrice,
    from: state.walletAddress || "YOU",
    to: "Offers Ledger",
    timestamp: Date.now(),
    txHash: generateTxHash(),
    ledger: generateLedger(),
  });

  // Notify
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
export function acceptOffer(offerId: string): MarketplaceState {
  const state = getMarketplaceState();
  const offer = state.offers.find((o) => o.id === offerId);
  if (!offer) return state;

  const planet = EXOPLANETS_DATA.find((p) => p.id === offer.planetId);
  if (!planet || !state.ownedPlanets.includes(offer.planetId)) return state;

  // Remove from owned
  state.ownedPlanets = state.ownedPlanets.filter((id) => id !== offer.planetId);
  // Delist if listed
  state.listings = state.listings.filter((l) => l.planetId !== offer.planetId);

  // Credit user balance
  state.walletBalance += offer.price;

  // Remove offer
  state.offers = state.offers.filter((o) => o.id !== offerId);

  // Record Transaction
  state.transactions.unshift({
    id: `tx_${Date.now()}`,
    planetId: offer.planetId,
    planetName: planet.name,
    type: "Accept Offer",
    price: offer.price,
    from: state.walletAddress || "YOU",
    to: offer.bidder,
    timestamp: Date.now(),
    txHash: generateTxHash(),
    ledger: generateLedger(),
  });

  // Notify
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
  const offer = state.offers.find((o) => o.id === offerId);
  if (!offer) return state;

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
    // Valuation is either listed price, or initial price
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

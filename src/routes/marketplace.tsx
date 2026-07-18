import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Compass,
  Layers,
  Globe,
  LineChart,
  History,
  User,
  Wallet,
  ChevronLeft,
  BadgeCheck,
  Heart,
  Send,
  Trash2,
  Bell,
  Trophy,
  Award,
  ChevronRight,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Coins,
  CheckCircle,
  BookOpen,
  Shield,
} from "lucide-react";

import { EXOPLANETS_DATA, type ExoplanetAsset, type ExoplanetRarity } from "@/lib/exoplanets-data";
import {
  getMarketplaceState,
  syncWalletToMarketplace,
  buyPlanetAsset,
  listPlanetAsset,
  delistPlanetAsset,
  transferPlanetAsset,
  toggleWatchlist,
  makeOfferOnPlanet,
  acceptOffer,
  rejectOffer,
  updateUserProfile,
  markNotificationsAsRead,
  getPortfolioValuation,
  type TransactionRecord,
  type PlanetOffer,
  type MarketplaceState,
  type TxMeta,
} from "@/lib/marketplace-store";
import { getUserState, type UserState } from "@/lib/user-store";
import Planet3DViewer from "@/components/Planet3DViewer";
import FreighterSimulator from "@/components/FreighterSimulator";
import NFTCard from "@/components/NFTCard";
import { useWallet } from "@/features/achievements/useWallet";
import { useXlmBalance } from "@/features/achievements/useXlmBalance";
import { useMarketplaceChainState } from "@/features/marketplace/useMarketplaceChainState";
import { getAssetTradeStatus } from "@/features/marketplace/assetStatus";
import AdminPanel from "@/features/marketplace/AdminPanel";
import { formatXlm } from "@/lib/stellar/balance";
import {
  contractBuy,
  contractList,
  contractDelist,
  contractTransfer,
  contractMakeOffer,
  contractAcceptOffer,
  contractRejectOffer,
  isContractConfigured,
  MARKETPLACE_CONTRACT_ID,
} from "@/lib/stellar/marketplace-contract";
import { explorerTxUrl, explorerContractUrl, STELLAR_NETWORK, STELLAR_RPC_URL } from "@/lib/stellar/network";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/marketplace")({
  component: MarketplacePage,
});

// Mock Price History generator
function generateMockPriceHistory(initialPrice: number) {
  const data = [];
  const now = new Date();
  for (let i = 7; i >= 0; i--) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    const variation = (Math.random() - 0.45) * 0.15;
    data.push({
      date: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      price: Math.round(initialPrice * (1 + variation)),
    });
  }
  return data;
}

const PORTFOLIO_HISTORY = [
  { day: "Jul 10", value: 3400 },
  { day: "Jul 11", value: 3950 },
  { day: "Jul 12", value: 3800 },
  { day: "Jul 13", value: 4350 },
  { day: "Jul 14", value: 4900 },
  { day: "Jul 15", value: 5200 },
  { day: "Jul 16", value: 5850 },
  { day: "Jul 17", value: 6450 },
];

function MarketplacePage() {
  // ── Real wallet state (single source of truth) ──────────────────────────
  const wallet = useWallet();

  // ── Real Testnet XLM balance (Phase 5, Objective 3) ─────────────────────
  // The connected wallet's on-chain XLM is the source of truth once the
  // contract is deployed (isContractConfigured()). In dev/stub mode we fall
  // back to the simulated credit in marketplace-store.ts.
  const liveMode = isContractConfigured();
  const balance = useXlmBalance(wallet.address);

  // ── Live ownership / listings / offers (Phase 5) ─────────────────────────
  // When the contract is reachable, chain data overrides localStorage for
  // ownership, listings, and offers. localStorage remains the fallback when
  // the contract is unset or RPC reads fail (chain.ready === false).
  const chain = useMarketplaceChainState(wallet.address);

  // Navigation View State
  const [view, setView] = useState<"home" | "detail" | "dashboard">("home");
  const [selectedPlanetId, setSelectedPlanetId] = useState<string | null>(null);

  // Global State
  const [state, setState] = useState<MarketplaceState>(getMarketplaceState());
  const [learningState, setLearningState] = useState<UserState | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRarity, setSelectedRarity] = useState<string>("All");
  const [priceRange, setPriceRange] = useState<number>(3000);
  const [distanceRange, setDistanceRange] = useState<number>(22000);
  const [sortBy, setSortBy] = useState<string>("rarity-desc");
  const [showFilters, setShowFilters] = useState(false);

  // Educational overlay state
  const [educatorOpen, setEducatorOpen] = useState(false);
  const [educatorContext, setEducatorContext] = useState<
    "wallet-connect" | "signing" | "keys" | "transaction" | "nft-mint" | "marketplace-trade"
  >("marketplace-trade");

  // Transaction loading state — prevents double-submits
  const [txPending, setTxPending] = useState(false);

  // Trading Input State
  const [listPriceInput, setListPriceInput] = useState("");
  const [bidPriceInput, setBidPriceInput] = useState("");
  const [transferAddressInput, setTransferAddressInput] = useState("");

  // Profile Edit State
  const [profileName, setProfileName] = useState("");
  const [profileTitle, setProfileTitle] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // ── Sync real wallet address → marketplace store on every wallet change ──
  useEffect(() => {
    const updated = syncWalletToMarketplace(wallet.address);
    setState(updated);
  }, [wallet.address]);

  useEffect(() => {
    setState(getMarketplaceState());
    setLearningState(getUserState());

    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get("view");
    const idParam = params.get("id");

    if (viewParam === "dashboard") {
      setView("dashboard");
    } else if (viewParam === "detail" && idParam) {
      const exists = EXOPLANETS_DATA.some((p) => p.id === idParam);
      if (exists) {
        setSelectedPlanetId(idParam);
        setView("detail");
      }
    }
  }, []);

  const navigateToView = (targetView: "home" | "detail" | "dashboard", id: string | null = null) => {
    setView(targetView);
    setSelectedPlanetId(id);

    const params = new URLSearchParams();
    params.set("view", targetView);
    if (id) params.set("id", id);

    window.scrollTo({ top: 0, behavior: "smooth" });
    window.history.pushState({}, "", `${window.location.pathname}?${params.toString()}`);
  };

  /**
   * Guard: require a connected wallet. Shows the wallet picker if not connected.
   * Returns true if the wallet is ready, false if not (caller should abort).
   */
  const requireWallet = useCallback(async (): Promise<boolean> => {
    if (wallet.address) return true;
    try {
      await wallet.connect();
      // After connect(), wallet.address may still be null momentarily — the
      // useEffect above will sync it. Callers should retry on next render.
      return false;
    } catch {
      toast.error("Could not open the wallet picker. Please try again.");
      return false;
    }
  }, [wallet]);

  /**
   * Execute a marketplace action:
   * 1. If the contract is configured, call the on-chain client function first.
   *    On success, pass real txHash / ledger / offerId into the local mutator.
   * 2. Update localStorage (tx history, notifications, XP, stub-mode state).
   * 3. In live mode, refetch ownership / listings / offers from the contract
   *    so the UI reflects chain state rather than optimistic local mutations.
   *
   * `contractFn` returns a CallResult — if it fails, we show the error and
   * abort without touching the local store (keeps UI consistent with chain).
   */
  const executeTransaction = useCallback(async (
    contractFn: (() => Promise<{
      success: boolean;
      txHash?: string;
      ledger?: number;
      data?: bigint | void;
      error?: string;
    }>) | null,
    localFn: (meta?: TxMeta) => MarketplaceState,
    successMsg: string,
    requiresWallet = true,
  ): Promise<void> => {
    if (requiresWallet && !wallet.address) {
      const ok = await requireWallet();
      if (!ok) return;
    }

    if (txPending) {
      toast.info("A transaction is already in progress. Please wait.");
      return;
    }

    setTxPending(true);
    try {
      let meta: TxMeta | undefined;

      // If a contract function is provided and the contract is configured,
      // run the on-chain call first.
      if (contractFn && isContractConfigured()) {
        const result = await contractFn();
        if (!result.success) {
          toast.error(result.error ?? "Transaction failed.");
          return;
        }
        meta = {
          txHash: result.txHash,
          ledger: result.ledger,
          offerId:
            result.data !== undefined && result.data !== null && typeof result.data === "bigint"
              ? String(result.data)
              : undefined,
        };
        // Show explorer link if we got a real txHash
        if (result.txHash) {
          toast.success(
            `${successMsg} — `,
            {
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
            }
          );
        } else {
          toast.success(successMsg);
        }
      } else {
        toast.success(successMsg);
      }

      // Update local store (history / notifications / stub-mode ownership)
      const updated = localFn(meta);
      setState(updated);

      // Live mode: refetch chain state + XLM so ownership/listings/offers/balance
      // come from the deployed contract, not optimistic local mutations alone.
      if (liveMode) {
        await chain.refresh();
        if (wallet.address) void balance.refresh();
      }
    } finally {
      setTxPending(false);
    }
  }, [wallet.address, txPending, requireWallet, liveMode, balance, chain.refresh]);

  // ── Displayed marketplace state (Phase 5) ───────────────────────────────
  // Live + successful RPC → chain is source of truth for ownership/listings/offers.
  // Otherwise → localStorage fallback (dev / stub / RPC error).
  // While the first live read is in flight, show empty trade state (not seed data)
  // so mock ownership does not flash as if it were on-chain.
  const market = useMemo((): MarketplaceState => {
    if (!liveMode) return state;
    if (!chain.ready) {
      if (chain.status === "loading" || chain.loading) {
        return { ...state, ownedPlanets: [], listings: [], offers: [] };
      }
      return state;
    }
    return {
      ...state,
      ownedPlanets: chain.ownedPlanets,
      listings: chain.listings,
      offers: chain.offers,
    };
  }, [
    liveMode,
    chain.ready,
    chain.status,
    chain.loading,
    chain.ownedPlanets,
    chain.listings,
    chain.offers,
    state,
  ]);

  // ── Displayed balance (Phase 5) ─────────────────────────────────────────
  // Live mode → real Testnet XLM from the wallet (source of truth).
  // Dev/stub mode → simulated credit from the local store.
  const displayBalance = liveMode ? balance.xlm : state.walletBalance;

  /** Can the connected wallet afford `price` XLM right now? */
  const canAfford = useCallback(
    (price: number): boolean => displayBalance >= price,
    [displayBalance],
  );

  // ── Wallet handlers ───────────────────────────────────────────────────────

  const handleConnectWallet = useCallback(async () => {
    await wallet.connect();
    if (wallet.error) toast.error(wallet.error);
  }, [wallet]);

  const handleDisconnectWallet = useCallback(async () => {
    await wallet.disconnect();
    const updated = syncWalletToMarketplace(null);
    setState(updated);
    toast.info("Wallet disconnected.");
  }, [wallet]);

  // ── Trading handlers ──────────────────────────────────────────────────────

  const handleBuy = useCallback(async (planetId: string) => {
    const planet = EXOPLANETS_DATA.find((p) => p.id === planetId);
    const status = getAssetTradeStatus({
      assetId: planetId,
      walletAddress: wallet.address,
      owners: liveMode && chain.ready ? chain.owners : Object.fromEntries(
        market.ownedPlanets.map((id) => [id, wallet.address ?? "YOU"]),
      ),
      listings: market.listings,
      liveMode,
      chainReady: chain.ready,
      registeredIds: chain.registeredIds,
      mintedIds: chain.mintedIds,
    });
    if (!status.canBuy) {
      toast.error(status.buyDisabledReason ?? "This asset cannot be purchased.");
      return;
    }

    const listing = market.listings.find((l) => l.planetId === planetId);
    const price = listing ? listing.price : planet?.initialPrice ?? 1000;

    if (!canAfford(price)) {
      toast.error("Insufficient XLM balance.");
      return;
    }

    await executeTransaction(
      wallet.address ? () => contractBuy(planetId, wallet.address!) : null,
      (meta) => buyPlanetAsset(planetId, meta),
      `Purchased ${planet?.name ?? "asset"} for ${price.toLocaleString()} XLM!`,
    );
  }, [market.listings, market.ownedPlanets, wallet.address, executeTransaction, canAfford, liveMode, chain.ready, chain.owners, chain.registeredIds, chain.mintedIds]);

  const handleList = useCallback(async (planetId: string) => {
    const status = getAssetTradeStatus({
      assetId: planetId,
      walletAddress: wallet.address,
      owners: liveMode && chain.ready ? chain.owners : Object.fromEntries(
        market.ownedPlanets.map((id) => [id, wallet.address ?? "YOU"]),
      ),
      listings: market.listings,
      liveMode,
      chainReady: chain.ready,
      registeredIds: chain.registeredIds,
      mintedIds: chain.mintedIds,
    });
    if (!status.canList) {
      toast.error(status.listDisabledReason ?? "You can only list assets you own.");
      return;
    }
    const price = parseFloat(listPriceInput);
    if (isNaN(price) || price <= 0) {
      toast.error("Enter a valid listing price in XLM.");
      return;
    }
    const planet = EXOPLANETS_DATA.find((p) => p.id === planetId);
    await executeTransaction(
      wallet.address ? () => contractList(planetId, price, wallet.address!) : null,
      (meta) => listPlanetAsset(planetId, price, meta),
      `Listed ${planet?.name ?? "asset"} at ${price.toLocaleString()} XLM.`,
    );
    setListPriceInput("");
  }, [listPriceInput, wallet.address, executeTransaction, market.listings, market.ownedPlanets, liveMode, chain.ready, chain.owners, chain.registeredIds, chain.mintedIds]);

  const handleDelist = useCallback(async (planetId: string) => {
    const planet = EXOPLANETS_DATA.find((p) => p.id === planetId);
    await executeTransaction(
      wallet.address ? () => contractDelist(planetId, wallet.address!) : null,
      (meta) => delistPlanetAsset(planetId, meta),
      `Cancelled listing for ${planet?.name ?? "asset"}.`,
    );
  }, [wallet.address, executeTransaction]);

  const handleTransfer = useCallback(async (planetId: string) => {
    if (!transferAddressInput.trim() || transferAddressInput.length < 15) {
      toast.error("Enter a valid Stellar G-address.");
      return;
    }
    const planet = EXOPLANETS_DATA.find((p) => p.id === planetId);
    await executeTransaction(
      wallet.address
        ? () => contractTransfer(planetId, transferAddressInput, wallet.address!)
        : null,
      (meta) => transferPlanetAsset(planetId, transferAddressInput, meta),
      `Transferred ${planet?.name ?? "asset"} to ${transferAddressInput.slice(0, 6)}...`,
    );
    setTransferAddressInput("");
    navigateToView("home");
  }, [transferAddressInput, wallet.address, executeTransaction]);

  const handleMakeOffer = useCallback(async (planetId: string) => {
    const status = getAssetTradeStatus({
      assetId: planetId,
      walletAddress: wallet.address,
      owners: liveMode && chain.ready ? chain.owners : Object.fromEntries(
        market.ownedPlanets.map((id) => [id, wallet.address ?? "YOU"]),
      ),
      listings: market.listings,
      liveMode,
      chainReady: chain.ready,
      registeredIds: chain.registeredIds,
      mintedIds: chain.mintedIds,
    });
    if (!status.canOffer) {
      toast.error(status.offerDisabledReason ?? "Offers are not available for this asset.");
      return;
    }
    const price = parseFloat(bidPriceInput);
    if (isNaN(price) || price <= 0) {
      toast.error("Enter a valid bid amount in XLM.");
      return;
    }
    const planet = EXOPLANETS_DATA.find((p) => p.id === planetId);
    await executeTransaction(
      wallet.address
        ? () => contractMakeOffer(planetId, price, wallet.address!)
        : null,
      (meta) => makeOfferOnPlanet(planetId, price, meta),
      `Submitted offer of ${price.toLocaleString()} XLM for ${planet?.name ?? "asset"}.`,
    );
    setBidPriceInput("");
  }, [bidPriceInput, wallet.address, executeTransaction, market.listings, market.ownedPlanets, liveMode, chain.ready, chain.owners, chain.registeredIds, chain.mintedIds]);

  const handleAcceptOffer = useCallback(async (offerId: string) => {
    const offer = market.offers.find((o) => o.id === offerId);
    const planet = EXOPLANETS_DATA.find((p) => p.id === offer?.planetId);
    // Live offers use the on-chain u64 as a decimal string; stub offers use bid_*.
    const onChainOfferId = BigInt(offerId.replace(/\D/g, "") || "0");
    await executeTransaction(
      wallet.address && offer
        ? () => contractAcceptOffer(offer.planetId, onChainOfferId, wallet.address!)
        : null,
      (meta) => acceptOffer(offerId, meta, offer),
      `Accepted offer of ${offer?.price.toLocaleString()} XLM for ${planet?.name ?? "asset"}!`,
    );
  }, [market.offers, wallet.address, executeTransaction]);

  const handleRejectOffer = useCallback(async (offerId: string) => {
    const offer = market.offers.find((o) => o.id === offerId);
    const onChainOfferId = BigInt(offerId.replace(/\D/g, "") || "0");
    await executeTransaction(
      wallet.address && offer
        ? () => contractRejectOffer(offer.planetId, onChainOfferId, wallet.address!)
        : null,
      () => rejectOffer(offerId),
      "Offer declined.",
    );
  }, [market.offers, wallet.address, executeTransaction]);

  const handleToggleWatchlist = (planetId: string) => {
    const updated = toggleWatchlist(planetId);
    setState(updated);
    const planet = EXOPLANETS_DATA.find((p) => p.id === planetId);
    if (updated.watchlist.includes(planetId)) {
      toast.success(`Added ${planet?.name} to Watchlist.`);
    } else {
      toast.info(`Removed ${planet?.name} from Watchlist.`);
    }
  };

  const handleSaveProfile = () => {
    const updated = updateUserProfile({
      name: profileName || state.profile.name,
      title: profileTitle || state.profile.title,
      bio: profileBio || state.profile.bio,
      avatar: profileAvatar || state.profile.avatar,
    });
    setState(updated);
    setIsEditingProfile(false);
    toast.success("Profile updated.");
  };

  const handleMarkRead = () => {
    const updated = markNotificationsAsRead();
    setState(updated);
  };

  const ownersMap = useMemo(() => {
    if (liveMode && chain.ready) return chain.owners;
    const map: Record<string, string> = {};
    for (const id of market.ownedPlanets) {
      if (wallet.address) map[id] = wallet.address;
    }
    for (const l of market.listings) {
      if (!map[l.planetId]) map[l.planetId] = l.seller;
    }
    return map;
  }, [liveMode, chain.ready, chain.owners, market.ownedPlanets, market.listings, wallet.address]);

  const tradeStatusFor = useCallback(
    (planetId: string) =>
      getAssetTradeStatus({
        assetId: planetId,
        walletAddress: wallet.address,
        owners: ownersMap,
        listings: market.listings,
        liveMode,
        chainReady: chain.ready,
        registeredIds: chain.registeredIds,
        mintedIds: chain.mintedIds,
      }),
    [wallet.address, ownersMap, market.listings, liveMode, chain.ready, chain.registeredIds, chain.mintedIds],
  );

  const getPlanetPrice = (planetId: string): number => {
    const listing = market.listings.find((l) => l.planetId === planetId);
    if (listing) return listing.price;
    const planet = EXOPLANETS_DATA.find((p) => p.id === planetId);
    return planet ? planet.initialPrice : 1000;
  };

  const getPlanetOwner = (planetId: string): string => {
    const status = tradeStatusFor(planetId);
    if (status.isOwnedByMe) return "YOU";
    if (status.kind === "not_registered") return "Not registered";
    if (status.kind === "not_minted") return "Not minted";
    if (status.owner) return status.owner;
    return "—";
  };

  const liveStats = useMemo(() => {
    const listingPrices = market.listings.map((l) => l.price);
    const floor = listingPrices.length ? Math.min(...listingPrices) : null;
    const highest = listingPrices.length ? Math.max(...listingPrices) : null;
    const purchases = state.transactions.filter((t) => t.type === "Purchase").length;
    const sales = state.transactions.filter((t) => t.type === "Accept Offer" || t.type === "List").length;
    const offersMade = wallet.address
      ? market.offers.filter((o) => o.bidder === wallet.address).length
      : 0;
    const offersReceived = market.offers.filter((o) =>
      market.ownedPlanets.includes(o.planetId),
    ).length;
    return {
      registered: liveMode && chain.ready ? chain.registeredIds.length : EXOPLANETS_DATA.length,
      minted: liveMode && chain.ready ? chain.mintedIds.length : market.ownedPlanets.length,
      listed: market.listings.length,
      ownedByMe: market.ownedPlanets.length,
      myListings: market.listings.filter((l) => market.ownedPlanets.includes(l.planetId)).length,
      offersMade,
      offersReceived,
      floor,
      highest,
      purchases,
      sales,
    };
  }, [liveMode, chain.ready, chain.registeredIds, chain.mintedIds, market.listings, market.ownedPlanets, market.offers, state.transactions, wallet.address]);

  const filteredExoplanets = EXOPLANETS_DATA.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.hostStar.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesCategory = true;
    if (selectedCategory === "terrestrial") matchesCategory = p.type === "Terrestrial";
    else if (selectedCategory === "super-earth") matchesCategory = p.type === "Super-Earth";
    else if (selectedCategory === "gas-giant") matchesCategory = p.type === "Gas Giant";
    else if (selectedCategory === "ice-giant") matchesCategory = p.type === "Ice Giant";

    const matchesRarity = selectedRarity === "All" || p.rarity === selectedRarity;
    const currentPrice = getPlanetPrice(p.id);
    const matchesPrice = currentPrice <= priceRange;
    const matchesDistance = p.distance <= distanceRange;

    return matchesSearch && matchesCategory && matchesRarity && matchesPrice && matchesDistance;
  });

  const sortedExoplanets = [...filteredExoplanets].sort((a, b) => {
    const priceA = getPlanetPrice(a.id);
    const priceB = getPlanetPrice(b.id);
    if (sortBy === "price-asc") return priceA - priceB;
    if (sortBy === "price-desc") return priceB - priceA;
    if (sortBy === "distance-asc") return a.distance - b.distance;
    if (sortBy === "distance-desc") return b.distance - a.distance;
    if (sortBy === "year-asc") return a.discoveryYear - b.discoveryYear;
    if (sortBy === "year-desc") return b.discoveryYear - a.discoveryYear;
    const rarityRank = { Legendary: 5, Epic: 4, Rare: 3, Uncommon: 2, Common: 1 };
    if (sortBy === "rarity-desc") {
      return rarityRank[b.rarity as ExoplanetRarity] - rarityRank[a.rarity as ExoplanetRarity];
    }
    return 0;
  });

  const COLLECTION_STATS = [
    { name: "Rocky Terras", floor: "480 XLM", volume: "14.2K XLM", items: 3, color: "from-amber-500/20 to-red-500/20", border: "border-red-500/30" },
    { name: "Super-Earths", floor: "250 XLM", volume: "28.5K XLM", items: 4, color: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/30" },
    { name: "Gas Giants", floor: "850 XLM", volume: "39.1K XLM", items: 4, color: "from-indigo-500/20 to-purple-500/20", border: "border-indigo-500/30" },
    { name: "Ice Giants", floor: "650 XLM", volume: "9.8K XLM", items: 1, color: "from-cyan-500/20 to-blue-500/20", border: "border-cyan-500/30" },
  ];

  const currentExoplanet = selectedPlanetId
    ? EXOPLANETS_DATA.find((p) => p.id === selectedPlanetId)
    : null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between overflow-x-hidden pb-12">
      <Toaster position="top-right" theme="dark" closeButton />

      {/* Starfield */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_center,white_0.7px,transparent_0.7px)] bg-[size:22px_22px] opacity-[0.06] z-0" />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-indigo-950/5 via-transparent to-cyan-950/5 z-0" />

      {/* Educational overlay — conceptual explainer, not a tx simulator */}
      <FreighterSimulator
        isOpen={educatorOpen}
        onClose={() => setEducatorOpen(false)}
        context={educatorContext}
        walletAddress={state.walletAddress}
      />

      {/* Primary Sticky Header */}
      <header className="sticky top-0 z-40 border-b border-white/8 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <span
              onClick={() => navigateToView("home")}
              className="cursor-pointer font-display text-base font-extrabold tracking-tight text-white hover:opacity-80 transition"
            >
              Cosmos<span className="text-secondary">X</span>
            </span>
            <span className="text-white/20">/</span>
            <span
              onClick={() => navigateToView("home")}
              className="cursor-pointer flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition"
            >
              <Globe className="h-3.5 w-3.5" /> Exoplanet Market
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Learn button */}
            <button
              onClick={() => {
                setEducatorContext("marketplace-trade");
                setEducatorOpen(true);
              }}
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/15 px-3 py-1.5 text-[10px] font-mono text-indigo-400 transition"
            >
              <BookOpen className="h-3.5 w-3.5" />
              How This Works
            </button>

            {state.walletConnected && state.walletAddress ? (
              <div className="flex items-center gap-2">
                <div className="rounded-l-xl bg-white/[0.02] border border-r-0 border-white/5 px-3 py-1.5 flex items-center gap-1.5">
                  <Coins className="h-3.5 w-3.5 text-secondary" />
                  <span className="font-mono text-xs font-bold text-foreground">
                    {liveMode && balance.loading && balance.status !== "ok"
                      ? "…"
                      : liveMode && balance.status === "error"
                        ? "— "
                        : formatXlm(displayBalance)}{" "}
                    XLM
                  </span>
                  {liveMode && (
                    <span
                      className={`font-mono text-[8px] uppercase tracking-wider ${
                        chain.ready
                          ? "text-emerald-400/80"
                          : chain.loading
                            ? "text-amber-400/80"
                            : "text-rose-400/80"
                      }`}
                      title={
                        chain.ready
                          ? "Ownership, listings, and offers from the deployed marketplace contract"
                          : chain.error ?? "Using local fallback for marketplace state"
                      }
                    >
                      {chain.ready ? "on-chain" : chain.loading ? "sync…" : "local"}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => navigateToView("dashboard")}
                  className="rounded-r-xl bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 text-xs font-mono font-semibold text-indigo-400 hover:bg-indigo-500/20 transition flex items-center gap-1.5"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {state.walletAddress.slice(0, 6)}...{state.walletAddress.slice(-4)}
                </button>
                <button
                  onClick={handleDisconnectWallet}
                  className="rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs text-muted-foreground hover:text-white transition"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                disabled={wallet.connecting || txPending}
                className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-[0_0_20px_-4px_rgba(99,102,241,0.5)] transition hover:shadow-[0_0_20px_rgba(99,102,241,0.7)] flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Wallet className="h-3.5 w-3.5" />
                {wallet.connecting ? "Connecting..." : "Connect Freighter"}
              </button>
            )}

            <button
              onClick={() => navigateToView(view === "dashboard" ? "home" : "dashboard")}
              className={`rounded-xl border px-3.5 py-2 text-xs font-semibold font-mono transition flex items-center gap-1.5 ${
                view === "dashboard"
                  ? "bg-white/10 text-white border-white/20"
                  : "bg-white/5 text-muted-foreground border-white/5 hover:text-white hover:bg-white/10"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              {view === "dashboard" ? "Explore Market" : "Dashboard"}
            </button>
          </div>
        </div>
      </header>

      {/* Subnavigation Bar */}
      <div className="border-b border-white/5 bg-slate-950/30 py-2.5 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => navigateToView("home")}
              className={`rounded-lg px-4 py-1.5 font-mono text-[11px] font-medium transition flex items-center gap-1.5 ${
                view === "home" ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white"
              }`}
            >
              <Compass className="h-3.5 w-3.5" /> Telemetry Catalog
            </button>
            <button
              onClick={() => navigateToView("dashboard")}
              className={`rounded-lg px-4 py-1.5 font-mono text-[11px] font-medium transition flex items-center gap-1.5 ${
                view === "dashboard" ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white"
              }`}
            >
              <Layers className="h-3.5 w-3.5" /> Commander Cargo Bay ({market.ownedPlanets.length})
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Stellar Ledger: <span className="text-white font-bold">#4,281,992</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 z-10">
        <AnimatePresence mode="wait">

          {/* HOME VIEW */}
          {view === "home" && (
            <motion.div
              key="explore-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              {/* FEATURED HERO BANNER */}
              <div className="relative rounded-3xl border border-amber-500/20 bg-gradient-to-r from-slate-950 via-[#0a0f24] to-amber-950/20 p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-8 overflow-hidden shadow-[0_0_40px_rgba(245,158,11,0.06)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(245,158,11,0.06)_0%,transparent_60%)] pointer-events-none" />

                <div className="space-y-4 max-w-xl text-left">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 px-3 py-1 font-mono text-[9px] font-bold text-amber-300 uppercase tracking-widest">
                    <Sparkles className="h-3 w-3 animate-spin" /> FEATURED COLLECTIBLE DISCOVERY
                  </div>

                  <div className="space-y-1">
                    <h2 className="font-display text-3xl font-extrabold text-white leading-tight">55 Cancri e</h2>
                    <p className="font-mono text-xs text-secondary">Class: Carbon-Rich Hot Super-Earth (Lava World)</p>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    A molten carbon super-Earth so close to its parent star that its surface remains an ocean of active
                    lava. Due to high pressures and chemical abundance, scientists hypothesize that a significant
                    fraction of its mass could be crystallized carbon — effectively making it a diamond world.
                  </p>

                  <div className="grid grid-cols-3 gap-3 py-3 border-y border-white/5 font-mono text-[10px]">
                    <div>
                      <span className="text-white font-bold block">41 Light-Years</span>
                      <span className="text-muted-foreground text-[9px]">Distance</span>
                    </div>
                    <div>
                      <span className="text-white font-bold block">8.08 M⊕</span>
                      <span className="text-muted-foreground text-[9px]">Planet Mass</span>
                    </div>
                    <div>
                      <span className="text-white font-bold block">2,400 Kelvin</span>
                      <span className="text-muted-foreground text-[9px]">Surface Temp</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => navigateToView("detail", "cancri_55_e")}
                      className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold font-mono transition shadow-lg shadow-amber-400/15 flex items-center gap-2"
                    >
                      Explore Data Room <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    {(() => {
                      const featured = tradeStatusFor("cancri_55_e");
                      if (featured.canBuy) {
                        return (
                          <button
                            onClick={() => handleBuy("cancri_55_e")}
                            className="px-5 py-3 border border-white/10 hover:border-white/20 bg-white/5 text-white rounded-xl text-xs font-bold font-mono transition"
                          >
                            Acquire Asset ({getPlanetPrice("cancri_55_e").toLocaleString()} XLM)
                          </button>
                        );
                      }
                      return (
                        <span className="px-5 py-3 border border-white/10 bg-white/[0.03] text-muted-foreground rounded-xl text-xs font-bold font-mono">
                          {featured.buyDisabledReason ?? featured.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                <div className="relative shrink-0 flex items-center justify-center h-72 w-72 bg-gradient-to-br from-amber-500/5 to-transparent rounded-full border border-white/5">
                  <Planet3DViewer textureName="venus" color="#F59E0B" isLarge className="h-64 w-64" />
                  <div
                    className="absolute border border-amber-500/10 rounded-full w-[110%] h-[110%] pointer-events-none animate-spin"
                    style={{ animationDuration: "40s" }}
                  />
                </div>
              </div>

              {/* POPULAR COLLECTIONS */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-secondary" /> Popular Planet Classifications
                  </h3>
                  <p className="text-xs text-muted-foreground">Volume analytics grouped by exoplanet taxonomies.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {COLLECTION_STATS.map((col, idx) => (
                    <div
                      key={idx}
                      className={`rounded-2xl border ${col.border} bg-gradient-to-br ${col.color} p-4 flex justify-between items-center`}
                    >
                      <div>
                        <span className="font-mono text-[10px] text-muted-foreground uppercase">Classification</span>
                        <h4 className="font-display text-sm font-bold text-white mt-0.5">{col.name}</h4>
                        <div className="flex gap-4 mt-2 font-mono text-[10px]">
                          <div>
                            <span className="text-muted-foreground block text-[8px]">FLOOR</span>
                            <span className="text-white font-semibold">{col.floor}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[8px]">VOLUME</span>
                            <span className="text-white font-semibold">{col.volume}</span>
                          </div>
                        </div>
                      </div>
                      <div className="h-9 w-9 rounded-lg bg-black/40 flex items-center justify-center font-mono text-xs font-bold text-secondary">
                        {col.items}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TRENDING DISCOVERIES */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-400" /> Trending Discoveries
                  </h3>
                  <p className="text-xs text-muted-foreground">High rarity tokens currently generating market interest.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {EXOPLANETS_DATA.filter((p) => p.rarity === "Legendary" || p.rarity === "Epic")
                    .slice(0, 3)
                    .map((planet) => {
                      const st = tradeStatusFor(planet.id);
                      return (
                      <NFTCard
                        key={planet.id}
                        planet={planet}
                        price={getPlanetPrice(planet.id)}
                        owner={getPlanetOwner(planet.id)}
                        statusLabel={st.label}
                        canBuy={st.canBuy}
                        buyDisabledReason={st.buyDisabledReason}
                        isWatchlisted={state.watchlist.includes(planet.id)}
                        onWatchlistToggle={handleToggleWatchlist}
                        onSelect={(id) => navigateToView("detail", id)}
                        onBuy={handleBuy}
                      />
                      );
                    })}
                </div>
              </div>

              {/* TELEMETRY CATALOGUE */}
              <div className="space-y-6 pt-4 border-t border-white/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display text-lg font-bold text-white tracking-tight">Telemetry Catalogue</h3>
                    <p className="text-xs text-muted-foreground">Search and filter tokenized exoplanets from the NASA Exoplanet archive.</p>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by planet name, host star..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs font-mono text-white focus:outline-none focus:border-indigo-500 placeholder-slate-600 transition"
                      />
                    </div>
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`rounded-xl border px-3.5 py-2.5 text-xs font-mono transition flex items-center gap-1.5 ${
                        showFilters
                          ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
                          : "bg-white/5 text-muted-foreground border-white/5 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Filter className="h-4 w-4" />
                      <span>Filters</span>
                    </button>
                  </div>
                </div>

                {/* ADVANCED FILTERS */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 overflow-hidden grid grid-cols-1 md:grid-cols-4 gap-6 font-mono text-xs text-left"
                    >
                      <div className="space-y-2">
                        <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Rarity Tier</label>
                        <select
                          value={selectedRarity}
                          onChange={(e) => setSelectedRarity(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-indigo-500"
                        >
                          <option value="All">All Rarities</option>
                          <option value="Legendary">Legendary</option>
                          <option value="Epic">Epic</option>
                          <option value="Rare">Rare</option>
                          <option value="Uncommon">Uncommon</option>
                          <option value="Common">Common</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Distance Limit</label>
                          <span className="text-secondary">{distanceRange.toLocaleString()} ly</span>
                        </div>
                        <input
                          type="range" min="4" max="22000" step="100"
                          value={distanceRange} onChange={(e) => setDistanceRange(parseInt(e.target.value))}
                          className="w-full accent-secondary"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Price Limit</label>
                          <span className="text-emerald-400">{priceRange.toLocaleString()} XLM</span>
                        </div>
                        <input
                          type="range" min="100" max="3000" step="50"
                          value={priceRange} onChange={(e) => setPriceRange(parseInt(e.target.value))}
                          className="w-full accent-emerald-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Sort Parameters</label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-indigo-500"
                        >
                          <option value="rarity-desc">Rarity: High to Low</option>
                          <option value="price-asc">Price: Low to High</option>
                          <option value="price-desc">Price: High to Low</option>
                          <option value="distance-asc">Distance: Closest</option>
                          <option value="distance-desc">Distance: Furthest</option>
                          <option value="year-asc">Discovered: Oldest</option>
                          <option value="year-desc">Discovered: Newest</option>
                        </select>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* CATEGORY TAB BAR */}
                <div className="flex flex-wrap gap-2 border-b border-white/5 pb-3">
                  {[
                    { id: "all", label: "All Discoveries" },
                    { id: "terrestrial", label: "Terrestrial (Rocky)" },
                    { id: "super-earth", label: "Super-Earths" },
                    { id: "gas-giant", label: "Gas Giants" },
                    { id: "ice-giant", label: "Ice Giants" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`rounded-lg px-4 py-2 font-mono text-[10px] uppercase font-bold tracking-wider transition ${
                        selectedCategory === cat.id
                          ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                          : "text-muted-foreground border border-transparent hover:text-white"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* GRID */}
                {sortedExoplanets.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sortedExoplanets.map((planet) => {
                      const st = tradeStatusFor(planet.id);
                      return (
                      <NFTCard
                        key={planet.id}
                        planet={planet}
                        price={getPlanetPrice(planet.id)}
                        owner={getPlanetOwner(planet.id)}
                        statusLabel={st.label}
                        canBuy={st.canBuy}
                        buyDisabledReason={st.buyDisabledReason}
                        isWatchlisted={state.watchlist.includes(planet.id)}
                        onWatchlistToggle={handleToggleWatchlist}
                        onSelect={(id) => navigateToView("detail", id)}
                        onBuy={handleBuy}
                      />
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-slate-950/20 border border-white/5 rounded-2xl">
                    <p className="text-sm text-muted-foreground font-mono">No telemetry matching criteria found.</p>
                    <button
                      onClick={() => { setSearchQuery(""); setSelectedCategory("all"); setSelectedRarity("All"); setPriceRange(3000); setDistanceRange(22000); }}
                      className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-mono transition"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* DETAIL VIEW */}
          {view === "detail" && currentExoplanet && (
            <motion.div
              key="detail-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Back nav */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigateToView("home")}
                  className="rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-mono font-semibold text-muted-foreground hover:text-white transition flex items-center gap-1.5"
                >
                  <ChevronLeft className="h-4 w-4" /> Back to Catalogue
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleWatchlist(currentExoplanet.id)}
                    className="rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 p-2.5 transition"
                  >
                    <Heart
                      className={`h-4 w-4 ${state.watchlist.includes(currentExoplanet.id) ? "fill-rose-500 text-rose-500" : "text-muted-foreground"}`}
                    />
                  </button>
                  <button
                    onClick={() => { setEducatorContext("transaction"); setEducatorOpen(true); }}
                    className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/15 p-2.5 transition"
                    title="How do blockchain transactions work?"
                  >
                    <BookOpen className="h-4 w-4 text-indigo-400" />
                  </button>
                </div>
              </div>

              {/* Main Split Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* LEFT: 3D Globe + Chart */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="relative h-[380px] rounded-3xl border border-white/8 bg-gradient-to-b from-[#070b19] to-[#040816] overflow-hidden flex items-center justify-center p-6 shadow-2xl">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_0.6px,transparent_0.6px)] bg-[size:16px_16px] pointer-events-none" />
                    <Planet3DViewer
                      textureName={currentExoplanet.textureName}
                      color={currentExoplanet.color}
                      isLarge
                      className="h-72 w-72 z-10"
                    />
                    <div className="absolute border border-dashed rounded-full w-[70vw] h-[70vw] lg:w-[480px] lg:h-[480px] border-white/5 pointer-events-none animate-spin" style={{ animationDuration: "120s" }} />
                    <div className="absolute border border-dotted rounded-full w-[60vw] h-[60vw] lg:w-[400px] lg:h-[400px] border-white/5 pointer-events-none animate-spin" style={{ animationDuration: "80s" }} />
                    <div
                      className="absolute inset-0 pointer-events-none opacity-20"
                      style={{ background: `radial-gradient(circle at center, ${currentExoplanet.color}15 0%, transparent 80%)` }}
                    />
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-[9px] text-muted-foreground/80 tracking-widest uppercase bg-black/40 backdrop-blur px-3 py-1 rounded-full z-20">
                      Drag to rotate orbit · Scroll to scale
                    </div>
                  </div>

                  {/* Valuation chart */}
                  <div className="rounded-3xl border border-white/8 bg-slate-950/40 p-5 backdrop-blur-md space-y-4">
                    <div>
                      <h4 className="font-display text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                        <LineChart className="h-4 w-4 text-secondary" /> Asset Ledger Valuation
                      </h4>
                      <p className="font-mono text-[10px] text-muted-foreground">Historical pricing indexes for {currentExoplanet.name}.</p>
                    </div>
                    <div className="h-48 w-full font-mono text-[9px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={generateMockPriceHistory(getPlanetPrice(currentExoplanet.id))}>
                          <defs>
                            <linearGradient id="chartColor" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={currentExoplanet.color} stopOpacity={0.3} />
                              <stop offset="95%" stopColor={currentExoplanet.color} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                          <XAxis dataKey="date" stroke="#ffffff40" />
                          <YAxis stroke="#ffffff40" />
                          <Tooltip contentStyle={{ backgroundColor: "#070b19", borderColor: "rgba(255,255,255,0.1)" }} labelStyle={{ color: "#ffffff" }} />
                          <Area type="monotone" dataKey="price" stroke={currentExoplanet.color} fillOpacity={1} fill="url(#chartColor)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="rounded-3xl border border-white/8 bg-slate-950/40 p-6 space-y-3 text-left">
                    <h4 className="font-display text-sm font-bold text-white tracking-tight">Telemetry Mission Archives</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{currentExoplanet.description}</p>
                    <p className="text-[11px] text-indigo-300 font-mono">
                      Data derived from NASA Exoplanet Science Institute Archive.
                    </p>
                  </div>
                </div>

                {/* RIGHT: Action Console */}
                <div className="lg:col-span-5 space-y-6 text-left">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="rounded-full px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest"
                        style={{ backgroundColor: `${currentExoplanet.color}15`, color: currentExoplanet.color, border: `1px solid ${currentExoplanet.color}25` }}
                      >
                        {currentExoplanet.rarity} Discovery
                      </span>
                      <span className="rounded-full bg-white/5 border border-white/10 text-muted-foreground px-2 py-0.5 font-mono text-[9px]">
                        Discovered: {currentExoplanet.discoveryYear}
                      </span>
                      {currentExoplanet.verificationBadge && (
                        <span className="flex items-center gap-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 font-mono text-[8px] text-indigo-300 font-bold uppercase">
                          <BadgeCheck className="h-3 w-3 text-indigo-400" /> NASA Archive Verified
                        </span>
                      )}
                    </div>
                    <h1 className="font-display text-3xl font-extrabold text-white">{currentExoplanet.name}</h1>
                    <p className="font-mono text-xs text-muted-foreground">Host Star Sector: <span className="text-white font-bold">{currentExoplanet.hostStar}</span></p>
                  </div>

                  {/* TRADING ACTION CONSOLE */}
                  <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 space-y-5">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                      <div>
                        <span className="font-mono text-[9px] text-muted-foreground uppercase">Current Index Price</span>
                        <div className="font-display text-2xl font-black text-white mt-1">
                          {getPlanetPrice(currentExoplanet.id).toLocaleString()} <span className="text-xs text-secondary font-bold">XLM</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-[9px] text-muted-foreground uppercase">Owner Registry</span>
                        <div className="font-mono text-xs text-indigo-300 font-semibold mt-1">
                          {(() => {
                            const st = tradeStatusFor(currentExoplanet.id);
                            if (st.isOwnedByMe) return "Commander (YOU)";
                            if (st.kind === "not_registered") return "Not registered";
                            if (st.kind === "not_minted") return "Not minted";
                            if (st.owner) return `${st.owner.slice(0, 8)}...${st.owner.slice(-4)}`;
                            return "—";
                          })()}
                        </div>
                        <div className="font-mono text-[9px] text-amber-300/90 mt-1">
                          {tradeStatusFor(currentExoplanet.id).label}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 font-mono text-xs">
                      {!state.walletConnected ? (
                        <div className="text-center py-4 space-y-3">
                          <p className="text-[10px] text-muted-foreground">Connect Freighter to trade this asset on Stellar ledger.</p>
                          <button
                            onClick={handleConnectWallet}
                            className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 font-sans font-bold text-white shadow-lg transition hover:opacity-90"
                          >
                            Connect Freighter Wallet
                          </button>
                          <button
                            onClick={() => { setEducatorContext("wallet-connect"); setEducatorOpen(true); }}
                            className="w-full rounded-xl border border-white/5 bg-white/5 py-2 font-mono text-[10px] text-muted-foreground hover:text-white transition"
                          >
                            <BookOpen className="h-3 w-3 inline mr-1.5" /> What is wallet connection?
                          </button>
                        </div>
                      ) : tradeStatusFor(currentExoplanet.id).isOwnedByMe ? (
                            <div className="space-y-4">
                              <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-emerald-400" />
                                <span className="text-[10px] text-emerald-400 font-bold">
                                  You already own this asset.
                                  {tradeStatusFor(currentExoplanet.id).isListed ? " Listed by you." : ""}
                                </span>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] text-muted-foreground uppercase block font-bold">
                                  {tradeStatusFor(currentExoplanet.id).isListed ? "Adjust Listing Price" : "List on Open Marketplace"}
                                </label>
                                <div className="flex gap-2">
                                  <div className="relative flex-1">
                                    <input
                                      type="number" value={listPriceInput} onChange={(e) => setListPriceInput(e.target.value)}
                                      placeholder="List Price (XLM)"
                                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white placeholder-slate-600 focus:outline-none"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[10px]">XLM</span>
                                  </div>
                                  <button
                                    onClick={() => handleList(currentExoplanet.id)}
                                    disabled={txPending}
                                    className="rounded-xl bg-white text-slate-950 font-sans font-semibold px-4 py-2 hover:bg-slate-200 transition disabled:opacity-40"
                                  >
                                    Publish
                                  </button>
                                </div>
                              </div>
                              {tradeStatusFor(currentExoplanet.id).isListed && (
                                <button
                                  onClick={() => handleDelist(currentExoplanet.id)}
                                  disabled={txPending}
                                  className="w-full rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 py-2.5 font-sans font-semibold text-red-400 transition flex items-center justify-center gap-1.5 disabled:opacity-40"
                                >
                                  <Trash2 className="h-4 w-4" /> Cancel Listing (Delist)
                                </button>
                              )}
                              <div className="space-y-2 border-t border-white/5 pt-3 mt-1">
                                <label className="text-[10px] text-muted-foreground uppercase block font-bold">Transfer Asset Ledger Registry</label>
                                <div className="flex gap-2">
                                  <input
                                    type="text" value={transferAddressInput} onChange={(e) => setTransferAddressInput(e.target.value)}
                                    placeholder="Recipient Stellar Address (G...)"
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white placeholder-slate-600 focus:outline-none text-[10px]"
                                  />
                                  <button
                                    onClick={() => handleTransfer(currentExoplanet.id)}
                                    disabled={txPending}
                                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-sans font-semibold text-white hover:bg-white/10 transition flex items-center gap-1 disabled:opacity-40"
                                  >
                                    <Send className="h-3 w-3" /> Send
                                  </button>
                                </div>
                              </div>
                            </div>
                      ) : (
                            <div className="space-y-4">
                              {tradeStatusFor(currentExoplanet.id).canBuy ? (
                                <button
                                  onClick={() => handleBuy(currentExoplanet.id)}
                                  disabled={txPending}
                                  className="w-full rounded-xl bg-gradient-to-r from-secondary to-indigo-500 py-3 font-sans font-bold text-slate-950 hover:text-white transition shadow-lg flex items-center justify-center gap-1.5 disabled:opacity-40"
                                >
                                  Buy Exoplanet Token Now ({getPlanetPrice(currentExoplanet.id).toLocaleString()} XLM)
                                </button>
                              ) : (
                                <div className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 text-center text-[11px] text-muted-foreground font-sans font-semibold">
                                  {tradeStatusFor(currentExoplanet.id).buyDisabledReason ?? tradeStatusFor(currentExoplanet.id).label}
                                </div>
                              )}
                              {tradeStatusFor(currentExoplanet.id).canOffer ? (
                              <div className="space-y-2">
                                <label className="text-[10px] text-muted-foreground uppercase block font-bold">Submit Buy Offer</label>
                                <div className="flex gap-2">
                                  <div className="relative flex-1">
                                    <input
                                      type="number" value={bidPriceInput} onChange={(e) => setBidPriceInput(e.target.value)}
                                      placeholder="Offer price (XLM)"
                                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white placeholder-slate-600 focus:outline-none"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[10px]">XLM</span>
                                  </div>
                                  <button
                                    onClick={() => handleMakeOffer(currentExoplanet.id)}
                                    disabled={txPending}
                                    className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 font-sans font-semibold text-indigo-400 hover:bg-indigo-500/20 transition disabled:opacity-40"
                                  >
                                    Submit
                                  </button>
                                </div>
                              </div>
                              ) : (
                                !tradeStatusFor(currentExoplanet.id).isOwnedByMe && (
                                  <p className="font-mono text-[10px] text-muted-foreground text-center">
                                    {tradeStatusFor(currentExoplanet.id).offerDisabledReason}
                                  </p>
                                )
                              )}
                              <p className="text-[9px] text-muted-foreground leading-relaxed">
                                {tradeStatusFor(currentExoplanet.id).detail}
                              </p>
                            </div>
                      )}
                    </div>
                  </div>

                  {/* SCIENTIFIC PARAMS */}
                  <div className="rounded-3xl border border-white/8 bg-slate-950/40 p-5 space-y-4">
                    <h4 className="font-display text-sm font-bold text-white tracking-tight">Stellar Telemetry Metrics</h4>
                    <div className="grid grid-cols-2 gap-4 font-mono text-[11px] text-muted-foreground">
                      {[
                        ["Distance", `${currentExoplanet.distance.toLocaleString()} ly`],
                        ["Host Star", currentExoplanet.hostStar],
                        ["Radius", `${currentExoplanet.radius} ${currentExoplanet.radiusUnit}`],
                        ["Mass", `${currentExoplanet.mass} ${currentExoplanet.massUnit}`],
                        ["Temperature", `${currentExoplanet.temperature} K`],
                        ["Orbital Period", `${currentExoplanet.orbitalPeriod} days`],
                        ["Eccentricity", `${currentExoplanet.eccentricity}`],
                        ["Gravity", currentExoplanet.type === "Gas Giant" ? "2.4g" : "1.2g"],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between border-b border-white/5 pb-1.5">
                          <span>{label}:</span>
                          <span className="text-white font-bold">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* OFFERS BOARD */}
                  <div className="rounded-3xl border border-white/8 bg-slate-950/40 p-5 space-y-4">
                    <h4 className="font-display text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                      <Coins className="h-4 w-4 text-accent" /> Active Ledger Offers
                    </h4>
                    {market.offers.filter((o) => o.planetId === currentExoplanet.id).length > 0 ? (
                      <div className="space-y-2 max-h-[160px] overflow-y-auto font-mono text-[10px]">
                        {market.offers.filter((o) => o.planetId === currentExoplanet.id).map((offer) => (
                          <div key={offer.id} className="flex justify-between items-center bg-white/[0.01] border border-white/5 rounded-xl p-2.5">
                            <div>
                              <span className="text-white font-bold block">{offer.price.toLocaleString()} XLM</span>
                              <span className="text-muted-foreground">Bidder: {offer.bidderName} ({offer.bidder.slice(0, 6)}...)</span>
                            </div>
                            {getPlanetOwner(currentExoplanet.id) === "YOU" && (
                              <div className="flex gap-1.5">
                                <button onClick={() => handleAcceptOffer(offer.id)} className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30 transition text-[9px]">Accept</button>
                                <button onClick={() => handleRejectOffer(offer.id)} className="px-2.5 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition text-[9px]">Decline</button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 border border-dashed border-white/5 rounded-xl font-mono text-[10px] text-muted-foreground">
                        No active offers on ledger.
                      </div>
                    )}
                  </div>

                  {/* TRANSACTION LOGS */}
                  <div className="rounded-3xl border border-white/8 bg-slate-950/40 p-5 space-y-4">
                    <h4 className="font-display text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                      <History className="h-4 w-4 text-indigo-400" /> Consensus Ledger Logs
                    </h4>
                    <div className="space-y-2 max-h-[220px] overflow-y-auto font-mono text-[9px]">
                      {state.transactions.filter((tx) => tx.planetId === currentExoplanet.id).map((tx) => (
                        <div key={tx.id} className="border-b border-white/5 pb-2.5 space-y-1">
                          <div className="flex justify-between font-bold">
                            <span className="text-indigo-300">{tx.type} operation</span>
                            <span className="text-white">{new Date(tx.timestamp).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>From: <span className="text-white/85">{tx.from === "YOU" ? "YOU" : tx.from.slice(0, 10)}...</span></span>
                            <span>To: <span className="text-white/85">{tx.to === "YOU" ? "YOU" : tx.to.slice(0, 10)}...</span></span>
                          </div>
                          {tx.price && <div className="text-emerald-400">Amount: {tx.price.toLocaleString()} XLM</div>}
                          <div className="text-muted-foreground text-[8px] flex items-center justify-between gap-2">
                            {liveMode && /^[0-9a-f]{64}$/i.test(tx.txHash) ? (
                              <a
                                href={explorerTxUrl(tx.txHash)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-400 underline hover:text-indigo-300"
                              >
                                Hash: {tx.txHash.slice(0, 20)}... ↗
                              </a>
                            ) : (
                              <span>Hash: {tx.txHash.slice(0, 20)}...</span>
                            )}
                            <span className="text-indigo-400 border border-indigo-500/20 px-1 rounded bg-indigo-500/5">Ledger: #{tx.ledger}</span>
                          </div>
                        </div>
                      ))}
                      {state.transactions.filter((tx) => tx.planetId === currentExoplanet.id).length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">No historical ledger events.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* DASHBOARD / PORTFOLIO VIEW */}
          {view === "dashboard" && (
            <motion.div
              key="dashboard-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left"
            >
              {/* LEFT COLUMN */}
              <div className="lg:col-span-4 space-y-6">

                {/* Profile Card */}
                <div className="rounded-3xl border border-white/8 bg-gradient-to-b from-slate-900 to-[#040816] p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-4xl shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                      {state.profile.avatar}
                    </div>
                    <div>
                      <span className="font-mono text-[9px] text-indigo-400 font-bold uppercase tracking-wider block">CosmosX Registry</span>
                      <h3 className="font-display text-lg font-bold text-white">{state.profile.name}</h3>
                      <p className="font-mono text-[10px] text-muted-foreground">{state.profile.title}</p>
                    </div>
                  </div>
                  <p className="font-sans text-xs text-muted-foreground leading-relaxed italic bg-white/[0.01] border border-white/5 rounded-xl p-3">
                    "{state.profile.bio}"
                  </p>
                  {isEditingProfile ? (
                    <div className="space-y-3 pt-3 border-t border-white/5 font-mono text-[11px] text-left">
                      {[
                        { label: "Commander Name", key: "name", value: profileName, setter: setProfileName, default: state.profile.name, type: "text" },
                        { label: "Title Rank", key: "title", value: profileTitle, setter: setProfileTitle, default: state.profile.title, type: "text" },
                        { label: "Avatar Emoji", key: "avatar", value: profileAvatar, setter: setProfileAvatar, default: state.profile.avatar, type: "text" },
                      ].map(({ label, key, value, setter, default: def }) => (
                        <div className="space-y-1" key={key}>
                          <label className="text-muted-foreground block text-[9px]">{label}</label>
                          <input type="text" defaultValue={def} onChange={(e) => setter(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white" />
                        </div>
                      ))}
                      <div className="space-y-1">
                        <label className="text-muted-foreground block text-[9px]">Bio</label>
                        <textarea defaultValue={state.profile.bio} onChange={(e) => setProfileBio(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white h-16 resize-none" />
                      </div>
                      <div className="flex gap-2 pt-1.5">
                        <button onClick={handleSaveProfile} className="flex-1 bg-white text-slate-950 font-sans font-bold py-2 rounded-lg text-xs">Save</button>
                        <button onClick={() => setIsEditingProfile(false)} className="flex-1 border border-white/10 hover:bg-white/5 text-white py-2 rounded-lg text-xs font-sans">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setProfileName(state.profile.name); setProfileTitle(state.profile.title); setProfileBio(state.profile.bio); setProfileAvatar(state.profile.avatar); setIsEditingProfile(true); }}
                      className="w-full rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-2 font-mono text-[10px] text-white transition"
                    >
                      Update Profile Telemetry
                    </button>
                  )}
                </div>

                {/* Wallet Balance */}
                <div className="rounded-3xl border border-white/8 bg-slate-950/40 p-6 space-y-4 backdrop-blur-md">
                  <div>
                    <h4 className="font-display text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                      <Wallet className="h-4 w-4 text-secondary" /> Freighter Ledger Balance
                    </h4>
                    <p className="font-mono text-[10px] text-muted-foreground">Connected address on Stellar Horizon network.</p>
                  </div>
                  <div className="space-y-2 rounded-xl border border-white/5 bg-white/[0.01] p-4 text-left">
                    <span className="font-mono text-[9px] text-muted-foreground uppercase">
                      Ledger Balance {liveMode ? "(live · Horizon)" : "(dev credit)"}
                    </span>
                    <div className="font-display text-2xl font-black text-white">
                      {liveMode && balance.loading && balance.status !== "ok" ? (
                        <span className="text-muted-foreground">Loading…</span>
                      ) : liveMode && balance.status === "error" ? (
                        <span className="text-amber-400 text-base">Balance unavailable</span>
                      ) : (
                        <>
                          {formatXlm(displayBalance)} <span className="text-xs text-secondary font-bold">XLM</span>
                        </>
                      )}
                    </div>
                    {liveMode && balance.status === "unfunded" && (
                      <p className="font-mono text-[9px] text-amber-400/90 leading-tight">
                        Account not funded yet. Get free Testnet XLM from the{" "}
                        <a
                          href="https://lab.stellar.org/account/fund"
                          target="_blank"
                          rel="noreferrer"
                          className="underline text-amber-300"
                        >
                          Stellar friendbot
                        </a>
                        .
                      </p>
                    )}
                    {liveMode && balance.status === "error" && (
                      <p className="font-mono text-[9px] text-amber-400/90 leading-tight">
                        Could not reach Horizon. {balance.error}
                      </p>
                    )}
                    {state.walletAddress && (
                      <div className="pt-2 border-t border-white/5 mt-2 font-mono text-[9px] text-indigo-300 break-all select-all leading-tight">
                        Address: <span className="text-white font-bold">{state.walletAddress}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {state.walletConnected ? (
                      <button onClick={handleDisconnectWallet} className="w-full py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-mono transition">
                        Disconnect Wallet
                      </button>
                    ) : (
                      <button onClick={handleConnectWallet} className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-600 font-sans font-bold text-white rounded-xl text-xs transition">
                        Connect Wallet
                      </button>
                    )}
                  </div>
                </div>

                {/* Portfolio Analytics */}
                <div className="rounded-3xl border border-white/8 bg-slate-950/40 p-6 space-y-4 backdrop-blur-md text-left font-mono">
                  <div>
                    <h4 className="font-display text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                      <LineChart className="h-4 w-4 text-indigo-400" /> Live Marketplace Stats
                    </h4>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {liveMode && chain.ready
                        ? `On-chain · last sync ${chain.syncedAt ? new Date(chain.syncedAt).toLocaleTimeString() : "—"}`
                        : liveMode
                          ? "Local fallback (RPC sync pending or failed)"
                          : "Dev stub mode"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    {[
                      { label: "Registered", value: liveStats.registered },
                      { label: "Minted", value: liveStats.minted },
                      { label: "Active listings", value: liveStats.listed },
                      { label: "Owned by you", value: liveStats.ownedByMe },
                      { label: "Your listings", value: liveStats.myListings },
                      { label: "Offers made", value: liveStats.offersMade },
                      { label: "Offers received", value: liveStats.offersReceived },
                      { label: "Floor", value: liveStats.floor != null ? `${liveStats.floor.toLocaleString()} XLM` : "—" },
                      { label: "Highest ask", value: liveStats.highest != null ? `${liveStats.highest.toLocaleString()} XLM` : "—" },
                      { label: "XLM balance", value: formatXlm(displayBalance) },
                      { label: "Purchases (local log)", value: liveStats.purchases },
                      { label: "Contract health", value: liveMode && chain.ready ? "OK" : liveMode ? "Degraded" : "Stub" },
                      { label: "Role", value: chain.isAdmin ? "Administrator" : "Trader" },
                      { label: "Network", value: STELLAR_NETWORK || "TESTNET" },
                    ].map((row) => (
                      <div key={row.label} className="border border-white/5 rounded-lg px-2 py-1.5 bg-white/[0.01]">
                        <div className="text-muted-foreground text-[8px] uppercase">{row.label}</div>
                        <div className="text-white font-bold mt-0.5">{row.value}</div>
                      </div>
                    ))}
                  </div>
                  {liveMode && (
                    <div className="space-y-1 text-[8px] text-muted-foreground leading-relaxed">
                      <p>
                        Total marketplace volume is not stored on-chain yet (no volume accumulator in the contract).
                      </p>
                      <p>
                        Contract:{" "}
                        {MARKETPLACE_CONTRACT_ID ? (
                          <a
                            href={explorerContractUrl(MARKETPLACE_CONTRACT_ID)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline text-indigo-300"
                          >
                            {MARKETPLACE_CONTRACT_ID.slice(0, 12)}…↗
                          </a>
                        ) : (
                          "—"
                        )}{" "}
                        · RPC: {STELLAR_RPC_URL.replace("https://", "").slice(0, 28)}…
                        {chain.syncedAt ? ` · Synced ${new Date(chain.syncedAt).toLocaleString()}` : ""}
                      </p>
                      {chain.error && (
                        <p className="text-amber-400/90">Sync note: {chain.error}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Portfolio Analytics chart (existing) */}
                <div className="rounded-3xl border border-white/8 bg-slate-950/40 p-6 space-y-4 backdrop-blur-md text-left font-mono">
                  <div>
                    <h4 className="font-display text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                      <LineChart className="h-4 w-4 text-emerald-400" /> Portfolio Analytics
                    </h4>
                    <p className="text-[10px] text-muted-foreground">Net valuation of user-owned exoplanet assets.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {[
                      { label: "Portfolio Value", value: `${(getPortfolioValuation(market) - market.walletBalance + displayBalance).toLocaleString()} XLM`, color: "text-white" },
                      { label: "Planets Owned", value: `${market.ownedPlanets.length}`, color: "text-indigo-400" },
                      { label: "Active Listings", value: `${market.listings.filter((l) => market.ownedPlanets.includes(l.planetId)).length}`, color: "text-amber-400" },
                      { label: "Commander XP", value: `${learningState?.xp || 0} XP`, color: "text-emerald-400" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="bg-white/[0.01] border border-white/5 rounded-xl p-3">
                        <span className="text-[8px] text-muted-foreground block uppercase">{label}</span>
                        <span className={`text-sm font-extrabold block mt-0.5 ${color}`}>{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="h-28 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={PORTFOLIO_HISTORY}>
                        <XAxis dataKey="day" stroke="#ffffff20" hide />
                        <YAxis hide />
                        <Area type="monotone" dataKey="value" stroke="#00D8FF" fill="rgba(0, 216, 255, 0.08)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Inventory Tabs */}
              <div className="lg:col-span-8 space-y-6">
                {/* Notifications */}
                {state.notifications.some((n) => !n.read) && (
                  <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-4 flex items-center justify-between gap-4 font-mono text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <Bell className="h-4 w-4 text-indigo-400 animate-bounce" />
                        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400" />
                      </div>
                      <div>
                        <span className="text-white font-bold">Unread Ledger Updates:</span>
                        <p className="text-[10px] text-indigo-300 mt-0.5">{state.notifications.filter((n) => !n.read)[0].message}</p>
                      </div>
                    </div>
                    <button onClick={handleMarkRead} className="shrink-0 px-3 py-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/35 transition text-[10px]">
                      Clear All
                    </button>
                  </div>
                )}

                <div className="rounded-3xl border border-white/8 bg-slate-950/40 p-6 backdrop-blur-md space-y-6">
                  {/* Nav tabs */}
                  <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4 text-xs font-mono font-bold uppercase tracking-wider">
                    {[
                      { id: "owned", label: "Inventory Planets", icon: Globe, count: market.ownedPlanets.length },
                      { id: "listed", label: "Your Listings", icon: Coins, count: market.listings.filter((l) => market.ownedPlanets.includes(l.planetId)).length },
                      { id: "offers", label: "Received Offers", icon: Award, count: market.offers.filter((o) => market.ownedPlanets.includes(o.planetId)).length },
                      { id: "watchlist", label: "Watchlist", icon: Heart, count: state.watchlist.length },
                      { id: "history", label: "Transaction Logs", icon: History, count: 0 },
                      { id: "certs", label: "Research Badges", icon: Trophy, count: 0 },
                      ...(chain.isAdmin
                        ? [{ id: "admin", label: "Admin", icon: Shield, count: 0 }]
                        : []),
                    ].map(({ id, label, icon: Icon, count }) => (
                      <button
                        key={id}
                        onClick={() => { const el = document.getElementById(`subtab_${id}`); el?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }}
                        className="flex items-center gap-1.5 px-3 py-2 border border-white/5 bg-white/5 rounded-xl hover:text-white transition text-muted-foreground hover:bg-white/10 text-[10px]"
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span>{label}</span>
                        {count > 0 && <span className="bg-indigo-500 text-white text-[8px] font-extrabold rounded-full px-1.5">{count}</span>}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-12">
                    {/* OWNED */}
                    <div id="subtab_owned" className="space-y-4 text-left scroll-mt-6">
                      <div className="border-b border-white/5 pb-2">
                        <h4 className="font-display text-sm font-bold text-white flex items-center gap-1.5">
                          <Globe className="h-4 w-4 text-secondary" /> Owned Exoplanets ({market.ownedPlanets.length})
                        </h4>
                        <p className="text-[10px] text-muted-foreground font-mono">Tokenized planet assets verified under your signature.</p>
                      </div>
                      {market.ownedPlanets.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {EXOPLANETS_DATA.filter((p) => market.ownedPlanets.includes(p.id)).map((planet) => (
                            <NFTCard
                              key={planet.id} planet={planet} price={getPlanetPrice(planet.id)} owner="YOU"
                              isWatchlisted={state.watchlist.includes(planet.id)} onWatchlistToggle={handleToggleWatchlist}
                              onSelect={(id) => navigateToView("detail", id)}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10 border border-dashed border-white/5 rounded-2xl font-mono text-[11px] text-muted-foreground space-y-3">
                          <p>Your exoplanet cargo hold is currently empty.</p>
                          <button onClick={() => navigateToView("home")} className="px-4 py-2 bg-white text-slate-950 rounded-xl text-xs font-sans font-bold">
                            Explore Telescope Catalog
                          </button>
                        </div>
                      )}
                    </div>

                    {/* LISTED */}
                    <div id="subtab_listed" className="space-y-4 text-left scroll-mt-6">
                      <div className="border-b border-white/5 pb-2">
                        <h4 className="font-display text-sm font-bold text-white flex items-center gap-1.5">
                          <Coins className="h-4 w-4 text-amber-400" /> Active Market Listings
                        </h4>
                        <p className="text-[10px] text-muted-foreground font-mono">Assets published to secondary trading ledger.</p>
                      </div>
                      {market.listings.filter((l) => market.ownedPlanets.includes(l.planetId)).length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {EXOPLANETS_DATA.filter((p) => market.ownedPlanets.includes(p.id) && market.listings.some((l) => l.planetId === p.id)).map((planet) => (
                            <NFTCard
                              key={planet.id} planet={planet} price={getPlanetPrice(planet.id)} owner="YOU"
                              isWatchlisted={state.watchlist.includes(planet.id)} onWatchlistToggle={handleToggleWatchlist}
                              onSelect={(id) => navigateToView("detail", id)}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 border border-dashed border-white/5 rounded-2xl font-mono text-[10px] text-muted-foreground">
                          No active listings. Open a planet detail page to publish.
                        </div>
                      )}
                    </div>

                    {/* OFFERS RECEIVED */}
                    <div id="subtab_offers" className="space-y-4 text-left scroll-mt-6">
                      <div className="border-b border-white/5 pb-2">
                        <h4 className="font-display text-sm font-bold text-white flex items-center gap-1.5">
                          <Award className="h-4 w-4 text-accent" /> Bids & Offers Received
                        </h4>
                        <p className="text-[10px] text-muted-foreground font-mono">Bids submitted by other commanders on your owned exoplanets.</p>
                      </div>
                      {market.offers.filter((o) => market.ownedPlanets.includes(o.planetId)).length > 0 ? (
                        <div className="space-y-3 font-mono text-xs">
                          {market.offers.filter((o) => market.ownedPlanets.includes(o.planetId)).map((offer) => {
                            const planet = EXOPLANETS_DATA.find((p) => p.id === offer.planetId);
                            return (
                              <div key={offer.id} className="flex justify-between items-center border border-white/5 bg-white/[0.01] rounded-2xl p-4">
                                <div className="space-y-1">
                                  <span className="text-indigo-400 font-bold block">{planet?.name}</span>
                                  <span className="text-white text-sm font-bold block">{offer.price.toLocaleString()} XLM</span>
                                  <span className="text-[9px] text-muted-foreground">Bidder: {offer.bidderName}</span>
                                </div>
                                <div className="flex gap-2">
                                  <button onClick={() => handleAcceptOffer(offer.id)} className="px-3.5 py-2 bg-emerald-500 text-slate-950 font-sans font-bold rounded-xl text-xs hover:bg-emerald-400 transition">Accept Offer</button>
                                  <button onClick={() => handleRejectOffer(offer.id)} className="px-3 py-2 border border-white/10 hover:bg-white/5 text-white font-sans font-semibold rounded-xl text-xs transition">Decline</button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 border border-dashed border-white/5 rounded-2xl font-mono text-[10px] text-muted-foreground">No offers received.</div>
                      )}
                    </div>

                    {/* WATCHLIST */}
                    <div id="subtab_watchlist" className="space-y-4 text-left scroll-mt-6">
                      <div className="border-b border-white/5 pb-2">
                        <h4 className="font-display text-sm font-bold text-white flex items-center gap-1.5">
                          <Heart className="h-4 w-4 text-rose-500" /> Watchlisted Discoveries ({state.watchlist.length})
                        </h4>
                      </div>
                      {state.watchlist.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {EXOPLANETS_DATA.filter((p) => state.watchlist.includes(p.id)).map((planet) => (
                            <NFTCard
                              key={planet.id} planet={planet} price={getPlanetPrice(planet.id)} owner={getPlanetOwner(planet.id)}
                              statusLabel={tradeStatusFor(planet.id).label}
                              canBuy={tradeStatusFor(planet.id).canBuy}
                              buyDisabledReason={tradeStatusFor(planet.id).buyDisabledReason}
                              isWatchlisted={true} onWatchlistToggle={handleToggleWatchlist}
                              onSelect={(id) => navigateToView("detail", id)} onBuy={handleBuy}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 border border-dashed border-white/5 rounded-2xl font-mono text-[10px] text-muted-foreground">Watchlist is empty.</div>
                      )}
                    </div>

                    {/* TRANSACTION HISTORY */}
                    <div id="subtab_history" className="space-y-4 text-left scroll-mt-6">
                      <div className="border-b border-white/5 pb-2">
                        <h4 className="font-display text-sm font-bold text-white flex items-center gap-1.5">
                          <History className="h-4 w-4 text-indigo-400" /> Ledger Transaction Logs
                        </h4>
                        <p className="text-[10px] text-muted-foreground font-mono">Verifiable cryptographic events on Stellar Testnet consensus chain.</p>
                      </div>
                      <div className="space-y-3 font-mono text-[10px]">
                        {state.transactions.map((tx) => (
                          <div key={tx.id} className="border border-white/5 bg-white/[0.01] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-indigo-400 font-bold uppercase">{tx.type} OPERATION</span>
                                <span className="text-white font-bold">{tx.planetName}</span>
                                <span className="text-[8px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-1.5 rounded">Ledger #{tx.ledger}</span>
                              </div>
                              <div className="text-muted-foreground text-[9px] space-y-0.5">
                                <div>From: <span className="text-white/80">{tx.from === "YOU" ? "YOU" : tx.from}</span></div>
                                <div>To: <span className="text-white/80">{tx.to === "YOU" ? "YOU" : tx.to}</span></div>
                              </div>
                              <div className="text-muted-foreground text-[8px] select-all">
                                {liveMode && /^[0-9a-f]{64}$/i.test(tx.txHash) ? (
                                  <a
                                    href={explorerTxUrl(tx.txHash)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-400 underline hover:text-indigo-300"
                                  >
                                    Hash: {tx.txHash} ↗
                                  </a>
                                ) : (
                                  <>Hash: {tx.txHash}</>
                                )}
                              </div>
                            </div>
                            <div className="text-left md:text-right shrink-0">
                              {tx.price && <div className="text-emerald-400 font-black text-sm">{tx.price.toLocaleString()} XLM</div>}
                              <span className="text-[9px] text-muted-foreground">{new Date(tx.timestamp).toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                        {state.transactions.length === 0 && (
                          <div className="text-center py-8 border border-dashed border-white/5 rounded-2xl text-muted-foreground">No ledger history found.</div>
                        )}
                      </div>
                    </div>

                    {/* RESEARCH BADGES */}
                    <div id="subtab_certs" className="space-y-4 text-left scroll-mt-6">
                      <div className="border-b border-white/5 pb-2">
                        <h4 className="font-display text-sm font-bold text-white flex items-center gap-1.5">
                          <Trophy className="h-4 w-4 text-accent" /> Unlocked Exploration Badges
                        </h4>
                        <p className="text-[10px] text-muted-foreground font-mono">Academic achievements synced from CosmosX curriculum.</p>
                      </div>
                      {learningState && learningState.earnedBadgeIds.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                          {learningState.earnedBadgeIds.map((badgeId) => {
                            const badge = [
                              { id: "first_block", name: "First Block", desc: "Complete Module 01 on Mercury", icon: "🏅" },
                              { id: "hash_cracker", name: "Hash Cracker", desc: "Solve all Venus challenges", icon: "🔐" },
                              { id: "consensus_king", name: "Consensus King", desc: "Complete Earth simulator", icon: "⚡" },
                              { id: "mercury_graduate", name: "Mercury Graduate", desc: "Complete escape room", icon: "🎓" },
                            ].find((b) => b.id === badgeId);
                            if (!badge) return null;
                            return (
                              <div key={badgeId} className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 flex flex-col items-center text-center space-y-2 shadow-[0_0_15px_rgba(245,158,11,0.08)]">
                                <span className="text-3xl">{badge.icon}</span>
                                <div>
                                  <h5 className="font-display text-xs font-bold text-white leading-snug">{badge.name}</h5>
                                  <p className="font-sans text-[9px] text-muted-foreground mt-0.5 leading-snug">{badge.desc}</p>
                                </div>
                                <span className="text-[8px] font-mono text-emerald-400 font-bold border border-emerald-500/20 bg-emerald-500/10 px-1.5 rounded uppercase">Sync Success</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 border border-dashed border-white/5 rounded-2xl font-mono text-[10px] text-muted-foreground">
                          No badges synced. Complete curriculum chapters to earn certificates.
                        </div>
                      )}
                    </div>

                    {chain.isAdmin && wallet.address && (
                      <div id="subtab_admin" className="space-y-4 text-left scroll-mt-6">
                        <AdminPanel
                          walletAddress={wallet.address}
                          adminAddress={chain.admin}
                          registeredIds={chain.registeredIds}
                          mintedIds={chain.mintedIds}
                          ownedPlanets={market.ownedPlanets}
                          listings={market.listings}
                          owners={chain.owners}
                          syncedAt={chain.syncedAt}
                          chainStatus={
                            chain.ready ? "live" : chain.loading ? "syncing" : chain.status
                          }
                          txPending={txPending}
                          onBusy={setTxPending}
                          onRefresh={chain.refresh}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-white/8 bg-slate-950/60 py-6 text-center z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
            StellarVerse Central Ledger · NASA Exoplanet Asset Registry · Stellar Testnet
          </p>
          <div className="flex gap-4 font-mono text-[9px] text-muted-foreground uppercase">
            <a href="https://stellar.expert/explorer/testnet" target="_blank" rel="noreferrer" className="hover:text-white cursor-pointer transition">Ledger Explorer</a>
            <a href="https://developers.stellar.org/docs" target="_blank" rel="noreferrer" className="hover:text-white cursor-pointer transition">Stellar Docs</a>
            <button onClick={() => { setEducatorContext("keys"); setEducatorOpen(true); }} className="hover:text-white cursor-pointer transition">
              Key Concepts
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  ArrowUpDown,
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
  BookOpen,
  Trophy,
  Award,
  ChevronRight,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Coins,
  Shield,
  Activity,
  CheckCircle,
  HelpCircle,
} from "lucide-react";

import { EXOPLANETS_DATA, type ExoplanetAsset, type ExoplanetRarity, type ExoplanetType } from "@/lib/exoplanets-data";
import {
  getMarketplaceState,
  saveMarketplaceState,
  connectFreighterWallet,
  disconnectFreighterWallet,
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
  type PlanetListing,
  type MarketplaceState,
} from "@/lib/marketplace-store";
import { getUserState, type UserState } from "@/lib/user-store";
import Planet3DViewer from "@/components/Planet3DViewer";
import FreighterSimulator from "@/components/FreighterSimulator";
import NFTCard from "@/components/NFTCard";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
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
    const variation = (Math.random() - 0.45) * 0.15; // Random variation with upward bias
    data.push({
      date: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      price: Math.round(initialPrice * (1 + variation)),
    });
  }
  return data;
}

// Mock Global Portfolio Value generator
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

  // Modal / Transaction Simulator State
  const [freighterOpen, setFreighterOpen] = useState(false);
  const [pendingTx, setPendingTx] = useState<{
    type: "Purchase" | "List" | "Delist" | "Offer" | "Transfer" | "Accept Offer";
    planetName: string;
    price?: number;
    destination?: string;
    callback: () => void;
  } | null>(null);

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

  // Sync state on mount and update URL search query listener
  useEffect(() => {
    setState(getMarketplaceState());
    setLearningState(getUserState());

    // Parse URL params for deep-linking
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

  // Update query params when navigation state changes
  const navigateToView = (targetView: "home" | "detail" | "dashboard", id: string | null = null) => {
    setView(targetView);
    setSelectedPlanetId(id);

    const params = new URLSearchParams();
    params.set("view", targetView);
    if (id) params.set("id", id);
    
    // Smooth scroll back to top on view changes
    window.scrollTo({ top: 0, behavior: "smooth" });

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);
  };

  // Helper to trigger Freighter Modal Signatures
  const queueTransaction = (
    type: "Purchase" | "List" | "Delist" | "Offer" | "Transfer" | "Accept Offer",
    planetName: string,
    price: number | undefined,
    destination: string | undefined,
    callback: () => void
  ) => {
    if (!state.walletConnected) {
      toast.error("Freighter wallet is not connected! Please connect in the trading panel or navigation HUD.");
      return;
    }
    
    setPendingTx({ type, planetName, price, destination, callback });
    setFreighterOpen(true);
  };

  const handleApprovePendingTx = () => {
    if (pendingTx) {
      pendingTx.callback();
      // Reload state
      const updated = getMarketplaceState();
      setState(updated);
      setPendingTx(null);
      toast.success("Consensus transaction successfully finalized on Stellar Testnet ledger.");
    }
  };

  // Action wrappers
  const handleConnectWallet = () => {
    const updated = connectFreighterWallet();
    setState(updated);
    toast.success("Freighter Wallet connected successfully!");
  };

  const handleDisconnectWallet = () => {
    const updated = disconnectFreighterWallet();
    setState(updated);
    toast.info("Freighter Wallet disconnected.");
  };

  const handleBuy = (planetId: string) => {
    const planet = EXOPLANETS_DATA.find((p) => p.id === planetId);
    const listing = state.listings.find((l) => l.planetId === planetId);
    const price = listing ? listing.price : planet?.initialPrice ?? 1000;

    if (state.walletBalance < price) {
      toast.error("Insufficient XLM balance for transaction.");
      return;
    }

    queueTransaction("Purchase", planet?.name || "Asset", price, listing?.seller, () => {
      const updated = buyPlanetAsset(planetId);
      setState(updated);
    });
  };

  const handleList = (planetId: string) => {
    const price = parseFloat(listPriceInput);
    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid listing price in XLM.");
      return;
    }
    const planet = EXOPLANETS_DATA.find((p) => p.id === planetId);

    queueTransaction("List", planet?.name || "Asset", price, undefined, () => {
      const updated = listPlanetAsset(planetId, price);
      setState(updated);
      setListPriceInput("");
    });
  };

  const handleDelist = (planetId: string) => {
    const planet = EXOPLANETS_DATA.find((p) => p.id === planetId);
    const listing = state.listings.find((l) => l.planetId === planetId);

    queueTransaction("Delist", planet?.name || "Asset", listing?.price, undefined, () => {
      const updated = delistPlanetAsset(planetId);
      setState(updated);
    });
  };

  const handleTransfer = (planetId: string) => {
    if (!transferAddressInput.trim() || transferAddressInput.length < 15) {
      toast.error("Please enter a valid Stellar G-address.");
      return;
    }
    const planet = EXOPLANETS_DATA.find((p) => p.id === planetId);

    queueTransaction("Transfer", planet?.name || "Asset", undefined, transferAddressInput, () => {
      const updated = transferPlanetAsset(planetId, transferAddressInput);
      setState(updated);
      setTransferAddressInput("");
      navigateToView("home");
    });
  };

  const handleMakeOffer = (planetId: string) => {
    const price = parseFloat(bidPriceInput);
    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid bid amount in XLM.");
      return;
    }
    const planet = EXOPLANETS_DATA.find((p) => p.id === planetId);

    queueTransaction("Offer", planet?.name || "Asset", price, undefined, () => {
      const updated = makeOfferOnPlanet(planetId, price);
      setState(updated);
      setBidPriceInput("");
    });
  };

  const handleAcceptOffer = (offerId: string) => {
    const offer = state.offers.find((o) => o.id === offerId);
    if (!offer) return;
    const planet = EXOPLANETS_DATA.find((p) => p.id === offer.planetId);

    queueTransaction("Accept Offer", planet?.name || "Asset", offer.price, offer.bidder, () => {
      const updated = acceptOffer(offerId);
      setState(updated);
    });
  };

  const handleRejectOffer = (offerId: string) => {
    const updated = rejectOffer(offerId);
    setState(updated);
    toast.info("Offer declined.");
  };

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
    toast.success("Portfolio profile updated.");
  };

  const handleMarkRead = () => {
    const updated = markNotificationsAsRead();
    setState(updated);
    toast.success("All notifications marked as read.");
  };

  // Get current active price of a planet
  const getPlanetPrice = (planetId: string): number => {
    const listing = state.listings.find((l) => l.planetId === planetId);
    if (listing) return listing.price;
    const planet = EXOPLANETS_DATA.find((p) => p.id === planetId);
    return planet ? planet.initialPrice : 1000;
  };

  // Get owner of a planet
  const getPlanetOwner = (planetId: string): string => {
    if (state.ownedPlanets.includes(planetId)) {
      return "YOU";
    }
    const listing = state.listings.find((l) => l.planetId === planetId);
    if (listing) return listing.seller;
    return "GB_COSMOS_FOUNDATION";
  };

  // Filter exoplanets for home grid
  const filteredExoplanets = EXOPLANETS_DATA.filter((p) => {
    // Search query matches name or host star
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.hostStar.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    let matchesCategory = true;
    if (selectedCategory === "terrestrial") matchesCategory = p.type === "Terrestrial";
    else if (selectedCategory === "super-earth") matchesCategory = p.type === "Super-Earth";
    else if (selectedCategory === "gas-giant") matchesCategory = p.type === "Gas Giant";
    else if (selectedCategory === "ice-giant") matchesCategory = p.type === "Ice Giant";

    // Rarity filter
    const matchesRarity = selectedRarity === "All" || p.rarity === selectedRarity;

    // Price range
    const currentPrice = getPlanetPrice(p.id);
    const matchesPrice = currentPrice <= priceRange;

    // Distance range
    const matchesDistance = p.distance <= distanceRange;

    return matchesSearch && matchesCategory && matchesRarity && matchesPrice && matchesDistance;
  });

  // Sort logic
  const sortedExoplanets = [...filteredExoplanets].sort((a, b) => {
    const priceA = getPlanetPrice(a.id);
    const priceB = getPlanetPrice(b.id);

    if (sortBy === "price-asc") return priceA - priceB;
    if (sortBy === "price-desc") return priceB - priceA;
    if (sortBy === "distance-asc") return a.distance - b.distance;
    if (sortBy === "distance-desc") return b.distance - a.distance;
    if (sortBy === "year-asc") return a.discoveryYear - b.discoveryYear;
    if (sortBy === "year-desc") return b.discoveryYear - a.discoveryYear;

    // Rarity priority
    const rarityRank = { Legendary: 5, Epic: 4, Rare: 3, Uncommon: 2, Common: 1 };
    if (sortBy === "rarity-desc") {
      return rarityRank[b.rarity as ExoplanetRarity] - rarityRank[a.rarity as ExoplanetRarity];
    }
    return 0;
  });

  // Collection Stats Data
  const COLLECTION_STATS = [
    { name: "Rocky Terras", floor: "480 XLM", volume: "14.2K XLM", items: 3, color: "from-amber-500/20 to-red-500/20", border: "border-red-500/30" },
    { name: "Super-Earths", floor: "250 XLM", volume: "28.5K XLM", items: 4, color: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/30" },
    { name: "Gas Giants", floor: "850 XLM", volume: "39.1K XLM", items: 4, color: "from-indigo-500/20 to-purple-500/20", border: "border-indigo-500/30" },
    { name: "Ice Giants", floor: "650 XLM", volume: "9.8K XLM", items: 1, color: "from-cyan-500/20 to-blue-500/20", border: "border-cyan-500/30" },
  ];

  // Exoplanet detail object
  const currentExoplanet = selectedPlanetId
    ? EXOPLANETS_DATA.find((p) => p.id === selectedPlanetId)
    : null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between overflow-x-hidden pb-12">
      <Toaster position="top-right" theme="dark" closeButton />

      {/* Floating starry sky background */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_center,white_0.7px,transparent_0.7px)] bg-[size:22px_22px] opacity-[0.06] z-0" />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-indigo-950/5 via-transparent to-cyan-950/5 z-0" />

      {/* Freighter Wallet Transaction Request Simulation Pop-up */}
      {state.walletAddress && (
        <FreighterSimulator
          isOpen={freighterOpen}
          onClose={() => {
            setFreighterOpen(false);
            setPendingTx(null);
          }}
          onApprove={handleApprovePendingTx}
          txData={pendingTx || { type: "Purchase", planetName: "Asset" }}
          userAddress={state.walletAddress}
        />
      )}

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

          {/* Freighter connection HUD */}
          <div className="flex items-center gap-4">
            {state.walletConnected && state.walletAddress ? (
              <div className="flex items-center gap-2">
                {/* Balance */}
                <div className="rounded-l-xl bg-white/[0.02] border border-r-0 border-white/5 px-3 py-1.5 flex items-center gap-1.5">
                  <Coins className="h-3.5 w-3.5 text-secondary" />
                  <span className="font-mono text-xs font-bold text-foreground">
                    {state.walletBalance.toLocaleString()} XLM
                  </span>
                </div>
                {/* Account address */}
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
                className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-[0_0_20px_-4px_rgba(99,102,241,0.5)] transition hover:shadow-[0_0_20px_rgba(99,102,241,0.7)] flex items-center gap-1.5"
              >
                <Wallet className="h-3.5 w-3.5" /> Connect Freighter
              </button>
            )}

            {/* Profile / Dashboard button */}
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
              <Layers className="h-3.5 w-3.5" /> Commander Cargo Bay ({state.ownedPlanets.length})
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
          
          {/* VIEW: HOME MARKETPLACE LANDING */}
          {view === "home" && (
            <motion.div
              key="explore-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              {/* FEATURED EXOPLANET HERO BANNER */}
              <div className="relative rounded-3xl border border-amber-500/20 bg-gradient-to-r from-slate-950 via-[#0a0f24] to-amber-950/20 p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-8 overflow-hidden shadow-[0_0_40px_rgba(245,158,11,0.06)]">
                {/* Background atmosphere shimmer */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(245,158,11,0.06)_0%,transparent_60%)] pointer-events-none" />
                
                {/* Highlight Content */}
                <div className="space-y-4 max-w-xl text-left">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 px-3 py-1 font-mono text-[9px] font-bold text-amber-300 uppercase tracking-widest">
                    <Sparkles className="h-3 w-3 animate-spin" /> FEATURED COLLECTIBLE DISCOVERY
                  </div>
                  
                  <div className="space-y-1">
                    <h2 className="font-display text-3xl font-extrabold text-white leading-tight">55 Cancri e</h2>
                    <p className="font-mono text-xs text-secondary">Class: Carbon-Rich Hot Super-Earth (Lava World)</p>
                  </div>
                  
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    A molten carbon super-Earth so close to its parent star that its surface remains an ocean of active lava. 
                    Due to high pressures and chemical abundance, scientists hypothesize that a significant fraction of its mass could be crystallized carbon—effectively making it a diamond world.
                  </p>

                  {/* Highlights Grid */}
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

                  {/* Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => navigateToView("detail", "cancri_55_e")}
                      className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold font-mono transition shadow-lg shadow-amber-400/15 flex items-center gap-2"
                    >
                      Explore Data Room <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    
                    <button
                      onClick={() => handleBuy("cancri_55_e")}
                      className="px-5 py-3 border border-white/10 hover:border-white/20 bg-white/5 text-white rounded-xl text-xs font-bold font-mono transition"
                    >
                      Acquire Asset (2,200 XLM)
                    </button>
                  </div>
                </div>

                {/* 3D Planet Viewer */}
                <div className="relative shrink-0 flex items-center justify-center h-72 w-72 bg-gradient-to-br from-amber-500/5 to-transparent rounded-full border border-white/5">
                  <Planet3DViewer
                    textureName="venus"
                    color="#F59E0B"
                    isLarge
                    className="h-64 w-64"
                  />
                  {/* Decorative orbit ring */}
                  <div className="absolute border border-amber-500/10 rounded-full w-[110%] h-[110%] pointer-events-none animate-spin" style={{ animationDuration: "40s" }} />
                </div>
              </div>

              {/* POPULAR COLLECTIONS SECTION */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <TrendingUp className="h-4.5 w-4.5 text-secondary" /> Popular Planet Classifications
                  </h3>
                  <p className="text-xs text-muted-foreground">Volume analytics and floors grouped by exoplanet taxonomies.</p>
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

              {/* TRENDING DISCOVERIES SECTION */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="font-display text-lg font-bold text-white tracking-tight flex items-center gap-2">
                      <Sparkles className="h-4.5 w-4.5 text-indigo-400" /> Trending Discoveries
                    </h3>
                    <p className="text-xs text-muted-foreground">High rarity tokens currently generating market interest.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {EXOPLANETS_DATA.filter((p) => p.rarity === "Legendary" || p.rarity === "Epic")
                    .slice(0, 3)
                    .map((planet) => (
                      <NFTCard
                        key={planet.id}
                        planet={planet}
                        price={getPlanetPrice(planet.id)}
                        owner={getPlanetOwner(planet.id)}
                        isWatchlisted={state.watchlist.includes(planet.id)}
                        onWatchlistToggle={handleToggleWatchlist}
                        onSelect={(id) => navigateToView("detail", id)}
                        onBuy={handleBuy}
                      />
                    ))}
                </div>
              </div>

              {/* TELEMETRY CATALOGUE (SEARCH, FILTER GRID) */}
              <div className="space-y-6 pt-4 border-t border-white/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display text-lg font-bold text-white tracking-tight">Telemetry Catalogue</h3>
                    <p className="text-xs text-muted-foreground">Search and filter tokenized exoplanets collected directly from NASA Exoplanet archive.</p>
                  </div>

                  {/* Search bar + advanced filter button */}
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

                {/* ADVANCED FILTERING PANEL */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 overflow-hidden grid grid-cols-1 md:grid-cols-4 gap-6 font-mono text-xs text-left"
                    >
                      {/* Rarity select */}
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

                      {/* Distance filter */}
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Distance Limit</label>
                          <span className="text-secondary">{distanceRange.toLocaleString()} ly</span>
                        </div>
                        <input
                          type="range"
                          min="4"
                          max="22000"
                          step="100"
                          value={distanceRange}
                          onChange={(e) => setDistanceRange(parseInt(e.target.value))}
                          className="w-full accent-secondary"
                        />
                      </div>

                      {/* Price filter */}
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Price Limit</label>
                          <span className="text-emerald-400">{priceRange.toLocaleString()} XLM</span>
                        </div>
                        <input
                          type="range"
                          min="100"
                          max="3000"
                          step="50"
                          value={priceRange}
                          onChange={(e) => setPriceRange(parseInt(e.target.value))}
                          className="w-full accent-emerald-500"
                        />
                      </div>

                      {/* Sorting dropdown */}
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

                {/* Categories Tab Bar */}
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

                {/* GRID DISPLAY */}
                {sortedExoplanets.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sortedExoplanets.map((planet) => (
                      <NFTCard
                        key={planet.id}
                        planet={planet}
                        price={getPlanetPrice(planet.id)}
                        owner={getPlanetOwner(planet.id)}
                        isWatchlisted={state.watchlist.includes(planet.id)}
                        onWatchlistToggle={handleToggleWatchlist}
                        onSelect={(id) => navigateToView("detail", id)}
                        onBuy={handleBuy}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-slate-950/20 border border-white/5 rounded-2xl">
                    <p className="text-sm text-muted-foreground font-mono">No telemetry matching criteria found on core ledger index.</p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("all");
                        setSelectedRarity("All");
                        setPriceRange(3000);
                        setDistanceRange(22000);
                      }}
                      className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-mono transition"
                    >
                      Reset Filter Criteria
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* VIEW: DEDICATED PLANET TRADING PAGE */}
          {view === "detail" && currentExoplanet && (
            <motion.div
              key="detail-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Back nav bar */}
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
                      className={`h-4 w-4 ${
                        state.watchlist.includes(currentExoplanet.id)
                          ? "fill-rose-500 text-rose-500"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Main Split Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* LEFT SIDE: 3D Globe + Chart */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Huge 3D Planet Display Room */}
                  <div className="relative h-[380px] rounded-3xl border border-white/8 bg-gradient-to-b from-[#070b19] to-[#040816] overflow-hidden flex items-center justify-center p-6 shadow-2xl">
                    {/* Starry bg */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_0.6px,transparent_0.6px)] bg-[size:16px_16px] pointer-events-none" />
                    
                    <Planet3DViewer
                      textureName={currentExoplanet.textureName}
                      color={currentExoplanet.color}
                      isLarge
                      className="h-72 w-72 z-10"
                    />

                    {/* Orbit Ring details (Holographic details overlay) */}
                    <div className="absolute border border-dashed rounded-full w-[70vw] h-[70vw] lg:w-[480px] lg:h-[480px] border-white/5 pointer-events-none animate-spin" style={{ animationDuration: "120s" }} />
                    <div className="absolute border border-dotted rounded-full w-[60vw] h-[60vw] lg:w-[400px] lg:h-[400px] border-white/5 pointer-events-none animate-spin" style={{ animationDuration: "80s" }} />
                    
                    {/* Atmosphere overlay color */}
                    <div 
                      className="absolute inset-0 pointer-events-none opacity-20"
                      style={{
                        background: `radial-gradient(circle at center, ${currentExoplanet.color}15 0%, transparent 80%)`,
                      }}
                    />

                    {/* Drag instruction overlay */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-[9px] text-muted-foreground/80 tracking-widest uppercase bg-black/40 backdrop-blur px-3 py-1 rounded-full z-20">
                      Drag to rotate orbit · Scroll to scale
                    </div>
                  </div>

                  {/* Historical Valuation chart */}
                  <div className="rounded-3xl border border-white/8 bg-slate-950/40 p-5 backdrop-blur-md space-y-4">
                    <div>
                      <h4 className="font-display text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                        <LineChart className="h-4 w-4 text-secondary" /> Asset Ledger Valuation
                      </h4>
                      <p className="font-mono text-[10px] text-muted-foreground">Historical pricing indexes for {currentExoplanet.name} on secondary market.</p>
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
                          <Tooltip 
                            contentStyle={{ backgroundColor: "#070b19", borderColor: "rgba(255,255,255,0.1)" }}
                            labelStyle={{ color: "#ffffff" }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="price" 
                            stroke={currentExoplanet.color} 
                            fillOpacity={1} 
                            fill="url(#chartColor)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Description Card */}
                  <div className="rounded-3xl border border-white/8 bg-slate-950/40 p-6 space-y-3 text-left">
                    <h4 className="font-display text-sm font-bold text-white tracking-tight">Telemetry Mission Archives</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {currentExoplanet.description}
                    </p>
                    <p className="text-[11px] text-indigo-300 font-mono">
                      Data derived from NASA Exoplanet Science Institute Archive. Planetary orbits modelized under Kepler laws.
                    </p>
                  </div>
                </div>

                {/* RIGHT SIDE: Parameters + Action console */}
                <div className="lg:col-span-5 space-y-6 text-left">
                  {/* Title & Core Meta */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span 
                        className="rounded-full px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest"
                        style={{
                          backgroundColor: `${currentExoplanet.color}15`,
                          color: currentExoplanet.color,
                          border: `1px solid ${currentExoplanet.color}25`,
                        }}
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
                    {/* Header Price */}
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
                          {getPlanetOwner(currentExoplanet.id) === "YOU" 
                            ? "Commander (YOU)" 
                            : getPlanetOwner(currentExoplanet.id).slice(0, 8) + "..." + getPlanetOwner(currentExoplanet.id).slice(-4)}
                        </div>
                      </div>
                    </div>

                    {/* Ledger Action Panel */}
                    <div className="space-y-4 font-mono text-xs">
                      {!state.walletConnected ? (
                        <div className="text-center py-4 space-y-3">
                          <p className="text-[10px] text-muted-foreground">Freighter Wallet connection required to issue cryptographic operations on Stellar ledger.</p>
                          <button
                            onClick={handleConnectWallet}
                            className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 font-sans font-bold text-white shadow-lg transition hover:opacity-90"
                          >
                            Connect Freighter Wallet
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* 1. User is not the owner -> BUY or BID */}
                          {getPlanetOwner(currentExoplanet.id) !== "YOU" ? (
                            <div className="space-y-4">
                              <button
                                onClick={() => handleBuy(currentExoplanet.id)}
                                className="w-full rounded-xl bg-gradient-to-r from-secondary to-indigo-500 py-3 font-sans font-bold text-slate-950 hover:text-white transition shadow-lg flex items-center justify-center gap-1.5"
                              >
                                Buy Exoplanet Token Now ({getPlanetPrice(currentExoplanet.id).toLocaleString()} XLM)
                              </button>

                              {/* Bid Input */}
                              <div className="space-y-2">
                                <label className="text-[10px] text-muted-foreground uppercase block font-bold">Submit Buy Offer</label>
                                <div className="flex gap-2">
                                  <div className="relative flex-1">
                                    <input
                                      type="number"
                                      value={bidPriceInput}
                                      onChange={(e) => setBidPriceInput(e.target.value)}
                                      placeholder="Offer price (XLM)"
                                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white placeholder-slate-600 focus:outline-none"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[10px]">XLM</span>
                                  </div>
                                  <button
                                    onClick={() => handleMakeOffer(currentExoplanet.id)}
                                    className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 font-sans font-semibold text-indigo-400 hover:bg-indigo-500/20 transition"
                                  >
                                    Submit
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* 2. User IS the owner -> LIST or DELIST or TRANSFER */
                            <div className="space-y-4">
                              <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center gap-2">
                                <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />
                                <span className="text-[10px] text-emerald-400 font-bold">You own this Exoplanet telemetry token.</span>
                              </div>

                              {/* List for Sale (if not listed, or change listing) */}
                              <div className="space-y-2">
                                <label className="text-[10px] text-muted-foreground uppercase block font-bold">
                                  {state.listings.some((l) => l.planetId === currentExoplanet.id) 
                                    ? "Adjust Listing Price" 
                                    : "List on Open Marketplace"}
                                </label>
                                <div className="flex gap-2">
                                  <div className="relative flex-1">
                                    <input
                                      type="number"
                                      value={listPriceInput}
                                      onChange={(e) => setListPriceInput(e.target.value)}
                                      placeholder="List Price (XLM)"
                                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white placeholder-slate-600 focus:outline-none"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[10px]">XLM</span>
                                  </div>
                                  <button
                                    onClick={() => handleList(currentExoplanet.id)}
                                    className="rounded-xl bg-white text-slate-950 font-sans font-semibold px-4 py-2 hover:bg-slate-200 transition"
                                  >
                                    Publish
                                  </button>
                                </div>
                              </div>

                              {/* Delist option */}
                              {state.listings.some((l) => l.planetId === currentExoplanet.id) && (
                                <button
                                  onClick={() => handleDelist(currentExoplanet.id)}
                                  className="w-full rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 py-2.5 font-sans font-semibold text-red-400 transition flex items-center justify-center gap-1.5"
                                >
                                  <Trash2 className="h-4 w-4" /> Cancel Listing (Delist)
                                </button>
                              )}

                              {/* Transfer asset */}
                              <div className="space-y-2 border-t border-white/5 pt-3 mt-1">
                                <label className="text-[10px] text-muted-foreground uppercase block font-bold">Transfer Asset Ledger Registry</label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={transferAddressInput}
                                    onChange={(e) => setTransferAddressInput(e.target.value)}
                                    placeholder="Recipient Stellar Address (G...)"
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white placeholder-slate-600 focus:outline-none text-[10px]"
                                  />
                                  <button
                                    onClick={() => handleTransfer(currentExoplanet.id)}
                                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-sans font-semibold text-white hover:bg-white/10 transition flex items-center gap-1"
                                  >
                                    <Send className="h-3 w-3" /> Send
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* SCIENTIFIC PARAMETERS DETAILED CARD */}
                  <div className="rounded-3xl border border-white/8 bg-slate-950/40 p-5 space-y-4">
                    <h4 className="font-display text-sm font-bold text-white tracking-tight">Stellar Telemetry Metrics</h4>
                    
                    <div className="grid grid-cols-2 gap-4 font-mono text-[11px] text-muted-foreground">
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span>Distance:</span>
                        <span className="text-white font-bold">{currentExoplanet.distance.toLocaleString()} ly</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span>Host Star:</span>
                        <span className="text-white font-bold">{currentExoplanet.hostStar}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span>Radius:</span>
                        <span className="text-white font-bold">{currentExoplanet.radius} {currentExoplanet.radiusUnit}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span>Mass:</span>
                        <span className="text-white font-bold">{currentExoplanet.mass} {currentExoplanet.massUnit}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span>Temperature:</span>
                        <span className="text-white font-bold">{currentExoplanet.temperature} K</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span>Orbital Period:</span>
                        <span className="text-white font-bold">{currentExoplanet.orbitalPeriod} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Eccentricity:</span>
                        <span className="text-white font-bold">{currentExoplanet.eccentricity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gravity:</span>
                        <span className="text-white font-bold">
                          {currentExoplanet.type === "Gas Giant" ? "2.4g" : "1.2g"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ACTIVE OFFERS BOARD */}
                  <div className="rounded-3xl border border-white/8 bg-slate-950/40 p-5 space-y-4">
                    <h4 className="font-display text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                      <Coins className="h-4 w-4 text-accent" /> Active Ledger Offers
                    </h4>

                    {state.offers.filter((o) => o.planetId === currentExoplanet.id).length > 0 ? (
                      <div className="space-y-2 max-h-[160px] overflow-y-auto font-mono text-[10px]">
                        {state.offers
                          .filter((o) => o.planetId === currentExoplanet.id)
                          .map((offer) => (
                            <div key={offer.id} className="flex justify-between items-center bg-white/[0.01] border border-white/5 rounded-xl p-2.5">
                              <div>
                                <span className="text-white font-bold block">{offer.price.toLocaleString()} XLM</span>
                                <span className="text-muted-foreground">Bidder: {offer.bidderName} ({offer.bidder.slice(0, 6)}...)</span>
                              </div>
                              {getPlanetOwner(currentExoplanet.id) === "YOU" && (
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => handleAcceptOffer(offer.id)}
                                    className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30 transition text-[9px]"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleRejectOffer(offer.id)}
                                    className="px-2.5 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition text-[9px]"
                                  >
                                    Decline
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 border border-dashed border-white/5 rounded-xl font-mono text-[10px] text-muted-foreground">
                        No active offers received on ledger.
                      </div>
                    )}
                  </div>

                  {/* LEDGER TRANSACTION REGISTRY (OWNERSHIP CHAIN) */}
                  <div className="rounded-3xl border border-white/8 bg-slate-950/40 p-5 space-y-4">
                    <h4 className="font-display text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                      <History className="h-4 w-4 text-indigo-400" /> Consensus Ledger Logs
                    </h4>
                    
                    <div className="space-y-2 max-h-[220px] overflow-y-auto font-mono text-[9px]">
                      {state.transactions
                        .filter((tx) => tx.planetId === currentExoplanet.id)
                        .map((tx) => (
                          <div key={tx.id} className="border-b border-white/5 pb-2.5 space-y-1">
                            <div className="flex justify-between font-bold">
                              <span className="text-indigo-300">{tx.type} operation</span>
                              <span className="text-white">{new Date(tx.timestamp).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>From: <span className="text-white/85">{tx.from === "YOU" ? "YOU" : tx.from.slice(0, 10)}...</span></span>
                              <span>To: <span className="text-white/85">{tx.to === "YOU" ? "YOU" : tx.to.slice(0, 10)}...</span></span>
                            </div>
                            {tx.price && (
                              <div className="text-emerald-400">Amount: {tx.price.toLocaleString()} XLM</div>
                            )}
                            <div className="text-muted-foreground text-[8px] flex items-center justify-between">
                              <span>Hash: {tx.txHash.slice(0, 20)}...</span>
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

          {/* VIEW: COMMANDER PORTFOLIO USER DASHBOARD */}
          {view === "dashboard" && (
            <motion.div
              key="dashboard-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left"
            >
              {/* LEFT COLUMN: Wallet Profile & Analytics */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* 1. Commander Profile Registry Card */}
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

                  {/* Profile Edit Panel */}
                  {isEditingProfile ? (
                    <div className="space-y-3 pt-3 border-t border-white/5 font-mono text-[11px] text-left">
                      <div className="space-y-1">
                        <label className="text-muted-foreground block text-[9px]">Commander Name</label>
                        <input
                          type="text"
                          defaultValue={state.profile.name}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-muted-foreground block text-[9px]">Title Rank</label>
                        <input
                          type="text"
                          defaultValue={state.profile.title}
                          onChange={(e) => setProfileTitle(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-muted-foreground block text-[9px]">Bio Description</label>
                        <textarea
                          defaultValue={state.profile.bio}
                          onChange={(e) => setProfileBio(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white h-16 resize-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-muted-foreground block text-[9px]">Avatar Emoji</label>
                        <input
                          type="text"
                          defaultValue={state.profile.avatar}
                          onChange={(e) => setProfileAvatar(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white"
                        />
                      </div>
                      <div className="flex gap-2 pt-1.5">
                        <button
                          onClick={handleSaveProfile}
                          className="flex-1 bg-white text-slate-950 font-sans font-bold py-2 rounded-lg text-xs"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => setIsEditingProfile(false)}
                          className="flex-1 border border-white/10 hover:bg-white/5 text-white py-2 rounded-lg text-xs font-sans"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setProfileName(state.profile.name);
                        setProfileTitle(state.profile.title);
                        setProfileBio(state.profile.bio);
                        setProfileAvatar(state.profile.avatar);
                        setIsEditingProfile(true);
                      }}
                      className="w-full rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-2 font-mono text-[10px] text-white transition"
                    >
                      Update Profile Telemetry
                    </button>
                  )}
                </div>

                {/* 2. Wallet Balance Controller Card */}
                <div className="rounded-3xl border border-white/8 bg-slate-950/40 p-6 space-y-4 backdrop-blur-md">
                  <div>
                    <h4 className="font-display text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                      <Wallet className="h-4 w-4 text-secondary" /> Freighter Ledger Balance
                    </h4>
                    <p className="font-mono text-[10px] text-muted-foreground">Connected address on Stellar Horizon network.</p>
                  </div>

                  <div className="space-y-2 rounded-xl border border-white/5 bg-white/[0.01] p-4 text-left">
                    <span className="font-mono text-[9px] text-muted-foreground uppercase">Ledger Balance</span>
                    <div className="font-display text-2xl font-black text-white">
                      {state.walletBalance.toLocaleString()} <span className="text-xs text-secondary font-bold">XLM</span>
                    </div>
                    {state.walletAddress && (
                      <div className="pt-2 border-t border-white/5 mt-2 font-mono text-[9px] text-indigo-300 break-all select-all leading-tight">
                        Address: <span className="text-white font-bold">{state.walletAddress}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {state.walletConnected ? (
                      <button
                        onClick={handleDisconnectWallet}
                        className="w-full py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-mono transition"
                      >
                        Disconnect Wallet
                      </button>
                    ) : (
                      <button
                        onClick={handleConnectWallet}
                        className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-600 font-sans font-bold text-white rounded-xl text-xs transition"
                      >
                        Connect Wallet
                      </button>
                    )}
                  </div>
                </div>

                {/* 3. Analytics Indicators */}
                <div className="rounded-3xl border border-white/8 bg-slate-950/40 p-6 space-y-4 backdrop-blur-md text-left font-mono">
                  <div>
                    <h4 className="font-display text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                      <LineChart className="h-4 w-4 text-emerald-400" /> Portfolio Analytics
                    </h4>
                    <p className="text-[10px] text-muted-foreground">Net valuation models of user-owned exoplanet assets.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-white/[0.01] border border-white/5 rounded-xl p-3">
                      <span className="text-[8px] text-muted-foreground block uppercase">Portfolio Value</span>
                      <span className="text-sm text-white font-extrabold block mt-0.5">
                        {getPortfolioValuation(state).toLocaleString()} XLM
                      </span>
                    </div>
                    <div className="bg-white/[0.01] border border-white/5 rounded-xl p-3">
                      <span className="text-[8px] text-muted-foreground block uppercase">Planets Owned</span>
                      <span className="text-sm text-indigo-400 font-extrabold block mt-0.5">
                        {state.ownedPlanets.length}
                      </span>
                    </div>
                    <div className="bg-white/[0.01] border border-white/5 rounded-xl p-3">
                      <span className="text-[8px] text-muted-foreground block uppercase">Active Listings</span>
                      <span className="text-sm text-amber-400 font-extrabold block mt-0.5">
                        {state.listings.filter((l) => state.ownedPlanets.includes(l.planetId)).length}
                      </span>
                    </div>
                    <div className="bg-white/[0.01] border border-white/5 rounded-xl p-3">
                      <span className="text-[8px] text-muted-foreground block uppercase">Commander XP</span>
                      <span className="text-sm text-emerald-400 font-extrabold block mt-0.5">
                        {learningState?.xp || 0} XP
                      </span>
                    </div>
                  </div>

                  {/* Portfolio value chart */}
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

              {/* RIGHT COLUMN: Cargo Bay Tabs (Inventory, Listings, History, Certs, etc.) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* NOTIFICATIONS BOX (If any unread) */}
                {state.notifications.some((n) => !n.read) && (
                  <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-4 flex items-center justify-between gap-4 font-mono text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <Bell className="h-4.5 w-4.5 text-indigo-400 animate-bounce" />
                        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400" />
                      </div>
                      <div>
                        <span className="text-white font-bold">Unread Ledger Updates:</span>
                        <p className="text-[10px] text-indigo-300 mt-0.5">
                          {state.notifications.filter((n) => !n.read)[0].message}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleMarkRead}
                      className="shrink-0 px-3 py-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/35 transition text-[10px]"
                    >
                      Clear All
                    </button>
                  </div>
                )}

                {/* Sub tabs container */}
                <div className="rounded-3xl border border-white/8 bg-slate-950/40 p-6 backdrop-blur-md space-y-6">
                  
                  {/* Category Headers */}
                  <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4 text-xs font-mono font-bold uppercase tracking-wider">
                    {[
                      { id: "owned", label: "Inventory Planets", icon: Globe },
                      { id: "listed", label: "Your Listings", icon: Coins },
                      { id: "offers", label: "Received Offers", icon: Award },
                      { id: "watchlist", label: "Watchlist", icon: Heart },
                      { id: "history", label: "Transaction Logs", icon: History },
                      { id: "certs", label: "Research Badges", icon: Trophy },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      // Determine active tab state or custom indicator count
                      let count = 0;
                      if (tab.id === "owned") count = state.ownedPlanets.length;
                      else if (tab.id === "listed") count = state.listings.filter((l) => state.ownedPlanets.includes(l.planetId)).length;
                      else if (tab.id === "offers") count = state.offers.filter((o) => state.ownedPlanets.includes(o.planetId)).length;
                      else if (tab.id === "watchlist") count = state.watchlist.length;

                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            const btn = document.getElementById(`subtab_${tab.id}`);
                            if (btn) btn.scrollIntoView({ behavior: "smooth", block: "nearest" });
                          }}
                          className="flex items-center gap-1.5 px-3 py-2 border border-white/5 bg-white/5 rounded-xl hover:text-white transition text-muted-foreground hover:bg-white/10 text-[10px]"
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span>{tab.label}</span>
                          {count > 0 && (
                            <span className="bg-indigo-500 text-white text-[8px] font-extrabold rounded-full px-1.5 py-0.2 shrink-0">
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* DETAILED CONTENT SCROLL BOX */}
                  <div className="space-y-12">
                    
                    {/* SECTION: OWNED INVENTORY */}
                    <div id="subtab_owned" className="space-y-4 text-left scroll-mt-6 select-none">
                      <div className="border-b border-white/5 pb-2">
                        <h4 className="font-display text-sm font-bold text-white flex items-center gap-1.5">
                          <Globe className="h-4.5 w-4.5 text-secondary" /> Owned Exoplanets ({state.ownedPlanets.length})
                        </h4>
                        <p className="text-[10px] text-muted-foreground font-mono">Tokenized planet assets verified under your signature.</p>
                      </div>

                      {state.ownedPlanets.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {EXOPLANETS_DATA.filter((p) => state.ownedPlanets.includes(p.id)).map((planet) => (
                            <NFTCard
                              key={planet.id}
                              planet={planet}
                              price={getPlanetPrice(planet.id)}
                              owner="YOU"
                              isWatchlisted={state.watchlist.includes(planet.id)}
                              onWatchlistToggle={handleToggleWatchlist}
                              onSelect={(id) => navigateToView("detail", id)}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10 border border-dashed border-white/5 rounded-2xl font-mono text-[11px] text-muted-foreground space-y-3">
                          <p>Your exoplanet cargo hold is currently empty.</p>
                          <button
                            onClick={() => navigateToView("home")}
                            className="px-4 py-2 bg-white text-slate-950 rounded-xl text-xs font-sans font-bold"
                          >
                            Explore Telescope Catalog
                          </button>
                        </div>
                      )}
                    </div>

                    {/* SECTION: ACTIVE USER LISTINGS */}
                    <div id="subtab_listed" className="space-y-4 text-left scroll-mt-6">
                      <div className="border-b border-white/5 pb-2">
                        <h4 className="font-display text-sm font-bold text-white flex items-center gap-1.5">
                          <Coins className="h-4.5 w-4.5 text-amber-400" /> Active Market Listings
                        </h4>
                        <p className="text-[10px] text-muted-foreground font-mono">Assets published to secondary trading ledger.</p>
                      </div>

                      {state.listings.filter((l) => state.ownedPlanets.includes(l.planetId)).length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {EXOPLANETS_DATA.filter((p) =>
                            state.ownedPlanets.includes(p.id) && state.listings.some((l) => l.planetId === p.id)
                          ).map((planet) => (
                            <NFTCard
                              key={planet.id}
                              planet={planet}
                              price={getPlanetPrice(planet.id)}
                              owner="YOU"
                              isWatchlisted={state.watchlist.includes(planet.id)}
                              onWatchlistToggle={handleToggleWatchlist}
                              onSelect={(id) => navigateToView("detail", id)}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 border border-dashed border-white/5 rounded-2xl font-mono text-[10px] text-muted-foreground">
                          No active listings. Open an owned planet details page to publish list parameters.
                        </div>
                      )}
                    </div>

                    {/* SECTION: OFFERS RECEIVED */}
                    <div id="subtab_offers" className="space-y-4 text-left scroll-mt-6">
                      <div className="border-b border-white/5 pb-2">
                        <h4 className="font-display text-sm font-bold text-white flex items-center gap-1.5">
                          <Award className="h-4.5 w-4.5 text-accent" /> Bids & Offers Received
                        </h4>
                        <p className="text-[10px] text-muted-foreground font-mono">Bids submitted by other commanders on your owned exoplanets.</p>
                      </div>

                      {state.offers.filter((o) => state.ownedPlanets.includes(o.planetId)).length > 0 ? (
                        <div className="space-y-3 font-mono text-xs">
                          {state.offers
                            .filter((o) => state.ownedPlanets.includes(o.planetId))
                            .map((offer) => {
                              const planet = EXOPLANETS_DATA.find((p) => p.id === offer.planetId);
                              return (
                                <div key={offer.id} className="flex justify-between items-center border border-white/5 bg-white/[0.01] rounded-2xl p-4">
                                  <div className="space-y-1">
                                    <span className="text-indigo-400 font-bold block">{planet?.name}</span>
                                    <span className="text-white text-sm font-bold block">{offer.price.toLocaleString()} XLM</span>
                                    <span className="text-[9px] text-muted-foreground">Bidder: {offer.bidderName}</span>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleAcceptOffer(offer.id)}
                                      className="px-3.5 py-2 bg-emerald-500 text-slate-950 font-sans font-bold rounded-xl text-xs hover:bg-emerald-400 transition"
                                    >
                                      Accept Offer
                                    </button>
                                    <button
                                      onClick={() => handleRejectOffer(offer.id)}
                                      className="px-3 py-2 border border-white/10 hover:bg-white/5 text-white font-sans font-semibold rounded-xl text-xs transition"
                                    >
                                      Decline
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      ) : (
                        <div className="text-center py-8 border border-dashed border-white/5 rounded-2xl font-mono text-[10px] text-muted-foreground">
                          No offers received on your assets.
                        </div>
                      )}
                    </div>

                    {/* SECTION: WATCHLIST */}
                    <div id="subtab_watchlist" className="space-y-4 text-left scroll-mt-6">
                      <div className="border-b border-white/5 pb-2">
                        <h4 className="font-display text-sm font-bold text-white flex items-center gap-1.5">
                          <Heart className="h-4.5 w-4.5 text-rose-500" /> Watchlisted Discoveries ({state.watchlist.length})
                        </h4>
                        <p className="text-[10px] text-muted-foreground font-mono">Planet telemetries marked for persistent tracking.</p>
                      </div>

                      {state.watchlist.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {EXOPLANETS_DATA.filter((p) => state.watchlist.includes(p.id)).map((planet) => (
                            <NFTCard
                              key={planet.id}
                              planet={planet}
                              price={getPlanetPrice(planet.id)}
                              owner={getPlanetOwner(planet.id)}
                              isWatchlisted={true}
                              onWatchlistToggle={handleToggleWatchlist}
                              onSelect={(id) => navigateToView("detail", id)}
                              onBuy={handleBuy}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 border border-dashed border-white/5 rounded-2xl font-mono text-[10px] text-muted-foreground">
                          Watchlist is empty.
                        </div>
                      )}
                    </div>

                    {/* SECTION: LEDGER TRANSACTION HISTORY */}
                    <div id="subtab_history" className="space-y-4 text-left scroll-mt-6">
                      <div className="border-b border-white/5 pb-2">
                        <h4 className="font-display text-sm font-bold text-white flex items-center gap-1.5">
                          <History className="h-4.5 w-4.5 text-indigo-400" /> Ledger Transaction Logs
                        </h4>
                        <p className="text-[10px] text-muted-foreground font-mono">Verifiable cryptographic events logged on Stellar Testnet consensus chain.</p>
                      </div>

                      <div className="space-y-3 font-mono text-[10px]">
                        {state.transactions.map((tx) => (
                          <div
                            key={tx.id}
                            className="border border-white/5 bg-white/[0.01] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                          >
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
                              <div className="text-muted-foreground text-[8px] select-all">Hash: {tx.txHash}</div>
                            </div>

                            <div className="text-left md:text-right shrink-0">
                              {tx.price && (
                                <div className="text-emerald-400 font-black text-sm">{tx.price.toLocaleString()} XLM</div>
                              )}
                              <span className="text-[9px] text-muted-foreground">{new Date(tx.timestamp).toLocaleString()}</span>
                            </div>
                          </div>
                        ))}

                        {state.transactions.length === 0 && (
                          <div className="text-center py-8 border border-dashed border-white/5 rounded-2xl text-muted-foreground">
                            No ledger history found.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* SECTION: ACQUIRED SCIENTIFIC RESEARCH BADGES */}
                    <div id="subtab_certs" className="space-y-4 text-left scroll-mt-6">
                      <div className="border-b border-white/5 pb-2">
                        <h4 className="font-display text-sm font-bold text-white flex items-center gap-1.5">
                          <Trophy className="h-4.5 w-4.5 text-accent" /> Unlocked Exploration Badges
                        </h4>
                        <p className="text-[10px] text-muted-foreground font-mono">Academic achievements synced from CosmosX Core curriculum.</p>
                      </div>

                      {learningState && learningState.earnedBadgeIds.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                          {learningState.earnedBadgeIds.map((badgeId) => {
                            // Find badge details
                            const badge = [
                              { id: "first_block", name: "First Block", desc: "Complete Module 01 on Mercury", icon: "🏅" },
                              { id: "hash_cracker", name: "Hash Cracker", desc: "Solve all Venus cryptography challenges", icon: "🔐" },
                              { id: "consensus_king", name: "Consensus King", desc: "Complete Earth's consensus simulator", icon: "⚡" },
                              { id: "mercury_graduate", name: "Mercury Graduate", desc: "Complete escape room", icon: "🎓" },
                            ].find((b) => b.id === badgeId);

                            if (!badge) return null;

                            return (
                              <div
                                key={badgeId}
                                className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 flex flex-col items-center text-center space-y-2 shadow-[0_0_15px_rgba(245,158,11,0.08)]"
                              >
                                <span className="text-3xl">{badge.icon}</span>
                                <div>
                                  <h5 className="font-display text-xs font-bold text-white leading-snug">{badge.name}</h5>
                                  <p className="font-sans text-[9px] text-muted-foreground mt-0.5 leading-snug">{badge.desc}</p>
                                </div>
                                <span className="text-[8px] font-mono text-emerald-400 font-bold border border-emerald-500/20 bg-emerald-500/10 px-1.5 rounded uppercase">
                                  Sync Success
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 border border-dashed border-white/5 rounded-2xl font-mono text-[10px] text-muted-foreground">
                          No research badges synced. Complete curriculum chapters in commander dashboard to synchronize certificates.
                        </div>
                      )}
                    </div>

                  </div>

                </div>

              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Primary Page Footer */}
      <footer className="mt-16 border-t border-white/8 bg-slate-950/60 py-6 text-center z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
            StellarVerse Central Ledger · NASA Exoplanet Asset Registry
          </p>
          <div className="flex gap-4 font-mono text-[9px] text-muted-foreground uppercase">
            <span className="hover:text-white cursor-pointer transition">Ledger Explorer</span>
            <span className="hover:text-white cursor-pointer transition">Freighter API Doc</span>
            <span className="hover:text-white cursor-pointer transition">System Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

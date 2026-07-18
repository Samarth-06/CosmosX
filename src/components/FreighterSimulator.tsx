import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  X,
  Key,
  Lock,
  FileText,
  Code2,
  BookOpen,
  ChevronRight,
  ExternalLink,
  Wallet,
  Hash,
} from "lucide-react";

/**
 * FreighterSimulator — Educational Overlay (CosmosX Learning Tool)
 *
 * This component is a TEACHING TOOL, not a wallet simulator.
 * When a real Stellar wallet (Freighter) is connected, all on-chain actions
 * are handled by the real wallet integration in useMintAchievement.ts and
 * the marketplace contract hooks. This component explains what is happening
 * conceptually so learners understand blockchain mechanics.
 *
 * It should NEVER sign transactions, generate fake hashes, or mock
 * network calls — that job belongs entirely to the real Stellar SDK flow.
 */

interface FreighterEducatorProps {
  isOpen: boolean;
  onClose: () => void;
  /** Context: what concept to explain. Drives which lesson is shown. */
  context:
    | "wallet-connect"
    | "signing"
    | "keys"
    | "transaction"
    | "nft-mint"
    | "marketplace-trade";
  /** The connected wallet address (real), shown for context. */
  walletAddress?: string | null;
}

// Lesson content keyed by context
const LESSONS: Record<
  FreighterEducatorProps["context"],
  {
    title: string;
    icon: React.ReactNode;
    color: string;
    slides: { heading: string; body: string; code?: string }[];
    explorerLink?: string;
  }
> = {
  "wallet-connect": {
    title: "How Wallet Connection Works",
    icon: <Wallet className="h-5 w-5" />,
    color: "#6366F1",
    slides: [
      {
        heading: "Your Wallet = Your Identity",
        body: "A Stellar wallet like Freighter is a browser extension that securely stores your private key. When you click 'Connect', it shares only your public key (G-address) — never your private key. The app uses that address to build transactions on your behalf.",
      },
      {
        heading: "Public Key vs Private Key",
        body: "Your public key (starts with G) is your address — safe to share with anyone. Your private key (starts with S) is your password — it never leaves your wallet. CosmosX never sees your private key at any point.",
        code: "Public:  GXXXXXXX...  → share freely\nPrivate: SXXXXXXX...  → NEVER share",
      },
      {
        heading: "What happens on Stellar",
        body: "Stellar accounts are identified by their public key on the Testnet ledger. Your XLM balance, owned assets, and transaction history are all stored on-chain and publicly viewable on Stellar Expert — no CosmosX server stores this.",
      },
    ],
    explorerLink: "https://stellar.expert/explorer/testnet",
  },
  signing: {
    title: "What Signing a Transaction Means",
    icon: <Key className="h-5 w-5" />,
    color: "#8B5CF6",
    slides: [
      {
        heading: "A Signature Proves You Approved It",
        body: "When you click 'Approve' in Freighter, your wallet uses your private key to create a cryptographic signature. This signature proves — to the entire Stellar network — that you personally authorized this specific transaction.",
      },
      {
        heading: "The Signature Can't Be Faked",
        body: "Stellar uses Ed25519 elliptic-curve cryptography. Without your private key, nobody can forge a valid signature. Even CosmosX cannot sign on your behalf — only you can, by approving in Freighter.",
        code: "Ed25519 signature:\nf9e2a...bc91 (64 bytes)\nVerifiable by anyone with your public key",
      },
      {
        heading: "After You Sign",
        body: "Freighter returns the signed transaction envelope. CosmosX submits it to the Stellar Testnet RPC node. The network validates the signature, runs the Soroban contract, and includes it in the next ledger (closed every ~5 seconds).",
      },
    ],
  },
  keys: {
    title: "Public & Private Keys Explained",
    icon: <Lock className="h-5 w-5" />,
    color: "#EC4899",
    slides: [
      {
        heading: "Asymmetric Cryptography",
        body: "Blockchain uses a math trick: you can create two linked keys where one locks (private) and one unlocks (public). Messages encrypted with the private key can be verified by anyone using the public key — but the private key itself cannot be derived from the public key.",
      },
      {
        heading: "Stellar Key Format",
        body: "Stellar encodes keys in base32 with a checksum. Public keys start with 'G' and are 56 characters. Secret keys start with 'S'. Both are generated from the same 256-bit random seed.",
        code: "G... = Public key  (56 chars, starts G)\nS... = Secret key  (56 chars, starts S)\n\nGenerated from:\n  seed = random_bytes(32)",
      },
      {
        heading: "Never Share Your Secret Key",
        body: "Your secret key gives total control of your account. No legitimate app, including CosmosX, will ever ask for it. Freighter keeps it encrypted locally and only uses it when you explicitly approve a transaction.",
      },
    ],
  },
  transaction: {
    title: "Anatomy of a Stellar Transaction",
    icon: <FileText className="h-5 w-5" />,
    color: "#06B6D4",
    slides: [
      {
        heading: "Transactions are XDR envelopes",
        body: "A Stellar transaction is serialized as XDR (External Data Representation) — a compact binary format. It contains the source account, fee, sequence number, operations, and the signature. The Stellar SDK builds this automatically.",
        code: "AAAAAgAAAA... (base64 XDR)\n↓ decodes to:\n  source: G...\n  fee: 100 stroops\n  seq: 12345678\n  operations: [invoke_contract]\n  signatures: [ed25519_sig]",
      },
      {
        heading: "Sequence Numbers Prevent Replay",
        body: "Every transaction must include the account's current sequence number + 1. If you try to replay a transaction, the network rejects it because the sequence number is already used. This prevents double-spending.",
      },
      {
        heading: "Fees and Ledger Inclusion",
        body: "Each transaction pays a small fee in XLM (minimum 100 stroops = 0.00001 XLM). Validators include transactions with higher fees first. On Testnet, the network is uncongested so base fee is always sufficient.",
      },
    ],
    explorerLink: "https://stellar.expert/explorer/testnet",
  },
  "nft-mint": {
    title: "How Achievement NFT Minting Works",
    icon: <Hash className="h-5 w-5" />,
    color: "#10B981",
    slides: [
      {
        heading: "Soulbound — Non-Transferable by Design",
        body: "CosmosX achievement NFTs are soulbound: they can only be minted to your address and cannot be transferred. The Soroban contract's mint() function uses to.require_auth() — your wallet must sign, and the achievement is permanently tied to your address.",
      },
      {
        heading: "The Contract Enforces the Rules",
        body: "The achievement contract stores a Map<Address, bool> on-chain. Once minted, has_achievement(your_address) returns true forever — even if CosmosX's frontend went down. The proof lives independently on the Stellar ledger.",
        code: "// Soroban contract (Rust)\npub fn mint(env: Env, to: Address) {\n    to.require_auth(); // only YOU can mint to you\n    // no transfer method exists\n}",
      },
      {
        heading: "Verified with Stellar Expert",
        body: "After minting, your transaction hash appears on Stellar Expert. Anyone can verify: look up the contract address, call has_achievement with your G-address, and see 'true' — without trusting CosmosX at all.",
      },
    ],
    explorerLink: "https://stellar.expert/explorer/testnet",
  },
  "marketplace-trade": {
    title: "How Marketplace Trades Work",
    icon: <Code2 className="h-5 w-5" />,
    color: "#F59E0B",
    slides: [
      {
        heading: "Tradeable Assets vs Achievement NFTs",
        body: "Marketplace collectibles (exoplanets, rocket skins) are separate from achievement NFTs. They use a different contract that includes transfer() and a listing mechanism. Achievement NFTs have no transfer function — they are permanently distinct.",
      },
      {
        heading: "The Marketplace Contract Flow",
        body: "When you buy an asset: (1) you sign a buy() call, (2) the contract verifies payment, (3) ownership is transferred atomically on-chain. The asset cannot be in two places at once — the ledger is the single source of truth.",
        code: "buy(buyer, asset_id) {\n  buyer.require_auth();\n  // payment + ownership transfer\n  // happens atomically in one tx\n}",
      },
      {
        heading: "On-Chain Verifiable Ownership",
        body: "Your owned assets are readable directly from the Soroban contract via get_owner(asset_id). No CosmosX backend can forge this. Anyone can verify your portfolio on Stellar Expert by inspecting contract storage.",
      },
    ],
    explorerLink: "https://stellar.expert/explorer/testnet",
  },
};

export default function FreighterSimulator({
  isOpen,
  onClose,
  context,
  walletAddress,
}: FreighterEducatorProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const lesson = LESSONS[context];

  // Reset slide on open
  const handleClose = () => {
    setSlideIndex(0);
    onClose();
  };

  if (!isOpen) return null;

  const slide = lesson.slides[slideIndex];
  const isFirst = slideIndex === 0;
  const isLast = slideIndex === lesson.slides.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-[440px] overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-white/[0.02] border-b border-white/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${lesson.color}cc, ${lesson.color}66)`,
                boxShadow: `0 0 12px ${lesson.color}40`,
              }}
            >
              <span style={{ color: "white" }}>{lesson.icon}</span>
            </div>
            <div>
              <h3 className="font-display text-[13px] font-bold text-white">{lesson.title}</h3>
              <p className="font-mono text-[9px] text-indigo-400 uppercase tracking-wider">
                CosmosX Learning Module
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-white/5 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Wallet address strip — shows real connected address for context */}
        {walletAddress && (
          <div className="bg-emerald-950/20 px-4 py-2 border-b border-white/5 flex justify-between items-center text-[10px] font-mono text-white/60">
            <span>
              Your address:{" "}
              <span className="text-emerald-400 font-bold">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-6)}
              </span>
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Freighter connected
            </span>
          </div>
        )}

        {/* Slide indicator */}
        <div className="flex gap-1 px-4 pt-4 pb-1">
          {lesson.slides.map((_, i) => (
            <div
              key={i}
              className="h-0.5 flex-1 rounded-full transition-all duration-300"
              style={{
                backgroundColor: i <= slideIndex ? lesson.color : "rgba(255,255,255,0.08)",
              }}
            />
          ))}
        </div>

        {/* Slide content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slideIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="px-5 py-4 min-h-[200px] space-y-3"
          >
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" style={{ color: lesson.color }} />
              <h4 className="font-display text-[14px] font-bold text-white">{slide.heading}</h4>
            </div>
            <p className="text-[12px] text-muted-foreground leading-relaxed">{slide.body}</p>
            {slide.code && (
              <pre className="bg-black/40 border border-white/5 rounded-xl px-3 py-2.5 font-mono text-[10px] text-emerald-300 whitespace-pre-wrap break-all">
                {slide.code}
              </pre>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Explorer link */}
        {lesson.explorerLink && isLast && (
          <div className="px-5 pb-2">
            <a
              href={lesson.explorerLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-[10px] font-mono text-indigo-400 hover:text-indigo-300 transition"
            >
              <ExternalLink className="h-3 w-3" />
              Verify on Stellar Expert Testnet
            </a>
          </div>
        )}

        {/* Navigation footer */}
        <div className="bg-white/[0.02] border-t border-white/5 p-4 flex gap-3">
          <button
            onClick={() => setSlideIndex((i) => Math.max(0, i - 1))}
            disabled={isFirst}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 font-mono text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-30"
          >
            ← Previous
          </button>
          {isLast ? (
            <button
              onClick={handleClose}
              className="flex-1 rounded-xl py-2.5 font-mono text-xs font-bold text-slate-950 transition"
              style={{
                background: `linear-gradient(135deg, ${lesson.color}, ${lesson.color}99)`,
              }}
            >
              Got it ✓
            </button>
          ) : (
            <button
              onClick={() => setSlideIndex((i) => Math.min(lesson.slides.length - 1, i + 1))}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 font-mono text-xs font-bold text-white transition"
              style={{
                background: `linear-gradient(135deg, ${lesson.color}cc, ${lesson.color}66)`,
              }}
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}



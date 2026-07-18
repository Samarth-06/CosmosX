import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Info,
  Terminal,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  FlaskConical,
  HelpCircle,
  Database,
  Network,
  ChevronRight,
  Zap,
  Lock,
  Check,
} from "lucide-react";
import { TaskDef } from "@/lib/mercury-curriculum";
import { saveTaskScore } from "@/lib/module1-store";
import CosmosTerminal, { TerminalMissionId } from "@/components/module/CosmosTerminal";
import AppendOnlyLedgerSimulation from "@/components/module/AppendOnlyLedgerSimulation";
import TransactionLifecycleSimulation from "@/components/module/TransactionLifecycleSimulation";
import GenesisBlockSimulation from "@/components/module/GenesisBlockSimulation";
import NetworkThroughputSimulation from "@/components/module/NetworkThroughputSimulation";
import ChainIntegritySimulation from "@/components/module/ChainIntegritySimulation";
import ChapterChallengeSimulation from "@/components/module/ChapterChallengeSimulation";
import CryptographicHashSimulation from "@/components/module/CryptographicHashSimulation";
import AvalancheEffectSimulation from "@/components/module/AvalancheEffectSimulation";
import HashingVsEncryptionSimulation from "@/components/module/HashingVsEncryptionSimulation";
import AlienTransmissionSimulation from "@/components/module/AlienTransmissionSimulation";
import Sha256CalibrationChallenge from "@/components/module/Sha256CalibrationChallenge";
import HashLinkChainMonitor from "@/components/module/HashLinkChainMonitor";
import BlockDominoMonitor from "@/components/module/BlockDominoMonitor";
import BlockHeaderSealingEngine from "@/components/module/BlockHeaderSealingEngine";
import DecentralizedConsensusCommand from "@/components/module/DecentralizedConsensusCommand";
import GalacticBlockchainRepair from "@/components/module/GalacticBlockchainRepair";
import NetworkTopologyCommandCenter from "@/components/module/NetworkTopologyCommandCenter";
import BlockchainNodeOperations from "@/components/module/BlockchainNodeOperations";
import P2PGossipPropagation from "@/components/module/P2PGossipPropagation";
import FaultToleranceCommand from "@/components/module/FaultToleranceCommand";
import MercuryNetworkRecovery from "@/components/module/MercuryNetworkRecovery";
import ByzantineConsensusWarRoom from "@/components/module/ByzantineConsensusWarRoom";
import PoWvsPoSSimulation from "@/components/module/PoWvsPoSSimulation";
import FederatedConsensusSimulator from "@/components/module/FederatedConsensusSimulator";
import DoubleSpendAuditor from "@/components/module/DoubleSpendAuditor";
import GalacticCouncilConsensus from "@/components/module/GalacticCouncilConsensus";
import SupplyChainAuditTracker from "@/components/module/SupplyChainAuditTracker";
import BlockchainTradeoffsCalculator from "@/components/module/BlockchainTradeoffsCalculator";
import RealWorldUseCasesMatcher from "@/components/module/RealWorldUseCasesMatcher";
import DatabaseVsBlockchainMatrix from "@/components/module/DatabaseVsBlockchainMatrix";
import GalacticTechnologyDecision from "@/components/module/GalacticTechnologyDecision";

interface Props {
  taskDef: TaskDef;
  moduleColor: string;
  onComplete: () => void;
}

const TERMINAL_MISSION_BY_TASK: Record<string, TerminalMissionId> = {
  task2_2: "ledger-audit",
  task4_1: "hash-fingerprint",
  task4_4: "signal-integrity",
  task5_3: "block-header",
};

// ─── Keyword Highlighter ────────────────────────────────────────────────────
const BLOCKCHAIN_KEYWORDS = [
  "blockchain", "block", "hash", "sha-256", "sha256", "consensus", "ledger",
  "node", "nodes", "transaction", "mempool", "validator", "validators", "quorum",
  "immutability", "transparency", "traceability", "nonce", "genesis", "peer-to-peer",
  "distributed", "decentralized", "centralized", "append-only", "proof of work",
  "proof of stake", "byzantine", "gossip", "cryptographic", "signature", "private key",
  "public key", "tps", "throughput", "escrow", "single point of failure",
  "intermediary", "intermediaries", "tamper", "avalanche effect", "merkle",
  "tokenization", "defi", "immutable", "trustless", "stellar", "scp",
];

function HighlightedText({ text, color }: { text: string; color: string }) {
  const pattern = new RegExp(`(${BLOCKCHAIN_KEYWORDS.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const parts = text.split(pattern);
  return (
    <span>
      {parts.map((part, i) =>
        BLOCKCHAIN_KEYWORDS.some(k => k.toLowerCase() === part.toLowerCase()) ? (
          <span key={i} style={{ color }} className="font-bold font-mono text-[10px]">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

function TheorySection({ text, color }: { text: string; color: string }) {
  const paragraphs = text.split("\n\n").filter(Boolean);
  const numbered = paragraphs.filter(p => /^\d+\./.test(p.trim()));
  const prose = paragraphs.filter(p => !/^\d+\./.test(p.trim()));

  return (
    <div className="space-y-3 text-[10.5px] leading-relaxed text-slate-300">
      {prose.map((para, i) => (
        <p key={i} className="font-sans">
          <HighlightedText text={para} color={color} />
        </p>
      ))}
      {numbered.length > 0 && (
        <div className="space-y-1.5">
          {numbered.map((item, i) => {
            const match = item.match(/^(\d+\.\s*)(.*)/s);
            if (!match) return null;
            return (
              <div key={i} className="flex gap-2 bg-slate-900/40 border border-white/5 rounded-xl p-2.5">
                <span style={{ color }} className="font-mono font-bold text-[10px] shrink-0 mt-0.5">{match[1]}</span>
                <span className="font-sans text-slate-300">
                  <HighlightedText text={match[2]} color={color} />
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── MCQ Component ──────────────────────────────────────────────────────────
interface MCQQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

function MCQPanel({
  questions,
  color,
  taskId,
  onComplete,
}: {
  questions: MCQQuestion[];
  color: string;
  taskId: string;
  onComplete: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const q = questions[idx];
  const selected = answers[idx] ?? null;
  const isCorrect = selected === q.correct;

  const handleSelect = (opt: number) => {
    if (selected !== null) return;
    setAnswers(prev => ({ ...prev, [idx]: opt }));
  };

  const handleNext = () => {
    if (idx < questions.length - 1) setIdx(i => i + 1);
    else {
      saveTaskScore(taskId, 10, 10, true);
      onComplete();
    }
  };

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Progress dots */}
      <div className="flex gap-1.5 justify-center">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`w-5 h-5 rounded-full text-[8px] font-mono font-bold transition-all border ${
              i === idx
                ? "scale-110"
                : answers[i] !== undefined
                ? answers[i] === questions[i].correct
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                  : "bg-rose-500/20 border-rose-500/40 text-rose-400"
                : "bg-slate-900 border-white/10 text-slate-500"
            }`}
            style={i === idx ? { backgroundColor: `${color}20`, borderColor: `${color}60`, color } : {}}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Question */}
      <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-3.5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <HelpCircle className="w-3.5 h-3.5" style={{ color }} />
          <span className="text-[8.5px] font-mono text-slate-400 uppercase tracking-widest font-bold">
            Q{idx + 1} of {questions.length}
          </span>
        </div>
        <p className="text-[11px] text-white font-bold leading-relaxed">{q.question}</p>
      </div>

      {/* Options */}
      <div className="grid gap-1.5 flex-1">
        {q.options.map((opt, i) => {
          const isSel = selected === i;
          const isCorr = i === q.correct;
          let cls = "bg-slate-950/60 hover:bg-slate-900 border-white/10 text-slate-300 hover:border-cyan-500/30";
          if (selected !== null) {
            if (isCorr) cls = "bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold";
            else if (isSel) cls = "bg-rose-950/40 border-rose-500 text-rose-300";
            else cls = "bg-slate-950/20 border-white/5 text-slate-600 opacity-50";
          }
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={selected !== null}
              className={`text-left border rounded-2xl px-3.5 py-2 text-[10px] font-mono transition-all flex items-center justify-between cursor-pointer ${cls}`}
            >
              <span>{opt}</span>
              {selected !== null && isCorr && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
              {selected !== null && isSel && !isCorr && <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Explanation + Proceed */}
      <AnimatePresence mode="wait">
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className={`rounded-2xl p-2.5 border text-[9.5px] font-mono leading-relaxed ${
              isCorrect
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/20 text-rose-300"
            }`}>
              <span className="font-bold block mb-0.5">
                {isCorrect ? "✓ Correct Analysis" : "✗ Incorrect — Read the debrief"}
              </span>
              {q.explanation}
            </div>
            <button
              onClick={handleNext}
              className="w-full flex items-center justify-center gap-1.5 text-slate-950 font-bold py-2.5 rounded-2xl text-[9px] font-rushblade uppercase tracking-wider transition cursor-pointer shadow-lg"
              style={{ backgroundColor: color }}
            >
              {idx < questions.length - 1 ? "Next Question" : "Complete Task"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation row */}
      <div className="flex justify-between items-center">
        <button
          disabled={idx === 0}
          onClick={() => setIdx(i => i - 1)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/10 text-[8px] font-mono text-slate-400 hover:text-white disabled:opacity-20 transition cursor-pointer"
        >
          <ArrowLeft className="w-2.5 h-2.5" /> Prev
        </button>
        <button
          disabled={idx === questions.length - 1}
          onClick={() => setIdx(i => i + 1)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/10 text-[8px] font-mono text-slate-400 hover:text-white disabled:opacity-20 transition cursor-pointer"
        >
          Next <ArrowRight className="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Per-task MCQ data ──────────────────────────────────────────────────────
const TASK_MCQ: Record<string, MCQQuestion[]> = {
  task2_1: [
    { question: "What does 'TxID' stand for in a blockchain transaction?", options: ["Transfer Index Digit", "Transaction Identifier (hash)", "Terminal ID", "Token Index Descriptor"], correct: 1, explanation: "TxID is the unique 64-character hash fingerprint of the transaction payload, used to look it up on any block explorer." },
    { question: "Which field identifies who is initiating a transaction?", options: ["Receiver address", "Sequence number", "Sender (source) address", "Transaction fee"], correct: 2, explanation: "The sender address is the public key of the account that signs and sends the transaction." },
  ],
  task2_2: [
    { question: "How does a blockchain compute current account balances?", options: ["It stores a single number that gets updated in place", "It replays the full append-only transaction history", "It uses a central bank database", "It checks a cached snapshot every 10 minutes"], correct: 1, explanation: "Balances are derived by scanning every transaction from the genesis block — no mutable state is ever stored." },
    { question: "What does 'append-only' mean for a blockchain ledger?", options: ["Data can only be read, not written", "New entries can be added but existing ones cannot be deleted or changed", "The ledger is stored on a central server only", "Blocks are appended only after 24 hours"], correct: 1, explanation: "Append-only means records are permanently written. Any historical record is immutable once confirmed in a block." },
  ],
  task2_3: [
    { question: "What is the Mempool?", options: ["A mining pool of validators", "The temporary holding queue for unconfirmed transactions", "A cache of completed blocks", "A type of hash function"], correct: 1, explanation: "The mempool (memory pool) is where validated but unconfirmed transactions wait before a validator picks them up." },
    { question: "What happens BEFORE a transaction enters the mempool?", options: ["It is added to a block", "It is signed by the sender's private key", "It is confirmed by validators", "It is hashed into a block header"], correct: 1, explanation: "A transaction must be constructed and signed by the sender's private key before being broadcast to the network." },
  ],
  task3_1: [
    { question: "Which part of a block contains the list of transactions?", options: ["Block header", "Block nonce", "Block body", "Block hash"], correct: 2, explanation: "The block body contains the actual transaction payloads. The header contains only metadata like height, timestamp, and hashes." },
    { question: "Why is the block header separated from the block body?", options: ["To reduce encryption complexity", "To allow light nodes to verify history without downloading all transactions", "To speed up mining nonces", "To support multiple currencies"], correct: 1, explanation: "Light clients only need headers to verify the chain, not every full transaction — enabling efficient verification on low-resource devices." },
  ],
  task3_2: [
    { question: "What is unique about the Genesis Block's 'previous block ID' field?", options: ["It points to Block 1", "It contains the founder's hash", "It is all zeros — no parent exists", "It is identical to the block hash"], correct: 2, explanation: "The genesis block has no parent, so its previous block ID is hardcoded as all zeros." },
    { question: "What does the Genesis Block define for a blockchain network?", options: ["The mining algorithm only", "Initial state, allocations, and network parameters", "The validator quorum only", "The transaction fee structure"], correct: 1, explanation: "The genesis file seeds the entire network state: initial token allocations, network IDs, and consensus parameters." },
  ],
  task3_3: [
    { question: "If block time doubles and block size stays the same, what happens to TPS?", options: ["TPS doubles", "TPS halves", "TPS stays the same", "TPS becomes infinite"], correct: 1, explanation: "TPS = Max Transactions Per Block / Block Time. Doubling block time with the same capacity cuts TPS in half." },
    { question: "Why are block sizes limited in blockchains?", options: ["To prevent storage bloat, bandwidth strain, and processing delays", "To keep transaction fees high", "To reward miners more", "To prevent duplicate transactions"], correct: 0, explanation: "Block size limits prevent runaway storage growth, keep propagation fast, and ensure all nodes can process blocks in time." },
  ],
  task3_4: [
    { question: "How does a blockchain link blocks chronologically?", options: ["Timestamps alone", "A previous block hash reference in each block's header", "Sequential block numbers only", "A central coordinator assigns order"], correct: 1, explanation: "Each block header contains the hash of its parent block. This cryptographic pointer creates an unbreakable chain of history." },
    { question: "What happens if you try to insert a block in the middle of the chain?", options: ["All downstream block hashes become invalid", "Only the inserted block is rejected", "The chain accepts it with a warning", "Nothing changes"], correct: 0, explanation: "Inserting a block invalidates all subsequent hash references, making the tampering immediately visible to every node." },
  ],
  task4_1: [
    { question: "What does SHA-256 always produce regardless of input size?", options: ["Variable length output based on input", "Exactly 64 hexadecimal characters", "A human-readable phrase", "An integer between 0 and 100"], correct: 1, explanation: "SHA-256 always produces exactly 256 bits = 64 hexadecimal characters, no matter if the input is 1 byte or 1 gigabyte." },
    { question: "What property makes hashing 'one-way'?", options: ["The output is always shorter than the input", "You cannot reverse the hash to find the original input", "The same input produces different outputs each time", "Hashing requires a secret key to compute"], correct: 1, explanation: "One-way means the mathematical operation is computationally irreversible. No algorithm can recover the input from just a hash." },
  ],
  task4_2: [
    { question: "The avalanche effect means that changing one character in the input produces...", options: ["A slightly different hash", "An identical hash for security", "A completely unpredictable new hash", "A hash that is 1 character different"], correct: 2, explanation: "A single bit change causes roughly half the output bits to flip — making the new hash look completely unrelated to the original." },
    { question: "Why is the avalanche effect critical for blockchain security?", options: ["It makes mining faster", "It prevents anyone from predicting or incrementally brute-forcing block hashes", "It allows validators to communicate faster", "It reduces the size of transactions"], correct: 1, explanation: "The avalanche effect ensures attackers can't perform incremental search attacks to forge block headers or transaction hashes." },
  ],
  task4_3: [
    { question: "Which operation is used to STORE passwords securely in a database?", options: ["Encryption (so admins can decrypt)", "Compression (to save space)", "Hashing (one-way, irreversible)", "Encoding (Base64)"], correct: 2, explanation: "Passwords are hashed because even database administrators shouldn't be able to read them. Encryption would allow decryption." },
    { question: "What is the fundamental difference between hashing and encryption?", options: ["Hashing uses a key; encryption doesn't", "Hashing is reversible; encryption is not", "Encryption is one-way; hashing uses two keys", "Hashing is one-way and keyless; encryption is two-way and requires a key"], correct: 3, explanation: "Hashing: no key, one-way, fixed output. Encryption: requires a key, reversible, output grows with input." },
  ],
  task4_4: [
    { question: "Why can hashing detect a tampered file transmission?", options: ["Because hashes use timestamps", "Because the same input always produces the same hash — any change creates a totally different hash", "Because hashes encrypt the file", "Because the network signs each file with a private key"], correct: 1, explanation: "Determinism means any bit change produces a completely different hash. Compare expected vs actual hash to instantly detect tampering." },
    { question: "How does blockchain use hashing to protect transaction data?", options: ["Each transaction is encrypted with a shared key", "Each transaction is hashed to create a TxID fingerprint — any edit invalidates it", "Transactions are hashed only after mining", "Validators sign each other's hashes"], correct: 1, explanation: "Transaction hashes (TxIDs) are deterministic fingerprints. Edit a transaction and its TxID changes — exposing the tampering instantly." },
  ],
  task5_1: [
    { question: "Block 4's header contains Block 3's hash. If Block 3's data changes, what happens?", options: ["Block 4's hash stays the same", "Block 3's hash changes, and Block 4's reference is now broken", "Only Block 3 is invalidated", "The network automatically repairs Block 4"], correct: 1, explanation: "Block 3's hash changes completely due to the avalanche effect. Block 4's 'prev_block_id' reference no longer matches — breaking the link." },
    { question: "What is the field name in a block header that links it to its parent?", options: ["parent_hash", "prev_block_id", "ancestor_reference", "block_pointer"], correct: 1, explanation: "The 'prev_block_id' field stores the parent block's hash, creating the cryptographic chain link." },
  ],
  task5_2: [
    { question: "An attacker modifies Block 2 in a 10-block chain. How many blocks become invalid?", options: ["Only Block 2", "Block 2 and Block 3 only", "All blocks from Block 2 onwards (9 blocks)", "None, the chain repairs itself"], correct: 2, explanation: "Every subsequent block has an outdated 'prev_block_id' reference. All 9 blocks must be recomputed — an enormous amount of work." },
    { question: "What is a '51% attack'?", options: ["Sending 51 transactions simultaneously", "An attacker controlling 51% of network hash power to overwrite history", "51% of nodes going offline at once", "Stealing 51% of validator keys"], correct: 1, explanation: "If an attacker controls >50% of the network's hash power, they can mine a longer fraudulent chain faster than the honest chain." },
  ],
  task5_3: [
    { question: "What inputs are concatenated to compute a block's hash?", options: ["Only the list of transactions", "Block height, timestamp, prev hash, tx root, and nonce", "The sender's private key and receiver address", "Block ID and node signature only"], correct: 1, explanation: "A block's hash is SHA256(height + timestamp + prev_block_id + tx_root + nonce) — sealing all header data into one fingerprint." },
    { question: "What is a block nonce used for?", options: ["Counting the number of transactions", "A random number miners adjust to find a valid hash that meets the difficulty target", "The block's unique ID number", "The validator's identity code"], correct: 1, explanation: "In Proof of Work, miners repeatedly change the nonce until the block hash starts with enough leading zeros to satisfy the difficulty target." },
  ],
  task5_4: [
    { question: "Why can't an attacker simply recalculate all block hashes to commit fraud?", options: ["It is mathematically impossible to compute SHA-256", "They would need to outpace the entire honest network's combined hashing power", "Validators would ignore the new chain", "Block hashes cannot be computed twice"], correct: 1, explanation: "The honest network keeps building the real chain. An attacker must mine faster than all honest nodes combined — practically impossible for large networks." },
    { question: "What rule do blockchain nodes follow when choosing which chain is valid?", options: ["The oldest chain wins", "The chain with the most transaction fees wins", "The longest valid chain with the most proof-of-work wins", "The chain proposed by the most trusted node wins"], correct: 2, explanation: "The 'Nakamoto Consensus' longest-chain rule means the chain representing the most accumulated computational work is accepted as the truth." },
  ],
  task6_1: [
    { question: "In a fully distributed (mesh) network, what is the number of links for N nodes?", options: ["N links", "N × 2 links", "N(N-1)/2 links", "N² links"], correct: 2, explanation: "Each of N nodes connects to N-1 others, and each link is shared: N(N-1)/2 = 15 links for 6 nodes." },
    { question: "What is the main advantage of a distributed mesh network over centralized?", options: ["It is cheaper to run", "It processes transactions faster", "It has no single point of failure — every node is a redundant peer", "It requires less storage space"], correct: 2, explanation: "In a mesh network, any node can fail without bringing down the system. There is no central server to attack or take offline." },
  ],
  task6_2: [
    { question: "What is a Full Node vs a Light Node?", options: ["Full nodes validate; light nodes mine", "Full nodes store complete ledger history; light nodes only store block headers", "Full nodes are faster; light nodes are more secure", "Full nodes only exist on mainnet; light nodes on testnet"], correct: 1, explanation: "Full nodes keep every transaction ever recorded. Light nodes (SPV) only keep block headers and rely on full nodes for transaction proof." },
    { question: "What is a Validator Node responsible for?", options: ["Storing the ledger backup only", "Generating user wallets", "Participating in consensus voting to add new blocks", "Fetching prices from exchanges"], correct: 2, explanation: "Validator nodes actively propose and vote on new blocks, directly participating in the consensus mechanism to secure the network." },
  ],
  task6_3: [
    { question: "In a gossip protocol, what happens when a node receives an INVALID transaction?", options: ["It forwards it to peers with a warning tag", "It stores it in a special buffer", "It immediately rejects it and stops propagation", "It votes with other nodes before deciding"], correct: 2, explanation: "Invalid transactions are blocked at the first node that detects them. They never propagate — protecting the entire network from contamination." },
    { question: "Why does a peer-to-peer gossip network need no central coordinator?", options: ["Because all nodes vote simultaneously", "Because each node independently validates and forwards to peers — creating decentralized propagation", "Because transactions are broadcast via satellite", "Because the genesis node acts as root coordinator"], correct: 1, explanation: "In gossip protocols, each node is an autonomous validator. Transactions spread organically — like a rumour — through trusted peer-to-peer links." },
  ],
  task6_4: [
    { question: "For a Byzantine Fault Tolerant network to survive f malicious nodes, how many total nodes (n) are needed?", options: ["n ≥ 2f", "n ≥ 3f + 1", "n ≥ f + 1", "n ≥ 4f"], correct: 1, explanation: "BFT requires n ≥ 3f + 1. For 3 malicious nodes, you need at least 10 total nodes to maintain honest majority consensus." },
    { question: "What is Crash Fault Tolerance (CFT)?", options: ["Tolerance for hash collisions", "The ability to maintain consensus even when nodes stop responding (crash)", "Recovery from accidental private key deletion", "Tolerance for network latency spikes"], correct: 1, explanation: "CFT handles nodes that simply go offline (crash). BFT handles nodes that can behave maliciously, not just crash." },
  ],
  task7_1: [
    { question: "In the Byzantine Generals Problem, what percentage of generals must be honest for consensus to work?", options: ["More than 50%", "More than 66% (two-thirds)", "100% honesty required", "More than 25%"], correct: 1, explanation: "Byzantine Fault Tolerance requires more than 2/3 honest participants. With 1/3 traitors, it becomes mathematically impossible to guarantee consensus." },
    { question: "What real-world problem does the Byzantine Generals model represent?", options: ["Hashing block headers efficiently", "Reaching agreement between unknown parties where some may be dishonest", "Calculating transaction fees", "Routing data through satellite links"], correct: 1, explanation: "The Byzantine Generals Problem is an analogy for distributed consensus: strangers must agree on a truth even when some participants lie." },
  ],
  task7_2: [
    { question: "In Proof of Work, what resource is consumed to earn block proposal rights?", options: ["Staked cryptocurrency", "Electricity and computational hardware (hash power)", "Network bandwidth", "Storage space on the node"], correct: 1, explanation: "PoW miners compete by burning real-world electricity and specialized ASIC hardware to find a valid block hash — creating a thermodynamic cost barrier." },
    { question: "In Proof of Stake, what prevents validators from approving fraudulent blocks?", options: ["They have no incentive either way", "Their staked collateral tokens are 'slashed' (destroyed) as punishment", "A central authority penalizes them", "Network bandwidth is throttled"], correct: 1, explanation: "Validators lock up tokens as collateral. Approving invalid blocks risks 'slashing' — the automatic confiscation of their stake — aligning incentives with honesty." },
  ],
  task7_3: [
    { question: "What is a Quorum Slice in Stellar's Federated Consensus?", options: ["A group of validators a node selects to trust for consensus", "A mathematical formula for hashing", "A block validation timer", "A transaction fee pool"], correct: 0, explanation: "Each node selects a quorum slice — the specific set of validators it trusts. When slices overlap globally, consensus propagates network-wide." },
    { question: "Why is Stellar's SCP more energy-efficient than Proof of Work?", options: ["It uses specialized mining chips", "It doesn't require competitive hash computation — consensus is based on overlapping trust slices", "It validates fewer transactions per second", "It uses a central voting authority"], correct: 1, explanation: "SCP reaches finality through social trust agreements between validator organizations, requiring no thermodynamic resource expenditure." },
  ],
  task7_4: [
    { question: "Two transactions compete for the same funds. Which one wins?", options: ["The larger transaction amount wins", "The transaction with the earlier timestamp is processed first", "The one from the higher-reputation sender", "Both are rejected to prevent fraud"], correct: 1, explanation: "Transaction ordering is determined by timestamp within a block. The earlier transaction executes first, and if it drains the balance, the second is rejected." },
    { question: "What is a double-spend attack?", options: ["Sending a transaction twice by accident", "Attempting to spend the same funds in two conflicting transactions simultaneously", "Mining the same block twice", "Signing a transaction with two different private keys"], correct: 1, explanation: "A double-spend tries to pay two different recipients with the same funds. Blockchain prevents this through consensus-enforced transaction ordering." },
  ],
  task8_1: [
    { question: "What does blockchain 'immutability' mean?", options: ["Transactions can be edited by validators", "Once a block is confirmed, its contents cannot be altered without recomputing all subsequent blocks", "Only the genesis block is permanent", "Data can be updated using admin keys"], correct: 1, explanation: "Immutability means past records are computationally locked. The hash chain dependency makes retroactive editing impractical." },
    { question: "How does blockchain traceability help with supply chain fraud?", options: ["It encrypts product data so competitors can't read it", "It creates an auditable chain of custody from manufacturer to consumer — visible to anyone", "It speeds up shipment processing", "It centralizes logistics data for efficiency"], correct: 1, explanation: "Every transfer of a physical asset can be recorded on-chain. Anyone can trace a product's complete journey, exposing counterfeit or stolen goods." },
  ],
  task8_2: [
    { question: "Bitcoin processes approximately 7 TPS. A concert sells 100,000 tickets in 1 minute. Can Bitcoin handle this?", options: ["Yes, blockchain scales automatically", "No — it would take over 4 hours at 7 TPS", "Yes, with a layer-2 upgrade active", "No, but only because of high fees"], correct: 1, explanation: "100,000 txs / 7 TPS = ~14,286 seconds = ~4 hours. A centralized database handles millions of TPS instantly for this use case." },
    { question: "What happens to your blockchain funds if you lose your private key?", options: ["You can recover it through customer support", "The funds are permanently inaccessible — no one can help you", "Validators can reset your key after identity verification", "A multi-sig backup automatically activates"], correct: 1, explanation: "There is no 'forgot password' on a blockchain. Private key loss means permanent fund loss — the ultimate tradeoff of trustless self-custody." },
  ],
  task8_3: [
    { question: "Which scenario is BEST suited for blockchain vs. a traditional database?", options: ["A hospital's internal patient record system", "A government's internal payroll processing", "Cross-border remittances between mutually distrusting banks", "A company's internal inventory tracking"], correct: 2, explanation: "Blockchain solves the trust problem between multiple distrusting parties writing to a shared record. Single-organization systems are better served by traditional databases." },
    { question: "What is DeFi (Decentralized Finance)?", options: ["A blockchain that processes faster than banks", "Permissionless financial services (lending, trading) built on smart contracts without banks or intermediaries", "A government-issued digital currency", "A centralized exchange for crypto assets"], correct: 1, explanation: "DeFi uses smart contracts on blockchains to replicate financial services — lending, borrowing, trading — without banks or centralized operators." },
  ],
  task8_4: [
    { question: "When should you choose a Traditional Database over Blockchain?", options: ["When multiple distrusting organizations need to write shared records", "When a single organization controls all writers and trusts its own data", "When you need maximum transaction transparency", "When you can't afford a central server"], correct: 1, explanation: "If a single trusted organization controls all data writes, a traditional database is faster, cheaper, and simpler. Blockchain adds unnecessary overhead." },
    { question: "In the decision matrix, what is the KEY question that determines blockchain vs. database?", options: ["How many transactions per second do you need?", "Do multiple DISTRUSTING parties need to write to the same shared record?", "How large will the dataset grow?", "Does the data need to be encrypted?"], correct: 1, explanation: "The core question: are multiple mutually distrusting parties writing shared data without a trusted intermediary? If yes — blockchain. If no — database." },
  ],
};

type Step = "theory" | "challenge" | "complete";

interface SidebarTask {
  id: Step;
  label: string;
  hint: string;
  icon: string;
}

const SIDEBAR_TASKS: SidebarTask[] = [
  { id: "theory", label: "Core Theory", hint: "Review technical concepts and key terms.", icon: "📖" },
  { id: "challenge", label: "Active Lab", hint: "Interact with widgets/inputs to verify parameters.", icon: "🔬" },
  { id: "complete", label: "Verification", hint: "Confirm analysis and lock checkpoint.", icon: "🏆" },
];

// ─── Main Component ─────────────────────────────────────────────────────────
export default function GenericSandboxRunner({ taskDef, moduleColor, onComplete }: Props) {
  const [step, setStep] = useState<Step>("theory");
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintStep, setHintStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // Drag-Drop sequences and classifications
  const [selectedSequence, setSelectedSequence] = useState<string[]>([]);
  const [classifications, setClassifications] = useState<Record<number, string>>({});
  const [selectedNodes, setSelectedNodes] = useState<number[]>([]);
  const [valApprovals, setValApprovals] = useState<Record<string, string>>({});
  const [doubleSpendStep, setDoubleSpendStep] = useState<string | null>(null);

  // Blockchain tamper simulator
  const [blockchainBlocks, setBlockchainBlocks] = useState([
    { id: 1, hash: "0000a12f", prev: "00000000", status: "valid", data: "Genesis block allocation" },
    { id: 2, hash: "0000e39a", prev: "0000a12f", status: "valid", data: "Tx: Alpha → 300 → Beta" },
    { id: 3, hash: "0000b21f", prev: "0000e39a", status: "valid", data: "Tx: Beta → 100 → Gamma" },
    { id: 4, hash: "0000d8c2", prev: "0000b21f", status: "valid", data: "Tx: Gamma → 50 → Alpha" },
    { id: 5, hash: "0000f91a", prev: "0000d8c2", status: "valid", data: "Tx: Beta → 50 → Alpha" },
  ]);
  const [tamperIndex, setTamperIndex] = useState<number | null>(null);

  // Sync state on task change
  useEffect(() => {
    setInputs({});
    setErrorMessage(null);
    setSuccess(false);
    setSubmitted(false);
    setShowHint(false);
    setHintStep(0);
    setSelectedSequence([]);
    setClassifications({});
    setSelectedNodes([]);
    setValApprovals({});
    setDoubleSpendStep(null);
    setTamperIndex(null);
    setStep("theory");
    setBlockchainBlocks([
      { id: 1, hash: "0000a12f", prev: "00000000", status: "valid", data: "Genesis block allocation" },
      { id: 2, hash: "0000e39a", prev: "0000a12f", status: "valid", data: "Tx: Alpha → 300 → Beta" },
      { id: 3, hash: "0000b21f", prev: "0000e39a", status: "valid", data: "Tx: Beta → 100 → Gamma" },
      { id: 4, hash: "0000d8c2", prev: "0000b21f", status: "valid", data: "Tx: Gamma → 50 → Alpha" },
      { id: 5, hash: "0000f91a", prev: "0000d8c2", status: "valid", data: "Tx: Beta → 50 → Alpha" },
    ]);
  }, [taskDef.id]);

  const stepsOrder: Step[] = ["theory", "challenge", "complete"];
  const currentIdx = stepsOrder.indexOf(step);

  useEffect(() => {
    if (success) {
      setStep("complete");
    }
  }, [success]);

  useEffect(() => {
    const notifyState = () => {
      const urlMapping: Record<Step, string> = {
        theory: "theory",
        challenge: "active-lab",
        complete: "verification",
      };
      
      window.dispatchEvent(
        new CustomEvent("cosmos-x-nav-state", {
          detail: {
            canGoBack: currentIdx > 0,
            canGoForward: currentIdx < stepsOrder.length - 1 && (stepsOrder[currentIdx + 1] !== "complete" || success),
            currentStep: urlMapping[step],
          },
        })
      );
    };
    notifyState();

    const handleBack = () => {
      if (currentIdx > 0) {
        setStep(stepsOrder[currentIdx - 1]);
      }
    };
    const handleForward = () => {
      if (currentIdx < stepsOrder.length - 1 && (stepsOrder[currentIdx + 1] !== "complete" || success)) {
        setStep(stepsOrder[currentIdx + 1]);
      }
    };
    const handleReset = () => {
      setInputs({});
      setErrorMessage(null);
      setSuccess(false);
      setSubmitted(false);
      setShowHint(false);
      setHintStep(0);
      setSelectedSequence([]);
      setClassifications({});
      setSelectedNodes([]);
      setValApprovals({});
      setDoubleSpendStep(null);
      setTamperIndex(null);
      setStep("theory");
    };

    window.addEventListener("cosmos-x-nav-back", handleBack);
    window.addEventListener("cosmos-x-nav-forward", handleForward);
    window.addEventListener("cosmos-x-nav-reset", handleReset);

    return () => {
      window.removeEventListener("cosmos-x-nav-back", handleBack);
      window.removeEventListener("cosmos-x-nav-forward", handleForward);
      window.removeEventListener("cosmos-x-nav-reset", handleReset);
    };
  }, [step, success, currentIdx]);

  const handleInputChange = (key: string, val: string) => {
    setInputs(prev => ({ ...prev, [key]: val }));
    setErrorMessage(null);
  };

  const handleClassificationToggle = (index: number, options: string[]) => {
    setClassifications(prev => {
      const cur = prev[index];
      const nextIdx = (options.indexOf(cur) + 1) % options.length;
      return { ...prev, [index]: options[nextIdx] };
    });
    setErrorMessage(null);
  };

  const handleVerify = () => {
    let answer = "";
    const type = taskDef.practical.type;
    if (["inspector", "server-audit", "math-console", "terminal-audit"].includes(type)) {
      answer = (taskDef.practical.inputs || []).map(inp => (inputs[inp.key] || "").trim()).join(":");
    } else if (type === "drag-drop") {
      if (taskDef.id === "task2_3" || taskDef.id === "task3_4") {
        answer = selectedSequence.join("");
      } else if (taskDef.id === "task4_3" || taskDef.id === "task7_2") {
        const count = 6;
        answer = Array.from({ length: count }).map((_, idx) => classifications[idx + 1] || "").join("");
      } else if (taskDef.id === "task4_2") {
        answer = (inputs.char || "").trim();
      } else if (taskDef.id === "task8_3") {
        answer = (inputs.match || "").trim();
      }
    } else if (type === "validator-terminal") {
      if (taskDef.id === "task7_4") answer = (inputs.resolution || "").trim();
      else if (taskDef.id === "task8_4") answer = (inputs.code || "").trim();
    } else if (type === "graph-matcher") {
      if (taskDef.id === "task6_3") answer = selectedNodes.length > 0 ? String(selectedNodes[0]) : "";
      else if (taskDef.id === "task7_3") answer = selectedNodes.sort((a, b) => a - b).join(",");
    } else if (type === "comparison") {
      answer = (inputs.blocks || "").trim();
    }

    const clean = (s: string) => s.replace(/\s+/g, "").toLowerCase();
    setSubmitted(true);
    if (clean(answer) === clean(taskDef.practical.correctAnswer)) {
      setSuccess(true);
      setErrorMessage(null);
      setShowHint(false);
      saveTaskScore(taskDef.id, 10, 10, true);
    } else {
      setErrorMessage("Verification failed — values do not match the expected configuration.");
    }
  };

  const handleSeqClick = (letter: string) => {
    setSelectedSequence(p =>
      p.includes(letter) ? p.filter(l => l !== letter) : [...p, letter]
    );
  };

  const getDragLetters = () => {
    if (taskDef.id === "task2_3") return ["D", "A", "F", "E", "B", "C"];
    if (taskDef.id === "task3_4") return ["Z", "X", "Y", "W"];
    return [];
  };

  const toggleBlockchainTamper = (index: number) => {
    setBlockchainBlocks(prev =>
      prev.map((b, i) => {
        if (i === index) return { ...b, status: "tampered", hash: "0000dead", data: "ATTACKER: Overwrite balance" };
        else if (i > index) return { ...b, status: "broken", prev: i === index + 1 ? "0000dead" : "0000xxxx" };
        return b;
      })
    );
    setTamperIndex(index);
  };

  const correctParts = taskDef.practical.correctAnswer.split(":");
  const hintLabels = (taskDef.practical.inputs || []).map(i => i.label);
  const hasMCQ = TASK_MCQ[taskDef.id] && TASK_MCQ[taskDef.id].length > 0;
  const terminalMission = TERMINAL_MISSION_BY_TASK[taskDef.id];

  return (
    <div className="flex-1 min-h-0 flex bg-[#040816] text-white overflow-hidden w-full h-full">
      {/* Chapter internal navigation */}
      <aside className="w-52 shrink-0 border-r border-white/10 bg-slate-950/40 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-white/8 shrink-0">
          <p className="font-mono text-[8px] text-slate-500 uppercase tracking-widest">
            {taskDef.id.replace("task", "Task ").replace("_", ".")}
          </p>
          <h3 className="font-rushblade text-xs text-white mt-1 leading-snug truncate" style={{ color: moduleColor }}>
            {taskDef.title.split(" — ")[1] || taskDef.title.split(" – ")[1] || taskDef.title}
          </h3>
        </div>

        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1 scrollbar-none">
          {SIDEBAR_TASKS.map((t) => {
            const isActive = step === t.id;
            const isDone = t.id === "theory" ? step !== "theory" : t.id === "challenge" ? success : false;
            const unlocked = true;

            return (
              <button
                key={t.id}
                onClick={() => unlocked && setStep(t.id)}
                disabled={!unlocked}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left transition-all text-[10px] font-mono ${
                  isActive
                    ? "bg-cyan-500/10 border border-cyan-400/20 text-cyan-300"
                    : isDone
                    ? "bg-emerald-500/5 border border-emerald-400/15 text-emerald-400"
                    : unlocked
                    ? "text-slate-400 hover:bg-white/5"
                    : "text-slate-700 cursor-not-allowed"
                }`}
              >
                <span className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 text-[8px] ${
                  isDone ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-400" : isActive ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-400" : "border-white/10 text-slate-600"
                }`}>
                  {isDone ? "✓" : !unlocked ? <Lock className="w-2.5 h-2.5" /> : t.icon}
                </span>
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 bg-violet-500/5 border-t border-white/5 text-[9px] text-slate-400 leading-relaxed shrink-0">
          <span className="font-bold text-violet-300 block mb-0.5">Objective:</span>
          {taskDef.concept}
        </div>
      </aside>

      {/* Main page content container */}
      <main className="flex-1 overflow-y-auto p-6 relative">
        <AnimatePresence mode="wait">
          {/* STEP 1: THEORY */}
          {step === "theory" && (
            <motion.div
              key="theory"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6 w-full max-w-7xl"
            >
              <div>
                <p className="font-mono text-[8px] uppercase tracking-widest" style={{ color: moduleColor }}>
                  Section 1: Technical Theory
                </p>
                <h2 className="text-xl font-bold text-white mt-0.5">
                  {taskDef.title.split(" — ")[1] || taskDef.title.split(" – ")[1] || taskDef.title}
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">{taskDef.concept}</p>
              </div>

              {/* Two-column layout grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
                
                {/* Left Column: Theory prose, glossary and proceed button */}
                <div className={["task2_2", "task2_3", "task3_2", "task3_3", "task3_4", "task3_5", "task4_1", "task4_2", "task4_3", "task4_4", "task4_5", "task5_1", "task5_2", "task5_3", "task5_4", "task5_5", "task6_1", "task6_2", "task6_3", "task6_4", "task6_5"].includes(taskDef.id) ? "lg:col-span-5 space-y-4" : "lg:col-span-7 space-y-4"}>
                  <TheorySection text={taskDef.theoryText} color={moduleColor} />
                  
                  {["task2_2", "task2_3", "task3_2", "task3_3", "task3_4", "task3_5", "task4_1", "task4_2", "task4_3", "task4_4", "task4_5", "task5_1", "task5_2", "task5_3", "task5_4", "task5_5", "task6_1", "task6_2", "task6_3", "task6_4", "task6_5"].includes(taskDef.id) && taskDef.keyTerms && taskDef.keyTerms.length > 0 && (
                    <div
                       className="border rounded-2xl p-4 space-y-3"
                       style={{ borderColor: `${moduleColor}25`, backgroundColor: `${moduleColor}05` }}
                    >
                      <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5" style={{ color: moduleColor }} />
                        <span>Key Terms Glossary</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {taskDef.keyTerms.map((term, idx) => (
                          <div key={idx} className="border border-white/5 bg-slate-950/60 p-2.5 rounded-xl">
                            <span className="font-mono font-bold text-[10px] block" style={{ color: moduleColor }}>
                              {term.term}
                            </span>
                            <span className="text-slate-400 text-[9.5px] mt-0.5 block leading-relaxed">{term.definition}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-start pt-2">
                    <button
                      onClick={() => setStep("challenge")}
                      style={{ backgroundColor: moduleColor }}
                      className="text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs font-mono flex items-center gap-1.5 hover:opacity-90 transition cursor-pointer"
                    >
                      Proceed to Challenge <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Right Column: Visual Simulation or Key Terms Glossary */}
                <div className={["task2_2", "task2_3", "task3_2", "task3_3", "task3_4", "task3_5", "task4_1", "task4_2", "task4_3", "task4_4", "task4_5", "task5_1", "task5_2", "task5_3", "task5_4", "task5_5", "task6_1", "task6_2", "task6_3", "task6_4", "task6_5", "task7_1", "task7_2", "task7_3", "task7_4", "task7_5", "task8_1", "task8_2", "task8_3", "task8_4", "task8_5"].includes(taskDef.id) ? "lg:col-span-7 space-y-4" : "lg:col-span-5"}>
                  {taskDef.id === "task2_2" ? (
                    <AppendOnlyLedgerSimulation color={moduleColor} />
                  ) : taskDef.id === "task2_3" ? (
                    <TransactionLifecycleSimulation color={moduleColor} />
                  ) : taskDef.id === "task3_2" ? (
                    <GenesisBlockSimulation color={moduleColor} />
                  ) : taskDef.id === "task3_3" ? (
                    <NetworkThroughputSimulation color={moduleColor} />
                  ) : taskDef.id === "task3_4" ? (
                    <ChainIntegritySimulation color={moduleColor} />
                  ) : taskDef.id === "task3_5" ? (
                    <ChapterChallengeSimulation color={moduleColor} />
                  ) : taskDef.id === "task4_1" ? (
                    <CryptographicHashSimulation color={moduleColor} />
                  ) : taskDef.id === "task4_2" ? (
                    <AvalancheEffectSimulation color={moduleColor} />
                  ) : taskDef.id === "task4_3" ? (
                    <HashingVsEncryptionSimulation color={moduleColor} />
                  ) : taskDef.id === "task4_4" ? (
                    <AlienTransmissionSimulation color={moduleColor} />
                  ) : taskDef.id === "task4_5" ? (
                    <Sha256CalibrationChallenge color={moduleColor} />
                  ) : taskDef.id === "task5_1" ? (
                    <HashLinkChainMonitor color={moduleColor} />
                  ) : taskDef.id === "task5_2" ? (
                    <BlockDominoMonitor color={moduleColor} />
                  ) : taskDef.id === "task5_3" ? (
                    <BlockHeaderSealingEngine color={moduleColor} />
                  ) : taskDef.id === "task5_4" ? (
                    <DecentralizedConsensusCommand color={moduleColor} />
                  ) : taskDef.id === "task5_5" ? (
                    <GalacticBlockchainRepair color={moduleColor} />
                  ) : taskDef.id === "task6_1" ? (
                    <NetworkTopologyCommandCenter color={moduleColor} />
                  ) : taskDef.id === "task6_2" ? (
                    <BlockchainNodeOperations color={moduleColor} />
                  ) : taskDef.id === "task6_3" ? (
                    <P2PGossipPropagation color={moduleColor} />
                  ) : taskDef.id === "task6_4" ? (
                    <FaultToleranceCommand color={moduleColor} />
                  ) : taskDef.id === "task6_5" ? (
                    <MercuryNetworkRecovery color={moduleColor} />
                  ) : taskDef.id === "task7_1" ? (
                    <ByzantineConsensusWarRoom color={moduleColor} />
                  ) : taskDef.id === "task7_2" ? (
                    <PoWvsPoSSimulation color={moduleColor} />
                  ) : taskDef.id === "task7_3" ? (
                    <FederatedConsensusSimulator color={moduleColor} />
                  ) : taskDef.id === "task7_4" ? (
                    <DoubleSpendAuditor color={moduleColor} />
                  ) : taskDef.id === "task7_5" ? (
                    <GalacticCouncilConsensus color={moduleColor} />
                  ) : taskDef.id === "task8_1" ? (
                    <SupplyChainAuditTracker color={moduleColor} />
                  ) : taskDef.id === "task8_2" ? (
                    <BlockchainTradeoffsCalculator color={moduleColor} />
                  ) : taskDef.id === "task8_3" ? (
                    <RealWorldUseCasesMatcher color={moduleColor} />
                  ) : taskDef.id === "task8_4" ? (
                    <DatabaseVsBlockchainMatrix color={moduleColor} />
                  ) : taskDef.id === "task8_5" ? (
                    <GalacticTechnologyDecision color={moduleColor} />
                  ) : (
                    taskDef.keyTerms && taskDef.keyTerms.length > 0 && (
                      <div
                        className="border rounded-2xl p-4 space-y-3"
                        style={{ borderColor: `${moduleColor}25`, backgroundColor: `${moduleColor}05` }}
                      >
                        <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5" style={{ color: moduleColor }} />
                          <span>Key Terms Glossary</span>
                        </div>
                        <div className="flex flex-col gap-3">
                          {taskDef.keyTerms.map((term, idx) => (
                            <div key={idx} className="border border-white/5 bg-slate-950/60 p-3 rounded-xl">
                              <span className="font-mono font-bold text-[10px] block" style={{ color: moduleColor }}>
                                {term.term}
                              </span>
                              <span className="text-slate-400 text-[9.5px] mt-0.5 block leading-relaxed">{term.definition}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>

              </div>
            </motion.div>
          )}

          {/* STEP 2: CHALLENGE */}
          {step === "challenge" && (
            <motion.div
              key="challenge"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-stretch min-h-0">
                {/* Left Column: Parameters */}
                <div className="lg:col-span-5 flex flex-col gap-4 overflow-y-auto pr-1">
                  <div className="bg-slate-900/50 rounded-2xl border border-white/5 p-4">
                    <div className="text-[8.5px] font-mono uppercase tracking-widest mb-2 flex items-center gap-1.5" style={{ color: moduleColor }}>
                      <Zap className="w-3 h-3" /> Scenario Setup
                    </div>
                    <div className="text-[10.5px] text-slate-300 font-sans leading-relaxed whitespace-pre-line border-l-2 pl-3" style={{ borderColor: `${moduleColor}40` }}>
                      {taskDef.practical.setupText || "Review the technical checkpoint check questions on the console to proceed."}
                    </div>
                  </div>

                  <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <HelpCircle className="w-4 h-4 text-cyan-400" />
                      <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">Audit Challenge</span>
                    </div>
                    <p className="text-[11.5px] text-white font-sans leading-relaxed font-semibold">
                      {hasMCQ ? "Answer the core conceptual checks on the right to complete validation for this gate." : taskDef.practical.question}
                    </p>
                  </div>
                </div>

                {/* Right Column: Console / MCQ */}
                <div className="lg:col-span-7 flex flex-col border border-white/10 bg-slate-950/60 rounded-2xl overflow-hidden min-h-[360px] lg:min-h-0">
                  <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-slate-900/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                      {hasMCQ ? "Validation Checkpoint Console" : "Interactive Lab Console"}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 justify-between scrollbar-thin">
                    {hasMCQ ? (
                      <MCQPanel
                        questions={TASK_MCQ[taskDef.id]}
                        color={moduleColor}
                        taskId={taskDef.id}
                        onComplete={() => {
                          setSuccess(true);
                          saveTaskScore(taskDef.id, 10, 10, true);
                        }}
                      />
                    ) : (
                      <>
                        {/* Widget Area */}
                        <div className="border border-white/10 bg-slate-950/90 rounded-2xl p-3.5 flex flex-col gap-3">
                        {/* INSPECTOR WIDGET */}
                        {taskDef.practical.type === "inspector" && (
                          <div className="space-y-3">
                            <div className="text-[8.5px] font-mono uppercase tracking-widest text-center" style={{ color: moduleColor }}>
                              🔍 Payload Dissector Active
                            </div>
                            <div className="bg-black/80 border border-white/10 rounded-xl p-3 font-mono text-[9px] max-h-[200px] overflow-y-auto scrollbar-thin select-all">
                              {taskDef.id === "task2_1" && (
                                <pre className="text-emerald-400 leading-relaxed">{`{
  "sender": "G_ALPHA_STATION_77",
  "receiver": "G_BETA_RECON_89",
  "amount": 250.00,
  "txid": "4b87fa12ce09a888d3f10900bba81236ea77bd10129bcce0128912efcc429a1b",
  "sequence": 48291,
  "signature": "Sig_378a9c2b..."
}`}</pre>
                              )}
                              {taskDef.id === "task3_1" && (
                                <pre className="text-cyan-400 leading-relaxed">{`{
  "header": {
    "block_height": 849,
    "timestamp": 1782294910,
    "prev_block_id": "0000a39f12bc8e0018f2bb7c71e892cbb87a9bc19cce01ef",
    "nonce": 38491
  },
  "body": { "transactions_count": 4 }
}`}</pre>
                              )}
                              {taskDef.id === "task3_2" && (
                                <pre className="text-amber-400 leading-relaxed">{`{
  "block_height": 0,
  "prev_block_id": "000000000000000000000000000000000000000000000000",
  "timestamp": 1782200000,
  "network_id": "MERCURY_TESTNET_GENESIS",
  "secret_message": "Mercury Launchpad Coordinates Unlocked 2026"
}`}</pre>
                              )}
                              {taskDef.id === "task5_1" && (
                                <pre className="text-purple-400 leading-relaxed">{`Block 1: { hash: "0000a12fbc99", prev: "00000000" }
Block 2: { hash: "0000e39a88cd", prev_block_id: "0000a12fbc99" }
Block 3: { hash: "0000b21fa7e1", prev_block_id: "0000e39a88cd" }`}</pre>
                              )}
                              {taskDef.id === "task6_2" && (
                                <pre className="text-orange-400 leading-relaxed">{`{
  "node_id": "MERCURY_VALIDATOR_09",
  "storage": { "sync_mode": "full_history" },
  "consensus": {
    "participate_in_voting": true,
    "quorum_set": ["NODE_ALPHA", "NODE_BETA"]
  }
}`}</pre>
                              )}
                              {taskDef.id === "task8_1" && (
                                <pre className="text-sky-400 leading-relaxed">{`Tx 1: G_MARS_MINE_01 mints 50 units → [Hash: 0xMINT]
Tx 2: G_MARS_MINE_01 → G_SHIPPING_CORP  → [Hash: 0xSHIP]
Tx 3: G_SHIPPING_CORP → G_STATION_BETA  → [Hash: 0xDELIVER]
Tx 4: G_SMUGGLER_VOID → G_STATION_BETA  → [Hash: 0xILLEGAL]`}</pre>
                              )}
                              {!["task2_1","task3_1","task3_2","task5_1","task6_2","task8_1"].includes(taskDef.id) && (
                                <pre className="text-slate-300 leading-relaxed whitespace-pre-wrap">{taskDef.practical.setupText}</pre>
                              )}
                            </div>
                          </div>
                        )}

                        {/* TERMINAL AUDIT WIDGET */}
                        {taskDef.practical.type === "terminal-audit" && terminalMission && (
                          <CosmosTerminal
                            mission={terminalMission}
                            accent={moduleColor}
                            compact
                            onObjectiveComplete={() => {
                              setSubmitted(true);
                              setSuccess(true);
                              setErrorMessage(null);
                              setShowHint(false);
                              saveTaskScore(taskDef.id, 10, 10, true);
                            }}
                          />
                        )}

                        {/* DRAG AND DROP */}
                        {taskDef.practical.type === "drag-drop" && (
                          <div className="space-y-3">
                            {(taskDef.id === "task2_3" || taskDef.id === "task3_4") && (
                              <div className="space-y-2">
                                <div className="text-[9px] font-mono text-slate-400 text-center">Click letters to build sequence order:</div>
                                <div className="flex flex-wrap gap-2 justify-center">
                                  {getDragLetters().map((letter, idx) => {
                                    const isSel = selectedSequence.includes(letter);
                                    const pos = selectedSequence.indexOf(letter);
                                    return (
                                      <button
                                        key={`${letter}-${idx}`}
                                        onClick={() => handleSeqClick(letter)}
                                        style={{
                                          borderColor: isSel ? moduleColor : "rgba(255,255,255,0.1)",
                                          backgroundColor: isSel ? `${moduleColor}20` : "rgba(15,23,42,0.4)",
                                        }}
                                        className="w-10 h-10 rounded-xl border font-mono font-bold flex flex-col items-center justify-center transition-all relative text-xs text-white hover:scale-105"
                                      >
                                        {letter}
                                        {isSel && <span className="absolute top-0.5 right-1 text-[7px] font-bold" style={{ color: moduleColor }}>{pos + 1}</span>}
                                      </button>
                                    );
                                  })}
                                </div>
                                <div className="bg-slate-900/60 p-2 border border-white/5 rounded-xl text-center font-mono text-[10px]">
                                  <span className="text-slate-500 uppercase mr-2">Sequence:</span>
                                  <span className="font-bold text-white tracking-widest">{selectedSequence.join("") || "—"}</span>
                                </div>
                                {selectedSequence.length > 0 && (
                                  <button onClick={() => setSelectedSequence([])} className="w-full text-[8.5px] font-mono text-slate-500 hover:text-slate-300 uppercase tracking-widest">
                                    Reset
                                  </button>
                                )}
                              </div>
                            )}

                            {(taskDef.id === "task4_3" || taskDef.id === "task7_2") && (
                              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin">
                                <div className="text-[8.5px] font-mono text-slate-400 text-center mb-1">Toggle classification for each statement:</div>
                                {Array.from({ length: 6 }).map((_, idx) => {
                                  const id = idx + 1;
                                  const [opt1, opt2] = taskDef.id === "task4_3" ? ["H", "E"] : ["W", "S"];
                                  const [label1, label2] = taskDef.id === "task4_3" ? ["Hashing", "Encrypt"] : ["PoW", "PoS"];
                                  const cur = classifications[id];
                                  return (
                                    <div key={id} className="flex items-center justify-between bg-slate-900/40 border border-white/5 px-2.5 py-1.5 rounded-xl text-[9.5px]">
                                      <span className="font-mono text-slate-300">Statement #{id}</span>
                                      <button
                                        onClick={() => handleClassificationToggle(id, [opt1, opt2])}
                                        style={{
                                          color: !cur ? "#64748b" : moduleColor,
                                          borderColor: !cur ? "rgba(255,255,255,0.05)" : `${moduleColor}40`,
                                          backgroundColor: !cur ? "transparent" : `${moduleColor}10`,
                                        }}
                                        className="px-3 py-0.5 rounded-lg border font-mono font-bold text-[9px] transition-all min-w-[80px] text-center"
                                      >
                                        {!cur ? "Select" : cur === opt1 ? `${label1} (${opt1})` : `${label2} (${opt2})`}
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {taskDef.id === "task4_2" && (
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2 text-[9.5px] font-mono">
                                  <div className="bg-slate-900/40 border border-white/5 p-2 rounded-xl text-center">
                                    <span className="text-slate-500 block text-[8px] uppercase">Input 1</span>
                                    "Launch the rocket"
                                  </div>
                                  <div className="bg-slate-900/40 border border-emerald-500/20 p-2 rounded-xl text-center">
                                    <span className="text-emerald-400 block text-[8px] uppercase">Input 2 (modified)</span>
                                    "Launch the rocket<span className="text-emerald-400 font-bold">.</span>"
                                  </div>
                                </div>
                                <div>
                                  <label className="text-[8.5px] font-mono text-slate-400 uppercase tracking-wide block mb-1">Appended character:</label>
                                  <input
                                    type="text" maxLength={1}
                                    value={inputs.char || ""}
                                    onChange={e => handleInputChange("char", e.target.value)}
                                    placeholder="e.g. ."
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-[14px] text-white font-mono text-center placeholder-slate-700 focus:outline-hidden"
                                  />
                                </div>
                              </div>
                            )}

                            {taskDef.id === "task8_3" && (
                              <div>
                                <label className="text-[8.5px] font-mono text-slate-400 uppercase tracking-wide block mb-1">Match sequence (e.g. 1234):</label>
                                <input
                                  type="text" maxLength={4}
                                  value={inputs.match || ""}
                                  onChange={e => handleInputChange("match", e.target.value)}
                                  placeholder="4-digit code"
                                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-[14px] text-white font-mono tracking-widest text-center placeholder-slate-700 focus:outline-hidden"
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* VALIDATOR TERMINAL */}
                        {taskDef.practical.type === "validator-terminal" && (
                          <div className="space-y-3">
                            {taskDef.id === "task7_4" && (
                              <div className="space-y-2">
                                <div className="text-[9px] font-mono text-slate-400 text-center uppercase tracking-wider">
                                  Select transaction ordering outcome:
                                </div>
                                <div className="grid grid-cols-2 gap-2.5">
                                  {[
                                    { val: "Alpha:Beta", label: "Accept Alpha, Reject Beta", desc: "Earlier timestamp wins" },
                                    { val: "Beta:Alpha", label: "Accept Beta, Reject Alpha", desc: "Later timestamp wins" },
                                  ].map(opt => (
                                    <button
                                      key={opt.val}
                                      onClick={() => setInputs({ resolution: opt.val })}
                                      className={`p-3 rounded-xl border text-left transition-all ${inputs.resolution === opt.val ? "border-cyan-500/50 bg-cyan-500/10 text-white" : "border-white/5 bg-slate-900/50 text-slate-400 hover:text-slate-200"}`}
                                    >
                                      <span className="font-mono text-[9px] font-bold block mb-1" style={{ color: moduleColor }}>{opt.val}</span>
                                      <span className="text-[9px] block">{opt.label}</span>
                                      <span className="text-[8px] text-slate-500 block mt-0.5">{opt.desc}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {taskDef.id === "task8_4" && (
                              <div className="space-y-3">
                                <div className="bg-black/90 border border-white/10 rounded-xl font-mono text-[9px] h-[110px] overflow-hidden p-2.5 space-y-1 text-slate-300">
                                  <div className="text-cyan-400">$ verify</div>
                                  <div className="text-emerald-400">
                                    {inputs.code === "MATRIX_PASS" ? "✓ Decision Matrix Verified — Code: MATRIX_PASS" : "Awaiting verification..."}
                                  </div>
                                </div>
                                {inputs.code !== "MATRIX_PASS" && (
                                  <button
                                    onClick={() => setInputs({ code: "MATRIX_PASS" })}
                                    className="w-full bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-400 px-3 py-2 rounded-xl font-mono text-[9px] font-bold cursor-pointer"
                                  >
                                    RUN VERIFY COMMAND
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* GRAPH MATCHER */}
                        {taskDef.practical.type === "graph-matcher" && (
                          <div className="space-y-3">
                            <div className="text-[9px] font-mono text-slate-400 text-center">
                              {taskDef.id === "task6_3" ? "Click the node that detects & rejects the invalid tx:" : "Click the mutually trusting core quorum nodes:"}
                            </div>
                            <div className="flex justify-center gap-2 flex-wrap">
                              {[1, 2, 3, 4, 5].map(ni => {
                                const isSel = selectedNodes.includes(ni);
                                return (
                                  <button
                                    key={ni}
                                    onClick={() => {
                                      if (taskDef.id === "task6_3") setSelectedNodes([ni]);
                                      else setSelectedNodes(prev => {
                                        const list = prev.includes(ni) ? prev.filter(n => n !== ni) : [...prev, ni];
                                        return list.sort((a, b) => a - b);
                                      });
                                    }}
                                    style={{ borderColor: isSel ? moduleColor : "rgba(255,255,255,0.1)", backgroundColor: isSel ? `${moduleColor}20` : "rgba(15,23,42,0.6)" }}
                                    className="w-12 h-12 rounded-full border font-mono font-bold flex items-center justify-center text-[10px] text-white hover:scale-105 transition-all cursor-pointer"
                                  >
                                    N{ni}
                                  </button>
                                );
                              })}
                            </div>
                            <div className="bg-slate-900/60 p-2 border border-white/5 rounded-xl text-center font-mono text-[9px]">
                              <span className="text-slate-500 uppercase mr-2">Selection:</span>
                              <span className="font-bold text-white" style={{ color: moduleColor }}>{selectedNodes.join(",") || "NONE"}</span>
                            </div>
                          </div>
                        )}

                        {/* COMPARISON / BLOCKCHAIN TAMPER */}
                        {taskDef.practical.type === "comparison" && (
                          <div className="space-y-3">
                            <div className="text-[9.5px] font-mono text-slate-400 text-center">Click Block 2 to tamper and observe cascade:</div>
                            <div className="flex justify-between items-center gap-1 overflow-x-auto py-1 scrollbar-thin select-none">
                              {blockchainBlocks.map((block, idx) => (
                                <motion.div
                                  key={block.id}
                                  animate={block.status === "tampered" ? { scale: [1, 1.05, 1] } : {}}
                                  transition={{ duration: 0.5, repeat: Infinity }}
                                  onClick={() => { if (block.id === 2) toggleBlockchainTamper(idx); }}
                                  className={`flex-1 min-w-[48px] border p-1.5 rounded-xl text-center font-mono transition-all ${
                                    block.status === "valid" ? "bg-slate-900/60 border-white/10 hover:border-cyan-500/40 cursor-pointer"
                                    : block.status === "tampered" ? "bg-rose-950/40 border-rose-500/50 shadow-[0_0_12px_rgba(239,68,68,0.2)] animate-pulse"
                                    : "bg-red-950/20 border-red-500/20 text-slate-500"
                                  }`}
                                >
                                  <div className="text-[7.5px] text-slate-400">B{block.id}</div>
                                  <div className="text-[8px] font-bold mt-0.5 truncate" style={{ color: block.status === "valid" ? "#22d3ee" : block.status === "tampered" ? "#f43f5e" : "#64748b" }}>
                                    {block.hash}
                                  </div>
                                  <div className="text-[6.5px] text-slate-500 mt-0.5 truncate">▲ {block.prev}</div>
                                </motion.div>
                              ))}
                            </div>
                            {tamperIndex !== null && (
                              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-2.5 text-[9px] font-mono text-rose-300">
                                ⚠️ Domino cascade! Block 2 tampered → Blocks 3, 4, 5 hash references broken.
                              </motion.div>
                            )}
                            <div className="flex gap-2">
                              {["All of them", "Block 2 only"].map(opt => (
                                <button
                                  key={opt}
                                  onClick={() => setInputs({ blocks: opt })}
                                  className={`flex-1 py-2 rounded-xl text-[10px] font-mono transition-all border cursor-pointer ${
                                    inputs.blocks === opt ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-300" : "bg-slate-900 border-white/10 text-slate-400 hover:text-white"
                                  }`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* SERVER AUDIT / MATH CONSOLE */}
                        {(taskDef.practical.type === "server-audit" || taskDef.practical.type === "math-console") && (
                          <div className="text-center py-2">
                            <Database className="w-8 h-8 mx-auto mb-2" style={{ color: moduleColor, opacity: 0.5 }} />
                            <div className="text-[10px] text-slate-400 font-mono leading-relaxed px-3">
                              Scenario data is in the center panel. Calculate and enter your answers below.
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Inputs & verify button */}
                      {!success && taskDef.practical.type !== "terminal-audit" && (
                        <div className="space-y-3">
                          {taskDef.practical.inputs && taskDef.practical.inputs.length > 0 ? (
                            <div className="grid gap-2">
                              {taskDef.practical.inputs.map((inp, idx) => (
                                <div key={idx} className="space-y-0.5">
                                  <label className="text-[8.5px] font-mono text-slate-400 uppercase tracking-wider block">{inp.label}</label>
                                  <input
                                    type="text"
                                    value={inputs[inp.key] || ""}
                                    onChange={e => handleInputChange(inp.key, e.target.value)}
                                    placeholder={inp.placeholder}
                                    disabled={success}
                                    className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3 py-1.5 text-[11px] text-white font-mono placeholder-slate-700 focus:outline-hidden focus:border-cyan-500 transition"
                                  />
                                </div>
                              ))}
                            </div>
                          ) : (
                            !["drag-drop", "validator-terminal", "graph-matcher", "comparison"].includes(taskDef.practical.type) && (
                              <div>
                                <label className="text-[8.5px] font-mono text-slate-400 uppercase tracking-wide block mb-1">Answer</label>
                                <input
                                  type="text"
                                  value={inputs.seq || ""}
                                  onChange={e => handleInputChange("seq", e.target.value)}
                                  placeholder="Enter answer..."
                                  disabled={success}
                                  className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3 py-1.5 text-[11px] text-white font-mono placeholder-slate-700 focus:outline-hidden focus:border-cyan-500 transition"
                                />
                              </div>
                            )
                          )}

                          <button
                            onClick={() => {
                              if (taskDef.practical.type === "graph-matcher") {
                                if (taskDef.id === "task6_3") inputs.node_idx = selectedNodes.length > 0 ? String(selectedNodes[0]) : "";
                                else if (taskDef.id === "task7_3") inputs.quorum = selectedNodes.sort((a, b) => a - b).join(",");
                              }
                              handleVerify();
                            }}
                            style={{ borderColor: `${moduleColor}50`, backgroundColor: `${moduleColor}15` }}
                            className="w-full border text-white font-bold py-2.5 rounded-2xl text-[10px] font-rushblade tracking-wider flex items-center justify-center gap-1.5 transition hover:opacity-85 cursor-pointer shadow-md"
                          >
                            Submit & Verify <ChevronRight className="w-3.5 h-3.5" />
                          </button>

                          <AnimatePresence>
                            {errorMessage && !success && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-2 overflow-hidden"
                              >
                                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-start gap-2 text-[10px] text-rose-400 font-mono">
                                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                  <span>{errorMessage}</span>
                                </div>
                                <button
                                  onClick={() => { setShowHint(true); setHintStep(p => Math.min(p + 1, correctParts.length)); }}
                                  className="w-full flex items-center justify-between px-3.5 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] text-amber-400 font-mono hover:bg-amber-500/15 transition cursor-pointer"
                                >
                                  <span className="flex items-center gap-1.5">
                                    <Lightbulb className="w-3.5 h-3.5" />
                                    {showHint ? `Reveal hint (${hintStep}/${correctParts.length})` : "Request a hint?"}
                                  </span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                                {showHint && hintStep > 0 && (
                                  <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-3.5 space-y-2">
                                    <div className="text-[9px] font-mono text-amber-400 uppercase tracking-widest">Revealed Hints</div>
                                    {correctParts.slice(0, hintStep).map((part, idx) => (
                                      <div key={idx} className="flex items-center justify-between text-[10px] font-mono">
                                        <span className="text-amber-500/60 mr-2">{hintLabels[idx] || `Param ${idx + 1}`}:</span>
                                        <span className="text-amber-200 font-bold">{part}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </>)}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: COMPLETE */}
          {step === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-xl mx-auto w-full pt-10 text-center space-y-6"
            >
              <div
                className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto"
                style={{ boxShadow: "0 0 30px rgba(16,185,129,0.15)" }}
              >
                <Check className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="font-rushblade text-xl text-white">Checkpoint Verified!</h3>
                <p className="text-xs text-slate-400 font-mono">Status: Secure · Checkpoint logged in local storage</p>
              </div>

              <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 text-left max-w-md mx-auto">
                <div className="text-[8.5px] font-mono text-emerald-400 uppercase tracking-widest font-bold mb-2">Debrief Summary</div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{taskDef.practical.debriefText}</p>
              </div>

              <button
                onClick={() => { saveTaskScore(taskDef.id, 10, 10, true); onComplete(); }}
                className="w-full max-w-xs text-slate-950 font-bold py-3 rounded-2xl text-[10px] font-rushblade tracking-wider flex items-center justify-center gap-1.5 transition shadow-lg cursor-pointer mx-auto hover:opacity-90"
                style={{ backgroundColor: moduleColor }}
              >
                Lock Checkpoint & Proceed <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

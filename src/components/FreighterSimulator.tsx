import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, X, FileText, Code2, Terminal, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

interface FreighterSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  txData: {
    type: "Purchase" | "List" | "Delist" | "Offer" | "Transfer" | "Accept Offer";
    planetName: string;
    price?: number;
    destination?: string;
  };
  userAddress: string;
}

export default function FreighterSimulator({
  isOpen,
  onClose,
  onApprove,
  txData,
  userAddress,
}: FreighterSimulatorProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "xdr" | "logs">("summary");
  const [status, setStatus] = useState<"idle" | "signing" | "submitting" | "success" | "error">("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [xdr, setXdr] = useState("");

  const displayPrice = txData.price ?? 0;
  const destinationAddress = txData.destination || "GB_STELLAR_MARKETPLACE_CONTRACT";

  // Generate a mock Stellar Transaction Envelope XDR on load
  useEffect(() => {
    if (isOpen) {
      setStatus("idle");
      setActiveTab("summary");
      setLogs([]);
      
      // Build a fake XDR string based on transaction parameters
      const randomBase64 = btoa(
        `StellarTx{type:${txData.type},planet:${txData.planetName},price:${displayPrice},seq:${Math.floor(
          Math.random() * 1000000
        )}}`
      ).slice(0, 80);
      setXdr(`AAAAAgAAAAD5Z2ZpAAAAAIbB+fIAAAABAAAAA1BheW1lbnQAAAAA8d36...${randomBase64}`);
    }
  }, [isOpen, txData, displayPrice]);

  // Simulate Horizon API logs submission
  const handleSign = () => {
    setStatus("signing");
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] freighter: Initiating signature request`]);
    
    setTimeout(() => {
      setStatus("submitting");
      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] freighter: Transaction signed by keysource: ${userAddress.slice(0, 8)}...`,
        `[${new Date().toLocaleTimeString()}] horizon: POST https://horizon-testnet.stellar.org/transactions`,
        `[${new Date().toLocaleTimeString()}] horizon: Resolving sequence number for account: ${userAddress.slice(0, 8)}...`,
        `[${new Date().toLocaleTimeString()}] horizon: Sending transaction envelope (XDR)...`,
      ]);

      setTimeout(() => {
        const ledgerNum = Math.floor(Math.random() * 50000) + 4381000;
        setLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] horizon: consensus: Success. Included in Ledger #${ledgerNum}`,
          `[${new Date().toLocaleTimeString()}] horizon: tx_hash: ${btoa(Math.random().toString()).slice(0, 16)}...`,
          `[${new Date().toLocaleTimeString()}] system: Executing local balance adjustment: -${displayPrice} XLM`,
        ]);
        setStatus("success");
        
        setTimeout(() => {
          onApprove();
          onClose();
        }, 1200);
      }, 1500);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-[420px] overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-white/[0.02] border-b border-white/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_12px_rgba(99,102,241,0.5)]">
              <ShieldCheck className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <h3 className="font-display text-[13px] font-bold text-white tracking-wide">Freighter Wallet</h3>
              <p className="font-mono text-[9px] text-indigo-400">STELLAR TEST NETWORK</p>
            </div>
          </div>
          <button 
            disabled={status === "signing" || status === "submitting"}
            onClick={onClose} 
            className="rounded-lg p-1 text-muted-foreground hover:bg-white/5 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Wallet HUD */}
        <div className="bg-indigo-950/20 px-4 py-2 border-b border-white/5 flex justify-between items-center text-[10px] font-mono text-white/60">
          <span>Key: <span className="text-white font-bold">{userAddress.slice(0, 6)}...{userAddress.slice(-6)}</span></span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> connected</span>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 bg-slate-950/50">
          {[
            { id: "summary", label: "Summary", icon: FileText },
            { id: "xdr", label: "XDR Envelope", icon: Code2 },
            { id: "logs", label: "Horizon Logs", icon: Terminal },
          ].map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 font-mono text-[10px] border-b-2 transition ${
                  active 
                    ? "border-indigo-500 bg-white/[0.02] text-white" 
                    : "border-transparent text-muted-foreground hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-4 min-h-[190px] max-h-[250px] overflow-y-auto font-mono text-[11px]">
          {activeTab === "summary" && (
            <div className="space-y-3">
              <div className="rounded-xl border border-white/5 bg-white/[0.01] p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Operation:</span>
                  <span className="text-white font-bold">{txData.type} Exoplanet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Asset:</span>
                  <span className="text-indigo-400 font-bold">{txData.planetName}</span>
                </div>
                {displayPrice > 0 && (
                  <div className="flex justify-between border-t border-white/5 pt-2 mt-1">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="text-emerald-400 font-bold text-sm">{displayPrice.toLocaleString()} XLM</span>
                  </div>
                )}
              </div>

              <div className="space-y-1 bg-white/[0.02] p-2.5 rounded-lg border border-white/5 text-[9px] text-muted-foreground">
                <div className="flex justify-between">
                  <span>Destination:</span>
                  <span className="text-white truncate max-w-[200px]" title={destinationAddress}>
                    {destinationAddress.slice(0, 8)}...{destinationAddress.slice(-8)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Network Fee:</span>
                  <span className="text-white">0.00001 XLM (100 stroops)</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "xdr" && (
            <div className="space-y-2">
              <p className="text-[10px] text-muted-foreground">
                Transaction Envelope XDR represent the transaction compiled and serialized in base64.
              </p>
              <pre className="w-full bg-slate-900 border border-white/5 rounded-lg p-2.5 text-[9px] text-muted-foreground select-all break-all overflow-hidden">
                {xdr}
              </pre>
            </div>
          )}

          {activeTab === "logs" && (
            <div className="space-y-1">
              {logs.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Terminal className="h-6 w-6 mx-auto mb-2 opacity-30" />
                  <span>No requests logged. Sign the transaction to initiate Horizon network ledger communication.</span>
                </div>
              ) : (
                <div className="space-y-1 font-mono text-[9px] text-indigo-300">
                  {logs.map((log, idx) => (
                    <div key={idx} className="leading-relaxed">
                      {log.includes("[SUCCESS]") ? (
                        <span className="text-emerald-400">{log}</span>
                      ) : log.includes("[ERROR]") ? (
                        <span className="text-rose-400">{log}</span>
                      ) : (
                        log
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status HUD / Message */}
        <AnimatePresence>
          {status !== "idle" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-indigo-950/40 border-t border-indigo-500/20 px-4 py-2 flex items-center gap-2"
            >
              {status === "signing" && (
                <>
                  <RefreshCw className="h-4 w-4 text-indigo-400 animate-spin" />
                  <span className="text-[10px] text-indigo-300">Awaiting Freighter local wallet signature...</span>
                </>
              )}
              {status === "submitting" && (
                <>
                  <RefreshCw className="h-4 w-4 text-emerald-400 animate-spin" />
                  <span className="text-[10px] text-emerald-300">Submitting transaction to Stellar Testnet Horizon...</span>
                </>
              )}
              {status === "success" && (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-[10px] text-emerald-300 font-bold">Transaction Confirmed on Ledger!</span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Actions */}
        <div className="bg-white/[0.02] border-t border-white/5 p-4 flex gap-3">
          <button
            disabled={status !== "idle"}
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 font-sans text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            Reject
          </button>
          
          <button
            disabled={status !== "idle"}
            onClick={handleSign}
            className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-2.5 font-sans text-xs font-semibold text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] transition hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {status === "idle" ? (
              <span>Sign Transaction</span>
            ) : (
              <>
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>Signing...</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

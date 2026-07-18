import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, ArrowRight, Info, Award, Database } from "lucide-react";

interface Props {
  color: string;
}

interface LogDef {
  hash: string;
  sender: string;
  receiver: string;
  amount: number;
  type: "mint" | "ship" | "deliver" | "illegal";
  authentic: boolean;
}

const ITEMS: LogDef[] = [
  { hash: "0xMINT", sender: "G_MARS_MINE_01", receiver: "G_MARS_MINE_01", amount: 50, type: "mint", authentic: true },
  { hash: "0xSHIP", sender: "G_MARS_MINE_01", receiver: "G_SHIPPING_CORP", amount: 50, type: "ship", authentic: true },
  { hash: "0xDELIVER", sender: "G_SHIPPING_CORP", receiver: "G_STATION_BETA", amount: 30, type: "deliver", authentic: true },
  { hash: "0xILLEGAL", sender: "G_SMUGGLER_VOID", receiver: "G_STATION_BETA", amount: 10, type: "illegal", authentic: false },
];

export default function SupplyChainAuditTracker({ color }: Props) {
  const [selectedTx, setSelectedTx] = useState<LogDef | null>(ITEMS[0]);
  const [inspectedAuthenticity, setInspectedAuthenticity] = useState<Record<string, boolean>>({});

  const inspectTx = (tx: LogDef) => {
    setSelectedTx(tx);
    setInspectedAuthenticity((prev) => ({ ...prev, [tx.hash]: true }));
  };

  return (
    <div className="flex flex-col h-full bg-[#040816]/60 rounded-2xl border border-white/10 overflow-hidden text-slate-100 p-4 font-sans select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3 shrink-0">
        <div>
          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">Provenance & Traceability</span>
          <h3 className="text-xs font-bold font-mono uppercase tracking-wide text-white">Rare Dilithium Supply Chain Auditor</h3>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin space-y-4">
        
        {/* Visual supply chain flow */}
        <div className="bg-slate-950/40 border border-white/5 rounded-xl p-4 flex flex-col justify-center items-center relative overflow-hidden min-h-[160px]">
          
          <div className="flex items-center gap-2.5 z-10 w-full justify-around px-4">
            
            {/* Stage 1: Mars Mine */}
            <button
              onClick={() => inspectTx(ITEMS[0])}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-mono text-[8.5px] bg-slate-950 cursor-pointer ${
                selectedTx?.hash === "0xMINT" ? "ring-2 ring-sky-400 border-sky-400" : "border-white/5"
              }`}
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span className="font-extrabold text-emerald-400">MARS MINE</span>
              <span className="text-[7.5px] text-slate-500">Mints Cargo</span>
            </button>

            <ArrowRight className="w-3.5 h-3.5 text-slate-700 shrink-0" />

            {/* Stage 2: Shipping Corp */}
            <button
              onClick={() => inspectTx(ITEMS[1])}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-mono text-[8.5px] bg-slate-950 cursor-pointer ${
                selectedTx?.hash === "0xSHIP" ? "ring-2 ring-sky-400 border-sky-400" : "border-white/5"
              }`}
            >
              <Database className="w-4 h-4 text-cyan-400" />
              <span className="font-extrabold text-cyan-400">SHIPPING DEPOT</span>
              <span className="text-[7.5px] text-slate-500">Logistics Transfer</span>
            </button>

            <ArrowRight className="w-3.5 h-3.5 text-slate-700 shrink-0" />

            {/* Stage 3: Station Beta (Legitimate Cargo) */}
            <button
              onClick={() => inspectTx(ITEMS[2])}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-mono text-[8.5px] bg-slate-950 cursor-pointer ${
                selectedTx?.hash === "0xDELIVER" ? "ring-2 ring-sky-400 border-sky-400" : "border-white/5"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-extrabold text-emerald-400">STATION BETA</span>
              <span className="text-[7.5px] text-emerald-400/80 font-bold uppercase tracking-widest flex items-center gap-0.5">
                ✓ Authentic
              </span>
            </button>
            
          </div>

          {/* Parallel Suspicious Path */}
          <div className="w-full flex items-center justify-center gap-3.5 mt-5 pt-3 border-t border-dashed border-white/5 z-10">
            <span className="text-[7.5px] font-mono text-slate-500 uppercase tracking-widest">UNVERIFIED ATTEMPT:</span>
            
            <button
              onClick={() => inspectTx(ITEMS[3])}
              className={`p-2 py-1.5 rounded-lg border flex items-center gap-2 font-mono text-[8px] bg-slate-950/80 cursor-pointer ${
                selectedTx?.hash === "0xILLEGAL" ? "ring-2 ring-sky-400 border-sky-400" : "border-white/5"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span className="font-bold text-rose-400">SMUGGLER VOID DEPOT</span>
              <span className="text-[7px] text-slate-500">Injects Cargo (Tx 4)</span>
            </button>
          </div>

        </div>

        {/* Selected Transaction Ledger Info */}
        <div className="grid grid-cols-12 gap-3">
          
          {/* Detail Table */}
          <div className="col-span-8 bg-slate-950/60 border border-white/5 rounded-xl p-3 space-y-3 font-mono text-[9px]">
            <div className="text-[8.5px] text-slate-500 uppercase tracking-wider font-bold border-b border-white/5 pb-1 flex items-center justify-between">
              <span>TRANSACTION PAYLOAD METADATA</span>
              {selectedTx && (
                <span className="text-sky-400">{selectedTx.hash}</span>
              )}
            </div>

            {selectedTx ? (
              <div className="space-y-2 leading-relaxed">
                <div className="grid grid-cols-2 gap-2 bg-[#070b17] p-2 rounded-lg border border-white/5">
                  <div>
                    <span className="text-slate-500 text-[8px] block uppercase">Source Sender:</span>
                    <span className="text-white block font-bold truncate">{selectedTx.sender}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[8px] block uppercase">Recipient Receiver:</span>
                    <span className="text-white block font-bold truncate">{selectedTx.receiver}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#070b17] p-2 rounded-lg border border-white/5">
                    <span className="text-slate-500 text-[8px] block uppercase">Volume Cargo:</span>
                    <span className="text-white block font-extrabold text-[10px]">{selectedTx.amount} DILITHIUM</span>
                  </div>
                  <div className="bg-[#070b17] p-2 rounded-lg border border-white/5">
                    <span className="text-slate-500 text-[8px] block uppercase">Cryptographic Link:</span>
                    <span className="text-white block font-extrabold">
                      {selectedTx.type === "mint" ? "GENESIS INITIALIZATION" : 
                       selectedTx.type === "ship" ? "PARENT: 0xMINT" :
                       selectedTx.type === "deliver" ? "PARENT: 0xSHIP" : "PARENT: NULL (No Mine Record!)"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 italic py-6 text-center">
                Click on any node/station above to audit its records.
              </div>
            )}
          </div>

          {/* Authenticity Auditor */}
          <div className="col-span-4 bg-slate-950/60 border border-white/5 rounded-xl p-3 space-y-3 font-mono text-[9px] flex flex-col justify-between">
            <div className="text-[8.5px] text-slate-500 uppercase tracking-wider font-bold">VERDICT</div>
            
            {selectedTx ? (
              <div className="space-y-2.5 flex-1 flex flex-col justify-center items-center text-center py-2">
                {selectedTx.authentic ? (
                  <>
                    <Award className="w-8 h-8 text-emerald-400 animate-pulse" />
                    <span className="text-emerald-400 font-extrabold text-[10px] uppercase block tracking-wider">PROVENANCE CONFIRMED</span>
                    <p className="text-slate-500 text-[8px] leading-relaxed uppercase">
                      This transaction traces back directly to Martian Mine coordinates (Tx 1). Cargo is authentic.
                    </p>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-8 h-8 text-rose-500" />
                    <span className="text-rose-500 font-extrabold text-[10px] uppercase block tracking-wider">COUNTERFEIT ALERT</span>
                    <p className="text-slate-500 text-[8px] leading-relaxed uppercase">
                      This cargo has no record link back to the Martian mine (0xMINT). Rejecting transaction.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="text-slate-500 italic text-center py-4">Awaiting audit...</div>
            )}
          </div>

        </div>

        {/* Action Panel */}
        <div className="bg-slate-950 border border-white/5 rounded-xl p-3 flex items-center gap-1.5 text-[9.5px] font-mono">
          <Info className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-slate-400">Ledger auditability allows tracking provenance of resources back to genesis.</span>
        </div>
      </div>

    </div>
  );
}

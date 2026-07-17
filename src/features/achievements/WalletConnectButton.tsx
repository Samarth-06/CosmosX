import { useWallet } from "./useWallet";
import { Wallet, LogOut, Loader2 } from "lucide-react";

function shorten(address: string): string {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

/**
 * Connect / disconnect control for a Stellar wallet. Styled to match the
 * CosmosX Mercury UI (font-mono, cyan accents). Wallet state is shared app-wide
 * via `useWallet`, so this stays in sync with the mint button.
 */
export function WalletConnectButton() {
  const { address, connecting, error, connect, disconnect } = useWallet();

  if (address) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-400/25 bg-emerald-400/5 px-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" style={{ boxShadow: "0 0 6px rgba(52,211,153,0.7)" }} />
          <span className="font-mono text-[11px] text-emerald-200 truncate">{shorten(address)}</span>
        </div>
        <button
          onClick={disconnect}
          className="flex items-center gap-1 font-mono text-[10px] text-slate-400 hover:text-white transition shrink-0"
        >
          <LogOut className="w-3 h-3" />
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={connect}
        disabled={connecting}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-950 transition-all"
      >
        {connecting ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Connecting…
          </>
        ) : (
          <>
            <Wallet className="w-3.5 h-3.5" />
            Connect Wallet
          </>
        )}
      </button>
      {error && (
        <p className="mt-2 font-mono text-[10px] text-rose-400 leading-relaxed">{error}</p>
      )}
    </div>
  );
}

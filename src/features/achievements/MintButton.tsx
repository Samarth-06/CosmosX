import { useWallet } from "./useWallet";
import { useMintAchievement } from "./useMintAchievement";
import { explorerTxUrl } from "@/lib/stellar/network";
import { Loader2, CheckCircle2, ExternalLink, Award, AlertTriangle } from "lucide-react";

/**
 * The "Claim Achievement" action for the Mercury completion screen. Renders a
 * distinct, visible state for every step of the mint lifecycle — the button is
 * never silent or stuck. On success it surfaces the transaction hash with a
 * direct Stellar Expert link (the on-chain proof).
 */
export function MintButton() {
  const { address } = useWallet();
  const { mint, status, txHash, error, reset } = useMintAchievement();

  if (!address) {
    return (
      <p className="font-mono text-[10px] text-slate-400 leading-relaxed">
        Connect your wallet above to claim your achievement on-chain.
      </p>
    );
  }

  const busy = status === "building" || status === "signing" || status === "submitting";

  if (status === "success") {
    return (
      <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/8 px-4 py-3">
        <div className="flex items-center gap-2 text-emerald-300">
          <CheckCircle2 className="w-4 h-4" />
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider">
            Achievement claimed on-chain
          </span>
        </div>
        {txHash && (
          <a
            href={explorerTxUrl(txHash)}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 font-mono text-[10px] text-cyan-400 hover:text-cyan-300 underline transition"
          >
            View transaction on Stellar Expert
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => (status === "error" ? reset() : mint(address))}
        disabled={busy}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-950 transition-all"
      >
        {status === "idle" && (
          <>
            <Award className="w-3.5 h-3.5" />
            Claim Achievement
          </>
        )}
        {status === "building" && (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Preparing transaction…
          </>
        )}
        {status === "signing" && (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Approve in your wallet…
          </>
        )}
        {status === "submitting" && (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Submitting to Testnet…
          </>
        )}
        {status === "error" && (
          <>
            <AlertTriangle className="w-3.5 h-3.5" />
            Try again
          </>
        )}
      </button>

      {error && (
        <div className="mt-2 flex items-start gap-1.5 rounded-lg border border-rose-500/25 bg-rose-500/8 px-2.5 py-2">
          <AlertTriangle className="w-3 h-3 text-rose-400 mt-0.5 shrink-0" />
          <p className="font-mono text-[10px] text-rose-300 leading-relaxed">{error}</p>
        </div>
      )}
    </div>
  );
}

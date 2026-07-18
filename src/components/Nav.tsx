import { Link } from "@tanstack/react-router";
import { Menu, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { getUserState, getUserLevel, type UserState } from "@/lib/user-store";
import { WalletConnectButton } from "@/features/achievements/WalletConnectButton";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Learn", to: "/" },
  { label: "Marketplace", to: "/marketplace" },
  { label: "Docs", to: "/docs" },
  { label: "Community", to: "/community" },
  { label: "Leaderboard", to: "/leaderboard" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [userState, setUserState] = useState<UserState | null>(null);

  useEffect(() => {
    setUserState(getUserState());
  }, []);

  const level = userState ? getUserLevel(userState.xp) : "Cadet";

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto mt-4 max-w-7xl px-4">
        <nav className="glass flex items-center justify-between rounded-full px-4 py-2.5 md:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="relative h-7 w-7">
              <div className="absolute inset-0 rounded-full bg-linear-to-br from-primary via-secondary to-accent opacity-90" />
              <div className="absolute inset-[6px] rounded-full bg-background" />
              <div className="absolute inset-[3px] rounded-full border border-white/20" />
            </div>
            <span className="font-display text-[15px] font-semibold tracking-tight">
              Cosmos<span className="text-secondary">X</span>
            </span>
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((i) => (
              <li key={i.label}>
                <Link
                  to={i.to as any}
                  activeProps={{ className: "bg-white/10 text-foreground" }}
                  className="rounded-full px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                >
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            {userState && (
              <div className="hidden items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1 text-[11px] font-mono text-amber-400 sm:inline-flex">
                <Zap className="h-3 w-3 fill-current" />
                <span>{level} ({userState.xp} XP)</span>
              </div>
            )}
            <div className="hidden sm:block w-40">
              <WalletConnectButton />
            </div>
            <button
              onClick={() => setOpen((o) => !o)}
              className="rounded-full p-1.5 text-muted-foreground hover:bg-white/5 lg:hidden"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>

        {open && (
          <div className="glass-strong mt-2 rounded-2xl p-3 lg:hidden">
            <ul className="flex flex-col">
              {NAV_ITEMS.map((i) => (
                <li key={i.label}>
                  <Link
                    to={i.to as any}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  >
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}


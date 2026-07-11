import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "#dashboard" },
  { label: "Learn", href: "#learn" },
  { label: "Marketplace", href: "#marketplace" },
  { label: "Docs", href: "#docs" },
  { label: "Community", href: "#community" },
  { label: "Leaderboard", href: "#leaderboard" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
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
                <a
                  href={i.href}
                  className="rounded-full px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                >
                  {i.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <button className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[13px] font-medium text-foreground transition hover:bg-white/10 sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_8px_currentColor]" />
              Connect
            </button>
            <button className="rounded-full bg-linear-to-r from-primary to-primary-glow px-4 py-1.5 text-[13px] font-semibold text-primary-foreground shadow-[0_0_20px_-4px_var(--color-primary)] transition hover:shadow-[0_0_28px_-2px_var(--color-primary)]">
              Sign in
            </button>
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
                  <a
                    href={i.href}
                    className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  >
                    {i.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}

# CosmosX Stellar Build Guide — Part 1: Development Environment

**Series:** This is Part 1 of 7. Read in order — each part assumes the previous one is done and verified.

**Part 1 covers:** installing every tool your machine needs *before* you write a single line of Stellar-related code. Nothing in this part touches CosmosX yet — it's pure machine setup.

**Assumed OS commands:** written for macOS/Linux terminal. If you're on Windows, use **WSL2** (Windows Subsystem for Linux) rather than raw PowerShell — almost every official Stellar tool assumes a Unix-like shell, and you'll hit far fewer weird errors. If you don't have WSL2 set up, run `wsl --install` in an admin PowerShell, reboot, then do everything below inside the WSL Ubuntu terminal.

---

## Step 1 — Install Git

### Why?
You already use Git for CosmosX, but the Stellar CLI's install script and several tools shell out to `git` internally, so it needs to exist system-wide, not just be "the thing your IDE uses."

### What is it?
Version control software. You know this already — this step is just confirming it's actually on your `PATH`.

### What will happen
Nothing new — you're just checking a pre-existing tool.

### What could go wrong
On a fresh machine, Git may not be installed at all, especially on Windows outside WSL.

### Exact steps
```bash
git --version
```
**Expected output:** something like `git version 2.43.0`.

If it's missing:
- **macOS:** `xcode-select --install` (installs Git along with Xcode command line tools), or `brew install git` if you use Homebrew.
- **Ubuntu/WSL:** `sudo apt update && sudo apt install git -y`

### Verify
`git --version` prints a version number, not "command not found."

### Common beginner mistakes
- Installing Git for Windows but then working inside WSL, where it's a *different* install — check version **inside the same shell you'll do everything else in**.

---

## Step 2 — Install Rust and Cargo

### Why?
Soroban smart contracts (the code that will actually live on the Stellar blockchain) are written in **Rust** and compiled to **WebAssembly (WASM)**. There is no way around installing Rust — it is the only supported language for Soroban contracts today.

### What is Rust? What is Cargo?
Rust is the programming language. **Cargo** is Rust's package manager and build tool — it's what you'll type `cargo build`, `cargo test` into. Installing Rust via the official installer (`rustup`) gives you both automatically, plus `rustup` itself, which manages Rust *versions* and *targets* (more on targets in Step 3).

### Why does CosmosX need it?
Your achievement/NFT contract — the actual on-chain artifact your Testnet slice produces — is a Rust program. You will write it, test it, and compile it using these tools in Part 4.

### What will happen
You'll run one install script, which downloads the Rust compiler (`rustc`), Cargo, and `rustup` itself, and adds them to your shell's `PATH`.

### What could go wrong
- The installer modifies your shell profile (`.bashrc`/`.zshrc`) to add Rust to your `PATH`. If you don't restart your terminal (or re-source the profile) afterward, commands like `cargo` will say "not found" even though installation succeeded.
- On some Linux distros you may be missing a C linker (`cc`), which Rust needs. The installer will tell you if so.

### Exact steps
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```
When prompted, choose **option 1 ("Proceed with installation (default)")**.

After it finishes, either restart your terminal, or run:
```bash
source "$HOME/.cargo/env"
```

### Verify
```bash
rustc --version
cargo --version
```
**Expected output:** two lines, each with a version number, e.g. `rustc 1.83.0 (...)` and `cargo 1.83.0 (...)`.

### Common beginner mistakes
- Forgetting to restart the terminal / source the env file, then concluding "installation failed" when it actually succeeded.
- Installing Rust via their OS package manager (`apt install rustc`) instead of `rustup` — this works but gives you a much harder time managing the special WASM target in Step 3. Use `rustup`.

---

## Step 3 — Add the WebAssembly compilation target

### Why?
By default, Rust compiles code to run on *your* computer's CPU (x86/ARM). Soroban contracts need to be compiled to **WebAssembly (WASM)** instead — a portable binary format the Stellar network can execute. This is a separate "target" that `rustup` needs to download.

### What is a "target" in Rust terms?
A target tells the compiler *what kind of machine* to produce code for. `wasm32v1-none` is the current officially recommended target for Soroban contract builds. (Older tutorials use `wasm32-unknown-unknown` — if a guide you find elsewhere uses that name instead, it's referring to an earlier convention; prefer `wasm32v1-none` per current official Stellar CLI guidance, and if a specific `cargo build` command in an older doc fails, retry with the other target name.)

### What will happen
`rustup` downloads a small additional compiler component — no new language, just a new output format.

### What could go wrong
Nothing typically — this step rarely fails. If it does, it's almost always a network/proxy issue.

### Exact steps
```bash
rustup target add wasm32v1-none
```

### Verify
```bash
rustup target list --installed
```
**Expected output:** should include `wasm32v1-none` in the list (along with your native target like `x86_64-apple-darwin` or `x86_64-unknown-linux-gnu`).

### Common beginner mistakes
- Skipping this step and only discovering it's missing when `cargo build --target wasm32v1-none` fails in Part 4 with a "target not installed" error. Do it now.

---

## Step 4 — Install the Stellar CLI

### Why?
The Stellar CLI (command: `stellar`) is the official command-line tool for everything Stellar-development-related: generating keys, funding Testnet accounts, building/deploying/invoking Soroban contracts, and even generating TypeScript bindings for your frontend. You will use this constantly in Parts 4 and 5.

### What is it?
A single Rust-built binary, published by the Stellar Development Foundation (SDF), maintained at `github.com/stellar/stellar-cli`. ([Stellar Docs – Install the CLI](https://developers.stellar.org/docs/tools/developer-tools/cli/install-cli))

### What will happen
You'll run an install script that downloads the correct pre-built binary for your OS.

### What could go wrong
- On Linux, you may be missing development headers (`libdbus`, `libudev`) — the official install script has an `--install-deps` flag specifically to handle this.
- Corporate/school networks sometimes block the download — if `curl` hangs, try a different network or a personal hotspot.

### Exact steps

**macOS/Linux/WSL:**
```bash
curl -fsSL https://github.com/stellar/stellar-cli/raw/main/install.sh | sh -s -- --install-deps
```

**Alternative (if you prefer installing via Cargo, slower but no script trust required):**
```bash
cargo install --locked stellar-cli --features opt
```

### Verify
```bash
stellar --version
```
**Expected output:** a version string like `stellar 22.x.x`.

Also verify the CLI can see its own help:
```bash
stellar contract --help
```
This should print a list of subcommands (`init`, `build`, `deploy`, `invoke`, etc.) — if you see this, the CLI is correctly installed.

### Common beginner mistakes
- Confusing the old, now-retired `soroban` CLI command name with the current `stellar` CLI — if you find an older tutorial that says `soroban contract ...`, mentally translate it to `stellar contract ...`; the current tool is named `stellar`.
- Not re-running `--install-deps` after a fresh OS reinstall, then hitting confusing linker errors later.

---

## Step 5 — Install Node.js

### Why?
CosmosX's frontend already runs on Node/Vite — but it's worth explicitly verifying your Node version here, because the current Stellar JS SDK **requires Node 22 or later** (older SDK versions worked on older Node, but you should be on the current SDK).

### What will happen
If you already have Node installed for CosmosX, you're likely fine — just confirm the version.

### What could go wrong
An outdated Node version (18 or below) will cause confusing install/runtime errors once you add `@stellar/stellar-sdk` in Part 5.

### Exact steps
```bash
node --version
```
If it's below `v22`, install a current version. The cleanest way is via **nvm** (Node Version Manager), which also protects other projects on your machine from being forced onto the same Node version:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc   # or ~/.zshrc
nvm install 22
nvm use 22
```

### Verify
```bash
node --version   # should print v22.x.x or higher
npm --version
```

### Common beginner mistakes
- Having multiple Node installations (one from an OS package manager, one from nvm) and not being sure which one `node` resolves to — run `which node` to check the actual path being used.

---

## Step 6 — Install/confirm your package manager (npm, pnpm, or yarn)

### Why?
You'll be installing new JS dependencies (Stellar SDK, Wallets Kit) into the existing CosmosX repo. Use whatever CosmosX's `package.json`/lockfile already indicates — **don't switch package managers mid-project.**

### Exact steps
Check the CosmosX repo root for a lockfile:
```bash
ls package-lock.json pnpm-lock.yaml yarn.lock 2>/dev/null
```
Whichever file exists tells you the package manager already in use. If it's `pnpm-lock.yaml` and you don't have `pnpm`:
```bash
npm install -g pnpm
```

### Verify
```bash
npm --version    # or: pnpm --version / yarn --version
```

### Common beginner mistakes
- Running `npm install` in a `pnpm`-managed repo (or vice versa) — this creates a second, conflicting lockfile and genuinely confusing dependency bugs. Match the existing lockfile.

---

## Step 7 — Install Docker (recommended, not required)

### Why?
Docker lets you run a **local Stellar network** on your own machine (via the official `stellar/quickstart` image) instead of always hitting the shared public Testnet. This is useful for fast iteration and for avoiding shared-Testnet outages/resets while you're actively developing — but it is **not required** to complete this guide; every step in Parts 3–6 can be done against real Testnet directly.

### What is it?
Docker runs lightweight, isolated "containers" — in this case, a container running Stellar's Core, Horizon, and RPC services together, simulating a full network on `localhost`.

### Should I install it?
**Recommendation for this guide:** skip it for now unless you already have Docker installed and are comfortable with it. This guide's main path uses real Testnet throughout, which is also what a judge/mentor can independently verify — a purely local network isn't visible to anyone outside your laptop. Revisit Docker only if you find yourself blocked repeatedly by Testnet instability.

### If you do want it
Download Docker Desktop from `docker.com/products/docker-desktop` for your OS, install it, and verify:
```bash
docker --version
docker run hello-world
```
**Expected output:** a "Hello from Docker!" message confirming your install works. We won't use this again until/unless you choose the optional local-network path.

---

## Step 8 — Verify your entire toolchain in one pass

Before moving to Part 2, run this full checklist in your terminal, top to bottom, and confirm every line prints a real version number:

```bash
git --version
rustc --version
cargo --version
rustup target list --installed | grep wasm32v1-none
stellar --version
node --version
npm --version    # or pnpm/yarn, matching your repo
```

**If every line above succeeds, your machine is ready.** If anything fails, go back to that step — don't proceed to Part 2 with a broken toolchain, since Part 4 (contracts) will fail in confusing ways otherwise.

---

**Next:** Part 2 — Installing and configuring Freighter, creating your first Testnet wallet, and understanding what "Testnet" even means before you touch it.

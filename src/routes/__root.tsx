import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, useRef, useMemo, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Key,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Bot,
  Globe,
  Compass,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Lost in space</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This planet isn't on the star chart. Return to the solar system.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    console.error("[CosmosX] Root error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Signal lost
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. Refresh to re-establish contact.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─── 3D LOGO & STARFIELD COMPONENT ─── */
function Logo3D({ scale = 1.0 }: { scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.45;
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.2;
    }
  });

  const chainLinks = 14;
  const radius = 2.0;

  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      {/* Central Planet Sphere */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[1.2, 64, 64]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.15}
          metalness={0.8}
        />
      </mesh>

      {/* Orbit Chain Ring */}
      <group rotation={[Math.PI / 6, 0, 0]}>
        {Array.from({ length: chainLinks }).map((_, i) => {
          const angle = (i / chainLinks) * Math.PI * 2;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const rotY = -angle;
          const rotX = Math.PI / 2;
          const rotZ = i % 2 === 0 ? 0 : Math.PI / 2;

          return (
            <mesh key={i} position={[x, 0, z]} rotation={[rotX, rotY, rotZ]}>
              <torusGeometry args={[0.22, 0.05, 12, 24]} />
              <meshStandardMaterial
                color="#ffffff"
                roughness={0.15}
                metalness={0.85}
              />
            </mesh>
          );
        })}
      </group>

      {/* Crossed X Emblem */}
      <group position={[0.4, -0.4, 0.8]} rotation={[0, Math.PI / 4, 0]}>
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.22, 1.4, 0.08]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.15}
            metalness={0.8}
          />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <boxGeometry args={[0.22, 1.4, 0.08]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.15}
            metalness={0.8}
          />
        </mesh>
      </group>
    </group>
  );
}

function Starfield3D() {
  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
    }
  });

  const starCount = 800;
  const positions = useMemo(() => {
    const pos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const radius = 18 + Math.random() * 32;
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
    }
    return pos;
  }, []);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={0.12}
        sizeAttenuation={true}
        transparent
        opacity={0.8}
      />
    </points>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "CosmosX — Master Blockchain by Exploring the Solar System" },
      {
        name: "description",
        content:
          "CosmosX is an immersive interactive learning platform that teaches blockchain through cinematic 3D simulations of our solar system, before your first real Stellar transaction.",
      },
      { name: "author", content: "CosmosX" },
      { property: "og:title", content: "CosmosX — Master Blockchain by Exploring the Solar System" },
      {
        property: "og:description",
        content:
          "CosmosX is an immersive interactive learning platform that teaches blockchain through cinematic 3D simulations of our solar system, before your first real Stellar transaction.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "CosmosX — Master Blockchain by Exploring the Solar System" },
      { name: "twitter:description", content: "CosmosX is an immersive interactive learning platform that teaches blockchain through cinematic 3D simulations of our solar system, before your first real Stellar transaction." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/tZWBRbLgYFMTm2tctDyVxnV21l43/social-images/social-1783756701459-7f1c258e-4341-4c15-8093-3fb41d45c813.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/tZWBRbLgYFMTm2tctDyVxnV21l43/social-images/social-1783756701459-7f1c258e-4341-4c15-8093-3fb41d45c813.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Form states
  const [authTab, setAuthTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const checkUser = () => {
      const stored = localStorage.getItem("cosmos_x_user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setAuthChecked(true);
    };
    checkUser();

    window.addEventListener("cosmos-x-auth-change", checkUser);
    return () => {
      window.removeEventListener("cosmos-x-auth-change", checkUser);
    };
  }, []);

  // Listen for open auth event from Nav or other parts
  useEffect(() => {
    const handleOpenAuth = () => {
      localStorage.setItem("cosmos_x_user", JSON.stringify({ email: "agent.cosmosx@galaxy.io" }));
      window.dispatchEvent(new CustomEvent("cosmos-x-auth-change"));
    };
    window.addEventListener("cosmos-x-open-auth", handleOpenAuth);
    return () => {
      window.removeEventListener("cosmos-x-open-auth", handleOpenAuth);
    };
  }, []);

  // Loading Progress logic
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsLoading(false), 600);
          return 100;
        }
        return prev + 2;
      });
    }, 35);
    return () => clearInterval(interval);
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setAuthError("");
    setAuthSuccess("");
    setAuthLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setAuthSuccess("Credentials authorized! Synchronizing telemetry link...");
      setTimeout(() => {
        setShowAuthModal(false);
        setAuthSuccess("");
      }, 1000);
    } catch (err: any) {
      setAuthError(err.message || "Failed to verify credentials.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setAuthError("");
    setAuthSuccess("");
    setAuthLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || email.split("@")[0],
            username: email.split("@")[0],
          }
        }
      });
      if (error) throw error;
      setAuthSuccess("Dossier created! Confirm your email registration link.");
      setTimeout(() => {
        setShowAuthModal(false);
        setAuthSuccess("");
      }, 1500);
    } catch (err: any) {
      setAuthError(err.message || "Failed to initialize new dossier.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError("");
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    } catch (err: any) {
      setAuthError(err.message || "Google auth handshake failed.");
      setAuthLoading(false);
    }
  };

  // 1. Initial Space Loading Screen with 2D logo
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#02040a] flex flex-col items-center justify-center select-none font-sans overflow-hidden">
        {/* Full screen realistic space canvas background */}
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 5] }}>
            <ambientLight intensity={0.25} />
            <Starfield3D />
          </Canvas>
        </div>

        {/* 2D Logo at the center */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center -mt-10">
          <motion.img
            src="/logo.jpg"
            alt="CosmosX logo"
            initial={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="w-48 h-48 md:w-56 md:h-56 object-contain rounded-2xl shadow-[0_0_60px_rgba(255,255,255,0.06)] border border-white/5"
          />
        </div>

        {/* Loading HUD Overlay */}
        <div className="relative z-10 w-full max-w-xs space-y-4 text-center mt-auto pb-16">
          <div className="space-y-1">
            <h1 className="font-rushblade text-xl tracking-[0.2em] text-white">COSMOSX</h1>
            <p className="font-mono text-[8px] text-cyan-400 tracking-widest uppercase">Establishing Orbital Telemetry Link</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between font-mono text-[8px] text-slate-500">
              <span>INITIALIZING MODULES...</span>
              <span>{loadingProgress}%</span>
            </div>
            {/* Glowing Loading Bar */}
            <div className="h-1 bg-slate-950 rounded-full border border-white/5 overflow-hidden p-px">
              <div
                className="h-full rounded-full bg-linear-to-r from-cyan-400 via-blue-500 to-indigo-600 shadow-[0_0_12px_rgba(6,182,212,0.6)] transition-all duration-300"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Main app containing landing page & lazy loaded modals
  return (
    <QueryClientProvider client={queryClient}>
      {/* Landing page and actual route content */}
      <Outlet />

      {/* Authentication Gate Modal (Supabase integration) */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center font-sans p-4">
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={() => setShowAuthModal(false)} />

            {/* Auth card panel */}
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.98 }}
              className="relative z-10 w-full max-w-sm border border-white/8 bg-slate-950/85 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl flex flex-col gap-5 overflow-hidden"
            >
              {/* Subtle top edge glow */}
              <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-cyan-500/30 to-transparent" />

              {/* Close Button */}
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white transition font-mono text-[9px] uppercase border border-white/10 hover:border-white/20 rounded px-2.5 py-1 cursor-pointer"
              >
                Close
              </button>

              {/* Logo in 2D */}
              <div className="h-16 w-16 mx-auto -mt-2">
                <img
                  src="/logo.jpg"
                  alt="CosmosX logo"
                  className="w-full h-full object-contain rounded-xl border border-white/5 shadow-md"
                />
              </div>

              <div className="text-center space-y-1">
                <h2 className="font-rushblade text-sm text-white tracking-widest uppercase">COSMOSX SECURE PORTAL</h2>
                <p className="text-[10px] text-slate-400 font-mono">Initialize your blockchain mission agent dossier.</p>
              </div>

              {/* Auth Status Logs */}
              {authError && (
                <div className="p-2.5 rounded-xl border border-red-500/20 bg-red-500/5 flex gap-2 text-red-400 text-[10px] font-mono leading-relaxed text-left">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}
              {authSuccess && (
                <div className="p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex gap-2 text-emerald-400 text-[10px] font-mono leading-relaxed text-left">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{authSuccess}</span>
                </div>
              )}

              {/* Tab selectors */}
              <div className="grid grid-cols-2 p-0.5 rounded-xl bg-slate-900/60 border border-white/5">
                <button
                  onClick={() => { setAuthTab("signin"); setAuthError(""); }}
                  className={`py-1.5 rounded-lg text-[10.5px] font-mono tracking-wider font-bold transition-all cursor-pointer ${
                    authTab === "signin"
                      ? "bg-slate-800 text-white shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  SIGN IN
                </button>
                <button
                  onClick={() => { setAuthTab("signup"); setAuthError(""); }}
                  className={`py-1.5 rounded-lg text-[10.5px] font-mono tracking-wider font-bold transition-all cursor-pointer ${
                    authTab === "signup"
                      ? "bg-slate-800 text-white shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  CREATE DOSSIER
                </button>
              </div>

              {/* Form */}
              <form onSubmit={authTab === "signin" ? handleSignIn : handleSignUp} className="space-y-3.5">
                {authTab === "signup" && (
                  <div className="space-y-1 text-left">
                    <label className="font-mono text-[8px] text-slate-500 uppercase tracking-wider pl-1">Agent Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                        placeholder="Enter name"
                        className="w-full pl-9 pr-4 py-2 bg-slate-900/50 border border-white/5 focus:border-cyan-500/40 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1 text-left">
                  <label className="font-mono text-[8px] text-slate-500 uppercase tracking-wider pl-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="agent@cosmosx.io"
                      className="w-full pl-9 pr-4 py-2 bg-slate-900/50 border border-white/5 focus:border-cyan-500/40 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="font-mono text-[8px] text-slate-500 uppercase tracking-wider pl-1">Access Key (Password)</label>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2 bg-slate-900/50 border border-white/5 focus:border-cyan-500/40 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* CTA Trigger */}
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-rushblade uppercase tracking-wider text-slate-950 bg-cyan-400 hover:bg-cyan-300 font-bold transition shadow-lg disabled:opacity-50 cursor-pointer hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] mt-2"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-950" />
                  {authLoading ? "Authorizing Connection..." : authTab === "signin" ? "Authorize Agent Login" : "Initialize Agent Dossier"}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center justify-between text-[8px] font-mono text-slate-600 uppercase tracking-widest my-1">
                <div className="h-px bg-white/5 flex-1" />
                <span className="px-3">or federated auth</span>
                <div className="h-px bg-white/5 flex-1" />
              </div>

              {/* Social Sign In */}
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[10.5px] font-mono font-bold tracking-wider text-slate-300 bg-slate-900 hover:bg-slate-800 transition border border-white/5 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                Connect via Google
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </QueryClientProvider>
  );
}


import { useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader, AdditiveBlending, BackSide, DoubleSide, Object3D, BufferGeometry, Material, Texture } from "three";
import * as THREE from "three";
import { PLANETS, SUN, type Planet } from "@/lib/planets";

// Patch ThreeJS prototypes to prevent R3F crashes from IDE inspector injecting data-* attributes.
// Uses a getter/setter to ensure each instance gets its own unique, private data storage object.
if (typeof window !== "undefined") {
  const patchProto = (proto: any) => {
    Object.defineProperty(proto, "data", {
      get() {
        if (!this._data) this._data = {};
        return this._data;
      },
      set(val) {
        this._data = val;
      },
      configurable: true,
      enumerable: true,
    });
  };
  patchProto(Object3D.prototype);
  patchProto(BufferGeometry.prototype);
  patchProto(Material.prototype);
  patchProto(Texture.prototype);
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  scrollProgress: React.MutableRefObject<number>;
  hoveredPlanet: string | null;
  setHoveredPlanet: (id: string | null) => void;
  onPlanetClick: (id: string) => void;
  activePlanetIdx: number;
};

// ─── Canvas Texture Factories ─────────────────────────────────────────────────

function makeSunGlowTex(): THREE.CanvasTexture {
  const S = 512;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0.00, "rgba(255,255,255,1.0)");
  g.addColorStop(0.12, "rgba(255,238,185,0.95)");
  g.addColorStop(0.35, "rgba(255,145,30,0.65)");
  g.addColorStop(0.65, "rgba(230,65,10,0.22)");
  g.addColorStop(1.00, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  return new THREE.CanvasTexture(c);
}

function makeNebulaTex(r: number, g: number, b: number, seed: number): THREE.CanvasTexture {
  const S = 512;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;

  const rng = (n: number) => Math.abs(Math.sin((seed + 1) * 2311 + n * 5003 + 0.7));

  const gr = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  gr.addColorStop(0.00, `rgba(${r},${g},${b},0.28)`);
  gr.addColorStop(0.28, `rgba(${r},${g},${b},0.17)`);
  gr.addColorStop(0.55, `rgba(${r},${g},${b},0.07)`);
  gr.addColorStop(1.00, `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = gr;
  ctx.fillRect(0, 0, S, S);

  for (let i = 0; i < 14; i++) {
    const bx = rng(i * 5) * S;
    const by = rng(i * 5 + 1) * S;
    const br = rng(i * 5 + 2) * S * 0.28 + S * 0.06;
    const bg = ctx.createRadialGradient(bx, by, 0, bx, by, br);
    const R2 = Math.min(r + 50, 255), G2 = Math.min(g + 50, 255), B2 = Math.min(b + 50, 255);
    bg.addColorStop(0, `rgba(${R2},${G2},${B2},0.13)`);
    bg.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, S, S);
  }
  return new THREE.CanvasTexture(c);
}

function makeShootingStarTex(): THREE.CanvasTexture {
  const W = 6, H = 320;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0.00, "rgba(255,255,255,0)");
  g.addColorStop(0.35, "rgba(160,195,255,0.20)");
  g.addColorStop(0.68, "rgba(210,230,255,0.72)");
  g.addColorStop(0.88, "rgba(240,248,255,0.93)");
  g.addColorStop(1.00, "rgba(255,255,255,1)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  return new THREE.CanvasTexture(c);
}

function makeStarburstTex(): THREE.CanvasTexture {
  const S = 256;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  const center = S / 2;

  // Draw soft radial background glow
  const g = ctx.createRadialGradient(center, center, 0, center, center, S / 4);
  g.addColorStop(0.00, "rgba(255, 255, 255, 1.0)");
  g.addColorStop(0.20, "rgba(230, 245, 255, 0.70)");
  g.addColorStop(0.50, "rgba(100, 180, 255, 0.15)");
  g.addColorStop(1.00, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);

  // Draw vertical flare spike
  ctx.strokeStyle = "rgba(215, 238, 255, 0.85)";
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(center, 12);
  ctx.lineTo(center, S - 12);
  ctx.stroke();

  // Draw horizontal flare spike
  ctx.beginPath();
  ctx.moveTo(12, center);
  ctx.lineTo(S - 12, center);
  ctx.stroke();

  // Draw diagonal shorter spike 1
  ctx.strokeStyle = "rgba(180, 220, 255, 0.40)";
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.moveTo(center - S/4, center - S/4);
  ctx.lineTo(center + S/4, center + S/4);
  ctx.stroke();

  // Draw diagonal shorter spike 2
  ctx.beginPath();
  ctx.moveTo(center + S/4, center - S/4);
  ctx.lineTo(center - S/4, center + S/4);
  ctx.stroke();

  return new THREE.CanvasTexture(c);
}

function makeSaturnRingsTex(): THREE.CanvasTexture {
  const S = 512;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  const center = S / 2;

  ctx.clearRect(0, 0, S, S);

  const rMin = 158;
  const rMax = 256;

  // Concentric ring structures (fractions from inner to outer)
  const bands = [
    { r: 0.05, w: 0.08, c: "rgba(165, 150, 120, 0.40)" }, // C-ring inner
    { r: 0.15, w: 0.12, c: "rgba(195, 180, 150, 0.65)" }, // C-ring outer
    { r: 0.30, w: 0.15, c: "rgba(235, 218, 185, 0.88)" }, // B-ring inner
    { r: 0.48, w: 0.18, c: "rgba(245, 230, 198, 0.96)" }, // B-ring outer
    { r: 0.68, w: 0.04, c: "rgba(12, 10, 8, 0.00)" },     // Cassini Division (gap)
    { r: 0.74, w: 0.12, c: "rgba(215, 198, 168, 0.78)" }, // A-ring inner
    { r: 0.88, w: 0.06, c: "rgba(185, 168, 138, 0.58)" }, // A-ring outer
    { r: 0.96, w: 0.02, c: "rgba(160, 145, 115, 0.35)" }, // F-ring
  ];

  bands.forEach(b => {
    ctx.strokeStyle = b.c;
    ctx.lineWidth = b.w * (rMax - rMin);
    ctx.beginPath();
    const radius = rMin + b.r * (rMax - rMin);
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.stroke();
  });

  return new THREE.CanvasTexture(c);
}

// ─── Sun ──────────────────────────────────────────────────────────────────────

function Sun() {
  const tex = useLoader(TextureLoader, SUN.texture);
  const bodyRef = useRef<THREE.Mesh>(null);

  const glowTex = useMemo(() => makeSunGlowTex(), []);

  useFrame(() => {
    if (bodyRef.current) bodyRef.current.rotation.y += 0.0025;
  });

  return (
    <group>
      <pointLight position={[0, 0, 0]} intensity={5.0} distance={280} decay={1.05} color="#fff8d8" />
      <pointLight position={[0, 0, 0]} intensity={1.5} distance={60}  decay={0.8}  color="#ffa050" />

      {/* Sun body */}
      <mesh ref={bodyRef}>
        <sphereGeometry args={[SUN.radius, 64, 64]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>

      {/* Sprite-based volumetric glow — replaces the old BackSide corona rings */}
      <sprite scale={[SUN.radius * 2.5, SUN.radius * 2.5, 1]}>
        <spriteMaterial
          map={glowTex}
          transparent
          blending={AdditiveBlending}
          depthWrite={false}
          opacity={0.90}
        />
      </sprite>
    </group>
  );
}

// ─── Background Group (Centered around Camera) ─────────────────────────────────

function BackgroundGroup({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ camera }) => {
    if (ref.current) {
      ref.current.position.copy(camera.position);
    }
  });
  return <group ref={ref}>{children}</group>;
}

// ─── Milky Way Band ───────────────────────────────────────────────────────────

function MilkyWay() {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const N = 5000;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const tilt = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.65, 0.18, 0.28));

    for (let i = 0; i < N; i++) {
      const r = 210 + Math.random() * 240;
      const theta = Math.random() * Math.PI * 2;
      // Gaussian-like concentration around galactic equator
      const spread = (Math.random() + Math.random() - 1.0) * 0.38;
      const phi = Math.PI / 2 + spread;

      const v = new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      ).applyQuaternion(tilt);
      pos[i * 3] = v.x; pos[i * 3 + 1] = v.y; pos[i * 3 + 2] = v.z;

      const warmth = Math.random() * 0.75 + (1 - Math.abs(spread) / 0.38) * 0.25;
      col[i * 3]     = 0.62 + warmth * 0.38; // Red
      col[i * 3 + 1] = 0.68 + warmth * 0.22; // Green
      col[i * 3 + 2] = 0.88 + (1 - warmth) * 0.12; // Blue
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color",    new THREE.BufferAttribute(col, 3));
    return g;
  }, []);

  return (
    <points>
      <primitive attach="geometry" object={geo} />
      <pointsMaterial
        size={1.1}
        vertexColors
        sizeAttenuation={false}
        transparent
        opacity={0.30}
        depthWrite={false}
      />
    </points>
  );
}

// ─── Three-Tier Star Field ────────────────────────────────────────────────────

function StarField() {
  const tiny = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const N = 4500;
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = 240 + Math.random() * 210;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i*3] = r*Math.sin(phi)*Math.cos(theta); pos[i*3+1] = r*Math.sin(phi)*Math.sin(theta); pos[i*3+2] = r*Math.cos(phi);
      const w = Math.random();
      col[i*3] = 0.80+w*0.20; col[i*3+1] = 0.84+w*0.16; col[i*3+2] = 0.94+w*0.06;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color",    new THREE.BufferAttribute(col, 3));
    return g;
  }, []);

  const medium = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const N = 850;
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = 220 + Math.random() * 230;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i*3] = r*Math.sin(phi)*Math.cos(theta); pos[i*3+1] = r*Math.sin(phi)*Math.sin(theta); pos[i*3+2] = r*Math.cos(phi);
      // Realistic stellar colour types
      const t = Math.floor(Math.random() * 5);
      if      (t === 0) { col[i*3]=1.0; col[i*3+1]=0.60; col[i*3+2]=0.40; } // M red giant
      else if (t === 1) { col[i*3]=0.70; col[i*3+1]=0.82; col[i*3+2]=1.00; } // O/B blue
      else if (t === 2) { col[i*3]=1.0; col[i*3+1]=0.94; col[i*3+2]=0.65; } // G yellow
      else if (t === 3) { col[i*3]=1.0; col[i*3+1]=0.82; col[i*3+2]=0.50; } // K orange
      else              { col[i*3]=1.0; col[i*3+1]=1.00; col[i*3+2]=1.00; } // A white
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color",    new THREE.BufferAttribute(col, 3));
    return g;
  }, []);

  const bright = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const N = 150;
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = 210 + Math.random() * 220;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i*3] = r*Math.sin(phi)*Math.cos(theta); pos[i*3+1] = r*Math.sin(phi)*Math.sin(theta); pos[i*3+2] = r*Math.cos(phi);
      col[i*3]=1; col[i*3+1]=1; col[i*3+2]=1;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color",    new THREE.BufferAttribute(col, 3));
    return g;
  }, []);

  const brightRef = useRef<THREE.Points>(null);
  useFrame(({ clock }) => {
    if (brightRef.current) {
      const t = clock.getElapsedTime();
      (brightRef.current.material as THREE.PointsMaterial).opacity =
        0.58 + Math.sin(t * 1.05) * 0.14 + Math.sin(t * 0.67) * 0.09;
    }
  });

  return (
    <>
      <points>
        <primitive attach="geometry" object={tiny} />
        <pointsMaterial size={0.9} vertexColors sizeAttenuation={false} transparent opacity={0.65} depthWrite={false} />
      </points>
      <points>
        <primitive attach="geometry" object={medium} />
        <pointsMaterial size={1.3} vertexColors sizeAttenuation={false} transparent opacity={0.78} depthWrite={false} />
      </points>
      <points ref={brightRef}>
        <primitive attach="geometry" object={bright} />
        <pointsMaterial size={2.0} vertexColors sizeAttenuation={false} transparent opacity={0.85} depthWrite={false} />
      </points>
    </>
  );
}

// ─── Nebula Field (Sprite-based) ──────────────────────────────────────────────

function NebulaField() {
  const textures = useMemo(() => [
    makeNebulaTex(0, 95, 160, 1),    // deep ocean blue
    makeNebulaTex(0, 135, 110, 2),   // rich turquoise/teal
    makeNebulaTex(45, 135, 75, 3),   // soft green
    makeNebulaTex(10, 70, 130, 4),   // indigo-blue
    makeNebulaTex(85, 145, 50, 5),   // yellow-green
    makeNebulaTex(5, 115, 140, 6),   // cyan
  ], []);

  const nebulae = useMemo<{ pos: [number,number,number]; s: number; ti: number }[]>(() => [
    // Left side: blue & cyan
    { pos: [-140, 40, -280], s: 380, ti: 0 },
    { pos: [-90, -30, -250], s: 420, ti: 5 },
    // Center: turquoise & teal
    { pos: [10, 20, -260], s: 460, ti: 1 },
    { pos: [70, 70, -290], s: 390, ti: 3 },
    // Right side: green & yellow-green
    { pos: [140, 10, -270], s: 440, ti: 2 },
    { pos: [190, -40, -300], s: 380, ti: 4 },
  ], []);

  return (
    <>
      {nebulae.map((n, i) => (
        <sprite key={i} position={n.pos} scale={[n.s, n.s, 1]}>
          <spriteMaterial
            map={textures[n.ti]}
            transparent
            blending={AdditiveBlending}
            depthWrite={false}
            opacity={0.16}
          />
        </sprite>
      ))}
    </>
  );
}

// ─── Starburst Stars ─────────────────────────────────────────────────────────

function StarburstStars() {
  const tex = useMemo(() => makeStarburstTex(), []);
  const stars = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 240 + Math.random() * 80;
      return {
        pos: [
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi) - 50
        ] as [number, number, number],
        scale: 4.5 + Math.random() * 6.5,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 0.8,
      };
    });
  }, []);

  const spriteRefs = useRef<(THREE.Sprite | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    stars.forEach((s, i) => {
      const sprite = spriteRefs.current[i];
      if (sprite) {
        (sprite.material as THREE.SpriteMaterial).opacity =
          0.45 + Math.sin(t * s.speed + s.phase) * 0.35;
      }
    });
  });

  return (
    <>
      {stars.map((s, i) => (
        <sprite
          key={i}
          ref={(el) => { spriteRefs.current[i] = el; }}
          position={s.pos}
          scale={[s.scale, s.scale, 1]}
        >
          <spriteMaterial map={tex} transparent blending={AdditiveBlending} depthWrite={false} />
        </sprite>
      ))}
    </>
  );
}

// ─── Asteroid Belt ───────────────────────────────────────────────────────────

function AsteroidMesh({ config, time }: { config: any; time: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.x += dt * config.spinX;
      ref.current.rotation.y += dt * config.spinY;
      // Revolution around Sun (2.8x speed scale)
      const angle = config.theta + time * config.speed * 2.8;
      ref.current.position.set(Math.cos(angle) * config.r, config.y, Math.sin(angle) * config.r);
    }
  });

  return (
    <mesh ref={ref} scale={config.scale}>
      <dodecahedronGeometry args={[1, 1]} />
      <meshStandardMaterial color="#6a635b" roughness={0.92} metalness={0.08} />
    </mesh>
  );
}

function AsteroidBelt({ time }: { time: number }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const N = 4000; // Increased density
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);

    for (let i = 0; i < N; i++) {
      // Strictly constrained radius (between Mars's 18.4+0.72=19.12 and Jupiter's 25.5-2.4=23.1)
      const r = 19.8 + Math.random() * 2.8;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 0.65;

      pos[i * 3]     = Math.cos(theta) * r;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(theta) * r;

      // Varied grey-brown tones
      const c = 0.35 + Math.random() * 0.20;
      col[i * 3]     = c;        // Red
      col[i * 3 + 1] = c * 0.94; // Green
      col[i * 3 + 2] = c * 0.86; // Blue
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color",    new THREE.BufferAttribute(col, 3));
    return g;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame((_, dt) => {
    if (ref.current) {
      // Particles orbit at an average speed matching the belt's region
      ref.current.rotation.y += dt * 0.042;
    }
  });

  // Generate 3D asteroid meshes
  const asteroids3D = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const r = 20.0 + Math.random() * 2.2;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 0.45;
      const scale = 0.045 + Math.random() * 0.075;
      const speed = 0.06 + Math.random() * 0.05;
      const spinX = (Math.random() - 0.5) * 0.8;
      const spinY = (Math.random() - 0.5) * 0.8;
      return { r, theta, y, scale, speed, spinX, spinY };
    });
  }, []);

  return (
    <group>
      {/* Dense particle belt */}
      <points ref={ref}>
        <primitive attach="geometry" object={geo} />
        <pointsMaterial
          size={0.22}
          vertexColors
          transparent
          opacity={0.88}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      {/* 3D Asteroids */}
      {asteroids3D.map((ast, i) => (
        <AsteroidMesh key={i} config={ast} time={time} />
      ))}
    </group>
  );
}

// ─── Shooting Star System ─────────────────────────────────────────────────────

const POOL = 7;

type StarState = {
  active: boolean;
  prog: number;
  nextAt: number;
  start: THREE.Vector3;
  dir: THREE.Vector3;
  len: number;
  spd: number;
};

function ShootingStarSystem() {
  const trailTex = useMemo(() => makeShootingStarTex(), []);

  const stars = useRef<StarState[]>(
    Array.from({ length: POOL }, (_, i) => ({
      active: false,
      prog: 0,
      nextAt: i * 2.2 + 0.8,
      start: new THREE.Vector3(),
      dir: new THREE.Vector3(0, 0, -1),
      len: 60,
      spd: 1.3,
    }))
  );

  const meshRefs = useRef<(THREE.Mesh | null)[]>(Array(POOL).fill(null));

  const _up   = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const _right = useMemo(() => new THREE.Vector3(1, 0, 0), []);
  const _q     = useMemo(() => new THREE.Quaternion(), []);

  function activate(star: StarState, seed: number) {
    const rng = (n: number) => Math.abs(Math.sin(seed * 0.01 + n * 6271));
    const r = 195;
    const theta = rng(1) * Math.PI * 2;
    const phi = rng(2) * 0.55 * Math.PI + 0.1;
    star.start.set(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    );
    const inward = star.start.clone().negate().normalize().multiplyScalar(0.22);
    const axis = Math.abs(star.start.y / r) < 0.85 ? _up : _right;
    const t1 = star.start.clone().cross(axis).normalize();
    const t2 = star.start.clone().cross(t1).normalize();
    const ang = rng(3) * Math.PI * 2;
    star.dir.copy(
      t1.multiplyScalar(Math.cos(ang) * 0.88)
        .addScaledVector(t2, Math.sin(ang) * 0.88)
        .add(inward)
    ).normalize();
    star.len = 48 + rng(4) * 45;
    star.spd = 1.1 + rng(5) * 0.8;
    star.prog = 0;
    star.active = true;
  }

  useFrame(({ clock }, dt) => {
    const t = clock.getElapsedTime();

    stars.current.forEach((star, i) => {
      const mesh = meshRefs.current[i];
      if (!mesh) return;

      if (!star.active) {
        mesh.visible = false;
        if (t >= star.nextAt) {
          activate(star, t * 137 + i * 9999);
          star.nextAt = t + star.len / (star.spd * 55) + 4 + Math.random() * 9;
        }
        return;
      }

      star.prog += dt * star.spd;
      if (star.prog >= 1.0) {
        star.active = false;
        mesh.visible = false;
        return;
      }

      mesh.position.copy(star.start).addScaledVector(star.dir, star.prog * star.len);

      // Orient cylinder toward direction of travel
      _q.setFromUnitVectors(_up, star.dir);
      mesh.quaternion.copy(_q);

      // Fade in / hold / fade out
      const p = star.prog;
      const alpha = p < 0.10 ? p / 0.10 : p > 0.72 ? 1 - (p - 0.72) / 0.28 : 1.0;
      (mesh.material as THREE.MeshBasicMaterial).opacity = alpha * 0.92;
      mesh.visible = true;
    });
  });

  return (
    <>
      {Array.from({ length: POOL }, (_, i) => (
        <mesh key={i} ref={(el) => { meshRefs.current[i] = el; }} visible={false}>
          {/* radiusTop=0.09 (head/bright), radiusBottom=0 (tail/transparent) */}
          <cylinderGeometry args={[0.09, 0.0, 24, 5, 1]} />
          <meshBasicMaterial
            map={trailTex}
            transparent
            blending={AdditiveBlending}
            depthWrite={false}
            opacity={0}
          />
        </mesh>
      ))}
    </>
  );
}

// ─── Orbit Ring ────────────────────────────────────────────────────────────────

function OrbitRing({ radius, highlighted }: { radius: number; highlighted: boolean }) {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 200; i++) {
      const a = (i / 200) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [radius]);

  return (
    <line>
      <primitive attach="geometry" object={geo} />
      <lineBasicMaterial
        color={highlighted ? "#5566ee" : "#222e60"}
        transparent
        opacity={highlighted ? 0.72 : 0.13}
      />
    </line>
  );
}

// ─── Earth Cloud Layer ─────────────────────────────────────────────────────────

function EarthClouds({ radius }: { radius: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y -= dt * 0.025; });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[radius * 1.058, 48, 48]} />
      <meshStandardMaterial color="#cce8f2" transparent opacity={0.14} roughness={1} metalness={0} depthWrite={false} />
    </mesh>
  );
}

// ─── Planet Body ───────────────────────────────────────────────────────────────

const ATMOSPHERE_COLORS: Record<string, { color: string; base: number; hover: number }> = {
  mercury: { color: "#8a9da8", base: 0.02, hover: 0.12 },
  venus:   { color: "#f4e3b1", base: 0.08, hover: 0.26 },
  earth:   { color: "#a2d2ff", base: 0.12, hover: 0.35 },
  mars:    { color: "#f08080", base: 0.06, hover: 0.24 },
  jupiter: { color: "#f2cc8f", base: 0.09, hover: 0.28 },
  saturn:  { color: "#f4f1de", base: 0.09, hover: 0.28 },
  uranus:  { color: "#ade8f4", base: 0.11, hover: 0.32 },
  neptune: { color: "#48cae4", base: 0.11, hover: 0.35 },
};

function PlanetBody({
  planet, planetIdx, hovered, isActive,
  onHover, onClick, time, frozenAngles,
}: {
  planet: Planet; planetIdx: number; hovered: boolean; isActive: boolean;
  onHover: (h: boolean) => void; onClick: () => void; time: number;
  frozenAngles: React.MutableRefObject<(number | null)[]>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const spinRef  = useRef<THREE.Mesh>(null);
  const glowRef  = useRef<THREE.Mesh>(null);
  const tex = useLoader(TextureLoader, planet.texture);

  const saturnRingsTex = useMemo(() => makeSaturnRingsTex(), []);
  const atmos = ATMOSPHERE_COLORS[planet.id] || { color: "#00ccff", base: 0.02, hover: 0.30 };

  useFrame((_, dt) => {
    // Freeze/unfreeze orbital angle
    if (isActive) {
      if (frozenAngles.current[planetIdx] === null) {
        frozenAngles.current[planetIdx] = time * planet.speed * 2.8 + planet.orbit;
      }
    } else {
      frozenAngles.current[planetIdx] = null;
    }

    if (groupRef.current) {
      const angle = frozenAngles.current[planetIdx] ?? (time * planet.speed * 2.8 + planet.orbit);
      groupRef.current.position.x = Math.cos(angle) * planet.orbit;
      groupRef.current.position.z = Math.sin(angle) * planet.orbit;
    }

    // Axial spin always continues even when frozen in orbit
    if (spinRef.current) spinRef.current.rotation.y += dt * 0.11;

    // Smooth atmospheric glow lerp — unhovered base level to intensified hover level
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      const targetOpacity = hovered ? atmos.hover : atmos.base;
      mat.opacity += (targetOpacity - mat.opacity) * 0.09;
    }
  });

  return (
    <group ref={groupRef}>
      <group rotation={[0, 0, planet.tilt]} scale={hovered ? 1.16 : 1}>
        <mesh
          ref={spinRef}
          onPointerOver={(e) => { e.stopPropagation(); onHover(true); document.body.style.cursor = "pointer"; }}
          onPointerOut={() => { onHover(false); document.body.style.cursor = ""; }}
          onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
          <sphereGeometry args={[planet.radius, 64, 64]} />
          <meshStandardMaterial
            map={tex} roughness={0.82} metalness={0.04}
            emissive={hovered ? "#334488" : "#000000"}
            emissiveIntensity={hovered ? 0.20 : 0}
          />
        </mesh>

        {planet.id === "earth" && <EarthClouds radius={planet.radius} />}

        {/* Custom atmospheric rim airglow */}
        <mesh ref={glowRef}>
          <sphereGeometry args={[planet.radius * 1.09, 24, 24]} />
          <meshBasicMaterial
            color={atmos.color} transparent opacity={atmos.base}
            blending={AdditiveBlending} side={BackSide} depthWrite={false}
          />
        </mesh>

        {planet.rings && (
          <mesh rotation={[Math.PI / 2.15, 0, 0]}>
            <ringGeometry args={[planet.rings.inner, planet.rings.outer, 200, 8]} />
            <meshBasicMaterial
              map={saturnRingsTex} side={DoubleSide} transparent opacity={0.88}
            />
          </mesh>
        )}
      </group>
    </group>
  );
}

// ─── Camera Rig ────────────────────────────────────────────────────────────────

const MIN_SUN_DIST = 5.8; // prevent clipping through sun geometry

function CameraRig({
  scrollProgress, activePlanetIdx, frozenAngles,
}: {
  scrollProgress: React.MutableRefObject<number>;
  activePlanetIdx: number;
  frozenAngles: React.MutableRefObject<(number | null)[]>;
}) {
  const curPos    = useRef(new THREE.Vector3(0, 30, 65));
  const desPos    = useRef(new THREE.Vector3(0, 30, 65));
  const curLook   = useRef(new THREE.Vector3(0, 0, 0));
  const desLook   = useRef(new THREE.Vector3(0, 0, 0));
  const prevScroll = useRef(0);
  const curFov    = useRef(45);
  const desFov    = useRef(45);

  useFrame(({ camera, clock, pointer }) => {
    const p = THREE.MathUtils.clamp(scrollProgress.current, 0, 1);
    const t = clock.getElapsedTime();

    const vel = (p - prevScroll.current) * 55;
    prevScroll.current = p;

    const OVR = 0.1;
    let tx = 0, ty = 30, tz = 65, lx = 0, ly = 0, lz = 0, targetFov = 46;

    if (p < OVR) {
      const k = p / OVR;
      ty = THREE.MathUtils.lerp(30, 12, k);
      tz = THREE.MathUtils.lerp(65, 40, k);
    } else {
      const seg   = (p - OVR) / (1 - OVR);
      const idx   = Math.min(PLANETS.length - 1, Math.floor(seg * PLANETS.length));
      const local = seg * PLANETS.length - idx; // 0→1 within this planet's section
      const planet = PLANETS[idx];

      // Determine planet's ACTUAL position (frozen or live)
      const angle = frozenAngles.current[idx] ?? (t * planet.speed * 2.8 + planet.orbit);
      const px = Math.cos(angle) * planet.orbit;
      const pz = Math.sin(angle) * planet.orbit;

      // Approach from the side — outAngle is tangential to orbit, avoids sun path
      const inwardAngle = Math.atan2(pz, px);
      const outAngle = inwardAngle + Math.PI * 0.58; // 105° off the sun-to-planet axis

      // Ease-in: dist eases quadratically from far→close
      const ease = local * local;
      const dist   = THREE.MathUtils.lerp(planet.radius * 11, planet.radius * 2.6, ease);
      const height = THREE.MathUtils.lerp(planet.radius * 2.2, planet.radius * 0.35, ease);

      tx = px + Math.cos(outAngle) * dist;
      ty = height;
      tz = pz + Math.sin(outAngle) * dist;
      lx = px; ly = 0; lz = pz;

      targetFov = THREE.MathUtils.lerp(46, 32, ease);
    }

    // Subtle mouse parallax
    tx += pointer.x * 1.1;
    ty += pointer.y * 0.55;
    // Scroll momentum — slight cz drift
    tz += vel * 0.05;

    desPos.current.set(tx, ty, tz);
    desLook.current.set(lx, ly, lz);

    // Sun avoidance: keep camera outside sun's visible sphere
    if (desPos.current.length() < MIN_SUN_DIST) {
      desPos.current.normalize().multiplyScalar(MIN_SUN_DIST);
    }

    // Cinematic smooth lerp — slower = more filmic
    curPos.current.lerp(desPos.current, 0.036);
    curLook.current.lerp(desLook.current, 0.046);

    camera.position.copy(curPos.current);
    camera.lookAt(curLook.current);

    // FOV breathing
    desFov.current = targetFov;
    curFov.current += (desFov.current - curFov.current) * 0.038;
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = curFov.current;
    cam.updateProjectionMatrix();
  });

  return null;
}

// ─── Main Export ───────────────────────────────────────────────────────────────

export default function SolarSystem({
  scrollProgress, hoveredPlanet, setHoveredPlanet, onPlanetClick, activePlanetIdx,
}: Props) {
  const clock = useRef(0);
  const frozenAngles = useRef<(number | null)[]>(Array(PLANETS.length).fill(null));
  const dirLightRef = useRef<THREE.DirectionalLight>(null);

  useFrame((state, dt) => {
    clock.current += dt;
    if (dirLightRef.current) {
      dirLightRef.current.position.copy(state.camera.position);
    }
  });

  return (
    <>
      <color attach="background" args={["#010309"]} />
      <fog attach="fog" args={["#010309", 105, 275]} />
      <ambientLight intensity={0.08} />
      <hemisphereLight intensity={0.32} color="#141b2d" groundColor="#05020a" />
      <directionalLight ref={dirLightRef} intensity={0.15} color="#a5b4fc" />

      <BackgroundGroup>
        <MilkyWay />
        <StarField />
        <StarburstStars />
        <NebulaField />
        <ShootingStarSystem />
      </BackgroundGroup>
      <AsteroidBelt time={clock.current} />
      <Sun />

      {PLANETS.map((p, i) => (
        <group key={p.id}>
          <OrbitRing radius={p.orbit} highlighted={hoveredPlanet === p.id} />
          <PlanetBody
            planet={p} planetIdx={i}
            hovered={hoveredPlanet === p.id}
            isActive={activePlanetIdx === i}
            onHover={(h) => setHoveredPlanet(h ? p.id : null)}
            onClick={() => onPlanetClick(p.id)}
            time={clock.current}
            frozenAngles={frozenAngles}
          />
        </group>
      ))}

      <CameraRig
        scrollProgress={scrollProgress}
        activePlanetIdx={activePlanetIdx}
        frozenAngles={frozenAngles}
      />
    </>
  );
}

import { useRef, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { TextureLoader } from "three";
import * as THREE from "three";

// Import local textures
import earthTex from "../assets/planets/earth.jpg";
import venusTex from "../assets/planets/venus.jpg";
import marsTex from "../assets/planets/mars.jpg";
import jupiterTex from "../assets/planets/jupiter.jpg";
import saturnTex from "../assets/planets/saturn.jpg";
import neptuneTex from "../assets/planets/neptune.jpg";
import uranusTex from "../assets/planets/uranus.jpg";
import mercuryTex from "../assets/planets/mercury.jpg";

const TEXTURE_MAP = {
  earth: earthTex,
  venus: venusTex,
  mars: marsTex,
  jupiter: jupiterTex,
  saturn: saturnTex,
  neptune: neptuneTex,
  uranus: uranusTex,
  mercury: mercuryTex,
};

interface RotatingPlanetProps {
  textureName: keyof typeof TEXTURE_MAP;
  color: string;
  isLarge?: boolean;
}

function RotatingPlanet({ textureName, color, isLarge = false }: RotatingPlanetProps) {
  const textureUrl = TEXTURE_MAP[textureName] || earthTex;
  const tex = useLoader(TextureLoader, textureUrl);
  const planetRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.12;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y -= delta * 0.05;
    }
  });

  return (
    <group>
      {/* Sun Light specific to light up the planet */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 5, 5]} intensity={1.8} castShadow />

      {/* Main Planet Sphere */}
      <mesh ref={planetRef} castShadow receiveShadow>
        <sphereGeometry args={[isLarge ? 2.5 : 2.0, 64, 64]} />
        <meshStandardMaterial
          map={tex}
          roughness={0.7}
          metalness={0.15}
          bumpScale={0.05}
        />
      </mesh>

      {/* Atmospheric Glow Overlay */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[isLarge ? 2.58 : 2.06, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Subtle cloud or atmosphere sheen */}
      <mesh>
        <sphereGeometry args={[isLarge ? 2.52 : 2.02, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

interface Planet3DViewerProps {
  textureName: keyof typeof TEXTURE_MAP;
  color: string;
  isLarge?: boolean;
  className?: string;
  interactive?: boolean;
}

export default function Planet3DViewer({
  textureName,
  color,
  isLarge = false,
  className = "h-64 w-64",
  interactive = true,
}: Planet3DViewerProps) {
  // Safe rendering fallback if WebGL is disabled or error occurs
  const FallbackUI = () => (
    <div
      className={`relative flex items-center justify-center rounded-full overflow-hidden ${className}`}
      style={{
        background: `radial-gradient(circle at 35% 35%, ${color}dd 0%, #040816 80%)`,
        boxShadow: `0 0 40px ${color}33, inset 0 0 30px rgba(255,255,255,0.1)`,
      }}
    >
      <div
        className="absolute inset-0 opacity-20 animate-pulse"
        style={{
          background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)`,
        }}
      />
      {/* Scientific orbital rings */}
      <div
        className="absolute border border-dashed rounded-full w-[85%] h-[85%] opacity-25 animate-spin"
        style={{ borderColor: color, animationDuration: "30s" }}
      />
      <div
        className="absolute border border-dotted rounded-full w-[65%] h-[65%] opacity-40 animate-spin"
        style={{ borderColor: color, animationDuration: "15s" }}
      />
      <span className="text-[3rem] filter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] select-none">🪐</span>
    </div>
  );

  return (
    <div className={`relative ${className} select-none`}>
      <Suspense fallback={<FallbackUI />}>
        <Canvas
          camera={{ position: [0, 0, isLarge ? 5.5 : 4.5], fov: 60 }}
          style={{ background: "transparent", width: "100%", height: "100%" }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        >
          {isLarge && (
            <Stars
              radius={100}
              depth={50}
              count={250}
              factor={4}
              saturation={0.5}
              fade
              speed={1}
            />
          )}
          <RotatingPlanet textureName={textureName} color={color} isLarge={isLarge} />
          {interactive && (
            <OrbitControls
              enableZoom={isLarge}
              enablePan={false}
              minDistance={3.5}
              maxDistance={7.5}
              rotateSpeed={0.8}
            />
          )}
        </Canvas>
      </Suspense>
    </div>
  );
}

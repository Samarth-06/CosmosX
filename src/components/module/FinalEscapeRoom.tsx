import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { Clock, Shield, Coins, Sparkles, Volume2, VolumeX, Rocket, ShieldCheck, AlertTriangle } from "lucide-react";

interface Props {
  onComplete: () => void;
}

interface Question {
  id: number;
  module: number;
  question: string;
  choices: string[];
  answer: string;
}

const RESCUE_QUESTIONS: Question[] = [
  {
    id: 1,
    module: 1,
    question: "What is the primary vulnerability of a centralized database ledger?",
    choices: [
      "Single point of failure and vulnerability to tampering",
      "Slower transaction processing than peer-to-peer databases",
      "Inability to run standard SQL query parameters",
      "Excessive network memory and block header overhead"
    ],
    answer: "Single point of failure and vulnerability to tampering"
  },
  {
    id: 2,
    module: 1,
    question: "How does a centralized clearinghouse prevent the double-spending problem?",
    choices: [
      "By using proof-of-work mining systems",
      "By acting as a single source of truth to check balances",
      "By distributing database copies to all system users",
      "By applying asymmetric encryption to client accounts"
    ],
    answer: "By acting as a single source of truth to check balances"
  },
  {
    id: 3,
    module: 2,
    question: "Which key is used to digitally sign a transaction to prove authorization?",
    choices: [
      "The recipient's public key",
      "The sender's private key",
      "The network validator's public key",
      "The shared ledger master key"
    ],
    answer: "The sender's private key"
  },
  {
    id: 4,
    module: 2,
    question: "What is the primary function of a public key in transaction validation?",
    choices: [
      "To check that the sender's private signature is authentic",
      "To decrypt private metadata inside transaction fields",
      "To compute the proof-of-work target difficulty",
      "To encrypt block contents before storage"
    ],
    answer: "To check that the sender's private signature is authentic"
  },
  {
    id: 5,
    module: 3,
    question: "What cryptographic element binds a block directly to its predecessor?",
    choices: [
      "The previous block's SHA-256 hash",
      "The block index height count",
      "The miner's public wallet address",
      "The cumulative network difficulty rate"
    ],
    answer: "The previous block's SHA-256 hash"
  },
  {
    id: 6,
    module: 3,
    question: "Which data structure is used to hash all block transactions into a single root?",
    choices: [
      "Merkle Tree",
      "Red-Black Tree",
      "Binary Search Tree",
      "Fibonacci Heap"
    ],
    answer: "Merkle Tree"
  },
  {
    id: 7,
    module: 4,
    question: "What property makes it computationally infeasible to find two different inputs that map to the same hash?",
    choices: [
      "Collision resistance",
      "Pre-image resistance",
      "Avalanche effect",
      "Deterministic scaling"
    ],
    answer: "Collision resistance"
  },
  {
    id: 8,
    module: 4,
    question: "Which hashing algorithm is most widely used to secure bitcoin block headers?",
    choices: [
      "SHA-256",
      "Scrypt",
      "Ethash",
      "MD5"
    ],
    answer: "SHA-256"
  },
  {
    id: 9,
    module: 5,
    question: "In block linking, what happens if a malicious user alters a transaction in Block 2?",
    choices: [
      "All subsequent block hashes become invalid due to broken hash linkages",
      "The network automatically rolls back the entire internet router stack",
      "The block's size increases to consume infinite disk storage",
      "The malicious user receives double the mining reward"
    ],
    answer: "All subsequent block hashes become invalid due to broken hash linkages"
  },
  {
    id: 10,
    module: 5,
    question: "What is a Merkle Root?",
    choices: [
      "The single cryptographic hash that summarizes all transactions inside a block",
      "The genesis block height number",
      "The private key used to sign block headers",
      "The validator's node IP coordinate"
    ],
    answer: "The single cryptographic hash that summarizes all transactions inside a block"
  },
  {
    id: 11,
    module: 6,
    question: "Which network topology is least vulnerable to a single point of failure?",
    choices: [
      "Distributed / Peer-to-Peer network",
      "Centralized star network",
      "Decentralized multicluster hub network",
      "Standard client-server database"
    ],
    answer: "Distributed / Peer-to-Peer network"
  },
  {
    id: 12,
    module: 6,
    question: "What is the primary role of a full node in a blockchain network?",
    choices: [
      "To validate and keep a complete copy of the blockchain ledger",
      "To lease computing power for web hosting services",
      "To manage private keys for active network participants",
      "To coordinate global transaction pricing lists"
    ],
    answer: "To validate and keep a complete copy of the blockchain ledger"
  },
  {
    id: 13,
    module: 7,
    question: "In Proof of Work (PoW), what criteria must a block hash meet to be valid?",
    choices: [
      "It must be numerically less than the network target difficulty",
      "It must match the transaction signatures exactly",
      "It must contain a prime number of leading zeroes",
      "It must be generated using the validator's private key"
    ],
    answer: "It must be numerically less than the network target difficulty"
  },
  {
    id: 14,
    module: 7,
    question: "How are block validators primarily chosen in a Proof of Stake (PoS) consensus network?",
    choices: [
      "Based on the value of their locked (staked) tokens",
      "Based on their computer's raw hashing speed",
      "By alphabetical ordering of node IP addresses",
      "Through arbitrary selection by the core founders"
    ],
    answer: "Based on the value of their locked (staked) tokens"
  },
  {
    id: 15,
    module: 7,
    question: "What happens to a PoS validator who double-signs blocks or validates fraudulent transactions?",
    choices: [
      "A portion of their staked tokens is slashed",
      "Their private key is revoked by the network",
      "Their hardware is shut down remotely",
      "They are blocked from sending basic transactions"
    ],
    answer: "A portion of their staked tokens is slashed"
  },
  {
    id: 16,
    module: 8,
    question: "Which feature of public blockchains allows open transparency for auditing transactions?",
    choices: [
      "Immutable, publicly accessible ledger history",
      "Encrypted state channels for validator nodes",
      "Private transaction mempools",
      "Central database access controls"
    ],
    answer: "Immutable, publicly accessible ledger history"
  },
  {
    id: 17,
    module: 8,
    question: "How does a blockchain explorer trace the history of a digital asset?",
    choices: [
      "By querying bank account records",
      "By scanning the chain of inputs and outputs across blocks",
      "By tracing user IP addresses on network nodes",
      "By decrypting transaction private keys"
    ],
    answer: "By scanning the chain of inputs and outputs across blocks"
  },
  {
    id: 18,
    module: 2,
    question: "What is the consequence of losing your wallet's private key?",
    choices: [
      "Permanently losing access to recover or sign transactions for your funds",
      "The blockchain will email you a reset link after 24 hours",
      "Your tokens are automatically converted into cash",
      "The network issues a replacement private key matching your ID"
    ],
    answer: "Permanently losing access to recover or sign transactions for your funds"
  },
  {
    id: 19,
    module: 4,
    question: "Which of the following is an asymmetric encryption/signature algorithm, not a cryptographic hash?",
    choices: [
      "RSA-2048",
      "SHA-256",
      "Keccak-256",
      "MD5"
    ],
    answer: "RSA-2048"
  },
  {
    id: 20,
    module: 5,
    question: "What mechanisms prevent a rogue node from successfully writing fake transactions onto the block history?",
    choices: [
      "Peer nodes independently audit blocks against rules and reject invalid sets",
      "The blockchain automatically alerts internet service providers",
      "The central coordinator node encrypts the rogue node's ledger",
      "The rogue node's keyboard is locked by the gossip protocol"
    ],
    answer: "Peer nodes independently audit blocks against rules and reject invalid sets"
  }
];

export default function FinalEscapeRoom({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameActionsRef = useRef<{
    fireLaser: () => void;
    triggerCollision: () => void;
    setWarpSpeed: (active: boolean) => void;
  } | null>(null);

  // Game/Quiz UI States
  const [gameState, setGameState] = useState<"START" | "COUNTDOWN" | "PLAYING" | "WARP" | "GAMEOVER" | "SUCCESS">("START");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10); // 10 seconds per question
  const [score, setScore] = useState(0);
  const [shield, setShield] = useState(100);
  const [correctCount, setCorrectCount] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [warpCountdown, setWarpCountdown] = useState(4);
  const [preLaunchCount, setPreLaunchCount] = useState(3);
  const [scanning, setScanning] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | "timeout" | null>(null);

  // Web Audio Context Synthesizer for Spaceship Ambience and SFX
  const audioCtxRef = useRef<AudioContext | null>(null);
  const humNodeRef = useRef<OscillatorNode | null>(null);

  useEffect(() => {
    if (!audioEnabled || (gameState !== "PLAYING" && gameState !== "WARP")) {
      stopEngineHum();
      return;
    }
    startEngineHum();
    return () => stopEngineHum();
  }, [gameState, audioEnabled]);

  const startEngineHum = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // Low cabin hum oscillator
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(55, ctx.currentTime); // low 55Hz pitch

      // High shelf lowpass filter to remove buzz, leaving smooth hum
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(90, ctx.currentTime);

      gain.gain.setValueAtTime(0.015, ctx.currentTime); // subtle cabin background level

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      humNodeRef.current = osc;
    } catch (e) {
      console.warn("AudioContext initialization failed: ", e);
    }
  };

  const stopEngineHum = () => {
    if (humNodeRef.current) {
      try {
        humNodeRef.current.stop();
      } catch (e) {}
      humNodeRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (e) {}
      audioCtxRef.current = null;
    }
  };

  const playSynth = (type: "laser" | "crash" | "explosion" | "warp" | "tension" | "success" | "chime") => {
    if (!audioEnabled) return;
    try {
      const ctx = audioCtxRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (type === "laser") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      } else if (type === "crash") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(130, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(30, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else if (type === "explosion") {
        // High quality white noise burst for explosion
        const bufferSize = ctx.sampleRate * 0.4; // 0.4 seconds
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1000, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.4);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
      } else if (type === "warp") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(80, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 4.0);
        gain.gain.setValueAtTime(0.005, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 2.0);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4.0);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 4.0);
      } else if (type === "tension") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(350, ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === "success") {
        // Achievement triple-chime
        [0, 0.12, 0.24].forEach((delay, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(440 + idx * 110, ctx.currentTime + delay);
          gain.gain.setValueAtTime(0.08, ctx.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + delay);
          osc.stop(ctx.currentTime + delay + 0.25);
        });
      }
    } catch (e) {
      console.warn("Synth failed: ", e);
    }
  };

  // Timer loop for active question
  useEffect(() => {
    if (gameState !== "PLAYING" || selectedOption !== null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 5 && prev > 1) {
          playToneForTension();
        }
        if (prev <= 1) {
          handleTimeout();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, currentIdx, selectedOption]);

  const playToneForTension = () => {
    playSynth("tension");
  };

  // Countdown loop
  useEffect(() => {
    if (gameState !== "COUNTDOWN") return;
    
    if (preLaunchCount === 3) {
       playSynth("warp");
    }

    if (preLaunchCount <= 0) {
      setGameState("PLAYING");
      return;
    }

    const timer = setTimeout(() => {
      setPreLaunchCount(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [gameState, preLaunchCount]);

  const handleTimeout = () => {
    setFeedback("timeout");
    setSelectedOption("");
    setShield((s) => Math.max(0, s - 20));
    playSynth("crash");
    gameActionsRef.current?.triggerCollision();

    setTimeout(() => {
      advanceQuestion();
    }, 2000);
  };

  // Answer selection callback
  const handleAnswerSelect = (option: string) => {
    setSelectedOption(option);
    const correct = RESCUE_QUESTIONS[currentIdx].answer;

    if (option === correct) {
      setFeedback("correct");
      setScore((s) => s + 150 + timeLeft * 10);
      setCorrectCount((c) => c + 1);
      playSynth("laser");
      gameActionsRef.current?.fireLaser();
    } else {
      setFeedback("incorrect");
      setShield((s) => Math.max(0, s - 20));
      playSynth("crash");
      gameActionsRef.current?.triggerCollision();
    }

    // Auto-advance after 1.8 seconds (to allow dramatic collision/shooting display)
    setTimeout(() => {
      advanceQuestion();
    }, 1800);
  };

  const advanceQuestion = () => {
    setFeedback(null);
    if (currentIdx < RESCUE_QUESTIONS.length - 1) {
      setScanning(true);
      setTimeout(() => {
        setScanning(false);
        setCurrentIdx((i) => i + 1);
        setTimeLeft(10);
        setSelectedOption(null);
      }, 550); // scanning telemetry buffer
    } else {
      evaluateGameOutcome();
    }
  };

  const evaluateGameOutcome = () => {
    if (shield > 0 && correctCount >= 12) {
      setGameState("SUCCESS");
      playSynth("success");
    } else {
      setGameState("GAMEOVER");
    }
  };

  const handleStartGame = () => {
    setCurrentIdx(0);
    setTimeLeft(10);
    setScore(0);
    setShield(100);
    setCorrectCount(0);
    setSelectedOption(null);
    setPreLaunchCount(3);
    setGameState("COUNTDOWN");
  };

  const triggerLaunchWarp = () => {
    setGameState("WARP");
    playSynth("warp");
    gameActionsRef.current?.setWarpSpeed(true);

    const interval = setInterval(() => {
      setWarpCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 1200);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // --- THREE.JS GAME INSTANTIATION AND ANIMATION LOOP ---
  useEffect(() => {
    if (gameState !== "PLAYING" && gameState !== "WARP") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Standard Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x04040a, 0.012);

    const camera = new THREE.PerspectiveCamera(62, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(0, 2.5, 11);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.setClearColor(0x04040a, 1);

    // Dynamic lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x22d3ee, 5.0); // glowing cyber light
    dirLight.position.set(6, 12, 10);
    scene.add(dirLight);

    // Muzzle flash light source (intensity will spike to 10 on shooting)
    const muzzleLight = new THREE.PointLight(0x22d3ee, 0, 15);
    scene.add(muzzleLight);

    // Spaceship design group
    const shipGroup = new THREE.Group();
    scene.add(shipGroup);

    // Fuselage cylinder
    const fuselageGeom = new THREE.CylinderGeometry(0.02, 0.42, 2.6, 12);
    fuselageGeom.rotateX(Math.PI / 2);
    const fuselageMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // silver metallic
      roughness: 0.1,
      metalness: 0.98,
    });
    const fuselage = new THREE.Mesh(fuselageGeom, fuselageMat);
    shipGroup.add(fuselage);

    // Wing panels
    const wingGeom = new THREE.BoxGeometry(2.0, 0.05, 0.9);
    wingGeom.translate(0, -0.05, 0.3);
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.2
    });
    const wingL = new THREE.Mesh(wingGeom, wingMat);
    wingL.position.x = -1.1;
    wingL.rotation.y = 0.1;
    shipGroup.add(wingL);

    const wingR = wingL.clone();
    wingR.position.x = 1.1;
    wingR.rotation.y = -0.1;
    shipGroup.add(wingR);

    // Engine exhaust exhaust nozzle
    const exhaustGeom = new THREE.ConeGeometry(0.18, 1.1, 8);
    exhaustGeom.rotateX(-Math.PI / 2);
    exhaustGeom.translate(0, 0, 1.8);
    const exhaustMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xf97316,
      emissiveIntensity: 5.0,
      transparent: true,
      opacity: 0.95
    });
    const exhaust = new THREE.Mesh(exhaustGeom, exhaustMat);
    shipGroup.add(exhaust);

    shipGroup.position.set(0, -0.6, 0);

    // Emitters array
    const activeLasers: THREE.Mesh[] = [];
    const particles: any[] = [];
    const shockwaves: { mesh: THREE.Mesh; scaleSpeed: number; opacitySpeed: number; life: number }[] = [];

    // Realistic volcanic lava rock design
    const asteroidGroup = new THREE.Group();
    scene.add(asteroidGroup);

    const asteroidGeom = new THREE.DodecahedronGeometry(1.65, 1);
    const posAttr = asteroidGeom.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);
      const vz = posAttr.getZ(i);
      const deform = 0.82 + Math.random() * 0.35;
      posAttr.setXYZ(i, vx * deform, vy * deform, vz * deform);
    }
    asteroidGeom.computeVertexNormals();

    const asteroidMat = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      roughness: 0.95,
      metalness: 0.05,
      flatShading: true,
      emissive: 0x450a0a,
      emissiveIntensity: 1.5,
    });
    const asteroid = new THREE.Mesh(asteroidGeom, asteroidMat);
    asteroidGroup.add(asteroid);

    // Volcanic lava neon mesh wires
    const lavaEdges = new THREE.EdgesGeometry(asteroidGeom);
    const lavaWire = new THREE.LineSegments(lavaEdges, new THREE.LineBasicMaterial({ color: 0xff4500, linewidth: 1.5 }));
    asteroidGroup.add(lavaWire);

    asteroidGroup.position.set(0, -0.5, -38);

    // Parallax Starfields
    const starsGroup = new THREE.Group();
    scene.add(starsGroup);

    const starCount = 280;
    const starLines: { line: THREE.Line; speed: number; length: number; ox: number; oy: number; oz: number }[] = [];
    const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 });

    for (let i = 0; i < starCount; i++) {
      const ox = (Math.random() - 0.5) * 55;
      const oy = (Math.random() - 0.5) * 40;
      const oz = Math.random() * -240;
      
      const geom = new THREE.BufferGeometry();
      const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 1.4)];
      geom.setFromPoints(points);

      const line = new THREE.Line(geom, lineMat);
      line.position.set(ox, oy, oz);
      starsGroup.add(line);

      starLines.push({
        line,
        speed: Math.random() * 0.8 + 1.2,
        length: 1.4,
        ox,
        oy,
        oz,
      });
    }

    // Interactive action listeners mapping
    let shakeIntensity = 0;
    let warpActive = gameState === "WARP";
    let activeFlameIntensity = 1.0;
    let damageFireDuration = 0;

    const createShockwave = (pos: THREE.Vector3) => {
      const geom = new THREE.RingGeometry(0.1, 1.8, 16);
      const mat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(pos);
      mesh.rotation.x = Math.PI / 2; // flat horizontal expand
      scene.add(mesh);

      shockwaves.push({
        mesh,
        scaleSpeed: 0.22,
        opacitySpeed: 0.04,
        life: 25
      });
    };

    const createCollisionBurst = (pos: THREE.Vector3, colorHex: number, count = 25) => {
      const geom = new THREE.SphereGeometry(0.12, 5, 5);
      const mat = new THREE.MeshBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.95,
      });

      for (let i = 0; i < count; i++) {
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.copy(pos);
        scene.add(mesh);

        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const speed = Math.random() * 0.35 + 0.15;

        particles.push({
          mesh,
          vx: Math.sin(phi) * Math.cos(theta) * speed,
          vy: Math.sin(phi) * Math.sin(theta) * speed,
          vz: Math.cos(phi) * speed,
          life: 30,
          maxLife: 30,
        });
      }
    };

    gameActionsRef.current = {
      fireLaser: () => {
        // Gun wingtip lasers
        const laserMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
        const laserGeom = new THREE.CylinderGeometry(0.04, 0.04, 2.5, 6);
        laserGeom.rotateX(Math.PI / 2);

        const laserL = new THREE.Mesh(laserGeom, laserMat);
        laserL.position.set(-1.1, -0.6, 0.5);
        scene.add(laserL);

        const laserR = laserL.clone();
        laserR.position.x = 1.1;
        scene.add(laserR);

        activeLasers.push(laserL, laserR);

        // Recoil effect
        shipGroup.position.z += 0.45;
        muzzleLight.intensity = 8.0;

        // Explode target
        setTimeout(() => {
          playSynth("explosion");
          createExplosion(asteroidGroup.position);
          createShockwave(asteroidGroup.position);

          // scale down to represent hit breakdown
          asteroidGroup.scale.set(0.01, 0.01, 0.01);
          
          setTimeout(() => {
            // Respawn asteroid in distance
            asteroidGroup.position.set((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 4 - 0.5, -38);
            asteroidGroup.scale.set(1, 1, 1);
          }, 800);
        }, 320);
      },
      triggerCollision: () => {
        // Bring asteroid close for collision visual
        asteroidGroup.position.set(0, -0.5, -4);
        setTimeout(() => {
          shakeIntensity = 0.55;
          createCollisionBurst(shipGroup.position, 0xff4500, 30);
          shipGroup.rotation.x = -0.35; // recoil back pitch
          asteroidGroup.position.set(0, -0.5, -38);
          damageFireDuration = 3.5; // catch fire
        }, 120);
      },
      setWarpSpeed: (active: boolean) => {
        warpActive = active;
      },
    };

    const createExplosion = (pos: THREE.Vector3) => {
      createCollisionBurst(pos, 0x22d3ee, 30);
    };

    const handleResize = () => {
      if (!canvas) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    // Animation Render Loop
    let animId = 0;
    const clock = new THREE.Clock();

    const renderLoop = () => {
      const elapsed = clock.getElapsedTime();
      const delta = clock.getDelta();

      // Spaceship floating motion with velocity-aware tilt
      if (!warpActive) {
        const lastX = shipGroup.position.x;
        shipGroup.position.y = -0.6 + Math.sin(elapsed * 2.4) * 0.14;
        shipGroup.position.x = Math.sin(elapsed * 1.1) * 1.1; // slow side-to-side sweeping
        
        const dx = shipGroup.position.x - lastX;
        shipGroup.rotation.z = -dx * 3.5; // banking/rolling rotation
        shipGroup.rotation.y = -dx * 1.5; // yaw rotation

        // Recoil slide recovery
        shipGroup.position.z += (0 - shipGroup.position.z) * 0.15;
        
        // Muzzle flash fade
        muzzleLight.intensity += (0 - muzzleLight.intensity) * 0.12;

        exhaust.scale.set(1, 1 + Math.sin(elapsed * 20) * 0.18, 1);
        asteroidGroup.rotation.y += 0.015;
        asteroidGroup.rotation.z += 0.005;

        // Damage smoke loop
        if (damageFireDuration > 0) {
          damageFireDuration -= 0.016;
          if (Math.random() < 0.42) {
            const fireGeom = new THREE.SphereGeometry(Math.random() * 0.15 + 0.06, 5, 5);
            const fireMat = new THREE.MeshBasicMaterial({
              color: Math.random() > 0.4 ? 0xff4500 : 0xffaa00,
              transparent: true,
              opacity: 0.85
            });
            const fireMesh = new THREE.Mesh(fireGeom, fireMat);
            fireMesh.position.copy(shipGroup.position);
            fireMesh.position.x += (Math.random() - 0.5) * 0.35;
            fireMesh.position.y += (Math.random() - 0.5) * 0.15 + 0.25;
            fireMesh.position.z += 0.2 + Math.random() * 0.5;
            scene.add(fireMesh);

            particles.push({
              mesh: fireMesh,
              vx: (Math.random() - 0.5) * 0.05,
              vy: Math.random() * 0.08 + 0.05,
              vz: Math.random() * 0.12 + 0.18,
              life: 25,
              maxLife: 25
            });
          }
        }
      } else {
        // Warp travel
        shipGroup.position.set(0, -0.6, 0);
        shipGroup.rotation.set(0, 0, 0);
        shipGroup.scale.addScalar(-0.0035);
        exhaust.scale.set(1.4, 4.8, 1.4);
        exhaustMat.color.setHex(0x22d3ee);
        exhaustMat.emissive.setHex(0x06b6d4);
      }

      // Update stardust line segments Z values (multi-layered parallax)
      starLines.forEach((s) => {
        const starSpeed = warpActive ? 35 : s.speed;
        const starLen = warpActive ? 45 : s.length;
        s.line.position.z += starSpeed;
        s.line.scale.z = starLen;

        if (s.line.position.z > 25) {
          s.line.position.z = -250;
          s.line.position.x = (Math.random() - 0.5) * 55;
          s.line.position.y = (Math.random() - 0.5) * 40;
        }
      });

      // Fly lasers forward
      for (let i = activeLasers.length - 1; i >= 0; i--) {
        const l = activeLasers[i];
        l.position.z -= 2.6;
        if (l.position.z < -65) {
          scene.remove(l);
          activeLasers.splice(i, 1);
        }
      }

      // Move particles
      for (let p = particles.length - 1; p >= 0; p--) {
        const part = particles[p];
        part.mesh.position.x += part.vx;
        part.mesh.position.y += part.vy;
        part.mesh.position.z += part.vz;
        part.life--;

        const ratio = part.life / part.maxLife;
        part.mesh.scale.set(ratio, ratio, ratio);

        if (part.life <= 0) {
          scene.remove(part.mesh);
          part.mesh.geometry.dispose();
          part.mesh.material.dispose();
          particles.splice(p, 1);
        }
      }

      // Expand shockwaves
      for (let s = shockwaves.length - 1; s >= 0; s--) {
        const sw = shockwaves[s];
        sw.mesh.scale.addScalar(sw.scaleSpeed);
        (sw.mesh.material as THREE.MeshBasicMaterial).opacity -= sw.opacitySpeed;
        sw.life--;

        if (sw.life <= 0) {
          scene.remove(sw.mesh);
          sw.mesh.geometry.dispose();
          (sw.mesh.material as THREE.MeshBasicMaterial).dispose();
          shockwaves.splice(s, 1);
        }
      }

      // Camera shake
      if (shakeIntensity > 0) {
        camera.position.x = (Math.random() - 0.5) * shakeIntensity;
        camera.position.y = 2.5 + (Math.random() - 0.5) * shakeIntensity;
        shakeIntensity *= 0.88;
        if (shakeIntensity < 0.02) shakeIntensity = 0;
      } else {
        camera.position.set(0, 2.5, 11);
      }
      camera.lookAt(0, 0, -22);

      renderer.render(scene, camera);
      animId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
      scene.traverse((obj) => {
        if ((obj as any).geometry) (obj as any).geometry.dispose();
        if ((obj as any).material) {
          if (Array.isArray((obj as any).material)) {
            (obj as any).material.forEach((m: any) => m.dispose());
          } else {
            (obj as any).material.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, [gameState]);

  const currentQuestion = RESCUE_QUESTIONS[currentIdx];

  return (
    <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-4 lg:p-5 backdrop-blur-md shadow-2xl flex flex-col justify-between h-full min-h-0 flex-1 overflow-hidden select-none relative z-10">
      
      {/* HUD HEADER PANEL */}
      <div className="w-full flex items-center justify-between mb-3.5 bg-slate-950/60 border border-white/5 px-4 py-2.5 rounded-xl backdrop-blur-md shrink-0 font-mono text-[9px] text-slate-400">
        <div className="flex gap-4">
          <div>
            <span className="block opacity-60">RESCUE SCORE</span>
            <span className="text-[11px] font-bold text-white flex items-center gap-1 mt-0.5">
              <Coins className="w-3.5 h-3.5 text-amber-400" /> {score.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="block opacity-60">Consensus sealed</span>
            <span className="text-[11px] font-bold text-emerald-400 mt-0.5">{correctCount} / 20</span>
          </div>
        </div>

        {gameState === "PLAYING" && (
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="opacity-60">SHIELD HULL STATUS</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-white/10">
                  <div
                    style={{ width: `${shield}%` }}
                    className={`h-full transition-all duration-300 ${shield > 40 ? "bg-cyan-400" : "bg-red-500"}`}
                  />
                </div>
                <span className="text-[10px] text-white font-bold">{shield}%</span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setAudioEnabled(!audioEnabled)}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
            audioEnabled
              ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.15)]"
              : "bg-slate-900/60 border-white/5 text-slate-500"
          }`}
          title="Toggle Synthesizer Feedback"
        >
          {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* TWO-COLUMN LAYOUT (FLUID HEIGHT, FIT ON SCREEN) */}
      <div className="flex-1 min-h-0 flex flex-row gap-4">
        
        {/* Left Column: Game Viewport (Expanded from 45% to 68%) */}
        <div className="w-[68%] h-full bg-[#020207] border border-white/10 rounded-2xl overflow-hidden relative flex items-center justify-center shrink-0">
          
          {/* WebGL Canvas */}
          {(gameState === "PLAYING" || gameState === "WARP") && (
            <canvas ref={canvasRef} className="w-full h-full block" />
          )}

          {/* Correct / Incorrect HUD floating notices */}
          {gameState === "PLAYING" && selectedOption !== null && (
            <div className="absolute top-4 left-4 z-20 font-mono text-[10px] bg-slate-950/80 px-3 py-1.5 rounded border pointer-events-none uppercase tracking-wider">
              {feedback === "correct" && (
                <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                  ✓ DIRECT IMPACT (+150 XP)
                </span>
              )}
              {feedback === "incorrect" && (
                <span className="text-red-500 font-extrabold flex items-center gap-1">
                  🚨 COLLISION SHIELD COMPROMISED (-20% HULL)
                </span>
              )}
            </div>
          )}

          {/* 1. START OVERLAY */}
          {gameState === "START" && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-5 text-center space-y-4">
              <div className="w-10 h-10 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse">
                <Sparkles className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-[11.5px] font-bold tracking-widest text-white uppercase font-rushblade">
                  MERCURY RESCUE TRANSIT
                </h2>
                <p className="text-[9px] text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed font-mono">
                  Pilot the V-2 escape rocket through the volcanic space debris grid.
                </p>
              </div>
              <button
                onClick={handleStartGame}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold font-mono text-[9px] tracking-wider rounded-lg transition shadow-[0_0_15px_rgba(220,38,38,0.3)] cursor-pointer"
              >
                START ENGINES
              </button>
            </div>
          )}

          {/* 1.5 COUNTDOWN OVERLAY */}
          {gameState === "COUNTDOWN" && (
            <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center p-5 text-center space-y-4 z-20">
              <motion.div
                key={preLaunchCount}
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="text-7xl font-rushblade font-bold text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)] uppercase"
              >
                {preLaunchCount > 0 ? preLaunchCount : "LAUNCH"}
              </motion.div>
            </div>
          )}

          {/* 2. WARP SPEED TAKEOFF OVERLAY */}
          {gameState === "WARP" && (
            <div className="absolute inset-0 bg-cyan-950/20 backdrop-blur-[1px] flex flex-col items-center justify-center p-5 text-center space-y-3">
              <h1 className="font-rushblade text-base font-black text-cyan-300 tracking-widest uppercase animate-pulse">
                WARPING TO VENUS...
              </h1>
              <p className="font-mono text-[8px] text-cyan-400 font-bold uppercase tracking-widest animate-ping">
                SPEED: 48,000 KM/S
              </p>
            </div>
          )}

          {/* 3. SUCCESS / COMPLETE OVERLAY */}
          {gameState === "SUCCESS" && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-5 text-center space-y-4">
              <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-bounce text-sm text-emerald-400">
                🚀
              </div>
              <div>
                <h2 className="text-[11.5px] font-bold tracking-widest text-emerald-400 uppercase font-rushblade">
                  MERCURY MISSION ✓ MASTERED
                </h2>
                <p className="text-[8.5px] text-slate-400 mt-1 max-w-xs mx-auto font-mono">
                  All sectors verify consensus locks. V-2 rocket ready for launch takeoff!
                </p>
              </div>
              <button
                onClick={triggerLaunchWarp}
                className="px-5 py-2 bg-linear-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold font-mono text-[9px] tracking-wider rounded-lg transition shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer flex items-center gap-1.5 animate-pulse"
              >
                <Rocket className="w-3.5 h-3.5 -rotate-45" /> WARP SPEED TO VENUS ➔
              </button>
            </div>
          )}

          {/* 4. HULL COLLAPSED GAME OVER OVERLAY */}
          {gameState === "GAMEOVER" && (
            <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-5 text-center space-y-4">
              <div className="w-10 h-10 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.25)] animate-bounce text-sm">
                💥
              </div>
              <div>
                <h2 className="text-[11px] font-bold tracking-widest text-red-500 uppercase font-rushblade">
                  HULL COLLAPSE
                </h2>
                <p className="text-[8.5px] text-slate-400 mt-1 max-w-xs mx-auto font-mono">
                  Space debris has vaporized your spacecraft. Core links lost.
                </p>
              </div>
              <button
                onClick={handleStartGame}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold font-mono text-[9px] tracking-wider rounded-lg transition shadow-[0_0_15px_rgba(239,68,68,0.3)] cursor-pointer"
              >
                RETRY FLIGHT
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Question Content / Stats Panel (32% width) */}
        <div className="w-[32%] flex flex-col justify-between min-h-0 pl-2">
          
          {/* Display instructions/rules when not actively answering */}
          {gameState !== "PLAYING" ? (
            <div className="h-full flex flex-col justify-center space-y-4 p-2 text-slate-300">
              <div className="border-l-2 border-red-500 pl-3">
                <span className="font-mono text-[9px] text-red-400 font-bold uppercase tracking-widest">
                  MISSION TELEMETRY SYSTEM
                </span>
                <h3 className="font-rushblade text-white text-xs lg:text-sm tracking-wider uppercase mt-0.5">
                  GOSSIP NETWORK INITIALIZER
                </h3>
              </div>
              <div className="text-[10.5px] font-mono leading-relaxed space-y-2.5 opacity-90">
                <p>
                  To secure launch clearances for your assembled spacecraft, you must solve a sequential grid of **20 questions** covering the Mercury curriculum modules.
                </p>
                <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3 space-y-1 text-slate-400 text-[10px]">
                  <div className="flex gap-2"><span>⚡</span><span>Select choices before the **10-second timer** expires.</span></div>
                  <div className="flex gap-2"><span>⚡</span><span>**Correct Answers** activate laser cannons to disintegrate debris.</span></div>
                  <div className="flex gap-2"><span>⚡</span><span>**Incorrect/Timeouts** trigger high-impact collision damage.</span></div>
                  <div className="flex gap-2"><span>⚡</span><span>At least **12 correct answers** are required to successfully launch.</span></div>
                </div>
              </div>
            </div>
          ) : (
            currentQuestion && (
              <div className="h-full flex flex-col justify-between min-h-0">
                
                {/* Active Question Title & Time */}
                <div className="border-l-2 border-red-500 pl-3.5 select-text mb-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[8.5px] text-red-400 font-bold uppercase tracking-widest">
                      CHALLENGE {currentIdx + 1} / 20 · MODULE 0{currentQuestion.module}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-white bg-slate-950/70 border border-white/10 px-2 py-0.5 rounded-full select-none">
                      <Clock className="w-3 h-3 text-red-400 animate-pulse" />
                      <span className={timeLeft <= 3 ? "text-red-500 animate-pulse font-extrabold" : "text-slate-200"}>
                        {timeLeft}s
                      </span>
                    </div>
                  </div>

                  {/* Scanning Database Loader Overlay */}
                  <AnimatePresence mode="wait">
                    {scanning ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-6 font-mono text-[9px] text-sky-400 uppercase tracking-widest animate-pulse"
                      >
                        ⚡ Scanning knowledge database...
                      </motion.div>
                    ) : (
                      <motion.h3
                        initial={{ opacity: 0, x: 5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="font-sans text-[11.5px] lg:text-[12px] font-bold text-slate-100 mt-2 select-text leading-snug"
                      >
                        {currentQuestion.question}
                      </motion.h3>
                    )}
                  </AnimatePresence>
                </div>

                {/* MCQ Selection Choices */}
                <div className="flex-1 min-h-0 flex flex-col justify-center gap-2">
                  {currentQuestion.choices.map((choice, i) => {
                    const isSelected = selectedOption === choice;
                    const isCorrect = choice === currentQuestion.answer;
                    const hasAnswered = selectedOption !== null;

                    let btnStyle = "bg-slate-950/60 hover:bg-slate-950/90 border-white/10 text-slate-300 hover:text-white";
                    let prefix = "";
                    if (hasAnswered) {
                      if (isCorrect) {
                        btnStyle = "bg-emerald-950/40 border-emerald-500 text-emerald-400 font-bold shadow-[0_0_10px_rgba(16,185,129,0.15)]";
                        prefix = "✓ KNOWLEDGE VERIFIED: ";
                      } else if (isSelected) {
                        btnStyle = "bg-red-950/40 border-red-500 text-red-400 font-bold shadow-[0_0_10px_rgba(239,68,68,0.15)]";
                        prefix = "✕ VALIDATION FAILED: ";
                      } else {
                        btnStyle = "bg-slate-950/30 border-white/5 text-slate-500 opacity-60";
                      }
                    }

                    return (
                      <button
                        key={i}
                        disabled={hasAnswered}
                        onClick={() => handleAnswerSelect(choice)}
                        className={`w-full text-left border p-2.5 rounded-xl text-[9.5px] font-sans transition flex items-center justify-between cursor-pointer ${btnStyle}`}
                      >
                        <span>{prefix}{choice}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Response Timer Progress Bar */}
                <div className="space-y-1 mt-2 select-none">
                  <div className="flex justify-between font-mono text-[8px] text-slate-500">
                    <span>MISSION RESPONSE TIMER</span>
                    <span className={timeLeft <= 3 ? "text-red-400 animate-pulse font-extrabold" : ""}>
                      {timeLeft <= 3 ? "⚠ SIGNAL LOSS IMMINENT" : timeLeft <= 6 ? "⚠ RESPONSE WINDOW CLOSING" : "TIME OK"}
                    </span>
                  </div>
                  <div className="h-1 bg-slate-900 border border-white/5 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${timeLeft * 10}%` }}
                      className={`h-full transition-all duration-1000 ${
                        timeLeft <= 3 ? "bg-red-500 shadow-[0_0_4px_#ef4444]" : timeLeft <= 6 ? "bg-amber-500" : "bg-cyan-400"
                      }`}
                    />
                  </div>
                </div>

                {/* Timeout Indicator Overlay Overlay */}
                {feedback === "timeout" && (
                  <div className="mt-2 p-2 rounded-lg bg-red-950/40 border border-red-500/20 text-red-400 font-mono text-[9px] text-center flex items-center justify-center gap-1.5 uppercase animate-pulse">
                    💀 too late, cadet! mission response window closed
                  </div>
                )}

                <div className="border-t border-white/5 pt-2.5 mt-3 flex justify-between font-mono text-[8px] text-slate-500">
                  <span>SECURE SYSTEM TRANSMISSION ACTIVE</span>
                  <span>WARNING: DEBRIS DENSITIES INCREASING</span>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

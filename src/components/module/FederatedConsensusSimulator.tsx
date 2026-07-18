import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network, ShieldCheck, HelpCircle, Info, RefreshCw, Send } from "lucide-react";

interface Props {
  color: string;
}

interface NodeDef {
  id: number;
  name: string;
  trusts: number[]; // Slice
  x: number;
  y: number;
  role: string;
}

const NODES: NodeDef[] = [
  { id: 1, name: "Node 1 (Alpha Gateway)", trusts: [2, 3], x: 25, y: 30, role: "Stellar Core Validator" },
  { id: 2, name: "Node 2 (Beta Payments)", trusts: [1, 3], x: 25, y: 70, role: "Stellar Core Validator" },
  { id: 3, name: "Node 3 (Gamma Exchange)", trusts: [1, 2, 4], x: 50, y: 50, role: "Core Hub Node" },
  { id: 4, name: "Node 4 (Delta Storage)", trusts: [3, 5], x: 75, y: 35, role: "Edge Validator" },
  { id: 5, name: "Node 5 (Epsilon Receiver)", trusts: [4], x: 75, y: 65, role: "Edge Validator" },
];

export default function FederatedConsensusSimulator({ color }: Props) {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [selectedNode, setSelectedNode] = useState<number | null>(1);
  const [consensusState, setConsensusState] = useState<Record<number, "idle" | "voting" | "accepted" | "confirmed">>({
    1: "idle", 2: "idle", 3: "idle", 4: "idle", 5: "idle"
  });
  const [simStep, setSimStep] = useState<"idle" | "initiate" | "quorum1" | "propagate" | "complete">("idle");
  const [infoMsg, setInfoMsg] = useState("Hover over nodes to inspect their Quorum Slices (trust dependencies).");

  const runSimulation = () => {
    if (simStep !== "idle") return;
    
    // Step 1: Initiate transaction on Node 1
    setSimStep("initiate");
    setConsensusState({ 1: "voting", 2: "idle", 3: "idle", 4: "idle", 5: "idle" });
    setInfoMsg("Tx broadcasted to Node 1. Node 1 proposes state change and requests confirmation from its Quorum Slice {Node 2, Node 3}...");

    // Step 2: Quorum Slice 1 & 2 & 3 agreement (Core Quorum)
    setTimeout(() => {
      setSimStep("quorum1");
      setConsensusState({ 1: "accepted", 2: "voting", 3: "voting", 4: "idle", 5: "idle" });
      setInfoMsg("Node 2 and Node 3 receive Node 1's proposal. Since their trust requirements are met, they vote to accept...");

      setTimeout(() => {
        setConsensusState({ 1: "confirmed", 2: "confirmed", 3: "confirmed", 4: "voting", 5: "idle" });
        setInfoMsg("Quorum Overlap Met! Nodes 1, 2, and 3 reach global consensus. Propagation wave travels outward...");
        
        // Step 3: Propagate to Edge Node 4
        setTimeout(() => {
          setSimStep("propagate");
          setConsensusState({ 1: "confirmed", 2: "confirmed", 3: "confirmed", 4: "confirmed", 5: "voting" });
          setInfoMsg("Node 4 confirms transaction ledger state since its trust dependencies include verified Node 3...");

          // Step 4: Final receiver confirmation on Node 5
          setTimeout(() => {
            setSimStep("complete");
            setConsensusState({ 1: "confirmed", 2: "confirmed", 3: "confirmed", 4: "confirmed", 5: "confirmed" });
            setInfoMsg("✓ Consensus complete! All 5 nodes have verified and updated their ledgers in lockstep.");
          }, 1500);
        }, 1500);
      }, 1800);
    }, 1800);
  };

  const resetSim = () => {
    setConsensusState({ 1: "idle", 2: "idle", 3: "idle", 4: "idle", 5: "idle" });
    setSimStep("idle");
    setInfoMsg("Hover over nodes to inspect their Quorum Slices (trust dependencies).");
  };

  return (
    <div className="flex flex-col h-full bg-[#040816]/60 rounded-2xl border border-white/10 overflow-hidden text-slate-100 p-4 font-sans select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3 shrink-0">
        <div>
          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">Federated Byzantine Agreement</span>
          <h3 className="text-xs font-bold font-mono uppercase tracking-wide text-white">Stellar SCP Trust Slices</h3>
        </div>

        <button onClick={resetSim} className="text-[9.5px] font-mono text-slate-400 hover:text-white uppercase flex items-center gap-1 cursor-pointer">
          <RefreshCw className="w-3 h-3" /> Reset
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin space-y-4">
        <div className="grid grid-cols-12 gap-3">
          
          {/* Node graph area */}
          <div className="col-span-8 bg-slate-950/40 border border-white/5 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden min-h-[250px]">
            
            {/* SVG Link lines between nodes */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255,255,255,0.15)" />
                </marker>
                <marker id="arrow-glow" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
                </marker>
              </defs>

              {/* Draw trust arrows */}
              {NODES.map((node) => {
                return node.trusts.map((targetId) => {
                  const targetNode = NODES.find(n => n.id === targetId);
                  if (!targetNode) return null;
                  
                  // Calculate absolute svg coordinates based on width/height percentages
                  const x1 = `${node.x}%`;
                  const y1 = `${node.y}%`;
                  const x2 = `${targetNode.x}%`;
                  const y2 = `${targetNode.y}%`;

                  const isHoverDependent = hoveredNode === node.id;
                  const isSimFlowActive = simStep !== "idle" && consensusState[node.id] !== "idle";

                  return (
                    <line
                      key={`${node.id}-${targetId}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={isHoverDependent ? color : isSimFlowActive ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.08)"}
                      strokeWidth={isHoverDependent ? "2" : "1.2"}
                      markerEnd={isHoverDependent ? "url(#arrow-glow)" : "url(#arrow)"}
                      className="transition-all duration-300"
                    />
                  );
                });
              })}
            </svg>

            {/* Network Nodes */}
            <div className="absolute inset-0 z-10 pointer-events-auto">
              {NODES.map((node) => {
                const isSelected = selectedNode === node.id;
                const isHovered = hoveredNode === node.id;
                const state = consensusState[node.id];
                
                // Color mapping for state nodes
                let nodeStatusColor = "border-white/10 text-white";
                let badge = "";
                if (state === "voting") {
                  nodeStatusColor = "border-amber-400/80 text-amber-400 bg-amber-950/20";
                  badge = "VOTING";
                } else if (state === "accepted") {
                  nodeStatusColor = "border-cyan-400/80 text-cyan-400 bg-cyan-950/20";
                  badge = "ACCEPTED";
                } else if (state === "confirmed") {
                  nodeStatusColor = "border-emerald-400/80 text-emerald-400 bg-emerald-950/20";
                  badge = "CONFIRMED";
                }

                return (
                  <button
                    key={node.id}
                    onMouseEnter={() => {
                      setHoveredNode(node.id);
                    }}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => setSelectedNode(node.id)}
                    style={{
                      left: `${node.x}%`,
                      top: `${node.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                    className={`absolute p-2.5 rounded-xl border flex flex-col items-center justify-center font-mono transition-all duration-200 cursor-pointer min-w-[70px] ${
                      isSelected ? "ring-2 ring-indigo-400 bg-slate-900" : "bg-slate-950/90"
                    } ${nodeStatusColor}`}
                  >
                    <Network className="w-3.5 h-3.5 mb-1" />
                    <span className="text-[8.5px] font-bold tracking-tight">N-{node.id}</span>
                    {badge && (
                      <span className="text-[6.5px] font-extrabold px-1 rounded bg-black/40 mt-1 uppercase animate-pulse">
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-auto z-20">
              {/* Informational bubble message */}
              <div className="bg-slate-950/80 border border-white/5 rounded-xl p-3 text-[10px] font-mono leading-relaxed text-indigo-300">
                {infoMsg}
              </div>
            </div>

          </div>

          {/* Node inspect detail sidebar */}
          <div className="col-span-4 bg-slate-950/60 border border-white/5 rounded-xl p-3 space-y-3 font-mono text-[9px]">
            <div className="text-[8.5px] text-slate-500 uppercase tracking-wider font-bold">TRUST SLICE AUDITOR</div>

            {selectedNode !== null ? (() => {
              const node = NODES.find(n => n.id === selectedNode)!;
              return (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-slate-400 text-[8px] uppercase">Node Identifier:</span>
                    <span className="text-white block font-bold text-[10px]">{node.name}</span>
                    <span className="text-[7.5px] text-indigo-400">{node.role}</span>
                  </div>

                  <div className="space-y-1 border-t border-white/5 pt-2">
                    <span className="text-slate-400 text-[8px] uppercase">Quorum Slice (Trust Set):</span>
                    <div className="flex gap-1 mt-1">
                      {node.trusts.map(id => (
                        <span key={id} className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-extrabold text-[8px]">
                          Node {id}
                        </span>
                      ))}
                    </div>
                    <p className="text-slate-500 text-[8px] leading-relaxed pt-1.5 uppercase">
                      Node {node.id} will only agree to verify blocks if the nodes listed in its trust set also approve it.
                    </p>
                  </div>
                </div>
              );
            })() : (
              <div className="text-slate-500 italic py-6 text-center">
                Click a node in the graph to view its quorum slices.
              </div>
            )}
          </div>

        </div>

        {/* Action Panel */}
        <div className="bg-slate-950 border border-white/5 rounded-xl p-3 flex items-center justify-between text-[10px] font-mono">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400 uppercase">Core Quorum: Nodes 1, 2, and 3 (mutual overlaps)</span>
          </div>

          <button
            onClick={runSimulation}
            disabled={simStep !== "idle"}
            style={{ backgroundColor: simStep === "idle" ? color : "#1e293b" }}
            className="text-slate-950 disabled:text-slate-500 font-bold px-4 py-2 rounded-lg cursor-pointer disabled:cursor-not-allowed hover:opacity-90 flex items-center gap-1.5 uppercase font-mono text-[9px] ml-auto"
          >
            <Send className="w-3 h-3" /> Simulate Consensus Flow
          </button>
        </div>
      </div>

    </div>
  );
}

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SpaceOrganism from "./SpaceOrganism";
import { Database, ShieldAlert, AlertTriangle, Copy, Cpu, Layers, CheckCircle2 } from "lucide-react";

interface TheorySectionProps {
  onComplete: () => void;
}

interface TheorySlide {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  content: string[];
  note?: string;
  customRender?: React.ReactNode;
}

export default function TheorySection({ onComplete }: TheorySectionProps) {
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [isNodding, setIsNodding] = useState(false);
  const [showNextButton, setShowNextButton] = useState(true);

  const slides: TheorySlide[] = [
    {
      id: 1,
      title: "Centralized Systems",
      subtitle: "Traditional Database Architecture",
      icon: <Database className="w-5 h-5 text-cyan-400" />,
      content: [
        "Traditional applications commonly use centralized systems.",
        "In a centralized system, one organization or authority controls the database and manages the information stored inside it.",
        "Banks, companies, universities, governments, and online platforms commonly use centralized databases.",
        "Examples of traditional database technologies include MySQL and PostgreSQL.",
        "These databases are fast, efficient, reliable, and extremely useful when the organization controlling the database can be trusted.",
      ],
      note: "Centralized systems are the backbone of today's internet, prioritizing speed and admin control.",
    },
    {
      id: 2,
      title: "The Problem of Trust",
      subtitle: "Why centralization can fall short",
      icon: <ShieldAlert className="w-5 h-5 text-amber-400" />,
      content: [
        "Problems can arise when multiple independent parties need to share information but do not completely trust each other.",
        "If one organization controls the central database, every participant must trust that organization to: Store records correctly, protect the database, prevent unauthorized modifications, avoid secretly changing information, and keep the central server online.",
        "If the authority becomes dishonest, compromised, attacked, or unavailable, the entire system may be affected.",
      ],
      note: "Centralization relies on 100% blind trust in the network host.",
    },
    {
      id: 3,
      title: "Single Point of Failure",
      subtitle: "A vulnerability of centralization",
      icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
      content: [
        "A centralized database can create a single point of failure.",
        "If the central server fails, is attacked, becomes unavailable, or has its records manipulated, every participant depending on that server may be affected.",
        "This does not mean centralized databases are bad. It means that systems depending entirely on one central authority inherit all risks associated with that authority.",
      ],
    },
    {
      id: 4,
      title: "Multiple Copies of Records",
      subtitle: "Distributing the ledger",
      icon: <Copy className="w-5 h-5 text-sky-400" />,
      content: [
        "One possible approach to reducing dependence on a single authority is allowing multiple independent participants to maintain copies of shared records.",
        "If one copy is secretly modified, differences between records can potentially be detected through verification.",
        "This creates an important idea: Participants should not always need to blindly trust one database owner.",
        "However, simply copying databases is NOT enough to create a blockchain. Blockchain requires additional technologies and consensus mechanisms that we will explore later.",
      ],
      note: "Note: Record comparison is NOT blockchain consensus. True blockchain mechanisms are more complex.",
    },
    {
      id: 5,
      title: "Why Blockchain Was Introduced",
      subtitle: "The decentralization milestone",
      icon: <Cpu className="w-5 h-5 text-indigo-400" />,
      content: [
        "Blockchain technology was introduced to help multiple participants maintain and verify shared records without depending entirely on one central authority.",
        "Blockchain combines several concepts and technologies, including: Distributed records, Cryptography, Hashing, Blocks, Network participation, Transaction verification, and Consensus mechanisms.",
      ],
      note: "Blockchain solves the coordination problem among distrustful parties.",
    },
    {
      id: 6,
      title: "Blockchain vs. Traditional Databases",
      subtitle: "Choosing the right architecture",
      icon: <Layers className="w-5 h-5 text-teal-400" />,
      content: [
        "Choosing between blockchain and a traditional database depends entirely on the specific problem you are solving.",
      ],
      customRender: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 font-mono text-[10px] leading-relaxed">
          <div className="bg-slate-950/60 border border-white/5 p-3 rounded-lg">
            <div className="text-cyan-400 font-bold border-b border-white/5 pb-1 mb-2">TRADITIONAL DATABASE</div>
            <ul className="space-y-1.5 list-disc pl-3 text-slate-300">
              <li>High-performance, low-latency execution</li>
              <li>A single trusted organization controls state</li>
              <li>Centralized management is highly acceptable</li>
              <li>Ideal for: University systems, banking cores, internal tools, e-commerce</li>
            </ul>
          </div>
          <div className="bg-slate-950/60 border border-white/5 p-3 rounded-lg">
            <div className="text-teal-400 font-bold border-b border-white/5 pb-1 mb-2">BLOCKCHAIN</div>
            <ul className="space-y-1.5 list-disc pl-3 text-slate-300">
              <li>High security via distributed nodes</li>
              <li>Participants do not fully trust each other</li>
              <li>Records require independent verification</li>
              <li>Ideal for: Multi-party settlement, asset tracking, trustless agreements</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 7,
      title: "Mission Analysis Complete!",
      subtitle: "Reviewing flight notes",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      content: [
        "You investigated the corrupted Space Command Center.",
        "You discovered the risks of depending entirely on one central database.",
        "You learned why trust becomes difficult when independent participants share information.",
        "You discovered how maintaining independent copies can reduce blind dependence on one authority.",
        "And most importantly... You discovered WHY blockchain exists.",
      ],
    },
  ];

  const handleNext = () => {
    // Organism nods first, then slide transitions
    setIsNodding(true);
    setShowNextButton(false);
  };

  const onNodFinished = () => {
    setIsNodding(false);
    if (currentSlideIdx < slides.length - 1) {
      setCurrentSlideIdx(currentSlideIdx + 1);
      setShowNextButton(true);
    } else {
      onComplete();
    }
  };

  const activeSlide = slides[currentSlideIdx];

  return (
    <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-2xl relative">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Companion area (Space Organism) */}
        <div className="shrink-0 mx-auto md:mx-0 w-24">
          <SpaceOrganism isNodding={isNodding} onNodComplete={onNodFinished} />
        </div>

        {/* Slide Content Area */}
        <div className="flex-1 space-y-4 w-full">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            {activeSlide.icon}
            <div>
              <h3 className="text-sm font-bold text-white leading-none">{activeSlide.title}</h3>
              <p className="text-[10px] text-muted-foreground mt-1 font-mono uppercase tracking-wider">
                {activeSlide.subtitle}
              </p>
            </div>
          </div>

          {/* Render Slide Paragraphs */}
          <div className="space-y-2 text-xs text-slate-300 leading-relaxed min-h-[120px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlideIdx}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                {activeSlide.content.map((p, i) => (
                  <p key={i} className="mb-2">
                    {p}
                  </p>
                ))}

                {activeSlide.customRender}

                {activeSlide.note && (
                  <div className="mt-4 bg-slate-900/40 border border-white/5 p-2 rounded text-[10px] text-muted-foreground font-mono">
                    💡 {activeSlide.note}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Action Button */}
          {showNextButton && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-lg shadow-lg hover:shadow-cyan-500/20 transition-all uppercase tracking-wider text-[10px] font-mono"
              >
                {currentSlideIdx === slides.length - 1 ? "I Understand, Unlock Challenge ➔" : "Next Concept ➔"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

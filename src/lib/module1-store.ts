export type Module1Task =
  | "story"
  // Module 1
  | "task1_1" | "task1_2" | "task1_3" | "task1_verify"
  // Module 2
  | "task2_1" | "task2_2" | "task2_3" | "task2_4" | "task2_5" | "task2_verify"
  // Module 3
  | "task3_1" | "task3_2" | "task3_3" | "task3_4" | "task3_5" | "task3_verify"
  // Module 4
  | "task4_1" | "task4_2" | "task4_3" | "task4_4" | "task4_5" | "task4_verify"
  // Module 5
  | "task5_1" | "task5_2" | "task5_3" | "task5_4" | "task5_5" | "task5_verify"
  // Module 6
  | "task6_1" | "task6_2" | "task6_3" | "task6_4" | "task6_5" | "task6_verify"
  // Module 7
  | "task7_1" | "task7_2" | "task7_3" | "task7_4" | "task7_5" | "task7_verify"
  // Module 8
  | "task8_1" | "task8_2" | "task8_3" | "task8_4" | "task8_5" | "task8_verify"
  // Final timed challenge
  | "final_challenge"
  | "completed";

export const MODULE1_TASKS: Module1Task[] = [
  "story",
  // Module 1 (custom components, 3 tasks)
  "task1_1", "task1_2", "task1_3", "task1_verify",
  // Module 2 (curriculum: task2_2, task2_3 only)
  "task2_2", "task2_3", "task2_verify",
  // Module 3
  "task3_1", "task3_2", "task3_3", "task3_verify",
  // Module 4
  "task4_1", "task4_2", "task4_3", "task4_verify",
  // Module 5 (5 tasks)
  "task5_1", "task5_2", "task5_3", "task5_4", "task5_5", "task5_verify",
  // Module 6 (5 tasks)
  "task6_1", "task6_2", "task6_3", "task6_4", "task6_5", "task6_verify",
  // Module 7 (5 tasks)
  "task7_1", "task7_2", "task7_3", "task7_4", "task7_5", "task7_verify",
  // Module 8 (5 tasks)
  "task8_1", "task8_2", "task8_3", "task8_4", "task8_5", "task8_verify",
  "final_challenge",
  "completed",
];

const STORAGE_KEY_STEP = "cosmos-x-mercury-step";
const STORAGE_KEY_COMPLETED = "cosmos-x-mercury-completed";
const STORAGE_KEY_SCORES = "cosmos-x-task-scores";
const STORAGE_KEY_VERIFIED_MODULES = "cosmos-x-verified-modules";

export interface TaskScore {
  score: number;
  maxScore: number;
  passed: boolean;
}

export interface ModuleVerificationStatus {
  ready: boolean;
  passed: boolean;
  details: {
    taskId: string;
    title: string;
    passed: boolean;
    score: number;
    maxScore: number;
    minRequired: number;
  }[];
}

export function getMercuryCurrentTask(): Module1Task {
  if (typeof window === "undefined") return "story";
  const val = localStorage.getItem(STORAGE_KEY_STEP) as Module1Task;
  return MODULE1_TASKS.includes(val) ? val : "story";
}

export function setMercuryCurrentTask(task: Module1Task) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_STEP, task);

  // Calculate and store completion percentage
  const index = MODULE1_TASKS.indexOf(task);
  const percentage = Math.round((index / (MODULE1_TASKS.length - 1)) * 100);
  localStorage.setItem(STORAGE_KEY_COMPLETED, String(percentage));
}

export function getMercuryCompletion(): number {
  if (typeof window === "undefined") return 0;
  const val = localStorage.getItem(STORAGE_KEY_COMPLETED);
  return val ? parseInt(val, 10) : 0;
}

export function saveTaskScore(taskId: string, score: number, maxScore: number, passed: boolean) {
  if (typeof window === "undefined") return;
  const scores = getTaskScores();
  scores[taskId] = { score, maxScore, passed };
  localStorage.setItem(STORAGE_KEY_SCORES, JSON.stringify(scores));
}

export function getTaskScores(): Record<string, TaskScore> {
  if (typeof window === "undefined") return {};
  const val = localStorage.getItem(STORAGE_KEY_SCORES);
  return val ? JSON.parse(val) : {};
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  color: string;
}

export const MODULE_BADGES: Record<number, Badge> = {
  1: { id: "ledger_sentinel", name: "Ledger Sentinel", description: "Exposed centralized database fail points and mapped direct barter paths.", icon: "🛡️", rarity: "Rare", color: "#22d3ee" },
  2: { id: "crypto_auditor", name: "Cryptographic Auditor", description: "Audited transaction logs and double-spend sequences using hash fingerprints.", icon: "⚡", rarity: "Rare", color: "#f59e0b" },
  3: { id: "consensus_builder", name: "Consensus Builder", description: "Successfully resolved replication conflicts and network consensus forks.", icon: "📦", rarity: "Rare", color: "#10b981" },
  4: { id: "integrity_guardian", name: "Integrity Guardian", description: "Unmasked malicious block hashes and validated state roots under pressure.", icon: "🔑", rarity: "Rare", color: "#ec4899" },
  5: { id: "chain_link", name: "Genesis Chainlink", description: "Constructed valid cryptographic block pointers back to the genesis block.", icon: "🔗", rarity: "Rare", color: "#8b5cf6" },
  6: { id: "dist_marshal", name: "Distributed Marshal", description: "Routed transaction flows across peer-to-peer state channels.", icon: "🪐", rarity: "Rare", color: "#3b82f6" },
  7: { id: "val_general", name: "Validator General", description: "Reached strict quorums and consensus bounds on transactions validator logs.", icon: "⚖️", rarity: "Rare", color: "#eab308" },
  8: { id: "oracle_master", name: "Oracle Master", description: "Integrated secure external data oracle networks and completed the orbital path.", icon: "🔮", rarity: "Rare", color: "#06b6d4" }
};

const STORAGE_KEY_EARNED_BADGES = "cosmos-x-earned-badges";

export function getEarnedBadges(): string[] {
  if (typeof window === "undefined") return [];
  const val = localStorage.getItem(STORAGE_KEY_EARNED_BADGES);
  return val ? JSON.parse(val) : [];
}

export function awardBadge(badgeId: string) {
  if (typeof window === "undefined") return;
  const list = getEarnedBadges();
  if (!list.includes(badgeId)) {
    list.push(badgeId);
    localStorage.setItem(STORAGE_KEY_EARNED_BADGES, JSON.stringify(list));
  }
}

export function saveVerifiedModule(moduleId: number) {
  if (typeof window === "undefined") return;
  const list = getVerifiedModules();
  if (!list.includes(moduleId)) {
    list.push(moduleId);
    localStorage.setItem(STORAGE_KEY_VERIFIED_MODULES, JSON.stringify(list));
    
    // Auto-award badge for this module
    const badge = MODULE_BADGES[moduleId];
    if (badge) {
      awardBadge(badge.id);
    }
  }
}

export function getVerifiedModules(): number[] {
  if (typeof window === "undefined") return [];
  const val = localStorage.getItem(STORAGE_KEY_VERIFIED_MODULES);
  return val ? JSON.parse(val) : [];
}

export function checkModuleVerification(moduleId: number): ModuleVerificationStatus {
  const scores = getTaskScores();
  let taskList: { id: string; title: string; minRequired: number; max: number }[] = [];

  if (moduleId === 1) {
    taskList = [
      { id: "task1_1", title: "Map the Middlemen", minRequired: 9, max: 15 },
      { id: "task1_2", title: "Corrupted Command", minRequired: 10, max: 10 },
      { id: "task1_3", title: "Trade Dilemma", minRequired: 10, max: 10 },
    ];
  } else {
    // Build task list dynamically from MODULE1_TASKS so it matches the actual
    // progression order and count (some modules have 2 tasks, some have 5).
    taskList = MODULE1_TASKS
      .filter((t) => {
        const m = t.match(/^task(\d+)_(\d+)$/);
        return m && parseInt(m[1]) === moduleId;
      })
      .map((t) => {
        const m = t.match(/^task(\d+)_(\d+)$/)!;
        const taskNum = m[2];
        return {
          id: t,
          title: `Task ${moduleId}.${taskNum}`,
          minRequired: 10,
          max: 10,
        };
      });
  }

  const details = taskList.map((t) => {
    const record = scores[t.id];
    const score = record ? record.score : 0;
    const passed = record ? record.passed && score >= t.minRequired : false;
    return {
      taskId: t.id,
      title: t.title,
      passed,
      score,
      maxScore: t.max,
      minRequired: t.minRequired,
    };
  });

  const ready = details.every((d) => scores[d.taskId] !== undefined);
  const passed = details.every((d) => d.passed);

  return { ready, passed, details };
}

export function resetMercuryProgress() {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_STEP, "story");
  localStorage.setItem(STORAGE_KEY_COMPLETED, "0");
  localStorage.removeItem(STORAGE_KEY_SCORES);
  localStorage.removeItem(STORAGE_KEY_VERIFIED_MODULES);
  localStorage.removeItem(STORAGE_KEY_EARNED_BADGES);
}

export function resetModuleProgress(moduleId: number): Module1Task {
  if (typeof window === "undefined") return "story";

  // 1. Remove verified status of this module
  const verifiedRaw = localStorage.getItem(STORAGE_KEY_VERIFIED_MODULES);
  let verified: number[] = [];
  if (verifiedRaw) {
    try {
      verified = JSON.parse(verifiedRaw);
    } catch (e) {}
  }
  const updatedVerified = verified.filter(id => id !== moduleId);
  localStorage.setItem(STORAGE_KEY_VERIFIED_MODULES, JSON.stringify(updatedVerified));

  // Remove badge for this module
  const earnedRaw = localStorage.getItem(STORAGE_KEY_EARNED_BADGES);
  if (earnedRaw) {
    try {
      const earned: string[] = JSON.parse(earnedRaw);
      const badge = MODULE_BADGES[moduleId];
      if (badge) {
        const updatedEarned = earned.filter(id => id !== badge.id);
        localStorage.setItem(STORAGE_KEY_EARNED_BADGES, JSON.stringify(updatedEarned));
      }
    } catch (e) {}
  }

  // 2. Remove score records of tasks in this module
  const scoresRaw = localStorage.getItem(STORAGE_KEY_SCORES);
  if (scoresRaw) {
    try {
      const scores = JSON.parse(scoresRaw);
      const prefix = `task${moduleId}_`;
      for (const key in scores) {
        if (key.startsWith(prefix)) {
          delete scores[key];
        }
      }
      localStorage.setItem(STORAGE_KEY_SCORES, JSON.stringify(scores));
    } catch (e) {}
  }

  // 3. Set the current task to taskX_1 (or "story" if moduleId is 1)
  const firstTask = (moduleId === 1 ? "story" : `task${moduleId}_1`) as Module1Task;
  localStorage.setItem(STORAGE_KEY_STEP, firstTask);

  return firstTask;
}



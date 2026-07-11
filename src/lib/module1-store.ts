export type Module1Task =
  | "story"
  // Module 1
  | "task1_1" | "task1_2" | "task1_3" | "task1_4" | "task1_5" | "task1_verify"
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
  "task1_1", "task1_2", "task1_3", "task1_4", "task1_5", "task1_verify",
  "task2_1", "task2_2", "task2_3", "task2_4", "task2_5", "task2_verify",
  "task3_1", "task3_2", "task3_3", "task3_4", "task3_5", "task3_verify",
  "task4_1", "task4_2", "task4_3", "task4_4", "task4_5", "task4_verify",
  "task5_1", "task5_2", "task5_3", "task5_4", "task5_5", "task5_verify",
  "task6_1", "task6_2", "task6_3", "task6_4", "task6_5", "task6_verify",
  "task7_1", "task7_2", "task7_3", "task7_4", "task7_5", "task7_verify",
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

export function saveVerifiedModule(moduleId: number) {
  if (typeof window === "undefined") return;
  const list = getVerifiedModules();
  if (!list.includes(moduleId)) {
    list.push(moduleId);
    localStorage.setItem(STORAGE_KEY_VERIFIED_MODULES, JSON.stringify(list));
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
      { id: "task1_4", title: "Compare Systems", minRequired: 10, max: 10 },
      { id: "task1_5", title: "Choose Technology", minRequired: 60, max: 80 },
    ];
  } else {
    taskList = Array.from({ length: 5 }, (_, i) => {
      const taskNum = i + 1;
      return {
        id: `task${moduleId}_${taskNum}`,
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
}


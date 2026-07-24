import type { DifficultyStars, LessonKind, LessonQuestion, LessonSpec, RunnerFrame, StageId } from "../../../lib/curriculum/types";
import { createLessonSpec } from "../lesson-factory";

const source = (title: string, url: string) => ({ title, url });

/**
 * AI Application 阶段案例种子，用于 04-10 阶段真实内容生成。工厂 API 与 Python /
 * AI Agent 侧保持一致，便于复用可视化和运行时组件。
 */
export type AiAppLessonSeed = {
  id: string;
  stageId: StageId;
  order: number;
  eyebrowStage: string;
  title: string;
  concept: string;
  points: [string, string, string];
  memoryHook: string;
  fileName: string;
  code: string;
  prompt: string;
  correct: string;
  wrong: string;
  output: string;
  lanes: [string, string, string];
  laneValues: [string, string, string];
  log: string[];
  summary: string[];
  sourceTitle: string;
  sourceUrl: string;
  objectives?: string[];
  prerequisites?: string[];
  difficultyStars?: DifficultyStars;
  difficulty?: "基础" | "进阶";
  correctFeedback?: string;
  wrongFeedback?: string;
  additionalWrong?: { label: string; feedback: string };
};

function buildFrames(seed: AiAppLessonSeed): RunnerFrame[] {
  return [
    {
      activeLane: 0,
      laneValues: [seed.laneValues[0], "等待", "等待"],
      log: seed.log.slice(0, 1),
      note: `${seed.lanes[0]}：${seed.laneValues[0]}`,
      delayMs: 320
    },
    {
      activeLane: 1,
      laneValues: ["完成", seed.laneValues[1], "等待"],
      log: seed.log.slice(0, 2),
      note: `${seed.lanes[1]}：${seed.laneValues[1]}`,
      delayMs: 720
    },
    {
      activeLane: 2,
      laneValues: ["完成", "完成", seed.laneValues[2]],
      log: seed.log,
      note: `${seed.lanes[2]}：${seed.laneValues[2]}`,
      delayMs: 720
    }
  ];
}

export function createAiAppLesson(seed: AiAppLessonSeed): LessonSpec {
  const kind: LessonKind = "knowledge";
  const options = [
    {
      id: "a",
      label: seed.wrong,
      detail: "忽略了 AI 应用运行边界",
      feedback: seed.wrongFeedback ?? `注意：${seed.memoryHook}`
    },
    {
      id: "b",
      label: seed.correct,
      detail: "符合 LLM 调用链与工程约束",
      feedback: seed.correctFeedback ?? `正确：${seed.memoryHook}`
    }
  ];

  if (seed.additionalWrong) {
    options.push({
      id: "c",
      label: seed.additionalWrong.label,
      detail: "边界条件错误",
      feedback: seed.additionalWrong.feedback
    });
  }

  return createLessonSpec({
    id: seed.id,
    stageId: seed.stageId,
    kind,
    eyebrow: `${String(stageNumber(seed.stageId)).padStart(2, "0")}.${seed.order} · ${seed.eyebrowStage}`,
    title: seed.title,
    durationMinutes: 12,
    difficulty: seed.difficulty ?? (seed.order >= 6 ? "进阶" : "基础"),
    difficultyStars: seed.difficultyStars ?? (seed.order >= 7 ? 3 : seed.order >= 4 ? 2 : 1),
    nodeVersion: "AI Runtime",
    objectives: seed.objectives ?? [`掌握${seed.title}的核心运行模型`, "在真实 AI 应用系统中定位并解释关键行为"],
    prerequisites: seed.prerequisites ?? [],
    concept: seed.concept,
    points: [...seed.points],
    memoryHook: seed.memoryHook,
    files: [{ name: seed.fileName, code: seed.code }],
    entryFile: seed.fileName,
    answer: {
      type: seed.order % 2 === 0 ? "best-practice" : "prediction",
      prompt: seed.prompt,
      options,
      answerId: "b",
      correctExplanation: seed.correctFeedback ?? seed.memoryHook
    },
    execution: {
      lanes: seed.lanes,
      frames: buildFrames(seed)
    },
    summary: seed.summary,
    sources: [source(seed.sourceTitle, seed.sourceUrl)]
  });
}

export type AiAppStageProjectSeed = {
  id: string;
  stageId: StageId;
  eyebrowStage: string;
  title: string;
  brief: string;
  concept: string;
  points: [string, string, string];
  memoryHook: string;
  fileName: string;
  code: string;
  prompt: string;
  correct: string;
  wrong: string;
  additionalWrong?: { label: string; feedback: string };
  correctFeedback: string;
  wrongFeedback: string;
  lanes: [string, string, string];
  laneValues: [string, string, string];
  log: string[];
  summary: string[];
  sourceTitle: string;
  sourceUrl: string;
  objectives?: string[];
  prerequisites?: string[];
};

export function createAiAppStageProject(seed: AiAppStageProjectSeed): LessonSpec {
  const stageNum = stageNumber(seed.stageId);
  const options = [
    { id: "a", label: seed.wrong, detail: "忽略了 AI 应用工程边界", feedback: seed.wrongFeedback },
    { id: "b", label: seed.correct, detail: "符合 AI 应用工程实践", feedback: seed.correctFeedback }
  ];
  if (seed.additionalWrong) {
    options.push({ id: "c", label: seed.additionalWrong.label, detail: "边界条件错误", feedback: seed.additionalWrong.feedback });
  }

  const validationCheck: LessonQuestion = {
    id: `${seed.id}-validation-check`,
    type: "best-practice",
    prompt: "AI 应用阶段项目完成后最应该先验证什么？",
    options: [
      {
        id: "a",
        label: "只看到 LLM 给出答案就认为通过",
        detail: "只解决表面现象",
        feedback: "LLM 输出对不代表链路正确，需要沿 trace 检查 RAG 召回、Prompt、工具调用与评测。"
      },
      {
        id: "b",
        label: "针对典型样本构造评测集，比对 trace、召回命中、工具返回和最终输出",
        detail: "兼顾指标与证据",
        feedback: "AI 应用阶段项目必须建立可复查的评测证据链，任何一步都能回溯。"
      },
      {
        id: "c",
        label: "只跑单元测试，跳过评测与 trace 检查",
        detail: "跳过关键验证",
        feedback: "单元测试无法覆盖 RAG 漂移、Prompt 回归和成本超支。"
      }
    ],
    answerId: "b",
    correctExplanation: "AI 应用阶段项目要把召回、Prompt、工具、评测和输出串成一个可解释的闭环。"
  };

  return createLessonSpec({
    id: seed.id,
    stageId: seed.stageId,
    kind: "stage-project",
    eyebrow: `${String(stageNum).padStart(2, "0")}.9 · ${seed.eyebrowStage}`,
    title: seed.title,
    durationMinutes: 20,
    difficulty: "进阶",
    difficultyStars: 3,
    nodeVersion: "AI Runtime",
    objectives: seed.objectives ?? [`独立完成${seed.title}`, "把阶段知识点组合为可交付的 AI 应用系统片段"],
    prerequisites: seed.prerequisites ?? [],
    concept: seed.concept,
    points: [...seed.points],
    memoryHook: seed.memoryHook,
    files: [{ name: seed.fileName, code: seed.code }],
    entryFile: seed.fileName,
    brief: seed.brief,
    answer: {
      type: "best-practice",
      prompt: seed.prompt,
      options,
      answerId: "b",
      correctExplanation: seed.correctFeedback
    },
    additionalQuestions: [validationCheck],
    execution: {
      lanes: seed.lanes,
      frames: [
        { activeLane: 0, laneValues: [seed.laneValues[0], "等待", "等待"], log: seed.log.slice(0, 1), note: `${seed.lanes[0]}：${seed.laneValues[0]}`, delayMs: 380 },
        { activeLane: 1, laneValues: ["完成", seed.laneValues[1], "等待"], log: seed.log.slice(0, 2), note: `${seed.lanes[1]}：${seed.laneValues[1]}`, delayMs: 780 },
        { activeLane: 2, laneValues: ["完成", "完成", seed.laneValues[2]], log: seed.log, note: `${seed.lanes[2]}：${seed.laneValues[2]}`, delayMs: 780 }
      ]
    },
    summary: seed.summary,
    sources: [source(seed.sourceTitle, seed.sourceUrl)]
  });
}

function stageNumber(stageId: StageId): number {
  switch (stageId) {
    case "ai-app-prompt-rag":
      return 0;
    case "ai-app-tools-workflows":
      return 1;
    case "ai-app-multimodal-eval":
      return 2;
    case "ai-app-safety-production":
      return 3;
    case "ai-app-vector-retrieval":
      return 4;
    case "ai-app-prompt-chain":
      return 5;
    case "ai-app-model-selection":
      return 6;
    case "ai-app-evaluation-metrics":
      return 7;
    case "ai-app-cost-caching":
      return 8;
    case "ai-app-observability-tracing":
      return 9;
    case "ai-app-production-platform":
      return 10;
    default:
      return 0;
  }
}

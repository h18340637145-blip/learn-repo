import type { DifficultyStars, LessonKind, LessonQuestion, LessonSpec, RunnerFrame, StageId } from "../../../lib/curriculum/types";
import { createLessonSpec } from "../lesson-factory";

const source = (title: string, url: string) => ({ title, url });

/**
 * AI Agent 阶段案例种子。用于 04-10 阶段的批量内容生成，保持工厂 API 与 Python
 * 侧一致，方便复用可视化和运行时组件。
 */
export type AiAgentLessonSeed = {
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

function buildFrames(seed: AiAgentLessonSeed): RunnerFrame[] {
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

export function createAiAgentLesson(seed: AiAgentLessonSeed): LessonSpec {
  const kind: LessonKind = "knowledge";
  const options = [
    {
      id: "a",
      label: seed.wrong,
      detail: "忽略了 Agent 运行边界",
      feedback: seed.wrongFeedback ?? `注意：${seed.memoryHook}`
    },
    {
      id: "b",
      label: seed.correct,
      detail: "符合 Agent 循环与观察证据",
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
    nodeVersion: "Agent Runtime",
    objectives: seed.objectives ?? [`掌握${seed.title}的核心运行模型`, "在真实 Agent 系统中定位并解释关键行为"],
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

export type AiAgentStageProjectSeed = {
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

export function createAiAgentStageProject(seed: AiAgentStageProjectSeed): LessonSpec {
  const stageNum = stageNumber(seed.stageId);
  const options = [
    { id: "a", label: seed.wrong, detail: "忽略了 Agent 工程边界", feedback: seed.wrongFeedback },
    { id: "b", label: seed.correct, detail: "符合 Agent 工程实践", feedback: seed.correctFeedback }
  ];
  if (seed.additionalWrong) {
    options.push({ id: "c", label: seed.additionalWrong.label, detail: "边界条件错误", feedback: seed.additionalWrong.feedback });
  }

  const validationCheck: LessonQuestion = {
    id: `${seed.id}-validation-check`,
    type: "best-practice",
    prompt: "Agent 阶段项目完成后最应该先验证什么？",
    options: [
      {
        id: "a",
        label: "只观察 Agent 是否给出答案就当作通过",
        detail: "只解决表面现象",
        feedback: "Agent 给出答案不代表逻辑正确，需要沿 Trace 检查观察、计划、工具调用和记忆写入。"
      },
      {
        id: "b",
        label: "针对典型任务构造样本输入，比对 Trace、工具调用、记忆快照和最终输出",
        detail: "兼顾模型与证据",
        feedback: "Agent 阶段项目必须建立可复查的证据链，任何一步都能回溯。"
      },
      {
        id: "c",
        label: "只跑单元测试，跳过端到端 Trace 检查",
        detail: "跳过关键验证",
        feedback: "单元测试无法覆盖真实 Agent 调用链上的记忆污染、工具错配和上下文压缩。"
      }
    ],
    answerId: "b",
    correctExplanation: "Agent 阶段项目要把观察、计划、工具、记忆、评测和输出合成一个可解释的闭环。"
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
    nodeVersion: "Agent Runtime",
    objectives: seed.objectives ?? [`独立完成${seed.title}`, "把阶段知识点组合为可交付的 Agent 系统片段"],
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
    case "ai-agent-loop-planning":
      return 0;
    case "ai-agent-memory-tools":
      return 1;
    case "ai-agent-multi-agent":
      return 2;
    case "ai-agent-failure-recovery":
      return 3;
    case "ai-agent-tool-orchestration":
      return 4;
    case "ai-agent-long-memory":
      return 5;
    case "ai-agent-evaluation-observability":
      return 6;
    case "ai-agent-safety-alignment":
      return 7;
    case "ai-agent-multimodal-execution":
      return 8;
    case "ai-agent-production-deploy":
      return 9;
    case "ai-agent-platform-pipeline":
      return 10;
    default:
      return 0;
  }
}

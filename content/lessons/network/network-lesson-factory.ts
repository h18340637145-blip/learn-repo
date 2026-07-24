import type { DifficultyStars, LessonKind, LessonQuestion, LessonSpec, RunnerFrame, StageId } from "../../../lib/curriculum/types";
import { createLessonSpec } from "../lesson-factory";

const source = (title: string, url: string) => ({ title, url });

/**
 * 计算机网络 阶段案例种子。用于 04-10 阶段的批量内容生成，保持工厂 API 与 Python
 * 侧一致，方便复用可视化和运行时组件。
 */
export type NetworkLessonSeed = {
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

function buildFrames(seed: NetworkLessonSeed): RunnerFrame[] {
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

export function createNetworkLesson(seed: NetworkLessonSeed): LessonSpec {
  const kind: LessonKind = "knowledge";
  const options = [
    {
      id: "a",
      label: seed.wrong,
      detail: "忽略了网络运行边界",
      feedback: seed.wrongFeedback ?? `注意：${seed.memoryHook}`
    },
    {
      id: "b",
      label: seed.correct,
      detail: "符合协议规范与抓包证据",
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
    nodeVersion: "Network Runtime",
    objectives: seed.objectives ?? [`掌握${seed.title}的核心运行模型`, "在真实 网络系统中定位并解释关键行为"],
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

export type NetworkStageProjectSeed = {
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

export function createNetworkStageProject(seed: NetworkStageProjectSeed): LessonSpec {
  const stageNum = stageNumber(seed.stageId);
  const options = [
    { id: "a", label: seed.wrong, detail: "忽略了网络协议边界", feedback: seed.wrongFeedback },
    { id: "b", label: seed.correct, detail: "符合网络工程实践", feedback: seed.correctFeedback }
  ];
  if (seed.additionalWrong) {
    options.push({ id: "c", label: seed.additionalWrong.label, detail: "边界条件错误", feedback: seed.additionalWrong.feedback });
  }

  const validationCheck: LessonQuestion = {
    id: `${seed.id}-validation-check`,
    type: "best-practice",
    prompt: "网络阶段项目完成后最应该先验证什么？",
    options: [
      {
        id: "a",
        label: "只观察请求是否成功就当作通过",
        detail: "只解决表面现象",
        feedback: "接口响应 200 不代表链路正常，需要沿抓包/HAR/traceparent 检查 DNS、TCP、TLS、HTTP 与代理链路。"
      },
      {
        id: "b",
        label: "针对典型请求构造样本，比对 HAR、抓包、指标与响应",
        detail: "兼顾模型与证据",
        feedback: "网络阶段项目必须建立可复查的证据链，任何一步都能回溯。"
      },
      {
        id: "c",
        label: "只跑单元测试，跳过端到端 Trace 检查",
        detail: "跳过关键验证",
        feedback: "单元测试无法覆盖真实网络中的握手、重传、代理与缓存。"
      }
    ],
    answerId: "b",
    correctExplanation: "网络阶段项目要把观察、计划、工具、记忆、评测和输出合成一个可解释的闭环。"
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
    nodeVersion: "Network Runtime",
    objectives: seed.objectives ?? [`独立完成${seed.title}`, "把阶段知识点组合为可交付的 网络系统片段"],
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
    case "network-url-dns":
      return 0;
    case "network-http-cache":
      return 1;
    case "network-security-realtime":
      return 2;
    case "network-gateway-debugging":
      return 3;
    case "network-http2-http3":
      return 4;
    case "network-tls-security":
      return 5;
    case "network-cdn-edge":
      return 6;
    case "network-performance-tuning":
      return 7;
    case "network-observability":
      return 8;
    case "network-p2p-webrtc":
      return 9;
    case "network-zero-trust":
      return 10;
    default:
      return 0;
  }
}

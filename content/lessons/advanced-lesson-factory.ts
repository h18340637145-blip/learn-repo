import type { LessonSpec, RunnerFrame, StageId } from "../../lib/curriculum/types";
import { createLessonSpec } from "./lesson-factory";

type AdvancedLessonInput = {
  id: string;
  stageId: StageId;
  stageNumber: number;
  order: number;
  title: string;
  concept: string;
  points: string[];
  memoryHook: string;
  code: string;
  entryFile: string;
  prompt: string;
  correct: string;
  wrongA: string;
  wrongB: string;
  correctFeedback: string;
  wrongAFeedback: string;
  wrongBFeedback: string;
  lanes: [string, string, string];
  frameValues: [string, string, string];
  log: string[];
  summary: string[];
  sourceTitle: string;
  sourceUrl: string;
  objectives?: string[];
  prerequisites?: string[];
  kind?: LessonSpec["kind"];
  difficulty?: LessonSpec["difficulty"];
  durationMinutes?: number;
};

export function createAdvancedLesson(input: AdvancedLessonInput): LessonSpec {
  const frames: RunnerFrame[] = [
    {
      activeLane: 0,
      laneValues: [input.frameValues[0], "等待", "等待"],
      log: input.log.slice(0, 1),
      note: `${input.lanes[0]}：${input.frameValues[0]}`,
      delayMs: 320
    },
    {
      activeLane: 1,
      laneValues: ["完成", input.frameValues[1], "等待"],
      log: input.log.slice(0, 2),
      note: `${input.lanes[1]}：${input.frameValues[1]}`,
      delayMs: 760
    },
    {
      activeLane: 2,
      laneValues: ["完成", "完成", input.frameValues[2]],
      log: input.log,
      note: `${input.lanes[2]}：${input.frameValues[2]}`,
      delayMs: 760
    }
  ];

  return createLessonSpec({
    id: input.id,
    stageId: input.stageId,
    kind: input.kind,
    eyebrow: `${String(input.stageNumber).padStart(2, "0")}.${input.order} · ${stageLabel(input.stageId)}`,
    title: input.title,
    durationMinutes: input.durationMinutes ?? (input.kind === "stage-project" ? 18 : 10),
    difficulty: input.difficulty ?? (input.kind === "stage-project" ? "进阶" : "基础"),
    objectives: input.objectives ?? [`理解${input.title}的核心运行边界`],
    prerequisites: input.prerequisites ?? [],
    concept: input.concept,
    points: input.points,
    memoryHook: input.memoryHook,
    files: [{ name: input.entryFile, code: input.code }],
    entryFile: input.entryFile,
    answer: {
      prompt: input.prompt,
      options: [
        { id: "a", label: input.wrongA, detail: "常见误判", feedback: input.wrongAFeedback },
        { id: "b", label: input.correct, detail: "符合 Node.js 运行模型", feedback: input.correctFeedback },
        { id: "c", label: input.wrongB, detail: "边界条件错误", feedback: input.wrongBFeedback }
      ],
      answerId: "b",
      correctExplanation: input.correctFeedback
    },
    execution: {
      lanes: input.lanes,
      frames
    },
    summary: input.summary,
    sources: [{ title: input.sourceTitle, url: input.sourceUrl }]
  });
}

function stageLabel(stageId: StageId): string {
  const labels: Record<StageId, string> = {
    "runtime-cli": "运行时与命令行",
    "modules-packages": "模块、包与 TypeScript",
    "async-events": "异步运行时与事件",
    "files-streams": "文件、Buffer 与 Stream",
    "http-foundations": "HTTP 基础",
    "api-design": "API 与服务设计",
    "process-concurrency": "进程与并发",
    realtime: "实时通信",
    "testing-security": "测试与安全",
    "diagnostics-production": "诊断与生产工程"
  };

  return labels[stageId];
}

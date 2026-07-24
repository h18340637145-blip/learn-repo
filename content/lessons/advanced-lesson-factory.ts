import type { LessonSpec, RunnerFrame, StageId, VisualizerSpec } from "../../lib/curriculum/types";
import { createLessonSpec } from "./lesson-factory";

type AdvancedLessonInput = {
  id: string;
  stageId: StageId;
  order: number;
  title: string;
  concept: string;
  points: string[];
  memoryHook: string;
  code: string;
  entryFile: string;
  prompt?: string;
  correct?: string;
  wrongA?: string;
  wrongB?: string;
  correctFeedback?: string;
  wrongAFeedback?: string;
  wrongBFeedback?: string;
  lanes: [string, string, string];
  frameValues: [string, string, string];
  log: string[];
  summary: string[];
  sourceTitle: string;
  sourceUrl: string;
  objectives?: string[];
  prerequisites?: string[];
  visualizer?: VisualizerSpec;
  kind: LessonSpec["kind"];
  difficulty?: LessonSpec["difficulty"];
  difficultyStars?: LessonSpec["difficultyStars"];
  durationMinutes?: number;
  steps?: LessonSpec["steps"];
};

export function createAdvancedLesson(input: AdvancedLessonInput): LessonSpec {
  const meta = stageMeta(input.stageId);
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
    eyebrow: `${String(meta.number).padStart(2, "0")}.${input.order} · ${meta.label}`,
    title: input.title,
    durationMinutes: input.durationMinutes ?? (input.kind === "stage-project" ? 18 : 10),
    difficulty: input.difficulty ?? (input.kind === "stage-project" ? "进阶" : "基础"),
    difficultyStars: input.difficultyStars,
    objectives: input.objectives ?? [`理解${input.title}的核心运行边界`],
    prerequisites: input.prerequisites ?? [],
    concept: input.concept,
    points: input.points,
    memoryHook: input.memoryHook,
    files: [{ name: input.entryFile, code: input.code }],
    entryFile: input.entryFile,
    steps: input.steps,
    answer: input.prompt ? {
      prompt: input.prompt,
      options: [
        { id: "a", label: input.wrongA!, detail: "常见误判", feedback: input.wrongAFeedback! },
        { id: "b", label: input.correct!, detail: "符合 Node.js 运行模型", feedback: input.correctFeedback! },
        { id: "c", label: input.wrongB!, detail: "边界条件错误", feedback: input.wrongBFeedback! }
      ],
      answerId: "b",
      correctExplanation: input.correctFeedback!
    } : undefined,
    execution: {
      visualizer: input.visualizer,
      lanes: input.lanes,
      frames
    },
    summary: input.summary,
    sources: [{ title: input.sourceTitle, url: input.sourceUrl }]
  });
}

function stageMeta(stageId: StageId): { number: number; label: string } {
  const meta: Partial<Record<StageId, { number: number; label: string }>> = {
    foundations: { number: 0, label: "基础训练营" },
    "runtime-cli": { number: 1, label: "运行时与命令行" },
    "modules-packages": { number: 2, label: "模块、包与 TypeScript" },
    "async-events": { number: 3, label: "异步运行时与事件" },
    "files-streams": { number: 4, label: "文件、Buffer 与 Stream" },
    "http-foundations": { number: 5, label: "HTTP 基础" },
    "api-design": { number: 6, label: "API 与服务设计" },
    "process-concurrency": { number: 7, label: "进程与并发" },
    realtime: { number: 8, label: "实时通信" },
    "testing-security": { number: 9, label: "测试与安全" },
    "diagnostics-production": { number: 10, label: "诊断与生产工程" },
    // Next.js 阶段
    "nextjs-foundations": { number: 0, label: "Next.js 基础" },
    "nextjs-routing": { number: 1, label: "路由系统" },
    "nextjs-rendering": { number: 2, label: "渲染模式" },
    "nextjs-data-fetching": { number: 3, label: "数据获取" },
    "nextjs-styling-optimization": { number: 4, label: "样式与优化" },
    "nextjs-api-routes": { number: 5, label: "API 路由与中间件" },
    "nextjs-auth-middleware": { number: 6, label: "认证与会话" },
    "nextjs-database": { number: 7, label: "数据库与 ORM" },
    "nextjs-testing-deployment": { number: 8, label: "测试与部署" },
    "nextjs-advanced-patterns": { number: 9, label: "高级模式" },
    // 前端调试阶段
    "frontend-debugging-console-stack": { number: 0, label: "浏览器控制台与错误栈" }
  };

  return meta[stageId] ?? { number: 0, label: "规划阶段" };
}

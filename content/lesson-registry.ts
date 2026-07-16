import type { LessonSpec, StageId } from "../lib/curriculum/types";
import { legacyLessons, type LegacyLesson } from "./legacy-lessons";
import { stageOneRuntimeCliLessons } from "./lessons/stage-01-runtime-cli";
import { stageTwoModulesPackagesLessons } from "./lessons/stage-02-modules-packages";
import { stageThreeAsyncEventsLessons } from "./lessons/stage-03-async-events";
import { stageFiveHttpFoundationsLessons } from "./lessons/stage-05-http-foundations";
import { stageSixApiDesignLessons } from "./lessons/stage-06-api-design";
import { stageSevenProcessConcurrencyLessons } from "./lessons/stage-07-process-concurrency";
import { stageEightRealtimeLessons } from "./lessons/stage-08-realtime";
import { stageNineTestingSecurityLessons } from "./lessons/stage-09-testing-security";
import { stageTenDiagnosticsProductionLessons } from "./lessons/stage-10-diagnostics-production";

type MigrationMetadata = {
  id: string;
  stageId: StageId;
  eyebrow: string;
  memoryHook: string;
  objective: string;
  prerequisites: string[];
  sourceTitle: string;
  sourceUrl: string;
  feedback: Record<string, string>;
};

const metadataByLegacyId: Record<string, MigrationMetadata> = {
  modules: {
    id: "modules-require-cache",
    stageId: "modules-packages",
    eyebrow: "02.7 · 模块、包与 TypeScript",
    memoryHook: "首次执行并缓存，后续命中同一实例",
    objective: "解释相同模块路径的多次 require 为什么共享导出值与闭包状态",
    prerequisites: ["modules-resolution"],
    sourceTitle: "Modules: Caching",
    sourceUrl: "https://nodejs.org/api/modules.html#caching",
    feedback: {
      a: "这是正确结果：模块只初始化一次，两个变量共享同一个闭包计数器。",
      b: "两次 require 解析到同一文件时，第二次命中缓存，不会再次执行模块顶层代码。",
      c: "a 与 b 得到同一个导出函数，函数闭包中的 count 会在两次调用之间保留。"
    }
  },
  "event-loop": {
    id: "event-loop-order",
    stageId: "async-events",
    eyebrow: "03.5 · 异步运行时与事件",
    memoryHook: "栈清空 → 微任务 → 下一阶段",
    objective: "预测同步代码、Promise 微任务和 timers 回调的输出顺序",
    prerequisites: ["async-promises"],
    sourceTitle: "The Node.js Event Loop",
    sourceUrl: "https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick",
    feedback: {
      a: "setTimeout 回调必须等待当前调用栈和微任务队列处理完成，因此不会先于 Promise 回调。",
      b: "这是正确顺序：同步日志先执行，随后清空 Promise 微任务，最后进入 timers 阶段。",
      c: "Promise.then 只把回调加入微任务队列，不能抢占正在运行的同步调用栈。"
    }
  },
  streams: {
    id: "stream-backpressure",
    stageId: "files-streams",
    eyebrow: "04.8 · 文件、Buffer 与 Stream",
    memoryHook: "write 返回 false → 等待 drain",
    objective: "在 write 返回 false 时暂停生产者并等待 drain 恢复",
    prerequisites: ["streams-writable-transform"],
    sourceTitle: "Backpressuring in Streams",
    sourceUrl: "https://nodejs.org/en/learn/modules/backpressuring-in-streams",
    feedback: {
      a: "立即重试会继续向已满缓冲区施压，并可能造成高 CPU 与内存增长。",
      b: "write 返回 false 不是写入失败，丢弃 chunk 会破坏数据完整性。",
      c: "这是正确处理：暂停生产，等待 writable 发出 drain 后再继续。"
    }
  },
  "stage-project": {
    id: "project-cli-log-analyzer",
    stageId: "files-streams",
    eyebrow: "阶段项目 04 · 综合训练",
    memoryHook: "流式读取 → 校验输入 → 聚合报告",
    objective: "组合文件流、异步迭代和输入校验完成日志聚合",
    prerequisites: ["stream-backpressure"],
    sourceTitle: "Reading files with Node.js",
    sourceUrl: "https://nodejs.org/en/learn/manipulating-files/reading-files-with-nodejs",
    feedback: {
      a: "未知日志级别对应的值是 undefined，直接递增会产生 NaN 并污染统计对象。",
      b: "这是正确处理：先确认 level 是已知键，再更新对应计数。",
      c: "固定递增 INFO 会把 WARN、ERROR 和未知级别全部错误归类。"
    }
  }
};

function migrateLesson(legacy: LegacyLesson): LessonSpec {
  const metadata = metadataByLegacyId[legacy.id];
  if (!metadata) throw new Error(`缺少旧课程 ${legacy.id} 的迁移元数据`);
  const entryFile = legacy.project ? "analyze.js" : "lesson.js";

  return {
    id: metadata.id,
    stageId: metadata.stageId,
    kind: legacy.project ? "stage-project" : "knowledge",
    eyebrow: metadata.eyebrow,
    title: legacy.title,
    durationMinutes: Number.parseInt(legacy.duration, 10),
    difficulty: legacy.project ? "进阶" : "基础",
    nodeVersion: "24.x",
    objectives: [metadata.objective],
    prerequisites: metadata.prerequisites,
    concept: legacy.concept,
    points: legacy.points,
    memoryHook: metadata.memoryHook,
    files: [{ name: entryFile, code: legacy.code }],
    entryFile,
    questions: [{
      id: `${metadata.id}-prediction`,
      type: "prediction",
      prompt: legacy.question,
      options: legacy.options.map((option) => ({
        ...option,
        feedback: metadata.feedback[option.id]
      })),
      answerId: legacy.answer,
      correctExplanation: legacy.summary.join("；")
    }],
    execution: {
      mode: "authored-trace",
      visualizer: "lane-flow",
      lanes: legacy.lanes,
      frames: legacy.frames.map((frame, index) => ({
        ...frame,
        delayMs: index === 0 ? 280 : 780
      }))
    },
    summary: legacy.summary,
    sources: [{
      type: "official",
      title: metadata.sourceTitle,
      url: metadata.sourceUrl,
      verifiedAt: "2026-07-15"
    }]
  };
}

const legacyStageFourLessons = legacyLessons
  .filter((legacy) => legacy.id === "streams" || legacy.id === "stage-project")
  .map(migrateLesson);

export const publishedLessons = [
  stageOneRuntimeCliLessons,
  stageTwoModulesPackagesLessons,
  stageThreeAsyncEventsLessons,
  legacyStageFourLessons,
  stageFiveHttpFoundationsLessons,
  stageSixApiDesignLessons,
  stageSevenProcessConcurrencyLessons,
  stageEightRealtimeLessons,
  stageNineTestingSecurityLessons,
  stageTenDiagnosticsProductionLessons
].flat() satisfies LessonSpec[];
const lessonById = new Map(publishedLessons.map((lesson) => [lesson.id, lesson]));

export function getLesson(id: string): LessonSpec | undefined {
  return lessonById.get(id);
}

import assert from "node:assert/strict";
import test from "node:test";

import { publishedLessons } from "../../content/lesson-registry";
import type { CurriculumStage, LessonSpec } from "../../lib/curriculum/types";
import { validateCatalog, validateLessonSpec } from "../../lib/curriculum/validate";

const validLesson: LessonSpec = {
  id: "event-loop-order",
  stageId: "async-events",
  kind: "knowledge",
  eyebrow: "03.5 · 异步运行时与事件",
  title: "读懂 Event Loop 执行顺序",
  durationMinutes: 12,
  difficulty: "基础",
  nodeVersion: "24.x",
  objectives: ["区分同步任务、微任务和 timers 回调"],
  prerequisites: ["runtime-event-driven"],
  concept: "当前调用栈清空后处理微任务，再进入事件循环阶段。",
  points: ["Promise 回调进入微任务队列"],
  memoryHook: "栈清空 → 微任务 → 下一阶段",
  files: [{ name: "lesson.mjs", code: "console.log('1')" }],
  entryFile: "lesson.mjs",
  questions: [{
    id: "event-loop-order-prediction",
    type: "prediction",
    prompt: "首先输出什么？",
    options: [
      { id: "a", label: "1", detail: "同步执行", feedback: "同步代码先执行。" },
      { id: "b", label: "2", detail: "计时器先执行", feedback: "计时器不能抢占当前调用栈。" }
    ],
    answerId: "a",
    correctExplanation: "同步日志先于异步回调。"
  }],
  execution: {
    mode: "authored-trace",
    visualizer: "lane-flow",
    lanes: ["Call Stack"],
    frames: [{ activeLane: 0, laneValues: ["console.log"], log: ["1"], note: "同步执行。", delayMs: 0 }]
  },
  summary: ["同步代码先完成"],
  sources: [{
    type: "official",
    title: "The Node.js Event Loop",
    url: "https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick",
    verifiedAt: "2026-07-15"
  }]
};

const stageIds: CurriculumStage["id"][] = [
  "runtime-cli",
  "modules-packages",
  "async-events",
  "files-streams",
  "http-foundations",
  "api-design",
  "process-concurrency",
  "realtime",
  "testing-security",
  "diagnostics-production"
];

function createValidCatalog(): CurriculumStage[] {
  return stageIds.map((id, index) => ({
    id,
    number: index + 1,
    title: `阶段 ${index + 1}`,
    summary: `阶段 ${index + 1} 摘要`,
    lessons: Array.from({ length: 8 }, (_, lessonIndex) => ({
      id: `${id}-lesson-${lessonIndex + 1}`,
      title: `知识点 ${lessonIndex + 1}`,
      order: lessonIndex + 1,
      kind: "knowledge",
      status: "published"
    })),
    project: {
      id: `${id}-project`,
      title: `阶段 ${index + 1} 项目`,
      order: 9,
      kind: "stage-project",
      status: "planned"
    }
  }));
}

test("有效课程规格没有校验错误", () => {
  assert.deepEqual(validateLessonSpec(validLesson), []);
});

test("正确答案不存在时返回具体错误", () => {
  const invalid = structuredClone(validLesson);
  invalid.questions[0].answerId = "missing";
  assert.deepEqual(validateLessonSpec(invalid), [
    "课程 event-loop-order 的题目 event-loop-order-prediction 缺少正确答案选项 missing"
  ]);
});

test("有效 10 阶段课程目录没有校验错误", () => {
  assert.deepEqual(validateCatalog(createValidCatalog()), []);
});

test("课程目录阶段数量不是 10 时返回具体错误", () => {
  assert.deepEqual(validateCatalog(createValidCatalog().slice(0, 9)), [
    "课程目录应有 10 个阶段，实际为 9"
  ]);
});

test("课程目录阶段编号错误时返回具体错误", () => {
  const invalid = createValidCatalog();
  invalid[0].number = 2;

  assert.deepEqual(validateCatalog(invalid), [
    "阶段 runtime-cli 的编号应为 1"
  ]);
});

test("课程目录包含重复课程 ID 时返回具体错误", () => {
  const invalid = createValidCatalog();
  invalid[1].lessons[0].id = "runtime-cli-lesson-1";

  assert.deepEqual(validateCatalog(invalid), [
    "课程 ID 重复：runtime-cli-lesson-1"
  ]);
});

test("课程规格包含可视化轨迹、总结和官方来源", () => {
  for (const lesson of publishedLessons) {
    assert.ok(lesson.files.length >= 1, `${lesson.id} 至少包含一个代码文件`);
    assert.ok(lesson.files.every((file) => file.code.trim().length > 0), `${lesson.id} 的代码文件不能为空`);
    assert.ok(lesson.execution.frames.length >= 3, `${lesson.id} 至少包含 3 个运行帧`);
    assert.ok(lesson.summary.length >= 3, `${lesson.id} 至少包含 3 条总结`);
    assert.ok(lesson.sources.some((source) => source.type === "official"), `${lesson.id} 至少包含一个官方来源`);
  }
});

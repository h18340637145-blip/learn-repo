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
    visualizer: {
      type: "lane-flow",
      title: "轨道流",
      nodes: ["Call Stack"]
    },
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
  "foundations",
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
    number: index,
    title: index === 0 ? "基础训练营" : `阶段 ${index}`,
    summary: index === 0 ? "补齐 Node.js 入门语法" : `阶段 ${index} 摘要`,
    lessons: Array.from({ length: 8 }, (_, lessonIndex) => ({
      id: `${id}-lesson-${lessonIndex + 1}`,
      title: `知识点 ${lessonIndex + 1}`,
      order: lessonIndex + 1,
      kind: "knowledge",
      status: "published"
    })),
    project: {
      id: `${id}-project`,
      title: index === 0 ? "基础训练营项目" : `阶段 ${index} 项目`,
      order: 9,
      kind: "stage-project",
      status: "planned"
    }
  }));
}

function cloneLesson(): LessonSpec {
  return structuredClone(validLesson);
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

test("implementation 题必须包含带语言声明的代码选项", () => {
  const invalid = structuredClone(validLesson);
  invalid.questions.push({
    id: "array-map-implementation",
    type: "implementation",
    prompt: "选择能把 [1, 2, 3] 变成 [2, 4, 6] 的实现",
    options: [
      { id: "a", label: "map", detail: "使用 map", feedback: "正确但这里故意缺少 code" },
      { id: "b", label: "filter", detail: "使用 filter", feedback: "filter 不会改变元素值" }
    ],
    answerId: "a",
    correctExplanation: "map 会逐项转换数组元素。"
  });

  assert.deepEqual(validateLessonSpec(invalid), [
    "课程 event-loop-order 的 implementation 题 array-map-implementation 至少需要一个代码选项"
  ]);
});

test("含代码的选项必须声明语言且 diffLines 必须为正整数数组", () => {
  const invalid = structuredClone(validLesson);
  invalid.questions.push({
    id: "array-map-implementation",
    type: "implementation",
    prompt: "选择正确实现",
    options: [
      { id: "a", label: "map", detail: "转换", feedback: "正确", code: "[1,2,3].map(n => n * 2)", diffLines: [0] }
    ],
    answerId: "a",
    correctExplanation: "map 会返回新数组。"
  });

  assert.deepEqual(validateLessonSpec(invalid), [
    "课程 event-loop-order 的题目 array-map-implementation 至少需要 2 个选项",
    "课程 event-loop-order 的题目 array-map-implementation 选项 a 含代码但缺少 language",
    "课程 event-loop-order 的题目 array-map-implementation 选项 a 的 diffLines 必须是正整数数组"
  ]);
});

test("有效 00 到 10 阶段课程目录没有校验错误", () => {
  assert.deepEqual(validateCatalog(createValidCatalog()), []);
});

test("课程目录阶段数量不是 11 时返回具体错误", () => {
  assert.deepEqual(validateCatalog(createValidCatalog().slice(0, 10)), [
    "课程目录应有 11 个阶段，实际为 10"
  ]);
});

test("课程目录阶段编号错误时返回具体错误", () => {
  const invalid = createValidCatalog();
  invalid[0].number = 2;

  assert.deepEqual(validateCatalog(invalid), [
    "阶段 foundations 的编号应为 0"
  ]);
});

test("课程目录包含重复课程 ID 时返回具体错误", () => {
  const invalid = createValidCatalog();
  invalid[0].lessons[0].id = "runtime-cli-lesson-1";

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

test("P1 题型必须声明难度和预计作答时间", () => {
  const invalid = cloneLesson();
  invalid.questions.push({
    id: "http-diagnosis",
    type: "diagnosis",
    prompt: "为什么响应状态码不正确？",
    options: [
      { id: "a", label: "没有设置 statusCode", detail: "默认 200", feedback: "正确。" },
      { id: "b", label: "没有调用 listen", detail: "混淆启动和响应", feedback: "listen 影响服务启动，不决定单次响应状态。" }
    ],
    answerId: "a",
    correctExplanation: "Node.js HTTP 响应默认状态码为 200，错误分支需要显式设置状态码。"
  });

  assert.deepEqual(validateLessonSpec(invalid), [
    "课程 event-loop-order 的 P1 题 http-diagnosis 必须声明 difficulty",
    "课程 event-loop-order 的 P1 题 http-diagnosis 必须声明 estimatedSeconds"
  ]);
});

test("repair 和 completion 题至少需要两个代码选项", () => {
  const invalid = cloneLesson();
  invalid.questions.push({
    id: "repair-http-status",
    type: "repair",
    prompt: "选择正确修复方案。",
    difficulty: "beginner",
    estimatedSeconds: 80,
    options: [
      {
        id: "a",
        label: "设置 statusCode",
        detail: "修复响应状态",
        feedback: "正确。",
        language: "js",
        code: "res.statusCode = 404;"
      },
      { id: "b", label: "只打印日志", detail: "没有修复响应", feedback: "日志不影响响应状态。" }
    ],
    answerId: "a",
    correctExplanation: "repair 题需要可比较的代码修复方案。"
  });

  assert.deepEqual(validateLessonSpec(invalid), [
    "课程 event-loop-order 的 repair 题 repair-http-status 至少需要 2 个代码选项"
  ]);
});

test("execution-order 提供 orderItems 时至少需要三个步骤", () => {
  const invalid = cloneLesson();
  invalid.questions.push({
    id: "event-order",
    type: "execution-order",
    prompt: "选择正确执行顺序。",
    materialTitle: "事件循环片段",
    materialCode: "console.log('sync'); Promise.resolve().then(() => console.log('micro'));",
    materialLanguage: "js",
    orderItems: ["sync", "micro"],
    difficulty: "beginner",
    estimatedSeconds: 60,
    options: [
      { id: "a", label: "sync -> micro", detail: "同步后微任务", feedback: "正确。" },
      { id: "b", label: "micro -> sync", detail: "微任务抢先", feedback: "同步代码先执行。" }
    ],
    answerId: "a",
    correctExplanation: "同步调用栈先清空，然后执行微任务。"
  });

  assert.deepEqual(validateLessonSpec(invalid), [
    "课程 event-loop-order 的 execution-order 题 event-order 的 orderItems 至少需要 3 项"
  ]);
});

test("同一课程内题目 ID 不能重复", () => {
  const invalid = cloneLesson();
  invalid.questions.push({ ...invalid.questions[0] });

  assert.deepEqual(validateLessonSpec(invalid), [
    "课程 event-loop-order 的题目 ID 重复：event-loop-order-prediction"
  ]);
});

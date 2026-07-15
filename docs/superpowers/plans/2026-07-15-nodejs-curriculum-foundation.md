# NodePath 课程基础设施与现有案例迁移实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 `superpowers-zh:subagent-driven-development`（推荐）或 `superpowers-zh:executing-plans` 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 建立可扩展到 80 个知识点的课程目录、强类型课程规格、内容校验、预设轨迹运行器和本地进度仓储，并在不改变现有学习体验的前提下迁移当前 3 个知识点与 1 个阶段项目。

**架构：** 课程目录、课程规格、执行逻辑和进度存储从 `app/learning-studio.tsx` 中拆出。UI 只消费课程注册表、课程视图模型和统一运行事件；首期保留现有 lane-flow 可视化，后续阶段再按注册表增加其他可视化与沙箱适配器。

**技术栈：** Next.js 16.2.10 App Router、React 19.2.4、TypeScript 5、Node.js 内置测试运行器、tsx、浏览器 localStorage。

---

## 范围拆分说明

完整规格包含课程基础设施、80 个知识点、240–320 道题、真实沙箱、10 类可视化和最终项目，不能由一个可审查的实现计划安全交付。本计划只覆盖规格交付顺序的第一阶段，并产出一个保持现有功能可用的课程平台基础。

后续必须分别编写并审查以下独立计划：

1. 阶段 01–03 内容、题库和模块/事件循环可视化。
2. 阶段 04–06 内容、Stream/HTTP 可视化和首个真实沙箱项目。
3. 阶段 07–10 内容、实时/并发/测试/诊断可视化。
4. 最终综合项目、全课程安全验收与移动端验收。

本计划不实现任意代码执行、SSE、Docker 沙箱、Supabase 登录或新增 76 个课程案例。

## 文件结构

### 创建

- `lib/curriculum/types.ts`：课程目录、课程规格、题目、来源和预设轨迹的公共类型。
- `lib/curriculum/validate.ts`：无副作用的课程目录与课程规格校验函数。
- `lib/curriculum/view-model.ts`：把目录、课程注册表和进度转换为侧边栏视图模型。
- `content/curriculum.ts`：10 个阶段、80 个计划知识点和 10 个阶段项目的主目录。
- `content/legacy-lessons.ts`：原样承接当前 4 个内联案例，作为迁移输入。
- `content/lesson-registry.ts`：只读课程注册表和查询函数。
- `lib/execution/authored-trace.ts`：可取消的预设轨迹异步生成器。
- `lib/progress/types.ts`：进度快照、课程状态和仓储接口。
- `lib/progress/local-progress-repository.ts`：本地存储实现及损坏数据恢复。
- `lib/progress/browser-progress-repository.ts`：隔离 `window.localStorage` 的浏览器入口。
- `tests/curriculum/validate.test.ts`：目录和课程规格校验测试。
- `tests/curriculum/catalog.test.ts`：10 阶段、80 知识点和项目映射测试。
- `tests/curriculum/registry.test.ts`：现有课程迁移和定向反馈测试。
- `tests/curriculum/view-model.test.ts`：侧边栏计数与状态测试。
- `tests/execution/authored-trace.test.ts`：运行轨迹顺序和取消测试。
- `tests/progress/local-progress-repository.test.ts`：保存、恢复和损坏数据测试。
- `scripts/validate-curriculum.ts`：可由 npm 和持续集成调用的课程校验入口。

### 修改

- `package.json`：增加 tsx、测试脚本和课程校验脚本。
- `package-lock.json`：记录 tsx 依赖。
- `app/learning-studio.tsx:3-178`：删除内联类型、课程、路线和延时运行逻辑，改用新模块。
- `app/learning-studio.tsx:199-352`：使用目录进度、定向错误反馈、课程版本和进度保存。
- `app/globals.css:51-52`：让进度条宽度读取 CSS 自定义属性。
- `docs/PRODUCT.md`：记录 10 阶段目录、题库目标和首期进度行为。
- `docs/ARTICHECTURE.md`：记录课程、执行和进度的新边界。
- `session-handoff.md`：记录阶段 1 的验证结果和后续计划。

## 任务 1：建立 TypeScript 测试入口和课程核心类型

**文件：**
- 修改：`package.json:5-24`
- 修改：`package-lock.json`
- 创建：`lib/curriculum/types.ts`
- 创建：`tests/curriculum/validate.test.ts`

- [ ] **步骤 1：安装只用于测试和脚本执行的 tsx**

运行：

```bash
npm install --save-dev tsx
```

预期：`package.json` 的 `devDependencies` 出现 `tsx`，`package-lock.json` 更新，无安装错误。

- [ ] **步骤 2：加入测试脚本**

将 `package.json` 的 scripts 改为：

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "tsx --test tests/**/*.test.ts",
    "test:curriculum": "tsx --test tests/curriculum/**/*.test.ts",
    "validate:curriculum": "tsx scripts/validate-curriculum.ts"
  }
}
```

- [ ] **步骤 3：编写引用尚不存在类型的失败测试**

创建 `tests/curriculum/validate.test.ts`：

```ts
import assert from "node:assert/strict";
import test from "node:test";

import type { LessonSpec } from "../../lib/curriculum/types";
import { validateLessonSpec } from "../../lib/curriculum/validate";

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
```

- [ ] **步骤 4：运行测试并确认因模块不存在而失败**

运行：

```bash
npm run test:curriculum
```

预期：FAIL，并包含 `Cannot find module '../../lib/curriculum/types'` 或 `Cannot find module '../../lib/curriculum/validate'`。

- [ ] **步骤 5：创建课程公共类型**

创建 `lib/curriculum/types.ts`：

```ts
export type StageId =
  | "runtime-cli"
  | "modules-packages"
  | "async-events"
  | "files-streams"
  | "http-foundations"
  | "api-design"
  | "process-concurrency"
  | "realtime"
  | "testing-security"
  | "diagnostics-production";

export type LessonKind = "knowledge" | "stage-project" | "final-project";
export type LessonStatus = "published" | "planned";
export type QuestionType = "prediction" | "diagnosis" | "transfer";
export type SourceType = "official" | "engineering-extension";

export type CatalogLesson = {
  id: string;
  title: string;
  order: number;
  kind: LessonKind;
  status: LessonStatus;
};

export type CurriculumStage = {
  id: StageId;
  number: number;
  title: string;
  summary: string;
  lessons: readonly CatalogLesson[];
  project: CatalogLesson;
};

export type LessonSource = {
  type: SourceType;
  title: string;
  url: string;
  verifiedAt: string;
};

export type AnswerOption = {
  id: string;
  label: string;
  detail: string;
  feedback: string;
};

export type LessonQuestion = {
  id: string;
  type: QuestionType;
  prompt: string;
  options: AnswerOption[];
  answerId: string;
  correctExplanation: string;
};

export type RunnerFrame = {
  activeLane: number;
  laneValues: string[];
  log: string[];
  note: string;
  delayMs: number;
};

export type AuthoredTraceExecution = {
  mode: "authored-trace";
  visualizer: "lane-flow";
  lanes: string[];
  frames: RunnerFrame[];
};

export type LessonSpec = {
  id: string;
  stageId: StageId;
  kind: LessonKind;
  eyebrow: string;
  title: string;
  durationMinutes: number;
  difficulty: "基础" | "进阶";
  nodeVersion: string;
  objectives: string[];
  prerequisites: string[];
  concept: string;
  points: string[];
  memoryHook: string;
  files: { name: string; code: string }[];
  entryFile: string;
  questions: LessonQuestion[];
  execution: AuthoredTraceExecution;
  summary: string[];
  sources: LessonSource[];
};
```

- [ ] **步骤 6：实现最小课程规格校验器**

创建 `lib/curriculum/validate.ts`：

```ts
import type { CurriculumStage, LessonSpec } from "./types";

export function validateLessonSpec(lesson: LessonSpec): string[] {
  const errors: string[] = [];

  if (lesson.questions.length === 0) errors.push(`课程 ${lesson.id} 没有题目`);
  if (lesson.sources.length === 0) errors.push(`课程 ${lesson.id} 没有来源`);
  if (!lesson.files.some((file) => file.name === lesson.entryFile)) {
    errors.push(`课程 ${lesson.id} 缺少入口文件 ${lesson.entryFile}`);
  }

  for (const question of lesson.questions) {
    if (!question.options.some((option) => option.id === question.answerId)) {
      errors.push(`课程 ${lesson.id} 的题目 ${question.id} 缺少正确答案选项 ${question.answerId}`);
    }
    for (const option of question.options) {
      if (option.feedback.trim() === "") {
        errors.push(`课程 ${lesson.id} 的题目 ${question.id} 选项 ${option.id} 缺少定向反馈`);
      }
    }
  }

  return errors;
}

export function validateCatalog(stages: readonly CurriculumStage[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();

  if (stages.length !== 10) errors.push(`课程目录应有 10 个阶段，实际为 ${stages.length}`);

  stages.forEach((stage, index) => {
    if (stage.number !== index + 1) errors.push(`阶段 ${stage.id} 的编号应为 ${index + 1}`);
    if (stage.lessons.length !== 8) errors.push(`阶段 ${stage.id} 应有 8 个知识点`);
    for (const item of [...stage.lessons, stage.project]) {
      if (ids.has(item.id)) errors.push(`课程 ID 重复：${item.id}`);
      ids.add(item.id);
    }
  });

  return errors;
}
```

- [ ] **步骤 7：运行测试并确认通过**

运行：

```bash
npm run test:curriculum
```

预期：2 个测试 PASS，0 个 FAIL。

- [ ] **步骤 8：提交任务 1**

```bash
git add package.json package-lock.json lib/curriculum/types.ts lib/curriculum/validate.ts tests/curriculum/validate.test.ts
git commit -m "test: 建立课程规格测试基础"
```

## 任务 2：建立 10 阶段和 80 个知识点的课程主目录

**文件：**
- 创建：`content/curriculum.ts`
- 创建：`tests/curriculum/catalog.test.ts`

- [ ] **步骤 1：编写目录约束测试**

创建 `tests/curriculum/catalog.test.ts`：

```ts
import assert from "node:assert/strict";
import test from "node:test";

import { curriculum } from "../../content/curriculum";
import { validateCatalog } from "../../lib/curriculum/validate";

test("课程目录固定为 10 个阶段和 80 个知识点", () => {
  assert.equal(curriculum.length, 10);
  assert.equal(curriculum.flatMap((stage) => stage.lessons).length, 80);
  assert.equal(curriculum.filter((stage) => stage.project.kind === "stage-project").length, 10);
  assert.deepEqual(validateCatalog(curriculum), []);
});

test("当前 3 个知识点和 CLI 项目在目录中标记为已发布", () => {
  const published = curriculum.flatMap((stage) => [...stage.lessons, stage.project])
    .filter((item) => item.status === "published")
    .map((item) => item.id);

  assert.deepEqual(published, [
    "modules-require-cache",
    "event-loop-order",
    "stream-backpressure",
    "project-cli-log-analyzer"
  ]);
});
```

- [ ] **步骤 2：运行目录测试并确认失败**

运行：

```bash
npx tsx --test tests/curriculum/catalog.test.ts
```

预期：FAIL，并包含 `Cannot find module '../../content/curriculum'`。

- [ ] **步骤 3：创建完整课程主目录**

创建 `content/curriculum.ts`。使用下面的辅助函数和固定标题；除明确列出的 4 项外，其余状态全部为 `planned`：

```ts
import type { CatalogLesson, CurriculumStage, StageId } from "../lib/curriculum/types";

const publishedIds = new Set([
  "modules-require-cache",
  "event-loop-order",
  "stream-backpressure",
  "project-cli-log-analyzer"
]);

const lesson = (id: string, title: string, order: number): CatalogLesson => ({
  id,
  title,
  order,
  kind: "knowledge",
  status: publishedIds.has(id) ? "published" : "planned"
});

const project = (id: string, title: string): CatalogLesson => ({
  id,
  title,
  order: 9,
  kind: "stage-project",
  status: publishedIds.has(id) ? "published" : "planned"
});

const stage = (
  id: StageId,
  number: number,
  title: string,
  summary: string,
  entries: readonly [string, string][],
  projectEntry: readonly [string, string]
): CurriculumStage => ({
  id,
  number,
  title,
  summary,
  lessons: entries.map(([lessonId, lessonTitle], index) => lesson(lessonId, lessonTitle, index + 1)),
  project: project(projectEntry[0], projectEntry[1])
});

export const curriculum = [
  stage("runtime-cli", 1, "运行时与命令行", "认识 Node.js", [
    ["runtime-introduction", "Node.js 运行时"],
    ["runtime-browser-differences", "Node.js 与浏览器的差异"],
    ["runtime-v8", "V8 与运行过程"],
    ["runtime-lts", "版本与 LTS"],
    ["cli-run-scripts", "执行 Node.js 脚本"],
    ["cli-repl", "使用 REPL"],
    ["cli-process-arguments", "process 与命令行参数"],
    ["cli-env-console", "环境变量与终端输出"]
  ], ["project-cli-system-inspector", "CLI 系统信息探测器"]),
  stage("modules-packages", 2, "模块、包与 TypeScript", "组织可维护代码", [
    ["modules-esm", "ESM 导入导出"],
    ["modules-resolution", "模块解析"],
    ["modules-package-type", "package.json 与 type"],
    ["modules-node-prefix", "内置模块的 node: 前缀"],
    ["packages-dependency-types", "npm 与依赖类型"],
    ["packages-semver-scripts", "语义化版本和 npm scripts"],
    ["modules-require-cache", "CommonJS 与 require 缓存"],
    ["typescript-node", "Node.js 中的 TypeScript"]
  ], ["project-dependency-inspector", "依赖与配置检查器"]),
  stage("async-events", 3, "异步运行时与事件", "建立事件循环心智模型", [
    ["async-callbacks", "回调模式"],
    ["async-promises", "Promise"],
    ["async-await", "async/await"],
    ["async-error-propagation", "异步错误传播"],
    ["event-loop-order", "事件循环阶段"],
    ["async-microtasks-nexttick", "微任务与 process.nextTick"],
    ["async-immediate-timers", "setImmediate 与计时器"],
    ["events-emitter-abort", "EventEmitter 与任务取消"]
  ], ["project-task-scheduler", "并发任务调度器"]),
  stage("files-streams", 4, "文件、Buffer 与 Stream", "高效处理本地数据", [
    ["files-path-url", "path 与文件 URL"],
    ["files-promises", "fs/promises"],
    ["files-directories-stats", "目录和文件元数据"],
    ["files-watch", "文件监听"],
    ["buffer-encoding", "Buffer 与字符编码"],
    ["streams-readable", "Readable Stream"],
    ["streams-writable-transform", "Writable 与 Transform Stream"],
    ["stream-backpressure", "pipe 与背压"]
  ], ["project-cli-log-analyzer", "CLI 日志分析器"]),
  stage("http-foundations", 5, "HTTP 基础", "理解一次网络事务", [
    ["http-transaction", "HTTP 事务生命周期"],
    ["http-create-server", "创建 Server"],
    ["http-request", "请求对象"],
    ["http-response", "响应对象"],
    ["http-headers-status", "Header 与状态码"],
    ["http-routing-query", "路由和查询参数"],
    ["http-request-body", "请求体与流式解析"],
    ["http-streaming-fetch", "流式响应与 Fetch"]
  ], ["project-static-file-server", "流式静态文件服务器"]),
  stage("api-design", 6, "API 与服务设计", "构建可靠后端接口", [
    ["api-rest-modeling", "REST 资源建模"],
    ["api-input-validation", "输入验证"],
    ["api-error-model", "统一错误模型"],
    ["api-config-boundary", "配置边界"],
    ["api-structured-logging", "结构化日志"],
    ["api-timeout", "超时控制"],
    ["api-abort-signal", "AbortSignal"],
    ["api-health-shutdown", "健康检查与优雅关闭"]
  ], ["project-task-rest-api", "任务管理 REST API"]),
  stage("process-concurrency", 7, "进程与并发", "突破单主线程边界", [
    ["concurrency-blocking-loop", "阻塞事件循环"],
    ["concurrency-libuv-pool", "libuv 线程池"],
    ["concurrency-child-process", "child_process"],
    ["concurrency-worker-threads", "worker_threads"],
    ["concurrency-ipc", "进程间消息传递"],
    ["concurrency-shared-memory", "共享内存边界"],
    ["concurrency-cluster", "Cluster"],
    ["concurrency-model-choice", "并发模型选择"]
  ], ["project-worker-report", "Worker Pool 报表生成器"]),
  stage("realtime", 8, "实时通信", "把服务变成实时系统", [
    ["realtime-polling", "轮询与长轮询"],
    ["realtime-sse", "SSE"],
    ["realtime-websocket-handshake", "WebSocket 握手"],
    ["realtime-connection-lifecycle", "连接生命周期"],
    ["realtime-heartbeat", "心跳与超时"],
    ["realtime-broadcast", "消息广播"],
    ["realtime-backpressure", "实时流量背压"],
    ["realtime-recovery", "断线恢复与幂等处理"]
  ], ["project-realtime-notifications", "实时任务通知服务"]),
  stage("testing-security", 9, "测试与安全", "用证据保证正确性", [
    ["testing-node-test", "node:test"],
    ["testing-assertions", "断言"],
    ["testing-lifecycle", "测试生命周期"],
    ["testing-mocking", "Mock"],
    ["testing-coverage", "代码覆盖率"],
    ["testing-integration", "集成测试"],
    ["security-permissions-secrets", "权限与密钥边界"],
    ["security-dependencies-web", "依赖和 Web 安全实践"]
  ], ["project-tested-auth", "经过测试的鉴权服务"]),
  stage("diagnostics-production", 10, "诊断与生产工程", "让服务可观测、可上线", [
    ["diagnostics-inspector", "Inspector 调试"],
    ["diagnostics-cpu-profile", "CPU Profiling"],
    ["diagnostics-heap-snapshot", "Heap Snapshot"],
    ["diagnostics-gc-tracing", "GC 追踪"],
    ["diagnostics-flame-graphs", "火焰图"],
    ["diagnostics-performance-baseline", "性能基线"],
    ["production-config-observability", "生产配置与可观测性"],
    ["production-release-incident", "发布与故障检查流程"]
  ], ["project-production-diagnostics", "生产故障诊断实验室"])
] as const satisfies readonly CurriculumStage[];
```

- [ ] **步骤 4：运行测试并确认通过**

运行：

```bash
npx tsx --test tests/curriculum/catalog.test.ts
```

预期：2 个测试 PASS，目录包含 10 个阶段、80 个知识点和 10 个项目。

- [ ] **步骤 5：提交任务 2**

```bash
git add content/curriculum.ts tests/curriculum/catalog.test.ts
git commit -m "feat: 建立完整 Node.js 课程目录"
```

## 任务 3：迁移现有课程并建立只读注册表

**文件：**
- 创建：`content/legacy-lessons.ts`
- 创建：`content/lesson-registry.ts`
- 创建：`tests/curriculum/registry.test.ts`
- 修改：`app/learning-studio.tsx:5-127`

- [ ] **步骤 1：编写注册表失败测试**

创建 `tests/curriculum/registry.test.ts`：

```ts
import assert from "node:assert/strict";
import test from "node:test";

import { getLesson, publishedLessons } from "../../content/lesson-registry";
import { validateLessonSpec } from "../../lib/curriculum/validate";

test("注册表包含现有 3 个知识点和 1 个项目", () => {
  assert.deepEqual(publishedLessons.map((lesson) => lesson.id), [
    "modules-require-cache",
    "event-loop-order",
    "stream-backpressure",
    "project-cli-log-analyzer"
  ]);
});

test("每个已发布课程通过规格校验并提供定向错误反馈", () => {
  for (const lesson of publishedLessons) {
    assert.deepEqual(validateLessonSpec(lesson), []);
    for (const question of lesson.questions) {
      assert.ok(question.options.every((option) => option.feedback.length > 0));
    }
  }
});

test("按 ID 查询课程，未知 ID 返回 undefined", () => {
  assert.equal(getLesson("event-loop-order")?.title, "读懂 Event Loop 执行顺序");
  assert.equal(getLesson("missing"), undefined);
});
```

- [ ] **步骤 2：运行测试并确认注册表不存在**

运行：

```bash
npx tsx --test tests/curriculum/registry.test.ts
```

预期：FAIL，并包含 `Cannot find module '../../content/lesson-registry'`。

- [ ] **步骤 3：机械迁移现有 4 个案例数据**

把 `app/learning-studio.tsx:5-127` 移到 `content/legacy-lessons.ts`，不修改案例的讲解、代码、选项、帧和总结文本。只做以下三个语法变更：

```ts
export type LegacyRunnerFrame = {
  activeLane: number;
  laneValues: string[];
  log: string[];
  note: string;
};

export type LegacyLesson = {
  id: string;
  eyebrow: string;
  title: string;
  duration: string;
  concept: string;
  points: string[];
  code: string;
  question: string;
  options: { id: string; label: string; detail: string }[];
  answer: string;
  lanes: string[];
  frames: LegacyRunnerFrame[];
  summary: string[];
  project?: boolean;
};
```

紧接类型定义，把 `app/learning-studio.tsx:29-127` 的数组原文移动到新文件，并只把声明行改为 `export const legacyLessons: LegacyLesson[] = [`。移动完成后，`app/learning-studio.tsx` 中不得再出现 `type Lesson`、`type RunnerFrame` 或 `const lessons`。

- [ ] **步骤 4：用确定的元数据和反馈适配为新课程规格**

创建 `content/lesson-registry.ts`：

```ts
import type { LessonSpec, StageId } from "../lib/curriculum/types";
import { legacyLessons, type LegacyLesson } from "./legacy-lessons";

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

export const publishedLessons = legacyLessons.map(migrateLesson) satisfies LessonSpec[];
const lessonById = new Map(publishedLessons.map((lesson) => [lesson.id, lesson]));

export function getLesson(id: string): LessonSpec | undefined {
  return lessonById.get(id);
}
```

- [ ] **步骤 5：运行注册表和课程校验测试**

运行：

```bash
npm run test:curriculum
```

预期：注册表、目录和规格测试全部 PASS。

- [ ] **步骤 6：删除组件中的内联类型和课程数组**

删除 `app/learning-studio.tsx:5-127`，在文件顶部加入：

```ts
import { publishedLessons } from "@/content/lesson-registry";
```

把所有局部 `lessons` 引用改为 `publishedLessons`。这一小步只做数据迁移，不改变交互状态。

- [ ] **步骤 7：运行 lint 和 build，确认迁移不改变页面**

运行：

```bash
npm run lint
npm run build
```

预期：两个命令退出码均为 0；首页仍显示 4 个可切换案例。

- [ ] **步骤 8：提交任务 3**

```bash
git add content/legacy-lessons.ts content/lesson-registry.ts app/learning-studio.tsx tests/curriculum/registry.test.ts
git commit -m "refactor: 将现有课程迁移到内容注册表"
```

## 任务 4：建立可取消的预设轨迹运行器

**文件：**
- 创建：`lib/execution/authored-trace.ts`
- 创建：`tests/execution/authored-trace.test.ts`
- 修改：`app/learning-studio.tsx:137-176`

- [ ] **步骤 1：编写轨迹顺序和取消测试**

创建 `tests/execution/authored-trace.test.ts`：

```ts
import assert from "node:assert/strict";
import test from "node:test";

import { streamAuthoredTrace } from "../../lib/execution/authored-trace";
import type { RunnerFrame } from "../../lib/curriculum/types";

const frames: RunnerFrame[] = [
  { activeLane: 0, laneValues: ["一"], log: ["1"], note: "第一步", delayMs: 0 },
  { activeLane: 1, laneValues: ["二"], log: ["1", "2"], note: "第二步", delayMs: 0 }
];

test("按声明顺序产生全部帧", async () => {
  const actual: RunnerFrame[] = [];
  for await (const frame of streamAuthoredTrace(frames)) actual.push(frame);
  assert.deepEqual(actual, frames);
});

test("AbortSignal 取消后不再产生后续帧", async () => {
  const controller = new AbortController();
  const actual: RunnerFrame[] = [];

  for await (const frame of streamAuthoredTrace(frames, controller.signal)) {
    actual.push(frame);
    controller.abort();
  }

  assert.deepEqual(actual, [frames[0]]);
});
```

- [ ] **步骤 2：运行测试并确认模块不存在**

运行：

```bash
npx tsx --test tests/execution/authored-trace.test.ts
```

预期：FAIL，并包含 `Cannot find module '../../lib/execution/authored-trace'`。

- [ ] **步骤 3：实现预设轨迹异步生成器**

创建 `lib/execution/authored-trace.ts`：

```ts
import type { RunnerFrame } from "../curriculum/types";

const wait = (milliseconds: number, signal?: AbortSignal) =>
  new Promise<void>((resolve) => {
    if (signal?.aborted || milliseconds === 0) return resolve();
    const timer = setTimeout(resolve, milliseconds);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      resolve();
    }, { once: true });
  });

export async function* streamAuthoredTrace(
  frames: readonly RunnerFrame[],
  signal?: AbortSignal
): AsyncGenerator<RunnerFrame> {
  for (const frame of frames) {
    if (signal?.aborted) return;
    await wait(frame.delayMs, signal);
    if (signal?.aborted) return;
    yield frame;
  }
}
```

- [ ] **步骤 4：运行测试并确认通过**

运行：

```bash
npx tsx --test tests/execution/authored-trace.test.ts
```

预期：2 个测试 PASS。

- [ ] **步骤 5：用 AbortController 替换 runToken 和组件内 delay**

在 `app/learning-studio.tsx` 中：

```ts
import { streamAuthoredTrace } from "@/lib/execution/authored-trace";

const activeRun = useRef<AbortController | null>(null);

function cancelRun() {
  activeRun.current?.abort();
  activeRun.current = null;
}

async function runLesson() {
  cancelRun();
  const controller = new AbortController();
  activeRun.current = controller;
  setStatus("running");

  let index = 0;
  for await (const nextFrame of streamAuthoredTrace(lesson.execution.frames, controller.signal)) {
    setFrameIndex(index);
    setFrame(nextFrame);
    index += 1;
  }

  if (!controller.signal.aborted) setStatus("success");
}
```

同时把 `frame` 从按索引读取改成 `useState<RunnerFrame | null>(null)`，并在 `openLesson`、组件卸载和下一次运行前调用 `cancelRun()`。不要同时保留 `runToken` 和 `AbortController` 两套取消机制。

- [ ] **步骤 6：运行全部测试、lint 和 build**

运行：

```bash
npm test
npm run lint
npm run build
```

预期：全部退出码为 0；切换课程时旧轨迹不会继续更新新课程界面。

- [ ] **步骤 7：提交任务 4**

```bash
git add lib/execution/authored-trace.ts tests/execution/authored-trace.test.ts app/learning-studio.tsx
git commit -m "refactor: 提取可取消的课程轨迹运行器"
```

## 任务 5：建立本地进度仓储和解锁视图模型

**文件：**
- 创建：`lib/progress/types.ts`
- 创建：`lib/progress/local-progress-repository.ts`
- 创建：`lib/progress/browser-progress-repository.ts`
- 创建：`lib/curriculum/view-model.ts`
- 创建：`tests/progress/local-progress-repository.test.ts`
- 创建：`tests/curriculum/view-model.test.ts`

- [ ] **步骤 1：编写进度保存和损坏数据恢复测试**

创建 `tests/progress/local-progress-repository.test.ts`：

```ts
import assert from "node:assert/strict";
import test from "node:test";

import { createLocalProgressRepository } from "../../lib/progress/local-progress-repository";

class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  get length() { return this.data.size; }
  clear() { this.data.clear(); }
  getItem(key: string) { return this.data.get(key) ?? null; }
  key(index: number) { return [...this.data.keys()][index] ?? null; }
  removeItem(key: string) { this.data.delete(key); }
  setItem(key: string, value: string) { this.data.set(key, value); }
}

test("完成课程后可以恢复进度", () => {
  const repository = createLocalProgressRepository(new MemoryStorage());
  const saved = repository.completeLesson(repository.load(), "event-loop-order");
  assert.deepEqual(saved.completedLessonIds, ["event-loop-order"]);
  assert.deepEqual(repository.load(), saved);
});

test("损坏的本地数据回退到空进度", () => {
  const storage = new MemoryStorage();
  storage.setItem("nodepath.progress.v1", "not-json");
  assert.deepEqual(createLocalProgressRepository(storage).load(), {
    version: 1,
    completedLessonIds: [],
    completedProjectIds: [],
    reviewLessonIds: [],
    updatedAt: null
  });
});
```

- [ ] **步骤 2：编写侧边栏状态测试**

创建 `tests/curriculum/view-model.test.ts`：

```ts
import assert from "node:assert/strict";
import test from "node:test";

import { curriculum } from "../../content/curriculum";
import { buildRoadmap } from "../../lib/curriculum/view-model";

test("阶段展示计划总数和已发布数量", () => {
  const roadmap = buildRoadmap(curriculum, {
    version: 1,
    completedLessonIds: ["modules-require-cache"],
    completedProjectIds: [],
    reviewLessonIds: [],
    updatedAt: null
  });

  assert.equal(roadmap[1].totalLessons, 8);
  assert.equal(roadmap[1].publishedLessons, 1);
  assert.equal(roadmap[1].completedLessons, 1);
  assert.equal(roadmap[1].state, "active");
});
```

- [ ] **步骤 3：运行两个测试并确认失败**

运行：

```bash
npx tsx --test tests/progress/local-progress-repository.test.ts tests/curriculum/view-model.test.ts
```

预期：FAIL，并报告进度仓储和视图模型模块不存在。

- [ ] **步骤 4：实现进度类型和本地仓储**

创建 `lib/progress/types.ts`：

```ts
export type ProgressSnapshot = {
  version: 1;
  completedLessonIds: string[];
  completedProjectIds: string[];
  reviewLessonIds: string[];
  updatedAt: string | null;
};

export type ProgressRepository = {
  load(): ProgressSnapshot;
  completeLesson(snapshot: ProgressSnapshot, lessonId: string): ProgressSnapshot;
  completeProject(snapshot: ProgressSnapshot, projectId: string): ProgressSnapshot;
};

export const emptyProgress = (): ProgressSnapshot => ({
  version: 1,
  completedLessonIds: [],
  completedProjectIds: [],
  reviewLessonIds: [],
  updatedAt: null
});
```

创建 `lib/progress/local-progress-repository.ts`：

```ts
import { emptyProgress, type ProgressRepository, type ProgressSnapshot } from "./types";

const key = "nodepath.progress.v1";
const unique = (values: string[]) => [...new Set(values)];

export function createLocalProgressRepository(storage: Storage): ProgressRepository {
  const save = (snapshot: ProgressSnapshot) => {
    storage.setItem(key, JSON.stringify(snapshot));
    return snapshot;
  };

  return {
    load() {
      try {
        const raw = storage.getItem(key);
        if (!raw) return emptyProgress();
        const parsed = JSON.parse(raw) as ProgressSnapshot;
        if (parsed.version !== 1 || !Array.isArray(parsed.completedLessonIds)) return emptyProgress();
        return parsed;
      } catch {
        return emptyProgress();
      }
    },
    completeLesson(snapshot, lessonId) {
      return save({
        ...snapshot,
        completedLessonIds: unique([...snapshot.completedLessonIds, lessonId]),
        reviewLessonIds: unique([...snapshot.reviewLessonIds, lessonId]),
        updatedAt: new Date().toISOString()
      });
    },
    completeProject(snapshot, projectId) {
      return save({
        ...snapshot,
        completedProjectIds: unique([...snapshot.completedProjectIds, projectId]),
        updatedAt: new Date().toISOString()
      });
    }
  };
}
```

创建 `lib/progress/browser-progress-repository.ts`：

```ts
import { createLocalProgressRepository } from "./local-progress-repository";
import type { ProgressRepository } from "./types";

export function getBrowserProgressRepository(): ProgressRepository {
  return createLocalProgressRepository(window.localStorage);
}
```

- [ ] **步骤 5：实现侧边栏视图模型**

创建 `lib/curriculum/view-model.ts`：

```ts
import type { CurriculumStage } from "./types";
import type { ProgressSnapshot } from "../progress/types";

export type RoadmapStage = {
  id: string;
  number: number;
  title: string;
  totalLessons: number;
  publishedLessons: number;
  completedLessons: number;
  state: "done" | "active" | "locked" | "planned";
  items: { id: string; title: string; status: "published" | "planned" }[];
};

export function buildRoadmap(
  stages: readonly CurriculumStage[],
  progress: ProgressSnapshot
): RoadmapStage[] {
  return stages.map((stage) => {
    const published = stage.lessons.filter((lesson) => lesson.status === "published");
    const completed = published.filter((lesson) => progress.completedLessonIds.includes(lesson.id));
    const state = published.length === 0
      ? "planned"
      : completed.length === published.length
        ? "done"
        : "active";

    return {
      id: stage.id,
      number: stage.number,
      title: stage.title,
      totalLessons: stage.lessons.length,
      publishedLessons: published.length,
      completedLessons: completed.length,
      state,
      items: stage.lessons.map(({ id, title, status }) => ({ id, title, status }))
    };
  });
}
```

说明：在 80 个课程尚未制作完成的阶段，`planned` 表示“内容尚未发布”，不是学习者未满足先修条件。严格的跨阶段解锁将在阶段 01–03 内容全部发布的后续计划中启用，不能把未制作内容伪装成学习者锁定内容。

- [ ] **步骤 6：运行测试并确认通过**

运行：

```bash
npx tsx --test tests/progress/local-progress-repository.test.ts tests/curriculum/view-model.test.ts
```

预期：3 个测试 PASS。

- [ ] **步骤 7：提交任务 5**

```bash
git add lib/progress lib/curriculum/view-model.ts tests/progress tests/curriculum/view-model.test.ts
git commit -m "feat: 增加本地学习进度仓储"
```

## 任务 6：让学习界面消费课程、反馈和真实进度

**文件：**
- 修改：`app/learning-studio.tsx:3-352`
- 修改：`app/globals.css:51-52`

- [ ] **步骤 1：先运行现有测试作为重构基线**

运行：

```bash
npm test
```

预期：所有测试 PASS。若失败，先修复前一任务，不进入 UI 重构。

- [ ] **步骤 2：引入目录、视图模型和进度仓储**

在 `app/learning-studio.tsx` 顶部使用：

```ts
import { useEffect, useMemo, useRef, useState } from "react";

import { curriculum } from "@/content/curriculum";
import { publishedLessons } from "@/content/lesson-registry";
import { buildRoadmap } from "@/lib/curriculum/view-model";
import type { RunnerFrame } from "@/lib/curriculum/types";
import { getBrowserProgressRepository } from "@/lib/progress/browser-progress-repository";
import { emptyProgress, type ProgressSnapshot } from "@/lib/progress/types";
```

组件内增加：

```ts
const [progress, setProgress] = useState<ProgressSnapshot>(emptyProgress);
const roadmap = useMemo(() => buildRoadmap(curriculum, progress), [progress]);

useEffect(() => {
  setProgress(getBrowserProgressRepository().load());
}, []);
```

- [ ] **步骤 3：把固定进度和五阶段路线替换为目录视图模型**

计算：

```ts
const publishedCount = publishedLessons.length;
const completedCount = progress.completedLessonIds.length + progress.completedProjectIds.length;
const progressPercent = publishedCount === 0 ? 0 : Math.round((completedCount / publishedCount) * 100);
```

侧边栏显示 `roadmap` 的 10 个阶段。每个阶段文本使用：

```tsx
<span>{section.publishedLessons} 已发布 / {section.totalLessons} 知识点</span>
```

当 `section.state === "planned"` 时显示“即将推出”，不要显示“锁定”。进度条改为：

```tsx
<div className="progress-track" aria-label={`当前已发布课程进度 ${progressPercent}%`}>
  <span style={{ "--progress": `${progressPercent}%` } as React.CSSProperties} />
</div>
```

将 `app/globals.css` 对应规则改为：

```css
.progress-track span { display: block; width: var(--progress, 0%); height: 100%; background: var(--green); box-shadow: 0 0 10px rgba(159, 232, 112, 0.5); }
```

- [ ] **步骤 4：使用课程问题和定向错误反馈**

当前阶段只展示每课第一道主预测题：

```ts
const question = lesson.questions[0];
const selectedOption = question.options.find((option) => option.id === selected);
```

将所有 `lesson.question`、`lesson.options`、`lesson.answer` 分别改为 `question.prompt`、`question.options`、`question.answerId`。错误提示替换为：

```tsx
{status === "wrong" && selectedOption && (
  <p className="feedback wrong-feedback">{selectedOption.feedback}</p>
)}
```

记忆卡显示 `lesson.memoryHook`，工具栏显示 `Node {lesson.nodeVersion}`，文件名显示 `lesson.entryFile`。删除针对 `event-loop` 的硬编码分支。

- [ ] **步骤 5：课程成功后保存进度**

轨迹成功结束时执行：

```ts
const repository = getBrowserProgressRepository();
setProgress((current) => lesson.kind === "stage-project"
  ? repository.completeProject(current, lesson.id)
  : repository.completeLesson(current, lesson.id));
```

只在轨迹完整结束且没有被取消时保存。答对但立即切换课程不能记为完成。

- [ ] **步骤 6：运行测试、lint 和 build**

运行：

```bash
npm test
npm run lint
npm run build
```

预期：全部退出码为 0，无 hydration 错误；进度初始为 0%，完成课程后更新并在刷新后恢复。

- [ ] **步骤 7：手动检查桌面和移动端**

运行：

```bash
npm run dev
```

检查清单：

- 桌面宽度 1440px 显示 10 阶段，未发布阶段标记“即将推出”。
- 移动宽度 390px 不产生横向页面滚动。
- 三个知识点和项目均可切换、答错、重试并完成。
- 每个错误选项显示与当前课程相关的反馈。
- 运行中切换课程不会出现旧帧。
- 刷新页面后已完成状态和进度仍存在。

- [ ] **步骤 8：提交任务 6**

```bash
git add app/learning-studio.tsx app/globals.css
git commit -m "feat: 用课程目录驱动学习界面和进度"
```

## 任务 7：增加课程校验命令并更新项目文档

**文件：**
- 创建：`scripts/validate-curriculum.ts`
- 修改：`docs/PRODUCT.md`
- 修改：`docs/ARTICHECTURE.md`
- 修改：`session-handoff.md`

- [ ] **步骤 1：创建课程校验脚本**

创建 `scripts/validate-curriculum.ts`：

```ts
import { curriculum } from "../content/curriculum";
import { publishedLessons } from "../content/lesson-registry";
import { validateCatalog, validateLessonSpec } from "../lib/curriculum/validate";

const errors = [
  ...validateCatalog(curriculum),
  ...publishedLessons.flatMap(validateLessonSpec)
];

if (errors.length > 0) {
  for (const error of errors) console.error(`课程校验失败：${error}`);
  process.exitCode = 1;
} else {
  console.log(`课程校验通过：${curriculum.length} 个阶段，${publishedLessons.length} 个已发布案例。`);
}
```

- [ ] **步骤 2：运行课程校验**

运行：

```bash
npm run validate:curriculum
```

预期输出：

```text
课程校验通过：10 个阶段，4 个已发布案例。
```

- [ ] **步骤 3：更新产品文档**

在 `docs/PRODUCT.md` 中：

- 把旧五阶段路线替换为规格中的十阶段路线。
- 明确目录已有 80 个计划知识点，当前仅 4 个案例已发布。
- 记录普通课程采用 authored trace，沙箱属于后续独立计划。
- 记录进度当前存于浏览器，清理站点数据会清除进度。

- [ ] **步骤 4：更新架构文档**

在 `docs/ARTICHECTURE.md` 中加入：

```text
content/curriculum.ts -> 课程主目录
content/lesson-registry.ts -> 已发布课程注册表
lib/curriculum/* -> 类型、校验和视图模型
lib/execution/authored-trace.ts -> 预设轨迹执行适配器
lib/progress/* -> 与 UI 解耦的本地进度仓储
```

同时删除“全部课程数据位于 `app/learning-studio.tsx`”的旧描述。

- [ ] **步骤 5：更新会话交接**

在 `session-handoff.md` 记录：

- 新增的目录、注册表、验证命令和进度仓储。
- 当前只发布 4 个案例，其他目录项为 `planned`。
- 下一份计划是阶段 01–03 的完整内容和题库。
- 本任务最终验证命令与结果。

- [ ] **步骤 6：运行文档和代码检查**

运行：

```bash
npm run validate:curriculum
npm test
npm run lint
npm run build
git diff --check
```

预期：所有命令退出码为 0，课程校验输出 10 个阶段和 4 个已发布案例。

- [ ] **步骤 7：提交任务 7**

```bash
git add scripts/validate-curriculum.ts docs/PRODUCT.md docs/ARTICHECTURE.md session-handoff.md
git commit -m "docs: 记录课程平台基础架构"
```

## 任务 8：阶段 1 总体验收

**文件：**
- 不新增文件；仅修复本计划范围内的验证问题。

- [ ] **步骤 1：检查工作区和提交边界**

运行：

```bash
git status --short
git log --oneline -8
```

预期：只保留用户已有的未跟踪 `.superpowers/` 视觉原型目录；本计划实现文件均已提交，提交历史包含任务 1–7 的小提交。

- [ ] **步骤 2：运行完整自动验证**

运行：

```bash
npm run validate:curriculum
npm test
npm run lint
npm run build
git diff --check
```

预期：全部退出码为 0。

- [ ] **步骤 3：完成最终人工验收**

运行 `npm run dev`，在桌面和移动宽度各完成以下路径：

```text
打开 Event Loop 课程
  -> 选择错误答案并看到该选项专属反馈
  -> 选择正确答案
  -> 观察 3 帧轨迹和日志
  -> 到达总结
  -> 刷新页面
  -> 进度仍保留
```

然后在运行 Stream 课程的第二帧前切换到模块课程，确认没有迟到帧污染新课程。

- [ ] **步骤 4：记录阶段完成状态**

如果自动验证和人工验收均通过，在 `session-handoff.md` 的验证记录中写入实际命令和结果，并提交：

```bash
git add session-handoff.md
git commit -m "chore: 完成课程基础设施阶段验收"
```

## 阶段 1 完成条件

- 课程主目录包含 10 个阶段、80 个计划知识点和 10 个阶段项目。
- 当前 3 个知识点和 1 个项目从 UI 中迁出，并通过强类型注册表加载。
- 每个现有错误选项拥有与当前课程相关的定向反馈。
- 预设轨迹通过统一、可取消的执行适配器运行。
- 已完成课程可保存到浏览器并在刷新后恢复。
- UI 从目录和进度生成路线，不再硬编码五阶段和 32%。
- `validate:curriculum`、测试、lint、build 和 `git diff --check` 全部通过。

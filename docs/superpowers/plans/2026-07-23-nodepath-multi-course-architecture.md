# NodePath 多课程架构改造实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框语法来跟踪进度；当前复选框已同步为完成状态。

**目标：** 将 NodePath 从固定 Node.js / Next.js 双路线扩展为可承载多学院、多路线、多运行舱的课程架构，并用“前端报错调试路线”发布第一阶段样板。

**架构：** 先在课程类型层引入 `CourseDomain`、更开放的 `CourseId`、`CourseTrack` 元信息和新增可视化 / 题型枚举，再升级课程注册表、课程校验器和首页入口。现有 `/nodejs` 与 `/nextjs` 保持可用，新路线先以 `/frontend-debugging` 显式路由接入共享 `CourseLearningStudio`，避免一次性迁移到动态路由造成回归。

**技术栈：** Next.js 16.2.10 App Router、React 19.2.4、TypeScript、Node.js `node:test`、现有 authored trace 课程模型。

**执行状态：** 已在本地 `main` 落地并完成验证。当前已发布路线为 `/nodejs`、`/nextjs` 和 `/frontend-debugging`；前端报错调试路线已发布阶段 00“浏览器控制台与错误栈”，共 9 个样板案例。后续开发应基于本计划定义的多课程注册表、运行舱表面和题型扩展点继续添加新路线或新阶段。

---

## 参考规格

- `docs/superpowers/specs/2026-07-23-nodepath-programming-learning-blueprint-design.md`
- `AGENTS.md`
- `docs/PRODUCT.md`
- `docs/ARTICHECTURE.md`
- `session-handoff.md`

执行任何应用代码变更前必须阅读本地 Next.js 文档：

- `node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md`

## 文件结构

### 将修改的核心文件

- `lib/curriculum/types.ts`
  - 扩展课程域、课程 ID、题型、代码语言、可视化类型和课程元信息。
- `lib/curriculum/validate.ts`
  - 支持多路线目录校验、运行舱引用校验、新题型校验。
- `content/curriculum-registry.ts`
  - 从双课程常量升级为多课程注册表，保留 `getCourse(courseId)`。
- `content/lesson-registry.ts`
  - 新增 `frontendDebuggingPublishedLessons`，并让 `getLessonsByCourse()` 支持新路线。
- `app/page.tsx`
  - 首页改为从课程注册表渲染课程卡片，同时保留实际学习入口。
- `docs/PRODUCT.md`
  - 记录多学院课程蓝图和前端调试样板路线。
- `docs/ARTICHECTURE.md`
  - 记录多课程注册表、路线元信息和新样板路线边界。
- `session-handoff.md`
  - 更新当前交接状态和下一步建议。

### 将创建的新课程文件

- `content/curriculum-frontend-debugging.ts`
  - 前端报错调试路线目录，先包含第一阶段“浏览器控制台与错误栈”。
- `content/lessons/frontend-debugging/stage-00-console-stack.ts`
  - 第一阶段 8 个知识点和 1 个阶段项目的 LessonSpec。
- `app/frontend-debugging/page.tsx`
  - 前端报错调试路线页面。
- `app/frontend-debugging/learning-studio.tsx`
  - 路线包装组件，复用共享 `CourseLearningStudio`。

### 将新增或修改的测试

- `tests/curriculum/multi-course-architecture.test.ts`
  - 校验学院、路线、课程注册表和新路线基础能力。
- `tests/curriculum/frontend-debugging.test.ts`
  - 校验前端调试路线目录、课程数量、题型和运行舱使用。
- `tests/curriculum/course-registry.test.ts`
  - 更新现有断言，支持第三条路线。
- `tests/curriculum/validate.test.ts`
  - 增加新题型、新语言、新可视化类型的校验案例。
- `tests/learning-studio/course-routing.test.ts`
  - 首页和新路由挂载共享工作台的源码级断言。

## 任务 1：确认框架文档和写入多课程类型测试

**文件：**
- 读取：`node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md`
- 读取：`node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- 读取：`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md`
- 修改：`tests/curriculum/multi-course-architecture.test.ts`
- 修改：`tests/curriculum/validate.test.ts`

- [x] **步骤 1：阅读 Next.js 16 本地文档**

运行：

```bash
sed -n '1,220p' node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md
sed -n '1,220p' node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md
sed -n '1,180p' node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md
```

预期：确认 App Router 页面文件、Server / Client Component 边界和 metadata 规则，不需要修改代码。

- [x] **步骤 2：编写多课程架构失败测试**

创建 `tests/curriculum/multi-course-architecture.test.ts`：

```ts
import assert from "node:assert/strict";
import test from "node:test";

import { allCourses, courseDomains, getCourse, getCoursesByDomain } from "../../content/curriculum-registry";

test("课程注册表暴露多学院元信息", () => {
  assert.ok(courseDomains.some((domain) => domain.id === "frontend"));
  assert.ok(courseDomains.some((domain) => domain.id === "server"));
  assert.ok(courseDomains.some((domain) => domain.id === "ai"));
});

test("课程路线带有学院、状态和运行舱元信息", () => {
  const frontendDebugging = getCourse("frontend-debugging");

  assert.equal(frontendDebugging.domainId, "frontend");
  assert.equal(frontendDebugging.slug, "frontend-debugging");
  assert.equal(frontendDebugging.status, "preview");
  assert.deepEqual(frontendDebugging.runtimeSurfaces, ["console", "micro-browser", "runtime-timeline", "incident-hud"]);
});

test("可以按学院读取课程路线", () => {
  assert.ok(getCoursesByDomain("frontend").some((course) => course.id === "nextjs"));
  assert.ok(getCoursesByDomain("frontend").some((course) => course.id === "frontend-debugging"));
  assert.ok(getCoursesByDomain("server").some((course) => course.id === "nodejs"));
});

test("课程注册表保留现有路线顺序并追加样板路线", () => {
  assert.deepEqual(allCourses.map((course) => course.id), ["nodejs", "nextjs", "frontend-debugging"]);
});
```

- [x] **步骤 3：编写新题型和新可视化类型失败测试**

在 `tests/curriculum/validate.test.ts` 追加：

```ts
test("前端调试题型、代码语言和运行舱类型通过课程规格校验", () => {
  const lesson = cloneLesson();
  lesson.id = "frontend-debugging-stack-first-frame";
  lesson.stageId = "frontend-debugging-console-stack";
  lesson.nodeVersion = "Browser + React 19";
  lesson.questions = [{
    id: "stack-first-frame-trace-debug",
    type: "trace-debug",
    prompt: "错误栈里最先应该查看哪一帧？",
    materialCode: "TypeError: Cannot read properties of undefined",
    materialLanguage: "text",
    difficulty: "beginner",
    estimatedSeconds: 60,
    options: [
      { id: "a", label: "业务组件帧", detail: "第一条项目源码帧", feedback: "正确，先找业务源码里的第一现场。" },
      { id: "b", label: "React 内部帧", detail: "框架调度栈", feedback: "React 内部帧通常不是第一修复点。" }
    ],
    answerId: "a",
    correctExplanation: "调试错误栈时先定位第一条业务源码帧。"
  }];
  lesson.files = [{ name: "ProductList.tsx", code: "export function ProductList() { return null }" }];
  lesson.entryFile = "ProductList.tsx";
  lesson.execution = {
    mode: "authored-trace",
    visualizer: {
      type: "frontend-error-stack",
      title: "错误栈定位",
      nodes: ["Console", "Stack", "Component"]
    },
    lanes: ["Console", "Stack", "Component"],
    frames: [
      { activeLane: 0, laneValues: ["TypeError"], log: ["TypeError"], note: "控制台抛出错误。", delayMs: 0 },
      { activeLane: 1, laneValues: ["ProductList.tsx:12"], log: ["at ProductList"], note: "定位第一条业务源码帧。", delayMs: 0 },
      { activeLane: 2, laneValues: ["props.items"], log: ["items is undefined"], note: "确认数据入口。", delayMs: 0 }
    ]
  };

  assert.deepEqual(validateLessonSpec(lesson), []);
});
```

- [x] **步骤 4：运行测试验证失败**

运行：

```bash
npm test -- tests/curriculum/multi-course-architecture.test.ts tests/curriculum/validate.test.ts
```

预期：FAIL，包含这些错误之一：

```text
Module '"../../content/curriculum-registry"' has no exported member 'courseDomains'
Type '"frontend-debugging-console-stack"' is not assignable to type 'StageId'
Type '"trace-debug"' is not assignable to type 'QuestionType'
Type '"frontend-error-stack"' is not assignable to type 'VisualizerType'
```

- [x] **步骤 5：Commit 失败测试**

```bash
git add tests/curriculum/multi-course-architecture.test.ts tests/curriculum/validate.test.ts
git commit -m "test: 覆盖多课程架构类型契约"
```

## 任务 2：扩展课程核心类型

**文件：**
- 修改：`lib/curriculum/types.ts`
- 测试：`tests/curriculum/multi-course-architecture.test.ts`
- 测试：`tests/curriculum/validate.test.ts`

- [x] **步骤 1：扩展课程域和课程 ID 类型**

在 `lib/curriculum/types.ts` 顶部替换 `CourseId`：

```ts
export type CourseDomainId =
  | "language"
  | "frontend"
  | "network"
  | "server"
  | "android"
  | "ai-application"
  | "ai-agent"
  | "ai-math";

export type CourseId = "nodejs" | "nextjs" | "frontend-debugging";

export type CourseStatus = "published" | "preview" | "planned";

export type RuntimeSurface =
  | "console"
  | "micro-browser"
  | "network-trace"
  | "memory-stack"
  | "runtime-timeline"
  | "incident-hud"
  | "android-system-trace"
  | "agent-trace"
  | "math-graph-lab"
  | "transformer-visualizer";
```

- [x] **步骤 2：扩展 StageId**

在 `StageId` 联合类型末尾追加：

```ts
  // Frontend debugging stages
  | "frontend-debugging-console-stack";
```

- [x] **步骤 3：扩展 QuestionType、CodeLanguage 和 VisualizerType**

在 `QuestionType` 追加：

```ts
  | "trace-debug"
  | "network-debug"
  | "visual-math"
  | "agent-debug"
  | "android-stack-debug";
```

在 `CodeLanguage` 追加：

```ts
  | "c"
  | "cpp"
  | "py"
  | "kt"
  | "java"
  | "html"
  | "css"
  | "math";
```

在 `VisualizerType` 追加：

```ts
  | "frontend-error-stack"
  | "browser-network-debug"
  | "memory-stack"
  | "android-system-trace"
  | "agent-trace"
  | "math-graph-lab"
  | "transformer-attention";
```

- [x] **步骤 4：扩展 CourseSpec**

将 `CourseSpec` 改为：

```ts
export type CourseSpec = {
  id: CourseId;
  domainId: CourseDomainId;
  slug: string;
  title: string;
  description: string;
  icon: string;
  status: CourseStatus;
  runtimeSurfaces: readonly RuntimeSurface[];
  stages: readonly CurriculumStage[];
};
```

- [x] **步骤 5：运行类型相关测试**

运行：

```bash
npm test -- tests/curriculum/multi-course-architecture.test.ts tests/curriculum/validate.test.ts
```

预期：仍 FAIL，但 TypeScript 枚举错误消失，剩余错误集中在注册表未实现或校验器未支持新集合。

- [x] **步骤 6：Commit 类型扩展**

```bash
git add lib/curriculum/types.ts
git commit -m "feat: 扩展多课程核心类型"
```

## 任务 3：升级校验器支持新题型、语言和课程元信息

**文件：**
- 修改：`lib/curriculum/validate.ts`
- 测试：`tests/curriculum/validate.test.ts`

- [x] **步骤 1：扩展支持集合**

在 `lib/curriculum/validate.ts` 中更新集合：

```ts
const supportedQuestionTypes = new Set<QuestionType>([
  "prediction",
  "implementation",
  "diagnosis",
  "repair",
  "completion",
  "execution-order",
  "best-practice",
  "concept-match",
  "equivalent-code",
  "sequence",
  "transfer",
  "trace-debug",
  "network-debug",
  "visual-math",
  "agent-debug",
  "android-stack-debug"
]);

const p1QuestionTypes = new Set<QuestionType>([
  "diagnosis",
  "repair",
  "completion",
  "execution-order",
  "trace-debug",
  "network-debug",
  "visual-math",
  "agent-debug",
  "android-stack-debug"
]);

const supportedCodeLanguages = new Set<CodeLanguage>([
  "js",
  "ts",
  "tsx",
  "json",
  "bash",
  "text",
  "c",
  "cpp",
  "py",
  "kt",
  "java",
  "html",
  "css",
  "math"
]);
```

- [x] **步骤 2：增加 CourseSpec 元信息校验**

在 `validateCourseCatalog(course: CourseSpec)` 开头增加：

```ts
  if (!course.domainId) errors.push(`课程 ${course.id} 缺少学院 domainId`);
  if (!course.slug.trim()) errors.push(`课程 ${course.id} 缺少 slug`);
  if (course.runtimeSurfaces.length === 0) errors.push(`课程 ${course.id} 至少需要一个运行舱`);
```

- [x] **步骤 3：保持 Node.js / Next.js 阶段数特殊规则**

确认 `validateCourseCatalog` 仍保留：

```ts
  if (course.id === "nodejs" && course.stages.length !== 11) {
    errors.push(`课程 ${course.id} 应有 11 个阶段，实际为 ${course.stages.length}`);
  }
  if (course.id === "nextjs" && course.stages.length !== 10) {
    errors.push(`课程 ${course.id} 应有 10 个阶段，实际为 ${course.stages.length}`);
  }
```

不要给 `frontend-debugging` 添加 10 阶段硬约束；样板路线第一轮只发布 1 个阶段。

- [x] **步骤 4：运行校验器测试**

运行：

```bash
npm test -- tests/curriculum/validate.test.ts
```

预期：PASS。

- [x] **步骤 5：Commit 校验器扩展**

```bash
git add lib/curriculum/validate.ts tests/curriculum/validate.test.ts
git commit -m "feat: 支持多课程校验契约"
```

## 任务 4：新增前端报错调试课程目录

**文件：**
- 创建：`content/curriculum-frontend-debugging.ts`
- 修改：`content/curriculum-registry.ts`
- 测试：`tests/curriculum/multi-course-architecture.test.ts`
- 测试：`tests/curriculum/course-registry.test.ts`

- [x] **步骤 1：创建路线目录**

创建 `content/curriculum-frontend-debugging.ts`：

```ts
import type { CurriculumStage } from "../lib/curriculum/types";

export const frontendDebuggingCurriculum = [
  {
    id: "frontend-debugging-console-stack",
    number: 0,
    title: "浏览器控制台与错误栈",
    summary: "学习从控制台错误、调用栈和业务源码帧定位前端故障第一现场。",
    lessons: [
      { id: "frontend-debugging-stack-first-frame", title: "读取错误栈的第一现场", order: 1, kind: "knowledge", status: "published" },
      { id: "frontend-debugging-error-types", title: "区分常见 JavaScript 错误类型", order: 2, kind: "knowledge", status: "published" },
      { id: "frontend-debugging-undefined-property", title: "定位 undefined 属性访问", order: 3, kind: "knowledge", status: "published" },
      { id: "frontend-debugging-promise-rejection", title: "识别异步 Promise 报错", order: 4, kind: "knowledge", status: "published" },
      { id: "frontend-debugging-source-map", title: "从 Source Map 回到源码", order: 5, kind: "knowledge", status: "published" },
      { id: "frontend-debugging-console-structure", title: "用结构化 console 整理调试信息", order: 6, kind: "knowledge", status: "published" },
      { id: "frontend-debugging-data-vs-render", title: "判断数据问题还是渲染问题", order: 7, kind: "knowledge", status: "published" },
      { id: "frontend-debugging-runtime-recovery", title: "观察修复后的运行恢复", order: 8, kind: "knowledge", status: "published" }
    ],
    project: {
      id: "project-frontend-debugging-product-list",
      title: "修复商品列表白屏事故",
      order: 9,
      kind: "stage-project",
      status: "published"
    }
  }
] as const satisfies readonly CurriculumStage[];
```

- [x] **步骤 2：升级课程注册表**

在 `content/curriculum-registry.ts` 中导入新目录并添加学院元信息：

```ts
import type { CourseDomainId, CourseId, CourseSpec } from "../lib/curriculum/types";
import { frontendDebuggingCurriculum } from "./curriculum-frontend-debugging";
```

新增：

```ts
export const courseDomains = [
  { id: "language", title: "语言基础学院", description: "C、C++、Python、Kotlin、Java 等语言路线。" },
  { id: "frontend", title: "前端工程学院", description: "浏览器、React、Next.js、调试和性能。" },
  { id: "network", title: "计算机网络学院", description: "从协议到前后端联调的网络能力。" },
  { id: "server", title: "服务器开发学院", description: "API、数据库、并发、部署和生产诊断。" },
  { id: "android", title: "Android 学院", description: "App、Framework、Binder、HAL 和系统调试。" },
  { id: "ai-application", title: "AI 应用学院", description: "RAG、工具调用、多模态应用和评测。" },
  { id: "ai-agent", title: "AI Agent 学院", description: "Agent 原理、规划、记忆、工具和协作。" },
  { id: "ai-math", title: "AI 数学学院", description: "线性代数、概率、优化和 Transformer 数学基础。" }
] as const satisfies readonly { id: CourseDomainId; title: string; description: string }[];
```

给 `nodejsCourse` 添加：

```ts
  domainId: "server",
  slug: "nodejs",
  status: "published",
  runtimeSurfaces: ["console", "micro-browser", "runtime-timeline", "incident-hud"],
```

给 `nextjsCourse` 添加：

```ts
  domainId: "frontend",
  slug: "nextjs",
  status: "published",
  runtimeSurfaces: ["console", "micro-browser", "runtime-timeline", "incident-hud"],
```

新增：

```ts
export const frontendDebuggingCourse = {
  id: "frontend-debugging",
  domainId: "frontend",
  slug: "frontend-debugging",
  title: "前端报错调试",
  description: "从控制台、错误栈、Network 和恢复验证中训练真实前端故障定位能力。",
  icon: "⌁",
  status: "preview",
  runtimeSurfaces: ["console", "micro-browser", "runtime-timeline", "incident-hud"],
  stages: frontendDebuggingCurriculum
} as const satisfies CourseSpec;
```

将 `allCourses` 改为：

```ts
export const allCourses = [
  nodejsCourse,
  nextjsCourse,
  frontendDebuggingCourse
] as const satisfies readonly CourseSpec[];
```

新增：

```ts
export function getCoursesByDomain(domainId: CourseDomainId): CourseSpec[] {
  return allCourses.filter((course) => course.domainId === domainId);
}
```

- [x] **步骤 3：更新旧课程注册测试**

在 `tests/curriculum/course-registry.test.ts` 中把第一条测试改为：

```ts
test("课程注册中心聚合 Node.js、Next.js 与前端报错调试路线", () => {
  assert.deepEqual(allCourses.map((course) => course.id), ["nodejs", "nextjs", "frontend-debugging"]);
  assert.equal(getCourse("nodejs").stages.length, 11);
  assert.equal(getCourse("nextjs").stages.length, 10);
  assert.equal(getCourse("frontend-debugging").stages.length, 1);
});
```

- [x] **步骤 4：运行注册表测试**

运行：

```bash
npm test -- tests/curriculum/multi-course-architecture.test.ts tests/curriculum/course-registry.test.ts
```

预期：仍可能 FAIL，错误集中在 `getLessonsByCourse("frontend-debugging")` 未支持新路线或新课程 LessonSpec 未创建。

- [x] **步骤 5：Commit 课程目录和注册表**

```bash
git add content/curriculum-frontend-debugging.ts content/curriculum-registry.ts tests/curriculum/course-registry.test.ts
git commit -m "feat: 注册前端调试课程路线"
```

## 任务 5：创建前端调试样板课程内容

**文件：**
- 创建：`content/lessons/frontend-debugging/stage-00-console-stack.ts`
- 修改：`content/lesson-registry.ts`
- 创建：`tests/curriculum/frontend-debugging.test.ts`

- [x] **步骤 1：编写样板路线失败测试**

创建 `tests/curriculum/frontend-debugging.test.ts`：

```ts
import assert from "node:assert/strict";
import test from "node:test";

import { frontendDebuggingPublishedLessons, getLessonsByCourse } from "../../content/lesson-registry";
import { validateLessonSpec } from "../../lib/curriculum/validate";

test("前端报错调试路线第一阶段发布 8 个知识点和 1 个阶段项目", () => {
  assert.equal(frontendDebuggingPublishedLessons.length, 9);
  assert.equal(frontendDebuggingPublishedLessons.filter((lesson) => lesson.kind === "knowledge").length, 8);
  assert.equal(frontendDebuggingPublishedLessons.filter((lesson) => lesson.kind === "stage-project").length, 1);
});

test("前端报错调试路线以诊断和修复为主", () => {
  const questionTypes = new Set(frontendDebuggingPublishedLessons.flatMap((lesson) => lesson.questions.map((question) => question.type)));

  assert.ok(questionTypes.has("diagnosis"));
  assert.ok(questionTypes.has("repair"));
  assert.ok(questionTypes.has("trace-debug"));
});

test("前端报错调试路线使用浏览器、控制台、时间轴和事故 HUD", () => {
  assert.ok(frontendDebuggingPublishedLessons.some((lesson) => lesson.preview));
  assert.ok(frontendDebuggingPublishedLessons.some((lesson) => lesson.incident));
  assert.ok(frontendDebuggingPublishedLessons.every((lesson) => lesson.execution?.visualizer.type === "frontend-error-stack"));
});

test("前端报错调试课程全部通过规格校验并可按课程读取", () => {
  assert.equal(getLessonsByCourse("frontend-debugging").length, 9);
  assert.deepEqual(frontendDebuggingPublishedLessons.flatMap(validateLessonSpec), []);
});
```

- [x] **步骤 2：创建课程工厂辅助函数**

在 `content/lessons/frontend-debugging/stage-00-console-stack.ts` 中先写辅助函数：

```ts
import type { LessonSpec } from "../../../lib/curriculum/types";

type DebugLessonInput = {
  id: string;
  title: string;
  order: number;
  concept: string;
  prompt: string;
  correctLabel: string;
  wrongLabel: string;
  sourceFrame: string;
};

function createDebugLesson(input: DebugLessonInput): LessonSpec {
  return {
    id: input.id,
    stageId: "frontend-debugging-console-stack",
    kind: "knowledge",
    eyebrow: `00.${input.order} · 前端报错调试`,
    title: input.title,
    durationMinutes: 10,
    difficulty: "基础",
    nodeVersion: "Browser + React 19",
    objectives: ["定位前端错误第一现场", "根据控制台材料选择修复方向"],
    prerequisites: ["JavaScript 基础", "浏览器控制台基础"],
    concept: input.concept,
    points: ["先读错误类型", "再找第一条业务源码帧", "最后验证修复后的运行反馈"],
    memoryHook: "错误类型定方向，业务帧定现场，恢复态定结论。",
    files: [{
      name: "ProductPanel.tsx",
      code: "export function ProductPanel({ items }: { items?: string[] }) {\\n  return <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>;\\n}"
    }],
    entryFile: "ProductPanel.tsx",
    questions: [
      {
        id: `${input.id}-diagnosis`,
        type: "diagnosis",
        prompt: input.prompt,
        materialTitle: "控制台错误材料",
        materialCode: `TypeError: Cannot read properties of undefined\\n    at ProductPanel (${input.sourceFrame})\\n    at renderWithHooks (react-dom.development.js:11121)`,
        materialLanguage: "text",
        difficulty: "beginner",
        estimatedSeconds: 70,
        options: [
          { id: "a", label: input.correctLabel, detail: "从业务源码帧定位", feedback: "正确，第一条业务源码帧通常是修复入口。" },
          { id: "b", label: input.wrongLabel, detail: "从框架内部帧定位", feedback: "React 内部帧说明渲染过程，不是本次业务修复入口。" }
        ],
        answerId: "a",
        correctExplanation: "先定位第一条业务源码帧，再回到组件输入和渲染表达式。"
      },
      {
        id: `${input.id}-trace-debug`,
        type: "trace-debug",
        prompt: "时间轴中哪一帧最适合作为修复起点？",
        materialTitle: "运行轨迹",
        materialCode: "Console -> Stack -> Component -> Recovery",
        materialLanguage: "text",
        difficulty: "beginner",
        estimatedSeconds: 60,
        options: [
          { id: "a", label: "Component 帧", detail: "业务组件读取 props", feedback: "正确，Component 帧展示 undefined 数据入口。" },
          { id: "b", label: "Recovery 帧", detail: "恢复后的状态", feedback: "Recovery 用于验证结果，不是定位起点。" }
        ],
        answerId: "a",
        correctExplanation: "定位问题看 Component 帧，验证修复看 Recovery 帧。"
      }
    ],
    execution: {
      mode: "authored-trace",
      visualizer: {
        type: "frontend-error-stack",
        title: "错误栈定位轨迹",
        nodes: ["Console", "Stack", "Component", "Recovery"]
      },
      lanes: ["Console", "Stack", "Component", "Recovery"],
      frames: [
        { activeLane: 0, laneValues: ["TypeError"], log: ["TypeError: Cannot read properties of undefined"], note: "控制台出现运行时错误。", delayMs: 320 },
        { activeLane: 1, laneValues: [input.sourceFrame], log: [`at ProductPanel (${input.sourceFrame})`], note: "读取第一条业务源码帧。", delayMs: 320 },
        { activeLane: 2, laneValues: ["items.map"], log: ["items is undefined"], note: "确认组件直接读取了未兜底的数据。", delayMs: 320 },
        { activeLane: 3, laneValues: ["items ?? []"], log: ["render recovered"], note: "修复后列表可以稳定渲染。", delayMs: 320 }
      ]
    },
    preview: {
      url: "https://nodepath.local/frontend-debugging/products",
      statusCode: 200,
      contentType: "ui-card",
      uiComponentKey: "product-list-recovered",
      headers: {
        "content-type": "text/html; charset=utf-8",
        "x-debug-scenario": input.id
      }
    },
    summary: ["错误类型帮助判断故障类别。", "第一条业务源码帧通常比框架内部帧更有价值。", "修复完成后需要用运行反馈确认恢复。"],
    sources: [{
      type: "official",
      title: "MDN JavaScript error reference",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors",
      verifiedAt: "2026-07-23"
    }]
  };
}
```

- [x] **步骤 3：导出 8 个知识点和 1 个阶段项目**

在同一文件底部导出：

```ts
const knowledgeLessons = [
  createDebugLesson({
    id: "frontend-debugging-stack-first-frame",
    title: "读取错误栈的第一现场",
    order: 1,
    concept: "错误栈不是从上到下全都同等重要，第一条业务源码帧通常就是修复入口。",
    prompt: "这段错误栈应该先查看哪里？",
    correctLabel: "ProductPanel.tsx 的业务源码帧",
    wrongLabel: "react-dom 的 renderWithHooks",
    sourceFrame: "ProductPanel.tsx:2:21"
  }),
  createDebugLesson({
    id: "frontend-debugging-error-types",
    title: "区分常见 JavaScript 错误类型",
    order: 2,
    concept: "SyntaxError、ReferenceError 和 TypeError 指向不同故障层级。",
    prompt: "TypeError 更可能说明什么？",
    correctLabel: "值存在形态不符合当前操作",
    wrongLabel: "构建器无法解析语法",
    sourceFrame: "ProductPanel.tsx:2:21"
  }),
  createDebugLesson({
    id: "frontend-debugging-undefined-property",
    title: "定位 undefined 属性访问",
    order: 3,
    concept: "读取 undefined 的属性通常来自数据未加载、字段名不一致或缺少默认值。",
    prompt: "items.map 报错时第一修复方向是什么？",
    correctLabel: "检查 items 来源和默认值",
    wrongLabel: "重装 React 依赖",
    sourceFrame: "ProductPanel.tsx:2:15"
  }),
  createDebugLesson({
    id: "frontend-debugging-promise-rejection",
    title: "识别异步 Promise 报错",
    order: 4,
    concept: "异步错误需要同时看 Promise 链路和最终渲染点。",
    prompt: "Promise rejection 后白屏应该先查什么？",
    correctLabel: "失败分支是否写入了空数据",
    wrongLabel: "CSS 是否设置了 display none",
    sourceFrame: "ProductPanel.tsx:7:12"
  }),
  createDebugLesson({
    id: "frontend-debugging-source-map",
    title: "从 Source Map 回到源码",
    order: 5,
    concept: "生产错误栈需要通过 Source Map 才能回到可修复的源码位置。",
    prompt: "压缩代码错误最需要哪类材料？",
    correctLabel: "匹配构建版本的 Source Map",
    wrongLabel: "用户浏览器缩放比例",
    sourceFrame: "ProductPanel.tsx:12:9"
  }),
  createDebugLesson({
    id: "frontend-debugging-console-structure",
    title: "用结构化 console 整理调试信息",
    order: 6,
    concept: "console.table 和 console.group 能把散乱日志变成可比较材料。",
    prompt: "调试数组数据结构时哪种输出更清晰？",
    correctLabel: "console.table(items)",
    wrongLabel: "连续 console.log 字符串",
    sourceFrame: "ProductPanel.tsx:4:5"
  }),
  createDebugLesson({
    id: "frontend-debugging-data-vs-render",
    title: "判断数据问题还是渲染问题",
    order: 7,
    concept: "先确认数据是否到达组件，再判断渲染表达式是否正确。",
    prompt: "接口返回正常但组件白屏，下一步看什么？",
    correctLabel: "组件 props 和渲染表达式",
    wrongLabel: "DNS 是否解析成功",
    sourceFrame: "ProductPanel.tsx:2:21"
  }),
  createDebugLesson({
    id: "frontend-debugging-runtime-recovery",
    title: "观察修复后的运行恢复",
    order: 8,
    concept: "调试闭环必须包含恢复验证，而不是只让报错消失。",
    prompt: "修复后最能证明问题结束的反馈是什么？",
    correctLabel: "时间轴和预览都进入恢复态",
    wrongLabel: "删除了所有 console 日志",
    sourceFrame: "ProductPanel.tsx:2:21"
  })
] satisfies LessonSpec[];

const projectLesson: LessonSpec = {
  ...knowledgeLessons[0],
  id: "project-frontend-debugging-product-list",
  kind: "stage-project",
  eyebrow: "00.P · 前端报错调试项目",
  title: "修复商品列表白屏事故",
  durationMinutes: 18,
  brief: "一个商品列表在生产环境白屏，需要根据控制台、错误栈、预览和运行轨迹选择正确修复。",
  questions: [
    ...knowledgeLessons[0].questions,
    {
      id: "project-frontend-debugging-product-list-repair",
      type: "repair",
      prompt: "选择最小可靠修复方案。",
      materialTitle: "故障代码",
      materialCode: "return <ul>{items.map((item) => <li key={item.id}>{item.name}</li>)}</ul>;",
      materialLanguage: "tsx",
      difficulty: "beginner",
      estimatedSeconds: 90,
      options: [
        {
          id: "a",
          label: "给 items 添加空数组兜底",
          detail: "const safeItems = items ?? []",
          feedback: "正确，先保证渲染表达式接收稳定数组。",
          language: "tsx",
          code: "const safeItems = items ?? [];\\nreturn <ul>{safeItems.map((item) => <li key={item.id}>{item.name}</li>)}</ul>;",
          diffLines: [1, 2]
        },
        {
          id: "b",
          label: "隐藏整个列表",
          detail: "return null",
          feedback: "隐藏 UI 会掩盖问题，不能证明数据链路恢复。",
          language: "tsx",
          code: "return null;",
          diffLines: [1]
        }
      ],
      answerId: "a",
      correctExplanation: "最小修复是让渲染表达式面对未加载数据时仍然稳定。"
    }
  ],
  incident: {
    title: "商品列表白屏事故",
    summary: "生产页面因为 undefined 属性访问导致商品列表无法渲染。",
    metrics: [
      { label: "Blank Screen", incident: "78%", patching: "42%", critical: "91%", restored: "0%" },
      { label: "JS Error Rate", incident: "38.5%", patching: "14.2%", critical: "52.1%", restored: "0.2%" },
      { label: "Recovery", incident: "0%", patching: "48%", critical: "0%", restored: "100%" }
    ],
    recoveryMessage: "SYSTEM RESTORED — 100% OPERATIONAL",
    runbook: ["定位第一条业务源码帧", "给不稳定数据入口添加兜底", "验证预览和时间轴恢复"]
  },
  summary: ["生产调试要从用户可见症状回到错误栈。", "修复方案要尽量小，并保留业务输出。", "恢复态需要用预览、日志和指标共同验证。"]
};

export const frontendDebuggingStageZeroLessons = [
  ...knowledgeLessons,
  projectLesson
] satisfies LessonSpec[];
```

- [x] **步骤 4：注册样板课程**

在 `content/lesson-registry.ts` 中导入：

```ts
import { frontendDebuggingStageZeroLessons } from "./lessons/frontend-debugging/stage-00-console-stack";
```

新增导出：

```ts
export const frontendDebuggingPublishedLessons = frontendDebuggingStageZeroLessons satisfies LessonSpec[];
```

将 `getLessonsByCourse` 改为：

```ts
export function getLessonsByCourse(courseId: "nodejs" | "nextjs" | "frontend-debugging"): LessonSpec[] {
  if (courseId === "nextjs") return nextjsPublishedLessons;
  if (courseId === "frontend-debugging") return frontendDebuggingPublishedLessons;
  return publishedLessons;
}
```

- [x] **步骤 5：运行样板课程测试**

运行：

```bash
npm test -- tests/curriculum/frontend-debugging.test.ts tests/curriculum/course-registry.test.ts
```

预期：PASS。

- [x] **步骤 6：Commit 样板课程内容**

```bash
git add content/lessons/frontend-debugging/stage-00-console-stack.ts content/lesson-registry.ts tests/curriculum/frontend-debugging.test.ts
git commit -m "feat: 发布前端调试样板课程"
```

## 任务 6：接入前端调试学习路由和首页课程入口

**文件：**
- 创建：`app/frontend-debugging/page.tsx`
- 创建：`app/frontend-debugging/learning-studio.tsx`
- 修改：`app/page.tsx`
- 修改：`tests/learning-studio/course-routing.test.ts`

- [x] **步骤 1：更新路由失败测试**

在 `tests/learning-studio/course-routing.test.ts` 中更新首页测试：

```ts
test("首页作为课程选择入口并链接到独立学习路径", () => {
  const source = readFileSync("app/page.tsx", "utf8");

  assert.match(source, /allCourses/);
  assert.match(source, /href=\\{`\\/\\$\\{course\\.slug\\}`\\}/);
  assert.match(source, /Node\\.js/);
  assert.match(source, /Next\\.js/);
  assert.match(source, /前端报错调试/);
});
```

追加新路由测试：

```ts
test("前端报错调试路由挂载共享学习工作台", () => {
  const source = readFileSync("app/frontend-debugging/learning-studio.tsx", "utf8");

  assert.match(source, /CourseLearningStudio/);
  assert.match(source, /courseId: "frontend-debugging"/);
});
```

- [x] **步骤 2：创建路线包装组件**

创建 `app/frontend-debugging/learning-studio.tsx`：

```tsx
"use client";

import { CourseLearningStudio } from "../_components/learning-studio";

export function FrontendDebuggingLearningStudio() {
  return (
    <CourseLearningStudio
      config={{
        courseId: "frontend-debugging",
        codeLabel: "前端调试案例代码",
        terminalCommand: "npm run dev",
        routeLabel: "前端报错调试",
        switchCourseHref: "/nextjs",
        switchCourseLabel: "切换到 Next.js"
      }}
    />
  );
}
```

- [x] **步骤 3：创建页面入口**

创建 `app/frontend-debugging/page.tsx`：

```tsx
import { FrontendDebuggingLearningStudio } from "./learning-studio";

export default function FrontendDebuggingPage() {
  return <FrontendDebuggingLearningStudio />;
}
```

- [x] **步骤 4：从课程注册表渲染首页卡片**

将 `app/page.tsx` 的静态课程卡片替换为：

```tsx
import Link from "next/link";
import { AuthStatus } from "@/components/auth/auth-status";
import { KnowledgeNetwork } from "@/components/immersive";
import { allCourses } from "@/content/curriculum-registry";
import { getLessonsByCourse } from "@/content/lesson-registry";

export default function Home() {
  return (
    <div className="course-home">
      <header className="course-hero">
        <div style={{ position: "absolute", top: "16px", right: "24px" }}>
          <AuthStatus />
        </div>
        <div className="course-hero__brand">
          <span className="brand-mark">N<span>_</span></span>
          <span>NodePath</span>
        </div>
        <h1>可视化编程学习平台</h1>
        <p>通过预测、运行和可视化反馈，建立真正可靠的运行时心智模型。选择你的学习路径，开始旅程。</p>
      </header>

      <section className="course-grid" aria-label="学习路径选择">
        {allCourses.map((course) => {
          const publishedCount = getLessonsByCourse(course.id).length;

          return (
            <Link href={`/${course.slug}`} className="course-card" id={`course-${course.id}`} key={course.id}>
              <span className="course-card__glow" aria-hidden="true" />
              <span className="course-card__icon">{course.icon}</span>
              <h2 className="course-card__title">{course.title}</h2>
              <p className="course-card__desc">{course.description}</p>
              <div className="course-card__stats">
                <span>{course.stages.length} 个阶段</span>
                <span>·</span>
                <span>{publishedCount} 个案例</span>
                {course.status === "preview" ? (
                  <>
                    <span>·</span>
                    <span>预览路线</span>
                  </>
                ) : null}
              </div>
              <span className="course-card__cta">开始学习 <span>→</span></span>
            </Link>
          );
        })}
      </section>

      <KnowledgeNetwork />

      <footer className="course-footer">
        <p>先预测，再运行。用可视化建立你的心智模型。</p>
      </footer>
    </div>
  );
}
```

- [x] **步骤 5：运行路由测试**

运行：

```bash
npm test -- tests/learning-studio/course-routing.test.ts
```

预期：PASS。

- [x] **步骤 6：Commit 路由接入**

```bash
git add app/frontend-debugging/page.tsx app/frontend-debugging/learning-studio.tsx app/page.tsx tests/learning-studio/course-routing.test.ts
git commit -m "feat: 接入前端调试学习路线"
```

## 任务 7：更新课程校验和聚合测试

**文件：**
- 修改：`tests/curriculum/course-registry.test.ts`
- 修改：`tests/curriculum/registry.test.ts`
- 修改：`scripts/validate-curriculum.ts`

- [x] **步骤 1：补齐课程注册聚合断言**

在 `tests/curriculum/course-registry.test.ts` 的“每条学习路径可以独立校验目录和已发布课程”测试中追加：

```ts
  assert.equal(getLessonsByCourse("frontend-debugging").length, 9);
  assert.deepEqual(getLessonsByCourse("frontend-debugging").flatMap(validateLessonSpec), []);
```

- [x] **步骤 2：检查 `scripts/validate-curriculum.ts`**

运行：

```bash
sed -n '1,260p' scripts/validate-curriculum.ts
```

如果它只硬编码 Node.js / Next.js 数量，将其改为遍历 `allCourses` 和 `getLessonsByCourse(course.id)`。核心结构应为：

```ts
for (const course of allCourses) {
  errors.push(...validateCourseCatalog(course));
  errors.push(...getLessonsByCourse(course.id).flatMap(validateLessonSpec));
}
```

保留现有 Node.js / Next.js 特定数量提示，但为 `frontend-debugging` 输出 9 个已发布案例。

- [x] **步骤 3：运行课程聚合测试和校验命令**

运行：

```bash
npm test -- tests/curriculum/course-registry.test.ts tests/curriculum/registry.test.ts tests/curriculum/frontend-debugging.test.ts
npm run validate:curriculum
```

预期：PASS，校验输出包含 Node.js、Next.js 和前端报错调试路线。

- [x] **步骤 4：Commit 校验聚合**

```bash
git add tests/curriculum/course-registry.test.ts tests/curriculum/registry.test.ts scripts/validate-curriculum.ts
git commit -m "test: 校验多路线课程聚合"
```

## 任务 8：同步产品、架构和交接文档

**文件：**
- 修改：`docs/PRODUCT.md`
- 修改：`docs/ARTICHECTURE.md`
- 修改：`session-handoff.md`

- [x] **步骤 1：更新 PRODUCT.md**

在 `docs/PRODUCT.md` 的 Product Summary / Current Experience / Curriculum Roadmap 相关位置加入：

```md
NodePath 已开始从 Node.js / Next.js 双路线升级为多学院编程学习平台。全站课程蓝图包含语言基础、前端工程、计算机网络、服务器开发、Android、AI 应用、AI Agent 和 AI 数学八个学院。第一条新增样板路线为“前端报错调试”，先发布“浏览器控制台与错误栈”阶段，用诊断、修复和 trace-debug 题训练真实前端故障定位。
```

并更新已发布案例总数：Node.js 99 + Next.js 90 + 前端调试 9 = 198。

- [x] **步骤 2：更新 ARTICHECTURE.md**

在 `docs/ARTICHECTURE.md` 的 Snapshot / Module Boundaries 中加入：

```md
`content/curriculum-registry.ts` 现在以多学院课程注册表组织路线，`CourseSpec` 包含 `domainId`、`slug`、`status` 和 `runtimeSurfaces`。`frontend-debugging` 是第一条样板路线，目录位于 `content/curriculum-frontend-debugging.ts`，课程内容位于 `content/lessons/frontend-debugging/stage-00-console-stack.ts`。
```

在 Runtime Boundaries 中补充：

```md
前端报错调试路线仍使用 authored trace，不执行真实浏览器脚本或远程请求。Console、MicroBrowser、TraceTimelineScrubber 和 IncidentHUD 都消费课程预设数据。
```

- [x] **步骤 3：更新 session-handoff.md**

追加当前状态：

```md
## 多课程架构改造

- 已批准全站课程蓝图规格：`docs/superpowers/specs/2026-07-23-nodepath-programming-learning-blueprint-design.md`。
- 本轮实现目标：扩展课程类型和注册表，保持 `/nodejs` 与 `/nextjs` 可用，并新增 `/frontend-debugging` 样板路线。
- 验证要求：`npm run validate:curriculum`、`npm test`、`npm run lint`、`npm run build`、`git diff --check`。
```

- [x] **步骤 4：运行文档差异检查**

运行：

```bash
git diff --check -- docs/PRODUCT.md docs/ARTICHECTURE.md session-handoff.md
```

预期：无输出，退出码 0。

- [x] **步骤 5：Commit 文档同步**

```bash
git add docs/PRODUCT.md docs/ARTICHECTURE.md session-handoff.md
git commit -m "docs: 同步多课程架构交接"
```

## 任务 9：全量验证和收尾审查

**文件：**
- 检查：全仓库

- [x] **步骤 1：运行课程校验**

```bash
npm run validate:curriculum
```

预期：PASS，无课程目录、题型、运行舱或题库引用错误。

- [x] **步骤 2：运行测试**

```bash
npm test
```

预期：PASS。

- [x] **步骤 3：运行 lint**

```bash
npm run lint
```

预期：PASS。

- [x] **步骤 4：运行 build**

```bash
npm run build
```

预期：PASS。若 Turbopack 因本地 CSS 服务绑定端口被沙箱拦截，按权限规则请求提升后重跑。

- [x] **步骤 5：运行 diff 空白检查**

```bash
git diff --check
```

预期：无输出，退出码 0。

- [x] **步骤 6：人工检查桌面和移动端**

运行：

```bash
npm run dev
```

打开：

```text
http://localhost:3000/
http://localhost:3000/frontend-debugging
```

检查：

- 首页出现 Node.js、Next.js、前端报错调试三张课程卡。
- `/nodejs` 和 `/nextjs` 原路线仍可进入。
- `/frontend-debugging` 可进入共享学习工作台。
- 答对样板课程后 Console、MicroBrowser、TraceTimelineScrubber 正常反馈。
- 阶段项目触发 IncidentHUD，并在正确修复后进入恢复状态。
- 移动端没有卡片文字溢出、运行舱遮挡或控制条重叠。

- [x] **步骤 7：最终 commit**

如果全量验证过程中有修复，提交：

```bash
git add .
git commit -m "fix: 稳定多课程架构验证"
```

如果没有额外修复，不创建空提交。

## 执行注意事项

- 保留当前工作区中与 Supabase 进度同步相关的用户改动，不要回滚。
- 文档和注释使用中文。
- 不使用 `next/font/google`。
- 不实现真实代码执行沙箱。
- 不新增认证、数据库迁移或生产部署逻辑。
- 每个任务完成后都用 `git status --short` 确认只提交本任务相关文件。

## 计划自检

- 规格覆盖度：本计划覆盖全站蓝图的课程分层、八学院元信息、统一学习模型、运行舱矩阵、架构改造方向、前端报错调试样板路线和验证要求。
- 占位符扫描：计划中没有待填补章节；所有代码变更步骤都给出具体路径、示例代码和验证命令。
- 类型一致性：`CourseDomainId`、`CourseId`、`RuntimeSurface`、`QuestionType`、`VisualizerType`、`frontend-debugging`、`frontend-debugging-console-stack` 在任务 2 定义，并在后续任务保持同名使用。

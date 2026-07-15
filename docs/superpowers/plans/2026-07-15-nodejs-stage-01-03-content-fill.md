# NodePath 阶段 01–03 内容填充实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 将 NodePath 阶段 01–03 的 24 个知识点和 3 个阶段项目全部填充为可学习、可答题、可播放可视化轨迹的真实 Node.js 案例。

**架构：** 保持现有客户端学习室不变，只扩展内容注册表。新增三个阶段内容文件，每个文件导出对应阶段的 `LessonSpec[]`，再由 `content/lesson-registry.ts` 聚合；阶段 04 的现有流与 CLI 日志项目继续通过旧迁移层保留。

**技术栈：** Next.js 16 App Router、TypeScript、Node.js 内置 `node:test`、现有 `LessonSpec`/`AuthoredTraceExecution` 数据模型。

---

## 文件结构

- 创建：`content/lessons/stage-01-runtime-cli.ts`
  - 阶段 01 的 8 个知识点和 1 个项目，覆盖 Node 运行时、浏览器差异、V8、LTS、CLI、REPL、`process.argv`、环境变量与 `console`。
- 创建：`content/lessons/stage-02-modules-packages.ts`
  - 阶段 02 的 8 个知识点和 1 个项目，覆盖 ESM、模块解析、`package.json#type`、`node:` 前缀、依赖类型、SemVer/scripts、CommonJS 缓存、TypeScript。
- 创建：`content/lessons/stage-03-async-events.ts`
  - 阶段 03 的 8 个知识点和 1 个项目，覆盖 callback、Promise、`async/await`、错误传播、事件循环、`process.nextTick`、`setImmediate`、`EventEmitter` 与取消。
- 创建：`content/lessons/lesson-factory.ts`
  - 提供 `createLessonSpec()` 和 `createStageProjectSpec()`，减少 27 个课程对象的重复字段。
- 修改：`content/lesson-registry.ts`
  - 聚合三个阶段内容和阶段 04 的两个现有课程。
- 修改：`content/curriculum.ts`
  - 将阶段 01–03 的 27 个条目标记为 `published`，保留阶段 04 已发布条目。
- 修改：`tests/curriculum/registry.test.ts`
  - 用测试锁定 29 个已发布课程、阶段 01–03 完整可查询、每课可校验。
- 修改：`tests/curriculum/catalog.test.ts`
  - 用测试锁定目录状态：阶段 01–03 全发布，阶段 04 保留两个已发布条目。
- 修改：`tests/curriculum/validate.test.ts`
  - 扩充课程质量校验：每课至少 3 帧、3 条总结、至少 1 个官方来源、代码文件不为空。
- 修改：`docs/PRODUCT.md`、`docs/ARTICHECTURE.md`、`session-handoff.md`
  - 记录内容覆盖范围、来源边界和当前实现状态。

---

### 任务 1：用测试定义阶段 01–03 的完整发布标准

**文件：**
- 修改：`tests/curriculum/registry.test.ts`
- 修改：`tests/curriculum/catalog.test.ts`
- 修改：`tests/curriculum/validate.test.ts`

- [ ] **步骤 1：编写失败的注册表测试**

将 `tests/curriculum/registry.test.ts` 的第一条测试替换为完整发布断言：

```ts
const stageOneToThreeIds = [
  "runtime-introduction",
  "runtime-browser-differences",
  "runtime-v8",
  "runtime-lts",
  "cli-run-scripts",
  "cli-repl",
  "cli-process-arguments",
  "cli-env-console",
  "project-cli-system-inspector",
  "modules-esm",
  "modules-resolution",
  "modules-package-type",
  "modules-node-prefix",
  "packages-dependency-types",
  "packages-semver-scripts",
  "modules-require-cache",
  "typescript-node",
  "project-dependency-inspector",
  "async-callbacks",
  "async-promises",
  "async-await",
  "async-error-propagation",
  "event-loop-order",
  "async-microtasks-nexttick",
  "async-immediate-timers",
  "events-emitter-abort",
  "project-task-scheduler"
];

test("注册表发布阶段 01-03 的全部课程，并保留阶段 04 的两个现有课程", () => {
  assert.deepEqual(
    publishedLessons.map((lesson) => lesson.id),
    stageOneToThreeIds.concat([
      "stream-backpressure",
      "project-cli-log-analyzer"
    ])
  );
});
```

- [ ] **步骤 2：编写失败的课程质量测试**

在 `tests/curriculum/validate.test.ts` 新增质量断言：

```ts
test("课程规格包含可视化轨迹、总结和官方来源", () => {
  for (const lesson of publishedLessons) {
    assert.ok(lesson.files.length >= 1, `${lesson.id} 至少包含一个代码文件`);
    assert.ok(lesson.files.every((file) => file.code.trim().length > 0), `${lesson.id} 的代码文件不能为空`);
    assert.ok(lesson.execution.frames.length >= 3, `${lesson.id} 至少包含 3 个运行帧`);
    assert.ok(lesson.summary.length >= 3, `${lesson.id} 至少包含 3 条总结`);
    assert.ok(lesson.sources.some((source) => source.type === "official"), `${lesson.id} 至少包含一个官方来源`);
  }
});
```

同时从文件顶部导入：

```ts
import { publishedLessons } from "../../content/lesson-registry";
```

- [ ] **步骤 3：编写失败的目录状态测试**

将 `tests/curriculum/catalog.test.ts` 的发布状态测试改为：

```ts
test("阶段 01-03 在目录中全部标记为已发布", () => {
  const firstThreeStages = curriculum.slice(0, 3);
  const firstThreeItems = firstThreeStages.flatMap((stage) => stage.lessons.concat([stage.project]));
  assert.equal(firstThreeItems.length, 27);

  for (const item of firstThreeItems) {
    assert.equal(item.status, "published", `${item.id} 应为 published`);
  }
});

test("阶段 04 保留当前两个已发布课程", () => {
  const stageFourPublished = curriculum[3].lessons.concat([curriculum[3].project])
    .filter((item) => item.status === "published")
    .map((item) => item.id);

  assert.deepEqual(stageFourPublished, [
    "stream-backpressure",
    "project-cli-log-analyzer"
  ]);
});
```

- [ ] **步骤 4：运行测试验证红灯**

运行：

```bash
npm test -- tests/curriculum/registry.test.ts tests/curriculum/catalog.test.ts tests/curriculum/validate.test.ts
```

预期：失败。失败原因应包含发布课程数量仍为 4、阶段 01–03 目录项仍为 `planned`。

- [ ] **步骤 5：Commit 红灯测试**

```bash
git add tests/curriculum/registry.test.ts tests/curriculum/catalog.test.ts tests/curriculum/validate.test.ts
git commit -m "feat-from-codex: 为阶段 01-03 课程填充添加失败测试"
```

---

### 任务 2：实现课程工厂和阶段 01 内容

**文件：**
- 创建：`content/lessons/lesson-factory.ts`
- 创建：`content/lessons/stage-01-runtime-cli.ts`

- [ ] **步骤 1：创建课程工厂**

`content/lessons/lesson-factory.ts` 写入：

```ts
import type { LessonKind, LessonSpec, LessonSource, QuestionType, StageId } from "../../lib/curriculum/types";

type LessonInput = Omit<LessonSpec, "difficulty" | "durationMinutes" | "nodeVersion" | "execution" | "questions" | "sources"> & {
  answer: {
    type?: QuestionType;
    prompt: string;
    options: { id: string; label: string; detail: string; feedback: string }[];
    answerId: string;
    correctExplanation: string;
  };
  execution: Omit<LessonSpec["execution"], "mode" | "visualizer">;
  sources: Omit<LessonSource, "type" | "verifiedAt">[];
  durationMinutes?: number;
  difficulty?: LessonSpec["difficulty"];
  kind?: LessonKind;
};

export function createLessonSpec(input: LessonInput): LessonSpec {
  return {
    id: input.id,
    stageId: input.stageId,
    kind: input.kind ?? "knowledge",
    eyebrow: input.eyebrow,
    title: input.title,
    objectives: input.objectives,
    prerequisites: input.prerequisites,
    concept: input.concept,
    points: input.points,
    memoryHook: input.memoryHook,
    files: input.files,
    entryFile: input.entryFile,
    summary: input.summary,
    difficulty: input.difficulty ?? "基础",
    durationMinutes: input.durationMinutes ?? 9,
    nodeVersion: "24.x LTS",
    questions: [{
      id: `${input.id}-prediction`,
      type: input.answer.type ?? "prediction",
      prompt: input.answer.prompt,
      options: input.answer.options,
      answerId: input.answer.answerId,
      correctExplanation: input.answer.correctExplanation
    }],
    execution: {
      mode: "authored-trace",
      visualizer: "lane-flow",
      lanes: input.execution.lanes,
      frames: input.execution.frames
    },
    sources: input.sources.map((source) => ({
      type: "official",
      verifiedAt: "2026-07-15",
      title: source.title,
      url: source.url
    }))
  };
}
```

- [ ] **步骤 2：创建阶段 01 的 9 个真实案例**

`content/lessons/stage-01-runtime-cli.ts` 导出：

```ts
import type { LessonSpec } from "../../lib/curriculum/types";
import { createLessonSpec } from "./lesson-factory";

export const stageOneRuntimeCliLessons: LessonSpec[] = [
  runtimeIntroductionLesson,
  runtimeBrowserDifferencesLesson,
  runtimeV8Lesson,
  runtimeLtsLesson,
  cliRunScriptsLesson,
  cliReplLesson,
  cliProcessArgumentsLesson,
  cliEnvConsoleLesson,
  projectCliSystemInspectorLesson
];
```

每个对象必须包含：

- `entryFile` 指向 `files` 中真实存在的 `.mjs` 文件。
- `concept` 讲解当前知识点。
- `files[0].code` 是可在本地 Node 环境理解的真实示例。
- `answer.options` 包含 3 个选项和针对性反馈。
- `execution.lanes` 与 `execution.frames` 展示运行时状态变化。
- `summary` 至少 3 条。
- `sources` 指向 Node 官方 Learn 或 API 页面。

- [ ] **步骤 3：阶段 01 内容自检**

运行：

```bash
npm test -- tests/curriculum/validate.test.ts
```

预期：仍失败，因为注册表尚未聚合阶段 01；阶段 01 文件本身通过 TypeScript 静态检查。

- [ ] **步骤 4：Commit 阶段 01 内容**

```bash
git add content/lessons/lesson-factory.ts content/lessons/stage-01-runtime-cli.ts
git commit -m "feat-from-codex: 填充阶段 01 运行时与命令行课程"
```

---

### 任务 3：实现阶段 02 和阶段 03 内容

**文件：**
- 创建：`content/lessons/stage-02-modules-packages.ts`
- 创建：`content/lessons/stage-03-async-events.ts`

- [ ] **步骤 1：创建阶段 02 的 9 个真实案例**

`content/lessons/stage-02-modules-packages.ts` 导出 `stageTwoModulesPackagesLessons`，包含：

```ts
export const stageTwoModulesPackagesLessons: LessonSpec[] = [
  modulesEsmLesson,
  modulesResolutionLesson,
  modulesPackageTypeLesson,
  modulesNodePrefixLesson,
  packagesDependencyTypesLesson,
  packagesSemverScriptsLesson,
  modulesRequireCacheLesson,
  typescriptNodeLesson,
  projectDependencyInspectorLesson
];
```

`modules-require-cache` 用新的 LessonSpec 直接表达，不再依赖旧迁移层。

- [ ] **步骤 2：创建阶段 03 的 9 个真实案例**

`content/lessons/stage-03-async-events.ts` 导出 `stageThreeAsyncEventsLessons`，包含：

```ts
export const stageThreeAsyncEventsLessons: LessonSpec[] = [
  asyncCallbacksLesson,
  asyncPromisesLesson,
  asyncAwaitLesson,
  asyncErrorPropagationLesson,
  eventLoopOrderLesson,
  asyncMicrotasksNexttickLesson,
  asyncImmediateTimersLesson,
  eventsEmitterAbortLesson,
  projectTaskSchedulerLesson
];
```

`event-loop-order` 用新的 LessonSpec 直接表达，不再依赖旧迁移层。

- [ ] **步骤 3：阶段 02/03 内容自检**

运行：

```bash
npm test -- tests/curriculum/validate.test.ts
```

预期：仍失败或部分失败，因为注册表尚未聚合新阶段；如果 TypeScript 编译错误，先修正导入、类型或字符串语法。

- [ ] **步骤 4：Commit 阶段 02/03 内容**

```bash
git add content/lessons/stage-02-modules-packages.ts content/lessons/stage-03-async-events.ts
git commit -m "feat-from-codex: 填充阶段 02-03 模块与异步课程"
```

---

### 任务 4：接入注册表和课程目录状态

**文件：**
- 修改：`content/lesson-registry.ts`
- 修改：`content/curriculum.ts`

- [ ] **步骤 1：聚合新课程并保留阶段 04 旧课程**

将 `content/lesson-registry.ts` 改为：

```ts
import type { LessonSpec } from "../lib/curriculum/types";
import { legacyLessons } from "./legacy-lessons";
import { stageOneRuntimeCliLessons } from "./lessons/stage-01-runtime-cli";
import { stageTwoModulesPackagesLessons } from "./lessons/stage-02-modules-packages";
import { stageThreeAsyncEventsLessons } from "./lessons/stage-03-async-events";

const legacyStageFourLessons = legacyLessons
  .filter((lesson) => lesson.id === "streams" || lesson.id === "stage-project")
  .map(migrateLesson);

export const publishedLessons = [
  stageOneRuntimeCliLessons,
  stageTwoModulesPackagesLessons,
  stageThreeAsyncEventsLessons,
  legacyStageFourLessons
].flat() satisfies LessonSpec[];
```

保留文件中的 `migrateLesson()` 和阶段 04 元数据，让 `stream-backpressure`、`project-cli-log-analyzer` 继续可学。

- [ ] **步骤 2：更新目录发布 ID**

将 `content/curriculum.ts` 的 `publishedIds` 扩展为阶段 01–03 的 27 个 ID 加阶段 04 两个 ID：

```ts
const publishedIds = new Set([
  "runtime-introduction",
  "runtime-browser-differences",
  "runtime-v8",
  "runtime-lts",
  "cli-run-scripts",
  "cli-repl",
  "cli-process-arguments",
  "cli-env-console",
  "project-cli-system-inspector",
  "modules-esm",
  "modules-resolution",
  "modules-package-type",
  "modules-node-prefix",
  "packages-dependency-types",
  "packages-semver-scripts",
  "modules-require-cache",
  "typescript-node",
  "project-dependency-inspector",
  "async-callbacks",
  "async-promises",
  "async-await",
  "async-error-propagation",
  "event-loop-order",
  "async-microtasks-nexttick",
  "async-immediate-timers",
  "events-emitter-abort",
  "project-task-scheduler",
  "stream-backpressure",
  "project-cli-log-analyzer"
]);
```

- [ ] **步骤 3：运行测试验证绿灯**

运行：

```bash
npm test -- tests/curriculum/registry.test.ts tests/curriculum/catalog.test.ts tests/curriculum/validate.test.ts
```

预期：全部通过。

- [ ] **步骤 4：Commit 接入变更**

```bash
git add content/lesson-registry.ts content/curriculum.ts
git commit -m "feat-from-codex: 发布阶段 01-03 课程内容"
```

---

### 任务 5：更新文档并完成整体验证

**文件：**
- 修改：`docs/PRODUCT.md`
- 修改：`docs/ARTICHECTURE.md`
- 修改：`session-handoff.md`

- [ ] **步骤 1：更新产品文档**

在 `docs/PRODUCT.md` 记录：

- 已发布内容从 4 个扩展为 29 个。
- 阶段 01–03 已覆盖完整学习闭环。
- 内容来源以 Node 官方 Learn 与 API 为边界。
- 当前仍是作者编排轨迹，不执行任意用户代码。

- [ ] **步骤 2：更新架构文档**

在 `docs/ARTICHECTURE.md` 记录：

- `content/lessons/lesson-factory.ts` 的职责。
- 三个阶段内容文件的聚合方式。
- 阶段 04 的旧迁移层保留原因。
- 新增质量校验约束。

- [ ] **步骤 3：更新交接文档**

在 `session-handoff.md` 记录：

- 当前分支。
- 已完成阶段 01–03 内容填充。
- 验证命令和结果。
- 下一步建议：阶段 04–10 内容继续按同样模式补齐，或引入真实沙箱运行器。

- [ ] **步骤 4：运行完整验证**

运行：

```bash
npm run validate:curriculum
npm test
npm run lint
npm run build
git diff --check
```

预期：所有命令退出码为 0；`npm run build` 允许出现现有 multiple lockfile warning，但不能出现构建失败。

- [ ] **步骤 5：Commit 文档和验收**

```bash
git add docs/PRODUCT.md docs/ARTICHECTURE.md session-handoff.md docs/superpowers/plans/2026-07-15-nodejs-stage-01-03-content-fill.md
git commit -m "feat-from-codex: 记录阶段 01-03 内容填充验收"
```

---

## 自检记录

- 规格覆盖度：覆盖阶段 01–03 的 24 个知识点、3 个阶段项目、真实代码、答题反馈、可视化轨迹、官方来源、文档同步和验证命令。
- 红旗扫描：计划正文不包含未定语义；每个任务给出精确文件、精确命令和可核对的完成标准。
- 类型一致性：所有内容通过现有 `LessonSpec`、`LessonSource`、`AuthoredTraceExecution` 类型表达，不引入新的运行模式。

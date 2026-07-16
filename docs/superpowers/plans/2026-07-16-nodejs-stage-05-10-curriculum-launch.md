# Node.js 阶段 05-10 课程全量上线实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 将 NodePath 阶段 05-10 的 48 个知识点和 6 个阶段项目全部上线，让 HTTP、API、并发、实时、测试安全、诊断生产工程形成完整学习闭环。

**架构：** 用测试先锁定 54 个新增课程 ID 和 83 个总发布案例；新增一个高级课程内容工厂减少重复；每 2 个阶段一个提交，最后注册到 `publishedLessons` 并更新文档。所有案例继续使用现有 `LessonSpec`、`createLessonSpec()` 和 `authored-trace`，不引入真实代码沙箱。

**技术栈：** TypeScript、Node.js `node:test`、现有课程模型、Next.js 16 App Router。

---

## 文件结构

- 创建：`content/lessons/advanced-lesson-factory.ts`
  - 为阶段 05-10 提供更短的课程创建 helper，内部仍调用 `createLessonSpec()`。
  - 提供 3 帧 trace helper，确保每课都有稳定的可视化运行帧。
- 创建：`content/lessons/stage-05-http-foundations.ts`
  - HTTP 基础 8 个知识点 + 1 个阶段项目。
- 创建：`content/lessons/stage-06-api-design.ts`
  - API 与服务设计 8 个知识点 + 1 个阶段项目。
- 创建：`content/lessons/stage-07-process-concurrency.ts`
  - 进程与并发 8 个知识点 + 1 个阶段项目。
- 创建：`content/lessons/stage-08-realtime.ts`
  - 实时通信 8 个知识点 + 1 个阶段项目。
- 创建：`content/lessons/stage-09-testing-security.ts`
  - 测试与安全 8 个知识点 + 1 个阶段项目。
- 创建：`content/lessons/stage-10-diagnostics-production.ts`
  - 诊断与生产工程 8 个知识点 + 1 个阶段项目。
- 修改：`content/curriculum.ts`
  - 将阶段 05-10 的 54 个课程 ID 加入 `publishedIds`。
- 修改：`content/lesson-registry.ts`
  - 导入阶段 05-10 的课程数组，并加入 `publishedLessons`。
- 修改：`tests/curriculum/catalog.test.ts`
  - 锁定阶段 05-10 全部为 published，阶段 04 仍只保留两个 published。
- 修改：`tests/curriculum/registry.test.ts`
  - 锁定发布顺序、可查询性、规格校验和 83 个发布案例数量。
- 修改：`docs/PRODUCT.md`
  - 记录阶段 05-10 已完整上线。
- 修改：`session-handoff.md`
  - 记录本次内容上线状态和验证结果。

---

## 课程 ID 清单

阶段 05-10 必须上线以下 54 个 ID：

```ts
const stageFiveToTenIds = [
  "http-transaction",
  "http-create-server",
  "http-request",
  "http-response",
  "http-headers-status",
  "http-routing-query",
  "http-request-body",
  "http-streaming-fetch",
  "project-static-file-server",
  "api-rest-modeling",
  "api-input-validation",
  "api-error-model",
  "api-config-boundary",
  "api-structured-logging",
  "api-timeout",
  "api-abort-signal",
  "api-health-shutdown",
  "project-task-rest-api",
  "concurrency-blocking-loop",
  "concurrency-libuv-pool",
  "concurrency-child-process",
  "concurrency-worker-threads",
  "concurrency-ipc",
  "concurrency-shared-memory",
  "concurrency-cluster",
  "concurrency-model-choice",
  "project-worker-report",
  "realtime-polling",
  "realtime-sse",
  "realtime-websocket-handshake",
  "realtime-connection-lifecycle",
  "realtime-heartbeat",
  "realtime-broadcast",
  "realtime-backpressure",
  "realtime-recovery",
  "project-realtime-notifications",
  "testing-node-test",
  "testing-assertions",
  "testing-lifecycle",
  "testing-mocking",
  "testing-coverage",
  "testing-integration",
  "security-permissions-secrets",
  "security-dependencies-web",
  "project-tested-auth",
  "diagnostics-inspector",
  "diagnostics-cpu-profile",
  "diagnostics-heap-snapshot",
  "diagnostics-gc-tracing",
  "diagnostics-flame-graphs",
  "diagnostics-performance-baseline",
  "production-config-observability",
  "production-release-incident",
  "project-production-diagnostics"
] as const;
```

---

### 任务 1：用测试锁住阶段 05-10 上线范围

**文件：**
- 修改：`tests/curriculum/catalog.test.ts`
- 修改：`tests/curriculum/registry.test.ts`

- [ ] **步骤 1：在 registry 测试中加入阶段 05-10 ID 清单**

在 `tests/curriculum/registry.test.ts` 中保留现有 `stageOneToThreeIds`，新增 `stageFiveToTenIds`，内容使用本计划「课程 ID 清单」中的数组。

- [ ] **步骤 2：更新发布顺序测试**

将现有测试名称改为：

```ts
test("注册表发布阶段 01-03、阶段 04 现有案例和阶段 05-10 全部课程", () => {
  assert.deepEqual(
    publishedLessons.map((lesson) => lesson.id),
    stageOneToThreeIds.concat([
      "stream-backpressure",
      "project-cli-log-analyzer"
    ], stageFiveToTenIds)
  );
});
```

- [ ] **步骤 3：新增发布数量测试**

在 `tests/curriculum/registry.test.ts` 中加入：

```ts
test("发布案例数量包含阶段 05-10 的完整 54 个新增案例", () => {
  assert.equal(stageFiveToTenIds.length, 54);
  assert.equal(publishedLessons.length, 83);
});
```

- [ ] **步骤 4：更新可查询性测试**

将「阶段 01-03 的每个课程都可以按 ID 查询」改为：

```ts
test("每个已上线阶段课程都可以按 ID 查询", () => {
  for (const lessonId of stageOneToThreeIds.concat(stageFiveToTenIds)) {
    assert.equal(getLesson(lessonId)?.id, lessonId);
  }
});
```

- [ ] **步骤 5：在 catalog 测试中锁定阶段 05-10 状态**

在 `tests/curriculum/catalog.test.ts` 中新增：

```ts
test("阶段 05-10 在目录中全部标记为已发布", () => {
  const lateStageItems = curriculum
    .slice(4, 10)
    .flatMap((stage) => stage.lessons.concat([stage.project]));

  assert.equal(lateStageItems.length, 54);

  for (const item of lateStageItems) {
    assert.equal(item.status, "published", `${item.id} 应为 published`);
  }
});
```

- [ ] **步骤 6：运行测试验证红灯**

运行：

```bash
npm test -- tests/curriculum/catalog.test.ts tests/curriculum/registry.test.ts
```

预期：失败，至少包含发布数量不是 83、阶段 05-10 ID 未出现在 registry、目录状态仍为 planned。若 `tsx` 在沙箱内因 IPC `listen EPERM` 失败，按权限规范提权重跑。

- [ ] **步骤 7：Commit 红灯测试**

```bash
git add tests/curriculum/catalog.test.ts tests/curriculum/registry.test.ts
git commit -m "feat-from-codex: 为阶段 05-10 课程上线添加失败测试"
```

---

### 任务 2：新增高级课程内容工厂

**文件：**
- 创建：`content/lessons/advanced-lesson-factory.ts`

- [ ] **步骤 1：创建 helper 文件**

创建 `content/lessons/advanced-lesson-factory.ts`：

```ts
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
```

- [ ] **步骤 2：运行类型检查**

运行：

```bash
npx tsc --noEmit
```

预期：通过。

- [ ] **步骤 3：Commit helper**

```bash
git add content/lessons/advanced-lesson-factory.ts
git commit -m "feat-from-codex: 增加高级课程内容工厂"
```

---

### 任务 3：上线阶段 05 和阶段 06

**文件：**
- 创建：`content/lessons/stage-05-http-foundations.ts`
- 创建：`content/lessons/stage-06-api-design.ts`
- 修改：`content/curriculum.ts`
- 修改：`content/lesson-registry.ts`

- [ ] **步骤 1：创建阶段 05 课程文件**

创建 `content/lessons/stage-05-http-foundations.ts`，导出：

```ts
import type { LessonSpec } from "../../lib/curriculum/types";
import { createAdvancedLesson } from "./advanced-lesson-factory";

export const stageFiveHttpFoundationsLessons: LessonSpec[] = [
  // 依次实现 9 个 LessonSpec：
  // http-transaction
  // http-create-server
  // http-request
  // http-response
  // http-headers-status
  // http-routing-query
  // http-request-body
  // http-streaming-fetch
  // project-static-file-server
];
```

每个 `createAdvancedLesson()` 必须使用真实 Node.js HTTP 场景代码。示例边界：

- `http-transaction`：展示 `createServer((request, response) => {})` 中请求进入、处理、响应结束。
- `http-create-server`：展示 `server.listen(3000)` 与请求回调。
- `http-request`：读取 `request.method`、`request.url`、`request.headers`.
- `http-response`：设置 `response.statusCode`、`response.setHeader()`、`response.end()`.
- `http-headers-status`：区分 200、201、404、415。
- `http-routing-query`：使用 `new URL(request.url, "http://localhost")`.
- `http-request-body`：使用 `for await (const chunk of request)` 聚合 JSON。
- `http-streaming-fetch`：使用 `fetch()` 和 `ReadableStream` 语义。
- `project-static-file-server`：用 `createReadStream()` 流式返回静态文件，包含路径安全检查。

官方来源必须优先使用：

- `https://nodejs.org/en/learn/http/anatomy-of-an-http-transaction`
- `https://nodejs.org/api/http.html`
- `https://nodejs.org/en/learn/getting-started/fetch`
- `https://nodejs.org/en/learn/manipulating-files/reading-files-with-nodejs`

- [ ] **步骤 2：创建阶段 06 课程文件**

创建 `content/lessons/stage-06-api-design.ts`，导出：

```ts
import type { LessonSpec } from "../../lib/curriculum/types";
import { createAdvancedLesson } from "./advanced-lesson-factory";

export const stageSixApiDesignLessons: LessonSpec[] = [
  // 依次实现 9 个 LessonSpec：
  // api-rest-modeling
  // api-input-validation
  // api-error-model
  // api-config-boundary
  // api-structured-logging
  // api-timeout
  // api-abort-signal
  // api-health-shutdown
  // project-task-rest-api
];
```

每个案例必须是真实服务设计片段：

- REST 资源命名使用 `/tasks`、`/tasks/:id`。
- 输入验证返回 400，不把无效输入写入状态。
- 统一错误模型返回 `{ error: { code, message } }`。
- 配置从 `process.env` 读取并集中解析。
- 日志输出 JSON 字符串，包含 `requestId`。
- 超时使用 `AbortSignal.timeout()` 或 `setTimeout()` 边界。
- AbortSignal 演示取消下游 fetch。
- 优雅关闭演示 `SIGTERM`、`server.close()`。
- 阶段项目组合任务 API 的路由、校验、错误、健康检查。

官方来源使用 Node.js HTTP、process、AbortController、production/dev 差异等官方文档。

- [ ] **步骤 3：注册阶段 05-06**

修改 `content/curriculum.ts`，把阶段 05 和 06 的 18 个 ID 加入 `publishedIds`。

修改 `content/lesson-registry.ts`：

```ts
import { stageFiveHttpFoundationsLessons } from "./lessons/stage-05-http-foundations";
import { stageSixApiDesignLessons } from "./lessons/stage-06-api-design";
```

并在 `publishedLessons` 的 `.flat()` 源数组中追加这两个数组。

- [ ] **步骤 4：运行阶段性测试**

运行：

```bash
npm test -- tests/curriculum/catalog.test.ts tests/curriculum/registry.test.ts
npm run validate:curriculum
npx tsc --noEmit
```

预期：registry 的 83 总数测试仍失败，因为阶段 07-10 尚未上线；类型检查与 validate 中已上线课程规格应无错误。

- [ ] **步骤 5：Commit 阶段 05-06**

```bash
git add content/curriculum.ts content/lesson-registry.ts content/lessons/stage-05-http-foundations.ts content/lessons/stage-06-api-design.ts
git commit -m "feat-from-codex: 上线 HTTP 与 API 设计课程"
```

---

### 任务 4：上线阶段 07 和阶段 08

**文件：**
- 创建：`content/lessons/stage-07-process-concurrency.ts`
- 创建：`content/lessons/stage-08-realtime.ts`
- 修改：`content/curriculum.ts`
- 修改：`content/lesson-registry.ts`

- [ ] **步骤 1：创建阶段 07 课程文件**

创建 `content/lessons/stage-07-process-concurrency.ts`，导出 `stageSevenProcessConcurrencyLessons`，包含：

- `concurrency-blocking-loop`
- `concurrency-libuv-pool`
- `concurrency-child-process`
- `concurrency-worker-threads`
- `concurrency-ipc`
- `concurrency-shared-memory`
- `concurrency-cluster`
- `concurrency-model-choice`
- `project-worker-report`

官方来源优先使用：

- `https://nodejs.org/en/learn/concurrency/comparing-nodejs-concurrency-models`
- `https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop`
- `https://nodejs.org/api/child_process.html`
- `https://nodejs.org/api/worker_threads.html`
- `https://nodejs.org/api/cluster.html`

- [ ] **步骤 2：创建阶段 08 课程文件**

创建 `content/lessons/stage-08-realtime.ts`，导出 `stageEightRealtimeLessons`，包含：

- `realtime-polling`
- `realtime-sse`
- `realtime-websocket-handshake`
- `realtime-connection-lifecycle`
- `realtime-heartbeat`
- `realtime-broadcast`
- `realtime-backpressure`
- `realtime-recovery`
- `project-realtime-notifications`

官方来源优先使用：

- `https://nodejs.org/en/learn/getting-started/websocket`
- `https://nodejs.org/api/http.html`
- `https://nodejs.org/en/learn/modules/backpressuring-in-streams`

- [ ] **步骤 3：注册阶段 07-08**

将阶段 07 和 08 的 18 个 ID 加入 `content/curriculum.ts` 的 `publishedIds`，并在 `content/lesson-registry.ts` 中导入、追加两个阶段数组。

- [ ] **步骤 4：运行阶段性测试**

运行：

```bash
npm test -- tests/curriculum/catalog.test.ts tests/curriculum/registry.test.ts
npm run validate:curriculum
npx tsc --noEmit
```

预期：registry 的 83 总数测试仍失败，因为阶段 09-10 尚未上线；已上线课程规格无错误。

- [ ] **步骤 5：Commit 阶段 07-08**

```bash
git add content/curriculum.ts content/lesson-registry.ts content/lessons/stage-07-process-concurrency.ts content/lessons/stage-08-realtime.ts
git commit -m "feat-from-codex: 上线并发与实时通信课程"
```

---

### 任务 5：上线阶段 09 和阶段 10

**文件：**
- 创建：`content/lessons/stage-09-testing-security.ts`
- 创建：`content/lessons/stage-10-diagnostics-production.ts`
- 修改：`content/curriculum.ts`
- 修改：`content/lesson-registry.ts`

- [ ] **步骤 1：创建阶段 09 课程文件**

创建 `content/lessons/stage-09-testing-security.ts`，导出 `stageNineTestingSecurityLessons`，包含：

- `testing-node-test`
- `testing-assertions`
- `testing-lifecycle`
- `testing-mocking`
- `testing-coverage`
- `testing-integration`
- `security-permissions-secrets`
- `security-dependencies-web`
- `project-tested-auth`

官方来源优先使用：

- `https://nodejs.org/en/learn/test-runner/introduction`
- `https://nodejs.org/en/learn/test-runner/using-test-runner`
- `https://nodejs.org/en/learn/test-runner/mocking`
- `https://nodejs.org/en/learn/test-runner/collecting-code-coverage`
- `https://nodejs.org/en/learn/getting-started/security-best-practices`

- [ ] **步骤 2：创建阶段 10 课程文件**

创建 `content/lessons/stage-10-diagnostics-production.ts`，导出 `stageTenDiagnosticsProductionLessons`，包含：

- `diagnostics-inspector`
- `diagnostics-cpu-profile`
- `diagnostics-heap-snapshot`
- `diagnostics-gc-tracing`
- `diagnostics-flame-graphs`
- `diagnostics-performance-baseline`
- `production-config-observability`
- `production-release-incident`
- `project-production-diagnostics`

官方来源优先使用：

- `https://nodejs.org/en/learn/diagnostics/user-journey`
- `https://nodejs.org/en/learn/diagnostics/live-debugging/using-inspector`
- `https://nodejs.org/en/learn/diagnostics/memory/using-heap-snapshot`
- `https://nodejs.org/en/learn/diagnostics/memory/using-gc-traces`
- `https://nodejs.org/en/learn/diagnostics/flame-graphs`
- `https://nodejs.org/en/learn/getting-started/profiling`

- [ ] **步骤 3：注册阶段 09-10**

将阶段 09 和 10 的 18 个 ID 加入 `content/curriculum.ts` 的 `publishedIds`，并在 `content/lesson-registry.ts` 中导入、追加两个阶段数组。

- [ ] **步骤 4：运行完整课程测试**

运行：

```bash
npm test -- tests/curriculum/catalog.test.ts tests/curriculum/registry.test.ts
npm run validate:curriculum
npx tsc --noEmit
```

预期：

- 课程 registry 测试通过。
- catalog 测试通过。
- `npm run validate:curriculum` 输出 `课程校验通过：10 个阶段，83 个已发布案例。`
- TypeScript 通过。

- [ ] **步骤 5：Commit 阶段 09-10**

```bash
git add content/curriculum.ts content/lesson-registry.ts content/lessons/stage-09-testing-security.ts content/lessons/stage-10-diagnostics-production.ts
git commit -m "feat-from-codex: 上线测试安全与生产诊断课程"
```

---

### 任务 6：文档更新和完整验证

**文件：**
- 修改：`docs/PRODUCT.md`
- 修改：`session-handoff.md`

- [ ] **步骤 1：更新产品文档**

在 `docs/PRODUCT.md` 的课程内容或已实现能力部分记录：

```markdown
- 阶段 05-10 已完整上线，覆盖 HTTP 基础、API 与服务设计、进程与并发、实时通信、测试与安全、诊断与生产工程。
- 已发布案例数量为 83 个，其中阶段 05-10 新增 54 个真实 Node.js 案例。
```

- [ ] **步骤 2：更新交接文档**

在 `session-handoff.md` 中记录：

```markdown
- 当前分支完成阶段 05-10 课程全量上线。
- 新增 `content/lessons/stage-05-http-foundations.ts` 至 `stage-10-diagnostics-production.ts`。
- `npm run validate:curriculum` 当前应输出 `课程校验通过：10 个阶段，83 个已发布案例。`
```

将完整验证结果写入 Validation History。

- [ ] **步骤 3：运行完整验证**

运行：

```bash
npm run validate:curriculum
npm test
npm run lint
npm run build
git diff --check
```

预期全部通过；`npm run build` 允许出现既有 multiple lockfile warning。若 `tsx` IPC 或 Turbopack 端口绑定受沙箱限制失败，按权限规范提权重跑。

- [ ] **步骤 4：Commit 文档和验收**

```bash
git add docs/PRODUCT.md session-handoff.md
git commit -m "feat-from-codex: 记录阶段 05-10 课程上线验收"
```

---

## 质量门槛

每个新增 LessonSpec 必须满足：

- `id` 与 `content/curriculum.ts` 的课程 ID 完全一致。
- `stageId` 与所属阶段一致。
- 阶段项目设置 `kind: "stage-project"`。
- `files` 至少包含 `entryFile`。
- `questions` 至少 1 道，正确答案存在。
- 每个选项 `feedback` 非空。
- `execution.frames` 至少 3 帧，能展示案例运行过程。
- `sources` 至少 1 个官方来源。
- 示例代码必须体现真实 Node.js API 或生产工程场景，不写空泛伪代码。

## 自检记录

- 规格覆盖度：阶段 05-10 的 54 个 ID 均有对应任务。
- 范围控制：阶段 04 仍保留当前两个已发布案例，不在本计划补齐。
- 类型一致性：所有内容继续输出 `LessonSpec[]`，注册到现有 `publishedLessons`。
- 测试策略：先红灯锁定范围，再按阶段逐步让测试转绿，最终 `npm test` 覆盖全部 registry、catalog、validate 测试。

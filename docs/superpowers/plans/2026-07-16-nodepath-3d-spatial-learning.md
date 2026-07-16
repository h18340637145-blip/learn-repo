# NodePath 3D 空间化学习体验实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 将 NodePath 的完整 Node.js 课程升级为「阶段星图 + 重点 3D 实验舱」学习体验，左侧只保留阶段入口，课程运行过程尽可能用 Three.js 空间场景表达。

**架构：** 在课程层新增数据驱动的 `VisualizerSpec`，再用阶段空间 view model 管理阶段入口和本阶段课程节点。前端保留 `LearningStudio` 作为交互宿主，拆出学习空间、运行可视化和 fallback 组件；Three.js 只在 Client Component 和动态加载边界内运行，DOM 面板继续负责阅读、答题、日志和总结。

**技术栈：** Next.js 16 App Router、React 19、TypeScript、Three.js、`@react-three/fiber`、`@react-three/drei`、CSS 响应式布局、Node.js `node:test`、`react-dom/server`。

---

## 文件结构

- 修改：`package.json`
  - 增加 `three`、`@react-three/fiber`、`@react-three/drei`。
- 修改：`package-lock.json`
  - 由 `npm install three @react-three/fiber @react-three/drei` 更新。
- 修改：`lib/curriculum/types.ts`
  - 增加 `VisualizerType`、`VisualizerSpec`，把 `execution.visualizer` 从字符串升级为结构化描述。
- 创建：`lib/curriculum/visualizers.ts`
  - 根据阶段和课程类型生成默认可视化配置。
- 修改：`content/lessons/lesson-factory.ts`
  - 支持课程显式传入 `visualizer`，未传入时自动使用默认配置。
- 修改：`content/lessons/advanced-lesson-factory.ts`
  - 透传或生成重点阶段的主题化 3D 配置。
- 修改：`content/lesson-registry.ts`
  - 旧课程迁移时补齐结构化 `visualizer`。
- 创建：`tests/curriculum/visualizers.test.ts`
  - 测试可视化类型、默认配置和重点阶段映射。
- 创建：`lib/curriculum/stage-space.ts`
  - 生成阶段入口和当前阶段课程节点 view model。
- 创建：`tests/curriculum/stage-space.test.ts`
  - 测试阶段入口只暴露阶段、本阶段课程和阶段项目节点。
- 创建：`components/learning-space/stage-space.tsx`
  - 渲染阶段空间页、课程节点和项目节点。
- 创建：`components/learning-space/stage-sidebar.tsx`
  - 渲染左侧阶段入口，替代展开全部课程。
- 创建：`components/learning-space/index.ts`
  - 统一导出学习空间组件。
- 创建：`components/visualizers/visualizer-fallback.tsx`
  - WebGL 不可用、减少动态效果或移动降级时使用的轻量运行视图。
- 创建：`components/visualizers/spatial-runtime-visualizer.tsx`
  - Client Component，决定使用 Three.js 场景还是 fallback。
- 创建：`components/visualizers/spatial-runtime-canvas.tsx`
  - Three.js Canvas 宿主。
- 创建：`components/visualizers/scenes/runtime-scene.tsx`
  - 根据 `VisualizerSpec`、`status`、`frame` 渲染不同空间模型。
- 创建：`components/visualizers/index.ts`
  - 统一导出运行可视化组件。
- 创建：`tests/visualizers/components.test.tsx`
  - 测试 fallback 和 wrapper 的可渲染结构。
- 创建：`tests/visualizers/styles.test.ts`
  - 测试 3D 容器、阶段星图、fallback、移动端和减少动态效果样式存在。
- 修改：`app/learning-studio.tsx`
  - 增加 `selectedStageId`，接入阶段入口、阶段空间页和 3D 运行可视化。
- 修改：`app/globals.css`
  - 增加阶段星图、3D 容器、运行舱、fallback、移动端降级样式。
- 修改：`docs/PRODUCT.md`
  - 记录 3D 空间化学习体验和导航变化。
- 修改：`docs/ARTICHECTURE.md`
  - 记录 Three.js Client 边界、视觉器数据流和降级策略。
- 修改：`session-handoff.md`
  - 更新当前实现状态、验证命令和人工验收要点。

---

### 任务 1：安装 3D 依赖并定义视觉器类型

**文件：**
- 修改：`package.json`
- 修改：`package-lock.json`
- 修改：`lib/curriculum/types.ts`
- 创建：`tests/curriculum/visualizers.test.ts`

- [ ] **步骤 1：安装依赖**

运行：

```bash
npm install three @react-three/fiber @react-three/drei
```

预期：`package.json` 新增 3 个依赖，`package-lock.json` 同步更新。

- [ ] **步骤 2：编写失败测试**

创建 `tests/curriculum/visualizers.test.ts`：

```ts
import assert from "node:assert/strict";
import test from "node:test";

import { getDefaultVisualizer } from "../../lib/curriculum/visualizers";

test("不同阶段生成对应的默认可视化类型", () => {
  assert.equal(getDefaultVisualizer("http-foundations", "knowledge").type, "http-pipeline");
  assert.equal(getDefaultVisualizer("api-design", "knowledge").type, "service-boundary");
  assert.equal(getDefaultVisualizer("process-concurrency", "knowledge").type, "worker-pool");
  assert.equal(getDefaultVisualizer("realtime", "knowledge").type, "realtime-mesh");
  assert.equal(getDefaultVisualizer("testing-security", "knowledge").type, "quality-shield");
  assert.equal(getDefaultVisualizer("diagnostics-production", "knowledge").type, "diagnostics-tower");
});

test("普通阶段和阶段项目都有可用的 fallback 可视化配置", () => {
  assert.deepEqual(getDefaultVisualizer("runtime-cli", "knowledge"), {
    type: "generic-particle-flow",
    title: "通用运行粒子流",
    nodes: ["输入", "执行", "输出"]
  });

  assert.equal(getDefaultVisualizer("files-streams", "stage-project").type, "stage-project-core");
});
```

- [ ] **步骤 3：运行测试验证红灯**

运行：

```bash
npm test -- tests/curriculum/visualizers.test.ts
```

预期：失败，错误包含 `Cannot find module '../../lib/curriculum/visualizers'`。

- [ ] **步骤 4：扩展课程类型**

修改 `lib/curriculum/types.ts`：

```ts
export type VisualizerType =
  | "lane-flow"
  | "generic-particle-flow"
  | "stage-project-core"
  | "http-pipeline"
  | "service-boundary"
  | "worker-pool"
  | "realtime-mesh"
  | "quality-shield"
  | "diagnostics-tower";

export type VisualizerSpec = {
  type: VisualizerType;
  title: string;
  nodes: readonly string[];
};

export type AuthoredTraceExecution = {
  mode: "authored-trace";
  visualizer: VisualizerSpec;
  lanes: string[];
  frames: RunnerFrame[];
};
```

- [ ] **步骤 5：实现默认视觉器映射**

创建 `lib/curriculum/visualizers.ts`：

```ts
import type { LessonKind, StageId, VisualizerSpec } from "./types";

const stageVisualizers: Partial<Record<StageId, VisualizerSpec>> = {
  "http-foundations": {
    type: "http-pipeline",
    title: "HTTP 请求响应管线",
    nodes: ["Client", "Headers", "Router", "Handler", "Response"]
  },
  "api-design": {
    type: "service-boundary",
    title: "服务边界与可靠 API",
    nodes: ["Resource", "Validation", "Error Model", "Logging", "Shutdown"]
  },
  "process-concurrency": {
    type: "worker-pool",
    title: "进程与并发工作池",
    nodes: ["Main Thread", "libuv Pool", "Worker", "IPC", "Result"]
  },
  realtime: {
    type: "realtime-mesh",
    title: "实时连接星网",
    nodes: ["Client", "Handshake", "Heartbeat", "Broadcast", "Recovery"]
  },
  "testing-security": {
    type: "quality-shield",
    title: "测试与安全边界",
    nodes: ["Test", "Assertion", "Mock", "Secret Boundary", "Risk"]
  },
  "diagnostics-production": {
    type: "diagnostics-tower",
    title: "诊断与生产观测塔",
    nodes: ["Inspector", "CPU", "Heap", "GC", "Release"]
  }
};

export function getDefaultVisualizer(stageId: StageId, kind: LessonKind): VisualizerSpec {
  if (kind === "stage-project") {
    return {
      type: "stage-project-core",
      title: "阶段项目核心",
      nodes: ["需求", "实现", "运行", "验证", "总结"]
    };
  }

  return stageVisualizers[stageId] ?? {
    type: "generic-particle-flow",
    title: "通用运行粒子流",
    nodes: ["输入", "执行", "输出"]
  };
}
```

- [ ] **步骤 6：运行测试验证绿灯**

运行：

```bash
npm test -- tests/curriculum/visualizers.test.ts
```

预期：2 个测试通过。

- [ ] **步骤 7：Commit**

```bash
git add package.json package-lock.json lib/curriculum/types.ts lib/curriculum/visualizers.ts tests/curriculum/visualizers.test.ts
git commit -m "feat-from-codex: feat(课程可视化): 添加 3D 视觉器类型"
```

---

### 任务 2：让课程数据全部带上结构化 visualizer

**文件：**
- 修改：`content/lessons/lesson-factory.ts`
- 修改：`content/lessons/advanced-lesson-factory.ts`
- 修改：`content/lesson-registry.ts`
- 修改：`tests/curriculum/registry.test.ts`
- 修改：`tests/curriculum/visualizers.test.ts`

- [ ] **步骤 1：增加注册表断言**

在 `tests/curriculum/registry.test.ts` 追加测试：

```ts
test("每个已发布课程都有结构化运行可视化配置", () => {
  for (const lesson of publishedLessons) {
    assert.ok(lesson.execution.visualizer.title.length > 0);
    assert.ok(lesson.execution.visualizer.nodes.length >= 3);
    assert.notEqual(lesson.execution.visualizer.type, "lane-flow");
  }
});
```

在 `tests/curriculum/visualizers.test.ts` 追加测试：

```ts
import { publishedLessons } from "../../content/lesson-registry";

test("重点阶段课程映射到主题化 3D 场景", () => {
  const byId = new Map(publishedLessons.map((lesson) => [lesson.id, lesson]));

  assert.equal(byId.get("http-transaction")?.execution.visualizer.type, "http-pipeline");
  assert.equal(byId.get("api-input-validation")?.execution.visualizer.type, "service-boundary");
  assert.equal(byId.get("concurrency-worker-threads")?.execution.visualizer.type, "worker-pool");
  assert.equal(byId.get("realtime-websocket-handshake")?.execution.visualizer.type, "realtime-mesh");
  assert.equal(byId.get("testing-node-test")?.execution.visualizer.type, "quality-shield");
  assert.equal(byId.get("diagnostics-cpu-profile")?.execution.visualizer.type, "diagnostics-tower");
});
```

- [ ] **步骤 2：运行测试验证红灯**

运行：

```bash
npm test -- tests/curriculum/visualizers.test.ts tests/curriculum/registry.test.ts
```

预期：失败，旧的 `execution.visualizer` 仍是字符串。

- [ ] **步骤 3：更新课程工厂**

修改 `content/lessons/lesson-factory.ts` 的导入：

```diff
+import { getDefaultVisualizer } from "../../lib/curriculum/visualizers";
-import type { LessonKind, LessonSpec, LessonSource, QuestionType } from "../../lib/curriculum/types";
+import type { LessonKind, LessonSpec, LessonSource, QuestionType, VisualizerSpec } from "../../lib/curriculum/types";
```

修改 `LessonInput` 的 `execution` 类型：

```diff
-  execution: Omit<LessonSpec["execution"], "mode" | "visualizer">;
+  execution: Omit<LessonSpec["execution"], "mode" | "visualizer"> & {
+    visualizer?: VisualizerSpec;
+  };
```

在 `createLessonSpec` 函数开头加入：

```ts
const kind = input.kind ?? "knowledge";
```

把返回对象里的 `kind` 和 `execution.visualizer` 改成：

```diff
-    kind: input.kind ?? "knowledge",
+    kind,
```

```diff
-      visualizer: "lane-flow",
+      visualizer: input.execution.visualizer ?? getDefaultVisualizer(input.stageId, kind),
```

其他现有属性逐字保留，不改变题目、来源、文件和执行帧的生成逻辑。

- [ ] **步骤 4：更新高级课程工厂**

修改 `content/lessons/advanced-lesson-factory.ts` 的导入：

```diff
-import type { LessonSpec, RunnerFrame, StageId } from "../../lib/curriculum/types";
+import type { LessonSpec, RunnerFrame, StageId, VisualizerSpec } from "../../lib/curriculum/types";
```

在 `AdvancedLessonInput` 中加入：

```ts
visualizer?: VisualizerSpec;
```

把 `createLessonSpec` 调用中的 `execution` 改成：

```diff
     execution: {
+      visualizer: input.visualizer,
       lanes: input.lanes,
       frames
     },
```

不改变现有 `frames` 构造、答案选项和来源生成逻辑。

- [ ] **步骤 5：更新旧课程迁移**

修改 `content/lesson-registry.ts` 的导入：

```diff
+import { getDefaultVisualizer } from "../lib/curriculum/visualizers";
```

把 `migrateLesson` 返回对象中的 `execution.visualizer` 改成：

```diff
-      visualizer: "lane-flow",
+      visualizer: getDefaultVisualizer(metadata.stageId, legacy.project ? "stage-project" : "knowledge"),
```

不改变旧课程的 `metadata`、`entryFile`、题目迁移和 `delayMs` 逻辑。

- [ ] **步骤 6：运行课程测试**

运行：

```bash
npm test -- tests/curriculum/visualizers.test.ts tests/curriculum/registry.test.ts
```

预期：全部通过。

- [ ] **步骤 7：运行 TypeScript 检查**

运行：

```bash
npx tsc --noEmit
```

预期：无类型错误。

- [ ] **步骤 8：Commit**

```bash
git add content/lessons/lesson-factory.ts content/lessons/advanced-lesson-factory.ts content/lesson-registry.ts tests/curriculum/registry.test.ts tests/curriculum/visualizers.test.ts
git commit -m "feat-from-codex: feat(课程数据): 为课程补齐空间可视化配置"
```

---

### 任务 3：建立阶段空间 view model

**文件：**
- 创建：`lib/curriculum/stage-space.ts`
- 创建：`tests/curriculum/stage-space.test.ts`

- [ ] **步骤 1：编写失败测试**

创建 `tests/curriculum/stage-space.test.ts`：

```ts
import assert from "node:assert/strict";
import test from "node:test";

import { curriculum } from "../../content/curriculum";
import { publishedLessons } from "../../content/lesson-registry";
import { buildStageSpaces, getStageSpace } from "../../lib/curriculum/stage-space";
import { emptyProgress } from "../../lib/progress/types";

test("阶段空间只暴露阶段入口，不展开全局课程列表", () => {
  const spaces = buildStageSpaces(curriculum, publishedLessons, emptyProgress);

  assert.equal(spaces.length, 10);
  assert.deepEqual(spaces.map((space) => space.number), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.ok(spaces.every((space) => space.nodes.length <= 9));
});

test("阶段空间包含当前阶段课程和阶段项目节点", () => {
  const httpSpace = getStageSpace("http-foundations", curriculum, publishedLessons, emptyProgress);

  assert.equal(httpSpace?.title, "HTTP 基础");
  assert.equal(httpSpace?.nodes.length, 9);
  assert.equal(httpSpace?.nodes[0].id, "http-transaction");
  assert.equal(httpSpace?.nodes.at(-1)?.kind, "stage-project");
});

test("完成进度影响课程节点状态", () => {
  const httpSpace = getStageSpace("http-foundations", curriculum, publishedLessons, {
    ...emptyProgress,
    completedLessonIds: ["http-transaction"]
  });

  assert.equal(httpSpace?.nodes[0].state, "done");
  assert.equal(httpSpace?.nodes[1].state, "available");
});
```

- [ ] **步骤 2：运行测试验证红灯**

运行：

```bash
npm test -- tests/curriculum/stage-space.test.ts
```

预期：失败，错误包含 `Cannot find module '../../lib/curriculum/stage-space'`。

- [ ] **步骤 3：实现阶段空间模型**

创建 `lib/curriculum/stage-space.ts`：

```ts
import type { CurriculumStage, LessonKind, LessonSpec, StageId } from "./types";
import type { ProgressSnapshot } from "../progress/types";

export type StageSpaceNode = {
  id: string;
  title: string;
  order: number;
  kind: LessonKind;
  status: "published" | "planned";
  state: "done" | "available" | "planned";
  lessonIndex: number | null;
};

export type StageSpace = {
  id: StageId;
  number: number;
  title: string;
  summary: string;
  completedCount: number;
  publishedCount: number;
  nodes: StageSpaceNode[];
};

export function buildStageSpaces(
  stages: readonly CurriculumStage[],
  lessons: readonly LessonSpec[],
  progress: ProgressSnapshot
): StageSpace[] {
  const lessonIndexById = new Map(lessons.map((lesson, index) => [lesson.id, index]));
  const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  const completedIds = new Set([...progress.completedLessonIds, ...progress.completedProjectIds]);

  return stages.map((stage) => {
    const entries = [...stage.lessons, stage.project];
    const nodes = entries.map((entry) => {
      const lesson = lessonById.get(entry.id);
      const isPublished = entry.status === "published" && Boolean(lesson);
      const isDone = completedIds.has(entry.id);

      return {
        id: entry.id,
        title: entry.title,
        order: entry.order,
        kind: entry.kind,
        status: entry.status,
        state: isDone ? "done" : isPublished ? "available" : "planned",
        lessonIndex: isPublished ? lessonIndexById.get(entry.id) ?? null : null
      } satisfies StageSpaceNode;
    });

    return {
      id: stage.id,
      number: stage.number,
      title: stage.title,
      summary: stage.summary,
      completedCount: nodes.filter((node) => node.state === "done").length,
      publishedCount: nodes.filter((node) => node.status === "published").length,
      nodes
    };
  });
}

export function getStageSpace(
  stageId: StageId,
  stages: readonly CurriculumStage[],
  lessons: readonly LessonSpec[],
  progress: ProgressSnapshot
): StageSpace | undefined {
  return buildStageSpaces(stages, lessons, progress).find((stage) => stage.id === stageId);
}
```

- [ ] **步骤 4：运行测试验证绿灯**

运行：

```bash
npm test -- tests/curriculum/stage-space.test.ts
```

预期：3 个测试通过。

- [ ] **步骤 5：Commit**

```bash
git add lib/curriculum/stage-space.ts tests/curriculum/stage-space.test.ts
git commit -m "feat-from-codex: feat(学习路径): 添加阶段空间模型"
```

---

### 任务 4：实现阶段入口和课程星图组件

**文件：**
- 创建：`components/learning-space/stage-sidebar.tsx`
- 创建：`components/learning-space/stage-space.tsx`
- 创建：`components/learning-space/index.ts`
- 创建：`tests/learning-space/components.test.tsx`

- [ ] **步骤 1：编写失败组件测试**

创建 `tests/learning-space/components.test.tsx`：

```tsx
import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { StageSidebar, StageSpaceMap } from "../../components/learning-space";
import type { StageSpace } from "../../lib/curriculum/stage-space";
import type { RoadmapStage } from "../../lib/curriculum/view-model";

const roadmap: RoadmapStage[] = [{
  id: "http-foundations",
  number: 5,
  title: "HTTP 基础",
  totalLessons: 8,
  publishedLessons: 8,
  completedLessons: 2,
  state: "active",
  items: [{ id: "http-transaction", title: "HTTP 事务生命周期", status: "published" }]
}];

const stageSpace: StageSpace = {
  id: "http-foundations",
  number: 5,
  title: "HTTP 基础",
  summary: "理解一次网络事务",
  completedCount: 1,
  publishedCount: 9,
  nodes: [
    { id: "http-transaction", title: "HTTP 事务生命周期", order: 1, kind: "knowledge", status: "published", state: "done", lessonIndex: 29 },
    { id: "project-static-file-server", title: "流式静态文件服务器", order: 9, kind: "stage-project", status: "published", state: "available", lessonIndex: 37 }
  ]
};

test("StageSidebar 只渲染阶段入口，不渲染课程 item 列表", () => {
  const html = renderToStaticMarkup(
    <StageSidebar stages={roadmap} activeStageId="http-foundations" onSelectStage={() => {}} />
  );

  assert.match(html, /stage-sidebar/);
  assert.match(html, /HTTP 基础/);
  assert.doesNotMatch(html, /HTTP 事务生命周期/);
});

test("StageSpaceMap 渲染当前阶段课程节点和项目节点", () => {
  const html = renderToStaticMarkup(
    <StageSpaceMap activeLessonId="http-transaction" stage={stageSpace} onOpenLesson={() => {}} />
  );

  assert.match(html, /stage-space-map/);
  assert.match(html, /HTTP 事务生命周期/);
  assert.match(html, /流式静态文件服务器/);
  assert.match(html, /stage-node project/);
});
```

- [ ] **步骤 2：运行测试验证红灯**

运行：

```bash
npm test -- tests/learning-space/components.test.tsx
```

预期：失败，错误包含 `Cannot find module '../../components/learning-space'`。

- [ ] **步骤 3：实现阶段入口组件**

创建 `components/learning-space/stage-sidebar.tsx`：

```tsx
import type { StageId } from "@/lib/curriculum/types";
import type { RoadmapStage } from "@/lib/curriculum/view-model";

type StageSidebarProps = {
  stages: readonly RoadmapStage[];
  activeStageId: StageId;
  onSelectStage: (stageId: StageId) => void;
};

export function StageSidebar({ stages, activeStageId, onSelectStage }: StageSidebarProps) {
  return (
    <div className="stage-sidebar" aria-label="学习阶段">
      {stages.map((stage) => {
        const isActive = stage.id === activeStageId;

        return (
          <button
            className={`stage-entry ${stage.state}${isActive ? " selected" : ""}`}
            key={stage.id}
            onClick={() => onSelectStage(stage.id as StageId)}
            type="button"
          >
            <span className="stage-entry__number">{String(stage.number).padStart(2, "0")}</span>
            <span className="stage-entry__copy">
              <strong>{stage.title}</strong>
              <small>{stage.completedLessons} / {stage.publishedLessons} 已掌握</small>
            </span>
            <span className="stage-entry__pulse" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **步骤 4：实现阶段星图组件**

创建 `components/learning-space/stage-space.tsx`：

```tsx
import type { StageSpace } from "@/lib/curriculum/stage-space";

type StageSpaceMapProps = {
  stage: StageSpace;
  activeLessonId: string;
  onOpenLesson: (lessonIndex: number) => void;
};

export function StageSpaceMap({ stage, activeLessonId, onOpenLesson }: StageSpaceMapProps) {
  return (
    <section className="stage-space-map" aria-label={`${stage.title} 课程星图`}>
      <div className="stage-space-map__header">
        <span className="kicker">STAGE {String(stage.number).padStart(2, "0")}</span>
        <h2>{stage.title}</h2>
        <p>{stage.summary}</p>
      </div>
      <div className="stage-orbit" aria-hidden="true" />
      <div className="stage-node-grid">
        {stage.nodes.map((node) => (
          <button
            className={`stage-node ${node.kind === "stage-project" ? "project" : "lesson"} ${node.state}${node.id === activeLessonId ? " active" : ""}`}
            disabled={node.lessonIndex === null}
            key={node.id}
            onClick={() => node.lessonIndex !== null && onOpenLesson(node.lessonIndex)}
            type="button"
          >
            <span>{node.kind === "stage-project" ? "PROJECT" : String(node.order).padStart(2, "0")}</span>
            <strong>{node.title}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}
```

创建 `components/learning-space/index.ts`：

```ts
export { StageSidebar } from "./stage-sidebar";
export { StageSpaceMap } from "./stage-space";
```

- [ ] **步骤 5：运行测试验证绿灯**

运行：

```bash
npm test -- tests/learning-space/components.test.tsx
```

预期：2 个测试通过。

- [ ] **步骤 6：Commit**

```bash
git add components/learning-space tests/learning-space/components.test.tsx
git commit -m "feat-from-codex: feat(学习路径): 实现阶段入口和课程星图"
```

---

### 任务 5：实现 3D 运行可视化组件和 fallback

**文件：**
- 创建：`components/visualizers/visualizer-fallback.tsx`
- 创建：`components/visualizers/spatial-runtime-visualizer.tsx`
- 创建：`components/visualizers/spatial-runtime-canvas.tsx`
- 创建：`components/visualizers/scenes/runtime-scene.tsx`
- 创建：`components/visualizers/index.ts`
- 创建：`tests/visualizers/components.test.tsx`

- [ ] **步骤 1：编写失败测试**

创建 `tests/visualizers/components.test.tsx`：

```tsx
import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { SpatialRuntimeVisualizer, VisualizerFallback } from "../../components/visualizers";
import type { RunnerFrame, VisualizerSpec } from "../../lib/curriculum/types";

const visualizer: VisualizerSpec = {
  type: "http-pipeline",
  title: "HTTP 请求响应管线",
  nodes: ["Client", "Headers", "Router", "Handler", "Response"]
};

const frame: RunnerFrame = {
  activeLane: 1,
  laneValues: ["GET /learn", "Router", "等待"],
  log: ["进入请求"],
  note: "请求进入 Router",
  delayMs: 300
};

test("VisualizerFallback 渲染可读节点和当前状态", () => {
  const html = renderToStaticMarkup(
    <VisualizerFallback frame={frame} status="running" visualizer={visualizer} />
  );

  assert.match(html, /visualizer-fallback running/);
  assert.match(html, /HTTP 请求响应管线/);
  assert.match(html, /Headers/);
});

test("SpatialRuntimeVisualizer 服务端静态渲染时保留 fallback 结构", () => {
  const html = renderToStaticMarkup(
    <SpatialRuntimeVisualizer frame={frame} status="running" visualizer={visualizer} />
  );

  assert.match(html, /spatial-runtime-visualizer/);
  assert.match(html, /visualizer-fallback/);
});
```

- [ ] **步骤 2：运行测试验证红灯**

运行：

```bash
npm test -- tests/visualizers/components.test.tsx
```

预期：失败，错误包含 `Cannot find module '../../components/visualizers'`。

- [ ] **步骤 3：实现 fallback 组件**

创建 `components/visualizers/visualizer-fallback.tsx`：

```tsx
import type { RunnerFrame, VisualizerSpec } from "@/lib/curriculum/types";
import type { LearningVisualStatus } from "@/lib/immersive/visual-state";

type VisualizerFallbackProps = {
  visualizer: VisualizerSpec;
  status: LearningVisualStatus;
  frame: RunnerFrame | null;
};

export function VisualizerFallback({ visualizer, status, frame }: VisualizerFallbackProps) {
  const activeIndex = Math.max(0, frame?.activeLane ?? 0);

  return (
    <div className={`visualizer-fallback ${status}`}>
      <div className="visualizer-fallback__header">
        <span>3D FALLBACK</span>
        <strong>{visualizer.title}</strong>
      </div>
      <div className="visualizer-fallback__nodes">
        {visualizer.nodes.map((node, index) => (
          <span className={index === activeIndex ? "active" : ""} key={node}>
            {node}
          </span>
        ))}
      </div>
      <p>{frame?.note ?? "答对后将显示运行路径。"}</p>
    </div>
  );
}
```

- [ ] **步骤 4：实现动态 Three.js wrapper**

创建 `components/visualizers/spatial-runtime-visualizer.tsx`：

```tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import type { RunnerFrame, VisualizerSpec } from "@/lib/curriculum/types";
import type { LearningVisualStatus } from "@/lib/immersive/visual-state";
import { VisualizerFallback } from "./visualizer-fallback";

const SpatialRuntimeCanvas = dynamic(
  () => import("./spatial-runtime-canvas").then((mod) => mod.SpatialRuntimeCanvas),
  { ssr: false }
);

type SpatialRuntimeVisualizerProps = {
  visualizer: VisualizerSpec;
  status: LearningVisualStatus;
  frame: RunnerFrame | null;
};

export function SpatialRuntimeVisualizer(props: SpatialRuntimeVisualizerProps) {
  const [canUseMotion, setCanUseMotion] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasWebGL = (() => {
      const canvas = document.createElement("canvas");
      return Boolean(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
    })();
    setCanUseMotion(hasWebGL && !reducedMotion);
  }, []);

  return (
    <div className="spatial-runtime-visualizer">
      {canUseMotion ? <SpatialRuntimeCanvas {...props} /> : <VisualizerFallback {...props} />}
    </div>
  );
}
```

- [ ] **步骤 5：实现 Three.js Canvas 和场景**

创建 `components/visualizers/spatial-runtime-canvas.tsx`：

```tsx
"use client";

import { Canvas } from "@react-three/fiber";
import type { RunnerFrame, VisualizerSpec } from "@/lib/curriculum/types";
import type { LearningVisualStatus } from "@/lib/immersive/visual-state";
import { RuntimeScene } from "./scenes/runtime-scene";

type SpatialRuntimeCanvasProps = {
  visualizer: VisualizerSpec;
  status: LearningVisualStatus;
  frame: RunnerFrame | null;
};

export function SpatialRuntimeCanvas(props: SpatialRuntimeCanvasProps) {
  return (
    <Canvas
      className="spatial-runtime-canvas"
      camera={{ position: [0, 2.8, 7], fov: 46 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.55} />
      <pointLight color="#9fe870" intensity={1.2} position={[2, 3, 4]} />
      <RuntimeScene {...props} />
    </Canvas>
  );
}
```

创建 `components/visualizers/scenes/runtime-scene.tsx`：

```tsx
"use client";

import { Float, Text } from "@react-three/drei";
import type { RunnerFrame, VisualizerSpec } from "@/lib/curriculum/types";
import type { LearningVisualStatus } from "@/lib/immersive/visual-state";

type RuntimeSceneProps = {
  visualizer: VisualizerSpec;
  status: LearningVisualStatus;
  frame: RunnerFrame | null;
};

const colorByType: Record<VisualizerSpec["type"], string> = {
  "lane-flow": "#9fe870",
  "generic-particle-flow": "#9fe870",
  "stage-project-core": "#6ee7ff",
  "http-pipeline": "#6ee7ff",
  "service-boundary": "#ffd166",
  "worker-pool": "#ffad66",
  "realtime-mesh": "#7c5cff",
  "quality-shield": "#b8ff85",
  "diagnostics-tower": "#ff6bcb"
};

export function RuntimeScene({ visualizer, status, frame }: RuntimeSceneProps) {
  const activeIndex = Math.max(0, frame?.activeLane ?? 0);
  const color = colorByType[visualizer.type];

  return (
    <group>
      {visualizer.nodes.map((node, index) => {
        const x = (index - (visualizer.nodes.length - 1) / 2) * 1.35;
        const active = status !== "idle" && index === activeIndex;

        return (
          <Float floatIntensity={active ? 0.7 : 0.25} key={node} rotationIntensity={0.18}>
            <mesh position={[x, active ? 0.25 : 0, 0]}>
              <sphereGeometry args={[active ? 0.3 : 0.22, 32, 32]} />
              <meshStandardMaterial color={active ? color : "#2d3846"} emissive={active ? color : "#050608"} emissiveIntensity={active ? 0.75 : 0.15} />
            </mesh>
            <Text color="#dbe7f5" fontSize={0.16} maxWidth={1.1} position={[x, -0.55, 0]}>
              {node}
            </Text>
          </Float>
        );
      })}
    </group>
  );
}
```

创建 `components/visualizers/index.ts`：

```ts
export { SpatialRuntimeVisualizer } from "./spatial-runtime-visualizer";
export { VisualizerFallback } from "./visualizer-fallback";
```

- [ ] **步骤 6：运行组件测试**

运行：

```bash
npm test -- tests/visualizers/components.test.tsx
```

预期：2 个测试通过。

- [ ] **步骤 7：Commit**

```bash
git add components/visualizers tests/visualizers/components.test.tsx
git commit -m "feat-from-codex: feat(运行可视化): 添加空间运行实验舱"
```

---

### 任务 6：把学习空间和 3D 运行舱接入 LearningStudio

**文件：**
- 修改：`app/learning-studio.tsx`
- 创建：`tests/learning-space/source.test.ts`

- [ ] **步骤 1：编写源码结构测试**

创建 `tests/learning-space/source.test.ts`：

```ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("app/learning-studio.tsx", "utf8");

test("LearningStudio 使用阶段空间组件替代全局课程切换器", () => {
  assert.match(source, /selectedStageId/);
  assert.match(source, /StageSidebar/);
  assert.match(source, /StageSpaceMap/);
  assert.doesNotMatch(source, /publishedLessons\.map\(\(item, index\)/);
});

test("LearningStudio 将课程 visualizer 传给空间运行实验舱", () => {
  assert.match(source, /SpatialRuntimeVisualizer/);
  assert.match(source, /visualizer=\{lesson\.execution\.visualizer\}/);
});
```

- [ ] **步骤 2：运行测试验证红灯**

运行：

```bash
npm test -- tests/learning-space/source.test.ts
```

预期：失败，`LearningStudio` 尚未接入新组件。

- [ ] **步骤 3：更新导入和状态**

修改 `app/learning-studio.tsx` 顶部导入：

```tsx
import { StageSidebar, StageSpaceMap } from "@/components/learning-space";
import { SpatialRuntimeVisualizer } from "@/components/visualizers";
import { buildStageSpaces } from "@/lib/curriculum/stage-space";
import type { StageId } from "@/lib/curriculum/types";
```

在 `LearningStudio` 内增加状态和派生数据：

```tsx
const [selectedStageId, setSelectedStageId] = useState<StageId>("runtime-cli");
const stageSpaces = useMemo(() => buildStageSpaces(curriculum, publishedLessons, progress), [progress]);
const activeStageSpace = stageSpaces.find((stage) => stage.id === selectedStageId)
  ?? stageSpaces.find((stage) => stage.id === activeStageId)
  ?? stageSpaces[0]!;

function selectStage(stageId: StageId) {
  cancelRun();
  setSelectedStageId(stageId);
  const firstLesson = stageSpaces
    .find((stage) => stage.id === stageId)
    ?.nodes.find((node) => node.lessonIndex !== null);
  if (firstLesson?.lessonIndex !== null && firstLesson?.lessonIndex !== undefined) {
    openLesson(firstLesson.lessonIndex);
  }
}
```

在 `openLesson` 中同步阶段：

```tsx
function openLesson(index: number) {
  cancelRun();
  const next = publishedLessons[index]!;
  setLessonIndex(index);
  setSelectedStageId(next.stageId);
  setSelected(null);
  setStatus("idle");
  setFrameIndex(-1);
  setFrame(null);
}
```

- [ ] **步骤 4：替换左侧 roadmap 展示**

用新组件替换 `.roadmap-list` 的课程展开区域：

```tsx
<StageSidebar
  activeStageId={selectedStageId}
  onSelectStage={selectStage}
  stages={roadmap}
/>
```

保留 `NebulaProgress`、进度条、阶段项目和最终项目信息，但删除原先渲染 `section.items.map(...)` 的课程平铺列表。

- [ ] **步骤 5：替换全局 lesson-switcher**

删除原先全局 `lesson-switcher`：

```tsx
{publishedLessons.map((item, index) => (
  <button className={index === lessonIndex ? "active" : ""} key={item.id} onClick={() => openLesson(index)} type="button">
    <span>{item.kind === "stage-project" ? "PROJECT" : `0${index + 1}`}</span>{item.title}
  </button>
))}
```

在课程标题下方加入：

```tsx
<StageSpaceMap
  activeLessonId={lesson.id}
  onOpenLesson={openLesson}
  stage={activeStageSpace}
/>
```

- [ ] **步骤 6：接入空间运行实验舱**

在 `.runtime-body` 中把 `runtime-flow` 替换为：

```tsx
<SpatialRuntimeVisualizer
  frame={frame}
  status={status}
  visualizer={lesson.execution.visualizer}
/>
```

终端日志区继续保留，确保答题、运行帧、日志和总结逻辑不变。

- [ ] **步骤 7：运行结构测试和类型检查**

运行：

```bash
npm test -- tests/learning-space/source.test.ts tests/learning-space/components.test.tsx tests/visualizers/components.test.tsx
npx tsc --noEmit
```

预期：测试和类型检查全部通过。

- [ ] **步骤 8：Commit**

```bash
git add app/learning-studio.tsx tests/learning-space/source.test.ts
git commit -m "feat-from-codex: feat(学习工作台): 接入阶段星图和 3D 运行舱"
```

---

### 任务 7：补齐空间化样式与响应式降级

**文件：**
- 修改：`app/globals.css`
- 创建：`tests/visualizers/styles.test.ts`

- [ ] **步骤 1：编写失败样式测试**

创建 `tests/visualizers/styles.test.ts`：

```ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync("app/globals.css", "utf8");

test("样式包含阶段入口、课程星图和空间运行舱", () => {
  for (const selector of [
    ".stage-sidebar",
    ".stage-entry",
    ".stage-space-map",
    ".stage-node",
    ".spatial-runtime-visualizer",
    ".spatial-runtime-canvas",
    ".visualizer-fallback"
  ]) {
    assert.ok(css.includes(selector), `${selector} 应存在`);
  }
});

test("样式包含移动端和减少动态效果降级", () => {
  assert.ok(css.includes("@media (prefers-reduced-motion: reduce)"));
  assert.ok(css.includes("@media (max-width: 760px)"));
  assert.ok(css.includes(".spatial-runtime-canvas"));
  assert.ok(css.includes(".visualizer-fallback"));
});
```

- [ ] **步骤 2：运行测试验证红灯**

运行：

```bash
npm test -- tests/visualizers/styles.test.ts
```

预期：失败，缺少新选择器。

- [ ] **步骤 3：添加阶段导航和星图样式**

在 `app/globals.css` 中追加：

```css
.stage-sidebar { display: grid; gap: 8px; margin-top: 22px; }
.stage-entry { width: 100%; display: grid; grid-template-columns: 34px 1fr 10px; align-items: center; gap: 10px; border: 1px solid var(--line-soft); background: rgba(10, 14, 19, 0.72); color: var(--muted); padding: 11px; text-align: left; cursor: pointer; }
.stage-entry:hover, .stage-entry.selected { border-color: rgba(159, 232, 112, 0.45); color: var(--ink); background: var(--green-dim); }
.stage-entry__number { color: var(--green); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 10px; }
.stage-entry__copy strong, .stage-entry__copy small { display: block; }
.stage-entry__copy strong { font-size: 11px; }
.stage-entry__copy small { margin-top: 4px; color: var(--quiet); font-size: 8px; }
.stage-entry__pulse { width: 7px; height: 7px; border-radius: 50%; background: var(--quiet); }
.stage-entry.selected .stage-entry__pulse { background: var(--green); box-shadow: var(--glow-green); }

.stage-space-map { max-width: 1120px; position: relative; margin-top: 28px; padding: 24px; overflow: hidden; border: 1px solid rgba(110, 231, 255, 0.2); background: linear-gradient(145deg, rgba(110, 231, 255, 0.08), rgba(124, 92, 255, 0.08)); }
.stage-space-map__header h2 { margin: 8px 0 6px; font-size: 22px; letter-spacing: 0; }
.stage-space-map__header p { margin: 0; color: var(--muted); font-size: 12px; }
.stage-orbit { position: absolute; inset: 20px 70px; border: 1px solid rgba(110, 231, 255, 0.18); border-radius: 50%; transform: rotate(-8deg); pointer-events: none; }
.stage-node-grid { position: relative; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; margin-top: 24px; }
.stage-node { min-height: 86px; border: 1px solid rgba(137, 147, 164, 0.2); background: rgba(8, 11, 15, 0.7); color: var(--muted); padding: 12px; text-align: left; cursor: pointer; }
.stage-node:hover:not(:disabled), .stage-node.active { border-color: rgba(110, 231, 255, 0.55); color: var(--ink); box-shadow: var(--glow-cyan); }
.stage-node.project { border-color: rgba(159, 232, 112, 0.28); background: rgba(159, 232, 112, 0.08); }
.stage-node span, .stage-node strong { display: block; }
.stage-node span { color: var(--green); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 8px; }
.stage-node strong { margin-top: 8px; font-size: 11px; line-height: 1.35; }
```

- [ ] **步骤 4：添加 3D 运行舱和 fallback 样式**

继续在 `app/globals.css` 中追加：

```css
.spatial-runtime-visualizer { min-height: 280px; position: relative; border-right: 1px solid var(--line); background: radial-gradient(circle at 50% 20%, rgba(110, 231, 255, 0.12), transparent 42%), #080b0f; }
.spatial-runtime-canvas { width: 100%; min-height: 280px; display: block; }
.visualizer-fallback { min-height: 280px; display: grid; align-content: center; gap: 18px; padding: 28px; }
.visualizer-fallback__header span, .visualizer-fallback__header strong { display: block; }
.visualizer-fallback__header span { color: var(--green); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 8px; letter-spacing: .16em; }
.visualizer-fallback__header strong { margin-top: 7px; font-size: 14px; }
.visualizer-fallback__nodes { display: flex; flex-wrap: wrap; gap: 8px; }
.visualizer-fallback__nodes span { border: 1px solid var(--line); color: var(--muted); padding: 8px 10px; font-size: 10px; }
.visualizer-fallback__nodes span.active { border-color: var(--green); color: var(--green-bright); background: var(--green-dim); }
.visualizer-fallback p { margin: 0; color: var(--muted); font-size: 10px; line-height: 1.6; }
```

- [ ] **步骤 5：更新响应式和减少动态效果**

调整现有 media block：

```css
@media (prefers-reduced-motion: reduce) {
  .spatial-runtime-canvas { display: none; }
  .visualizer-fallback { min-height: 220px; }
}

@media (max-width: 1050px) {
  .stage-node-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .spatial-runtime-visualizer { border-right: 0; border-bottom: 1px solid var(--line); }
}

@media (max-width: 760px) {
  .stage-sidebar { grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 14px; }
  .stage-entry { grid-template-columns: 1fr; }
  .stage-entry__pulse { display: none; }
  .stage-space-map { padding: 18px; }
  .stage-orbit { display: none; }
  .stage-node-grid { grid-template-columns: 1fr; }
  .spatial-runtime-canvas { display: none; }
  .visualizer-fallback { min-height: 220px; padding: 22px 18px; }
}
```

- [ ] **步骤 6：运行样式测试**

运行：

```bash
npm test -- tests/visualizers/styles.test.ts tests/immersive/styles.test.ts
```

预期：全部通过。

- [ ] **步骤 7：Commit**

```bash
git add app/globals.css tests/visualizers/styles.test.ts
git commit -m "feat-from-codex: feat(视觉样式): 补齐空间化学习界面"
```

---

### 任务 8：更新文档和交接

**文件：**
- 修改：`docs/PRODUCT.md`
- 修改：`docs/ARTICHECTURE.md`
- 修改：`session-handoff.md`

- [ ] **步骤 1：更新产品文档**

在 `docs/PRODUCT.md` 的学习体验部分加入：

```md
### 3D 空间化学习体验

NodePath 采用阶段星图组织完整 Node.js 学习路径。左侧导航只展示阶段入口，学习者进入阶段后在主区域选择该阶段知识点和阶段项目。答对题目后，系统根据课程的 `visualizer` 配置展示 3D 运行舱或轻量 fallback，帮助学习者把请求、进程、连接、测试和诊断过程记成空间关系。
```

- [ ] **步骤 2：更新架构文档**

在 `docs/ARTICHECTURE.md` 的前端架构部分加入：

```md
### 空间可视化边界

课程数据通过 `execution.visualizer` 描述运行可视化类型。`LearningStudio` 负责传入当前 `status`、`frame` 和 `visualizer`，`components/visualizers` 决定使用 Three.js Canvas 还是 fallback。Three.js 组件只存在于 Client Component 和动态加载边界内；`app/layout.tsx` 继续保持 Server Component。
```

- [ ] **步骤 3：更新交接文档**

在 `session-handoff.md` 加入：

```md
## 3D 空间化学习体验

- 已新增阶段星图导航，课程不再全部平铺在全局导航中。
- 已新增结构化 `execution.visualizer`，重点阶段映射到主题化 3D 场景。
- 已新增 Three.js 运行舱和 WebGL / 减少动态效果 fallback。
- 验证命令：`npm test`、`npx tsc --noEmit`、`npm run lint`、`npm run build`、`git diff --check`。
```

- [ ] **步骤 4：运行文档 diff 检查**

运行：

```bash
git diff --check -- docs/PRODUCT.md docs/ARTICHECTURE.md session-handoff.md
```

预期：无输出，退出码为 0。

- [ ] **步骤 5：Commit**

```bash
git add docs/PRODUCT.md docs/ARTICHECTURE.md session-handoff.md
git commit -m "feat-from-codex: docs(学习体验): 更新 3D 空间化说明"
```

---

### 任务 9：全量验证和人工视觉验收

**文件：**
- 无新增文件。

- [ ] **步骤 1：运行课程和组件测试**

运行：

```bash
npm test
```

预期：所有测试通过。

- [ ] **步骤 2：运行 TypeScript 检查**

运行：

```bash
npx tsc --noEmit
```

预期：无类型错误。

- [ ] **步骤 3：运行课程校验**

运行：

```bash
npm run validate:curriculum
```

预期：课程目录、注册表和已发布课程校验通过。

- [ ] **步骤 4：运行 lint**

运行：

```bash
npm run lint
```

预期：无 ESLint 错误。

- [ ] **步骤 5：运行生产构建**

运行：

```bash
npm run build
```

预期：Next.js 16 构建成功。若 Turbopack 本地 CSS 服务需要端口权限，使用当前环境的批准流程重新运行。

- [ ] **步骤 6：检查 diff 空白**

运行：

```bash
git diff --check
```

预期：无输出，退出码为 0。

- [ ] **步骤 7：启动本地服务做视觉验收**

运行：

```bash
npm run dev
```

打开本地 URL 后检查：

- 桌面端左侧只展示阶段入口。
- 阶段星图只展示当前阶段课程和阶段项目。
- 答对 HTTP、进程并发、实时通信、测试安全、诊断生产课程时，运行舱出现非空 3D Canvas 或 fallback。
- 移动端宽度下文字、按钮和运行舱不重叠。
- 开启减少动态效果时仍可答题、运行、看日志和总结。

- [ ] **步骤 8：最终 Commit 或修正**

若任务 9 只产生验证结果，不需要提交。若验证中修复了样式重叠问题，按以下具体示例提交：

```bash
git add app/globals.css
git commit -m "feat-from-codex: fix(学习体验): 修复 3D 空间化验收问题"
```

---

## 自检结果

- 规格覆盖度：已覆盖阶段导航、课程星图、结构化 `visualizer`、Three.js 运行舱、fallback、移动端降级、文档和验证。
- 未完成标记扫描：计划中没有空章节，也没有留给执行者猜测的未决实现点。
- 类型一致性：统一使用 `VisualizerSpec`、`VisualizerType`、`StageSpace`、`StageSpaceNode`、`LearningVisualStatus`。
- 范围控制：第一期实现重点阶段主题化 3D 场景和通用 fallback，不要求 83 节课全部定制独立场景，也不实现真实 Node.js 沙箱执行。

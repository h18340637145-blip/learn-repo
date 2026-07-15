# NodePath 沉浸式学习体验实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 为 NodePath 增加 Runtime Cockpit + Knowledge Nebula 的沉浸式前端体验，让学习过程具备空间感、粒子感、能量反馈和阶段成就感，同时保持代码与题目可读。

**架构：** 新增一个纯函数视觉状态层 `lib/immersive/visual-state.ts`，再用 4 个专注组件消费该状态：`ImmersiveBackdrop`、`NebulaProgress`、`EnergyRunway`、`CompletionBurst`。`app/learning-studio.tsx` 只负责传入学习状态、当前阶段和进度，不让视觉组件写进度或改变课程切换逻辑。

**技术栈：** Next.js 16 App Router、React 19、TypeScript、Canvas 2D、CSS 动效、Node.js `node:test`、`react-dom/server`。

---

## 文件结构

- 创建：`lib/immersive/visual-state.ts`
  - 纯函数状态映射：视觉状态类名、星云阶段状态、完成爆发文案、粒子强度。
- 创建：`components/immersive/immersive-backdrop.tsx`
  - Client Component，渲染 canvas 粒子层和驾驶舱背景层。
- 创建：`components/immersive/nebula-progress.tsx`
  - Server-safe React 组件，渲染 10 个阶段星域和总能量环。
- 创建：`components/immersive/energy-runway.tsx`
  - Server-safe React 组件，渲染答题区到运行区之间的能量流状态。
- 创建：`components/immersive/completion-burst.tsx`
  - Server-safe React 组件，渲染课程完成和阶段项目完成反馈。
- 创建：`components/immersive/index.ts`
  - 统一导出沉浸式组件。
- 创建：`tests/immersive/visual-state.test.ts`
  - 测试纯函数视觉状态。
- 创建：`tests/immersive/components.test.tsx`
  - 使用 `renderToStaticMarkup` 测试组件基础结构与状态类名。
- 修改：`app/learning-studio.tsx`
  - 接入沉浸式组件和状态数据。
- 修改：`app/globals.css`
  - 增加空间背景、粒子层、星云进度、能量流和完成爆发样式。
- 修改：`docs/PRODUCT.md`
  - 记录沉浸式学习体验。
- 修改：`docs/ARTICHECTURE.md`
  - 记录视觉组件边界和状态流。
- 修改：`session-handoff.md`
  - 记录实现状态、验证命令和视觉验收建议。

---

### 任务 1：用测试定义视觉状态模型

**文件：**
- 创建：`tests/immersive/visual-state.test.ts`

- [ ] **步骤 1：编写失败测试**

创建 `tests/immersive/visual-state.test.ts`：

```ts
import assert from "node:assert/strict";
import test from "node:test";

import {
  getBackdropIntensity,
  getCompletionBurstModel,
  getEnergyRunwayClassName,
  getNebulaStageState
} from "../../lib/immersive/visual-state";
import type { RoadmapStage } from "../../lib/curriculum/view-model";

const activeStage: RoadmapStage = {
  id: "async-events",
  number: 3,
  title: "异步运行时与事件",
  totalLessons: 8,
  publishedLessons: 8,
  completedLessons: 4,
  state: "active",
  items: []
};

test("背景粒子强度跟随学习状态变化，并支持减少动态效果", () => {
  assert.equal(getBackdropIntensity("idle", false), 0.45);
  assert.equal(getBackdropIntensity("running", false), 0.82);
  assert.equal(getBackdropIntensity("success", false), 1);
  assert.equal(getBackdropIntensity("running", true), 0);
});

test("星云阶段状态标记当前阶段、完成度和项目核心", () => {
  assert.deepEqual(getNebulaStageState(activeStage, "async-events"), {
    className: "nebula-stage active",
    completionPercent: 50,
    hasCoreGlow: false,
    label: "03"
  });
});

test("能量通道根据状态输出稳定类名", () => {
  assert.equal(getEnergyRunwayClassName("idle"), "energy-runway idle");
  assert.equal(getEnergyRunwayClassName("wrong"), "energy-runway wrong");
  assert.equal(getEnergyRunwayClassName("running"), "energy-runway running");
  assert.equal(getEnergyRunwayClassName("success"), "energy-runway success");
});

test("完成爆发区分课程和阶段项目", () => {
  assert.deepEqual(getCompletionBurstModel(true, "lesson"), {
    className: "completion-burst visible lesson",
    title: "知识星体已点亮",
    subtitle: "运行完成，记忆回路已同步。"
  });

  assert.deepEqual(getCompletionBurstModel(true, "project"), {
    className: "completion-burst visible project",
    title: "阶段核心已激活",
    subtitle: "项目挑战完成，星域能量环已扩散。"
  });
});
```

- [ ] **步骤 2：运行测试验证红灯**

运行：

```bash
npm test -- tests/immersive/visual-state.test.ts
```

预期：失败，错误包含 `Cannot find module '../../lib/immersive/visual-state'`。

- [ ] **步骤 3：Commit 红灯测试**

```bash
git add tests/immersive/visual-state.test.ts
git commit -m "feat-from-codex: 为沉浸式视觉状态添加失败测试"
```

---

### 任务 2：实现视觉状态纯函数

**文件：**
- 创建：`lib/immersive/visual-state.ts`

- [ ] **步骤 1：实现视觉状态函数**

创建 `lib/immersive/visual-state.ts`：

```ts
import type { RoadmapStage } from "../curriculum/view-model";

export type LearningVisualStatus = "idle" | "running" | "wrong" | "success";
export type CompletionBurstVariant = "lesson" | "project";

export function getBackdropIntensity(status: LearningVisualStatus, reduceMotion: boolean): number {
  if (reduceMotion) return 0;
  if (status === "success") return 1;
  if (status === "running") return 0.82;
  if (status === "wrong") return 0.28;
  return 0.45;
}

export function getEnergyRunwayClassName(status: LearningVisualStatus): string {
  return `energy-runway ${status}`;
}

export function getNebulaStageState(stage: RoadmapStage, activeStageId: string) {
  const completionPercent = stage.totalLessons === 0
    ? 0
    : Math.round((stage.completedLessons / stage.totalLessons) * 100);
  const stateClass = stage.id === activeStageId ? "active" : stage.state;

  return {
    className: `nebula-stage ${stateClass}`,
    completionPercent,
    hasCoreGlow: stage.state === "done" && completionPercent === 100,
    label: String(stage.number).padStart(2, "0")
  };
}

export function getCompletionBurstModel(visible: boolean, variant: CompletionBurstVariant) {
  const isProject = variant === "project";

  return {
    className: `completion-burst ${visible ? "visible" : "hidden"} ${variant}`,
    title: isProject ? "阶段核心已激活" : "知识星体已点亮",
    subtitle: isProject ? "项目挑战完成，星域能量环已扩散。" : "运行完成，记忆回路已同步。"
  };
}
```

- [ ] **步骤 2：运行测试验证绿灯**

运行：

```bash
npm test -- tests/immersive/visual-state.test.ts
```

预期：4 个测试全部通过。

- [ ] **步骤 3：Commit 视觉状态函数**

```bash
git add lib/immersive/visual-state.ts
git commit -m "feat-from-codex: 实现沉浸式视觉状态模型"
```

---

### 任务 3：实现沉浸式 React 组件

**文件：**
- 创建：`tests/immersive/components.test.tsx`
- 创建：`components/immersive/immersive-backdrop.tsx`
- 创建：`components/immersive/nebula-progress.tsx`
- 创建：`components/immersive/energy-runway.tsx`
- 创建：`components/immersive/completion-burst.tsx`
- 创建：`components/immersive/index.ts`

- [ ] **步骤 1：编写失败的组件结构测试**

创建 `tests/immersive/components.test.tsx`：

```tsx
import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import {
  CompletionBurst,
  EnergyRunway,
  NebulaProgress
} from "../../components/immersive";
import type { RoadmapStage } from "../../lib/curriculum/view-model";

const stages: RoadmapStage[] = [
  {
    id: "runtime-cli",
    number: 1,
    title: "运行时与命令行",
    totalLessons: 8,
    publishedLessons: 8,
    completedLessons: 8,
    state: "done",
    items: []
  },
  {
    id: "async-events",
    number: 3,
    title: "异步运行时与事件",
    totalLessons: 8,
    publishedLessons: 8,
    completedLessons: 4,
    state: "active",
    items: []
  }
];

test("NebulaProgress 渲染阶段星域和总进度", () => {
  const html = renderToStaticMarkup(
    <NebulaProgress stages={stages} activeStageId="async-events" progressPercent={42} />
  );

  assert.match(html, /nebula-progress/);
  assert.match(html, /运行时与命令行/);
  assert.match(html, /异步运行时与事件/);
  assert.match(html, /42%/);
  assert.match(html, /nebula-stage active/);
});

test("EnergyRunway 输出状态类名", () => {
  const html = renderToStaticMarkup(<EnergyRunway status="running" />);
  assert.match(html, /energy-runway running/);
  assert.match(html, /能量流已接入运行时/);
});

test("CompletionBurst 输出项目完成反馈", () => {
  const html = renderToStaticMarkup(<CompletionBurst visible variant="project" />);
  assert.match(html, /completion-burst visible project/);
  assert.match(html, /阶段核心已激活/);
});
```

- [ ] **步骤 2：运行测试验证红灯**

运行：

```bash
npm test -- tests/immersive/components.test.tsx
```

预期：失败，错误包含 `Cannot find module '../../components/immersive'`。

- [ ] **步骤 3：实现 `EnergyRunway`**

创建 `components/immersive/energy-runway.tsx`：

```tsx
import { getEnergyRunwayClassName, type LearningVisualStatus } from "@/lib/immersive/visual-state";

type EnergyRunwayProps = {
  status: LearningVisualStatus;
};

export function EnergyRunway({ status }: EnergyRunwayProps) {
  const label = status === "running"
    ? "能量流已接入运行时"
    : status === "success"
      ? "运行回路同步完成"
      : status === "wrong"
        ? "预测扰动已记录"
        : "等待正确预测点火";

  return (
    <div className={getEnergyRunwayClassName(status)} aria-hidden="true">
      <span className="energy-runway__beam" />
      <span className="energy-runway__label">{label}</span>
    </div>
  );
}
```

- [ ] **步骤 4：实现 `CompletionBurst`**

创建 `components/immersive/completion-burst.tsx`：

```tsx
import { getCompletionBurstModel, type CompletionBurstVariant } from "@/lib/immersive/visual-state";

type CompletionBurstProps = {
  visible: boolean;
  variant: CompletionBurstVariant;
};

export function CompletionBurst({ visible, variant }: CompletionBurstProps) {
  const model = getCompletionBurstModel(visible, variant);

  return (
    <div className={model.className} aria-hidden={!visible}>
      <span className="completion-burst__ring" />
      <div>
        <strong>{model.title}</strong>
        <small>{model.subtitle}</small>
      </div>
    </div>
  );
}
```

- [ ] **步骤 5：实现 `NebulaProgress`**

创建 `components/immersive/nebula-progress.tsx`：

```tsx
import type { RoadmapStage } from "@/lib/curriculum/view-model";
import { getNebulaStageState } from "@/lib/immersive/visual-state";

type NebulaProgressProps = {
  stages: RoadmapStage[];
  activeStageId: string;
  progressPercent: number;
};

export function NebulaProgress({ stages, activeStageId, progressPercent }: NebulaProgressProps) {
  return (
    <section className="nebula-progress" aria-label={`知识星云进度 ${progressPercent}%`}>
      <div className="nebula-progress__core">
        <span className="kicker">KNOWLEDGE NEBULA</span>
        <strong>{progressPercent}%</strong>
        <small>learning energy</small>
      </div>
      <div className="nebula-progress__stages">
        {stages.map((stage) => {
          const state = getNebulaStageState(stage, activeStageId);

          return (
            <div className={state.className} key={stage.id} style={{ "--stage-progress": `${state.completionPercent}%` } as React.CSSProperties}>
              <span className="nebula-stage__index">{state.label}</span>
              <span className="nebula-stage__star" />
              <span className="nebula-stage__title">{stage.title}</span>
              {state.hasCoreGlow && <span className="nebula-stage__core" />}
            </div>
          );
        })}
      </div>
    </section>
  );
}
```

- [ ] **步骤 6：实现 `ImmersiveBackdrop`**

创建 `components/immersive/immersive-backdrop.tsx`：

```tsx
"use client";

import { useEffect, useRef } from "react";

import { getBackdropIntensity, type LearningVisualStatus } from "@/lib/immersive/visual-state";

type ImmersiveBackdropProps = {
  status: LearningVisualStatus;
  progressPercent: number;
};

export function ImmersiveBackdrop({ status, progressPercent }: ImmersiveBackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const intensity = getBackdropIntensity(status, reduceMotion);
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || intensity === 0) return;

    let animationFrame = 0;
    let tick = 0;
    const particles = Array.from({ length: Math.min(90, Math.max(32, Math.round(window.innerWidth / 18))) }, (_, index) => ({
      x: (index * 97) % window.innerWidth,
      y: (index * 53) % window.innerHeight,
      speed: 0.18 + (index % 7) * 0.035,
      size: 0.8 + (index % 5) * 0.22
    }));

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function draw() {
      tick += 1;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = `rgba(159, 232, 112, ${0.18 * intensity})`;
      for (const particle of particles) {
        particle.y = (particle.y + particle.speed * intensity) % canvas.height;
        const drift = Math.sin((tick + particle.x) / 90) * 8 * intensity;
        context.beginPath();
        context.arc(particle.x + drift, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      }
      animationFrame = window.requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    draw();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, [status]);

  return (
    <div className={`space-backdrop ${status}`} aria-hidden="true" style={{ "--learning-energy": `${progressPercent}%` } as React.CSSProperties}>
      <canvas className="space-canvas" ref={canvasRef} />
      <span className="space-nebula space-nebula--green" />
      <span className="space-nebula space-nebula--violet" />
      <span className="cockpit-grid" />
    </div>
  );
}
```

- [ ] **步骤 7：创建统一导出**

创建 `components/immersive/index.ts`：

```ts
export { CompletionBurst } from "./completion-burst";
export { EnergyRunway } from "./energy-runway";
export { ImmersiveBackdrop } from "./immersive-backdrop";
export { NebulaProgress } from "./nebula-progress";
```

- [ ] **步骤 8：运行组件测试验证绿灯**

运行：

```bash
npm test -- tests/immersive/components.test.tsx tests/immersive/visual-state.test.ts
```

预期：7 个测试全部通过。

- [ ] **步骤 9：Commit 组件实现**

```bash
git add components/immersive tests/immersive/components.test.tsx
git commit -m "feat-from-codex: 实现沉浸式视觉组件"
```

---

### 任务 4：接入 LearningStudio

**文件：**
- 修改：`app/learning-studio.tsx`

- [ ] **步骤 1：导入沉浸式组件**

在 `app/learning-studio.tsx` 增加导入：

```tsx
import {
  CompletionBurst,
  EnergyRunway,
  ImmersiveBackdrop,
  NebulaProgress
} from "@/components/immersive";
```

- [ ] **步骤 2：计算当前阶段 ID 和完成爆发类型**

在 `projectLessonIndex` 下方增加：

```tsx
const activeStageId = lesson.stageId;
const completionVariant = isProject ? "project" : "lesson";
```

- [ ] **步骤 3：在 `app-shell` 内接入背景层**

将：

```tsx
<div className="app-shell">
```

改为：

```tsx
<div className={`app-shell visual-${status}`}>
  <ImmersiveBackdrop status={status} progressPercent={progressPercent} />
```

- [ ] **步骤 4：在侧边栏接入知识星云**

在 `progress-track` 后添加：

```tsx
<NebulaProgress stages={roadmap} activeStageId={activeStageId} progressPercent={progressPercent} />
```

- [ ] **步骤 5：在挑战区和运行区之间接入能量通道**

在 `</section>` 结束 challenge 之后、runtime section 之前添加：

```tsx
<EnergyRunway status={status} />
```

- [ ] **步骤 6：在总结区附近接入完成爆发**

在 summary panel 渲染逻辑附近添加：

```tsx
<CompletionBurst visible={status === "success"} variant={completionVariant} />
```

如果当前 `summary-panel` 是条件渲染，`CompletionBurst` 与 `summary-panel` 同级，保证不会覆盖总结内容。

- [ ] **步骤 7：运行构建级检查**

运行：

```bash
npx tsc --noEmit
npm test -- tests/immersive/components.test.tsx tests/immersive/visual-state.test.ts
```

预期：TypeScript 检查通过；沉浸式测试全部通过。

- [ ] **步骤 8：Commit 学习室接入**

```bash
git add app/learning-studio.tsx
git commit -m "feat-from-codex: 接入沉浸式学习视觉层"
```

---

### 任务 5：实现空间、粒子与能量反馈样式

**文件：**
- 修改：`app/globals.css`
- 创建：`tests/immersive/styles.test.ts`

- [ ] **步骤 1：编写失败的样式契约测试**

创建 `tests/immersive/styles.test.ts`：

```ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync("app/globals.css", "utf8");

test("沉浸式样式包含空间背景、星云进度、能量通道和完成爆发", () => {
  for (const selector of [
    ".space-backdrop",
    ".space-canvas",
    ".cockpit-grid",
    ".nebula-progress",
    ".energy-runway",
    ".completion-burst"
  ]) {
    assert.ok(css.includes(selector), `${selector} 应存在`);
  }
});

test("沉浸式样式支持减少动态效果", () => {
  assert.ok(css.includes("@media (prefers-reduced-motion: reduce)"));
  assert.ok(css.includes(".space-canvas"));
  assert.ok(css.includes(".completion-burst"));
});
```

- [ ] **步骤 2：运行测试验证红灯**

运行：

```bash
npm test -- tests/immersive/styles.test.ts
```

预期：失败，错误包含 `.space-backdrop 应存在`。

- [ ] **步骤 3：新增设计 token**

在 `:root` 中增加：

```css
  --cyan: #6ee7ff;
  --violet: #7c5cff;
  --nebula: rgba(124, 92, 255, 0.18);
  --glass: rgba(13, 17, 23, 0.68);
  --glow-green: 0 0 32px rgba(159, 232, 112, 0.28);
  --glow-cyan: 0 0 32px rgba(110, 231, 255, 0.22);
```

- [ ] **步骤 4：新增空间背景样式**

在 `.app-shell` 附近新增：

```css
.app-shell { position: relative; overflow: hidden; }
.app-shell > :not(.space-backdrop) { position: relative; z-index: 1; }
.space-backdrop { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; background: radial-gradient(circle at 70% 8%, rgba(159, 232, 112, 0.16), transparent 30%), radial-gradient(circle at 16% 28%, rgba(124, 92, 255, 0.16), transparent 28%); }
.space-canvas { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0.72; }
.space-nebula { position: absolute; width: 42vw; height: 42vw; border-radius: 50%; filter: blur(46px); opacity: 0.22; }
.space-nebula--green { right: 4vw; top: -16vw; background: var(--green); }
.space-nebula--violet { left: -14vw; top: 20vh; background: var(--violet); }
.cockpit-grid { position: absolute; left: 18vw; right: -8vw; bottom: -18vh; height: 44vh; background-image: linear-gradient(rgba(159, 232, 112, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(159, 232, 112, 0.08) 1px, transparent 1px); background-size: 34px 34px; transform: perspective(620px) rotateX(62deg); transform-origin: bottom; opacity: 0.42; }
```

- [ ] **步骤 5：新增知识星云样式**

在 sidebar 相关样式后新增：

```css
.nebula-progress { margin: 0 0 22px; padding: 14px; border: 1px solid rgba(159, 232, 112, 0.18); background: linear-gradient(145deg, rgba(159, 232, 112, 0.09), rgba(124, 92, 255, 0.08)); box-shadow: var(--glow-green); }
.nebula-progress__core { display: grid; gap: 3px; margin-bottom: 13px; }
.nebula-progress__core strong { color: var(--green-bright); font-size: 26px; letter-spacing: -0.06em; }
.nebula-progress__core small { color: var(--quiet); font-size: 8px; text-transform: uppercase; letter-spacing: .14em; }
.nebula-progress__stages { display: grid; grid-template-columns: repeat(5, 1fr); gap: 7px; }
.nebula-stage { min-width: 0; position: relative; display: grid; gap: 5px; place-items: center; padding: 8px 4px; border: 1px solid rgba(137, 147, 164, 0.16); background: rgba(8, 11, 15, 0.58); }
.nebula-stage__index { color: var(--quiet); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 8px; }
.nebula-stage__star { width: 9px; height: 9px; border-radius: 50%; background: linear-gradient(135deg, var(--quiet), #252d38); box-shadow: 0 0 12px rgba(137, 147, 164, 0.2); }
.nebula-stage__title { max-width: 100%; color: var(--muted); font-size: 7px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nebula-stage.active { border-color: rgba(159, 232, 112, 0.45); box-shadow: var(--glow-green); }
.nebula-stage.active .nebula-stage__star, .nebula-stage.done .nebula-stage__star { background: var(--green-bright); box-shadow: 0 0 18px rgba(184, 255, 133, 0.72); }
.nebula-stage__core { position: absolute; inset: 5px; border: 1px solid rgba(184, 255, 133, 0.24); border-radius: 50%; animation: nebula-pulse 1.8s ease-in-out infinite; }
```

- [ ] **步骤 6：新增能量通道和完成爆发样式**

在 runtime 样式前新增：

```css
.energy-runway { max-width: 1120px; height: 32px; display: flex; align-items: center; gap: 12px; color: var(--quiet); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 8px; }
.energy-runway__beam { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(159, 232, 112, 0.35), transparent); position: relative; overflow: hidden; }
.energy-runway.running .energy-runway__beam::after, .energy-runway.success .energy-runway__beam::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, var(--green-bright), transparent); animation: energy-run 1.1s linear infinite; }
.energy-runway.wrong .energy-runway__beam { background: linear-gradient(90deg, transparent, rgba(255, 107, 107, 0.45), transparent); }
.completion-burst { max-width: 1120px; margin-top: 12px; padding: 14px 18px; display: none; align-items: center; gap: 14px; border: 1px solid rgba(159, 232, 112, 0.3); background: rgba(159, 232, 112, 0.08); box-shadow: var(--glow-green); }
.completion-burst.visible { display: flex; animation: rise .35s ease-out; }
.completion-burst.project { border-color: rgba(110, 231, 255, 0.4); box-shadow: var(--glow-cyan); background: rgba(110, 231, 255, 0.07); }
.completion-burst__ring { width: 38px; height: 38px; border: 1px solid currentColor; border-radius: 50%; color: var(--green); box-shadow: 0 0 24px currentColor; }
.completion-burst.project .completion-burst__ring { color: var(--cyan); }
.completion-burst strong, .completion-burst small { display: block; }
.completion-burst strong { font-size: 11px; }
.completion-burst small { color: var(--muted); margin-top: 4px; font-size: 9px; }
```

- [ ] **步骤 7：新增动画和响应式降级**

在 keyframes 附近新增：

```css
@keyframes energy-run { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
@keyframes nebula-pulse { 50% { opacity: .35; transform: scale(1.18); } }
@media (prefers-reduced-motion: reduce) {
  .space-canvas { display: none; }
  .cockpit-grid, .space-nebula, .completion-burst__ring, .energy-runway__beam::after { animation: none !important; }
}
```

在移动端媒体查询中增加：

```css
  .space-canvas { display: none; }
  .nebula-progress { display: none; }
  .energy-runway { padding-inline: 4px; }
```

- [ ] **步骤 8：运行样式测试验证绿灯**

运行：

```bash
npm test -- tests/immersive/styles.test.ts
```

预期：2 个测试全部通过。

- [ ] **步骤 9：Commit 样式实现**

```bash
git add app/globals.css tests/immersive/styles.test.ts
git commit -m "feat-from-codex: 增加沉浸式空间与能量动效"
```

---

### 任务 6：文档更新和完整验证

**文件：**
- 修改：`docs/PRODUCT.md`
- 修改：`docs/ARTICHECTURE.md`
- 修改：`session-handoff.md`

- [ ] **步骤 1：更新产品文档**

在 `docs/PRODUCT.md` 的已实现体验列表中加入：

```markdown
- 沉浸式 Runtime Cockpit 背景。
- Knowledge Nebula 学习进度星云。
- 正确答题、运行中和完成时的能量反馈。
```

在 Product Principles 中加入：

```markdown
- 酷炫效果必须服务学习，不遮挡代码和题目。
- 关键时刻可以强反馈，常态阅读保持稳定。
```

- [ ] **步骤 2：更新架构文档**

在 `docs/ARTICHECTURE.md` 的模块边界中加入：

```text
lib/immersive/visual-state.ts
  -> 学习状态到沉浸式视觉状态的纯函数映射

components/immersive/*
  -> Runtime Cockpit、Knowledge Nebula、EnergyRunway 和 CompletionBurst 视觉组件
```

在 Runtime Boundaries 中加入：

```markdown
沉浸式视觉层只读取 `status`、`progressPercent`、`lesson.stageId` 和 `lesson.kind`，不写入学习进度，不触发课程切换，也不执行学习者代码。
```

- [ ] **步骤 3：更新交接文档**

在 `session-handoff.md` 中记录：

```markdown
- 已实现 Runtime Cockpit + Knowledge Nebula 沉浸式视觉层。
- 新增 `components/immersive/*` 与 `lib/immersive/visual-state.ts`。
- 支持 `prefers-reduced-motion` 降级。
- 最新验证命令见 Validation History。
```

- [ ] **步骤 4：运行完整验证**

运行：

```bash
npm run validate:curriculum
npm test
npm run lint
npm run build
git diff --check
```

预期：

- `npm run validate:curriculum` 通过。
- `npm test` 全部通过。
- `npm run lint` 通过。
- `npm run build` 通过，允许出现已有 multiple lockfile warning。
- `git diff --check` 无输出。

- [ ] **步骤 5：Commit 文档和验收**

```bash
git add docs/PRODUCT.md docs/ARTICHECTURE.md session-handoff.md
git commit -m "feat-from-codex: 记录沉浸式学习体验验收"
```

---

## 自检记录

- 规格覆盖度：覆盖 Runtime Cockpit、Knowledge Nebula、Moment Effects、组件边界、状态流、CSS token、响应式、reduced motion、测试和文档更新。
- 红旗扫描：计划不包含未定语义；每个任务有精确文件、命令和验收输出。
- 类型一致性：`LearningVisualStatus` 与现有 `LearningStudio` 的 `status` 联合类型一致；`CompletionBurstVariant` 与 `lesson.kind === "stage-project"` 的判断一致；`NebulaProgress` 使用现有 `RoadmapStage`。

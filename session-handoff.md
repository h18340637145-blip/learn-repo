# Session Handoff

## Current State

Project: NodePath, a visual Node.js learning website built on Next.js 16.

Current branch:

```text
codex/nodepath-3d-spatial-learning
```

当前应用是带沉浸式视觉层的课程驱动学习原型。UI 仍在 `/` 渲染学习工作台，但课程数据、课程结构、authored trace 执行、校验、进度存储和沉浸式视觉状态已经拆成独立模块。阶段 01–03、05–10 已完整发布 Node.js 学习内容和阶段项目，阶段 04 当前保留两个已发布案例。

阶段 05–10 的实现当前保留在工作树中，尚未提交或合并：本次会话的 Git 索引写入受用量限制阻止。`AGENTS.md` 和 `.superpowers/**` 中的既有改动不属于本轮课程实现，后续提交时应继续排除。

Expected dirty state after this session:

- `.superpowers/brainstorm/8292-1784101222/.server-info` deleted.
- `.superpowers/brainstorm/8292-1784101222/.server-stopped` untracked.

Those files came from the earlier visual brainstorming server and are intentionally not part of this implementation.

## What Exists

Curriculum foundation:

- 10 required stages.
- 80 knowledge points.
- 10 stage projects.
- 83 currently published playable cases.

Published cases:

- Stage 01: 8 runtime/CLI lessons plus the CLI system inspector project.
- Stage 02: 8 modules/packages/TypeScript lessons plus the dependency inspector project.
- Stage 03: 8 async/events lessons plus the task scheduler project.
- Stage 04: Stream backpressure and the CLI log analyzer project.
- Stage 05: 8 HTTP lessons plus the static file server project.
- Stage 06: 8 API/service design lessons plus the task REST API project.
- Stage 07: 8 process/concurrency lessons plus the Worker report project.
- Stage 08: 8 realtime lessons plus the notification service project.
- Stage 09: 8 testing/security lessons plus the tested authentication project.
- Stage 10: 8 diagnostics/production lessons plus the production diagnostics project.

Core interaction:

- Learner reads concept and code.
- Learner chooses an answer.
- Wrong answer shows option-specific feedback.
- Correct answer starts a cancellable authored trace.
- 已实现 Runtime Cockpit + Knowledge Nebula 沉浸式视觉层。
- Runtime Cockpit、Knowledge Nebula、EnergyRunway 和 CompletionBurst 会响应答题正确、运行中和完成状态。
- 已新增阶段星图导航，课程不再全部平铺在全局导航中。
- 已新增结构化 `execution.visualizer`，重点阶段映射到主题化 3D 场景。
- 已新增 Three.js 运行舱和 WebGL / 减少动态效果 fallback。
- Terminal panel shows simulated logs.
- Summary appears after completion.
- Completion is saved to browser local progress and restored after refresh.
- 支持 `prefers-reduced-motion` 降级。

Important product boundary:

- The current app uses deterministic authored traces.
- It does not execute arbitrary Node.js code.
- A real sandbox remains a separate future plan.

## 3D 空间化学习体验

- 左侧导航现在使用 `StageSidebar`，只展示 10 个阶段入口。
- 主内容区使用 `StageSpaceMap`，只展示当前阶段课程和阶段项目。
- 答对题目后，`SpatialRuntimeVisualizer` 会根据课程 `execution.visualizer` 尝试展示 Three.js 运行舱。
- WebGL 不可用、移动端或开启减少动态效果时，会使用 `VisualizerFallback` 保留可读运行顺序。
- 重点场景覆盖 HTTP 管线、服务边界、Worker 并发、实时星网、测试安全边界和诊断生产观测。
- 当前实现仍使用确定性 authored traces，不执行学习者提交的任意 Node.js 代码。
- 验证命令：`npm test`、`npx tsc --noEmit`、`npm run validate:curriculum`、`npm run lint`、`npm run build`、`git diff --check`。

## Important Files

- `content/curriculum.ts`: 10-stage/80-point master curriculum catalog.
- `content/legacy-lessons.ts`: migrated original 4 prototype cases.
- `content/lessons/lesson-factory.ts`: helper for standard LessonSpec creation.
- `content/lessons/stage-01-runtime-cli.ts`: complete stage 01 content.
- `content/lessons/stage-02-modules-packages.ts`: complete stage 02 content.
- `content/lessons/stage-03-async-events.ts`: complete stage 03 content.
- `content/lessons/advanced-lesson-factory.ts`: shared helper for stage 05–10 lesson specifications.
- `content/lessons/stage-05-http-foundations.ts`: complete stage 05 content.
- `content/lessons/stage-06-api-design.ts`: complete stage 06 content.
- `content/lessons/stage-07-process-concurrency.ts`: complete stage 07 content.
- `content/lessons/stage-08-realtime.ts`: complete stage 08 content.
- `content/lessons/stage-09-testing-security.ts`: complete stage 09 content.
- `content/lessons/stage-10-diagnostics-production.ts`: complete stage 10 content.
- `content/lesson-registry.ts`: published lesson registry, stage 01–03 and 05–10 aggregation, and stage 04 migration metadata.
- `lib/curriculum/types.ts`: shared curriculum and lesson types.
- `lib/curriculum/validate.ts`: catalog and lesson validators.
- `lib/curriculum/view-model.ts`: roadmap view model.
- `lib/curriculum/stage-space.ts`: 阶段空间 view model。
- `lib/curriculum/visualizers.ts`: 课程运行可视化配置映射。
- `lib/execution/authored-trace.ts`: cancellable authored trace runner.
- `lib/immersive/visual-state.ts`: 学习状态到沉浸式视觉状态的纯函数映射。
- `lib/progress/*`: local progress repository boundary.
- `components/immersive/*`: Runtime Cockpit、Knowledge Nebula、EnergyRunway、CompletionBurst 和相关视觉组件。
- `components/learning-space/*`: 阶段入口和当前阶段星图组件。
- `components/visualizers/*`: Three.js 运行舱、运行场景和 fallback。
- `scripts/validate-curriculum.ts`: curriculum validation CLI.
- `app/learning-studio.tsx`: client learning studio consuming registry, roadmap, runner, and progress.
- `app/globals.css`: visual system and responsive behavior.
- `docs/PRODUCT.md`: product and curriculum harness.
- `docs/ARTICHECTURE.md`: architecture harness.

## Validation History

Latest automatic validation for the stage 05–10 curriculum launch:

```bash
npx tsc --noEmit -> pass.
node --import tsx scripts/validate-curriculum.ts -> pass. 输出：课程校验通过：10 个阶段，83 个已发布案例。
node --import tsx --test tests/**/*.test.ts tests/**/*.test.tsx -> pass. 31 tests, 31 pass, 0 fail.
npm run lint -> pass.
npm run build -> pass. 仅出现已有 multiple lockfiles warning。
git diff --check -> pass. 无输出。
```

Verification notes:

- 阶段 05–10 新增 54 个完整案例，其中包含 48 个知识点和 6 个阶段项目。
- 阶段 09/10 的 18 个内嵌 Node.js 示例已通过 JavaScript 语法解析。
- HTTP 集成示例在普通沙箱中执行到 `listen(0)` 时会因端口权限返回 `EPERM`；目录、规格、类型、语法和完整应用构建均已通过。
- `npm run build` 首次在普通沙箱中因 Turbopack 绑定 CSS 处理端口失败，获得权限后重跑通过。
- 当前课程实现仍使用确定性 authored traces，不执行学习者提交的任意代码。

Latest automatic validation for the immersive learning layer:

```bash
npm run validate:curriculum -> pass. 输出：课程校验通过：10 个阶段，29 个已发布案例。
npm test -> pass. 29 tests, 29 pass, 0 fail。包含 tests/**/*.test.tsx 组件测试。
npm run lint -> pass.
npm run build -> pass. 仅出现已有 multiple lockfiles warning。
git diff --check -> pass. 无输出。
```

Verification notes:

- `npm run validate:curriculum` 和 `npm test` 在普通沙箱内因 `tsx` IPC `listen EPERM` 失败，已按要求升级权限重跑并通过。
- `npm run build` 在普通沙箱内因 Turbopack 本地端口绑定失败，已按要求升级权限重跑并通过。

Notes:

- `npm test` uses `tsx`; in this sandbox it may need permission because `tsx` creates a local IPC pipe.
- `npm run build` may need permission because Turbopack can bind a local port for CSS processing.
- Next may warn about multiple lockfiles and infer a workspace root above this project. That warning has not blocked successful builds.

Latest targeted curriculum acceptance during the stage 01–03 fill:

```text
npx tsc --noEmit -> pass.
npm test -- tests/curriculum/registry.test.ts tests/curriculum/catalog.test.ts tests/curriculum/validate.test.ts tests/curriculum/view-model.test.ts -> 19 tests, 19 pass, 0 fail.
```

Previous stage 1 acceptance was run on this branch:

```text
npm run validate:curriculum -> 课程校验通过：10 个阶段，4 个已发布案例。
npm test -> 16 tests, 16 pass, 0 fail.
npm run lint -> pass.
npm run build -> pass with the existing multiple-lockfile warning.
git diff --check -> pass.
```

Manual browser acceptance on `http://localhost:55460/`:

- Desktop viewport showed 10 roadmap stages and no horizontal overflow.
- Event Loop wrong answer showed option-specific feedback.
- Correct answer ran the authored trace and displayed terminal logs.
- Completion summary appeared after the trace.
- Progress survived page reload.
- Switching lessons during a Stream trace cancelled stale frames.
- Mobile viewport had no horizontal page overflow.
- A hydration mismatch caused by reading `localStorage` during initial client render was fixed. Progress now starts from empty server-safe state and loads from local storage after mount; browser console errors were empty after reload.

## Next Recommended Work

Highest-value next plan:

1. Complete the remaining stage 04 file, Buffer, and Stream lessons from official Node.js learning docs.
2. Add at least 3 question variants per knowledge point.
3. Add visualizers beyond `lane-flow` for module resolution, event loop flow, Stream/HTTP flow and concurrency.
4. Keep normal lessons on authored traces.
5. Design the first real sandbox separately for later stage projects.

Later plans:

- Stage 04 content plus Stream/HTTP visualizers.
- Expand stages 05–10 with concurrency, security, and diagnostics-specific visualizers.
- Final real-time collaboration project.
- Supabase-backed user progress and cross-device sync.

## Operating Notes

- Use npm because `package-lock.json` is present.
- Read local Next docs before changing framework-level code.
- Preserve the current dark developer-lab visual direction.
- Keep the learning experience as the first screen.
- Avoid remote Google fonts.
- Do not overwrite unrelated dirty worktree changes.

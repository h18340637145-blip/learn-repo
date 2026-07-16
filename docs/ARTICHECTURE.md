# NodePath Architecture Harness

## Snapshot

NodePath 是一个 Next.js 16 App Router 单页学习应用。当前页面仍渲染在 `/`，但课程数据、执行逻辑和进度存储已经从 UI 组件中拆出。

```text
app/layout.tsx
  -> app/page.tsx
    -> app/learning-studio.tsx
      -> content/curriculum.ts
      -> content/lesson-registry.ts
      -> lib/execution/authored-trace.ts
      -> lib/progress/*

app/globals.css
  -> global design tokens
  -> app layout
  -> responsive rules
```

## Framework

- Next.js `16.2.10`
- React `19.2.4`
- TypeScript
- Tailwind CSS v4 via `@import "tailwindcss"`
- ESLint flat config

This project uses the App Router. `app/layout.tsx` and `app/page.tsx` are Server Components by default. `app/learning-studio.tsx` is a Client Component because it uses state, event handlers, animation control, and browser `localStorage`.

Before changing framework behavior, check the local docs under:

```text
node_modules/next/dist/docs/
```

## Module Boundaries

```text
content/curriculum.ts
  -> 10 阶段、80 个计划知识点、10 个阶段项目的课程主目录

content/legacy-lessons.ts
  -> 从原型迁移来的 4 个旧案例原始内容

content/lessons/lesson-factory.ts
  -> 生成标准 LessonSpec，统一 nodeVersion、题目结构、authored trace 和来源日期

content/lessons/advanced-lesson-factory.ts
  -> 为阶段 05–10 提供精简课程工厂，内部仍生成标准 LessonSpec

content/lessons/stage-01-runtime-cli.ts
  -> 阶段 01：运行时、浏览器差异、V8、LTS、CLI、REPL、argv、env/console 和 CLI 系统探测器

content/lessons/stage-02-modules-packages.ts
  -> 阶段 02：ESM、模块解析、package type、node: 前缀、依赖类型、SemVer/scripts、require 缓存、TypeScript 和依赖检查器

content/lessons/stage-03-async-events.ts
  -> 阶段 03：callback、Promise、async/await、异步错误、事件循环、nextTick、setImmediate、EventEmitter/Abort 和任务调度器

content/lessons/stage-05-http-foundations.ts
  -> 阶段 05：HTTP 事务、服务器、请求响应、路由、请求体、流式传输和静态文件服务器

content/lessons/stage-06-api-design.ts
  -> 阶段 06：REST 建模、校验、错误、配置、日志、超时、取消、健康检查和任务 API

content/lessons/stage-07-process-concurrency.ts
  -> 阶段 07：事件循环阻塞、线程池、子进程、Worker、IPC、共享内存、Cluster 和报表引擎

content/lessons/stage-08-realtime.ts
  -> 阶段 08：轮询、SSE、WebSocket 握手、连接生命周期、心跳、广播、背压、恢复和通知服务

content/lessons/stage-09-testing-security.ts
  -> 阶段 09：Node 测试运行器、断言、生命周期、Mock、覆盖率、集成测试、安全和鉴权项目

content/lessons/stage-10-diagnostics-production.ts
  -> 阶段 10：Inspector、CPU/内存/GC/火焰图、性能基线、可观测性、发布事故和生产诊断项目

content/lesson-registry.ts
  -> 已发布课程注册表
  -> 聚合阶段 01–03、05–10 正式课程
  -> 保留阶段 04 旧案例到 LessonSpec 的迁移适配

lib/curriculum/types.ts
  -> 课程目录、课程规格、题目、来源、运行帧类型

lib/curriculum/validate.ts
  -> 无副作用课程校验函数

lib/curriculum/view-model.ts
  -> 课程目录 + 进度 -> 侧边栏路线视图模型

lib/execution/authored-trace.ts
  -> 可取消的预设轨迹异步生成器

lib/progress/*
  -> 与 UI 解耦的本地进度仓储

lib/immersive/visual-state.ts
  -> 学习状态到沉浸式视觉状态的纯函数映射

components/immersive/*
  -> Runtime Cockpit、Knowledge Nebula、EnergyRunway 和 CompletionBurst 视觉组件
```

## Runtime Boundaries

当前执行模型：

- 浏览器渲染学习工作台。
- 用户选择答案。
- 正确答案启动 `streamAuthoredTrace()`。
- `AbortController` 负责切换课程或重新作答时取消旧轨迹。
- 终端面板显示课程内预设日志。
- 完整运行结束后写入本地进度仓储。

当前没有后端 API、数据库、认证或任意代码执行。已发布课程虽然使用真实 Node.js 代码示例，但浏览器仍只播放课程作者编排好的运行帧和日志。

沉浸式视觉层只读取 `status`、`progressPercent`、`lesson.stageId` 和 `lesson.kind`。它不写入学习进度，不触发课程切换，也不执行学习者代码。

`ImmersiveBackdrop` 是当前唯一直接使用 Canvas 和 `window` 的 Client Component。其他沉浸式组件保持展示职责，只消费上层传入的视觉状态。

## Data Model

核心课程类型是 `LessonSpec`：

- `id`, `stageId`, `kind`: 稳定身份和课程类型。
- `objectives`, `prerequisites`, `summary`: 学习目标和总结。
- `files`, `entryFile`: 展示给学习者的代码文件。
- `questions`: 题目、选项、正确答案和定向反馈。
- `execution`: authored trace 可视化配置。
- `sources`: 官方来源和校验日期。

已发布课程的质量约束：

- 至少 1 个代码文件，且入口文件必须存在。
- 至少 1 道选择题，正确答案必须存在于选项中。
- 每个选项都必须提供定向反馈。
- 至少 3 个 authored trace 运行帧。
- 至少 3 条知识总结。
- 至少 1 个官方来源。

课程目录使用 `CurriculumStage`：

- 每阶段 8 个 `CatalogLesson`。
- 每阶段 1 个 `stage-project`。
- `status` 区分 `published` 与 `planned`。

## State Flow

```text
openLesson(index)
  -> abort current run
  -> reset selected answer, status, frame, frame index

chooseAnswer(answer)
  -> wrong answer: status = "wrong"
  -> correct answer: status = "running"
    -> stream authored frames
    -> update frame and frameIndex
    -> status = "success"
    -> save progress

nextLesson()
  -> open the next published lesson
```

`localStorage` 只通过 `lib/progress/browser-progress-repository.ts` 进入 UI。损坏进度数据会回退为空进度。

## Styling Architecture

应用仍使用一个全局 stylesheet：

- CSS custom properties define the palette.
- Layout classes define top bar, sidebar, lesson panels, challenge, runtime visualizer, terminal, and completion summary.
- Progress bar width uses `--progress`.
- Responsive breakpoints at `1050px` and `760px` adapt the workspace to tablet and mobile.
- `prefers-reduced-motion` disables meaningful animation for reduced-motion users.

If UI complexity grows, split focused React components before splitting CSS. The current single stylesheet is still manageable.

## Metadata

`app/layout.tsx` exports static metadata:

- Chinese title and description.
- `metadataBase` from `NEXT_PUBLIC_SITE_URL` with local fallback.
- Open Graph and Twitter image references to `/og.png`.

Keep remote fonts out of this file unless the build environment is known to allow external font fetching.

## Safe Execution Direction

Do not run learner-submitted code directly in the Next.js process.

Current beginner lessons should prefer authored traces. Real project execution should be designed as a separate sandbox boundary with:

- Trusted templates and controlled patches.
- Input limits.
- Timeout.
- Memory cap.
- File system access policy.
- Network access policy.
- Log capture.
- Error serialization.

## Validation

Use:

```bash
npm run validate:curriculum
npm test
npm run lint
npm run build
git diff --check
```

For documentation-only changes, `git diff --check` is sufficient.

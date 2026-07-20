# NodePath Architecture Harness

## Snapshot

NodePath 是一个 Next.js 16 App Router 多课程学习应用。`/` 是课程选择首页，`/nodejs` 和 `/nextjs` 分别渲染独立学习工作台；课程数据、执行逻辑和进度存储已经从 UI 组件中拆出。

```text
app/layout.tsx
  -> app/page.tsx
      -> course selection cards
  -> app/nodejs/page.tsx
    -> app/nodejs/learning-studio.tsx
      -> app/_components/learning-studio.tsx
      -> content/curriculum-registry.ts
      -> content/lesson-registry.ts
  -> app/nextjs/page.tsx
    -> app/nextjs/learning-studio.tsx
      -> app/_components/learning-studio.tsx
      -> content/curriculum-registry.ts
      -> content/lesson-registry.ts

app/_components/learning-studio.tsx
  -> lib/curriculum/stage-space.ts
  -> lib/execution/authored-trace.ts
  -> lib/progress/*
  -> components/learning-space/*
  -> components/visualizers/*

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

This project uses the App Router. `app/layout.tsx`, `app/page.tsx`, `app/nodejs/page.tsx` and `app/nextjs/page.tsx` are Server Components by default. `app/_components/learning-studio.tsx` and per-course `learning-studio.tsx` wrappers are Client Components because they use state, event handlers, animation control, and browser `localStorage`.

Before changing framework behavior, check the local docs under:

```text
node_modules/next/dist/docs/
```

## Module Boundaries

```text
content/curriculum.ts
  -> 00 基础训练营和 10 个正式阶段、88 个计划知识点、11 个阶段项目的课程主目录

content/curriculum-nextjs.ts
  -> Next.js 10 个阶段、80 个知识点、10 个阶段项目的课程主目录；当前 90 个节点均已发布

content/curriculum-registry.ts
  -> 聚合 Node.js 与 Next.js CourseSpec，提供 allCourses 和 getCourse(courseId)

content/legacy-lessons.ts
  -> 从原型迁移来的 4 个旧案例原始内容

content/lessons/lesson-factory.ts
  -> 生成标准 LessonSpec，统一默认运行环境标签、题目结构、可追加多题、authored trace 和来源日期

content/lessons/nextjs/nextjs-lesson-factory.ts
  -> Next.js 专属 LessonSpec 工厂，默认运行环境标签为 Next.js 16.x

content/lessons/nextjs/nextjs-quick-lesson.ts
  -> Next.js 后续题库的轻量课程工厂，统一生成真实代码案例、预测题、定向反馈、运行轨迹和官方来源

content/lessons/advanced-lesson-factory.ts
  -> 为阶段 05–10 提供精简课程工厂，内部仍生成标准 LessonSpec

content/lessons/stage-00-foundations.ts
  -> 阶段 00：Node.js 与 JavaScript、变量类型、集合、函数、分支循环、错误处理、console、process/path/fs 和命令行文件统计器

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

content/lessons/nextjs/stage-00-foundations.ts
  -> Next.js 阶段 00：框架定位、App Router、页面与动态路由、布局、Server Components、Client Components、Link 预取、环境变量和多页个人主页

content/lessons/nextjs/stage-01-routing.ts ... stage-09-architecture.ts
  -> Next.js 阶段 01–09：路由、渲染、数据获取、样式优化、API、认证、数据库、测试部署和高级生产架构的完整题库与阶段项目

content/lesson-registry.ts
  -> 已发布课程注册表
  -> 聚合阶段 00–03、05–10 正式课程
  -> 保留阶段 04 旧案例到 LessonSpec 的迁移适配
  -> 聚合 Next.js 90 个已发布案例
  -> 导出 Node.js 兼容别名 publishedLessons、nextjsPublishedLessons 和 getLessonsByCourse(courseId)

lib/curriculum/types.ts
  -> CourseId、CourseSpec、课程目录、题目、来源、运行帧和 Next.js 可视化类型

lib/curriculum/validate.ts
  -> 无副作用课程校验函数；Node.js 校验 11 个阶段，Next.js 校验 10 个阶段，每阶段 8 个知识点和 1 个阶段项目

lib/curriculum/view-model.ts
  -> 课程目录 + 进度 -> 侧边栏路线视图模型

lib/curriculum/stage-space.ts
  -> 课程目录 + 已发布课程 + 进度 -> 当前阶段星图 view model

lib/curriculum/visualizers.ts
  -> 阶段和课程类型 -> 默认 3D 运行可视化配置

lib/execution/authored-trace.ts
  -> 可取消的预设轨迹异步生成器

lib/progress/*
  -> 与 UI 解耦的本地进度仓储；按 courseId 隔离 localStorage key，并在 ProgressSnapshot 中保留 courseId

lib/immersive/visual-state.ts
  -> 学习状态到沉浸式视觉状态的纯函数映射

components/immersive/*
  -> Runtime Cockpit、Knowledge Nebula、EnergyRunway、CompletionBurst、CursorSparks 和 AchievementUnlock 视觉组件

components/learning-space/*
  -> 左侧阶段入口和当前阶段课程星图

components/visualizers/*
  -> Three.js 运行舱、知识环绕场景、粒子增强层和 WebGL / 减少动态效果 fallback

app/_components/learning-studio.tsx
  -> 共享课程工作台 Client Component，通过 CourseConfig 接收课程、目录、代码标签、终端命令和课程切换信息，并管理单课多题流程

app/_components/question-options.tsx
  -> 统一题目选项 Client Component，支持普通选择题和 implementation 代码方案卡片
```

## Runtime Boundaries

当前执行模型：

- 浏览器渲染学习工作台。
- 用户选择答案。
- 单节课程通过 `questionIndex` 展示当前题，`selectedByQuestion` 记录每题选项，`answeredQuestionIds` 记录已答对题目。
- 答对非最后一道必答题时只显示解析和“进入下一题”，不会写入课程完成进度。
- 完成全部必答题后才启动 `streamAuthoredTrace()`。
- `AbortController` 负责切换课程或重新作答时取消旧轨迹。
- 终端面板显示课程内预设日志。
- 完整运行结束后写入本地进度仓储。

当前即将引入 Supabase 作为后端服务。之前没有后端 API、数据库、认证，现计划通过 Supabase 提供用户认证、跨设备进度同步和数据库支持。已发布课程虽然使用真实 Node.js 代码示例，但浏览器仍只播放课程作者编排好的运行帧和日志。

沉浸式视觉层只读取 `status`、`progressPercent`、`lesson.stageId`、`lesson.kind` 和当前课程标题。它不写入学习进度，不执行学习者代码；课程切换由 App Router 链接 `/nodejs` / `/nextjs` 处理。

`ImmersiveBackdrop` 和 `CursorSparks` 是当前直接使用 Canvas 和 `window` 的沉浸式 Client Component：前者渲染学习空间背景，后者渲染鼠标火花。它们都支持 `prefers-reduced-motion` 降级；其他沉浸式组件保持展示职责，只消费上层传入的视觉状态。

`AchievementUnlock` 是纯展示的游戏化反馈组件。`LearningStudio` 在 `status === "success"` 时传入当前课程标题和 `lesson/project` variant，组件只展示“知识芯片解锁”或“阶段徽章铸造”，不负责写入进度或解锁课程。

### 空间可视化边界

课程数据通过 `execution.visualizer` 描述运行可视化类型。`LearningStudio` 负责传入当前 `status`、`frame` 和 `visualizer`，`components/visualizers` 决定使用 Three.js Canvas 还是 fallback。Three.js 组件只存在于 Client Component 和动态加载边界内；`app/layout.tsx` 继续保持 Server Component。

`RuntimeScene` 负责渲染执行节点、知识环绕轨道和粒子点云。项目依赖声明包含 `three.quarks`、`three-nebula` 和 `proton-engine`；当前实现将 `three.quarks` 作为运行场景的粒子增强桥接点，并用稳定的 Three.js points 渲染可控粒子云，避免专业粒子引擎直接耦合到课程数据结构。后续可以在 `QuarksParticleAura` 内逐步替换为更复杂的发射器配置。

`SpatialRuntimeVisualizer` 在客户端使用 `ResizeObserver`、`window.resize` 和媒体查询监听运行舱尺寸变化。WebGL 不可用、减少动态效果、移动端或运行舱容器宽度低于 640px 时，组件直接渲染 `VisualizerFallback`；宽屏恢复后再切回动态加载的 `SpatialRuntimeCanvas`。这保证浏览器 resize 时不会留下被隐藏或清屏失败的 Canvas 空白层。

阶段导航通过 `lib/curriculum/stage-space.ts` 生成阶段空间模型。左侧 `StageSidebar` 展示当前课程的阶段入口，并仅展开当前阶段的可点击知识点，避免把完整课程列表一次性铺满导航；主内容区 `StageSpaceMap` 继续展示当前阶段的知识点和阶段项目。Next.js 路线复用同一阶段导航模型，展示 10 个 Next.js 阶段。

## Data Model

核心课程类型是 `LessonSpec`：

- `id`, `stageId`, `kind`: 稳定身份和课程类型。
- `objectives`, `prerequisites`, `summary`: 学习目标和总结。
- `files`, `entryFile`: 展示给学习者的代码文件。
- `questions`: 题目、选项、正确答案和定向反馈。
- `questions[].type`: 当前支持 prediction、implementation、diagnosis、repair、completion、execution-order、best-practice、concept-match、equivalent-code、sequence 和 transfer。
- `questions[].options[].code/language/diffLines`: implementation 等代码题使用的代码方案、语言标签和重点行。
- `execution`: authored trace 可视化配置，包含结构化 `visualizer`。
- `sources`: 官方来源和校验日期。

已发布课程的质量约束：

- 至少 1 个代码文件，且入口文件必须存在。
- 至少 1 道选择题，正确答案必须存在于选项中。
- 每个选项都必须提供定向反馈。
- implementation 题至少包含一个代码选项；代码选项必须声明 `language`，`diffLines` 必须是正整数数组。
- 至少 3 个 authored trace 运行帧。
- 至少 3 条知识总结。
- 至少 1 个官方来源。

课程目录使用 `CurriculumStage`：

- 每阶段 8 个 `CatalogLesson`。
- 每阶段 1 个 `stage-project`。
- `status` 区分 `published` 与 `planned`。

课程集合使用 `CourseSpec`：

- `id`: 当前为 `nodejs` 或 `nextjs`。
- `title`, `description`, `icon`: 课程选择与工作台展示元数据。
- `stages`: 对应课程的 `CurriculumStage[]`。

进度使用 `ProgressSnapshot`：

- `courseId`: 进度所属课程。
- Node.js 使用兼容 key `nodepath.progress.v1`。
- Next.js 使用 `nodepath.progress.nextjs.v1`。
- 损坏或旧格式进度会按当前课程回退为空快照。

## State Flow

```text
openLesson(index)
  -> abort current run
  -> reset questionIndex, selectedByQuestion, answeredQuestionIds, status, frame, frame index

chooseAnswer(answer)
  -> wrong answer: status = "wrong"
  -> correct answer before final required question: record answered question and show explanation
  -> final required answer: status = "running"
    -> stream authored frames
    -> update frame and frameIndex
    -> status = "success"
    -> save progress

goToNextQuestion()
  -> questionIndex + 1
  -> reset transient status and frame

nextLesson()
  -> open the next published lesson
```

`localStorage` 只通过 `lib/progress/browser-progress-repository.ts` 进入 UI。损坏进度数据会回退为空进度。后续将替换为或结合 Supabase 的云端进度仓储。

## Styling Architecture

应用仍使用一个全局 stylesheet：

- CSS custom properties define the palette.
- Layout classes define top bar, sidebar, lesson panels, challenge, runtime visualizer, terminal, code-panel depth effects, knowledge orbit effects, and completion summary.
- 全局固定视觉层（`space-backdrop`、`cursor-sparks`、`hud-scanline`）不得进入 `app-shell` 普通文档流；样式中同时通过普通层级选择器排除和直接子元素 fixed 规则保护，避免粒子画布或 HUD 扫描层在小屏顶部撑出留白。顶栏也通过 `.app-shell > .topbar` 保持 sticky，避免被普通层级选择器降级。
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

# NodePath Architecture Harness

## Snapshot

NodePath 是一个 Next.js 16 App Router 多课程学习应用。`/` 是课程选择首页，`/nodejs`、`/nextjs` 和 `/frontend-debugging` 分别渲染独立学习工作台；`/{courseSlug}` 为蓝图路线提供数据驱动入口，有可玩课程时挂载共享学习工作台，无可玩课程时退回规划概览页。课程数据、执行逻辑和进度存储已经从 UI 组件中拆出。

当前课程架构已经从 Node.js / Next.js 双路线扩展为多学院课程注册表。`content/curriculum-registry.ts` 以 8 个学院域组织路线，`CourseSpec` 通过 `domainId`、`slug`、`status` 和 `runtimeSurfaces` 描述课程所属学院、路由标识、发布状态和可用运行舱表面。注册表现在包含 2 条已发布主线、1 条前端调试四阶段路线和 7 条蓝图四阶段预览路线；`lesson-registry` 按 `CourseId` 返回独立课程集合，避免误用 Node.js 题库。

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
  -> app/frontend-debugging/page.tsx
    -> app/frontend-debugging/learning-studio.tsx
      -> app/_components/learning-studio.tsx
      -> content/curriculum-registry.ts
      -> content/lesson-registry.ts
  -> app/[courseSlug]/page.tsx
    -> app/[courseSlug]/course-learning-studio.tsx
    -> playable route or planned course overview
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

This project uses the App Router. `app/layout.tsx`, `app/page.tsx`, `app/nodejs/page.tsx`, `app/nextjs/page.tsx`, `app/frontend-debugging/page.tsx` and `app/[courseSlug]/page.tsx` are Server Components by default. `app/_components/learning-studio.tsx` and per-course `learning-studio.tsx` wrappers are Client Components because they use state, event handlers, animation control, and browser `localStorage`.

Before changing framework behavior, check the local docs under:

```text
node_modules/next/dist/docs/
```

## Module Boundaries

```text
content/curriculum.ts
  -> 00 基础训练营和 10 个正式阶段、88 个主线知识点、11 个阶段项目的课程主目录；阶段 04 额外细化文件 / Buffer / Stream 微知识点

content/curriculum-nextjs.ts
  -> Next.js 10 个阶段、80 个知识点、10 个阶段项目的课程主目录；当前 90 个节点均已发布

content/curriculum-frontend-debugging.ts
  -> 前端报错调试路线主目录；当前发布 4 个阶段、32 个知识点和 4 个阶段项目，共 36 个可玩案例

content/curriculum-registry.ts
  -> 多学院课程注册表，聚合 Node.js、Next.js、前端报错调试和 7 条蓝图四阶段预览 CourseSpec
  -> 导出 courseDomains、allCourses、getCourse(courseId)、getCourseBySlug(slug) 和 getCoursesByDomain(domainId)
  -> CourseSpec 包含 domainId、slug、status 和 runtimeSurfaces，用于首页课程卡、路由包装、规划概览页和课程校验

content/lessons/blueprint-multi-stage.ts
  -> 7 条蓝图路线的多阶段课程工厂导出入口，兼容复用历史 blueprint-first-stage 实现
  -> 当前为 Python、计算机网络、服务端工程、Android、AI 应用、AI Agent 和 AI 数学各生成 32 个知识点和 4 个阶段项目
  -> 所有课程仍使用确定性 authored trace，不执行真实 Python、Android、AI 或网络请求

content/lessons/python/python-lesson-factory.ts
  -> Python 阶段 04–10 专属工厂，通过 PythonLessonSeed / PythonStageProjectSeed 生成知识点和阶段项目
  -> 阶段项目自动附带通用「阶段验证」第二题，满足阶段项目题量校验
  -> 默认运行环境标签为 Python 3.12，可视化沿用 memory-stack / runtime-timeline

content/lessons/python/stage-04-file-batch.ts ... stage-10-automation-pipeline.ts
  -> 7 个真实 Python 阶段：文件批处理、正则解析、HTTP 抓取、CLI、任务调度、子进程运维、自动化流水线
  -> 每阶段 8 个知识点 + 1 个阶段项目，共 63 个新案例，题目基于官方文档来源

lib/curriculum/course-availability.ts
  -> 课程可用性纯函数层
  -> 从 CourseSpec 和 LessonSpec[] 计算开放阶段数、总阶段数、可玩案例数和课程卡下一步文案

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

content/lessons/stage-04-files-streams.ts
  -> 阶段 04：路径、Promise 文件 API、目录 stat、watch、glob、临时目录、Buffer 编码、二进制协议、Base64、Readable、Writable / Transform、Duplex、错误处理、按行解析和 CLI 日志分析器

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

content/lessons/frontend-debugging/stage-00-console-stack.ts
  -> 前端报错调试阶段 00：浏览器控制台、错误栈、Source Map、结构化 console、数据与渲染边界、运行恢复和商品列表白屏事故项目

content/lessons/frontend-debugging/expanded-stages.ts
  -> 前端报错调试阶段 01–03：Network 请求排障、React 渲染问题、构建与环境问题，每阶段 8 个知识点和 1 个阶段项目

content/lesson-registry.ts
  -> 已发布课程注册表
  -> 聚合 Node.js 阶段 00–10 共 106 个可玩案例
  -> 聚合 Next.js 90 个已发布案例
  -> 聚合前端报错调试 36 个已发布案例
  -> 聚合 7 条蓝图路线各 36 个预览案例
  -> 导出 Node.js 兼容别名 publishedLessons、nextjsPublishedLessons、frontendDebuggingPublishedLessons 和 getLessonsByCourse(courseId)

content/questions/*
  -> P1 题库补丁层
  -> 将 diagnosis、repair、completion、execution-order 追加到已发布课程
  -> 通过课程真实标题、概念、入口代码和阶段题型分配生成大规模题库条目
  -> Node.js/Next.js 使用 `p1-question-templates.ts` (JS 语法代码材料)
  -> Python 使用 `python-p1-question-templates.ts` (Python 语法代码材料，materialLanguage=py)

lib/curriculum/types.ts
  -> CourseDomainId、CourseId、CourseSpec、课程目录、题目、来源、运行帧、多运行舱表面和可视化类型

lib/curriculum/validate.ts
  -> 无副作用课程校验函数；Node.js 校验 11 个阶段，Next.js 校验 10 个阶段，普通阶段至少 8 个知识点和 1 个阶段项目，并校验 P1 题型结构、题库引用、课程题量和阶段题型多样性

lib/curriculum/view-model.ts
  -> 课程目录 + 进度 -> 侧边栏路线视图模型

lib/curriculum/stage-space.ts
  -> 课程目录 + 已发布课程 + 进度 -> 当前阶段星图 view model

lib/curriculum/visualizers.ts
  -> 阶段和课程类型 -> 默认 3D 运行可视化配置

lib/execution/authored-trace.ts
  -> 可取消的预设轨迹异步生成器

lib/progress/*
  -> 与 UI 解耦的本地进度仓储；按 courseId 隔离 localStorage key，并在 ProgressSnapshot 中保留 courseId 和 questionAttempts

lib/progress/learning-report.ts
  -> 题目级进度报告纯函数层；根据 ProgressSnapshot 和已发布课程题目计算已作答题、首次正确率、待复习题和最近作答时间

lib/immersive/visual-state.ts
  -> 学习状态到沉浸式视觉状态的纯函数映射

components/immersive/*
  -> Runtime Cockpit、Knowledge Nebula、EnergyRunway、CompletionBurst、CursorSparks 和 AchievementUnlock 视觉组件

components/cheatsheet/*
  -> 知识扫描台工具舱，按课程、阶段和搜索词展示可复制的知识卡片、记忆钩子与关键代码

components/review/*
  -> 每日复习任务舱，基于题目级进度和 spaced repetition 规则生成复习队列并回写题目尝试

components/gamification/*
  -> 技能星图和打卡成就工具舱，展示阶段轨道、节点掌握状态、连续学习和分享文案

components/preview/*
  -> 微型浏览器预览舱，提供 URL 地址栏、Status Code、Headers 抽屉与 JSON / HTML / UI 卡片切面渲染；内容仍来自 lesson / step preview 或确定性默认预览

components/emergency/*
  -> 生产事故救援模式 HUD，阶段项目触发现场警报；支持 ProductionIncidentSpec 显式配置，也可生成确定性默认事故、修复中、严重故障和恢复状态

components/visualizers/*
  -> Three.js 运行舱、知识环绕场景、粒子增强层、WebGL / 减少动态效果 fallback 与 TraceTimelineScrubber 按帧轨迹控制条

lib/runtime/runtime-panel-state.ts
  -> 运行面板轻量状态机，集中管理 Console / Browser Tab、Trace 播放状态、手动选帧和 authored trace 帧同步规则

app/_components/learning-studio.tsx
  -> 共享课程工作台 Client Component，通过 CourseConfig 接收课程、目录、代码标签、终端命令和课程切换信息，并管理单课多题流程
  -> 集成控制台 Console 与微型浏览器 Preview 切换 Tab
  -> 从 curriculum 与 publishedLessons 动态计算路线统计卡：已发布案例、互动题、知识点和阶段项目
  -> 课程轨道卡展示“下一阶段预告”，从 stageSpaces 派生后续阶段开放 / 规划状态与可学节点数
  -> 管理顶部学习辅助工具入口：知识扫描台、每日复习任务和技能星图，入口展示当前课程规模、复习队列和学习连击状态

app/_components/question-options.tsx
  -> 统一题目选项 Client Component，支持普通选择题、implementation / repair / completion 代码方案卡片、diagnosis 题干材料和 execution-order 顺序方案卡片

app/frontend-debugging/page.tsx 与 app/frontend-debugging/learning-studio.tsx
  -> 前端报错调试路由包装，挂载共享 app/_components/learning-studio.tsx，并使用 courseId "frontend-debugging"
```

## Runtime Boundaries

当前执行模型：

- 浏览器渲染学习工作台。
- 用户选择答案。
- 单节课程通过 `questionIndex` 展示当前题，`selectedByQuestion` 记录每题选项，`answeredQuestionIds` 记录已答对题目。
- 每次选择答案都会通过 `ProgressRepository.recordQuestionAttempt()` 写入题目尝试，UI 不直接读写 `localStorage`。
- 答对非最后一道必答题时只显示解析和“进入下一题”，不会写入课程完成进度。
- 完成全部必答题后才启动 `streamAuthoredTrace()`，并在完整运行结束后写入课程或阶段项目完成进度。
- `AbortController` 负责切换课程或重新作答时取消旧轨迹。
- `lib/runtime/runtime-panel-state.ts` 管理运行面板交互状态：Console / Browser Tab、`disabled | playing | paused | complete` 播放态、当前帧索引。
- authored trace 只有在 `playbackState === "playing"` 时推进 UI 帧；暂停、拖拽 range、上一帧、下一帧和节点点击都会暂停自动播放，并忽略旧流继续覆盖当前帧。
- 终端面板和微型浏览器面板显示课程内预设日志与预设响应，不执行学习者代码。
- 完整运行结束后写入本地进度仓储。
- 前端报错调试路线仍使用 authored trace，不执行真实浏览器脚本，不发起远程请求，也不读取学习者页面环境。
- Console、MicroBrowser、TraceTimelineScrubber 和 IncidentHUD 只消费课程预设数据，用于回放控制台线索、错误栈路径、预览恢复和事故指标。

当前即将引入 Supabase 作为后端服务。之前没有后端 API、数据库、认证，现计划通过 Supabase 提供用户认证、跨设备进度同步和数据库支持。已发布课程虽然使用真实 Node.js 代码示例，但浏览器仍只播放课程作者编排好的运行帧和日志。

沉浸式视觉层只读取 `status`、`progressPercent`、`lesson.stageId`、`lesson.kind` 和当前课程标题。它不写入学习进度，不执行学习者代码；课程切换由 App Router 链接 `/nodejs`、`/nextjs`、`/frontend-debugging` 和 `/{courseSlug}` 处理。

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
- `questions[].type`: 当前支持 prediction、implementation、diagnosis、repair、completion、execution-order、best-practice、concept-match、equivalent-code、sequence、transfer 和 trace-debug。
- `questions[].materialTitle/materialCode/materialLanguage/expectedOutput/orderItems`: P1 题型材料字段，用于展示诊断现场、补全任务、预期输出和执行顺序。
- `questions[].options[].code/language/diffLines`: implementation 等代码题使用的代码方案、语言标签和重点行。
- `execution`: authored trace 可视化配置，包含结构化 `visualizer`。
- `preview`: 微型浏览器预览配置，支持 URL、状态码、Headers、JSON、HTML 和 UI 卡片切面。
- `incident`: 阶段项目生产事故 HUD 配置，包含标题、摘要、metric 在 incident / patching / critical / restored 四类状态下的显示值、恢复文案和 runbook；普通知识点不会强制渲染 HUD。
- `steps[].preview` / `steps[].incident`: 多步骤阶段项目可覆盖当前任务的浏览器预览和事故视图。
- `sources`: 官方来源和校验日期。

已发布课程的质量约束：

- 至少 1 个代码文件，且入口文件必须存在。
- 至少 1 道选择题，正确答案必须存在于选项中。
- 每个选项都必须提供定向反馈。
- implementation 题至少包含一个代码选项；代码选项必须声明 `language`，`diffLines` 必须是正整数数组。
- diagnosis、repair、completion、execution-order 作为 P1 题必须声明 `difficulty` 和 `estimatedSeconds`。
- repair 和 completion 至少包含 2 个代码选项。
- execution-order 如果提供 `orderItems`，至少需要 3 个步骤。
- 已发布知识点至少 2 道题，阶段项目至少 3 道题；每个已发布阶段至少 3 种题型。
- 至少 3 个 authored trace 运行帧。
- 至少 3 条知识总结。
- 至少 1 个官方来源。

课程目录使用 `CurriculumStage`：

- 普通阶段至少 8 个 `CatalogLesson`；Node.js 阶段 04 允许额外细化文件 / Buffer / Stream 微知识点。
- 每阶段 1 个 `stage-project`。
- `status` 区分 `published` 与 `planned`。

课程集合使用 `CourseSpec`：

- `id`: 当前覆盖 `nodejs`、`nextjs`、`frontend-debugging`、`python`、`network`、`server-engineering`、`android`、`ai-application`、`ai-agent` 和 `ai-math`。
- `domainId`: 所属学院域，当前覆盖语言基础、前端工程、计算机网络、服务器开发、Android、AI 应用、AI Agent 和 AI 数学等蓝图域。
- `slug`: 路由标识，当前与课程路径片段保持一致。
- `title`, `description`, `icon`: 课程选择与工作台展示元数据。
- `status`: 课程发布状态，当前支持 `published`、`preview` 和 `planned`。
- `runtimeSurfaces`: 课程可消费的运行舱表面，例如 Console、MicroBrowser、运行轨迹时间轴和事故 HUD。
- `stages`: 对应课程的 `CurriculumStage[]`。

进度使用 `ProgressSnapshot`：

- `courseId`: 进度所属课程。
- `questionAttempts`: 按题目 ID 保存题目级记录；每条记录包含课程、阶段、最近选择、最近是否正确、首次是否答对、尝试次数、首次作答时间、最近作答时间和待复习状态。
- Node.js 使用兼容 key `nodepath.progress.v1`。
- Next.js 使用 `nodepath.progress.nextjs.v1`。
- 损坏进度会按当前课程回退为空快照；旧格式进度会补齐 `questionAttempts` 结构，但不会伪造历史题目记录。

## State Flow

```text
openLesson(index)
  -> abort current run
  -> reset questionIndex, selectedByQuestion, answeredQuestionIds, status, frame, frame index

chooseAnswer(answer)
  -> record question attempt through progress repository
  -> wrong answer: status = "wrong"
  -> correct answer before final required question: record answered question and show explanation
  -> final required answer: status = "running"
    -> stream authored frames
    -> update frame and frameIndex
    -> status = "success"
    -> save lesson or project completion progress

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

## P1 Development Architecture & Specifications (P1 开发架构与规范)

P1 阶段（提升理解与留存）的模块拓扑、离线优先与数据同步算法、题型架构及复习引擎规范详见：

- [P1 开发总纲](file:///Users/huo2wx/coding/react/learning-app/with-supabase/docs/P1-DEVELOPMENT-GUIDE.md)
- [P1 题型与交互开发规范](file:///Users/huo2wx/coding/react/learning-app/with-supabase/docs/specs/p1-question-interaction-spec.md)
- [P1 艾宾浩斯复习与留存引擎规范](file:///Users/huo2wx/coding/react/learning-app/with-supabase/docs/specs/p1-spaced-repetition-retention-spec.md)
- [P1 Supabase 数据架构与同步规范](file:///Users/huo2wx/coding/react/learning-app/with-supabase/docs/specs/p1-supabase-data-architecture.md)

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

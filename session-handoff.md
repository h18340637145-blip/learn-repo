# Session Handoff

## Current State

Project: NodePath (with-supabase), a visual multi-course programming learning website built on Next.js 16.

Current branch:

```text
main
```

当前应用是带沉浸式视觉层的多课程学习原型。`/` 是课程选择首页，`/nodejs`、`/nextjs`、`/frontend-debugging`、`/python`、`/network`、`/server-engineering`、`/android`、`/ai-application`、`/ai-agent` 和 `/ai-math` 都可以进入学习路线；其中 7 条蓝图路线当前进入三阶段样板学习工作台。课程数据、课程结构、authored trace 执行、校验、进度存储、沉浸式视觉状态和 P1 题库补丁层已经拆成独立模块。已全量落地 P1 开发与实施规范套件 (`docs/P1-DEVELOPMENT-GUIDE.md` 及 `docs/specs/*`)：已升级 `supabase-migration.sql` 规范建表 Schema 及 RLS 策略，全量实现离线优先智能合并算法 (`lib/progress/sync-strategy.ts`) 与 `useProgressSync` 挂载同步，并在 `spaced-repetition.ts` 及 `local-progress-repository.ts` 中完成了基于 SM-2 的艾宾浩斯复习与记忆衰减调度引擎。

## 多课程架构改造

- 蓝图规格已批准：NodePath 将从 Node.js / Next.js 双路线升级为多学院编程学习平台，长期学院蓝图包含语言基础、前端工程、计算机网络、服务器开发、Android、AI 应用、AI Agent 和 AI 数学。
- 本轮已扩展课程类型和课程注册表，`CourseSpec` 现在携带 `domainId`、`slug`、`status` 和 `runtimeSurfaces`。
- 已保留 `/nodejs` 与 `/nextjs` 两条既有路线，并新增 `/frontend-debugging` 前端报错调试样板路线。
- 已补齐蓝图三阶段可玩性：Python、计算机网络、服务器工程、Android、AI 应用、AI Agent 和 AI 数学都有首页入口、动态路线页和阶段 00–02 学习工作台。
- 当前新增样板路线包括“前端报错调试”和 7 条蓝图首阶段路线；这些路线状态为 `preview`，不是全量发布。
- `getLessonsByCourse` 对 7 条蓝图路线返回各自独立的 27 个前三阶段案例，避免误复用 Node.js 已发布课程。
- 前端报错调试当前先发布阶段 00“浏览器控制台与错误栈”，包含 8 个知识点和 1 个阶段项目，共 9 个样板案例。
- 当前已发布案例总数：387 个；Node.js 99 个，Next.js 90 个，前端报错调试 9 个，7 条蓝图路线各 27 个。
- 当前验证要求：`npm run validate:curriculum`、`npm test`、`npm run lint`、`npm run build`、`git diff --check`。
- 多课程架构改造计划已在本地 `main` 继续推进：当前完成蓝图路线可见性与规划概览页，后续开发建议优先为规划路线逐条填充真实课程、题库、阶段项目和运行可视化。

## What Exists

Curriculum foundation:

- 00 基础训练营和 10 个正式阶段。
- 88 knowledge points.
- 11 stage projects.
- 99 currently published Node.js playable cases.
- Next.js 路线包含 10 个阶段、80 个计划知识点、10 个阶段项目。
- Next.js 已发布 90 个 playable cases。
- 前端报错调试路线当前发布 1 个样板阶段：浏览器控制台与错误栈，包含 8 个知识点和 1 个阶段项目。
- 前端报错调试已发布 9 个 playable cases。
- 当前总计 387 个已发布 playable cases。
- 蓝图预览路线当前各发布前三个阶段 27 个样板案例：Python、计算机网络、服务器工程、Android、AI 应用、AI Agent、AI 数学。

Published cases:

- Stage 00: 8 foundations lessons plus the CLI file inspector project.
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

- `/` 展示 Node.js、Next.js 与前端报错调试课程卡片。
- 首页课程卡片下方现在有独立“知识点连接星链”底部展厅，知识核心球进一步放大铺满展厅空间且隐藏中心文字，知识点球保持当前尺寸并以内嵌文字环绕核心呈现。
- `/nodejs`、`/nextjs` 与 `/frontend-debugging` 都复用 `app/_components/learning-studio.tsx` 共享工作台。
- 学习工作台左侧已新增路线统计卡，动态展示已发布案例、互动题、知识点和阶段项目；Node.js 当前发布 99 个案例，Next.js 当前发布 90 个案例，前端报错调试当前发布 9 个样板案例。
- Learner reads concept and code.
- Learner chooses an answer.
- 每次选择答案都会写入题目级本地记录，记录最近选择、尝试次数、首次是否答对、首次作答时间、最近作答时间和待复习状态。
- Wrong answer shows option-specific feedback.
- 首次答错的题目会进入待复习统计，后续答对也保留待复习标记。
- 单节课程现在可以包含多道题；答对中间题显示解析和“进入下一题”，答完全部必答题后才启动可取消 authored trace。
- Correct final required answer starts a cancellable authored trace.
- 已实现 Runtime Cockpit + Knowledge Nebula 沉浸式视觉层。
- 顶部学习辅助入口已升级为工具舱按钮：知识卡片显示速查库规模，每日复习显示复习队列，技能星图显示连续学习天数；中等宽度自动压缩，移动端隐藏辅助工具避免挤压主导航。
- `CheatSheetModal` 现在是知识扫描台，包含当前筛选卡片、含代码卡片、记忆钩子和路线频道统计。
- `DailyReviewModal` 现在是今日复习任务舱，包含复习进度轨、错题强化数和到期复习数。
- `SkillTreeModal` 现在是技能星图轨道，阶段轨道和节点芯片区分已掌握、可学习和未发布状态。
- Runtime Cockpit、Knowledge Nebula、EnergyRunway 和 CompletionBurst 会响应答题正确、运行中和完成状态。
- 已新增阶段星图导航，课程不再全部平铺在全局导航中。
- 已新增结构化 `execution.visualizer`，重点阶段映射到主题化 3D 场景。
- 已新增 Three.js 运行舱、知识环绕轨道、粒子增强层和 WebGL / 减少动态效果 fallback。
- 已新增游戏化 Mission HUD、鼠标火花、HUD 扫描线、3D hover 和成就解锁弹层。
- Terminal panel shows simulated logs.
- 运行面板通过 `lib/runtime/runtime-panel-state.ts` 统一管理 Console / Browser Tab、Trace 播放状态和当前帧；暂停、拖拽、上一帧、下一帧、节点点击会暂停自动播放，避免旧 authored trace 覆盖手动帧。
- `MicroBrowser` 使用可访问 Tab panel 承载，保持 `lesson.preview` / `currentStep.preview` 数据驱动，并明确展示 idle、running、success、wrong 四类状态与 Headers 抽屉。
- `ProductionIncidentHUD` 仅阶段项目渲染，支持 `lesson.incident` / `step.incident` 显式配置；无配置时生成确定性默认事故视图，覆盖 incident、patching、critical、restored 状态。
- Summary appears after completion.
- 实现型代码题通过 `QuestionOptions` 展示代码方案卡片，支持语言标签、差异行提示和折叠/展开代码预览。
- `diagnosis`、`repair`、`completion`、`execution-order` 和 `trace-debug` 已具备对应题型支撑；诊断题可展示题干材料，修复/补全题复用代码方案卡片，执行顺序题展示运行链路选择，前端调试题可沿控制台、错误栈和源码帧回放。
- P1 题库通过 `content/questions/*` 作为补丁层挂载到已发布课程，Node.js 与 Next.js 已发布课程都已满足知识点至少 2 题、阶段项目至少 3 题。
- 移动端代码题已单独适配：选项卡片单列、代码横向滚动、解析区纵向排列。
- Completion is saved to browser local progress and restored after refresh.
- ProgressSnapshot 按 `courseId` 隔离，Node.js 与 Next.js 进度互不污染，并包含 `questionAttempts` 题目级记录。
- 侧边栏已新增学习报告卡片，从已发布题库和题目级记录计算已作答题、首次正确率、待复习题和最近学习时间。
- 旧版本地进度会自动补齐题目记录结构，不会伪造历史题目作答。
- 支持 `prefers-reduced-motion` 降级。

Important product boundary:

- The current app uses deterministic authored traces.
- It does not execute arbitrary Node.js code.
- A real sandbox remains a separate future plan.

## 3D 空间化学习体验

- 左侧导航现在使用 `StageSidebar`，展示 00 基础训练营和 10 个正式阶段入口，并展开当前阶段的可点击知识点。
- 主内容区使用 `StageSpaceMap`，只展示当前阶段课程和阶段项目。
- 答对题目后，`SpatialRuntimeVisualizer` 会根据课程 `execution.visualizer` 尝试展示 Three.js 运行舱；运行舱包含知识环绕轨道和粒子点云。
- 代码案例面板现在有 Chrome 可见标题、文件名和空间光晕，标题为“Node.js 案例代码”。
- 粒子增强依赖已声明：`three.quarks`、`three-nebula`、`proton-engine`；当前渲染路径保持稳定 Three.js points，并在运行场景保留专业粒子引擎桥接点。
- WebGL 不可用、移动端或开启减少动态效果时，会使用 `VisualizerFallback` 保留可读运行顺序。
- 浏览器 resize 或运行舱容器宽度不足时，`SpatialRuntimeVisualizer` 会重新评估并切换到深色 fallback，避免 3D Canvas 白屏或空白占位。
- 成功完成课程时，`AchievementUnlock` 显示“知识芯片已解锁”；完成阶段项目时显示“阶段徽章已铸造”。这些反馈是纯前端展示，不改变进度模型。
- 重点场景覆盖 HTTP 管线、服务边界、Worker 并发、实时星网、测试安全边界和诊断生产观测。
- 当前实现仍使用确定性 authored traces，不执行学习者提交的任意 Node.js 代码；前端报错调试路线也不执行真实浏览器脚本或远程请求，只消费课程预设的 Console、MicroBrowser、TraceTimelineScrubber 和 IncidentHUD 数据。
- 验证命令：`npm test`、`npx tsc --noEmit`、`npm run validate:curriculum`、`npm run lint`、`npm run build`、`git diff --check`。

## Important Files

- `content/curriculum.ts`: 00 基础训练营 + 10-stage/88-point master curriculum catalog.
- `content/curriculum-nextjs.ts`: Next.js 10-stage/80-point catalog.
- `content/curriculum-frontend-debugging.ts`: 前端报错调试样板路线目录，当前阶段为“浏览器控制台与错误栈”。
- `content/curriculum-registry.ts`: 多学院 CourseSpec 注册表，聚合 Node.js、Next.js 与前端报错调试路线。
- `content/legacy-lessons.ts`: migrated original 4 prototype cases.
- `content/lessons/lesson-factory.ts`: helper for standard LessonSpec creation.
- `content/lessons/stage-00-foundations.ts`: complete stage 00 foundations bootcamp content，`foundations-functions` 已包含首个 Node.js implementation 代码题。
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
- `content/lessons/nextjs/nextjs-lesson-factory.ts`: Next.js lesson factory with `Next.js 16.x` runtime label.
- `content/lessons/nextjs/nextjs-quick-lesson.ts`: Next.js 后续题库的轻量课程工厂。
- `content/lessons/nextjs/stage-00-foundations.ts`: complete Next.js stage 00 foundations content，`nextjs-foundations-app-router` 已包含首个 App Router implementation 代码题。
- `content/lessons/nextjs/stage-01-routing.ts` ... `stage-09-architecture.ts`: complete Next.js stages 01–09 content, including testing/deployment and advanced realtime dashboard project.
- `content/lessons/frontend-debugging/stage-00-console-stack.ts`: 前端报错调试阶段 00 的 9 个样板 LessonSpec。
- `content/lesson-registry.ts`: published lesson registry, Node.js aggregation, Next.js aggregation, and stage 04 migration metadata.
- `content/questions/apply-question-bank.ts`: P1 题库补丁挂载工具。
- `content/questions/p1-question-templates.ts`: 根据课程真实标题、概念、入口代码和阶段题型分配生成 P1 题的共享模板。
- `content/questions/nodejs-p1-question-bank.ts`: Node.js 已发布案例的 P1 题库补丁。
- `content/questions/nextjs-p1-question-bank.ts`: Next.js 90 个已发布案例的 P1 题库补丁。
- `lib/curriculum/types.ts`: shared curriculum and lesson types.
- `lib/curriculum/validate.ts`: catalog、lesson、P1 题型结构、题库引用和覆盖率 validators。
- `lib/curriculum/view-model.ts`: roadmap view model.
- `lib/curriculum/stage-space.ts`: 阶段空间 view model。
- `lib/curriculum/visualizers.ts`: 课程运行可视化配置映射。
- `lib/execution/authored-trace.ts`: cancellable authored trace runner.
- `lib/immersive/visual-state.ts`: 学习状态到沉浸式视觉状态的纯函数映射。
- `lib/progress/*`: local progress repository boundary，包含按课程隔离的完成进度和题目级作答记录。
- `lib/progress/learning-report.ts`: 题目级学习报告纯函数，计算已作答题、首次正确率、待复习题和最近学习时间。
- `components/immersive/*`: Runtime Cockpit、Knowledge Nebula、EnergyRunway、CompletionBurst、CursorSparks、AchievementUnlock 和相关视觉组件。
- `components/learning-space/*`: 阶段入口和当前阶段星图组件。
- `components/visualizers/*`: Three.js 运行舱、知识环绕运行场景、粒子增强层和 fallback。
- `scripts/validate-curriculum.ts`: curriculum validation CLI.
- `app/page.tsx`: course selection home.
- `app/_components/learning-studio.tsx`: shared client learning studio consuming registry, roadmap, runner, and progress.
- `app/_components/question-options.tsx`: 统一题目选项组件，支持普通选择题和实现型代码题。
- `tests/curriculum/question-bank.test.ts`: P1 题库引用、题量和阶段题型多样性覆盖率测试。
- `app/nodejs/page.tsx`, `app/nodejs/learning-studio.tsx`: Node.js route wrapper.
- `app/nextjs/page.tsx`, `app/nextjs/learning-studio.tsx`: Next.js route wrapper.
- `app/frontend-debugging/page.tsx`, `app/frontend-debugging/learning-studio.tsx`: 前端报错调试 route wrapper，挂载共享学习工作台。
- `app/globals.css`: visual system and responsive behavior.
- `docs/PRODUCT.md`: product and curriculum harness.
- `docs/ARTICHECTURE.md`: architecture harness.

## Validation History

Latest validation for the multi-course architecture work:

```bash
npm run validate:curriculum -> pass. 输出包含：课程校验通过：Node.js 11 个阶段 99 个案例，Next.js 10 个阶段 90 个案例，前端报错调试 1 个阶段 9 个案例，共 198 个已发布案例。题库覆盖：Node.js 224 道题，Next.js 200 道题，共 424 道题。
npm test -> pass. 162 tests, 162 pass, 0 fail.
npm run lint -> pass.
NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=placeholder-anon-key npm run build -> pass. Route table includes /frontend-debugging.
git diff --check -> pass. 无输出。
```

Implementation notes:

- 多学院课程注册表已落地，`CourseSpec` 支持 `domainId`、`slug`、`status` 和 `runtimeSurfaces`。
- `/frontend-debugging` 已接入共享学习工作台，并发布阶段 00“浏览器控制台与错误栈”。
- `MicroBrowser`、`ProductionIncidentHUD` 和 `TraceTimelineScrubber` 继续消费确定性课程数据，不执行真实浏览器脚本或远程请求。
- 计划文档 `docs/superpowers/plans/2026-07-23-nodepath-multi-course-architecture.md` 已同步为完成状态。

Latest targeted validation for the question-level progress work:

```bash
npm test -- tests/progress/local-progress-repository.test.ts -> pass. 116 tests, 116 pass, 0 fail（仓储修复后）。
npm test -- tests/progress/learning-report.test.ts tests/progress/local-progress-repository.test.ts -> pass. 119 tests, 119 pass, 0 fail（报告优化后）。
npm test -- tests/learning-space/source.test.ts tests/progress/local-progress-repository.test.ts tests/progress/learning-report.test.ts -> pass. 120 tests, 120 pass, 0 fail（UI 接入后）。
git diff --check -> pass. 无输出。
```

验证说明：`tsx` 在当前沙箱内会遇到 IPC `EPERM`，相关测试已使用提升权限重跑通过。

Implementation notes:

- 新增 `ProgressSnapshot.questionAttempts` 与 `ProgressRepository.recordQuestionAttempt()`，本地仓储会记录每道题的最近选择、尝试次数、首次是否答对、首次作答时间、最近作答时间和待复习状态。
- 新增 `lib/progress/learning-report.ts`，从题目级记录和已发布课程题目计算侧边栏学习报告。
- `LearningStudio` 在选择答案时记录题目尝试；完成全部必答题并跑完 authored trace 后，才写入课程或阶段项目完成进度。
- 旧版本地进度会自动补齐题目记录结构，不会补造历史题目作答。

Latest targeted validation for the P1 question-bank scale work:

```bash
npm test -- tests/learning-studio/question-options.test.tsx tests/visualizers/styles.test.ts -> pass. 106 tests, 106 pass, 0 fail.
npm run validate:curriculum -> pass. 输出包含：课程校验通过：Node.js 11 个阶段 92 个案例，Next.js 10 个阶段 90 个案例，共 182 个已发布案例。
npm test -- tests/curriculum/question-bank.test.ts tests/curriculum/nextjs-complete.test.ts -> pass. 111 tests, 111 pass, 0 fail.
```

Implementation notes:

- 已新增 P1 题型材料字段：`materialTitle`、`materialCode`、`materialLanguage`、`expectedOutput`、`orderItems`。
- 已新增 P1 题型 UI 与题库补丁层。
- Node.js / Next.js 已发布课程完成 P1 题库覆盖。
- `npm run validate:curriculum` 会输出课程数、案例数和题目数，并把题库覆盖率错误纳入非 0 退出。

Latest targeted validation for the Next.js route expansion:

```bash
npm test -- tests/curriculum/nextjs-complete.test.ts -> pass. 89 tests, 89 pass, 0 fail.
npm test -- tests/learning-studio/course-routing.test.ts tests/learning-space/source.test.ts tests/learning-studio/sidebar-navigation.test.ts -> pass. 81 tests, 81 pass, 0 fail.
```

Implementation notes:

- 新增 `content/curriculum-registry.ts` 聚合 Node.js 与 Next.js 课程。
- Next.js 阶段 00 使用 `createNextjsLessonSpec()`，运行环境标签为 `Next.js 16.x`。
- Next.js 阶段 01–09 已补齐为完整题库，目录中 90 个节点全部可打开对应案例。
- 进度仓储现在按课程隔离 localStorage key，并在快照中保留 `courseId`。
- 删除旧 `app/learning-studio.tsx` 重复实现，路由工作台统一走 `app/_components/learning-studio.tsx`。
- `scripts/validate-curriculum.ts` 现在从 `allCourses` 动态校验多课程目录。

Latest automatic validation for the stage 00 foundations bootcamp:

```bash
npx tsx --test tests/curriculum/catalog.test.ts tests/curriculum/registry.test.ts tests/curriculum/validate.test.ts -> pass. 18 tests, 18 pass, 0 fail.
npm test -> pass. 72 tests, 72 pass, 0 fail.
npm run validate:curriculum -> pass. 输出：课程校验通过：11 个阶段，92 个已发布案例。
npm run lint -> pass.
npm run build -> pass. 仅出现已有 multiple lockfiles warning。
git diff --check -> pass. 无输出。
```

Manual browser acceptance on `http://localhost:3000/`:

- 左侧出现 `00 基础训练营`，并展开 8 个基础知识点。
- 当前基础课程可进入，阶段星图显示基础训练营课程和“命令行文件统计器”项目节点。
- 点击“变量、类型与 typeof”的正确答案 A 后，Runtime Visualizer 展示运行完成，终端日志包含 `string` 和 `3`，总结面板显示“知识点已掌握”。

Latest targeted validation for the gamified interaction layer:

```bash
npx tsx --test tests/immersive/components.test.tsx tests/immersive/styles.test.ts tests/learning-space/source.test.ts -> pass. 16 tests, 16 pass, 0 fail.
```

Latest targeted validation for the top blank-space layout fix:

```bash
npx tsx --test tests/immersive/styles.test.ts -> pass. 5 tests, 5 pass, 0 fail.
```

Fix notes:

- `app-shell` 普通层级选择器已排除 `cursor-sparks` 和 `hud-scanline`。
- 同时新增 `.app-shell > .cursor-sparks` 与 `.app-shell > .hud-scanline` fixed 防护，避免固定粒子画布和 HUD 扫描线在小屏或样式热更新状态下变成普通文档流元素，撑出顶部大面积留白。
- 新增 `.app-shell > .topbar` sticky 防护，避免同一普通层级选择器把顶部导航降级为 relative。

Latest targeted validation for the responsive runtime visualizer fix:

```bash
npx tsx --test tests/visualizers/components.test.tsx tests/visualizers/styles.test.ts -> pass. 11 tests, 11 pass, 0 fail.
```

Manual browser acceptance on `http://localhost:3000/`:

- 871px viewport: runtime visualizer width about 566px, Canvas not mounted, fallback visible at 280px height, no console errors.
- 1639px viewport: runtime visualizer width about 754px, Canvas remounted at 280px height, no console errors.
- Existing Three.js deprecation warning about `THREE.Clock` remains non-blocking.

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

Latest validation for the P3 blueprint course expansion:

```text
tsx --test tests/curriculum/blueprint-third-stage-playable.test.ts tests/curriculum/blueprint-second-stage-playable.test.ts tests/curriculum/blueprint-course-visibility.test.ts tests/learning-studio/course-routing.test.ts -> pass. 12 tests, 12 pass, 0 fail.
tsx scripts/validate-curriculum.ts -> pass. 共 387 个已发布案例。
tsx --test tests/**/*.test.ts tests/**/*.test.tsx -> pass. 173 tests, 173 pass, 0 fail.
eslint -> pass.
next build -> pass.
git diff --check -> pass.
```

## Next Recommended Work

Highest-value next plan:

1. 运行全量验证：`npm run validate:curriculum`、`npm test`、`npm run lint`、`npm run build`、`git diff --check`。
2. 做最终审查，确认三条已发布/预览路线均可通过注册表、路由、共享学习工作台和校验器访问。
3. 确认文档没有把 8 个学院蓝图误写成已发布路线。

Later plans:

- Integrate Supabase for user authentication and login.
- Migrate local progress storage to Supabase database for cross-device sync.
- Implement strict cross-stage unlocking rules using the backend.
- Stage 04 content plus Stream/HTTP visualizers.
- Expand stages 05–10 with concurrency, security, and diagnostics-specific visualizers.
- Final real-time collaboration project.

## Operating Notes

- Use npm because `package-lock.json` is present.
- Read local Next docs before changing framework-level code.
- Preserve the current dark developer-lab visual direction.
- Keep the learning experience as the first screen.
- Avoid remote Google fonts.
- Do not overwrite unrelated dirty worktree changes.

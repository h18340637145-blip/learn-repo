# NodePath 阶段 01–03 完整内容填充设计

## 1. 背景

NodePath 当前已经完成课程基础设施：10 个阶段、80 个计划知识点、10 个阶段项目、课程校验、注册表、authored trace 运行器和本地进度仓储。当前已发布内容仍只有 3 个知识点和 1 个阶段项目，无法支撑系统学习。

本规格将下一轮实现范围限定为阶段 01–03：运行时与命令行、模块与包、异步运行时。用户已确认采用「先完整填充阶段 01–03」方案，所有课程使用真实 Node.js 案例代码和 authored trace，不在本轮实现真实沙箱。

## 2. 目标

本轮交付 24 个知识点和 3 个阶段项目：

- 阶段 01：运行时与命令行，8 个知识点 + CLI 系统信息探测器。
- 阶段 02：模块、包与 TypeScript，8 个知识点 + 依赖与配置检查器。
- 阶段 03：异步运行时与事件，8 个知识点 + 并发任务调度器。

完成后，阶段 01–03 的 27 个目录项全部应为 `published`，可以在现有学习界面中切换、答题、运行 authored trace、查看日志、保存进度。

## 3. 非目标

- 不实现真实 Node.js 沙箱执行。
- 不允许学习者上传或编辑任意代码。
- 不实现阶段 04–10 的完整内容。
- 不新增复杂可视化组件；本轮沿用 `lane-flow`，通过 lane 命名和帧内容表现不同运行模型。
- 不改登录、Supabase、跨设备同步或严格阶段解锁。

## 4. 官方来源边界

内容以 Node.js 官方 Learn 和 API Docs 为依据。阶段 01–03 的来源分层如下：

- 阶段 01：Learn 的 Getting Started、Command Line；API Docs 的 Process、REPL、Console、Command-line options。
- 阶段 02：Learn 的 TypeScript、Modules 中的包发布主题；API Docs 的 ECMAScript modules、CommonJS modules、Packages、TypeScript、node:module。
- 阶段 03：Learn 的 Asynchronous Work；API Docs 的 Timers、Events、Process。

每个 `LessonSpec.sources` 至少包含 1 个官方来源。若主题属于工程化串联（例如阶段项目），可增加 `engineering-extension` 来源，但不能替代官方来源。

## 5. 内容文件结构

新增 3 个阶段内容文件：

```text
content/lessons/stage-01-runtime-cli.ts
content/lessons/stage-02-modules-packages.ts
content/lessons/stage-03-async-events.ts
```

调整聚合入口：

```text
content/lesson-registry.ts
  -> 导入 stage-01、stage-02、stage-03
  -> 继续导出 publishedLessons 和 getLesson
```

迁移策略：

- 现有 `modules-require-cache`、`event-loop-order` 两课应迁入对应阶段内容文件。
- 现有 `stream-backpressure` 和 `project-cli-log-analyzer` 属于阶段 04，本轮保留在 `legacy-lessons.ts` 迁移路径中，不阻塞阶段 01–03。
- `legacy-lessons.ts` 可以继续存在，直到阶段 04 内容计划迁移。

## 6. 单课规格

每个知识点必须完整提供：

- `id` 与 `content/curriculum.ts` 中目录项一致。
- `stageId` 与所在阶段一致。
- `kind: "knowledge"`。
- 真实 Node.js 代码案例，优先使用 `.mjs`；CommonJS 对照内容使用 `.cjs`。
- 1 道主预测题，类型为 `prediction`。
- 每个选项包含 `feedback`，并解释该选项为什么成立或不成立。
- `execution.mode: "authored-trace"`。
- 至少 3 个 `RunnerFrame`，每帧包含 lane 状态、终端日志、教学注释和 `delayMs`。
- `summary` 至少 3 条。
- `sources` 至少 1 条官方来源，`verifiedAt` 使用 `2026-07-15`。

本轮可以不把诊断题和迁移题接入 UI，但课程内容文件应在命名和结构上为后续扩展保留清晰空间。当前 `LessonSpec.questions` 至少保存主预测题。

## 7. 阶段 01 内容设计

### 7.1 知识点

1. `runtime-introduction`：用最小 HTTP server 或 `console.log(process.version)` 展示 Node.js 是浏览器外的 JavaScript 运行时。
2. `runtime-browser-differences`：比较 `globalThis`、`window`、`document`、`process` 的可用性。
3. `runtime-v8`：展示同步代码、函数调用和 V8 执行结果；强调 V8 执行 JavaScript，Node 提供系统能力。
4. `runtime-lts`：用 `process.version`、`process.versions` 展示版本信息和 LTS 选择原则。
5. `cli-run-scripts`：展示 `node app.mjs`、退出码和脚本入口。
6. `cli-repl`：用 REPL 表达式和 `.exit` 行为制作 authored trace。
7. `cli-process-arguments`：解析 `process.argv`，构建一个小型问候 CLI。
8. `cli-env-console`：读取 `process.env`，用 `console.table` 输出配置摘要。

### 7.2 阶段项目

`project-cli-system-inspector`：CLI 系统信息探测器。

案例应组合：

- `process.version`。
- `process.platform`。
- `process.argv`。
- `process.env`。
- 终端输出格式化。

主问题让学习者选择正确的输入校验和输出结构。authored trace 展示参数解析、环境读取、报告生成 3 个阶段。

## 8. 阶段 02 内容设计

### 8.1 知识点

1. `modules-esm`：用 `export` / `import` 展示命名导出和默认导出。
2. `modules-resolution`：展示相对路径、扩展名和目录入口的解析差异。
3. `modules-package-type`：展示 `package.json` 中 `type: "module"` 对 `.js` 文件的影响。
4. `modules-node-prefix`：比较 `fs` 与 `node:fs`，强调内置模块显式引用。
5. `packages-dependency-types`：区分 `dependencies`、`devDependencies`、运行期与开发期。
6. `packages-semver-scripts`：展示 npm scripts、语义化版本范围和脚本执行顺序。
7. `modules-require-cache`：保留现有 CommonJS require 缓存案例，迁入阶段 02 文件。
8. `typescript-node`：展示 Node.js 原生 TypeScript 支持和类型擦除边界；示例必须避免依赖外部编译器。

### 8.2 阶段项目

`project-dependency-inspector`：依赖与配置检查器。

案例应组合：

- 读取 `package.json`。
- 检查 `type`、`scripts`、依赖分类。
- 输出依赖健康摘要。

主问题让学习者选择正确的依赖分类或模块类型判断。authored trace 展示读取配置、归类依赖、输出报告。

## 9. 阶段 03 内容设计

### 9.1 知识点

1. `async-callbacks`：展示回调被异步 I/O 或计时器稍后调用。
2. `async-promises`：展示 Promise 状态变化和 `.then()` 回调。
3. `async-await`：展示 `await` 暂停当前 async 函数但不阻塞整个事件循环。
4. `async-error-propagation`：展示 `try/catch` 捕获 `await` 错误，以及未 `await` 的 Promise 风险。
5. `event-loop-order`：保留现有 Event Loop 输出顺序案例，迁入阶段 03 文件。
6. `async-microtasks-nexttick`：比较 `process.nextTick()` 与 Promise 微任务。
7. `async-immediate-timers`：比较 `setImmediate()` 和 `setTimeout(..., 0)` 的教学场景。
8. `events-emitter-abort`：展示 `EventEmitter` 事件订阅和 `AbortController` 取消任务。

### 9.2 阶段项目

`project-task-scheduler`：并发任务调度器。

案例应组合：

- Promise 队列。
- 并发限制。
- 失败捕获。
- AbortSignal 取消。

主问题让学习者选择正确的调度策略：既限制并发，又保证失败任务被记录，不让未处理 Promise 泄漏。authored trace 展示入队、运行、完成、失败、取消 5 类状态。

## 10. UI 与数据流

现有 `app/learning-studio.tsx` 继续只展示每课第一道主预测题。新增课程不得要求 UI 分支。所有新内容通过 `publishedLessons` 自动进入切换器和进度计算。

当阶段 01–03 课程发布后：

- `publishedLessons.length` 应从 4 增加到 29（阶段 01–03 的 27 项 + 阶段 04 现有 2 项）。
- 侧边栏阶段 01–03 应显示对应已发布数量。
- 阶段 04 仍保留现有 `stream-backpressure` 和 `project-cli-log-analyzer`。
- 其他阶段继续显示「即将推出」。

## 11. 校验与测试

新增或更新测试：

- 注册表测试：确认阶段 01–03 的 27 个目录项均可通过 `getLesson()` 查询。
- 内容校验测试：阶段 01–03 每个 `LessonSpec` 通过 `validateLessonSpec()`。
- 来源测试：阶段 01–03 每课至少一个 `official` 来源。
- 案例完整性测试：每课至少 1 个文件、1 道题、3 个运行帧、3 条总结。
- 目录发布状态测试：阶段 01–03 目录项状态应为 `published`。

执行命令：

```bash
npm run validate:curriculum
npm test
npm run lint
npm run build
git diff --check
```

## 12. 内容质量标准

每个真实案例必须满足：

- 代码可以被学习者复制到本地 Node.js 中理解，不依赖浏览器 API。
- 示例规模小，优先 10–35 行；阶段项目可多文件，但每个文件职责清晰。
- 日志输出和 authored trace 保持一致。
- 错误选项反馈直接解释误区，不使用泛化文案。
- 记忆钩子短、具体、可复述。
- 不引入网络请求、文件写入破坏性操作或依赖安装。

## 13. 分批实现建议

实现计划应拆为 4 个任务组：

1. 阶段 01 内容文件、测试和注册表聚合。
2. 阶段 02 内容文件、迁移 `modules-require-cache`、测试和注册表聚合。
3. 阶段 03 内容文件、迁移 `event-loop-order`、测试和注册表聚合。
4. 总体验收、文档更新和人工浏览器检查。

每个任务组完成后都应运行对应内容测试，避免 27 个案例全部写完后再集中排错。

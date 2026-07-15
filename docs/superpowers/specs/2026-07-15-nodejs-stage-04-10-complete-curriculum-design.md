# NodePath 阶段 04–10 完整课程填充设计

## 背景

NodePath 当前已经发布阶段 01–03 的完整学习闭环，并保留阶段 04 的两个已发布案例：

- `stream-backpressure`
- `project-cli-log-analyzer`

课程目录已经固定为 10 个阶段、80 个知识点、10 个阶段项目。当前已发布 29 个案例，本次设计目标是补齐剩余 61 个案例，使全部 90 个课程条目都进入 `published` 状态。

## 目标

一次性补齐阶段 04–10 的学习资料、题目和阶段项目，让学习者可以从文件系统、HTTP、API 设计、并发、实时通信、测试安全一路学习到生产诊断。

完成后应满足：

- 10 个阶段全部发布。
- 80 个知识点全部有真实 Node.js 代码案例。
- 10 个阶段项目全部可答题、可播放可视化轨迹、可展示日志和总结。
- `npm run validate:curriculum` 输出 90 个已发布案例。
- 不引入任意代码执行沙箱。

## 非目标

本次不做以下事情：

- 不执行学习者提交的任意 Node.js 代码。
- 不新增 Supabase 登录、云端进度或跨设备同步。
- 不新增作者后台或题库编辑器。
- 不改变当前学习室的主要交互形态。
- 不实现真实部署或真实 WebSocket 服务。

## 官方来源边界

课程内容以 Node.js 官方 Learn 与 API 文档为主线：

- Node Learn: `https://nodejs.org/learn`
- Node API: `https://nodejs.org/api/`

本次重点覆盖的官方主题包括：

- File System：文件路径、读写、目录、文件元数据、文件系统差异。
- Modules / Streams：Readable、Writable、Transform、背压。
- HTTP：HTTP Transaction、`node:http`、request、response、headers、streaming。
- Concurrency：blocking vs non-blocking、child process、worker threads、cluster。
- Test Runner：`node:test`、assertion、mock、coverage。
- Security：Security Best Practices、Permissions、依赖安全、密钥边界。
- Diagnostics：Inspector、Report、Performance hooks、V8、Trace events、heap snapshot、GC tracing、flame graphs。

如果 Learn 文档没有覆盖某个课程 ID 的具体 API，课程来源使用对应 API 文档补足。

## 内容文件结构

延续阶段 01–03 的模式，新增专门的阶段文件：

```text
content/lessons/stage-04-files-streams.ts
content/lessons/stage-05-http-foundations.ts
content/lessons/stage-06-api-design.ts
content/lessons/stage-07-process-concurrency.ts
content/lessons/stage-08-realtime.ts
content/lessons/stage-09-testing-security.ts
content/lessons/stage-10-diagnostics-production.ts
```

保留：

- `content/lessons/lesson-factory.ts`
- `content/legacy-lessons.ts`

变更：

- `content/lesson-registry.ts` 聚合阶段 01–10 的正式课程。
- `content/curriculum.ts` 将全部 90 个目录条目标记为 `published`。
- 阶段 04 的 `stream-backpressure` 与 `project-cli-log-analyzer` 从旧迁移层迁移到 `stage-04-files-streams.ts`，避免后续仍依赖 `legacy-lessons.ts`。

## 每个课程对象的标准

每个 `LessonSpec` 必须包含：

- 稳定 ID，与 `content/curriculum.ts` 中的目录 ID 一致。
- `stageId` 与课程阶段一致。
- `kind` 为 `knowledge` 或 `stage-project`。
- 至少 1 个代码文件，入口文件必须存在于 `files` 中。
- 真实 Node.js 示例代码，优先使用 `.mjs`，CommonJS 场景使用 `.cjs`。
- 1 道题目，类型可为 `prediction`、`diagnosis` 或 `transfer`。
- 3 个选项，每个选项有定向反馈。
- 正确答案触发 authored trace。
- 至少 3 个运行帧，展示运行时状态变化。
- 至少 3 条知识总结。
- 至少 1 个官方来源，`verifiedAt` 为 `2026-07-15`。

## 阶段 04：文件、Buffer 与 Stream

需发布：

- `files-path-url`：`node:path`、文件 URL 与跨平台路径边界。
- `files-promises`：`fs/promises` 读取、写入和错误处理。
- `files-directories-stats`：目录遍历、`stat`、文件类型判断。
- `files-watch`：文件监听、变更事件和防抖边界。
- `buffer-encoding`：Buffer、字符编码、字节长度和字符串转换。
- `streams-readable`：Readable Stream 的数据流动。
- `streams-writable-transform`：Writable 与 Transform 的加工管道。
- `stream-backpressure`：保留并迁移已有背压案例。
- `project-cli-log-analyzer`：保留并迁移已有 CLI 日志分析器。

阶段项目要求：

- 代码案例模拟读取日志文件、逐行解析、聚合级别统计。
- 题目聚焦输入验证或流式处理中的关键缺口。
- 轨迹展示「文件流 → 逐行解析 → 聚合报告」。

## 阶段 05：HTTP 基础

需发布：

- `http-transaction`：一次 HTTP 事务的请求、处理、响应生命周期。
- `http-create-server`：使用 `node:http` 创建 Server。
- `http-request`：读取 method、url、headers。
- `http-response`：设置状态码、响应体和结束响应。
- `http-headers-status`：Header 与状态码语义。
- `http-routing-query`：URL 解析、路由和查询参数。
- `http-request-body`：请求体作为流读取并限制大小。
- `http-streaming-fetch`：流式响应与 `fetch`。
- `project-static-file-server`：流式静态文件服务器。

阶段项目要求：

- 案例从 URL 映射到 public 目录文件。
- 题目聚焦路径规范化、防止目录穿越或正确设置 Content-Type。
- 轨迹展示「请求 → 路由 → 文件流 → 响应」。

## 阶段 06：API 与服务设计

需发布：

- `api-rest-modeling`：资源建模和 REST 路径。
- `api-input-validation`：输入校验、类型边界和错误返回。
- `api-error-model`：统一错误结构。
- `api-config-boundary`：环境配置读取与默认值。
- `api-structured-logging`：结构化日志字段。
- `api-timeout`：超时控制。
- `api-abort-signal`：使用 `AbortSignal` 取消请求或任务。
- `api-health-shutdown`：健康检查与优雅关闭。
- `project-task-rest-api`：任务管理 REST API。

阶段项目要求：

- 案例实现内存任务列表的最小 REST 流程。
- 题目聚焦输入校验、统一错误或关闭流程。
- 轨迹展示「请求校验 → 业务处理 → 响应 → 日志」。

## 阶段 07：进程与并发

需发布：

- `concurrency-blocking-loop`：阻塞事件循环的症状。
- `concurrency-libuv-pool`：libuv 线程池与异步文件/加密任务。
- `concurrency-child-process`：`child_process` 执行外部命令。
- `concurrency-worker-threads`：Worker Threads 处理 CPU 密集任务。
- `concurrency-ipc`：主线程与 worker / 子进程消息传递。
- `concurrency-shared-memory`：`SharedArrayBuffer` 与共享状态边界。
- `concurrency-cluster`：Cluster 多进程服务模型。
- `concurrency-model-choice`：不同并发模型的选择。
- `project-worker-report`：Worker Pool 报表生成器。

阶段项目要求：

- 案例把 CPU 密集报表任务派发给 worker。
- 题目聚焦任务分发、消息返回或错误处理。
- 轨迹展示「主线程排队 → worker 执行 → 汇总报告」。

## 阶段 08：实时通信

需发布：

- `realtime-polling`：轮询与长轮询。
- `realtime-sse`：Server-Sent Events 的单向推送。
- `realtime-websocket-handshake`：WebSocket 握手概念。
- `realtime-connection-lifecycle`：连接建立、断开和清理。
- `realtime-heartbeat`：心跳与超时检测。
- `realtime-broadcast`：消息广播到多个客户端。
- `realtime-backpressure`：实时消息流量背压。
- `realtime-recovery`：断线恢复与幂等事件 ID。
- `project-realtime-notifications`：实时任务通知服务。

阶段项目要求：

- 案例使用事件流模拟任务通知。
- 不引入真实 WebSocket 依赖。
- 题目聚焦心跳、广播过滤或断线恢复。
- 轨迹展示「连接 → 订阅 → 广播 → 恢复」。

## 阶段 09：测试与安全

需发布：

- `testing-node-test`：`node:test` 基础测试。
- `testing-assertions`：`node:assert/strict` 断言。
- `testing-lifecycle`：测试生命周期和清理。
- `testing-mocking`：测试中的 mock。
- `testing-coverage`：覆盖率思维。
- `testing-integration`：集成测试边界。
- `security-permissions-secrets`：权限与密钥边界。
- `security-dependencies-web`：依赖和 Web 安全实践。
- `project-tested-auth`：经过测试的鉴权服务。

阶段项目要求：

- 案例实现简化 token 鉴权函数和测试。
- 题目聚焦测试断言、边界输入或密钥泄露风险。
- 轨迹展示「请求 → 鉴权 → 测试断言 → 安全总结」。

## 阶段 10：诊断与生产工程

需发布：

- `diagnostics-inspector`：Inspector 调试入口。
- `diagnostics-cpu-profile`：CPU Profiling。
- `diagnostics-heap-snapshot`：Heap Snapshot。
- `diagnostics-gc-tracing`：GC 追踪。
- `diagnostics-flame-graphs`：火焰图阅读。
- `diagnostics-performance-baseline`：性能基线和回归判断。
- `production-config-observability`：生产配置与可观测性。
- `production-release-incident`：发布与故障检查流程。
- `project-production-diagnostics`：生产故障诊断实验室。

阶段项目要求：

- 案例模拟一个延迟升高的服务诊断流程。
- 题目聚焦选择正确的诊断工具或判断指标。
- 轨迹展示「指标异常 → 采样 → 定位 → 修复建议」。

## 注册表与目录状态

完成后：

- `publishedLessons.length` 为 90。
- 课程目录中的所有知识点和阶段项目状态均为 `published`。
- `getLesson(id)` 对 90 个目录 ID 均返回对应 `LessonSpec`。
- `validateLessonSpec()` 对全部已发布课程返回空数组。

## 测试策略

新增或更新测试：

- 目录测试：全部 10 个阶段、80 个知识点、10 个阶段项目均为 `published`。
- 注册表测试：发布课程数量为 90，且目录 ID 与注册表 ID 完全一致。
- 质量测试：每个课程至少有 1 个代码文件、1 道题、3 个运行帧、3 条总结和官方来源。
- 阶段测试：阶段 04–10 每阶段均有 8 个知识点和 1 个阶段项目进入注册表。

保留现有验证命令：

```bash
npm run validate:curriculum
npm test
npm run lint
npm run build
git diff --check
```

## 文档更新

实现完成后更新：

- `docs/PRODUCT.md`：说明 90 个课程条目全部发布。
- `docs/ARTICHECTURE.md`：说明阶段 04–10 内容文件和注册表聚合方式。
- `session-handoff.md`：记录当前分支、发布数量、验证命令和下一步建议。

## 风险与约束

- 内容量很大，必须优先复用 `lesson-factory.ts`，避免重复结构失控。
- 阶段 08 的实时通信课程只做概念模拟，不引入真实 WebSocket 服务。
- 阶段 10 的诊断课程使用可读的模拟诊断轨迹，不要求真的生成 CPU profile 或 heap snapshot 文件。
- 已有 `.superpowers/brainstorm/8292-1784101222/` 下的临时文件脏状态不属于本次范围。

## 验收标准

- 课程目录显示全部 90 个条目为已发布。
- 侧边栏每个阶段显示 8 个已发布知识点。
- 所有新课程可通过选择正确答案播放 authored trace。
- 阶段项目按对应阶段知识点进行综合训练。
- 所有自动化验证命令通过。

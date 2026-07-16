# Node.js 阶段 05-10 课程全量上线设计

## 背景

NodePath 的课程目录已经定义 10 个阶段、每阶段 8 个知识点和 1 个阶段项目。当前代码中阶段 01-03 已完整上线，阶段 04 只有 `stream-backpressure` 与 `project-cli-log-analyzer` 两个旧案例完成迁移。用户明确要求将以下后续学习章节全部上线：

- HTTP 基础
- API 与服务设计
- 进程与并发
- 实时通信
- 测试与安全
- 诊断与生产工程

这些内容对应目录阶段 05-10。目标不是只把目录状态改成 published，而是为每个知识点提供可学习、可答题、可运行可视化的真实 Node.js 案例。

## 设计目标

本次上线交付 54 个课程规格：

- 阶段 05-10 的 48 个知识点。
- 阶段 05-10 的 6 个阶段项目。

每个课程必须包含：

- 清晰的中文讲解。
- 可直接阅读的真实 Node.js 示例代码。
- 1 道预测、诊断或迁移类选择题。
- 每个选项的定向反馈。
- authored trace 运行帧，用于当前 Runtime Visualizer 展示。
- 课程总结。
- 至少 1 个 Node.js 官方 Learn 或 API 文档来源。

## 官方内容映射

本次内容以 Node.js 官方 Learn 和 API 文档为主来源。阶段主题映射如下：

| NodePath 阶段 | 官方来源范围 | 内容边界 |
| --- | --- | --- |
| HTTP 基础 | Node.js Learn HTTP、`node:http`、Fetch | HTTP 事务、Server、Request、Response、Header、状态码、路由、请求体、流式响应 |
| API 与服务设计 | `node:http`、AbortController、process、Node.js 生产配置主题 | REST 建模、输入验证、错误模型、配置边界、日志、超时、AbortSignal、健康检查和优雅关闭 |
| 进程与并发 | Node.js Learn Concurrency、`child_process`、`worker_threads`、`cluster` | 事件循环阻塞、libuv 线程池、子进程、Worker、IPC、共享内存、Cluster、模型选择 |
| 实时通信 | Node.js Learn WebSocket client、`node:http` upgrade、stream 背压 | 轮询、SSE、WebSocket 握手、连接生命周期、心跳、广播、实时背压、断线恢复 |
| 测试与安全 | Node.js Learn Test Runner、Security Best Practices、`node:test` | 测试运行器、断言、生命周期、Mock、覆盖率、集成测试、密钥边界、依赖和 Web 安全 |
| 诊断与生产工程 | Node.js Learn Diagnostics、Inspector、Heap Snapshot、GC、Flame Graphs、Profiling | Inspector、CPU Profile、Heap Snapshot、GC trace、火焰图、性能基线、可观测性、发布和事故流程 |

## 课程内容结构

为避免巨型文件，本次按阶段拆分课程文件：

- `content/lessons/stage-05-http-foundations.ts`
- `content/lessons/stage-06-api-design.ts`
- `content/lessons/stage-07-process-concurrency.ts`
- `content/lessons/stage-08-realtime.ts`
- `content/lessons/stage-09-testing-security.ts`
- `content/lessons/stage-10-diagnostics-production.ts`

每个文件导出一个 `LessonSpec[]`：

- `stageFiveHttpFoundationsLessons`
- `stageSixApiDesignLessons`
- `stageSevenProcessConcurrencyLessons`
- `stageEightRealtimeLessons`
- `stageNineTestingSecurityLessons`
- `stageTenDiagnosticsProductionLessons`

所有课程通过现有 `createLessonSpec()` 创建，继续使用当前 `authored-trace` 可视化模式，不引入真实 Node.js 代码执行沙箱。

## 阶段 05：HTTP 基础

目标：让学习者理解一次 HTTP 请求从进入 Server 到产生响应的完整过程。

上线课程：

1. `http-transaction`：HTTP 事务生命周期。
2. `http-create-server`：使用 `node:http` 创建 Server。
3. `http-request`：读取请求方法、URL 和 Header。
4. `http-response`：设置响应体并结束响应。
5. `http-headers-status`：状态码和 Header 的语义。
6. `http-routing-query`：路由和查询参数。
7. `http-request-body`：请求体是可读流，不能假设一次拿完。
8. `http-streaming-fetch`：流式响应与 Fetch。
9. `project-static-file-server`：流式静态文件服务器。

阶段项目要求：组合 URL 解析、路径安全检查、文件流、Content-Type、404 和错误响应。

## 阶段 06：API 与服务设计

目标：让学习者从「能返回响应」升级到「能设计可靠接口」。

上线课程：

1. `api-rest-modeling`：REST 资源建模。
2. `api-input-validation`：输入验证。
3. `api-error-model`：统一错误模型。
4. `api-config-boundary`：配置边界。
5. `api-structured-logging`：结构化日志。
6. `api-timeout`：超时控制。
7. `api-abort-signal`：AbortSignal 取消链路。
8. `api-health-shutdown`：健康检查与优雅关闭。
9. `project-task-rest-api`：任务管理 REST API。

阶段项目要求：实现内存版任务 API 的关键路径，包括 `GET /tasks`、`POST /tasks`、输入校验、错误响应和健康检查。

## 阶段 07：进程与并发

目标：让学习者知道 Node.js 不是「只能单线程」，并能按场景选择并发模型。

上线课程：

1. `concurrency-blocking-loop`：阻塞事件循环。
2. `concurrency-libuv-pool`：libuv 线程池。
3. `concurrency-child-process`：child_process。
4. `concurrency-worker-threads`：worker_threads。
5. `concurrency-ipc`：进程间消息传递。
6. `concurrency-shared-memory`：共享内存边界。
7. `concurrency-cluster`：Cluster。
8. `concurrency-model-choice`：并发模型选择。
9. `project-worker-report`：Worker Pool 报表生成器。

阶段项目要求：把 CPU 密集型报表生成任务拆给 Worker Pool，并通过消息返回汇总结果。

## 阶段 08：实时通信

目标：让学习者理解实时系统不是「发消息」这么简单，而是连接、心跳、背压和恢复的组合。

上线课程：

1. `realtime-polling`：轮询与长轮询。
2. `realtime-sse`：SSE。
3. `realtime-websocket-handshake`：WebSocket 握手。
4. `realtime-connection-lifecycle`：连接生命周期。
5. `realtime-heartbeat`：心跳与超时。
6. `realtime-broadcast`：消息广播。
7. `realtime-backpressure`：实时流量背压。
8. `realtime-recovery`：断线恢复与幂等处理。
9. `project-realtime-notifications`：实时任务通知服务。

阶段项目要求：构建任务通知服务的关键路径，能解释连接注册、广播、断开清理和重放边界。

## 阶段 09：测试与安全

目标：让学习者用证据保证服务正确性，同时建立最基础的安全边界意识。

上线课程：

1. `testing-node-test`：node:test。
2. `testing-assertions`：断言。
3. `testing-lifecycle`：测试生命周期。
4. `testing-mocking`：Mock。
5. `testing-coverage`：代码覆盖率。
6. `testing-integration`：集成测试。
7. `security-permissions-secrets`：权限与密钥边界。
8. `security-dependencies-web`：依赖和 Web 安全实践。
9. `project-tested-auth`：经过测试的鉴权服务。

阶段项目要求：用 `node:test` 覆盖鉴权服务的 token 校验、无权限访问、输入错误和成功路径。

## 阶段 10：诊断与生产工程

目标：让学习者形成「能上线、能观察、能定位问题」的生产工程意识。

上线课程：

1. `diagnostics-inspector`：Inspector 调试。
2. `diagnostics-cpu-profile`：CPU Profiling。
3. `diagnostics-heap-snapshot`：Heap Snapshot。
4. `diagnostics-gc-tracing`：GC 追踪。
5. `diagnostics-flame-graphs`：火焰图。
6. `diagnostics-performance-baseline`：性能基线。
7. `production-config-observability`：生产配置与可观测性。
8. `production-release-incident`：发布与故障检查流程。
9. `project-production-diagnostics`：生产故障诊断实验室。

阶段项目要求：给一个慢请求和内存增长的事故场景，让学习者选择正确诊断顺序，并通过可视化 trace 看到指标、假设、采样、修复验证的链路。

## 注册与目录状态

实现时需要修改：

- `content/curriculum.ts`
  - 将阶段 05-10 的 54 个课程 ID 加入 `publishedIds`。
- `content/lesson-registry.ts`
  - 导入阶段 05-10 的课程数组。
  - 将它们加入 `publishedLessons`。

阶段 04 不在本次范围内补齐。它保留当前两个已发布案例，避免把「文件、Buffer 与 Stream」补课工作和本次 6 个阶段上线混在一起。

## 测试策略

新增或更新测试以保护上线结果：

- `tests/curriculum/registry.test.ts`
  - 阶段 05-10 的 54 个 ID 必须全部出现在 `publishedLessons`。
  - 每个 ID 都可以通过 `getLesson()` 查询。
  - 每个已发布课程都通过 `validateLessonSpec()`。
  - 每个题目选项都有定向反馈。
- `tests/curriculum/catalog.test.ts`
  - 阶段 05-10 目录状态应全部为 `published`。
  - 阶段 04 仍只保留当前两个已发布案例，避免误改范围。
- `scripts/validate-curriculum.ts`
  - 如果脚本只输出数量，无需改动；如果测试依赖旧数量，需要更新为 83 个已发布案例（当前 29 + 新增 54）。

完整验证命令：

```bash
npm run validate:curriculum
npm test
npm run lint
npm run build
git diff --check
```

## 非目标

本次不做：

- 不实现真实 Node.js 沙箱执行。
- 不引入数据库、用户账户或 Supabase 持久化。
- 不补齐阶段 04 的剩余 7 个 planned 课程。
- 不改变沉浸式 UI 布局和运行时可视化组件。
- 不引入第三方运行依赖。

## 验收标准

- 阶段 05-10 在侧边栏中全部显示为已发布。
- 学习者可以通过课程切换器访问这 54 个新增案例。
- 每个新增案例都有真实 Node.js 场景、选择题和运行可视化结果。
- 阶段项目与知识点案例模式一致：代码、选项、运行帧、总结齐全。
- `npm test` 包含新增课程注册和校验测试，并全部通过。
- `npm run validate:curriculum` 输出的已发布案例数量更新为 83。

## 自检

- 没有空白章节或「稍后再补」类描述。
- 阶段 05-10 的课程 ID 与 `content/curriculum.ts` 中现有目录一致。
- 设计范围聚焦内容上线，不扩展 UI、执行沙箱或服务端能力。
- 阶段 04 保持原状，避免与本次需求混淆。

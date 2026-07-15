import type { CatalogLesson, CurriculumStage, StageId } from "../lib/curriculum/types";

const publishedIds = new Set([
  "runtime-introduction",
  "runtime-browser-differences",
  "runtime-v8",
  "runtime-lts",
  "cli-run-scripts",
  "cli-repl",
  "cli-process-arguments",
  "cli-env-console",
  "project-cli-system-inspector",
  "modules-esm",
  "modules-resolution",
  "modules-package-type",
  "modules-node-prefix",
  "packages-dependency-types",
  "packages-semver-scripts",
  "modules-require-cache",
  "typescript-node",
  "project-dependency-inspector",
  "async-callbacks",
  "async-promises",
  "async-await",
  "async-error-propagation",
  "event-loop-order",
  "async-microtasks-nexttick",
  "async-immediate-timers",
  "events-emitter-abort",
  "project-task-scheduler",
  "stream-backpressure",
  "project-cli-log-analyzer"
]);

const lesson = (id: string, title: string, order: number): CatalogLesson => ({
  id,
  title,
  order,
  kind: "knowledge",
  status: publishedIds.has(id) ? "published" : "planned"
});

const project = (id: string, title: string): CatalogLesson => ({
  id,
  title,
  order: 9,
  kind: "stage-project",
  status: publishedIds.has(id) ? "published" : "planned"
});

const stage = (
  id: StageId,
  number: number,
  title: string,
  summary: string,
  entries: readonly [string, string][],
  projectEntry: readonly [string, string]
): CurriculumStage => ({
  id,
  number,
  title,
  summary,
  lessons: entries.map(([lessonId, lessonTitle], index) => lesson(lessonId, lessonTitle, index + 1)),
  project: project(projectEntry[0], projectEntry[1])
});

export const curriculum = [
  stage("runtime-cli", 1, "运行时与命令行", "认识 Node.js", [
    ["runtime-introduction", "Node.js 运行时"],
    ["runtime-browser-differences", "Node.js 与浏览器的差异"],
    ["runtime-v8", "V8 与运行过程"],
    ["runtime-lts", "版本与 LTS"],
    ["cli-run-scripts", "执行 Node.js 脚本"],
    ["cli-repl", "使用 REPL"],
    ["cli-process-arguments", "process 与命令行参数"],
    ["cli-env-console", "环境变量与终端输出"]
  ], ["project-cli-system-inspector", "CLI 系统信息探测器"]),
  stage("modules-packages", 2, "模块、包与 TypeScript", "组织可维护代码", [
    ["modules-esm", "ESM 导入导出"],
    ["modules-resolution", "模块解析"],
    ["modules-package-type", "package.json 与 type"],
    ["modules-node-prefix", "内置模块的 node: 前缀"],
    ["packages-dependency-types", "npm 与依赖类型"],
    ["packages-semver-scripts", "语义化版本和 npm scripts"],
    ["modules-require-cache", "CommonJS 与 require 缓存"],
    ["typescript-node", "Node.js 中的 TypeScript"]
  ], ["project-dependency-inspector", "依赖与配置检查器"]),
  stage("async-events", 3, "异步运行时与事件", "建立事件循环心智模型", [
    ["async-callbacks", "回调模式"],
    ["async-promises", "Promise"],
    ["async-await", "async/await"],
    ["async-error-propagation", "异步错误传播"],
    ["event-loop-order", "事件循环阶段"],
    ["async-microtasks-nexttick", "微任务与 process.nextTick"],
    ["async-immediate-timers", "setImmediate 与计时器"],
    ["events-emitter-abort", "EventEmitter 与任务取消"]
  ], ["project-task-scheduler", "并发任务调度器"]),
  stage("files-streams", 4, "文件、Buffer 与 Stream", "高效处理本地数据", [
    ["files-path-url", "path 与文件 URL"],
    ["files-promises", "fs/promises"],
    ["files-directories-stats", "目录和文件元数据"],
    ["files-watch", "文件监听"],
    ["buffer-encoding", "Buffer 与字符编码"],
    ["streams-readable", "Readable Stream"],
    ["streams-writable-transform", "Writable 与 Transform Stream"],
    ["stream-backpressure", "pipe 与背压"]
  ], ["project-cli-log-analyzer", "CLI 日志分析器"]),
  stage("http-foundations", 5, "HTTP 基础", "理解一次网络事务", [
    ["http-transaction", "HTTP 事务生命周期"],
    ["http-create-server", "创建 Server"],
    ["http-request", "请求对象"],
    ["http-response", "响应对象"],
    ["http-headers-status", "Header 与状态码"],
    ["http-routing-query", "路由和查询参数"],
    ["http-request-body", "请求体与流式解析"],
    ["http-streaming-fetch", "流式响应与 Fetch"]
  ], ["project-static-file-server", "流式静态文件服务器"]),
  stage("api-design", 6, "API 与服务设计", "构建可靠后端接口", [
    ["api-rest-modeling", "REST 资源建模"],
    ["api-input-validation", "输入验证"],
    ["api-error-model", "统一错误模型"],
    ["api-config-boundary", "配置边界"],
    ["api-structured-logging", "结构化日志"],
    ["api-timeout", "超时控制"],
    ["api-abort-signal", "AbortSignal"],
    ["api-health-shutdown", "健康检查与优雅关闭"]
  ], ["project-task-rest-api", "任务管理 REST API"]),
  stage("process-concurrency", 7, "进程与并发", "突破单主线程边界", [
    ["concurrency-blocking-loop", "阻塞事件循环"],
    ["concurrency-libuv-pool", "libuv 线程池"],
    ["concurrency-child-process", "child_process"],
    ["concurrency-worker-threads", "worker_threads"],
    ["concurrency-ipc", "进程间消息传递"],
    ["concurrency-shared-memory", "共享内存边界"],
    ["concurrency-cluster", "Cluster"],
    ["concurrency-model-choice", "并发模型选择"]
  ], ["project-worker-report", "Worker Pool 报表生成器"]),
  stage("realtime", 8, "实时通信", "把服务变成实时系统", [
    ["realtime-polling", "轮询与长轮询"],
    ["realtime-sse", "SSE"],
    ["realtime-websocket-handshake", "WebSocket 握手"],
    ["realtime-connection-lifecycle", "连接生命周期"],
    ["realtime-heartbeat", "心跳与超时"],
    ["realtime-broadcast", "消息广播"],
    ["realtime-backpressure", "实时流量背压"],
    ["realtime-recovery", "断线恢复与幂等处理"]
  ], ["project-realtime-notifications", "实时任务通知服务"]),
  stage("testing-security", 9, "测试与安全", "用证据保证正确性", [
    ["testing-node-test", "node:test"],
    ["testing-assertions", "断言"],
    ["testing-lifecycle", "测试生命周期"],
    ["testing-mocking", "Mock"],
    ["testing-coverage", "代码覆盖率"],
    ["testing-integration", "集成测试"],
    ["security-permissions-secrets", "权限与密钥边界"],
    ["security-dependencies-web", "依赖和 Web 安全实践"]
  ], ["project-tested-auth", "经过测试的鉴权服务"]),
  stage("diagnostics-production", 10, "诊断与生产工程", "让服务可观测、可上线", [
    ["diagnostics-inspector", "Inspector 调试"],
    ["diagnostics-cpu-profile", "CPU Profiling"],
    ["diagnostics-heap-snapshot", "Heap Snapshot"],
    ["diagnostics-gc-tracing", "GC 追踪"],
    ["diagnostics-flame-graphs", "火焰图"],
    ["diagnostics-performance-baseline", "性能基线"],
    ["production-config-observability", "生产配置与可观测性"],
    ["production-release-incident", "发布与故障检查流程"]
  ], ["project-production-diagnostics", "生产故障诊断实验室"])
] as const satisfies readonly CurriculumStage[];

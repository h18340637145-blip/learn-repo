import type { LessonSpec } from "../../lib/curriculum/types";
import { createAdvancedLesson } from "./advanced-lesson-factory";

export const stageTenDiagnosticsProductionLessons: LessonSpec[] = [
  createAdvancedLesson({
    id: "diagnostics-inspector",
    stageId: "diagnostics-production",
    kind: "knowledge",
    order: 1,
    title: "使用 Inspector 定位运行时问题",
    concept: "Node.js Inspector 通过调试协议暴露断点、调用栈、作用域和性能工具。`--inspect-brk` 会在用户代码执行前暂停，适合从入口追踪启动问题；调试端口应只绑定可信接口，不能直接暴露到公网。",
    points: ["--inspect 启动调试协议", "--inspect-brk 在用户代码前暂停", "Inspector 端口等同于高权限控制面"],
    memoryHook: "inspect 打开观察窗，brk 先停再看",
    code: `function normalizeOrders(orders) {
  return orders.map((order) => ({
    id: order.id,
    total: Number(order.total)
  }));
}

console.log("pid:", process.pid);
debugger;

const result = normalizeOrders([
  { id: "o-1", total: "19.9" },
  { id: "o-2", total: "invalid" }
]);

console.log(result);

// 本机调试：node --inspect-brk inspector.mjs`,
    entryFile: "inspector.mjs",
    prompt: "使用 --inspect-brk 启动后，为什么入口代码不会立刻跑完？",
    correct: "运行时在执行用户代码前暂停，等待调试器连接并继续",
    wrongA: "--inspect-brk 会把 JavaScript 自动改写成测试文件",
    wrongB: "Inspector 会永久删除所有断点",
    correctFeedback: "正确：brk 表示在用户代码开始前暂停，连接 DevTools 后可以逐步执行。",
    wrongAFeedback: "Inspector 控制运行与观察，不会改变源文件用途。",
    wrongBFeedback: "断点由调试会话管理，启动 Inspector 不会永久删除它们。",
    lanes: ["启动协议", "暂停入口", "检查变量"],
    frameValues: ["127.0.0.1:9229", "paused", "total=NaN"],
    log: ["Debugger listening on ws://127.0.0.1:9229/...", "Break on start", "inspect normalizeOrders result"],
    summary: ["Inspector 能观察调用栈和运行时状态", "--inspect-brk 适合排查启动阶段问题", "调试端口必须限制在可信网络边界"],
    sourceTitle: "Using the Node.js inspector",
    sourceUrl: "https://nodejs.org/en/learn/diagnostics/live-debugging/using-inspector"
  }),
  createAdvancedLesson({
    id: "diagnostics-cpu-profile",
    stageId: "diagnostics-production",
    kind: "knowledge",
    order: 2,
    title: "采集 CPU Profile",
    concept: "CPU Profile 通过采样记录 JavaScript 在各函数上的时间分布。`--cpu-prof` 会在进程退出时写出 `.cpuprofile` 文件，可在 DevTools 中查看调用树和热点；采样结果应基于可复现负载，而不是凭一次慢请求下结论。",
    points: ["--cpu-prof 开启 V8 CPU 采样", "进程退出时生成 cpuprofile", "热点需要结合代表性负载解释"],
    memoryHook: "先采样，再看热点，最后用基线复验",
    code: `function calculateReport(rows) {
  let checksum = 0;
  for (let round = 0; round < 200; round += 1) {
    for (const row of rows) {
      checksum = (checksum + Math.sqrt(row.value + round)) % 1_000_000;
    }
  }
  return checksum;
}

const rows = Array.from({ length: 50_000 }, (_, index) => ({ value: index }));
console.time("report");
console.log("checksum:", calculateReport(rows));
console.timeEnd("report");

// 采集：node --cpu-prof --cpu-prof-name=baseline.cpuprofile cpu-hotspot.mjs`,
    entryFile: "cpu-hotspot.mjs",
    prompt: "生成的 baseline.cpuprofile 最主要用来回答什么问题？",
    correct: "在这次代表性运行中，CPU 时间主要消耗在哪些调用路径",
    wrongA: "进程当前占用了多少磁盘文件句柄",
    wrongB: "所有未来请求的延迟一定是多少",
    correctFeedback: "正确：CPU Profile 是采样证据，帮助定位函数级热点和调用关系。",
    wrongAFeedback: "文件句柄需要其他诊断指标，CPU Profile 关注处理器时间分布。",
    wrongBFeedback: "一次 Profile 不能保证未来延迟，仍需基线、压测和多次复验。",
    lanes: ["施加负载", "采集样本", "分析热点"],
    frameValues: ["50k rows", "cpuprofile", "calculateReport"],
    log: ["representative report workload started", "V8 CPU samples collected", "baseline.cpuprofile written on exit"],
    summary: ["CPU Profile 用采样方式定位处理器热点", "采集负载必须接近真实业务", "优化后应使用同一基线再次采集对比"],
    sourceTitle: "Profiling Node.js Applications",
    sourceUrl: "https://nodejs.org/en/learn/getting-started/profiling"
  }),
  createAdvancedLesson({
    id: "diagnostics-heap-snapshot",
    stageId: "diagnostics-production",
    kind: "knowledge",
    order: 3,
    title: "安全采集 Heap Snapshot",
    concept: "Heap Snapshot 记录某一时刻 V8 堆中的对象和引用关系，可用于比较增长对象与保留路径。生成快照会阻塞主线程并需要额外内存，内存紧张时甚至可能使进程退出，因此生产采集必须评估影响并优先在副本或受控实例上执行。",
    points: ["writeHeapSnapshot 返回快照文件名", "快照可分析对象保留路径", "采集期间会阻塞且可能显著增加内存压力"],
    memoryHook: "堆快照是重型 X 光，先隔离再拍片",
    code: `import { writeHeapSnapshot } from "node:v8";

const cache = new Map();
for (let index = 0; index < 10_000; index += 1) {
  cache.set("item-" + index, { payload: Buffer.alloc(1024) });
}

process.on("SIGUSR2", () => {
  const filename = writeHeapSnapshot();
  console.log(JSON.stringify({ event: "heap.snapshot", filename }));
});

console.log("pid:", process.pid, "cache size:", cache.size);
// 受控环境触发：kill -USR2 <pid>`,
    entryFile: "heap-snapshot.mjs",
    prompt: "为什么不应在内存已经接近上限的主实例上随意采集快照？",
    correct: "采集会阻塞事件循环并需要额外内存，可能让实例不可用或退出",
    wrongA: "Heap Snapshot 只能记录磁盘文件，和内存无关",
    wrongB: "SIGUSR2 会自动扩容生产机器",
    correctFeedback: "正确：快照是高成本诊断操作，应选择受控实例并预留容量。",
    wrongAFeedback: "Heap Snapshot 记录 V8 堆对象和引用，正是内存诊断工具。",
    wrongBFeedback: "信号只触发当前进程中的处理函数，不会自动扩容基础设施。",
    lanes: ["发现增长", "受控触发", "分析保留"],
    frameValues: ["cache=10k", "SIGUSR2", "heapsnapshot"],
    log: ["memory growth reproduced", "heap snapshot pauses process", "snapshot filename recorded"],
    summary: ["Heap Snapshot 适合寻找对象增长和引用保留路径", "生产采集必须评估暂停和内存成本", "前后两份快照配合稳定复现更有诊断价值"],
    sourceTitle: "Using Heap Snapshot",
    sourceUrl: "https://nodejs.org/en/learn/diagnostics/memory/using-heap-snapshot"
  }),
  createAdvancedLesson({
    id: "diagnostics-gc-tracing",
    stageId: "diagnostics-production",
    kind: "knowledge",
    order: 4,
    title: "用 GC Trace 观察内存回收",
    concept: "`--trace-gc` 会输出垃圾回收事件、回收类型、前后堆大小和停顿时间。它适合判断频繁分配是否导致大量 GC，但单次 GC 不是泄漏证据；需要结合堆趋势、停顿和业务负载一起解释。",
    points: ["--trace-gc 输出 V8 GC 事件", "日志包含回收前后容量和耗时", "频繁 GC 与内存泄漏不是同一个结论"],
    memoryHook: "GC 日志看回收节奏，堆趋势看是否越积越高",
    code: `const batches = [];

for (let round = 0; round < 20; round += 1) {
  const batch = Array.from({ length: 20_000 }, (_, index) => ({
    id: round + "-" + index,
    value: "x".repeat(128)
  }));
  batches.push(batch);

  if (batches.length > 2) batches.shift();
  await new Promise((resolve) => setImmediate(resolve));
}

console.log("live batches:", batches.length);

// 观察：node --trace-gc gc-trace.mjs`,
    entryFile: "gc-trace.mjs",
    prompt: "看到多条 Scavenge 日志后，为什么还不能直接断言存在内存泄漏？",
    correct: "GC 频率只说明分配和回收活动，还要看回收后堆是否持续增长及对象为何被保留",
    wrongA: "因为 Scavenge 表示磁盘空间不足",
    wrongB: "因为 Node.js 从不进行垃圾回收",
    correctFeedback: "正确：泄漏需要持续不可回收的增长证据，GC 日志只是诊断拼图的一部分。",
    wrongAFeedback: "Scavenge 是 V8 新生代垃圾回收事件，不是磁盘容量信号。",
    wrongBFeedback: "V8 会自动进行多种垃圾回收，--trace-gc 正是在展示这些事件。",
    lanes: ["制造分配", "观察回收", "判断趋势"],
    frameValues: ["20 batches", "Scavenge", "live=2"],
    log: ["objects allocated in batches", "Scavenge ... ms", "retained batches remain bounded"],
    summary: ["GC Trace 展示回收事件和暂停成本", "分配抖动可能造成频繁 GC 而不一定是泄漏", "堆快照和长期指标用于解释不可回收增长"],
    sourceTitle: "Tracing garbage collection",
    sourceUrl: "https://nodejs.org/en/learn/diagnostics/memory/using-gc-traces"
  }),
  createAdvancedLesson({
    id: "diagnostics-flame-graphs",
    stageId: "diagnostics-production",
    kind: "knowledge",
    order: 5,
    title: "用火焰图阅读热点调用栈",
    concept: "火焰图把采样调用栈聚合成宽度代表样本占比的方块：横向位置不是时间轴，纵向表示调用深度。Node.js 官方流程可结合 Linux `perf` 和 FlameGraph 工具链生成 SVG，具体命令依赖操作系统与已安装的外部工具。",
    points: ["方块宽度代表采样占比", "纵向表示调用栈深度", "生成流程依赖 perf 与 FlameGraph 等平台工具"],
    memoryHook: "越宽越热，越高调用越深",
    code: `function parseLine(line) {
  return JSON.parse(line);
}

function aggregate(lines) {
  const totals = new Map();
  for (const line of lines) {
    const item = parseLine(line);
    totals.set(item.level, (totals.get(item.level) ?? 0) + 1);
  }
  return totals;
}

const lines = Array.from({ length: 200_000 }, (_, index) =>
  JSON.stringify({ level: index % 10 === 0 ? "ERROR" : "INFO" })
);
console.log(Object.fromEntries(aggregate(lines)));

// Linux 示例：
// perf record -e cycles:u -g -- node --perf-basic-prof-only-functions flame-target.mjs
// perf script | stackcollapse-perf.pl | flamegraph.pl > flamegraph.svg`,
    entryFile: "flame-target.mjs",
    prompt: "火焰图中 parseLine 方块明显更宽，表示什么？",
    correct: "采样期间更多调用栈样本落在 parseLine 路径上，它是优先调查的 CPU 热点",
    wrongA: "parseLine 一定发生了内存泄漏",
    wrongB: "方块越宽表示函数名越长",
    correctFeedback: "正确：宽度对应采样占比，提示该路径消耗了更多 CPU 时间。",
    wrongAFeedback: "CPU 热点和内存泄漏是不同问题，泄漏需要堆与引用证据。",
    wrongBFeedback: "标签只显示名称，方块宽度由聚合样本数量决定。",
    lanes: ["采集调用栈", "折叠样本", "阅读宽度"],
    frameValues: ["perf samples", "collapsed stacks", "parseLine wide"],
    log: ["perf recorded user-space cycles", "stacks collapsed by call path", "flamegraph.svg highlights parseLine"],
    summary: ["火焰图用宽度表达 CPU 样本占比", "横向排列不等于执行时间先后", "平台工具链和采样负载都应记录在诊断报告中"],
    sourceTitle: "Flame graphs",
    sourceUrl: "https://nodejs.org/en/learn/diagnostics/flame-graphs"
  }),
  createAdvancedLesson({
    id: "diagnostics-performance-baseline",
    stageId: "diagnostics-production",
    kind: "knowledge",
    order: 6,
    title: "建立性能基线",
    concept: "性能优化需要可复现基线。`performance.mark()`/`measure()` 记录业务区间耗时，`monitorEventLoopDelay()` 记录事件循环延迟分布；Histogram 的延迟值单位是纳秒，输出毫秒前必须换算。",
    points: ["mark 和 measure 测量命名区间", "monitorEventLoopDelay 需要 enable", "Histogram 延迟单位是纳秒"],
    memoryHook: "先定基线再优化，纳秒除一百万变毫秒",
    code: `import { monitorEventLoopDelay, performance } from "node:perf_hooks";

const delay = monitorEventLoopDelay({ resolution: 20 });
delay.enable();

performance.mark("report:start");
await new Promise((resolve) => setTimeout(resolve, 120));
performance.mark("report:end");
performance.measure("report", "report:start", "report:end");

await new Promise((resolve) => setTimeout(resolve, 50));
delay.disable();

const report = performance.getEntriesByName("report")[0];
console.log(JSON.stringify({
  reportMs: Number(report.duration.toFixed(2)),
  eventLoopP99Ms: Number((delay.percentile(99) / 1e6).toFixed(2))
}));`,
    entryFile: "performance-baseline.mjs",
    prompt: "为什么 delay.percentile(99) 要除以 1e6？",
    correct: "monitorEventLoopDelay 的 Histogram 值是纳秒，除以 1e6 转成毫秒",
    wrongA: "为了把毫秒转换成字节",
    wrongB: "因为 percentile 只能返回字符串",
    correctFeedback: "正确：单位换算是基线可读且不误判的前提。",
    wrongAFeedback: "延迟是时间量，不涉及字节单位。",
    wrongBFeedback: "percentile 返回数值；除法用于纳秒到毫秒的换算。",
    lanes: ["标记区间", "监控事件循环", "输出基线"],
    frameValues: ["mark/measure", "p99 ns", "ms JSON"],
    log: ["performance marks recorded", "event loop delay histogram sampled", "baseline emitted in milliseconds"],
    summary: ["性能结论必须建立在可重复测量上", "业务耗时和事件循环延迟是不同指标", "指标必须明确单位、负载和采集窗口"],
    sourceTitle: "Performance measurement APIs",
    sourceUrl: "https://nodejs.org/api/perf_hooks.html"
  }),
  createAdvancedLesson({
    id: "production-config-observability",
    stageId: "diagnostics-production",
    kind: "knowledge",
    order: 7,
    title: "生产配置与可观测性",
    concept: "生产服务要在启动时校验配置，并用结构化日志、请求 ID、健康检查和运行时指标暴露状态。可观测性输出要稳定、低基数且不包含密钥；本例假定 /metrics 只位于内部网络或平台访问控制之后，不直接暴露到公网。",
    points: ["启动前校验必需配置", "requestId 串联请求日志", "健康与指标端点不输出秘密"],
    memoryHook: "配置先校验，日志可关联，指标能观测",
    code: `import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { monitorEventLoopDelay } from "node:perf_hooks";

const port = Number(process.env.PORT ?? "3000");
const release = process.env.RELEASE_ID ?? "dev";
if (!Number.isInteger(port) || port <= 0 || port > 65_535) throw new Error("invalid PORT");

const loopDelay = monitorEventLoopDelay({ resolution: 20 });
loopDelay.enable();

const server = createServer((request, response) => {
  const requestId = request.headers["x-request-id"] ?? randomUUID();
  response.setHeader("x-request-id", requestId);

  if (request.url === "/healthz") return response.end("ok");
  if (request.url === "/metrics") {
    // 示例假定反向代理或平台只允许内部监控系统访问此端点。
    response.setHeader("Content-Type", "application/json");
    return response.end(JSON.stringify({
      release,
      rssBytes: process.memoryUsage().rss,
      eventLoopP99Ms: loopDelay.percentile(99) / 1e6
    }));
  }

  response.end("service");
  console.log(JSON.stringify({ event: "request.finish", requestId, path: request.url, status: response.statusCode }));
});

server.listen(port, () => console.log(JSON.stringify({ event: "service.ready", port, release })));`,
    entryFile: "observable-service.mjs",
    prompt: "为什么日志中加入 release 和 requestId，但不能加入 API_SECRET？",
    correct: "前两者用于关联版本与请求，密钥进入日志会扩大泄漏范围",
    wrongA: "因为 JSON 不能保存 API_SECRET 字符串",
    wrongB: "因为 requestId 本身可以替代所有鉴权",
    correctFeedback: "正确：可观测字段应服务排障，同时遵守秘密最小暴露原则。",
    wrongAFeedback: "JSON 可以保存字符串，但技术上能写不代表安全上应该写。",
    wrongBFeedback: "requestId 是关联标识，不是身份凭证或授权机制。",
    lanes: ["校验配置", "关联请求", "输出指标"],
    frameValues: ["PORT/release", "requestId", "rss/p99"],
    log: ["service.ready release=dev", "request.finish requestId=...", "metrics returned without secrets"],
    summary: ["生产配置应在启动时集中解析，端口必须位于 1 到 65535", "结构化日志和 requestId 支持调用链排障", "指标要记录单位并避免秘密，同时放在内部网络或访问控制之后"],
    sourceTitle: "Node.js production differences",
    sourceUrl: "https://nodejs.org/en/learn/getting-started/nodejs-the-difference-between-development-and-production"
  }),
  createAdvancedLesson({
    id: "production-release-incident",
    stageId: "diagnostics-production",
    kind: "knowledge",
    order: 8,
    title: "发布与故障检查流程",
    concept: "可靠发布需要版本标识、健康检查、渐进放量和可回滚产物；故障发生时先保护用户和保留证据，再定位根因。`uncaughtExceptionMonitor` 可在默认崩溃流程前记录诊断报告，但不会像 `uncaughtException` 处理器那样改变异常退出行为。",
    points: ["每个运行实例暴露 release ID", "SIGTERM 触发优雅关闭并设置 10 秒强退截止时间", "致命异常保留报告后仍让进程退出并由进程管理器恢复"],
    memoryHook: "发布可识别，故障先止损，证据留完再恢复",
    code: `import { createServer } from "node:http";

const release = process.env.RELEASE_ID ?? "unknown";
let draining = false;

const server = createServer((request, response) => {
  response.setHeader("x-release-id", release);
  if (request.url === "/healthz") {
    response.statusCode = draining ? 503 : 200;
    return response.end(draining ? "draining" : "ok");
  }
  response.end("service");
});

process.on("uncaughtExceptionMonitor", (error, origin) => {
  const report = process.report.writeReport();
  console.error(JSON.stringify({
    event: "process.fatal",
    release,
    origin,
    message: error.message,
    report
  }));
});

process.on("SIGTERM", () => {
  draining = true;
  const forceExit = setTimeout(() => {
    console.error(JSON.stringify({ event: "service.force_exit", release }));
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  server.close(() => {
    clearTimeout(forceExit);
    console.log(JSON.stringify({ event: "service.stopped", release }));
    process.exitCode = 0;
  });
});

server.listen(3000);`,
    entryFile: "release-incident.mjs",
    prompt: "为什么这里使用 uncaughtExceptionMonitor 而不吞掉致命异常？",
    correct: "先记录诊断证据，同时保留默认退出行为，让进程管理器在干净进程中恢复服务",
    wrongA: "为了保证发生致命异常后进程状态仍然完全可靠",
    wrongB: "为了把异常消息返回给每一个客户端",
    correctFeedback: "正确：未知致命异常后进程可能处于不安全状态，记录证据后退出通常比继续运行可靠。",
    wrongAFeedback: "未捕获异常可能已经破坏状态，不能假设进程仍然可靠。",
    wrongBFeedback: "异常详情不应广播给客户端；它应进入受控诊断记录。",
    lanes: ["识别版本", "保留报告", "排水退出"],
    frameValues: ["release ID", "diagnostic report", "SIGTERM close"],
    log: ["health check includes release", "SIGTERM starts 10s force-exit deadline", "server closed; deadline cleared; event loop exits naturally"],
    summary: ["发布必须具备版本标识、健康检查和回滚路径", "优雅关闭成功后让事件循环自然结束，避免 process.exit 截断诊断日志", "致命异常保存证据后应让进程管理器从新进程恢复"],
    sourceTitle: "Process events",
    sourceUrl: "https://nodejs.org/api/process.html#event-uncaughtexceptionmonitor"
  }),
  createAdvancedLesson({
    id: "project-production-diagnostics",
    stageId: "diagnostics-production",
    kind: "stage-project",
    order: 9,
    title: "生产故障诊断实验室",
    concept: "最终项目把 HTTP/API、安全校验、Worker 并发、SSE 通知、结构化日志、perf_hooks 指标和 node:test 集成验证组合成一个可诊断报表服务。`/events`、`/metrics` 和 `/reports` 都位于 Bearer 访问控制后，指标端点还应只暴露在内部网络。当前请求路径只自动暴露低成本运行指标；CPU Profile、Heap Snapshot 和 GC Trace 属于配套诊断手册。",
    points: ["鉴权和输入校验发生在 Worker 任务之前，实时流和指标使用同一访问控制", "SSE 写入返回 false 时立即断开慢订阅者，避免服务端缓冲持续增长", "eventLoopP99Ms 由纳秒换算为毫秒，测试读取 SSE 时设置总截止时间"],
    memoryHook: "请求有边界，重活进 Worker，进度走 SSE，证据进测试与指标",
    code: `import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID, timingSafeEqual } from "node:crypto";
import { once } from "node:events";
import { createServer } from "node:http";
import { monitorEventLoopDelay } from "node:perf_hooks";
import { Worker } from "node:worker_threads";

function safeEqual(left, right) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function runWorker(values) {
  return new Promise((resolve, reject) => {
    const source = "const { parentPort, workerData } = require('node:worker_threads');" +
      "parentPort.postMessage(workerData.reduce((sum, value) => sum + value, 0));";
    const worker = new Worker(source, { eval: true, workerData: values });
    worker.once("message", resolve);
    worker.once("error", reject);
    worker.once("exit", (code) => code !== 0 && reject(new Error("worker exit " + code)));
  });
}

function createLab({ apiToken, reports = { run: runWorker } }) {
  const clients = new Set();
  const loopDelay = monitorEventLoopDelay({ resolution: 20 });
  loopDelay.enable();

  const server = createServer(async (request, response) => {
    const requestId = request.headers["x-request-id"] ?? randomUUID();
    response.setHeader("x-request-id", requestId);
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Content-Type", "application/json; charset=utf-8");

    if (request.url === "/healthz") {
      response.setHeader("Content-Type", "text/plain; charset=utf-8");
      return response.end("ok");
    }

    const protectedPath = request.url === "/metrics" || request.url === "/events" || request.url === "/reports";
    const authorization = String(request.headers.authorization ?? "");
    if (protectedPath && !safeEqual(authorization, "Bearer " + apiToken)) {
      response.statusCode = 401;
      return response.end(JSON.stringify({ error: "unauthorized" }));
    }

    if (request.url === "/metrics") {
      response.setHeader("Content-Type", "application/json");
      return response.end(JSON.stringify({
        rssBytes: process.memoryUsage().rss,
        eventLoopP99Ms: loopDelay.percentile(99) / 1e6,
        sseClients: clients.size
      }));
    }
    if (request.method === "GET" && request.url === "/events") {
      response.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" });
      clients.add(response);
      response.write("event: ready\\ndata: connected\\n\\n");
      response.on("close", () => clients.delete(response));
      return;
    }
    if (request.method !== "POST" || request.url !== "/reports") {
      response.statusCode = 404;
      return response.end(JSON.stringify({ error: "not_found" }));
    }

    try {
      let raw = "";
      for await (const chunk of request) {
        raw += chunk;
        if (Buffer.byteLength(raw) > 32 * 1024) throw new RangeError("body_too_large");
      }
      const input = JSON.parse(raw || "{}");
      if (!Array.isArray(input.values) || !input.values.every(Number.isFinite)) {
        response.statusCode = 400;
        return response.end(JSON.stringify({ error: "invalid_values" }));
      }

      const total = await reports.run(input.values);
      const event = JSON.stringify({ type: "report.ready", requestId, total });
      for (const client of clients) {
        if (!client.write("data: " + event + "\\n\\n")) {
          clients.delete(client);
          client.destroy();
          console.warn(JSON.stringify({ event: "sse.slow_subscriber_disconnected" }));
        }
      }
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify({ requestId, total }));
      console.log(JSON.stringify({ event: "report.finish", requestId, count: input.values.length }));
    } catch (error) {
      if (error instanceof RangeError && error.message === "body_too_large") {
        response.statusCode = 413;
        return response.end(JSON.stringify({ error: "body_too_large" }));
      }
      if (error instanceof SyntaxError) {
        response.statusCode = 400;
        return response.end(JSON.stringify({ error: "invalid_json" }));
      }

      console.error(JSON.stringify({
        event: "report.error",
        requestId,
        errorName: error instanceof Error ? error.name : "UnknownError"
      }));
      response.statusCode = 500;
      response.end(JSON.stringify({ error: "internal_error" }));
    }
  });

  server.on("close", () => loopDelay.disable());
  return server;
}

async function listenOnEphemeralPort(server) {
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address === "object");
  return "http://127.0.0.1:" + address.port;
}

async function closeServer(server) {
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
}

async function readSseUntil(reader, expected, timeoutMs = 2_000) {
  let timeout;
  try {
    return await Promise.race([
      (async () => {
        const decoder = new TextDecoder();
        let text = "";
        while (!text.includes(expected)) {
          const { done, value } = await reader.read();
          if (done) throw new Error("SSE ended before " + expected);
          text += decoder.decode(value, { stream: true });
        }
        return text;
      })(),
      new Promise((_, reject) => {
        timeout = setTimeout(() => reject(new Error("SSE timeout: " + expected)), timeoutMs);
      })
    ]);
  } finally {
    clearTimeout(timeout);
  }
}

test("未授权请求在 Worker 之前返回 401", async (t) => {
  const reports = { run: async () => 0 };
  const run = t.mock.method(reports, "run");
  const server = createLab({ apiToken: "test-token", reports });
  const baseUrl = await listenOnEphemeralPort(server);

  try {
    const response = await fetch(baseUrl + "/reports", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ values: [2, 3, 5] })
    });
    const body = await response.json();
    assert.equal(response.status, 401);
    assert.equal(body.error, "unauthorized");

    const eventsResponse = await fetch(baseUrl + "/events");
    assert.equal(eventsResponse.status, 401);
    assert.equal((await eventsResponse.json()).error, "unauthorized");

    const metricsResponse = await fetch(baseUrl + "/metrics");
    assert.equal(metricsResponse.status, 401);
    assert.equal((await metricsResponse.json()).error, "unauthorized");
    assert.equal(run.mock.callCount(), 0);
  } finally {
    await closeServer(server);
  }
});

test("指标端点返回以毫秒表示的事件循环 P99", async () => {
  const server = createLab({ apiToken: "test-token" });
  const baseUrl = await listenOnEphemeralPort(server);

  try {
    await new Promise((resolve) => setTimeout(resolve, 25));
    const response = await fetch(baseUrl + "/metrics", {
      headers: { authorization: "Bearer test-token" }
    });
    const metrics = await response.json();
    assert.equal(response.status, 200);
    assert.equal(typeof metrics.rssBytes, "number");
    assert.equal(typeof metrics.eventLoopP99Ms, "number");
    assert.equal(Number.isFinite(metrics.eventLoopP99Ms), true);
    assert.equal(typeof metrics.sseClients, "number");
  } finally {
    await closeServer(server);
  }
});

test("鉴权报表完成后向 SSE 客户端广播 report.ready", async (t) => {
  const reports = { run: async () => 0 };
  const run = t.mock.method(reports, "run", async (values) => values.reduce((sum, value) => sum + value, 0));
  const server = createLab({ apiToken: "test-token", reports });
  const baseUrl = await listenOnEphemeralPort(server);
  const controller = new AbortController();
  let reader;

  try {
    const events = await fetch(baseUrl + "/events", {
      headers: { authorization: "Bearer test-token" },
      signal: controller.signal
    });
    assert.equal(events.status, 200);
    assert.equal(events.headers.get("content-type")?.startsWith("text/event-stream"), true);
    assert.ok(events.body);
    reader = events.body.getReader();
    assert.match(await readSseUntil(reader, "data: connected"), /event: ready/);

    const response = await fetch(baseUrl + "/reports", {
      method: "POST",
      headers: { authorization: "Bearer test-token", "content-type": "application/json" },
      body: JSON.stringify({ values: [2, 3, 5] })
    });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).total, 10);
    assert.equal(run.mock.callCount(), 1);
    const eventText = await readSseUntil(reader, '"type":"report.ready"');
    assert.equal(eventText.includes('"type":"report.ready"'), true);
    assert.equal(eventText.includes('"total":10'), true);
  } finally {
    controller.abort();
    if (reader) {
      try {
        await reader.cancel();
      } catch {
        // AbortController 已负责终止 SSE 响应。
      }
    }
    await closeServer(server);
  }
});`,
    entryFile: "production-lab.test.mjs",
    prompt: "未携带正确 Bearer token 的报表请求会怎样流动？",
    correct: "返回 401，并在解析大请求体、启动 Worker 和广播 SSE 之前结束",
    wrongA: "先启动 Worker 计算，再把结果连同密钥写入日志",
    wrongB: "自动降级为匿名管理员并返回报表",
    correctFeedback: "正确：安全边界必须先于昂贵计算和实时广播，失败路径也不会泄漏 token。",
    wrongAFeedback: "未鉴权请求不应消耗 Worker 资源，更不能把秘密写入日志。",
    wrongBFeedback: "缺少有效凭证必须明确失败，不能静默提升权限。",
    lanes: ["HTTP 安全边界", "Worker 与 SSE", "测试与诊断"],
    frameValues: ["auth protected routes", "total=10 broadcast", "slow client disconnect"],
    log: ["events/metrics/reports without token -> 401", "authorized metrics in ms; SSE client ready with deadline", "report.ready received; slow subscribers disconnected; test SSE canceled"],
    summary: ["最终项目以同一 Bearer 边界保护报表、SSE 与内部指标，只有健康检查公开", "eventLoopP99Ms 使用毫秒；SSE 读取设置总截止时间，并在测试结束后主动取消响应", "广播采用断开慢订阅者的明确背压策略；CPU Profile、Heap Snapshot 与 GC Trace 仍是受控诊断手册步骤"],
    sourceTitle: "Performance measurement APIs",
    sourceUrl: "https://nodejs.org/api/perf_hooks.html"
  })
];

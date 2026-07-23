import type { LessonSpec } from "../../lib/curriculum/types";
import { createAdvancedLesson } from "./advanced-lesson-factory";

export const stageSixApiDesignLessons: LessonSpec[] = [
  createAdvancedLesson({
    id: "api-rest-modeling",
    stageId: "api-design",
    kind: "knowledge",
    order: 1,
    title: "REST 资源建模",
    concept: "REST API 先把业务对象建模为资源，再用 HTTP 方法表达动作。`/tasks` 表示任务集合，`/tasks/:id` 表示单个任务，这样路由结构能随业务增长保持清晰。",
    points: ["集合路由处理列表和创建", "资源路由处理单个对象", "HTTP 方法表达读取、创建、更新和删除"],
    memoryHook: "名词定资源，动词交给 HTTP 方法",
    code: `import { createServer } from "node:http";

const tasks = new Map([["1", { id: "1", title: "learn http" }]]);

createServer((request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost");
  const segments = url.pathname.split("/").filter(Boolean);

  if (request.method === "GET" && url.pathname === "/tasks") {
    return response.end(JSON.stringify([...tasks.values()]));
  }

  if (request.method === "GET" && segments[0] === "tasks" && segments[1]) {
    const task = tasks.get(segments[1]);
    response.statusCode = task ? 200 : 404;
    return response.end(JSON.stringify(task ?? { error: "not_found" }));
  }

  response.statusCode = 404;
  response.end("Not Found");
}).listen(3000);`,
    entryFile: "rest-modeling.mjs",
    prompt: "读取 ID 为 1 的单个任务，更符合资源建模的路径是哪一个？",
    correct: "GET /tasks/1",
    wrongA: "GET /getTask?id=1",
    wrongB: "POST /tasks/list",
    correctFeedback: "正确：`/tasks/1` 表达单个任务资源，GET 表达读取动作。",
    wrongAFeedback: "这种路径把动作塞进 URL 名称，资源边界不如 `/tasks/:id` 清晰。",
    wrongBFeedback: "POST 通常不是读取列表的首选方法，`/tasks/list` 也混入了动作词。",
    lanes: ["识别集合", "识别资源", "选择方法"],
    frameValues: ["/tasks", "/tasks/1", "GET"],
    log: ["collection route /tasks", "member route /tasks/1", "GET returns resource"],
    summary: ["REST 路由应围绕资源名词组织", "HTTP 方法承担动作语义", "集合和单资源路径应保持一致层级"],
    sourceTitle: "HTTP",
    sourceUrl: "https://nodejs.org/api/http.html"
  }),
  createAdvancedLesson({
    id: "api-input-validation",
    stageId: "api-design",
    kind: "knowledge",
    order: 2,
    title: "输入验证失败不写入状态",
    concept: "API 接收到外部输入后，必须先验证形状和业务约束，再修改内存、数据库或下游状态。验证失败返回 400，并且不能留下半写入数据，这是可靠接口的底线。",
    points: ["先验证再写入", "400 表示客户端输入错误", "错误分支应提前 return"],
    memoryHook: "门禁没过，仓库不动",
    code: `import { createServer } from "node:http";

const tasks = [];

function validateTask(input) {
  if (!input || typeof input.title !== "string") return "title 必须是字符串";
  if (input.title.trim().length < 3) return "title 至少 3 个字符";
  return null;
}

createServer(async (request, response) => {
  let raw = "";
  for await (const chunk of request) raw += chunk;

  let input;
  try {
    input = JSON.parse(raw || "{}");
  } catch {
    response.statusCode = 400;
    return response.end(JSON.stringify({ error: "请求体必须是合法 JSON" }));
  }

  const error = validateTask(input);
  if (error) {
    response.statusCode = 400;
    return response.end(JSON.stringify({ error }));
  }

  const task = { id: String(tasks.length + 1), title: input.title.trim() };
  tasks.push(task);
  response.statusCode = 201;
  response.end(JSON.stringify(task));
}).listen(3000);`,
    entryFile: "validation.mjs",
    prompt: "当 title 只有 1 个字符时，正确行为是什么？",
    correct: "返回 400，并且不 push 到 tasks",
    wrongA: "先 push，再返回 400",
    wrongB: "返回 201，让客户端自己发现问题",
    correctFeedback: "正确：输入没有通过验证，不能改变服务端状态。",
    wrongAFeedback: "先写入再报错会留下脏数据，客户端也无法信任错误响应。",
    wrongBFeedback: "201 表示创建成功，和验证失败的事实冲突。",
    lanes: ["解析输入", "验证字段", "写入状态"],
    frameValues: ["raw JSON", "400 title", "跳过 push"],
    log: ["body parsed", "validation failed: title too short", "tasks unchanged"],
    summary: ["输入验证必须发生在状态变更之前", "400 用于表达客户端提交的数据不合格", "错误分支要提前结束请求处理"],
    sourceTitle: "Class: http.ServerResponse",
    sourceUrl: "https://nodejs.org/api/http.html#class-httpserverresponse"
  }),
  createAdvancedLesson({
    id: "api-error-model",
    stageId: "api-design",
    kind: "knowledge",
    order: 3,
    title: "统一错误模型",
    concept: "统一错误响应让前端、测试和日志系统可以稳定解析失败原因。使用 `{ error: { code, message } }` 这类结构，比在不同分支返回不同字符串更容易维护。",
    points: ["code 适合机器判断", "message 适合人类阅读", "所有错误分支保持同一 JSON 形状"],
    memoryHook: "错误也要有合同",
    code: `import { createServer } from "node:http";

function sendError(response, statusCode, code, message) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify({ error: { code, message } }));
}

createServer((request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost");

  if (url.pathname !== "/tasks") {
    return sendError(response, 404, "not_found", "没有这个资源");
  }

  if (request.method !== "GET") {
    return sendError(response, 405, "method_not_allowed", "该资源不支持此方法");
  }

  response.end(JSON.stringify([]));
}).listen(3000);`,
    entryFile: "error-model.mjs",
    prompt: "为什么错误响应里同时保留 code 和 message？",
    correct: "code 给程序判断，message 给人理解",
    wrongA: "因为 HTTP 状态码已经没用了",
    wrongB: "为了让每个错误返回不同结构",
    correctFeedback: "正确：状态码表达 HTTP 层语义，code/message 让业务层错误更稳定。",
    wrongAFeedback: "HTTP 状态码仍然重要，统一错误模型是补充而不是替代。",
    wrongBFeedback: "统一模型的目标正是让错误结构一致，而不是每个分支随意变化。",
    lanes: ["发现错误", "封装模型", "写出 JSON"],
    frameValues: ["404", "not_found", "{ error }"],
    log: ["route missing", "error.code=not_found", "JSON error response"],
    summary: ["统一错误模型降低客户端分支复杂度", "HTTP 状态码和业务错误码各有职责", "错误响应也应该设置正确 Content-Type"],
    sourceTitle: "HTTP",
    sourceUrl: "https://nodejs.org/api/http.html"
  }),
  createAdvancedLesson({
    id: "api-config-boundary",
    stageId: "api-design",
    kind: "knowledge",
    order: 4,
    title: "集中配置边界",
    concept: "服务配置应集中从 `process.env` 读取、解析和校验，再传给业务模块使用。这样可以区分开发和生产环境，也能避免在业务代码深处散落字符串默认值。",
    points: ["process.env 值都是字符串或 undefined", "集中解析端口和模式", "启动前校验必需配置"],
    memoryHook: "配置先过海关，再进入业务区",
    code: `function readConfig(env = process.env) {
  const port = Number(env.PORT ?? "3000");
  const mode = env.NODE_ENV ?? "development";

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("PORT 必须是正整数");
  }

  return {
    port,
    mode,
    isProduction: mode === "production"
  };
}

const config = readConfig();
console.log("listen port:", config.port);
console.log("production:", config.isProduction);`,
    entryFile: "config.mjs",
    prompt: "为什么要把 `PORT` 转成 Number 后再校验？",
    correct: "process.env.PORT 原始值是字符串",
    wrongA: "因为 listen 只能接收布尔值",
    wrongB: "因为 NODE_ENV 会自动转数字",
    correctFeedback: "正确：环境变量来自字符串边界，进入业务前应显式解析。",
    wrongAFeedback: "listen 的端口是数字或可解析值，不是布尔值。",
    wrongBFeedback: "NODE_ENV 通常是字符串，例如 development 或 production。",
    lanes: ["读取 env", "解析类型", "输出配置"],
    frameValues: ["PORT=\"3000\"", "port=3000", "config"],
    log: ["read process.env", "validate positive integer", "config ready"],
    summary: ["环境变量是进程配置入口", "配置解析应集中且可测试", "开发和生产差异要通过清晰配置表达"],
    sourceTitle: "Process environment variables",
    sourceUrl: "https://nodejs.org/api/process.html#processenv"
  }),
  createAdvancedLesson({
    id: "api-structured-logging",
    stageId: "api-design",
    kind: "knowledge",
    order: 5,
    title: "结构化日志与 requestId",
    concept: "生产服务的日志不应只是散乱文本，而应输出可被机器解析的 JSON。每次请求携带 `requestId` 后，入口日志、错误日志和完成日志就能串成同一条调用链。",
    points: ["JSON 日志便于检索", "requestId 串联同一次请求", "日志应包含事件名和关键上下文"],
    memoryHook: "requestId 是日志线索的红绳",
    code: `import { createServer } from "node:http";
import { randomUUID } from "node:crypto";

function log(event, fields) {
  console.log(JSON.stringify({
    time: new Date().toISOString(),
    event,
    ...fields
  }));
}

createServer((request, response) => {
  const requestId = request.headers["x-request-id"] ?? randomUUID();
  log("request.start", { requestId, method: request.method, url: request.url });

  response.setHeader("x-request-id", requestId);
  response.end("ok");

  log("request.finish", { requestId, statusCode: response.statusCode });
}).listen(3000);`,
    entryFile: "structured-log.mjs",
    prompt: "为什么响应头也写回 `x-request-id`？",
    correct: "让客户端能用同一个 ID 对照服务端日志",
    wrongA: "让 HTTP 方法变成 POST",
    wrongB: "让 JSON 日志自动加密",
    correctFeedback: "正确：客户端拿到 requestId 后，可以在排障时精确关联对应服务端日志。",
    wrongAFeedback: "请求方法由客户端发起时决定，响应头不会改变它。",
    wrongBFeedback: "结构化日志便于解析，不代表自动加密或脱敏。",
    lanes: ["生成 ID", "写入口日志", "写完成日志"],
    frameValues: ["requestId", "request.start", "request.finish"],
    log: ["{\"event\":\"request.start\",\"requestId\":\"...\"}", "response x-request-id", "{\"event\":\"request.finish\",\"requestId\":\"...\"}"],
    summary: ["结构化日志应优先选择稳定字段", "requestId 能串联一次请求的多个事件", "响应带回 requestId 有助于客户端协同排障"],
    sourceTitle: "Console",
    sourceUrl: "https://nodejs.org/api/console.html"
  }),
  createAdvancedLesson({
    id: "api-timeout",
    stageId: "api-design",
    kind: "knowledge",
    order: 6,
    title: "超时控制",
    concept: "API 不能无限等待下游服务，否则一个慢依赖会拖住连接、内存和并发容量。用 `AbortSignal.timeout()` 设定边界，可以把超时转成明确的 504 响应。",
    points: ["超时是服务边界的一部分", "AbortSignal.timeout 创建自动取消信号", "超时应映射为清晰错误响应"],
    memoryHook: "给等待装上闹钟",
    code: `import { createServer } from "node:http";

createServer(async (request, response) => {
  try {
    const signal = AbortSignal.timeout(1500);
    const upstream = await fetch("https://api.example.test/report", { signal });
    const body = await upstream.text();

    response.statusCode = upstream.ok ? 200 : 502;
    response.end(body);
  } catch (error) {
    response.statusCode = 504;
    response.end(JSON.stringify({
      error: { code: "upstream_timeout", message: "上游服务响应超时" }
    }));
  }
}).listen(3000);`,
    entryFile: "timeout.mjs",
    prompt: "上游 1.5 秒内没有响应时，本 API 应该返回什么？",
    correct: "504 和 upstream_timeout 错误",
    wrongA: "一直等待直到上游恢复",
    wrongB: "201 Created",
    correctFeedback: "正确：超时边界触发后应停止等待，并把失败转换成网关超时语义。",
    wrongAFeedback: "无限等待会消耗连接和并发资源，生产服务必须有边界。",
    wrongBFeedback: "201 表示创建成功，和下游超时完全不匹配。",
    lanes: ["创建信号", "调用上游", "处理超时"],
    frameValues: ["1500ms", "fetch(signal)", "504"],
    log: ["timeout boundary set", "upstream pending", "upstream_timeout"],
    summary: ["超时控制保护服务容量", "AbortSignal.timeout 可以直接表达等待上限", "下游超时应转成客户端可理解的错误模型"],
    sourceTitle: "Class: AbortSignal",
    sourceUrl: "https://nodejs.org/api/globals.html#class-abortsignal"
  }),
  createAdvancedLesson({
    id: "api-abort-signal",
    stageId: "api-design",
    kind: "knowledge",
    order: 7,
    title: "用 AbortSignal 取消下游请求",
    concept: "当响应连接提前关闭或上游结果不再需要时，服务端应把取消信号传递给下游 `fetch()`。这样能减少无效网络请求，也能让资源释放更及时。",
    points: ["AbortController 创建可传递信号", "响应连接提前关闭时取消下游", "fetch 接收 signal 后会响应取消"],
    memoryHook: "上游不用了，下游也刹车",
    code: `import { createServer } from "node:http";

createServer(async (request, response) => {
  const controller = new AbortController();

  response.on("close", () => {
    if (!response.writableEnded) controller.abort();
  });

  try {
    const upstream = await fetch("https://api.example.test/tasks", {
      signal: controller.signal
    });
    response.end(await upstream.text());
  } catch (error) {
    if (controller.signal.aborted) return;
    response.statusCode = 502;
    response.end("Bad Gateway");
  }
}).listen(3000);`,
    entryFile: "abort-signal.mjs",
    prompt: "响应连接提前关闭且响应还没结束时，`controller.abort()` 的目的是什么？",
    correct: "取消仍在进行的下游 fetch",
    wrongA: "把已经写完的响应再发送一次",
    wrongB: "删除 process.env 中的配置",
    correctFeedback: "正确：取消信号传给 fetch 后，下游请求可以尽快停止。",
    wrongAFeedback: "响应没有结束才触发取消；abort 不是重发响应。",
    wrongBFeedback: "AbortController 管理异步取消，不会修改环境变量。",
    lanes: ["监听响应连接", "触发 abort", "下游停止"],
    frameValues: ["response closed", "signal.aborted", "fetch canceled"],
    log: ["response close before end", "controller.abort()", "skip writing response"],
    summary: ["取消信号应沿调用链向下游传播", "响应连接提前关闭后继续工作通常是浪费", "响应是否已结束决定取消分支是否需要写回"],
    sourceTitle: "Class: AbortController",
    sourceUrl: "https://nodejs.org/api/globals.html#class-abortcontroller"
  }),
  createAdvancedLesson({
    id: "api-health-shutdown",
    stageId: "api-design",
    kind: "knowledge",
    order: 8,
    title: "健康检查与优雅关闭",
    concept: "线上服务需要健康检查告诉平台自己是否可接收流量，也需要在 SIGTERM 到来时停止接收新连接并等待已有请求收尾。`server.close()` 是优雅关闭 HTTP Server 的关键入口。",
    points: ["/healthz 返回服务健康状态", "SIGTERM 表示进程应准备退出", "server.close() 停止接收新连接"],
    memoryHook: "健康检查报状态，SIGTERM 走退场流程",
    code: `import { createServer } from "node:http";

let shuttingDown = false;

const server = createServer((request, response) => {
  if (request.url === "/healthz") {
    response.statusCode = shuttingDown ? 503 : 200;
    return response.end(shuttingDown ? "shutting_down" : "ok");
  }

  response.end("service response");
});

process.on("SIGTERM", () => {
  shuttingDown = true;
  server.close(() => {
    console.log("server closed");
    process.exit(0);
  });
});

server.listen(3000);`,
    entryFile: "health-shutdown.mjs",
    prompt: "收到 SIGTERM 后，为什么先把 healthz 变成 503？",
    correct: "让负载均衡或平台停止分配新流量",
    wrongA: "表示所有历史请求都失败了",
    wrongB: "让 server.close() 重新打开端口",
    correctFeedback: "正确：关闭期服务不应再接收新流量，健康检查能把这个状态暴露给平台。",
    wrongAFeedback: "503 只表达当前不可接收流量，不代表历史请求全部失败。",
    wrongBFeedback: "server.close() 是停止接收新连接，不是重新监听端口。",
    lanes: ["健康检查", "收到 SIGTERM", "关闭 Server"],
    frameValues: ["200 ok", "shuttingDown=true", "server.close"],
    log: ["GET /healthz -> ok", "SIGTERM received", "server closed"],
    summary: ["健康检查是服务和运行平台之间的协议", "优雅关闭要先停止新流量再收尾", "SIGTERM 处理逻辑应明确且可观测"],
    sourceTitle: "Process events",
    sourceUrl: "https://nodejs.org/api/process.html#signal-events"
  }),
  createAdvancedLesson({
    id: "project-task-rest-api",
    stageId: "api-design",
    kind: "stage-project",
    order: 9,
    title: "任务管理 REST API",
    concept: "阶段项目把资源建模、输入验证、统一错误、结构化日志和健康检查组合成一个小型服务。它仍然是内存版任务 API，但已经具备真实 Node.js HTTP 服务的关键工程边界。",
    points: ["组合 /tasks 和 /tasks/:id 路由", "验证失败返回统一 400 错误", "提供 /healthz 和 SIGTERM 关闭逻辑"],
    memoryHook: "小 API 也要有路由、校验、错误和退场",
    code: `import { createServer } from "node:http";
import { randomUUID } from "node:crypto";

const tasks = new Map();
let shuttingDown = false;

function sendJson(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(body));
}

function sendError(response, statusCode, code, message) {
  sendJson(response, statusCode, { error: { code, message } });
}

async function readJson(request) {
  let raw = "";
  for await (const chunk of request) raw += chunk;
  return JSON.parse(raw || "{}");
}

const server = createServer(async (request, response) => {
  const requestId = request.headers["x-request-id"] ?? randomUUID();
  response.setHeader("x-request-id", requestId);

  const url = new URL(request.url ?? "/", "http://localhost");
  const parts = url.pathname.split("/").filter(Boolean);
  console.log(JSON.stringify({ event: "request.start", requestId, method: request.method, path: url.pathname }));

  if (url.pathname === "/healthz") {
    return sendJson(response, shuttingDown ? 503 : 200, { status: shuttingDown ? "shutting_down" : "ok" });
  }

  if (request.method === "GET" && url.pathname === "/tasks") {
    return sendJson(response, 200, [...tasks.values()]);
  }

  if (request.method === "POST" && url.pathname === "/tasks") {
    try {
      const input = await readJson(request);
      if (typeof input.title !== "string" || input.title.trim().length < 3) {
        return sendError(response, 400, "invalid_title", "title 至少 3 个字符");
      }
      const task = { id: randomUUID(), title: input.title.trim(), done: false };
      tasks.set(task.id, task);
      return sendJson(response, 201, task);
    } catch {
      return sendError(response, 400, "invalid_json", "请求体必须是 JSON");
    }
  }

  if (request.method === "GET" && parts[0] === "tasks" && parts[1]) {
    const task = tasks.get(parts[1]);
    return task ? sendJson(response, 200, task) : sendError(response, 404, "not_found", "任务不存在");
  }

  sendError(response, 404, "not_found", "资源不存在");
});

process.on("SIGTERM", () => {
  shuttingDown = true;
  server.close(() => process.exit(0));
});

server.listen(3000);`,
    entryFile: "task-api.mjs",
    steps: [
      {
        id: "step-1",
        title: "步骤 1：处理业务逻辑路由与输入验证",
        context: "阶段项目将资源建模、输入验证和错误处理组合。我们首先实现创建任务的 API。",
        files: [{
          name: "task-api.mjs",
          code: `import { createServer } from "node:http";\nimport { randomUUID } from "node:crypto";\n\nconst tasks = new Map();\n\nasync function readJson(request) {\n  let raw = "";\n  for await (const chunk of request) raw += chunk;\n  return JSON.parse(raw || "{}");\n}\n\n// server ...\n  if (request.method === "POST" && url.pathname === "/tasks") {\n    try {\n      const input = await readJson(request);\n      if (typeof input.title !== "string" || input.title.trim().length < 3) {\n        return sendError(response, 400, "invalid_title", "title 至少 3 个字符");\n      }\n      const task = { id: randomUUID(), title: input.title.trim(), done: false };\n      tasks.set(task.id, task);\n      return sendJson(response, 201, task);\n    } catch {\n      return sendError(response, 400, "invalid_json", "请求体必须是 JSON");\n    }\n  }`
        }],
        entryFile: "task-api.mjs",
        question: {
          id: "project-task-rest-api-step1",
          type: "prediction",
          prompt: "当 POST /tasks 的 JSON 中缺少合格 title 时，项目代码应该怎么做？",
          options: [
            { id: "a", label: "返回统一 400 错误且不写入 tasks", detail: "拒绝不合格数据", feedback: "正确：路由存在，但输入不合格，所以返回 400，并且不能写入任务集合。" },
            { id: "b", label: "创建一个 title 为空的任务", detail: "破坏契约", feedback: "创建坏数据会破坏 API 契约，也让后续读取和测试变得不可靠。" },
            { id: "c", label: "返回 404，因为 /tasks 不存在", detail: "混淆错误码", feedback: "路由是匹配的，错误在于客户端提交的请求体。" }
          ],
          answerId: "a",
          correctExplanation: "400 Bad Request 用于输入验证失败，服务器拒绝处理该请求。"
        }
      },
      {
        id: "step-2",
        title: "步骤 2：加入健康检查与优雅退出",
        context: "真实服务必须通过健康检查告诉平台自己的状态，并且在收到中止信号时优雅退出。",
        files: [{
          name: "task-api.mjs",
          code: `// ... 前面的代码 ...\nlet shuttingDown = false;\n\nconst server = createServer(async (request, response) => {\n  // ...\n  if (url.pathname === "/healthz") {\n    return sendJson(response, shuttingDown ? 503 : 200, { status: shuttingDown ? "shutting_down" : "ok" });\n  }\n  // ... 业务路由\n});\n\nprocess.on("SIGTERM", () => {\n  shuttingDown = true;\n  server.close(() => process.exit(0));\n});\n\nserver.listen(3000);`
        }],
        entryFile: "task-api.mjs",
        question: {
          id: "project-task-rest-api-step2",
          type: "transfer",
          prompt: "收到 SIGTERM 后，为什么先把 healthz 变成 503？",
          options: [
            { id: "a", label: "让负载均衡或平台停止分配新流量", detail: "优雅退场", feedback: "正确：关闭期服务不应再接收新流量，健康检查能把这个状态暴露给平台。" },
            { id: "b", label: "表示所有历史请求都失败了", detail: "错误认知", feedback: "503 只表达当前不可接收流量，不代表历史请求全部失败。" }
          ],
          answerId: "a",
          correctExplanation: "修改健康检查状态可以让前置的网关/负载均衡摘除当前节点，然后再通过 server.close() 优雅等待现有请求完成。"
        }
      }
    ],
    wrongBFeedback: "`/tasks` 路由存在，失败原因是请求体字段不合法，不是资源不存在。",
    lanes: ["路由分发", "校验与错误", "健康与关闭"],
    frameValues: ["/tasks", "400 invalid_title", "/healthz"],
    log: ["request.start POST /tasks", "validation failed invalid_title", "tasks map unchanged"],
    summary: ["阶段项目整合了任务资源的 REST 路由", "可靠 API 要先验证输入再改变状态", "健康检查、结构化日志和优雅关闭是服务化边界的一部分"],
    sourceTitle: "Node.js, the difference between development and production",
    sourceUrl: "https://nodejs.org/en/learn/getting-started/nodejs-the-difference-between-development-and-production"
  })
];

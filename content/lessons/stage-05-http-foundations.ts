import type { LessonSpec } from "../../lib/curriculum/types";
import { createAdvancedLesson } from "./advanced-lesson-factory";

export const stageFiveHttpFoundationsLessons: LessonSpec[] = [
  createAdvancedLesson({
    id: "http-transaction",
    stageId: "http-foundations",
    kind: "knowledge",
    order: 1,
    title: "HTTP 事务生命周期",
    concept: "一次 HTTP 事务从客户端连接、请求进入 Node 的 request 事件开始，到服务器写出状态、头和响应体结束。理解这条链路后，才能判断代码是在读取请求、执行业务，还是已经进入响应收尾阶段。",
    points: ["request 表示入站请求", "response 表示出站响应", "response.end() 标记响应结束"],
    memoryHook: "请求进门，处理做事，end 关门",
    code: `import { createServer } from "node:http";

const server = createServer((request, response) => {
  console.log("进入请求:", request.method, request.url);

  const body = JSON.stringify({ ok: true, path: request.url });
  response.statusCode = 200;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(body);

  console.log("响应已结束");
});

server.listen(3000);`,
    entryFile: "transaction.mjs",
    prompt: "当浏览器请求 `/learn` 时，哪一步真正表示这次 HTTP 响应已经写完？",
    correct: "调用 response.end(body)",
    wrongA: "执行 createServer(...)",
    wrongB: "读取 request.url",
    correctFeedback: "正确：response.end() 会写出最后一段响应体并结束本次响应。",
    wrongAFeedback: "createServer 只是创建服务器和请求处理函数，尚未处理任何具体请求。",
    wrongBFeedback: "request.url 只是在读取入站请求信息，不会自动向客户端返回内容。",
    lanes: ["请求进入", "处理与写头", "响应结束"],
    frameValues: ["GET /learn", "200 application/json", "end(body)"],
    log: ["进入请求: GET /learn", "写入状态码和 Content-Type", "响应已结束"],
    summary: ["HTTP 事务有明确的请求、处理、响应阶段", "request 只读入站信息，response 负责出站内容", "response.end() 是响应收尾的关键边界"],
    sourceTitle: "Anatomy of an HTTP Transaction",
    sourceUrl: "https://nodejs.org/en/learn/http/anatomy-of-an-http-transaction"
  }),
  createAdvancedLesson({
    id: "http-create-server",
    stageId: "http-foundations",
    kind: "knowledge",
    order: 2,
    title: "创建 Server 与监听端口",
    concept: "`createServer()` 会返回一个 HTTP Server 对象，只有调用 `server.listen()` 后它才开始接收连接。处理函数描述每个请求如何响应，监听端口则决定客户端连接到哪里。",
    points: ["createServer 创建 Server 实例", "listen 让进程绑定端口", "回调可用于确认服务已启动"],
    memoryHook: "create 是造店，listen 是开门",
    code: `import { createServer } from "node:http";

const server = createServer((request, response) => {
  response.end("NodePath HTTP server");
});

server.listen(3000, "127.0.0.1", () => {
  console.log("server ready at http://127.0.0.1:3000");
});`,
    entryFile: "server.mjs",
    prompt: "这段代码中，哪一行让服务器真正开始接收本机 3000 端口的连接？",
    correct: "server.listen(3000, \"127.0.0.1\", callback)",
    wrongA: "import { createServer } from \"node:http\"",
    wrongB: "response.end(\"NodePath HTTP server\")",
    correctFeedback: "正确：listen 绑定地址和端口，绑定成功后 Server 才能接收请求。",
    wrongAFeedback: "导入模块只是取得 API，不会创建或启动任何监听。",
    wrongBFeedback: "response.end() 只会在某个请求到来后执行，不能负责打开端口。",
    lanes: ["创建 Server", "绑定端口", "处理请求"],
    frameValues: ["Server 对象", "127.0.0.1:3000", "返回文本"],
    log: ["createServer handler registered", "server ready at http://127.0.0.1:3000", "GET / -> NodePath HTTP server"],
    summary: ["Server 实例和端口监听是两个步骤", "listen 成功后服务才对客户端可达", "请求处理函数会对每次请求重复执行"],
    sourceTitle: "HTTP",
    sourceUrl: "https://nodejs.org/api/http.html"
  }),
  createAdvancedLesson({
    id: "http-request",
    stageId: "http-foundations",
    kind: "knowledge",
    order: 3,
    title: "读取请求对象",
    concept: "Node 的 HTTP request 对象保存了方法、路径和请求头等入站信息。服务端路由、鉴权和内容协商通常都从这些字段开始判断。",
    points: ["request.method 表示 HTTP 方法", "request.url 包含路径和查询字符串", "request.headers 保存小写化头字段"],
    memoryHook: "method 看动作，url 看地址，headers 看附加说明",
    code: `import { createServer } from "node:http";

createServer((request, response) => {
  const method = request.method ?? "GET";
  const url = request.url ?? "/";
  const accept = request.headers.accept ?? "*/*";

  console.log({ method, url, accept });
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify({ method, url, accept }));
}).listen(3000);`,
    entryFile: "request.mjs",
    prompt: "如果客户端请求 `POST /tasks?done=false`，服务端用哪个字段读取 `POST`？",
    correct: "request.method",
    wrongA: "request.headers.accept",
    wrongB: "response.statusCode",
    correctFeedback: "正确：HTTP 方法来自 request.method，通常用于区分 GET、POST、PUT、DELETE 等动作。",
    wrongAFeedback: "accept 是请求头，表达客户端希望接收的内容类型，不是方法。",
    wrongBFeedback: "response.statusCode 属于出站响应，不能读取客户端请求方法。",
    lanes: ["方法", "地址", "请求头"],
    frameValues: ["POST", "/tasks?done=false", "accept"],
    log: ["method=POST", "url=/tasks?done=false", "accept=application/json"],
    summary: ["request 对象是入站 HTTP 信息入口", "方法和 URL 是路由判断的基础", "headers 常用于鉴权、协商和追踪"],
    sourceTitle: "Class: http.IncomingMessage",
    sourceUrl: "https://nodejs.org/api/http.html#class-httpincomingmessage"
  }),
  createAdvancedLesson({
    id: "http-response",
    stageId: "http-foundations",
    kind: "knowledge",
    order: 4,
    title: "写出响应对象",
    concept: "response 对象负责把服务端决定写回客户端。常见顺序是设置状态码、设置响应头、写出响应体并结束；这些动作共同构成客户端看到的 HTTP 响应。",
    points: ["statusCode 表达处理结果", "setHeader 设置元信息", "end 写出最后内容并结束响应"],
    memoryHook: "状态说明结果，头说明格式，body 说明内容",
    code: `import { createServer } from "node:http";

createServer((request, response) => {
  const payload = { message: "created" };

  response.statusCode = 201;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}).listen(3000);`,
    entryFile: "response.mjs",
    prompt: "客户端如何知道这次返回的是 JSON？",
    correct: "服务端设置了 Content-Type 响应头",
    wrongA: "因为 payload 是对象字面量",
    wrongB: "因为端口是 3000",
    correctFeedback: "正确：Content-Type 明确告诉客户端响应体的媒体类型和编码。",
    wrongAFeedback: "对象字面量只存在于服务端内存里，真正传输前已经 JSON.stringify 成字符串。",
    wrongBFeedback: "端口只决定连接位置，不表达响应体格式。",
    lanes: ["状态码", "响应头", "响应体"],
    frameValues: ["201", "application/json", "{\"message\":\"created\"}"],
    log: ["statusCode=201", "setHeader Content-Type", "end JSON payload"],
    summary: ["响应由状态码、头和响应体组成", "Content-Type 是客户端解析响应的重要依据", "end 之后不应继续写同一次响应"],
    sourceTitle: "Class: http.ServerResponse",
    sourceUrl: "https://nodejs.org/api/http.html#class-httpserverresponse"
  }),
  createAdvancedLesson({
    id: "http-headers-status",
    stageId: "http-foundations",
    kind: "knowledge",
    order: 5,
    title: "Header 与状态码",
    concept: "HTTP 状态码让客户端快速判断结果类型，Header 则补充格式、缓存、认证等元信息。服务端要用准确状态码表达语义，避免所有结果都返回 200。",
    points: ["200 表示读取成功", "201 表示资源已创建", "404 和 415 表达不同错误"],
    memoryHook: "状态码先定性质，Header 再补上下文",
    code: `import { createServer } from "node:http";

createServer((request, response) => {
  if (request.url === "/tasks" && request.method === "GET") {
    response.statusCode = 200;
    return response.end("[]");
  }

  if (request.url === "/tasks" && request.method === "POST") {
    if (request.headers["content-type"] !== "application/json") {
      response.statusCode = 415;
      return response.end("Unsupported Media Type");
    }
    response.statusCode = 201;
    return response.end("{\"id\":\"task-1\"}");
  }

  response.statusCode = 404;
  response.end("Not Found");
}).listen(3000);`,
    entryFile: "status.mjs",
    prompt: "客户端用 `POST /tasks` 但 Content-Type 是 `text/plain`，应返回哪个状态码？",
    correct: "415",
    wrongA: "201",
    wrongB: "404",
    correctFeedback: "正确：路径和方法匹配，但媒体类型不支持，所以是 415 Unsupported Media Type。",
    wrongAFeedback: "201 只适合资源成功创建，校验失败时不能返回创建成功。",
    wrongBFeedback: "404 表示资源路径不存在；这里 `/tasks` 存在，只是请求媒体类型不被接受。",
    lanes: ["匹配路由", "检查 Header", "写状态码"],
    frameValues: ["POST /tasks", "text/plain", "415"],
    log: ["route matched /tasks", "content-type=text/plain", "Unsupported Media Type"],
    summary: ["状态码应服务于机器可判断的结果语义", "201 与 200 的含义不同", "404 和 415 都是错误但失败原因不同"],
    sourceTitle: "HTTP response status codes",
    sourceUrl: "https://nodejs.org/en/learn/http/anatomy-of-an-http-transaction"
  }),
  createAdvancedLesson({
    id: "http-routing-query",
    stageId: "http-foundations",
    kind: "knowledge",
    order: 6,
    title: "路由和查询参数",
    concept: "原始 `request.url` 只是字符串，使用 `new URL()` 可以稳定拆出 pathname 和 searchParams。这样路由判断关注路径，过滤、分页、搜索等可选条件则放在查询参数里处理。",
    points: ["pathname 用于路由匹配", "searchParams 读取查询参数", "需要提供 base URL 解析相对请求路径"],
    memoryHook: "pathname 定房间，searchParams 定筛选器",
    code: `import { createServer } from "node:http";

createServer((request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost");

  if (url.pathname === "/tasks") {
    const status = url.searchParams.get("status") ?? "all";
    response.setHeader("Content-Type", "application/json");
    return response.end(JSON.stringify({ route: "/tasks", status }));
  }

  response.statusCode = 404;
  response.end("Not Found");
}).listen(3000);`,
    entryFile: "routing.mjs",
    prompt: "`GET /tasks?status=open` 进入代码后，`url.pathname` 是什么？",
    correct: "/tasks",
    wrongA: "/tasks?status=open",
    wrongB: "status=open",
    correctFeedback: "正确：pathname 只包含路径部分，查询字符串由 searchParams 读取。",
    wrongAFeedback: "这是原始 request.url 的形态，不是 URL 对象的 pathname。",
    wrongBFeedback: "这是查询参数内容，应通过 searchParams.get(\"status\") 读取。",
    lanes: ["解析 URL", "匹配路径", "读取查询"],
    frameValues: ["/tasks?status=open", "pathname=/tasks", "status=open"],
    log: ["new URL(request.url, base)", "route matched /tasks", "filter status=open"],
    summary: ["不要把路径和查询参数混在字符串里硬切", "new URL 需要 base 来解析相对路径", "清晰拆分能让路由和筛选逻辑更可靠"],
    sourceTitle: "Anatomy of an HTTP Transaction",
    sourceUrl: "https://nodejs.org/en/learn/http/anatomy-of-an-http-transaction"
  }),
  createAdvancedLesson({
    id: "http-request-body",
    stageId: "http-foundations",
    kind: "knowledge",
    order: 7,
    title: "请求体与流式解析",
    concept: "HTTP 请求体在 Node 中是可读流，不保证一次性完整到达。使用 `for await...of` 聚合 chunk 后再解析 JSON，可以把网络分片和业务对象转换分清楚。",
    points: ["request 是可异步迭代的流", "chunk 需要聚合后再 parse", "解析失败应返回 400"],
    memoryHook: "body 像拼图，先收齐再解析",
    code: `import { createServer } from "node:http";

async function readJson(request) {
  let raw = "";
  for await (const chunk of request) {
    raw += chunk;
  }
  return JSON.parse(raw || "{}");
}

createServer(async (request, response) => {
  try {
    const body = await readJson(request);
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({ title: body.title ?? "untitled" }));
  } catch {
    response.statusCode = 400;
    response.end("Invalid JSON");
  }
}).listen(3000);`,
    entryFile: "body.mjs",
    prompt: "为什么不能假设请求体已经在 request.url 里？",
    correct: "请求体来自 request 流，需要读取 chunk",
    wrongA: "因为 JSON 只能放在 Header 里",
    wrongB: "因为 POST 请求没有请求体",
    correctFeedback: "正确：URL 只包含路径和查询，body 通过请求流逐块到达。",
    wrongAFeedback: "Header 存放元信息，不应该承载完整 JSON 业务数据。",
    wrongBFeedback: "POST 常用于提交请求体，关键是要从流中读取。",
    lanes: ["接收 chunk", "聚合文本", "解析 JSON"],
    frameValues: ["chunk...", "raw body", "body.title"],
    log: ["chunk received", "raw JSON collected", "parsed title"],
    summary: ["请求体是流式数据，不是 URL 字段", "JSON.parse 应放在完整文本聚合之后", "解析异常要变成可理解的客户端错误"],
    sourceTitle: "Request Body",
    sourceUrl: "https://nodejs.org/en/learn/http/anatomy-of-an-http-transaction"
  }),
  createAdvancedLesson({
    id: "http-streaming-fetch",
    stageId: "http-foundations",
    kind: "knowledge",
    order: 8,
    title: "流式响应与 Fetch",
    concept: "Node 内置的 `fetch()` 可以发起 HTTP 请求，响应体也可以按流读取。对于大响应或逐步到达的数据，流式读取能更早处理内容，并避免一次性把所有数据放进内存。",
    points: ["fetch 返回 Response", "response.body 可按流读取", "TextDecoder 负责把字节转文本"],
    memoryHook: "fetch 拿响应，body 像水管慢慢读",
    code: `const response = await fetch("https://example.com/events");

if (!response.ok || !response.body) {
  throw new Error("upstream failed: " + response.status);
}

const decoder = new TextDecoder();
let preview = "";

for await (const chunk of response.body) {
  preview += decoder.decode(chunk, { stream: true });
  if (preview.length > 120) break;
}

console.log(preview);`,
    entryFile: "streaming-fetch.mjs",
    prompt: "这段代码为什么使用 `for await` 读取 `response.body`？",
    correct: "为了按块处理响应体流",
    wrongA: "为了重新发送请求头",
    wrongB: "为了同步阻塞整个进程",
    correctFeedback: "正确：response.body 是流，for await 可以逐块消费异步到达的数据。",
    wrongAFeedback: "请求头在 fetch 发起时已经发送，读取 body 不会重发请求头。",
    wrongBFeedback: "await 暂停当前 async 流程，不会冻结整个 Node 进程。",
    lanes: ["发起 fetch", "读取响应流", "解码文本"],
    frameValues: ["Response", "chunk", "preview"],
    log: ["fetch upstream", "body chunk received", "decoded preview"],
    summary: ["fetch 不只适合一次性 JSON，也能处理流", "响应体流适合大文件和渐进数据", "字节流转文本时要显式解码"],
    sourceTitle: "Using the Fetch API with Undici in Node.js",
    sourceUrl: "https://nodejs.org/en/learn/getting-started/fetch"
  }),
  createAdvancedLesson({
    id: "project-static-file-server",
    stageId: "http-foundations",
    kind: "stage-project",
    order: 9,
    title: "流式静态文件服务器",
    concept: "静态文件服务器把 URL 路径映射到磁盘文件，再用流把文件内容写回 HTTP 响应。项目重点不只是能读文件，还要做路径安全检查、Content-Type 判断和 404 分支，避免把任意路径暴露出去。",
    points: ["用 normalize/resolve 限制根目录", "createReadStream 流式返回文件", "根据扩展名设置 Content-Type"],
    memoryHook: "先守住根目录，再开文件水管",
    code: `import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";

const publicRoot = path.resolve("public");
const types = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".png", "image/png"]
]);

function safeFilePath(urlPath) {
  const decoded = decodeURIComponent(urlPath);
  const normalized = path.normalize(decoded).replace(/^([/\\\\])+/, "");
  const filePath = path.resolve(publicRoot, normalized || "index.html");
  return filePath.startsWith(publicRoot + path.sep) ? filePath : null;
}

createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost");
  const filePath = safeFilePath(url.pathname);

  if (!filePath) {
    response.statusCode = 404;
    return response.end("Not Found");
  }

  try {
    const info = await stat(filePath);
    if (!info.isFile()) throw new Error("not a file");

    response.statusCode = 200;
    response.setHeader("Content-Type", types.get(path.extname(filePath)) ?? "application/octet-stream");
    createReadStream(filePath).pipe(response);
  } catch {
    response.statusCode = 404;
    response.end("Not Found");
  }
}).listen(3000);`,
    entryFile: "static-server.mjs",
    prompt: "为什么要检查 `filePath.startsWith(publicRoot + path.sep)`？",
    correct: "防止 ../ 路径逃逸到 public 目录外",
    wrongA: "为了让所有文件都变成 JSON",
    wrongB: "为了强制一次性读完整文件",
    correctFeedback: "正确：解析真实路径后确认仍在 public 根目录下，能阻止路径穿越。",
    wrongAFeedback: "Content-Type 才决定媒体类型，路径安全检查不负责 JSON 转换。",
    wrongBFeedback: "代码使用 createReadStream().pipe(response)，目标正是避免一次性读完整文件。",
    lanes: ["路径校验", "文件探测", "流式响应"],
    frameValues: ["public 内", "isFile()", "pipe(response)"],
    log: ["safe path accepted", "stat file ok", "stream piped with Content-Type"],
    summary: ["静态文件服务必须先做路径安全边界", "大文件返回优先使用流式 pipe", "404 和 Content-Type 是可用 HTTP 服务的基本体验"],
    sourceTitle: "Reading files with Node.js",
    sourceUrl: "https://nodejs.org/en/learn/manipulating-files/reading-files-with-nodejs"
  })
];

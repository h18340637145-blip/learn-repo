import type { LessonSpec } from "../../lib/curriculum/types";
import { createAdvancedLesson } from "./advanced-lesson-factory";

export const stageEightRealtimeLessons: LessonSpec[] = [
  createAdvancedLesson({
    id: "realtime-polling",
    stageId: "realtime",
    kind: "knowledge",
    order: 1,
    title: "轮询与长轮询",
    concept: "轮询是客户端按固定间隔重复请求服务端，简单但会产生空请求。长轮询则让服务端在没有新消息时暂时挂起响应，等有数据或超时后再返回，实时性和请求数量之间更平衡。",
    points: ["短轮询依赖固定间隔", "长轮询可以保持 pending response", "服务端必须设置超时避免连接永久悬挂"],
    memoryHook: "短轮询反复敲门，长轮询门口等消息",
    code: `import { createServer } from "node:http";

const pendingResponses = new Set();
const messages = [];

function writeJson(response, payload) {
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(payload));
}

createServer((request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost");

  if (url.pathname === "/poll") {
    return writeJson(response, { messages });
  }

  if (url.pathname === "/long-poll") {
    const session = { response, timer: null };
    const timer = setTimeout(() => {
      pendingResponses.delete(session);
      writeJson(response, { messages: [] });
    }, 25_000);

    session.timer = timer;
    pendingResponses.add(session);
    response.on("close", () => {
      clearTimeout(timer);
      pendingResponses.delete(session);
    });
    return;
  }

  response.statusCode = 404;
  response.end("Not Found");
}).listen(3000);`,
    entryFile: "polling.mjs",
    prompt: "长轮询分支为什么要设置 setTimeout？",
    correct: "避免没有新消息时响应永久悬挂，超时后释放连接",
    wrongA: "让 HTTP 自动升级成 WebSocket",
    wrongB: "让客户端不再需要发任何请求",
    correctFeedback: "正确：长轮询需要 pending response，但也要有超时边界来释放资源。",
    wrongAFeedback: "setTimeout 不会改变协议，HTTP Upgrade 才是 WebSocket 握手的一部分。",
    wrongBFeedback: "长轮询返回后客户端通常还要再次发起下一次请求。",
    lanes: ["客户端请求", "服务端等待", "返回或超时"],
    frameValues: ["GET /long-poll", "pending", "messages/[]"],
    log: ["long poll connected", "no message yet, keep response open", "timeout returned empty list"],
    summary: ["短轮询简单但空请求多", "长轮询通过挂起响应降低无效请求", "长轮询必须设计超时和重连策略"],
    sourceTitle: "HTTP",
    sourceUrl: "https://nodejs.org/api/http.html"
  }),
  createAdvancedLesson({
    id: "realtime-sse",
    stageId: "realtime",
    kind: "knowledge",
    order: 2,
    title: "SSE 单向事件流",
    concept: "Server-Sent Events 使用普通 HTTP 响应保持连接，服务端以 `text/event-stream` 格式持续写入事件。它适合服务端向浏览器单向推送通知、进度和日志，不需要自己实现 WebSocket 帧协议。",
    points: ["Content-Type 使用 text/event-stream", "每条消息以 data: 开头并用空行结束", "连接需要保持打开并处理 close 清理"],
    memoryHook: "HTTP 不关门，data 一条条流出来",
    code: `import { createServer } from "node:http";

const clients = new Set();

createServer((request, response) => {
  if (request.url !== "/events") {
    response.statusCode = 404;
    return response.end("Not Found");
  }

  response.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive"
  });

  clients.add(response);
  response.write("event: ready\\n");
  response.write("data: connected\\n\\n");

  response.on("close", () => {
    clients.delete(response);
  });
}).listen(3000);

setInterval(() => {
  for (const client of clients) {
    client.write("data: " + Date.now() + "\\n\\n");
  }
}, 1000);`,
    entryFile: "sse.mjs",
    prompt: "浏览器如何识别这不是普通一次性 JSON 响应，而是 SSE 事件流？",
    correct: "响应头设置了 Content-Type: text/event-stream，并持续写入 data 行",
    wrongA: "因为端口号是 3000",
    wrongB: "因为 setInterval 会自动创建 WebSocket",
    correctFeedback: "正确：SSE 依赖事件流媒体类型和 `data:\\n\\n` 格式，连接保持打开持续接收。",
    wrongAFeedback: "端口不决定协议语义；同一端口可以返回不同 Content-Type。",
    wrongBFeedback: "setInterval 只是定时写 HTTP 响应，不会升级协议。",
    lanes: ["建立响应", "写入事件", "连接清理"],
    frameValues: ["text/event-stream", "data: timestamp", "close delete"],
    log: ["SSE client connected", "data: 1784120000000", "client closed and removed"],
    summary: ["SSE 是基于 HTTP 的单向服务端推送", "事件格式必须包含 data 行和空行分隔", "服务端要在连接关闭时删除客户端引用"],
    sourceTitle: "HTTP",
    sourceUrl: "https://nodejs.org/api/http.html"
  }),
  createAdvancedLesson({
    id: "realtime-websocket-handshake",
    stageId: "realtime",
    kind: "knowledge",
    order: 3,
    title: "WebSocket 握手",
    concept: "WebSocket 从一次 HTTP Upgrade 握手开始，客户端发送 `Upgrade: websocket` 和 `Sec-WebSocket-Key`。Node 的 `http` 模块能监听 upgrade 事件并完成握手层处理，但完整 WebSocket 帧解析通常应交给成熟库。",
    points: ["upgrade 事件表示客户端请求协议升级", "Sec-WebSocket-Key 参与生成 accept 值", "握手成功后还需要 WebSocket 帧协议处理"],
    memoryHook: "先用 HTTP 敲门升级，再进入 WebSocket 房间",
    code: `import { createServer } from "node:http";
import { createHash } from "node:crypto";

const GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

const server = createServer();

server.on("upgrade", (request, socket) => {
  const key = request.headers["sec-websocket-key"];
  if (typeof key !== "string") {
    socket.destroy();
    return;
  }

  const accept = createHash("sha1").update(key + GUID).digest("base64");
  socket.write([
    "HTTP/1.1 101 Switching Protocols",
    "Upgrade: websocket",
    "Connection: Upgrade",
    "Sec-WebSocket-Accept: " + accept,
    "",
    ""
  ].join("\\r\\n"));

  console.log("handshake complete; frame parsing belongs to a WebSocket implementation");
});

server.listen(3000);`,
    entryFile: "websocket-handshake.mjs",
    prompt: "这段代码完成了哪一层能力？",
    correct: "完成 HTTP Upgrade 握手层，但还没有实现完整 WebSocket 帧收发",
    wrongA: "已经实现了生产可用的完整 WebSocket server",
    wrongB: "只是普通 GET 请求，和协议升级无关",
    correctFeedback: "正确：它处理 101 Switching Protocols 和 Sec-WebSocket-Accept，后续帧解析还需要协议实现。",
    wrongAFeedback: "完整 WebSocket 还包括帧编码、掩码、关闭帧、ping/pong 等，不能只靠握手代码宣称完成。",
    wrongBFeedback: "upgrade 事件正是 HTTP 协议升级入口，和普通 request 事件不同。",
    lanes: ["Upgrade 请求", "计算 Accept", "切换协议"],
    frameValues: ["Sec-WebSocket-Key", "SHA1+base64", "101"],
    log: ["upgrade received", "Sec-WebSocket-Accept generated", "handshake complete"],
    summary: ["WebSocket 先经过 HTTP Upgrade 握手", "Sec-WebSocket-Key 不是认证密钥，而是握手校验材料", "Node 内置 http 能处理握手入口，但完整协议建议使用专门库"],
    sourceTitle: "WebSocket client and server communication",
    sourceUrl: "https://nodejs.org/en/learn/getting-started/websocket"
  }),
  createAdvancedLesson({
    id: "realtime-connection-lifecycle",
    stageId: "realtime",
    kind: "knowledge",
    order: 4,
    title: "连接生命周期",
    concept: "实时服务需要把连接视为有生命周期的资源：注册、发送、关闭、清理。无论使用 SSE、WebSocket 还是长连接，服务端都必须在 close/error 时移除连接，避免内存和广播目标泄漏。",
    points: ["连接建立时加入集合", "发送时遍历活跃连接", "close 时从集合删除"],
    memoryHook: "连接来登记，走了要销户",
    code: `import { createServer } from "node:http";

const connections = new Map();
let nextId = 1;

createServer((request, response) => {
  if (request.url !== "/events") {
    response.statusCode = 404;
    return response.end("Not Found");
  }

  const id = String(nextId);
  nextId += 1;
  connections.set(id, response);

  response.writeHead(200, { "Content-Type": "text/event-stream" });
  response.write("data: connected " + id + "\\n\\n");

  response.on("close", () => {
    connections.delete(id);
    console.log("connection closed:", id);
  });
}).listen(3000);`,
    entryFile: "connection-lifecycle.mjs",
    prompt: "如果忘记在 close 事件里 delete，会出现什么问题？",
    correct: "连接集合保留失效 response，后续广播和内存都会被污染",
    wrongA: "HTTP 会自动把 Map 清空",
    wrongB: "客户端会收到两份完全相同的响应头",
    correctFeedback: "正确：服务端自己的连接集合不会自动清理，必须在生命周期结束时删除引用。",
    wrongAFeedback: "Map 是业务代码维护的对象，Node 不知道其中哪个条目代表连接。",
    wrongBFeedback: "重复响应头不是主要问题；真正风险是失效连接引用泄漏。",
    lanes: ["注册连接", "保持打开", "关闭清理"],
    frameValues: ["Map.set", "response.write", "Map.delete"],
    log: ["connection added: 1", "active connections=1", "connection closed: 1"],
    summary: ["实时连接是需要显式管理的服务端资源", "连接集合必须和 close/error 生命周期同步", "清理缺失会让广播和内存状态越来越不可信"],
    sourceTitle: "HTTP",
    sourceUrl: "https://nodejs.org/api/http.html"
  }),
  createAdvancedLesson({
    id: "realtime-heartbeat",
    stageId: "realtime",
    kind: "knowledge",
    order: 5,
    title: "心跳与超时",
    concept: "实时连接可能因为网络切换、代理或客户端崩溃变成半开状态。心跳机制通过定期 ping/pong 或应用层探测确认连接仍然可用，超过阈值就关闭并清理。",
    points: ["定时发送 ping 或心跳事件", "收到 pong 后刷新 lastSeen", "超过超时阈值要关闭连接"],
    memoryHook: "定时问还在吗，没回答就下线",
    code: `const clients = new Map();

function register(socket) {
  const client = { socket, lastSeen: Date.now() };
  clients.set(socket, client);

  socket.on("message", (message) => {
    if (message.toString() === "pong") {
      client.lastSeen = Date.now();
    }
  });

  socket.on("close", () => clients.delete(socket));
}

setInterval(() => {
  const now = Date.now();
  for (const [socket, client] of clients) {
    if (now - client.lastSeen > 30_000) {
      socket.end();
      clients.delete(socket);
      continue;
    }
    socket.write("ping");
  }
}, 10_000);`,
    entryFile: "heartbeat.mjs",
    prompt: "服务端为什么不能只依赖进程内 clients 集合判断连接健康？",
    correct: "集合只说明曾经注册过，心跳才能发现半开或失联连接",
    wrongA: "clients 是 Map，无法存储 socket",
    wrongB: "ping 会让所有连接永久不关闭",
    correctFeedback: "正确：网络异常时服务端引用可能仍在，心跳超时用于主动识别不可用连接。",
    wrongAFeedback: "Map 可以用 socket 作为 key；问题不在数据结构，而在健康状态需要持续确认。",
    wrongBFeedback: "心跳配合超时正是为了关闭失联连接，而不是永久保留。",
    lanes: ["发送 ping", "收到 pong", "超时清理"],
    frameValues: ["socket.write", "lastSeen", "socket.end"],
    log: ["ping client", "pong refreshed lastSeen", "client timed out and removed"],
    summary: ["实时系统要处理半开连接", "心跳需要同时包含探测和超时清理", "lastSeen 这类状态应在收到确认后更新"],
    sourceTitle: "WebSocket client and server communication",
    sourceUrl: "https://nodejs.org/en/learn/getting-started/websocket"
  }),
  createAdvancedLesson({
    id: "realtime-broadcast",
    stageId: "realtime",
    kind: "knowledge",
    order: 6,
    title: "消息广播",
    concept: "广播是实时系统的基础动作：服务端收到一条事件后，遍历当前连接集合，把同一消息发送给所有符合条件的客户端。广播逻辑要和连接清理、序列化格式、失败处理一起设计。",
    points: ["连接集合是广播目标来源", "消息应先序列化成稳定格式", "写入失败的连接需要清理或降级"],
    memoryHook: "一条事件进来，沿连接名单逐个送达",
    code: `import { createServer } from "node:http";

const clients = new Set();

function broadcast(event) {
  const payload = "data: " + JSON.stringify(event) + "\\n\\n";
  for (const response of clients) {
    response.write(payload);
  }
}

createServer((request, response) => {
  if (request.method === "POST" && request.url === "/notify") {
    broadcast({ type: "task.done", at: Date.now() });
    return response.end("sent");
  }

  if (request.url === "/events") {
    response.writeHead(200, { "Content-Type": "text/event-stream" });
    clients.add(response);
    response.on("close", () => clients.delete(response));
    return;
  }

  response.statusCode = 404;
  response.end("Not Found");
}).listen(3000);`,
    entryFile: "broadcast.mjs",
    prompt: "`broadcast()` 为什么遍历 clients 集合，而不是只写当前请求的 response？",
    correct: "广播目标是所有已注册实时连接，不只是触发事件的 HTTP 请求",
    wrongA: "Set 会自动把消息复制到浏览器缓存",
    wrongB: "POST 请求的 response 不能写任何内容",
    correctFeedback: "正确：触发事件的请求只是入口，真正要通知的是连接集合里的订阅者。",
    wrongAFeedback: "Set 只保存引用，不会自动发送网络数据；发送仍靠 response.write。",
    wrongBFeedback: "POST 响应当然可以写内容，但它不是所有订阅客户端的连接。",
    lanes: ["事件进入", "遍历连接", "写出消息"],
    frameValues: ["POST /notify", "for clients", "data: event"],
    log: ["task.done event accepted", "broadcast to 3 clients", "POST response sent"],
    summary: ["广播要区分事件入口和订阅连接", "消息格式应在发送前统一序列化", "连接集合的准确性直接影响广播正确性"],
    sourceTitle: "HTTP",
    sourceUrl: "https://nodejs.org/api/http.html"
  }),
  createAdvancedLesson({
    id: "realtime-backpressure",
    stageId: "realtime",
    kind: "knowledge",
    order: 7,
    title: "实时流量背压",
    concept: "实时连接也会遇到背压：如果客户端读取很慢，`write()` 可能返回 `false`，表示内部缓冲区已经超过阈值。服务端应暂停继续写入或限制队列，而不是无限堆积消息。",
    points: ["write 返回 false 表示需要等待 drain", "慢客户端要有队列上限", "背压是保护内存的信号"],
    memoryHook: "write 摇头就别硬塞，等 drain 再继续",
    code: `function sendWithBackpressure(response, queue, event) {
  queue.push("data: " + JSON.stringify(event) + "\\n\\n");
  if (queue.length > 100) {
    response.destroy(new Error("client too slow"));
    return;
  }
  flush(response, queue);
}

function flush(response, queue) {
  while (queue.length > 0) {
    const chunk = queue[0];
    const canContinue = response.write(chunk);
    queue.shift();
    if (!canContinue) {
      response.once("drain", () => flush(response, queue));
      return;
    }
  }
}`,
    entryFile: "realtime-backpressure.mjs",
    prompt: "当 `response.write(chunk)` 返回 false 时，正确策略是什么？",
    correct: "停止继续写，等待 drain 后再恢复 flush",
    wrongA: "立即 while 循环重试直到返回 true",
    wrongB: "忽略返回值，让队列无限增长",
    correctFeedback: "正确：false 是背压信号，等待 drain 能避免继续扩大缓冲压力。",
    wrongAFeedback: "立即重试会占用 CPU 并继续给慢连接施压。",
    wrongBFeedback: "无限队列会让慢客户端拖垮服务端内存。",
    lanes: ["入队消息", "尝试写入", "等待 drain"],
    frameValues: ["queue.push", "write=false", "drain"],
    log: ["event queued", "write returned false", "drain fired, resume flush"],
    summary: ["实时推送不能忽略流背压", "write false 应暂停生产或发送", "队列上限是保护服务端的最后防线"],
    sourceTitle: "Backpressuring in Streams",
    sourceUrl: "https://nodejs.org/en/learn/modules/backpressuring-in-streams"
  }),
  createAdvancedLesson({
    id: "realtime-recovery",
    stageId: "realtime",
    kind: "knowledge",
    order: 8,
    title: "断线恢复与幂等处理",
    concept: "实时连接断开后，客户端可能错过消息。服务端可以给每条事件分配递增序号，并根据 `Last-Event-ID` 或查询参数重放边界之后的消息；处理命令时也要使用幂等键避免重复执行。",
    points: ["事件需要递增 id 或序号", "客户端重连时带回 lastEventId", "服务端只重放边界之后的事件"],
    memoryHook: "消息带编号，重连从断点后补课",
    code: `import { createServer } from "node:http";

const history = [];
let nextId = 1;

function appendEvent(type, payload) {
  const event = { id: nextId, type, payload };
  nextId += 1;
  history.push(event);
  if (history.length > 1000) history.shift();
  return event;
}

createServer((request, response) => {
  const lastEventId = Number(request.headers["last-event-id"] ?? 0);
  const missed = history.filter((event) => event.id > lastEventId);

  response.writeHead(200, { "Content-Type": "text/event-stream" });
  for (const event of missed) {
    response.write("id: " + event.id + "\\n");
    response.write("event: " + event.type + "\\n");
    response.write("data: " + JSON.stringify(event.payload) + "\\n\\n");
  }
}).listen(3000);

appendEvent("task.created", { id: "task-1" });`,
    entryFile: "recovery.mjs",
    prompt: "客户端重连时发送 `Last-Event-ID: 10`，服务端应该重放哪些事件？",
    correct: "只重放 id 大于 10 的历史事件",
    wrongA: "从 id 等于 10 的事件开始全部重放",
    wrongB: "忽略 lastEventId，永远只发最新一条",
    correctFeedback: "正确：Last-Event-ID 表示客户端已经处理到的边界，恢复应从边界之后开始。",
    wrongAFeedback: "如果 id=10 已处理，再重放可能导致重复展示或重复处理。",
    wrongBFeedback: "只发最新一条会丢失断线期间的中间状态变化。",
    lanes: ["记录事件", "读取断点", "重放缺口"],
    frameValues: ["id++", "Last-Event-ID", "id > last"],
    log: ["append event id=11", "client reconnect last=10", "replay event id=11"],
    summary: ["断线恢复依赖可比较的消息边界", "重放窗口要有容量和过期策略", "幂等处理能降低重连重复提交带来的副作用"],
    sourceTitle: "HTTP",
    sourceUrl: "https://nodejs.org/api/http.html"
  }),
  createAdvancedLesson({
    id: "project-realtime-notifications",
    stageId: "realtime",
    kind: "stage-project",
    order: 9,
    title: "实时任务通知服务",
    concept: "阶段项目组合连接注册、广播、断开清理和重放边界，构建一个任务通知服务。HTTP 入口写入任务事件，SSE 连接接收实时消息，客户端重连时用最后事件 ID 补齐断线期间的通知。",
    points: ["SSE 连接注册到 clients", "POST /tasks/:id/done 生成事件并广播", "Last-Event-ID 控制历史重放边界"],
    memoryHook: "先登记连接，再广播事件，掉线按编号补发",
    code: `import { createServer } from "node:http";

const clients = new Set();
const history = [];
let nextEventId = 1;

function publish(type, payload) {
  const event = { id: nextEventId, type, payload };
  nextEventId += 1;
  history.push(event);
  if (history.length > 500) history.shift();

  const frame = "id: " + event.id + "\\nevent: " + type + "\\ndata: " + JSON.stringify(payload) + "\\n\\n";
  for (const client of clients) client.write(frame);
  return event;
}

createServer((request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost");

  if (request.method === "GET" && url.pathname === "/notifications") {
    const lastEventId = Number(request.headers["last-event-id"] ?? 0);
    response.writeHead(200, { "Content-Type": "text/event-stream" });
    clients.add(response);
    for (const event of history.filter((item) => item.id > lastEventId)) {
      response.write("id: " + event.id + "\\nevent: " + event.type + "\\ndata: " + JSON.stringify(event.payload) + "\\n\\n");
    }
    response.on("close", () => clients.delete(response));
    return;
  }

  if (request.method === "POST" && url.pathname.endsWith("/done")) {
    const taskId = url.pathname.split("/")[2];
    const event = publish("task.done", { taskId });
    response.statusCode = 202;
    return response.end(JSON.stringify({ eventId: event.id }));
  }

  response.statusCode = 404;
  response.end("Not Found");
}).listen(3000);`,
    entryFile: "realtime-notifications.mjs",
    prompt: "这个服务为什么既保存 history，又维护 clients 集合？",
    correct: "clients 用于实时广播，history 用于重连后按 lastEventId 重放缺口",
    wrongA: "history 会自动替代所有活跃连接",
    wrongB: "clients 只用于统计日志，不能发送消息",
    correctFeedback: "正确：实时送达和断线恢复是两个边界，需要连接集合和有限历史共同完成。",
    wrongAFeedback: "历史只保存过去事件，不能把新事件主动推给当前连接。",
    wrongBFeedback: "clients 中保存的 response 正是 SSE 写入目标，不只是统计用途。",
    lanes: ["注册连接", "发布事件", "重放边界"],
    frameValues: ["clients.add", "publish task.done", "id > last"],
    log: ["client subscribed notifications", "broadcast task.done eventId=12", "replay events after lastEventId"],
    summary: ["实时通知服务要同时覆盖在线推送和断线恢复", "事件 ID 是广播、确认和重放之间的协议边界", "断开清理能防止失效连接继续占用广播路径"],
    sourceTitle: "HTTP",
    sourceUrl: "https://nodejs.org/api/http.html"
  })
];

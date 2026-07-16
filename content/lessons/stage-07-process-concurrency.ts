import type { LessonSpec } from "../../lib/curriculum/types";
import { createAdvancedLesson } from "./advanced-lesson-factory";

export const stageSevenProcessConcurrencyLessons: LessonSpec[] = [
  createAdvancedLesson({
    id: "concurrency-blocking-loop",
    stageId: "process-concurrency",
    kind: "knowledge",
    order: 1,
    title: "阻塞事件循环",
    concept: "Node.js 的 JavaScript 回调运行在事件循环线程上，CPU 密集循环会占住这条线程。即使计时器已经到期，也要等当前同步循环结束后才能进入回调，所以请求和定时任务都会被拖慢。",
    points: ["同步 CPU 循环会阻塞事件循环", "到期的 timer 也要等待调用栈清空", "服务端请求处理应避免长时间同步计算"],
    memoryHook: "主线程被占用，闹钟响了也没人接",
    code: `import { createServer } from "node:http";

function slowHashLikeWork(rounds) {
  let checksum = 0;
  for (let index = 0; index < rounds; index += 1) {
    checksum = (checksum + Math.sqrt(index)) % 1_000_000;
  }
  return checksum;
}

createServer((request, response) => {
  const startedAt = Date.now();

  setTimeout(() => {
    console.log("timer drift:", Date.now() - startedAt, "ms");
  }, 10);

  if (request.url === "/report") {
    const checksum = slowHashLikeWork(80_000_000);
    return response.end(JSON.stringify({ checksum }));
  }

  response.end("ok");
}).listen(3000);`,
    entryFile: "blocking-loop.mjs",
    prompt: "当 `/report` 触发大循环时，10ms 的 setTimeout 最可能发生什么？",
    correct: "等同步循环结束后才执行，输出明显大于 10ms 的 drift",
    wrongA: "计时器会开新线程抢占 JavaScript 循环",
    wrongB: "response.end 会自动把 CPU 循环移到 libuv 线程池",
    correctFeedback: "正确：计时器只是在 timers 阶段排队，JavaScript 调用栈被 CPU 循环占住时不能执行回调。",
    wrongAFeedback: "setTimeout 不会让回调并行抢占主线程，它仍然要回到事件循环线程执行。",
    wrongBFeedback: "response.end 只负责写响应，不会把前面的同步计算自动 offload。",
    lanes: ["请求进入", "CPU 循环", "timer 回调"],
    frameValues: ["GET /report", "80M rounds", "drift > 10ms"],
    log: ["request /report accepted", "main thread running slowHashLikeWork", "timer drift: 640 ms"],
    summary: ["Node 适合高并发 I/O，但同步 CPU 工作仍会阻塞事件循环", "timer 到期不代表回调立刻执行", "CPU 密集任务应拆分、下沉到 Worker 或移出请求主路径"],
    sourceTitle: "Don't Block the Event Loop",
    sourceUrl: "https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop"
  }),
  createAdvancedLesson({
    id: "concurrency-libuv-pool",
    stageId: "process-concurrency",
    kind: "knowledge",
    order: 2,
    title: "libuv 线程池",
    concept: "部分 Node.js API 会把耗时工作交给 libuv 线程池，例如 `crypto.pbkdf2()` 和一些文件系统操作。JavaScript 主线程提交任务后继续处理事件，完成结果再通过回调回到事件循环。",
    points: ["pbkdf2 会进入 libuv 线程池", "线程池适合 Node 内置的异步阻塞型操作", "回调仍然回到事件循环线程执行"],
    memoryHook: "主线程派单，线程池做工，回调回前台",
    code: `import { pbkdf2 } from "node:crypto";
import { readFile } from "node:fs";

console.log("submit jobs");

pbkdf2("secret", "salt", 250_000, 32, "sha256", (error, key) => {
  if (error) throw error;
  console.log("crypto done:", key.length);
});

readFile("package.json", "utf8", (error, text) => {
  if (error) throw error;
  console.log("file done:", text.length);
});

console.log("event loop can keep accepting work");`,
    entryFile: "libuv-pool.mjs",
    prompt: "这段代码提交 pbkdf2 后，为什么最后一行日志通常会先打印？",
    correct: "pbkdf2 在线程池执行，主线程提交后继续向下运行",
    wrongA: "pbkdf2 是同步 API，会先算完再继续",
    wrongB: "readFile 和 pbkdf2 的回调会在 import 之前执行",
    correctFeedback: "正确：异步 pbkdf2 把计算交给线程池，完成后再把回调排回事件循环。",
    wrongAFeedback: "这里使用的是回调版 pbkdf2，不是 pbkdf2Sync；它不会阻塞到计算完成。",
    wrongBFeedback: "模块导入和同步顶层代码先执行，异步回调只能在之后的事件循环轮次运行。",
    lanes: ["提交任务", "线程池执行", "回调返回"],
    frameValues: ["pbkdf2/readFile", "worker pool", "crypto done"],
    log: ["submit jobs", "event loop can keep accepting work", "crypto done: 32"],
    summary: ["libuv 线程池支撑一部分 Node 异步 API", "它不是任意 JavaScript 代码的自动并行器", "线程池任务完成后仍通过事件循环交付结果"],
    sourceTitle: "Comparing Node.js concurrency models",
    sourceUrl: "https://nodejs.org/en/learn/concurrency/comparing-nodejs-concurrency-models"
  }),
  createAdvancedLesson({
    id: "concurrency-child-process",
    stageId: "process-concurrency",
    kind: "knowledge",
    order: 3,
    title: "child_process 运行外部命令",
    concept: "`child_process` 适合把外部程序作为独立进程运行，例如调用系统命令、图像工具或已有 CLI。父进程通过标准输入输出和退出码观察结果，进程之间默认不共享内存。",
    points: ["spawn 可以流式读取子进程 stdout", "execFile 避免 shell 字符串拼接风险", "exit code 决定外部命令是否成功"],
    memoryHook: "外包给另一个进程，用 stdout 和退出码验收",
    code: `import { spawn } from "node:child_process";

const child = spawn(process.execPath, ["--version"], {
  stdio: ["ignore", "pipe", "pipe"]
});

child.stdout.on("data", (chunk) => {
  console.log("node version:", chunk.toString().trim());
});

child.stderr.on("data", (chunk) => {
  console.error("child error:", chunk.toString());
});

child.on("close", (code) => {
  console.log("child exited with", code);
});`,
    entryFile: "child-process.mjs",
    prompt: "父进程如何知道这个外部命令是否正常结束？",
    correct: "监听 close 事件并检查退出码 code",
    wrongA: "只要 spawn 返回对象就代表命令已经成功",
    wrongB: "stdout 有内容就一定代表退出码是 0",
    correctFeedback: "正确：spawn 返回 ChildProcess 只代表进程已创建，最终成功与否要看退出码等信号。",
    wrongAFeedback: "创建进程和命令成功执行是两件事，命令可能随后失败。",
    wrongBFeedback: "很多失败命令也可能写 stdout；退出码才是更稳定的成功边界。",
    lanes: ["创建进程", "读取输出", "检查退出"],
    frameValues: ["spawn", "stdout data", "code=0"],
    log: ["child process started", "node version: v24.x", "child exited with 0"],
    summary: ["child_process 用独立进程承载外部程序", "stdout/stderr 是数据通道，退出码是结果边界", "外部命令参数应数组化传递以降低注入风险"],
    sourceTitle: "Child process",
    sourceUrl: "https://nodejs.org/api/child_process.html"
  }),
  createAdvancedLesson({
    id: "concurrency-worker-threads",
    stageId: "process-concurrency",
    kind: "knowledge",
    order: 4,
    title: "worker_threads 处理 CPU 任务",
    concept: "`worker_threads` 可以在同一进程内创建额外 JavaScript 线程，把 CPU 密集任务移出主事件循环。主线程通过消息发送输入，Worker 算完后再把结果发回来。",
    points: ["Worker 适合 CPU 密集 JavaScript", "主线程与 Worker 通过 message 通信", "Worker 不是处理普通异步 I/O 的首选"],
    memoryHook: "CPU 活交给 Worker，主线程继续接客",
    code: `import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";

function countPrimes(limit) {
  let total = 0;
  for (let value = 2; value <= limit; value += 1) {
    let prime = true;
    for (let factor = 2; factor * factor <= value; factor += 1) {
      if (value % factor === 0) {
        prime = false;
        break;
      }
    }
    if (prime) total += 1;
  }
  return total;
}

if (isMainThread) {
  const worker = new Worker(new URL(import.meta.url), { workerData: 80_000 });
  worker.on("message", (total) => console.log("prime count:", total));
  console.log("main thread stays responsive");
} else {
  parentPort.postMessage(countPrimes(workerData));
}`,
    entryFile: "worker-primes.mjs",
    prompt: "为什么这段代码比在请求处理函数里直接 countPrimes 更不容易卡住主线程？",
    correct: "CPU 计算在 Worker 线程里运行，主线程只等待 message",
    wrongA: "Worker 会让 JavaScript 变成完全无锁共享状态",
    wrongB: "new Worker 会把所有 I/O 自动变快",
    correctFeedback: "正确：Worker 独立执行 CPU 循环，主线程的事件循环可以继续处理其他事件。",
    wrongAFeedback: "Worker 默认不共享普通对象，通信需要消息或显式共享内存。",
    wrongBFeedback: "Worker 主要解决 CPU 密集 JavaScript，普通异步 I/O 通常不需要它。",
    lanes: ["主线程派发", "Worker 计算", "消息返回"],
    frameValues: ["new Worker", "countPrimes", "message total"],
    log: ["main thread stays responsive", "worker counting primes", "prime count: 7837"],
    summary: ["Worker Thread 是 CPU 密集 JavaScript 的常用并发模型", "主线程和 Worker 通过消息传递结果", "不要把 Worker 当成所有异步 I/O 的默认解法"],
    sourceTitle: "Worker threads",
    sourceUrl: "https://nodejs.org/api/worker_threads.html"
  }),
  createAdvancedLesson({
    id: "concurrency-ipc",
    stageId: "process-concurrency",
    kind: "knowledge",
    order: 5,
    title: "进程间消息传递",
    concept: "父进程、子进程和 Worker 不应依赖共享普通变量传递结果，而应通过消息通道明确交换数据。消息传递让任务输入、执行结果和错误边界更清晰，也便于做队列和重试。",
    points: ["fork 子进程带有 IPC 通道", "worker.postMessage 发送任务", "message 事件接收结构化结果"],
    memoryHook: "别隔墙改变量，要走消息窗口",
    code: `import { fork } from "node:child_process";

if (process.argv[2] === "child") {
  process.on("message", (job) => {
    const total = job.items.reduce((sum, item) => sum + item.price, 0);
    process.send({ jobId: job.id, total });
  });
} else {
  const child = fork(new URL(import.meta.url).pathname, ["child"]);
  child.on("message", (result) => {
    console.log("report ready:", result.jobId, result.total);
    child.disconnect();
  });
  child.send({ id: "daily", items: [{ price: 19 }, { price: 23 }] });
}`,
    entryFile: "ipc-report.mjs",
    prompt: "父进程为什么不能直接读取子进程里的 total 局部变量？",
    correct: "它们是不同执行上下文，需要通过 IPC message 返回结果",
    wrongA: "因为 reduce 不能在子进程里使用",
    wrongB: "因为 child.disconnect 会删除父进程内存",
    correctFeedback: "正确：进程有独立内存空间，结果要通过 IPC 通道显式发送。",
    wrongAFeedback: "reduce 是普通 JavaScript 方法，子进程里同样可用。",
    wrongBFeedback: "disconnect 关闭 IPC 通道，不会删除父进程里的普通对象。",
    lanes: ["父进程发送", "子进程计算", "IPC 返回"],
    frameValues: ["child.send(job)", "sum prices", "message result"],
    log: ["parent sent job daily", "child calculated total=42", "report ready: daily 42"],
    summary: ["IPC 让并发单元之间的输入输出显式化", "进程默认不共享普通内存", "消息结构应包含 jobId 以便父进程关联结果"],
    sourceTitle: "Child process",
    sourceUrl: "https://nodejs.org/api/child_process.html"
  }),
  createAdvancedLesson({
    id: "concurrency-shared-memory",
    stageId: "process-concurrency",
    kind: "knowledge",
    order: 6,
    title: "共享内存边界",
    concept: "`SharedArrayBuffer` 可以让多个 Worker 访问同一段二进制内存，但共享之后就必须处理同步问题。`Atomics` 提供原子读写和累加，避免并发写入把计数器更新丢失。",
    points: ["SharedArrayBuffer 显式共享二进制内存", "Atomics.add 保证计数更新不丢失", "共享内存只适合很明确的性能边界"],
    memoryHook: "共享柜台要用原子笔登记",
    code: `import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";

if (isMainThread) {
  const shared = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT);
  const counts = new Int32Array(shared);

  for (let index = 0; index < 2; index += 1) {
    const worker = new Worker(new URL(import.meta.url), { workerData: shared });
    worker.on("exit", () => console.log("count:", Atomics.load(counts, 0)));
  }
} else {
  const counts = new Int32Array(workerData);
  for (let index = 0; index < 10_000; index += 1) {
    Atomics.add(counts, 0, 1);
  }
  parentPort.close();
}`,
    entryFile: "shared-memory.mjs",
    prompt: "为什么这里使用 Atomics.add，而不是 `counts[0] += 1`？",
    correct: "多个 Worker 同时更新同一位置时，Atomics 能避免读改写丢失",
    wrongA: "SharedArrayBuffer 只能存字符串",
    wrongB: "Atomics.add 会自动创建新的 Worker",
    correctFeedback: "正确：普通加法包含读取、计算、写回多个步骤，并发时可能互相覆盖。",
    wrongAFeedback: "SharedArrayBuffer 存的是二进制内存，可通过 Int32Array 等视图读写数字。",
    wrongBFeedback: "Atomics 只提供原子内存操作，不负责创建线程。",
    lanes: ["共享内存", "原子累加", "读取结果"],
    frameValues: ["SharedArrayBuffer", "Atomics.add", "count=20000"],
    log: ["main allocated shared counter", "worker increments atomically", "count: 20000"],
    summary: ["共享内存是显式选择，不是 Worker 的默认通信方式", "并发写共享位置必须考虑数据竞争", "Atomics 用于小而清晰的同步边界"],
    sourceTitle: "Worker threads",
    sourceUrl: "https://nodejs.org/api/worker_threads.html"
  }),
  createAdvancedLesson({
    id: "concurrency-cluster",
    stageId: "process-concurrency",
    kind: "knowledge",
    order: 7,
    title: "Cluster 多进程共享端口",
    concept: "Cluster 通过 primary 进程 fork 多个 worker 进程，让多个 Node 实例共同处理同一服务端口上的连接。它适合把 HTTP 服务扩展到多个 CPU 核心，但每个 worker 仍有独立内存。",
    points: ["primary 负责 fork worker", "worker 可以 listen 同一端口", "进程内状态不会自动跨 worker 共享"],
    memoryHook: "一个门牌，多名店员，各有账本",
    code: `import cluster from "node:cluster";
import { availableParallelism } from "node:os";
import { createServer } from "node:http";

if (cluster.isPrimary) {
  const size = Math.min(availableParallelism(), 4);
  for (let index = 0; index < size; index += 1) {
    cluster.fork();
  }
  cluster.on("exit", (worker) => {
    console.log("worker exited:", worker.process.pid);
  });
} else {
  createServer((request, response) => {
    response.end("handled by " + process.pid);
  }).listen(3000);
}`,
    entryFile: "cluster-server.mjs",
    prompt: "如果在某个 worker 内存里维护 `let count = 0`，这个 count 的范围是什么？",
    correct: "只属于当前 worker 进程，不会自动同步到其他 worker",
    wrongA: "primary 和所有 worker 会共享同一个 JavaScript 变量",
    wrongB: "listen 同一端口会让 worker 变成同一条线程",
    correctFeedback: "正确：cluster worker 是独立进程，共享端口不等于共享内存状态。",
    wrongAFeedback: "不同进程有独立堆内存；要共享状态需外部存储或 IPC。",
    wrongBFeedback: "cluster 使用多个进程处理连接，不会合并成同一线程。",
    lanes: ["Primary", "Workers", "共享端口"],
    frameValues: ["fork x4", "pid per worker", "listen 3000"],
    log: ["primary forks workers", "worker 1234 listening", "GET / handled by 1234"],
    summary: ["Cluster 用多进程利用多核处理服务连接", "共享端口不代表共享业务状态", "有状态数据应放入数据库、缓存或明确的协调层"],
    sourceTitle: "Cluster",
    sourceUrl: "https://nodejs.org/api/cluster.html"
  }),
  createAdvancedLesson({
    id: "concurrency-model-choice",
    stageId: "process-concurrency",
    kind: "knowledge",
    order: 8,
    title: "并发模型选择",
    concept: "Node.js 并发不是只有一种工具：网络和文件 I/O 通常用异步 API，CPU 密集 JavaScript 适合 Worker，外部程序则用 child_process。先识别任务瓶颈，再选择模型，才能避免把简单问题复杂化。",
    points: ["异步 I/O 适合等待网络或文件", "Worker 适合 CPU 密集 JavaScript", "child_process 适合隔离外部命令"],
    memoryHook: "等 I/O 用 async，算 CPU 用 Worker，跑外部用 child",
    code: `import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { Worker } from "node:worker_threads";

function runJob(job) {
  if (job.type === "read-config") {
    return readFile(job.path, "utf8");
  }

  if (job.type === "score-report") {
    return new Promise((resolve, reject) => {
      const worker = new Worker("./score-worker.mjs", { workerData: job.rows });
      worker.once("message", resolve);
      worker.once("error", reject);
    });
  }

  if (job.type === "convert-image") {
    return spawn("magick", [job.input, job.output], { stdio: "inherit" });
  }

  throw new Error("未知任务类型");
}`,
    entryFile: "model-choice.mjs",
    prompt: "一个纯 JavaScript 的大量评分计算，更适合放到哪种模型？",
    correct: "Worker Thread，因为瓶颈是 CPU 密集 JavaScript",
    wrongA: "反复 setTimeout，因为它能让计算变快",
    wrongB: "readFile，因为所有并发都应该走文件 API",
    correctFeedback: "正确：Worker 能把 CPU 循环移出主线程，同时仍使用 JavaScript 实现。",
    wrongAFeedback: "setTimeout 只能让任务分片或延后，不能让 CPU 总计算量自动并行。",
    wrongBFeedback: "readFile 只解决文件 I/O，不会执行评分计算。",
    lanes: ["识别任务", "选择模型", "返回结果"],
    frameValues: ["CPU/I/O/CLI", "async/worker/child", "result"],
    log: ["job type=score-report", "selected worker_threads", "worker returned score"],
    summary: ["模型选择应从瓶颈类型出发", "异步 I/O、Worker、child_process 解决的问题不同", "错误模型会带来额外复杂度或仍然阻塞主线程"],
    sourceTitle: "Comparing Node.js concurrency models",
    sourceUrl: "https://nodejs.org/en/learn/concurrency/comparing-nodejs-concurrency-models"
  }),
  createAdvancedLesson({
    id: "project-worker-report",
    stageId: "process-concurrency",
    kind: "stage-project",
    order: 9,
    title: "Worker Pool 报表生成器",
    concept: "阶段项目把任务队列、Worker、消息返回和聚合结果组合成一个小型 Worker Pool。主线程负责分发报表分片和收集结果，Worker 只做 CPU 计算，从而让服务入口保持可响应。",
    points: ["队列保存待处理报表任务", "固定数量 Worker 消费任务", "结果带 jobId 返回并由主线程聚合"],
    memoryHook: "主线程当调度员，Worker 当报表工人",
    code: `import { Worker } from "node:worker_threads";

const queue = [
  { id: "north", rows: [12, 18, 30] },
  { id: "south", rows: [9, 25, 40] },
  { id: "west", rows: [7, 11, 13] }
];
const results = new Map();
const totalJobs = queue.length;

function startWorker(workerId) {
  const worker = new Worker("./report-worker.mjs");

  worker.on("message", (message) => {
    results.set(message.jobId, message.total);
    if (results.size === totalJobs) {
      console.log("aggregate:", Object.fromEntries(results));
    }
    assign(worker);
  });

  worker.on("error", (error) => {
    console.error("worker failed:", workerId, error.message);
  });

  assign(worker);
}

function assign(worker) {
  const job = queue.shift();
  if (!job) {
    worker.postMessage({ type: "stop" });
    return;
  }

  worker.postMessage({ type: "report", job });
}

startWorker(1);
startWorker(2);`,
    entryFile: "worker-report-pool.mjs",
    prompt: "为什么 Worker 返回的消息里必须带 `jobId`？",
    correct: "主线程需要把乱序完成的结果聚合回对应任务",
    wrongA: "Worker 没有 jobId 就不能启动线程",
    wrongB: "jobId 会自动保证所有任务按提交顺序完成",
    correctFeedback: "正确：多个 Worker 并行执行时完成顺序不可预测，jobId 用来关联结果和原任务。",
    wrongAFeedback: "Worker 启动只需要脚本地址；jobId 是业务协议，不是创建线程的必填项。",
    wrongBFeedback: "jobId 只标识任务，不会改变调度和完成顺序。",
    lanes: ["任务队列", "Worker 执行", "聚合结果"],
    frameValues: ["queue.shift()", "postMessage", "Map results"],
    log: ["dispatch north to worker 1", "worker returned south=74", "aggregate: { north: 60, south: 74, west: 31 }"],
    summary: ["Worker Pool 用固定并发保护主线程和系统资源", "消息协议要包含任务标识和结果数据", "聚合层应能处理并行任务的乱序完成"],
    sourceTitle: "Worker threads",
    sourceUrl: "https://nodejs.org/api/worker_threads.html"
  })
];

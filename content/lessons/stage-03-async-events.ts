import type { LessonSpec, RunnerFrame } from "../../lib/curriculum/types";
import { createLessonSpec } from "./lesson-factory";

const source = (title: string, url: string) => ({ title, url });

const frames = (notes: [string, string, string], values: [string, string, string], log: string[]): RunnerFrame[] => [
  { activeLane: 0, laneValues: [values[0], "等待", "等待"], log: log.slice(0, 1), note: notes[0], delayMs: 300 },
  { activeLane: 1, laneValues: ["完成", values[1], "等待"], log: log.slice(0, 2), note: notes[1], delayMs: 720 },
  { activeLane: 2, laneValues: ["完成", "完成", values[2]], log, note: notes[2], delayMs: 720 }
];

export const stageThreeAsyncEventsLessons: LessonSpec[] = [
  createLessonSpec({
    id: "async-callbacks",
    stageId: "async-events",
    eyebrow: "03.1 · 异步运行时与事件",
    title: "回调：把后续动作交给 Node",
    objectives: ["理解 error-first callback", "预测异步回调与同步日志的先后"],
    prerequisites: ["cli-run-scripts"],
    concept: "回调是 Node 早期异步 API 的核心模式：发起操作时传入函数，操作完成后 Node 再调用它。常见约定是第一个参数为错误，后续参数为结果。",
    points: ["回调不会立即执行", "错误通常放在第一个参数", "同步日志先于异步完成回调"],
    memoryHook: "先登记回调，完成后再敲门",
    files: [{
      name: "callback-read.mjs",
      code: `import { readFile } from "node:fs";

console.log("before");
readFile("message.txt", "utf8", (error, text) => {
  if (error) throw error;
  console.log(text.trim());
});
console.log("after");`
    }],
    entryFile: "callback-read.mjs",
    answer: {
      prompt: "文件存在且内容为 hello 时，日志顺序最可能是什么？",
      options: [
        { id: "a", label: "before → after → hello", detail: "回调在 I/O 完成后执行", feedback: "正确：readFile 发起异步 I/O 后，当前调用栈继续执行 after。" },
        { id: "b", label: "before → hello → after", detail: "把异步当同步", feedback: "readFile 回调不会阻塞后续同步日志。" },
        { id: "c", label: "hello → before → after", detail: "回调抢占调用栈", feedback: "回调必须等异步操作完成，不能抢占已有同步代码。" }
      ],
      answerId: "a",
      correctExplanation: "发起 readFile 后立即继续同步执行，I/O 完成后才调用回调。"
    },
    execution: {
      lanes: ["Call Stack", "I/O 操作", "Callback"],
      frames: frames(["同步打印 before。", "readFile 交给 I/O 后继续。", "文件完成后执行回调。"], ["before", "读取中", "hello"], ["before", "after", "hello"])
    },
    summary: ["回调把未来动作注册给异步 API", "error-first 是 Node 常见约定", "异步回调不会阻塞当前同步调用栈"],
    sources: [source("JavaScript Asynchronous Programming and Callbacks", "https://nodejs.org/en/learn/asynchronous-work/javascript-asynchronous-programming-and-callbacks")]
  }),
  createLessonSpec({
    id: "async-promises",
    stageId: "async-events",
    eyebrow: "03.2 · 异步运行时与事件",
    title: "Promise：给异步结果一个状态",
    objectives: ["理解 fulfilled/rejected 状态", "预测 then 回调执行顺序"],
    prerequisites: ["async-callbacks"],
    concept: "Promise 表示一个未来完成或失败的值。`.then()` 注册成功回调，`.catch()` 注册失败回调；即使 Promise 立即 resolved，then 回调也会进入微任务队列。",
    points: ["Promise 有 pending/fulfilled/rejected 状态", "then 回调属于微任务", "catch 处理拒绝"],
    memoryHook: "Promise 是未来结果的收据",
    files: [{
      name: "promise-order.mjs",
      code: `console.log("sync");

Promise.resolve("promise").then((value) => {
  console.log(value);
});

console.log("end");`
    }],
    entryFile: "promise-order.mjs",
    answer: {
      prompt: "这段代码的输出顺序是什么？",
      options: [
        { id: "a", label: "sync → end → promise", detail: "then 进入微任务", feedback: "正确：同步日志先执行，微任务在调用栈清空后运行。" },
        { id: "b", label: "sync → promise → end", detail: "把 then 当同步", feedback: "then 回调不会在当前同步栈中立即执行。" },
        { id: "c", label: "promise → sync → end", detail: "Promise 抢占了源码顺序", feedback: "Promise 回调不能先于前面的同步日志。" }
      ],
      answerId: "a",
      correctExplanation: "Promise.then 回调排入微任务队列，等待同步代码完成。"
    },
    execution: {
      lanes: ["同步栈", "Promise 状态", "微任务"],
      frames: frames(["打印 sync。", "Promise fulfilled 并登记 then。", "栈清空后运行 then。"], ["sync/end", "fulfilled", "promise"], ["sync", "end", "promise"])
    },
    summary: ["Promise 让异步结果可组合", "then/catch 注册后续动作", "then 回调的执行晚于当前同步代码"],
    sources: [source("Discover Promises in Node.js", "https://nodejs.org/en/learn/asynchronous-work/discover-promises-in-nodejs")]
  }),
  createLessonSpec({
    id: "async-await",
    stageId: "async-events",
    eyebrow: "03.3 · 异步运行时与事件",
    title: "async/await：把 Promise 写成顺序故事",
    objectives: ["解释 await 如何暂停 async 函数", "理解 await 不会阻塞整个进程"],
    prerequisites: ["async-promises"],
    concept: "`async` 函数总是返回 Promise。`await` 会暂停当前 async 函数的后续语句，等待 Promise settled 后再继续；外层同步代码仍会继续运行。",
    points: ["async 函数返回 Promise", "await 暂停当前 async 函数", "外层调用栈不会被 await 阻塞"],
    memoryHook: "await 暂停自己，不冻结世界",
    files: [{
      name: "await-flow.mjs",
      code: `async function loadName() {
  console.log("loading");
  const name = await Promise.resolve("NodePath");
  console.log("loaded", name);
}

loadName();
console.log("outside");`
    }],
    entryFile: "await-flow.mjs",
    answer: {
      prompt: "输出顺序是什么？",
      options: [
        { id: "a", label: "loading → outside → loaded NodePath", detail: "await 让出当前 async 后续", feedback: "正确：await 后的日志等待微任务恢复。" },
        { id: "b", label: "loading → loaded NodePath → outside", detail: "把 await 当同步阻塞", feedback: "await 暂停的是 async 函数后续，不阻塞外层同步日志。" },
        { id: "c", label: "outside → loading → loaded NodePath", detail: "忽略函数调用立即执行", feedback: "调用 loadName 时会先执行到第一个 await。" }
      ],
      answerId: "a",
      correctExplanation: "async 函数执行到 await 后让出，外层 outside 先打印。"
    },
    execution: {
      lanes: ["async 函数", "外层栈", "恢复微任务"],
      frames: frames(["进入 loadName 并打印 loading。", "await 后外层继续。", "Promise resolved 后恢复函数。"], ["loading", "outside", "loaded NodePath"], ["loading", "outside", "loaded NodePath"])
    },
    summary: ["async/await 是 Promise 的语法层", "await 不会阻塞整个 Node 进程", "理解 await 边界能避免日志顺序误判"],
    sources: [source("Discover Promises in Node.js", "https://nodejs.org/en/learn/asynchronous-work/discover-promises-in-nodejs")]
  }),
  createLessonSpec({
    id: "async-error-propagation",
    stageId: "async-events",
    eyebrow: "03.4 · 异步运行时与事件",
    title: "异步错误如何传播",
    objectives: ["用 try/catch 捕获 await 错误", "区分同步 throw 与 Promise reject"],
    prerequisites: ["async-await"],
    concept: "在 async 函数中，throw 会让返回的 Promise 变为 rejected；await 一个 rejected Promise 时，可以用 try/catch 捕获。没有捕获的异步错误会变成未处理拒绝或进程错误。",
    points: ["throw in async 变成 rejected Promise", "await 可配合 try/catch", "异步边界外的 try/catch 抓不到未来回调里的 throw"],
    memoryHook: "await 把 reject 带回 try/catch",
    files: [{
      name: "async-error.mjs",
      code: `async function readConfig() {
  throw new Error("missing config");
}

try {
  await readConfig();
  console.log("ready");
} catch (error) {
  console.log("handled:", error.message);
}`
    }],
    entryFile: "async-error.mjs",
    answer: {
      prompt: "这段代码会输出什么？",
      options: [
        { id: "a", label: "handled: missing config", detail: "await 的 reject 被 catch 捕获", feedback: "正确：async 中的 throw 转成 rejected Promise，await 后进入 catch。" },
        { id: "b", label: "ready", detail: "忽略了 throw", feedback: "readConfig 直接抛出错误，不会执行 ready。" },
        { id: "c", label: "进程一定立即崩溃", detail: "忽略 try/catch", feedback: "这里的 await 在 try 块中，错误已被捕获。" }
      ],
      answerId: "a",
      correctExplanation: "try/catch 包裹 await，可以处理 async 函数里的 throw。"
    },
    execution: {
      lanes: ["async throw", "await", "catch"],
      frames: frames(["readConfig 抛出 Error。", "Promise 变为 rejected。", "catch 打印消息。"], ["missing config", "rejected", "handled"], ["throw Error", "await rejected", "handled: missing config"])
    },
    summary: ["async 函数中的 throw 会拒绝返回的 Promise", "try/catch 能捕获 await 处恢复的错误", "异步错误需要在异步链路上处理"],
    sources: [source("Errors", "https://nodejs.org/api/errors.html")]
  }),
  createLessonSpec({
    id: "event-loop-order",
    stageId: "async-events",
    eyebrow: "03.5 · 异步运行时与事件",
    title: "读懂 Event Loop 执行顺序",
    objectives: ["预测同步代码、微任务和 timers 的顺序", "建立事件循环阶段心智模型"],
    prerequisites: ["async-promises"],
    concept: "当前同步调用栈会先运行完成。随后 Node 会清空微任务队列，再进入事件循环阶段执行计时器、I/O、check 等回调。",
    points: ["同步代码先执行", "Promise.then 是微任务", "setTimeout 回调进入 timers"],
    memoryHook: "栈清空 → 微任务 → 下一阶段",
    files: [{
      name: "event-loop.mjs",
      code: `console.log("1");

setTimeout(() => console.log("2"), 0);
Promise.resolve().then(() => console.log("3"));

console.log("4");`
    }],
    entryFile: "event-loop.mjs",
    answer: {
      prompt: "日志顺序是什么？",
      options: [
        { id: "a", label: "1 → 4 → 3 → 2", detail: "同步 → 微任务 → timers", feedback: "正确：同步日志先完成，Promise 微任务先于 timer 回调。" },
        { id: "b", label: "1 → 2 → 3 → 4", detail: "把 timer 放得太早", feedback: "timer 不能抢占当前同步栈，也晚于微任务。" },
        { id: "c", label: "3 → 1 → 4 → 2", detail: "Promise 不会先于同步语句", feedback: "then 回调等待当前栈清空。" }
      ],
      answerId: "a",
      correctExplanation: "当前调用栈输出 1 和 4，微任务输出 3，timer 输出 2。"
    },
    execution: {
      lanes: ["Call Stack", "Microtask", "Timer Queue"],
      frames: frames(["同步输出 1 和 4。", "清空 Promise 微任务。", "进入 timers 阶段。"], ["1 / 4", "3", "2"], ["1", "4", "3", "2"])
    },
    summary: ["事件循环不打断当前调用栈", "微任务在进入下一阶段前清空", "0ms timer 不是立即同步执行"],
    sources: [source("The Node.js Event Loop", "https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick")]
  }),
  createLessonSpec({
    id: "async-microtasks-nexttick",
    stageId: "async-events",
    eyebrow: "03.6 · 异步运行时与事件",
    title: "process.nextTick 与微任务",
    objectives: ["理解 nextTick 的优先级", "避免过度递归 nextTick 阻塞事件循环"],
    prerequisites: ["event-loop-order"],
    concept: "`process.nextTick()` 会把回调安排在当前操作完成后尽快执行。在 Node 中，nextTick 队列优先级很高，滥用会推迟 I/O 和 timer 回调。",
    points: ["nextTick 不是事件循环阶段", "nextTick 常早于 Promise then", "递归 nextTick 可能饿死 I/O"],
    memoryHook: "nextTick 是 Node 的插队便签",
    files: [{
      name: "nexttick.mjs",
      code: `console.log("start");

Promise.resolve().then(() => console.log("promise"));
process.nextTick(() => console.log("tick"));

console.log("end");`
    }],
    entryFile: "nexttick.mjs",
    answer: {
      prompt: "在 Node 中最可能的输出顺序是什么？",
      options: [
        { id: "a", label: "start → end → tick → promise", detail: "nextTick 先于 Promise 微任务", feedback: "正确：同步完成后，nextTick 队列会优先处理。" },
        { id: "b", label: "start → tick → end → promise", detail: "nextTick 不抢占同步栈", feedback: "nextTick 回调也要等当前同步代码结束。" },
        { id: "c", label: "start → end → promise → tick", detail: "把浏览器微任务模型直接套到 Node", feedback: "Node 中 nextTick 队列优先级更高。" }
      ],
      answerId: "a",
      correctExplanation: "同步日志 start/end 先完成，随后 nextTick，再 Promise then。"
    },
    execution: {
      lanes: ["同步栈", "nextTick", "Promise 微任务"],
      frames: frames(["同步打印 start/end。", "执行 nextTick 回调。", "执行 Promise then。"], ["start/end", "tick", "promise"], ["start", "end", "tick", "promise"])
    },
    summary: ["process.nextTick 是 Node 特有调度工具", "nextTick 回调等待当前栈结束", "大量 nextTick 会延迟其他异步回调"],
    sources: [source("Understanding process.nextTick()", "https://nodejs.org/en/learn/asynchronous-work/understanding-processnexttick")]
  }),
  createLessonSpec({
    id: "async-immediate-timers",
    stageId: "async-events",
    eyebrow: "03.7 · 异步运行时与事件",
    title: "setImmediate 与计时器",
    objectives: ["区分 setTimeout 和 setImmediate", "理解 check 阶段的调度语义"],
    prerequisites: ["event-loop-order"],
    concept: "`setTimeout` 把回调安排到 timers 阶段，`setImmediate` 把回调安排到 check 阶段。二者顺序会受调用上下文影响；在 I/O 回调中，setImmediate 通常先执行。",
    points: ["setTimeout 属于 timers", "setImmediate 属于 check", "I/O 回调中的相对顺序更稳定"],
    memoryHook: "timer 看时间，immediate 看 check 阶段",
    files: [{
      name: "immediate.mjs",
      code: `import { readFile } from "node:fs";

readFile("message.txt", () => {
  setTimeout(() => console.log("timeout"), 0);
  setImmediate(() => console.log("immediate"));
});`
    }],
    entryFile: "immediate.mjs",
    answer: {
      prompt: "在 I/O 回调内部调度时，哪一个通常先打印？",
      options: [
        { id: "a", label: "immediate", detail: "I/O 后进入 check 阶段", feedback: "正确：在 I/O 回调里 setImmediate 通常先于 0ms timer。" },
        { id: "b", label: "timeout", detail: "把 0ms 当成立即", feedback: "0ms 是最短延迟，不代表抢在 check 阶段前。" },
        { id: "c", label: "两者同步同时打印", detail: "两个都是异步回调", feedback: "它们位于不同队列，不会同步同时执行。" }
      ],
      answerId: "a",
      correctExplanation: "I/O 回调完成后通常进入 check 阶段，因此 setImmediate 先执行。"
    },
    execution: {
      lanes: ["I/O 回调", "check 阶段", "timers 阶段"],
      frames: frames(["文件读取回调开始。", "setImmediate 进入 check。", "timer 稍后执行。"], ["readFile callback", "immediate", "timeout"], ["I/O callback", "immediate", "timeout"])
    },
    summary: ["setTimeout 和 setImmediate 位于不同阶段", "0ms timer 不是同步立即执行", "分析顺序时必须考虑当前调用上下文"],
    sources: [
      source("Understanding setImmediate()", "https://nodejs.org/en/learn/asynchronous-work/understanding-setimmediate"),
      source("Timers", "https://nodejs.org/api/timers.html")
    ]
  }),
  createLessonSpec({
    id: "events-emitter-abort",
    stageId: "async-events",
    eyebrow: "03.8 · 异步运行时与事件",
    title: "EventEmitter 与任务取消",
    objectives: ["使用 EventEmitter 表达事件", "用 AbortController 表达取消信号"],
    prerequisites: ["async-error-propagation"],
    concept: "EventEmitter 让对象可以发布和订阅事件。AbortController/AbortSignal 则用统一信号表达取消意图，适合终止异步任务、清理监听器和避免无效工作。",
    points: ["emitter.on 注册监听器", "emitter.emit 触发事件", "AbortSignal 表达取消状态"],
    memoryHook: "事件负责通知，Abort 负责刹车",
    files: [{
      name: "events-abort.mjs",
      code: `import { EventEmitter } from "node:events";

const bus = new EventEmitter();
const controller = new AbortController();

bus.on("job", (name) => {
  if (controller.signal.aborted) return;
  console.log("run", name);
});

controller.abort();
bus.emit("job", "sync-cache");`
    }],
    entryFile: "events-abort.mjs",
    answer: {
      prompt: "这段代码会打印 run sync-cache 吗？",
      options: [
        { id: "a", label: "不会打印", detail: "emit 前已经 abort", feedback: "正确：监听器被调用，但先检查 aborted 后直接返回。" },
        { id: "b", label: "会打印一次", detail: "忽略了取消检查", feedback: "controller.abort() 已经把 signal.aborted 设为 true。" },
        { id: "c", label: "会抛出未监听错误", detail: "job 有监听器", feedback: "bus.on 已经注册了 job 监听器。" }
      ],
      answerId: "a",
      correctExplanation: "取消信号在 emit 前已触发，监听器检查后不执行日志。"
    },
    execution: {
      lanes: ["注册监听器", "触发取消", "派发事件"],
      frames: frames(["bus.on 监听 job。", "controller.abort 设置 aborted。", "emit 后监听器提前返回。"], ["job listener", "aborted=true", "no log"], ["listener ready", "abort", "skip job"])
    },
    summary: ["EventEmitter 适合表达本地事件流", "取消信号要在异步任务入口检查", "事件通知和取消控制配合能减少无效工作"],
    sources: [
      source("The Node.js Event Emitter", "https://nodejs.org/en/learn/asynchronous-work/the-nodejs-event-emitter"),
      source("Events", "https://nodejs.org/api/events.html")
    ]
  }),
  createLessonSpec({
    id: "project-task-scheduler",
    stageId: "async-events",
    kind: "stage-project",
    difficulty: "进阶",
    durationMinutes: 26,
    eyebrow: "阶段项目 03 · 综合训练",
    title: "并发任务调度器",
    objectives: ["组合 Promise、async/await、事件和取消构建任务调度器", "限制并发并输出任务日志"],
    prerequisites: ["events-emitter-abort"],
    concept: "这个阶段项目把异步知识整合成一个小型调度器：任务进入队列，调度器按并发上限启动任务，任务完成时发出事件，取消信号触发后停止启动新任务。",
    points: ["队列保存待执行任务", "并发上限保护资源", "事件记录任务生命周期"],
    memoryHook: "队列控节奏，事件报进度，Abort 拉手刹",
    files: [{
      name: "task-scheduler.mjs",
      code: `import { EventEmitter } from "node:events";

const bus = new EventEmitter();
const controller = new AbortController();
const tasks = ["lint", "test", "build"];

bus.on("done", (name) => console.log("done:", name));

for (const task of tasks) {
  if (controller.signal.aborted) break;
  await Promise.resolve(task);
  bus.emit("done", task);
}`
    }],
    entryFile: "task-scheduler.mjs",
    steps: [
      {
        id: "step-1",
        title: "步骤 1：构建基础任务调度队列",
        context: "阶段项目将异步知识整合成一个小调度器：任务按顺序处理并在完成后触发事件。",
        files: [{
          name: "task-scheduler.mjs",
          code: `import { EventEmitter } from "node:events";\n\nconst bus = new EventEmitter();\nconst tasks = ["lint", "test", "build"];\n\nbus.on("done", (name) => console.log("done:", name));\n\nfor (const task of tasks) {\n  await Promise.resolve(task);\n  bus.emit("done", task);\n}`
        }],
        entryFile: "task-scheduler.mjs",
        question: {
          id: "project-task-scheduler-step1",
          type: "prediction",
          prompt: "这三个任务在代码中的执行方式是并发还是串行？",
          options: [
            { id: "a", label: "串行处理", detail: "使用 for...of 与 await", feedback: "正确：在 for 循环中 await 会阻塞下一次迭代，必须等待当前任务完成。" },
            { id: "b", label: "并发处理", detail: "Promise 是并行的", feedback: "如果用 Promise.all 才是并发，当前是循环里依次 await。" }
          ],
          answerId: "a",
          correctExplanation: "for...of 中的 await 会按顺序等待每个 Promise 决议。"
        }
      },
      {
        id: "step-2",
        title: "步骤 2：加入中止控制逻辑",
        context: "现在我们加入 AbortController 来实现手刹机制，以便能够在需要时阻止调度器启动新任务。",
        files: [{
          name: "task-scheduler.mjs",
          code: `import { EventEmitter } from "node:events";\n\nconst bus = new EventEmitter();\nconst controller = new AbortController();\nconst tasks = ["lint", "test", "build"];\n\nbus.on("done", (name) => console.log("done:", name));\n\nfor (const task of tasks) {\n  if (controller.signal.aborted) break;\n  await Promise.resolve(task);\n  bus.emit("done", task);\n}`
        }],
        entryFile: "task-scheduler.mjs",
        question: {
          id: "project-task-scheduler-step2",
          type: "transfer",
          prompt: "如果循环开始前已经 controller.abort()，会发生什么？",
          options: [
            { id: "a", label: "不会启动任何任务", detail: "循环第一步检查 aborted 后 break", feedback: "正确：取消信号阻止调度器启动新任务。" },
            { id: "b", label: "仍执行 lint/test/build", detail: "忽略取消检查", feedback: "循环体开头会检查 signal.aborted。" },
            { id: "c", label: "只执行 build", detail: "队列不会倒序", feedback: "for...of 从 lint 开始，不会跳到最后一项。" }
          ],
          answerId: "a",
          correctExplanation: "取消信号在循环前触发时，第一轮检查就会 break。"
        }
      }
    ],
    execution: {
      lanes: ["任务队列", "Promise 执行", "事件日志"],
      frames: frames(["取出 lint。", "await Promise.resolve。", "emit done。"], ["lint/test/build", "lint done", "done: lint"], ["queue ready", "run lint", "done: lint"])
    },
    summary: ["阶段项目综合 Promise、await、事件和取消", "并发调度的核心是队列状态和启动条件", "取消逻辑应阻止新任务，并让已启动任务可控收尾"],
    sources: [
      source("Asynchronous flow control", "https://nodejs.org/en/learn/asynchronous-work/asynchronous-flow-control"),
      source("Events", "https://nodejs.org/api/events.html")
    ]
  })
];

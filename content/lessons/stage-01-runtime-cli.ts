import type { LessonSpec, RunnerFrame } from "../../lib/curriculum/types";
import { createLessonSpec } from "./lesson-factory";

const source = (title: string, url: string) => ({ title, url });

const frames = (
  lanes: [string, string, string],
  first: string,
  second: string,
  third: string,
  log: string[]
): RunnerFrame[] => [
  {
    activeLane: 0,
    laneValues: [first, "等待", "等待"],
    log: log.slice(0, 1),
    note: lanes[0],
    delayMs: 300
  },
  {
    activeLane: 1,
    laneValues: ["完成", second, "等待"],
    log: log.slice(0, 2),
    note: lanes[1],
    delayMs: 720
  },
  {
    activeLane: 2,
    laneValues: ["完成", "完成", third],
    log,
    note: lanes[2],
    delayMs: 720
  }
];

export const stageOneRuntimeCliLessons: LessonSpec[] = [
  createLessonSpec({
    id: "runtime-introduction",
    stageId: "runtime-cli",
    eyebrow: "01.1 · 运行时与命令行",
    title: "Node.js 运行时到底提供了什么？",
    objectives: ["说清 Node.js 如何让 JavaScript 离开浏览器运行", "区分 V8、内置库和宿主能力"],
    prerequisites: [],
    concept: "Node.js 是 JavaScript 运行时：V8 负责执行语言本身，Node 额外提供文件、网络、进程、定时器等宿主能力。学习 Node 时，要同时看懂 JavaScript 语法和 Node 提供的运行环境。",
    points: ["V8 执行 JavaScript", "Node 内置模块提供系统能力", "脚本从入口文件开始运行"],
    memoryHook: "V8 是发动机，Node 是带工具箱的车身",
    files: [{
      name: "hello-runtime.mjs",
      code: `import { platform } from "node:os";

console.log("JavaScript engine:", process.versions.v8);
console.log("Node version:", process.version);
console.log("Running on:", platform());`
    }],
    entryFile: "hello-runtime.mjs",
    answer: {
      prompt: "这段脚本最能证明 Node.js 相比纯语言运行多提供了什么？",
      options: [
        { id: "a", label: "能访问进程和操作系统信息", detail: "process 与 node:os 来自 Node 运行时", feedback: "正确：这些能力不是 ECMAScript 语法本身，而是 Node 宿主环境提供的。" },
        { id: "b", label: "会把 JS 编译成 HTML", detail: "Node 不负责生成页面结构", feedback: "Node 可以生成字符串或服务端响应，但它不会自动把 JS 编译成 HTML。" },
        { id: "c", label: "必须依赖浏览器 DOM", detail: "脚本没有 window/document", feedback: "Node 的定位正相反：没有浏览器 DOM，也能在服务端或本地运行 JS。" }
      ],
      answerId: "a",
      correctExplanation: "process 和 node:os 展示了 Node 作为运行时提供的系统边界。"
    },
    execution: {
      lanes: ["读取入口文件", "查询运行时对象", "打印宿主信息"],
      frames: frames(["加载 hello-runtime.mjs。", "读取 process.versions 和 os.platform。", "终端展示运行环境。"], "入口文件", "process / os", "3 行日志", ["JavaScript engine: 13.x", "Node version: v24.x", "Running on: darwin"])
    },
    summary: ["Node.js 不是一门新语言，而是 JavaScript 的运行时", "V8 负责执行语言，Node 提供进程、文件、网络等能力", "入口脚本由 node 命令加载并按顺序执行"],
    sources: [source("Introduction to Node.js", "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs")]
  }),
  createLessonSpec({
    id: "runtime-browser-differences",
    stageId: "runtime-cli",
    eyebrow: "01.2 · 运行时与命令行",
    title: "Node.js 与浏览器的边界",
    objectives: ["判断代码依赖的是浏览器 API 还是 Node API", "理解 globalThis 在不同宿主中的差异"],
    prerequisites: ["runtime-introduction"],
    concept: "JavaScript 语言核心在 Node 和浏览器中相同，但宿主 API 不同。浏览器提供 document、window、DOM 事件；Node 提供 process、Buffer、内置模块和文件网络能力。",
    points: ["Node 没有 document", "Node 有 process", "通用代码应显式隔离宿主 API"],
    memoryHook: "语言相同，宿主不同",
    files: [{
      name: "host-check.mjs",
      code: `console.log("has document:", typeof document !== "undefined");
console.log("has process:", typeof process !== "undefined");
console.log("global name:", globalThis.constructor.name);`
    }],
    entryFile: "host-check.mjs",
    answer: {
      prompt: "在 Node.js 中执行这段脚本，前两行最可能是什么？",
      options: [
        { id: "a", label: "has document: true；has process: false", detail: "把 Node 当成浏览器", feedback: "document 是浏览器 DOM API，Node 默认没有。" },
        { id: "b", label: "has document: false；has process: true", detail: "区分宿主能力", feedback: "正确：process 是 Node 全局对象，document 默认不存在。" },
        { id: "c", label: "两者都是 true", detail: "混合了两个宿主", feedback: "除非额外模拟 DOM，否则 Node 不会同时具备 document。" }
      ],
      answerId: "b",
      correctExplanation: "Node 和浏览器共享语言核心，但全局宿主对象不同。"
    },
    execution: {
      lanes: ["检查 DOM", "检查进程", "确认全局对象"],
      frames: frames(["typeof document。", "typeof process。", "读取 globalThis。"], "document 缺席", "process 存在", "globalThis 可用", ["has document: false", "has process: true", "global name: Object"])
    },
    summary: ["不要在 Node 代码中默认使用 document/window", "process、Buffer、内置模块是 Node 常见能力", "跨端代码要把宿主 API 放在适配层中"],
    sources: [source("Differences between Node.js and the Browser", "https://nodejs.org/en/learn/getting-started/differences-between-nodejs-and-the-browser")]
  }),
  createLessonSpec({
    id: "runtime-v8",
    stageId: "runtime-cli",
    eyebrow: "01.3 · 运行时与命令行",
    title: "V8 如何影响一段 Node 脚本",
    objectives: ["认识 V8 与 JavaScript 执行的关系", "观察同步调用栈的执行顺序"],
    prerequisites: ["runtime-introduction"],
    concept: "Node 使用 V8 执行 JavaScript。同步函数调用会进入调用栈，返回值逐层弹出；异步能力虽然由 Node 和 libuv 协作，但纯计算和函数调用仍先由 V8 执行。",
    points: ["函数调用先进栈再返回", "同步计算会阻塞当前线程", "V8 版本随 Node 版本变化"],
    memoryHook: "调用像叠盘子：后进先出",
    files: [{
      name: "call-stack.mjs",
      code: `function double(value) {
  return value * 2;
}

function score(base) {
  return double(base + 1);
}

console.log("score:", score(4));`
    }],
    entryFile: "call-stack.mjs",
    answer: {
      prompt: "执行 `score(4)` 时，哪个说法正确？",
      options: [
        { id: "a", label: "先算 base + 1，再进入 double", detail: "同步表达式先求值", feedback: "正确：参数表达式先得到 5，再调用 double(5)。" },
        { id: "b", label: "double 会在 score 之前定义完成并立即执行", detail: "定义不等于调用", feedback: "函数声明会创建绑定，但不会在没有调用时执行函数体。" },
        { id: "c", label: "console.log 会先输出 score: 4", detail: "忽略了函数返回值", feedback: "console.log 等待 score(4) 返回后才打印。" }
      ],
      answerId: "a",
      correctExplanation: "同步调用按照表达式求值和调用栈顺序执行，最终输出 score: 10。"
    },
    execution: {
      lanes: ["score 栈帧", "double 栈帧", "Console"],
      frames: frames(["进入 score(4)。", "调用 double(5)。", "打印返回值。"], "base + 1 = 5", "return 10", "score: 10", ["enter score", "return double", "score: 10"])
    },
    summary: ["V8 执行 JavaScript 的同步语义", "函数声明不会自动执行", "同步计算完成后才进入后续日志输出"],
    sources: [source("The V8 JavaScript Engine", "https://nodejs.org/en/learn/getting-started/the-v8-javascript-engine")]
  }),
  createLessonSpec({
    id: "runtime-lts",
    stageId: "runtime-cli",
    eyebrow: "01.4 · 运行时与命令行",
    title: "为什么课程使用 LTS 版本",
    objectives: ["理解 LTS 对学习和生产环境的价值", "在脚本中读取 Node 版本"],
    prerequisites: ["runtime-introduction"],
    concept: "Node 版本会影响可用 API、V8 特性和安全修复节奏。学习路径使用 LTS 版本作为稳定基线，便于示例长期可运行，也便于团队统一本地和生产环境。",
    points: ["process.version 返回当前 Node 版本", "process.versions 暴露底层依赖版本", "LTS 更适合作为学习与生产基线"],
    memoryHook: "LTS 是课程的地基线",
    files: [{
      name: "version-check.mjs",
      code: `const major = Number(process.versions.node.split(".")[0]);

console.log("node:", process.version);
console.log("major:", major);
console.log("modern runtime:", major >= 20);`
    }],
    entryFile: "version-check.mjs",
    answer: {
      prompt: "如果当前是 Node v24.x，第三行会输出什么？",
      options: [
        { id: "a", label: "modern runtime: true", detail: "24 大于等于 20", feedback: "正确：脚本把主版本号转成数字后比较。" },
        { id: "b", label: "modern runtime: false", detail: "把版本号当字符串误判", feedback: "代码使用 Number 转换，比较的是数字。" },
        { id: "c", label: "脚本无法读取 Node 版本", detail: "忽略 process.versions", feedback: "process.versions.node 正是 Node 提供的版本信息。" }
      ],
      answerId: "a",
      correctExplanation: "v24.x 的主版本号是 24，满足 major >= 20。"
    },
    execution: {
      lanes: ["读取版本", "解析主版本", "判断基线"],
      frames: frames(["process.versions.node。", "split 后转数字。", "比较 major >= 20。"], "24.13.0", "24", "true", ["node: v24.13.0", "major: 24", "modern runtime: true"])
    },
    summary: ["版本会影响 API 和语法可用性", "LTS 适合作为团队统一基线", "process.versions 可以帮助诊断运行环境"],
    sources: [source("Node.js previous releases", "https://nodejs.org/en/about/previous-releases")]
  }),
  createLessonSpec({
    id: "cli-run-scripts",
    stageId: "runtime-cli",
    eyebrow: "01.5 · 运行时与命令行",
    title: "从命令行运行 Node 脚本",
    objectives: ["理解 node 命令如何执行入口文件", "区分 shell 参数和脚本内部逻辑"],
    prerequisites: ["runtime-lts"],
    concept: "`node file.mjs` 会把指定文件作为入口模块加载。入口文件中的顶层语句按顺序执行，日志写入标准输出；脚本退出码由进程是否正常结束决定。",
    points: ["node 后面跟入口文件", "顶层代码立即执行", "console.log 输出到 stdout"],
    memoryHook: "node 命令点亮入口文件",
    files: [{
      name: "greet.mjs",
      code: `const name = "NodePath";

console.log("start");
console.log("hello", name);
console.log("done");`
    }],
    entryFile: "greet.mjs",
    answer: {
      prompt: "执行 `node greet.mjs` 时日志顺序是什么？",
      options: [
        { id: "a", label: "start → hello NodePath → done", detail: "顶层语句顺序执行", feedback: "正确：没有异步代码，三行按源码顺序输出。" },
        { id: "b", label: "done → hello NodePath → start", detail: "倒序执行", feedback: "Node 不会倒序执行顶层语句。" },
        { id: "c", label: "只输出 hello NodePath", detail: "忽略前后日志", feedback: "三个 console.log 都会执行。" }
      ],
      answerId: "a",
      correctExplanation: "脚本顶层语句同步执行，日志顺序等于源码顺序。"
    },
    execution: {
      lanes: ["加载文件", "执行语句", "stdout"],
      frames: frames(["node 找到 greet.mjs。", "依次运行三条日志。", "终端接收输出。"], "入口加载", "3 个 console.log", "三行输出", ["start", "hello NodePath", "done"])
    },
    summary: ["node 命令接收入口文件路径", "无异步时源码顺序就是输出顺序", "console.log 默认写入标准输出"],
    sources: [source("Run Node.js scripts from the command line", "https://nodejs.org/en/learn/command-line/run-nodejs-scripts-from-the-command-line")]
  }),
  createLessonSpec({
    id: "cli-repl",
    stageId: "runtime-cli",
    eyebrow: "01.6 · 运行时与命令行",
    title: "用 REPL 快速验证想法",
    objectives: ["理解 REPL 的 Read-Eval-Print-Loop 流程", "知道 REPL 适合探索表达式而非承载项目结构"],
    prerequisites: ["cli-run-scripts"],
    concept: "REPL 会读取一行输入、求值、打印结果，然后继续等待下一行。它适合快速试验 API、表达式和对象形态；稳定逻辑仍应写入脚本并用版本控制保存。",
    points: ["Read：读取输入", "Eval：执行表达式", "Print：显示结果并循环"],
    memoryHook: "REPL 是会回话的草稿纸",
    files: [{
      name: "repl-session.txt",
      code: `> const total = [2, 3, 5].reduce((sum, item) => sum + item, 0)
undefined
> total
10
> process.version
'v24.13.0'`
    }],
    entryFile: "repl-session.txt",
    answer: {
      prompt: "为什么第一行定义变量后 REPL 打印 undefined？",
      options: [
        { id: "a", label: "const 声明本身没有表达式结果", detail: "变量已创建，但声明不返回 total", feedback: "正确：下一行输入 total 才会打印变量值。" },
        { id: "b", label: "reduce 没有执行", detail: "误解了声明行为", feedback: "reduce 已经执行并把结果绑定给 total。" },
        { id: "c", label: "REPL 不能保存变量", detail: "忽略了会话上下文", feedback: "同一 REPL 会话中后续可以读取 total。" }
      ],
      answerId: "a",
      correctExplanation: "REPL 打印每次输入的求值结果，变量声明的显示结果是 undefined，但绑定仍然存在。"
    },
    execution: {
      lanes: ["Read", "Eval", "Print"],
      frames: frames(["读取 const 声明。", "执行 reduce 并绑定 total。", "打印声明结果。"], "输入一行", "total = 10", "undefined / 10", ["undefined", "10", "'v24.13.0'"])
    },
    summary: ["REPL 按 Read-Eval-Print-Loop 工作", "声明变量和读取变量的打印结果不同", "REPL 适合探索，项目逻辑应沉淀到文件"],
    sources: [source("How to use the Node.js REPL", "https://nodejs.org/en/learn/command-line/how-to-use-the-nodejs-repl")]
  }),
  createLessonSpec({
    id: "cli-process-arguments",
    stageId: "runtime-cli",
    eyebrow: "01.7 · 运行时与命令行",
    title: "读取命令行参数",
    objectives: ["理解 process.argv 的结构", "从用户参数中提取业务输入"],
    prerequisites: ["cli-run-scripts"],
    concept: "`process.argv` 是数组：前两项通常是 Node 可执行文件路径和脚本路径，从第三项开始才是用户传入给脚本的参数。CLI 程序通常先切掉前两项再解析。",
    points: ["argv[0] 是 node 路径", "argv[1] 是入口脚本路径", "argv.slice(2) 是用户参数"],
    memoryHook: "前两格是运行器和入口，第三格开始才是用户的话",
    files: [{
      name: "args.mjs",
      code: `const [command = "help", target = "."] = process.argv.slice(2);

console.log("command:", command);
console.log("target:", target);`
    }],
    entryFile: "args.mjs",
    answer: {
      prompt: "执行 `node args.mjs scan ./src` 时，输出是什么？",
      options: [
        { id: "a", label: "command: scan；target: ./src", detail: "切掉前两项后解析", feedback: "正确：slice(2) 后得到 scan 和 ./src。" },
        { id: "b", label: "command: node；target: args.mjs", detail: "没有切掉运行器信息", feedback: "代码显式使用 slice(2)，不会把前两项当业务参数。" },
        { id: "c", label: "command: help；target: .", detail: "只有没传参数才使用默认值", feedback: "默认值只在对应参数缺失时使用。" }
      ],
      answerId: "a",
      correctExplanation: "用户参数从 process.argv 的第三项开始。"
    },
    additionalQuestions: [{
      id: "cli-process-arguments-implementation",
      type: "implementation",
      prompt: "如果我们要实现一个简单的 `node build.mjs --watch`，且在有 `--watch` 参数时开启监听模式，你会如何实现？",
      options: [
        {
          id: "a",
          label: "使用 includes 检查 process.argv",
          detail: "最简单直接的检查方式",
          feedback: "正确：process.argv.includes('--watch') 能有效地检测是否传入了该标志参数。",
          language: "js",
          diffLines: [1, 2],
          code: `const watchMode = process.argv.includes("--watch");
if (watchMode) {
  console.log("Starting in watch mode...");
}`
        },
        {
          id: "b",
          label: "只检查 process.argv[2]",
          detail: "硬编码参数位置",
          feedback: "这样只能检测当 --watch 是第一个参数的情况，如果有其他参数就会失效。",
          language: "js",
          diffLines: [1],
          code: `const watchMode = process.argv[2] === "--watch";
if (watchMode) {
  console.log("Starting in watch mode...");
}`
        },
        {
          id: "c",
          label: "从 process.env 中读取",
          detail: "混淆了环境变量和命令行参数",
          feedback: "环境变量是 process.env，而 --watch 是通过命令行参数 process.argv 传递的。",
          language: "js",
          diffLines: [1],
          code: `const watchMode = process.env.watch === "true";
if (watchMode) {
  console.log("Starting in watch mode...");
}`
        }
      ],
      answerId: "a",
      correctExplanation: "命令行参数被保存在 process.argv 数组中，使用 includes 方法可以安全地检查该数组中是否包含特定参数，无需关心它的具体位置。",
      difficulty: "beginner",
      estimatedSeconds: 60,
    }],
    execution: {
      lanes: ["原始 argv", "slice(2)", "业务参数"],
      frames: frames(["argv 含 node 和脚本路径。", "切出用户输入。", "解构 command/target。"], "4 项", "scan ./src", "command + target", ["command: scan", "target: ./src"])
    },
    summary: ["process.argv 保存命令行参数", "前两项不是业务参数", "CLI 参数应先解析再参与逻辑"],
    sources: [source("Process", "https://nodejs.org/api/process.html#processargv")]
  }),
  createLessonSpec({
    id: "cli-env-console",
    stageId: "runtime-cli",
    eyebrow: "01.8 · 运行时与命令行",
    title: "环境变量与终端输出",
    objectives: ["用 process.env 读取配置", "用 console 输出面向人的运行结果"],
    prerequisites: ["cli-process-arguments"],
    concept: "环境变量常用于配置运行模式、密钥位置和开关。Node 通过 `process.env` 暴露环境；终端反馈可以用 `console.log`、`console.warn`、`console.error` 区分普通信息、警告和错误。",
    points: ["process.env 的值通常是字符串", "缺失配置要给默认值或报错", "console 方法表达不同严重程度"],
    memoryHook: "env 管配置，console 管反馈",
    files: [{
      name: "env-console.mjs",
      code: `const mode = process.env.NODE_ENV ?? "development";
const verbose = process.env.VERBOSE === "1";

console.log("mode:", mode);
if (verbose) console.warn("verbose logging enabled");`
    }],
    entryFile: "env-console.mjs",
    answer: {
      prompt: "没有设置任何环境变量时，脚本会输出什么？",
      options: [
        { id: "a", label: "mode: development", detail: "使用默认值，verbose 不输出", feedback: "正确：NODE_ENV 缺失时使用 development，VERBOSE 不是 1。" },
        { id: "b", label: "mode: production；verbose logging enabled", detail: "假设了生产环境", feedback: "代码没有默认 production，也没有启用 verbose。" },
        { id: "c", label: "脚本会因为 env 缺失崩溃", detail: "忽略了空值合并", feedback: "?? 提供了缺省值，所以不会崩溃。" }
      ],
      answerId: "a",
      correctExplanation: "process.env.NODE_ENV 为 undefined 时，空值合并运算符返回 development。"
    },
    execution: {
      lanes: ["读取 env", "应用默认值", "输出反馈"],
      frames: frames(["NODE_ENV 未设置。", "mode = development。", "打印普通日志。"], "undefined", "development", "mode 日志", ["mode: development"])
    },
    summary: ["环境变量适合承载运行配置", "process.env 值需要显式解析", "console 输出应服务于可读的运行反馈"],
    sources: [
      source("How to read environment variables from Node.js", "https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs"),
      source("Console", "https://nodejs.org/api/console.html")
    ]
  }),
  createLessonSpec({
    id: "project-cli-system-inspector",
    stageId: "runtime-cli",
    kind: "stage-project",
    difficulty: "进阶",
    durationMinutes: 22,
    eyebrow: "阶段项目 01 · 综合训练",
    title: "CLI 系统信息探测器",
    objectives: ["组合 process、os、argv 和 console 构建小型 CLI", "根据参数决定输出详细程度"],
    prerequisites: ["cli-env-console"],
    concept: "这个项目把阶段 01 的知识串起来：入口脚本从命令行启动，读取用户参数和环境变量，再用 Node 内置模块查询系统信息，最后把面向人的报告输出到终端。",
    points: ["CLI 入口负责解析参数", "系统信息来自 Node 内置模块", "输出格式要稳定可读"],
    memoryHook: "入口 → 参数 → 探测 → 报告",
    files: [{
      name: "system-inspector.mjs",
      code: `import { cpus, freemem, platform } from "node:os";

const args = new Set(process.argv.slice(2));
const compact = args.has("--compact");
const info = {
  node: process.version,
  platform: platform(),
  cpuCount: cpus().length,
  freeMemoryMB: Math.round(freemem() / 1024 / 1024)
};

if (compact) {
  console.log(info.platform + " · " + info.cpuCount + " CPU");
} else {
  console.table(info);
}`
    }],
    entryFile: "system-inspector.mjs",
    steps: [
      {
        id: "step-1",
        title: "步骤 1：解析参数",
        context: "我们需要读取用户传入的命令行参数并判断是否包含 --compact 模式。",
        files: [{
          name: "system-inspector.mjs",
          code: `const args = new Set(process.argv.slice(2));\n// ...`
        }],
        entryFile: "system-inspector.mjs",
        question: {
          id: "project-cli-system-inspector-step1",
          type: "prediction",
          prompt: "为什么参数切片使用 process.argv.slice(2)？",
          options: [
            { id: "a", label: "跳过 Node 路径和脚本路径", detail: "排除环境参数", feedback: "正确：前两项是 node 执行器和当前脚本绝对路径。" },
            { id: "b", label: "跳过无关环境变量", detail: "混淆 env", feedback: "环境变量在 process.env 中，argv 全是参数。" }
          ],
          answerId: "a",
          correctExplanation: "前两项固定是 Node 和脚本路径。"
        }
      },
      {
        id: "step-2",
        title: "步骤 2：生成系统报告",
        context: "接下来利用 os 模块读取系统信息，并根据 --compact 参数决定输出格式。",
        files: [{
          name: "system-inspector.mjs",
          code: `import { cpus, freemem, platform } from "node:os";\n\nconst args = new Set(process.argv.slice(2));\nconst compact = args.has("--compact");\nconst info = {\n  node: process.version,\n  platform: platform(),\n  cpuCount: cpus().length,\n  freeMemoryMB: Math.round(freemem() / 1024 / 1024)\n};\n\nif (compact) {\n  console.log(info.platform + " · " + info.cpuCount + " CPU");\n} else {\n  console.table(info);\n}`
        }],
        entryFile: "system-inspector.mjs",
        question: {
          id: "project-cli-system-inspector-step2",
          type: "transfer",
          prompt: "执行 node system-inspector.mjs --compact 时，程序会走哪条输出分支？",
          options: [
            { id: "a", label: "console.log 紧凑分支", detail: "Set 中包含 --compact", feedback: "正确：参数集合包含 --compact，所以输出单行摘要。" },
            { id: "b", label: "console.table 表格分支", detail: "只有没有 compact 才走表格", feedback: "传入 --compact 后条件为 true，不会走 else。" },
            { id: "c", label: "两个分支都会执行", detail: "忽略 if/else 互斥", feedback: "if/else 在一次运行中只会选择一个分支。" }
          ],
          answerId: "a",
          correctExplanation: "process.argv.slice(2) 中包含 --compact，Set.has 返回 true。"
        }
      }
    ],
    execution: {
      lanes: ["解析参数", "读取系统", "生成报告"],
      frames: frames(["Set 接收 --compact。", "os 模块读取平台和 CPU。", "console.log 输出摘要。"], "--compact ✓", "platform/cpus/freemem", "darwin · 10 CPU", ["args: --compact", "os snapshot ready", "darwin · 10 CPU"])
    },
    summary: ["阶段项目把入口、参数、环境与内置模块组合起来", "CLI 输出应根据用户参数选择合适格式", "项目仍是确定性示例，不执行学习者输入的任意代码"],
    sources: [
      source("Run Node.js scripts from the command line", "https://nodejs.org/en/learn/command-line/run-nodejs-scripts-from-the-command-line"),
      source("OS", "https://nodejs.org/api/os.html")
    ]
  })
];

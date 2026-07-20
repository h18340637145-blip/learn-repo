import type { LessonSpec, RunnerFrame } from "../../lib/curriculum/types";
import { createLessonSpec } from "./lesson-factory";

const source = (title: string, url: string) => ({ title, url });

const frames = (
  lanes: [string, string, string],
  values: [string, string, string],
  log: string[],
): RunnerFrame[] => [
  {
    activeLane: 0,
    laneValues: [values[0], "等待", "等待"],
    log: log.slice(0, 1),
    note: lanes[0],
    delayMs: 300,
  },
  {
    activeLane: 1,
    laneValues: ["完成", values[1], "等待"],
    log: log.slice(0, 2),
    note: lanes[1],
    delayMs: 720,
  },
  {
    activeLane: 2,
    laneValues: ["完成", "完成", values[2]],
    log,
    note: lanes[2],
    delayMs: 720,
  },
];

export const stageZeroFoundationsLessons: LessonSpec[] = [
  createLessonSpec({
    id: "foundations-node-javascript",
    stageId: "foundations",
    eyebrow: "00.1 · 基础训练营",
    title: "Node.js 与 JavaScript 的关系",
    objectives: ["区分 JavaScript 语言和 Node.js 运行时", "理解入口脚本由 node 命令执行"],
    prerequisites: [],
    concept: "JavaScript 是语言，Node.js 是运行这门语言的宿主环境。Node 使用 V8 执行语法本身，同时提供 process、文件系统、路径、网络等浏览器没有的能力。",
    points: ["语言语法来自 JavaScript", "Node 提供宿主 API", "脚本从入口文件顺序开始"],
    memoryHook: "JS 是语言，Node 是运行环境和工具箱",
    files: [{
      name: "hello-node.mjs",
      code: `console.log("language:", "JavaScript");
console.log("runtime:", "Node.js");
console.log("pid type:", typeof process.pid);`,
    }],
    entryFile: "hello-node.mjs",
    answer: {
      prompt: "这段代码最能说明什么？",
      options: [
        { id: "a", label: "Node.js 是一门完全不同的新语言", detail: "把运行时误认为语言", feedback: "Node.js 运行 JavaScript，不是替代 JavaScript 的新语言。" },
        { id: "b", label: "Node.js 运行 JavaScript，并提供 process 等能力", detail: "语言和宿主分开理解", feedback: "正确：字符串和 typeof 是语言能力，process 是 Node 宿主能力。" },
        { id: "c", label: "process 只能在浏览器里使用", detail: "混淆浏览器和 Node", feedback: "process 是 Node 常见全局对象，浏览器默认没有。" },
      ],
      answerId: "b",
      correctExplanation: "Node.js 负责运行 JavaScript，并暴露进程、文件、网络等宿主 API。",
    },
    execution: {
      lanes: ["加载入口脚本", "执行语言语句", "读取 Node 宿主对象"],
      frames: frames(["node hello-node.mjs 读取文件。", "console.log 按源码顺序执行。", "process.pid 来自 Node 运行时。"], ["入口文件", "2 行字符串", "pid 是 number"], ["language: JavaScript", "runtime: Node.js", "pid type: number"]),
    },
    summary: ["JavaScript 是语言，Node.js 是运行时", "Node 额外提供 process、文件、网络等宿主 API", "入口文件由 node 命令加载后按顺序执行"],
    sources: [
      source("Introduction to Node.js", "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs"),
      source("Run Node.js scripts from the command line", "https://nodejs.org/en/learn/command-line/run-nodejs-scripts-from-the-command-line"),
    ],
  }),
  createLessonSpec({
    id: "foundations-types-typeof",
    stageId: "foundations",
    eyebrow: "00.2 · 基础训练营",
    title: "变量、类型与 typeof",
    objectives: ["用 const/let 表达可变性", "用 typeof 观察运行时值类型"],
    prerequisites: ["foundations-node-javascript"],
    concept: "变量名只是指向运行时值的标签。const 表示绑定不能重新指向，let 可以重新赋值；typeof 会在运行时返回当前值的类型字符串。",
    points: ["const 保护绑定", "let 允许重新赋值", "typeof 观察当前值"],
    memoryHook: "变量是标签，typeof 看标签贴住的值",
    files: [{
      name: "types.mjs",
      code: `const name = "NodePath";
let count = 2;
count = count + 1;

console.log(typeof name);
console.log(count);`,
    }],
    entryFile: "types.mjs",
    answer: {
      prompt: "这段脚本的输出最可能是什么？",
      options: [
        { id: "a", label: "string 然后 3", detail: "按运行时值和重新赋值判断", feedback: "正确：name 的值是字符串，count 先是 2，再加 1 变成 3。" },
        { id: "b", label: "String 然后 2", detail: "把 typeof 当成构造器名", feedback: "typeof 返回小写字符串；let 变量重新赋值后会变成 3。" },
        { id: "c", label: "报错，因为 let 不能修改", detail: "混淆 const 和 let", feedback: "let 可以重新赋值；const 才不允许重新绑定。" },
      ],
      answerId: "a",
      correctExplanation: "typeof name 返回 string，count 经过重新赋值后输出 3。",
    },
    execution: {
      lanes: ["建立绑定", "更新 let 值", "打印结果"],
      frames: frames(["创建 name 和 count。", "count = count + 1 生成新数值。", "终端按顺序打印。"], ["name/string", "count=3", "2 行输出"], ["string", "3"]),
    },
    summary: ["const 和 let 描述变量绑定能否重新指向", "typeof 返回当前运行时值的类型字符串", "读输出顺序时先按源码同步执行"],
    sources: [source("JavaScript data types and data structures", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures")],
  }),
  createLessonSpec({
    id: "foundations-collections",
    stageId: "foundations",
    eyebrow: "00.3 · 基础训练营",
    title: "字符串、数组与对象",
    objectives: ["读取数组索引和对象属性", "理解字符串、数组、对象在脚本中的常见用途"],
    prerequisites: ["foundations-types-typeof"],
    concept: "字符串表达文本，数组按顺序保存一组值，对象用键值对描述结构化数据。Node 脚本经常把命令行参数、配置和统计结果组织成数组或对象。",
    points: ["数组索引从 0 开始", "对象属性用键读取", "结构化数据让输出更清晰"],
    memoryHook: "数组按位置，对象按名字",
    files: [{
      name: "collections.mjs",
      code: `const topics = ["runtime", "fs", "http"];
const report = { first: topics[0], total: topics.length };

console.log(report.first);
console.log(report.total);`,
    }],
    entryFile: "collections.mjs",
    answer: {
      prompt: "这段代码会输出什么？",
      options: [
        { id: "a", label: "fs 然后 3", detail: "把第一个索引当成 1", feedback: "数组第一个位置是索引 0，所以 topics[0] 是 runtime。" },
        { id: "b", label: "runtime 然后 3", detail: "按索引和 length 判断", feedback: "正确：topics[0] 是 runtime，数组长度是 3。" },
        { id: "c", label: "runtime 然后 2", detail: "把 length 当成最后索引", feedback: "length 是元素数量，不是最后一个索引；最后索引才是 2。" },
      ],
      answerId: "b",
      correctExplanation: "数组索引从 0 开始，对象属性保存读取后的结果。",
    },
    execution: {
      lanes: ["创建数组", "组装对象", "读取属性"],
      frames: frames(["topics 保存 3 个主题。", "report.first 取 topics[0]。", "输出对象里的两个字段。"], ["3 个元素", "first/total", "runtime/3"], ["runtime", "3"]),
    },
    summary: ["数组适合有顺序的一组值", "对象适合命名字段", "length 是元素数量，索引从 0 开始"],
    sources: [source("Indexed collections", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_collections")],
  }),
  createLessonSpec({
    id: "foundations-functions",
    stageId: "foundations",
    eyebrow: "00.4 · 基础训练营",
    title: "函数、参数与返回值",
    objectives: ["理解函数声明和调用的区别", "追踪参数进入函数并返回结果"],
    prerequisites: ["foundations-collections"],
    concept: "函数把一段逻辑命名起来。声明函数不会自动运行，只有调用时参数才进入函数体，return 会把结果交还给调用点。",
    points: ["声明不等于执行", "参数是函数入口", "return 是函数出口"],
    memoryHook: "调用才进栈，return 才带回结果",
    files: [{
      name: "functions.mjs",
      code: `function labelScore(name, score) {
  return name + ":" + score;
}

const line = labelScore("cli", 8);
console.log(line);`,
    }],
    entryFile: "functions.mjs",
    answer: {
      prompt: "为什么终端只打印一行？",
      options: [
        { id: "a", label: "函数声明本身会打印", detail: "混淆声明和调用", feedback: "函数声明只是定义可复用逻辑，不会自动打印。" },
        { id: "b", label: "只有 console.log 会输出", detail: "区分返回值和终端输出", feedback: "正确：函数 return 生成值，console.log 才把值写到终端。" },
        { id: "c", label: "return 会直接输出到终端", detail: "把 return 当日志", feedback: "return 只把值交回调用点，不会自己打印。" },
      ],
      answerId: "b",
      correctExplanation: "函数调用返回字符串，console.log 负责把字符串写入终端。",
    },
    additionalQuestions: [{
      id: "foundations-functions-implementation",
      type: "implementation",
      prompt: "把分数格式化成终端报告，哪段实现最稳妥？",
      options: [
        {
          id: "a",
          label: "返回模板字符串，再由调用点打印",
          detail: "函数只负责生成值，输出留给 console.log",
          feedback: "正确：函数职责清晰，return 把结果交回调用点，后续更容易复用和测试。",
          language: "js",
          diffLines: [2, 6],
          code: `function formatScore(name, score) {
  return \`\${name}: \${score} pts\`;
}

const report = formatScore("cli", 8);
console.log(report);`,
        },
        {
          id: "b",
          label: "在函数内部直接打印并隐式返回",
          detail: "调用点拿不到格式化后的字符串",
          feedback: "这样能看到日志，但 formatScore 的返回值是 undefined，后续无法组合更多逻辑。",
          language: "js",
          diffLines: [2, 5],
          code: `function formatScore(name, score) {
  console.log(name + ": " + score + " pts");
}

const report = formatScore("cli", 8);`,
        },
        {
          id: "c",
          label: "返回对象但直接拼接对象",
          detail: "输出会变成 [object Object]",
          feedback: "对象适合结构化传递，但如果目标是终端字符串，需要先明确格式化。",
          language: "js",
          diffLines: [2, 6],
          code: `function formatScore(name, score) {
  return { name, score };
}

const report = formatScore("cli", 8);
console.log("report: " + report);`,
        },
      ],
      answerId: "a",
      correctExplanation: "函数先 return 可复用的字符串，调用点再 console.log，是 Node CLI 中最容易测试和组合的写法。",
      difficulty: "基础",
      estimatedSeconds: 90,
    }],
    execution: {
      lanes: ["声明函数", "调用函数", "打印返回值"],
      frames: frames(["labelScore 被定义但未输出。", "参数 cli 和 8 进入函数。", "console.log 打印返回值。"], ["函数可用", "cli:8", "1 行日志"], ["cli:8"]),
    },
    summary: ["函数声明不会自动执行", "参数进入函数后参与计算", "return 返回值，console.log 才输出"],
    sources: [source("Functions", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions")],
  }),
  createLessonSpec({
    id: "foundations-branches-loops",
    stageId: "foundations",
    eyebrow: "00.5 · 基础训练营",
    title: "条件判断与循环",
    objectives: ["用 if 选择执行路径", "用 for...of 遍历数组"],
    prerequisites: ["foundations-functions"],
    concept: "条件判断决定代码走哪条路径，循环让同一段逻辑处理一组数据。Node CLI 工具常用它们筛选参数、统计文件和生成报告。",
    points: ["if 只执行命中的分支", "for...of 逐项读取数组值", "累计变量记录结果"],
    memoryHook: "分支选路，循环绕圈",
    files: [{
      name: "branches-loops.mjs",
      code: `const sizes = [4, 12, 8];
let large = 0;

for (const size of sizes) {
  if (size >= 8) large = large + 1;
}

console.log("large:", large);`,
    }],
    entryFile: "branches-loops.mjs",
    answer: {
      prompt: "large 最终是多少？",
      options: [
        { id: "a", label: "1", detail: "漏掉等于 8 的情况", feedback: "条件是 >= 8，12 和 8 都会命中。" },
        { id: "b", label: "2", detail: "逐项遍历并累计", feedback: "正确：4 不命中，12 和 8 命中，累计 2 次。" },
        { id: "c", label: "3", detail: "把所有元素都计入", feedback: "只有满足 size >= 8 的元素才会增加 large。" },
      ],
      answerId: "b",
      correctExplanation: "循环遍历 3 个值，只有 12 和 8 满足条件。",
    },
    execution: {
      lanes: ["遍历数组", "判断条件", "累计输出"],
      frames: frames(["for...of 取出每个 size。", ">= 8 的路径亮起。", "large 累计到 2。"], ["4/12/8", "命中 2 次", "large: 2"], ["large: 2"]),
    },
    summary: ["条件判断只执行命中的分支", "循环适合处理一组值", "累计变量要先初始化再更新"],
    sources: [source("Loops and iteration", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration")],
  }),
  createLessonSpec({
    id: "foundations-try-catch",
    stageId: "foundations",
    eyebrow: "00.6 · 基础训练营",
    title: "错误处理 try/catch",
    objectives: ["理解 throw 与 catch 的控制流", "把异常转成可读日志"],
    prerequisites: ["foundations-branches-loops"],
    concept: "throw 会中断当前正常路径，控制权跳到最近的 catch。Node 脚本应把预期内的错误转成清晰日志，而不是让学习者只看到堆栈。",
    points: ["throw 切换到错误路径", "catch 接住异常对象", "错误日志应解释下一步"],
    memoryHook: "throw 抛出，catch 接住",
    files: [{
      name: "try-catch.mjs",
      code: `function readMode(value) {
  if (!value) throw new Error("missing mode");
  return value.toUpperCase();
}

try {
  console.log(readMode(""));
} catch (error) {
  console.log("配置错误:", error.message);
}`,
    }],
    entryFile: "try-catch.mjs",
    answer: {
      prompt: "终端会打印什么？",
      options: [
        { id: "a", label: "配置错误: missing mode", detail: "异常被 catch 转成日志", feedback: "正确：空字符串触发 throw，catch 打印 error.message。" },
        { id: "b", label: "MISSING MODE", detail: "忽略了 throw", feedback: "return 不会执行，因为 throw 已经切换到 catch 路径。" },
        { id: "c", label: "没有任何输出", detail: "忽略 catch 中的 console.log", feedback: "catch 块里仍然执行了 console.log。" },
      ],
      answerId: "a",
      correctExplanation: "readMode 抛出 Error，catch 接住后输出可读错误消息。",
    },
    execution: {
      lanes: ["调用函数", "抛出异常", "catch 输出"],
      frames: frames(["readMode 收到空字符串。", "throw Error 中断正常路径。", "catch 打印错误消息。"], ["value 为空", "missing mode", "可读日志"], ["配置错误: missing mode"]),
    },
    summary: ["throw 会中断当前正常执行路径", "catch 能读取 error.message", "CLI 错误应尽量转成清晰的人类可读日志"],
    sources: [source("Errors", "https://nodejs.org/api/errors.html")],
  }),
  createLessonSpec({
    id: "foundations-console-debug",
    stageId: "foundations",
    eyebrow: "00.7 · 基础训练营",
    title: "console 与调试输出",
    objectives: ["区分普通输出和错误输出", "用 console.table 展示结构化数据"],
    prerequisites: ["foundations-try-catch"],
    concept: "console 是最基础的运行反馈工具。console.log 常用于标准输出，console.error 常用于错误输出，console.table 能把对象数组展示成更容易阅读的表格。",
    points: ["log 面向普通结果", "error 面向错误信息", "table 适合结构化列表"],
    memoryHook: "log 给结果，error 给问题，table 给结构",
    files: [{
      name: "console-debug.mjs",
      code: `const files = [
  { name: "app.mjs", lines: 18 },
  { name: "README.md", lines: 6 }
];

console.log("files:", files.length);
console.table(files);`,
    }],
    entryFile: "console-debug.mjs",
    answer: {
      prompt: "这段代码为什么比只打印对象字符串更适合学习者阅读？",
      options: [
        { id: "a", label: "console.table 会把结构化数组按表格展示", detail: "让字段和行更直观", feedback: "正确：对象数组适合用 table 展示字段。" },
        { id: "b", label: "console.log 不会输出任何内容", detail: "误解 log", feedback: "console.log 会输出普通文本；这里还会输出 files: 2。" },
        { id: "c", label: "console.table 会修改原数组", detail: "把展示和数据变更混淆", feedback: "console.table 只是展示，不会改变 files 数组。" },
      ],
      answerId: "a",
      correctExplanation: "console.table 对结构化列表更友好，有助于观察字段和值。",
    },
    execution: {
      lanes: ["准备数据", "打印数量", "展示表格"],
      frames: frames(["files 是对象数组。", "先输出文件数量。", "再以表格方式展示字段。"], ["2 条记录", "files: 2", "name/lines 表格"], ["files: 2", "(index) name lines", "0 app.mjs 18"]),
    },
    summary: ["console.log 适合普通运行反馈", "console.error 适合错误通道", "console.table 能让对象数组更可读"],
    sources: [source("Console", "https://nodejs.org/api/console.html")],
  }),
  createLessonSpec({
    id: "foundations-process-files",
    stageId: "foundations",
    eyebrow: "00.8 · 基础训练营",
    title: "process、路径与文件读取入门",
    objectives: ["读取命令行参数", "用 path.resolve 形成明确文件路径", "用 fs/promises 读取文本"],
    prerequisites: ["foundations-console-debug"],
    concept: "Node CLI 工具通常从 process.argv 接收参数，用 path 处理路径，再用 fs/promises 读取文件。路径和文件读取是很多 Node 项目的第一道真实边界。",
    points: ["process.argv 保存命令行参数", "path.resolve 生成绝对路径", "readFile 返回文本内容"],
    memoryHook: "参数给路径，路径找文件，文件变文本",
    files: [{
      name: "read-file.mjs",
      code: `import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const input = process.argv[2] ?? "README.md";
const filePath = resolve(input);
const text = await readFile(filePath, "utf8");

console.log("chars:", text.length);`,
    }],
    entryFile: "read-file.mjs",
    answer: {
      prompt: "如果命令没有传第三个参数，脚本会优先读取哪个文件？",
      options: [
        { id: "a", label: "README.md", detail: "空值合并使用默认路径", feedback: "正确：process.argv[2] 缺失时，?? 会选择 README.md。" },
        { id: "b", label: "node", detail: "把 argv[0] 当业务参数", feedback: "argv[0] 通常是 node 路径，不是这里读取的业务参数。" },
        { id: "c", label: "read-file.mjs", detail: "把入口文件当输入文件", feedback: "入口文件路径通常在 argv[1]，业务参数从 argv[2] 开始。" },
      ],
      answerId: "a",
      correctExplanation: "process.argv[2] 是第一个业务参数，缺失时使用 README.md。",
    },
    execution: {
      lanes: ["解析参数", "定位文件", "读取输出"],
      frames: frames(["argv[2] 缺失，使用默认值。", "resolve 生成绝对路径。", "readFile 读取文本并输出长度。"], ["README.md", "绝对路径", "chars"], ["chars: 1280"]),
    },
    summary: ["CLI 的业务参数通常从 process.argv[2] 开始", "path.resolve 能让路径边界更明确", "fs/promises.readFile 适合读取小文本文件"],
    sources: [
      source("process.argv", "https://nodejs.org/api/process.html#processargv"),
      source("Reading files with Node.js", "https://nodejs.org/en/learn/manipulating-files/reading-files-with-nodejs"),
    ],
  }),
  createLessonSpec({
    id: "project-cli-file-inspector",
    stageId: "foundations",
    kind: "stage-project",
    eyebrow: "阶段项目 00 · 基础训练营",
    title: "命令行文件统计器",
    durationMinutes: 16,
    difficulty: "基础",
    objectives: ["组合参数、路径、文件读取、函数和条件判断", "输出一个可读的文件统计报告"],
    prerequisites: ["foundations-process-files"],
    concept: "这个小项目把基础训练营的语法和 Node 边界串起来：从命令行参数拿到文件名，读取文本，调用函数统计行数和字符数，再把结果打印成报告。",
    points: ["参数决定读取目标", "函数封装统计逻辑", "错误分支给出可读提示"],
    memoryHook: "参数进来，文件读出，函数统计，终端报告",
    files: [{
      name: "file-inspector.mjs",
      code: `import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

function summarize(text) {
  const lines = text.split("\\n").length;
  return { chars: text.length, lines };
}

const input = process.argv[2] ?? "README.md";

try {
  const text = await readFile(resolve(input), "utf8");
  const report = summarize(text);
  console.log("file:", input);
  console.log("lines:", report.lines);
  console.log("chars:", report.chars);
} catch (error) {
  console.error("无法读取文件:", error.message);
}`,
    }],
    entryFile: "file-inspector.mjs",
    answer: {
      type: "transfer",
      prompt: "这个项目里 summarize 函数最重要的职责是什么？",
      options: [
        { id: "a", label: "负责解析命令行参数", detail: "参数在函数外处理", feedback: "input 来自 process.argv，summarize 不应该关心参数来源。" },
        { id: "b", label: "把文本转换成统计对象", detail: "封装纯统计逻辑", feedback: "正确：summarize 接收文本，返回 chars 和 lines，职责清晰。" },
        { id: "c", label: "负责捕获文件读取错误", detail: "错误在 try/catch 处理", feedback: "读取错误由外层 try/catch 处理，summarize 只做统计。" },
      ],
      answerId: "b",
      correctExplanation: "阶段项目把 I/O 边界和纯函数统计分开，summarize 只负责文本统计。",
    },
    execution: {
      lanes: ["读取输入", "统计文本", "输出报告"],
      frames: frames(["process.argv 决定文件名。", "summarize 计算行数和字符数。", "终端展示统计报告。"], ["README.md", "{ lines, chars }", "3 行报告"], ["file: README.md", "lines: 42", "chars: 1280"]),
    },
    summary: ["阶段项目组合了参数、路径、文件读取、函数和错误处理", "I/O 边界和纯统计函数分开能降低理解成本", "CLI 工具要把成功报告和错误提示都设计清楚"],
    sources: [
      source("Run Node.js scripts from the command line", "https://nodejs.org/en/learn/command-line/run-nodejs-scripts-from-the-command-line"),
      source("Reading files with Node.js", "https://nodejs.org/en/learn/manipulating-files/reading-files-with-nodejs"),
    ],
  }),
];

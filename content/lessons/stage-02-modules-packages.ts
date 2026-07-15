import type { LessonSpec, RunnerFrame } from "../../lib/curriculum/types";
import { createLessonSpec } from "./lesson-factory";

const source = (title: string, url: string) => ({ title, url });

const frames = (notes: [string, string, string], values: [string, string, string], log: string[]): RunnerFrame[] => [
  { activeLane: 0, laneValues: [values[0], "等待", "等待"], log: log.slice(0, 1), note: notes[0], delayMs: 300 },
  { activeLane: 1, laneValues: ["完成", values[1], "等待"], log: log.slice(0, 2), note: notes[1], delayMs: 720 },
  { activeLane: 2, laneValues: ["完成", "完成", values[2]], log, note: notes[2], delayMs: 720 }
];

export const stageTwoModulesPackagesLessons: LessonSpec[] = [
  createLessonSpec({
    id: "modules-esm",
    stageId: "modules-packages",
    eyebrow: "02.1 · 模块、包与 TypeScript",
    title: "用 ESM 导入导出代码",
    objectives: ["使用 export 暴露函数", "使用 import 读取模块绑定"],
    prerequisites: ["cli-run-scripts"],
    concept: "ESM 是 Node.js 支持的标准模块系统。导出模块声明公开的绑定，导入模块以静态方式引用这些绑定；依赖关系在模块执行前就能被分析。",
    points: ["export 暴露命名绑定", "import 读取绑定", "ESM 默认是严格模式"],
    memoryHook: "export 开门，import 进门",
    files: [{
      name: "app.mjs",
      code: `// math.mjs
export const taxRate = 0.08;
export function total(price) {
  return price + price * taxRate;
}

// app.mjs
import { total } from "./math.mjs";
console.log(total(100));`
    }],
    entryFile: "app.mjs",
    answer: {
      prompt: "运行 app.mjs 后会打印什么？",
      options: [
        { id: "a", label: "108", detail: "导入 total 后计算税后总价", feedback: "正确：total(100) 返回 100 + 8。" },
        { id: "b", label: "100", detail: "忽略导入模块中的税率", feedback: "total 函数会读取同模块中的 taxRate。" },
        { id: "c", label: "ReferenceError", detail: "误以为 import 不可用", feedback: ".mjs 文件在 Node 中按 ESM 处理，可以使用 import。" }
      ],
      answerId: "a",
      correctExplanation: "命名导入 total 指向 math.mjs 导出的函数，计算结果为 108。"
    },
    execution: {
      lanes: ["解析依赖", "执行 math.mjs", "执行 app.mjs"],
      frames: frames(["先发现 app 依赖 math。", "初始化导出的 taxRate 和 total。", "app 调用 total 并打印。"], ["import ./math.mjs", "taxRate=0.08", "108"], ["load math.mjs", "bind total", "108"])
    },
    summary: ["ESM 使用 import/export 表达模块边界", ".mjs 会被 Node 作为 ESM 加载", "命名导入必须匹配导出的绑定名"],
    sources: [source("ECMAScript modules", "https://nodejs.org/api/esm.html")]
  }),
  createLessonSpec({
    id: "modules-resolution",
    stageId: "modules-packages",
    eyebrow: "02.2 · 模块、包与 TypeScript",
    title: "模块解析：Node 去哪里找文件？",
    objectives: ["理解相对路径导入", "知道扩展名和 package 边界会影响解析"],
    prerequisites: ["modules-esm"],
    concept: "模块解析是把导入说明符转换成真实模块文件的过程。相对路径从当前文件位置出发；包名会进入 package 解析；内置模块直接由 Node 提供。",
    points: ["./ 开头表示相对路径", "ESM 相对导入通常写完整扩展名", "包名和内置模块走不同解析路径"],
    memoryHook: "说明符是地址，解析器负责导航",
    files: [{
      name: "app.mjs",
      code: `// lib/format.mjs
export function label(name) {
  return "[" + name.toUpperCase() + "]";
}

// app.mjs
import { label } from "./lib/format.mjs";
console.log(label("node"));`
    }],
    entryFile: "app.mjs",
    answer: {
      prompt: "`./lib/format.mjs` 会从哪里开始解析？",
      options: [
        { id: "a", label: "从 app.mjs 所在目录", detail: "相对导入以当前模块为基准", feedback: "正确：相对路径不是从进程工作目录随意猜测，而是相对当前模块。" },
        { id: "b", label: "从 node_modules", detail: "这是包名解析路径", feedback: "包名才会走 node_modules 查找，相对路径不会。" },
        { id: "c", label: "从操作系统根目录", detail: "误把 ./ 当成绝对路径", feedback: "./ 明确表示当前模块目录下的相对路径。" }
      ],
      answerId: "a",
      correctExplanation: "相对说明符以发起导入的模块位置为基准解析。"
    },
    execution: {
      lanes: ["读取说明符", "解析文件 URL", "执行导出函数"],
      frames: frames(["发现 ./lib/format.mjs。", "定位到 lib/format.mjs。", "调用 label。"], ["./lib/format.mjs", "lib/format.mjs ✓", "[NODE]"], ["resolve relative", "load format", "[NODE]"])
    },
    summary: ["相对导入应写清路径和扩展名", "包名和相对路径的解析规则不同", "理解解析路径有助于定位 Cannot find module"],
    sources: [source("ESM resolution algorithm", "https://nodejs.org/api/esm.html#resolution-algorithm")]
  }),
  createLessonSpec({
    id: "modules-package-type",
    stageId: "modules-packages",
    eyebrow: "02.3 · 模块、包与 TypeScript",
    title: "package.json 的 type 字段",
    objectives: ["解释 type 如何影响 .js 文件模块格式", "避免 CommonJS 与 ESM 混用误判"],
    prerequisites: ["modules-resolution"],
    concept: "`package.json` 的 `type` 字段决定同一包内 `.js` 文件默认按 ESM 还是 CommonJS 解释。`type: module` 下 `.js` 可以使用 import/export；需要 CommonJS 时可使用 `.cjs`。",
    points: ["type: module 让 .js 成为 ESM", "type: commonjs 让 .js 成为 CommonJS", ".mjs/.cjs 可显式覆盖"],
    memoryHook: "type 是包里的语法默认档位",
    files: [{
      name: "package-type-example.txt",
      code: `// package.json
{ "type": "module" }

// app.js
import { readFile } from "node:fs/promises";
console.log(typeof readFile);`
    }],
    entryFile: "package-type-example.txt",
    answer: {
      prompt: "`type: module` 下 app.js 使用 import 会怎样？",
      options: [
        { id: "a", label: "按 ESM 运行并打印 function", detail: ".js 被视为 ESM", feedback: "正确：type: module 改变当前包内 .js 的默认模块格式。" },
        { id: "b", label: "一定报 SyntaxError", detail: "忽略了 type 字段", feedback: "在 type: module 的包中，app.js 可以使用 ESM 语法。" },
        { id: "c", label: "会自动变成 .cjs", detail: "Node 不会改名文件", feedback: ".cjs 是显式扩展名，不会由 Node 自动转换。" }
      ],
      answerId: "a",
      correctExplanation: "包作用域内的 type: module 让 .js 采用 ESM 解析。"
    },
    execution: {
      lanes: ["读取 package.json", "判定 app.js 格式", "执行 import"],
      frames: frames(["找到 type: module。", "app.js 进入 ESM 管线。", "导入 fs/promises。"], ["module", "ESM", "function"], ["package type: module", "parse import", "function"])
    },
    summary: ["type 字段是包级默认模块格式", ".mjs 和 .cjs 更显式", "团队项目应统一模块格式以降低认知成本"],
    sources: [source("Packages: type", "https://nodejs.org/api/packages.html#type")]
  }),
  createLessonSpec({
    id: "modules-node-prefix",
    stageId: "modules-packages",
    eyebrow: "02.4 · 模块、包与 TypeScript",
    title: "内置模块的 node: 前缀",
    objectives: ["使用 node: 前缀导入内置模块", "区分内置模块和用户包"],
    prerequisites: ["modules-esm"],
    concept: "`node:` 前缀明确表示导入 Node 内置模块，例如 `node:fs`、`node:path`。它能让读者和工具立刻知道依赖来自运行时，而不是来自 node_modules。",
    points: ["node:fs 指向内置文件系统模块", "前缀提升可读性", "避免与同名用户包混淆"],
    memoryHook: "node: 盖章：这是内置能力",
    files: [{
      name: "builtin.mjs",
      code: `import path from "node:path";

const file = path.join("logs", "app.log");
console.log(file);`
    }],
    entryFile: "builtin.mjs",
    answer: {
      prompt: "`import path from \"node:path\"` 表示什么？",
      options: [
        { id: "a", label: "导入 Node 内置 path 模块", detail: "node: 前缀声明运行时内置模块", feedback: "正确：node:path 不会去 node_modules 找包。" },
        { id: "b", label: "导入名为 node 的 npm 包", detail: "误读了前缀", feedback: "node: 是内置模块协议，不是包名层级。" },
        { id: "c", label: "只能在浏览器中使用", detail: "path 是 Node 内置模块", feedback: "path 属于 Node，不是浏览器标准 API。" }
      ],
      answerId: "a",
      correctExplanation: "`node:` 前缀让依赖来源明确指向 Node 内置模块。"
    },
    execution: {
      lanes: ["识别前缀", "加载内置模块", "组合路径"],
      frames: frames(["说明符以 node: 开头。", "直接绑定内置 path。", "join 生成平台路径。"], ["node:path", "builtin path", "logs/app.log"], ["builtin selected", "path.join", "logs/app.log"])
    },
    summary: ["推荐用 node: 前缀标识内置模块", "内置模块不来自 npm 安装", "清晰的导入能减少依赖误解"],
    sources: [source("Built-in modules with mandatory node: prefix", "https://nodejs.org/api/modules.html#built-in-modules-with-mandatory-node-prefix")]
  }),
  createLessonSpec({
    id: "packages-dependency-types",
    stageId: "modules-packages",
    eyebrow: "02.5 · 模块、包与 TypeScript",
    title: "dependencies 与 devDependencies",
    objectives: ["区分运行依赖和开发依赖", "理解 package.json 如何描述项目边界"],
    prerequisites: ["modules-package-type"],
    concept: "`dependencies` 描述程序运行时需要的包，`devDependencies` 描述开发、测试、构建时需要的工具。正确分类有助于部署更轻、更安全。",
    points: ["运行时代码需要 dependencies", "测试和构建工具通常在 devDependencies", "项目元数据写在 package.json"],
    memoryHook: "线上要吃饭的是 dependencies，厨房工具是 devDependencies",
    files: [{
      name: "package.json",
      code: `{
  "scripts": {
    "test": "node --test"
  },
  "dependencies": {
    "fastify": "^5.0.0"
  },
  "devDependencies": {
    "tsx": "^4.0.0"
  }
}`
    }],
    entryFile: "package.json",
    answer: {
      prompt: "如果服务启动时直接 import fastify，fastify 应放在哪里？",
      options: [
        { id: "a", label: "dependencies", detail: "运行时需要", feedback: "正确：生产运行需要的包应在 dependencies。" },
        { id: "b", label: "devDependencies", detail: "只适合开发工具", feedback: "服务运行直接依赖 fastify，不能只归为开发依赖。" },
        { id: "c", label: "scripts", detail: "scripts 只定义命令", feedback: "scripts 不安装依赖，只定义可运行命令。" }
      ],
      answerId: "a",
      correctExplanation: "运行时代码直接需要的包属于 dependencies。"
    },
    execution: {
      lanes: ["读取 package", "分类依赖", "部署安装"],
      frames: frames(["扫描依赖字段。", "fastify 被归为运行依赖。", "生产安装保留 fastify。"], ["package.json", "dependencies", "fastify installed"], ["read package", "classify fastify", "runtime ready"])
    },
    summary: ["依赖分类表达包的使用阶段", "错误分类会造成生产缺包或镜像膨胀", "package.json 是 Node 项目的契约文件"],
    sources: [source("An introduction to the npm package manager", "https://nodejs.org/en/learn/getting-started/an-introduction-to-the-npm-package-manager")]
  }),
  createLessonSpec({
    id: "packages-semver-scripts",
    stageId: "modules-packages",
    eyebrow: "02.6 · 模块、包与 TypeScript",
    title: "SemVer 与 npm scripts",
    objectives: ["理解 ^ 版本范围的含义", "使用 scripts 固化常用命令"],
    prerequisites: ["packages-dependency-types"],
    concept: "npm 包通常使用语义化版本。`^1.2.3` 表示允许安装兼容的较新小版本和补丁版本，但不跨到 2.0.0。scripts 把常用命令写入 package.json，保证团队入口一致。",
    points: ["SemVer 由 major.minor.patch 组成", "^ 通常允许不破坏兼容的更新", "npm run 执行 scripts 中的命令"],
    memoryHook: "版本定范围，scripts 定入口",
    files: [{
      name: "package.json",
      code: `{
  "scripts": {
    "check": "node --version"
  },
  "dependencies": {
    "kleur": "^4.1.5"
  }
}`
    }],
    entryFile: "package.json",
    answer: {
      prompt: "`npm run check` 会执行哪条命令？",
      options: [
        { id: "a", label: "node --version", detail: "来自 scripts.check", feedback: "正确：npm run 会查找 scripts 中对应键。" },
        { id: "b", label: "kleur --version", detail: "把依赖当命令", feedback: "scripts.check 明确写的是 node --version。" },
        { id: "c", label: "npm install", detail: "run 不等于 install", feedback: "npm run 执行脚本，不会默认安装依赖。" }
      ],
      answerId: "a",
      correctExplanation: "`check` 脚本的值就是 `node --version`。"
    },
    execution: {
      lanes: ["读取 scripts", "解析版本范围", "执行命令"],
      frames: frames(["找到 check。", "识别 ^4.1.5。", "运行 node --version。"], ["check", "^4.1.5", "v24.x"], ["script selected", "semver range read", "v24.x"])
    },
    summary: ["SemVer 帮助描述兼容范围", "scripts 让项目命令可发现", "不要把依赖声明和脚本命令混为一谈"],
    sources: [source("Packages", "https://nodejs.org/api/packages.html")]
  }),
  createLessonSpec({
    id: "modules-require-cache",
    stageId: "modules-packages",
    eyebrow: "02.7 · 模块、包与 TypeScript",
    title: "CommonJS 与 require 缓存",
    objectives: ["解释 require 为什么只初始化一次", "理解共享模块状态的风险"],
    prerequisites: ["modules-package-type"],
    concept: "CommonJS 模块第一次被 require 时会执行文件并缓存 exports。相同解析路径的后续 require 会返回同一个导出对象，因此模块内部闭包状态会被共享。",
    points: ["首次 require 执行模块", "后续 require 命中缓存", "共享状态需要谨慎"],
    memoryHook: "首次执行并缓存，后续命中同一实例",
    files: [{
      name: "app.cjs",
      code: `// counter.cjs
console.log("init counter");
let count = 0;
module.exports = () => ++count;

// app.cjs
const a = require("./counter.cjs");
const b = require("./counter.cjs");
console.log(a(), b());`
    }],
    entryFile: "app.cjs",
    answer: {
      prompt: "执行 app.cjs 后，日志最可能是什么？",
      options: [
        { id: "a", label: "init counter；1 2", detail: "模块实例被缓存并共享", feedback: "正确：a 和 b 指向同一个导出函数，闭包 count 被共享。" },
        { id: "b", label: "init counter 两次；1 1", detail: "忽略 require 缓存", feedback: "相同解析路径第二次 require 会命中缓存。" },
        { id: "c", label: "只输出 1 1", detail: "忽略模块初始化日志", feedback: "首次加载 counter.cjs 会执行顶层 console.log。" }
      ],
      answerId: "a",
      correctExplanation: "CommonJS 缓存让第二次 require 复用第一次的 exports。"
    },
    execution: {
      lanes: ["模块加载器", "require.cache", "Console"],
      frames: frames(["第一次执行 counter.cjs。", "exports 进入缓存。", "第二次命中缓存并调用。"], ["init counter", "counter.cjs ✓", "1 2"], ["init counter", "cache hit", "1 2"])
    },
    summary: ["CommonJS 模块首次加载后进入缓存", "缓存键是解析后的模块文件", "共享状态会让模块像单例一样工作"],
    sources: [source("Modules: Caching", "https://nodejs.org/api/modules.html#caching")]
  }),
  createLessonSpec({
    id: "typescript-node",
    stageId: "modules-packages",
    eyebrow: "02.8 · 模块、包与 TypeScript",
    title: "Node.js 中运行 TypeScript",
    objectives: ["认识 Node 对 TypeScript 的支持边界", "区分类型擦除与类型检查"],
    prerequisites: ["modules-esm"],
    concept: "现代 Node 提供了直接运行部分 TypeScript 的能力，但运行时不会替你完成完整工程级类型检查。学习时要区分“运行代码”和“验证类型正确”这两个步骤。",
    points: ["TypeScript 类型主要在开发期服务", "运行时通常看不到类型注解", "复杂项目仍需要 tsc 或构建链路"],
    memoryHook: "能跑不等于类型已验证",
    files: [{
      name: "price.ts",
      code: `type Item = { price: number; count: number };

const cart: Item[] = [
  { price: 12, count: 2 },
  { price: 5, count: 3 }
];

console.log(cart.reduce((sum, item) => sum + item.price * item.count, 0));`
    }],
    entryFile: "price.ts",
    answer: {
      prompt: "这段 TypeScript 示例的业务输出是多少？",
      options: [
        { id: "a", label: "39", detail: "12*2 + 5*3", feedback: "正确：类型帮助描述结构，运行时计算仍是普通 JS 数值逻辑。" },
        { id: "b", label: "17", detail: "只相加 price", feedback: "代码还乘以 count。" },
        { id: "c", label: "Item", detail: "把类型当运行时值", feedback: "type 声明不会成为运行时输出。" }
      ],
      answerId: "a",
      correctExplanation: "类型声明被用于开发期约束，实际 reduce 计算得到 39。"
    },
    execution: {
      lanes: ["读取类型", "执行数组计算", "输出结果"],
      frames: frames(["开发期理解 Item。", "运行 reduce 累加。", "打印总价。"], ["Item shape", "24 + 15", "39"], ["type erased", "reduce", "39"])
    },
    summary: ["TypeScript 提升维护性，但运行时仍执行 JavaScript 语义", "类型声明不是运行时值", "学习 Node + TS 时要同时验证运行和类型"],
    sources: [source("Modules: TypeScript", "https://nodejs.org/api/typescript.html")]
  }),
  createLessonSpec({
    id: "project-dependency-inspector",
    stageId: "modules-packages",
    kind: "stage-project",
    difficulty: "进阶",
    durationMinutes: 24,
    eyebrow: "阶段项目 02 · 综合训练",
    title: "依赖与配置检查器",
    objectives: ["读取 package.json 并输出依赖报告", "综合模块导入、JSON 解析和依赖分类"],
    prerequisites: ["typescript-node"],
    concept: "阶段项目把模块系统与包元数据合在一起：读取 package.json，统计 dependencies 和 devDependencies，检查 scripts 是否包含团队约定命令，并把报告输出给维护者。",
    points: ["fs/promises 读取 JSON 文件", "依赖分类来自 package.json 字段", "报告逻辑应处理缺失字段"],
    memoryHook: "读包清单，查依赖边界",
    files: [{
      name: "dependency-inspector.mjs",
      code: `import { readFile } from "node:fs/promises";

const pkg = JSON.parse(await readFile("package.json", "utf8"));
const dependencies = Object.keys(pkg.dependencies ?? {});
const devDependencies = Object.keys(pkg.devDependencies ?? {});
const hasTest = Boolean(pkg.scripts?.test);

console.log("runtime deps:", dependencies.length);
console.log("dev deps:", devDependencies.length);
console.log("has test:", hasTest);`
    }],
    entryFile: "dependency-inspector.mjs",
    answer: {
      type: "transfer",
      prompt: "为什么代码里使用 `pkg.dependencies ?? {}`？",
      options: [
        { id: "a", label: "依赖字段缺失时仍能统计 0", detail: "防止 Object.keys(undefined)", feedback: "正确：空值合并让缺失字段变成空对象。" },
        { id: "b", label: "强制安装依赖", detail: "读取不会安装", feedback: "脚本只读取 JSON，不会执行 npm install。" },
        { id: "c", label: "把 devDependencies 合并进去", detail: "两个字段分开统计", feedback: "devDependencies 使用独立表达式统计。" }
      ],
      answerId: "a",
      correctExplanation: "缺失 dependencies 时 Object.keys 需要一个空对象作为安全默认值。"
    },
    execution: {
      lanes: ["读取文件", "解析字段", "输出报告"],
      frames: frames(["fs/promises 读取 package.json。", "统计依赖和脚本。", "打印三行检查结果。"], ["package.json", "deps/dev/scripts", "report"], ["read package", "runtime deps: 3", "has test: true"])
    },
    summary: ["阶段项目整合 ESM、内置模块和包元数据", "读取外部数据时要防御缺失字段", "依赖报告能帮助团队快速发现项目边界问题"],
    sources: [
      source("Reading files with Node.js", "https://nodejs.org/en/learn/manipulating-files/reading-files-with-nodejs"),
      source("Packages", "https://nodejs.org/api/packages.html")
    ]
  })
];

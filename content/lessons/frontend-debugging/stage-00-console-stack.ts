import type { LessonQuestion, LessonSpec, MicroBrowserSpec, ProductionIncidentSpec } from "../../../lib/curriculum/types";

const stageId = "frontend-debugging-console-stack";
const nodeVersion = "Browser DevTools + React";
const verifiedAt = "2026-07-23";

type DebugLessonSeed = {
  id: string;
  order: number;
  title: string;
  objectives: string[];
  prerequisites: string[];
  concept: string;
  points: string[];
  memoryHook: string;
  fileName: string;
  code: string;
  diagnosisPrompt: string;
  diagnosisCorrect: string;
  diagnosisWrong: [string, string];
  tracePrompt: string;
  traceCorrect: string;
  traceWrong: [string, string];
  visualNodes: string[];
  frameNotes: [string, string, string];
  preview: MicroBrowserSpec;
  summary: string[];
  sourceTitle: string;
  sourceUrl: string;
};

function createDebugLesson(seed: DebugLessonSeed): LessonSpec {
  const baseId = seed.id;

  return {
    id: seed.id,
    stageId,
    kind: "knowledge",
    eyebrow: `00.${seed.order} · 浏览器控制台与错误栈`,
    title: seed.title,
    durationMinutes: 12,
    difficulty: "基础",
    nodeVersion,
    objectives: seed.objectives,
    prerequisites: seed.prerequisites,
    concept: seed.concept,
    points: seed.points,
    memoryHook: seed.memoryHook,
    files: [{ name: seed.fileName, code: seed.code }],
    entryFile: seed.fileName,
    questions: [
      {
        id: `${baseId}-diagnosis`,
        type: "diagnosis",
        prompt: seed.diagnosisPrompt,
        materialTitle: "控制台线索",
        materialCode: seed.frameNotes.join("\n"),
        materialLanguage: "text",
        difficulty: "beginner",
        estimatedSeconds: 70,
        options: [
          {
            id: "a",
            label: seed.diagnosisWrong[0],
            detail: "容易先追现象",
            feedback: "这个方向只能描述表面症状，不能定位第一处可修改的业务代码。"
          },
          {
            id: "b",
            label: seed.diagnosisCorrect,
            detail: "锁定第一现场",
            feedback: "正确：先把错误信息、栈帧和当前数据状态串起来，再决定修复点。"
          },
          {
            id: "c",
            label: seed.diagnosisWrong[1],
            detail: "过早归因",
            feedback: "这个判断跳过了证据链，容易修到无关模块。"
          }
        ],
        answerId: "b",
        correctExplanation: "前端调试先看第一条业务源码帧，再用当时的数据快照验证原因。"
      },
      {
        id: `${baseId}-trace-debug`,
        type: "trace-debug",
        prompt: seed.tracePrompt,
        materialTitle: "错误栈 Trace",
        materialCode: `Console\n  ${seed.visualNodes.join("\n  ")}`,
        materialLanguage: "text",
        difficulty: "beginner",
        estimatedSeconds: 80,
        options: [
          {
            id: "a",
            label: seed.traceWrong[0],
            detail: "先看框架噪声",
            feedback: "框架栈能说明调度路径，但通常不是本次业务修复的入口。"
          },
          {
            id: "b",
            label: seed.traceCorrect,
            detail: "按栈帧回到源码",
            feedback: "正确：把错误栈的业务帧、源码位置和变量状态按时间线连起来。"
          },
          {
            id: "c",
            label: seed.traceWrong[1],
            detail: "只看最终 UI",
            feedback: "最终 UI 是结果，不足以解释错误在哪里被触发。"
          }
        ],
        answerId: "b",
        correctExplanation: "Trace 调试的关键是沿着可观察事件回放：控制台报错、业务栈帧、触发数据、修复后恢复。"
      }
    ],
    execution: {
      mode: "authored-trace",
      visualizer: {
        type: "frontend-error-stack",
        title: "前端错误栈定位",
        nodes: seed.visualNodes
      },
      lanes: ["Console", "Stack", "Source", "Preview"],
      frames: [
        {
          activeLane: 0,
          laneValues: ["错误出现", "等待", "等待", "页面异常"],
          log: [seed.frameNotes[0]],
          note: "先读取控制台错误，不急着改代码。",
          delayMs: 360
        },
        {
          activeLane: 1,
          laneValues: ["已记录", seed.visualNodes.slice(0, 3).join(" -> "), "等待", "页面异常"],
          log: [seed.frameNotes[1]],
          note: "定位第一条业务源码帧，过滤框架内部调用。",
          delayMs: 720
        },
        {
          activeLane: 2,
          laneValues: ["已记录", "已定位", seed.fileName, "恢复预览"],
          log: [seed.frameNotes[2]],
          note: "用数据快照解释错误，并验证修复后的页面状态。",
          delayMs: 720
        }
      ]
    },
    preview: seed.preview,
    summary: seed.summary,
    sources: [{ type: "official", title: seed.sourceTitle, url: seed.sourceUrl, verifiedAt }]
  };
}

function productCardPreview(title: string, detail: string): MicroBrowserSpec {
  return {
    url: "/debug-lab/products",
    statusCode: 200,
    contentType: "ui-card",
    renderedHtml: `<section class="debug-preview"><h1>${title}</h1><p>${detail}</p></section>`
  };
}

const projectIncident: ProductionIncidentSpec = {
  title: "商品列表白屏事故",
  summary: "一次商品 API 字段变更导致列表渲染访问 undefined，错误边界接管页面，排障后恢复核心购买路径。",
  metrics: [
    { label: "白屏用户", incident: "42%", patching: "18%", critical: "57%", restored: "0%" },
    { label: "控制台错误", incident: "TypeError", patching: "guarded", critical: "repeat", restored: "none" },
    { label: "购买入口", incident: "blocked", patching: "partial", critical: "offline", restored: "online" }
  ],
  recoveryMessage: "SYSTEM RESTORED — 100% OPERATIONAL",
  runbook: ["定位第一条 ProductList 业务栈帧", "比对接口数据与渲染假设", "加入空值保护与降级 UI", "复核控制台、预览和事故指标"]
};

const projectQuestions: LessonQuestion[] = [
  {
    id: "project-frontend-debugging-product-list-diagnosis",
    type: "diagnosis",
    prompt: "商品列表白屏时，哪条线索最适合作为第一修复入口？",
    materialTitle: "事故控制台",
    materialCode: "TypeError: Cannot read properties of undefined (reading 'map')\n    at ProductList (ProductList.tsx:18:21)\n    at ProductPage (ProductPage.tsx:7:10)",
    materialLanguage: "text",
    difficulty: "intermediate",
    estimatedSeconds: 90,
    options: [
      { id: "a", label: "先重启开发服务器", detail: "清理运行状态", feedback: "重启只能排除热更新问题，不能解释 undefined.map 的来源。" },
      { id: "b", label: "检查 ProductList 的 products 输入", detail: "第一条业务帧", feedback: "正确：错误栈已经指向 ProductList 的 products.map，需要先确认传入数据形状。" },
      { id: "c", label: "删除 ErrorBoundary", detail: "让页面不拦截错误", feedback: "错误边界只是显示降级 UI，删除它不会修复真实崩溃。" }
    ],
    answerId: "b",
    correctExplanation: "第一条业务栈帧 ProductList.tsx:18 指向 products.map，修复入口是传入数据是否为数组。"
  },
  {
    id: "project-frontend-debugging-product-list-trace-debug",
    type: "trace-debug",
    prompt: "按正确顺序回放这次事故 trace，哪条路径最可靠？",
    materialTitle: "事故 Trace",
    materialCode: "fetchProducts -> ProductPage -> ProductList -> ErrorBoundary -> recovered preview",
    materialLanguage: "text",
    difficulty: "intermediate",
    estimatedSeconds: 100,
    options: [
      { id: "a", label: "ErrorBoundary -> fetchProducts -> ProductList", detail: "先看兜底组件", feedback: "错误边界是后果，不能放在数据读取之前。" },
      { id: "b", label: "fetchProducts -> ProductPage -> ProductList -> ErrorBoundary -> recovered preview", detail: "从数据到渲染再到恢复", feedback: "正确：这条路径覆盖数据来源、渲染崩溃、错误接管和恢复验证。" },
      { id: "c", label: "recovered preview -> ProductList -> fetchProducts", detail: "从结果倒推", feedback: "最终预览用于验证，排障时仍需要先沿触发链定位。" }
    ],
    answerId: "b",
    correctExplanation: "Trace 调试要保留时间顺序：数据响应先到，渲染访问再发生，错误边界接管，最后验证恢复。"
  },
  {
    id: "project-frontend-debugging-product-list-repair",
    type: "repair",
    prompt: "选择能让商品列表在字段缺失时恢复的最小修复。",
    materialTitle: "ProductList.tsx",
    materialCode: "export function ProductList({ products }) {\n  return products.map((product) => <article key={product.id}>{product.name}</article>);\n}",
    materialLanguage: "tsx",
    difficulty: "intermediate",
    estimatedSeconds: 120,
    options: [
      {
        id: "a",
        label: "把 products 归一化为数组",
        detail: "保留列表并提供空态",
        feedback: "正确：先收窄输入，再让渲染分支处理空列表。",
        language: "tsx",
        diffLines: [2, 3, 4],
        code: `export function ProductList({ products }: { products?: Product[] }) {
  const safeProducts = Array.isArray(products) ? products : [];
  if (safeProducts.length === 0) return <p>商品正在补货，请稍后刷新。</p>;
  return safeProducts.map((product) => <article key={product.id}>{product.name}</article>);
}`
      },
      {
        id: "b",
        label: "只用可选链包住 map",
        detail: "错误不再抛出但页面无反馈",
        feedback: "可选链会吞掉崩溃，但用户看不到列表或空态，也不利于后续排查。",
        language: "tsx",
        diffLines: [2],
        code: `export function ProductList({ products }) {
  return products?.map((product) => <article key={product.id}>{product.name}</article>);
}`
      },
      {
        id: "c",
        label: "捕获所有异常并返回 null",
        detail: "隐藏错误",
        feedback: "这会让事故静默化，既没有用户反馈，也失去可观测线索。",
        language: "tsx",
        diffLines: [2, 3, 4, 5],
        code: `export function ProductList({ products }) {
  try {
    return products.map((product) => <article key={product.id}>{product.name}</article>);
  } catch {
    return null;
  }
}`
      }
    ],
    answerId: "a",
    correctExplanation: "修复要同时满足不崩溃、可解释和可验证：把未知输入归一化，并提供明确空态。"
  }
];

export const frontendDebuggingStageZeroLessons: LessonSpec[] = [
  createDebugLesson({
    id: "frontend-debugging-stack-first-frame",
    order: 1,
    title: "读取错误栈的第一现场",
    objectives: ["识别控制台错误的类型、消息和第一条业务源码帧"],
    prerequisites: [],
    concept: "浏览器控制台的错误栈通常从报错消息开始，随后列出调用链。调试时优先寻找第一条属于业务源码的帧，因为它最接近可修改的触发点。",
    points: ["先读错误类型和 message", "跳过 React 或浏览器内部栈噪声", "把第一条业务源码帧作为排查入口"],
    memoryHook: "先找第一条业务帧",
    fileName: "ProductCard.tsx",
    code: `type Product = { title?: string };

export function ProductCard({ product }: { product?: Product }) {
  return <h2>{product.title.toUpperCase()}</h2>;
}`,
    diagnosisPrompt: "这段报错出现后，第一步应该看哪里？",
    diagnosisCorrect: "ProductCard.tsx 中的第一条业务栈帧",
    diagnosisWrong: ["React DOM 的 commitRoot 调用", "浏览器 Console 面板主题设置"],
    tracePrompt: "哪条 trace 更接近真实排障路径？",
    traceCorrect: "TypeError -> ProductCard.tsx -> product.title",
    traceWrong: ["commitRoot -> scheduler -> requestAnimationFrame", "页面空白 -> 刷新浏览器 -> 关闭 DevTools"],
    visualNodes: ["TypeError message", "ProductCard.tsx:4", "product.title", "Preview restored"],
    frameNotes: ["TypeError: Cannot read properties of undefined (reading 'title')", "at ProductCard (ProductCard.tsx:4:23)", "product 在当前渲染帧中为 undefined。"],
    preview: productCardPreview("精选商品", "修复后卡片会先显示可读标题或占位文案。"),
    summary: ["错误栈第一行说明错误类型和失败属性", "第一条业务源码帧通常就是最短排障入口", "调试要把栈帧和当前数据快照放在一起看"],
    sourceTitle: "MDN JavaScript error reference",
    sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors"
  }),
  createDebugLesson({
    id: "frontend-debugging-error-types",
    order: 2,
    title: "区分常见 JavaScript 错误类型",
    objectives: ["区分 TypeError、ReferenceError 与 SyntaxError 的定位方式"],
    prerequisites: ["frontend-debugging-stack-first-frame"],
    concept: "不同错误类型提示不同排查方向：TypeError 多指向值的类型或形状不符合假设，ReferenceError 指向变量绑定不存在，SyntaxError 则发生在代码解析阶段。",
    points: ["TypeError 关注值的实际类型", "ReferenceError 关注作用域和导入", "SyntaxError 先检查语法与构建输出"],
    memoryHook: "类型错看值，引用错看名，语法错看解析",
    fileName: "filters.ts",
    code: `export function getActiveFilterLabel(filters?: { active?: string }) {
  return filters.active.toUpperCase();
}`,
    diagnosisPrompt: "TypeError: Cannot read properties of undefined 时，最可能的排查方向是什么？",
    diagnosisCorrect: "读取属性的对象并不是预期对象",
    diagnosisWrong: ["变量名一定没有声明", "代码一定无法被解析"],
    tracePrompt: "如何把 TypeError trace 转成下一步行动？",
    traceCorrect: "查看栈帧变量 filters 的运行时值",
    traceWrong: ["先检查 CSS 是否覆盖", "先删除所有 import"],
    visualNodes: ["TypeError", "filters.ts:2", "filters value", "Guard branch"],
    frameNotes: ["TypeError 指出 undefined 上读取 active。", "at getActiveFilterLabel (filters.ts:2:18)", "filters 没有默认值，调用方可能省略参数。"],
    preview: productCardPreview("筛选器", "修复后未选择筛选器时显示“全部商品”。"),
    summary: ["错误类型是排查路线图", "TypeError 要回到运行时值", "不要把所有错误都误判成语法或依赖问题"],
    sourceTitle: "MDN Error objects",
    sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error"
  }),
  createDebugLesson({
    id: "frontend-debugging-undefined-property",
    order: 3,
    title: "定位 undefined 属性访问",
    objectives: ["用空值保护和输入归一化修复属性访问崩溃"],
    prerequisites: ["frontend-debugging-error-types"],
    concept: "undefined 属性访问通常来自接口字段缺失、父组件未传参或初始加载状态。修复时要区分“缺数据”和“空列表”，避免把真实异常静默吞掉。",
    points: ["先确认值为什么是 undefined", "用明确默认值表达业务意图", "空态 UI 比静默 null 更利于用户理解"],
    memoryHook: "先问为什么空，再决定怎么兜底",
    fileName: "UserBadge.tsx",
    code: `type User = { profile?: { name?: string } };

export function UserBadge({ user }: { user?: User }) {
  return <span>{user.profile.name}</span>;
}`,
    diagnosisPrompt: "这段代码白屏时，最应该先确认哪件事？",
    diagnosisCorrect: "user 或 profile 是否在首屏渲染时缺失",
    diagnosisWrong: ["浏览器是否支持 span 标签", "React 是否已经停止支持 props"],
    tracePrompt: "哪条 trace 能解释 undefined 属性访问？",
    traceCorrect: "render UserBadge -> user undefined -> 访问 profile 失败",
    traceWrong: ["click button -> CSS repaint -> network idle", "build app -> deploy app -> open app"],
    visualNodes: ["UserBadge render", "user snapshot", "profile read", "Fallback UI"],
    frameNotes: ["TypeError: Cannot read properties of undefined (reading 'profile')", "at UserBadge (UserBadge.tsx:4:22)", "首屏 user 尚未加载完成，需要明确 loading 或 fallback。"],
    preview: productCardPreview("用户徽章", "修复后资料未返回时显示匿名用户占位。"),
    summary: ["undefined 属性访问要追数据生命周期", "默认值应表达业务含义", "空态与异常态要分开处理"],
    sourceTitle: "MDN Optional chaining",
    sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining"
  }),
  createDebugLesson({
    id: "frontend-debugging-promise-rejection",
    order: 4,
    title: "识别异步 Promise 报错",
    objectives: ["定位 unhandledrejection 并补齐异步错误分支"],
    prerequisites: ["frontend-debugging-stack-first-frame"],
    concept: "Promise rejection 如果没有被 await try/catch 或 .catch 接住，浏览器会抛出 unhandledrejection。调试时要找到创建 Promise 的业务调用点，而不只看最终事件监听器。",
    points: ["区分同步 throw 和异步 rejection", "沿 async 调用链找缺失的 catch", "把失败状态反馈给界面"],
    memoryHook: "异步错要找没人接的 Promise",
    fileName: "loadProducts.ts",
    code: `export async function loadProducts() {
  const response = await fetch("/api/products");
  return response.json();
}`,
    diagnosisPrompt: "控制台出现 Unhandled Promise Rejection 时，最该检查什么？",
    diagnosisCorrect: "调用 loadProducts 的地方是否处理失败分支",
    diagnosisWrong: ["所有 JSX 标签是否闭合", "浏览器缓存是否清空"],
    tracePrompt: "哪条 trace 能解释异步报错来源？",
    traceCorrect: "click refresh -> loadProducts -> fetch rejected -> no catch",
    traceWrong: ["render header -> paint title -> hover card", "parse CSS -> calculate layout -> paint"],
    visualNodes: ["User action", "loadProducts()", "Promise rejected", "Error state"],
    frameNotes: ["Unhandled Promise Rejection: NetworkError", "at loadProducts (loadProducts.ts:2:26)", "调用方没有 catch，界面没有进入失败状态。"],
    preview: productCardPreview("商品加载失败", "修复后网络失败会展示可重试提示。"),
    summary: ["Promise rejection 属于异步错误路径", "调用方负责把失败转成界面状态", "不要只在全局监听器里吞掉错误"],
    sourceTitle: "MDN Window unhandledrejection event",
    sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/API/Window/unhandledrejection_event"
  }),
  createDebugLesson({
    id: "frontend-debugging-source-map",
    order: 5,
    title: "从 Source Map 回到源码",
    objectives: ["用 Source Map 把压缩栈帧映射回源码文件"],
    prerequisites: ["frontend-debugging-stack-first-frame"],
    concept: "生产错误栈常指向压缩后的 bundle 行列号。Source Map 能把 bundle 位置映射回原始源码，帮助你找到真正需要修复的组件或函数。",
    points: ["生产栈帧可能来自 bundle", "Source Map 负责还原源码位置", "映射后仍要验证变量和数据"],
    memoryHook: "bundle 坐标要翻译回源码",
    fileName: "source-map-note.ts",
    code: `export function readBundleFrame(frame: string) {
  return frame.includes(".js:1:") ? "需要 Source Map 映射" : "可直接阅读";
}`,
    diagnosisPrompt: "生产日志只有 app-4f2a.js:1:9821 时，下一步是什么？",
    diagnosisCorrect: "用 Source Map 找回原始源码文件和行号",
    diagnosisWrong: ["直接修改压缩后的 bundle", "认为无法继续排查"],
    tracePrompt: "哪条 trace 是正确的 Source Map 排障路径？",
    traceCorrect: "bundle frame -> source map -> ProductList.tsx -> variable snapshot",
    traceWrong: ["bundle frame -> random search -> rewrite component", "error count -> deploy rollback -> skip diagnosis"],
    visualNodes: ["Bundle frame", "Source Map", "Original source", "Fix target"],
    frameNotes: ["TypeError at app-4f2a.js:1:9821", "Source Map maps to ProductList.tsx:18:21", "映射后再检查 products 是否为数组。"],
    preview: productCardPreview("源码映射", "修复面板展示 bundle 坐标与源码坐标的对应关系。"),
    summary: ["生产栈帧需要映射后才适合修改源码", "Source Map 是定位工具不是修复本身", "映射结果还要和运行时数据一起验证"],
    sourceTitle: "Chrome DevTools Source maps",
    sourceUrl: "https://developer.chrome.com/docs/devtools/javascript/source-maps"
  }),
  createDebugLesson({
    id: "frontend-debugging-console-structure",
    order: 6,
    title: "用结构化 console 整理调试信息",
    objectives: ["用 console.group、console.table 与标签组织调试输出"],
    prerequisites: ["frontend-debugging-error-types"],
    concept: "临时日志不是越多越好。结构化 console 能把一次渲染、一次请求或一次用户操作折叠成可读分组，减少误判和重复猜测。",
    points: ["用 group 标记一次调试会话", "用 table 观察对象数组", "日志要带上下文和可删除边界"],
    memoryHook: "日志要成组，不要散落",
    fileName: "debugProducts.ts",
    code: `export function debugProducts(products: unknown[]) {
  console.group("ProductList render");
  console.table(products);
  console.groupEnd();
}`,
    diagnosisPrompt: "当日志很多且互相混杂时，最有效的整理方式是什么？",
    diagnosisCorrect: "按一次渲染或一次请求建立 console.group",
    diagnosisWrong: ["继续添加更多无标签 console.log", "只保留最后一条日志"],
    tracePrompt: "哪条 trace 更容易还原一次渲染？",
    traceCorrect: "group start -> table products -> group end",
    traceWrong: ["log item -> log item -> log item without labels", "clear console -> refresh -> guess"],
    visualNodes: ["console.group", "console.table", "groupEnd", "Readable trace"],
    frameNotes: ["ProductList render 分组开始。", "console.table 展示每个 product 的字段形状。", "分组结束后可删除整段临时日志。"],
    preview: productCardPreview("结构化日志", "修复后调试面板按渲染批次展示商品字段。"),
    summary: ["结构化日志帮助建立时间和上下文", "console.table 适合检查对象数组", "临时日志要易于清理"],
    sourceTitle: "MDN console",
    sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/API/console"
  }),
  createDebugLesson({
    id: "frontend-debugging-data-vs-render",
    order: 7,
    title: "判断数据问题还是渲染问题",
    objectives: ["分辨接口数据缺失、状态转换错误与 JSX 渲染假设"],
    prerequisites: ["frontend-debugging-undefined-property", "frontend-debugging-console-structure"],
    concept: "同一个白屏可能来自数据响应为空、状态转换丢字段，也可能来自渲染层假设过强。调试时按数据进入、状态加工、组件读取三个层级缩小范围。",
    points: ["先确认接口响应是否符合契约", "再检查状态转换是否改坏数据", "最后看 JSX 是否有过强假设"],
    memoryHook: "数据进来、状态加工、渲染读取",
    fileName: "ProductPage.tsx",
    code: `export function ProductPage({ payload }: { payload?: { items?: Product[] } }) {
  const products = payload.items;
  return <ProductList products={products} />;
}`,
    diagnosisPrompt: "要区分数据问题和渲染问题，最该先比较哪两处？",
    diagnosisCorrect: "接口 payload 与传入 ProductList 的 products",
    diagnosisWrong: ["按钮 hover 色和字体大小", "构建工具版本和 Node 版本"],
    tracePrompt: "哪条 trace 能把问题层级拆清楚？",
    traceCorrect: "payload -> products state -> ProductList props -> render read",
    traceWrong: ["DOM paint -> CSS cascade -> browser zoom", "deploy -> cache -> reload"],
    visualNodes: ["API payload", "State mapping", "ProductList props", "Render read"],
    frameNotes: ["payload.items 在接口响应中缺失。", "ProductPage 直接读取 payload.items。", "ProductList 收到 undefined 并在 map 时崩溃。"],
    preview: productCardPreview("数据与渲染", "修复后能区分接口空数据和组件空态。"),
    summary: ["白屏不一定是渲染层本身错误", "按数据链路逐层对比可以减少猜测", "props 进入组件前最好完成形状归一化"],
    sourceTitle: "React Conditional Rendering",
    sourceUrl: "https://react.dev/learn/conditional-rendering"
  }),
  createDebugLesson({
    id: "frontend-debugging-runtime-recovery",
    order: 8,
    title: "观察修复后的运行恢复",
    objectives: ["用控制台、预览和事故指标确认修复真正生效"],
    prerequisites: ["frontend-debugging-data-vs-render"],
    concept: "前端修复不是代码不报红就结束。要观察控制台是否安静、预览是否恢复核心路径、事故指标是否回落，并保留复盘中能解释原因的 trace。",
    points: ["修复后复核控制台和 UI", "用指标判断用户路径是否恢复", "把根因和防回归点写入复盘"],
    memoryHook: "恢复要看控制台、页面和指标三件套",
    fileName: "verifyRecovery.ts",
    code: `export function verifyRecovery(errors: string[], renderedCards: number) {
  return errors.length === 0 && renderedCards > 0 ? "restored" : "still-broken";
}`,
    diagnosisPrompt: "修复合并前，哪组证据最能证明页面已恢复？",
    diagnosisCorrect: "控制台无同类错误、商品卡片出现、事故指标回落",
    diagnosisWrong: ["只要 TypeScript 编译通过", "只要刷新后偶尔能看到标题"],
    tracePrompt: "哪条 trace 最适合作为恢复验证？",
    traceCorrect: "patched input guard -> render cards -> no TypeError -> incident restored",
    traceWrong: ["commit code -> close tab -> wait for feedback", "hide console -> refresh once -> ship"],
    visualNodes: ["Patch applied", "Render cards", "Console clean", "Incident restored"],
    frameNotes: ["修复加入输入归一化。", "预览渲染 3 张商品卡片。", "控制台没有同类 TypeError，事故指标恢复。"],
    preview: productCardPreview("运行恢复", "修复后核心商品列表重新可见。"),
    summary: ["恢复验证需要覆盖技术和用户路径", "控制台安静只是证据之一", "复盘要留下根因、修复和防回归点"],
    sourceTitle: "React Error Boundaries",
    sourceUrl: "https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary"
  }),
  {
    id: "project-frontend-debugging-product-list",
    stageId,
    kind: "stage-project",
    eyebrow: "00.9 · 阶段项目",
    title: "修复商品列表白屏事故",
    durationMinutes: 24,
    difficulty: "进阶",
    nodeVersion,
    objectives: ["完整走通一次商品列表前端白屏事故排障", "用 trace、预览和事故面板证明恢复"],
    prerequisites: [
      "frontend-debugging-stack-first-frame",
      "frontend-debugging-undefined-property",
      "frontend-debugging-runtime-recovery"
    ],
    concept: "阶段项目把控制台报错、业务栈帧、数据形状、修复方案和恢复验证连成一条排障链。所有反馈都是预置事故数据和 authored trace，不执行真实线上代码。",
    points: ["从第一条业务栈帧开始定位", "判断 products 是否为数组", "用最小修复恢复列表并保留空态"],
    memoryHook: "先定位，再修复，最后证明恢复",
    files: [
      {
        name: "ProductPage.tsx",
        code: `import { ProductList } from "./ProductList";

export function ProductPage({ payload }: { payload?: { items?: Product[] } }) {
  return <ProductList products={payload?.items} />;
}`
      },
      {
        name: "ProductList.tsx",
        code: `type Product = { id: string; name: string };

export function ProductList({ products }: { products?: Product[] }) {
  return products.map((product) => (
    <article key={product.id}>{product.name}</article>
  ));
}`
      }
    ],
    entryFile: "ProductPage.tsx",
    questions: projectQuestions,
    execution: {
      mode: "authored-trace",
      visualizer: {
        type: "frontend-error-stack",
        title: "商品列表错误栈事故",
        nodes: ["fetchProducts", "ProductPage", "ProductList", "ErrorBoundary", "Recovered"]
      },
      lanes: ["Data", "Render", "Console", "Incident"],
      frames: [
        {
          activeLane: 0,
          laneValues: ["payload.items 缺失", "等待", "等待", "白屏用户 42%"],
          log: ["API payload: { data: [] }，没有 items 字段。"],
          note: "事故从数据契约偏移开始。",
          delayMs: 420
        },
        {
          activeLane: 1,
          laneValues: ["已接收", "ProductList 读取 products.map", "TypeError", "错误边界接管"],
          log: ["TypeError: Cannot read properties of undefined (reading 'map')"],
          note: "第一条业务帧指向 ProductList 的 map 调用。",
          delayMs: 760
        },
        {
          activeLane: 3,
          laneValues: ["输入已归一化", "商品卡片恢复", "Console clean", "SYSTEM RESTORED — 100% OPERATIONAL"],
          log: ["safeProducts = [] 时展示补货空态；有数据时渲染卡片。"],
          note: "修复后用预览和事故指标确认恢复。",
          delayMs: 760
        }
      ]
    },
    preview: productCardPreview("商品列表已恢复", "3 个商品卡片可见；缺数据时显示补货空态。"),
    incident: projectIncident,
    summary: ["阶段项目从控制台错误开始而不是从猜测开始", "最小修复要处理 undefined 和空列表两种状态", "恢复完成必须同时观察预览、控制台和事故指标"],
    sources: [
      {
        type: "official",
        title: "React Error Boundaries",
        url: "https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary",
        verifiedAt
      }
    ]
  }
];

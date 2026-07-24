import type { LessonKind, StageId, VisualizerSpec } from "./types";

const configuredStageVisualizers = {
  "http-foundations": { type: "http-pipeline", title: "HTTP 请求响应管线", nodes: ["Client", "Headers", "Router", "Handler", "Response"] },
  "api-design": { type: "service-boundary", title: "服务边界与可靠 API", nodes: ["Resource", "Validation", "Error Model", "Logging", "Shutdown"] },
  "process-concurrency": { type: "worker-pool", title: "进程与并发工作池", nodes: ["Main Thread", "libuv Pool", "Worker", "IPC", "Result"] },
  realtime: { type: "realtime-mesh", title: "实时连接星网", nodes: ["Client", "Handshake", "Heartbeat", "Broadcast", "Recovery"] },
  "testing-security": { type: "quality-shield", title: "测试与安全边界", nodes: ["Test", "Assertion", "Mock", "Secret Boundary", "Risk"] },
  "diagnostics-production": { type: "diagnostics-tower", title: "诊断与生产观测塔", nodes: ["Inspector", "CPU", "Heap", "GC", "Release"] },
  // Next.js stage visualizers
  "nextjs-foundations": { type: "nextjs-render-pipeline", title: "Next.js 渲染管线", nodes: ["源码", "编译", "Server Component", "HTML", "Hydration"] },
  "nextjs-routing": { type: "nextjs-routing-tree", title: "文件系统路由树", nodes: ["app/", "layout", "page", "loading", "error"] },
  "nextjs-rendering": { type: "nextjs-component-boundary", title: "Server/Client 组件边界", nodes: ["Server", "Boundary", "Client", "Hydration", "Interactive"] },
  "nextjs-data-fetching": { type: "nextjs-data-flow", title: "数据获取与缓存流", nodes: ["fetch", "Cache", "Revalidate", "Action", "State"] },
  "nextjs-styling-optimization": { type: "nextjs-build-output", title: "构建优化输出", nodes: ["CSS", "Font", "Image", "Bundle", "Score"] },
  "nextjs-api-routes": { type: "nextjs-middleware-chain", title: "API 中间件处理链", nodes: ["Request", "Middleware", "Handler", "Response", "Edge"] },
  "nextjs-auth-middleware": { type: "nextjs-middleware-chain", title: "认证中间件链", nodes: ["Request", "Auth", "Session", "Guard", "Response"] },
  "nextjs-database": { type: "nextjs-data-flow", title: "全栈数据流", nodes: ["Action", "ORM", "Query", "Transaction", "Result"] },
  "nextjs-testing-deployment": { type: "nextjs-build-output", title: "测试与部署管线", nodes: ["Test", "Build", "Deploy", "Preview", "Production"] },
  "nextjs-advanced-patterns": { type: "nextjs-render-pipeline", title: "高级渲染模式", nodes: ["Edge", "ISR", "Realtime", "i18n", "Performance"] },
  // Python stage visualizers
  "python-foundations": { type: "python-runtime-model", title: "Python 解释执行模型", nodes: ["源码", "字节码", "栈帧", "对象", "输出"] },
  "python-data-structures": { type: "python-collection-lens", title: "集合与迭代视图", nodes: ["list", "dict", "set", "iterator", "view"] },
  "python-modules-testing": { type: "python-package-tree", title: "模块与包依赖树", nodes: ["import", "site-packages", "venv", "pytest", "cov"] },
  "python-async-services": { type: "python-async-loop", title: "asyncio 事件循环", nodes: ["Task", "Loop", "Await", "IO", "Result"] },
  "python-file-batch": { type: "python-file-pipeline", title: "文件批处理流水线", nodes: ["扫描", "读取", "转换", "落盘", "验证"] },
  "python-regex-parsing": { type: "python-regex-engine", title: "正则回溯引擎", nodes: ["模式", "匹配", "捕获", "回溯", "结构"] },
  "python-http-scraping": { type: "python-http-crawl", title: "HTTP 抓取管道", nodes: ["请求", "限流", "解析", "去重", "入库"] },
  "python-cli-tools": { type: "python-cli-flow", title: "CLI 参数与配置流", nodes: ["Argv", "Parser", "Config", "Env", "Command"] },
  "python-scheduling": { type: "python-scheduler-clock", title: "调度器时钟", nodes: ["Cron", "Trigger", "Job", "Retry", "Alert"] },
  "python-ops-process": { type: "python-process-tree", title: "子进程编排树", nodes: ["Parent", "Signal", "Child", "IO", "Exit"] },
  "python-automation-pipeline": { type: "python-pipeline-tower", title: "自动化流水线塔", nodes: ["采集", "清洗", "缓存", "通知", "观测"] }
} satisfies Partial<Record<StageId, VisualizerSpec>>;

const stageVisualizers: Partial<Record<StageId, VisualizerSpec>> = configuredStageVisualizers;

function cloneVisualizer(visualizer: VisualizerSpec): VisualizerSpec {
  return { ...visualizer, nodes: [...visualizer.nodes] };
}

export function getDefaultVisualizer(stageId: StageId, kind: LessonKind): VisualizerSpec {
  if (kind === "stage-project") {
    return cloneVisualizer({ type: "stage-project-core", title: "阶段项目核心", nodes: ["需求", "实现", "运行", "验证", "总结"] });
  }

  return cloneVisualizer(stageVisualizers[stageId] ?? { type: "generic-particle-flow", title: "通用运行粒子流", nodes: ["输入", "执行", "输出"] });
}

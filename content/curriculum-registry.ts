import type { CourseDomainId, CourseId, CourseSpec, CurriculumStage, RuntimeSurface, StageId } from "../lib/curriculum/types";
import { curriculum } from "./curriculum";
import { frontendDebuggingCurriculum } from "./curriculum-frontend-debugging";
import { nextjsCurriculum } from "./curriculum-nextjs";

const defaultRuntimeSurfaces = ["console", "micro-browser", "runtime-timeline", "incident-hud"] as const;

type PlannedStageSeed = {
  id: StageId;
  number: number;
  title: string;
  summary: string;
  lessons: readonly string[];
  projectTitle: string;
};

function createPlannedStages(courseId: CourseId, seeds: readonly PlannedStageSeed[], publishedStageCount = 0) {
  return seeds.map((stage) => ({
    id: stage.id,
    number: stage.number,
    title: stage.title,
    summary: stage.summary,
    lessons: expandPlannedLessons(stage).map((title, index) => ({
      id: `${courseId}-${stage.id}-lesson-${index + 1}`,
      title,
      order: index + 1,
      kind: "knowledge",
      status: stage.number < publishedStageCount ? "published" : "planned"
    })),
    project: {
      id: `${courseId}-${stage.id}-project`,
      title: stage.projectTitle,
      order: 9,
      kind: "stage-project",
      status: stage.number < publishedStageCount ? "published" : "planned"
    }
  })) satisfies CurriculumStage[];
}

function expandPlannedLessons(stage: PlannedStageSeed): readonly string[] {
  const fallbackLessons = [
    `${stage.title}核心模型`,
    `${stage.title}运行链路`,
    `${stage.title}常见误区`,
    `${stage.title}调试路径`,
    `${stage.title}工程实践`,
    `${stage.title}可视化实验`,
    `${stage.title}综合演练`,
    `${stage.title}阶段复盘`
  ];

  return [...stage.lessons, ...fallbackLessons].slice(0, 8);
}

function createPlannedCourse(input: {
  id: CourseId;
  domainId: CourseDomainId;
  slug: string;
  title: string;
  description: string;
  icon: string;
  status?: CourseSpec["status"];
  publishedStageCount?: number;
  runtimeSurfaces: readonly RuntimeSurface[];
  stages: readonly PlannedStageSeed[];
}) {
  return {
    id: input.id,
    domainId: input.domainId,
    slug: input.slug,
    title: input.title,
    description: input.description,
    icon: input.icon,
    status: input.status ?? "planned",
    runtimeSurfaces: input.runtimeSurfaces,
    stages: createPlannedStages(input.id, input.stages, input.publishedStageCount)
  } as const satisfies CourseSpec;
}

export const courseDomains = [
  { id: "language", title: "编程语言" },
  { id: "frontend", title: "前端工程" },
  { id: "network", title: "网络协议" },
  { id: "server", title: "服务端工程" },
  { id: "android", title: "Android 系统" },
  { id: "ai-application", title: "AI 应用" },
  { id: "ai-agent", title: "AI Agent" },
  { id: "ai-math", title: "AI 数学" }
] as const satisfies readonly { id: CourseDomainId; title: string }[];

export const nodejsCourse = {
  id: "nodejs",
  domainId: "server",
  slug: "nodejs",
  title: "Node.js",
  description: "从 JavaScript 基础到生产工程，系统建立 Node.js 运行时心智模型。",
  icon: "⬢",
  status: "published",
  runtimeSurfaces: defaultRuntimeSurfaces,
  stages: curriculum
} as const satisfies CourseSpec;

export const nextjsCourse = {
  id: "nextjs",
  domainId: "frontend",
  slug: "nextjs",
  title: "Next.js",
  description: "从 App Router 到全栈部署，掌握现代 React 服务端框架。",
  icon: "▲",
  status: "published",
  runtimeSurfaces: defaultRuntimeSurfaces,
  stages: nextjsCurriculum
} as const satisfies CourseSpec;

export const frontendDebuggingCourse = {
  id: "frontend-debugging",
  domainId: "frontend",
  slug: "frontend-debugging",
  title: "前端报错调试",
  description: "从控制台、错误栈、Network 和恢复验证中训练真实前端故障定位能力。",
  icon: "⌁",
  status: "preview",
  runtimeSurfaces: defaultRuntimeSurfaces,
  stages: frontendDebuggingCurriculum
} as const satisfies CourseSpec;

export const pythonCourse = createPlannedCourse({
  id: "python",
  domainId: "language",
  slug: "python",
  title: "Python",
  description: "从语法、数据结构到自动化脚本与运维，用可视化方式掌握 Python 运行模型。",
  icon: "Py",
  status: "preview",
  publishedStageCount: 4,
  runtimeSurfaces: ["console", "memory-stack", "runtime-timeline"],
  stages: [
    {
      id: "python-foundations",
      number: 0,
      title: "语法与运行模型",
      summary: "变量、类型、函数、控制流和解释执行过程。",
      lessons: ["变量与动态类型", "函数调用栈", "条件与循环", "异常处理"],
      projectTitle: "命令行文本清洗器"
    },
    {
      id: "python-data-structures",
      number: 1,
      title: "数据结构与标准库",
      summary: "list、dict、set、迭代器和常用标准库。",
      lessons: ["list 与切片", "dict 查询与更新", "迭代器协议", "pathlib 与 json"],
      projectTitle: "日志聚合统计器"
    },
    {
      id: "python-modules-testing",
      number: 2,
      title: "模块、包与测试",
      summary: "import、虚拟环境、pytest 和可维护项目结构。",
      lessons: ["模块解析", "虚拟环境", "pytest 断言", "依赖隔离"],
      projectTitle: "可测试配置解析器"
    },
    {
      id: "python-async-services",
      number: 3,
      title: "异步与服务开发",
      summary: "asyncio、HTTP 客户端、任务调度和服务边界。",
      lessons: ["协程与事件循环", "并发请求", "超时与重试", "服务错误模型"],
      projectTitle: "异步 API 聚合器"
    },
    {
      id: "python-file-batch",
      number: 4,
      title: "文件批处理与文本自动化",
      summary: "路径遍历、编码识别、批量重命名与文本清洗流水线。",
      lessons: ["pathlib 遍历模式", "编码探测与转换", "批量重命名规则", "结构化文本清洗"],
      projectTitle: "批量文档标准化工具"
    },
    {
      id: "python-regex-parsing",
      number: 5,
      title: "正则与结构化解析",
      summary: "re 模块、命名捕获、CSV / JSON / YAML 解析与校验。",
      lessons: ["正则思维模型", "命名捕获与回溯", "CSV/JSON 双向转换", "YAML 数据校验"],
      projectTitle: "多源日志统一解析器"
    },
    {
      id: "python-http-scraping",
      number: 6,
      title: "HTTP 抓取与数据管道",
      summary: "requests/httpx、限流、重试、持久化与反爬边界。",
      lessons: ["同步与异步客户端", "限流与退避策略", "内容抽取与持久化", "反爬合规边界"],
      projectTitle: "站点抓取与增量入库脚本"
    },
    {
      id: "python-cli-tools",
      number: 7,
      title: "CLI 与配置化脚本",
      summary: "argparse/typer、配置合并、日志分级与可复用脚手架。",
      lessons: ["argparse 语义", "typer 类型驱动 CLI", "配置分层合并", "结构化日志"],
      projectTitle: "可发布的运维 CLI 工具"
    },
    {
      id: "python-scheduling",
      number: 8,
      title: "任务调度与后台运行",
      summary: "APScheduler、cron、systemd/timer 与幂等重试。",
      lessons: ["调度触发器建模", "任务幂等性", "失败重试与告警", "systemd/timer 部署"],
      projectTitle: "跨机任务调度器"
    },
    {
      id: "python-ops-process",
      number: 9,
      title: "子进程与运维编排",
      summary: "subprocess、信号处理、并发编排与安全边界。",
      lessons: ["subprocess 输入输出", "信号与超时", "并发编排策略", "凭据与最小权限"],
      projectTitle: "远程主机批量运维脚本"
    },
    {
      id: "python-automation-pipeline",
      number: 10,
      title: "端到端自动化流水线",
      summary: "数据采集→清洗→通知的完整脚本项目，覆盖打包与部署。",
      lessons: ["流水线阶段拆分", "错误恢复与断点续跑", "打包与依赖锁定", "部署与观测"],
      projectTitle: "自动化运营周报流水线"
    }
  ]
});

export const networkCourse = createPlannedCourse({
  id: "network",
  domainId: "network",
  slug: "network",
  title: "计算机网络",
  description: "从 URL 到服务响应，拆解 DNS、TCP、TLS、HTTP、缓存、跨域和实时连接。",
  icon: "NET",
  status: "preview",
  publishedStageCount: 4,
  runtimeSurfaces: ["console", "micro-browser", "network-trace", "runtime-timeline"],
  stages: [
    {
      id: "network-url-dns",
      number: 0,
      title: "URL、DNS 与连接建立",
      summary: "从输入 URL 到找到服务地址的完整链路。",
      lessons: ["URL 结构", "DNS 查询", "TCP 握手", "TLS 协商"],
      projectTitle: "页面加载链路解释器"
    },
    {
      id: "network-http-cache",
      number: 1,
      title: "HTTP 与缓存",
      summary: "方法、状态码、Headers、Cookie 和缓存协商。",
      lessons: ["HTTP 请求响应", "状态码诊断", "Headers 语义", "强缓存与协商缓存"],
      projectTitle: "缓存命中调试面板"
    },
    {
      id: "network-security-realtime",
      number: 2,
      title: "安全与实时连接",
      summary: "CORS、CSRF、Token、WebSocket 和 SSE 生命周期。",
      lessons: ["CORS 预检", "Cookie 与 SameSite", "WebSocket 连接", "SSE 重连"],
      projectTitle: "实时通知链路诊断"
    },
    {
      id: "network-gateway-debugging",
      number: 3,
      title: "代理、网关与联调故障",
      summary: "网关转发、代理配置、超时、重试和线上排障。",
      lessons: ["反向代理", "网关超时", "重试风暴", "链路追踪"],
      projectTitle: "API 网关故障复盘"
    }
  ]
});

export const serverEngineeringCourse = createPlannedCourse({
  id: "server-engineering",
  domainId: "server",
  slug: "server-engineering",
  title: "服务端工程",
  description: "覆盖 API、数据库、缓存、队列、可观测性和生产事故处理。",
  icon: "SRV",
  status: "preview",
  publishedStageCount: 4,
  runtimeSurfaces: ["console", "micro-browser", "runtime-timeline", "incident-hud"],
  stages: [
    {
      id: "server-api-design",
      number: 0,
      title: "API 设计与错误模型",
      summary: "REST/RPC、输入校验、幂等性和统一错误结构。",
      lessons: ["资源建模", "输入校验", "错误码设计", "幂等请求"],
      projectTitle: "任务 API 设计复盘"
    },
    {
      id: "server-database-cache",
      number: 1,
      title: "数据库、事务与缓存",
      summary: "索引、事务、连接池、缓存一致性和迁移。",
      lessons: ["索引选择", "事务边界", "连接池", "缓存失效"],
      projectTitle: "库存缓存一致性修复"
    },
    {
      id: "server-queue-observability",
      number: 2,
      title: "队列与可观测性",
      summary: "后台任务、消息队列、日志、指标和 Trace Span。",
      lessons: ["消息投递", "死信队列", "结构化日志", "Trace Span"],
      projectTitle: "订单任务追踪器"
    },
    {
      id: "server-production-incidents",
      number: 3,
      title: "生产事故工程",
      summary: "限流、超时、降级、告警和事故复盘。",
      lessons: ["限流保护", "超时预算", "服务降级", "事故复盘"],
      projectTitle: "生产延迟事故恢复"
    }
  ]
});

export const androidCourse = createPlannedCourse({
  id: "android",
  domainId: "android",
  slug: "android",
  title: "Android 系统",
  description: "从 App 生命周期到 Framework、Binder、Native 与 HAL 调用链。",
  icon: "AND",
  status: "preview",
  publishedStageCount: 4,
  runtimeSurfaces: ["console", "memory-stack", "android-system-trace", "runtime-timeline"],
  stages: [
    {
      id: "android-app-foundations",
      number: 0,
      title: "App 基础与生命周期",
      summary: "Activity、Fragment、资源、权限和 Manifest。",
      lessons: ["Activity 生命周期", "资源系统", "权限声明", "Manifest 解析"],
      projectTitle: "启动流程诊断器"
    },
    {
      id: "android-jetpack-compose",
      number: 1,
      title: "Jetpack 与 Compose",
      summary: "ViewModel、State、Compose 重组和导航。",
      lessons: ["ViewModel 边界", "State 提升", "Compose 重组", "Navigation"],
      projectTitle: "状态错乱修复任务"
    },
    {
      id: "android-framework-binder",
      number: 2,
      title: "Framework 与 Binder",
      summary: "AMS、WMS、PMS、System Service 与 Binder IPC。",
      lessons: ["System Service", "Binder 调用", "AMS 启动链", "PMS 查询"],
      projectTitle: "跨进程调用链追踪"
    },
    {
      id: "android-performance-native",
      number: 3,
      title: "性能、JNI 与 Native",
      summary: "ANR、内存泄漏、启动优化、JNI 与 HAL。",
      lessons: ["ANR 现场", "内存泄漏", "JNI 边界", "HAL 调用"],
      projectTitle: "卡顿事故复盘"
    }
  ]
});

export const aiApplicationCourse = createPlannedCourse({
  id: "ai-application",
  domainId: "ai-application",
  slug: "ai-application",
  title: "AI 应用开发",
  description: "学习 Prompt、RAG、工具调用、多模态、评测和安全边界。",
  icon: "AI",
  status: "preview",
  publishedStageCount: 4,
  runtimeSurfaces: ["console", "agent-trace", "runtime-timeline"],
  stages: [
    {
      id: "ai-app-prompt-rag",
      number: 0,
      title: "Prompt 与 RAG",
      summary: "提示词结构、检索、召回、重排和上下文组装。",
      lessons: ["Prompt 结构", "文档切分", "召回与重排", "上下文预算"],
      projectTitle: "知识库问答诊断"
    },
    {
      id: "ai-app-tools-workflows",
      number: 1,
      title: "工具调用与工作流",
      summary: "Function Calling、参数构造、工具结果和工作流编排。",
      lessons: ["工具 Schema", "参数校验", "结果解析", "工作流节点"],
      projectTitle: "工具调用排障台"
    },
    {
      id: "ai-app-multimodal-eval",
      number: 2,
      title: "多模态与评测",
      summary: "图文输入、结构化输出、样本集和回归评测。",
      lessons: ["图像输入", "结构化输出", "评测样本", "回归对比"],
      projectTitle: "多模态结果评测"
    },
    {
      id: "ai-app-safety-production",
      number: 3,
      title: "安全与生产化",
      summary: "幻觉控制、权限、审计、成本和生产监控。",
      lessons: ["幻觉边界", "权限控制", "成本预算", "生产监控"],
      projectTitle: "AI 应用安全复盘"
    }
  ]
});

export const aiAgentCourse = createPlannedCourse({
  id: "ai-agent",
  domainId: "ai-agent",
  slug: "ai-agent",
  title: "AI Agent",
  description: "掌握 Observe、Plan、Act、Reflect、Memory、Tool Use 和多 Agent 协作。",
  icon: "AGT",
  status: "preview",
  publishedStageCount: 4,
  runtimeSurfaces: ["console", "agent-trace", "runtime-timeline"],
  stages: [
    {
      id: "ai-agent-loop-planning",
      number: 0,
      title: "观察-计划-行动循环",
      summary: "Observe、Think、Act、Reflect 的基本闭环。",
      lessons: ["观察建模", "任务计划", "行动执行", "反思修正"],
      projectTitle: "Agent Trace 复盘"
    },
    {
      id: "ai-agent-memory-tools",
      number: 1,
      title: "记忆与工具使用",
      summary: "短期记忆、长期记忆、检索记忆和工具选择。",
      lessons: ["短期记忆", "长期记忆", "工具选择", "参数构造"],
      projectTitle: "记忆命中调试"
    },
    {
      id: "ai-agent-multi-agent",
      number: 2,
      title: "多 Agent 协作",
      summary: "Planner、Executor、Reviewer 的分工与冲突解决。",
      lessons: ["角色分工", "任务树", "消息协议", "冲突解决"],
      projectTitle: "多 Agent 协作复盘"
    },
    {
      id: "ai-agent-failure-recovery",
      number: 3,
      title: "失败恢复与安全边界",
      summary: "工具失败、权限拒绝、上下文压缩和恢复策略。",
      lessons: ["工具失败", "权限拒绝", "上下文压缩", "恢复策略"],
      projectTitle: "失败恢复演练"
    }
  ]
});

export const aiMathCourse = createPlannedCourse({
  id: "ai-math",
  domainId: "ai-math",
  slug: "ai-math",
  title: "AI 数学基础",
  description: "用图形和实验理解线性代数、概率、微积分、优化与 Transformer 数学。",
  icon: "Σ",
  status: "preview",
  publishedStageCount: 4,
  runtimeSurfaces: ["console", "math-graph-lab", "transformer-visualizer", "runtime-timeline"],
  stages: [
    {
      id: "ai-math-linear-algebra",
      number: 0,
      title: "线性代数与向量空间",
      summary: "向量、矩阵、线性变换和特征值。",
      lessons: ["向量表示", "矩阵乘法", "线性变换", "特征向量"],
      projectTitle: "二维变换实验室"
    },
    {
      id: "ai-math-probability-calculus",
      number: 1,
      title: "概率统计与微积分",
      summary: "分布、期望、方差、导数和链式法则。",
      lessons: ["概率分布", "期望方差", "导数直觉", "链式法则"],
      projectTitle: "损失曲线解释器"
    },
    {
      id: "ai-math-optimization",
      number: 2,
      title: "优化方法",
      summary: "损失函数、梯度下降、学习率和正则化。",
      lessons: ["损失函数", "梯度下降", "学习率", "正则化"],
      projectTitle: "梯度下降可视化"
    },
    {
      id: "ai-math-transformer",
      number: 3,
      title: "Transformer 数学",
      summary: "Embedding、Attention、Softmax 和位置编码。",
      lessons: ["Embedding", "Attention 权重", "Softmax", "位置编码"],
      projectTitle: "Attention 热力图实验"
    }
  ]
});

export const allCourses = [
  nodejsCourse,
  nextjsCourse,
  frontendDebuggingCourse,
  pythonCourse,
  networkCourse,
  serverEngineeringCourse,
  androidCourse,
  aiApplicationCourse,
  aiAgentCourse,
  aiMathCourse
] as const satisfies readonly CourseSpec[];

export function getCourse(courseId: CourseId): CourseSpec {
  const course = allCourses.find((item) => item.id === courseId);

  if (!course) {
    throw new Error(`未知课程：${courseId}`);
  }

  return course;
}

export function getCoursesByDomain(domainId: CourseDomainId): CourseSpec[] {
  return allCourses.filter((course) => course.domainId === domainId);
}

export function getCourseBySlug(slug: string): CourseSpec | undefined {
  return allCourses.find((course) => course.slug === slug);
}
